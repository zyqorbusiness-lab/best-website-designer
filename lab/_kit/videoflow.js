/* Zyqor Video Flow runtime - canvas image-sequence scroll scrub (shared by every generated page).
   Generated pages carry <main data-vf="flow.json"> plus beats with data-from / data-to (0-1 of the scrub track).
   Desktop: GSAP ScrollTrigger + Lenis (when loaded). Phone (<html data-build="m">): native scroll, lighter frame set.
   prefers-reduced-motion: no scrub, the poster frame and the copy render as a normal page.
   No dependencies of its own; ~5 KB minified. MIT, Zyqor Studio. */
const html = document.documentElement;
const isM = html.dataset.build === 'm';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const ease = (t) => 1 - Math.pow(1 - t, 3);
const pad = (i) => String(i + 1).padStart(4, '0');

const main = document.querySelector('[data-vf]');
if (main) start(main);

async function start(main) {
  let man;
  try { man = await (await fetch(main.dataset.vf, { cache: 'force-cache' })).json(); }
  catch (e) { html.classList.add('vf-reduced'); reveals(); counts(); return; }
  const set = man.frames[isM ? 'm' : 'd'];
  const url = (i) => set.src.replace('{i}', pad(i));
  const track = main.querySelector('.vf-track');
  const stage = main.querySelector('.vf-stage');
  const canvas = stage.querySelector('canvas');
  const hero = stage.querySelector('.vf-hero');
  const beats = [...stage.querySelectorAll('.vf-beat')].map((el) => ({
    el, from: +el.dataset.from, to: +el.dataset.to, hold: el.hasAttribute('data-hold'), tone: el.dataset.tone || '',
    words: [...el.querySelectorAll('.vf-w > i')],
  }));
  const heroTo = +(hero && hero.dataset.to) || 0.1;
  const heroWords = hero ? [...hero.querySelectorAll('.vf-w > i')] : [];
  const dots = [...stage.querySelectorAll('.vf-dot')];
  const fill = stage.querySelector('.vf-fill');
  const tc = stage.querySelector('.vf-tc b');
  const pct = stage.querySelector('.vf-pct b');
  const cue = stage.querySelector('.vf-cue');
  const lenis = smooth();

  /* jump links (rail dots, filmstrip) scroll to a point of the track */
  const yFor = (p) => track.getBoundingClientRect().top + scrollY + p * (track.offsetHeight - innerHeight);
  main.addEventListener('click', (e) => {
    const b = e.target.closest('[data-jump]'); if (!b) return;
    e.preventDefault(); const y = yFor(+b.dataset.jump);
    if (lenis) lenis.scrollTo(y, { duration: 1.6 }); else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  });
  reveals(); counts(); magnetic(); fit(stage);

  if (reduced) { html.classList.add('vf-reduced'); return; }

  /* ---- frames: first frame, then every 8th, 4th, 2nd, then the rest ---- */
  const n = set.n, imgs = new Array(n);
  const order = [0], seen = new Set([0]);
  for (const step of [8, 4, 2, 1]) for (let i = 0; i < n; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  if (!seen.has(n - 1)) order.splice(1, 0, n - 1);
  let qi = 0, active = 0, dirty = true;
  const conc = isM ? 4 : 6;
  function pump() {
    while (active < conc && qi < order.length) {
      const i = order[qi++]; active++;
      const im = new Image(); im.decoding = 'async'; im.src = url(i);
      const done = () => { active--; if (im.naturalWidth) { imgs[i] = im; if (Math.abs(i - cur) <= 8 || i === 0) dirty = true; } pump(); };
      (im.decode ? im.decode() : Promise.resolve()).then(done, done);
    }
  }
  pump(); /* frame 0 is preloaded in the head, so it lands first */

  /* ---- canvas: DPR-aware, cover-fit around the configured focus point ---- */
  const ctx = canvas.getContext('2d', { alpha: false });
  const fx = (man.focus && man.focus[0]) ?? 0.5, fy = (man.focus && man.focus[1]) ?? 0.5;
  let cw = 0, ch = 0;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, isM ? 1.5 : 2);
    const w = stage.clientWidth, h = stage.clientHeight;
    cw = canvas.width = Math.round(w * dpr); ch = canvas.height = Math.round(h * dpr);
    ctx.imageSmoothingQuality = 'high'; dirty = true;
  }
  resize(); addEventListener('resize', resize);
  const near = (i) => { for (let d = 0; d < n; d++) { if (imgs[i - d]) return imgs[i - d]; if (imgs[i + d]) return imgs[i + d]; } return null; };
  let drawn = null, drawnSize = '';
  function draw(i) {
    const im = near(i); if (!im) return;
    const size = cw + 'x' + ch;
    if (im === drawn && size === drawnSize && !dirty) return;
    const iw = im.naturalWidth, ih = im.naturalHeight, s = Math.max(cw / iw, ch / ih);
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(im, (cw - dw) * fx, (ch - dh) * fy, dw, dh);
    drawn = im; drawnSize = size; dirty = false;
    stage.classList.add('vf-live');
  }

  /* ---- scroll progress ---- */
  let target = 0, cur = 0;
  const read = () => { const r = track.getBoundingClientRect(); target = clamp(-r.top / Math.max(1, r.height - innerHeight)); };
  if (!isM && window.ScrollTrigger) {
    window.ScrollTrigger.create({ trigger: track, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { target = s.progress; } });
    read();
  } else { addEventListener('scroll', read, { passive: true }); read(); }
  cur = target;

  /* ---- copy beats ---- */
  const win = isM ? 0.26 : 0.22;
  function beatV(b, p) {
    const l = (p - b.from) / Math.max(1e-4, b.to - b.from);
    if (l <= 0 || (l >= 1 && !b.hold)) return [0, 0, 0];
    const a = clamp(l / win), o = b.hold ? 1 : clamp((1 - l) / win);
    return [Math.min(a, o), a, o];
  }
  function words(list, a) {
    for (let k = 0; k < list.length; k++) {
      const t = ease(clamp(a * 1.5 - k * 0.07));
      list[k].style.transform = `translate3d(0,${(1 - t) * 105}%,0)`;
    }
  }
  let lastI = -1, lastTone = '', lastHero = -1;
  function frame(p) {
    const i = Math.round(p * (n - 1));
    draw(i);
    if (hero) {
      const l = clamp(p / heroTo), v = 1 - ease(l);
      if (Math.abs(v - lastHero) > 0.001) {
        hero.style.opacity = v.toFixed(3);
        hero.style.transform = `translate3d(0,${(-l * 12).toFixed(2)}vh,0) scale(${(1 + l * 0.08).toFixed(4)})`;
        hero.style.visibility = v <= 0.001 ? 'hidden' : '';
        lastHero = v;
      }
    }
    let best = -1, bestV = 0, tone = hero && p < heroTo * 0.6 ? hero.dataset.tone || '' : '';
    beats.forEach((b, k) => {
      const [v, a, o] = beatV(b, p);
      b.el.style.opacity = v.toFixed(3);
      b.el.style.visibility = v <= 0.001 ? 'hidden' : 'visible';
      b.el.style.transform = `translate3d(0,${((1 - o) * -36).toFixed(1)}px,0)`;
      if (b.words.length) words(b.words, a);
      if (v > bestV) { bestV = v; best = k; }
    });
    if (best >= 0 && bestV > 0.35) tone = beats[best].tone || tone;
    if (tone && tone !== lastTone) { stage.dataset.tone = tone; lastTone = tone; }
    dots.forEach((d, k) => d.classList.toggle('on', k === best));
    if (fill) fill.style.transform = `scaleY(${p.toFixed(4)})`;
    if (i !== lastI) { if (tc) tc.textContent = String(i + 1).padStart(3, '0'); if (pct) pct.textContent = String(Math.round(p * 100)).padStart(2, '0'); lastI = i; }
    if (cue) cue.style.opacity = (1 - clamp(p * 25)).toFixed(2);
  }
  if (hero) words(heroWords, 0);
  /* hero entrance */
  let t0 = performance.now();
  /* ---- loop: runs only while the track is on screen ---- */
  let on = true, raf = 0, last = performance.now();
  function loop(t) {
    raf = 0; const dt = Math.min(0.05, (t - last) / 1000); last = t;
    cur += (target - cur) * (1 - Math.exp(-dt * (isM ? 16 : 12)));
    if (Math.abs(target - cur) < 1e-4) cur = target;
    frame(cur);
    if (hero && heroWords.length) words(heroWords, clamp((t - t0) / 1100));
    if (on) raf = requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }).observe(track);
  raf = requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && on && !raf) raf = requestAnimationFrame(loop); });
  stage.classList.add('vf-ready');
}

