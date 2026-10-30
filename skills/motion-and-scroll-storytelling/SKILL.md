---
name: motion-and-scroll-storytelling
description: Motion for premium websites that reads as designed, not generated - a central motion token system (durations, three easing curves, springs), reveal timings Sujon actually chose, scroll storytelling with GSAP ScrollTrigger + Lenis (pins, scrubbed timelines, horizontal tracks, chapter choreography), CSS scroll-driven animations, scroll-scrubbed video with every scroll-world engine rule (blob loading, seek coalescing, iOS priming, linger remap, seam laws, encode recipes), page transitions, reduced motion, and the motion review questions. Tested demo with pinned vendor files.
when_to_use: "add animations", "scroll animation", "GSAP / ScrollTrigger / Lenis", "make it feel smooth / premium", "Apple-style scroll", "scroll-world", "animations feel cheap / slow / AI", "page transitions", any site where something moves
license: MIT (text and code). GSAP is under its own Standard License, Lenis MIT; see CREDITS.md.
version: 1.0.0
---

# Motion and scroll storytelling

Motion is where AI-made sites give themselves away fastest: everything fades up the same way, things float and pulse
forever, particles drift for no reason. Sujon's rule set is short: **purpose first, motion second, decoration last**
(his BoloFlow motion brief), **fast and smooth, no bounce, no blur** (what he chose for his own portfolio on 16 Oct),
**no endless loops** (15 Oct), and **one main mover at a time**.

```
storyboard (unique-idea skill) -> motion tokens (section 2) -> per-interaction physics (3) -> scroll choreography (4-6)
   -> video scrub if the idea is a camera move (7) -> transitions (8) -> reduced motion (9) -> review questions (10) -> QA
```

`examples/index.html` runs every pattern below with pinned, self-hosted GSAP 3.15, ScrollTrigger and Lenis 1.3.27,
checked at 1440 / 390 / 360 and with reduced motion.

---

## 0. Desktop first, no compromise

*"PC me no compromise, ek dam best"* (Sujon, 30 Oct 2026):

1. **Desktop gets smooth scroll** (Lenis, `lerp` 0.1 or `duration` 1.1-1.2) synced to ScrollTrigger, so scrubbed scenes
   glide on mouse wheels. Trackpads and 120 Hz screens get the same.
2. **Full choreography on desktop**: pinned chapters, scrubbed timelines with `scrub: 1-1.2`, cursor-reactive layers,
   page transitions. Nothing is "simplified for performance" on desktop: if a scene drops frames, fix the cause
   (layout thrash, oversized textures, too many layers), never cut the scene.
3. **Highest-resolution motion assets on desktop**: video scrub at native 1080p or more, `-g 8` GOP (section 7).
4. **60 fps at 1440 x 900 is the floor**, verified with the Performance panel.

### Phone parity

- **Same chapters, same scrubbed scenes, same timings.** Phones keep native scroll (Lenis `syncTouch` off, the
  default), because touch inertia is the OS's own and users expect it; ScrollTrigger still scrubs on it.
- Pointer-driven layers get a scroll-, tilt- or tap-driven equivalent (micro-interactions skill).
- Video scrub ships a **native 9:16 phone cut** with a tighter GOP (`-g 4`), never a centre crop of the desktop clip.
- Use `svh` for pinned stage heights and ignore height-only resizes (URL bar), so nothing jumps.
- Reduced motion is respected on both.

---

## 1. Rules with reasons

