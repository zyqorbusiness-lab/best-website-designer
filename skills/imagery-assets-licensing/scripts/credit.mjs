#!/usr/bin/env node
// credit.mjs: write and check asset credit files (the same keys and licence allow-list as the repo gate tools/credits-check.mjs).
//   node credit.mjs new <asset> --title T --author A --author-url U --source URL --licence "CC0 1.0" [--licence-url U] [--changes C] [--attribution A] [--verified]
//   node credit.mjs check <dir>        validate every asset under <dir>; exit 1 on a missing or invalid credit
// MIT, Zyqor Studio.
import fs from 'node:fs'; import path from 'node:path';
const KEYS = ['title', 'author', 'author_url', 'source_url', 'licence', 'licence_url', 'attribution', 'changes', 'downloaded'];
const EXT = new Set(['.glb', '.gltf', '.bin', '.hdr', '.exr', '.jpg', '.jpeg', '.png', '.webp', '.avif', '.ktx2', '.woff2', '.woff', '.ttf', '.otf', '.mp4', '.webm', '.mov', '.mp3', '.ogg', '.wav', '.m4a', '.svg', '.gif']);
const ALLOW = [/^CC0 1\.0$/, /^CC BY 4\.0$/, /^CC BY 3\.0$/, /^SIL OFL 1\.1$/, /^MIT$/, /^Apache 2\.0$/, /^Public domain \((NASA|Smithsonian)\)$/];
const VERIFY_ONLY = [/^Unsplash License$/, /^Pexels License$/];
const REVIEW = [/^ITF Free Font License/, /^Mixkit /, /^CC BY-SA /, /^CC BY 3\.0 US$/, /^All rights reserved \(own work\)$/];
const LICENCE_URL = { 'CC0 1.0': 'https://creativecommons.org/publicdomain/zero/1.0/', 'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/', 'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/', 'SIL OFL 1.1': 'https://openfontlicense.org', 'MIT': 'https://opensource.org/license/mit', 'Apache 2.0': 'https://www.apache.org/licenses/LICENSE-2.0', 'Unsplash License': 'https://unsplash.com/license', 'Pexels License': 'https://www.pexels.com/license/' };
const [cmd, target, ...rest] = process.argv.slice(2);
const opt = (k) => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : undefined; };
const verdict = (c) => {
  if (!c) return 'unreadable';
  const miss = KEYS.filter((k) => !c[k] || !String(c[k]).trim()); if (miss.length) return 'missing ' + miss.join(',');
  if (ALLOW.some((r) => r.test(c.licence))) return 'ok';
  if (VERIFY_ONLY.some((r) => r.test(c.licence))) return c.verified === true ? 'ok' : 'needs "verified": true after checking the photo page';
  if (REVIEW.some((r) => r.test(c.licence))) return 'review';
  return 'licence not on the allow-list: ' + c.licence;
};
if (cmd === 'new') {
  if (!target || !fs.existsSync(target)) { console.error('asset not found: ' + target); process.exit(2); }
  const lic = opt('licence'); const c = { title: opt('title'), author: opt('author'), author_url: opt('author-url'), source_url: opt('source'), licence: lic, licence_url: opt('licence-url') || LICENCE_URL[lic],
    attribution: opt('attribution') || `"${opt('title')}" by ${opt('author')} (${opt('source')}), ${lic}`, changes: opt('changes') || 'none', downloaded: new Date().toISOString().slice(0, 10), file: path.basename(target) };
  if (rest.includes('--verified')) c.verified = true;
  const v = verdict(c); const out = target.replace(/\.part\d+$/i, '') + '.credit.json';
  fs.writeFileSync(out, JSON.stringify(c, null, 1) + '\n'); console.log(`${out}: ${v}`); process.exit(v === 'ok' || v === 'review' ? 0 : 1);
} else if (cmd === 'check') {
  const files = []; const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name.startsWith('.') || ['node_modules', 'vendor'].includes(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (EXT.has(path.extname(e.name.replace(/\.part\d+$/i, '')).toLowerCase())) files.push(p); } };
  walk(target || '.'); let bad = 0, review = 0;
  for (const f of files) {
    const side = f.replace(/\.part\d+$/i, '') + '.credit.json', folder = path.join(path.dirname(f), 'credit.json');
    const p = fs.existsSync(side) ? side : fs.existsSync(folder) ? folder : null;
    let c; try { c = p && JSON.parse(fs.readFileSync(p, 'utf8')); } catch { c = undefined; }
    const v = p ? verdict(c) : 'no credit file';
    if (v === 'review') review++; else if (v !== 'ok') { bad++; console.log(`FAIL ${f}: ${v}`); }
  }
  console.log(`${files.length} assets, ${bad} failing, ${review} on review licences`); process.exit(bad ? 1 : 0);
} else { console.error('usage: credit.mjs new <asset> --title ... | credit.mjs check <dir>'); process.exit(2); }
