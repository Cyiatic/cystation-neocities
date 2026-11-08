"""Rendered checks for the CyStation redesign (dev tool, not published).
Run from the repo root with the preview on :8766:  python output/site-redesign-20261107/verify.py"""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:8766'
OUT = Path(__file__).parent
SHOTS = OUT / 'shots'
SHOTS.mkdir(exist_ok=True)
PAGES = ['/', '/patches', '/why-480i', '/render-restore.html', '/render-restore/conker-skyboxes.html',
         '/render-restore/tools-of-the-trade.html', '/projects', '/navigation', '/aboutme', '/credits',
         '/links', '/privacy', '/no-such-page/deeper']
VIEWPORTS = {'desktop': (1440, 900), 'mobile': (390, 844), 'small': (320, 640)}

PAGE_CHECKS = r'''() => {
  const imgs = [...document.images];
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
  const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  const meta = n => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.content || null;
  return {
    title: document.title,
    description: meta('description'),
    ogImage: meta('og:image'),
    canonical: document.querySelector('link[rel=canonical]')?.href || null,
    h1: document.querySelectorAll('h1').length,
    duplicateIds: dup,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    brokenImages: imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src')),
    imagesWithoutAlt: imgs.filter(i => !i.hasAttribute('alt')).map(i => i.getAttribute('src')),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    titleFont: document.querySelector('.gilt') ? getComputedStyle(document.querySelector('.gilt')).fontFamily : null,
    height: document.documentElement.scrollHeight
  };
}'''


def settle(page):
    """Scroll through the page so lazy images load, then return to the top."""
    h = page.evaluate('document.documentElement.scrollHeight')
    y = 0
    while y < h:
        page.evaluate(f'window.scrollTo(0, {y})')
        page.wait_for_timeout(120)
        y += 500
        h = page.evaluate('document.documentElement.scrollHeight')
    page.wait_for_load_state('networkidle')
    page.evaluate('window.scrollTo(0, 0)')
    page.wait_for_timeout(200)


