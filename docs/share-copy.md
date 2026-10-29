# Silppurin nimet, alaotsikot ja tiivistelmät

Luettelo tuotetaan suoraan nykyisestä koodista komennolla `node scripts/list-share-copy.cjs`. Hakasulut ovat alla tekstipohjien muuttuvia kohtia; ne eivät näy käyttäjälle. Toimien nimet ja yhdistävät sivulauseet määräytyvät valituista korteista ja tulokymmenysarvioista. Jokaiselle 19 tavalliselle tiivistelmätyypille sekä yhdeksälle vaihtoehtoiselle lopulle ja kuudelle yritystoimien mukaiselle tekstiversiolle on testattu 8–12 miljardin paketti oikeista korteista. Tyhjä, nolla, puuttuva euroarvio ja negatiivinen kokonaismäärä ovat erikoistapauksia.

## Valmiit paketit

| Nimi | Nykyinen summa | Julkaisun luonnehdinta |
|---|---:|---|
| Rikkaat talkoisiin | 9,99 mrd. € | Verokomissaari |
| Kannustinpaketti | 10,01 mrd. € | Turvaverkon purkaja |
| Kaikille paha mieli | 10,00 mrd. € | Omavastuun arkkitehti |
| Yritykset silppuriin | 10,00 mrd. € | Pääoman aktivointimalli |
| Elintaso silppuriin | 10,01 mrd. € | Palkansaajan painajainen |

## Julkaisun nimet

Paketin oma otsikko on käyttäjän kirjoittama nimi. Alla ovat sen alle valittavat luonnehdinnat.

| Nimi | Painotus |
|---|---|
| Omahoidon apostoli | Palveluleikkaukset |
| Leipäjonokummi | Etuusleikkaukset |
| Muutosneuvottelija | Julkisen alan työ |
| Verokarhu | Ansiotuloverotus |
| Vyönkiristäjä | Kulutusverotus |
| Kansankomissaari | Varallisuuden verotus |
| Näkymätön käsi | Yritysten verot ja tuet |
| Indeksipakastaja | Laajat indeksijäädytykset |
| Tulevaisuuden panttaaja | Tutkimusrahoitus |
| Tukiviidakon raivaaja | Avustukset |
| SILPPURI | Yhdistelmä |
| Turvaverkon purkaja | Etuusleikkaukset + Palveluleikkaukset |
| Omavastuun arkkitehti | Kulutusverotus + Palveluleikkaukset |
| Hyvinvointivaltion saneeraaja | Ansiotuloverotus + Palveluleikkaukset |
| Hyvinvointivaltion pesänjakaja | Palveluleikkaukset + Varallisuuden verotus |
| Verokomissaari | Ansiotuloverotus + Varallisuuden verotus |
| Pääoman aktivointimalli | Yritysten verot ja tuet + Varallisuuden verotus |
| Arjen ankeuttaja | Etuusleikkaukset + Kulutusverotus |
| Palkansaajan painajainen | Kulutusverotus + Ansiotuloverotus |

Suurin teema antaa nimen, jos sen osuus on vähintään 65 % tai toiseksi suurin jää alle 20 %:iin. Muuten käytetään kahden suurimman teeman yhdistelmänimeä, jos sellainen on yllä; muissa yhdistelmissä suurimman teeman nimeä. Nollan ja puuttuvan euroarvion toimet eivät kasvata painoja.

## Alaotsikot

| Tilanne | Alaotsikko |
|---|---|
| Ei valittuja toimia | Terät vielä puhtaina. |
| 0 € | Terät pyörivät. Laskuri ei. |
| Alle 0 € | Silppuri kävi takaperin. |
| Yli 0 mutta alle 5 mrd. € | IMF hoitaa loput myöhemmin. |
| 5 – alle 9,5 mrd. € | Loput seuraavan hallituksen murheeksi. |
| 9,5–10,5 mrd. € | Kympin tuntumassa. Sormet tallella. |
| Yli 10,5 – 15 mrd. € | Tavoite oli ilmeisesti alaraja. |
| Yli 15 – alle 17,5 mrd. € | Lähti vähän kantavaa seinää. |
| 17,5 – alle 20 mrd. € | Sammutusnappi meni mukana. |
| Vähintään 20 mrd. € | Budjetti loppui. Jumala armahtaa, Silppuri ei. |

## Kaikki tiivistelmäpohjat

Näissä pohjissa ei ole muita merkittäviä teemoja kuvaavaa sivulausetta. Alempana on myös kunkin pohjan versio, jossa sellainen on mukana. Tavallinen tiivistelmä on yksi tilanteeseen kirjoitettu kappale; erillisiä toimikohtaisia vitsikappaleita ei yhdistetä.

### 1. Palvelut ja kulutus osuvat pienituloisiin; myös ylempiä tuloryhmiä kuormitetaan

`services-consumption-counter`

> Kun palveluista katoaa apu ja kulutusveroihin ostovoima, pienituloiselle jää vapaus valita, kumman puutteesta valittaa ensin. [ylempiin tuloryhmiin painottuvat toimet] avaavat luokkataistelun toisen rintaman suurituloisten lompakoilla. Yläkerrassa sovitellaan jo marttyyrinviittaa, alakerrassa vertaillaan ruoan ja lääkkeiden hintoja.

Muiden teemojen kanssa:

> Kun palveluista katoaa apu ja kulutusveroihin ostovoima, pienituloiselle jää vapaus valita, kumman puutteesta valittaa ensin. [ylempiin tuloryhmiin painottuvat toimet] avaavat luokkataistelun toisen rintaman suurituloisten lompakoilla, ja [muiden merkittävien toimien kuvaus]. Yläkerrassa sovitellaan jo marttyyrinviittaa, alakerrassa vertaillaan ruoan ja lääkkeiden hintoja.

Kun myös etuudet osuvat samaan pienituloiseen ryhmään:

> Etuudet ja palvelut kutistuvat samalla kun ostokset kallistuvat. Pienituloisen vapaus valita kasvaa: mistä välttämättömästä luovutaan ensin? [ylempiin tuloryhmiin painottuvat toimet] avaavat luokkataistelun toisen rintaman suurituloisten lompakoilla. Yläkerrassa sovitellaan jo marttyyrinviittaa, alakerrassa vertaillaan ruoan ja lääkkeiden hintoja.

