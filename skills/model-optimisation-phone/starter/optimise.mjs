#!/usr/bin/env node
// optimise.mjs: one glTF/GLB in, ONE optimised GLB out that desktop and phone both load.
// Part of the model-optimisation-phone skill (Zyqor Studio, MIT). Node 18+.
//
//   node optimise.mjs in.glb out.glb [--budget 6MB] [--textures webp|ktx2|keep]
//        [--geometry meshopt|draco|none] [--max 2048] [--max-for "Lenses=1024"]
//        [--colour-q 92] [--data-q 92] [--report out.report.json]
//
// It refuses settings that visibly change the model (see SKILL.md "Guards").
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { dedup, prune, weld, resample, instance, textureCompress, meshopt, draco,
         listTextureSlots, getTextureColorSpace } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';

// ---------- args ----------
const argv = process.argv.slice(2);
const pos = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--') || (argv[i-1]||'').match(/^--(allow|i-accept|help|dry)/));
const flag = (n, d) => { const i = argv.indexOf('--' + n); if (i < 0) return d; const v = argv[i + 1]; return v === undefined || v.startsWith('--') ? true : v; };
const flags = (n) => argv.flatMap((a, i) => a === '--' + n ? [argv[i + 1]] : []);
if (flag('help') || pos.length < 2) {
  console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('\n').slice(1, 9).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(pos.length < 2 && !flag('help') ? 1 : 0);
}
const [IN, OUT] = pos;
const parseBytes = (s) => { if (!s || s === true) return null; const m = String(s).match(/^([\d.]+)\s*(kb|mb|gb|b)?$/i); if (!m) throw new Error('bad size ' + s); return +m[1] * ({ b: 1, kb: 1024, mb: 1048576, gb: 1073741824 }[(m[2] || 'b').toLowerCase()]); };
const O = {
  budget: parseBytes(flag('budget', null)),
  textures: flag('textures', 'webp'),           // webp | ktx2 | keep
  geometry: flag('geometry', 'meshopt'),        // meshopt | draco | none
  max: +flag('max', 2048),
  maxFor: flags('max-for').map(s => { const [p, v] = s.split('='); return [new RegExp(p, 'i'), +v]; }),
  colourQ: +flag('colour-q', 92),
  dataQ: +flag('data-q', 92),
  normalMode: flag('normals', 'near-lossless'),
  normalNL: +flag('normal-nl', 40),               // webp near-lossless level for normals: 100 = lossless ... 0 = most preprocessing  // near-lossless | lossless | lossy (refused unless --allow-lossy-normals)
  colourKtx: flag('colour-ktx', 'uastc'),
  ktxRdo: +flag('ktx-rdo', 1),                   // UASTC RDO lambda for colour/data maps (higher = smaller, softer); normals use a quarter of it, max 0.75        // uastc | etc1s (etc1s = smaller, may band on close-ups)
  posBits: +flag('pos-bits', 16), normBits: +flag('normal-bits', 12), uvBits: +flag('uv-bits', 14),
  simplify: flag('simplify', null),
  report: flag('report', OUT.replace(/\.glb$/i, '') + '.report.json'),
};
const allow = (n) => argv.includes('--allow-' + n) || argv.includes('--i-accept-' + n);

// ---------- guards: refuse what visibly changes the model ----------
const refuse = [];
if (O.simplify && !allow('shape-change')) refuse.push('--simplify changes the silhouette and shading (v3 round 1: the car body got wrinkles). Re-run without it, or add --i-accept-shape-change if a lower-poly model is really wanted.');
if (O.posBits < 14) refuse.push(`--pos-bits ${O.posBits} < 14 makes vertices snap visibly on a close-up. Use 14-16.`);
if (O.normBits < 10) refuse.push(`--normal-bits ${O.normBits} < 10 gives faceted, banded highlights (v3 round 1 used 8 bits: soft, blotchy knit). Use 10-12.`);
if (O.uvBits < 12) refuse.push(`--uv-bits ${O.uvBits} < 12 shifts texture seams on 2048 maps. Use 12-14.`);
if (O.textures === 'webp' && O.colourQ < 85 && !allow('low-quality')) refuse.push(`--colour-q ${O.colourQ} < 85 shows blocking on close-ups. Use 88-95.`);
if (O.textures === 'webp' && O.dataQ < 88 && !allow('low-quality')) refuse.push(`--data-q ${O.dataQ} < 88 smears roughness/metal masks. Use 90-95.`);
if (O.normalMode === 'lossy' && !allow('lossy-normals')) refuse.push('Lossy WebP on normal maps is refused: WebP lossy stores colour at half resolution (4:2:0), which bends normals. Measured on Flight Helmet leather: mean 3.4 deg, p99 17 deg error even at q100, vs 0.55 deg / 1.3 deg near-lossless. Use --normals near-lossless (default) or --textures ktx2 (UASTC).');
if (O.colourKtx === 'etc1s' && !allow('etc1s')) refuse.push('ETC1S on colour maps saves a lot but bands on close-ups. Add --allow-etc1s if this model is never seen up close. (Normal and data maps never use ETC1S.)');
if (O.max < 1024 && !allow('small-textures')) refuse.push(`--max ${O.max} < 1024: a hero model on a 390px phone at DPR 2-3 covers ~780-1170 device px, so textures under 1024 look soft. Use --max-for "<part>=1024" for small parts instead, or add --allow-small-textures.`);
if (!['webp', 'ktx2', 'keep'].includes(O.textures)) refuse.push('--textures must be webp, ktx2 or keep');
if (!['meshopt', 'draco', 'none'].includes(O.geometry)) refuse.push('--geometry must be meshopt, draco or none');
if (refuse.length && argv.includes('--unsafe-demo')) { console.warn('\nWARNING --unsafe-demo: writing a file the guards would refuse, for before/after demos only:\n- ' + refuse.join('\n- ') + '\n'); refuse.length = 0; }
if (refuse.length) { console.error('\nREFUSED (nothing written):\n- ' + refuse.join('\n- ') + '\n'); process.exit(3); }

