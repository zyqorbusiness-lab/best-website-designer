#!/usr/bin/env node
// commons-search.mjs - search Wikimedia Commons for photos and show only files whose licence passes the repo gate.
// Usage: node commons-search.mjs "neapolitan pizza" [--min 1600] [--limit 40] [--all]   (Node 18+, no install)
//   --min N    smallest width in px to keep (default 1600: a desktop hero needs at least that)
//   --limit N  how many search hits to read (default 40, max 50)
//   --all      also list files whose licence would fail or need review (marked)
// Prints one line per file: width x height, licence, author, File: page URL. Then run licence-probe.mjs on your pick.
const args = process.argv.slice(2);
const q = args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a));
const num = (k, d) => { const i = args.indexOf(k); return i >= 0 ? Number(args[i + 1]) : d; };
const MIN = num('--min', 1600), LIMIT = Math.min(num('--limit', 40), 50), ALL = args.includes('--all');
if (!q) { console.error('usage: node commons-search.mjs "query" [--min 1600] [--limit 40] [--all]'); process.exit(1); }
const UA = { 'User-Agent': 'zyqor-commons-search/1.0 (https://github.com/zyqorbusiness-lab/best-website-designer)' };
const strip = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const PASS = [/^CC0$/i, /^CC BY (2\.0|3\.0|4\.0)$/i, /^Public domain$/i]; // PD passes only once you name the kind (author release, USDA...)
const REVIEW = [/^CC BY-SA/i];
const api = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
  action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: String(LIMIT),
  gsrsearch: `${q} filetype:bitmap`, prop: 'imageinfo', iiprop: 'size|extmetadata|url', iiextmetadatafilter: 'LicenseShortName|Artist|Restrictions',
});
const r = await fetch(api, { headers: UA });
if (!r.ok) { console.error('Commons answered ' + r.status); process.exit(1); }
const j = await r.json();
const pages = Object.values(j.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
let shown = 0;
for (const p of pages) {
  const ii = p.imageinfo?.[0]; if (!ii) continue;
  const md = ii.extmetadata || {}; const lic = strip(md.LicenseShortName?.value) || 'unknown';
  const verdict = PASS.some((x) => x.test(lic)) ? 'ok' : REVIEW.some((x) => x.test(lic)) ? 'REVIEW' : 'FAIL';
  if (ii.width < MIN) continue;
  if (verdict !== 'ok' && !ALL) continue;
  const restr = strip(md.Restrictions?.value);
  const url = 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(p.title.replace(/ /g, '_')).replace(/%3A/g, ':');
  console.log(`${String(ii.width).padStart(5)}x${String(ii.height).padEnd(5)} ${lic.padEnd(14)} ${verdict === 'ok' ? (/^public domain$/i.test(lic) ? '[PD: name the kind] ' : '') : '[' + verdict + '] '}${strip(md.Artist?.value).slice(0, 40).padEnd(40)} ${url}${restr ? '  (restrictions: ' + restr + ')' : ''}`);
  shown++;
}
console.error(`\n${shown} of ${pages.length} hits shown (min width ${MIN}px${ALL ? ', all licences' : ', gate-passing licences only'}).`);
console.error('Next: open the page, look at the photo at full size, then: node licence-probe.mjs <File: URL> --write <your asset file>');