<details>
<summary>Oikeista korteista koottu testipaketti: 9,35 mrd. €</summary>

**Hyvinvointivaltion saneeraaja** — Loput seuraavan hallituksen murheeksi.

> Kun palveluista katoaa apu ja kulutusveroihin ostovoima, pienituloiselle jää vapaus valita, kumman puutteesta valittaa ensin. Ansiotuloverot avaavat luokkataistelun toisen rintaman suurituloisten lompakoilla. Yläkerrassa sovitellaan jo marttyyrinviittaa, alakerrassa vertaillaan ruoan ja lääkkeiden hintoja.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Hyvinvointialueiden indeksijäädytys | 3 310 |
| Valtion tuloveroasteikkoa +3 prosenttiyksikköä | 2 700 |
| Eläketuloverotusta kiristetään, VM:n 100 miljoonan esimerkki | 100 |
| Ylempää pääomatuloveroa +2 prosenttiyksikköä | 150 |
| Kaikki ALV-kannat 25,5 prosenttiin | 2 322 |
| Pakettiautojen ja kevyiden kuorma-autojen verotukea pois | 90 |
| Tonttien verotusarvot ajan tasalle | 676,2 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `services-consumption-counter`.

</details>

### 2. Palvelut, etuudet ja kulutus osuvat samaan pienituloiseen ryhmään

`services-consumption-benefits`

> Etuudet pienenevät, palvelut kutistuvat ja kassalla maksetaan enemmän. Pienituloisen vapaus valita on nyt täydellinen: hän saa itse päättää, mistä välttämättömästä luopuu ensin.

Muiden teemojen kanssa:

> Etuudet pienenevät, palvelut kutistuvat ja kassalla maksetaan enemmän. Pienituloisen vapaus valita on nyt täydellinen: hän saa itse päättää, mistä välttämättömästä luopuu ensin. Samaan aikaan [muiden merkittävien toimien kuvaus].

<details>
<summary>Oikeista korteista koottu testipaketti: 10,05 mrd. €</summary>

**Turvaverkon purkaja** — Kympin tuntumassa. Sormet tallella.

> Etuudet pienenevät, palvelut kutistuvat ja kassalla maksetaan enemmän. Pienituloisen vapaus valita on nyt täydellinen: hän saa itse päättää, mistä välttämättömästä luopuu ensin.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Opiskelijoiden asumislisä halvimman kuntaryhmän tasolle | 48,5 |
| Lapsilisä kokonaan pois | 1 165,05 |
| Elatustuki pois | 176,52 |
| Työeläkkeiden indeksit jäihin 2028–2031 | 2 039,71 |
| Perusturvaetuuksien indeksit jäihin 2028–2031 | 992,83 |
| Hyvinvointialueiden indeksijäädytys | 3 310 |
| Kaikki ALV-kannat 25,5 prosenttiin | 2 322 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `services-consumption-benefits`.

</details>

### 3. Palvelut ja kulutus osuvat pienituloisiin

`services-consumption`

> Pienituloiselta säästetään sekä palvelut että ostovoima: apu vähenee ja ostokset kallistuvat. Valinnanvapaudeksi jää päättää, kummasta valittaa ensin.

Muiden teemojen kanssa:

> Pienituloiselta säästetään sekä palvelut että ostovoima: apu vähenee ja ostokset kallistuvat, samalla kun [muiden merkittävien toimien kuvaus]. Valinnanvapaudeksi jää päättää, kummasta valittaa ensin.

<details>
<summary>Oikeista korteista koottu testipaketti: 10,43 mrd. €</summary>

**Indeksipakastaja** — Kympin tuntumassa. Sormet tallella.

> Pienituloiselta säästetään sekä palvelut että ostovoima: apu vähenee ja ostokset kallistuvat, samalla kun indeksijäädytykset kasvattavat säästöpottia. Valinnanvapaudeksi jää päättää, kummasta valittaa ensin.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Hyvinvointialueiden indeksijäädytys | 3 310 |
| Laaja indeksijäädytys, sote-rahoitus suojataan | 4 800 |
| Kaikki ALV-kannat 25,5 prosenttiin | 2 322 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `services-consumption`.

</details>

### 4. Palvelut ja etuudet osuvat pienituloisiin; myös ylemmät tuloryhmät maksavat

`services-benefits-counter`

> Pienituloisen turvaverkosta leikataan sekä rahat että palvelut, mutta yläkerran samppanjat jäävät avaamatta: [ylempiin tuloryhmiin painottuvat toimet] marssivat punalippujen alla suurituloisten kukkarolle. Keskuskomitea löysi porvarin maksukyvyn, mutta unohti matkalla, kenen turvaverkkoa sen piti puolustaa.

Muiden teemojen kanssa:

> Pienituloisen turvaverkosta leikataan sekä rahat että palvelut, mutta yläkerran samppanjat jäävät avaamatta: [ylempiin tuloryhmiin painottuvat toimet] marssivat punalippujen alla suurituloisten kukkarolle, ja [muiden merkittävien toimien kuvaus]. Keskuskomitea löysi porvarin maksukyvyn, mutta unohti matkalla, kenen turvaverkkoa sen piti puolustaa.

<details>
<summary>Oikeista korteista koottu testipaketti: 10,29 mrd. €</summary>

**Indeksipakastaja** — Kympin tuntumassa. Sormet tallella.

> Pienituloisen turvaverkosta leikataan sekä rahat että palvelut, mutta yläkerran samppanjat jäävät avaamatta: julkisen alan henkilöstösäästöt marssivat punalippujen alla suurituloisten kukkarolle, ja indeksijäädytykset kasvattavat säästöpottia. Keskuskomitea löysi porvarin maksukyvyn, mutta unohti matkalla, kenen turvaverkkoa sen piti puolustaa.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Korkeakoulujen opintotuki kokonaan lainaksi | 536,87 |
| Hyvinvointialueiden indeksijäädytys | 3 310 |
| Laaja indeksijäädytys, sote-rahoitus suojataan | 4 800 |
| Julkisella sektorilla 24 työtuntia lisää vuodessa | 103,03 |
| Ensimmäinen sairauspäivä palkattomaksi julkisella sektorilla | 109,74 |
| Julkisen sektorin pitkät lomat 38 → 36 päivää | 33,89 |
| Julkisen sektorin lomarahat puoleen | 404,01 |
| Alennetut ALV-kannat 16 prosenttiin | 492 |
| Lukuvuosimaksu kaikille korkeakouluopiskelijoille, 2 600 € vuodessa | 500 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `services-benefits-counter`.

