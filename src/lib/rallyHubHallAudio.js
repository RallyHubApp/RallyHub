import { base44 } from '@/api/base44Client';

const amplifiedSpeechCache = new Map();
let amplifiedSpeechBackoffUntil = 0;

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
    // Commercial PA-style pre-announcement cue. The host volume control scales the
    // whole chime instead of leaving the paging tones at a fixed loudness.
    bell(ctx, 523.25, now, 0.72, v * 0.52);
    bell(ctx, 659.25, now + 0.46, 0.78, v * 0.66);
    bell(ctx, 783.99, now + 0.94, 0.84, v * 0.82);
    bell(ctx, 1046.50, now + 1.46, 0.92, v);
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
  utterance.rate = 0.82;
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
  // Chrome can occasionally drop an utterance when speak() follows cancel() in the
  // same task. Queue the new utterance on the next task to make repeated hall
  // announcements more reliable.
  window.speechSynthesis.cancel();
  window.setTimeout(() => {
    window.speechSynthesis.resume?.();
    window.speechSynthesis.speak(utterance);
  }, 0);
  return true;
}

function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getAmplifiedSpeechBuffer(text, eventId = '') {
  const ctx = await unlockRallyHubAudio();
  if (!ctx) throw new Error('RallyHub audio is not available in this browser.');
  if (Date.now() < amplifiedSpeechBackoffUntil) {
    const error = new Error('Amplified hall speech is temporarily cooling down; browser voice will be used.');
    error.code = 'TTS_BACKOFF';
    throw error;
  }
  const key = `${eventId || 'global'}::${String(text || '').trim()}`;
  if (amplifiedSpeechCache.has(key)) return amplifiedSpeechCache.get(key);

  const pending = (async () => {
    const response = await base44.functions.invoke('generateHallSpeech', {
      text:String(text || '').trim(),
      eventId:eventId || undefined,
    });
    const payload = response?.data || {};
    if (!payload?.audio_base64) {
      const error = new Error(payload?.error || 'Amplified hall speech was not returned.');
      error.code = payload?.code || 'TTS_UNAVAILABLE';
      throw error;
    }
    const arrayBuffer = base64ToArrayBuffer(payload.audio_base64);
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    return { audioBuffer, provider:payload.provider || 'generated', voice:payload.voice || '' };
  })();

  amplifiedSpeechCache.set(key, pending);
  try {
    return await pending;
  } catch (error) {
    amplifiedSpeechCache.delete(key);
    // Avoid a burst of provider requests when amplified TTS is unavailable.
    // Browser speech remains the immediate fallback; retry TTS after a short cooldown.
    amplifiedSpeechBackoffUntil = Date.now() + 15000;
    throw error;
  }
}

function stopGeneratedHallSpeech() {
  const state = typeof window !== 'undefined' ? window.__rallyhubGeneratedHallVoice : null;
  if (!state) return false;
  try { state.source?.stop?.(); } catch {}
  try { state.source?.disconnect?.(); } catch {}
  try { state.preGain?.disconnect?.(); } catch {}
  try { state.compressor?.disconnect?.(); } catch {}
  try { state.outputGain?.disconnect?.(); } catch {}
  window.__rallyhubGeneratedHallVoice = null;
  return true;
}

export async function primeRallyHubHallSpeech(texts, { eventId = '' } = {}) {
  const queue = [...new Set((Array.isArray(texts) ? texts : [texts]).map(v => String(v || '').trim()).filter(Boolean))];
  if (!queue.length) return true;
  const workers = Array.from({ length:Math.min(1, queue.length) }, async () => {
    while (queue.length) {
      const text = queue.shift();
      try { await getAmplifiedSpeechBuffer(text, eventId); } catch { /* browser voice remains the fallback */ }
    }
  });
  await Promise.all(workers);
  return true;
}

export async function speakRallyHubHall(text, {
  volume = 1,
  eventId = '',
  voiceMode = 'rallyhub_default',
  voices = [],
  engineMode = 'amplified',
  fallback = true,
  onStart,
  onEnd,
  onError,
  onEngine,
} = {}) {
  if (!text || voiceMode === 'off') return false;

  if (engineMode === 'browser') {
    window.__rallyhubHallVoiceEngine = 'browser';
    onEngine?.('browser');
    return speakRallyHub(text, {
      volume,
      voiceMode,
      voices,
      onStart,
      onEnd,
      onError,
    });
  }

  try {
    const ctx = await unlockRallyHubAudio();
    if (!ctx) throw new Error('RallyHub audio is not available in this browser.');
    const { audioBuffer, provider } = await getAmplifiedSpeechBuffer(text, eventId);

    stopGeneratedHallSpeech();
    window.speechSynthesis?.cancel?.();

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    // Broadcast-style loudness stage: push speech into a fast limiter so its
    // average level is much closer to music/video sources without clipping.
    const preGain = ctx.createGain();
    preGain.gain.setValueAtTime(Math.max(0.01, Math.min(3.2, 2.25 * Math.max(0, Math.min(1, Number(volume) || 0)))), ctx.currentTime);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, ctx.currentTime);
    compressor.knee.setValueAtTime(8, ctx.currentTime);
    compressor.ratio.setValueAtTime(10, ctx.currentTime);
    compressor.attack.setValueAtTime(0.002, ctx.currentTime);
    compressor.release.setValueAtTime(0.12, ctx.currentTime);

    const outputGain = ctx.createGain();
    outputGain.gain.setValueAtTime(0.96, ctx.currentTime);

    source.connect(preGain);
    preGain.connect(compressor);
    compressor.connect(outputGain);
    outputGain.connect(ctx.destination);

    window.__rallyhubGeneratedHallVoice = { source, preGain, compressor, outputGain, provider };
    window.__rallyhubHallVoiceEngine = 'amplified';
    onEngine?.('amplified');
    source.onended = () => {
      if (window.__rallyhubGeneratedHallVoice?.source === source) window.__rallyhubGeneratedHallVoice = null;
      try { source.disconnect(); } catch {}
      try { preGain.disconnect(); } catch {}
      try { compressor.disconnect(); } catch {}
      try { outputGain.disconnect(); } catch {}
      onEnd?.();
    };
    source.start();
    onStart?.();
    return true;
  } catch (error) {
    window.__rallyhubHallVoiceEngine = 'browser-fallback';
    onEngine?.('browser-fallback');
    if (!fallback) {
      onError?.(error);
      return false;
    }
    const ok = speakRallyHub(text, {
      volume,
      voiceMode,
      voices,
      onStart,
      onEnd,
      onError,
    });
    if (!ok) onError?.(error);
    return ok;
  }
}

