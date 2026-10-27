/* ============================================================================
   scroll-world - portable scroll-scrubbed camera-flight engine
   ----------------------------------------------------------------------------
   Framework-agnostic. Vanilla JS, zero dependencies. It builds its own DOM and
   injects its own (namespaced) CSS into a container you give it, so it drops into
   plain HTML, Next.js (call from a ref/useEffect), Vue (onMounted), a server-
   rendered page, anything.

   USAGE
     mountScrollWorld(document.getElementById('world'), {
       brand: { name: 'Pearl & Co.', href: '#top' },
       diveScroll: 1.3,   // viewport-heights of scroll per dive clip
       connScroll: 0.9,   // ...per connector clip
       hint: 'scroll to fly in',
       nav: true,         // show the top section nav
       atmosphere: true,  // subtle gradient + drifting particles behind the clips
       sections: [
         { id, label, still, stillMobile, clip, clipMobile, accent,
           scroll: 1.6,   // optional per-section override of diveScroll - more scroll
                          // distance = a slower, longer dwell in this scene
           linger: 0.5,   // optional 0..1 - remaps time so the camera settles mid-scene
                          // (exactly where the copy peaks) and moves quicker at the
                          // edges. 0 = linear (default). Keep <= 0.6; 1 = full pause.
           eyebrow, title, body, tags:[...],
           cta:{ primary:{label,href}, secondary:{label,href} } }, // last section only
         ...
       ],
       connectors: [clipUrl, ...],          // length = sections.length - 1 (nulls allowed)
       connectorsMobile: [clipUrl, ...],    // optional lighter connectors for phones (same length)

   MOBILE (the clipMobile/connectorsMobile variants are the opt-in mobile version;
   the rest of the phone handling below is always on)
     The engine is phone-aware out of the box: on a coarse-pointer / <=860px viewport it
       - loads `clipMobile` / `connectorsMobile` when provided (encode these smaller +
         tighter-GOP - seek cost on a phone decoder is dominated by frames-from-keyframe,
         so a 720p, -g 4 file scrubs far smoother than the 1080p desktop master; see
         pipeline.md). Falls back to the desktop `clip` if no mobile variant is given.
       - uses `stillMobile` as the scene poster when provided (pair it with native 9:16
         clipMobile renders so the poster matches the portrait video's first frame instead
         of flashing from a landscape crop). Chosen once at mount; a desktop resize into
         phone width keeps the desktop poster (clips still switch via isMobile()).
       - coalesces seeks (never issues a new currentTime while the decoder is still
         `seeking`) so fast flicks can't pile up and freeze the video.
       - keeps the still as a live poster until the clip actually paints its first frame,
         and primes each video (muted play->pause) on first touch - this is what stops iOS
         from showing a blank scene before the first seek.
       - drops the drifting particles and ignores URL-bar-only resizes (no scroll jump).
     Nothing here is required - a config with only `clip`/`connectors` still works on
     phones; the mobile variants just make it lighter and smoother.

   THEME (CSS custom properties; set on the container or :root to override)
     --sw-bg         page background (match your scene bg for seamless posters)
     --sw-ink        primary text
     --sw-ink-soft   secondary text
     --sw-accent     default accent (each section overrides via its `accent`)
     --sw-font-display / --sw-font-body

   REQUIREMENTS ON YOUR ASSETS
     - clips encoded native-res, crf~20, -g 8, +faststart, no audio (see pipeline.md)
     - connectors' endpoints are the neighbouring dives' ACTUAL frames (see SKILL Step 5)
     - (optional) mobile variants at ~720p, -g 4 for smoother phone scrubbing
   The engine loads each clip as a Blob (always seekable) and scrubs currentTime; it does
   NOT depend on HTTP byte-range support.
   ========================================================================== */

