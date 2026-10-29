// Draw from the calculator's data, not a screenshot of the current scroll position.
// No network images, external fonts, DOM rasterizer or analytics service is needed.
function shareCardAmount(d){
  return cardAmountDisplay(d).text;
}
function createShareImage(chosen,name,later,link){
  const qr=createShareQr(link);
  const canvas=document.createElement('canvas');canvas.width=1200;
  let ctx=canvas.getContext('2d');
  const color={ink:'#202820',muted:'#62695f',paper:'#f5f3ed',panel:'#fffefa',track:'#e4e7dc',cut:'#ed2b36',tax:'#5068c8',small:'#9548c6',indirect:'#bf7816'};
  const font=(size,bold=false)=>{ctx.font=(bold?'700 ':'400 ')+size+'px Arial, Helvetica, sans-serif';};
  const lines=(text,width,size,bold=false)=>{
    font(size,bold);const out=[];let line='';
    for(const word of String(text).split(/\s+/)){
      if(line&&ctx.measureText(line+' '+word).width>width){out.push(line);line='';}
      // A name may contain a long unbroken word.
      for(const ch of (line?' ':'')+word){if(ctx.measureText(line+ch).width>width){out.push(line);line='';}line+=ch;}
    }
    if(line)out.push(line);return out;
  };
  const text=(value,x,y,size=20,bold=false,fill=color.ink,align='left')=>{
    font(size,bold);ctx.fillStyle=fill;ctx.textAlign=align;ctx.fillText(String(value),x,y);ctx.textAlign='left';
  };
  const rect=(x,y,w,h,fill)=>{ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);};
  const panel=(x,y,w,h)=>{ctx.fillStyle=color.panel;ctx.beginPath();ctx.roundRect(x,y,w,h,16);ctx.fill();};
  const dot=(x,y,fill)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();};
  const result=calculateIncidence(chosen,incidenceModel),sum=chosen.reduce((n,d)=>n+valueOf(d),0);
  const summary=packageSummary(chosen,result);
  const groups=payerGroups.filter(g=>chosen.some(d=>d.flow===g.id)).map(g=>({...g,display:payerDisplay(chosen.filter(d=>d.flow===g.id))}));
  const titleLines=lines(shareTitle(name),680,42,true);
  const totalY=126+(titleLines.length-1)*48+70,profileY=totalY+38;
  const profileLines=lines(summary.profile.name,680,28,true);
  const captionLines=lines(summary.tone.text,680,23);
  const captionY=profileY+(profileLines.length-1)*32+32;
  const summaryLines=lines(summary.description,680,21);
  const summaryY=captionY+captionLines.length*28+18;
  const largestLines=lines(summary.largest,680,18,true),largestY=summaryY+summaryLines.length*26+12;
  const head=Math.max(512,largestY+largestLines.length*24+24);
  const groupHeight=groups.reduce((n,g)=>n+32+(g.display.marked?16:0),64);
  const topHeight=Math.max(448,groupHeight);
  const chartsY=head+topHeight+24,chartHeight=548;
  const chartEntries=result.entries.filter(e=>['cash','indirect'].includes(e.channel));
  const hasMoney=chartEntries.length>0&&result.householdRows.some(r=>Math.abs(r.low)>1e-9||Math.abs(r.high)>1e-9);
  const hasServices=result.serviceEntries.length>0&&result.serviceTotal>1e-9;
  const chartSections=[...(hasMoney?[false]:[]),...(hasServices?[true]:[])];
  const height=chartsY+(chartSections.length?chartHeight:0)+32;
  // The image ends after the summary charts, regardless of the number of actions.
  canvas.height=Math.ceil(height);ctx=canvas.getContext('2d');ctx.textBaseline='alphabetic';
  rect(0,0,1200,canvas.height,color.paper);
  const logo=root.querySelector('.sp-wordmark .sp-logo');
  ctx.save();ctx.translate(48,28);ctx.scale(34/512,34/512);ctx.fillStyle=color.ink;
  for(const path of logo.querySelectorAll('path'))ctx.fill(new Path2D(path.getAttribute('d')));
  ctx.restore();
  text('SILPPURI',94,54,23,true);text('Silputaan Suomi kuntoon!',1152,54,22,true,color.ink,'right');
  rect(48,77,1104,2,color.ink);
  titleLines.forEach((line,i)=>text(line,48,126+i*48,42,true));
  text(shareTotal(sum),48,totalY,64,true);
  profileLines.forEach((line,i)=>text(line,48,profileY+i*32,28,true));
  captionLines.forEach((line,i)=>text(line,48,captionY+i*28,23));
  summaryLines.forEach((line,i)=>text(line,48,summaryY+i*26,21));
  largestLines.forEach((line,i)=>text(line,48,largestY+i*24,18,true));
  drawShareQr(ctx,qr,764,100,388);
  panel(48,head,542,topHeight);panel(614,head,538,topHeight);
  text(later?'2031 + myöhemmät':'2031',566,head+43,17,true,color.muted,'right');
  const chart=piePresentation(chosen,sum,72,null),view=pieViewport(chart);
  const px=64,py=head+60,pw=510,ph=Math.min(topHeight-130,440),scale=Math.min(pw/view.width,ph/view.height);
  ctx.save();ctx.translate(px+(pw-view.width*scale)/2-view.x*scale,py+(ph-view.height*scale)/2-view.y*scale);ctx.scale(scale,scale);
  ctx.fillStyle=color.track;ctx.fill(new Path2D(slice(0,1,chart.inner+10,chart.inner)));
  for(const p of chart.parts){const paint=piePalette(p.kind,p.ring);ctx.fillStyle=paint.fill;ctx.strokeStyle=paint.edge;ctx.lineWidth=p.kind==='small'?1:4;const path=new Path2D(slice(p.start,p.end,p.outer,p.inner));ctx.fill(path);ctx.stroke(path);}
  const cx=160,cy=160;font(34,true);ctx.fillStyle=color.ink;ctx.textAlign='center';ctx.fillText(format(sum),cx,cy+3);font(17);ctx.fillText('mrd. €',cx,cy+27);ctx.restore();
  dot(78,head+topHeight-32,color.cut);text('Menoleikkaukset',92,head+topHeight-26,16);
  dot(252,head+topHeight-32,color.tax);text('Verot ja maksut',266,head+topHeight-26,16);
  const smallLabel=smallSliceLabel(chart,sum);
  if(smallLabel){dot(426,head+topHeight-32,color.small);text(smallLabel,440,head+topHeight-26,16,true,color.small);}
  text('Kuka maksaa?',640,head+43,24,true);
  const maxGroup=Math.max(1,...groups.map(g=>Math.abs(g.display.amount||0)));let gy=head+74;
  for(const g of groups){
    text(g.name,640,gy,17,true);text(moneyLabel(g.display.amount)+(g.display.marked?' *':''),1126,gy,17,true,color.ink,'right');
    rect(640,gy+8,486,7,color.track);
    if(Number.isFinite(g.display.amount)){
      const items=chosen.filter(d=>d.flow===g.id),deferred=items.every(d=>valueOf(d)===0);
      let x=640;
      for(const type of ['cut','tax']){
        const amount=items.filter(d=>d.type===type).reduce((n,d)=>n+(deferred&&d.horizonEstimate&&!d.laterApplied?d.horizonEstimate.amount:valueOf(d)),0);
        const width=Math.abs(amount)/maxGroup*486;rect(x,gy+8,width,7,color[type]);x+=width;
      }
    }
    if(g.display.marked){text('* '+g.display.dates.join(' · '),640,gy+30,13,false,color.muted);gy+=16;}gy+=32;
  }
  function drawDeciles(x,service,width){
    const rows=service?result.serviceRows:result.householdRows;
    const count=service?result.serviceEntries.length:chartEntries.length;
    panel(x,chartsY,width,chartHeight);
    text(service?'Julkiset palvelut':'Rahat ja ostovoima',x+24,chartsY+42,26,true);
    text(service?'Arvio palvelujen käytön perusteella':'Arvio menetyksestä suhteessa nettotuloihin',x+24,chartsY+73,18);
    text(service?'Osuus leikkauksista · ei mitattu menetys':'Osin vastaavista toimista arvioitu jakauma',x+24,chartsY+98,16,false,color.muted);
    text('Yksin asuva · nettotulot 2024',x+24,chartsY+126,16,false,color.muted);
    const values=rows.map((r,i)=>service?{mid:r.share,low:r.shareLow,high:r.shareHigh,parts:[[color.cut,r.share]]}:
      {mid:r.mid/incidenceModel.income[i]*100,low:r.percentLow,high:r.percentHigh,parts:[[color.cut,r.cut],[color.tax,r.tax],[color.indirect,r.indirect]].map(([c,v])=>[c,v/incidenceModel.income[i]*100])});
    const labels=values.map(v=>!count?'—':service?shareLabel(v.mid):chartPercent(v.mid));
    font(16,true);
    const labelWidth=Math.max(...labels.map(label=>ctx.measureText(label).width));
    const min=Math.min(0,...values.map(v=>v.low)),max=Math.max(1,...values.map(v=>v.high)),barWidth=width-228-labelWidth-18;
    const position=n=>(n-min)/(max-min)*barWidth;
    values.forEach((v,i)=>{
      const y=chartsY+143+i*36;rect(x+12,y-3,width-24,36,i%2?'#ebece4':'#f7f7f1');
      text(decileName(i),x+24,y+13,16,true);text(decileIncomeRange(i),x+24,y+29,12,false,color.muted);
      const bx=x+200,by=y+4;rect(bx,by,barWidth,26,color.track);
      if(count){
        let positive=0,negative=0;for(const [c,n] of v.parts){const from=n>=0?positive:negative;if(n>=0)positive+=n;else negative+=n;rect(bx+position(Math.min(from,from+n)),by,Math.abs(n)/(max-min)*barWidth,26,c);}
        ctx.strokeStyle=color.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx+position(v.low),by+13);ctx.lineTo(bx+position(v.high),by+13);ctx.moveTo(bx+position(v.low),by+7);ctx.lineTo(bx+position(v.low),by+19);ctx.moveTo(bx+position(v.high),by+7);ctx.lineTo(bx+position(v.high),by+19);ctx.stroke();
      }
      text(labels[i],x+width-28,by+19,16,true,color.ink,'right');
    });
    if(!service){dot(x+30,chartsY+521,color.cut);text('Etuudet',x+43,chartsY+527,16);dot(x+150,chartsY+521,color.tax);text('Verot',x+163,chartsY+527,16);dot(x+253,chartsY+521,color.indirect);text('Yritysten kautta',x+266,chartsY+527,16);}
  }
  chartSections.forEach((service,i)=>drawDeciles(48+i*566,service,chartSections.length===1?1104:542));
  return canvas;
}
