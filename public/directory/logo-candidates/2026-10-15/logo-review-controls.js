/* RallyHub Directory remaining club logo review — UI-only, never uploads or publishes. */
(() => {
  const cards = [...document.querySelectorAll('main.grid article.card')];
  const selections = new Map();
  const STORAGE_KEY = 'rallyhub-directory-logo-review-2026-10-15-v1';
  let restored = [];
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); if (Array.isArray(saved)) restored = saved; } catch { /* Private browsing may restrict storage. */ }
  const persist = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...selections.values()])); } catch { /* Copy/export still available. */ } };
  const encoded = v => encodeURIComponent(v);
  const safeLink = url => {
    try { const u=new URL(url,location.origin); return ['https:','http:'].includes(u.protocol) ? u.href : null; }
    catch { return null; }
  };
  const footer = document.createElement('section');
  footer.className='review-footer';
  footer.setAttribute('aria-label','Logo batch review controls');
  footer.innerHTML='<div class="actions"><div id="review-count" aria-live="polite">0 selected</div><button type="button" class="secondary" id="review-clear">Clear selections</button><button type="button" id="review-copy">Copy reviewed batch</button></div><p class="research-note">Review only: this does not upload or publish. Only your explicitly confirmed selection will be sent for source, HTTPS and checksum checks.</p><div id="review-result" role="status" aria-live="polite"></div>';
  document.querySelector('main.grid').insertAdjacentElement('afterend', footer);
  const count=footer.querySelector('#review-count');
  const result=footer.querySelector('#review-result');
  const copy=footer.querySelector('#review-copy');
  const update=(save=true) => {
    if (save) persist();
    const n=selections.size;
    count.textContent=n+' selected for review · '+(cards.length-n)+' remaining unselected';
    copy.disabled=n===0;
    for(const card of cards){const number=card.querySelector('.num')?.textContent.trim();card.classList.toggle('review-approved',selections.has(number));}
  };
  for(const card of cards){
    const number=card.querySelector('.num')?.textContent.trim();
    const name=card.querySelector('h2')?.textContent.trim()||'Unknown club';
    const existingPhoto=card.querySelector('.image img');
    const imported=card.dataset.imported==='true';
    const controls=document.createElement('div');
    controls.className='review-control';
    if(imported){
      card.classList.add('imported');
      controls.innerHTML='<div class="review-hint"><strong>Already imported.</strong> This is the exact live RallyHub logo, excluded from new uploads. No approval tick available.</div>';
      card.appendChild(controls);
      continue;
    }
    const checkbox=document.createElement('input');
    checkbox.type='checkbox';
    checkbox.setAttribute('aria-label','Approve '+name+' for next staging batch');
    const label=document.createElement('label');
    const labelText=document.createElement('span');
    labelText.textContent='Approve for next batch';
    label.append(checkbox,labelText);
    controls.append(label);
    const hint=document.createElement('p');
    hint.className='review-hint';
    const candidate=Boolean(existingPhoto);
    const recovered=restored.find(x=>String(x.number)===number && x.name===name && !!x.image);
    hint.textContent=candidate?'Candidate only — not imported. Unticked by default; check the official source before selecting.':'No verified logo candidate yet. Search official sources and enter an image URL to propose one.';
    controls.append(hint);
    const research=document.createElement('div');
    research.className='research-links';
    const searchBase=name+' pickleball club '+(card.querySelector('.county')?.textContent||'')+' ';
    for(const [labelText,q] of [['Facebook',searchBase+'site:facebook.com'],['Instagram',searchBase+'site:instagram.com'],['Website',searchBase+'official website']]){
      const anchor=document.createElement('a');anchor.textContent=labelText+' ↗';anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.href='https://www.google.com/search?q='+encoded(q);research.append(anchor);
    }
    controls.append(research);
    // Always allow a different candidate, even if this card has an archived image.
    // Keep the original candidate in view until a replacement has loaded.
    let proposedUrl='';
    let replacementReady=false;
    const originalSrc=existingPhoto?.getAttribute('src') || '';
    const imageBox=card.querySelector('.image');
    const imageContent=imageBox.innerHTML;
    const entry=document.createElement('input');
    entry.type='url';
    entry.placeholder=candidate?'Paste a BETTER logo HTTPS image URL':'Paste official logo image HTTPS URL';
    entry.setAttribute('aria-label',name+' replacement or new official image URL');
    entry.style.cssText='display:block;width:100%;margin:10px 0 5px;padding:9px;border:1px solid #b6c4d5;border-radius:8px;font-size:12px';
    const status=document.createElement('div');status.className='review-hint';
    status.textContent=candidate?'Not happy with this candidate? Paste a better direct image URL to replace it.':'A preview must load before this can be submitted for verification.';
    const reset=document.createElement('button');
    reset.type='button';reset.className='review-reset';reset.textContent='Use original candidate';
    reset.style.cssText='display:none;margin:5px 0 0;padding:7px 9px;border-radius:7px;border:1px solid #b6c4d5;background:#f2f7fd;color:#0c2257;cursor:pointer;font-weight:700';
    let sequence=0;
    const showOriginal=()=>{
      imageBox.innerHTML=imageContent;
      replacementReady=false;proposedUrl='';reset.style.display='none';
      checkbox.disabled=!candidate;
    };
    const recordSelected=()=>{
      if(!checkbox.checked){selections.delete(number);update();return;}
      const src=replacementReady ? proposedUrl : originalSrc;
      if(!src){checkbox.checked=false;selections.delete(number);update();return;}
      selections.set(number,{number,name,image:src,proposed:replacementReady});
      update();
    };
    entry.addEventListener('input',()=>{
      const current=++sequence;
      const url=safeLink(entry.value.trim());
      if(!entry.value.trim()){
        showOriginal();status.textContent=candidate?'Original candidate restored. You can still paste a replacement.':'Paste an HTTPS image address to preview it.';
        // Existing approval reverts to the original candidate instead of keeping a stale replacement URL.
        recordSelected();return;
      }
      replacementReady=false;proposedUrl='';checkbox.disabled=true;
      if(checkbox.checked){checkbox.checked=false;selections.delete(number);update();}
      status.textContent='Checking replacement image…';
      if(!url || !url.startsWith('https://')){status.textContent='Use a direct HTTPS image URL.';return;}
      const test=new Image();
      test.onload=()=>{
        if(current!==sequence)return;
        proposedUrl=url;replacementReady=true;checkbox.disabled=false;
        imageBox.replaceChildren(test);
        test.alt=name+' replacement candidate (not yet verified)';
        test.style.cssText='max-width:92%;max-height:92%;width:auto;height:auto;object-fit:contain';
        reset.style.display=candidate?'inline-block':'none';
        status.textContent='Replacement preview loaded. Tick Approve for next batch to select THIS image instead of the original.';
        if(recovered?.proposed && recovered.image===url){checkbox.checked=true;recordSelected();}
      };
      test.onerror=()=>{if(current!==sequence)return;status.textContent='Image did not load. Paste another direct image URL. Original candidate is not approved.';};
      test.src=url;
    });
    reset.addEventListener('click',()=>{
      entry.value='';++sequence;showOriginal();status.textContent='Original archived candidate restored.';
      checkbox.checked=false;selections.delete(number);update();
    });
    controls.append(entry,reset,status);
    // If the underlying archived image fails, an HTTPS replacement remains possible.
    existingPhoto?.addEventListener('error',()=>{
      if(replacementReady)return;
      checkbox.disabled=true;checkbox.checked=false;selections.delete(number);
      hint.textContent='Archived thumbnail unavailable — paste a replacement HTTPS image URL.';update();
    });
    checkbox.addEventListener('change',recordSelected);
    if(recovered?.proposed){entry.value=recovered.image;entry.dispatchEvent(new Event('input'));}
    else if(candidate && recovered && recovered.image===originalSrc){checkbox.checked=true;recordSelected();}
    else if(!candidate)checkbox.disabled=true;
    card.append(controls);
  }
  footer.querySelector('#review-clear').addEventListener('click',()=>{
    document.querySelectorAll('.review-control input[type=checkbox]').forEach(x=>x.checked=false);
    selections.clear();result.textContent='Selections cleared.';update();
  });
  copy.addEventListener('click',async()=>{
    const lines=[...selections.values()].sort((a,b)=>Number(a.number)-Number(b.number))
      .map(x=>'#'+x.number+' '+x.name+' | '+(x.proposed?'PROPOSED HTTPS IMAGE (requires independent verification)':'ARCHIVED CANDIDATE')+' | '+x.image);
    const note='RallyHub Directory logo visual review (not publication approval). Approved for staging checks:\n'+lines.join('\n')+
      '\nAll unselected entries remain HOLD. Existing RallyHub logos are excluded from this 56-club queue. Check official sources, image hashes and duplicates before staging. Request separate explicit approval before publishing.';
    persist();
    // Always display a manual-copy export BEFORE attempting the clipboard API.
    // Clipboard permissions can fail or hang silently on some mobile browsers.
    result.replaceChildren();
    const heading=document.createElement('p');
    heading.textContent=lines.length+' reviewed logos ready — copy or share the full batch below.';
    const manual=document.createElement('textarea');
    manual.value=note;
    manual.readOnly=true;
    manual.setAttribute('aria-label','Reviewed logo batch text — long press to copy');
    manual.style.cssText='box-sizing:border-box;display:block;width:100%;min-height:150px;margin:8px 0;padding:10px;border:2px solid #0b7650;border-radius:8px;font-size:13px;line-height:1.4;background:#fff;color:#111;';
    const help=document.createElement('p');
    help.textContent='If automatic copying is blocked, long-press the text above, select all and copy. You can also save a text-file backup.';
    const download=document.createElement('button');
    download.type='button';download.textContent='Save reviewed batch as text file';
    download.addEventListener('click',()=>{
      const blob=new Blob([note],{type:'text/plain;charset=utf-8'});
      const objectUrl=URL.createObjectURL(blob);
      const link=document.createElement('a');link.href=objectUrl;link.download='rallyhub-reviewed-logo-batch.txt';
      document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(objectUrl),30000);
    });
    const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Batch is shown below. Attempting clipboard copy…';
    result.append(heading,manual,help,download,status);
    result.scrollIntoView({block:'nearest',behavior:'smooth'});
    // Keep the manual text visible even when clipboard permission is denied.
    // A short timeout ensures mobile users are not stuck waiting forever.
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      const copied=await Promise.race([
        navigator.clipboard.writeText(note).then(()=>true),
        new Promise(resolve=>setTimeout(()=>resolve(false),2500))
      ]);
      status.textContent=copied ? 'Copied '+lines.length+' reviewed logos. Paste into ChatGPT.' : 'Clipboard did not respond. Use the visible text or Save reviewed batch as text file.';
    } catch {
      status.textContent='Automatic clipboard copy blocked. Use the visible text or Save reviewed batch as text file.';
    }
  });
  update(false);
})();