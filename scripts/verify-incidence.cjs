const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const actions=JSON.parse(read('data/catalogue.json')).actions;
const model=JSON.parse(read('data/incidence-model.json'));
const app=read('src/app.js');
const close=(a,b,message)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${message}: ${a} != ${b}`);
assert.equal(Object.keys(model.actions).length,actions.length);
assert.equal(model.coverage.numericalScenarios,202);
// Official group boundaries, not group means or guessed salary bands.
const bounds=JSON.parse(read('data/sources/income-bounds-2024.json'));
const boundIndex=bounds.dimension.contentscode.category.index;
assert.equal(model.referenceYear,2024);
assert.equal(model.incomeBounds.length,10);
model.incomeBounds.forEach((b,i)=>{
  assert.equal(b.low,bounds.value[i*2+boundIndex.alaraja]);
  assert.equal(b.high,bounds.value[i*2+boundIndex.ylaraja]);
  assert.ok(b.low<=model.income[i]);
  if(i<9)assert.ok(b.high>=model.income[i]);
  if(i>0)assert.equal(b.low,model.incomeBounds[i-1].high);
});
assert.equal(model.incomeBounds[0].high,16614);
assert.equal(model.incomeBounds[9].low,53129);
assert.equal(model.incomeBounds[9].high,null,'top group must remain open-ended');
assert.equal(Object.keys(model.unmodelled).length+Object.keys(model.actions).length,actions.length);
for(const [key,p] of Object.entries(model.profiles)){
  assert.equal(p.length,10,key);assert.ok(p.every(n=>Number.isFinite(n)&&n>=0),key);
  close(p.reduce((a,b)=>a+b,0),1,key);
}
for(const [id,raw] of Object.entries(model.actions)){
  const m=raw.methodKey?{...model.methods[raw.methodKey],...raw}:raw;
  assert.ok(actions.some(a=>a.id===id),id);
  assert.ok(m.method&&m.sources.length,id);
  assert.ok(m.sources.every(k=>model.sources[k]),id);
  if(m.kind==='sisu')assert.equal(m.percent.length,10,id);
  else if(m.kind!=='separate')assert.ok(m.profiles.every(k=>model.profiles[k]),id);
}
const ctx=vm.createContext({data:structuredClone(actions),incidenceModel:model,selected:new Set(),scenario:{income:1,corporate:1,dividends:'vm'},units:{},conditions:{yle:'reduce-tax',farm:'redirect'},year:2031,dividendStudyUrl:'https://www.sttinfo.fi/files/66784256/70136599/79254/fi'});
vm.runInContext('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});',ctx);
vm.runInContext(app.slice(app.indexOf('  function syncScenario(){'),app.indexOf('  const esc=')),ctx);
vm.runInContext(read('src/incidence.js'),ctx);
const calculate=(ids)=>{
  ctx.ids=ids;
  return vm.runInContext('syncScenario();calculateIncidence(data.filter(d=>ids.includes(d.id)),incidenceModel)',ctx);
};
const empty=calculate([]);assert.equal(empty.entries.length,0);assert.ok(empty.rows.every(r=>r.mid===0));
const extended=calculate(['health','corporate']);assert.equal(extended.entries.length,2);assert.equal(extended.missing.length,0);
assert.ok(extended.rows.every(r=>r.mid===0),'services and conditional company incidence must not become cash losses');
assert.ok(extended.channels.services.some(r=>r.mid>0));assert.ok(extended.channels.indirect.some(r=>r.mid>0));
const company=extended.entries.find(e=>e.id==='corporate');
for(let i=0;i<10;i++){
  close(extended.householdRows[i].mid,extended.channels.indirect[i].mid,'company added once, services excluded');
  close(extended.householdRows[i].cut+extended.householdRows[i].tax+extended.householdRows[i].indirect,extended.householdRows[i].mid,'three stacked parts equal total');
}
close(extended.serviceRows.reduce((n,r)=>n+r.share,0),100,'service allocation shares sum to 100');
close(extended.serviceRows.reduce((n,r)=>n+r.mid,0),extended.serviceTotal,'service euros conserved');
const mixedMoney=calculate(['benefits','income','corporate','health']);
for(let i=0;i<10;i++){
  const r=mixedMoney.householdRows[i];
  close(r.low,mixedMoney.channels.cash[i].low+mixedMoney.channels.indirect[i].low,'combined lower bound');
  close(r.high,mixedMoney.channels.cash[i].high+mixedMoney.channels.indirect[i].high,'combined upper bound');
  close(r.cut+r.tax+r.indirect,r.mid,'combined components');
}
// Whole-scenario averaging must conserve budgets even with three crossing profiles.
const syntheticModel={income:Array(10).fill(1),consumptionUnits:Array(10).fill(1),profiles:{a:[1,0,0,0,0,0,0,0,0,0],b:[0,1,0,0,0,0,0,0,0,0],c:[0,0,1,0,0,0,0,0,0,0]},actions:{a:{kind:'proxy',channel:'services',amountBasis:'public-total',profiles:['a','b','c']},b:{kind:'proxy',channel:'services',amountBasis:'public-total',profiles:['b']}}};
ctx.syntheticModel=syntheticModel;
ctx.syntheticActions=[{id:'a',amount:90,type:'cut'},{id:'b',amount:10,type:'cut'}];
let synthetic=vm.runInContext('calculateIncidence(syntheticActions,syntheticModel)',ctx);
assert.deepEqual(Array.from(synthetic.serviceRows,r=>r.share),[30,40,30,0,0,0,0,0,0,0]);
ctx.syntheticModel.income=Array(10).fill(99999);
let differentIncome=vm.runInContext('calculateIncidence(syntheticActions,syntheticModel)',ctx);
assert.deepEqual(Array.from(differentIncome.serviceRows,r=>r.share),Array.from(synthetic.serviceRows,r=>r.share),'service shares do not depend on cash income');
assert.ok(empty.serviceRows.every(r=>r.share===0&&Number.isFinite(r.shareLow)));
close(company.low.reduce((s,v,i)=>s+v*model.consumptionUnits[i],0),0,'corporate lower scenario');
company.scenarios.forEach(s=>assert.ok(s.reduce((n,v,i)=>n+v*model.consumptionUnits[i],0)<=430e6+1e-7));
close(company.mid.reduce((n,v,i)=>n+v*model.consumptionUnits[i],0),430e6*.5625,'mean of four coherent corporate allocations');
assert.equal(calculate(['cut-5-49']).missing.length,1,'collective defence not allocated as cash');
const homecare=calculate(['cut-3-62']);
assert.equal(homecare.entries[0].action.amount,null);assert.equal(homecare.entries[0].action.directAmount,-82);assert.ok(homecare.rows.every(r=>r.mid>=0));
close(homecare.rows.reduce((s,r,i)=>s+r.mid*model.consumptionUnits[i],0),144e6,'homecare gross benefit, not negative government net');

// VM 2026:44 p.331: first and last decile lose 1.3122% / 0.0463% for a 2% freeze.
// VM's approximately 7% real cut by 2031 is a labelled linear 7/2 extrapolation.
let benefit=calculate(['benefits']);
close(benefit.rows[0].percentLow,4.5927,'poorest benefit freeze');
close(benefit.rows[9].percentLow,.16205,'richest benefit freeze');
assert.ok(benefit.rows[0].percentLow>25*benefit.rows[9].percentLow);
assert.ok(benefit.rows[1].mid>benefit.rows[0].mid,'largest euro loss need not mean largest proportional loss');
assert.ok(benefit.entries[0].derived);
const index=calculate(['income-index']);close(index.rows[7].percentLow,.67,'VM 2026:48 p.67');
const combined=calculate(['benefits','income-index']);
for(let i=0;i<10;i++)close(combined.rows[i].low,benefit.rows[i].low+index.rows[i].low,'additive comparable units');

// A household tax bill follows the direct liability, not the pie's behavioural net.
let tax=calculate(['income']),entry=tax.entries[0];
assert.equal(entry.action.amount,900);assert.equal(entry.action.gross,1500);
close(entry.mid.reduce((n,x,i)=>n+x*model.consumptionUnits[i],0),1500e6,'allocated tax liability');
ctx.scenario.income=3;let larger=calculate(['income']);
for(let i=0;i<10;i++)close(larger.rows[i].mid,3*tax.rows[i].mid,'tax slider');
ctx.scenario.income=4;assert.equal(calculate(['income']).missing.length,1,'large changes must not reuse linear incidence');
ctx.scenario.income=0;assert.ok(calculate(['income']).rows.every(r=>r.mid===0));ctx.scenario.income=1;
const dividends=calculate(['dividends']);ctx.scenario.dividends='abolish';const abolished=calculate(['dividends']);
for(let i=0;i<10;i++)close(abolished.rows[i].mid/dividends.rows[i].mid,459/370,'dividend replacement');
const vat=calculate(['vat']);assert.equal(vat.entries[0].action.amount,2322);
close(vat.entries[0].mid.reduce((n,x,i)=>n+x*model.consumptionUnits[i],0),3870e6,'VAT before index compensation');
assert.ok(vat.rows[0].percentHigh>vat.rows[9].percentHigh,'VAT burden relative to income');

// The state loses revenue when earnings-related benefits are shortened, but
// benefit recipients still lose income; include the social-insurance funds.
const days=calculate(['cut-3-15']);assert.ok(days.entries[0].action.budgetAmount<0);assert.ok(days.entries[0].action.amount>0);
assert.ok(days.rows.some(r=>r.low>0));assert.ok(days.rows.every(r=>r.low>=0));
ctx.year=2028;const earlier=calculate(['benefits']);
assert.ok(earlier.rows[0].mid<benefit.rows[0].mid);assert.ok(earlier.entries[0].derived);
ctx.year=2031;
// Missing future amounts must never be silently changed to zero in an existing model.
ctx.unknown=[{...ctx.data.find(d=>d.id==='benefits'),amount:null,fundAmount:null}];
assert.equal(vm.runInContext('calculateIncidence(unknown,incidenceModel).missing.length',ctx),1);
ctx.unknown=[{...ctx.data.find(d=>d.id==='cut-2-55'),amount:null,fundAmount:null}];
assert.equal(vm.runInContext('calculateIncidence(unknown,incidenceModel).missing.length',ctx),1);
for(let year=2028;year<=2035;year++){
  ctx.year=year;
  const all=calculate(Object.keys(model.actions));
  assert.ok(Object.values(all.channels).flat().every(r=>['low','high','mid','percentLow','percentHigh'].every(k=>Number.isFinite(r[k]))));
  assert.ok(all.entries.every(e=>e.low.every(v=>v>=0)),'negative public effects must not create fictional household gains: '+year+' '+all.entries.filter(e=>e.low.some(v=>v<0)).map(e=>e.id));
  assert.ok(all.householdRows.every(r=>Number.isFinite(r.mid)&&r.low<=r.mid&&r.mid<=r.high));
  assert.ok(all.serviceRows.every(r=>Number.isFinite(r.share)&&r.shareLow<=r.share+1e-9&&r.share<=r.shareHigh+1e-9));
  if(all.serviceTotal>0)close(all.serviceRows.reduce((n,r)=>n+r.share,0),100,'all service shares '+year);
}
ctx.year=2031;

// Bars remain percentages. The new euro labels describe income-group boundaries.
const elements=new Map();
ctx.q=selector=>{if(!elements.has(selector))elements.set(selector,{});return elements.get(selector);};
Object.assign(ctx,{activeDecile:null,esc:String,drawFlows:()=>{},renderFlowDetail:()=>{},payerMoneyLabel:n=>n===null?'Ei arviota':n+' milj. €'});
vm.runInContext(read('src/incidence-view.js'),ctx);
const render=ids=>{calculate(ids);vm.runInContext('renderIncidence(data.filter(d=>ids.includes(d.id)))',ctx);};
render(['benefits','income','health']);
const chart=elements.get('.sp-decile-rows').innerHTML;
assert.equal((chart.match(/data-decile=/g)||[]).length,20);
assert.ok(chart.includes('suhteessa tuloihin vuodessa'));
assert.ok(chart.includes('sp-incidence-charts'),'horizontal charts are separate stacked sections');
const effectValues=[...chart.matchAll(/<strong class="sp-income-value">([^<]+)<\/strong>/g)].map(m=>m[1]);
assert.equal(effectValues.length,20);
assert.ok(effectValues.every(v=>v.includes('%')&&!v.includes('€')),'no absolute euro bars');
assert.equal((chart.match(/class="sp-income-bounds"/g)||[]).length,20);
assert.equal((chart.match(/Nettotulot \/ vuosi · yksin asuva · 2024/g)||[]).length,2);
for(let i=0;i<10;i++){
  ctx.boundaryDecile=i;
  const label=vm.runInContext('decileIncomeRange(boundaryDecile)',ctx);
  assert.equal(chart.split('<strong class="sp-income-bounds">'+label+'</strong>').length-1,2);
  assert.ok(elements.get('#sp-decile-picker').innerHTML.includes(label));
}
ctx.year=2035;render(['benefits']);
assert.ok(elements.get('.sp-decile-rows').innerHTML.includes('yksin asuva · 2024'),'income data year is not the policy simulation year');
ctx.year=2031;
assert.equal(elements.get('.sp-decile-detail').hidden,true);
assert.ok(chart.includes('Arvioitu osuus palveluleikkauksista'));
assert.equal((chart.match(/sp-effect-cell sp-service-cell/g)||[]).length,10);
ctx.activeDecile=9;render(['benefits','income']);
assert.ok(elements.get('.sp-decile-detail').innerHTML.includes('Suurituloisin 10 %'));
assert.ok(elements.get('.sp-decile-detail').innerHTML.includes(' €'));
assert.equal(elements.get('.sp-decile-detail').hidden,false);
render(['benefits','income','health','corporate']);
const breakdown=elements.get('.sp-decile-detail').innerHTML;
assert.ok(breakdown.includes('data-detail-channel="cash"'));
assert.ok(breakdown.includes('data-detail-channel="services"'));
assert.ok(breakdown.includes('data-detail-channel="indirect"'));
assert.equal((breakdown.match(/Eurot yhden aikuisen vertailutaloudelle/g)||[]).length,1,'shared household basis is not repeated');
assert.ok(breakdown.indexOf('</section>')<breakdown.indexOf('data-detail-channel="services"'),'services are separate from household cash');
render(['corporate']);assert.ok(elements.get('.sp-international').innerHTML.includes('Fuest'));
assert.ok(elements.get('.sp-decile-rows').innerHTML.includes('sp-income-indirect'));
assert.ok(!elements.get('.sp-decile-rows').innerHTML.includes('sp-service-cell'));
assert.ok(elements.get('.sp-decile-source').innerHTML.includes('Yritysten kautta (arvio)'));
render(['health']);
assert.ok(elements.get('.sp-decile-rows').innerHTML.includes('data-income-chart="services"'));
assert.ok(!elements.get('.sp-decile-rows').innerHTML.includes('sp-service-reference'));
assert.ok(!elements.get('.sp-decile-rows').innerHTML.includes('Tasajako'));
assert.ok(!elements.get('.sp-decile-rows').innerHTML.includes('Rahat ja ostovoima'));
assert.ok(!elements.get('.sp-decile-detail').innerHTML.includes('vertailutaloudelle'));
assert.ok(elements.get('.sp-decile-detail').innerHTML.includes('milj. €'));
render([]);assert.ok(elements.get('.sp-decile-rows').innerHTML.includes('Ei valittuja toimia.'));
assert.equal(elements.get('.sp-decile-head').hidden,true);
assert.equal(elements.get('.sp-decile-axis').hidden,true);
const markup=read('src/silppuri.template.html').split('<script>')[0];
assert.ok(markup.includes('Palkkidiagrammi'));
assert.ok(!markup.includes('Menetys €/v'));
console.log(`PASS: ${actions.length} actions, ${model.coverage.numericalScenarios} models, official income boundaries, percentage bars, cash/company incidence, service allocation conserving 100%, all years and horizontal layout.`);
