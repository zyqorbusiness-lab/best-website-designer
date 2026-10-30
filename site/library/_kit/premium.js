/* Zyqor Library kit: premium.js (loaded by chrome.js on every concept, desktop + phone build).
   Oct 30 2026 premium layer, after Sujon's "simple sa" note. Adds, without touching each concept's own code:
   1. a type band after the first section, made of the page's own section headings, moving only with scroll
      (no endless loop: Sujon's rule), colour-blocked in the concept's own ink;
   2. section headings that rise out of a mask instead of a plain fade;
   3. a hairline scroll progress in the accent colour;
   4. the brand name as a giant wordmark at the bottom of the footer, letters rising when it comes into view.
   Everything is decorative (aria-hidden) and off under prefers-reduced-motion (static, still visible).
   A concept can opt out of any part: <body data-pm-off="band mark progress heads">. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const star = '<svg class="pm-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1"/></svg>';

export function premium({ name = document.body.dataset.name || '', foot } = {}) {
  const html = document.documentElement, body = document.body;
  const off = (body.dataset.pmOff || '').split(/\s+/);
  html.classList.add('pm-on');
  const main = document.querySelector('main');

  /* 1. type band from the page's own headings */
  if (main && !off.includes('band')) {
    const secs = [...main.querySelectorAll(':scope > section')];
    const heads = secs.slice(1).map((s) => s.querySelector('h2')).filter(Boolean)
      .map((h) => h.textContent.replace(/\s+/g, ' ').trim().replace(/[.:]$/, '')).filter((t) => t && t.length < 70).slice(0, 4);
    if (secs.length > 1 && heads.length >= 2) {
      const band = document.createElement('div');
      band.className = 'pm-band'; band.setAttribute('aria-hidden', 'true');
      band.innerHTML = heads.map((t, i) => `<span class="pm-w${i % 2 ? ' pm-w--s' : ''}">${esc(t)}</span>${star}`).join('');
      secs[0].after(band);
      import('./fx/marquee.js').then(({ marquee }) => marquee(band, { speed: 0, loop: false, velocity: true })).catch(() => {});
    }
  }

  /* 2. mask-rise section headings (own check: some concepts animate their h2 with split text instead of data-rv).
        Only headings of normal content sections (direct children of <main>, not the first, not pinned or fixed). */
  if (main && !off.includes('heads') && !reduced) {
    const hs = [...main.querySelectorAll(':scope > section.section:not(:first-child) .h2')]
      .filter((h) => !h.closest('[data-pm-skip],details,dialog') && !/sticky|fixed/.test(getComputedStyle(h.parentElement).position));
    const show = () => { const vh = innerHeight; hs.forEach((h) => { if (h.classList.contains('pm-in')) return; const r = h.getBoundingClientRect(); if (r.top < vh * 0.92 && r.bottom > 0) h.classList.add('pm-in'); }); };
    hs.forEach((h) => h.classList.add('pm-h')); show();
    let raf2 = 0; addEventListener('scroll', () => { if (!raf2) raf2 = requestAnimationFrame(() => { raf2 = 0; show(); }); }, { passive: true }); addEventListener('resize', show);
  }

  /* 3. scroll progress hairline */
  if (!off.includes('progress')) {
    const bar = document.createElement('div'); bar.className = 'pm-progress'; bar.setAttribute('aria-hidden', 'true'); body.append(bar);
    let raf = 0; const upd = () => { raf = 0; const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0})`; };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true }); addEventListener('resize', upd); upd();
  }

  /* 4. giant wordmark in the footer */
  const fin = foot && foot.querySelector('.zk-foot-in');
  if (fin && name && !off.includes('mark')) {
    let ws = name.replace(/&amp;/g, '&').split(/\s+/); while (ws.join(' ').length > 16 && ws.length > 1) ws.pop(); while (ws.length > 1 && ws[ws.length - 1] === '&') ws.pop();
    const word = ws.join(' ');
    const mark = document.createElement('p'); mark.className = 'pm-mark'; mark.setAttribute('aria-hidden', 'true');
    [...word].forEach((ch, i) => { const s = document.createElement('span'); s.className = 'pm-l'; s.textContent = ch === ' ' ? '\u00a0' : ch; s.style.setProperty('--i', i); mark.append(s); });
    fin.insertBefore(mark, fin.querySelector('.zk-small'));
    const fit = () => { mark.style.fontSize = '100px'; mark.style.width = 'max-content'; const w = mark.getBoundingClientRect().width || 1; mark.style.width = ''; mark.style.fontSize = Math.max(24, Math.min(320, 100 * fin.clientWidth / w * 0.97)).toFixed(1) + 'px'; };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(fit); addEventListener('resize', fit); fit();
    if (reduced || !('IntersectionObserver' in window)) mark.classList.add('is-in');
    else new IntersectionObserver(([e]) => { if (e.isIntersecting) mark.classList.add('is-in'); }, { threshold: 0.3 }).observe(mark);
  }
}
