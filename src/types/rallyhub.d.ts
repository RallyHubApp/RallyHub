export {};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    __rallyhubAudioContext?: AudioContext;
  }
}

declare module 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm' {
  const XLSX: any;
  export = XLSX;
}
