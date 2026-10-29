// Editorial result labels, not an additional fiscal or income-incidence model.
const packageProfiles={
  services:{name:'Omahoidon apostoli',label:'Palveluleikkaukset'},
  benefits:{name:'Leipäjonokummi',label:'Etuusleikkaukset'},
  work:{name:'Muutosneuvottelija',label:'Julkisen alan työ'},
  income:{name:'Verokarhu',label:'Ansiotuloverotus'},
  consumption:{name:'Vyönkiristäjä',label:'Kulutusverotus'},
  wealth:{name:'Kansankomissaari',label:'Varallisuuden verotus'},
  companies:{name:'Näkymätön käsi',label:'Yritysten verot ja tuet'},
  indices:{name:'Indeksipakastaja',label:'Laajat indeksijäädytykset'},
  research:{name:'Tulevaisuuden panttaaja',label:'Tutkimusrahoitus'},
  grants:{name:'Tukiviidakon raivaaja',label:'Avustukset'},
  mixed:{name:'SILPPURI',label:'Yhdistelmä'}
};
function actionProfile(d){
  // A payer group alone cannot distinguish, for example, student benefits from
  // university funding, or pension taxes from pension cuts and care charges.
  if(['cut-6-5','cut-6-6','cut-6-7'].includes(d.id))return 'indices';
  if(['cut-1-5','cut-1-6','cut-1-7'].includes(d.id))return 'research';
  if(['cut-7-24','cut-7-12','cut-7-16'].includes(d.id))return 'grants';
  if(d.id==='tax-pension'||d.id==='tax-household')return 'income';
  if(d.id==='cut-1-75')return 'companies';
  if(d.flow==='students')return d.type==='tax'||['cut-2-32','cut-2-34','cut-2-35','cut-2-38','cut-2-39','cut-2-42'].includes(d.id)?'services':'benefits';
  if(d.flow==='families'||d.flow==='pension')return d.type==='tax'?'services':'benefits';
  if(d.flow==='consumption')return d.report==='tax'?'consumption':['cut-3-18','cut-3-21','cut-3-22','cut-3-23'].includes(d.id)?'benefits':'services';
  return {services:'services',research:'services',nonprofits:'services',support:'benefits',employees:'work',earned:'income',capital:'wealth',investors:'wealth',companies:'companies'}[d.flow]||'mixed';
}
const shareIncomeBands={lower:[0,1,2],middle:[3,4,5,6],upper:[7,8,9]};
function shareBurden(entries,channel,model,serviceTotal=0){
  if(!entries.length)return {state:'none',channel,deciles:[],entries};
  // Same scenarios as the charts: money relative to income, service funding
  // shares, and employer costs separately. Never add these different units.
  const scenarios=entries.map(e=>e.scenarios.map(s=>s.map((n,i)=>channel==='services'?
    (serviceTotal?n*model.consumptionUnits[i]/1e6/serviceTotal*100:0):n/model.income[i]*100)));
  const deciles=Array.from({length:10},(_,i)=>({index:i,
    mid:scenarios.reduce((sum,ss)=>sum+ss.reduce((n,s)=>n+s[i],0)/ss.length,0),
    low:scenarios.reduce((sum,ss)=>sum+Math.min(...ss.map(s=>s[i])),0),
    high:scenarios.reduce((sum,ss)=>sum+Math.max(...ss.map(s=>s[i])),0)}));
  const peak=Math.max(...deciles.map(r=>Math.abs(r.mid))),epsilon=1e-9;
  const result={channel,entries,deciles,peak:deciles.reduce((a,b)=>b.mid>a.mid?b:a).index,
    upperSpared:deciles.slice(7).every(r=>Math.abs(r.low)<epsilon&&Math.abs(r.high)<epsilon),
    lowerSpared:deciles.slice(0,3).every(r=>Math.abs(r.low)<epsilon&&Math.abs(r.high)<epsilon),
    onlyUpper:deciles.slice(0,7).every(r=>Math.abs(r.low)<epsilon&&Math.abs(r.high)<epsilon)};
  if(deciles.every(r=>Math.abs(r.low)<epsilon&&Math.abs(r.high)<epsilon))return {...result,state:'zero'};
  if(deciles.some(r=>r.low<-epsilon))return {...result,state:'uncertain'};
  // The flatness test checks all ten deciles, not just three band averages.
  // Pairwise scenario differences preserve correlation within each action.
  let spread=0;
  for(let i=0;i<10;i++)for(let j=0;j<10;j++){
    spread=Math.max(spread,scenarios.reduce((sum,ss)=>sum+Math.max(...ss.map(s=>s[i]-s[j])),0));
  }
  if(deciles.every(r=>r.low>epsilon)&&spread<=peak*.15)return {...result,state:'even'};
  const average=(s,band)=>shareIncomeBands[band].reduce((sum,i)=>sum+s[i],0)/shareIncomeBands[band].length;
  const minimumGap=(a,b)=>scenarios.reduce((sum,ss)=>sum+Math.min(...ss.map(s=>average(s,a)-average(s,b))),0);
  const bands=Object.keys(shareIncomeBands);
  // Require a material lead that survives every supplied scenario combination.
  // These are editorial thresholds, not a new incidence model or significance test.
  const winner=bands.find(a=>bands.every(b=>a===b||minimumGap(a,b)>
    (a!=='middle'&&b==='middle'?epsilon:Math.max(epsilon,peak*.1))));
  if(winner)return {...result,state:winner};
  const varies=deciles.some(r=>r.high-r.low>Math.max(epsilon,peak*.15));
  return {...result,state:varies?'uncertain':'mixed'};
}
function packageDistribution(chosen,result,model){
  const entries=result.entries||[];
  const money=shareBurden(entries.filter(e=>e.channel==='cash'||e.channel==='indirect'),'money',model);
  const services=shareBurden(entries.filter(e=>e.channel==='services'),'services',model,result.serviceTotal);
  const work=shareBurden(entries.filter(e=>e.channel==='work'),'work',model);
  const covered=new Set(entries.map(e=>e.id));
  const missing=chosen.filter(d=>!covered.has(d.id));
  return {money,services,work,missing};
}
function packageComponents(chosen,result,model){
  const entries=new Map((result.entries||[]).map(e=>[e.id,e])),groups=new Map();
  for(const d of chosen){
    if(!Number.isFinite(d.amount)||d.amount<=0)continue;
    const entry=entries.get(d.id),profile=actionProfile(d);
    const channel=entry?(['cash','indirect'].includes(entry.channel)?'money':entry.channel):'unknown';
    const id=profile+'-'+channel;
    if(!groups.has(id))groups.set(id,{id,profile,channel,amount:0,chosen:[],entries:[]});
    const group=groups.get(id);group.amount+=d.amount;group.chosen.push(d);if(entry)group.entries.push(entry);
  }
  const components=[...groups.values()].sort((a,b)=>b.amount-a.amount||a.id.localeCompare(b.id));
  const positive=components.reduce((n,c)=>n+c.amount,0),channelTotals={};
  for(const c of components)channelTotals[c.channel]=(channelTotals[c.channel]||0)+c.amount;
  for(const c of components){
    const serviceTotal=c.channel==='services'?c.entries.reduce((n,e)=>n+e.mid.reduce((sum,v,i)=>sum+v*model.consumptionUnits[i]/1e6,0),0):0;
    c.burden=shareBurden(c.entries,c.channel,model,serviceTotal);
    c.share=c.amount/positive;
    // Fiscal weights select topics, never add service losses to cash burdens.
    // A small token measure cannot recast a large package. A substantial part
    // of the cash/work/service channel can still speak beside a large freeze.
    c.material=c===components[0]||c.share>=.1||
      (c.channel!=='unknown'&&c.share>=.05&&c.amount>=channelTotals[c.channel]*.25);
  }
  return components;
}
function packageProfile(weights){
  const ranked=Object.entries(weights).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  if(!ranked.length)return {id:'mixed',voice:'mixed',...packageProfiles.mixed};
  const positive=ranked.reduce((n,[,amount])=>n+amount,0),[leader,amount]=ranked[0],runner=ranked[1];
  if(!runner||amount>=positive*.65||runner[1]<positive*.2)return {id:leader,voice:leader,...packageProfiles[leader]};
  const pair=[leader,runner[0]],id=[...pair].sort().join('+');
  return {id,voice:'mixed',name:shareProfilePairs[id]||packageProfiles[leader].name,
    label:pair.map(key=>packageProfiles[key].label).join(' ja ')};
}
function compositionFacts(material,distribution,components){
  const parts=material.map(c=>({profile:c.profile,channel:c.channel,state:c.burden.state}));
  const business=material.filter(c=>c.profile==='companies').flatMap(c=>c.chosen);
  const taxes=business.some(d=>d.type==='tax'),cuts=business.some(d=>d.type==='cut');
  const businessClause=taxes&&cuts?'markkinoiden näkymätön käsi saa vähemmän tukirahaa ja suuremman verolaskun':taxes?'markkinoiden näkymättömälle kädelle ojennetaan näkyvä verolasku':'markkinoiden näkymätön käsi saa vähemmän taskurahaa valtiolta';
  const labels={services:'palveluleikkaukset',benefits:'etuusleikkaukset',work:'julkisen alan henkilöstösäästöt',income:'ansiotuloverot',consumption:'kulutusverot',wealth:'omaisuus- ja pääomaverot',
    companies:taxes&&cuts?'yritysverot ja tukileikkaukset':taxes?'yritysverot':'yritystukien leikkaukset',indices:'indeksijäädytykset',research:'tutkimusrahoituksen järjestelyt',grants:'avustusleikkaukset',mixed:'muut sopeutustoimet'};
  const join=words=>words.length<2?words[0]||'':words.slice(0,-1).join(', ')+' sekä '+words.at(-1);
  const subject=items=>join([...new Set(items.map(p=>p.profile==='services'&&p.channel==='money'?'palvelumaksujen korotukset':labels[p.profile]))]);
  const upperFirst=s=>s?s[0].toLocaleUpperCase('fi')+s.slice(1):'';
  const has=(profile,state)=>parts.some(p=>p.profile===profile&&p.state===state);
  const rest=(profiles=[],states=[])=>{
    const items=parts.filter(p=>!profiles.includes(p.profile)&&!states.includes(p.state)),clauses=[];
    if(items.some(p=>p.profile==='companies'))clauses.push(businessClause);
    const rest=items.filter(p=>p.profile!=='companies');
    for(const state of ['lower','middle','upper','other']){
      const group=rest.filter(p=>state==='other'?!['lower','middle','upper'].includes(p.state):p.state===state);
      if(group.length)clauses.push(subject(group)+(state==='lower'?' kiristävät alempien tuloryhmien arkea':state==='middle'?' osuvat tulotaulukon keskelle':state==='upper'?' marssivat suurituloisten kukkarolle':' kasvattavat säästöpottia'));
    }
    return join(clauses);
  };
  const lower=parts.filter(p=>p.state==='lower'),upper=parts.filter(p=>p.state==='upper'),middle=parts.filter(p=>p.state==='middle');
  const positive=components.reduce((n,c)=>n+c.amount,0);
  const missingWeight=distribution.missing.reduce((n,d)=>n+(Number.isFinite(d.amount)?Math.max(0,d.amount):0),0);
  return {parts,rest,businessClause,business:business.length>0,indices:material.some(c=>c.profile==='indices'),research:material.some(c=>c.profile==='research'),grants:material.some(c=>c.profile==='grants'),
    lowServices:has('services','lower')&&parts.some(p=>p.profile==='services'&&p.channel==='services'&&p.state==='lower'),lowConsumption:has('consumption','lower'),lowBenefits:has('benefits','lower'),
    lower:upperFirst(subject(lower)),lowerCount:lower.length,upper:upperFirst(subject(upper)),upperLower:subject(upper),middle:upperFirst(subject(middle)),
    balanced:distribution.money.deciles.length===10&&distribution.money.deciles.every(r=>r.low>1e-9)&&Math.max(...distribution.money.deciles.map(r=>r.mid))-Math.min(...distribution.money.deciles.map(r=>r.mid))<=Math.max(...distribution.money.deciles.map(r=>r.mid))*.35,all:upperFirst(subject(parts)),otherClause:rest([],['lower','upper']),
    netLower:missingWeight<positive*.1&&distribution.money.state==='lower',netUpper:missingWeight<positive*.1&&distribution.money.state==='upper'};
}
function packageStory(profile,distribution,total,chosen,components=[]){
  const material=components.filter(c=>c.material);
  const primary=distribution[profile==='services'?'services':profile==='work'?'work':'money'];
  const special=!chosen.length?'empty':total<0?'reverse':!components.length?(chosen.some(d=>!Number.isFinite(d.amount))?'unknown':'zero'):null;
  if(special){const copy=shareSpecialEditorial[special];return {id:special,channel:primary.channel,text:copy[0],body:copy[1],parts:[]};}
  const facts=compositionFacts(material,distribution,components),id=shareNarrativeKey(facts);
  const body=shareNarratives[id](facts);
  return {id,channel:primary.channel,text:body.split('. ')[0],body,parts:facts.parts};
}
function packageTone(total,hasChoices=true){
  // Amounts are in millions. Keep both escalating subtitles below the
  // demolition headline, which now starts at 20 billion.
  const id=!hasChoices?'empty':total<0?'reverse':total===0?'zero':
    total<5000?'rookie':total<9500?'under':total<=10500?'target':
    total<=15000?'over':total<17500?'heavy':total<20000?'extreme':'demolition';
  return {id,text:shareGoalEditorial[id]};
}
function packageSummary(chosen,result=calculateIncidence(chosen,incidenceModel),model=incidenceModel){
  const weights=Object.fromEntries(Object.keys(packageProfiles).map(key=>[key,0]));
  let total=0;
  for(const d of chosen){
    if(!Number.isFinite(d.amount))continue;
    total+=d.amount;
    if(d.amount>0)weights[actionProfile(d)]+=d.amount;
  }
  const profile=packageProfile(weights);
  const distribution=packageDistribution(chosen,result,model);
  const components=packageComponents(chosen,result,model);
  const story=packageStory(profile.voice,distribution,total,chosen,components);
  const tone=packageTone(total,chosen.length>0);
  const biggest=chosen.filter(d=>Number.isFinite(d.amount)&&d.amount>0).sort((a,b)=>b.amount-a.amount||a.id.localeCompare(b.id))[0];
  const title=biggest?.title?.trim().replace(/[.!?]+$/,'');
  const largest=title?'Suurin siivu: '+title+' ('+shareTotal(biggest.amount)+').':'';
  return {total,weights,profile,tone,story,distribution,components,description:story.body,largest};
}
function shareTotal(amount,words=false){
  const billions=Math.abs(amount)>=1000,value=billions?amount/1000:amount;
  const options={maximumFractionDigits:billions?2:1};
  const singular=new Intl.PluralRules('fi-FI',options).select(value)==='one';
  const unit=words?(billions?(singular?'miljardi':'miljardia'):(singular?'miljoona':'miljoonaa')):(billions?'mrd. €':'milj. €');
  return value.toLocaleString('fi-FI',options)+' '+unit;
}
function shareCaption(chosen,name){
  const s=packageSummary(chosen);
  return shareTitle(name)+'\n\n'+shareTotal(s.total,true)+' kasassa. '+s.tone.text;
}
