import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hash, Play, Zap, Timer, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { estimateDuration, generateGroupFixtures } from '@/lib/tournivalEngine';
import TournivalSeedOrder from './TournivalSeedOrder';
import TournivalFixtures from './TournivalFixtures';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const MATCH_FORMATS = [
  { value: 'timed_10', label: '10-min timed', icon: Timer, desc: 'Most points wins' },
  { value: 'timed_15', label: '15-min timed', icon: Timer, desc: 'Most points wins' },
  { value: 'first_11_by1', label: 'First to 11', icon: Hash, desc: 'Win by 1' },
  { value: 'first_11_by2', label: 'First to 11', icon: Hash, desc: 'Win by 2' },
];

export default function TournivalSetup({ players, tournament, onStart, isAdmin, locked, existingState, onSaveState }) {
  const [numCourts, setNumCourts] = useState(existingState?.numCourts || tournament.kotc_num_courts || 4);
  const [numRounds, setNumRounds] = useState(existingState?.numRounds || 4);
  const [knockoutPairs, setKnockoutPairs] = useState(existingState?.knockoutPairs || 4);
  const [venueMinutes, setVenueMinutes] = useState(existingState?.venueMinutes || 120);
  const [matchMinutes, setMatchMinutes] = useState(existingState?.matchMinutes ?? 18);
  const [changeoverMinutes, setChangeoverMinutes] = useState(existingState?.changeoverMinutes ?? 3);
  const [matchFormat, setMatchFormat] = useState(existingState?.matchFormat || 'first_11_by1');
  const [duprEnabled, setDuprEnabled] = useState(existingState?.duprEnabled===true);
  const [seedOrder, setSeedOrder] = useState(existingState?.seedOrder || players.map(p => p.id));
  const [seedConfirmed, setSeedConfirmed] = useState(!!existingState?.seedOrderConfirmed);
  const [saving, setSaving] = useState(false);
  const [entryFee, setEntryFee] = useState(String(tournament.event_fee_amount ?? 0));
  const [feeSaving, setFeeSaving] = useState(false);
  const [playerStage,setPlayerStage]=useState(tournament.tournival_player_stage||'registration');
  const [playerVenue,setPlayerVenue]=useState(tournament.location||'');
  const [playerMap,setPlayerMap]=useState(tournament.event_map_url||'');
  const [playerArrival,setPlayerArrival]=useState(tournament.event_player_info||'');
  const [playerPhone,setPlayerPhone]=useState(tournament.event_contact_phone||'');
  const [playerStart,setPlayerStart]=useState(tournament.event_start_time||'');
  const [playerEnd,setPlayerEnd]=useState(tournament.event_end_time||'');
  const [playerPublishing,setPlayerPublishing]=useState(false);
  const useGalwayVenue=()=>{
    setPlayerVenue('St Joseph’s Doora Barefield GAA Sports Hall, Gurteen, Ennis, Co. Clare, V95 PD36');
    setPlayerMap('https://maps.google.com/?q=V95+PD36');
    setPlayerArrival('When you arrive at Gurteen, head towards the right-hand side of the car park, towards the astroturf. There is ample parking on both sides, so park anywhere you can find a space.\n\nAs you drive in and face the main building, the entrance we are using is the very last door at the far right-hand end of the building, beside the astroturf pitch. It looks like an emergency exit rather than a main entrance. The door will be open.');
  };
  const savePlayerPublishing=async()=>{
    if(!isAdmin)return;
    setPlayerPublishing(true);
    try{
      const result=await base44.functions.invoke('legacyTournamentManager',{
        action:'set_tournival_player_publishing',tournamentId:tournament.id,
        stage:playerStage,venue:playerVenue,mapUrl:playerMap,arrivalInfo:playerArrival,
        contactPhone:playerPhone,startTime:playerStart,endTime:playerEnd,confirmPublication:true
      });
      if(!result.data?.success)throw Error(result.data?.error||'Could not save player-link details');
      toast.success('Player link publication stage and venue information saved');
      window.dispatchEvent(new CustomEvent('tournival-player-stage-updated',{detail:{tournamentId:tournament.id}}));
    }catch(e){toast.error(e.response?.data?.error||e.message||'Could not save player link')}
    finally{setPlayerPublishing(false)}
  };

  const saveEntryFee = async () => {
    const amount = Number(entryFee);
    if (!entryFee.trim() || !Number.isFinite(amount) || amount < 0 || amount > 10000 ||
        Math.round(amount * 100) !== amount * 100) {
      toast.error('Enter a valid EUR amount with up to two decimal places.');
      return;
    }
    setFeeSaving(true);
    try {
      const response = await base44.functions.invoke('legacyTournamentManager', {
        tournamentId: tournament.id, action: 'set_tournival_entry_fee', amount, currency: 'EUR'
      });
      if (!response?.data?.success) throw Error(response?.data?.error || 'Could not update tournament fee.');
      toast.success('Tournival entry fee saved. New registrations will use this amount.');
      window.dispatchEvent(new CustomEvent('tournival-fee-updated', {detail:{tournamentId:tournament.id}}));
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message || 'Could not save fee.');
    } finally { setFeeSaving(false); }
  };


  const numPlayers = players.length;
  const isValid = numPlayers >= 4;
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]));
  const orderedPlayers = seedOrder.map(id => playerMap[id]).filter(Boolean);
  const missingPlayers = players.filter(p => !seedOrder.includes(p.id));
  const fullOrderedPlayers = [...orderedPlayers, ...missingPlayers];
  const currentSeedIds = fullOrderedPlayers.map(p => p.id);
  const seedLocked = locked;

  const maxKnockoutPairs=Math.min(8,2**Math.floor(Math.log2(Math.max(1,Math.floor(numPlayers/2)))));
  const selectedKnockoutPairs=Math.min(knockoutPairs,maxKnockoutPairs);
  const duration = estimateDuration({ numPlayers, numCourts, numRounds, matchFormat,
    knockoutPairs:selectedKnockoutPairs, matchMinutes: matchFormat.startsWith('timed_') ? undefined : matchMinutes, changeoverMinutes, venueMinutes });
  const activePlayers = Math.min(numPlayers, numCourts * 4);
  const benchPlayers = Math.max(0, numPlayers - activePlayers);

  const handleStart = async () => {
    if (!isValid) { toast.error('Add at least 4 players to start.'); return; }
    if (!seedConfirmed) { toast.error('Confirm seed order before generating fixtures.'); return; }
    setSaving(true);
    await onStart({ numCourts: Number(numCourts), numRounds: Number(numRounds), matchFormat, duprEnabled, knockoutPairs:selectedKnockoutPairs, seedOrder: currentSeedIds, venueMinutes, matchMinutes: duration.matchMinutes, changeoverMinutes });
    setSaving(false);
  };

  const handleSeedReorder = (ids) => {
    setSeedOrder(ids);
    setSeedConfirmed(false);
  };

  const handleSortByRanking = () => {
    setSeedOrder([...fullOrderedPlayers].sort((a, b) => (b.skill_rating || 0) - (a.skill_rating || 0)).map(p => p.id));
    setSeedConfirmed(false);
  };

  const handleRandomise = () => {
    const shuffled = [...fullOrderedPlayers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setSeedOrder(shuffled.map(p => p.id));
    setSeedConfirmed(false);
  };

  const handleReset = () => {
    setSeedOrder(players.map(p => p.id));
    setSeedConfirmed(false);
  };

  const handleConfirmSeeds = async () => {
    setSeedConfirmed(true);
    if (onSaveState) {
      await onSaveState({ ...(existingState || {}), seedOrder: currentSeedIds, seedOrderConfirmed: true, seedOrderLocked: false, playerIds: currentSeedIds, rounds: existingState?.rounds || [], numCourts: Number(numCourts), numRounds: Number(numRounds), matchFormat, duprEnabled, knockoutPairs:selectedKnockoutPairs, venueMinutes, matchMinutes: duration.matchMinutes, changeoverMinutes, results: existingState?.results || {}, currentRound: existingState?.currentRound || 0 });
    }
    toast.success('Seed order confirmed');
  };

  const handleUnlockSeeds = async () => {
    const ok = window.confirm('Unlocking seed order may change existing fixtures. Continue?');
    if (!ok || !existingState || !onSaveState) return;
    await onSaveState({ ...existingState, seedOrderLocked: false });
    toast.success('Seed order unlocked');
  };

  const previewRounds = seedConfirmed ? generateGroupFixtures(currentSeedIds, Number(numCourts), Number(numRounds)) : [];
  const previewMap = Object.fromEntries(players.map(p => [p.id, p.full_name || p.id]));

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Tournival Setup</p>
            <p className="text-xs text-muted-foreground">{numPlayers} players registered</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="glass rounded-lg p-3">
            <p className="text-xl font-bold text-foreground">{numPlayers}</p>
            <p className="text-[10px] text-muted-foreground">Players</p>
          </div>
          <div className="glass rounded-lg p-3">
            <p className="text-xl font-bold text-primary">{activePlayers}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </div>
          <div className="glass rounded-lg p-3">
            <p className={cn('text-xl font-bold', benchPlayers > 0 ? 'text-yellow-400' : 'text-primary')}>{benchPlayers}</p>
            <p className="text-[10px] text-muted-foreground">Bench</p>
          </div>
          <div className="glass rounded-lg p-3">
            <p className="text-xl font-bold text-accent">{duration.valid ? duration.formatted : 'Check setup'}</p>
            <p className="text-[10px] text-muted-foreground">Est. duration</p>
          </div>
        </div>
      </div>

      {/* Persistent personal player link — organiser chooses when competition
          sections are released. No separate links or hidden data leakage. */}
      <section className="glass rounded-xl p-5 space-y-3">
        <h3 className="font-semibold">Player link · staged publication</h3>
        <p className="text-xs text-muted-foreground">Galway-style journey: registration, venue and contact first. Competition sections stay hidden until you release them. The player's personal link never changes.</p>
        <Label htmlFor="tournival-player-stage">Information visible to players</Label>
        <Select value={playerStage} onValueChange={setPlayerStage} disabled={!isAdmin||playerPublishing}>
          <SelectTrigger id="tournival-player-stage"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="registration">Registration & Venue only (default)</SelectItem>
            <SelectItem value="fixtures">Release qualification fixtures</SelectItem>
            <SelectItem value="live">Live matches and scores</SelectItem>
            <SelectItem value="knockout">Release knockout</SelectItem>
            <SelectItem value="results">Final tournament results</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" disabled={!isAdmin||playerPublishing} onClick={useGalwayVenue}>Use approved St Joseph's Doora Barefield directions</Button>
        <Label htmlFor="tournival-player-venue">Venue and address</Label>
        <Input id="tournival-player-venue" value={playerVenue} onChange={e=>setPlayerVenue(e.target.value)} disabled={!isAdmin}/>
        <Label htmlFor="tournival-player-map">Google Maps directions URL</Label>
        <Input id="tournival-player-map" value={playerMap} onChange={e=>setPlayerMap(e.target.value)} disabled={!isAdmin}/>
        <Label htmlFor="tournival-player-arrival">Parking and entrance instructions</Label>
        <textarea id="tournival-player-arrival" rows={5} maxLength={2000} value={playerArrival} onChange={e=>setPlayerArrival(e.target.value)} disabled={!isAdmin} className="w-full rounded-md border bg-secondary px-3 py-2 text-sm"/>
        <Label htmlFor="tournival-player-phone">Event contact phone</Label>
        <Input id="tournival-player-phone" type="tel" value={playerPhone} onChange={e=>setPlayerPhone(e.target.value)} disabled={!isAdmin}/>
        <div className="grid grid-cols-2 gap-3">
         <div><Label htmlFor="tournival-player-start">Start time</Label><Input id="tournival-player-start" type="time" value={playerStart} onChange={e=>setPlayerStart(e.target.value)} disabled={!isAdmin}/></div>
         <div><Label htmlFor="tournival-player-end">Finish time</Label><Input id="tournival-player-end" type="time" value={playerEnd} onChange={e=>setPlayerEnd(e.target.value)} disabled={!isAdmin}/></div>
        </div>
        <Button onClick={savePlayerPublishing} disabled={!isAdmin||playerPublishing} type="button">{playerPublishing?'Saving…':'Save player link & release stage'}</Button>
      </section>

      {/* Event-scoped checkout configuration: never changes the connected club gateway. */}
      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Event entry fee · Clare Pickleball SumUp (club account)</h3>
        <p className="text-xs text-muted-foreground">Choose the fee for this tournament only. Free events do not create a SumUp checkout. The amount is locked once the first registration is received.</p>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="w-40">
            <Label className="text-xs text-muted-foreground" htmlFor="tournival-event-fee">Entry fee (€)</Label>
            <Input id="tournival-event-fee" type="number" min="0" max="10000" step="0.01"
              value={entryFee} onChange={e=>setEntryFee(e.target.value)}
              disabled={!isAdmin || feeSaving || !!existingState?.rounds?.length} />
          </div>
          <Button type="button" variant="outline" onClick={saveEntryFee}
            disabled={!isAdmin || feeSaving || !!existingState?.rounds?.length}>
            {feeSaving?'Saving…':'Save event fee'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Payment account is selected from this event's tenant and host club at checkout, not from a manually entered merchant ID.</p>
      </div>

      {/* Configuration */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Session Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Number of Courts</Label>
            <Input
              type="number" min={1} max={8}
              value={numCourts}
              onChange={e => setNumCourts(Math.max(1, Math.min(8, Number(e.target.value))))}
              className="mt-1 bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Group Rounds</Label>
            <Select value={String(numRounds)} onValueChange={v => setNumRounds(Number(v))}>
              <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6].map(n => <SelectItem key={n} value={String(n)}>{n} rounds</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Knockout pairs</Label>
            <Select value={String(selectedKnockoutPairs)} onValueChange={v=>setKnockoutPairs(Number(v))}>
              <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue/></SelectTrigger>
              <SelectContent>{[2,4,8].filter(n=>n<=maxKnockoutPairs).map(n=>
                <SelectItem key={n} value={String(n)}>{n} pairs / {n*2} players</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Venue booked (minutes)</Label>
            <Select value={String(venueMinutes)} onValueChange={v => setVenueMinutes(Number(v))}>
              <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: 15 }, (_, i) => 60 + i * 30).map(n =>
                <SelectItem key={n} value={String(n)}>{n} min</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Changeover (minutes)</Label>
            <Input type="number" min={0} max={30} value={changeoverMinutes}
              onChange={e => setChangeoverMinutes(Math.max(0, Math.min(30, Number(e.target.value))))}
              className="mt-1 bg-secondary border-border" />
          </div>
          {!matchFormat.startsWith('timed_') && <div>
            <Label className="text-xs text-muted-foreground">Average points match (minutes)</Label>
            <Input type="number" min={1} max={90} value={matchMinutes}
              onChange={e => setMatchMinutes(Math.max(1, Math.min(90, Number(e.target.value))))}
              className="mt-1 bg-secondary border-border" />
          </div>}
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Match Format</Label>
          <div className="grid grid-cols-2 gap-2">
            {MATCH_FORMATS.map(f => (
              <label key={f.value} className={cn(
                'flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all',
                matchFormat === f.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
              )}>
                <input type="radio" name="matchFormat" value={f.value} checked={matchFormat === f.value}
                  onChange={() => setMatchFormat(f.value)} className="sr-only" />
                <f.icon className={cn('w-3.5 h-3.5 shrink-0', matchFormat === f.value ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <p className="text-xs font-medium text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs glass rounded-xl p-4">
        <input type="checkbox" checked={duprEnabled} onChange={e=>setDuprEnabled(e.target.checked)}/>
        <span>Optional DUPR reporting review after this event. Does not prevent unrated or unlinked players participating.</span>
      </label>

      {/* Seed ordering */}
      <TournivalSeedOrder
        orderedPlayers={fullOrderedPlayers}
        locked={seedLocked}
        confirmed={seedConfirmed}
        isAdmin={isAdmin}
        onReorder={handleSeedReorder}
        onSortByRanking={handleSortByRanking}
        onRandomise={handleRandomise}
        onReset={handleReset}
        onConfirm={handleConfirmSeeds}
        onUnlock={handleUnlockSeeds}
      />

      {/* Draw preview */}
      {seedConfirmed && previewRounds.length > 0 && (
        <div className="space-y-3">
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Draw Preview</p>
              <p className="text-xs text-muted-foreground">Preview uses the confirmed seed order below.</p>
            </div>
          </div>
          <TournivalFixtures rounds={previewRounds} playerMap={previewMap} isAdmin={false} />
        </div>
      )}

      {/* Duration breakdown */}
      <div className="glass rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Estimated Timeline</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Group stage ({numRounds} rounds)</span>
            <span className="text-foreground font-medium">{duration.groupMinutes}min</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Knockout including final ({duration.knockoutPairs || 0} pairs)</span>
            <span className="text-foreground font-medium">{duration.knockoutMinutes}min</span>
          </div>
          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Setup and changeover allowance</span><span>{(duration.setupMinutes || 0) + (duration.changeoverMinutes || 0)}min</span></div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">{duration.valid ? duration.formatted : 'Check setup'}</span>
          </div>
          {duration.valid && !duration.fitsBooking && <p role="alert" className="text-xs text-amber-400">Warning: estimated overrun {duration.overrunMinutes} min beyond {venueMinutes}-minute booking. Host can still proceed.</p>}
          {!duration.valid && <p role="alert" className="text-xs text-destructive">{duration.error}</p>}
        </div>
      </div>

      {numPlayers < 4 && (
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Add at least 4 players to start a Tournival session.</p>
        </div>
      )}

      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12"
        onClick={handleStart}
        disabled={!isValid || saving || !seedConfirmed || !duration.valid}
      >
        {saving
          ? <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Generating Fixtures…</>
          : <><Play className="w-4 h-4" /> {seedConfirmed ? 'Generate Fixtures & Start' : 'Confirm seed order first'}</>
        }
      </Button>
    </div>
  );
}