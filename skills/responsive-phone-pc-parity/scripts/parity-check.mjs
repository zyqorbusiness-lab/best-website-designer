#!/usr/bin/env node
// parity-check.mjs: load a URL at the desktop + phone viewport matrix and report what breaks parity.
// Usage: node parity-check.mjs <url> [--out dir] [--sizes 1440x900,390x844,...] [--cta "selector"] [--json report.json]
// Needs Playwright: `npm i -D playwright` (or set PLAYWRIGHT=/path/to/playwright-core/index.mjs and CHROME=/path/to/chrome).
// Exit code 1 when any size has: horizontal overflow, console errors, text < 12px, tap targets < 44px, inputs < 16px,
// or (with --cta) the CTA outside the first screen. MIT, Zyqor Studio.
import fs from 'node:fs';
const args = process.argv.slice(2); const url = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
if (!url) { console.error('usage: node parity-check.mjs <url> [--out dir] [--sizes WxH,...] [--cta selector] [--json file]'); process.exit(2); }
const SIZES = opt('sizes', '1920x1080,1440x900,1280x800,1024x768,768x1024,430x932,390x844,375x667,360x740,844x390').split(',').map((s) => s.split('x').map(Number));
const out = opt('out', 'parity-shots'); fs.mkdirSync(out, { recursive: true });
const cta = opt('cta', null); const jsonOut = opt('json', null);
let pw; try { pw = await import(process.env.PLAYWRIGHT || 'playwright'); } catch { console.error('Playwright not found: npm i -D playwright (or set PLAYWRIGHT)'); process.exit(2); }
const chromium = pw.chromium || pw.default?.chromium;
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const report = []; let bad = 0;
for (const [w, h] of SIZES) {
  const phone = w < 768 || (h < 500 && w < 1000);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone });
  const page = await ctx.newPage(); const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text())); page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' }).catch((e) => errors.push('goto: ' + e.message));
  await page.waitForTimeout(800);
  const r = await page.evaluate(({ cta }) => {
    const vw = document.documentElement.clientWidth, vh = innerHeight; const vis = (el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && b.width > 0 && b.height > 0 && !el.closest('[aria-hidden="true"]'); };
    const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '');
    const overflow = document.documentElement.scrollWidth > vw + 1;
    const culprits = overflow ? [...document.querySelectorAll('body *')].filter((el) => { const b = el.getBoundingClientRect(); return b.right > vw + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('[data-overflow-ok]'); }).slice(0, 8).map((el) => name(el) + ' right=' + Math.round(el.getBoundingClientRect().right)) : [];
    const small = []; const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) { const t = walker.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; if (!vis(el)) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 12) small.push(name(el) + ' ' + fs + 'px'); }
    const targets = [...document.querySelectorAll('a[href],button,input,select,textarea,[role=button],summary')].filter(vis).filter((el) => {
      const b = el.getBoundingClientRect(); const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p,li'); return !inline && (b.width < 44 || b.height < 44); }).map((el) => name(el) + ' ' + Math.round(el.getBoundingClientRect().width) + 'x' + Math.round(el.getBoundingClientRect().height));
    const inputs = [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=range]),select,textarea')].filter(vis).filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16).map(name);
    let ctaOk = null; if (cta) { const el = document.querySelector(cta); if (!el) ctaOk = false; else { scrollTo(0, 0); const b = el.getBoundingClientRect(); ctaOk = b.top >= 0 && b.bottom <= vh && b.left >= 0 && b.right <= vw; } }
    return { overflow, culprits, small: [...new Set(small)].slice(0, 10), targets: targets.slice(0, 10), inputs, ctaOk };
  }, { cta });
  await page.screenshot({ path: `${out}/${w}x${h}.jpg`, type: 'jpeg', quality: 70 });
  const fails = []; if (r.overflow) fails.push('overflow'); if (errors.length) fails.push('console'); if (r.small.length) fails.push('small-text');
  if (phone && r.targets.length) fails.push('small-targets'); if (phone && r.inputs.length) fails.push('input<16px'); if (r.ctaOk === false) fails.push('cta-below-fold');
  if (fails.length) bad++;
  report.push({ size: `${w}x${h}`, phone, fails, ...r, errors });
  console.log(`${String(w + 'x' + h).padEnd(10)} ${fails.length ? 'FAIL ' + fails.join(',') : 'ok'}${r.culprits.length ? '  overflow: ' + r.culprits.join('; ') : ''}${phone && r.targets.length ? '  targets: ' + r.targets.slice(0, 3).join('; ') : ''}${errors.length ? '  errors: ' + errors.slice(0, 2).join(' | ') : ''}`);
  await ctx.close();
}
await browser.close();
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2));
console.log(bad ? `PARITY FAIL at ${bad} size(s); screenshots in ${out}/` : `PARITY OK at ${SIZES.length} sizes; screenshots in ${out}/`);
process.exit(bad ? 1 : 0);
