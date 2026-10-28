const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.join(__dirname,'..');
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'data/catalogue.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const actions=catalogue.actions;
const ids=new Set(actions.map(d=>d.id));
assert.equal(ids.size,actions.length);
const flows=new Set(['consumption','earned','capital','companies','investors','support','pension','students','families','employees','research','nonprofits','services','abroad']);
for(const d of actions){
  assert.ok(flows.has(d.flow),d.id);
  assert.ok(d.source&&d.who&&d.society,d.id);
  assert.equal(d.budget.length,8);assert.equal(d.funds.length,8);
  assert.ok(d.budget.every(x=>x===null||Number.isFinite(x)),d.id);
  for(const other of d.conflicts){
    assert.ok(ids.has(other),other);
    assert.ok(actions.find(x=>x.id===other).conflicts.includes(d.id),`${d.id}/${other}`);
  }
  for(const other of d.possibleOverlaps||[]){
    assert.ok(ids.has(other.id));assert.ok(other.note);
    assert.ok(!d.conflicts.includes(other.id),`${d.id}: a possible overlap must not delete the other policy`);
    assert.ok(actions.find(x=>x.id===other.id).possibleOverlaps.some(o=>o.id===d.id));
  }
}
const coverage=JSON.parse(fs.readFileSync(path.join(root,'data/coverage.json'),'utf8'));
assert.equal(coverage.length,399);
assert.equal(coverage.filter(r=>r.status==='included').length,catalogue.meta.cutRows);
assert.ok(coverage.filter(r=>r.status.startsWith('below-20m')).every(r=>(r.maxPotentialMillion??r.maxNetMillion??r.maxReportedMillion)<20));
const excluded=JSON.parse(fs.readFileSync(path.join(root,'data/nonrecurring-exclusions.json'),'utf8'));
assert.deepEqual(catalogue.meta.excludedNonrecurring,Object.keys(excluded).sort());
assert.equal(Object.keys(excluded).length,11);
for(const [id,reason] of Object.entries(excluded)){
  assert.ok(!ids.has(id),id);
  const audit=coverage.find(d=>d.key===reason.sourceKey);
  assert.equal(audit.status,'nonrecurring');assert.equal(audit.reason,reason.reason);
}
// A temporary freeze is not a temporary appropriation: payment bases can stay lower.
for(const id of ['benefits','health','education','cut-3-51','cut-5-49','cut-5-52','cut-6-5'])assert.ok(ids.has(id),id);
assert.ok(!ids.has('cut-4-44')&&!ids.has('cut-4-45'));
assert.deepEqual(catalogue.meta.excludedBelow20mNet,['cut-1-15','cut-5-40','cut-5-42','tax-biogas','tax-car-combustion','tax-commute','tax-rail']);
assert.ok(catalogue.meta.excludedBelow20mNet.every(id=>!ids.has(id)));

