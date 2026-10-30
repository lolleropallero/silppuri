# Silppuri

Kokoa oma 10 miljardin sopeutuspakettisi, vertaile sen vaikutuksia ja jaa tulos kuvana tai muokattavana linkkinä.

Aineisto pohjautuu valtiovarainministeriön vuoden 2026 meno- ja verokartoituksiin sekä niitä täydentävään tutkimukseen. Lähteet ja laskentaoletukset löytyvät toimikorteista.

## Jakolinkit

Paketin nimi, valinnat ja säädöt pakataan selaimessa osoitteen `#s=`-osaan. Jakaminen ei käytä palvelintallennusta tai linkinlyhennyspalvelua.

`src/share-state.js` sisältää linkkimuodon pysyvät numerotunnisteet. Lisää uudet kortit `SHARE_ACTION_IDS`-listan loppuun. Älä muuta vanhojen tunnisteiden järjestystä tai poista niitä: julkaistujen linkkien on avattava samat valinnat myös myöhemmin.

Jakolinkkien tarkistukset: `node scripts/verify-share-codec.cjs`, `node scripts/verify-sharing.cjs` ja `node scripts/verify-percent-cuts.cjs`.

Jaettava PNG sisältää yhteenvedon ja kuvaajat. Toimenpidelistan sijaan kuvassa on QR-koodi, joka sisältää saman paketin jakolinkin kuin kopiointi ja somepainikkeet. QR-koodi luodaan selaimessa paikallisella, MIT-lisensoidulla Nayuki-kirjastolla (`src/vendor/`); palvelintallennusta tai ulkoista QR-palvelua ei tarvita. Esikatselu sovittaa koko kuvan näkyviin ilman kuvan sisäistä vieritystä.

Tiivistelmä valitaan koko paketin tilanteesta. Samaan tuloryhmään osuvat palvelu-, etuus- ja kulutustoimet käsitellään yhdessä; merkittävät vastakkaiseen suuntaan painottuvat verot ja yritystoimet huomioidaan samassa tekstissä. Euromäärät valitsevat aiheet, ja kunkin ryhmän kohdentuminen perustuu sen omaan tulokymmenysarvioon. Palvelurahoitusta, rahavaikutuksia ja työnantajakustannuksia ei lasketa yhdeksi rasitukseksi. Laaja indeksijäädytys saa oman nimen, ja kaksi vahvaa teemaa voi saada yhdistelmänimen. Logiikka on tiedostossa `src/share-summary.js`, tekstit tiedostossa `src/share-editorial.js`; tarkistus: `node scripts/verify-share-summary.cjs`.

Kahdeksan värikoodattua valmispakettia ovat tiedostossa `data/package-presets.json`; yhteiset oletusasetukset ovat tiedostossa `src/presets.js`. Seitsemän osuu tavoiteväliin 9,5–10,5 miljardia; Yövartijavaltio ylittää 20 miljardia. Laskurin tavoitetila on vihreä tavoitevälillä, keltaoranssi sen alapuolella. `node scripts/verify-summary-reachability.cjs` tarkistaa oikeilla korteilla ja sallituilla säädöillä 20 tiivistelmätyypin ja niiden vaihtoehtoisten loppujen saavutettavuuden 8–12 miljardin välillä, yövartijavaltion erikseen yli 20 miljardissa sekä jakolinkkien palautumisen. Tilannekohtaiset tekstit seuraavat korttivalintoja, eivät paketin nimeä. Esimerkkivalinnat ovat hakemistossa `scripts/fixtures/`. Koko tekstiluettelo esimerkkipaketteineen: [docs/share-copy.md](docs/share-copy.md). Luettelon päivittää `node scripts/list-share-copy.cjs`.

