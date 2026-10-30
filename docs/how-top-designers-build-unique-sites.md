# How top designers build unique websites

A study for Zyqor Studio, written Oct 30 2026. The question (Sujon, Oct 30): *kaisa unique website banate hain*, how do the best designers make sites that do not look like templates? This is the answer, from looking at the work itself, step by step: **idea → story → layout → motion → 3D → sound → micro-interactions → phone and speed**. Each step names real award-winning sites (linked and credited), what they actually do, and the technique worth stealing. The techniques are rebuilt from scratch in [`site/components/`](../site/components/) (live: https://zyqor-concepts.sites.tab.bot/components/).

> Inspiration only. No code, images, fonts or text from these sites are copied into this repo. Screenshots taken for the study stay private (`work/beast/research_top_sites/`, not published).

## How this was studied

- **Awwwards Sites of the Year 2021-2025** (the 15 winners listed on [awwwards.com/websites/sites_of_the_year](https://www.awwwards.com/websites/sites_of_the_year/)) and the **15 most recent Sites of the Day** (Oct 15-29 2026), each read on its Awwwards page (agency, score, palette, technology tags, "elements") on Oct 30 2026.
- **CSS Design Awards** Websites of the Day for Oct 20-29 2026 ([cssdesignawards.com](https://www.cssdesignawards.com/)). The FWA site would not render its list for a script that day, so FWA is not used as evidence here.
- **20 of those sites were opened in a real (headless) Chrome** at 1440x900 on Oct 30 2026: three screenshots each (first screen, after one scroll, after two), plus what the page itself reports (fonts loaded, libraries on `window`, number of canvases and videos, page height). One (Cartier) refused the visit; FWA showed only a modal.
- **@ayzz.thedesigner** (Abdul Mutakabar Ayaz, the Instagram designer Sujon shared on Oct 27): all 499 public posts were catalogued on Oct 27 and 64 design reels studied frame by frame. Summary in section 9.
- **Sujon's own Drive** (Master Award Web Design System and the Website-Building Guide v6), for the rules that decide how a technique is used here.

How the juries score, so you know what "award level" means: Awwwards weighs **Design 40%, Usability 30%, Creativity 20%, Content 10%** (shown on every site page). CSSDA scores **UI, UX and Innovation**. Usability is 30%: a beautiful site that is slow or confusing on a phone does not win.

## What the winners have in common (measured on the 20 sites)

| Observation | Count | What it means for us |
|---|---|---|
| Smooth scroll library (Lenis) present | 9 of 20 | Smooth, eased scrolling is normal now; native scroll must still work underneath. |
| One or more `<canvas>` (WebGL or 2D) | 12 of 20 | Most winners draw something live. It is rarely decoration; it is the product, the world or the type. |
| Page is one screen tall (an "app", not a long page) | 9 of 20 | Many winners are experiences you enter, not pages you read (Messenger, Igloo, Overworld, A24). For client sites we keep the long page and borrow the entrance. |
| Two or three colours, one very loud | most | Lando Norris = `#D2FF00` + `#111112`; Lusion = `#1A2FFB` + `#F0F1FA`; Messenger = two soft greens. Award palettes are smaller than client palettes, not bigger. |
| A grotesk + an editorial serif | most | Neue Montreal appears on 6 of the 20; Belgrade Arbor pairs Work Sans with an editorial serif; Odyssée pairs Basel Grotesk with a Times cut. |
| A "with sound / without sound" choice at the door | 4 of 20 | Overworld, Emotion, Forge ("Accept & enter / Reject & enter"), G. Colombel. Sound is opt-in, never autoplay. |

## 1. Idea: one thing only this brand could have

The winners do not start from a layout. They start from **one idea that belongs to the client** and build everything around it.

- **[Messenger by abeto](https://messenger.abeto.co)** (Awwwards Site of the Year 2025): a tiny planet where the letters of the title are buildings, and you are the delivery person walking around it. The brief "a messaging product" became "a small world where someone has to deliver the messages". Tags: Three.js, WebSockets, storytelling.
- **[Don't Board Me by The First The Last](https://dontboardme.com)** (SOTY 2024): a pet-sitting company whose site opens with "Bounce a ball to get to the site". The gate is the brand promise (a tired dog is a happy dog).
- **[A24 by Ravi Klaassens](https://a24.raviklaassens.com/)** (SOTD Oct 26 2026): film titles shown as physical DVDs that spin in 3D. The object makes "a film library" feel collectable.
- **[Opal Tadpole by Claudio Guglieri and team](https://www.opalcamera.com/opal-tadpole)** (SOTY 2024): a webcam told through "the table", a top-down photo of the team's desk with every product they ever made on it.

**Steal this:** write the idea as one sentence of the form *"[the product] as [a physical thing or a place]"* before drawing anything. Zyqor's best concepts already do this: Chordline (a music school whose menu is ukulele strings), Tapehead Hi-Fi (a deck that plays and flips to side B). The [`unique-concepts`](../skills/unique-concepts/) skill has the idea matrix and constraint cards for this step.

## 2. Story: the scroll is a sequence, not a stack of sections

- **[Igloo Inc by abeto](https://www.igloo.inc/)** (SOTY 2024): one continuous camera move over an ice landscape to an igloo, with glitch transitions between chapters. Tags: infinite scroll, transitions, 3D.
- **[Persepolis Reimagined by Monks for the Getty](https://www.getty.edu/persepolis/)** (SOTY 2022): a museum story told as a reconstruction you scroll through, chapter by chapter, with 360 views and data.
- **[Belgrade Arbor by Square43](https://belgradearbor.rs/en)** (SOTD Oct 17 2026): starts on a white 3D model of the building's facade, then turns into a green editorial chapter with photos inside an organic, leaf-shaped mask. 7 videos and 2 canvases on the page.

**Steal this:** write the page as 4 to 6 chapters, each with one sentence and one picture, and decide what stays on screen between chapters (the product, a camera, a colour). Components: [`sticky-story`](../site/components/sticky-story/) (pinned picture, chapters scroll past), [`scroll-3d-stage`](../site/components/scroll-3d-stage/) (one 3D object carried through every chapter).

## 3. Layout: giant type, few elements, one break in the grid

- **[FORMAT by Obys](https://format.obys.agency/)** (SOTD Oct 19 2026): a pixel-stencil wordmark the full width of the screen, then an editorial poster grid. Physics (Matter.js) for a playful break.
- **[landonorris.com by OFF+BRAND](https://landonorris.com/)** (SOTY 2025): topographic racing lines as the background, the word "TRACK." huge, photos scattered like a collage on top of the grid.
- **[ESR Bespoke by NIGHTJAR](https://www.esrbespoke.au/)** (SOTD Oct 23 2026): a full-bleed street photo with one short line ("Exceptional is our standard"), then a long list of car brand names in large type where each name reveals a picture on hover.
- **[Pangram Pangram by Locomotive](https://pangrampangram.com/)** (SOTY 2021): the typefaces are the layout; every card is a specimen.

**Steal this:** one oversized element per screen (a word, a product, a photo) and everything else small; break the grid once per page on purpose (a scattered collage, a rotated card). Components: [`split-text`](../site/components/split-text/) (headline reveals), [`image-trail`](../site/components/image-trail/) (the ESR-style name list with image reveal), [`footer-wordmark`](../site/components/footer-wordmark/).

## 4. Motion: tied to scroll and to the pointer, eased, never random

- **[Emotion Agency](https://emotion-agency.com/)** (SOTD Oct 22 2026): headings that build line by line ("We build / more than websites"), a footer element that Awwwards lists on its own. GSAP, Three.js, Nuxt; 11 canvases.
- **[Forge Automotive by 12 Studio](https://forgeautomotive.co.uk/)** (SOTD Oct 25 2026): infinite scroll, parallax and transitions with GSAP on Next.js.
- **[A24 by Ravi Klaassens](https://a24.raviklaassens.com/)**: page changes without a white flash (Barba.js), so the site feels like one object.

**Steal this:** every movement either follows the scroll position or the pointer, and uses one family of curves (Sujon's Drive: `cubic-bezier(.16,1,.3,1)` to settle, `cubic-bezier(.65,0,.35,1)` to wipe). No motion that plays on its own and loops. Respect `prefers-reduced-motion` always. Components: [`split-text`](../site/components/split-text/), [`marquee`](../site/components/marquee/) (speed follows scroll velocity), [`page-transition`](../site/components/page-transition/) (circle reveal from the click point, native View Transitions API), [`preloader`](../site/components/preloader/) (real byte progress, then a wipe).

## 5. 3D: a real object, lit like a photo, doing one thing

- **[Lusion v3](https://lusion.co/)** (SOTY 2023): a field of soft 3D shapes inside a rounded frame that react to the pointer with physics, then "Bold ideas, brought to life" in plain type below. The 3D is the hero, the type is calm.
- **[Opal Tadpole](https://www.opalcamera.com/opal-tadpole)**: a small product shown large, turning with the scroll so you see every side before you buy.
- **[Igloo Inc](https://www.igloo.inc/)** and **[Messenger](https://messenger.abeto.co)**: whole worlds in WebGL, both by abeto.
- **[Overworld Audio by Rogier de Boevé](https://overworldaudio.com/)** (SOTD Oct 15 2026): dark, almost empty 3D HUD that only comes alive with sound.

**Steal this:** one real model (scanned or modelled, CC0/CC-BY, credited), studio HDRI lighting, ACES tone mapping, a soft contact shadow, and one camera move per chapter. The phone gets the same model. Never grey "clay" materials (Zyqor's own N004 mistake) and never code-made placeholder shapes. Component: [`scroll-3d-stage`](../site/components/scroll-3d-stage/) (a 19,248-triangle CC0 scan through four chapters, lazy, poster fallback). Skill: [`model-optimisation-phone`](../skills/model-optimisation-phone/).

## 6. Sound: opt-in, short, part of the idea

- **[Overworld Audio](https://overworldaudio.com/)**, **[Emotion Agency](https://emotion-agency.com/)**, **[Forge Automotive](https://forgeautomotive.co.uk/)** and **[G. Colombel](https://guillaumecolombel.fr/)** all ask first: "enter with sound" or "accept and enter". Ascension by Pegassi (SOTD Oct 21 2026) is a music release where the sound is the product.

**Steal this:** ask at the door, remember the answer, keep a visible mute button, and use sound only where it is the brand (a music school's strings, a hi-fi deck). Zyqor examples: N020 Chordline (strings pluck), P017 Tapehead (deck loop).

## 7. Micro-interactions: the details judges click on

- **Magnetic buttons and custom cursors** with labels ("View", "Drag") are on Lusion, A24, Lando Norris and many SOTDs.
- **Navigation as a moment**: Star Atlas (SOTY 2021) has a space-exploration overlay menu listed as an Awwwards element; ESR Bespoke's navigation is listed too.
- **Footers people remember**: Emotion Agency's footer and Opal's giant outline "opal" wordmark at the bottom of the page.
- **Real states**: Don't Board Me has a playful 404 and a pricing page Awwwards lists as an element.

**Steal this:** every button gets hover, press and focus states; every form gets a success state; the last screen (footer) is designed as carefully as the first. Components: [`magnetic-button`](../site/components/magnetic-button/), [`cursor-follower`](../site/components/cursor-follower/), [`mega-menu`](../site/components/mega-menu/), [`liquid-glass-card`](../site/components/liquid-glass-card/), [`pricing-table`](../site/components/pricing-table/), [`quote-carousel`](../site/components/quote-carousel/), [`footer-wordmark`](../site/components/footer-wordmark/).

## 8. Phone and speed: where most "beautiful" sites lose

Usability is 30% of the Awwwards score and every SOTD page shows a separate mobile capture. What the winners do: WebGL starts only when needed, heavy scenes pause off screen, smooth scroll stays native-feeling, and hover effects have touch versions. Sujon's own rule is stricter and is Zyqor's edge: **the phone gets the same models and the same quality as the desktop**, made lighter only by compression. Check with the [`qa-harness`](../skills/qa-harness/) skill at 1440 / 390 / 360 with 0 console errors.

## 9. @ayzz.thedesigner: what makes his work recognisable

Credit: [@ayzz.thedesigner](https://www.instagram.com/ayzz.thedesigner), Abdul Mutakabar Ayaz (UI/UX designer, zz.studio.design). Studied from his public posts on Oct 27 2026 (499 posts; techniques described here, nothing of his copied).

His signature: a light grey or blurred-colour backdrop, **one big rounded browser card** in the middle, one saturated colour per screen that the product sets, very heavy condensed headlines, pill buttons and numbered dots, and Figma smart-animate motion where **the product travels and the layout rearranges around it**. Eleven repeatable patterns:

| | Pattern | The technique to learn |
|---|---|---|
| A | Colourway morph | Switching a variant changes the product AND floods the background, headline and buttons with its colour. |
| B | Giant type behind the product | A viewport-wide condensed word sits behind the object; the word swaps per variant. |
| C | Travelling hero object | One product stays on screen across hero, stats, collection and detail while the layout changes around it. His most used device. |
| D | Physical reveals | Paper tear, organic flower-shaped mask, stepped block wipes between sections. |
| E | Orbit and radial fans | Items on a ring rotate the active one to the front; card stacks fan out and collapse. |
| F | Callouts and exploded views | Thin lines and pill labels pointing at parts; layers of the product separate. |
| G | Kinetic editorial type | Words appear one by one, serif italic mixed with grotesk, a giant footer wordmark rising letter by letter. |
| H | Product in a world | Floating island, clouds, a podium, leaves in front and behind for depth. |
| I | Micro UI | Accordion colour bars with rolling numbers, add-to-cart into a gift box, liquid-glass lens, bento assembling. |
| J | Process as content | Brief, moodboard, type and colour card, wireframe, final on a monitor, desktop and phone side by side. |
| K | Physics and 3D scroll | Draggable falling objects, a product turning in 3D with scroll, pinned horizontal tracks. |

Where these live in this repo: A, B, C, E, F and D are combined in the portfolio's Worlds section; G is the [`footer-wordmark`](../site/components/footer-wordmark/) and [`split-text`](../site/components/split-text/) components; I is the [`pricing-table`](../site/components/pricing-table/) odometer and [`liquid-glass-card`](../site/components/liquid-glass-card/); K is [`scroll-3d-stage`](../site/components/scroll-3d-stage/). The concept library assigns one or two pattern letters per concept so no two concepts repeat a design.

## 10. Before you build: ten questions

1. What is the one sentence idea, "[product] as [thing or place]"?
2. What stays on screen from the first chapter to the last?
3. Which single element is oversized on each screen?
4. Which three colours, and which one is loud?
5. Which grotesk and which serif (self-hosted, licence checked)?
6. What does the pointer do, and what does a finger do instead?
7. Is there a real model, credited, with an HDRI, and the same file on the phone?
8. Is sound part of the idea? If yes, where is the "enter with sound" choice and the mute button?
9. Does every button, form and menu have hover, press, focus and done states?
10. Does it pass 1440 / 390 / 360 with 0 console errors and reduced motion?

## Sources

Awwwards pages read Oct 30 2026: [Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/), [Sites of the Day](https://www.awwwards.com/websites/sites_of_the_day/), and the individual pages of Lando Norris, Messenger, Igloo Inc, Don't Board Me, Opal Tadpole, Lusion v3, Noomo Agency, Mana Yerba Mate, KPR, The Other Side of Truth, Persepolis Reimagined, Pangram Pangram Foundry, Star Atlas, Prometheus Fuels, Umami Land, Unbelievably Crap, G. Colombel, Awards Racing, A24 (Ravi Klaassens), Forge Automotive, Brandon Yasin, ESR Bespoke, Emotion Agency, Ascension (Pegassi), Cartier Le Choeur des Pierres, FORMAT (Obys), Signal-A Studio, Belgrade Arbor, OFFFForum, Overworld Audio, Nick Ho and Odyssée. CSS Design Awards home page (WOTD list), Oct 30 2026. All names, sites and work belong to their owners and agencies.
