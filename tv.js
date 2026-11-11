/* CyStation: Rare TV.
   A small gold-framed TV in the corner of the main pages that plays old Rare and Nintendo 64 commercials; on the
   iQue Player page (<body data-tv="ique">) it becomes the iQue TV and plays only iQue videos.
   It starts switched off and loads nothing until someone turns it on. For the rest of the visit it carries on
   from page to page with the same ad at the same spot, after a blink of static; each lineup keeps its own channel
   and spot, while power, sound, size and whether it was put away are shared. Small screens get a TV icon instead
   of the set. With reduced motion or data saver it never starts by itself, and without this script or H.264 video
   there is no TV at all. */
(function () {
  'use strict';
  var me = document.currentScript, doc = document;
  if (!me || !window.URL || !window.requestAnimationFrame || !window.matchMedia || !doc.body) return;
  var test = doc.createElement('video');
  if (!test.canPlayType || !test.canPlayType('video/mp4; codecs="avc1.4D401E, mp4a.40.2"')) return;

  var VER = '20261110';
  // Oldest first. f: the clip in tv/, t: the game, m: what the clip is. first: where a first visit tunes in.
  var LINEUPS = {
    rare: { name: 'Rare TV', ident: 'Rare TV', first: 3, ch: [
      { f: 'goldeneye-007-jp', t: 'GoldenEye 007', m: 'Japanese TV ad, 1997' },
      { f: 'diddy-kong-racing-jp', t: 'Diddy Kong Racing', m: 'Japanese TV ad, 1997' },
      { f: 'yoshis-story', t: 'Yoshi’s Story', m: 'US TV ad, 1998' },
      { f: 'banjo-kazooie', t: 'Banjo-Kazooie', m: 'US TV ad, 1998' },
      { f: 'banjo-kazooie-keebler', t: 'Banjo-Kazooie × Keebler', m: 'tie-in ad, 1998' },
      { f: 'jet-force-gemini', t: 'Jet Force Gemini', m: 'Nordic TV ad, 1999' },
      { f: 'perfect-dark', t: 'Perfect Dark', m: 'US TV ad, 2000' },
      { f: 'banjo-tooie', t: 'Banjo-Tooie', m: 'US TV ad, 2000' },
      { f: 'dinosaur-planet', t: 'Dinosaur Planet', m: 'trailer for the unreleased game, 2000' },
      { f: 'conker', t: 'Conker’s Bad Fur Day', m: 'US TV ad, 2001' },
      { f: 'f-zero-x-ique', t: 'F-Zero X', m: 'iQue Player trailer, 2004' }
    ] },
    // In the order the games came out on the iQue Player.
    ique: { name: 'iQue TV', ident: '<span class="lc">i</span>Que TV', first: 0, ch: [
      { f: 'ique-player', t: 'iQue Player', m: 'the opening of iQue’s 2004 game reel' },
      { f: 'ique-dr-mario-64', t: 'Dr. Mario 64', m: 'from iQue’s game reel; out Nov 2003' },
      { f: 'ique-super-mario-64', t: 'Super Mario 64', m: 'iQue trailer; out Nov 2003' },
      { f: 'ique-ocarina-of-time', t: 'Zelda: Ocarina of Time', m: 'from iQue’s game reel; out Nov 2003' },
      { f: 'ique-star-fox-64', t: 'Star Fox 64', m: 'from iQue’s game reel; out Nov 2003' },
      { f: 'ique-wave-race-64', t: 'Wave Race 64', m: 'from iQue’s game reel; out Nov 2003' },
      { f: 'ique-mario-kart-64', t: 'Mario Kart 64', m: 'iQue trailer; out Dec 2003' },
      { f: 'f-zero-x-ique', t: 'F-Zero X', m: 'iQue trailer; out Feb 2004' },
      { f: 'ique-yoshis-story', t: 'Yoshi’s Story', m: 'iQue trailer; out Mar 2004' },
      { f: 'ique-paper-mario', t: 'Paper Mario', m: 'iQue trailer; out Jun 2004' },
      { f: 'ique-sin-and-punishment', t: 'Sin and Punishment', m: 'iQue trailer; out Sep 2004' },
      { f: 'ique-super-smash-bros', t: 'Super Smash Bros.', m: 'iQue trailer; out Nov 2005' }
    ] }
  };
  var which = doc.body.getAttribute('data-tv') === 'ique' ? 'ique' : 'rare';
  var L = LINEUPS[which], CH = L.ch, FIRST = L.first;
  var DIR = new URL('tv/', me.src);
  var KEEP = 'cystation-tv', NOW = 'cystation-tv-now';
  var wide = matchMedia('(min-width: 80rem)'), still = matchMedia('(prefers-reduced-motion: reduce)');
  var saver = !!(navigator.connection && navigator.connection.saveData);

  function read(kind, key) { try { return JSON.parse(window[kind].getItem(key)) || {}; } catch (e) { return {}; } }
  function write(kind, key, v) { try { window[kind].setItem(key, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  function wrap(n) { n = Math.floor(+n); n = isFinite(n) ? n : FIRST; return ((n % CH.length) + CH.length) % CH.length; }
  // This lineup's saved channel, and its spot in this visit (the 10 Nov format kept the Rare TV's at the top level).
  function savedCh() { var c = keep.chs && keep.chs[which]; return c != null ? c : which === 'rare' ? keep.ch : null; }
  function spot(state) {
    var p = state.pos && state.pos[which];
    return p || (which === 'rare' && state.ch != null ? { ch: state.ch, t: state.t, at: state.at } : null);
  }
  var keep = read('localStorage', KEEP), now = read('sessionStorage', NOW);
  var ch = wrap(spot(now) ? spot(now).ch : savedCh() != null ? savedCh() : FIRST);
  var on = false, open = false, big = !!keep.big, sound = false, want = !!now.sound;
  var fails = 0, seekTo = 0, saved = 0, blinkUntil = 0, fresh = false, raf = 0, lastNoise = 0, band = 0, timers = {};

  // ---------- The set ----------
  var PATHS = {
    tv: '<path d="M8 2.5l4 4 4-4"/><rect x="2.5" y="6.5" width="19" height="14" rx="2"/><rect x="5" y="9" width="11" height="9" rx="1.5"/><path d="M18.75 10.75v.01M18.75 14.25v.01"/>',
    power: '<path d="M12 3.5v7.5"/><path d="M6.7 6.9a7.3 7.3 0 1 0 10.6 0"/>',
    prev: '<path d="M14.5 6l-6 6 6 6"/>',
    next: '<path d="M9.5 6l6 6-6 6"/>',
    muted: '<path d="M3.5 9.5h3.5l5-4v13l-5-4H3.5z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    loud: '<path d="M3.5 9.5h3.5l5-4v13l-5-4H3.5z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.7 7.7 0 0 1 0 10.8"/>',
    away: '<path d="M6 13.5h12"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + PATHS[name] + '</svg>'; }
  function button(cls, label, inner, extra) {
    return '<button class="' + cls + '" type="button" title="' + label + '"' + (extra || '') + '>' + inner +
      '<span class="visually-hidden">' + label + '</span></button>';
  }
  var box = doc.createElement('aside');
  box.className = 'tv';
  box.setAttribute('aria-label', L.name);
  box.innerHTML =
    button('tv__icon', L.name, icon('tv'), ' aria-expanded="false" aria-controls="tv-set"') +
    '<div class="tv__set" id="tv-set" hidden>' +
      '<button class="tv__screen" type="button">' +
        '<video class="tv__video" playsinline muted preload="none" disablepictureinpicture disableremoteplayback aria-hidden="true"></video>' +
        '<canvas class="tv__snow" width="160" height="120" aria-hidden="true"></canvas>' +
        '<span class="tv__ident" aria-hidden="true"><span class="tv__brand">' + L.ident + '</span><span class="tv__hint">Switch on</span></span>' +
        '<span class="tv__osd" aria-hidden="true"></span>' +
      '</button>' +
      '<p class="tv__now"></p>' +
      '<div class="tv__bar">' +
        button('tv__btn tv__power', 'Power', icon('power'), ' aria-pressed="false"') +
        button('tv__btn tv__prev', 'Previous channel', icon('prev')) +
        button('tv__btn tv__next', 'Next channel', icon('next')) +
        button('tv__btn tv__sound', 'Sound', icon('muted') + icon('loud'), ' aria-pressed="false"') +
        button('tv__btn tv__away', 'Put the TV away', icon('away')) +
      '</div>' +
      '<p class="visually-hidden" aria-live="polite"></p>' +
    '</div>';
  function $(sel) { return box.querySelector(sel); }
  var tvIcon = $('.tv__icon'), set = $('.tv__set'), screen = $('.tv__screen'), video = $('.tv__video'), snow = $('.tv__snow'),
      osd = $('.tv__osd'), nowLine = $('.tv__now'), powerBtn = $('.tv__power'), soundBtn = $('.tv__sound'), say = $('[aria-live]');
  doc.body.appendChild(box);
  if (getComputedStyle(box).position !== 'fixed') { doc.body.removeChild(box); return; }   // a stylesheet without the TV rules
  doc.documentElement.classList.add('has-tv');

  // ---------- Static ----------
  var sctx = snow.getContext && snow.getContext('2d'), img = sctx ? sctx.createImageData(snow.width, snow.height) : null;
  function noise() {
    if (!img) return;
    var d = img.data, w = snow.width, h = snow.height, i = 0, x, y, row;
    band = (band + 3) % (h + 30);
    for (y = 0; y < h; y++) {
      row = (.5 + .5 * Math.random()) * (Math.abs(y - band + 15) < 6 ? 1.3 : 1);   // flickering lines and a rolling band
      for (x = 0; x < w; x++, i += 4) { d[i] = d[i + 1] = d[i + 2] = Math.random() * 255 * row; d[i + 3] = 255; }
    }
    sctx.putImageData(img, 0, 0);
  }
  function loop(ts) { if (ts - lastNoise > 33) { noise(); lastNoise = ts; } raf = requestAnimationFrame(loop); }
  function snowOn() {
    box.classList.add('tv--tuning');
    if (still.matches) noise(); else if (!raf) raf = requestAnimationFrame(loop);
  }
  function snowStill() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function snowOff() { box.classList.remove('tv--tuning'); snowStill(); }
  function osdShow(text, hold) {
    osd.textContent = text;
    box.classList.add('tv--osd');
    clearTimeout(timers.osd);
    if (!hold) timers.osd = setTimeout(function () { box.classList.remove('tv--osd'); }, 2600);
  }
  function flash(cls, ms) {   // the picture opening out of a line, or shrinking into one
    if (still.matches) return;
    box.classList.remove('tv--warm', 'tv--cool');
    void box.offsetWidth;
    box.classList.add(cls);
    clearTimeout(timers.flash);
    timers.flash = setTimeout(function () { box.classList.remove(cls); }, ms);
  }

  // ---------- Labels ----------
  function labels() {
    var c = CH[ch], b = doc.createElement('b'), n = doc.createElement('span'), what = !on ? 'Switch on ' + L.name : big ? 'Make the TV smaller' : 'Make the TV bigger';
    n.className = 'tv__ch'; n.textContent = 'CH ' + (ch + 1);
    b.textContent = c.t;
    nowLine.textContent = '';
    nowLine.appendChild(n); nowLine.appendChild(doc.createTextNode(' ')); nowLine.appendChild(b); nowLine.appendChild(doc.createTextNode(' ' + c.m));
    screen.setAttribute('aria-label', what);
    screen.title = what;
    var ms = navigator.mediaSession;
    if (on && ms && window.MediaMetadata) { try { ms.metadata = new MediaMetadata({ title: c.t, artist: L.name, album: c.m }); } catch (e) { /* ignore */ } }
  }

  // ---------- Playing ----------
  function play() {
    var p;
    try { p = video.play(); } catch (e) { return; }
    if (!p || !p.catch) return;
    p.catch(function (err) {
      if (!on || !err || err.name !== 'NotAllowedError') return;   // AbortError: a newer clip took over
      if (!video.muted) { setSound(false); play(); }                // sound needs a click on this page first
      else power(false);                                            // no autoplay here at all (e.g. iOS Low Power Mode)
    });
  }
  function start(t, blink) {
    var url = new URL(CH[ch].f + '.mp4?v=' + VER, DIR).href;
    clearTimeout(timers.fail); clearTimeout(timers.slow); clearTimeout(timers.blink);
    seekTo = t > 0 ? t : 0;
    blinkUntil = Date.now() + (still.matches ? 0 : blink);
    fresh = true;
    snowOn();
    osdShow('CH ' + (ch + 1), true);
    video.muted = !sound;
    video.preload = 'auto';
    if (video.getAttribute('src') !== url) video.src = url;   // seeking waits for the new clip's metadata
    else if (video.readyState > 0) seek();
    timers.slow = setTimeout(function () { if (on && box.classList.contains('tv--tuning')) osdShow('NO SIGNAL', true); }, 15000);
    play();
  }
  function seek() {
    if (!seekTo) return;
    var d = video.duration, t = seekTo;
    seekTo = 0;
    if (d && t >= d - .5) { step(1); return; }   // that ad finished in the meantime
    try { video.currentTime = t; } catch (e) { /* not seekable yet */ }
  }
  function unload() { if (on) return; video.removeAttribute('src'); video.preload = 'none'; try { video.load(); } catch (e) { /* ignore */ } }
  function power(next, t) {
    clearTimeout(timers.off);
    if (next === on) return;
    on = next;
    box.classList.toggle('tv--on', on);
    powerBtn.setAttribute('aria-pressed', String(on));
    flash(on ? 'tv--warm' : 'tv--cool', on ? 340 : 300);
    if (on) { fails = 0; start(t || 0, t ? 260 : 420); }
    else {
      video.pause();
      clearTimeout(timers.slow); clearTimeout(timers.fail);
      snowOff();
      box.classList.remove('tv--osd');
      timers.off = setTimeout(unload, still.matches ? 0 : 300);
    }
    labels();
    persist();
  }
  function step(d, user) {
    ch = wrap(ch + d);
    if (user) { fails = 0; say.textContent = 'Channel ' + (ch + 1) + ': ' + CH[ch].t + ', ' + CH[ch].m; }
    if (on) start(0, 320); else if (user && open) power(true);
    labels();
    persist();
  }
  function setSound(s) {
    sound = s;
    video.muted = !s;
    soundBtn.setAttribute('aria-pressed', String(s));
    box.classList.toggle('tv--loud', s);
  }
  function persist() {
    saved = Date.now();
    var t = on ? seekTo || video.currentTime || 0 : 0;
    keep.chs = keep.chs || {};
    keep.chs[which] = ch;
    keep.big = big;
    now.pos = now.pos || {};
    now.pos[which] = { ch: ch, t: t, at: saved };
    now.on = on; now.sound = want; now.at = saved;
    if (which === 'rare') { keep.ch = ch; now.ch = ch; now.t = t; }   // the 10 Nov format, for a tab still running that script
    write('localStorage', KEEP, keep);
    write('sessionStorage', NOW, now);
  }

  video.addEventListener('loadedmetadata', seek);
  video.addEventListener('playing', function () {
    fails = 0;
    clearTimeout(timers.slow); clearTimeout(timers.wait); clearTimeout(timers.blink);
    timers.blink = setTimeout(function () {
      if (!on || video.paused) return;
      snowOff();
      if (fresh) { fresh = false; osdShow('CH ' + (ch + 1)); }   // the channel number lingers after tuning, not after a stall
    }, Math.max(0, blinkUntil - Date.now()));
  });
  video.addEventListener('waiting', function () {   // a long stall shows static, as a weak signal would
    clearTimeout(timers.wait);
    timers.wait = setTimeout(function () { if (on && !video.paused) snowOn(); }, 700);
  });
  video.addEventListener('timeupdate', function () { if (Date.now() - saved > 1000) persist(); });
  video.addEventListener('ended', function () { if (!on) return; if (still.matches) power(false); else step(1); });
  video.addEventListener('error', function () {
    if (!on || !video.getAttribute('src')) return;
    fails++;
    snowOn();
    osdShow('NO SIGNAL', true);
    clearTimeout(timers.fail);
    if (fails < 3) timers.fail = setTimeout(function () { if (on) step(1); }, 2500);
    else snowStill();
  });

  // ---------- Controls ----------
  function show(o, user) {
    open = o;
    set.hidden = !o;
    tvIcon.hidden = o;
    tvIcon.setAttribute('aria-expanded', String(o));
    if (user) { keep.open = o; persist(); }
  }
  tvIcon.addEventListener('click', function () { show(true, true); power(true); powerBtn.focus(); });
  $('.tv__away').addEventListener('click', function () { power(false); show(false, true); tvIcon.focus(); });
  powerBtn.addEventListener('click', function () { power(!on); });
  $('.tv__prev').addEventListener('click', function () { step(-1, true); });
  $('.tv__next').addEventListener('click', function () { step(1, true); });
  soundBtn.addEventListener('click', function () {
    setSound(!sound);
    want = sound;
    if (on && video.paused && video.getAttribute('src')) play();
    persist();
  });
  screen.addEventListener('click', function () {
    if (!on) { power(true); return; }
    big = !big;
    box.classList.toggle('tv--big', big);
    labels();
    persist();
  });
  // A page can offer its own button for the TV (data-tv-on); it stays hidden unless the TV is here.
  Array.prototype.forEach.call(doc.querySelectorAll('[data-tv-on]'), function (b) {
    (b.closest('.tv-cue') || b).hidden = false;
    b.addEventListener('click', function () { show(true, true); power(true); powerBtn.focus(); });
  });
  var ms = navigator.mediaSession;
  if (ms) {
    try {
      ms.setActionHandler('nexttrack', function () { step(1, true); });
      ms.setActionHandler('previoustrack', function () { step(-1, true); });
    } catch (e) { /* not supported */ }
  }
  function follow(mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); }
  follow(wide, function () { if (keep.open == null && !on) show(wide.matches); });

  // ---------- Carrying on from the last page ----------
  function restore(state) {
    box.classList.toggle('tv--big', big);
    setSound(want);   // if this page may not play sound by itself, play() falls back to a silent picture
    labels();
    show(keep.open != null ? !!keep.open : wide.matches);
    if (state.on && open && !still.matches && !saver) {
      var p = spot(state);   // none yet if this lineup hasn't played in this visit: start its channel from the top
      power(true, p ? (+p.t || 0) + Math.min(5, Math.max(0, (Date.now() - (+p.at || 0)) / 1000)) : 0);
    }
  }
  addEventListener('pagehide', persist);
  doc.addEventListener('visibilitychange', function () { if (doc.visibilityState === 'hidden') persist(); });
  addEventListener('pageshow', function (e) {   // back to a page kept in memory: catch up with the pages seen since
    if (!e.persisted) return;
    keep = read('localStorage', KEEP); now = read('sessionStorage', NOW);
    on = false;
    box.classList.remove('tv--on', 'tv--osd');
    powerBtn.setAttribute('aria-pressed', 'false');
    video.pause(); snowOff(); unload();
    ch = wrap(spot(now) ? spot(now).ch : savedCh() != null ? savedCh() : FIRST);
    big = !!keep.big; want = !!now.sound;
    restore(now);
  });
  restore(now);
})();
