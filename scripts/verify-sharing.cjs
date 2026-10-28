const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const source=read('src/app.js'),actions=JSON.parse(read('data/catalogue.json')).actions;
const ctx=vm.createContext({TextEncoder,TextDecoder,Uint8Array,btoa,atob,URL,
  data:structuredClone(actions),selected:new Set(),scenario:{income:2,corporate:3,dividends:'vm'},units:{},conditions:{yle:'reduce-tax',farm:'redirect'},year:2031,includeLater:false,
  maxPP:10,packageName:'',payerGroups:[],filter:'all',category:'all',search:'',sortOrder:'desc',activeFlow:null,limit:12,catalogueOrder:[],catalogueOrderKey:'',q:()=>({value:''}),
  dividendStudyUrl:'https://www.sttinfo.fi/files/66784256/70136599/79254/fi'});
const run=s=>vm.runInContext(s,ctx);
run(read('src/share-state.js'));
run('const packageSession=createShareSession(()=>window.openai);');
run('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});');
run(source.slice(source.indexOf('  function syncScenario(){'),source.indexOf('  const esc=')));
run(source.slice(source.indexOf('  const esc='),source.indexOf('  function sourceMarkup')));
run(source.slice(source.indexOf('  function stateIn'),source.indexOf('  function slice')));
ctx.format=n=>(n/1000).toLocaleString('fi-FI',{minimumFractionDigits:2,maximumFractionDigits:2});
run(source.slice(source.indexOf('  const moneyLabel='),source.indexOf("  q('#sp-category').insertAdjacentHTML")));
run(read('src/share-image.js'));
const canonical=o=>JSON.parse(JSON.stringify(o));
const fingerprint=()=>canonical(ctx.data.filter(d=>ctx.selected.has(d.id)).map(d=>({id:d.id,title:d.title,amount:d.amount,gross:d.gross,upper:d.netUpper,later:d.laterApplied})));
const ids=new Set(actions.map(d=>d.id));ctx.knownIds=ids;
const seed={name:'Hessu Hopon silppuri 🐾 Ää <img onerror=alert(1)>',selectedIds:['vat','health','income','corporate','dividends','benefits','cut-1-42','cut-1-72','cut-2-51','tax-vehicle','fw-wrappers','cut-3-15'],
  year:2031,includeLater:true,taxIncreasesPP:{income:4,corporate:10},yleCutPercent:75,dividendMode:'abolish',unitSteps:{'tax-vehicle':2},fundingChoices:{yle:'keep-tax',farm:'save'}};
