"""Local + external link check for the redesigned pages (dev tool, not published)."""
import json, re, sys
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).parent
BASE = 'http://127.0.0.1:8766'
PAGES = ['/', '/patches', '/why-480i', '/render-restore.html', '/render-restore/conker-skyboxes.html',
         '/render-restore/tools-of-the-trade.html', '/projects', '/navigation', '/aboutme', '/credits',
         '/links', '/privacy', '/not_found.html', '/tnd6480i/', '/pd6480iperf/']


def resolve(path):
    p = ROOT / unquote(path.lstrip('/'))
    if p.is_dir():
        p = p / 'index.html'
    if not p.exists() and not p.suffix:
        p = p.with_suffix('.html')
    return p


class Refs(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []; self.ids = set()
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        for key in ('href', 'src', 'poster'):
            if a.get(key): self.refs.append(a[key])
        for key in ('srcset',):
            if a.get(key): self.refs += [s.strip().split(' ')[0] for s in a[key].split(',')]


def main():
    issues, local, external, ids_by_page = [], set(), set(), {}
    css_files = set()
    for route in PAGES:
        page_file = resolve(route)
        parser = Refs(); parser.feed(page_file.read_text(encoding='utf-8-sig'))
        ids_by_page[route] = parser.ids
        base_url = BASE + ('/no-such-dir/x' if route == '/not_found.html' else route)  # 404 page must work from any depth
        for ref in parser.refs:
            if ref.startswith(('mailto:', 'javascript:', 'data:')): continue
            url = urlsplit(urljoin(base_url, ref))
            if url.netloc and url.netloc != '127.0.0.1:8766':
                external.add(urljoin(base_url, ref)); continue
            target = resolve(url.path)
            if not target.is_file():
                issues.append({'page': route, 'missing': ref}); continue
            local.add(url.path + (('#' + url.fragment) if url.fragment else ''))
            if target.suffix == '.css': css_files.add(target)
    # Fragment targets on our own pages (game pages build theirs in script, so skip those).
    for item in sorted(local):
        if '#' not in item: continue
        path, frag = item.split('#', 1)
        route = path if path in ids_by_page else None
        if route and route not in ('/tnd6480i/', '/pd6480iperf/') and frag not in ids_by_page[route]:
            issues.append({'fragment': item, 'problem': 'no element with that id'})
    for css in css_files:
        for ref in re.findall(r'url\(\s*["\']?([^)"\']+)', css.read_text(encoding='utf-8')):
            if ref.startswith(('data:', 'http')): continue
            path = urlsplit(urljoin('/' + css.relative_to(ROOT).as_posix(), ref)).path
            if not resolve(path).is_file(): issues.append({'css': css.name, 'missing': ref})
    for extra in ['/robots.txt', '/sitemap.xml', '/site.webmanifest', '/favicon.ico', '/apple-touch-icon.png',
                  '/images/site/og-cystation.jpg', '/images/site/og-tnd6480i.jpg', '/images/site/og-pd6480iperf.jpg',
                  '/images/site/icon-192.png', '/images/site/icon-512.png', '/fonts/OFL-Limelight.txt']:
        if not resolve(extra).is_file(): issues.append({'missing': extra})
    for loc in re.findall(r'<loc>https://cystation\.neocities\.org([^<]*)</loc>', (ROOT / 'sitemap.xml').read_text()):
        if not resolve(loc or '/').is_file(): issues.append({'sitemap': loc, 'problem': 'no file'})

    def probe(url):
        for method in ('HEAD', 'GET'):
            try:
                with urlopen(Request(url, method=method, headers={'User-Agent': 'Mozilla/5.0 (link check)'}), timeout=10) as r:
                    return {'url': url, 'status': r.status}
            except Exception as e:
                last = str(e)
        return {'url': url, 'error': last}
    with ThreadPoolExecutor(max_workers=8) as pool:
        ext = list(pool.map(probe, sorted(external)))
    report = {'pages': len(PAGES), 'localReferences': len(local), 'externalLinks': len(external),
              'issues': issues, 'external': ext}
    (OUT / 'link-check.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({k: report[k] for k in ('pages', 'localReferences', 'externalLinks', 'issues')}, indent=1))
    print('external not OK:', [e for e in ext if e.get('status') != 200])
    return 1 if issues else 0


if __name__ == '__main__':
    sys.exit(main())