Piirakassa täysi kierros vastaa 10 miljardia. Seuraava kierros piirretään samasta sisäreunasta edellisen taakse niin, että se näkyy leveämpänä reunana, omalla punaisen tai sinisen sävyllään. Pieni tavoitteen ylitys ei varaa tilaa uudelle kokonaiselle kehälle. Selain ja PNG käyttävät samaa geometriaa ja väripalettia; kerrosten klikkaukset huomioivat etummaisen näkyvän siivun.

## Korttien laskelmat

Kortin laskenta näkyy omassa, oletuksena suljetussa osiossaan ennen lähdeluetteloa. Haarukoiden päätepisteet tuotetaan samasta laskentamallista kuin kortin euromäärä; lähtötiedot ja oletukset ovat niiden alla. VM:n valmiissa nettoarvioissa erotetaan lähteen ilmoittamat luvut laskurin omista skaalauksista.

`node scripts/verify-calculations.cjs` tarkistaa kaikki kortit molemmilla aikavalinnoilla, säädettävät muutokset ja haarukoiden aritmetiikan. `python scripts/verify_rebuild.py` tarkistaa, että lähdedatan uudelleenluonti säilyttää korjaukset.

## Build

Tarvitset Python 3.10+:n. Aja repositorion juuressa:

```sh
python scripts/build.py --production
```

Valmis sivu on `dist/index.html`. Julkaistava kansio on `dist`.

## Paikallinen esikatselu

