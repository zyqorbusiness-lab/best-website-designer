/* N001 Loomhouse Tailors: tape.js. The preloader is a tailor's tape whose blade extends with REAL load progress.
   Progress = bytes of the files the first screen needs that have finished loading / their total bytes (read from the
   browser's own resource timing, never a timer). When the cloth is live the blade runs out to 60 in and snaps back
   (260 ms). If everything is already cached and the cloth goes live fast, the tape never shows. */
const FILES = {"/N001/poster.webp": 10466, "/font/instrumentserif-400.woff2": 21032, "/font/intertight-normal.woff2": 31336, "/three/three.module.min.js": 691648, "/_kit/stage.js": 29100, "/tex/denim_diff.webp": 66954, "/tex/denim_nor.webp": 29362, "/N001/cloth.js": 9610, "/N001/app.js": 21226};                                   // url tail -> bytes (written at build time from the files)
const TOTAL = Object.values(FILES).reduce((a, b) => a + b, 0);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = document.getElementById('tape');
if (el) {
  const blade = el.querySelector('.tape-blade'), read = el.querySelector('.tape-read'), rul = el.querySelector('.tape-ruler');
  { const ppi = parseFloat(getComputedStyle(el).getPropertyValue('--ppi')) || 6, w = 60 * ppi; let s = `<svg viewBox="0 0 ${w} 24" preserveAspectRatio="none" focusable="false">`;
    for (let i = 1; i < 60; i++) { const x = (i * ppi).toFixed(1), l = i % 12 === 0 ? 14 : i % 6 === 0 ? 10 : 6; s += `<line x1="${x}" y1="0" x2="${x}" y2="${l}"/>`; }
    rul.innerHTML = s + '</svg>'; }
  const done = new Set(); let target = 0, shown = 0, live = false, raf = 0, gone = false;
  const tally = (name) => { for (const k in FILES) if (name.endsWith(k) && !done.has(k)) { done.add(k); } target = [...done].reduce((a, k) => a + FILES[k], 0) / TOTAL; kick(); };
  try {
    performance.getEntriesByType('resource').forEach((e) => tally(e.name));
    new PerformanceObserver((l) => l.getEntries().forEach((e) => tally(e.name))).observe({ type: 'resource', buffered: true });
  } catch { target = 0.5; }
  const paint = () => {
    const inch = Math.round(shown * 60);
    el.style.setProperty('--p', shown.toFixed(4));
    read.textContent = live && shown > 0.999 ? '60 in, ready' : inch + ' in';
    el.setAttribute('aria-valuenow', String(inch));
  };
  function frame() {
    raf = 0;
    const goal = live ? 1 : Math.min(target, 0.97);
    shown = reduced ? goal : shown + (goal - shown) * 0.12;
    if (Math.abs(goal - shown) < 0.002) shown = goal;
    paint();
    if (live && shown >= 1) return finish();
    if (shown !== goal) kick();
  }
  function kick() { if (!raf && !gone) raf = requestAnimationFrame(frame); }
  function finish() {
    if (gone) return; gone = true;
    el.classList.add('is-done');                           // CSS: blade snaps back 260 ms, then the tape fades
    setTimeout(() => { el.hidden = true; }, reduced ? 0 : 700);
  }
  const showT = setTimeout(() => { if (!live) el.classList.add('is-on'); }, 160);
  addEventListener('loom:live', () => { live = true; if (!el.classList.contains('is-on')) { clearTimeout(showT); gone = true; el.hidden = true; return; } kick(); }, { once: true });
  addEventListener('loom:fail', () => { clearTimeout(showT); gone = true; el.hidden = true; }, { once: true });
  setTimeout(() => { if (!live) { clearTimeout(showT); gone = true; el.hidden = true; } }, 20000);   // never leave a stuck loader
  kick();
}
