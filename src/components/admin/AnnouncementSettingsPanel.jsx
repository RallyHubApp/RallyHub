import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, Megaphone, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

const moduleLabels = { kotc:'King of the Court', interclub:'RallyHub Interclub', tournament:'Tournament', shared:'Shared', league:'League', ladder:'Ladder', other:'Other' };

const previewValues = {
  round_label:'Round 1',
  break_minutes:'20',
  next_round_label:'Round 7',
  seconds:'5',
};

function spokenPreview(row, text) {
  if (!text) return '';
  if (row?.key === 'countdown') {
    return [5,4,3,2,1].map(seconds => String(text).replace(/\{seconds\}/gi, String(seconds))).join(', ');
  }
  return String(text).replace(/\{([a-z0-9_]+)\}/gi, (_, key) => previewValues[key] ?? `{${key}}`);
}

export default function AnnouncementSettingsPanel() {
  const queryClient = useQueryClient();
  const [openModules, setOpenModules] = useState({ kotc:true, interclub:true });
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState('');

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey:['admin-announcement-settings'],
    queryFn: async () => {
      const res = await base44.functions.invoke('announcementSettings', { action:'admin_list' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.templates || [];
    },
  });

  const grouped = useMemo(() => {
    const map = new Map();
    templates.forEach(t => {
      if (!map.has(t.module)) map.set(t.module, []);
      map.get(t.module).push(t);
    });
    return [...map.entries()].sort((a,b) => Math.min(...a[1].map(x=>Number(x.sort_order||0))) - Math.min(...b[1].map(x=>Number(x.sort_order||0))));
  }, [templates]);

  const draftFor = row => drafts[row.id] || { mode:row.mode || 'default', customText:row.custom_text || '', enabled:row.enabled !== false };
  const setDraft = (row, patch) => setDrafts(prev => ({ ...prev, [row.id]: { ...draftFor(row), ...patch } }));

  const save = async row => {
    const draft = draftFor(row);
    setBusyId(row.id);
    try {
      const res = await base44.functions.invoke('announcementSettings', { action:'admin_update', id:row.id, mode:draft.mode, customText:draft.customText, enabled:draft.enabled });
      if (res.data?.error) throw new Error(res.data.error);
      setDrafts(prev => { const next={...prev}; delete next[row.id]; return next; });
      await queryClient.invalidateQueries({ queryKey:['admin-announcement-settings'] });
      toast.success(`${row.label} announcement saved`);
    } catch (e) { toast.error(e?.message || 'Could not save announcement'); }
    finally { setBusyId(''); }
  };

  const reset = async row => {
    setBusyId(row.id);
    try {
      const res = await base44.functions.invoke('announcementSettings', { action:'admin_reset', id:row.id });
      if (res.data?.error) throw new Error(res.data.error);
      setDrafts(prev => { const next={...prev}; delete next[row.id]; return next; });
      await queryClient.invalidateQueries({ queryKey:['admin-announcement-settings'] });
      toast.success(`${row.label} reset to RallyHub default`);
    } catch (e) { toast.error(e?.message || 'Could not reset announcement'); }
    finally { setBusyId(''); }
  };

  if (isLoading) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading announcement settings…</div>;
  if (error) return <div className="glass rounded-xl p-6 text-sm text-destructive">{error.message || 'Could not load announcement settings.'}</div>;

  return <div className="space-y-4">
    <div className="glass rounded-xl p-4 sm:p-5 border border-primary/20">
      <div className="flex items-start gap-3">
        <Megaphone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="font-bold text-foreground">Automatic hall announcements</h3>
          <p className="text-sm text-muted-foreground mt-1">Open a module to see exactly what players will hear. Each announcement can be switched on or off, left on RallyHub wording, or changed to your own text. Reset restores both the default wording and the default on/off setting.</p>
        </div>
      </div>
    </div>

    {grouped.map(([moduleName, rows]) => {
      const open = !!openModules[moduleName];
      const customCount = rows.filter(r => r.mode === 'custom').length;
      const enabledCount = rows.filter(r => r.enabled !== false).length;
      return <div key={moduleName} className="glass rounded-xl overflow-hidden">
        <button type="button" onClick={() => setOpenModules(v => ({...v,[moduleName]:!open}))} className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-secondary/30">
          <div><p className="font-bold">{moduleLabels[moduleName] || moduleName}</p><p className="text-xs text-muted-foreground mt-1">{enabledCount} on · {rows.length-enabledCount} off{customCount ? ` · ${customCount} customised` : ' · default wording'}</p></div>
          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${open?'rotate-90':''}`} />
        </button>
        {open && <div className="border-t divide-y divide-border">
          {rows.map(row => {
            const draft = draftFor(row);
            const dirty = !!drafts[row.id];
            const selectedText = draft.mode === 'custom' ? draft.customText : row.default_text;
            const previewText = draft.enabled ? spokenPreview(row, selectedText || row.default_text) : '';
            return <div key={row.id} className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-sm">{row.label}</p><Badge variant="outline" className="text-[10px]">{draft.mode === 'custom' ? 'Custom' : 'Default'}</Badge><Badge variant="outline" className={`text-[10px] ${row.default_enabled === false ? 'text-muted-foreground' : 'text-primary'}`}>RallyHub default: {row.default_enabled === false ? 'Off' : 'On'}</Badge>{!draft.enabled && <Badge variant="outline" className="text-[10px] text-muted-foreground">Currently Off</Badge>}</div><p className="text-xs text-muted-foreground mt-1">{row.trigger_description}</p></div>
                <div className="flex gap-2 shrink-0">
                  <Select value={draft.mode} onValueChange={value => setDraft(row,{mode:value})}><SelectTrigger className="w-28 h-9 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="custom">Custom</SelectItem></SelectContent></Select>
                  <button type="button" onClick={() => setDraft(row,{enabled:!draft.enabled})} className={`h-9 rounded-md border px-3 text-xs font-semibold ${draft.enabled?'border-primary/30 bg-primary/10 text-primary':'border-border text-muted-foreground'}`}>{draft.enabled?'On':'Off'}</button>
                </div>
              </div>
              {draft.mode === 'custom' && <textarea value={draft.customText} onChange={e=>setDraft(row,{customText:e.target.value})} rows={3} maxLength={1000} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6" placeholder={row.default_text} />}
              <div className={`rounded-lg border p-3 ${draft.enabled ? 'bg-primary/5 border-primary/20' : 'bg-secondary/30'}`}>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">What RallyHub will say</p>
                <p className={`mt-1 text-sm font-semibold ${draft.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{draft.enabled ? previewText : 'Nothing. This automatic announcement is switched off.'}</p>
                {draft.enabled && row.variables_help && <p className="mt-1 text-[11px] text-muted-foreground">Shown with a real-world example. Round numbers and timings are inserted automatically during the event.</p>}
                {row.variables_help && <details className="mt-2 text-[11px] text-muted-foreground"><summary className="cursor-pointer select-none">Show template details</summary><p className="mt-1 break-words">Template: <span className="text-foreground">{selectedText || row.default_text}</span></p><p className="mt-1">Available values: {row.variables_help}</p></details>}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="flex gap-2"><Button type="button" size="sm" variant="ghost" onClick={()=>reset(row)} disabled={busyId===row.id} className="h-8 gap-1 text-xs"><RotateCcw className="w-3.5 h-3.5"/>Reset</Button><Button type="button" size="sm" onClick={()=>save(row)} disabled={!dirty || busyId===row.id || (draft.mode==='custom' && !draft.customText.trim())} className="h-8 gap-1 text-xs"><Save className="w-3.5 h-3.5"/>{busyId===row.id?'Saving…':'Save'}</Button></div>
              </div>
            </div>;
          })}
        </div>}
      </div>;
    })}

    <div className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">Future Tournament, League, Ladder and other competition modules will register their automatic phrases here, so the Super Admin has one announcement library rather than separate hard-coded controls in every module.</div>
  </div>;
}
