import React, { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronRight, CircleUserRound, Trophy, Users, UserRound, Shield, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';

const labelValue = (label, value) => ({ label, value: value || '—' });

function formatDate(value) {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value + (String(value).length === 10 ? 'T12:00:00' : ''));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MemberDashboardView({ snapshot, preview = false }) {
  const [playerSearch, setPlayerSearch] = useState('');
  if (!snapshot) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">No member data available.</div>;

  const { user, player, person, member, club, myCompetitions = [], clubCalendar = [], playerDirectory = [] } = snapshot;
  const name = person?.preferred_name || person?.full_name || player?.full_name || user?.full_name || user?.email || 'Member';
  const filteredPlayers = useMemo(() => {
    const q = playerSearch.trim().toLowerCase();
    if (!q) return playerDirectory.slice(0, 12);
    return playerDirectory.filter(p => String(p.full_name || '').toLowerCase().includes(q)).slice(0, 20);
  }, [playerDirectory, playerSearch]);

  const profileRows = [
    labelValue('Full name', person?.full_name || player?.full_name || user?.full_name),
    labelValue('Email', person?.primary_email || player?.email || user?.email),
    labelValue('Mobile', person?.mobile || player?.phone || member?.mobile),
    labelValue('Date of birth', person?.date_of_birth || member?.date_of_birth),
    labelValue('Address', person?.full_postal_address || [person?.address_line1, person?.address_line2, person?.town_city, person?.county_region, person?.postal_code].filter(Boolean).join(', ')),
    labelValue('Emergency contact', person?.emergency_contact_name || member?.emergency_contact),
    labelValue('Membership', member?.membership_status ? String(member.membership_status).replaceAll('_', ' ') : null),
    labelValue('Membership ID', member?.club_membership_id),
    labelValue('DUPR ID', player?.dupr_id),
    labelValue('DUPR rating', player?.dupr_rating != null ? Number(player.dupr_rating).toFixed(3) : null),
  ];

  return (
    <div className="space-y-6">
      {preview && (
        <div className="rounded-xl border border-amber-400/50 bg-amber-500/10 p-4 flex items-start gap-3" data-testid="member-preview-banner">
          <Shield className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-foreground">Super Admin · Member Preview</p>
            <p className="text-sm text-muted-foreground">Read-only preview of the member experience. You are still signed in as Super Admin and are not impersonating this member.</p>
          </div>
        </div>
      )}

      <PageHeader title={`Welcome, ${name}`} description={club?.name ? `${club.name} member dashboard` : 'Your RallyHub member dashboard'} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Profile complete</p>
          <p className="text-2xl font-black text-primary mt-1">{snapshot.profileCompletion || 0}%</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">DUPR</p>
          <p className="text-2xl font-black text-foreground mt-1">{player?.dupr_rating != null ? Number(player.dupr_rating).toFixed(3) : '—'}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">My competitions</p>
          <p className="text-2xl font-black text-foreground mt-1">{myCompetitions.length}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Club players</p>
          <p className="text-2xl font-black text-foreground mt-1">{playerDirectory.length}</p>
        </GlassCard>
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <GlassCard>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold flex items-center gap-2"><UserRound className="w-4 h-4 text-primary" /> My profile</h3>
              <p className="text-xs text-muted-foreground mt-1">The personal and membership information RallyHub currently holds.</p>
            </div>
            {!preview && <Link to="/app/my-profile"><Button size="sm" variant="outline">Update profile</Button></Link>}
          </div>
          <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3">
            {profileRows.map(row => (
              <div key={row.label} className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{row.label}</p>
                <p className="text-sm text-foreground mt-0.5 break-words capitalize">{row.value}</p>
              </div>
            ))}
          </div>
          {member?.payment_status && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Membership payment status: <strong className="text-foreground capitalize">{String(member.payment_status).replaceAll('_',' ')}</strong>
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> My upcoming competitions</h3>
              <p className="text-xs text-muted-foreground mt-1">Competitions where this member is already entered.</p>
            </div>
          </div>
          <div className="space-y-2">
            {myCompetitions.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No upcoming competition entries yet.</p>}
            {myCompetitions.slice(0, 8).map(event => (
              <div key={event.id} className="rounded-lg border border-border bg-secondary/30 p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{event.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(event.start_date)}{event.location ? ` · ${event.location}` : ''}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{event.status || event.format || 'Competition'}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Club calendar</h3>
            <p className="text-xs text-muted-foreground mt-1">Upcoming RallyHub competitions and club events. Directory and broader event feeds can plug into this same calendar.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {clubCalendar.length === 0 && <p className="text-sm text-muted-foreground py-6">Nothing upcoming has been published yet.</p>}
          {clubCalendar.slice(0, 10).map(event => (
            <div key={event.id} className="rounded-lg border border-border p-3 flex items-start gap-3">
              <div className="w-12 text-center shrink-0">
                <p className="text-[10px] uppercase text-muted-foreground">{event.start_date ? new Date(event.start_date + 'T12:00:00').toLocaleDateString('en-IE',{month:'short'}) : 'TBC'}</p>
                <p className="text-xl font-black text-primary">{event.start_date ? new Date(event.start_date + 'T12:00:00').getDate() : '—'}</p>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{event.name}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                  {event.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                  {event.entered && <Badge className="text-[10px] bg-primary/15 text-primary">You’re entered</Badge>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Player directory</h3>
            <p className="text-xs text-muted-foreground mt-1">Club-visible player information only. Personal email, mobile and address details are not exposed here.</p>
          </div>
          <Input value={playerSearch} onChange={e => setPlayerSearch(e.target.value)} placeholder="Search players…" className="sm:w-64 bg-secondary" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredPlayers.map(p => (
            <div key={p.id} className="rounded-lg border border-border bg-secondary/20 p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><CircleUserRound className="w-5 h-5 text-primary" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{p.full_name}</p>
                <p className="text-xs text-muted-foreground">{p.dupr_rating != null ? `DUPR ${Number(p.dupr_rating).toFixed(3)}` : p.skill_rating != null ? `Club rating ${Number(p.skill_rating).toFixed(1)}` : 'Rating not added'}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
