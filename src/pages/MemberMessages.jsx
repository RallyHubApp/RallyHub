import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/shared/GlassCard';
import {
  ArrowLeft, Bell, BellRing, CheckCircle2, ChevronRight, Inbox,
  LockKeyhole, MessageCircle, Send, ShieldCheck, Smartphone
} from 'lucide-react';

const BRIAN_PHOTO = '/assets/brian-moore-profile.png';

function formatStamp(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' }) + ' · ' + date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

function previewPayload(snapshot) {
  return {
    success: true,
    mode: 'member',
    unread: 0,
    config: { chairName: 'Brian Moore', chairTitle: 'Chairperson', vapidPublicKey: '', emailFallbackEnabled: true },
    thread: {
      id: 'preview-thread', memberName: snapshot?.person?.full_name || snapshot?.player?.full_name || 'Member',
      messages: [], unreadForMember: 0, unreadForChair: 0,
    },
  };
}

function NotificationSetup({ config, preview = false }) {
  const [status, setStatus] = useState(() => {
    if (preview) return 'preview';
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
    return Notification.permission === 'granted' ? 'checking' : Notification.permission === 'denied' ? 'denied' : 'prompt';
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (preview || status !== 'checking') return;
    let cancelled = false;
    navigator.serviceWorker.register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(registration => registration.pushManager.getSubscription())
      .then(subscription => { if (!cancelled) setStatus(subscription ? 'granted' : 'prompt'); })
      .catch(() => { if (!cancelled) setStatus('prompt'); });
    return () => { cancelled = true; };
  }, [preview, status]);

  const enable = async () => {
    if (preview || busy) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setStatus(permission === 'denied' ? 'denied' : 'prompt'); return; }
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        if (!config?.vapidPublicKey) throw new Error('Push notifications are still being configured.');
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey),
        });
      }
      const json = subscription.toJSON();
      const res = await base44.functions.invoke('memberMessaging', {
        action: 'register_push',
        subscription: json,
        userAgent: navigator.userAgent,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setStatus('granted');
    } catch (error) {
      console.error('Could not enable RallyHub push notifications', error);
      setStatus('error');
    } finally { setBusy(false); }
  };

  if (status === 'granted') {
    const testPush = async () => {
      try { await base44.functions.invoke('memberMessaging', { action: 'test_push' }); } catch (error) { console.error('RallyHub push test failed', error); }
    };
    return (
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-2 flex-1"><BellRing className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><div><p className="text-xs font-bold">Push notifications enabled</p><p className="text-[11px] text-muted-foreground mt-0.5">New message alerts can appear on this device even when RallyHub is not open.</p></div></div>
        <Button size="sm" variant="outline" onClick={testPush}>Send test alert</Button>
      </div>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="rounded-xl border border-border bg-secondary/30 p-3 flex items-start gap-2">
        <Smartphone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <div><p className="text-xs font-bold">Push not available in this browser</p><p className="text-[11px] text-muted-foreground mt-0.5">On iPhone, add RallyHub to the Home Screen first. Email fallback still applies.</p></div>
      </div>
    );
  }

  if (status === 'denied') {
    return <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">Notifications are blocked for RallyHub in this browser. You can re-enable them in your browser/site settings. Email fallback remains available.</div>;
  }

  if (status === 'preview') {
    return <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">Preview only. On a real member device this area lets the member enable private push notifications.</div>;
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-2 flex-1"><Bell className="w-4 h-4 text-primary mt-0.5 shrink-0" /><div><p className="text-xs font-bold">Get message alerts on this phone</p><p className="text-[11px] text-muted-foreground mt-0.5">We only show that you have a new message. The private message text is not shown in the notification.</p></div></div>
      <Button size="sm" onClick={enable} disabled={busy}>{busy ? 'Enabling…' : status === 'error' ? 'Try again' : 'Enable notifications'}</Button>
    </div>
  );
}

