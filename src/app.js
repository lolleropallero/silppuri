
(()=>{
  const root=document.getElementById('silppuri-demo');
  const target=10000;
  const data=[]/*CATALOGUE*/;
  const incidenceModel={}/*INCIDENCE_DATA*/;
  /*INCIDENCE_ENGINE*/
  const baseData=new Map(data.map(d=>[d.id,{...d}]));
  const dividendStudyUrl='https://www.sttinfo.fi/files/66784256/70136599/79254/fi';
  const urls={tax:'https://urn.fi/URN:ISBN:978-952-367-619-0',cut:'https://urn.fi/URN:ISBN:978-952-367-603-9'};
  const researchSources={}/*RESEARCH_SOURCES*/;
  const sourceNotes={}/*SOURCE_NOTES*/;
  for(const [url,note] of Object.entries(sourceNotes))if(note.researchSummary)sourceNotes[url]=researchSources[note.researchSummary];
  const evidence={
    'corporate-taxpayers':{url:'https://www.vero.fi/yritykset-ja-yhteisot/verot-ja-maksut/osakeyhtio-ja-osuuskunta/tuloverotus/',label:'Verohallinto: osakeyhtiö ja osuuskunta ovat erillisiä verovelvollisia'},
    'nonprofit-taxpayers':{url:'https://www.vero.fi/syventavat-vero-ohjeet/ohje-hakusivu/47999/verotusohje-yleishyodyllisille-yhteisoille6/',label:'Verohallinto 2026: yleishyödyllisten yhteisöjen verotus'},
    consumption:{url:'https://www.ecb.europa.eu/press/economic-bulletin/articles/2021/html/ecb.ebart202102_01~1773181511.en.html',label:'EKP 2021, luku 4: säästöpuskurit ja kulutusreaktiot'},
    distribution:{url:'https://stat.fi/tietotrendit/artikkelit/2025/Pienituloiset-maksavat-suhteessa-tuloihin-eniten-arvonlisaeveroja-kulutusmenoihin-naehden-progressio-on-vaehaeistae',label:'Tilastokeskus 2025: ALV:n kohdistuminen, kulutustutkimus 2022'},
    'price-incidence':{url:'https://labore.fi/julkaisu/alv-alennus-ei-paranna-kuluttajien-ostovoimaa/',label:'Benzarti, Carloni, Harju & Kosonen 2020: ALV:n epäsymmetriset hintavaikutukset'},
    'benefit-interactions':{url:'https://urn.fi/URN:ISBN:978-952-408-495-6',label:'THL 2025: Perusturvan riittävyys 2023–2025, etuuksien ja toimeentulotuen yhteisvaikutus'},
    'dividend-distribution':{url:'https://www.finnwatch.org/fi/julkaisut/osinkoverojaerjestelmaen-epaetasaisesti-jakautuvat-hyoedyt-seurantaraportti',label:'Finnwatch 2022: osinkoveroedun jakautuminen, Verohallinnon tilastot 2020'},
    'dividend-rules':{url:'https://www.vero.fi/syventavat-vero-ohjeet/ohje-hakusivu/47901/osinkotulojen-verotus6/',label:'Verohallinto 24.2.2026: osinkotulojen verotus, luku 2.2'},
    'dividend-response':{url:'https://www.sttinfo.fi/tiedote/69970253/listaamattomien-yritysten-voitonjako-reagoi-voimakkaasti-muutoksiin-osinkoverotuksessa?publisherId=69819223',label:'VATT / Koivisto 2023: osinkoveromuutokset, voitonjako ja investoinnit'}
  };
  const groups=[{id:'low',name:'Pienituloiset'},{id:'middle',name:'Keskituloiset'},{id:'high',name:'Suurituloiset'},{id:'pension',name:'Eläkeläiset'},{id:'students',name:'Opiskelijat'},{id:'unemployed',name:'Työttömät'},{id:'workers',name:'Palkansaajat'},{id:'owners',name:'Yritysten omistajat'}];
  const direct=reason=>({kind:'direct',reason});
  const possible=reason=>({kind:'possible',reason});
  const consumer=direct('Alennettujen ALV-kantojen tuotteita ostavat kuluttajat maksavat korotusta hinnoissa siltä osin kuin vero siirtyy hintoihin. VM 2026:48, s. 149–153.');
  const services=possible('Vaikutus syntyy, jos alue vähentää tämän ryhmän käyttämiä palveluja tai muuttaa maksuja. Indeksijäädytys ei vielä määritä palvelukohtaisia päätöksiä. VM 2026:44, s. 572–573.');
  const taxable=possible('Kohdistuu vain, jos henkilölle jää vähennysten jälkeen maksettavaa valtion ansiotuloveroa. Ryhmä ei yksin määrää verovaikutusta. VM 2026:48, s. 48–59 ja 263.');
  const indexTax=possible('Vero kiristyy suhteessa indeksitarkistukseen, jos veronalainen ansiotulo kasvaa. Pelkkä ryhmään kuuluminen ei ratkaise vaikutusta. VM 2026:48, s. 65–67.');
  const effects={
    corporate:{who:'Verotettavaa voittoa tekeviltä yrityksiltä ja muilta yhteisöiltä, etenkin osakeyhtiöiltä. Vero otetaan voitosta: samalla tuloksella yritykseen tai omistajille jää vähemmän rahaa.',chain:['Sama verotettava voitto','Enemmän yhteisöveroa','Vähemmän voittoa yritykselle ja omistajille'],society:'Korotus voi vaikuttaa investointeihin, rahoitukseen ja siihen, missä maassa konsernit ilmoittavat voittojaan. Se voi myös vähentää palkan muuttamista yritystuloksi. VM toteaa, ettei kansainvälinen tutkimusnäyttö kasvuvaikutuksista ole yksiselitteistä. Lopullista rasitusta omistajien, työntekijöiden ja asiakkaiden kesken ei ole tälle korotukselle laskettu.',money:'430 milj. € on suora lisätuotto. VM arvioi osinkoverotulojen vähenevän noin 10–20 milj. €, jos yritykset jakavat voitostaan osinkoina saman osuuden kuin ennen. Jo tämä pienentää hyötyä; yritysten käyttäytymisen muutokset vaikuttavat lisäksi.',caveat:'Jos myös osinkoverotus muuttuu, molempien toimien tuotto voi muuttua. Laskuri ei huomioi tätä.',tradeoff:'Yhteisöveroa maksavat esimerkiksi osakeyhtiöt ja osuuskunnat. Myös säätiö tai yhdistys voi maksaa sitä veronalaisesta elinkeinotulostaan; tämä toimi ei poista yleishyödyllisten yhteisöjen sijoitustulojen verovapauksia. Toiminimen tuloverotus on eri asia. VM:n s. 105 alaviitteen mukaan voitonsiirron, investointien ja rahoituksen käyttäytymisvaikutukset voisivat vastata noin 20–35 % staattisesta arviosta. Tämä ei ole kokonaisnetto: työllisyysvaikutuksia ei arvioitu, ja vaikutusten suuruus sekä ajoitus ovat epävarmoja.',refs:'VM 2026:48, s. 99–105 ja 264',extra:['corporate-taxpayers','nonprofit-taxpayers'],map:{}},
    vat:{who:'Kuluttajilta, myös pienituloisilta. Ruoka, lääkkeet ja muut nyt alennettuun verokantaan kuuluvat ostokset kallistuvat siltä osin kuin korotus menee hintoihin.',chain:['Verollinen ostos kallistuu','Samalla rahalla saa vähemmän','Kulutus ja siitä kertyvät verot voivat vähentyä'],society:'VM:n pienempiä ALV-korotuksia koskevissa laskelmissa ostovoiman menetys on tuloihin suhteutettuna suurempi pienituloisilla. Ylimmän tuloryhmän euromääräinen menetys voi silti olla suurempi. Näitä laskelmia ei voi suoraan kertoa suuren uudistuksen suuruudella.',money:'3,90 mrd. € on suora verotuottoarvio. Se ei sisällä kaikkia seurauksia: hintojen nousu kasvattaa indeksisidonnaisia etuuksia ja ostovoiman heikkeneminen vähentää muuta kulutusta.',caveat:'Etuuksien indeksijäädytys muuttaa myös ALV-korotuksen vaikutusta julkiseen talouteen.',tradeoff:'VM esittää ALV-muutoksille yleisen suuntaa antavan arvion, jossa hyöty olisi 60–70 % suorasta verotuotosta. Se ei ole tämän suuren yhtenäistämisen eikä sinun pakettisi tarkistettu kerroin.',refs:'VM 2026:48, s. 149–153',extra:['distribution','price-incidence'],map:Object.fromEntries(groups.map(g=>[g.id,consumer]))},
    health:{who:'Ensin hyvinvointialueiden rahoituksesta. Asukkaalle vaikutus voi näkyä palveluissa; henkilöstölle työssä. Tarkkaa maksajaa ei tiedetä ennen kuin alue päättää, mistä se sopeuttaa.',chain:['Rahoitus ei seuraa kustannuksia','Alue joutuu muuttamaan toimintaansa','Palvelut, työ tai hankinnat voivat muuttua'],society:'Jonot, saavutettavuus ja palvelujen laatu riippuvat toteutuksesta. Sama rahoitusleikkaus voi johtaa erilaisiin ratkaisuihin eri alueilla. ',money:'3,31 mrd. € on vuoden 2031 ehdollinen arvio. Pelkkä valtion maksun pienentäminen ei säästä valtion ja alueiden yhteenlaskettuja menoja, jos alueet jatkavat entistä kulutusta.',caveat:'Säästö edellyttää todellista menojen sopeuttamista. Rahoituksen jälkikäteinen tarkistus ja palvelujen riittävyys rajoittavat toteutusta.',tradeoff:'Tehokkaampi toiminta voi vähentää palveluhaittoja. Ilman toimenpidekohtaista suunnitelmaa ei tiedetä, kuinka paljon säästöistä syntyisi tehokkuudesta ja kuinka paljon palvelujen vähentämisestä.',refs:'VM 2026:44, s. 15–16 ja 570–573',extra:[],map:{low:services,middle:services,high:services,pension:services,students:services,unemployed:services,workers:possible('Palvelujen käytön lisäksi työ voi muuttua, jos henkilö työskentelee alueella. Henkilöstötoimia ei ole määritetty. VM 2026:44, s. 572–573.')}},
    income:{who:'Valtion ansiotuloveroa maksavilta. Mukana on palkansaajia ja eläkeläisiä; pääomatulojen verokanta ei muutu tällä toimella. Pienillä tuloilla vähennykset voivat poistaa valtionveron.',chain:['Ansiotuloista maksetaan enemmän veroa','Käteen jää vähemmän rahaa','Kulutus ja työnteon kannustimet voivat muuttua'],society:'Kulutuksen muutos riippuu muun muassa säästöpuskurista. Sama veroeuro ei vähennä kaikkien kulutusta yhtä paljon. VM arvioi myös työn tarjonnan muutosten pienentävän verotuottoa; vaikutuksen koko on epävarma.',money:'1,50 mrd. € on suora verotuottoarvio vuoden 2028 tasossa. Se ei ole käyttäytymisvaikutukset sisältävä nettosumma.',caveat:'',tradeoff:'VM:n ansiotuloverotuksen yleisarviossa pidemmän aikavälin nettovaikutus on 60–75 % suorasta tuotosta. Laskentaoletuksia ei pidä tulkita tulodesiileittäin havaituiksi vaikutuksiksi.',refs:'VM 2026:48, s. 48–59, 67–68 ja 263',extra:['consumption'],map:{low:taxable,middle:taxable,high:taxable,pension:taxable,students:taxable,unemployed:taxable,workers:direct('Toimi kohdistuu valtion ansiotuloveroa maksaviin palkansaajiin. Kaikki palkansaajat eivät maksa valtionveroa. VM 2026:48, s. 48–59 ja 263.'),owners:possible('Yrittäjän ansiotulo-osuus voi kuulua muutokseen; pelkkä yhtiön omistaminen tai pääomatulo ei riitä. VM 2026:48, s. 48–59.')}},
    'income-index':{who:'Niiltä, joiden veronalaiset ansiotulot kasvavat. Tämä voi koskea palkkaa, eläkettä ja päivärahaa. Jos tulot eivät muutu, vero ei tämän toimen vuoksi nouse.',chain:['Ansiotulo kasvaa','Veroasteikkoa ei tarkisteta','Veroa kertyy enemmän kuin tarkistuksen kanssa'],society:'Käteen jää vähemmän kuin tilanteessa, jossa tarkistus tehtäisiin. VM arvioi toimen kaventavan tuloeroja hieman. Kulutus- ja työllisyysvaikutukset pienentävät suoraa verotuottoa, mutta niitä ei tunneta tarkasti ryhmittäin.',money:'815 milj. € koskee vuoden 2028 tarkistusta. Se ei tarkoita koko vaalikauden indeksijäädytyksen tuottoa eikä vielä kerro kokonaisnettoa.',caveat:'Myös tuloveron korotus muuttaa tämän toimen tuottoa. Tätä ei ole huomioitu summassa.',tradeoff:'VM:n laskelman kulutusreaktiolle käyttämä oletus on mallioletus, ei todiste siitä, että kaikki tuloryhmät reagoisivat samalla tavalla.',refs:'VM 2026:48, s. 65–68 ja 263',extra:[],map:{low:indexTax,middle:indexTax,high:indexTax,pension:indexTax,students:indexTax,unemployed:indexTax,workers:indexTax,owners:indexTax}},
    defence:{who:'Puolustuksen rahoituksesta suhteessa kustannusten nousuun. Tämä ei ole suora vähennys tietyn tuloryhmän tililtä. Vaikutus riippuu siitä, mitä toimintaa tai hankintoja muutetaan.',chain:['Indeksikorotus jää tekemättä','Rahan ostovoima heikkenee','Toiminnan sisältö on sovitettava rahoitukseen'],society:'Turvallisuutta, hankintoja ja toimintakykyä on tarkasteltava yhdessä. Tällä aineistolla ei voi päätellä, kuinka suuren turvallisuus- tai työllisyysvaikutuksen juuri tämä indeksijäädytys aiheuttaisi.',money:'670 milj. € on raportin vuoden 2031 staattinen nettoarvio. Koko talouden kysyntävaikutusta ei ole sisällytetty menokartoituksen yksittäisiin arvioihin.',caveat:'',tradeoff:'Puolustuksen indeksijäädytys ja puolustusmenojen BKT-tavoitteen muuttaminen ovat eri toimia. Kotimaisen tuotannon vaikutus riippuu myös hankintojen sisällöstä.',refs:'VM 2026:44, s. 16, 531–534 ja 570–571',extra:[],map:{}},
    benefits:{who:'Jäädytettävien etuuksien saajilta: esimerkiksi opintorahan, työttömyysturvan sekä kansan- ja takuueläkkeen saajilta. Työeläkkeiden indeksijäädytys ei kuulu tähän palaan.',chain:['Etuus ei nouse hintojen mukana','Sama etuus ostaa vähemmän','Kulutus ja kulutusverot voivat vähentyä'],society:'Kun säästöpuskuria ei ole, tulojen menetystä on vaikeampi tasata säästöillä. Kulutuksen väheneminen voi pienentää yritysten myyntiä ja edelleen työllisyyttä. Vaikutus ei ole sama kaikilla etuuksilla tai saajilla.',money:'540 milj. € on jo VM:n staattinen nettoarvio, ei pelkkä etuusmenon leikkaus. Sosiaaliturva-arvioissa huomioidaan myös muita etuuksia ja verotuloja; koko talouden kysyntävaikutus ei sisälly lukuihin.',caveat:'',tradeoff:'Työllisyysvaikutusta ei voi yleistää kaikkiin etuuksiin: kannustimet ja mahdollisuus lisätä työntekoa ovat erilaisia. Viimesijaisen turvan riittävyys rajoittaa toteutusta.',refs:'VM 2026:44, s. 15–16 ja 569–573; EKP 2021, luku 4',extra:['consumption','benefit-interactions'],map:{low:direct('Perusturvaetuuksien ostovoima heikkenee jäädytyksessä. Kaikki pienituloiset eivät saa näitä etuuksia. VM 2026:44, s. 569–573.'),pension:direct('Kansan- ja takuueläkkeen saajat. Pelkkä työeläke ei sisälly tähän indeksitoimeen. VM 2026:44, s. 570–572.'),students:direct('Opintorahan saajat: opintoraha on indeksisidonnainen. VM 2026:44, s. 570.'),unemployed:direct('Jäädytettävään indeksiin sidottua työttömyysetuutta saavat. VM 2026:44, s. 569–573.'),workers:possible('Voi koskea etuutta saavaa palkansaajaa esimerkiksi sairaus- tai perhevapaalla. Riippuu etuudesta; palkka itsessään ei ole tämän toimen kohde. VM 2026:44, luku 6.')}},
    dividends:{who:'Listaamattomien yhtiöiden osingonsaajilta. Nykyinen veroetu hyödyttää ennen kaikkea suurituloisia ja suosii suurta yritysvarallisuutta omistavia. Mitä suurempi omistusosuuden nettovarallisuus, sitä enemmän kevyesti verotettua osinkoa voi nostaa 150 000 euron rajaan asti.',chain:['Osingon verosäännöt muuttuvat','Omistaja muuttaa osinkoa tai sen ajoitusta','Osa suorasta verotuotosta jää kertymättä'],society:'Nykyjärjestelmä kannustaa muuttamaan palkkaa osingoksi ja kerryttämään yhtiöön varallisuutta. VATT:n tutkimissa 2010-luvun veromuutoksissa osingonjako reagoi voimakkaasti, mutta investoinneissa tai liikevaihdossa ei havaittu muutosta. Tulos ei ole ennuste tämän muutoksen kaikista vaikutuksista.',money:'370 milj. € on suora tuottoarvio. VM toteaa, että osingonjaon muutokset pienentävät toteutuvaa lisätuottoa.',caveat:'Kuvaaja näyttää nykyisen veroedun saajat. Uudistuksen veronkorotukset voivat jakautua eri tavalla.',tradeoff:'Esimerkki nykyisestä varallisuusehdosta: 150 000 euron huojennettu vuotuinen osinko edellyttää vähintään 1 875 000 euron osakeomistusta verotuksessa käytettävällä matemaattisella arvolla (150 000 / 8 %). Tämä ei ole sama kuin osakkeiden markkina-arvo. Huojennetusta osingosta 75 % on saajalle verovapaata, 25 % veronalaista pääomatuloa; yhtiön voiton verotus on erillinen. Finnwatchin jakauma perustuu vuoden 2020 veronalaisiin tuloihin ja huojennettujen osinkojen verovapaaseen osaan. Osuudet on pyöristetty. VM:n mallissa myös 150 000 euron raja poistuu, joten jokaisen osingonsaajan vero ei muutu samalla tavalla.',refs:'VM 2026:48, s. 100–106 ja 264',extra:['dividend-distribution','dividend-rules','dividend-response'],map:{owners:direct('Listaamattomien yhtiöiden osingonsaajien verotus muuttuu. Nykyinen veroetu kasautuu suurituloisille ja suosii suurta yritysvarallisuutta omistavia. VM 2026:48, s. 105 ja 264; Finnwatch 2022.'),high:possible('Nykyisestä veroedusta suurin osa kasautuu tähän ryhmään: noin 71 % huojennettujen osinkojen verovapaasta osuudesta meni ylimpään tulokymmenykseen vuonna 2020. Uudistuksen tarkka jakauma vaatii oman laskelman. Finnwatch 2022.'),middle:possible('Nykyisestä veroedusta noin 29 % kohdistui ylimmän tulokymmenyksen ulkopuolelle vuonna 2020. Tämä ei ole erillinen keskituloisten osuus. Finnwatch 2022.')}},
    education:{who:'Korkeakoulujen rahoituksesta. Opiskelijoille ja henkilöstölle vaikutus riippuu siitä, mitä opetuksessa, tutkimuksessa tai muussa toiminnassa muutetaan. Opintorahaa tämä toimi ei suoraan leikkaa.',chain:['Rahoituksen ostovoima laskee','Korkeakoulu muuttaa toimintaansa','Opetuksen ja tutkimuksen resurssit voivat muuttua'],society:'Pelkkä indeksijäädytys ei kerro, mitä koulutusta tai tutkimusta karsitaan. Tämän toimen pitkän aikavälin osaamis- ja kasvuhyödyn menetystä ei ole tässä lähdeaineistossa yksilöity.',money:'350 milj. € on VM:n vuoden 2031 staattinen nettoarvio. Se ei sisällä kattavaa arviota tulevista osaamis-, kasvu- tai verotuottovaikutuksista.',caveat:'',tradeoff:'Toteutustapa ratkaisee: säästö voi kohdistua eri tavalla opetukseen, tutkimukseen tai muuhun toimintaan. Opintorahan jäädytys on erillinen toimi.',refs:'VM 2026:44, s. 15–16 ja 569–573',extra:[],map:{students:possible('Korkeakouluopiskelijoiden opetus ja palvelut voivat muuttua. Ei koske samalla tavoin kaikkia opiskelijoita. VM 2026:44, s. 570–573.'),workers:possible('Korkeakoulun henkilöstö, jos sopeutus koskee työtä. Henkilöstötoimia ei ole määritetty. VM 2026:44, s. 570–573.')}}
  };
  const format=n=>(n/1000).toLocaleString('fi-FI',{minimumFractionDigits:2,maximumFractionDigits:2});
  const pct=n=>(n/target*100).toLocaleString('fi-FI',{maximumFractionDigits:1});
  const selected=new Set();
  let packageName='';
  /*SHARE_STATE*/
  const packageSession=createShareSession(()=>window.openai);
  const scenario={income:2,corporate:3,dividends:'vm',ylePercent:20};
  const maxPP=10;
  const units={};
  data.forEach(d=>{if(d.unit)units[d.id]=1;});
  const conditions={yle:'reduce-tax',farm:'redirect'};
  let year=2031,includeLater=false,search='',category='all',sortOrder='desc',limit=12;
  let catalogueOrder=[],catalogueOrderKey='';
  let filter='all',expanded=false,activeAction=null,activeFlow=null,opener=null;
  let visibleFrame=null,measureViewport=()=>{};
  let activeDecile=null;
  const design={radius:12,thickness:72};
  const q=s=>root.querySelector(s);
  const list=q('.sp-action-list');
  const dialog=q('.sp-modal');
  /*MODAL_SHRED*/
  const modalShred=createModalShred(root,dialog);
  const zoomIcon=expanded=>'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6M6 10h8'+(expanded?'':'M10 6v8')+'"/></svg>';
  q('.sp-chart').insertAdjacentHTML('beforeend','<button type="button" class="sp-zoom-open cursor-interaction" aria-label="Suurenna piirakka" aria-expanded="false" aria-controls="sp-pie-details" data-tooltip="Suurenna piirakka">'+zoomIcon(false)+'</button>');
  const budgetControls=document.createElement('div');budgetControls.className='sp-budget-controls';
  q('.sp-horizon').before(budgetControls);budgetControls.append(q('.sp-horizon'),q('.sp-zoom-open'));
  q('.sp-chart').insertAdjacentHTML('afterend','<details class="sp-small-actions" hidden><summary class="cursor-interaction"></summary><ul></ul></details>');
  const budgetVisuals=document.createElement('div');budgetVisuals.className='sp-budget-visuals';
  q('.sp-chart').before(budgetVisuals);
  const pieBlock=document.createElement('div');pieBlock.className='sp-pie-block';budgetVisuals.appendChild(pieBlock);
  pieBlock.append(q('.sp-chart'),q('.sp-small-actions'));
  budgetVisuals.insertAdjacentHTML('beforeend','<div id="sp-pie-details" class="sp-zoom-list" hidden></div>');
  let pieExpanded=false,pieAnimations=[];
  let pieRenderKey='',pieFrame=0,piePainted=[],pieColourAnimations=[];
  function ppLabel(n){return n+' '+(n===1?'prosenttiyksikkö':'prosenttiyksikköä');}
  function syncScenario(){
    data.forEach(d=>{
      const base=baseData.get(d.id);
      Object.assign(d,base,{scaled:false,historical:false,netUpper:null,scaleNetOpen:false});
      if(d.fundingCut){
        d.cutPercent=ylePercent(scenario.ylePercent);
        d.budget=yleBudget(base,d.cutPercent);
        d.title=d.short='Ylen rahoitusta −'+d.cutPercent+' % vuoteen 2035';
        d.scaled=!d.fundingCut.vmVariants[d.cutPercent];
      }
      const index=year-2028;
      d.budgetAmount=d.budget[index];d.fundAmount=d.funds[index];
      d.amount=Number.isFinite(d.budgetAmount)||Number.isFinite(d.fundAmount)?(d.budgetAmount??0)+(d.fundAmount??0):null;
      d.gross=d.budgetAmount;
      if(d.spendingNet&&Number.isFinite(d.gross)){
        d.amount=d.gross*d.spendingNet.factors[0];d.netUpper=d.gross*d.spendingNet.factors[1];
      }
      if(d.net){d.amount=d.net.low;d.netUpper=d.net.high??d.net.low;}
      d.year=d.net?(d.net.model?'VM:n arvioista laskettu':'VM:n nettoarvio')+(d.net.high?' · alaraja':'')+' · 2028':d.report==='tax'?(d.amount===null?'Ei euromääräistä arviota':'Suora arvio · 2028 · nettoa ei laskettu'):year+' · koko julkinen talous';
      if(d.spendingNet)d.year=year+' · oma nettoherkkyyslaskelma';
      if(d.directOnly)d.year=year+' · suora arvio, vastavaikutuksia avoinna';
      if(d.fundingCut&&d.scaled)d.year+=' · oma laskelma VM:n rahoituspohjasta';
      if(d.revenueEstimate){d.amount=d.revenueEstimate.amount;d.year=d.revenueEstimate.label;}
      if(d.estimate){d.amount=d.estimate.amount;d.year=d.estimate.basis;}
      if(d.unit){
        const requested=d.id==='income'||d.id==='corporate'?scenario[d.id]:(units[d.id]??1);
        const n=Math.min(capFor(d.id),Math.max(0,Number.isFinite(requested)?requested:1));
        if(d.id==='income'||d.id==='corporate')scenario[d.id]=n;else units[d.id]=n;
        let perUnit=base.budget[0];
        if(d.id==='tax-land-min'&&selected.has('tax-land-values'))perUnit=100;
        d.gross=perUnit*n;
        d.amount=(d.net?.low??perUnit)*n;
        d.netUpper=d.net?(d.net.high??d.net.low)*n:null;
        d.scaled=n!==1;
        const value=d.unit==='0.1pp'?(n/10).toLocaleString('fi-FI'):d.unit==='100 euroa'?n*100:n;
        d.title=base.title.replace('+1 prosenttiyksikkö','+'+value+' prosenttiyksikkö').replace('−1 prosenttiyksikkö','−'+value+' prosenttiyksikkö').replace('+0,1 prosenttiyksikköä','+'+value+' prosenttiyksikköä').replace('+100 euroa','+'+value+' euroa').replace('+1 €/MWh','+'+value+' €/MWh');
        if(n!==1)d.title=d.title.replace(/prosenttiyksikkö(?!ä)/g,'prosenttiyksikköä');
        d.short=d.title;
        d.year+=(n!==1?' · yksikköarviosta kerrottu':'');
        if(n>3&&!['tax-entrepreneur-step','tax-dividend-return'].includes(d.id)){
          d.scaleNetOpen=true;d.amount=null;d.netUpper=null;
          d.year='Suuri muutos · nettoa ei ole arvioitu';
        }
      }
      if(d.earliest>year){d.amount=0;d.gross=0;d.netUpper=d.net?0:null;d.year='Aikaisintaan '+d.earliest;}
      if(d.conditional==='yle'&&conditions.yle!=='keep-tax')d.amount=0;
      if(d.conditional==='farm'&&conditions.farm!=='save')d.amount=0;
      if(d.cashOnly)d.amount=0;
      if(d.unquantifiedNet){d.directAmount=d.amount;d.amount=null;d.year=year+' · kokonaisneton euromäärä avoin';}
    });
    if(scenario.dividends==='abolish'){
      const d=data.find(x=>x.id==='dividends');
      Object.assign(d,{amount:459,gross:459,title:'Listaamattomien osinkohuojennus pois',short:'Osinkohuojennuksen poisto',year:'Suora arvio · Labore 2024 · nettoa ei laskettu',historical:true,sourceUrl:dividendStudyUrl,source:'Finér / Kalevi Sorsa -säätiö 2024, s. 27 ja 34; laskelmat Labore',detail:'Erityishuojennus poistetaan: listaamattomia osinkoja verotetaan kuten pörssiosinkoja. Osingosta 85 % on veronalaista pääomatuloa ja 15 % verovapaata. Nettovarallisuussidos ja ansiotulo-osinko poistuvat.'});
    }
    applyHorizon(data,year,typeof includeLater!=='undefined'&&includeLater,conditions);
  }
  function ylePercent(value){
    const settings=data.find(d=>d.fundingCut)?.fundingCut;
    if(!settings)return 20;
    return Number.isFinite(value)?Math.min(settings.maxPercent,Math.max(settings.minPercent,Math.round(value/settings.step)*settings.step)):settings.defaultPercent;
  }
  function yleBudget(d,percent){
    const s=d.fundingCut;
    if(s.vmVariants[percent])return [...s.vmVariants[percent]];
    const years=s.endYear-s.startYear+1;
    return d.budget.map((_,i)=>Math.round(s.referenceMillion*percent/100*(i+1)/years*10)/10);
  }
  function laterEstimateFor(d,baseYear,choices){
    if(d.report!=='cut'||d.net||d.spendingNet||d.unit||d.cashOnly||d.unquantifiedNet||d.revenueEstimate||d.zeroNote)return null;
    if(d.conditional==='yle'&&choices.yle!=='keep-tax'||d.conditional==='farm'&&choices.farm!=='save')return null;
    const candidates=(d.budget||[]).map((b,i)=>({amount:Number.isFinite(b)||Number.isFinite(d.funds[i])?(b??0)+(d.funds[i]??0):null,budget:b,funds:d.funds[i],year:2028+i,when:String(2028+i),precision:d.fundingCut&&d.scaled?'Oma laskelma':'',longRun:false}))
      .filter(e=>e.year>baseYear&&Number.isFinite(e.amount)&&e.amount>=20);
    const near=candidates.filter(e=>e.amount>(d.amount??0)).sort((a,b)=>b.amount-a.amount||a.year-b.year)[0];
    if(near)return near;
    if(d.longRunEstimate){const e=d.longRunEstimate;return {amount:e.million,when:e.when.replace(/^vuonna /,''),precision:e.precision||'',longRun:true,basis:e.basis};}
    return null;
  }
  function applyHorizon(actions,baseYear,later,choices){
    for(const d of actions){
      d.currentAmount=d.amount;d.horizonEstimate=laterEstimateFor(d,baseYear,choices);d.laterApplied=!!(later&&d.horizonEstimate&&!d.horizonEstimate.longRun);d.incidenceHorizonGap=false;
      if(!d.laterApplied)continue;
      const e=d.horizonEstimate;d.amount=e.amount;d.year=e.when+' · '+(d.fundingCut&&d.scaled?'oma laskelma VM:n rahoituspohjasta':'VM:n myöhempi vuosiarvio');
      d.budgetAmount=e.budget??null;d.fundAmount=e.funds??null;d.gross=e.budget??null;
      d.incidenceHorizonGap=e.longRun;
    }
  }
  function capFor(id){
    if(id==='tax-dividend-return')return 7;
    if(id==='tax-entrepreneur-step')return 4;
    if(id==='income')return 5;
    if(id==='corporate')return 10;
    if(id==='tax-vat-reduced')return Math.min(3,Math.floor(25.5-13.5));
    return 3;
  }
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function sourceMarkup(s){
    const note=sourceNotes[s.url]||s;
    return `<details class="sp-source"><summary class="cursor-interaction">${esc(s.label)}</summary><div class="sp-source-body"><p class="sp-source-summary">${esc(note.summary)}</p><p class="sp-source-limit">${esc(note.limit)}</p>${s.kind?'<p class="sp-research-kind">'+esc(s.kind)+'</p>':''}<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc('Avaa lähde: '+s.label)}">Avaa lähde ↗</a></div></details>`;
  }
  const conflictsFor=d=>data.filter(x=>selected.has(x.id)&&d.conflicts.includes(x.id));
  const possibleOverlapsFor=d=>(d.possibleOverlaps||[]).filter(o=>selected.has(o.id));
  function selectedOverlaps(chosen){
    const seen=new Set(),pairs=[];
    for(const d of chosen)for(const o of possibleOverlapsFor(d)){
      const key=[d.id,o.id].sort().join('/');
      if(!seen.has(key)){seen.add(key);pairs.push({action:d,other:data.find(x=>x.id===o.id),note:o.note});}
    }
    return pairs;
  }


  function controlsMarkup(id,place){
    const d=data.find(x=>x.id===id);
    if(d?.conditional){
      const yle=d.conditional==='yle',key=d.conditional,value=conditions[key];
      const reduction=d.fundingCut?`<span class="sp-control-label">Leikkaus vuoteen 2035</span><div class="sp-stepper" role="group" aria-label="Ylen rahoitusleikkaus"><button type="button" id="sp-${place}-yle-minus" class="cursor-interaction" data-yle-step="-${d.fundingCut.step}" aria-label="Pienennä Ylen leikkausta 5 prosenttiyksikköä" ${d.cutPercent===d.fundingCut.minPercent?'disabled':''}>−</button><output aria-live="polite">${d.cutPercent}<small>%</small></output><button type="button" id="sp-${place}-yle-plus" class="cursor-interaction" data-yle-step="${d.fundingCut.step}" aria-label="Kasvata Ylen leikkausta 5 prosenttiyksikköä" ${d.cutPercent===d.fundingCut.maxPercent?'disabled':''}>+</button></div>`:'';
      return reduction+`<span class="sp-control-label">${yle?'Mitä Yle-verolle tehdään?':'Mihin vapautuva tukiraha menee?'}</span><div class="sp-variant-options" role="group" aria-label="Rahoituksen käyttö"><button type="button" id="sp-${place}-${id}-${yle?'reduce-tax':'redirect'}" class="cursor-interaction" data-condition="${key}" data-value="${yle?'reduce-tax':'redirect'}" aria-pressed="${value===(yle?'reduce-tax':'redirect')}"><strong>${yle?'Veroa alennetaan saman verran':'Tuki aktiiviviljelijöille'}</strong>Sopeutusta 0 €</button><button type="button" id="sp-${place}-${id}-${yle?'keep-tax':'save'}" class="cursor-interaction" data-condition="${key}" data-value="${yle?'keep-tax':'save'}" aria-pressed="${value===(yle?'keep-tax':'save')}"><strong>${yle?'Yle-vero ennallaan':'Rahaa ei jaeta uudelleen'}</strong>${moneyLabel(d.gross)} / v</button></div>`;
    }
    if(d?.unit){
      const n=id==='income'||id==='corporate'?scenario[id]:units[id],max=capFor(id);
      const value=d.unit==='0.1pp'?(n/10).toLocaleString('fi-FI'):d.unit==='100 euroa'?n*100:n;
      const label=d.unit==='100 euroa'?'euroa':d.unit==='€/MWh'?'€/MWh':'prosenttiyksikköä';
      const scope=id==='corporate'?'18 % → '+(18+n)+' %.':id==='income'?'Muutos jokaiseen valtion tuloveroportaan marginaaliprosenttiin.':'';
      return `<span class="sp-control-label">Muutoksen suuruus</span><div class="sp-stepper" role="group" aria-label="Muutoksen suuruus"><button type="button" id="sp-${place}-${id}-minus" class="cursor-interaction" data-step="${id}" data-delta="-1" aria-label="Pienennä muutosta" ${n===0?'disabled':''}>−</button><output>${d.unit==='pp-down'?'−':'+'}${value}<small>${label}</small></output><button type="button" id="sp-${place}-${id}-plus" class="cursor-interaction" data-step="${id}" data-delta="1" aria-label="Kasvata muutosta" ${n===max?'disabled':''}>+</button></div>${scope?'<p class="sp-control-note">'+scope+'</p>':''}`;
    }

    if(id==='dividends')return `<span class="sp-control-label">Miten osinkoverotusta muutetaan?</span><div class="sp-variant-options" role="group" aria-label="Osinkoverotuksen vaihtoehto"><button type="button" id="sp-${place}-dividends-vm" class="cursor-interaction" data-dividend-mode="vm" aria-pressed="${scenario.dividends==='vm'}"><strong>VM:n uudistus</strong>+370 milj. € / v<small>VM · arvio vuodelle 2028</small></button><button type="button" id="sp-${place}-dividends-abolish" class="cursor-interaction" data-dividend-mode="abolish" aria-pressed="${scenario.dividends==='abolish'}"><strong>Erityishuojennus kokonaan pois</strong>+459 milj. € / v<small>Labore 2024 · suora arvio, netto avoin</small></button></div>`;
    return '';
  }
  function effectFor(d){
    const special=['income','income-index','corporate','dividends'].includes(d.id);
    const e=special?{...effects[d.id]}:{who:d.who,chain:[],society:d.society,money:'',caveat:'',tradeoff:'',refs:d.source,extra:[]};
    if(!special){
      e.money=d.moneyNote||(d.amount===null?'VM ei anna tälle toteutukselle euromääräistä arviota. Voit ottaa toimen pakettiin, mutta se ei täytä piirakkaa.':d.laterApplied?moneyLabel(d.amount)+' on VM:n myöhempi vuosiarvio ('+d.horizonEstimate.when+').':d.amount<0?'Toimi heikentää julkista taloutta '+moneyLabel(-d.amount)+' vuonna '+year+'.':moneyLabel(d.amount)+' '+(d.report==='tax'?'on suora verotuottoarvio vuoden 2028 tasossa.':'on koko julkisen talouden vaikutus vuonna '+year+'.'));
      if(d.fundAmount)e.money+=' Tästä valtion, kuntien ja hyvinvointialueiden osuus on '+moneyLabel(d.budgetAmount)+' ja sosiaaliturvarahastojen '+moneyLabel(d.fundAmount)+'.';
      if(d.report==='cut')e.tradeoff='Menokartoituksen arviot eivät sisällä koko talouden kysyntävaikutuksia. Etuuslaskelmissa on huomioitu muita etuuksia ja veroja siinä laajuudessa kuin VM:n rivikuvauksessa kerrotaan.';
    }
    if(d.unit){
      const n=d.id==='income'||d.id==='corporate'?scenario[d.id]:units[d.id];
      if(n!==1){e.money=moneyLabel(d.amount)+' on VM:n yksikköarvio kerrottuna '+n+':lla.';e.caveat='Suuremmalle muutokselle ei ole tässä erillistä tutkimukseen perustuvaa tuottoarviota.';}
    }
    if(d.net){
      const n=d.unit?(d.id==='income'||d.id==='corporate'?scenario[d.id]:units[d.id]):1;
      const range=d.netUpper!==d.amount;
      const estimate=range?moneyLabel(d.amount)+' – '+moneyLabel(d.netUpper):moneyLabel(d.amount);
      const gross=d.net.grossHigh?moneyLabel(d.gross)+' – '+moneyLabel(d.net.grossHigh):moneyLabel(d.gross);
      e.money='Suora verotuotto on '+gross+'. '+(range?(d.net.model?'VM:n arvioista laskettu nettohaarukka on ':'Nettoarvio on ')+estimate+'. Piirakka käyttää alarajaa.':'Piirakkaan lasketaan '+estimate+' nettoa.')+' '+d.net.explanation+' '+(d.research?.fiscal||d.net.limit);
      if(d.scaled&&n>0)e.money+=' Summa on laskettu kertomalla '+moneyLabel(d.net.low)+' nettoyksikköarvio '+n+':lla.';
      e.refs=d.net.source;
      if(d.net.sourceUrl)e.sourceUrl=d.net.sourceUrl;
      if(d.id==='income')e.tradeoff='VM:n laskelmassa työn tarjontajousto on 0,10–0,25. Kulutusvaikutuksessa rajakulutusalttius on 0,9 ja kulutusveroaste 0,17. Oletukset kuvaavat keskimääräistä reaktiota.';
      if(d.id==='corporate')e.tradeoff='Yhteisöveroa maksavat esimerkiksi osakeyhtiöt ja osuuskunnat. Myös säätiö tai yhdistys voi maksaa sitä veronalaisesta elinkeinotulostaan; tämä toimi ei poista yleishyödyllisten yhteisöjen sijoitustulojen verovapauksia. Toiminimen tuloverotus on eri asia.';
      if(d.earliest>year){e.money='Piirakkaan 0 € vuonna '+year+'. Toimi olisi toteutettavissa aikaisintaan vuonna '+d.earliest+'.';e.caveat='';}
      else if(n===0){e.money='Korotusta ei ole valittu. Piirakkaan 0 €.';e.caveat='';}
    }
    if(d.id==='dividends'&&scenario.dividends==='abolish')Object.assign(e,{who:'Listaamattomien yhtiöiden osingonsaajilta, painottuen suurituloisiin.',chain:['Erityishuojennus poistuu','85 % osingosta veronalaista pääomatuloa','Osinkoveron määrä muuttuu'],money:'459 milj. € on arvio verotulojen kasvusta. Osingonjaon muutoksia ei ole huomioitu.',caveat:'',tradeoff:'Laskelmassa vuoden 2021 rekisteriaineisto on ajantasaistettu vuoteen 2024 ja käytössä ovat vuoden 2024 verosäännöt.',refs:d.source,extra:['dividend-response']});
    if(d.conditional==='yle'){
      e.who='Yleisradion ohjelmista, palveluista, henkilöstöstä ja hankinnoista.';
      e.society=d.cutPercent===100?'Ylen julkinen rahoitus päättyisi vuonna 2035. Nykyistä toimintaa ei voisi jatkaa ilman korvaavaa rahoitusta.':'Ohjelmien ja palveluiden tarjonta voi supistua. Yle voi joutua vähentämään henkilöstöä ja ohjelmahankintoja.';
      e.money=conditions.yle==='keep-tax'?'Ylen rahoitus pienenee '+moneyLabel(d.gross)+', mutta Yle-veron tuotto säilyy. Tällä oletuksella summa parantaa julkista taloutta.':'Ylen rahoitus ja Yle-veron tuotto vähenevät kumpikin '+moneyLabel(d.gross)+'. Nettosäästö on 0 €.';
      e.caveat='';
    }
    if(d.conditional==='farm'){
      e.society='Tukien kohdentuminen ruoantuotantoon voisi parantua. Aktiiviviljelijöiden saama hyöty riippuu siitä, jaetaanko vapautuva raha heille.';
      e.money=conditions.farm==='save'?'100 milj. € lasketaan säästöksi vain sillä oletuksella, että tukien kokonaismäärä vähenee saman verran.':'VM siirtäisi vapautuvat tuet aktiiviviljelijöille. Raha käytetään uudelleen: säästöä ei synny.';
    }
    if(d.cashOnly){e.money='Omaisuuden tai rahoitusvarojen siirto voi pienentää lainanoton tarvetta. Sitä ei lasketa tässä pysyväksi alijäämää pienentäväksi säästöksi.';e.caveat='Piirakkaan 0 €.';}
    if(d.research){
      const r=d.research;
      e.society=[r.society||e.society,r.finding].filter(Boolean).join(' ');
      if(!d.net){
        if(d.amount===null)e.money='Tälle toteutukselle ei ole nettoarviota. Toimi ei täytä piirakkaa. '+r.fiscal;
        else if(d.amount===0&&d.report==='cut'&&!d.conditional)e.money=r.fiscal;
        else if(d.revenueEstimate)e.money=r.fiscal;
        else e.money+=' '+r.fiscal;
      }
      e.scope=r.scope;
      if(d.report==='cut')e.tradeoff='';
    }
    if(d.unquantifiedNet){
      e.money='Lähteen suora vaikutus on '+moneyLabel(d.directAmount)+'. '+d.research.fiscal+' Nettoarvion puuttuessa toimi ei kasvata piirakan summaa.';
      e.tradeoff=d.id==='cut-3-62'?'VM arvioi alle 3-vuotiaan varhaiskasvatuksen kustannukseksi noin 21 200 €/vuosi, josta julkinen talous maksaisi 95 %. Päivähoidon käyttö kasvaisi myös osassa perheitä, joissa vanhempi ei työllisty. Kokonaisarvio riippuu näistä kustannuksista, korvaavista etuuksista ja työuravaikutusten kestosta.':'';
    }
    if(d.estimate){
      e.money=d.estimate.money;
      e.tradeoff='';
    }
    if(d.spendingNet){
      e.money='VM:n bruttotyövoimakustannus on '+moneyLabel(d.gross)+'. Piirakkaan '+moneyLabel(d.amount)+(d.netUpper!==d.amount?' (herkkyysväli '+moneyLabel(d.amount)+'–'+moneyLabel(d.netUpper)+')':'')+'. '+d.spendingNet.explanation+' '+d.spendingNet.limit;
      e.refs=d.spendingNet.source;
    }
    if(d.directOnly)e.money='Suora budjettivaikutus on '+moneyLabel(d.amount)+'. '+d.research.fiscal;
    if(d.continuationNote&&year>2031)e.money+=' '+d.continuationNote;
    if(d.horizonEstimate?.longRun)e.money+=' Pitkän aikavälin '+moneyLabel(d.horizonEstimate.amount)+' ('+d.horizonEstimate.when+') näytetään erikseen eikä sitä lisätä piirakkaan. '+(d.horizonEstimate.basis||'');
    if(d.scaleNetOpen){
      e.money='Tämän suuruiselle muutokselle ei ole lähteessä nettoarviota. Yksikköarvion suoraviivaista kertolaskua ei lasketa piirakkaan.';
      e.caveat='Laskuri käyttää enintään kolmen askeleen muutoksille lineaarista herkkyyslaskelmaa. Kolme askelta on laskurin oma käyttöraja, ei tutkimuksessa vahvistettu raja.';
    }else if(d.unit&&d.scaled){
      e.tradeoff+=' Yksikköarvio on kerrottu muutoksen suuruudella. Tämä on oma lineaarinen herkkyyslaskelma, ei tämän suuruiselle muutokselle tehty tutkimusarvio.';
    }
    return e;
  }

  data.forEach(d=>{
    const article=document.createElement('article');
    article.className='sp-action';article.dataset.id=d.id;article.dataset.type=d.type;
    article.innerHTML=`<div class="sp-action-main"><h3><button type="button" class="sp-card-open cursor-interaction" data-open="${d.id}" aria-haspopup="dialog">${esc(d.title)}</button></h3><div class="sp-amount"></div></div>`;
    const controls=document.createElement('div');controls.className='sp-scenario-controls';controls.dataset.controls=d.id;
    article.appendChild(controls);
    list.appendChild(article);
  });
  function stateIn(s){
    const model=s?.modelContent??s;
    packageName=typeof model?.name==='string'?shareTitle(model.name):'';
    const source=Array.isArray(model?.selectedIds)?model.selectedIds:[];
    const legacyYle=source.filter(id=>id==='cut-1-42'||id==='cut-1-43').at(-1);
    scenario.ylePercent=ylePercent(Number.isFinite(model?.yleCutPercent)?model.yleCutPercent:legacyYle==='cut-1-43'?10:20);
    year=2031;includeLater=model?.includeLater===true;
    ['income','corporate'].forEach(id=>{const n=model?.taxIncreasesPP?.[id];scenario[id]=Number.isFinite(n)?Math.min(maxPP,Math.max(0,Math.round(n))):(id==='income'?2:3);});
    Object.keys(units).forEach(id=>{const n=model?.unitSteps?.[id];units[id]=Number.isFinite(n)?Math.min(capFor(id),Math.max(0,Math.round(n))):1;});
    scenario.dividends=model?.dividendMode==='abolish'?'abolish':'vm';
    conditions.yle=model?.fundingChoices?.yle==='keep-tax'?'keep-tax':'reduce-tax';
    conditions.farm=model?.fundingChoices?.farm==='save'?'save':'redirect';
    selected.clear();
    source.flatMap(id=>id==='defence'?['cut-5-49','cut-5-52']:[id==='cut-1-43'?'cut-1-42':id]).forEach(id=>{
      const d=data.find(x=>x.id===id);if(d){d.conflicts.forEach(c=>selected.delete(c));selected.add(id);}
    });
    syncScenario();
    const ui=s?.privateContent;
    // Old snapshots can carry a hidden/stale search across artifact updates.
    // Migrate the catalogue view without changing the user's fiscal package.
    const currentView=ui?.catalogueViewVersion===1;
    sortOrder=ui?.sortOrder==='asc'?'asc':'desc';
    filter=currentView&&['all','cut','tax','selected','selected-cut','selected-tax'].includes(ui?.filter)?ui.filter:'all';
    category=currentView&&payerGroups.some(g=>g.id===ui?.category)?ui.category:'all';
    search=currentView&&typeof ui?.search==='string'?ui.search.slice(0,100):'';
    const orderKey=JSON.stringify([year,includeLater,search,category,filter,sortOrder]);
    if(ui?.catalogueOrderKey===orderKey&&Array.isArray(ui.catalogueOrder)){
      const valid=new Set(data.map(d=>d.id));
      catalogueOrder=[...new Set(ui.catalogueOrder.filter(id=>valid.has(id)))];catalogueOrderKey=orderKey;
    }else if(catalogueOrderKey!==orderKey){catalogueOrder=[];catalogueOrderKey=orderKey;}
    limit=Number.isInteger(ui?.visibleCount)?Math.min(data.length,Math.max(12,ui.visibleCount)):12;
    activeFlow=payerGroups.some(g=>g.id===ui?.activeFlow)?ui.activeFlow:null;
    q('#sp-search').value=search;q('#sp-category').value=category;q('#sp-sort').value=sortOrder;
  }
  function packageModel(){
    return {selectedIds:[...selected],name:packageName,year,includeLater,yleCutPercent:ylePercent(scenario.ylePercent),
      taxIncreasesPP:{income:scenario.income,corporate:scenario.corporate},unitSteps:{...units},dividendMode:scenario.dividends,fundingChoices:{...conditions}};
  }
  function save(){
    const p=packageSession.save({modelContent:packageModel(),privateContent:{catalogueViewVersion:1,filter,category,search,sortOrder,activeFlow,visibleCount:limit,catalogueOrder,catalogueOrderKey}});
    if(p?.catch)p.catch(()=>{});
    // Editing a shared package changes this browser's copy. The original link stays immutable.
    if(packageSession.active)try{history.replaceState(null,'',shareUrl(packageModel(),location.href));}catch{}
  }

  function slice(a,b,outer=148,inner=108){
    if(b<=a)return '';
    const point=(t,r)=>[160+r*Math.sin(t*2*Math.PI),160-r*Math.cos(t*2*Math.PI)];
    if(b-a>=.999999)return `M160 ${160-outer} A${outer} ${outer} 0 1 1 160 ${160+outer} A${outer} ${outer} 0 1 1 160 ${160-outer} L160 ${160-inner} A${inner} ${inner} 0 1 0 160 ${160+inner} A${inner} ${inner} 0 1 0 160 ${160-inner} Z`;
    const p=point(a,outer),e=point(b,outer),i=point(b,inner),j=point(a,inner),large=b-a>.5?1:0;
    return `M${p} A${outer} ${outer} 0 ${large} 1 ${e} L${i} A${inner} ${inner} 0 ${large} 0 ${j} Z`;
  }
  function ringLayout(chosen,sum,thickness){
    const small=chosen.filter(d=>Math.abs(valueOf(d))>0&&Math.abs(valueOf(d))<100);
    const segments=chosen.filter(d=>!small.includes(d));
    if(small.length)segments.push({id:'small-actions',amount:small.reduce((n,d)=>n+valueOf(d),0)});
    const positive=segments.reduce((n,d)=>n+Math.max(0,valueOf(d)),0);
    const net=Math.max(0,sum),count=Math.max(1,Math.ceil(net/target)),inner=108;
    const widthFor=d=>{const ratio=Math.max(0,valueOf(d))/(target/4);return 8+(thickness-8)*(ratio<=1?Math.pow(ratio,.65):ratio);};
    const normalWidths=segments.filter(d=>d.id!=='small-actions'&&valueOf(d)>0).map(widthFor);
    const smallWidth=2*(normalWidths.length?Math.max(...normalWidths):thickness);
    const rings=Array.from({length:count},()=>({inner}));
    const parts=[];let offset=0;
    for(const d of segments){
      let remaining=positive?Math.max(0,valueOf(d))*net/positive:0;
      while(remaining>1e-8){
        const ring=Math.min(count-1,Math.floor((offset+1e-8)/target));
        const start=Math.max(0,(offset-ring*target)/target);
        const amount=Math.min(remaining,Math.max(0,target*(1-start)));
        if(amount<1e-8)break;
        const width=d.id==='small-actions'?smallWidth:widthFor(d);
        parts.push({id:d.id,ring,start,end:Math.min(1,start+amount/target),amount,inner:rings[ring].inner,outer:rings[ring].inner+width});
        offset+=amount;remaining-=amount;
      }
    }
    let nextInner=inner;
    for(const [i,ring] of rings.entries()){
      ring.inner=nextInner;
      const pieces=parts.filter(p=>p.ring===i);
      const capacity=Math.max(10,...pieces.map(p=>p.outer-p.inner));
      for(const part of pieces){const width=part.outer-part.inner;part.inner=ring.inner;part.outer=ring.inner+width;}
      nextInner+=capacity+8;
    }
    return {rings,parts,small,inner,thickness,extent:nextInner+24};
  }
  function piePresentation(chosen,sum,thickness,flow){
    const chart=ringLayout(chosen,sum,thickness);
    const focused=!!flow&&chosen.some(d=>d.flow===flow&&valueOf(d)!==0);
    const byId=new Map(chosen.map(d=>[d.id,d]));
    const smallPositive=chart.small.filter(d=>valueOf(d)>0);
    const smallTotal=smallPositive.reduce((n,d)=>n+valueOf(d),0);
    const selectedSmall=smallPositive.filter(d=>d.flow===flow);
    const share=smallTotal?selectedSmall.reduce((n,d)=>n+valueOf(d),0)/smallTotal:0;
    const parts=chart.parts.flatMap(part=>{
      if(part.id!=='small-actions')return [{...part,items:[byId.get(part.id)],highlighted:focused&&byId.get(part.id).flow===flow,key:part.id+':'+part.ring}];
      // The purple group stays in its original angular span. Only the chosen
      // group's share changes colour; unrelated small actions stay purple.
      const groups=focused&&share>0&&share<1?[
        {start:part.start,end:part.start+(part.end-part.start)*share,items:selectedSmall,highlighted:true,suffix:':focus'},
        {start:part.start+(part.end-part.start)*share,end:part.end,items:chart.small.filter(d=>d.flow!==flow),highlighted:false,suffix:':rest'}
      ]:[{start:part.start,end:part.end,items:chart.small,highlighted:focused&&share===1,suffix:''}];
      return groups.map(g=>({...part,...g,amount:(g.end-g.start)*target,key:part.id+':'+part.ring+g.suffix}));
    });
    const highlightedWidth=part=>Math.max(36,(part.outer-part.inner)*(part.id==='small-actions'?1.15:1.7));
    const widths=parts.map(part=>focused?(part.highlighted?highlightedWidth(part):Math.max(3,(part.outer-part.inner)*.25)):part.outer-part.inner);
    // Keep only an 8-unit gap after the actual slices. Move outer rings when
    // highlighting needs more room.
    const capacities=chart.rings.map((_,i)=>Math.max(10,...parts.flatMap((p,j)=>p.ring===i?[p.outer-p.inner,widths[j]]:[])));
    const arrange=capacities=>{let inner=chart.inner;return capacities.map(capacity=>{const ring={inner};inner+=capacity+8;return ring;});};
    const rings=arrange(capacities);
    for(const [index,part] of parts.entries()){
      const normalWidth=part.outer-part.inner;
      part.inner=rings[part.ring].inner;
      part.normalInner=part.inner;part.normalOuter=part.inner+normalWidth;
      part.outer=part.inner+widths[index];
      part.kind=part.highlighted?'focus':part.id==='small-actions'?'small':part.items[0].type;
      part.dimmed=focused&&!part.highlighted;
    }
    return {...chart,parts,rings,focused,extent:rings.at(-1).inner+capacities.at(-1)+32};
  }
  function smallSliceLabel(chart,sum){
    const amount=chart.parts.filter(p=>p.id==='small-actions').reduce((n,p)=>n+p.amount,0);
    if(amount<=0||sum<=0)return '';
    const percent=amount/sum*100;
    return 'Muut '+percent.toLocaleString('fi-FI',percent<.1?{maximumSignificantDigits:2}:{maximumFractionDigits:1})+' %';
  }
  function pieViewport(chart){
    let left=160,right=160,top=160,bottom=160;
    const include=(x,y)=>{left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);};
    const rings=chart.rings;
    for(const ring of rings){const r=ring.inner+10;include(160-r,160-r);include(160+r,160+r);}
    if(chart.small.some(d=>valueOf(d)<0)&&!chart.parts.some(p=>p.id==='small-actions')){
      const r=rings.at(-1).inner+chart.thickness;
      include(160-r,160-r);include(160+r,160+r);
    }
    for(const part of chart.parts){
      const inner=part.inner,outer=part.outer+3;
      const angles=[part.start,part.end];
      for(let quarter=Math.ceil(part.start*4);quarter<=Math.floor(part.end*4);quarter++)angles.push(quarter/4);
      for(const t of angles)for(const r of [inner,outer])include(160+r*Math.sin(t*2*Math.PI),160-r*Math.cos(t*2*Math.PI));
    }
    // Fit only visible geometry, with a narrow margin for strokes and labels.
    const padding=12,width=right-left+padding*2,height=bottom-top+padding*2;
    return {x:left-padding,y:top-padding,width,height};
  }
  function fitPieViewport(view,aspect){
    // Keep the card's height stable while focus changes the drawing's bounds.
    const width=Math.max(view.width,view.height*aspect),height=width/aspect;
    return {x:view.x-(width-view.width)/2,y:view.y-(height-view.height)/2,width,height};
  }
  function pieTweenParts(previous,parts){
    // Partition only at existing angular boundaries. A mixed Muut slice can
    // split or merge without moving its money share around during the tween.
    return parts.flatMap(part=>{
      const matches=previous.filter(p=>p.id===part.id&&p.ring===part.ring&&p.end>part.start&&p.start<part.end);
      const edges=[...new Set([part.start,part.end,...matches.flatMap(p=>[Math.max(part.start,p.start),Math.min(part.end,p.end)])])].sort((a,b)=>a-b);
      return edges.slice(0,-1).map((start,i)=>{
        const end=edges[i+1],mid=(start+end)/2,from=matches.find(p=>p.start<=mid&&p.end>=mid);
        return {...part,start,end,amount:(end-start)*target,key:part.key+'@'+i,from:from||{inner:part.normalInner,outer:part.normalOuter,opacity:1,strokeWidth:part.id==='small-actions'?1:4}};
      });
    });
  }
  const payerGroups=[
    {id:'consumption',name:'Kuluttajat',type:'tax'},
    {id:'earned',name:'Ansiotulot, myös eläkkeet',type:'tax'},
    {id:'capital',name:'Varallisuus ja pääomatulot',type:'tax'},
    {id:'companies',name:'Yritykset ja yhteisöt',type:'tax'},
    {id:'investors',name:'Rahastot ja säätiöt',type:'tax'},
    {id:'support',name:'Perusturva ja asumistuet',type:'cut'},
    {id:'pension',name:'Erilliset eläketoimet',type:'cut'},
    {id:'students',name:'Opiskelun tuet ja maksut',type:'cut'},
    {id:'families',name:'Perheiden tuet ja maksut',type:'cut'},
    {id:'employees',name:'Julkisen alan palkat ja työ',type:'cut'},
    {id:'research',name:'Korkeakoulut ja tutkimus',type:'cut'},
    {id:'nonprofits',name:'Järjestöt, säätiöt ja Yle',type:'cut'},
    {id:'services',name:'Palvelut ja hankinnat',type:'cut'},
    {id:'abroad',name:'Ulkomaille ja pakolaisille',type:'cut'}
  ];
  payerGroups.forEach(g=>g.ids=data.filter(d=>d.flow===g.id).map(d=>d.id));
  const moneyLabel=n=>n===null||n===undefined?'Ei arviota':n===0?'0 €':Math.abs(n)>=1000?format(n)+' mrd. €':n.toLocaleString('fi-FI',Math.abs(n)<.1?{maximumSignificantDigits:2}:{maximumFractionDigits:1})+' milj. €';
  const payerMoneyLabel=n=>Number.isFinite(n)?n.toLocaleString('fi-FI',n!==0&&Math.abs(n)<.1?{maximumSignificantDigits:2}:{maximumFractionDigits:1})+' milj. €':'Ei arviota';
  const valueOf=d=>Number.isFinite(d.amount)?d.amount:0;
  function cardAmountDisplay(d){
    const rangeLabel=range=>range.map(n=>payerMoneyLabel(n).replace(' milj. €','')).join('–')+' milj. €';
    const validRange=range=>range?.length===2&&range.every(Number.isFinite);
    const excluded=!Number.isFinite(d.amount);
    if(excluded){
      const reference=d.estimate?.sensitivity?.find(row=>row.label==='2031');
      if(validRange(reference?.range))return {text:rangeLabel(reference.range),excluded,hasAmount:true};
      // Only an explicitly reviewed reference is eligible. A tax expenditure,
      // partial cost or unsupported scaled gross value is not a revenue estimate.
      if(Number.isFinite(d.referenceEstimate?.amount))return {text:payerMoneyLabel(d.referenceEstimate.amount),excluded,hasAmount:true};
      return {text:'Tuotto avoin',excluded,hasAmount:false};
    }
    const future=d.laterApplied||d.amount>=0&&d.amount<20&&d.horizonEstimate?.amount>d.amount;
    const amount=validRange(d.estimate?.range)?rangeLabel(d.estimate.range):payerMoneyLabel(d.amount);
    return {text:amount+(future?' *':''),excluded,hasAmount:true};
  }
  function payerDisplay(actions){
    const actual=actions.some(d=>Number.isFinite(d.amount))?actions.reduce((n,d)=>n+valueOf(d),0):null;
    const deferred=actual===0?actions.filter(d=>d.horizonEstimate&&!d.laterApplied):[];
    const amount=deferred.length?deferred.reduce((n,d)=>n+d.horizonEstimate.amount,0):actual;
    const dates=[...new Set([...actions.filter(d=>d.laterApplied),...deferred].map(d=>d.horizonEstimate.when))].sort((a,b)=>(parseInt(a,10)||0)-(parseInt(b,10)||0));
    return {amount,dates,marked:dates.length>0};
  }
  function payerAmountMarkup(display){
    return esc(payerMoneyLabel(display.amount)).replace('milj. €','<small>milj. €</small>')+(display.marked?'<sup>*</sup>':'');
  }
  function payerYearMarkup(display){return display.marked?'<small class="sp-flow-year">* '+esc(display.dates.join(' · '))+'</small>':'';}
  function amountFootnote(d){
    if(d.estimate)return d.estimate.footnote||'';
    if(d.referenceEstimate?.kind==='static')return payerMoneyLabel(d.referenceEstimate.amount)+' on staattinen viiteluku. Nettotuottoa ei ole arvioitu euroina, eikä viitelukua lasketa piirakkaan.';
    if(d.fundingCut&&d.scaled&&d.amount>0)return d.laterApplied?'Oma laskelma · '+d.horizonEstimate.when+'.':d.amount<20?'Oma laskelma: '+moneyLabel(d.budget[7])+'/vuosi vuonna 2035.':'Oma laskelma VM:n rahoituspohjasta.';
    if(d.laterApplied)return 'VM:n vuosiarvio: '+[d.horizonEstimate.precision,moneyLabel(d.amount),d.horizonEstimate.when].filter(Boolean).join(' ')+'.';
    if(!Number.isFinite(d.amount)||d.amount>=20||d.amount<0)return '';
    if(d.amount===0){
      if(d.unit&&(d.id==='income'||d.id==='corporate'?scenario[d.id]:units[d.id])===0)return 'Muutoksen suuruudeksi on valittu 0.';
      if(d.conditional==='yle'&&conditions.yle!=='keep-tax')return 'Yle-veroa alennetaan yhtä paljon kuin Ylen rahoitusta leikataan.';
      if(d.conditional==='farm'&&conditions.farm!=='save')return 'Sama tukiraha jaetaan uudelleen aktiiviviljelijöille.';
      if(d.earliest>year)return 'Verotuottoa aikaisintaan vuodesta '+d.earliest+'.';
      if(d.zeroNote)return d.zeroNote;
    }
    if(d.longRunEstimate){
      const e=d.longRunEstimate;
      return 'VM:n arvio: '+e.precision+' '+moneyLabel(e.million)+'/vuosi '+e.when+'.';
    }
    if(d.report==='cut'){
      const estimates=d.budget.map((b,i)=>({year:2028+i,amount:Number.isFinite(b)||Number.isFinite(d.funds[i])?(b??0)+(d.funds[i]??0):null})).filter(e=>e.amount>=20);
      const future=estimates.filter(e=>e.year>year);
      // Use a reported annual estimate, never an accumulated sum or an
      // extrapolation beyond the source. Prefer a later year's largest value.
      const reference=(future.length?future:estimates).sort((a,b)=>b.amount-a.amount||a.year-b.year)[0];
      if(reference)return 'VM:n arvio: '+moneyLabel(reference.amount)+'/vuosi vuonna '+reference.year+'.';
    }
    return d.amount===0?'VM:n taulukossa vuodelle '+year+' on merkitty 0 €.':'';
  }
  function actionAmountMarkup(d){
    return esc(cardAmountDisplay(d).text).replace(' *','<sup aria-hidden="true">*</sup>');
  }
  q('#sp-category').insertAdjacentHTML('beforeend',payerGroups.map(g=>`<option value="${g.id}">${g.name}</option>`).join(''));
  q('.sp-list-label').insertAdjacentHTML('afterend','<nav class="sp-bookmarks" aria-label="Paketin valitut toimet"><button type="button" class="sp-bookmark cursor-interaction" data-bookmark="cut" aria-pressed="false" aria-label="Valitut menoleikkaukset" data-tooltip="Valitut menoleikkaukset"><span class="sp-bookmark-flag"><strong>0</strong></span></button><button type="button" class="sp-bookmark cursor-interaction" data-bookmark="tax" aria-pressed="false" aria-label="Valitut verot ja maksut" data-tooltip="Valitut verot ja maksut"><span class="sp-bookmark-flag"><strong>0</strong></span></button></nav>');
  q('[data-filter="all"]').textContent='Kaikki uudet';

  payerGroups.forEach(group=>{
    const button=document.createElement('button');button.type='button';button.className='sp-flow-source cursor-interaction';button.dataset.flow=group.id;button.setAttribute('aria-controls','sp-flow-detail');q('.sp-flow-labels').appendChild(button);
  });
  function drawFlows(chosen){
    const shownGroups=payerGroups.filter(group=>chosen.some(d=>d.flow===group.id));
    payerGroups.forEach(group=>{
      const button=q(`[data-flow="${group.id}"]`);
      button.hidden=!shownGroups.includes(group);
      if(button.hidden)button.setAttribute('aria-expanded','false');
    });
    if(!shownGroups.some(group=>group.id===activeFlow))activeFlow=null;
    const graph=q('.sp-flow-graph'),empty=shownGroups.length===0;
    graph.hidden=empty;
    q('.sp-flow-empty').hidden=!empty;
    if(empty){q('.sp-flow-svg').replaceChildren();q('.sp-flow-destination strong').textContent='';graph.style.height='0px';return;}
    const width=Math.max(230,graph.clientWidth);
    const displays=shownGroups.map(g=>payerDisplay(chosen.filter(d=>g.ids.includes(d.id))));
    let nextRow=80;const rows=displays.map(display=>{const y=nextRow;nextRow+=display.marked?94:68;return y;});
    const height=nextRow+30,centerY=(rows[0]+rows.at(-1))/2;
    graph.style.height=height+'px';
    const labelWidth=Math.min(150,Math.round(width*.43)),startX=labelWidth+8,endX=width-14;
    const values=shownGroups.map(g=>chosen.filter(d=>g.ids.includes(d.id)).reduce((sum,d)=>sum+valueOf(d),0));
    const total=values.reduce((sum,n)=>sum+Math.max(0,n),0);
    const maxSource=Math.max(4330,...values.map(Math.abs));
    const scale=Math.min(52/maxSource,(height-120)/Math.max(1,total)),totalHeight=total*scale,startY=centerY-totalHeight/2;
    const svg=q('.sp-flow-svg');svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    svg.setAttribute('aria-label',`Valittujen toimien rahavirrat: ${shownGroups.map((g,i)=>g.name+' '+payerMoneyLabel(displays[i].amount)+(displays[i].marked?', arvio '+displays[i].dates.join(', '):'')).join('; ')}. Piirakassa yhteensä ${payerMoneyLabel(values.reduce((a,b)=>a+b,0))}.`);
    let offset=startY;
    const shapes=[];
    shownGroups.forEach((group,i)=>{
      const value=values[i],h=Math.max(0,value)*scale,y=rows[i],display=displays[i];
      const control1=startX+(endX-startX)*.48,control2=startX+(endX-startX)*.52;
      if(value>0){
        const parts=['cut','tax'].map(type=>({type,amount:chosen.filter(d=>d.flow===group.id&&d.type===type).reduce((n,d)=>n+Math.max(0,valueOf(d)),0)}));
        const positive=parts.reduce((n,p)=>n+p.amount,0);let within=0;
        parts.forEach(part=>{if(!part.amount)return;const ph=h*part.amount/positive,top=y-h/2+within,bottom=top+ph,dy=offset+within,color='var(--sp-'+part.type+')';
          shapes.push(`<path data-fiscal-type="${part.type}" d="M${startX} ${top} C${control1} ${top} ${control2} ${dy} ${endX} ${dy} L${endX} ${dy+ph} C${control2} ${dy+ph} ${control1} ${bottom} ${startX} ${bottom} Z" fill="${color}" opacity="${activeFlow===group.id?'.65':'.3'}" data-tooltip="${group.name}: ${payerMoneyLabel(value)}"></path><rect x="${startX-5}" y="${top}" width="5" height="${ph}" fill="${color}"></rect><rect x="${endX}" y="${dy}" width="12" height="${ph}" fill="${color}"></rect>`);within+=ph;});
        offset+=h;
      }else if(value<0){
        shapes.push(`<path d="M${endX} ${y} H${startX}" stroke="var(--sp-cut)" stroke-width="${Math.max(2,Math.abs(value)*scale)}" opacity=".4" fill="none"></path><path d="M${startX+8} ${y-5} L${startX} ${y} L${startX+8} ${y+5}" stroke="var(--sp-cut)" stroke-width="2" fill="none"></path>`);
      }else{
        shapes.push(`<path d="M${startX-5} ${y} H${startX+19}" stroke="var(--sp-muted)" stroke-width="1.5" stroke-dasharray="3 4" fill="none"></path><circle cx="${startX+23}" cy="${y}" r="3" fill="var(--sp-track)"></circle>`);
      }
      const button=q(`[data-flow="${group.id}"]`);button.style.width=labelWidth+'px';button.style.top=(y-30)+'px';button.dataset.zero=String(!display.amount);button.setAttribute('aria-expanded',String(activeFlow===group.id));button.setAttribute('aria-label',`${group.name}: ${payerMoneyLabel(display.amount)}${display.marked?', arvio '+display.dates.join(', '):''}. Näytä toimet ja vaihtoehdot.`);
      button.innerHTML=`<span class="sp-flow-name">${group.name}</span><span class="sp-flow-money">${payerAmountMarkup(display)}</span>${payerYearMarkup(display)}`;
    });
    svg.innerHTML=shapes.join('');
    q('.sp-flow-destination').style.top=Math.max(4,(total?startY:centerY-20)-49)+'px';
    const net=values.reduce((a,b)=>a+b,0);
    q('.sp-flow-destination strong').innerHTML=payerAmountMarkup({amount:net});
  }
  function renderFlowDetail(chosen){
    const detail=q('.sp-flow-detail');detail.hidden=!activeFlow;if(!activeFlow)return;
    const group=payerGroups.find(g=>g.id===activeFlow);if(!group)return;
    const actions=chosen.filter(d=>d.flow===group.id),display=payerDisplay(actions);
    detail.innerHTML=`<div class="sp-flow-detail-head"><h3>${group.name} · ${payerAmountMarkup(display)}${payerYearMarkup(display)}</h3><button type="button" class="sp-flow-close cursor-interaction" aria-label="Sulje rahanlähteen tiedot">×</button></div>${actions.map(d=>{const item=payerDisplay([d]);return `<div class="sp-service-line"><button type="button" class="cursor-interaction" data-open="${d.id}">${esc(d.short)} ↗</button><span>${payerAmountMarkup(item)}${payerYearMarkup(item)}</span></div>`;}).join('')}<button type="button" class="sp-text-button cursor-interaction" data-category="${group.id}">Muut toimet ↓</button>`;
  }

  /*INCIDENCE_VIEW*/
  function positionDialog(){
    const panel=dialog;
    if(!panel.open||modalShred.running)return;
    const rootTop=root.getBoundingClientRect().top;
    const frame=visibleFrame||{top:Math.max(0,-rootTop),height:window.innerHeight};
    panel.style.maxHeight=Math.max(120,frame.height-24)+'px';
    const top=frame.top+Math.max(12,(frame.height-panel.offsetHeight)/2);
    panel.style.top=top+'px';panel.style.left='50%';panel.style.transform='translateX(-50%)';
  }
  function renderZoom(){
    const chosen=data.filter(d=>selected.has(d.id));
    const small=chosen.filter(d=>Math.abs(valueOf(d))>0&&Math.abs(valueOf(d))<100),large=chosen.filter(d=>!small.includes(d)).sort((a,b)=>valueOf(b)-valueOf(a));
    const rows=(actions,grouped=false)=>actions.map(d=>'<button type="button" class="sp-zoom-action cursor-interaction" data-open="'+d.id+'" data-pie-focus="'+(d.flow===activeFlow)+'"><span class="sp-dot '+(grouped?'small':d.type==='cut'?'cut':'')+'"></span><span>'+esc(d.short)+'</span><strong>'+moneyLabel(d.amount)+'</strong></button>').join('');
    q('.sp-zoom-list').innerHTML=rows(large)+(small.length?'<details open class="sp-zoom-small"><summary class="cursor-interaction"><span class="sp-dot small"></span>Pienet toimet <strong>'+moneyLabel(small.reduce((n,d)=>n+valueOf(d),0))+'</strong></summary>'+rows(small,true)+'</details>':'');
  }
  function togglePie(){
    pieAnimations.forEach(a=>a.cancel());
    const moving=[...q('.sp-workspace').children,q('.sp-footer')];
    const before=moving.map(el=>el.getBoundingClientRect());
    pieExpanded=!pieExpanded;
    root.classList.toggle('sp-budget-expanded',pieExpanded);
    q('.sp-zoom-list').hidden=!pieExpanded;
    const button=q('.sp-zoom-open'),label=pieExpanded?'Pienennä piirakka':'Suurenna piirakka';
    button.setAttribute('aria-expanded',String(pieExpanded));button.setAttribute('aria-label',label);button.dataset.tooltip=label;
    button.innerHTML=zoomIcon(pieExpanded);
    if(pieExpanded)renderZoom();
    const after=moving.map(el=>el.getBoundingClientRect());
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      pieAnimations=moving.map((el,i)=>{
        const a=before[i],b=after[i];if(!a.width||!b.width||!a.height||!b.height)return null;
        return el.animate([{transform:`translate(${a.left-b.left}px,${a.top-b.top}px) scale(${a.width/b.width},${a.height/b.height})`},{transform:'none'}],{duration:380,easing:'cubic-bezier(.2,.7,.2,1)'});
      }).filter(Boolean);
    }
    measureViewport();
  }
  function renderImpact(id){
    const d=data.find(x=>x.id===id);if(!d)return;
    const e=effectFor(d);
    q('#sp-impact-title').textContent=d.title;
    q('.sp-impact-amount').innerHTML=actionAmountMarkup(d)+(Number.isFinite(d.amount)?' / vuosi':'');
    const amountNote=amountFootnote(d);
    q('.sp-impact-amount-note').textContent=amountNote?(cardAmountDisplay(d).text.endsWith(' *')?'* ':'')+amountNote:'';
    q('.sp-impact-amount-note').hidden=!amountNote;
    q('.sp-impact-basis').textContent=d.year;
    q('.sp-modal-controls').innerHTML=controlsMarkup(id,'modal');
    q('#sp-impact-who').textContent=e.who;
    q('.sp-benefit-concentration').hidden=id!=='dividends';
    if(id==='dividends'){
      const abolished=scenario.dividends==='abolish',share=abolished?83:71;
      q('#sp-benefit-title').textContent=abolished?'Tämän vaihtoehdon veronkorotus kohdistuu suurituloisiin':'Nykyinen veroetu kasautuu suurituloisille';
      root.querySelectorAll('.sp-benefit-row').forEach((row,i)=>{const n=i===0?share:100-share;row.querySelector('strong').textContent=n+' %';row.querySelector('.sp-benefit-track span').style.width=n+'%';});
      q('#sp-benefit-source').innerHTML=abolished?'Osuus verojen lisäyksestä kotitalouksille · vuoden 2024 laskelma. <a href="'+dividendStudyUrl+'" target="_blank" rel="noopener noreferrer">Labore / Finér 2024, s. 34 ↗</a>':'Osuus huojennettujen osinkojen verovapaista euroista vuonna 2020, pyöristettynä. <a href="'+evidence['dividend-distribution'].url+'" target="_blank" rel="noopener noreferrer">Finnwatch 2022 · Verohallinnon tilastot ↗</a>';
    }
    q('.sp-chain').hidden=!e.chain.length;q('.sp-chain').innerHTML=e.chain.map(text=>`<li>${esc(text)}</li>`).join('');
    q('.sp-impact-society').textContent=e.society;
    q('.sp-impact-money').textContent=e.money;
    q('.sp-impact-uncertainty').textContent=e.caveat;
    q('.sp-impact-uncertainty').hidden=!e.caveat;
    const hasAnnuals=d.report==='cut'&&[...d.budget,...d.funds].some(Number.isFinite);
    let notes=q('.sp-source-notes');if(!notes){notes=document.createElement('details');notes.className='sp-source-notes';q('.sp-impact-tradeoff').before(notes);notes.addEventListener('toggle',positionDialog);}
    notes.hidden=!hasAnnuals;notes.open=false;
    notes.innerHTML=hasAnnuals?'<summary class="cursor-interaction">VM:n arviot vuosittain</summary><table class="sp-annuals"><thead><tr><th>Vuosi</th><th>Julkinen talous</th><th>Valtio, kunnat, alueet</th><th>Sosiaali­turva­rahastot</th></tr></thead><tbody>'+d.budget.map((v,i)=>'<tr><td>'+(2028+i)+'</td><td>'+moneyLabel(Number.isFinite(v)||Number.isFinite(d.funds[i])?(v??0)+(d.funds[i]??0):null)+'</td><td>'+moneyLabel(v)+'</td><td>'+moneyLabel(d.funds[i])+'</td></tr>').join('')+'</tbody></table>':'';
    if(hasAnnuals&&(d.conditional||d.cashOnly||d.net||d.revenueEstimate))notes.innerHTML+='<p>Taulukossa ovat VM:n alkuperäiset luvut ennen yllä kuvattua netto- tai rahoitusoikaisua.</p>';
    if(hasAnnuals&&d.unquantifiedNet)notes.innerHTML+='<p>Taulukko sisältää suorat vaikutukset. Työllisyyden ja muiden käyttäytymismuutosten vaikutukset eivät sisälly näihin lukuihin.</p>';
    if(d.spendingNet)notes.innerHTML=notes.innerHTML.replace('Julkinen talous','VM:n brutto yhteensä')+'<p>'+esc(d.spendingNet.explanation)+' '+esc(d.spendingNet.limit)+'</p>';
    if(d.directOnly)notes.innerHTML=notes.innerHTML.replace('Julkinen talous','Suora vaikutus');
    if(d.continuationNote)notes.innerHTML+='<p>'+esc(d.continuationNote)+'</p>';
    if(d.longRunEstimate)notes.innerHTML+='<p>'+esc(d.longRunEstimate.source)+'. '+esc(d.longRunEstimate.basis||'')+' Pitkän aikavälin lukua ei lisätä kummankaan näkymän piirakkaan.</p>';
    if(d.net?.calculation){
      const n=d.unit?(d.id==='income'||d.id==='corporate'?scenario[d.id]:units[d.id]):1;
      notes.hidden=false;
      notes.innerHTML='<summary class="cursor-interaction">Miten netto on laskettu?</summary><p>'+esc(d.net.calculation)+'</p>';
      if(Number.isFinite(d.net.indexAdjusted))notes.innerHTML+='<p>VM:n liitteessä tuotto pelkkien etuusindeksien jälkeen: '+moneyLabel(d.net.indexAdjusted*n)+(d.scaled?' (yksikköarvio × '+n+')':'')+'. Ostovoiman vaikutusta ei ole vähennetty tästä vertailuluvusta.</p>';
      if(d.net.limit!==d.research?.fiscal)notes.innerHTML+='<p>'+esc(d.net.limit)+'</p>';
    }
    if(d.fundingCut){
      const settings=d.fundingCut;
      notes.hidden=false;
      notes.innerHTML='<summary class="cursor-interaction">Leikkauksen laskenta</summary><p>VM:n lähtötaso on 593,7 milj. €/vuosi. Rahoitusta vähennetään asteittain vuosina 2028–2035. Valittu '+d.cutPercent+' % on koko vähennys vuonna 2035, ei joka vuosi toistuva prosenttileikkaus.</p><p>'+(d.scaled?'Tämä on oma laskelma: 593,7 milj. € × '+d.cutPercent+' / 100 × (vuosi − 2027) / 8. Summat pyöristetään 0,1 miljoonaan euroon.':'Valitun '+d.cutPercent+' prosentin vuosisarja tulee suoraan VM:n Excel-liitteestä.')+' VM on laskenut 10 ja 20 prosentin vaihtoehdot; muut prosentit ovat saman rahoituspohjan laskennallisia muutoksia. Kustannustason kasvua tai toiminnan supistamisen ja lopettamisen kuluja ei ole arvioitu.</p><table class="sp-annuals"><thead><tr><th>Vuosi</th><th>Valittu '+d.cutPercent+' %</th><th>VM 10 %</th><th>VM 20 %</th></tr></thead><tbody>'+d.budget.map((v,i)=>'<tr><td>'+(2028+i)+'</td><td>'+moneyLabel(v)+'</td><td>'+moneyLabel(settings.vmVariants[10][i])+'</td><td>'+moneyLabel(settings.vmVariants[20][i])+'</td></tr>').join('')+'</tbody></table><p>Taulukko näyttää rahoituksen vähennyksen. Julkisen talouden säästö riippuu myös yllä valitusta Yle-veron ratkaisusta. Prosenttiosuus ei kerro, mitkä ohjelmat tai palvelut loppuisivat.</p>';
    }
    if(d.estimate){
      notes.hidden=false;
      notes.innerHTML='<summary class="cursor-interaction">Miten tuotto on laskettu?</summary>'+d.estimate.calculation.map(text=>'<p>'+esc(text)+'</p>').join('')+(d.estimate.sensitivity?'<table class="sp-estimate-years"><caption>Sama sijoituskanta myöhemmin</caption><thead><tr><th>Vuosi</th><th>Netto, milj. €</th></tr></thead><tbody>'+d.estimate.sensitivity.map(row=>'<tr><th scope="row">'+esc(row.label)+'</th><td>'+row.range.map(n=>esc(n.toLocaleString('fi-FI'))).join(' … ')+'</td></tr>').join('')+'</tbody></table>':'');
    }
    let incomeNotes=q('.sp-income-source-notes');
    if(!incomeNotes){incomeNotes=document.createElement('details');incomeNotes.className='sp-source-notes sp-income-source-notes';notes.after(incomeNotes);incomeNotes.addEventListener('toggle',positionDialog);}
    const incomeSpec=incidenceModel.actions[d.id];
    incomeNotes.hidden=!incomeSpec?.calculation;incomeNotes.open=false;
    incomeNotes.innerHTML=incomeSpec?.calculation?'<summary class="cursor-interaction">Miten tuloryhmäarvio on laskettu?</summary><p>'+esc(incomeSpec.method)+'</p>'+incomeSpec.calculation.map(text=>'<p>'+esc(text)+'</p>').join('')+'<p>'+esc(incomeSpec.note)+'</p>':'';
    q('.sp-impact-tradeoff').textContent=e.tradeoff;
    q('.sp-impact-tradeoff').hidden=!e.tradeoff;
    q('.sp-impact-sources > summary').textContent='Lähteet ja laskentatapa';
    const links=[{url:e.sourceUrl||d.sourceUrl||urls[d.report],label:e.refs},...e.extra.map(key=>evidence[key]),...(d.research?.sources||[]).map(key=>researchSources[key])];
    if(d.report==='cut')links.splice(1,0,{url:urls.cut,label:d.memo&&d.memo!=='Ei taustamuistiota'?'VM 2026:44 · muistio: '+d.memo:'VM 2026:44 · menokartoitus'});
    const seenUrls=new Set();
    q('.sp-impact-links').innerHTML=(e.scope?'<p class="sp-research-scope">'+esc(e.scope)+'</p>':'')+links.filter(s=>{if(seenUrls.has(s.url))return false;seenUrls.add(s.url);return true;}).map(sourceMarkup).join('');
    const conflicts=conflictsFor(d);let warning=q('.sp-overlap');if(!warning){warning=document.createElement('p');warning.className='sp-overlap';q('.sp-impact-sources').before(warning);}
    const possible=possibleOverlapsFor(d);
    const replacement=!selected.has(id)&&conflicts.length?'Korvaa paketissa: '+conflicts.map(x=>x.title).join('; ')+'. Näiden arvioissa on samoja menoja tai veropohjaa. ':'';
    warning.textContent=replacement+possible.map(o=>'Päällekkäisyys: '+data.find(x=>x.id===o.id).title+'. '+o.note).join(' ');
    warning.hidden=!warning.textContent;
    q('.sp-confirm-label').textContent=selected.has(id)?'Poista paketista':'Silppuriin!';
    q('.sp-confirm-icon').hidden=selected.has(id);
    q('.sp-modal-confirm').disabled=false;
  }
  function openImpact(id,button){
    if(!data.some(d=>d.id===id))return;
    activeAction=id;opener=button;renderImpact(id);
    q('.sp-impact-sources').open=false;
    dialog.setAttribute('open','');q('.sp-modal-mask').hidden=false;
    [...root.children].forEach(el=>{if(el!==dialog&&!el.classList.contains('sp-modal-mask'))el.inert=true;});
    q('.sp-modal-body').scrollTop=0;positionDialog();measureViewport();q('.sp-modal-close').focus({preventScroll:true});
  }
  function closeImpact(){if(modalShred.running){modalShred.finish();return;}const previous=activeAction;dialog.removeAttribute('open');q('.sp-modal-mask').hidden=true;[...root.children].forEach(el=>{el.inert=false;});root.style.minHeight='';activeAction=null;const replacement=previous?list.querySelector(`[data-open="${previous}"]`):null;const flowTarget=activeFlow?q(`[data-flow="${activeFlow}"]`):null;const focus=opener?.isConnected&&opener.getClientRects().length?opener:flowTarget|| (replacement?.getClientRects().length?replacement:q('[data-filter="all"]'));focus.focus({preventScroll:true});}
  let finishPacking=null;
  let packingWidth=0;
  function packSelectedCard(d){
    const card=list.querySelector(`[data-id="${d.id}"]`),bookmark=q(`[data-bookmark="${d.type}"]`),flag=bookmark.querySelector('.sp-bookmark-flag');
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(reduced||!card?.getClientRects().length||!card.animate){render(true);save();return;}
    let done=false,flight=null;
    const finish=(landed=false)=>{
      if(done)return;done=true;finishPacking=null;packingWidth=0;
      flight?.cancel();card.inert=false;card.classList.remove('sp-packing');
      render(true);save();
      if(landed)flag.animate([{transform:'scale(1)'},{transform:'scale(1.16)',offset:.45},{transform:'scale(1)'}],{duration:230,easing:'ease-out'});
    };
    finishPacking=()=>finish(false);
    // Let closing the overlay settle the embedded page's layout before measuring.
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(done)return;
      const from=card.getBoundingClientRect(),to=flag.getBoundingClientRect();
      if(!from.width||!from.height){finish();return;}
      const dx=to.left+to.width/2-from.left-from.width/2,dy=to.top+to.height/2-from.top-from.height/2;
      const scale=Math.min(to.width/from.width,to.height/from.height)*.65;
      packingWidth=root.clientWidth;
      card.inert=true;card.classList.add('sp-packing');bookmark.focus({preventScroll:true});
      flight=card.animate([
        {transform:'translate(0,0) scale(1)',opacity:1,offset:0},
        {transform:`translate(${dx*.12}px,${dy*.12}px) scale(.6)`,opacity:1,offset:.32},
        {transform:`translate(${dx}px,${dy}px) scale(${scale})`,opacity:.15,offset:1}
      ],{duration:540,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
      flight.finished.then(()=>finish(true),()=>finish(false));
    }));
  }
  // Height changes and scrollbar appearance are normal inside the host frame.
  window.addEventListener('resize',()=>{if(packingWidth&&Math.abs(root.clientWidth-packingWidth)>20)finishPacking?.();});
  q('.sp-modal-mask').addEventListener('click',closeImpact);
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeImpact();}else if(event.key==='Tab'){if(modalShred.running){event.preventDefault();return;}const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href],summary')].filter(el=>el.getClientRects().length);const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
  q('.sp-impact-sources').addEventListener('toggle',positionDialog);
  q('.sp-impact-links').addEventListener('toggle',positionDialog,true);
  window.addEventListener('resize',positionDialog);
  function drawPie(chosen,animate=false){
    const sum=chosen.reduce((n,d)=>n+valueOf(d),0),overlaps=selectedOverlaps(chosen);
    const chart=piePresentation(chosen,sum,design.thickness,activeFlow),svg=q('.sp-chart svg');
    const group=payerGroups.find(g=>g.id===activeFlow);
    const renderKey=JSON.stringify([activeFlow,design.thickness,overlaps.length,chosen.map(d=>[d.id,d.amount,d.title,d.short,d.type,d.flow])]);
    // The host echoes saved selections immediately. Keep the live SVG and its
    // animation when the echo (or an unrelated UI render) has the same target.
    if(renderKey===pieRenderKey)return;
    pieRenderKey=renderKey;
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion=animate&&piePainted.length>0&&!reducedMotion.matches;
    const previous=motion?piePainted.map(part=>{const style=getComputedStyle(part.path);return {...part,fill:style.fill,stroke:style.stroke};}):[];
    cancelAnimationFrame(pieFrame);pieFrame=0;
    pieColourAnimations.forEach(a=>a.cancel());pieColourAnimations=[];
    svg.setAttribute('id','sp-pie-chart');
    svg.setAttribute('aria-label',`Arvioiden summa ${moneyLabel(sum)}.${overlaps.length?' Summassa voi olla samoja säästöjä kahdesti.':''} Kehiä: ${chart.rings.length}, jokainen 10 miljardia euroa.${chart.focused?' '+group.name+' korostettu vihreällä.':''} ${chosen.map(d=>d.short+': '+moneyLabel(d.amount)).join('; ')}.`);
    const baseViewport=pieViewport(chart.focused?piePresentation(chosen,sum,design.thickness,null):chart);
    const targetViewport=fitPieViewport(pieViewport(chart),baseViewport.width/baseViewport.height);
    const fromValues=motion?svg.getAttribute('viewBox').split(/\s+/).map(Number):Object.values(targetViewport);
    const fromViewport=Object.fromEntries(['x','y','width','height'].map((key,i)=>[key,fromValues[i]]));
    const viewport={...fromViewport},chartElement=q('.sp-chart'),center=q('.sp-chart-center');
    chartElement.style.aspectRatio=baseViewport.width+' / '+baseViewport.height;
    const positionViewport=()=>{
      svg.setAttribute('viewBox',`${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`);
      chartElement.dataset.viewWidth=viewport.width;
      center.style.left=(160-viewport.x)/viewport.width*100+'%';center.style.top=(160-viewport.y)/viewport.height*100+'%';
      center.style.width=chart.inner*2/viewport.width*100+'%';center.style.height=chart.inner*2/viewport.height*100+'%';
      syncPieScale();
    };
    positionViewport();
    q('.sp-tracks').innerHTML=chart.rings.map(r=>`<path d="${slice(0,1,r.inner+10,r.inner)}" fill="var(--sp-track)"></path>`).join('');
    const trackTweens=[...q('.sp-tracks').querySelectorAll('path')].map((path,i)=>({path,to:chart.rings[i].inner,from:previous.find(p=>p.ring===i)?.inner??chart.rings[i].inner}));
    const mountSlices=parts=>{
      q('.sp-slices').innerHTML=parts.map(part=>{
      const small=part.id==='small-actions';
      return `<path data-piece="${esc(part.key)}" data-action="${part.id}" data-pie-focus="${part.highlighted}" d="${slice(part.start,part.end,part.outer,part.inner)}" fill="var(--sp-${part.kind})" stroke="var(--sp-${part.kind}-edge)" stroke-width="${small||part.dimmed?1:4}" stroke-linejoin="round" opacity="${part.dimmed?.4:1}"></path>`;
      }).join('');
      const paths=[...q('.sp-slices').querySelectorAll('path[data-piece]')];
      piePainted=parts.map((part,i)=>({...part,path:paths[i],opacity:part.dimmed?.4:1,strokeWidth:part.id==='small-actions'||part.dimmed?1:4}));
      const hitParts=[...piePainted];
      if(chart.small.length&&!chart.parts.some(p=>p.id==='small-actions')){
        const amount=chart.small.reduce((n,d)=>n+valueOf(d),0),r=chart.rings.at(-1).inner+design.thickness;
        const highlighted=chart.focused&&chart.small.every(d=>d.flow===activeFlow);
        q('.sp-slices').insertAdjacentHTML('beforeend',`<path d="${slice(-Math.abs(amount)/target,0,r,r-10)}" fill="none" stroke="var(--sp-${highlighted?'focus':'small'})" stroke-width="${highlighted?4:2}" stroke-dasharray="3 2"/>`);
        hitParts.push({id:'small-actions',start:1-Math.abs(amount)/target,end:1,inner:r-10,outer:r,items:chart.small});
      }
      pieInteraction.setParts(hitParts);
    };
    mountSlices(motion?pieTweenParts(previous,chart.parts):chart.parts);
    let callout=q('.sp-pie-callout');
    if(!callout){callout=document.createElement('span');callout.className='sp-pie-callout';q('.sp-chart').appendChild(callout);}
    callout.textContent=smallSliceLabel(chart,sum);callout.hidden=!callout.textContent;
    const positionCallout=()=>{
      const smallParts=piePainted.filter(p=>p.id==='small-actions'),tip=smallParts.at(-1);
      if(!tip)return;
      const angle=((smallParts.filter(p=>p.ring===tip.ring)[0].start+tip.end)/2)*2*Math.PI-Math.PI/2;
      const radius=Math.max(...smallParts.filter(p=>p.ring===tip.ring).map(p=>p.outer))+12;
      callout.style.left=`clamp(48px,${(160+Math.cos(angle)*radius-viewport.x)/viewport.width*100}%,calc(100% - 48px))`;
      callout.style.top=`clamp(0px,calc(${(160+Math.sin(angle)*radius-viewport.y)/viewport.height*100}% + ${Math.sin(angle)>=0?18:-18}px),100%)`;
    };
    if(motion){
      const duration=460,start=performance.now();
      const tweens=piePainted.map(part=>({part,to:{inner:part.inner,outer:part.outer,opacity:part.opacity,strokeWidth:part.strokeWidth}}));
      tweens.forEach(({part})=>{
        if(!part.from.fill)return;
        const style=getComputedStyle(part.path);
        pieColourAnimations.push(part.path.animate([{fill:part.from.fill,stroke:part.from.stroke},{fill:style.fill,stroke:style.stroke}],{duration,easing:'cubic-bezier(.22,.61,.36,1)'}));
      });
      const paint=progress=>{
        const t=1-Math.pow(1-progress,3);
        for(const key of ['x','y','width','height'])viewport[key]=fromViewport[key]+(targetViewport[key]-fromViewport[key])*t;
        positionViewport();
        for(const track of trackTweens){const inner=track.from+(track.to-track.from)*t;track.path.setAttribute('d',slice(0,1,inner+10,inner));}
        for(const {part,to} of tweens){
          for(const name of ['inner','outer','opacity','strokeWidth'])part[name]=part.from[name]+(to[name]-part.from[name])*t;
          part.path.setAttribute('d',slice(part.start,part.end,part.outer,part.inner));
          part.path.setAttribute('opacity',part.opacity);part.path.setAttribute('stroke-width',part.strokeWidth);
        }
        positionCallout();
      };
      paint(0);
      const tick=now=>{
        const progress=reducedMotion.matches?1:Math.min(1,(now-start)/duration);
        paint(progress);
        if(progress<1){pieFrame=requestAnimationFrame(tick);return;}
        pieFrame=0;pieColourAnimations.forEach(a=>a.cancel());pieColourAnimations=[];
        mountSlices(chart.parts);positionCallout();
      };
      pieFrame=requestAnimationFrame(tick);
    }else positionCallout();
    const smallDetails=q('.sp-small-actions');smallDetails.hidden=!chart.small.length;
    smallDetails.querySelector('summary').innerHTML='<span class="sp-dot small"></span>Pienet toimet · '+moneyLabel(chart.small.reduce((n,d)=>n+valueOf(d),0));
    smallDetails.querySelector('ul').innerHTML=chart.small.map(d=>'<li><button type="button" class="cursor-interaction" data-open="'+d.id+'">'+esc(d.short)+'</button><strong>'+moneyLabel(d.amount)+'</strong></li>').join('');
    q('.sp-hole').setAttribute('r',String(chart.inner-2));
    q('.sp-chart').classList.toggle('sp-many-rings',chart.rings.length>3);
  }
  function syncPieScale(){
    const chart=q('.sp-chart'),width=Number(chart.dataset.viewWidth);
    if(width>0&&chart.clientWidth>0)chart.style.setProperty('--sp-pixel-scale',String(chart.clientWidth/width));
  }
  function render(announce=false){
    syncScenario();
    q('.sp-publish').disabled=selected.size===0;
    q('.sp-panel-heading h2').textContent=packageName||'Sinun pakettisi';
    q('.sp-panel-heading h2').classList.add('sp-package-name');
    const chosen=data.filter(d=>selected.has(d.id));
    if(activeFlow&&!chosen.some(d=>d.flow===activeFlow))activeFlow=null;
    root.querySelectorAll('[data-horizon]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.horizon==='later')===includeLater)));
    const sum=chosen.reduce((s,d)=>s+valueOf(d),0),cuts=chosen.filter(d=>d.type==='cut').reduce((s,d)=>s+valueOf(d),0);
    q('.sp-total').textContent=format(sum);
    q('.sp-remaining-label').textContent=sum<=target?'Vielä puuttuu':'Yli tavoitteen';
    q('.sp-remaining-value').textContent=moneyLabel(Math.abs(target-sum));
    q('.sp-tax-total').textContent=moneyLabel(sum-cuts);q('.sp-cut-total').textContent=moneyLabel(cuts);
    q('.sp-count').textContent=chosen.length+' valittua toimea';q('.sp-clear').disabled=!chosen.length;q('.sp-empty').hidden=!!chosen.length;
    const overlaps=selectedOverlaps(chosen);
    q('.sp-package-overlap').hidden=!overlaps.length;
    q('.sp-package-overlap').innerHTML=overlaps.length?'<summary class="cursor-interaction">Summassa voi olla sama säästö kahdesti</summary>'+overlaps.map(p=>'<p><strong>'+esc(p.action.short)+' + '+esc(p.other.short)+'</strong><br>'+esc(p.note)+'</p>').join(''):'';
    drawPie(chosen);
    root.style.setProperty('--sp-radius',design.radius+'px');
    q('.sp-selection-list').innerHTML=chosen.map(d=>`<li><span class="sp-dot ${d.type==='cut'?'cut':''}"></span><button type="button" class="sp-basket-open cursor-interaction" data-open="${d.id}">${esc(d.short)}</button><strong>${moneyLabel(d.amount)}</strong><button type="button" class="sp-remove cursor-interaction" data-remove="${d.id}" aria-label="Poista: ${esc(d.title)}">×</button></li>`).join('');
    root.querySelectorAll('[data-bookmark]').forEach(b=>{const type=b.dataset.bookmark,count=chosen.filter(d=>d.type===type).length;b.querySelector('strong').textContent=count;b.setAttribute('aria-pressed',String(filter==='selected-'+type));b.setAttribute('aria-label',(type==='cut'?'Valitut menoleikkaukset':'Valitut verot ja maksut')+': '+count+' toimea');});
    q('.sp-list-label h2').textContent=filter==='selected-cut'?'Valitut menoleikkaukset':filter==='selected-tax'?'Valitut verot ja maksut':filter==='selected'?'Valitut toimet':'Valitse mistä otetaan';
    q('.sp-list-label > span').textContent=data.length+' toimea ja vaihtoehtoa';
    const terms=searchWords(search);
    const matches=orderCatalogue(data.filter(d=>matchesType(d)&&(category==='all'||d.flow===category)&&matchesSearch(d,terms)));
    const visible=new Set(matches.slice(0,limit).map(d=>d.id));
    data.forEach(d=>{
      const el=list.querySelector(`[data-id="${d.id}"]`);el.hidden=!visible.has(d.id);if(el.hidden)return;
      el.querySelector('.sp-card-open').textContent=d.title;
      el.querySelector('.sp-amount').innerHTML=actionAmountMarkup(d);
      el.querySelector('[data-controls]').innerHTML=controlsMarkup(d.id,'card');
      el.classList.toggle('is-picked',selected.has(d.id));
    });
    matches.slice(0,limit).forEach(d=>list.appendChild(list.querySelector(`[data-id="${d.id}"]`)));
    root.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
    const restrictions=[];
    if(terms.length)restrictions.push('haku ”'+search.trim()+'”');
    if(category!=='all')restrictions.push(payerGroups.find(g=>g.id===category).name);
    if(filter!=='all')restrictions.push({cut:'uudet menoleikkaukset',tax:'uudet verot ja muut tulot',selected:'valitut toimet','selected-cut':'valitut menoleikkaukset','selected-tax':'valitut verot ja maksut'}[filter]);
    q('.sp-results').textContent=matches.length+' '+(filter.startsWith('selected')?'valittua':'valitsematonta')+' toimea'+(restrictions.length?' · '+restrictions.join(' · '):'')+' · näytetään '+Math.min(limit,matches.length)+'.';
    q('.sp-more').hidden=matches.length<=limit;q('.sp-more').textContent='Näytä seuraavat '+Math.min(20,matches.length-limit)+' toimea ↓';
    renderIncidence(chosen);
    if(pieExpanded)renderZoom();
    if(announce)q('.sp-announcement').textContent=`${chosen.length} valittua toimea. Koko julkisen talouden vaikutus ${moneyLabel(sum)}.`;
  }
  q('#sp-search').addEventListener('input',event=>{search=event.target.value;limit=12;render();save();});
  q('#sp-category').addEventListener('change',event=>{category=event.target.value;limit=12;render();save();});
  function resetCatalogueView(){
    search='';category='all';filter='all';limit=12;
    catalogueOrder=[];catalogueOrderKey='';
    q('#sp-search').value='';q('#sp-category').value='all';
  }
  function searchWords(text){return String(text??'').toLocaleLowerCase('fi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/[^a-z0-9]+/).filter(Boolean);}
  function matchesType(d){
    if(filter==='selected')return selected.has(d.id);
    if(filter.startsWith('selected-'))return selected.has(d.id)&&d.type===filter.slice(9);
    return !selected.has(d.id)&&(filter==='all'||(d.filterTypes??[d.type]).includes(filter));
  }
  function matchesSearch(d,terms){
    if(!terms.length)return true;
    const aliases=d.id==='corporate'?'yritysvero yritysverotus yhtiövero':'';
    const kind=d.type==='cut'?'säästö leikkaus menoleikkaus':'vero verotus korotus';
    const words=searchWords([d.title,d.who,d.society,d.memo,d.origin,d.kind,d.searchTerms,aliases,kind].join(' '));
    return terms.every(term=>words.some(word=>word.startsWith(term)));
  }
  function compareAmounts(a,b){
    const aKnown=Number.isFinite(a.amount),bKnown=Number.isFinite(b.amount);
    if(aKnown!==bKnown)return aKnown?-1:1;
    return (aKnown?(sortOrder==='asc'?a.amount-b.amount:b.amount-a.amount):0)||a.title.localeCompare(b.title,'fi');
  }
  function orderCatalogue(matches){
    const key=JSON.stringify([year,typeof includeLater!=='undefined'&&includeLater,search,category,filter,sortOrder]);
    if(key!==catalogueOrderKey){catalogueOrder=[];catalogueOrderKey=key;}
    const rank=new Map(catalogueOrder.map((id,i)=>[id,i]));
    // Freeze the browsing order while controls change amounts. Pagination,
    // unrelated renders and host state echoes must not move the edited card.
    for(const d of matches.filter(d=>!rank.has(d.id)).sort(compareAmounts)){
      rank.set(d.id,catalogueOrder.length);catalogueOrder.push(d.id);
    }
    return matches.sort((a,b)=>rank.get(a.id)-rank.get(b.id));
  }
  q('#sp-sort').addEventListener('change',event=>{sortOrder=event.target.value==='asc'?'asc':'desc';limit=12;render();save();});
  q('#sp-decile-picker').addEventListener('change',event=>{activeDecile=event.target.value===''?null:Number(event.target.value);renderIncidence(data.filter(d=>selected.has(d.id)));});

  root.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(modalShred.running)return;
    finishPacking?.();
    if(button.dataset.horizon){includeLater=button.dataset.horizon==='later';year=2031;render(true);save();}
    else if(button.dataset.step||button.dataset.yleStep||button.dataset.dividendMode||button.dataset.condition){
      const focusId=button.id;
      if(button.dataset.step){const id=button.dataset.step,store=id==='income'||id==='corporate'?scenario:units;store[id]=Math.min(capFor(id),Math.max(0,store[id]+Number(button.dataset.delta)));}
      else if(button.dataset.yleStep)scenario.ylePercent=ylePercent(ylePercent(scenario.ylePercent)+Number(button.dataset.yleStep));
      else if(button.dataset.condition)conditions[button.dataset.condition]=button.dataset.value;
      else scenario.dividends=button.dataset.dividendMode==='abolish'?'abolish':'vm';
      render(true);if(activeAction){renderImpact(activeAction);positionDialog();}save();
      const replacement=focusId?q('#'+focusId):activeAction?q('.sp-modal-confirm'):null;if(replacement&&!replacement.disabled)replacement.focus({preventScroll:true});else if(replacement){replacement.parentElement.querySelector('button:not(:disabled)')?.focus({preventScroll:true});}
    }
    else if(button.dataset.category){category=button.dataset.category;filter='all';search='';limit=12;q('#sp-category').value=category;q('#sp-search').value='';render();save();q('#sp-search').focus();}
    else if(button.classList.contains('sp-zoom-open')){togglePie();}
    else if(button.dataset.open){openImpact(button.dataset.open,button);}
    else if(button.dataset.decile!==undefined){const chart=button.dataset.incidenceChart;activeDecile=Number(button.dataset.decile);renderIncidence(data.filter(d=>selected.has(d.id)));q(`[data-incidence-chart="${chart}"][data-decile="${activeDecile}"]`).focus({preventScroll:true});}
    else if(button.dataset.flow){activeFlow=activeFlow===button.dataset.flow?null:button.dataset.flow;const chosen=data.filter(d=>selected.has(d.id));drawFlows(chosen);renderFlowDetail(chosen);drawPie(chosen,true);if(pieExpanded)renderZoom();save();}
    else if(button.classList.contains('sp-flow-close')){const previous=activeFlow;activeFlow=null;const chosen=data.filter(d=>selected.has(d.id));drawFlows(chosen);renderFlowDetail([]);drawPie(chosen,true);if(pieExpanded)renderZoom();save();q(`[data-flow="${previous}"]`).focus();}
    else if(button.classList.contains('sp-modal-confirm')){if(activeAction){const id=activeAction,d=data.find(x=>x.id===id),adding=!selected.has(id);if(adding){d.conflicts.forEach(c=>selected.delete(c));selected.add(id);modalShred.play(()=>{closeImpact();packSelectedCard(d);});}else{selected.delete(id);render(true);save();closeImpact();}}}
    else if(button.classList.contains('sp-modal-close')){closeImpact();}
    else if(button.dataset.remove){const id=button.dataset.remove;selected.delete(id);render(true);save();const same=list.querySelector(`[data-open="${id}"]`);if(!same.closest('article').hidden)same.focus();else q('[data-filter="all"]').focus();}
    else if(button.dataset.bookmark){filter='selected-'+button.dataset.bookmark;search='';category='all';limit=12;q('#sp-search').value='';q('#sp-category').value='all';render();save();q('.sp-actions').scrollIntoView({block:'start',behavior:'instant'});}
    else if(button.dataset.filter){if(button.dataset.filter==='all')resetCatalogueView();else{filter=button.dataset.filter;limit=12;}render();save();}
    else if(button.classList.contains('sp-more')){limit+=20;render();save();}
    else if(button.classList.contains('sp-clear')){selected.clear();render(true);save();root.querySelector('[data-filter="all"]').focus();}
  });
  /*PIE_INTERACTION*/
  const pieInteraction=createPieInteraction(q('.sp-chart'),{moneyLabel,measureViewport:()=>measureViewport(),getVisibleFrame:()=>{
    const top=root.getBoundingClientRect().top;
    return visibleFrame?{top:top+visibleFrame.top,height:visibleFrame.height}:{top:0,height:window.innerHeight};
  }});
  /*SHARE_IMAGE*/
  /*SHARE_PNG*/
  /*SHARE_UI*/
  loadSharedLocation();
  // CSS handles an ordinary page. In the auto-height preview the parent frame
  // scrolls instead, so use the browser's clipped intersection rectangle.
  const bookmarkNav=q('.sp-bookmarks'),catalogue=q('.sp-actions');
  const bookmarkRail=document.createElement('aside');bookmarkRail.className='sp-bookmark-rail';
  bookmarkNav.before(bookmarkRail);bookmarkRail.appendChild(bookmarkNav);
  if(globalThis.IntersectionObserver){
    let measuring=false;
    const measure=new IntersectionObserver(entries=>{
      measure.disconnect();measuring=false;
      const entry=entries[entries.length-1];
      if(!entry.isIntersecting)return;
      visibleFrame={top:entry.intersectionRect.top-root.getBoundingClientRect().top,height:entry.intersectionRect.height};
      positionDialog();
      pieInteraction.position();
      const bounds=catalogue.getBoundingClientRect(),height=bookmarkNav.offsetHeight;
      const top=Math.max(0,Math.min(bounds.height-height,entry.intersectionRect.top-bounds.top+12));
      bookmarkNav.style.setProperty('--sp-bookmark-top',top+'px');
      bookmarkNav.classList.add('sp-bookmarks-floating');
    });
    const measureBookmarks=()=>{if(!measuring){measuring=true;measure.observe(root);}};
    measureViewport=measureBookmarks;
    // Partial card intersections change throughout both parent and local scrolls.
    // Only measure when something moves; there is no polling or animation loop.
    const movement=new IntersectionObserver(measureBookmarks,{threshold:Array.from({length:101},(_,i)=>i/100)});
    catalogue.querySelectorAll('.sp-action,.sp-list-label,.sp-catalogue-tools,.sp-filters,.sp-more').forEach(el=>movement.observe(el));
    movement.observe(catalogue);
    if(globalThis.ResizeObserver){new ResizeObserver(measureBookmarks).observe(catalogue);const panelResize=new ResizeObserver(positionDialog);panelResize.observe(dialog);}
    window.addEventListener('scroll',measureBookmarks,{passive:true});
    window.addEventListener('resize',measureBookmarks);
    measureBookmarks();
  }
  let lastFlowWidth=q('.sp-flow-graph').clientWidth;
  if(globalThis.ResizeObserver)new ResizeObserver(syncPieScale).observe(q('.sp-chart'));
  if(globalThis.ResizeObserver)new ResizeObserver(()=>{const width=q('.sp-flow-graph').clientWidth;if(width!==lastFlowWidth){lastFlowWidth=width;drawFlows(data.filter(d=>selected.has(d.id)));}}).observe(q('.sp-flow-graph'));
  window.addEventListener('openai:set_globals',event=>{if(!packageSession.active&&event.detail?.globals?.widgetState){modalShred.finish();finishPacking?.();stateIn(event.detail.globals.widgetState);render();if(activeAction){renderImpact(activeAction);positionDialog();}}});
  if(globalThis.Tweak){const tweak=new Tweak({container:root,onChange:()=>render()});tweak.addSlider(design,'radius',{label:'Korttien kulmat',min:0,max:24,unit:'px'});tweak.addSlider(design,'thickness',{label:'Piirakan renkaan leveys',min:40,max:90,unit:'px'});}
})();
