/* fx/press.js - tactile press feedback for buttons and cards (works the same with mouse, touch and keyboard):
   a soft ripple from the contact point plus a 0.97 press scale. press('.btn, [data-press]') */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export function press(sel = '[data-press]', root = document) {
  root.querySelectorAll(sel).forEach((el) => {
    if (el.dataset.pressOn) return; el.dataset.pressOn = '1';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = el.style.overflow || 'hidden';
    const ripple = (x, y) => {
      if (reduced) return; const r = el.getBoundingClientRect(); const d = Math.hypot(r.width, r.height) * 2; const s = document.createElement('span');
      Object.assign(s.style, { position: 'absolute', left: (x - r.left - d / 2) + 'px', top: (y - r.top - d / 2) + 'px', width: d + 'px', height: d + 'px', borderRadius: '50%', background: 'currentColor', opacity: '.14', transform: 'scale(0)', pointerEvents: 'none', transition: 'transform 520ms cubic-bezier(.16,1,.3,1), opacity 520ms cubic-bezier(.16,1,.3,1)' });
      el.append(s); requestAnimationFrame(() => { s.style.transform = 'scale(1)'; s.style.opacity = '0'; }); setTimeout(() => s.remove(), 600);
    };
    el.addEventListener('pointerdown', (e) => { el.classList.add('is-pressed'); ripple(e.clientX, e.clientY); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => el.addEventListener(t, () => el.classList.remove('is-pressed')));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const r = el.getBoundingClientRect(); ripple(r.left + r.width / 2, r.top + r.height / 2); } });
  });
}
