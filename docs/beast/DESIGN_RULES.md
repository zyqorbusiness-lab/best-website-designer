# Design rules of the Zyqor Library

These are the rules every concept in [`site/library/`](../../site/library/) and every skill in [`skills/`](../../skills/) follows. They come from three places:

- **Sujon's own instructions** while building portfolio v3 and this library.
- **His premium-design system**, the "Master Award Web Design System" and the website-building guide in his design library. The points below are adapted to his later rules; where the original guide conflicted with them (near-black backgrounds, neon accents, invented metrics), his later rules win.
- **The scroll-world skill** (oso95/scroll-world, MIT): the scrub engine, its encode and phone rules, and its QA. Its AI-generation step is replaced with real footage or our own renders of real CC0/CC-BY models.

Precedence when two rules disagree: the latest instruction, then a named style, then the 30-item avoid list, then the Master Award defaults.

## The rules

**Quality and process**
1. **Quality over speed, permanently.** Quality means a professional, polished job, not resolution. No time pressure: every piece is iterated for at least an hour.
2. **One builder per item, plus a separate reviewer.** The builder is never its own only reviewer.
3. **Self-check, self-fix, review again and again.**  Each batch passes the QA harness before it is reported.

**Originality**
4. **Every concept is genuinely distinct.** No repeated design. The quality bar is the ayzz/award level; patterns are inspired, never copied.
5. **Every concept carries a 3D element.** PREMIUM = detailed real models with PBR, HDRI, contact shadows and ACES, and close-ups that hold up; this is the round-2 v3 bar.

**Assets and honesty**
6. **Real premium assets.** Use verified CC0/CC-BY models, scans and footage, each credited. Code-made geometry only when no real asset exists or code is genuinely better, and the concept must say which. No AI-generated visuals. Nothing that "feels AI".
7. **No emoji anywhere on the pages.** Use SVG icons.
8. **Fictional brands labelled "Concept".** No fake clients, reviews or results; no real logos.
9. **Credits for every asset**, per concept and in `CREDITS.md`, with the exact licence. BY-SA is flagged.

**Design**
10. **Colour and type.** Exactly 3 premium colours per concept. No black backgrounds and no purple/AI gradients. Premium self-hosted fonts.
11. **Award-level interaction.** At least one signature micro-interaction plus click and hover feedback per concept.
12. **Premium liquid glass** on the library chrome and in every PREMIUM concept, using the shared glass kit.

**Build and performance**
13. **Scroll-driven, scroll-world style.** Use the shared scroll kit; scroll-video concepts get Play-tour and Skip buttons.
14. **Lazy-load reveal effects everywhere.** 3D starts when it enters the viewport and pauses off-screen.
15. **Separate desktop (`index.html`) and phone (`m.html`) builds**, both loading the SAME models, textures and lighting. The only saving is compression (meshopt/draco, KTX2/WebP, progressive loading), and it must show no visible loss. A side-by-side plus close-up crop is the proof.
16. **Optimise every build.** The first screen is fast; there is a weight budget per tier.
17. **QA gate.**
    - 0 console errors at 1440×900, 390×844 and 360×740;
    - no horizontal overflow;
    - `prefers-reduced-motion` respected;
    - external links open in a new tab;
    - contact = Gmail compose on desktop / mailto on phone, plus WhatsApp +91 95479 08593.

## The 25 most useful points from the premium-design system

1. **His own motion taste: fast, smooth reveals, no bounce, no blur** (opacity + 16-24px rise, 400-520ms, expo-out). He chose this himself after comparing previews on 16 Oct.
2. **Precedence plus the avoid list as a hard gate**: latest instruction > named style > the 30 items > Master Award defaults; a style he names (glass, hover effects) overrides the list.
3. **Every colour has one job; the accent is about 1%** (CTA, active state, selection). This maps directly onto his 3-colour rule.
4. **Real proof or nothing**: no testimonials, ratings, client logos or award ledgers on concept pages. The product itself is the proof.
5. **Never the generic hero-3-cards-about-contact wireframe**: each concept is built on one of the 14 named structures.
6. **Write the brief before code**, including palette roles, fonts, spacing, states and **three hand-made signature details**.
7. **The five-chapter product scroll**: silhouette, orbit + material macro, exploded view with leader lines, finish studio, spec sheet. This is the PREMIUM backbone.
8. **Fluid clamp() type scale** with -0.04em display tracking, 62ch body, mono index tags.
9. **Spatial tokens and one spacing scale**: 1440 container, 12 columns / 24px gaps, section rhythm clamp(6rem, 12vw, 11rem), 8/12/16/24/32/48/64.
10. **Purpose-first motion**: every animation says what changed, where it came from, what to notice, what completed; otherwise remove it.
11. **Centralised motion tokens and three easing curves** (expo-out, in-out-quart, small spring).
12. **Hairline borders + top specular edge instead of drop shadows; 2.8% film grain** against banding.
13. **Warm paper canvases (#F5F2EB family) instead of pure white; coloured darks instead of black.**
14. **The phone is not a shrunken desktop**: re-check nav, type, crop, stacking, CTA, touch targets and section order at 390 and 360.
15. **Nothing works only on hover**: every hover effect gets a tap/press equivalent; cursors and magnetism on pointer-fine only.
16. **Restrained press feedback**: compress → state → brief confirmation → back; no confetti, no lingering "Copied!".
17. **Transform and opacity only; DPR cap 2; pause what is off-screen**; build for low-end Android.
18. **Never a blank canvas**: poster still and full content when WebGL fails or motion is reduced.
19. **One lighting logic per piece plus contact shadows and real compositing**, so models never look pasted on.
20. **Contrast 4.5:1, visible focus, alt text, and a reduced-motion path that still makes sense.**
21. **Design every state**: loading (real progress), empty, error, success, disabled, offline, first use.
22. **Concrete copy**: no "unlock the power of", no em dashes, no "it's not X, it's Y"; sensory material detail instead of invented metrics.
23. **The premium-details pass**: baseline alignment, consistent borders and corners, image cropping, optical spacing, button proportions, icon sizing, text wrapping, section rhythm.
24. **Pass/fail QA with evidence**: no FAIL ships; every report ends with a VERDICT and names what was not verified (real phone, real-device frame rate).
25. **Licence first, free only, credit everything**; if a licence is unclear, write the pattern yourself.
