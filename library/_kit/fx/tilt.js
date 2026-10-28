/* fx/tilt.js - 3D card tilt with a specular glare. Fine pointer: follows the cursor. Touch: follows the finger while pressed,
   eases back on release (so the effect exists on phones too). Reduced motion: off.
   tilt(el, { max: 8 })  - add <span class="fx-glare"></span> inside el for the glare (optional). */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export function tilt(el, o = {}) {
  if (!el || reduced) return () => {};
  const max = o.max ?? 8; let raf = 0, rx = 0, ry = 0, gx = 50, gy = 50;
  el.style.transformStyle = 'preserve-3d'; el.style.transition = 'transform 520ms cubic-bezier(.16,1,.3,1)';
  const glare = el.querySelector('.fx-glare');
  const paint = () => { raf = 0; el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`; if (glare) glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.34), transparent 55%)`; };
  const at = (e) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; ry = (x - 0.5) * 2 * max; rx = -(y - 0.5) * 2 * max; gx = x * 100; gy = y * 100; if (!raf) raf = requestAnimationFrame(paint); };
  const out = () => { rx = ry = 0; gx = gy = 50; if (!raf) raf = requestAnimationFrame(paint); };
  let pressed = false;
  el.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || pressed) at(e); });
  el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { pressed = true; at(e); } });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => el.addEventListener(t, () => { pressed = false; out(); }));
  return out;
}