| # | Rule | Why |
|---|---|---|
| MO-R1 | **Purpose first.** Every animation answers: what changed, where it came from, what to notice, what action completed. | BoloFlow: *"PURPOSE FIRST -> MOTION SECOND -> DECORATION LAST."* His checklist: *"Animation ka kaam information samjhana hona chahiye."* |
| MO-R2 | **Different actions get different physics**: selection morphs, navigation keeps continuity, dragging has momentum, expansion changes shape, confirmation is short. | BoloFlow: *"Do NOT make every interaction use the same scale/fade animation."* |
| MO-R3 | **Central tokens, no scattered values.** | BoloFlow motion architecture; one change re-tunes the whole site. |
| MO-R4 | **Reveals are fast and smooth: opacity + 16-24px rise, 400-520 ms, ease-out-expo, no bounce, no blur.** | What Sujon picked on 16 Oct after comparing (portfolio, Fizzly, Anvaya); the most reliable taste data in his Drive. |
| MO-R5 | **Slow is for moments, not content.** 1.2-1.4 s only for image curtains, chapter changes, camera moves. | Master Award System §2 luxury / zen timings, kept away from content reveals. |
| MO-R6 | **Motion never blocks the user.** Interruptible; intros skippable; scroll never locked waiting for an animation. | BoloFlow: *"NO ANIMATION SHOULD BLOCK USER INPUT."* |
| MO-R7 | **No endless loops by default.** Loops only when the idea IS motion, paused off-screen, stopped by reduced motion. | His 15 Oct rule for portfolio sites. |
| MO-R8 | **One main mover at a time.** | Gemini draft rule 5; several movers at once is noise. |
| MO-R9 | **Animate transform, opacity (and clip-path for wipes, filter sparingly). Never top/left/width/height/margin on scroll.** | Master Award System §2 Step 6; layout properties jank. |
| MO-R10 | **Classical principles**: anticipation, follow-through, small overshoot only on small controls, acceleration and deceleration, stagger, masking. Avoid constant linear motion, everything at once, identical timing everywhere, repetitive zooms. | Master Motion Graphics prompt §5. |
| MO-R11 | **Scroll drives time, not the camera** for flights: a pre-rendered move scrubbed by scroll is smoother and more cinematic than a live camera you steer. | scroll-world (SKILL L21-26). |
| MO-R12 | **Respect `prefers-reduced-motion`** with a version that still tells the story (section 9). | WCAG 2.3.3; vestibular disorders. |

### Motion that reads as AI (banned)

Random glowing particles, neon energy beams, floating blobs, excessive glass effects, random orbiting objects,
meaningless HUD elements, repeated zooms, generic shimmer, constant pulsing, excessive bounce, endless morphing,
decorative loading animations, random gradient movement. (BoloFlow "global motion language"; Master Motion Graphics
§28.)

---

## 2. Motion tokens

```css
:root{
  /* durations */
  --dur-instant: 90ms;     /* press feedback, toggles */
  --dur-fast: 180ms;       /* hover, focus, small state changes */
  --dur-base: 320ms;       /* menus, accordions, tabs */
  --dur-reveal: 520ms;     /* content entering the viewport (his 16 Oct choice) */
  --dur-moment: 1200ms;    /* chapter change, image curtain, camera move (luxury) */
  /* the three named curves (Master Award System §3) */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);       /* settle: reveals, panels, most things */
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);  /* wipe: curtains, page transitions */
  --ease-spring-snappy: cubic-bezier(0.34, 1.56, 0.64, 1); /* tiny overshoot: toggles, a button settling, never content */
  /* distances */
  --rise: 24px;            /* reveal travel (16px for dense UI) */
  --stagger: 70ms;         /* between siblings (60-80ms) */
}
@media (prefers-reduced-motion: reduce){
  :root{ --dur-fast:0ms; --dur-base:0ms; --dur-reveal:0ms; --dur-moment:0ms; --rise:0px; --stagger:0ms; }
}
```

```js
// The same tokens in JS (GSAP takes seconds and named or custom eases)
export const MOTION = {
  fast: 0.18, base: 0.32, reveal: 0.52, moment: 1.2, stagger: 0.07, rise: 24,
  settle: 'expo.out',          // ~ cubic-bezier(.16,1,.3,1)
  wipe: 'power4.inOut',        // ~ cubic-bezier(.76,0,.24,1)
  snap: 'back.out(1.6)',       // small controls only
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
};
```

