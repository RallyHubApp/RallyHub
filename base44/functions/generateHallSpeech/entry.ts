import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';
const MODEL = 'gpt-4o-mini-tts';
const VOICE = 'marin';
const MAX_TEXT = 500;
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

function validTournamentEventGrant(a:any, tenantId:string) {
  if (!a || a.status !== 'active' || String(a.tenant_id || '') !== String(tenantId || '')) return false;
  const now = Date.now();
  if (a.starts_at && Date.parse(a.starts_at) > now) return false;
  if (a.ends_at && Date.parse(a.ends_at) < now) return false;
  return true;
}

function validClubChallengeGrant(a:any, tenantId:string) {
  return !!a && a.active === true && String(a.tenant_id || '') === String(tenantId || '');
}

function toBase64(bytes:Uint8Array) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });

    const body = await req.json().catch(() => ({}));
    const text = String(body?.text || '').trim();
    const eventId = String(body?.eventId || '').trim();

    if (!text) return Response.json({ error:'Announcement text is required.' }, { status:400 });
    if (text.length > MAX_TEXT) return Response.json({ error:`Announcement is too long. Maximum ${MAX_TEXT} characters.` }, { status:400 });

    let allowed = user.role === 'admin';
    if (!allowed && eventId) {
      const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
      const event = events?.[0];
      if (event) {
        const tournamentAccess = (await base44.asServiceRole.entities.TournamentUserAccess.filter({
          tournament_id:event.tournament_id,
          user_id:user.id,
          status:'active',
        })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
        const ccAccess = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({
          challenge_event_id:event.id,
          user_id:user.id,
          active:true,
        })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
        allowed = tournamentAccess.some((a:any) => ['event_manager','event_host'].includes(a.role))
          || ccAccess.some((a:any) => ['owner','organiser'].includes(a.role));
      }
    }
    if (!allowed) return Response.json({ error:'Event manager permission required.' }, { status:403 });

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return Response.json({
        error:'Amplified hall voice is not configured yet.',
        code:'TTS_NOT_CONFIGURED',
      }, { status:503 });
    }

    const response = await fetch(OPENAI_TTS_URL, {
      method:'POST',
      headers:{
        'Authorization':`Bearer ${apiKey}`,
        'Content-Type':'application/json',
      },
      body:JSON.stringify({
        model:MODEL,
        voice:VOICE,
        input:text,
        response_format:'wav',
        instructions:'Speak as a warm, clear Irish English sports venue announcer with a feminine presentation. Project confidently across a busy indoor sports hall. Use crisp consonants, natural energy, and a measured pace. Do not shout, whisper, sing, or add music.',
      }),
    });

    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 500);
      console.error('Hall TTS provider error', response.status, detail);
      return Response.json({
        error:'The amplified hall voice service could not generate this announcement.',
        code:'TTS_PROVIDER_ERROR',
      }, { status:502 });
    }

    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength || buffer.byteLength > MAX_AUDIO_BYTES) {
      return Response.json({
        error:'Generated hall audio was empty or too large.',
        code:'TTS_AUDIO_INVALID',
      }, { status:502 });
    }

    return Response.json({
      audio_base64:toBase64(new Uint8Array(buffer)),
      mime_type:'audio/wav',
      provider:'openai',
      model:MODEL,
      voice:VOICE,
      ai_generated:true,
    });
  } catch (error) {
    console.error('generateHallSpeech failed', error);
    return Response.json({ error:'Could not generate amplified hall speech.' }, { status:500 });
  }
});