function roundtrip(model){
  ctx.stateIn({modelContent:model});const before=fingerprint(),snapshot=canonical(ctx.packageModel());ctx.snapshot=snapshot;
  const token=run('encodeShare(snapshot)'),link=ctx.shareUrl(snapshot,'https://example.test/tools/silppuri/?lang=fi');
  assert.match(link,/^https:\/\/example.test\/tools\/silppuri\/\?lang=fi#s=/);
  ctx.decoded=ctx.decodeShare(token,ids);
  ctx.stateIn({modelContent:{selectedIds:['corporate'],taxIncreasesPP:{income:1,corporate:1}}});
  ctx.stateIn({modelContent:ctx.decoded});assert.deepEqual(fingerprint(),before,'share preserves actual calculation');
  assert.equal(ctx.packageName,snapshot.name);assert.equal(ctx.includeLater,snapshot.includeLater);
  assert.ok(token.length<20000);
  for(const d of ctx.data.filter(d=>ctx.selected.has(d.id)))assert.match(ctx.shareCardAmount(d),/^(?:[−–\-+\d\s,.*]+milj\. €(?: \*)?|Tuotto avoin)$/u,d.id+': numeric references use millions; missing estimates remain distinct from zero');
  return link;
}
roundtrip(seed);
for(const d of actions){for(const later of [false,true])roundtrip({...seed,selectedIds:[d.id],unitSteps:{[d.id]:d.unit?ctx.capFor(d.id):1},includeLater:later});}
for(const yle of ['keep-tax','reduce-tax'])for(const farm of ['save','redirect'])for(const dividendMode of ['vm','abolish'])roundtrip({...seed,fundingChoices:{yle,farm},dividendMode});
const full=roundtrip({...seed,selectedIds:actions.map(d=>d.id)});assert.ok(full.length<8000,'largest valid package remains a practical hash URL');
const payload=token=>JSON.parse(Buffer.from(token,'base64url').toString('utf8'));
const pack=p=>Buffer.from(JSON.stringify(p)).toString('base64url');
const valid=payload(ctx.encodeShare(seed));
for(const bad of ['', '!', 'a'.repeat(20001), pack({...valid,v:2}),pack({...valid,a:['unknown-card']}),pack({...valid,a:['vat','vat']}),pack({...valid,i:Infinity}),pack({...valid,h:'true'}),pack({...valid,u:{vat:-1}}),pack({...valid,u:{__proto__:null,corporate:'3'}}),pack({...valid,n:'x'.repeat(81)}),pack({...valid,f:[]})]){
  assert.throws(()=>ctx.decodeShare(bad,ids));
}
assert.throws(()=>ctx.shareUrl(seed,'javascript:alert(1)'));assert.throws(()=>ctx.shareUrl(seed,'about:srcdoc'));
assert.ok(!read('src/share-ui.js').includes('innerHTML'),'shared names never go through HTML parsing');
// The ordinary page migrates the old preview state and isolates QA paths.
const store=new Map([['codex:visualization-widget-state-v2:["/",""]',JSON.stringify({modelContent:seed})]]);
const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
const host=vm.createContext({window:{},location:{pathname:'/',search:''},localStorage:storage});vm.runInContext(read('src/standalone.js'),host);
assert.deepEqual(canonical(host.window.openai.widgetState.modelContent),seed);
host.window.openai.setWidgetState({modelContent:seed});assert.ok(store.has('silppuri:state:v1:/'));
const privateHost=vm.createContext({window:{},location:{pathname:'/',search:''},get localStorage(){throw new Error('blocked');}});vm.runInContext(read('src/standalone.js'),privateHost);privateHost.window.openai.setWidgetState({});
// Use the real storage adapter, import handler, stateIn and save. Search and sort
// must be just as harmless to the owner's package as editing a shared selection.
const nodes=new Map(),listeners={};
ctx.q=selector=>{if(!nodes.has(selector))nodes.set(selector,{hidden:true,value:'',addEventListener:(event,fn)=>listeners[selector+':'+event]=fn});return nodes.get(selector);};
ctx.window=host.window;ctx.window.addEventListener=(event,fn)=>listeners[event]=fn;
ctx.location=new URL('https://example.test/');
ctx.history={replaceState:(_state,_unused,href)=>{ctx.location.href=href;}};
ctx.shareDialog={open:false};ctx.activeAction=null;ctx.modalShred={finish(){}};ctx.finishPacking=()=>{};ctx.render=()=>{};
run(read('src/share-ui.js').slice(read('src/share-ui.js').indexOf('function readSharedState()')));
const own={...seed,name:'Oma paketti',selectedIds:['vat','health','cut-3-15']};
ctx.stateIn({modelContent:own});ctx.save();
const ownSaved=store.get('silppuri:state:v1:/');
const originalSharedLink=ctx.shareUrl({...seed,name:'Jaettu paketti',selectedIds:['corporate','income']},ctx.location.href);
ctx.location.href=originalSharedLink;ctx.loadSharedLocation();
assert.equal(nodes.get('.sp-shared-session').hidden,false);
for(const edit of [()=>ctx.search='yle',()=>ctx.sortOrder='asc',()=>ctx.includeLater=false,
  ()=>ctx.selected.add('tax-peat'),()=>ctx.selected.delete('corporate'),()=>ctx.packageName='Muokattu jaettu paketti']){
  edit();ctx.save();assert.equal(store.get('silppuri:state:v1:/'),ownSaved,'shared edits never replace own storage');
}
const edited=fingerprint();assert.notEqual(ctx.location.href,originalSharedLink);
ctx.loadSharedLocation();assert.deepEqual(fingerprint(),edited,'reloading edited URL preserves its choices');
// A delayed animation can save while changing sessions; it cannot restore the old hash.
ctx.finishPacking=()=>ctx.save();listeners['.sp-return-own:click']();ctx.finishPacking=()=>{};
assert.equal(ctx.location.hash,'');assert.equal(nodes.get('.sp-shared-session').hidden,true);
assert.deepEqual(canonical(ctx.packageModel()),JSON.parse(ownSaved).modelContent);
assert.equal(store.get('silppuri:state:v1:/'),ownSaved);
ctx.selected.delete('health');ctx.save();assert.notEqual(store.get('silppuri:state:v1:/'),ownSaved,'own mode still saves');
const latestOwn=store.get('silppuri:state:v1:/');
ctx.location.href=originalSharedLink;ctx.loadSharedLocation();ctx.location.hash='#s=invalid';listeners.hashchange();
assert.equal(nodes.get('.sp-share-notice').hidden,false);assert.equal(nodes.get('.sp-shared-session').hidden,true);
assert.deepEqual(canonical(ctx.packageModel()),JSON.parse(latestOwn).modelContent);
assert.equal(store.get('silppuri:state:v1:/'),latestOwn);
// Create a normal URL fixture; browser tests exercise the production import path.
const example=roundtrip({...seed,name:'Hessu Hopon silppuri',taxIncreasesPP:{income:2,corporate:3}});
const wrappers=ctx.data.find(d=>d.id==='fw-wrappers');
assert.equal(ctx.shareCardAmount(wrappers),'20–440 milj. €');assert.equal(wrappers.amount,null,'the 2031 cash estimate does not become permanent revenue');
assert.match(ctx.amountFootnote(wrappers),/ei pysyvä vuosituotto/);
const peat=ctx.data.find(d=>d.id==='tax-peat');
assert.equal(ctx.shareCardAmount(peat),'55 milj. €');assert.equal(peat.amount,null,'a static reference must not enter the pie');
assert.match(ctx.amountFootnote(peat),/staattinen viiteluku/);
assert.equal(ctx.shareCardAmount(ctx.data.find(d=>d.id==='fw-dividend-withholding')),'50–80 milj. €');
for(const d of ctx.data)assert.equal(ctx.actionAmountMarkup(d).replace(/<sup[^>]*>\*<\/sup>/,' *'),ctx.shareCardAmount(d),d.id+': same amount on page and image');
for(const id of ['cut-3-62','cut-4-31','tax-rd','tax-ifrs','fw-corporate-minimum']){
  const d=ctx.data.find(d=>d.id===id),display=ctx.cardAmountDisplay(d);
  assert.equal(display.hasAmount,false,id+': do not turn a partial cost, tax expenditure or withdrawn estimate into revenue');
  assert.equal(display.excluded,true);assert.equal(display.text,'Tuotto avoin');
}
assert.equal(ctx.cardAmountDisplay({amount:null,gross:1000,scaleNetOpen:true}).hasAmount,false,'unsupported extrapolation is not a reference');
assert.equal(ctx.cardAmountDisplay({amount:0}).hasAmount,true,'a known zero remains an actual amount');
assert.equal(ctx.cardAmountDisplay({amount:0}).excluded,false);
assert.equal(ctx.shareCardAmount(ctx.data.find(d=>d.id==='cut-1-42')),'445,3 milj. € *');
assert.equal(ctx.shareCardAmount(ctx.data.find(d=>d.id==='cut-1-72')),'100 milj. €');
// Inspect actual Canvas text calls, rather than searching source strings alone.
const drawn=[];
const drawing=new Proxy({measureText:value=>({width:String(value).length*11}),fillText:value=>drawn.push(String(value))},{get:(target,key)=>target[key]||(()=>{})});
const bitmap={getContext:()=>drawing};ctx.document={createElement:()=>bitmap};
ctx.root={querySelector:()=>({querySelectorAll:()=>[]})};ctx.Path2D=function(){};
ctx.calculateIncidence=()=>({entries:[],serviceEntries:[],serviceRows:Array.from({length:10},()=>({share:0,shareLow:0,shareHigh:0})),householdRows:Array.from({length:10},()=>({mid:0,percentLow:0,percentHigh:0,cut:0,tax:0,indirect:0}))});
ctx.incidenceModel={income:Array(10).fill(10000)};ctx.decileName=i=>'Ryhmä '+i;ctx.decileIncomeRange=()=>'';
ctx.piePresentation=()=>({parts:[],rings:[]});ctx.pieViewport=()=>({width:320,height:320,x:0,y:0});ctx.smallSliceLabel=()=>'';
ctx.stateIn({modelContent:{...seed,includeLater:true,selectedIds:[],fundingChoices:{yle:'reduce-tax',farm:'redirect'}}});
ctx.createShareImage(ctx.data,'Testi',true,'https://example.test/silppuri/#s=secret');
const imageText=drawn.join(' ');
for(const required of ['50–80 milj. €','Arvio palvelujen käytön perusteella',
  'ei mitattu menetys','Osin vastaavista toimista arvioitu jakauma','example.test/silppuri/'])assert.ok(imageText.includes(required),required);
assert.ok(!imageText.includes('#s='),'do not print a giant share token');
for(const removed of ['Veron aikaistuminen','Staattinen arvio','Yle-veron alennus','Tukien uudelleenjako'])assert.ok(!imageText.includes(removed),'card summaries contain no annotations: '+removed);
const qa=new URL(example);qa.host='127.0.0.1:8765';qa.protocol='http:';qa.pathname='/share-qa.html';qa.search='';
fs.mkdirSync(path.join(root,'tmp/share-qa'),{recursive:true});fs.writeFileSync(path.join(root,'tmp/share-qa/url.txt'),qa.href);
const large=new URL(full);large.host=qa.host;large.protocol='http:';large.pathname=qa.pathname;large.search='';
const plain='http://127.0.0.1:8765/share-qa.html';
fs.writeFileSync(path.join(root,'tmp/local-site/share-fixtures.html'),'<!doctype html><html lang="fi"><meta charset="utf-8"><title>Jakamisen testipaketit</title><p><a href="'+qa.href+'">Tavallinen testipaketti</a></p><p><a href="'+large.href+'">Suuri testipaketti</a></p><p><a href="'+plain+'#s=invalid">Virheellinen linkki</a></p></html>');
for(const removed of ['Palkit: skenaarioiden keskiarvo.','Tutkimukset ja laskentatavat: avaa','Palvelurahoituksen jakautuminen, ei menetys','const notes='])assert.ok(!read('src/share-image.js').includes(removed),'export stays visual: '+removed);
console.log('PASS: all 254 cards × both horizons, all funding/dividend modes, selected units, Unicode names, malformed/unknown links, immutable originals, private storage, legacy migration; largest URL '+full.length+' characters.');
console.log('Browser fixture: tmp/share-qa/url.txt');
(async()=>{
  const pngContext=vm.createContext({Blob,TextEncoder,Uint8Array,DataView});vm.runInContext(read('src/share-png.js'),pngContext);
  const original=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH9sAAAAASUVORK5CYII=','base64');
  const result=Buffer.from(await (await pngContext.creditSharePng(new Blob([original],{type:'image/png'}))).arrayBuffer());
  const length=result.readUInt32BE(33);assert.equal(result.toString('ascii',37,41),'iTXt');
  assert.match(result.toString('utf8',41,41+length),/Lorc.*CC BY 3\.0.*game-icons.net/);
  let crc=0xffffffff;for(const byte of result.subarray(37,41+length)){crc^=byte;for(let i=0;i<8;i++)crc=(crc&1)?(crc>>>1)^0xedb88320:crc>>>1;}
  assert.equal(result.readUInt32BE(41+length),(crc^0xffffffff)>>>0);
  assert.deepEqual(Buffer.concat([result.subarray(0,33),result.subarray(45+length)]),original,'credit must not alter image pixels or existing metadata');
  console.log('PASS: icon attribution embedded in PNG metadata with valid CRC; original image bytes preserved.');
})().catch(error=>{console.error(error);process.exitCode=1;});