| Token | Use | Never use for |
|---|---|---|
| `--dur-instant` 90 ms | press, toggle, checkbox | anything the eye must follow |
| `--dur-fast` 180 ms | hover, focus ring, colour change | entrances |
| `--dur-base` 320 ms | dropdowns, accordions, tabs, sheets | page-level moments |
| `--dur-reveal` 520 ms | content entering view | button feedback (too slow) |
| `--dur-moment` 1.2 s | chapter change, curtain, camera | text reveals (feels slow; Anvaya was cut to 0.4 s when he said it was too slow) |
| expo out | almost everything that arrives or settles | wipes across the whole screen |
| quart in-out | wipes, transitions, things that leave and arrive | small UI |
| spring snappy | toggles, a magnetic button snapping back | text, images, sections |

---

## 3. One behaviour per interaction type (MO-R2)

| Interaction | Behaviour | Example values |
|---|---|---|
| Content enters view | rise + fade, once | 24px, 520 ms, expo out, IO threshold 0.06-0.15 |
| Selection (tab, swatch, filter) | morph: the indicator travels to the new item | 320 ms expo out; the active pill stretches `scaleX(1.12)` mid-flight (Drive I2) |
| Navigation (page/section change) | continuity: something shared stays or travels | View Transitions, 650 ms quart in-out |
| Drag | physics: momentum, friction, bounded | velocity x 0.93 per frame, skew clamp ±3.5° (Drive I5) |
| Expand/collapse | shape change | `grid-template-rows: 0fr -> 1fr`, 320 ms |
| Confirmation | short and quiet | compress 0.96, state change, brief text, back to normal (Drive I9), no confetti |
| Loading | real progress only | counter tied to real bytes, never a fake 97% (Drive M11) |

---

## 4. Patterns: reveals and text

### 4.1 Reveal on enter (no library)

```css
.reveal{opacity:0;transform:translate3d(0,var(--rise),0);transition:opacity var(--dur-reveal) var(--ease-out-expo),transform var(--dur-reveal) var(--ease-out-expo);transition-delay:calc(var(--i,0) * var(--stagger))}
.reveal.is-in{opacity:1;transform:none}
```
```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.setProperty('--i', i % 4); io.observe(el); });
```
Content must be visible without JavaScript: add the hidden state only when JS runs (`document.documentElement.classList.add('js')` and scope `.js .reveal{...}`).

### 4.2 Masked lines and word-lit manifesto

See the typography-premium skill §5 (translateY 105% -> 0 with 0.08 s stagger; words from 0.15 to 1 opacity across a
200vh pinned stage). Both are in its tested example.

### 4.3 CSS scroll-driven animations (no JS, progressive)

```css
@supports (animation-timeline: view()){
  .parallax{animation:drift linear both;animation-timeline:view();animation-range:entry 0% exit 100%}
  @keyframes drift{from{transform:translate3d(0,8vh,0)}to{transform:translate3d(0,-8vh,0)}}
  .progress{position:fixed;inset:0 0 auto;height:2px;transform-origin:left;background:var(--c-accent);
    animation:grow linear both;animation-timeline:scroll(root)}
  @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
}
@media (prefers-reduced-motion: reduce){.parallax,.progress{animation:none}}
```
Supported in Chrome/Edge 115+ and Safari 26; where unsupported nothing moves, which is a safe fallback. Use GSAP for
anything that needs pinning, sequencing or a fallback in every engine.

---

## 5. Scroll storytelling with GSAP ScrollTrigger + Lenis

### 5.1 Setup (pinned versions, self-hosted, no CDN in production)

```html
<script src="vendor/gsap.min.js"></script>          <!-- GSAP 3.15.0 -->
<script src="vendor/ScrollTrigger.min.js"></script> <!-- 3.15.0 -->
<script src="vendor/lenis.min.js"></script>         <!-- Lenis 1.3.27 -->
```
```js
gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });   // syncTouch stays false: phones keep native scroll
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
```
Add Lenis's recommended CSS (`html.lenis{height:auto} .lenis.lenis-smooth{scroll-behavior:auto!important}`) and
`data-lenis-prevent` on any inner scroller (a modal, a code block).

### 5.2 A pinned chapter with a scrubbed timeline

