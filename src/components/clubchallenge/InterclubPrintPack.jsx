import React from 'react';

const RALLYHUB_LOGO_URL = '/assets/rallyhub-logo-approved.webp';
const NAVY = '#0b2e59';
const BLUE = '#07558d';
const GREEN = '#0b914a';
const COPYRIGHT = '© 2026 RallyHub. All rights reserved.';

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function fmtDate(value) {
  if (!value) return '________________';
  try {
    return new Date(value + (String(value).length === 10 ? 'T12:00:00' : '')).toLocaleDateString('en-IE', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return String(value);
  }
}

function shortGender(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v.startsWith('f')) return 'F';
  if (v.startsWith('m')) return 'M';
  return '';
}

function RallyHubBrand({ small=false }) {
  return <div className={small ? 'rhpp-brand rhpp-brand-small' : 'rhpp-brand'}>
    <img src={RALLYHUB_LOGO_URL} alt="RallyHub · Play Connect Belong" />
  </div>;
}

function ScriptTagline() {
  return <div className="rhpp-script-tag">Play<br/>Connect<br/>Belong<span /></div>;
}

function StandardHeader({ event, tournament, title, schedule=false }) {
  return <header className={schedule ? 'rhpp-header rhpp-header-schedule' : 'rhpp-header'}>
    <RallyHubBrand />
    <div className="rhpp-heading">
      <div className="rhpp-kicker">INTERCLUB</div>
      <h1>{event.club_a_name} vs {event.club_b_name}</h1>
      <h2>{title}</h2>
      <p>{tournament?.location || 'Venue: __________________'} <span>│</span> Date: {fmtDate(tournament?.start_date)}</p>
    </div>
    {!schedule && <ScriptTagline />}
  </header>;
}

function ScoreHeader({ event, tournament }) {
  const team = (name, logo, sideClass) => <div className={'rhpp-score-team '+sideClass}>
    {logo && <img src={logo} alt="" />}
    <strong>{name}</strong>
  </div>;
  return <header className="rhpp-score-header">
    {team(event.club_a_name, event.club_a_logo_url, 'rhpp-score-team-a')}
    <div className="rhpp-score-heading">
      <RallyHubBrand small />
      <div className="rhpp-kicker">INTERCLUB</div>
      <h1>{event.club_a_name} vs {event.club_b_name}</h1>
      <h2>Master Score Sheet</h2>
      <p>{tournament?.location || 'Venue: __________________'} <span>│</span> Date: {fmtDate(tournament?.start_date)}</p>
    </div>
    {team(event.club_b_name, event.club_b_logo_url, 'rhpp-score-team-b')}
  </header>;
}

function Footer({ sourceNote='' }) {
  return <footer className="rhpp-footer">
    <svg className="rhpp-wave" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,34 C185,2 340,53 515,38 C700,20 835,8 1000,18" fill="none" stroke="#0b67b2" strokeWidth="5"/>
    </svg>
    <div className="rhpp-footer-row">
      {sourceNote ? <span className="rhpp-footer-source">{sourceNote}</span> : <RallyHubBrand small />}
      <span className="rhpp-footer-copy">Powered by <strong>Rally<span>Hub</span></strong> <i>│</i> {COPYRIGHT}</span>
    </div>
  </footer>;
}

function Page({ children, className='' }) {
  return <section className={'rhpp-page '+className}>{children}</section>;
}

function fixtureFor(matches, round, court) {
  return matches.find(m => Number(m.round_number) === Number(round) && Number(m.court_number) === Number(court));
}

function PairNames({ names=[] }) {
  return <>{names.join(' & ') || '—'}</>;
}

