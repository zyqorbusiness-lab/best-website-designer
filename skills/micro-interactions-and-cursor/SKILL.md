---
name: micro-interactions-and-cursor
description: The small interactions judges click on and clients feel - a full state matrix for every control (hover, focus, press, disabled, loading, success, error), the magnetic button with its three layers, a lerp cursor with context labels, cursor-proximity border light and tilt, tactile press feedback, the squish toggle, odometer numbers (real numbers only), accordion height physics, real-action toasts, opt-in sound, skeletons, forms that confirm honestly, and the touch equivalent of every pointer effect. Numeric specs, tested vanilla code, links to the 14 components in site/components.
when_to_use: "add hover effects / click effects", "magnetic button", "custom cursor", "make buttons feel premium", "micro-interactions", "the site feels dead", "button states", "form success state", "add sound on click", reviewing interaction quality before shipping
license: MIT (text and code). Sources in CREDITS.md.
version: 1.0.0
---

# Micro-interactions and cursor

Sujon, 27 Oct 2026: study award and premium sites and **add click effects and much more**. His BoloFlow brief sets
the bar for how: interactions explain state, they are short, and they never decorate for the sake of it
(*"When Insert succeeds: Do not explode confetti."*). Judges notice exactly these details (study doc §7: magnetic
buttons, labelled cursors, navigation as a moment, real states, a footer people remember).

```
list every control -> fill the state matrix (section 2) -> pick one behaviour per interaction type (3)
   -> pointer effects with touch equivalents (4-6) -> feedback, numbers, toasts, sound (7-10) -> forms + skeletons (11)
   -> QA: no dead buttons, 44px targets, keyboard path, reduced motion (14)
```

`examples/index.html` runs every pattern here (tested at 1440 / 390 / 360 and with reduced motion). The repo's
[`site/components/`](../../site/components/) has 14 production components built on the same rules
(magnetic-button, cursor-follower, image-trail, liquid-glass-card, mega-menu, page-transition, preloader,
pricing-table, quote-carousel, marquee, split-text, sticky-story, scroll-3d-stage, footer-wordmark).

---

## 0. Desktop first, no compromise

*"PC me no compromise, ek dam best"* (Sujon, 30 Oct 2026). Desktop has a precise pointer and a big screen, so it
gets the full set:

1. **Pointer effects on `(hover: hover) and (pointer: fine)`**: magnetic CTA, cursor with context labels, border light
   that follows the cursor, gentle tilt on glass panels, image previews on list hover.
2. **Every state animated** with the motion tokens (fast 180 ms for hover, 90 ms for press, 320 ms for panels).
3. **Keyboard is a first-class desktop input**: every effect has a `:focus-visible` version, never only `:hover`.
4. **120 Hz smoothness**: pointer effects run in one rAF loop with lerp, transform-only.

### Phone parity

- **Every hover effect has a tap or press equivalent** (Drive I12: *"Hover-based UI that makes no sense on mobile"* is
  banned). Magnetic pull becomes a press compression; image-on-hover becomes tap-to-open; tilt can follow device
  orientation after permission, or simply stays still.
- **No information only on hover.** A preview, a price, a label that appears on hover must be visible or one tap away on phone.
- The custom cursor is **off** on touch (`pointer: coarse`) and for keyboard users; the system cursor is never hidden
  on desktop unless the replacement is always visible.
- Tap targets at least 44 x 44 px; press feedback within 100 ms.

---

## 1. Rules with reasons

