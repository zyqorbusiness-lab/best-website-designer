# Zyqor Components

14 detailed, reusable UI components, each with a live demo page that works the same on desktop and phone, plain HTML/CSS/JS (no framework, no build step), keyboard and touch support, `prefers-reduced-motion` handling and credits.

**Live gallery:** https://zyqor-concepts.sites.tab.bot/components/

They were made after a study of current award-level sites (Awwwards Sites of the Year and Sites of the Day, CSS Design Awards) and of Sujon's own design guide; the study is in [`docs/how-top-designers-build-unique-sites.md`](../../docs/how-top-designers-build-unique-sites.md). Every component is written from scratch: techniques are learned, no code or assets are copied.

| # | Component | What it does | Studied from |
|---|---|---|---|
| 01 | [Scroll-scrubbed 3D stage](scroll-3d-stage/) | Real CC0 scan + HDRI; camera and model move through chapter keyframes with scroll; lazy, poster fallback. | Opal Tadpole (SOTY 2024), landonorris.com (SOTY 2025) |
| 02 | [Magnetic button](magnetic-button/) | Leans toward the pointer, fills from the entry point, rolls its label; tap ripple on phones. | Drive spec MA 6.1; Lusion, landonorris.com |
| 03 | [Split text reveal](split-text/) | Line-mask rise, letter flip and scroll-scrub reading highlight; re-measures lines, screen-reader safe. | FORMAT (Obys), Emotion Agency |
| 04 | [Liquid glass card](liquid-glass-card/) | Edge refraction via SVG displacement (Chromium), blur fallback, specular highlight, tilt, draggable. | Apple Liquid Glass (2025); his Oct 27 ask |
| 05 | [Sticky storytelling](sticky-story/) | Pinned media with chapter wipes, progress line, numbered rail; same on phone. | Igloo Inc (SOTY 2024), Persepolis Reimagined |
| 06 | [Marquee](marquee/) | Seamless loop, speeds up with scroll velocity, flips with scroll direction, drag with inertia. | landonorris.com, Don't Board Me |
| 07 | [Cursor follower](cursor-follower/) | Dot + lagging ring, label over work, sticky ring on links, hides over inputs, off on touch. | Drive spec MA 6.4; A24 (Ravi Klaassens), Lusion |
| 08 | [Image trail and hover reveal](image-trail/) | Pointer image trail and a hover-reveal project list that turns into a tap accordion on phones. | Brandon Yasin, G. Colombel (SOTD Oct 2026) |
| 09 | [Preloader](preloader/) | Counts real bytes of the model/HDRI/images, never flashes on cached loads, panel-wipe exit. | Lusion, Igloo Inc; Drive rule: real progress only |
| 10 | [Page transition](page-transition/) | Circle reveal from the click point between pages (native View Transitions + fallback) and for a theme switch. | Drive spec MA 6.2; A24 (Barba), Belgrade Arbor |
| 11 | [Pricing switcher](pricing-table/) | Zyqor's real $300 / $1k / $10k tiers: squish pill, odometer price, ARIA tabs. | Drive spec MA 6.2 items 1 and 4; his Oct 28 prices |
| 12 | [Quote carousel](quote-carousel/) | Native scroll-snap swipe, mouse drag with inertia, accessible autoplay with Pause; real quotes, no fake reviews. | WAI-ARIA carousel pattern; his no-fake-testimonials rule |
| 13 | [Mega menu](mega-menu/) | Desktop mega panels with hover intent + keyboard; phone full-screen accordion sheet with focus trap. | ESR Bespoke (SOTD Oct 23 2026), Star Atlas |
| 14 | [Footer with wordmark](footer-wordmark/) | Giant per-letter rising wordmark, Gmail-on-desktop / mailto-on-phone, copy email, local time, legal links. | Emotion Agency, Mana Yerba Mate; ayzz pattern G |

## Rules every component follows

- Same quality on a phone as on a laptop: one responsive page, nothing removed on small screens; hover-only effects get a touch equivalent (tap ripple, tap accordion, swipe).
- Keyboard: every control is a real button or link with a visible focus state; Esc closes what opens.
- `prefers-reduced-motion`: no movement that is not needed; the content is all there without it.
- Colour: three colours per demo, no black or purple backgrounds, no gradient palettes. Icons are inline SVG, no icon fonts, no emoji.
- No AI art: images are Zyqor's own renders and screenshots of its concept pages, or real CC0 models (credited next to the file).
- No fake testimonials or clients; demo brands are fictional and say so.
- QA: 0 console errors and no horizontal overflow at 1440x900, 390x844 and 360x740, plus a reduced-motion run.

## Use one

Copy the component folder, keep `<name>.js` and `<name>.css`, and follow its README. The demo pages also load `../_shared/base.css` (fonts and demo chrome), which a component does not need.

## Credits and inspiration

Each README lists the award sites the technique was studied on (with links) and the assets it uses. Inspiration also from the four UI libraries Sujon listed in his Drive (Unlumen UI, Magic UI, SmoothUI, RetroUI) and from [@ayzz.thedesigner](https://www.instagram.com/ayzz.thedesigner) (patterns only). Code: MIT, Zyqor Studio.
