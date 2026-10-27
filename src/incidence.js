// Pure calculation: household income effects are independent of the fiscal pie's net revenue.
function calculateIncidence(chosen, model){
  const entries=[],missing=[];
  for(const d of chosen){
    if(d.incidenceHorizonGap){missing.push(d);continue;}
    const rawSpec=model.actions[d.id];
    const spec=rawSpec?.methodKey?{...model.methods[rawSpec.methodKey],...rawSpec}:rawSpec;
    if(!spec||spec.kind==='separate'){missing.push(d);continue;}
    let scenarios=[],derived=spec.kind!=='sisu'||!!spec.indexScale;
    if((spec.kind==='sisu'||spec.amountBasis==='public-total') && !Number.isFinite(d.amount)){
      missing.push(d);continue;
    }
    if(spec.kind==='sisu'){
      const total=d.amount;
      const ratio=d.id==='income-index'?1:spec.referenceTotal?Math.max(0,total/spec.referenceTotal):1;
      const scale=ratio*(spec.indexScale||1);
      derived=derived||Math.abs(ratio-1)>.01;
      scenarios=[spec.percent.map((p,i)=>p/100*model.income[i]*scale)];
    }else if(spec.kind==='scenarios'){
      // Shares deliberately need not sum to one: foreign/institutional burdens
      // stay outside Finnish household income, and personal-tax offsets remain.
      scenarios=spec.scenarios.map(s=>model.income.map((_,i)=>
        s.million*1e6*Object.entries(s.shares).reduce((n,[profile,share])=>n+model.profiles[profile][i]*share,0)/model.consumptionUnits[i]));
    }else{
      const amount=spec.amountBasis==='fixed'?spec.fixedMillion:spec.amountBasis==='public-total'?d.amount:d.gross;
      if(!Number.isFinite(amount)){missing.push(d);continue;}
      const weights=spec.corporate?[model.profiles.wages.map(p=>p*.25),model.profiles.wages.map((p,i)=>p*.25+model.profiles['capital-income'][i]*.75)]:spec.profiles.map(key=>model.profiles[key]);
      scenarios=weights.map(p=>p.map((share,i)=>amount*1e6*share/model.consumptionUnits[i]));
    }
    const low=Array.from({length:10},(_,i)=>Math.min(...scenarios.map(s=>s[i])));
    const high=Array.from({length:10},(_,i)=>Math.max(...scenarios.map(s=>s[i])));
    const mid=low.map((v,i)=>spec.kind==='scenarios'?scenarios.reduce((n,s)=>n+s[i],0)/scenarios.length:(v+high[i])/2);
    entries.push({id:d.id,action:d,spec,low,high,mid,scenarios,derived,channel:spec.channel||'cash'});
  }
  const channels={};
  for(const channel of ['cash','indirect','services','work']){
    const part=entries.filter(e=>e.channel===channel);
    channels[channel]=model.income.map((income,i)=>{
    const sum=field=>part.reduce((n,e)=>n+e[field][i],0);
    return {index:i,low:sum('low'),high:sum('high'),mid:sum('mid'),percentLow:sum('low')/income*100,percentHigh:sum('high')/income*100,
      cut:part.filter(e=>e.action.type==='cut').reduce((n,e)=>n+e.mid[i],0),tax:part.filter(e=>e.action.type==='tax').reduce((n,e)=>n+e.mid[i],0)};
    });
  }
  // Only comparable household money effects enter the combined chart. Keep
  // service budgets and employers' labour costs out of household purchasing power.
  const householdRows=channels.cash.map((cash,i)=>{
    const indirect=channels.indirect[i],low=cash.low+indirect.low,high=cash.high+indirect.high;
    return {...cash,low,high,mid:cash.mid+indirect.mid,indirect:indirect.mid,
      percentLow:low/model.income[i]*100,percentHigh:high/model.income[i]*100};
  });
  // Service bars allocate the funding cut itself, never divide it by household
  // income. Average whole profile scenarios so displayed shares still sum to 100%.
  const serviceEntries=entries.filter(e=>e.channel==='services').map(e=>{
    const allocation=model.income.map((_,i)=>{
      const values=e.scenarios.map(s=>s[i]*model.consumptionUnits[i]/1e6);
      return {low:Math.min(...values),high:Math.max(...values),mid:values.reduce((n,v)=>n+v,0)/values.length};
    });
    return {...e,allocation};
  });
  const serviceTotal=serviceEntries.reduce((sum,e)=>sum+e.allocation.reduce((n,r)=>n+r.mid,0),0);
  const serviceRows=model.income.map((_,i)=>{
    const sum=key=>serviceEntries.reduce((n,e)=>n+e.allocation[i][key],0);
    const low=sum('low'),high=sum('high'),mid=sum('mid');
    return {index:i,low,high,mid,share:serviceTotal?mid/serviceTotal*100:0,
      shareLow:serviceTotal?low/serviceTotal*100:0,shareHigh:serviceTotal?high/serviceTotal*100:0};
  });
  return {rows:channels.cash,householdRows,serviceEntries,serviceRows,serviceTotal,channels,entries,missing};
}
