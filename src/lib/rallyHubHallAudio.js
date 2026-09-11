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
  beep(ctx, 740, now, 0.14, v * 0.9);
}

export function chooseRallyHubVoice(voices, mode = 'irish_female') {
  if (!voices?.length || mode === 'device_default') return null;
  const ie = voices.filter(v => /^en[-_]IE$/i.test(v.lang) || /irish|ireland/i.test(`${v.name} ${v.lang}`));
  const femaleHint = /female|siri.*(female|2)|moira|fiona|caitlin|orla|aoife/i;
  const maleHint = /male|siri.*(male|1)|liam|sean|colm|cian/i;
  if (mode === 'irish_female') return ie.find(v => femaleHint.test(v.name)) || ie.find(v => !maleHint.test(v.name)) || ie[0] || null;
  if (mode === 'irish_male') return ie.find(v => maleHint.test(v.name)) || ie.find(v => !femaleHint.test(v.name)) || ie[0] || null;
  return null;
}

export function speakRallyHub(text, { volume = 1, voiceMode = 'irish_female', voices = [] } = {}) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window) || voiceMode === 'off') return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = Math.max(0, Math.min(1, Number(volume) || 0));
  utterance.lang = 'en-IE';
  utterance.rate = 0.92;
  utterance.pitch = 1;
  const voice = chooseRallyHubVoice(voices, voiceMode);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume?.();
  window.speechSynthesis.speak(utterance);
  return true;
}

export async function unlockRallyHubAudio() {
  const ctx = getRallyHubAudioContext();
  if (ctx?.state === 'suspended') await ctx.resume();
  return ctx;
}
