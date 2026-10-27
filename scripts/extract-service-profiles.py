"""Finnish shares from OECD 2012 figures, with chart coordinates for reproducibility."""
import json,hashlib
from pathlib import Path
import pdfplumber
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'data/sources/oecd-services-2012.pdf'
specs={'education':(42,334.6,120,255),'school':(42,643.7,120,255),'secondary':(42,293.0,325,450),'tertiary':(42,452.0,330,450),'health':(46,201.5,130,290),'childcare':(52,406.3,130,295),'eldercare':(56,237.2,130,290)}
result={'source':'https://doi.org/10.1787/5k9h363c5szq-en','country':'Finland','dataYear':2007,'publicationYear':2012,'pdfSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'method':'Digitised Finnish quintile shares from vector rectangle heights. Q1 is the bottom of each stacked column. Split to deciles in proportion to 2024 consumption-unit counts within each quintile; no within-quintile gradient is invented.','profiles':{}}
with pdfplumber.open(source) as pdf:
 for key,(page,x,y0,y1) in specs.items():
  bars=[r for r in pdf.pages[page].rects if abs(r['x0']-x)<.3 and y0<=r['top']<y1 and r['height']>1 and r['fill']]
  bars=list({(round(r['top'],1),round(r['bottom'],1)):r for r in bars}.values())
  bars=sorted(bars,key=lambda r:-r['top'])
  assert len(bars)==5,(key,len(bars))
  total=sum(r['height'] for r in bars)
  values=[round(r['height']/total,6) for r in bars]
  result['profiles'][key]={'page':page,'quintiles':values,'coordinates':[x,y0,y1]}
  print(key,values)
(ROOT/'data/sources/services-finland-2007.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
