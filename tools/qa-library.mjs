#!/usr/bin/env node
// tools/qa-library.mjs - batch QA for /library/ concepts (generalised from work/fqa/qa.mjs, local headless Chrome).
//
//   node tools/qa-library.mjs N002 A018            check these concepts
//   node tools/qa-library.mjs --batch 1 --tier normal   every scaffolded concept of batch 1 of a tier
//   node tools/qa-library.mjs --all                every concept folder that exists
//   options: --out DIR (default work/beast/qa/<stamp>)  --poster (re-shoot poster.webp)  --no-thumb  --quick (no reduced pass)
//            --no-nowebgl (skip the two WebGL-off runs)
//            --index  (also QA the /library/ index pages)  --runs d1440,m360 (subset)
//
// Per concept it runs, each in a fresh browser context:
//   d1440  desktop 1440x900 index.html              (must NOT redirect)
//   m390   phone 390x844, touch, iPhone UA, opens index.html  (must redirect to m.html: proves the build switch)
//   m360   phone 360x740 m.html
//   rd1440 / rm390  the same with prefers-reduced-motion: reduce
//   nd1440 / nm390  desktop + phone with WebGL switched off in Chrome (--disable-webgl --disable-3d-apis): the stage must
//                   fall back to its poster (or palette card), no blank canvas, no uncaught errors   (kit v2)
// Kit v2 checks per concept (qa.json): ownKB vs sharedKB (fail only on own over the tier budget: normal 1536, advanced 3072,
// premium 6144 KB), phone = PC (same model/texture/HDRI URLs from window.__stage.info() + the network, and the same
// effects: tone mapping, exposure, shadows, antialias, env, passes, contact shadows; only pixel ratio/size may differ),
// and the credit gate (every asset file used has <asset>.credit.json or its folder's credit.json with all keys; every
// CC-BY asset's title, author and licence visible in the page footer on desktop and phone).
// and records console errors + warnings, page errors, failed requests, HTTP >= 400, horizontal overflow at every scroll
// step (with the offending elements), WebGL state (window.__stage from _kit/stage.js), chrome + credits present,
// a press/tap on the first [data-press] control and a drag across the stage, transfer weight, and whether the phone loaded
// the SAME model/texture/HDRI files as desktop. Screenshots per run go to the out dir; thumb.webp (640 px, from the
// desktop hero) and poster.webp (the stage element, used as the WebGL-off fallback) go into the concept folder,
// plus qa.json with the verdict that tools/library-build.mjs reads (built = PASS).
//
// Box rules baked in: one Chrome at a time box-wide (flock /tmp/beast-chrome.lock, held per concept; QA_LOCK=0 off),
// the static server runs inside this process (nothing left behind), Chrome is closed in finally.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site'); const LIB = path.join(SITE, 'library');
const argv = process.argv.slice(2);
const has = (k) => argv.includes(k); const val = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const OUT = path.resolve(val('--out', path.join(ROOT, 'work', 'beast', 'qa', stamp)));
fs.mkdirSync(OUT, { recursive: true });
const LETTER = { N: 'n', A: 'a', P: 'p' };
const dirOf = (id) => path.join(LIB, LETTER[id[0]], id);

/* which concepts */
let ids = argv.filter((a, i) => /^[NAP]\d{3}$/i.test(a) && !['--out', '--batch', '--tier'].includes(argv[i - 1])).map((s) => s.toUpperCase());
if (has('--all') || has('--batch')) {
  const cat = JSON.parse(fs.readFileSync(path.join(LIB, 'library.json'), 'utf8')).items;
  const b = val('--batch'), t = val('--tier');
  ids = ids.concat(cat.filter((it) => (!b || String(it.batch) === String(b)) && (!t || it.tier === t) && fs.existsSync(path.join(dirOf(it.id), 'index.html'))).map((it) => it.id));
}
ids = [...new Set(ids)];
if (!ids.length && !has('--index')) { console.error('qa-library: no concepts given (ids, --batch N, --all or --index)'); process.exit(1); }

/* playwright-core + Chrome */
let chromium;
try { ({ chromium } = await import('playwright-core')); } catch { ({ chromium } = await import('/home/user/node_modules/playwright-core/index.mjs')); }
const EXE = process.env.QA_CHROME || ['/home/user/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'].find((p) => fs.existsSync(p));
import { createRequire } from 'node:module';
let sharp = null;   // for thumb.webp + poster.webp; found in the repo, work/ or the home node_modules
for (const base of [ROOT, path.join(ROOT, 'work'), process.env.HOME || '/home/user']) { try { sharp = createRequire(path.join(base, 'noop.js'))('sharp'); break; } catch {} }
if (!sharp) console.log('  note: sharp is not installed, so thumb.webp / poster.webp are skipped (npm i sharp)');

