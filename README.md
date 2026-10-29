# Silppuri

Kokoa oma 10 miljardin sopeutuspakettisi, vertaile sen vaikutuksia ja jaa tulos kuvana tai muokattavana linkkinä.

Aineisto pohjautuu valtiovarainministeriön vuoden 2026 meno- ja verokartoituksiin sekä niitä täydentävään tutkimukseen. Lähteet ja laskentaoletukset löytyvät toimikorteista.

## Jakolinkit

Paketin nimi, valinnat ja säädöt pakataan selaimessa osoitteen `#s=`-osaan. Jakaminen ei käytä palvelintallennusta tai linkinlyhennyspalvelua.

`src/share-state.js` sisältää linkkimuodon pysyvät numerotunnisteet. Lisää uudet kortit `SHARE_ACTION_IDS`-listan loppuun. Älä muuta vanhojen tunnisteiden järjestystä tai poista niitä: julkaistujen linkkien on avattava samat valinnat myös myöhemmin.

Jakolinkkien tarkistukset: `node scripts/verify-share-codec.cjs`, `node scripts/verify-sharing.cjs` ja `node scripts/verify-percent-cuts.cjs`.

Jaettava PNG sisältää yhteenvedon ja kuvaajat. Toimenpidelistan sijaan kuvassa on QR-koodi, joka sisältää saman paketin jakolinkin kuin kopiointi ja somepainikkeet. QR-koodi luodaan selaimessa paikallisella, MIT-lisensoidulla Nayuki-kirjastolla (`src/vendor/`); palvelintallennusta tai ulkoista QR-palvelua ei tarvita. Esikatselu sovittaa koko kuvan näkyviin ilman kuvan sisäistä vieritystä.

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
