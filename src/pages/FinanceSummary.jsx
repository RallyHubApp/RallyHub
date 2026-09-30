import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Euro, Plus, RefreshCw, Save, Settings2, WalletCards } from 'lucide-react';
import { toast } from 'sonner';

const money = value => new Intl.NumberFormat('en-IE', { style:'currency', currency:'EUR' }).format(Number(value || 0));
const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Dublin', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
const round2 = value => Math.round(Number(value || 0) * 100) / 100;
const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const monthsOfYear = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function financeYearStart(settings) {
  const today = todayIso();
  const [year,month,day] = today.split('-').map(Number);
  const startMonth = Number(settings?.financial_year_start_month || 1);
  const startDay = Number(settings?.financial_year_start_day || 1);
  const startYear = month > startMonth || (month === startMonth && day >= startDay) ? year : year - 1;
  return `${startYear}-${String(startMonth).padStart(2,'0')}-${String(startDay).padStart(2,'0')}`;
}

function financeYearLabelFor(dateValue, settings) {
  const parts=String(dateValue||'').split('-').map(Number);
  if (parts.length<3 || !parts[0]) return '';
  const [year,month,day]=parts;
  const startMonth=Number(settings?.financial_year_start_month||1), startDay=Number(settings?.financial_year_start_day||1);
  const startYear=month>startMonth || (month===startMonth && day>=startDay) ? year : year-1;
  return `${startYear}/${String(startYear+1).slice(-2)}`;
}

function netFor(row) {
  const venueCost = row.actual_cost_amount == null ? Number(row.expected_cost_amount || 0) : Number(row.actual_cost_amount || 0);
  return round2(Number(row.income_amount || 0) - venueCost - Number(row.other_cost_amount || 0));
}

function ResultBadge({ value }) {
  if (value > 0.009) return <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-700"><ArrowUpRight className="mr-1 h-3 w-3" />Surplus {money(value)}</Badge>;
  if (value < -0.009) return <Badge className="border border-red-500/30 bg-red-500/10 text-red-700"><ArrowDownRight className="mr-1 h-3 w-3" />Loss {money(Math.abs(value))}</Badge>;
  return <Badge variant="outline"><CheckCircle2 className="mr-1 h-3 w-3" />Break-even</Badge>;
}