</details>

### 5. Palvelut ja etuudet osuvat pienituloisiin

`services-benefits`

> Kun etuuksia ja palveluja leikataan yhtä aikaa pienituloisilta, valtio voi luvata kerrankin johdonmukaisen asiakaskokemuksen: rahaa ei ole, apua ei tule. Omillaan pärjääminen alkaa siitä, ettei muuta vaihtoehtoa jätetä.

Muiden teemojen kanssa:

> Kun etuuksia ja palveluja leikataan yhtä aikaa pienituloisilta, valtio voi luvata kerrankin johdonmukaisen asiakaskokemuksen: rahaa ei ole, apua ei tule. Vaikka myös [muiden merkittävien toimien kuvaus], pienituloisen osalta ohje on jo selvä: pärjää omillasi.

<details>
<summary>Oikeista korteista koottu testipaketti: 10,40 mrd. €</summary>

**Indeksipakastaja** — Kympin tuntumassa. Sormet tallella.

> Kun etuuksia ja palveluja leikataan yhtä aikaa pienituloisilta, valtio voi luvata kerrankin johdonmukaisen asiakaskokemuksen: rahaa ei ole, apua ei tule. Vaikka myös indeksijäädytykset kasvattavat säästöpottia, pienituloisen osalta ohje on jo selvä: pärjää omillasi.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Korkeakoulujen opintotuki kokonaan lainaksi | 536,87 |
| Teattereiden, orkestereiden ja museoiden tuista −15 % | 24 |
| Lapsilisä kokonaan pois | 1 165,05 |
| Elatustuki pois | 176,52 |
| Takuueläke vain vanhuuseläkeiän täyttäneille | 77,74 |
| Eläkeläiset yleisen asumistuen piiriin | 280,86 |
| Lastensuojelun asiakasmitoitus pois | 24 |
| Hyvinvointialueiden indeksijäädytys | 3 310 |
| Laaja indeksijäädytys, sote-rahoitus suojataan | 4 800 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `services-benefits`.

</details>

### 6. Etuudet ja kulutus osuvat pienituloisiin; myös ylemmät tuloryhmät maksavat

`benefits-consumption-counter`

> Pienituloiselta viedään ostovoimaa sekä etuuspäätöksessä että kassakuitissa. [ylempiin tuloryhmiin painottuvat toimet] lähettävät suurituloisille oman kutsunsa luokkataisteluun. Ostovoimaa sosialisoidaan nyt useammasta kerroksesta. Näkemyserot koskevat lähinnä sitä, kenen kulutus oli välttämätöntä ja kenen moraalinen ongelma.

Muiden teemojen kanssa:

> Pienituloiselta viedään ostovoimaa sekä etuuspäätöksessä että kassakuitissa. [ylempiin tuloryhmiin painottuvat toimet] lähettävät suurituloisille oman kutsunsa luokkataisteluun, ja [muiden merkittävien toimien kuvaus]. Ostovoimaa sosialisoidaan nyt useammasta kerroksesta. Näkemyserot koskevat lähinnä sitä, kenen kulutus oli välttämätöntä ja kenen moraalinen ongelma.

<details>
<summary>Oikeista korteista koottu testipaketti: 10,20 mrd. €</summary>

**Muutosneuvottelija** — Kympin tuntumassa. Sormet tallella.

> Pienituloiselta viedään ostovoimaa sekä etuuspäätöksessä että kassakuitissa. Julkisen alan henkilöstösäästöt lähettävät suurituloisille oman kutsunsa luokkataisteluun. Vallankumouksen rahoituspohja on silti vanha tuttu: suhteessa raskain rahalasku jää pienituloisille.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Työeläkkeiden indeksit jäihin 2028–2031 | 2 039,71 |
| Julkisen sektorin palkoista −30 % | 4 680,25 |
| Kaikki ALV-kannat 25,5 prosenttiin | 2 322 |
| Vakuutusmaksuveroa +3 prosenttiyksikköä | 141 |
| Virvoitusjuomaveroa +5 snt/l | 37,5 |
| Ajoneuvon perusveroa +300 euroa vuodessa | 690 |
| Lento- ja laivalipuille vero | 200 |
| Alkoholiveroa +10 % | 85 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `benefits-consumption-counter`.

</details>

### 7. Etuudet ja kulutus osuvat pienituloisiin

`benefits-consumption`

> Etuuksista leikataan ja kulutusveroja nostetaan niin, että pienituloiselta loppuvat sekä rahat että halvat vaihtoehdot. Köyhyys ei poistunut, mutta ainakin sen ylläpitämisestä tuli kalliimpaa.

Muiden teemojen kanssa:

> Etuuksista leikataan ja kulutusveroja nostetaan niin, että pienituloiselta loppuvat sekä rahat että halvat vaihtoehdot; [muiden merkittävien toimien kuvaus]. Köyhyys ei poistunut, mutta ainakin sen ylläpitämisestä tuli kalliimpaa.

<details>
<summary>Oikeista korteista koottu testipaketti: 10,81 mrd. €</summary>

**Indeksipakastaja** — Tavoite oli ilmeisesti alaraja.

> Etuuksista leikataan ja kulutusveroja nostetaan niin, että pienituloiselta loppuvat sekä rahat että halvat vaihtoehdot; indeksijäädytykset sekä julkisen alan henkilöstösäästöt kasvattavat säästöpottia. Köyhyys ei poistunut, mutta ainakin sen ylläpitämisestä tuli kalliimpaa.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Korkeakoulujen opintotuki kokonaan lainaksi | 536,87 |
| Lapsilisä kokonaan pois | 1 165,05 |
| Laaja indeksijäädytys, sote-rahoitus suojataan | 4 800 |
| Julkisen sektorin henkilöstöä −20 % | 1 529,28 |
| Kaikki ALV-kannat 25,5 prosenttiin | 2 322 |
| Ajoneuvon perusveroa +200 euroa vuodessa | 460 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `benefits-consumption`.

</details>

### 8. Laaja indeksijäädytys ja ylempiin tuloryhmiin painottuvia toimia