/* static server for site/ inside this process */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.ktx2': 'image/ktx2', '.bin': 'application/octet-stream', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(SITE, p); if (!f.startsWith(SITE)) { res.writeHead(403); return res.end(); }
  try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch {}
  fs.readFile(f, (e, buf) => { if (e) { res.writeHead(404); return res.end('404'); } res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Content-Length': buf.length, 'Cache-Control': 'no-store' }); res.end(buf); });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

/* one Chrome at a time on this shared box */
async function waitForChrome() {
  const max = +(process.env.QA_WAIT || 90) * 1000, t0 = Date.now();
  for (;;) {
    let n = 0; try { n = +execSync(`pgrep -fc "chrome-headless-shell --disable-field-trial" || true`).toString().trim() || 0; } catch {}
    if (!n) return 0; if (Date.now() - t0 > max) { console.log(`  note: ${n} other headless Chrome still running after ${max / 1000}s, starting anyway`); return n; }
    if ((Date.now() - t0) % 30000 < 5000) console.log(`  waiting for another headless Chrome to finish (${n} running)`);
    await new Promise((r) => setTimeout(r, 5000));
  }
}


/* box-wide Chrome lock (coordinator rule, Oct 28): every Chrome on this box runs inside flock /tmp/beast-chrome.lock,
   so only one software-WebGL Chrome runs at a time. Held per concept (short), released after Chrome closes.
   QA_LOCK=/path overrides the lock file, QA_LOCK=0 disables it (e.g. on your own laptop). */
import { spawn } from 'node:child_process';
const LOCK = process.env.QA_LOCK === '0' ? null : (process.env.QA_LOCK || '/tmp/beast-chrome.lock');
let lockChild = null;
async function lockAcquire(label) {
  if (!LOCK) return;
  try { execSync('command -v flock', { stdio: 'ignore' }); } catch { await waitForChrome(); return; }
  const t0 = Date.now();
  lockChild = spawn('flock', ['-w', String(process.env.QA_LOCK_WAIT || 1200), LOCK, '-c', 'echo LOCKED; exec cat >/dev/null'], { stdio: ['pipe', 'pipe', 'ignore'] });
  const ok = await new Promise((res) => { let got = false; lockChild.stdout.on('data', (b) => { if (!got && /LOCKED/.test(b)) { got = true; res(true); } }); lockChild.on('exit', () => { if (!got) res(false); }); });
  if (!ok) { lockChild = null; throw new Error(`could not get ${LOCK} within ${process.env.QA_LOCK_WAIT || 1200}s`); }
  const w = (Date.now() - t0) / 1000; if (w > 2) console.log(`  ${label}: waited ${w.toFixed(0)}s for the Chrome lock`);
}
function lockRelease() { if (lockChild) { try { lockChild.stdin.end(); } catch {} lockChild = null; } }
process.on('exit', lockRelease);
const launch = (nogl) => chromium.launch({ executablePath: EXE, args: nogl ? ['--disable-webgl', '--disable-3d-apis'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

// with WebGL off the stage never fetches the hero model, so Chrome warns that the <link rel=preload> went unused: expected there
const NOISE_NOGL = [/was preloaded using link preload but not used/i];
const NOISE = [/GPU stall due to ReadPixels/i, /Automatic fallback to software WebGL/i, /WebGL: too many errors/i, /swiftshader/i, /GroupMarkerNotSet/i];
const RUNS = [
  { key: 'd1440', w: 1440, h: 900, mobile: false, page: 'index.html', expect: 'index.html' },
  { key: 'm390', w: 390, h: 844, mobile: true, page: 'index.html', expect: 'm.html' },
  { key: 'm360', w: 360, h: 740, mobile: true, page: 'm.html', expect: 'm.html' },
  { key: 'rd1440', w: 1440, h: 900, mobile: false, page: 'index.html', expect: 'index.html', reduced: true },
  { key: 'rm390', w: 390, h: 844, mobile: true, page: 'm.html', expect: 'm.html', reduced: true },
  // kit v2: WebGL switched off in Chrome (--disable-webgl --disable-3d-apis): the poster must show, no blank canvas, no uncaught errors
  { key: 'nd1440', w: 1440, h: 900, mobile: false, page: 'index.html', expect: 'index.html', nogl: true },
  { key: 'nm390', w: 390, h: 844, mobile: true, page: 'm.html', expect: 'm.html', nogl: true },
].filter((r) => !(has('--quick') && r.reduced)).filter((r) => !(has('--no-nowebgl') && r.nogl)).filter((r) => !val('--runs') || val('--runs').split(',').includes(r.key));
const UA_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* kit v2: weight = the concept's OWN files vs the SHARED runtime (cached across concepts). Coordinator rule: fail only on
   ownKB over the tier budget. Shared = three.js + addons (/vendor/), the kit (/library/_kit/, incl. its fonts), the shared
   HDRI and glass (/assets/hdri/, /assets/glass/), the slim nav index (/library/_data/) and the favicon. Everything else the
   page downloads (its folder, /library/_assets/ models + textures, any external file) is OWN. */
const BUDGET_KB = { normal: 1536, advanced: 3072, premium: 6144 };
const SHARED_RE = /^\/(vendor\/|library\/_kit\/|assets\/hdri\/|assets\/glass\/|assets\/color\/grain\.webp|library\/_data\/|library\/library\.json|favicon)/;
const ASSET_RE = /\.(glb|gltf|bin|hdr|exr|ktx2|basis|webp|jpe?g|png|avif|gif|svg|woff2?|ttf|otf|mp4|webm|mov|m4v|mp3|ogg|oga|wav|m4a|aac|json)$/i;
const CREDIT_KEYS = ['title', 'author', 'author_url', 'source_url', 'licence', 'licence_url', 'attribution', 'changes', 'downloaded'];
const isCCBY = (l) => /\bCC[\s-]?BY\b/i.test(l || '') && !/\bCC0\b/i.test(l || '');
const norm = (s) => String(s || '').toLowerCase().replace(/[\u2018\u2019\u201c\u201d"']/g, '').replace(/\s+/g, ' ').trim();


async function overflowProbe(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth, sw = document.scrollingElement.scrollWidth;
    if (sw <= vw + 1) return null;
    const sel = (e) => { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; else if (e.classList.length) s += '.' + [...e.classList].slice(0, 2).join('.'); return s; };
    const off = [];
    for (const e of document.querySelectorAll('body *')) {
      const r = e.getBoundingClientRect(); if (!r.width) continue;
      if (r.right > vw + 1 || r.left < -1) { let p = e.parentElement, clipped = false; while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') { clipped = true; break; } p = p.parentElement; } if (!clipped) off.push(`${sel(e)} [${Math.round(r.left)}..${Math.round(r.right)}]`); }
      if (off.length >= 6) break;
    }
    return { scrollWidth: sw, viewport: vw, y: Math.round(scrollY), offenders: off };
  });
}

async function runOne(browser, id, run, R) {
  const dir = path.join(LETTER[id[0]], id);
  const tStart = Date.now();
  const ctx = await browser.newContext({ viewport: { width: run.w, height: run.h }, deviceScaleFactor: run.mobile ? 2 : 1, isMobile: run.mobile, hasTouch: run.mobile, userAgent: run.mobile ? UA_IPHONE : undefined, reducedMotion: run.reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const r = R.runs[run.key] = { errors: [], warnings: [], noise: [], failed: [], http: [], overflow: [], notes: [], bytes: 0, ownBytes: 0, sharedBytes: 0, files: [], assets: [], nogl: !!run.nogl };
  page.on('console', (m) => { const t = m.type(), x = m.text().slice(0, 300); if (t !== 'error' && t !== 'warning') return; if (NOISE.some((n) => n.test(x)) || (run.nogl && NOISE_NOGL.some((n) => n.test(x)))) r.noise.push(x); else (t === 'error' ? r.errors : r.warnings).push(x); });
  page.on('pageerror', (e) => r.errors.push('pageerror: ' + e.message.slice(0, 300)));
  let closing = false;
  page.on('requestfailed', (q) => { const u = q.url(); if (closing && /ERR_ABORTED/.test(q.failure()?.errorText || '')) return; if (!/favicon/.test(u)) r.failed.push({ url: u.replace(BASE, ''), err: q.failure()?.errorText || '', t: Date.now() - tStart, navs: r.navs ? r.navs.length : 0 }); });
  const finished = new Set(); page.on('requestfinished', (q) => finished.add(q.url().replace(BASE, '')));
  const asked = new Map(); page.on('request', (q) => { const u = q.url().replace(BASE, ''); asked.set(u, (asked.get(u) || 0) + 1); });
  page.on('response', async (s) => { const u = s.url().replace(BASE, ''); if (s.status() >= 400) r.http.push(s.status() + ' ' + u); const len = +(s.headers()['content-length'] || 0); r.bytes += len; if (s.status() < 400 && !/^(blob|data):/.test(u)) { const p = u.split('?')[0]; if (SHARED_RE.test(p)) r.sharedBytes += len; else r.ownBytes += len; r.files.push({ u: p, len, ext: !u.startsWith('/') }); } if (/\.(glb|gltf|ktx2|hdr|webp|jpg|png|mp4|bin)$/i.test(u) && /_assets|assets\//.test(u)) r.assets.push(u.replace(/^.*?(\/(library\/)?_?assets\/)/, '$1')); });
  page.on('request', (q) => { if (process.env.QA_DEBUG && /\.hdr|\.glb/.test(q.url())) r.notes.push(`req t+${Date.now() - tStart} ${q.url().replace(BASE, '')}`); });
  page.on('requestfinished', (q) => { if (process.env.QA_DEBUG && /\.hdr|\.glb/.test(q.url())) r.notes.push(`done t+${Date.now() - tStart} ${q.url().replace(BASE, '')}`); });
  r.navs = []; page.on('framenavigated', (f) => { if (f !== page.mainFrame()) return; const u = f.url().replace(BASE, ''), prev = r.navs[r.navs.length - 1]; r.navs.push(u);
    // a new document (the m390 redirect) restarts the weight count; a same-document hash/pushState navigation does not
    if (prev !== undefined && prev.split(/[?#]/)[0] !== u.split(/[?#]/)[0]) { r.bytes = 0; r.ownBytes = 0; r.sharedBytes = 0; r.files = []; } });
  const url = `${BASE}/library/${dir}/${run.page}`;
  try { await page.goto(url, { waitUntil: 'load', timeout: 60000 }); } catch (e) { r.errors.push('goto: ' + e.message.slice(0, 160)); }
  // wait for the stage (WebGL ok or fallback) or 15 s
  const t0 = Date.now(); let st = null;
  while (Date.now() - t0 < 15000) { st = await page.evaluate(() => ({ s: window.__stage || null, hasStage: !!document.querySelector('[data-stage]'), ready: !document.querySelector('[data-stage].is-loading') })).catch(() => null); if (st && (!st.hasStage || (st.s && st.ready) || (st.s && st.s.ok === false))) break; await sleep(400); }
  await sleep(run.reduced ? 1200 : 2600);
  r.finalUrl = page.url().replace(BASE, '');
  r.redirectOK = r.finalUrl.split('?')[0].endsWith(run.expect) || (run.expect === 'index.html' && r.finalUrl.split('?')[0].endsWith('/'));
  if (!r.redirectOK) r.notes.push(`expected ${run.expect}, landed on ${r.finalUrl}`);
  r.stage = st && st.s; r.hasStage = !!(st && st.hasStage);
  r.page = await page.evaluate(() => ({ build: document.documentElement.dataset.build || 'd', h1: !!document.querySelector('h1'), chrome: !!document.querySelector('.zk-bar'), credits: document.querySelectorAll('.zk-sheet .zk-cred li').length, title: document.title, scrollH: document.documentElement.scrollHeight })).catch(() => ({}));
  const shot = (n) => page.screenshot({ path: path.join(OUT, id, `${run.key}_${n}.jpg`), type: 'jpeg', quality: 80 }).catch((e) => r.notes.push('shot ' + e.message.slice(0, 80)));
  fs.mkdirSync(path.join(OUT, id), { recursive: true });
  await shot('hero');
  const o0 = await overflowProbe(page).catch(() => null); if (o0) r.overflow.push(o0);
  // thumb + poster from the first desktop run
  if (run.key === 'd1440' && !has('--no-thumb') && sharp) {
    try { const buf = await page.screenshot({ type: 'png' }); await sharp(buf).resize(640).webp({ quality: 78 }).toFile(path.join(dirOf(id), 'thumb.webp')); r.notes.push('thumb.webp written'); } catch (e) { r.notes.push('thumb failed ' + e.message.slice(0, 80)); }
    const posterPath = path.join(dirOf(id), 'poster.webp');
    if ((has('--poster') || !fs.existsSync(posterPath)) && r.stage && r.stage.ok) {
      try { const el = await page.$('[data-stage]'); const buf = await el.screenshot({ type: 'png' }); await sharp(buf).resize({ width: 1440, withoutEnlargement: true }).webp({ quality: 80 }).toFile(posterPath); r.notes.push('poster.webp written'); } catch (e) { r.notes.push('poster failed ' + e.message.slice(0, 80)); }
    }
  }
  // interaction smoke test: press the first control, drag across the stage
  try {
    const btn = await page.$('[data-press]');
    if (btn && await btn.isVisible()) { if (run.mobile) await btn.tap(); else await btn.click(); await sleep(500); r.notes.push('pressed first [data-press]'); }
    const stg = await page.$('[data-stage]');
    if (stg && !run.mobile) { const b = await stg.boundingBox(); if (b && b.height > 50) { const y = b.y + Math.min(b.height / 2, run.h / 2); await page.mouse.move(b.x + b.width * 0.4, y); await page.mouse.down(); await page.mouse.move(b.x + b.width * 0.62, y, { steps: 8 }); await page.mouse.up(); await sleep(400); r.notes.push('dragged stage'); } }
  } catch (e) { r.notes.push('interaction: ' + e.message.slice(0, 100)); }
  // scroll pass (overflow at every step; lazy content gets a chance to load)
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight).catch(() => 0);
  const steps = Math.min(14, Math.max(2, Math.ceil(H / (run.h * 0.8))));
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * i / steps)).catch(() => {});
    await sleep(run.reduced ? 250 : 650);
    const o = await overflowProbe(page).catch(() => null); if (o) r.overflow.push(o);
    if (i === Math.ceil(steps / 2)) await shot('mid');
  }
  await shot('end');
  // kit v2: what the stage reports about itself (renderer settings + every model/texture/HDRI it loaded), the visible
  // credits text (CC-BY attribution check) and, with WebGL off, whether the poster really shows instead of a blank canvas
  r.info = await page.evaluate(() => (window.__stage && typeof window.__stage.info === 'function' ? window.__stage.info() : null)).catch(() => null);
  r.foot = await page.evaluate(() => { const f = document.querySelector('.zk-foot'); if (!f) return null; return { text: f.innerText, links: [...f.querySelectorAll('a[href]')].map((a) => a.href) }; }).catch(() => null);
  r.fallback = await page.evaluate(() => {
    const st = document.querySelector('[data-stage]'); if (!st) return null;
    const vis = (e) => { if (!e) return false; const b = e.getBoundingClientRect(), cs = getComputedStyle(e); return b.width > 20 && b.height > 20 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
    const img = st.querySelector('img.poster'), card = st.querySelector('.stage-fallback-card');
    const canv = [...st.querySelectorAll('canvas')].filter(vis);
    return { cls: st.className, poster: !!img, posterLoaded: !!(img && img.complete && img.naturalWidth > 0), posterVisible: vis(img), card: vis(card), canvases: canv.length };
  }).catch(() => null);
  closing = true;
  await page.close().catch(() => {}); await ctx.close().catch(() => {});
  r.assets = [...new Set(r.assets)].sort();
  // an ERR_ABORTED request that the page made again (the kit retries the HDRI once) or one cancelled by the m390 redirect is not a failure
  // An ERR_ABORTED is not a failure when (a) the page requested the URL again and it finished, (b) it was cancelled by the
  // m390 redirect, or (c, kit v2) it is the HDRI and the stage reports that HDRI applied with exactly the file's byte count
  // (Chrome sometimes logs a fetch as cancelled at the moment its last byte arrives; see work/beast/kit/NOTES_v2.md).
  const delivered = (u) => { const h = r.info && r.info.hdri; if (!h || h.state !== 'ready' || !h.url) return false; const p = h.url.replace(BASE, '').split('?')[0]; if (p !== u.split('?')[0]) return false; try { return fs.statSync(path.join(SITE, decodeURIComponent(p))).size === h.bytes; } catch { return false; } };
  r.failed = r.failed.filter((f) => { if (!/ERR_ABORTED/.test(f.err)) return true; if (finished.has(f.url) || (asked.get(f.url) || 0) > 1 || f.navs < r.navs.length) { r.notes.push(`ignored ${f.err} ${f.url}: requested again or cancelled by the redirect`); return false; } if (delivered(f.url)) { r.notes.push(`ignored ${f.err} ${f.url}: the stage applied the HDRI with all ${r.info.hdri.bytes} bytes`); return false; } return true; }).map((f) => `${f.err} ${f.url} (t+${f.t}ms)`);
  if (run.nogl) {
    // WebGL off: the stage must fall back (ok === false) and show its poster (or the palette card), with no blank canvas
    const fb = r.fallback;
    r.noglOK = !r.hasStage || !!(r.stage && r.stage.ok === false && fb && (fb.posterVisible && fb.posterLoaded || fb.card) && !fb.canvases);
    if (r.hasStage && !r.noglOK) r.notes.push('no-WebGL: ' + JSON.stringify({ stage: r.stage, fallback: fb }));
    r.pass = !r.errors.length && !r.warnings.length && !r.failed.length && !r.http.length && !r.overflow.length && r.redirectOK && r.page.chrome && r.page.h1 && r.noglOK;
  } else r.pass = !r.errors.length && !r.warnings.length && !r.failed.length && !r.http.length && !r.overflow.length && r.redirectOK && r.page.chrome && r.page.h1 && (!r.hasStage || (r.stage && r.stage.ok));
  return r;
}

const results = { date: new Date().toISOString(), base: 'local static server over site/', chrome: EXE || 'playwright default', concepts: {} };
let browser;
try {
  for (const id of ids) {
    if (!fs.existsSync(path.join(dirOf(id), 'index.html'))) { console.log(`${id}: no folder, skipped`); continue; }
    const R = results.concepts[id] = { runs: {} };
    await lockAcquire(id); browser = await launch();
    try { for (const run of RUNS) { if (!!run.nogl !== !!browser.__nogl) { await browser.close().catch(() => {}); browser = await launch(run.nogl); browser.__nogl = !!run.nogl; } const r = await runOne(browser, id, run, R); console.log(`${id} ${run.key.padEnd(6)} ${r.pass ? 'PASS' : 'FAIL'}  err ${r.errors.length} warn ${r.warnings.length} failed ${r.failed.length + r.http.length} ovf ${r.overflow.length} webgl ${r.hasStage ? (r.stage && r.stage.ok ? 'ok' : (r.nogl ? (r.noglOK ? 'poster' : 'BLANK') : 'FALLBACK')) : '-'} own ${(r.ownBytes / 1024).toFixed(0)} KB + shared ${(r.sharedBytes / 1024).toFixed(0)} KB ${r.finalUrl}`); }
    } finally { await browser.close().catch(() => {}); browser = null; lockRelease(); }
    const d = R.runs.d1440, m = R.runs.m390 || R.runs.m360;
    const html0 = fs.readFileSync(path.join(dirOf(id), 'index.html'), 'utf8'), tm = html0.match(/data-tier="(\w+)"/);
    const tier = ((tm && tm[1]) || { N: 'normal', A: 'advanced', P: 'premium' }[id[0]]).toLowerCase();
    /* phone = PC (Sujon, hard rule): the phone build loads the same 3D model, texture and HDRI files, and runs the same effects */
    const files3d = (r) => { const s = new Set(); for (const f of r.files) if (/\.(glb|gltf|bin|hdr|exr|ktx2|basis)$/i.test(f.u)) s.add(f.u); const i = r.info; if (i && i.ok) { for (const u of [...(i.models || []), ...(i.textures || []), ...(i.hdri && i.hdri.url ? [i.hdri.url] : [])]) s.add(u.replace(BASE, '').split('?')[0]); } return [...s].sort(); };
    if (d && m) {
      const A = files3d(d), B = files3d(m);
      R.assetDiff = { desktopOnly: A.filter((x) => !B.includes(x)), phoneOnly: B.filter((x) => !A.includes(x)) };
      R.sameAssets = !R.assetDiff.desktopOnly.length && !R.assetDiff.phoneOnly.length; R.assets3d = A;
      const FX = ['toneMapping', 'exposure', 'outputColorSpace', 'shadows', 'shadowType', 'antialias', 'envIntensity', 'background', 'passes', 'contactShadows', 'demand'];
      if (d.info && m.info && d.info.ok && m.info.ok) {
        // numbers within 15% count as equal: a flame flicker or day cycle animates envIntensity/exposure, so the two builds are sampled
        // at different moments; an isM branch (0.3 vs 0.2, shadows on/off, a missing pass) is still caught
        const same = (a, b) => (typeof a === 'number' && typeof b === 'number') ? Math.abs(a - b) <= 0.15 * Math.max(Math.abs(a), Math.abs(b), 1e-6) : JSON.stringify(a) === JSON.stringify(b);
        R.effectDiff = FX.filter((k) => !same(d.info[k], m.info[k])).map((k) => `${k}: desktop ${JSON.stringify(d.info[k])} vs phone ${JSON.stringify(m.info[k])}`);
        if ((d.info.hdri && d.info.hdri.state) !== (m.info.hdri && m.info.hdri.state)) R.effectDiff.push(`hdri: desktop ${d.info.hdri && d.info.hdri.state} vs phone ${m.info.hdri && m.info.hdri.state}`);
        R.sameEffects = !R.effectDiff.length; R.effects = Object.fromEntries(FX.map((k) => [k, d.info[k]]).concat([['dprCap', [d.info.dprCap, m.info.dprCap]]]));
      } else if ((d.info && d.info.ok) !== (m.info && m.info.ok) && (d.hasStage || m.hasStage)) { R.sameEffects = false; R.effectDiff = ['stage info: only one build reported a live stage']; }
      else { R.sameEffects = null; R.effectDiff = []; }
    } else { R.sameAssets = null; R.sameEffects = null; }
    /* weight: own (budgeted) vs shared runtime (reported) */
    R.weightKB = d ? Math.round(d.bytes / 1024) : null; R.phoneWeightKB = m ? Math.round(m.bytes / 1024) : null;
    R.ownKB = d ? Math.round(d.ownBytes / 1024) : null; R.sharedKB = d ? Math.round(d.sharedBytes / 1024) : null;
    R.phoneOwnKB = m ? Math.round(m.ownBytes / 1024) : null; R.phoneSharedKB = m ? Math.round(m.sharedBytes / 1024) : null;
    R.tier = tier; R.budgetKB = BUDGET_KB[tier] || BUDGET_KB.normal;
    R.overBudget = Math.max(R.ownKB || 0, R.phoneOwnKB || 0) > R.budgetKB;
    /* credit gate (Sujon, permanent): every asset file the page used has <asset>.credit.json (or its folder's credit.json) with
       all keys, and every CC-BY asset's credit (title, author, licence) is visible in the page footer on desktop AND phone */
    const cdir = '/library/' + path.relative(LIB, dirOf(id)).split(path.sep).join('/') + '/';
    const inScope = (u) => u.startsWith(cdir) || u.startsWith('/library/_assets/') || u.startsWith('/assets/hdri/') || u.startsWith('/library/_kit/font/') || u.startsWith('/assets/font/');
    const used = new Set(); for (const r of Object.values(R.runs)) for (const f of r.files) { if (f.ext) continue; const u = decodeURIComponent(f.u); if (inScope(u) && ASSET_RE.test(u) && !/\.credit\.json$|\/credit\.json$|\/credits\.json$|\/qa\.json$/.test(u) && !(u.startsWith(cdir) && /\.json$/i.test(u) && !/lottie|anim/i.test(u))) used.add(u); }
    const C = R.credit = { files: used.size, missing: [], incomplete: [], ccby: [], ccbyNotVisible: [], unlisted: [] };
    let listed = new Set(); try { const cj = JSON.parse(fs.readFileSync(path.join(dirOf(id), 'credits.json'), 'utf8')); for (const it of cj.items || []) for (const f of it.files || []) listed.add(path.resolve(dirOf(id), f)); } catch {}
    for (const u of [...used].sort()) {
      const abs = path.join(SITE, u); const cands = [abs + '.credit.json', path.join(path.dirname(abs), 'credit.json')];
      const cf = cands.find((p) => fs.existsSync(p)); if (!cf) { C.missing.push(u); continue; }
      let cr = null; try { cr = JSON.parse(fs.readFileSync(cf, 'utf8')); } catch { C.incomplete.push(`${u}: ${path.basename(cf)} is not valid JSON`); continue; }
      const lack = CREDIT_KEYS.filter((k) => !(k in cr) || (['title', 'author', 'licence', 'attribution', 'downloaded'].includes(k) && !String(cr[k] || '').trim()));
      if (lack.length) C.incomplete.push(`${u}: missing ${lack.join(', ')}`);
      if (!listed.has(abs) && !/\/(poster|thumb)\.webp$/.test(u) && !u.startsWith('/library/_kit/font/') && !u.startsWith('/assets/font/') && !u.startsWith('/assets/hdri/')) C.unlisted.push(u);
      if (isCCBY(cr.licence)) {
        C.ccby.push(u);
        for (const [k, r] of [['desktop', d], ['phone', m]]) {
          if (!r) continue; const t = norm(r.foot && r.foot.text);
          const miss = ['title', 'author'].filter((x) => cr[x] && !t.includes(norm(cr[x])));
          if (!/cc[\s-]?by/.test(t)) miss.push('licence');
          if (miss.length) C.ccbyNotVisible.push(`${u} (${k} footer lacks ${miss.join(', ')})`);
        }
      }
    }
    if (!used.size) C.incomplete.push('no asset files were recorded for this concept (check the network log): the credit gate cannot be vacuous');
    C.pass = !C.missing.length && !C.incomplete.length && !C.ccbyNotVisible.length;
    const ng = Object.values(R.runs).filter((r) => r.nogl); R.nowebgl = ng.length ? ng.every((r) => r.pass) : null;
    R.verdict = Object.values(R.runs).every((r) => r.pass) && R.sameAssets !== false && R.sameEffects !== false && !R.overBudget && C.pass ? 'PASS' : 'FAIL';
    const qa = { id, date: results.date, kit: 2, verdict: R.verdict, tier, budgetKB: R.budgetKB, ownKB: R.ownKB, sharedKB: R.sharedKB, phoneOwnKB: R.phoneOwnKB, phoneSharedKB: R.phoneSharedKB,
      weightKB: R.weightKB, phoneWeightKB: R.phoneWeightKB, sameAssets: R.sameAssets, assetDiff: R.assetDiff, assets3d: R.assets3d, sameEffects: R.sameEffects, effectDiff: R.effectDiff, effects: R.effects,
      nowebgl: R.nowebgl, credit: { pass: C.pass, files: C.files, missing: C.missing, incomplete: C.incomplete, ccby: C.ccby, ccbyNotVisible: C.ccbyNotVisible, unlisted: C.unlisted },
      runs: Object.fromEntries(Object.entries(R.runs).map(([k, r]) => [k, { pass: r.pass, errors: r.errors.length, warnings: r.warnings.length, failed: r.failed.length + r.http.length, overflow: r.overflow.length, webgl: r.hasStage ? !!(r.stage && r.stage.ok) : null, ...(r.nogl ? { poster: !!r.noglOK } : {}), ownKB: Math.round(r.ownBytes / 1024), sharedKB: Math.round(r.sharedBytes / 1024) }])) };
    fs.writeFileSync(path.join(dirOf(id), 'qa.json'), JSON.stringify(qa, null, 1) + '\n');
    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));   // after every concept, so a long run can be read while it goes
    console.log(`${id} VERDICT ${R.verdict}  own ${R.ownKB} KB desktop / ${R.phoneOwnKB} KB phone (budget ${R.budgetKB} KB ${tier}), shared ${R.sharedKB} KB; same 3D files on phone: ${R.sameAssets}; same effects: ${R.sameEffects}; no-WebGL poster: ${R.nowebgl}; credits: ${C.pass ? 'ok' : 'FAIL'} (${C.files} files, ${C.ccby.length} CC-BY)`);
    for (const x of [...(R.assetDiff ? [...R.assetDiff.desktopOnly.map((u) => 'desktop only: ' + u), ...R.assetDiff.phoneOnly.map((u) => 'phone only: ' + u)] : []), ...(R.effectDiff || []), ...C.missing.map((u) => 'no credit file: ' + u), ...C.incomplete, ...C.ccbyNotVisible.map((u) => 'CC-BY credit not visible: ' + u)]) console.log('   - ' + x);
  }
  if (has('--index')) {
    const R = results.index = { runs: {} };
    await lockAcquire('index'); browser = await launch();
    for (const run of [{ key: 'd1440', w: 1440, h: 900, mobile: false, page: 'index.html' }, { key: 'm390', w: 390, h: 844, mobile: true, page: 'index.html' }, { key: 'm360', w: 360, h: 740, mobile: true, page: 'm.html' }, { key: 'rm390', w: 390, h: 844, mobile: true, page: 'm.html', reduced: true }]) {
      const ctx = await browser.newContext({ viewport: { width: run.w, height: run.h }, deviceScaleFactor: run.mobile ? 2 : 1, isMobile: run.mobile, hasTouch: run.mobile, userAgent: run.mobile ? UA_IPHONE : undefined, reducedMotion: run.reduced ? 'reduce' : 'no-preference' });
      const page = await ctx.newPage(); const r = R.runs[run.key] = { errors: [], warnings: [], failed: [], overflow: [] };
      page.on('console', (m) => { const t = m.type(); if (t === 'error') r.errors.push(m.text().slice(0, 200)); if (t === 'warning') r.warnings.push(m.text().slice(0, 200)); });
      page.on('pageerror', (e) => r.errors.push('pageerror: ' + e.message.slice(0, 200)));
      page.on('response', (s) => { if (s.status() >= 400) r.failed.push(s.status() + ' ' + s.url().replace(BASE, '')); });
      page.on('requestfailed', (q) => r.failed.push('failed ' + q.url().replace(BASE, '')));
      await page.goto(`${BASE}/library/${run.page}`, { waitUntil: 'load' }).catch((e) => r.errors.push(e.message)); await sleep(2500);
      r.finalUrl = page.url().replace(BASE, '');
      fs.mkdirSync(path.join(OUT, 'index'), { recursive: true });
      await page.screenshot({ path: path.join(OUT, 'index', `${run.key}_top.jpg`), type: 'jpeg', quality: 80 });
      const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      for (let i = 1; i <= 6; i++) { await page.evaluate((y) => scrollTo(0, y), Math.round(H * i / 6)); await sleep(500); const o = await overflowProbe(page); if (o) r.overflow.push(o); if (i === 1) await page.screenshot({ path: path.join(OUT, 'index', `${run.key}_s1.jpg`), type: 'jpeg', quality: 80 }); }
      r.pass = !r.errors.length && !r.warnings.length && !r.failed.length && !r.overflow.length;
      console.log(`index ${run.key.padEnd(6)} ${r.pass ? 'PASS' : 'FAIL'} err ${r.errors.length} warn ${r.warnings.length} failed ${r.failed.length} ovf ${r.overflow.length} ${r.finalUrl}`);
      await ctx.close();
    }
    R.verdict = Object.values(R.runs).every((r) => r.pass) ? 'PASS' : 'FAIL';
    await browser.close().catch(() => {}); browser = null; lockRelease();
  }
} catch (e) { console.error('FATAL', e.stack); results.fatal = String(e.stack); }
finally { if (browser) await browser.close().catch(() => {}); lockRelease(); server.close(); }

/* reports */
fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
const lines = [`# Library QA ${results.date}`, '', `Local headless Chrome (SwiftShader WebGL; nd1440/nm390 with WebGL switched off), static server over site/. Runs: ${RUNS.map((r) => r.key).join(', ')}.`, '', 'Weight: own = the concept\'s files (budget: normal 1536 KB, advanced 3072 KB, premium 6144 KB, the larger of desktop/phone); shared = three.js + kit + shared HDRI (cached across concepts, not budgeted).', '', '| concept | verdict | ' + RUNS.map((r) => r.key).join(' | ') + ' | own KB d/m (budget) | shared KB | same 3D files | same effects | credits |', '|' + '---|'.repeat(RUNS.length + 7)];
for (const [id, R] of Object.entries(results.concepts)) lines.push(`| ${id} | **${R.verdict}** | ` + RUNS.map((r) => { const x = R.runs[r.key]; return x ? (x.pass ? 'pass' : `FAIL (e${x.errors.length} w${x.warnings.length} f${x.failed.length + x.http.length} o${x.overflow.length}${x.redirectOK ? '' : ' redirect'}${x.nogl ? (x.noglOK ? '' : ' blank') : (x.hasStage && !(x.stage && x.stage.ok) ? ' webgl' : '')})`) : '-'; }).join(' | ') + ` | ${R.ownKB}/${R.phoneOwnKB} (${R.budgetKB})${R.overBudget ? ' OVER' : ''} | ${R.sharedKB} | ${R.sameAssets} | ${R.sameEffects} | ${R.credit && R.credit.pass ? 'ok' : 'FAIL'} |`);
for (const [id, R] of Object.entries(results.concepts)) for (const [k, r] of Object.entries(R.runs)) { const bad = [...r.errors.map((x) => 'error: ' + x), ...r.warnings.map((x) => 'warning: ' + x), ...r.failed.map((x) => 'failed: ' + x), ...r.http.map((x) => 'http: ' + x), ...r.overflow.map((o) => `overflow: scrollWidth ${o.scrollWidth} > ${o.viewport} at y=${o.y}: ${o.offenders.join(', ')}`), ...(r.redirectOK ? [] : ['redirect: ' + r.notes.join('; ')])]; if (bad.length) { lines.push('', `## ${id} ${k}`, ...bad.slice(0, 20).map((b) => '- ' + b)); } }
for (const [id, R] of Object.entries(results.concepts)) { const bad = [...(R.assetDiff ? [...R.assetDiff.desktopOnly.map((u) => 'desktop only: ' + u), ...R.assetDiff.phoneOnly.map((u) => 'phone only: ' + u)] : []), ...(R.effectDiff || []).map((x) => 'effect differs: ' + x), ...(R.overBudget ? [`own weight over budget: ${Math.max(R.ownKB, R.phoneOwnKB)} KB > ${R.budgetKB} KB`] : []), ...(R.credit ? [...R.credit.missing.map((u) => 'no credit file: ' + u), ...R.credit.incomplete.map((x) => 'credit file incomplete: ' + x), ...R.credit.ccbyNotVisible.map((x) => 'CC-BY attribution not visible: ' + x), ...R.credit.unlisted.map((u) => 'note: not listed in credits.json: ' + u)] : [])]; if (bad.length) lines.push('', `## ${id} checks`, ...bad.slice(0, 30).map((b) => '- ' + b)); }
if (results.index) lines.push('', `Index pages: **${results.index.verdict}** (` + Object.entries(results.index.runs).map(([k, r]) => `${k} ${r.pass ? 'pass' : 'FAIL'}`).join(', ') + ')');
const all = Object.values(results.concepts).map((R) => R.verdict).concat(results.index ? [results.index.verdict] : []);
const V = all.length && all.every((v) => v === 'PASS') && !results.fatal ? 'PASS' : 'FAIL';
lines.push('', `VERDICT: ${V}`);
fs.writeFileSync(path.join(OUT, 'summary.md'), lines.join('\n') + '\n');
console.log(`\nVERDICT: ${V}   report: ${path.relative(ROOT, path.join(OUT, 'summary.md'))}`);
process.exit(V === 'PASS' ? 0 : 2);
