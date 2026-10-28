const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src/app.js'),'utf8').replace(/\r\n/g,'\n');
const actions=JSON.parse(fs.readFileSync(path.join(root,'data/catalogue.json'),'utf8')).actions;
const ctx=vm.createContext({data:structuredClone(actions),target:10000,selected:new Set(),scenario:{income:1,corporate:1,dividends:'vm'},units:{},conditions:{yle:'reduce-tax',farm:'redirect'},year:2031});
vm.runInContext('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});',ctx);
vm.runInContext(source.slice(source.indexOf('  const dividendStudyUrl'),source.indexOf('  const selected=')),ctx);
vm.runInContext(source.slice(source.indexOf('  function syncScenario'),source.indexOf('  const esc=')),ctx);
vm.runInContext(source.slice(source.indexOf('  const moneyLabel='),source.indexOf('\n',source.indexOf('  const moneyLabel='))),ctx);
vm.runInContext(source.slice(source.indexOf('  function effectFor'),source.indexOf('  data.forEach(d=>{\n    const article=')),ctx);
const duplicates=[];
const passages=[];
// Find repeated sentences or substantial phrases within a popup, including
// the expandable method section. Citations and headline amounts may repeat.
const tokens=text=>text.toLocaleLowerCase('fi').match(/[\p{L}\p{N}]+/gu)||[];
for(const variant of ['base','alternatives','scaled']){
  if(variant==='alternatives')Object.assign(ctx.scenario,{dividends:'abolish'}),Object.assign(ctx.conditions,{yle:'keep-tax',farm:'save'});
  if(variant==='scaled'){
    Object.assign(ctx.scenario,{income:4,corporate:10});
    Object.keys(ctx.units).forEach(id=>ctx.units[id]=2);
  }
  const rows=vm.runInContext('syncScenario();data.map(d=>({id:d.id,title:d.title,...effectFor(d)}))',ctx);
  for(const row of rows){
    const seen=new Map();
    for(const field of ['who','society','money','caveat','tradeoff','scope']){
      const sentences=(row[field]||'').split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ])/u);
      for(const sentence of sentences){
        const normalized=tokens(sentence).join(' ');
        if(normalized.length<45)continue;
        if(seen.has(normalized))duplicates.push({variant,id:row.id,fields:[seen.get(normalized),field],sentence});
        seen.set(normalized,field);
      }
    }
    const fields=['who','society','money','caveat','tradeoff','scope'];
    for(let i=0;i<fields.length;i++)for(let j=i+1;j<fields.length;j++){
      const first=tokens(row[fields[i]]||''),second=tokens(row[fields[j]]||'').join(' ');
      const shared=first.map((_,k)=>first.slice(k,k+9).join(' ')).filter((s,k)=>k+9<=first.length&&second.includes(s));
      if(shared.length)passages.push({variant,id:row.id,fields:[fields[i],fields[j]],shared});
    }
  }
}
if(duplicates.length||passages.length)console.log(JSON.stringify({duplicates,passages},null,2));
assert.equal(duplicates.length,0,'Repeated sentences within a popup');
assert.equal(passages.length,0,'Repeated long passages across popup sections');
const render=source.slice(source.indexOf('  function renderImpact'),source.indexOf('  function openImpact'));
assert.ok(!render.includes('d.detail'),'Original descriptions must not duplicate the curated effect in Sources');
assert.ok(!render.includes('sp-impact-reference'),'Citations belong in the linked source list');
const vat=vm.runInContext("effectFor(data.find(d=>d.id==='vat'))",ctx);
assert.ok(vat.money.includes('3,87')&&vat.money.includes('2,32'));
assert.ok(!vat.society.includes('miljardi'));
const municipalities=vm.runInContext("effectFor(data.find(d=>d.id==='cut-7-20'))",ctx);
assert.ok(!/ministeriö/i.test([municipalities.who,municipalities.society,municipalities.money,municipalities.scope].join(' ')));
assert.ok(municipalities.money.includes('kuntataloutta')&&municipalities.money.includes('valtionosuuksia'));
assert.ok(!municipalities.money.startsWith('0 €'),'do not restate a zero headline as the whole long-term effect');
console.log(`PASS: ${actions.length} popups in 3 scenarios; no repeated sentences or long passages between content sections.`);