```js
const tl = gsap.timeline({
  defaults: { ease: 'none' },                       // scrubbed timelines map scroll linearly; ease inside the tweens instead
  scrollTrigger: { trigger: '#chapter', start: 'top top', end: '+=200%', scrub: 1, pin: true, anticipatePin: 1 },
});
tl.from('#object', { scale: 0.8, rotate: -12, ease: 'power2.out' })
  .to('#object', { xPercent: 30, rotate: 8 })
  .from('#caption-1', { autoAlpha: 0, y: 24 }, '<0.2')
  .to('#caption-1', { autoAlpha: 0 }, '>0.3')
  .from('#caption-2', { autoAlpha: 0, y: 24 }, '<');
```
Rules: `scrub: 1` (1 s catch-up) feels premium; `scrub: true` feels mechanical; Sujon's Drive uses 1.2 for the 3D
product arc. `end: '+=200%'` = two screens of scroll for this chapter; more scroll = slower story.

### 5.3 Horizontal track

```js
const track = document.querySelector('.track');
gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none',
  scrollTrigger: { trigger: '.hx', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth), scrub: 1, pin: true, invalidateOnRefresh: true } });
```
On phones prefer a native swipe track with scroll-snap (layout skill §5.3); if you keep the pin, keep frames large.

### 5.4 Velocity skew (clamped)

```js
const skewTo = gsap.quickTo('.track figure', 'skewX', { duration: 0.4, ease: 'power3' });
ScrollTrigger.create({ onUpdate: (self) => skewTo(gsap.utils.clamp(-3.5, 3.5, self.getVelocity() / -300)) });
```

### 5.5 Responsive and reduced motion with matchMedia

