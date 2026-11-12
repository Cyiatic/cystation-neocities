"""Build a clean Neocities upload folder for CyStation (dev tool, not published).

Copies only what the public site loads into output/neocities-upload-20261107/site/:
- main pages plus every local file they reference (HTML src/href/srcset, og:image, CSS url(), manifest icons),
- the Conker skybox strips the viewer loads by name,
- the native game-menu folders, keeping a file only when that game's own HTML/JS/CSS/JSON names it
  (licence files always kept; *.md, *.py, *.cjs and other dev files left out).
Writes manifest.json next to site/. Run from the repo root:  python output/site-redesign-20261107/build_upload.py
"""
import hashlib, json, re, shutil
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import urljoin, urlsplit, unquote

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output' / 'neocities-upload-20261107'
SITE = OUT / 'site'
DOMAIN = 'cystation.neocities.org'

MAIN_PAGES = ['index.html', 'patches.html', 'why-480i.html', 'render-restore.html', 'projects.html',
              'navigation.html', 'aboutme.html', 'credits.html', 'links.html', 'privacy.html', 'not_found.html',
              'render-restore/conker-skyboxes.html', 'render-restore/tools-of-the-trade.html']
ROOT_FILES = ['style.css', 'analytics.js', 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'favicon.ico',
              'favicon-32.png', 'apple-touch-icon.png', 'render-restore/skybox-viewer.css', 'render-restore/skybox-viewer.js']
GAME_DIRS = ['tnd6480i', 'pd6480iperf', 'ys6480i', 'fzerox', 'killer-instinct-gold', 'patch-menu']
SHARED = {'fzerox': ['patch-menu'], 'killer-instinct-gold': ['patch-menu'], 'patch-menu': ['fzerox', 'killer-instinct-gold']}
TEXT_EXT = {'.html', '.js', '.css', '.json', '.webmanifest', '.svg', '.xml'}
DEV_EXT = {'.md', '.py', '.cjs', '.log', '.bak', '.orig', '.psd', '.xcf'}
# Neocities' free-account whitelist (neocities.org/site_files/allowed_types, checked 7 Nov 2026).
FREE_TYPES = set('apng asc atom avif bin cjs css csv dae eot epub geojson gif glb glsl gltf gpg htm html ico jpeg jpg js json '
                 'jxl key kml knowl less manifest map markdown md mf mid midi mjs mtl obj opml osdx otf pdf pgp pls png py rdf '
                 'resolveHandle rss sass scss sf2 svg text toml ts tsv ttf txt webapp webmanifest webp woff woff2 xcf xml xsl xslt '
                 'yaml yml'.split())


