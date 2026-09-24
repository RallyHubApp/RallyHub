import React from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, CheckCircle2, Clock3 } from 'lucide-react';
import { INTERCLUB_EVENT_LABEL, INTERCLUB_MODULE_NAME } from '@/lib/interclubBranding';
import { AppearanceQuickButton } from '@/components/appearance/AppearanceControls';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';

function getDeviceId() {
  const key = 'rallyhub-pot-device-id';
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = window.crypto?.randomUUID?.() || `rh-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return window.crypto?.randomUUID?.() || `rh-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function formatRemaining(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PublicClubChallengeVote(){
  const { token } = useParams();
  const [data,setData] = React.useState(null);
  const [error,setError] = React.useState('');
  const [clubA,setClubA] = React.useState('');
  const [clubB,setClubB] = React.useState('');
  const [saving,setSaving] = React.useState(false);
  const [done,setDone] = React.useState(false);
  const [now,setNow] = React.useState(Date.now());
  const [deviceId] = React.useState(getDeviceId);
  const savingRef = React.useRef(false);

  const load = React.useCallback(async()=>{
    try {
      const r = await base44.functions.invoke('getPublicClubChallengeVote',{ token });
      if (r.data?.error) throw new Error(r.data.error);
      setData(r.data);
      setError('');
    } catch(e) {
      setError(e?.response?.data?.error || e?.message || 'Voting unavailable');
    }
  },[token]);

  React.useEffect(()=>{ load(); },[load]);
  React.useEffect(()=>{
    const id = window.setInterval(()=>setNow(Date.now()),1000);
    return ()=>window.clearInterval(id);
  },[]);

  const closesAt = data?.event?.pot_vote_closes_at ? Date.parse(data.event.pot_vote_closes_at) : NaN;
  const timed = Number.isFinite(closesAt);
  const remainingMs = timed ? Math.max(0, closesAt - now) : null;
  const votingOpen = data?.event?.pot_status === 'open' && (!timed || remainingMs > 0);
  const aPlayers = (data?.participants || []).filter(p=>p.side === 'club_a');
  const bPlayers = (data?.participants || []).filter(p=>p.side === 'club_b');
  const eventClubs = data ? [
    { id:'club_a', name:data.event.club_a_name, logo_url:data.event.club_a_logo_url, primary_colour:data.event.club_a_primary_colour, secondary_colour:data.event.club_a_secondary_colour },
    { id:'club_b', name:data.event.club_b_name, logo_url:data.event.club_b_logo_url, primary_colour:data.event.club_b_primary_colour, secondary_colour:data.event.club_b_secondary_colour },
  ] : [];

  const cast = async()=>{
    if (savingRef.current || !clubA || !clubB || !votingOpen) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const r = await base44.functions.invoke('castPublicClubChallengePotVote',{
        token,
        clubANomineeParticipantId:clubA,
        clubBNomineeParticipantId:clubB,
        voterDeviceId:deviceId
      });
      if (r.data?.error) throw new Error(r.data.error);
      setDone(true);
      setError('');
    } catch(e) {
      setError(e?.response?.data?.error || e?.message || 'Vote could not be recorded');
      await load();
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (done) return <div className="min-h-screen bg-background text-foreground grid place-items-center p-6"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
    <div className="w-full max-w-md text-center rounded-2xl border border-border bg-card p-8 shadow-sm">
      <RallyHubPublicBrand moduleName={INTERCLUB_MODULE_NAME} pageLabel="Players of the Tournament Voting" clubs={eventClubs}/>
      <CheckCircle2 className="w-11 h-11 text-primary mx-auto mt-5"/>
      <h1 className="text-xl font-bold mt-3">Votes recorded</h1>
      <p className="text-sm text-muted-foreground mt-2">Thank you. Your Player of the Tournament choices for both teams have been securely recorded.</p>
    </div>
  </div>;

  return <div className="min-h-screen bg-background text-foreground p-4 grid place-items-center"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 sm:p-7 space-y-5 shadow-sm">
      <div className="text-center">
        <RallyHubPublicBrand moduleName={INTERCLUB_MODULE_NAME} pageLabel="Players of the Tournament Voting" clubs={eventClubs}/>
        <Trophy className="w-9 h-9 text-primary mx-auto mt-4"/>
        <h1 className="text-xl font-bold mt-1">{data ? `${data.event.club_a_name} vs ${data.event.club_b_name}` : INTERCLUB_EVENT_LABEL}</h1>
        <p className="text-sm text-muted-foreground mt-2">Choose one player from each team.</p>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 text-destructive p-3 text-sm">{error}</div>}

      {data && !votingOpen && <div className="rounded-lg bg-secondary p-4 text-sm text-center">
        Voting is currently <b>{remainingMs === 0 && data.event.pot_status === 'open' ? 'closed' : data.event.pot_status}</b>.
      </div>}

      {data && votingOpen && <>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
          {timed ? <div className="flex items-center justify-center gap-2"><Clock3 className="w-4 h-4 text-primary"/><span className="text-sm font-bold">Voting closes in {formatRemaining(remainingMs)}</span></div> : <p className="text-sm font-bold">Voting is open until the host closes it</p>}
          <p className="text-[11px] text-muted-foreground mt-1">One ballot per phone/browser for this Interclub.</p>
        </div>

        <div className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            {data.event.club_a_logo_url && <img src={data.event.club_a_logo_url} alt="" className="w-10 h-10 rounded-lg bg-white object-contain p-1"/>}
            <div><p className="text-xs text-muted-foreground">Vote for</p><p className="font-bold">{data.event.club_a_name} Player of the Tournament</p></div>
          </div>
          <div>
            <Label>Choose one player</Label>
            <Select value={clubA} onValueChange={setClubA}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={`Select ${data.event.club_a_name} player`}/></SelectTrigger>
              <SelectContent>{aPlayers.map(p=><SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            {data.event.club_b_logo_url && <img src={data.event.club_b_logo_url} alt="" className="w-10 h-10 rounded-lg bg-white object-contain p-1"/>}
            <div><p className="text-xs text-muted-foreground">Vote for</p><p className="font-bold">{data.event.club_b_name} Player of the Tournament</p></div>
          </div>
          <div>
            <Label>Choose one player</Label>
            <Select value={clubB} onValueChange={setClubB}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={`Select ${data.event.club_b_name} player`}/></SelectTrigger>
              <SelectContent>{bPlayers.map(p=><SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full h-12 text-base" onClick={cast} disabled={!clubA || !clubB || saving}>
          {saving ? 'Recording…' : 'Submit My Votes'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">Votes remain private. Results stay hidden until the host reveals them.</p>
      </>}

      {data?.event.junior_display_mode && <p className="text-xs text-muted-foreground text-center">Junior privacy mode is active.</p>}
    </div>
  </div>;
}