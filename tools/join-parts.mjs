#!/usr/bin/env node
// Rebuilds the few large 3D files that are stored in this repo as numbered parts
// (GitHub uploads from our publishing pipeline are capped per file). Runs in a second.
// Vercel runs it automatically (vercel.json buildCommand); locally `npm run dev` runs it first.
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'tools', 'parts.json'), 'utf8'));
let built = 0, ok = 0;
for (const f of manifest.files) {
  const out = join(root, f.path);
  const sha = b => createHash('sha256').update(b).digest('hex');
  if (existsSync(out) && statSync(out).size === f.bytes && sha(readFileSync(out)) === f.sha256) { ok++; continue; }
  const buf = Buffer.concat(Array.from({ length: f.parts }, (_, i) => readFileSync(`${out}.part${i + 1}`)));
  if (sha(buf) !== f.sha256) { console.error(`checksum mismatch for ${f.path}`); process.exit(1); }
  writeFileSync(out, buf); built++;
}
console.log(`join-parts: ${built} rebuilt, ${ok} already in place (${manifest.files.length} total)`);
