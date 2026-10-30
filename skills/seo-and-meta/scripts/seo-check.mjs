#!/usr/bin/env node
// seo-check.mjs: static SEO + sharing audit of a website folder (no install, Node 18+).
// Per page: lang, charset, viewport, title, meta description, one H1, canonical (and phone-variant canonicals),
// Open Graph + Twitter tags, og:image file size and pixel size, JSON-LD validity, robots meta, img alt.
// Site: robots.txt with an absolute Sitemap line, sitemap.xml well-formed with every <loc> resolving to a file,
// duplicate titles / descriptions, canonical pages missing from the sitemap.
// Usage: node seo-check.mjs <site-folder> [--base https://example.com] [--skip _template,_kit] [--json out.json] [--quiet]
// Exit 1 when any ERROR is found (warnings do not fail). MIT, Zyqor Studio 2026.
import fs from 'node:fs'; import path from 'node:path';
const a = process.argv.slice(2);
const ROOT = path.resolve(a.find((x) => !x.startsWith('--') && !a[a.indexOf(x) - 1]?.startsWith('--')) || '.');
const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const SKIP = new Set(['node_modules', '.git', 'vendor', ...(opt('--skip', '_template,_kit,_test,_assets,_data') || '').split(',').filter(Boolean)]);
const QUIET = a.includes('--quiet');
let BASE = opt('--base', null);

const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) pages.push(p);
  }
})(ROOT);

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')); return m ? (m[2] ?? m[3] ?? m[4]) : null; };
const metas = (html) => [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
const metaContent = (html, key) => { for (const t of metas(html)) { const n = (attr(t, 'name') || attr(t, 'property') || '').toLowerCase(); if (n === key) return attr(t, 'content'); } return null; };
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, 'x').replace(/\s+/g, ' ').trim();
const isPhoneVariant = (r) => /(^|\/)m\.html$/.test(r) || /^m\/index\.html$/.test(r);
const isErrorPage = (r) => /(^|\/)(404|500)\.html$/.test(r);

function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), type: 'png' };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1]; const len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5), type: 'jpeg' };
      i += 2 + len;
    }
  }
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const c = b.toString('ascii', 12, 16);
    if (c === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3), type: 'webp' };
    if (c === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff, type: 'webp' };
  }
  return null;
}
function localFileForUrl(u, fromRel) {
  // map an absolute URL on BASE, a root-relative or a relative URL to a file in ROOT
  let p = u;
  if (/^https?:\/\//i.test(u)) { if (!BASE || !u.startsWith(BASE)) return null; p = u.slice(BASE.length); if (!p.startsWith('/')) p = '/' + p; }
  p = p.split('#')[0].split('?')[0];
  let f = p.startsWith('/') ? path.join(ROOT, p) : path.join(ROOT, path.dirname(fromRel), p);
  if (p.endsWith('/')) f = path.join(f, 'index.html');
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  return f;
}

const issues = []; const add = (level, page, msg) => issues.push({ level, page, msg });
const seenTitle = new Map(), seenDesc = new Map(); const canonicals = new Map();

// infer BASE from the home page canonical / og:url if not given
if (!BASE) { const home = path.join(ROOT, 'index.html'); if (fs.existsSync(home)) { const h = fs.readFileSync(home, 'utf8'); const c = h.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i); BASE = (c && attr(c[0], 'href')) || metaContent(h, 'og:url'); if (BASE) BASE = BASE.replace(/\/+$/, ''); } }

