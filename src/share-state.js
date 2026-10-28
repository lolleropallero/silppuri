// Public URL format. Store choices, never calculated amounts or executable markup.
const SHARE_VERSION=1;
// A shared URL is a separate workspace. Its edits must never write the owner's
// persisted package, including saves triggered only by search or sort controls.
function createShareSession(host){
  let active=false;
  return {get active(){return active;},enter(){active=true;},leave(){active=false;},
    save(state){if(!active)return host()?.setWidgetState?.(state);}};
}
const shareTitle=value=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,80)||'Minun silppurini';
function encodeShare(model){
  const unitSteps=Object.fromEntries(Object.entries(model.unitSteps||{}).filter(([id,n])=>model.selectedIds.includes(id)&&n!==1));
  const payload={v:SHARE_VERSION,n:shareTitle(model.name),a:model.selectedIds,h:model.includeLater===true,
    i:model.taxIncreasesPP.income,c:model.taxIncreasesPP.corporate,y:model.yleCutPercent,
    d:model.dividendMode==='abolish',f:[model.fundingChoices.yle==='keep-tax',model.fundingChoices.farm==='save'],u:unitSteps,
    p:Object.fromEntries(Object.entries(model.cutPercents||{}).filter(([id])=>model.selectedIds.includes(id)))};
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(payload)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decodeShare(token,knownIds){
  if(typeof token!=='string'||!token.length||token.length>20000||!/^[\w-]+$/.test(token))throw new Error('Virheellinen jakolinkki.');
  const raw=atob(token.replace(/-/g,'+').replace(/_/g,'/'));
  const p=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0))));
  const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
  if(!p||p.v!==SHARE_VERSION||typeof p.n!=='string'||p.n.length>80||!Array.isArray(p.a)||p.a.length>500||
    !p.a.every(id=>typeof id==='string'&&id.length<80)||new Set(p.a).size!==p.a.length||typeof p.h!=='boolean'||
    !integer(p.i,0,10)||!integer(p.c,0,10)||!integer(p.y,5,100)||p.y%5||typeof p.d!=='boolean'||
    !Array.isArray(p.f)||p.f.length!==2||!p.f.every(b=>typeof b==='boolean')||
    !p.u||typeof p.u!=='object'||Array.isArray(p.u)||Object.entries(p.u).some(([id,n])=>!p.a.includes(id)||!integer(n,0,100))||
    (p.p!==undefined&&(!p.p||typeof p.p!=='object'||Array.isArray(p.p)||Object.entries(p.p).some(([id,n])=>!p.a.includes(id)||!integer(n,1,100)||(n!==1&&n%5)))))throw new Error('Virheellinen jakolinkki.');
  // Do not silently open a partial package if a future catalogue removes a card.
  if(p.a.some(id=>!knownIds.has(id)))throw new Error('Linkissä on toimi, jota tämä versio ei tunne.');
  return {selectedIds:p.a,name:shareTitle(p.n),year:2031,includeLater:p.h,yleCutPercent:p.y,
    taxIncreasesPP:{income:p.i,corporate:p.c},dividendMode:p.d?'abolish':'vm',unitSteps:p.u,cutPercents:p.p||{},
    fundingChoices:{yle:p.f[0]?'keep-tax':'reduce-tax',farm:p.f[1]?'save':'redirect'}};
}
function shareUrl(model,href){
  const url=new URL(href);
  if(!['http:','https:'].includes(url.protocol))throw new Error('Avaa sivu selaimessa luodaksesi jakolinkin.');
  url.hash='s='+encodeShare(model);
  return url.href;
}
