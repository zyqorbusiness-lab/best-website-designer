#!/usr/bin/env node
// Zyqor Video Flow: drop a video, get a scroll site.
//   node tools/video-flow/build.mjs <config.json> [--dry] [--force] [--only=d|m] [--pages-only] [--no-registry]
// Needs Node 18+ and ffmpeg/ffprobe on PATH. No npm packages.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { fontFaces, css, pageHTML } from './lib/page.mjs';

const TOOL = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')).map((a) => a.split('=')[0]));
const opt = (k) => { const a = args.find((x) => x.startsWith(k + '=')); return a ? a.split('=')[1] : null; };
const cfgPath = args.find((a) => !a.startsWith('--'));
const DRY = flags.has('--dry'), FORCE = flags.has('--force'), PAGES_ONLY = flags.has('--pages-only');
const ONLY = opt('--only');

const c = { b: (s) => `\x1b[1m${s}\x1b[0m`, g: (s) => `\x1b[32m${s}\x1b[0m`, y: (s) => `\x1b[33m${s}\x1b[0m`, r: (s) => `\x1b[31m${s}\x1b[0m`, d: (s) => `\x1b[2m${s}\x1b[0m` };
const log = (...a) => console.log(...a);
function fail(msg, hint) { console.error(c.r('\nvideo-flow: ' + msg)); if (hint) console.error(c.d(hint)); process.exit(1); }

if (!cfgPath || flags.has('--help')) {
  log(`${c.b('Zyqor Video Flow')}  drop a video, get a scroll site

  node tools/video-flow/build.mjs <config.json> [options]

  --dry          print the plan (probe, frame counts, output paths) and write nothing
  --force        re-encode frames even if nothing changed
  --only=d|m     only (re)build the desktop (d) or phone (m) frame set
  --pages-only   keep the frames, regenerate HTML/CSS/manifest only
  --no-registry  don't touch site/lab/_kit/registry.js

  See tools/video-flow/README.md for the config reference.`);
  process.exit(cfgPath ? 0 : 1);
}
const [maj] = process.versions.node.split('.').map(Number);
if (maj < 18) fail(`Node ${process.versions.node} is too old.`, 'Install Node 18 or newer (https://nodejs.org).');

/* ---------- config ---------- */
const CFG_FILE = path.resolve(cfgPath);
if (!fs.existsSync(CFG_FILE)) fail(`config not found: ${cfgPath}`);
let cfg;
try { cfg = JSON.parse(fs.readFileSync(CFG_FILE, 'utf8')); } catch (e) { fail(`config is not valid JSON (${e.message})`); }
const CFG_DIR = path.dirname(CFG_FILE);
const rel = (p) => path.resolve(CFG_DIR, p);
const SITE = cfg.site ? rel(cfg.site) : path.resolve(TOOL, '../../site');
const problems = [];
const need = (cond, msg) => { if (!cond) problems.push(msg); };
need(/^[a-z0-9][a-z0-9-]{1,40}$/.test(cfg.slug || ''), '"slug" must be lowercase letters, digits or dashes (e.g. "carmine")');
need(cfg.brand, '"brand" is required');
need(cfg.video || cfg.videoUrl, '"video" (a path) or "videoUrl" is required');
const hex = /^#[0-9a-fA-F]{6}$/;
need(cfg.palette && hex.test(cfg.palette.light) && hex.test(cfg.palette.dark) && hex.test(cfg.palette.accent), '"palette" needs light, dark and accent as #RRGGBB');
(cfg.beats || []).forEach((b, i) => {
  need(b.title, `beats[${i}] needs a "title"`);
  need(typeof b.from === 'number' && typeof b.to === 'number' && b.from >= 0 && b.to <= 1 && b.from < b.to, `beats[${i}] needs 0 <= from < to <= 1`);
});
need(fs.existsSync(path.join(SITE, 'lab/_kit/videoflow.js')), `site folder not found or missing lab/_kit/videoflow.js: ${SITE} (set "site" in the config)`);
if (problems.length) fail('config problems:\n  - ' + problems.join('\n  - '));

/* defaults */
const FR = cfg.frames || {};
const DSET = { count: 150, width: 1600, quality: 74, budgetKB: 8000, minQuality: 46, ...(FR.desktop || {}) };
const MSET = { count: 72, crop: 'portrait', width: 760, height: 1040, quality: 62, budgetKB: 2400, minQuality: 40, ...(FR.mobile || {}) };
cfg.scroll = { desktop: 520, mobile: 440, ...(cfg.scroll || {}) };
cfg.focus = cfg.focus || [0.5, 0.5];
cfg.fonts = cfg.fonts || { display: 'system', body: 'system' };

