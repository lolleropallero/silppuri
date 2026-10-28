const shareDialog=q('.sp-share'),shareName=q('#sp-share-name'),shareStatus=q('.sp-share-status');
let shareBlob=null,shareObjectUrl=null,shareTimer=null,shareGeneration=0,skipShareNameSave=false;
function refreshShareLink(){
  const text=shareCaption(data.filter(d=>selected.has(d.id)),shareName.value);
  try{
    const url=shareUrl({...packageModel(),name:shareName.value},location.href);
    q('.sp-share-link').value=url;q('.sp-share-copy').value=text+'\n'+url;q('.sp-copy-link').disabled=false;
    const links=socialShareLinks(text,url);
    root.querySelectorAll('[data-share-social]').forEach(a=>{a.href=links[a.dataset.shareSocial];a.removeAttribute('aria-disabled');});
  }
  catch(error){
    q('.sp-share-link').value='';q('.sp-share-copy').value=text;q('.sp-copy-link').disabled=true;shareStatus.textContent=error.message;
    root.querySelectorAll('[data-share-social]').forEach(a=>{a.removeAttribute('href');a.setAttribute('aria-disabled','true');});
  }
}
function nativeShareData(){
  return {title:shareTitle(shareName.value),text:shareCaption(data.filter(d=>selected.has(d.id)),shareName.value),
    url:q('.sp-share-link').value,files:[new File([shareBlob],shareFilename(),{type:'image/png'})]};
}
async function refreshShareImage(){
  const generation=++shareGeneration;q('.sp-download').disabled=true;q('.sp-native-share').hidden=true;shareBlob=null;
  shareStatus.textContent='Kuva valmistuu…';refreshShareLink();
  try{
    // Yield once so the dialog and busy state paint before generating a long image.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    if(generation!==shareGeneration||!shareDialog.open)return;
    const canvas=createShareImage(data.filter(d=>selected.has(d.id)),shareName.value,includeLater,location.href);
    const rendered=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Kuvan luonti epäonnistui.')),'image/png'));
    const blob=await creditSharePng(rendered);
    if(generation!==shareGeneration||!shareDialog.open)return;
    if(shareObjectUrl)URL.revokeObjectURL(shareObjectUrl);
    shareBlob=blob;shareObjectUrl=URL.createObjectURL(blob);
    const img=document.createElement('img');img.src=shareObjectUrl;img.alt=shareTitle(shareName.value)+' – piirakka, maksajat, tuloryhmät ja valitut toimet';
    img.width=canvas.width;img.height=canvas.height;q('.sp-share-preview').replaceChildren(img);
    q('.sp-download').disabled=false;shareStatus.textContent='';
    q('.sp-native-share').hidden=!(navigator.canShare?.(nativeShareData())&&q('.sp-share-link').value);
  }catch(error){if(generation===shareGeneration)shareStatus.textContent='Kuvan luonti ei onnistunut. Jakolinkin voi silti kopioida.';}
}
function shareFilename(){return shareTitle(shareName.value).replace(/[<>:"/\\|?*\u0000-\u001f]/g,'-').replace(/[. ]+$/,'')+'.png';}
function rememberShareName(){packageName=shareTitle(shareName.value);q('.sp-panel-heading h2').textContent=packageName;save();}
q('.sp-publish').addEventListener('click',()=>{
  shareName.value=packageName||'Minun silppurini';shareDialog.showModal();
  q('.sp-share-local').hidden=!['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  refreshShareImage();shareName.focus();shareName.select();
});
q('.sp-share-close').addEventListener('click',()=>shareDialog.close());
shareDialog.addEventListener('click',event=>{if(event.target===shareDialog){const r=shareDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)shareDialog.close();}});
shareDialog.addEventListener('close',()=>{
  clearTimeout(shareTimer);++shareGeneration;if(!skipShareNameSave)rememberShareName();skipShareNameSave=false;
  if(shareObjectUrl)URL.revokeObjectURL(shareObjectUrl);shareObjectUrl=null;shareBlob=null;q('.sp-share-preview').replaceChildren();q('.sp-publish').focus();
});
shareName.addEventListener('input',()=>{
  // Disable stale downloads immediately, not only when the debounce runs.
  clearTimeout(shareTimer);++shareGeneration;shareBlob=null;q('.sp-download').disabled=true;q('.sp-native-share').hidden=true;
  refreshShareLink();shareTimer=setTimeout(refreshShareImage,350);
});
q('.sp-download').addEventListener('click',()=>{
  if(!shareBlob||!shareObjectUrl)return;rememberShareName();
  const a=document.createElement('a');a.href=shareObjectUrl;a.download=shareFilename();document.body.appendChild(a);a.click();a.remove();shareStatus.textContent='PNG ladattu.';
});
q('.sp-copy-link').addEventListener('click',async()=>{
  rememberShareName();refreshShareLink();const input=q('.sp-share-copy');
  try{await navigator.clipboard.writeText(input.value);shareStatus.textContent='Tiivistelmä ja linkki kopioitu.';}
  catch{input.focus();input.select();shareStatus.textContent='Kopioi valittu teksti.';}
});
root.querySelectorAll('[data-share-social]').forEach(a=>a.addEventListener('click',event=>{
  if(a.getAttribute('aria-disabled')==='true'){event.preventDefault();return;}
  rememberShareName();
  // Facebook's link composer does not accept a prefilled personal status.
  // Keep the user in control: copy their summary while the normal link opens.
  if(a.dataset.shareSocial==='facebook'){
    const text=shareCaption(data.filter(d=>selected.has(d.id)),shareName.value);
    const copy=navigator.clipboard?.writeText?.(text);
    if(copy)copy.then(()=>{shareStatus.textContent='Tiivistelmä kopioitu. Liitä se Facebookiin.';}).catch(()=>{shareStatus.textContent='Kopioi tiivistelmä Facebookin julkaisutekstiksi.';});
    else shareStatus.textContent='Kopioi tiivistelmä Facebookin julkaisutekstiksi.';
  }
}));
q('.sp-native-share').addEventListener('click',async()=>{
  if(!shareBlob)return;rememberShareName();
  try{await navigator.share(nativeShareData());}
  catch(error){if(error.name!=='AbortError')shareStatus.textContent='Jakaminen ei onnistunut. Lataa PNG ja kopioi linkki.';}
});
function readSharedState(){
  q('.sp-share-notice').hidden=true;
  if(!location.hash.startsWith('#s='))return null;
  try{return {modelContent:decodeShare(location.hash.slice(3),new Set(data.map(d=>d.id)))};}
  catch(error){const notice=q('.sp-share-notice');notice.hidden=false;notice.textContent=(error.message==='Linkissä on toimi, jota tämä versio ei tunne.'?error.message:'Jakolinkkiä ei voitu avata.')+' Omat valintasi säilyivät.';return null;}
}
function loadSharedLocation(){
  const incomingUrl=location.href;
  const state=readSharedState();
  // Finish pending callbacks under the old session before switching persistence.
  if(shareDialog.open){skipShareNameSave=true;shareDialog.close();}if(activeAction)closeImpact();
  modalShred.finish();finishPacking?.();
  if(location.href!==incomingUrl)history.replaceState(null,'',incomingUrl);
  if(state)packageSession.enter();else packageSession.leave();
  q('.sp-shared-session').hidden=!packageSession.active;
  stateIn(state||window.openai?.widgetState);render();
}
q('.sp-return-own').addEventListener('click',()=>{
  const url=new URL(location.href);url.hash='';history.replaceState(null,'',url.href);
  loadSharedLocation();
});
window.addEventListener('hashchange',loadSharedLocation);