// Exercise the actual app calculation with source-based expected outcomes.
const ctx=vm.createContext({data:structuredClone(actions),selected:new Set(),scenario:{income:4,corporate:10,dividends:'vm'},units:{},conditions:{yle:'reduce-tax',farm:'redirect'},year:2031,includeLater:false,dividendStudyUrl:'https://www.sttinfo.fi/files/66784256/70136599/79254/fi'});
vm.runInContext('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});',ctx);
vm.runInContext(source.slice(source.indexOf('  function syncScenario(){'),source.indexOf('  const esc=')),ctx);
const calculate=()=>vm.runInContext('syncScenario();Object.fromEntries(data.map(d=>[d.id,{amount:d.amount,budget:d.budgetAmount,direct:d.directAmount,gross:d.gross,netUpper:d.netUpper,funds:d.fundAmount,title:d.title,year:d.year}]))',ctx);
let r=calculate();
assert.equal(r['cut-1-42'].amount,0);assert.ok(!r['cut-1-43']);
assert.equal(r.income.amount,null);assert.equal(r.income.gross,6000);
assert.equal(r.corporate.amount,null);assert.equal(r.corporate.gross,4300);
assert.equal(r.health.amount,3310);assert.ok(!r['cut-5-19']);
assert.equal(r['cut-1-72'].amount,0);assert.equal(r['cut-3-62'].amount,null);assert.equal(r['cut-3-62'].direct,-82);
assert.equal(r['cut-7-29'].amount,70); // VM classifies Sitra outside general government; transferred assets yield government income.
assert.equal(r['tax-rd'].amount,null);assert.ok(r['cut-3-51'].funds>0);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
// VM annex, social-security sheet, rows 51, 49, 15 and 62, year 2031:
// Fiscal consolidation includes both columns. Homecare's direct cost is not a full net estimate.
close(r['cut-3-51'].amount,2039.70691);
close(r['cut-3-49'].amount,70.753428);
assert.ok(r['cut-3-15'].amount>0&&r['cut-3-15'].budget<0);
close(r['cut-3-15'].amount,r['cut-3-15'].budget+r['cut-3-15'].funds);
close(calculate()['cut-3-51'].amount,2039.70691); // No double count on a repeated render.
// Non-recurring options are absent even before their scheduled expiry.
for(const year of [2028,2030,2031,2035]){
  ctx.year=year;
  const active=calculate();
  assert.ok(Object.keys(excluded).every(id=>!active[id]));
  assert.ok(active['cut-3-51'].amount>0,'pension freeze keeps saving after the freeze ends');
}
ctx.year=2031;
ctx.selected.clear();
ctx.conditions.yle='keep-tax';ctx.conditions.farm='save';r=calculate();
assert.equal(r['cut-1-42'].amount,59.4);assert.equal(r['cut-1-72'].amount,100);
ctx.year=2035;r=calculate();assert.equal(r['cut-1-42'].amount,118.7);assert.equal(r.health.amount,3310);
ctx.year=2028;r=calculate();assert.equal(r['tax-vehicle'].amount,0);assert.equal(r['tax-diesel'].amount,0);
ctx.year=2029;r=calculate();assert.equal(r['tax-vehicle'].amount,230);
ctx.selected.add('tax-land-values');r=calculate();assert.equal(r['tax-land-min'].amount,100);
ctx.selected.delete('tax-land-values');r=calculate();assert.equal(r['tax-land-min'].amount,50);
ctx.scenario.dividends='abolish';r=calculate();assert.equal(r.dividends.amount,459);
ctx.scenario.dividends='vm';r=calculate();assert.equal(r.dividends.amount,370);