/* ---------- ffmpeg ---------- */
function has(bin) { const r = spawnSync(bin, ['-version'], { encoding: 'utf8' }); return r.status === 0; }
if (!has('ffmpeg') || !has('ffprobe')) fail('ffmpeg/ffprobe not found on PATH.',
  'Install it, then re-run:\n  macOS:   brew install ffmpeg\n  Windows: winget install Gyan.FFmpeg   (or choco install ffmpeg)\n  Linux:   sudo apt install ffmpeg');
const enc = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' }).stdout || '';
if (!/libwebp/.test(enc)) fail('this ffmpeg build has no libwebp encoder.', 'Install a full build (brew/apt/winget ffmpeg packages include it).');
function ff(argv, label, timeoutS = 900) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...argv], { encoding: 'utf8', timeout: timeoutS * 1000, maxBuffer: 64 << 20 });
  if (r.error || r.status !== 0) fail(`ffmpeg failed while ${label}`, (r.stderr || String(r.error || '')).slice(-1500));
  return r;
}

/* ---------- video ---------- */
const WORK = path.join(TOOL, '_work');
fs.mkdirSync(path.join(WORK, 'cache'), { recursive: true });
let VIDEO = cfg.video ? rel(cfg.video) : path.join(WORK, cfg.slug + path.extname(new URL(cfg.videoUrl).pathname || '.mp4') || '.mp4');
if (!fs.existsSync(VIDEO)) {
  if (!cfg.videoUrl) fail(`video not found: ${VIDEO}`);
  if (DRY) log(c.y(`(dry) would download ${cfg.videoUrl} -> ${path.relative(process.cwd(), VIDEO)}`));
  else {
    log(`downloading source video ${c.d(cfg.videoUrl)}`);
    const res = await fetch(cfg.videoUrl, { headers: { 'user-agent': 'Mozilla/5.0 zyqor-video-flow' } });
    if (!res.ok) fail(`download failed: HTTP ${res.status} for ${cfg.videoUrl}`, 'Download it by hand and set "video" to its path.');
    fs.mkdirSync(path.dirname(VIDEO), { recursive: true });
    fs.writeFileSync(VIDEO, Buffer.from(await res.arrayBuffer()));
  }
}
let probe = { duration: 0, width: 0, height: 0 };
if (fs.existsSync(VIDEO)) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', VIDEO], { encoding: 'utf8' });
  if (r.status !== 0) fail(`ffprobe could not read ${VIDEO}`, r.stderr);
  const j = JSON.parse(r.stdout); const s = j.streams && j.streams[0];
  if (!s) fail(`no video stream in ${VIDEO}`);
  probe = { duration: +j.format.duration, width: s.width, height: s.height };
}
const tin = Math.max(0, cfg.trim?.in ?? 0);
const tout = Math.min(probe.duration || Infinity, cfg.trim?.out ?? probe.duration);
if (probe.duration && !(tout > tin + 0.2)) fail(`trim in/out (${tin}s - ${tout}s) is outside the ${probe.duration.toFixed(2)}s video`);
const span = tout - tin;

/* ---------- paths ---------- */
const PAGE = path.join(SITE, 'lab', cfg.slug);
const ASSETS = path.join(SITE, 'assets/lab', cfg.slug);
const srcFor = (k) => `../../assets/lab/${cfg.slug}/${k}/f{i}.webp`;
const vstat = fs.existsSync(VIDEO) ? fs.statSync(VIDEO) : { size: 0, mtimeMs: 0 };

function filterFor(k, S) {
  const fps = (S.count / span).toFixed(5);
  const fx = cfg.focus[0];
  if (k === 'm' && S.crop === 'portrait') {
    // 9:16-ish window around the focus x, then scaled to the phone height (never upscaled past the source)
    const ar = S.aspect || 0.62;
    const h = Math.min(S.height, probe.height || S.height);
    return `fps=${fps},crop='min(iw,ih*${ar})':ih:'(iw-min(iw,ih*${ar}))*${fx}':0,scale=-2:${h}:flags=lanczos`;
  }
  const w = Math.min(S.width, probe.width || S.width);
  return `fps=${fps},scale=${w}:-2:flags=lanczos`;
}
function planSet(k, S) {
  return { k, dir: path.join(ASSETS, k), filter: filterFor(k, S), S,
    key: crypto.createHash('sha1').update(JSON.stringify([vstat.size, Math.round(vstat.mtimeMs), tin, tout, S, cfg.focus, k === 'm' ? cfg.focus : 0])).digest('hex').slice(0, 12) };
}
const sets = [planSet('d', DSET), planSet('m', MSET)];

