#!/usr/bin/env node
// palette-check.mjs: the three-colour rule as a test.
//   node tools/palette-check.mjs --colors "#F7EDD7,#1E264C,#D74A4D"
//   node tools/palette-check.mjs style.css m.css index.html      (scans the files)
// FAILS on: pure or near black, purple/violet hues, purple/blue-pink "AI gradients",
//           ink-on-paper contrast under 4.5:1. WARNS on: more than 3 distinct colours,
//           accent contrast under 3:1 on both paper and ink, wide-hue gradients.
// MIT, Zyqor Studio. Contrast formula: WCAG 2.x relative luminance.
import { readFileSync, existsSync } from 'node:fs';
const a = process.argv.slice(2);
const ci = a.indexOf('--colors');
const allow = (() => { const i = a.indexOf('--allow'); return i < 0 ? [] : a[i + 1].split(',').map(s => s.trim().toLowerCase()); })();
const files = a.filter((x, i) => !x.startsWith('--') && a[i - 1] !== '--colors' && a[i - 1] !== '--allow');

const hex = (h) => { h = h.replace('#', ''); if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map(c => c + c).join(''); return h.slice(0, 6).toLowerCase(); };
const rgb = (h) => [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const [r, g, b] = rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (x, y) => { const [p, q] = [lum(x), lum(y)].sort((m, n) => n - m); return (p + 0.05) / (q + 0.05); };
const hsl = (h) => { const [r, g, b] = rgb(h).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l]; const d = mx - mn; const s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); let H = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [H * 60, s, l]; };
const isPurple = (h) => { const [H, S, L] = hsl(h); return H >= 255 && H <= 315 && S > .25 && L > .08 && L < .92; };
const isBlack = (h) => lum(h) < 0.008 && hsl(h)[1] < 0.35;   // #0f0f0f-ish greys and pure black; coloured darks pass

let colors = [], gradients = [];
if (ci >= 0) colors = a[ci + 1].split(',').map(s => hex(s.trim()));
for (const f of files) {
  if (!existsSync(f)) { console.log('missing file', f); continue; }
  const t = readFileSync(f, 'utf8');
  for (const m of t.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) colors.push(hex(m[0]));
  for (const m of t.matchAll(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/g)) colors.push([m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join(''));
  for (const m of t.matchAll(/(linear|radial|conic)-gradient\(([^;{}]*)\)/g)) gradients.push(m[0]);
}
const distinct = [...new Set(colors)].filter(c => !allow.includes(c) && !allow.includes('#' + c));
let fail = 0, warn = 0;
const F = (m) => { fail++; console.log('FAIL ', m); }, Wn = (m) => { warn++; console.log('WARN ', m); };
for (const c of distinct) {
  if (isBlack(c)) F(`#${c} is (near) black. Use a coloured dark (deep green, navy, oxblood, espresso).`);
  if (isPurple(c)) F(`#${c} is purple/violet (hue ${hsl(c)[0].toFixed(0)}). That reads as "AI colour"; pick another accent.`);
}
// white is not paper
if (distinct.includes('ffffff')) Wn('#ffffff found: use warm paper (#F6F1E7-ish) for backgrounds; pure white only for tiny specular details.');
for (const g of gradients) {
  const hs = [...g.matchAll(/#([0-9a-fA-F]{3,6})\b/g)].map(m => hex(m[0]));
  if (hs.some(isPurple) && hs.length >= 2) F(`AI-style gradient with purple: ${g.slice(0, 90)}`);
  else if (hs.length >= 2) { const H = hs.map(h => hsl(h)[0]); const span = Math.max(...H) - Math.min(...H); if (span > 90 && Math.min(...hs.map(h => hsl(h)[1])) > .3) Wn(`wide-hue gradient (${span.toFixed(0)} deg): ${g.slice(0, 90)}`); }
}
if (distinct.length > 3) Wn(`${distinct.length} distinct colours (${distinct.slice(0, 12).map(c => '#' + c).join(' ')}${distinct.length > 12 ? ' ...' : ''}). The rule is 3: paper, ink, accent. Tints of those (opacity) are fine; list real exceptions with --allow.`);
if (ci >= 0 && colors.length >= 2) {
  const [c1, c2, c3] = colors;
  const k = contrast(c1, c2); (k < 4.5 ? F : (k < 7 ? Wn : (m) => console.log('ok   ', m)))(`ink #${c2} on paper #${c1}: ${k.toFixed(2)}:1 (need 4.5, aim 7+)`);
  if (c3) { const k1 = contrast(c3, c1), k2 = contrast(c3, c2); (Math.max(k1, k2) < 3 ? Wn : (m) => console.log('ok   ', m))(`accent #${c3}: ${k1.toFixed(2)}:1 on paper, ${k2.toFixed(2)}:1 on ink (need 3 on one of them for buttons/large text)`); }
}
console.log(`\n${fail ? 'FAIL' : 'PASS'}  ${fail} fail, ${warn} warn, ${distinct.length} colours checked`);
process.exit(fail ? 1 : 0);