```js
const mm = gsap.matchMedia();
mm.add({ all: 'all', desktop: '(min-width: 768px)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
  const { desktop, reduce } = ctx.conditions;
  if (reduce) { gsap.set('.reveal, #caption-1, #caption-2', { autoAlpha: 1, y: 0 }); return; }
  // build the timelines here; everything created inside is reverted automatically when the query stops matching
});
```
**Gotcha (found testing this skill's demo):** with a conditions object, GSAP runs the callback only when at least one
query matches. Without the `all: 'all'` entry, a phone (not desktop, no reduced motion) gets **no** timeline at all,
which silently breaks phone parity. The demo's self-test caught exactly this at 390px.

### 5.6 Choreography rules

- **One main mover per chapter**; supporting elements follow with 60-80 ms offsets.
- **Arrive fast, leave faster**: entering 520 ms, leaving 320 ms.
- **Group, then stagger**: headline, then body, then CTA; never 12 items each with its own delay.
- **The copy peaks when the motion slows** (section 6).
- **Every pinned chapter has an exit**: release the pin with the next chapter already visible underneath.

---

## 6. Pacing: dwell and linger (scroll-world)

Give each chapter its own scroll length (more scroll = longer stay). Inside a chapter, slow the motion where the copy
peaks with scroll-world's monotone remap:

```js
// f(x) = (1 - L) * x + L * (4 (x - 0.5)^3 + 0.5),  x in [0,1], L in [0,1]
// f(0) = 0 and f(1) = 1 (seam frames stay exact); L = 0 is linear; L = 0.35 is what the Zyqor portfolio's Studio scene uses.
export const linger = (x, L = 0.35) => (1 - L) * x + L * (4 * (x - 0.5) ** 3 + 0.5);
```
Use it on any scroll progress before driving a video time, a camera, or a timeline's `progress()`. "Expressive motion
in the clip, restraint in the mapping" (scroll-world).

Copy choreography (scroll-world engine): the first chapter's copy greets on landing and fades by 62% of its segment;
middle chapters peak at the centre; the last fades in by 40% and holds the CTA; copy drifts about 4vh; copy takes
pointer events only when more than half visible.

---

## 7. Scroll-scrubbed video (the scroll-world technique, without AI renders)

For "the camera flies through the world" pages. The full working single-clip version is the
[`scroll-video-hero`](../scroll-video-hero/) skill; this section is the complete rule set for multi-chapter flights.

### 7.1 Architecture (scroll-world T1-T4)
- **Scroll drives time**: a pre-rendered clip holds the camera move; scroll maps to `video.currentTime`. Reverse scroll plays it backwards for free.
- **Load each clip as a Blob** and play it from an object URL. Static hosts that do not answer byte-range requests pin `seekable` to [0,0] and the video freezes on frame 0; a Blob is always seekable.
- **Interleaved chain**: `dive0, conn0, dive1, ..., diveN-1`; each segment gets its own scroll length (dive 1.3 viewport-heights, connector 0.9; per-section override); track height = total + 1vh so the last move completes.
- **Connectors optional**: a missing connector crossfades the two dives, so a page still completes when one clip cannot be made.

### 7.2 Seams (T5, T6)
- **Frame-identical handoffs**: each segment starts on the exact last frame of the previous one. With our own renders (one camera path cut at frames) this is true by construction. Keep a tiny crossfade (0.04-0.08 of a viewport) as insurance, never as the fix.
- **Velocity continuity**: the camera never reverses across a seam (reads as a rewind). Each leg ends in about 1 s of slow forward drift and the next starts with the same drift. Splines are tangent-continuous at chapter boundaries.

### 7.3 Encoding (T9, T10)

| Cut | Command essentials | Notes |
|---|---|---|
| Desktop, max quality | `-c:v libx264 -crf 20 -g 8 -keyint_min 8 -sc_threshold 0 -vf "unsharp=5:5:0.8:5:5:0.0" -pix_fmt yuv420p -an -movflags +faststart` | native resolution, do not downscale (scroll-world recipe) |
| Desktop, measured web budget | 1080p 24 fps, `-crf 26 -g 12` (first clip `-crf 29 -g 16`) | Zyqor bakery/v3 measurement: no visible difference at 1:1; `-g 24` made seeks slower (p95 about 1 s) |
| Phone | 720x1280 **native 9:16** render, `-crf 23 -g 4` | phone seek cost grows with frames since the last keyframe; never a centre crop |

All-intra is not needed with Blob loading (an 8 s clip is about 25 MB all-intra vs about 8 MB at GOP 8). "PC no
compromise": the desktop uses the max-quality row when the clip is the hero.

### 7.4 Phone hardening (T11-T14, the most valuable code in the engine)
- **Lazy window**: load clips within about ±1.6 viewport-heights of the scroll position (or a stricter queue: one clip in flight; current + 2 ahead + 1 behind). Under reduced motion, never fetch video: stills cross-dissolve.
- **Seek coalescing**: in the rAF loop never set `currentTime` while `video.seeking`; keep lerping toward the target (factor 0.18) and snap to the latest target once free; coarser seek step on phones (eps 0.02 vs 0.008 desktop).
- **iOS blank-video fix**: keep the poster visible until the video fires `seeked` (a real frame painted), not `loadedmetadata`; on the first touch prime every loaded clip with muted `play()` then `pause()`; keep `muted` and `playsinline`.
- **No scroll jump**: ignore height-only `resize` on touch (URL bar); relayout on width change or `orientationchange`; `dvh` + `env(safe-area-inset-bottom)` for copy; `viewport-fit=cover`.

```js
// seek coalescing core (from the scroll-world engine idea, rewritten)
function tick(){
  const target = timeForScroll();                       // seconds, already through linger()
  cur += (target - cur) * 0.18;
  if (!video.seeking && Math.abs(video.currentTime - cur) > (coarse ? 0.02 : 0.008)) video.currentTime = cur;
  if (Math.abs(target - cur) > 0.001) requestAnimationFrame(tick); else running = false;   // sleep when idle
}
```

### 7.5 Getting clips without AI (Sujon's real-assets rule)
scroll-world generates its worlds with AI image and video models; Zyqor does not ship AI renders. Use **our own
deterministic renders** of CC0/CC-BY scenes (a three.js scene with one camera spline, rendered frame by frame in
headless Chrome with a fixed timestep, then encoded as above), or **real stock footage** with its licence logged.
One shared look per flight (same HDRI, light rig, ACES tone mapping, lens, grade) makes separate scenes one world.

### 7.6 Previz, then final (T20, T21)
Render the whole chain at draft quality (low samples, 480p) to check timing and seams; approve; then render finals.
State render minutes per scene before starting. Re-render the one failing segment, never the batch. Run long renders
detached and poll (no blocking pipes).

---

## 8. Page transitions

```js
// Same-document: a circular reveal from the click point (Drive I3), View Transitions API
async function go(e, apply){
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();
  const x = e.clientX, y = e.clientY, r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = document.startViewTransition(apply);
  await vt.ready;
  document.documentElement.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
    { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' });
}
```
Cross-document (multi-page sites): `@view-transition { navigation: auto; }` in both pages' CSS (Chrome/Edge 126+,
Safari 18.2+); browsers without it navigate normally. Never block navigation on a transition longer than 700 ms.

