/* fx/magnetic.js - an element leans toward a fine pointer (desktop). On touch the same element gets a press scale instead,
   so nothing depends on hover. magnetic(el, { strength: .35, radius: 90 }) */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export function magnetic(el, o = {}) {
  if (!el) return () => {};
  const k = o.strength ?? 0.35, R = o.radius ?? 90;
  el.style.transition = 'transform 480ms cubic-bezier(.16,1,.3,1)';
  if (!fine || reduced) {
    const dn = () => (el.style.transform = 'scale(.97)'), up = () => (el.style.transform = '');
    el.addEventListener('pointerdown', dn); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', up);
    return () => {};
  }
  let raf = 0, tx = 0, ty = 0;
  const move = (e) => {
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy), near = d < Math.max(r.width, r.height) / 2 + R;
    tx = near ? dx * k : 0; ty = near ? dy * k : 0;
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; el.style.transform = `translate3d(${tx}px,${ty}px,0)`; });
  };
  addEventListener('pointermove', move, { passive: true });
  const reset = () => { el.style.transform = ''; };
  el.addEventListener('pointerleave', reset);
  return () => { removeEventListener('pointermove', move); el.removeEventListener('pointerleave', reset); };
}
