#!/usr/bin/env node
// qa-harness: one command that checks every page of a static site the way a picky
// reviewer would, at 1440x900, 390x844 and 360x740 plus a reduced-motion pass.
// MIT licence, Zyqor Studio. See README.md.
//
//   node qa.mjs ./site                 test a folder (served on a local port for you)
//   node qa.mjs https://example.com    test a live site (crawls same-origin links)
//   node qa.mjs ./site --pages lab/hush/,about.html --full
//
// Exit code: 0 = VERDICT PASS, 1 = VERDICT FAIL, 2 = the harness itself could not run.
import fs from 'node:fs';
import path from 'node:path';
import { serveDir } from './lib/server.mjs';
import { openBrowser } from './lib/browser.mjs';
import { walkHtml, toPages, crawl, staticRefs, isSkippable } from './lib/pages.mjs';
import { initProbe, webglProbe, overflowProbe, outlineSelectors, stuckRevealProbe, contentProbe, frameProbe } from './lib/probes.mjs';
import { pixelDiff } from './lib/diff.mjs';
import { writeReports } from './lib/report.mjs';

const VERSION = '1.0.0';
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

export const PROFILES = {
  desktop:         { label: 'Desktop 1440', w: 1440, h: 900, dpr: 1, mobile: false, build: 'desktop' },
  phone:           { label: 'Phone 390',    w: 390,  h: 844, dpr: 2, mobile: true, ua: IPHONE_UA, build: 'phone' },
  small:           { label: 'Small 360',    w: 360,  h: 740, dpr: 2, mobile: true, ua: ANDROID_UA, build: 'phone' },
  reduced:         { label: 'Reduced motion 1440', w: 1440, h: 900, dpr: 1, mobile: false, reduced: true, build: 'desktop' },
  'reduced-phone': { label: 'Reduced motion 390',  w: 390,  h: 844, dpr: 2, mobile: true, ua: IPHONE_UA, reduced: true, build: 'phone' },
  nowebgl:         { label: 'No WebGL 1440', w: 1440, h: 900, dpr: 1, mobile: false, noWebGL: true, build: 'desktop' },
};
const DEFAULT_PROFILES = ['desktop', 'phone', 'small', 'reduced'];

// ---------- arguments ----------
function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const [k, v] = a.slice(2).split('=');
    const bool = ['full', 'external', 'gpu', 'headed', 'strict', 'include-underscore', 'help', 'quiet', 'no-newtab-rule', 'webkit'].includes(k);
    o[k] = bool ? (v === undefined ? true : v !== 'false') : (v ?? argv[++i]);
  }
  return o;
}
const HELP = `qa-harness ${VERSION}
Usage: node qa.mjs <folder|url> [options]
  --pages a,b         only these paths (relative to the site root)
  --out DIR           report folder (default ./qa-report)
  --profiles LIST     ${Object.keys(PROFILES).join(', ')}  (default ${DEFAULT_PROFILES.join(',')})
  --full              every profile + CPU-throttle smoke on every page
  --throttle MODE     first | all | off   CPU-throttle smoke run (default first)
  --shots N           scroll screenshots per run (default 4)
  --wait MS           settle time after load (default 1500)
  --external          also fetch external links (slow; some sites wall bots)
  --phone-file NAME   phone build file next to index.html (default m.html; "" to disable)
  --preset zyqor      stricter house rules: emoji/lorem and external links without target=_blank FAIL
  --strict            warnings also fail the verdict
  --chrome PATH       use this Chrome/Chromium binary
  --cdp URL           use a remote browser (CDP websocket or http endpoint) instead of a local one
  --remote browserbase  create a Browserbase session (needs BROWSERBASE_API_KEY, BROWSERBASE_PROJECT_ID; URL targets only)
  --gpu               use the real GPU (default: software WebGL, same result on every machine)
  --webkit            run the phone profiles in WebKit (Safari's engine) instead of Chromium
                      (needs: npx playwright install webkit; the throttle run stays in Chromium)
  --max-pages N       crawl limit for URL targets (default 30)
  --config FILE       JSON config (default: qa.config.json in the site folder or the current folder)`;

