#!/usr/bin/env node
// idea-matrix.mjs: material x motion x story (+ category, + constraint card) concept generator.
// Seeded, so the same seed gives the same cards (you can share a seed with a teammate).
// It can skip combinations already used in your library (pass --used library.json or a .txt list).
//
//   node tools/idea-matrix.mjs                     5 cards, random seed
//   node tools/idea-matrix.mjs --n 12 --seed 42    12 cards, seed 42
//   node tools/idea-matrix.mjs --category bakery   fix the category, vary the rest
//   node tools/idea-matrix.mjs --invert            add a category-inversion prompt to each card
//   node tools/idea-matrix.mjs --used ../../site/library/library.json --json out.json
//
// MIT, Zyqor Studio. Method credit: morphological analysis (Fritz Zwicky) and constraint
// cards in the spirit of Oblique Strategies (Brian Eno & Peter Schmidt); see CREDITS.md.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const data = (f) => JSON.parse(readFileSync(join(here, '..', 'data', f), 'utf8'));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };

const N = +opt('n', 5);
let seed = +opt('seed', Math.floor(Math.random() * 1e9));
const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const startSeed = seed;

const M = data('materials.json'), V = data('motions.json'), S = data('stories.json'), C = data('constraints.json'), K = data('categories.json');

// combinations already used: "category|material|motion" lowercase keys, from library.json rows or a text file
const used = new Set();
const usedFile = opt('used', null);
if (usedFile && existsSync(usedFile)) {
  const raw = readFileSync(usedFile, 'utf8');
  try {
    const j = JSON.parse(raw); const rows = Array.isArray(j) ? j : (j.concepts || j.items || []);
    for (const r of rows) used.add(String((r.category || '') + '|' + (r.idea || r.technique || '')).toLowerCase());
  } catch { for (const l of raw.split('\n')) if (l.trim()) used.add(l.trim().toLowerCase()); }
}
const overlaps = (cat, text) => [...used].some(u => u.startsWith(cat + '|') && text.split(' ').filter(w => w.length > 4).some(w => u.includes(w)));

const INVERT = [
  'Make it feel like the opposite category: a {cat} site that behaves like a museum label.',
  'Use the interface of a train timetable for a {cat}.',
  'A {cat} site where the price list is the hero and the photo is hidden.',
  'A {cat} site with no photos at all: only the material in 3D and real numbers.',
  'A {cat} site that reads like a field guide entry.',
  'A {cat} site that behaves like a physical object (a drawer, a ticket, a tin lid).',
];

const cards = [];
let guard = 0;
while (cards.length < N && guard++ < N * 50) {
  const cat = opt('category', null) || pick(K);
  const material = pick(M), motion = pick(V), story = pick(S), card = pick(C);
  const key = `${material} ${motion}`;
  if (overlaps(cat.toLowerCase(), key.toLowerCase())) continue;
  if (cards.some(c => c.category === cat && (c.material === material || c.motion === motion))) continue;
  const c = { category: cat, material, motion, story, constraint: card,
    pitch: `${cat[0].toUpperCase() + cat.slice(1)} brand. Hero: ${material}. Interaction: ${motion}. The page tells ${story}.` };
  if (opt('invert', false)) c.inversion = pick(INVERT).replaceAll('{cat}', cat);
  cards.push(c);
}

if (opt('json', null)) writeFileSync(opt('json'), JSON.stringify({ seed: startSeed, cards }, null, 1));
console.log(`seed ${startSeed}  (re-run with --seed ${startSeed} to get the same cards)\n`);
cards.forEach((c, i) => {
  console.log(`#${i + 1}  ${c.category.toUpperCase()}`);
  console.log(`   material : ${c.material}`);
  console.log(`   motion   : ${c.motion}`);
  console.log(`   story    : ${c.story}`);
  console.log(`   card     : ${c.constraint.title}: ${c.constraint.rule}`);
  if (c.inversion) console.log(`   invert   : ${c.inversion}`);
  console.log(`   pitch    : ${c.pitch}\n`);
});
console.log('Keep a card only if you can name 3 hand-made details for it and a REAL CC0/CC-BY model or texture that carries it.');
