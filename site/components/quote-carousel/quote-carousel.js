/* quote-carousel.js: Zyqor Components (MIT). No dependencies.
   Built on native horizontal scroll + CSS scroll-snap, so a phone swipe feels exactly like the OS.
   JS adds: mouse drag with inertia that lands on a snap point, prev/next buttons, a progress line,
   the active slide state, keyboard arrows, and an optional autoplay with a visible Pause button
   (stops on hover, focus, touch, when off screen, and never runs under reduced motion). */
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

export function quoteCarousel(root, opts = {}) {
  const track = root.querySelector('.qc-track'), slides = [...track.children];
  const prev = root.querySelector('.qc-prev'), next = root.querySelector('.qc-next'), bar = root.querySelector('.qc-bar i'), play = root.querySelector('.qc-play'), count = root.querySelector('.qc-count');
  const o = { autoplay: root.hasAttribute('data-autoplay') ? (+root.dataset.autoplay || 6000) : 0, ...opts };
  let active = 0, timer = 0, playing = !!o.autoplay && !reduced(), hovering = false, visible = true;
  const nearest = () => { const x = track.scrollLeft; let best = 0, d = 1e9; slides.forEach((s, i) => { const dd = Math.abs(s.offsetLeft - track.offsetLeft - x - (parseFloat(getComputedStyle(track).scrollPaddingLeft) ? 0 : 0)); if (dd < d) { d = dd; best = i; } }); return best; };
  const go = (i) => { i = (i + slides.length) % slides.length; track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduced() ? 'auto' : 'smooth' }); };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth; const p = max > 0 ? track.scrollLeft / max : 0;
    if (bar) bar.style.transform = `scaleX(${(0.12 + p * 0.88).toFixed(4)})`;
    const n = nearest(); if (n !== active) { active = n; slides.forEach((s, k) => { s.classList.toggle('is-active', k === n); s.setAttribute('aria-hidden', k === n ? 'false' : 'true'); s.toggleAttribute('inert', false); }); if (count) count.textContent = `${String(n + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`; }
  };
  let raf = 0; track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive: true });
  prev && prev.addEventListener('click', () => { stop(true); go(active - 1); });
  next && next.addEventListener('click', () => { stop(true); go(active + 1); });
  root.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); stop(true); go(active + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); stop(true); go(active - 1); } });
  // mouse drag (touch already scrolls natively)
  let d = null;
  track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; d = { x: e.clientX, s: track.scrollLeft, v: 0, lx: e.clientX, lt: performance.now(), moved: false }; track.classList.add('is-drag'); });
  addEventListener('pointermove', (e) => { if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 3) d.moved = true; track.scrollLeft = d.s - dx; const now = performance.now(); d.v = (e.clientX - d.lx) / Math.max(1, now - d.lt); d.lx = e.clientX; d.lt = now; });
  addEventListener('pointerup', () => {
    if (!d) return; const v = d.v, moved = d.moved; d = null; track.classList.remove('is-drag'); stop(true);
    if (moved) { const target = track.scrollLeft - v * 260; let best = 0, bd = 1e9; slides.forEach((s, i) => { const dd = Math.abs(s.offsetLeft - track.offsetLeft - target); if (dd < bd) { bd = dd; best = i; } }); go(best); track.addEventListener('click', (c) => { c.preventDefault(); c.stopPropagation(); }, { capture: true, once: true }); }
  });
  // autoplay
  const tick = () => { if (playing && !hovering && visible && !document.hidden) go(active + 1); };
  const start = () => { clearInterval(timer); if (playing) timer = setInterval(tick, o.autoplay); };
  const stop = (user) => { if (user && playing) { playing = false; clearInterval(timer); syncPlay(); } };
  const syncPlay = () => { if (!play) return; play.hidden = !o.autoplay || reduced(); play.setAttribute('aria-pressed', playing ? 'false' : 'true'); play.querySelector('span').textContent = playing ? 'Pause' : 'Play'; };
  play && play.addEventListener('click', () => { playing = !playing; syncPlay(); start(); });
  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
  root.addEventListener('pointerleave', () => { hovering = false; });
  root.addEventListener('focusin', () => { hovering = true; }); root.addEventListener('focusout', () => { hovering = false; });
  track.addEventListener('touchstart', () => stop(true), { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);
  slides.forEach((s, i) => { s.setAttribute('role', 'group'); s.setAttribute('aria-roledescription', 'slide'); s.setAttribute('aria-label', `${i + 1} of ${slides.length}`); });
  active = -1; update(); syncPlay(); start();
  return { go };
}
if (typeof document !== 'undefined') {
  const init = () => document.querySelectorAll('[data-quote-carousel]').forEach((el) => quoteCarousel(el));
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}
