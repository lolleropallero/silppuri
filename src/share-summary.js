// Editorial result labels, not an additional fiscal or income-incidence model.
const packageProfiles={
  services:{name:'Omahoidon apostoli',label:'Palveluleikkaukset'},
  benefits:{name:'Leipäjonokummi',label:'Etuusleikkaukset'},
  work:{name:'Muutosneuvottelija',label:'Julkisen alan työ'},
  income:{name:'Verokarhu',label:'Ansiotuloverotus'},
  consumption:{name:'Ruokakassiryöstäjä',label:'Kulutusverotus'},
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
function packageTone(total){
  if(total<0)return {id:'reverse',text:'Silppuri kävi takaperin.'};
  if(total===0)return {id:'empty',text:'Terät vielä puhtaina.'};
  if(total<5000)return {id:'rookie',text:'IMF hoitaa loput myöhemmin.'};
  if(total<9500)return {id:'under',text:'Loput seuraavan hallituksen murheeksi.'};
  if(total<=10500)return {id:'target',text:'Kympin tuntumassa. Sormet tallella.'};
  if(total<=15000)return {id:'over',text:'Tavoite oli ilmeisesti alaraja.'};
  if(total<=20000)return {id:'heavy',text:'Lähti vähän kantavaa seinää.'};
  if(total<30000)return {id:'extreme',text:'Sammutusnappi meni mukana.'};
  return {id:'demolition',text:'Budjetti loppui. Silppuri ei.'};
}
function packageDescription(chosen,profile,total){
  if(total<=0)return '';
  const counted=chosen.filter(d=>Number.isFinite(d.amount)&&d.amount>0);
  const focus=profile==='mixed'?counted:counted.filter(d=>actionProfile(d)===profile);
  const cuts=focus.some(d=>d.type==='cut'),taxes=focus.some(d=>d.type==='tax');
  const descriptions={
    services:cuts&&taxes?'Leikkaat julkisten palvelujen rahoitusta ja korotat maksuja.':
      taxes?'Keräät lisää rahaa julkisten palvelujen maksuista.':'Leikkaat etenkin julkisten palvelujen rahoitusta.',
    benefits:'Leikkaat etenkin etuuksia.',
    work:'Haet säästöjä etenkin julkisen alan henkilöstömenoista.',
    income:'Kiristät etenkin ansiotulojen verotusta.',
    consumption:'Keräät lisää veroja etenkin kulutuksesta.',
    wealth:'Kiristät etenkin omaisuuden ja pääomatulojen verotusta.',
    companies:cuts&&taxes?'Kiristät yritysten veroja ja leikkaat yrityksille maksettavaa rahaa.':
      taxes?'Keräät lisää veroja ja maksuja etenkin yrityksiltä.':'Haet säästöjä etenkin yrityksille maksettavasta rahasta.',
    mixed:cuts&&taxes?'Yhdistät menoleikkauksia ja verojen korotuksia.':
      taxes?'Kokoat paketin useista veroista ja maksuista.':'Haet säästöjä useista menokohteista.'
  };
  // Use the current pie amounts and titles, including the user's rate/horizon
  // choices. A gross reference or unpriced proposal cannot become the headline.
  const largest=counted.reduce((best,d)=>!best||d.amount>best.amount?d:best,null);
  const title=largest?.title?.trim().replace(/[.!?]+$/,'');
  return descriptions[profile]+(title?' Suurin siivu: '+title+'.':'');
}
function packageSummary(chosen){
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
  const [leader,largest]=ranked[0],second=ranked[1][1];
  const id=positive>0&&largest>=positive*.5&&largest-second>=positive*.1?leader:'mixed';
  const tone=total===0&&chosen.length?{id:'zero',text:'Terät pyörivät. Laskuri ei.'}:packageTone(total);
  return {total,weights,profile:{id,...packageProfiles[id]},tone,description:packageDescription(chosen,id,total)};
}
function shareTotal(amount){
  return (Math.abs(amount)>=1000?amount/1000:amount).toLocaleString('fi-FI',{maximumFractionDigits:Math.abs(amount)>=1000?2:1})+(Math.abs(amount)>=1000?' mrd. €':' milj. €');
}
function shareCaption(chosen,name){
  const s=packageSummary(chosen);
  return [shareTitle(name),shareTotal(s.total)+' · '+s.profile.name,s.tone.text,s.description].filter(Boolean).join('\n');
}
