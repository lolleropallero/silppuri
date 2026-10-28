const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src/app.js'),'utf8').replace(/\r\n/g,'\n');
const actions=JSON.parse(fs.readFileSync(path.join(root,'data/catalogue.json'),'utf8')).actions;
const ctx=vm.createContext({data:structuredClone(actions),selected:new Set(),scenario:{income:2,corporate:3,dividends:'vm'},units:{},conditions:{yle:'reduce-tax',farm:'redirect'},year:2031,includeLater:false,
  format:n=>(n/1000).toLocaleString('fi-FI',{minimumFractionDigits:2,maximumFractionDigits:2}),esc:String,
  maxPP:20,payerGroups:[],filter:'all',category:'all',search:'',sortOrder:'asc',activeFlow:null,limit:32,catalogueOrder:[],catalogueOrderKey:'',q:()=>({value:''}),
  dividendStudyUrl:'https://www.sttinfo.fi/files/66784256/70136599/79254/fi'});
const run=s=>vm.runInContext(s,ctx);
ctx.packageName='';
run(fs.readFileSync(path.join(root,'src/share-state.js'),'utf8'));
run('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});');
run(source.slice(source.indexOf('  function syncScenario(){'),source.indexOf('  const esc=')));
run(source.slice(source.indexOf('  const moneyLabel='),source.indexOf("  q('#sp-category').insertAdjacentHTML")));
run(source.slice(source.indexOf('  function resetCatalogueView'),source.indexOf("  q('#sp-sort')")));
run(source.slice(source.indexOf('  function capFor'),source.indexOf('  function controlsMarkup')));
run(source.slice(source.indexOf('  function stateIn'),source.indexOf('  function slice')));
const refresh=()=>run('syncScenario()');
const note=id=>{ctx.testId=id;return run('amountFootnote(data.find(d=>d.id===testId))');};
const amount=id=>ctx.data.find(d=>d.id===id).amount;
refresh();
assert.match(note('cut-2-51'),/110.*2033/);
assert.match(note('cut-7-20'),/100.*2035/);
assert.match(note('cut-3-52'),/300.*2060/);
assert.match(note('cut-3-45'),/50.*2100/);
assert.match(note('cut-3-48'),/yli 100.*2100/);
assert.match(note('cut-2-58'),/67,7.*2035/);
assert.equal(amount('cut-3-52'),0,'a future 300m estimate must not enter the current-year pie');
assert.ok(Math.abs(amount('cut-3-45')-.02016)<1e-9);
assert.match(run('moneyLabel(0.02016)'),/^0,02 milj/,'do not round a real saving to zero');
assert.match(run('moneyLabel(-0.00167)'),/^[−-]0,0017 milj/);
assert.equal(run('moneyLabel(null)'),'Ei arviota');
assert.ok(!note('cut-3-62'));
assert.match(note('cut-1-72'),/jaetaan uudelleen/);
assert.match(note('cut-1-42'),/Yle-veroa alennetaan/);
assert.ok(run("actionAmountMarkup(data.find(d=>d.id==='cut-3-52'))").includes('<sup'));
assert.ok(!run("actionAmountMarkup(data.find(d=>d.id==='vat'))").includes('<sup'));
for(let year=2028;year<=2035;year++){
  ctx.year=year;refresh();
  for(const d of ctx.data.filter(d=>Number.isFinite(d.amount)&&d.amount>=0&&d.amount<20)){
    assert.ok(note(d.id),d.id+' / '+year+': small or zero value needs an explanation');
    assert.ok(!note(d.id).startsWith('VM:n taulukossa'),d.id+': replace fallback with a specific reason');
  }
}
ctx.year=2028;ctx.units['tax-vehicle']=1;refresh();assert.match(note('tax-vehicle'),/2029/);
ctx.units['tax-vehicle']=0;refresh();assert.match(note('tax-vehicle'),/valittu 0/);
ctx.year=2035;refresh();assert.match(note('cut-5-49'),/puolustusmenotavoite/);
ctx.year=2031;ctx.units['tax-vehicle']=1;refresh();
const ordered=()=>Array.from(run("orderCatalogue(data.filter(d=>matchesType(d)&&(category==='all'||d.flow===category)&&matchesSearch(d,searchWords(search)))).map(d=>d.id)"));
const before=ordered(),index=before.indexOf('cut-1-72');
assert.ok(index>=0&&index<32,'farm option is on the current page');
ctx.conditions.farm='save';refresh();assert.equal(amount('cut-1-72'),100);
assert.deepEqual(ordered(),before,'changing a conditional amount must not reorder the page');
ctx.limit+=20;assert.deepEqual(ordered(),before,'pagination retains the browsing order');
ctx.window={openai:{setWidgetState:s=>{ctx.snapshot=structuredClone(s);return Promise.resolve();}}};
run('save()');
assert.ok(Buffer.byteLength(JSON.stringify(ctx.snapshot))<16384);
assert.equal(ctx.snapshot.modelContent.includeLater,false);
ctx.stateIn(ctx.snapshot);assert.deepEqual(ordered(),before,'host state echo cannot move the card');
ctx.catalogueOrder=[];ctx.catalogueOrderKey='';ctx.search='old search';ctx.stateIn(ctx.snapshot);
assert.deepEqual(ordered(),before,'saved browsing order restores in a fresh view');
ctx.sortOrder='desc';const descending=ordered();
assert.ok(descending.indexOf('cut-1-72')!==index,'explicit sort uses the updated amount');
for(let i=1;i<descending.length;i++){
  ctx.first=ctx.data.find(d=>d.id===descending[i-1]);ctx.second=ctx.data.find(d=>d.id===descending[i]);
  assert.ok(run('compareAmounts(first,second)')<=0);
}
ctx.search='maatalous';ordered();ctx.search='';assert.deepEqual(ordered(),descending,'search resets ranking using current values');
ctx.filter='tax';assert.ok(ordered().every(id=>ctx.data.find(d=>d.id===id).type==='tax'||ctx.data.find(d=>d.id===id).filterTypes?.includes('tax')));
const fragment=fs.readFileSync('C:/Users/aleks/.codex/visualizations/2026/10/26/01a17813-fc63-7ab3-a7a1-468c076b25bd/silppuri-konsepti.html','utf8');
assert.ok(!fragment.includes('Takaisin valintoihin')&&!fragment.includes('class="sp-add '));
assert.ok(fragment.includes('class="sp-card-open cursor-interaction"'));
assert.ok(fragment.includes("selected.has(id)?'Poista paketista':'Silppuriin!'"));
ctx.includeLater=true;refresh();run('save()');ctx.includeLater=false;ctx.stateIn(ctx.snapshot);
assert.equal(ctx.includeLater,true);assert.equal(amount('cut-2-51'),110,'saved horizon restores');
ctx.stateIn({modelContent:{year:2035,selectedIds:['cut-2-51']}});
assert.equal(ctx.year,2031);assert.equal(ctx.includeLater,false);assert.equal(amount('cut-2-51'),0,'legacy snapshots default to 2031');
console.log('PASS: zero/small-value notes across all cards and years, source-based later estimates, no false rounded zero, unchanged pie amounts, stable adjustment order, pagination, state echoes and explicit re-sorting.');
