#!/usr/bin/env node
// preflight.mjs: the "mistakes Tab made" checks, as one command. Run it on a concept folder
// before QA, before a push and before you send anyone a link.
//
//   node tools/preflight.mjs path/to/concept            (folder with index.html + m.html)
//   node tools/preflight.mjs path/to/concept --root path/to/site   (resolve /absolute asset URLs)
//   node tools/preflight.mjs --text "Here is your link: PLACEHOLDER"   (check a message before sending)
//   node tools/preflight.mjs --tree path/to/staging      (hardlink scan of every file + placeholder scan of shipped html/js/css/json;
//                                                         skips vendor/, _template/ and .md/.mjs docs and dev tools)
//   add --code-ok "why"  when a concept honestly has no fitting real model (the reason is printed in the report)
//
// Checks (each maps to a real mistake, see SKILL.md section 9):
//   M1 placeholder text/links      M2 hardlinked files        M3 credit files + visible CC-BY
//   M4 nav + honest form           M5 phone = PC (same assets, no isM detail cuts)
//   M6 code-made hero geometry     M7 emoji                   M8 "Concept" label
// Exit code 1 on any FAIL. MIT, Zyqor Studio.
import { readFileSync, existsSync, statSync, lstatSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, extname, basename, relative } from 'node:path';

const a = process.argv.slice(2);
const opt = (k) => { const i = a.indexOf('--' + k); return i < 0 ? null : (a[i + 1] ?? true); };
let fail = 0, warn = 0;
const F = (id, m) => { fail++; console.log(`FAIL ${id}  ${m}`); };
const Wn = (id, m) => { warn++; console.log(`WARN ${id}  ${m}`); };
const OK = (id, m) => console.log(`ok   ${id}  ${m}`);

