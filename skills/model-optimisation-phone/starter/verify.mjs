#!/usr/bin/env node
// verify.mjs: prove the optimised model looks the same as the original, on desktop and on phone.
// Part of the model-optimisation-phone skill (Zyqor Studio, MIT).
//
//   node verify.mjs original.glb optimised.glb --out verify/ [--hdr studio_1k.hdr] [--views views.json]
//
// Renders both files with the SAME viewer (loader.js) at 1440x900 (DPR 1) and 390x844 (DPR 3, capped to 2),
// from a full view and three automatic close-ups, then writes:
//   verify.json                    PSNR + changed-pixel % per view, verdict IDENTICAL / VISIBLE CHANGE
//   compare_closeups.jpg           original | optimised | difference x8, per close-up (desktop)
//   compare_desktop_phone.jpg      optimised on desktop | optimised on phone (same file)
//   compare_closeup_desktop_phone.jpg  the same close-up crop on desktop and phone
// Needs: playwright-core + a Chromium (npx playwright install chromium-headless-shell), sharp, three.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i < 0 ? d : argv[i + 1]; };
const pos = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
if (pos.length < 2) { console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('\n').slice(1, 14).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); process.exit(1); }
const [REF, OPT] = pos.map(p => path.resolve(p));
const OUT = path.resolve(flag('out', 'verify'));
const HERE = path.dirname(new URL(import.meta.url).pathname);
const HDR = path.resolve(flag('hdr', path.join(HERE, 'studio_1k.hdr')));
const VIEWS = flag('views') ? JSON.parse(fs.readFileSync(flag('views'), 'utf8')) : null;
const PSNR_MIN = +flag('psnr-min', 38), CHANGED_MAX = +flag('changed-max', 1.0); // % of pixels whose max channel moved > 12/255
fs.mkdirSync(OUT, { recursive: true });
// a .gltf with separate files is packed losslessly into one GLB first, so the browser loads it like the optimised file
async function asGlb(p, tag) {
  if (!/\.gltf$/i.test(p)) return p;
  const { NodeIO } = await import('@gltf-transform/core'); const { ALL_EXTENSIONS } = await import('@gltf-transform/extensions');
  const out = path.join(OUT, `_${tag}_packed.glb`); const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  await io.write(out, await io.read(p)); return out;
}
const REF_IN = REF; const REFG = await asGlb(REF, 'original'); const OPTG = await asGlb(OPT, 'optimised');
const threeDir = path.resolve(path.dirname(require.resolve('three')), '..');  // .../node_modules/three

// ---- one Chrome on the box at a time: wait while another headless Chrome is running ----
if (!argv.includes('--no-wait')) {
  // shared, memory-tight machines: wait up to --wait seconds (default 90) for other headless Chromes to finish,
  // then go ahead only if at least 2.5 GB of memory is free
  const waitS = +flag('wait', 90); let i = 0;
  for (; i < waitS / 5; i++) {
    let busy = ''; try { busy = execSync("pgrep -f '[c]hrome-headless-shell|[c]hromium/chrome' || true").toString().trim(); } catch {}
    if (!busy) break; if (i === 0) console.log('another headless Chrome is running; waiting up to ' + waitS + ' s (one browser at a time)...');
    await new Promise(r => setTimeout(r, 5000));
  }
  if (i >= waitS / 5) { const avail = +execSync("awk '/MemAvailable/{print $2}' /proc/meminfo").toString() / 1048576;
    if (avail < 2.5) { console.error(`still busy and only ${avail.toFixed(1)} GB free: try again later`); process.exit(6); }
    console.log(`still busy, but ${avail.toFixed(1)} GB is free: going ahead`); }
}

// ---- tiny static server: no child process, closes with this script ----
const files = { '/ref.glb': REFG, '/opt.glb': OPTG, '/env.hdr': HDR, '/loader.js': path.join(HERE, 'loader.js') };
const mime = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.wasm': 'application/wasm', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const page = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#EFE9DD}#s{position:fixed;inset:0}</style>
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script></head>
<body><div id="s"></div><script type="module">
import { createViewer } from '/loader.js';
const q = new URLSearchParams(location.search);
window.__v = createViewer({ el: document.getElementById('s'), model: q.get('m'), hdr: '/env.hdr', lazy: false, autoRotate: 0, drag: false,
  preserve: true, background: '#EFE9DD', shadow: true, decoders: { draco: '/three/examples/jsm/libs/draco/gltf/', basis: '/three/examples/jsm/libs/basis/' } });
