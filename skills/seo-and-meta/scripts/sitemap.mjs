#!/usr/bin/env node
// sitemap.mjs: write sitemap.xml and robots.txt for a static site folder (no install, Node 18+).
// Lists every canonical page: folder index.html files become ".../" URLs, other .html files keep their name.
// Leaves out phone variants (m.html, m/index.html), error pages, noindex pages, redirect stubs and skipped folders.
// Usage: node sitemap.mjs <site-folder> --base https://example.com [--skip _template,_kit] [--lastmod 2026-10-30]
//        [--robots-extra "Disallow: /drafts/"] [--dry]
// Notes: Google ignores <priority> and <changefreq>; it uses <lastmod> only when it is consistently accurate, so lastmod
// is written only when you pass a date you can stand behind (the deploy date of a full rebuild, for example).
// MIT, Zyqor Studio 2026.
import fs from 'node:fs'; import path from 'node:path';
const a = process.argv.slice(2); const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const ROOT = path.resolve(a[0] && !a[0].startsWith('--') ? a[0] : '.');
const BASE = (opt('--base') || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(BASE)) { console.error('need --base https://your-domain'); process.exit(2); }
const SKIP = new Set(['node_modules', '.git', 'vendor', ...opt('--skip', '_template,_kit,_test,_assets,_data').split(',').filter(Boolean)]);
const LASTMOD = opt('--lastmod', null);
const urls = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((x, y) => x.name.localeCompare(y.name))) {
    if (e.name.startsWith('.') || SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.html')) continue;
    const r = path.relative(ROOT, p).split(path.sep).join('/');
    if (/(^|\/)m\.html$/.test(r) || /^m\/index\.html$/.test(r) || /(^|\/)(404|500)\.html$/.test(r)) continue;
    const html = fs.readFileSync(p, 'utf8');
    if (/<meta\b[^>]*name=["']robots["'][^>]*noindex/i.test(html)) continue;
    if (/http-equiv=["']refresh/i.test(html) && html.length < 1500) continue;
    const c = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    let u = BASE + '/' + r.replace(/(^|\/)index\.html$/, '$1');
    if (c && c[1].startsWith(BASE) && c[1] !== u) continue; // canonical points elsewhere: that other URL is the one to list
    urls.push(u);
  }
})(ROOT);
urls.sort((x, y) => (x === BASE + '/' ? -1 : y === BASE + '/' ? 1 : x.localeCompare(y)));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${esc(u)}</loc>${LASTMOD ? `<lastmod>${LASTMOD}</lastmod>` : ''}</url>`).join('\n') + `\n</urlset>\n`;
const robots = `# robots.txt for ${BASE}\nUser-agent: *\nAllow: /\n${opt('--robots-extra', '') ? opt('--robots-extra') + '\n' : ''}\nSitemap: ${BASE}/sitemap.xml\n`;
if (a.includes('--dry')) { process.stdout.write(xml + '\n' + robots); }
else { fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml); fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots); }
console.log(`${urls.length} URLs -> ${a.includes('--dry') ? '(dry run)' : path.join(ROOT, 'sitemap.xml') + ' + robots.txt'}`);
