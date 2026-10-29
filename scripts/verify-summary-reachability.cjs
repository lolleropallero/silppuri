const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ctx,evaluate,run,actions}=require('./summary-runtime.cjs');
const root=path.join(__dirname,'..');
const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/summary-packages.json'),'utf8'));
run(fs.readFileSync(path.join(root,'src/presets.js'),'utf8'));
const presets=run('packagePresets'),ids=new Set(actions.map(d=>d.id));
assert.deepEqual(Object.keys(fixtures).sort(),Array.from(run('Object.keys(shareNarratives)')).sort(),'every narrative must have a real 8–12bn package');
function check(state,label){
 assert.equal(new Set(state.selectedIds).size,state.selectedIds.length,label+': duplicate cards');
 for(const id of state.selectedIds){assert.ok(ids.has(id),id);const d=actions.find(d=>d.id===id);assert.ok(!d.conflicts.some(c=>state.selectedIds.includes(c)),label+': conflicting '+id);}
 const r=evaluate(state);
 assert.deepEqual([...r.state.selectedIds].sort(),[...state.selectedIds].sort(),label+': normalization must not remove cards');
 assert.ok(r.chosen.every(d=>Number.isFinite(d.amount)&&d.amount>0),label+': only actually priced positive cards');
 assert.ok(r.summary.total>=8000&&r.summary.total<=12000,label+': '+r.summary.total);
 for(const [id,value] of Object.entries(state.cutPercents||{}))assert.equal(r.state.cutPercents[id],value,label+': valid cut setting '+id);
 for(const [id,value] of Object.entries(state.unitSteps||{}))assert.equal(r.state.unitSteps[id],value,label+': valid unit setting '+id);
 assert.ok(!/undefined|NaN|Infinity/.test(r.summary.description));
 // Round-trip the actual share payload, not a shortcut around stateIn.
 const copy=JSON.parse(JSON.stringify({model:r.state,total:r.summary.total,text:r.summary.description,name:r.summary.profile.name}));
 Object.assign(ctx,{TextEncoder,TextDecoder,Uint8Array,btoa,atob,URL});
 const decoded=ctx.decodeShare(ctx.encodeShare(copy.model),ids),reloaded=evaluate(decoded);
 assert.equal(reloaded.summary.total,copy.total,label+': shared amount');
 assert.equal(reloaded.summary.description,copy.text,label+': shared summary');
 assert.equal(reloaded.summary.profile.name,copy.name,label+': shared name');
 return reloaded;
}
for(const [id,state] of Object.entries(fixtures)){
 const r=check(state,id);assert.equal(r.summary.story.id,id,id+': actual cards must select this narrative');
 console.log(id+': '+(r.summary.total/1000).toFixed(2)+' mrd. € / '+r.chosen.length+' korttia');
}
const endings=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/summary-endings.json'),'utf8'));
assert.equal(Object.keys(endings).length,9);
for(const [key,state] of Object.entries(endings)){
 const [id,ending]=key.split(':'),r=check(state,key),s=r.summary;
 assert.equal(s.story.id,id);
 const f=ctx.compositionFacts(s.components.filter(c=>c.material),s.distribution,s.components);
 assert.equal(f.netLower?'lower':id==='split'&&f.netUpper?'upper':'other',ending,key);
}
const threeFronts=check({selectedIds:['health','benefits','vat','income'],taxIncreasesPP:{income:2,corporate:3}},'three-fronts-counter');
assert.equal(threeFronts.summary.story.id,'services-consumption-counter');
assert.match(threeFronts.summary.description,/Etuudet ja palvelut kutistuvat/,'a three-front burden must not erase benefits');
const businessVariants=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/summary-business.json'),'utf8'));
assert.equal(Object.keys(businessVariants).length,6);
for(const [key,state] of Object.entries(businessVariants)){
 const [id,variant]=key.split(':'),s=check(state,key).summary;
 assert.equal(s.story.id,id);
 const f=ctx.compositionFacts(s.components.filter(c=>c.material),s.distribution,s.components);
 assert.equal(f.business,variant==='business',key);
 if(f.business)assert.match(s.description,/näkymätön käsi/);
}
assert.equal(presets.length,5);
const expected={rich:'upper',poor:'services-consumption-benefits',all:'services-consumption-counter',companies:'business-research',consumption:'benefits-consumption-counter'};
for(const preset of presets){
 const r=check(preset.model,preset.id),s=r.summary;
 assert.ok(Math.abs(s.total-10000)<25,preset.id+': within 25m of 10bn');
 assert.equal(s.story.id,expected[preset.id]);
 assert.notEqual(s.profile.name,'SILPPURI');
 if(preset.id==='rich')assert.equal(s.distribution.money.state,'upper');
 if(preset.id==='poor'){assert.equal(s.distribution.money.state,'lower');assert.equal(s.distribution.services.state,'lower');}
 if(preset.id==='companies')assert.ok((s.weights.companies+s.weights.wealth+s.weights.research)/s.total>.7);
 if(preset.id==='consumption')assert.ok(s.weights.consumption/s.total>.5);
 console.log(preset.name+': '+(s.total/1000).toFixed(2)+' mrd. €');
}
console.log('PASS: all '+Object.keys(fixtures).length+' narratives, 9 balance endings, 6 company variants and 5 presets reachable with conflict-free real cards, legal settings and share-link round-trips.');
