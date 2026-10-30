#!/usr/bin/env node
// brief.mjs: write and check a client brief before any code (Sujon's Drive rule Q1: "write the brief before any code").
//   node brief.mjs --new [dir]            writes brief.json + BRIEF.md templates into dir (default: current folder)
//   node brief.mjs --check brief.json     checks required fields, tier consistency and honesty flags; exit 1 on problems
//   node brief.mjs --quote brief.json     prints the scope line to send the client (tier, pages, features, what is not included)
// MIT, Zyqor Studio 2026.

export const TIERS = {
  normal: { price: 'from $300', budgetMB: 1.5, maxPages: 5, allows: ['css-motion', 'real-photos'], excludes: ['3d', 'scroll-video', 'configurator', 'custom-cursor', 'sound'] },
  advanced: { price: 'around $1k', budgetMB: 3, maxPages: 8, allows: ['css-motion', 'real-photos', 'pinned-chapters', 'smooth-scroll', '3d', 'scroll-video', 'custom-cursor'], excludes: ['configurator', 'sound'] },
  premium: { price: 'up to $10k', budgetMB: 8, maxPages: 20, allows: ['css-motion', 'real-photos', 'pinned-chapters', 'smooth-scroll', '3d', 'scroll-video', 'custom-cursor', 'configurator', 'sound'], excludes: [] },
};
export const TEMPLATE = {
  client: { business: '', contact_name: '', contact_channel: 'WhatsApp / email', city: '', country: 'US' },
  goal: '', audience: '', primary_action: '',
  tier: 'normal', pages: ['home', 'contact', 'privacy'], features: [],
  owned_assets: { logo: false, photos: false, footage: false, copy_notes: false },
  missing_assets_plan: '', facts_sheet: 'copy/facts.md', languages: ['en-US'],
  domain: { has_domain: false, name: '', registrar_access: false },
  hosting: 'vercel (client account) | sites.tab.bot preview', form_backend: 'none: label "Concept: not sent" | formspree | client email',
  deadline: '', concept: false, references: [],
  approvals: { scope_ok: false, scope_ok_date: '', copy_ok: false, launch_ok: false },
};
export function check(b) {
  const p = [], w = [];
  const req = (v, name) => { if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) p.push(`missing: ${name}`); };
  req(b.client?.business, 'client.business'); req(b.goal, 'goal'); req(b.audience, 'audience'); req(b.primary_action, 'primary_action');
  req(b.tier, 'tier'); req(b.pages, 'pages'); req(b.deadline, 'deadline'); req(b.languages, 'languages');
  const T = TIERS[b.tier]; if (!T) p.push(`tier must be normal, advanced or premium (got "${b.tier}")`);
  else {
    for (const f of b.features || []) if (T.excludes.includes(f)) p.push(`feature "${f}" is outside the ${b.tier} tier (quote a higher tier or drop it)`);
    if ((b.pages || []).length > T.maxPages) w.push(`${b.pages.length} pages is a lot for ${b.tier} (planning default ${T.maxPages})`);
  }
  if (!(b.pages || []).some((x) => /privacy/i.test(x))) p.push('pages: add a privacy page (Drive rule H6)');
  if (!b.owned_assets?.photos && !b.missing_assets_plan) p.push('no photos owned and no plan for them (real photos only, no AI images)');
  if (b.concept && !/concept/i.test(b.form_backend || '')) w.push('concept site: label forms "Concept: not sent"');
  if (!b.concept && /none/i.test(b.form_backend || '') && /book|order|quote|contact|call/i.test(b.primary_action || '')) w.push('real client with no form backend: wire one or use tel:/mailto: links');
  if (!b.approvals?.scope_ok) w.push('scope not approved yet: get a written yes before building');
  if (b.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(b.deadline)) w.push('deadline as YYYY-MM-DD');
  return { problems: p, warnings: w };
}
export function quote(b) {
  const T = TIERS[b.tier] || {};
  const not = (T.excludes || []).filter((x) => !(b.features || []).includes(x));
  return `${b.client.business}: ${b.tier.toUpperCase()} website (${T.price}). Pages: ${b.pages.join(', ')}. Includes: ${[...new Set([...(b.features || []), 'phone + desktop builds', 'SEO basics + sitemap', 'accessibility pass', 'Search Console setup'])].join(', ')}. Not included: ${not.join(', ') || 'nothing excluded'}. Delivery by ${b.deadline || '(date)'}; one round of changes after the preview.`;
}

const isCli = typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`;
if (isCli) {
  const fs = await import('node:fs'); const path = await import('node:path');
  const a = process.argv.slice(2);
  if (a[0] === '--new') {
    const dir = path.resolve(a[1] || '.'); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'brief.json'), JSON.stringify(TEMPLATE, null, 2) + '\n');
    fs.writeFileSync(path.join(dir, 'BRIEF.md'), `# Brief: (business)\n\n1. What the site is for (their words):\n2. Who it is for:\n3. The one action a visitor should take:\n4. Tier and budget:\n5. Pages and sections:\n6. Assets they own / what is missing and where it will come from:\n7. Facts sheet: copy/facts.md\n8. Deadline:\n9. Domain and hosting:\n10. References (3-5, teardown cards in work/teardowns/):\n\n## 5-line token summary (fill after palette, type and layout)\n1. Style + idea:\n2. Colour:\n3. Type:\n4. Space + grid:\n5. Motion:\n\n## Approvals\n- Scope OK (date, channel):\n- Copy OK:\n- Launch OK:\n`);
    console.log(`wrote ${dir}/brief.json and ${dir}/BRIEF.md`); process.exit(0);
  }
  const f = a[1]; if (!f || !['--check', '--quote'].includes(a[0])) { console.error('usage: node brief.mjs --new [dir] | --check brief.json | --quote brief.json'); process.exit(2); }
  const b = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (a[0] === '--quote') { console.log(quote(b)); process.exit(0); }
  const r = check(b);
  for (const x of r.problems) console.log('PROBLEM ' + x); for (const x of r.warnings) console.log('warn    ' + x);
  console.log(r.problems.length ? `VERDICT: FAIL (${r.problems.length})` : 'VERDICT: PASS');
  process.exit(r.problems.length ? 1 : 0);
}