function loadConfig(o, siteDir) {
  const cands = [o.config, siteDir && path.join(siteDir, 'qa.config.json'), 'qa.config.json'].filter(Boolean);
  for (const c of cands) if (fs.existsSync(c)) { try { return { file: c, ...JSON.parse(fs.readFileSync(c, 'utf8')) }; } catch (e) { throw new Error(`Bad JSON in ${c}: ${e.message}`); } }
  return {};
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const slugOf = p => (p === '/' || p === '' ? 'home' : p.replace(/\/$/, '').replace(/\.html?$/, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '')) || 'home';
const log = (...a) => { if (!globalThis.__quiet) console.log(...a); };

// A fresh, isolated browser context per run. Cloud browsers reached over CDP often
// allow only their one default context; there the page is emulated over CDP instead
// (size, pixel ratio, touch, user agent, reduced motion) and only the page is closed.
async function openPage(browser, prof, opts) {
  if (!opts.remote) {
    const ctx = await browser.newContext({
      viewport: { width: prof.w, height: prof.h }, deviceScaleFactor: prof.dpr, isMobile: prof.mobile, hasTouch: prof.mobile,
      userAgent: prof.ua, reducedMotion: prof.reduced ? 'reduce' : 'no-preference', ignoreHTTPSErrors: true,
    });
    const pg = await ctx.newPage();
    return { ctx, pg, done: () => ctx.close().catch(() => {}) };
  }
  const ctx = browser.contexts()[0] || await browser.newContext();
  const pg = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: prof.w, height: prof.h, deviceScaleFactor: prof.dpr, mobile: !!prof.mobile });
  await cdp.send('Emulation.setTouchEmulationEnabled', prof.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  if (prof.ua) await cdp.send('Emulation.setUserAgentOverride', { userAgent: prof.ua });
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: prof.reduced ? 'reduce' : 'no-preference' }] });
  return { ctx, pg, done: async () => { await cdp.detach().catch(() => {}); await pg.close().catch(() => {}); } };
}

