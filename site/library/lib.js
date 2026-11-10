/* Zyqor Library index: one script for index.html (desktop) and m.html (phone).
   Reads library.json (written by tools/library-build.mjs). Filters: tier, category, technique, search, show coming.
   State lives in the URL (?tier=premium&cat=food&tech=Glass&q=moon&coming=0), so every filtered view is a deep link.
   Honest by design: only concepts whose qa.json says PASS are "built" and linked; the rest are palette cards marked Coming. */
import { press } from './_kit/fx/press.js';
const isM = document.documentElement.dataset.build === 'm';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TIERS = [['all', 'All'], ['normal', 'Normal'], ['advanced', 'Advanced'], ['premium', 'Premium']];
const ICON = {
  arrow: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};
const PAGE = isM ? 36 : 48;

const data = await fetch('library.json', { cache: 'no-cache' }).then((r) => r.json());
const items = data.items;
const built = items.filter((i) => i.status === 'built');
const url = new URL(location.href);
const st = {
  tier: TIERS.some(([k]) => k === url.searchParams.get('tier')) ? url.searchParams.get('tier') : 'all',
  cat: url.searchParams.get('cat') || '',
  tech: url.searchParams.get('tech') || '',
  q: url.searchParams.get('q') || '',
  coming: url.searchParams.get('coming') !== '0',
  shown: PAGE,
};
const conceptHref = (it) => it.path + (isM ? 'm.html' : 'index.html');

/* ---------- hero ledger ---------- */
const led = $('#ledger');
led.innerHTML = ['normal', 'advanced', 'premium'].map((t) => {
  const c = data.counts[t];
  const pct = c.total ? (c.built / c.total) * 100 : 0;
  return `<button class="led-row" type="button" data-tier="${t}" data-press><span class="led-name">${data.tiers[t]}</span><span class="led-bar" style="--b:${pct.toFixed(1)}"><i></i></span><span class="led-n"><b>${c.built}</b> built / ${c.total}</span></button>`;
}).join('') + `<p class="led-note">${data.total.built} of ${data.total.all} concepts are built and pass QA at 1440, 390 and 360 px. The rest are planned and marked <em>Coming</em>; each one is a fictional brand, labelled Concept.</p>`;
$$('.led-row', led).forEach((b) => b.addEventListener('click', () => { setTier(b.dataset.tier); $('#index').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }));
$('#n-built').textContent = data.total.built;
$('#big-n').textContent = String(data.total.built).padStart(3, '0');

/* ---------- featured: the built ones, newest qa first ---------- */
const feat = $('#feat-grid');
if (built.length) {
  const fb = [...built].sort((a, b) => String(b.qaDate || '').localeCompare(String(a.qaDate || ''))).slice(0, isM ? 4 : 6);
  feat.innerHTML = fb.map((it) => `
    <a class="fcard" href="${esc(conceptHref(it))}" style="--fc2:${it.pal[1]}" data-press>
      <div class="fcard-media">
        ${it.thumb ? `<img src="${esc(it.path)}thumb.webp" alt="${esc(it.name)}: ${esc(it.idea)}" loading="lazy" decoding="async" width="640" height="400">` : swatch(it)}
        <div class="fcard-meta"><span class="pill">${esc(it.id)} &middot; ${esc(data.tiers[it.tier])}</span><span class="pill pill--dark"><span class="dot dot--live"></span>Live</span></div>
      </div>
      <div class="fcard-body"><h3 class="fcard-name">${esc(it.name)}</h3><p class="fcard-idea">${esc(it.idea)}</p><span class="fcard-go">${ICON.arrow}</span></div>
    </a>`).join('');
} else { $('#feat').hidden = true; }

/* ---------- filter controls ---------- */
const seg = $('#seg');
const tc = (t) => t === 'all' ? items.length : data.counts[t].total;
seg.innerHTML = '<span class="seg-thumb" aria-hidden="true"></span>' + TIERS.map(([k, l]) => `<button type="button" data-tier="${k}" aria-pressed="false">${l}<small>${tc(k)}</small></button>`).join('');
const segThumb = $('.seg-thumb', seg);
$$('button', seg).forEach((b) => b.addEventListener('click', () => setTier(b.dataset.tier)));
function moveThumb() {
  const on = $(`button[data-tier="${st.tier}"]`, seg); if (!on) return;
  segThumb.style.width = on.offsetWidth + 'px'; segThumb.style.transform = `translateX(${on.offsetLeft}px)`;
}
const chipRow = (el, list, key) => {
  el.innerHTML = list.map((c) => `<button class="chip-b" type="button" data-k="${esc(c.key)}" aria-pressed="false">${esc(c.label)}<small>${c.count}</small></button>`).join('');
  $$('button', el).forEach((b) => b.addEventListener('click', () => { st[key] = st[key] === b.dataset.k ? '' : b.dataset.k; st.shown = PAGE; render(); }));
};
chipRow($('#f-cat'), data.categories, 'cat');
chipRow($('#f-tech'), data.techniques, 'tech');
const search = $('#q'); search.value = st.q;
let qT; search.addEventListener('input', () => { clearTimeout(qT); qT = setTimeout(() => { st.q = search.value.trim(); st.shown = PAGE; render(); }, 120); });
const comingBox = $('#coming'); comingBox.checked = st.coming;
comingBox.addEventListener('change', () => { st.coming = comingBox.checked; st.shown = PAGE; render(); });
$('#f-clear').addEventListener('click', () => { Object.assign(st, { tier: 'all', cat: '', tech: '', q: '', coming: true, shown: PAGE }); search.value = ''; comingBox.checked = true; render(); });
$('#more').addEventListener('click', () => { st.shown += PAGE; render(true); });

