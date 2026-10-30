/* Zyqor Library kit: chrome.js  (ES module, one line per page)
     <script type="module" src="../../_kit/chrome.js"></script>
   Reads the page's <body> attributes, filled by tools/new-concept.mjs:
     data-id="N002"  data-tier="normal|advanced|premium"  data-name="Kiln & Quiet"  [class="dark" on dark-led pages]
   Draws: top glass bar (back to library, "Zyqor Library · Concept N002 · fictional brand", tier badge, credits button),
          a credits sheet (<dialog>) read from ./credits.json, and the honest footer with previous / next built concept.
   Also loads the shared liquid-glass material from /assets/glass/ (quiet no-op if missing).
   The phone/desktop redirect is NOT here: it must run before first paint, so it is inline in the template <head>. */
const KIT = new URL('./', import.meta.url);
const ROOT = new URL('../', import.meta.url);                 // site/library/
const GLASS = new URL('../../assets/glass/', import.meta.url);
const html = document.documentElement, body = document.body;
const isM = html.dataset.build === 'm';
const id = body.dataset.id || 'N000';
const tier = (body.dataset.tier || 'normal').toLowerCase();
const name = body.dataset.name || 'Concept';
const dark = body.classList.contains('dark');
const TIER = { normal: 'Normal', advanced: 'Advanced', premium: 'Premium' }[tier] || 'Normal';
const libHome = isM ? new URL('m.html', ROOT).href : ROOT.href;
const pageOf = (it) => new URL(it.path + (isM ? 'm.html' : ''), ROOT).href;

const css = (href, cb) => { if (document.querySelector(`link[href="${href}"]`)) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.onerror = () => l.remove(); if (cb) l.onload = cb; document.head.append(l); };
css(new URL('chrome.css', KIT).href);
css(new URL('liquid-glass.css', GLASS).href);
if (!window.ZyqorGlass && !document.querySelector('script[src$="liquid-glass.js"]')) {
  const s = document.createElement('script'); s.src = new URL('liquid-glass.js', GLASS).href; s.defer = true; s.onerror = () => s.remove(); document.head.append(s);
}

const ico = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  next: '<path d="M9 18l6-6-6-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
  wa: '<path d="M4.5 19.5l1.2-3.9A8 8 0 1 1 8.6 18.5z"/><path d="M9.2 9.3c.3 1.8 1.8 3.6 3.6 4.4l1.2-.9 1.7.8"/>',
  ig: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.8 7.2v.01"/>',
  ext: '<path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>'
};
const svg = (k) => `<svg class="zk-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ico[k]}</svg>`;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const gl = dark ? 'lg lg--dark' : 'lg';

/* ---- top bar ---- */
const bar = document.createElement('header');
bar.className = 'zk-bar';
bar.setAttribute('aria-label', 'Zyqor Library');
bar.innerHTML = `
  <a class="zk-pill zk-back ${gl} lg-pill lg-btn" href="${libHome}" aria-label="Back to the Zyqor Library">${svg('back')}<span class="zk-hide-s">Library</span></a>
  <div class="zk-pill zk-tag ${gl} lg-pill" role="note" aria-label="Concept ${id}, ${TIER} tier, fictional brand">
    <span class="zk-brand zk-hide-m">Zyqor Library</span><span class="zk-dot zk-hide-m" aria-hidden="true"></span>
    <b class="zk-id">Concept&nbsp;${id}</b><span class="zk-tier" data-tier="${tier}">${TIER}</span>
    <span class="zk-fict zk-hide-m">fictional brand</span>
  </div>
  <button class="zk-pill zk-cred-btn ${gl} lg-pill lg-btn" type="button" aria-haspopup="dialog" aria-label="Credits and licences">${svg('info')}<span class="zk-hide-s">Credits</span></button>`;
body.prepend(bar);
if (dark) html.classList.add('zk-dark');

/* ---- credits sheet ---- */
const dlg = document.createElement('dialog');
dlg.className = `zk-sheet ${dark ? 'lg lg-menu lg--dark' : 'lg lg-menu'}`;
dlg.setAttribute('aria-labelledby', 'zk-sheet-h');
dlg.innerHTML = `<div class="zk-sheet-in">
  <div class="zk-sheet-top"><p class="zk-mono">Concept ${id} &middot; ${TIER}</p><button class="zk-x" type="button" aria-label="Close credits">${svg('close')}</button></div>
  <h2 id="zk-sheet-h" class="zk-sheet-h">${esc(name)} <span>is a fictional brand.</span></h2>
  <p class="zk-sheet-p">Designed and hand-coded by Sujon Hoque at Zyqor Studio to test one idea. Not a real company, not a client, nothing for sale. Code: MIT licence.</p>
  <ul class="zk-cred" role="list"><li class="zk-cred-wait">Loading credits</li></ul></div>`;
body.append(dlg);
const open = () => { if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); };
const close = () => { if (dlg.open && typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open'); };
bar.querySelector('.zk-cred-btn').addEventListener('click', open);
dlg.querySelector('.zk-x').addEventListener('click', close);
dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });

