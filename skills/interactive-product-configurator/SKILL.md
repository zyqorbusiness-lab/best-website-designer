---
name: interactive-product-configurator
description: Drag-to-build and customise-your-product experiences (pizza builders, bowl builders, gift boxes, sneaker colourways, furniture finishes) - the anatomy taken from a pizza-builder reel, real photo layers cut from CC0 photos, pointer-event drag with a snap ring, tap-to-add on phones, spaced random placement and layer order, the live order ticket with an odometer, the "bake / finish" transition, honest order forms, accessibility for drag, and the QA script that drags, taps and fires. Lead example: Zyqor Library concept P041 Hotcoal Kitchen.
when_to_use: "build your own pizza / bowl / box", "product configurator", "drag and drop ingredients", "customise the product", "add to cart with a live price", "interactive ordering site", the reel by @online.by.annie, any site where the visitor assembles the product
license: MIT (text and code). Demo photos: Wikimedia Commons (CC0 and CC BY 3.0) and Poly Haven (CC0), credited in CREDITS.md.
version: 1.0.0
---

# Interactive product configurator (drag-to-build)

Sujon, 30 Oct 2026 10:42 AM IST, sent a reel by **@online.by.annie** ("Annie | Web Design Tips") showing a pizza
site branded "Tondo": a tray of real-photo ingredient bowls, the visitor drags sauce, pepperoni and basil onto a real
pizza base in a box, the pizza builds up layer by layer, a "baked" state follows, and an order card sits on the right.
He asked for a skill and a concept like it, "high quality, no compromise". (The site's own designer could not be
identified by search on 30 Oct 2026; the reel is credited as inspiration only and none of its footage is used.)

The result is concept **P041 Hotcoal Kitchen** (`site/library/p/P041/`), and this skill is the method behind it.

```
the product + its parts (section 1) -> real photo layers, cut out once (2) -> stage: base, layers, z-order (3)
   -> input: drag with snap ring (desktop), tap-to-add (phone), click/Enter (keyboard) (4) -> placement (5)
   -> live ticket (6) -> the finish transition (7) -> honest order (8) -> a11y (9) -> QA script (10)
```

`examples/index.html` is a compact working builder that uses P041's real photo layers (drag, click, tap, remove,
fire, reduced motion, self-tests).

---

## 0. Desktop first, no compromise

1. **Three columns at 1440**: tray (about 30%), the product stage (about 45%, as large as the height allows:
   `min(100%, 78vh, 820px)`), the order ticket (about 25%). The product is the hero.
2. **Real drag**: pointer events with capture, a ghost of the bowl following the cursor, a dashed snap ring on the
   product that turns solid when the pointer is over it, a fly-back if dropped outside.
3. **Every landing animates**: each piece flies from the drop point to its own spot with a 35-40 ms stagger, a short
   overshoot (scale 1.06) and a drop shadow that tightens as it settles.
4. **Hover**: bowls lift 2 px and their contents shift (pointer: fine only).

### Phone parity

- **Same photos, same pieces, same finish transition** (m.html).
- **Tap to add** instead of drag (drag fights page scrolling on touch): the pieces fly from the tapped bowl to the
  product so the cause is still visible.
- Recomposed: title, product, then a horizontal tray row directly under it, all inside the first screen at 390 x 844
  (checked with `parity-check.mjs`); the ticket follows; a sticky bottom bar carries the total and the main action.

---

## 1. Anatomy (from the reel, generalised)

| Part | Reel (pizza) | General rule |
|---|---|---|
| Intro | closed box, "Start your order" | optional; one tap, never a blocking loader |
| Base | real pizza base in an open box | the product photographed top-down or at the angle it is used |
| Tray | 6 bowls of real ingredients | 4-8 options; each shows the real thing, name and price |
| Build | drag onto the base, layers stack | every option is a layer with its own z-order |
| Finish | "baked" state, box closes, "Good taste. Great choice." + order number | one transition that changes the whole product, then a confirmation |
| Order | card with items | the ticket mirrors exactly what is on the product, with a live total |

