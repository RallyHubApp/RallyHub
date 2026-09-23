import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function won(a:number,b:number,target:number,winBy:number) {
  const high=Math.max(a,b), low=Math.min(a,b);
  if (high < target) return false;
  if (winBy === 1) return high >= target && high-low >= 1;
  return high-low >= 2;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { token, action, expectedRevision } = body;
    if (!token || !['inc_a','dec_a','inc_b','dec_b'].includes(action)) return Response.json({ error:'Valid scorer token and action required.' }, { status:400 });

    const rows = await base44.asServiceRole.entities.ClubChallengeShowcaseScoreToken.filter({ token, active:true }, '-created_at', 5);
    const access = rows?.[0];
    if (!access) return Response.json({ error:'Showcase scorer link is invalid or inactive.' }, { status:404 });
    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ id:access.match_id });
    const match = matches?.[0];
    if (!match || !match.is_showcase) return Response.json({ error:'Showcase Final not found.' }, { status:404 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:access.challenge_event_id });
    const event = events?.[0];
    if (!event || ['completed','archived'].includes(event.status)) return Response.json({ error:'This Interclub event is finalised.' }, { status:409 });

    const currentRevision=Number(match.revision || 0);
    if (Number(expectedRevision) !== currentRevision) return Response.json({ conflict:true, error:'Score changed on another device. Refreshing now.' }, { status:409 });

    let a=Number(match.score_a || 0), b=Number(match.score_b || 0);
    if (match.status === 'completed' && (action === 'inc_a' || action === 'inc_b')) return Response.json({ error:'Showcase Final is complete. Use minus to correct the last score before finalising.' }, { status:409 });
    if (action==='inc_a') a+=1;
    if (action==='dec_a') a=Math.max(0,a-1);
    if (action==='inc_b') b+=1;
    if (action==='dec_b') b=Math.max(0,b-1);

    const target=Number(match.showcase_target_points || 11), winBy=Number(match.showcase_win_by || 1);
    if (![11,15].includes(target) || ![1,2].includes(winBy)) return Response.json({ error:'Invalid Showcase Final format.' }, { status:409 });

    const finished=won(a,b,target,winBy);
    const winner=finished ? (a>b?'club_a':'club_b') : 'none';
    const threshold=target===15?8:6;
    const oldMax=Math.max(Number(match.score_a || 0),Number(match.score_b || 0));
    const newMax=Math.max(a,b);
    const sideChange=!match.side_change_announced && oldMax<threshold && newMax>=threshold;
    const now=new Date().toISOString();

    const updated=await base44.asServiceRole.entities.ClubChallengeMatch.update(match.id,{
      score_a:a, score_b:b, winner,
      status:finished?'completed':'in_progress',
      revision:currentRevision+1,
      ...(sideChange?{side_change_announced:true,side_change_at:now}:{}),
      ...(finished?{scored_at:now}:{})
    });

    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:match.tenant_id, challenge_event_id:match.challenge_event_id, match_id:match.id,
      action:'showcase_live_score', user_id:'showcase_scorer_link', occurred_at:now,
      old_value_json:JSON.stringify({score_a:match.score_a||0,score_b:match.score_b||0,revision:currentRevision}),
      new_value_json:JSON.stringify({score_a:a,score_b:b,revision:currentRevision+1,status:updated.status}),
      note:sideChange?'Change ends threshold reached.':undefined
    });

    return Response.json({
      success:true, sideChange, threshold, finished,
      match:{ id:updated.id, score_a:updated.score_a, score_b:updated.score_b, status:updated.status, winner:updated.winner, revision:updated.revision, side_change_at:updated.side_change_at || null }
    });
  } catch (error) {
    return Response.json({ error:error?.message || 'Could not update Showcase score' }, { status:500 });
  }
});