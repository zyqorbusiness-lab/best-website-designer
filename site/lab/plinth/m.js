/* Plinth (Concept) - phone build: native scroll, no WebGL, no GSAP. CSS does the motion; this file only toggles classes. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = (s) => [...document.querySelectorAll(s)];
const io = (els, cls, opt) => {
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add(cls)); return; }
  const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(cls); o.unobserve(e.target); } }), opt);
  els.forEach((e) => o.observe(e));
};
io($$('[data-rv]'), 'rv-in', { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
io($$('.clip'), 'in', { threshold: 0.2 });
io($$('.k-row'), 'in', { threshold: 0.6 });
/* gallery counter follows the snapped plate */
const tr = document.querySelector('.g-track'), cur = document.querySelector('.g-cur'), its = $$('.g-it');
let raf = 0;
tr.addEventListener('scroll', () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const c = tr.scrollLeft + tr.clientWidth / 2; let best = 0, bd = 1e9;
    its.forEach((it, i) => { const d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } });
    cur.textContent = String(best + 1).padStart(2, '0');
  });
}, { passive: true });
/* concept CTA */
$$('[data-concept]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  const n = document.querySelector('.i-note'); n.textContent = 'Thanks. This is a concept: Plinth is not a real magazine, so nothing was sent.'; n.classList.add('hi');
}));
