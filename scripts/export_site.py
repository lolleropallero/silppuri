"""Export a normal static website: native downloads, share URLs and local storage."""
from pathlib import Path
from html import escape
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]


def export_site(fragment, destination):
    runtime = (ROOT / 'src/standalone.js').read_text(encoding='utf8')
    favicon = quote((ROOT / 'src/assets/claw-slashes.svg').read_text(encoding='utf8'), safe='')
    title = escape('Silppuri - Silppua Suomi kuntoon!')
    description = escape('Mistä sinä ottaisit 10 miljardia? Kokoa oma pakettisi ja katso, kuka maksaa ja kuka pääsee vähällä.')
    metadata = f'''<title>{title}</title>
<meta name="description" content="{description}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://silppuri.fi/">
<meta property="og:site_name" content="Silppuri">
<meta property="og:locale" content="fi_FI">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<link rel="canonical" href="https://silppuri.fi/">
'''
    html = '''<!doctype html>
<html lang="fi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
'''+ metadata + '''
<style>html{color-scheme:light;background:#f5f3ed}body{margin:0}#silppuri-demo{max-width:1440px;margin:auto;border-radius:0}button,input,select,summary{outline-offset:3px}</style>
</head><body>'''+ '<script>\n' + runtime + '\n</script>\n' + fragment + '</body></html>\n'
    html = html.replace('</head>', '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,' + favicon + '">\n</head>', 1)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(html, encoding='utf8')


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('fragment', type=Path)
    parser.add_argument('--out', type=Path, default=ROOT / 'tmp/local-site/index.html')
    args = parser.parse_args()
    export_site(args.fragment.read_text(encoding='utf8'), args.out)
    print(args.out)
