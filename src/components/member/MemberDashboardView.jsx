import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronRight, CircleUserRound, Crown, Trophy, Users, UserRound, Shield, MapPin } from 'lucide-react';
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
  const playerDirectory = snapshot?.playerDirectory || [];
  const filteredPlayers = useMemo(() => {
    const q = playerSearch.trim().toLowerCase();
    if (!q) return playerDirectory.slice(0, 12);
    return playerDirectory.filter(p => String(p.full_name || '').toLowerCase().includes(q)).slice(0, 20);
  }, [playerDirectory, playerSearch]);
  if (!snapshot) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">No member data available.</div>;

  const { user, player, person, member, club, myCompetitions = [], clubCalendar = [], clubLeaderboard = [] } = snapshot;
  const myLeaderboardRow = clubLeaderboard.find(row => String(row.player_id) === String(player?.id || '')) || null;
  const name = person?.preferred_name || person?.full_name || player?.full_name || user?.full_name || user?.email || 'Member';

  const profileGroups = [
    {
      title: 'Personal details',
      editable: true,
      rows: [
        labelValue('Full name', person?.full_name || player?.full_name || user?.full_name),
        labelValue('Preferred name', person?.preferred_name),
        labelValue('Email', person?.primary_email || player?.email || user?.email),
        labelValue('Mobile', person?.mobile || player?.phone || member?.mobile),
        labelValue('Date of birth', person?.date_of_birth || member?.date_of_birth),
        labelValue('Gender', person?.gender || player?.gender),
      ],
    },
    {
      title: 'Address & communication',
      editable: true,
      rows: [
        labelValue('Address line 1', person?.address_line1 || person?.full_postal_address),
        labelValue('Address line 2', person?.address_line2),
        labelValue('Town / city', person?.town_city),
        labelValue('County / region', person?.county_region),
        labelValue('Eircode / postcode', person?.postal_code),
        labelValue('Country', person?.country),
        labelValue('Preferred language', person?.preferred_language),
        labelValue('Communication preference', person?.communication_preference),
        labelValue('Profile visibility', person?.profile_visibility),
        labelValue('Photo visibility', person?.photo_visibility),
      ],
    },
    {
      title: 'Emergency contacts',
      editable: true,
      rows: [
        labelValue('Primary contact', person?.emergency_contact_name || member?.emergency_contact),
        labelValue('Relationship', person?.emergency_contact_relationship),
        labelValue('Primary mobile', person?.emergency_mobile || member?.emergency_mobile),
        labelValue('Secondary contact', person?.secondary_emergency_contact_name),
        labelValue('Secondary mobile', person?.secondary_emergency_contact_mobile),
      ],
    },
    {
      title: 'Playing profile',
      editable: true,
      rows: [
        labelValue('DUPR ID', player?.dupr_id),
        labelValue('DUPR rating', player?.dupr_rating != null ? Number(player.dupr_rating).toFixed(3) : null),
        labelValue('Club rating', player?.skill_rating != null ? Number(player.skill_rating).toFixed(1) : null),
        labelValue('Age group', player?.age_group),
        labelValue('Preferred side', player?.preferred_position),
        labelValue('Player status', player?.status),
      ],
    },
    {
      title: 'Membership',
      editable: false,
      rows: [
        labelValue('Season', member?.membership_season),
        labelValue('Membership status', member?.membership_status ? String(member.membership_status).replaceAll('_', ' ') : null),
        labelValue('Membership ID', member?.club_membership_id),
        labelValue('Membership type', member?.membership_type),
        labelValue('Payment status', member?.payment_status ? String(member.payment_status).replaceAll('_', ' ') : null),
        labelValue('Payment date', member?.payment_date),
        labelValue('Membership amount', member?.membership_amount != null ? `€${Number(member.membership_amount).toFixed(2)}` : null),
      ],
    },
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
          <div className="space-y-5">
            {profileGroups.map(group => (
              <div key={group.title} className="pt-4 first:pt-0 border-t first:border-t-0 border-border">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</h4>
                  <Badge variant="outline" className={group.editable ? 'text-[10px] border-primary/30 text-primary' : 'text-[10px]'}>
                    {group.editable ? 'Member editable' : 'Club managed'}
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3">
                  {group.rows.map(row => (
                    <div key={`${group.title}-${row.label}`} className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{row.label}</p>
                      <p className="text-sm text-foreground mt-0.5 break-words capitalize">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
            <h3 className="font-bold flex items-center gap-2"><Crown className="w-4 h-4 text-primary" /> Club leaderboard</h3>
            <p className="text-xs text-muted-foreground mt-1">Competition performance across RallyHub events that count toward the club leaderboard.</p>
          </div>
          {myLeaderboardRow && <Badge className="bg-primary/15 text-primary">Your rank #{myLeaderboardRow.rank}</Badge>}
        </div>
        <div className="space-y-2">
          {clubLeaderboard.length === 0 && <p className="text-sm text-muted-foreground py-5 text-center">No eligible competition results yet.</p>}
          {clubLeaderboard.slice(0, 8).map(row => (
            <div key={row.player_id} className={`rounded-lg border p-3 flex items-center gap-3 ${String(row.player_id) === String(player?.id || '') ? 'border-primary/40 bg-primary/5' : 'border-border bg-secondary/20'}`}>
              <span className="w-7 text-center text-sm font-black text-muted-foreground">{row.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{row.full_name}</p>
                <p className="text-xs text-muted-foreground">{row.wins}W · {row.draws || 0}D · {row.losses}L · {row.matches_played} matches</p>
              </div>
              <span className="text-sm font-black text-primary">{row.leaderboard_points} pts</span>
            </div>
          ))}
        </div>
      </GlassCard>

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