function Conversation({ thread, mode, config, onSend, sending, preview = false }) {
  const [text, setText] = useState('');
  const messages = thread?.messages || [];
  const send = async () => {
    const value = text.trim();
    if (!value || sending || preview) return;
    await onSend(value);
    setText('');
  };

  return (
    <div className="flex flex-col min-h-[520px]">
      <div className="border-b border-border p-4 flex items-center gap-3">
        {mode === 'member' ? <div className="w-11 h-11 rounded-full overflow-hidden border border-border"><img src={BRIAN_PHOTO} alt="" className="w-full h-full object-cover" style={{ objectPosition:'50% 35%', transform:'scale(1.35)', transformOrigin:'50% 35%' }} /></div> : <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-primary" /></div>}
        <div className="min-w-0 flex-1">
          <p className="font-black truncate">{mode === 'member' ? config?.chairName || 'Chairperson' : thread?.memberName || 'Member'}</p>
          <p className="text-xs text-muted-foreground">{mode === 'member' ? `${config?.chairTitle || 'Chairperson'} · Private club contact` : 'Private member conversation'}</p>
        </div>
        <LockKeyhole className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto max-h-[55vh] min-h-[290px] bg-secondary/10">
        {messages.length === 0 && (
          <div className="text-center py-12 max-w-sm mx-auto">
            <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-bold">Private RallyHub message</p>
            <p className="text-xs text-muted-foreground mt-1">{mode === 'member' ? `Send ${config?.chairName || 'the Chairperson'} a private message. Your mobile number and email address are not shared with other members.` : 'When this member sends a message, it will appear here.'}</p>
          </div>
        )}
        {messages.map(message => {
          const mine = (mode === 'member' && message.senderRole === 'member') || (mode === 'chair' && message.senderRole === 'chairperson');
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 ${mine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-background border border-border rounded-bl-md'}`}>
                <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
                <p className={`text-[10px] mt-1.5 ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatStamp(message.sentAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border p-3 sm:p-4">
        {preview ? (
          <div className="rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">Preview only. Sending is disabled so no real member receives a test message.</div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} rows={2} maxLength={2000} placeholder="Write a private message…" className="flex-1 resize-none rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <Button onClick={send} disabled={!text.trim() || sending} className="h-11 w-11 p-0 rounded-xl" aria-label="Send message"><Send className="w-4 h-4" /></Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberMessages({ previewSnapshot = null, onPreviewBack = null }) {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const preview = !!previewSnapshot;
  const { data: bootstrap = null, isLoading, error } = useQuery({
    queryKey: ['member-messaging-bootstrap'],
    queryFn: async () => {
      const res = await base44.functions.invoke('memberMessaging', { action: 'bootstrap' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    enabled: !preview,
    staleTime: 10_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: false,
  });
  const data = preview ? previewPayload(previewSnapshot) : bootstrap;
  const mode = data?.mode || 'member';
  const threads = data?.threads || [];
  const initialThread = searchParams.get('thread') || (mode === 'chair' ? (threads.find(t => t.unread > 0)?.id || threads[0]?.id || '') : data?.thread?.id || '');
  const [selectedThreadId, setSelectedThreadId] = useState(initialThread);

  useEffect(() => {
    if (!selectedThreadId && initialThread) setSelectedThreadId(initialThread);
  }, [initialThread, selectedThreadId]);

  const { data: opened = null, isLoading: loadingThread } = useQuery({
    queryKey: ['member-message-thread', selectedThreadId],
    queryFn: async () => {
      const res = await base44.functions.invoke('memberMessaging', { action: 'open_thread', threadId: selectedThreadId });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.thread || null;
    },
    enabled: !preview && !!selectedThreadId,
    staleTime: 2_000,
    refetchInterval: 12_000,
    refetchOnWindowFocus: false,
  });

  const thread = preview ? data?.thread : (opened || (mode === 'member' ? data?.thread : null));
  const sendMutation = useMutation({
    mutationFn: async (message) => {
      const res = await base44.functions.invoke('memberMessaging', { action: 'send', threadId: selectedThreadId || undefined, message });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.thread || null;
    },
    onSuccess: async (nextThread) => {
      if (nextThread?.id) queryClient.setQueryData(['member-message-thread', nextThread.id], nextThread);
      await queryClient.invalidateQueries({ queryKey: ['member-messaging-bootstrap'] });
      await queryClient.invalidateQueries({ queryKey: ['member-message-unread'] });
    },
  });

  const chooseThread = (id) => {
    setSelectedThreadId(id);
    setSearchParams(id ? { thread: id } : {});
  };

  if (!preview && isLoading) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading messages…</div>;
  if (!preview && error) return <div className="glass rounded-xl p-6 text-sm text-destructive">{error.message || 'Could not load messages.'}</div>;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0 max-w-6xl mx-auto">
      {onPreviewBack && <button type="button" onClick={onPreviewBack} className="text-xs font-semibold text-primary inline-flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Back to Home</button>}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Private club contact</p>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">{mode === 'chair' ? 'Member messages' : `Message ${data?.config?.chairName || 'the Chairperson'}`}</h1>
          <p className="text-sm text-muted-foreground mt-1">{mode === 'chair' ? 'Private messages sent directly to you by Clare Pickleball members.' : 'A private one-to-one channel with the Clare Pickleball Chairperson.'}</p>
        </div>
        {mode === 'chair' && Number(data?.unread || 0) > 0 && <Badge className="self-start sm:self-auto bg-primary text-primary-foreground">{data.unread} unread</Badge>}
      </div>

      <NotificationSetup config={data?.config} preview={preview} />

      {mode === 'member' ? (
        <GlassCard className="p-0 overflow-hidden">
          <Conversation thread={thread} mode="member" config={data?.config} onSend={message => sendMutation.mutateAsync(message)} sending={sendMutation.isPending} preview={preview} />
        </GlassCard>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-4">
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2"><Inbox className="w-4 h-4 text-primary" /><h2 className="font-black">Inbox</h2></div>
            <div className="divide-y divide-border max-h-[650px] overflow-y-auto">
              {threads.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No member messages yet.</div>}
              {threads.map(row => (
                <button key={row.id} type="button" onClick={() => chooseThread(row.id)} className={`w-full text-left p-4 flex items-start gap-3 hover:bg-secondary/40 transition-colors ${selectedThreadId === row.id ? 'bg-primary/5' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><MessageCircle className="w-4 h-4 text-primary" /></div>
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-bold truncate">{row.memberName}</p>{row.unread > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">{row.unread}</span>}</div><p className="text-xs text-muted-foreground truncate mt-1">{row.lastMessagePreview || 'No messages yet'}</p><p className="text-[10px] text-muted-foreground mt-1">{formatStamp(row.lastMessageAt)}</p></div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-0 overflow-hidden">
            {selectedThreadId ? (loadingThread && !thread ? <div className="p-8 text-sm text-muted-foreground">Loading conversation…</div> : <Conversation thread={thread} mode="chair" config={data?.config} onSend={message => sendMutation.mutateAsync(message)} sending={sendMutation.isPending} />) : <div className="min-h-[420px] flex items-center justify-center text-center p-8"><div><MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="font-bold">Choose a conversation</p><p className="text-xs text-muted-foreground mt-1">Member messages will appear in the inbox on the left.</p></div></div>}
          </GlassCard>
        </div>
      )}

      <div className="rounded-xl border border-border bg-secondary/20 p-3 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground"><strong className="text-foreground">Privacy by design.</strong> This channel does not reveal a member’s mobile number or email address to other members. Message content stays inside RallyHub; notification emails only tell you that a new message is waiting.</p>
      </div>
    </div>
  );
}