---

## 9. Reduced motion that still tells the story

| Pattern | Reduced-motion version |
|---|---|
| Reveals | content visible immediately |
| Scrubbed pinned chapter | unpinned, final states shown, or stepped states with a "next" control |
| Horizontal track | native horizontal scroll |
| Video scrub | no video fetched; the chapter stills crossfade (scroll-world rule) |
| Word-lit manifesto | paragraph fully lit |
| Parallax, velocity skew | off |
| Page transition | instant |
| Loops (if any) | stopped |
| Smooth scroll | off (native scroll) |

Test it: DevTools > Rendering > Emulate `prefers-reduced-motion: reduce`, then read the whole page. Nothing may be
hidden, and the story must still make sense.

---

## 10. The motion review (run before shipping; remove anything that fails)

From BoloFlow's final motion QA, verbatim questions:
1. **WHY** does this animation exist?
2. **WHAT** changed?
3. **CAN** the user understand the result without the animation?
4. **DOES** the motion feel connected to the user's action?
5. **IS** it too slow?
6. **IS** it repetitive?
7. **DOES** it look like an AI-generated template?

Plus: scroll and tap during the intro (nothing blocks); scroll fast up and down through every pinned chapter (no
jumps, no stuck pins); check at 1440, 390, 360 with CPU throttled 4x on the phone sizes.

---

## 11. Do and don't

| Do | Because |
|---|---|
| Keep durations and curves in tokens | one place to tune |
| Use `scrub: 1` and `ease: 'none'` on scrubbed timelines | smooth catch-up, linear mapping, eases inside tweens |
| Pin with enough scroll (`+=150-250%`) | rushed chapters feel cheap |
| Lazy-create heavy scenes (ScrollTrigger `onEnter`) | first load stays fast |
| Kill/revert animations on route change (`gsap.context`, `matchMedia`) | no leaks, no double triggers |

| Don't | Because |
|---|---|
| Fade every element up the same way | identical timing reads as AI (MMG §5) |
| Use blur or bounce on reveals | his 16 Oct choice: no bounce, no blur |
| Lock scroll during an intro | MO-R6 |
| Loop a marquee of logos | loops + implied fake clients |
| Animate `top`/`height` on scroll | jank |
| Load GSAP from a CDN with `@latest` | unpinned, can break tomorrow (Drive P7) |
| Hijack touch scrolling with smooth scroll | phone users expect native inertia |

---

## 12. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Library | none (IO + CSS) | GSAP + ScrollTrigger (+ Lenis) | + custom shaders/three.js timelines, View Transitions |
| Scroll | reveals, one sticky or masked moment | pinned scrubbed chapters, horizontal track, video scrub of one clip | 4-6 camera beats, multi-scene flight with seam QA, page transitions |
| Tokens | the CSS block above | + JS tokens shared with GSAP | + per-chapter pacing (linger), sound cues synced if sound is the idea |
| Reduced motion | final states | stepped states, no video fetch | full alternative path checked chapter by chapter |
| Proof | screenshots | scroll recording | recording + Performance trace at 1440 and throttled phone |

---

## 13. Pre-ship checklist