Buildin jälkeen:

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Avaa [localhost:8765](http://localhost:8765).

## Deploy Cloudflareen

Yhdistä repo Cloudflare Workersin Git-integraatioon näillä asetuksilla:

| Asetus | Arvo |
| --- | --- |
| Worker name | `silppuri` |
| Production branch | `main` |
| Root directory | Repositorion juuri |
| Build command | `python scripts/build.py --production` |
| Deploy command | `npx wrangler@4 deploy` |

`wrangler.jsonc` määrittää julkaistavaksi kansioksi `dist`. Jos vaihdat palvelun nimen, päivitä myös tiedoston `name`.

Liitä oma domain julkaisun jälkeen: **Workers & Pages → silppuri → Settings → Domains & Routes → Add → Custom Domain**.

Omalta koneelta julkaiseminen onnistuu buildin jälkeen Node.js:n ja npm:n avulla:

```sh
npx wrangler@4 login
npx wrangler@4 deploy
```

Kirjautuminen tarvitaan ensimmäisellä kerralla. Aja build uudelleen aina ennen muutosten julkaisua.

### AI-haku ja nollabudjetti

AI-haku käyttää Cloudflare Workers AI:ta samassa Workerissa kuin sivusto. Omistaja vahvisti
30.10.2026, että tilin **Workers-tilaus on Free**. Cloudflaren
[hinnoittelun](https://developers.cloudflare.com/workers-ai/platform/pricing/) mukaan Free
sisältää 10 000 neuronia päivässä ja hylkää kiintiön ylittävät pyynnöt. Raja on koko tilin
yhteinen, ei 10 000 hakua. **Älä vaihda Workers Paid -tilaukseen tämän haun ollessa päällä:**
Paid laskuttaa ylitykset. Sivuston Free/Pro-tilaus on eri asia kuin Workers-tilaus.

`wrangler.jsonc`:n `AI_SEARCH_MODE: "workers-free"` sallii kutsut. Arvo `"off"`
(tai puuttuva asetus) estää ne. Asetus ei tunnista laskutustilauksen muutoksia eikä ole
Paid-tilin kulukatto. Vaihda arvo pois päältä ja julkaise ennen mahdollista tilausmuutosta.
Malli on kiinteä `@cf/google/gemma-4-26b-a4b-it`; käytössä ei ole maksullisia varamalleja,
AI Gatewayta, automaattisia uusintayrityksiä, Vectorizea, KV:ta tai tietokantaa.
Staattiset sivupyynnöt ohittavat Worker-koodin; ainoastaan `/api/*` reititetään ensin siihen.

Haku tehdään vain painikkeesta. Kaikki AI-kentän haut kulkevat mallille, myös lyhyet
puhekieliset heitot. Hakulauseita, slangisanoja tai aiheita ei yhdistetä kortteihin
käsin laaditulla sanalistalla. Malli tulkitsee myös jatkokysymykset, aiheen vaihtumisen
ja konkreettiset rajaukset. Valitut hakutulokset erottuvat vihreällä taustalla ja
Paketissa-merkinnällä; kortin voi edelleen avata ja poistaa paketista.

Worker rajaa pyynnön 12 000 tavuun, kysymyksen
600 merkkiin. Haku tekee ensin yhden kutsun enintään 12 ehdokkaan löytämiseksi
otsikoiden ja kohderyhmien perusteella (enintään 512 vastaustokenia). Samassa vastauksessa
malli palauttaa konkreettiset rajaukset erillisenä listana. Tyhjä lista tarkoittaa
aihehakua, josta näytetään enintään kuusi osumaa. Rajattu haku tarkistetaan vielä
vaikutusteksteineen (256 tokenia). Puuttuva tai virheellinen rajauslista johtaa aina
tarkistukseen; hakutekstin sanoihin tai pituuteen perustuvaa ohitussääntöä ei ole.
Tyhjä hakutulos ei tarvitse jälkimmäistä kutsua. Tarkistuksessa malli näkee vain ehdotetut
kortit, ja se voi ainoastaan poistaa niitä. Rate Limiting -binding hillitsee AI-kutsuja
(3/min/IP Cloudflaren sijaintikohtaisella likimääräisellä laskurilla); **se ei ole kulukatto**.
Nollakulut perustuvat Workers Free -tilauksen pakotettuun kiintiöön. Kiintiön tai palvelun
pettäessä tavallinen paikallinen haku toimii edelleen.

Build tuottaa `tmp/ai-catalogue.mjs`:ään kaikki nykyiset kortit, jotka Wrangler paketoi
Workerin mukaan. Malli saa otsikot, kohteet ja vaikutustekstit sekä kysymyksen,
enintään kolme aiempaa hakua ja valittujen korttien tunnisteet. Mallilta hyväksytään vain
enintään kuusi tunnettua korttitunnistetta. Käyttäjälle näkyvät nimet, eurot ja tekstit
luetaan aina laskurista. AI ei muuta pakettia. Hakuhistoria säilyy vain avoimen välilehden
muistissa; sovellus ei tallenna sitä palvelimelle eikä lokita kysymyksiä.

Paikalliset tarkistukset (eivät kutsu AI-palvelua):

```sh
python scripts/build.py --production
node scripts/verify-ai-search.mjs
node scripts/verify-ai-search-browser.cjs
npx wrangler@4 deploy --dry-run --outdir tmp/worker-check
```

Selainkoe tarvitsee Playwrightin kuten muutkin selainkokeet. HTTP-palvelimella avattu
staattinen esikatselu ei sisällä AI-rajapintaa. Oikea AI-koe tarvitsee Cloudflare-kirjautumisen
ja Free-tilillä ajettavan Worker-julkaisun tai Wrangler-esikatselun; paikallisten kokeiden
mallivastaukset ovat tarkoituksella simuloituja. Näin ne eivät kuluta päiväkohtaista kiintiötä.

Erillinen kielikoe `node scripts/verify-ai-search-live.mjs --live` kutsuu tuotannon
mallia ja kuluttaa Free-kiintiötä. Se käyttää `scripts/fixtures/ai-search-language.json`:n
hakuilmauksia, joita ei lisätä mallin ohjeisiin tai sovellukseen. Kokeet tehdään
hakurajan sallimalla tahdilla; palveluvirhe pysäyttää ajon ilman uusintayrityksiä.
Tulokset tallentuvat tiedostoon `tmp/ai-search-language-results.json`.