function MasterScorePage({ event, tournament, matches, rounds, courts }) {
  return <Page className="rhpp-score-page">
    <ScoreHeader event={event} tournament={tournament} />
    <table className="rhpp-score-table">
      <thead><tr><th className="rhpp-round-col">Round</th>{courts.map(c => <th key={c}>Court {c}</th>)}</tr></thead>
      <tbody>
        {rounds.map(round => <tr key={round}>
          <td className="rhpp-round-number">{round}</td>
          {courts.map(court => {
            const m = fixtureFor(matches, round, court);
            return <td key={court} className="rhpp-score-cell">
              {m ? <>
                <div className="rhpp-score-name"><PairNames names={m.club_a_names || []}/></div>
                <div className="rhpp-score-boxes"><span /><b>v</b><span /></div>
                <div className="rhpp-score-name"><PairNames names={m.club_b_names || []}/></div>
              </> : <div className="rhpp-empty">No match</div>}
            </td>;
          })}
        </tr>)}
      </tbody>
    </table>
    <div className="rhpp-score-bottom">
      <div className="rhpp-notes-box"><strong>Notes</strong><i/><i/><i/><i/></div>
      <div className="rhpp-reminders">
        <strong>Quick Reminders</strong>
        <ul><li>Write the score here first if the desk is busy</li><li>Enter it in RallyHub as soon as practical</li><li>Keep this sheet as the paper backup</li></ul>
      </div>
    </div>
    <Footer />
  </Page>;
}

function participantAvailableInRound(p, round, lastScheduledById) {
  if ((p.roster_role || 'rotation') === 'reserve' && !p.reserve_activated) return false;
  const from = Number(p.available_from_round || p.replacement_effective_round || 1);
  if (round < from) return false;
  if (['withdrawn','injured','replaced'].includes(p.status)) {
    const last = Number(lastScheduledById[p.id] || 0);
    return last > 0 && round <= last;
  }
  return true;
}

function RoundSchedule({ event, matches, participants, round, courts, lastScheduledById }) {
  const roundMatches = matches.filter(m => Number(m.round_number) === round);
  const activeIds = new Set(roundMatches.flatMap(m => [...(m.club_a_participant_ids || []), ...(m.club_b_participant_ids || [])]));
  const resting = participants.filter(p => ['club_a','club_b'].includes(p.side) && participantAvailableInRound(p, round, lastScheduledById) && !activeIds.has(p.id));
  const restingA = resting.filter(p => p.side === 'club_a').sort((a,b)=>Number(a.event_rank||999)-Number(b.event_rank||999));
  const restingB = resting.filter(p => p.side === 'club_b').sort((a,b)=>Number(a.event_rank||999)-Number(b.event_rank||999));
  const restRows = Math.max(restingA.length, restingB.length, 1);

  return <div className="rhpp-round-block">
    <div className="rhpp-round-band">Round {round}</div>
    <div className="rhpp-court-grid">
      {courts.map(court => {
        const m = fixtureFor(roundMatches, round, court);
        return <div className="rhpp-court-card" key={court}>
          <div className="rhpp-court-head">Court {court}</div>
          {m ? <div className="rhpp-court-body">
            <div><PairNames names={m.club_a_names || []}/></div>
            <em>vs</em>
            <div><PairNames names={m.club_b_names || []}/></div>
          </div> : <div className="rhpp-court-body rhpp-empty">No match scheduled</div>}
        </div>;
      })}
    </div>
    <div className="rhpp-rest-wrap">
      <div className="rhpp-rest-title">Resting this round</div>
      <div className="rhpp-rest-heads"><strong>{event.club_a_name}</strong><strong>{event.club_b_name}</strong></div>
      {Array.from({length:restRows},(_,i)=><div className="rhpp-rest-row" key={i}>
        <span>{restingA[i]?.display_name || ''}</span>
        <span>{restingB[i]?.display_name || ''}</span>
      </div>)}
    </div>
    {event.include_break && Number(event.break_after_round) === round && <div className="rhpp-break">{event.break_minutes}-minute break after Round {round}</div>}
  </div>;
}

function MasterSchedulePage({ event, tournament, matches, participants, rounds, lastScheduledById, pageIndex, totalPages }) {
  const courts = Array.from({length:Number(event.courts || 4)},(_,i)=>i+1);
  return <Page className="rhpp-schedule-page">
    <StandardHeader event={event} tournament={tournament} title="Master Schedule / Court Assignment" schedule />
    <div className="rhpp-schedule-stack">
      {rounds.map(round => <RoundSchedule key={round} event={event} matches={matches} participants={participants} round={round} courts={courts} lastScheduledById={lastScheduledById} />)}
    </div>
    <div className="rhpp-page-number">Rounds {rounds[0]}–{rounds[rounds.length-1]} · Page {pageIndex+1} of {totalPages}</div>
    <Footer sourceNote="Auto-populated from RallyHub draw and round schedule." />
  </Page>;
}

