import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, ChevronRight, CircleUserRound, MapPin, MessageCircle,
  ShoppingBag, Trophy, UserRound, Shield, Sparkles, Medal,
  Clock3, CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/shared/GlassCard';
import MemberPerformanceSummary from '@/components/member/MemberPerformanceSummary';
import { getClub } from '@/data/directorySeed';

function formatActivityDate(value) {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date to be confirmed';
  return date.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatActivityTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });
}

function sourceLabel(item) {
  return item?.source === 'spond' ? 'Spond' : 'RallyHub';
}

function responseLabel(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'accepted') return 'Going';
  if (value === 'waiting') return 'Waiting list';
  if (value === 'declined') return 'Declined';
  if (value === 'unanswered') return 'Response needed';
  if (value === 'entered') return 'You’re entered';
  return value ? value.replaceAll('_', ' ') : null;
}

function Avatar({ snapshot, size = 'lg' }) {
  const url = snapshot?.person?.profile_photo_url || snapshot?.player?.avatar_url || null;
  const name = snapshot?.person?.preferred_name || snapshot?.person?.full_name || snapshot?.player?.full_name || snapshot?.user?.full_name || 'Member';
  const initials = String(name).split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const classes = size === 'lg' ? 'w-16 h-16 text-lg' : 'w-10 h-10 text-sm';
  if (url) return <img src={url} alt={`${name} profile`} className={`${classes} rounded-full object-cover border-2 border-primary/30 bg-secondary`} />;
  return <div className={`${classes} rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center justify-center font-black`}>{initials}</div>;
}

