const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8');
const ctx=vm.createContext({target:10000,valueOf:d=>d.amount??0});
vm.runInContext(source.slice(source.indexOf('  function slice('),source.indexOf('  const payerGroups=')),ctx);
const layout=values=>{
  const actions=values.map((amount,i)=>({id:String(i),amount}));
  const net=values.reduce((a,b)=>a+(b??0),0);
  const chart=ctx.ringLayout(actions,net,40);
  assert.ok(Math.abs(chart.parts.reduce((n,p)=>n+p.amount,0)-Math.max(0,net))<1e-6);
  for(let i=0;i<chart.rings.length;i++){
    const pieces=chart.parts.filter(p=>p.ring===i);
    const expected=Math.min(10000,Math.max(0,net-10000*i));
    assert.ok(Math.abs(pieces.reduce((n,p)=>n+p.amount,0)-expected)<1e-6);
    for(const p of pieces){
      assert.ok(p.start>=0&&p.end<=1&&p.end>p.start);
      assert.ok(p.outer>p.inner);
      assert.doesNotMatch(ctx.slice(p.start,p.end,p.outer,p.inner),/NaN|Infinity/);
    }
  }
  return chart;
};
for(const [amount,rings] of [[0,1],[9999,1],[10000,1],[10001,2],[20000,2],[20001,3]]){
  assert.equal(layout([amount]).rings.length,rings);
}
assert.deepEqual(Array.from(layout([25000]).parts,p=>p.amount),[10000,10000,5000]);
assert.equal(layout([6000,5000,-2000]).rings.length,1);
assert.equal(layout([6000,-7000]).parts.length,0);
assert.equal(layout([null,0]).parts.length,0);
assert.equal(layout([5000,5000,5000]).rings.length,2);
assert.equal(layout([5000,5000]).rings.length,1); // Removing an action collapses the outer ring.
const mixed=layout([30,3000]).parts;
const huge=ctx.piePresentation([{id:'medium',amount:2500,type:'cut'},{id:'huge',amount:4800,type:'cut'}],7300,72,null);
const widths=huge.parts.map(p=>p.outer-p.inner);
assert.equal(widths[0],72);
assert.ok(widths[1]>widths[0]*1.8,'4.8bn must be visibly thicker than 2.5bn');
assert.ok(huge.parts.every(p=>p.outer<huge.extent));
const sizing=maximum=>ctx.piePresentation([{id:'unchanged',amount:1000,type:'cut'},{id:'large',amount:maximum,type:'cut'},{id:'tiny',amount:30,type:'tax'}],maximum+1030,72,null);
const smaller=sizing(2500),larger=sizing(4800);
const smallerView=ctx.pieViewport(smaller),largerView=ctx.pieViewport(larger);
assert.ok(largerView.width>smallerView.width,'the bounds follow the largest visible slice');
const full=ctx.piePresentation([{id:'a',amount:5000,type:'cut'},{id:'b',amount:5000,type:'tax'}],10000,72,null);
assert.equal(ctx.pieViewport(full).width,2*(108+136+3)+24,'only 12 units of padding around visible slices, without reserving focus growth');
assert.ok(Math.abs((larger.parts[0].outer-larger.parts[0].inner)-(8+64*Math.pow(.4,.65)))<1e-8,'retain the previous thickness curve below 2.5bn');
assert.equal(mixed.find(p=>p.id==='small-actions').outer-mixed.find(p=>p.id==='small-actions').inner,2*(mixed.find(p=>p.id==='1').outer-mixed.find(p=>p.id==='1').inner));
const small=layout([21,30,40,100,3000]);
assert.equal(small.small.length,3);
assert.equal(small.parts.filter(p=>p.id==='small-actions').length,1);
assert.equal(small.parts.find(p=>p.id==='small-actions').amount,91);
assert.ok(small.parts.some(p=>p.id==='3'),'100m remains its own action');
assert.equal(layout([21]).parts[0].id,'small-actions');
assert.equal(layout([21]).parts[0].amount,21,'a lone small action keeps its true angle');
assert.equal(ctx.smallSliceLabel(layout([21]),21),'Muut 100 %');
assert.equal(ctx.smallSliceLabel(layout([30,2970]),3000),'Muut 1 %');
assert.equal(ctx.smallSliceLabel(layout([.02,2000]),2000.02),'Muut 0,001 %','tiny shares must not round to zero');
const signedSmall=layout([1000,47,-21.16]);
assert.equal(signedSmall.small.length,2);
assert.ok(Math.abs(signedSmall.parts.find(p=>p.id==='small-actions').amount-25.84)<1e-8);
const loss=layout([1000,-21.16]);
assert.equal(loss.small.length,1);
assert.ok(!loss.parts.some(p=>p.id==='small-actions'),'negative savings never fill the pie');
assert.equal(loss.parts[0].amount,978.84);
const negativeChart=ctx.piePresentation([{id:'negative',amount:-21,type:'cut'}],-21,72,null);
assert.ok(ctx.pieViewport(negativeChart).y<160-negativeChart.inner-72,'negative grouped marker stays inside the frame');
layout(Array.from({length:200},()=>103.75));
// Highlighting is presentation only: preserve annual totals and angular shares,
// including the portion of a mixed purple slice that belongs to another group.
const focusActions=[
  {id:'cut',flow:'companies',type:'cut',amount:7000},
  {id:'tax',flow:'companies',type:'tax',amount:5000},
  {id:'other',flow:'support',type:'cut',amount:3000},
  {id:'small-a',flow:'companies',type:'tax',amount:21},
  {id:'small-b',flow:'support',type:'cut',amount:30},
  {id:'unknown',flow:'families',type:'cut',amount:null}
];
const input=JSON.stringify(focusActions),net=15051;
const base=ctx.piePresentation(focusActions,net,72,null);
const focus=ctx.piePresentation(focusActions,net,72,'companies');
assert.equal(ctx.smallSliceLabel(focus,net),ctx.smallSliceLabel(base,net),'focus does not change the whole small-slice percentage');
assert.equal(focus.rings.length,base.rings.length);
for(let i=1;i<base.rings.length;i++){
  assert.equal(base.rings[i].inner,base.inner,'all turns share the hole');
  for(const p of base.parts.filter(p=>p.ring===i))for(const front of base.parts.filter(f=>f.ring<i&&f.start<p.end&&f.end>p.start))assert.ok(p.outer>=front.outer+14,'back turn protrudes beyond every overlapping front slice');
}
assert.equal(focus.rings[1].inner,base.rings[1].inner,'focus retains the shared hole');
const baseViewport=ctx.pieViewport(base),focusViewport=ctx.pieViewport(focus);
const fitted=ctx.fitPieViewport(focusViewport,baseViewport.width/baseViewport.height);
assert.ok(Math.abs(fitted.width/fitted.height-baseViewport.width/baseViewport.height)<1e-8,'focusing preserves the card aspect ratio');
assert.ok(fitted.x<=focusViewport.x&&fitted.y<=focusViewport.y&&fitted.width>=focusViewport.width&&fitted.height>=focusViewport.height,'focused slices stay within the fitted viewport');
const selectedPart=focus.parts.find(p=>p.id==='cut'),normalPart=base.parts.find(p=>p.id==='cut');
assert.ok((selectedPart.outer-selectedPart.inner)/fitted.width>(normalPart.outer-normalPart.inner)/baseViewport.width,'selected slices also grow on screen after fitting');
assert.equal(JSON.stringify(focusActions),input);
for(const part of base.parts){
  const pieces=focus.parts.filter(p=>p.id===part.id&&p.ring===part.ring);
  assert.equal(pieces[0].start,part.start);assert.equal(pieces.at(-1).end,part.end);
  assert.ok(Math.abs(pieces.reduce((n,p)=>n+p.amount,0)-part.amount)<1e-8);
}
assert.equal(focus.parts.filter(p=>p.id==='tax'&&p.highlighted).length,2,'cross-ring action highlights on every ring');
assert.ok(focus.parts.filter(p=>['cut','tax'].includes(p.id)).every(p=>p.kind==='focus'));
const other=focus.parts.find(p=>p.id==='other');
assert.ok(other.outer-other.inner<base.parts.find(p=>p.id==='other').outer-base.parts.find(p=>p.id==='other').inner);
const purple=focus.parts.filter(p=>p.id==='small-actions');
assert.equal(purple.length,2);assert.equal(purple[0].kind,'focus');assert.equal(purple[1].kind,'small');
assert.ok(Math.abs(purple[0].amount-21)<1e-8);assert.ok(Math.abs(purple[1].amount-30)<1e-8);
assert.deepEqual(ctx.piePresentation(focusActions,net,72,null),base,'deselect restores the original geometry');
assert.equal(ctx.piePresentation(focusActions,net,72,'families').focused,false,'unknown net does not create a green slice');
assert.equal(ctx.piePresentation(focusActions,net,72,'missing').focused,false);
for(const p of focus.parts){
  assert.ok(p.outer<focus.extent);
  assert.equal(p.inner,focus.inner,'focus uses the same centre on all turns');
  assert.doesNotMatch(ctx.slice(p.start,p.end,p.outer,p.inner),/NaN|Infinity/);
}
console.log('PASS: group focus preserves sums and angles, isolates mixed small actions, expands across rings and resets.');
assert.equal((ctx.slice(0,1).match(/A/g)||[]).length,4); // Full annulus must not vanish at equal endpoints.
console.log('PASS: pie boundaries, multiple rings, split actions, removals, negative/unknown values and proportional widths.');