function RosterTable({ event, side, players }) {
  const isA = side === 'club_a';
  const name = isA ? event.club_a_name : event.club_b_name;
  const logo = isA ? event.club_a_logo_url : event.club_b_logo_url;
  const primary = isA ? event.club_a_primary_colour : event.club_b_primary_colour;
  const secondary = isA ? event.club_a_secondary_colour : event.club_b_secondary_colour;
  const rotation = players.filter(p => (p.roster_role || 'rotation') !== 'reserve').sort((a,b)=>Number(a.event_rank||999)-Number(b.event_rank||999));
  const reserves = players.filter(p => (p.roster_role || 'rotation') === 'reserve').sort((a,b)=>Number(a.event_rank||999)-Number(b.event_rank||999));

  return <div className="rhpp-roster">
    <div className="rhpp-roster-title" style={{background:secondary || '#eef4f8', borderColor:primary || BLUE}}>
      {logo && <img src={logo} alt="" />}<strong>{name}</strong>
    </div>
    <table><thead><tr><th>No.</th><th>Player Name</th><th>M / F</th><th>Notes</th></tr></thead>
      <tbody>{Array.from({length:Math.max(16, rotation.length)},(_,i)=>{
        const p=rotation[i];
        return <tr key={i}><td>{p?.event_rank || i+1}</td><td>{p?.display_name || ''}</td><td>{p ? shortGender(p.gender) : ''}</td><td>{p && p.status !== 'active' ? p.status : ''}</td></tr>;
      })}</tbody>
    </table>
    <div className="rhpp-reserve-title">Reserves</div>
    <table className="rhpp-reserves"><tbody>{Array.from({length:Math.max(4,reserves.length)},(_,i)=>{
      const p=reserves[i]; return <tr key={i}><td>R{i+1}</td><td>{p?.display_name || ''}</td></tr>;
    })}</tbody></table>
  </div>;
}

function TeamRosterPage({ event, tournament, participants, roundsCount, courtsCount }) {
  const a = participants.filter(p => p.side === 'club_a');
  const b = participants.filter(p => p.side === 'club_b');
  const matchFormat = event.normal_match_type === 'timed'
    ? `Timed · ${event.play_minutes || 0} min${event.timed_draws_allowed === false ? ' · no draws' : ' · draws allowed'}`
    : `First to ${event.normal_target_points || 11} · win by ${event.normal_win_by || 1}`;

  return <Page className="rhpp-roster-page">
    <StandardHeader event={event} tournament={tournament} title="Team Roster & Playing Order" />
    <div className="rhpp-roster-layout">
      <RosterTable event={event} side="club_a" players={a} />
      <RosterTable event={event} side="club_b" players={b} />
      <aside className="rhpp-info-panel">
        <h3>Event Information</h3>
        <dl>
          <dt>Date</dt><dd>{fmtDate(tournament?.start_date)}</dd>
          <dt>Venue</dt><dd>{tournament?.location || '________________'}</dd>
          <dt>Format</dt><dd>{courtsCount} courts · {roundsCount} rounds</dd>
          <dt>Match format</dt><dd>{matchFormat}</dd>
          <dt>Break</dt><dd>{event.include_break ? `${event.break_minutes} minutes after Round ${event.break_after_round}` : 'No scheduled break'}</dd>
          <dt>Team size</dt><dd>{a.filter(p => (p.roster_role || 'rotation') !== 'reserve').length} / {b.filter(p => (p.roster_role || 'rotation') !== 'reserve').length} players + reserves</dd>
        </dl>
        <div className="rhpp-day-notes"><h3>Notes / Changes on the Day</h3><i/><i/><i/><i/></div>
      </aside>
    </div>
    <Footer />
  </Page>;
}

function RuleCard({ n, title, children }) {
  return <div className="rhpp-rule"><div className="rhpp-rule-number">{n}</div><div><h3>{n}. {title}</h3>{children}</div></div>;
}

