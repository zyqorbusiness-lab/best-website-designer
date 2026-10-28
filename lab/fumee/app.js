/* Fumée (Concept) - desktop orchestration: loader, smoke field, kinetic type, pinned sequences, liquid swap, magnetic UI. */
import { reveals, smooth, reduced, hasWebGL } from '../_kit/kit.js';
import { createSmoke } from './smoke.js';
import { createLiquid } from './liquid.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gsap = window.gsap, ST = window.ScrollTrigger, Split = window.SplitText;
const root = document.documentElement;
const IMG = ['fig', 'incense', 'jasmine'].map((n) => `../../assets/lab/fumee/${n}-d.webp`);

/* ---------- concept-only CTA ---------- */
$$('[data-concept]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  const t = $('.cta-toast'); if (t) t.textContent = 'Concept only. Fumée is fictional, so there is nothing to send. Thank you for looking.';
}));

if (reduced || !gsap || !ST) {
  /* Static, complete page: no loader, no pins, no WebGL loop, everything visible. */
  root.classList.add('rm'); document.body.classList.remove('is-loading');
  reveals();
  const c = $('.smoke');
  if (c && !reduced && hasWebGL()) { /* GSAP missing but motion allowed: still show one smoke frame */
    try { createSmoke(c, { still: true }).renderOnce(); } catch (e) { /* CSS gradient stays */ }
  }
} else {
  run();
}

