const decileName=i=>i===0?'Pienituloisin 10 %':i===9?'Suurituloisin 10 %':(i+1)+'. tulokymmenys';
function decileIncomeRange(i){
  const {low,high}=incidenceModel.incomeBounds[i];
  const euro=n=>n.toLocaleString('fi-FI',{maximumFractionDigits:0});
  return (i===0?'≤ '+euro(high):i===9?'≥ '+euro(low):euro(low)+'–'+euro(high))+' €/v';
}
const roundEuro=n=>Math.round(n/10)*10;
const incidenceChannels={cash:'Suorat verot ja etuusmuutokset',indirect:'Yritysten kautta · ehdollinen arvio'};
function chartPercent(n){
  if(n===0)return '0 %';
  if(Math.abs(n)<.005)return '< 0,01 %';
  return '≈ '+(n<0?'+':'−')+Math.abs(n).toLocaleString('fi-FI',{maximumFractionDigits:Math.abs(n)<.1?2:1})+' %';
}
function lossLabel(low,high,percent=false){
  const rounded=n=>percent?Number(n.toFixed(2)):roundEuro(n);
  const format=n=>Math.abs(n).toLocaleString('fi-FI',{maximumFractionDigits:percent?2:0});
  const a=rounded(low),b=rounded(high),unit=percent?' %':' €';
  if(a===0&&b===0)return low===0&&high===0?'0'+unit:'< '+(percent?'0,01':'10')+unit;
  if(a===b)return (a<0?'+':'−')+format(a)+unit;
  return (a<0?'+':'−')+format(a)+'…'+(b<0?'+':'−')+format(b)+unit;
}
function incidenceLinks(spec){
  return [...new Set(spec.sources)].map(key=>{const s=incidenceModel.sources[key];return `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`;}).join(' · ')+(spec.pages?.length?' · s. '+spec.pages.join(', '):'');
}
const shareLabel=n=>n.toLocaleString('fi-FI',{maximumFractionDigits:1})+' %';
function incidenceBars(rows,maxPercent,services,maxService,hasCash,hasServices){
  if(hasCash&&hasServices)return '<div class="sp-incidence-charts">'+incidenceBars(rows,maxPercent,services,maxService,true,false)+incidenceBars(rows,maxPercent,services,maxService,false,true)+'</div>';
  const peak=rows.reduce((a,b)=>a.mid/incidenceModel.income[a.index]>b.mid/incidenceModel.income[b.index]?a:b).index;
  const ticks=max=>[0,.5,1].map(f=>'<span>'+shareLabel(max*f)+'</span>').join('');
  const cashHead='<div><h3>Rahat ja ostovoima</h3><p>Rasitus suhteessa vuosituloihin</p></div>';
  const serviceHead='<div><h3>Julkiset palvelut</h3><p>Arvioitu osuus palveluleikkauksista</p></div>';
  const chart=hasCash?'cash':'services';
  return '<section class="sp-income-bars" data-income-chart="'+chart+'" aria-label="'+(hasCash?'Rahat ja ostovoima':'Julkiset palvelut')+'"><header class="sp-income-head">'+(hasCash?cashHead:serviceHead)+'<p class="sp-income-basis">Nettotulot / vuosi · yksin asuva · '+incidenceModel.referenceYear+'</p></header>'+rows.map(r=>{
    const percent=r.mid/incidenceModel.income[r.index]*100;
    const width=n=>Math.max(0,n/incidenceModel.income[r.index]*100/maxPercent*100);
    const parts=[['cut',r.cut],['tax',r.tax],['indirect',r.indirect]];
    const name=r.index===0?'Pienituloisin 10 %':r.index===9?'Suurituloisin 10 %':(r.index+1)+'. tulokymmenys';
    const range=r.high-r.low>.01?`<span class="sp-income-range" style="left:${r.percentLow/maxPercent*100}%;width:${(r.percentHigh-r.percentLow)/maxPercent*100}%"></span>`:'';
    const s=services[r.index];
    const serviceRange=s.high-s.low>.01?`<span class="sp-income-range" style="left:${s.shareLow/maxService*100}%;width:${(s.shareHigh-s.shareLow)/maxService*100}%"></span>`:'';
    const moneyCell=`<span class="sp-effect-cell"><span class="sp-income-plot"><span class="sp-income-stack">${parts.map(([key,value])=>'<i class="sp-income-'+key+'" style="width:'+width(value)+'%"></i>').join('')}</span>${range}</span><strong class="sp-income-value">${chartPercent(percent)}</strong></span>`;
    const serviceCell=`<span class="sp-effect-cell sp-service-cell"><span class="sp-income-plot"><span class="sp-income-stack"><i class="sp-service-fill" style="width:${s.share/maxService*100}%"></i></span>${serviceRange}</span><strong class="sp-income-value">${shareLabel(s.share)}</strong></span>`;
    const description=(hasCash?lossLabel(r.percentLow,r.percentHigh,true)+' suhteessa tuloihin vuodessa. ':'')+(hasServices?'Palveluleikkauksista arviolta '+shareLabel(s.shareLow)+'–'+shareLabel(s.shareHigh)+'. ':'');
    return `<button type="button" class="sp-income-row cursor-interaction" data-incidence-chart="${chart}" data-decile="${r.index}" data-peak="${r.index===peak}" aria-pressed="${activeDecile===r.index}" aria-controls="sp-decile-detail" aria-label="${decileName(r.index)}, nettotulot yksin asuvalle ${decileIncomeRange(r.index)} (${incidenceModel.referenceYear}): ${description}Näytä eurot ja toimet."><span class="sp-income-label"><span>${name}</span><strong class="sp-income-bounds">${decileIncomeRange(r.index)}</strong></span>${hasCash?moneyCell:serviceCell}</button>`;
  }).join('')+'<div class="sp-income-axes" aria-hidden="true"><span></span><div class="sp-income-axis">'+ticks(hasCash?maxPercent:maxService)+'</div></div></section>';
}
function renderIncidence(chosen){
  drawFlows(chosen);renderFlowDetail(chosen);
  const {entries,householdRows:rows,channels,serviceEntries,serviceRows,serviceTotal,missing}=calculateIncidence(chosen,incidenceModel);
  const household=entries.filter(e=>e.channel==='cash'||e.channel==='indirect'),has=household.length>0;
  const hasServices=serviceEntries.length>0&&serviceTotal>0,any=has||hasServices;
  q('.sp-cash-chart').hidden=false;
  q('.sp-decile-scope').textContent='';
  q('.sp-decile-head').hidden=true;
  q('.sp-decile-axis').hidden=true;
  const peak=Math.max(.1,...rows.map(r=>Math.max(Math.abs(r.percentLow),Math.abs(r.percentHigh))));
  const step=10**Math.floor(Math.log10(peak))/2,maxPercent=Math.ceil(peak*1.15/step)*step;
  const servicePeak=Math.max(10,...serviceRows.map(r=>r.shareHigh)),maxService=Math.ceil(servicePeak*1.1/5)*5;
  q('.sp-decile-rows').innerHTML=any?incidenceBars(rows,maxPercent,serviceRows,maxService,has,hasServices):'<p class="sp-empty">'+(chosen.length?'Ei tuloryhmäarviota.':'Ei valittuja toimia.')+'</p>';
  q('.sp-decile-source').innerHTML=any?'<span><i class="sp-dot cut"></i>Menoleikkaukset</span>'+(has?'<span><i class="sp-dot"></i>Verot ja maksut</span>':'')+(household.some(e=>e.channel==='indirect')?'<span><i class="sp-dot indirect"></i>Yritysten kautta (arvio)</span>':'')+(rows.some(r=>r.high-r.low>.01)||serviceRows.some(r=>r.high-r.low>.01)?'<span><i class="sp-range-key"></i>Arviohaarukka</span>':''):'';
  const detail=any&&Number.isInteger(activeDecile);
  q('.sp-decile-picker').hidden=!any;
  q('#sp-decile-picker').innerHTML='<option value="">Valitse tuloryhmä</option>'+incidenceModel.income.map((_,i)=>'<option value="'+i+'">'+decileName(i)+' · '+decileIncomeRange(i)+'</option>').join('');
  q('#sp-decile-picker').value=detail?String(activeDecile):'';
  q('.sp-decile-detail').hidden=!detail;
  q('.sp-decile-detail').innerHTML=detail?`<h3>${decileName(activeDecile)}${has?" · "+lossLabel(rows[activeDecile].percentLow,rows[activeDecile].percentHigh,true):""}</h3>${Object.keys(incidenceChannels).filter(channel=>household.some(e=>e.channel===channel)).map(channel=>{
    const r=channels[channel][activeDecile];
    const basis=channel==='cash'||!household.some(e=>e.channel==='cash')?'<p class="sp-decile-basis">Eurot yhden aikuisen vertailutaloudelle ryhmän keskituloilla (2024). Ryhmäkeskiarvo ei ole jokaisen jäsenen menetys.</p>':'';
    return `<section class="sp-incidence-group" data-detail-channel="${channel}" aria-label="${incidenceChannels[channel]}"><header class="sp-incidence-group-head"><h4>${incidenceChannels[channel]}</h4><strong>${lossLabel(r.percentLow,r.percentHigh,true)}</strong></header>${basis}<div class="sp-incidence-group-rows">${household.filter(e=>e.channel===channel).sort((a,b)=>b.mid[activeDecile]-a.mid[activeDecile]).map(e=>`<details class="sp-incidence-action" data-effect-color="${channel==='indirect'?'indirect':e.action.type}"><summary class="cursor-interaction"><span>${esc(e.action.short)}<small>${e.spec.partial?'Osittainen arvio':e.derived?'Johdettu arvio':'VM:n SISU-kuvio'}</small></span><strong>${lossLabel(e.low[activeDecile],e.high[activeDecile])}</strong></summary><p>${esc(e.spec.method)}</p>${e.spec.note?'<p>'+esc(e.spec.note)+'</p>':''}<p>${incidenceLinks(e.spec)}</p><button type="button" class="sp-text-button cursor-interaction" data-open="${e.id}">Avaa toimen kaikki vaikutukset →</button></details>`).join('')}</div></section>`;
  }).join('')}`:'';
  if(detail&&hasServices){
    const r=serviceRows[activeDecile];
    q('.sp-decile-detail').innerHTML+=`<section class="sp-incidence-group" data-detail-channel="services" aria-label="Palveluleikkaukset"><header class="sp-incidence-group-head"><h4>Palveluleikkaukset</h4><strong>${shareLabel(r.shareLow)}–${shareLabel(r.shareHigh)}</strong></header><p class="sp-decile-basis">Arvio tähän tuloryhmään kohdistuvasta rahoituksen vähennyksestä. Jakaumat kuvaavat palvelujen käyttöä ja menoja, eivät suoraan hoitokäyntien tai hyvinvoinnin menetystä.</p><div class="sp-incidence-group-rows">${serviceEntries.sort((a,b)=>b.allocation[activeDecile].mid-a.allocation[activeDecile].mid).map(e=>{const a=e.allocation[activeDecile];return `<details class="sp-incidence-action" data-effect-color="cut"><summary class="cursor-interaction"><span>${esc(e.action.short)}</span><strong>${payerMoneyLabel(a.low)}–${payerMoneyLabel(a.high)}</strong></summary><p>${esc(e.spec.method)}</p>${e.spec.note?'<p>'+esc(e.spec.note)+'</p>':''}<p>${incidenceLinks(e.spec)}</p><button type="button" class="sp-text-button cursor-interaction" data-open="${e.id}">Tutkimukset ja vaikutukset →</button></details>`;}).join('')}</div></section>`;
  }
  const outside=entries.filter(e=>e.channel==='work'||e.channel==='services'&&!hasServices),other=[...outside.map(e=>e.action),...missing];
  q('.sp-distribution-gap').hidden=!other.length;
  q('.sp-distribution-gap').innerHTML=other.length?`<details><summary class="cursor-interaction"><strong>Muut vaikutukset · ${other.length} toimea</strong></summary>${other.map(d=>{const e=outside.find(e=>e.id===d.id),spec=incidenceModel.actions[d.id];const basis=d.incidenceHorizonGap?'Pitkän aikavälin vuosiarviolle ei ole vastaavaa tuloryhmäjakaumaa.':e?.channel==='services'?'Julkisten palvelujen rahoituksen muutos. Se ei ole kotitalouden rahatulon menetys.':e?.channel==='work'?'Työnantajan työpanos tai palkkakustannus muuttuu. Työntekijän nettotulovaikutusta ei ole laskettu.':spec?.kind==='separate'?spec.method:'Valitulle vuodelle ei ole euromäärää. Vaikutusta ei lasketa nollaksi.';return `<details class="sp-incidence-action"><summary class="cursor-interaction"><span>${esc(d.short)}</span><strong>${payerMoneyLabel(d.amount)}</strong></summary><p>${esc(basis)}</p><p>${esc(d.who)}</p><p>${esc(d.research?.finding||d.society)}</p>${e?'<p>'+incidenceLinks(e.spec)+'</p>':''}<button type="button" class="sp-text-button cursor-interaction" data-open="${d.id}">Tutkimukset ja vaikutukset →</button></details>`;}).join('')}</details>`:'';
  const studies=incidenceModel.international.filter(s=>chosen.some(d=>s.ids?.includes(d.id)||s.flows?.includes(d.flow)));
  q('.sp-international').hidden=!studies.length;
  q('.sp-international').innerHTML=studies.length?`<summary class="cursor-interaction">Mitä muiden maiden sopeutuksista tiedetään?</summary>${studies.map(s=>`<article><h3><a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a></h3><p>${esc(s.finding)}</p></article>`).join('')}`:'';
  const warnings=[];
  if(chosen.some(d=>d.id==='vat'||d.id.startsWith('tax-vat')||d.id==='tax-food18'))warnings.push('<strong>ALV:</strong> ostovoimalaskelma on ennen etuusindeksien hyvityksiä. Piirakan julkistaloudellinen netto ja kotitalouden ostovoimamenetys ovat eri lukuja.');
  if(entries.some(e=>e.channel==='services'))warnings.push('<strong>Palvelut:</strong> OECD:n Suomen jakaumat ovat vuodelta 2007. Ne antavat suuntaa, mutta eivät huomioi palvelujen käytön myöhempiä muutoksia.');
  if(chosen.some(d=>(d.possibleOverlaps||[]).some(o=>chosen.some(x=>x.id===o.id))))warnings.push('<strong>Päällekkäisyys:</strong> valittujen toimien arvioissa voi olla samoja säästöjä. Paketin yhteisvaikutusta ei ole laskettu.');
  q('.sp-incidence-warnings').innerHTML=warnings.map(t=>'<p>'+t+'</p>').join('');
}

