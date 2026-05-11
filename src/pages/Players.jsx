import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, Search, Users, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import PlayerCard from '@/components/players/PlayerCard';
import ImportPlayersModal from '@/components/players/ImportPlayersModal';
import AddPlayerModal from '@/components/players/AddPlayerModal';

export default function Players() {
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [clubFilter, setClubFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('-skill_rating', 200)
  });

  const clubs = [...new Set(players.map(p => p.club).filter(Boolean))];

  const filtered = players.filter(p => {
    const matchSearch = !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase());
    const matchClub = clubFilter === 'all' || p.club === clubFilter;
    const matchGender = genderFilter === 'all' || p.gender === genderFilter;
    return matchSearch && matchClub && matchGender;
  });

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['players'] });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Players" description={`${players.length} registered players`}>
        <Button variant="outline" className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" /> Add Player
        </Button>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setImportOpen(true)}>
          <Upload className="w-4 h-4" /> Import Players
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <Select value={clubFilter} onValueChange={setClubFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-secondary border-border">
            <SelectValue placeholder="All Clubs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clubs</SelectItem>
            {clubs.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-secondary border-border">
            <SelectValue placeholder="All Genders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Non-binary">Non-binary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Player List */}
      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No players found"
          description={players.length === 0 ? "Import your first batch of players to get started" : "Try adjusting your search or filters"}
          actionLabel={players.length === 0 ? "Import Players" : undefined}
          onAction={players.length === 0 ? () => setImportOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-2">
          {filtered.map((player, i) => (
            <PlayerCard key={player.id} player={player} index={i} />
          ))}
        </div>
      )}

      <ImportPlayersModal open={importOpen} onOpenChange={setImportOpen} onImportComplete={handleImportComplete} />
      <AddPlayerModal open={addOpen} onOpenChange={setAddOpen} onCreated={handleImportComplete} />
    </div>
  );
}