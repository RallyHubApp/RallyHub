import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, Trophy, Swords, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import GlassCard from '@/components/shared/GlassCard';

const COLORS = ['hsl(142, 76%, 50%)', 'hsl(210, 100%, 56%)', 'hsl(270, 76%, 60%)', 'hsl(45, 93%, 58%)', 'hsl(0, 72%, 56%)'];

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(220 18% 8%)',
    border: '1px solid hsl(220 14% 16%)',
    borderRadius: 8,
    color: 'hsl(210 20% 95%)',
    fontSize: 12
  }
};

export default function Analytics() {
  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('-created_date', 200)
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => base44.entities.Tournament.list('-created_date', 100)
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-created_date', 200)
  });

  // Club distribution
  const clubCounts = {};
  players.forEach(p => {
    const club = p.club || 'No Club';
    clubCounts[club] = (clubCounts[club] || 0) + 1;
  });
  const clubData = Object.entries(clubCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Rating distribution
  const ratingBuckets = { '2.0-2.9': 0, '3.0-3.4': 0, '3.5-3.9': 0, '4.0-4.4': 0, '4.5-4.9': 0, '5.0+': 0 };
  players.forEach(p => {
    const r = p.skill_rating || 3.0;
    if (r < 3.0) ratingBuckets['2.0-2.9']++;
    else if (r < 3.5) ratingBuckets['3.0-3.4']++;
    else if (r < 4.0) ratingBuckets['3.5-3.9']++;
    else if (r < 4.5) ratingBuckets['4.0-4.4']++;
    else if (r < 5.0) ratingBuckets['4.5-4.9']++;
    else ratingBuckets['5.0+']++;
  });
  const ratingData = Object.entries(ratingBuckets).map(([range, count]) => ({ range, count }));

  // Gender distribution
  const genderCounts = {};
  players.forEach(p => {
    const g = p.gender || 'Unknown';
    genderCounts[g] = (genderCounts[g] || 0) + 1;
  });
  const genderData = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));

  // Tournament format distribution
  const formatCounts = {};
  tournaments.forEach(t => {
    formatCounts[t.format] = (formatCounts[t.format] || 0) + 1;
  });
  const formatData = Object.entries(formatCounts).map(([name, value]) => ({ name, value }));

  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === 'Completed').length;
  const avgRating = players.length > 0 ? (players.reduce((s, p) => s + (p.skill_rating || 3.0), 0) / players.length).toFixed(1) : '—';

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Platform performance insights" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Players" value={players.length} icon={Users} accentColor="primary" delay={0} />
        <StatCard title="Total Matches" value={totalMatches} icon={Swords} accentColor="accent" delay={0.1} />
        <StatCard title="Avg Rating" value={avgRating} icon={TrendingUp} accentColor="chart-3" delay={0.2} />
        <StatCard title="Completion Rate" value={totalMatches ? `${Math.round((completedMatches / totalMatches) * 100)}%` : '—'} icon={Target} accentColor="chart-4" delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <GlassCard delay={0.2}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ratingData}>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'hsl(215 14% 50%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215 14% 50%)' }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="hsl(142, 76%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Club Distribution */}
        <GlassCard delay={0.25}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Players by Club</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clubData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215 14% 50%)' }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: 'hsl(215 14% 50%)' }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill="hsl(210, 100%, 56%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Gender Distribution */}
        <GlassCard delay={0.3}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Tournament Formats */}
        <GlassCard delay={0.35}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Tournament Formats</h3>
          {formatData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No tournaments yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={formatData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`}>
                  {formatData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>
    </div>
  );
}