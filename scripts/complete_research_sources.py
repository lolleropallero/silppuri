"""Verified bibliographic additions for the October 2026 evidence review."""
import json
from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'data/research-sources.json'
sources = json.loads(p.read_text(encoding='utf-8'))
rows = [
 ('energydemand', 'Labandeira, Labeaga & López-Otero (2017): A meta-analysis on the price elasticity of energy demand', 'https://doi.org/10.1016/j.enpol.2017.01.002', 'Kansainvälinen meta-analyysi · lyhyen ja pitkän ajan energiakysyntä'),
 ('schoolmeals', 'Spill ym. (2024): Universal Free School Meals and School and Student Outcomes', 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2822155', 'Systemaattinen katsaus · kuusi yhdysvaltalaista pitkittäistutkimusta'),
 ('activity', 'Vasankari & Kolu (toim., 2018): Liikkumattomuuden lasku kasvaa', 'https://urn.fi/URN:ISBN:978-952-287-535-8', 'Suomi · kustannustutkimus, ei avustusohjelman vaikutusarvio'),
 ('pensionadequacy', 'Rantala (2020): Tutkimuksia eläkeläisten pienituloisuuden ja toimeentulon dynamiikasta', 'https://urn.fi/URN:ISBN:978-951-691-319-6', 'Suomi · rekisteripaneeli vuosilta 1995–2014'),
 ('pensionprojection', 'ETK (2026): Lakisääteiset eläkkeet – pitkän aikavälin laskelmat', 'https://urn.fi/URN:ISBN:978-951-691-427-8', 'Suomi · eläkejärjestelmän ennustelaskelma, ei kausaalinen vaikutusarvio'),
 ('privatecare', 'Blomgren, Kosunen & Moustgaard (2026): Kelan korvaaman yksityisen sairaanhoidon käyttö ja korvaukset', 'https://urn.fi/URN:ISBN:978-952-284-247-3', 'Suomi · kuvaileva rekisteritutkimus 2018–2024'),
 ('dental', 'Heinonen & Buri (2026): Julkinen ja yksityinen hammashoito Suomessa', 'https://www.kkv.fi/tutkimus-ja-vaikuttaminen/julkaisut/tutkimusraportit/julkinen-ja-yksityinen-hammashoito-suomessa-palvelujen-kaytto-sektorisiirtymat-ja-kela-korvausten-vaikutukset-tutkimusraportteja-3-2026/', 'Suomi · käyntirekisterit ja Kela-korvausten uudistukset; KKV 3/2026'),
 ('psychotherapy', 'Turunen ym. (2025): Gendered effect of psychotherapy on income', 'https://doi.org/10.1016/j.jad.2025.02.058', 'Suomi · hoidon aloittamista koskeva kvasikokeellinen tutkimus'),
 ('publicemployment', 'Ramey (2012): Government Spending and Private Activity', 'https://www.nber.org/papers/w17787', 'Yhdysvallat · julkisten menojen ja työllisyyden aikasarjatutkimus'),
 ('aidreview', 'Arndt, Jones & Tarp (2013): Assessing Foreign Aid’s Long-Run Contribution to Growth and Development', 'https://www.wider.unu.edu/sites/default/files/WP2013-072.pdf', 'Maiden välinen pitkittäistutkimus · UNU-WIDER-työpaperi'),
 ('incomeshifting', 'Harju & Matikka (2016): Business Owners and Income Shifting', 'https://www.doria.fi/bitstream/handle/10024/148903/j68.pdf', 'Suomi · osinkoverouudistus; linkki tutkimuksen työpaperiversioon'),
 ('vatasymmetry', 'Benzarti ym. (2020): What Goes Up May Not Come Down', 'https://doi.org/10.1086/710558', 'Suomi ja Ruotsi · ALV-korotusten ja -alennusten hintavaikutukset'),
 ('tobacco', 'IARC (2011): Effectiveness of Tax and Price Policies for Tobacco Control', 'https://publications.iarc.who.int/Book-And-Report-Series/Iarc-Handbooks-Of-Cancer-Prevention/Effectiveness-Of-Tax-And-Price-Policies-For-Tobacco-Control-2011', 'Kansainvälinen tutkimuskatsaus · tupakkaverotus'),
 ('waste', 'Skatteverket (2021): Utvärdering av avfallsförbränningsskatten', 'https://skatteverket.se/download/18.96cca41179bad4b1aa991d/1633068526576/Utv%C3%A4rdering%20av%20avfallsf%C3%B6rbr%C3%A4nningsskatten.pdf', 'Ruotsi · jätteenpolttoveron viranomaisarviointi'),
 ('aviation', 'Borbely (2019): A case study on Germany’s aviation tax', 'https://strathprints.strath.ac.uk/69132/', 'Saksa · lentoveron synteettinen verrokkiasetelma'),
 ('cartax', 'Klier & Linn (2015): Using Taxes to Reduce Carbon Dioxide Emissions Rates of New Passenger Vehicles', 'https://www.aeaweb.org/articles?id=10.1257/pol.20120256', 'Ranska, Saksa ja Ruotsi · autoverouudistusten vertailu'),
 ('hospitaldistance', 'Chambers ym. (2020): Effects of increased distance to urgent and emergency care facilities', 'https://www.ncbi.nlm.nih.gov/books/NBK559713/', 'Systemaattinen katsaus · päivystysverkon muutokset ja hoitomatkat'),
]
for key, label, url, kind in rows:
    sources[key] = dict(label=label, url=url, kind=kind)
p.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding='utf-8')
print('Sources:', len(sources))