log(`\n${c.b('Video Flow')} ${c.d('->')} ${c.b(cfg.brand)} (${cfg.slug})`);
log(`  video   ${path.relative(process.cwd(), VIDEO)}  ${probe.width}x${probe.height}, ${probe.duration ? probe.duration.toFixed(2) + 's' : '?'}`);
log(`  trim    ${tin.toFixed(2)}s -> ${tout === Infinity ? 'end' : tout.toFixed(2) + 's'} (${span === Infinity ? '?' : span.toFixed(2) + 's'})`);
for (const s of sets) log(`  ${s.k === 'd' ? 'desktop' : 'phone  '} ${s.S.count} frames, ${s.k === 'm' && s.S.crop === 'portrait' ? 'portrait crop, ' + Math.min(s.S.height, probe.height || 1e9) + 'px tall' : Math.min(s.S.width, probe.width || 1e9) + 'px wide'}, q${s.S.quality}, budget ${s.S.budgetKB} KB -> ${path.relative(process.cwd(), s.dir)}/`);
log(`  page    ${path.relative(process.cwd(), PAGE)}/ (index.html, m.html, style.css, m.css, flow.json, poster.webp, poster-m.webp)`);
log(`  beats   ${(cfg.beats || []).length} copy beats, scroll ${cfg.scroll.desktop}vh desktop / ${cfg.scroll.mobile}vh phone`);
if (DRY) { log(c.y('\n(dry run: nothing written)')); process.exit(0); }

/* ---------- frames ---------- */
const kb = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.webp')).reduce((a, f) => a + fs.statSync(path.join(dir, f)).size, 0) / 1024;
function encodeSet(s) {
  const cacheF = path.join(WORK, 'cache', `${cfg.slug}-${s.k}.json`);
  const cache = fs.existsSync(cacheF) ? JSON.parse(fs.readFileSync(cacheF, 'utf8')) : null;
  const skip = PAGES_ONLY || (ONLY && ONLY !== s.k) || (!FORCE && cache && cache.key === s.key && fs.existsSync(s.dir) && fs.readdirSync(s.dir).filter((f) => f.endsWith('.webp')).length === cache.n);
  if (skip) {
    if (!cache) fail(`no frames for the ${s.k} set yet; run without --pages-only/--only first`);
    log(`  ${s.k}: ${c.d('frames unchanged, kept')} (${cache.n} frames, ${cache.kb} KB, q${cache.q})`);
    return cache;
  }
  let q = s.S.quality, total = 0, n = 0;
  for (let round = 0; round < 6; round++) {
    fs.rmSync(s.dir, { recursive: true, force: true }); fs.mkdirSync(s.dir, { recursive: true });
    const t0 = Date.now();
    ff(['-ss', String(tin), '-to', String(tout), '-i', VIDEO, '-an', '-vf', s.filter, '-c:v', 'libwebp', '-q:v', String(q), '-compression_level', '5', '-preset', 'photo', '-start_number', '1', path.join(s.dir, 'f%04d.webp')], `encoding the ${s.k} frames`);
    n = fs.readdirSync(s.dir).filter((f) => f.endsWith('.webp')).length; total = kb(s.dir);
    log(`  ${s.k}: ${n} frames at q${q} = ${Math.round(total)} KB ${c.d(`(${((Date.now() - t0) / 1000).toFixed(1)}s)`)}`);
    if (total <= s.S.budgetKB || q <= s.S.minQuality) break;
    q = Math.max(s.S.minQuality, q - Math.max(4, Math.ceil((total / s.S.budgetKB - 1) * 30)));
    log(c.y(`     over the ${s.S.budgetKB} KB budget, re-encoding at q${q}`));
  }
  if (total > s.S.budgetKB) log(c.y(`  ${s.k}: still ${Math.round(total)} KB (budget ${s.S.budgetKB}); lower "count" or "width" in the config`));
  const first = path.join(s.dir, 'f0001.webp');
  const dim = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', first], { encoding: 'utf8' }).stdout.trim().split(',').map(Number);
  const out = { key: s.key, n, kb: Math.round(total), q, w: dim[0], h: dim[1] };
  fs.writeFileSync(cacheF, JSON.stringify(out, null, 1));
  return out;
}
const res = {};
for (const s of sets) res[s.k] = encodeSet(s);

/* tiny blurred placeholder (inlined) */
function lqip(k) {
  const tmp = path.join(WORK, `lqip-${cfg.slug}-${k}.webp`);
  ff(['-i', path.join(ASSETS, k, 'f0001.webp'), '-vf', 'scale=32:-2', '-c:v', 'libwebp', '-q:v', '40', tmp], 'making the placeholder');
  const b = fs.readFileSync(tmp).toString('base64'); fs.rmSync(tmp, { force: true });
  return `data:image/webp;base64,${b}`;
}
const info = {
  d: { n: res.d.n, w: res.d.w, h: res.d.h, src: srcFor('d') },
  m: { n: res.m.n, w: res.m.w, h: res.m.h, src: srcFor('m') },
  lqip: { d: lqip('d'), m: lqip('m') },
};

