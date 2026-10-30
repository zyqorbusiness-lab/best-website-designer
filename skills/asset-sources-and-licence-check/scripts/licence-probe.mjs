#!/usr/bin/env node
// licence-probe.mjs - read an asset's licence from the source's own API and print a credit.json draft.
// Supports Wikimedia Commons file pages, Poly Haven assets and ambientCG assets (the three sources with a public API).
// Anything else prints a manual checklist: open the page, read the licence yourself, fill the draft by hand.
// Usage: node licence-probe.mjs <url> [--write <asset-file>]   (Node 18+, no install)
//   --write x.webp  writes x.webp.credit.json next to the file (refuses if one exists).
// Exit code: 0 = licence on the repo allow-list, 2 = needs review or unknown, 1 = error.
import fs from 'node:fs';

const [, , url, flag, target] = process.argv;
if (!url) { console.error('usage: node licence-probe.mjs <url> [--write <asset-file>]'); process.exit(1); }
const today = new Date().toISOString().slice(0, 10);
const strip = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const UA = { 'User-Agent': 'zyqor-licence-probe/1.0 (https://github.com/zyqorbusiness-lab/best-website-designer)' };
async function json(u) { const r = await fetch(u, { headers: UA }); if (!r.ok) throw new Error(`${r.status} from ${u}`); return r.json(); }

// Same allow-list as tools/credits-check.mjs (keep the two in step).
const ALLOW = [/^CC0 1\.0$/, /^CC BY 4\.0$/, /^CC BY 3\.0$/, /^CC BY 2\.0$/, /^SIL OFL 1\.1$/, /^MIT$/, /^Apache 2\.0$/, /^Public domain \((NASA|Smithsonian|USDA|author release)\)$/];
const DEED = {
  'CC0 1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
};

// Commons writes licences many ways ("CC0", "CC BY 2.0", "Cc-by-sa-4.0", "Public domain"); map to the gate's spelling.
function normCommons(short) {
  const s = String(short || '').trim();
  if (/^cc0/i.test(s)) return 'CC0 1.0';
  const m = s.match(/^cc[ -]by[ -]([\d.]+)$/i); if (m) return `CC BY ${m[1]}`;
  if (/^cc[ -]by[ -]sa/i.test(s)) return s.replace(/^cc[ -]by[ -]sa[ -]?/i, 'CC BY-SA ').trim();
  if (/^public domain$/i.test(s)) return 'Public domain (check which: author release, USDA, NASA...)';
  return s || 'unknown';
}

async function commons(u) {
  const title = decodeURIComponent(u.split('/wiki/')[1] || '').replace(/_/g, ' ');
  if (!/^File:/i.test(title)) throw new Error('Commons URL must be a File: page');
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url|size&titles=${encodeURIComponent(title)}`;
  const j = await json(api); const page = Object.values(j.query.pages)[0];
  if (page.missing !== undefined) throw new Error('no such file on Commons: ' + title);
  const ii = page.imageinfo[0]; const md = ii.extmetadata || {};
  const author = strip(md.Artist?.value) || 'unknown';
  const licence = normCommons(md.LicenseShortName?.value);
  return {
    title: strip(md.ObjectName?.value) || title.replace(/^File:/, '').replace(/\.[^.]+$/, ''),
    author, author_url: (String(md.Artist?.value || '').match(/href="([^"]+)"/) || [])[1]?.replace(/^\/\//, 'https://') || u,
    source_url: u, licence, licence_url: md.LicenseUrl?.value || DEED[licence] || '',
    original: `${ii.width}x${ii.height}, ${ii.url}`,
    notes: [md.UsageTerms?.value && `usage terms: ${strip(md.UsageTerms.value)}`, md.Restrictions?.value && `RESTRICTIONS: ${strip(md.Restrictions.value)}`,
      md.AttributionRequired?.value === 'true' && 'attribution required'].filter(Boolean),
  };
}

async function polyhaven(u) {
  const id = u.replace(/\/$/, '').split('/').pop();
  const j = await json(`https://api.polyhaven.com/info/${id}`);
  if (j.error || !j.name) throw new Error('no such Poly Haven asset: ' + id);
  const authors = Object.keys(j.authors || {}).join(', ') || 'Poly Haven';
  const kind = ['HDRI', 'texture', 'model'][j.type] || 'asset';
  return { title: j.name, author: authors, author_url: 'https://polyhaven.com/', source_url: `https://polyhaven.com/a/${id}`,
    licence: 'CC0 1.0', licence_url: DEED['CC0 1.0'], original: `Poly Haven ${kind}`, notes: ['Poly Haven publishes every asset as CC0 (polyhaven.com/license)'] };
}

