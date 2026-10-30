/* scroll-video.js: Zyqor Studio (MIT). A scroll-scrubbed video hero in one small file, no dependencies.
   The idea (a camera flight you drive with the scroll wheel) comes from scroll-world by cyw
   (https://github.com/oso95/scroll-world, MIT); this is a minimal rewrite for a single hero clip.
   The full multi-scene engine used on the Zyqor portfolio is site/scrub-engine.js in this repo.

   <section class="sv" data-scroll-video
            data-src-desktop="clip-d.mp4" data-src-phone="clip-m.mp4"
            data-poster-desktop="poster-d.webp" data-poster-phone="poster-m.webp">
     <div class="sv-pin"><video muted playsinline preload="auto"></video> ...copy beats .sv-beat[data-at="0.3"]... </div>
   </section>

   - Picks the phone clip on portrait / narrow screens and the desktop clip otherwise (same shot, framed for each).
   - Smooth: scroll sets a target time; the video eases toward it every frame and never queues seeks
     (it waits for the previous seek to finish), so trackpads and phone flings stay smooth.
   - iOS/Safari: a muted, playsinline video is "unlocked" with play() + pause() on the first touch so seeking works.
   - Reduced motion, Save-Data, or a video that cannot load: the poster stays and the copy reads as normal text.
   - The clip only loads when the section is near the screen.
   - Add data-webm and put clip-*.webm (VP9) next to the mp4s for browsers without H.264 (some Linux Chromium builds). */
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
const saveData = navigator.connection && navigator.connection.saveData;
const clamp = (v) => Math.min(1, Math.max(0, v));

export function scrollVideo(section) {
  const pin = section.querySelector('.sv-pin'), video = section.querySelector('video');
  const beats = [...section.querySelectorAll('.sv-beat')], bar = section.querySelector('.sv-bar i');
  const phone = () => matchMedia('(max-aspect-ratio: 4/5), (max-width: 700px)').matches;
  const pick = () => phone() ? 'phone' : 'desktop';
  let kind = pick(), target = 0, shown = 0, ready = false, raf = 0, near = false;
  const setPoster = () => { section.style.setProperty('--sv-poster', `url("${section.dataset['poster' + (kind === 'phone' ? 'Phone' : 'Desktop')]}")`); video.poster = section.dataset['poster' + (kind === 'phone' ? 'Phone' : 'Desktop')]; };
  setPoster();
  const progress = () => { const r = section.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - pin.offsetHeight)); };
  const paint = (p) => {
    section.style.setProperty('--sv-p', p.toFixed(4));
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    beats.forEach((b) => { const at = +b.dataset.at, len = +(b.dataset.len || 0.22); const d = (p - at) / len; const a = reduced ? 1 : Math.max(0, 1 - Math.abs(d - 0.5) * 2.2); b.style.opacity = a.toFixed(3); b.style.transform = reduced ? 'none' : `translateY(${((0.5 - d) * 40).toFixed(1)}px)`; b.style.visibility = a > 0.01 ? 'visible' : 'hidden'; });
  };
  const load = () => {
    if (reduced || saveData) { section.classList.add('sv--still'); return; }
    let src = section.dataset['src' + (kind === 'phone' ? 'Phone' : 'Desktop')];
    const webm = src.replace(/\.mp4$/, '.webm');
    if (section.hasAttribute('data-webm') && !video.canPlayType('video/mp4; codecs="avc1.640028"') && video.canPlayType('video/webm; codecs="vp9"')) src = webm;
    video.src = src; video.load();
    video.addEventListener('loadeddata', () => { ready = true; section.classList.add('sv--ready'); }, { once: true });
    video.addEventListener('error', () => section.classList.add('sv--still'), { once: true });
  };
  const tick = () => {
    raf = 0; const p = progress(); paint(p);
    if (ready && video.duration) {
      target = p * (video.duration - 0.05);
      shown += (target - shown) * 0.18; if (Math.abs(target - shown) < 0.002) shown = target;
      if (!video.seeking && Math.abs(video.currentTime - shown) > 0.01) video.currentTime = shown;
      if (Math.abs(target - shown) > 0.002 || video.seeking) raf = requestAnimationFrame(tick);
    }
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { const k = pick(); if (k !== kind) { kind = k; ready = false; setPoster(); if (near) load(); } kick(); });
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !near) { near = true; load(); } }, { rootMargin: '600px 0px' }).observe(section);
  const unlock = () => { video.play().then(() => video.pause()).catch(() => {}); };
  addEventListener('touchstart', unlock, { once: true, passive: true });
  video.addEventListener('seeked', kick);
  paint(progress());
  return { refresh: kick };
}
if (typeof document !== 'undefined') {
  const init = () => document.querySelectorAll('[data-scroll-video]').forEach((s) => scrollVideo(s));
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}
