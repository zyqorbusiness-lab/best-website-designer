# N008 · Northpine Cabins (Concept) · brief before code

Written before any code (Sujon's Master Award system, Drive points Q1/W5). Fictional brand, labelled Concept.

- Tier: normal · Category: travel
- Idea (one sentence): One cabin, two seasons. Drag the divider across a small 3D clearing and the same cabin goes from deep winter (left) to high summer (right).
- Signature technique: a before/after divider (clip-path on the page layers + an eased handle) that also splits a single three.js scene: the scene is rendered twice per frame with scissor, winter on the left of the divider, summer on the right. Snow is a shader on every material (it settles on faces that point up), so the snow line follows the divider on the cabin, the trees, the rocks and the scanned props at once.
- 3D element: code-made cabin (gabled roof, chimney, porch, windows) and code-made faceted pines, dressed with real CC0 Poly Haven textures and real CC0 scanned props.
- Real assets + licences (all CC0 1.0, Poly Haven): textures "Dark Planks" and "Snow 02" (Rob Tuytel), "Grey Roof 01" (Rob Tuytel); models "Stone Fire Pit" (Sebastian Platen), "Tree Stump 01" (Rob Tuytel), "Wooden Axe" (Ulan Cabanilla). Shared studio HDRI. Optimised once with gltf-transform (meshopt + WebP 256-512 px) into _assets/; desktop and phone load the same files.
- Change from the catalogue row (on review): the row asked for an Unsplash winter/summer photo pair "to be picked". No free photo pair shows the same cabin in both seasons, and two different cabins inside one slider would be a lie, so the 3D clearing is the before/after itself. No photos on the page.

## Palette roles (one job per colour)
- --c1 #F4F6F7 snow paper (Oct 31; was peach #FCE1D1): the summer half of the stage, the page canvas, light type on the winter half.
- --c2 #20412F pine (Oct 31; was #193829): all type on paper, the winter half of the stage (a coloured dark, never black), the cabin's painted planks (tinted).
- --c3 #D9733B ember (Oct 31; was #C96926), plus --c4 #8A5A3B timber for small accents: about 1%. The cabin door, the window glow at night in winter, the divider grip's centre dot, the one CTA, focus ring.
- Contrast: c2 on c1 is about 11:1; c1 on c2 the same. c3 never carries body text.

## Type
- Display: Fraunces (serif, 700) at -0.04em, for "Northpine" and the season words. Body: Inter Tight (both OFL, self-hosted; Oct 31 swap from the earlier non-OFL pair). Mono tags: JetBrains Mono (kit).

## Structure
- 06 Live sandbox hero (the divider is the page) followed by a short 02 Swiss exposed-hairline grid: a two-column ledger "what changes / what stays", with a hairline down the middle that is the same divider line.
- Not hero + 3 cards + about + contact.

## States
- Default: divider at 50%, a slow 6% nudge left and right once after load to show it moves (skipped with reduced motion).
- Hover (desktop): the grip grows a hairline ring. Press/drag (all): grip scales to .94, the handle follows the pointer with an eased lag (damped, about 120 ms).
- Keyboard: the grip is a role=slider; Left/Right move 5%, Home/End jump to full winter/full summer, PageUp/PageDown 25%.
- Buttons "Deep winter", "Both", "High summer" (a segmented control) animate the divider to 100 / 50 / 0 with expo-out.
- Loading: the kit veil + poster. WebGL off: poster.webp and the full page still works (the divider still clips the page layers).
- Reduced motion: no snowfall, no smoke, no intro nudge; the divider jumps.

## Three hand-made signature details
1. The snow is not a texture swap: a shader lays snow on every upward-facing surface, so the line between seasons cuts cleanly through the roof, a pine, the axe in the stump, all on one vertical line.
2. The headline "Northpine" is set twice: bottle green on peach and peach on bottle green, clipped by the same divider, so the letters change colour exactly where the season does.
3. Winter has a life of its own: the windows glow burnt orange, chimney smoke drifts, a few flakes fall, and the pond on the right is open water in summer but white ice under the divider in winter.

## Phone build (m.html)
- Same app.js, same models, textures and HDRI. Stage first, full width, square-ish; the divider is dragged with a thumb (48 px grip, touch-action: pan-y so vertical swipes still scroll). Season buttons are a full-width segmented control under the stage. Ledger stacks.
- Touch equivalent of every hover: the grip ring shows while pressed; the season buttons do everything the drag does.

## Motion
- Reveals: kit default (opacity + 20px rise, 480 ms, expo-out). Divider: damped follow; preset jumps 700 ms in-out-quart. Nothing bounces.

## Copy rules
- No invented reviews, prices or numbers. It says it is a concept and there is nothing to book.

## QA (node tools/qa-library.mjs N008)
- 0 console errors/warnings, 0 failed requests, 0 overflow at 1440x900 / 390x844 / 360x740, reduced motion pass.


## nb1b fix (2026-10-29)
- The code-made cabin and faceted pines are replaced by real models: "Wooden Cabin" by donnichols (uid c90674a377864ac1b8fd141ad1917ee3) and "Pine Tree" by evolveduk (uid d45218a3fab349e5b1de040f29e7b6f9), both Sketchfab, CC BY 4.0. The snow shader runs on both, so the winter/summer split line still cuts through roof and needles. Dark Planks / Grey Roof textures are no longer loaded. Attribution visible on both pages and in the credits sheet.
