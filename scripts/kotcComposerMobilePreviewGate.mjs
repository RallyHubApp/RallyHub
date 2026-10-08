import fs from 'node:fs';
const src=fs.readFileSync('src/pages/CommunicationsCentre.jsx','utf8');
const must=(ok,msg)=>{if(!ok){console.error('FAIL kotcComposerMobilePreviewGate:',msg);process.exit(1)}};
must(src.includes('Actual KOTC player email preview'),'KOTC production preview iframe missing');
must(src.includes('srcDoc={kotcPreview.previewHtml}'),'KOTC preview must render as an isolated email document');
must(!src.includes('dangerouslySetInnerHTML={{__html:kotcPreview.previewHtml}}'),'KOTC preview must not inject a full email document directly into the page');
must(src.includes('min-w-0 max-w-full overflow-hidden'),'mobile preview containment missing');
console.log('PASS kotcComposerMobilePreviewGate: KOTC email preview now honours its own mobile viewport and media queries');