// ---------- one page at one profile ----------
async function runOne(browser, base, page, profName, prof, opts, outDir) {
  const rel = prof.build === 'phone' ? page.phone : page.desktop;
  const url = new URL(rel.replace(/^\//, ''), base).href;
  const slug = slugOf(page.path);
  const R = { profile: profName, label: prof.label, viewport: `${prof.w}x${prof.h}`, url, finalUrl: null, status: null,
    console: [], warnings: [], pageErrors: [], failedRequests: [], httpErrors: [], overflow: null, webgl: null,
    content: null, stuck: [], idleMotion: null, shots: [], notes: [] };
  const { ctx, pg, done } = await openPage(browser, prof, opts);
  try {
    await pg.addInitScript(initProbe);
    if (prof.noWebGL) await pg.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (t, ...r) { return /webgl/i.test(String(t)) ? null : orig.call(this, t, ...r); };
    });
    const ignore = (opts.ignore || []).map(s => new RegExp(s, 'i'));
    const ign = t => ignore.some(r => r.test(t));
    pg.on('console', m => {
      const t = m.type(), txt = m.text().slice(0, 400);
      if (ign(txt)) return;
      const loc = m.location?.(); const where = loc?.url ? ` (${loc.url.split('/').slice(-1)[0]}:${loc.lineNumber})` : '';
      // Messages the browser's own GPU layer prints (not your code) are kept apart.
      if (/GL Driver Message|Automatic fallback to software WebGL|WebGL-0x[0-9a-f]+\]|GroupMarkerNotSet/i.test(txt)) { (R.browserNotes ||= []).length < 5 && R.browserNotes.push(txt.slice(0, 160)); return; }
      if (t === 'error') R.console.push(txt + where); else if (t === 'warning') R.warnings.push(txt + where);
    });
    pg.on('pageerror', e => {
      const t = (e.message || String(e)).slice(0, 400);
      const at = /(?:https?:\/\/[^\s)]+\/)?([^/\s)]+):(\d+):\d+/.exec(String(e.stack || '').split('\n').slice(1).join('\n'));
      if (!ign(t)) R.pageErrors.push(t + (at ? ` (${at[1]}:${at[2]})` : ''));
    });
    pg.on('response', r => { if (r.status() >= 400 && !ign(r.url())) R.httpErrors.push(`${r.status()} ${r.url()}`); });
    pg.on('requestfailed', r => { const f = r.failure()?.errorText || 'failed'; if (!ign(r.url()) && !ign(f)) R.failedRequests.push(`${f} ${r.url()}`); });

    const t0 = Date.now();
    try {
      const resp = await pg.goto(url, { waitUntil: 'load', timeout: opts.timeout });
      R.status = resp ? resp.status() : null;
    } catch (e) { R.notes.push('load: ' + e.message.split('\n')[0]); }
    R.loadMs = Date.now() - t0;
    try { await pg.waitForLoadState('networkidle', { timeout: 5000 }); } catch {}
    await sleep(opts.wait);
    R.finalUrl = pg.url();

    // Idle motion under reduced motion: does the page still move on its own?
    if (prof.reduced) {
      try {
        const a = await pg.screenshot({ type: 'png' }); await sleep(1200); const b = await pg.screenshot({ type: 'png' });
        const d = await pixelDiff(ctx, a, b);
        R.idleMotion = d.percent; R.idleBox = d.box;
        if (d.image && d.percent > 2) {
          const f = `shots/${slug}__${profName}__idle-motion.jpg`;
          fs.writeFileSync(path.join(outDir, f), Buffer.from(d.image.split(',')[1], 'base64'));
          R.idleEvidence = f;
        }
      } catch (e) { R.notes.push('idle diff: ' + e.message.split('\n')[0]); }
    }
    const shot = async (name, q = 70) => {
      const f = `shots/${slug}__${profName}__${name}.jpg`;
      try { await pg.screenshot({ path: path.join(outDir, f), type: 'jpeg', quality: q }); R.shots.push(f); } catch (e) { R.notes.push(`shot ${name}: ${e.message.split('\n')[0]}`); }
      return f;
    };
    await shot('00top', 72);

    // Scroll the whole page like a person would, checking width at every stop.
    const vh = prof.h;
    let H = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight).catch(() => 0);
    const steps = Math.min(opts.maxSteps, Math.max(0, Math.ceil(H / (vh * 0.85))));
    const shotAt = new Set(Array.from({ length: Math.min(opts.shots, steps) }, (_, i) => Math.round((i + 1) * steps / Math.min(opts.shots, steps))));
    await pg.evaluate(() => { if (window.__qa) window.__qa.clsLoad = window.__qa.cls; }).catch(() => {});
    let worst = null;
    const checkWidth = async () => {
      const o = await pg.evaluate(overflowProbe).catch(() => null);
      if (o && (!worst || (o.overflowing && (!worst.overflowing || o.scrollWidth > worst.scrollWidth)) || (!worst.overflowing && o.totalCulprits > worst.totalCulprits))) {
        o.atScrollY = await pg.evaluate(() => Math.round(scrollY)); worst = o;
      }
    };
    await checkWidth();
    for (let i = 1; i <= steps; i++) {
      H = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight).catch(() => H);
      const y = Math.round(H * i / steps);
      if (!prof.mobile && !prof.reduced) {
        let cur = await pg.evaluate(() => scrollY).catch(() => y), d = y - cur, guard = 0;
        while (Math.abs(d) > 4 && guard++ < 60) { const s = Math.sign(d) * Math.min(Math.abs(d), 240); await pg.mouse.wheel(0, s); d -= s; await sleep(28); }
      } else {
        await pg.evaluate(y => window.scrollTo(0, y), y).catch(() => {});
      }
      await sleep(opts.stepWait);
      await checkWidth();
      if (shotAt.has(i)) await shot('s' + String(i).padStart(2, '0'), 55);
    }
    R.steps = steps;
    await sleep(400);
    R.stuck = await pg.evaluate(stuckRevealProbe).catch(() => []);
    R.content = await pg.evaluate(contentProbe).catch(e => ({ error: e.message }));
    R.webgl = await pg.evaluate(webglProbe).catch(() => null);
    if (worst) {
      R.overflow = worst;
      if (worst.culprits.length) {
        try {
          const box = await pg.evaluate(outlineSelectors, worst.culprits.slice(0, 3).map(c => c.selector));
          await sleep(250);
          const y = Math.max(0, box.top - 90), h = Math.min(Math.max(box.bottom - box.top + 180, 360), 1100, box.scrollHeight - y);
          const f = `shots/${slug}__${profName}__overflow.jpg`;
          await pg.screenshot({ path: path.join(outDir, f), type: 'jpeg', quality: 75, fullPage: true, clip: { x: 0, y, width: Math.min(box.scrollWidth, box.vw * 3), height: h } });
          R.shots.push(f); R.overflow.evidence = f;
        } catch (e) { R.notes.push('overflow shot: ' + e.message.split('\n')[0]); }
      }
    }
  } finally { await done(); }
  return judge(R, opts);
}

