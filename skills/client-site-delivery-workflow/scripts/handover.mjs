#!/usr/bin/env node
// handover.mjs: build the handover note for a finished site from what is actually there.
// Reads the site folder (pages, credit files, fonts, third-party scripts), the brief, optional QA / gate reports, and
// checks the live URL(s) (status, sitemap.xml, robots.txt, security headers). Writes HANDOVER.md.
// Usage: node handover.mjs <site-folder> --url https://live.example [--url https://mirror.example] [--brief brief.json] [--name "Business"]
//        [--reports dir-with-json] [--out HANDOVER.md]
// No install, Node 18+ (uses fetch). MIT, Zyqor Studio 2026.
import fs from 'node:fs'; import path from 'node:path';
const a = process.argv.slice(2);
const root = path.resolve(a.find((x, i) => !x.startsWith('--') && !(a[i - 1] || '').startsWith('--')) || '.');
const all = (k) => a.flatMap((x, i) => (x === k ? [a[i + 1]] : []));
const opt = (k, d) => all(k)[0] ?? d;
const urls = all('--url'); const out = opt('--out', path.join(root, '..', 'HANDOVER.md'));
const brief = opt('--brief') && fs.existsSync(opt('--brief')) ? JSON.parse(fs.readFileSync(opt('--brief'), 'utf8')) : null;
const SKIP = new Set(['node_modules', '.git', '_template', '_kit', '_test']);
const pages = [], credits = [], fonts = new Set(), thirdParty = new Set();
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP.has(e.name)) continue; const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    const r = path.relative(root, p).split(path.sep).join('/');
    if (e.name.endsWith('.html')) {
      pages.push(r); const h = fs.readFileSync(p, 'utf8');
      for (const m of h.matchAll(/<script\b[^>]*src=["'](https?:\/\/[^"']+)/gi)) { try { thirdParty.add(new URL(m[1]).hostname); } catch {} }
      for (const m of h.matchAll(/<link\b[^>]*href=["'](https?:\/\/[^"']+)/gi)) { try { const hn = new URL(m[1]).hostname; if (/font|typekit|fontshare/.test(hn)) thirdParty.add(hn); } catch {} }
    }
    if (e.name.endsWith('.credit.json') || e.name === 'credit.json') { try { const c = JSON.parse(fs.readFileSync(p, 'utf8')); credits.push({ file: r.replace(/\.credit\.json$|\/credit\.json$/, ''), ...c }); } catch {} }
    if (/\.(woff2?|ttf|otf)$/i.test(e.name)) fonts.add(e.name.replace(/[-_.](subset|latin|var|wght|regular|bold|italic).*$/i, '').replace(/\.(woff2?|ttf|otf)$/i, ''));
  }
})(root);
const byLic = {}; for (const c of credits) byLic[c.licence] = (byLic[c.licence] || 0) + 1;
const attributionNeeded = [...new Set(credits.filter((c) => /BY/.test(c.licence || '')).map((c) => `${c.title} by ${c.author} (${c.licence})`))];
const live = [];
for (const u of urls) {
  const row = { url: u };
  try {
    const r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(20000) }); row.status = r.status;
    row.headers = ['strict-transport-security', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'x-frame-options', 'content-security-policy'].filter((h) => r.headers.get(h));
    const base = new URL(u); base.pathname = '/';
    for (const f of ['sitemap.xml', 'robots.txt']) { try { const x = await fetch(new URL(f, base), { signal: AbortSignal.timeout(15000) }); row[f] = x.status; } catch { row[f] = 'no answer'; } }
  } catch (e) { row.status = 'no answer: ' + e.message.slice(0, 60); }
  live.push(row);
}
const reports = [];
if (opt('--reports') && fs.existsSync(opt('--reports'))) for (const f of fs.readdirSync(opt('--reports'))) if (f.endsWith('.json')) {
  try { const j = JSON.parse(fs.readFileSync(path.join(opt('--reports'), f), 'utf8')); reports.push({ file: f, verdict: j.verdict || (j.errors === 0 ? 'PASS' : j.errors ? 'FAIL' : 'see file'), errors: j.errors ?? null }); } catch {}
}
const today = new Date().toISOString().slice(0, 10);
const md = `# Handover: ${opt('--name') || brief?.client?.business || path.basename(path.resolve(root, '..'))}

Date: ${today}. Prepared from the files and the live site, not from memory.

## Live
${live.length ? live.map((l) => `- ${l.url}: HTTP ${l.status}; sitemap.xml ${l['sitemap.xml'] ?? '-'}; robots.txt ${l['robots.txt'] ?? '-'}; security headers: ${(l.headers || []).join(', ') || 'none seen'}`).join('\n') : '- (no URL given)'}

## What was built
- Pages (${pages.length}): ${pages.slice(0, 40).join(', ')}${pages.length > 40 ? ', ...' : ''}
${brief ? `- Tier: ${brief.tier}; primary action: ${brief.primary_action}; languages: ${(brief.languages || []).join(', ')}` : ''}

## Assets and licences
- Credit files: ${credits.length}. By licence: ${Object.entries(byLic).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}.
- Attribution that must stay visible on the site (CC BY): ${attributionNeeded.length ? '\n  - ' + attributionNeeded.slice(0, 30).join('\n  - ') : 'none'}
- Font files shipped: ${[...fonts].join(', ') || 'none (system fonts or a font service)'}. Each font's licence is in CREDITS.md.
- Third-party hosts loaded by pages: ${[...thirdParty].join(', ') || 'none'}.

## Checks run before handover
${reports.length ? reports.map((r) => `- ${r.file}: ${r.verdict}${r.errors != null ? ` (${r.errors} errors)` : ''}`).join('\n') : '- QA, accessibility, SEO, copy, security and credit reports: attach their JSON with --reports'}

## What the client owns and controls
- [ ] Code: GitHub repository transferred to the client (Settings > Transfer ownership) or the client added as admin.
- [ ] Hosting: project on the client's own hosting account (Vercel Hobby is for non-commercial use under Vercel's terms; a business site needs a plan or host that allows commercial use).
- [ ] Domain: registered in the client's name; DNS records documented below.
- [ ] Google Search Console: client added as Owner; sitemap submitted.
- [ ] Analytics / forms: accounts in the client's name; form notifications go to the client's inbox.
- [ ] No passwords in this document or in the repository.

## How to change things
- Text and images: edit the HTML files listed above (or ask the studio); keep each image's .credit.json beside it.
- After any change: run the QA command in README and check the live site at 1440 and 390 px.

## Support
- Fix window: bugs reported within the agreed period after launch are fixed without charge (period as agreed in the quote).
- Contact: the studio's WhatsApp / email from the quote.
`;
fs.writeFileSync(out, md);
console.log(`wrote ${out}: ${pages.length} pages, ${credits.length} credit files, ${live.length} live URLs checked`);
for (const l of live) console.log(`  ${l.url} -> ${l.status}, sitemap ${l['sitemap.xml']}, robots ${l['robots.txt']}`);