// ---------- io ----------
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
let dracoDeps = {};
if (O.geometry === 'draco' || true) {
  try { const d3d = (await import('draco3dgltf')).default; dracoDeps = { 'draco3d.decoder': await d3d.createDecoderModule(), 'draco3d.encoder': await d3d.createEncoderModule() }; } catch (e) { if (O.geometry === 'draco') throw new Error('draco3dgltf is not installed: npm i draco3dgltf'); }
}
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder, ...dracoDeps });

const fileBytes = (p) => { const s = fs.statSync(p); if (!/\.gltf$/i.test(p)) return s.size; const g = JSON.parse(fs.readFileSync(p, 'utf8')); const dir = path.dirname(p); let t = s.size; for (const r of [...(g.buffers || []), ...(g.images || [])]) if (r.uri && !r.uri.startsWith('data:')) t += fs.statSync(path.join(dir, decodeURIComponent(r.uri))).size; return t; };
const KB = (b) => b >= 1048576 ? (b / 1048576).toFixed(2) + ' MB' : (b / 1024).toFixed(0) + ' KB';

async function stats(doc) {
  const root = doc.getRoot();
  let tris = 0, verts = 0, prims = 0;
  for (const node of root.listNodes()) { const mesh = node.getMesh(); if (!mesh) continue;
    for (const p of mesh.listPrimitives()) { prims++; const v = p.getAttribute('POSITION')?.getCount() || 0; verts += v; const idx = p.getIndices();
      const n = idx ? idx.getCount() : v; const mode = p.getMode(); tris += mode === 4 ? n / 3 : (mode === 5 || mode === 6) ? Math.max(0, n - 2) : 0; } }
  const textures = [];
  for (const t of root.listTextures()) {
    const img = t.getImage(); const size = img ? (await sharpMeta(t)) : null;
    const slots = listTextureSlots(t);
    const kind = slots.some(s => /normal/i.test(s)) ? 'normal' : (getTextureColorSpace(t) === 'srgb' ? 'colour' : 'data');
    const w = size?.width || 0, h = size?.height || 0; const ktx = t.getMimeType() === 'image/ktx2';
    const gpu = Math.round(w * h * (ktx ? 1 : 4) * 4 / 3);
    textures.push({ name: t.getName() || t.getURI() || '(unnamed)', slots, kind, mime: t.getMimeType(), width: w, height: h, bytes: img ? img.byteLength : 0, gpu_bytes_est: gpu });
  }
  return { triangles: Math.round(tris), vertices: verts, draw_calls: prims, meshes: root.listMeshes().length, materials: root.listMaterials().length,
    animations: root.listAnimations().length, extensions: root.listExtensionsUsed().map(e => e.extensionName), textures,
    texture_bytes: textures.reduce((a, t) => a + t.bytes, 0), gpu_texture_bytes_est: textures.reduce((a, t) => a + t.gpu_bytes_est, 0) };
}
async function sharpMeta(t) {
  if (t.getMimeType() === 'image/ktx2') { const b = t.getImage(); const dv = new DataView(b.buffer, b.byteOffset); return { width: dv.getUint32(20, true), height: dv.getUint32(24, true) }; }
  try { const m = await sharp(Buffer.from(t.getImage())).metadata(); return { width: m.width, height: m.height }; } catch { return null; }
}

