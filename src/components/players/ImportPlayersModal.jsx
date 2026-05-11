import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const EXPECTED_FIELDS = [
  'full_name', 'email', 'phone', 'gender', 'skill_rating',
  'age_group', 'club', 'preferred_position', 'partner_name',
  'emergency_contact', 'notes'
];

const FIELD_LABELS = {
  full_name: 'Full Name', email: 'Email', phone: 'Phone',
  gender: 'Gender', skill_rating: 'Skill Rating', age_group: 'Age Group',
  club: 'Club', preferred_position: 'Position', partner_name: 'Partner',
  emergency_contact: 'Emergency', notes: 'Notes'
};

function guessColumnMapping(headers) {
  const mapping = {};
  const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  const patterns = {
    full_name: ['fullname', 'name', 'playername', 'player'],
    email: ['email', 'emailaddress', 'mail'],
    phone: ['phone', 'phonenumber', 'mobile', 'cell', 'tel'],
    gender: ['gender', 'sex'],
    skill_rating: ['skillrating', 'rating', 'dupr', 'skill', 'level'],
    age_group: ['agegroup', 'age', 'category', 'division'],
    club: ['club', 'team', 'organization', 'org'],
    preferred_position: ['position', 'preferredposition', 'side'],
    partner_name: ['partner', 'partnername', 'doublespartner'],
    emergency_contact: ['emergency', 'emergencycontact', 'emergencyphone'],
    notes: ['notes', 'note', 'comments', 'comment']
  };

  EXPECTED_FIELDS.forEach(field => {
    const pats = patterns[field] || [];
    const idx = normalizedHeaders.findIndex(h => pats.some(p => h.includes(p)));
    if (idx !== -1) mapping[field] = idx;
  });
  
  return mapping;
}

