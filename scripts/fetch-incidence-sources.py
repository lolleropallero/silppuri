"""Download reproducible public PxWeb source snapshots for incidence profiles."""
import json, urllib.request, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE='https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/'
def get(route):
    req=urllib.request.Request(BASE+route,headers={'User-Agent':'Silppuri research / public statistics'})
    return json.load(urllib.request.urlopen(req,timeout=60))
def save(name,obj):
    (ROOT/'data/sources'/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def query(route, selections, name):
    meta=get(route)
    body={'query':[{'code':v['code'],'selection':{'filter':'item','values':selections.get(v['code'],v['values'])}} for v in meta['variables']], 'response':{'format':'json-stat2'}}
    save(name.replace('.json','-query.json'),body)
    req=urllib.request.Request(BASE+route,data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
    save(name,json.load(urllib.request.urlopen(req,timeout=60)))
    print(name)

if __name__=='__main__':
    # Replay the saved queries verbatim rather than silently widening categories.
    for route,name,query_name in [('ktutk/14pg.px','consumption-2022','consumption-2022-query'),('ktutk/14qa.px','consumption-households-2022','consumption-households-2022-query'),('tjt/11wh.px','income-bounds-2024','income-bounds-query')]:
        body=json.loads((ROOT/'data/sources'/f'{query_name}.json').read_text(encoding='utf8'))
        req=urllib.request.Request(BASE+route,data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
        save(name+'.json',json.load(urllib.request.urlopen(req,timeout=60)))
        print(name+'.json')
    query('vtutk/151u.px',{'timeperiod_y':['2023'],'contentscode':['vtutk_keskiarvo_n','vtutk_kotitalouksia_perusjoukko']},'wealth-2023.json')
    url='https://www.oecd.org/content/dam/oecd/en/publications/reports/2012/01/the-impact-of-publicly-provided-services-on-the-distribution-of-resources_g17a2099/5k9h363c5szq-en.pdf'
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    (ROOT/'data/sources/oecd-services-2012.pdf').write_bytes(urllib.request.urlopen(req,timeout=60).read())
    print('oecd-services-2012.pdf')
