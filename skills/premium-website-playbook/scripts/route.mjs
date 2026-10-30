#!/usr/bin/env node
// route.mjs: the premium-website-playbook router. Given a brief (tier + features), prints the ordered route through the
// 24 Zyqor skills: which skill to open at each step, the command to run, and the gate that must pass before moving on.
// Works as a CLI (Node 18+, no install) and as an ES module in the browser (examples/index.html imports it).
//   node route.mjs --tier premium --3d --video --configurator --type product
//   node route.mjs --tier normal --type local-business --json
//   node route.mjs --lint ../../          (repo root: every skill folder exists, has SKILL.md, name matches, playbook links all)
// MIT, Zyqor Studio (Sujon Hoque) 2026.

export const SKILLS = [
  // name, phase, one-line job, the command or file to start with
  ['premium-website-playbook', 'all', 'This file: the order of work and the gates', 'node skills/premium-website-playbook/scripts/route.mjs --tier <t>'],
  ['client-site-delivery-workflow', 'brief', 'Intake, scope, brief, staging, handover', 'node skills/client-site-delivery-workflow/scripts/brief.mjs --new'],
  ['award-site-teardown-method', 'research', 'Study 3-5 reference sites and extract techniques, not content', 'node skills/award-site-teardown-method/scripts/teardown.mjs <url>'],
  ['unique-idea-and-concept', 'idea', 'The one big idea sentence, metaphor, chapters', 'node skills/unique-idea-and-concept/scripts/storyboard.mjs'],
  ['unique-concepts', 'idea', 'Idea generators: matrix, constraint cards, inversion', 'skills/unique-concepts/SKILL.md §1-6'],
  ['premium-tiers-normal-advanced-premium', 'tier', 'NORMAL $300 / ADVANCED $1k / PREMIUM $10k specs and budgets', 'node skills/premium-tiers-normal-advanced-premium/scripts/tier-check.mjs <site>'],
  ['colour-systems', 'design', '3-colour OKLCH palette, contrast checked', 'node skills/colour-systems/scripts/palette.mjs --check "canvas,ink,accent"'],
  ['typography-premium', 'design', 'Font pair, fluid scale, licences, loading', 'node skills/typography-premium/scripts/type-scale.mjs'],
  ['layout-grid-spacing', 'design', 'Named structure, grid, spacing scale, rhythm', 'skills/layout-grid-spacing/SKILL.md'],
  ['copywriting-for-premium-sites', 'content', 'Headlines, body, CTAs, honest proof, no AI wording', 'node skills/copywriting-for-premium-sites/scripts/copy-lint.mjs <site>'],
  ['imagery-assets-licensing', 'content', 'Real CC0 / CC BY assets, credit files, nothing fake', 'node tools/credits-check.mjs --allow-flagged'],
  ['motion-and-scroll-storytelling', 'motion', 'Easing tokens, reveals, pinned chapters, Lenis/GSAP', 'skills/motion-and-scroll-storytelling/SKILL.md'],
  ['scroll-video-hero', 'motion', 'Scroll-scrubbed video hero (encode for scrubbing, fallbacks)', 'skills/scroll-video-hero/SKILL.md'],
  ['threejs-3d-premium', '3d', 'Real models, PBR, HDRI, post, desktop max + phone fallback', 'skills/threejs-3d-premium/SKILL.md'],
  ['model-optimisation-phone', '3d', 'One optimised GLB for desktop and phone, proven by renders', 'skills/model-optimisation-phone/SKILL.md'],
  ['micro-interactions-and-cursor', 'interaction', 'Magnetic buttons, hover, cursor, states, opt-in sound', 'skills/micro-interactions-and-cursor/SKILL.md'],
  ['liquid-glass-ui', 'interaction', 'Glass nav, cards, sheet, tab bar with fallbacks', 'skills/liquid-glass-ui/SKILL.md'],
  ['interactive-product-configurator', 'interaction', 'Drag-to-build, live price, phone tap path', 'skills/interactive-product-configurator/SKILL.md'],
  ['responsive-phone-pc-parity', 'parity', 'Recompose for phone, viewport matrix, svh/safe areas', 'node skills/responsive-phone-pc-parity/scripts/parity-check.mjs <site>'],
  ['performance-desktop-max-and-mobile', 'speed', 'Budgets, critical path, Core Web Vitals', 'node skills/performance-desktop-max-and-mobile/scripts/budget-check.mjs <site>'],
  ['accessibility-and-reduced-motion', 'a11y', 'WCAG 2.2 AA, keyboard, reduced motion per scene', 'node skills/accessibility-and-reduced-motion/scripts/a11y-check.mjs <site>'],
  ['seo-and-meta', 'seo', 'Titles, OG, JSON-LD, sitemap, robots, Search Console', 'node skills/seo-and-meta/scripts/seo-check.mjs <site>'],
  ['web-security', 'security', 'Secrets, headers, CSP, forms, dependencies', 'node skills/web-security/check.mjs <site>'],
  ['qa-harness', 'qa', '1440/390/360 + reduced motion, console, overflow, links', 'node skills/qa-harness/qa.mjs <site>'],
].map(([name, phase, job, start]) => ({ name, phase, job, start }));