`indices-counter`

> Indeksit pakkaseen, punaliput salkoon. [ylempiin tuloryhmiin painottuvat toimet] ottavat suurituloisten kukkarot viisivuotissuunnitelman palvelukseen. Inflaatio hoitaa hiljaisen leikkaustyön; yläkerran lasku saa näkyvämmän vastaanoton. Jäädytysten koko tuloryhmäjako on vielä selvittämättä, mutta luokkataistelun lehdistötilaisuus voi jo alkaa.

Muiden teemojen kanssa:

> Indeksit pakkaseen, punaliput salkoon. [ylempiin tuloryhmiin painottuvat toimet] ottavat suurituloisten kukkarot viisivuotissuunnitelman palvelukseen, samalla kun [muiden merkittävien toimien kuvaus]. Inflaatio hoitaa hiljaisen leikkaustyön; yläkerran lasku saa näkyvämmän vastaanoton. Jäädytysten koko tuloryhmäjako on vielä selvittämättä, mutta luokkataistelun lehdistötilaisuus voi jo alkaa.

<details>
<summary>Oikeista korteista koottu testipaketti: 10,38 mrd. €</summary>

**Indeksipakastaja** — Kympin tuntumassa. Sormet tallella.

> Indeksit pakkaseen, punaliput salkoon. Julkisen alan henkilöstösäästöt sekä ansiotuloverot ottavat suurituloisten kukkarot viisivuotissuunnitelman palvelukseen. Inflaatio hoitaa hiljaisen leikkaustyön; yläkerran lasku saa näkyvämmän vastaanoton. Jäädytysten koko tuloryhmäjako on vielä selvittämättä, mutta luokkataistelun lehdistötilaisuus voi jo alkaa.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Laaja indeksijäädytys, sote-rahoitus suojataan | 4 800 |
| Julkisen sektorin palkoista −30 % | 4 680,25 |
| Valtion tuloveroasteikkoa +1 prosenttiyksikkö | 900 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `indices-counter`.

</details>

### 9. Laaja indeksijäädytys

`indices`

> Indeksit jäihin, hinnat vapaaksi. Valtio säästää sillä, ettei sama raha enää riitä samaan elämään. Inflaatio saa tehdä likaisen työn, hallitus voi esitellä muuttumattomia euromääriä.

Muiden teemojen kanssa:

> Indeksit jäihin, hinnat vapaaksi. Valtio säästää sillä, ettei sama raha enää riitä samaan elämään, ja [muiden merkittävien toimien kuvaus]. Inflaatio saa tehdä likaisen työn, hallitus voi esitellä muuttumattomia euromääriä.

<details>
<summary>Oikeista korteista koottu testipaketti: 10,53 mrd. €</summary>

**Muutosneuvottelija** — Tavoite oli ilmeisesti alaraja.

> Indeksit jäihin, hinnat vapaaksi. Valtio säästää sillä, ettei sama raha enää riitä samaan elämään, ja julkisen alan henkilöstösäästöt kasvattavat säästöpottia. Inflaatio saa tehdä likaisen työn, hallitus voi esitellä muuttumattomia euromääriä.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Laaja indeksijäädytys, sote-rahoitus suojataan | 4 800 |
| Julkisen sektorin henkilöstöä −75 % | 5 734,8 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `indices`.

</details>

### 10. Yritykset ja tutkimusrahoitus

`business-research`

> Tulevan kasvun siemenrahat tarvitaan tämän päivän laskuun: tutkimusrahoituksesta säästetään samalla kun [yritystoimien kuvaus]. Suomen seuraavan menestystarinan kannattaa syntyä valmiiksi kannattavana.

Muiden teemojen kanssa:

> Tulevan kasvun siemenrahat tarvitaan tämän päivän laskuun: tutkimusrahoituksesta säästetään samalla kun [yritystoimien kuvaus]; [muiden merkittävien toimien kuvaus]. Suomen seuraavan menestystarinan kannattaa syntyä valmiiksi kannattavana.

<details>
<summary>Oikeista korteista koottu testipaketti: 11,79 mrd. €</summary>

**Muutosneuvottelija** — Tavoite oli ilmeisesti alaraja.

> Tulevan kasvun siemenrahat tarvitaan tämän päivän laskuun: tutkimusrahoituksesta säästetään samalla kun markkinoiden näkymätön käsi saa vähemmän tukirahaa ja suuremman verolaskun; kulutusverot kiristävät alempien tuloryhmien arkea sekä julkisen alan henkilöstösäästöt kasvattavat säästöpottia. Suomen seuraavan menestystarinan kannattaa syntyä valmiiksi kannattavana.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| T&K-rahoitus vuoden 2023 tasolle | 1 840 |
| Business Finlandin muut yritystuet pois | 35 |
| Laivojen palveluhenkilöstön tuki pois | 45 |
| CAP-ohjelman kansallista rahoitusta −75 % | 570 |
| Metsän raivaukselle maksu | 30 |
| MYEL-maksujen huojennukset pois | 74 |
| Työterveyden korvauskatosta −50 euroa | 24,47 |
| Maatalouslomituksen rajaaminen ydintehtäviin | 20 |
| Julkisen sektorin henkilöstöä −75 % | 5 734,8 |
| Yrittäjävähennys kokonaan pois | 155 |
| Yhteisöveroa +2 prosenttiyksikköä | 519 |
| Kaikki ALV-kannat 25,5 prosenttiin | 2 322 |
| Pakettiautojen ja kevyiden kuorma-autojen verotukea pois | 90 |
| Maapohjan veron alarajaa +0,2 prosenttiyksikköä | 100 |
| Yritysten voitonsiirron aukot kiinni | 40 |
| Yhtiöiden pienomistusten osingot verolle | 25 |
| Suurten alustojen verkkomainonnalle 5 % vero | 10 |
| Työkoneiden kevyt polttoöljy dieselin verotasolle | 155 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `business-research`.

</details>

### 11. Palveluleikkausten rinnalla ylempiin tuloryhmiin painottuvia toimia

`services-upper`

> Suurituloisten kukkarolle vyöryvät [ylempiin tuloryhmiin painottuvat toimet]. Keskuskomitean riemua varjostaa vain se, että palveluista leikataan samalla pienituloisilta. Porvarin pienempi lompakko ei lyhennä terveyskeskuksen jonoa.