window.__v.ready.then(() => { window.__ready = true; }, (e) => { window.__err = String(e); });
</script></body></html>`;
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  let f = files[u]; if (u === '/' || u === '/index.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(page); }
  if (!f && u.startsWith('/three/')) f = path.join(threeDir, u.slice(7));
  if (!f || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const { chromium } = await import('playwright-core');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const VP = { desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } };
const errors = [];
let views = VIEWS;

async function renderAll(label, model) {
  const shots = {};
  for (const [vp, ctxOpts] of Object.entries(VP)) {
    const ctx = await browser.newContext(ctxOpts); const pg = await ctx.newPage();
    pg.on('console', m => { if (m.type() === 'error') errors.push(`${label}/${vp}: ${m.text().slice(0, 200)}`); });
    pg.on('pageerror', e => errors.push(`${label}/${vp}: ${e.message.slice(0, 200)}`));
    const t0 = Date.now();
    await pg.goto(BASE + '?m=/' + model, { waitUntil: 'load' });
    await pg.waitForFunction(() => window.__ready || window.__err, null, { timeout: 180000 });
    const err = await pg.evaluate(() => window.__err); if (err) throw new Error(label + ' failed to load: ' + err);
    const stats = await pg.evaluate(() => window.__v.stats);
    if (!views) views = await pg.evaluate(() => autoViews());
    for (const [name, v] of Object.entries(views)) {
      await pg.evaluate((v) => { window.__v.goTo(v, 0); window.__v.render(); }, v);
      await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      await pg.waitForTimeout(150);
      const f = path.join(OUT, `${label}_${vp}_${name}.png`);
      await pg.screenshot({ path: f }); shots[`${vp}_${name}`] = f;
    }
    shots[`${vp}_stats`] = { ...stats, wallMs: Date.now() - t0 };
    await ctx.close();
  }
  return shots;
}
// close-ups: the three biggest meshes, seen from their own side, at 30% of the fit distance
const inject = `window.autoViews = function () {
  const v = window.__v; const meshes = [];
  v.scene.updateMatrixWorld(true);
  const all = { min: [1e9,1e9,1e9], max: [-1e9,-1e9,-1e9] };
  v.pivot.traverse(o => { if (!o.isMesh || !o.geometry) return; o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
    const s = [b.max.x-b.min.x, b.max.y-b.min.y, b.max.z-b.min.z]; if (o.material && o.material.transparent && !o.material.map) return;
    if (s[0] > 1e5) return; meshes.push({ c: [(b.min.x+b.max.x)/2,(b.min.y+b.max.y)/2,(b.min.z+b.max.z)/2], vol: s[0]*s[1]*s[2] + 1e-12, name: o.name });
    for (let i=0;i<3;i++){ all.min[i]=Math.min(all.min[i],[b.min.x,b.min.y,b.min.z][i]); all.max[i]=Math.max(all.max[i],[b.max.x,b.max.y,b.max.z][i]); } });
  const ctr = all.min.map((m,i)=>(m+all.max[i])/2); const size = Math.max(...all.max.map((m,i)=>m-all.min[i]));
  meshes.sort((a,b)=>b.vol-a.vol);
  const views = { full: { theta: 0.6, phi: 1.25, r: 1 } }; let n = 0;
  for (const m of meshes) { if (n >= 3) break; const at = m.c.map((c,i)=>(c-ctr[i])/size);
    if (Object.values(views).some(w => w.at && Math.hypot(...w.at.map((a,i)=>a-at[i])) < 0.12)) continue;
    const th = Math.hypot(at[0], at[2]) > 0.03 ? Math.atan2(at[0], at[2]) : 0.6 + n * 1.4;
    views['close' + (++n)] = { at, theta: th, phi: 1.2, r: 0.3, mesh: m.name }; }
  return views; };`;
const _newContext = browser.newContext.bind(browser);
browser.newContext = async (o) => { const c = await _newContext(o); await c.addInitScript(inject); return c; };

const t0 = Date.now();
const ref = await renderAll('original', 'ref.glb');
const opt = await renderAll('optimised', 'opt.glb');
await browser.close(); server.close();

// ---- metrics ----
function fileBytes(p) { const s = fs.statSync(p); if (!/\.gltf$/i.test(p)) return s.size; const g = JSON.parse(fs.readFileSync(p, 'utf8')); let t = s.size;
  for (const r of [...(g.buffers || []), ...(g.images || [])]) if (r.uri && !r.uri.startsWith('data:')) t += fs.statSync(path.join(path.dirname(p), decodeURIComponent(r.uri))).size; return t; }
async function raw(f) { const { data, info } = await sharp(f).removeAlpha().raw().toBuffer({ resolveWithObject: true }); return { data, w: info.width, h: info.height }; }
async function compare(a, b, diffOut) {
  const A = await raw(a), B = await raw(b); let se = 0, changed = 0; const n = A.w * A.h; const d = Buffer.alloc(n * 3);
  for (let i = 0; i < n; i++) { let mx = 0; for (let c = 0; c < 3; c++) { const x = A.data[i * 3 + c] - B.data[i * 3 + c]; se += x * x; mx = Math.max(mx, Math.abs(x)); }
    if (mx > 12) changed++; const v = Math.min(255, mx * 8); d[i * 3] = v; d[i * 3 + 1] = Math.round(v * 0.45); d[i * 3 + 2] = Math.round(v * 0.15); }
  if (diffOut) await sharp(d, { raw: { width: A.w, height: A.h, channels: 3 } }).png().toFile(diffOut);
  const mse = se / (n * 3); return { psnr: mse ? +(10 * Math.log10(65025 / mse)).toFixed(2) : 99, changed_pct: +(100 * changed / n).toFixed(3) };
}
const result = { original: REF, optimised: OPT, bytes: { original: fileBytes(REF), optimised: fileBytes(OPT) }, thresholds: { psnr_min: PSNR_MIN, changed_max_pct: CHANGED_MAX }, views, per_view: {}, load: { original: { desktop: ref.desktop_stats, phone: ref.phone_stats }, optimised: { desktop: opt.desktop_stats, phone: opt.phone_stats } }, console_errors: errors };
let worst = { psnr: 99, changed_pct: 0 };
for (const k of Object.keys(ref).filter(k => !k.endsWith('stats'))) {
  const m = await compare(ref[k], opt[k], path.join(OUT, `diff_${k}.png`)); result.per_view[k] = m;
  worst = { psnr: Math.min(worst.psnr, m.psnr), changed_pct: Math.max(worst.changed_pct, m.changed_pct) };
}
result.worst = worst;
result.verdict = errors.length ? 'ERRORS' : (worst.psnr >= PSNR_MIN && worst.changed_pct <= CHANGED_MAX ? 'IDENTICAL' : 'VISIBLE CHANGE');

// ---- composites (jpg, for READMEs and phones) ----
const label = (txt, w) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="44"><rect width="100%" height="100%" fill="#1F2A24"/><text x="16" y="29" font-family="Inter Tight, Helvetica, Arial, sans-serif" font-size="20" fill="#F3EDE1">${txt}</text></svg>`);
async function tile(f, w, h, txt, crop) { let img = sharp(f); if (crop) img = img.extract(crop); const body = await img.resize(w, h, { fit: 'cover' }).toBuffer();
  return sharp({ create: { width: w, height: h + 44, channels: 3, background: '#1F2A24' } }).composite([{ input: label(txt, w), top: 0, left: 0 }, { input: body, top: 44, left: 0 }]).png().toBuffer(); }
