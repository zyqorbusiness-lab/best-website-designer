#!/usr/bin/env node
// tier-check.mjs: scan a site folder and say which tier it meets (NORMAL / ADVANCED / PREMIUM), with the red flags
// that block shipping. No dependencies. Node 18+.
//   node tier-check.mjs path/to/site [--tier normal|advanced|premium] [--with shared/kit,shared/fx] [--json]
//   --with: folders the page also loads (a shared kit); they count for feature detection, not for the weight budget
// Exit 1 when a red flag is found or the requested tier's budget/feature gate fails.
import fs from 'node:fs'; import path from 'node:path';
const args = process.argv.slice(2); const dir = args.find((a, i) => !a.startsWith('--') && !['--tier', '--with'].includes(args[i - 1])) || '.';
const want = args.includes('--tier') ? (args[args.indexOf('--tier') + 1] || '').toLowerCase() : '';
const withDirs = args.includes('--with') ? args[args.indexOf('--with') + 1].split(',') : []; const asJson = args.includes('--json');
const SKIP = new Set(['node_modules', '.git', 'vendor', 'screens', 'screenshots', 'qa', '.cache']);
function walk(d, out = []) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (SKIP.has(e.name) || e.name.startsWith('.')) continue; const p = path.join(d, e.name); e.isDirectory() ? walk(p, out) : out.push(p); } return out; }
const files = walk(dir); const ext = (f) => path.extname(f).toLowerCase();
const bytes = (fs_) => fs_.reduce((s, f) => s + fs.statSync(f).size, 0);
const text = files.filter((f) => ['.html', '.css', '.js', '.mjs'].includes(ext(f))).map((f) => [f, fs.readFileSync(f, 'utf8')]);
const shared = withDirs.flatMap((d) => walk(d)).filter((f) => ['.html', '.css', '.js', '.mjs'].includes(ext(f))).map((f) => fs.readFileSync(f, 'utf8'));
const all = text.map(([, t]) => t).join('\n') + '\n' + shared.join('\n');   // shared kit folders count for features, not for the budget
// colour checks look at CSS only (stylesheets, <style> blocks, style="" attributes), so a script that NAMES a banned colour is not flagged
const cssText = text.filter(([f]) => ext(f) === '.css').map(([, t]) => t).join('\n') + [...text.filter(([f]) => ext(f) === '.html').map(([, t]) => t).join('\n').matchAll(/<style[^>]*>([\s\S]*?)<\/style>|style="([^"]*)"/g)].map((m) => m[1] || m[2]).join('\n');
const html = text.filter(([f]) => ext(f) === '.html').map(([, t]) => t).join('\n');
const visible = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
const kinds = { model: ['.glb', '.gltf', '.bin', '.ktx2'], hdri: ['.hdr', '.exr'], video: ['.mp4', '.webm'], image: ['.webp', '.avif', '.jpg', '.jpeg', '.png'], font: ['.woff2', '.woff', '.ttf', '.otf'], audio: ['.mp3', '.ogg', '.m4a', '.wav'] };
const inv = Object.fromEntries(Object.entries(kinds).map(([k, xs]) => [k, files.filter((f) => xs.includes(ext(f)))]));
const total = bytes(files);
const has = (re) => re.test(all);
const features = {
  three: has(/from ['"][^'"]*three[^'"]*['"]|THREE\.|WebGLRenderer/), gsap: has(/gsap|ScrollTrigger/), lenis: has(/Lenis/),
  scrollLinked: has(/addEventListener\(['"]scroll|ScrollTrigger|scroll-timeline|animation-timeline|IntersectionObserver/),
  hdri: inv.hdri.length > 0 || has(/RGBELoader|HDRLoader|PMREMGenerator/), pbr: has(/GLTFLoader|MeshStandardMaterial|MeshPhysicalMaterial|clearcoat|transmission|sheen|iridescence/)  /* glTF materials are metal/rough PBR */,
  toneMapping: has(/ACESFilmic|AgX|toneMapping/), shader: has(/ShaderMaterial|gl_FragColor|fragmentShader|#version 300 es/),
  physics: has(/matter-js|Matter\.Engine|cannon|rapier/), reducedMotion: has(/prefers-reduced-motion/), poster: inv.image.some((f) => /poster/i.test(f)) || has(/poster/),
  glass: has(/backdrop-filter/), focusVisible: has(/:focus-visible/), lazy: has(/loading=["']lazy|IntersectionObserver|import\(/),
  configurator: has(/data-variant|data-finish|swatch|colourway|colorway/i), sound: inv.audio.length > 0 || has(/AudioContext|new Audio\(/),
};
const fontFamilies = new Set([...all.matchAll(/font-family:\s*["']?([^;"',}]+)/g)].map((m) => m[1].trim()).filter((f) => !/^(var\(|inherit|ui-|system-ui|sans-serif|serif|monospace|-apple)/.test(f)));
// red flags: Sujon's 30-item avoid list, the parts a machine can see
const flags = [];
const flag = (cond, msg) => { if (cond) flags.push(msg); };
flag(/#(?:6366f1|a855f7|7000ff|0f172a|e2ff32|ccff00|d4ff00|00f0ff)\b/i.test(cssText), 'banned AI/neon hex colour (#6366F1, #A855F7, #0F172A, acid lime, cyber cyan...)');
flag(/(?:background(?:-color)?|--[\w-]*bg[\w-]*)\s*:\s*#(?:000|000000|fff|ffffff)\b/i.test(cssText), 'pure black or pure white background');
flag(/lucide/i.test(all), 'Lucide icons (avoid list)');
flag(/font-family:[^;]*\b(?:Inter|Geist|Space Grotesk)\b(?! Tight)/i.test(all), 'Inter / Geist / Space Grotesk (avoid list)');
flag(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(visible), 'emoji in visible text (avoid list: use SVG icons)');
flag(/\u2014/.test(visible), 'em dash in visible copy (avoid list)');
flag(/lorem ipsum/i.test(visible), 'lorem ipsum');
flag(/trusted by|\b\d(?:\.\d)?\s*\/\s*5\b|★|\+\d{2,}%/i.test(visible), 'proof claim (trusted by / star rating / +NN%): only real, permitted proof');
flag(/hover:scale-105|:hover[^{]*\{[^}]*scale\(1\.0[5-9]\)/i.test(all), 'card bounce on hover (scale 1.05+): keep the frame still, move the image');
flag(/box-shadow:\s*0\s+\d+px\s+\d{2,}px/i.test(cssText), 'large drop shadow (avoid list): use hairlines and a top highlight');
flag(/animation:[^;]*infinite/i.test(all) && !/prefers-reduced-motion/.test(all), 'infinite animation without a reduced-motion stop');
flag(/cdn\.tailwindcss\.com|unpkg\.com\/[^"']*@latest/i.test(all), 'development CDN or @latest in production (pin and self-host)');
// tier gates
const MB = 1024 * 1024;
const gates = {
  normal: { budget: 1.5 * MB, need: ['reducedMotion', 'focusVisible'], label: 'NORMAL ($300): one premium section/page, one signature interaction' },
  advanced: { budget: 3 * MB, need: ['reducedMotion', 'focusVisible', 'scrollLinked', 'lazy'], anyOf: [['three', 'shader', 'physics', 'gsap']], label: 'ADVANCED ($1k): scroll-driven 3D / shaders / physics, 3-5 sections' },
  premium: { budget: 8 * MB, need: ['reducedMotion', 'focusVisible', 'scrollLinked', 'lazy', 'three', 'hdri', 'toneMapping', 'poster'], anyOf: [['pbr'], ['configurator', 'glass']], label: 'PREMIUM ($10k): real PBR model, HDRI, cinematic scroll, configurator, glass' },
};
function meets(k) { const g = gates[k]; const miss = g.need.filter((n) => !features[n]); for (const grp of g.anyOf || []) if (!grp.some((n) => features[n])) miss.push('one of ' + grp.join('/')); const over = total > g.budget; return { ok: !miss.length && !over, missing: miss, overBudget: over ? `${(total / MB).toFixed(2)} MB > ${(g.budget / MB).toFixed(1)} MB` : null }; }
const res = Object.fromEntries(Object.keys(gates).map((k) => [k, meets(k)]));
const best = ['premium', 'advanced', 'normal'].find((k) => res[k].ok) || 'below normal';
const out = { dir, totalMB: +(total / MB).toFixed(2), files: files.length, inventory: Object.fromEntries(Object.entries(inv).map(([k, v]) => [k, { count: v.length, MB: +(bytes(v) / MB).toFixed(2) }])), fontFamilies: [...fontFamilies], features, tiers: res, meets: best, redFlags: flags };
const fail = flags.length > 0 || (want && gates[want] && !res[want].ok);
if (asJson) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`${dir}: ${out.totalMB} MB in ${files.length} files (vendor/ and screenshots excluded)`);
  console.log('assets   ' + Object.entries(out.inventory).map(([k, v]) => `${k} ${v.count} (${v.MB} MB)`).join(', '));
  console.log('fonts    ' + (out.fontFamilies.join(', ') || '-') + (out.fontFamilies.length > 3 ? '   <- more than 3 families' : ''));
  console.log('features ' + Object.entries(features).filter(([, v]) => v).map(([k]) => k).join(', '));
  for (const [k, r] of Object.entries(res)) console.log(`${r.ok ? 'MEETS ' : 'misses'} ${gates[k].label}${r.missing.length ? '  missing: ' + r.missing.join(', ') : ''}${r.overBudget ? '  over budget: ' + r.overBudget : ''}`);
  for (const f of flags) console.log('RED FLAG ' + f);
  console.log(`VERDICT meets ${best.toUpperCase()}${want ? ` (asked: ${want.toUpperCase()} -> ${res[want]?.ok ? 'PASS' : 'FAIL'})` : ''}${flags.length ? ', ' + flags.length + ' red flag(s): FAIL' : ''}`);
}
process.exit(fail ? 1 : 0);
