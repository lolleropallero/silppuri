// The subtitle rates the package against the EUR 10 billion goal.
const shareGoalEditorial={
  empty:'Terät vielä puhtaina.',
  zero:'Terät pyörivät. Laskuri ei.',
  reverse:'Silppuri kävi takaperin.',
  rookie:'IMF hoitaa loput myöhemmin.',
  under:'Loput seuraavan hallituksen murheeksi.',
  target:'Kympin tuntumassa. Sormet tallella.',
  over:'Tavoite oli ilmeisesti alaraja.',
  heavy:'Lähti vähän kantavaa seinää.',
  extreme:'Sammutusnappi meni mukana.',
  demolition:'Budjetti loppui. Jumala armahtaa, Silppuri ei.'
};
// A mixed package can have a recognizable name without inventing a majority.
const shareProfilePairs={
  'benefits+services':'Turvaverkon purkaja',
  'consumption+services':'Omavastuun arkkitehti',
  'income+services':'Hyvinvointivaltion saneeraaja',
  'services+wealth':'Hyvinvointivaltion pesänjakaja',
  'income+wealth':'Verokomissaari',
  'companies+wealth':'Pääoman aktivointimalli',
  'benefits+consumption':'Arjen ankeuttaja',
  'consumption+income':'Palkansaajan painajainen'
};
const shareScenarioEditorial={
  nightwatch:{name:'Pääoman henkivartija',label:'Yli 20 miljardia omistajien etuihin koskematta',subtitle:shareGoalEditorial.demolition},
  pension:{name:'Eläkepommin purkaja',label:'Eläkkeet, lääkkeet, sote ja eläketuloihinkin osuvat verot',subtitle:'Kymppi kasassa. Ansaitut eläkepäivät peruttu.'}
};
// Each situation has a real-card witness: EUR 8–12bn, except the explicitly
// over-EUR-20bn night-watch state. Scenario names never depend on a preset ID.
const shareNarratives={
  nightwatch:()=>`Hyvinvointivaltio päätyi silppuriin, mutta omistamisen ilo säilyi koskemattomana. Julkisen alan palkoista ja etuuksista leikataan, palveluista vetäydytään ja kuluttajalta kerätään loppurahat. Pääomat ja yritystuet saavat valtiolta sen ainoan jäljelle jääneen lämpimän halauksen. Pienituloiselle jää suhteessa raskain rahalasku; omistava luokka saa viimein valtion, joka tietää paikkansa.`,
  pension:()=>`Ansaitut eläkepäivät vaihtuivat valtion säästöpäiviksi. Indeksit jäädytetään, takuueläke katoaa ja asumistuki kutistuu. Lääkkeistä ja hoidosta säästetään juuri kun niitä alkaa tarvita. Pienellä eläkkeellä pärjäämisestä tehdään kannustinloukku ilman ulospääsyä; suuremmista eläkkeistä ja palkoista otetaan lisää veroa. Sukupolvisopimuksen pienellä präntätty ehto löytyi: voimassa vain niin kauan kuin et ehdi eläkkeelle.`,
  'services-consumption-counter':f=>`${f.lowBenefits?'Etuudet ja palvelut kutistuvat samalla kun ostokset kallistuvat. Pienituloisen vapaus valita kasvaa: mistä välttämättömästä luovutaan ensin?':'Kun palveluista katoaa apu ja kulutusveroihin ostovoima, pienituloiselle jää vapaus valita, kumman puutteesta valittaa ensin.'} ${f.upper} avaavat luokkataistelun toisen rintaman suurituloisten lompakoilla${f.otherClause?', ja '+f.otherClause:''}. ${f.netLower?'Punainen lippu ei muuta laskujärjestystä: pienituloiset maksavat silti tuloihinsa nähden eniten.':'Yläkerrassa sovitellaan jo marttyyrinviittaa, alakerrassa vertaillaan ruoan ja lääkkeiden hintoja.'}`,
  'services-consumption-benefits':f=>`Etuudet pienenevät, palvelut kutistuvat ja kassalla maksetaan enemmän. Pienituloisen vapaus valita on nyt täydellinen: hän saa itse päättää, mistä välttämättömästä luopuu ensin.${f.otherClause?" Samaan aikaan "+f.otherClause+".":""}`,
  'services-consumption':f=>`Pienituloiselta säästetään sekä palvelut että ostovoima: apu vähenee ja ostokset kallistuvat${f.otherClause?', samalla kun '+f.otherClause:''}. Valinnanvapaudeksi jää päättää, kummasta valittaa ensin.`,
  'services-benefits-counter':f=>`Pienituloisen turvaverkosta leikataan sekä rahat että palvelut, mutta yläkerran samppanjat jäävät avaamatta: ${f.upperLower} marssivat punalippujen alla suurituloisten kukkarolle${f.otherClause?', ja '+f.otherClause:''}. ${f.netLower?'Internationaali soi, mutta tuloihin suhteutettu rahalasku jää silti raskaimmaksi pienituloisille.':'Keskuskomitea löysi porvarin maksukyvyn, mutta unohti matkalla, kenen turvaverkkoa sen piti puolustaa.'}`,
  'services-benefits':f=>`Kun etuuksia ja palveluja leikataan yhtä aikaa pienituloisilta, valtio voi luvata kerrankin johdonmukaisen asiakaskokemuksen: rahaa ei ole, apua ei tule.${f.otherClause?' Vaikka myös '+f.otherClause+', pienituloisen osalta ohje on jo selvä: pärjää omillasi.':' Omillaan pärjääminen alkaa siitä, ettei muuta vaihtoehtoa jätetä.'}`,
  'benefits-consumption-counter':f=>`Pienituloiselta viedään ostovoimaa sekä etuuspäätöksessä että kassakuitissa. ${f.upper} lähettävät suurituloisille oman kutsunsa luokkataisteluun${f.otherClause?', ja '+f.otherClause:''}. ${f.netLower?'Vallankumouksen rahoituspohja on silti vanha tuttu: suhteessa raskain rahalasku jää pienituloisille.':'Ostovoimaa sosialisoidaan nyt useammasta kerroksesta. Näkemyserot koskevat lähinnä sitä, kenen kulutus oli välttämätöntä ja kenen moraalinen ongelma.'}`,
  'benefits-consumption':f=>`Etuuksista leikataan ja kulutusveroja nostetaan niin, että pienituloiselta loppuvat sekä rahat että halvat vaihtoehdot${f.otherClause?'; '+f.otherClause:''}. Köyhyys ei poistunut, mutta ainakin sen ylläpitämisestä tuli kalliimpaa.`,
  'indices-counter':f=>`Indeksit pakkaseen, punaliput salkoon. ${f.upper} ottavat suurituloisten kukkarot viisivuotissuunnitelman palvelukseen${f.rest(['indices'],['upper'])?', samalla kun '+f.rest(['indices'],['upper']):''}. Inflaatio hoitaa hiljaisen leikkaustyön; yläkerran lasku saa näkyvämmän vastaanoton. Jäädytysten koko tuloryhmäjako on vielä selvittämättä, mutta luokkataistelun lehdistötilaisuus voi jo alkaa.`,
  'indices':f=>`Indeksit jäihin, hinnat vapaaksi. Valtio säästää sillä, ettei sama raha enää riitä samaan elämään${f.rest(['indices'])?', ja '+f.rest(['indices']):''}. Inflaatio saa tehdä likaisen työn, hallitus voi esitellä muuttumattomia euromääriä.`,
  'business-research':f=>`Tulevan kasvun siemenrahat tarvitaan tämän päivän laskuun: tutkimusrahoituksesta säästetään samalla kun ${f.businessClause}${f.rest(['research','companies'])?'; '+f.rest(['research','companies']):''}. Suomen seuraavan menestystarinan kannattaa syntyä valmiiksi kannattavana.`,
  'services-upper':f=>`Suurituloisten kukkarolle vyöryvät ${f.upperLower}${f.otherClause?'; '+f.otherClause:''}. Keskuskomitean riemua varjostaa vain se, että palveluista leikataan samalla pienituloisilta. Porvarin pienempi lompakko ei lyhennä terveyskeskuksen jonoa.`,
  'upper':f=>`Keskuskomitea on löytänyt maksukyvyn. ${f.upper} käyvät suurituloisten kukkarolle${f.otherClause?'; '+f.otherClause:''}. ${f.business?'Markkinoiden näkymätön käsi hamuaa jo matkalaukkua: kauppakamarilla etsitään kartasta viimeistä kapitalistista rajanylityspaikkaa.':'Porvaristo näkee jo lyhtypylväissä lisävarusteita, vaikka vallankumous saapui tällä kertaa budjettipäätöksenä.'}`,
  'split':f=>`${f.lower} kiristävät pienituloisten arkea; ${f.upperLower} vievät luokkataistelun suurituloisten lompakoille${f.otherClause?', ja '+f.otherClause:''}. ${f.netLower?'Yläkertakaan ei siis pääse ilmaiseksi, mutta tuloihin suhteutettu rahalasku jää raskaimmaksi pienituloisille. Samaan hiileen puhalletaan, palovammat jaetaan eri perusteella.':f.netUpper?'Pienituloisetkin maksavat, mutta suhteessa raskain rahalasku jää suurituloisille. Keskuskomitea julistaa maksukyvyn yhteiseksi luonnonvaraksi.':'Barrikadin molemmin puolin on maksajia. Yhteisymmärrys saavutetaan siitä, että vastapuolen uhraukset ovat pelkkää teatteria.'}`,
  'lower':f=>`${f.lower} osuvat painavimmin alempiin tuloryhmiin${f.otherClause?', samalla kun '+f.otherClause:''}. Suomea nostetaan jaloilleen aloittamalla niistä, jotka olivat jo polvillaan. Yhteinen vastuu on hieno periaate, kun sen oman osuuden saa määritellä kauempaa.`,
  'middle':f=>`${f.middle} löytävät maksajansa erityisesti tulotaulukon keskeltä${f.rest([],['middle'])?', ja '+f.rest([],['middle']):''}. Keskiluokka pitää taas yhteiskuntaa pystyssä. Selkärangan kulumista kutsutaan tässä harjoituksessa kantokyvyksi.`,
  'all-pay':f=>`Kukaan ei pakene Silppurilta. ${f.all} hakevat rahaa eri suunnista, ja jokaiselle tuloryhmälle jää maksettavaa. ${f.business?'Markkinoiden näkymätön käsi ja tavallinen palkansaaja löytävät yhteisen sävelen: kummankin mielestä jonkun muun pitäisi maksaa.':'Yhteisymmärrys Suomen pelastamisesta löytyy viimeistään siinä vaiheessa, kun kaikki pitävät omaa osuuttaan liian suurena.'}`,
  'research':f=>`Tulevaisuuden kasvulle toivotaan kaikkea hyvää, mutta tutkimusrahoituksesta haetaan rahat tämän päivän laskuun${f.rest(['research'])?', ja '+f.rest(['research']):''}. Suomen seuraavan menestystarinan kannattaa siis ottaa oma rahoitus mukaan.`,
  'grants':f=>`Avustusten saajat saavat jatkaa yhteiskunnallisesti tärkeää työtään, kunhan yhteiskunnan ei tarvitse osallistua laskuun.${f.rest(['grants'])?' Säästöjä haetaan muualtakin: '+f.rest(['grants'])+'.':''} Omatoimisuus alkaa omasta rahoituksesta.`,
  'mixed':f=>`${f.all} keräävät rahat eri puolilta yhteiskuntaa. ${f.business?'Markkinoiden näkymätön käsi on jo varaamassa aikaa ministerille. Maksajien lopullinen työnjako jää epäselväksi, mutta jokaisen mielestä naapurin osuus on liian pieni.':'Tuloryhmistä ei löydy yhtä varmaa päämaksajaa, mutta budjettineuvotteluun riittää loukkaantuneita joka lähtöön. Konsensus syntyy siitä, että jokaisen mielestä naapurin osuus jäi liian pieneksi.'}`
};
function shareNarrativeKey(f){
  if(f.lowServices&&f.lowConsumption)return f.upper?'services-consumption-counter':f.lowBenefits?'services-consumption-benefits':'services-consumption';
  if(f.lowServices&&f.lowBenefits)return f.upper?'services-benefits-counter':'services-benefits';
  if(f.lowBenefits&&f.lowConsumption)return f.upper?'benefits-consumption-counter':'benefits-consumption';
  if(f.indices)return f.upper?'indices-counter':'indices';
  if(f.research&&f.business)return 'business-research';
  if(f.lowServices&&f.upper&&f.lowerCount===1)return 'services-upper';
  if(f.balanced)return 'all-pay';
  if(f.upper&&!f.lower)return 'upper';
  if(f.lower&&f.upper)return 'split';
  if(f.lower)return 'lower';
  if(f.middle)return 'middle';
  if(f.research)return 'research';
  if(f.grants)return 'grants';
  return 'mixed';
}
// These describe exceptional empty, unpriced, zero and negative packages.
const shareSpecialEditorial={
  empty:['Talkookutsu on vielä luonnoksena.',''],
  zero:['Terät pyörivät. Laskuri ei.','Päätöksiä mahtuu pakettiin ilman näkyvää liikettä tuloryhmäarviossa. Se ei vielä ole todiste siitä, että kaikki saivat jotain ilmaiseksi.'],
  unknown:['Lasku on vielä auki.','Pakettiin on valittu toimia, joiden euroarvio puuttuu. Poliittista tahtoa löytyy; valtiovarainministeriö odottaa vielä numeroita.'],
  reverse:['Silppuri kävi takaperin.','Paketti heikentää julkisen talouden laskettua saldoa. Tuloryhmien hyötyjiä ei kuitenkaan voi päätellä kääntämällä budjetin miinusmerkkiä plusmerkiksi.']
};