| # | Rule | Why |
|---|---|---|
| MI-R1 | **Every control has all its states** (section 2). | His checklist: *"Designers aksar happy path bana ke bhaag jaate hain."* Loading, empty, error, success, disabled, processing, offline, permission, first use. |
| MI-R2 | **Zero dead buttons.** No `href="#"`, no button without a handler. | Master Award System §11: *"Zero buttons on the page may remain dead or un-wired."* Judges click everything. |
| MI-R3 | **Feedback is short and quiet**: compress, change state, brief confirmation, back to normal. | BoloFlow signature animation 5; no giant persistent "Copied!", no confetti. |
| MI-R4 | **Icons move only to explain state** (a play icon morphing to pause, a + rotating to ×). | BoloFlow: icon animation follows real state changes. |
| MI-R5 | **Progress and numbers are real.** Odometers only for real values (a configurator price, a product spec), loaders only for real progress. | Drive I4, M11: never invented proof metrics or a fake 97%. |
| MI-R6 | **Sound is opt-in, on click only, never on scroll**, with a visible mute. | Drive I13; his own portfolio skipped intro sound because it "annoys clients". |
| MI-R7 | **No hover-only meaning; touch equivalent for every pointer effect.** | Drive I12; phone parity. |
| MI-R8 | **At most two component libraries per site, restyled and licence-checked**; shadcn/ui-style kits never ship their default look. | Website-Building Guide §5b. |
| MI-R9 | **Toasts only for real actions, with true text.** | The Drive's default toast "Action confirmed • Instant telemetry sync" is fake (X15). |
| MI-R10 | **Card hover: the frame stays still, the image inside moves** (scale 1.04 over 700 ms). | Master Award System §1: replaces the cheap card bounce (`hover:scale-105` + heavy shadow). |
| MI-R11 | **No sparkle icons, no animated decorative arrows, no emoji.** Icons: Phosphor, Tabler (MIT) or custom SVG; never Lucide (his list). An arrow only means "opens in a new tab", static. | His 30-item avoid list; Drive H13, X13. |

---

## 2. The state matrix (fill it for every control)

| State | Visual | Timing | Notes |
|---|---|---|---|
| Default | resting style | - | contrast 3:1 for the control's boundary (WCAG 1.4.11) |
| Hover (pointer: fine) | one change: fill, border light, label roll or magnetic offset | 180 ms expo out | never the only cue |
| Focus-visible | 2px accent ring, offset 3px | instant | must be visible on every background |
| Pressed / active | scale 0.96-0.97 or 1-2px inset | 90 ms in, 180 ms out | on touch this IS the hover |
| Disabled | 40-50% opacity + `cursor: not-allowed` + `aria-disabled` | - | explain why near it |
| Loading / processing | label replaced by a short label ("Sending") + a small progress or spinner, width locked | starts within 100 ms | prevents double submit |
| Success | brief text ("Sent", "Copied"), ink colour, then back | 1.2-2 s, then revert | no confetti |
| Error | message next to the field in words + icon, focus moved to it | instant | never colour alone |

Lock button width while the label changes (`min-width` from the widest label) so the layout does not jump.

---

## 3. One behaviour per interaction type

| Interaction | Behaviour | Spec |
|---|---|---|
| Primary CTA | magnetic + entry-point fill + label slot roll | radius 80px, pull 0.28, label 0.14; fill from the entry point; roll -120% |
| Secondary link | underline grows from the left | `scaleX(0 -> 1)`, 320 ms |
| Selection (tabs, swatches, plans) | indicator travels; mid-flight squish | `scaleX(1.12)` then settle (spring stiffness 420, damping 28) |
| Toggle (theme) | circular reveal from the click point | View Transitions, 650 ms, expo out (motion skill §8) |
| Expand (FAQ) | height physics with grid rows; + rotates 45° into × | `grid-template-rows 0fr -> 1fr`, 320 ms |
| List with previews | image follows the cursor / tap opens | lerp 0.15; on touch the first tap opens |
| Drag (gallery, slider) | momentum + friction, small skew | velocity x 0.93 per frame, skew clamp ±3.5° |
| Copy (email) | compress, swap label to "Copied", revert | 90 ms / 1.5 s |
| Number change (configurator) | odometer roll | easeOutQuart, 1600 ms on enter, 600 ms on change |

---

## 4. Magnetic button (Drive I1, three layers)

```html
<a class="mag" href="#contact"><span class="mag-fill" aria-hidden="true"></span>
  <span class="mag-label"><span>Start a project</span><span aria-hidden="true">Start a project</span></span></a>
```
```css
.mag{position:relative;display:inline-flex;align-items:center;min-height:52px;padding:0 1.6rem;border-radius:999px;overflow:hidden;
  background:var(--c-ink);color:var(--c-canvas);text-decoration:none;transition:transform .5s var(--ease-spring-snappy)}
.mag-fill{position:absolute;width:0;height:0;border-radius:50%;background:var(--c-accent);transform:translate(-50%,-50%);
  transition:width .5s var(--ease-out-expo),height .5s var(--ease-out-expo)}
.mag:hover .mag-fill{width:260%;height:260%}
.mag-label{position:relative;display:grid;overflow:hidden;line-height:1.2}
.mag-label>span{grid-area:1/1;transition:transform .45s var(--ease-out-expo)}
.mag-label>span+span{transform:translateY(120%)}
.mag:hover .mag-label>span:first-child{transform:translateY(-120%)}
.mag:hover .mag-label>span+span{transform:none}
.mag:active{transform:scale(.96)}
@media (prefers-reduced-motion: reduce){.mag,.mag *{transition:none}}
```
```js
function magnetic(el, { radius = 80, pull = 0.28, label = 0.14 } = {}) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lab = el.querySelector('.mag-label'), fill = el.querySelector('.mag-fill');
  el.addEventListener('pointerenter', (e) => { const r = el.getBoundingClientRect(); fill.style.left = e.clientX - r.left + 'px'; fill.style.top = e.clientY - r.top + 'px'; });
  addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy;
    const near = Math.hypot(dx, dy) < radius + Math.max(r.width, r.height) / 2;
    el.style.transform = near ? `translate(${dx * pull}px,${dy * pull}px)` : '';
    lab.style.transform = near ? `translate(${dx * label}px,${dy * label}px)` : '';
  }, { passive: true });
}
```
Touch: the `:active` compression is the whole effect. The label is duplicated for the roll, so the second copy is
`aria-hidden` (screen readers hear it once).

