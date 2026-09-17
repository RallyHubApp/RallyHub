import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { prepareLogoDraft } from '../src/pages/DirectoryListingEdit.jsx';

async function canvasFile({ width, height, background, draw }) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, width, height); }
  draw(ctx);
  const blob = await new Promise((resolve, reject) => canvas.toBlob(v => v ? resolve(v) : reject(new Error('blob failed')), 'image/png'));
  return new File([blob], 'test-logo.png', { type: 'image/png' });
}

function App() {
  const [result, setResult] = useState(null);
  const run = async type => {
    let file;
    if (type === 'transparent') {
      file = await canvasFile({ width: 400, height: 300, draw: ctx => { ctx.fillStyle = '#b91c1c'; ctx.fillRect(100, 50, 200, 200); } });
    } else if (type === 'white') {
      file = await canvasFile({ width: 400, height: 400, background: '#ffffff', draw: ctx => { ctx.fillStyle = '#2563eb'; ctx.fillRect(100, 120, 200, 160); } });
    } else {
      file = await canvasFile({ width: 300, height: 300, background: '#111827', draw: ctx => { ctx.fillStyle = '#f9fafb'; ctx.fillRect(80, 80, 140, 140); } });
    }
    const draft = await prepareLogoDraft(file);
    setResult({ type, width: draft.width, height: draft.height, autoTrimmed: draft.autoTrimmed, url: draft.url });
  };
  return <main>
    <button onClick={() => run('transparent')}>Transparent padding</button>
    <button onClick={() => run('white')}>White padding</button>
    <button onClick={() => run('dark')}>Dark background</button>
    {result && <div data-testid="result" data-width={result.width} data-height={result.height} data-trimmed={String(result.autoTrimmed)}><img src={result.url} alt="prepared" /></div>}
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