function mountScrollWorld(container, config) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Phone detection. `coarse` is captured once (input type doesn't change mid-session);
  // the <=860px query is read live via isMobile() so a desktop resize/DevTools toggle
  // switches sources and seek behaviour without a reload.
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const smallMQ = window.matchMedia('(max-width: 860px)');
  const isMobile = () => coarse || smallMQ.matches;
  const SECTIONS = config.sections || [];
  const CONNECTORS = config.connectors || [];
  const CONNECTORS_M = config.connectorsMobile || [];
  const DIVE_W = config.diveScroll || 1.3;
  const CONN_W = config.connScroll || 0.9;
  const CROSSFADE = (config.crossfade != null) ? config.crossfade : 0.12;  // seam dissolve width (vh)
  const N = SECTIONS.length;
  if (!N) return;

  injectCSS();
  container.classList.add('sw-root');

  // ---- build the interleaved segment chain: dive0, conn0, dive1, ... diveN-1 ----
  const SEGMENTS = [];
  SECTIONS.forEach((s, i) => {
    const dive = { kind: 'dive', si: i, clip: s.clip, clipM: s.clipMobile, still: s.still, stillM: s.stillMobile,
                   accent: s.accent, w: s.scroll || DIVE_W, linger: s.linger || 0 };
    SEGMENTS.push(dive);
    s._seg = dive;
    // A connector is optional: if connectors[i] is falsy, the two dives simply
    // crossfade directly (no fly-over). Lets a page complete even when a
    // connector can't be generated (e.g. a content-filter false-positive).
    if (i < N - 1 && CONNECTORS[i]) {
      SEGMENTS.push({ kind: 'conn', si: i, clip: CONNECTORS[i], clipM: CONNECTORS_M[i],
                      still: SECTIONS[i + 1].still, stillM: SECTIONS[i + 1].stillMobile,
                      accent: SECTIONS[i + 1].accent, w: CONN_W });
    }
  });
  const NSEG = SEGMENTS.length;

  // ---- DOM ----
  const sky = el('div', 'sw-sky');
  if (config.atmosphere !== false) {
    sky.appendChild(el('div', 'sw-sky__grad'));
    sky.appendChild(el('div', 'sw-sky__glow'));
  }
  const particles = el('div', 'sw-particles'); sky.appendChild(particles);

  const scrollbar = el('div', 'sw-scrollbar');
  const scrollbarFill = el('span'); scrollbar.appendChild(scrollbarFill);

  const topbar = el('div', 'sw-topbar');
  if (config.brand) {
    const brand = el('a', 'sw-brand'); brand.href = (config.brand.href || '#');
    brand.appendChild(el('span', 'sw-brand__mark'));
    const nm = el('span', 'sw-brand__name'); nm.textContent = config.brand.name || ''; brand.appendChild(nm);
    topbar.appendChild(brand);
  }
  const nav = el('nav', 'sw-nav'); if (config.nav !== false) topbar.appendChild(nav);
  if (config.cta && config.cta.label) {
    const c = el('a', 'sw-topcta'); c.href = config.cta.href || '#'; c.textContent = config.cta.label;
    topbar.appendChild(c);
  }

  const stage = el('div', 'sw-stage');
  const copylayer = el('div', 'sw-copylayer');
  const route = el('div', 'sw-route');
  const hint = el('div', 'sw-hint');
  const hintText = el('span'); hintText.textContent = config.hint || 'scroll'; hint.appendChild(hintText);
  hint.appendChild(el('i'));
  const track = el('div', 'sw-track');

  [sky, scrollbar, topbar, stage, copylayer, route, hint, track].forEach(n => container.appendChild(n));

  // segment scenes
  const MOB0 = isMobile();
  SEGMENTS.forEach((s, idx) => {
    const scene = el('div', 'sw-scene'); scene.style.setProperty('--sw-accent', s.accent || '');
    const img = el('img', 'sw-scene__still'); img.alt = ''; img.decoding = 'async';
    const poster = (MOB0 && s.stillM) ? s.stillM : s.still;
    // Only the first scene's still loads up front (it is the preloaded poster); the rest
    // are attached by the load queue (phones: as the visitor nears them; desktop: all of
    // them the moment the visitor engages, so a nav jump never shows an empty scene).
    if (idx === 0) { img.loading = 'eager'; try { img.fetchPriority = 'high'; } catch (e) {} if (poster) img.src = poster; }
    else { img.loading = 'lazy'; s.posterSrc = poster; }
    scene.appendChild(img); stage.appendChild(scene);
    s.el = scene; s.img = img; s.video = null; s.hasClip = false;
    s.loading = false; s.ready = false; s.cur = 0; s.target = 0; s.visible = false; s.fails = 0; s.idx = idx;
  });

  // per-section copy / route / nav
  const copies = [], dots = [];
  SECTIONS.forEach((s, i) => {
    const c = el('article', 'sw-copy'); c.style.setProperty('--sw-accent', s.accent || '');
    c.innerHTML =
      `<span class="sw-copy__num">${pad(i + 1)} / ${pad(N)}</span>` +
      (s.eyebrow ? `<span class="sw-copy__eyebrow">${esc(s.eyebrow)}</span>` : '') +
      (s.title ? `<h2 class="sw-copy__title">${esc(s.title)}</h2>` : '') +
      (s.body ? `<p class="sw-copy__body">${esc(s.body)}</p>` : '') +
      (s.tags && s.tags.length ? `<ul class="sw-copy__tags">${s.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '') +
      (s.cta ? `<div class="sw-copy__cta">${ctaBtns(s.cta)}</div>` : '');
    copylayer.appendChild(c); copies.push(c);

    const dot = el('button', 'sw-route__dot'); dot.style.setProperty('--sw-accent', s.accent || '');
    dot.innerHTML = `<span class="sw-route__label">${esc(s.label || '')}</span><i></i>`;
    dot.addEventListener('click', () => jumpTo(i)); route.appendChild(dot); dots.push(dot);

    if (config.nav !== false) {
      const b = el('button', 'sw-nav__item'); b.textContent = s.label || '';
      b.addEventListener('click', () => jumpTo(i)); nav.appendChild(b);
    }
  });

  // ---- math ----
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  // Per-section dwell: monotone remap of scroll->time so the camera settles mid-scene
  // (where the copy peaks) and moves quicker near the seams. L=0 linear, L=1 full
  // mid-scene pause. f(0)=0, f(1)=1 always, so seam frames are untouched.
  const lingerEase = (x, L) => { L = clamp(L); const c = x - 0.5; return (1 - L) * x + L * (4 * c * c * c + 0.5); };
  let vh = window.innerHeight, stageX = 0, totalW = 0, activeIndex = -1, ticking = false;
  let laidOutW = window.innerWidth;   // width the current layout was computed at (see onResize)

  function layout() {
    vh = window.innerHeight;
    laidOutW = window.innerWidth;
    stageX = window.innerWidth > 860 ? 4 : 0;
    let off = 0;
    SEGMENTS.forEach(s => { s.start = off * vh; off += s.w; s.end = off * vh; });
    totalW = off;
    track.style.height = (totalW * vh + vh) + 'px';   // +1vh so the last flight completes
    read();
  }

  function jumpTo(i) {
    const seg = SECTIONS[i]._seg;
    const top = seg.start + (seg.end - seg.start) * 0.5;
    if (window.__lenis && !reduce) { window.__lenis.scrollTo(top, { duration: 1.6 }); return; }
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }

  let firstReadySent = false;
  function signalFirstReady() {
    if (firstReadySent) return; firstReadySent = true;
    try { window.dispatchEvent(new CustomEvent('sw:firstready')); } catch (e) {}
    window.__swFirstReady = true;
  }
  function loadClip(s, done) {
    // Under prefers-reduced-motion we never load the clips at all - the stills stay up
    // and simply cross-dissolve as you scroll. No scrubbed video motion, no decode cost.
    if (reduce || s.loading || !s.clip) return false;
    s.loading = true;
    const finish = () => { if (done) { const d = done; done = null; d(); } };
    // Serve the lighter mobile encode on phones when one was provided.
    const src = (isMobile() && s.clipM) ? s.clipM : s.clip;
    // Zyqor Studio build: a clip may be shipped as byte-split parts (array of URLs) -
    // fetched in parallel and rejoined into one exact MP4 Blob (still fully seekable).
    const urls = Array.isArray(src) ? src : [src];
    const pri = (s.idx === 0) ? 'high' : 'low';
    const getAll = () => Promise.all(urls.map(u => fetch(u, { priority: pri }).then(r => r.ok ? r.blob() : Promise.reject(new Error('404')))));
    // The page head may already have started the first clip's download (window.__swPre),
    // so the first screen fetches it exactly once; any failure falls back to a normal fetch.
    const pre = window.__swPre, abs = (u) => { try { return new URL(u, location.href).href; } catch (e) { return u; } };
    const usePre = s.idx === 0 && pre && pre.p && urls.length === 1 && abs(pre.url) === abs(urls[0]);
    if (usePre) window.__swPre = null;
    (usePre ? pre.p.then(b => [b], getAll) : getAll())
      .then(parts => new Blob(parts, { type: 'video/mp4' }))
      .then(blob => {
        const v = document.createElement('video');
        v.className = 'sw-scene__video';
        v.muted = true; v.playsInline = true; v.preload = 'auto';
        v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
        v.src = URL.createObjectURL(blob);
        v.addEventListener('loadedmetadata', () => { s.ready = true; finish(); read(); });
        // Reveal the video (hide the still poster) only once a real frame has
        // painted - on iOS a seeked-but-never-played muted video stays blank, so
        // hiding the still on metadata alone would flash an empty scene.
        v.addEventListener('seeked', () => { s.el.classList.add('has-clip'); if (s.idx === 0) signalFirstReady(); }, { once: true });
        v.addEventListener('error', () => { if (s.idx === 0) signalFirstReady(); finish(); }, { once: true });
        v.addEventListener('loadeddata', () => { try { v.pause(); } catch (e) {} if (userReady) primeVideo(v); if (s.idx === 0) { s.cur = s.target; try { v.currentTime = 0.001; } catch (e) {} setTimeout(signalFirstReady, 600); } });
        s.el.appendChild(v); s.video = v; s.hasClip = true;
      }).catch(() => { s.loading = false; s.fails++; if (s.idx === 0 && s.fails >= 2) signalFirstReady(); finish(); });
    return true;
  }

  // Phones: one clip in flight at a time, the scene in view first. Until the visitor
  // engages (scroll, touch, Auto play) only the first clip loads, so the first screen
  // stays light; after that we keep the current scene plus two ahead and one behind.
  let engaged = false, inflight = 0;
  function engage() { if (engaged) return; engaged = true; read(); }
  // Desktop uses the same queue (Zyqor Studio, Oct 27): first clip only until the visitor
  // engages, then the current scene plus two ahead and one behind, one clip at a time.
  function loadQueue(ci, mob) {
    const lo = (mob || !engaged) ? ci - 1 : 0, hi = (mob || !engaged) ? ci + 2 : NSEG - 1;
    for (let k = lo; k <= hi; k++) {
      const s = SEGMENTS[k];
      if (s && s.posterSrc && !s.posterSet && (engaged || k <= ci)) { s.posterSet = true; s.img.src = s.posterSrc; }
    }
    if (inflight || reduce) return;
    const order = engaged ? (mob ? [ci, ci + 1, ci + 2, ci - 1, ci + 3] : [ci, ci + 1, ci + 2, ci - 1]) : [ci];
    for (const k of order) {
      const s = SEGMENTS[k];
      if (!s || s.loading || !s.clip || s.fails >= 2) continue;
      inflight++;
      if (!loadClip(s, () => { inflight--; requestAnimationFrame(read); })) inflight--;
      return;
    }
  }

  function read() {
    const y = window.scrollY || window.pageYOffset;
    const fade = CROSSFADE * vh;
    let ci = 0;
    for (let i = 0; i < NSEG; i++) if (y >= SEGMENTS[i].start) ci = i;

    const mob = isMobile();
    loadQueue(ci, mob);
    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      const local = clamp((y - s.start) / (s.end - s.start), 0, 1);
      s.target = s.linger ? lingerEase(local, s.linger) : local;
      let outside = 0;
      if (y < s.start) outside = s.start - y; else if (y > s.end && i < NSEG - 1) outside = y - s.end;
      // The last scene never fades to the bare background: it stays up while the next
      // page section slides over it, so there is no plain-cream gap after the journey.
      const op = smooth(1 - outside / fade);
      if (s._op !== op) { s.el.style.opacity = op; s._op = op; }
      s.visible = op > 0.001;
      const z = (i === ci) ? '120' : String(100 + Math.round(op * 10));
      if (s._z !== z) { s.el.style.zIndex = z; s._z = z; }
      if ((!s.hasClip || !s.ready) && s.visible) {
        const sc = reduce ? 1 : 1.03 + local * 0.14;
        const tf = `translateX(${stageX - 2}vw) scale(${sc.toFixed(3)})`;
        if (s._tf !== tf) { s.img.style.transform = tf; s._tf = tf; }
      }
    }

    for (let i = 0; i < N; i++) {
      const seg = SECTIONS[i]._seg;
      const pr = clamp((y - seg.start) / (seg.end - seg.start), 0, 1);
      const before = y < seg.start, after = y > seg.end;
      let cop;
      if (i === 0) cop = after ? 0 : smooth(1 - pr / 0.62);            // greets on landing
      else if (i === N - 1) cop = before ? 0 : smooth(pr / 0.4);       // holds CTA at the end
      else cop = (before || after) ? 0 : smooth(1 - Math.abs(pr - 0.5) / 0.5);
      const c = copies[i];
      if (c._op !== cop) { c.style.opacity = cop; c._op = cop; }
      if (cop > 0 || c._tf === undefined) {
        const tf = reduce ? 'none' : `translateY(${((0.5 - pr) * 4).toFixed(2)}vh)`;
        if (c._tf !== tf) { c.style.transform = tf; c._tf = tf; }
      }
      const pe = cop > 0.5 ? 'auto' : 'none';
      if (c._pe !== pe) { c.style.pointerEvents = pe; c._pe = pe; }
    }

    const cur = SEGMENTS[ci];
    const near = clamp(cur.kind === 'dive' ? cur.si
      : (((y - cur.start) / (cur.end - cur.start)) > 0.5 ? cur.si + 1 : cur.si), 0, N - 1);
    if (near !== activeIndex) {
      activeIndex = near;
      dots.forEach((d, k) => d.classList.toggle('is-active', k === near));
      nav.querySelectorAll('.sw-nav__item').forEach((n, k) => n.classList.toggle('is-active', k === near));
      container.style.setProperty('--sw-accent', SECTIONS[near].accent || '');
    }
    scrollbarFill.style.transform = `scaleX(${clamp(y / (totalW * vh))})`;
    hint.style.opacity = clamp(1 - y / (0.5 * vh));
    if (particles && !coarse) particles.style.transform = `translate3d(0, ${-y * 0.05}px, 0)`;
    if (tourUI) tourUI(y);
    ticking = false;
    kick();
  }

  // The scrub loop sleeps when every visible clip has reached its target and wakes on
  // the next scroll (read() calls kick()), so an idle page costs no per-frame work.
  let rafOn = false;
  function kick() { if (!rafOn) { rafOn = true; requestAnimationFrame(raf); } }
  function raf() {
    const eps = isMobile() ? 0.02 : 0.008;   // coarser seek step on phones = fewer decodes
    let busy = false;
    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      if (!s.hasClip || !s.ready || !s.video) continue;
      if (s.video.seeking) { busy = true; continue; }
      // Never queue a seek while the decoder is still resolving the last one.
      // On phones a fast flick would otherwise pile up seeks and freeze the clip;
      // cur keeps lerping, so we snap to the latest target the moment it's free.
      if (!s.visible && Math.abs(s.cur - s.target) < 0.002) continue;
      s.cur += (s.target - s.cur) * (reduce ? 1 : 0.18);
      const dur = s.video.duration || 1;
      const t = clamp(s.cur, 0, 0.999) * dur;
      if (Math.abs(s.video.currentTime - t) > eps) { try { s.video.currentTime = t; } catch (e) {} busy = true; }
      if (Math.abs(s.target - s.cur) > 0.0005) busy = true;
    }
    if (busy) requestAnimationFrame(raf); else rafOn = false;
  }

  // iOS needs a user gesture before a muted video will decode/paint reliably. On the
  // first touch we prime every loaded clip (muted play->pause) so the first seek is
  // instant instead of showing a blank frame. `userReady` also makes freshly-loaded
  // clips prime themselves (see loadClip).
  let userReady = false;
  function primeVideo(v) {
    if (!isMobile() || !v) return;
    try { const p = v.play(); if (p && p.then) p.then(() => { try { v.pause(); } catch (e) {} }).catch(() => {}); }
    catch (e) {}
  }
  function onFirstGesture() {
    if (userReady) return;
    userReady = true;
    SEGMENTS.forEach(s => primeVideo(s.video));
  }
  window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true });
  window.addEventListener('touchstart', onFirstGesture, { once: true, passive: true });

  // Particles are a per-frame cost we can't afford alongside video scrubbing on a phone.
  seedParticles(particles, reduce || coarse);
  window.addEventListener('scroll', () => { if (!engaged && (window.scrollY || 0) > 4) engaged = true; if (!ticking) { ticking = true; requestAnimationFrame(read); } }, { passive: true });
  ['touchstart', 'wheel', 'keydown'].forEach(ev => window.addEventListener(ev, engage, { once: true, passive: true }));
  if (reduce) { const im = SEGMENTS[0].img; if (im.complete) signalFirstReady(); else { im.addEventListener('load', signalFirstReady, { once: true }); im.addEventListener('error', signalFirstReady, { once: true }); } }
  // Mobile browsers fire `resize` every time the URL bar slides in/out. Re-running
  // layout() there rebuilds the track height and yanks the scroll position, so on
  // touch we ignore height-only changes and only relayout when the width actually
  // changes (rotation still comes through orientationchange). layout() records the
  // width it laid out at.
  function onResize() {
    if (coarse && window.innerWidth === laidOutW) return;
    layout();
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', layout);
  window.addEventListener('load', layout);
  let tourUI = null;
  if (config.tour !== false) tourUI = setupTour();
  // Read-only snapshot for QA tooling (no effect on the page).
  window.__swInfo = () => ({ vh, totalW, end: Math.round(totalW * vh), segs: SEGMENTS.map(s => ({ kind: s.kind, si: s.si, start: s.start, end: s.end, ready: s.ready, loading: s.loading, hasClip: s.hasClip, poster: !!(s.img && s.img.getAttribute('src')) })) });
  layout();
  kick();


  // ---- Auto play / Skip (Zyqor Studio build) ----
  // Auto play glides the scroll through the whole journey at a steady pace (slowing
  // while the next clip is still loading); any manual scroll, wheel, key or touch
  // pauses it. Under prefers-reduced-motion it steps scene to scene instead.
  // Skip jumps past the journey to the storefront / Order now end state.
  function setupTour() {
    const SVG = (p) => `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">${p}</svg>`;
    const ICON = {
      play: SVG('<path d="M8 5.6v12.8a1 1 0 0 0 1.53.85l10.2-6.4a1 1 0 0 0 0-1.7L9.53 4.75A1 1 0 0 0 8 5.6z" fill="currentColor"/>'),
      pause: SVG('<rect x="6.5" y="5" width="4" height="14" rx="1.3" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.3" fill="currentColor"/>'),
      skip: SVG('<path d="M4.5 6.1v11.8a.9.9 0 0 0 1.4.74l8.4-5.9a.9.9 0 0 0 0-1.48L5.9 5.36a.9.9 0 0 0-1.4.74z" fill="currentColor"/><rect x="16.4" y="5" width="2.8" height="14" rx="1.3" fill="currentColor"/>')
    };
    const bar = el('div', 'sw-tour');
    bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Tour controls');
    const playBtn = el('button', 'sw-tour__btn sw-tour__btn--play'); playBtn.type = 'button';
    const skipBtn = el('button', 'sw-tour__btn sw-tour__btn--skip'); skipBtn.type = 'button';
    skipBtn.innerHTML = ICON.skip + '<span>Skip</span>';
    skipBtn.setAttribute('aria-label', config.skipLabel || 'Skip the intro');
    bar.appendChild(playBtn); bar.appendChild(skipBtn);
    container.appendChild(bar);
    const SECONDS = config.tourSeconds || 40;
    const endY = () => Math.round(totalW * vh);
    let playing = false, posF = 0, expectY = 0, lastT = 0, rmTimer = 0, waitMs = 0, waitSeg = -1;
    function setUI(on) {
      playBtn.innerHTML = (on ? ICON.pause : ICON.play) + `<span>${on ? 'Pause' : 'Auto play'}</span>`;
      playBtn.setAttribute('aria-label', on ? 'Pause the auto play' : (config.playLabel || 'Auto play the intro'));
      bar.classList.toggle('is-playing', on);
    }
    setUI(false);
    const go = (top) => { expectY = top; window.scrollTo({ top, left: 0, behavior: 'instant' }); };
    function segIndexAt(y) { let ci = 0; for (let i = 0; i < NSEG; i++) if (y >= SEGMENTS[i].start) ci = i; return ci; }
    function stop() { if (!playing) return; playing = false; clearTimeout(rmTimer); setUI(false); }
    function start() {
      onFirstGesture(); engaged = true;
      if ((window.scrollY || 0) >= endY() - 4) go(0);
      playing = true; setUI(true); read();
      if (reduce) { expectY = window.scrollY || 0; rmTimer = setTimeout(stepRM, 1600); return; }
      posF = window.scrollY || 0; expectY = Math.round(posF); lastT = 0; waitMs = 0; waitSeg = -1;
      requestAnimationFrame(tick);
    }
    function tick(t) {
      if (!playing) return;
      const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0; lastT = t;
      const y = window.scrollY || 0;
      if (Math.abs(y - expectY) > 3) { stop(); return; }          // the visitor took over
      const si = segIndexAt(y), s = SEGMENTS[si];
      if (si !== waitSeg) { waitSeg = si; waitMs = 0; }
      let slow = s && s.clip && !s.ready && s.fails < 2 && waitMs < 4000;  // let the clip arrive
      if (slow) waitMs += dt * 1000;
      const speed = (endY() / SECONDS) * (slow ? 0.12 : 1);
      posF = Math.min(endY(), posF + speed * dt);
      go(Math.round(posF));
      if (posF >= endY()) { stop(); return; }
      requestAnimationFrame(tick);
    }
    function stepRM() {
      if (!playing) return;
      const y = window.scrollY || 0;
      if (Math.abs(y - expectY) > 3) { stop(); return; }
      const targets = [];
      for (let i = 1; i < N; i++) { const g = SECTIONS[i]._seg; targets.push(i === N - 1 ? endY() : Math.round(g.start + (g.end - g.start) * 0.5)); }
      const next = targets.find(v => v > y + 10);
      if (next == null) { stop(); return; }
      go(next);
      if (next >= endY()) { stop(); return; }
      rmTimer = setTimeout(stepRM, 3200);
    }
    playBtn.addEventListener('click', () => { playing ? stop() : start(); });
    skipBtn.addEventListener('click', () => {
      stop(); engaged = true; onFirstGesture();
      const tgt = config.skipTo && document.querySelector(config.skipTo);
      if (tgt) { const top = Math.round(tgt.getBoundingClientRect().top + (window.scrollY || 0)); go(top);
        setTimeout(() => { try { tgt.setAttribute('tabindex', '-1'); tgt.focus({ preventScroll: true }); } catch (e) {} }, 60); return; }
      go(endY());
      const cta = copies[N - 1] && copies[N - 1].querySelector('a, button');
      if (cta) setTimeout(() => { try { cta.focus({ preventScroll: true }); } catch (e) {} }, 60);
    });
    const inBar = (e) => e && e.target && e.target.closest && e.target.closest('.sw-tour');
    const userStop = (e) => { if (playing && !inBar(e)) stop(); };
    window.addEventListener('wheel', userStop, { passive: true });
    window.addEventListener('touchstart', userStop, { passive: true });
    window.addEventListener('pointerdown', userStop, { passive: true });
    window.addEventListener('keydown', (e) => {
      if (!playing || inBar(e)) return;
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'].includes(e.key)) stop();
    });
    let lastPast = null, lastEnd = null;
    return function (y) {
      const past = y > endY() + 0.3 * vh, atEnd = y >= endY() - 4;
      if (past !== lastPast) { bar.classList.toggle('is-past', past); lastPast = past; }
      if (atEnd !== lastEnd) { bar.classList.toggle('is-end', atEnd); lastEnd = atEnd; }
    };
  }

  // ---- helpers ----
  function el(tag, cls) { const n = document.createElement(tag); if (cls) n.className = cls; return n; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function ctaBtns(cta) {
    let h = '';
    if (cta.primary) h += `<a class="sw-btn sw-btn--primary" href="${esc(cta.primary.href || '#')}">${esc(cta.primary.label)}</a>`;
    if (cta.secondary) h += `<a class="sw-btn sw-btn--ghost" href="${esc(cta.secondary.href || '#')}">${esc(cta.secondary.label)}</a>`;
    return h;
  }
}

function seedParticles(host, reduce) {
  if (!host || reduce) return;
  const kinds = ['dot', 'dot', 'ring'];
  const seeds = [7, 23, 41, 58, 71, 88, 12, 34, 52, 66, 83, 95, 18, 29, 47, 63, 77, 91, 5, 38, 55, 69, 82, 97];
  for (let k = 0; k < 20; k++) {
    const s = document.createElement('span');
    s.className = 'sw-pt sw-pt--' + kinds[k % kinds.length];
    s.style.left = seeds[k % seeds.length] + 'vw';
    s.style.top = ((seeds[(k * 3) % seeds.length] * 1.3) % 100) + 'vh';
    s.style.setProperty('--sw-sc', (0.5 + ((seeds[(k * 5) % seeds.length] % 60) / 60) * 1.1).toFixed(2));
    const dur = 14 + (seeds[(k * 7) % seeds.length] % 22);
    s.style.animationDuration = dur + 's';
    s.style.animationDelay = (-(seeds[(k * 2) % seeds.length] % dur)) + 's';
    host.appendChild(s);
  }
}

function injectCSS() {
  if (document.getElementById('sw-css')) return;
  const css = `
  .sw-root{--sw-bg:#F5EDE0;--sw-ink:#241d2b;--sw-ink-soft:#6a6072;--sw-accent:#8a7bb5;
    --sw-font-display:ui-rounded,"SF Pro Rounded","Segoe UI",system-ui,sans-serif;
    --sw-font-body:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;
    color:var(--sw-ink);font-family:var(--sw-font-body);}
  html,body{margin:0;background:var(--sw-bg,#F5EDE0);overflow-x:hidden;}
  .sw-sky{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:var(--sw-bg);}
  .sw-sky__grad{position:absolute;inset:-10%;background:linear-gradient(178deg,color-mix(in srgb,var(--sw-accent) 12%,var(--sw-bg)) 0%,var(--sw-bg) 55%,color-mix(in srgb,var(--sw-accent) 6%,var(--sw-bg)) 100%);}
  .sw-sky__glow{position:absolute;inset:0;background:radial-gradient(60% 42% at 74% 16%,color-mix(in srgb,var(--sw-accent) 22%,transparent),transparent 70%),radial-gradient(46% 34% at 50% 50%,color-mix(in srgb,#fff 45%,transparent),transparent 70%);}
  .sw-particles{position:absolute;inset:-6% -2%;will-change:transform;}
  .sw-pt{position:absolute;width:13px;height:13px;transform:scale(var(--sw-sc,1));opacity:0;animation:sw-drift linear infinite;}
  .sw-pt::before{content:"";position:absolute;inset:0;border-radius:50%;}
  .sw-pt--dot::before{background:radial-gradient(circle at 34% 30%,color-mix(in srgb,var(--sw-accent) 60%,#000),#000 82%);}
  .sw-pt--ring::before{background:transparent;border:2px solid color-mix(in srgb,var(--sw-accent) 55%,transparent);}
  @keyframes sw-drift{0%{opacity:0;transform:scale(var(--sw-sc)) translate(0,12vh) rotate(0)}12%{opacity:.5}88%{opacity:.45}100%{opacity:0;transform:scale(var(--sw-sc)) translate(4vw,-22vh) rotate(210deg)}}
  .sw-scrollbar{position:fixed;top:0;left:0;right:0;height:3px;z-index:60;background:color-mix(in srgb,var(--sw-accent) 14%,transparent);}
  .sw-scrollbar span{display:block;height:100%;width:100%;transform-origin:0 50%;transform:scaleX(0);background:var(--sw-accent);}
  .sw-topbar{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:clamp(14px,2.4vw,26px) clamp(18px,5vw,64px);}
  .sw-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--sw-ink);}
  .sw-brand__mark{width:24px;height:28px;border-radius:7px 7px 10px 10px;background:linear-gradient(160deg,var(--sw-accent),color-mix(in srgb,var(--sw-accent) 60%,#000));box-shadow:0 6px 14px color-mix(in srgb,var(--sw-accent) 40%,transparent);}
  .sw-brand__name{font-family:var(--sw-font-display);font-weight:700;font-size:1.1rem;}
  .sw-nav{display:flex;gap:4px;padding:5px;background:color-mix(in srgb,#fff 55%,transparent);backdrop-filter:blur(10px);border:1px solid color-mix(in srgb,var(--sw-accent) 16%,transparent);border-radius:999px;}
  .sw-nav__item{font:inherit;font-size:.82rem;color:var(--sw-ink-soft);border:0;background:transparent;cursor:pointer;padding:7px 14px;border-radius:999px;transition:color .25s,background .25s;}
  .sw-nav__item:hover{color:var(--sw-ink);} .sw-nav__item.is-active{color:#fff;background:var(--sw-accent);}
  .sw-topcta{text-decoration:none;font-weight:600;font-size:.9rem;color:#fff;background:var(--sw-ink);padding:10px 20px;border-radius:999px;white-space:nowrap;}
  .sw-stage{position:fixed;inset:0;z-index:10;pointer-events:none;}
  .sw-scene{position:absolute;inset:0;opacity:0;overflow:hidden;will-change:opacity;}
  .sw-scene__video,.sw-scene__still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 42%;}
  .sw-scene__still{will-change:transform;} .sw-scene.has-clip .sw-scene__still{opacity:0;} .sw-scene__video{z-index:1;}
  .sw-copylayer{position:fixed;inset:0;z-index:20;pointer-events:none;}
  .sw-copylayer::before{content:"";position:absolute;inset:0;width:min(58vw,780px);background:linear-gradient(90deg,var(--sw-bg) 0%,color-mix(in srgb,var(--sw-bg) 82%,transparent) 34%,color-mix(in srgb,var(--sw-bg) 40%,transparent) 62%,transparent 100%);}
  .sw-copy{position:absolute;left:clamp(18px,5vw,64px);top:50%;transform:translateY(-50%);width:min(42vw,460px);opacity:0;will-change:opacity,transform;}
  .sw-copy__num{font-family:ui-monospace,Menlo,monospace;font-size:.74rem;letter-spacing:.12em;color:var(--sw-ink-soft);}
  .sw-copy__eyebrow{display:block;margin-top:18px;font-family:var(--sw-font-display);font-weight:700;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--sw-accent);}
  .sw-copy__title{font-family:var(--sw-font-display);font-weight:700;color:var(--sw-ink);font-size:clamp(2rem,4.4vw,3.5rem);line-height:1.03;margin:12px 0 0;letter-spacing:-.01em;text-shadow:0 2px 20px color-mix(in srgb,var(--sw-bg) 70%,transparent);}
  .sw-copy__body{margin-top:18px;font-size:clamp(1rem,1.25vw,1.14rem);line-height:1.55;color:color-mix(in srgb,var(--sw-ink) 78%,var(--sw-ink-soft));max-width:40ch;text-shadow:0 1px 12px color-mix(in srgb,var(--sw-bg) 90%,transparent);}
  .sw-copy__tags{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0;padding:0;}
  .sw-copy__tags li{font-size:.82rem;font-weight:600;color:color-mix(in srgb,var(--sw-accent) 70%,#000);padding:7px 14px;border-radius:999px;background:color-mix(in srgb,var(--sw-accent) 14%,#fff);border:1px solid color-mix(in srgb,var(--sw-accent) 30%,transparent);}
  .sw-copy__cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;pointer-events:auto;}
  .sw-btn{text-decoration:none;font-weight:600;font-size:.95rem;padding:13px 24px;border-radius:999px;transition:transform .2s;}
  .sw-btn--primary{color:#fff;background:var(--sw-ink);} .sw-btn--primary:hover{transform:translateY(-2px);}
  .sw-btn--ghost{color:var(--sw-ink);border:1.5px solid color-mix(in srgb,var(--sw-ink) 25%,transparent);} .sw-btn--ghost:hover{transform:translateY(-2px);}
  .sw-route{position:fixed;right:clamp(14px,2.4vw,30px);top:50%;z-index:40;transform:translateY(-50%);display:flex;flex-direction:column;gap:22px;padding:18px 10px;}
  .sw-route::before{content:"";position:absolute;left:50%;top:22px;bottom:22px;width:2px;transform:translateX(-50%);background:var(--sw-accent);opacity:.28;}
  .sw-route__dot{position:relative;border:0;background:transparent;cursor:pointer;width:14px;height:14px;display:grid;place-items:center;}
  .sw-route__dot i{width:9px;height:9px;border-radius:50%;background:color-mix(in srgb,var(--sw-accent) 40%,transparent);transition:transform .3s,background .3s,box-shadow .3s;}
  .sw-route__dot:hover i{transform:scale(1.25);background:var(--sw-accent);}
  .sw-route__dot.is-active i{background:var(--sw-accent);transform:scale(1.4);box-shadow:0 0 0 5px color-mix(in srgb,var(--sw-accent) 22%,transparent);}
  .sw-route__label{position:absolute;right:24px;top:50%;transform:translateY(-50%) translateX(6px);white-space:nowrap;font-size:.78rem;font-weight:600;color:var(--sw-ink);background:color-mix(in srgb,#fff 85%,transparent);backdrop-filter:blur(6px);padding:5px 11px;border-radius:999px;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;border:1px solid color-mix(in srgb,var(--sw-accent) 14%,transparent);}
  .sw-route__dot:hover .sw-route__label,.sw-route__dot.is-active .sw-route__label{opacity:1;transform:translateY(-50%) translateX(0);}
  .sw-hint{position:fixed;left:50%;bottom:26px;z-index:30;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:var(--sw-ink-soft);transition:opacity .3s;}
  .sw-hint i{width:22px;height:34px;border-radius:12px;border:2px solid color-mix(in srgb,var(--sw-ink) 28%,transparent);position:relative;}
  .sw-hint i::after{content:"";position:absolute;left:50%;top:7px;width:4px;height:7px;border-radius:2px;background:var(--sw-accent);transform:translateX(-50%);animation:sw-wheel 1.7s ease-in-out infinite;}
  @keyframes sw-wheel{0%{opacity:0;top:6px}40%{opacity:1}100%{opacity:0;top:17px}}
  .sw-track{position:relative;z-index:1;width:100%;pointer-events:none;}
  @media (max-width:860px){
    .sw-nav{display:none;}
    .sw-copylayer::before{width:100%;height:60%;top:auto;bottom:0;background:linear-gradient(0deg,var(--sw-bg) 8%,color-mix(in srgb,var(--sw-bg) 70%,transparent) 46%,transparent 100%);}
    /* Anchor copy to the bottom, clear of the home indicator / collapsing URL bar.
       dvh + env() are progressive: browsers that lack them keep the vh fallback line. */
    .sw-copy{left:clamp(18px,5vw,64px);right:clamp(18px,5vw,64px);top:auto;bottom:clamp(64px,14vh,120px);transform:none;width:auto;max-width:560px;}
    .sw-copy{bottom:calc(clamp(56px,12dvh,110px) + env(safe-area-inset-bottom));}
    .sw-copy__title{font-size:clamp(1.9rem,7.5vw,2.7rem);}
    .sw-copy__body{max-width:none;font-size:clamp(.98rem,3.6vw,1.1rem);} .sw-scene__video,.sw-scene__still{object-position:center 46%;}
    .sw-hint{bottom:calc(20px + env(safe-area-inset-bottom));}
    .sw-route{gap:16px;right:6px;} .sw-route__label{display:none;}
  }
  /* Portrait phones crop a 16:9 clip hard; keep the framing centred so the focal
     subject (which the camera dives toward) stays in view. */
  @media (max-width:860px) and (orientation:portrait){
    .sw-scene__video,.sw-scene__still{object-position:center 44%;}
  }
  /* Touch: give the route dots a finger-sized hit area without growing the visible dot. */
  @media (hover:none) and (pointer:coarse){
    .sw-route{padding:14px 6px;}
    .sw-route__dot{width:28px;height:28px;}
    .sw-btn{padding:15px 26px;}
  }

  .sw-tour{position:fixed;right:clamp(14px,2.4vw,28px);bottom:calc(18px + env(safe-area-inset-bottom));z-index:70;display:flex;gap:8px;align-items:center;transition:opacity .3s ease,visibility .3s ease;}
  .sw-tour.is-past{opacity:0;visibility:hidden;pointer-events:none;}
  .sw-tour.is-end .sw-tour__btn--skip{display:none;}
  .sw-tour__btn{display:inline-flex;align-items:center;gap:8px;white-space:nowrap;min-height:40px;padding:0 17px;border-radius:999px;cursor:pointer;font:600 .82rem/1 var(--sw-font-body);letter-spacing:.02em;color:var(--sw-ink);background:color-mix(in srgb,#fff 84%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid color-mix(in srgb,var(--sw-accent) 38%,transparent);box-shadow:0 10px 24px -16px rgba(40,25,10,.55);transition:transform .2s ease,background-color .2s ease,color .2s ease;-webkit-tap-highlight-color:transparent;}
  .sw-tour__btn:hover{transform:translateY(-1px);background:#fff;}
  .sw-tour__btn:active{transform:scale(.97);}
  .sw-tour__btn svg{display:block;flex:none;}
  .sw-tour__btn--play{background:var(--sw-ink);color:#FFF8EE;border-color:transparent;}
  .sw-tour__btn--play:hover{background:color-mix(in srgb,var(--sw-ink) 86%,#000);}
  @media (max-width:860px){
    .sw-tour{right:auto;left:50%;transform:translateX(-50%);bottom:calc(46px + env(safe-area-inset-bottom));}
    .sw-tour__btn{min-height:44px;padding:0 19px;font-size:.86rem;}
    .sw-copy{bottom:calc(clamp(104px,14dvh,132px) + env(safe-area-inset-bottom));}
  }
  @media (prefers-reduced-motion:reduce){ .sw-hint i::after{animation:none;} .sw-pt{display:none;} .sw-tour__btn{transition:none;} }
  `;
  // Wrap in a cascade layer so the page's own theme tokens (unlayered
  // :root / .sw-root { --sw-bg / --sw-ink / --sw-accent ... }) always win over
  // these defaults, regardless of injection order. Enables clean dark themes.
  const style = document.createElement('style'); style.id = 'sw-css';
  style.textContent = '@layer sw {\n' + css + '\n}';
  document.head.appendChild(style);
}

// Expose for module + global use.
if (typeof module !== 'undefined' && module.exports) module.exports = { mountScrollWorld };
if (typeof window !== 'undefined') window.mountScrollWorld = mountScrollWorld;