Muiden teemojen kanssa:

> Suurituloisten kukkarolle vyöryvät [ylempiin tuloryhmiin painottuvat toimet]; [muiden merkittävien toimien kuvaus]. Keskuskomitean riemua varjostaa vain se, että palveluista leikataan samalla pienituloisilta. Porvarin pienempi lompakko ei lyhennä terveyskeskuksen jonoa.

<details>
<summary>Oikeista korteista koottu testipaketti: 11,17 mrd. €</summary>

**Muutosneuvottelija** — Tavoite oli ilmeisesti alaraja.

> Suurituloisten kukkarolle vyöryvät julkisen alan henkilöstösäästöt. Keskuskomitean riemua varjostaa vain se, että palveluista leikataan samalla pienituloisilta. Porvarin pienempi lompakko ei lyhennä terveyskeskuksen jonoa.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Teknologialla alle vanhushoivan minimimitoituksen | 26 |
| Hyvinvointialueiden indeksijäädytys | 3 310 |
| Puolustuksen terveysvarautuminen mukaan Nato-menoihin | 36 |
| Julkisen sektorin palkoista −50 % | 7 800,41 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `services-upper`.

</details>

### 12. Ylempiin tuloryhmiin painottuvat toimet

`upper`

> Keskuskomitea on löytänyt maksukyvyn. [ylempiin tuloryhmiin painottuvat toimet] käyvät suurituloisten kukkarolle. Porvaristo näkee jo lyhtypylväissä lisävarusteita, vaikka vallankumous saapui tällä kertaa budjettipäätöksenä.

Muiden teemojen kanssa:

> Keskuskomitea on löytänyt maksukyvyn. [ylempiin tuloryhmiin painottuvat toimet] käyvät suurituloisten kukkarolle; [muiden merkittävien toimien kuvaus]. Porvaristo näkee jo lyhtypylväissä lisävarusteita, vaikka vallankumous saapui tällä kertaa budjettipäätöksenä.

Kun mukana on merkittäviä yritystoimia:

> Keskuskomitea on löytänyt maksukyvyn. [ylempiin tuloryhmiin painottuvat toimet] käyvät suurituloisten kukkarolle. Markkinoiden näkymätön käsi hamuaa jo matkalaukkua: kauppakamarilla etsitään kartasta viimeistä kapitalistista rajanylityspaikkaa.

<details>
<summary>Oikeista korteista koottu testipaketti: 11,70 mrd. €</summary>

**Muutosneuvottelija** — Tavoite oli ilmeisesti alaraja.

> Keskuskomitea on löytänyt maksukyvyn. Julkisen alan henkilöstösäästöt käyvät suurituloisten kukkarolle. Porvaristo näkee jo lyhtypylväissä lisävarusteita, vaikka vallankumous saapui tällä kertaa budjettipäätöksenä.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Julkisen sektorin palkoista −75 % | 11 700,62 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `upper`.

</details>

### 13. Eri toimet painottuvat eri tuloryhmiin

`split`

> [alempiin tuloryhmiin painottuvat toimet] kiristävät pienituloisten arkea; [ylempiin tuloryhmiin painottuvat toimet] vievät luokkataistelun suurituloisten lompakoille. Barrikadin molemmin puolin on maksajia. Yhteisymmärrys saavutetaan siitä, että vastapuolen uhraukset ovat pelkkää teatteria.

Muiden teemojen kanssa:

> [alempiin tuloryhmiin painottuvat toimet] kiristävät pienituloisten arkea; [ylempiin tuloryhmiin painottuvat toimet] vievät luokkataistelun suurituloisten lompakoille, ja [muiden merkittävien toimien kuvaus]. Barrikadin molemmin puolin on maksajia. Yhteisymmärrys saavutetaan siitä, että vastapuolen uhraukset ovat pelkkää teatteria.

<details>
<summary>Oikeista korteista koottu testipaketti: 9,84 mrd. €</summary>

**Muutosneuvottelija** — Kympin tuntumassa. Sormet tallella.

> Etuusleikkaukset kiristävät pienituloisten arkea; julkisen alan henkilöstösäästöt vievät luokkataistelun suurituloisten lompakoille. Yläkertakaan ei siis pääse ilmaiseksi, mutta tuloihin suhteutettu rahalasku jää raskaimmaksi pienituloisille. Samaan hiileen puhalletaan, palovammat jaetaan eri perusteella.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Työeläkkeiden indeksit jäihin 2028–2031 | 2 039,71 |
| Julkisen sektorin palkoista −50 % | 7 800,41 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `split`.

</details>

### 14. Alempiin tuloryhmiin painottuvat toimet

`lower`

> [alempiin tuloryhmiin painottuvat toimet] osuvat painavimmin alempiin tuloryhmiin. Suomea nostetaan jaloilleen aloittamalla niistä, jotka olivat jo polvillaan. Yhteinen vastuu on hieno periaate, kun sen oman osuuden saa määritellä kauempaa.

Muiden teemojen kanssa:

> [alempiin tuloryhmiin painottuvat toimet] osuvat painavimmin alempiin tuloryhmiin, samalla kun [muiden merkittävien toimien kuvaus]. Suomea nostetaan jaloilleen aloittamalla niistä, jotka olivat jo polvillaan. Yhteinen vastuu on hieno periaate, kun sen oman osuuden saa määritellä kauempaa.

<details>
<summary>Oikeista korteista koottu testipaketti: 9,97 mrd. €</summary>

**Muutosneuvottelija** — Kympin tuntumassa. Sormet tallella.

> Kulutusverot osuvat painavimmin alempiin tuloryhmiin, samalla kun julkisen alan henkilöstösäästöt kasvattavat säästöpottia. Suomea nostetaan jaloilleen aloittamalla niistä, jotka olivat jo polvillaan. Yhteinen vastuu on hieno periaate, kun sen oman osuuden saa määritellä kauempaa.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Julkisen sektorin henkilöstöä −100 % | 7 646,4 |
| Kaikki ALV-kannat 25,5 prosenttiin | 2 322 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `lower`.

</details>

### 15. Keskimmäisiin tuloryhmiin painottuvat toimet

`middle`

