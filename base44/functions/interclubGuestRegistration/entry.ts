import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

const WAIVER_VERSION = 'interclub-event-waiver-v1-2026-09';
const CODE_VERSION = 'interclub-code-of-conduct-v1-2026-09';
const PRIVACY_VERSION = 'interclub-event-privacy-v1-2026-09';

function clean(value:any, max=200) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}
function emailKey(value:any) { return clean(value, 200).toLowerCase(); }
function mobileKey(value:any) { return clean(value, 50).replace(/[^0-9]/g, ''); }
function normalName(value:any) { return clean(value, 120).toLowerCase(); }
function validToken(value:string) { return /^ccr_[0-9a-f]{32}$/i.test(value); }

function legalText(event:any) {
  const eventName = `${event.club_a_name || 'Team A'} v ${event.club_b_name || 'Team B'}`;
  return {
    waiverVersion:WAIVER_VERSION,
    waiverTitle:'RallyHub Interclub Event Waiver & Release of Liability',
    waiverText:`I acknowledge and understand that participation in ${eventName} involves physical activity and carries inherent risks of injury.

I am voluntarily participating in this RallyHub Interclub event and I am aware of the potential risks and dangers involved, including but not limited to accidents, collisions, falls and equipment-related injuries.

I understand that the event organisers, volunteers, participating clubs and facility owners are not responsible for injuries, accidents or damages that may occur during the event.

I release and discharge the event host, participating clubs, their officers, organisers, volunteers and affiliated parties from liability, claims, demands, actions or causes of action arising from injuries, damages or losses sustained by me during the event, except where liability cannot lawfully be excluded.

I agree to follow all safety guidelines, rules and instructions provided by the event organisers and to maintain proper sportsmanship and conduct.

I consent to emergency medical treatment or care if necessary and understand that I am responsible for any costs associated with such treatment.`,
    codeVersion:CODE_VERSION,
    codeTitle:'RallyHub Interclub Code of Conduct',
    codeText:`RallyHub Interclub events are intended to be welcoming, inclusive and respectful.

Respect and inclusivity
• Treat all players, officials, volunteers and spectators with respect and kindness.
• Do not use discriminatory language or behaviour.
• Welcome and encourage players of different skill levels and backgrounds.

Good sportsmanship
• Play fairly and with integrity.
• Celebrate good play and encourage others.
• Do not use aggressive, intimidating or deliberately dangerous play.

Conflict resolution
• Handle disagreements calmly and respectfully.
• Do not argue or raise voices during games.
• Ask an event organiser or official for help if a disagreement cannot be resolved.

Safety first
• Prioritise the safety of everyone on and around the courts.
• Call “Ball!” clearly when a stray ball enters another court and stop play until it is safe.
• Respect court rotation, equipment and venue instructions.

Positive communication
• Use constructive and encouraging language.
• Do not mock, taunt or belittle another player.
• Respect line calls and organiser decisions.

Participation and team spirit
• Be punctual and ready to play.
• Follow the event format, pairings, rotations and scoring instructions.
• Contribute to a friendly and enjoyable event.

By participating in the event, you agree to uphold this Code of Conduct.`,
    privacyVersion:PRIVACY_VERSION,
    privacyText:'Your details will be used only to administer this Interclub event, including roster management, event communications and emergency/safety administration. Completing this form does not make you a member of the host club and your details will not be used for club membership marketing.',
  };
}

