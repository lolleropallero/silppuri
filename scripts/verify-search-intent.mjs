import assert from 'node:assert/strict';
import {findShortSearch} from '../src/search-intent.mjs';
import catalogue from '../tmp/ai-catalogue.mjs';
const titles = new Map(catalogue.map(([id,title])=>[id,title]));
for (const query of ['yle silppuriin','YLEÄ SILPPURIIN!','Ylen rahoitusta alas','Yle','leikkaa yleltä']) {
  assert.deepEqual(findShortSearch(query,catalogue),['cut-1-42'],query+': Yle must not match yleinen or ylempi');
}
for (const query of ['mamut ulos','maahanmuutosta leikkauksia','pakolaiset silppuriin','kotoutumisen tuet pois']) {
  const ids=findShortSearch(query,catalogue);
  assert.ok(ids?.includes('cut-5-45') && ids.includes('cut-1-28'),query);
  assert.ok(ids.every(id=>['cut-5-45','cut-1-28','cut-3-38'].includes(id)),query+': no unrelated cards');
}
for (const query of ['Köyhät kyykkyyn','köyhiltä pois','pienituloiset silppuriin','perusturva alas']) {
  const ids=findShortSearch(query,catalogue);
  assert.ok(ids?.length && ids.includes('cut-3-13'),query);
  assert.ok(!ids.includes('income') && !ids.includes('corporate'),query+': direct low-income measures');
}
for (const query of ['rikkaat talkoisiin','yritykset silppuriin','eläkeläiset kyykkyyn','kehitysapu pois','opiskelijat kyykkyyn','armeija silppuriin','maajussit talkoisiin','alv','takuueläke pois']) {
  const ids=findShortSearch(query,catalogue);
  assert.ok(ids?.length && ids.length<=6 && new Set(ids).size===ids.length,query);
  assert.ok(ids.every(id=>titles.has(id)),query+': only real cards');
}
for (const query of ['ei pienituloisilta','köyhät turvaan','vain isot eläkkeet','leikkaa eläkkeitä mutta ei pieniltä',
  'entä ilman tutkimusrahoitusta','Yle silppuriin mutta uutiset ennallaan','Yle 50 prosenttia',
  'yritystuet pois','yritysverot pois','eläketuloveroa lisää','yleinen asumistuki','eläkkeiden leikkaukset vain suurituloisilta','tutkimukseen lisää rahaa']) {
  assert.equal(findShortSearch(query,catalogue),null,query+': preserve conditions for AI');
}
console.log('PASS: short Finnish searches, colloquialisms, inflections, catalogue-only results and qualified-query boundaries');