> [keskimmäisiin tuloryhmiin painottuvat toimet] löytävät maksajansa erityisesti tulotaulukon keskeltä. Keskiluokka pitää taas yhteiskuntaa pystyssä. Selkärangan kulumista kutsutaan tässä harjoituksessa kantokyvyksi.

Muiden teemojen kanssa:

> [keskimmäisiin tuloryhmiin painottuvat toimet] löytävät maksajansa erityisesti tulotaulukon keskeltä, ja [muiden merkittävien toimien kuvaus]. Keskiluokka pitää taas yhteiskuntaa pystyssä. Selkärangan kulumista kutsutaan tässä harjoituksessa kantokyvyksi.

<details>
<summary>Oikeista korteista koottu testipaketti: 9,49 mrd. €</summary>

**Muutosneuvottelija** — Loput seuraavan hallituksen murheeksi.

> Palveluleikkaukset löytävät maksajansa erityisesti tulotaulukon keskeltä, ja markkinoiden näkymätön käsi saa vähemmän tukirahaa ja suuremman verolaskun sekä julkisen alan henkilöstösäästöt kasvattavat säästöpottia. Keskiluokka pitää taas yhteiskuntaa pystyssä. Selkärangan kulumista kutsutaan tässä harjoituksessa kantokyvyksi.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Yritystukia −75 %, myös T&K-tuista heti | 455 |
| Laivojen väylämaksut kustannusten tasolle | 50 |
| Uusista väylähankkeista karsiminen | 150 |
| Maatalouslainojen korkotuki 3 → 1 % | 24 |
| Maatalouden kansalliset tuet pois | 350 |
| Luonnonhaittakorvauksen kansallista lisäosaa alas | 200 |
| Passiiviviljelyn tuet pois | 100 |
| Metsän raivaukselle maksu | 30 |
| Päiväkotien tuleva koulutusvaatimus perutaan | 39 |
| Esi- ja perusopetuksen valtionosuuden indeksijäädytys | 73 |
| Merenkulkijoiden eläkkeiden valtiontuki pois | 67 |
| MYEL-maksujen huojennukset pois | 74 |
| Työterveyden korvauskatosta −50 euroa | 24,47 |
| Maatalouslomituksen valtionrahoitus pois | 122 |
| Sairaaloiden tukipalvelut yhteisiksi | 125 |
| Vuodeosastolta oikeaan jatkohoitoon | 45 |
| Tuomioistuinmaksut kustannusten tasolle | 69,3 |
| Tuomioistuinten toiminnasta −75 % | 162,75 |
| Puolustuksen terveysvarautuminen mukaan Nato-menoihin | 36 |
| Valtion hankintoja yhteisiksi ja halvemmiksi | 173 |
| Kuntien peruspalvelujen indeksikorotukset pois | 390 |
| Julkisen sektorin henkilöstöä −75 % | 5 734,8 |
| Yrittäjävähennys kokonaan pois | 155 |
| Yhteisöveroa +2 prosenttiyksikköä | 519 |
| Suurten lämpöpumppujen ja sähkökattiloiden verotuki pois | 116,8 |
| Yritysten voitonsiirron aukot kiinni | 40 |
| Suurten alustojen verkkomainonnalle 5 % vero | 10 |
| Työkoneiden kevyt polttoöljy dieselin verotasolle | 155 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `middle`.

</details>

### 16. Kaikki tuloryhmät maksavat, suhteelliset rahavaikutukset lähellä toisiaan

`all-pay`

> Kukaan ei pakene Silppurilta. [paketin keskeiset toimet] hakevat rahaa eri suunnista, ja jokaiselle tuloryhmälle jää maksettavaa. Yhteisymmärrys Suomen pelastamisesta löytyy viimeistään siinä vaiheessa, kun kaikki pitävät omaa osuuttaan liian suurena.

Kun mukana on merkittäviä yritystoimia:

> Kukaan ei pakene Silppurilta. [paketin keskeiset toimet] hakevat rahaa eri suunnista, ja jokaiselle tuloryhmälle jää maksettavaa. Markkinoiden näkymätön käsi ja tavallinen palkansaaja löytävät yhteisen sävelen: kummankin mielestä jonkun muun pitäisi maksaa.

<details>
<summary>Oikeista korteista koottu testipaketti: 11,25 mrd. €</summary>

**Muutosneuvottelija** — Tavoite oli ilmeisesti alaraja.

> Kukaan ei pakene Silppurilta. Julkisen alan henkilöstösäästöt, ansiotuloverot sekä kulutusverot hakevat rahaa eri suunnista, ja jokaiselle tuloryhmälle jää maksettavaa. Yhteisymmärrys Suomen pelastamisesta löytyy viimeistään siinä vaiheessa, kun kaikki pitävät omaa osuuttaan liian suurena.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Julkisen sektorin henkilöstöä −75 % | 5 734,8 |
| Valtion tuloveroasteikkoa +3 prosenttiyksikköä | 2 700 |
| Tuloverotuksen indeksitarkistus tekemättä | 489 |
| Kaikki ALV-kannat 25,5 prosenttiin | 2 322 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `all-pay`.

</details>

### 17. Tutkimusrahoitus

`research`

> Tulevaisuuden kasvulle toivotaan kaikkea hyvää, mutta tutkimusrahoituksesta haetaan rahat tämän päivän laskuun. Suomen seuraavan menestystarinan kannattaa siis ottaa oma rahoitus mukaan.

Muiden teemojen kanssa:

> Tulevaisuuden kasvulle toivotaan kaikkea hyvää, mutta tutkimusrahoituksesta haetaan rahat tämän päivän laskuun, ja [muiden merkittävien toimien kuvaus]. Suomen seuraavan menestystarinan kannattaa siis ottaa oma rahoitus mukaan.

<details>
<summary>Oikeista korteista koottu testipaketti: 9,88 mrd. €</summary>

**Muutosneuvottelija** — Kympin tuntumassa. Sormet tallella.

> Tulevaisuuden kasvulle toivotaan kaikkea hyvää, mutta tutkimusrahoituksesta haetaan rahat tämän päivän laskuun, ja julkisen alan henkilöstösäästöt kasvattavat säästöpottia. Suomen seuraavan menestystarinan kannattaa siis ottaa oma rahoitus mukaan.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| T&K-rahoitus vuoden 2023 tasolle | 1 840 |
| Elatustuki pois | 176,52 |
| Lastensuojelun jälkihuolto pois täysi-ikäisiltä | 47 |
| Puolustuksen toimintamenojen indeksit jäihin | 174,75 |
| Julkisen sektorin henkilöstöä −100 % | 7 646,4 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `research`.

