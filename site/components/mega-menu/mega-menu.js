/* mega-menu.js: Zyqor Components (MIT). No dependencies.
   Desktop: top-level buttons open wide panels (hover with intent delay, or click), Esc closes and returns focus,
   ArrowDown moves into the panel, focus leaving the menu closes it.
   Phone (< 900px): a menu button opens a full-screen sheet; each group is an accordion; focus is trapped in the
   sheet, Esc closes it, the page behind does not scroll. Same links, same order, on both. */
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine = () => matchMedia('(hover:hover) and (pointer:fine)').matches;
const mobile = () => matchMedia('(max-width:899px)').matches;

export function megaMenu(nav) {
  const triggers = [...nav.querySelectorAll('.mm-trigger')];
  const burger = nav.querySelector('.mm-burger'), sheet = nav.querySelector('.mm-list');
  let open = null, tIn = 0, tOut = 0;
  const panelOf = (t) => document.getElementById(t.getAttribute('aria-controls'));
  const setOpen = (t, focusFirst) => {
    if (open && open !== t) { open.setAttribute('aria-expanded', 'false'); panelOf(open).classList.remove('is-open'); }
    open = t; nav.classList.toggle('has-open', !!t);
    if (!t) return;
    t.setAttribute('aria-expanded', 'true'); const p = panelOf(t); p.classList.add('is-open');
    if (focusFirst) p.querySelector('a,button')?.focus();
  };
  const close = (returnFocus) => { const t = open; if (!t) return; t.setAttribute('aria-expanded', 'false'); panelOf(t).classList.remove('is-open'); open = null; nav.classList.remove('has-open'); if (returnFocus) t.focus(); };
  triggers.forEach((t) => {
    const item = t.closest('.mm-item');
    t.addEventListener('click', () => { if (mobile()) { const ex = t.getAttribute('aria-expanded') === 'true'; t.setAttribute('aria-expanded', String(!ex)); panelOf(t).classList.toggle('is-open', !ex); return; } open === t ? close() : setOpen(t); });
    t.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' && !mobile()) { e.preventDefault(); setOpen(t, true); } });
    item.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse' || mobile() || !fine()) return; clearTimeout(tOut); clearTimeout(tIn); tIn = setTimeout(() => setOpen(t), open ? 0 : 90); });
    item.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'mouse' || mobile()) return; clearTimeout(tIn); tOut = setTimeout(() => { if (open === t) close(); }, 220); });
  });
  nav.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('is-sheet')) { toggleSheet(false); return; }
    close(true);
  });
  nav.addEventListener('focusout', (e) => { if (!mobile() && open && !nav.contains(e.relatedTarget)) close(); });
  document.addEventListener('pointerdown', (e) => { if (!mobile() && open && !nav.contains(e.target)) close(); });
  // phone sheet
  const focusables = () => [...sheet.querySelectorAll('a,button')].filter((el) => el.offsetParent !== null);
  const trap = (e) => { if (e.key !== 'Tab') return; const f = [burger, ...focusables()]; const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } };
  const toggleSheet = (on) => {
    nav.classList.toggle('is-sheet', on); burger.setAttribute('aria-expanded', String(on)); burger.querySelector('.mm-burger-label').textContent = on ? 'Close' : 'Menu';
    document.documentElement.classList.toggle('mm-lock', on);
    if (on) { document.addEventListener('keydown', trap); setTimeout(() => focusables()[0]?.focus(), reduced() ? 0 : 200); }
    else { document.removeEventListener('keydown', trap); burger.focus(); }
  };
  burger && burger.addEventListener('click', () => toggleSheet(!nav.classList.contains('is-sheet')));
  matchMedia('(max-width:899px)').addEventListener('change', () => { close(); if (nav.classList.contains('is-sheet')) toggleSheet(false); triggers.forEach((t) => { t.setAttribute('aria-expanded', 'false'); panelOf(t).classList.remove('is-open'); }); });
  return { close };
}
if (typeof document !== 'undefined') {
  const init = () => document.querySelectorAll('[data-mega-menu]').forEach((el) => megaMenu(el));
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}
