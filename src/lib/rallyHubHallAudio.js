export function getRallyHubAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (window.__rallyhubAudioContext) return window.__rallyhubAudioContext;
  const ctx = new AudioContext();
  window.__rallyhubAudioContext = ctx;
  return ctx;
}

function beep(ctx, frequency, start, duration, volume) {
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, Math.min(1, volume)), start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

function bell(ctx, frequency, start, duration, volume) {
  if (!ctx) return;
  const master = ctx.createGain();
  const peak = Math.max(0.0001, Math.min(1, volume));
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(peak, start + 0.015);
  master.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  master.connect(ctx.destination);

  [
    [1, 0.72],
    [2.01, 0.20],
    [3.98, 0.08],
  ].forEach(([multiple, level]) => {
    const oscillator = ctx.createOscillator();
    const partialGain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency * multiple, start);
    partialGain.gain.setValueAtTime(level, start);
    oscillator.connect(partialGain);
    partialGain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  });
}

export function playRallyHubSignal(ctx, type = 'warning', volume = 1) {
  if (!ctx) return;
  const now = ctx.currentTime;
  const v = Math.max(0, Math.min(1, Number(volume) || 0));
  if (type === 'start') {
    beep(ctx, 880, now, 0.18, v);
    beep(ctx, 1175, now + 0.22, 0.22, v);
    return;
  }
  if (type === 'end') {
    beep(ctx, 440, now, 0.22, v);
    beep(ctx, 440, now + 0.28, 0.22, v);
    beep(ctx, 330, now + 0.56, 0.35, v);
    return;
  }
  if (type === 'announcement') {
    // Commercial PA-style pre-announcement cue: four ascending resonant tones.
    // The tones overlap slightly so they ring like a paging chime rather than UI beeps.
    bell(ctx, 523.25, now, 1.10, 0.52);
    bell(ctx, 659.25, now + 0.82, 1.15, 0.66);
    bell(ctx, 783.99, now + 1.68, 1.25, 0.82);
    bell(ctx, 1046.50, now + 2.58, 1.40, 1.0);
    return;
  }
  beep(ctx, 740, now, 0.14, v * 0.9);
}

export function getRallyHubDeviceLocale() {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = [...(navigator.languages || []), navigator.language].filter(Boolean);
  const preferred = candidates[0] || 'en';
  try {
    return Intl.getCanonicalLocales(preferred)[0] || preferred;
  } catch {
    return preferred;
  }
}

export function chooseRallyHubVoice(voices, mode = 'rallyhub_default') {
  const available = voices?.length
    ? voices
    : (typeof window !== 'undefined' ? window.speechSynthesis?.getVoices?.() || [] : []);
  if (!available.length || mode === 'off') return null;

  const locale = getRallyHubDeviceLocale().toLowerCase();
  const baseLanguage = locale.split('-')[0];
  const normalise = value => String(value || '').replace('_', '-').toLowerCase();
  const femaleHint = /female|woman|girl|emily|sonia|libby|hazel|susan|serena|moira|fiona|caitlin|orla|aoife|samantha/i;
  const maleHint = /male|man|boy|connor|ryan|daniel|george|liam|sean|colm|cian/i;
  const preferFemaleThenMale = candidates => {
    if (!candidates.length) return null;
    return candidates.find(v => femaleHint.test(v.name))
      || candidates.find(v => !maleHint.test(v.name))
      || candidates.find(v => maleHint.test(v.name))
      || candidates[0]
      || null;
  };

  if (mode === 'rallyhub_default' || mode === 'device_default') {
    const exactLocale = available.filter(v => normalise(v.lang) === locale);
    const sameLanguage = available.filter(v => normalise(v.lang).split('-')[0] === baseLanguage);
    // Follow the host device/browser locale first. Within that locale, prefer a female voice;
    // if one is not exposed, use a male/neutral voice before falling back to the browser default.
    return preferFemaleThenMale(exactLocale)
      || preferFemaleThenMale(sameLanguage)
      || available.find(v => v.default)
      || available[0]
      || null;
  }

  return null;
}

function createRallyHubUtterance(text, { volume = 1, voiceMode = 'rallyhub_default', voices = [] } = {}) {
  const utterance = new SpeechSynthesisUtterance(text);
  // Shared RallyHub announcer profile. Language follows the host device/browser locale.
  utterance.volume = Math.max(0, Math.min(1, Number(volume) || 0));
  utterance.rate = 0.88;
  utterance.pitch = 1;
  const deviceLocale = getRallyHubDeviceLocale();
  utterance.lang = deviceLocale;
  const voice = chooseRallyHubVoice(voices, voiceMode);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || deviceLocale;
  }
  return utterance;
}

/**
 * @param {string} text
 * @param {{ volume?: number, voiceMode?: string, voices?: SpeechSynthesisVoice[], onStart?: (event: any) => void, onEnd?: (event: any) => void, onError?: (event: any) => void }} [options]
 */
