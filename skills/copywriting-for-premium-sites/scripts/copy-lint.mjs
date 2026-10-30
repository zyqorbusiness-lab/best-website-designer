#!/usr/bin/env node
// copy-lint.mjs: lint the words on a website for premium, honest, human copy (no install, Node 18+).
// Errors: filler / AI-ish phrases, any mention of AI tools, lorem ipsum and placeholders, em dashes and the
// "it's not X, it's Y" construction (Sujon's avoid list), checkmark bullets.
// Warnings: award words (fine for references, never a claim), proof that needs a source (percentages, "trusted by", star ratings, big customer counts, testimonials),
// generic CTAs, long sentences, long headlines, exclamation marks, mixed US/UK spelling.
// Usage: node copy-lint.mjs <folder | file.html | file.txt ...> [--allow "phrase1,phrase2"] [--json out.json] [--quiet]
// Also an ES module: import { lintText, lintHtml } from './copy-lint.mjs' (the example page does this).
// Exit 1 on any error. MIT, Zyqor Studio 2026.

export const BANNED = [
  // [regex source, replacement hint]
  ['unlock(?:s|ing)? (?:the |your )?(?:power|potential|full)', 'say what it actually does'],
  ['seamless(?:ly)?(?! loop)', 'name the step that got shorter'],
  ['elevate(?:s|d)? (?:your|the)', 'say what improves, by how much'],
  ['(?:digital|creative) journey', 'name the actual process'],
  ['take (?:it|your \\w+) to the next level', 'say the specific change'],
  ['next[- ]level', 'say the specific change'],
  ['cutting[- ]edge', 'name the technique'],
  ['state[- ]of[- ]the[- ]art', 'name the technique'],
  ['game[- ]chang(?:er|ing)', 'say what changed'],
  ['revolutioni[sz]e', 'say what changed'],
  ['in today\'?s (?:fast[- ]paced|digital|modern) world', 'start with the customer\'s problem'],
  ['look no further', 'cut it'],
  ['harness(?:ing)? the power', 'say what it does'],
  ['unleash(?:es|ing)?', 'say what it does'],
  ['empower(?:s|ing)? (?:you|your|businesses)', 'say what they can now do'],
  ['leverag(?:e|ing) (?:our|the|cutting)', '"use"'],
  ['synerg(?:y|ies)', 'cut it'],
  ['world[- ]class', 'give the fact that proves it'],
  ['best[- ]in[- ]class', 'give the fact that proves it'],
  ['one[- ]stop[- ]shop', 'list what is included'],
  ['delve(?:s)? into', '"look at"'],
  ['dive (?:deep )?into', '"look at"'],
  ['embark on', '"start"'],
  ['tapestry', 'cut it'],
  ['a testament to', 'cut it'],
  ['innovative solutions?', 'name the solution'],
  ['robust (?:solution|platform)', 'name the property (fast, secure, works offline)'],
  ['transform(?:s)? your (?:business|brand|life)', 'say the before and after'],
  ['crafted with (?:love|passion)', 'say how it was made'],
  ['pixel[- ]perfect', 'show it'],
  ['we are passionate about', 'show the work'],
  ['your vision,? our expertise', 'cut it'],
  ['lorem ipsum', 'write the real copy'],
  ['\\b(?:placeholder|tbd|todo|your name here|company name)\\b', 'write the real copy'],
];
const AI = '\\b(?:AI|A\\.I\\.|artificial intelligence|ChatGPT|GPT-?\\d?|Midjourney|DALL[- ·]?E|Stable Diffusion|Gemini|Claude|Copilot|AI[- ](?:generated|powered|made))\\b';
const AWARD = '\\b(?:award[- ]winning|awwwards[- ](?:level|worthy|winner)|site of the (?:day|year)|FWA (?:winner|of the day))\\b';
const PROOF = [
  ['\\btrusted by\\b', '"trusted by": name the customers and have permission'],
  ['[+]?\\d{2,3}(?:\\.\\d)?\\s?%', 'a percentage: is it measured, and is the source on the page?'],
  ['\\b\\d{1,3}(?:,\\d{3})+\\+?\\s(?:customers|clients|users|happy)', 'a big count: is it real?'],
  ['★{3,}|\\b[45](?:\\.\\d)?\\s?(?:stars?|/5)\\b', 'a rating: from where?'],
  ['\\b(?:testimonial|what our clients say|our clients love)\\b', 'testimonials must be real, named, with permission'],
];
const GENERIC_CTA = /^(?:click here|learn more|read more|submit|get started|discover more|find out more|more|go|send)$/i;
const US_UK = [['color', 'colour'], ['center', 'centre'], ['favorite', 'favourite'], ['organize', 'organise'], ['customize', 'customise'], ['optimize', 'optimise'], ['behavior', 'behaviour'], ['analyze', 'analyse'], ['gray', 'grey'], ['jewelry', 'jewellery']];