async function row(tiles, out, gap = 8) { const metas = await Promise.all(tiles.map(t => sharp(t).metadata())); const W = metas.reduce((a, m) => a + m.width, 0) + gap * (tiles.length - 1); const H = Math.max(...metas.map(m => m.height));
  let x = 0; const comp = tiles.map((t, i) => { const c = { input: t, left: x, top: 0 }; x += metas[i].width + gap; return c; });
  const b = await sharp({ create: { width: W, height: H, channels: 3, background: '#F3EDE1' } }).composite(comp).png().toBuffer(); if (out) await sharp(b).jpeg({ quality: 88, chromaSubsampling: '4:4:4' }).toFile(out); return b; }
async function stack(rows, out, gap = 8) { const metas = await Promise.all(rows.map(t => sharp(t).metadata())); const W = Math.max(...metas.map(m => m.width)); const H = metas.reduce((a, m) => a + m.height, 0) + gap * (rows.length - 1);
  let y = 0; const comp = rows.map((t, i) => { const c = { input: t, left: 0, top: y }; y += metas[i].height + gap; return c; });
  await sharp({ create: { width: W, height: H, channels: 3, background: '#F3EDE1' } }).composite(comp).jpeg({ quality: 88, chromaSubsampling: '4:4:4' }).toFile(out); }