// Expected amounts checked against VM 2026:48 pp.263–274 and pp.67–68.
// A tooltip mentioning net revenue is insufficient: the live amount used by
// the pie, sum, ranking and payer diagram must use the same reviewed value.
Object.assign(ctx.scenario,{income:1,corporate:1});ctx.year=2031;
r=calculate();
const netAmounts={income:900,'income-index':489,corporate:259.5,'tax-transfer-land':95,'tax-transfer-homes':140.65,'tax-transfer-shares':103.75,'tax-vat15':300,'tax-vat16':492,'tax-food18':708,'tax-vat-services':480,vat:2322,'tax-vat-standard':416.4,'tax-vat-reduced':188.4,'tax-excise-index':80,'tax-tobacco':41,'tax-diesel':150,'tax-commercial-diesel':33,'tax-van':90,'tax-vehicle':230,'tax-heat':116.8,'tax-fuel':31,'tax-electric1':36,'tax-electric2':36,'tax-car-all':50,'tax-land-values':676.2};
assert.equal(Object.keys(netAmounts).length,catalogue.meta.netEstimates);
for(const [id,amount] of Object.entries(netAmounts))assert.equal(r[id].amount,amount,id);
assert.equal(r.vat.gross,3870);
assert.equal(r.corporate.netUpper,334);
assert.equal(r['tax-van'].netUpper,120);
assert.equal(r['tax-insurance'].amount,47); // No separate net estimate: keep and label the direct estimate.
assert.equal(r['cut-1-75'].amount,30); // MMM 2024:1 p.57: estimated fee receipts, not the VM annex's 60m.
assert.ok(actions.find(d=>d.id==='cut-1-75').budget.includes(60)); // Preserve original source figures.
assert.equal(r['tax-rd'].amount,null);
ctx.units['tax-vat-standard']=2;ctx.units['tax-vehicle']=2;r=calculate();
assert.equal(r['tax-vat-standard'].amount,832.8);assert.equal(r['tax-vat-standard'].gross,1388);
assert.equal(r['tax-vehicle'].amount,460);
assert.equal(calculate()['tax-vat-standard'].amount,832.8); // Re-render must not deduct twice.
ctx.units['tax-vat-standard']=0;r=calculate();assert.equal(r['tax-vat-standard'].amount,0);
ctx.year=2028;r=calculate();assert.equal(r['tax-vehicle'].amount,0);assert.equal(r['tax-vehicle'].gross,0);
ctx.year=2031;ctx.units['tax-vat-standard']=1;ctx.units['tax-vehicle']=1;
r=calculate();assert.equal(r['tax-vat-standard'].amount,416.4);
assert.equal(r.vat.amount+r['tax-tobacco'].amount,2363);
assert.deepEqual(actions.find(d=>d.id==='cut-1-42').mergedIds,['cut-1-43']);
assert.ok(actions.find(d=>d.id==='vat').conflicts.includes('tax-vat16'));
assert.ok(!actions.find(d=>d.id==='health').conflicts.includes('cut-4-6'));
assert.ok(actions.find(d=>d.id==='health').possibleOverlaps.some(o=>o.id==='cut-4-6'));
// Separate training grants / YTHS funding do not replace the general funding freeze.
for(const id of ['cut-4-42','cut-4-47'])assert.ok(!actions.find(d=>d.id==='health').conflicts.includes(id));
assert.ok(!actions.find(d=>d.id==='health').possibleOverlaps.some(o=>o.id==='cut-4-40'));
assert.ok(!actions.find(d=>d.id==='cut-5-49').conflicts.includes('cut-5-52'));
for(const id of ['cut-7-41','cut-7-42','cut-7-52']){
  assert.ok(!actions.find(d=>d.id===id).conflicts.includes('health'));
  assert.ok(!actions.find(d=>d.id==='health').conflicts.includes(id));
}
vm.runInContext(source.slice(source.indexOf('  const conflictsFor='),source.indexOf('  function controlsMarkup')),ctx);
for(const ids of [['health','cut-7-42'],['cut-7-42','health']]){
  ctx.selected.clear();
  for(const id of ids){
    const d=ctx.data.find(x=>x.id===id);
    d.conflicts.forEach(c=>ctx.selected.delete(c));ctx.selected.add(id);
  }
  assert.equal(ctx.selected.size,2);
  const pairs=vm.runInContext('selectedOverlaps(data.filter(d=>selected.has(d.id)))',ctx);
  assert.equal(pairs.length,1,'one warning for one pair, regardless of insertion order');
  assert.ok(pairs[0].note.includes('1 123'));
}
ctx.selected.clear();
new vm.Script(source.replace('[]/*CATALOGUE*/',JSON.stringify(actions)));
// A host state echo must not collapse an expanded catalogue back to 12 rows.
Object.assign(ctx,{maxPP:20,payerGroups:[],filter:'all',category:'all',search:'',sortOrder:'desc',activeFlow:null,limit:32,catalogueOrder:[],catalogueOrderKey:'',q:()=>({value:''})});
ctx.window={openai:{setWidgetState:snapshot=>{ctx.savedSnapshot=snapshot;return Promise.resolve();}}};
// capFor is loaded with syncScenario above.
vm.runInContext(source.slice(source.indexOf('  function stateIn'),source.indexOf('  function slice')),ctx);
vm.runInContext('save()',ctx);
assert.equal(ctx.savedSnapshot.privateContent.visibleCount,32);
ctx.limit=12;ctx.stateIn(ctx.savedSnapshot);assert.equal(ctx.limit,32);
ctx.limit+=20;vm.runInContext('save()',ctx);ctx.limit=12;ctx.stateIn(ctx.savedSnapshot);assert.equal(ctx.limit,52);
ctx.selected.add('health');ctx.selected.add('cut-7-42');vm.runInContext('save()',ctx);
ctx.selected.clear();ctx.stateIn(ctx.savedSnapshot);
assert.ok(ctx.selected.has('health')&&ctx.selected.has('cut-7-42'),'restore both distinct policies');
ctx.selected.clear();

