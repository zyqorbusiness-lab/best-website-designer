#!/usr/bin/env node
// check-links.mjs: verify every link on the portfolio before it goes live.
// "LIVE" = the page answered HTTP 2xx. "DOWNLOAD" = a file answered 2xx and its real size is shown.
// Internal links (assets, lab pages, anchors' pages) must exist on disk under site/.
// Usage: node tools/check-links.mjs            (home pages: site/index.html + site/m/index.html)
//        node tools/check-links.mjs --all      (also every Lab demo page and their credit links)
// Exit code 1 if any internal file is missing or any external link is broken.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');
const ALL = process.argv.includes('--all');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
// Hosts that wall automated requests; a 403/429 from them is reported, not counted as broken.
const WALLED = /(^|\.)(instagram\.com|wa\.me|mail\.google\.com|linkedin\.com|x\.com|twitter\.com)$/;

function pages() {
  const list = [join(SITE, 'index.html'), join(SITE, 'm', 'index.html'), join(SITE, '404.html'), join(SITE, 'privacy.html')];
  if (ALL) {
    const lab = join(SITE, 'lab');
    for (const d of existsSync(lab) ? readdirSync(lab) : []) {
      if (d.startsWith('_')) continue;
      for (const f of ['index.html', 'm.html']) { const p = join(lab, d, f); if (existsSync(p)) list.push(p); }
    }
  }
  return list.filter(p => existsSync(p));
}

const external = new Map(); // url -> Set(pages)
const missing = [];
let internalCount = 0;
for (const page of pages()) {
  const html = readFileSync(page, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, m => /type="importmap"/.test(m) ? '' : m.replace(/(src|href)=/g, 'x-$1='));
  const rel = relative(ROOT, page);
  for (const m of html.matchAll(/\s(?:href|src|poster|data-src)="([^"]+)"/g)) {
    let u = m[1].replace(/&amp;/g, '&').trim();
    if (!u || u.startsWith('#') || u.startsWith('data:') || u.startsWith('javascript:') || u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('sms:')) continue;
    if (/^https?:\/\//.test(u)) { if (!external.has(u)) external.set(u, new Set()); external.get(u).add(rel); continue; }
    const clean = decodeURIComponent(u.split('#')[0].split('?')[0]);
    if (!clean) continue;
    let target = clean.startsWith('/') ? join(SITE, clean) : join(dirname(page), clean);
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    internalCount++;
    if (!existsSync(target)) missing.push(`${rel} -> ${u}`);
  }
}

function fmt(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n >= 1024 ? Math.round(n / 1024) + ' KB' : n + ' B'; }

async function check(url) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Range: 'bytes=0-0' }, redirect: 'follow', signal: ctl.signal });
    const type = (r.headers.get('content-type') || '').split(';')[0];
    const cr = r.headers.get('content-range'); const total = cr && cr.includes('/') ? Number(cr.split('/')[1]) : Number(r.headers.get('content-length') || 0);
    try { await r.body?.cancel(); } catch {}
    const host = new URL(url).hostname;
    if (r.ok) {
      const file = !/text\/html|application\/xhtml/.test(type) && /octet-stream|android|zip|pdf|video|audio|image/.test(type);
      return { ok: true, label: file ? `DOWNLOAD ${fmt(total)} (${type})` : `LIVE ${r.status}` };
    }
    if (WALLED.test(host) && [403, 429, 999].includes(r.status)) return { ok: true, warn: true, label: `WALLED ${r.status} (bot wall; open it by hand)` };
    return { ok: false, label: `BROKEN ${r.status}` };
  } catch (e) {
    return { ok: false, label: `BROKEN (${e.name === 'AbortError' ? 'timeout 20 s' : e.message})` };
  } finally { clearTimeout(t); }
}

const urls = [...external.keys()];
const results = [];
for (let i = 0; i < urls.length; i += 6) {
  const batch = urls.slice(i, i + 6);
  results.push(...await Promise.all(batch.map(async u => ({ u, ...(await check(u)) }))));
}
let bad = 0, warn = 0;
console.log(`\nInternal links (${internalCount}): ${missing.length ? missing.length + ' MISSING' : 'all present'}`);
for (const m of missing) { console.log('  MISSING  ' + m); bad++; }
console.log(`\nExternal links (${urls.length}), checked ${new Date().toISOString()}:`);
for (const r of results.sort((a, b) => a.ok - b.ok)) {
  if (!r.ok) bad++; if (r.warn) warn++;
  console.log(`  ${r.ok ? (r.warn ? 'WARN ' : 'OK   ') : 'FAIL '} ${r.label.padEnd(44)} ${r.u}`);
}
console.log(`\n${bad ? bad + ' problem(s)' : 'All links good'}${warn ? `, ${warn} walled (check by hand)` : ''}. Note: LIVE means the page loads; it does not test what happens inside it.`);
process.exit(bad ? 1 : 0);
