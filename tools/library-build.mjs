#!/usr/bin/env node
// tools/library-build.mjs - (re)generate site/library/library.json, the registry the /library/ index and chrome read.
// Source catalogue: work/beast/concepts_300.json when present (the planning file), otherwise site/library/_data/catalogue.json
// (written by this script, so a fresh clone of the repo can still rebuild statuses). Writes both files. Status per concept, read from disk:
//   planned  - no folder yet
//   building - site/library/<n|a|p>/<ID>/index.html exists, but no passing QA yet
//   built    - folder + qa.json with "verdict":"PASS" written by tools/qa-library.mjs (the quality gate)
// Also writes site/library/_data/nav.json (kit v2): the built concepts only, for the concept pages' previous / next.
// Usage: node tools/library-build.mjs [--src path/to/concepts.json] [--quiet]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIB = path.join(ROOT, 'site', 'library');
const OUT = path.join(LIB, 'library.json');
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const quiet = args.includes('--quiet');
const TIERS = { normal: 'n', advanced: 'a', premium: 'p' };
const TIER_LABEL = { normal: 'Normal', advanced: 'Advanced', premium: 'Premium' };

const STRUCTURES = { '01': 'Precision bento', '02': 'Swiss hairline grid', '03': 'Scroll-driven 3D showcase', '04': 'Editorial maison', '05': 'Horizontal exhibition', '06': 'Live sandbox hero', '07': 'Split-screen sticky narrative', '08': 'Neo-brutalist grid', '09': 'Spatial glass', '10': 'Kinetic type manifesto', '11': 'Draggable canvas', '12': 'Whisper-quiet zen', '13': 'Conversion funnel', '14': 'Multi-scene WebGL portal' };
// technique filter tags, matched against the technique + 3D description
const TAGS = [
  ['Real model', (r) => r.hero_source === 'real' || /\b(cc0|cc-by) model|khronos|poly haven model/i.test(r.asset_source || '')],
  ['Shader', /glsl|shader|raymarch|sdf|fbm|noise|gerstner|kaleidoscope|fluid/i],
  ['Physics', /physics|cannon|matter\.js|rigid|spring|cloth|verlet|projectile|collider/i],
  ['Scroll', /scroll|pinned|parallax|dolly|timeline/i],
  ['Particles', /particle|instanc|starfield|points|confetti/i],
  ['Post FX', /post-?processing|bloom|dof|god-?ray|tilt-shift|crt|chromatic/i],
  ['Glass', /glass|transmission|refraction|backdrop-filter/i],
  ['SVG', /\bsvg\b/i],
  ['CSS', /\bcss\b|clip-path|@property|mask-image|flip layout|keyframes/i],
  ['Canvas 2D', /canvas 2d|canvas\b(?! \()/i],
  ['Video', /video|frame sequence|footage|scrub/i],
  ['Type', /font|typograph|text|split-flap|letter|wordmark|glyph/i],
  ['Audio', /audio|sound|tone/i],
  ['Data', /data|chart|arc tween|gauge|map\b|globe/i],
  ['Lighting', /hdri|lighting|emissive|shadow|sun|time-of-day|god-ray/i],
  ['Drag + touch', /drag|swipe|turntable|tilt|pointer|cursor|hover|orbit/i],
];
const tagsOf = (r) => { const s = `${r.technique || ''} ${r.three_d || ''}`; return TAGS.filter(([, t]) => (typeof t === 'function' ? t(r) : t.test(s))).map(([n]) => n); };
const cap = (s) => String(s || '').replace(/(^|[-\s])([a-z])/g, (m, a, b) => (a === '-' ? ' ' : a) + b.toUpperCase());

function readJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
let rows = null, srcName = '';
const srcArg = arg('--src');
const plan = srcArg ? path.resolve(srcArg) : path.join(ROOT, 'work', 'beast', 'concepts_300.json');
const planJ = readJSON(plan);
if (planJ) { rows = planJ.concepts || planJ; srcName = path.relative(ROOT, plan); }
else {
    const cat = readJSON(path.join(LIB, '_data', 'catalogue.json'));
  if (!cat) { console.error('library-build: site/library/_data/catalogue.json missing'); process.exit(1); }
  rows = Object.entries(cat.concepts).map(([id, r]) => ({ ...r, id })); srcName = 'site/library/_data/catalogue.json';
}

const catalogue = {};
const items = rows.map((r) => {
  const t = (r.tier || '').toLowerCase(); const letter = TIERS[t];
  const rel = `${letter}/${r.id}/`; const dir = path.join(LIB, letter, r.id);
  const hasPage = fs.existsSync(path.join(dir, 'index.html'));
  const qa = readJSON(path.join(dir, 'qa.json'));
  const status = hasPage ? (qa && qa.verdict === 'PASS' ? 'built' : 'building') : 'planned';
  const structure = r.structure ? String(r.structure).padStart(2, '0') : null;
  const it = {
    id: r.id, tier: t, name: r.name, cat: r.category, catLabel: cap(r.category), idea: r.idea, tech: r.technique,
    tags: tagsOf(r), pal: r.palette, pattern: r.pattern || null, structure, structureLabel: structure ? STRUCTURES[structure] || null : null,
    hero: r.hero_source || null, batch: r.batch || null, first25: !!r.first25,
    path: rel, status, thumb: hasPage && fs.existsSync(path.join(dir, 'thumb.webp')),
    qa: qa ? { verdict: qa.verdict, date: qa.date, kb: qa.weightKB || null } : null,
  };
  // the raw planning row goes to _data/catalogue.json so new-concept.mjs can scaffold on a fresh clone (no work/ folder)
  catalogue[r.id] = { tier: r.tier, name: r.name, label: r.label, category: r.category, idea: r.idea, technique: r.technique, asset_source: r.asset_source, assets: r.assets, palette: r.palette, pattern: r.pattern, pattern_name: r.pattern_name, three_d: r.three_d, hero_source: r.hero_source, structure: r.structure || null, batch: r.batch, first25: r.first25 };
  return it;
});

const counts = {}; for (const t of Object.keys(TIERS)) { const xs = items.filter((i) => i.tier === t); counts[t] = { total: xs.length, built: xs.filter((i) => i.status === 'built').length, building: xs.filter((i) => i.status === 'building').length }; }
const tally = (key, labelKey) => { const m = new Map(); items.forEach((i) => { const k = i[key]; if (!k) return; const e = m.get(k) || { key: k, label: i[labelKey] || k, count: 0, built: 0 }; e.count++; if (i.status === 'built') e.built++; m.set(k, e); }); return [...m.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)); };
const techniques = TAGS.map(([n]) => ({ key: n, label: n, count: items.filter((i) => i.tags.includes(n)).length, built: items.filter((i) => i.tags.includes(n) && i.status === 'built').length })).filter((x) => x.count);

