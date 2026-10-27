const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name),'utf8'));
const {actions,meta}=read('catalogue.json'),additional=read('additional-tax-actions.json'),results=read('additional-tax-results.json');
const model=read('incidence-model.json'),refs=read('research-sources.json');
const get=id=>actions.find(d=>d.id===id),close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);
assert.equal(additional.length,12);assert.equal(meta.finnwatchRows,14);assert.equal(meta.sorsaRows,2);
const expected={
 'fw-corporate-gaps':[40,305],'fw-corporate-minimum':[195,805],
 'fw-wealth-minimum':[270,380],'fw-exit-tax':[0,50],
 'fw-property-funds':[1,44],'fw-treaty-dividends':[50,160],
 'fw-portfolio':[25,240],'fw-deemed-cost':[5,140],
 'fw-succession-abolish':[150,205],'fw-digital':[10,30],
 'sorsa-bank':[135,180],'sorsa-million-inheritance':[95,170]
};
// Independently reproduce key domestic source bridges and existing-tax losses.
close(results['fw-treaty-dividends'].raw[0],(1730+1300+1500+1650+480)/5*.15*.5*.6-8);
close(results['sorsa-bank'].raw[1],(1400*.05*(1-.21)+(900/.20)*.03)*.95-1);
close(results['fw-deemed-cost'].raw[0],5247.637367*.15*.34*((1.15)**.3-1)-4);
close(results['fw-corporate-minimum'].raw[0],(3500-1700)*5/6*.2*.7-15);
for(const [id,range] of Object.entries(expected)){
 const d=get(id),r=results[id];assert.deepEqual(r.range,range,id);assert.deepEqual(d.estimate.range,range,id);
 assert.equal(d.estimate.amount,range[0]);assert.ok(range[1]>=20);
 assert.ok(d.estimate.display.includes('–')&&d.estimate.footnote&&d.estimate.calculation.length>=4,id);
 assert.ok(r.raw[0]>=range[0]&&r.raw[1]<=range[1]);
 assert.ok(d.research.sources.every(k=>refs[k]));
 assert.ok(!d.net,'an own sensitivity interval must not become a VM net estimate');
 assert.ok(model.actions[id]);
}
// Full removal replaces only the nested partial removal. Independent tax rates
// remain selectable and expose the unresolved interaction.
assert.deepEqual(get('fw-succession-abolish').conflicts,['tax-succession']);
assert.deepEqual(get('fw-corporate-gaps').conflicts,['fw-interest']);
assert.ok(!get('sorsa-bank').conflicts.includes('corporate'));
assert.ok(get('sorsa-bank').possibleOverlaps.some(o=>o.id==='corporate'));
const coverage=read('finnwatch-proposal-coverage.json').recommendations;
const source=fs.readFileSync(path.join(root,'data/sources/finnwatch-veropohjan-aukot-2024.txt'),'utf8').split('LIITE 1: Vero-').at(-1);
const sourceNumbers=[...source.matchAll(/^(\d+)\.\s{2,}/gm)].map(m=>Number(m[1]));
assert.deepEqual(coverage.map(r=>r.number),sourceNumbers,'track every numbered recommendation, including resourcing #43');
assert.equal(coverage.length,43);assert.ok(coverage.every(r=>r.reason&&(!r.action||get(r.action))));
for(const n of [22,26])assert.equal(coverage.find(r=>r.number===n).action,null,'already decided law is not new revenue');
const ctx=vm.createContext({model,actions:additional.map(d=>get(d.id))});
vm.runInContext(fs.readFileSync(path.join(root,'src/incidence.js'),'utf8'),ctx);
const r=vm.runInContext('calculateIncidence(actions,model)',ctx);
assert.equal(r.entries.length,10);assert.deepEqual(Array.from(r.missing,d=>d.id).sort(),['fw-exit-tax','fw-treaty-dividends']);
for(const e of r.entries){
 assert.ok(e.spec.partial);assert.ok(e.spec.calculation.length>=4);
 for(const s of e.spec.scenarios){assert.ok(Object.keys(s.shares).every(k=>model.profiles[k]));assert.ok(Object.values(s.shares).reduce((a,b)=>a+b,0)<=1+1e-9);}
 const total=e.mid.reduce((s,v,i)=>s+v*model.consumptionUnits[i]/1e6,0);
 const totals=e.spec.scenarios.map(c=>c.million*Object.values(c.shares).reduce((a,b)=>a+b,0));
 close(total,totals.reduce((a,b)=>a+b,0)/totals.length);
 assert.ok(e.mid.every((v,i)=>Number.isFinite(v)&&v>=e.low[i]-1e-8&&v<=e.high[i]+1e-8));
}
assert.equal(model.actions['sorsa-bank'].channel,'indirect');assert.equal(model.actions['sorsa-million-inheritance'].channel,'cash');
const fragment=fs.readFileSync('C:/Users/aleks/.codex/visualizations/2026/10/26/01a17813-fc63-7ab3-a7a1-468c076b25bd/silppuri-konsepti.html','utf8');
assert.ok(Buffer.byteLength(fragment)<1000000);
// Compact reference pointers must resolve to the same complete visible notes.
const app=fragment.slice(fragment.indexOf('  const researchSources='),fragment.indexOf('  const evidence='));
const c=vm.createContext({});vm.runInContext(app+';globalThis.notes=sourceNotes;',c);
assert.ok(Object.values(c.notes).every(s=>s.summary&&s.limit));
console.log('PASS: 12 new intervals, domestic fiscal anchors, 43 recommendations, 10 household scenarios, foreign taxpayers excluded, overlap semantics, complete compact source notes.');
