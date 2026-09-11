import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Medal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

const podiumColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export default function Leaderboard() {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [clubFilter, setClubFilter] = useState('all');

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('full_name', 500)
  });

  const clubs = [...new Set(players.map(p => p.club).filter(Boolean))];

  const sorted = [...players]
    .filter(p => {
      const matchSearch = !search || p.full_name?.toLowerCase().includes(search.toLowerCase());
      const matchGender = genderFilter === 'all' || p.gender === genderFilter;
      const matchClub = clubFilter === 'all' || p.club === clubFilter;
      return matchSearch && matchGender && matchClub;
    })
    .sort((a, b) => {
      const ar = a.dupr_rating != null, br = b.dupr_rating != null;
      if (ar !== br) return Number(br) - Number(ar);
      if (ar && br && Number(a.dupr_rating) !== Number(b.dupr_rating)) return Number(b.dupr_rating) - Number(a.dupr_rating);
      return String(a.full_name || '').localeCompare(String(b.full_name || ''));
    });

  const rated = sorted.filter(p => p.dupr_rating != null);
  const top3 = rated.length >= 3 ? rated.slice(0, 3) : [];
  const top3Ids = new Set(top3.map(p => p.id));
  const rest = sorted.filter(p => !top3Ids.has(p.id));

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" description="Club player order — DUPR shown only where a verified rating exists" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
        </div>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-full sm:w-36 bg-secondary border-border"><SelectValue placeholder="Gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Select value={clubFilter} onValueChange={setClubFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-secondary border-border"><SelectValue placeholder="Club" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clubs</SelectItem>
            {clubs.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 py-6">
          {[1, 0, 2].map((idx) => {
            const player = top3[idx];
            if (!player) return <div key={idx} className="w-24" />;
            const height = idx === 0 ? 'h-32' : idx === 1 ? 'h-24' : 'h-20';
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex flex-col items-center"
              >
                <Link to={`/players/${player.id}`} className="flex flex-col items-center group">
                  <Medal className={cn("w-6 h-6 mb-2", podiumColors[idx])} />
                  <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-primary">{(player.full_name || 'P')[0]}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground text-center group-hover:text-primary transition-colors">{player.full_name}</p>
                  <p className="text-lg font-black font-mono text-primary">DUPR {Number(player.dupr_rating).toFixed(2)}</p>
                </Link>
                <div className={cn("w-20 rounded-t-lg bg-primary/10 mt-2", height)} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rankings Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_5rem_4rem_4rem] sm:grid-cols-[3rem_1fr_6rem_5rem_5rem_6rem] items-center px-4 py-2.5 bg-secondary text-xs font-medium text-muted-foreground">
          <span>#</span>
          <span>Player</span>
          <span className="text-right">DUPR</span>
          <span className="text-right">W</span>
          <span className="text-right">L</span>
          <span className="text-right hidden sm:block">Win %</span>
        </div>
        {rest.length === 0 && top3.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No players to rank</p>
        )}
        {rest.map((player, i) => {
          const rank = sorted.findIndex(p => p.id === player.id) + 1;
          const winRate = player.matches_played > 0 ? Math.round((player.wins / player.matches_played) * 100) : 0;
          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link
                to={`/players/${player.id}`}
                className="grid grid-cols-[3rem_1fr_5rem_4rem_4rem] sm:grid-cols-[3rem_1fr_6rem_5rem_5rem_6rem] items-center px-4 py-3 border-t border-border hover:bg-secondary/50 transition-colors"
              >
                <span className="text-sm font-bold text-muted-foreground">{rank}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{(player.full_name || 'P')[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{player.full_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{player.club || ''}</p>
                  </div>
                </div>
                <span className="text-sm font-bold font-mono text-primary text-right">{player.dupr_rating != null ? Number(player.dupr_rating).toFixed(2) : 'Unrated'}</span>
                <span className="text-sm text-foreground text-right">{player.wins || 0}</span>
                <span className="text-sm text-foreground text-right">{player.losses || 0}</span>
                <span className="text-sm text-muted-foreground text-right hidden sm:block">{winRate}%</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}