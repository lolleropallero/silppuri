const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name),'utf8'));
const model=read('incidence-model.json'),actions=read('catalogue.json').actions.filter(a=>['fw-wrappers','fw-dividend-withholding','fw-interest','tax-succession'].includes(a.id));
const fiscal=read('finnwatch-results.json'),inputs=read('finnwatch-incidence.json');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const ctx=vm.createContext({model,actions});
vm.runInContext(fs.readFileSync(path.join(root,'src/incidence.js'),'utf8'),ctx);
const result=vm.runInContext('calculateIncidence(actions,model)',ctx);
assert.equal(result.entries.length,4);assert.equal(result.missing.length,0);
const money=e=>e.mid.reduce((n,v,i)=>n+v*model.consumptionUnits[i]/1e6,0);
for(const e of result.entries){
 const s=e.spec;
 assert.equal(s.kind,'scenarios');assert.ok(s.calculation.length>=4);
 assert.ok(s.sources.every(k=>model.sources[k]));
 for(const scenario of s.scenarios){
   assert.ok(scenario.million>=0);
   const fraction=Object.values(scenario.shares).reduce((n,v)=>n+v,0);
   assert.ok(fraction>=0&&fraction<=1+1e-9,'no foreign/institutional burden redistribution');
   assert.ok(Object.keys(scenario.shares).every(p=>model.profiles[p]));
 }
 const totals=s.scenarios.map(c=>c.million*Object.values(c.shares).reduce((n,v)=>n+v,0));
 close(money(e),totals.reduce((n,v)=>n+v,0)/totals.length);
 close(Math.min(...totals),s.householdMillion[0]);close(Math.max(...totals),s.householdMillion[1]);
 assert.ok(e.mid.every((n,i)=>Number.isFinite(n)&&n>=e.low[i]-1e-9&&n<=e.high[i]+1e-9));
 assert.ok(e.mid[9]/model.income[9]>e.mid[0]/model.income[0],'upper income group bears more relative to income');
 // Each selected card must add its own bars; changing the fiscal pie's lower
 // bound must not scale the household tax liability.
 ctx.single=[{...e.action,amount:99999,gross:99999}];
 const single=vm.runInContext('calculateIncidence(single,model)',ctx);
 single.entries[0].mid.forEach((n,i)=>close(n,e.mid[i]));
}
const spec=id=>model.actions[id];
const w=spec('fw-wrappers');
close(w.householdMillion[0],fiscal.wrappers.byYear['2031'].raw[0]+5);
close(w.householdMillion[1],fiscal.wrappers.byYear['2031'].raw[1]+2);
assert.equal(w.channel,'cash');assert.ok(w.note.includes('2031'));
const s=spec('tax-succession');
close(s.householdMillion[0],240*.2*.65);close(s.householdMillion[1],240*.5*.85);
close(s.householdMillion[0],fiscal.succession.raw[0]+3);
close(s.householdMillion[1],fiscal.succession.raw[1]+1);
const withholding=spec('fw-dividend-withholding');
close(withholding.householdMillion[0],10.8*(.208+.20*.84)*.7);
close(withholding.householdMillion[1],10.8*(.208+.20*.84));
assert.equal(withholding.partial,true);assert.equal(withholding.channel,'indirect');
assert.ok(withholding.householdMillion[1]<5,'do not assign 50–80m fiscal proceeds to households');
assert.equal(inputs.withholding.domesticFundTaxMillion.reduce((n,v)=>n+v,0)/5,10.8);
const interest=spec('fw-interest');
close(interest.householdMillion[0],0);close(interest.householdMillion[1],63);
assert.equal(interest.channel,'indirect');
assert.ok(interest.scenarios.some(s=>Object.values(s.shares).every(n=>n===0)),'wholly foreign/institutional case stays outside households');
// Verify asset profiles from raw StatFin data, ranked by income, not wealth.
const raw=read('sources/wealth-2023.json');
function cell(asset,decile,info){
 const keys={vtutk_varlaji_6_20200101:asset,desiilit_2_20120101:String(decile),timeperiod_y:'2023',contentscode:info};
 return raw.value[raw.id.reduce((offset,d,i)=>offset*raw.size[i]+raw.dimension[d].category.index[keys[d]],0)];
}
for(const [profile,asset] of Object.entries({'wealth-insurance':'vaksak','wealth-funds':'sirave','wealth-listed':'porsosa','wealth-unlisted':'muosa','wealth-financial':'finan'})){
 const values=Array.from({length:10},(_,i)=>cell(asset,i+1,'vtutk_keskiarvo_n')*cell(asset,i+1,'vtutk_kotitalouksia_perusjoukko'));
 const total=values.reduce((a,b)=>a+b,0);
 values.forEach((n,i)=>close(n/total,model.profiles[profile][i]));
}
const allMean=result.householdRows.reduce((n,v,i)=>n+v.mid*model.consumptionUnits[i]/1e6,0);
close(allMean,result.entries.reduce((n,e)=>n+money(e),0));
ctx.actions=[];assert.equal(vm.runInContext('calculateIncidence(actions,model).entries.length',ctx),0);
console.log('PASS: four household scenarios; real income-ranked asset profiles; coherent mean allocations; foreign owners and government administration excluded; partial fund coverage explicit; fiscal and household amounts independent.');
