const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),actions=JSON.parse(read('data/catalogue.json')).actions;
const ctx=vm.createContext({incidenceModel:JSON.parse(read('data/incidence-model.json')),data:structuredClone(actions),selected:new Set(),
 scenario:{income:2,corporate:3,dividends:'vm'},units:{},conditions:{yle:'keep-tax',farm:'save'},year:2031,includeLater:false,
 maxPP:10,payerGroups:[],q:()=>({value:''}),dividendStudyUrl:'https://example.test',packageName:'',filter:'all',category:'all',search:'',sortOrder:'desc',activeFlow:null,limit:12,catalogueOrder:[],catalogueOrderKey:''});
const run=s=>vm.runInContext(s,ctx);
for(const file of ['incidence','share-state','share-editorial','share-summary'])run(read('src/'+file+'.js'));
run('const baseData=new Map(data.map(d=>[d.id,{...d}]));data.forEach(d=>{if(d.unit)units[d.id]=1;});');
const source=read('src/app.js');
run(source.slice(source.indexOf('  function syncScenario(){'),source.indexOf('  const esc=')));
run(source.slice(source.indexOf('  const esc='),source.indexOf('  function sourceMarkup')));
run(source.slice(source.indexOf('  function stateIn'),source.indexOf('  function slice')));
function evaluate(state){ctx.stateIn({modelContent:state});const chosen=ctx.data.filter(d=>ctx.selected.has(d.id));return {state:ctx.packageModel(),chosen,summary:ctx.packageSummary(chosen)};}
function report(state){const r=evaluate(state);return {total:r.summary.total,name:r.summary.profile.name,story:r.summary.description,states:['money','services','work'].map(k=>[k,r.summary.distribution[k].state]),rows:r.chosen.map(d=>({id:d.id,title:d.title,amount:d.amount,profile:ctx.actionProfile(d)}))};}
module.exports={ctx,evaluate,report,run,actions};