// ---------- rules: what fails and what only warns ----------
function judge(R, opts) {
  const fail = [], warn = [];
  if (R.status && R.status >= 400) fail.push(`page answered HTTP ${R.status}`);
  if (!R.status && R.notes.some(n => n.startsWith('load:'))) fail.push('page did not load: ' + R.notes.find(n => n.startsWith('load:')).slice(6, 120));
  for (const e of R.pageErrors) fail.push('uncaught error: ' + e);
  for (const e of R.console) fail.push('console error: ' + e);
  for (const e of R.httpErrors) fail.push('HTTP ' + e);
  for (const e of R.failedRequests) (/ERR_ABORTED/.test(e) ? warn : fail).push('request ' + e);
  const o = R.overflow;
  if (o?.overflowing) {
    const c = o.culprits[0];
    const short = s => s.split(' > ').slice(-2).join(' > ');
    fail.push(`horizontal overflow: page is ${o.scrollWidth}px wide in a ${o.viewport}px viewport` + (c ? ` — ${short(c.selector)} sticks out ${c.past}px` : '') + (o.fixAt ? `; fix at ${short(o.fixAt.selector)}` : ''));
  } else if (o?.masked && o.culprits.length) {
    warn.push(`content wider than the screen is hidden by overflow-x on html/body (${o.culprits[0].selector}, ${o.culprits[0].past}px past) — iOS can still pan sideways`);
  }
  const c = R.content || {};
  for (const b of c.broken || []) fail.push('broken image: ' + b);
  if (c.noAltCount) warn.push(`${c.noAltCount} image(s) without alt text`);
  if (R.stuck?.length) warn.push(`${R.stuck.length} text block(s) still invisible after a full scroll (stuck reveal?): "${R.stuck[0].text}"`);
  for (const w of R.warnings.slice(0, 5)) warn.push('console warning: ' + w);
  if (R.warnings.length > 5) warn.push(`+${R.warnings.length - 5} more console warnings`);
  if (c.cls > 0.1) warn.push(`layout shift while loading: CLS ${c.cls} (over 0.1)`);
  const gl = R.webgl;
  if (gl && gl.pageRequests?.some(r => !r.ok) && (gl.webgl1 || gl.webgl2) && !R.profile.startsWith('nowebgl')) fail.push('the page asked for WebGL and got none although the browser supports it');
  if (R.profile === 'nowebgl' && R.pageErrors.some(e => /webgl/i.test(e))) fail.push('no-WebGL fallback missing: the page throws when WebGL is unavailable (old phones, blocked GPUs, battery saver). Wrap the renderer creation in try/catch and show the poster image instead');
  if (R.profile.startsWith('reduced')) {
    if (c.reduced === false) warn.push('prefers-reduced-motion did not match (browser setting not applied)');
    if (c.endless?.length) warn.push(`endless animation still running with reduced motion: ${c.endless.slice(0, 3).join(', ')}`);
    if (R.idleMotion != null && R.idleMotion > 2) warn.push(`the screen keeps moving on its own with reduced motion (${R.idleMotion}% of pixels changed in 1.2 s${R.idleBox ? `, in the area ${R.idleBox.left}-${R.idleBox.right}% across, ${R.idleBox.top}-${R.idleBox.bottom}% down` : ''}; see ${R.idleEvidence || 'the screenshots'})`);
  }
  const zy = opts.preset === 'zyqor';
  if (c.emoji?.length) (zy ? fail : warn).push('emoji in page text: ' + c.emoji.join(' '));
  if (c.lorem) (zy ? fail : warn).push('placeholder text (lorem ipsum / TODO / {{ }}) in the page');
  R.fail = fail; R.warn = warn;
  R.verdict = fail.length || (opts.strict && warn.length) ? 'FAIL' : 'PASS';
  return R;
}