// ---------- run ----------
const t0 = Date.now();
const doc = await io.read(IN);
// stable labels so the report can match textures before/after
doc.getRoot().listTextures().forEach((t, i) => { if (!t.getName()) t.setName((t.getURI() ? path.basename(t.getURI()).replace(/\.\w+$/, '') : 'texture' + i)); });
const before = { file_bytes: fileBytes(IN), ...(await stats(doc)) };
console.log(`\nIN   ${IN}  ${KB(before.file_bytes)}  ${before.triangles.toLocaleString()} tris  ${before.textures.length} textures  ${before.draw_calls} draw calls`);

await doc.transform(dedup(), prune({ keepAttributes: false, keepLeaves: false }), instance({ min: 2 }), resample(), weld());

// textures: resize per part, then encode per kind
const groups = { colour: /^(baseColorTexture|emissiveTexture|diffuseTexture|specularGlossinessTexture|sheenColorTexture|specularColorTexture)$/,
  normal: /normalTexture$/i, data: /.*/ };
const sizeFor = (t) => { let m = O.max; for (const [re, v] of O.maxFor) if (re.test(t.getName() || '') || re.test(t.getURI() || '') || t.listParents().some(p => re.test(p.getName?.() || ''))) m = v; return m; };
// resize (never upscale) with lanczos3, keep the original format for now
for (const t of doc.getRoot().listTextures()) {
  if (t.getMimeType() === 'image/ktx2' || !t.getImage()) continue;
  const lim = sizeFor(t); const m = await sharp(Buffer.from(t.getImage())).metadata();
  if (Math.max(m.width, m.height) > lim) {
    const kind = listTextureSlots(t).some(s => /normal/i.test(s)) ? 'normal' : 'other';
    let img = sharp(Buffer.from(t.getImage())).resize({ width: m.width >= m.height ? lim : null, height: m.height > m.width ? lim : null, kernel: 'lanczos3' });
    const buf = await img.png({ compressionLevel: 1 }).toBuffer();
    t.setImage(new Uint8Array(buf)).setMimeType('image/png');
    if (t.getURI()) t.setURI(t.getURI().replace(/\.\w+$/, '.png'));
    console.log(`     resize ${t.getName() || t.getURI()} ${m.width}x${m.height} -> <=${lim} (${kind})`);
  }
}
const kindOf = (t) => listTextureSlots(t).some(s => /normal/i.test(s)) ? 'normal' : (getTextureColorSpace(t) === 'srgb' ? 'colour' : 'data');
const nameRe = (kind) => { const names = doc.getRoot().listTextures().filter(t => kindOf(t) === kind && t.getMimeType() !== 'image/ktx2'); return names; };

if (O.textures === 'webp') {
  doc.createExtension(EXTTextureWebP).setRequired(true);
  for (const t of doc.getRoot().listTextures()) {
    if (t.getMimeType() === 'image/ktx2' || !t.getImage()) continue;
    const kind = kindOf(t); const src = sharp(Buffer.from(t.getImage()));
    let opts;
    if (kind === 'normal') opts = O.normalMode === 'lossless' ? { lossless: true, effort: 5 } : O.normalMode === 'lossy' ? { quality: O.dataQ, effort: 5 } : { nearLossless: true, quality: O.normalNL, effort: 5 };
    else if (kind === 'colour') opts = { quality: O.colourQ, smartSubsample: true, effort: 5 };
    else opts = { quality: O.dataQ, smartSubsample: true, effort: 5 };
    const meta = await src.metadata();
    const buf = await src.webp({ ...opts, alphaQuality: 100 }).toBuffer();
    t.setImage(new Uint8Array(buf)).setMimeType('image/webp');
    if (t.getURI()) t.setURI(t.getURI().replace(/\.\w+$/, '.webp'));
  }
} else if (O.textures === 'ktx2') {
  const { toktx, Mode } = await import('@gltf-transform/cli');
  const base = { encoder: sharp, mipmaps: true };
  // normals + data: UASTC (RDO off for normals, light RDO for data), zstd 18
  await doc.transform(toktx({ ...base, mode: Mode.UASTC, slots: /normalTexture/, level: 2, rdo: O.ktxRdo > 1, rdoLambda: Math.min(0.75, O.ktxRdo / 4), zstd: 18 }));
  await doc.transform(toktx({ ...base, mode: Mode.UASTC, slots: /^(occlusionTexture|metallicRoughnessTexture|roughnessTexture|metallicTexture|clearcoat\w*Texture|transmissionTexture|thicknessTexture|sheenRoughnessTexture|specularTexture|iridescence\w*Texture|anisotropyTexture)$/, level: 2, rdo: true, rdoLambda: O.ktxRdo, zstd: 18 }));
  if (O.colourKtx === 'etc1s') await doc.transform(toktx({ ...base, mode: Mode.ETC1S, slots: groups.colour, quality: 255, compression: 2 }));
  else await doc.transform(toktx({ ...base, mode: Mode.UASTC, slots: groups.colour, level: 2, rdo: true, rdoLambda: O.ktxRdo, zstd: 18 }));
}