export function lintText(text, { allow = [], kind = 'body', sentences = true } = {}) {
  const out = [];
  const allowed = (s) => allow.some((a) => s.toLowerCase().includes(a.toLowerCase()));
  const hit = (level, rule, m, hint) => { if (!allowed(m)) out.push({ level, rule, match: m.slice(0, 80), hint }); };
  for (const [src, hint] of BANNED) for (const m of text.matchAll(new RegExp(src, 'gi'))) hit('error', 'filler', m[0], hint);
  for (const m of text.matchAll(new RegExp(AI, 'g'))) hit('error', 'ai-mention', text.slice(Math.max(0, m.index - 30), m.index + 30).trim(), 'no AI mention anywhere on the site (Sujon, rule H4)');
  for (const m of text.matchAll(new RegExp(AWARD, 'gi'))) hit('warn', 'award-words', text.slice(Math.max(0, m.index - 30), m.index + 30).trim(), 'fine when describing references; never as a claim about this site (rule H7)');
  for (const m of text.matchAll(/\u2014/g)) hit('error', 'em-dash', text.slice(Math.max(0, m.index - 25), m.index + 25).replace(/\s+/g, ' '), 'use a comma, a colon or a full stop (Sujon\'s avoid list)');
  for (const m of text.matchAll(/\b(?:it'?s|this is|we'?re|they'?re) not (?:just |only )?[^.,;!?]{1,30}[,;:]\s*(?:it'?s|this is|we'?re|they'?re|but)\b/gi)) hit('error', 'not-x-but-y', m[0], 'say the positive thing once');
  for (const m of text.matchAll(/[\u2713\u2714\u2705\u2611]/g)) hit('error', 'checkmark-bullet', m[0], 'plain list or numbered ledger rows');
  for (const [src, hint] of PROOF) for (const m of text.matchAll(new RegExp(src, 'gi'))) hit('warn', 'proof', m[0], hint);
  const ex = (text.match(/!/g) || []).length; if (ex > 1) hit('warn', 'exclamation', `${ex} exclamation marks`, 'calm confidence: one at most');
  const sents = sentences ? text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length > 3) : [];
  for (const s of sents) { const n = s.split(/\s+/).length; if (n > 28) hit('warn', 'long-sentence', `${n} words: ${s.slice(0, 60)}...`, 'split it; aim 12-20 words'); }
  if (kind === 'h1' || kind === 'h2') { const n = text.trim().split(/\s+/).length; if (n > (kind === 'h1' ? 10 : 12)) hit('warn', 'long-headline', `${n} words: ${text.trim().slice(0, 60)}`, 'headline 3-8 words; move the rest to the line under it'); }
  if (kind === 'cta' && GENERIC_CTA.test(text.trim())) hit('warn', 'generic-cta', text.trim(), 'verb + object: "Book a fitting", "See the menu"');
  return out;
}

export function spellingMix(text) {
  const us = [], uk = [];
  for (const [a, b] of US_UK) { if (new RegExp(`\\b${a}\\w*`, 'i').test(text)) us.push(a); if (new RegExp(`\\b${b}\\w*`, 'i').test(text)) uk.push(b); }
  return us.length && uk.length ? { us, uk } : null;
}