---

## 5. Cursor with context labels (Drive I6)

Dot follows exactly; ring lerps at 0.16; labels ("View", "Drag", "Play") appear over targets marked
`data-cursor="View"`. Skipped on `pointer: coarse` and under reduced motion; the native cursor stays visible
underneath (never `cursor:none` on the whole page).

```js
function cursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const dot = Object.assign(document.createElement('div'), { className: 'cur-dot' }), ring = Object.assign(document.createElement('div'), { className: 'cur-ring' });
  ring.setAttribute('aria-hidden', 'true'); dot.setAttribute('aria-hidden', 'true'); document.body.append(dot, ring);
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
  const loop = () => { rx += (x - rx) * 0.16; ry += (y - ry) * 0.16; ring.style.transform = `translate(${rx}px,${ry}px)`;
    raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(loop) : 0; };
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
  document.addEventListener('pointerover', (e) => { const t = e.target.closest('[data-cursor]'); ring.dataset.label = t ? t.dataset.cursor : ''; ring.classList.toggle('has-label', !!t); });
}
```
```css
.cur-dot,.cur-ring{position:fixed;left:0;top:0;pointer-events:none;z-index:200}
.cur-dot{width:6px;height:6px;margin:-3px;border-radius:50%;background:var(--c-ink)}
.cur-ring{width:36px;height:36px;margin:-18px;border-radius:50%;border:1px solid var(--c-ink);display:grid;place-items:center;transition:width .3s var(--ease-out-expo),height .3s var(--ease-out-expo),margin .3s var(--ease-out-expo),background-color .3s}
.cur-ring.has-label{width:84px;height:84px;margin:-42px;background:var(--c-ink)}
.cur-ring.has-label::after{content:attr(data-label);color:var(--c-canvas);font:500 .75rem/1 var(--font-mono,monospace);letter-spacing:.1em;text-transform:uppercase}
```
No arrow glyphs in labels (his avoid list: animated arrows).

---

## 6. Border light and tilt (Drive I7)

```css
.lit{position:relative;border:1px solid var(--c-hairline);border-radius:12px;background:var(--c-surface)}
.lit::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;pointer-events:none;opacity:0;transition:opacity .3s;
  background:radial-gradient(240px circle at var(--mx,50%) var(--my,50%),var(--c-accent),transparent 60%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
@media (hover:hover) and (pointer:fine){.lit:hover::before{opacity:1}}
```
```js
document.querySelectorAll('.lit').forEach((el) => el.addEventListener('pointermove', (e) => {
  const r = el.getBoundingClientRect(); el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
  if (el.dataset.tilt !== undefined && !matchMedia('(prefers-reduced-motion: reduce)').matches)
    el.style.transform = `perspective(1000px) rotateX(${((e.clientY - r.top) / r.height - 0.5) * -8}deg) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 8}deg)`;
}));
```
The radial gradient here is light on a border, in the accent hue only (allowed by the colour rules). Tilt max ±8°,
perspective 1000px, reset on `pointerleave`. Use on glass panels and ledger rows, not on bento grids (avoided).

---

## 7. Press feedback and copy-to-clipboard (Drive I9)