export default function FinanceSummary() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = user?.active_tenant_id || '';
  const clubId = user?.active_club_id || '';
  const canManage = user?.role === 'admin' || user?.active_club_role === 'club_admin';
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(todayIso());
  const [selectedVenueIds, setSelectedVenueIds] = useState([]);
  const [monthFilter, setMonthFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncResult, setSyncResult] = useState(null);
  const [showRecurringSetup, setShowRecurringSetup] = useState(false);
  const [editingVenueId, setEditingVenueId] = useState('');
  const [venueDraft, setVenueDraft] = useState({ address:'', hourlyRate:'' });
  const [ruleDraft, setRuleDraft] = useState({ venueId:'', weekday:'Monday', startTime:'19:00', durationMinutes:'90', feePerPerson:'', incomeSource:'spond', sessionLabel:'', spondGroupId:'', spondEventId:'' });
  const [manualDraft, setManualDraft] = useState({ date:todayIso(), venueId:'', label:'', durationMinutes:'180', paidPlaces:'', feePerPerson:'', otherCost:'0', notes:'' });
  const [settingsDraft, setSettingsDraft] = useState({ startMonth:'1', startDay:'1', trackingStart:'' });

  const { data: settingsRows = [] } = useQuery({
    queryKey:['finance-settings',tenantId,clubId],
    queryFn:()=>base44.entities.ClubFinanceSettings.filter({ tenant_id:tenantId, club_id:clubId }, '-updated_date', 5),
    enabled:canManage && !!tenantId && !!clubId,
  });
  const settings = settingsRows[0] || null;

  useEffect(()=>{
    if (!settings) return;
    const fyStart = financeYearStart(settings);
    const tracking = settings.tracking_start_date || fyStart;
    setFromDate(current => current || (tracking > fyStart ? tracking : fyStart));
    setSettingsDraft({ startMonth:String(settings.financial_year_start_month || 1), startDay:String(settings.financial_year_start_day || 1), trackingStart:tracking });
  },[settings?.id]);

  const { data: venues = [] } = useQuery({
    queryKey:['finance-venues',tenantId,clubId],
    queryFn:()=>base44.entities.Venue.filter({ tenant_id:tenantId, club_id:clubId }, 'name', 200),
    enabled:canManage && !!tenantId && !!clubId,
  });
  const { data: rules = [] } = useQuery({
    queryKey:['finance-rules',tenantId,clubId],
    queryFn:()=>base44.entities.ClubFinanceVenueRule.filter({ tenant_id:tenantId, club_id:clubId }, 'venue_name', 500),
    enabled:canManage && !!tenantId && !!clubId,
  });
  const { data: entries = [], isLoading } = useQuery({
    queryKey:['finance-entries',tenantId,clubId],
    queryFn:()=>base44.entities.ClubFinanceEntry.filter({ tenant_id:tenantId, club_id:clubId }, '-activity_date', 1000),
    enabled:canManage && !!tenantId && !!clubId,
  });
  const { data: spondBindings = [] } = useQuery({
    queryKey:['finance-spond-bindings',tenantId,clubId],
    queryFn:()=>base44.entities.SpondSessionBinding.filter({ tenant_id:tenantId, club_id:clubId, active:true }, 'directory_session_key', 200),
    enabled:user?.role === 'admin' && !!tenantId && !!clubId,
  });
  const listingSlug = spondBindings[0]?.listing_slug || '';
  const { data: spondConnections = [] } = useQuery({
    queryKey:['finance-spond-connection',listingSlug],
    queryFn:()=>base44.entities.DirectorySpondConnection.filter({ listing_slug:listingSlug, status:'active' }, '-last_synced_at', 5),
    enabled:user?.role === 'admin' && !!listingSlug,
  });
  const spondConnection = spondConnections[0] || null;

  useEffect(()=>{
    if (!venues.length || selectedVenueIds.length) return;
    setSelectedVenueIds(venues.map(v=>v.id));
  },[venues]);

  const filtered = useMemo(()=>entries.filter(row=>{
    if (fromDate && row.activity_date < fromDate) return false;
    if (row.activity_date > toDate) return false;
    if (!selectedVenueIds.includes(row.venue_id)) return false;
    if (monthFilter !== 'all' && !String(row.activity_date || '').startsWith(monthFilter)) return false;
    return true;
  }),[entries,fromDate,toDate,selectedVenueIds,monthFilter]);

  const months = useMemo(()=>[...new Set(entries.map(row=>String(row.activity_date || '').slice(0,7)).filter(Boolean))].sort().reverse(),[entries]);
  const totals = useMemo(()=>filtered.reduce((acc,row)=>{
    acc.income += Number(row.income_amount || 0);
    acc.cost += row.actual_cost_amount == null ? Number(row.expected_cost_amount || 0) : Number(row.actual_cost_amount || 0);
    acc.other += Number(row.other_cost_amount || 0);
    acc.net += netFor(row);
    return acc;
  },{income:0,cost:0,other:0,net:0}),[filtered]);

  const venueRollup = useMemo(()=>{
    const map = new Map();
    for (const row of filtered) {
      const key = row.venue_name || 'Other';
      if (!map.has(key)) map.set(key,{venue:key,income:0,cost:0,other:0,net:0,count:0});
      const item=map.get(key); item.income+=Number(row.income_amount||0); item.cost+=row.actual_cost_amount==null?Number(row.expected_cost_amount||0):Number(row.actual_cost_amount||0); item.other+=Number(row.other_cost_amount||0); item.net+=netFor(row); item.count++;
    }
    return [...map.values()].sort((a,b)=>a.venue.localeCompare(b.venue));
  },[filtered]);

  const monthRollup = useMemo(()=>{
    const map=new Map();
    for(const row of filtered){const key=String(row.activity_date||'').slice(0,7);if(!key)continue;if(!map.has(key))map.set(key,{key,income:0,cost:0,net:0,count:0});const x=map.get(key);x.income+=Number(row.income_amount||0);x.cost+=(row.actual_cost_amount==null?Number(row.expected_cost_amount||0):Number(row.actual_cost_amount||0))+Number(row.other_cost_amount||0);x.net+=netFor(row);x.count++;}
    return [...map.values()].sort((a,b)=>b.key.localeCompare(a.key));
  },[filtered]);

  const dayRollup = useMemo(()=>{
    const map=new Map();
    for(const row of filtered){const key=`${row.activity_date}||${row.venue_name||'Other'}`;if(!map.has(key))map.set(key,{key,date:row.activity_date,venue:row.venue_name||'Other',income:0,cost:0,net:0,count:0});const x=map.get(key);x.income+=Number(row.income_amount||0);x.cost+=(row.actual_cost_amount==null?Number(row.expected_cost_amount||0):Number(row.actual_cost_amount||0))+Number(row.other_cost_amount||0);x.net+=netFor(row);x.count++;}
    return [...map.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.venue.localeCompare(b.venue));
  },[filtered]);

  const saveSettings = async () => {
    const month=Number(settingsDraft.startMonth), day=Number(settingsDraft.startDay);
    if (!Number.isInteger(month) || month<1 || month>12 || !Number.isInteger(day) || day<1 || day>31 || !settingsDraft.trackingStart) return toast.error('Check the financial year settings.');
    try {
      const payload={tenant_id:tenantId,club_id:clubId,currency:'EUR',financial_year_start_month:month,financial_year_start_day:day,tracking_start_date:settingsDraft.trackingStart};
      if (settings?.id) await base44.entities.ClubFinanceSettings.update(settings.id,payload); else await base44.entities.ClubFinanceSettings.create(payload);
      await queryClient.invalidateQueries({queryKey:['finance-settings',tenantId,clubId]});
      setFromDate('');
      toast.success('Finance year settings saved');
    } catch(e){ toast.error(e?.message || 'Could not save finance settings'); }
  };

  const saveVenue = async venue => {
    const hourly = Number(venueDraft.hourlyRate);
    if (!Number.isFinite(hourly) || hourly < 0) return toast.error('Enter a valid hourly hire rate.');
    try {
      await base44.entities.Venue.update(venue.id,{ address:venueDraft.address.trim(), hourly_hire_rate:hourly, currency:'EUR', finance_tracking_enabled:true });
      await queryClient.invalidateQueries({queryKey:['finance-venues',tenantId,clubId]});
      setEditingVenueId('');
      toast.success('Venue finance setup saved');
    } catch (e) { toast.error(e?.message || 'Could not save venue setup'); }
  };

  const addRule = async () => {
    const venue = venues.find(v=>v.id===ruleDraft.venueId);
    if (!venue) return toast.error('Choose a venue.');
    const duration = Number(ruleDraft.durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0) return toast.error('Enter the session duration in minutes.');
    const hourly = Number(venue.hourly_hire_rate);
    if (!Number.isFinite(hourly)) return toast.error('Set the venue hourly hire rate first.');
    const fee = ruleDraft.feePerPerson === '' ? null : Number(ruleDraft.feePerPerson);
    const startParts = ruleDraft.startTime.split(':').map(Number);
    const end = new Date(Date.UTC(2000,0,1,startParts[0]||0,startParts[1]||0));
    end.setUTCMinutes(end.getUTCMinutes()+duration);
    const endTime=`${String(end.getUTCHours()).padStart(2,'0')}:${String(end.getUTCMinutes()).padStart(2,'0')}`;
    try {
      await base44.entities.ClubFinanceVenueRule.create({
        tenant_id:tenantId, club_id:clubId, venue_id:venue.id, venue_name:venue.name,
        weekday:ruleDraft.weekday, session_label:ruleDraft.sessionLabel.trim() || `${ruleDraft.startTime} session`, start_time:ruleDraft.startTime, end_time:endTime,
        cost_type:'per_hour', cost_amount:hourly, duration_minutes:duration,
        ...(fee == null ? {} : {default_fee_per_person:fee}), income_source:ruleDraft.incomeSource,
        ...(ruleDraft.spondGroupId.trim()?{spond_group_id:ruleDraft.spondGroupId.trim()}:{}),
        ...(ruleDraft.spondEventId.trim()?{spond_event_id:ruleDraft.spondEventId.trim()}:{}),
        active:true, effective_from:settings?.tracking_start_date || fromDate,
        notes:'Venue cost is calculated from the venue hourly hire rate × session duration.'
      });
      await queryClient.invalidateQueries({queryKey:['finance-rules',tenantId,clubId]});
      setRuleDraft(d=>({...d,sessionLabel:'',spondEventId:''}));
      toast.success('Recurring session added');
    } catch (e) { toast.error(e?.message || 'Could not add recurring session'); }
  };

  const addManualEntry = async () => {
    const venue = venues.find(v=>v.id===manualDraft.venueId);
    if (!venue) return toast.error('Choose a venue.');
    const paidPlaces=Number(manualDraft.paidPlaces||0), fee=Number(manualDraft.feePerPerson||0), duration=Number(manualDraft.durationMinutes||0), other=Number(manualDraft.otherCost||0);
    const hourly=Number(venue.hourly_hire_rate);
    if (![paidPlaces,fee,duration,other,hourly].every(Number.isFinite) || duration<=0) return toast.error('Check the duration and amounts entered.');
    const cost=round2(hourly*(duration/60));
    const income=round2(paidPlaces*fee);
    try {
      await base44.entities.ClubFinanceEntry.create({
        tenant_id:tenantId,club_id:clubId,activity_date:manualDraft.date,venue_id:venue.id,venue_name:venue.name,session_label:manualDraft.label.trim()||'Manual event/session',
        source_type:'manual',source_id:`manual-${Date.now()}`,going_count:paidPlaces,declined_paid_count:0,paid_places:paidPlaces,fee_per_person:fee,income_amount:income,
        expected_cost_amount:cost,other_cost_amount:other,cost_status:'expected',financial_year_label:financeYearLabelFor(manualDraft.date,settings),notes:manualDraft.notes.trim(),last_synced_at:new Date().toISOString()
      });
      await queryClient.invalidateQueries({queryKey:['finance-entries',tenantId,clubId]});
      setManualDraft({date:todayIso(),venueId:'',label:'',durationMinutes:'180',paidPlaces:'',feePerPerson:'',otherCost:'0',notes:''});
      toast.success(`Recorded ${money(income-cost-other)} net result`);
    } catch (e) { toast.error(e?.message || 'Could not record finance entry'); }
  };

  const syncSpond = async () => {
    if (!listingSlug) return toast.error('No Spond-linked session is configured for this club.');
    setSyncing(true); setSyncMessage(''); setSyncResult(null);
    try {
      const res = await base44.functions.invoke('spondIntegrationWorking',{ action:'directory_finance_sync', listingSlug, fromDate, toDate });
      if (res.data?.error) throw new Error(res.data.error);
      setSyncResult(res.data);
      const fetched=Number(res.data.fetchedCount||0), matched=Number(res.data.matchedCount ?? res.data.synced?.length ?? 0), skipped=Number(res.data.skipped||0);
      if (matched > 0) setSyncMessage(`Spond connected. Found ${fetched} events · matched ${matched} · added ${res.data.created||0} · refreshed ${res.data.updated||0}${skipped?` · skipped ${skipped}`:''}.`);
      else if (fetched > 0) setSyncMessage(`Spond connected and returned ${fetched} events, but none could be turned into finance rows. See the explanation below.`);
      else setSyncMessage('Spond connected successfully, but no events were returned for this date range.');
      await queryClient.invalidateQueries({queryKey:['finance-entries',tenantId,clubId]});
      toast.success('Spond finance summary refreshed');
    } catch (e) { setSyncResult({error:e?.message || 'Spond sync failed'}); setSyncMessage(e?.message || 'Spond sync failed'); toast.error(e?.message || 'Spond sync failed'); }
    finally { setSyncing(false); }
  };

  if (!canManage) return <div className="p-6 text-sm text-muted-foreground">Finance Summary is available to club administrators.</div>;

  return <div className="space-y-6">
    <PageHeader title="Finance Summary" description="See whether each session, event, venue and month is making money or costing the club money.">
      <Badge variant="outline" className="gap-1"><WalletCards className="h-3.5 w-3.5" />Finance Lite</Badge>
    </PageHeader>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Income</p><p className="mt-1 text-2xl font-black">{money(totals.income)}</p></GlassCard>
      <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Venue cost</p><p className="mt-1 text-2xl font-black">{money(totals.cost)}</p></GlassCard>
      <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Other costs</p><p className="mt-1 text-2xl font-black">{money(totals.other)}</p></GlassCard>
      <GlassCard className={`p-4 ${totals.net < 0 ? 'border-red-500/30' : 'border-emerald-500/30'}`}><p className="text-xs text-muted-foreground">Overall result</p><p className={`mt-1 text-2xl font-black ${totals.net < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{totals.net < 0 ? '-' : '+'}{money(Math.abs(totals.net))}</p><p className="mt-1 text-[11px] text-muted-foreground">{totals.net < 0 ? 'Club subsidy' : totals.net > 0 ? 'Club surplus' : 'Break-even'}</p></GlassCard>
    </div>

    <GlassCard className="p-4 space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div><Label className="text-xs">From</Label><Input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="mt-1 w-40" /></div>
        <div><Label className="text-xs">To</Label><Input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="mt-1 w-40" /></div>
        <div className="min-w-52 flex-1"><Label className="text-xs">Venue</Label><Select value={venueFilter} onValueChange={setVenueFilter}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All venues</SelectItem>{venues.map(v=><SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="min-w-44"><Label className="text-xs">Month</Label><Select value={monthFilter} onValueChange={setMonthFilter}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All months</SelectItem>{months.map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
        {user?.role==='admin' && listingSlug && <Button onClick={syncSpond} disabled={syncing}><RefreshCw className={`mr-2 h-4 w-4 ${syncing?'animate-spin':''}`} />{syncing?'Syncing…':'Sync Spond'}</Button>}
      </div>
      <p className="text-xs text-muted-foreground">Financial year starts {monthsOfYear[Number(settings?.financial_year_start_month || 1)-1]} {Number(settings?.financial_year_start_day || 1)}. Tracking begins {settings?.tracking_start_date || 'when configured'}. {syncMessage && <span className="font-medium text-foreground">{syncMessage}</span>}</p>
    </GlassCard>

    {venueRollup.length>0 && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{venueRollup.map(v=><GlassCard key={v.venue} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{v.venue}</p><p className="text-xs text-muted-foreground">{v.count} sessions/events · Income {money(v.income)} · Cost {money(v.cost+v.other)}</p></div><ResultBadge value={round2(v.net)} /></div></GlassCard>)}</div>}

    {(monthRollup.length>0 || dayRollup.length>0) && <div className="grid gap-4 xl:grid-cols-2">
      <GlassCard className="overflow-hidden"><div className="p-4"><h2 className="font-bold">By month</h2><p className="text-xs text-muted-foreground">Monthly income, total cost and surplus/loss.</p></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="text-right">Income</TableHead><TableHead className="text-right">Cost</TableHead><TableHead>Result</TableHead></TableRow></TableHeader><TableBody>{monthRollup.map(row=><TableRow key={row.key}><TableCell className="font-medium">{row.key}</TableCell><TableCell className="text-right">{money(row.income)}</TableCell><TableCell className="text-right">{money(row.cost)}</TableCell><TableCell><ResultBadge value={round2(row.net)} /></TableCell></TableRow>)}</TableBody></Table></div></GlassCard>
      <GlassCard className="overflow-hidden"><div className="p-4"><h2 className="font-bold">By day</h2><p className="text-xs text-muted-foreground">Combines multiple sessions at the same venue on the same date.</p></div><div className="max-h-80 overflow-auto"><Table><TableHeader><TableRow><TableHead>Date / venue</TableHead><TableHead className="text-right">Income</TableHead><TableHead className="text-right">Cost</TableHead><TableHead>Result</TableHead></TableRow></TableHeader><TableBody>{dayRollup.slice(0,40).map(row=><TableRow key={row.key}><TableCell><p className="font-medium">{row.date}</p><p className="text-[11px] text-muted-foreground">{row.venue} · {row.count} rows</p></TableCell><TableCell className="text-right">{money(row.income)}</TableCell><TableCell className="text-right">{money(row.cost)}</TableCell><TableCell><ResultBadge value={round2(row.net)} /></TableCell></TableRow>)}</TableBody></Table></div></GlassCard>
    </div>}

    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between p-4"><div><h2 className="font-bold">Session & event results</h2><p className="text-xs text-muted-foreground">Green means the activity covered its costs. Red means the club subsidised it.</p></div><Badge variant="outline">{filtered.length} rows</Badge></div>
      <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Venue</TableHead><TableHead>Session/event</TableHead><TableHead className="text-right">Paid places</TableHead><TableHead className="text-right">Income</TableHead><TableHead className="text-right">Cost</TableHead><TableHead>Result</TableHead></TableRow></TableHeader><TableBody>
        {isLoading ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Loading finance summary…</TableCell></TableRow> : filtered.length===0 ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No finance rows yet for this range.</TableCell></TableRow> : filtered.map(row=>{ const net=netFor(row); const cost=(row.actual_cost_amount==null?Number(row.expected_cost_amount||0):Number(row.actual_cost_amount||0))+Number(row.other_cost_amount||0); return <TableRow key={row.id}><TableCell className="whitespace-nowrap">{row.activity_date}{row.activity_start_time?` · ${row.activity_start_time}`:''}</TableCell><TableCell>{row.venue_name}</TableCell><TableCell><p className="font-medium">{row.session_label}</p><p className="text-[11px] text-muted-foreground">{row.source_type==='spond_session'?'Spond':row.source_type==='rallyhub_event'?'RallyHub':'Manual'}{row.declined_paid_count>0?` · ${row.declined_paid_count} paid then declined`:''}</p></TableCell><TableCell className="text-right">{Number(row.paid_places||0)}</TableCell><TableCell className="text-right font-medium">{money(row.income_amount)}</TableCell><TableCell className="text-right">{money(cost)}</TableCell><TableCell><ResultBadge value={net} /></TableCell></TableRow>; })}
      </TableBody></Table></div>
    </GlassCard>

    <GlassCard className="p-4 space-y-3">
      <div><h2 className="font-bold">Club finance settings</h2><p className="text-xs text-muted-foreground">Tenant-specific reporting period. Each club can choose its own financial year and tracking start date.</p></div>
      <div className="grid gap-3 sm:grid-cols-[180px_120px_190px_auto] sm:items-end">
        <div><Label className="text-xs">Financial year starts</Label><Select value={settingsDraft.startMonth} onValueChange={v=>setSettingsDraft(d=>({...d,startMonth:v}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{monthsOfYear.map((m,i)=><SelectItem key={m} value={String(i+1)}>{m}</SelectItem>)}</SelectContent></Select></div>
        <div><Label className="text-xs">Day</Label><Input className="mt-1" type="number" min="1" max="31" value={settingsDraft.startDay} onChange={e=>setSettingsDraft(d=>({...d,startDay:e.target.value}))} /></div>
        <div><Label className="text-xs">Track from</Label><Input className="mt-1" type="date" value={settingsDraft.trackingStart} onChange={e=>setSettingsDraft(d=>({...d,trackingStart:e.target.value}))} /></div>
        <Button onClick={saveSettings}><Save className="mr-2 h-4 w-4" />Save settings</Button>
      </div>
    </GlassCard>

    <div className="grid gap-4 xl:grid-cols-2">
      <GlassCard className="p-4 space-y-4">
        <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /><div><h2 className="font-bold">Venue costs</h2><p className="text-xs text-muted-foreground">Set each hall once: address + hourly hire rate. All session costs are calculated from it.</p></div></div>
        <div className="space-y-3">{venues.map(venue=>{
          const editing=editingVenueId===venue.id;
          return <div key={venue.id} className="rounded-lg border border-border p-3"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold">{venue.name}</p><p className="text-xs text-muted-foreground">{venue.address||'No address set'}</p><p className="mt-1 text-sm font-bold">{venue.hourly_hire_rate==null?'Rate not set':`${money(venue.hourly_hire_rate)} / hour`}</p></div>{!editing?<Button size="sm" variant="outline" onClick={()=>{setEditingVenueId(venue.id);setVenueDraft({address:venue.address||'',hourlyRate:venue.hourly_hire_rate??''});}}>Edit</Button>:<Button size="sm" onClick={()=>saveVenue(venue)}><Save className="mr-1 h-3.5 w-3.5" />Save</Button>}</div>{editing&&<div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px]"><div><Label className="text-xs">Hall address</Label><Input className="mt-1" value={venueDraft.address} onChange={e=>setVenueDraft(d=>({...d,address:e.target.value}))} /></div><div><Label className="text-xs">Hire rate / hour (€)</Label><Input className="mt-1" type="number" min="0" step="0.01" value={venueDraft.hourlyRate} onChange={e=>setVenueDraft(d=>({...d,hourlyRate:e.target.value}))} /></div></div>}</div>;
        })}</div>
      </GlassCard>

      <GlassCard className="p-4 space-y-4">
        <div className="flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /><div><h2 className="font-bold">Recurring session setup</h2><p className="text-xs text-muted-foreground">Choose the venue, day and duration. The hall cost comes from the venue hourly rate.</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label className="text-xs">Venue</Label><Select value={ruleDraft.venueId} onValueChange={v=>setRuleDraft(d=>({...d,venueId:v}))}><SelectTrigger className="mt-1"><SelectValue placeholder="Choose venue" /></SelectTrigger><SelectContent>{venues.map(v=><SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">Day</Label><Select value={ruleDraft.weekday} onValueChange={v=>setRuleDraft(d=>({...d,weekday:v}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{weekdays.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">Start time</Label><Input className="mt-1" type="time" value={ruleDraft.startTime} onChange={e=>setRuleDraft(d=>({...d,startTime:e.target.value}))} /></div>
          <div><Label className="text-xs">Duration (minutes)</Label><Input className="mt-1" type="number" min="15" step="15" value={ruleDraft.durationMinutes} onChange={e=>setRuleDraft(d=>({...d,durationMinutes:e.target.value}))} /></div>
          <div><Label className="text-xs">Player fee (€)</Label><Input className="mt-1" type="number" min="0" step="0.01" value={ruleDraft.feePerPerson} onChange={e=>setRuleDraft(d=>({...d,feePerPerson:e.target.value}))} placeholder="Optional" /></div>
          <div><Label className="text-xs">Income source</Label><Select value={ruleDraft.incomeSource} onValueChange={v=>setRuleDraft(d=>({...d,incomeSource:v}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="spond">Spond</SelectItem><SelectItem value="rallyhub">RallyHub</SelectItem><SelectItem value="manual">Manual</SelectItem></SelectContent></Select></div>
          <div className="sm:col-span-2"><Label className="text-xs">Session label</Label><Input className="mt-1" value={ruleDraft.sessionLabel} onChange={e=>setRuleDraft(d=>({...d,sessionLabel:e.target.value}))} placeholder="e.g. Social 7:00–8:30" /></div>
        </div>
        <Button onClick={addRule}><Plus className="mr-2 h-4 w-4" />Add recurring session</Button>
        {rules.length>0 && <div className="space-y-2 border-t border-border pt-3">{rules.filter(r=>r.active!==false).map(rule=>{const venue=venues.find(v=>v.id===rule.venue_id);const expected=round2(Number(venue?.hourly_hire_rate ?? rule.cost_amount ?? 0)*(Number(rule.duration_minutes||0)/60));return <div key={rule.id} className="flex items-center justify-between gap-3 rounded-md bg-secondary/40 px-3 py-2 text-xs"><span><strong>{rule.venue_name}</strong> · {rule.weekday} {rule.start_time} · {rule.duration_minutes} min</span><span className="font-semibold">Expected hall cost {money(expected)}</span></div>;})}</div>}
      </GlassCard>
    </div>

    <GlassCard className="p-4 space-y-4">
      <div className="flex items-center gap-2"><Euro className="h-4 w-4 text-primary" /><div><h2 className="font-bold">Record one-off event or adjustment</h2><p className="text-xs text-muted-foreground">For interclub days, special events, invoices or anything not covered by a recurring session.</p></div></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><Label className="text-xs">Date</Label><Input className="mt-1" type="date" value={manualDraft.date} onChange={e=>setManualDraft(d=>({...d,date:e.target.value}))} /></div>
        <div><Label className="text-xs">Venue</Label><Select value={manualDraft.venueId} onValueChange={v=>setManualDraft(d=>({...d,venueId:v}))}><SelectTrigger className="mt-1"><SelectValue placeholder="Choose venue" /></SelectTrigger><SelectContent>{venues.map(v=><SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="lg:col-span-2"><Label className="text-xs">Event/session label</Label><Input className="mt-1" value={manualDraft.label} onChange={e=>setManualDraft(d=>({...d,label:e.target.value}))} placeholder="e.g. Clare v Galway" /></div>
        <div><Label className="text-xs">Duration (minutes)</Label><Input className="mt-1" type="number" min="15" step="15" value={manualDraft.durationMinutes} onChange={e=>setManualDraft(d=>({...d,durationMinutes:e.target.value}))} /></div>
        <div><Label className="text-xs">Paid places</Label><Input className="mt-1" type="number" min="0" value={manualDraft.paidPlaces} onChange={e=>setManualDraft(d=>({...d,paidPlaces:e.target.value}))} /></div>
        <div><Label className="text-xs">Fee / person (€)</Label><Input className="mt-1" type="number" min="0" step="0.01" value={manualDraft.feePerPerson} onChange={e=>setManualDraft(d=>({...d,feePerPerson:e.target.value}))} /></div>
        <div><Label className="text-xs">Other costs (€)</Label><Input className="mt-1" type="number" min="0" step="0.01" value={manualDraft.otherCost} onChange={e=>setManualDraft(d=>({...d,otherCost:e.target.value}))} /></div>
      </div>
      {manualDraft.venueId && <p className="text-xs text-muted-foreground">Expected venue cost: <strong className="text-foreground">{money(Number(venues.find(v=>v.id===manualDraft.venueId)?.hourly_hire_rate||0)*(Number(manualDraft.durationMinutes||0)/60))}</strong> from hourly rate × duration.</p>}
      <Button onClick={addManualEntry}><Plus className="mr-2 h-4 w-4" />Record event/session</Button>
    </GlassCard>
  </div>;
}