function BriefingPage({ event, tournament, roundsCount, courtsCount }) {
  const format = event.normal_match_type === 'timed'
    ? `Timed rounds · ${event.play_minutes || 0} minutes${event.timed_draws_allowed === false ? ' · no draws' : ' · draws allowed'}`
    : `First to ${event.normal_target_points || 11} · win by ${event.normal_win_by || 1}`;
  return <Page className="rhpp-briefing-page">
    <StandardHeader event={event} tournament={tournament} title="Event Briefing & Rules" />
    <div className="rhpp-rule-grid">
      <RuleCard n="1" title="Format"><ul><li>{courtsCount} courts, {roundsCount} rounds</li><li>Pairs are pre-drawn and shown on the schedule</li><li>{format}</li><li>Interclub scoring: {event.win_points ?? 2} points for a win{Number(event.draw_points ?? 1) ? `, ${event.draw_points ?? 1} for a draw` : ''}</li></ul></RuleCard>
      <RuleCard n="3" title="Break"><ul>{event.include_break ? <><li>{event.break_minutes}-minute break after Round {event.break_after_round}</li><li>The host may shorten or end the break if needed</li><li>Be ready for Round {Number(event.break_after_round || 0)+1}</li></> : <li>No scheduled mid-event break</li>}</ul></RuleCard>
      <RuleCard n="2" title="During the Event"><ul><li>Be ready when your court is called</li><li>Keep to the published schedule</li><li>Change over promptly at the end of each round</li><li>Report scores to the host / desk</li><li>Enjoy the event and good sportsmanship</li></ul></RuleCard>
      <RuleCard n="4" title="Substitutions / Withdrawals"><ul><li>Tell the host immediately if you cannot continue</li><li>A reserve or approved replacement may be used</li><li>Future fixtures can be adjusted without changing completed results</li></ul></RuleCard>
      <RuleCard n="5" title="Showcase Final (if included)"><ul><li>Separate points-based final, not a timed round</li><li>Host chooses 11 or 15, win by 1 or 2</li><li>Any two eligible players from each club may be selected</li><li>An exhibition Showcase does not change the Interclub result</li></ul></RuleCard>
    </div>
    <div className="rhpp-most-important"><strong>Most importantly ...</strong><span>Be fair, have fun, and represent your team with pride!</span></div>
    <Footer />
  </Page>;
}

function FinalResultPage({ event, tournament, score, overallScore, showcaseMatch, courtsCount, roundsCount }) {
  const winner = overallScore.clubA === overallScore.clubB ? 'Overall draw' : (overallScore.clubA > overallScore.clubB ? event.club_a_name : event.club_b_name);
  return <Page className="rhpp-result-page">
    <StandardHeader event={event} tournament={tournament} title="Final Result" />
    <div className="rhpp-result-layout">
      <main>
        <div className="rhpp-team-score-grid">
          <div className="a" style={{borderTopColor:event.club_a_primary_colour || '#155eaa'}}>
            {event.club_a_logo_url && <img src={event.club_a_logo_url} alt="" />}<strong>{event.club_a_name}</strong><b>{overallScore.clubA}</b><small>Interclub points</small>
          </div>
          <div className="b" style={{borderTopColor:event.club_b_primary_colour || '#8b1e24'}}>
            {event.club_b_logo_url && <img src={event.club_b_logo_url} alt="" />}<strong>{event.club_b_name}</strong><b>{overallScore.clubB}</b><small>Interclub points</small>
          </div>
        </div>
        <div className="rhpp-result-stats">
          <div><b>{score.matchesWonA}</b><span>{event.club_a_name} wins</span></div>
          <div><b>{score.draws}</b><span>Draws</span></div>
          <div><b>{score.matchesWonB}</b><span>{event.club_b_name} wins</span></div>
          <div><b>{score.gamePointsA}</b><span>Points scored</span></div>
          <div><b>{score.gamePointDifference >= 0 ? '+' : ''}{score.gamePointDifference}</b><span>Point differential</span></div>
          <div><b>{score.gamePointsB}</b><span>Points scored</span></div>
        </div>
        {showcaseMatch && ['completed','draw'].includes(showcaseMatch.status) && <div className="rhpp-showcase-result">
          <strong>{showcaseMatch.showcase_mode === 'exhibition' ? 'Showcase Final (Exhibition)' : 'Showcase Tiebreak Final'}</strong>
          <b>{event.club_a_name} {showcaseMatch.score_a} – {showcaseMatch.score_b} {event.club_b_name}</b>
          <span>{(showcaseMatch.club_a_names || []).join(' & ')} vs {(showcaseMatch.club_b_names || []).join(' & ')}</span>
          <small>First to {showcaseMatch.showcase_target_points || 11} · win by {showcaseMatch.showcase_win_by || 1}{showcaseMatch.showcase_mode === 'exhibition' ? ' · Interclub result unchanged' : ''}</small>
        </div>}
        <div className="rhpp-winner">Final result: <strong>{winner}</strong></div>
      </main>
      <aside className="rhpp-signoff">
        <h3>Event Details</h3><p><b>Date:</b> {fmtDate(tournament?.start_date)}</p><p><b>Venue:</b> {tournament?.location || '________________'}</p><p><b>Format:</b> {courtsCount} courts · {roundsCount} rounds</p><p><b>Showcase:</b> Included / Not included</p>
        <h3>Sign Off</h3><p>We confirm that the above result is correct.</p>
        <label>{event.club_a_name} Captain:<i/></label><label>{event.club_b_name} Captain:<i/></label><label>Host:<i/></label><label>Date:<i/></label>
      </aside>
    </div>
    <Footer />
  </Page>;
}

