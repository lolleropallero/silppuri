"""Build the self-contained Silppuri concept from reviewed VM source data."""
import json
import argparse
from pathlib import Path
from finnwatch_models import calculate as calculate_finnwatch, apply_estimates
from additional_tax_models import calculate as calculate_additional, apply as apply_additional
from audit_corrections import apply_actions, apply_inputs, apply_sources, apply_research

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--out', type=Path, default=ROOT/'tmp/silppuri-konsepti.html')
parser.add_argument('--production', action='store_true', help='Also export the deployable website to dist/index.html')
args = parser.parse_args()
OUT = args.out
OUT.parent.mkdir(parents=True, exist_ok=True)
ANNEX = 'https://julkaisut.valtioneuvosto.fi/server/api/core/bitstreams/cc17f785-1f60-4239-bf43-adf73cfdbf2c/content'
def read_psv(name, size):
    rows=[]
    for line in (ROOT/'data'/name).read_text(encoding='utf-8').splitlines():
        if not line or line.startswith('#'): continue
        cells=line.split('|')
        assert len(cells)==size, (name, cells[0], len(cells))
        rows.append(cells)
    return rows

raw=json.loads((ROOT/'data/vm-spending-source.json').read_text(encoding='utf-8'))
long_run=json.loads((ROOT/'data/long-run-estimates.json').read_text(encoding='utf-8'))
spending_nets=json.loads((ROOT/'data/spending-net-estimates.json').read_text(encoding='utf-8'))
copies={r[0]:r[1:] for r in read_psv('cut-copy.psv',5)}
aliases={'4-32':'health','2-47':'education','3-59':'benefits'}
fee_keys={'1-30','1-75','2-11','2-13','2-14','2-41','2-43','2-45','2-74','4-16','4-17','4-18','4-19','4-20','4-21','4-22','4-24','4-30','4-47','5-22','5-33','5-64','5-75'}
def cid(key): return aliases.get(key,'cut-'+key)
def numeric(v): return isinstance(v,(int,float)) and not isinstance(v,bool)
def series(values, known): return [round(v,6) if numeric(v) else (0 if known else None) for v in values]
catalogue=[]; coverage=[]
small_envelopes={'4-44':11.6,'4-45':5.1}
for row in raw:
    key=row['key']; known=any(numeric(v) for v in row['budget']+row['funds'])
    combined=[(a if numeric(a) else 0)+(b if numeric(b) else 0) for a,b in zip(row['budget'],row['funds'])]
    peak=max([abs(v) for v in row['budget']+row['funds'] if numeric(v)]+[abs(v) for v in combined]+[0])
    status='included' if key in copies else 'below-20m'
    assert key in copies or peak<20, (key,peak)
    coverage.append({'key':key,'title':row['title'],'status':status,'maxReportedMillion':peak})
    if key=='1-43':
        coverage[-1].update(status='merged',mergedInto='cut-1-42',reason='Ylen 10 ja 20 prosentin vaihtoehdot on yhdistetty säädettävään rahoitusleikkaukseen.')
        continue
    if key in small_envelopes:
        coverage[-1].update(status='below-20m-envelope',maxPotentialMillion=small_envelopes[key],
                            reason='Koko siirrettävä rahoitus on alle 20 milj. euroa; hallinnon säästö tätä pienempi.')
        continue
    if key not in copies: continue
    title,flow,who,society=copies[key]
    d=dict(id=cid(key),type='tax' if key in fee_keys|{'1-15','1-16','1-76','7-29'} else 'cut',title=title,short=title,
           kind='Maksukorotus' if key in fee_keys else 'Omaisuustulo' if key in {'1-76','7-29'} else '',
           flow=flow,who=who,society=society,impact=who,detail=row['notes'],
           budget=series(row['budget'],known),funds=series(row['funds'],known),
           source=f"VM 2026:44, Excel-liite: {row['sheet']}, rivi {row['row']}",
           memo=row['memo'],sourceKey=key,report='cut',sourceUrl=ANNEX,unit='',family='',conflicts=[])
    if key=='4-32':
        d['budget']=[820,1630,2460,3310,3310,3310,3310,3310]
        d['funds']=[0]*8
        d['source']+='; raportin indeksitaulukko s. 570'
        d['continuationNote']='2032–2035: oma vakionimellinen jatko vuoden 2031 tasolla. Jäädytys alentaa rahoituspohjaa, ellei sitä palauteta. Myöhempiä indeksikorotuksia ei ole ennustettu.'
    if d['id'] in spending_nets['actions']:
        method=spending_nets['methods'][spending_nets['actions'][d['id']]]
        d['spendingNet']={**method,'source':spending_nets['source'],'sourceUrl':spending_nets['sourceUrl']}
    if key in ['1-16','2-9']:
        d['directOnly']=True
    if key=='1-42':
        d['conditional']='yle'
        d['filterTypes']=['cut','tax']
        d['kind']='Rahoitus ja vero'
        d['mergedIds']=['cut-1-43']
        d['fundingCut']={'referenceMillion':593.7,'startYear':2028,'endYear':2035,
                         'defaultPercent':20,'step':5,'minPercent':5,'maxPercent':100,
                         'vmVariants':{str(p):series(next(r for r in raw if r['key']==k)['budget'],True)
                                       for p,k in [(10,'1-43'),(20,'1-42')]}}
        d['source']=d['source'].replace('rivi 42','rivit 42–43')
    if key=='1-72': d['conditional']='farm'
    if key in ['1-24','5-19','5-8','5-9']:
        d['cashOnly']=True
        # Financial transactions do not automatically reduce the national-accounts deficit.
    if key=='3-48': d['who']='Sairauspäivärahaa ja muita näitä etuuksia saavilta heidän tulevissa eläkkeissään.'
    if key=='3-62':
        # The annex reports direct effects only. The report's overall effect,
        # including employment, changes sign in the 2030s without a euro series.
        d['unquantifiedNet']=True
        d['source']+='; kokonaisvaikutus ja suorien vaikutusten rajaus: VM 2026:44, s. 348–355'
    if d['id'] in long_run:
        d['longRunEstimate']=long_run[d['id']]
    if key in ['5-49','5-52']:
        d['zeroNote']='Vuoden 2035 puolustusmenotavoite voi kumota indeksisäästön lisärahoituksella.'
    catalogue.append(d)

