# N006 · Quarry Type Foundry (Concept) · brief before code

Written before any code (Sujon's Master Award system, Drive points Q1/W5). Quarry is a fictional foundry; the typeface on the page
is Roboto Flex (SIL OFL 1.1, the Roboto Flex Project Authors), and the page says so. Nothing here claims Quarry drew it.

- Tier: normal · Category: abstract type · ayzz pattern G (kinetic / editorial type)
- Idea (one sentence): A magnet passes over a block of type; every letter it nears swells in weight, and a stone Q beside it is cut at the weight you pick.
- Signature technique: variable-font proximity (wght + wdth + GRAD per letter span, damped per letter) and a code-extruded 3D glyph.
- 3D element: the letter Q of Roboto Flex at opsz 144, pulled from the font file at five weights (100/300/400/700/1000) as outlines,
  extruded and bevelled in three.js, faced with a real scanned stone texture (Poly Haven "Marble Rock 02", CC0, Amal Kumar).
  Change from the catalogue row: TextGeometry needs a typeface JSON; extruding the real outlines is lighter and exact. The stone face is added so the
  3D piece is a real material, not a plastic letter (the foundry is called Quarry).

## Palette roles (one job per colour)
- --c1 #F7D6CA coral paper: the ground. All type sits on it.
- --c2 #162037 navy: every letter, hairlines, the footer band. Never pure black.
- --c3 #36865A green: about 1%. The magnet (cursor ring + its trail dot), the active axis chip, the one CTA "Pass the magnet", focus ring.
- Contrast: navy on coral ~12:1. Green never carries small text on coral (fills and large shapes only).

## Type
- Display + specimen + body: Roboto Flex (one variable file, subset to Latin, 4 live axes: wght 100-1000, wdth 25-151, GRAD -200-150, opsz 8-144).
- Mono tags and axis readouts: JetBrains Mono. Two families total.
- Display tracking -0.04em at opsz 144; body at opsz 14, 62ch.

## Structure
- 10 Kinetic typography manifesto, held in a 07 split-screen sticky layout on desktop: the type field and the weight ledger scroll on the left,
  the stone Q stays pinned on the right. Phone: the field first, then the Q pinned at the top of the ledger while the rows pass under it.
- Never hero + 3 cards + about + contact.

## Spacing + states
- Kit scale only (8/12/16/24/32/48/64; section rhythm clamp(6rem,12vw,11rem)).
- States: rest (all letters Thin 150), magnet near (swell), magnet leaving (each letter eases back on its own clock), sweeping (button busy),
  row hover/focus/pressed/selected, Q recasting, loading (poster), WebGL off (poster + full type still works), reduced motion.

## Three hand-made signature details
1. Weight is paid for in width: in Weight mode a letter that swells from 150 to 850 also narrows from wdth 100 to 35, so the line keeps its length
   (measured from the font's own advances: 1.05x at full pull) and the words do not shove each other around.
2. Each letter has its own damping clock, so when the magnet leaves, the letters relax in a ripple, not all at once. The readout names the letter under the
   magnet and its live axis values.
3. Recasting the Q: pick a weight in the ledger and the stone Q sinks to a sliver and is cut again at the new weight from the real outlines; the bevel and the
   stone grain catch the light as it rises. On desktop it leans toward your cursor like it feels the magnet.

## Touch + keyboard equivalents
- Hover magnet -> on phone, touch and drag sideways across the field (vertical drags still scroll), or tap a letter to drop the magnet there;
  "Pass the magnet" sweeps it across every line for you (and runs once when the field first appears, unless reduced motion is on).
- Axis chips (Weight / Width / Grade) are a radio group: tap, click or arrow keys.
- Ledger rows are buttons: tap/Enter recasts the Q. The Q itself: drag or swipe to turn it, arrow keys when focused.

## Phone build (m.html)
- Same font file, same stone textures, same HDRI, same app.js (isM). Layout re-composed for a 390px thumb: 48px targets, field type sized so each line fits,
  the gesture shown on screen.

## Motion
- Reveals: kit default (opacity + 20px rise, 480 ms, expo-out, no bounce, no blur).
- Letter response: critically damped toward its target (no overshoot). Recast: 520 ms expo-out. Reduced motion: letters jump to their values (they only
  change when you move them), no auto sweep, the Q recasts instantly and never leans.

## QA (node tools/qa-library.mjs N006)
- 0 console errors/warnings, 0 failed requests, 0 overflow at 1440x900 / 390x844 / 360x740, reduced motion pass. Weight <= 1.5 MB excluding the shared HDRI.
