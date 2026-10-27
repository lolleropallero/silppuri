const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name),'utf8'));
const {actions}=read('catalogue.json');
const summaries=read('source-summaries.json');
const references=read('research-sources.json');
const notes=read('source-notes.json');
for(const [url,note] of Object.entries(notes))if(note.researchSummary)notes[url]=summaries[note.researchSummary];
const used=new Set(actions.flatMap(d=>d.research?.sources||[]));
for(const key of used){
  assert.ok(summaries[key]?.summary.length>=80,key+': missing findings');
  assert.ok(summaries[key]?.limit.length>=40,key+': missing limits');
  assert.ok(summaries[key].summary!==references[key].kind,key+': method is not a finding');
}
const sources=Object.fromEntries([...used].map(key=>[key,{...references[key],...summaries[key]}]));
let code=fs.readFileSync(path.join(root,'src/app.js'),'utf8')
  .replace(/\r\n/g,'\n')
  .replace('{}/*RESEARCH_SOURCES*/',JSON.stringify(sources))
  .replace('{}/*SOURCE_NOTES*/',JSON.stringify(notes));
const ctx=vm.createContext({data:structuredClone(actions),selected:new Set(),year:2031,
  scenario:{income:2,corporate:3,dividends:'vm'},conditions:{yle:'keep-tax',farm:'save'},units:{},
  moneyLabel:n=>n===null?'Ei arviota':String(n)+' milj. €'});
vm.runInContext(code.slice(code.indexOf('  const dividendStudyUrl='),code.indexOf('  const format=')),ctx);
vm.runInContext('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});',ctx);
vm.runInContext(code.slice(code.indexOf('  function syncScenario(){'),code.indexOf('  const conflictsFor=')),ctx);
vm.runInContext(code.slice(code.indexOf('  function effectFor(d){'),code.indexOf('  data.forEach(d=>{\n    const article=')),ctx);
// Exercise exactly the reference list that each card renders, including both
// dividend variants and legacy/official references outside research.sources.
const urls=new Set();let rendered=0;
for(const mode of ['vm','abolish']){
  ctx.scenario.dividends=mode;
  const cards=vm.runInContext(`syncScenario();data.map(d=>{
    const e=effectFor(d);
    const links=[{url:e.sourceUrl||d.sourceUrl||urls[d.report],label:e.refs},...e.extra.map(k=>evidence[k]),...(d.research?.sources||[]).map(k=>researchSources[k])];
    if(d.report==='cut')links.push({url:urls.cut,label:'VM 2026:44 · '+d.memo});
    return {id:d.id,sources:links.map(s=>({url:s.url,note:sourceNotes[s.url]||s,html:sourceMarkup(s)}))};
  })`,ctx);
  assert.equal(cards.length,actions.length);
  for(const card of cards)for(const {url,note,html} of card.sources){
    assert.ok(note.summary?.trim()&&note.limit?.trim(),card.id+': '+url);
    assert.match(html,/^<details class="sp-source"><summary /);
    assert.ok(!html.includes('<details open'),'closed by default');
    assert.ok(!html.split('</summary>')[0].includes('<a '),'title opens the summary, not a new tab');
    assert.ok(html.includes('rel="noopener noreferrer"')&&html.includes('Avaa lähde'),'original is accessible');
    assert.ok(!html.includes('undefined'));
    urls.add(url);rendered++;
  }
}
ctx.example={url:'https://example.com/?a="b"',label:'<script>bad</script>',summary:'A & B < C',limit:'"quoted"'};
const escaped=vm.runInContext('sourceMarkup(example)',ctx);
assert.ok(!escaped.includes('<script>')&&escaped.includes('&lt;script&gt;'));
assert.ok(escaped.includes('A &amp; B &lt; C')&&escaped.includes('&quot;quoted&quot;'));
const fragment=fs.readFileSync('C:/Users/aleks/.codex/visualizations/2026/10/26/01a17813-fc63-7ab3-a7a1-468c076b25bd/silppuri-konsepti.html','utf8');
assert.ok(!fragment.includes('/*SOURCE_NOTES*/'));
for(const key of used)assert.ok(fragment.includes(summaries[key].summary),key);
console.log(`PASS: all ${actions.length} cards, both dividend variants, ${urls.size} source URLs, ${rendered} reference renders; findings, limits, closed disclosures and escaped links.`);