export function lintHtml(html, opts = {}) {
  const clean = html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<(code|pre|svg)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const txt = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '\u2014').replace(/&rsquo;|&#8217;/g, "'").replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  const out = [];
  const body = (clean.match(/<body\b[\s\S]*<\/body>/i) || [clean])[0];
  out.push(...lintText(txt(body), { ...opts, sentences: false }));
  for (const m of body.matchAll(/<(p|li|blockquote|dd|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi)) out.push(...lintText(txt(m[2]), opts).filter((x) => x.rule === 'long-sentence'));
  for (const m of body.matchAll(/<(h1|h2)\b[^>]*>([\s\S]*?)<\/\1>/gi)) out.push(...lintText(txt(m[2]), { ...opts, kind: m[1].toLowerCase() }).filter((x) => x.rule === 'long-headline'));
  for (const m of body.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi)) out.push(...lintText(txt(m[2]), { ...opts, kind: 'cta' }).filter((x) => x.rule === 'generic-cta'));
  const head = clean.match(/<title>([\s\S]*?)<\/title>/i); if (head) out.push(...lintText(txt(head[1]), opts).filter((x) => x.level === 'error'));
  for (const m of clean.matchAll(/<meta\b[^>]*(?:name|property)=["'](?:description|og:description|og:title)["'][^>]*content=["']([^"']*)["']/gi)) out.push(...lintText(txt(m[1]), opts).filter((x) => x.level === 'error'));
  for (const m of body.matchAll(/\balt=["']([^"']*)["']/gi)) for (const x of lintText(m[1], opts)) if (x.rule === 'ai-mention') out.push({ ...x, match: 'alt: ' + x.match });
  const mix = spellingMix(txt(body)); if (mix) out.push({ level: 'warn', rule: 'spelling-mix', match: `US: ${mix.us.join(', ')} / UK: ${mix.uk.join(', ')}`, hint: 'one language per site (rule H11); US clients get US spelling' });
  return out;
}

const isCli = typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`;
if (isCli) {
  const fs = await import('node:fs'); const path = await import('node:path');
  const a = process.argv.slice(2); const opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const allow = (opt('--allow') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const inputs = a.filter((x, i) => !x.startsWith('--') && !(a[i - 1] || '').startsWith('--'));
  if (!inputs.length) { console.error('usage: node copy-lint.mjs <folder|file ...> [--allow "a,b"] [--json out.json]'); process.exit(2); }
  const SKIP = new Set(['node_modules', '.git', 'vendor', '_template', '_kit', '_test']);
  const files = [];
  const walk = (p) => { const st = fs.statSync(p); if (st.isDirectory()) { for (const e of fs.readdirSync(p)) if (!e.startsWith('.') && !SKIP.has(e)) walk(path.join(p, e)); } else if (/\.html?$/i.test(p) || inputs.includes(p)) files.push(p); };
  inputs.forEach(walk);
  const results = []; let errors = 0, warns = 0;
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8'); const r = /\.html?$/i.test(f) ? lintHtml(s, { allow }) : lintText(s, { allow });
    if (r.length) results.push({ file: f, issues: r });
    errors += r.filter((x) => x.level === 'error').length; warns += r.filter((x) => x.level === 'warn').length;
  }
  if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(results, null, 1));
  if (!a.includes('--quiet')) for (const r of results) { console.log('\n' + r.file); for (const x of r.issues) console.log(`  ${x.level.toUpperCase().padEnd(5)} ${x.rule.padEnd(16)} "${x.match}"  -> ${x.hint}`); }
  const by = {}; for (const r of results) for (const x of r.issues) by[x.level + ' ' + x.rule] = (by[x.level + ' ' + x.rule] || 0) + 1;
  console.log('\nSummary:'); for (const [k, n] of Object.entries(by).sort((x, y) => y[1] - x[1])) console.log(`  ${String(n).padStart(4)}  ${k}`);
  console.log(`\n${files.length} files: ${errors} errors, ${warns} warnings\n${errors ? 'VERDICT: FAIL' : 'VERDICT: PASS'}`);
  process.exit(errors ? 1 : 0);
}
