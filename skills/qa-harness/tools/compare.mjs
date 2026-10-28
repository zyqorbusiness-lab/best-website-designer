#!/usr/bin/env node
// Same model on phone? Capture the desktop build and the phone build of one page,
// crop the 3D element (or the screen), and put them side by side with a close-up
// row, in one JPEG. Proof that the phone shows the same model and textures, only
// compressed — not a cheaper stand-in.
//
//   node tools/compare.mjs ./site --desktop lab/hush/index.html --phone lab/hush/m.html --selector canvas
//   node tools/compare.mjs https://example.com --desktop / --phone /m/ --scroll 0.4 --out hush-compare.jpg
import path from 'node:path';
import fs from 'node:fs';
import { serveDir } from '../lib/server.mjs';
import { openBrowser } from '../lib/browser.mjs';

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : undefined; };
const VALUED = new Set(['desktop', 'phone', 'selector', 'scroll', 'wait', 'zoom', 'out', 'chrome', 'focus-desktop', 'focus-phone']);
const target = args.find((a, i) => !a.startsWith('--') && !(i > 0 && VALUED.has(args[i - 1].slice(2))));
if (!target || args.includes('--help')) {
  console.log('Usage: node tools/compare.mjs <folder|url> --desktop PATH --phone PATH [--selector CSS] [--scroll 0..1] [--wait MS] [--zoom 0.35]\n         [--focus-desktop cx,cy,size] [--focus-phone cx,cy,size] [--out compare.jpg] [--chrome PATH]\n  --focus-*: the close-up region as fractions of each capture (centre x, centre y, size of the shorter side),\n  e.g. --focus-desktop 0.62,0.55,0.3 when the model sits right of centre on desktop. Default: 0.5,0.5,zoom.');
  process.exit(target ? 0 : 2);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const isUrl = /^https?:\/\//.test(target);
const server = isUrl ? null : await serveDir(path.resolve(target));
const base = isUrl ? (target.endsWith('/') ? target : target + '/') : server.url;
const dPath = opt('desktop') ?? '', pPath = opt('phone') ?? dPath;
const sel = opt('selector'), scroll = opt('scroll') != null ? Number(opt('scroll')) : null, wait = Number(opt('wait') ?? 4000);
const zoom = Number(opt('zoom') ?? 0.35), out = path.resolve(opt('out') ?? 'compare.jpg');
const focus = s => { const [cx = 0.5, cy = 0.5, sz = zoom] = String(s || '').split(',').filter(Boolean).map(Number); return { cx, cy, sz }; };
const fD = focus(opt('focus-desktop')), fP = focus(opt('focus-phone'));
const { browser } = await openBrowser({ chrome: opt('chrome'), gpu: args.includes('--gpu') });

async function capture(rel, phone) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  try {
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errors.push(e.message));
    const url = new URL(rel.replace(/^\//, ''), base).href;
    await pg.goto(url, { waitUntil: 'load', timeout: 60000 });
    if (scroll != null) await pg.evaluate(f => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), scroll);
    else if (sel) await pg.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center' }), sel);
    await sleep(wait);
    let buf, box = null;
    if (sel) {
      const el = await pg.$(sel);
      box = el ? await el.boundingBox() : null;
      if (box) {
        const vp = pg.viewportSize();
        const clip = { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(box.width, vp.width - Math.max(0, box.x)), height: Math.min(box.height, vp.height - Math.max(0, box.y)) };
        buf = await pg.screenshot({ type: 'png', clip });
        box = clip;
      }
    }
    if (!buf) buf = await pg.screenshot({ type: 'png' });
    const dpr = phone ? 3 : 1;
    return { buf, url: pg.url(), css: box ? `${Math.round(box.width)}x${Math.round(box.height)} css px` : 'full screen', px: box ? `${Math.round(box.width * dpr)}x${Math.round(box.height * dpr)} device px` : '', errors };
  } finally { await ctx.close(); }
}

try {
  const d = await capture(dPath, false);
  const p = await capture(pPath, true);
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const b64 = b => 'data:image/png;base64,' + b.toString('base64');
  await pg.setContent(`<!doctype html><html><body style="margin:0;background:#F4F1EA;font:600 15px/1.3 ui-sans-serif,system-ui,sans-serif;color:#1E2A2B">
  <div id="w" style="padding:28px;display:inline-block">
   <div style="font-size:22px;letter-spacing:-.01em;margin-bottom:14px">Same model, desktop vs phone${sel ? ` · <code style="font-size:15px">${sel}</code>` : ''}</div>
   <div style="display:flex;gap:24px;align-items:flex-start">
     <figure style="margin:0"><img id="a" style="height:520px;display:block;border-radius:12px;box-shadow:0 0 0 1px rgba(0,0,0,.12)"><figcaption style="margin-top:8px">Desktop 1440 · ${d.css}<br><span style="opacity:.6;font-weight:500">${d.url}</span></figcaption></figure>
     <figure style="margin:0"><img id="b" style="height:520px;display:block;border-radius:12px;box-shadow:0 0 0 1px rgba(0,0,0,.12)"><figcaption style="margin-top:8px">Phone 390 @3x · ${p.css} · ${p.px}<br><span style="opacity:.6;font-weight:500">${p.url}</span></figcaption></figure>
   </div>
   <div style="margin:22px 0 10px">Close-up (${opt('focus-desktop') || opt('focus-phone') ? 'chosen region' : `centre ${Math.round(zoom * 100)}%`} of each, scaled to the same size, no smoothing: more visible pixels = sharper)</div>
   <div style="display:flex;gap:24px"><canvas id="ca" width="560" height="560" style="border-radius:12px"></canvas><canvas id="cb" width="560" height="560" style="border-radius:12px"></canvas></div>
   ${d.errors.length || p.errors.length ? `<p style="color:#B3361B">Page errors: ${[...d.errors, ...p.errors].map(e => e.slice(0, 120)).join(' · ')}</p>` : ''}
  </div></body></html>`);
  await pg.evaluate(async ([a, b, fa, fb]) => {
    const load = (id, src) => new Promise(r => { const i = document.getElementById(id); i.onload = () => r(i); i.src = src; });
    const [ia, ib] = await Promise.all([load('a', a), load('b', b)]);
    for (const [img, id, f] of [[ia, 'ca', fa], [ib, 'cb', fb]]) {
      const c = document.getElementById(id), g = c.getContext('2d');
      const W = img.naturalWidth, H = img.naturalHeight, s = Math.min(W, H) * f.sz;
      const x = Math.max(0, Math.min(W - s, f.cx * W - s / 2)), y = Math.max(0, Math.min(H - s, f.cy * H - s / 2));
      g.imageSmoothingEnabled = false;
      g.drawImage(img, x, y, s, s, 0, 0, c.width, c.height);
    }
  }, [b64(d.buf), b64(p.buf), fD, fP]);
  const el = await pg.$('#w');
  await el.screenshot({ path: out, type: 'jpeg', quality: 85 });
  await ctx.close();
  console.log(`Wrote ${out}${d.errors.length || p.errors.length ? ' (page errors noted on the image)' : ''}`);
} finally {
  await browser.close();
  if (server) await server.close();
}
