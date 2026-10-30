/* magnetic-button.js: Zyqor Components (MIT). No dependencies.
   magnetic(el, opts) or auto: every [data-magnetic] on DOMContentLoaded.
   Layers: 1) the button follows the pointer inside an activation radius and springs back,
   2) the label moves at half that (parallax), 3) an accent fill grows from the exact entry point
   and leaves through the exit point, 4) a duplicate label rolls up on hover. Touch gets a press + tap ripple. */
const fine = () => matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

function build(el) {
  if (el.querySelector('.mb-inner')) return;
  const icon = el.querySelector('svg');
  const text = (el.dataset.label || el.textContent).trim();
  [...el.childNodes].forEach((n) => { if (n !== icon) n.remove(); });
  const inner = document.createElement('span'); inner.className = 'mb-inner';
  const label = document.createElement('span'); label.className = 'mb-label';
  const a = document.createElement('span'); a.textContent = text;
  const b = document.createElement('span'); b.textContent = text; b.setAttribute('aria-hidden', 'true');
  label.append(a, b); inner.append(label); if (icon) inner.append(icon);
  const fill = document.createElement('span'); fill.className = 'mb-fill'; fill.setAttribute('aria-hidden', 'true');
  el.prepend(fill); el.append(inner);
}

export function magnetic(el, opts = {}) {
  const o = { strength: +el.dataset.strength || 0.28, label: 0.5, radius: +el.dataset.radius || 80, stiffness: 0.14, damping: 0.72, ...opts };
  build(el);
  const st = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, raf: 0, inZone: false };
  const setFill = (cx, cy) => {
    const r = el.getBoundingClientRect();
    const fx = cx - r.left, fy = cy - r.top;
    const d = 2 * Math.hypot(Math.max(fx, r.width - fx), Math.max(fy, r.height - fy)) + 4;
    el.style.setProperty('--mb-fx', fx + 'px'); el.style.setProperty('--mb-fy', fy + 'px'); el.style.setProperty('--mb-d', d + 'px');
  };
  const tick = () => {
    // spring toward target (semi-implicit Euler): smooth on 60/120 Hz, no overshoot past ~6%
    st.vx = (st.vx + (st.tx - st.x) * o.stiffness) * o.damping;
    st.vy = (st.vy + (st.ty - st.y) * o.stiffness) * o.damping;
    st.x += st.vx; st.y += st.vy;
    el.style.setProperty('--mb-x', st.x.toFixed(2) + 'px'); el.style.setProperty('--mb-y', st.y.toFixed(2) + 'px');
    el.style.setProperty('--mb-lx', (st.x * o.label).toFixed(2) + 'px'); el.style.setProperty('--mb-ly', (st.y * o.label).toFixed(2) + 'px');
    if (Math.abs(st.vx) + Math.abs(st.vy) + Math.abs(st.tx - st.x) + Math.abs(st.ty - st.y) > 0.05) st.raf = requestAnimationFrame(tick);
    else st.raf = 0;
  };
  const kick = () => { if (!st.raf) st.raf = requestAnimationFrame(tick); };
  const onMove = (e) => {
    if (reduced() || !fine()) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = e.clientX - cx, dy = e.clientY - cy;
    const zone = Math.max(r.width, r.height) / 2 + o.radius;
    if (Math.hypot(dx, dy) < zone) { st.inZone = true; st.tx = dx * o.strength; st.ty = dy * o.strength; kick(); }
    else if (st.inZone) { st.inZone = false; st.tx = 0; st.ty = 0; kick(); }
  };
  const enter = (e) => { setFill(e.clientX, e.clientY); el.classList.add('is-in'); };
  const leave = (e) => { setFill(e.clientX, e.clientY); el.classList.remove('is-in', 'is-pressed'); };
  const down = (e) => {
    el.classList.add('is-pressed');
    if (e.pointerType !== 'mouse') { setFill(e.clientX, e.clientY); el.classList.add('is-in'); }
  };
  const up = (e) => {
    el.classList.remove('is-pressed');
    if (e.pointerType !== 'mouse') setTimeout(() => el.classList.remove('is-in'), 380);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') enter(e); });
  el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') leave(e); else el.classList.remove('is-pressed'); });
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('focus', () => { const r = el.getBoundingClientRect(); setFill(r.left + r.width / 2, r.top + r.height / 2); });
  return { destroy() { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(st.raf); } };
}

if (typeof document !== 'undefined') {
  const init = () => document.querySelectorAll('[data-magnetic]').forEach((el) => { if (!el.__mb) el.__mb = magnetic(el); });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}
