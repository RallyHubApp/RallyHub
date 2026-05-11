import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Users, CheckCircle2, Loader2, X, AlertCircle, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Handles uploading a spreadsheet for inter-club Fixed Partner draws.
 * Expected columns: pair_name (or player1 + player2), club, seed (optional)
 */
export default function InterClubUploadModal({ open, onOpenChange, onPairsReady }) {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pairs, setPairs] = useState([]);
  const [editingPair, setEditingPair] = useState(null);

  const reset = () => {
    setStep('upload');
    setFile(null);
    setPairs([]);
    setEditingPair(null);
    setIsProcessing(false);
  };

  const handleClose = () => { reset(); onOpenChange(false); };

  const processFile = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    setIsProcessing(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });

    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          pairs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pair_name: { type: 'string' },
                player1_name: { type: 'string' },
                player2_name: { type: 'string' },
                club: { type: 'string' },
                seed: { type: 'number' }
              }
            }
          }
        }
      }
    });

    if (result.status === 'error') {
      toast.error('Failed to parse: ' + result.details);
      setIsProcessing(false);
      return;
    }

    const extracted = result.output?.pairs || [];
    const normalised = extracted.map((row, i) => ({
      id: i,
      pair_name: row.pair_name || `${row.player1_name || '?'} / ${row.player2_name || '?'}`,
      player1_name: row.player1_name || '',
      player2_name: row.player2_name || '',
      club: row.club || '',
      seed: row.seed ? Number(row.seed) : null
    }));

    setPairs(normalised);
    setIsProcessing(false);
    setStep('preview');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const updatePair = (id, field, value) => {
    setPairs(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePair = (id) => setPairs(prev => prev.filter(p => p.id !== id));

  const addManualPair = () => {
    const newId = Date.now();
    setPairs(prev => [...prev, { id: newId, pair_name: '', player1_name: '', player2_name: '', club: '', seed: null }]);
  };

  const handleConfirm = () => {
    const valid = pairs.filter(p => p.pair_name || p.player1_name);
    if (valid.length < 2) { toast.error('Need at least 2 pairs'); return; }
    onPairsReady(valid);
    handleClose();
  };

  const clubs = [...new Set(pairs.map(p => p.club).filter(Boolean))];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            {step === 'upload' ? 'Upload Pairs / Inter-Club Draw' : `Review ${pairs.length} Pairs`}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 'upload'
              ? 'Upload a spreadsheet with pair names, player names, club, and optional seed.'
              : 'Edit pairs before generating the draw.'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !isProcessing && document.getElementById('pairs-file-input').click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300',
                  dragOver ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-muted-foreground',
                  isProcessing && 'pointer-events-none opacity-60'
                )}
              >
                <input id="pairs-file-input" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }} />
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                    <p className="text-sm text-foreground font-medium">Reading spreadsheet…</p>
                    <p className="text-xs text-muted-foreground mt-1">AI is detecting pairs, clubs, and seeds</p>
                  </div>
                ) : (
                  <>
                    <Upload className={cn('w-10 h-10 mx-auto mb-3', dragOver ? 'text-primary' : 'text-muted-foreground')} />
                    <p className="text-sm font-medium text-foreground">{dragOver ? 'Drop here' : 'Drag & drop your spreadsheet'}</p>
                    <p className="text-xs text-muted-foreground mt-1">CSV or XLSX — or click to browse</p>
                  </>
                )}
              </div>

              {/* Template hint */}
              <div className="glass rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Expected columns:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['pair_name', 'player1_name', 'player2_name', 'club', 'seed'].map(col => (
                    <Badge key={col} variant="secondary" className="text-xs font-mono">{col}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Either <code className="text-primary">pair_name</code> or both player name columns are required. Seed is optional.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button variant="outline" className="w-full" onClick={() => setStep('preview')}>
                Enter Pairs Manually
              </Button>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Club summary */}
              {clubs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {clubs.map(c => (
                    <Badge key={c} className="bg-accent/20 text-accent text-xs">
                      {c} — {pairs.filter(p => p.club === c).length} pairs
                    </Badge>
                  ))}
                </div>
              )}

              {/* Pairs list */}
              <div className="space-y-2 max-h-72 overflow-auto pr-1">
                {pairs.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No pairs yet — add manually below</p>
                )}
                {pairs.map((pair, i) => (
                  <motion.div key={pair.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="glass rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {pair.seed || i + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        value={pair.pair_name}
                        onChange={e => updatePair(pair.id, 'pair_name', e.target.value)}
                        placeholder="Pair name"
                        className="h-7 text-xs bg-secondary border-border"
                      />
                      <Input
                        value={pair.club}
                        onChange={e => updatePair(pair.id, 'club', e.target.value)}
                        placeholder="Club"
                        className="h-7 text-xs bg-secondary border-border"
                      />
                      <Input
                        type="number"
                        value={pair.seed || ''}
                        onChange={e => updatePair(pair.id, 'seed', e.target.value ? Number(e.target.value) : null)}
                        placeholder="Seed"
                        className="h-7 text-xs bg-secondary border-border"
                      />
                    </div>
                    <button onClick={() => removePair(pair.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={addManualPair}>
                <Users className="w-3.5 h-3.5" /> Add Pair
              </Button>

              <div className="glass rounded-lg p-3 flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">{pairs.length} pairs</span> ready.
                  Seeded pairs will be placed to avoid meeting in early rounds.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { if (file) setStep('upload'); else reset(); }}>Back</Button>
                <Button
                  onClick={handleConfirm}
                  disabled={pairs.length < 2}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Use These {pairs.length} Pairs
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}