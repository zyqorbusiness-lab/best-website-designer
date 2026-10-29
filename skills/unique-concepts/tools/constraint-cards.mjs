#!/usr/bin/env node
// constraint-cards.mjs: draw N constraint cards (default 3) for a concept you already have.
//   node tools/constraint-cards.mjs            3 cards
//   node tools/constraint-cards.mjs --n 5 --seed 7
// Two cards that fight each other are the interesting ones: solve both.
// MIT, Zyqor Studio. Inspired by Oblique Strategies (Eno & Schmidt): own wording, see CREDITS.md.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const C = JSON.parse(readFileSync(join(here, '..', 'data', 'constraints.json'), 'utf8'));
const a = process.argv.slice(2), get = (k, d) => { const i = a.indexOf('--' + k); return i < 0 ? d : +a[i + 1]; };
let s = get('seed', Date.now() % 1e9); const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
const deck = [...C]; for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
deck.slice(0, get('n', 3)).forEach((c, i) => console.log(`${i + 1}. ${c.title.toUpperCase()}\n   ${c.rule}\n`));
