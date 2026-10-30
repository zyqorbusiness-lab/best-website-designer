#!/usr/bin/env node
// palette.mjs: build or check a 3-colour premium palette (canvas / ink / accent) with OKLCH maths and WCAG 2.x contrast.
// No dependencies. Node 18+.
//   node palette.mjs --seed 170 --mode light            -> palette from one seed hue (0-360), light paper canvas
//   node palette.mjs --seed 170 --mode deep             -> same hue, deep coloured canvas (reads as a colour, never black)
//   node palette.mjs --seed 25 --mode light --accent complement|split|analogous|<hue>
//   node palette.mjs --check "#F3EDE1,#17423C,#8F6420"  -> check an existing palette (order: canvas, ink, accent)
//   add --css to print CSS custom properties, --json for machine output.
// Exit code 1 when a check FAILs (banned colour, contrast below the floor), so it can gate a push.
const args = typeof process !== 'undefined' && process.argv ? process.argv.slice(2) : [];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : d; };

// ---------- colour maths (OKLab by Bjorn Ottosson, public domain formulas) ----------
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
export function hexToRgb(hex) { let h = hex.replace('#', ''); if (h.length === 3) h = [...h].map((x) => x + x).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255); }
export function rgbToHex(rgb) { return '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase(); }
export function rgbToOklch(rgb) {
  const [r, g, b] = rgb.map(toLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B); let H = (Math.atan2(B, A) * 180) / Math.PI; if (H < 0) H += 360;
  return [L, C, H];
}
function oklchToLinear([L, C, H]) {
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
// Gamut-map by lowering chroma until the colour fits sRGB (keeps lightness and hue, which is what the eye notices).
export function oklchToHex([L, C, H]) {
  let c = C; for (let i = 0; i < 60; i++) { const lin = oklchToLinear([L, c, H]); if (lin.every((v) => v >= -1e-4 && v <= 1 + 1e-4)) return rgbToHex(lin.map((v) => toGam(Math.min(1, Math.max(0, v))))); c *= 0.94; }
  return rgbToHex(oklchToLinear([L, 0, H]).map((v) => toGam(Math.min(1, Math.max(0, v)))));
}
export function luminance(hex) { const [r, g, b] = hexToRgb(hex).map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
export function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
export function mix(a, b, t) { const A = hexToRgb(a), Bc = hexToRgb(b); return rgbToHex(A.map((v, i) => v + (Bc[i] - v) * t)); }

// ---------- the rules (Zyqor Studio: no black, no purple, no neon, no pure white canvas) ----------
export function flags(hex, role = '') {
  const [L, C, H] = rgbToOklch(hexToRgb(hex)); const out = [];
  if (L < 0.2 && C < 0.035) out.push('reads as BLACK (OKLCH L<0.20 with almost no chroma): give it a hue, e.g. deep pine/oxblood/ink blue at L 0.26-0.34, C >= 0.04');
  if (C > 0.07 && H >= 275 && H <= 335) out.push('PURPLE/VIOLET hue (' + H.toFixed(0) + ' deg): banned as an "AI-feel" colour');
  if ((C >= 0.17 && L >= 0.84) || C >= 0.27) out.push('NEON (very high chroma ' + C.toFixed(2) + ' at L ' + L.toFixed(2) + ')');
  if (role === 'canvas' && L > 0.985) out.push('PURE WHITE canvas: use warm paper (#F5F2EB, #F4F0EA, #F6F3EC)');
  return out;
}
const pick = (H) => { H = ((H % 360) + 360) % 360; if (H >= 275 && H <= 335) H = H < 305 ? 262 : 345; return H; };

export function build(seed, mode = 'light', accentMode = 'complement') {
  const H = pick(seed);
  let aH = typeof accentMode === 'number' ? accentMode : accentMode === 'analogous' ? H + 35 : accentMode === 'split' ? H + 150 : H + 180;
  aH = pick(aH);
  let canvas, ink, accent;
  if (mode === 'deep') {
    canvas = oklchToHex([0.3, 0.055, H]); ink = oklchToHex([0.95, 0.018, H + 10]); accent = oklchToHex([0.8, 0.105, aH]);
  } else {
    canvas = oklchToHex([0.955, 0.016, 75]); // warm paper (hue 75 = the cream/ivory family), never #FFFFFF
    ink = oklchToHex([0.33, 0.06, H]); accent = oklchToHex([0.55, 0.12, aH]);
  }
  accent = fitAccent(accent, canvas);
  return derive({ canvas, ink, accent }, mode);
}
// Nudge the accent's lightness (same hue, same chroma) until a button label in the canvas colour reads at 4.5:1 on it.
// That also gives >= 3:1 for the accent as a shape on the canvas (WCAG 1.4.11 non-text contrast).
export function fitAccent(accent, canvas) {
  const dark = luminance(canvas) < 0.2; let [aL, aC, aH] = rgbToOklch(hexToRgb(accent));
  for (let i = 0; i < 60 && contrast(accent, canvas) < 4.5; i++) { aL += dark ? 0.01 : -0.01; accent = oklchToHex([aL, aC, aH]); }
  return accent;
}
export function derive({ canvas, ink, accent }, mode) {
  const dark = luminance(canvas) < 0.2;
  // muted text: mix ink toward canvas, stop where it still clears 4.5:1
  let t = 0.45, muted = mix(ink, canvas, t); while (contrast(muted, canvas) < 4.6 && t > 0) { t -= 0.03; muted = mix(ink, canvas, t); }
  const surface = mix(canvas, dark ? '#FFFFFF' : ink, dark ? 0.05 : 0.035);
  const hairline = ink + (dark ? '1F' : '17'); // ~12% / ~9% alpha
  const accentInk = contrast(canvas, accent) >= contrast(ink, accent) ? canvas : ink; // text ON the accent (buttons)
  return { canvas, ink, accent, muted, surface, hairline, accentInk, mode: dark ? 'deep' : 'light' };
}
export function report(p) {
  const rows = [
    ['ink on canvas (body text)', contrast(p.ink, p.canvas), 7, 4.5],
    ['muted on canvas (secondary text)', contrast(p.muted, p.canvas), 4.5, 4.5],
    ['accent on canvas (non-text / large text)', contrast(p.accent, p.canvas), 3, 3],
    ['text on accent (button label)', contrast(p.accentInk, p.accent), 4.5, 4.5],
  ].map(([k, r, goal, floor]) => ({ check: k, ratio: +r.toFixed(2), goal, floor, verdict: r >= goal ? 'PASS' : r >= floor ? 'OK' : 'FAIL' }));
  const banned = [...flags(p.canvas, 'canvas').map((x) => 'canvas ' + p.canvas + ': ' + x), ...flags(p.ink).map((x) => 'ink ' + p.ink + ': ' + x), ...flags(p.accent).map((x) => 'accent ' + p.accent + ': ' + x)];
  return { rows, banned, fail: rows.some((r) => r.verdict === 'FAIL') || banned.length > 0 };
}
export function css(p) {
  return `:root{\n  /* 3 colours, each with one job (60 / 30 / 10, accent ~1-5 % of any screen) */\n  --c-canvas:${p.canvas};   /* 60 %: page background */\n  --c-ink:${p.ink};      /* 30 %: text, rules, dark surfaces */\n  --c-accent:${p.accent};   /* rare: primary CTA, active state, focus ring, ::selection */\n  /* derived tints of the same three (not new hues) */\n  --c-muted:${p.muted};    /* secondary text, >= 4.5:1 on canvas */\n  --c-surface:${p.surface};  /* raised panels */\n  --c-hairline:${p.hairline}; /* 1px borders instead of drop shadows */\n  --c-on-accent:${p.accentInk};\n}\n::selection{background:var(--c-accent);color:var(--c-on-accent)}`;
}

if (typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
  let p;
  const chk = opt('check');
  if (chk && chk !== true) { const [canvas, ink, accent] = chk.split(',').map((s) => s.trim().toUpperCase()); p = derive({ canvas, ink, accent }); }
  else { const seed = Number(opt('seed', 170)); const am = opt('accent', 'complement'); p = build(seed, opt('mode', 'light'), isNaN(Number(am)) ? am : Number(am)); }
  const rep = report(p);
  if (opt('json')) { console.log(JSON.stringify({ palette: p, ...rep }, null, 2)); }
  else {
    console.log('palette  canvas ' + p.canvas + '  ink ' + p.ink + '  accent ' + p.accent + '  (' + p.mode + ')');
    console.log('derived  muted ' + p.muted + '  surface ' + p.surface + '  hairline ' + p.hairline + '  on-accent ' + p.accentInk);
    for (const r of rep.rows) console.log(r.verdict.padEnd(5), r.ratio.toFixed(2).padStart(6) + ':1', ' goal ' + r.goal + ' floor ' + r.floor, ' ' + r.check);
    for (const b of rep.banned) console.log('FAIL  ' + b);
    const lab = rep.rows.find((r) => r.check.startsWith('text on accent'));
    if (lab.verdict === 'FAIL') console.log('FIX   nearest accent that passes, same hue and chroma: ' + fitAccent(p.accent, p.canvas) + ' (or keep the accent for shapes only and set button labels in ink)');
    if (opt('css')) console.log('\n' + css(p));
    console.log(rep.fail ? 'VERDICT FAIL' : 'VERDICT PASS');
  }
  process.exit(rep.fail ? 1 : 0);
}
