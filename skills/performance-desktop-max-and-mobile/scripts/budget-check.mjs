#!/usr/bin/env node
// budget-check.mjs: measure a page against a Zyqor tier budget.
// Usage: node budget-check.mjs <url> [--tier normal|advanced|premium] [--size 1440x900] [--throttle 4] [--vendor "vendor/,/three"] [--json out.json]
// Reports transferred bytes by type (own files vs vendor paths), LCP, CLS, long-task total, and fps during a scripted scroll.
// Needs Playwright (`npm i -D playwright`, or PLAYWRIGHT=/path/to/playwright-core/index.mjs, CHROME=/path/to/chrome). MIT, Zyqor Studio.
import fs from 'node:fs'; import zlib from 'node:zlib';
const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const url = args[0]; if (!url || url.startsWith('--')) { console.error('usage: node budget-check.mjs <url> [--tier advanced] [--size 1440x900] [--throttle 4]'); process.exit(2); }
const BUDGET = { normal: { own: 1.5e6, js: 80e3, fonts: 120e3, lcp: 2500 }, advanced: { own: 3e6, js: 250e3, fonts: 200e3, lcp: 2500 }, premium: { own: 8e6, js: 600e3, fonts: 300e3, lcp: 3000 } };
const tier = opt('tier', 'advanced'); const B = BUDGET[tier]; if (!B) { console.error('tier must be normal|advanced|premium'); process.exit(2); }
const [W, H] = opt('size', '1440x900').split('x').map(Number); const throttle = +opt('throttle', W < 768 ? 4 : 1);
const vendorMarks = opt('vendor', '/vendor/,/node_modules/').split(',');
let pw; try { pw = await import(process.env.PLAYWRIGHT || 'playwright'); } catch { console.error('Playwright not found: npm i -D playwright'); process.exit(2); }
const chromium = pw.chromium || pw.default?.chromium;
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const phone = W < 768; const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone });
const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable'); if (throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
const reqs = new Map(); const bytes = { own: 0, vendor: 0, byType: {} }; const errors = [];
const pending = []; let rawText = 0;
cdp.on('Network.responseReceived', (e) => reqs.set(e.requestId, { url: e.response.url, type: e.type, mime: e.response.mimeType, enc: Object.entries(e.response.headers).find(([k]) => k.toLowerCase() === 'content-encoding')?.[1] }));
cdp.on('Network.loadingFinished', (e) => { const r = reqs.get(e.requestId); if (!r || r.url.startsWith('data:')) return; let n = e.encodedDataLength;
  const t = /font/.test(r.mime) || /\.woff2?$/.test(r.url) ? 'font' : r.type === 'Script' ? 'js' : r.type === 'Stylesheet' ? 'css' : r.type === 'Image' ? 'image' : r.type === 'Media' || /\.(mp4|webm)$/.test(r.url) ? 'media' : /\.(glb|gltf|hdr|ktx2|bin)$/.test(r.url) ? '3d' : r.type === 'Document' ? 'html' : 'other';
  let m = n;
  if (!r.enc && ['js', 'css', 'html'].includes(t)) { rawText++; // server sent it uncompressed: count the gzip size production (Vercel: Brotli) would send
    pending.push(cdp.send('Network.getResponseBody', { requestId: e.requestId }).then((b) => { const buf = Buffer.from(b.body, b.base64Encoded ? 'base64' : 'utf8'); const g = zlib.gzipSync(buf).length; const d = n - g; bytes.byType[t] -= d; if (vendorMarks.some((mk) => r.url.includes(mk))) bytes.vendor -= d; else bytes.own -= d; }).catch(() => {})); }
  bytes.byType[t] = (bytes.byType[t] || 0) + m; n = m; if (vendorMarks.some((m) => r.url.includes(m))) bytes.vendor += n; else bytes.own += n; });
page.on('pageerror', (e) => errors.push(String(e)));
await page.addInitScript(() => { window.__perf = { lcp: 0, cls: 0, long: 0, longN: 0 };
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__perf.long += e.duration - 50; window.__perf.longN++; } }).observe({ type: 'longtask', buffered: true }); } catch {} });
await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
const loadCls = await page.evaluate(() => window.__perf.cls);       // CLS of the load (what Lighthouse scores); scroll-time shifts are reported apart
const gl = await page.evaluate(() => { try { const c = document.createElement('canvas').getContext('webgl'); const x = c.getExtension('WEBGL_debug_renderer_info'); return x ? c.getParameter(x.UNMASKED_RENDERER_WEBGL) : ''; } catch { return ''; } });
const fps = await page.evaluate(async () => { const max = document.documentElement.scrollHeight - innerHeight; if (max < 50) return null;
  let frames = 0, worst = 0, last = performance.now(); const t0 = last; let y = 0; await new Promise((done) => { const step = (now) => { frames++; worst = Math.max(worst, now - last); last = now; y += max / 180; scrollTo(0, y); if (y < max) requestAnimationFrame(step); else done(); }; requestAnimationFrame(step); });
  const secs = (performance.now() - t0) / 1000; return { avg: Math.round(frames / secs), worstFrameMs: Math.round(worst) }; });
await page.waitForTimeout(800);
const perf = await page.evaluate(() => window.__perf); await Promise.all(pending); const scrollCls = perf.cls - loadCls; perf.cls = loadCls;
const jsBytes = bytes.byType.js || 0, fontBytes = bytes.byType.font || 0;
const checks = [['own files', bytes.own, B.own], ['javascript', jsBytes, B.js], ['fonts', fontBytes, B.fonts], ['LCP ms', Math.round(perf.lcp), B.lcp], ['CLS', +perf.cls.toFixed(3), 0.1]];
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log(`budget-check ${url}\n  size ${W}x${H}  cpu throttle ${throttle}x  tier ${tier}`);
console.log('  bytes by type: ' + Object.entries(bytes.byType).map(([k, v]) => `${k} ${kb(v)}`).join(', ') + `  (own ${kb(bytes.own)}, vendor ${kb(bytes.vendor)})`);
let over = 0; for (const [n, v, lim] of checks) { const bad = v > lim; over += bad; console.log(`  ${bad ? 'OVER' : 'ok  '} ${n.padEnd(11)} ${typeof v === 'number' && v > 5000 ? kb(v) : v}  (limit ${lim > 5000 ? kb(lim) : lim})`); }
if (rawText) console.log(`  note: ${rawText} text file(s) arrived uncompressed from this server; JS/CSS/HTML are counted at their gzip size (production should compress)`);
if ((bytes.byType['3d'] || 0) > 0 && /swiftshader|llvmpipe|software/i.test(gl)) console.log(`  note: WebGL is software-rendered here (${gl.slice(0, 60)}); fps for 3D pages is not meaningful, measure on a real GPU`);
if (scrollCls > 0.1) console.log(`  info: layout shift during the scripted scroll ${scrollCls.toFixed(3)} (pins and sticky spacers count here; check it is intended)`);
console.log(`  long tasks: ${perf.longN} (${Math.round(perf.long)} ms over 50 ms)` + (fps ? `   scroll fps: ${fps.avg} avg, worst frame ${fps.worstFrameMs} ms` : '   page too short to scroll'));
if (errors.length) console.log('  page errors: ' + errors.slice(0, 3).join(' | '));
if (opt('json')) fs.writeFileSync(opt('json'), JSON.stringify({ url, tier, size: [W, H], throttle, bytes, perf, scrollCls, fps, gl, errors }, null, 2));
await browser.close(); console.log(over || errors.length ? 'BUDGET FAIL' : 'BUDGET OK'); process.exit(over || errors.length ? 1 : 0);
