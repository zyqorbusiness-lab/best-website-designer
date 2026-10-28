/* fx/morph.js - morph an SVG <path> between shapes that share the same command structure (same number of numbers).
   morph(pathEl, toD, { duration: 520 }) -> Promise. Different structures cross-fade instead (no broken frames). */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nums = (d) => (d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) || []).map(Number);
const ease = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));   // expo-out
export function morph(path, toD, o = {}) {
  const fromD = path.getAttribute('d'); const a = nums(fromD), b = nums(toD);
  const tpl = toD.split(/-?\d*\.?\d+(?:e-?\d+)?/gi);
  if (reduced || a.length !== b.length) {
    if (reduced) { path.setAttribute('d', toD); return Promise.resolve(); }
    return new Promise((res) => { path.style.transition = 'opacity 200ms'; path.style.opacity = 0; setTimeout(() => { path.setAttribute('d', toD); path.style.opacity = 1; res(); }, 200); });
  }
  const dur = o.duration ?? 520, t0 = performance.now();
  return new Promise((res) => {
    const f = (now) => { const t = Math.min(1, (now - t0) / dur), k = ease(t); let s = tpl[0]; for (let i = 0; i < b.length; i++) s += (a[i] + (b[i] - a[i]) * k).toFixed(2) + tpl[i + 1]; path.setAttribute('d', s); if (t < 1) requestAnimationFrame(f); else { path.setAttribute('d', toD); res(); } };
    requestAnimationFrame(f);
  });
}