export default function MemberDashboardView({ snapshot, play = null, playLoading = false, performance = null, performanceLoading = false, preview = false, onOpenShop = null, onOpenMessages = null }) {
  if (!snapshot) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">No member data available.</div>;

  const { user, player, person, member, club, myCompetitions = [], clubLeaderboard = [] } = snapshot;
  const directoryClub = club?.slug ? getClub(club.slug) : null;
  const sportName = directoryClub?.sport || 'Sport';
  const activities = play?.items || [];
  const nextActivity = activities[0] || null;
  const nextFew = activities.slice(0, 4);
  const myLeaderboardRow = clubLeaderboard.find(row => String(row.player_id) === String(player?.id || '')) || null;
  const name = person?.preferred_name || person?.full_name || player?.full_name || user?.full_name || user?.email || 'Member';
  const firstName = String(name).trim().split(/\s+/)[0] || 'Member';
  const hasPhoto = !!(person?.profile_photo_url || player?.avatar_url);
  const profileNeedsAttention = (snapshot.profileCompletion || 0) < 100 || !hasPhoto;
  const membershipStatus = member?.membership_status ? String(member.membership_status).replaceAll('_', ' ') : null;
  const paymentStatus = member?.payment_status ? String(member.payment_status).replaceAll('_', ' ') : null;

  const heroStyle = club?.primary_colour
    ? { backgroundImage: `linear-gradient(135deg, ${club.primary_colour}26, transparent 55%)` }
    : undefined;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0 max-w-6xl mx-auto">
      {preview && (
        <div className="rounded-xl border border-amber-400/50 bg-amber-500/10 p-4 flex items-start gap-3" data-testid="member-preview-banner">
          <Shield className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-foreground">Super Admin · Member Preview</p>
            <p className="text-sm text-muted-foreground">Read-only preview. Your administrator session has not changed.</p>
          </div>
        </div>
      )}

      <section className="glass rounded-2xl p-4 sm:p-6 overflow-hidden" style={heroStyle}>
        <div className="flex items-center gap-4">
          <Avatar snapshot={snapshot} />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{club?.name || 'RallyHub'}</p>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1 truncate">Hi {firstName}</h1>
            <p className="text-sm text-muted-foreground mt-1">Your club, calendar and competition life in one place.</p>
          </div>
          {club?.logo_url && <img src={club.logo_url} alt={club?.name || 'Club'} className="hidden sm:block h-14 w-14 object-contain" />}
        </div>

        {profileNeedsAttention && !preview && (
          <Link to="/app/my-profile" className="mt-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 hover:bg-primary/10 transition-colors">
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Complete your member profile</p>
              <p className="text-xs text-muted-foreground">{!hasPhoto ? 'Add your profile photo and check your details.' : `${snapshot.profileCompletion || 0}% complete`}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary" />
          </Link>
        )}
      </section>

      <MemberPerformanceSummary performance={performance} loading={performanceLoading} />

      <section>
        {preview && onOpenMessages ? (
          <button type="button" onClick={onOpenMessages} className="w-full glass rounded-2xl p-4 sm:p-5 text-left flex items-center gap-4 hover:bg-secondary/50 transition-colors">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><MessageCircle className="w-5 h-5 text-primary" /></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-black">Need help? Message Brian</p><p className="text-xs text-muted-foreground mt-1">Private message to the Clare Pickleball Chairperson. Your contact details stay private.</p></div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        ) : (
          <Link to="/app/messages" className="glass rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><MessageCircle className="w-5 h-5 text-primary" /></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-black">Need help? Message Brian</p><p className="text-xs text-muted-foreground mt-1">Private message to the Clare Pickleball Chairperson. Your contact details stay private.</p></div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </Link>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-foreground">Next up</h2>
          <Link to="/app/play" className="text-xs text-primary font-semibold">View Play</Link>
        </div>
        <GlassCard className="p-0 overflow-hidden">
          {playLoading ? (
            <div className="p-5 text-sm text-muted-foreground">Checking your upcoming activity…</div>
          ) : nextActivity ? (
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase text-muted-foreground">{formatActivityDate(nextActivity.start).split(' ')[0]}</span>
                  <span className="text-lg font-black text-primary">{new Date(nextActivity.start).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground truncate">{nextActivity.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{formatActivityDate(nextActivity.start)}{formatActivityTime(nextActivity.start) ? ` · ${formatActivityTime(nextActivity.start)}` : ''}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{sourceLabel(nextActivity)}</Badge>
                  </div>
                  {nextActivity.venue && <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />{nextActivity.venue}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {responseLabel(nextActivity.response_status) && <Badge className="bg-primary/15 text-primary text-[10px]">{responseLabel(nextActivity.response_status)}</Badge>}
                    <Link to="/app/play" className="text-xs text-primary font-semibold inline-flex items-center gap-1">Details <ChevronRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 text-center">
              <CalendarDays className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold">Nothing upcoming yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your invited sessions and competition entries will appear here.</p>
            </div>
          )}
        </GlassCard>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/app/play" className="glass rounded-xl p-4 hover:bg-secondary/60 transition-colors">
          <CalendarDays className="w-5 h-5 text-primary mb-3" />
          <p className="text-sm font-bold">Calendar</p>
          <p className="text-[11px] text-muted-foreground mt-1">My activity</p>
        </Link>
        <Link to="/app/venues" className="glass rounded-xl p-4 hover:bg-secondary/60 transition-colors">
          <MapPin className="w-5 h-5 text-primary mb-3" />
          <p className="text-sm font-bold">Venues</p>
          <p className="text-[11px] text-muted-foreground mt-1">Times & directions</p>
        </Link>
        <Link to="/app/my-profile" className="glass rounded-xl p-4 hover:bg-secondary/60 transition-colors">
          <Trophy className="w-5 h-5 text-primary mb-3" />
          <p className="text-sm font-bold">My results</p>
          <p className="text-[11px] text-muted-foreground mt-1">Competitions & form</p>
        </Link>
        {directoryClub?.shopUrl ? (
          preview && onOpenShop ? (
            <button type="button" onClick={onOpenShop} className="glass rounded-xl p-4 hover:bg-secondary/60 transition-colors text-left">
              <ShoppingBag className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm font-bold">Club shop</p>
              <p className="text-[11px] text-muted-foreground mt-1">Gear, sizes & offers</p>
            </button>
          ) : (
            <Link to="/app/shop" className="glass rounded-xl p-4 hover:bg-secondary/60 transition-colors">
              <ShoppingBag className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm font-bold">Club shop</p>
              <p className="text-[11px] text-muted-foreground mt-1">Gear, sizes & offers</p>
            </Link>
          )
        ) : (
          <Link to="/app/learn" className="glass rounded-xl p-4 hover:bg-secondary/60 transition-colors">
            <ShoppingBag className="w-5 h-5 text-primary mb-3" />
            <p className="text-sm font-bold">Club links</p>
            <p className="text-[11px] text-muted-foreground mt-1">Resources & more</p>
          </Link>
        )}
      </section>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-5">
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2"><Clock3 className="w-4 h-4 text-primary" /> Coming up</h2>
              <p className="text-xs text-muted-foreground mt-1">Only activity relevant to you.</p>
            </div>
            <Link to="/app/play" className="text-xs text-primary font-semibold">See all</Link>
          </div>
          <div className="space-y-2">
            {nextFew.length === 0 && <p className="text-sm text-muted-foreground py-5 text-center">No upcoming activity.</p>}
            {nextFew.map(item => (
              <Link key={item.id} to="/app/play" className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-secondary/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0"><CalendarDays className="w-4 h-4 text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{formatActivityDate(item.start)} · {formatActivityTime(item.start)}{item.venue ? ` · ${item.venue}` : ''}</p>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex text-[9px]">{sourceLabel(item)}</Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2"><Medal className="w-4 h-4 text-primary" /> My {sportName}</h2>
              <p className="text-xs text-muted-foreground mt-1">Membership and competition snapshot.</p>
            </div>
            <Link to="/app/my-profile" className="text-xs text-primary font-semibold">Open</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Membership</p>
              <p className="text-sm font-bold capitalize mt-1">{membershipStatus || '—'}</p>
              {paymentStatus && <p className="text-[11px] text-muted-foreground capitalize mt-0.5">Payment {paymentStatus}</p>}
            </div>
            <div className="rounded-xl bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Leaderboard</p>
              <p className="text-xl font-black mt-1">{myLeaderboardRow?.rank ? `#${myLeaderboardRow.rank}` : '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{myLeaderboardRow?.leaderboard_points || 0} pts</p>
            </div>
            <div className="rounded-xl bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Competitions</p>
              <p className="text-xl font-black mt-1">{myCompetitions.length}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Upcoming</p>
            </div>
            <div className="rounded-xl bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Rating</p>
              <p className="text-xl font-black mt-1">{player?.dupr_rating != null ? Number(player.dupr_rating).toFixed(3) : player?.skill_rating != null ? Number(player.skill_rating).toFixed(1) : '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{player?.dupr_rating != null ? 'DUPR' : 'Club rating'}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <section className="grid sm:grid-cols-2 gap-3">
        <Link to="/app/learn" className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><UserRound className="w-5 h-5 text-primary" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Learn & resources</p>
            <p className="text-xs text-muted-foreground">Guides, coaching, rules and club information.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
        <Link to="/app/venues" className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-primary" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Venues & weekly play</p>
            <p className="text-xs text-muted-foreground">Addresses, regular session times and map directions.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </section>

      {play?.spond?.status === 'identity_not_matched' && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-3 flex items-start gap-2">
          <CircleUserRound className="w-4 h-4 text-amber-500 mt-0.5" />
          <p className="text-xs text-muted-foreground">Your club uses Spond, but RallyHub has not safely matched your Spond identity yet. No Spond sessions are being shown until that match is confirmed.</p>
        </div>
      )}

      {play?.spond?.status === 'connected' && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Personal Spond feed connected. Only sessions linked to your Spond invitation/response are shown.</p>
      )}
    </div>
  );
}
