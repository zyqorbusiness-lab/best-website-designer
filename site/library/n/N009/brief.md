# N009 · Glasskit Toggles (Concept) · brief before code

Written before any code (Sujon's Master Award system, Drive points Q1/W5). Fictional brand, labelled Concept.

- Tier: normal · Category: ui-kit
- Idea (one sentence): A landing page for a liquid-glass control kit where every switch, slider and segmented control refracts a live three.js room behind it, and the controls change that room (and the glass itself) as you use them.
- Signature technique: SVG feDisplacementMap refraction through backdrop-filter (from our own skills/liquid-glass-ui kit, MIT) + a spring layer written for this page: the segmented lens and the switch thumbs move on a damped spring (ratio about 0.73, so they settle with one small overshoot) and stretch along the direction of travel in proportion to their speed, like a drop of water.
- 3D element: code-made three.js room of softly lit primitives (torus, capsule, rounded blocks, spheres) in fog, petrol and rust, fixed behind the whole page so every glass surface has real depth to bend. Lit by the shared CC0 studio HDRI plus one key light.
- Real assets + licences: no image or model files. Shared HDRI Studio Small 09 (Poly Haven, CC0). Kit: skills/liquid-glass-ui (Zyqor Studio, MIT), copied into ./kit with its LICENSE. Fonts: Cabinet Grotesk + Satoshi (ITF FFL), JetBrains Mono (OFL).
- Why code-made and not a scanned model: the catalogue row asks for primitives so the refraction has clean, high-contrast edges to bend; a detailed scan would read as noise through frost.

## Palette roles (one job per colour)
- --c1 #D8E1E4 fog: the room's air, glass tint, page canvas.
- --c2 #18333E petrol: all type, the dark objects that give refraction its contrast, the dark chapter.
- --c3 #AA4131 rust: about 1%. The accent glass button, the switch "on" track, slider fill, one rust capsule in the room, focus ring.
- Contrast: c2 on c1 is 10:1; c1 on c3 4.5:1 (checked), white on c3 6:1. Text on glass is checked against the darkest object it can sit over (tint raised until 4.5:1).

## Type
- Display: Cabinet Grotesk 800 at -0.04em. Body: Satoshi. Mono: JetBrains Mono for tags and code.

## Structure
- 09 Spatial glass: one fixed 3D room, every section floats over it as glass. Hero is 06 Live sandbox (the control centre changes the room). Sections: Controls (specimens), Anatomy (take one tile apart), Install (two tags + code), Get the kit (form), footer.

## States
- Every control: default, hover (pointer light, desktop only), press (scale .965, sheen up), focus-visible (rust ring), disabled (the form's submit button while it is busy; nothing else is ever disabled without a reason), checked/unchecked, dragging (slider thumb becomes a lens).
- Form: empty, invalid (inline message + aria-invalid), busy, success ("Concept: not sent"), reset.
- Copy button: idle, "Copied" for 1.6 s, then back; if the clipboard is blocked the code is selected and the label says "Press Ctrl+C".
- WebGL off: the room becomes a static poster (poster.webp) and every control still works on the glass. No backdrop-filter: the kit's solid fallback. Reduced transparency: opaque surfaces. Reduced motion: no drift, springs snap.

## Three hand-made signature details
1. The springs: the lens and the switch thumbs overshoot once and stretch with their speed, so a fast flick looks wetter than a slow tap.
2. The Refraction slider changes the glass you are touching: drag it and every glass control on the page bends its backdrop more or less, live.
3. Anatomy: one large glass tile with five switches that remove its five layers one by one (refraction, colour split, frost, specular edge, depth), so you can see what each layer does over the moving room.

## Phone build (m.html)
- Same app.js, same room, same kit. Refraction stays on small controls (the kit's own phone rule); large cards frost only. Menu button opens a glass bottom sheet with the four sections. Control centre stacks to one column; 48 px targets.
- Touch equivalent of every hover: press states and tap tooltips; nothing depends on hover.

## Motion
- Reveals: kit default (opacity + 20px rise, 480 ms, expo-out). Springs only on the controls, where physics is the concept. The room drifts slowly; Drift switch stops it.

## Copy rules
- No invented customers, stars, download counts or prices. The kit is free and real (MIT); the page says so and says the form sends nothing.

## QA (node tools/qa-library.mjs N009)
- 0 console errors/warnings, 0 failed requests, 0 overflow at 1440x900 / 390x844 / 360x740, reduced motion pass.
