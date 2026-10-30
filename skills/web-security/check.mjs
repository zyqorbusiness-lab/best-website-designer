#!/usr/bin/env node
/* web-security check.mjs (Zyqor Studio, MIT). Node 18+, no dependencies.
   Usage:
     node check.mjs <folder>            scan a static site / repo folder
     node check.mjs --url <https://...>  check a live site's headers, cookies and HTTPS redirect
     node check.mjs <folder> --json      machine-readable report
   Exit code 1 when anything HIGH is found, so it can gate a deploy or a CI job. */
import fs from 'node:fs'; import path from 'node:path';

const args = process.argv.slice(2); const JSON_OUT = args.includes('--json');
const urlArg = args.includes('--url') ? args[args.indexOf('--url') + 1] : undefined; const dir = args.find((a) => !a.startsWith('--') && a !== urlArg);
const findings = [];
const add = (sev, rule, where, fix) => findings.push({ sev, rule, where, fix });

const SECRET_PATTERNS = [
  ['AWS access key', /AKIA[0-9A-Z]{16}/],
  ['Google API key', /AIza[0-9A-Za-z_\-]{35}/],
  ['Stripe secret key', /sk_live_[0-9A-Za-z]{20,}/],
  ['Stripe restricted key', /rk_live_[0-9A-Za-z]{20,}/],
  ['GitHub token', /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b|github_pat_[A-Za-z0-9_]{50,}/],
  ['Slack token', /xox[baprs]-[0-9A-Za-z-]{10,}/],
  ['OpenAI-style secret key', /\bsk-(proj-)?[A-Za-z0-9_\-]{32,}/],
  ['Private key block', /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['Password in a URL', /[a-z]+:\/\/[^\s:@\/]+:[^\s:@\/]{4,}@[^\s\/]+/i],
  ['Generic secret assignment', /\b(api[_-]?key|secret|passw(or)?d|access[_-]?token)\b\s*[:=]\s*['"][^'"\s]{12,}['"]/i],
];
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', '.cache', 'dist-parts']);
const TEXT = /\.(html?|js|mjs|cjs|ts|jsx|tsx|css|json|md|txt|env|yml|yaml|toml|xml|svg|php|py)$/i;

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) { if (e.name === '.git') add('HIGH', 'git folder inside the deploy folder', path.join(d, e.name), 'Never deploy .git; it exposes your whole history. Deploy a build folder instead.'); continue; }
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

