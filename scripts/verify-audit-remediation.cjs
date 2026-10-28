// Regression checks for the reviewed interpretation, not proof of economic forecasts.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const {actions,meta}=read('data/catalogue.json'),model=read('data/incidence-model.json');
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8').replace(/\r\n/g,'\n');
const ctx=vm.createContext({data:structuredClone(actions),selected:new Set(),year:2031,includeLater:false,
  scenario:{income:1,corporate:1,dividends:'vm'},conditions:{yle:'keep-tax',farm:'save'},units:{},model});
vm.runInContext('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});',ctx);
vm.runInContext(app.slice(app.indexOf('  function syncScenario(){'),app.indexOf('  const esc=')),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'src/incidence.js'),'utf8'),ctx);
const refresh=()=>{ctx.syncScenario();return Object.fromEntries(ctx.data.map(d=>[d.id,d]));};
const close=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${label}: ${a} != ${b}`);
const plain=x=>JSON.parse(JSON.stringify(x));
let data=refresh();
// VM44 pp.667–668 and annex7-30: gross payroll is not public-sector net.
for(const id of ['cut-7-41','cut-7-42','cut-7-44','cut-7-46','cut-7-48','cut-7-49','cut-7-52']){
 const d=data[id],pay=id==='cut-7-52';
 close(d.amount,d.gross*(pay?.497:.24),id+' lower');
 close(d.netUpper,d.gross*.497,id+' upper');
 assert.ok(d.spendingNet.explanation.includes('Oma'));
}
for(const id of ['cut-5-40','cut-5-42','tax-car-combustion']){
 assert.ok(!data[id],id+' net below threshold');assert.ok(meta.excludedBelow20mNet.includes(id));
}
// Invalid or cash-flow-only anchors cannot silently enter permanent savings.
for(const id of ['fw-corporate-minimum','tax-peat','fw-wrappers'])assert.equal(data[id].amount,null,id);
assert.equal(data.dividends.amount,370);
assert.equal(model.actions['fw-corporate-minimum'].group,'unpriced');
const wrappers=read('data/finnwatch-results.json').wrappers;
assert.deepEqual(wrappers.range,[20,440]);
assert.ok(wrappers.annualEquivalent3pct[0]<0&&wrappers.annualEquivalent3pct[1]<45,'net PV includes persistent administration costs');
wrappers.annualEquivalent3pct.forEach((v,i)=>close(v,wrappers.presentValue3pct[i]*.03,'annual equivalent'));
// Independently reproduced gross tax-difference PV at the start of 2028,
// using finnwatch-estimates.json's 32 cases through 2200, discounted at 3%.
// Move it to end 2027 and subtract costs without reusing wrapper_path.
const auditedPV=[69.23956655924894,1470.4850925079002];
const annuity=(1-1.03**(-173))/.03;
close(wrappers.presentValue3pct[0],auditedPV[0]/1.03-5*annuity,'independent net PV lower');
close(wrappers.presentValue3pct[1],auditedPV[1]/1.03-2*annuity,'independent net PV upper');
// Large selected changes remain choices but no longer produce unsupported nets.
ctx.scenario.income=4;ctx.scenario.corporate=10;ctx.units['tax-vat-reduced']=20;
data=refresh();assert.equal(data.income.amount,null);assert.equal(data.corporate.amount,null);
assert.equal(ctx.units['tax-vat-reduced'],3);
let incidence=vm.runInContext('calculateIncidence(data.filter(d=>["income","corporate"].includes(d.id)),model)',ctx);
assert.equal(incidence.entries.length,0);assert.equal(incidence.missing.length,2);
ctx.scenario.income=1;ctx.scenario.corporate=1;ctx.units['tax-vat-reduced']=1;data=refresh();
close(data.income.amount,900,'restore income');close(data.corporate.amount,259.5,'restore corporate');
// Related VAT reforms are selectable; economic interactions are retained.
for(const [a,b] of [['tax-food18','tax-vat-services'],['tax-vat-standard','vat']]){
 assert.ok(!(data[a].conflicts||[]).includes(b));assert.ok(!(data[b].conflicts||[]).includes(a));
 assert.ok(data[a].possibleOverlaps.some(o=>o.id===b));
}
const base=Object.fromEntries(Object.values(data).map(d=>[d.id,d.amount]));
ctx.includeLater=true;data=refresh();
assert.equal(data['cut-2-51'].amount,110);assert.equal(data['cut-7-20'].amount,100);
for(const d of Object.values(data).filter(d=>d.horizonEstimate?.longRun)){
 assert.equal(d.amount,base[d.id],d.id+' far-future money stays separate');assert.ok(!d.laterApplied);
}
assert.deepEqual(plain(data.health.budget.slice(4)),[3310,3310,3310,3310]);
assert.match(data.health.continuationNote,/oma/i);
ctx.includeLater=false;data=refresh();
assert.deepEqual(Object.fromEntries(Object.values(data).map(d=>[d.id,d.amount])),base);
// Targeted benefits must not use a distribution of all recipients.
for(const id of ['cut-3-14','cut-2-61'])assert.deepEqual(model.actions[id].profiles,['wages','taxable-income']);
for(const [id,share] of [['cut-3-63',.4],['cut-3-64',.9]]){
 assert.equal(model.actions[id].householdShare,share);
 ctx.testId=id;incidence=vm.runInContext('calculateIncidence(data.filter(d=>d.id===testId),model)',ctx);
 close(incidence.entries[0].mid.reduce((n,v,i)=>n+v*model.consumptionUnits[i]/1e6,0),data[id].amount*share,id+' employer excluded');
}
for(const id of ['cut-3-54','cut-3-56'])assert.deepEqual(model.actions[id].profiles,['disability']);
assert.equal(model.actions['cut-1-76'].kind,'separate');
assert.deepEqual(model.actions['cut-1-38'].profiles,['consumption-transit']);
// Independently integrate the source cumulative distribution at target household ranks.
// This checks all 25 converted profiles, including the five-/ten-bin distinction.
function cdf(t,totals,counts){
 const all=counts.reduce((a,b)=>a+b,0);let start=0,sum=0;
 for(let j=0;j<counts.length;j++){
  const width=counts[j]/all;
  sum+=totals[j]*Math.min(1,Math.max(0,(t-start)/width));start+=width;
 }
 return sum/totals.reduce((a,b)=>a+b,0);
}
for(const [key,{totals,households}] of Object.entries(model.regroupingInputs)){
 let rank=0,previous=0;const count=model.households.reduce((a,b)=>a+b,0);
 for(let i=0;i<10;i++){
  rank+=model.households[i]/count;const current=cdf(rank,totals,households);
  close(model.profiles[key][i],current-previous,key+' decile'+i);previous=current;
 }
 close(previous,1,key+' conservation');
}
// Check the food and domestic-transit inputs against the actual published table.
function cell(table,keys){
 let n=0;table.id.forEach((id,i)=>{n=n*table.size[i]+(keys[id]===undefined?0:table.dimension[id].category.index[keys[id]]);});
 return table.value[n];
}
const consumption=read('data/sources/consumption-2022.json'),households=read('data/sources/consumption-households-2022.json');
for(let i=1;i<=5;i++){
 const q={tuloviidennes_2_20140501:String(i)},count=cell(households,{...q,contentscode:'pklkm_sum'});
 const units=count*cell(households,{...q,contentscode:'oecdmod_mean'});
 close(model.regroupingInputs['consumption-food'].totals[i-1],cell(consumption,{...q,coicop_46_20231201:'01'})*units,'food source');
 close(model.regroupingInputs['consumption-transit'].totals[i-1],['0731','0732'].reduce((n,c)=>n+cell(consumption,{...q,coicop_46_20231201:c}),0)*units,'transit excludes flights');
}
const research=read('data/action-research.json');
for(const id of ['cut-4-9','cut-4-11'])assert.ok(!research[id].sources.includes('carefees'));
assert.ok(research.corporate.sources.includes('corporate-wages-meta'));
assert.ok(research['fw-digital'].sources.includes('google-dst'));
// Production coverage must be complete without local audit reports.
assert.equal(actions.length,254);
assert.deepEqual(Object.keys(research).sort(),actions.map(d=>d.id).sort());
assert.deepEqual(Object.keys(model.actions).sort(),actions.map(d=>d.id).sort());
console.log('PASS: payroll netting, withdrawn fiscal anchors, scale limits, compatible VAT choices, horizon separation, employer shares, target groups, source-based decile conversion and complete catalogue coverage.');
