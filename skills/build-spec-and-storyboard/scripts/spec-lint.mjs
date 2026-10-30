#!/usr/bin/env node
// spec-lint.mjs - checks that a site SPEC.md is complete enough to build from, before any code is written.
// Usage: node spec-lint.mjs path/to/SPEC.md [--json]      (Node 18+, no install)
// Exit 0 = ready for the review gate, 1 = gaps (each printed with what to add).
import fs from 'node:fs';
const file = process.argv[2]; const asJson = process.argv.includes('--json');
if (!file) { console.error('usage: node spec-lint.mjs SPEC.md'); process.exit(1); }
const md = fs.readFileSync(file, 'utf8');
const lines = md.split('\n');
const heads = lines.map((l, i) => ({ i, m: l.match(/^(#{1,4})\s+(.*)$/) })).filter((h) => h.m).map((h) => ({ i: h.i, lvl: h.m[1].length, t: h.m[2].toLowerCase() }));
const sectionText = (re) => { const h = heads.find((x) => re.test(x.t)); if (!h) return null; const next = heads.find((x) => x.i > h.i && x.lvl <= h.lvl); return lines.slice(h.i + 1, next ? next.i : lines.length).join('\n'); };
const tableRows = (txt) => (txt || '').split('\n').filter((l) => /^\|/.test(l.trim()) && !/^\|\s*-/.test(l.trim())).length - 1; // minus header
const problems = []; const add = (ok, msg) => { if (!ok) problems.push(msg); };

// 1. required sections (any heading wording that matches)
const REQ = [
  [/goal|story/, 'Goal / story: what the visitor feels, beat by beat'],
  [/stack|setup/, 'Stack and setup: libraries with versions, folder layout'],
  [/token|design system/, 'Design tokens: scale, colours, type, spacing, motion'],
  [/asset/, 'Assets table: URL | use | licence'],
  [/layout|section/, 'Layout section by section'],
  [/hero|3d|signature/, 'The hero / 3D element in detail'],
  [/scroll|timeline|motion plan/, 'Scroll timeline per section'],
  [/storyboard/, 'Storyboard: 4-8 stills, file names + what each shows'],
  [/qa|checklist/, 'QA checklist'],
  [/review|sign-?off|approval/, 'Review gate: who approves, date, what they saw'],
];
for (const [re, label] of REQ) add(heads.some((h) => re.test(h.t)), 'missing section: ' + label);

// 2. tokens are tables with numbers, not adjectives
const tok = sectionText(/token|design system/) || '';
add(/--u\s*:|scale unit|design px/i.test(tok), 'tokens: define the scale unit for desktop AND phone (e.g. --u: min(100vw/1440, 100svh/900))');
const hexes = [...new Set((tok.match(/#[0-9a-f]{6}\b/gi) || []).map((h) => h.toLowerCase()))];
add(hexes.length >= 3, `tokens: at least 3 colours as hex with a role (found ${hexes.length})`);
add(/weight|wght/i.test(tok) && /tracking|letter-spacing/i.test(tok) && /line[- ]height|leading/i.test(tok), 'tokens: type table needs size, weight, tracking and line-height per style');
add(/cubic-bezier|ease/i.test(tok) && /\d+\s*ms|\d(\.\d+)?\s*s\b/.test(tok), 'tokens: motion needs named easings (cubic-bezier) and durations');
add(/spacing|gap|margin|gutter/i.test(tok), 'tokens: spacing values (page edge, gaps) desktop and phone');

// 3. banned palette: pure black, purple/violet hues, decorative gradients
const isPurple = (h) => { const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 0.12) return false; let hue;
  if (mx === r) hue = 60 * (((g - b) / d) % 6); else if (mx === g) hue = 60 * ((b - r) / d + 2); else hue = 60 * ((r - g) / d + 4); if (hue < 0) hue += 360; return hue >= 255 && hue <= 320; };
const allHex = [...new Set((md.match(/#[0-9a-f]{6}\b/gi) || []).map((h) => h.toLowerCase()))];
add(!allHex.includes('#000000'), 'palette: #000000 found; use a tinted dark ink instead (no black rule)');
const purples = allHex.filter(isPurple); add(!purples.length, 'palette: purple/violet hue found: ' + purples.join(', '));
add(!/linear-gradient|radial-gradient/i.test(tok), 'palette: gradient in tokens; no decorative gradients (a shadow or a light falloff in 3D is fine)');

// 4. assets table: rows with a URL and a licence each
const as = sectionText(/asset/) || '';
const assetRows = as.split('\n').filter((l) => /^\|/.test(l.trim()) && !/^\|\s*-/.test(l.trim())).slice(1);
add(assetRows.length >= 1, 'assets: table has no rows');
for (const r of assetRows) {
  if (!/https?:\/\//.test(r) && !/own|zyqor studio|built in code/i.test(r)) problems.push('assets: row without a source URL: ' + r.trim().slice(0, 80));
  if (!/cc0|cc by|ofl|mit|public domain|unsplash|pexels|own/i.test(r)) problems.push('assets: row without a licence: ' + r.trim().slice(0, 80));
  if (/\bai[- ]generated|midjourney|dall-?e|stable diffusion/i.test(r)) problems.push('assets: AI image in the table: ' + r.trim().slice(0, 80));
}

// 5. layout + timeline per section: every numbered section in layout appears in the timeline
const lay = sectionText(/layout|section by section/) || '';
const secNames = [...lay.matchAll(/^#{3,4}\s+(?:\d+\.?\s*)?(.+)$/gm)].map((m) => m[1].trim()).filter((s) => !/structure|layering/i.test(s));
add(secNames.length >= 3, `layout: describe at least 3 sections with their own sub-heading (found ${secNames.length})`);
add(/desktop/i.test(lay) && /phone|mobile/i.test(lay), 'layout: give positions for desktop AND phone');
add(/z-index|layer/i.test(lay), 'layout: state the layering (what sits above/below the canvas)');
const tl = sectionText(/scroll|timeline/) || '';
add(tableRows(tl) >= 3 || /\d+\s*%/.test(tl), 'timeline: give scroll progress (0-100 %) -> what moves, per section');

// 6. storyboard: 4-8 frames listed
const sb = sectionText(/storyboard/) || '';
const frames = (sb.match(/sb_?\d{2}\.(png|jpg|webp)/gi) || []).length;
add(frames >= 4 && frames <= 8, `storyboard: list 4-8 frame files sb_01.png ... (found ${frames})`);

// 7. copy and honesty
add(!/lorem ipsum/i.test(md), 'copy: lorem ipsum found; write real draft copy');
add(!/\b(trusted by|as seen in|5-star|★★★★★)/i.test(md), 'honesty: fake social proof (logos, reviews, "trusted by") is not allowed');

const res = { file, sections: heads.length, colours: allHex.length, assets: assetRows.length, layout_sections: secNames.length, storyboard_frames: frames, problems };
if (asJson) console.log(JSON.stringify(res, null, 1));
else { console.log(`${file}: ${problems.length ? problems.length + ' gap(s)' : 'READY for the review gate'}`); for (const p of problems) console.log('  - ' + p); }
process.exit(problems.length ? 1 : 0);
