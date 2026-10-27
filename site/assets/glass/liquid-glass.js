/* Zyqor liquid glass v1 (Oct 27, 2026)  site/assets/glass/liquid-glass.js
   Optional enhancer for liquid-glass.css. Load with <script src=".../liquid-glass.js" defer></script>.
   - html.lg-on always; html.lg-lite on phones / coarse pointers / data-build="m" (no refraction, no pointer work)
   - html.lg-hi on desktop: pointer-follow specular (--lg-x/--lg-y/--lg-hl) and scroll-turned rim light (--lg-a)
   - edge refraction on Chromium desktop: a per-size SVG displacement map fed to backdrop-filter, applied to
     .lg-pill, .lg-btn, .lg-seg, .lg-round, .lg-menu and anything with .lg-refract (not to big .lg-card tiles,
     unless they carry .lg-refract). Skipped for reduced motion / reduced transparency / Save-Data.
   - window.ZyqorGlass.refresh() re-scans after you add glass elements dynamically. */
(function () {
  'use strict';
  if (window.ZyqorGlass) return;
  var d = document, root = d.documentElement;
  var mm = function (q) { return window.matchMedia && matchMedia(q).matches; };
  var reduceMotion = mm('(prefers-reduced-motion: reduce)');
  var reduceTransp = mm('(prefers-reduced-transparency: reduce)');
  var coarse = mm('(hover: none) and (pointer: coarse)');
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var lite = coarse || root.dataset.build === 'm' || (d.body && d.body.classList.contains('is-mobile')) || innerWidth <= 860;
  var brands = (navigator.userAgentData && navigator.userAgentData.brands) || [];
  var chromium = brands.some(function (b) { return /Chromium|Google Chrome|Microsoft Edge/.test(b.brand); }) ||
    (/Chrome\/\d+/.test(navigator.userAgent) && !/Edg\/|OPR\//.test(navigator.userAgent) && !/iPhone|iPad|Android/.test(navigator.userAgent));
  var canRefract = !lite && chromium && !reduceMotion && !reduceTransp && !saveData && CSS.supports('backdrop-filter', 'blur(1px)');

  root.classList.add('lg-on');
  root.classList.add(lite ? 'lg-lite' : 'lg-hi');
  if (reduceTransp) root.classList.add('lg-solid');

  /* ---------------- edge refraction ---------------- */
  var SVGNS = 'http://www.w3.org/2000/svg', defs = null, cache = {}, seq = 0;
  function ensureDefs() {
    if (defs) return defs;
    var svg = d.createElementNS(SVGNS, 'svg');
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    defs = d.createElementNS(SVGNS, 'defs'); svg.appendChild(defs); d.body.appendChild(svg);
    return defs;
  }
  // signed distance to a rounded box centred at 0 (iq)
  function sd(px, py, hx, hy, r) {
    var qx = Math.abs(px) - hx + r, qy = Math.abs(py) - hy + r;
    var ox = Math.max(qx, 0), oy = Math.max(qy, 0);
    return Math.min(Math.max(qx, qy), 0) + Math.sqrt(ox * ox + oy * oy) - r;
  }
  function edgeMap(w, h, r, bezel) {
    var c = d.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'), img = g.createImageData(w, h), p = img.data;
    var hx = w / 2, hy = h / 2, e = 0.75;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var px = x + 0.5 - hx, py = y + 0.5 - hy;
        var dist = sd(px, py, hx, hy, r), i = (y * w + x) * 4, dx = 0, dy = 0;
        if (dist < 0 && -dist < bezel) {
          var t = 1 + dist / bezel;              // 1 at the rim, 0 where the flat glass begins
          var m = t * t * (3 - 2 * t);           // smooth convex shoulder
          var nx = sd(px + e, py, hx, hy, r) - sd(px - e, py, hx, hy, r);
          var ny = sd(px, py + e, hx, hy, r) - sd(px, py - e, hx, hy, r);
          var l = Math.sqrt(nx * nx + ny * ny) || 1;
          dx = -nx / l * m; dy = -ny / l * m;    // sample inward: the rim bends the backdrop like a lens
        }
        p[i] = 128 + dx * 127; p[i + 1] = 128 + dy * 127; p[i + 2] = 128; p[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }
  function filterFor(w, h, r) {
    w = Math.max(8, Math.round(w / 2) * 2); h = Math.max(8, Math.round(h / 2) * 2);
    r = Math.min(Math.round(r), Math.floor(Math.min(w, h) / 2));
    var key = w + 'x' + h + 'r' + r;
    if (cache[key]) return cache[key];
    var bezel = Math.max(6, Math.min(18, Math.min(w, h) * 0.32));
    var scale = Math.round(Math.min(26, bezel * 1.35));
    var id = 'lg-r' + (++seq);
    var f = d.createElementNS(SVGNS, 'filter');
    f.setAttribute('id', id); f.setAttribute('x', '0'); f.setAttribute('y', '0');
    f.setAttribute('width', w); f.setAttribute('height', h);
    f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('primitiveUnits', 'userSpaceOnUse');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    var im = d.createElementNS(SVGNS, 'feImage');
    im.setAttribute('href', edgeMap(w, h, r, bezel)); im.setAttribute('x', '0'); im.setAttribute('y', '0');
    im.setAttribute('width', w); im.setAttribute('height', h); im.setAttribute('preserveAspectRatio', 'none');
    im.setAttribute('result', 'map');
    var dm = d.createElementNS(SVGNS, 'feDisplacementMap');
    dm.setAttribute('in', 'SourceGraphic'); dm.setAttribute('in2', 'map'); dm.setAttribute('scale', scale);
    dm.setAttribute('xChannelSelector', 'R'); dm.setAttribute('yChannelSelector', 'G');
    f.appendChild(im); f.appendChild(dm); ensureDefs().appendChild(f);
    return (cache[key] = 'url(#' + id + ')');
  }
  var REFRACT = '.lg-pill,.lg-btn,.lg-seg,.lg-round,.lg-menu,.lg-refract';
  var ro = canRefract && 'ResizeObserver' in window ? new ResizeObserver(function (es) {
    es.forEach(function (en) { applyRefract(en.target); });
  }) : null;
  function applyRefract(el) {
    if (el.closest('[data-lg-flat]')) return;
    var b = el.getBoundingClientRect();
    if (b.width < 8 || b.height < 8 || b.width * b.height > 520000) { el.style.removeProperty('--lg-filter'); return; }
    var r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    el.style.setProperty('--lg-filter', filterFor(b.width, b.height, r));
  }

  /* ---------------- pointer + scroll light ---------------- */
  var live = new Set(), io = null, px = -1e4, py = -1e4, raf = 0;
  if (!lite && !reduceMotion && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) live.add(en.target); else live.delete(en.target); });
    }, { rootMargin: '80px' });
  }
  function frame() {
    raf = 0;
    live.forEach(function (el) {
      var b = el.getBoundingClientRect();
      var cx = (px - b.left) / (b.width || 1), cy = (py - b.top) / (b.height || 1);
      var ox = Math.max(0, Math.abs(cx - 0.5) - 0.5) * b.width, oy = Math.max(0, Math.abs(cy - 0.5) - 0.5) * b.height;
      var dist = Math.sqrt(ox * ox + oy * oy);
      var hl = 0.55 + 0.6 * Math.max(0, 1 - dist / 260);
      el.style.setProperty('--lg-x', (Math.max(-0.3, Math.min(1.3, cx)) * 100).toFixed(1) + '%');
      el.style.setProperty('--lg-y', (Math.max(-0.6, Math.min(1.4, cy)) * 100).toFixed(1) + '%');
      el.style.setProperty('--lg-hl', hl.toFixed(2));
    });
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  var lastA = -1;
  function onScroll() {
    var max = Math.max(1, root.scrollHeight - innerHeight);
    var a = Math.round(110 + 70 * (scrollY / max));      // rim light swings 110deg -> 180deg down the page
    if (a !== lastA) { lastA = a; root.style.setProperty('--lg-a', a + 'deg'); }
    if (px > -1e3) kick();
  }

  /* selector -> classes map, for pages whose markup is built by JS or owned by someone else:
     <script type="application/json" id="lg-map">{".nav":"lg lg-pill", ".cta":"lg lg-btn lg--accent"}</script>
     or ZyqorGlass.map({...}). Applied on every scan, so late-built nodes are picked up. */
  var MAP = {};
  function addMap(m) { for (var k in m) if (Object.prototype.hasOwnProperty.call(m, k)) MAP[k] = m[k]; }
  try { var mj = d.getElementById('lg-map'); if (mj) addMap(JSON.parse(mj.textContent)); } catch (e) { /* bad JSON: ignore quietly */ }
  if (window.ZYQOR_GLASS_MAP) addMap(window.ZYQOR_GLASS_MAP);
  function applyMap(scope) {
    for (var sel in MAP) {
      var cls = String(MAP[sel]).split(/\s+/).filter(Boolean), nodes;
      try { nodes = (scope || d).querySelectorAll(sel); } catch (e) { continue; }
      nodes.forEach(function (el) { cls.forEach(function (c) { el.classList.add(c); }); });
    }
  }
  function scan(scope) {
    applyMap(scope);
    var list = (scope || d).querySelectorAll('.lg');
    list.forEach(function (el) {
      if (el.__lg) return; el.__lg = 1;
      if (io) io.observe(el);
      if (ro && el.matches(REFRACT)) { applyRefract(el); ro.observe(el); }
    });
  }

  function init() {
    scan();
    if (io) {
      addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.pointerType === 'pen') { px = e.clientX; py = e.clientY; kick(); } }, { passive: true });
      d.addEventListener('pointerleave', function () { px = py = -1e4; kick(); }, { passive: true });
    }
    if (!lite && !reduceMotion) { addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
    // late content (chrome.js, galleries) - re-scan a few times cheaply, then on demand
    var n = 0, t = setInterval(function () { scan(); if (++n > 5) clearInterval(t); }, 700);
  }
  window.ZyqorGlass = { refresh: function (s) { scan(s); }, map: function (m) { addMap(m); scan(); }, refract: canRefract, lite: lite };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