</details>

### 18. Avustukset

`grants`

> Avustusten saajat saavat jatkaa yhteiskunnallisesti tärkeää työtään, kunhan yhteiskunnan ei tarvitse osallistua laskuun. Omatoimisuus alkaa omasta rahoituksesta.

Muiden teemojen kanssa:

> Avustusten saajat saavat jatkaa yhteiskunnallisesti tärkeää työtään, kunhan yhteiskunnan ei tarvitse osallistua laskuun. Säästöjä haetaan muualtakin: [muiden merkittävien toimien kuvaus]. Omatoimisuus alkaa omasta rahoituksesta.

<details>
<summary>Oikeista korteista koottu testipaketti: 11,65 mrd. €</summary>

**Muutosneuvottelija** — Tavoite oli ilmeisesti alaraja.

> Avustusten saajat saavat jatkaa yhteiskunnallisesti tärkeää työtään, kunhan yhteiskunnan ei tarvitse osallistua laskuun. Säästöjä haetaan muualtakin: julkisen alan henkilöstösäästöt kasvattavat säästöpottia. Omatoimisuus alkaa omasta rahoituksesta.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Valtionavustuksista ja niiden hallinnosta −100 % | 4 000 |
| Julkisen sektorin henkilöstöä −100 % | 7 646,4 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `grants`.

</details>

### 19. Ei yhtä varmaa päämaksajaa

`mixed`

> [paketin keskeiset toimet] keräävät rahat eri puolilta yhteiskuntaa. Tuloryhmistä ei löydy yhtä varmaa päämaksajaa, mutta budjettineuvotteluun riittää loukkaantuneita joka lähtöön. Konsensus syntyy siitä, että jokaisen mielestä naapurin osuus jäi liian pieneksi.

Kun mukana on merkittäviä yritystoimia:

> [paketin keskeiset toimet] keräävät rahat eri puolilta yhteiskuntaa. Markkinoiden näkymätön käsi on jo varaamassa aikaa ministerille. Maksajien lopullinen työnjako jää epäselväksi, mutta jokaisen mielestä naapurin osuus on liian pieni.

<details>
<summary>Oikeista korteista koottu testipaketti: 9,14 mrd. €</summary>

**Muutosneuvottelija** — Loput seuraavan hallituksen murheeksi.

> Julkisen alan henkilöstösäästöt sekä yritysverot ja tukileikkaukset keräävät rahat eri puolilta yhteiskuntaa. Markkinoiden näkymätön käsi on jo varaamassa aikaa ministerille. Maksajien lopullinen työnjako jää epäselväksi, mutta jokaisen mielestä naapurin osuus on liian pieni.

| Valittu kortti säädöillä | Milj. € |
|---|---:|
| Yritystukia −100 %, myös T&K-tuista heti | 606,67 |
| Ylen rahoitusta −50 % vuoteen 2035 | 148,4 |
| MYEL-maksujen huojennukset pois | 74 |
| Julkisen sektorin henkilöstöä −100 % | 7 646,4 |
| Yhteisöveroa +2 prosenttiyksikköä | 519 |
| Dieselin ja kaasun verotukea pienemmäksi | 150 |

Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `mixed`.

</details>

## Rahalaskun perusteella vaihtuvat loput

Seuraavissa tilanteissa loppu vaihtuu sen mukaan, jääkö suhteellinen raharasitus kokonaisuutena alempiin vai ylempiin tuloryhmiin. Tuntematon merkittävä tuloryhmäjako estää koko paketin varman loppupäätelmän. Palvelurahoituksen ja työnantajakustannusten jakaumia ei lisätä kotitalouden rahalaskuun.

### Palvelut ja kulutus osuvat pienituloisiin; myös ylempiä tuloryhmiä kuormitetaan — ei varmaa koko paketin päämaksajaa

> Kun palveluista katoaa apu ja kulutusveroihin ostovoima, pienituloiselle jää vapaus valita, kumman puutteesta valittaa ensin. [ylempiin tuloryhmiin painottuvat toimet] avaavat luokkataistelun toisen rintaman suurituloisten lompakoilla. Yläkerrassa sovitellaan jo marttyyrinviittaa, alakerrassa vertaillaan ruoan ja lääkkeiden hintoja.

Saavutettava testipaketti: **9,35 mrd. €**. Valinnat: `scripts/fixtures/summary-endings.json`, avain `services-consumption-counter:other`.

### Eri toimet painottuvat eri tuloryhmiin — rahavaikutus painottuu pienituloisiin

> [alempiin tuloryhmiin painottuvat toimet] kiristävät pienituloisten arkea; [ylempiin tuloryhmiin painottuvat toimet] vievät luokkataistelun suurituloisten lompakoille. Yläkertakaan ei siis pääse ilmaiseksi, mutta tuloihin suhteutettu rahalasku jää raskaimmaksi pienituloisille. Samaan hiileen puhalletaan, palovammat jaetaan eri perusteella.

Saavutettava testipaketti: **9,84 mrd. €**. Valinnat: `scripts/fixtures/summary-endings.json`, avain `split:lower`.

### Etuudet ja kulutus osuvat pienituloisiin; myös ylemmät tuloryhmät maksavat — rahavaikutus painottuu pienituloisiin

> Pienituloiselta viedään ostovoimaa sekä etuuspäätöksessä että kassakuitissa. [ylempiin tuloryhmiin painottuvat toimet] lähettävät suurituloisille oman kutsunsa luokkataisteluun. Vallankumouksen rahoituspohja on silti vanha tuttu: suhteessa raskain rahalasku jää pienituloisille.

Saavutettava testipaketti: **10,20 mrd. €**. Valinnat: `scripts/fixtures/summary-endings.json`, avain `benefits-consumption-counter:lower`.

### Palvelut ja etuudet osuvat pienituloisiin; myös ylemmät tuloryhmät maksavat — ei varmaa koko paketin päämaksajaa

