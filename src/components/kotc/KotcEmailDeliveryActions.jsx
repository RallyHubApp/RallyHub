import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

export function formatEmailTimestamp(value){
  if(!value) return '';
  const d=new Date(value);
  if(Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IE',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

export default function KotcEmailDeliveryActions({preview,emailTestSent,sharing,onTest,onSendAll,onResendAll,onResendPlayer}){
  const delivery=preview?.delivery||{};
  const recipients=Array.isArray(delivery.recipientStatuses)?delivery.recipientStatuses:[];
  const recipientCount=Number(preview?.recipientCount||recipients.length||0);
  const sentCount=Number(delivery.sentCount||0);
  const failedCount=Number(delivery.failedCount||0);
  const attempted=recipients.some(r=>r.deliveryStatus&&r.deliveryStatus!=='not_sent');
  const allSent=delivery.allSent===true&&recipientCount>0;
  const bulkAt=delivery.bulkResendAvailableAt?Date.parse(delivery.bulkResendAvailableAt):0;
  const bulkLocked=Boolean(bulkAt&&Number.isFinite(bulkAt)&&bulkAt>Date.now());

  if(!attempted&&!emailTestSent){
    return <div className="space-y-2">
      <Button data-testid="kotc-email-test" className="w-full min-h-12" onClick={onTest} disabled={sharing||preview?.transportReady!==true}>
        {sharing?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Sending test…</>:`Send test email to ${preview?.testRecipientName||'me'}`}
      </Button>
      <p className="text-[11px] text-center text-muted-foreground">This sends one email to {preview?.testRecipient||'your RallyHub account'}. The player send unlocks only after the test succeeds.</p>
    </div>;
  }

  if(!attempted){
    return <div className="space-y-2">
      <Button data-testid="kotc-email-send-all" className="w-full min-h-12" onClick={onSendAll} disabled={sharing}>
        {sharing?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Sending to {recipientCount} players…</>:`Send to ${recipientCount} Players`}
      </Button>
      {sharing&&<p className="text-[11px] text-center text-muted-foreground">RallyHub is sending the emails now. Keep this window open until confirmation appears.</p>}
    </div>;
  }

  return <div className="space-y-3">
    {sharing&&<div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm font-semibold text-primary flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Sending email… confirmation will appear when the server finishes.</div>}

    <div className={`rounded-xl border p-3 ${failedCount?'border-amber-400/30 bg-amber-500/10':'border-green-500/30 bg-green-500/10'}`}>
      <div className="flex items-start gap-2">
        <span className={`text-lg leading-none ${failedCount?'text-amber-600':'text-green-600'}`}>{failedCount?'⚠':'✓'}</span>
        <div>
          <p className={`text-sm font-bold ${failedCount?'text-amber-700':'text-green-700'}`}>{allSent?`Sent to ${sentCount} players`:`${sentCount} of ${recipientCount} players sent`}</p>
          {delivery.lastSentAt&&<p className="text-[11px] text-muted-foreground mt-1">Last confirmed send: {formatEmailTimestamp(delivery.lastSentAt)}</p>}
          {failedCount>0&&<p className="text-[11px] text-amber-700 mt-1">{failedCount} latest send attempt{failedCount===1?'':'s'} failed. Use the individual controls below to retry.</p>}
        </div>
      </div>
    </div>

    {sentCount>0
      ? <Button data-testid="kotc-email-send-complete" variant="secondary" className="w-full min-h-12" disabled>✓ {allSent?`Sent to ${sentCount} Players`:`${sentCount} of ${recipientCount} Sent`}</Button>
      : <Button className="w-full min-h-12" onClick={onSendAll} disabled={sharing||!emailTestSent}>{sharing?'Retrying…':`Retry Send to ${recipientCount} Players`}</Button>}

    {!emailTestSent&&<div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 space-y-2">
      <p className="text-xs font-semibold text-amber-700">The previous send confirmation is retained. Send a fresh test email before any new send or resend.</p>
      <Button data-testid="kotc-email-retest" variant="outline" className="w-full min-h-11" onClick={onTest} disabled={sharing||preview?.transportReady!==true}>
        {sharing?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Sending test…</>:`Send test email to ${preview?.testRecipientName||'me'}`}
      </Button>
    </div>}

    {sentCount>0&&!allSent&&<Button variant="outline" className="w-full min-h-11" onClick={onSendAll} disabled={sharing||!emailTestSent}><RefreshCw className="w-4 h-4 mr-2"/>Retry unsent players</Button>}

    {sentCount>0&&<div className="grid sm:grid-cols-2 gap-2">
      <Button data-testid="kotc-email-resend-all" variant="outline" className="min-h-11" onClick={onResendAll} disabled={sharing||bulkLocked||!emailTestSent}><RefreshCw className="w-4 h-4 mr-2"/>Resend to all {recipientCount}</Button>
      <div className="rounded-lg border p-2 text-[11px] text-muted-foreground flex items-center">{bulkLocked?`Bulk resend available after ${formatEmailTimestamp(delivery.bulkResendAvailableAt)}. Individual resend is available now.`:'Bulk resend is available. Individual resend is also available below.'}</div>
    </div>}

    {recipients.length>0&&<div className="rounded-xl border overflow-hidden">
      <div className="px-3 py-2 border-b bg-secondary/30"><p className="text-xs font-bold">Player email status</p><p className="text-[10px] text-muted-foreground">Stored send status for this KOTC session.</p></div>
      <div className="divide-y max-h-72 overflow-y-auto">
        {recipients.map(r=><div key={r.playerId} className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{r.name}</p>
            <p className={`text-[11px] ${r.deliveryStatus==='failed'?'text-destructive':r.hasSent?'text-green-600':'text-muted-foreground'}`}>{r.deliveryStatus==='failed'?'⚠ Latest attempt failed':r.hasSent?`✓ Sent${r.lastSentAt?` · ${formatEmailTimestamp(r.lastSentAt)}`:''}`:'Not sent yet'}</p>
          </div>
          <Button size="sm" variant="outline" onClick={()=>onResendPlayer(r.playerId)} disabled={sharing||!emailTestSent}>{r.hasSent?'Resend':'Send'}</Button>
        </div>)}
      </div>
    </div>}
  </div>;
}