/* ---------- posters for the Lab grid ---------- */
fs.mkdirSync(PAGE, { recursive: true });
const keepPoster = cfg.poster && cfg.poster.keep && fs.existsSync(path.join(PAGE, 'poster.webp'));
if (!keepPoster) {
  const pt = tin + span * (cfg.poster?.at ?? 0.5);
  const fx = cfg.focus[0], fy = cfg.focus[1];
  const cover = (w, h) => `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}:'(iw-${w})*${fx}':'(ih-${h})*${fy}'`;
  ff(['-ss', String(pt), '-i', VIDEO, '-frames:v', '1', '-vf', cover(1200, 750), '-c:v', 'libwebp', '-q:v', '78', path.join(PAGE, 'poster.webp')], 'making poster.webp');
  ff(['-ss', String(pt), '-i', VIDEO, '-frames:v', '1', '-vf', cover(720, 450), '-c:v', 'libwebp', '-q:v', '76', path.join(PAGE, 'poster-m.webp')], 'making poster-m.webp');
} else log(`  posters ${c.d('kept (poster.keep is set)')}`);

/* ---------- pages ---------- */
const KNOWN = JSON.parse(fs.readFileSync(path.join(TOOL, 'lib/fonts.json'), 'utf8'));
for (const r of ['display', 'body']) {
  const f = cfg.fonts[r];
  if (f && f !== 'system' && !fs.existsSync(path.join(SITE, 'assets/font', f + '.woff2'))) fail(`font file not found: site/assets/font/${f}.woff2`, `Available: ${Object.keys(KNOWN).join(', ')} or "system"`);
  if (f && f !== 'system' && !KNOWN[f]) KNOWN[f] = { family: (cfg.fonts[r + 'Family'] || f.split('-')[0]), weight: cfg.fonts[r + 'Weight'] || '100 900' };
}
const ffc = fontFaces(cfg.fonts, KNOWN);
const manifest = { v: 1, generator: 'zyqor-video-flow', slug: cfg.slug, brand: cfg.brand, focus: cfg.focus, frames: { d: info.d, m: info.m }, scroll: cfg.scroll,
  beats: (cfg.beats || []).map((b) => ({ from: b.from, to: b.to })), source: { file: path.basename(VIDEO), trim: [tin, tout] } };
const write = (f, s) => { fs.writeFileSync(path.join(PAGE, f), s); };
write('flow.json', JSON.stringify(manifest, null, 1));
write('style.css', css(cfg, ffc, 'd'));
write('m.css', css(cfg, ffc, 'm'));
write('index.html', pageHTML(cfg, info, 'd'));
write('m.html', pageHTML(cfg, info, 'm'));

/* ---------- registry (idempotent upsert) ---------- */
if (cfg.registry !== false && !flags.has('--no-registry')) {
  const RF = path.join(SITE, 'lab/_kit/registry.js');
  const src = fs.readFileSync(RF, 'utf8');
  const m = src.match(/export const CONCEPTS = (\[[\s\S]*\]);?\s*$/);
  if (!m) log(c.y('  registry.js has an unexpected shape; add the entry by hand'));
  else {
    const list = JSON.parse(m[1]);
    const entry = { slug: cfg.slug, n: cfg.n || String(list.length + 1).padStart(2, '0'), brand: cfg.brand, kind: cfg.kind || '', pattern: cfg.pattern || 'Video flow: scroll-scrubbed real footage', palette: [cfg.palette.light, cfg.palette.dark, cfg.palette.accent] };
    const i = list.findIndex((x) => x.slug === cfg.slug);
    if (i >= 0) list[i] = entry; else list.push(entry);
    fs.writeFileSync(RF, src.slice(0, m.index) + 'export const CONCEPTS = ' + JSON.stringify(list, null, 1) + ';\n');
    log(`  registry ${i >= 0 ? 'updated' : 'added'}: Concept ${entry.n} ${entry.brand}`);
  }
}

const sz = (f) => fs.existsSync(f) ? Math.round(fs.statSync(f).size / 1024) : 0;
log(`\n${c.g('done')}  desktop ${res.d.n} frames ${res.d.kb} KB (${res.d.w}x${res.d.h}) | phone ${res.m.n} frames ${res.m.kb} KB (${res.m.w}x${res.m.h}) | posters ${sz(path.join(PAGE, 'poster.webp'))} + ${sz(path.join(PAGE, 'poster-m.webp'))} KB`);
log(`open   /lab/${cfg.slug}/  and  /lab/${cfg.slug}/m.html  (e.g. npx serve site)\n`);