class Refs(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for key in ('href', 'src', 'poster', 'data-src'):
            if a.get(key): self.refs.append(a[key])
        if a.get('srcset'):
            self.refs += [part.strip().split(' ')[0] for part in a['srcset'].split(',') if part.strip()]
        if tag == 'meta' and (a.get('property') or a.get('name') or '').startswith(('og:image', 'twitter:image')) and a.get('content'):
            self.refs.append(a['content'])


def local_path(page_rel, ref):
    """Map a reference on page_rel to a repo-relative file path, or None if external/not a file."""
    base = 'https://' + DOMAIN + '/' + page_rel
    url = urlsplit(urljoin(base, ref.strip()))
    if url.scheme not in ('http', 'https') or url.netloc != DOMAIN:
        return None
    path = unquote(url.path).lstrip('/')
    if not path or path.endswith('/'):
        return None  # directory links: pages and game folders are handled explicitly
    p = ROOT / path
    if p.is_file():
        return path
    if not PurePosixPath(path).suffix and (ROOT / (path + '.html')).is_file():
        return None  # extensionless page link; the page itself is in MAIN_PAGES
    return None


def main_site_files():
    files, missing = set(MAIN_PAGES) | set(ROOT_FILES), []
    for page in MAIN_PAGES:
        parser = Refs(); parser.feed((ROOT / page).read_text(encoding='utf-8'))
        for ref in parser.refs:
            if ref.startswith(('#', 'mailto:', 'data:', 'javascript:')): continue
            lp = local_path(page, ref)
            if lp: files.add(lp)
    for css in ['style.css', 'render-restore/skybox-viewer.css']:
        for ref in re.findall(r'url\(\s*["\']?([^)"\']+)', (ROOT / css).read_text(encoding='utf-8')):
            if ref.startswith(('data:', 'http')): continue
            lp = local_path(css, ref)
            if lp: files.add(lp)
            else: missing.append(f'{css}: {ref}')
    for icon in json.loads((ROOT / 'site.webmanifest').read_text(encoding='utf-8')).get('icons', []):
        files.add(icon['src'].lstrip('/'))
    files |= {p.relative_to(ROOT).as_posix() for p in (ROOT / 'render-restore/assets/conker-skyboxes').glob('*.jpg')}
    return files, missing


def game_files():
    chosen, skipped = set(), []
    for d in GAME_DIRS:
        all_files = [p for p in (ROOT / d).rglob('*') if p.is_file()]
        corpus_dirs = [d] + SHARED.get(d, [])
        corpus = ''.join((p.read_text(encoding='utf-8', errors='ignore'))
                         for cd in corpus_dirs for p in (ROOT / cd).rglob('*')
                         if p.is_file() and p.suffix.lower() in TEXT_EXT)
        # Template paths with a fixed extension, e.g. `assets/hud/${id}.png`: keep that folder's files of that type.
        # Generic loaders such as `assets/${file}` are ignored; their file names appear as literals elsewhere.
        dynamic_dirs = {(m[0].rstrip('/'), '.' + m[1].lower()) for m in re.findall(r'`((?:[\w.-]+/)+)\$\{[^`}]*\}\.(\w+)', corpus)}
        # Quoted literals that look like asset stems (hyphenated or numbered), e.g. 'native-scene'.
        literals = set(re.findall(r"""['"`]([A-Za-z0-9_.]*[-0-9][A-Za-z0-9_.-]*)['"`]""", corpus))
        for p in all_files:
            rel = p.relative_to(ROOT).as_posix()
            inner = p.relative_to(ROOT / d).as_posix()
            if p.suffix.lower() in DEV_EXT or any(part.startswith('.') for part in p.parts):
                skipped.append((rel, 'development file')); continue
            if p.name == 'index.html' and p.parent == ROOT / d:
                chosen.add(rel); continue
            if p.name.upper().startswith('OFL') or p.name.upper().startswith('LICENSE'):
                chosen.add(rel); continue
            named = (p.name in corpus or p.stem in literals
                     or any(len(lit) > 4 and p.stem.startswith(lit + '-') for lit in literals))
            in_dynamic_dir = any(inner.startswith(dd + '/') and '/' not in inner[len(dd) + 1:] and p.suffix.lower() == ext
                                 for dd, ext in dynamic_dirs)
            if named or in_dynamic_dir:
                chosen.add(rel)
            else:
                skipped.append((rel, 'not referenced by the page code'))
    return chosen, skipped


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    main_files, css_missing = main_site_files()
    gfiles, skipped = game_files()
    files = sorted(main_files | gfiles)
    if SITE.exists():
        shutil.rmtree(SITE)
    for rel in files:
        dst = SITE / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / rel, dst)
    rows = []
    for rel in files:
        p = ROOT / rel
        ext = p.suffix.lower().lstrip('.')
        rows.append({'path': rel, 'bytes': p.stat().st_size, 'sha256': sha(p),
                     'area': rel.split('/')[0] if rel.split('/')[0] in GAME_DIRS else 'main',
                     'freeAccountOK': ext in FREE_TYPES})
    report = {'built': '2026-11-07', 'root': 'site/', 'files': rows,
              'totalBytes': sum(r['bytes'] for r in rows),
              'needsSupporter': [r['path'] for r in rows if not r['freeAccountOK']],
              'leftOut': [{'path': a, 'reason': b} for a, b in sorted(skipped)],
              'cssUnresolved': css_missing}
    (OUT / 'manifest.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    by_area = {}
    for r in rows:
        by_area.setdefault(r['area'], [0, 0]); by_area[r['area']][0] += 1; by_area[r['area']][1] += r['bytes']
    print(json.dumps({'files': len(rows), 'MB': round(report['totalBytes'] / 1e6, 1),
                      'byArea': {k: f'{v[0]} files, {v[1]/1e6:.1f} MB' for k, v in sorted(by_area.items())},
                      'needsSupporter': len(report['needsSupporter']), 'leftOut': len(skipped),
                      'cssUnresolved': css_missing}, indent=1))


if __name__ == '__main__':
    main()