export default function InterclubPrintPack({ event, tournament, matches=[], participants=[], score, overallScore, showcaseMatch }) {
  if (!event) return null;
  const roundsCount = Math.max(Number(event.planned_rounds || 0), ...matches.filter(m => !m.is_showcase && Number(m.round_number || 0) <= Number(event.planned_rounds || 9999)).map(m => Number(m.round_number || 0)), 1);
  const rounds = Array.from({length:roundsCount},(_,i)=>i+1);
  const playable = matches.filter(m => !m.is_showcase && m.status !== 'not_played' && Number(m.round_number || 0) <= roundsCount);
  const maxCourt = Math.max(Number(event.courts || 0), ...playable.map(m => Number(m.court_number || 0)), 1);
  const courts = Array.from({length:maxCourt},(_,i)=>i+1);
  const lastScheduledById = {};
  playable.forEach(m => {
    [...(m.club_a_participant_ids || []), ...(m.club_b_participant_ids || [])].forEach(id => {
      lastScheduledById[id] = Math.max(Number(lastScheduledById[id] || 0), Number(m.round_number || 0));
    });
  });
  const scorePages = chunk(rounds, 12);
  const schedulePages = chunk(rounds, 2);

  return <div className="rhpp-root">
    <style>{`
      @page { size:A4 portrait; margin:0; }
      @media print {
        html,body,#root { margin:0!important; padding:0!important; background:#fff!important; }
        body { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
        .rhpp-page { break-after:page!important; page-break-after:always!important; }
        .rhpp-page:last-child { break-after:auto!important; page-break-after:auto!important; }
      }
      .rhpp-root{font-family:Arial,Helvetica,sans-serif;color:${NAVY};background:#fff}
      .rhpp-page{position:relative;width:210mm;height:297mm;box-sizing:border-box;padding:6mm 7mm 18mm;background:#fff;color:${NAVY};overflow:hidden;border:.25mm solid #d7e6f2}
      .rhpp-brand{display:flex;align-items:center;min-width:0}.rhpp-brand img{width:52mm;height:auto;object-fit:contain;display:block}.rhpp-brand-small img{width:34mm;height:auto}
      .rhpp-header{height:27mm;display:grid;grid-template-columns:56mm 1fr 31mm;align-items:start;gap:2mm;border-bottom:.45mm solid ${GREEN};padding:1mm 2mm 2.2mm;box-sizing:border-box;margin-bottom:2mm}.rhpp-header-schedule{grid-template-columns:60mm 1fr}.rhpp-header-schedule .rhpp-heading{text-align:right;padding-right:1mm}.rhpp-heading{text-align:center}.rhpp-kicker{font-size:10pt;font-weight:900;letter-spacing:.04em;line-height:1}.rhpp-heading h1{font-size:13pt;line-height:1.02;margin:.7mm 0 0;font-weight:900}.rhpp-heading h2{font-size:9.2pt;line-height:1.05;margin:1mm 0 0;color:#0a64a8;font-weight:800}.rhpp-heading p,.rhpp-score-heading p{font-size:5.8pt;margin:1.2mm 0 0;color:#294b6d;font-weight:600}.rhpp-heading p span,.rhpp-score-heading p span{margin:0 1mm}.rhpp-script-tag{text-align:center;font-family:cursive;font-style:italic;font-weight:800;font-size:9pt;line-height:.9;color:#063c79;padding-top:1mm;transform:rotate(-5deg)}.rhpp-script-tag span{display:block;width:19mm;border-bottom:1.2mm solid #69b92f;transform:rotate(-8deg);margin:1.2mm auto 0}
      .rhpp-score-header{height:31mm;display:grid;grid-template-columns:43mm 1fr 43mm;gap:2mm;align-items:center;border-bottom:.35mm solid #b9d3e4;margin-bottom:2mm}.rhpp-score-heading{text-align:center}.rhpp-score-heading .rhpp-brand{justify-content:center;margin-bottom:.8mm}.rhpp-score-heading .rhpp-kicker{font-size:9pt}.rhpp-score-heading h1{font-size:13pt;margin:.6mm 0 0;line-height:1}.rhpp-score-heading h2{font-size:8pt;color:#0a64a8;margin:.8mm 0 0}.rhpp-score-team{display:flex;align-items:center;gap:2mm;font-size:8.5pt;font-weight:900;line-height:1.05}.rhpp-score-team img{width:15mm;height:15mm;object-fit:contain;border-radius:50%;background:#fff}.rhpp-score-team-b{justify-content:flex-end;text-align:right}
      .rhpp-footer{position:absolute;left:7mm;right:7mm;bottom:4mm;height:12mm}.rhpp-wave{position:absolute;left:0;right:0;top:-1mm;width:100%;height:7mm}.rhpp-footer-row{position:absolute;left:0;right:0;bottom:0;height:8mm;display:flex;align-items:flex-end;gap:2mm}.rhpp-footer-source{font-size:4.6pt;color:#35607d}.rhpp-footer-copy{margin-left:auto;font-size:4.6pt;color:#315579;white-space:nowrap}.rhpp-footer-copy strong{color:#07184c}.rhpp-footer-copy strong span{color:${GREEN}}.rhpp-footer-copy i{font-style:normal;margin:0 .7mm}
      .rhpp-score-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:5pt}.rhpp-score-table th{height:7mm;background:${BLUE};color:white;padding:.5mm;border:.25mm solid #d7e7f2;font-size:6.4pt}.rhpp-score-table td{border:.25mm solid #88abc4;height:15.5mm;padding:.4mm .5mm;vertical-align:middle;box-sizing:border-box}.rhpp-round-col{width:10mm}.rhpp-round-number{text-align:center;font-size:11pt;font-weight:900;background:#eef8fd}.rhpp-score-cell{text-align:center}.rhpp-score-name{font-size:4.8pt;line-height:1.05;height:4.1mm;overflow:hidden;display:flex;align-items:center;justify-content:center}.rhpp-score-boxes{height:5.2mm;display:flex;justify-content:center;align-items:center;gap:1.2mm}.rhpp-score-boxes span{width:6.4mm;height:5.1mm;border:.35mm solid #52728d;border-radius:.7mm;display:inline-block}.rhpp-score-boxes b{font-size:5.5pt}.rhpp-empty{color:#8399ab;font-style:italic}
      .rhpp-score-bottom{display:grid;grid-template-columns:1.25fr .95fr;gap:2.2mm;margin-top:2.3mm}.rhpp-notes-box,.rhpp-reminders{height:28mm;background:#f1f8fc;border-radius:2mm;padding:2mm;box-sizing:border-box;font-size:5.7pt}.rhpp-notes-box strong,.rhpp-reminders strong{font-size:6.3pt}.rhpp-notes-box i{display:block;border-bottom:.25mm solid #567998;height:4.4mm}.rhpp-reminders ul{margin:1.4mm 0 0;padding-left:4mm;line-height:1.5}
      .rhpp-schedule-stack{display:grid;gap:2.2mm}.rhpp-round-block{border:.25mm solid #8ab5d4;border-radius:1mm;overflow:hidden;background:#fff}.rhpp-round-band{height:7mm;background:linear-gradient(90deg,#07558d,#0d4d82);color:#fff;font-size:11pt;font-weight:900;display:flex;align-items:center;padding:0 3mm}.rhpp-court-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.4mm;padding:1.5mm}.rhpp-court-card{border:.3mm solid #63a6d2;border-radius:.6mm;overflow:hidden}.rhpp-court-head{height:5.8mm;background:#d8effc;font-size:7.7pt;font-weight:900;display:flex;align-items:center;justify-content:center}.rhpp-court-body{height:16.5mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:.6mm 1mm;box-sizing:border-box;font-size:5.9pt;font-weight:700;line-height:1.14}.rhpp-court-body em{font-style:normal;font-size:5pt;color:#405b72;margin:.3mm 0}
      .rhpp-rest-wrap{margin:0 1.5mm 1.5mm;border:.25mm solid #8ab5d4}.rhpp-rest-title{height:6mm;background:#d8effc;font-size:7.5pt;font-weight:900;display:flex;align-items:center;padding:0 2mm}.rhpp-rest-heads,.rhpp-rest-row{display:grid;grid-template-columns:1fr 1fr}.rhpp-rest-heads strong{height:5.5mm;background:#dff2c9;border:.2mm solid #7eb5d6;display:flex;align-items:center;justify-content:center;font-size:6.4pt}.rhpp-rest-row span{height:4.15mm;border:.2mm solid #bad0df;border-top:0;padding:0 2mm;display:flex;align-items:center;font-size:5.45pt}.rhpp-break{height:7mm;margin:1.5mm;background:#dff2c9;color:#073866;font-size:7.4pt;font-weight:900;display:flex;align-items:center;justify-content:center}.rhpp-page-number{position:absolute;right:7mm;bottom:13mm;font-size:4.5pt;color:#7890a3}
      .rhpp-roster-layout{display:grid;grid-template-columns:1fr 1fr 56mm;gap:2.5mm}.rhpp-roster-title{height:12mm;border:.3mm solid;border-radius:2mm 2mm 0 0;display:flex;align-items:center;gap:2mm;padding:1mm 2mm;box-sizing:border-box;font-size:8.5pt}.rhpp-roster-title img{width:9mm;height:9mm;object-fit:contain;border-radius:50%;background:#fff}.rhpp-roster table{width:100%;border-collapse:collapse;font-size:5.4pt}.rhpp-roster th{height:6mm;background:${BLUE};color:white;padding:.7mm}.rhpp-roster td{border:.22mm solid #9eb8cb;height:5.7mm;padding:.4mm .8mm}.rhpp-roster td:first-child{width:8mm;text-align:center;font-weight:800}.rhpp-roster th:nth-child(3),.rhpp-roster td:nth-child(3){width:12mm;text-align:center}.rhpp-roster th:last-child{width:18mm}.rhpp-reserve-title{height:7mm;background:#dde9f0;padding:1.5mm 2mm;box-sizing:border-box;font-size:7pt;font-weight:900;margin-top:2mm;border-radius:1mm 1mm 0 0}.rhpp-reserves td{height:5.4mm!important}.rhpp-info-panel{background:#eff8fd;border-radius:2mm;padding:2.5mm;font-size:5.8pt}.rhpp-info-panel h3{font-size:8pt;margin:0 0 2mm}.rhpp-info-panel dl{margin:0}.rhpp-info-panel dt{font-size:6pt;font-weight:900;margin-top:2.7mm}.rhpp-info-panel dd{margin:.4mm 0 0;line-height:1.3}.rhpp-day-notes{margin-top:5mm}.rhpp-day-notes i{display:block;border-bottom:.25mm solid #7894aa;height:8mm}
      .rhpp-rule-grid{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm}.rhpp-rule{display:grid;grid-template-columns:10mm 1fr;gap:2mm;border:.3mm solid #bdd7e8;border-radius:2mm;padding:3mm;min-height:49mm;box-sizing:border-box}.rhpp-rule-number{width:8mm;height:8mm;border-radius:50%;background:${NAVY};color:#fff;display:flex;align-items:center;justify-content:center;font-size:7pt;font-weight:900}.rhpp-rule h3{font-size:8pt;margin:0 0 2mm}.rhpp-rule ul{padding-left:4mm;margin:0;font-size:6.6pt;line-height:1.55}.rhpp-rule-grid .rhpp-rule:nth-child(5){grid-column:2}.rhpp-most-important{height:22mm;margin-top:3mm;border:.3mm solid #9fd3b3;background:#eef9ef;border-radius:2mm;display:flex;align-items:center;justify-content:center;gap:5mm}.rhpp-most-important strong{color:#098844;font-size:8pt}.rhpp-most-important span{font-size:7pt;font-weight:700}
      .rhpp-result-layout{display:grid;grid-template-columns:1fr 57mm;gap:3mm}.rhpp-team-score-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.rhpp-team-score-grid>div{height:59mm;border:.35mm solid #bfd5e4;border-top:1.2mm solid;border-radius:2mm;padding:3mm;text-align:center;box-sizing:border-box;background:#f5fbff}.rhpp-team-score-grid>div.b{background:#fff7f7}.rhpp-team-score-grid img{width:15mm;height:15mm;object-fit:contain;display:block;margin:0 auto 1mm}.rhpp-team-score-grid strong{display:block;font-size:8.5pt}.rhpp-team-score-grid b{display:block;font-size:31pt;line-height:1;margin:2mm 0}.rhpp-team-score-grid small{font-size:6pt}.rhpp-result-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:2mm;margin-top:2.5mm}.rhpp-result-stats>div{border:.25mm solid #b7cad8;border-radius:1.5mm;padding:2mm;text-align:center}.rhpp-result-stats b{display:block;font-size:13pt}.rhpp-result-stats span{display:block;font-size:5.5pt}.rhpp-showcase-result{margin-top:3mm;background:#eff9ef;border:.3mm solid #aad7b1;border-radius:2mm;padding:3mm;text-align:center}.rhpp-showcase-result>*{display:block}.rhpp-showcase-result strong{font-size:7pt;color:#087e42}.rhpp-showcase-result b{font-size:8.5pt;margin-top:1mm}.rhpp-showcase-result span,.rhpp-showcase-result small{font-size:5.6pt;margin-top:.7mm}.rhpp-winner{margin-top:4mm;text-align:center;font-size:9pt}.rhpp-signoff{background:#eff8fd;border-radius:2mm;padding:3mm;font-size:6pt}.rhpp-signoff h3{font-size:8pt;margin:0 0 2mm}.rhpp-signoff h3:not(:first-child){margin-top:6mm}.rhpp-signoff p{margin:1.5mm 0}.rhpp-signoff label{display:grid;grid-template-columns:auto 1fr;gap:2mm;margin-top:5mm}.rhpp-signoff i{border-bottom:.25mm solid #7894aa}
    `}</style>

    {scorePages.map((rs,i)=><MasterScorePage key={`score-${i}`} event={event} tournament={tournament} matches={playable} rounds={rs} courts={courts} />)}
    {schedulePages.map((rs,i)=><MasterSchedulePage key={`schedule-${i}`} event={event} tournament={tournament} matches={playable} participants={participants} rounds={rs} lastScheduledById={lastScheduledById} pageIndex={i} totalPages={schedulePages.length} />)}
    <TeamRosterPage event={event} tournament={tournament} participants={participants} roundsCount={roundsCount} courtsCount={courts.length} />
    <BriefingPage event={event} tournament={tournament} roundsCount={roundsCount} courtsCount={courts.length} />
    {['completed','archived'].includes(event.status) && <FinalResultPage event={event} tournament={tournament} score={score} overallScore={overallScore} showcaseMatch={showcaseMatch} courtsCount={courts.length} roundsCount={roundsCount} />}
  </div>;
}
