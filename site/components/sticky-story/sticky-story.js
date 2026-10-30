/* sticky-story.js: Zyqor Components (MIT). No dependencies.
   [data-sticky-story] containing .ss-steps > .ss-step (text) and .ss-media > .ss-frame (one per step).
   The media column stays pinned (CSS position: sticky) while the steps scroll past; the step crossing the
   middle of the screen becomes active, its frame wipes in, and the progress rail fills.
   Rail buttons jump to a step. Works the same on phone (media pinned on top, steps scroll under it). */
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

export function stickyStory(root) {
  const steps = [...root.querySelectorAll('.ss-step')];
  const frames = [...root.querySelectorAll('.ss-frame')];
  const rail = root.querySelector('.ss-rail');
  const fill = root.querySelector('.ss-fill');
  const count = root.querySelector('.ss-count');
  let active = -1;
  if (rail) {
    rail.innerHTML = '';
    steps.forEach((s, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ss-dot';
      b.setAttribute('aria-label', `Step ${i + 1}: ${(s.querySelector('h3') || s).textContent.trim()}`);
      b.textContent = String(i + 1).padStart(2, '0');
      b.addEventListener('click', () => s.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }));
      rail.append(b);
    });
  }
  const dots = rail ? [...rail.children] : [];
  const set = (i) => {
    if (i === active) return; const prev = active; active = i;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    frames.forEach((f, k) => { f.classList.toggle('is-active', k === i); f.classList.toggle('is-past', k < i); f.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    dots.forEach((d, k) => { d.classList.toggle('is-active', k === i); if (k === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
    root.style.setProperty('--ss-dir', i > prev ? 1 : -1);
    if (count) count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
  };
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) set(steps.indexOf(e.target)); });
  }, { rootMargin: '-48% 0px -48% 0px', threshold: 0 });
  steps.forEach((s) => io.observe(s));
  let raf = 0;
  const prog = () => {
    raf = 0; const r = root.querySelector('.ss-steps').getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.5 - r.top) / r.height));
    if (fill) fill.style.transform = `scaleY(${p.toFixed(4)})`;
    root.style.setProperty('--ss-p', p.toFixed(4));
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(prog); }, { passive: true });
  set(0); prog();
  return { set, destroy() { io.disconnect(); } };
}
if (typeof document !== 'undefined') {
  const init = () => document.querySelectorAll('[data-sticky-story]').forEach((el) => { if (!el.__ss) el.__ss = stickyStory(el); });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}
