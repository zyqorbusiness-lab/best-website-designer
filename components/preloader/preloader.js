/* preloader.js: Zyqor Components (MIT). No dependencies.
   preloader({ assets: [...urls], el, minTime, once }) -> Promise that resolves when the page may show.
   - Honest progress: bytes really received (streams the files with fetch), weighted by size; falls back to a
     file count when a server sends no length. Never a fake timer bar.
   - No flash: if everything arrives within 350 ms (cached), the loader is never shown.
   - Exit: the counter finishes at 100, the two panels part with a clip-path wipe, then the page content rises.
   - once: true shows it once per browser session (sessionStorage).
   - Reduced motion: no counting animation and a short fade instead of the wipe.
   The files are fetched with the normal HTTP cache, so the page's own requests reuse them. */
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadOne(url, onBytes, onSize) {
  const res = await fetch(url, { cache: 'force-cache' }).catch(() => null);
  if (!res || !res.ok) { onSize(1); onBytes(1); return; }
  const len = +res.headers.get('content-length') || 0; onSize(len || 1);
  if (!res.body || !len) { await res.arrayBuffer().catch(() => {}); onBytes(len || 1); return; }
  const rd = res.body.getReader();
  for (;;) { const { done, value } = await rd.read(); if (done) break; onBytes(value.byteLength); }
}

export async function preloader(opts = {}) {
  const el = opts.el || document.querySelector('.pl');
  const assets = opts.assets || JSON.parse(el?.dataset.assets || '[]');
  const o = { minTime: 900, once: el?.hasAttribute('data-once'), ...opts };
  if (!el) return;
  const key = 'pl-seen:' + location.pathname;
  if (o.once && sessionStorage.getItem(key)) { el.remove(); document.documentElement.classList.add('pl-done'); return; }
  const num = el.querySelector('.pl-num'), bar = el.querySelector('.pl-bar i'), status = el.querySelector('.pl-status');
  let total = 0, got = 0, sized = 0, shown = 0, target = 0, raf = 0;
  const t0 = performance.now(); let visible = false;
  const showTimer = setTimeout(() => { visible = true; el.classList.add('is-visible'); }, 350);
  const paint = () => {
    raf = 0; shown += (target - shown) * (reduced() ? 1 : 0.12); if (target - shown < 0.2) shown = target;
    const v = Math.floor(shown); if (num) num.textContent = String(v).padStart(3, '0'); if (bar) bar.style.transform = `scaleX(${(shown / 100).toFixed(4)})`;
    if (shown < target) raf = requestAnimationFrame(paint);
  };
  const update = () => { const known = sized === assets.length; const p = total ? got / total : 0; target = Math.min(known ? 100 : 92, Math.round(p * 100)); if (!raf) raf = requestAnimationFrame(paint); };
  el.setAttribute('aria-busy', 'true');
  await Promise.all(assets.map((u) => loadOne(u, (b) => { got += b; update(); }, (s) => { total += s; sized++; update(); })));
  target = 100; update();
  clearTimeout(showTimer);
  if (!visible) { el.remove(); document.documentElement.classList.add('pl-done'); return; }   // cached: never flash it
  const left = o.minTime - (performance.now() - t0); if (left > 0) await wait(left);
  while (shown < 100) await wait(30);
  if (status) status.textContent = 'Loaded';
  el.setAttribute('aria-busy', 'false');
  await wait(reduced() ? 50 : 260);
  el.classList.add('is-leaving'); document.documentElement.classList.add('pl-done');
  if (o.once) sessionStorage.setItem(key, '1');
  await wait(reduced() ? 300 : 1100);
  el.classList.remove('is-visible', 'is-leaving'); el.hidden = true;
}
