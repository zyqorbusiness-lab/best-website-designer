# N007 · Brasswick Diya (Concept) · brief before code

Written before code (Sujon's Master Award system, Drive points Q1/W5; production-level rule from his 9:12 AM voice note, via the coordinator).
Brasswick is a fictional lantern maker. The lantern is a real scanned-and-modelled asset: Poly Haven "Brass Diya Lantern" by Bhargav Kubal (CC0):
hexagonal brass body with aged patina, six glass panes, star-shaped vents, a chain, and an oil bowl with a flame.

- Tier: normal · Category: home goods · ayzz pattern H (environment storytelling: product in a world)
- Idea (one sentence): A hanging brass diya you light with a hover or a tap; the flame flickers, and the page goes from day linen to an olive evening lit by it.
- Signature technique: one CC0 model, emissive ramp + layered flicker noise on the flame, a warm point light inside the glass, and a page theme that warms with it.
- 3D element: real model, Poly Haven "Brass Diya Lantern" (CC0), 2K textures, meshopt + WebP (642 KB), the same file on phone and desktop.
- HDRI: the kit's shared Studio Small 09 (CC0). The catalogue row named Studio Small 03; swapped to the shared one so the page carries no second HDRI.

## Palette roles (one job per colour)
- --c1 #EBE9DD linen: the daytime ground and, in the evening, all text.
- --c2 #303419 olive: daytime text; in the evening the hero becomes this colour (the room at dusk). Never pure black.
- --c3 #EF663A ember: about 1%. The flame-state dot, the glow behind the lantern when lit, the one CTA fill (darkened to 40% olive for 4.5:1 with linen text), focus ring.
- Contrast: olive on linen 10.6:1, linen on olive 10.6:1. Raw ember on linen is 2.6:1, so ember never carries text.

## Type
- Display: Zodiak (Fontshare, ITF Free Font License), a warm serif with a crafted feel, 400 to 800 with tight tracking. Body: Satoshi (same licence).
- Mono tags: JetBrains Mono (the kit's index face).

## Structure
- 04 Editorial maison, calm: a header nav, a hero where the lantern hangs into the page from the top edge, then three quiet chapters
  (Craft, Care, Reserve) as hairline ledger rows and a spec list, and a footer. Never hero + 3 cards + about + contact.
- Sections: #lantern (hero), #craft (how it is made: three numbered rows), #care (how to light and look after it, plus the spec list),
  #reserve (reservation form with finish choice that changes the 3D brass), footer.

## Spacing + states
- Kit scale only. States: unlit (day), lighting (flame grows over 900 ms, theme warms), lit (evening, flicker), hover-lit (desktop: lit while the pointer is on the lantern),
  swinging, finish change, form idle / invalid / loading / "Concept, not sent" success, WebGL off (poster + the button still switches the page to evening), reduced motion.

## Three hand-made signature details
1. The flame is not a loop: three layered noise speeds drive its height, its sway and the inner light, and the light's intensity follows the flame's size,
   so the brass highlights breathe with it.
2. Push the lantern (drag or swipe sideways, arrow keys) and it swings on its chain as a damped pendulum; the flame leans against the swing and rights itself.
3. The page is lit by it: in the evening a soft ember glow sits behind the lantern and follows the lantern's real screen position as it swings.

## Touch + keyboard equivalents
- Hover lights it on desktop, but the "Light the diya" button (aria-pressed) and a tap on the lantern toggle it on every device; Enter/Space on the focused canvas too.
- Swing: drag or swipe sideways on the stage; arrow keys on the focused canvas.
- Finish (Aged / Polished) is a radio group in the form; it changes the brass on the 3D model.

## Phone build (m.html)
- Same model, HDRI and app.js (isM). Header with a menu sheet; the stage is tall in the hero so the lantern reads at 390px; 48px targets.

## Motion
- Reveals: kit default (opacity + 20px rise, 480 ms, expo-out, no bounce, no blur). Theme change 900 ms in-out. Pendulum is physics (no tween).
- Reduced motion: no flicker (steady flame), no auto sway, theme switches without the long fade.

## QA (node tools/qa-library.mjs N007)
- 0 console errors/warnings, 0 failed requests, 0 overflow at 1440x900 / 390x844 / 360x740, reduced motion pass. Weight <= 1.5 MB excluding the shared HDRI.
