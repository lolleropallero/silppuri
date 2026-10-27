"""Second, explicit review of the 40 evidence gaps, checked 27 October 2026.

Sources marked context are institutional evidence, not causal impact studies.
Comparative euro calculations are deliberately distinguished from fiscal forecasts.
"""
import json

SOURCES = {
    'exportpromotion': ('Munch & Schaur (2018): The Effect of Export Promotion on Firm-Level Performance', 'https://doi.org/10.1257/pol.20150410', 'Tanska · yritysaineisto ja vientipalvelujen vaikutusten arviointi'),
    'maritimejobs': ('OECD/ITF (2023): Water Transport Employment in Europe: The Role of Governance', 'https://www.oecd.org/content/dam/oecd/en/publications/reports/2023/08/water-transport-employment_0928b92b/e9f90e70-en.pdf', 'Eurooppa · merenkulun työmarkkinoiden tutkimuskatsaus'),
    'landchange': ('MMM (2024:1): Maankäytön muutosmaksun käyttöönoton vaikutusten arviointi, s. 57–60', 'https://urn.fi/URN:ISBN:978-952-366-756-3', 'Suomi · ehdotetun maksun vaikutusarvio, ei toteutuneen uudistuksen tutkimus'),
    'windrealisation': ('Evaluating the German onshore wind auction programme (2023)', 'https://doi.org/10.1016/j.enpol.2022.113317', 'Saksa · hankekohtainen huutokauppojen toteutumisen arviointi'),
    'protectedareas': ('Mixed effects of a national protected area network on terrestrial and freshwater biodiversity (2023)', 'https://pubmed.ncbi.nlm.nih.gov/37704608/', 'Suomi · 638 lajin kehitys suojelluilla ja vertailualueilla'),
    'funerals': ('CMA (2020): Funerals market investigation — final report', 'https://www.gov.uk/government/news/cma-publishes-final-report-in-funerals-market-investigation', 'Britannia · hautauspalvelujen markkinatutkimus'),
    'worldviews': ('Åhs, Poulter & Kallioniemi (2016): Encountering Worldviews', 'https://doi.org/10.1080/15507394.2015.1128311', 'Suomi · oppilaskysely ja haastattelut, ei koeasetelmaa'),
    'libraryfees': ('AEF / OCW (2026): Toegang zonder drempels — kirjastojäsenyyden maksuttomuuden arviointi', 'https://zoek.officielebekendmakingen.nl/kst-33846-75.html', 'Alankomaat · tapaustutkimusten virallinen yhteenveto ja rajoitukset'),
    'aslak': ('Saltychev ym. (2012): Effectiveness of multidisciplinary primary prevention in decreasing the risk of work disability', 'https://pubmed.ncbi.nlm.nih.gov/21573316/', 'Suomi · ASLAK-kuntoutujien ja kaltaistettujen verrokkien rekisteriseuranta'),
    'yelreview': ('Rantala (2025): Yrittäjien eläkejärjestelmän kehittämisselvitys — ETK:n yhteenveto', 'https://www.etk.fi/ajankohtaista/jukka-rantalan-selvitys-selkeytta-yrittajan-tyotulon-maaraytymiseen/', 'Suomi · järjestelmäselvitys; ei uudistuksen jälkikäteinen vaikutustutkimus'),
    'myelfinance': ('Eläketurvakeskus: YEL- ja MYEL-maksut ja rahoitus', 'https://www.etk.fi/en/finnish-pension-system/financing-and-investments/pension-contributions/self-employed/', 'Suomi · eläkejärjestelmän rahoitussäännöt, tarkistettu 27.10.2026'),
    'occupationaltrial': ('Taimela ym. (2008): An occupational health intervention programme for workers at high risk for sickness absence', 'https://pubmed.ncbi.nlm.nih.gov/17933885/', 'Suomi · satunnaistettu koe ja kustannusvaikuttavuus, 418 työntekijää'),
    'farmrelief': ('Institutional Responses to Farmer Mental Health Challenges in Europe (2026)', 'https://pubmed.ncbi.nlm.nih.gov/42908437/', 'Suomi, Ranska, Irlanti ja EU · neljän tukijärjestelmän laadullinen vertailu'),
    'caseload': ('Rhoades ym. (2024): Caseload factors predictive of family abuse and neglect treatment outcomes', 'https://pubmed.ncbi.nlm.nih.gov/38981310/', 'Yhdysvallat · perhetyön seuranta, 25 työntekijää 11 sotilastukikohdassa'),
    'grantfundraising': ('Andreoni & Payne (2011): Is crowding out due entirely to fundraising?', 'https://doi.org/10.1016/j.jpubeco.2010.11.011', 'Yhdysvallat · yli 8 000 hyväntekeväisyysjärjestön paneeliaineisto'),
    'residency': ('McNamara & Pineda-Torres (2025): Medical residency subsidies and physician shortages', 'https://doi.org/10.1016/j.jpubeco.2025.105494', 'Yhdysvallat · tukikelpoisuuteen perustuva instrumenttimuuttujatutkimus'),
    'hems': ('Nurmi ym. (2022): Lääkärihelikopteritoiminnan vaikuttavuus ja kustannustehokkuuden kehittäminen', 'https://urn.fi/URN:ISBN:978-952-383-137-7', 'Suomi · VN TEAS 2022:62, palveluverkon ja kustannusvaikuttavuuden tutkimus'),
    'tribunalfees': ('House of Commons Library: Employment tribunal fees', 'https://commonslibrary.parliament.uk/research-briefings/sn07081/', 'Britannia · virallinen kooste maksu-uudistuksesta ja hakemusmääristä'),
    'courtefficiency': ('Peyrache & Zago (2024): The inefficiency of courts of justice: industry structure, capacity and misallocation', 'https://doi.org/10.1007/s11123-024-00731-5', 'Italia · tuomioistuinaineistoon sovitettu optimointimalli'),
    'debtburden': ('Ong, Theseira & Ng (2019): Reducing debt improves psychological functioning and changes decision-making in the poor', 'https://pubmed.ncbi.nlm.nih.gov/30910964/', 'Singapore · velkahelpotusohjelma, 196 pienituloista; ei ulosottomaksukoe'),
    'natofinance': ('VTV (2026): Nato-jäsenyyden taloudellisten vaikutusten arviointi', 'https://vtv.fi/2026/06/09/nato-jasenyyden-taloudellisia-vaikutuksia-ei-ole-esitetty-riittavan-lapinakyvasti/', 'Suomi · tuloksellisuustarkastus; ei tämän määrärahasiirron tuottoarvio'),
    'videomeetings': ('Brucks & Levav (2022): Virtual communication curbs creative idea generation', 'https://www.nature.com/articles/s41586-022-04643-y', 'Laboratorio- ja kenttäkokeet · kasvokkaisen ja videoyhteistyön vertailu'),
    'regulatorfees': ('ANAO (2008): The Management of Cost Recovery by Selected Regulators', 'https://www.anao.gov.au/work/performance-audit/the-management-cost-recovery-selected-regulators', 'Australia · kolmen viranomaisen maksullisuuden tuloksellisuustarkastus'),
    'partyfunding': ('Baumert (2024/2025): Effects of Public Party Funding and Parliamentary Representation in German State Elections', 'https://doi.org/10.1007/s11615-024-00553-y', 'Saksa · yhden prosentin tukirajaan perustuva tutkimus'),
    'sitraevaluation': ('Halme, Oosi & Salminen (2024): Kohti muutosvoimaa ja ketteryyttä', 'https://www.sitra.fi/julkaisut/arviointi-kohti-muutosvoimaa-ja-ketteryytta/', 'Suomi · ulkopuolinen, Sitran tilaama strategisen asemoinnin arviointi'),
    'workingtimefi': ('Kauhanen & Lehmus (2019): Työaika, työllisyys ja kilpailukyky', 'https://www.etla.fi/julkaisut/tyoaika-tyollisyys-ja-kilpailukyky/', 'Suomi · kirjallisuuskatsaus ja ETLAn makromalli'),
    'workingtimerct': ('Schiller ym. (2017): The impact of reduced worktime on sleep and perceived stress', 'https://pubmed.ncbi.nlm.nih.gov/27942734/', 'Ruotsi · julkisen sektorin 33 työpaikan satunnaistettu koe'),
    'bankprovisions': ('Andries, Gallemore & Jacob (2017): The effect of corporate taxation on bank transparency', 'https://doi.org/10.1016/j.jacceco.2017.03.004', 'Kansainvälinen pankkiaineisto · verokohtelun ja luottotappiovarausten muutokset'),
    'forestdeduction': ('Hänninen & Leppänen, toim. (2016): Metsäverotuksen kehittämistarpeet metsä- ja elinkeinopolitiikan kannalta', 'https://jukuri.luke.fi/bitstream/handle/10024/535237/luke-luobio_27_2016.pdf?sequence=9', 'Suomi · Luken tutkimuskooste 27/2016, erityisesti s. 65'),
    'unlistedtransfer': ('HMRC (2020): Transfer of unlisted securities to connected companies', 'https://www.gov.uk/government/publications/transfer-of-unlisted-securities-to-connected-companies-for-stamp-duty-and-stamp-duty-reserve-tax/transfer-of-unlisted-securities-to-connected-companies-for-stamp-duty-and-stamp-duty-reserve-tax', 'Britannia · veropohjan kiertämistä koskeva vaikutusarvio, ei verokannan korotuksen koe'),
    'insurancedemand': ('Hodula ym. (2021): On the macrofinancial determinants of life and non-life insurance premiums', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8613733/', '24 Euroopan maata · paneeliregressiot 1997–2017; ei verouudistuksen koe'),
}


def apply_followup(reviews, root):
    updated = set()

    def put(ids, sources, finding, fiscal, scope, society=None, status='limited'):
        for id in ids.split():
            assert id in reviews and id not in updated, id
            updated.add(id)
            reviews[id].update(sources=sources.split(), finding=finding, fiscal=fiscal,
                               scope=scope, status=status)
            if society is not None:
                reviews[id]['society'] = society

    put('cut-1-11', 'exportpromotion',
        'Tanskalaisessa yritystutkimuksessa vientineuvonta kasvatti etenkin pienten yritysten myyntiä ja arvonlisää.',
        'Osa menoleikkauksesta voi palautua pienempinä yritys- ja palkkaveroina. Tutkimuksen arvonlisähyöty ei ole sama asia kuin valtion verotuotto, eikä koko 35 miljoonan tukijoukon nettoa voida laskea siitä.',
        'Tutkittu palvelu on vientineuvonta. BF:n matkailun edistäminen ja muut poistettavat tuet vaativat omat arviot.',
        'Vientiä ja matkailua edistävien palvelujen rahoitus vähenisi. Yritys voisi ostaa apua itse tai jättää hankkeen toteuttamatta.')
    put('cut-1-41', 'maritimejobs',
        'OECD:n katsauksessa kansallinen lippu ja kotimaiset työpaikat eivät kulkeneet automaattisesti yhdessä. Merenkulun tukien työllisyyshyödyistä oli vähän näyttöä.',
        'Suomeen maksettavat palkkaverot voivat vähentyä, jos työpaikat tai henkilöstön verotus siirtyvät ulkomaille. Katsaus ei anna Suomen laivojen palveluhenkilöstön tuelle luotettavaa takaisinmenetyksen prosenttia.',
        'Eurooppalaisten merenkulkutukien katsaus; ei tämän 45 miljoonan rajauksen kausaalista vaikutusarviota.',
        'Matkustajalaivojen hotelli- ja ravintolatyön tuki poistuisi. Varustamo voisi muuttaa miehitystä, hintoja tai aluksen rekisteröintimaata.')
    put('cut-1-75', 'landchange',
        'Työryhmän arviossa maksu vähentäisi pellonraivausta herkemmin kuin rakentamista: rakentamishankkeessa maksu on pienempi osa kokonaiskustannusta.',
        'MMM:n rajatulla maksulla kertymä olisi noin 30 milj. €/v, kun VM:n 60 miljoonaa perustuu karkeaan kokonaispinta-alaan. Piirakka käyttää 30 miljoonaa. Netto jää tätä pienemmäksi: uusi seurantajärjestelmä maksaisi vähintään 0,6 miljoonaa kertaluonteisesti, lisäksi tarvitaan henkilöstöä ja toinen tietotyökalu. Myös valtion omien hankkeiden maksut ovat julkisen talouden sisäisiä siirtoja. Näitä eriä ei ole hinnoiteltu kokonaan.',
        'MMM 2024:1, s. 57–60. Maksu 5 000 €/ha; alle 0,5 ha:n kohteet ja asemakaava-alueet ulkopuolella. Kertymä on alustava, eikä 30–60 miljoonaa ole saman mallin nettohaarukka.',
        status='direct-model')
    put('cut-1-76', 'windrealisation',
        'Saksan tuulivoimahuutokaupoissa vain 46 % hyväksytyistä hankkeista oli toteutunut tutkimuksen seurannassa.',
        'Sopimus tai suunnitelma ei takaa vuokratuloa. Suomen hankkeiden toteutumisaikataulu ja vuokrasopimukset tarvitaan neton arviointiin; Saksan toteutumisprosentilla ei kerrota Metsähallituksen tuloja.',
        'Tutkimus koskee Saksan maatuulivoiman tukihuutokauppoja. Suomen valtion maiden vuokraus ja merituulivoima toimivat eri ehdoilla.')
    put('cut-1-79', 'protectedareas',
        'Suomen 638 lajin vertailussa suojelu hidasti osan lajien taantumista. Hyöty oli suurempi laajoilla alueilla; pelkkä nykyinen suojeluverkko ei riittänyt pysäyttämään luontokatoa.',
        'Menosäästö ei mittaa menetettyä luontoarvoa. Tutkimus ei hinnoittele myöhempiä ennallistamismenoja tai juuri tämän 30 prosentin leikkauksen seurauksia valtion tuloille.',
        'Neljän vuosikymmenen vertailu suojelluista ja suojelemattomista paikoista Suomessa. Ei rahoituksen leikkauskoe.',
        'Uusia suojelukohteita ja luonnonhoitoa voitaisiin toteuttaa vähemmän. Vaikutus riippuu siitä, mitkä alueet ja työt jäävät pois.')
    put('cut-2-9', 'funerals',
        'Britannian markkinatutkimuksessa surevien oli vaikea vertailla hautauspalveluja, mikä heikensi hintakilpailua.',
        'VM:n 52 miljoonassa on jo vähennetty perintöverojen menetys ja toimeentulotuen kasvu. Palvelujen hintojen tai hautausvalintojen muutoksesta ei ole tähän lisättävää Suomen euroarviota.',
        'CMA tutki kaupallisia hautauspalveluja. Suomessa kortti koskee seurakuntien hautaustoimen rahoitusta; hinnoittelujärjestelmä on erilainen.')
    put('cut-2-19', 'worldviews',
        'Suomalaisen kokeilun oppilaat kokivat yhteisen katsomusopetuksen turvalliseksi paikaksi oppia muista ja kohdata heitä.',
        'Ryhmien yhdistäminen voi vähentää opetuksen järjestämiskuluja. Opettajien koulutus ja oppimateriaalit maksavat alussa; tutkimus ei arvioi niiden hintaa tai valtakunnallista nettoa.',
        '174 oppilaan kysely ja 40 haastattelua. Tulokset kuvaavat kokemuksia, eivät osoita oppimistulosten tai kustannusten syy-seurausvaikutusta.')
    put('cut-2-74', 'libraryfees',
        'Alankomaiden tapaustutkimuksissa maksuttomuus lisäsi kirjaston jäseniä. Lainaamisen tai käyntien muutoksista ei saatu varmaa tulosta.',
        '30 miljoonaa edellyttää miljoonaa maksavaa aikuista. Jokainen 100 000 maksajaa vähemmän pienentää tuloa 3 miljoonaa ennen perintäkuluja. Tutkimus ei kerro, kuinka moni suomalainen maksaisi; tästä ei voi johtaa perusteltua nettohaarukkaa.',
        'AEF:n arviointi 2026: pieni ja lyhyt tapausaineisto. Maksun poistaminen Alankomaissa ei ole sama koe kuin 30 euron maksun käyttöönotto Suomessa.')
    put('cut-3-16', 'aslak',
        'Vanhan ASLAK-kuntoutuksen rekisteritutkimuksessa osallistuminen ei vähentänyt työkyvyttömyyden riskiä kaltaistettuihin verrokkeihin nähden.',
        'Säästö riippuu siitä, mitä kuntoutusta poistetaan. Vaikuttavan hoidon väheneminen voi kasvattaa sairaus- ja eläkemenoja; heikosti vaikuttavan toiminnan vähennys voi säästää ilman samaa vastavaikutusta. Koko harkinnanvaraiselle kuntoutukselle ei ole yhteistä euromääräistä nettoa.',
        'Saltychev ym. tutkivat yhtä aiempaa työkykykuntoutuksen ohjelmaa. Tulos ei tarkoita, että nykyiset kuntoutuskurssit tai lasten ja neurologisten potilaiden kuntoutus olisivat hyödyttömiä.',
        'Harkinnanvaraisen kuntoutuksen paikkoja olisi vähemmän. Seuraukset vaihtelevat kuntoutusmuodon, sairauden ja asiakkaan tilanteen mukaan.')
    put('cut-3-27', 'maritimejobs',
        'Merenkulun tukien kansainvälinen tutkimus osoittaa, ettei valtiontuen ja kotimaisen työllisyyden yhteys ole yksiselitteinen.',
        '67 miljoonan budjettisäästö edellyttää myös miehistötuen muuttamista tai rahoituksen siirtoa muualle eläkejärjestelmään. Jos valtio korvaa varustamon suuremman eläkemaksun miehistötukena, vastaava säästö katoaa. Rahoitusmallia ei voi korvata mielivaltaisella 0–67 miljoonan tutkimushaarukalla.',
        'OECD/ITF:n katsaus koskee tukien työllisyysperustelua. Eläkemaksun ja miehistötuen vastakkainen budjettivaikutus perustuu VM:n tämän toimen kuvaukseen.',
        'Nykyisten eläkkeiden rahoitus siirtyisi valtiolta varustamoille tai muille työeläkemaksujen maksajille. Eläkkeitä ei tässä ehdotuksessa leikata.')
    put('cut-3-28', 'myelfinance',
        'MYEL-eläke määräytyy vakuutetusta työtulosta. Maksuprosentin alennuksen poisto ei itsessään korota tätä työtuloa.',
        'Suuremmat vakuutusmaksut pienentävät valtion rahoitusosuutta, mutta voivat vähentää muuta verotettavaa tuloa ja kulutusta. Tästä maksuprosentin muutoksesta ei löytynyt tutkimukseen perustuvaa käyttäytymisnettoa.',
        'ETK:n rahoituskuvaus varmistaa maksun ja eläkeperusteen eron. Se on järjestelmätietoa, ei huojennuksen poiston vaikutustutkimus.',
        'Maatalousyrittäjän ja apurahansaajan maksu kasvaisi samalla vakuutetulla työtulolla. Käteen jäisi vähemmän ilman vastaavaa eläketurvan parannusta.', status='context')
    put('cut-3-30', 'yelreview',
        'YEL-selvitys ehdottaa verotettuihin ansioihin perustuvaa työtuloa alivakuuttamisen vähentämiseksi.',
        'VM:n mukaan lisämaksut vahvistavat taloutta aluksi, mutta kasvavat eläkkeet kääntävät vaikutuksen myöhemmin vastakkaiseksi. Vuosien 2028–2035 lukua ei saa tulkita pysyväksi säästöksi; pitkän ajan tämän osinkorajauksen eurohaarukkaa ei ole annettu.',
        'Rantalan 2025 selvitys käsittelee järjestelmää laajemmin. Se ei mittaa erikseen ansiotulo-osinkojen lisäämistä VM:n vuoden 2026 ehdotukseen.', status='context')
    put('cut-3-65 cut-3-66 cut-3-67', 'occupationaltrial',
        'Suomalaisessa kokeessa paljon sairastaville kohdennettu työterveyskäynti vähensi sairauspoissaoloja noin 11 päivää vuodessa.',
        'Kela-korvauksen pienentyminen voi siirtää kustannuksia työnantajalle tai julkiseen hoitoon. Työkykyhyöty riippuu siitä, väheneekö vaikuttava hoito vai maksaako työnantaja sen itse. Kokeesta ei saada korvausprosentin leikkaukselle eurokerrointa.',
        'Taimela ym.: korkean poissaoloriskin työntekijät yhdessä yrityksessä, vuoden seuranta. Kohdennetun lisäkäynnin koe ei arvioi koko työterveyden rahoituksen leikkausta.',
        society='Työnantaja maksaisi työterveydestä suuremman osuuden. Se voisi säilyttää palvelut tai supistaa niitä lain sallimissa rajoissa.')
    put('cut-3-68 cut-3-69', 'farmrelief',
        'Eurooppalainen vertailu tunnisti Suomen lomituspalvelut keinoksi järjestää maatalousyrittäjille lepoa osana lakisääteistä turvaa.',
        'Menosäästöstä voi kulua osa sairastamiseen, sijaisapuun tai tilojen lopettamiseen. Vuoden 2026 tutkimus ei mitannut terveysvaikutuksia, joten se ei anna näille vastavaikutuksille luotettavaa eurohaarukkaa.',
        'Laadullinen järjestelmävertailu, julkaistu 22.10.2026. Se ei osoita, kuinka paljon tietty lomituspäivä ehkäisee sairastamista.',
        society='Eläinten hoito jatkuisi joka päivä, mutta yrittäjälle jäisi enemmän vastuuta sijaisen hankkimisesta ja maksamisesta. Loman pitäminen voisi vaikeutua.')
    put('cut-4-5', 'caseload',
        'Perhetyön seurantatutkimuksessa tapausten vaikeus ja korkean riskin asiakkaiden määrä olivat yhteydessä hoidon etenemiseen.',
        'Mahdolliset sijoitusten, kriisipalvelujen ja henkilöstön vaihtuvuuden lisäkulut voivat syödä säästöä. Tutkimus ei hinnoittele Suomen asiakasrajan poistamista eikä osoita sille turvallista korvaavaa lukumäärää.',
        'Pieni havaintotutkimus Yhdysvaltojen ilmavoimien perhepalveluista. Näyttö kertoo kuormituksen koostumuksesta, ei Suomen lakisääteisen mitoituksen vaikutuksesta.',
        society='Sosiaalityöntekijälle voisi tulla enemmän lapsia hoidettavaksi. Silloin aikaa yksittäisen lapsen tapaamiseen ja perheen tilanteen selvittämiseen voi jäädä vähemmän.')
    put('cut-4-40 cut-7-24', 'grantfundraising',
        'Yhdysvaltalaisten järjestöjen aineistossa julkinen avustus vähensi omaa varainhankintaa. Yksityinen rahoitus voi siis korvata osan avustuksen muutoksesta.',
        'Lahjoitukset eivät ole automaattinen korvaaja poistuvalle tuelle. Nettosäästö riippuu siitä, mitä palvelua loppuu ja tuleeko sen tilalle julkista menoa. Järjestöjen tutkimus ei anna kaikkien valtionavustusten tai niiden hallinnon yhteistä nettokerrointa.',
        'Andreoni ja Payne tutkivat yhdysvaltalaisia hyväntekeväisyysjärjestöjä. Tulos ei kata Suomen kuntien, tutkimuksen ja yritysten kaikkia avustuksia.',
        society='Rahoituksen saaja voisi vähentää toimintaa, periä maksuja tai kerätä lisää lahjoituksia. Asiakkaan saama apu riippuu siitä, onnistuuko korvaavan rahoituksen hankinta.')
    put('cut-4-42', 'residency',
        'Yhdysvaltojen tukiuudistus lisäsi perusterveydenhuollon lääkärien määrää tuetuilla lääkäripula-alueilla noin 4 %.',
        'Jos alue korvaa poistetun koulutusrahan omasta budjetistaan, koko julkinen talous ei säästä vastaavaa summaa. Jos koulutus vähenee, lääkäripula voi lisätä muiden palvelujen kustannuksia. Suomen tämän rahoitussiirron nettoa ei ole laskettu tutkimuksessa.',
        'Julkaistu tutkimus 2025: erikoistuvien lääkärien koulutustuen lisäys ja kohdentaminen Yhdysvalloissa. Suomen erilliskorvauksen poisto on eri muutos.')
    put('cut-4-48', 'hems',
        'Suomalainen tutkimus suositti lääkärihelikoptereille valtakunnallista koordinaatiota ja käyttöä yli hallinnollisten rajojen.',
        '44,2 miljoonan rahoituksen siirtäminen valtiolta hyvinvointialueelle tuottaa itsessään 0 euroa julkista nettosäästöä. Hallinnon tai toiminnan tehostumiselle tarvitaan erillinen kustannusvertailu; tutkimuksen hoidon kustannusvaikuttavuus ei ole tällainen säästölaskelma.',
        'VN TEAS 2022:62 tukee yhteisen ohjauksen tarvetta. Se ei arvioi tämän järjestämisvastuun siirtomallin hallintosäästöä.', status='limited')
    put('cut-5-22', 'tribunalfees',
        'Britannian työriita-asioissa hakemukset vähenivät jyrkästi maksujen käyttöönoton jälkeen. Virallinen arvio liitti vähenemistä myös maksuesteisiin.',
        'Korkeampi hinta ei tuota samaa lisätuloa, jos maksavia asioita tulee vähemmän. Maksuvapautukset, oikeusapu ja asianmäärän muutos on laskettava yhdessä. Britannian kehityksestä ei voi suoraan laskea Suomen 69,3 miljoonan arvion alennusprosenttia.',
        'Britannian uudistus koski aiemmin maksuttomia työriita-asioita ja suuria maksuja. Muut samanaikaiset uudistukset rajoittavat ennen–jälkeen-vertailua.', status='limited')
    put('cut-5-29', 'courtefficiency',
        'Italian tuomioistuinaineistoon sovitetussa mallissa työn parempi jakaminen ja parhaiden käytäntöjen käyttöönotto lyhensivät laskennallisia käsittelyaikoja.',
        'Mallin tehostamishyöty ei osoita, että Suomen henkilöstömenoista voisi poistaa 10 % ilman haittaa. Viiveiden kustannuksia asianosaisille ja verotuloille ei ole muutettu tämän ehdotuksen nettoluvuksi.',
        'Peyrache ja Zago käyttävät Italian vuosien 2005–2012 aineistoa. Tulokset ovat optimointimallin skenaarioita, eivät toteutuneen suomalaisen leikkauksen vaikutuksia.')
    put('cut-5-33', 'debtburden',
        'Singaporen velkahelpotusohjelmassa velkatilien poistuminen paransi pienituloisten toimintakykyä ja vähensi ahdistusta.',
        'Myyntimaksu pienentää omaisuuden myynnistä velkoihin jäävää osuutta. Valtion lisätulo ei siksi ole velallisen tai velkojan yhteinen hyöty. Tutkimus ei anna maksunkorotuksen perintätappioille tai terveysmenoille Suomen euroarviota.',
        'Tutkimus koskee velkataakan helpotusta, erityisesti velkojen lukumäärää. Sitä ei tulkita näytöksi Suomen ulosottomaksun korotuksen täsmällisestä vaikutuksesta.',
        society='Ulosotossa myytävän omaisuuden hinnasta menisi suurempi osa maksuihin. Velkojen lyhennykseen ja mahdolliseen velallisen ylijäämään jäisi vähemmän.')
    put('cut-5-55', 'natofinance',
        'VTV:n tarkastus havaitsi puutteita Nato-menojen kokonaiskuvan ja kustannuskehityksen läpinäkyvyydessä.',
        'Määrärahan siirtäminen ministeriöstä toiseen säästää itsessään 0 euroa. VM:n 36 miljoonaa vuonna 2031 syntyy vain, jos siirto hyväksytään Nato-tavoitteeseen ja muuta suunniteltua puolustusrahoituksen lisäystä pienennetään vastaavasti.',
        'Tarkastus tukee kustannusten erittelyä, mutta ei todista tämän siirron säästöä. Tässä on kyse ehdollisesta tulevan menolisäyksen välttämisestä.', status='context')
    put('cut-5-58', 'videomeetings',
        'Kokeissa videoyhteys heikensi uusien ideoiden tuottamista, mutta ei osoittanut vastaavaa haittaa valmiiden ideoiden valinnassa.',
        'Matka- ja majoituskulut voivat vähentyä, mutta kaikkia tehtäviä ei voi korvata etäkokouksella. Tutkimus ei anna Suomen valtion matkoille rahamääräistä tuottavuusmenetystä tai nettosäästöhaarukkaa.',
        'Tutkimus vertaa yhteistyötehtäviä kasvokkain ja videolla. Se ei arvioi valtion tarkastuksia, kansainvälisiä neuvotteluja tai koko matkabudjettia.',
        society='Työmatkoja korvattaisiin etätapaamisilla tai jätettäisiin tekemättä. Aikaa säästyisi matkustamisesta, mutta osa tehtävistä vaatii läsnäoloa.')
    put('cut-5-64 cut-5-75', 'regulatorfees',
        'Australian tarkastuksessa maksullisuuden toteutus edellytti palvelujen todellisten kustannusten laskentaa ja maksutulojen säännöllistä seurantaa.',
        'Julkisen toimijan toiselle julkiselle toimijalle maksama maksu ei paranna koko julkisen talouden saldoa. Yritysten vähennyskelpoiset kulut ja asioinnin väheneminen voivat myös pienentää nettoa. Maksajien jakaumaa ei ole annettu, joten koko summalle ei voi laskea perusteltua eurohaarukkaa.',
        'Kolmen australialaisen viranomaisen tarkastus koskee kustannusten kattamista maksuilla. Se ei mittaa Suomen maksujen kysyntä- tai työllisyysvaikutuksia.',
        society='Valvonnan tai palvelun käyttäjä maksaisi suuremman osuuden kustannuksista. Yritys voisi siirtää maksua hintoihin, ja osa asioinnista voisi jäädä tekemättä.', status='context')
    put('cut-7-16', 'partyfunding',
        'Saksan tukirajan juuri ylittäneillä pienpuolueilla todennäköisyys osallistua seuraaviin vaaleihin nousi noin 60 prosentista 82 prosenttiin.',
        'Puoluetuen poisto vähentää budjettimenoa. Tutkimus kertoo poliittiseen kilpailuun liittyvästä vaikutuksesta, ei Suomen verotuloihin palautuvasta euromäärästä.',
        'Baumert tutkii yhden prosentin kannatusrajan lähellä olevia puolueita osavaltiovaaleissa. Tulos ei kuvaa kaikkien suomalaisten puolueiden tuen poistamista.',
        society='Puolueiden toiminta ja kampanjat nojaisivat enemmän jäsenmaksuihin, lahjoittajiin tai vapaaehtoistyöhön.', status='mechanism')
    put('cut-7-19', '', '',
        'VM ei nimeä poistettavia korvausvastuita, niiden saajia tai nykyisiä vuosimenoja. Siksi ei ole yksilöityä toimenpidettä, jolle tutkimuksesta voisi johtaa seuraukset tai eurohaarukan.',
        'Ehdotus vaatii ensin tiedon siitä, mikä korvausvastuu poistettaisiin ja millä ehdoilla. Euromäärä pysyy avoimena.', status='unspecified')
    put('cut-7-29', 'sitraevaluation',
        'Ulkopuolinen arviointi tunnisti Sitran vahvuudeksi toimijoiden kokoamisen. Rahoittajan rooli oli epäselvempi ja rahoitus hajautui pieniin hankkeisiin.',
        'VM luokittelee Sitran julkisyhteisöjen ulkopuolelle. Sen 70 miljoonan arvio koskee valtiolle siirtyvien sijoitusten vuotuista tuottoa, ei omaisuuden myyntituloa. Arviointi ei hinnoittele menetettyjä hankehyötyjä eikä anna sijoitustuotolle varmaa vaihteluväliä.',
        'Sitran tilaama strategisen asemoinnin arviointi 2019–2023. Se ei ole kausaalinen tuotto- tai lakkauttamislaskelma.',
        society='Sitran oma asiantuntijatyö ja hankerahoitus päättyisivät. Vaikutus riippuu siitä, jatkuisivatko hyödylliset hankkeet muiden rahoittamina.')
    put('cut-7-44 cut-7-46', 'workingtimefi workingtimerct',
        'ETLAn mallissa työllisyysvaikutus riippui työvoimakustannuksista. Ruotsin kokeessa lyhyempi työaika paransi unta ja vähensi koettua stressiä.',
        'Lisätunnit säästävät rahaa vain, jos palkka- tai sijaiskuluja todella vähennetään. Menetettyjä palkkaveroja, mahdollisia etuuksia ja poissaoloja ei voi vähentää yhdellä tutkimuksesta saadulla prosentilla.',
        'ETLA mallintaa vuoden 2016 kilpailukykysopimusta. Ruotsin koe lyhensi viikkotyöaikaa 25 %; vaikutus ei skaalaudu suoraan tämän kortin vähäisempään pidennykseen.')
    put('cut-7-48 cut-7-49', 'workingtimerct workingtimefi',
        'Ruotsin satunnaistetussa kokeessa työajan lyhentäminen paransi palautumista. Se ei kuitenkaan osoita tietyn lomapäivämäärän vaikutusta.',
        'Lomapäivien vähentäminen lisää työpanosta. Budjettisäästö syntyy vasta henkilöstö- tai sijaiskulujen vähenemisestä; mahdollinen poissaolojen kasvu pienentää sitä. Tälle lomaleikkaukselle ei ole tutkittua Suomen nettokerrointa.',
        'Ruotsin tutkimus koskee viikkotyöaikaa, ei vuosilomaa. ETLAn kirjallisuuskatsaus korostaa palkkojen ja työvoimakustannusten merkitystä.')
    put('tax-ifrs', 'bankprovisions',
        'Kansainvälisessä pankkiaineistossa luottotappiovarausten verovähennyskelpoisuus vaikutti siihen, milloin tappioita kirjattiin.',
        'Poistojen ja varausten muutos voi siirtää veroa vuodesta toiseen. Pysyvää lisätuottoa ei voi päätellä ensimmäisen vuoden kertymästä. VM:n kortti ei määritä riittävän tarkkaa sääntömuutosta ja veropohjaa eurohaarukan laskemiseksi.',
        'Andries ym. tutkivat pankkien luottotappiovarauksia. Teollisuuden IFRS-poistot ja Suomen ehdotuksen tarkka toteutus jäävät tutkimuksen ulkopuolelle.',
        society='Yritysten veronmaksun ajankohta voisi muuttua. Pankeissa myös ennakoitujen luottotappioiden vähentämisen ehdot vaikuttaisivat tulokseen.')
    put('tax-forest', 'forestdeduction',
        'Luken koosteessa vuoden 2008 metsävähennyksen laajennus näytti siirtyneen osaksi metsätilojen hintoja.',
        'Vähennyksen supistus voi muuttaa metsätilakauppoja ja puunmyynnin ajoitusta. Vero voi osin siirtyä myöhempään ajankohtaan; nykyisen 75→60 prosentin muutoksen käyttäytymisnettoa ei voi laskea vanhan uudistuksen hintayhteydestä.',
        'Suomalainen aikasarjanäyttö aiemmasta, myös vähennyksen rakennetta muuttaneesta uudistuksesta. Se ei erota nykyisen prosenttirajan vaikutusta varmasti.',
        society='Metsää ostanut omistaja saisi vähentää pienemmän osuuden hankintahinnasta puunmyyntituloissa. Tulevien metsätilakauppojen hinnat voivat sopeutua.')
    put('tax-transfer-shares', 'unlistedtransfer',
        'Britannian verohallinto tunnisti listaamattomien osakkeiden yritysjärjestelyjä, joilla varainsiirtoveroa pienennettiin. Kaupan rakenne voi siis vaikuttaa veropohjaan.',
        'Yrityskauppojen siirtyminen ja järjestelytapojen vaihtaminen voivat pienentää tuottoa lisää. Suomen verokannan korotukselle ei löytynyt näitä muutoksia mittaavaa euromääräistä tutkimusta.',
        'HMRC:n vaikutusarvio koskee listaamattomien osakkeiden veropohjan aukon sulkemista. Se on konkreettinen esimerkki verosuunnittelusta, ei arvio Suomen korotuksen joustosta.',
        society='Veron maksava ostaja maksaisi yrityksen omistuksen siirrosta enemmän. Pörssikauppa ei kuulu tämän kortin veropohjaan.', status='context')
    put('tax-insurance', 'insurancedemand',
        'Eurooppalaisessa aineistossa vahinkovakuutusten kysyntä reagoi hintaan vähemmän kuin hinta muuttui. Pakollisten vakuutusten välttäminen on vaikeaa.',
        'Yhden prosenttiyksikön korotuksen suora tuotto on 47 miljoonaa. Tutkimuksen kahden mallin kertoimista ja niiden keskivirheistä johdettu herkkyyslaskelma antaa noin 41–45 milj. € vakuutusmaksuveroa kysynnän muutoksen jälkeen. Se olettaa veron siirtyvän kokonaan hintoihin. Muiden verojen, etuuksien ja julkisten vakuutusmaksujen muutokset puuttuvat; tämä ei ole kokonaisneton ennuste.',
        'Oma herkkyyslaskelma VM:n 4,7 mrd. € veropohjalla, vero 25,5→26,5 %. Hodula ym., taulukko 2: kysyntäjoustot noin −0,56…−0,16 (maksutulon hintakertoimet miinus yksi, keskivirheet mukana). Maavertailu ei tunnista Suomen veromuutoksen syy-seurausvaikutusta, joten vertailuväli ei korvaa piirakan suoraa arviota.',
        society='Verollinen koti-, auto- tai yritysvakuutus kallistuisi, jos yhtiö siirtää veron hintaan. Vapaaehtoista turvaa saatettaisiin supistaa tai omavastuuta kasvattaa.')

    assert len(updated) == 40, len(updated)
    existing = json.loads((root/'data/research-sources.json').read_text(encoding='utf-8'))
    existing.update({key: dict(label=label, url=url, kind=kind)
                     for key, (label, url, kind) in SOURCES.items()})
    (root/'data/research-sources.json').write_text(json.dumps(existing, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    return updated