function scanFolder(root) {
  const files = walk(root); const rel = (p) => path.relative(root, p);
  let headersFile = null;
  for (const f of files) {
    const base = path.basename(f);
    if (/^\.env(\..*)?$/.test(base) && base !== '.env.example') add('HIGH', '.env file in the folder', rel(f), 'Keep .env out of the repo and the deploy (add it to .gitignore). Put secrets in the host\'s environment settings.');
    if (/\.(pem|key|p12|pfx)$/i.test(base)) add('HIGH', 'Key or certificate file', rel(f), 'Remove it and rotate the key.');
    if (/\.map$/.test(base)) add('LOW', 'Source map published', rel(f), 'Fine for open source; for client work, do not deploy .map files.');
    if (base === 'vercel.json' || base === '_headers' || base === 'netlify.toml' || base === '.htaccess') headersFile = f;
    if (!TEXT.test(base)) continue;
    let s; try { s = fs.readFileSync(f, 'utf8'); } catch { continue; }
    if (s.length > 3_000_000) continue;
    const lines = s.split('\n');
    lines.forEach((line, i) => {
      if (line.length > 4000) return; // minified bundles: skip pattern noise
      for (const [name, re] of SECRET_PATTERNS) if (re.test(line) && !/example|placeholder|your[_-]?key|xxxx/i.test(line)) add('HIGH', `Possible secret: ${name}`, `${rel(f)}:${i + 1}`, 'Remove it, rotate it at the provider, and load it server-side from an environment variable. Anything shipped to the browser is public.');
    });
    if (/\.html?$/i.test(base)) {
      for (const m of s.matchAll(/<a\b[^>]*target=["']?_blank[^>]*>/gi)) if (!/rel=["'][^"']*noopener/i.test(m[0]) && !/rel=["'][^"']*noreferrer/i.test(m[0])) add('MEDIUM', 'target=_blank without rel="noopener"', `${rel(f)}: ${m[0].slice(0, 90)}`, 'Add rel="noopener noreferrer" so the opened page cannot control yours (reverse tabnabbing).');
      for (const m of s.matchAll(/<(script|link|img|iframe|video|audio|source)\b[^>]*(src|href)=["']http:\/\/[^"']+/gi)) add('MEDIUM', 'Mixed content (http:// resource)', `${rel(f)}: ${m[0].slice(0, 100)}`, 'Use https:// or a local copy; browsers block or warn on http resources on https pages.');
      for (const m of s.matchAll(/<script\b[^>]*src=["'](https?:)?\/\/[^"']+["'][^>]*>/gi)) if (!/integrity=/.test(m[0])) add('LOW', 'Third-party script without integrity (SRI)', `${rel(f)}: ${m[0].slice(0, 110)}`, 'Pin the exact version and add integrity="sha384-..." crossorigin="anonymous", or self-host the file.');
      for (const m of s.matchAll(/<form\b[^>]*action=["']http:\/\/[^"']+/gi)) add('HIGH', 'Form posts over http', `${rel(f)}: ${m[0].slice(0, 100)}`, 'Post forms only to https endpoints.');
      for (const m of s.matchAll(/<iframe\b(?![^>]*sandbox)[^>]*src=["']https?:\/\/[^"']+/gi)) add('LOW', 'iframe without sandbox', `${rel(f)}: ${m[0].slice(0, 100)}`, 'Add sandbox="allow-scripts allow-same-origin ..." with only what the embed needs.');
      const sendsData = [...s.matchAll(/<form\b[^>]*>/gi)].some((m) => /action=["']https?:|method=["']post/i.test(m[0]));
      if (sendsData && !/(honeypot|name=["']_gotcha|data-honeypot|turnstile|recaptcha|hcaptcha)/i.test(s)) add('LOW', 'Form without spam protection', rel(f), 'Add a hidden honeypot field (and server-side rate limiting) or a privacy-friendly challenge such as Turnstile.');
    }
    if (/\.(m?js|html?)$/i.test(base)) {
      lines.forEach((line, i) => {
        if (line.length > 4000) return;
        if (/\beval\s*\(|new Function\s*\(/.test(line)) add('MEDIUM', 'eval / new Function', `${rel(f)}:${i + 1}`, 'Avoid evaluating strings; it blocks a strict Content-Security-Policy and runs injected code.');
        if (/\.(innerHTML|outerHTML)\s*[+]?=\s*[^'"`;]*\b(location|search|hash|params|query|input|value|data|message|response|json)\b/i.test(line)) add('MEDIUM', 'innerHTML built from data', `${rel(f)}:${i + 1}`, 'Use textContent, or create elements; never put URL, form or fetched text into innerHTML without escaping (XSS).');
        if (/localStorage\.setItem\([^)]*(token|password|secret)/i.test(line)) add('MEDIUM', 'Secret stored in localStorage', `${rel(f)}:${i + 1}`, 'Any script on the page can read localStorage. Keep sessions in HttpOnly, Secure, SameSite cookies.');
      });
    }
  }
  // security headers config
  const want = ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Strict-Transport-Security'];
  const frame = ['X-Frame-Options', 'frame-ancestors'];
  if (!headersFile) add('MEDIUM', 'No security headers config found', root, 'Add headers in vercel.json / _headers / netlify.toml (see examples/ in this skill).');
  else {
    const h = fs.readFileSync(headersFile, 'utf8');
    for (const k of want) if (!h.includes(k)) add(k === 'Content-Security-Policy' ? 'MEDIUM' : 'LOW', `Header not set: ${k}`, rel(headersFile), `Add ${k}; see SKILL.md section 2 for a value that works with three.js / GSAP sites.`);
    if (!frame.some((k) => h.includes(k))) add('LOW', 'Clickjacking protection not set', rel(headersFile), 'Add X-Frame-Options: SAMEORIGIN or CSP frame-ancestors \'self\'.');
  }
  const gi = path.join(root, '.gitignore');
  if (fs.existsSync(path.join(root, 'package.json')) && (!fs.existsSync(gi) || !/\.env/.test(fs.readFileSync(gi, 'utf8')))) add('MEDIUM', '.gitignore does not exclude .env', '.gitignore', 'Add .env and .env.* (keep .env.example).');
}

async function scanUrl(u) {
  let r; try { r = await fetch(u, { redirect: 'manual' }); } catch (e) { add('HIGH', 'Site not reachable', u, String(e.message || e)); return; }
  if (r.status >= 300 && r.status < 400) { const loc = r.headers.get('location'); r = await fetch(new URL(loc, u), { redirect: 'follow' }); }
  const h = r.headers;
  const need = { 'content-security-policy': 'MEDIUM', 'strict-transport-security': 'MEDIUM', 'x-content-type-options': 'LOW', 'referrer-policy': 'LOW', 'permissions-policy': 'LOW' };
  for (const [k, sev] of Object.entries(need)) if (!h.get(k)) add(sev, `Response header missing: ${k}`, u, 'Set it at the host (vercel.json headers, _headers, or server config).');
  if (!h.get('x-frame-options') && !/frame-ancestors/.test(h.get('content-security-policy') || '')) add('LOW', 'Clickjacking protection missing', u, 'X-Frame-Options: SAMEORIGIN or CSP frame-ancestors.');
  const csp = h.get('content-security-policy') || '';
  if (/'unsafe-inline'/.test(csp) && /script-src/.test(csp)) add('LOW', "CSP allows 'unsafe-inline' scripts", u, 'Move inline scripts to files or use hashes/nonces.');
  if (h.get('server') && /\d/.test(h.get('server'))) add('LOW', 'Server version disclosed', `server: ${h.get('server')}`, 'Hide version numbers in the Server header.');
  if (h.get('x-powered-by')) add('LOW', 'X-Powered-By disclosed', `x-powered-by: ${h.get('x-powered-by')}`, 'Remove the header.');
  for (const c of (h.getSetCookie?.() || [])) { const n = c.split('=')[0]; if (!/;\s*secure/i.test(c)) add('MEDIUM', `Cookie without Secure: ${n}`, u, 'Add Secure.'); if (!/;\s*httponly/i.test(c)) add('LOW', `Cookie without HttpOnly: ${n}`, u, 'Add HttpOnly unless JS truly needs it.'); if (!/;\s*samesite/i.test(c)) add('LOW', `Cookie without SameSite: ${n}`, u, 'Add SameSite=Lax (or Strict).'); }
  if (u.startsWith('https://')) {
    try { const plain = await fetch(u.replace('https://', 'http://'), { redirect: 'manual' }); if (!(plain.status >= 300 && plain.status < 400 && /^https:/.test(plain.headers.get('location') || ''))) add('MEDIUM', 'http:// does not redirect to https://', u.replace('https://', 'http://'), 'Redirect all http traffic to https (most hosts have a switch).'); } catch { /* http closed entirely is fine */ }
  }
}

if (urlArg) await scanUrl(urlArg); else if (dir && fs.existsSync(dir)) scanFolder(path.resolve(dir));
else { console.log('Usage: node check.mjs <folder> | --url https://example.com [--json]'); process.exit(2); }

const order = { HIGH: 0, MEDIUM: 1, LOW: 2 }; findings.sort((a, b) => order[a.sev] - order[b.sev]);
const counts = findings.reduce((m, f) => (m[f.sev] = (m[f.sev] || 0) + 1, m), {});
if (JSON_OUT) console.log(JSON.stringify({ target: urlArg || dir, counts, findings }, null, 2));
else {
  console.log(`web-security check: ${urlArg || dir}`);
  if (!findings.length) console.log('No findings. (A clean scan is not a guarantee; read SKILL.md section 7.)');
  for (const f of findings) console.log(`\n[${f.sev}] ${f.rule}\n  where: ${f.where}\n  fix:   ${f.fix}`);
  console.log(`\nHIGH ${counts.HIGH || 0}  MEDIUM ${counts.MEDIUM || 0}  LOW ${counts.LOW || 0}  -> ${counts.HIGH ? 'FAIL' : 'PASS'}`);
}
process.exit(counts.HIGH ? 1 : 0);
