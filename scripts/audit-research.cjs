const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name),'utf8'));
const {actions,meta}=read('catalogue.json');
const sources=read('research-sources.json');
const reviewed=actions.filter(d=>!d.cashOnly);
assert.equal(reviewed.length,259);
for(const d of reviewed){
  const r=d.research;
  assert.ok(r&&r.fiscal&&r.scope,d.id+': missing review');
  assert.ok(r.society||d.society,d.id+': missing everyday effect');
  assert.ok(r.sources.length||['vm-only','unspecified','limited'].includes(r.status),d.id+': unexplained evidence gap');
  for(const key of r.sources){
    assert.ok(sources[key]?.label&&sources[key]?.kind,key);
    assert.equal(new URL(sources[key].url).protocol,'https:');
  }
}
const get=id=>actions.find(d=>d.id===id);
// Comparison figures must not silently become a new fiscal estimate.
for(const id of ['tax-biomass','tax-household','tax-rd','tax-waste-energy','cut-4-31','cut-5-66']){
  assert.ok(get(id).budget.every(n=>n===null),id);
  assert.ok(!get(id).net,id);
}
assert.equal(get('tax-succession').estimate.model,'succession');
assert.ok(get('tax-succession').estimate.amount<240,'partial relief scenario must not become the whole tax expenditure');
assert.match(get('tax-biomass').research.fiscal,/112.*196/);
assert.match(get('tax-biomass').research.fiscal,/eri veropohjia/);
assert.match(get('cut-4-31').research.fiscal,/210–565.*kustannushaarukka/);
assert.match(get('cut-5-66').research.fiscal,/2040/);
assert.deepEqual(get('cut-3-18').research.sources,['privatecare','dental']);
// Reproduce the explicitly conditional insurance-tax comparison; it is not a net forecast.
const sensitivity=read('fiscal-sensitivities.json')['tax-insurance'];
const elasticities=sensitivity.premiumRevenuePriceModels.flatMap(m=>[-1,1].map(sign=>m.coefficient+sign*sensitivity.standardErrorMultiplier*m.standardError-1));
const proceeds=elasticities.map(e=>sensitivity.taxBaseMillion*(sensitivity.newRate*((1+sensitivity.newRate)/(1+sensitivity.baseRate))**e-sensitivity.baseRate));
assert.deepEqual([Math.round(Math.min(...proceeds)),Math.round(Math.max(...proceeds))],sensitivity.roundedRangeMillion);
assert.ok(!get('tax-insurance').net);
assert.equal(meta.research.contextOnly,reviewed.filter(d=>d.research.status==='context').length);
assert.equal(meta.research.vmOnly,1);
const fragment=fs.readFileSync('C:/Users/aleks/.codex/visualizations/2026/10/26/01a17813-fc63-7ab3-a7a1-468c076b25bd/silppuri-konsepti.html','utf8');
assert.ok(!fragment.includes('/*RESEARCH_SOURCES*/'));
assert.ok(!fragment.includes('/*CATALOGUE*/'));
for(const key of new Set(reviewed.flatMap(d=>d.research.sources)))assert.ok(fragment.includes(sources[key].label),key);
const audit={asOf:meta.research.asOf,...meta.research,actions:reviewed.map(d=>({id:d.id,title:d.title,status:d.research.status,sources:d.research.sources,unpriced:d.budget.every(n=>n===null)}))};
fs.writeFileSync(path.join(root,'data/research-coverage.json'),JSON.stringify(audit,null,2)+'\n');
console.log(`PASS: ${reviewed.length} action reviews; ${meta.research.sources} linked sources; ${meta.research.vmOnly} explicit evidence gaps. Comparison figures remain outside the pie.`);
