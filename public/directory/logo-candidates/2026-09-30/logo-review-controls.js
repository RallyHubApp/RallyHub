/* RallyHub Directory archived logo review — UI-only, never uploads or publishes. */
(() => {
  const cards = [...document.querySelectorAll('main.grid article.card')];
  const selections = new Map();
  const STORAGE_KEY = 'rallyhub-directory-logo-review-2026-09-30-v1';
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
    count.textContent=n+' selected for next batch · '+(cards.length-1-n)+' held · 1 already imported';
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
    let proposedUrl='';
    if(!candidate){
      checkbox.disabled=true;
      const entry=document.createElement('input');
      entry.type='url';entry.placeholder='Paste official logo image HTTPS URL';
      entry.setAttribute('aria-label',name+' official image URL');
      entry.style.cssText='display:block;width:100%;margin:10px 0 5px;padding:9px;border:1px solid #b6c4d5;border-radius:8px;font-size:12px';
      const preview=document.createElement('img');
      preview.alt=name+' proposed logo (unverified preview)';
      preview.style.cssText='display:none;max-width:100%;max-height:140px;object-fit:contain;margin:8px auto';
      const status=document.createElement('div');status.className='review-hint';
      status.textContent='A preview must load before this can be submitted for further verification.';
      let sequence=0;
      entry.addEventListener('input',()=>{
        checkbox.checked=false;selections.delete(number);update();
        proposedUrl='';preview.style.display='none';checkbox.disabled=true;
        const current=++sequence;
        const url=safeLink(entry.value.trim());
        if(!url || !url.startsWith('https://')){status.textContent=entry.value.trim()?'Use a direct HTTPS image URL.':'A preview must load before this can be submitted.';return;}
        preview.onload=()=>{if(current!==sequence)return;proposedUrl=url;checkbox.disabled=false;preview.style.display='block';status.textContent='Image preview loaded; candidate is not yet source or checksum verified.';if(recovered?.proposed && recovered.image===url){checkbox.checked=true;selections.set(number,{number,name,image:url,proposed:true});update();}};
        preview.onerror=()=>{if(current!==sequence)return;status.textContent='Could not load this image. Try another official source URL.';};
        preview.src=url;
      });
      controls.append(entry,preview,status);
      if (recovered?.proposed) { entry.value=recovered.image; entry.dispatchEvent(new Event('input')); }
    }
    existingPhoto?.addEventListener('error',()=>{
      checkbox.disabled=true;checkbox.checked=false;selections.delete(number);hint.textContent='Archived thumbnail unavailable — on HOLD until replaced.';update();
    });
    checkbox.addEventListener('change',()=>{
      if(checkbox.checked){
        const src=candidate ? existingPhoto?.getAttribute('src') : proposedUrl;
        if(!src){checkbox.checked=false;return;}
        selections.set(number,{number,name,image:src,proposed:!candidate});
      }else selections.delete(number);
      update();
    });
    if(candidate && recovered && !recovered.proposed && recovered.image===existingPhoto?.getAttribute('src')) { checkbox.checked=true;selections.set(number,recovered); }
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
      '\nAll unselected entries remain HOLD. ezPICKLEBALL #18 is excluded from new uploads. Check official sources, image hashes and duplicates before staging. Request separate explicit approval before publishing.';
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