// ---------- CPU-throttle smoke ----------
async function throttleRun(browser, base, page, opts) {
  const prof = PROFILES.phone;
  const url = new URL(page.phone.replace(/^\//, ''), base).href;
  const { ctx, pg, done } = await openPage(browser, prof, opts);
  const T = { path: page.path, url, rate: 4, errors: 0 };
  try {
    await pg.addInitScript(initProbe);
    pg.on('pageerror', () => T.errors++);
    pg.on('console', m => { if (m.type() === 'error') T.errors++; });
    const cdp = await ctx.newCDPSession(pg);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const t0 = Date.now();
    try { await pg.goto(url, { waitUntil: 'load', timeout: opts.timeout * 2 }); } catch (e) { T.note = e.message.split('\n')[0]; }
    T.loadMs = Date.now() - t0;
    await sleep(opts.wait);
    T.frames = await pg.evaluate(frameProbe, 4000).catch(e => ({ error: e.message.split('\n')[0] }));
    const lt = await pg.evaluate(() => (window.__qa && window.__qa.longtasks) || []).catch(() => []);
    T.longTasks = { count: lt.length, totalMs: lt.reduce((a, b) => a + b, 0), worstMs: lt.length ? Math.max(...lt) : 0 };
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }).catch(() => {});
  } finally { await done(); }
  T.warn = [];
  if (T.errors) T.warn.push(`${T.errors} error(s) during the throttled run`);
  if (T.frames?.medianMs > 50) T.warn.push(`median frame ${T.frames.medianMs} ms while scrolling at 4x CPU slowdown`);
  if (T.longTasks.worstMs > 1000) T.warn.push(`a ${T.longTasks.worstMs} ms long task blocks the page at 4x slowdown`);
  return T;
}

