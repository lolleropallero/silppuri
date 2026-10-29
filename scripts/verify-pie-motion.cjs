const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8');
let clock=0,serial=0,reduced=false;
const frames=new Map(),elements=new Map();
class Element {
  constructor(){this.attrs={};this.dataset={};this.style={setProperty(){}};this.classList={toggle(){}};this.paths=[];this.children=new Map();}
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k]??null;}
  set innerHTML(html){this.html=html;this.paths=[...html.matchAll(/<path\b([^>]*)>/g)].map(match=>{const p=new Element();for(const attr of match[1].matchAll(/([\w-]+)="([^"]*)"/g))p.setAttribute(attr[1],attr[2]);return p;});}
  get innerHTML(){return this.html||'';}
  querySelectorAll(selector){return selector==='path'?this.paths:this.paths.filter(p=>p.attrs['data-piece']);}
  querySelector(key){if(!this.children.has(key))this.children.set(key,new Element());return this.children.get(key);}
  insertAdjacentHTML(_,html){this.html+=html;}
  animate(){return {cancel(){}};}
}
const q=key=>{if(!elements.has(key))elements.set(key,new Element());return elements.get(key);};
const ctx=vm.createContext({q,root:new Element(),target:10000,design:{thickness:72},valueOf:d=>d.amount??0,moneyLabel:String,esc:String,
  pieInteraction:{setParts(){}},
  activeFlow:null,payerGroups:[{id:'a',name:'A'},{id:'b',name:'B'}],selectedOverlaps:()=>[],
  window:{matchMedia:()=>({get matches(){return reduced;}})},performance:{now:()=>clock},
  requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame:id=>frames.delete(id),
  getComputedStyle:p=>({fill:p.attrs.fill,stroke:p.attrs.stroke})});
const run=s=>vm.runInContext(s,ctx);
run("let pieRenderKey='',pieFrame=0,piePainted=[],pieColourAnimations=[];");
run(source.slice(source.indexOf('  function slice('),source.indexOf('  const payerGroups=')));
run(source.slice(source.indexOf('  function drawPie('),source.indexOf('  function render(announce=')));
const chosen=[{id:'large-a',flow:'a',type:'tax',amount:4800,title:'A',short:'A'},
  {id:'large-b',flow:'b',type:'cut',amount:6000,title:'B',short:'B'},
  {id:'small-a',flow:'a',type:'tax',amount:21,title:'Small A',short:'Small A'},
  {id:'small-b',flow:'b',type:'cut',amount:30,title:'Small B',short:'Small B'}];
const pose=()=>run('piePainted.map(({id,ring,start,end,inner,outer,path})=>({id,ring,start,end,inner,outer,path}))');
const outer=id=>pose().find(p=>p.id===id).outer;
function advance(time){clock=time;const jobs=[...frames.values()];frames.clear();jobs.forEach(fn=>fn(clock));}
ctx.drawPie(chosen);assert.equal(frames.size,0,'initial appearance is immediate');
const normalView=q('.sp-chart svg').attrs.viewBox,normalAspect=q('.sp-chart').style.aspectRatio;
const normal=pose(),normalA=outer('large-a'),normalB=outer('large-b');
ctx.activeFlow='a';ctx.drawPie(chosen,true);
assert.equal(outer('large-a'),normalA,'start from the visible radius');
assert.equal(q('.sp-chart svg').attrs.viewBox,normalView,'viewport starts from the visible crop');
advance(100);
assert.notEqual(q('.sp-chart svg').attrs.viewBox,normalView,'viewport moves with the slices');
assert.equal(q('.sp-chart').style.aspectRatio,normalAspect,'focusing does not change the card height');
const inFlight=outer('large-a');assert.ok(inFlight>normalA);assert.ok(outer('large-b')<normalB);
const normalRing=normal.find(p=>p.ring===1).inner;
const movingRing=pose().find(p=>p.ring===1).inner;
assert.equal(movingRing,normalRing,'focus keeps turns on the same hole');
assert.equal(q('.sp-tracks').paths.length,1,'only one background track, even above 10bn');
assert.equal(q('.sp-tracks').paths[0].attrs.d,ctx.slice(0,1,movingRing+10,movingRing));
assert.equal(frames.size,1);
const sameNode=pose()[0].path;
ctx.drawPie(chosen); // Equivalent to the saved-state echo's draw during render().
assert.equal(pose()[0].path,sameNode,'host echo must not replace the animated DOM');
assert.equal(outer('large-a'),inFlight);assert.equal(frames.size,1,'host echo must not stop the frame loop');
advance(180);assert.ok(outer('large-a')>inFlight);
const interrupted=pose();
const interruptedView=q('.sp-chart svg').attrs.viewBox;
ctx.activeFlow='b';ctx.drawPie(chosen,true);
assert.equal(q('.sp-chart svg').attrs.viewBox,interruptedView,'rapid reversals also resume from the visible viewport');
for(const p of pose()){
  const mid=(p.start+p.end)/2,prior=interrupted.find(o=>o.id===p.id&&o.ring===p.ring&&o.start<=mid&&o.end>=mid);
  assert.equal(p.outer,prior.outer,'rapid reversal starts at the current radius, including split Muut pieces');
}
advance(700);assert.equal(frames.size,0);
const focusedB=ctx.piePresentation(chosen,10851,72,'b');
for(const p of pose())assert.equal(p.outer,focusedB.parts.find(o=>o.id===p.id&&o.ring===p.ring&&o.start===p.start&&o.end===p.end).outer);
ctx.activeFlow=null;ctx.drawPie(chosen,true);advance(800);
assert.ok(outer('large-a')<normalA,'returning to normal passes through an intermediate size');
advance(1200);
q('.sp-chart svg').attrs.viewBox.split(' ').map(Number).forEach((value,i)=>assert.ok(Math.abs(value-Number(normalView.split(' ')[i]))<1e-8,'clearing focus restores the tight crop'));
for(const p of pose())assert.equal(p.outer,normal.find(o=>o.id===p.id&&o.ring===p.ring&&o.start===p.start).outer);
assert.equal(pose().filter(p=>p.id==='small-actions').length,1,'Muut merges back into one slice');
reduced=true;ctx.activeFlow='a';ctx.drawPie(chosen,true);assert.equal(frames.size,0,'reduced motion skips animation');
reduced=false;ctx.activeFlow='b';ctx.drawPie(chosen,true);advance(1300);
chosen[0].amount=5000;ctx.drawPie(chosen);assert.equal(frames.size,0,'a new fiscal scenario cancels obsolete frames');
advance(2000);assert.ok(pose().every(p=>!p.path.attrs.d.includes('NaN')));
// A negative small group must remain visible after the final animation frame.
const signed=[chosen[0],{...chosen[2],amount:-21}];
ctx.activeFlow=null;ctx.drawPie(signed);ctx.activeFlow='a';ctx.drawPie(signed,true);advance(2500);
assert.match(q('.sp-slices').innerHTML,/stroke-dasharray="3 2"/);
console.log('PASS: intermediate growth/shrinkage, saved-state echo, quick reversals, mixed Muut slices, multiple rings, reduced motion and cancellation.');
