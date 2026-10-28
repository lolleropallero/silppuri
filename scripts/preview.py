"""Local QA fixtures only; production widget selections are never overwritten."""
import importlib.util,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
folder=ROOT/'tmp/review';folder.mkdir(parents=True,exist_ok=True)
runtime=Path('C:/Users/aleks/.codex/plugins/cache/openai-bundled/visualize/1.0.57/skills/visualize/scripts/render.py')
spec=importlib.util.spec_from_file_location('visualize_render',runtime)
render=importlib.util.module_from_spec(spec);sys.modules[spec.name]=render;spec.loader.exec_module(render)
source=(ROOT/'tmp/silppuri-konsepti.html').read_text(encoding='utf8')
state={'modelContent':{'selectedIds':['vat','health','income','income-index','cut-5-49','cut-5-52','benefits','dividends','corporate','cut-3-15','cut-3-62'],
       'year':2031,'taxIncreasesPP':{'income':2,'corporate':3},'dividendMode':'abolish'},'privateContent':{'catalogueViewVersion':1}}
if '--horizon' in sys.argv:
    state['modelContent']['selectedIds']=['vat','health','income','income-index','dividends','corporate','benefits','cut-3-15','cut-3-51','cut-7-20','cut-3-52','cut-2-51','cut-3-45']
if '--motion' in sys.argv:
    state['modelContent']['selectedIds']=['cut-6-5','cut-7-42','cut-3-15','tax-insurance']
if '--rings' in sys.argv:
    state['modelContent']['selectedIds']=['vat','health','income','income-index','dividends','corporate','cut-3-15','cut-7-20','cut-3-52','cut-2-51','cut-3-45','cut-3-44','cut-6-5','cut-7-42','cut-1-6','cut-3-8']
    state['modelContent']['includeLater']=True
if '--finnwatch' in sys.argv:
    state['modelContent']['selectedIds']=[]
    state['privateContent'].update(search='finnwatch',filter='tax')
if '--finnwatch-incidence' in sys.argv:
    state['modelContent']['selectedIds']=['fw-wrappers','fw-dividend-withholding','fw-interest','tax-succession']
    state['privateContent'].update(search='finnwatch',filter='tax')
if '--yle' in sys.argv:
    state['modelContent']['selectedIds']=[]
    state['modelContent']['fundingChoices']={'yle':'keep-tax','farm':'redirect'}
    state['privateContent'].update(search='yle',filter='tax')
if '--additional' in sys.argv:
    state['modelContent']['selectedIds']=['sorsa-bank','sorsa-million-inheritance','fw-deemed-cost','fw-treaty-dividends']
    state['privateContent'].update(search='finnwatch',filter='tax')
prefix='qa-finnwatch' if '--finnwatch' in sys.argv else 'qa-rings' if '--rings' in sys.argv else 'qa-motion' if '--motion' in sys.argv else 'qa-horizon' if '--horizon' in sys.argv else 'qa'
if '--finnwatch-incidence' in sys.argv: prefix='qa-finnwatch-incidence'
if '--yle' in sys.argv: prefix='qa-yle'
if '--additional' in sys.argv: prefix='qa-additional'
fixture=folder/'qa-fragment.html'
fixture.write_text(source.replace('stateIn(readSharedState()||window.openai?.widgetState);render();','stateIn('+json.dumps(state)+');render();'),encoding='utf8')
page=render.render(fixture,'Silppuri QA')
for width in [320,390,1024]:
    (folder/f'{prefix}-{width}.html').write_text(page.replace('</head>',f'<style>body{{max-width:{width}px;padding:0;margin:0}}</style></head>',1),encoding='utf8')
print(f'QA pages: {prefix}, 320, 390, 1024 px; {len(state["modelContent"]["selectedIds"])} selected actions.')
