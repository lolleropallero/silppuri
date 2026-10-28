const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n');
const actions=JSON.parse(read('data/catalogue.json')).actions,source=read('src/app.js'),model=JSON.parse(read('data/incidence-model.json'));
const adjustable=actions.filter(d=>d.percentCut),original=JSON.stringify(actions);
assert.equal(adjustable.length,15);
assert.ok(adjustable.some(d=>d.id==='cut-1-25'));
assert.ok(!actions.find(d=>d.id==='cut-3-12').percentCut,'a benefit replacement rate is not a percentage spending cut');
const ctx=vm.createContext({TextEncoder,TextDecoder,Uint8Array,btoa,atob,data:structuredClone(actions),selected:new Set(),scenario:{income:2,corporate:3,dividends:'vm',cutPercents:{}},units:{},conditions:{yle:'keep-tax',farm:'save'},year:2031,includeLater:false,
 maxPP:10,packageName:'',payerGroups:[],filter:'all',category:'all',search:'',sortOrder:'desc',activeFlow:null,limit:12,catalogueOrder:[],catalogueOrderKey:'',q:()=>({value:''}),moneyLabel:n=>String(n)});
const run=s=>vm.runInContext(s,ctx),get=id=>ctx.data.find(d=>d.id===id);
run(read('src/share-state.js'));run(read('src/incidence.js'));
run('const packageSession=createShareSession(()=>window.openai);const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});');
run(source.slice(source.indexOf('  function syncScenario(){'),source.indexOf('  const esc=')));
run(source.slice(source.indexOf('  function controlsMarkup'),source.indexOf('  data.forEach(d=>{\n    const article')));
run(source.slice(source.indexOf('  function stateIn'),source.indexOf('  function slice')));
const close=(a,b,message)=>assert.ok(Math.abs(a-b)<1e-7,message+': '+a+' vs '+b);
for(const base of adjustable){
 const id=base.id,reference=base.percentCut.referencePercent;
 for(const percent of new Set([reference,...Array.from({length:20},(_,i)=>(i+1)*5)])){
  ctx.scenario.cutPercents[id]=percent;
  for(let year=2028;year<=2035;year++){
   ctx.year=year;ctx.includeLater=false;run('syncScenario()');
   const d=get(id),scale=percent/reference,i=year-2028;
   close(d.gross,base.budget[i]*scale,id+' gross');
   close(d.amount,(base.spendingNet?base.budget[i]*base.spendingNet.factors[0]:base.budget[i]+base.funds[i])*scale,id+' net');
   assert.ok(d.title.includes('−'+percent+' %'));assert.equal(d.scaled,percent!==reference);
   if(base.spendingNet)close(d.netUpper,base.budget[i]*base.spendingNet.factors[1]*scale,id+' upper');
   const amount=d.amount;run('syncScenario()');close(get(id).amount,amount,id+' repeated rendering');
  }
  ctx.year=2031;ctx.includeLater=true;run('syncScenario()');
  const later=get(id).amount;
  ctx.scenario.cutPercents[id]=reference;run('syncScenario()');
  close(later,get(id).amount*percent/reference,id+' later horizon');
  const baseEntry=ctx.calculateIncidence([get(id)],model).entries[0];
  ctx.scenario.cutPercents[id]=percent;run('syncScenario()');
  const scaledEntry=ctx.calculateIncidence([get(id)],model).entries[0];
  if(baseEntry)baseEntry.mid.forEach((n,i)=>close(scaledEntry.mid[i],n*percent/reference,id+' incidence'));
  else assert.equal(scaledEntry,undefined,'missing incidence stays missing');
  const snapshot=ctx.packageModel();snapshot.selectedIds=[id];
  const decoded=ctx.decodeShare(ctx.encodeShare(snapshot),new Set(actions.map(d=>d.id)));
  ctx.stateIn({modelContent:decoded});assert.equal(get(id).cutPercent,percent);close(get(id).amount,later,id+' shared link');
  if(percent!==reference){assert.match(ctx.effectFor(get(id)).caveat,/lineaarinen laskelma/);assert.match(get(id).year,/oma/);}
 }
 ctx.scenario.cutPercents[id]=reference;
}
assert.equal(JSON.stringify(actions),original,'source series stay immutable');
assert.equal(run('JSON.stringify([...baseData.values()])'),original,'runtime reference series stay immutable');
const id='cut-1-25';
for(const [value,expected] of [[0,5],[-20,5],[12,10],[105,100],[null,30]]){
 ctx.stateIn({modelContent:{selectedIds:[id],cutPercents:{[id]:value}}});assert.equal(get(id).cutPercent,expected);
}
ctx.stateIn({modelContent:{selectedIds:[id],cutPercents:{[id]:65}}});
ctx.window={openai:{setWidgetState:s=>{ctx.saved=structuredClone(s);}}};ctx.save();
ctx.stateIn({modelContent:{selectedIds:[id]}});assert.equal(get(id).cutPercent,30,'old saved packages retain the source percentage');
ctx.stateIn(ctx.saved);assert.equal(get(id).cutPercent,65,'own saved package retains adjustment');
const defaultModel={...ctx.packageModel(),cutPercents:{}};
ctx.stateIn({modelContent:ctx.decodeShare(ctx.encodeShare(defaultModel),new Set(actions.map(d=>d.id)))});
assert.equal(get(id).cutPercent,30,'a link without a percentage adjustment uses the source percentage');
for(const bad of [0,101,7,'50']){
 assert.throws(()=>ctx.encodeShare({...defaultModel,cutPercents:{[id]:bad}}));
}
for(const percent of [5,100]){
 ctx.stateIn({modelContent:{selectedIds:[id],cutPercents:{[id]:percent}}});
 for(const place of ['card','modal'])assert.match(ctx.controlsMarkup(id,place),new RegExp('id="sp-'+place+'-'+id+'-'+(percent===5?'minus':'plus')+'"[^>]*disabled'));
}
ctx.stateIn({modelContent:{selectedIds:['cut-7-52']}});assert.equal(get('cut-7-52').cutPercent,1,'original one-percent wage cut remains available');
console.log('PASS: 15 adjustable cuts, 5–100% in 5-point steps, original defaults, all eight years, net ranges, later horizon, repeated rendering, incidence scaling, saved packages and compact share links.');
