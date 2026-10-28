/* =====================================================================
   Liquid Glass UI  v2  ·  Zyqor Studio  ·  MIT
   kit/liquid-glass.js  (17 KB, 6 KB gzipped, no dependencies)
   1. Refraction: an SVG filter per glass size. A displacement map drawn from the
      shape's signed distance bends the backdrop at the rim like a convex lens,
      with a slight split of red / green / blue at the edge (chromatic aberration).
      Chromium only (backdrop-filter:url()). Safari and Firefox keep the CSS glass.
   2. Pointer light: the sheen and the rim follow the pointer (off for reduced motion).
   3. Parts: segmented control + tab bar lens, switch, slider, sheet, tooltip.
   4. Adaptive tint: floating glass marked data-lg-adapt frosts up over data-lg-backdrop sections.
   API: LiquidGlass.refresh()  · LiquidGlass.openSheet(dialog) · LiquidGlass.closeSheet(dialog)
   Opt out per element: data-lg-refract="off". Tune: data-lg-strength="0.4..1.6".
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.documentElement;
  var ua = navigator.userAgent;
  var mq = function (q) { return w.matchMedia && w.matchMedia(q).matches; };
  var reduceMotion = mq('(prefers-reduced-motion: reduce)');
  var reduceTransp = mq('(prefers-reduced-transparency: reduce)');
  var coarse = mq('(pointer: coarse)') || Math.min(screen.width, screen.height) < 600;
  // backdrop-filter:url() works in desktop and Android Chromium only. iOS browsers are all WebKit.
  var chromium = (!!navigator.userAgentData || /Chrom(e|ium)\/\d+/.test(ua)) && !/iPhone|iPad|iPod|CriOS|FxiOS|Firefox/.test(ua);
  var lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  var canRefract = chromium && !reduceTransp && !/[?&]lg=flat/.test(location.search);
  if (coarse) root.classList.add('lg-lite');
  if (reduceTransp || /[?&]lg=solid/.test(location.search)) root.classList.add('lg-solid');
  root.classList.add(canRefract ? 'lg-refract' : 'lg-norefract');

  /* ---------------- 1. refraction ---------------- */
  var NS = 'http://www.w3.org/2000/svg', defs, cache = {}, seq = 0;
  function ensureDefs() {
    if (defs) return defs;
    var s = d.createElementNS(NS, 'svg');
    s.setAttribute('aria-hidden', 'true'); s.setAttribute('width', '0'); s.setAttribute('height', '0');
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    defs = d.createElementNS(NS, 'defs'); s.appendChild(defs); d.body.appendChild(s);
    return defs;
  }
  // signed distance to a rounded box centred at 0 (Inigo Quilez)
  function sd(px, py, hx, hy, r) {
    var qx = Math.abs(px) - hx + r, qy = Math.abs(py) - hy + r;
    var ox = Math.max(qx, 0), oy = Math.max(qy, 0);
    return Math.min(Math.max(qx, qy), 0) + Math.sqrt(ox * ox + oy * oy) - r;
  }
  // displacement map: R = x shift, G = y shift (128 = none). Inward pull at the rim
  // (convex bevel, falls off with the bevel's slope) + a gentle magnification inside.
  function lensMap(W, H, r, bezel, zoom) {
    var k = 2, cw = Math.max(2, Math.round(W / k)), ch = Math.max(2, Math.round(H / k));
    var c = d.createElement('canvas'); c.width = cw; c.height = ch;
    var g = c.getContext('2d'), img = g.createImageData(cw, ch), p = img.data;
    var hx = W / 2, hy = H / 2, e = 0.75;
    for (var j = 0; j < ch; j++) {
      for (var i = 0; i < cw; i++) {
        var x = (i + 0.5) * k - hx, y = (j + 0.5) * k - hy;
        var dist = sd(x, y, hx, hy, r);
        var dx = 0, dy = 0;
        if (dist < 0) {
          var t = Math.min(1, -dist / bezel);            // 0 at rim, 1 past the bevel
          var m = Math.pow(1 - t, 2.4);                    // slope of a convex profile
          if (m > 0.002) {
            var nx = sd(x + e, y, hx, hy, r) - sd(x - e, y, hx, hy, r);
            var ny = sd(x, y + e, hx, hy, r) - sd(x, y - e, hx, hy, r);
            var nl = Math.sqrt(nx * nx + ny * ny) || 1;
            dx = -nx / nl * m; dy = -ny / nl * m;           // sample inward
          }
          dx -= (x / hx) * zoom; dy -= (y / hy) * zoom;     // lens: sample toward centre
        }
        var o = (j * cw + i) * 4;
        p[o] = 128 + Math.max(-127, Math.min(127, dx * 127));
        p[o + 1] = 128 + Math.max(-127, Math.min(127, dy * 127));
        p[o + 2] = 128; p[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL();
  }
  function el(tag, attrs, parent) {
    var n = d.createElementNS(NS, tag);
    for (var a in attrs) n.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function filterFor(W, H, r, strength, blur, chroma) {
    W = Math.round(W); H = Math.round(H); r = Math.min(Math.round(r), Math.floor(Math.min(W, H) / 2));
    var key = [W, H, r, strength, blur, chroma].join('_');
    if (cache[key]) return cache[key];
    var minS = Math.min(W, H);
    var bezel = Math.max(8, Math.min(30, minS * 0.36));
    var scale = Math.round(Math.min(64, bezel * 2.1) * strength);
    var zoom = minS > 140 ? 0.035 : 0.06;
    var id = 'lg-f' + (++seq);
    var f = el('filter', { id: id, x: 0, y: 0, width: W, height: H, filterUnits: 'userSpaceOnUse',
      primitiveUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' }, ensureDefs());
    el('feGaussianBlur', { 'in': 'SourceGraphic', stdDeviation: blur, edgeMode: 'duplicate', result: 'b' }, f);
    el('feImage', { href: lensMap(W, H, r, bezel, zoom), x: 0, y: 0, width: W, height: H,
      preserveAspectRatio: 'none', result: 'm' }, f);
    if (!chroma) {
      el('feDisplacementMap', { 'in': 'b', in2: 'm', scale: scale, xChannelSelector: 'R', yChannelSelector: 'G' }, f);
    } else {
      var ch = [['R', 1, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'],
                ['G', 0.93, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'],
                ['B', 0.86, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0']];
      ch.forEach(function (c) {
        el('feDisplacementMap', { 'in': 'b', in2: 'm', scale: Math.round(scale * c[1]), xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' + c[0] }, f);
        el('feColorMatrix', { 'in': 'd' + c[0], type: 'matrix', values: c[2], result: 'c' + c[0] }, f);
      });
      el('feBlend', { 'in': 'cR', in2: 'cG', mode: 'screen', result: 'rg' }, f);
      el('feBlend', { 'in': 'rg', in2: 'cB', mode: 'screen' }, f);
    }
    return (cache[key] = 'url(#' + id + ')');
  }
  var watched = new WeakMap(), ro = w.ResizeObserver ? new ResizeObserver(function (list) {
    list.forEach(function (en) { glaze(en.target); });
  }) : null;
  function glaze(n) {
    if (!canRefract || n.dataset.lgRefract === 'off') return;
    var b = n.getBoundingClientRect();
    if (b.width < 8 || b.height < 8) return;
    var area = b.width * b.height;
    // phones and low-power machines: refraction on small controls only, no colour split
    var lite = coarse || lowPower;
    if (lite && area > 90000) { n.style.removeProperty('backdrop-filter'); return; }
    var cs = getComputedStyle(n);
    var r = parseFloat(cs.borderTopLeftRadius) || 0;
    var strength = parseFloat(n.dataset.lgStrength || '1');
    var blur = n.classList.contains('lg--clear') ? 0.6 : (parseFloat(cs.getPropertyValue('--_blur')) || 12) * 0.5;
    var chroma = !lite && n.dataset.lgChroma !== 'off';
    var sat = cs.getPropertyValue('--_sat').trim() || '1.8';
    n.style.setProperty('backdrop-filter', filterFor(b.width, b.height, r, strength, blur, chroma) + ' saturate(' + sat + ') brightness(1.05)');
  }
  var SEL = '.lg:not(.lg-card):not(.lg-sheet), .lg-card[data-lg-refract="on"], .lg-sheet[data-lg-refract="on"], .lg-lens';
  function scanRefract(scope) {
    if (!canRefract) return;
    (scope || d).querySelectorAll(SEL).forEach(function (n) {
      if (!watched.has(n)) { watched.set(n, 1); if (ro) ro.observe(n); }
      glaze(n);
    });
  }

  /* ---------------- 2. pointer light ---------------- */
  function light(e) {
    var n = e.target.closest && e.target.closest('.lg');
    if (!n) return;
    var b = n.getBoundingClientRect();
    var x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    n.style.setProperty('--lg-x', (x * 100).toFixed(1) + '%');
    n.style.setProperty('--lg-y', (y * 100).toFixed(1) + '%');
    n.style.setProperty('--lg-a', (Math.atan2(y - 0.5, x - 0.5) * 180 / Math.PI + 90).toFixed(1) + 'deg');
  }
  if (!reduceMotion && !coarse) d.addEventListener('pointermove', light, { passive: true });
  // press glow everywhere (also for touch); the sheen is the touch point
  d.addEventListener('pointerdown', function (e) {
    var n = e.target.closest && e.target.closest('.lg-btn,.lg-switch');
    if (!n) return;
    n.classList.add('is-press');
    if (!reduceMotion) light(e);
    var up = function () { n.classList.remove('is-press'); w.removeEventListener('pointerup', up); w.removeEventListener('pointercancel', up); };
    w.addEventListener('pointerup', up); w.addEventListener('pointercancel', up);
  }, { passive: true });

  /* ---------------- 3. parts ---------------- */
  // segmented control and tab bar: a glass lens slides under the active option
  function setupGroup(g) {
    if (g.__lg) return; g.__lg = 1;
    var lens = d.createElement('span'); lens.className = 'lg-lens'; lens.setAttribute('aria-hidden', 'true');
    g.insertBefore(lens, g.firstChild);
    var tab = g.getAttribute('role') === 'tablist';
    var btns = [].slice.call(g.querySelectorAll(':scope > button'));
    var attr = tab ? 'aria-selected' : 'aria-pressed';
    function place(animate) {
      var on = btns.filter(function (b) { return b.getAttribute(attr) === 'true'; })[0] || btns[0];
      if (!on) return;
      if (!animate) lens.style.transition = 'none';
      lens.style.width = on.offsetWidth + 'px';
      lens.style.transform = 'translateX(' + on.offsetLeft + 'px)';
      if (!animate) { lens.offsetWidth; lens.style.transition = ''; }
      glaze(lens);
    }
    function pick(b, focus) {
      btns.forEach(function (x) { x.setAttribute(attr, x === b ? 'true' : 'false'); if (tab) x.tabIndex = x === b ? 0 : -1; });
      if (focus) b.focus();
      place(true);
      g.dispatchEvent(new CustomEvent('lg:change', { bubbles: true, detail: { index: btns.indexOf(b), value: b.value || b.textContent.trim() } }));
    }
    btns.forEach(function (b, i) {
      if (!b.hasAttribute(attr)) b.setAttribute(attr, i === 0 ? 'true' : 'false');
      if (tab) b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { pick(b); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = btns.length, j = btns.indexOf(b);
        if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); pick(btns[(j + (k === 'ArrowRight' ? 1 : n - 1)) % n], true); }
      });
    });
    g.addEventListener('lg:place', function () { place(true); });
    place(false);
    if (w.ResizeObserver) new ResizeObserver(function () { place(false); }).observe(g);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { place(false); });
  }
  function setupSwitch(s) {
    if (s.__lg) return; s.__lg = 1;
    if (!s.querySelector('.lg-switch__thumb')) { var t = d.createElement('span'); t.className = 'lg-switch__thumb'; s.appendChild(t); }
    s.setAttribute('role', 'switch');
    if (!s.hasAttribute('aria-checked')) s.setAttribute('aria-checked', 'false');
    s.addEventListener('click', function () {
      var on = s.getAttribute('aria-checked') !== 'true';
      s.setAttribute('aria-checked', on ? 'true' : 'false');
      s.dispatchEvent(new CustomEvent('lg:change', { bubbles: true, detail: { checked: on } }));
    });
  }
  function setupSlider(s) {
    if (s.__lg) return; s.__lg = 1;
    var inp = s.querySelector('input[type=range]');
    if (!inp) return;
    if (!s.querySelector('.lg-slider__track')) {
      s.insertAdjacentHTML('beforeend', '<span class="lg-slider__track" aria-hidden="true"><span class="lg-slider__fill"></span></span><span class="lg-slider__thumb" aria-hidden="true"></span>');
    }
    var thumb = s.querySelector('.lg-slider__thumb');
    function upd() {
      var min = +inp.min || 0, max = inp.max === '' ? 100 : +inp.max, v = (+inp.value - min) / (max - min);
      // keep the thumb inside the track ends
      s.style.setProperty('--v', 'calc(' + (v * 100).toFixed(2) + '% + ' + ((0.5 - v) * 30).toFixed(1) + 'px)');
    }
    inp.addEventListener('input', upd);
    var on = function () { s.classList.add('is-drag'); glaze(thumb); };
    var off = function () { s.classList.remove('is-drag'); };
    inp.addEventListener('pointerdown', on); inp.addEventListener('pointerup', off); inp.addEventListener('pointercancel', off);
    inp.addEventListener('blur', off);
    upd();
  }
  function openSheet(dlg) {
    if (!dlg || dlg.open) return;
    dlg.classList.remove('is-closing');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    requestAnimationFrame(function () { scanRefract(dlg); });
  }
  function closeSheet(dlg) {
    if (!dlg || !dlg.open) return;
    if (reduceMotion) { dlg.close(); return; }
    dlg.classList.add('is-closing');
    setTimeout(function () { dlg.classList.remove('is-closing'); dlg.close(); }, 250);
  }
  function setupSheets() {
    d.querySelectorAll('[data-lg-open]').forEach(function (b) {
      if (b.__lg) return; b.__lg = 1;
      b.addEventListener('click', function () { openSheet(d.getElementById(b.getAttribute('data-lg-open'))); });
    });
    d.querySelectorAll('dialog.lg-sheet').forEach(function (dlg) {
      if (dlg.__lg) return; dlg.__lg = 1;
      dlg.addEventListener('click', function (e) {          // tap outside closes
        if (e.target === dlg) { var b = dlg.getBoundingClientRect();
          if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) closeSheet(dlg); }
        if (e.target.closest('[data-lg-close]')) closeSheet(dlg);
      });
      dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeSheet(dlg); });
    });
  }
  // tooltips: hover and keyboard via CSS; tap toggles on touch
  function setupTips() {
    d.querySelectorAll('[data-lg-tip]').forEach(function (n) {
      if (n.__lg) return; n.__lg = 1;
      var tip = d.createElement('span');
      tip.className = 'lg lg--dark lg-tip' + (n.dataset.lgTipPos === 'below' ? ' lg-tip--below' : '');
      tip.setAttribute('role', 'tooltip'); tip.id = 'lg-tip' + (++seq); tip.textContent = n.getAttribute('data-lg-tip');
      n.appendChild(tip); n.setAttribute('aria-describedby', tip.id);
      ['pointerenter', 'focus', 'click'].forEach(function (ev) { n.addEventListener(ev, function () { fitTip(n); }); });
      n.addEventListener('click', function () {
        if (!coarse) return;
        n.classList.toggle('is-tip');
        clearTimeout(n.__t); n.__t = setTimeout(function () { n.classList.remove('is-tip'); }, 2600);
      });
    });
  }

  /* ---------------- 4. adaptive tint ----------------
     Glass that floats (fixed bars) turns more frosted over flat light or dark sections, the way
     system glass does, so its labels keep 4.5:1. Mark sections: data-lg-backdrop="paper" | "ink".
     Mark floating glass: data-lg-adapt. Classes set: .lg-on-paper / .lg-on-ink */
  var adapters = [], ticking = false;
  function adaptNow() {
    ticking = false;
    adapters.forEach(function (n) {
      var b = n.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
      var prev = n.style.pointerEvents; n.style.pointerEvents = 'none';
      var under = d.elementFromPoint(Math.max(0, Math.min(innerWidth - 1, x)), Math.max(0, Math.min(innerHeight - 1, y)));
      n.style.pointerEvents = prev;
      var s = under && under.closest('[data-lg-backdrop]'), kind = s ? s.getAttribute('data-lg-backdrop') : '';
      n.classList.toggle('lg-on-paper', kind === 'paper');
      n.classList.toggle('lg-on-ink', kind === 'ink');
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(adaptNow); } }
  function setupAdapt() {
    adapters = [].slice.call(d.querySelectorAll('[data-lg-adapt]'));
    if (adapters.length && !setupAdapt.on) { setupAdapt.on = 1; w.addEventListener('scroll', onScroll, { passive: true }); w.addEventListener('resize', onScroll); }
    onScroll();
  }
  // keep a tooltip inside the viewport
  function fitTip(n) {
    var tip = n.querySelector(':scope > .lg-tip'); if (!tip) return;
    tip.style.setProperty('--lg-tip-dx', '0px');
    var was = tip.style.display; tip.style.display = 'block'; // closed tips are display:none
    var b = tip.getBoundingClientRect(); tip.style.display = was;
    var m = 8, dx = 0;
    var vw = d.documentElement.clientWidth;
    if (b.left < m) dx = m - b.left; else if (b.right > vw - m) dx = vw - m - b.right;
    tip.style.setProperty('--lg-tip-dx', Math.round(dx) + 'px');
  }
  function refresh() {
    d.querySelectorAll('.lg-seg, .lg-tabbar').forEach(setupGroup);
    d.querySelectorAll('.lg-switch').forEach(setupSwitch);
    d.querySelectorAll('.lg-slider').forEach(setupSlider);
    setupSheets(); setupTips(); setupAdapt();
    scanRefract();
  }
  w.LiquidGlass = { refresh: refresh, openSheet: openSheet, closeSheet: closeSheet,
    supportsRefraction: canRefract, filterFor: filterFor, lensMap: lensMap };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', refresh); else refresh();
})(window, document);