Deno.serve(async (req) => {
  try {
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > 20000) return Response.json({ error:'Request too large.' }, { status:413 });

    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const tokenValue = clean(body.token, 80);
    const action = clean(body.action || 'get', 20).toLowerCase();

    if (!validToken(tokenValue)) return Response.json({ error:'Registration link is invalid or inactive.' }, { status:404 });
    const tokenRows = await base44.asServiceRole.entities.InterclubRegistrationToken.filter({ token:tokenValue, active:true }, '-created_at', 5);
    const link = tokenRows?.[0];
    if (!link) return Response.json({ error:'Registration link is invalid or inactive.' }, { status:404 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:link.challenge_event_id });
    const event = events?.[0];
    if (!event || !['draft','draw_generated'].includes(event.status)) {
      return Response.json({ error:'Registration is closed for this Interclub event.' }, { status:409 });
    }

    const tournaments = await base44.asServiceRole.entities.Tournament.filter({ id:event.tournament_id });
    const tournament = tournaments?.[0] || null;
    const clubs = event.host_club_id
      ? await base44.asServiceRole.entities.Club.filter({ id:event.host_club_id })
      : [];
    const hostClub = clubs?.[0] || null;
    const sideTeamName = link.side === 'club_a' ? event.club_a_name : event.club_b_name;
    const legal = legalText(event);

    const safeEvent = {
      id:event.id,
      teamName:sideTeamName,
      side:link.side,
      clubAName:event.club_a_name,
      clubBName:event.club_b_name,
      clubALogo:event.club_a_logo_url || '',
      clubBLogo:event.club_b_logo_url || '',
      clubAPrimary:event.club_a_primary_colour || '',
      clubBPrimary:event.club_b_primary_colour || '',
      eventName:`${event.club_a_name} v ${event.club_b_name}`,
      date:tournament?.start_date || '',
      venue:tournament?.location || '',
      hostClubName:hostClub?.name || event.club_a_name || '',
    };

    if (action === 'get') {
      return Response.json({ success:true, event:safeEvent, legal });
    }
    if (action !== 'submit') return Response.json({ error:'Invalid registration action.' }, { status:400 });

    const fullName = clean(body.fullName, 120);
    const email = emailKey(body.email);
    const mobile = clean(body.mobile, 50);
    const mobileK = mobileKey(mobile);
    const gender = clean(body.gender, 40);
    const emergencyName = clean(body.emergencyContactName, 120);
    const emergencyMobile = clean(body.emergencyContactMobile, 50);
    const medicalNote = clean(body.medicalNote, 1200);
    const photoVideoConsent = clean(body.photoVideoConsent, 10).toLowerCase();

    if (!fullName || fullName.split(' ').length < 2) return Response.json({ error:'Please enter your full name.' }, { status:400 });
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error:'Please enter a valid email address.' }, { status:400 });
    if (mobileK.length < 8) return Response.json({ error:'Please enter a valid mobile number.' }, { status:400 });
    if (!['Male','Female','Non-binary','Prefer not to say'].includes(gender)) return Response.json({ error:'Please select your gender.' }, { status:400 });
    if (!emergencyName || mobileKey(emergencyMobile).length < 8) return Response.json({ error:'Please provide an emergency contact name and mobile number.' }, { status:400 });
    if (body.waiverAccepted !== true || body.codeAccepted !== true || body.privacyAcknowledged !== true) {
      return Response.json({ error:'The event waiver, Code of Conduct and privacy notice must be accepted to register.' }, { status:400 });
    }
    if (!['yes','no'].includes(photoVideoConsent)) return Response.json({ error:'Please choose Yes or No for photo/video consent.' }, { status:400 });

    const duplicate = await base44.asServiceRole.entities.InterclubGuestRegistration.filter({
      challenge_event_id:event.id,
      email_key:email,
      status:'active',
    }, '-registered_at', 5);
    if (duplicate?.[0]) {
      return Response.json({
        success:true,
        alreadyRegistered:true,
        event:safeEvent,
        participantId:duplicate[0].participant_id || null,
        message:`You're already registered for ${safeEvent.eventName}.`,
      });
    }

    let person:any = null;
    const byEmail = await base44.asServiceRole.entities.Person.filter({ tenant_id:event.tenant_id, primary_email:email }, '-updated_date', 10);
    person = byEmail?.[0] || null;
    if (!person && mobileK) {
      const byMobile = await base44.asServiceRole.entities.Person.filter({ tenant_id:event.tenant_id, mobile }, '-updated_date', 10);
      person = byMobile?.[0] || null;
    }

    const personData:any = {
      full_name:fullName,
      primary_email:email,
      mobile,
      gender,
      emergency_contact_name:emergencyName,
      emergency_mobile:emergencyMobile,
      source_system:'interclub_guest_registration',
      last_synced_at:new Date().toISOString(),
      profile_visibility:'private',
    };
    if (person) person = await base44.asServiceRole.entities.Person.update(person.id, personData);
    else person = await base44.asServiceRole.entities.Person.create({ tenant_id:event.tenant_id, ...personData });

    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 200);
    const sameName = participants.find((p:any) =>
      p.side === link.side &&
      ['active','late'].includes(p.status) &&
      normalName(p.display_name) === normalName(fullName)
    );
    if (sameName?.registration_id) {
      return Response.json({ error:'A registered player with this name is already on the team. Please contact the organiser if this is you.' }, { status:409 });
    }

    const tournamentClubs = await base44.asServiceRole.entities.TournamentClub.filter({ tournament_id:event.tournament_id }, 'side', 20);
    const sideCode = link.side === 'club_a' ? 'A' : 'B';
    const tournamentClub = tournamentClubs.find((row:any) => String(row.side || '').toUpperCase() === sideCode) || null;
    const participantType = tournamentClub?.source_type === 'rallyhub_club' ? 'guest' : 'external_club_player';
    const representedClubId = tournamentClub?.club_id || '';
    const sidePlayers = participants.filter((p:any) => p.side === link.side && !['replaced','withdrawn','injured'].includes(p.status));
    const now = new Date().toISOString();

    let participant:any = sameName || null;
    if (!participant) {
      participant = await base44.asServiceRole.entities.ClubChallengeParticipant.create({
        tenant_id:event.tenant_id,
        challenge_event_id:event.id,
        tournament_id:event.tournament_id,
        side:link.side,
        source_person_id:person.id,
        display_name:fullName,
        participant_type:participantType,
        represented_club_id:representedClubId || undefined,
        represented_club_name:sideTeamName,
        email,
        gender,
        event_rank:sidePlayers.length + 1,
        roster_role:'rotation',
        status:'active',
        available_from_round:1,
        unique_identity_key:`person-${person.id}`,
      });
    } else {
      participant = await base44.asServiceRole.entities.ClubChallengeParticipant.update(participant.id, {
        source_person_id:person.id,
        participant_type:participantType,
        represented_club_id:representedClubId || participant.represented_club_id || undefined,
        represented_club_name:sideTeamName,
        email,
        gender,
        unique_identity_key:participant.unique_identity_key || `person-${person.id}`,
      });
    }

    const registration = await base44.asServiceRole.entities.InterclubGuestRegistration.create({
      tenant_id:event.tenant_id,
      challenge_event_id:event.id,
      tournament_id:event.tournament_id,
      side:link.side,
      participant_id:participant.id,
      person_id:person.id,
      full_name:fullName,
      email,
      email_key:email,
      mobile,
      mobile_key:mobileK,
      gender,
      emergency_contact_name:emergencyName,
      emergency_contact_mobile:emergencyMobile,
      medical_note:medicalNote,
      waiver_version:WAIVER_VERSION,
      waiver_accepted:true,
      code_of_conduct_version:CODE_VERSION,
      code_of_conduct_accepted:true,
      privacy_notice_version:PRIVACY_VERSION,
      privacy_acknowledged:true,
      photo_video_consent:photoVideoConsent,
      registered_at:now,
      status:'active',
    });

    await base44.asServiceRole.entities.ClubChallengeParticipant.update(participant.id, {
      registration_id:registration.id,
      source_person_id:person.id,
    });

    const hostClubId = event.host_club_id || tournament?.host_club_id || '';
    if (hostClubId) {
      const consents = [
        { consent_type:'interclub_event_waiver', status:'accepted', response_text:'Accepted', consent_version:WAIVER_VERSION },
        { consent_type:'interclub_code_of_conduct', status:'accepted', response_text:'Accepted', consent_version:CODE_VERSION },
        { consent_type:'interclub_event_privacy_notice', status:'accepted', response_text:'Acknowledged', consent_version:PRIVACY_VERSION },
        { consent_type:'interclub_photo_video', status:photoVideoConsent === 'yes' ? 'accepted' : 'declined', response_text:photoVideoConsent === 'yes' ? 'Yes' : 'No', consent_version:PRIVACY_VERSION },
      ];
      for (const c of consents) {
        await base44.asServiceRole.entities.ConsentRecord.create({
          tenant_id:event.tenant_id,
          club_id:hostClubId,
          person_id:person.id,
          ...c,
          recorded_at:now,
          source_system:'interclub_guest_registration',
          source_row:registration.id,
          notes:`${safeEvent.eventName} · ${sideTeamName}`,
        });
      }
    }

    await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
      fairness_json:'',
      status:event.status === 'draw_generated' ? 'draft' : event.status,
      event_pack_stale:true,
    });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id,
      challenge_event_id:event.id,
      action:'guest_player_self_registered',
      occurred_at:now,
      new_value_json:JSON.stringify({
        participant_id:participant.id,
        person_id:person.id,
        registration_id:registration.id,
        side:link.side,
        team_name:sideTeamName,
      }),
      note:`${fullName} completed the Interclub guest registration and compliance form.`,
    });

    return Response.json({
      success:true,
      alreadyRegistered:false,
      event:safeEvent,
      participantId:participant.id,
      message:`Registration complete. You're registered with ${sideTeamName} for ${safeEvent.eventName}.`,
    });
  } catch (error) {
    console.error('interclubGuestRegistration failed', error?.message || error);
    return Response.json({ error:'Unable to complete registration right now. Please try again or contact the event organiser.' }, { status:500 });
  }
});
