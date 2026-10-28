# N010 · Rootline Citrus (Concept) · brief before code

Fictional brand. A small grove-direct citrus shipper ("from the root line to your door") that sells three fruits by the crate.

- Tier: normal · Category: food · Pattern A: product-colourway morph (the background follows the product)
- Idea (one sentence): Pick lemon, lime or mandarin; the real fruit rolls off, the next one rolls on, and the page floods with that fruit's paper colour from the exact spot where the fruit sits.
- Signature technique: three real fruit models (one at a time on the stage), a rolling swap with physically matched spin, a circular colour flood (clip-path from the fruit's projected screen position) and a drag-to-turn with inertia.
- 3D element (real models, no code-made hero):
  - Lemon, Kuutti Siitonen, Poly Haven, CC0 1.0
  - Food Lime 01, Oliver Harries, Poly Haven, CC0 1.0
  - Mandarin (photogrammetry scan), yaro.pro, Sketchfab, CC BY 4.0, visible attribution in the footer and the Credits sheet (changed on review from the row's Khronos 'MandarinOrange': it needs KHR_materials_diffuse_transmission, which three.js r170 does not render, and read as a dull red shell; a CC0 satsuma scan was tried next but its atlas seams broke when reduced to a web budget)
  - HDRI Studio Small 09, Sergej Majboroda, Poly Haven, CC0 1.0 (shared kit lighting)
- Searched: Poly Haven (lemon, food_lime_01; no mandarin or orange), Khronos sample assets (MandarinOrange, tried and dropped), Sketchfab CC0/CC-BY ("mandarin", "tangerine", "clementine", "satsuma", "orange", "citrus": candidates were the ffish.asia CC0 satsuma scans, yaro.pro "Mandarin" CC-BY, "Chinese Honey Mandarin (Scaniverse)" CC-BY). Picked yaro.pro's CC-BY 'Mandarin': a clean 25k-triangle photogrammetry scan with real normal and roughness maps, whole fruit with its stem, no logo (the honey-mandarin scan carries a sticker). All three fruit are real scans.

## Palette roles (one job per colour)
- --c1 #E2E8C5 light (matcha paper): canvas. Pattern A: c1 is ONE role with three fruit states, so the page always shows exactly three colours:
  lime #E2E8C5 (the row colour, default) · lemon #EEE7B4 (lemon-pith paper) · mandarin #F0DCC2 (mandarin-pith paper).
  All are warm papers, never white; c2 on each is over 12:1.
- --c2 #1E2522 dark (charcoal green): type, the dark reserve chapter, the footer. Never black.
- --c3 #2E74D9 accent (cool blue, the contrast against warm fruit): about 1%: the primary button (deepened to color-mix 78% c3 / 22% c2 so paper text on it is >= 4.5:1), the focus ring, the active switcher dot, one rule line.

## Type
- Display: Cabinet Grotesk 800, -0.04em. The fruit name sits next to it in Instrument Serif italic and swaps with the fruit.
- Body: Satoshi, 62ch max. Mono tags: JetBrains Mono uppercase +0.06em. Two families plus mono.

## Structure (14 structures)
- 06 Live sandbox hero (the fruit is the toy) + 02 Swiss exposed-hairline grid below it (spec strip, process columns, crate ledger). Not hero + 3 cards.
- Sections: header nav (Fruit, Root to crate, Crates, Reserve) · hero with stage + switcher + spec strip · #fruit cross-section + notes (changes with the fruit) · #process four hairline columns · #crates a ledger table (not cards) · #reserve dark form · kit footer.

## Spacing + states
- Kit scale only (8/12/16/24/32/48/64/96, section rhythm var(--section-y)).
- States: switcher hover/press/focus/checked; buttons hover/press/focus/disabled/loading(aria-busy)/success; inputs focus/invalid with message; poster while the first fruit loads with real progress; WebGL off: poster + switcher still works (copy + colour flood); reduced motion: no roll, no flood wipe (instant colour change, cross-fade only), no auto-turn.

## Three hand-made signature details
1. The roll is physics, not a tween: the outgoing fruit rolls out with rotation = distance / radius, so the peel texture never slides; the incoming fruit rolls in the same way and settles with expo-out.
2. The colour flood starts at the fruit: the new paper colour opens as a circle from the fruit's projected screen point and grows to cover the page, then the --c1 token is committed so every tint, hairline and tag follows.
3. A hairline cross-section of the fruit (SVG drawn in code) re-draws its segments for the chosen fruit (lemon 9, lime 10, mandarin 11, typical counts), with the pith ring and seeds (lemon only; lime and satsuma are usually seedless), and morphs the segment count on switch.

## Phone build (m.html)
- Same three GLB files, same HDRI, same roll, same flood, same cross-section, same sections and form. Only layout, type size and the gesture hint change.
- Touch equivalent of every hover: swipe sideways on the fruit turns it (same inertia); the switcher is three 48px tap targets; keyboard 1/2/3 and arrow keys on desktop; tap a crate row's Choose button.
- Lazy: poster first, the stage starts near the viewport, the first fruit loads with a real % readout, the other two load on idle (or on first tap).

## Motion
- Reveals: opacity + 20px rise, 480 ms, expo-out, no bounce, no blur (kit default).
- Roll: 900 ms in-out. Flood: 700 ms expo-out. Each says what changed: the product changed.

## Production level
- Working nav with anchors + phone menu, hero with the 3D heart, 4 content sections, kit footer.
- Reserve form: labels, inline validation, focus states, loading, honest success "Concept: not sent. Nothing left this page." Never posts anywhere.
- Prices on the crate ledger are concept prices (labelled), no clients, no reviews, no invented stats.

## QA (node tools/qa-library.mjs N010)
- 0 console errors/warnings, 0 failed requests, 0 overflow at 1440x900 / 390x844 / 360x740, reduced motion pass, same GLBs on phone.