const out = { schema: 1, generated: new Date().toISOString(), source: srcName, tiers: TIER_LABEL, counts,
  total: { all: items.length, built: items.filter((i) => i.status === 'built').length },
  categories: tally('cat', 'catLabel'), techniques, structures: STRUCTURES, items };
fs.writeFileSync(OUT, JSON.stringify(out));
fs.mkdirSync(path.join(LIB, '_data'), { recursive: true });
// kit v2: the slim neighbour index the concept chrome reads for previous / next (library.json is ~135 KB and only the
// /library/ index needs it). Built concepts only, in catalogue order: [id, name, path]. A few KB even at 300 built.
const nav = { schema: 1, generated: out.generated, built: items.filter((i) => i.status === 'built').map((i) => [i.id, i.name, i.path]) };
fs.writeFileSync(path.join(LIB, '_data', 'nav.json'), JSON.stringify(nav));
fs.writeFileSync(path.join(LIB, '_data', 'catalogue.json'), JSON.stringify({ schema: 1, generated: out.generated, source: srcName, concepts: catalogue }, null, 1));
if (!quiet) {
  console.log(`library.json: ${items.length} concepts from ${srcName}`);
  for (const [t, c] of Object.entries(counts)) console.log(`  ${TIER_LABEL[t].padEnd(9)} ${String(c.built).padStart(3)} built  ${String(c.building).padStart(3)} building  ${String(c.total).padStart(3)} total`);
  console.log(`  ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB -> ${path.relative(ROOT, OUT)}`);
  console.log(`  ${(fs.statSync(path.join(LIB, '_data', 'nav.json')).size / 1024).toFixed(1)} KB -> site/library/_data/nav.json (prev/next for the concept chrome)`);
}
