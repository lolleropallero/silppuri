# Silppuri

Kokoa oma 10 miljardin sopeutuspakettisi, vertaile sen vaikutuksia ja jaa tulos kuvana tai muokattavana linkkinä.

Aineisto pohjautuu valtiovarainministeriön vuoden 2026 meno- ja verokartoituksiin sekä niitä täydentävään tutkimukseen. Lähteet ja laskentaoletukset löytyvät toimikorteista.

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
