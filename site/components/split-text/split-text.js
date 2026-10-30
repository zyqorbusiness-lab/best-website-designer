/* split-text.js: Zyqor Components (MIT). No dependencies.
   splitText(el, { by: 'lines' | 'words' | 'chars', anim: 'rise' | 'chars' | 'scrub' }) or auto on [data-split].
   - Keeps inline markup one level deep (a <span class="serif"> word stays styled).
   - Screen readers get the original sentence once (visually hidden copy); the split copy is aria-hidden.
   - Lines are measured after fonts load and re-measured on resize, so line breaks are always right.
   - 'rise': each line slides up out of a mask. 'chars': letters flip up with a stagger.
     'scrub': words go from faint to full ink as the paragraph scrolls through the screen (reading highlight). */
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

function tokens(root) {
  const out = [];
  root.childNodes.forEach((n) => {
    if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((w) => w && out.push({ w, wrap: null }));
    else if (n.nodeType === 1) {
      if (n.tagName === 'BR') { out.push({ br: true }); return; }
      n.textContent.split(/(\s+)/).forEach((w) => w && out.push({ w, wrap: n }));
    }
  });
  return out;
}

export function splitText(el, opts = {}) {
  const o = { by: el.dataset.split || 'lines', anim: el.dataset.splitAnim || (el.dataset.split === 'chars' ? 'chars' : el.dataset.split === 'words' ? 'scrub' : 'rise'), stagger: +el.dataset.stagger || 0, ...opts };
  if (!el.__src) el.__src = el.innerHTML;
  el.innerHTML = el.__src;
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  const toks = tokens(el);
  el.textContent = '';
  const sr = document.createElement('span'); sr.className = 'st-sr'; sr.textContent = label;
  const vis = document.createElement('span'); vis.className = 'st-vis'; vis.setAttribute('aria-hidden', 'true');
  el.append(sr, vis);
  const words = [];
  let ci = 0;
  toks.forEach((t) => {
    if (t.br) { vis.append(document.createElement('br')); return; }
    if (/^\s+$/.test(t.w)) { vis.append(document.createTextNode(' ')); return; }
    let host = document.createElement('span'); host.className = 'st-word';
    let inner = host;
    if (t.wrap) { const c = t.wrap.cloneNode(false); host.append(c); inner = c; }
    if (o.by === 'chars' || o.anim === 'chars') {
      [...t.w].forEach((ch) => { const s = document.createElement('span'); s.className = 'st-char'; s.textContent = ch; s.style.setProperty('--ci', ci++); inner.append(s); });
    } else inner.textContent = t.w;
    vis.append(host); words.push(host);
  });
  words.forEach((w, i) => w.style.setProperty('--wi', i));
  if (o.anim === 'rise' || o.by === 'lines') {
    // group words by their top edge into lines, then wrap each line in a mask
    const lines = []; let top = null;
    words.forEach((w) => { const t = w.offsetTop; if (top === null || Math.abs(t - top) > 3) { lines.push([]); top = t; } lines[lines.length - 1].push(w); });
    vis.textContent = '';
    lines.forEach((ws, i) => {
      const line = document.createElement('span'); line.className = 'st-line';
      const lin = document.createElement('span'); lin.className = 'st-line-in'; lin.style.setProperty('--li', i);
      ws.forEach((w, j) => { lin.append(w); if (j < ws.length - 1) lin.append(document.createTextNode(' ')); });
      line.append(lin); vis.append(line);
    });
  }
  el.classList.add('st', 'st--' + o.anim);
  el.__split = { words, o };
  return el.__split;
}

const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((es) => {
  es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); if (!e.target.hasAttribute('data-split-repeat')) io.unobserve(e.target); } else if (e.target.hasAttribute('data-split-repeat')) e.target.classList.remove('is-in'); });
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }) : null;

const scrubbers = new Set(); let raf = 0;
function scrubFrame() {
  raf = 0; const vh = innerHeight;
  scrubbers.forEach((el) => {
    const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    // progress 0 when the block's top hits 85% of the screen, 1 when its bottom reaches 35%
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.5)));
    const ws = el.__split.words, lit = p * ws.length;
    ws.forEach((w, i) => w.style.setProperty('--lit', Math.min(1, Math.max(0, lit - i)).toFixed(3)));
  });
}
const onScroll = () => { if (!raf) raf = requestAnimationFrame(scrubFrame); };

export function play(el) { el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in'); }

function init() {
  const els = [...document.querySelectorAll('[data-split]')];
  const run = () => els.forEach((el) => {
    const s = splitText(el);
    if (reduced()) { el.classList.add('is-in', 'st--static'); return; }
    if (s.o.anim === 'scrub') { scrubbers.add(el); onScroll(); } else if (io) io.observe(el); else el.classList.add('is-in');
  });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(run);
  addEventListener('scroll', onScroll, { passive: true });
  let w = innerWidth, t;
  addEventListener('resize', () => { if (innerWidth === w) return; w = innerWidth; clearTimeout(t); t = setTimeout(() => els.forEach((el) => { const was = el.classList.contains('is-in'); splitText(el); if (was || reduced()) el.classList.add('is-in'); }), 180); });
}
if (typeof document !== 'undefined') document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