function run() {
  gsap.registerPlugin(ST); if (Split) gsap.registerPlugin(Split);
  const lenis = smooth(); if (lenis) lenis.stop();
  const ease = 'expo.out';

  /* ---------- smoke field ---------- */
  let smoke = null;
  try { if (!hasWebGL()) throw 0; /* no WebGL: the still from nogl-map.js stays on the canvas */ smoke = createSmoke($('.smoke'), { scale: Math.min(0.62, 1100 / innerWidth), simScale: 0.25 }); smoke.start(); }
  catch (e) { smoke = null; }
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY, dy = y - lastY; lastY = y;
    if (smoke) { smoke.setScroll(y / innerHeight * 0.35); smoke.kick(Math.min(0.5, Math.abs(dy) / 260)); }
  };
  if (lenis) lenis.on('scroll', onScroll); else addEventListener('scroll', onScroll, { passive: true });

  /* ---------- split headlines ---------- */
  const split = (el, type = 'chars,words') => {
    if (!Split || !el) return null;
    return new Split(el, { type, wordsClass: 'w', charsClass: 'ch', mask: type.includes('chars') ? 'words' : undefined });
  };
  const sA = split($('.ht-a')), sB = split($('.ht-b'));
  const heroChars = [...(sA ? sA.chars : []), ...(sB ? sB.chars : [])];
  if (sB && sB.chars.length) sB.chars[sB.chars.length - 1].classList.add('dot-acc');
  gsap.set(heroChars, { yPercent: 115, rotate: 6 });
  gsap.set(['.hero-eyebrow', '.hero-copy', '.hero-ctas .btn', '.brand', '.scroll-cue'], { autoAlpha: 0, y: 18 });

  /* ---------- loader: real progress (fonts + hero imagery) ---------- */
  const ld = $('.loader'), num = $('.ld-num'), bar = $('.ld-bar i');
  const loadImg = (u) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = () => res(); i.src = u; });
  const jobs = [document.fonts ? document.fonts.ready : Promise.resolve(), loadImg(IMG[0]), loadImg(IMG[1]), loadImg(IMG[2])];
  let done = 0; const prog = { v: 0 };
  jobs.forEach((j) => j.then(() => { done++; }));
  gsap.to('.ld-word span', { yPercent: -105, duration: 1.1, ease, stagger: .06, delay: .1, startAt: { yPercent: 105 } });
  const tick = () => {
    const target = done / jobs.length;
    prog.v += (target - prog.v) * .08; if (target === 1 && prog.v > .985) prog.v = 1;
    num.textContent = String(Math.round(prog.v * 100)).padStart(3, '0'); bar.style.transform = `scaleX(${prog.v})`;
  };
  gsap.ticker.add(tick);
  const minTime = new Promise((r) => setTimeout(r, 1500));
  const capped = Promise.race([Promise.all([...jobs, minTime]), new Promise((r) => setTimeout(r, 6000))]);
  capped.then(() => new Promise((r) => { const w = () => (prog.v >= 1 ? r() : (done = jobs.length, setTimeout(w, 50))); w(); }))
    .then(() => {
      gsap.ticker.remove(tick); num.textContent = '100'; bar.style.transform = 'scaleX(1)';
      const tl = gsap.timeline({ onComplete: () => { ld.remove(); document.body.classList.remove('is-loading'); if (lenis) lenis.start(); ST.refresh(); } });
      tl.to('.ld-word span', { yPercent: -110, duration: .7, ease: 'power3.in', stagger: .04 })
        .to('.ld-row, .ld-bar', { autoAlpha: 0, duration: .4 }, '<')
        .to(ld, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.15, ease: 'expo.inOut' }, '-=.15')
        .add(() => smoke && smoke.puff(.3, .45, 10), '<+.2')
        .to(heroChars, { yPercent: 0, rotate: 0, duration: 1.5, ease, stagger: .035 }, '-=.6')
        .to(['.brand', '.hero-eyebrow'], { autoAlpha: 1, y: 0, duration: 1, ease, stagger: .1 }, '-=1.2')
        .to(['.hero-copy', '.hero-ctas .btn', '.scroll-cue'], { autoAlpha: 1, y: 0, duration: 1, ease, stagger: .08 }, '-=1.0');
    });

  /* ---------- hero: kinetic drift on scroll ---------- */
  gsap.to(heroChars, { yPercent: (i) => -30 - (i % 4) * 22, rotate: (i) => (i % 2 ? -4 : 4), ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } });
  gsap.to('.hero-foot, .hero-eyebrow', { y: -80, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: '80% top', scrub: true } });

  /* ---------- manifesto: pinned, words light up ---------- */
  const mf = split($('.mf-text'), 'words');
  if (mf) {
    const key = new Set(['moves.', 'fig.', 'smoke', 'dark.']);
    mf.words.forEach((w) => { if (key.has(w.textContent.trim())) w.dataset.key = '1'; });
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.manifesto', start: 'top top', end: '+=130%', pin: '.mf-pin', scrub: .5,
      onUpdate: (s) => smoke && smoke.setMood(1 + s.progress * 1.6) } });
    tl.to(mf.words, { color: (i, w) => (w.dataset.key ? '#C9705F' : '#EEE7DC'), stagger: .12, ease: 'none', duration: .6 })
      .from('.mf-sign', { autoAlpha: 0, y: 20, duration: .6 }, '>-0.2');
  }

  /* ---------- collection: pinned, liquid swap scrubbed by scroll ---------- */
  const N = 3, items = $$('.cs'), dots = $$('.dot'), liqEl = $('.liq');
  const nameSplits = items.map((li) => split($('.cs-name', li)));
  let cur = -1, liquid = null;
  try {
    if (!hasWebGL()) throw 0; /* no WebGL: the photo swap below runs instead */
    liquid = createLiquid($('.liq-gl'), IMG);
    liquid.ready.then(() => liqEl.classList.add('gl-ready')).catch(() => {});
  } catch (e) { liquid = null; }
  const showText = (i, dir = 1) => {
    if (i === cur) return;
    const prev = cur; cur = i;
    items.forEach((li, k) => { li.classList.toggle('on', k === i); li.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
    $('.liq-no').textContent = String(i + 1).padStart(2, '0');
    gsap.to('.liq-bar i', { scaleX: (i + 1) / N, duration: .8, ease });
    if (!liquid) $$('.liq-img').forEach((im, k) => im.classList.toggle('on', k === i));
    const li = items[i], s = nameSplits[i];
    if (prev >= 0) { const pl = items[prev]; gsap.set(pl, { autoAlpha: 0 }); }
    gsap.set(li, { autoAlpha: 1 });
    if (s) gsap.fromTo(s.chars, { yPercent: 110 * dir, rotate: 4 * dir }, { yPercent: 0, rotate: 0, duration: 1.1, ease, stagger: .025, overwrite: true });
    gsap.fromTo($$('.cs-no, .cs-line, .cs-notes div, .cs-fam', li), { autoAlpha: 0, y: 16 * dir }, { autoAlpha: 1, y: 0, duration: .9, ease, stagger: .05, delay: .1, overwrite: true });
  };
  showText(0);
  gsap.set(items.slice(1), { autoAlpha: 0 });
  const seg = (p) => { /* scroll progress -> image position with holds on each scent */
    const f = p * (N - 1), i = Math.min(N - 2, Math.floor(f)), t = f - i;
    const e = gsap.parseEase('power2.inOut')(gsap.utils.clamp(0, 1, (t - .22) / .56));
    return i + e;
  };
  const colST = ST.create({ trigger: '.collection', start: 'top top', end: `+=${(N - 1) * 110}%`, pin: '.col-pin', scrub: true,
    onUpdate: (s) => {
      const pos = seg(s.progress);
      if (liquid) liquid.set(pos);
      const idx = Math.round(pos);
      if (idx !== cur) showText(idx, idx > cur ? 1 : -1);
    },
    onToggle: (s) => { if (liquid) (s.isActive ? liquid.start() : liquid.stop()); },
  });
  const goTo = (i) => {
    i = (i + N) % N;
    const y = colST.start + (colST.end - colST.start) * (i / (N - 1));
    if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) }); else scrollTo({ top: y, behavior: 'smooth' });
  };
  dots.forEach((d) => d.addEventListener('click', () => goTo(+d.dataset.go)));
  $$('.arrow').forEach((b) => b.addEventListener('click', () => goTo(Math.max(cur, 0) + +b.dataset.step)));
  $('.collection').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(cur - 1); }
  });
  gsap.from('.col-head > *', { y: 30, autoAlpha: 0, duration: 1, ease, stagger: .1, scrollTrigger: { trigger: '.collection', start: 'top 70%' } });
  gsap.fromTo(liqEl, { clipPath: 'inset(100% 0% 0% 0% round 200px 200px 14px 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 200px 200px 14px 14px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.collection', start: 'top 65%' } });

  /* ---------- notes: pinned horizontal track ---------- */
  const track = $('.nt-track');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, { x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.notes', start: 'top top', end: () => `+=${dist()}`, pin: '.nt-pin', scrub: .8, invalidateOnRefresh: true } });
  $$('.nt-card img').forEach((im) => gsap.fromTo(im, { scale: 1.18 }, { scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.notes', start: 'top top', end: () => `+=${dist()}`, scrub: true } }));
  const nt = split($('.nt-title'), 'words');
  if (nt) gsap.from(nt.words, { yPercent: 100, autoAlpha: 0, duration: 1.1, ease, stagger: .04, scrollTrigger: { trigger: '.notes', start: 'top 60%' } });

  /* ---------- flacon: the drawing draws itself ---------- */
  const paths = $$('.flacon .dr');
  paths.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
  gsap.timeline({ scrollTrigger: { trigger: '.flacon-sec', start: 'top 70%', end: 'center 45%', scrub: .8 } })
    .to(paths, { strokeDashoffset: 0, ease: 'none', stagger: .08 })
    .from('.flacon .lbl text', { autoAlpha: 0, stagger: .1 }, '-=.4');
  const fl = split($('.fl-title'), 'chars,words');
  if (fl) gsap.from(fl.chars, { yPercent: 110, duration: 1.2, ease, stagger: .018, scrollTrigger: { trigger: '.fl-copy', start: 'top 75%' } });
  gsap.from('.fl-specs li', { autoAlpha: 0, x: 30, duration: 1, ease, stagger: .08, scrollTrigger: { trigger: '.fl-specs', start: 'top 80%' } });

  /* ---------- cta ---------- */
  const ct = split($('.cta-title'), 'chars,words');
  if (ct) gsap.from(ct.chars, { yPercent: 110, rotate: 5, duration: 1.3, ease, stagger: .02, scrollTrigger: { trigger: '.cta', start: 'top 65%' } });
  ST.create({ trigger: '.cta', start: 'top 60%', onEnter: () => smoke && smoke.kick(1.6) });

  /* ---------- magnetic buttons ---------- */
  $$('.mag').forEach((el) => {
    const inner = $('.mag-in', el) || el;
    const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'power3' });
    const ixTo = gsap.quickTo(inner, 'x', { duration: .6, ease: 'power3' }), iyTo = gsap.quickTo(inner, 'y', { duration: .6, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * .32); yTo(dy * .42); ixTo(dx * .14); iyTo(dy * .18);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1,.35)' }); gsap.to(inner, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1,.35)' });
    });
  });

  /* ---------- cursor ---------- */
  const cur$ = $('.cursor'), dot = $('.cur-dot'), ring = $('.cur-ring');
  if (cur$ && matchMedia('(hover: hover)').matches) {
    const dx = gsap.quickSetter(dot, 'x', 'px'), dy = gsap.quickSetter(dot, 'y', 'px');
    const rx = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });
    addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); if (!cur$.classList.contains('on')) cur$.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      cur$.classList.toggle('is-btn', !!t.closest('a, button'));
      cur$.classList.toggle('is-img', !!t.closest('.liq'));
    });
    document.documentElement.style.cursor = 'none';
    $$('a, button').forEach((a) => (a.style.cursor = 'none'));
  } else if (cur$) cur$.remove();

  /* anchor links through Lenis */
  $$('a[href^="#"]:not([data-concept])').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return; const t = $(id); if (!t) return;
    e.preventDefault(); if (lenis) lenis.scrollTo(t, { duration: 1.8 }); else t.scrollIntoView({ behavior: 'smooth' });
  }));
  addEventListener('load', () => ST.refresh());
}