export function getRallyHubHallVoiceEngine() {
  if (typeof window === 'undefined') return 'unknown';
  return window.__rallyhubHallVoiceEngine || 'not-tested';
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

  const explicitExternalMic = !!deviceId && deviceId !== 'default';
  // Chrome's capture processing can aggressively suppress a deliberately monitored
  // external mic because the browser interprets the speaker return as echo. Keep
  // processing for the system-default mic, but use a direct capture path when the
  // host explicitly selects a USB/webcam microphone.
  const audioConstraints = explicitExternalMic
    ? {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: { ideal: 1 },
        deviceId: { exact: deviceId },
      }
    : {
        // For the built-in laptop mic, keep browser echo/noise processing but
        // disable AGC. AGC was audibly pumping room noise and raising hiss
        // between words when the PA return was a Bluetooth speaker.
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: false },
        channelCount: { ideal: 1 },
      };

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

  // Remove low rumble and gently roll off the top end. The latter helps the
  // built-in mic + Bluetooth speaker path sound less brittle and reduces hiss
  // without noticeably dulling speech.
  const lowPass = ctx.createBiquadFilter();
  lowPass.type = 'lowpass';
  lowPass.frequency.setValueAtTime(7600, ctx.currentTime);
  lowPass.Q.setValueAtTime(0.55, ctx.currentTime);

  const compressor = ctx.createDynamicsCompressor();
  // Gentle speech control only. The previous 4:1 compression made background
  // noise and Bluetooth return more obvious between phrases.
  compressor.threshold.setValueAtTime(-14, ctx.currentTime);
  compressor.knee.setValueAtTime(18, ctx.currentTime);
  compressor.ratio.setValueAtTime(2.2, ctx.currentTime);
  compressor.attack.setValueAtTime(0.012, ctx.currentTime);
  compressor.release.setValueAtTime(0.28, ctx.currentTime);

  const gain = ctx.createGain();
  const targetGain = Math.max(0, Math.min(1.5, Number(volume) || 0));
  // Fade in instead of connecting the microphone at full gain, which avoids the
  // startup thump/bang heard when the host enables Live PA.
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetGain), ctx.currentTime + 0.18);

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.7;

  source.connect(highPass);
  highPass.connect(lowPass);
  lowPass.connect(compressor);
  compressor.connect(gain);
  compressor.connect(analyser);
  gain.connect(ctx.destination);

  const settings = track.getSettings?.() || null;
  window.__rallyhubPaState = {
    active: true,
    ctx,
    stream,
    source,
    highPass,
    lowPass,
    compressor,
    gain,
    analyser,
    track,
    micLabel: track.label || 'Default microphone',
    settings,
  };

  return getRallyHubPaInfo();
}

export function getRallyHubPaLevel() {
  const state = getPaState();
  if (!state?.active || !state?.analyser) return 0;
  const data = new Uint8Array(state.analyser.fftSize);
  state.analyser.getByteTimeDomainData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    const sample = (data[i] - 128) / 128;
    sum += sample * sample;
  }
  const rms = Math.sqrt(sum / data.length);
  return Math.max(0, Math.min(1, rms * 5));
}

export function stopRallyHubPA() {
  const state = getPaState();
  if (!state) return false;
  try { state.source?.disconnect?.(); } catch {}
  try { state.highPass?.disconnect?.(); } catch {}
  try { state.lowPass?.disconnect?.(); } catch {}
  try { state.compressor?.disconnect?.(); } catch {}
  try { state.analyser?.disconnect?.(); } catch {}
  try { state.gain?.disconnect?.(); } catch {}
  try { state.stream?.getTracks?.().forEach(track => track.stop()); } catch {}
  window.__rallyhubPaState = null;
  return true;
}

export function stopAllRallyHubAudio() {
  stopRallyHubPA();
  stopGeneratedHallSpeech();
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel?.();
}
