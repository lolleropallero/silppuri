"""Download public source documents; preserve text and page numbers for audit."""
import urllib.request
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1] / 'data' / 'sources'
SOURCES = {
    'vm-source-tax-2021': 'https://julkaisut.valtioneuvosto.fi/server/api/core/bitstreams/4a67552f-78a3-498f-aeea-5aa515449735/content',
    'eutax-wealth-2025': 'https://www.taxobservatory.eu/www-site/uploads/2025/03/Resources-for-a-Safe-and-Resilient-Europe_The-Case-for-Minimum-Taxation-of-Ultra-High-Net-Worth-Individuals-in-the-EU-1.pdf',
    'cfc-vero-2021': 'https://www.vero.fi/globalassets/harmaa-talous-ja-talousrikollisuus/selvitykset/2021_02-v%C3%A4liyhteis%C3%B6lain-ongelmakohdat.pdf',
}
for key, url in SOURCES.items():
    path = ROOT / (key + '.pdf')
    if not path.exists():
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        path.write_bytes(urllib.request.urlopen(req, timeout=45).read())
    pages = PdfReader(path).pages
    path.with_suffix('.txt').write_text('\n'.join(f'PAGE {i+1}\n{p.extract_text()}' for i,p in enumerate(pages)), encoding='utf8')
    print(key, len(pages), 'pages')
