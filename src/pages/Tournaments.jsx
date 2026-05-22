import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trophy, Calendar, MapPin, Users, Search, Trash2, Crown, FileSpreadsheet, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import CreateTournamentModal from '@/components/tournaments/CreateTournamentModal';
import SpondImportModal from '@/components/spond/SpondImportModal';
import SpondXlsxImportModal from '@/components/spond/SpondXlsxImportModal';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const statusColors = {
  'Draft': 'bg-secondary text-secondary-foreground',
  'Registration Open': 'bg-accent/20 text-accent',
  'In Progress': 'bg-primary/20 text-primary',
  'Completed': 'bg-muted text-muted-foreground',
  'Cancelled': 'bg-destructive/20 text-destructive'
};

export default function Tournaments() {
  const [createOpen, setCreateOpen] = useState(false);
  const [kotcSpondOpen, setKotcSpondOpen] = useState(false);
  const [kotcXlsxOpen, setKotcXlsxOpen] = useState(false);
  const [newKotcTournament, setNewKotcTournament] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin')).catch(() => {});
  }, []);

  const handleQuickKotc = async () => {
    const t = await base44.entities.Tournament.create({
      name: `King of the Court — ${new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}`,
      format: 'King of the Court',
      partnership_type: 'Singles',
      status: 'Draft',
      kotc_num_courts: 4,
      kotc_num_rounds: 9,
      kotc_score_format: 'first_11',
      player_ids: [],
      partner_pairs: [],
    });
    queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    navigate(`/app/tournaments/${t.id}`);
  };

  const handleQuickTournival = async () => {
    const t = await base44.entities.Tournament.create({
      name: `Tournival — ${new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}`,
      format: 'Tournival',
      partnership_type: 'Singles',
      status: 'Draft',
      kotc_num_courts: 4,
      player_ids: [],
      partner_pairs: [],
    });
    queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    navigate(`/app/tournaments/${t.id}`);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this tournament?')) return;
    await base44.entities.Tournament.delete(id);
    queryClient.invalidateQueries({ queryKey: ['tournaments'] });
  };

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => base44.entities.Tournament.list('-created_date', 100)
  });

  const filtered = tournaments.filter(t => {
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Tournaments" description={`${tournaments.length} tournaments`}>
        <Button variant="outline" className="gap-2 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10" onClick={handleQuickKotc}>
          <Crown className="w-4 h-4" /> King of the Court
        </Button>
        <Button variant="outline" className="gap-2 border-accent/40 text-accent hover:bg-accent/10" onClick={handleQuickTournival}>
          <Zap className="w-4 h-4" /> Tournival
        </Button>
        <Button variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10" onClick={async () => {
          const t = await base44.entities.Tournament.create({
            name: `King of the Court — ${new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}`,
            format: 'King of the Court', partnership_type: 'Singles', status: 'Draft',
            kotc_num_courts: 4, kotc_num_rounds: 9, kotc_score_format: 'first_11', player_ids: [], partner_pairs: [],
          });
          queryClient.invalidateQueries({ queryKey: ['tournaments'] });
          setNewKotcTournament(t);
          setKotcXlsxOpen(true);
        }}>
          <FileSpreadsheet className="w-4 h-4" /> KOTC from XLSX
        </Button>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Create Tournament
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tournaments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-secondary border-border"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Registration Open">Registration Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState icon={Trophy} title="No tournaments" description="Create your first tournament to get started" actionLabel="Create Tournament" onAction={() => setCreateOpen(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="relative">
              {isAdmin && (
                <button
                  onClick={e => handleDelete(e, t.id)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <Link to={`/app/tournaments/${t.id}`} className="glass rounded-xl p-5 block hover:scale-[1.02] transition-all duration-200 group h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <Badge className={cn("text-[10px]", statusColors[t.status] || statusColors['Draft'])}>{t.status}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.format}</p>
                <div className="mt-4 space-y-1.5">
                  {t.start_date && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(t.start_date), 'MMM d, yyyy')}
                      {t.end_date && ` — ${format(new Date(t.end_date), 'MMM d, yyyy')}`}
                    </div>
                  )}
                  {t.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {t.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" /> {t.player_ids?.length || 0}{t.max_players ? `/${t.max_players}` : ''} players
                  </div>
                </div>
              </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateTournamentModal open={createOpen} onOpenChange={setCreateOpen} onCreated={() => queryClient.invalidateQueries({ queryKey: ['tournaments'] })} />

      {newKotcTournament && (
        <SpondXlsxImportModal
          open={kotcXlsxOpen}
          onOpenChange={(open) => { setKotcXlsxOpen(open); if (!open) navigate(`/app/tournaments/${newKotcTournament.id}`); }}
          tournament={newKotcTournament}
          onImported={() => { setKotcXlsxOpen(false); navigate(`/app/tournaments/${newKotcTournament.id}`); }}
        />
      )}

      {newKotcTournament && (
        <SpondImportModal
          open={kotcSpondOpen}
          onOpenChange={(open) => {
            setKotcSpondOpen(open);
            if (!open) navigate(`/app/tournaments/${newKotcTournament.id}`);
          }}
          tournament={newKotcTournament}
          onImported={() => {
            setKotcSpondOpen(false);
            navigate(`/app/tournaments/${newKotcTournament.id}`);
          }}
        />
      )}
    </div>
  );
}