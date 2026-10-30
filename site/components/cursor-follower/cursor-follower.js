/* cursor-follower.js: Zyqor Components (MIT). No dependencies.
   A dot that tracks the pointer exactly and a ring that follows with a soft lag (lerp 0.16).
   Context: [data-cursor="View"] grows the ring and shows the word; [data-cursor-stick] makes the ring wrap the element;
   [data-cursor-hide] hides it (videos, canvases that draw their own). Only on mouse/trackpad; never on touch.
   Keyboard users are untouched (no focus is moved). Idle frames stop the loop. */
const fine = () => matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

export function cursorFollower(opts = {}) {
  if (!fine()) return null;
  const o = { lerp: reduced() ? 1 : 0.16, hideNative: true, ...opts };
  const root = document.createElement('div'); root.className = 'cf'; root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<div class="cf-ring"><span class="cf-label"></span></div><div class="cf-dot"></div>';
  document.body.append(root);
  if (o.hideNative) document.documentElement.classList.add('cf-native-off');
  const ring = root.querySelector('.cf-ring'), dot = root.querySelector('.cf-dot'), label = root.querySelector('.cf-label');
  const s = { x: -100, y: -100, rx: -100, ry: -100, w: 40, h: 40, tw: 40, th: 40, stick: null, raf: 0, shown: false };
  const frame = () => {
    let tx = s.x, ty = s.y;
    if (s.stick) { const r = s.stick.getBoundingClientRect(); tx = r.left + r.width / 2 + (s.x - (r.left + r.width / 2)) * 0.12; ty = r.top + r.height / 2 + (s.y - (r.top + r.height / 2)) * 0.12; s.tw = r.width + 14; s.th = r.height + 14; }
    s.rx += (tx - s.rx) * o.lerp; s.ry += (ty - s.ry) * o.lerp;
    s.w += (s.tw - s.w) * Math.min(1, o.lerp * 1.4); s.h += (s.th - s.h) * Math.min(1, o.lerp * 1.4);
    ring.style.transform = `translate3d(${(s.rx - s.w / 2).toFixed(1)}px,${(s.ry - s.h / 2).toFixed(1)}px,0)`;
    ring.style.width = s.w.toFixed(1) + 'px'; ring.style.height = s.h.toFixed(1) + 'px';
    dot.style.transform = `translate3d(${s.x - 3}px,${s.y - 3}px,0)`;
    const moving = Math.abs(tx - s.rx) + Math.abs(ty - s.ry) + Math.abs(s.tw - s.w) + Math.abs(s.th - s.h) > 0.3;
    s.raf = moving ? requestAnimationFrame(frame) : 0;
  };
  const kick = () => { if (!s.raf) s.raf = requestAnimationFrame(frame); };
  const setState = (t) => {
    const ctx = t && t.closest && t.closest('[data-cursor],[data-cursor-stick],[data-cursor-hide],a,button,input,textarea,select,label,[role=button]');
    root.classList.remove('is-label', 'is-link', 'is-hidden', 'is-stick'); label.textContent = ''; s.stick = null; s.tw = s.th = 40; root.style.removeProperty('--cf-c');
    if (!ctx) return;
    if (ctx.hasAttribute('data-cursor-hide')) { root.classList.add('is-hidden'); return; }
    if (ctx.dataset.cursorColor) root.style.setProperty('--cf-c', ctx.dataset.cursorColor);
    if (ctx.hasAttribute('data-cursor-stick')) { s.stick = ctx; root.classList.add('is-stick'); return; }
    if (ctx.dataset.cursor) { label.textContent = ctx.dataset.cursor; root.classList.add('is-label'); s.tw = s.th = Math.max(88, ctx.dataset.cursor.length * 11 + 40); return; }
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(ctx.tagName)) { root.classList.add('is-hidden'); return; }
    root.classList.add('is-link'); s.tw = s.th = 60;
  };
  const move = (e) => { if (e.pointerType !== 'mouse') return; s.x = e.clientX; s.y = e.clientY; if (!s.shown) { s.rx = s.x; s.ry = s.y; s.shown = true; root.classList.add('is-on'); } kick(); };
  const over = (e) => { if (e.pointerType === 'mouse') { setState(e.target); kick(); } };
  const down = () => root.classList.add('is-down'), up = () => root.classList.remove('is-down');
  const leaveWin = () => { root.classList.remove('is-on'); s.shown = false; };
  addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerover', over, { passive: true });
  addEventListener('pointerdown', down); addEventListener('pointerup', up);
  document.documentElement.addEventListener('pointerleave', leaveWin);
  addEventListener('scroll', () => { if (s.stick) kick(); }, { passive: true });
  return { el: root, destroy() { removeEventListener('pointermove', move); document.removeEventListener('pointerover', over); root.remove(); document.documentElement.classList.remove('cf-native-off'); } };
}

if (typeof document !== 'undefined' && document.currentScript === null) {
  const init = () => { if (document.querySelector('[data-cursor-auto]') || document.body.hasAttribute('data-cursor-auto')) cursorFollower(); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}
