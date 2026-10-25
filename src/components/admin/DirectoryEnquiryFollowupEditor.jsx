import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// This form is shown only inside the Directory super-admin CRM workspace.
// The backend independently validates the current user and enquiry ID.
export default function DirectoryEnquiryFollowupEditor({ enquiry, onSaved }) {
  const [status, setStatus] = useState(enquiry.followupStatus || 'open');
  const [note, setNote] = useState(enquiry.internalNote || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await base44.functions.invoke('directoryContactAction', {
        action: 'admin_set_followup', enquiryId: enquiry.id, status, internalNote: note,
      });
      if (res.data?.success !== true) throw new Error(res.data?.error || 'Could not save follow-up');
      await onSaved();
      toast.success('Directory follow-up saved');
    } catch (err) {
      setError(err?.message || 'Could not save follow-up');
    } finally { setSaving(false); }
  };
  return <div className="space-y-2 rounded-lg border border-border p-3">
    <p className="text-sm font-semibold">Internal follow-up</p>
    <label className="block text-xs font-medium" htmlFor={`directory-followup-status-${enquiry.id}`}>Status</label>
    <select id={`directory-followup-status-${enquiry.id}`} value={status} onChange={e=>setStatus(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
      <option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option>
    </select>
    <label className="block text-xs font-medium" htmlFor={`directory-followup-note-${enquiry.id}`}>Internal note (Directory administrators only)</label>
    <textarea id={`directory-followup-note-${enquiry.id}`} value={note} onChange={e=>setNote(e.target.value.slice(0,2000))} maxLength={2000} rows={3} className="w-full rounded-md border border-input bg-background p-2 text-sm" placeholder="Follow-up notes; never include tenant-only or sensitive sporting records" />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{enquiry.followupUpdatedAt ? `Last saved ${new Date(enquiry.followupUpdatedAt).toLocaleString('en-IE')}` : 'No follow-up saved yet'}</span><Button type="button" size="sm" onClick={save} disabled={saving || (status === (enquiry.followupStatus||'open') && note === (enquiry.internalNote||''))}>{saving?'Saving…':'Save follow-up'}</Button></div>
  </div>;
}