- [ ] Every animation has a one-line reason in the notes (MO-R1).
- [ ] Durations and easings come from tokens only (`grep -n "cubic-bezier\|ms" css/` shows tokens, not one-offs).
- [ ] Reveals: 16-24px, 400-520 ms, expo out, no blur, no bounce.
- [ ] No infinite animation except where the idea is motion; paused off-screen; stopped under reduced motion.
- [ ] One main mover per chapter.
- [ ] Only transform/opacity (clip-path for wipes) animate during scroll.
- [ ] GSAP/Lenis pinned and self-hosted; ScrollTrigger refreshed after fonts and images load (`ScrollTrigger.refresh()` on `load`).
- [ ] Video scrub (if any): Blob loading, seek coalescing, iOS priming, native 9:16 phone cut, seams frame-identical, no reversal across seams.
- [ ] Reduced-motion path read top to bottom: nothing hidden, story intact.
- [ ] Motion review questions answered; anything failing removed.
- [ ] 60 fps at 1440; >= 45 fps on a throttled 390 run; 0 console errors at 1440/390/360.

## 14. Files

| File | What |
|---|---|
| `examples/index.html` | tokens, IO reveals, Lenis + ScrollTrigger sync, pinned scrubbed chapter with linger, horizontal track with velocity skew, CSS scroll-driven progress bar, View Transition circle reveal, full reduced-motion path, self-tests |
| `examples/vendor/` | GSAP 3.15.0, ScrollTrigger 3.15.0 (GreenSock Standard License), Lenis 1.3.27 (MIT), unmodified |

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 30 Oct 2026 ("PC me no compromise"), 27 Oct 2026 (phone same quality; award-site click effects), 15 Oct 2026 (no endless loops on portfolio sites), 16 Oct 2026 choices recorded in his Drive's *extra_site-polish-BACKLOG.md* done log (reveal timing: smooth fade-in, 24px rise, 520 ms, no bounce, no blur; Anvaya cut to 0.4 s / 16px / threshold 0.06).
- Sujon's Drive: *boloflow-native-motion-design-system.txt* (purpose first, motion architecture, primary motion goal, global motion language, final motion QA, no blocking); *gemini-instruction-DRAFT-motion-design.txt* (rule 3 tiny overshoot, rule 5 one main mover); *Master-Award-Website-Guide-Improved-v4.2* Part E §2 Steps 1 and 6, §3 token group 5 (three curves), Structure 10 and 12, §6.2 item 3 (circle reveal), §9; Part F item 11 *Master Motion Graphics Video Creator* §5, §28; *DESIGN-LIBRARY-INDEX.md* §2; *web-design-promo-checklist.txt* ("Motion").
- Drive points M1-M15, Q11, T5, T6, L8, L9, L11, I2, I3, I5, I9, M11 (`docs/beast/SKILLS_SOURCE_MAP.md`).
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world, commit 71cc36d: SKILL.md (scroll drives time L21-26, seam law L32-35/L473-519, motion handoff L394-409, camera grammar L411-436, pacing L438-441, blob loading L528-533, encode L534-558, phone portrait chain L129-149, QA L613-646, iOS L689-699), references/scrub-engine.js (segment chain L86-101, linger L175-178, blob L198-211, lazy window L230, copy choreography L244-256, seek coalescing L273-287, iOS priming L291-307, resize L312-322), references/pipeline.md (§3, §5, §6). Points SW-T1 to SW-T21.
- Zyqor portfolio v3 measurements (bakery README v3; `site/scrub-engine.js`, an adapted copy of the scroll-world engine with its MIT notice).
- GSAP 3.15 and ScrollTrigger docs, https://gsap.com/docs/v3/ (scrub, pin, matchMedia, quickTo, ticker); Lenis docs, https://github.com/darkroomengineering/lenis; MDN: View Transition API, CSS scroll-driven animations; W3C WCAG 2.2 SC 2.3.3 Animation from Interactions.
- Award examples of scroll storytelling: Igloo Inc (abeto), Emotion Agency, Forge Automotive (12 Studio), A24 (Ravi Klaassens), via Awwwards, read Oct 30 2026 (`docs/how-top-designers-build-unique-sites.md` §2, §4).
