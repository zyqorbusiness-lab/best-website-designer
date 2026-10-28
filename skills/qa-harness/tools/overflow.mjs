#!/usr/bin/env node
// Quick overflow finder for one URL at one width: which element makes the page
// scroll sideways? Prints the culprits and where to fix them.
//   node tools/overflow.mjs http://localhost:3000/gallery.html 360
//   node tools/overflow.mjs ./site gallery.html 360        (a folder is served for you)
import fs from 'node:fs';
import path from 'node:path';
import { openBrowser } from '../lib/browser.mjs';
import { overflowProbe } from '../lib/probes.mjs';
import { serveDir } from '../lib/server.mjs';

const a = process.argv.slice(2);
if (!a[0]) { console.log('Usage: node tools/overflow.mjs <url> [width=390]\n       node tools/overflow.mjs <folder> <page> [width=390]'); process.exit(2); }
let url = a[0], width = a[1] || '390', server = null;
if (!/^https?:\/\//.test(a[0]) && fs.existsSync(a[0]) && fs.statSync(a[0]).isDirectory()) {
  server = await serveDir(path.resolve(a[0]));
  url = new URL((a[1] || '').replace(/^\//, ''), server.url).href; width = a[2] || '390';
}
const w = Number(width), mobile = w < 800;
const { browser } = await openBrowser({});
let found = 0;
try {
  const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const pg = await ctx.newPage();
  await pg.goto(url, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(1500);
  const H = await pg.evaluate(() => document.documentElement.scrollHeight);
  const seen = new Set();
  for (let y = 0; y <= H; y += 400) {
    await pg.evaluate(y => scrollTo(0, y), y); await pg.waitForTimeout(250);
    const o = await pg.evaluate(overflowProbe, 8);
    if (!o) continue;
    for (const c of o.culprits) {
      if (seen.has(c.selector)) continue; seen.add(c.selector); found++;
      console.log(`${o.overflowing ? 'OVERFLOW' : 'masked  '} ${c.past}px past  ${c.selector}  (width ${c.css.width}${c.css.whiteSpace === 'nowrap' ? ', nowrap' : ''})${c.text ? '  "' + c.text + '"' : ''}`);
    }
    if (o.fixAt && !seen.has('fix:' + o.fixAt.selector)) { seen.add('fix:' + o.fixAt.selector); console.log(`  fix at ${o.fixAt.selector}: ${o.fixAt.hint}`); }
  }
  await ctx.close();
} finally { await browser.close(); if (server) await server.close(); }
console.log(found ? `${found} element(s) stick out at ${w}px.` : `No horizontal overflow at ${w}px.`);
process.exit(found ? 1 : 0);
