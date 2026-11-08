"""Compare the upload package with what cystation.neocities.org serves now (dev tool, read-only).
Classifies each package file as new / changed / unchanged, and lists live files the new site no longer uses.
Run from the repo root:  python output/site-redesign-20261107/live_compare.py"""
import hashlib, json, re
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
from urllib.request import Request, urlopen
from urllib.error import HTTPError

LIVE = 'https://cystation.neocities.org'
PKG = Path(__file__).resolve().parents[1] / 'neocities-upload-20261107'
UA = {'User-Agent': 'Mozilla/5.0 (CyStation upload check)'}
TEXT = {'.html', '.css', '.js', '.json', '.xml', '.txt', '.svg', '.webmanifest'}
GAME_DIRS = ['tnd6480i', 'pd6480iperf', 'ys6480i', 'fzerox', 'killer-instinct-gold', 'patch-menu']


def fetch(url, method='GET'):
    try:
        with urlopen(Request(url, method=method, headers=UA), timeout=20) as r:
            return r.status, (r.read() if method == 'GET' else b''), r.headers
    except HTTPError as e:
        return e.code, b'', e.headers
    except Exception as e:
        return None, str(e).encode(), {}


def norm(data):
    return hashlib.sha256(data.replace(b'\r\n', b'\n').rstrip()).hexdigest()


class Refs(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for key in ('href', 'src', 'poster'):
            if a.get(key): self.refs.append(a[key])
        if a.get('srcset'):
            self.refs += [s.strip().split(' ')[0] for s in a['srcset'].split(',') if s.strip()]


def main():
    manifest = json.loads((PKG / 'manifest.json').read_text(encoding='utf-8'))
    files = {r['path']: r for r in manifest['files']}
    site = PKG / 'site'

    # Game folders that are not live at all are new wholesale.
    live_dirs = {d: fetch(f'{LIVE}/{d}/', 'HEAD')[0] for d in GAME_DIRS}
    absent = {d for d, s in live_dirs.items() if s == 404}

    def classify(rel):
        top = rel.split('/')[0]
        if top in absent:
            return rel, 'new', None
        local = (site / rel).read_bytes()
        ext = Path(rel).suffix.lower()
        url = f'{LIVE}/{rel}'
        if ext in TEXT:
            status, body, _ = fetch(url)
            if status == 404: return rel, 'new', None
            if status != 200: return rel, 'unknown', status
            return rel, ('unchanged' if norm(body) == norm(local) else 'changed'), None
        status, _, headers = fetch(url, 'HEAD')
        if status == 404: return rel, 'new', None
        if status != 200: return rel, 'unknown', status
        size = headers.get('Content-Length')
        return rel, ('unchanged' if size and int(size) == len(local) else 'changed (size differs or unknown)'), None

    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(classify, sorted(files)))

    # Old live pages and the files they use.
    status, body, _ = fetch(f'{LIVE}/sitemap.xml')
    live_pages = re.findall(r'<loc>([^<]+)</loc>', body.decode('utf-8', 'ignore')) if status == 200 else []
    live_pages = sorted(set(live_pages) | {LIVE + '/', LIVE + '/navigation', LIVE + '/projects', LIVE + '/aboutme',
                                            LIVE + '/credits', LIVE + '/links'})
    used_live, css_urls, page_status = set(), set(), {}
    for page in live_pages:
        s, html, _ = fetch(page)
        page_status[page] = s
        if s != 200: continue
        parser = Refs(); parser.feed(html.decode('utf-8', 'ignore'))
        for ref in parser.refs:
            u = urlsplit(urljoin(page, ref))
            if u.netloc != urlsplit(LIVE).netloc: continue
            path = unquote(u.path).lstrip('/')
            if path.endswith('.css'): css_urls.add(urljoin(page, ref).split('?')[0])
            if path and '.' in path.rsplit('/', 1)[-1]: used_live.add(path)
    for css in css_urls:
        s, text, _ = fetch(css)
        if s != 200: continue
        for ref in re.findall(r'url\(\s*["\']?([^)"\']+)', text.decode('utf-8', 'ignore')):
            if ref.startswith(('data:', 'http')): continue
            used_live.add(unquote(urlsplit(urljoin(css, ref)).path).lstrip('/'))
    stale = sorted(p for p in used_live if p not in files and not p.endswith('.html'))
    new_pages = {urlsplit(u).path.rstrip('/') or '/' for u in re.findall(r'<loc>([^<]+)</loc>', (site / 'sitemap.xml').read_text())}
    old_only_pages = sorted(urlsplit(p).path for p in live_pages if page_status.get(p) == 200 and (urlsplit(p).path.rstrip('/') or '/') not in new_pages)

    summary = {}
    for _, state, _ in results:
        summary[state] = summary.get(state, 0) + 1
    report = {'checked': '2026-11-07', 'liveGameFolders': live_dirs, 'summary': summary,
              'files': [{'path': p, 'state': s, 'status': st} for p, s, st in results],
              'liveFilesNoLongerUsed': stale, 'livePagesNotInNewSitemap': old_only_pages}
    (PKG / 'live-compare.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'liveGameFolders': live_dirs, 'summary': summary,
                      'changedOrUnknown': [f"{p} ({s})" for p, s, _ in results if s not in ('new', 'unchanged')][:60],
                      'liveFilesNoLongerUsed': stale, 'livePagesNotInNewSitemap': old_only_pages}, indent=1))


if __name__ == '__main__':
    main()
