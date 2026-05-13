import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Parses a Spond "For import" XLSX export.
 * Columns: Status, Name, Email, Phone, Time of response
 * We only care about rows where Status === "Going"
 */
async function parseSpondXlsx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const { read, utils } = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
        const wb = read(e.target.result, { type: 'array' });

        // Try "For import" sheet first, then first sheet
        const sheetName = wb.SheetNames.includes('For import')
          ? 'For import'
          : wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows = utils.sheet_to_json(ws, { header: 1, defval: '' });

        // Find the header row (contains "Status" or "Name")
        let headerIdx = -1;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i].map(c => String(c).trim().toLowerCase());
          if (row.includes('status') && row.includes('name')) {
            headerIdx = i;
            break;
          }
        }

        if (headerIdx === -1) {
          // Fallback: try "For print" sheet where Going/Name are separate sections
          return resolve(parsePrintSheet(wb));
        }

        const headers = rows[headerIdx].map(c => String(c).trim().toLowerCase());
        const statusCol = headers.indexOf('status');
        const nameCol = headers.indexOf('name');
        const emailCol = headers.indexOf('email');
        const phoneCol = headers.indexOf('phone');

        const going = [];
        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          const status = String(row[statusCol] || '').trim().toLowerCase();
          const name = String(row[nameCol] || '').trim();
          if (status === 'going' && name) {
            going.push({
              full_name: name,
              email: String(row[emailCol] || '').trim() || null,
              phone: String(row[phoneCol] || '').trim() || null,
            });
          }
        }
        resolve(going);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function parsePrintSheet(wb) {
  const { utils } = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
  const sheetName = wb.SheetNames.includes('For print') ? 'For print' : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = utils.sheet_to_json(ws, { header: 1, defval: '' });

  let inGoing = false;
  let nameCol = 0, emailCol = 2;
  const going = [];

  for (let i = 0; i < rows.length; i++) {
    const first = String(rows[i][0] || '').trim().toLowerCase();
    if (first.startsWith('going')) { inGoing = true; continue; }
    if (first.startsWith('unanswered') || first.startsWith("can't go")) { inGoing = false; continue; }
    if (inGoing && first === 'name') {
      // header row
      nameCol = 0; emailCol = 2; continue;
    }
    if (inGoing) {
      const name = String(rows[i][nameCol] || '').trim();
      const email = String(rows[i][emailCol] || '').trim();
      if (name && name.toLowerCase() !== 'name') {
        going.push({ full_name: name, email: email || null, phone: null });
      }
    }
  }
  return going;
}

export default function SpondXlsxImportModal({ open, onOpenChange, tournament, onImported }) {
  const [step, setStep] = useState('upload'); // upload | preview | importing | done
  const [attendees, setAttendees] = useState([]);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const reset = () => {
    setStep('upload');
    setAttendees([]);
    setError(null);
    setResult(null);
    setImporting(false);
  };

  const handleClose = (open) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const going = await parseSpondXlsx(file);
      if (going.length === 0) {
        setError('No "Going" attendees found in this file. Make sure you\'re using the Spond export.');
        return;
      }
      setAttendees(going);
      setStep('preview');
    } catch (err) {
      setError('Could not read the file. Please use the Spond XLSX export.');
    }
    e.target.value = '';
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      // Match against existing players by email or name
      const allPlayers = await base44.entities.Player.list();
      const existingPlayerIds = new Set(tournament.player_ids || []);
      const newPlayerIds = [...existingPlayerIds];
      let matched = 0, created = 0;

      for (const attendee of attendees) {
        // Try email match first, then name match
        let player = attendee.email
          ? allPlayers.find(p => p.email?.toLowerCase() === attendee.email.toLowerCase())
          : null;
        if (!player) {
          player = allPlayers.find(p => p.full_name?.toLowerCase() === attendee.full_name.toLowerCase());
        }

        if (player) {
          if (!existingPlayerIds.has(player.id)) {
            newPlayerIds.push(player.id);
            matched++;
          }
        } else {
          // Create new player
          const newPlayer = await base44.entities.Player.create({
            full_name: attendee.full_name,
            email: attendee.email || undefined,
            phone: attendee.phone || undefined,
            skill_rating: 3.0,
            status: 'Active',
          });
          newPlayerIds.push(newPlayer.id);
          created++;
        }
      }

      await base44.entities.Tournament.update(tournament.id, { player_ids: newPlayerIds });
      setResult({ matched, created, total: matched + created });
      setStep('done');
      toast.success(`Imported ${matched + created} players`);
    } catch (err) {
      setError(err.message);
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" /> Import Spond Attendees
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload the Spond XLSX export — only "Going" attendees will be imported.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-foreground font-medium">Click to upload XLSX</p>
              <p className="text-xs text-muted-foreground">Spond export file (.xlsx)</p>
            </button>
            <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">{attendees.length} "Going" attendees found</span>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
              {attendees.map((a, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary text-xs">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {a.full_name[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-foreground flex-1">{a.full_name}</span>
                  {a.email && <span className="text-muted-foreground truncate max-w-[140px]">{a.email}</span>}
                </div>
              ))}
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={reset}>Back</Button>
              <Button size="sm" className="bg-primary text-primary-foreground" onClick={handleImport} disabled={importing}>
                {importing ? 'Importing...' : `Import ${attendees.length} Players`}
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && result && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="w-10 h-10 text-primary" />
              <p className="text-sm font-semibold text-foreground">Import Complete!</p>
              <div className="text-xs text-muted-foreground space-y-1 text-center">
                <p><span className="text-foreground font-medium">{result.matched}</span> matched existing players</p>
                <p><span className="text-foreground font-medium">{result.created}</span> new players created</p>
                <p className="text-primary font-medium">{result.total} total added to tournament</p>
              </div>
            </div>
            <Button className="w-full bg-primary text-primary-foreground" onClick={() => { handleClose(false); onImported?.(); }}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}