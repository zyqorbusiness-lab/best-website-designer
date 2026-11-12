# N004 · Morrow Light (Concept) · brief before code

Written before any code (Sujon's Master Award system, Drive points Q1/W5). Extended at 03:49Z to a production-level landing page (coordinator steer: nav, hero with the 3D heart, 3-5 real sections, a working form with an honest "not sent" success, footer).

- Tier: normal · Category: home goods · Pattern I (micro-interactions and UI patterns)
- Idea: a sunrise alarm lamp. One switch sweeps the whole first screen from night to dawn: the sky interpolates through blue hour to warm paper, the stars go out one by one, an SVG sun climbs its motion path over the headline and the 3D lamp orb warms up with it. A scrubber lets you stand at any minute of the 30-minute sunrise.
- Signature technique: a registered custom property (@property --dawn, <number>) that CSS transitions; every colour on the page is a color-mix() of the three palette colours keyed off --dawn; the sun rides an SVG path (getPointAtLength), and the three.js lamp reads the same --dawn every frame.
- 3D element: code-made three.js lamp: a turned walnut base (LatheGeometry wrapped in the real Poly Haven "Walnut Veneer" scan, CC0), a frosted transmission-glass orb, an emissive core + point light whose colour follows a 1800 K to 3200 K ramp. Same files on phone and desktop.

## Palette roles
- --c1 #F2E5D7 paper: the day sky, the canvas of every content section, type on the night sky.
- --c2 #23305C night indigo (was #37221B cocoa until Oct 31): the night sky (lifting to apricot at dawn), type on paper, the dark spec chapter and footer.
- --c3 #2E63D8 blue: about 1%. Only the blue hour tint in the sky, the switch track when on, the focus ring, the primary button (deepened to 86% with cocoa so paper text reaches 5:1).

## Type
- Display Instrument Sans 700 ("Morrow") + Instrument Serif italic ("Light"). Body Instrument Sans. Readouts JetBrains Mono. (Oct 31 refresh: Google/OFL only; palette night indigo #23305C, dawn apricot #FFB677 -> cream #FFF4E6, accent #C8551F.)

## Structure
- 06 Live sandbox hero (the whole screen is the lamp's sunrise) then 07 split-screen sticky narrative for the ramp, 02 exposed hairline grid for materials + spec, 13 conversion section (one form, no tier cards).
- Sections: Dawn (hero) / The thirty minutes (ramp, click a minute and the whole page follows) / Materials / Details (concept spec) / Reserve (form) / footer.

## States
- switch: off (night) / on (dawn), keyboard Space/Enter, aria-checked; the scrubber is a native range input (keyboard + touch for free), dragging it pauses the CSS transition.
- alarm time stepper: minus/plus in 15 min steps, disabled at 04:30 and 09:00.
- 3D: drag to turn the walnut base, tap the lamp to toggle; poster if WebGL fails; reduced motion: --dawn jumps (no 2.4 s sweep), stars do not twinkle, sun jumps.
- form: empty, invalid (message under the field), loading (spinner), success (honest: "Concept, not sent"), reset.

## Three hand-made signature details
1. The stars go out in their own order as the sky lightens (each has its own threshold on --dawn), the way the faint ones vanish first.
2. The sun's motion path is drawn on the page as a faint dotted arc, so you can see where it will rise before you flip the switch.
3. The lamp colour is a real colour-temperature ramp (1800 K ember to 3200 K warm white) computed per frame, shown live in the readout and as the swatch in the ramp section.

## Phone build
- Same lamp code, same walnut texture, same HDRI. Stacked: headline, lamp, switch + scrubber in thumb reach (48px), readout. The ramp becomes a vertical list. Menu sheet for the nav.

## Copy rules
- Fictional brand, labelled Concept. No price, no reviews, no customers. The spec is marked "concept spec".


## nb1b fix (2026-10-29)
- The orb's night/off state no longer reads as grey clay: opal-white shell colour, transmission 0.86 when off (was 0.55), lower roughness with a clear coat and a soft sheen, a faint ember core and inner glow even when off, a cool rim light from behind, and more HDRI environment light at night. Poster and thumbnail re-shot.
- The lamp stays code-made (walnut base wrapped in the real Poly Haven Walnut Veneer scan): the audit's Sketchfab search (CC0 + CC-BY) found no usable sunrise orb lamp; the only 'Sunrise Lampe' hit (uid f2608dbefa6249c5bc6c29dcfa7cedb4) is a ceiling bar light.
