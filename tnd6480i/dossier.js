(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const screen = $('screen'), canvas = $('menu-canvas'), ctx = canvas.getContext('2d');
  $('reading').close(); // The reading sheet is available by default without JavaScript.
  const patch = 'assets/TND64_Expanded_11-24_480i-Cyiatic.xdelta';
  const pages = [
    {id:'overview',title:'BACKGROUND:',part:'Background',body:
      'Tomorrow Never Dies 64 Expanded 11-24 brings James Bond to a new mission on the Nintendo 64. Cyiatic\'s 480i patch adds a higher-resolution, interlaced display mode to this build.',
      gameBody:'A terrorist arms bazaar is taking place on the Russian border. MI6 agent James Bond has been dispatched to gather intelligence on the deals taking place.'},
    {id:'m-briefing',title:'M BRIEFING:',part:'M Briefing',body:
      'Your assignment is to prepare the 480i build. Select START to download the patch, then follow Q Branch\'s installation briefing. Check the source and target checksums in Read text before taking the mission to your console.',
      gameBody:'Your first priority is to photograph any \'VIPs\' in attendance. Once we are satisfied with the images, the HMS Chester will fire a Tomahawk cruise missile to destroy the bazaar. I suggest you leave before impact.'},
    {id:'q-branch',title:'Q BRANCH:',part:'Q Branch',body:
      'Start with your own stock GoldenEye 007 (USA).z64. Apply the supplied xdelta with an xdelta-compatible patcher and save the result as a new ROM. Use an Expansion Pak / 8 MB and EEPROM 4K saves. Keep your original ROM, and verify both checksums in Read text.',
      gameBody:'You are not only armed with your usual Walther PPK fitted with a silencer, but you also have your trusty camera to photograph any suspect characters you meet along the way. When you evacuate from the bazaar, your best bet is to take a MiG out for a joy ride because there are Soviet SB5 nuclear warheads at the bazaar. If the incoming cruise missile detonates those warheads, you\'re going to have a nuclear disaster!'},
    {id:'moneypenny',title:'MONEYPENNY:',part:'Moneypenny',body:
      'Use protection, James. Keep a backup before you slip the patch in.',
      gameBody:'Be sure to pull out quickly once the job is done, James.'}
  ];
  // g1mcfix4 keeps native bitmap glyphs in a 640x480 menu. The supplied
  // A3D captures confirm the patched origins, 465-unit wrap and 15-unit lines.
  // One raster row aligns bitmap ink with the captured console output.
  const briefingLayout = {x:80, header:[127,143,159], title:220, body:244, wrap:465};
  const aliases = {download:'m-briefing',installation:'q-branch',screenshots:'moneypenny',changelog:'moneypenny',credits:'moneypenny'};
  let comparison = false;
  const images = {}, names = ['save-select','copy-icon','erase-icon','select-file','modes','briefing','zurich','gothic','crosshair1'];
  const tintedFonts = {};
  let page = 'files', selection = 'file-1', pointer = {x:226,y:178}, ready = false, frame = 0;
  let pointerInput = false;
  let optionsReturn = 'files';
  let soundOn = true;
  try { soundOn = localStorage.getItem('tnd-console-sound') !== 'off'; } catch {}
  // Every new visit starts with music enabled, as in game. The switch mutes
  // this visit; changing pages never creates or restarts the audio element.
  let musicOn = true, musicStarting = false;
  // The parser starts loading the album track before menu artwork is ready.
  const music = $('briefing-music');
  music.volume = .18;
  music.dataset.state = 'loading';
  function updateMusic() {
    music.autoplay = musicOn;
    $('music-toggle').textContent = `Music: ${musicOn ? 'on' : 'off'}`;
    $('music-toggle').setAttribute('aria-pressed',String(musicOn));
    schedule();
  }
  function syncMusic() {
    if (!musicOn || document.hidden) { music.pause();music.dataset.state = musicOn ? 'background' : 'muted';return; }
    if (music.paused && !musicStarting) {
      musicStarting = true;
      music.dataset.state = 'starting';
      music.play().catch(error => {
        // Audible autoplay can be denied. A real click/key retries normally;
        // no muted workaround, policy override or repeated timer is used.
        music.dataset.state = error.name === 'NotAllowedError' ? 'blocked' : error.name === 'AbortError' ? 'paused' : 'error';
        if (error.name === 'NotAllowedError') $('page-status').textContent = 'The browser blocked automatic music. A click or key will start it.';
        else if (error.name !== 'AbortError') $('page-status').textContent = 'Briefing music could not play. Use Music to retry.';
      }).finally(() => { musicStarting = false; });
    }
  }
  function unlockMusic(event) {
    if (!event.isTrusted || event.altKey || event.ctrlKey || event.metaKey) return;
    syncMusic();
  }
  music.addEventListener('playing',() => { music.dataset.state = 'playing'; });
  // Request audible playback immediately, independently of the image loader.
  // A browser permission denial still requires a genuine user gesture.
  syncMusic();
  // Stock GE events 199 (briefing/back) and 197 (main-menu confirm).
  const sounds = {select:new Audio('assets/console/ge-briefing-select.wav'),menu:new Audio('assets/console/ge-menu-select.wav')};
  Object.entries(sounds).forEach(([name,audio]) => { audio.id = `sound-${name}`;audio.hidden = true;audio.preload = 'none';audio.volume = .3;document.body.append(audio); });
  function play(kind = 'select') {
    if (!soundOn) return;
    Object.values(sounds).forEach(audio => { audio.pause();audio.currentTime = 0; });
    const audio = sounds[kind];
    audio.play().catch(error => { if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') $('page-status').textContent = 'Audio could not play. The menu remains available.'; });
  }
  function updateSound() {
    $('sound-toggle').textContent = `Sound effects: ${soundOn ? 'on' : 'off'}`;
    $('sound-toggle').setAttribute('aria-pressed', String(soundOn));
    schedule();
  }
  function updateFullscreen() {
    $('fullscreen-toggle').hidden = !document.fullscreenEnabled;
    $('fullscreen-toggle').textContent = `Full screen: ${document.fullscreenElement ? 'on' : 'off'}`;
    $('fullscreen-toggle').setAttribute('aria-pressed',String(!!document.fullscreenElement));
    schedule();
  }
  function glyphs(text, x, y, font = 'zurich', draw = true, spacing = 0, tint = '') {
    const f = window.TND_FONTS[font]; let px = x, prev = f.chars.H;
    for (const ch of text) {
      if (ch === ' ') { px += 5; prev = f.chars.H; continue; }
      const g = f.chars[ch] || f.chars['?'];
      px -= f.kerning[prev.k * 13 + g.k] + spacing - 1;
      if (draw && g.w) ctx.drawImage(tint ? tintedFonts[tint] : images[font],g.x,g.y,g.w,g.h,px,y+g.baseline,g.w,g.h);
      px += g.w; prev = g;
    }
    return px - x;
  }
  function lines(text, maxWidth = briefingLayout.wrap) {
    const result = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(' ')) {
        const next = line ? `${line} ${word}` : word;
        if (line && glyphs(next,0,0,'zurich',false) > maxWidth) { result.push(line); line = word; }
        else line = next;
      }
      result.push(line);
    }
    return result;
  }
  function textBlock(text, x, y) {
    const metrics = window.TND_FONTS.zurich.chars['|'];
    for (const line of lines(text)) {
      if (line) { glyphs(line,x,y); y += metrics.h + metrics.baseline; }
      else y += 8;
    }
    return y;
  }
  function shade(x,y,w,h) { ctx.fillStyle = 'rgba(0,0,0,.196)';ctx.fillRect(x,y,w,h); }
  function drawTab(label, action, top, center) {
    // front.c measures a trailing newline using font1['['] (glyph index 91).
    const line = window.TND_FONTS.gothic.chars['|'];
    const height = line.baseline + line.h;
    const right = 590 - Math.trunc(height/2);
    if (selection === action) shade(right-height+1,top,height-1,96);
    const width = glyphs(label,0,0,'gothic',false,-1);
    ctx.save(); ctx.translate(right,center-Math.trunc(width/2)); ctx.rotate(Math.PI/2);
    glyphs(label,0,0,'gothic',true,-1);ctx.restore();
  }
  function render() {
    frame = 0; if (!ready) return;
    ctx.clearRect(0,0,640,480);ctx.drawImage(images[page === 'files' ? 'save-select' : page === 'menu' ? 'modes' : 'briefing'],0,0);
    ctx.imageSmoothingEnabled = false;
    if (page === 'files') {
      const labelWidth = glyphs('007',0,0,'zurich',false);
      [[226,187],[508,187],[132,292],[414,292]].forEach(([x,y]) => glyphs('007',x-Math.floor(labelWidth/2),y,'zurich',true,0,'gold'));
      ctx.drawImage(images['select-file'],98,407);
      ctx.drawImage(images['copy-icon'],312,402);
      ctx.drawImage(images['erase-icon'],472,402);
      glyphs('Copy',350,410,'zurich',true,0,'white');
      glyphs('Erase',510,410,'zurich',true,0,'white');
    } else if (page === 'menu') {
      ['PATCH BRIEFING','DOWNLOAD PATCH','INSTALLATION','OPTIONS'].forEach((label,i) => {
        const y = 320+i*32, action = ['overview','download-patch','q-branch','options'][i];
        if (selection === action) shade(216,y-2,27+glyphs(label,0,0,'zurich',false),16);
        glyphs(`${i+1}.`,218,y);glyphs(label,238,y);
      });
      drawTab('PREVIOUS','previous',343,391);
    } else if (page === 'options') {
      glyphs('OPTIONS',80,126);
      [...$('options-controls').children].forEach((el,i) => {
        if (el.hidden) return;
        const label = el.textContent.toUpperCase(), y = 174+i*35;
        if (selection === el.dataset.action) shade(78,y-2,4+glyphs(label,0,0,'zurich',false),17);
        glyphs(label,80,y);
      });
      glyphs('ARROWS: SELECT   ENTER: CONFIRM',80,406);
      glyphs('ESC: BACK   O: OPTIONS',80,429);
      drawTab('PREVIOUS','previous',343,391);
    } else {
      const p = pages.find(p => p.id === page);
      const {x,header,title,body} = briefingLayout;
      glyphs(comparison ? 'Easy: James Bond' : 'Agent: James Bond',x,header[0]);
      glyphs(comparison ? 'Mission 1: Russian Border' : 'Mission: Tomorrow Never Dies 64',x,header[1]);
      glyphs(comparison ? 'Part i: Arms Bazaar' : 'Part i: TND6480i',x,header[2]);
      glyphs(p.title,x,title);textBlock(comparison ? p.gameBody : p.body,x,body);
      drawTab('START','start',74,122);
      if (page !== 'moneypenny') drawTab('NEXT','next',209,257);
      drawTab('PREVIOUS','previous',343,391);
    }
    ctx.globalAlpha = 220/255;ctx.drawImage(images.crosshair1,Math.round(pointer.x)-16,Math.round(pointer.y)-16);ctx.globalAlpha = 1;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function visibleActions() { return [...screen.querySelectorAll('.hotspot')].filter(el => !el.hidden && !el.closest('[hidden]')); }
  function actionAtPointer() {
    return visibleActions().find(el => {
      const x = Number(el.style.getPropertyValue('--x')), y = Number(el.style.getPropertyValue('--y'));
      const w = Number(el.style.getPropertyValue('--w')), h = Number(el.style.getPropertyValue('--h'));
      return pointer.x >= x && pointer.x < x+w && pointer.y >= y && pointer.y < y+h;
    })?.dataset.action || '';
  }
  function updatePointer(event) {
    pointerInput = true;
    const r = screen.getBoundingClientRect();
    pointer = {x:(event.clientX-r.left)*640/r.width,y:(event.clientY-r.top)*480/r.height};
    select(actionAtPointer(),false);
  }
  function select(action, movePointer = true) {
    selection = action;
    const el = visibleActions().find(el => el.dataset.action === action);
    if (el && movePointer) {
      const style = el.style;
      pointer = el.matches('.save-folder') ? {x:Number(el.dataset.cursorX),y:Number(el.dataset.cursorY)} : {x:Number(style.getPropertyValue('--x')) + (el.matches('.option,.setting') ? -33 : Number(style.getPropertyValue('--w'))/2),y:Number(style.getPropertyValue('--y'))+Number(style.getPropertyValue('--h'))/2};
    }
    schedule();
  }
  function navigate(id, push = true) {
    const restoreKeyboardFocus = !pointerInput && screen.contains(document.activeElement);
    if ($('reading').open) $('reading').close();
    const isOptions = id === 'options';
    if (isOptions && page !== 'options') optionsReturn = comparison ? `game-${page}` : page;
    const gameHash = id === 'console' || id.startsWith('game-');
    if (!isOptions && (!push || gameHash)) comparison = gameHash;
    id = id === 'console' ? 'overview' : id.replace(/^game-/, '');
    id = aliases[id] || id;
    page = id === 'files' || id === 'menu' || isOptions || pages.some(p => p.id === id) ? id : 'files';
    if (page === 'menu' || page === 'files') comparison = false;
    const dossier = !['files','menu','options'].includes(page);
    const hash = comparison && dossier ? `game-${page}` : page;
    if (push && location.hash !== `#${hash}`) history.pushState(null,'',`#${hash}`);
    screen.dataset.page = page;
    $('save-options').hidden = page !== 'files';
    $('save-help').hidden = page !== 'files';
    $('menu-options').hidden = page !== 'menu';
    $('options-controls').hidden = page !== 'options';
    $('edge-tabs').hidden = page === 'files';
    $('start-tab').hidden = !dossier;
    $('next-tab').hidden = !dossier || page === 'moneypenny';
    $('start-tab').href = patch;
    $('start-tab').setAttribute('download','');
    $('compare').textContent = comparison ? 'Show patch text' : 'Compare game text';
    const p = pages.find(p => p.id === page);
    const transcript = p || (page === 'options' && pages.find(p => p.id === optionsReturn.replace(/^game-/, '')));
    $('briefing-transcript').hidden = !transcript;
    $('briefing-heading').textContent = transcript?.title || '';
    $('briefing-body').textContent = transcript ? (comparison ? transcript.gameBody : transcript.body) : '';
    // Page changes must not warp a mouse/touch cursor to the default control.
    select(pointerInput ? actionAtPointer() : page === 'files' ? 'file-1' : page === 'menu' ? 'overview' : page === 'options' ? 'music' : $('next-tab').hidden ? 'start' : 'next', !pointerInput);
    if (restoreKeyboardFocus) visibleActions().find(el => el.dataset.action === selection)?.focus({preventScroll:true});
    const title = page === 'files' ? 'Select file' : page === 'menu' ? 'Main menu' : page === 'options' ? 'Options' : `${p.part}${comparison ? ' · Game text' : ''}`;
    screen.setAttribute('aria-label',`TND6480i: ${title}`);
    $('page-status').textContent = title;
    document.title = `${title} · TND6480i`;
  }
  function previous() {
    if (page === 'options') { navigate(optionsReturn);return; }
    if (page === 'files') { location.href = '/patches#tnd6480i';return; }
    if (page === 'menu') { navigate('files');return; }
    const i = pages.findIndex(p => p.id === page);
    navigate(i > 0 ? pages[i-1].id : 'menu');
  }
  // pointerdown precedes the browser's focus change, including taps without a move.
  document.addEventListener('pointerdown',() => { pointerInput = true; });
  screen.addEventListener('pointerdown',updatePointer);
  screen.addEventListener('pointermove',event => { if (event.pointerType !== 'touch') updatePointer(event); });
  screen.addEventListener('focusin',event => { if (event.target.dataset.action) select(event.target.dataset.action,!pointerInput); });
  screen.addEventListener('click',event => {
    const el = event.target.closest('.hotspot');if (!el) return;
    const action = el.dataset.action;
    if (['music','sound','compare','read','fullscreen'].includes(action)) return;
    play((page === 'files' || page === 'menu') && action !== 'previous' ? 'menu' : 'select');
    if (action.startsWith('file-')) {event.preventDefault();navigate('menu');}
    else if (action === 'previous') {event.preventDefault();previous();}
    else if (action === 'next') {event.preventDefault();const next = pages[pages.findIndex(p => p.id === page)+1];if (next) navigate(next.id);}
    else if (action === 'options' || pages.some(p => p.id === action)) {event.preventDefault();navigate(action);}
  });
  document.addEventListener('keydown', event => {
    if (['Tab','Enter','Escape',' '].includes(event.key) || event.key.startsWith('Arrow') || event.key.toLowerCase() === 'o') pointerInput = false;
    if (event.altKey || event.ctrlKey || event.metaKey || !ready) return;
    if (event.target.closest('#reading') || event.target.matches('input,textarea,select')) return;
    if (event.key.toLowerCase() === 'o') {event.preventDefault();play();if (page === 'options') previous();else navigate('options');return;}
    if (event.key === 'Escape') {event.preventDefault();play();previous();return;}
    const actions = visibleActions();
    if (event.key.startsWith('Arrow')) {
      event.preventDefault();
      const delta = ['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1;
      const i = actions.findIndex(a => a.dataset.action === selection);
      const next = page === 'files' ? actions[Math.max(0,i) ^ (['ArrowUp','ArrowDown'].includes(event.key) ? 2 : 1)] : actions[(i+delta+actions.length)%actions.length];
      if (next) { select(next.dataset.action);next.focus({preventScroll:true}); }
    } else if (event.key === 'Enter' && !event.target.matches('a,button')) {
      event.preventDefault();actions.find(a => a.dataset.action === selection)?.click();
    }
  });
  $('compare').addEventListener('click',() => {
    play();comparison = !comparison;
    const target = optionsReturn.replace(/^game-/, '');
    navigate(pages.some(p => p.id === target) ? target : 'overview');
  });
  $('sound-toggle').addEventListener('click',() => {
    soundOn = !soundOn;updateSound();
    try { localStorage.setItem('tnd-console-sound',soundOn ? 'on' : 'off'); } catch {}
    if (soundOn) play(); else Object.values(sounds).forEach(a => {a.pause();a.currentTime=0;});
  });
  $('music-toggle').addEventListener('click',() => {
    musicOn = !musicOn;updateMusic();
    syncMusic();
    play();
  });
  $('fullscreen-toggle').addEventListener('click',async () => {
    play();
    try { if (document.fullscreenElement) await document.exitFullscreen();else await document.documentElement.requestFullscreen(); }
    catch { $('page-status').textContent = 'Full screen is unavailable. The dossier still fills this window.'; }
  });
  document.addEventListener('fullscreenchange',updateFullscreen);
  // One continuous track: navigation and SFX never reset or duplicate it.
  document.addEventListener('click',unlockMusic);
  document.addEventListener('keydown',unlockMusic);
  document.addEventListener('visibilitychange',syncMusic);
  window.addEventListener('pagehide',() => music.pause());
  window.addEventListener('pageshow',syncMusic);
  function showReading() { if (!$('reading').open) $('reading').showModal(); }
  $('reading-toggle').addEventListener('click',() => {play();showReading();});
  document.querySelector('.skip-link[href="#reading"]').addEventListener('click',event => {event.preventDefault();showReading();});
  function restoreRoute() { if (location.hash === '#reading') showReading();else navigate(location.hash.slice(1),false); }
  window.addEventListener('popstate',restoreRoute);
  window.addEventListener('hashchange',restoreRoute);
  updateSound();updateMusic();updateFullscreen();
  Promise.all(names.map(name => new Promise((resolve,reject) => {
    const img = new Image();img.onload = () => {images[name] = img;resolve();};img.onerror = reject;img.src = `assets/console/${name}.png`;
  }))).then(() => {
    for (const [name,color] of Object.entries({gold:'#ebd879',white:'#ffffff'})) {
      const atlas = document.createElement('canvas');atlas.width = images.zurich.width;atlas.height = images.zurich.height;
      const ink = atlas.getContext('2d');ink.drawImage(images.zurich,0,0);ink.globalCompositeOperation = 'source-in';ink.fillStyle = color;ink.fillRect(0,0,atlas.width,atlas.height);tintedFonts[name] = atlas;
    }
    ready = true;screen.classList.add('ready');
    const readFirst = location.hash === '#reading';
    navigate(location.hash.slice(1),false);if (readFirst) showReading();syncMusic();
  }).catch(() => {
    showReading();$('page-status').textContent = 'Menu artwork could not load. Patch information is available in the reading view.';
  });
})();
