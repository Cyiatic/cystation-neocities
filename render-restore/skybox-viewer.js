/* Seven original panorama strips. Manual panning only; no simulated 3D assets. */
(() => {
  'use strict';
  const stage = document.querySelector('#panorama');
  const select = document.querySelector('#skybox-choice');
  const caption = document.querySelector('#skybox-caption');
  const notes = document.querySelector('#notes');
  const error = document.querySelector('#skybox-error');
  const loading = document.querySelector('#skybox-loading');
  const skies = {
    skybox_04: ['Windy — Daytime', 'Windy, Bats Tower, Barn Boys, Hungover and the Weasel transition.'],
    skybox_02: ['Windy — Night', 'Windy’s Nasty/Nice area at night.'],
    skybox_00: ['Shared Default — Sea / Island / Castle', 'Shared default panorama used across 51 rooms.'],
    skybox_03: ['It’s War — Submarine Basin', 'Submarine missile stations and the giant Tedi boss sequence.'],
    skybox_01: ['It’s War — Opening Base', 'The beginning of War, before the General’s knockout sequence.'],
    skybox_05: ['Haunted Castle / Raptor — Night', 'Spooky’s Haunted Castle and the Raptor multiplayer arena.'],
    skybox_06: ['The Heist — Feral Reserve Safe', 'The Feral Reserve safe.']
  };
  let selected = 'skybox_04', offset = 0, drag = null, loadId = 0, loadingTimer = 0;
  const paint = () => { stage.style.backgroundPosition = `${offset}px center`; };
  const pan = (amount) => { offset += amount; paint(); };

  // Loading state: the stage dims at once; the label appears only if the file is slow.
  function setLoading(on) {
    clearTimeout(loadingTimer);
    if (on) {
      stage.setAttribute('aria-busy', 'true');
      loadingTimer = setTimeout(() => { loading.hidden = false; }, 180);
    } else {
      stage.removeAttribute('aria-busy');
      loading.hidden = true;
    }
  }

  function choose(id, writeHash = true) {
    if (!Object.hasOwn(skies, id)) return;
    const token = ++loadId, image = new Image(), src = `assets/conker-skyboxes/${id}.jpg`;
    error.hidden = true;
    setLoading(true);
    image.onload = () => {
      if (token !== loadId) return;
      setLoading(false);
      selected = id; offset = 0; paint();
      stage.style.backgroundImage = `url("${src}")`;
      stage.setAttribute('aria-label', `${skies[id][0]} panorama. Use Left and Right to pan.`);
      select.value = id; caption.textContent = skies[id][1];
      document.querySelector('#original-panorama').href = src;
      document.title = `${skies[id][0]} · Conker’s Skyboxes · CyStation`;
      if (writeHash) history.replaceState(null, '', `#${id}`);
    };
    image.onerror = () => {
      if (token !== loadId) return;
      setLoading(false);
      select.value = selected; error.hidden = false;
    };
    image.src = src;
  }

  for (const [id, [name]] of Object.entries(skies)) {
    const option = document.createElement('option');
    option.value = id; option.textContent = name; select.append(option);
  }
  select.addEventListener('change', () => choose(select.value));
  document.querySelector('#pan-left').addEventListener('click', () => pan(160));
  document.querySelector('#pan-right').addEventListener('click', () => pan(-160));
  document.querySelector('#pan-reset').addEventListener('click', () => { offset = 0; paint(); });
  stage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); pan(event.key === 'ArrowLeft' ? 80 : -80); }
    if (event.key === 'Home') { event.preventDefault(); offset = 0; paint(); }
  });
  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target !== stage) return;
    drag = { id: event.pointerId, x: event.clientX }; stage.setPointerCapture(event.pointerId); stage.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove', (event) => { if (drag && drag.id === event.pointerId) { pan(event.clientX - drag.x); drag.x = event.clientX; } });
  const stopDrag = () => { drag = null; stage.classList.remove('is-dragging'); };
  stage.addEventListener('pointerup', stopDrag); stage.addEventListener('pointercancel', stopDrag); stage.addEventListener('lostpointercapture', stopDrag);
  const fullscreen = document.querySelector('#skybox-fullscreen');
  fullscreen.hidden = !stage.requestFullscreen;
  fullscreen.addEventListener('click', () => stage.requestFullscreen().catch(() => { caption.textContent = 'Full screen is unavailable. You can still pan in this view.'; }));
  document.querySelector('#notes-link').addEventListener('click', () => { notes.open = true; });
  function route() {
    if (location.hash === '#notes') { notes.open = true; return; }
    choose(location.hash.slice(1) || 'skybox_04', false);
  }
  addEventListener('hashchange', route);
  document.querySelector('#viewer-controls').hidden = false;
  route();
})();
