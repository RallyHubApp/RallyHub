import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLAY_SECONDS = 8 * 60;
const REST_SECONDS = 2 * 60;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function createAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return AudioContext ? new AudioContext() : null;
}

function beep(ctx, frequency, start, duration, volume) {
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

function playSignal(ctx, type, volume) {
  if (!ctx) return;
  const now = ctx.currentTime;
  if (type === 'start') {
    beep(ctx, 880, now, 0.18, volume);
    beep(ctx, 1175, now + 0.22, 0.22, volume);
    return;
  }
  if (type === 'warning') {
    beep(ctx, 740, now, 0.14, volume * 0.8);
    return;
  }
  beep(ctx, 440, now, 0.22, volume);
  beep(ctx, 440, now + 0.28, 0.22, volume);
  beep(ctx, 330, now + 0.56, 0.35, volume);
}

function speak(text, volume) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = Math.min(1, Math.max(0, volume));
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export default function RoundTimer({ disabled = false }) {
  const [phase, setPhase] = useState('play');
  const [seconds, setSeconds] = useState(PLAY_SECONDS);
  const [running, setRunning] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef(null);
  const deadlineRef = useRef(null);
  const lastAnnouncedRef = useRef(new Set());
  const wakeLockRef = useRef(null);

  const unlockAudio = async () => {
    if (!audioRef.current) audioRef.current = createAudioContext();
    if (audioRef.current?.state === 'suspended') await audioRef.current.resume();
    playSignal(audioRef.current, 'start', volume * 0.25);
    setAudioReady(true);
  };

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    }
  };

  const announce = (text, signal = 'warning') => {
    playSignal(audioRef.current, signal, volume * 0.7);
    speak(text, volume);
    if ('vibrate' in navigator) navigator.vibrate(signal === 'end' ? [250, 120, 250] : 120);
  };

  const startPhase = async (nextPhase) => {
    await unlockAudio();
    await requestWakeLock();
    const duration = nextPhase === 'play' ? PLAY_SECONDS : REST_SECONDS;
    setPhase(nextPhase);
    setSeconds(duration);
    setRunning(true);
    deadlineRef.current = Date.now() + duration * 1000;
    lastAnnouncedRef.current = new Set();
    announce(nextPhase === 'play' ? 'Start round. Eight minutes.' : 'Rest time. Two minutes.', 'start');
  };

  const reset = () => {
    setRunning(false);
    setPhase('play');
    setSeconds(PLAY_SECONDS);
    deadlineRef.current = null;
    lastAnnouncedRef.current = new Set();
    window.speechSynthesis?.cancel();
  };

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setSeconds(remaining);

      const announcements = phase === 'play'
        ? { 60: 'One minute remaining.', 30: 'Thirty seconds.', 10: 'Ten seconds.' }
        : { 30: 'Thirty seconds until next round.', 10: 'Ten seconds.' };

      if (announcements[remaining] && !lastAnnouncedRef.current.has(remaining)) {
        lastAnnouncedRef.current.add(remaining);
        announce(announcements[remaining], 'warning');
      }

      if (remaining <= 5 && remaining > 0 && !lastAnnouncedRef.current.has(`count-${remaining}`)) {
        lastAnnouncedRef.current.add(`count-${remaining}`);
        playSignal(audioRef.current, 'warning', volume * 0.6);
        speak(String(remaining), volume);
      }

      if (remaining === 0) {
        const nextPhase = phase === 'play' ? 'rest' : 'play';
        setRunning(false);
        announce(phase === 'play' ? 'Round over. Rest time.' : 'Start next round.', 'end');
        setTimeout(() => startPhase(nextPhase), 900);
      }
    }, 250);

    return () => clearInterval(tick);
  }, [running, phase, volume]);

  useEffect(() => () => {
    wakeLockRef.current?.release?.();
    window.speechSynthesis?.cancel();
  }, []);

  const maxSeconds = phase === 'play' ? PLAY_SECONDS : REST_SECONDS;
  const pct = maxSeconds > 0 ? seconds / maxSeconds : 0;
  const isRest = phase === 'rest';

  return (
    <div className={cn('glass rounded-3xl p-5 space-y-5 border', isRest ? 'border-yellow-400/30' : 'border-primary/20', fullscreen && 'fixed inset-0 z-[100] rounded-none bg-background flex flex-col justify-center p-8')}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{isRest ? 'Rest Time' : 'Play Time'}</p>
          <p className="text-sm text-muted-foreground">8 min play · 2 min rest · sound, speech and vibration cues</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={unlockAudio} disabled={disabled} title="Enable sound">
            {audioReady ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setFullscreen(value => !value)}>
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className={cn('font-mono font-black text-center tracking-tight text-7xl sm:text-8xl', isRest ? 'text-yellow-400' : 'text-primary', fullscreen && 'text-[24vw]')}>
        {formatTime(seconds)}
      </div>

      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-300', isRest ? 'bg-yellow-400' : 'bg-primary')} style={{ width: `${pct * 100}%` }} />
      </div>

      {!fullscreen && (
        <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={event => setVolume(Number(event.target.value))} className="w-full" />
          <span className="text-xs font-mono text-muted-foreground w-10 text-right">{Math.round(volume * 100)}%</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button className="flex-1 bg-primary text-primary-foreground gap-2 h-12" onClick={running ? () => setRunning(false) : () => startPhase(phase)} disabled={disabled}>
          {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start Timer</>}
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2 h-12"><RotateCcw className="w-4 h-4" /> Reset</Button>
      </div>

      {!audioReady && (
        <p className="text-[11px] text-muted-foreground text-center">Tap Enable Sound or Start Timer once before play so the browser allows announcements.</p>
      )}
    </div>
  );
}