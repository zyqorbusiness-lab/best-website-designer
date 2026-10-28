#!/usr/bin/env node
// credits-check.mjs — dependency-free credit gate for the Zyqor repo (Sujon's credit rule, Oct 28 2026).
// Walks site/ and skills/, lists every asset file by extension, and FAILs any asset without a valid credit file:
//   <asset>.credit.json next to it (a split file x.glb.part1 uses x.glb.credit.json), or one credit.json in the asset's own
//   folder (a folder holding one asset, e.g. a frame sequence). Valid = all keys present and non-empty, licence on the allow-list.
// It also FAILs a CC BY / CC BY-SA asset whose attribution is not visible on the pages that use it (index.html + m.html of the
// concept/demo folder, or any page that references the file), checked by author-name text match.
// Usage: node tools/credits-check.mjs [--root DIR] [--json out.json] [--allow-flagged] [--quiet]
//   --allow-flagged  treat licences marked "review" (ITF FFL, Mixkit, CC BY-SA, CC BY 3.0 US, own work) as PASS (default: FAIL)
import fs from 'node:fs'; import path from 'node:path';
const args = process.argv.slice(2); const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? (args[i + 1] ?? true) : null; };
const ROOT = path.resolve(opt('--root') || path.join(path.dirname(new URL(import.meta.url).pathname), '..'));
const ALLOW_FLAGGED = args.includes('--allow-flagged'); const QUIET = args.includes('--quiet');
const KEYS = ['title', 'author', 'author_url', 'source_url', 'licence', 'licence_url', 'attribution', 'changes', 'downloaded'];
const EXT = new Set(['.glb', '.gltf', '.bin', '.hdr', '.exr', '.jpg', '.jpeg', '.png', '.webp', '.avif', '.ktx2', '.woff2', '.woff', '.ttf', '.otf', '.mp4', '.webm', '.mov', '.mp3', '.ogg', '.wav', '.m4a', '.svg', '.gif']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'vendor', '_template', '_test']);
// Allow-list (Sujon, Oct 28 2026). Unsplash/Pexels pass only with "verified": true.
const ALLOW = [/^CC0 1\.0$/, /^CC BY 4\.0$/, /^CC BY 3\.0$/, /^SIL OFL 1\.1$/, /^MIT$/, /^Apache 2\.0$/, /^Public domain \((NASA|Smithsonian)\)$/];
const VERIFY_ONLY = [/^Unsplash License$/, /^Pexels License$/];
const REVIEW = [/^ITF Free Font License/, /^Mixkit /, /^CC BY-SA /, /^CC BY 3\.0 US$/, /^All rights reserved \(own work\)$/];
const OWN = /^(Zyqor Studio|Sujon Hoque)/;
const assetKey = (f) => f.replace(/\.part\d+$/i, '');
const isAsset = (f) => EXT.has(path.extname(assetKey(f)).toLowerCase()) && !f.endsWith('.credit.json');
function walk(d, out = []) {
  if (!fs.existsSync(d)) return out;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out); else if (isAsset(e.name)) out.push(p);
  }
  return out;
}
const read = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return undefined; } };
function creditFor(f) {
  const side = assetKey(f) + '.credit.json'; if (fs.existsSync(side)) return side;
  const folder = path.join(path.dirname(f), 'credit.json'); if (fs.existsSync(folder)) {
    const c = read(folder); if (c && Array.isArray(c.files) && !c.files.includes(path.basename(assetKey(f)))) return null; return folder; }
  // gltf companions: x.bin / textures referenced by x.gltf are covered by x.gltf.credit.json
  for (const g of fs.readdirSync(path.dirname(f)).filter((n) => n.endsWith('.gltf'))) {
    const gp = path.join(path.dirname(f), g); if (gp === f) continue;
    try { if (fs.readFileSync(gp, 'utf8').includes(path.basename(f)) && fs.existsSync(gp + '.credit.json')) return gp + '.credit.json'; } catch {}
  }
  return null;
}
function licStatus(c) {
  const l = String(c.licence || '').trim();
  if (ALLOW.some((r) => r.test(l))) return 'ok';
  if (VERIFY_ONLY.some((r) => r.test(l))) return c.verified === true ? 'ok' : 'unverified';
  if (REVIEW.some((r) => r.test(l))) { if (/^All rights reserved/.test(l) && !OWN.test(c.author || '')) return 'bad'; return 'review'; }
  return 'bad';
}
// pages that use an asset: the html/js/css under site/ whose text names the file (basename), plus the folder's own index/m.html
const SITE = path.join(ROOT, 'site'); const pageTexts = new Map();
for (const f of walk2(SITE)) pageTexts.set(f, fs.readFileSync(f, 'utf8'));
function walk2(d, out = []) { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'vendor') continue; const p = path.join(d, e.name); if (e.isDirectory()) walk2(p, out); else if (/\.(html|js|mjs|css|json)$/.test(e.name) && !e.name.endsWith('.credit.json')) out.push(p); } return out; }
const htmlOf = (p) => p.endsWith('.html');
function usingPages(f) {
  const relSite = path.relative(SITE, assetKey(f)).split(path.sep).join('/');      // e.g. assets/lab/cadence/talus-d.glb
  const parts = relSite.split('/'); const tail2 = parts.slice(-2).join('/');        // cadence/talus-d.glb
  const stem = path.basename(relSite).replace(/-(d|m|hd)(?=\.)/, '').replace(/\.[^.]+$/, '');
  const generic = /^(poster|thumb|still|credit|og|favicon|grain)/i.test(stem);
  const hits = new Set();
  for (const [p, t] of pageTexts) {
    if (t.includes(tail2) || (!generic && stem.length >= 8 && /[A-Z]/.test(stem) && t.includes(stem))) hits.add(p);
  }
  const pages = new Set([...hits].filter(htmlOf));
  for (const h of [...hits].filter((p) => !htmlOf(p))) { const b = path.basename(h); const t2 = path.relative(SITE, h).split(path.sep).slice(-2).join('/'); for (const [p, t] of pageTexts) if (htmlOf(p) && ((path.dirname(p) === path.dirname(h) && t.includes(b)) || t.includes(t2))) pages.add(p); }
  return [...pages].filter((p) => !/\/_test\/|\/_template\//.test(p));
}
// CC BY 4.0 s.3(a)(2): attribution may be given via a link to a resource that carries it. A page passes when it shows the
// attribution itself, or links to the concept/demo folder whose own index.html carries it (e.g. a Lab index card -> the demo page).
function conceptDirOf(f) {
  const rel = path.relative(SITE, f).split(path.sep).join('/');
  let m = rel.match(/^lab\/([\w-]+)\//) || rel.match(/^assets\/lab\/([\w-]+)\//); if (m) return 'lab/' + m[1] + '/';
  m = rel.match(/^library\/(n|a|p)\/(\w+)\//); if (m) return 'library/' + m[1] + '/' + m[2] + '/';
  return null;
}
function attributed(page, f, c) {
  if (visibleOn(page, c)) return true;
  const cd = conceptDirOf(f); if (!cd) return false;
  const home = path.join(SITE, cd, 'index.html'); if (!pageTexts.has(home) || !visibleOn(home, c)) return false;
  return (pageTexts.get(page) || '').includes(cd.replace(/^lab\//, '').replace(/\/$/, '')) && path.dirname(page) !== path.join(SITE, cd.slice(0, -1));
}
const norm = (s) => String(s).toLowerCase().replace(/&[a-z]+;|<[^>]+>/g, ' ').replace(/[^a-z0-9\u00c0-\u024f]+/g, ' ');
function visibleOn(page, c) {
  const txt = norm(pageTexts.get(page) || ''); const who = String(c.attribution_name || c.author || '').split(/[;(]/)[0];
  const names = who.split(/,| and /).map((s) => norm(s).trim()).filter((s) => s.length > 2);
  return names.length > 0 && names.some((n) => txt.includes(n)) && /cc by|creative commons|cc-by/.test(txt);
}
const files = [...walk(SITE), ...walk(path.join(ROOT, 'skills'))].sort();
const rows = []; let fail = 0, review = 0, ok = 0;
for (const f of files) {
  const rel = path.relative(ROOT, f); const cp = creditFor(f); const row = { file: rel, credit: cp && path.relative(ROOT, cp), problems: [] };
  if (!cp) row.problems.push('no credit file');
  else { const c = read(cp); if (!c) row.problems.push('credit file is not valid JSON'); else {
    const miss = KEYS.filter((k) => typeof c[k] !== 'string' || !c[k].trim()); if (miss.length) row.problems.push('missing keys: ' + miss.join(', '));
    if (c.downloaded && !/^\d{4}-\d{2}-\d{2}$/.test(c.downloaded)) row.problems.push('downloaded is not YYYY-MM-DD');
    const st = licStatus(c); row.licence = c.licence;
    if (st === 'bad') row.problems.push('licence not on the allow-list: ' + c.licence);
    if (st === 'unverified') row.problems.push(c.licence + ' not verified (author/page not read)');
    if (st === 'review') { row.review = c.licence_flag || ('licence needs review: ' + c.licence); if (!ALLOW_FLAGGED) row.problems.push('licence under review: ' + c.licence); }
    if (/^CC BY/.test(c.licence || '') && rel.startsWith('site/')) {
      const pages = usingPages(f); row.pages = pages.map((p) => path.relative(ROOT, p));
      const missing = pages.filter((p) => !attributed(p, f, c)); if (missing.length) row.problems.push('CC BY attribution not visible on: ' + missing.map((p) => path.relative(ROOT, p)).join(', '));
    } } }
  if (row.problems.length) fail++; else ok++; if (row.review) review++; rows.push(row);
}
const byLic = {}; for (const r of rows) byLic[r.licence || '(none)'] = (byLic[r.licence || '(none)'] || 0) + 1;
const summary = { root: ROOT, assets: rows.length, pass: ok, fail, review_flagged: review, allow_flagged: ALLOW_FLAGGED, by_licence: byLic };
if (!QUIET) for (const r of rows.filter((r) => r.problems.length)) console.log('FAIL ' + r.file + ' — ' + r.problems.join('; '));
const groups = {}; for (const r of rows.filter((r) => r.problems.length)) { const k = r.problems[0].replace(/:.*/, ''); groups[k] = (groups[k] || 0) + 1; }
console.log(JSON.stringify({ ...summary, fail_reasons: groups }, null, 1));
const jo = opt('--json'); if (jo) fs.writeFileSync(jo, JSON.stringify({ summary, rows }, null, 1));
process.exit(fail ? 1 : 0);
