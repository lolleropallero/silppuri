"""Research log and explicit policy scenarios for the remaining tax proposals.

Run to regenerate the reviewed source data. All amounts are EUR million.
Finnwatch recommendations are tracked by their numbered appendix, 1–43.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
read = lambda name: json.loads((ROOT/'data'/name).read_text(encoding='utf8'))
def write(name, value):
    (ROOT/'data'/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf8')

refs, summaries, notes = read('research-sources.json'), read('source-summaries.json'), read('source-notes.json')
def source(key, label, url, kind, summary, limit):
    refs[key] = dict(label=label, url=url, kind=kind)
    summaries[key] = dict(summary=summary, limit=limit)
    notes[url] = {'researchSummary': key}

source('sorsa-ten', 'Finér / Kalevi Sorsa -säätiö (2024): Mistä lisää verotuloja?',
 'https://sorsafoundation.fi/mista-lisaa-verotuloja-kymmenen-vastausta/', 'Suomi · veropoliittinen ehdotuskooste, ei vaikutusten syy-seuraustutkimus',
 'Kooste ehdottaa muun muassa pankkien rahoitustoimintaveroa ja suurimpien perintöjen verotuksen kiristämistä. Pankkiveron laskuesimerkeissä käytetään Suomen palkkasummaa ja yhteisöveroja sekä pohjoismaisia veromalleja.',
 'Vuoden 2024 ehdotukset ja staattiset esimerkit eivät ole vuoden 2031 nettoennuste. Osa verosäännöistä on sittemmin muuttunut.')
source('sorsa-gifts', 'Finér / Kalevi Sorsa -säätiö (2025): Lahjaveropuhallus',
 'https://sorsafoundation.fi/lahjaveropuhallus/', 'Suomi · Verohallinnon päätösaineisto 2020–2024',
 'Yritys- ja maatilalahjojen huojennuksia myönnettiin aineistossa keskimäärin 162,7 miljoonaa ja perintöjen huojennuksia 39,0 miljoonaa euroa vuodessa. Selvitys kuvaa tuen saajia ja suuruutta verotuspäätöksistä.',
 'Päätösvuosi ei ole sama kuin omaisuuden siirtovuosi. Tilasto ei mittaa huojennuksen poiston työllisyysvaikutusta eikä käyttäytymisen jälkeistä verotuottoa.')
source('cfc-clifford', 'Clifford (2019): Taxing multinationals beyond borders',
 'https://ora.ox.ac.uk/objects/uuid:f82e2e0b-9a78-459f-9983-c48bcfe4b462', 'Kansainvälinen yritysaineisto · vertaisarvioitu tutkimus verorajojen ympäriltä',
 'Väliyhteisösääntöjen verorajan alittavia voittoja siirtyi rajan yläpuolella oleviin maihin. Verotulot kasvoivat, mutta vain osa lisäverosta kertyi sääntöä soveltaneelle kotimaalle.',
 'Tutkimus tukee voitonsiirron vähenemisen kanavaa. Se ei anna Suomen uudistukselle valmista palautumisprosenttia.')
source('profit-shifting-wier', 'Wier & Zucman (2022): Global profit shifting, 1975–2019',
 'https://missingprofits.world/wp-content/uploads/2022/11/WIDER_WP_Wier_and_Zucman___Global_profit_shifting.pdf', 'Kansainvälinen tilastomalli · Suomen maakohtainen arvio',
 'Liitteen taulukossa Suomesta siirretyiksi voitoiksi arvioidaan 4,8 miljardia dollaria vuonna 2019. Luku koskee voittoja, ei menetettyä veroa. Arvio yhdistää kansantalouden ja yritysten tilastoja.',
 'Aineisto edeltää 15 prosentin vähimmäisveroa ja myöhempiä torjuntatoimia. Vanhaa vuotoa ei voi laskea kokonaan nykyiseksi lisätuloksi.')
source('minimum-tax-eutax', 'Baraké ym. (2021): Collecting the Tax Deficit of Multinational Companies',
 'https://www.taxobservatory.eu/www-site/uploads/2021/06/TaxObservatory_Report_Tax_Deficit_July2021_Revised.pdf', 'EU Tax Observatory · maakohtainen verosimulaatio',
 'Suomen laskennallinen lisätuotto oli raportin 15 prosentin vähimmäisverolla 1,7 ja 21 prosentin verolla 3,5 miljardia euroa. Malli tarkastelee konsernien ulkomaisia voittoja ennen nykyisen vähimmäisveron käyttöönottoa.',
 'Luvut eivät ole nykyisen Pillar 2 -järjestelmän tuottoennusteita. Verotusoikeuksien jako, poikkeukset ja vanha aineisto vaikuttavat Suomen saamaan osuuteen.')
source('wealth-minimum-eutax', 'EU Tax Observatory (2025): Minimum taxation of ultra-high-net-worth individuals',
 'https://www.taxobservatory.eu/www-site/uploads/2025/03/Resources-for-a-Safe-and-Resilient-Europe_The-Case-for-Minimum-Taxation-of-Ultra-High-Net-Worth-Individuals-in-the-EU-1.pdf', 'Eurooppa · varallisuuslistoihin perustuva ehdollinen laskelma',
 'Suomen yli 100 miljoonan euron varallisuuksien kahden prosentin vähimmäisveron lisätuotoksi arvioidaan noin 400 miljoonaa euroa. Laskelma vähentää oletetut nykyiset henkilöverot ja arvioi sadan miljoonan varallisuudet miljardöörilistan avulla.',
 'Nykyisten verojen oletus on kaikille maille 0,2 % varallisuudesta. Suomen todellisia henkilöveroja tai kaikkia verotuksellisia asuinpaikkoja ei ole rekisteristä tarkistettu.')
source('wealth-migration-2026', 'Jakobsen ym. (2026): Taxing Top Wealth',
 'https://www.nber.org/papers/w32153', 'Pohjoismaat · rekisteritutkimus, julkaistu American Economic Reviewssa 2026',
 'Yhden prosenttiyksikön varallisuusveron korotus vähensi varakkaiden verovelvollisten määrää noin kaksi prosenttia. Yritysvaikutuksia löytyi, mutta koko talouden työllisyys-, investointi- ja tuotantovaikutukset jäivät pieniksi.',
 'Muuttajien määrä ei ole sama kuin menetettyjen veroeurojen osuus. Tutkimus ei koske suoraan vain sadan miljoonan omaisuuksien EU-minimiveroa.')
source('wealth-norway-2026', 'Ring (2026): Taxing Entrepreneurial Wealth: Evidence from Norway, 2021–2025',
 'https://www.nber.org/papers/w35854', 'Norja · tuore tutkimustyöpaperi, ei vielä vertaisarvioitu',
 'Norjan uudistuksiin liittynyt maastamuutto pienensi laskennallisen varallisuusverotuoton kasvun 75 prosentista 71,5 prosenttiin. Tutkija ei havainnut yritysten investointien vähenevän tai konkurssien lisääntyvän tarkastelujaksolla.',
 'Seuranta on lyhyt ja uudistuksia tehtiin yhtä aikaa. Työpaperin tulos ei takaa samaa vastetta Suomessa tai pidemmällä aikavälillä.')
source('capital-realizations', 'Agersnap & Zidar (2021): The Tax Elasticity of Capital Gains and Revenue-Maximizing Rates',
 'https://www.aeaweb.org/articles?id=10.1257/aeri.20200535', 'Yhdysvallat · vertaisarvioitu osavaltioiden veromuutosten tutkimus',
 'Myyntivoittojen realisointi reagoi verotukseen myös usean vuoden aikavälillä. Tutkimuksen tulokset tukevat sitä, että veronkorotus kasvattaa verotuottoa, vaikka myyntejä lykätään; veronalennukset eivät maksaneet itseään takaisin.',
 'Yhdysvaltojen verokantojen muutokset eivät ole Suomen hankintameno-olettaman muutos. Tässä niitä käytetään käyttäytymismallin perustana, ei Suomen euromääräisenä tuloksena.')
source('capital-budgetlab', 'Yale Budget Lab (2024): Behavioral Responses: Capital Gains Realizations',
 'https://budgetlab.yale.edu/research/behavioral-responses-capital-gains-realizations', 'Yhdysvallat · tutkimuskirjallisuuteen ja omaisuuskoostumukseen perustuva mallioletus',
 'Budget Lab käyttää veron suhteen realisointijoustoa −0,62 ja käy läpi aiempia noin −0,7:n oletuksia. Varallisuuslajien erilainen reagointi vaikuttaa siihen, paljonko veronkorotuksen mekaanisesta tuotosta jää jäljelle.',
 'Luku on yhdysvaltalaisen laskentamallin oletus. Silppurin herkkyysväli on oma vertailu, ei Suomesta estimoitu parametri.')
source('vero-capital-2024', 'Verohallinto: Henkilöasiakkaiden tulot, vähennykset ja verot 2024',
 'https://vero.fi/tietoa-verohallinnosta/tilastot/henkiloasiakkaiden_tuloverotilastoj/verovuosi-2024/henkiloasiakkaiden-tulot-vahennykset-ja-verot-verovuonna-2024/', 'Suomi · verotuksen valmistumisen mukainen tilasto',
 'Vuoden 2024 verotuksessa luovutusvoittoja oli 5 247,6 miljoonaa euroa. Voitot keskittyivät suuriin luovutuksiin, vaikka useimmat myyjät saivat pieniä voittoja. Tilasto erottaa muun muassa osakkeet, kiinteistöt ja virtuaalivaluutat.',
 'Julkinen taulukko ei kerro, kuinka suuri osa euroista on laskettu hankintameno-olettamalla. Tämä osuus on oman laskelman herkkyysoletus.')
source('kti-funds-2026', 'KTI (2026): Erikoissijoitusrahastotaulukko Q1/2026',
 'https://kti.fi/wp-content/uploads/2026/05/ESR-Aikasarja-Q1-2026.pdf', 'Suomi · rahastojen tiedot ja Suomen Pankin tilastot',
 'Kiinteistörahastojen nettovarallisuus oli 5 720 miljoonaa euroa maaliskuussa 2026. Viimeisten 12 kuukauden jaettu tuotto oli 2,3 %, mutta arvonalennukset painoivat kokonaistuoton miinukselle.',
 'Jaettu tuotto ei ole täsmälleen verotettava tulos. Aineisto ei kata kaikkia ulkomaisia kiinteistörakenteita, eikä sijoittajien nykyistä henkilöveroa voi sivuuttaa.')
source('vm-funds-2022', 'VM (2022): Kiinteistösijoitusrahastojen läpivirtausmalli',
 'https://valtioneuvosto.fi/-/10623/uudet-kiinteistosijoitusrahastojen-verotusta-koskevat-saannokset-turvaavat-suomen-veropohjaa', 'Suomi · lainvalmistelu, ei toteutuneen uudistuksen vaikutusarvio',
 'VM valmisteli mallia, jossa kiinteistörahaston tuloa verotettaisiin suoraan sen osuudenomistajan tulona. Tarkoitus oli saattaa myös ulkomaisten omistajien Suomessa syntyvät kiinteistötulot verotukseen.',
 'Läpivirtausmalli ja rahaston oma yhteisövero ovat vaihtoehtoja. Silppurin laskelma käyttää jälkimmäistä ja hyvittää päällekkäistä verotusta.')
source('exit-review-2026', 'Nieminen (2026): Arvonnousuvero osana oikeudenmukaista verojärjestelmää',
 'https://oikeus.journal.fi/article/download/163214/122403/462038', 'Suomi · oikeustieteellinen arvio vuoden 2022 veroluonnoksesta',
 'Artikkeli erottaa VM:n vuoden 2020 selvityksen 0–50 miljoonan arvion ja vuoden 2022 luonnoksen 0–25 miljoonan arvion. Kummassakaan ei ole kattavaa laskelmaa kaikista nettovaikutuksista.',
 'Laajemman veron tuottoa ei voi päätellä nostamalla vanhan haarukan alarajaa. Suomen jälkikäteistä vaikutustutkimusta toteutetusta verosta ei ole.')
source('austria-digital', 'Itävallan valtiovarainministeriö: Digital Tax Act 2020',
 'https://www.bmf.gv.at/en/topics/taxation/digital-tax-act.html', 'Itävalta · voimassa olevan veron kuvaus',
 'Itävalta verottaa suurten toimijoiden verkkomainontaa viidellä prosentilla. Veropohjasta vähennetään riippumattomilta mainosvälittäjiltä ostetut välituotteet. Maakohtainen ja maailmanlaajuinen liikevaihtoraja rajaavat verovelvollisia.',
 'Tämä on esimerkki toteutetusta verosta, ei näyttö siitä, että vero jäisi kokonaan alustayhtiön omistajien maksettavaksi.')
source('iab-advertising-2025', 'IAB Finland / Kantar (2026): Mainonnan määrä vuonna 2025',
 'https://www.iab.fi/julkaisut/ajankohtaista/mediamainonnan-maara-paattyi-07-laskuun-vuonna-2025.html', 'Suomi · toimialan markkinatilasto',
 'Verkkomainontaan käytettiin vuonna 2025 yhteensä 729 miljoonaa euroa. Some- ja hakumainonnan yhteissumma oli 497,1 miljoonaa. Ne antavat kotimaisen mittakaavan mahdolliselle mainosverolle.',
 'Mainostajan meno ei ole automaattisesti verovelvollisen alustan liikevaihtoa. Välittäjät, liikevaihtorajat ja hinnanmuutokset pienentävät veropohjaa.')
source('bank-norway', 'Norjan valtiovarainministeriö: Prop. 1 LS 2025–2026',
 'https://www.regjeringen.no/en/documents/prop.-1-ls-20252026/id3125412/?ch=1', 'Norja · rahoitustoimintaveron verokannat',
 'Norjan rahoitustoimintaverossa palkkoihin kohdistuu viiden prosentin vero. Alan voittovero on kolme prosenttiyksikköä tavallista yhteisöveroa korkeampi. Malli antaa konkreettisen vaihtoehdon Suomen pankkiveron rakenteelle.',
 'Norjan verotuottoa ei ole skaalattu Suomen BKT:lla. Suomen laskelma käyttää kotimaista palkka- ja voittopohjaa, jotka ovat tässä vanhoja viitetietoja.')
source('bank-incidence', 'Kogler (2019): On the Incidence of Bank Levies',
 'https://alexandria.unisg.ch/entities/publication/c7101a22-f025-4de3-80f2-1e202fac7a5c', '23 EU-maata · vertaisarvioitu pankkiaineistotutkimus 2007–2013',
 'Pankkien velkoihin kohdistuneita veroja siirtyi lainakorkoihin. Välittyminen riippui pankkien vakavaraisuudesta ja kilpailutilanteesta. Pelkkä verovelvollinen pankki ei siis kerro lopullista maksajaa.',
 'Velkavero on eri instrumentti kuin palkkoihin ja voittoihin kohdistuva rahoitustoimintavero. Tutkimus tukee mahdollisia vaikutuskanavia, ei Suomen siirtymäprosentteja.')
source('vm-exit-2020', 'VM (2020): Maastapoistumisvero – mistä on kyse ja mistä ei?',
 'https://valtioneuvosto.fi/en/-/10623/maastapoistumisvero-mista-on-kyse-ja-mista-ei-', 'Suomi · VM:n selvityksen tekijöiden kuvaus arviosta',
 'Selvityksen tekijät arvioivat henkilöiden maastapoistumisveron vuosituotoksi 0–50 miljoonaa euroa. He korostavat veron rakenteen, muuttokäyttäytymisen ja hallinnon merkitystä sekä arvion epävarmuutta.',
 'Kyseessä on vanhan selvityksen vertailuhaarukka. Se ei ole Finnwatchin laajemman mallin vuoden 2031 nettoarvio.')
source('faster-2024', 'EU:n neuvosto (2024): FASTER-direktiivi hyväksytty',
 'https://www.consilium.europa.eu/en/press/press-releases/2024/12/10/taxation-council-adopts-new-rules-for-withholding-tax-procedures-faster/', 'EU · hyväksytyn sääntelyn aikataulu ja sisältö',
 'FASTER uudistaa rajat ylittävien sijoitusten lähdeveromenettelyjä ja lisää rahoituksen välittäjien raportointia. Direktiivi hyväksyttiin joulukuussa 2024, ja sääntöjä sovelletaan vuodesta 2030.',
 'Jo hyväksytyn uudistuksen tuotto kuuluu vuoden 2031 vertailupohjaan. Se ei ole uusi valittavissa oleva säästö, eikä lähde arvioi Suomen jäljelle jäävää verovajetta.')
source('digital-jrc', 'Alvarez Martinez, Gesualdo & Pycroft (2024): Storm in the Cloud',
 'https://publications.jrc.ec.europa.eu/repository/handle/JRC130576', 'Britannia · vertaisarvioitu CORTAX-talousmalli, ei toteuman syyvaikutus',
 'Britannian digiveron mallinnus tuotti pienen kielteisen BKT-vaikutuksen mutta lisäsi mallissa maan kulutusta ja hyvinvointia. Malli erottaa digitoimialan muusta tuotannosta ja huomioi kansainväliset yritykset.',
 'Britannian veropohja poikkeaa Suomen verkkomainontaveron skenaariosta. Mallin tulosta ei käytetä Suomen tuotto- tai kulutusvaikutuksen kertoimena.')

actions, models = [], {}
def add(id, title, flow, who, society, money, calc, sources, model, allocations,
        incidence_method, incidence_assumptions, *, channel='cash', conflicts=(), condition=None, outside=False, origin='finnwatch'):
    calc = list(calc) + ['Haarukka on oletusten herkkyysväli. Se ei ole tilastollinen luottamusväli tai varmistettu vähimmäistuotto. Laskenta pitää lähdevuoden pohjan vakiona; inflaatiota, kasvua tai koko paketin yleisen tasapainon vaikutuksia ei ennusteta.']
    source_key = 'fw-tax-gaps' if origin == 'finnwatch' else 'sorsa-ten'
    sources = list(dict.fromkeys([source_key] + list(sources) + ['statfin-wealth-incidence','statfin-income-incidence']))
    e = dict(caption='oma tuottohaarukka', basis='Oma ehdollinen vuosiarvio · lähdevuoden veropohja', money=money, calculation=calc)
    if condition: e['condition'] = condition
    d = dict(id=id, title=title, flow=flow, who=who, impact=who.split('. ')[0].rstrip('.')+'.', society=society,
        origin=origin, source=refs[source_key]['label'], sourceUrl=refs[source_key]['url'], conflicts=list(conflicts),
        estimate=e, research=dict(sources=sources, finding='', fiscal=money,
        scope='Lähdetiedot ja omat parametrit erotetaan laskentakohdassa. Kansainvälisiä tuloksia käytetään vain ilmoitetulla tavalla.', status='context'),
        incidence=dict(channel=channel, allocations=allocations, method=incidence_method, assumptions=incidence_assumptions, outsideResidents=outside))
    actions.append(d); models[id] = model

corporate_allocations = [{'capital-income': .2}, {'capital-income': .6,'wages': .175}]
corp_method = 'Yritysveron välillinen rasitus jaetaan omistajille ja mahdollisesti työntekijöille. Ulkomaisten ja institutionaalisten omistajien osuutta ei jaeta Suomen kotitalouksille.'
corp_assumptions = 'Omat vertailut: kotitalouksien pääomatuloihin jää 20 % verosta; toisessa vaihtoehdossa pääomatuloihin 60 % ja nettopalkkoihin 17,5 %. Jälkimmäinen palkkaosuus on CBO:n 25 %:n brutto-oletus × 70 % verojen jälkeinen osuus. Omistajaosuudet ovat herkkyysoletuksia, eivät kohdeyritysten havaittuja omistuksia.'

add('fw-corporate-gaps', 'Yritysten voitonsiirron aukot kiinni', 'business',
 'Voittoja matalan verotuksen maihin siirtäviltä yrityksiltä ja niiden omistajilta.',
 'Korkorajoitukset, väliyhteisösäännöt ja verovalvonta vähentäisivät voitonsiirtoa. Yritykset voivat muuttaa rahoitusta tai siirtää voittoja toiseen maahan. Clifford havaitsi juuri tällaista siirtymistä; kaikki takaisin verolle tuleva voitto ei päädy Suomeen.',
 'Arviosta vähennetään jo toteutettujen torjuntatoimien osuus sekä 10–20 miljoonaa lisävalvonnan vuosikuluja. Toimi sisältää korkorajoitusten kiristyksen, joten sen erillinen kortti korvautuu.',
 ['Ankkuri: Wier–Zucmanin vuoden 2019 Suomi-arvio 4,8 mrd. dollaria siirrettyjä voittoja. Käytämme pyöristettyä valuuttamuunnosta 0,90 €/dollari ja 18 % yhteisöveroa: vertailuverovaje 777,6 milj. €. Tämä ei ole havaittu vuoden 2031 verovaje.',
  'Omat oletukset: vanhasta vuodosta 40–80 % on jäljellä nykyisten sääntöjen jälkeen ja laaja uusi torjuntapaketti palauttaa siitä Suomen verolle 20–50 %. Viimeinen osuus sisältää siirtymisen muihin järjestelyihin. Kertoimia ei ole estimoitu Suomelle.',
  'Netto = 777,6 × 40–80 % × 20–50 % − 10–20 milj. €. Pakettiin kuuluvat myös konsernien raportointi, omistajatietojen tarkistaminen, veronkiertopykälän täsmennys ja tutkimusresurssit. Niille ei lisätä päälle erillisiä tuottoja.'],
 ['profit-shifting-wier','cfc-clifford','cbo-incidence-assumption','finland-interest-2026'],
 dict(formula='product', anchor=4800, factors=[[.9],[.18],[.4,.8],[.2,.5]], cost=[10,20]), corporate_allocations, corp_method, corp_assumptions,
 channel='indirect', conflicts=['fw-interest','fw-corporate-minimum'])

add('fw-corporate-minimum', 'Suuryritysten vähimmäisvero 20 % EU-sopimuksella', 'business',
 'Kansainvälisiltä konserneilta, joiden voittojen tosiasiallinen vero jää alle 20 prosentin.',
 'Verokeitaaseen siirtämisen hyöty pienenisi. Suomen lisätulo riippuu myös siitä, mikä maa saa täydennysveron. Muutoksen toteuttaminen edellyttää kansainvälistä sopimusta ja voi muuttaa yritysten sijoittumista.',
 'Tämä on sopimuksen toteutumiseen sidottu skenaario. Nykyisen 15 prosentin veron laskennallinen tuotto vähennetään ensin. Suomen saama osuus ja yritysten reagointi pienentävät jäljelle jäävää summaa.',
 ['EU Tax Observatoryn vuoden 2021 laskelmassa Suomi: 15 % → 1 700 milj. €, 21 % → 3 500 milj. €. Oma suoraviivainen väliarvio 20 prosentille: (3 500 − 1 700) × 5/6 = 1 500 milj. € lisäpotentiaalia. Se ei ole uusi mikrosimulaatio.',
  'Nykyisen verotusoikeuksien jaon, lähdemaiden omien täydennysverojen, poikkeusten ja vanhan aineiston vuoksi kokeilemme, että Suomeen jäisi tästä 20–60 %. Käyttäytymisen ja muiden verovaikutusten jälkeen säilyisi 70–90 %. Nämä ovat omia stressitestejä, eivät tutkimuksen kertoimia.',
  'Netto = 1 500 × 20–60 % × 70–90 % − 5–15 milj. € hallintoa. Konserniverotuksen ja verotusoikeuksien jaon muita kansainvälisiä uudistuksia ei ole laskettu tähän. Yhteisöveron korotus, digivero ja voitonsiirtopaketti voivat pienentää tämän toimen erillistä lisätuottoa; yhdistelmästä näytetään päällekkäisyysmerkintä.'],
 ['minimum-tax-eutax','cfc-clifford','cbo-incidence-assumption'],
 dict(formula='product', anchor=1500, factors=[[.2,.6],[.7,.9]], cost=[5,15]), corporate_allocations, corp_method, corp_assumptions,
 channel='indirect', conflicts=['corporate','fw-corporate-gaps','fw-interest','fw-digital'], condition='Edellyttää EU-sopimusta')

add('fw-wealth-minimum', 'Yli 100 miljoonan omaisuuksille 2 % vähimmäisvero', 'capital',
 'Erittäin varakkailta henkilöiltä. Kahden prosentin vähimmäistasosta vähennettäisiin heidän jo maksamansa henkilöverot.',
 'Omaisuuden tuotto jäisi useammin verolle, vaikka voitot jätettäisiin holdingyhtiöön. Pohjoismaisissa tutkimuksissa varallisuusvero lisäsi jonkin verran maastamuuttoa. Vaikutukset koko talouden investointeihin olivat pieniä; vero ei silti ole käyttäytymisen kannalta vaikutukseton.',
 'Tutkimuslaitoksen Suomen laskennallinen lähtökohta on noin 400 miljoonaa. Omassa haarukassa varataan 5–30 % veropohjan ja muiden verotulojen menetyksiin sekä 3–10 miljoonaa hallintoon.',
 ['EU Tax Observatory 2025, taulukko 1: Suomen yli 100 milj. € omaisuuksien 2 % vähimmäisveron lisätuotto noin 400 milj. €. Malli käyttää miljardöörien 14,3 mrd. € varallisuutta, oletettua nykyveroa 0,2 % varallisuudesta ja laajennuskerrointa 1,55. Suomen henkilöveroja ei ole mitattu.',
  'Oma netto = 400 × 70–95 % − 3–10 milj. €. Varauksessa ovat muuttoliike, arvostus, suunnittelu ja muiden verojen muutokset. Jakobsenin ym. noin 2 %:n muuttovaste ei sellaisenaan ole verotuoton vähennyskerroin. Norjan tuore työpaperi tukee myös pienten lyhyen aikavälin reaalivaikutusten mahdollisuutta.',
  'Mallina on yhteisesti toteutettava vähimmäisvero. Muut henkilöverot hyvitetään vähimmäisverossa. Siksi niiden korotukset vähentäisivät tämän kortin lisätuottoa siltä osin kuin ne osuvat samoihin ihmisiin; laskuri merkitsee mahdolliset päällekkäisyydet. Verotuksellinen asuinpaikka ja yli 100 miljoonan ryhmän todelliset tulot vaativat jatkovalmistelussa rekisterilaskelman.'],
 ['wealth-minimum-eutax','wealth-migration-2026','wealth-norway-2026'],
 dict(formula='product', anchor=400, factors=[[.7,.95]], cost=[3,10]),
 [{'wealth-unlisted':1},{'wealth-financial':1}],
 'Rasitus keskittyy erittäin varakkaisiin. Tulokymmenykset eivät kuitenkaan ole varallisuuskymmenyksiä: yhtiöön jätetty voitto ei välttämättä näy omistajan vuosituloissa.',
 'Kaksi omaa sijaisjakaumaa: listaamattomien osakkeiden ja rahoitusvarallisuuden omistus. Ne eivät tunnista yli 100 miljoonan henkilöitä, joten tätä laajaa vaihteluväliä ei pidä lukea ryhmän rekisteritiedoksi.',
 conflicts=['fw-wrappers','dividends','tax-dividend-return','tax-capital-low','tax-capital-high','fw-deemed-cost'], condition='Edellyttää yhteistä verosopimusta')

add('fw-exit-tax', 'Suomessa kertynyt arvonnousu verolle maastamuutossa', 'capital',
 'Ulkomaille muuttavilta sijoittajilta, joiden omaisuus on noussut arvossa Suomessa asuessa. Vero kohdistuisi Suomessa kertyneeseen voittoon.',
 'Muutto juuri ennen omaisuuden myyntiä ei enää poistaisi Suomen veroa. Maksun lykkääminen myyntiin asti lieventäisi rahapulaa silloin, kun omaisuutta ei myydä muuton yhteydessä. Rajat ja lykkäysehdot vaikuttavat sekä tuottoon että muuttamiseen.',
 '0–50 miljoonaa on VM:n vanhan selvityksen suuruusluokka, ei kattava netto. Nolla on epävarman haarukan alaraja. Laajemman veron suurempaa tuottoa ei ole varmistettu, joten piirakka ei lupaa sitä etukäteen.',
 ['VM:n selvityksen 2020:9 vertailuhaarukka on 0–50 milj. €, vuoden 2022 kapeamman luonnoksen 0–25 milj. €. Oikeus 1/2026 erittelee näiden rajoitukset. Tässä käytetään laajempaa 0–50 miljoonan vertailua; Finnwatchin vielä laajemmalle mallille ei väitetä erikseen mitattua lisätuottoa.',
  'Toteutus: vero Suomessa asumisaikana syntyneestä arvonnoususta, 100 000 euron arvonnousuraja ilman erillistä omaisuuden vähimmäisrajaa ja maksun lykkäys realisointiin. Tarkka ehdotus on oma konkretisointi. Vanhaa eurohaarukkaa käytetään vain vertailuna, ei tämän rajauksen tuloksena.',
  'EU:n yhdenmukaiset säännöt, maastamuuton jälkeinen verotusoikeus ja tiedonvaihto tukevat samaa veropohjaa. Niille ei lisätä erillisiä euroja. Hallintoa, lykkäyksen korkoa ja muuta muuttoliikkeen verovaikutusta ei ole netotettu.'],
 ['vm-exit-2020','exit-review-2026','wealth-migration-2026'],
 dict(formula='reference', referenceRange=[0,50]), [],
 'Vero koskee pääosin ulkomaille muuttaneita. Heitä ei jaeta Suomessa asuvien vuoden 2024 tulokymmenyksiin. Suomessa pysymisen verovaikutusta ei ole mallinnettu.', '', outside=True,
 condition='0–50 milj. € vertailu; kokonaisnetto avoin')

add('fw-property-funds', 'Kiinteistörahastojen verovapaus pois', 'investors',
 'Kiinteistörahastojen sijoittajilta, myös ulkomaisilta. Kotimaisen sijoittajan jo maksama vero otettaisiin huomioon.',
 'Rahaston vuokra- ja myyntituotosta maksettaisiin veroa ennen voitonjakoa. Rahaston arvo ja sijoittajan nettotuotto voivat pienentyä. Uusien kohteiden rakentaminen tai ostaminen voi vähentyä; jo rakennetun asunnon vuokra ei nouse automaattisesti veron verran.',
 'Laskelma hyvittää osan nykyisistä sijoittajatason veroista ja jättää julkisten eläkesijoittajien osuuden nettotuoton ulkopuolelle. Ulkomaisten rahastojen lisätuottoa ei arvaamalla lisätä kotimaisen kannan päälle.',
 ['KTI Q1/2026: nettovarallisuus 5 720 milj. €. Jaettu tuotto oli 2,3 %, kokonaistuotto −0,8 %. Oma normaalivuoden verotettavan tuoton väli on 2–6 % nettovarallisuudesta; yläraja kuvaa elpymistä, ei vuoden 2026 toteumaa.',
  'Oma malli: 18 % vero rahaston verotettavaan tuloon. Nykyisten henkilöverojen hyvitysten ja julkisten omistajien jälkeen 40–80 % mekaanisesta verosta olisi uutta julkista tuloa. Tuoton ja omistusrakenteen muutosten jälkeen siitä säilyisi 70–90 %. Vuosikulut 1–4 milj. €.',
  'Netto = 5 720 × 2–6 % × 18 % × 40–80 % × 70–90 % − 1–4. Sama veroperiaate ulotettaisiin rinnastuviin ulkomaisiin rahastoihin ja kiinteistömyynnin verosopimusaukot suljettaisiin; näille ei ole omaa lisäsummaa tässä rajatussa laskelmassa. Muiden rahastojen osingot ovat erillisellä lähdeverokortilla.'],
 ['kti-funds-2026','vm-funds-2022','fin-fsa-fund-ownership'],
 dict(formula='product', anchor=5720, factors=[[.02,.06],[.18],[.4,.8],[.7,.9]], cost=[1,4], roundTo=1),
 [{'wealth-funds':.1},{'wealth-funds':.4}],
 'Suomen kotitalouksille kohdistuvan osuuden vertailu on 10–40 % laskelman verorasituksesta. Kotimaiset rahasto-osuudet toimivat jakauman sijaismittarina.',
 '10–40 % on oma herkkyysoletus. Kiinteistörahastojen sijoittajat poikkeavat kaikkien rahastojen sijoittajista; loppuosaa ei siirretä kotitalouksille. Vuokralaisiin siirtyviä hintoja ei ole hinnoiteltu.', channel='indirect')

add('fw-treaty-dividends', 'Osinkojen nollaverosopimukset ja osinkopesu pois', 'investors',
 'Suomesta osinkoja saavilta ulkomaisilta sijoittajilta ja veronkiertojärjestelyjen hyötyjiltä.',
 'Portfolio-osingosta perittäisiin yleensä 15 % lähdevero myös nykyisissä nollaveromaissa. Osingon omistajan tarkistaminen vaikeuttaisi näennäisiä osakekauppoja. Jos asuinmaa hyvittää Suomen veron, sijoittajan kokonaisvero ei välttämättä nouse yhtä paljon.',
 'Osinkopesun vanhaa 80 miljoonan verovajetta ei lisätä nollaverosopimusten tuoton päälle: samaa osinkoa voi olla molemmissa. Jo toteutuneet korjaukset, vastavuoroiset verohyvitykset ja valvontakulut pienentävät arviota.',
 ['VM 2021:31, taulukko 7: verosopimuksen vuoksi verovapaana maksetut muut kuin suorasijoitusosingot 2016–2020 olivat 1 730, 1 300, 1 500, 1 650 ja 480 milj. €, keskimäärin 1 332. Laskennallinen 15 % vero tästä on 199,8 milj. €.',
  'Omat oletukset: vanhasta pohjasta 50–90 % on yhä aidosti lisäverotettavissa ja siitä 60–90 % jää Suomeen sijoittajien reagoinnin, vastavuoroisten verohyvitysten ja hyvitysoikeuksien jälkeen. Vuosittainen lisävalvonta 3–8 milj. €. Netto = 199,8 × 50–90 % × 60–90 % − 3–8.',
  'Vuoden 2022 Verohallinnon 80 miljoonan osinkopesuarvio koskee vuosia 2018–2021. TRACE on jo käytössä; FASTER hyväksyttiin 2024 ja sitä sovelletaan vuodesta 2030. Niiden vanhoja hyötyjä ei lasketa uutena. Laskelma on jäljelle jäävän pohjan herkkyystesti, ei ajantasainen sopimuskohtainen simulointi.'],
 ['vm-withholding','faster-2024'],
 dict(formula='product', anchor=1332, factors=[[.15],[.5,.9],[.6,.9]], cost=[3,8]), [],
 'Veron välitön maksaja asuu ulkomailla. Ulkomaisten rahastojen mahdollisia suomalaisia edunsaajia ei tunneta, eikä koko verotuottoa voi jakaa Suomen tulokymmenyksiin.', '', outside=True,
 condition='Edellyttää verosopimusten muutoksia')

add('fw-portfolio', 'Yhtiöiden pienomistusten osingot verolle', 'business',
 'Listaamattomien yhtiöiden osakkeisiin toisten yhtiöiden kautta sijoittavilta. Suurten omistusten konserniosingot jäisivät ulkopuolelle.',
 'Alle 10 prosentin omistusosuudesta saadut osingot tulisivat saajayhtiölle verollisiksi. Holdingyhtiön käyttäminen ei enää antaisi näihin osinkoihin täyttä verovapautta. Omistuksia voidaan keskittää yli rajan tai osingonjakoa lykätä.',
 'Tästä veropohjasta ei ole erillistä julkista tilastoa. Euromäärä on siksi avoimesti oletettuun pienomistusten osuuteen perustuva laskelma. Se huomioi järjestelyjen muutoksia, pienemmät myöhemmät omistajaverot ja hallintokulut.',
 ['VM 2021:31, taulukko 1: listaamattomien yhtiöiden kotimaisille saajille maksamat osingot olivat 2016–2020 keskimäärin 11 200 milj. €. Mukana on myös henkilöitä ja konserniomistuksia, joten koko summaa EI veroteta uudelleen.',
  'Oma puuttuvan veropohjan oletus: 5–15 % tästä olisi alle 10 %:n yhtiöomistuksille maksettuja yksityisen sektorin portfolio-osinkoja. Vero 18 %. Käyttäytymisen jälkeen säilyy 50–80 % ja muiden Suomen verojen hyvitysten jälkeen 70–100 %. Hallinto 3–8 milj. €.',
  'Netto = 11 200 × 5–15 % × 18 % × 50–80 % × 70–100 % − 3–8. Alempi tuotto edellyttää jo huomattavaa uudelleenjärjestelyä. Yhtiön maksama lisävero ja omistajan henkilökohtainen osinkovero ovat eri veroja; niitä ei tule laskea samaksi suoraksi kotitalousmenetykseksi.'],
 ['vm-withholding','capital-realizations','cbo-incidence-assumption'],
 dict(formula='product', anchor=11200, factors=[[.05,.15],[.18],[.5,.8],[.7,1]], cost=[3,8]),
 [{'wealth-unlisted':.5},{'wealth-unlisted':.9}],
 'Rasitus painottuu yhtiöiden omistajiin. Listaamattomien osakkeiden tulokymmenysjakauma on sijaismittari.',
 'Omat vertailut jakavat Suomen kotitalouksille 50 tai 90 % laskelman rasituksesta. Loppu jää muille omistajille; todellista omistajaketjua ei tunneta.', channel='indirect')

add('fw-deemed-cost', 'Pitkän omistuksen hankintameno-olettama 40 → 20 %', 'capital',
 'Paljon arvonnoussutta omaisuutta myyviltä sijoittajilta. Todelliset hankintakulut voisi edelleen vähentää; oman vakituisen asunnon verovapaus säilyisi.',
 'Osa sijoitusvoitoista tulisi aiempaa laajemmin verolle. Myyjä voi käyttää todellista hankintahintaa tai lykätä kauppaa. Yhdysvaltojen tutkimus löytää myyntien reagointia, mutta ei tue oletusta, että veronkorotuksen tuotto katoaisi kokonaan.',
 'Laskenta vähentää myös lykkääntyvistä myynneistä menetetyn nykyisen veron. Hankintameno-olettamaa hyödyntävien voittojen osuus on oma herkkyysoletus, koska julkaistu tilasto ei erittele sitä.',
 ['Verohallinnon vuoden 2024 luovutusvoitot 5 247,637367 milj. €. Oma oletus: 15–35 % tästä liittyy korkean hankintameno-olettaman hyödyntämiseen. Uusi verotettava voitto kasvaa näissä 15–33,33 %; enimmäiskasvu saadaan 80/60 − 1, kun 40 % olettama alenee 20 prosenttiin.',
  'Vero 34 %. Realisointijouston itse valittu herkkyysväli on 0,3–0,7 veron suhteen, taustana Agersnap–Zidar ja Yale Budget Lab. Kun veropohja kasvaa suhteessa k, myyntimäärän kerroin on (1+k)^(−jousto).',
  'Netto = vanha verollinen voitto × kohdeosuuden oletus × 34 % × [(1 + k)^(1 − jousto) − 1] − 1–4 milj. € hallintoa. Näin veroa lykkäävien myyjien aiemmin maksamatkin verot poistuvat vertailusta. Jakaumaa tai joustoa ei ole estimoitu tälle Suomen uudistukselle.'],
 ['vero-capital-2024','capital-realizations','capital-budgetlab'],
 dict(formula='realizations', gains=5247.637367, affectedShare=[.15,.35], baseUplift=[.15,1/3], elasticity=[.3,.7], rate=.34, cost=[1,4]),
 [{'wealth-listed':1},{'wealth-financial':1}],
 'Sijoitusvoittojen lisäveroa jaetaan pörssiosakkeiden tai laajemman rahoitusvarallisuuden tulokymmenysjakaumalla.',
 'Oma oletus on, että veron lisäys jakautuu omistusten suhteessa. Omaisuuden myynnin ajoitus, kiinteistöt ja yksittäiset yrityskaupat voivat tehdä todellisesta jakaumasta erilaisen.', conflicts=['fw-wealth-minimum'])

add('fw-succession-abolish', 'Yritysperintöjen ja -lahjojen huojennus kokonaan pois', 'capital',
 'Huojennettuja yritys- ja maatilaperintöjä tai lahjoja saavilta. Suurten omaisuussiirtojen saajat menettäisivät eniten euroja.',
 'Yritysomaisuus verotettaisiin lähtökohtaisesti kuten muu perintö tai lahja. Maksuajan järjestelyt vaikuttavat yrityksen kassaan ja siihen, tarvitseeko osakkeita myydä. Tilasto huojennuksen koosta ei osoita sen olevan välttämätön yrityksen jatkamiselle.',
 'Koko huojennuksen 240 miljoonan lähtöarviosta vähennetään suunnittelun ja muiden käyttäytymismuutosten vaikutus sekä hallinto. Sijoitusvarojen rajaus sisältyy poistoon eikä sitä lisätä uudelleen.',
 ['Sama 240 milj. € verotukipohja kuin sijoitusvarojen rajauksen kortilla. Sorsa-säätiön Verohallinnolta saamassa 2020–2024 päätösaineistossa toteutuneet huojennukset olivat keskimäärin noin 202 milj. €/vuosi; eri vuosien ja verosääntöjen luvut eivät ole sama asia.',
  'Oma tuotto = 240 × (1 − 15–35 %) − 1–3 milj. € = 153–203 milj. €, ulospäin pyöristettynä 150–205. Käyttäytymisväli on sama kuin osittaisessa rajauksessa. OBR:n Britannian huojennusmuutosten laskelma osoittaa, miksi suunnittelu pitää huomioida, mutta kerroin ei ole Suomen tutkimustulos.',
  'Maksuajat, muuhun omaisuuteen siirtyminen, lahjojen ajoitus ja omistajavaihdokset vaikuttavat toteumaan. Arvio ei sisällä samanaikaista veroprosenttien nostoa. Kortti sisältää sijoitusvarojen rajauksen ja korvaa sen. Perintöverokannan korotukset voivat jäädä valituiksi, mutta niiden yhteisvaikutus merkitään avoimeksi.'],
 ['sorsa-gifts','obr-business-relief','inheritance'],
 dict(formula='product', anchor=240, factors=[[.65,.85]], cost=[1,3]),
 [{'wealth-unlisted':1},{'wealth-financial':1}],
 'Yritysperintöjen lisävero jaetaan kahdella vaihtoehdolla: listaamattomien osakkeiden ja rahoitusvarallisuuden omistuksen mukaan.',
 'Nykyisen omistajan varallisuusjakauma ei ole perillisten tulorekisteri. Eurot ovat ryhmän keskimääräinen vuotuinen rasitus, eivät yhden perillisen kertaluonteinen verolasku.', conflicts=['tax-succession','tax-inheritance','sorsa-million-inheritance'])

add('fw-digital', 'Suurten alustojen verkkomainonnalle 5 % vero', 'business',
 'Suurilta mainosalustoilta. Osa verosta voi siirtyä suomalaisille mainostajille ja edelleen niiden asiakkaille.',
 'Veron voisi periä Suomessa näytetystä verkkomainonnasta Itävallan mallin tapaan. Alustat voivat nostaa mainonnan hintaa tai muuttaa sopimuksia. Britanniaa koskevassa tutkimusmallissa digivero pienensi BKT:tä mutta kasvatti kotimaista kulutusta; verotuotto ja talouden kokonaishyöty eivät muutu aina samaan suuntaan.',
 'Arvio vähentää välittäjille jäävää liikevaihtoa, verorajojen ulkopuolista toimintaa, yritysten reagointia ja muuta verotulomenetystä. Tavallinen mainonnan ALV ei poistu.',
 ['IAB/Kantar 2025: some- ja hakumainonta 497,1 milj. €, kaikki verkkomainonta 729 milj. €. Itävallan käytössä oleva verokanta on 5 %. Oma kohde: konsernin globaali liikevaihto vähintään 750 milj. € ja Suomessa verkkomainonnasta vähintään 5 milj. €.',
  'Oma veropohjan vaihteluväli 497,1–729 milj. €, josta välittäjien, kokorajojen ja sopeutumisen jälkeen 70–95 % jää verolle. Kotimaisen muun verokertymän heikkenemistä varten vähennetään lisäksi 18 %. Hallintokulut 1–3 milj. €.',
  'Netto = 497,1–729 × 5 % × 70–95 % × 82 % − 1–3. Tässä ei veroteta erikseen kaikkea alustakauppaa tai digitaalista sisältöä. Markkinamaan verotusoikeuden laajaa kansainvälistä mallia ei lisätä päälle.'],
 ['iab-advertising-2025','austria-digital','digital-jrc'],
 dict(formula='product', anchor=1, factors=[[497.1,729],[.05],[.7,.95],[.82]], cost=[1,3]),
 [{'consumption-total':.2},{'consumption-total':.6}],
 'Suomen kuluttajille siirtyvän hinnan vertailu on 20–60 % mallin verorasituksesta. Loppu jää alustoille, mainostajille tai muille omistajille.',
 '20–60 % on oma herkkyysoletus. Kulutuksen kokonaisjakauma on väljä sijaismittari mainostavien yritysten asiakkaille; lain tarkkaa kuluttajavaikutusta ei ole tutkittu Suomessa.',
 channel='indirect', conflicts=['fw-corporate-minimum'])

add('sorsa-bank', 'Pankeille rahoitustoimintavero', 'business',
 'Pankeilta ja niiden omistajilta. Osa kustannuksesta voi siirtyä työntekijöille tai lainojen ja pankkipalvelujen hintoihin.',
 'Norjan mallissa rahoitusalaa verotetaan sekä palkoista että tavallista korkeammalla voittoverolla. Pankkiveroja koskeva eurooppalainen tutkimus osoittaa, että osa rasituksesta voi siirtyä lainanottajille, etenkin keskittyneillä markkinoilla.',
 'Laskelma huomioi palkkaveron vähentämisen yhteisöverotuksessa ja varaa 5–25 % muuhun verotulon ja veropohjan menetykseen. Se ei oleta koko veron jäävän pankin omistajien maksettavaksi.',
 ['Sorsa-säätiön viitetiedot: pankkien vuoden 2022 palkkasumma noin 1 400 milj. € ja yhteisövero 900 milj. € silloisella 20 % verokannalla → voittopohja 4 500 milj. €. Suomessa toteutettavan mallin pohjana käytetään näitä euroja ilman kasvuennustetta.',
  'Oma rajaus: vain pankit; palkkavero 5 % ja voittovero 3 prosenttiyksikköä yleistä veroa korkeampi. Norjan vuonna 2026 käyttämät lisäprosentit ovat samat. Kun yleinen vero oletetaan 18 prosentiksi, palkkaveron vähennys vähentää 21 % sen tuotosta.',
  'Ennen muuta reagointia 1 400 × 5 % × (1 − 21 %) + 4 500 × 3 % = 190,3 milj. €. Oma netto = 190,3 × 75–95 % − 1–4 milj. €. Tulos on vanhan suomalaisen pohjan skenaario; uusin pankkitulos ja tarkat vähennyssäännöt muuttaisivat sitä.'],
 ['bank-norway','bank-incidence'],
 dict(formula='product', anchor=190.3, factors=[[.75,.95]], cost=[1,4]),
 [{'capital-income':.3},{'capital-income':.2,'wages':.175,'consumption-total':.3}],
 'Vertailut näyttävät sekä omistajiin jäävän että palkkoihin ja palveluhintoihin siirtyvän rasituksen.',
 'Omat vaihtoehdot: 30 % kotitalouksien pääomatuloihin; tai 20 % pääomatuloihin, 17,5 % nettopalkkoihin ja 30 % kuluttajahintoihin. Kulutusjakauma ei tunnista lainanottajia, joten pankkiasiakkaiden jakauma on osittainen arvio.',
 channel='indirect', conflicts=['corporate'], origin='sorsa')

add('sorsa-million-inheritance', 'Miljoonaperintöjen ja -lahjojen veroa +10 prosenttiyksikköä', 'capital',
 'Yli miljoonan euron perintöosuuksia tai lahjoja saavilta. Korotus koskisi vain miljoonan ylittävää osaa.',
 'Suuret omaisuussiirrot verotettaisiin nykyistä kireämmin. Lahjojen ajankohta, pilkkominen ja maksuaikajärjestelyt voivat muuttua. Perintöveroa ei pidä rinnastaa saman suuruiseen pienituloisen palkkaveron korotukseen: maksu voidaan kattaa saadusta omaisuudesta.',
 'Vanhan suomalaisen ehdotuksen 200 miljoonan vertailutuotosta jätetään omassa laskelmassa 15–50 % kertymättä ajoituksen, verosuunnittelun ja muuttuneen veropohjan vuoksi. Tämä ei ole vuoden 2026 säännöillä ajettu mikrosimulaatio.',
 ['Finér arvioi vuoden 2024 blogissa kymmenen prosenttiyksikön korotuksen miljoonaperintöihin tuovan noin 200 milj. € myös pienperintöjen alarajaa nostettaessa. Laskentamenetelmää ei julkaista, joten tämä on ehdotuksen esittäjän suuruusluokka-arvio. Pienten perintöjen nykyisiä alarajoja ei muuteta tässä kortissa.',
  'Oma vuosituoton vertailu = 200 × 50–85 % − 1–5 milj. €. Kertoimet kattavat myös vanhan esimerkin ja uuden rajauksen eron; ne eivät ole tutkimuksesta estimoituja. Tarkan tuloksen laskemiseen tarvitaan perintöjen jakauma miljoonan ylittävästä osasta ja nykyiset huojennukset.',
  'OECD:n perintöverokatsaus tukee laajaa pohjaa, progression arviointia ja suunnittelun rajaamista. Yleisen perintöveron korotuksen ja yrityshuojennuksen poiston kanssa voi syntyä päällekkäisyyttä. Ne voi valita samaan pakettiin, mutta yhteistä veropohjaa ei ole simuloitu.'],
 ['inheritance','sorsa-gifts','obr-business-relief'],
 dict(formula='product', anchor=200, factors=[[.5,.85]], cost=[1,5]),
 [{'wealth-unlisted':1},{'wealth-financial':1}],
 'Suurten perintöjen saajien tuloryhmiä lähestytään omistusjakaumilla; miljoonaperintö ei automaattisesti tarkoita miljoonan vuosituloa.',
 'Kaksi omaa sijaisjakaumaa ovat listaamattomien osakkeiden ja rahoitusvarallisuuden omistus. Saajien todelliset vuositulot ja ikä poikkeavat luovuttajien tuloista.',
 conflicts=['tax-inheritance','fw-succession-abolish'], origin='sorsa')

# Only genuinely nested alternatives replace one another. Distinct taxes can
# coexist; flag their unresolved interaction instead of silently removing one.
subset_pairs = {frozenset(('fw-corporate-gaps','fw-interest')),
                frozenset(('fw-succession-abolish','tax-succession'))}
for d in actions:
    if d['flow'] == 'business': d['flow'] = 'companies'
    overlaps = [other for other in d['conflicts'] if frozenset((d['id'],other)) not in subset_pairs]
    d['conflicts'] = [other for other in d['conflicts'] if other not in overlaps]
    d['possibleOverlaps'] = [dict(id=other, note='Molemmat muuttavat osin samaa veropohjaa tai veron hyvityksiä. Erillisarvioiden summa voi ylittää yhteisen tuoton; yhteislaskelmaa ei ole tehty.') for other in overlaps]
    if d['id'] == 'fw-exit-tax':
        d['estimate'].update(caption='VM:n vertailuhaarukka', basis='VM 2020 · kokonaisnettoa ei laskettu')
from audit_corrections import apply_actions, apply_sources, apply_inputs
apply_actions(actions)
apply_sources(refs, summaries)
apply_inputs(models)
write('additional-tax-actions.json', actions)
write('additional-tax-inputs.json', models)
write('research-sources.json', refs)
write('source-summaries.json', summaries)
write('source-notes.json', notes)

# Coverage is explicit even where a recommendation is an enabling institution,
# already enacted, or a choice of international negotiating position.
groups = [
 ([1,3,4,6,7], 'fw-corporate-minimum', 'Kansainvälisen yritysverotuksen vaihtoehtoiset mallit ja niiden päätöksenteko. Vähimmäisveron lisänetto on avoin; aiempi ristiriitaiseen ankkuriin perustunut haarukka on poistettu. BEFITille tai päätöksentekotavalle ei lisätä erillistä verotuottoa.'),
 ([5], 'fw-digital', 'Digivero on oma, toteutettuun Itävallan malliin perustuva rajaus raportin vaihtoehtojen pohjalta. Se ei ole sama kuin YK:n 12 b artikla tai konsernien koko voiton jakokaava.'),
 ([2,30], None, 'Kehittyvien maiden lähdeverotusoikeudet. Tavoite koskee ensisijaisesti muiden maiden verotuloja; ei Suomen uutta sopeutuserää.'),
 ([8,9,10,11,33,34,35,36,37,38,39,40,41,42,43], 'fw-corporate-gaps', 'Yritysten veropohjaa suojaavat säännöt ja niitä tukeva valvonta, julkisuus ja tutkimus ovat yhteisessä torjuntaskenaariossa. Yksityishenkilöiden avoimuudesta saatavaa mahdollista lisätuottoa ei ole hinnoiteltu erikseen eikä yhden valvontasäännön tuottoa erotettu.'),
 ([12], 'fw-wealth-minimum', 'Konkretisoitu yli 100 miljoonan varallisuuksien 2 prosentin vähimmäisveroksi. Parametrit ovat kortin lähteissä.'),
 ([13,14,15,16,32], 'fw-exit-tax', 'Maastamuuton veropohjaa suojaava kokonaisuus. Ulkomaisten erityisjärjestelmien ja oleskelulupien muutoksille ei lisätä Suomen arvonnousuveron päälle erillistä tuottoa.'),
 ([17], 'fw-wrappers', 'Vakuutuskuorten ja osakesäästötilien vuosiverotus. Kassavirta-arvio ja myöhemmät menetykset näkyvät laskelmassa.'),
 ([18], 'fw-dividend-withholding', 'Verovapaiden yhteisöjen osingot. Julkisten eläkelaitosten sisäinen veronsiirto on poistettu vertailusta.'),
 ([19,31], 'fw-property-funds', 'Rahastoverotuksen vaihtoehdot konkretisoitu kiinteistötulon verotukseksi. Kotimaisen kannan laskelmaan ei lisätä erikseen välillisten ulkomaisten myyntien summaa.'),
 ([20,21,28,29], 'fw-treaty-dividends', 'Osinkojen sopimusaukot ja väärinkäytökset lasketaan yhdessä. Muiden sopimusartiklojen, esimerkiksi lisäeläkkeiden, tuottoa ei oleteta samaksi osinkotuotoksi.'),
 ([22], None, 'FASTER on hyväksytty 10.12.2024 ja sitä sovelletaan 2030 alkaen. Jo päätettyä muutosta ei lasketa uudeksi valinnaksi.'),
 ([23], 'dividends', 'Jo olemassa oleva osinkoverokortti ja sen täyspoistovaihtoehto. Progressiivisen mallin tuotto ei tule näiden päälle.'),
 ([24], 'fw-portfolio', 'Alle 10 prosentin yhtiöomistusten osinkoverotus. Puuttuva veropohja on ilmaistu herkkyysoletuksena.'),
 ([25], 'fw-deemed-cost', 'Konkreettinen rajaus 40 prosentista 20 prosenttiin. Todelliset hankintakulut saa edelleen vähentää.'),
 ([26], None, 'Etuyhteysosakevaihtojen matemaattista arvoa ja hankintamenoa on jo muutettu 2025–2026. Sama toteutettu korjaus ei ole uusi säästö.'),
 ([27], 'fw-succession-abolish', 'Täyspoisto ja sijoitusvarojen rajaus ovat vaihtoehdot. Molemmille on oma eurohaarukka.'),
]
coverage = sorted([dict(number=n, action=action, reason=reason) for numbers, action, reason in groups for n in numbers], key=lambda r:r['number'])
assert [r['number'] for r in coverage] == list(range(1,44))
write('finnwatch-proposal-coverage.json', {'asOf':'2026-10-27','source':'https://finnwatch.org/images/reports_pdf/Veropohjan_aukot.pdf','recommendations':coverage})
print('Wrote',len(actions),'additional tax scenarios and coverage of all 43 recommendations.')
