#!/usr/bin/env node
// tools/new-concept.mjs <ID> [--force] [--offline]
// Scaffolds site/library/<n|a|p>/<ID>/ from site/library/_template/ with the catalogue row filled in:
// name, tier, palette (--c1/--c2/--c3), idea, technique, category, and a credits.json pre-filled from the row's
// asset tokens (Poly Haven authors are looked up on the Poly Haven API unless --offline). Then:
//   1. write brief.md (the brief-before-code), 2. build index.html + m.html + app.js, 3. node tools/qa-library.mjs <ID>
//   4. node tools/library-build.mjs  (the concept shows as built once its QA verdict is PASS)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIB = path.join(ROOT, 'site', 'library');
const args = process.argv.slice(2);
const ID = (args.find((a) => !a.startsWith('--')) || '').toUpperCase();
const force = args.includes('--force'), offline = args.includes('--offline');
if (!/^[NAP]\d{3}$/.test(ID)) { console.error('usage: node tools/new-concept.mjs N002 [--force] [--offline]'); process.exit(1); }

const readJSON = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
let row = null;
const plan = readJSON(path.join(ROOT, 'work', 'beast', 'concepts_300.json'));
if (plan) row = (plan.concepts || plan).find((r) => r.id === ID);
if (!row) { const cat = readJSON(path.join(LIB, '_data', 'catalogue.json')); row = cat && cat.concepts[ID] ? { ...cat.concepts[ID], id: ID } : null; }
if (!row) { console.error(`new-concept: ${ID} is not in the catalogue`); process.exit(1); }

const tier = row.tier.toLowerCase(); const letter = { normal: 'n', advanced: 'a', premium: 'p' }[tier];
const dir = path.join(LIB, letter, ID);
if (fs.existsSync(path.join(dir, 'index.html')) && !force) { console.error(`new-concept: ${path.relative(ROOT, dir)} already exists (use --force to overwrite the template files)`); process.exit(1); }
fs.mkdirSync(dir, { recursive: true });

/* credits from the asset tokens */
async function phInfo(slug) {
  if (offline) return null;
  try { const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 6000); const r = await fetch(`https://api.polyhaven.com/info/${slug}`, { signal: ac.signal, headers: { 'User-Agent': 'zyqor-library-scaffold' } }); clearTimeout(t); return r.ok ? r.json() : null; } catch { return null; }
}
const items = [];
for (const tok of row.assets || []) {
  const [kind, slug] = tok.split(':');
  if (kind === 'ph' || kind === 'tex' || kind === 'hdri') {
    const info = await phInfo(slug);
    const what = { ph: '3D model', tex: 'Texture', hdri: 'HDRI' }[kind];
    items.push({ what, title: info?.name || slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), author: info ? Object.keys(info.authors || {}).join(', ') : 'see source page', source: 'Poly Haven', url: `https://polyhaven.com/a/${slug}`, licence: 'CC0 1.0' });
  } else if (kind === 'kh') {
    items.push({ what: '3D model', title: slug, author: 'see metadata.json in the Khronos repo', source: 'Khronos glTF Sample Assets', url: `https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/${slug}`, licence: 'CHECK metadata.json (CC0 or CC-BY 4.0)' });
  } else if (kind === 'un' || kind === 'px') {
    items.push({ what: kind === 'un' ? 'Photo' : 'Video', title: 'TO PICK: ' + (slug || 'subject in asset_source'), author: 'TO FILL', source: kind === 'un' ? 'Unsplash' : 'Pexels', url: '', licence: kind === 'un' ? 'Unsplash Licence' : 'Pexels Licence' });
  } else if (kind === 'data') {
    items.push({ what: 'Data', title: slug, author: 'TO FILL', source: 'TO FILL', url: '', licence: 'TO FILL' });
  }
}
// the kit always loads these, so every concept credits them
items.push({ what: 'HDRI', title: 'Studio Small 09', author: 'Sergej Majboroda', source: 'Poly Haven', url: 'https://polyhaven.com/a/studio_small_09', licence: 'CC0 1.0', note: 'Shared kit lighting (site/assets/hdri).' });
items.push({ what: 'Type', title: 'Cabinet Grotesk, Satoshi', author: 'Indian Type Foundry', source: 'Fontshare', url: 'https://www.fontshare.com', licence: 'ITF Free Font License' });
items.push({ what: 'Type', title: 'JetBrains Mono', author: 'The JetBrains Mono Project Authors', source: 'GitHub', url: 'https://github.com/JetBrains/JetBrainsMono', licence: 'SIL OFL 1.1' });
items.push({ what: 'Engine', title: 'three.js r170, GSAP, Lenis', author: 'their authors', source: 'npm', url: 'https://threejs.org', licence: 'MIT / GSAP Standard Licence' });

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const [c1, c2, c3] = row.palette;
const TIER = { normal: 'Normal', advanced: 'Advanced', premium: 'Premium' }[tier];
const map = { ID, NAME: esc(row.name), TIER: tier, TIER_LOWER: tier, TIER_LABEL: TIER, C1: c1, C2: c2, C3: c3, IDEA: esc(row.idea), TECH: esc(row.technique), CATEGORY: esc((row.category || '').replace(/-/g, ' ')), THREE_D: esc(row.three_d || ''), ASSETS: esc(row.asset_source || '') };
const fill = (s, raw = false) => s.replace(/\{\{(\w+)\}\}/g, (m, k) => (k === 'CREDITS' ? m : (k in map ? (raw ? String(map[k]).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"') : map[k]) : m)));
const TPL = path.join(LIB, '_template');
const wrote = [];
for (const f of fs.readdirSync(TPL)) {
  const src = fs.readFileSync(path.join(TPL, f), 'utf8');
  let out;
  if (f === 'credits.json') out = JSON.stringify({ brand: row.name, id: ID, items }, null, 2) + '\n';
  else if (f.endsWith('.md') || f.endsWith('.js') || f.endsWith('.css')) out = fill(src, true);
  else out = fill(src);
  fs.writeFileSync(path.join(dir, f), out); wrote.push(f);
}
console.log(`scaffolded ${path.relative(ROOT, dir)}/  (${wrote.join(', ')})`);
console.log(`  ${row.name} · ${TIER} · palette ${c1} ${c2} ${c3}`);
console.log(`  next: write brief.md, build it, then: node tools/qa-library.mjs ${ID} && node tools/library-build.mjs`);
