let growthSnapshot=null,growthChosen=[],growthRenderKey='';
const growthRangeYears=growthModel.maxYear;
function growthLinks(ids){
  return [...new Set(ids)].map(id=>{
    const s=growthModel.sources[id]||growthModel.baseline.sources[id]||researchSources[id]||incidenceModel.sources[id];
    return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`:'';
  }).filter(Boolean).join(' · ');
}
// GDP level differences are small, so tenths are shown unless the value is below 0.1 %.
function growthPercent(value,signed=true){
  const digits=Math.abs(value)<.1?2:1,rounded=Number(value.toFixed(digits));
  if(rounded===0)return '≈ 0 %';
  return (signed?(rounded>0?'+':'−'):'')+new Intl.NumberFormat('fi-FI',{maximumFractionDigits:digits}).format(Math.abs(rounded))+' %';
}
function growthEuros(million,signed=true){
  const abs=Math.abs(million),sign=signed?(million<0?'−':'+'):'';
  if(abs<.5)return '≈ 0 €';
  return sign+(abs>=1000?new Intl.NumberFormat('fi-FI',{maximumFractionDigits:1}).format(abs/1000)+' mrd. €':new Intl.NumberFormat('fi-FI').format(Math.round(abs))+' milj. €');
}
function growthPlotGeometry(){
  const width=Math.max(280,Math.min(1200,q('.sp-growth-plot-wrap').clientWidth||920)),narrow=width<550;
  return {width,narrow,height:narrow?260:310,left:narrow?48:58,right:narrow?86:120,top:30,bottom:34};
}
function growthPlotScale(values){
  const low=Math.min(0,...values),high=Math.max(0,...values),span=Math.max(.2,high-low);
  const rough=span/4,power=10**Math.floor(Math.log10(rough));
  const step=[1,2,2.5,5,10].map(n=>n*power).find(n=>n>=rough);
  const min=Math.floor(low/step)*step,max=Math.ceil(high/step)*step;
  const ticks=[];for(let v=min;v<=max+step*.01;v+=step)ticks.push(Math.abs(v)<step*.001?0:v);
  return {min:min===max?min-step:min,max,ticks,step};
}
// A turning point worth its own label: the largest swing well before the last year.
// A curve that keeps moving the same way has none, and the end label tells its story.
function growthPeakYear(points){
  const peak=points.slice(1,growthRangeYears).reduce((best,p)=>Math.abs(p.value)>Math.abs(best.value)?p:best,points[1]).year;
  return peak>=growthRangeYears-1?null:peak;
}
const growthPeople=n=>{const rounded=Math.round(n/100)*100;return (rounded>0?'+':rounded<0?'−':'')+new Intl.NumberFormat('fi-FI').format(Math.abs(rounded));};
// What the curve leaves out belongs next to it: unestimated actions and VM's untimed
// long-run labour-supply estimates.
// Chart geometry shared by the page's SVG and the share image's canvas, in the page's pixels.
function growthChartParts(points,{width,height,left,right,top,bottom}){
  // Headroom beyond the extremes keeps the point labels clear of the axis.
  const values=points.flatMap(p=>[p.value,p.low,p.high]),low=Math.min(0,...values),high=Math.max(0,...values),pad=(high-low)*.35;
  const scale=growthPlotScale([...values,low<0?low-pad:0,high>0?high+pad:0]);
  const x=t=>left+(width-left-right)*t/growthRangeYears,y=v=>top+(height-top-bottom)*(scale.max-v)/(scale.max-scale.min);
  const tickFormat=new Intl.NumberFormat('fi-FI',{maximumFractionDigits:Math.max(0,-Math.floor(Math.log10(scale.step))+1)});
  const path=key=>points.map((p,i)=>(i?'L':'M')+x(p.year).toFixed(1)+','+y(p[key]).toFixed(1)).join(' ');
  const side=v=>v<0?'loss':'gain',peak=growthPeakYear(points),last=points[growthRangeYears],marks=[];
  // The end label sits right of the line; a turning point gets a label on the side the
  // line moves away from, never crossing the zero line.
  if(peak){
    const p=points[peak],py=y(p.value);
    let below=points[peak+1].value>p.value;
    if(!below&&p.value<0&&py-42<y(0))below=true;
    else if(below&&p.value>0&&py+44>y(0))below=false;
    marks.push({cx:x(peak),cy:py,side:side(p.value),x:x(peak)+10,y:below?py+24:py-26,value:growthPercent(p.value),notes:[[16,`${peak}. vuosi · ${growthEuros(p.absolute)}`]]});
  }
  marks.push({cx:x(growthRangeYears),cy:y(last.value),side:side(last.value),x:x(growthRangeYears)+12,y:y(last.value)-4,value:growthPercent(last.value),notes:[[16,`${growthRangeYears}. vuosi`],[14,growthEuros(last.absolute)]]});
  return {x,peak,marks,line:path('value'),band:path('high')+[...points].reverse().map(p=>' L'+x(p.year).toFixed(1)+','+y(p.low).toFixed(1)).join('')+' Z',
    ticks:scale.ticks.map(t=>({y:y(t),zero:t===0,label:tickFormat.format(t)+' %'})),
    years:points.map(p=>({x:x(p.year),label:p.year===growthRangeYears?p.year+' v':String(p.year),anchor:p.year?'middle':'start'})),
    baseline:{x:x(growthRangeYears/2),y:y(0)+(points[Math.round(growthRangeYears/2)].value>0?16:-8)},
    // Colour carries polarity: above the zero line GDP is larger, below it smaller. The band and
    // the line are drawn once per side, clipped at zero.
    sides:[['gain',0,y(0)],['loss',y(0),height]]};
}
// When actions are missing the curve is not the whole package, so the page and the share image say
// how much of the package's savings it covers.
function growthCoverageLine(metric,chosen){
  if(!metric.uncovered.length)return '';
  const euros=d=>Number.isFinite(d.amount)?Math.abs(d.amount):0,total=chosen.reduce((n,d)=>n+euros(d),0);
  const share=total?metric.contributors.reduce((n,c)=>n+euros(c.action),0)/total*100:0;
  return `Käyrässä mukana ${share>99.5?'lähes kaikki':`noin ${Math.round(share)} %`} paketin säästöistä (${metric.contributors.length} / ${chosen.length} toimea).`;
}
// The package's GDP scenario, shared by the page and the share image.
function growthCalculate(chosen){
  return calculateGrowth(chosen,growthModel,{incidence:calculateIncidence(chosen,incidenceModel),consumptionUnits:incidenceModel.consumptionUnits,incomeYear:incidenceModel.referenceYear,moneyYear:year});
}
function renderGrowthChart(){
  const svg=q('.sp-growth-plot'),empty=q('.sp-growth-empty'),scope=q('.sp-growth-scope');
  const metric=growthSnapshot?.metrics.gdp,points=metric?.points||[];
  empty.hidden=!!points.length;
  if(!points.length){
    svg.innerHTML='';scope.textContent='';svg.setAttribute('aria-label','BKT verrattuna tilanteeseen ilman pakettia');
    empty.textContent=growthSnapshot?.selectedCount?'Valituille toimille ei ole laskentaperustetta. Puuttuva vaikutus ei ole nolla.':'Valitse toimia nähdäksesi, miten paketti muuttaa talouden kokoa.';
    return;
  }
  const geometry=growthPlotGeometry(),{width,height,left,right,top,bottom}=geometry,c=growthChartParts(points,geometry);
  let markup=c.ticks.map(t=>`<line class="${t.zero?'sp-growth-zero':'sp-growth-grid'}" x1="${left}" x2="${width-right}" y1="${t.y}" y2="${t.y}"/><text x="${left-8}" y="${t.y+4}" text-anchor="end">${t.label}</text>`).join('');
  markup+=c.years.map(t=>`<text x="${t.x}" y="${height-10}" text-anchor="${t.anchor}">${t.label}</text>`).join('');
  markup+=`<text x="${c.baseline.x}" y="${c.baseline.y}" text-anchor="middle">Ilman pakettia</text>`;
  markup+=`<defs>${c.sides.map(([name,from,to])=>`<clipPath id="sp-growth-${name}"><rect x="0" y="${from}" width="${width}" height="${Math.max(0,to-from)}"/></clipPath>`).join('')}</defs>`;
  markup+=c.sides.map(([name])=>`<g class="sp-growth-${name}" clip-path="url(#sp-growth-${name})"><path class="sp-growth-band" d="${c.band}"/><path class="sp-growth-line" d="${c.line}"/></g>`).join('');
  markup+=c.marks.map(m=>`<circle class="sp-growth-point sp-growth-${m.side}" cx="${m.cx}" cy="${m.cy}" r="5"/><text class="sp-growth-value" x="${m.x}" y="${m.y}">${m.value}${m.notes.map(([dy,note])=>`<tspan x="${m.x}" dy="${dy}">${note}</tspan>`).join('')}</text>`).join('');
  markup+=points.map(p=>`<rect class="sp-growth-hit" x="${c.x(Math.max(0,p.year-.5))}" y="${top}" width="${c.x(Math.min(growthRangeYears,p.year+.5))-c.x(Math.max(0,p.year-.5))}" height="${height-top-bottom}"><title>Vuosi ${p.year}: ${growthPercent(p.value)} (${growthEuros(p.absolute)}), oletuksista riippuen ${growthPercent(p.low)} … ${growthPercent(p.high)}</title></rect>`).join('');
  const peak=c.peak,p=points[peak??1],last=points[growthRangeYears];
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  svg.innerHTML=markup;
  const amount=p=>growthPercent(p.value)==='≈ 0 %'?'suunnilleen yhtä suuri':`noin ${growthPercent(p.value,false)} (${growthEuros(p.absolute,false)}) ${p.value<0?'pienempi':'suurempi'}`;
  const when=(peak??1)===1?'Ensimmäisenä vuonna':`${p.value<0?'Pahimmillaan':'Parhaimmillaan'} ${peak}. vuonna`;
  const largest=[...metric.contributors].sort((a,b)=>Math.abs(b.points[growthRangeYears].value)-Math.abs(a.points[growthRangeYears].value))[0];
  // The chart shows these figures; the sentence is its description for screen readers.
  const summary=`${when} BKT on ${amount(p)} ja ${growthRangeYears} vuoden päästä ${amount(last)} kuin ilman pakettia. Oletuksista riippuen ${growthRangeYears}. vuoden ero on ${growthPercent(last.low)} … ${growthPercent(last.high)}. Suurin tekijä: ${largest.action.short} (${growthPercent(largest.points[growthRangeYears].value)}).`;
  scope.textContent=growthCoverageLine(metric,growthChosen);
  svg.setAttribute('aria-label',`BKT verrattuna tilanteeseen ilman pakettia vuosina 0–${growthRangeYears}. ${summary} ${scope.textContent}`.trim());
}
// Multiplier groups side by side: the base model the curve uses, and the median and range across
// the study's specifications. The calibration notes go under each group's name.
function growthGroupTable(groups,notes){
  const n=v=>v.toLocaleString('fi-FI');
  return `<p>Kumulatiivinen kerroin kahdessa → viidessä vuodessa; positiivinen luku tarkoittaa pienempää BKT:tä.</p><div class="sp-growth-table-wrap"><table class="sp-growth-table" aria-label="Kerrointutkimuksen ryhmät">`+
    `<thead><tr><th scope="col">Ryhmä</th><th scope="col">Perusmalli</th><th scope="col">Mallien mediaani</th><th scope="col">Vaihteluväli 2 v</th><th scope="col">Vaihteluväli 5 v</th></tr></thead><tbody>`+
    groups.map(g=>{const [two,five]=growthPublished(g),note=notes?`${g.assumption?esc(g.assumption)+' ':''}${esc(g.note)}${g.sourceIds?' '+growthLinks(g.sourceIds):''}`:g.assumption?'Silppurin oletus':'';
      return `<tr><th scope="row">${esc(g.label)}${note?`<span>${note}</span>`:''}</th><td data-label="Perusmalli">${n(two)} → ${n(five)}</td><td data-label="Mallien mediaani">${n(g.twoYear.value)} → ${n(g.fiveYear.value)}</td><td data-label="Vaihteluväli 2 v">${n(g.twoYear.low)}…${n(g.twoYear.high)}</td><td data-label="Vaihteluväli 5 v">${n(g.fiveYear.low)}…${n(g.fiveYear.high)}</td></tr>`;}).join('')+'</tbody></table></div>';
}
// The study's published base-model multipliers, two and five years, as GDP lost per annual euro.
function growthPublished(group){
  return growthModel.fiscalMultipliers.impulseResponses.responses[group.irf].reported.map(v=>group.kind==='tax'?-v:v);
}
function renderGrowthCoverage(){
  const metric=growthSnapshot?.metrics.gdp,coverage=q('.sp-growth-coverage');
  if(!metric?.points.length){coverage.innerHTML='';return;}
  const multipliers=growthModel.fiscalMultipliers,groups=Object.values(multipliers.groups).filter(g=>growthChosen.some(d=>g.actions.includes(d.id)));
  // Actions without an estimate are named, so a flat line is never read as zero.
  const intro=`${growthCoverageLine(metric,growthChosen)||`Käyrässä ovat mukana kaikki ${metric.contributors.length} toimea.`}${metric.uncovered.length?` Ei arviota: ${metric.uncovered.map(d=>d.short).join(', ')}.`:''}`;
  const groupList=groups.length?growthGroupTable(groups,false):'';
  const channels=metric.contributors.some(c=>!c.input.calibrated)?'<p>Muut toimet lasketaan ostovoiman, julkisen kysynnän, T&amp;K:n ja koulutuksen kautta.</p>':'';
  const units={persons:'henkeä',fte:'henkilötyövuotta'},{entries:longRun,totals}=growthSnapshot.longRun,range=t=>t.low!==t.high?` (${growthPeople(t.low)} … ${growthPeople(t.high)})`:'';
  const sums=[totals.persons&&`${growthPeople(totals.persons.value)} henkeä${range(totals.persons)}`,totals.fte&&`${growthPeople(totals.fte.value)} henkilötyövuotta${range(totals.fte)}`].filter(Boolean);
  // Labour-supply estimates cover only some actions and leave out demand effects, so they are
  // never presented as the package's employment effect.
  const longRunList=longRun.length?`<p>VM:n pitkän aikavälin työn tarjonnan arviot, eivät käyrässä: yhteensä noin ${sums.join(' ja ')}. Ne koskevat vain ${new Set(longRun.map(e=>e.action.id)).size} / ${growthSnapshot.selectedCount} toimea, joten summa ei ole paketin työllisyysvaikutus.</p><ul class="sp-growth-groups">${longRun.map(e=>`<li><strong>${esc(e.action.short)}: ${growthPeople(e.value)} ${units[e.unit]}${e.low!==e.high?` (${growthPeople(e.low)} … ${growthPeople(e.high)})`:' (ei julkaistua vaihteluväliä)'}${e.kind==='tax'?', johdettu VM:n luvuista':''}.</strong> ${esc(e.limit||'')}</li>`).join('')}</ul>`:'';
  const overlaps=growthSnapshot.overlaps.length?'<p>Mahdollisesti päällekkäisten toimien työn tarjonnan arviot on jätetty pois.</p>':'';
  const sourceIds=[...(groups.length?['finland-fiscal-2026']:[]),...longRun.flatMap(e=>e.sourceIds)];
  coverage.innerHTML=`<h4>Tämän paketin laskelma</h4><p>${esc(intro)}</p>${groupList}${channels}${longRunList}${overlaps}${sourceIds.length?`<p>${growthLinks(sourceIds)}</p>`:''}`;
}
function renderGrowth(chosen){
  growthChosen=chosen;
  const key=JSON.stringify([year,chosen.map(d=>[d.id,d.amount,d.gross,d.budgetAmount,d.fundAmount,d.scaleNetOpen,d.incidenceHorizonGap,d.historical,d.laterApplied,d.horizonEstimate?.year,d.scaled])]);
  if(key===growthRenderKey&&growthSnapshot)return;
  growthRenderKey=key;
  growthSnapshot=growthCalculate(chosen);
  renderGrowthChart();renderGrowthCoverage();
}
function initGrowth(){
  const b=growthModel.baseline,m=growthModel.fiscalMultipliers,n=v=>v.toLocaleString('fi-FI'),billion=v=>(v/1000).toLocaleString('fi-FI');
  // Employment-only parameters do not move the GDP curve.
  const parameters=Object.entries(growthModel.parameters).filter(([key])=>!['labourElasticity','fteHours'].includes(key)).map(([,p])=>p);
  q('.sp-growth-method-content').innerHTML=`<h4>Laskentatapa</h4>`+growthModel.method.map(t=>`<p>${esc(t)}</p>`).join('')+
    `<h4>Kalibrointi</h4><p>${esc(m.basis)}</p>${growthGroupTable(Object.values(m.groups),true)}`+
    `${Object.values(m.unestimated).map(u=>`<p><strong>${esc(u.label)}: ei arviota.</strong> ${esc(u.note)}</p>`).join('')}<p><strong>${esc(m.kelaPensions.label)}: ostovoiman kautta.</strong> ${esc(m.kelaPensions.note)}</p>`+
    `<p>${esc(m.impulseResponses.note)} ${esc(m.limit)}</p><p>${growthLinks(m.sourceIds)}, s. ${esc(m.page)}</p>`+
    `<h4>Oletukset</h4>`+
    parameters.map(p=>`<details><summary>${esc(p.label)}: ${n(p.value)}${p.low!==undefined?` (vaihteluväli ${n(p.low)}–${n(p.high)})`:''}</summary><p>${esc(p.basis)}</p>${p.sourceIds?`<p>${growthLinks(p.sourceIds)}</p>`:''}</details>`).join('')+
    `<h4>Vertailutalous · ${b.referenceYear}</h4><p>BKT ${billion(b.gdpMillion)} mrd. €, kotitalouksien kulutus ${billion(b.consumptionMillion)} mrd. €, yritysten investoinnit ilman asuntoja ${billion(b.investmentMillion)} mrd. €, pääomakanta ${billion(b.capitalMillion)} mrd. €.</p><p>${growthLinks(Object.keys(b.sources))}</p>`+
    `<h4>Koulutusmenot</h4><p>${esc(growthModel.education.note)}</p><p>${growthLinks(growthModel.education.sourceIds)}</p>`;
  new ResizeObserver(()=>{if(growthSnapshot)renderGrowthChart();}).observe(q('.sp-growth-plot-wrap'));
}
