// Partial-equilibrium scenario, not an estimated macro forecast. Fiscal savings
// never enter as GDP. Missing channels remain explicitly uncovered.
const growthMetricIds=['consumption','employment','investment','productivity','gdp'];
// The study's median quarterly responses of GDP (y) and of the shocked fiscal variable (f)
// to one shock. A measure sets the fiscal variable on a quarterly path, one being the full
// measure; the study's shocks mostly fade, so holding that path takes a sequence of shocks.
// This returns the GDP response to that sequence by year.
function growthPolicyPath(response,target){
  const {gdp:y,fiscal:f}=response,shocks=[],output=[];
  for(let t=0;t<target.length;t++){
    let held=0,sum=0;
    for(let j=1;j<=t;j++)held+=f[j]*shocks[t-j];
    shocks.push((target[t]-held)/f[0]);
    for(let j=0;j<=t;j++)sum+=y[j]*shocks[t-j];
    output.push(sum);
  }
  return Array.from({length:target.length/4},(_,i)=>output.slice(4*i,4*i+4).reduce((a,b)=>a+b,0)/4);
}
// The measure in full from the first quarter, and the cumulative multipliers of the same responses.
function growthStepPath(response,years){
  const {gdp:y,fiscal:f}=response,cumulative=n=>y.slice(0,4*n).reduce((a,b)=>a+b,0)/f.slice(0,4*n).reduce((a,b)=>a+b,0);
  return {annual:growthPolicyPath(response,Array(4*years).fill(1)),twoYear:cumulative(2),fiveYear:cumulative(years)};
}
function calculateGrowth(chosen,model,settings={}){
  const baseline=model.baseline,p=model.parameters;
  const selectedIds=new Set(chosen.map(d=>d.id)),overlaps=[];
  for(const d of chosen)for(const o of d.possibleOverlaps||[]){
    if(!selectedIds.has(o.id))continue;
    const key=[d.id,o.id].sort().join(':');
    if(!overlaps.some(o=>o.key===key))overlaps.push({key,ids:[d.id,o.id],note:o.note});
  }
  const incidence=settings.incidence,multipliers=model.fiscalMultipliers;
  const unestimated=Object.values(multipliers.unestimated).flatMap(u=>u.actions),horizon=multipliers.horizon;
  // Calibrated actions follow the study's base model as estimated: its responses to the measure
  // in full from the first quarter.
  const responses=multipliers.impulseResponses.responses;
  const steps=Object.fromEntries(Object.entries(responses).map(([key,response])=>[key,growthStepPath(response,horizon)]));
  const inputs=chosen.map(action=>{
    const spec=model.actions[action.id],entry=incidence?.entries.find(e=>e.id===action.id);
    const moneyYear=action.historical?2024:action.report==='tax'?2028:action.laterApplied?Number(action.horizonEstimate?.year):settings.moneyYear||2031;
    const deflator=Number.isFinite(moneyYear)?(1+p.inflation.value)**(moneyYear-baseline.referenceYear):null;
    // SISU percentages are converted using the incidence model's 2024 incomes, while euro
    // allocations, including index freezes totalled to the card's saving, inherit the card's year.
    const cashDeflator=entry?.spec.kind==='sisu'&&!entry.spec.indexFigure?(1+p.inflation.value)**((settings.incomeYear||2024)-baseline.referenceYear):deflator;
    // Base broadening and working-time changes have no estimate; a missing channel is not zero.
    const open=!unestimated.includes(action.id);
    // Household losses stay by income decile, because the consumption response differs by income.
    const income=open&&entry&&['cash','indirect'].includes(entry.channel)&&cashDeflator?['low','mid','high'].map(key=>entry[key].map((n,i)=>n*settings.consumptionUnits[i]/1e6/cashDeflator)):null;
    const publicDemand=open&&spec?.publicDemand&&Number.isFinite(action.gross)&&deflator?action.gross/deflator:null;
    const research=open&&Number.isFinite(spec?.researchShare)&&Number.isFinite(action.gross)&&deflator?action.gross*spec.researchShare/deflator:null;
    const education=open&&spec?.educationGroup&&Number.isFinite(action.gross)&&deflator?action.gross/deflator:null;
    // A joint simulation is needed for overlapping labour-supply estimates.
    const structural=action.id!=='cut-3-49'&&!overlaps.some(o=>o.ids.includes(action.id))&&!action.scaled?
      spec?.effects?.employment?.estimates?.find(e=>e.scope==='national-structural'&&['persons','fte'].includes(e.unit)):null;
    // VM's net yield for earned-income tax leaves a labour-supply loss once the lost
    // consumption taxes are removed; it scales with the static yield, so scaled cards count.
    const earned=model.earnedIncomeIncentive,earnedDeflator=(1+p.inflation.value)**((earned?.moneyYear??0)-baseline.referenceYear);
    const taxIncentive=earned?.actions.includes(action.id)&&Number.isFinite(action.gross)?Object.fromEntries(Object.entries(earned.netShare).map(([key,net])=>
      [key,-action.gross/earnedDeflator*1e6*(1-net-earned.mpc*earned.consumptionTaxRate)/earned.costPerPerson])):null;
    // Taxes and cuts in the Finnish multiplier study's groups follow its GDP response per
    // annual revenue or spending euro. Each group names its base: a tax's static yield, a cut's
    // gross spending or labour cost, or for earnings-related pensions the pension funds' saving,
    // which is the pension spending removed; the state's budget line there is lost tax.
    const group=Object.values(multipliers.groups).find(g=>g.actions.includes(action.id));
    const base=!group?null:group.base==='funds'?action.fundAmount:group.base==='grossAndFunds'?(action.gross??0)+(action.fundAmount??0):action.gross;
    // A cut card holds VM's yearly estimates from 2028; a tax card holds a 2028 level, not a path.
    // The band also brings a cut into force on VM's path, with year one as 2028 and each year's
    // amount in 2025 money, so the path does not depend on the year used for the level.
    const series=group?.base==='funds'?action.funds:group?.base==='grossAndFunds'?action.budget?.map((b,i)=>(b??0)+(action.funds?.[i]??0)):action.budget;
    const years=action.report==='cut'&&base&&deflator?series?.slice(0,horizon):null;
    const pace=years?.length===horizon&&years.every(Number.isFinite)?years.map((v,i)=>v/(1+p.inflation.value)**(2028+i-baseline.referenceYear)/(base/deflator)):null;
    const phased=group&&pace?{pace,staged:years.some(v=>Math.abs(v-base)>1e-6),annual:growthPolicyPath(responses[group.irf],pace.flatMap(v=>Array(4).fill(v)))}:null;
    const calibrated=group&&Number.isFinite(base)&&deflator?{multiplier:group,revenue:base/deflator,phased}:null;
    return {action,spec,income,publicDemand,research,education,structural,taxIncentive,calibrated,incidenceEntry:entry};
  });
  // VM's labour-supply estimates have no timing, and a calibrated multiplier already contains
  // five years of labour responses, so they stay off the curve as long-run figures.
  const longRunEntries=inputs.flatMap(({action,structural,taxIncentive})=>[
    structural&&{action,kind:'structural',unit:structural.unit,low:structural.low,value:structural.value??structural.low,high:structural.high,
      intervalType:structural.intervalType,limit:structural.limit,sourceIds:structural.sourceIds,page:structural.page},
    taxIncentive&&{action,kind:'tax',unit:'persons',...taxIncentive,intervalType:'derived',limit:model.earnedIncomeIncentive.limit,sourceIds:model.earnedIncomeIncentive.sourceIds,page:model.earnedIncomeIncentive.page}
  ].filter(Boolean));
  const longRun={entries:longRunEntries,totals:Object.fromEntries(['persons','fte'].filter(unit=>longRunEntries.some(e=>e.unit===unit)).map(unit=>
    [unit,Object.fromEntries(['low','value','high'].map(key=>[key,longRunEntries.filter(e=>e.unit===unit).reduce((n,e)=>n+e[key],0)]))]))};
  const metrics=Object.fromEntries(growthMetricIds.map(id=>[id,{id,entries:[],missing:[],points:[],contributors:[]} ]));
  for(const input of inputs)for(const id of growthMetricIds){
    const effect=input.spec?.effects?.[id];
    if(effect)metrics[id].entries.push({action:input.action,...effect,sourceIds:effect.sourceIds||input.action.research?.sources||[]});
    else metrics[id].missing.push(input.action);
  }
  const covered=input=>({consumption:!!input.income,employment:!!input.income||input.publicDemand!==null,
    investment:!!input.income||input.publicDemand!==null||input.research!==null,
    productivity:!!input.income||input.publicDemand!==null||input.research!==null||input.education!==null,
    gdp:!!input.income||input.publicDemand!==null||input.research!==null||input.education!==null||!!input.calibrated});
  const run=(input,variant)=>{
    const coefficient=(key,group=0)=>p[key][variant?variant[group]?'high':'low':'value'];
    const ramp=(t,years)=>1-Math.exp(-Math.log(10)*t/years);
    const rows=Object.fromEntries(growthMetricIds.map(id=>[id,[]]));
    const mpc=coefficient('mpc'),domestic=coefficient('domesticShare'),labour=coefficient('labourElasticity');
    const recovery=coefficient('recoveryYears',1);
    const investmentResponse=coefficient('investmentResponse',2),rd=coefficient('researchAdditionality',2);
    // Permanent income changes move consumption by the average propensity, scaled by each
    // income quintile's spending share relative to all households and capped at one. The
    // spending shares are averages, not estimated marginal responses, so a flat profile is tested too.
    const profile=model.consumptionProfile,flat=variant?.[4],deciles=input.income?.[variant?(variant[0]?2:0):1];
    const spent=deciles?deciles.reduce((sum,n,i)=>sum+n*Math.min(1,mpc*(flat?1:profile.quintiles[Math.floor(i/2)]/profile.average)),0):0;
    const volume=input.spec?.profile==='efficiency'?coefficient('efficiencyVolume'):coefficient('publicVolume');
    let stock=0,skills=0;
    for(let t=0;t<=model.maxYear;t++){
      const consumption=-spent*ramp(t,p.consumptionYears.value);
      const fade=Math.exp(-Math.max(0,t-1)/recovery);
      const demand=(consumption-(input.publicDemand??0)*volume*ramp(t,p.consumptionYears.value))*domestic*fade;
      const work=demand/baseline.gdpMillion*labour*baseline.hoursMillion*1e6;
      const demandInvestment=demand/baseline.gdpMillion*investmentResponse*baseline.investmentMillion;
      const researchInvestment=-(input.research??0)*rd*ramp(t,p.researchYears.value),investment=demandInvestment+researchInvestment;
      // Capital accumulates after each year's investment; a flow is not a stock.
      const capital=100*coefficient('capitalShare',2)*stock/baseline.capitalMillion;
      if(input.education!==null){
        const tertiary=input.spec.educationGroup==='tertiary';
        const educationBase=model.education[tertiary?'tertiaryMillion':'schoolMillion']*(1+p.inflation.value)**(baseline.referenceYear-model.education.referenceYear);
        const exposure=Math.min(1,Math.max(0,t-(tertiary?p.tertiaryLag.value:p.schoolLag.value))/(tertiary?4:12));
        const outcome=tertiary?coefficient('degreeElasticity',3)*p.tertiaryCohortShare.value*coefficient('degreePremium',3):coefficient('schoolEarningsElasticity',3);
        skills-=100*input.education/educationBase*outcome*coefficient('educationTransfer',3)*exposure/p.workingYears.value;
      }
      const productivity=capital+skills;
      // GDP adds the fading first-round demand (incl. firms' R&D spending, whose resources
      // move elsewhere over time) to capital deepening and skills. Induced investment and
      // the lasting R&D loss enter through capital. A calibrated action replaces its demand
      // and capital parts with the base model's path, as GDP lost per annual euro: a tax rise lifts
      // revenue and a cut lowers spending. The band scales that path to the lowest and highest
      // five-year multiplier across the study's specifications, assuming the same response shape,
      // and also follows VM's yearly pace.
      const multiplier=input.calibrated?.multiplier,sign=multiplier?.kind==='tax'?-1:1;
      const scale=variant&&multiplier?multiplier.fiveYear[variant[0]?'high':'low']/(sign*steps[multiplier.irf].fiveYear):1;
      const path=multiplier&&(variant&&!variant[1]&&input.calibrated.phased?.annual||steps[multiplier.irf].annual);
      const level=t===0||!multiplier?0:sign*scale*path[t-1];
      const demandOutput=input.calibrated?-level*input.calibrated.revenue:demand+researchInvestment*fade;
      const capitalOutput=input.calibrated?0:capital/100*baseline.gdpMillion,skillsOutput=skills/100*baseline.gdpMillion;
      const gdp=demandOutput+capitalOutput+skillsOutput;
      // Parts split the absolute effect by mechanism so each action can show why it moves.
      rows.consumption.push({year:t,value:consumption/baseline.consumptionMillion*100,absolute:consumption,parts:{demand:consumption}});
      rows.employment.push({year:t,value:work/(baseline.hoursMillion*1e6)*100,absolute:work/p.fteHours.value,parts:{demand:work/p.fteHours.value}});
      rows.investment.push({year:t,value:investment/baseline.investmentMillion*100,absolute:investment,parts:{demand:demandInvestment,research:researchInvestment}});
      rows.productivity.push({year:t,value:productivity,absolute:productivity,capital,education:skills});
      rows.gdp.push({year:t,value:gdp/baseline.gdpMillion*100,absolute:gdp,parts:{demand:demandOutput,capital:capitalOutput,skills:skillsOutput}});
      stock=stock*(1-p.depreciation.value)+investment;
    }
    return rows;
  };
  // 32 chosen sensitivity combinations, not a statistical probability interval: demand
  // (incl. the study's specification range), timing (incl. VM's yearly pace), investment,
  // skills and the income profile.
  const variants=Array.from({length:32},(_,n)=>[0,1,2,3,4].map(bit=>!!(n&(1<<bit))));
  const totals=Array.from({length:variants.length+1},()=>Object.fromEntries(growthMetricIds.map(id=>[id,Array.from({length:model.maxYear+1},()=>({value:0,absolute:0}))])));
  for(const input of inputs){
    const central=run(input,null),has=covered(input);
    for(const id of growthMetricIds)if(has[id])metrics[id].contributors.push({action:input.action,points:central[id],input});
    for(const [index,variant] of [null,...variants].entries()){
      const result=index===0?central:run(input,variant);
      for(const id of growthMetricIds)if(has[id])result[id].forEach((point,t)=>{
        totals[index][id][t].value+=point.value;totals[index][id][t].absolute+=point.absolute;
      });
    }
  }
  for(const id of growthMetricIds){
    const metric=metrics[id];
    metric.uncovered=chosen.filter(d=>!metric.contributors.some(c=>c.action.id===d.id));
    if(metric.contributors.length)metric.points=totals[0][id].map((point,t)=>({year:t,...point,
      low:Math.min(...totals.map(s=>s[id][t].value)),high:Math.max(...totals.map(s=>s[id][t].value)),
      absoluteLow:Math.min(...totals.map(s=>s[id][t].absolute)),absoluteHigh:Math.max(...totals.map(s=>s[id][t].absolute))}));
  }
  return {metrics,selectedCount:chosen.length,overlaps,longRun,settings};
}
