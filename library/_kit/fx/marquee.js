/* fx/marquee.js - a type band that drifts and reacts to scroll velocity. Pauses off screen. Reduced motion: static.
   On portfolio-style pages use loop:false (moves only with scroll), per Sujon's no-endless-loop rule.
   marquee(el, { speed: 40 (px/s), loop: true|false, velocity: true }) - el's children are duplicated to fill. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export function marquee(el, o = {}) {
  if (!el) return () => {};
  const track = document.createElement('div'); track.className = 'fx-marquee-track'; track.style.cssText = 'display:flex;width:max-content;will-change:transform';
  while (el.firstChild) track.append(el.firstChild);
  el.append(track); el.style.overflow = 'hidden';
  const base = [...track.children];
  const fill = () => { while (track.scrollWidth < el.clientWidth * 2.2) base.forEach((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c); }); };
  fill();
  if (reduced) return () => {};
  const speed = o.speed ?? 40, loop = o.loop ?? true; let x = 0, v = 0, lastY = scrollY, raf = 0, vis = false, last = performance.now();
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) { last = performance.now(); raf = requestAnimationFrame(step); } }); io.observe(el);
  function step(now) {
    raf = 0; if (!vis) return; const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const dy = scrollY - lastY; lastY = scrollY; if (o.velocity !== false) v += (dy * 6 - v) * 0.12; else v = 0;
    x -= ((loop ? speed : 0) + v * (o.velocityGain ?? 0.6)) * dt * (o.direction === 'right' ? -1 : 1);
    const half = track.scrollWidth / 2; if (half > 0) { x = ((x % half) + half) % half - half; }
    track.style.transform = `translate3d(${x}px,0,0)`; raf = requestAnimationFrame(step);
  }
  return () => io.disconnect();
}
