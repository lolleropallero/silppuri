// Draw from the calculator's data, not a screenshot of the current scroll position.
// No network images, external fonts, DOM rasterizer or analytics service is needed.
function shareCardAmount(d){
  return cardAmountDisplay(d).text;
}
function createShareImage(chosen,name,later,href){
  const canvas=document.createElement('canvas');canvas.width=1200;
  let ctx=canvas.getContext('2d');
  const color={ink:'#202820',muted:'#62695f',paper:'#f5f3ed',panel:'#fffefa',track:'#e4e7dc',cut:'#ed2b36',tax:'#5068c8',small:'#9548c6',indirect:'#bf7816'};
  const font=(size,bold=false)=>{ctx.font=(bold?'700 ':'400 ')+size+'px Arial, Helvetica, sans-serif';};
  const lines=(text,width,size,bold=false)=>{
    font(size,bold);const out=[];let line='';
    for(const word of String(text).split(/\s+/)){
      if(line&&ctx.measureText(line+' '+word).width>width){out.push(line);line='';}
      // Names and URLs may contain a long unbroken word.
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
  const summary=packageSummary(chosen);
  const groups=payerGroups.filter(g=>chosen.some(d=>d.flow===g.id)).map(g=>({...g,display:payerDisplay(chosen.filter(d=>d.flow===g.id))}));
  const titleLines=lines(shareTitle(name),1104,48,true);
  const totalY=144+(titleLines.length-1)*56+78,profileY=totalY+50;
  const captionLines=lines(summary.tone.text,1104,23);
  const captionY=profileY+34;
  const summaryLines=lines(summary.description,960,23);
  const summaryY=captionY+captionLines.length*28+18;
  const head=summaryLines.length?summaryY+(summaryLines.length-1)*30+64:captionY+captionLines.length*28+56;
  const groupHeight=groups.reduce((n,g)=>n+62+(g.display.marked?24:0),92);
  const topHeight=Math.max(560,groupHeight);
  const chartsY=head+topHeight+28,chartHeight=790;
  const chartEntries=result.entries.filter(e=>['cash','indirect'].includes(e.channel));
  const cardsY=chartsY+chartHeight+82;
  const columns=chosen.length>40?3:2,gap=18,cardWidth=(1104-gap*(columns-1))/columns;
  const sorted=[...chosen].sort((a,b)=>(a.type===b.type?valueOf(b)-valueOf(a):a.type==='cut'?-1:1));
  const cardGroups=[
    {title:'Summassa mukana',items:sorted.filter(d=>Number.isFinite(d.amount))},
    {title:'Nettoarvio puuttuu – ei laskettu summaan',items:sorted.filter(d=>!Number.isFinite(d.amount))}
  ].filter(group=>group.items.length);
  const makeCard=d=>{
    const title=lines(d.title,cardWidth-36,22,true);
    const display=cardAmountDisplay(d),amountLines=display.hasAmount?lines(display.text,cardWidth-36,22,true):[];
    return {d,title,amountLines,height:34+title.length*28+(amountLines.length?14+amountLines.length*28:0)+18};
  };
  let nextY=cardsY;
  for(const [i,group] of cardGroups.entries()){
    if(i)nextY+=58;
    group.y=nextY;group.cards=group.items.map(makeCard);group.rowHeights=[];
    for(let j=0;j<group.cards.length;j+=columns)group.rowHeights.push(Math.max(...group.cards.slice(j,j+columns).map(c=>c.height)));
    nextY+=group.rowHeights.reduce((n,h)=>n+h+gap,0);
  }
  const height=nextY+30;
  // Bounded by the catalogue, not user supplied bitmap dimensions.
  canvas.height=Math.ceil(height);ctx=canvas.getContext('2d');ctx.textBaseline='alphabetic';
  rect(0,0,1200,canvas.height,color.paper);
  const logo=root.querySelector('.sp-wordmark .sp-logo');
  ctx.save();ctx.translate(48,28);ctx.scale(34/512,34/512);ctx.fillStyle=color.ink;
  for(const path of logo.querySelectorAll('path'))ctx.fill(new Path2D(path.getAttribute('d')));
  ctx.restore();
  text('SILPPURI',94,54,23,true);text('Silputaan Suomi kuntoon!',1152,54,22,true,color.ink,'right');
  rect(48,77,1104,2,color.ink);
  titleLines.forEach((line,i)=>text(line,600,144+i*56,48,true,color.ink,'center'));
  text(shareTotal(sum),600,totalY,64,true,color.ink,'center');
  text(summary.profile.name,600,profileY,30,true,color.ink,'center');
  captionLines.forEach((line,i)=>text(line,600,captionY+i*28,23,false,color.ink,'center'));
  summaryLines.forEach((line,i)=>text(line,600,summaryY+i*30,23,false,color.ink,'center'));
  if(href){
    try{
      const address=new URL(href);
      if(['http:','https:'].includes(address.protocol)){
        const local=['localhost','127.0.0.1','[::1]'].includes(address.hostname);
        const label=(local?'Paikallinen esikatselu · ':'')+address.host+address.pathname;
        let size=16;while(size>10&&(font(size),ctx.measureText(label).width>1104))size--;
        text(label,600,head-20,size,false,color.muted,'center');
      }
    }catch{}
  }
  panel(48,head,542,topHeight);panel(614,head,538,topHeight);
  text(later?'2031 + myöhemmät':'2031',566,head+43,17,true,color.muted,'right');
  const chart=piePresentation(chosen,sum,72,null),view=pieViewport(chart);
  const px=64,py=head+70,pw=510,ph=Math.min(topHeight-150,540),scale=Math.min(pw/view.width,ph/view.height);
  ctx.save();ctx.translate(px+(pw-view.width*scale)/2-view.x*scale,py+(ph-view.height*scale)/2-view.y*scale);ctx.scale(scale,scale);
  for(const ring of chart.rings){ctx.fillStyle=color.track;ctx.fill(new Path2D(slice(0,1,ring.inner+10,ring.inner)));}
  for(const p of chart.parts){ctx.fillStyle=color[p.kind];ctx.strokeStyle=p.kind==='cut'?'#9c1b27':p.kind==='tax'?'#2e4089':'#60358b';ctx.lineWidth=p.kind==='small'?1:4;const path=new Path2D(slice(p.start,p.end,p.outer,p.inner));ctx.fill(path);ctx.stroke(path);}
  const cx=160,cy=160;font(34,true);ctx.fillStyle=color.ink;ctx.textAlign='center';ctx.fillText(format(sum),cx,cy+3);font(17);ctx.fillText('mrd. €',cx,cy+27);ctx.restore();
  dot(78,head+topHeight-32,color.cut);text('Menoleikkaukset',92,head+topHeight-26,16);
  dot(252,head+topHeight-32,color.tax);text('Verot ja maksut',266,head+topHeight-26,16);
  const smallLabel=smallSliceLabel(chart,sum);
  if(smallLabel){dot(426,head+topHeight-32,color.small);text(smallLabel,440,head+topHeight-26,16,true,color.small);}
  text('Kuka maksaa?',640,head+43,24,true);
  const maxGroup=Math.max(1,...groups.map(g=>Math.abs(g.display.amount||0)));let gy=head+86;
  for(const g of groups){
    text(g.name,640,gy,17,true);text(payerMoneyLabel(g.display.amount)+(g.display.marked?' *':''),1126,gy+26,20,true,color.ink,'right');
    rect(640,gy+10,240,20,color.track);
    if(Number.isFinite(g.display.amount)){
      const items=chosen.filter(d=>d.flow===g.id),deferred=items.every(d=>valueOf(d)===0);
      let x=640;
      for(const type of ['cut','tax']){
        const amount=items.filter(d=>d.type===type).reduce((n,d)=>n+(deferred&&d.horizonEstimate&&!d.laterApplied?d.horizonEstimate.amount:valueOf(d)),0);
        const width=Math.abs(amount)/maxGroup*240;rect(x,gy+10,width,20,color[type]);x+=width;
      }
    }
    if(g.display.marked){text('* '+g.display.dates.join(' · '),640,gy+52,16,false,color.muted);gy+=24;}gy+=62;
  }
  function drawDeciles(x,service){
    const rows=service?result.serviceRows:result.householdRows;
    const count=service?result.serviceEntries.length:chartEntries.length;
    panel(x,chartsY,542,chartHeight);
    text(service?'Julkiset palvelut':'Rahat ja ostovoima',x+24,chartsY+42,26,true);
    text(service?'Arvio palvelujen käytön perusteella':'Arvio menetyksestä suhteessa nettotuloihin',x+24,chartsY+73,18);
    text(service?'Osuus leikkauksista · ei mitattu menetys':'Osin vastaavista toimista arvioitu jakauma',x+24,chartsY+98,16,false,color.muted);
    text(count+' / '+chosen.length+' toimea · yksin asuva · nettotulot 2024',x+24,chartsY+126,16,false,color.muted);
    const values=rows.map((r,i)=>service?{mid:r.share,low:r.shareLow,high:r.shareHigh,parts:[[color.cut,r.share]]}:
      {mid:r.mid/incidenceModel.income[i]*100,low:r.percentLow,high:r.percentHigh,parts:[[color.cut,r.cut],[color.tax,r.tax],[color.indirect,r.indirect]].map(([c,v])=>[c,v/incidenceModel.income[i]*100])});
    const labels=values.map(v=>!count?'—':service?shareLabel(v.mid):chartPercent(v.mid));
    font(16,true);
    const labelWidth=Math.max(...labels.map(label=>ctx.measureText(label).width));
    const min=Math.min(0,...values.map(v=>v.low)),max=Math.max(1,...values.map(v=>v.high)),barWidth=314-labelWidth-18;
    const position=n=>(n-min)/(max-min)*barWidth;
    values.forEach((v,i)=>{
      const y=chartsY+151+i*57;rect(x+12,y-3,518,57,i%2?'#ebece4':'#f7f7f1');
      text(decileName(i),x+24,y+19,16,true);text(decileIncomeRange(i),x+24,y+40,13,false,color.muted);
      const bx=x+200,by=y+8;rect(bx,by,barWidth,26,color.track);
      if(count){
        let positive=0,negative=0;for(const [c,n] of v.parts){const from=n>=0?positive:negative;if(n>=0)positive+=n;else negative+=n;rect(bx+position(Math.min(from,from+n)),by,Math.abs(n)/(max-min)*barWidth,26,c);}
        ctx.strokeStyle=color.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx+position(v.low),by+13);ctx.lineTo(bx+position(v.high),by+13);ctx.moveTo(bx+position(v.low),by+7);ctx.lineTo(bx+position(v.low),by+19);ctx.moveTo(bx+position(v.high),by+7);ctx.lineTo(bx+position(v.high),by+19);ctx.stroke();
      }
      text(labels[i],x+514,by+19,16,true,color.ink,'right');
    });
    if(!service){dot(x+30,chartsY+751,color.cut);text('Etuudet',x+43,chartsY+757,16);dot(x+150,chartsY+751,color.tax);text('Verot',x+163,chartsY+757,16);dot(x+253,chartsY+751,color.indirect);text('Yritysten kautta',x+266,chartsY+757,16);}
  }
  drawDeciles(48,false);drawDeciles(614,true);
  for(const group of cardGroups){
    text(group.title+' · '+group.items.length+' toimea',48,group.y-22,28,true);
    let cyCards=group.y;
    group.cards.forEach((c,i)=>{
      const col=i%columns,x=48+col*(cardWidth+gap),h=group.rowHeights[Math.floor(i/columns)];panel(x,cyCards,cardWidth,h);
      rect(x,cyCards+16,5,h-32,color[c.d.type]);let y=cyCards+32;
      c.title.forEach(line=>{text(line,x+18,y,22,true);y+=28;});y+=14;
      c.amountLines.forEach(line=>{text(line,x+18,y,22,true,color[c.d.type]);y+=28;});
      if(col===columns-1||i===group.cards.length-1)cyCards+=h+gap;
    });
  }
  return canvas;
}