for (const file of pages) {
  const r = rel(file); const html = fs.readFileSync(file, 'utf8');
  if (/http-equiv=["']refresh/i.test(html) && html.length < 1500) { add('info', r, 'redirect page, skipped'); continue; }
  const err = isErrorPage(r) ? 'warn' : 'error';
  const head = (html.match(/<head\b[\s\S]*?<\/head>/i) || [''])[0];
  if (!/<html\b[^>]*\blang=/i.test(html)) add('error', r, '<html> has no lang attribute');
  if (!/<meta\b[^>]*charset/i.test(head)) add('warn', r, 'no <meta charset>');
  if (!/name=["']viewport/i.test(head)) add('error', r, 'no viewport meta');
  const t = head.match(/<title>([\s\S]*?)<\/title>/i); const title = t ? strip(t[1]) : '';
  if (!title) add(err, r, 'missing <title>');
  else { if (title.length < 25 || title.length > 65) add('warn', r, `title is ${title.length} chars (aim 30-60): "${title.slice(0, 70)}"`); if (!isPhoneVariant(r)) seenTitle.set(title, [...(seenTitle.get(title) || []), r]); }
  const desc = metaContent(head, 'description');
  if (!desc) add(err, r, 'missing meta description');
  else { if (desc.length < 70 || desc.length > 170) add('warn', r, `meta description is ${desc.length} chars (aim 120-160)`); if (!isPhoneVariant(r)) seenDesc.set(desc, [...(seenDesc.get(desc) || []), r]); }
  const h1 = (html.match(/<h1\b/gi) || []).length;
  if (h1 === 0) add(err, r, 'no <h1>'); else if (h1 > 1) add('warn', r, `${h1} <h1> elements (use one)`);
  const robots = (metaContent(head, 'robots') || '').toLowerCase(); const noindex = robots.includes('noindex');
  if (noindex) add('info', r, 'meta robots noindex (left out of the sitemap check)');
  const c = head.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i); const canon = c ? attr(c[0], 'href') : null;
  if (!canon) add(isErrorPage(r) || noindex ? 'info' : 'warn', r, 'no rel=canonical');
  else {
    if (!/^https:\/\//.test(canon)) add('warn', r, `canonical is not an absolute https URL: ${canon}`);
    if (isPhoneVariant(r)) { if (/m\.html$/.test(canon) || /\/m\/$/.test(canon)) add('warn', r, 'phone variant canonical points at itself; point it at the desktop URL (separate-URL setup)'); }
    else if (!noindex && !isErrorPage(r)) canonicals.set(r, canon);
  }
  if (!isPhoneVariant(r) && !isErrorPage(r)) {
    const alt = [...head.matchAll(/<link\b[^>]*rel=["']alternate["'][^>]*>/gi)].map((m) => m[0]).find((x) => attr(x, 'media'));
    const dir = path.dirname(file); const sib = r.endsWith('index.html') ? path.join(dir, 'm.html') : null;
    if (sib && fs.existsSync(sib) && !alt) add('warn', r, 'has a phone variant (m.html) but no <link rel="alternate" media="only screen and (max-width: 640px)">');
  }
  for (const k of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']) if (!metaContent(head, k)) add(isErrorPage(r) ? 'info' : 'warn', r, `missing ${k}`);
  if (!metaContent(head, 'twitter:card')) add(isErrorPage(r) ? 'info' : 'warn', r, 'missing twitter:card');
  const og = metaContent(head, 'og:image');
  if (og) {
    if (!/^https?:\/\//.test(og)) add('error', r, `og:image must be an absolute URL: ${og}`);
    const f = localFileForUrl(og, r);
    if (f && fs.existsSync(f)) {
      const s = imageSize(f); const kb = Math.round(fs.statSync(f).size / 1024);
      if (s && (s.w < 1200 || s.h < 630)) add('warn', r, `og:image is ${s.w}x${s.h}; use 1200x630`);
      if (s && Math.abs(s.w / s.h - 1.91) > 0.12) add('warn', r, `og:image ratio ${(s.w / s.h).toFixed(2)}:1; aim 1.91:1`);
      if (kb > 600) add('warn', r, `og:image is ${kb} KB; keep it lean (JPEG 100-300 KB)`);
    } else if (f) add('error', r, `og:image file not found in the folder: ${og}`);
  }
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const j = JSON.parse(m[1]); const arr = Array.isArray(j) ? j : (j['@graph'] || [j]); if (!(j['@context'] || arr[0]?.['@context'])) add('error', r, 'JSON-LD without @context'); if (!arr.every((x) => x['@type'])) add('error', r, 'JSON-LD item without @type'); }
    catch (e) { add('error', r, 'JSON-LD does not parse: ' + e.message.slice(0, 80)); }
  }
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) if (attr(m[0], 'alt') === null) add('error', r, `<img> without alt: ${(attr(m[0], 'src') || '').slice(0, 60)}`);
}
for (const [t, ps] of seenTitle) if (ps.length > 1) add('warn', ps[0], `title shared by ${ps.length} pages: ${ps.slice(0, 4).join(', ')}`);
for (const [d, ps] of seenDesc) if (ps.length > 1) add('warn', ps[0], `description shared by ${ps.length} pages: ${ps.slice(0, 4).join(', ')}`);

// robots + sitemap
const robotsF = path.join(ROOT, 'robots.txt'); const smF = path.join(ROOT, 'sitemap.xml');
if (!fs.existsSync(robotsF)) add('error', 'robots.txt', 'missing robots.txt');
else {
  const t = fs.readFileSync(robotsF, 'utf8');
  if (!/^sitemap:\s*https?:\/\//im.test(t)) add('error', 'robots.txt', 'no absolute "Sitemap: https://..." line');
  if (/^disallow:\s*\/\s*$/im.test(t)) add('error', 'robots.txt', '"Disallow: /" blocks the whole site');
}
if (!fs.existsSync(smF)) add('error', 'sitemap.xml', 'missing sitemap.xml');
else {
  const x = fs.readFileSync(smF, 'utf8');
  if (!/^<\?xml/.test(x.trim()) || !/<urlset\b[^>]*sitemaps\.org\/schemas\/sitemap\/0\.9/.test(x)) add('error', 'sitemap.xml', 'not a sitemaps.org 0.9 urlset');
  const locs = [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!locs.length) add('error', 'sitemap.xml', 'no <loc> entries');
  if (locs.length > 50000) add('error', 'sitemap.xml', 'more than 50,000 URLs in one file');
  if (/&(?!amp;|lt;|gt;|quot;|apos;)/.test(x)) add('error', 'sitemap.xml', 'unescaped & in sitemap');
  for (const l of locs) {
    if (!/^https?:\/\//.test(l)) { add('error', 'sitemap.xml', `relative <loc>: ${l}`); continue; }
    const f = localFileForUrl(l, 'index.html');
    if (f && !fs.existsSync(f)) add('error', 'sitemap.xml', `<loc> has no file: ${l}`);
  }
  for (const [r, canon] of canonicals) if (BASE && canon.startsWith(BASE) && !locs.includes(canon)) add('warn', r, `canonical URL not in sitemap.xml: ${canon}`);
}

const errors = issues.filter((i) => i.level === 'error'), warns = issues.filter((i) => i.level === 'warn');
const out = { root: ROOT, base: BASE, pages: pages.length, errors: errors.length, warnings: warns.length, issues };
if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(out, null, 1));
if (!QUIET) for (const i of issues.filter((i) => i.level !== 'info')) console.log(`${i.level.toUpperCase().padEnd(5)} ${i.page}: ${i.msg}`);
const byMsg = {}; for (const i of [...errors, ...warns]) { const k = i.level + ' ' + i.msg.replace(/(: |").*$/, '').replace(/\d+/g, 'N'); byMsg[k] = (byMsg[k] || 0) + 1; }
console.log('\nSummary by kind:'); for (const [k, n] of Object.entries(byMsg).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${k}`);
console.log(`\n${pages.length} pages, base ${BASE || '(unknown)'}: ${errors.length} errors, ${warns.length} warnings`);
console.log(errors.length ? 'VERDICT: FAIL' : 'VERDICT: PASS');
process.exit(errors.length ? 1 : 0);
