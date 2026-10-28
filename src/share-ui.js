const shareDialog=q('.sp-share'),shareName=q('#sp-share-name'),shareStatus=q('.sp-share-status');
let shareBlob=null,shareObjectUrl=null,shareTimer=null,shareGeneration=0,skipShareNameSave=false;
function refreshShareLink(){
  try{q('.sp-share-link').value=shareUrl({...packageModel(),name:shareName.value},location.href);q('.sp-copy-link').disabled=false;}
  catch(error){q('.sp-share-link').value='';q('.sp-copy-link').disabled=true;shareStatus.textContent=error.message;}
}
async function refreshShareImage(){
  const generation=++shareGeneration;q('.sp-download').disabled=true;q('.sp-native-share').hidden=true;shareBlob=null;
  shareStatus.textContent='Kuva valmistuu…';refreshShareLink();
  try{
    // Yield once so the dialog and busy state paint before generating a long image.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    if(generation!==shareGeneration||!shareDialog.open)return;
    const canvas=createShareImage(data.filter(d=>selected.has(d.id)),shareName.value,includeLater);
    const rendered=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Kuvan luonti epäonnistui.')),'image/png'));
    const blob=await creditSharePng(rendered);
    if(generation!==shareGeneration||!shareDialog.open)return;
    if(shareObjectUrl)URL.revokeObjectURL(shareObjectUrl);
    shareBlob=blob;shareObjectUrl=URL.createObjectURL(blob);
    const img=document.createElement('img');img.src=shareObjectUrl;img.alt=shareTitle(shareName.value)+' – piirakka, maksajat, tuloryhmät ja valitut toimet';
    img.width=canvas.width;img.height=canvas.height;q('.sp-share-preview').replaceChildren(img);
    q('.sp-download').disabled=false;shareStatus.textContent='';
    const file=new File([blob],shareFilename(),{type:'image/png'});
    q('.sp-native-share').hidden=!(navigator.canShare?.({files:[file]})&&q('.sp-share-link').value);
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
  rememberShareName();refreshShareLink();const input=q('.sp-share-link');
  try{await navigator.clipboard.writeText(input.value);shareStatus.textContent='Linkki kopioitu.';}
  catch{input.focus();input.select();shareStatus.textContent='Kopioi valittu linkki.';}
});
q('.sp-native-share').addEventListener('click',async()=>{
  if(!shareBlob)return;rememberShareName();
  try{await navigator.share({title:shareTitle(shareName.value),text:shareTitle(shareName.value),url:q('.sp-share-link').value,files:[new File([shareBlob],shareFilename(),{type:'image/png'})]});}
  catch(error){if(error.name!=='AbortError')shareStatus.textContent='Jakaminen ei onnistunut. Lataa PNG ja kopioi linkki.';}
});
function readSharedState(){
  if(!location.hash.startsWith('#s='))return null;
  try{return {modelContent:decodeShare(location.hash.slice(3),new Set(data.map(d=>d.id)))};}
  catch(error){const notice=q('.sp-share-notice');notice.hidden=false;notice.textContent=(error.message==='Linkissä on toimi, jota tämä versio ei tunne.'?error.message:'Jakolinkkiä ei voitu avata.')+' Omat valintasi säilyivät.';return null;}
}
window.addEventListener('hashchange',()=>{
  const state=readSharedState();if(!state)return;
  if(shareDialog.open){skipShareNameSave=true;shareDialog.close();}if(activeAction)closeImpact();
  modalShred.finish();finishPacking?.();stateIn(state);render();
});
