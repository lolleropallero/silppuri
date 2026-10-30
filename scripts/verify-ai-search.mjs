// Offline boundary tests; language understanding is evaluated separately, live.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker,{MODEL} from '../src/worker.mjs';
import catalogue from '../tmp/ai-catalogue.mjs';
import {createCardSearch,createTitleLookup} from '../src/card-search.mjs';
const actions=JSON.parse(await readFile(new URL('../data/catalogue.json',import.meta.url),'utf8')).actions;
assert.deepEqual(catalogue,actions.map(d=>[d.id,d.title,d.who,d.society]));
const rank=createCardSearch(catalogue);
const literal=createTitleLookup(catalogue);
assert.deepEqual(literal('Yle silppuriin'),['yle']);
assert.deepEqual(literal('mamut ulos'),[],'a rhetorical verb must not match a compound topic');
assert.deepEqual(createTitleLookup([['arbitrary','Avaruuskissojen tuki','kohde','vaikutus']])('avaruuskissojen silppuriin'),['avaruuskissojen'],'literal lookup derives entirely from supplied data');
assert.deepEqual(rank(['Yle'],{limit:6,minimumRatio:.55}),['cut-1-42']);
assert.deepEqual(rank(['opiskelija','ateriatuki'],{limit:6,minimumRatio:.55}),['cut-2-60']);
assert.ok(rank(['yritystuki']).includes('cut-1-11'));
assert.ok(rank(['maahanmuutto','kotoutuminen']).includes('cut-1-28'));
assert.deepEqual(rank(['xyzzyplugh']),[]);assert.deepEqual(rank([]),[]);
assert.ok(!rank(['Yle']).includes('tax-capital-high'),'Yle must not match ylempi');
const url='https://silppuri.fi/api/ai-search',reply=value=>({response:JSON.stringify(value)});
let calls=[],throttles=[],allowed=true;
let output=reply({terms:['Yle'],constraints:[]}),verification=reply({matches:[1]});
const env={AI_SEARCH_MODE:'workers-free',AI:{async run(...args){
  calls.push(args);const value=args[1].messages[0].content.startsWith('Tulkitse')?output:verification;
  if(value instanceof Error)throw value;return value;
}},AI_SEARCH_LIMITER:{async limit(input){throttles.push(input);return {success:allowed};}},
ASSETS:{fetch:async request=>new Response('asset: '+new URL(request.url).pathname)}};
function request(input={query:'Etsi toimia'},options={}){
  return new Request(url,{method:'POST',headers:{Origin:'https://silppuri.fi','Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...options.headers},body:typeof input==='string'?input:JSON.stringify(input)});
}
async function blocked(req,status,bindings=env){
  const before=calls.length,result=await worker.fetch(req,bindings);
  assert.equal(result.status,status);assert.equal(calls.length,before);return result;
}
for(const override of [{AI_SEARCH_MODE:'off'},{AI_SEARCH_MODE:undefined},{AI:undefined},{AI_SEARCH_LIMITER:undefined}])await blocked(request(),503,{...env,...override});
await blocked(new Request(url),405);await blocked(new Request('https://silppuri.fi/api/nope'),404);
await blocked(request({}, {headers:{Origin:'https://evil.test'}}),403);
await blocked(request({}, {headers:{'Content-Type':'text/plain'}}),415);await blocked(request('{nope'),400);
for(const input of [null,[],{},{query:'  '},{query:'a'.repeat(601)},{query:{}},
  {query:'test',selectedIds:['invented']},{query:'test',history:[{query:'test',ids:['invented']}]},
  {query:'test',history:Array(4).fill({query:'test',ids:[]})}])await blocked(request(input),400);
await blocked(request(' '.repeat(12001)),413);await blocked(request({}, {headers:{'Content-Length':'12001'}}),413);
const noIp=request();noIp.headers.delete('cf-connecting-ip');await blocked(noIp,503);
allowed=false;
for(const query of ['yle silppuriin','mamut ulos','köyhät kyykkyyn'])assert.equal((await blocked(request({query}),429)).headers.get('retry-after'),'60');
allowed=true;
for(const query of ['yle silppuriin','mamut ulos','köyhät kyykkyyn','Hillot pois hyvävelikerholta']){
  const before=calls.length,result=await worker.fetch(request({query}),env);
  assert.equal(result.status,200);assert.deepEqual(await result.json(),{ids:['cut-1-42']});
  assert.equal(calls.length,before+2);assert.equal(calls.at(-2)[1].messages.at(-1).content,query);
}
assert.ok(calls.every(call=>call[0]===MODEL&&call[1].store===false));
assert.ok(calls.every(call=>call[1].messages[0].content.length<3500),'interpretation sees no giant catalogue');
output=reply({terms:['Yle'],constraints:['Suojattava käyttäjän rajaama toiminta.']});
const before=calls.length;
const good=await worker.fetch(request({query:'  Rajaa lisää  ',history:[{query:'Aiempi aihe',ids:['income']}],selectedIds:['corporate'],model:'paid-model',max_tokens:100000}),env);
assert.equal(good.status,200);assert.equal(calls.length,before+2);
assert.equal(calls.at(-2)[1].max_completion_tokens,512);assert.equal(calls.at(-1)[1].max_completion_tokens,256);
assert.ok(!JSON.stringify(calls.at(-2)).includes('paid-model'));
assert.deepEqual(calls.at(-2)[1].messages.slice(1),[{role:'user',content:'Aiempi aihe'},{role:'assistant',content:'{"ids":["income"]}'},{role:'user',content:'Rajaa lisää'}]);
const check=JSON.parse(calls.at(-1)[1].messages[1].content);
assert.deepEqual(check.terms,['Yle']);assert.deepEqual(check.searches,['Aiempi aihe','Rajaa lisää']);
assert.deepEqual(check.candidates,[[1,...catalogue.find(row=>row[0]==='cut-1-42').slice(1)]]);
for(const value of [new Error('quota exhausted: secret detail'),{response:'not JSON'},reply({terms:[42]}),reply({terms:Array(7).fill('Yle')}),
  reply({terms:['x'.repeat(81)]}),reply({terms:['']}),reply({ids:['income']}),{choices:[{message:{content:'{}'},finish_reason:'length'}]}]){
  output=value;const before=calls.length,result=await worker.fetch(request(),env);
  assert.equal(result.status,value instanceof Error?503:502);assert.equal(calls.length,before+1,'no retries');
  assert.deepEqual(await result.json(),{error:value instanceof Error?'quota':'model-output'});
}
for(const response of [{terms:['Yle'],constraints:[]},'```json\n{"terms":["Yle"],"constraints":[]}\n```']){
  output={response};assert.deepEqual(await (await worker.fetch(request(),env)).json(),{ids:['cut-1-42']});
}
output=reply({terms:[],constraints:[]});assert.deepEqual(await (await worker.fetch(request(),env)).json(),{ids:[]});
output=reply({terms:['tuntematonhakutermi'],constraints:[]});
assert.deepEqual(await (await worker.fetch(request({query:'Yle silppuriin'}),env)).json(),{ids:['cut-1-42']},'an unmatched rewrite falls back to distinctive words from the real titles');
for(const constraints of [undefined,null,'none',42,[null],[''],['x'.repeat(241)],Array(7).fill('condition')]){
  output=reply({terms:['Yle'],constraints});const before=calls.length;
  assert.equal((await worker.fetch(request(),env)).status,200);assert.equal(calls.length,before+2,'invalid constraints always checked');
}
output=reply({terms:['Yle'],constraints:['Vahvista rajaus.']});
for(const [value,status,ids] of [[reply({matches:[]}),200,[]],[reply({matches:[2]}),502],
  [reply({matches:['1']}),502],[reply({matches:[0]}),502],[reply({matches:[1.5]}),502],
  [reply({matches:Array(7).fill(1)}),502],[new Error('private provider detail'),503]]){
  verification=value;const result=await worker.fetch(request(),env);assert.equal(result.status,status);
  if(ids)assert.deepEqual(await result.json(),{ids});
}
const last=calls.length;
assert.equal(await (await worker.fetch(new Request('https://silppuri.fi/'),{ASSETS:env.ASSETS})).text(),'asset: /');assert.equal(calls.length,last);
console.log('PASS: semantic-query protocol, data-derived matching, constraints, allowlists, rate/body limits and no paid fallback');