/* filters panel: inline panel on desktop, bottom sheet (<dialog>) on phone */
const fBtn = $('#f-btn'), panel = $('#f-panel');
if (isM) {
  const sheet = $('#sheet');
  fBtn.addEventListener('click', () => { sheet.showModal(); fBtn.setAttribute('aria-expanded', 'true'); });
  sheet.addEventListener('close', () => fBtn.setAttribute('aria-expanded', 'false'));
  $('#sheet-done').addEventListener('click', () => sheet.close());
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
} else {
  fBtn.addEventListener('click', () => { const open = panel.hidden; panel.hidden = !open; fBtn.setAttribute('aria-expanded', String(open)); });
}

function setTier(t) { st.tier = t; st.shown = PAGE; render(); }

/* ---------- cards ---------- */
function shapeOf(it) { const n = parseInt(it.id.slice(1), 10) || 0; return 'abcd'[n % 4]; }
function swatch(it) {
  return `<div class="swatch" style="--k1:${it.pal[0]};--k2:${it.pal[1]};--k3:${it.pal[2]}" aria-hidden="true"><span class="sw-pal"><i style="--x:${it.pal[0]}"></i><i style="--x:${it.pal[1]}"></i><i style="--x:${it.pal[2]}"></i></span><span class="sw-name">${esc(it.name)}</span></div>`;
}
function card(it) {
  const isB = it.status === 'built';
  const vars = `--k1:${it.pal[0]};--k2:${it.pal[1]};--k3:${it.pal[2]}`;
  const art = isB && it.thumb ? `<img src="${esc(it.path)}thumb.webp" alt="" loading="lazy" decoding="async" width="640" height="400">` : swatch(it);
  const badge = isB ? '<span class="pill pill--dark"><span class="dot dot--live"></span>Live</span>' : (it.status === 'building' ? '<span class="pill coming">In QA</span>' : '<span class="pill coming">Coming</span>');
  const inner = `
    <div class="card-art" style="${vars}">${art}<span class="art-tags">${badge}</span></div>
    <div class="card-body">
      <div class="card-id"><span class="t">${esc(it.id)} &middot; ${esc(data.tiers[it.tier])}</span><span>${esc(it.catLabel)}</span></div>
      <h3 class="card-name">${esc(it.name)}<span class="sr-only">${isB ? ', live concept' : ', coming soon'}</span></h3>
      <p class="card-idea">${esc(it.idea)}</p>
      <div class="card-tags">${it.tags.slice(0, 3).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
    </div>`;
  return isB
    ? `<a class="card is-built rv" href="${esc(conceptHref(it))}" data-tier="${it.tier}" data-shape="${shapeOf(it)}" data-press>${inner}</a>`
    : `<article class="card is-planned rv" data-tier="${it.tier}" data-shape="${shapeOf(it)}">${inner}</article>`;
}

const grid = $('#grid'), count = $('#count'), empty = $('#empty'), more = $('#more');
const io = reduced ? null : new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
const rank = { built: 0, building: 1, planned: 2 };
function matches(it) {
  if (st.tier !== 'all' && it.tier !== st.tier) return false;
  if (st.cat && it.cat !== st.cat) return false;
  if (st.tech && !it.tags.includes(st.tech)) return false;
  if (!st.coming && it.status !== 'built') return false;
  if (st.q) { const q = st.q.toLowerCase(); if (!(`${it.id} ${it.name} ${it.idea} ${it.tech} ${it.catLabel} ${it.tags.join(' ')}`.toLowerCase().includes(q))) return false; }
  return true;
}
function render(append) {
  const list = items.filter(matches).sort((a, b) => rank[a.status] - rank[b.status] || a.id.localeCompare(b.id));
  const vis = list.slice(0, st.shown);
  const prev = append ? grid.children.length : 0;
  if (!append) grid.innerHTML = vis.map(card).join('');
  else grid.insertAdjacentHTML('beforeend', vis.slice(prev).map(card).join(''));
  const fresh = [...grid.children].slice(prev);
  if (io) fresh.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 8, 7) * 40}ms`; io.observe(el); }); else fresh.forEach((el) => el.classList.add('in'));
  const nb = list.filter((i) => i.status === 'built').length;
  count.innerHTML = `<b>${list.length}</b> shown &middot; ${nb} live`;
  empty.hidden = list.length > 0;
  more.hidden = list.length <= st.shown;
  more.querySelector('small').textContent = `${Math.min(PAGE, list.length - st.shown)} more`;
  $$('button', seg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tier === st.tier)));
  $$('#f-cat button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === st.cat)));
  $$('#f-tech button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === st.tech)));
  const nf = (st.cat ? 1 : 0) + (st.tech ? 1 : 0) + (st.coming ? 0 : 1);
  $('#f-badge').textContent = nf ? String(nf) : '';
  moveThumb();
  press('[data-press]');
  const u = new URL(location.href);
  [['tier', st.tier !== 'all' && st.tier], ['cat', st.cat], ['tech', st.tech], ['q', st.q], ['coming', !st.coming && '0']].forEach(([k, v]) => v ? u.searchParams.set(k, v) : u.searchParams.delete(k));
  history.replaceState(null, '', u);
}
render();
addEventListener('resize', moveThumb);
document.fonts && document.fonts.ready.then(moveThumb);

window.__library = { st, items, render };
