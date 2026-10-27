/* Whole-page mode switch with a View Transition wipe (Zyqor Lab).
   apply(on) must set the new state synchronously (classes, CSS vars, a fresh 3D frame).
   shapes: 'circle' (grows from the control), 'sweep' (clock-hand sweep around a point),
   'pour' (a liquid edge rising from the bottom), 'close' (the old page closes into a point). */
export function modeSwitch({ apply, reduced = false, shape = 'circle', duration = 1100, origin = null, after = null }) {
  const de = document.documentElement;
  const W = innerWidth, H = innerHeight;
  let x = W / 2, y = H / 2;
  if (origin && origin.getBoundingClientRect) { const r = origin.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  else if (origin && typeof origin.x === 'number') { x = origin.x; y = origin.y; }
  if (reduced || !document.startViewTransition) { apply(); after && after(); return Promise.resolve(); }
  de.classList.add('vt-run', 'vt-' + shape);
  const vt = document.startViewTransition(() => { apply(); });
  const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 8;
  const ease = 'cubic-bezier(.77,0,.18,1)';
  vt.ready.then(() => {
    let kf, pseudo = '::view-transition-new(root)';
    if (shape === 'sweep') {
      kf = []; const N = 48, steps = 36, RR = Math.hypot(W, H) * 1.2;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, th = t * Math.PI * 2, pts = [`${x}px ${y}px`];
        for (let k = 0; k <= N; k++) { const a = -Math.PI / 2 + th * (k / N); pts.push(`${(x + Math.cos(a) * RR).toFixed(1)}px ${(y + Math.sin(a) * RR).toFixed(1)}px`); }
        kf.push({ clipPath: `polygon(${pts.join(',')})`, offset: t });
      }
      return de.animate(kf, { duration, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: pseudo }).finished;
    }
    if (shape === 'pour') {
      kf = []; const N = 28, steps = 30;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, lvl = H * (1.08 - 1.2 * t), amp = 26 * Math.sin(Math.PI * t), pts = [`0px ${H + 40}px`];
        for (let k = 0; k <= N; k++) { const px = (W * k) / N; const py = lvl + Math.sin(k * 0.7 + t * 9) * amp + Math.sin(k * 0.23 - t * 5) * amp * 0.6; pts.push(`${px.toFixed(1)}px ${py.toFixed(1)}px`); }
        pts.push(`${W}px ${H + 40}px`);
        kf.push({ clipPath: `polygon(${pts.join(',')})`, offset: t });
      }
      return de.animate(kf, { duration, easing: 'cubic-bezier(.55,0,.35,1)', pseudoElement: pseudo }).finished;
    }
    if (shape === 'close') {
      pseudo = '::view-transition-old(root)';
      return de.animate({ clipPath: [`circle(${R}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`] }, { duration, easing: 'cubic-bezier(.7,0,.25,1)', pseudoElement: pseudo }).finished;
    }
    return de.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] }, { duration, easing: ease, pseudoElement: pseudo }).finished;
  }).catch(() => {});
  if (after) setTimeout(after, duration * 0.55);
  return vt.finished.finally(() => de.classList.remove('vt-run', 'vt-' + shape));
}
