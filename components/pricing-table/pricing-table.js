/* pricing-table.js: Zyqor Components (MIT). No dependencies.
   [data-pricing] with a .pr-seg (buttons, role="tab") and one .pr-plan panel per button (role="tabpanel").
   - Segmented switch with a sliding pill that stretches mid-flight and settles (the "liquid squish" toggle).
   - The price rolls digit by digit to the new value (odometer); screen readers get the plain price.
   - Proper tabs: arrow keys / Home / End move between plans; only the active panel is in the tab order.
   - Reduced motion: the pill and the digits jump; panels switch without the slide. */
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
const fmt = (n) => n.toLocaleString('en-US');

function odometer(el) {
  let cur = '';
  const set = (value, prefix = '$') => {
    const txt = prefix + fmt(value);
    el.setAttribute('aria-label', txt);
    const chars = [...txt];
    // rebuild columns only when the length changes; otherwise roll in place
    if (chars.length !== cur.length) {
      el.innerHTML = '';
      chars.forEach((ch) => {
        const col = document.createElement('span'); col.className = /\d/.test(ch) ? 'od-col' : 'od-sym'; col.setAttribute('aria-hidden', 'true');
        if (/\d/.test(ch)) { const strip = document.createElement('span'); strip.className = 'od-strip'; strip.innerHTML = [...'0123456789'].map((d) => `<span>${d}</span>`).join(''); col.append(strip); }
        else col.textContent = ch;
        el.append(col);
      });
    }
    [...el.children].forEach((col, i) => {
      const ch = chars[i]; if (col.classList.contains('od-sym')) { col.textContent = ch; return; }
      const strip = col.firstChild; strip.style.transitionDelay = reduced() ? '0ms' : (i * 45) + 'ms';
      strip.style.transform = `translateY(${-Number(ch) * 10}%)`;
    });
    cur = txt;
  };
  return { set };
}

export function pricing(root) {
  const tabs = [...root.querySelectorAll('.pr-seg [role=tab]')], panels = [...root.querySelectorAll('.pr-plan')];
  const pill = root.querySelector('.pr-pill'), od = odometer(root.querySelector('.pr-price')), unit = root.querySelector('.pr-unit');
  let idx = -1;
  const movePill = (t, animate) => {
    const r = t.getBoundingClientRect(), pr = t.parentElement.getBoundingClientRect();
    pill.style.width = r.width + 'px'; pill.style.transform = `translateX(${r.left - pr.left}px)`;
    if (animate && !reduced()) pill.animate([{ scale: '1 1' }, { scale: '1.14 .92', offset: .45 }, { scale: '1 1' }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
  };
  const select = (i, focus) => {
    if (i === idx) return; const dir = i > idx ? 1 : -1; idx = i;
    tabs.forEach((t, k) => { const on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    panels.forEach((p, k) => { const on = k === i; p.hidden = !on; if (on) { p.style.setProperty('--pr-dir', dir); p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); } });
    movePill(tabs[i], true); od.set(+tabs[i].dataset.price);
    if (unit) unit.textContent = tabs[i].dataset.unit || 'starting price';
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => { const n = tabs.length; const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key]; if (k === undefined) return; e.preventDefault(); select((k + n) % n, true); });
  });
  addEventListener('resize', () => movePill(tabs[idx], false));
  (document.fonts?.ready || Promise.resolve()).then(() => movePill(tabs[idx], false));
  select(+root.dataset.start || 0);
  return { select };
}
if (typeof document !== 'undefined') {
  const init = () => document.querySelectorAll('[data-pricing]').forEach((el) => pricing(el));
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}
