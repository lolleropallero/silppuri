const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name),'utf8'));
const {actions,meta}=read('catalogue.json'),inputs=read('finnwatch-estimates.json');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const w=inputs.withholding;
// Independently reproduce the fiscal perimeter from the source tables, before
// averaging. Do not combine a minimum from one year with a maximum from another.
const original=w.years.map((_,i)=>w.listedExPublic[i]+w.unlistedExPublic[i]+w.foreign[i]);
assert.deepEqual(original,[103,115,112,154,79]);
const upper=original.map((n,i)=>n-w.listedPensions[i]-w.unlistedPensions[i]-w.socialSecurity[i]);
const lower=upper.map((n,i)=>n-w.listedNonprofitsAndUniversities[i]-w.unlistedNonprofitsAndUniversities[i]);
assert.deepEqual(upper,w.expectedAnnualUpper);assert.deepEqual(lower,w.expectedAnnualLower);
const mean=v=>v.reduce((a,b)=>a+b,0)/v.length;
close(mean(lower),51.4);close(mean(upper),79.8);
assert.deepEqual([mean(lower),mean(upper)].map(n=>Math.round(n/10)*10),w.displayRange);
const wrapper=inputs.wrappers;
close(wrapper.assetsMillion*wrapper.assumedReturn[0]*wrapper.capitalTaxRate,429.3);
close(wrapper.assetsMillion*wrapper.assumedReturn[1]*wrapper.capitalTaxRate,715.5);
const results=read('finnwatch-results.json');
assert.deepEqual(results.interest.range,[25,65]);
assert.deepEqual(results.succession.range,[25,105]);
assert.deepEqual(results.wrappers.range,[20,440]);
assert.equal(results.wrappers.cashFlowOnly,true,'tax acceleration must not become a perpetual yield');
assert.ok(results.wrappers.byYear['2035'].range[0]<0,'later tax losses must remain visible');
assert.ok(results.succession.range[1]<inputs.succession.wholeReliefTaxExpenditureMillion);
const originalIds=['fw-wrappers','fw-dividend-withholding','fw-interest','tax-succession'];
const proposals=actions.filter(d=>originalIds.includes(d.id));
assert.equal(proposals.length,4);assert.equal(meta.finnwatchRows,14);
assert.equal(actions.filter(d=>d.id==='tax-succession').length,1);
for(const d of proposals){
 assert.equal(d.type,'tax');assert.ok(d.estimate.calculation.length>=3);
 assert.ok(d.research.sources.length>=2&&d.research.fiscal&&d.research.scope);
 assert.ok(!d.net,'own scenarios must not be presented as VM net forecasts');
 assert.ok(!d.conflicts.some(id=>originalIds.includes(id)),'the original proposals address distinct provisions');
}
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const ctx=vm.createContext({data:structuredClone(actions),selected:new Set(),scenario:{income:2,corporate:3,dividends:'vm'},units:{},conditions:{yle:'keep-tax',farm:'save'},year:2031,includeLater:false});
vm.runInContext('const baseData=new Map(data.map(d=>[d.id,{...d}]));',ctx);
vm.runInContext(app.slice(app.indexOf('  function syncScenario(){'),app.indexOf('  const esc=')),ctx);
vm.runInContext(app.slice(app.indexOf('  function searchWords('),app.indexOf('  function compareAmounts(')),ctx);
const actual=vm.runInContext("syncScenario();data.filter(d=>matchesSearch(d,searchWords('Finnwatch'))).map(d=>({id:d.id,amount:d.amount,year:d.year}))",ctx);
assert.equal(actual.length,14,'all proposals are found in the ordinary search');
assert.equal(vm.runInContext("data.filter(d=>d.id==='tax-succession'&&matchesSearch(d,searchWords('sukupolvenvaihdoshuojennus'))).length",ctx),1);
assert.equal(actual.find(d=>d.id==='fw-dividend-withholding').amount,50);
assert.equal(actual.filter(d=>d.amount===null).length,2);
assert.equal(actual.filter(d=>originalIds.includes(d.id)).reduce((sum,d)=>sum+(d.amount??0),0),100);
for(const [id,key] of [['fw-interest','interest'],['tax-succession','succession']]){
 assert.equal(actual.find(d=>d.id===id).amount,results[key].range[0]);
 assert.deepEqual(actions.find(d=>d.id===id).estimate.range,results[key].range);
}
assert.ok(actual.every(d=>!d.year.includes('VM:n netto')));
ctx.includeLater=true;
ctx.originalIds=originalIds;
assert.equal(vm.runInContext('syncScenario();data.filter(d=>originalIds.includes(d.id)).reduce((sum,d)=>sum+(d.amount??0),0)',ctx),100);
const incidence=read('incidence-model.json');
for(const d of proposals){
 assert.equal(incidence.actions[d.id].kind,'scenarios');
 assert.ok(incidence.actions[d.id].method.length>100);
 assert.ok(incidence.actions[d.id].calculation.length>=4);
}
const template=fs.readFileSync(path.join(root,'src/silppuri.template.html'),'utf8');
assert.ok(!template.includes('sp-loopholes')&&!template.includes('sp-loophole-list'));
console.log('PASS: 4 selectable proposals; lower bounds total 100m; wrapper cash timing excluded; historical sector calculation reproduced; own scenarios labelled separately; wrapper later-year losses preserved; household incidence assumptions disclosed.');
