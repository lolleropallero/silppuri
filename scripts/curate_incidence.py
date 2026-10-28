"""Explicit, reviewable income-incidence models; never infer a model from title keywords."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def build_incidence(actions):
    raw=json.loads((ROOT/'data/sources/income-deciles-2024.json').read_text(encoding='utf8'))
    bounds=json.loads((ROOT/'data/sources/income-bounds-2024.json').read_text(encoding='utf8'))
    assert bounds['id']==['fraktiili_3_20221219','contentscode','timeperiod_y']
    assert bounds['size']==[10,2,1]
    assert list(bounds['dimension']['timeperiod_y']['category']['index'])==['2024']
    bound_index=bounds['dimension']['contentscode']['category']['index']
    income_bounds=[{'low':bounds['value'][i*2+bound_index['alaraja']],
                    'high':bounds['value'][i*2+bound_index['ylaraja']]} for i in range(10)]
    figures=json.loads((ROOT/'data/sources/vm-incidence-figures.json').read_text(encoding='utf8'))['charts']
    index=raw['dimension']['contentscode']['category']['index']
    def row(k): return raw['value'][index[k]*11+1:index[k]*11+11]
    count=row('asuntok'); units=[n*u for n,u in zip(count,row('modoecd_mean'))]
    def normalize(v):
        total=sum(v)
        assert total>0
        return [x/total for x in v]
    def profile(*keys): return normalize([sum(row(k)[i] for k in keys)*count[i] for i in range(10)])
    profiles={
        'income-tax':profile('tjt-ltva'),
        'taxable-income':profile('tjt-palk','tjt-yrtu','tjt-vanel','tjt-pelake','tjt-tyoel','tjt-saira'),
        'capital-income':profile('tjt-omtu'), 'capital-tax':profile('tjt-ltvp'),
        'dividends':profile('tjt-ostu'), 'entrepreneur':profile('tjt-yrtu'),
        'forest':profile('tjt-metu'), 'pensions':profile('tjt-vanel','tjt-pelake'),
        'students':profile('tjt-optuki'), 'housing':profile('tjt-asutu'),
        'family':profile('tjt-perav'), 'unemployment':profile('tjt-tyoel'),
        'wages':profile('tjt-palk'),
    }
    # Top-bracket changes: earned-income taxes of the two highest deciles only.
    profiles['income-tax-top']=normalize([v if i>=8 else 0 for i,v in enumerate(profiles['income-tax'])])
    for key in ['vat-standard','vat-reduced']:
        profiles[key]=normalize([v*u for v,u in zip(figures[key]['values'],units)])
    by_id={a['id']:a for a in actions}; models={}
    sisu_common='VM:n SISU-laskelma huomioi verot ja muiden etuuksien muutokset. Kuviosta luettu prosenttimuutos on muutettu euroiksi Tilastokeskuksen vuoden 2024 tulokymmenysten keskituloilla. Toimien yhteisvaikutuksia tai työllistymistä ei simuloida uudelleen.'
    def sisu(id,keys,**extra):
        parts=[figures[k] for k in keys.split()]
        a=by_id[id]
        models[id]=dict(kind='sisu',percent=[sum(p['values'][i] for p in parts) for i in range(10)],
            sources=['vm-'+p['report'] for p in parts]+['statfin'],pages=sorted(set(p['page'] for p in parts)),
            referenceTotal=(a['budget'][3] or 0)+(a['funds'][3] or 0),
            method=sisu_common,**extra)
    mapping={
      'cut-3-5':'child-siblings','cut-3-6':'child-under3','cut-3-7':'child-single','cut-3-8':'child-all',
      'cut-3-10':'maintenance','cut-3-11':'housing-regions','cut-3-12':'housing-rate',
      'cut-3-15':'unemployment-days','cut-3-32':'pension-disregard','cut-3-33':'pension-taper',
      'cut-3-36':'guarantee-remove','cut-3-37':'guarantee-level','cut-3-38':'guarantee-residence',
      'cut-3-39':'guarantee-age','cut-3-40':'pension-housing-merge','cut-3-42':'pension-housing-age',
      'cut-3-43':'disability-child disability-adult disability-pension','cut-3-61':'flexible-care',
      'income-index':'income-index',
    }
    for id,key in mapping.items(): sisu(id,key)
    sisu('benefits','benefit-index',indexScale=3.5)
    sisu('cut-3-34','pension-index',indexScale=3.5)
    for id in ['benefits','cut-3-34']:
        models[id]['method']+=' Indeksikuvio koskee yhden vuoden 2 % jäädytystä. Vuodelle 2031 vaikutusta skaalataan VM:n noin 7 % reaalileikkauksella (7/2); muina vuosina suhteessa raportin vuotuiseen säästöarvioon. Tämä jatkolaskelma on oma lineaarinen arvio.'
    def proxy(ids,weights,method,**extra):
        for id in ids.split():
            assert id in by_id,id
            models[id]=dict(kind='proxy',profiles=weights.split(),sources=['statfin'],method=method,**extra)
    proxy('income','taxable-income income-tax','Korotuksen suora verotuotto jaetaan kahdella tavalla: veronalaisia ansiotuloja kuvaavan tulosumman ja nykyisten ansiotuloverojen suhteessa. Haarukka näyttää näiden kohdentamistapojen eron. Uusia verorajoja ja vähennyksiä ei simuloida. Pienimpien tulojen verovaikutus voi tämän vuoksi ylittyä.')
    proxy('tax-capital-low tax-capital-high','capital-income capital-tax','Suora lisävero jaetaan omaisuustulojen ja nykyisten pääomatuloverojen suhteessa. Haarukka kuvaa jakaumaoletusta. 30 000 euron henkilökohtaista veroporrasta ei voi erottaa kotitalouksien summatilastosta.')
    proxy('dividends tax-dividend-return','dividends capital-tax','Suora verotuotto kohdennetaan osinkotulojen sekä nykyisten pääomatuloverojen jakaumilla. Tilasto sisältää myös pörssiosinkoja. Haarukka on tämän sijaisaineiston herkkyysvertailu; se ei ole listaamattomien yhtiöiden uudistuksen mikrosimulointi eikä luottamusväli.')
    proxy('tax-entrepreneur-remove tax-entrepreneur-step','entrepreneur','Suora lisävero kohdennetaan kotitalouksien yrittäjätulojen jakaumalla. Saman tuloryhmän kaikki jäsenet eivät ole yrittäjiä.')
    proxy('tax-forest','forest','Metsävähennyksen muutoksen suora lisävero kohdennetaan metsätalouden yrittäjätulojen jakaumalla. Metsän hankintahinnan ja vähennysoikeuden eroja ei ole eritelty.')
    proxy('tax-pension','pensions','Veronkorotuksen 100 miljoonan esimerkki kohdennetaan vanhuus- ja perhe-eläkkeiden jakaumalla. VM ei määritä korotuksen tarkkoja tulorajoja, joten kyse on kohdentumisskenaariosta.')
    proxy('cut-2-53 cut-2-54 cut-2-55 cut-2-59 cut-2-60 cut-4-47','students','Menetys jaetaan kotitalouksien opintoetuuksien jakaumalla. Tämä tunnistaa opiskelijoiden nykyisen tulotason, mutta ei erottele huoltajia, ateriatukea tai maksujen saajia. Julkisen talouden suorasta summasta muodostetaan kohdentumisarvio; valmistumisen jälkeiset tulot eivät sisälly siihen.',amountBasis='public-total')
    models['cut-2-60']['method']+=' Ateriatuen poiston oletetaan siirtyvän kokonaan aterioiden hintoihin. Aterioinnin muutosta ei ole arvioitu.'
    models['cut-4-47']['method']+=' Maksu oletetaan opiskelijan maksettavaksi. YTHS:n maksuvelvollisten jakauma voi poiketa opintoetuuksien jakaumasta.'
    # VAT profiles come from actual consumption patterns, not income or invented shares.
    proxy('tax-vat-standard','vat-standard','VM:n yleisen ALV-kannan yhden prosenttiyksikön SISU-kulutusprofiili. Suora veronkorotus jaetaan tämän profiilin suhteessa. Vero oletetaan kokonaan hintoihin; kysyntää tai etuuksien indeksikorvauksia ei vähennetä ostovoimamenetyksestä.')
    proxy('tax-vat-reduced tax-vat15 tax-vat16 vat','vat-reduced','VM:n 13,5 % ALV-kannan kulutusprofiili on korotuksen jakauman pohja. Suora verotuotto jaetaan kulutusprofiilin mukaan. Mukana olevien 10 % tuotteiden jakauma voi poiketa tästä. Kyse on omasta skaalauksesta, ei VM:n suuren korotuksen tulonjakolaskelmasta. Hinnat nousevat täyden veron verran; etuusindeksien korvauksia ja kulutuksen muutoksia ei arvioida.')
    for id in ['tax-vat-standard','tax-vat-reduced','tax-vat15','tax-vat16','vat']:
        models[id]['sources'].append('vm-48'); models[id]['pages']=[152]
    # All remaining actions receive an explicit non-monetised assessment, not a silent zero.
    unmodelled={}
    for a in actions:
        if a['id'] in models: continue
        unmodelled[a['id']]={
            'who':a['who'],
            'finding':a.get('research',{}).get('finding') or a.get('society',''),
            'sources':a.get('research',{}).get('sources',[]),
        }
    model={
      'asOf':'2026-10-28','referenceYear':2024,'income':row('tjt-ekvikturaha_mean'),
      'incomeBounds':income_bounds,
      'households':count,'consumptionUnits':units,'profiles':profiles,'actions':models,
      'sources':{
        'statfin':{'label':'Tilastokeskus: tulonjakotilasto 2024, taulukko 128c','url':'https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__tjt/statfin_tjt_pxt_128c.px/'},
        'income-bounds':{'label':'Tilastokeskus: tulokymmenysten tulorajat 2024, taulukko 11wh','url':'https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__tjt/statfin_tjt_pxt_11wh.px/'},
        'vm-44':{'label':'VM 2026:44: SISU-tulonjakolaskelmat','url':'https://urn.fi/URN:ISBN:978-952-367-603-9'},
        'vm-48':{'label':'VM 2026:48: verojen tulonjakolaskelmat','url':'https://urn.fi/URN:ISBN:978-952-367-619-0'},
      },
      'international':[
        {'label':'IFS 2019 · Britannian verot ja etuudet 2010–2019','url':'https://ifs.org.uk/publications/distributional-impact-personal-tax-and-benefit-reforms-2010-2019',
         'finding':'Britannian muutoksissa alimman tulokymmenyksen keskimääräinen menetys oli 11 % tuloista, ylimmän 2 %. Pienituloisissa lapsiperheissä menetys oli 20 %. Tulos koskee koko toteutettua pakettia, ei yhden etuuden leikkausta.', 'flows':['support','families','pension']},
        {'label':'Ganong & Noel 2019 · USA, pankkitiliaineisto','url':'https://www.aeaweb.org/articles?id=10.1257/aer.20170537',
         'finding':'Työttömyysturvan päättyminen pudotti kulutusta jyrkästi, vaikka tulonmenetys oli ennakoitavissa. Tulos tukee etuusleikkausten kulutuskanavaa. Koko tuen loppumisen vaikutusta ei käytetä pienen indeksileikkauksen kertoimena.', 'flows':['support']},
        {'label':'Fuest, Peichl & Siegloch 2018 · Saksa','url':'https://www.aeaweb.org/articles?id=10.1257/aer.20130570',
         'finding':'Saksan kuntien yritysveromuutoksissa noin puolet kokonaisrasituksesta siirtyi työntekijöille. Vaikutus oli suurempi vähän koulutetuilla, nuorilla ja naisilla. Tämä on yhden maan kunnallisveroa koskeva tulos. Knaischin ja Pöschelin (2024) meta-analyysissa keskimääräinen palkkavaikutus ei erottunut nollasta julkaisuharhan korjauksen jälkeen.', 'ids':['corporate']},
        {'label':'Ball ym. 2013 · 17 OECD-maata','url':'https://www.elibrary.imf.org/view/journals/001/2013/151/article-A001-en.xml',
         'finding':'Sopeutusjaksoihin liittyi tuloerojen ja pitkäaikaistyöttömyyden kasvua sekä palkkatulo-osuuden laskua. Menoleikkauksiin painottuvien pakettien tulonjakovaikutukset olivat suurempia. Paketin rakenne ja taloussuhdanne vaikuttavat; tulos ei anna jokaiselle leikkauseurolle yhtä kerrointa.', 'flows':['support','families','pension','services','employees','research']},
      ],
      'unmodelled':unmodelled,
    }
    from extend_incidence import extend
    extend(model,actions)
    assert all(len(m.get('percent',[0]*10))==10 for m in models.values())
    (ROOT/'data/incidence-model.json').write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    return model
