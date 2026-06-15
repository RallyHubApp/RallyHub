import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';

const styles = [
  'from-yellow-300/30 via-yellow-500/20 to-amber-700/20 border-yellow-400/40',
  'from-slate-200/25 via-slate-400/15 to-slate-700/20 border-slate-300/40',
  'from-orange-300/25 via-amber-700/20 to-orange-950/20 border-orange-400/40',
];
const medals = ['🥇', '🥈', '🥉'];

export default function PodiumResults({ leaderboard = [], tournamentName = 'King of the Court' }) {
  const podiumRef = useRef(null);
  const podium = leaderboard.slice(0, 3);

  useEffect(() => {
    if (podium.length) confetti({ particleCount: 120, spread: 75, origin: { y: 0.72 } });
  }, [podium.length]);

  const sharePodium = async () => {
    if (!podiumRef.current) return;
    const canvas = await html2canvas(podiumRef.current, { backgroundColor: '#05070d', scale: 2 });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], `${tournamentName}-podium.png`, { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: `${tournamentName} Podium`, files: [file] });
    } else if (navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } else {
      await navigator.clipboard.writeText(`${tournamentName} podium: ${podium.map((p, i) => `${i + 1}. ${p.name}`).join(', ')}`);
    }
  };

  return (
    <div className="space-y-4">
      <div ref={podiumRef} className="glass-strong rounded-3xl p-6 space-y-5 glow-green">
        <div className="text-center space-y-2">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto" />
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Session Complete</p>
          <h2 className="text-2xl font-black text-foreground">{tournamentName} Podium</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-3 items-end">
          {podium.map((player, index) => (
            <div key={player.id} className={`rounded-2xl border bg-gradient-to-br ${styles[index]} p-5 text-center ${index === 0 ? 'md:-mt-4 md:pb-8' : 'md:mt-6'}`}>
              <div className="text-5xl mb-3">{medals[index]}</div>
              <Badge variant="outline" className="mb-3">{index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'}</Badge>
              <p className="text-xl font-black text-foreground leading-tight">{player.name}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="glass rounded-lg p-2"><p className="text-primary font-bold">{player.wins}</p><p className="text-muted-foreground">Wins</p></div>
                <div className="glass rounded-lg p-2"><p className="text-destructive font-bold">{player.losses}</p><p className="text-muted-foreground">Losses</p></div>
                <div className="glass rounded-lg p-2"><p className="text-yellow-400 font-bold">Court {player.finalCourt || '—'}</p><p className="text-muted-foreground">Final</p></div>
                <div className="glass rounded-lg p-2"><p className="text-foreground font-bold">{player.sitOuts}</p><p className="text-muted-foreground">Benched</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button className="w-full bg-primary text-primary-foreground gap-2" onClick={sharePodium}>
        <Share2 className="w-4 h-4" /> Share Podium
      </Button>
    </div>
  );
}