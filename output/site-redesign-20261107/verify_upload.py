"""Serve output/neocities-upload-20261107/site/ on its own and drive every page (dev tool, not published).
Fails on any missing file. Run from the repo root:  python output/site-redesign-20261107/verify_upload.py
Set CYSTATION_BASE=https://cystation.neocities.org to drive the live site instead (writes live-check.json)."""
import json, os, subprocess, sys, time
from pathlib import Path
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
PKG = HERE.parents[0] / 'neocities-upload-20261107'
SITE = PKG / 'site'
PORT = 8767
LIVE_BASE = os.environ.get('CYSTATION_BASE', '').rstrip('/')
BASE = LIVE_BASE or f'http://127.0.0.1:{PORT}'
MAIN = ['/', '/patches', '/why-480i', '/render-restore.html', '/render-restore/conker-skyboxes.html#notes',
        '/render-restore/tools-of-the-trade.html', '/projects', '/navigation', '/aboutme', '/credits', '/links',
        '/privacy', '/sitemap.xml', '/robots.txt', '/site.webmanifest', '/no-such-page/deeper']
GAMES = {'/tnd6480i/': ['', '#menu', '#overview', '#q-branch', '#options'],
         '/pd6480iperf/': ['', '#menu', '#editions', '#options', '#reading'],
         '/ys6480i/': ['', '#status', '#options'],
         '/fzerox/': ['', '#options'],
         '/killer-instinct-gold/': ['', '#options']}


def settle(page, ms=8000):
    """Wait for the network to go quiet, but not forever: looping video keeps streaming."""
    try:
        page.wait_for_load_state('networkidle', timeout=ms)
    except Exception:
        pass


def main():
    server = None
    if not LIVE_BASE:
        env = dict(os.environ, CYSTATION_ROOT=str(SITE), PORT=str(PORT))
        server = subprocess.Popen(['node', str(HERE / 'preview.cjs')], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                urlopen(BASE + '/', timeout=5); break
            except Exception:
                time.sleep(0.2)
        missing, failed, errors, requested = [], [], [], set()
        with sync_playwright() as p:
            browser = p.chromium.launch()
            ctx = browser.new_context(viewport={'width': 1280, 'height': 800})

            def watch(page, label):
                def on_response(r):
                    if r.url.startswith(BASE):
                        path = r.url[len(BASE):].split('?')[0].split('#')[0]
                        requested.add(path)
                        if r.status >= 400 and not path.startswith('/no-such-page'):
                            missing.append(f'{label}: {r.status} {path}')
                page.on('response', on_response)
                page.on('requestfailed', lambda r: failed.append(f'{label}: {r.url} {r.failure}') if r.url.startswith(BASE) and 'net::ERR_ABORTED' not in str(r.failure) else None)
                page.on('pageerror', lambda e: errors.append(f'{label}: {e}'))

            for route in MAIN:
                if route.endswith(('.xml', '.txt', '.webmanifest')):
                    # Fetched rather than opened: Neocities serves .webmanifest as a download.
                    resp = ctx.request.get(BASE + route)
                    requested.add(route)
                    if resp.status >= 400: missing.append(f'{route}: {resp.status} {route}')
                    continue
                page = ctx.new_page(); watch(page, route)
                page.goto(BASE + route, wait_until='networkidle')
                h = page.evaluate('document.documentElement.scrollHeight')
                for y in range(0, h + 800, 500):
                    page.evaluate(f'window.scrollTo(0,{y})'); page.wait_for_timeout(80)
                page.wait_for_load_state('networkidle'); page.close()

            for game, hashes in GAMES.items():
                for h in hashes:
                    page = ctx.new_page(); watch(page, game + h)
                    page.goto(BASE + game + h, wait_until='load', timeout=60000)
                    settle(page); page.wait_for_timeout(1200)
                    for key in ['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'ArrowRight']:
                        page.keyboard.press(key); page.wait_for_timeout(250)
                    settle(page); page.wait_for_timeout(500)
                    page.close()
            browser.close()
        files = {'/' + p.relative_to(SITE).as_posix() for p in SITE.rglob('*') if p.is_file()}
        served = {r if not r.endswith('/') else r + 'index.html' for r in requested}
        served |= {r + '.html' for r in requested if '.' not in r.rsplit('/', 1)[-1]}
        never = sorted(f for f in files if f not in served)
        report = {'missingFiles': sorted(set(missing)), 'failedRequests': sorted(set(failed)),
                  'pageErrors': sorted(set(errors)), 'requestedCount': len(requested),
                  'packageFiles': len(files), 'neverRequestedInThisRun': never}
        (PKG / ('live-check.json' if LIVE_BASE else 'package-check.json')).write_text(json.dumps(report, indent=2), encoding='utf-8')
        print(json.dumps({k: (v if not isinstance(v, list) else (v[:25] if v else [])) for k, v in report.items()
                          if k != 'neverRequestedInThisRun'}, indent=1))
        print('never requested in this run:', len(never), '(e.g. sounds that need specific menu choices)')
        return 1 if (missing or failed) else 0
    finally:
        if server:
            server.terminate()
            try:
                server.wait(timeout=5)
            except Exception:
                server.kill()


if __name__ == '__main__':
    sys.exit(main())
