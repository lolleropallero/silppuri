// Public URL format. Store choices, never calculated amounts or executable markup.
const SHARE_VERSION=2;
// Permanent wire IDs: append new cards only. Never reorder, reuse or remove an
// entry, even if the displayed catalogue changes or a card is retired.
const SHARE_ACTION_IDS=Object.freeze([
  'cut-1-5','cut-1-6','cut-1-7','cut-1-8','cut-1-11','cut-1-16','cut-1-25','cut-1-26','cut-1-28','cut-1-29',
  'cut-1-30','cut-1-32','cut-1-33','cut-1-38','cut-1-41','cut-1-42','cut-1-47','cut-1-55','cut-1-56','cut-1-57',
  'cut-1-58','cut-1-69','cut-1-72','cut-1-75','cut-1-76','cut-1-79','cut-2-9','cut-2-11','cut-2-13','cut-2-14',
  'cut-2-15','cut-2-19','cut-2-20','cut-2-21','cut-2-22','cut-2-25','cut-2-26','cut-2-27','cut-2-28','cut-2-32',
  'cut-2-34','cut-2-35','cut-2-38','cut-2-39','cut-2-41','cut-2-42','cut-2-43','cut-2-44','cut-2-45',
  'education','cut-2-51','cut-2-52','cut-2-53','cut-2-54','cut-2-55','cut-2-57','cut-2-58','cut-2-59',
  'cut-2-60','cut-2-61','cut-2-62','cut-2-65','cut-2-66','cut-2-67','cut-2-68','cut-2-70','cut-2-74','cut-2-77',
  'cut-2-78','cut-3-5','cut-3-6','cut-3-7','cut-3-8','cut-3-10','cut-3-11','cut-3-12','cut-3-13','cut-3-14',
  'cut-3-15','cut-3-16','cut-3-17','cut-3-18','cut-3-21','cut-3-22','cut-3-23','cut-3-27','cut-3-28','cut-3-32',
  'cut-3-33','cut-3-34','cut-3-36','cut-3-37','cut-3-38','cut-3-39','cut-3-40','cut-3-42','cut-3-43','cut-3-44',
  'cut-3-45','cut-3-46','cut-3-47','cut-3-48','cut-3-49','cut-3-50','cut-3-51','cut-3-52','cut-3-54','cut-3-56',
  'cut-3-57','benefits','cut-3-61','cut-3-62','cut-3-63','cut-3-64','cut-3-65','cut-3-66','cut-3-67','cut-3-68',
  'cut-3-69','cut-4-5','cut-4-6','cut-4-7','cut-4-9','cut-4-11','cut-4-14','cut-4-16','cut-4-17','cut-4-18',
  'cut-4-19','cut-4-20','cut-4-21','cut-4-22','cut-4-24','cut-4-25','cut-4-26','cut-4-27','cut-4-29','cut-4-30',
  'cut-4-31','health','cut-4-33','cut-4-34','cut-4-35','cut-4-36','cut-4-37','cut-4-42','cut-4-47','cut-4-48',
  'cut-5-16','cut-5-17','cut-5-20','cut-5-22','cut-5-29','cut-5-33','cut-5-45','cut-5-49','cut-5-52','cut-5-53',
  'cut-5-55','cut-5-56','cut-5-58','cut-5-62','cut-5-64','cut-5-66','cut-5-67','cut-5-72','cut-5-75','cut-5-77',
  'cut-6-5','cut-6-6','cut-6-7','cut-7-12','cut-7-16','cut-7-18','cut-7-19','cut-7-20','cut-7-21','cut-7-24',
  'cut-7-27','cut-7-28','cut-7-29','cut-7-30','cut-7-41','cut-7-42','cut-7-44','cut-7-45','cut-7-46','cut-7-48',
  'cut-7-49','cut-7-50','cut-7-51','cut-7-52','income','income-index','tax-pension','tax-donation',
  'tax-household','tax-capital-low','tax-capital-high','tax-entrepreneur-remove','tax-entrepreneur-step',
  'dividends','tax-dividend-return','tax-rd','tax-ifrs','corporate','tax-forest','tax-transfer-land',
  'tax-transfer-homes','tax-transfer-shares','tax-succession','tax-inheritance','tax-vat15','tax-vat16',
  'tax-food18','tax-vat-services','vat','tax-vat-standard','tax-vat-reduced','tax-vat-news135',
  'tax-vat-news255','tax-insurance','tax-excise-index','tax-tobacco','tax-diesel','tax-commercial-diesel',
  'tax-van','tax-vehicle','tax-peat','tax-biomass','tax-waste-energy','tax-heat','tax-tickets','tax-fuel',
  'tax-electric1','tax-electric2','tax-car-all','tax-land-values','tax-land-min','fw-wrappers',
  'fw-dividend-withholding','fw-interest','fw-corporate-gaps','fw-corporate-minimum','fw-wealth-minimum',
  'fw-exit-tax','fw-property-funds','fw-treaty-dividends','fw-portfolio','fw-deemed-cost',
  'fw-succession-abolish','fw-digital','sorsa-bank','sorsa-million-inheritance','vm-home-property',
  'tpan-top-rate','vm-machine-fuel','vm-alcohol','eva-care-fees'
]);
const shareActionIndex=new Map(SHARE_ACTION_IDS.map((id,index)=>[id,index]));
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
  const p={n:shareTitle(model.name),a:model.selectedIds,h:model.includeLater===true,
    i:model.taxIncreasesPP.income,c:model.taxIncreasesPP.corporate,y:model.yleCutPercent,
    d:model.dividendMode==='abolish',f:[model.fundingChoices.yle==='keep-tax',model.fundingChoices.farm==='save'],u:unitSteps,
    p:Object.fromEntries(Object.entries(model.cutPercents||{}).filter(([id])=>model.selectedIds.includes(id)))};
  shareModel(p,shareActionIndex);
  // Four settings bytes, a UTF-8 name, ordered numeric card IDs, and only the
  // selected cards' adjustments. Everything stays in the URL fragment.
  const bytes=[SHARE_VERSION,Number(p.h)|(Number(p.d)<<1)|(Number(p.f[0])<<2)|(Number(p.f[1])<<3),p.i|(p.c<<4),p.y/5];
  const number=n=>{while(n>=128){bytes.push((n&127)|128);n>>>=7;}bytes.push(n);};
  // JSON quoting preserves even a name ending in half of a UTF-16 surrogate pair.
  const name=new TextEncoder().encode(JSON.stringify(p.n));
  number(name.length);bytes.push(...name);
  number(p.a.length);p.a.forEach(id=>number(shareActionIndex.get(id)));
  for(const values of [p.u,p.p]){
    const entries=p.a.flatMap((id,index)=>Object.hasOwn(values,id)?[[index,values[id]]]:[]);
    number(entries.length);
    for(const [index,value] of entries){number(index);bytes.push(value);}
  }
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decodeShare(token,knownIds){
  const invalid=()=>{throw new Error('Virheellinen jakolinkki.');};
  if(typeof token!=='string'||!token.length||token.length>20000||!/^[\w-]+$/.test(token))invalid();
  const bytes=Uint8Array.from(atob(token.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  let offset=0;
  const byte=()=>{if(offset>=bytes.length)invalid();return bytes[offset++];};
  const number=max=>{
    let value=0;
    for(let i=0;i<3;i++){
      const b=byte();value|=(b&127)<<(7*i);
      if(b<128){if(value>max||(i>0&&b===0))invalid();return value;}
    }
    invalid();
  };
  if(byte()!==SHARE_VERSION)invalid();
  const flags=byte(),taxes=byte(),yle=byte()*5;
  if(flags>15)invalid();
  const nameLength=number(482);
  if(offset+nameLength>bytes.length)invalid();
  const name=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(offset,offset+nameLength)));
  offset+=nameLength;
  const count=number(500),selectedIds=[];
  for(let i=0;i<count;i++){
    const id=SHARE_ACTION_IDS[number(65535)];
    if(id===undefined)throw new Error('Linkissä on toimi, jota tämä versio ei tunne.');
    selectedIds.push(id);
  }
  const adjustments=()=>{
    const count=number(selectedIds.length),values={};
    for(let i=0;i<count;i++){
      const index=number(selectedIds.length-1),id=selectedIds[index];
      if(Object.hasOwn(values,id))invalid();
      values[id]=byte();
    }
    return values;
  };
  const units=adjustments(),percents=adjustments();
  if(offset!==bytes.length)invalid();
  return shareModel({n:name,a:selectedIds,h:!!(flags&1),i:taxes&15,c:taxes>>4,y:yle,
    d:!!(flags&2),f:[!!(flags&4),!!(flags&8)],u:units,p:percents},knownIds);
}
function shareModel(p,knownIds){
  const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
  if(!p||typeof p.n!=='string'||p.n.length>80||!Array.isArray(p.a)||p.a.length>500||
    !p.a.every(id=>typeof id==='string'&&id.length<80)||new Set(p.a).size!==p.a.length||typeof p.h!=='boolean'||
    !integer(p.i,0,10)||!integer(p.c,0,10)||!integer(p.y,5,100)||p.y%5||typeof p.d!=='boolean'||
    !Array.isArray(p.f)||p.f.length!==2||!p.f.every(b=>typeof b==='boolean')||
    !p.u||typeof p.u!=='object'||Array.isArray(p.u)||Object.entries(p.u).some(([id,n])=>!p.a.includes(id)||!integer(n,0,100))||
    !p.p||typeof p.p!=='object'||Array.isArray(p.p)||Object.entries(p.p).some(([id,n])=>!p.a.includes(id)||!integer(n,1,100)||(n!==1&&n%5)))throw new Error('Virheellinen jakolinkki.');
  // Do not silently open a partial package if a future catalogue removes a card.
  if(p.a.some(id=>!knownIds.has(id)))throw new Error('Linkissä on toimi, jota tämä versio ei tunne.');
  return {selectedIds:p.a,name:shareTitle(p.n),year:2031,includeLater:p.h,yleCutPercent:p.y,
    taxIncreasesPP:{income:p.i,corporate:p.c},dividendMode:p.d?'abolish':'vm',unitSteps:p.u,cutPercents:p.p,
    fundingChoices:{yle:p.f[0]?'keep-tax':'reduce-tax',farm:p.f[1]?'save':'redirect'}};
}
function shareUrl(model,href){
  const url=new URL(href);
  if(!['http:','https:'].includes(url.protocol))throw new Error('Avaa sivu selaimessa luodaksesi jakolinkin.');
  url.hash='s='+encodeShare(model);
  return url.href;
}
