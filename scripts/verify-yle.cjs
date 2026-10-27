const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const actions=JSON.parse(fs.readFileSync(path.join(root,'data/catalogue.json'),'utf8')).actions;
const source=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const raw=JSON.parse(fs.readFileSync(path.join(root,'data/vm-spending-source.json'),'utf8'));
assert.equal(actions.filter(d=>d.conditional==='yle').length,1);
assert.ok(!actions.some(d=>d.id==='cut-1-43'));
const coverage=JSON.parse(fs.readFileSync(path.join(root,'data/coverage.json'),'utf8'));
assert.equal(coverage.find(r=>r.key==='1-43').mergedInto,'cut-1-42');
const ctx=vm.createContext({data:structuredClone(actions),selected:new Set(),scenario:{income:2,corporate:3,dividends:'vm'},units:{},conditions:{yle:'keep-tax',farm:'redirect'},year:2031,includeLater:false,
 maxPP:20,payerGroups:[],filter:'all',category:'all',search:'',sortOrder:'desc',activeFlow:null,limit:12,catalogueOrder:[],catalogueOrderKey:'',q:()=>({value:''}),moneyLabel:n=>String(n),esc:String,dividendStudyUrl:'https://www.sttinfo.fi/files/66784256/70136599/79254/fi'});
const run=s=>vm.runInContext(s,ctx);
run('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});');
run(source.slice(source.indexOf('  function syncScenario(){'),source.indexOf('  const esc=')));
run(source.slice(source.indexOf('  function capFor'),source.indexOf('  function effectFor')));
run(source.slice(source.indexOf('  function stateIn'),source.indexOf('  function slice')));
const get=()=>ctx.data.find(d=>d.id==='cut-1-42');
for(let percent=5;percent<=100;percent+=5){
 ctx.scenario.ylePercent=percent;
 for(let year=2028;year<=2035;year++){
  ctx.year=year;ctx.includeLater=false;ctx.conditions.yle='keep-tax';run('syncScenario()');
  const official=percent===10?raw.find(r=>r.key==='1-43'):percent===20?raw.find(r=>r.key==='1-42'):null;
  const expected=official?official.budget[year-2028]:Math.round(593.7*percent/100*(year-2027)/8*10)/10;
  assert.equal(get().amount,expected);assert.equal(get().gross,expected);
  assert.equal(get().scaled,!official);assert.ok(get().title.includes('−'+percent+' %'));
  run('syncScenario()');assert.equal(get().amount,expected,'no compounded scaling');
  ctx.conditions.yle='reduce-tax';run('syncScenario()');assert.equal(get().amount,0);assert.equal(get().gross,expected);
 }
 ctx.year=2031;ctx.conditions.yle='keep-tax';ctx.includeLater=true;run('syncScenario()');
 const final=get().budget[7];assert.equal(get().amount,final);assert.equal(get().horizonEstimate.year,2035);
 ctx.conditions.yle='reduce-tax';run('syncScenario()');assert.equal(get().amount,0);assert.equal(get().laterApplied,false);
}
ctx.stateIn({modelContent:{selectedIds:['vat','cut-1-43'],fundingChoices:{yle:'keep-tax'}}});
assert.equal(ctx.scenario.ylePercent,10);assert.ok(ctx.selected.has('cut-1-42'));assert.ok(!ctx.selected.has('cut-1-43'));assert.equal(ctx.selected.size,2);assert.equal(get().amount,29.7);
ctx.stateIn({modelContent:{selectedIds:['cut-1-42'],fundingChoices:{yle:'keep-tax'}}});
assert.equal(ctx.scenario.ylePercent,20);assert.equal(get().amount,59.4);
ctx.stateIn({modelContent:{selectedIds:['cut-1-42','cut-1-43'],fundingChoices:{yle:'keep-tax'}}});
assert.equal(ctx.selected.size,1);assert.equal(ctx.scenario.ylePercent,10,'last legacy choice wins');
ctx.stateIn({modelContent:{selectedIds:['cut-1-43','cut-1-42'],fundingChoices:{yle:'keep-tax'}}});
assert.equal(ctx.scenario.ylePercent,20);
for(const [input,expected] of [[-20,5],[0,5],[18,20],[105,100],[null,20]]){
 ctx.stateIn({modelContent:{yleCutPercent:input}});assert.equal(ctx.scenario.ylePercent,expected);
}
ctx.stateIn({modelContent:{selectedIds:['cut-1-42'],yleCutPercent:75,includeLater:true,fundingChoices:{yle:'keep-tax'}}});
ctx.window={openai:{setWidgetState:s=>{ctx.snapshot=structuredClone(s);return Promise.resolve();}}};
run('save()');assert.equal(ctx.snapshot.modelContent.yleCutPercent,75);
ctx.scenario.ylePercent=20;ctx.stateIn(ctx.snapshot);assert.equal(ctx.scenario.ylePercent,75);assert.equal(get().amount,445.3);
for(const p of [5,100]){
 ctx.scenario.ylePercent=p;run('syncScenario()');
 const html=run("controlsMarkup('cut-1-42','modal')");
 assert.match(html,/data-yle-step="-5"/);assert.match(html,/data-yle-step="5"/);
 assert.match(html,new RegExp(`id="sp-modal-yle-${p===5?'minus':'plus'}"[^>]*disabled`));
 assert.match(html,/data-condition="yle"/,'tax funding controls coexist with amount controls');
}
const official=get().fundingCut.vmVariants;
assert.deepEqual(Array.from(official[10]),raw.find(r=>r.key==='1-43').budget);
assert.deepEqual(Array.from(official[20]),raw.find(r=>r.key==='1-42').budget);
console.log('PASS: one Yle card; all 20 cut levels and eight years; original VM estimates retained; tax choices and 2035 horizon; no repeated scaling; legacy 10/20 selections and saved slider value migrate correctly.');