def main():
    report = {'pages': {}, 'problems': []}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for vp_name, (w, h) in VIEWPORTS.items():
            ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
            for path in PAGES:
                page = ctx.new_page()
                errors, failed = [], []
                page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
                page.on('pageerror', lambda e: errors.append(str(e)))
                page.on('requestfailed', lambda r: failed.append(r.url))
                page.on('response', lambda r: failed.append(f'{r.status} {r.url}') if r.url.startswith(BASE) and r.status >= 400 and not r.url.endswith('/no-such-page/deeper') else None)
                resp = page.goto(BASE + path, wait_until='networkidle')
                settle(page)
                info = page.evaluate(PAGE_CHECKS)
                info.update(status=resp.status, consoleErrors=errors, failedRequests=failed)
                report['pages'][f'{vp_name} {path}'] = info
                name = (path.strip('/').replace('/', '_').replace('.html', '') or 'home')
                if vp_name in ('desktop', 'mobile'):
                    page.screenshot(path=str(SHOTS / f'{name}-{vp_name}.png'), full_page=True)
                bad = []
                if info['overflowX'] > 1: bad.append(f"horizontal overflow {info['overflowX']}px")
                if info['brokenImages']: bad.append(f"broken images {info['brokenImages']}")
                if info['imagesWithoutAlt']: bad.append(f"images without alt {info['imagesWithoutAlt']}")
                if info['h1'] != 1: bad.append(f"h1 count {info['h1']}")
                if info['duplicateIds']: bad.append(f"duplicate ids {info['duplicateIds']}")
                if not info['description']: bad.append('missing meta description')
                if not info['ogImage']: bad.append('missing og:image')
                if errors: bad.append(f'console errors {errors}')
                if failed: bad.append(f'failed requests {failed}')
                if info['bodyBg'] != 'rgb(0, 0, 96)': bad.append(f"body background {info['bodyBg']}")
                for b in bad:
                    report['problems'].append(f'{vp_name} {path}: {b}')
                page.close()
            ctx.close()

        # Keyboard: tab order and visible focus on the homepage.
        ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = ctx.new_page()
        page.goto(BASE + '/', wait_until='networkidle')
        stops = []
        for _ in range(14):
            page.keyboard.press('Tab')
            stops.append(page.evaluate('''() => { const e = document.activeElement; const s = getComputedStyle(e);
              return { text: (e.innerText || e.getAttribute('aria-label') || e.alt || '').trim().slice(0, 40), href: e.getAttribute('href'),
                       outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor }; }'''))
        report['keyboardHome'] = stops
        if any(s['outline'].startswith('none') for s in stops):
            report['problems'].append('keyboard: a focus stop on the homepage has no visible outline')
        page.keyboard.press('Shift+Tab')
        page.goto(BASE + '/', wait_until='networkidle')
        page.keyboard.press('Tab')
        page.keyboard.press('Enter')
        page.wait_for_timeout(300)
        report['skipLinkTarget'] = page.evaluate('location.hash')

        # Native return paths and shortcuts on the protected game pages.
        returns = {}
        for game, sel, expect in [('/tnd6480i/', 'a[data-action="station"]', '/patches#tnd6480i'),
                                  ('/pd6480iperf/', 'a[href="/patches#pd6480iperf"]', '/patches#pd6480iperf'),
                                  ('/ys6480i/', 'a[href="/patches#ys6480i"]', '/patches#ys6480i')]:
            errs = []
            page = ctx.new_page()
            page.on('pageerror', lambda e: errs.append(str(e)))
            page.goto(BASE + game, wait_until='networkidle')
            hrefs = page.eval_on_selector_all(sel, 'els => els.map(e => e.getAttribute("href"))')
            page.goto(BASE + expect, wait_until='networkidle')
            page.wait_for_timeout(300)
            target = page.evaluate('''() => { const t = document.querySelector(':target'); if (!t) return null;
               const r = t.getBoundingClientRect(); return { id: t.id, top: Math.round(r.top), visible: r.top >= 0 && r.top < innerHeight }; }''')
            returns[game] = {'returnHrefs': hrefs, 'landsOn': target, 'pageErrors': errs}
            if expect not in hrefs: report['problems'].append(f'{game}: native return link to {expect} missing')
            if not target or not target['visible']: report['problems'].append(f'{expect}: target not visible after return')
            page.close()
        for shortcut, check in [('/tnd6480i/#q-branch', 'document.querySelector("#screen")?.dataset.page'),
                                ('/pd6480iperf/#editions', 'location.hash')]:
            errs = []
            page = ctx.new_page()
            page.on('pageerror', lambda e: errs.append(str(e)))
            page.goto(BASE + shortcut, wait_until='networkidle')
            page.wait_for_timeout(1500)
            returns[shortcut] = {'state': page.evaluate(check), 'pageErrors': errs}
            page.screenshot(path=str(SHOTS / f'shortcut-{shortcut.strip("/").split("/")[0]}.png'))
            if errs: report['problems'].append(f'{shortcut}: page errors {errs}')
            page.close()
        report['gameReturns'] = returns

        # Conker viewer behaviour.
        page = ctx.new_page()
        page.goto(BASE + '/render-restore/conker-skyboxes.html', wait_until='networkidle')
        viewer = {'options': page.eval_on_selector_all('#skybox-choice option', 'o => o.length')}
        page.select_option('#skybox-choice', 'skybox_05')
        page.wait_for_function('document.querySelector("#panorama").style.backgroundImage.includes("skybox_05")', timeout=5000)
        viewer['afterSelect'] = page.evaluate('({bg: document.querySelector("#panorama").style.backgroundImage, busy: document.querySelector("#panorama").getAttribute("aria-busy"), hash: location.hash, caption: document.querySelector("#skybox-caption").textContent})')
        page.focus('#panorama')
        before = page.evaluate('document.querySelector("#panorama").style.backgroundPosition')
        page.keyboard.press('ArrowRight')
        viewer['panned'] = [before, page.evaluate('document.querySelector("#panorama").style.backgroundPosition')]
        page.goto(BASE + '/render-restore/conker-skyboxes.html#notes', wait_until='networkidle')
        viewer['notesOpenFromHash'] = page.evaluate('document.querySelector("#notes").open')
        report['conkerViewer'] = viewer
        if viewer['options'] != 7 or viewer['panned'][0] == viewer['panned'][1] or not viewer['notesOpenFromHash']:
            report['problems'].append(f'conker viewer: {viewer}')
        page.close()
        browser.close()

    (OUT / 'verify.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'problems': report['problems'], 'keyboardHome': report['keyboardHome'][:6],
                      'skipLinkTarget': report['skipLinkTarget'], 'gameReturns': report['gameReturns'],
                      'conkerViewer': report['conkerViewer']}, indent=1, ensure_ascii=False))
    return 1 if report['problems'] else 0


if __name__ == '__main__':
    sys.exit(main())
