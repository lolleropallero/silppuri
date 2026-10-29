const shareDialog=q('.sp-share'),shareStatus=q('.sp-share-status');
let shareBlob=null,shareObjectUrl=null,shareGeneration=0,shareLink='',shareCopyText='';
function refreshShareLink(){
  const text=shareCaption(data.filter(d=>selected.has(d.id)),packageName);
  try{
    const url=shareUrl(packageModel(),location.href);
    shareLink=url;shareCopyText=text+'\n\n'+url;q('.sp-copy-link').disabled=false;
    const links=socialShareLinks(text,url);
    root.querySelectorAll('[data-share-social]').forEach(a=>{a.href=links[a.dataset.shareSocial];a.removeAttribute('aria-disabled');});
  }
  catch(error){
    shareLink='';shareCopyText=text;q('.sp-copy-link').disabled=true;shareStatus.textContent=error.message;
    root.querySelectorAll('[data-share-social]').forEach(a=>{a.removeAttribute('href');a.setAttribute('aria-disabled','true');});
  }
}
function nativeShareData(){
  return {title:shareTitle(packageName),text:shareCaption(data.filter(d=>selected.has(d.id)),packageName),
    url:shareLink,files:[new File([shareBlob],shareFilename(),{type:'image/png'})]};
}
async function refreshShareImage(){
  const generation=++shareGeneration;q('.sp-download').disabled=true;q('.sp-native-share').hidden=true;shareBlob=null;
  shareStatus.textContent='Kuva valmistuu…';refreshShareLink();
  try{
    // Yield once so the dialog and busy state paint before drawing the image.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    if(generation!==shareGeneration||!shareDialog.open)return;
    const canvas=createShareImage(data.filter(d=>selected.has(d.id)),packageName,includeLater,shareLink);
    const rendered=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Kuvan luonti epäonnistui.')),'image/png'));
    const blob=await creditSharePng(rendered);
    if(generation!==shareGeneration||!shareDialog.open)return;
    if(shareObjectUrl)URL.revokeObjectURL(shareObjectUrl);
    shareBlob=blob;shareObjectUrl=URL.createObjectURL(blob);
    const img=document.createElement('img');img.src=shareObjectUrl;img.alt=shareTitle(packageName)+' – yhteenveto, kuvaajat ja QR-koodi paketin toimenpiteisiin';
    img.width=canvas.width;img.height=canvas.height;q('.sp-share-preview').replaceChildren(img);
    q('.sp-download').disabled=false;shareStatus.textContent='';
    q('.sp-native-share').hidden=!(navigator.canShare?.(nativeShareData())&&shareLink);
  }catch(error){if(generation===shareGeneration)shareStatus.textContent='Kuvan luonti ei onnistunut. Jakolinkin voi silti kopioida.';}
}
function shareFilename(){return shareTitle(packageName).replace(/[<>:"/\\|?*\u0000-\u001f]/g,'-').replace(/[. ]+$/,'')+'.png';}
q('.sp-publish').addEventListener('click',()=>{
  shareDialog.showModal();
  refreshShareImage();
});
q('.sp-share-close').addEventListener('click',()=>shareDialog.close());
shareDialog.addEventListener('click',event=>{if(event.target===shareDialog){const r=shareDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)shareDialog.close();}});
shareDialog.addEventListener('close',()=>{
  if(shareDialog.open)return;
  ++shareGeneration;
  if(shareObjectUrl)URL.revokeObjectURL(shareObjectUrl);shareObjectUrl=null;shareBlob=null;q('.sp-share-preview').replaceChildren();
  q('.sp-publish').focus();
});
q('.sp-download').addEventListener('click',()=>{
  if(!shareBlob||!shareObjectUrl)return;
  const a=document.createElement('a');a.href=shareObjectUrl;a.download=shareFilename();document.body.appendChild(a);a.click();a.remove();shareStatus.textContent='PNG ladattu.';
});
q('.sp-copy-link').addEventListener('click',async()=>{
  refreshShareLink();if(!shareLink)return;
  try{await copyShareText(shareCopyText);shareStatus.textContent='Kopioitu.';}
  catch{shareStatus.textContent='Kopiointi ei onnistunut.';}
});
async function copyShareText(text){
  try{await navigator.clipboard.writeText(text);return;}catch{}
  const input=document.createElement('textarea'),focused=document.activeElement;
  input.value=text;input.readOnly=true;input.style.cssText='position:fixed;opacity:0;pointer-events:none';
  shareDialog.appendChild(input);
  try{input.select();if(!document.execCommand('copy'))throw new Error('Kopiointi epäonnistui.');}
  finally{input.remove();focused?.focus({preventScroll:true});}
}
root.querySelectorAll('[data-share-social]').forEach(a=>a.addEventListener('click',event=>{
  if(a.getAttribute('aria-disabled')==='true'){event.preventDefault();return;}
  // Facebook's link composer does not accept a prefilled personal status.
  // Keep the user in control: copy their summary while the normal link opens.
  if(a.dataset.shareSocial==='facebook'){
    const text=shareCaption(data.filter(d=>selected.has(d.id)),packageName);
    copyShareText(text).then(()=>{shareStatus.textContent='Tiivistelmä kopioitu. Liitä se Facebookiin.';}).catch(()=>{shareStatus.textContent='Tiivistelmän kopiointi ei onnistunut.';});
  }
}));
q('.sp-native-share').addEventListener('click',async()=>{
  if(!shareBlob)return;
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
  if(shareDialog.open)shareDialog.close();if(resetDialog.open)resetDialog.close();if(presetDialog.open)presetDialog.close();pendingPreset=null;if(activeAction)closeImpact();
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