// Gates: what must be true before leaving each step (from Sujon's Drive Q1-Q13 and the skills' own checklists).
const STEPS = [
  { id: 'brief', title: 'Intake and brief', skills: ['client-site-delivery-workflow'], gate: 'Brief written: goal, audience, tier, pages, must-haves, assets owned, deadline, 5-line token summary placeholder. Client said yes to scope.' },
  { id: 'research', title: 'Reference teardown', skills: ['award-site-teardown-method'], gate: '3-5 teardown cards saved; each says what to take (structure, rhythm, choreography) and what never to take (logo, copy, photos).' },
  { id: 'idea', title: 'The one idea', skills: ['unique-idea-and-concept', 'unique-concepts'], gate: 'One idea sentence "[product] as [thing/place]" passes storyboard.mjs; 3-7 chapters named; 3 hand-made signature details listed.' },
  { id: 'tier', title: 'Tier and budgets', skills: ['premium-tiers-normal-advanced-premium'], gate: 'Tier written down with its weight budget, frame-rate target and feature list. Nothing outside the tier is promised.' },
  { id: 'palette', title: 'Palette', skills: ['colour-systems'], gate: 'palette.mjs --check prints VERDICT PASS; palette sentence in notes.' },
  { id: 'type', title: 'Typography', skills: ['typography-premium'], gate: 'One display + one body (+ optional mono), 2-3 weights, licences read and recorded, fluid scale tokens written.' },
  { id: 'layout', title: 'Layout and grid', skills: ['layout-grid-spacing'], gate: 'Named structure per section, one spacing scale, one focal point per section, phone recomposition sketched.' },
  { id: 'copy', title: 'Copy', skills: ['copywriting-for-premium-sites'], gate: 'copy-lint.mjs passes: no filler phrases, no AI wording, no fake proof, one language, specific CTAs.' },
  { id: 'assets', title: 'Images, video, models', skills: ['imagery-assets-licensing'], gate: 'Every asset has <asset>.credit.json; credits-check passes; CC BY attribution visible on the page.' },
  { id: 'motion', title: 'Motion and scroll story', skills: ['motion-and-scroll-storytelling'], gate: 'Three easing tokens; every animation answers the motion questions (why, what changed, readable without it).' },
  { id: 'video', title: 'Scroll video hero', skills: ['scroll-video-hero'], when: (b) => b.video, gate: 'All-keyframe encode, poster frame, reduced-motion still, phone clip; scrubs without stutter at 1440.' },
  { id: '3d', title: '3D scene', skills: ['threejs-3d-premium', 'model-optimisation-phone'], when: (b) => b.threeD, gate: 'Real model (credited), HDRI + PBR; one GLB for both builds proven by side-by-side render; poster fallback, never a blank canvas.' },
  { id: 'interaction', title: 'Interaction layer', skills: ['micro-interactions-and-cursor'], gate: 'Every state designed (hover, focus, active, loading, empty, error, success, disabled); cursor off on coarse pointers.' },
  { id: 'glass', title: 'Glass UI', skills: ['liquid-glass-ui'], when: (b) => b.glass, gate: 'Text on glass at 4.5:1 over the worst frame behind it; fallback when backdrop-filter is missing.' },
  { id: 'configurator', title: 'Product configurator', skills: ['interactive-product-configurator'], when: (b) => b.configurator, gate: 'Drag and tap paths both complete an order; live price; keyboard path; form labelled as concept if not wired.' },
  { id: 'parity', title: 'Phone = PC', skills: ['responsive-phone-pc-parity'], gate: 'parity-check passes on the matrix incl. 375x667; main CTA above the fold on every size.' },
  { id: 'speed', title: 'Performance', skills: ['performance-desktop-max-and-mobile'], gate: 'budget-check inside the tier budget; LCP <= 2.5 s, CLS <= 0.1, INP <= 200 ms measured; desktop quality untouched.' },
  { id: 'a11y', title: 'Accessibility', skills: ['accessibility-and-reduced-motion'], gate: 'a11y-check exits 0 at 1440 and 390; keyboard walk-through done; reduced-motion pass designed per scene.' },
  { id: 'seo', title: 'SEO and sharing', skills: ['seo-and-meta'], gate: 'seo-check exits 0; sitemap.xml + robots.txt live; OG image 1200x630 previews right; JSON-LD validates.' },
  { id: 'security', title: 'Security', skills: ['web-security'], gate: 'check.mjs passes: no secrets, headers set, forms protected, third-party scripts listed.' },
  { id: 'qa', title: 'Full QA', skills: ['qa-harness'], gate: '0 console errors, 0 failed requests, 0 horizontal overflow at 1440/390/360 + reduced motion; screenshots looked at.' },
  { id: 'deliver', title: 'Deploy and handover', skills: ['client-site-delivery-workflow'], gate: 'Live URL answers 200; Search Console sitemap submitted; handover note + credits + licence sent; evidence attached.' },
];

