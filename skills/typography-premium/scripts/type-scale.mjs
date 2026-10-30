#!/usr/bin/env node
// type-scale.mjs: fluid type scale for premium sites. Prints clamp() values that hit an exact px size at the phone
// width and at the desktop width, plus line-height and tracking for each step. No dependencies. Node 18+.
//   node type-scale.mjs                                   -> the default scale (Zyqor tokens, 360 -> 1440)
//   node type-scale.mjs --min-vw 360 --max-vw 1600 --base 16:18 --ratio 1.2:1.333 --steps 7
//   node type-scale.mjs --check "clamp(2.75rem, 6.5vw + 1rem, 6.5rem)"   -> px at 360/390/768/1024/1440/1920
//   add --css for custom properties
const args = typeof process !== 'undefined' && process.argv ? process.argv.slice(2) : [];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const r4 = (n) => +n.toFixed(4);
export function fluid(minPx, maxPx, minVw = 360, maxVw = 1440, rootPx = 16) {
  const slope = (maxPx - minPx) / (maxVw - minVw); const intercept = minPx - slope * minVw;
  return `clamp(${r4(minPx / rootPx)}rem, ${r4(intercept / rootPx)}rem + ${r4(slope * 100)}vw, ${r4(maxPx / rootPx)}rem)`;
}
// line-height and tracking by size: big type needs tight leading and negative tracking, small labels need air
export function leading(px, serif = false) { if (px >= 64) return serif ? 1.0 : 0.95; if (px >= 40) return serif ? 1.05 : 1.02; if (px >= 28) return 1.12; if (px >= 20) return 1.3; return 1.6; }
export function tracking(px, mono = false) { if (mono) return '0.12em'; if (px >= 80) return '-0.04em'; if (px >= 56) return '-0.035em'; if (px >= 36) return '-0.025em'; if (px >= 24) return '-0.015em'; if (px < 14) return '0.02em'; return '0em'; }
export function scale({ minVw = 360, maxVw = 1440, base = [16, 18], ratio = [1.2, 1.333], steps = 7 } = {}) {
  const names = ['small', 'body', 'h6', 'h5', 'h4', 'h3', 'h2', 'h1', 'display', 'giant'].slice(0, steps + 1);
  return names.map((name, i) => { const k = i - 1; const mn = base[0] * ratio[0] ** k, mx = base[1] * ratio[1] ** k; return { name, minPx: r4(mn), maxPx: r4(mx), clamp: fluid(mn, mx, minVw, maxVw), leading: leading(mx), tracking: tracking(mx) }; });
}
// evaluate a clamp(a, b + c vw, d) expression at a viewport width (rem = 16px)
export function evalClamp(expr, vw, rootPx = 16) {
  const inner = expr.trim().replace(/^clamp\(/, '').replace(/\)$/, ''); const parts = inner.split(',').map((s) => s.trim());
  const val = (s) => s.split('+').map((t) => t.trim()).reduce((acc, t) => acc + (t.endsWith('rem') ? parseFloat(t) * rootPx : t.endsWith('vw') ? (parseFloat(t) * vw) / 100 : t.endsWith('px') ? parseFloat(t) : 0), 0);
  const [lo, mid, hi] = parts.map(val); return Math.min(Math.max(mid, lo), hi);
}
if (typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
  const chk = opt('check');
  if (chk) { for (const vw of [360, 390, 768, 1024, 1440, 1920]) console.log(String(vw).padStart(5) + 'px wide -> ' + evalClamp(chk, vw).toFixed(1) + 'px'); process.exit(0); }
  const pair = (s, d) => (s ? s.split(':').map(Number) : d);
  const rows = scale({ minVw: +opt('min-vw', 360), maxVw: +opt('max-vw', 1440), base: pair(opt('base'), [16, 18]), ratio: pair(opt('ratio'), [1.2, 1.333]), steps: +opt('steps', 7) });
  if (args.includes('--css')) { console.log(':root{'); for (const r of rows) console.log(`  --fs-${r.name}:${r.clamp}; /* ${r.minPx.toFixed(1)}px -> ${r.maxPx.toFixed(1)}px, lh ${r.leading}, tracking ${r.tracking} */`); console.log('}'); }
  else for (const r of rows) console.log(r.name.padEnd(8), (r.minPx.toFixed(1) + ' -> ' + r.maxPx.toFixed(1) + 'px').padEnd(18), r.clamp.padEnd(46), 'lh ' + r.leading, ' tr ' + r.tracking);
}
