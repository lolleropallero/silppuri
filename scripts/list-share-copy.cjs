const fs=require('node:fs'),path=require('node:path');
const {ctx,evaluate,run}=require('./summary-runtime.cjs');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
run(read('src/presets.js'));
const titles={
 'services-consumption-counter':'Palvelut ja kulutus osuvat pienituloisiin; myös ylempiä tuloryhmiä kuormitetaan',
 'services-consumption-benefits':'Palvelut, etuudet ja kulutus osuvat samaan pienituloiseen ryhmään',
 'services-consumption':'Palvelut ja kulutus osuvat pienituloisiin',
 'services-benefits-counter':'Palvelut ja etuudet osuvat pienituloisiin; myös ylemmät tuloryhmät maksavat',
 'services-benefits':'Palvelut ja etuudet osuvat pienituloisiin',
 'benefits-consumption-counter':'Etuudet ja kulutus osuvat pienituloisiin; myös ylemmät tuloryhmät maksavat',
 'benefits-consumption':'Etuudet ja kulutus osuvat pienituloisiin',
 'indices-counter':'Laaja indeksijäädytys ja ylempiin tuloryhmiin painottuvia toimia',
 indices:'Laaja indeksijäädytys',
 'business-research':'Yritykset ja tutkimusrahoitus',
 'services-upper':'Palveluleikkausten rinnalla ylempiin tuloryhmiin painottuvia toimia',
 upper:'Ylempiin tuloryhmiin painottuvat toimet',split:'Eri toimet painottuvat eri tuloryhmiin',
 lower:'Alempiin tuloryhmiin painottuvat toimet',middle:'Keskimmäisiin tuloryhmiin painottuvat toimet',
 'all-pay':'Kaikki tuloryhmät maksavat, suhteelliset rahavaikutukset lähellä toisiaan',
 research:'Tutkimusrahoitus',grants:'Avustukset',mixed:'Ei yhtä varmaa päämaksajaa'
};
const money=n=>(n/1000).toLocaleString('fi-FI',{minimumFractionDigits:2,maximumFractionDigits:2})+' mrd. €';
const out=['# Silppurin nimet, alaotsikot ja tiivistelmät','',
 'Luettelo tuotetaan suoraan nykyisestä koodista komennolla `node scripts/list-share-copy.cjs`. Hakasulut ovat alla tekstipohjien muuttuvia kohtia; ne eivät näy käyttäjälle. Toimien nimet ja yhdistävät sivulauseet määräytyvät valituista korteista ja tulokymmenysarvioista. Jokaiselle 19 tavalliselle tiivistelmätyypille sekä yhdeksälle vaihtoehtoiselle lopulle ja kuudelle yritystoimien mukaiselle tekstiversiolle on testattu 8–12 miljardin paketti oikeista korteista. Tyhjä, nolla, puuttuva euroarvio ja negatiivinen kokonaismäärä ovat erikoistapauksia.','',
 '## Valmiit paketit','', '| Nimi | Nykyinen summa | Julkaisun luonnehdinta |','|---|---:|---|'];