export function route(brief = {}) {
  const b = { tier: 'advanced', threeD: false, video: false, glass: false, configurator: false, ...brief };
  if (b.tier === 'premium') { b.threeD = brief.threeD ?? true; }
  if (b.tier === 'normal') { b.threeD = false; b.video = false; }
  return STEPS.filter((s) => !s.when || s.when(b)).map((s, i) => ({
    n: i + 1, id: s.id, title: s.title, gate: s.gate,
    skills: s.skills.map((n) => { const k = SKILLS.find((x) => x.name === n); if (!k) throw new Error('unknown skill ' + n); return k; }),
  }));
}

export function lint(files) {
  // files: { [skillName]: { exists, frontmatterName, playbookLinks:boolean } }
  const problems = [];
  for (const s of SKILLS) {
    const f = files[s.name];
    if (!f || !f.exists) problems.push(`${s.name}: folder or SKILL.md missing`);
    else if (f.frontmatterName !== s.name) problems.push(`${s.name}: frontmatter name is "${f.frontmatterName}"`);
    else if (!f.linked) problems.push(`${s.name}: not linked from premium-website-playbook/SKILL.md`);
  }
  return problems;
}

const isCli = typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`;
if (isCli) {
  const a = process.argv.slice(2); const has = (k) => a.includes(k); const val = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  if (has('--lint')) {
    const fs = await import('node:fs'); const path = await import('node:path');
    const root = path.resolve(val('--lint', '.'));
    const pb = fs.readFileSync(path.join(root, 'skills/premium-website-playbook/SKILL.md'), 'utf8');
    const files = {};
    for (const s of SKILLS) {
      const p = path.join(root, 'skills', s.name, 'SKILL.md');
      if (!fs.existsSync(p)) { files[s.name] = { exists: false }; continue; }
      const m = fs.readFileSync(p, 'utf8').match(/^---[\s\S]*?\nname:\s*([^\n]+)/);
      files[s.name] = { exists: true, frontmatterName: m ? m[1].trim() : null, linked: s.name === 'premium-website-playbook' || pb.includes(`../${s.name}/`) };
    }
    const probs = lint(files);
    for (const s of SKILLS) { const m = s.start.match(/^node (\S+)/); if (m && !fs.existsSync(path.join(root, m[1]))) probs.push(`${s.name}: start command file missing: ${m[1]}`); }
    console.log(probs.length ? probs.join('\n') + `\nLINT FAIL (${probs.length})` : `LINT PASS: ${SKILLS.length} skills present, named and linked`);
    process.exit(probs.length ? 1 : 0);
  }
  const brief = { tier: val('--tier', 'advanced'), threeD: has('--3d') ? true : (has('--no-3d') ? false : undefined), video: has('--video'), glass: has('--glass'), configurator: has('--configurator'), type: val('--type', 'site') };
  if (brief.threeD === undefined) delete brief.threeD;
  const r = route(brief);
  if (has('--json')) { console.log(JSON.stringify({ brief, steps: r }, null, 1)); process.exit(0); }
  console.log(`Route for a ${brief.tier.toUpperCase()} ${brief.type} (${r.length} steps)\n`);
  for (const s of r) {
    console.log(`${String(s.n).padStart(2)}. ${s.title}`);
    for (const k of s.skills) console.log(`    skill: ${k.name}  ->  ${k.start}`);
    console.log(`    gate:  ${s.gate}\n`);
  }
}
