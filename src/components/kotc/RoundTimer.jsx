import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Move, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_PLAY_MINUTES = 8;
const DEFAULT_REST_MINUTES = 2;

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

export default function RoundTimer({
  disabled = false,
  playMinutes = DEFAULT_PLAY_MINUTES,
  restMinutes = DEFAULT_REST_MINUTES,
  enabled = true,
  autoStart = false,
  autoStartKey = null,
}) {
  const playSeconds = Math.max(1, Number(playMinutes) || DEFAULT_PLAY_MINUTES) * 60;
  const restSeconds = Math.max(0, Number(restMinutes) || 0) * 60;
  const [phase, setPhase] = useState('play');
  const [seconds, setSeconds] = useState(playSeconds);
  const [running, setRunning] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [floating, setFloating] = useState(false);
  const [position, setPosition] = useState({ x: 12, y: 76 });
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const deadlineRef = useRef(null);
  const lastAnnouncedRef = useRef(new Set());
  const wakeLockRef = useRef(null);
  const dragRef = useRef(null);
  const autoStartedKeyRef = useRef(null);

  const unlockAudio = async () => {
    if (!audioRef.current) audioRef.current = createAudioContext();
    if (audioRef.current?.state === 'suspended') await audioRef.current.resume();
    playSignal(audioRef.current, 'start', volume * 0.25);
    setAudioReady(true);
  };

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // Wake lock is best-effort only.
    }
  };

  const announce = (text, signal = 'warning') => {
    playSignal(audioRef.current, signal, volume * 0.7);
    speak(text, volume);
    if ('vibrate' in navigator) navigator.vibrate(signal === 'end' ? [250, 120, 250] : 120);
  };

  const startPhase = async (nextPhase, { unlock = true } = {}) => {
    if (unlock) await unlockAudio();
    await requestWakeLock();
    const duration = nextPhase === 'play' ? playSeconds : restSeconds;
    setPhase(nextPhase);
    setSeconds(duration);
    setRunning(true);
    deadlineRef.current = Date.now() + duration * 1000;
    lastAnnouncedRef.current = new Set();
    const label = nextPhase === 'play'
      ? `Start round. ${Number(playMinutes) || DEFAULT_PLAY_MINUTES} minutes.`
      : `Rest time. ${Number(restMinutes) || 0} minutes.`;
    announce(label, 'start');
  };

  const reset = () => {
    setRunning(false);
    setPhase('play');
    setSeconds(playSeconds);
    deadlineRef.current = null;
    lastAnnouncedRef.current = new Set();
    autoStartedKeyRef.current = null;
    window.speechSynthesis?.cancel();
  };

  useEffect(() => {
    if (!autoStart || !enabled || disabled || !autoStartKey) return;
    if (autoStartedKeyRef.current === autoStartKey) return;
    autoStartedKeyRef.current = autoStartKey;
    startPhase('play', { unlock: false });
    // autoStartKey is the sporting round identity; one automatic timer start per round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, autoStartKey, enabled, disabled]);

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
        setTimeout(() => startPhase(nextPhase, { unlock: false }), 900);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [running, phase, volume]);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === timerRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => () => {
    wakeLockRef.current?.release?.();
    window.speechSynthesis?.cancel();
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
        setFullscreen(false);
      } else if (timerRef.current?.requestFullscreen) {
        await timerRef.current.requestFullscreen();
        setFullscreen(true);
      } else {
        setFullscreen(value => !value);
      }
    } catch {
      // Some mobile browsers block the Fullscreen API; CSS fallback still provides a full-viewport timer.
      setFullscreen(value => !value);
    }
  };

  const startDrag = event => {
    if (!floating || fullscreen) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, x: position.x, y: position.y };
  };
  const moveDrag = event => {
    if (!dragRef.current || !floating || fullscreen) return;
    const nextX = Math.max(0, Math.min(window.innerWidth - 120, dragRef.current.x + event.clientX - dragRef.current.startX));
    const nextY = Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.y + event.clientY - dragRef.current.startY));
    setPosition({ x: nextX, y: nextY });
  };
  const endDrag = () => { dragRef.current = null; };

  const maxSeconds = phase === 'play' ? playSeconds : restSeconds;
  const pct = maxSeconds > 0 ? seconds / maxSeconds : 0;
  const isRest = phase === 'rest';
  const fallbackFullscreen = fullscreen && document.fullscreenElement !== timerRef.current;

  return (
    <div
      ref={timerRef}
      style={floating && !fullscreen ? { left: position.x, top: position.y, width: 'min(92vw, 360px)' } : undefined}
      className={cn(
        'glass rounded-2xl p-4 sm:p-5 space-y-4 border',
        isRest ? 'border-yellow-400/30' : 'border-primary/20',
        floating && !fullscreen && 'fixed z-[90] shadow-2xl bg-background/95 backdrop-blur-xl',
        fallbackFullscreen && 'fixed inset-0 z-[100] rounded-none bg-background flex flex-col justify-center p-6 sm:p-8',
        fullscreen && 'bg-background'
      )}
    >
      <div
        className={cn('flex items-center justify-between gap-2', floating && !fullscreen && 'cursor-move touch-none')}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground">{isRest ? 'Rest Time' : 'Play Time'}</p>
          {!floating && !fullscreen && <p className="text-xs text-muted-foreground">{playMinutes} min play · {restMinutes} min changeover</p>}
        </div>
        <div className="flex gap-1.5 shrink-0">
          {floating && !fullscreen && <Move className="w-4 h-4 text-muted-foreground self-center mr-1" />}
          <Button variant="outline" size="icon" onClick={unlockAudio} disabled={disabled || !enabled} title="Test / enable speaker sound">
            {audioReady ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setFloating(value => !value)} title={floating ? 'Dock timer back in page' : 'Float and move timer'}>
            {floating ? <X className="w-4 h-4" /> : <Move className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen} title="Full screen timer">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className={cn(
        'font-mono font-black text-center tracking-tight text-6xl sm:text-8xl leading-none',
        isRest ? 'text-yellow-400' : 'text-primary',
        floating && !fullscreen && 'text-5xl',
        fullscreen && 'text-[18vw] sm:text-[14vw]'
      )}>
        {formatTime(seconds)}
      </div>

      <div className="h-2.5 sm:h-3 bg-secondary rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-300', isRest ? 'bg-yellow-400' : 'bg-primary')} style={{ width: `${pct * 100}%` }} />
      </div>

      {!fullscreen && !floating && (
        <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={event => setVolume(Number(event.target.value))} className="w-full" />
          <span className="text-xs font-mono text-muted-foreground w-10 text-right">{Math.round(volume * 100)}%</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button className="flex-1 bg-primary text-primary-foreground gap-2 h-11 sm:h-12" onClick={running ? () => setRunning(false) : () => startPhase(phase)} disabled={disabled || !enabled}>
          {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start Timer</>}
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2 h-11 sm:h-12"><RotateCcw className="w-4 h-4" /> Reset</Button>
      </div>

      {!audioReady && !floating && !fullscreen && (
        <p className="text-[11px] text-muted-foreground text-center">Tap the speaker once before play to enable sound. The timer itself starts automatically when the sporting round starts.</p>
      )}
    </div>
  );
}