// A legacy search that leaves only two cards must not hide the catalogue
// when the updated artifact opens. Package choices and pagination survive.
const legacySnapshot=structuredClone(ctx.savedSnapshot);
delete legacySnapshot.privateContent.catalogueViewVersion;
Object.assign(legacySnapshot.privateContent,{search:'tupakka',filter:'tax',category:'consumption'});
legacySnapshot.modelContent.selectedIds=['vat','corporate'];
ctx.stateIn(legacySnapshot);
assert.equal(ctx.search,'');assert.equal(ctx.filter,'all');assert.equal(ctx.category,'all');
assert.equal(ctx.limit,52);assert.deepEqual([...ctx.selected],['vat','corporate']);
vm.runInContext(source.slice(source.indexOf('  function resetCatalogueView'),source.indexOf("  q('#sp-sort')")),ctx);
const matchIds=()=>vm.runInContext("data.filter(d=>matchesType(d)&&(category==='all'||d.flow===category)&&matchesSearch(d,searchWords(search))).map(d=>d.id)",ctx);
assert.equal(matchIds().length,actions.length-2);
assert.ok(!matchIds().includes('cut-4-40')&&!matchIds().includes('cut-5-39'));
ctx.search='tupakka';ctx.filter='tax';ctx.category='consumption';
assert.equal(matchIds().length,2);
vm.runInContext('save()',ctx);ctx.stateIn(ctx.savedSnapshot);assert.equal(matchIds().length,2);
ctx.resetCatalogueView();assert.equal(matchIds().length,actions.length-2);
assert.deepEqual([...ctx.selected],['vat','corporate']);
vm.runInContext('save()',ctx);ctx.stateIn(ctx.savedSnapshot);assert.equal(matchIds().length,actions.length-2);
ctx.selected.add('health');
ctx.filter='selected-cut';assert.deepEqual(Array.from(matchIds()),['health']);
ctx.filter='selected-tax';assert.deepEqual(new Set(matchIds()),new Set(['vat','corporate']));
vm.runInContext('save()',ctx);ctx.stateIn(ctx.savedSnapshot);assert.equal(ctx.filter,'selected-tax');assert.equal(matchIds().length,2);
ctx.selected.delete('corporate');assert.equal(matchIds().length,1);
ctx.resetCatalogueView();assert.ok(matchIds().includes('corporate'));assert.ok(!matchIds().includes('vat')&&!matchIds().includes('health'));
for(const year of [2028,2031,2035])for(const order of [[...Object.keys(excluded),'cut-7-24','health'],['cut-7-24','health',...Object.keys(excluded)]]){
  ctx.stateIn({modelContent:{year,selectedIds:order}});
  assert.deepEqual(new Set(ctx.selected),new Set(['cut-7-24','health']),'removed choices must not evict active policies while restoring state');
}
console.log(`PASS: ${actions.length} actions, 399 source rows, symmetric alternatives, Yle, fund accounting, negative effects, years, adjustable taxes and land-tax dependency.`);
console.log('PASS: expanded catalogue survives saved-state echoes (32 and 52 rows).');
console.log('PASS: 25 reviewed net estimates, range lower bounds, scaling, zero, year gating, repeat renders and 20m cutoff.');
console.log('PASS: chosen cards leave the discovery list, red/blue bookmarks filter chosen actions, removal returns a card and state echoes preserve the view.');
