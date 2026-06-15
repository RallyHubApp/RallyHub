import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Maximize2, Minimize2, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function speak(text, volume) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function tone(volume, frequency = 880) {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.value = volume * 0.18;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.28);
}

export default function RoundTimer({ disabled = false }) {
  const [playMinutes, setPlayMinutes] = useState(8);
  const [restMinutes, setRestMinutes] = useState(2);
  const [phase, setPhase] = useState('play');
  const [seconds, setSeconds] = useState(8 * 60);
  const [running, setRunning] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [fullscreen, setFullscreen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (!running || seconds !== 0) return;
    if (phase === 'play') {
      tone(volume, 440);
      speak('End Round. Rest Time.', volume);
      setPhase('rest');
      setSeconds(restMinutes * 60);
      setRunning(true);
    } else {
      tone(volume, 880);
      speak('Start Round', volume);
      setPhase('play');
      setSeconds(playMinutes * 60);
      setRunning(true);
    }
  }, [seconds, running, phase, playMinutes, restMinutes, volume]);

  const start = () => {
    if (disabled) return;
    tone(volume, 880);
    speak('Start Round', volume);
    setPhase('play');
    setSeconds(playMinutes * 60);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setPhase('play');
    setSeconds(playMinutes * 60);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const maxSeconds = (phase === 'play' ? playMinutes : restMinutes) * 60;
  const pct = maxSeconds > 0 ? seconds / maxSeconds : 0;

  const panel = (
    <div className={cn('glass rounded-2xl p-5 space-y-4', fullscreen && 'fixed inset-0 z-[100] rounded-none bg-background flex flex-col justify-center p-8')}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{phase === 'play' ? 'Play Time' : 'Rest Time'}</p>
          <p className="text-sm text-muted-foreground">Timed rounds with speech + tone announcements</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setFullscreen(v => !v)}>
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      <div className={cn('font-mono font-black text-center tracking-tight text-6xl sm:text-7xl text-foreground', fullscreen && 'text-[22vw]')}>
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-1000', phase === 'play' ? 'bg-primary' : 'bg-yellow-400')} style={{ width: `${pct * 100}%` }} />
      </div>

      {!fullscreen && (
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Play Time</Label>
            <Input type="number" min="1" max="30" value={playMinutes} onChange={e => { const v = Number(e.target.value) || 8; setPlayMinutes(v); if (!running && phase === 'play') setSeconds(v * 60); }} className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Rest Time</Label>
            <Input type="number" min="1" max="10" value={restMinutes} onChange={e => setRestMinutes(Number(e.target.value) || 2)} className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1"><Volume2 className="w-3 h-3" /> Volume</Label>
            <Input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))} className="mt-2" />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button className="flex-1 bg-primary text-primary-foreground gap-2" onClick={running ? () => setRunning(false) : start} disabled={disabled}>
          {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start Round</>}
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" /> Reset</Button>
      </div>
    </div>
  );

  return panel;
}