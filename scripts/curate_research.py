"""Explicit, reviewed research-to-action links. No keyword-based citation assignment.

Run before build.py after editing this curation. VM figures are never replaced by
an international multiplier or by the face value of a tax expenditure.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
catalogue = json.loads((ROOT/'data/catalogue.json').read_text(encoding='utf-8'))['actions']
actions = {a['id']: a for a in catalogue}
scope_excluded=set(json.loads((ROOT/'data/nonrecurring-exclusions.json').read_text(encoding='utf-8')))
scope_excluded.update({'cut-5-40','cut-5-42','tax-car-combustion'})
reviews = {}

def review(ids, sources, finding, fiscal, scope, status='mechanism'):
    for id in ids.split():
        assert id in actions or id in scope_excluded, id
        assert id not in reviews, id
        reviews[id] = dict(sources=sources.split(), finding=finding, fiscal=fiscal, scope=scope, status=status)

review('cut-1-5 cut-1-6 cut-1-25 cut-1-26', 'einio',
       'Suomalaisessa tutkimuksessa yritysten T&K-tuki lisäsi tutkimusta, työpaikkoja ja myyntiä; tuottavuushyödyt tulivat viiveellä.',
       'Tutkimuksen vähenemisestä seuraavaa tulevien verotulojen menetystä ei ole vähennetty. Tukieuroa ei voi muuntaa suoraan samansuuruiseksi tutkimuksen lisäykseksi tai menetykseksi.',
       'Einiön tutkimus koskee yritysten saamia T&K-avustuksia. Koko rahoituslain tai kaikkien yritystukien leikkausta se ei arvioi.')
review('cut-1-7 cut-1-8 cut-5-56 education', 'einio rdtax',
       'Tutkimusrahoituksella on havaittu vaikutuksia innovaatioihin. Rahan siirron seuraus riippuu myös siitä, mitä alkuperäisestä käyttökohteesta poistuu.',
       'Rahoituksen nimeäminen tutkimusrahoitukseksi ei vielä vähennä menoja. Vain toteutumatta jäävä lisärahoitus tai todellinen menoleikkaus parantaa saldoa; menetettyä osaamista ja veropohjaa ei ole hinnoiteltu.',
       'Yritysten tutkimusrahoituksen näyttö ei mittaa korkeakouluopetuksesta tai muista EU-hankkeista tehtävän siirron kokonaishyötyä.')
review('cut-1-11', 'howell',
       'Tukien vaikutus riippuu kohteesta: tutkimusavustusten hyödyt eivät todista matkailu-, vienti- tai tuotantotukien hyötyä.',
       'Tukien poistamisen nettovaikutus riippuu siitä, jäisikö tuettu hanke toteutumatta. Tälle koko tukijoukolle ei löytynyt yhteistä kausaalista verotuottoarviota.',
       'Howell tutkii varhaisen vaiheen T&K-avustuksia. Sitä käytetään tukimuotojen erottamiseen, ei näyttönä näiden muiden tukien vaikuttavuudesta.', 'limited')
review('cut-1-16 tax-electric2', 'energy',
       'Suomen teollisuudessa energiaveron kiristyminen lisäsi energiatehokkuutta ilman havaittua tuotannon tai työllisyyden vähenemistä.',
       'Energiansäästö pienentää veropohjaa. Teollisuustutkimus ei anna tämän muutoksen kokonaisnettoa eikä todista, että kaikkien yritysten tuotanto säilyisi ennallaan.',
       'Vuosien 2011–2012 teollisuusuudistus. Maatalouteen soveltaminen on epävarmempaa kuin teollisuuteen.')
review('cut-1-28 cut-5-39 cut-5-45', 'integration',
       'Suomen kotoutumisuudistus paransi osallistujien pitkän aikavälin ansioita. Palvelujen sisältö vaikuttaa, ei vain rahamäärä.',
       'Vastaanotto- tai kotoutumismenon aleneminen ei yksin kerro nettovaikutusta. Myös myöhemmät ansiot, verot ja muiden etuuksien tarve muuttuvat; näitä ei ole arvioitu kattavasti tälle päätökselle.',
       'Tutkimus koskee kotoutumissuunnitelmia jo Suomessa asuville. Se ei ole pakolaiskiintiön tai ukrainalaisten suojelun päättymisen kustannus-hyötylaskelma.')
review('cut-1-29 cut-1-32 cut-1-33', 'multiplier',
       'Investointien lykkääminen vähentää lähiajan kysyntää. Pitkän ajan vaikutus riippuu väylän hyödyistä ja kunnossapidon tarpeesta.',
       'BKT-vaikutus ei ole sama kuin menetetty verotulo. Kansainvälistä kerrointa ei vähennetä euro eurosta säästöstä; hankekohtaiset hyödyt, korjauskulut ja tuontiosuus tarvitaan nettoon.',
       'Gechert kokoaa kansainvälisiä finanssipolitiikan tutkimuksia. Se ei anna yksittäisen suomalaisen väylähankkeen tuottoa.')
review('cut-1-30 cut-1-38 tax-diesel tax-commercial-diesel tax-van', 'fuel',
       'Liikenteen hintaan reagoiminen riippuu vaihtoehdoista. Joukkoliikenne ja sijainti vaikuttavat siihen, voiko kuljetusta tai matkaa vähentää.',
       'Hintojen siirtyminen asiakkaille ja kuljetusten väheneminen voivat muuttaa veropohjaa. Tanskalaisten henkilöautomatkojen joustoa ei voi käyttää Suomen rahti- tai laivaliikenteen nettokertoimena.',
       'Tutkimuksen kohde on henkilöautoilu Tanskassa; rahtiin ja meriliikenteeseen siirrettävyys on rajallinen.')
review('cut-1-41', '', '',
       'Lipunvaihto voi pienentää Suomen palkkaveroja ja sosiaalivakuutusmaksuja. VM:n varoitukselle ei löytynyt tämän tukirajauksen omaa kausaalista euromääräistä arviota.',
       'Vaikutuskuvaus perustuu VM:n merenkulkumuistioon. Työpaikkojen tai verotulojen menetystä ei ole osoitettu tarkkana lukuna.', 'vm-only')
review('cut-1-42', 'media',
       'Maavertailussa julkisen palvelun uutistarjonta liittyi parempaan yhteiskunnalliseen tietoon ja pienempiin tietämisen eroihin.',
       'Mahdollista vaikutusta tiedonsaantiin tai demokratiaan ei voi vähentää säästöstä euroina tämän tutkimuksen perusteella.',
       'Havaintotutkimus sisältää Suomen, mutta ei mittaa Ylen 10 tai 20 prosentin rahoitusleikkauksen syy-seurausvaikutusta.')
review('cut-1-47 cut-1-55 cut-1-56 cut-1-57 cut-1-58 cut-1-69 cut-1-72', 'agri',
       'Suomalaisessa maatalousmallissa tukien leikkaus heikensi tilojen tuloja; tuotantovaikutus riippui tukilajista ja hinnoista.',
       'Tilan menettämä tuki ei ole kokonaan julkista nettosäästöä, jos verotulot vähenevät tai EU-rahaa jää saamatta. Vanhan maatalousmallin prosenttivaikutuksia ei siirretä tähän laskelmaan.',
       'Lehtosen skenaariot koskevat eri tukileikkauksia ja aiempaa markkinatilannetta. Ne osoittavat sopeutumiskanavia, eivät tämän vaihtoehdon nettoa.')
review('cut-1-75 cut-1-79', '', '',
       'Metsäkadon vähentyminen voi pienentää maksukertymää. Suojelun leikkaus taas voi lisätä myöhempää ennallistamisen tarvetta. Näille seurauksille ei löytynyt tämän rajauksen yhteistä euroarviota.',
       'VM:n ympäristömuistiot kuvaavat vaikutussuunnat. Pelkkä luonnon yleinen arvo ei kelpaa tämän toimen nettolaskelmaksi.', 'vm-only')
review('cut-1-76', '', '',
       'Vuokratulo kertyy vain toteutuvista hankkeista. Sähkön hinta, verkkoliityntä ja luvitus vaikuttavat toteutumiseen; VM:n tulouralle ei löytynyt tutkimukseen perustuvaa todennäköisyysväliä.',
       'Hankesalkun tuloarvio on VM:n arvio. Tuulivoiman yleinen kannattavuustutkimus ei varmista näiden valtion maiden hankkeiden toteutumista.', 'vm-only')
review('cut-2-9', '', '',
       'VM:n laskelma vähentää hautausmenojen siirrosta pienentyvät perintöverot ja kasvavan toimeentulotuen. Hautausvalintojen muutoksista ei löytynyt tähän sopivaa lisäkorjausta.',
       'Netto perustuu VM:n etuus- ja verolaskelmaan. Suomalaista tutkimusta tämän maksureformin käyttäytymisvaikutuksesta ei löytynyt.', 'vm-only')
review('cut-2-11 cut-2-13 cut-2-14 cut-3-61', 'childcare homecare',
       'Suomen tutkimuksissa kotihoidon ja päivähoidon taloudelliset kannustimet muuttivat äitien työssäkäyntiä.',
       'Työnteon vähentyminen pienentää palkkaveroja ja voi kasvattaa etuusmenoja. Päivähoidon käytön väheneminen voi puolestaan alentaa kustannuksia. Molemmat suunnat on huomioitava.',
       'Kotihoidontuen ja päivähoitomaksujen uudistukset tukevat mekanismia; yksittäisen uuden maksutaulukon netto vaatii oman laskelman.')
review('cut-2-15', 'teacher',
       'Katsauksessa korkeampi koulutus liittyi parempaan varhaiskasvatuksen laatuun. Yhteys ei todista Suomen uuden henkilöstövaatimuksen vaikutusta.',
       'Palkka- ja rekrytointikulujen muutos voidaan arvioida, mutta lasten myöhemmän oppimisen eurovaikutuksesta ei ole tämän uudistuksen kausaalista arviota.',
       'Katsauksen tulokset ovat pääosin korrelaatioita. Niitä ei tulkita todisteeksi tietyn kelpoisuusprosentin hyödyistä.', 'limited')
review('cut-2-19', '', '',
       'Ryhmien ja kuljetusten yhdistämisestä voi säästyä, mutta uudet materiaalit ja koulutus maksavat alussa. Tutkimusta tämän Suomen mallin nettovaikutuksesta ei löytynyt.',
       'VM:n järjestämiskustannusten laskelma; opetuksen sisällön tai oppimistulosten muutosta ei ole hinnoiteltu.', 'vm-only')
review('cut-2-20 cut-2-21 cut-2-25 cut-2-42', 'schoolmoney schoolmeta',
       'Koulurahoituksen tutkimuksissa lisäraha paransi keskimäärin oppimista ja tutkintojen suorittamista, etenkin heikommista lähtökohdista tulevilla.',
       'Vähenevän koulutuksen myöhempiä palkka- ja verotulovaikutuksia ei ole vähennetty. Valtionosuuden pienentäminen säästää koko julkiselta sektorilta vain, jos kunta ei korvaa rahoitusta.',
       'Kausaalinen näyttö painottuu Yhdysvaltoihin. Lisärahan keskimääräinen tuotto ei ole suomalaisen yksittäisen leikkauksen kerroin.')
review('cut-2-22', 'instruction',
       'Oppiaineita vertailevassa tutkimuksessa suurempi opetusaika paransi osaamista. Vaikutus vaihteli kouluympäristön mukaan.',
       'Vähenevien opetustuntien myöhempää vaikutusta palkkoihin ja veroihin ei ole laskettu. Tutkimus ei anna euromäärää juuri kolmelle vuosiviikkotunnille.',
       'Kansainvälinen opetusaikatutkimus; oppiaineen, iän ja toteutuksen valinta vaikuttaa tulokseen.')
review('cut-2-26 cut-2-27 cut-2-28 cut-2-34 cut-2-35', 'adult',
       'Ruotsalaisessa rekisteritutkimuksessa aikuiskoulutuksen ansiohyödyt vaihtelivat ryhmittäin ja ilmenivät viiveellä.',
       'Kurssien vähenemisestä mahdollisesti seuraavia pienempiä ansioita ja verotuloja ei voi laskea yhdellä kertoimella. Harrastuskurssi ja ammatillinen tutkinto eivät ole sama investointi.',
       'Tutkimus koskee muodollista aikuiskoulutusta Ruotsissa. Vapaan sivistystyön koko tarjontaan soveltaminen on epävarmaa.')
review('cut-2-32 cut-2-38 cut-2-39 cut-2-61 cut-2-62', 'secondary',
       'Suomessa toiselle asteelle pääsy vähensi nuorten miesten rikoksia. Koulutuksessa pysymisellä voi siis olla myös koulun ulkopuolisia hyötyjä.',
       'Jos muutos lisää keskeyttämistä, myöhemmät verotulot voivat pienentyä ja muut julkiset menot kasvaa. Pääsytutkimus ei anna tämän rahoitus- tai matkatukimuutoksen nettoa.',
       'Tutkimus tunnistaa opiskelupaikan saamisen vaikutusta valintarajalla; se ei mittaa suoraan maksuja, koulumatkaa tai oppivelvollisuuslakia.')
review('cut-2-41 cut-2-60', 'schoolmeals',
       'Maksuttomien kouluaterioiden katsauksessa ruokailuun osallistuminen lisääntyi. Maksu voi siksi vähentää aterian käyttöä.',
       'Maksutulo riippuu syöjien ja maksajien määrästä. Kotitalouksien ravitsemuksen tai myöhempien terveysmenojen muutosta ei ole muutettu luotettavaksi suomalaiseksi euromääräksi.',
       'Katsaus koskee pääosin kouluikäisiä ulkomailla; korkeakouluopiskelijoihin siirrettävyys on rajallinen.')
review('cut-2-43 cut-2-44 cut-2-45 cut-2-53 cut-2-54 cut-2-55 cut-2-57 cut-2-58 cut-2-59', 'aid loan',
       'Opiskelun rahoitus vaikuttaa osallistumiseen. Suomen tukiuudistuksista ei kuitenkaan voi erottaa kaikkia valmistumisvaikutuksia luotettavasti.',
       'Työnteko, keskeyttäminen ja valmistuminen muuttavat tulevia veroja. Lainamallissa myös takausvastuut ja korvaavat etuudet vaikuttavat nettoon; ulkomaisen tukitutkimuksen kerrointa ei käytetä.',
       'Dynarskin tulos koskee Yhdysvaltojen avustustuen poistoa. VTV arvioi Suomen uudistuksia ja niiden näytön rajoja.')
review('cut-2-51 cut-2-52', 'loan',
       'Suomen tarkastuksessa tukiuudistusten vaikutusta valmistumiseen oli vaikea erottaa muista samaan aikaan tapahtuneista muutoksista.',
       'Hyvityksen poisto vähentää valtion maksuja, mutta valmistumisen ja myöhempien verotulojen muutokselle ei ole tästä tarkastuksesta johdettavaa nettohaarukkaa.',
       'VTV:n tarkastus ei osoita hyvityksen poistamisen kausaalista vaikutusta valmistumisnopeuteen.', 'limited')
review('cut-2-65 cut-2-66 cut-2-67 cut-2-68 cut-2-70', 'arts',
       'WHO:n katsaus löysi taiteeseen osallistumisesta hyvinvointihyötyjä, mutta näyttö ja toteutustavat vaihtelivat.',
       'Avustuksen menetystä voi korvata lipputulo tai muu rahoitus, mutta silloin kustannus siirtyy maksajalle. Tämän leikkauksen terveys- ja verovaikutuksesta ei ole luotettavaa eurokerrointa.',
       'Katsaus ei mittaa suomalaisen teatteri-, museo- tai taideavustuksen rajatuottoa eikä osoita kaikkien avustusten maksavan itseään takaisin.')
review('cut-2-74', '', '',
       'VM:n kertymä edellyttää noin miljoonaa maksajaa. Käytön väheneminen, maksuvapautukset ja perintäkulut pienentäisivät sitä; suomalaisesta 30 euron maksusta ei löytynyt vaikutustutkimusta.',
       'Kirjastojen yleinen hyöty ei ratkaise juuri tämän maksun käyttäytymisvaikutusta. Arvio on maksajamäärään perustuva esimerkki.', 'vm-only')
review('cut-2-77 cut-2-78', 'activity',
       'Liikkumattomuuteen liittyy terveys- ja työkykykustannuksia. Avustuksen leikkaus ei kuitenkaan kerro, kuinka paljon liikkuminen vähenee.',
       'Liikkumattomuuden koko kansantaloudellista kustannusta ei voi kohdistaa näille ohjelmille. Nettosäästö edellyttäisi tietoa juuri rahoitetun toiminnan lisävaikutuksesta.',
       'Suomalainen kustannustutkimus kuvaa liikkumattomuuden kuormaa, ei yksittäisen valtionavustuksen kausaalista tuottoa.', 'limited')
review('cut-3-5 cut-3-6 cut-3-7 cut-3-8 cut-3-10', 'childbenefit childincome',
       'Kanadan ja Yhdysvaltojen tutkimuksissa lapsiperheiden lisätulot paransivat lasten hyvinvointia ja oppimistuloksia.',
       'Toimeentulotuki korvaa osan menetyksestä. Työn tarjonta ja päivähoitomenot voivat muuttua eri suuntiin. Lasten myöhempiä terveys- ja ansiotulovaikutuksia ei ole hinnoiteltu.',
       'Tutkimukset koskevat toisia etuusjärjestelmiä. Ne tukevat tulokanavaa, eivät Suomen lapsilisän tai elatustuen poiston euromäärää.')
review('cut-3-11 cut-3-12 cut-3-40 cut-3-42', 'housing',
       'Suomalaisessa tutkimuksessa asumistuen erot eivät siirtyneet vastaaviksi vuokraeroiksi. Leikkaus ei siis automaattisesti laske vuokraa.',
       'Osa menetyksestä voi siirtyä toimeentulotuen menoihin. Eläkkeensaajien siirto toiseen tukijärjestelmään vaatii molempien tukien yhteislaskelman; vuokrien alenemista ei oleteta korvaukseksi.',
       'Tutkimus koskee vanhan yleisen asumistuen porrastusta. Koko markkinan pitkän aikavälin vuokravaikutus voi poiketa siitä.')
review('cut-3-13 cut-3-14 benefits', 'spending',
       'Tilisaineistossa työttömyysturvan päättyminen pudotti kulutusta voimakkaasti. Ilman säästöjä tulonmenetystä on vaikea tasata.',
       'Kulutuksen väheneminen pienentää kulutusveroja. Työllisyysreaktio riippuu etuudesta ja työkyvystä; tutkimuksen kulutuspudotusta ei käytetä Suomen kaikkien perusturvaetuuksien kertoimena.',
       'Yhdysvaltojen työttömyysjaksoja koskeva tutkimus; Suomen etuuksien korvautuminen perustuu VM:n omiin laskelmiin.')
review('cut-3-15', 'ui spending',
       'Suomen kestotutkimuksessa pidempi työttömyysturva pidensi työttömyyttä. Lyhentäminen voi nopeuttaa työnhakua mutta heikentää toimeentuloa.',
       'Ansiosidonnaisen säästöstä osa siirtyy perus- ja toimeentulotukeen. Työllistymisestä syntyy vastakkaissuuntainen verohyöty. Uuden 300 päivän rajan vaikutusta ei voi päätellä vanhan uudistuksen keskiarvosta.',
       'Kyyrä ja Pesola tunnistavat jäljellä olevan etuusajan muutoksen vaikutusta Suomessa, eivät nykyisen enimmäiskeston poistoa kokonaisuudessaan.')
review('cut-3-16', '', '',
       'Kuntoutuksen väheneminen voi kasvattaa sairauspäiväraha- ja työkyvyttömyysmenoja. Kuntoutusmuodot ovat erilaisia, eikä koko harkinnanvaraiselle kuntoutukselle löytynyt yhtä luotettavaa nettokerrointa.',
       'VM:n kuntoutusmuistio kokoaa näyttöä. Terapiamuodon tai potilasryhmän tulosta ei yleistetä kaikkeen kuntoutukseen.', 'vm-only')
review('cut-3-17', 'psychotherapy',
       'Suomen tutkimuksessa psykoterapian aloitus kasvatti miesten ansioita; naisten keskimääräinen ansiovaikutus jäi vähäiseksi.',
       'VM arvioi 29,7 miljoonan korvaussäästöstä valtion osuudeksi 14,7 ja vakuutettujen osuudeksi 15 miljoonaa. Kolmannen terapiavuoden poistamisen ansio- tai sairausmenovaikutusta ei ole erikseen tunnistettu.',
       'Turunen ym. tutkivat hoidon aloittamista, eivät kahden ja kolmen hoitovuoden eroa. Hoidon pituutta vertailevia havaintoja ei tulkita syy-seuraussuhteeksi.', 'limited')
review('cut-3-18', 'privatecare',
       'Suomen korvausuudistuksissa osa tuesta on voinut siirtyä hintoihin. Korvauseuro ei aina alenna asiakkaan omavastuuta eurolla.',
       'Jos potilaita siirtyy julkiseen hoitoon, osa korvaussäästöstä kuluu siellä. Hintojen ja hoitopaikan valinnan yhteisvaikutukselle tarvitaan tämän poistomallin oma laskelma.',
       'Tutkimus koskee aiempia yksityisen hoidon korvausmuutoksia; koko korvauksen poisto voi vaikuttaa eri tavoin.')
review('cut-3-21 cut-3-22 cut-3-23', 'drugmortality carefees',
       'Omavastuun korotus voi vähentää myös tarpeellisten lääkkeiden käyttöä. Vakavien seurausten riski on suurempi paljon hoitoa tarvitsevilla.',
       'Lääkekorvausten säästöä voivat syödä muut hoitomenot ja toimeentulotuki. Yhdysvaltojen kuolleisuusvaikutusta ei muunneta Suomen korotusmallin kustannukseksi.',
       'Suomalainen ja pohjoismainen maksututkimus täydentää Medicare-tutkimusta. Verrokkimaan suurten hintahyppyjen tulos ei ole Suomen ennuste.')
review('cut-3-27 cut-3-28 cut-3-30', '', '',
       'Rahoitus voi siirtyä valtiolta vakuutusmaksuihin. Yrittäjän suurempi työtulo voi samalla kasvattaa myöhempiä etuuksia ja eläkettä; maksun lisäys ei ole sellaisenaan pysyvä nettohyöty.',
       'VM:n eläkevakuutusten rahoituslaskelma. Näille kolmelle tarkalle muutokselle ei löytynyt erillistä kausaalista tutkimusarviota.', 'vm-only')
review('cut-3-32 cut-3-33 cut-3-34 cut-3-36 cut-3-37 cut-3-38 cut-3-39', 'pensionadequacy',
       'Eläketurvan riittävyys riippuu myös muista etuuksista ja asumismenoista. Pienellä eläkkeellä menetyksen kattamiseen on vähän liikkumavaraa.',
       'Kansaneläkkeen, takuueläkkeen, asumistuen, toimeentulotuen ja verojen muutokset on laskettava yhdessä. Staattisesta nettoluvusta puuttuu lisäksi kulutuksen sopeutuminen.',
       'Suomalainen eläketulojen ja toimeentulon tutkimus kuvaa kohdentumista. Se ei anna näille eri leikkauksille yhteistä kulutuskerrointa.')
review('cut-3-43 cut-3-56', 'pensionadequacy',
       'Työkyvyttömyyden ja avuntarpeen vuoksi tulonmenetystä ei voi yleensä korvata yhtä helposti lisätyöllä.',
       'Menetystä voi korvata toinen etuus tai palvelu. Työllisyyden kasvua ei oleteta automaattisesti, eikä hoidon tarpeen mahdollista lisääntymistä ole hinnoiteltu.',
       'Toimeentulotutkimus tukee kohderyhmän kuvausta; vammaisetuuden poistolle ei löytynyt suoraa kausaalista nettoarviota.', 'limited')
review('cut-3-44 cut-3-45 cut-3-46 cut-3-47 cut-3-48 cut-3-57', 'pensionprojection',
       'Karttuman pienentäminen heikentää vasta tulevaa eläkettä. Vaikutus kasautuu niille, joiden työuraan osuu kyseisiä jaksoja.',
       'Säästö kasvaa hitaasti eläkkeiden alkaessa. Eläkeverot vähenevät ja osa saajista voi saada enemmän kansan- tai takuueläkettä; eläkerahaston säästö ei ole kokonaan valtion säästöä.',
       'ETK:n pitkän aikavälin laskenta kuvaa eläkejärjestelmän yhteyksiä. Tarkat toimenpideurat ovat VM:n kartoituksesta.')
review('cut-3-49 cut-3-53 cut-3-54 tax-pension', 'retirement',
       'Suomen eläkeiän nousu lisäsi työllisyyttä, mutta myös työttömyyttä ja työkyvyttömyyseläkkeellä oloa ennen vanhuuseläkettä.',
       'Työssä jatkavien verot kasvavat, mutta kaikki eivät pysty jatkamaan: muita etuuksia tarvitaan lisää. Verotuksen, ikärajan ja työkyvyttömyysehtojen muutoksille tarvitaan erilliset laskelmat.',
       'Vuoden 2017 ikärajan muutos tukee työmarkkinasiirtymien arviointia. Sitä ei voi suoraan skaalata 70 vuoden eläkeikään tai muihin eläkesääntöihin.')
review('cut-3-50 cut-3-51 cut-3-52', 'pensionprojection',
       'Eläkkeen ostovoima tai tuki leskeytymisen jälkeen heikkenee. Muutos osuu jo eläkkeellä oleviin eri tavalla kuin tulevan karttuman leikkaus.',
       'Eläkemenoista säästyvä euro pienentää myös eläkeveroja ja voi lisätä muita tukia. Rahastojen hyöty ja valtion veromenetys näkyvät eri sektoreilla.',
       'ETK:n laskentakehikko ja VM:n toimenpidelaskelma; kulutusvaikutusta tai leskien työn tarjontaa ei arvioida yleiskertoimella.')
review('cut-3-62', 'homecare homecare-immigrant-children homecare-germany integration integration-children integration-us-language integration-uk-rtof integration-germany-fiscal integration-germany-language',
       'Suomessa kotihoidon tuki vähensi äitien työllisyyttä myös myöhemmin. Saksalaisessa tutkimuksessa työnteon väheneminen oli suurempaa maahanmuuttajaäideillä. Suomessa pidempi tukijakso liittyi maahanmuuttajataustaisten lasten heikompiin äidinkielen arvosanoihin. Vanhempien kotoutumispalveluista on puolestaan havaittu hyötyjä myös lasten koulutukselle ja myöhemmille ansioille.',
       'VM:n kokonaisarviossa äitien työllistymisestä syntyvät verotulot ja etuussäästöt ovat jo mukana. Vuosittainen vaikutus muuttuu siinä positiiviseksi 2030-luvulla. Lasten tulevien työurien ja koulutuksen vaikutus on oletettu nollaksi, joten pitkän ajan hyöty voi jäädä aliarvioiduksi. Kokonaisnetolle ei ole julkaistu tässä vuosittaista eurosarjaa (VM 2026:44, s. 348–355).',
       'Laanisen sisarusvertailu ei yksin osoita syyvaikutusta. Saksan kotihoidontukitutkimuksen maahanmuuttajaotos on pieni. Kotoutumiskoulutuksen tulokset tukevat työllisyys- ja sukupolvivaikutusten merkitystä, mutta eivät mittaa kotihoidon tuen poistoa. Päivähoidon saatavuus sekä koulutuksen sisältö ja laatu vaikuttavat tulokseen; ulkomaisten ohjelmien tuottolukuja ei ole lisätty Suomen säästöarvioon.')
reviews['cut-3-62']['society'] = 'Tuen varassa kotona olevan perheen rahat vähenevät, ellei menetystä korvaa työ tai muu etuus.'
review('cut-3-63 cut-3-64', 'childbenefit',
       'Lapsiperheen tuloilla on tutkimuksissa ollut vaikutuksia vanhempien ja lasten hyvinvointiin.',
       'Vanhempainrahan verotus, toimeentulotuki ja mahdollinen aiempi työhönpaluu muuttavat nettovaikutusta. Lapsietuustutkimus ei ratkaise juuri tämän ansiosidonnaisen laskukaavan vaikutusta.',
       'Kanadan lapsietuusuudistukset; Suomessa vanhempainrahan yhteys vapaan pituuteen ja päivähoitoon on arvioitava erikseen.')
review('cut-3-65 cut-3-66 cut-3-67', 'carefees',
       'Hoidon rahoituksen muutos voi siirtää käyntejä palvelujärjestelmän osasta toiseen.',
       'Työnantaja voi korvata tuen menetyksen itse tai supistaa palvelua. Jälkimmäisessä tapauksessa julkisen terveydenhuollon menot voivat kasvaa; asiakasmaksututkimus ei anna työnantajan reaktiota.',
       'Potilaiden maksututkimus auttaa tunnistamaan hoitoonpääsyn riskejä, mutta ei mittaa työterveyden työnantajakorvauksen leikkausta.', 'limited')
review('cut-3-68 cut-3-69', '', '',
       'Yrittäjän itse ostama sijainen, tekemättä jäänyt työ ja mahdollinen työkyvyttömyys muuttavat nettoa. Vastaavasta lomitusleikkauksesta ei löytynyt kausaalista euromääräistä tutkimusta.',
       'VM:n lomitusmuistio; työhyvinvointikyselyä ei tulkita leikkauksen verotuotto- tai sairausmenovaikutukseksi.', 'vm-only')
review('cut-4-5', '', '',
       'Pienempi henkilöstömeno voi kasvattaa vaihtuvuutta ja vaikeuttaa varhaista puuttumista. Näiden seurausten eurovaikutuksesta tai juuri tämän mitoitusrajan kausaalisesta vaikutuksesta ei löytynyt arviota.',
       'VM:n lastensuojelumuistio. Asiakasmäärän ja kuormituksen yhteys ei yksin kerro lakisääteisen rajan poistamisen vaikutusta.', 'vm-only')
review('cut-4-6 cut-4-7', 'nursinghome',
       'Hoivakotien tutkimuksessa henkilöstön päivittäinen epävakaus liittyi heikompaan laatuun. Teknologia ei korvaa kaikkia hoitotehtäviä.',
       'Henkilöstösäästöstä voivat vähentyä lisäkoulutus, laitteet ja hoidolliset haitat. Tutkimus ei osoita turvallista yleistä vähennysprosenttia eikä teknologian euromääräistä nettosäästöä.',
       'Yhdysvaltojen hoivakotien havaintotutkimus ei mittaa Suomen mitoituslain poistoa tai tiettyä teknologiaa.', 'limited')
review('cut-4-9 cut-4-11', 'carefees psychotherapy',
       'Hoitoon pääsyn viive voi pitkittää oireita ja työ- tai opiskelukyvyttömyyttä. Tämän takuun poistosta ei ole vielä vastaavaa vaikutuskoetta.',
       'Takuuseen lisätyn määrärahan poistaminen ei todista samansuuruista nettosäästöä. Myöhemmät hoidot ja sairausetuudet voivat kasvattaa menoja.',
       'Hoitoonpääsyn ja psykoterapian näyttö kuvaa riskiä. Se ei anna Suomen uuden hoitotakuun poistolle euromääräistä kerrointa.', 'limited')
review('cut-4-14', 'fostercare',
       'Kalifornian seurannassa pidempi jälkihuolto liittyi parempaan kouluttautumiseen ja vähäisempään asunnottomuuteen.',
       'Nuoren tuen tarve voi siirtyä asumispalveluihin, toimeentulotukeen ja terveydenhuoltoon. Ulkomaisen jälkihuollon tuloksia ei muuteta Suomen poistomallin nettosäästöksi.',
       'Kalifornian vertailuasetelma ja palvelut poikkeavat Suomesta; jälkihuoltoon valikoituminen rajoittaa tulkintaa.')
review('cut-4-16 cut-4-17 cut-4-18 cut-4-19 cut-4-20', 'carewealth',
       'Varallisuudesta perittävä maksu kohdistuu omaisuutta omistaviin hoivan käyttäjiin ja pienentää myöhemmin perittävää varallisuutta.',
       'THL:n mikrosimulointi ei ennusta omaisuuden lahjoittamista, hoivavalintoja tai kaikkia verovaikutuksia. Maksukertymä ei siten ole valmis käyttäytymisvaikutukset sisältävä netto.',
       'Suomalainen SOTE-SISU-aineisto, mutta pitkäaikaishoivan malli ei suoraan kata kotihoitoa. Toteutuksen varallisuusrajat ovat ratkaisevia.', 'direct-model')
review('cut-4-21 cut-4-22 cut-4-24 cut-4-30 cut-4-47', 'carefees deductible',
       'Maksut voivat vähentää myös tarpeellisen hoidon käyttöä. Pienituloisuus ja suuri hoidontarve lisäävät maksurasitusta.',
       'Maksuvapautukset, toimeentulotuki ja myöhemmin tarvittava hoito voivat pienentää kertymää. Näille eri maksumalleille ei ole yhtä yhteistä luotettavaa nettokerrointa.',
       'Suomen ja Pohjoismaiden maksututkimukset sekä Yhdysvaltojen omavastuukoe; apuväline- ja YTHS-maksuihin soveltaminen on epäsuoraa.')
review('cut-4-25 cut-4-26 cut-4-35', '', '',
       'Tilojen ja päivystyksen säästöä vastaan tulevat kuljetukset, vastaanottavien yksiköiden kapasiteetti ja pidempien matkojen haitat. Verkko on määriteltävä ennen luotettavaa nettohaarukkaa.',
       'VM:n palveluverkkoselvitys. Keskittämisen tutkimus riippuu sairaudesta ja etäisyydestä; yleistä kaikille hoidoille pätevää säästökerrointa ei käytetä.', 'vm-only')
review('cut-4-27 cut-5-62 cut-5-67 cut-5-72', 'procurement',
       'Hankintatutkimuksessa samasta tuotteesta maksettiin hyvin eri hintoja. Yhteishankinta voi säästää, jos se todella alentaa kustannuksia.',
       'Tietojärjestelmät, sopimusten purku ja toiminnan yhdistäminen maksavat aluksi. Italialaisten tavarahankintojen säästöosuutta ei käytetä Suomen ICT- tai sairaalapalvelujen nettokertoimena.',
       'Tutkimus tunnistaa hankintojen tehottomuutta; se ei todista kaikkien keskitettyjen palvelujen olevan hajautettuja halvempia.')
review('cut-4-29', 'carefees offsets',
       'Korkeammat omavastuut vähentävät hoidon käyttöä. Hoitamattomat ongelmat voivat johtaa myöhemmin raskaampaan hoitoon.',
       'Hammashoitomeno ei katoa, jos asiakas maksaa sen itse. Julkisesta säästöstä voivat vähentyä tukimenot ja vaikeutuneiden ongelmien hoito; tarkkaa nettoa ei voi siirtää muun hoidon tutkimuksesta.',
       'Maksututkimus osoittaa kysyntäkanavan. Eläkeläisten muun sairaanhoidon tutkimus on tässä vain näyttöä kustannusten siirtymisen mahdollisuudesta.')
review('cut-4-31', 'mergers',
       'Suomen historiallisissa kuntaliitoksissa ei havaittu järjestelmällistä menojen laskua. Suurempi organisaatio ei siis yksin takaa säästöä.',
       'VM:n 9+2 alueen esimerkissä palkkojen yhdenmukaistaminen maksaisi 210–565 milj. € vuodessa. Tämä on kustannushaarukka, ei säästö. Säästöjen täytyy ylittää myös ICT- ja muut muutoskulut.',
       'Kuntaliitokset eivät ole hyvinvointialueita. VM:n kustannushaarukka on erillinen laskelma, jonka suuruus riippuu siirtymäajasta.', 'limited')
review('health cut-4-33', 'nursing lowvalue',
       'Hoidon vähentämisen seuraus riippuu sisällöstä: tarpeettoman toimenpiteen poisto ja henkilöstön vähentäminen eivät vaikuta samalla tavalla.',
       'Rahoituksen alentaminen säästää yhteensä vain, jos alueiden toteutuneet menot alenevat. Siirtymäkulut, hoidon viiveet ja muiden palvelujen kuormitus voivat pienentää hyötyä.',
       'Henkilöstötutkimus ja lumekirurginen koe kuvaavat kahta eri kanavaa. Niistä ei voi laskea koko sote-järjestelmän säästöpotentiaalia.')
review('cut-4-34', 'lowvalue',
       'Suomen lumekirurgisessa kokeessa rappeumaperäisen kierukkavamman tähystys ei tuonut lumetoimenpidettä parempaa tulosta.',
       'Vaikuttamattoman hoidon välttäminen voi säästää ilman terveyshaittaa. Rahaa säästyy vain siltä osin kuin henkilöstö-, tila- tai hankintakustannus todella poistuu tai korvaa muuta tarpeellista työtä.',
       'Vahva koe koskee tarkasti rajattua polvivaivaa. Muiden poistettavien hoitojen vaikuttavuus on arvioitava erikseen.', 'direct-mechanism')
review('cut-4-36', 'discharge',
       'Cochrane-katsauksessa yksilöllinen kotiutussuunnitelma lyhensi sairaalajaksoa hieman ja vähensi uusintahoitoja.',
       'Jatkohoito ja kotihoito maksavat, vaikka sairaalapäiviä vähenee. Katsauksen kustannusnäyttö ei riitä Suomen vuodeosastopaikkojen vähentämisen valmiiksi nettohaarukaksi.',
       'Katsaus koskee suunniteltua, tuettua kotiuttamista. Potilaan siirtäminen ilman riittävää jatkohoitoa on eri toimi.')
review('cut-4-37', 'nursinghome discharge',
       'Kevyempi asuminen toimii vain, jos hoivan tarve ja saatavilla oleva apu vastaavat toisiaan.',
       'Asumisen, kotihoidon, omaisten avun ja sairaalahoitojen kustannukset on laskettava yhteen. Pelkkä ympärivuorokautisen paikan hinnan erotus ei ole koko nettosäästö.',
       'Hoivan laatu- ja kotiuttamistutkimus ei määritä, kuinka moni suomalainen voidaan turvallisesti siirtää yhteisölliseen asumiseen.', 'limited')
review('cut-4-40 cut-4-42 cut-4-48', '', '',
       'Rahan siirtäminen yleisrahoitukseen ei itsessään vähennä tehtävän menoja. Hallinnon säästö on erotettava varsinaisesta palvelurahoituksesta; siirron säästömäärää ei ole osoitettu.',
       'VM:n rahoitusmuistio. Järjestön avustuksen tai erilliskorvauksen poisto vaatii tiedon siitä, jääkö tehtävä toteuttamatta vai siirtyykö sen rahoitus.', 'vm-only')
review('cut-5-16 cut-5-17 cut-5-20', 'aidreview',
       'Avun vaikuttavuus vaihtelee kohteittain. Terveyden, koulutuksen tai kriisiavun menetystä ei voi päätellä pelkästä avustussummasta.',
       'Ulkomailla käytetty avustus ei palaudu Suomeen samoin kuin kotimainen palkkameno. Silti turvallisuus-, kauppa- ja muuttoliikevaikutukset voivat muuttaa pitkän ajan nettoa; Suomelle ei ole tarkkaa yhteisarviota.',
       'Kehitysavun katsaus ei arvioi Suomen koko avun lakkautusta, Ukrainan jälleenrakennusta tai yksittäistä katastrofiapua.')
review('cut-5-22 cut-5-29 cut-5-33', '', '',
       'Maksu voi vähentää asiointia, ja henkilöstöleikkaus pidentää käsittelyä. Perimättä jäävät maksut ja oikeusavun tarve voivat syödä säästöä; tälle mallille ei löytynyt kausaalista nettoarviota.',
       'VM:n oikeushallinnon muistiot. Oikeuksiin pääsyn ja perinnän vaikutuksia ei oleteta nollaksi, vaikka niitä ei ole euromääräistetty.', 'vm-only')
review('cut-5-40 cut-5-42', 'police',
       'Yhdysvaltojen tutkimuksessa suurempi poliisimäärä vähensi rikollisuutta. Työn kohdentuminen vaikuttaa tulokseen.',
       'Menetetty ehkäisy tai tutkintatyö voi lisätä rikosten aiheuttamia kustannuksia. Yhdysvaltojen rikos- ja henkilöstölukuja ei käytetä 400 suomalaisen poliisin nettokertoimena.',
       'Tutkimus koskee poliisimäärää Yhdysvaltain kaupungeissa, ei Suomen työnohjausta tai palkanlisien poistoa.')
review('cut-5-49 cut-5-50 cut-5-51 cut-5-52', 'publicspend',
       'Kotimaisen hankinnan vähennys heikentää kysyntää eri tavalla kuin tuontiaseen oston lykkäys.',
       'Verotulojen palautuma riippuu kotimaisesta työstä ja tuonnista. Yhdysvaltojen menokerrointa ei käytetä Suomen puolustusleikkauksen nettoon; turvallisuusvaikutukselle ei ole mielekästä yleistä eurokerrointa.',
       'Rameyn katsaus käsittelee menojen BKT-vaikutusta, ei Suomen puolustuksen riittävyyttä.')
review('cut-5-53', 'peace',
       'Rauhanturvatutkimuksessa suurempi sotilas- ja poliisiosasto liittyi vähäisempään siviileihin kohdistuvaan väkivaltaan.',
       'Suomen osallistumisen vähentämisen turvallisuusvaikutusta ei voi jakaa tutkimuksen keskiarvosta euroiksi. Matka-, palkka- ja hankintamenon säästö ei mittaa rauhanturvan menetettyä hyötyä.',
       'YK-operaatioiden paneelitutkimus; Suomen yksittäisen osuuden vaikutusta ei ole tunnistettu.')
review('cut-5-55', '', '',
       'Jo rahoitettujen terveysmenojen nimeäminen Nato-menoiksi ei itsessään säästä. Hyöty syntyy vain, jos sillä vähennetään muita suunniteltuja menoja ilman vastaavia uusia menoja.',
       'VM:n budjettiskenaario; kirjanpitoluokan muutoksesta ei ole erillistä taloudellista vaikutuskoetta.', 'vm-only')
review('cut-5-58', '', '',
       'Matkalaskujen aleneminen on suoraa menosäästöä. Työn tulosten tai korvaavien järjestelyjen muutoksesta ei löytynyt Suomen koko valtionhallinnolle luotettavaa nettoarviota.',
       'VM:n matkamenoesimerkki. Etäkokousten yksittäisiä hyötyjä ei yleistetä kaikkeen virkatyöhön.', 'vm-only')
review('cut-5-64 cut-5-75', '', '',
       'Maksun perintä, maksuvapautukset ja asioinnin väheneminen vaikuttavat kertymään. Pakollisen luvan ja vapaaehtoisen palvelun kysyntä eivät reagoi samalla tavalla.',
       'VM:n maksuperustemuistio. Koko heterogeeniselle maksujoukolle ei löytynyt yhteistä tutkimukseen perustuvaa nettohaarukkaa.', 'vm-only')
review('cut-5-66', 'prison',
       'Norjan tutkimuksessa kuntouttava vankeus vähensi uusintarikollisuutta tietyillä ryhmillä. Tilatehokkuus ei yksin mittaa vankilan tulosta.',
       'VM:n poliisiverkon laskelmassa kustannus olisi noin 30 milj. € alempi vuonna 2040. Se ei ole vuoden 2031 säästö eikä kata vankiloiden muutto- ja investointikuluja.',
       'Norjan tutkimus koskee vankeuden sisältöä, ei vankilan optimaalista kokoa. Suomen kustannusluku on erillinen poliisiverkkoskenaario.', 'limited')
review('cut-5-77 cut-7-30 cut-7-41 cut-7-42', 'publicemployment',
       'Henkilöstömenon väheneminen ei siirry kokonaan nettosäästöksi: osa palkkaveroista häviää ja etuusmenoja voi syntyä.',
       'Lopullinen hyöty riippuu poistuvista tehtävistä, työllistymisestä muualla ja palvelujen korvaamisesta. Eläköityvien korvaamatta jättäminen ei tuota samaa nettovaikutusta kuin irtisanominen.',
       'Julkisen työllisyyden kansainvälinen tutkimus ei määritä Suomen tehtävien turvallista leikkausvaraa.')
review('cut-6-5 cut-6-6 cut-6-7 cut-7-21', 'multiplier',
       'Indeksin leikkaus pienentää ostovoimaa vähitellen. Vaikutus riippuu siitä, väheneekö etuus, palvelu, hankinta vai palkkameno.',
       'Automaattikorotuksen poiston säästö riippuu myöhemmistä harkinnanvaraisista korotuksista. Myös vähennysprosentin kohteena oleva menojoukko on määriteltävä; yleinen BKT-kerroin ei ratkaise nettoa.',
       'Menolajit reagoivat eri tavoin. Laajalle indeksimuutokselle ei johdeta yhtä yhteistä prosentuaalista palautumaa.')
review('cut-7-12 cut-7-23 cut-7-27 cut-7-28', 'fiscalrules',
       'Tutkimuksessa finanssisäännön olemassaolo ei yksin riittänyt: säännön rakenne ja toteutus vaikuttivat alijäämään.',
       'Varausten tai käyttämättömien määrärahojen poistaminen säästää vain verrattuna menoon, joka muuten toteutuisi. Kirjaustavan muutos tai saman menon siirto ei ole uusi pysyvä säästö.',
       'Maiden välinen sääntötutkimus ei anna Suomen budjettikäytännön muutokselle valmista euroarviota.')
review('cut-7-16', '', '',
       'Puolueiden toimintakulut tai muu rahoitus muuttuvat. Mahdollista vaikutusta poliittiseen kilpailuun ja yksityisen rahoituksen merkitykseen ei ole hinnoiteltu tämän poistoehdotuksen osalta.',
       'VM:n puoluetukilaskelma. Puoluetuen koko poistosta Suomessa ei löytynyt suoraa kausaalista tutkimusarviota.', 'vm-only')
review('cut-7-18', 'mergers',
       'Suomen kuntaliitostutkimuksessa yhdistäminen ei tuonut automaattisesti alempia menoja. Päällekkäisten tehtävien täytyy todella poistua.',
       'Muutoskulut ja toiminnan häiriöt voivat pienentää alkuvaiheen hyötyä. Ministeriöiden vähentäminen säästää vain, jos tehtäviä, henkilöstökuluja tai muita menoja todella poistuu.',
       'Kuntaliitostutkimus on tässä vertailukohta: se ei mittaa ministeriöiden vähentämisen vaikutuksia. VM:n 20–25 prosentin säästötavoite ei ole tutkimustulos.')
review('cut-7-20', 'mergers',
       'Suomen kuntaliitostutkimuksessa yhdistäminen ei tuonut automaattisesti alempia menoja. Päällekkäisten tehtävien täytyy todella poistua.',
       'Hallinnon säästö vahvistaa kuntataloutta. Valtion menot alenevat vain siltä osin kuin palvelukustannusten lasku pienentää valtionosuuksia. Yhdistämisen muutoskulut voivat syödä osan säästöstä.',
       'Tutkimus koskee historiallisia kuntaliitoksia. Se ei arvioi VM:n ehdottamaa kuntien tehtävien eriyttämistä tai nykyisen palveluverkon muutoksia.')
review('cut-7-19', '', '',
       'VM:n ”kymmeniä miljoonia” ei ole arvioitu vaihteluväli. Korvausvastuut ja niiden perusteet on ensin yksilöitävä; tämän perusteella ei voi luvata esimerkiksi 20–90 miljoonan säästöä.',
       'Ehdotus ei vielä nimeä poistettavia vastuita. Tutkimus ei voi antaa nettoa määrittelemättömälle toimelle.', 'unspecified')
review('cut-7-24', 'procurement arts',
       'Hallinnon yhdistäminen ja avustettavan palvelun lopettaminen ovat eri asioita: niiden hyödyt ja haitat on arvioitava erikseen.',
       'Muiden korttien avustusleikkaukset voivat sisältyä tähän samaan kokonaisuuteen. Hallinnon tehostamisesta ei voi päätellä koko 20 prosentin avustusleikkauksen haitattomuutta tai nettoa.',
       'Hankintojen ja taidetoiminnan tutkimukset osoittavat erilaisia kanavia; koko avustusjoukosta ei ole yhteistä kausaalista tulosta.', 'limited')
review('cut-7-29', 'howell',
       'Julkisesti rahoitettujen kokeilujen hyöty riippuu kohteesta. Tutkimusavustusten näyttö ei yksin osoita Sitran hankkeiden tuottoa.',
       'Sijoitusvarojen siirto ei ole vuosittainen säästö. VM:n 70 miljoonaa on arvio valtiolle tulevasta omaisuustulosta; markkinatuotto ja menetetyn toiminnan hyödyt ovat epävarmoja.',
       'Howellin tutkimus koskee Yhdysvaltojen energia-alan yritysavustuksia. Sitran lakkautuksesta ei löytynyt tutkimukseen perustuvaa kokonaisnettoa.', 'limited')
review('cut-7-44 cut-7-46 cut-7-48 cut-7-49', '', '',
       'Pidempi työaika ei itsestään vähennä maksettavia palkkoja. Rahasäästö vaatii sijais-, ylityö- tai henkilöstömenon poistumista; työn kuormituksen ja tuottavuuden muutokselle ei ole tämän mallin nettoarviota.',
       'VM:n työaikalaskelma on ehdollinen. Työtuntien laskennallista arvoa ei pidetä automaattisesti kassaan jäävänä rahana.', 'vm-only')
review('cut-7-45', 'sickpay contagion',
       'Sairausajan palkan leikkaus on vähentänyt poissaoloja, mutta sairaana työskentely voi lisätä tartuntoja.',
       'Palkkasäästöä voivat syödä tartunnat, pidempi sairastaminen ja heikompi työteho. Saksan 80 prosentin sairauspalkkaa ei voi muuntaa Suomen yhden karenssipäivän nettokertoimeksi.',
       'Saksan ja Yhdysvaltojen uudistukset; julkisen sektorin ammatit ja potilastyö voivat reagoida eri tavoin.')
review('cut-7-50 cut-7-51 cut-7-52', 'mpc',
       'Kulutus reagoi tulonmuutokseen eri tavoin: käteiset säästöpuskurit selittävät paljon, pelkkä tuloluokka ei riitä.',
       'Palkkaverot ja kulutusverot alenevat. Rekrytoinnin, vaihtuvuuden ja työn tarjonnan muutoksia ei ole laskettu kattavasti; lottovoiton kulutusreaktiota ei käytetä pysyvän palkkaleikkauksen kertoimena.',
       'Norjan tutkimus koskee tilapäisiä tulonlisäyksiä. Pysyvän palkanalennuksen vaikutus voi olla erilainen.')
review('income income-index', 'incomeelastic mpc',
       'Verot muuttavat sekä käteen jäävää rahaa että tulojen ilmoittamista. Kulutusreaktioon vaikuttavat erityisesti käytettävissä olevat säästöt.',
       'Näytetty netto perustuu VM:n omiin työn tarjonnan ja kulutuksen oletuksiin. Kansainvälistä verotettavan tulon joustoa ei vähennetä siitä uudelleen.',
       'Verotettavan tulon muutos sisältää muutakin kuin työtunteja. Norjan säästöpuskuritutkimus ei anna Suomen tulodesiilien veropalautumaa.')
review('tax-donation', 'donation',
       'Lahjoitusten verohinta vaikutti lahjoittamiseen yhdysvaltalaisessa paneelitutkimuksessa. Vähennyksen poisto voi pienentää vastaanottajien rahoitusta.',
       'Menetetty yliopisto- tai muu yleishyödyllinen rahoitus ei automaattisesti tule valtion korvattavaksi. Mahdollinen korvaava rahoitus ja lahjoitusten muutos ratkaisevat nettovaikutuksen.',
       'Yhdysvaltojen lahjoitusverotuksen kannustimet ja saajajoukko poikkeavat Suomen mallista.')
review('tax-household', 'cleaning',
       'Suomen ja Ruotsin tutkimuksessa vähennys ei lisännyt siivouspalvelujen kysyntää eikä vähentänyt havaittua veronkiertoa.',
       'VM:n 360 miljoonaa kuvaa koko verotuen arvoa, ei määrittelemättömän supistuksen nettoa. Siivoustutkimus ei kata remontteja, joten se ei oikeuta olettamaan koko summaa varmaksi säästöksi.',
       'Vertaisarvioitu vaikutustutkimus siivouspalveluista; remonttien, hoivan ja tuen täyden poiston vaikutukset jäävät erillisiksi.')
review('tax-capital-low tax-capital-high', 'incomeelastic mpc',
       'Pääomatulon ajoitusta ja tulolajia voi muuttaa. Varakkaan kulutus ei reagoi veroeuroon samoin kuin säästöttömän kotitalouden.',
       'Myyntivoittojen lykkääminen ja tulojen muuntaminen voivat pienentää tuottoa. Kulutuspalautumaa ei oleteta nollaksi eikä samanlaiseksi kuin pienituloisten etuusleikkauksessa.',
       'Tuloverojouston katsaus ja Norjan kulutustutkimus eivät anna juuri Suomen pääomatulokannan korotuksen nettohaarukkaa.')
review('tax-entrepreneur-remove tax-entrepreneur-step tax-dividend-return dividends', 'incomeshifting',
       'Suomen verouudistustutkimuksessa yrittäjät muuttivat palkan ja osingon välistä tulonjakoa verokannustimien mukaan.',
       'Osingonjaon, tulolajin ja ajoituksen muutokset voivat pienentää suoraa tuottoa. Tulon siirtyminen toiseen veropohjaan ei kuitenkaan ole sama kuin koko tulon katoaminen taloudesta.',
       'Tutkimus koskee aiempaa osinkoverouudistusta. Yrittäjävähennyksen poisto ja nykyisen osinkohuojennuksen lakkautus vaativat oman laskelman.')
review('tax-rd', 'rdtax',
       'Britannian tutkimuksessa T&K-verotuki lisäsi yritysten tutkimusta ja patentteja, etenkin rahoitusrajoitteisissa yrityksissä.',
       'VM:n 35 miljoonaa on koko verotuen määrä. Poiston tuotto riippuu vähennysten käytöstä ja tutkimuksen muutoksesta; menetettyä innovaatiota ja tulevaa veropohjaa ei ole laskettu.',
       'Britannian yrityskoon rajaa koskeva kausaalinen tutkimus; Suomen uusi yhdistelmävähennys on eri järjestelmä.')
review('tax-ifrs', '', '',
       'Poisto- ja luottotappiovarausten muutokset voivat siirtää veron maksua vuodesta toiseen. VM:n kokonaisuus sisältää myös verotuloja alentavia osia, joten sille ei ole perusteltua antaa positiivista haarukkaa.',
       'Toteutustapa ja siirtymäsäännöt puuttuvat. Pelkkä tilinpäätösstandardin nimi ei määritä verotuottoa.', 'unspecified')
review('corporate', 'corporatetax',
       'Suomen yhteisöveronalennus ei lisännyt pienten osakeyhtiöiden investointeja, mutta niiden liiketoiminta kasvoi. Kaikki yritykset eivät reagoi samoin.',
       'Tulonmuunnon väheneminen voi vahvistaa ansio- ja pääomatuloveroja. Sitä ja työllisyysvaikutuksia ei ole laskettu tähän haarukkaan. Osa käyttäytymisvaikutuksista syntyy vasta vuosien kuluttua; kyse ei ole vuoden 2031 ennusteesta eikä suuren korotuksen erillisestä laskelmasta.',
       'Tutkimus koskee vuosien 2012–2014 veronalennuksia. Korotuksen vaikutus ei välttämättä ole niiden peilikuva.')
review('tax-forest', '', '',
       'Hakkuun tai puukaupan lykkäys voi siirtää verotuloa myöhemmäksi. Metsävähennyksen juuri tämän rajan muuttamisesta ei löytynyt kausaalista nettohaarukkaa.',
       'VM:n metsäveromuistio. Puun kysyntää koskeva tutkimus ei yksin tunnista metsävähennyksen vaikutusta.', 'vm-only')
review('tax-transfer-land tax-transfer-homes', 'transfertax',
       'Suomen varainsiirtoverotutkimuksessa vero vähensi muuttamista. Asunto voi siksi jäädä tarpeisiin nähden vääränkokoiseksi tai väärään paikkaan.',
       'Esitetty mekaaninen netto ei sisällä kaikkia väheneviä kauppoja. Vanhan uudistuksen muuttovaikutusta ei voi sellaisenaan kertoa nykyisellä koko asuntokaupan veropohjalla.',
       'Suomalainen verouudistus ja markkinamalli; kiinteistöjen yrityskaupat eivät ole sama kohde kuin kotitalouksien asunnonvaihto.')
review('tax-transfer-shares', 'transfertax',
       'Kauppaan sidottu vero voi lykätä omistajanvaihdoksia. Asuntokaupan tutkimus tukee mekanismia, ei yrityskauppojen vaikutuksen kokoa.',
       'Muiden verojen vähennykset ovat mukana VM:n mekaanisessa arviossa. Yrityskauppojen määrän tai rakenteen muutokselle ei löytynyt tämän korotuksen luotettavaa nettoarviota.',
       'Asuntomarkkinatutkimusta ei käytetä listaamattomien osakkeiden kaupan joustona.', 'limited')
review('tax-succession tax-inheritance', 'inheritance',
       'OECD:n katsauksessa yritysvarallisuuden huojennukset hyödyttävät etenkin varakkaita; näyttö niiden välttämättömyydestä yritysten jatkuvuudelle on rajallista.',
       'Lahjojen ajoitus, arvostukset ja verosuunnittelu muuttavat kertymää. Verotuen arvo ei ole sama kuin poiston tuotto; maksuajan pidennys voi helpottaa maksuvalmiutta ilman pysyvää huojennusta.',
       'Kansainvälinen tutkimuskatsaus. Suomen 240 miljoonan verotukiarvio on VM:n laskelma, ei tässä todettu nettotuotto.')
review('tax-vat15 tax-vat16 tax-food18 tax-vat-services vat tax-vat-standard tax-vat-reduced', 'vatasymmetry',
       'ALV-korotukset ja alennukset eivät siirry hintoihin samalla tavalla. Korotus voi näkyä sekä asiakkaan hinnassa että yrityksen katteessa.',
       'Haarukka on laskettu VM:n yleisarviosta, ei tämän vaihtoehdon erillisestä kokonaistaloudellisesta simuloinnista.',
       'Suomen ja Ruotsin toimialauudistukset osoittavat hinnoittelureaktion. Niistä ei saada yhdenmukaista kerrointa kaikkiin hyödykkeisiin.')
review('tax-vat-news135 tax-vat-news255', 'vatservice',
       'Palvelualan verouudistus osoitti, ettei veromuutos siirry aina kokonaan kuluttajahintaan. Osa voi jäädä yrityksen katteeseen.',
       'Tilausten väheneminen pienentäisi kertymää. Parturi-kampaamoiden kysyntäreaktiota ei käytetä lehtien kysyntäjoustona, eikä uutistarjonnan menetystä ole hinnoiteltu.',
       'Suomen palvelualan tutkimus on hinnoittelun vertailukohta; suoraa arviota näistä lehtiveron korotuksista ei löytynyt.', 'limited')
review('tax-insurance', '', '',
       'Vakuutusturvan supistaminen voi vähentää veropohjaa ja jättää enemmän vahinkoriskiä kotitaloudelle tai julkiselle turvalle. Suomen tämän korotuksen nettovaikutuksesta ei löytynyt tutkimusarviota.',
       'VM:n yksikköarvio; vakuutuslajien erilaisia kysyntäreaktioita ei korvata yhdellä oletusjoustolla.', 'vm-only')
review('tax-excise-index tax-fuel tax-vehicle', 'carbon fuel',
       'Polttoaineen hinnannousu on vähentänyt ajamista ja päästöjä. Auton omistamisesta perittävä vero kannustaa eri tavalla kuin ajokilometrien hinta.',
       'Polttoaineen ja autokannan muutos voi pienentää veropohjaa. VM:n laskelmassa jo huomioitua kysyntäreaktiota ei vähennetä toistamiseen.',
       'Ruotsin polttoainevero ja Tanskan ajosuorite; ajoneuvon kiinteän veron vaikutus on erillinen.')
review('tax-tobacco', 'tobacco',
       'Hintojen korottaminen vähentää tupakointia; nuoret ja pienituloiset reagoivat usein muita enemmän. Jatkaville käyttäjille rahallinen rasitus kasvaa.',
       'VM:n nettoluku sisältää jo kulutuksen vähenemisen ja mekaanisia verovaikutuksia. Pitkän ajan terveysmenoja ja kuolleisuuden muita julkistaloudellisia seurauksia ei ole laskettu tähän.',
       'Laaja kansainvälinen tutkimuskatsaus tukee kysyntä- ja terveyskanavaa; Suomen tuotto perustuu VM:n omaan laskelmaan.')
review('tax-peat tax-heat tax-biomass', 'biomass',
       'Suomen energiamallissa verotus ohjaa lämmöntuotantoa polttoaineiden, lämpöpumppujen ja sähkökattiloiden välillä.',
       'Korvaavan energian verotus vaikuttaa nettoon. Biomassatutkimus arvioi energiaveroja, mutta ei kaikkia teollisuuden, työllisyyden tai muiden verojen muutoksia.',
       'AFRY:n skenaariomalli. Turpeen ja lämpöpumppujen tukimuutokset vaativat oman verojen yhdistelmän; mallin tulosta ei vähennetä VM:n nettoarviosta uudelleen.')
review('tax-waste-energy', 'waste',
       'Polttovero voi nostaa jätehuollon hintaa ja muuttaa jätteen kuljetusta. Ruotsin arvioinnissa kierrätyksen ohjausvaikutus jäi heikoksi.',
       'VM:n 30–90 miljoonaa kuvaa eri verotukimalleja. Jätevirtojen siirtyminen ja päästökauppa muuttavat uuden veron tuottoa; tämä ei ole varma nettosäästöhaarukka.',
       'Ruotsin veron arviointi on vertailukohta. Verorakenne, jätteen tuonti ja Suomen käsittelyverkko poikkeavat siitä.')
review('tax-tickets', 'aviation',
       'Lippuvero voi vähentää lentämistä tai siirtää lähtöjä toiseen maahan. Vaikutus riippuu vaihtoehtoisista reiteistä.',
       'VM:n 200–400 miljoonaa riippuu verotasosta. Matkustuksen ja reittien muutos sekä muut verot on arvioitava ennen kokonaisnettoa; lentotutkimus ei kata laivaliikennettä.',
       'Eurooppalainen lentoverotutkimus; Suomen sijainti ja vero molemmille liikennemuodoille rajoittavat siirrettävyyttä.')
review('tax-electric1', 'energy',
       'Korkeampi sähkön hinta kannustaa säästämään energiaa. Sopeutumismahdollisuus riippuu lämmitysmuodosta ja investointirahasta.',
       'Muiden verojen mekaaninen vähennys on mukana. Teollisuuden energiatehokkuustulosta ei käytetä kotitalouksien kysyntäkertoimena eikä lämmitysköyhyyden vaikutusta ole euromääräistetty.',
       'Suomen teollisuustutkimus tukee energiansäästön mekanismia, mutta kotitalouksien reaktioita se ei mittaa.', 'limited')
review('tax-car-all tax-car-combustion', 'cartax',
       'Auton hankinnan verotus vaikuttaa ostetun auton tyyppiin. Sähköauton sisällyttäminen veroon muuttaa myös sähköistymisen kannustinta.',
       'Autokaupan ajoitus ja autonvalinta muuttavat kertymää. Hankintaveron ja käytön verojen yhteisvaikutukselle tarvitaan oma arvio; yksikköarviosta skaalattu suuri muutos ei ole uusi tutkimustulos.',
       'Eurooppalaisten autoverojen tutkimus; Suomen autokanta ja käytettyjen autojen tuonti voivat reagoida eri tavoin.')
review('tax-land-values tax-land-min', 'land',
       'Tanskan tutkimuksessa pysyvä maaveron korotus alentui maan hintaan: rasitus jäi pitkälti muutoksen aikaiseen omistajaan.',
       'Maan tarjonta ei vähene veron vuoksi, mutta maksuvalmius ja omaisuuden arvo muuttuvat. Suomen arvostamis- ja veroprosenttimuutoksen tuotto perustuu silti VM:n veropohjaan.',
       'Tanskan maaverouudistus tukee veron kohdentumisen arviota. Se ei tarkoita, että koko kiinteistövero tai kaikki Suomen alueet käyttäytyisivät samoin.')

# Replace distant analogies with directly relevant evidence or an explicit gap.
# A reference is not useful merely because it concerns public spending.
for id in ['cut-1-11', 'cut-7-24', 'cut-7-29', 'cut-3-65', 'cut-3-66', 'cut-3-67', 'tax-transfer-shares']:
    reviews[id].update(sources=[], finding='', status='vm-only')
reviews['cut-1-11']['scope'] = 'VM:n yritystukimuistio. Tämän sekalaisen tukijoukon vaikuttavuudesta ei ole yhteistä tutkimusarviota.'
reviews['cut-7-24']['scope'] = 'VM:n avustusmuistio. Eri avustusten kohteet ja tulokset on arvioitava erikseen.'
reviews['cut-7-29']['scope'] = 'VM:n omaisuustuloarvio. Sitran koko toiminnan lopettamisesta ei ole käytössä tutkimukseen perustuvaa nettoarviota.'
for id in ['cut-3-65', 'cut-3-66', 'cut-3-67']:
    reviews[id]['scope'] = 'VM:n työterveysmuistio. Työnantajan korvausleikkaus on eri asia kuin potilaalta perittävän maksun korotus.'
reviews['tax-transfer-shares']['scope'] = 'VM:n osakekaupan verolaskelma. Asuntokaupan joustoa ei käytetä yrityskauppojen ennusteena.'
reviews['cut-3-18'].update(
    sources=['privatecare', 'dental'],
    society='Korvausten poisto nostaisi yksityisen hoidon asiakkaan omavastuuta. Kelan rekistereissä yksityistä hoitoa käyttävät etenkin suurituloiset, korkeasti koulutetut ja ikääntyneet.',
    finding='Hammashoidossa aiempi korvausleikkaus lisäsi julkisen hoidon käyttöä mutta tuotti silti nettosäästöä.',
    fiscal='Julkiseen hoitoon siirtyvät potilaat voivat pienentää säästöä. Aiempi hammashoidon korvausleikkaus tuotti KKV:n mukaan silti nettosäästöä. Koko nykyisen korvausjärjestelmän poistolle ei ole vastaavaa lopullista nettoarviota.',
    scope='VM:n laskelma kattaa myös hammashoidon ja matkakorvauksia. Kelan rekisteritutkimus kuvaa käyttäjiä; KKV arvioi hammashoidon aiempia korvausmuutoksia, ei kaikkien korvausten poistamista.')
for id in ['cut-4-25', 'cut-4-26', 'cut-4-35']:
    reviews[id].update(sources=['hospitaldistance'], status='limited',
        finding='Päivystysverkon tutkimuksissa pidempi matka lisäsi joissakin tapauksissa sydäninfarktipotilaiden riskiä. Kaikkien potilaiden kuolleisuuden kasvusta näyttö ei ollut yhtenäistä.',
        scope='Systemaattinen katsaus kiireellisen hoidon matkoista. Se ei ratkaise suunnitellun hoidon keskittämistä tai Suomen yksittäisen sairaalan säästöä.')
reviews['cut-4-25']['fiscal'] = 'VM:n 25–45 miljoonan arvio sisältää jo vastaanottavien sairaaloiden, kuljetusten ja ensihoidon lisämenot. Potilaiden terveys- ja ajankäyttövaikutuksia ei ole kattavasti hinnoiteltu; samoja kuljetuskuluja ei vähennetä uudelleen.'
reviews['cut-4-25']['society'] = 'Päivystysmatka pitenisi osalla potilaista. Vastaanottavien sairaaloiden täytyy pystyä hoitamaan siirtyvät potilaat.'
reviews['cut-4-26']['society'] = 'Erityisosaaminen ja laitteet keskittyisivät. Potilaiden ja läheisten matkat voivat pidentyä.'
reviews['cut-4-35']['society'] = 'Osa lähipalveluista siirtyisi kauemmas, verkkoon tai liikkuviksi palveluiksi. Kaikille etäpalvelu ei sovi.'
reviews['cut-4-26']['fiscal'] = 'VM arvioi 55–150 milj. euron vuotuista säästöä. Se edellyttää, että lähtösairaaloiden kustannukset todella poistuvat; muutto- ja kapasiteettikulut vaikuttavat toteutumiseen.'
reviews['cut-4-35']['fiscal'] = 'VM:n 50 milj. euron pistearvio sijoittuu 30–80 miljoonan vaihteluväliin. Kuljetukset, uudet palvelutavat ja henkilöstön siirtyminen ratkaisevat, paljonko tilasäästöstä jää jäljelle.'
for id in ['cut-5-16', 'cut-5-17', 'cut-5-20']:
    reviews[id]['scope'] = 'Maiden välinen pitkittäistutkimus kehitysavun pitkän ajan vaikutuksista. Se ei arvioi Suomen avun lakkautusta, Ukrainan jälleenrakennusta tai yksittäistä katastrofiapua.'
reviews['corporate']['society'] = 'Veron maksavat voitolliset yritykset. Rasitus voi myöhemmin siirtyä osin omistajilta palkkoihin tai hintoihin; Suomen tämän korotuksen jakautumisesta ei ole tarkkaa arviota.'
reviews['tax-household']['society'] = 'Kotitalous maksaisi työn hinnasta suuremman osuuden itse. Vähennys hyödyttää eniten niitä, joilla on varaa ostaa palvelua ja riittävästi maksettavaa veroa.'
reviews['cut-2-15']['society'] = 'Päiväkodin henkilöstön koulutusjakaumaa koskevaa tulevaa vaatimusta lievennettäisiin. Se helpottaisi rekrytointia mutta muuttaisi lasten saaman kasvatuksen osaamispohjaa.'
for id in ['cut-2-51','cut-2-52']:
    reviews[id]['society'] = 'Määräajassa valmistuvan opiskelijan laina jäisi aiempaa suuremmaksi. Vaikutus valmistumisnopeuteen on epävarma.'
reviews['tax-electric1'].update(sources=['energydemand'],
    finding='Tutkimuskatsauksessa energiankäyttö reagoi hintaan enemmän pitkällä aikavälillä, kun laitteita ja lämmitystä ehditään vaihtaa.',
    fiscal='VM:n arvio sisältää muiden verojen mekaanisen vähennyksen. Sähkönkäytön sopeutuminen ja lämmitystavan vaihto voivat lisäksi pienentää kertymää; kansainvälistä keskiarvoa ei käytetä Suomen nettoennusteena.',
    scope='Kansainvälinen energiakysynnän meta-analyysi; Suomen sähkölämmitys, sopimukset ja veron osuus kokonaishinnasta vaikuttavat vasteeseen.')
reviews['tax-biomass'].update(status='direct-model',
    society='Puuta polttavien lämpölaitosten kustannukset kasvaisivat. Asiakkaan lämmityslasku voi nousta, jos tuottaja siirtää veron hintoihin.',
    fiscal='AFRYn vuoden 2030 mallissa energiaverokertymä kasvaisi 112 milj. € kiinteiden puupolttoaineiden verolla ja 196 milj. € kaikkien biomassojen verolla. Kysynnän muutos ja korvaavan sähkön verot ovat mukana. Luvut koskevat eri veropohjia, eivät yhden vaihtoehdon epävarmuusväliä; muiden verojen ja työllisyyden muutoksia ei ole laskettu.',
    scope='AFRY 2024, s. 105–108: yli 5 MW:n laitokset, energiavero 10,33 €/MWh ja CHP-tuotannon alennus 2,70 €/MWh. VM:n kortti ei vielä määritä veropohjaa, joten vertailulukuja ei lasketa piirakkaan.')

# Keep budget arithmetic in the fiscal section, not repeated in everyday effects.
social_overrides = {
 'cut-1-75':'Metsän muuttaminen esimerkiksi pelloksi tai rakennusmaaksi kallistuisi. Tämä voi vähentää metsäkatoa ja sen päästöjä.',
 'cut-1-76':'Valtion maille rakennettaisiin lisää tuulivoimaa. Paikalliset vaikutukset riippuvat voimaloiden sijoituksesta ja hankkeiden toteutumisesta.',
 'cut-2-9':'Omaisten ja kuolinpesän maksettavat hautauskulut kasvaisivat. Varattomissa kuolinpesissä avun tarve lisääntyisi.',
 'cut-2-74':'Aikuisen pitäisi maksaa kirjaston käytöstä. Maksu voi vähentää käyttöä etenkin silloin, kun rahaa on vähän tai asiointi on satunnaista.',
 'cut-3-30':'Ansiotulo-osinkoa nostavan yrittäjän vakuutusmaksut ja myöhempi eläketurva kasvaisivat.',
 'cut-3-69':'Osa lomituksesta jäisi yrittäjän itsensä maksettavaksi tai järjestettäväksi. Eläinten päivittäistä hoitoa ei voi keskeyttää.',
 'cut-4-42':'Erikoistumiskoulutuksen rahoitus kilpailisi hyvinvointialueen muiden palvelujen kanssa.',
 'cut-4-48':'Yksi hyvinvointialue vastaisi lääkärihelikopteritoiminnan rahoituksesta. Palvelun on tarkoitus jatkua.',
 'cut-5-22':'Oikeuden hakeminen kallistuisi. Maksu voi estää asian viemisen tuomioistuimeen etenkin pienissä riidoissa ja pienillä tuloilla.',
 'cut-5-29':'Etäistuntoja ja yhteisiä käsittelyjonoja lisättäisiin. Jos tehostuminen ei korvaa resurssien vähennystä, käsittely voi hidastua.',
 'cut-5-55':'Terveysvarautumisen rahoituksen hallinnollinen vastuu muuttuisi. Vaikutus palveluihin riippuu siitä, muuttuuko myös niiden toteutus.',
 'cut-7-19':'Vaikutuksia korvauksen saajiin ei voi vielä kuvata: VM ei yksilöi poistettavia vastuita.',
 'cut-7-44':'Julkisen sektorin työntekijä tekisi samalla palkalla 24 tuntia enemmän työtä vuodessa. Vapaa-aika vähenisi.',
 'cut-7-46':'Helatorstai ja loppiainen muuttuisivat julkisen sektorin työpäiviksi ilman vastaavaa palkankorotusta.',
 'cut-7-48':'Julkisen sektorin pisimmistä vuosilomista poistuisi kahdeksan päivää. Työssä jaksaminen ja perheiden aikataulut voivat muuttua.',
 'cut-7-49':'Julkisen sektorin pisimmistä vuosilomista poistuisi kaksi päivää. Työssä jaksaminen ja perheiden aikataulut voivat muuttua.',
}
for id, society in social_overrides.items():
    reviews[id]['society'] = society

# The amount and known deductions are already displayed above these sentences.
# Explain the remaining uncertainty only once.
for id in ['tax-vat15','tax-vat16','tax-food18','tax-vat-services','vat','tax-vat-standard','tax-vat-reduced']:
    reviews[id]['fiscal'] = 'Haarukka on laskettu VM:n yleisarviosta, ei tämän vaihtoehdon erillisestä kokonaistaloudellisesta simuloinnista.'
for id in ['income','income-index']:
    reviews[id]['fiscal'] = 'Eri tuloryhmät voivat reagoida eri tavoin. Kansainvälisten tutkimusten joustolukuja ei vähennetä VM:n arviosta uudelleen.'
reviews['tax-electric1']['fiscal'] = 'Sähkönkäytön sopeutuminen ja lämmitystavan vaihto voivat lisäksi pienentää kertymää. Kansainvälistä keskimääräistä reaktiota ei käytetä Suomen nettoennusteena.'
reviews['tax-tobacco']['fiscal'] = 'Pitkän ajan terveysmenoja, työkykyä ja kuolleisuuden muita julkistaloudellisia seurauksia ei ole laskettu tähän.'
reviews['tax-transfer-shares']['fiscal'] = 'Yrityskauppojen määrä, rakenne ja ajoitus voivat muuttua. Näiden käyttäytymisvaikutusten nettoarviota ei ole käytössä.'
for id in ['tax-transfer-land','tax-transfer-homes']:
    reviews[id]['fiscal'] = 'Kauppojen väheneminen voi pienentää tuottoa lisää. Vanhan uudistuksen muuttovaikutusta ei voi suoraan kertoa nykyisellä koko asuntokaupan veropohjalla.'
reviews['tax-excise-index']['fiscal'] = 'Kulutuksen muutoksia ei ole laskettu mukaan. Eri polttoaineiden ja tuotteiden kysyntä reagoi hintaan eri tavoin.'
reviews['tax-vehicle']['fiscal'] = 'Autojen määrän ja käyttövoiman muutoksia ei ole laskettu mukaan. Vuosivero vaikuttaa auton omistamiseen eri tavalla kuin polttoaineen hinta ajokilometreihin.'
reviews['tax-fuel']['fiscal'] = 'Pitkällä aikavälillä auton vaihtaminen, asuinpaikka ja liikkumistavat voivat pienentää veropohjaa lisää. Lyhyen ajan kysyntäreaktiota ei vähennetä uudelleen.'
reviews['cut-3-18']['finding'] = 'Hammashoidon aiemmassa korvausleikkauksessa osa asiakkaista siirtyi julkiselle ja sen odotusajat pitenivät.'

from research_followup import apply_followup
followup_ids = apply_followup(reviews, ROOT)

# Entries intentionally outside this research round. Two unpriced rows concern
# funding envelopes smaller than the cutoff, not 20-million saving opportunities.
skipped = {
    'cut-1-24':'Rahoitusvarojen siirto; pysyvä sopeutus 0 euroa.',
    'cut-5-8':'Omaisuuden myynti; ei vuotuinen pysyvä sopeutus.',
    'cut-5-9':'Omaisuuden myynti; ei vuotuinen pysyvä sopeutus.',
    'cut-5-19':'Lainojen ja sijoitusten rahoitustaloustoimi.',
    'cut-4-44':'Koko siirrettävä rahoitus 11,6 milj. €/v; hallinnon säästö vielä tätä pienempi.',
    'cut-4-45':'Koko siirrettävä rahoitus 5,1 milj. €/v; hallinnon säästö vielä tätä pienempi.',
}
for id, reason in skipped.items():
    if id in actions:
        assert id not in reviews
        reviews[id] = dict(status='skipped', reason=reason, sources=[])

for filename in ['finnwatch-actions.json', 'additional-tax-actions.json']:
    for proposal in json.loads((ROOT/'data'/filename).read_text(encoding='utf-8')):
        if proposal['id'] in actions:
            reviews[proposal['id']]=proposal['research']
from audit_corrections import apply_research, apply_sources
sources=json.loads((ROOT/'data/research-sources.json').read_text(encoding='utf-8'))
summaries=json.loads((ROOT/'data/source-summaries.json').read_text(encoding='utf-8'))
apply_sources(sources,summaries)
for filename,values in [('research-sources.json',sources),('source-summaries.json',summaries)]:
    (ROOT/'data'/filename).write_text(json.dumps(values,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
reviews={id:apply_research(id,review) for id,review in reviews.items() if id in actions}
assert set(reviews)==set(actions), ('missing',sorted(set(actions)-set(reviews)))
(ROOT/'data/action-research.json').write_text(json.dumps(reviews,ensure_ascii=False,indent=2),encoding='utf-8')
print('Reviewed:',len(reviews),'Skipped:',sum(r['status']=='skipped' for r in reviews.values()))