```js
async function copy(btn, text) {
  try { await navigator.clipboard.writeText(text); } catch { return say(btn, 'Press and hold to copy'); }
  say(btn, 'Copied');
}
function say(btn, msg) {
  const label = btn.querySelector('.label'), was = label.textContent;
  btn.style.minWidth = btn.offsetWidth + 'px'; label.textContent = msg; btn.setAttribute('aria-live', 'polite');
  setTimeout(() => { label.textContent = was; btn.style.minWidth = ''; }, 1500);
}
```
`:active{transform:scale(.96)}` with `transition: transform 90ms` gives the press on every device.

---

## 8. Squish toggle, odometer, accordion

```css
/* segmented control with a travelling indicator (Drive I2) */
.seg{position:relative;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:4px;border-radius:999px;border:1px solid var(--c-hairline)}
.seg button{position:relative;z-index:1;min-height:44px;padding:0 1.2rem;border:0;background:none;color:inherit;font:inherit;cursor:pointer}
.seg .ind{position:absolute;top:4px;bottom:4px;left:4px;border-radius:999px;background:var(--c-ink);transition:transform .42s var(--ease-spring-snappy)}
.seg button[aria-pressed=true]{color:var(--c-canvas)}
```
```js
function seg(el) { const btns = [...el.querySelectorAll('button')], ind = el.querySelector('.ind');
  const go = (b) => { btns.forEach((x) => x.setAttribute('aria-pressed', x === b)); ind.style.width = b.offsetWidth + 'px';
    ind.animate([{ transform: ind.style.transform || 'none' }, { transform: `translateX(${b.offsetLeft - 4}px) scaleX(1.12)` }, { transform: `translateX(${b.offsetLeft - 4}px)` }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    ind.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
  btns.forEach((b) => b.addEventListener('click', () => go(b))); go(btns.find((b) => b.getAttribute('aria-pressed') === 'true') || btns[0]); }

// odometer for REAL numbers (Drive I4): easeOutQuart
function rollTo(el, to, ms = 600) { const from = +el.dataset.v || 0, t0 = performance.now(), fmt = new Intl.NumberFormat('en-US');
  const step = (t) => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt.format(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(step); else el.dataset.v = to; };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt.format(to); el.dataset.v = to; } else requestAnimationFrame(step); }
```
```css
/* accordion with real height physics (Drive I10) */
.acc-panel{display:grid;grid-template-rows:0fr;transition:grid-template-rows .32s var(--ease-out-expo)}
.acc-panel>div{overflow:hidden}
.acc[aria-expanded=true]+.acc-panel{grid-template-rows:1fr}
.acc .plus{transition:transform .32s var(--ease-out-expo)}
.acc[aria-expanded=true] .plus{transform:rotate(45deg);color:var(--c-accent)}
```
Odometer numbers use `font-variant-numeric: tabular-nums` so the width does not jump.

---

## 9. Toasts (real actions only)

A toast appears only after a real action, says what happened in plain words ("Link copied", "Message sent"), sits in
an `aria-live="polite"` region, auto-dismisses after 3-4 s, pauses on hover/focus, and can be dismissed. Never a toast
for scrolling, for page load, or with invented system text (X15). A command palette (⌘K) only where there is a lot to
search (a library index), not on every site.

---

## 10. Sound (opt-in)

- Ask at the door or offer a toggle; **off by default**; remember the choice (`localStorage`).
- Sounds on click/press only, 40-120 ms, quiet (-18 to -24 dBFS peak), never on scroll or hover.
- A visible mute: four equaliser bars that flatten into a 1px line when muted (Master Award System Structure 14).
- Use licensed or self-recorded samples (credited), or synthesise a tiny click with Web Audio (no asset needed):

