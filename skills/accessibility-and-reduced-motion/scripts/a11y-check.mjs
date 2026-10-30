#!/usr/bin/env node
// a11y-check.mjs: automated accessibility pass for a page or a static folder, at 1440x900 and 390x844.
// Reports: text contrast failures (with the colours and the ratio), images without alt, controls and links without an
// accessible name, form fields without labels, heading-level jumps / missing h1, missing <main> / lang, targets under
// 24x24 px (WCAG 2.5.8; under 44 px on touch is a warning), focusables with no visible focus indicator (real Tab key
// presses), viewport zoom blocked, and infinite animations still running under prefers-reduced-motion.
// Usage: node a11y-check.mjs <url | folder> [--pages index.html,about/index.html] [--json out.json] [--max 12]
// Needs Playwright: `npm i -D playwright` (or PLAYWRIGHT=/path/to/playwright-core/index.mjs and CHROME=/path/to/chrome).
// Exit 1 when any FAIL is found. Automated checks catch part of WCAG only: do the keyboard and screen-reader passes too.
// MIT, Zyqor Studio 2026.
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http';
const args = process.argv.slice(2);
const target = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
if (!target) { console.error('usage: node a11y-check.mjs <url|folder> [--pages a.html,b.html] [--json out.json]'); process.exit(2); }
const MAX = +opt('max', 12);
let pw; try { pw = await import(process.env.PLAYWRIGHT || 'playwright'); } catch { console.error('Playwright not found: npm i -D playwright (or set PLAYWRIGHT)'); process.exit(2); }
const chromium = pw.chromium || pw.default?.chromium;

let server = null; let urls = [];
if (/^https?:\/\//.test(target)) urls = (opt('pages') ? opt('pages').split(',').map((p) => new URL(p, target).href) : [target]);
else {
  const root = path.resolve(target);
  const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.mp4': 'video/mp4' };
  server = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p); if (!f.startsWith(root)) { r.writeHead(403); r.end(); return; } fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  urls = (opt('pages', 'index.html')).split(',').map((p) => base + p);
}

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const SIZES = [['desktop', 1440, 900, false], ['phone', 390, 844, true]];
const report = []; let fails = 0;

function inPage({ max, touch }) {
  const out = { fail: [], warn: [] };
  const F = (k, m) => out.fail.push(k + ': ' + m), Wn = (k, m) => out.warn.push(k + ': ' + m);
  const vis = (el) => { const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const srOnly = (el) => { const r = el.getBoundingClientRect(); return r.width <= 1 && r.height <= 1; };
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  function bgOf(el) {
    const stack = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage !== 'none' || s.backdropFilter && s.backdropFilter !== 'none' || ['VIDEO', 'CANVAS', 'IMG'].includes(n.tagName)) return null; // unknown: image, glass or media behind
      const c = parse(s.backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; }
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 }; for (let i = stack.length - 1; i >= 0; i--) bg = blend(stack[i], bg); return bg;
  }
  // lang, main, viewport
  if (!document.documentElement.lang) F('lang', '<html> has no lang');
  if (!document.querySelector('main,[role=main]')) F('landmark', 'no <main>');
  const vp = (document.querySelector('meta[name=viewport]') || {}).content || '';
  if (/user-scalable\s*=\s*(no|0)/i.test(vp) || (/maximum-scale\s*=\s*([\d.]+)/i.exec(vp) || [0, 9])[1] < 2) F('zoom', 'viewport blocks zoom: ' + vp);
  // contrast
  const seen = new Set(); let cfail = 0, cunknown = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode; if (!t.nodeValue.trim()) continue; const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    if (!vis(el) || srOnly(el) || el.closest('[aria-hidden=true]')) continue;
    const s = getComputedStyle(el); const fg = parse(s.color); if (!fg || parseFloat(s.fontSize) < 1) continue;
    if (fg.a === 0 || (s.webkitTextFillColor && /rgba\(0, 0, 0, 0\)|transparent/.test(s.webkitTextFillColor))) { cunknown++; continue; }
    const bg = bgOf(el); if (!bg) { cunknown++; continue; }
    const size = parseFloat(s.fontSize), bold = +s.fontWeight >= 700; const large = size >= 24 || (bold && size >= 18.66);
    const r = ratio(blend(fg, bg), bg); const need = large ? 3 : 4.5;
    if (r + 0.005 < need) { cfail++; if (cfail <= max) F('contrast', `${r.toFixed(2)}:1 < ${need} "${t.nodeValue.trim().slice(0, 40)}" (${s.color} on rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)}), ${size}px)`); }
  }
  if (cfail > max) F('contrast', `${cfail - max} more`);
  if (cunknown) Wn('contrast', `${cunknown} text blocks sit on images, glass or media: check those by eye or with the screenshot`);
  // images
  for (const img of document.querySelectorAll('img')) if (!img.hasAttribute('alt')) F('alt', 'img without alt: ' + (img.getAttribute('src') || '').slice(0, 60));
  for (const svg of document.querySelectorAll('svg[role=img]')) if (!svg.getAttribute('aria-label') && !svg.querySelector('title') && !svg.getAttribute('aria-labelledby')) F('name', 'svg role=img without a name');
  // names
  const name = (el) => (el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') || '').split(' ').map((i) => (document.getElementById(i) || {}).textContent || '').join(' ') || el.textContent || el.getAttribute('title') || [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join(' ') || el.value || '').trim();
  let nfail = 0;
  for (const el of document.querySelectorAll('a[href],button,[role=button],[role=link],[role=tab],[role=menuitem],summary')) { if (!vis(el)) continue; if (!name(el)) { nfail++; if (nfail <= max) F('name', `${el.tagName.toLowerCase()} without an accessible name: ${el.outerHTML.slice(0, 80)}`); } }
  for (const el of document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea')) {
    if (!vis(el) && el.type !== 'radio' && el.type !== 'checkbox') continue;
    const lab = (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.closest('label') || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title');
    if (!lab) F('label', `${el.tagName.toLowerCase()}[${el.type || ''}] without a label: ${el.name || el.id || ''}`);
  }
  // headings
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]);
  if (!hs.includes(1)) F('headings', 'no h1');
  for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) { F('headings', `h${hs[i - 1]} followed by h${hs[i]} (skipped level)`); break; }
  // targets: WCAG 2.5.8 minimum 24x24, with its inline and spacing exceptions; 44 on touch is Zyqor's own bar (warning)
  let tfail = 0, twarn = 0; const T = [];
  for (const el of document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[tabindex]:not([tabindex="-1"])')) {
    if (!vis(el)) continue; const s = getComputedStyle(el);
    if (el.tagName === 'A' && s.display === 'inline' && el.closest('p,li,td,dd,figcaption,blockquote')) continue; // inline text links are exempt
    const lab = el.closest('label'); const r = (lab || el).getBoundingClientRect(); T.push({ el, r });
  }
  const small = (t) => t.r.width < 24 || t.r.height < 24;
  const circleHits = (c, r) => { const dx = Math.max(r.left - c.x, 0, c.x - r.right), dy = Math.max(r.top - c.y, 0, c.y - r.bottom); return dx * dx + dy * dy < 144; };
  for (const t of T) {
    const w = t.r.width, h = t.r.height, nm = (name(t.el) || t.el.outerHTML).slice(0, 50);
    if (small(t)) {
      const c = { x: t.r.left + w / 2, y: t.r.top + h / 2 };
      const clash = T.some((o) => o !== t && (circleHits(c, o.r) || (small(o) && Math.hypot(c.x - (o.r.left + o.r.width / 2), c.y - (o.r.top + o.r.height / 2)) < 24)));
      if (clash) { tfail++; if (tfail <= max) F('target', `${Math.round(w)}x${Math.round(h)} < 24x24 and too close to another target: ${nm}`); }
      else if (touch) { twarn++; if (twarn <= max) Wn('target', `${Math.round(w)}x${Math.round(h)} passes WCAG by spacing only; < 44x44 on touch: ${nm}`); }
    } else if (touch && (w < 44 || h < 44)) { twarn++; if (twarn <= max) Wn('target', `${Math.round(w)}x${Math.round(h)} < 44x44 on touch: ${nm}`); }
  }
  return out;
}