// A tiny overflow must not reserve space for a new full annulus.
const nearly=n=>ctx.piePresentation([{id:'a',amount:5000,type:'cut'},{id:'b',amount:n-5000,type:'tax'}],n,72,null);
const v10=ctx.pieViewport(nearly(10000)),vOver=ctx.pieViewport(nearly(10010));
assert.ok(vOver.width/v10.width<1.04&&vOver.height/v10.height<1.04,'10m overflow barely changes the crop');
for(let i=1;i<base.parts.length;i++)assert.ok(base.parts[i].ring<=base.parts[i-1].ring,'back turns paint first');
for(const kind of ['cut','tax'])assert.equal(new Set([0,1,2].map(r=>ctx.piePalette(kind,r).fill)).size,3,'each turn has its own '+kind+' shade');
const giantActions=[1000,1000,10140,5000,3100].map((amount,i)=>({id:String(i),amount,type:i<3?'cut':'tax'}));
const giant=ctx.piePresentation(giantActions,20240,72,null);
assert.equal(new Set(giant.parts.map(p=>p.key)).size,giant.parts.length,'contour fragments have unique animation keys');
assert.ok(giant.parts.filter(p=>p.ring===0).every(p=>p.outer-p.inner<=144),'a multi-turn action cannot dwarf the hole');
for(const p of giant.parts.filter(p=>p.ring>0)){
  const mid=(p.start+p.end)/2,front=giant.parts.filter(f=>f.ring<p.ring&&f.start<mid&&f.end>mid);
  const rim=p.outer-Math.max(...front.map(f=>f.outer));
  assert.ok(rim>=14-1e-8&&rim<=32+1e-8,'each exposed rim stays readable without swallowing the front turn');
}
for(const kind of ['cut','tax'])assert.equal(new Set(Array.from({length:15},(_,r)=>ctx.piePalette(kind,r).fill)).size,15,'later turns do not cycle back to the first shade');