> Pienituloisen turvaverkosta leikataan sekä rahat että palvelut, mutta yläkerran samppanjat jäävät avaamatta: [ylempiin tuloryhmiin painottuvat toimet] marssivat punalippujen alla suurituloisten kukkarolle. Keskuskomitea löysi porvarin maksukyvyn, mutta unohti matkalla, kenen turvaverkkoa sen piti puolustaa.

Saavutettava testipaketti: **10,29 mrd. €**. Valinnat: `scripts/fixtures/summary-endings.json`, avain `services-benefits-counter:other`.

### Etuudet ja kulutus osuvat pienituloisiin; myös ylemmät tuloryhmät maksavat — ei varmaa koko paketin päämaksajaa

> Pienituloiselta viedään ostovoimaa sekä etuuspäätöksessä että kassakuitissa. [ylempiin tuloryhmiin painottuvat toimet] lähettävät suurituloisille oman kutsunsa luokkataisteluun. Ostovoimaa sosialisoidaan nyt useammasta kerroksesta. Näkemyserot koskevat lähinnä sitä, kenen kulutus oli välttämätöntä ja kenen moraalinen ongelma.

Saavutettava testipaketti: **10,01 mrd. €**. Valinnat: `scripts/fixtures/summary-endings.json`, avain `benefits-consumption-counter:other`.

### Palvelut ja kulutus osuvat pienituloisiin; myös ylempiä tuloryhmiä kuormitetaan — rahavaikutus painottuu pienituloisiin

> Kun palveluista katoaa apu ja kulutusveroihin ostovoima, pienituloiselle jää vapaus valita, kumman puutteesta valittaa ensin. [ylempiin tuloryhmiin painottuvat toimet] avaavat luokkataistelun toisen rintaman suurituloisten lompakoilla. Punainen lippu ei muuta laskujärjestystä: pienituloiset maksavat silti tuloihinsa nähden eniten.

Saavutettava testipaketti: **8,42 mrd. €**. Valinnat: `scripts/fixtures/summary-endings.json`, avain `services-consumption-counter:lower`.

### Eri toimet painottuvat eri tuloryhmiin — ei varmaa koko paketin päämaksajaa

> [alempiin tuloryhmiin painottuvat toimet] kiristävät pienituloisten arkea; [ylempiin tuloryhmiin painottuvat toimet] vievät luokkataistelun suurituloisten lompakoille. Barrikadin molemmin puolin on maksajia. Yhteisymmärrys saavutetaan siitä, että vastapuolen uhraukset ovat pelkkää teatteria.

Saavutettava testipaketti: **10,81 mrd. €**. Valinnat: `scripts/fixtures/summary-endings.json`, avain `split:other`.

### Palvelut ja etuudet osuvat pienituloisiin; myös ylemmät tuloryhmät maksavat — rahavaikutus painottuu pienituloisiin

> Pienituloisen turvaverkosta leikataan sekä rahat että palvelut, mutta yläkerran samppanjat jäävät avaamatta: [ylempiin tuloryhmiin painottuvat toimet] marssivat punalippujen alla suurituloisten kukkarolle. Internationaali soi, mutta tuloihin suhteutettu rahalasku jää silti raskaimmaksi pienituloisille.

Saavutettava testipaketti: **11,22 mrd. €**. Valinnat: `scripts/fixtures/summary-endings.json`, avain `services-benefits-counter:lower`.

### Eri toimet painottuvat eri tuloryhmiin — rahavaikutus painottuu suurituloisiin

> [alempiin tuloryhmiin painottuvat toimet] kiristävät pienituloisten arkea; [ylempiin tuloryhmiin painottuvat toimet] vievät luokkataistelun suurituloisten lompakoille. Pienituloisetkin maksavat, mutta suhteessa raskain rahalasku jää suurituloisille. Keskuskomitea julistaa maksukyvyn yhteiseksi luonnonvaraksi.

Saavutettava testipaketti: **11,13 mrd. €**. Valinnat: `scripts/fixtures/summary-endings.json`, avain `split:upper`.

## Muuttuvat toimenpidekuvaukset

Toimien nimet: palveluleikkaukset; palvelumaksujen korotukset; etuusleikkaukset; julkisen alan henkilöstösäästöt; ansiotuloverot; kulutusverot; omaisuus- ja pääomaverot; yritysverot; yritystukien leikkaukset; yritysverot ja tukileikkaukset; indeksijäädytykset; tutkimusrahoituksen järjestelyt; avustusleikkaukset; muut sopeutustoimet. Lista yhdistetään pilkuilla ja viimeisellä sanalla ”sekä”.

Yritystoimien kuvaus on jokin seuraavista:

- markkinoiden näkymätön käsi saa vähemmän tukirahaa ja suuremman verolaskun
- markkinoiden näkymättömälle kädelle ojennetaan näkyvä verolasku
- markkinoiden näkymätön käsi saa vähemmän taskurahaa valtiolta

Muiden teemojen kuvaus muodostuu niiden nimistä ja kohdentumisesta. Samoin kohdistuvat toimet yhdistetään samaan lausekkeeseen:

- [toimet] kiristävät alempien tuloryhmien arkea
- [toimet] osuvat tulotaulukon keskelle
- [toimet] marssivat suurituloisten kukkarolle
- [toimet] kasvattavat säästöpottia (kohdentumisesta ei vastaavaa varmaa päätelmää)

## Erikoistapaukset

### Tyhjä paketti

Ei tiivistelmäkappaletta. Tyhjän paketin julkaiseminen on estetty käyttöliittymässä.

### Nolla

> Päätöksiä mahtuu pakettiin ilman näkyvää liikettä tuloryhmäarviossa. Se ei vielä ole todiste siitä, että kaikki saivat jotain ilmaiseksi.

### Euroarvio puuttuu

> Pakettiin on valittu toimia, joiden euroarvio puuttuu. Poliittista tahtoa löytyy; valtiovarainministeriö odottaa vielä numeroita.

### Negatiivinen kokonaismäärä

> Paketti heikentää julkisen talouden laskettua saldoa. Tuloryhmien hyötyjiä ei kuitenkaan voi päätellä kääntämällä budjetin miinusmerkkiä plusmerkiksi.

## Suurin siivu

Tiivistelmän jälkeen tulee `Suurin siivu: [kortin nimi] ([euromäärä]).` Suurin positiivinen, euromäärältään tunnettu toimi valitaan todellisista säädetyistä summista.
