/* CyStation: following eyes.
   The googly eyes on the Outposts icons, the home page's quill and the Render Restore temple turn toward the
   pointer, or toward whatever has keyboard focus. Each image is redrawn on a canvas with its pupils painted out
   (filled smoothly from the white around them). The original pupils are cut out and slide in an SVG layer
   stacked on the image, masked to their eye. Without this script, or with reduced motion, the art is unchanged. */
(function () {
  'use strict';
  var motion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!motion || motion.matches || !window.requestAnimationFrame || !document.createElementNS) return;

  // Per image, in its own pixels: w = the eye white, p = the resting pupil, each an ellipse
  // [centre x, centre y, semi-axis a, semi-axis b, rotation in degrees]. front = the eye drawn in front of this
  // one (this pupil hides behind it); own = fill this pupil only from its own eye white.
  var ART = {
    'outpost-github-sgi-96.webp': [
      { w: [30.73, 31.65, 7.74, 6.74, 33.7], p: [34.4, 34.25, 3.6, 3.75, 0] },
      { w: [47.66, 31.06, 7.12, 5.46, -29.6], p: [47.65, 33.25, 3.35, 3.75, 0] }
    ],
    'outpost-iararenobg-96.webp': [
      { w: [41.33, 15.83, 10.1, 9.12, 67.9], p: [44.65, 20.25, 4.35, 5.25, 0], front: 1 },
      { w: [58.62, 15.38, 9.83, 8.61, 66.8], p: [57.8, 19.65, 4.4, 5.35, 0] }
    ],
    'outpost-twitternobgrare-96.webp': [
      { w: [52.7, 19.91, 10.3, 6.84, 88.5], p: [53.4, 20.65, 3.6, 4.65, 0], front: 1 },
      { w: [66.3, 19.06, 9.97, 7.41, -89], p: [66.6, 20, 3.8, 5, 0] }
    ],
    'outpost-ytnobgrare-96.webp': [
      { w: [37.44, 17.19, 12.02, 7.11, -83.7], p: [39, 22.25, 4.5, 6.75, 0] },
      { w: [53.34, 17.3, 11.9, 7.25, -82.7], p: [54.15, 22.9, 4.55, 6.6, 0] }
    ],
    'scribes-feather.webp': [
      { w: [43.27, 77.64, 51.12, 40, 78.9], p: [65.8, 102.6, 21, 13, -64], front: 1, own: true },
      { w: [114.94, 72.68, 51.29, 35.59, -75.4], p: [107.03, 99.61, 19.6, 16.2, -69.2] }
    ]
  };

  var SVG = 'http://www.w3.org/2000/svg', XLINK = 'http://www.w3.org/1999/xlink';
  var SOFT = 1.5;     // soft edge of a cut-out pupil, in image pixels
  var FILL = 2;       // how far past the pupil the fill reaches, in image pixels
  var REACH = 140;    // CSS pixels from an eye at which its pupil reaches the edge
  var rigs = [], uid = 0, pointer = null, focused = null, queued = false, restTimer = 0;

  function grow(e, g) { return [e[0], e[1], e[2] + g, e[3] + g, e[4]]; }
  function radius(e, x, y) {  // 1 on the ellipse's edge
    var t = e[4] * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), dx = x - e[0], dy = y - e[1];
    var u = (dx * c + dy * s) / e[2], v = (dy * c - dx * s) / e[3];
    return Math.sqrt(u * u + v * v);
  }
  function el(name, attrs) {
    var n = document.createElementNS(SVG, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function ellipse(e, fill) {
    return el('ellipse', { cx: e[0], cy: e[1], rx: e[2], ry: e[3], fill: fill, transform: 'rotate(' + e[4] + ' ' + e[0] + ' ' + e[1] + ')' });
  }

  // Paint pupil i out of `out` (a smooth fill from the pixels around it) and return the cut-out pupil.
  function paintOut(src, out, W, H, eyes, i) {
    var e = eyes[i], P = e.p, hide = e.front != null ? grow(eyes[e.front].w, -1) : null, white = grow(e.w, 1);
    var reach = 1 + FILL / Math.min(P[2], P[3]), pr = (P[2] + P[3]) / 2, soft = SOFT / pr;
    var R = Math.max(P[2], P[3]) + FILL + 2;
    var x0 = Math.max(0, Math.floor(P[0] - R)), x1 = Math.min(W - 1, Math.ceil(P[0] + R));
    var y0 = Math.max(0, Math.floor(P[1] - R)), y1 = Math.min(H - 1, Math.ceil(P[1] + R));
    var bw = x1 - x0 + 1, bh = y1 - y0 + 1, n = bw * bh;
    var kind = new Uint8Array(n), val = new Float32Array(n * 3), cut = new ImageData(bw, bh);
    var todo = [], sum = [0, 0, 0], count = 0, x, y, k, j, s, t;
    for (y = 0; y < bh; y++) for (x = 0; x < bw; x++) {
      k = y * bw + x; s = ((y0 + y) * W + x0 + x) * 4;
      var px = x0 + x + .5, py = y0 + y + .5, behind = hide && radius(hide, px, py) <= 1;
      t = radius(P, px, py);
      kind[k] = t <= reach && !behind ? 2 : !behind && (!e.own || radius(white, px, py) <= 1) ? 1 : 0;
      val[k * 3] = out[s]; val[k * 3 + 1] = out[s + 1]; val[k * 3 + 2] = out[s + 2];
      if (kind[k] === 2) todo.push(k);
      else if (kind[k] === 1 && t <= reach + 3 / pr) { sum[0] += src[s]; sum[1] += src[s + 1]; sum[2] += src[s + 2]; count++; }
      var a = Math.min(1, (1 + soft - t) / soft);
      if (a > 0) { cut.data[k * 4] = src[s]; cut.data[k * 4 + 1] = src[s + 1]; cut.data[k * 4 + 2] = src[s + 2]; cut.data[k * 4 + 3] = src[s + 3] * a; }
    }
    for (j = 0; j < todo.length; j++) for (s = 0; s < 3; s++) val[todo[j] * 3 + s] = count ? sum[s] / count : 240;
    // Relax toward a smooth surface (successive over-relaxation; neighbours outside the fill's reach don't count).
    for (var it = 0; it < 300; it++) for (j = 0; j < todo.length; j++) {
      k = todo[j]; y = (k / bw) | 0; x = k - y * bw;
      var r = 0, g = 0, b = 0, m = 0, q;
      if (x > 0 && kind[q = k - 1]) { r += val[q * 3]; g += val[q * 3 + 1]; b += val[q * 3 + 2]; m++; }
      if (x < bw - 1 && kind[q = k + 1]) { r += val[q * 3]; g += val[q * 3 + 1]; b += val[q * 3 + 2]; m++; }
      if (y > 0 && kind[q = k - bw]) { r += val[q * 3]; g += val[q * 3 + 1]; b += val[q * 3 + 2]; m++; }
      if (y < bh - 1 && kind[q = k + bw]) { r += val[q * 3]; g += val[q * 3 + 1]; b += val[q * 3 + 2]; m++; }
      if (m) { q = k * 3; val[q] += 1.8 * (r / m - val[q]); val[q + 1] += 1.8 * (g / m - val[q + 1]); val[q + 2] += 1.8 * (b / m - val[q + 2]); }
    }
    for (j = 0; j < todo.length; j++) {
      k = todo[j]; y = (k / bw) | 0; x = k - y * bw; s = ((y0 + y) * W + x0 + x) * 4;
      out[s] = val[k * 3]; out[s + 1] = val[k * 3 + 1]; out[s + 2] = val[k * 3 + 2];
    }
    return { cut: cut, x: x0, y: y0, w: bw, h: bh };
  }

  function build(img, def) {
    var W = img.naturalWidth, H = img.naturalHeight;
    if (!W || !H) return;
    var canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, W, H);
    var image = ctx.getImageData(0, 0, W, H), src = new Uint8ClampedArray(image.data);
    var eyes = def.map(function (e) {
      var r = (e.p[2] + e.p[3]) / 2;
      return { w: e.w, p: e.p, front: e.front, own: e.own, ra: Math.max(e.w[2] - .9 * r, .5), rb: Math.max(e.w[3] - .9 * r, .5), dx: 0, dy: 0 };
    });
    var cuts = eyes.map(function (e, i) { return paintOut(src, image.data, W, H, eyes, i); });
    ctx.putImageData(image, 0, 0);
    var base = canvas.toDataURL('image/png'), id = 'eyes' + (++uid);
    var svg = el('svg', { 'class': 'eyes', viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', focusable: 'false' });
    var defs = svg.appendChild(el('defs', {}));
    svg.style.aspectRatio = W + ' / ' + H;
    eyes.forEach(function (e, i) {
      var c = cuts[i], pc = document.createElement('canvas'); pc.width = c.w; pc.height = c.h;
      pc.getContext('2d').putImageData(c.cut, 0, 0);
      var mask = defs.appendChild(el('mask', { id: id + '-' + i, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }));
      mask.appendChild(ellipse(grow(e.w, .5), '#fff'));
      mask.appendChild(ellipse(grow(e.p, .5), '#fff'));      // the resting spot, where a pupil may overhang its white
      if (e.front != null) mask.appendChild(ellipse(eyes[e.front].w, '#000'));
      var url = pc.toDataURL('image/png'), pupil = el('image', { 'class': 'eyes__pupil', x: c.x, y: c.y, width: c.w, height: c.h, href: url });
      pupil.setAttributeNS(XLINK, 'xlink:href', url);
      svg.appendChild(el('g', { mask: 'url(#' + id + '-' + i + ')' })).appendChild(pupil);
      e.node = pupil;
    });
    // Swap in the pupil-free image only once it is decoded, so the art never blinks.
    var probe = new Image(), done = function () { attach(img, svg, base, eyes, W); };
    if (probe.decode) { probe.src = base; probe.decode().then(done, function () {}); }
    else { probe.onload = done; probe.src = base; }
  }

  function attach(img, svg, base, eyes, W) {
    var host = img.parentNode;
    host.classList.add('has-eyes');
    host.insertBefore(svg, img.nextSibling);
    if (getComputedStyle(svg).gridColumnStart !== '1') {  // the stylesheet that stacks the layer isn't there
      host.removeChild(svg); host.classList.remove('has-eyes');
      return;
    }
    img.src = base;
    rigs.push({ img: img, W: W, eyes: eyes });
    queue();
  }

  function queue() { if (!queued) { queued = true; requestAnimationFrame(look); } }
  function look() {
    queued = false;
    var tx = null, ty = null, vh = window.innerHeight;
    if (focused && document.contains(focused)) { var f = focused.getBoundingClientRect(); tx = f.left + f.width / 2; ty = f.top + f.height / 2; }
    else if (pointer) { tx = pointer[0]; ty = pointer[1]; }
    rigs.forEach(function (rig) {
      var box = rig.img.getBoundingClientRect();
      if (!box.width || box.bottom < -50 || box.top > vh + 50) return;
      var k = box.width / rig.W;
      rig.eyes.forEach(function (e) {
        var dx = 0, dy = 0;
        if (tx !== null) {
          var vx = tx - (box.left + e.w[0] * k), vy = ty - (box.top + e.w[1] * k), d = Math.sqrt(vx * vx + vy * vy);
          var t = e.w[4] * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), ou = 0, ov = 0;
          if (d > .5) { var m = Math.min(1, d / REACH) / d; ou = (vx * c + vy * s) * m * e.ra; ov = (vy * c - vx * s) * m * e.rb; }
          dx = e.w[0] + ou * c - ov * s - e.p[0];
          dy = e.w[1] + ou * s + ov * c - e.p[1];
        }
        if (Math.abs(dx - e.dx) > .05 || Math.abs(dy - e.dy) > .05) {
          e.dx = dx; e.dy = dy;
          e.node.style.transform = 'translate(' + dx.toFixed(2) + 'px, ' + dy.toFixed(2) + 'px)';
        }
      });
    });
  }
  function rest() { pointer = null; focused = null; queue(); }

  window.addEventListener('pointermove', function (ev) {
    if (ev.pointerType === 'touch') return;   // a finger dragging is scrolling, not pointing
    pointer = [ev.clientX, ev.clientY]; focused = null; queue();
  }, { passive: true });
  window.addEventListener('pointerdown', function (ev) {
    pointer = [ev.clientX, ev.clientY]; focused = null; queue();
    clearTimeout(restTimer);
    if (ev.pointerType === 'touch') restTimer = setTimeout(rest, 2500);   // a glance at the tap, then back
  }, { passive: true });
  document.addEventListener('focusin', function (ev) {
    try { if (ev.target.matches(':focus-visible')) { focused = ev.target; queue(); } } catch (err) { /* no :focus-visible */ }
  });
  document.documentElement.addEventListener('mouseleave', rest);
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });

  Array.prototype.forEach.call(document.images, function (img) {
    var def = ART[(img.getAttribute('src') || '').split('?')[0].split('/').pop()];
    if (!def) return;
    var go = function () { try { build(img, def); } catch (err) { /* canvas blocked (e.g. a file:// page): leave the art alone */ } };
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
  });
})();
