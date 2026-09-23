export {};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    __rallyhubAudioContext?: AudioContext;
    __rallyhubUtterance?: SpeechSynthesisUtterance | null;
    __rallyhubPaState?: {
      active: boolean;
      ctx: AudioContext;
      stream: MediaStream;
      source: MediaStreamAudioSourceNode;
      highPass: BiquadFilterNode;
      lowPass?: BiquadFilterNode;
      compressor: DynamicsCompressorNode;
      gain: GainNode;
      track: MediaStreamTrack;
      micLabel: string;
      settings: MediaTrackSettings | null;
    } | null;
    __rallyhubGeneratedHallVoice?: {
      source: AudioBufferSourceNode;
      preGain: GainNode;
      compressor: DynamicsCompressorNode;
      outputGain: GainNode;
      provider?: string;
    } | null;
    __rallyhubHallVoiceEngine?: 'amplified' | 'browser-fallback' | string;
  }
}