tax_effects={row[0]:row[1:] for row in read_psv('tax-effects.psv',3)}
tax_nets=json.loads((ROOT/'data/tax-net-estimates.json').read_text(encoding='utf-8'))
for id,title,amount,flow,who,society,page,unit,family in read_psv('tax-copy.psv',9):
    n=float(amount) if amount else None
    social_text,money_note=tax_effects.get(id,(society,''))
    catalogue.append(dict(id=id,type='tax',title=title,short=title,flow=flow,who=who,society=social_text,moneyNote=money_note,
        impact=who,detail=society,budget=[n]*8,funds=[0]*8 if n is not None else [None]*8,
        source=f'VM 2026:48, liite 1, s. {page}',report='tax',sourceUrl='https://urn.fi/URN:ISBN:978-952-367-619-0',
        unit=unit,family=family,net=tax_nets.get(id),conflicts=[],earliest=2029 if id in ['tax-diesel','tax-van','tax-vehicle'] else 2028))

by_id={d['id']:d for d in catalogue}
by_id['tax-peat']['unquantifiedNet']=True
assert len(by_id)==len(catalogue)
# Finnwatch proposals share the catalogue and all selection paths. Upsert the
# existing succession proposal so persisted selections never acquire a duplicate.
finnwatch=json.loads((ROOT/'data/finnwatch-actions.json').read_text(encoding='utf-8'))
finnwatch_results=calculate_finnwatch(json.loads((ROOT/'data/finnwatch-estimates.json').read_text(encoding='utf-8')))
apply_estimates(finnwatch,finnwatch_results)
(ROOT/'data/finnwatch-results.json').write_text(json.dumps(finnwatch_results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
additional=json.loads((ROOT/'data/additional-tax-actions.json').read_text(encoding='utf-8'))
additional_inputs=json.loads((ROOT/'data/additional-tax-inputs.json').read_text(encoding='utf-8'))
apply_inputs(additional_inputs)
additional_results=calculate_additional(additional_inputs)
apply_additional(additional,additional_results)
apply_actions(finnwatch+additional)
(ROOT/'data/additional-tax-results.json').write_text(json.dumps(additional_results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for proposal in finnwatch+additional:
    d=by_id.get(proposal['id'])
    if d is None:
        d=dict(id=proposal['id'],type='tax',report='tax',unit='',family='',conflicts=[])
        catalogue.append(d);by_id[d['id']]=d
    d.update({k:v for k,v in proposal.items() if k!='incidence'})
    amount=proposal['estimate']['amount']
    origin=proposal.get('origin','finnwatch')
    d.update(short=d['title'],kind=('Kalevi Sorsa -säätiö' if origin=='sorsa' else 'Finnwatch')+' · veromuutos',origin=origin,
             budget=[amount]*8,funds=[0 if amount is not None else None]*8,
             detail='',moneyNote='',net=None)
# The working group's narrower tax base yields 30m, not the annex's 60m
# whole-area multiplication. This is revenue before all administration costs.
by_id['cut-1-75']['revenueEstimate']={'amount':30,'label':'MMM:n maksukertymä · nettoa ei laskettu'}
assert set(tax_nets)<=set(by_id)
for id,net in tax_nets.items():
    assert 0<=net['low']<=net.get('high',net['low'])
    assert net['low']<=max(v for v in by_id[id]['budget'] if v is not None)
    by_id[id]['net']=net
    if id=='cut-1-15':by_id[id]['earliest']=2029

# Apply the existing size cutoff to the best available estimate. Keep the
# original report figures and the exclusion reason in the coverage audit.
excluded_net={id for id,net in tax_nets.items() if net.get('high',net['low'])<20}
for d in catalogue:
    if d.get('spendingNet'):
        if max(v or 0 for v in d['budget'])*d['spendingNet']['factors'][1]<20:
            excluded_net.add(d['id'])
for row in coverage:
    if cid(row['key']) in excluded_net:
        row['status']='below-20m-net'
        id=cid(row['key'])
        row['maxNetMillion']=tax_nets[id].get('high',tax_nets[id]['low']) if id in tax_nets else max(v or 0 for v in by_id[id]['budget'])*by_id[id]['spendingNet']['factors'][1]
# Scope is reviewed from the underlying policy, never inferred from a title
# containing "temporary" or a missing/zero estimate at the end of the horizon.
# An index freeze can lower the subsequent payment base and remains eligible.
nonrecurring=json.loads((ROOT/'data/nonrecurring-exclusions.json').read_text(encoding='utf-8'))
assert set(nonrecurring)<=set(by_id)
for row in coverage:
    if cid(row['key']) in nonrecurring:
        exclusion=nonrecurring[cid(row['key'])]
        row.update(status='nonrecurring',reason=exclusion['reason'],category=exclusion['category'])
catalogue=[d for d in catalogue if d['id'] not in excluded_net and d['id'] not in nonrecurring]
by_id={d['id']:d for d in catalogue}
def conflict(*ids):
    ids=[cid(x) if x[0].isdigit() else x for x in ids]
    for a in ids:
        for b in ids:
            if a!=b and a in by_id and b in by_id and b not in by_id[a]['conflicts']: by_id[a]['conflicts'].append(b)
def overlap(parent,children):
    parent=cid(parent) if parent[0].isdigit() else parent
    for child in children:
        child=cid(child) if child[0].isdigit() else child
        if child in by_id and parent in by_id and parent!=child:
            for a,b in [(parent,child),(child,parent)]:
                if b not in by_id[a]['conflicts']:by_id[a]['conflicts'].append(b)

for keys in [
 ['1-5','1-6'],['1-25','1-26'],['1-15','1-16'],['1-55','1-56'],['1-57','1-58'],
 ['2-11','2-13','2-14'],['2-20','2-21'],['2-26','2-27','2-28'],['2-34','2-35'],['2-38','2-39','2-42'],
 ['2-43','2-44','2-45','2-47'],['2-51','2-52'],['2-57','2-58','2-59'],['2-61','2-62'],
 ['2-65','2-66'],['2-67','2-68'],['2-77','2-78'],['3-11','3-12'],['3-32','3-33','3-34'],
 ['3-36','3-37','3-38','3-39'],['3-40','3-42'],['3-50','3-51'],['3-68','3-69'],
 ['4-6','4-7'],['4-16','4-17','4-18','4-19'],['4-25','4-26','4-27'],['4-29','4-30'],
 ['5-49','5-50','5-51'],['5-50','5-51','5-52'],['5-62','5-72'],['6-5','6-6','6-7'],
 ['7-12','7-28'],['7-41','7-42'],['7-44','7-46'],['7-48','7-49'],['7-50','7-51']
]:conflict(*keys)
for family in set(d['family'] for d in catalogue)-{''}:conflict(*[d['id'] for d in catalogue if d['family']==family])
# Disjoint VAT bases can coexist. Their revenue estimates can still overlap.
def possible_overlap(a,b,note):
    if a not in by_id or b not in by_id:return
    for left,right in [(a,b),(b,a)]:
        if right in by_id[left]['conflicts']:by_id[left]['conflicts'].remove(right)
        by_id[left].setdefault('possibleOverlaps',[]).append({'id':right,'note':note})
possible_overlap('tax-food18','tax-vat-services','Molempiin laskelmiin sisältyy lehtien ALV-muutos. Yhteissummassa on enintään 22 milj. euroa samaa suoraa tuottoa; yhteisnettoa ei ole laskettu.')
overlap('3-8',['3-5','3-6','3-7'])
overlap('3-67',['3-65','3-66'])
overlap('1-69',['1-55','1-56','1-57','1-58','1-72'])
for parent in ['1-5','1-6']:overlap(parent,['1-7','1-8','5-56','1-25','1-26'])
for parent in ['1-25','1-26']:overlap(parent,['1-11','1-41'])
for parent in ['2-57','2-58','2-59']:overlap(parent,['2-53','2-54','2-55'])
overlap('2-32',['2-61','2-62'])
overlap('3-40',['3-11','3-12'])
overlap('benefits',['3-34','3-36','3-37','3-38','3-39','3-43','2-55','3-13'])
# A worksheet is not a set of mutually exclusive policies. In particular,
# separate grants, training reimbursements and YTHS funding are not the
# wellbeing services counties' general funding covered by the index freeze.
regional_cost_measures=['4-5','4-6','4-7','4-9','4-11','4-14','4-16','4-17','4-18','4-19',
                       '4-20','4-21','4-22','4-24','4-25','4-26','4-27','4-29','4-30',
                       '4-31','4-33','4-34','4-35','4-36','4-37']
for key in regional_cost_measures:
    other=cid(key)
    if other not in by_id: continue
    note='Toimi voi kattaa osan hyvinvointialueiden indeksijäädytyksen vaatimasta sopeutuksesta. Yhteisvaikutusta ei ole arvioitu; summissa voi olla samaa säästöä.'
    for a,b in [('health',other),(other,'health')]:
        by_id[a].setdefault('possibleOverlaps',[]).append({'id':b,'note':note})
overlap('5-55',['5-50','5-51'])
overlap('5-75',['5-64','5-22','5-33'])
index_ids=[d['id'] for d in catalogue if 'indeksi' in d['title'].lower() and d['type']=='cut' and d['id']!='health']
for parent in ['6-5','6-6','6-7']:overlap(parent,index_ids+['health'] if parent!='6-5' else index_ids)
staff=[d['id'] for d in catalogue if d['flow']=='employees']
for parent in ['7-41','7-42','7-52']:overlap(parent,staff+['5-42','7-18'])
# A funding constraint and a way to reduce costs can coexist. Their estimates
# may share costs; that is not grounds for deleting either policy choice.
# Regional shares are from the VM spending annex, rows 7-41, 7-42 and 7-52.
for key,regional in [('7-41',144),('7-42',1123),('7-52',141)]:
    id=cid(key)
    note=(f'Hyvinvointialueiden osuus henkilöstötoimen vuotuisesta arviosta on {regional:,} milj. euroa. '
          'Sama säästö voi kattaa osan indeksijäädytyksen vaatimasta sopeutuksesta. '
          'Yhteistä säästöä ei ole laskettu; summassa mahdollista päällekkäisyyttä.').replace(',', ' ')
    for a,b in [('health',id),(id,'health')]:
        by_id[a].setdefault('possibleOverlaps',[]).append({'id':b,'note':note})
for parent in ['7-24']:
    overlap(parent,[d['id'] for d in catalogue if any(s in d['title'].lower() for s in ['avustu','yritystuki','yritystu','taiteen','tasa-arvora','liikunnan','kulttuuri','suomi liikkeelle'])])
for parent in ['vat','tax-vat15','tax-vat16','tax-food18','tax-vat-services']:
    overlap(parent,['tax-vat-news135','tax-vat-news255'])
    possible_overlap(parent,'tax-vat-standard','Yleisen ALV-kannan korotus voidaan yhdistää tähän muutokseen, mutta yhteinen veropohja muuttuu. Näytetty summa on erillisarvioiden summa, ei yhdistelmän nettolaskelma.')

for d in catalogue:
    for other in list(d['conflicts']):
        assert other in by_id,(d['id'],other)
        conflict(d['id'],other)
    for o in list(d.get('possibleOverlaps',[])):
        assert o['id'] in by_id,(d['id'],o['id'])
        inverse=by_id[o['id']].setdefault('possibleOverlaps',[])
        if not any(x['id']==d['id'] for x in inverse):inverse.append({'id':d['id'],'note':o['note']})

research=json.loads((ROOT/'data/action-research.json').read_text(encoding='utf-8'))
research_sources=json.loads((ROOT/'data/research-sources.json').read_text(encoding='utf-8'))
source_summaries=json.loads((ROOT/'data/source-summaries.json').read_text(encoding='utf-8'))
source_notes=json.loads((ROOT/'data/source-notes.json').read_text(encoding='utf-8'))
apply_sources(research_sources,source_summaries)
apply_actions(catalogue)
for url,note in source_notes.items():
    if 'researchSummary' in note: source_notes[url]=source_summaries[note['researchSummary']]
    assert source_notes[url].get('summary') and source_notes[url].get('limit'), url
for d in catalogue:
    r=apply_research(d['id'],d.get('research') or research[d['id']])
    if r['status']=='skipped':
        assert d.get('cashOnly'), d['id']
        continue
    assert r['fiscal'] and r['scope'], d['id']
    assert set(r['sources'])<=set(research_sources), d['id']
    d['research']=r
used_sources={s for d in catalogue for s in d.get('research',{}).get('sources',[])}
for key in used_sources:
    assert source_summaries.get(key,{}).get('summary') and source_summaries[key].get('limit'), key
research_sources={s:{**research_sources[s],**source_summaries[s]} for s in sorted(used_sources)}

meta={'thresholdMillion':20,'count':len(catalogue),'cutRows':sum(d['report']=='cut' for d in catalogue),'taxRows':sum(d['report']=='tax' for d in catalogue),'finnwatchRows':sum(d.get('origin')=='finnwatch' for d in catalogue),'sorsaRows':sum(d.get('origin')=='sorsa' for d in catalogue),
      'netEstimates':sum(bool(d.get('net')) for d in catalogue),'excludedBelow20mNet':sorted(excluded_net),
      'excludedNonrecurring':sorted(nonrecurring),
      'unknown':sum(d.get('unquantifiedNet',False) or all(x is None for x in d['budget']) for d in catalogue),
      'scope':'Koko julkinen talous: valtio, kunnat, hyvinvointialueet ja sosiaaliturvarahastot. Verot vuoden 2028 tasossa.'}
meta['research']={'reviewed':sum('research' in d for d in catalogue),'sources':len(research_sources),
                  'withExternalResearch':sum(bool(d.get('research',{}).get('sources')) for d in catalogue),
                  'vmOnly':sum(d.get('research',{}).get('status') in ['vm-only','unspecified'] for d in catalogue),
                  'contextOnly':sum(d.get('research',{}).get('status')=='context' for d in catalogue),
                  'asOf':'2026-10-28'}
(ROOT/'data/catalogue.json').write_text(json.dumps({'meta':meta,'actions':catalogue},ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'data/coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2),encoding='utf-8')
template=(ROOT/'src/silppuri.template.html').read_text(encoding='utf-8')
markup=template.split('<script>')[0]
# User-selected library artwork, kept locally so the logo needs no network request.
# Geometry is unchanged; remove the white backdrop and inherit the wordmark color.
logo=(ROOT/'src/assets/claw-slashes.svg').read_text(encoding='utf-8').strip()
logo=logo.replace('<path fill="#fff" d="M0 0h512v512H0z"/>','')
logo=logo.replace('fill="#000"','fill="currentColor"')
logo=logo.replace('<svg ', '<svg class="sp-logo" width="30" height="30" aria-hidden="true" focusable="false" ', 1)
markup=markup.replace('<!--SILPPURI_LOGO-->',logo)
markup=markup.replace('<!--INCIDENCE_METHOD-->',(ROOT/'src/incidence-method.html').read_text(encoding='utf-8'))
markup=markup.replace('</style>',(ROOT/'src/catalogue.css').read_text(encoding='utf-8')+'\n</style>')
markup=markup.replace('</style>',(ROOT/'src/share.css').read_text(encoding='utf-8')+'\n</style>')
markup=markup.replace('<div class="sp-chart">','<div class="sp-horizon" role="group" aria-label="Säästöjen ajankohta"><button type="button" class="cursor-interaction" data-horizon="2031" aria-pressed="true">2031</button><button type="button" class="cursor-interaction" data-horizon="later" aria-pressed="false">Myös myöhemmät</button></div><div class="sp-chart">',1)
markup=markup.replace('Laskuri laskee valittujen toimien arviot yhteen. Arviot ovat eri vuosilta. Lopullinen säästö riippuu myös siitä, miten toimet muuttavat kulutusta, työntekoa ja yritysten toimintaa.',
 'Piirakka laskee koko julkisen talouden vaikutuksen: valtio, kunnat, hyvinvointialueet sekä eläke- ja muut sosiaaliturvarahastot. Nettoarvio on käytössä aina, kun se on saatavilla; vaihteluvälistä käytetään alarajaa. Muuten mukana on suora arvio. Kaikkia käyttäytymisvaikutuksia ja toimien yhteisvaikutuksia ei ole laskettu. 2031 näyttää kyseisen vuoden menosäästöt. Myös myöhemmät käyttää niiden tilalla suurempia vuosien 2032–2035 vuosiarvioita. Tätä kauemmas ulottuvat arviot näytetään kortilla, mutta niitä ei summata piirakkaan. Ne merkitään tähdellä ja ajankohdalla: summa yhdistää eri ajankohtien vuosivaikutuksia, ei vuosien aikana kertynyttä säästöä eikä yhden tulevan vuoden ennustetta. Verot ovat pääosin vuoden 2028 tasossa. Jos maksajaryhmän säästö on vuonna 2031 nolla, sen tuleva vuosiarvio näkyy tähdellä myös 2031-näkymässä. Vain vuosien 2032–2035 arviot tulevat mukaan Myös myöhemmät -valinnalla. Sektorien osuudet näkyvät toimien lähdetiedoissa.')
markup=markup.replace('<div class="sp-action-list">','<div class="sp-catalogue-tools"><label>Hae toimea<input id="sp-search" type="search" placeholder="Esim. Yle, eläke, yritys…"></label><label>Kohde<select id="sp-category"><option value="all">Kaikki kohteet</option></select></label><label>Järjestys<select id="sp-sort"><option value="desc">Suurin ensin</option><option value="asc">Pienin ensin</option></select></label></div><p class="sp-results" aria-live="polite"></p><div class="sp-action-list">',1)
markup=markup.replace('Isoista paloista alkuun','Valitse mistä otetaan')
markup=markup.replace('Veronkorotukset','Verot ja muut tulot')
# Do not leave the old nine-example count in the expanded catalogue.
import re
markup=re.sub(r'9 esimerkkitoimea[^<]*',f'{len(catalogue)} toimea ja vaihtoehtoa',markup)
markup=markup.replace('<div class="sp-filters"','<p class="sp-threshold-note">Alle 20 milj. €/vuosi jäävät toimet on karsittu; avoimet arviot on merkitty.</p><div class="sp-filters"',1)
markup=markup.replace('Sektorien osuudet näkyvät toimien lähdetiedoissa.', 'Sektorien osuudet näkyvät toimien lähdetiedoissa.</p><p>Määräaikaisten menojen aikaistetut lopetukset, pelkät menojen lykkäykset ja kertaluonteiset omaisuus- ja rahoitusvarasiirrot on rajattu pois. Indeksijäädytyksiä ei poisteta määräaikaisuuden perusteella: ne voivat jättää myöhempien maksujen pohjan alemmaksi. Työeläkejäädytyksen vaikutus kuitenkin hiipuu ajan myötä, ja puolustusmenojen myöhempi kasvutavoite voi kumota indeksisäästöä. Toimikohtaiset rajoitukset ovat lähdetiedoissa.')
markup=markup.replace('<div class="sp-flow-graph">','<p class="sp-flow-empty" hidden>Ei vielä valittuja toimia.</p><div class="sp-flow-graph">',1)
markup=markup.replace('Alle 20 milj. €/vuosi jäävät toimet on karsittu; avoimet arviot on merkitty.',
                      'Mukana toimet, joiden arvio yltää 20 milj. euroon vuodessa; avoimet arviot on merkitty.')
# Original annex prose remains in catalogue.json. The interface exclusively uses
# the reviewed who/society/research fields, so do not embed unused duplicate text.
runtime_catalogue=[{k:v for k,v in d.items() if k!='detail'} for d in catalogue]
script=(ROOT/'src/app.js').read_text(encoding='utf-8').replace('[]/*CATALOGUE*/',json.dumps(runtime_catalogue,ensure_ascii=False,separators=(',',':')).replace('</',r'<\/'))
script=script.replace('{}/*RESEARCH_SOURCES*/',json.dumps(research_sources,ensure_ascii=False,separators=(',',':')).replace('</',r'<\/'))
compact_notes={url:({'researchSummary':raw['researchSummary']} if raw.get('researchSummary') in research_sources else source_notes[url])
               for url,raw in json.loads((ROOT/'data/source-notes.json').read_text(encoding='utf-8')).items()}
script=script.replace('{}/*SOURCE_NOTES*/',json.dumps(compact_notes,ensure_ascii=False,separators=(',',':')).replace('</',r'<\/'))
from curate_incidence import build_incidence
incidence=build_incidence(catalogue)
script=script.replace('{}/*INCIDENCE_DATA*/',json.dumps(incidence,ensure_ascii=False,separators=(',',':')).replace('</',r'<\/'))
script=script.replace('/*INCIDENCE_ENGINE*/',(ROOT/'src/incidence.js').read_text(encoding='utf8'))
script=script.replace('/*INCIDENCE_VIEW*/',(ROOT/'src/incidence-view.js').read_text(encoding='utf8'))
script=script.replace('/*PIE_INTERACTION*/',(ROOT/'src/pie-interaction.js').read_text(encoding='utf8'))
script=script.replace('/*MODAL_SHRED*/',(ROOT/'src/modal-shred.js').read_text(encoding='utf8'))
for part in ['state','editorial','summary','social','image','png','ui']:
    script=script.replace('/*SHARE_'+part.upper()+'*/',(ROOT/f'src/share-{part}.js').read_text(encoding='utf8'))
OUT.write_text(markup+'<script>\n'+script+'\n</script>\n',encoding='utf-8')
from export_site import export_site
export_site(OUT.read_text(encoding='utf8'), ROOT/'tmp/local-site/index.html')
if args.production:
    export_site(OUT.read_text(encoding='utf8'), ROOT/'dist/index.html')
assert OUT.stat().st_size<1_000_000, OUT.stat().st_size
print(json.dumps(meta,ensure_ascii=False)); print('Fragment bytes:',OUT.stat().st_size)
if args.production:
    print('Production site:', ROOT/'dist/index.html')
