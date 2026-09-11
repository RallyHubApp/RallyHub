export {};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    __rallyhubAudioContext?: AudioContext;
  }
}

