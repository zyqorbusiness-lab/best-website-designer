# N005 · Fieldnote Optics (Concept) · brief before code

Written before any code (Sujon's Master Award system, Drive points Q1/W5).

- Tier: normal · Category: nature · Pattern I (micro-interactions and UI patterns)
- Oct 31 refresh: photo is now "Foggy Sunrise over Seedskadee National Wildlife Refuge" (USFWS Mountain-Prairie, public domain, Wikimedia Commons), valley.webp; notes re-placed on it.
- Idea (one sentence): the whole hero is a misty pine forest you can only see properly through a pair of binoculars; the twin-circle lens follows your pointer (or your thumb), clears the mist, magnifies, and finds the pencilled field notes hidden in the photo.
- Signature technique: CSS mask-image with two radial gradients that follow the pointer (damped), a magnified + sharp copy of the photo inside the mask, a focus wheel that blurs/sharpens only what is inside the lens; plus one real CC0 model (the binoculars) that turns to aim where you are looking.
- 3D element: real model, Poly Haven "Binoculars" by Derek Wight (CC0), optimised once with skills/model-optimisation-phone (547 KB, all 19,248 triangles kept) into _assets/models/binoculars.glb. Same file on phone and desktop.
- Photo: changed from the catalogue's "Unsplash misty valley, to be picked" to a CC0 source: Poly Haven HDRI "Misty Pines" by Greg Zaal (photographed in Mpumalanga, South Africa), its tonemapped JPG reprojected by me into an ordinary 88 degree rectilinear view (pines.webp, 2048x1280, 250 KB). Reason: CC0 needs no licence caveats and the mist is real, not a filter. "Valley" became "pine forest" because that is what the real photo shows.

## Palette roles (one job per colour)
- --c1 #F7F3E8 paper (Oct 31 refresh; was #E4EAC9): the mist wash over the photo outside the lens, the paper sections, text on the dark chapter.
- --c2 #2F4B3A moss (Oct 31 refresh; was #1C2120 charcoal): type, the lens ring and reticle hairlines, the dark "how it works" chapter. Never pure black.
- --c3 #F4A259 sunrise (Oct 31 refresh; was #D7597E rose): about 1%. Meadow #A8C686 as a tint on row hover. The reticle centre dot, the pencil circle around a note once found, the notes-found counter, focus ring.

## Type
- Display: Archivo 800 ("Fieldnote") + Instrument Serif italic ("Optics"), -0.04em (Google/OFL; was Cabinet Grotesk).
- Field notes in the photo: Instrument Serif italic (a pencil hand, not a font pretending to be handwriting).
- Body Inter Tight, 62ch (was Satoshi). Mono tags JetBrains Mono uppercase.

## Structure
- 06 Live sandbox hero (the whole first screen is the instrument) followed by 02 Swiss exposed-hairline grid for the "how it works" ledger on a dark charcoal chapter. Not hero + 3 cards.

## States
- default: lens parked over the big trunk, drifting slightly (off with reduced motion); hover/pointer: lens follows with damping (k=10); touch: drag the lens itself (it has its own touch target, the rest of the hero still scrolls); keyboard: arrow keys move the lens when the viewer is focused, + / - change magnification.
- focus wheel: drag sideways or arrow keys; at the right setting the inside of the lens is sharp, away from it the lens blurs (that is the point of a focus wheel).
- note found: when the lens centre passes within reach of a note, its pencil circle draws in rose and the counter ticks (0 of 4 -> 4 of 4). Found notes stay found.
- loading: poster for the 3D card; the photo itself is a plain img so the hero is never empty. WebGL off: the binocular card shows poster.webp, the lens still works (it is CSS).
- reduced motion: no drift, the lens jumps to the pointer instead of easing, no pencil draw animation (circles just appear).

## Three hand-made signature details
1. Real magnification: the photo inside the lens is the same file scaled 6x/8x/10x around the lens centre (segmented control), so 10x shows bark the misty view hides; the lens radius shrinks as magnification rises, like real field of view.
2. The binoculars (real model) aim at your lens: yaw and pitch follow the lens position with damping, so the object in the corner is literally looking where you look.
3. Four pencilled field notes written for this exact photo (the near trunk's bark, the fog line, the light direction, the gaps in the canopy) only exist inside the lens; finding them draws a rose pencil circle and ticks the counter.

## Phone build (m.html)
- Same photo, same GLB, same HDRI. Hero is a tall viewer (78svh) with the lens centred; drag the lens with a thumb (touch-action none only on the lens), a visible "Drag the lens" chip; the focus wheel and magnification sit under the viewer in thumb reach (48px targets). The binocular card sits in the ledger below rather than on top of the photo.

## Motion
- Reveals: opacity + 20px rise, 480 ms, expo-out (kit). Lens follow: exponential damping, no overshoot. Pencil circle: stroke draw 520 ms expo-out. Nothing bounces.

## Copy rules
- No invented specs, prices, reviews or clients. The ledger states only true numbers: the model's source and triangle count, the photo's source and place, the live magnification, focus and notes found.

## QA
- node tools/qa-library.mjs N005: 0 errors/warnings, 0 failed requests, 0 overflow at 1440x900 / 390x844 / 360x740, reduced motion pass.