const KB = (b) => (b / 1048576).toFixed(2) + ' MB';
const closeNames = Object.keys(views).filter(n => n !== 'full');
// 1) close-ups original | optimised | diff, centre crop 640x640 of the desktop render
const C = { left: 400, top: 130, width: 640, height: 640 };
const rows = [];
for (const n of closeNames) { const m = result.per_view['desktop_' + n];
  rows.push(await row([await tile(ref['desktop_' + n], 480, 480, `${n} · original ${KB(result.bytes.original)}`, C), await tile(opt['desktop_' + n], 480, 480, `optimised ${KB(result.bytes.optimised)}`, C), await tile(path.join(OUT, `diff_desktop_${n}.png`), 480, 480, `difference x8 · PSNR ${m.psnr} dB`, C)])); }
await stack(rows, path.join(OUT, 'compare_closeups.jpg'));
// 2) desktop vs phone, full view, same optimised file
await row([await tile(opt.desktop_full, 1152, 720, 'desktop 1440x900 · optimised.glb'), await tile(opt.phone_full, 333, 720, 'phone 390px · same file')], path.join(OUT, 'compare_desktop_phone.jpg'));
// 3) the same close-up crop, desktop vs phone (phone has ~1.875x more device pixels per world unit, scaled to match)
const c1 = closeNames[0]; const pm = await sharp(opt['phone_' + c1]).metadata(); const k = pm.height / 900; const cs = Math.round(Math.min(560, pm.width / k)); 
const dC = { left: Math.round(720 - cs / 2), top: Math.round(450 - cs / 2), width: cs, height: cs };
const pC = { left: Math.round(pm.width / 2 - cs * k / 2), top: Math.round(pm.height / 2 - cs * k / 2), width: Math.round(cs * k), height: Math.round(cs * k) };
await row([await tile(opt['desktop_' + c1], 560, 560, `${c1} close-up · desktop`, dC), await tile(opt['phone_' + c1], 560, 560, `${c1} close-up · phone (same file)`, pC)], path.join(OUT, 'compare_closeup_desktop_phone.jpg'));

result.seconds = Math.round((Date.now() - t0) / 1000);
fs.writeFileSync(path.join(OUT, 'verify.json'), JSON.stringify(result, null, 1));
console.log(`\n${result.verdict}  worst PSNR ${worst.psnr} dB, worst changed ${worst.changed_pct}% (limits >= ${PSNR_MIN} dB, <= ${CHANGED_MAX}%)`);
for (const [k2, m] of Object.entries(result.per_view)) console.log(`  ${k2.padEnd(18)} PSNR ${String(m.psnr).padStart(6)} dB   changed ${m.changed_pct}%`);
console.log(`  console errors: ${errors.length}${errors.length ? '\n   ' + errors.slice(0, 5).join('\n   ') : ''}`);
console.log(`  images + verify.json in ${OUT}\n`);
process.exit(result.verdict === 'IDENTICAL' ? 0 : 5);
