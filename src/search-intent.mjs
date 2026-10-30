// Short, unqualified topic searches work without inference. Qualifiers and
// follow-ups go to AI so this path never silently drops a user's constraints.
const shortSearchTopics = [
  {query: /^yle(?:n|a|sta|ssa|lle|lta)?$/, cards: /\byle(?:n|a|ssa|sta|lle|lta)?\b/},
  {query: /^(?:mamu|maahanmuut|pakolais|kotout|turvapaik)/, cards: /maahanmuut|pakolais|kotout|turvapaik/},
  {query: /^(?:koyh|pienitulo|perusturv)/, cards: /pienitulo|toimeentulotue|perusturva|pienimpien elakke/},
  {query: /^(?:rikka|suuritulo|miljonaari|miljardoor|varakka|paaoma|omaisu|varallisu)/, cards: /paaoma|varallisu|miljoon|suuritulo|varakka|verollisen perinnon/, priority: /miljoon|suuritulo|suuria paaoma/},
  {query: /^(?:elake|elaketta|elakke(?:et|ita|iden|isiin|ista|ille|ilta)|elakelai\w*)$/, cards: /elake|elakke|elakelai/},
  {query: /^tyoelak/, cards: /tyoelak/},
  {query: /^takuuelak/, cards: /takuuelak/},
  {query: /^(?:yrity(?:s|kset|ksia|ksille|ksilta|sten)|firm\w*|bisne\w*|yrittaj\w*)$/, cards: /yrity|yrittaj|yhteisovero/},
  {query: /^(?:alv|arvonlisavero)/, cards: /\balv\b|arvonlisavero/},
  {query: /^(?:asumist|asumislis)/, cards: /asumist|asumislis/},
  {query: /^toimeentulot/, cards: /toimeentulot/},
  {query: /^(?:tyottom|ansiosidonnai)/, cards: /tyottom|ansiosidonnai/},
  {query: /^(?:opiskel|opinto)/, cards: /opiskel|opinto/},
  {query: /^(?:sote|tervey|sairaal|hoiv)/, cards: /tervey|sairaal|hoiv|hyvinvointialue/},
  {query: /^(?:kehitysapu|kehitysyhteist)/, cards: /kehitysyhteist/},
  {query: /^(?:puolustus|armeija)/, cards: /puolustus|asevelvoll/},
  {query: /^(?:maatal|maajus|maajull|viljelij)/, cards: /maatal|viljelij/},
  {query: /^(?:kulttuur|taite|taide)/, cards: /kulttuur|taite|taide/},
  {query: /^(?:tutkim|tiede)/, cards: /tutkim|tiede/}
];
const shortSearchFiller = /^(?:haluan|haluaisin|hae|etsi|nayta|laita|pista|nyt|heti|kaikki|koko|suomen|silppur\w*|silppu\w*|kyyk\w*|talkoi\w*|pois|ulos|alas|nollaan|vahemman|leikka\w*|karsi\w*|kirist\w*|kurit\w*|rahoitu\w*|tuki\w*|tuet|tukien|tukia|menoja)$/;
function shortSearchText(value) {
  return value.toLocaleLowerCase('fi').normalize('NFKD').replace(/\p{M}/gu,'');
}
export function findShortSearch(query, catalogue) {
  const words = shortSearchText(query).match(/[a-z0-9]+/g) || [];
  if (!words.length || words.length > 8) return null;
  if (words.some(word => word.includes('vero'))) return null;
  const topics = shortSearchTopics.filter(topic => words.some(word => topic.query.test(word)));
  // A single clear subject can start a new search. Multiple subjects, amounts,
  // negations, protected subgroups and unspecified words require interpretation.
  if (topics.length !== 1 || words.some(word => !topics[0].query.test(word) && !shortSearchFiller.test(word))) return null;
  const topic = topics[0];
  const matches = catalogue.map(([id,title,who]) => {
    const heading = shortSearchText(title), target = shortSearchText(who);
    const score=(topic.cards.test(heading)?2:0)+(topic.cards.test(target)?3:0);
    return {id,score:score+(score&&topic.priority?.test(heading+' '+target)?6:0)};
  }).filter(row => row.score > 0).sort((a,b) => b.score-a.score || a.id.localeCompare(b.id,'en'));
  return matches.length ? matches.slice(0,6).map(row => row.id) : null;
}
