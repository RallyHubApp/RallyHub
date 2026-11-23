import React from 'react';
import BrandedHostFrame from './BrandedHostFrame';
const tabs=[['registration','My Event'],['fixtures','Fixtures'],['live','Live'],['knockout','Knockout'],['results','Results'],['venue','Venue']];
const stages=['registration','fixtures','live','knockout','results'];
export default function BrandedPlayerFrame({event,stage,activeTab,onTab,children}){
 const limit=Math.max(0,stages.indexOf(stage));
 const playerTabs=tabs.filter(([key])=>key==='venue'||stages.indexOf(key)<=limit)
   .map(([key,label])=>({key,label}));
 return <BrandedHostFrame playerMode tenantId="6a9b7790bc4a8d299938bda9"
   clubName="Clare Pickleball" title="Christmas Tournival 🎄"
   subtitle={event?.name||'My Tournament'} activeTab={activeTab} onTab={onTab}
   playerTabs={playerTabs}>
   <div className="space-y-4" data-testid="tournival-player-host-style-frame">{children}</div>
 </BrandedHostFrame>;
}
