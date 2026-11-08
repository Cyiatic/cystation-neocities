"""One-off generator for CyStation's smaller pages (dev tool, not published).
Writes plain static HTML that shares the header/footer markup used by the hand-written pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = 'https://cystation.neocities.org'
ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
EXT = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4.5 11.5l7-7M6 4.5h5.5V10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
NEW_TAB = '<span class="visually-hidden"> (opens in a new tab)</span>'


def page(*, file, path, title, description, og_description, body_class, main, base='', current=None, og_type='website', noindex=False):
    """base is '' for root-relative pages or '/' for the 404 page, which Neocities serves at any URL."""
    b = base
    nav_items = [
        ('patches', f'<span>480<span class="lc">i</span> Patches</span>'),
        ('render-restore.html', 'Render Restore'),
        ('projects', 'Timeline'),
    ]
    nav = '\n'.join(
        f'        <li><a href="{b}{href}"{" aria-current=\"page\"" if current == href else ""}>{label}</a></li>'
        for href, label in nav_items)
    robots = '\n  <meta name="robots" content="noindex">' if noindex else ''
    canonical = '' if noindex else f'\n  <link rel="canonical" href="{SITE}{path}">'
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">{canonical}{robots}
  <meta name="theme-color" content="#000060">
  <meta property="og:type" content="{og_type}">
  <meta property="og:site_name" content="CyStation">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{og_description}">
  <meta property="og:url" content="{SITE}{path}">
  <meta property="og:image" content="{SITE}/images/site/og-cystation.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Conker leaning on the Rareware R beside the CyStation wordmark">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="{b}favicon.ico" sizes="any">
  <link rel="icon" href="{b}favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="{b}apple-touch-icon.png">
  <link rel="manifest" href="{b}site.webmanifest">
  <link rel="preload" href="{b}fonts/limelight-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{b}style.css?v=20261107-rw">
  <script src="{b}analytics.js" defer></script>
</head>
<body class="{body_class}">
  <a class="skip" href="#main">Skip to main content</a>
  <header class="masthead">
    <nav class="bar" aria-label="Main">
      <a class="bar__brand" href="{b or './'}"><img src="{b}images/goldballoon.webp" width="39" height="50" alt=""><span>CyStation</span></a>
      <ul class="bar__nav">
{nav}
      </ul>
    </nav>
  </header>

  <main id="main" class="page">
{main}
  </main>

  <footer class="foot">
    <h2 class="gilt gilt--sm foot__title">Outposts</h2>
    <ul class="outposts">
      <li><a href="https://github.com/Cyiatic" target="_blank" rel="noopener"><img src="{b}images/site/outpost-github-sgi-96.webp" width="48" height="48" loading="lazy" decoding="async" alt="">GitHub{NEW_TAB}</a></li>
      <li><a href="https://archive.org/details/@cyiatic" target="_blank" rel="noopener"><img src="{b}images/site/outpost-iararenobg-96.webp" width="48" height="48" loading="lazy" decoding="async" alt="">Internet Archive{NEW_TAB}</a></li>
      <li><a href="https://x.com/Kypherion" target="_blank" rel="noopener"><img src="{b}images/site/outpost-twitternobgrare-96.webp" width="48" height="48" loading="lazy" decoding="async" alt="">Twitter{NEW_TAB}</a></li>
      <li><a href="https://www.youtube.com/@Cyiatic" target="_blank" rel="noopener"><img src="{b}images/site/outpost-ytnobgrare-96.webp" width="48" height="48" loading="lazy" decoding="async" alt="">YouTube{NEW_TAB}</a></li>
      <li><a href="{b}aboutme"{" aria-current=\"page\"" if current == "aboutme" else ""}><img src="{b}images/site/outpost-conktail-96.webp" width="19" height="48" loading="lazy" decoding="async" alt="">About</a></li>
      <li><a href="{b}credits"{" aria-current=\"page\"" if current == "credits" else ""}><img src="{b}images/goldballoon.webp" width="39" height="50" loading="lazy" decoding="async" alt="">Credits</a></li>
    </ul>
    <p class="foot__links"><a href="{b}navigation"{" aria-current=\"page\"" if current == "navigation" else ""}>Directory</a> <span aria-hidden="true">·</span> <a href="{b}links"{" aria-current=\"page\"" if current == "links" else ""}>Links</a> <span aria-hidden="true">·</span> <a href="{b}privacy"{" aria-current=\"page\"" if current == "privacy" else ""}>Privacy</a></p>
    <p class="foot__fine">Kept by Cyiatic. Game artwork belongs to Rare Ltd. and Nintendo; CyStation is an unofficial fan site.</p>
  </footer>
</body>
</html>
'''


PAGES = {}

PAGES['navigation.html'] = dict(
    path='/navigation', title='Directory · CyStation', body_class='p-directory', current='navigation',
    description='Every page on CyStation in one place: 480i patches, Render Restore filings, the project timeline and supporting pages.',
    og_description='Every page on CyStation in one place.',
    main=f'''    <h1 class="gilt">Directory</h1>
    <p class="lede">Every page on CyStation, in one place.</p>
    <nav class="map" aria-label="Complete CyStation map">
      <section aria-labelledby="map-patches">
        <h2 class="gilt gilt--sm" id="map-patches"><a href="patches">480<span class="lc">i</span> Patches</a></h2>
        <ul>
          <li><a href="pd6480iperf/">Perfect Dark · PD6480iPerf</a><span>The Perfect Dark menu: editions, install guide, credits.</span></li>
          <li><a href="pd6480iperf/#editions">PD6480iPerf downloads &amp; install</a></li>
          <li><a href="tnd6480i/">Tomorrow Never Dies 64 · TND6480i</a><span>The mission dossier: patch, briefing, installation.</span></li>
          <li><a href="tnd6480i/#q-branch">TND6480i downloads &amp; install</a></li>
          <li><a href="patches#cbfd480i">Conker’s Bad Fur Day · CBFD480i</a><span>In development, no public build.</span></li>
          <li><a href="patches#dkr480i">Diddy Kong Racing · DKR480i</a><span>In development, no public build.</span></li>
          <li><a href="ys6480i/">Yoshi’s Story · YS6480i</a><span>The storybook menu: project notes and build status. No public build.</span></li>
          <li><a href="fzerox/">F-Zero X · F0X6480iDD</a><span>The F-Zero X menu and project notes. No public build.</span></li>
          <li><a href="killer-instinct-gold/">Killer Instinct Gold · KIG480i</a><span>The Killer Instinct Gold menu and project notes. No public build.</span></li>
          <li><a href="why-480i">Why 480i?</a><span>What a 480i patch changes, in plain language.</span></li>
        </ul>
      </section>
      <section aria-labelledby="map-restore">
        <h2 class="gilt gilt--sm" id="map-restore"><a href="render-restore.html">Render Restore</a></h2>
        <ul>
          <li><a href="render-restore/conker-skyboxes.html">Conker’s Skyboxes · RR-001</a><span>Seven panoramas from the retail ROM, with the research.</span></li>
          <li><a href="render-restore/tools-of-the-trade.html">Tools of the Trade · RR-000</a><span>A composite from magazine scans and official renders.</span></li>
          <li><a href="https://archive.org/details/@cyiatic" target="_blank" rel="noopener">Internet Archive uploads{NEW_TAB}</a><span>Demo discs, CD rips and other uploads.</span></li>
        </ul>
      </section>
      <section aria-labelledby="map-station">
        <h2 class="gilt gilt--sm" id="map-station">Around the site</h2>
        <ul>
          <li><a href="./">Home</a></li>
          <li><a href="projects">Timeline</a><span>Every project since 2015.</span></li>
          <li><a href="aboutme">About</a></li>
          <li><a href="credits">Credits</a></li>
          <li><a href="links">Links</a></li>
          <li><a href="privacy">Privacy</a></li>
        </ul>
      </section>
    </nav>''')

PAGES['aboutme.html'] = dict(
    path='/aboutme', title='About · CyStation', body_class='p-about', current='aboutme',
    description='About Cyiatic, the preservation work behind CyStation, and a lifelong appreciation for Rare.',
    og_description='About Cyiatic and a lifelong appreciation for Rare.',
    main='''    <h1 class="gilt">About Me</h1>
    <figure class="aside-art"><img src="images/site/conker-cigar.webp" width="220" height="289" decoding="async" alt="Conker the squirrel with a cigar, grinning"></figure>
    <div class="prose">
      <p class="lede dropcap">Hey there, my (screen)name is Cyiatic. I'm a fan of video games and video game related content. I like helping preserve them, as well as the best way(s) to play them. As you can probably tell by the theming of the site, I'm also a fan of Rare(ware).</p>
      <h2 class="gilt gilt--sm">Fan of Rare, eh?</h2>
      <p>I grew up playing various titles such as Donkey Kong Country (GBC and Wii), Diddy Kong Racing DS, and Star Fox Adventures. I was also introduced to Banjo at a young age via a neighbor.</p>
      <p>Arguably the biggest contribution to my love of Rare was my birthday buddy. He gave me his N64 along with titles such as Conker's Bad Fur Day, GoldenEye 007, and Killer Instinct Gold, just to name a few.</p>
      <p>The ability to enjoy so many Rare titles at a young age has left a positive impact on my gaming experience. When I think of a company dedicated to the consumer, I think of the golden era of Rare. From selling the whole game upon release, to hosting their own website, to having the guts to experiment with new graphical styles and minimal documentation, you can really see the love and attention to detail shine in the product. I haven't 100% every game yet, but even so I have to give the barn boys kudos for dedication to their craft.</p>
    </div>''')

PAGES['credits.html'] = dict(
    path='/credits', title='Credits · CyStation', body_class='p-credits', current='credits',
    description='Credits for the artwork, lettering, fonts and tools behind CyStation.',
    og_description='Credits for the artwork, lettering and fonts behind CyStation.',
    main=f'''    <h1 class="gilt">Credits</h1>
    <div class="prose">
      <p class="lede">Original game artwork and renders by Rare Limited and Nintendo.</p>
      <p>The timeline month lettering uses the Banjo-Kazooie and Banjo-Tooie dialogue font, ripped by Malek Masoud.</p>
      <p>Section titles are set in Limelight by Sorkin Type, used under the <a href="fonts/OFL-Limelight.txt">SIL Open Font License</a>.</p>
      <p>The look follows Rare’s own Rarewhere site as it stood in 2000. CyStation started out on <a href="https://codepen.io/sadness97/full/XJbLxNj" target="_blank" rel="noopener">Sadgrl’s layout builder{NEW_TAB}</a>.</p>
      <p>Patch credits live with each project: the <a href="pd6480iperf/">Perfect Dark</a> and <a href="tnd6480i/">Tomorrow Never Dies 64</a> pages list the decompilation, mod and music credits.</p>
    </div>''')

PAGES['links.html'] = dict(
    path='/links', title='Links · CyStation', body_class='p-links', current='links',
    description='Find Cyiatic’s patch sources, preservation uploads and videos across the web.',
    og_description='Cyiatic’s patch sources, uploads and videos across the web.',
    main=f'''    <h1 class="gilt">Links</h1>
    <p class="lede">Places to find my uploads, videos, and preservation work.</p>
    <ul class="map-list">
      <li><a href="https://github.com/Cyiatic" target="_blank" rel="noopener">GitHub{NEW_TAB}</a><span>Patch sources, releases and tools.</span></li>
      <li><a href="https://archive.org/details/@cyiatic" target="_blank" rel="noopener">Internet Archive{NEW_TAB}</a><span>Preservation uploads.</span></li>
      <li><a href="https://www.youtube.com/@Cyiatic" target="_blank" rel="noopener">YouTube{NEW_TAB}</a><span>Videos.</span></li>
      <li><a href="https://x.com/Kypherion" target="_blank" rel="noopener">Twitter / X{NEW_TAB}</a><span>Updates.</span></li>
    </ul>''')

PAGES['privacy.html'] = dict(
    path='/privacy', title='Privacy · CyStation', body_class='p-privacy', current='privacy',
    description='How CyStation handles your data: a static fan site with no accounts, forms, cookies, ads or tracking scripts.',
    og_description='No accounts, forms, cookies, ads or tracking scripts.',
    main='''    <h1 class="gilt">Privacy</h1>
    <div class="prose">
      <p class="lede">CyStation is a static fan site. It has no accounts, sign-ups, forms, comments, cookies or ads, and it doesn’t ask you for anything.</p>

      <h2 class="gilt gilt--sm">Hosting</h2>
      <p>The site is hosted by <a href="https://neocities.org" target="_blank" rel="noopener">Neocities<span class="visually-hidden"> (opens in a new tab)</span></a>. Like any web host, Neocities receives your IP address and browser details when it serves a page, and it keeps basic view counts for the site owner. Its handling of that data is covered by the <a href="https://neocities.org/privacy" target="_blank" rel="noopener">Neocities privacy policy<span class="visually-hidden"> (opens in a new tab)</span></a>.</p>

      <h2 class="gilt gilt--sm">Analytics</h2>
      <!-- When analytics is on (see analytics.js), replace the paragraph below with:
      <p>CyStation counts page views with GoatCounter, which sets no cookies and stores no personal data. Counting is skipped when your browser sends Do Not Track. See the <a href="https://www.goatcounter.com/help/privacy">GoatCounter privacy notes</a>.</p>
      -->
      <p>CyStation runs no analytics or tracking scripts of its own. The only visit numbers are the host’s view counts described above.</p>

      <h2 class="gilt gilt--sm">Settings kept in your browser</h2>
      <p>The Tomorrow Never Dies 64 and Perfect Dark menus remember your sound and motion choices in your browser’s local storage. Those settings stay on your device and are never sent anywhere; clearing your site data removes them.</p>

      <h2 class="gilt gilt--sm">Other sites</h2>
      <p>Downloads and source files open on GitHub, uploads on the Internet Archive, and some full-size originals on Imgur. Videos and updates live on YouTube and X (Twitter). Those services only see you when you follow a link to them, and their own privacy policies apply there.</p>

      <h2 class="gilt gilt--sm">Questions</h2>
      <p>Get in touch through <a href="https://github.com/Cyiatic" target="_blank" rel="noopener">GitHub<span class="visually-hidden"> (opens in a new tab)</span></a> or <a href="https://x.com/Kypherion" target="_blank" rel="noopener">X (Twitter)<span class="visually-hidden"> (opens in a new tab)</span></a>.</p>
      <p class="meta">Last updated 7 November 2026.</p>
    </div>''')

PAGES['not_found.html'] = dict(
    path='/not_found.html', title='Page not found · CyStation', body_class='p-lost', base='/', noindex=True,
    description='This CyStation page could not be found.',
    og_description='This CyStation page could not be found.',
    main=f'''    <div class="lost">
      <h1 class="gilt">Lost in the archive</h1>
      <p class="lede">There’s nothing filed at this address. It may have moved when the site was rebuilt, or the link has a typo.</p>
      <ul class="acts">
        <li><a class="btn" href="/">CyStation home {ARROW}</a></li>
        <li><a class="go" href="/patches"><span>480<span class="lc">i</span> Patches</span></a></li>
        <li><a class="go" href="/render-restore.html">Render Restore</a></li>
        <li><a class="go" href="/navigation">Directory</a></li>
      </ul>
      <figure><img src="/images/site/cyfound-960.webp" width="960" height="506" decoding="async" alt="Rareware celebration scene: the R logo on a stone plinth, a Nintendo hot-air balloon and a crowd of Rare characters under spotlights"></figure>
    </div>''')

for name, spec in PAGES.items():
    file = ROOT / name
    html = page(file=file, **spec)
    file.write_text(html, encoding='utf-8')
    print('wrote', name, len(html))