for(const p of run('packagePresets')){const s=evaluate(p.model).summary;out.push('| '+[p.name,money(s.total),s.profile.name].join(' | ')+' |');}
out.push('','## Julkaisun nimet','','Paketin oma otsikko on käyttäjän kirjoittama nimi. Alla ovat sen alle valittavat luonnehdinnat.','','| Nimi | Painotus |','|---|---|');
for(const p of Object.values(run('packageProfiles')))out.push('| '+p.name+' | '+p.label+' |');
for(const [key,value] of Object.entries(run('shareProfilePairs')))out.push('| '+value+' | '+key.split('+').map(k=>run('packageProfiles')[k].label).join(' + ')+' |');
out.push('','Suurin teema antaa nimen, jos sen osuus on vähintään 65 % tai toiseksi suurin jää alle 20 %:iin. Muuten käytetään kahden suurimman teeman yhdistelmänimeä, jos sellainen on yllä; muissa yhdistelmissä suurimman teeman nimeä. Nollan ja puuttuvan euroarvion toimet eivät kasvata painoja.','','## Alaotsikot','','| Tilanne | Alaotsikko |','|---|---|');
const thresholds={empty:'Ei valittuja toimia',zero:'0 €',reverse:'Alle 0 €',rookie:'Yli 0 mutta alle 5 mrd. €',under:'5 – alle 9,5 mrd. €',target:'9,5–10,5 mrd. €',over:'Yli 10,5 – 15 mrd. €',heavy:'Yli 15 – alle 17,5 mrd. €',extreme:'17,5 – alle 20 mrd. €',demolition:'Vähintään 20 mrd. €'};
for(const [id,text] of Object.entries(run('shareGoalEditorial')))out.push('| '+thresholds[id]+' | '+text+' |');
const base={upper:'[ylempiin tuloryhmiin painottuvat toimet]',upperLower:'[ylempiin tuloryhmiin painottuvat toimet]',lower:'[alempiin tuloryhmiin painottuvat toimet]',middle:'[keskimmäisiin tuloryhmiin painottuvat toimet]',all:'[paketin keskeiset toimet]',otherClause:'',rest:()=>'',businessClause:'[yritystoimien kuvaus]',netLower:false,netUpper:false,lowBenefits:false};
const fixtures=JSON.parse(read('scripts/fixtures/summary-packages.json'));
out.push('','## Kaikki tiivistelmäpohjat','','Näissä pohjissa ei ole muita merkittäviä teemoja kuvaavaa sivulausetta. Alempana on myös kunkin pohjan versio, jossa sellainen on mukana. Tavallinen tiivistelmä on yksi tilanteeseen kirjoitettu kappale; erillisiä toimikohtaisia vitsikappaleita ei yhdistetä.');
let i=0;
for(const [id,fn] of Object.entries(run('shareNarratives'))){
 out.push('','### '+(++i)+'. '+titles[id],'','`'+id+'`','','> '+fn(base));
 const extras=fn({...base,otherClause:'[muiden merkittävien toimien kuvaus]',rest:()=>'[muiden merkittävien toimien kuvaus]'});
 if(extras!==fn(base))out.push('','Muiden teemojen kanssa:','','> '+extras);
 if(fn({...base,business:true})!==fn(base))out.push('','Kun mukana on merkittäviä yritystoimia:','','> '+fn({...base,business:true}));
 if(id==='services-consumption-counter')out.push('','Kun myös etuudet osuvat samaan pienituloiseen ryhmään:','','> '+fn({...base,lowBenefits:true}));
 const r=evaluate(fixtures[id]);
 out.push('','<details>','<summary>Oikeista korteista koottu testipaketti: '+money(r.summary.total)+'</summary>','','**'+r.summary.profile.name+'** — '+r.summary.tone.text,'','> '+r.summary.description,'','| Valittu kortti säädöillä | Milj. € |','|---|---:|');
 for(const d of r.chosen)out.push('| '+d.title+' | '+d.amount.toLocaleString('fi-FI',{maximumFractionDigits:2})+' |');
 out.push('','Tarkat valinnat ja säädöt: `scripts/fixtures/summary-packages.json`, avain `'+id+'`.','','</details>');
}
out.push('','## Rahalaskun perusteella vaihtuvat loput','','Seuraavissa tilanteissa loppu vaihtuu sen mukaan, jääkö suhteellinen raharasitus kokonaisuutena alempiin vai ylempiin tuloryhmiin. Tuntematon merkittävä tuloryhmäjako estää koko paketin varman loppupäätelmän. Palvelurahoituksen ja työnantajakustannusten jakaumia ei lisätä kotitalouden rahalaskuun.');
for(const [key,state] of Object.entries(JSON.parse(read('scripts/fixtures/summary-endings.json')))){
 const [id,end]=key.split(':'),fn=run('shareNarratives')[id],s=evaluate(state).summary;
 out.push('','### '+titles[id]+' — '+({lower:'rahavaikutus painottuu pienituloisiin',upper:'rahavaikutus painottuu suurituloisiin',other:'ei varmaa koko paketin päämaksajaa'}[end]),'','> '+fn({...base,netLower:end==='lower',netUpper:end==='upper'}),'','Saavutettava testipaketti: **'+money(s.total)+'**. Valinnat: `scripts/fixtures/summary-endings.json`, avain `'+key+'`.');
}
out.push('','## Muuttuvat toimenpidekuvaukset','','Toimien nimet: palveluleikkaukset; palvelumaksujen korotukset; etuusleikkaukset; julkisen alan henkilöstösäästöt; ansiotuloverot; kulutusverot; omaisuus- ja pääomaverot; yritysverot; yritystukien leikkaukset; yritysverot ja tukileikkaukset; indeksijäädytykset; tutkimusrahoituksen järjestelyt; avustusleikkaukset; muut sopeutustoimet. Lista yhdistetään pilkuilla ja viimeisellä sanalla ”sekä”.','','Yritystoimien kuvaus on jokin seuraavista:','','- markkinoiden näkymätön käsi saa vähemmän tukirahaa ja suuremman verolaskun','- markkinoiden näkymättömälle kädelle ojennetaan näkyvä verolasku','- markkinoiden näkymätön käsi saa vähemmän taskurahaa valtiolta','','Muiden teemojen kuvaus muodostuu niiden nimistä ja kohdentumisesta. Samoin kohdistuvat toimet yhdistetään samaan lausekkeeseen:','','- [toimet] kiristävät alempien tuloryhmien arkea','- [toimet] osuvat tulotaulukon keskelle','- [toimet] marssivat suurituloisten kukkarolle','- [toimet] kasvattavat säästöpottia (kohdentumisesta ei vastaavaa varmaa päätelmää)','','## Erikoistapaukset','');
for(const [id,copy] of Object.entries(run('shareSpecialEditorial')))out.push('### '+({empty:'Tyhjä paketti',zero:'Nolla',unknown:'Euroarvio puuttuu',reverse:'Negatiivinen kokonaismäärä'}[id]),'',copy[1]?'> '+copy[1]:'Ei tiivistelmäkappaletta. Tyhjän paketin julkaiseminen on estetty käyttöliittymässä.','');
out.push('## Suurin siivu','','Tiivistelmän jälkeen tulee `Suurin siivu: [kortin nimi] ([euromäärä]).` Suurin positiivinen, euromäärältään tunnettu toimi valitaan todellisista säädetyistä summista.');
const target=path.join(root,'docs/share-copy.md');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,out.join('\n')+'\n');console.log(target);
