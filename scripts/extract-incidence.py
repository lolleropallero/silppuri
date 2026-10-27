"""Reproduce readings from the original VM vector charts, not hand-picked decile weights.

Printed page n is PDF page n+1. These are chart readings, not SISU microdata.
Run only when refreshing sources: python scripts/extract-incidence.py [PDF directory].
"""
import json, sys, hashlib
from pathlib import Path
import pdfplumber

ROOT=Path(__file__).resolve().parents[1]
PDF=Path(sys.argv[1]) if len(sys.argv)>1 else Path('C:/Users/aleks/Downloads')
specs={
 'child-single':(198,274.0,0,.05,22.355),
 'child-under3':(198,274.0,1,.05,22.355),
 'child-siblings':(198,274.0,2,.05,22.355),
 'child-all':(198,559.7,0,.20,21.963),
 'maintenance':(203,274.2,0,.05,28.333),
 'housing-rate':(207,198.9,0,.05,22.194),
 'housing-regions':(207,198.9,1,.05,22.194),
 'unemployment-days':(227,289.2,0,.01,19.609),
 'pension-taper':(262,199.0,0,.1,20.238),
 'pension-disregard':(262,199.0,1,.1,20.238),
 'pension-index':(262,199.0,2,.1,20.238),
 'guarantee-remove':(270,199.0,0,.2,22.74),
 'guarantee-age':(270,199.0,1,.2,22.74),
 'guarantee-level':(270,199.0,2,.2,22.74),
 'guarantee-residence':(270,199.0,3,.2,22.74),
 'pension-housing-merge':(277,198.9,0,.5,36.668),
 'pension-housing-age':(277,198.9,1,.5,36.668),
 'disability-child':(281,364.3,0,.05,19.279),
 'disability-adult':(281,364.3,1,.05,19.279),
 'disability-pension':(281,364.3,2,.05,19.279),
 'benefit-index':(331,349.3,0,.2,23.869),
 'flexible-care':(340,409.5,0,.005,35),
}
result={'method':'Rectangle heights / published tick spacing. Repeated fill/stroke rectangles deduplicated. Colour order follows chart legend: dark blue, light blue, purple, green. Positive numbers denote loss. Percentages rounded to four decimals.','charts':{},'pdfSha256':{}}
for report in ['44','48']:
 file=PDF/f'VM_2026_{report}.pdf'
 result['pdfSha256'][report]=hashlib.sha256(file.read_bytes()).hexdigest()
 with pdfplumber.open(file) as doc:
  if report=='44':
   for key,(page,top,series,tick,spacing) in specs.items():
    rects=[r for r in doc.pages[page].rects if abs(r['top']-top)<.15 and 2<r['width']<30 and isinstance(r['non_stroking_color'],tuple) and max(r['non_stroking_color'])-min(r['non_stroking_color'])>.1]
    colors=sorted(set(r['non_stroking_color'] for r in rects),key=lambda c: min(r['x0'] for r in rects if r['non_stroking_color']==c))
    unique={round(r['x0'],1):r for r in rects if r['non_stroking_color']==colors[series]}
    bars=[unique[x] for x in sorted(unique)]
    assert len(bars)==10,(key,len(bars))
    result['charts'][key]={'report':'44','page':page,'kind':'percent','values':[round(r['height']/spacing*tick,4) for r in bars],'readingError':round(.12/spacing*tick,6)}
  else:
   # VM 2026:48, p.152: 1pp standard/reduced VAT. Values are purchasing-power loss,
   # before benefit-index compensation. Store euro profiles for proportional allocation.
   p=doc.pages[152]
   for key,color in [('vat-standard',(0.,.184,.424)),('vat-reduced',(.557,.745,1.))]:
    bars=[r for r in p.rects if 6<r['width']<15 and 200<r['top']<345 and abs(r['bottom']-340.8)<3 and isinstance(r['non_stroking_color'],tuple) and sum(abs(a-b) for a,b in zip(r['non_stroking_color'],color))<.01]
    unique={round(r['x0'],1):r for r in bars}; bars=[unique[x] for x in sorted(unique)]
    assert len(bars)==10,(key,[(r['top'],r['bottom'],r['width']) for r in bars])
    result['charts'][key]={'report':'48','page':152,'kind':'euro-profile','values':[round(r['height']/17.89*50,2) for r in bars]}
   result['charts']['income-index']={'report':'48','page':67,'kind':'percent','values':[.05,.17,.32,.42,.54,.62,.65,.67,.66,.48],'readingError':.01}
(ROOT/'data/sources/vm-incidence-figures.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Extracted',len(result['charts']),'chart series')
