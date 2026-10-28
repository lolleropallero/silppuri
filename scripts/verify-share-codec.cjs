const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const ctx=vm.createContext({TextEncoder,TextDecoder,Uint8Array,btoa,atob,URL});
vm.runInContext(fs.readFileSync(path.join(root,'src/share-state.js'),'utf8'),ctx);
const shareTitle=vm.runInContext('shareTitle',ctx);
const actions=JSON.parse(fs.readFileSync(path.join(root,'data/catalogue.json'),'utf8')).actions;
const ids=new Set(actions.map(d=>d.id)),wireIds=Array.from(vm.runInContext('SHARE_ACTION_IDS',ctx));
const plain=value=>JSON.parse(JSON.stringify(value));
assert.equal(new Set(wireIds).size,wireIds.length);
assert.ok([...ids].every(id=>wireIds.includes(id)),'new catalogue cards must receive permanent share IDs');
assert.equal(crypto.createHash('sha256').update(wireIds.slice(0,254).join('\n')).digest('hex'),
  'f9f7786193194c60b06cc524dc07566493d1708cfb18ba87b9e30adc46c0268b','published IDs are append-only');
const base={name:'Testi',selectedIds:['cut-1-5'],includeLater:false,year:2031,taxIncreasesPP:{income:2,corporate:3},yleCutPercent:20,
  fundingChoices:{yle:'reduce-tax',farm:'redirect'},dividendMode:'vm',unitSteps:{},cutPercents:{}};
const fixture='AgAyBAciVGVzdGkiAQAAAA';
assert.equal(ctx.encodeShare(base),fixture,'keep a fixed wire-format fixture');
assert.deepEqual(plain(ctx.decodeShare(fixture,ids)),base);
function roundtrip(model){
  const token=ctx.encodeShare(model),decoded=plain(ctx.decodeShare(token,ids));
  assert.deepEqual(decoded,{...model,name:shareTitle(model.name),year:2031,
    unitSteps:Object.fromEntries(Object.entries(model.unitSteps).filter(([id,n])=>model.selectedIds.includes(id)&&n!==1)),
    cutPercents:Object.fromEntries(Object.entries(model.cutPercents).filter(([id])=>model.selectedIds.includes(id)))});
  return token;
}
for(const name of ['', 'Ää öö 🐾', 'x'.repeat(80), '🐾'.repeat(40), 'x'.repeat(79)+'🐾', '\ud800'.repeat(80), '"\\<img onerror=alert(1)>\n'])roundtrip({...base,name});
for(let income=0;income<=10;income++)for(let corporate=0;corporate<=10;corporate++)roundtrip({...base,taxIncreasesPP:{income,corporate}});
for(let yleCutPercent=5;yleCutPercent<=100;yleCutPercent+=5)roundtrip({...base,yleCutPercent});
for(let flags=0;flags<16;flags++)roundtrip({...base,includeLater:!!(flags&1),dividendMode:flags&2?'abolish':'vm',
  fundingChoices:{yle:flags&4?'keep-tax':'reduce-tax',farm:flags&8?'save':'redirect'}});
roundtrip({...base,selectedIds:[],unitSteps:{income:3},cutPercents:{'cut-1-25':50}});
roundtrip({...base,selectedIds:['health','cut-1-5','income'],unitSteps:{health:0,income:100},cutPercents:{health:1,'cut-1-5':100}});
// Preserve selection order: the app resolves mutually exclusive measures in that order.
let randomState=711;
const random=()=>((randomState=(Math.imul(randomState,1664525)+1013904223)>>>0)/2**32);
for(let trial=0;trial<100;trial++){
  const shuffled=[...ids];
  for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  const selectedIds=shuffled.slice(0,Math.floor(random()*255));
  roundtrip({...base,selectedIds,
    unitSteps:Object.fromEntries(selectedIds.filter(()=>random()<.2).map(id=>[id,Math.floor(random()*101)])),
    cutPercents:Object.fromEntries(selectedIds.filter(()=>random()<.2).map(id=>[id,random()<.2?1:5*(1+Math.floor(random()*20))]))});
}
const bytes=Buffer.from(fixture,'base64url'),pack=value=>Buffer.from(value).toString('base64url');
for(let length=0;length<bytes.length;length++)assert.throws(()=>ctx.decodeShare(pack(bytes.subarray(0,length)),ids),'truncated at '+length);
for(const [index,value] of [[0,1],[0,3],[1,16],[2,11],[2,176],[3,0],[3,21],[5,255]]){
  const bad=Buffer.from(bytes);bad[index]=value;assert.throws(()=>ctx.decodeShare(pack(bad),ids));
}
const header=Array.from(bytes.subarray(0,12));
for(const tail of [
  [245,3], // more than 500 selected cards
  [129,0,0,0,0], // noncanonical count
  [1,254,1,0,0], // unknown numeric card ID
  [2,0,0,0,0], // duplicate card
  [1,0,1,1,3,0], // adjustment outside the selected cards
  [2,0,1,2,0,3,0,4,0], // duplicate adjustment
  [1,0,1,0,101,0], // unit value out of range
  [1,0,0,1,0,7], // unsupported percentage step
  [1,0,0,1,0,0], // percentage below the minimum
  [1,0,0,1,0,105], // percentage above the maximum
  [1,0,0,0,0] // trailing data
])assert.throws(()=>ctx.decodeShare(pack([...header,...tail]),ids));
assert.throws(()=>ctx.decodeShare(fixture,new Set()),/toimi/,'removed cards cannot silently disappear');
for(const patch of [{selectedIds:['missing']},{selectedIds:['health','health']},{taxIncreasesPP:{income:11,corporate:3}},{yleCutPercent:7},
  {unitSteps:{'cut-1-5':-1}},{cutPercents:{'cut-1-5':7}}])assert.throws(()=>ctx.encodeShare({...base,...patch}));
const typical={...base,name:'Suomi Silppuriin!',selectedIds:['health','benefits','income','corporate','dividends','vat','cut-1-25','cut-1-42','tax-vehicle','fw-wrappers'],
  cutPercents:{'cut-1-25':55},unitSteps:{'tax-vehicle':2}};
const typicalUrl=ctx.shareUrl(typical,'https://silppuri.fi/');
assert.ok(typicalUrl.length<150,'a ten-card package should fit in a short text line');
roundtrip(typical);
console.log('PASS: compact format, permanent IDs, Unicode, all settings, ordered selections, malformed/truncated data and invalid values.');
console.log('Ten-card URL: '+typicalUrl.length+' characters; single-card URL: '+ctx.shareUrl(base,'https://silppuri.fi/').length+' characters.');