/* shrink one-line display headlines (hero h1, [data-fit]) until they fit their box */
function fit(root) {
  const els = [...root.querySelectorAll('.vf-hero h1, [data-fit]')];
  const run = () => els.forEach((el) => {
    el.style.fontSize = '';
    const box = el.clientWidth - 6, w = el.scrollWidth;
    if (w > box) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * box / w).toFixed(1) + 'px';
  });
  run(); if (document.fonts) document.fonts.ready.then(run);
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(run, 120); });
}
/* Lenis + ScrollTrigger (desktop only, when the vendor scripts are on the page) */
function smooth() {
  if (reduced || isM || !window.Lenis) return null;
  const lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
  if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
  if (window.gsap) { window.gsap.registerPlugin && window.ScrollTrigger && window.gsap.registerPlugin(window.ScrollTrigger); window.gsap.ticker.add((t) => lenis.raf(t * 1000)); window.gsap.ticker.lagSmoothing(0); }
  else { const r = (t) => { lenis.raf(t); requestAnimationFrame(r); }; requestAnimationFrame(r); }
  return lenis;
}
/* [data-rv] lazy reveals (same classes as lab.css) */
function reveals() {
  const els = [...document.querySelectorAll('[data-rv]')];
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('rv-in')); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}
/* [data-count] number roll when visible */
function counts() {
  const els = [...document.querySelectorAll('[data-count]')];
  const run = (el) => {
    const end = +el.dataset.count, dec = (el.dataset.count.split('.')[1] || '').length;
    if (reduced) { el.textContent = end.toFixed(dec); return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => { const k = ease(clamp((t - t0) / dur)); el.textContent = (end * k).toFixed(dec); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }), { threshold: 0.5 });
  els.forEach((e) => io.observe(e));
}
/* magnetic pills (desktop pointer only) */
function magnetic() {
  if (reduced || isM || !matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.vf-mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${((e.clientX - r.left) / r.width - 0.5) * 14}px,${((e.clientY - r.top) / r.height - 0.5) * 10}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