```js
let ctx = null, soundOn = localStorage.getItem('sound') === 'on';
function click() { if (!soundOn) return; ctx ||= new AudioContext();
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
  o.type = 'triangle'; o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(600, t + 0.05);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.09); }
```
Sound belongs where it is the brand (a music school's strings, a hi-fi deck); elsewhere skip it.

---

## 11. Forms and skeletons

- Labels always visible (no placeholder-only fields); errors in words next to the field; the submit button shows
  loading, then success text; on a concept site the success says the truth ("Concept: this form is not sent").
- Honeypot field + server-side validation (web-security skill).
- **Skeletons where loading is visible** (his avoid-list item "no skeleton loaders", read the other way round): grey
  blocks in `--c-surface` with the exact size of the coming content, a slow 1.2 s shimmer that stops under reduced
  motion, replaced in place (no layout shift).

---

## 12. Do and don't

| Do | Because |
|---|---|
| Fill the state matrix before styling | the unhappy paths are where sites feel cheap |
| Gate pointer effects with `(hover:hover) and (pointer:fine)` | no sticky hover on phones |
| Give every pointer effect a press/tap version | phone parity |
| Keep effects transform/opacity, one rAF loop | 120 Hz smooth |
| Use real `<button>`/`<a>` with `aria-pressed` / `aria-expanded` | keyboard and screen readers work for free |

| Don't | Because |
|---|---|
| Hide the system cursor everywhere | people lose the pointer; accessibility |
| Put information only in a hover state | invisible on phones |
| Animate card frames on hover (scale 1.05 + shadow) | the cheap card bounce |
| Confetti, sparkles, bouncing arrows | his avoid list; AI look |
| `href="#"` placeholders | dead buttons |
| Sound by default, or on scroll | annoys clients (his words) |

---

## 13. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Must have | full state matrix on every control, press feedback, focus rings, one micro-interaction beyond the signature | + magnetic CTA, cursor labels or border light, odometer for a real number, accordion physics | + every control custom-crafted, sound if it is the brand, toasts for real actions, ⌘K where content is large |
| Touch | press states | + tap versions of every pointer effect | + device-tilt alternatives where they add meaning |
| QA | no dead buttons, 44px targets | + keyboard-only pass | + screen-reader pass (VoiceOver/TalkBack) on the key flows |

---

## 14. Pre-ship checklist

- [ ] State matrix filled for every control type on the page.
- [ ] `node tools/check-links.mjs --all` (repo tool) or a manual pass: no `href="#"`, no handler-less buttons.
- [ ] Every hover effect: a `:focus-visible` version and a touch version; nothing only on hover.
- [ ] Custom cursor (if any) off on touch and under reduced motion; native cursor not hidden.
- [ ] Tap targets 44 x 44 px or more (layout skill's `layoutAudit()`).
- [ ] Press feedback under 100 ms; success/error states in words.
- [ ] Odometers only on real numbers; loaders only on real progress.
- [ ] Sound off by default, mute visible, never on scroll.
- [ ] Icons: Phosphor/Tabler/custom SVG; no Lucide, no emoji, no sparkles, no animated arrows.
- [ ] Reduced motion: all states still visible, no movement.
- [ ] 0 console errors at 1440, 390, 360.

## 15. Files

| File | What |
|---|---|
| `examples/index.html` | magnetic CTA, cursor with labels, border light + tilt, copy with press feedback, squish toggle, odometer, accordion, toast, opt-in sound with equaliser mute, form states, skeleton; self-tests for dead buttons and target sizes |
| `../../site/components/` | 14 production components (live: https://zyqor-concepts.sites.tab.bot/components/) |

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 27 Oct 2026 12:07 PM (study award and premium sites, add click effects and much more), 27 Oct 2026 (phone same quality), 30 Oct 2026 ("PC me no compromise"); 30-item avoid list (2 Oct 2026).
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* Part E §1 (card bounce replacement), §6.1-§6.4 (magnetic button, squish toggle, circle reveal, odometer, draggable track, lerp cursor, spotlight + tilt), §8.9 (accordion), §11 (zero dead buttons, palette and toasts), Structure 14 (sound toggle); Part F item 8 (anti-AI rules), item 13 §5-§6; *boloflow-native-motion-design-system.txt* (signature animations 4-6, icon animation, microinteractions, anti-vibecode item 28); *web-design-promo-checklist.txt* ("UX states"); *lottie-icon-click-animation-note.txt*; *Website-Building-Guide-New-Site.md* §5b (component library rules), §6 rule 5, §7; the Drive PDF points (PTS item 19: intro sound annoys clients).
- Drive points I1-I15, A5, M10, M11, Q9, H13, X10, X13, X15 (`docs/beast/SKILLS_SOURCE_MAP.md`).
- Award sites with magnetic buttons, labelled cursors, menus and footers listed as elements: Lusion, A24 (Ravi Klaassens), landonorris.com (OFF+BRAND), Star Atlas, Emotion Agency, Don't Board Me, Opal (Awwwards pages read Oct 30 2026).
- @ayzz.thedesigner, pattern I (micro UI: rolling numbers, add-to-cart into a box, liquid-glass lens), described only.
- W3C WCAG 2.2 (1.4.11 Non-text Contrast, 2.4.7 Focus Visible, 2.5.8 Target Size, 4.1.3 Status Messages); WAI-ARIA Authoring Practices (button, accordion, toggle button patterns); MDN Web Audio API.
