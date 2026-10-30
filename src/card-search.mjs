// Data-derived relevance search. No topics, aliases or user phrases are listed here.
const words=text=>text.toLocaleLowerCase('fi').normalize('NFKD').replace(/\p{M}/gu,'').match(/[a-z0-9]+/g)||[];
function commonPrefix(a,b){let length=0;while(length<Math.min(a.length,b.length)&&a[length]===b[length])length++;return length;}
export function createTitleLookup(catalogue){
  const frequency=new Map();
  for(const [,title] of catalogue)for(const word of new Set(words(title)))frequency.set(word,(frequency.get(word)||0)+1);
  const distinctive=[...frequency].filter(([word,count])=>word.length>=3&&count<=Math.max(1,catalogue.length*.1)).map(([word])=>word);
  return query=>words(query).filter(token=>token.length>=3&&distinctive.some(word=>{
    const prefix=commonPrefix(token,word);
    return prefix>=3&&Math.max(token.length,word.length)-prefix<=3&&Math.min(token.length,word.length)-prefix<=2;
  })).slice(0,6);
}
function byRelevance(a,b){
  if(a.score!==b.score)return b.score-a.score;
  if(a.id===b.id)return 0;
  return a.id<b.id?-1:1;
}
function similarity(a,b){
  if(a===b)return 1;
  const shorter=Math.min(a.length,b.length);
  const prefix=commonPrefix(a,b);
  if(shorter===3&&prefix===3&&Math.max(a.length,b.length)<=5)return .9;
  if(shorter>=4&&prefix===shorter)return .9;
  return (prefix>=4&&prefix/shorter>=.8)||(prefix>=8&&prefix/shorter>=.7)?.8*prefix/shorter:0;
}
export function createCardSearch(catalogue){
  const rows=catalogue.map(([id,...fields])=>({id,fields:fields.map(field=>[...new Set(words(field))])}));
  const inverted=new Map(),prefixes=new Map();
  rows.forEach((row,index)=>row.fields.forEach((field,column)=>field.forEach(word=>{
    if(!inverted.has(word)){
      const entry={word,slots:[]},prefix=word.slice(0,3);inverted.set(word,entry);
      if(!prefixes.has(prefix))prefixes.set(prefix,[]);prefixes.get(prefix).push(entry);
    }
    inverted.get(word).slots.push(index*3+column);
  })));
  return (terms,{limit=12,minimumRatio=.3}={})=>{
    const tokens=[...new Set(terms.flatMap(words))].slice(0,16),scores=new Float64Array(rows.length);
    for(const token of tokens){
      const matches=new Float64Array(rows.length*3);
      for(const entry of prefixes.get(token.slice(0,3))||[]){
        const fit=similarity(token,entry.word);if(!fit)continue;
        for(const slot of entry.slots)matches[slot]=Math.max(matches[slot],fit);
      }
      let frequency=0;
      for(let i=0;i<rows.length;i++)if(matches[i*3]||matches[i*3+1]||matches[i*3+2])frequency++;
      if(!frequency)continue;
      const weight=Math.log(1+rows.length/(frequency+1));
      for(let i=0;i<rows.length;i++)scores[i]+=weight*(matches[i*3]*2.6+matches[i*3+1]*1.8+matches[i*3+2]*.6);
    }
    const ranked=rows.map((row,i)=>({id:row.id,score:scores[i]})).filter(row=>row.score>0)
      .sort(byRelevance);
    const minimum=(ranked[0]?.score||0)*minimumRatio;
    return ranked.filter(row=>row.score>=minimum).slice(0,limit).map(row=>row.id);
  };
}
