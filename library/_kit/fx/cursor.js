/* fx/cursor.js - a small follower ring for fine pointers only (never on touch, never with reduced motion).
   cursor({ grow: '[data-cursor]' }) - elements with data-cursor="View" grow the ring and show the label. */
export function cursor(o = {}) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const c = document.createElement('div'); c.className = 'fx-cursor'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<span></span>';
  Object.assign(c.style, { position: 'fixed', left: 0, top: 0, width: '34px', height: '34px', margin: '-17px 0 0 -17px', borderRadius: '50%', border: '1px solid currentColor', color: o.color || 'var(--c2)', pointerEvents: 'none', zIndex: 95, display: 'grid', placeItems: 'center', font: '500 10px/1 var(--f-mono)', letterSpacing: '.06em', textTransform: 'uppercase', transition: 'width 320ms cubic-bezier(.16,1,.3,1),height 320ms cubic-bezier(.16,1,.3,1),margin 320ms cubic-bezier(.16,1,.3,1),background-color 320ms', opacity: 0 });
  document.body.append(c);
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0;
  const loop = () => { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0; };
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; x = e.clientX; y = e.clientY; c.style.opacity = 1; if (!raf) raf = requestAnimationFrame(loop);
    const t = e.target.closest && e.target.closest(o.grow || '[data-cursor]'); const big = !!t; c.style.width = c.style.height = big ? '86px' : '34px'; c.style.margin = big ? '-43px 0 0 -43px' : '-17px 0 0 -17px';
    c.style.backgroundColor = big ? 'color-mix(in oklab, var(--c1) 70%, transparent)' : 'transparent'; c.firstChild.textContent = big ? (t.dataset.cursor || '') : ''; }, { passive: true });
  document.addEventListener('pointerleave', () => (c.style.opacity = 0));
  return c;
}
