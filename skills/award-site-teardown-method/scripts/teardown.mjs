#!/usr/bin/env node
// teardown.mjs: measure a live website the way a teardown card needs it, then write the card with the facts filled in
// and the judgment fields left for you. Facts only: what the page itself reports at 1440x900 and 390x844.
//   - stack: libraries on window (GSAP, ScrollTrigger, Lenis, three.js, PIXI, Barba, Swup, Locomotive, Matter, Lottie,
//     Spline, Framer, Webflow, Next/Nuxt), canvases with their context type, videos, iframes
//   - type: font families actually loaded (document.fonts), sizes of the largest heading at both widths
//   - colour: the most-used background and text colours weighted by on-screen area (approximate palette)
//   - structure: page height in screens, sections, headings outline, links, buttons
//   - weight: requests and bytes by type (as the browser received them), largest files, LCP and CLS from the page
//   - motion: whether the page changes between two frames at rest (something animates by itself), smooth-scroll hints
//   - screenshots at 0 / 33 / 66 / 100% of the page at both widths
// Usage: node teardown.mjs <url> [--out dir] [--name slug] [--json-only]
// Needs Playwright (`npm i -D playwright`, or PLAYWRIGHT=/path/to/playwright-core/index.mjs and CHROME=/path/to/chrome).
// Respect the site: one visit, no crawling, screenshots stay private (study notes, never published). MIT, Zyqor Studio 2026.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const args = process.argv.slice(2);
const url = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
if (!url) { console.error('usage: node teardown.mjs <url> [--out dir] [--name slug]'); process.exit(2); }
const slug = opt('name', new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-'));
const out = path.resolve(opt('out', 'teardowns'), slug); fs.mkdirSync(out, { recursive: true });
let pw; try { pw = await import(process.env.PLAYWRIGHT || 'playwright'); } catch { console.error('Playwright not found: npm i -D playwright (or set PLAYWRIGHT)'); process.exit(2); }
const chromium = pw.chromium || pw.default?.chromium;
const browser = await chromium.launch({ ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

function probe() {
  const w = window; const libs = [];
  const has = (name, test) => { try { if (test()) libs.push(name); } catch {} };
  has('GSAP', () => w.gsap || w.TweenMax); has('ScrollTrigger', () => w.ScrollTrigger || (w.gsap && w.gsap.core && w.gsap.plugins && w.gsap.plugins.scrollTrigger));
  has('Lenis', () => w.Lenis || w.lenis || document.documentElement.classList.contains('lenis')); has('Locomotive Scroll', () => w.LocomotiveScroll || document.querySelector('[data-scroll-container]'));
  has('three.js', () => w.THREE || w.__THREE__); has('PixiJS', () => w.PIXI); has('Barba.js', () => w.barba || document.querySelector('[data-barba]')); has('Swup', () => w.swup || document.querySelector('#swup'));
  has('Matter.js', () => w.Matter); has('Lottie', () => w.lottie || w.bodymovin || document.querySelector('lottie-player,dotlottie-player')); has('Spline', () => document.querySelector('spline-viewer,canvas[data-engine*="spline"]'));
  has('Framer', () => document.querySelector('[data-framer-name],#__framer-badge-container') || /framer/i.test(document.querySelector('meta[name=generator]')?.content || ''));
  has('Webflow', () => document.documentElement.dataset.wfPage || /webflow/i.test(document.querySelector('meta[name=generator]')?.content || ''));
  has('Next.js', () => w.__NEXT_DATA__ || w.next); has('Nuxt', () => w.__NUXT__ || w.$nuxt); has('React', () => w.React || document.querySelector('[data-reactroot]'));
  has('Vue', () => w.Vue || document.querySelector('[data-v-app]')); has('Svelte', () => document.querySelector('[class*="svelte-"]')); has('Astro', () => document.querySelector('astro-island'));
  has('View Transitions', () => [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => /view-transition/.test(r.cssText)); } catch { return false; } }));
  const canvases = [...document.querySelectorAll('canvas')].map((c) => { let t = 'unknown'; try { t = c.getContext('webgl2') ? 'webgl2' : c.getContext('webgl') ? 'webgl' : c.getContext('2d') ? '2d' : 'unknown'; } catch {} const r = c.getBoundingClientRect(); return { type: t, w: Math.round(r.width), h: Math.round(r.height) }; });
  const fonts = [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))];
  const heads = [...document.querySelectorAll('h1,h2,h3')].slice(0, 24).map((h) => ({ tag: h.tagName.toLowerCase(), text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 70), size: Math.round(parseFloat(getComputedStyle(h).fontSize)), family: getComputedStyle(h).fontFamily.split(',')[0].replace(/["']/g, '') }));
  const big = [...document.querySelectorAll('h1,h2,p,span,a,div')].filter((e) => e.childElementCount === 0 && e.textContent.trim()).map((e) => ({ s: parseFloat(getComputedStyle(e).fontSize), f: getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, ''), t: e.textContent.trim().slice(0, 40) })).sort((a, b) => b.s - a.s)[0] || null;
  const area = {}; const text = {};
  const add = (m, c, a) => { if (!c || /rgba\(0, 0, 0, 0\)|transparent/.test(c)) return; m[c] = (m[c] || 0) + a; };
  for (const el of document.querySelectorAll('body, body *')) {
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight * 3) continue;
    const s = getComputedStyle(el); const a = Math.min(r.width, innerWidth) * Math.min(r.height, innerHeight * 3);
    add(area, s.backgroundColor, a); if (el.childElementCount === 0 && el.textContent.trim()) add(text, s.color, el.textContent.trim().length);
  }
  const hex = (c) => { const m = c.match(/\d+(\.\d+)?/g); if (!m) return c; return '#' + m.slice(0, 3).map((x) => (+x).toString(16).padStart(2, '0')).join('').toUpperCase(); };
  const top = (m, n) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([c, v]) => ({ hex: hex(c), share: v }));
  const tb = top(area, 6), tt = top(text, 4); const sb = tb.reduce((s, x) => s + x.share, 0) || 1, st = tt.reduce((s, x) => s + x.share, 0) || 1;
  const lcp = (w.__td && w.__td.lcp) || null, cls = (w.__td && w.__td.cls) || 0;
  return {
    title: document.title, description: document.querySelector('meta[name=description]')?.content || '', lang: document.documentElement.lang,
    libs, canvases, videos: document.querySelectorAll('video').length, iframes: document.querySelectorAll('iframe').length,
    fonts, headings: heads, largestText: big,
    palette: { backgrounds: tb.map((x) => ({ hex: x.hex, pct: Math.round(100 * x.share / sb) })), text: tt.map((x) => ({ hex: x.hex, pct: Math.round(100 * x.share / st) })) },
    pageScreens: +(document.documentElement.scrollHeight / innerHeight).toFixed(1), sections: document.querySelectorAll('section').length,
    links: document.querySelectorAll('a[href]').length, buttons: document.querySelectorAll('button').length, domNodes: document.querySelectorAll('*').length,
    reducedMotionCss: [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => /prefers-reduced-motion/.test(r.conditionText || r.cssText)); } catch { return false; } }),
    lcpMs: lcp, cls: +cls.toFixed(3),
  };
}

