"""Build isolated browser fixtures with 200/254 cards, including conflicting options.

Run after build.py. Fixtures are for layout/load testing, not fiscal proposals.
They never change production selection rules or the user's saved package.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
site = ROOT / 'tmp/local-site'
page = (site / 'index.html').read_text(encoding='utf8')
actions = json.loads((ROOT / 'data/catalogue.json').read_text(encoding='utf8'))['actions']

# Record the actual Canvas calls and expose results as ordinary page content.
instrumentation = r'''
const stressMetrics={expected:STRESS_COUNT,renderedCards:0,cardTextOverflows:[],canvasTextOverflows:[],cardsOutsideCanvas:[]};
const originalShareImage=createShareImage;
createShareImage=function(...args){
  Object.assign(stressMetrics,{renderedCards:0,cardTextOverflows:[],canvasTextOverflows:[],cardsOutsideCanvas:[]});
  const prototype=CanvasRenderingContext2D.prototype,oldText=prototype.fillText,oldRound=prototype.roundRect;
  let cardsY=Infinity,card=null;
  prototype.roundRect=function(x,y,w,h,...rest){
    if(y>=cardsY){card={x,y,w,h};stressMetrics.renderedCards++;
      if(x<0||y<0||x+w>this.canvas.width||y+h>this.canvas.height)stressMetrics.cardsOutsideCanvas.push(card);}
    return oldRound.call(this,x,y,w,h,...rest);
  };
  prototype.fillText=function(value,x,y,...rest){
    const m=this.measureText(value),tr=this.getTransform(),left=x-m.actualBoundingBoxLeft,right=x+m.actualBoundingBoxRight;
    const top=y-m.actualBoundingBoxAscent,bottom=y+m.actualBoundingBoxDescent;
    if(/^(Summassa mukana ·|Nettoarvio puuttuu – ei laskettu summaan$)/.test(String(value))){cardsY=y+22;card=null;}
    if(card&&(left<card.x||right>card.x+card.w||top<card.y||bottom>card.y+card.h))stressMetrics.cardTextOverflows.push(String(value));
    if(left*tr.a+tr.e<0||right*tr.a+tr.e>this.canvas.width||top*tr.d+tr.f<0||bottom*tr.d+tr.f>this.canvas.height)stressMetrics.canvasTextOverflows.push(String(value));
    return oldText.call(this,value,x,y,...rest);
  };
  const start=performance.now();
  try{const canvas=originalShareImage(...args);Object.assign(stressMetrics,{width:canvas.width,height:canvas.height,pixels:canvas.width*canvas.height,drawMs:Math.round(performance.now()-start)});return canvas;}
  finally{prototype.fillText=oldText;prototype.roundRect=oldRound;}
};
const stressObserver=new MutationObserver(()=>{
  const image=q('.sp-share-preview img');if(!image)return;
  const ready=()=>{stressMetrics.decodedWidth=image.naturalWidth;stressMetrics.decodedHeight=image.naturalHeight;
    stressMetrics.selected=selected.size;stressMetrics.linkLength=shareLink.length;
    document.getElementById('stress-metrics').textContent=JSON.stringify(stressMetrics,null,2);};
  if(image.complete)ready();else image.addEventListener('load',ready,{once:true});
});
stressObserver.observe(q('.sp-share-preview'),{childList:true});
'''

links = []
for count in [200, 254]:
    # Longest titles exercise wrapping. The 254 case also covers every action.
    chosen = sorted(actions, key=lambda d: len(d['title']), reverse=True)[:count]
    ids = [d['id'] for d in chosen]
    state = {'modelContent': {'selectedIds': ids, 'name': f'Rasitustesti · {count} korttia',
                             'includeLater': True, 'fundingChoices': {'yle': 'keep-tax', 'farm': 'save'},
                             'taxIncreasesPP': {'income': 3, 'corporate': 3}},
             'privateContent': {'catalogueViewVersion': 1, 'filter': 'selected', 'visibleCount': count}}
    start = '  loadSharedLocation();'
    assert start in page
    fixture = page.replace(start, instrumentation.replace('STRESS_COUNT', str(count)) +
        'stateIn('+json.dumps(state, ensure_ascii=False)+');\n' +
        'selected.clear();'+json.dumps(ids)+'.forEach(id=>selected.add(id));render();')
    # Persistent storage is disabled only in these standalone fixtures.
    fixture = fixture.replace('localStorage.setItem(key,JSON.stringify(next));', '')
    fixture = fixture.replace('</body>', '<details open><summary>Rasitustestin mittaukset</summary><pre id="stress-metrics">Avaa Julkaise.</pre></details></body>')
    name = f'stress-{count}.html'
    (site/name).write_text(fixture, encoding='utf8')
    links.append(f'<p><a href="{name}">{count} kortin rasitustesti</a></p>')
(site/'stress.html').write_text('<!doctype html><html lang="fi"><meta charset="utf-8"><title>Silppurin rasitustesti</title>'+''.join(links)+'</html>', encoding='utf8')
print('Fixtures: http://127.0.0.1:8765/stress.html (no production state changes)')
