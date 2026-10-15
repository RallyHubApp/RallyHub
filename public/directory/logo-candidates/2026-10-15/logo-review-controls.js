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
    count.textContent=n+' selected for review/change · '+(cards.length-n)+' cards without selections';
    copy.disabled=n===0;
    for(const card of cards){const number=card.querySelector('.num')?.textContent.trim();card.classList.toggle('review-approved',selections.has(number));}
  };
  // Card-local review controls: never update the live directory from this page.
  const attachVisualControls=(card,controls,number,name)=>{
    const imageBox=card.querySelector('.image');
    const baseImage=imageBox?.querySelector('img');
    const prior=()=>selections.get(number);
    const defaultLayout=()=>({fit:'contain',scale:100,x:0,y:0});
    let layout={...defaultLayout(),...(restored.find(x=>String(x.number)===number&&x.name===name)?.layout||{})};
    const panel=document.createElement('div');panel.className='logo-visual-panel';
    const heading=document.createElement('strong');heading.textContent='Logo size and position · preview';
    const fields=document.createElement('div');fields.className='logo-visual-fields';
    const makeSlider=(label,min,max,step,value)=>{
      const group=document.createElement('label');group.className='logo-visual-field';
      const caption=document.createElement('span');caption.textContent=label;
      const output=document.createElement('output');
      const input=document.createElement('input');input.type='range';input.min=String(min);input.max=String(max);input.step=String(step);input.value=String(value);
      input.setAttribute('aria-label',name+' '+label);
      group.append(caption,input,output);fields.append(group);return {input,output};
    };
    const fitLabel=document.createElement('label');fitLabel.className='logo-visual-field';
    fitLabel.textContent='Fit image';const fit=document.createElement('select');fit.setAttribute('aria-label',name+' image fit');
    for(const value of ['contain','cover']){const opt=document.createElement('option');opt.value=value;opt.textContent=value==='contain'?'Show whole logo':'Fill window';fit.append(opt);}
    fitLabel.append(fit);fields.append(fitLabel);
    const scale=makeSlider('Size',40,200,5,layout.scale);
    const horizontal=makeSlider('Left / right',-80,80,5,layout.x);
    const vertical=makeSlider('Up / down',-80,80,5,layout.y);
    const actions=document.createElement('div');actions.className='logo-actions';
    const save=document.createElement('button');save.type='button';save.textContent='Save position for review';
    const reset=document.createElement('button');reset.type='button';reset.textContent='Reset image position';
    actions.append(save,reset);
    const note=document.createElement('p');note.className='review-hint';
    note.textContent='Changes are preview-only. Save the adjustment to include it in your copied batch.';
    const activeImage=()=>imageBox?.querySelector('img');
    const paint=()=>{
      const img=activeImage();if(!img)return;
      img.style.width='100%';img.style.height='100%';img.style.maxWidth='none';img.style.maxHeight='none';
      img.style.objectFit=layout.fit;
      img.style.objectPosition='center center';
      img.style.transform=`translate(${layout.x}px, ${layout.y}px) scale(${layout.scale/100})`;
      img.style.transformOrigin='center center';
    };
    const reflect=()=>{
      fit.value=layout.fit;scale.input.value=String(layout.scale);horizontal.input.value=String(layout.x);vertical.input.value=String(layout.y);
      scale.output.textContent=layout.scale+'%';horizontal.output.textContent=layout.x+' px';vertical.output.textContent=layout.y+' px';
      paint();
    };
    const changed=()=>{
      layout={fit:fit.value,scale:Number(scale.input.value),x:Number(horizontal.input.value),y:Number(vertical.input.value)};
      reflect();
      note.textContent='Preview adjusted. Select Save position for review to include this change.';
    };
    [fit,scale.input,horizontal.input,vertical.input].forEach(x=>x.addEventListener('input',changed));
    save.addEventListener('click',()=>{
      const previous=prior();
      const next=previous?.action==='remove_listing'?{number,name,image:activeImage()?.getAttribute('src')||'',action:'adjust'}:{...(previous||{}),number,name,image:previous?.image||activeImage()?.getAttribute('src')||'',action:previous?.action||'adjust'};
      next.layout={...layout};selections.set(number,next);update();
      note.textContent='Position saved in review batch. No live image has been altered.';
    });
    reset.addEventListener('click',()=>{
      layout=defaultLayout();reflect();const previous=prior();
      if(previous?.layout){const next={...previous};delete next.layout;if(next.action==='adjust')selections.delete(number);else selections.set(number,next);update();}
      note.textContent='Image position reset to defaults.';
    });
    panel.append(heading,fields,actions,note);
    const listingPanel=document.createElement('div');listingPanel.className='listing-review-panel';
    const removeListing=document.createElement('button');removeListing.type='button';removeListing.className='listing-remove';
    removeListing.textContent='Flag club listing for removal';
    const listingStatus=document.createElement('p');listingStatus.className='review-hint';
    listingStatus.textContent='Use only if the club/group itself should not appear. This does not remove its logo or change the live Directory.';
    const listingCancel=document.createElement('button');listingCancel.type='button';listingCancel.className='secondary listing-cancel';listingCancel.textContent='Cancel listing-removal request';listingCancel.hidden=true;
    removeListing.addEventListener('click',()=>{
      const reason=window.prompt('Why should '+name+' be removed from the public Directory? (Required; no changes are published here)');
      if(reason===null)return;
      if(!reason.trim()){listingStatus.textContent='Please give a reason before requesting listing removal.';return;}
      selections.set(number,{number,name,action:'remove_listing',reason:reason.trim(),image:activeImage()?.getAttribute('src')||''});
      listingCancel.hidden=false;listingStatus.textContent='Listing removal REQUEST recorded. The live listing is unchanged.';update();
    });
    listingCancel.addEventListener('click',()=>{
      if(prior()?.action==='remove_listing'){selections.delete(number);update();}
      listingCancel.hidden=true;listingStatus.textContent='Listing removal request cancelled.';
    });
    listingPanel.append(removeListing,listingStatus,listingCancel);
    controls.append(panel,listingPanel);
    if(!baseImage){panel.hidden=true;}
    const restoredRequest=restored.find(x=>String(x.number)===number&&x.name===name);
    if(restoredRequest?.action==='adjust')selections.set(number,restoredRequest);
    if(prior()?.action==='remove_listing'||restoredRequest?.action==='remove_listing'){
      const saved=prior()||restored.find(x=>String(x.number)===number&&x.name===name);
      selections.set(number,saved);listingCancel.hidden=false;listingStatus.textContent='Listing-removal request restored, not published.';
    }
    // Replacement image loads asynchronously; repaint the active preview without overwriting user selections.
    if(imageBox){const observer=new MutationObserver(()=>paint());observer.observe(imageBox,{childList:true});}
    reflect();
  };
  for(const card of cards){
    const number=card.querySelector('.num')?.textContent.trim();
    const name=card.querySelector('h2')?.textContent.trim()||'Unknown club';
    const existingPhoto=card.querySelector('.image img');
    const imported=card.dataset.imported==='true';
    const controls=document.createElement('div');
    controls.className='review-control';
    attachVisualControls(card,controls,number,name);
    if(imported){
      // An imported logo is live and immutable from this review page, but the
      // super admin can submit a clearly labelled replace/remove REQUEST.
      card.classList.add('imported');
      const current=card.querySelector('.image img')?.getAttribute('src') || '';
      const imageBox=card.querySelector('.image');
      const originalMarkup=imageBox.innerHTML;
      const recovered=restored.find(x=>String(x.number)===number && x.name===name && ['replace','remove','adjust'].includes(x.action));
      const note=document.createElement('p');note.className='review-hint';
      note.textContent='Currently live. Replace or Remove creates a review request only; the public Directory will not change until separately authorised.';
      const research=document.createElement('div');research.className='research-links';
      for(const [title,query] of [['Facebook',name+' pickleball site:facebook.com'],['Instagram',name+' pickleball site:instagram.com'],['Website',name+' pickleball official website']]){
        const a=document.createElement('a');a.textContent=title+' ↗';a.target='_blank';a.rel='noopener noreferrer';a.href='https://www.google.com/search?q='+encoded(query);research.append(a);
      }
      const buttons=document.createElement('div');buttons.className='logo-actions';
      const replaceBtn=document.createElement('button');replaceBtn.type='button';replaceBtn.textContent='Replace logo';
      const removeBtn=document.createElement('button');removeBtn.type='button';removeBtn.textContent='Remove logo';
      const restoreBtn=document.createElement('button');restoreBtn.type='button';restoreBtn.textContent='Cancel change';restoreBtn.className='secondary';
      buttons.append(replaceBtn,removeBtn,restoreBtn);
      const entry=document.createElement('input');entry.type='url';entry.placeholder='Paste replacement HTTPS logo image URL';
      entry.setAttribute('aria-label',name+' replacement image URL');entry.className='logo-url-input';entry.hidden=true;
      const confirm=document.createElement('button');confirm.type='button';confirm.textContent='Add replacement to review batch';confirm.hidden=true;
      const warning=document.createElement('p');warning.className='review-hint';
      let ready='';let seq=0;
      const reset=()=>{++seq;ready='';entry.value='';entry.hidden=true;confirm.hidden=true;imageBox.innerHTML=originalMarkup;warning.textContent='Current live image kept. No change requested.';selections.delete(number);update();};
      const showReplace=()=>{entry.hidden=false;confirm.hidden=false;confirm.disabled=true;warning.textContent='Paste an HTTPS image. After its preview loads, add it to the batch.';entry.focus();};
      replaceBtn.addEventListener('click',showReplace);
      entry.addEventListener('input',()=>{
        const url=safeLink(entry.value.trim());const serial=++seq;ready='';confirm.disabled=true;
        if(!url||!url.startsWith('https://')){warning.textContent='Use a direct HTTPS image URL.';return;}
        const img=new Image();img.onload=()=>{if(serial!==seq)return;ready=url;confirm.disabled=false;imageBox.replaceChildren(img);warning.textContent='Replacement preview ready. Confirm to include it in the review batch.';};
        img.onerror=()=>{if(serial!==seq)return;warning.textContent='Image did not load. The current live image remains unchanged.';};
        img.alt=name+' replacement preview';img.src=url;
      });
      confirm.addEventListener('click',()=>{if(!ready)return;selections.set(number,{number,name,action:'replace',image:ready,currentImage:current,...(selections.get(number)?.layout?{layout:selections.get(number).layout}:{})});warning.textContent='REPLACE requested, not published. Included in copied review batch.';update();});
      removeBtn.addEventListener('click',()=>{++seq;ready='';imageBox.innerHTML=originalMarkup;entry.hidden=true;confirm.hidden=true;selections.set(number,{number,name,action:'remove',image:current,currentImage:current});warning.textContent='REMOVE requested, not published. Included in copied review batch.';update();});
      restoreBtn.addEventListener('click',reset);
      controls.append(note,research,buttons,entry,confirm,warning);card.append(controls);
      if(recovered?.action==='remove'){selections.set(number,recovered);warning.textContent='Previously selected REMOVE request restored; not published.';}
      else if(recovered?.action==='adjust'){selections.set(number,recovered);warning.textContent='Previously saved layout adjustment restored. No live image changed.';}
      else if(recovered?.action==='replace' && recovered.image){entry.value=recovered.image;showReplace();entry.dispatchEvent(new Event('input'));selections.set(number,recovered);warning.textContent='Replacement request restored. Preview loading; not published.';}
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
    // One card can have an archived candidate and a user-approved replacement.
    // Never silently discard a reviewed selection if a paste fails to load.
    const imageBox=card.querySelector('.image');
    const originalMarkup=imageBox.innerHTML;
    const originalSrc=existingPhoto?.getAttribute('src') || '';
    let replacement='';
    let sequence=0;
    const entry=document.createElement('input');
    entry.type='url';
    entry.placeholder='Paste a better official HTTPS logo image URL';
    entry.setAttribute('aria-label',name+' replacement or new official logo image URL');
    entry.style.cssText='display:block;width:100%;margin:10px 0 5px;padding:9px;border:1px solid #b6c4d5;border-radius:8px;font-size:12px';
    const status=document.createElement('p');status.className='review-hint';
    status.textContent=candidate?'Not the right logo? Paste an official replacement here. The original is kept unless you approve the new one.':'Paste an HTTPS image address to preview and approve it.';
    const reset=document.createElement('button');reset.type='button';reset.className='review-reset';
    reset.textContent='Restore original candidate';
    reset.style.cssText='display:none;margin:5px 0;padding:7px 9px;border-radius:7px;border:1px solid #b6c4d5;background:#f2f7fd;color:#0c2257;cursor:pointer;font-weight:700';
    const chosenImage=()=>replacement || originalSrc;
    const storeSelection=()=>{
      const src=chosenImage();
      if(checkbox.checked && src){
        selections.set(number,{number,name,image:src,proposed:!!replacement,...(selections.get(number)?.layout?{layout:selections.get(number).layout}:{})});
      }else{checkbox.checked=false;selections.delete(number);}
      update();
    };
    const showOriginal=()=>{
      replacement='';imageBox.innerHTML=originalMarkup;
      checkbox.disabled=!originalSrc;reset.style.display='none';
    };
    const previewUrl=(url,restoreApproval=false)=>{
      const serial=++sequence;
      status.textContent='Loading candidate preview…';
      const preview=new Image();
      preview.onload=()=>{
        if(serial!==sequence)return;
        replacement=url;imageBox.replaceChildren(preview);
        preview.alt=name+' selected replacement logo preview';
        preview.style.cssText='max-width:92%;max-height:92%;width:auto;height:auto;object-fit:contain';
        checkbox.disabled=false;reset.style.display=originalSrc?'inline-block':'none';
        status.textContent='Replacement is visible. Tick Approve for next batch to use THIS image. The original will not be exported.';
        if(restoreApproval){checkbox.checked=true;storeSelection();}
        else if(checkbox.checked)storeSelection();
      };
      preview.onerror=()=>{
        if(serial!==sequence)return;
        status.textContent='This image address did not load. Your previous selected logo is retained; paste a different image link.';
        checkbox.disabled=!chosenImage();
      };
      preview.src=url;
    };
    entry.addEventListener('input',()=>{
      const raw=entry.value.trim();
      if(!raw){++sequence;showOriginal();status.textContent='Original candidate restored.';storeSelection();return;}
      const url=safeLink(raw);
      if(!url || !url.startsWith('https://')){++sequence;status.textContent='Please paste a direct HTTPS image address.';return;}
      // Keep the currently selected image and checkbox intact until the new image actually loads.
      previewUrl(url,false);
    });
    reset.addEventListener('click',()=>{
      entry.value='';++sequence;showOriginal();storeSelection();
      status.textContent='Original candidate restored. Your approval remains selected if it was ticked.';
    });
    const discard=document.createElement('button');discard.type='button';discard.className='candidate-discard';discard.textContent='Remove incorrect candidate';
    const discardCancel=document.createElement('button');discardCancel.type='button';discardCancel.className='secondary candidate-discard-cancel';discardCancel.textContent='Undo candidate removal';discardCancel.hidden=true;
    discard.addEventListener('click',()=>{
      ++sequence;replacement='';entry.value='';imageBox.innerHTML='<div class="missing">Candidate flagged for removal</div>';
      checkbox.checked=false;checkbox.disabled=true;discardCancel.hidden=false;
      selections.set(number,{number,name,action:'remove_candidate',image:originalSrc});
      status.textContent='Candidate removal flagged for review only. The public Directory remains unchanged.';update();
    });
    discardCancel.addEventListener('click',()=>{
      ++sequence;showOriginal();if(selections.get(number)?.action==='remove_candidate')selections.delete(number);
      discardCancel.hidden=true;status.textContent='Candidate restored.';update();
    });
    controls.append(entry,reset,status);
    if(candidate)controls.append(discard,discardCancel);
    if(recovered?.action==='remove_candidate'){
      imageBox.innerHTML='<div class="missing">Candidate flagged for removal</div>';
      checkbox.checked=false;checkbox.disabled=true;discardCancel.hidden=false;selections.set(number,recovered);
    }
    existingPhoto?.addEventListener('error',()=>{
      if(replacement)return;
      if(selections.get(number)?.image===originalSrc){selections.delete(number);checkbox.checked=false;update();}
      checkbox.disabled=true;
      status.textContent='Archived image unavailable. Paste a working HTTPS image address.';
    });
    checkbox.disabled=!originalSrc;
    checkbox.addEventListener('change',storeSelection);
    if(recovered?.proposed && /^https:\/\//i.test(recovered.image)){
      entry.value=recovered.image;previewUrl(recovered.image,true);
    } else if(recovered && originalSrc && recovered.image===originalSrc){
      checkbox.checked=true;storeSelection();
    }
    card.append(controls);
  }
  footer.querySelector('#review-clear').addEventListener('click',()=>{
    document.querySelectorAll('.review-control input[type=checkbox]').forEach(x=>x.checked=false);
    selections.clear();result.textContent='Selections cleared.';update();
  });
  copy.addEventListener('click',async()=>{
    const lines=[...selections.values()].sort((a,b)=>Number(a.number)-Number(b.number))
      .map(x=>'#'+x.number+' '+x.name+' | '+(x.action==='remove_listing'?'REQUEST REMOVE DIRECTORY LISTING (not executed)':x.action==='remove_candidate'?'REQUEST REMOVE SUGGESTED LOGO (not executed)':x.action==='remove'?'REQUEST REMOVE LIVE LOGO (not executed)':x.action==='replace'?'REQUEST REPLACE LIVE LOGO (not executed)':x.action==='adjust'?'IMAGE SIZE/POSITION REQUEST (not executed)':x.proposed?'PROPOSED HTTPS IMAGE (requires verification)':'ARCHIVED CANDIDATE')+' | '+(x.action==='remove_listing'?'REASON: '+String(x.reason||'').replace(/\s+/g,' ').trim():x.action==='remove'?'CURRENT: '+(x.currentImage||x.image):x.image)+(x.layout?' | DISPLAY: '+JSON.stringify(x.layout):''));
    const note='RallyHub Directory logo visual review (not publication approval). Approved for staging checks:\n'+lines.join('\n')+
      '\nAll unselected entries remain HOLD. Replace/Remove requests for live logos are NOT executed automatically. Check sources and ownership before staging. Request separate explicit approval before publishing.';
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