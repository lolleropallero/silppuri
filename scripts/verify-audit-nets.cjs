// Source-based regression for Claude audit F02/F03. These constants are from
// VM 2026:48 pp.105 (fn.106), 149 (fn.133), 153 and annex pp.264,266–267.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name),'utf8'));
const {actions}=read('catalogue.json');
const source=fs.readFileSync(path.join(root,'src/app.js'),'utf8').replace(/\r\n/g,'\n');
const ctx=vm.createContext({data:structuredClone(actions),selected:new Set(),year:2031,includeLater:false,
  scenario:{income:1,corporate:1,dividends:'vm'},conditions:{yle:'keep-tax',farm:'save'},units:{},
  moneyLabel:n=>String(n)+' milj. €'});
vm.runInContext(source.slice(source.indexOf('  const dividendStudyUrl='),source.indexOf('  const format=')),ctx);
vm.runInContext('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});',ctx);
vm.runInContext(source.slice(source.indexOf('  function syncScenario(){'),source.indexOf('  const conflictsFor=')),ctx);
vm.runInContext(source.slice(source.indexOf('  function effectFor(d){'),source.indexOf('  data.forEach(d=>{\n    const article=')),ctx);
const calculate=()=>vm.runInContext('syncScenario();Object.fromEntries(data.map(d=>[d.id,d]))',ctx);
const close=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-8,`${message}: ${actual} != ${expected}`);
const vatGross={vat:3870,'tax-vat-standard':694,'tax-vat-reduced':314,'tax-vat15':500,'tax-vat16':820,'tax-food18':1180,'tax-vat-services':800};
const indexOnly={vat:2950,'tax-vat-standard':570,'tax-vat-reduced':240,'tax-vat15':380,'tax-vat16':630,'tax-food18':920,'tax-vat-services':550};
let calculated=calculate();
for(const [id,gross] of Object.entries(vatGross)){
  const d=calculated[id];
  close(d.gross,gross,id+' gross unchanged');
  close(d.amount,gross*0.60,id+' lower bound includes indexes and purchasing power');
  close(d.netUpper,gross*0.70,id+' upper bound');
  assert.equal(d.net.indexAdjusted,indexOnly[id]);
  assert.equal(d.net.model,true);
  assert.ok(d.net.calculation.includes('toista kertaa'));
  assert.ok(d.net.source.includes('133')&&d.net.source.includes('153'));
  assert.ok(ctx.effectFor(d).money.includes('VM:n arvioista laskettu'));
  assert.ok(ctx.effectFor(d).money.includes('erillisestä kokonaistaloudellisesta simuloinnista'));
}
// The 20–35% applies to the original 430, not to the amount after dividend taxes.
close(calculated.corporate.amount,430*(1-0.35)-20,'corporate lower');
close(calculated.corporate.netUpper,430*(1-0.20)-10,'corporate upper');
assert.ok(ctx.effectFor(calculated.corporate).money.includes('työllisyysvaikutuksia ei ole laskettu'));
assert.ok(ctx.effectFor(calculated.corporate).money.includes('Tulonmuunnon'));
ctx.scenario.corporate=3;calculated=calculate();
close(calculated.corporate.amount,778.5,'default corporate +3');
close(calculated.corporate.netUpper,1002,'default corporate upper');
close(calculated.corporate.amount+calculated.vat.amount,3100.5,'combined pie contribution');
// Repeated renders cannot apply either deduction a second time.
close(calculate().corporate.amount,778.5,'repeat');
ctx.units['tax-vat-standard']=2;calculated=calculate();
close(calculated['tax-vat-standard'].netUpper,971.6,'scaled VAT upper');
ctx.units['tax-vat-standard']=0;ctx.scenario.corporate=0;calculated=calculate();
assert.equal(calculated['tax-vat-standard'].amount,0);
assert.equal(calculated.corporate.netUpper,0);
// Curation must now cover the additional tax cards as well (audit F20).
assert.deepEqual(Object.keys(read('action-research.json')).sort(),actions.map(d=>d.id).sort());
console.log('PASS: F02/F03 source formulas, runtime sums, explanatory scope, gross household bases, scaling and repeat renders; F20 research coverage.');
