"""Evidence-informed Finnish income incidence; never allocate the fiscal pie.

Scenarios retain foreign/institutional shares outside the household vector.
Each vector is a coherent allocation; its mean, not per-decile envelope midpoint,
is used for the solid bar. All own assumptions are disclosed in the UI.
"""
import json
from itertools import product
from pathlib import Path
from finnwatch_models import wrapper_path

ROOT = Path(__file__).resolve().parents[1]


def extend_finnwatch(model):
    read = lambda name: json.loads((ROOT / 'data' / name).read_text(encoding='utf8'))
    inputs = read('finnwatch-incidence.json')
    fiscal = read('finnwatch-estimates.json')
    proposals = read('finnwatch-actions.json')
    references = read('research-sources.json')
    specs = model['actions']

    def add(id, channel, cases, method, calculation, note, partial=False):
        d = next(d for d in proposals if d['id'] == id)
        sources = d['research']['sources']
        model['sources'].update({key: references[key] for key in sources})
        totals = [c['million'] * sum(c['shares'].values()) for c in cases]
        specs[id] = dict(kind='scenarios', channel=channel, scenarios=cases,
                         profiles=sorted({p for c in cases for p in c['shares']}),
                         method=method, calculation=calculation, note=note,
                         sources=sources, partial=partial,
                         householdMillion=[min(totals), max(totals)])

    def case(amount, **shares):
        assert amount >= 0 and 0 <= sum(shares.values()) <= 1 + 1e-9
        return dict(million=amount, shares=shares)

    def alternatives(amounts, profiles):
        return [case(a, **{p: 1}) for a, p in product(amounts, profiles)]

    p = fiscal['wrappers']
    tax = []
    for r, w, q, retained in product(p['assumedReturn'], p['annualWithdrawal'],
                                    p['annuallyTaxableReturnShare'], p['retainedReformExposure']):
        base = wrapper_path(p, r, w, q, False)
        reform = wrapper_path(p, r, w, q, True)
        i = p['displayYear'] - p['startYear']
        tax.append((reform[i]['tax'] - base[i]['tax']) * retained)
    amount = [min(tax), max(tax)]
    amount_text = '–'.join(f'{n:.1f}'.replace('.', ',') for n in amount)
    add('fw-wrappers', 'cash', alternatives(amount, inputs['wrappers']['profiles']),
        'Vuoden 2031 lisävero jaetaan kahdella vaihtoehdolla: vakuutussäästöjen tai pörssiosakkeiden omistuksen mukaan. Tilastokeskuksen vuoden 2023 aineistossa ylimmälle tulokymmenykselle kuuluu näistä noin 47 % ja 69 %. Molemmat ovat sijaisjakaumia; vakuutuskuorten ja osakesäästötilien yhteistä jakaumaa ei tunneta.',
        [
          f'Kotitalouksien lisävero on {amount_text} milj. € vuonna 2031. Se on saman sijoituskannan verotuspolkujen erotus ennen julkisia hallintokuluja. Nostojen verot, hankintameno ja sijoitusten siirtyminen lasketaan kuten tuottoarviossa. Hallinnon 2–5 miljoonaa ei vähennä sijoittajan verolaskua.',
          'Tilastokeskuksen taulukko 151u: säästö- ja sijoitusvakuutukset (vaksak) sekä pörssiosakkeet (porsosa). Kunkin tuloryhmän keskimääräinen omistus kerrotaan ryhmän kotitalousmäärällä ja jaetaan kaikkien ryhmien omistusten summalla. Ryhmät on järjestetty tulojen, ei varallisuuden mukaan.',
          'Oma oletus: verollinen tuotto ja sopimusten vaihtaminen jakautuvat samassa suhteessa kuin omistukset. Haarukka yhdistää pienemmän ja suuremman verolaskelman molempiin jakaumiin. Emme oleta, että ulkomaisen vakuutuksen suomalainen omistaja olisi ulkomainen kotitalous.'
        ],
        'Osa rasituksesta on veron aikaistumista ja sijoitusvarojen kasvun hidastumista. Palkki suhteuttaa sen vuoden tuloihin; se ei ennusta saman suuruista kulutuksen laskua eikä pysyvää vuosittaista menetystä. Vuoden 2031 laskelma säilyy myös Myös myöhemmät -valinnassa.')

    p = fiscal['succession']
    tax = [p['wholeReliefTaxExpenditureMillion'] * share * (1 - erosion)
           for share, erosion in product(p['affectedReliefShare'], p['behaviouralErosion'])]
    add('tax-succession', 'cash', alternatives([min(tax), max(tax)], inputs['succession']['profiles']),
        'Yritysperintöjen lisävero kohdistetaan vaihtoehtoisesti listaamattomien osakkeiden tai kaiken rahoitusvarallisuuden omistajille. Ylimmän tulokymmenyksen osuudet ovat noin 89 % ja 51 %. Näin vaikutus painottuu suurituloisiin, mutta perillistä ei oleteta automaattisesti yhtä suurituloiseksi kuin nykyistä yritysomistajaa.',
        [
          'Lisäveron oletus on 240 milj. € × 20–50 % × (1 − 15–35 %) = 31,2–102 milj. €/vuosi. Tässä 15–35 % tulkitaan suunnittelun vähentämäksi kotitalouksien lisäveroksi. Julkisia 1–3 miljoonan hallintokuluja ei vähennetä perillisten veroista. OBR:n Britannian arvio tukee käyttäytymisen huomioimista, mutta Suomen prosentit ovat omia herkkyysoletuksia.',
          'Jakaumat: Tilastokeskus 151u, muut osakkeet (muosa) ja rahoitusvarat (finan), 2023. Käytämme ryhmän keskimääräistä omistusta × kotitalousmäärää. Rahoitusvarallisuus on väljempi vertailu myös yhtiön passiivisille sijoitusvaroille. Neljä vaihtoehtoa yhdistävät kaksi verosummaa ja kaksi jakaumaa.',
          'Oletamme verorasituksen jäävän Suomessa asuville saajille. Perintöjen saajia, luovuttajien tuloryhmiä, maksuaikatauluja tai yrityskohtaista huojennusta ei simuloida. Varallisuuden jakauma ei osoita perillisten todellista tuloryhmää; tulos voi jäädä haarukan ulkopuolelle.'
        ],
        'Rivin eurot ovat koko tuloryhmälle jaettu vuosittainen verorasitus, eivät yhden perinnön verot. Vero voidaan maksaa myös saadusta varallisuudesta. Suhde vuosituloihin ei tarkoita, että saajan palkka tai kulutus laskisi saman prosenttimäärän.')

    p, a = fiscal['interest'], inputs['interest']
    tax = [p['referenceStaticLossMillion'] / p['referenceTaxRate'] * scale *
           p['corporateTaxRate'] * (1 - p['carryforwardOffset'])
           for scale in p['reverseBaseMultipliers']]
    cases = [case(t, **{'wages': wage * (1 - offset),
                        'capital-income': (1 - wage) * domestic * (1 - offset)})
             for t, wage, domestic, offset in product(tax, a['wageShare'],
                  a['domesticHouseholdCapitalShare'], a['personalTaxOffset'])]
    add('fw-interest', 'indirect', cases,
        'Lisäveron oletetaan jäävän pääosin omistajille. Vertailussa 0–25 % siirtyy palkkoihin; omistajaosuudesta 0–100 % kuuluu Suomen kotitalouksille. Omistajaosa jaetaan Suomen omaisuustulojen ja palkkaosa palkkatulojen mukaan. Suuri epävarmuus johtuu siitä, ettei kohdeyritysten lopullisia omistajia tunneta.',
        [
          'Yritysten vero ennen muita julkisia eriä: (50 milj. € / 20 %) × 1–2 × 18 % × 70 % = 31,5–63 milj. €/vuosi. Viimeinen kerroin huomioi vähennysten myöhemmän käytön kuten tuottoarviossa. Sen erillistä 0–20 %:n varausta muiden verojen ja hallinnon vaikutuksiin ei siirretä kotitalouksien menetykseksi.',
          'Harjun, Kauppisen ja Ropposen Suomen tutkimus havaitsi rahoitusjärjestelyjen muuttuvan, mutta ei osoittanut tuotannon supistumista. Siksi palkkavaikutus voi tässä olla nolla. CBO:n yhdysvaltalaisen tulonjakolaskennan 25 %:n palkkaosuus on toinen vertailu, ei tämän suomalaisen uudistuksen tutkimustulos.',
          'Omat oletukset: palkkaosuus 0 tai 25 %; jäljelle jäävän pääomaosuuden suomalainen kotitalousomistus 0 tai 100 %. Ulkomaisille omistajille, eläkelaitoksille ja muille yhteisöille jäävää osaa ei jaeta suomalaisille. Tulon pienenemisestä seuraavaa henkilöverojen alenemista kokeillaan 0 ja 30 %:n tasolla. Kertoimet ovat vertailuja, eivät tilastoista mitattuja osuuksia.',
          'Jokaisessa yhdistelmässä ryhmän rasitus = yritysvero × (palkkaosuus × ryhmän osuus palkoista + pääomaosuus × suomalainen kotitalousosuus × ryhmän osuus omaisuustuloista) × (1 − henkilöverojen hyvitys). Tulojakaumat ovat vuodelta 2024. Hintoihin, työllisyyteen tai etuuksiin ei lisätä erillistä vaikutusta.'
        ],
        'Suomen kotitalouksille tulee näissä vaihtoehdoissa 0–63 milj. €/vuosi. Nolla tarkoittaa vertailua, jossa vero jää ulkomaisille tai institutionaalisille omistajille eikä siirry palkkoihin. Se ei tarkoita, ettei valtio saisi veroa.')

    a = inputs['withholding']
    fund_tax = sum(a['domesticFundTaxMillion']) / len(a['domesticFundTaxMillion'])
    direct = a['directHouseholdFundShare']
    insurance = a['insurerFundShare'] * a['unitLinkedShareOfInsurance']
    cases = [case(fund_tax, **{'wealth-funds': direct * (1 - offset),
                              'wealth-insurance': insurance * (1 - offset)})
             for offset in a['personalTaxOffset']]
    add('fw-dividend-withholding', 'indirect', cases,
        'Kuvaajassa on tunnistettu rahasto-omistajien osuus: noin 2,8–4,1 milj. €/vuosi. Suorien rahasto-omistajien rasitus jaetaan rahastovarallisuuden, vakuutusten kautta sijoittavien vakuutussäästöjen mukaan. Säätiöiden apurahojen ja palvelujen muutosta ei ole arvioitu tässä rahatuloksi.',
        [
          'VM:n taulukon 10 kotimaisten rahastojen lähdevero vuosina 2016–2020 on 10, 10, 11, 14 ja 9 milj. €, keskimäärin 10,8 milj. €. Käytämme rahastoriviä, emme muiden yhteisöjen tai ulkomaisten osingonsaajien veroa.',
          'Finanssivalvonnan joulukuun 2024 tiedoissa kotitaloudet omistavat avoimista suomalaisista rahastoista suoraan 20,8 % ja vakuutuslaitokset 20,0 %. Vakuutuslaitosten sijoituksista noin 84 % on sijoitussidonnaisia. Näistä saadaan kotitalouksien välilliseksi osuudeksi 16,8 % ja kokonaisosuudeksi 37,6 %. Verorasitus ennen henkilöverojen muutosta on 10,8 × 37,6 % = 4,06 milj. €.',
          'Oma oletus: osinkoihin kohdistuva vero jakautuu rahastopääoman omistuksen suhteessa. Käytämme avoimien rahastojen omistusta myös VM:n rahastorivin sijaismittarina; rahastotyyppien osinkojakaumaa ei tunneta. Suorien omistajien 2,25 milj. € jaetaan Tilastokeskuksen rahastovarallisuuden (sirave), vakuutusten 1,81 milj. € vakuutussäästöjen (vaksak) jakaumalla, vuosi 2023.',
          'Tuoton pienentyessä myös sijoittajan myöhempi pääomatulovero voi alentua. Oma vertailu vähentää kotitalousrasituksesta 0–30 %, jolloin saadaan 2,84–4,06 milj. €. Hyvityksen ajankohtaa ei ennusteta. Vakuutuskuorten verouudistuksen kanssa valittaessa yhteistä veropohjaa ei lasketa uudelleen.',
          'Tämä on osittainen arvio. Ulkomaisten rahastojen suomalaiset edunsaajat, säätiöiden apurahat ja palkat sekä muiden yhteisöjen välilliset vaikutukset puuttuvat. Niitä ei oleteta nollaksi. Vuoden 2024 omistusta sovelletaan vanhempaan veropohjaan ilman kasvuennustetta; koko 50–80 miljoonan verotuottoa ei voi osoittaa Suomen kotitalouksille.'
        ],
        'Arvio kertoo sijoitusvarojen tuoton muutoksesta suhteessa vuosituloihin, ei ennusta samansuuruista kulutuksen laskua.', partial=True)

    common = ('Kunkin ryhmän eurot jaetaan sen vuoden 2024 kulutusyksiköillä ja suhteutetaan '
              'ryhmän keskimääräisiin nettotuloihin. Kuvaajan täysi palkki on kokonaisten '
              'laskentavaihtoehtojen keskiarvo; viivoitus kattaa niiden pienimmän ja suurimman '
              'ryhmävaikutuksen. Vaihtoehdoille ei ole arvioitu todennäköisyyksiä, eikä haarukka '
              'ole tilastollinen luottamusväli. Inflaatiota tai väestön muutosta ei ennusteta.')
    for d in proposals:
        specs[d['id']]['calculation'].append(common)
