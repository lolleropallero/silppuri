const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
class Element{
  constructor(){this.children=[];this.attrs={};this.handlers={};this.style={};this.offsetWidth=160;this.offsetHeight=60;}
  setAttribute(k,v){this.attrs[k]=String(v);} removeAttribute(k){delete this.attrs[k];}
  append(...children){this.children.push(...children);}
  addEventListener(k,fn){this.handlers[k]=fn;}
  getBoundingClientRect(){return {left:0,top:0,width:320,height:320};}
}
const chart=new Element(),svg=new Element(),document=new Element(),window=new Element();
svg.viewBox={baseVal:{x:0,y:0,width:320,height:320}};
chart.querySelector=()=>svg;chart.contains=target=>chart.children.includes(target);
document.createElement=()=>new Element();
const ctx=vm.createContext({document,window});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/pie-interaction.js'),'utf8'),ctx);
const interaction=ctx.createPieInteraction(chart,{moneyLabel:n=>n+' milj. €',getVisibleFrame:()=>({top:0,height:320}),measureViewport(){}});
const [hit,tip]=chart.children;
const a={id:'a',start:0,end:.25,inner:80,outer:140,items:[{id:'a',title:'Vero',amount:200}]};
const b={id:'small-actions',start:.25,end:.255,inner:80,outer:150,items:[{id:'b',title:'Pieni leikkaus',amount:21}]};
interaction.setParts([a,b]);
assert.equal(ctx.nearestPiePart([a,b],160,160,22),null,'empty centre is not a slice');
assert.equal(ctx.nearestPiePart([a,b],280,170,22),b,'nearby taps can select the narrow purple wedge');
const tap={detail:1,clientX:240,clientY:80};
hit.handlers.click(tap);assert.equal(tip.hidden,false);assert.equal(tip.children[0].textContent,'Vero');
assert.equal(tip.children[1].textContent,'200 milj. €');
hit.handlers.pointerleave();assert.equal(tip.hidden,false,'lifting a finger or leaving with the mouse keeps a pinned label');
hit.handlers.pointermove({pointerType:'mouse',clientX:20,clientY:250});assert.equal(tip.hidden,false);
hit.handlers.click({detail:1,clientX:280,clientY:170});assert.equal(tip.children[0].textContent,'Pienet toimet');
assert.equal(tip.children[1].textContent,'21 milj. €');
document.handlers.click({target:new Element()});assert.equal(tip.hidden,true,'outside click closes');
hit.handlers.pointermove({...tap,pointerType:'mouse'});assert.equal(tip.hidden,false);
hit.handlers.pointerleave();assert.equal(tip.hidden,true,'unpinned mouse hover closes');
hit.handlers.pointermove({...tap,pointerType:'touch'});assert.equal(tip.hidden,true,'touch scrolling does not open a label');
hit.handlers.click(tap);hit.handlers.click(tap);assert.equal(tip.hidden,true,'second tap toggles off');
hit.handlers.keydown({key:'ArrowLeft',preventDefault(){}});assert.equal(tip.children[0].textContent,'Pienet toimet');
hit.handlers.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(tip.children[0].textContent,'Vero');
document.handlers.keydown({key:'Escape'});assert.equal(tip.hidden,true);
hit.handlers.click({detail:0});assert.equal(tip.hidden,false,'Enter opens the first slice');
interaction.setParts([]);assert.equal(tip.hidden,true);assert.equal(hit.disabled,true);
console.log('PASS: persistent tap labels, nearest narrow slice, outside/toggle/Escape dismissal, mouse hover, touch scrolling and keyboard navigation.');