const report = { url, studied: new Date().toISOString(), sizes: {} };
for (const [label, w, h, mob] of [['desktop', 1440, 900, false], ['phone', 390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob, deviceScaleFactor: 1, userAgent: mob ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' : undefined });
  await ctx.addInitScript(() => { window.__td = { lcp: null, cls: 0 }; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__td.lcp = Math.round(e.startTime); }).observe({ type: 'largest-contentful-paint', buffered: true }); new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__td.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {} });
  const page = await ctx.newPage(); const reqs = []; const errors = [];
  page.on('response', async (r) => { try { const hdr = r.headers(); const len = +(hdr['content-length'] || 0); reqs.push({ url: r.url(), type: r.request().resourceType(), status: r.status(), bytes: len, ct: hdr['content-type'] || '' }); } catch {} });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  const res = { };
  try { await page.goto(url, { waitUntil: 'load', timeout: 60000 }); } catch (e) { res.loadError = e.message.slice(0, 160); }
  await page.waitForTimeout(3500);
  try { const a = await page.screenshot({ type: 'jpeg', quality: 60, timeout: 20000 }); await page.waitForTimeout(700); const b = await page.screenshot({ type: 'jpeg', quality: 60, timeout: 20000 });
  res.animatesAtRest = crypto.createHash('md5').update(a).digest('hex') !== crypto.createHash('md5').update(b).digest('hex'); } catch { res.animatesAtRest = null; }
  Object.assign(res, await page.evaluate(probe));
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const shots = [];
  const virtual = H < 50; // one-screen 'app' pages scroll their own scene: drive them with wheel events instead
  res.virtualScroll = virtual;
  for (const f of [0, 0.33, 0.66, 1]) {
    if (virtual) { await page.mouse.move(w / 2, h / 2); for (let k = 0; k < (f ? 6 : 0); k++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(120); } }
    else await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * f));
    await page.waitForTimeout(1300); const p = path.join(out, `${label}-${Math.round(f * 100)}.jpg`); try { await page.screenshot({ path: p, type: 'jpeg', quality: 62, timeout: 20000 }); shots.push(path.basename(p)); } catch { shots.push('timed out at ' + Math.round(f * 100) + '%'); } }
  res.shots = shots;
  const sumBy = {}; for (const r of reqs) { sumBy[r.type] = sumBy[r.type] || { n: 0, kb: 0 }; sumBy[r.type].n++; sumBy[r.type].kb += r.bytes / 1024; }
  for (const k in sumBy) sumBy[k].kb = Math.round(sumBy[k].kb);
  res.requests = reqs.length; res.byType = sumBy; res.totalKB = Math.round(reqs.reduce((s, r) => s + r.bytes, 0) / 1024);
  res.largest = reqs.filter((r) => r.bytes).sort((x, y) => y.bytes - x.bytes).slice(0, 6).map((r) => ({ kb: Math.round(r.bytes / 1024), type: r.type, file: r.url.split('?')[0].split('/').slice(-2).join('/') }));
  res.thirdParty = [...new Set(reqs.map((r) => { try { return new URL(r.url).hostname; } catch { return ''; } }).filter((hn) => hn && !hn.endsWith(new URL(url).hostname.replace(/^www\./, ''))))].slice(0, 12);
  res.pageErrors = errors.slice(0, 5);
  report.sizes[label] = res; await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(out, 'teardown.json'), JSON.stringify(report, null, 1));

