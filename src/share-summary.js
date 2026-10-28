// Editorial result labels, not an additional fiscal or income-incidence model.
const packageProfiles={
  services:{name:'Omahoidon apostoli',label:'Palveluleikkaukset'},
  benefits:{name:'Leipäjonokummi',label:'Etuusleikkaukset'},
  work:{name:'Muutosneuvottelija',label:'Julkisen alan työ'},
  income:{name:'Verokarhu',label:'Ansiotuloverotus'},
  consumption:{name:'Vyönkiristäjä',label:'Kulutusverotus'},
  wealth:{name:'Kansankomissaari',label:'Varallisuuden verotus'},
  companies:{name:'Näkymätön käsi',label:'Yritysten verot ja tuet'},
  mixed:{name:'SILPPURI',label:'Yhdistelmä'}
};
function actionProfile(d){
  // A payer group alone cannot distinguish, for example, student benefits from
  // university funding, or pension taxes from pension cuts and care charges.
  if(['cut-6-5','cut-6-6','cut-6-7','cut-7-24','cut-7-12','cut-7-16','cut-1-5','cut-1-6','cut-1-7'].includes(d.id))return 'mixed';
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
function shareEvidence(distribution){
  const {money,services,work}=distribution;
  const percent=n=>Math.abs(n)<1e-9?'0':Math.abs(n)<.01?'< 0,01':n.toLocaleString('fi-FI',{maximumFractionDigits:2});
  const range=r=>Math.abs(r.high-r.low)<.005?percent(r.mid):percent(r.low)+'–'+percent(r.high);
  const notes=[];
  if(!['none','zero'].includes(money.state)){
    notes.push('Arvioitu raharasitus suhteessa tuloihin: alin 10 % '+range(money.deciles[0])+' %, ylin 10 % '+range(money.deciles[9])+' %.'+
      (money.peak>0&&money.peak<9?' Suurin keskiarvio: '+(money.peak+1)+'. tulokymmenys ('+range(money.deciles[money.peak])+' %).':''));
  }
  if(!['none','zero'].includes(services.state)){
    const sum=indices=>indices.reduce((n,i)=>n+services.deciles[i].mid,0);
    notes.push('Palvelurahan leikkauksesta kohdentuu käytön perusteella alimpaan 30 %:iin '+percent(sum(shareIncomeBands.lower))+' %, ylimpään 30 %:iin '+percent(sum(shareIncomeBands.upper))+' %. Tämä ei mittaa rahatulon menetystä.');
  }
  if(!['none','zero'].includes(work.state))notes.push('Henkilöstömenojen kohdennus on työnantajan kustannusarvio, ei työntekijän nettotulon menetys.');
  if(distribution.missing.length)notes.push('Osasta valituista toimista ei ole tuloryhmäarviota; vertailu koskee arvioitua osaa.');
  return notes.join(' ');
}
function packageStory(profile,distribution,total,chosen){
  const {money,services,work}=distribution;
  const active=s=>!['none','zero'].includes(s.state);
  let primary=profile==='services'&&active(services)?services:profile==='work'&&active(work)?work:
    active(money)?money:active(services)?services:active(work)?work:money;
  let key=primary.state,copy;
  if(!chosen.length)key='empty';
  else if(total<0)key='reverse';
  else if(!active(primary))key=distribution.missing.length?'unknown':'zero';
  else if(money.state==='upper'&&services.state==='lower')key='cash-upper-services-lower';
  else if(money.state==='lower'&&services.state==='upper')key='cash-lower-services-upper';
  else if(money.state==='uncertain'&&services.state==='lower')key='cash-uncertain-services-lower';
  else if(money.state==='lower'&&services.state==='lower')key='double-lower';
  else if(primary===money&&money.state==='lower'&&money.upperSpared)key='lower-spared-upper';
  else if(primary===money&&money.state==='upper'&&money.onlyUpper)key='upper-only';
  else if(primary===money&&money.state==='upper'&&money.lowerSpared)key='upper-spared-lower';
  else if(key==='even'&&primary.channel!=='money')key='even-'+primary.channel;
  else if(key==='uncertain'&&profile==='companies')key='uncertain-companies';
  const voice=profile==='services'&&primary.channel==='money'?'fees':profile;
  copy=shareEditorial[key]?.[voice]||shareSpecialEditorial[key]||shareSpecialEditorial.unknown;
  // Incomplete coverage must qualify the headline too, because the link caption
  // is intentionally shorter than the image and does not carry the evidence.
  const partial=distribution.missing.length&&active(primary)&&total>=0;
  return {id:key,channel:primary.channel,text:(partial?'Arvioiduissa toimissa: ':'')+copy[0],body:copy[1]};
}
function packageSummary(chosen,result=calculateIncidence(chosen,incidenceModel),model=incidenceModel){
  const weights=Object.fromEntries(Object.keys(packageProfiles).map(key=>[key,0]));
  let total=0;
  for(const d of chosen){
    if(!Number.isFinite(d.amount))continue;
    total+=d.amount;
    if(d.amount>0)weights[actionProfile(d)]+=d.amount;
  }
  const ranked=Object.entries(weights).sort((a,b)=>b[1]-a[1]),positive=ranked.reduce((sum,[,n])=>sum+n,0);
  // Require a majority of the positive euros and a clear lead. Small cards do
  // not outvote a large measure; zero and unquantified options earn no weight.
  const [leader,leadingAmount]=ranked[0],second=ranked[1][1];
  const id=positive>0&&leadingAmount>=positive*.5&&leadingAmount-second>=positive*.1?leader:'mixed';
  const distribution=packageDistribution(chosen,result,model);
  const tone=packageStory(id,distribution,total,chosen);
  const biggest=chosen.filter(d=>Number.isFinite(d.amount)&&d.amount>0).sort((a,b)=>b.amount-a.amount||a.id.localeCompare(b.id))[0];
  const title=biggest?.title?.trim().replace(/[.!?]+$/,'');
  const largest=title?'Suurin siivu: '+title+' ('+shareTotal(biggest.amount)+').':'';
  const evidence=shareEvidence(distribution);
  return {total,weights,profile:{id,...packageProfiles[id]},tone,distribution,description:tone.body,evidence,largest};
}
function shareTotal(amount){
  return (Math.abs(amount)>=1000?amount/1000:amount).toLocaleString('fi-FI',{maximumFractionDigits:Math.abs(amount)>=1000?2:1})+(Math.abs(amount)>=1000?' mrd. €':' milj. €');
}
function shareCaption(chosen,name){
  const s=packageSummary(chosen);
  return shareTitle(name)+': '+shareTotal(s.total)+', '+s.profile.name+'.\n'+s.tone.text;
}
