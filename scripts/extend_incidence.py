"""Explicit supplementary incidence scenarios, with service costs kept out of cash income.

All allocations are evidence-informed accounting scenarios, not causal Finnish
microsimulation estimates. No model is selected by matching title keywords.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def extend(model, actions):
    excluded=set(json.loads((ROOT/'data/nonrecurring-exclusions.json').read_text(encoding='utf8')))
    excluded.update(id for d in actions for id in d.get('mergedIds',[]))
    def read(name): return json.loads((ROOT/'data/sources'/name).read_text(encoding='utf8'))
    def normal(v):
        assert all(x is not None and x>=0 for x in v),v
        assert sum(v)>0
        return [x/sum(v) for x in v]
    def cell(table, **keys):
        offset=0
        for dim,size in zip(table['id'],table['size']):
            key=keys.get(dim)
            if key is None:
                assert size==1,dim
                pos=0
            else: pos=table['dimension'][dim]['category']['index'][key]
            offset=offset*size+pos
        return table['value'][offset]
    profiles=model['profiles']; specs=model['actions']; by_id={a['id']:a for a in actions}
    income=read('income-deciles-2024.json')
    income_index=income['dimension']['contentscode']['category']['index']
    def income_row(code): return income['value'][income_index[code]*11+1:income_index[code]*11+11]
    for name,codes in {'agriculture':['tjt-matu'],'last-resort':['tjt-muutuki'],'sickness':['tjt-saira'],
                       'disability':['tjt-vamtyoky'],'population':['tjt-henkiloita']}.items():
        v=[sum(income_row(k)[i] for k in codes) for i in range(10)]
        profiles[name]=normal(v if name=='population' else [x*n for x,n in zip(v,model['households'])])
    def split_quintiles(q):
        # Equal effect per consumption unit within the observed quintile.
        units=model['consumptionUnits']
        return normal([q[i//2]*units[i]/sum(units[i//2*2:i//2*2+2]) for i in range(10)])
    consumption=read('consumption-2022.json'); households=read('consumption-households-2022.json')
    quintile_units=[cell(households,tuloviidennes_2_20140501=str(i),contentscode='pklkm_sum')*
                    cell(households,tuloviidennes_2_20140501=str(i),contentscode='oecdmod_mean') for i in range(1,6)]
    categories={'total':'0','food':'01','tobacco':'023','electricity':'0451','heating':'045',
                'drugs':'0611','health':'06','dental':'0622','aids':'0613','cars':'0711',
                'fuel':'0722','diesel':'07221','travel':'073','flights':'0733',
                'culture':'09','news':'0972','insurance':'121'}
    for name,code in categories.items():
        values=[cell(consumption,coicop_46_20231201=code,tuloviidennes_2_20140501=str(i)) for i in range(1,6)]
        profiles['consumption-'+name]=split_quintiles(normal([v*u for v,u in zip(values,quintile_units)]))
    services=read('services-finland-2007.json')
    for name,p in services['profiles'].items():profiles['service-'+name]=split_quintiles(p['quintiles'])
    wealth=read('wealth-2023.json')
    for name,code in {'housing':'asvara','home':'asarav','shares':'pymar','unlisted':'muosa',
                      'assets':'bruttoae_DA1000','land-business':'muurealvar',
                      'insurance':'vaksak','funds':'sirave','listed':'porsosa','financial':'finan'}.items():
        profiles['wealth-'+name]=normal([cell(wealth,vtutk_varlaji_6_20200101=code,desiilit_2_20120101=str(i),contentscode='vtutk_keskiarvo_n')*
             cell(wealth,vtutk_varlaji_6_20200101=code,desiilit_2_20120101=str(i),contentscode='vtutk_kotitalouksia_perusjoukko') for i in range(1,11)])
    model['sources'].update({
      'consumption':{'label':'Tilastokeskus: kulutustutkimus 2022, 14pg ja 14qa','url':'https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__ktutk/statfin_ktutk_pxt_14pg.px/'},
      'wealth':{'label':'Tilastokeskus: kotitalouksien varallisuus 2023, 151u','url':'https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__vtutk/statfin_vtutk_pxt_151u.px/'},
      'oecd-services':{'label':'Verbist, Förster & Vaalavuo (OECD 2012): Suomen palvelumenojen jakaumat 2007','url':'https://doi.org/10.1787/5k9h363c5szq-en'},
      'ifs-services':{'label':'Ogden & Phillips (2024): julkisten palvelumenojen kohdentaminen','url':'https://doi.org/10.1093/ooec/odae007'},
      'cbo':{'label':'CBO (2024), Distribution of Household Income 2021, liite A: yritysveron kohdentamisoletus','url':'https://www.cbo.gov/publication/60706'},
      'ons':{'label':'ONS: verojen ja palvelumenojen tulonjakolaskennan menetelmät','url':'https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/articles/theeffectsoftaxesandbenefitsonhouseholdincome/financialyearending2015'},
    })
    methods={
      'consumption':{'sources':['consumption','ons'], 'method':'Lisävero tai maksu jaetaan kyseisen tuoteryhmän toteutuneen kulutuksen mukaan (Suomi 2022). Koko lisämaksun oletetaan siirtyvän kuluttajille. Kulutuksen vähenemistä tai etuuksien indeksihyvitystä ei vähennetä. Aineistossa on viisi tuloryhmää: kunkin sisällä vaikutus on sama kulutusyksikköä kohden. Yritysten kulutus ja ulkomaiset ostajat voivat pienentää kotitalouksien osuutta.'},
      'benefit':{'sources':['statfin','vm-44'],'method':'Toimen julkistaloudellinen summa kohdennetaan vastaavien etuustulojen vuoden 2024 jakaumalla. Mukana ovat myös sosiaaliturvarahastojen menot. Tämä on oma suuruusluokka-arvio; tuen saajat, verot ja korvaavat etuudet eivät määräydy uudelleen kuten SISU-laskelmassa. Ryhmän keskiarvo ei ole yksittäisen etuudensaajan menetys.'},
      'student':{'sources':['statfin','vm-44'],'method':'Maksu tai tukimuutos kohdennetaan opintoetuuksien jakaumalla vuonna 2024. Opiskelijan nykyiset tulot eivät kuvaa hänen valmistumisen jälkeistä tulotasoaan. Lainahyvityksissä näytetään siksi vaihtoehtona myös palkkatulojen jakauma; tämä on kohdentumisskenaario, ei ennuste urasta.'},
      'pension':{'sources':['statfin','vm-44'],'method':'Valitun vuoden eläkemenoihin ja veroihin arvioitu yhteisvaikutus jaetaan nykyisten eläketulojen jakaumalla. Tulevat eläkkeensaajat eivät välttämättä kuulu samoihin tuloryhmiin. Eläkeikää muuttavissa toimissa työssä jatkamisen palkkatuloa ei ole tässä arvioitu; palkki näyttää eläke-etuuden muutoksen, ei elinkaaritulojen menetystä.'},
      'wealth':{'sources':['wealth','vm-48'],'method':'Lisämaksu jaetaan vastaavan varallisuuslajin vuoden 2023 jakaumalla tulokymmenyksittäin. Omaisuuden määrä on sijaismittari: kauppojen, perintöjen ja palvelumaksujen todellinen jakauma voi poiketa omistamisen jakaumasta. Varallisuustilasto ei kata laitoksissa asuvaa väestöä.'},
      'agriculture':{'sources':['statfin','vm-44'],'method':'Tuen menetys tai lisämaksu jaetaan maatalouden yrittäjätulojen vuoden 2024 jakaumalla. Tuki voi myös päätyä maan vuokraan tai tuotteiden hintoihin; tätä ei ole muutettu keksityksi euromääräiseksi kertoimeksi. Maatalouden pienituloisuus voi johtua myös yksittäisen vuoden tappiosta.'},
      'corporate':{'sources':['cbo','statfin'],'method':'Ehdollinen yritysveroskenaario käyttää CBO:n laskentaoletusta: 25 % työntekijöille, 75 % pääoman omistajille. Palkkaosa jaetaan Suomen palkkatulojen ja pääomaosa omaisuustulojen mukaan. Haarukan alarajalla koko pääomaosa jää ulkomaisille omistajille, ylärajalla kotimaisille. Tämä ei ole Suomen estimoitu vaihteluväli eikä lyhyen aikavälin kassamenetys; myös palkkoihin siirtyminen on oletus.'},
      'business':{'sources':['statfin','ons'],'method':'Yritystuen tai tuotantokustannuksen muutos ei ole suoraan kotitalouden vero. Näytetään erillinen välittymisskenaario: koko summa siirtyy joko omistajien pääomatuloihin, työntekijöiden palkkoihin tai kuluttajahintoihin. Suorat valtiontalouden luvut eivät kerro näiden kanavien osuuksia. Ulkomaille päätyvää osaa ei ole tunnistettu, joten tämä on kotimaisen vaikutuksen täyden välittymisen vertailu.'},
      'service':{'sources':['oecd-services','ifs-services','vm-44'],'method':'Palvelurahan vähennys kohdennetaan OECD-tutkimuksen Suomen palvelumenojen jakaumalla vuodelta 2007. Se on vanha sijaisjakauma, ei kyseisen leikkauksen uusi vaikutustutkimus. Viisi tuloryhmää jaetaan kahdeksi kulutusyksiköiden suhteessa. Kuvaaja näyttää kunkin tulokymmenyksen osuuden rahoitusleikkauksesta. Sama palvelu voi myös tuottua pienemmällä kustannuksella; rahoituksen muutos ei mittaa palvelun tai hyvinvoinnin menetystä.'},
      'service-consumption':{'sources':['consumption','ifs-services'],'method':'Palvelurahan vähennys jaetaan vastaavan kulutuksen vuoden 2022 jakaumalla. Maksullisten palvelujen kulutus on julkisen palvelun käytön epätäydellinen sijaismittari: maksuton palvelu voi palvella enemmän pienituloisia. Kyse on resurssien kohdentumisesta, ei rahatulon menetyksestä tai palvelun hyvinvointiarvosta.'},
      'targeted-service':{'sources':['statfin','ifs-services'],'method':'Palveluraha kohdennetaan kohderyhmää kuvaavan etuustulon vuoden 2024 jakaumalla. Tulo tai etuus on sijaismittari palvelun tarpeelle; samaa palvelua käyttävät eivät välttämättä kuulu samoihin talouksiin. Palvelumenon vähennystä ei lisätä rahatulon menetykseen.'},
      'work':{'sources':['statfin','vm-44'],'method':'VM:n henkilöstömenoarvio jaetaan palkkatulojen vuoden 2024 jakaumalla. Palkki kuvaa työpanoksen tai työnantajan palkkakustannuksen muutosta suhteessa tuloihin. Se ei ole työntekijän nettotulon menetys: työnantajamaksuja, verotusta, korvaavaa työtä ja vapaa-ajan arvoa ei ole eritelty. Julkisen alan palkkajakauma voi poiketa kaikkien palkansaajien jakaumasta.'},
    }
    model['methods']=methods
    def add(ids,weights,method,channel='cash',basis='public-total',**extra):
        for id in ids.split():
            if id in excluded: continue
            assert id in by_id and id not in specs,id
            specs[id]=dict(kind='proxy',profiles=weights.split(),methodKey=method,channel=channel,amountBasis=basis,**extra)
    def cut(keys): return ' '.join('cut-'+k for k in keys.split())
    add('corporate','wages capital-income','corporate','indirect','gross',corporate=True)
    add(cut('1-16 1-47 1-55 1-56 1-57 1-58 1-69 1-72 3-28 3-68 3-69'),'agriculture','agriculture')
    add(cut('1-11 1-25 1-26 1-30 1-41 1-75 1-76 3-27 3-30 3-65 3-66 3-67 5-64'),'capital-income wages consumption-total','business','indirect')
    add('tax-diesel tax-commercial-diesel tax-van tax-peat tax-electric2','capital-income wages consumption-total','business','indirect','gross')
    add(cut('2-43 2-45 2-57 2-58'),'students','student')
    add(cut('2-41 2-61 2-62'),'family','student',note='Toisen asteen opiskelijat asuvat usein vanhempiensa taloudessa. Siksi jakaumana käytetään perhe-etuuksia, ei korkeakouluopiskelijoiden opintoetuuksia. Kuljetuksen käyttöä ja uuden tulorajan vaikutusta ei ole erikseen tunnistettu.')
    add(cut('2-51 2-52'),'students wages','student')
    add(cut('3-13'),'last-resort','benefit')
    add(cut('3-14'),'unemployment','benefit')
    add(cut('3-44 3-45 3-46 3-47 3-48 3-50 3-51 3-52 3-53 3-54 3-56 3-57'),'pensions','pension')
    add(cut('3-63 3-64'),'family wages','benefit')
    # The -82m public net includes more daycare spending, not a household gain.
    add(cut('3-62'),'family','benefit',basis='fixed',fixedMillion=144,
        note='Tuen poistumisen vertailu on VM:n s. 342 noin 12 milj. euroa kuukaudessa × 12 vuoden 2025 tasossa. Verot, korvaavat etuudet, päivähoitomaksut ja työllistyminen eivät sisälly tähän bruttomenetykseen. Julkisen talouden −82 milj. euroa ei ole perheiden tulonlisäys.')
    add(cut('3-18'),'consumption-health','consumption')
    add(cut('3-21 3-22 3-23'),'consumption-drugs','consumption')
    add(cut('4-21'),'consumption-health service-eldercare','consumption')
    add(cut('4-24'),'consumption-aids','consumption')
    add(cut('4-30'),'consumption-dental','consumption')
    add(cut('4-16 4-17 4-18 4-19 4-20'),'wealth-assets service-eldercare','wealth')
    add(cut('2-9'),'wealth-assets population','wealth')
    add(cut('2-11 2-13 2-14'),'family wages','benefit',note='Varhaiskasvatusmaksut riippuvat tuloista. Perhe-etuuksien ja palkkatulojen jakaumat ovat kaksi karkeaa vertailua; nykyisiä maksuvapautuksia ja maksukattoja ei ratkaista uudelleen, joten pienituloisten maksu voi ylittyä.')
    for ids,profile in [
        ('tax-food18','food'),('tax-vat-services','culture'),('tax-vat-news135 tax-vat-news255','news'),
        ('tax-insurance','insurance'),('tax-excise-index','total'),('tax-tobacco','tobacco'),
        ('tax-heat','heating'),('tax-fuel','fuel'),('tax-electric1','electricity'),
        ('tax-tickets','flights'),('tax-car-all tax-car-combustion','cars')]:
        add(ids,'consumption-'+profile,'consumption',basis='gross')
    add('tax-vehicle','consumption-fuel consumption-cars','consumption',basis='gross',note='Perusvero riippuu auton ominaisuuksista, ei ostohinnasta. Auton hankinta- ja käyttökulut ovat tässä kaksi sijaisjakaumaa; auton omistajien lukumäärää ja päästöluokkaa tuloryhmittäin ei ole mallinnettu.')
    specs['tax-vat-services']['profiles']=['consumption-culture','consumption-travel','consumption-drugs']
    specs['tax-vat-services']['note']='Kulttuuri, matkustaminen ja lääkkeet ovat kolme alennetun ALV:n eri kulutusjakaumaa. Niiden välille muodostuva haarukka kuvaa puuttuvan veropohjajaon epävarmuutta; se ei ole yhdistetty SISU-laskelma.'
    for ids,weights in [('tax-transfer-land tax-land-values tax-land-min','wealth-housing wealth-land-business'),
                        ('tax-transfer-homes','wealth-housing'),('tax-transfer-shares','wealth-shares'),
                        ('tax-inheritance','wealth-assets'),('tax-donation','capital-income')]:
        add(ids,weights,'wealth',basis='gross')
    # Individual services: expenditure incidence, never a cash loss.
    for keys,profile in [
        ('2-15','childcare'),('2-19 2-22 2-25','school'),('2-32 2-34 2-35 2-38 2-39 2-42','secondary'),
        ('3-16 3-17 4-9 4-11 4-25 4-26 4-27 4-29 4-34 4-35 4-36 4-42','health'),
        ('4-6 4-7 4-37','eldercare')]:
        add(cut(keys),'service-'+profile,'service','services')
    add('health','service-health service-eldercare','service','services')
    add('education','service-tertiary','service','services')
    add(cut('7-21'),'service-school service-childcare','service','services')
    add(cut('2-20 2-21 4-5 4-14'),'last-resort family','targeted-service','services')
    add(cut('1-28'),'last-resort','targeted-service','services')
    add(cut('4-40'),'disability service-health','targeted-service','services')
    add(cut('2-26 2-27 2-28 2-65 2-66 2-67 2-68 2-70 2-74 2-77 2-78'),'consumption-culture','service-consumption','services')
    add(cut('1-38'),'consumption-travel','service-consumption','services')
    add(cut('5-40 7-44 7-45 7-46 7-48 7-49 7-50 7-51 7-52'),'wages','work','work')
    # Explicit channels for items where a cash-decile allocation would be misleading.
    groups={
      'collective':cut('1-29 1-32 1-33 1-42 1-43 1-79 5-29 5-42 5-49 5-50 5-51 5-52 5-53 5-55 5-58 5-62 5-67 5-72 5-77 7-12 7-16 7-18 7-20 7-23 7-28 7-30 7-41 7-42'),
      'research':cut('1-5 1-6 1-7 1-8 2-44 5-56 7-24 7-29'),
      'abroad':cut('5-16 5-17 5-20 5-39 5-45'),
      'finance':cut('1-24 5-8 5-9 5-19'),
      'unpriced':cut('4-31 4-33 4-48 5-66 6-6 6-7 7-19 7-27')+' tax-household tax-rd tax-ifrs tax-succession tax-biomass tax-waste-energy',
      'mixed':cut('3-49 4-22 5-22 5-33 5-75 6-5'),
    }
    explanations={
      'collective':'Yhteinen palvelu tai hallinnon meno. Puolustuksen ja muiden yhteisten palvelujen hyötyä ei voida jakaa kotitalouksille käytön tai tulon perusteella samalla tavalla kuin hoitoa. Siksi budjettisummaa ei esitetä kenenkään rahatulon menetyksenä.',
      'research':'Tutkimus-, avustus- tai sijoitusrahoitus vaikuttaa tuottajiin ja tulevaan kasvuun. Nykyisten opiskelijoiden tai pääomatulonsaajien jakauma ei yksin kerro hyötyjien tuloryhmiä. Summalle ei siksi anneta näennäisen tarkkaa tulokymmenysjakoa.',
      'abroad':'Suuri osa välittömästä vaikutuksesta kohdistuu ulkomailla asuviin tai Suomeen vasta muuttaviin. He eivät sisälly Suomen vuoden 2024 kotitalouksien tulokymmenyksiin.',
      'finance':'Rahoitusvarojen tai omaisuuden siirto. Kauppahinta ei ole kotitalouksien vuotuinen tulonmenetys eikä automaattisesti pysyvä säästö.',
      'unpriced':'Toimen rajaus tai euromäärä on avoin. Tutkimus kertoo vaikutuskanavista, mutta tässä valinnassa ei vielä määritellä laskettavaa muutosta. Euromäärää ei käsitellä nollana.',
      'mixed':'Toimi sisältää useita eri maksajia tai menolajeja, joiden osuuksia ei ole eroteltu. Kokonaissumman jakaminen yhdellä tuloprofiililla voisi osoittaa leikkauksen väärälle ryhmälle.',
    }
    for group,ids in groups.items():
        for id in ids.split():
            if id in excluded: continue
            assert id in by_id and id not in specs,id
            specs[id]={'kind':'separate','group':group,'method':explanations[group],'sources':['ons','vm-44' if by_id[id]['report']=='cut' else 'vm-48']}
    specs['cut-4-22']['method']='VM kohdistaa uusia maksuja ensisijaisesti hyvätuloisille vammaispalvelujen käyttäjille. Vammaisetuuksien yleinen jakauma osoittaisi maksun väärin myös pienituloisille. Maksutulot on arvioitu, mutta tuloraja ja maksupohja pitää määritellä ennen tulokymmenysjakoa.'
    specs['cut-3-49']['method']='Eläkeiän nosto vähentää eläkemenoja mutta lisää osalla palkkatuloa ja toisilla muita etuuksia. Julkisen talouden säästö ei siksi yksin kerro henkilön tulonmenetystä. Nykyisten eläkeläisten tuloprofiilia ei käytetä tulevien eläkeikäluokkien nettotuloarviona.'
    from finnwatch_incidence import extend_finnwatch
    extend_finnwatch(model)
    from additional_tax_models import extend_incidence as extend_additional
    additional=lambda name:json.loads((ROOT/'data'/name).read_text(encoding='utf8'))
    extend_additional(model,additional('additional-tax-actions.json'),additional('additional-tax-results.json'),additional('research-sources.json'))
    missing=set(by_id)-set(specs)
    assert not missing,sorted(missing)
    model['unmodelled']={}
    model['coverage']={'reviewed':len(specs),'numericalScenarios':sum(m['kind']!='separate' for m in specs.values()),
                       'separate':sum(m['kind']=='separate' for m in specs.values())}
    return model
