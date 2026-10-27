// Lab index: reveal on scroll, floating poster preview, and any concept added to the registry after this page was written.
import { CONCEPTS } from './_kit/registry.js';
document.documentElement.classList.add('js');
const list = document.getElementById('list');
const have = new Set([...list.querySelectorAll('[data-slug]')].map((li) => li.dataset.slug));
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
for (const c of CONCEPTS) {
  if (have.has(c.slug)) continue;
  const [a, b, x] = c.palette;
  const li = document.createElement('li');
  li.className = 'rw'; li.dataset.rv = ''; li.dataset.slug = c.slug;
  li.style.cssText = `--a:${a};--b:${b};--x:${x}`;
  li.innerHTML = `<a href="${c.slug}/" data-img="${c.slug}/poster.webp"><span class="n">${esc(c.n)}</span><span class="br">${esc(c.brand)}</span><span class="kd">${esc(c.kind)}</span><span class="pt">${esc(c.pattern)}</span><span class="pl" aria-hidden="true">${c.palette.map((k) => `<i style="--k:${k}"></i>`).join('')}</span><span class="go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a>`;
  list.append(li);
}
const n = list.children.length;
document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = String(n).padStart(2, '0'); });

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = document.querySelectorAll('[data-rv]');
if (reduce || !('IntersectionObserver' in window)) els.forEach((el) => el.classList.add('in'));
else {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el, i) => { if (el.classList.contains('rw')) el.style.transitionDelay = `${(i % 4) * 50}ms`; io.observe(el); });
}

// Gmail compose on desktop, mailto elsewhere.
const mail = document.getElementById('mail');
if (mail && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  mail.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=zyqorbusiness@gmail.com&su=' + encodeURIComponent('Project enquiry from the Zyqor Lab');
  mail.target = '_blank'; mail.rel = 'noopener';
}

// Floating poster that trails the cursor over the list.
const pv = document.getElementById('pv'), img = document.getElementById('pvi'), num = document.getElementById('pvn');
if (pv && !reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, on = false;
  const tick = () => {
    x += (tx - x) * 0.14; y += (ty - y) * 0.14;
    const r = Math.max(-6, Math.min(6, (tx - x) * 0.05));
    pv.style.transform = `translate3d(${x + 36}px,${y - 190}px,0) rotate(${r}deg) scale(${on ? 1 : 0.86})`;
    raf = (on || Math.abs(tx - x) > 0.5) ? requestAnimationFrame(tick) : 0;
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
  list.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; go(); });
  list.addEventListener('pointerover', (e) => {
    const a = e.target.closest('a[data-img]'); if (!a) return;
    if (!on) { x = e.clientX; y = e.clientY; }
    const src = a.dataset.img;
    if (!img.src.endsWith(src)) { img.src = src; }
    num.textContent = a.querySelector('.n').textContent + ' / ' + String(n).padStart(2, '0');
    on = true; pv.classList.add('on'); go();
  });
  list.addEventListener('pointerleave', () => { on = false; pv.classList.remove('on'); go(); });
}
