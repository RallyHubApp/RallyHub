export {};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    __rallyhubAudioContext?: AudioContext;
    __rallyhubPaState?: {
      active: boolean;
      ctx: AudioContext;
      stream: MediaStream;
      source: MediaStreamAudioSourceNode;
      highPass: BiquadFilterNode;
      compressor: DynamicsCompressorNode;
      gain: GainNode;
      track: MediaStreamTrack;
      micLabel: string;
      settings: MediaTrackSettings | null;
    } | null;
  }
}