/* ---- footer ---- */
const foot = document.createElement('footer');
foot.className = 'zk-foot';
foot.innerHTML = `<div class="zk-foot-in">
  <p class="zk-honest"><b>${esc(name)}</b> is not a real company. Concept ${id} is ${TIER === 'Advanced' ? 'an' : 'a'} ${TIER.toLowerCase()} study from the Zyqor Library, designed and coded by Sujon Hoque at Zyqor Studio. Real 3D assets, credited below; no AI imagery.</p>
  <ul class="zk-cred zk-cred--foot" role="list"></ul>
  <div class="zk-contact" aria-label="Hire Zyqor Studio">
    <p class="zk-mono">Want a site like this? Hire Zyqor Studio</p>
    <ul class="zk-contact-list" role="list">
      <li><a class="zk-pill zk-mail lg lg--dark lg-pill lg-btn" href="mailto:zyqorbusiness@gmail.com" target="_blank" rel="noopener noreferrer">${svg('mail')}<span><small>Email</small><em>zyqorbusiness@gmail.com</em></span></a></li>
      <li><a class="zk-pill lg lg--dark lg-pill lg-btn" href="https://wa.me/919547908593" target="_blank" rel="noopener noreferrer">${svg('wa')}<span><small>WhatsApp</small><em>+91 95479 08593</em></span></a></li>
      <li><a class="zk-pill lg lg--dark lg-pill lg-btn" href="https://www.instagram.com/zyqor_og/" target="_blank" rel="noopener noreferrer">${svg('ig')}<span><small>Instagram</small><em>@zyqor_og</em></span></a></li>
    </ul>
  </div>
  <nav class="zk-nav" aria-label="More concepts">
    <a class="zk-pill zk-prev lg lg--dark lg-pill lg-btn" href="${libHome}" hidden>${svg('back')}<span><small>Previous</small><em></em></span></a>
    <a class="zk-pill zk-all lg lg--dark lg-pill lg-btn" href="${libHome}">${svg('grid')}<span>All concepts</span></a>
    <a class="zk-pill zk-next lg lg--dark lg-pill lg-btn" href="${libHome}" hidden><span><small>Next</small><em></em></span>${svg('next')}</a>
  </nav>
  <p class="zk-small"><span>Zyqor Studio &middot; Library</span><span>Concept ${id}</span></p>
</div>`;
body.append(foot);
/* premium layer (Oct 30 2026): type band, mask headings, progress hairline, footer wordmark */
css(new URL('premium.css', KIT).href);
import('./premium.js').then((m) => m.premium({ name, foot })).catch(() => {});
/* contact: Gmail compose on a fine pointer (desktop), the mail app on touch */
if (matchMedia('(pointer:fine)').matches) {
  const m = foot.querySelector('.zk-mail');
  if (m) m.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=zyqorbusiness@gmail.com&su=' + encodeURIComponent('Website enquiry (Concept ' + id + ')');
}

/* credits: one file for both builds */
function credLine(c) {
  const who = [c.title && `<b>${esc(c.title)}</b>`, c.author && `by ${esc(c.author)}`].filter(Boolean).join(' ');
  const src = c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.source || 'source')}${svg('ext')}</a>` : esc(c.source || '');
  return `<li><span class="zk-mono">${esc(c.what || 'Asset')}</span><span>${who}${src ? ', ' + src : ''}${c.licence ? ` <i>${esc(c.licence)}</i>` : ''}${c.note ? `<small>${esc(c.note)}</small>` : ''}</span></li>`;
}
fetch(new URL('credits.json', location.href)).then((r) => (r.ok ? r.json() : null)).then((j) => {
  const items = (j && j.items) || [];
  const codeLine = { what: 'Design + code', title: 'Zyqor Studio', author: 'Sujon Hoque', licence: 'MIT' };
  const htmlList = [codeLine, ...items].map(credLine).join('');
  document.querySelectorAll('.zk-cred').forEach((ul) => { ul.innerHTML = htmlList; });
}).catch(() => { document.querySelectorAll('.zk-cred').forEach((ul) => { ul.innerHTML = '<li><span class="zk-mono">Credits</span><span>See credits.json in this folder.</span></li>'; }); });

/* previous / next among BUILT concepts. kit v2: reads the slim _data/nav.json ([id, name, path] of built concepts, a few KB)
   that tools/library-build.mjs writes, instead of the ~135 KB library.json; falls back to library.json if nav.json is missing. */
const idle = window.requestIdleCallback || ((f) => setTimeout(f, 900));
const getNav = () => fetch(new URL('_data/nav.json', ROOT)).then((r) => (r.ok ? r.json() : Promise.reject(new Error('no nav.json'))))
  .then((n) => n.built.map(([i, nm, p]) => ({ id: i, name: nm, path: p })))
  .catch(() => fetch(new URL('library.json', ROOT)).then((r) => (r.ok ? r.json() : null)).then((lib) => (lib && lib.items ? lib.items.filter((it) => it.status === 'built').map((it) => ({ id: it.id, name: it.name, path: it.path })) : [])));
idle(() => {
  getNav().then((list) => {
    let built = list.slice();
    if (!built.some((it) => it.id === id)) {          // a concept still building sits between its id neighbours
      const self = { id, name, path: location.pathname.replace(/^.*\/library\//, '').replace(/[^/]*$/, '') };
      const at = built.findIndex((it) => it.id > id); built.splice(at < 0 ? built.length : at, 0, self);
    }
    const i = built.findIndex((it) => it.id === id);
    if (i < 0 || built.length < 2) return;
    const set = (sel, it) => { const a = foot.querySelector(sel); a.href = pageOf(it); a.querySelector('em').textContent = `${it.id} · ${it.name}`; a.hidden = false; };
    set('.zk-prev', built[(i - 1 + built.length) % built.length]);
    set('.zk-next', built[(i + 1) % built.length]);
  }).catch(() => {});
});

/* the bar tucks away while scrolling down a long page, returns on scroll up (desktop + phone) */
let lastY = scrollY, ticking = false;
addEventListener('scroll', () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => { const y = scrollY; bar.classList.toggle('is-tucked', y > 240 && y > lastY + 4); if (y < lastY - 4 || y < 240) bar.classList.remove('is-tucked'); lastY = y; ticking = false; });
}, { passive: true });

window.ZL = Object.assign(window.ZL || {}, { id, tier, name, isM, root: ROOT.href, openCredits: open });
