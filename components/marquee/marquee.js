/* marquee.js: Zyqor Components (MIT). No dependencies.
   [data-marquee] with one child .mq-track holding the items.
   - Seamless loop: the track is cloned until it covers twice the width (clones are aria-hidden, not focusable).
   - Reacts to page scroll: speed jumps with scroll velocity and eases back; data-scroll-flip reverses with scroll direction.
   - Drag (mouse or touch) to scrub it, with inertia on release. Pauses on hover/focus and when off-screen.
   - prefers-reduced-motion: no auto movement; the row becomes a normal horizontal scroller. */
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

export function marquee(root, opts = {}) {
  const o = { speed: +root.dataset.speed || 60, dir: root.dataset.direction === 'right' ? 1 : -1, boost: +root.dataset.boost || 0.9, flip: root.hasAttribute('data-scroll-flip'), ...opts };
  const track = root.querySelector('.mq-track');
  if (reduced()) { root.classList.add('mq--static'); return { destroy() {} }; }
  const base = [...track.children];
  const fill = () => {
    [...track.querySelectorAll('[data-mq-clone]')].forEach((n) => n.remove());
    const one = track.scrollWidth; const need = Math.ceil((root.clientWidth * 2) / Math.max(1, one)) + 1;
    for (let k = 0; k < need; k++) base.forEach((n) => { const c = n.cloneNode(true); c.setAttribute('data-mq-clone', ''); c.setAttribute('aria-hidden', 'true'); c.querySelectorAll('a,button,input,[tabindex]').forEach((f) => f.setAttribute('tabindex', '-1')); track.append(c); });
    return one;
  };
  let unit = fill();
  const st = { x: 0, v: 0, extra: 0, dir: o.dir, last: performance.now(), on: true, hover: false, drag: null, raf: 0 };
  let lastY = scrollY;
  const onScroll = () => { const dy = scrollY - lastY; lastY = scrollY; st.extra = Math.min(900, st.extra + Math.abs(dy) * o.boost * 6); if (o.flip && dy) st.dir = dy > 0 ? o.dir : -o.dir; };
  const frame = (t) => {
    const dt = Math.min(0.05, (t - st.last) / 1000); st.last = t;
    if (st.drag) { /* position set by pointer */ }
    else if (Math.abs(st.v) > 2) { st.x += st.v * dt; st.v *= Math.pow(0.04, dt); }
    else if (!st.hover) { st.x += st.dir * (o.speed + st.extra) * dt; }
    st.extra *= Math.pow(0.08, dt);
    if (st.x <= -unit) st.x += unit; if (st.x > 0) st.x -= unit;
    track.style.transform = `translate3d(${st.x.toFixed(2)}px,0,0)`;
    st.raf = st.on ? requestAnimationFrame(frame) : 0;
  };
  const start = () => { if (!st.raf) { st.on = true; st.last = performance.now(); st.raf = requestAnimationFrame(frame); } };
  const stop = () => { st.on = false; };
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
  io.observe(root);
  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !root.hasAttribute('data-no-pause')) st.hover = true; });
  root.addEventListener('pointerleave', () => { st.hover = false; });
  root.addEventListener('focusin', () => { st.hover = true; });
  root.addEventListener('focusout', () => { st.hover = false; });
  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    st.drag = { x0: e.clientX, sx: st.x, lx: e.clientX, lt: performance.now(), v: 0, moved: false, id: e.pointerId };
    root.classList.add('is-drag');
  });
  addEventListener('pointermove', (e) => {
    const d = st.drag; if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0; if (Math.abs(dx) > 4 && !d.moved) { d.moved = true; try { root.setPointerCapture(e.pointerId); } catch (_) {} }
    if (!d.moved) return;
    st.x = d.sx + dx; const now = performance.now(); d.v = ((e.clientX - d.lx) / Math.max(1, now - d.lt)) * 1000; d.lx = e.clientX; d.lt = now;
  }, { passive: true });
  const end = (e) => { const d = st.drag; if (!d) return; if (d.moved) { st.v = Math.max(-3000, Math.min(3000, d.v)); root.addEventListener('click', (c) => { c.preventDefault(); c.stopPropagation(); }, { capture: true, once: true }); } st.drag = null; root.classList.remove('is-drag'); };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);
  addEventListener('scroll', onScroll, { passive: true });
  let w = innerWidth; addEventListener('resize', () => { if (Math.abs(innerWidth - w) < 2) return; w = innerWidth; unit = fill(); });
  root.classList.add('mq--on');
  return { destroy() { io.disconnect(); stop(); removeEventListener('scroll', onScroll); } };
}

if (typeof document !== 'undefined') {
  const init = () => document.querySelectorAll('[data-marquee]').forEach((el) => { if (!el.__mq) el.__mq = marquee(el); });
  const go = () => (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(init);
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
}