for (const url of urls) for (const [label, w, h, touch] of SIZES) {
  for (const motion of label === 'desktop' ? ['no-preference', 'reduce'] : ['no-preference']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: touch, hasTouch: touch, deviceScaleFactor: touch ? 2 : 1, reducedMotion: motion });
    const page = await ctx.newPage(); const res = { url, size: label, motion, fail: [], warn: [] };
    await page.goto(url, { waitUntil: 'load', timeout: 45000 }).catch((e) => res.fail.push('load: ' + e.message.slice(0, 120)));
    await page.waitForTimeout(900);
    if (motion === 'reduce') {
      const inf = await page.evaluate(() => (document.getAnimations ? document.getAnimations() : []).filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity).map((a) => (a.effect.target && (a.effect.target.id || a.effect.target.className || a.effect.target.tagName)) + ' ' + (a.animationName || '')).slice(0, 8));
      for (const x of inf) res.warn.push('reduced-motion: infinite animation still running: ' + String(x).slice(0, 80));
    } else {
      const r = await page.evaluate(inPage, { max: MAX, touch }); res.fail.push(...r.fail); res.warn.push(...r.warn);
      // focus ring: real Tab presses on the first focusables
      let noRing = 0; const seenF = new Set();
      for (let i = 0; i < 14; i++) {
        await page.keyboard.press('Tab');
        const f = await page.evaluate(() => {
          const el = document.activeElement; if (!el || el === document.body) return null;
          const st = (e) => { const s = getComputedStyle(e); return [s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 ? s.outlineStyle + s.outlineWidth + s.outlineColor : '', s.boxShadow, s.backgroundColor, s.borderColor, s.textDecorationLine, s.color, s.transform].join('|'); };
          const on = st(el); const desc = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40);
          const outlineOn = /solid|dotted|dashed|double|auto/.test(getComputedStyle(el).outlineStyle) && parseFloat(getComputedStyle(el).outlineWidth) > 0;
          el.blur(); const off = st(el); el.focus({ preventScroll: true });
          return { desc, changed: on !== off || outlineOn };
        });
        if (f && !f.changed && !seenF.has(f.desc)) { seenF.add(f.desc); noRing++; if (noRing <= 6) res.fail.push(`focus: no visible focus indicator on "${f.desc}"`); }
      }
    }
    if (res.fail.length) fails++;
    report.push(res); await ctx.close();
  }
}
await browser.close(); if (server) server.close();
if (opt('json')) fs.writeFileSync(opt('json'), JSON.stringify(report, null, 1));
for (const r of report) {
  console.log(`\n${r.url} @ ${r.size}${r.motion === 'reduce' ? ' (reduced motion)' : ''}: ${r.fail.length} FAIL, ${r.warn.length} warn`);
  for (const f of r.fail) console.log('  FAIL ' + f);
  for (const w of r.warn.slice(0, 8)) console.log('  warn ' + w);
}
console.log(fails ? `\nVERDICT: FAIL (${fails} runs with failures)` : '\nVERDICT: PASS');
process.exit(fails ? 1 : 0);
