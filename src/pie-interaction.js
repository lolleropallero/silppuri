function nearestPiePart(parts,x,y,tolerance){
  const dx=x-160,dy=y-160,radius=Math.hypot(dx,dy);
  const angle=(Math.atan2(dx,-dy)/(2*Math.PI)+1)%1;
  let nearest=null,best=tolerance;
  // Parts arrive in paint order. Hit the visible front slice first when
  // successive turns overlap; the protruding back rim remains selectable.
  for(const part of [...parts].reverse()){
    let distance;
    if(part.end-part.start>=.999999||(angle>=part.start&&angle<=part.end)){
      distance=Math.max(part.inner-radius,radius-part.outer,0);
    }else{
      distance=Math.min(...[part.start,part.end].map(t=>{
        const sx=Math.sin(t*2*Math.PI),sy=-Math.cos(t*2*Math.PI);
        const r=Math.max(part.inner,Math.min(part.outer,dx*sx+dy*sy));
        return Math.hypot(dx-r*sx,dy-r*sy);
      }));
    }
    if(distance<=best){nearest=part;best=distance;if(distance===0)break;}
  }
  return nearest;
}
function createPieInteraction(chart,{moneyLabel,getVisibleFrame,measureViewport}){
  const svg=chart.querySelector('svg'),hit=document.createElement('button'),tip=document.createElement('div');
  hit.type='button';hit.className='sp-pie-hit cursor-interaction';
  hit.setAttribute('aria-label','Piirakan siivut. Siirry nuolinäppäimillä, sulje Esc-näppäimellä.');
  hit.setAttribute('aria-controls','sp-pie-tip');hit.setAttribute('aria-expanded','false');
  tip.id='sp-pie-tip';tip.className='sp-pie-tip';tip.hidden=true;tip.setAttribute('role','status');
  const title=document.createElement('span'),amount=document.createElement('strong');tip.append(title,amount);chart.append(hit,tip);
  let parts=[],pinned=null,anchor=null;
  const key=part=>part.id+':'+part.items.map(d=>d.id).sort().join(',');
  const clear=()=>{pinned=null;anchor=null;tip.hidden=true;hit.setAttribute('aria-expanded','false');hit.removeAttribute('aria-describedby');};
  function position(){
    if(!anchor)return;
    const box=chart.getBoundingClientRect(),frame=getVisibleFrame();
    if(box.top>=frame.top+frame.height||box.top+box.height<=frame.top){tip.hidden=true;return;}
    tip.hidden=false;
    const left=Math.max(4,Math.min(box.width-tip.offsetWidth-4,anchor.x-tip.offsetWidth/2));
    const topLimit=Math.max(4,frame.top-box.top+4),bottomLimit=Math.min(box.height-4,frame.top+frame.height-box.top-4);
    let top=anchor.y-tip.offsetHeight-18;
    if(top<topLimit)top=anchor.y+22;
    top=Math.max(topLimit,Math.min(bottomLimit-tip.offsetHeight,top));
    tip.style.left=left+'px';tip.style.top=top+'px';
  }
  function show(part,x,y,pin){
    const box=chart.getBoundingClientRect();
    title.textContent=part.id==='small-actions'?'Pienet toimet':part.items[0].title;
    amount.textContent=moneyLabel(part.items.reduce((n,d)=>n+(d.amount||0),0));
    tip.setAttribute('aria-live',pin?'polite':'off');tip.hidden=false;
    anchor={x:x-box.left,y:y-box.top};pinned=pin?key(part):null;
    hit.setAttribute('aria-expanded',String(pin));
    if(pin)hit.setAttribute('aria-describedby',tip.id);
    position();if(pin)measureViewport();
  }
  function hitPart(event){
    const box=svg.getBoundingClientRect(),view=svg.viewBox.baseVal;
    if(!box.width)return null;
    return nearestPiePart(parts,view.x+(event.clientX-box.left)*view.width/box.width,view.y+(event.clientY-box.top)*view.height/box.height,22*view.width/box.width);
  }
  function keyboardSelect(offset){
    const unique=[...new Map(parts.map(p=>[key(p),p])).values()];if(!unique.length)return;
    const index=unique.findIndex(p=>key(p)===pinned);
    const part=unique[index<0?(offset>0?0:unique.length-1):(index+offset+unique.length)%unique.length];
    const box=svg.getBoundingClientRect(),view=svg.viewBox.baseVal;
    const t=(part.start+part.end)*Math.PI,r=(part.inner+part.outer)/2;
    show(part,box.left+(160+r*Math.sin(t)-view.x)/view.width*box.width,box.top+(160-r*Math.cos(t)-view.y)/view.height*box.height,true);
  }
  hit.addEventListener('click',event=>{
    if(event.detail===0){if(pinned)clear();else keyboardSelect(1);return;}
    const part=hitPart(event);
    if(!part||pinned===key(part)){clear();return;}
    show(part,event.clientX,event.clientY,true);
  });
  hit.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||pinned)return;
    const part=hitPart(event);if(part)show(part,event.clientX,event.clientY,false);else clear();
  });
  hit.addEventListener('pointerleave',()=>{if(!pinned)clear();});
  hit.addEventListener('keydown',event=>{
    if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key)){event.preventDefault();keyboardSelect(event.key==='ArrowRight'||event.key==='ArrowDown'?1:-1);}
  });
  document.addEventListener('click',event=>{if(!chart.contains(event.target))clear();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')clear();});
  window.addEventListener('resize',clear);
  return {position,setParts(next){clear();parts=next;hit.disabled=!next.length;}};
}