if (O.simplify) { const { simplify } = await import('@gltf-transform/functions'); await doc.transform(simplify({ simplifier: (await import('meshoptimizer')).MeshoptSimplifier, ratio: +O.simplify, error: 0.0005 })); }

if (O.geometry === 'meshopt') {
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: O.posBits, quantizeNormal: O.normBits, quantizeTexcoord: O.uvBits, quantizeColor: 8 }));
} else if (O.geometry === 'draco') {
  await doc.transform(draco({ method: 'edgebreaker', quantizePosition: O.posBits, quantizeNormal: O.normBits, quantizeTexcoord: O.uvBits, quantizeColor: 8, quantizeGeneric: 12 }));
}
await doc.transform(prune());
fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
await io.write(OUT, doc);

// ---------- report ----------
const after = { file_bytes: fs.statSync(OUT).size, ...(await stats(await io.read(OUT))) };
let validation = null;
try { const validator = (await import('gltf-validator')).default; const r = await validator.validateBytes(new Uint8Array(fs.readFileSync(OUT)), { maxIssues: 50 });
  validation = { errors: r.issues.numErrors, warnings: r.issues.numWarnings, first: r.issues.messages.filter(m => m.severity <= 1).slice(0, 8).map(m => `${m.code} ${m.pointer || ''}`) }; } catch (e) { validation = { skipped: e.message.slice(0, 120) }; }
const budgetOk = O.budget == null || after.file_bytes <= O.budget;
const report = { tool: 'model-optimisation-phone/optimise.mjs', in: IN, out: OUT, options: { ...O, maxFor: O.maxFor.map(([r, v]) => `${r.source}=${v}`) }, seconds: +((Date.now() - t0) / 1000).toFixed(1),
  before, after, ratio: +(after.file_bytes / before.file_bytes).toFixed(3), budget: O.budget, budget_ok: budgetOk, validation,
  same_file_for_desktop_and_phone: true };
fs.writeFileSync(O.report, JSON.stringify(report, null, 1));

const pad = (s, n) => String(s).padEnd(n);
console.log(`OUT  ${OUT}  ${KB(after.file_bytes)}  (${(100 * report.ratio).toFixed(1)}% of input)  ${after.triangles.toLocaleString()} tris  ${after.draw_calls} draw calls  ${report.seconds}s`);
console.log(`     triangles unchanged: ${after.triangles === before.triangles ? 'yes' : 'NO (' + before.triangles + ' -> ' + after.triangles + ')'}   GPU texture memory ~${KB(before.gpu_texture_bytes_est)} -> ~${KB(after.gpu_texture_bytes_est)}`);
console.log('\n     ' + pad('texture', 44) + pad('kind', 8) + pad('before', 22) + 'after');
for (let i = 0; i < after.textures.length; i++) { const a = after.textures[i]; const b = before.textures.find(x => x.name === a.name) || {};
  console.log('     ' + pad(a.name.slice(0, 42), 44) + pad(a.kind, 8) + pad(`${b.width || '?'}px ${(b.mime || '').replace('image/', '')} ${KB(b.bytes || 0)}`, 22) + `${a.width}px ${a.mime.replace('image/', '')} ${KB(a.bytes)}`); }
console.log(`\n     validator: ${validation.errors ?? '?'} errors, ${validation.warnings ?? '?'} warnings${validation.first?.length ? '  ' + validation.first.join('; ') : ''}`);
if (O.budget != null) console.log(`     budget ${KB(O.budget)}: ${budgetOk ? 'PASS' : 'OVER by ' + KB(after.file_bytes - O.budget)}`);
console.log(`     report: ${O.report}\n`);
if (!budgetOk) {
  const big = [...after.textures].sort((a, b) => b.bytes - a.bytes).slice(0, 4);
  console.log('OVER BUDGET. Nothing was lowered automatically (quality first). Safe options, in order:\n' +
    `  1. Parts that are small on screen: --max-for "<part or texture name>=1024" (biggest now: ${big.map(t => t.name + ' ' + KB(t.bytes)).join(', ')}).\n` +
    '  2. --textures ktx2: similar download, but textures stay compressed in GPU memory (about 4x less), which is what phones run out of.\n' +
    '  3. Raise the budget: Sujon\'s rule is same quality on phone; size is negotiable, looks are not.\n');
  process.exit(2);
}
if (validation.errors) process.exit(4);
