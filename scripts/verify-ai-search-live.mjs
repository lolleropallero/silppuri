// Explicit opt-in integration evaluation against the deployed Free-tier Worker.
// Fixtures are never included in the model prompt or the deployed application.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
if (!process.argv.includes('--live')) {
  console.log('Use --live to evaluate real inference on silppuri.fi. This consumes the Free daily quota.');
  process.exit(0);
}
const fixtureURL=new URL('./fixtures/ai-search-language.json',import.meta.url);
const cases=JSON.parse(await readFile(fixtureURL,'utf8'));
const actions=JSON.parse(await readFile(new URL('../data/catalogue.json',import.meta.url),'utf8')).actions;
const cards=new Map(actions.map(card=>[card.id,card]));
const prompt=await readFile(new URL('../src/worker.mjs',import.meta.url),'utf8');
for(const test of cases)assert.ok(!prompt.includes(test.query),'evaluation phrase must not appear in model instructions');
const results=[];
for(const [index,test] of cases.entries()) {
  // Stay below 3/min/IP; do not retry inference or bypass the live limiter.
  if(index)await delay(21000);
  const started=Date.now();
  const response=await fetch('https://silppuri.fi/api/ai-search',{
    method:'POST',headers:{Origin:'https://silppuri.fi','Content-Type':'application/json'},
    body:JSON.stringify({query:test.query,history:test.history||[],selectedIds:[]}),
    signal:AbortSignal.timeout(45000)
  });
  const body=await response.json();
  const result={query:test.query,status:response.status,stage:response.headers.get('x-search-stage'),
    ms:Date.now()-started,ids:body.ids||[],error:body.error};
  result.titles=result.ids.map(id=>cards.get(id)?.title||id);
  result.pass=response.ok&&Array.isArray(body.ids)&&body.ids.length<=6&&body.ids.every(id=>cards.has(id))&&
    (!test.any||test.any.some(id=>body.ids.includes(id)))&&
    (!test.only||body.ids.every(id=>test.only.includes(id)))&&
    (!test.none||test.none.every(id=>!body.ids.includes(id)))&&(!test.empty||body.ids.length===0);
  results.push(result);console.log(JSON.stringify(result));
  // A provider/limit failure is not evidence about language understanding.
  // Stop rather than spending the remainder of the shared daily allowance.
  if(!response.ok)break;
}
await mkdir(new URL('../tmp/',import.meta.url),{recursive:true});
await writeFile(new URL('../tmp/ai-search-language-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
assert.equal(results.length,cases.length,'all live language cases completed');
assert.ok(results.every(result=>result.pass),'inspect tmp/ai-search-language-results.json for failed meanings');
console.log(`PASS: ${results.length} held-out live searches; no phrase-specific runtime rules`);
