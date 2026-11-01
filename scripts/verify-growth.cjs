const fs=require('node:fs'),assert=require('node:assert/strict');
const {ctx,evaluate,run}=require('./summary-runtime.cjs');
const html=fs.readFileSync('dist/index.html','utf8');
const model=JSON.parse(html.match(/const growthModel=(\{[^\n]+\});/)[1]);
run(fs.readFileSync('src/growth.js','utf8'));
// A known household euro input must not change when only fiscal net savings do.
const synthetic={id:'fixture',gross:1000,amount:500,report:'cut'};
const fixtureSettings={moneyYear:2025,consumptionUnits:[1],incidence:{entries:[{id:'fixture',spec:{},channel:'cash',low:[1e9],mid:[1e9],high:[1e9]}]}};
const first=ctx.calculateGrowth([synthetic],model,fixtureSettings).metrics.consumption.points[5].absolute;
const second=ctx.calculateGrowth([{...synthetic,amount:9999}],model,fixtureSettings).metrics.consumption.points[5].absolute;
assert.ok(Math.abs(first+1000)<5,'a lowest-income loss of one billion cuts consumption by about one billion within five years');
assert.equal(first,second,'fiscal savings are not multiplied into consumption');
const settingsFor=chosen=>({incidence:ctx.calculateIncidence(chosen,ctx.incidenceModel),consumptionUnits:ctx.incidenceModel.consumptionUnits,moneyYear:2031});
function calculate(ids,settings={},growthModel=model){
 const {chosen}=evaluate(Array.isArray(ids)?{selectedIds:ids,taxIncreasesPP:{income:2,corporate:3}}:ids);
 return ctx.calculateGrowth(chosen,growthModel,{...settingsFor(chosen),...settings});
}
for(const metric of Object.values(calculate([]).metrics))assert.equal(metric.points.length,0,'empty selection is not a zero-effect estimate');
for(const metric of Object.values(calculate(['tax-rd']).metrics))assert.equal(metric.points.length,0,'missing money must not become zero');
const household=calculate(['income']);
assert.ok(household.metrics.consumption.points[5].value<0,'income loss reduces modelled consumption');
assert.ok(household.metrics.employment.points[5].value<0,'demand channel reduces modelled hours');
assert.ok(household.metrics.productivity.points[1].value===0,'investment flow enters capital next year');
assert.ok(household.metrics.productivity.points[3].value<0);
// VM's labour-supply estimates have no timing, so they stay off the curve as long-run figures.
const positive=calculate(['cut-3-15']);
assert.equal(positive.longRun.entries[0].unit,'fte');
assert.equal(positive.longRun.entries[0].intervalType,'point');
assert.match(positive.longRun.entries[0].limit,/epävarmuutta poikkeuksellisen suurena/,'source caveats travel with the estimate');
assert.equal(positive.longRun.totals.fte.value,positive.longRun.entries[0].value);
assert.ok(positive.metrics.gdp.contributors[0].points.every(point=>!('labour' in point.parts)),'the GDP curve has no labour-supply part');
assert.ok(calculate(['cut-3-12']).longRun.entries[0].value<0,'benefit cuts can reduce structural labour supply');
assert.equal(calculate(['cut-3-49']).longRun.entries.length,0,'late retirement-age evidence is not backdated');
const earnedRow=pp=>calculate({selectedIds:['income'],taxIncreasesPP:{income:pp}}).longRun.entries.find(e=>e.action.id==='income');
const earned=earnedRow(1);
assert.ok(earned.low<earned.value&&earned.value<earned.high&&earned.high<0,'earned-income tax weakens labour supply in every VM case');
assert.ok(earned.value/earned.action.gross<-5.5&&earned.value/earned.action.gross>-7.5,'about seven persons per static million, as derived from VM 2026:48');
assert.ok(Math.abs(earnedRow(2).value/earned.value-2)<1e-9,'the derived effect scales with the static yield');
assert.equal(calculate(['vat']).longRun.entries.length,0,'VAT has no modelled incentive channel');
// The yearly path is derived from the study's impulse responses, not read off the two
// cumulative multipliers: the same multipliers fit different paths.
const groups=model.fiscalMultipliers.groups,responses=model.fiscalMultipliers.impulseResponses.responses;
const geometric=Array.from({length:20},(_,h)=>.8**h),flatGdp=Array.from({length:20},()=>.1);
const closed=ctx.growthStepPath({gdp:flatGdp,fiscal:geometric},5);
for(let k=1;k<=5;k++)assert.ok(Math.abs(closed.annual[k-1]-.1*(1+.2*(4*k-2.5)))<1e-9,'a fading fiscal shock held at one: closed form');
assert.ok(Math.abs(closed.fiveYear-2/((1-.8**20)/.2))<1e-9,'cumulative multiplier: summed GDP over summed fiscal change');
const steady=Array.from({length:20},()=>.05),late=Array.from({length:20},(_,h)=>h<8?.05:h<18?0:.3);
const fading=Array.from({length:20},(_,h)=>.5**h),same=[steady,late].map(gdp=>ctx.growthStepPath({gdp,fiscal:fading},5));
assert.ok(Math.abs(same[0].twoYear-same[1].twoYear)<1e-12&&Math.abs(same[0].fiveYear-same[1].fiveYear)<1e-12,'two responses with the same multipliers');
assert.ok(Math.abs(same[0].annual[4]-same[1].annual[4])>.05,'responses, not two multipliers, fix the yearly path');
for(const [key,response] of Object.entries(responses)){
 const path=ctx.growthStepPath(response,5);
 assert.ok(Math.abs(path.twoYear-response.reported[0])<.25&&Math.abs(path.fiveYear-response.reported[1])<.25,key+': digitised responses reproduce the study\'s full-sample multipliers');
}
// Later or gradual entry runs through the same responses: a delayed step is the step path
// shifted, and a phase-in is the sum of its delayed steps.
const delayed=d=>Array.from({length:20},(_,t)=>t>=d?1:0);
const third=ctx.growthPolicyPath({gdp:flatGdp,fiscal:geometric},delayed(2));
for(let k=1;k<=5;k++){
 const shifted=[0,1,2,3].map(i=>4*(k-1)+i).reduce((n,t)=>n+(t>=2?.1*(1+.2*(t-2)):0),0)/4;
 assert.ok(Math.abs(third[k-1]-shifted)<1e-9,'a measure from the third quarter: the step path shifted');
}
const pace=[.25,.5,.75,1,1],paced=ctx.growthPolicyPath(responses.wages,pace.flatMap(v=>Array(4).fill(v)));
const entries=pace.map((v,k)=>[v-(pace[k-1]??0),ctx.growthPolicyPath(responses.wages,delayed(4*k))]);
for(let k=0;k<5;k++)assert.ok(Math.abs(paced[k]-entries.reduce((n,[w,path])=>n+w*path[k],0))<1e-9,'a phase-in is the sum of its delayed steps');
const level=(row,t)=>-row.points[t].parts.demand/row.input.calibrated.revenue;
const gdpRow=(ids,pp)=>calculate(pp?{selectedIds:ids,taxIncreasesPP:pp}:ids).metrics.gdp.contributors[0];
const sign=group=>group.kind==='tax'?-1:1;
// The curve is the base model as estimated, GDP lost per annual euro; the band scales its path to
// one side of the five-year range across specifications and may follow VM's yearly pace.
const expected=(group,t,side,phased)=>{
 const path=ctx.growthStepPath(responses[group.irf],5),scale=side?group.fiveYear[side]/(sign(group)*path.fiveYear):1;
 return sign(group)*scale*(phased||path).annual[t-1];
};
for(const [id,group,pp] of [['tax-vat-standard',groups.consumption],['corporate',groups.corporate,{corporate:1}],['income',groups.household,{income:1}],['health',groups.services],['cut-4-27',groups.efficiency],
 ['cut-1-32',groups.investment],['cut-3-51',groups.pensions],['cut-7-41',groups.services],['cut-7-52',groups.wageLevel],['cut-6-5',groups.total]]){
 const row=gdpRow([id],pp);
 for(let t=1;t<=5;t++)assert.ok(Math.abs(level(row,t)-expected(group,t))<1e-9,id+' follows the base model in year '+t);
}
// VM's yearly estimates enter the same calculation as a quarterly path from 2028.
// Each year's amount is in 2025 money from its own year, so the path does not move with the
// year used for the level.
const vmAmounts=row=>row.input.calibrated.phased.pace.map(v=>v*row.input.calibrated.revenue),vmGdp=row=>row.input.calibrated.phased.annual.map(v=>v*row.input.calibrated.revenue);
const inPrices=(series,i)=>series[i]/1.02**(2028+i-2025);
const efficiency=gdpRow(['cut-4-27']);
assert.ok(vmAmounts(efficiency).every((v,i)=>Math.abs(v-inPrices(efficiency.action.budget,i))<1e-9),'cut-4-27: VM\'s yearly cuts in 2025 money');
assert.ok(ctx.growthPolicyPath(responses.intermediate,efficiency.input.calibrated.phased.pace.flatMap(v=>Array(4).fill(v))).every((v,i)=>Math.abs(v-efficiency.input.calibrated.phased.annual[i])<1e-12));
assert.ok(efficiency.action.budget[0]===0&&Math.abs(efficiency.input.calibrated.phased.annual[0])<1e-12,'a measure not in force in 2028 has no first-year effect on that path');
for(const id of ['cut-3-50','cut-3-51','cut-4-27']){
 const now=gdpRow([id]),later=calculate({selectedIds:[id],includeLater:true}).metrics.gdp.contributors[0];
 assert.ok(later.action.laterApplied&&later.action.horizonEstimate.year>2031,id+' has a later level');
 assert.ok(vmAmounts(now).every((v,i)=>Math.abs(v-inPrices(now.input.calibrated.multiplier.base==='funds'?now.action.funds:now.action.budget,i))<1e-9),id+': yearly amounts from the card');
 assert.ok(vmAmounts(later).every((v,i)=>Math.abs(v-vmAmounts(now)[i])<1e-9)&&vmGdp(later).every((v,i)=>Math.abs(v-vmGdp(now)[i])<1e-9),id+': the VM path and its GDP response do not move with the later level');
}
assert.ok(Math.abs(vmAmounts(gdpRow(['cut-3-51']))[0]-635.430999/1.02**3)<1e-6,'the 2028 pension saving is deflated from 2028, not from 2031');
for(const id of [...groups.consumption.actions,...groups.household.actions,...groups.corporate.actions]){
 const row=gdpRow([id],{income:1,corporate:1});
 if(row?.input.calibrated)assert.equal(row.input.calibrated.phased,null,id+': a tax card holds a 2028 level, not a yearly path');
}
for(const [id,group,pp] of [['tax-vat-standard',groups.consumption],['corporate',groups.corporate,{corporate:1}],['income',groups.household,{income:1}],['cut-4-27',groups.efficiency],['cut-1-32',groups.investment],['cut-3-51',groups.pensions]]){
 const result=calculate(pp?{selectedIds:[id],taxIncreasesPP:pp}:[id]),input=result.metrics.gdp.contributors[0].input,scale=input.calibrated.revenue/model.baseline.gdpMillion*100;
 for(const t of [1,2,5]){
  const levels=[expected(group,t),...['low','high'].flatMap(side=>[null,input.calibrated.phased].map(phased=>expected(group,t,side,phased)))];
  const point=result.metrics.gdp.points[t];
  assert.ok(Math.abs(point.low+Math.max(...levels)*scale)<1e-9&&Math.abs(point.high+Math.min(...levels)*scale)<1e-9,id+' band covers the specification range and both entry paths in year '+t);
 }
}
// Table 13 summarises all specifications, the base model among them.
for(const [key,group] of Object.entries(groups)){
 const [two,five]=responses[group.irf].reported.map(v=>sign(group)*v);
 assert.ok(group.twoYear.low<=two&&two<=group.twoYear.high&&group.fiveYear.low<=five&&five<=group.fiveYear.high,key+': the base model lies inside the specification range');
 assert.ok(group.twoYear.low<=group.twoYear.value&&group.twoYear.value<=group.twoYear.high&&group.fiveYear.low<=group.fiveYear.value&&group.fiveYear.value<=group.fiveYear.high,key+': medians lie inside the range');
 assert.equal(!!group.assumption,key==='wageLevel',key+': only the wage-level mapping is a Silppuri assumption');
}
assert.deepEqual([groups.household.twoYear.value,groups.household.fiveYear.value],[.1,-.2],'household income taxes show the study\'s Table 13 medians');
for(const id of ['cut-3-50','cut-3-51']){
 const pension=gdpRow([id]);
 assert.ok(Math.abs(pension.input.calibrated.revenue*1.02**6-pension.action.fundAmount)<1e-6,id+': earnings-related pension cuts use the pension spending removed, whatever the sign of the budget line');
}
// National and guarantee pension cards are budget nets of pension, other benefit and tax changes.
for(const id of model.fiscalMultipliers.kelaPensions.actions)assert.equal(Object.values(groups).some(g=>g.actions.includes(id)),false,id+' gets no pension multiplier');
for(const id of ['cut-3-32','cut-3-34']){const row=gdpRow([id]);assert.ok(!row.input.calibrated&&row.input.income,id+' works through net household income');}
const pay=gdpRow(['cut-7-52']);
assert.ok(Math.abs(pay.input.calibrated.revenue*1.02**6-pay.action.gross)<1e-6,'pay cuts use the gross labour cost, not the net saving');
for(const id of ['fw-interest','fw-corporate-gaps','tax-commercial-diesel','tax-entrepreneur-remove','cut-7-48'])assert.equal(calculate([id]).metrics.gdp.points.length,0,id+' gets no estimate instead of a borrowed multiplier');
assert.equal(gdpRow(['cut-3-40']).input.calibrated,null,'pensioners\' housing allowance is a social benefit in the study, not a pension');
assert.equal(gdpRow(['benefits']).input.calibrated,null,'benefits with an unstable multiplier sign keep the channel model');
assert.ok(calculate(['benefits']).metrics.gdp.points.slice(1).every(point=>point.value<0),'a benefit freeze lowers output within five years');
const freeze=calculate(['benefits']).metrics.consumption.contributors[0];
assert.ok(Math.abs(freeze.input.income[1].reduce((n,v)=>n+v,0)*1.02**6-freeze.action.amount)<1e-6,'index freezes follow the card saving, not the scaled SISU figure');
// Income-group propensities are an assumption from average spending shares, so the band also
// covers a propensity that is the same for every income group.
const flatModel={...model,consumptionProfile:{...model.consumptionProfile,quintiles:model.consumptionProfile.quintiles.map(()=>model.consumptionProfile.average)}};
for(const id of ['benefits','cut-3-12']){
 const profiled=calculate([id]).metrics.gdp.points,flat=calculate([id],{},flatModel).metrics.gdp.points;
 assert.ok(flat.some((point,t)=>Math.abs(point.value-profiled[t].value)>1e-9),id+': the profile matters');
 assert.ok(flat.every((point,t)=>profiled[t].low-1e-9<=point.value&&point.value<=profiled[t].high+1e-9),id+': a flat propensity stays inside the band');
}
for(const preset of run('packagePresets')){
 const result=calculate(preset.model);
 for(const [unit,total] of Object.entries(result.longRun.totals))for(const key of ['low','value','high'])
  assert.ok(Math.abs(total[key]-result.longRun.entries.filter(e=>e.unit===unit).reduce((n,e)=>n+e[key],0))<1e-9,'long-run totals add up');
 for(const [id,metric]of Object.entries(result.metrics)){
  if(!metric.points.length)continue;
  assert.equal(metric.points.length,6,'scenario ends at year five');
  assert.equal(Math.abs(metric.points[0].value),0);
  for(const point of metric.points){
   assert.ok([point.value,point.low,point.high,point.absolute].every(Number.isFinite),preset.id+': '+id);
   assert.ok(point.low<=point.value&&point.value<=point.high);
   const sum=metric.contributors.reduce((n,c)=>n+c.points[point.year].value,0);
   assert.ok(Math.abs(sum-point.value)<1e-10,'drilldown reconciles with the curve');
   for(const c of metric.contributors){
    const parts=c.points[point.year].parts;if(!parts)continue;
    assert.ok(Math.abs(Object.values(parts).reduce((n,v)=>n+v,0)-c.points[point.year].absolute)<1e-6,'mechanism parts reconcile with the action');
   }
  }
 }
}
const tertiary=calculate(['education']).metrics.productivity.contributors.find(c=>c.action.id==='education');
assert.equal(tertiary.points[0].education,0);
assert.ok(tertiary.points[5].education<tertiary.points[4].education&&tertiary.points[4].education<0,'tertiary skills start to accumulate within five years');
assert.ok(Math.abs(tertiary.points[5].capital+tertiary.points[5].education-tertiary.points[5].value)<1e-10);
assert.ok(calculate(['cut-2-22']).metrics.productivity.contributors[0].points.every(point=>point.education===0),'school spending reaches the workforce only after five years');
console.log('PASS growth: missing evidence, base-model paths, specification ranges, VM entry pace, named assumptions, spending bases, long-run labour figures, 9 presets and reconciled contributions');