export default function ImportPlayersModal({ open, onOpenChange, onImportComplete }) {
  const [step, setStep] = useState('upload'); // upload, preview, importing, done
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [errors, setErrors] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const reset = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setColumnMapping({});
    setErrors([]);
    setDuplicates([]);
    setImportProgress(0);
    setImportedCount(0);
    setIsProcessing(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const processFile = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    setIsProcessing(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });

    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          headers: { type: "array", items: { type: "string" } },
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                full_name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                gender: { type: "string" },
                skill_rating: { type: "number" },
                age_group: { type: "string" },
                club: { type: "string" },
                preferred_position: { type: "string" },
                partner_name: { type: "string" },
                emergency_contact: { type: "string" },
                notes: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (result.status === 'error') {
      toast.error('Failed to parse file: ' + result.details);
      setIsProcessing(false);
      return;
    }

    const data = result.output;
    const rows = data.rows || [];
    const hdrs = data.headers || Object.keys(rows[0] || {});

    setHeaders(hdrs);
    setParsedData(rows);
    setColumnMapping(guessColumnMapping(hdrs));

    // Validate rows
    const rowErrors = [];
    rows.forEach((row, i) => {
      if (!row.full_name || row.full_name.trim() === '') {
        rowErrors.push({ row: i, field: 'full_name', message: 'Name is required' });
      }
    });
    setErrors(rowErrors);

    // Find duplicates by name
    const names = rows.map(r => (r.full_name || '').toLowerCase().trim());
    const dupes = [];
    names.forEach((name, i) => {
      if (name && names.indexOf(name) !== i) dupes.push(i);
    });
    setDuplicates(dupes);

    setIsProcessing(false);
    setStep('preview');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  }, [processFile]);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) processFile(selected);
  };

  const handleImport = async () => {
    setStep('importing');
    const validRows = parsedData.filter((row, i) => {
      const hasError = errors.some(e => e.row === i);
      return !hasError && row.full_name;
    });

    const batchSize = 20;
    let imported = 0;

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize).map(row => ({
        full_name: row.full_name || '',
        email: row.email || '',
        phone: row.phone || '',
        gender: row.gender || '',
        skill_rating: row.skill_rating ? Number(row.skill_rating) : 3.0,
        age_group: row.age_group || '',
        club: row.club || '',
        preferred_position: row.preferred_position || '',
        partner_name: row.partner_name || '',
        emergency_contact: row.emergency_contact || '',
        notes: row.notes || '',
        wins: 0,
        losses: 0,
        matches_played: 0,
        status: 'Active',
        rating_history: [{ date: new Date().toISOString().split('T')[0], rating: row.skill_rating ? Number(row.skill_rating) : 3.0 }]
      }));

      await base44.entities.Player.bulkCreate(batch);
      imported += batch.length;
      setImportProgress(Math.round((imported / validRows.length) * 100));
      setImportedCount(imported);
    }

    setStep('done');
    onImportComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {step === 'upload' && 'Import Players'}
            {step === 'preview' && 'Preview Import'}
            {step === 'importing' && 'Importing Players...'}
            {step === 'done' && 'Import Complete!'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 'upload' && 'Upload a CSV or Excel file with player data'}
            {step === 'preview' && `${parsedData.length} players found in file`}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Upload Step */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer",
                  dragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-muted-foreground",
                  isProcessing && "pointer-events-none opacity-60"
                )}
                onClick={() => !isProcessing && document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-sm text-foreground font-medium">Processing file...</p>
                    <p className="text-xs text-muted-foreground mt-1">Detecting columns and validating data</p>
                  </div>
                ) : (
                  <>
                    <Upload className={cn("w-10 h-10 mx-auto mb-4", dragOver ? "text-primary" : "text-muted-foreground")} />
                    <p className="text-sm text-foreground font-medium">
                      {dragOver ? 'Drop file here' : 'Drag & drop your file here'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      or click to browse — CSV, XLSX supported
                    </p>
                  </>
                )}
              </div>

              <div className="mt-4 glass rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Expected columns:</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXPECTED_FIELDS.map(f => (
                    <Badge key={f} variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                      {FIELD_LABELS[f]}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Stats */}
              <div className="flex gap-3">
                <div className="flex-1 glass rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{parsedData.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="flex-1 glass rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-primary">{parsedData.length - errors.length}</p>
                  <p className="text-xs text-muted-foreground">Valid</p>
                </div>
                <div className="flex-1 glass rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-destructive">{errors.length}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
                <div className="flex-1 glass rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-yellow-400">{duplicates.length}</p>
                  <p className="text-xs text-muted-foreground">Dupes</p>
                </div>
              </div>

              {/* File info */}
              <div className="flex items-center gap-3 glass rounded-lg p-3">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">{(file?.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Player preview table */}
              <div className="max-h-64 overflow-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary sticky top-0">
                    <tr>
                      <th className="text-left p-2 text-muted-foreground font-medium">#</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Name</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Email</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Rating</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Club</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 50).map((row, i) => {
                      const hasError = errors.some(e => e.row === i);
                      const isDupe = duplicates.includes(i);
                      return (
                        <tr key={i} className={cn(
                          "border-t border-border",
                          hasError && "bg-destructive/5",
                          isDupe && "bg-yellow-500/5"
                        )}>
                          <td className="p-2 text-muted-foreground">{i + 1}</td>
                          <td className="p-2 text-foreground font-medium">{row.full_name || '—'}</td>
                          <td className="p-2 text-muted-foreground">{row.email || '—'}</td>
                          <td className="p-2 text-primary font-mono">{row.skill_rating || '—'}</td>
                          <td className="p-2 text-muted-foreground">{row.club || '—'}</td>
                          <td className="p-2">
                            {hasError && <Badge variant="destructive" className="text-[10px]">Error</Badge>}
                            {isDupe && <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400">Dupe</Badge>}
                            {!hasError && !isDupe && <Badge className="text-[10px] bg-primary/20 text-primary">OK</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={reset}>Cancel</Button>
                <Button
                  onClick={handleImport}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={parsedData.length - errors.length === 0}
                >
                  Import {parsedData.length - errors.length} Players
                </Button>
              </div>
            </motion.div>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <motion.div
              key="importing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-foreground font-medium">Importing players...</p>
              <p className="text-sm text-muted-foreground mt-1">{importedCount} of {parsedData.length - errors.length}</p>
              <div className="w-full bg-secondary rounded-full h-2 mt-4">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${importProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Done Step */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              </motion.div>
              <p className="text-lg font-bold text-foreground">
                {importedCount} Players Imported!
              </p>
              <p className="text-sm text-muted-foreground mt-1">All players are ready to go</p>
              <Button onClick={handleClose} className="mt-6 bg-primary text-primary-foreground">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}