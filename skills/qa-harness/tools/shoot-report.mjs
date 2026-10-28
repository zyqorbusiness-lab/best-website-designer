#!/usr/bin/env node
// Screenshot a report.html contact sheet into a JPEG (for READMEs and hand-offs).
//   node tools/shoot-report.mjs qa-report/report.html contact-sheet.jpg
import path from 'node:path';
import { openBrowser } from '../lib/browser.mjs';
const [html, out = 'contact-sheet.jpg', width = '1500'] = process.argv.slice(2);
if (!html) { console.log('Usage: node tools/shoot-report.mjs <report.html> [out.jpg] [width]'); process.exit(2); }
const { browser } = await openBrowser({});
try {
  const ctx = await browser.newContext({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  await pg.goto('file://' + path.resolve(html), { waitUntil: 'load' });
  await pg.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
  await pg.screenshot({ path: path.resolve(out), type: 'jpeg', quality: 82, fullPage: true });
  console.log('Wrote ' + path.resolve(out));
} finally { await browser.close(); }