export function speakRallyHub(text, options = {}) {
  const { volume = 1, voiceMode = 'rallyhub_default', voices = [], onStart, onEnd, onError } = options;
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window) || voiceMode === 'off') return false;
  const utterance = createRallyHubUtterance(text, { volume, voiceMode, voices });
  window.__rallyhubUtterance = utterance;
  if (onStart) utterance.onstart = onStart;
  utterance.onend = event => {
    if (window.__rallyhubUtterance === utterance) window.__rallyhubUtterance = null;
    onEnd?.(event);
  };
  utterance.onerror = event => {
    if (window.__rallyhubUtterance === utterance) window.__rallyhubUtterance = null;
    onError?.(event);
  };
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume?.();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function speakRallyHubAsync(text, { volume = 1, voiceMode = 'rallyhub_default', voices = [] } = {}) {
  return new Promise((resolve, reject) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window) || voiceMode === 'off') {
      reject(new Error('Text-to-speech is not available.'));
      return;
    }
    const utterance = createRallyHubUtterance(text, { volume, voiceMode, voices });
    let started = false;
    const timeout = window.setTimeout(() => {
      if (!started) reject(new Error('The device voice did not start. Try Test Sound and check this device’s language/voice settings.'));
    }, 5000);
    utterance.onstart = () => { started = true; window.clearTimeout(timeout); };
    utterance.onend = () => { window.clearTimeout(timeout); resolve(true); };
    utterance.onerror = event => { window.clearTimeout(timeout); reject(new Error(event?.error ? `Voice playback failed: ${event.error}` : 'Voice playback failed.')); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume?.();
    window.speechSynthesis.speak(utterance);
  });
}

export async function unlockRallyHubAudio() {
  const ctx = getRallyHubAudioContext();
  if (ctx?.state === 'suspended') await ctx.resume();
  return ctx;
}

function getPaState() {
  if (typeof window === 'undefined') return null;
  return window.__rallyhubPaState || null;
}

export function isRallyHubPaActive() {
  return !!getPaState()?.active;
}

export function getRallyHubPaInfo() {
  const state = getPaState();
  if (!state) return { active: false, micLabel: '', settings: null };
  return { active: !!state.active, micLabel: state.micLabel || '', settings: state.settings || null };
}

export function setRallyHubPaGain(volume = 1) {
  const state = getPaState();
  if (!state?.gain || !state?.ctx) return false;
  const value = Math.max(0, Math.min(1.5, Number(volume) || 0));
  state.gain.gain.setTargetAtTime(value, state.ctx.currentTime, 0.02);
  return true;
}

export async function listRallyHubMicrophones() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return [];
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter(device => device.kind === 'audioinput')
    .map((device, index) => ({
      deviceId: device.deviceId,
      groupId: device.groupId,
      label: device.label || `Microphone ${index + 1}`,
    }));
}

export async function startRallyHubPA({ volume = 1, deviceId = '' } = {}) {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') throw new Error('Live PA is not available on this device.');
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser does not support microphone access for RallyHub PA.');

  const existing = getPaState();
  if (existing?.active) {
    setRallyHubPaGain(volume);
    return getRallyHubPaInfo();
  }

  const ctx = await unlockRallyHubAudio();
  if (!ctx) throw new Error('This browser does not support RallyHub audio.');

  window.speechSynthesis?.cancel?.();

  const audioConstraints = {
    echoCancellation: { ideal: true },
    noiseSuppression: { ideal: true },
    autoGainControl: { ideal: true },
    channelCount: { ideal: 1 },
  };
  if (deviceId && deviceId !== 'default') audioConstraints.deviceId = { exact: deviceId };

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: audioConstraints,
    video: false,
  });

  const track = stream.getAudioTracks()[0];
  if (!track) {
    stream.getTracks().forEach(t => t.stop());
    throw new Error('RallyHub could not find an active microphone.');
  }

  const source = ctx.createMediaStreamSource(stream);
  const highPass = ctx.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.setValueAtTime(90, ctx.currentTime);
  highPass.Q.setValueAtTime(0.7, ctx.currentTime);

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-20, ctx.currentTime);
  compressor.knee.setValueAtTime(12, ctx.currentTime);
  compressor.ratio.setValueAtTime(4, ctx.currentTime);
  compressor.attack.setValueAtTime(0.004, ctx.currentTime);
  compressor.release.setValueAtTime(0.18, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(Math.max(0, Math.min(1.5, Number(volume) || 0)), ctx.currentTime);

  source.connect(highPass);
  highPass.connect(compressor);
  compressor.connect(gain);
  gain.connect(ctx.destination);

  const settings = track.getSettings?.() || null;
  window.__rallyhubPaState = {
    active: true,
    ctx,
    stream,
    source,
    highPass,
    compressor,
    gain,
    track,
    micLabel: track.label || 'Default microphone',
    settings,
  };

  return getRallyHubPaInfo();
}

export function stopRallyHubPA() {
  const state = getPaState();
  if (!state) return false;
  try { state.source?.disconnect?.(); } catch {}
  try { state.highPass?.disconnect?.(); } catch {}
  try { state.compressor?.disconnect?.(); } catch {}
  try { state.gain?.disconnect?.(); } catch {}
  try { state.stream?.getTracks?.().forEach(track => track.stop()); } catch {}
  window.__rallyhubPaState = null;
  return true;
}

export function stopAllRallyHubAudio() {
  stopRallyHubPA();
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel?.();
}
