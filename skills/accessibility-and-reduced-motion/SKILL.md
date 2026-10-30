---
name: accessibility-and-reduced-motion
description: Accessibility for premium, motion-heavy websites without dumbing them down - WCAG 2.2 AA as numbers (contrast 4.5/3:1, focus, 24/44 px targets, reflow at 320 px), semantic structure and landmarks, keyboard paths and focus management for menus, dialogs, carousels and configurators, accessible 3D/canvas/video, alt text that says something, forms and errors, reduced motion that still tells the story, forced colours and high contrast, and an automated checker (contrast, names, alt, headings, landmarks, targets, focus ring) that runs at 1440 and 390.
when_to_use: "make it accessible", "WCAG", "screen reader", "keyboard navigation", "focus outline", "reduced motion", "alt text", "contrast", "accessibility audit", before shipping any page, whenever motion, 3D, drag or custom controls are added
license: MIT (text and code). Sources in CREDITS.md.
version: 1.0.0
---

# Accessibility and reduced motion

Premium and accessible are the same job: the motion stays, and every link, control and fact stays reachable by
keyboard, screen reader and zoom. His Drive sets the floor (*"Body text at least 4.5:1, large text at least
3:1; visible keyboard focus; alt text on images; avoid colour-only meaning; respect motion sensitivity"*) and BoloFlow
sets the reduced-motion rule: *"Remove unnecessary scaling, reduce travel distance, reduce bounce, replace elaborate
transitions with simpler fades/state changes, never make important information depend only on animation."*

```
semantics first (section 2) -> colour + type numbers (3) -> keyboard + focus (4) -> custom widgets (5)
   -> media, 3D, canvas (6) -> forms (7) -> reduced motion (8) -> forced colours (9) -> a11y-check + manual pass (10)
```

`scripts/a11y-check.mjs` loads a URL at 1440 and 390 and reports text contrast failures (with the colours), images
without alt, controls without names, heading-level jumps, missing landmarks, small targets, missing focus rings and
`user-scalable=no`. `examples/index.html` shows the patterns working (skip link, menu dialog with focus trap, a
pausable carousel, an accessible canvas, form errors, reduced-motion and forced-colours behaviour) with self-tests.

---

## 0. Desktop first, no compromise

On desktop the visitor may be on a keyboard, a screen reader (NVDA, JAWS, VoiceOver), zoomed to 200%, or using
Windows High Contrast. "No compromise" includes them:

1. **Every pointer effect has a keyboard equivalent** (focus-visible styles mirror hover; drag has buttons).
2. **Zoom to 200% at 1440** (= a 720 px layout) must reflow without loss (WCAG 1.4.4, 1.4.10).
3. **Focus is always visible** with a 2 px ring in the accent, 3 px offset, never `outline:none` without a replacement.
4. **The 3D and scroll stories have a text equivalent** on the page (the same facts the motion shows).

### Phone parity

- VoiceOver (iOS) and TalkBack (Android) swipe order = DOM order: keep the source order logical when CSS reorders.
- Targets 44 x 44 px (Apple) / 48 dp (Material); WCAG 2.2's minimum is 24 x 24 px with spacing (2.5.8).
- Pinch zoom always allowed; text resizes with system settings (rem units).
- Reduced motion applies on phones too (iOS "Reduce Motion", Android "Remove animations").

---

## 1. The numbers (WCAG 2.2 AA)

| Check | Requirement | SC |
|---|---|---|
| Body text contrast | 4.5:1 | 1.4.3 |
| Large text (24 px+, or 18.66 px+ bold) | 3:1 | 1.4.3 |
| Icons, input borders, focus rings, chart lines | 3:1 against neighbours | 1.4.11 |
| Reflow | no horizontal scroll at 320 CSS px wide | 1.4.10 |
| Text spacing | survives line-height 1.5, letter 0.12em, word 0.16em, paragraph 2em | 1.4.12 |
| Target size | at least 24 x 24 px (we use 44) | 2.5.8 |
| Focus visible / not obscured | visible, not hidden under sticky bars | 2.4.7, 2.4.11 |
| Dragging | a single-pointer alternative for every drag | 2.5.7 |
| Motion from interaction | can be disabled (reduced motion) | 2.3.3 (AAA, we follow it) |
| Pause, stop, hide | anything moving > 5 s can be paused | 2.2.2 |
| Flashes | nothing flashes more than 3 times a second | 2.3.1 |

---

## 2. Semantics and structure

```html
<a class="skip" href="#main">Skip to content</a>
<header>... <nav aria-label="Main">...</nav></header>
<main id="main"> <h1>One h1</h1> <section aria-labelledby="s1-h"><h2 id="s1-h">...</h2></section> </main>
<footer>...</footer>
```
- One `<h1>`; headings never skip levels (h2 -> h4 is a failure of structure, not of rules, but screen-reader users
  navigate by it).
- Landmarks: `header`, `nav` (labelled when there are several), `main`, `footer`; sections labelled by their heading.
- Real elements first: `<button>` for actions, `<a href>` for navigation, `<details>`, `<dialog>`, `<input type=range>`.
  ARIA only when no element exists (`aria-pressed`, `aria-expanded`, `aria-current`, `aria-live`).
- Language: `<html lang="en">`; parts in other languages get their own `lang` (`<span lang="hi">`).
- Decorative SVG/icons `aria-hidden="true"`; icon-only buttons get `aria-label`.

---

## 3. Colour and type

- Check every text/background pair of the palette (colour-systems skill `palette.mjs`); secondary text tokens are the
  usual failure (Drive C4: pick the grey from the canvas, then measure).
- Never colour alone for meaning: errors get an icon + words; links in text get an underline.
- Text over images/video: a scrim or a solid panel so the contrast holds over the brightest frame.
- Body text 16 px minimum, line-height 1.5-1.65, max 75 characters per line.
- Real finding from this repo: the portfolio's accent #8F6420 measured 4.49:1 as a label colour (fails by 0.01);
  #8C611C passes at 4.6:1 (colour-systems skill).

---

## 4. Keyboard and focus

```css
:focus-visible{outline:2px solid var(--c-accent);outline-offset:3px;border-radius:6px}
:focus:not(:focus-visible){outline:none}
.sticky-header ~ main :target, main :focus{scroll-margin-top:96px}   /* focus not hidden under the sticky bar (2.4.11) */
```
- Tab order follows reading order; no positive `tabindex`.
- Every custom control works with the keys its role expects (WAI-ARIA Authoring Practices): Enter/Space on buttons,
  arrows in tabs/radios/sliders/menus, Escape closes overlays.
- Smooth-scroll libraries (Lenis) must not break keyboard scrolling (Space, Page Down, arrows) or in-page anchors.
- Visible focus on pinned/scroll-driven sections: focusing a link inside a pinned chapter scrolls it into view.

---

## 5. Custom widgets, done right

| Widget | Must have |
|---|---|
| Menu (phone sheet) | `<dialog>` with `showModal()` (focus trapped, Escape closes, background inert), button with `aria-expanded`, focus returns to the button |
| Tabs / segmented control | `role=tablist/tab/tabpanel` or buttons with `aria-pressed`; arrows move between tabs |
| Accordion | `<button aria-expanded aria-controls>`; or `<details>` |
| Carousel / marquee | pause button, no auto-advance faster than 5 s, slides announced ("3 of 6"), stops on focus/hover |
| Custom cursor | decorative (`aria-hidden`), never replaces the native cursor's information |
| Drag configurator | buttons for every option (2.5.7), the result described in text (`aria-label` on the stage, a list) |
| Toasts | `aria-live="polite"`, stay 4+ s, pause on hover/focus |
| Scroll-told story | every fact also exists as text in the DOM; chapter headings are real headings |

---

## 6. Images, video, 3D, canvas

- **Alt text says what the image means here**: "Pizza marinara with garlic, from above" (product), `alt=""`
  (decorative), never "image of" or file names. No "AI" in alt text (his rule).
- **Video**: muted autoplay only, a visible pause control for anything over 5 s, captions for speech, no flashing.
- **3D / canvas**: `<canvas role="img" aria-label="Copper kettle turning slowly">`, or `aria-hidden` plus a text
  equivalent nearby; controls of the scene are real buttons; the WebGL poster has alt text.
- **Scroll-scrubbed video**: the chapter copy carries the meaning; the video is decorative to a screen reader.

---

## 7. Forms

- Visible `<label for>` on every field; placeholder is a hint, never the label.
- Required fields marked in text; errors in words next to the field, linked by `aria-describedby`, focus moved to
  the first invalid field, `aria-invalid="true"`.
- `autocomplete` tokens (name, email, tel, street-address) help everyone, especially motor-impaired users.
- Success and status messages in a live region (`role="status"`).

---

## 8. Reduced motion that still tells the story

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
}
```
```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
if (reduce.matches) { /* no Lenis, no scrub, chapters jump to their resting frame, 3D shows a still pose */ }
reduce.addEventListener('change', () => location.reload());     // or re-init without motion
```

| Effect | Reduced version |
|---|---|
| Reveal on scroll (rise + fade) | content visible immediately |
| Pinned scroll scene / scrubbed video | static chapters with their key frame (poster) and the copy |
| Parallax, mouse tilt, magnetic | off |
| 3D auto-rotation / camera flights | still pose; drag-to-rotate still allowed (user-initiated) |
| Page transitions | instant or a 150 ms fade |
| Marquee | static row |
| Counters / odometers | final value shown |
| Bake / finish transition (configurator) | instant state change |

Never hide information behind motion (BoloFlow). Do not use reduced motion as "no design": colours, type, layout
and interactions stay.

---

## 9. Forced colours and high contrast

```css
@media (forced-colors: active){
  .btn,.glass,.card{border:1px solid CanvasText}          /* backgrounds vanish: give shapes a border */
  :focus-visible{outline:2px solid Highlight}
  .icon{forced-color-adjust:auto}
}
@media (prefers-contrast: more){ :root{--c-muted:var(--c-ink)} .glass{backdrop-filter:none;background:var(--c-canvas)} }
```
Glass, gradients and box-shadows disappear in Windows High Contrast: borders keep the structure.

---

## 10. Testing

1. `node scripts/a11y-check.mjs <url>` (1440 and 390): fix every FAIL.
2. Keyboard-only pass: Tab through the whole page; every control reachable, visible, usable; Escape closes overlays.
3. Screen reader pass on the key flow (VoiceOver: Cmd+F5 on Mac; iOS triple-click; NVDA on Windows).
4. Zoom 200% at 1440 and 400% (reflow); text spacing bookmarklet.
5. Reduced motion (DevTools > Rendering > Emulate prefers-reduced-motion) at 1440 and 390.
6. Forced colours (DevTools > Rendering > Emulate forced-colors).
7. Optional deeper scan: axe-core (MPL-2.0) in the QA browser only (`npm i -D axe-core`), not shipped.

---

## 11. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Baseline | AA contrast, semantics, focus, alt, labels, reduced motion | + keyboard paths for every custom widget, live regions | + screen-reader pass, forced colours, text equivalents for 3D/scroll stories |
| Motion | CSS reduced-motion block | + JS paths (no Lenis/scrub) | + designed reduced versions per scene (table in section 8) |
| QA | a11y-check at 1440/390 | + keyboard pass recorded | + VoiceOver/TalkBack run recorded |


## 11b. What a11y-check found in this repo (30 Oct 2026)

Run on the live portfolio build (`site/`): home, P041 Hotcoal Kitchen, services, at 1440 and 390.

| Page | Finding | Fix (not yet applied; owner's design call) |
|---|---|---|
| Home (desktop + phone) | the "%" in the pricing figure in accent `#B5832F` on the paper canvas: 2.88:1, under 3:1 for large text | use the darker accent `#8C611C` from `colour-systems` for text; keep `#B5832F` for fills |
| Home | a heading jumps from h2 to h4 (a card title) | make card titles h3 |
| Home | colourway dots 10x10 px, closer than 24 px to each other | 24 px hit area per dot (padding or `::after`), visual dot can stay 10 px |
| Services (phone) | "Start a project" button: paper text on `#B5832F`, 2.88:1 at 13 px | ink text on the accent, or the darker accent as the fill |
| Services | footnote at 60% ink opacity: 3.33:1 at 12-13 px | 80% opacity or full ink (>= 4.5:1) |
| P041 Hotcoal Kitchen | 0 failures; touch targets 42 px (warning against Zyqor's 44 px bar) | 44 px |

What the checker could not judge: 52 text blocks on the home page sit on video, images or glass; those are checked by
eye on the screenshots (the scrim rule in `colour-systems`).

How the checker treats targets: WCAG 2.5.8 is 24x24 px **or** enough spacing (a 24 px circle on each small target does
not touch another target), and inline links in a sentence are exempt. A target that passes only by spacing, or is
under 44 px on a touch screen, is a warning: Zyqor's own bar is 44 px on phones.

---

## 12. Do and don't

| Do | Because |
|---|---|
| Use real elements before ARIA | free keyboard and screen-reader support |
| Keep a visible focus ring in the accent | keyboard users see where they are |
| Give drag, hover and scroll effects a button/text equivalent | WCAG 2.5.7, phones, screen readers |
| Design the reduced-motion version | it is still the brand |
| Measure contrast of every token pair | greys fail first |

| Don't | Because |
|---|---|
| `outline:none` without a replacement | invisible focus |
| `maximum-scale=1` / `user-scalable=no` | blocks zoom (1.4.4) |
| Auto-advancing carousels without pause | 2.2.2 |
| Text baked into images | unreadable, untranslatable |
| Information only in animation or colour | lost to many users |

---

## 13. Pre-ship checklist

- [ ] `a11y-check.mjs` passes at 1440 and 390.
- [ ] Skip link, landmarks, one h1, no heading jumps.
- [ ] Keyboard: everything reachable and visible; Escape closes overlays; focus returns.
- [ ] Contrast: text 4.5:1 / 3:1, UI 3:1; text over media has a scrim.
- [ ] Alt text meaningful; decorative images `alt=""`; no "AI" wording.
- [ ] Drag/hover/scroll effects have equivalents; carousels pausable.
- [ ] Forms: labels, errors in words, live status.
- [ ] Reduced motion designed per scene; forced colours keep structure.
- [ ] Zoom 200% and 320 px reflow without loss.

## 14. Files

| File | What |
|---|---|
| `scripts/a11y-check.mjs` | contrast (computed colours, solid backgrounds), alt, accessible names, heading order, landmarks, targets, focus ring, zoom block; 1440 + 390; exits 1 on failures |
| `examples/index.html` | skip link, dialog menu with focus trap, pausable carousel, accessible canvas, form errors, reduced motion and forced colours; self-tests |

## Sources

- Sujon's Drive: *Website-Building-Guide-New-Site.md* §6 rule 6, §7 (accessibility checks, keyboard, reduced motion); *Master-Award-Website-Guide-Improved-v4.2* Part B (Keyboard, Accessibility rows), Part E §2 Step 2 item 4 (off-white text on dark), §11 (Escape), Part F item 13 §5, §7; *boloflow-native-motion-design-system.txt* "ACCESSIBILITY / REDUCED MOTION"; *web-design-promo-checklist.txt* ("UX states", "Accessibility").
- Drive points A1-A5, C4, D6, I13 (`docs/beast/SKILLS_SOURCE_MAP.md`); scroll-world reduced-motion handling (T11).
- Sujon Hoque: WhatsApp 30 Oct 2026 ("PC me no compromise"); no AI wording anywhere.
- W3C WCAG 2.2 (SC 1.4.3, 1.4.4, 1.4.10, 1.4.11, 1.4.12, 2.2.2, 2.3.1, 2.3.3, 2.4.7, 2.4.11, 2.5.7, 2.5.8); WAI-ARIA Authoring Practices Guide (dialog, tabs, accordion, carousel patterns); MDN (`prefers-reduced-motion`, `forced-colors`, `prefers-contrast`, `<dialog>`).
- Repo finding: portfolio accent #8F6420 at 4.49:1 (colour-systems skill, 30 Oct 2026).
