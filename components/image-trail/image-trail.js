/* image-trail.js: Zyqor Components (MIT). No dependencies.
   1) imageTrail(area): images appear under the pointer as it travels (every ~90 px), rise in, then fall away.
      On touch, a tap or a drag across the area leaves the same trail.
   2) hoverReveal(list): each row of a list shows its image beside the pointer, leaning with the pointer's speed.
      On touch, tapping a row opens its image inline (the list works as an accordion), so nothing is hover-only.
   Both honour prefers-reduced-motion (no trail; rows show a still image inline instead). */
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine = () => matchMedia('(hover:hover) and (pointer:fine)').matches;

export function imageTrail(area, opts = {}) {
  const srcs = opts.images || JSON.parse(area.dataset.images || '[]');
  const o = { step: +area.dataset.step || 90, life: 900, max: 9, ...opts };
  if (reduced() || !srcs.length) { area.classList.add('it--static'); return null; }
  const pool = srcs.map((s) => { const i = new Image(); i.decoding = 'async'; i.src = s; i.alt = ''; i.className = 'it-img'; i.draggable = false; return i; });
  let k = 0, lx = null, ly = null, z = 1; const live = [];
  const spawn = (x, y, dx = 0, dy = 0) => {
    const tpl = pool[k++ % pool.length]; const el = tpl.cloneNode(); el.setAttribute('aria-hidden', 'true');
    const r = area.getBoundingClientRect();
    el.style.left = (x - r.left) + 'px'; el.style.top = (y - r.top) + 'px'; el.style.zIndex = z++;
    el.style.setProperty('--it-dx', (dx * 0.6).toFixed(1) + 'px'); el.style.setProperty('--it-dy', (dy * 0.6).toFixed(1) + 'px');
    el.style.setProperty('--it-rot', ((Math.random() - 0.5) * 10).toFixed(1) + 'deg');
    area.append(el); live.push(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
    setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 700); }, o.life);
    while (live.length > o.max) { const old = live.shift(); old.classList.add('is-out'); setTimeout(() => old.remove(), 700); }
  };
  const move = (e) => {
    if (lx === null) { lx = e.clientX; ly = e.clientY; return; }
    const dx = e.clientX - lx, dy = e.clientY - ly;
    if (Math.hypot(dx, dy) >= o.step) { spawn(e.clientX, e.clientY, dx, dy); lx = e.clientX; ly = e.clientY; }
  };
  area.addEventListener('pointermove', move, { passive: true });
  area.addEventListener('pointerleave', () => { lx = ly = null; });
  area.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { spawn(e.clientX, e.clientY); lx = e.clientX; ly = e.clientY; } });
  return { spawn };
}

export function hoverReveal(list) {
  const rows = [...list.querySelectorAll('.hr-row')];
  const float = document.createElement('div'); float.className = 'hr-float'; float.setAttribute('aria-hidden', 'true');
  const imgs = rows.map((r) => { const i = new Image(); i.src = r.dataset.img; i.alt = ''; i.decoding = 'async'; float.append(i); return i; });
  list.append(float);
  const s = { x: 0, y: 0, fx: 0, fy: 0, vx: 0, raf: 0, on: false };
  const frame = () => {
    s.fx += (s.x - s.fx) * 0.14; s.fy += (s.y - s.fy) * 0.14; const v = (s.x - s.fx);
    float.style.transform = `translate3d(${s.fx.toFixed(1)}px,${s.fy.toFixed(1)}px,0) rotate(${Math.max(-12, Math.min(12, v * 0.08)).toFixed(2)}deg)`;
    s.raf = (s.on || Math.abs(s.x - s.fx) > 0.5) ? requestAnimationFrame(frame) : 0;
  };
  const show = (i) => { imgs.forEach((im, k) => im.classList.toggle('is-active', k === i)); };
  if (fine() && !reduced()) {
    list.addEventListener('pointermove', (e) => { const r = list.getBoundingClientRect(); s.x = e.clientX - r.left; s.y = e.clientY - r.top; if (!s.raf) s.raf = requestAnimationFrame(frame); }, { passive: true });
    rows.forEach((row, i) => {
      row.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; if (!s.on) { const r = list.getBoundingClientRect(); s.fx = s.x = e.clientX - r.left; s.fy = s.y = e.clientY - r.top; } s.on = true; show(i); float.classList.add('is-on'); list.classList.add('is-hovering'); row.classList.add('is-hover'); });
      row.addEventListener('pointerleave', () => row.classList.remove('is-hover'));
      row.addEventListener('focus', () => { show(i); }, true);
    });
    list.addEventListener('pointerleave', () => { s.on = false; float.classList.remove('is-on'); list.classList.remove('is-hovering'); });
  } else {
    // touch / reduced motion: inline images, one open at a time
    list.classList.add('hr--inline');
    rows.forEach((row) => {
      const btn = row.querySelector('.hr-toggle'); const pane = row.querySelector('.hr-pane');
      if (pane && !pane.querySelector('img')) { const i = new Image(); i.src = row.dataset.img; i.alt = row.dataset.alt || ''; i.loading = 'lazy'; i.decoding = 'async'; pane.append(i); }
      btn && btn.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const open = row.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open);
        rows.forEach((r) => { if (r !== row && r.classList.contains('is-open')) { r.classList.remove('is-open'); r.querySelector('.hr-toggle')?.setAttribute('aria-expanded', 'false'); } });
      });
    });
  }
}
if (typeof document !== 'undefined') {
  const init = () => { document.querySelectorAll('[data-image-trail]').forEach((el) => imageTrail(el)); document.querySelectorAll('[data-hover-reveal]').forEach((el) => hoverReveal(el)); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}