Good subjects: pizza, poke/salad bowl, burger, sandwich, cake decoration, gift box, flower bouquet, cocktail,
skincare set, sneaker colourway (finish swaps instead of pieces), furniture finish (threejs skill §10).

---

## 2. Real photo layers

- Source **top-down photos** (CC0/CC BY) of the base and of each part (imagery skill §2). P041's sources: a CC0
  marinara pizza shot at an angle (rectified to top-down by stretching the ellipse into a circle), a CC0 top-down
  pepperoni pizza (single slices cut out), a CC0 cherry-tomato photo on white, a CC0 basil leaf, a CC BY 3.0 mozzarella
  photo.
- Cut pieces with masks (Pillow + scipy): colour masks (red for pepperoni and tomato, near-white for mozzarella, green
  for basil), opened/closed, holes filled, the component under the centre kept, a 1.2-1.5 px feather. Distance-transform
  peaks separate touching round objects (tomatoes, mozzarella balls).
- Re-tone pieces that were lit differently (P041's basil was back-lit: mapped to a front-lit green ramp).
- Export WebP with alpha: base 1200 px (~200 KB), pieces 200-360 px (3-17 KB each). Credit every file (imagery skill §4).
- **No AI images, no code-drawn food.** If good photos do not exist, use real CC0 3D models rendered by us.

```python
def disc_sprite(im, cx, cy, r, maskfn):                 # one round piece (pepperoni) from a photo
    t = im.crop((cx - r*1.15, cy - r*1.15, cx + r*1.15, cy + r*1.15)); A = np.asarray(t).astype(float)
    yy, xx = np.mgrid[0:A.shape[0], 0:A.shape[1]]; dist = np.hypot(yy - A.shape[0]/2, xx - A.shape[1]/2)
    m = maskfn(A) & (dist < r*1.1); m = ndi.binary_fill_holes(ndi.binary_closing(m, iterations=3))
    lab, n = ndi.label(m); m = lab == lab[A.shape[0]//2, A.shape[1]//2]           # the piece under the centre
    t.putalpha(Image.fromarray((m*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.5))); return t.crop(t.getbbox())
```

---

## 3. The stage: base, layers, z-order

```html
<div class="board" id="board" role="img" aria-label="Your pizza: marinara base">
  <img class="board-wood" src="img/board.webp" alt="">
  <div class="pie" id="pie">
    <img class="pie-base" src="img/base.webp" alt="" fetchpriority="high">
    <div class="pie-layer" data-z="mozzarella"></div><div class="pie-layer" data-z="tomato"></div>
    <div class="pie-layer" data-z="pepperoni"></div><div class="pie-layer" data-z="basil"></div>
  </div>
  <span class="drop-ring" aria-hidden="true"></span>
</div>
```
- One absolutely positioned layer per option, in real-world order (cheese under tomato under pepperoni under basil),
  so a piece added later can still sit under an earlier one.
- Pieces are `<img>` with CSS variables: `left:var(--x); top:var(--y); width:var(--s); transform:translate(-50%,-50%)
  rotate(var(--r)) scale(calc(var(--f)*var(--m,1)),var(--m,1))`. `--f` flips half the pieces; `--m` is the melt/shrink
  factor the finish transition changes.
- Sizes as a share of the base diameter (P041: pepperoni 12-14%, mozzarella 9.5-12.5%, tomato 8.5-10%, basil 10-12.5%).
- `aria-label` on the stage is rewritten after every change ("Your pizza: marinara base, pepperoni x2, basil").

---

## 4. Input: drag, tap, keyboard

```js
dish.addEventListener('pointerdown', (e) => { start = { x: e.clientX, y: e.clientY }; dish.setPointerCapture(e.pointerId); });
dish.addEventListener('pointermove', (e) => {
  if (!start) return;
  if (!dragging && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) { dragging = true; ghost.classList.add('is-on'); }
  if (dragging) { ghost.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; board.classList.toggle('is-over', overPie(e.clientX, e.clientY)); }
});
dish.addEventListener('pointerup', (e) => { /* drop: add at the pointer, or fly the ghost back */ });
dish.addEventListener('click', () => { if (!dragging) addPortion(type, centreOf(dish)); });   // click, Enter, Space, tap
const overPie = (x, y) => { const r = pie.getBoundingClientRect(); return Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < r.width / 2; };
```
- A 6 px threshold separates a click from a drag. The bowl is a real `<button>`, so click, Enter and Space all add.
- Drag only on `(hover: hover) and (pointer: fine)`; touch gets tap-to-add (no `touch-action` fights with scrolling).
- Limits are visible: a counter on each bowl ("x2"), the bowl dims at the maximum, and a message explains it.

---

## 5. Placement: spaced random, per layer

```js
function placeSpots(type, count) {
  const all = Object.values(state.portions).flat(2), same = state.portions[type].flat(), spots = []; let tries = 0;
  while (spots.length < count && tries < 900) {
    tries++; const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 0.70;          // sqrt = even density over the disc
    const x = Math.cos(a) * r, y = Math.sin(a) * r, minSame = 0.21 - tries / 9000, minAny = 0.1 - tries / 18000;
    if (spots.some((s) => Math.hypot(s.x - x, s.y - y) < minSame)) continue;     // no clumps of one topping
    if (same.some((p) => Math.hypot(p.x - x, p.y - y) < minSame * 0.9)) continue;
    if (all.some((p) => Math.hypot(p.x - x, p.y - y) < minAny)) continue;          // light overlap with others is fine
    spots.push({ x, y });
  }
  return spots;
}
```
Stay inside the sauce (radius 0.70 of the base) so nothing sits on the crust. Relax the spacing as tries grow so a
third handful still finds room. A seeded random keeps a session stable.

---

## 6. The live ticket

- Lines mirror the layers ("Pepperoni x2 $6.00") with a remove button each (44 px target, `aria-label`
  "Remove one handful of Pepperoni"); remove lifts the **last** handful off with a short fade.
- Total rolls with an odometer (easeOutQuart, 600 ms; micro-interactions skill §8), tabular figures.
- The main action ("Fire it") is `aria-disabled` with a visible reason ("Add at least one topping first") instead of
  a dead grey button.
- The order form below receives the summary (hidden field + a visible line), so the order is the pizza on screen.

---

## 7. The finish transition (bake, wrap, print)

P041's bake, 2.6 s, one class on the stage:

| Element | Change |
|---|---|
| Pizza | one 360° turn on the peel (`cubic-bezier(.76,0,.24,1)`) |
| Base | raw filter (`brightness(1.1) saturate(.84) sepia(.08)`) to the photo as shot |
| Mozzarella | `--m:1.32`, slight blur, lower contrast: melted |
| Pepperoni | `--m:.94`, darker, more saturated: crisped |
| Tomato / basil | darker; basil wilts |
| Board | warm glow (`box-shadow` in the accent), then off |
| Meter | "In the oven: 0-90 s at 485°C" counted during the turn |

Then a confirmation with a ticket number and two actions ("Order this pizza", "Build another"). Under reduced
motion everything switches instantly. Other products: a gift box lid closes, a bouquet is wrapped, a cake is boxed,
a sneaker gets laced; always one change that touches the whole product.

---

## 8. Honest ordering

Concepts say so: "Concept: not sent" success state, a note under the button, fictional brand labels (Zyqor's library
kit does this). Real client sites connect the summary to the order system and keep the same states (loading,
success, error) from the micro-interactions skill.

---

## 9. Accessibility for drag interfaces

- Drag is never the only way: every option is a button (WCAG 2.2 SC 2.5.7 Dragging Movements).
- The stage's `aria-label` and the ticket (a list) describe the result; the total is in a live region.
- Focus stays on the bowl after adding; after the finish, focus moves to the confirmation's first action.
- Pieces are decorative (`alt=""`); the meaning lives in the ticket.
- Reduced motion: no flights, no turn, instant state changes.

---

## 10. QA (drag, tap, fire)

`skills_run/interact.mjs` style (Playwright): desktop drags the first bowl onto the base with `mouse.down/move/up`,
clicks the others, fires, screenshots each state; phones tap the bowls and the sticky "Fire it". Assert the piece
count per layer, the total, the fired state, the summary text, and 0 console errors. P041's run: 32 pieces after 5
handfuls, total $20.50, fired, 0 errors at 1440, 390 and 360.

---

## 11. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Options | 3-4, tap/click to add | 4-6, drag + tap, remove | 6-8, drag with snap ring, flights, limits, presets |
| Visuals | product photo + overlay pieces | cut-out real pieces, layers | art-directed photo set or real 3D, finish transition |
| Ticket | total | live lines + odometer | lines, remove, summary into the order form, confirmation number |
| Finish | none | simple state change | full transition (bake/wrap) with timing, sound optional |

---

## 12. Do and don't

| Do | Because |
|---|---|
| Use real photos (or real 3D) of the real parts | his real-assets rule |
| Give every option a button as well as drag | phones, keyboards, WCAG 2.5.7 |
| Keep a layer per option in real-world order | believable stacking |
| Mirror the product exactly in the ticket | trust |
| Make the finish touch the whole product | it reads as a moment, not a toast |

| Don't | Because |
|---|---|
| Draw food with CSS or generate it with AI | the cheap look; his rules |
| Drop pieces in clumps or on the crust | looks random, not made |
| Hide limits or disable silently | dead-button feeling |
| Use drag on touch screens | it fights scrolling |
| Copy the reference site's footage or layout pixel for pixel | credit the idea, build your own |

---

## 13. Pre-ship checklist

- [ ] Every photo/piece credited; CC BY authors visible on the page.
- [ ] Drag (desktop), click/Enter (keyboard) and tap (phone) all add; remove works.
- [ ] Pieces spaced, inside the sauce/product, in layer order; sizes look real at 1440 and 390.
- [ ] Ticket mirrors the product; total animates; main action explains when disabled.
- [ ] Finish transition, then confirmation with focus moved; reduced motion instant.
- [ ] Phone: product + tray in the first screen at 390 x 844; sticky total bar; 360 x 740 checked.
- [ ] Interaction QA script: counts, total, fired, 0 errors at 1440 / 390 / 360.

## 14. Files

| File | What |
|---|---|
| `examples/index.html` | compact builder on P041's real photo layers: drag, click, tap, remove, fire, reduced motion, self-tests |
| `../../site/library/p/P041/` | the full concept (desktop `index.html`, phone `m.html`, `app.js`, credits) |

## Sources

- Reel by @online.by.annie (Annie | Web Design Tips), Instagram, https://www.instagram.com/reel/DfGDN_fIZsC/ (inspiration only; the pizza site shown, branded "Tondo", could not be traced to its designer by search on 30 Oct 2026).
- Sujon Hoque (Zyqor Studio): WhatsApp 30 Oct 2026 10:42 AM IST (the reel; "aisa vi ek concept portfolio me add kar", "high quality", "no compromise"); real assets only; phone same quality.
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* Part E §6.3 (one tactile draggable component), §6.2 (odometer), §11 (zero dead buttons); *web-design-promo-checklist.txt* ("UX states").
- Photos: "Pizza marinara (Napoli)" by Ruthven (CC0), "Pepperoni and mushroom pizza - Massachusetts" by Daderot (CC0), "Cherry-Tomatoes-in-Pack" by Evan-Amos (CC0), "Glowing basil leaf" by Khoney21 (CC0), "Mozzarella" by Dezidor (CC BY 3.0), all Wikimedia Commons; "Kitchen Wood" by Rob Tuytel, Poly Haven (CC0).
- W3C WCAG 2.2 SC 2.5.7 Dragging Movements, 2.5.8 Target Size; MDN Pointer Events (`setPointerCapture`), Web Animations API.
