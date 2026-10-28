const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const actions=JSON.parse(read('data/catalogue.json')).actions,source=read('src/app.js');
const ctx=vm.createContext({data:structuredClone(actions),selected:new Set(),scenario:{income:2,corporate:3,dividends:'vm',cutPercents:{}},
  units:{},conditions:{yle:'keep-tax',farm:'save'},year:2031,includeLater:false,dividendStudyUrl:'https://example.test/study'});
const run=code=>vm.runInContext(code,ctx);
run('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});');
run(source.slice(source.indexOf('  function syncScenario(){'),source.indexOf('  const esc=')));
run(source.slice(source.indexOf('  const esc='),source.indexOf('  function sourceMarkup')));
run(source.slice(source.indexOf('  function fiscalCalculation'),source.indexOf('  function renderImpact')));
const groups={};
for(const later of [false,true]){
  ctx.includeLater=later;run('syncScenario()');
  for(const d of ctx.data){
    const c=ctx.fiscalCalculation(d);if(!later)(groups[c.kind]??=[]).push(d.id);
    assert.ok(c.lines.length&&c.lines.every(line=>typeof line==='string'&&line.length),d.id+': calculation or explanation');
    assert.ok(!/NaN|undefined|Infinity/.test(c.lines.join(' ')),d.id);
    if(!d.estimate&&Number.isFinite(d.amount))assert.ok(c.lines.join(' ').includes(d.amount.toLocaleString('fi-FI',{maximumFractionDigits:3})),d.id+': actual selected amount');
    if(c.kind==='unpriced')assert.ok(c.lines.join(' ').includes('ei lisätä'),d.id+': unknown is not a fabricated zero');
  }
}
const text=id=>ctx.fiscalCalculation(ctx.data.find(d=>d.id===id)).lines.join(' ');
ctx.includeLater=false;ctx.scenario.income=3;ctx.scenario.corporate=2;
ctx.scenario.cutPercents={'cut-1-25':55,'cut-7-52':5};ctx.units['tax-vehicle']=2;run('syncScenario()');
assert.match(text('income'),/1\s500 × 60 % = 900/);assert.match(text('income'),/900 × 3 = 2\s700/);
assert.match(text('corporate'),/259,5 × 2 = 519/);
assert.match(text('tax-vehicle'),/306 − 76 = 230/);assert.match(text('tax-vehicle'),/230 × 2 = 460/);
assert.match(text('cut-1-25'),/× 55 \/ 30/);
assert.match(text('cut-7-52'),/× 5 \/ 1/);assert.match(text('cut-7-52'),/× 0,497/);
ctx.scenario.income=4;run('syncScenario()');assert.equal(ctx.fiscalCalculation(ctx.data.find(d=>d.id==='income')).kind,'unpriced');
for(const yle of ['keep-tax','reduce-tax'])for(const farm of ['save','redirect']){
  ctx.conditions={yle,farm};run('syncScenario()');
  assert.match(text('cut-1-42'),yle==='keep-tax'?/jää julkiselle taloudelle/:/alennus kumoaa/);
  assert.match(text('cut-1-72'),farm==='save'?/jää julkiselle taloudelle/:/jaetaan uudelleen/);
}
ctx.selected.add('tax-land-values');run('syncScenario()');assert.match(text('tax-land-min'),/100 × 1 = 100/);
ctx.scenario.dividends='abolish';run('syncScenario()');assert.match(text('dividends'),/Labore.*459/);
const results=JSON.parse(read('data/additional-tax-results.json'));
let boundCount=0;
for(const d of actions.filter(d=>d.estimate?.bounds)){
  const e=d.estimate,r=results[d.id];assert.equal(e.bounds.length,2);boundCount++;
  e.bounds.forEach((row,index)=>{
    assert.equal(row.value,r.raw[index],d.id+': the displayed bound comes from the model');
    const expression=row.expression.replace(/ /g,'').replace(/,/g,'.').replace(/×/g,'*').replace(/−/g,'-').replace(/\[/g,'(').replace(/\]/g,')').replace(/\^/g,'**');
    assert.ok(/^[\d.+*/()\-]+$/.test(expression));
    assert.ok(Math.abs(vm.runInNewContext(expression)-row.value)<.001,d.id+': displayed arithmetic reproduces the bound');
  });
  assert.equal(Math.floor((e.bounds[0].value+1e-10)/e.roundTo)*e.roundTo,e.range[0]);
  assert.equal(Math.ceil((e.bounds[1].value-1e-10)/e.roundTo)*e.roundTo,e.range[1]);
  const markup=ctx.estimateBoundsMarkup(e);assert.ok(markup.includes('Piirakkaan')&&!markup.includes('undefined'));
}
assert.equal(boundCount,15,'all product and realizations scenarios expose their endpoint arithmetic');
const treaty=actions.find(d=>d.id==='fw-treaty-dividends');
assert.ok(treaty.estimate.calculation.some(line=>line.includes('(1 730 + 1 300 + 1 500 + 1 650 + 480) / 5 = 1 332')));
assert.ok(treaty.estimate.calculation.some(line=>line.includes('niitä ei ole mitattu')));
assert.deepEqual(treaty.estimate.bounds.map(b=>Math.round(b.value*1000)/1000),[51.94,158.838]);
const audit={cards:actions.length,groups:Object.fromEntries(Object.entries(groups).map(([kind,ids])=>[kind,{count:ids.length,ids}])),computedBounds:boundCount};
fs.mkdirSync(path.join(root,'tmp'),{recursive:true});fs.writeFileSync(path.join(root,'tmp/calculation-audit.json'),JSON.stringify(audit,null,2));
console.log('PASS: all '+actions.length+' cards, both horizons, adjusted taxes/cuts, funding options, missing estimates and '+boundCount+' reproduced endpoint calculations.');
console.log(Object.entries(groups).map(([kind,ids])=>kind+': '+ids.length).join(', '));
