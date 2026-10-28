// Which pages to test, and the static half of the link checker.
import fs from 'node:fs';
import path from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git', 'qa-report', 'dist-qa']);

// Every .html file under the folder. Folders starting with "_" or "." are
// treated as private (templates, kits) and skipped unless includeUnderscore.
export function walkHtml(root, { includeUnderscore = false } = {}) {
  const out = [];
  const walk = dir => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name.startsWith('.')) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (SKIP_DIRS.has(ent.name) || (!includeUnderscore && ent.name.startsWith('_'))) continue;
        walk(full);
      } else if (/\.html?$/i.test(ent.name)) out.push(path.relative(root, full).split(path.sep).join('/'));
    }
  };
  walk(root);
  // Home first, then by depth; inside a folder index.html leads.
  const key = f => [f.split('/').length, f.replace(/(^|\/)index\.html$/, '$1')];
  return out.sort((a, b) => { const [da, ka] = key(a), [db, kb] = key(b); return da - db || ka.localeCompare(kb); });
}

// Turn a list of files into "pages". A folder holding both index.html and a phone
// file (default m.html) is ONE page with a desktop build and a phone build: the
// desktop profiles load index.html, the phone profiles load the phone file.
export function toPages(files, phoneFile = 'm.html') {
  const set = new Set(files);
  const pages = [];
  for (const f of files) {
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/') + 1) : '';
    const base = f.slice(dir.length);
    if (phoneFile && base === phoneFile && set.has(dir + 'index.html')) continue; // folded into its index
    const urlPath = base === 'index.html' ? dir : f;
    const page = { path: urlPath || '/', desktop: urlPath, phone: urlPath };
    if (phoneFile && base === 'index.html' && set.has(dir + phoneFile)) page.phone = dir + phoneFile;
    pages.push(page);
  }
  return pages;
}

// Same-origin crawl for a live URL (no browser; reads href="..." from the HTML).
export async function crawl(base, max = 30) {
  const origin = new URL(base).origin;
  const seen = new Set([new URL(base).href]);
  const queue = [new URL(base).href];
  const found = [];
  while (queue.length && found.length < max) {
    const u = queue.shift();
    let html = '';
    try {
      const r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
      if (!/text\/html/.test(r.headers.get('content-type') || '')) continue;
      html = await r.text();
    } catch { continue; }
    found.push(u);
    for (const m of html.matchAll(/\shref="([^"#]+)/g)) {
      let n;
      try { n = new URL(m[1].replace(/&amp;/g, '&'), u); } catch { continue; }
      n.hash = ''; n.search = '';
      if (n.origin !== origin || seen.has(n.href)) continue;
      if (/\.(png|jpe?g|webp|avif|gif|svg|mp4|webm|pdf|zip|glb|css|js|json|xml|ico|woff2?)$/i.test(n.pathname)) continue;
      seen.add(n.href); queue.push(n.href);
    }
  }
  return found.map(u => {
    const p = new URL(u).pathname.replace(/^\//, '');
    return { path: p || '/', desktop: p, phone: p };
  });
}

// Static link scan of one HTML file: every href/src/poster/srcset in the markup.
export function staticRefs(html) {
  const cleaned = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, m => /\ssrc=/.test(m.slice(0, m.indexOf('>'))) ? m.slice(0, m.indexOf('>') + 1) : '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const refs = [];
  for (const m of cleaned.matchAll(/<(a|link|script|img|source|video|audio|iframe|use|image)\b([^>]*)>/gi)) {
    const tag = m[1].toLowerCase(), attrs = m[2];
    const get = n => { const r = new RegExp('\\s' + n + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i').exec(attrs); return r ? (r[2] ?? r[3]) : null; };
    for (const a of ['href', 'src', 'poster', 'xlink:href', 'data-src']) {
      const v = get(a);
      if (v != null) refs.push({ tag, attr: a, url: v.replace(/&amp;/g, '&').trim(), target: get('target') || '', rel: get('rel') || '' });
    }
    const ss = get('srcset');
    if (ss) for (const part of ss.split(',')) { const u = part.trim().split(/\s+/)[0]; if (u) refs.push({ tag, attr: 'srcset', url: u }); }
  }
  return refs;
}

export function isSkippable(u) {
  return !u || /^(data:|blob:|javascript:|mailto:|tel:|sms:|whatsapp:|#)/i.test(u) || /\{\{|\$\{/.test(u);
}