const PH_CASE = /\bPLACEHOLDER\b|\bTODO\b|\bTBD\b|\bFIXME\b|\bXXX+\b|\bINSERT[_ ][A-Z]/;   // upper-case markers (so placeholder=\"\" attributes pass)
const PH_ANY = /lorem ipsum|\bexample\.(com|org)\b|\{\{[^}]*\}\}|<(link|url)>|your[-_ ]link\b/i;
const PLACEHOLDER = { test: (l) => { const x = l.replace(/placeholder="[^"]*"/gi, ''); return PH_CASE.test(x) || PH_ANY.test(x); } };   // example.com inside an input hint is fine
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{1F900}-\u{1F9FF}]/u;
const ASSET_EXT = /\.(glb|gltf|bin|hdr|exr|ktx2|webp|avif|jpe?g|png|mp4|webm|mp3|ogg|woff2?|ttf|otf)$/i;
const CREDIT_FIELDS = ['title', 'author', 'author_url', 'source_url', 'licence', 'licence_url', 'attribution', 'changes', 'downloaded'];

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
function placeholderScan(text, where) {
  const lines = text.split('\n'); let hits = 0;
  lines.forEach((l, i) => { if (PLACEHOLDER.test(l) && !/preflight-ignore/.test(l)) { hits++; if (hits <= 5) F('M1', `${where}:${i + 1} placeholder text: ${l.trim().slice(0, 120)}`); } });
  if (/href=["']#["']/.test(text)) Wn('M1', `${where}: href="#" goes nowhere; link a real section id or remove it`);
  return hits;
}
function hardlinkScan(files) {
  let n = 0;
  for (const f of files) { const st = lstatSync(f); if (st.isFile() && st.nlink > 1) { n++; if (n <= 10) F('M2', `${f} has ${st.nlink} hard links (edit one = edit all; some upload/send steps refuse it). Replace with a real copy: cp --remove-destination "$(readlink -f f)" f, or cp f f.tmp && mv f.tmp f`); } }
  if (!n) OK('M2', `no hardlinked files in ${files.length} files`);
  return n;
}

// ---- message mode
if (opt('text')) {
  const t = String(opt('text'));
  const h = placeholderScan(t, 'message');
  const urls = t.match(/https?:\/\/\S+/g) || [];
  if (/\[link\]|\(link\)|<link>/i.test(t) && !urls.length) F('M1', 'message promises a link but carries no URL');
  if (!h) OK('M1', `message clean (${urls.length} URL${urls.length === 1 ? '' : 's'}: copy them from tool output, never retype)`);
  console.log(`\n${fail ? 'FAIL: do not send' : 'PASS'}`); process.exit(fail ? 1 : 0);
}
// ---- tree mode (push staging)
if (opt('tree')) {
  const root = resolve(String(opt('tree'))); const files = walk(root);
  hardlinkScan(files);
  let ph = 0; for (const f of files) if (/\.(html|htm|js|css|json)$/.test(f) && statSync(f).size < 2e6 && !/[\/\\](vendor|_template|node_modules)[\/\\]/.test(f)) ph += placeholderScan(readFileSync(f, 'utf8'), relative(root, f)) ? 1 : 0;
  if (!ph) OK('M1', 'no placeholder text in shipped html/js/css/json (vendor libraries, the _template folder and docs/dev tools are skipped)');
  console.log(`\n${fail ? 'FAIL' : 'PASS'}  ${fail} fail, ${warn} warn`); process.exit(fail ? 1 : 0);
}

// ---- concept mode
const VALUED = new Set(['--root', '--code-ok', '--text', '--tree']);
const dir = resolve(a.find((x, i) => !x.startsWith('--') && !VALUED.has(a[i - 1])) || '.');
const root = opt('root') ? resolve(String(opt('root'))) : null;
const read = (f) => existsSync(join(dir, f)) ? readFileSync(join(dir, f), 'utf8') : '';
const D = read('index.html'), M = read('m.html');
if (!D || !M) { F('M5', 'need both index.html (desktop) and m.html (phone) in ' + dir); }
const code = readdirSync(dir).filter(f => /\.(js|mjs|css)$/.test(f)).map(f => [f, read(f)]);

// M1 placeholders
let ph = placeholderScan(D, 'index.html') + placeholderScan(M, 'm.html');
for (const [f, t] of code) ph += placeholderScan(t, f);
if (!ph) OK('M1', 'no placeholder text or links');

// asset references
const refsOf = (t) => [...t.matchAll(/["'(]([^"'()\s]+?\.(?:glb|gltf|hdr|exr|ktx2|webp|avif|jpe?g|png|mp4|webm|woff2?))["')?]/gi)].map(m => m[1]).filter(u => !/^https?:|^data:/.test(u));
const resolveRef = (u, from = dir) => u.startsWith('/') ? (root ? join(root, u) : null) : resolve(from, u);
const dRefs = new Set([...refsOf(D)]), mRefs = new Set([...refsOf(M)]);
const sharedRefs = new Set(code.flatMap(([, t]) => refsOf(t)));

// M2 hardlinks (concept folder + every asset it references)
const files = walk(dir);
for (const u of [...dRefs, ...mRefs, ...sharedRefs]) { const p = resolveRef(u); if (p && existsSync(p)) files.push(p); }
hardlinkScan([...new Set(files)]);

// M3 credits
let credFail = 0, ccby = [];
for (const u of new Set([...dRefs, ...mRefs, ...sharedRefs])) {
  const p = resolveRef(u); if (!p || !existsSync(p) || !ASSET_EXT.test(p)) continue;
  if (/\/_kit\/|three|vendor/.test(p)) continue;
  const side = p + '.credit.json', folder = join(dirname(p), 'credit.json');
  const cf = existsSync(side) ? side : existsSync(folder) ? folder : null;
  if (!cf) { credFail++; F('M3', `no credit file for ${u} (need ${basename(p)}.credit.json)`); continue; }
  let j; try { j = JSON.parse(readFileSync(cf, 'utf8')); } catch { credFail++; F('M3', `${cf} is not valid JSON`); continue; }
  const miss = CREDIT_FIELDS.filter(k => !j[k]);
  if (miss.length) { credFail++; F('M3', `${basename(cf)} missing: ${miss.join(', ')}`); }
  if (/CC BY(?!-?NC)/i.test(j.licence || '') && !/CC0/i.test(j.licence)) ccby.push(j);
}
const creditsJson = read('credits.json');
for (const j of ccby) {
  const shown = [D + creditsJson, M + creditsJson].every(t => t.includes(j.title));
  if (!shown) { credFail++; F('M3', `CC-BY asset "${j.title}" by ${j.author} is not credited on both pages / credits.json`); }
}
if (!credFail) OK('M3', `credit files complete, ${ccby.length} CC-BY credited visibly`);

// M4 nav + form
for (const [name, t] of [['index.html', D], ['m.html', M]]) {
  if (!/<nav\b/i.test(t)) F('M4', `${name}: no <nav> (a concept is a production page: nav + sections + form)`);
  if (!/<form\b/i.test(t)) F('M4', `${name}: no <form>`);
  else if (!/not sent/i.test(t + code.map(c => c[1]).join(''))) F('M4', `${name}: the form must answer honestly ("Concept: not sent")`);
  if (/<form[^>]*\baction=["'][^"']+/i.test(t)) F('M4', `${name}: form has an action URL; a concept form must not send anything`);
}
if (/<nav\b/i.test(D) && /<nav\b/i.test(M) && /<form\b/i.test(D) && /<form\b/i.test(M)) OK('M4', 'nav + form on both pages');

// M5 phone = PC
const onlyD = [...dRefs].filter(u => /\.(glb|gltf|hdr|ktx2)$/i.test(u) && !mRefs.has(u));
const onlyM = [...mRefs].filter(u => /\.(glb|gltf|hdr|ktx2)$/i.test(u) && !dRefs.has(u));
if (onlyD.length || onlyM.length) F('M5', `3D files differ: desktop only ${onlyD.join(', ') || '-'}; phone only ${onlyM.join(', ') || '-'}`);
const scriptsD = [...D.matchAll(/<script[^>]+src=["']([^"']+)/g)].map(m => m[1]).sort().join();
const scriptsM = [...M.matchAll(/<script[^>]+src=["']([^"']+)/g)].map(m => m[1]).sort().join();
const smooth = (x) => x.split(',').filter(u => !/gsap|lenis|ScrollTrigger/i.test(u)).join();
if (smooth(scriptsD) !== smooth(scriptsM)) Wn('M5', `pages load different scripts (desktop: ${scriptsD || '-'} / phone: ${scriptsM || '-'})`);
let cuts = 0;
for (const [f, t] of code) t.split('\n').forEach((l, i) => {
  if (/isM\s*\?\s*\d/.test(l) && /(count|segments|shadow|mapSize|stars|rocks|detail|samples|res|lod|instances|particles)/i.test(l)) { cuts++; F('M5', `${f}:${i + 1} phone gets a different amount of detail: ${l.trim().slice(0, 110)}`); }
});
if (!onlyD.length && !onlyM.length && !cuts) OK('M5', 'same 3D files, no isM detail cuts found (pixel ratio / layout differences are fine)');

// M6 code-made hero
const js = code.map(c => c[1]).join('\n');
const loadsModel = /\.(glb|gltf)\b/i.test(js + D + M);
const geo = [...new Set([...js.matchAll(/new THREE\.(\w+Geometry)/g)].map(m => m[1]))].filter(g => !/^(Plane|Buffer|Circle|Ring)Geometry$/.test(g));
if (!loadsModel && !opt('code-ok')) F('M6', `no real model (.glb/.gltf) is loaded; geometry made in code: ${geo.join(', ') || 'none'}. Find a CC0/CC-BY model, or pass --code-ok "reason" and write the search in brief.md`);
else if (!loadsModel) Wn('M6', `code-made hero accepted: ${opt('code-ok')}`);
else if (geo.length) Wn('M6', `code geometry present (${geo.join(', ')}): fine for props/floors/particles, never for the product itself`);
else OK('M6', 'hero is a real model, no code-made solids');

// M7 emoji, M8 label
for (const [n, t] of [['index.html', D], ['m.html', M]]) { if (EMOJI.test(t)) F('M7', `${n}: emoji found; use inline SVG icons`); }
if (!/Concept/.test(D) || !/Concept/.test(M)) F('M8', 'the fictional brand must be labelled "Concept" on both pages');
else OK('M8', 'labelled Concept');

console.log(`\n${fail ? 'FAIL' : 'PASS'}  ${fail} fail, ${warn} warn  (${relative(process.cwd(), dir) || '.'})`);
process.exit(fail ? 1 : 0);
