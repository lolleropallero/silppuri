const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const model=JSON.parse(read('data/incidence-model.json')),actions=JSON.parse(read('data/catalogue.json')).actions;
const ctx=vm.createContext({incidenceModel:model,data:structuredClone(actions),selected:new Set(),scenario:{income:2,corporate:3,dividends:'vm'},units:{},conditions:{yle:'reduce-tax',farm:'redirect'},year:2031,includeLater:false});
const run=s=>vm.runInContext(s,ctx);
for(const file of ['incidence','share-state','share-editorial','share-summary'])run(read('src/'+file+'.js'));
run('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});');
const app=read('src/app.js');run(app.slice(app.indexOf('  function syncScenario(){'),app.indexOf('  const esc=')));
const income=[10000,15000,20000,25000,30000,35000,40000,45000,55000,100000];
const testModel={income,consumptionUnits:Array(10).fill(1000),actions:{},profiles:{}};
function synthetic(percent,flow='support',extra={}){
  const d={id:'test',flow,type:'cut',title:'Testitoimi',amount:10000,...extra};
  const m={...testModel,actions:{test:{kind:'sisu',percent}}};
  return ctx.packageSummary([d],ctx.calculateIncidence([d],m),m);
}
const flat=Array(10).fill(5),poor=[15,15,15,5,5,5,5,0,0,0],rich=[0,0,0,0,0,0,0,5,10,15];
const flatSummary=synthetic(flat),poorSummary=synthetic(poor),richSummary=synthetic(rich,'capital');
assert.equal(flatSummary.story.id,'even');
assert.equal(poorSummary.story.id,'lower-spared-upper');
assert.equal(richSummary.story.id,'upper-only');
assert.match(flatSummary.story.text,/Kukaan ei pakene/);
assert.match(poorSummary.story.text,/Kova köyhille/);
assert.match(richSummary.description,/Neuvostoliitto/);
assert.equal(new Set([flatSummary.story.text,poorSummary.story.text,richSummary.story.text]).size,3,'same fiscal total, three different distributions');
assert.equal(new Set([flatSummary.tone.text,poorSummary.tone.text,richSummary.tone.text]).size,1,'same total has the same goal subtitle');
assert.equal(flatSummary.tone.id,'target');
const goalCases=[[-1,'reverse'],[0,'zero'],[.01,'rookie'],[4999.99,'rookie'],[5000,'under'],[9499.99,'under'],[9500,'target'],[10000,'target'],[10500,'target'],[10500.01,'over'],[15000,'over'],[15000.01,'heavy'],[17499.99,'heavy'],[17500,'extreme'],[19999.99,'extreme'],[20000,'demolition'],[50000,'demolition']];
for(const [amount,id] of goalCases)assert.equal(synthetic(poor,'support',{amount}).tone.id,id,'goal boundary '+amount);
assert.equal(ctx.packageSummary([]).tone.id,'empty');
assert.equal(ctx.packageSummary([]).tone.text,'Terät vielä puhtaina.');
const restoredSubtitles=[
  [-1,'Silppuri kävi takaperin.'],
  [0,'Terät pyörivät. Laskuri ei.'],
  [500,'IMF hoitaa loput myöhemmin.'],
  [7000,'Loput seuraavan hallituksen murheeksi.'],
  [10000,'Kympin tuntumassa. Sormet tallella.'],
  [12500,'Tavoite oli ilmeisesti alaraja.'],
  [16000,'Lähti vähän kantavaa seinää.'],
  [18000,'Sammutusnappi meni mukana.'],
  [20000,'Budjetti loppui. Jumala armahtaa, Silppuri ei.']
];
for(const [amount,text] of restoredSubtitles)assert.equal(synthetic(poor,'support',{amount}).tone.text,text);
assert.equal(synthetic(poor,'support',{amount:500}).description,synthetic(poor,'support',{amount:25000}).description,'goal changes do not replace the distribution story');
assert.ok(flatSummary.distribution.money.deciles.every(r=>r.mid===5),'compare percentages, not absolute euros');
const almostSpared=synthetic(poor.map((n,i)=>i>6?.001:n));
assert.equal(almostSpared.story.id,'lower','small is not zero');
assert.ok(!almostSpared.description.includes('katsomosta'));
assert.equal(synthetic([1,1,1,10,12,10,10,1,1,1]).story.id,'middle');
assert.equal(synthetic([1,1,1,2,2,2,2,10,12,15]).story.id,'upper');
const hiddenByAverages=synthetic([10,0,5,0,10,0,10,5,0,10]);
assert.notEqual(hiddenByAverages.story.id,'even','equal three-band means cannot hide unequal deciles');
assert.equal(hiddenByAverages.distribution.money.deciles.length,10);
const uncertainModel={...testModel,profiles:{low:[1,0,0,0,0,0,0,0,0,0],high:[0,0,0,0,0,0,0,0,0,1]},actions:{test:{kind:'proxy',profiles:['low','high'],amountBasis:'public-total'}}};
const d={id:'test',amount:10000,type:'tax',flow:'capital',title:'Testivero'};
assert.equal(ctx.packageSummary([d],ctx.calculateIncidence([d],uncertainModel),uncertainModel).story.id,'uncertain','scenario reversal cannot become a confident winner');
const unknown={id:'unknown',amount:50000,type:'cut',flow:'services',title:'Ei jakaumaa'};
const partialModel={...testModel,actions:{test:{kind:'sisu',percent:poor}}};
const partial=ctx.packageSummary([d,unknown],ctx.calculateIncidence([d,unknown],partialModel),partialModel);
assert.ok(!partial.story.text.includes('Arvioiduissa toimissa:'));
assert.equal(partial.distribution.missing.length,1);
assert.equal(ctx.packageSummary([unknown],ctx.calculateIncidence([unknown],testModel),testModel).story.id,'unknown');
// Service use allocation is independent of household income percentages.
const serviceModel={...testModel,profiles:{services:[.2,.2,.2,.1,.1,.1,.05,.02,.02,.01]},actions:{test:{kind:'sisu',percent:rich},service:{kind:'proxy',channel:'services',profiles:['services'],amountBasis:'public-total'}}};
const service={id:'service',flow:'services',type:'cut',amount:5000,title:'Palveluleikkaus'};
const split=ctx.packageSummary([d,service],ctx.calculateIncidence([d,service],serviceModel),serviceModel);
assert.equal(split.story.id,'cash-upper-services-lower');
assert.ok(split.distribution.money.deciles[0].mid===0,'service loss is not added to cash');
assert.ok(Math.abs(split.distribution.services.deciles.reduce((sum,r)=>sum+r.mid,0)-100)<1e-9);
const differentIncome={...serviceModel,income:Array(10).fill(999999)};
const serviceOnly=ctx.packageSummary([service],ctx.calculateIncidence([service],serviceModel),serviceModel);
const changedIncome=ctx.packageSummary([service],ctx.calculateIncidence([service],differentIncome),differentIncome);
assert.deepEqual(Array.from(serviceOnly.distribution.services.deciles,r=>r.mid),Array.from(changedIncome.distribution.services.deciles,r=>r.mid));
const doubleModel={...serviceModel,actions:{...serviceModel.actions,test:{kind:'sisu',percent:poor}}};
assert.equal(ctx.packageSummary([d,service],ctx.calculateIncidence([d,service],doubleModel),doubleModel).story.id,'double-lower');
const reversedModel={...serviceModel,profiles:{services:[0,0,0,0,0,0,0,.2,.3,.5]},actions:doubleModel.actions};
assert.equal(ctx.packageSummary([d,service],ctx.calculateIncidence([d,service],reversedModel),reversedModel).story.id,'cash-lower-services-upper');
const workModel={...testModel,actions:{test:{kind:'sisu',channel:'work',percent:flat}}};
const workAction={...d,flow:'employees'};
const work=ctx.packageSummary([workAction],ctx.calculateIncidence([workAction],workModel),workModel);
assert.equal(work.story.id,'even-work');assert.equal(work.distribution.money.state,'none');
// Every profile has a distinct reading for lower, middle and upper burdens.
const patterns=[[10,10,10,2,2,2,2,1,1,1],[1,1,1,10,10,10,10,1,1,1],[1,1,1,2,2,2,2,10,10,10]];
for(const flow of ['services','support','employees','earned','consumption','capital','companies','abroad']){
  const stories=patterns.map(p=>synthetic(p,flow,{report:'tax',type:'tax'}));
  assert.equal(new Set(stories.map(s=>s.description)).size,3,flow+': distribution changes the text');
  assert.ok(stories.every(s=>s.description&&!s.description.includes('undefined')));
}
run('syncScenario()');
for(const id of ['vat','benefits','income','corporate','health','cut-7-52','dividends']){
  const chosen=ctx.data.filter(d=>d.id===id),s=ctx.packageSummary(chosen);
  console.log(id+': '+s.story.id+' / '+s.story.text);
}
assert.equal(ctx.packageSummary(ctx.data.filter(d=>d.id==='vat')).distribution.money.state,'lower');
assert.equal(ctx.packageSummary(ctx.data.filter(d=>d.id==='benefits')).distribution.money.state,'lower');
assert.equal(ctx.packageSummary(ctx.data.filter(d=>d.id==='corporate')).story.id,'uncertain-companies');
assert.equal(ctx.packageSummary(ctx.data.filter(d=>d.id==='health')).distribution.money.state,'none');
assert.equal(ctx.packageSummary(ctx.data.filter(d=>['health','vat','income'].includes(d.id))).story.id,'cash-uncertain-services-lower','uncertain cash must not hide a clear service burden');
for(const later of [false,true]){
  ctx.includeLater=later;run('syncScenario()');
  for(const action of ctx.data){
    const s=ctx.packageSummary([action]);
    assert.ok(s.tone.text&&s.story.text&&s.description,action.id);
    assert.ok(!/NaN|undefined|Infinity/.test(s.tone.text+s.story.text+s.description+s.largest),action.id);
    for(const channel of ['money','services','work'])assert.ok(s.distribution[channel].deciles.every(r=>Number.isFinite(r.mid)),action.id);
  }
}
ctx.scenario.income=4;run('syncScenario()');
assert.equal(ctx.packageSummary(ctx.data.filter(d=>d.id==='income')).story.id,'unknown','unsupported tax extrapolation has no decile story');
console.log('PASS: flat 5%, poor 15%/rich 0%, rich-only, all ten deciles, relative income, zero vs small, scenario reversals, missing coverage, cash/service splits, work costs and all 254 actions at both horizons.');
