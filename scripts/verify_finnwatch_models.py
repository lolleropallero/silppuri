"""Accounting and assumption tests for the three conditional fiscal models."""
import json
from pathlib import Path
from itertools import product
from math import isclose
from finnwatch_models import calculate, wrapper_path

root=Path(__file__).resolve().parents[1]
p=json.loads((root/'data/finnwatch-estimates.json').read_text(encoding='utf8'))
r=calculate(p)
assert r==json.loads((root/'data/finnwatch-results.json').read_text(encoding='utf8'))
# Independent static calculations from the published anchor and stated shares.
assert r['interest']['newInterestBase']==[250,500]
assert isclose(r['interest']['raw'][0],250*.18*.7*.8)
assert isclose(r['interest']['raw'][1],500*.18*.7)
assert isclose(r['succession']['raw'][0],240*.2*.65-3)
assert isclose(r['succession']['raw'][1],240*.5*.85-1)
w=p['wrappers'];stock=w['assetsMillion'];rate=w['capitalTaxRate']
# No return, or no annual recognition, must create no additional tax.
for ret,share in [(0,1),(.05,0)]:
 old=wrapper_path(w,ret,.1,share,False)
 new=wrapper_path(w,ret,.1,share,True)
 assert all(isclose(a['tax'],b['tax']) for a,b in zip(old,new))
# A full withdrawal at year one extinguishes deferral. Annual tax cannot be
# charged again as a withdrawal gain, and subsequent years have no tax base.
old=wrapper_path(w,.05,1,1,False);new=wrapper_path(w,.05,1,1,True)
assert isclose(old[0]['tax'],new[0]['tax'])
assert all(a['tax']==0 for a in new[1:])
# Independently recompute year-one gains and tax basis, including old gains.
a=stock*(1+.05)-stock*.05*rate
b=stock*(1-w['initialGainShare'])+stock*.05*(1-rate)
first=wrapper_path(w,.05,.1,1,True)[0]
assert isclose(first['tax'],stock*.05*rate+(a-b)*.1*rate)
assert isclose(first['assets'],a*.9) and isclose(first['basis'],b*.9)
# Counterfactual path and bounds: never mix incompatible assumptions and never
# silently floor negative later cash flows at zero.
assert r['wrappers']['caseCount']==32
for year,row in r['wrappers']['byYear'].items():
 assert row['range'][0]<=row['raw'][0]<=row['raw'][1]<=row['range'][1]
assert r['wrappers']['byYear']['2035']['raw'][0]<0
assert r['wrappers']['byYear']['2050']['raw'][0]<0
print('PASS: fiscal formulas; tax basis prevents double taxation; immediate-withdrawal equivalence; 32 scenarios; later losses retained.')