if (!args.includes('json-only') && !args.includes('--json-only')) {
  const d = report.sizes.desktop, p = report.sizes.phone;
  const pal = (x) => x.palette.backgrounds.slice(0, 4).map((c) => `${c.hex} ${c.pct}%`).join(', ');
  const card = `# Teardown: ${d.title || url}

- URL: ${url}
- Studied: ${report.studied.slice(0, 10)} with \`teardown.mjs\` (headless Chrome, 1440x900 and 390x844). Screenshots in this folder are private study notes.
- Credit line if a technique is used: "Technique studied from ${new URL(url).hostname} (inspiration only, nothing copied)."

## Measured (facts from the page)

| | Desktop 1440 | Phone 390 |
|---|---|---|
| Libraries seen | ${d.libs.join(', ') || 'none detected'} | ${p.libs.join(', ') || 'none detected'} |
| Canvases | ${d.canvases.map((c) => c.type + ' ' + c.w + 'x' + c.h).join('; ') || '0'} | ${p.canvases.map((c) => c.type + ' ' + c.w + 'x' + c.h).join('; ') || '0'} |
| Videos / iframes | ${d.videos} / ${d.iframes} | ${p.videos} / ${p.iframes} |
| Fonts loaded | ${d.fonts.join(', ') || 'system'} | ${p.fonts.join(', ') || 'system'} |
| Largest text | ${d.largestText ? Math.round(d.largestText.s) + 'px ' + d.largestText.f : '-'} | ${p.largestText ? Math.round(p.largestText.s) + 'px ' + p.largestText.f : '-'} |
| Background colours by DOM area (WebGL/video content not counted) | ${pal(d)} | ${pal(p)} |
| Text colours | ${d.palette.text.map((c) => c.hex).join(', ')} | ${p.palette.text.map((c) => c.hex).join(', ')} |
| Page height | ${d.pageScreens} screens, ${d.sections} sections${d.virtualScroll ? ' (one-screen app: scene scrolled by wheel events)' : ''} | ${p.pageScreens} screens |
| Animates at rest | ${d.animatesAtRest == null ? 'unknown' : d.animatesAtRest ? 'yes' : 'no'} | ${p.animatesAtRest == null ? 'unknown' : p.animatesAtRest ? 'yes' : 'no'} |
| Reduced-motion CSS present | ${d.reducedMotionCss ? 'yes' : 'no'} | |
| Requests / weight received | ${d.requests} / ${d.totalKB} KB | ${p.requests} / ${p.totalKB} KB |
| LCP / CLS (headless, indicative) | ${d.lcpMs ?? '-'} ms / ${d.cls} | ${p.lcpMs ?? '-'} ms / ${p.cls} |
| Largest files | ${d.largest.map((f) => f.file + ' ' + f.kb + 'KB').join('; ')} | |
| Third-party hosts | ${d.thirdParty.join(', ') || 'none'} | |

Headings outline (desktop): ${d.headings.slice(0, 10).map((h) => `${h.tag} "${h.text}" ${h.size}px`).join(' / ') || 'none'}

Weights are what the browser was told (content-length); compressed or streamed files may show 0. Headless Chrome uses
software WebGL, so frame rate and LCP here are not a real device's.

## Judgment (fill in after looking at the screenshots and using the site yourself)

- **The idea in one sentence** ("[product] as [thing or place]"):
- **Structure** (chapters, what stays on screen between them, named layout per section):
- **Palette** (from the colours above: canvas / ink / accent, and the accent's share):
- **Type** (display + body, sizes, tracking; the move that makes it):
- **Motion** (what follows scroll, what follows the pointer, durations measured by frame, easing feel; label anything seen only in stills as *inference*):
- **3D / media** (what the canvas or video is doing, quality, fallback on phone):
- **Phone** (recomposed or shrunk? what changes?):
- **Sound** (opt-in at the door? none?):
- **Signature details** (2-3 hand-made moments):
- **What to take** (structure, rhythm, hierarchy, choreography, a technique):
- **Never take** (logo, brand, copy, photos, illustrations, models, fonts we have no licence for, code without a licence):
- **Where it goes in our skills** (e.g. \`motion-and-scroll-storytelling\` §4, a component):
`;
  fs.writeFileSync(path.join(out, 'TEARDOWN.md'), card);
}
console.log(`teardown written: ${out}/TEARDOWN.md + teardown.json + ${report.sizes.desktop.shots.filter((s) => s.endsWith('.jpg')).length + report.sizes.phone.shots.filter((s) => s.endsWith('.jpg')).length} screenshots`);
console.log(JSON.stringify({ libs: report.sizes.desktop.libs, fonts: report.sizes.desktop.fonts, palette: report.sizes.desktop.palette.backgrounds.slice(0, 3), screens: report.sizes.desktop.pageScreens, kb: report.sizes.desktop.totalKB }));