// ---------- links ----------
async function checkLinks(base, siteDir, pages, runs, opts) {
  const L = { internal: { checked: 0, broken: [] }, anchors: { checked: 0, missing: [] }, external: { found: 0, checked: 0, broken: [], walled: [], ok: 0 }, newTab: [] };
  const origin = new URL(base).origin;
  const internal = new Map(); // url -> Set(from)
  const external = new Map();
  const idsByUrl = new Map();
  const add = (map, u, from) => { if (!map.has(u)) map.set(u, new Set()); map.get(u).add(from); };
  // DOM links from every run (JS-built menus included).
  for (const r of runs) {
    const c = r.content; if (!c?.links) continue;
    const pageUrl = (r.finalUrl || r.url).split('#')[0];
    idsByUrl.set(pageUrl, new Set(c.ids));
    for (const l of c.links) {
      if (isSkippable(l.raw) && !(l.raw || '').startsWith('#')) continue;
      let u; try { u = new URL(l.href); } catch { continue; }
      if (!/^https?:$/.test(u.protocol)) continue;
      if (u.origin === origin) {
        if (u.hash && u.hash.length > 1) { const k = u.href.split('#')[0]; add(internal, k + '#' + decodeURIComponent(u.hash.slice(1)), r.url); }
        else add(internal, u.href.split('#')[0], r.url);
      } else {
        add(external, u.href, r.url);
        if (l.target !== '_blank' && !opts.noNewtab) L.newTab.push({ from: r.url.replace(origin, ''), href: u.href, text: l.text });
      }
    }
  }
  // Static refs (assets: scripts, styles, images, video posters) from the HTML files.
  if (siteDir) {
    for (const p of pages) for (const f of new Set([p.desktop, p.phone])) {
      const file = path.join(siteDir, f.endsWith('/') || f === '' ? f + 'index.html' : f);
      if (!fs.existsSync(file)) continue;
      const pageUrl = new URL(f, base).href;
      for (const ref of staticRefs(fs.readFileSync(file, 'utf8'))) {
        if (isSkippable(ref.url)) continue;
        let u; try { u = new URL(ref.url, pageUrl); } catch { continue; }
        if (!/^https?:$/.test(u.protocol)) continue;
        if (u.origin === origin) add(internal, u.href.split('#')[0].split('?')[0], pageUrl);
        else if (ref.tag === 'a') add(external, u.href, pageUrl);
      }
    }
  }
  // Check internal URLs over HTTP (works for a folder and for a live site).
  const cache = new Map();
  const get = async u => {
    if (cache.has(u)) return cache.get(u);
    let s = 0;
    try { const r = await fetch(u, { method: 'GET', headers: { Range: 'bytes=0-0' }, redirect: 'follow', signal: AbortSignal.timeout(15000) }); s = r.status; try { await r.body?.cancel(); } catch {} } catch { s = 0; }
    cache.set(u, s); return s;
  };
  const items = [...internal.entries()];
  for (let i = 0; i < items.length; i += 8) {
    await Promise.all(items.slice(i, i + 8).map(async ([u, from]) => {
      const [doc, id] = u.split('#');
      if (id !== undefined) {
        L.anchors.checked++;
        const ids = idsByUrl.get(doc) || idsByUrl.get(doc.replace(/index\.html$/, ''));
        if (ids && !ids.has(id) && id !== 'top') L.anchors.missing.push({ url: u.replace(origin, ''), from: [...from].map(f => f.replace(origin, '')).slice(0, 3) });
        return;
      }
      L.internal.checked++;
      const s = await get(doc);
      if (!(s >= 200 && s < 400)) L.internal.broken.push({ url: doc.replace(origin, ''), status: s || 'no answer', from: [...from].map(f => f.replace(origin, '')).slice(0, 3) });
    }));
  }
  // Same link without target=_blank reported once.
  const seenNT = new Set(); L.newTab = L.newTab.filter(n => { const k = n.from + n.href; if (seenNT.has(k)) return false; seenNT.add(k); return true; });
  L.external.found = external.size;
  if (opts.external) {
    const WALL = [401, 403, 405, 429, 999];
    const ext = [...external.keys()];
    for (let i = 0; i < ext.length; i += 6) {
      await Promise.all(ext.slice(i, i + 6).map(async u => {
        let s = 0;
        try { const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36', Range: 'bytes=0-0' }, redirect: 'follow', signal: AbortSignal.timeout(15000) }); s = r.status; try { await r.body?.cancel(); } catch {} } catch { s = 0; }
        L.external.checked++;
        if (s >= 200 && s < 400) L.external.ok++;
        else if (WALL.includes(s)) L.external.walled.push({ url: u, status: s });
        else L.external.broken.push({ url: u, status: s || 'no answer', from: [...external.get(u)].map(f => f.replace(origin, '')).slice(0, 3) });
      }));
    }
  }
  return L;
}

// ---------- main ----------
export async function main(argv = process.argv.slice(2)) {
  const o = parseArgs(argv);
  if (o.help || !o._[0]) { console.log(HELP); return o.help ? 0 : 2; }
  globalThis.__quiet = !!o.quiet;
  const target = o._[0];
  const isUrl = /^https?:\/\//.test(target);
  const siteDir = isUrl ? null : path.resolve(target);
  if (siteDir && !fs.existsSync(siteDir)) { console.error(`No such folder: ${siteDir}`); return 2; }
  const cfg = loadConfig(o, siteDir);
  const opts = {
    out: path.resolve(o.out || cfg.out || 'qa-report'),
    profiles: (o.full ? Object.keys(PROFILES) : (o.profiles ? String(o.profiles).split(',') : cfg.profiles || DEFAULT_PROFILES)).map(s => s.trim()).filter(Boolean),
    throttle: o.full ? 'all' : (o.throttle || cfg.throttle || 'first'),
    shots: Number(o.shots ?? cfg.shots ?? 4), wait: Number(o.wait ?? cfg.wait ?? 1500), stepWait: Number(o['step-wait'] ?? cfg.stepWait ?? 650),
    maxSteps: Number(o['max-steps'] ?? cfg.maxSteps ?? 40), timeout: Number(o.timeout ?? cfg.timeout ?? 45000),
    external: !!(o.external || cfg.external), ignore: cfg.ignore || [], preset: o.preset || cfg.preset || null,
    strict: !!(o.strict || cfg.strict), remote: !!(o.cdp || cfg.cdp || o.remote || cfg.remote), noNewtab: !!(o['no-newtab-rule'] || cfg.noNewtabRule),
    phoneFile: o['phone-file'] ?? cfg.phoneFile ?? 'm.html',
  };
  for (const p of opts.profiles) if (!PROFILES[p]) { console.error(`Unknown profile "${p}". Known: ${Object.keys(PROFILES).join(', ')}`); return 2; }
  fs.mkdirSync(path.join(opts.out, 'shots'), { recursive: true });
  for (const f of fs.readdirSync(path.join(opts.out, 'shots'))) fs.rmSync(path.join(opts.out, 'shots', f));

  let server = null, base, pages;
  let cdp = o.cdp || cfg.cdp || null, closeRemote = null;
  try {
    if (isUrl) {
      base = target.endsWith('/') ? target : target.replace(/[^/]*$/, '') || target + '/';
      const want = o.pages || cfg.pages;
      pages = want ? (Array.isArray(want) ? want : String(want).split(',')).map(p => p.trim()).map(p => ({ path: p || '/', desktop: p, phone: p })) : await crawl(target, Number(o['max-pages'] || cfg.maxPages || 30));
    } else {
      server = await serveDir(siteDir);
      base = server.url;
      const files = walkHtml(siteDir, { includeUnderscore: !!o['include-underscore'] });
      let all = toPages(files, opts.phoneFile);
      const want = o.pages || cfg.pages;
      if (want) {
        const list = (Array.isArray(want) ? want : String(want).split(',')).map(s => s.trim().replace(/^\.?\//, ''));
        all = list.map(w => all.find(p => p.path === w || p.desktop === w || p.path === w + '/' || (w.endsWith('index.html') && p.path === w.replace(/index\.html$/, ''))) || { path: w, desktop: w, phone: w });
      }
      pages = all;
    }
    if (!pages.length) { console.error('No pages found to test.'); return 2; }
    if ((o.remote || cfg.remote) === 'browserbase') {
      if (!isUrl) { console.error('A remote browser cannot reach a folder on this machine. Deploy a preview and pass its URL, or drop --remote.'); return 2; }
      const { createSession } = await import('./adapters/browserbase.mjs');
      const s = await createSession(); cdp = s.connectUrl; closeRemote = s.close;
    }
    const { browser, how, pw } = await openBrowser({ chrome: o.chrome || cfg.chrome, cdp, gpu: !!o.gpu, headed: !!o.headed });
    let wk = null;
    if (o.webkit || cfg.webkit) {
      try { wk = await (pw.webkit || pw.default?.webkit).launch({ headless: !o.headed }); }
      catch (e) { await browser.close(); console.error('WebKit could not start: ' + e.message.split('\n')[0] + '\nFix: npx playwright install webkit'); return 2; }
    }
    const started = new Date();
    log(`qa-harness ${VERSION}: ${pages.length} page(s) x ${opts.profiles.length} profile(s) on ${how}`);
    const results = { tool: 'qa-harness', version: VERSION, target, base: isUrl ? base : `${path.relative(process.cwd(), siteDir) || '.'} (served locally)`, startedAt: started.toISOString(),
      browser: { how, version: browser.version(), webkit: null }, profiles: opts.profiles.map(p => ({ id: p, ...PROFILES[p] })), options: { ...opts, out: undefined }, pages: [], throttle: [] };
    const runs = [];
    try {
      for (const page of pages) {
        const entry = { path: page.path, desktop: page.desktop, phone: page.phone, runs: {} };
        for (const pn of opts.profiles) {
          const t = Date.now();
          let R;
          const useWk = wk && PROFILES[pn].mobile;
          try { R = await runOne(useWk ? wk : browser, base, page, pn, useWk ? { ...PROFILES[pn], label: PROFILES[pn].label + ' WebKit' } : PROFILES[pn], { ...opts, remote: useWk ? false : opts.remote }, opts.out); }
          catch (e) { R = judge({ profile: pn, label: PROFILES[pn].label, url: page.path, console: [], warnings: [], pageErrors: [], failedRequests: [], httpErrors: [], stuck: [], shots: [], notes: ['harness: ' + e.message.split('\n')[0]], status: null }, opts); R.fail.push('harness could not test this page: ' + e.message.split('\n')[0]); R.verdict = 'FAIL'; }
          R.ms = Date.now() - t;
          entry.runs[pn] = R; runs.push(R);
          log(`  ${R.verdict === 'PASS' ? 'PASS' : 'FAIL'}  ${(R.label || PROFILES[pn].label).padEnd(20)} ${page.path}${R.fail.length ? '  — ' + R.fail[0].slice(0, 200) : ''}${R.warn.length ? `  (${R.warn.length} warning${R.warn.length > 1 ? 's' : ''})` : ''}`);
        }
        entry.verdict = Object.values(entry.runs).some(r => r.verdict === 'FAIL') ? 'FAIL' : 'PASS';
        results.pages.push(entry);
        fs.writeFileSync(path.join(opts.out, 'results.json'), JSON.stringify(results, null, 1));
      }
      if (opts.throttle !== 'off') {
        for (const page of opts.throttle === 'all' ? pages : pages.slice(0, 1)) {
          try { const T = await throttleRun(browser, base, page, opts); results.throttle.push(T); log(`  smoke 4x CPU  ${page.path}: ${T.frames?.fps ?? '?'} fps, median frame ${T.frames?.medianMs ?? '?'} ms, load ${T.loadMs} ms${T.warn.length ? '  — ' + T.warn[0] : ''}`); }
          catch (e) { results.throttle.push({ path: page.path, error: e.message.split('\n')[0], warn: [] }); }
        }
      }
      log('  checking links...');
      results.links = await checkLinks(base, siteDir, pages, runs, opts);
      results.webglEnv = runs.find(r => r.webgl)?.webgl ? { webgl2: runs.find(r => r.webgl).webgl.webgl2, renderer: runs.find(r => r.webgl).webgl.renderer } : null;
    } finally {
      if (wk) { results.browser.webkit = wk.version(); await wk.close().catch(() => {}); }
      await browser.close().catch(() => {});
      if (closeRemote) await closeRemote().catch(() => {});
    }
    results.finishedAt = new Date().toISOString();
    const verdict = writeReports(results, opts);
    log(`\n${verdict.line}\nReport: ${path.join(opts.out, 'report.md')}  ·  contact sheet: ${path.join(opts.out, 'report.html')}`);
    return verdict.pass ? 0 : 1;
  } finally { if (server) await server.close(); }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('qa.mjs')) {
  main().then(code => process.exit(code), e => { console.error('qa-harness could not run: ' + (e.stack || e.message)); process.exit(2); });
}
