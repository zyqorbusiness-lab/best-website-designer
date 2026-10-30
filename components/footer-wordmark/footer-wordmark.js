/* footer-wordmark.js: Zyqor Components (MIT). No dependencies.
   - The giant wordmark rises letter by letter when the footer comes into view (and follows the scroll a little).
   - Email link: Gmail compose on desktop, the phone's own mail app (mailto:) on touch devices.
   - Copy button: short press, "Copied" for 1.4 s, then back (no confetti, no giant toast).
   - Live local time for the studio's city (Intl, no library).
   - Back to top: smooth, instant under reduced motion; moves focus to the top of the page. */
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
const coarse = () => matchMedia('(hover:none) and (pointer:coarse)').matches;

export function footerWordmark(root) {
  const mark = root.querySelector('.fw-mark');
  if (mark && !mark.dataset.split) {
    const word = mark.textContent.trim(); mark.setAttribute('aria-label', word); mark.textContent = ''; mark.dataset.split = '1';
    [...word].forEach((ch, i) => { const s = document.createElement('span'); s.className = 'fw-l'; s.textContent = ch; s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true'); mark.append(s); });
  }
  if (!reduced() && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { root.classList.toggle('is-in', e.isIntersecting); }, { threshold: 0.25 }).observe(root);
    let raf = 0; const par = () => { raf = 0; const r = root.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight - r.top) / r.height)); root.style.setProperty('--fw-p', p.toFixed(3)); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(par); }, { passive: true }); par();
  } else root.classList.add('is-in', 'fw--static');
  root.querySelectorAll('[data-email]').forEach((a) => { const em = a.dataset.email; a.href = coarse() ? `mailto:${em}` : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(em)}`; if (!coarse()) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } });
  root.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const label = b.querySelector('span') || b; const old = label.textContent;
    try { await navigator.clipboard.writeText(b.dataset.copy); label.textContent = 'Copied'; } catch (_) { label.textContent = b.dataset.copy; }
    b.classList.add('is-done'); setTimeout(() => { label.textContent = old; b.classList.remove('is-done'); }, 1400);
  }));
  const clock = root.querySelector('[data-tz]');
  if (clock) { const f = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clock.dataset.tz }); const t = () => { clock.textContent = f.format(new Date()); }; t(); setInterval(t, 15000); }
  root.querySelectorAll('[data-top]').forEach((b) => b.addEventListener('click', () => { scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); const tgt = document.querySelector(b.dataset.top) || document.body; tgt.setAttribute('tabindex', '-1'); tgt.focus({ preventScroll: true }); }));
}
if (typeof document !== 'undefined') {
  const init = () => document.querySelectorAll('[data-footer-wordmark]').forEach((el) => footerWordmark(el));
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}