async function ambientcg(u) {
  const id = new URL(u).searchParams.get('id') || u.replace(/\/$/, '').split('/').pop();
  const j = await json(`https://ambientcg.com/api/v2/full_json?id=${encodeURIComponent(id)}`);
  const a = (j.foundAssets || [])[0]; if (!a) throw new Error('no such ambientCG asset: ' + id);
  return { title: a.displayName, author: 'ambientCG', author_url: 'https://ambientcg.com/', source_url: `https://ambientcg.com/view?id=${a.assetId}`,
    licence: 'CC0 1.0', licence_url: DEED['CC0 1.0'], original: `ambientCG ${a.displayCategory || ''}`.trim(), notes: ['ambientCG publishes every asset as CC0 (ambientcg.com/license)'] };
}

let info;
try {
  const host = new URL(url).hostname;
  if (/commons\.wikimedia\.org$/.test(host)) info = await commons(url);
  else if (/polyhaven\.com$/.test(host)) info = await polyhaven(url);
  else if (/ambientcg\.com$/.test(host)) info = await ambientcg(url);
  else {
    console.log(`No API for ${host}. Do it by hand (skills/asset-sources-and-licence-check, section 3):
  1. open ${url} and find the licence on the asset's own page (not the site's footer);
  2. Sketchfab: the licence sits under the model's description; "Standard"/"Editorial" are NOT free;
  3. Unsplash/Pexels: read the photographer's page, check for people, logos, artworks; set "verified": true only after that;
  4. screenshot the licence line into your project notes with the date.`);
    process.exit(2);
  }
} catch (e) { console.error('ERROR ' + e.message); process.exit(1); }

const ok = ALLOW.some((r) => r.test(info.licence));
const credit = {
  title: info.title, author: info.author, author_url: info.author_url, source_url: info.source_url,
  licence: info.licence, licence_url: info.licence_url,
  attribution: `"${info.title}" by ${info.author} (${info.source_url}), ${info.licence}${info.licence_url ? ' (' + info.licence_url + ')' : ''}. Changes: TODO.`,
  changes: 'TODO: say what you did (cropped, recoloured, resized to N px, WebP q80, cut out...)',
  downloaded: today,
};
console.log(JSON.stringify(credit, null, 1));
console.error(`\nlicence: ${info.licence} -> ${ok ? 'ON the allow-list' : 'NOT on the allow-list (review before use)'}`);
console.error(`original: ${info.original}`);
for (const n of info.notes) console.error('note: ' + n);
if (/^CC BY/.test(info.licence)) console.error('CC BY: the author name + licence must be visible as text on every page that shows it (credits-check tests this).');
if (flag === '--write' && target) {
  const out = target.replace(/\.part\d+$/i, '') + '.credit.json';
  if (fs.existsSync(out)) { console.error('refusing to overwrite ' + out); process.exit(1); }
  fs.writeFileSync(out, JSON.stringify(credit, null, 1) + '\n'); console.error('wrote ' + out + ' (fill in "changes" and the attribution\'s Changes before commit)');
}
process.exit(ok ? 0 : 2);
