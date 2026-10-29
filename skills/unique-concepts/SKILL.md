---
name: unique-concepts
description: Generate genuinely different 3D / web concept ideas (not "hero + 3 cards" with a new colour) and turn the best ones into a buildable brief. Constraint cards, material x motion x story matrices, credit-safe reference remixing, category inversion, scroll-world fly-through ideas, phone-first composition and a strict 3-colour palette rule, plus the real mistakes we made building 300 concepts and the checks that stop them.
when_to_use: "I need a unique concept for a brand", "every site I make looks the same", "give me 10 different 3D website ideas", "make a concept library", before writing a brief for any concept / portfolio piece / pitch site
license: MIT (text and code). Idea sources credited in CREDITS.md.
version: 1.0.0
---

# Unique concepts

A concept is unique when somebody can describe it in one sentence **without naming its colours or fonts**:
"the barber site where you swing the chair and the price list rotates with it". If the only way to tell two of
your concepts apart is the palette, you made one concept twice.

This skill is the method Zyqor Studio uses for its 300-concept library (100 Normal, 100 Advanced, 100 Premium).
It has four parts:

1. **Generate** many raw ideas fast (sections 1-5, tools in `tools/`).
2. **Filter** them hard (section 6).
3. **Shape** the survivor into a brief that a phone and a desktop can both carry (sections 7-8).
4. **Don't repeat our mistakes** (section 9, with `tools/preflight.mjs` as the automatic check).

```
idea-matrix / constraint cards / inversion / remix   ->   20-40 raw cards
            filter (10-second test, real asset exists, 3 hand-made details)   ->   3-5
                        brief.md (palette, phone-first frames, states, credits)   ->   1 build
                                    preflight.mjs + QA at 1440 / 390 / 360   ->   ship
```

Quick start (Node 18+, no install):

```bash
node tools/idea-matrix.mjs --n 10 --invert         # 10 seeded idea cards
node tools/constraint-cards.mjs --n 3              # 3 constraints for the idea you picked
node tools/palette-check.mjs --colors "#F3D9E0,#26341C,#2E9E5E"
node tools/preflight.mjs path/to/concept --root path/to/site   # before QA, before push, before sending a link
node tools/preflight.mjs --text "the message you are about to send"
```

---

## 1. Material x motion x story (the matrix)

Most "new" ideas are an old idea with a new skin. The matrix forces the three things that actually make a concept
feel different to change together:

| axis | question | examples (`data/*.json` has 20-40 each) |
|---|---|---|
| **Material** | What is the hero made of, so the light has something to do? | hammered brass, frosted glass, oiled walnut, enamel, wet stone, beeswax |
| **Motion** | What does the visitor physically do to it? One verb. | unscrew, pour, fold, swing, scrub time of day, peel a layer, pull a drawer |
| **Story** | What does the page tell, start to end? | dawn to dusk, how it is made, before/after, one object five uses, a field guide |

How to use it:

1. Run `node tools/idea-matrix.mjs --n 12` (or roll three dice on the lists). Note the seed so you can share it.
2. Read each card as a pitch. Most are nonsense. **Look for the one that makes you picture a frame.**
3. Swap one axis at a time until the frame is sharp. Changing only one axis is how you find a family of related
   but distinct concepts (same brass, different motion: pour vs swing vs polish).
4. Pass `--used library.json` to skip combinations your library already has.

This is morphological analysis (Fritz Zwicky's "morphological box"): list the independent dimensions of a
problem, then explore combinations instead of waiting for inspiration.

## 2. Constraint cards

A blank page produces the average of everything you have seen. A constraint pushes you off the average.
`data/constraints.json` has 20 cards; `node tools/constraint-cards.mjs --n 3` draws three. Rules:

- Draw **three**, keep **two**, and the two must be solved together. Cards that fight each other
  ("No hero headline" + "Ten seconds to understand the brand") produce the best layouts.
- A card is never an excuse to break a permanent rule (credits, honesty, phone = PC, 3 colours).
- Write the cards you used into `brief.md`. In review, "which constraint made this different?" must have an answer.

Favourite cards from the library: **One verb** (the whole page is "pour"), **Macro first** (open on the material,
pull back on scroll), **Wrong category** (a barber site laid out like a museum label), **Data as decoration**
(every decoration is a real number about the product), **Night mode is the story**.

The card format is inspired by Brian Eno and Peter Schmidt's Oblique Strategies; the cards here are our own,
written for web concepts.

## 3. Category inversion

List what every site in a category does, then do the opposite on purpose:

| category | what everyone does | inversion that became a concept |
|---|---|---|
| eyewear | model wearing frames, lifestyle photo | no face at all: the frames on a desk, the lens bends the page text behind it |
| music school | photos of students, a timetable | the instrument is the menu: each string is a section, plucking it navigates |
| kitchenware | flat-lay of pans | the pan is the timer: scroll heats it, the copper colour shifts |
| toy / bath | bright cartoon, bouncy type | a calm, almost scientific "field guide" to one rubber duck |
| cleaners / services | before-after slider | a garment rail you pull through the shop, each hanger is a service |

Steps: (1) write 5 clichés of the category, (2) negate each one, (3) keep the negation that still sells the product.
`--invert` on the matrix adds one inversion prompt per card.

## 4. Reference remixing (credit-safe)

Good concepts are often two references colliding. Do it without copying anyone:

1. **Collect 3 references from different fields** (a museum app, a car configurator, a cookbook), never 3 sites from the same category.
2. **Name the mechanism, not the look.** "Scroll scrubs one camera move" is a mechanism. "Dark green with gold serif" is a look. Remix mechanisms only.
3. **Change at least two of: object, material, motion, story** from each reference.
4. **Never take assets from a reference.** Models, photos, fonts, code and copy come only from sources with a licence you can name (CC0, CC-BY, OFL, MIT), each with a credit file. "It was on Pinterest" is not a licence.
5. **Credit the idea source when it is specific** (a named open-source skill, a talk, a book) in the brief and in your README, even when no file was copied. Example: our portfolio intro adapts the MIT-licensed *scroll-world* skill by cyw and says so.
6. **Run the "side by side" test**: put your frame next to the reference. If a stranger would say "same site", go back to step 3.

Austin Kleon's *Steal Like an Artist* is the classic framing: steal from many, credit, transform, don't skim from one.

## 5. Scroll-world fly-through ideas

A scroll-world is a single continuous camera move that the scroll bar scrubs (frame sequence or live 3D).
It is the most "wow per byte" structure, and the easiest to make generic. Ideas that stay specific:

- **Inside the object**: fly into the kettle spout, through the boiling chamber, out of the lid.
- **One object, three scales**: macro (the grain of the walnut) -> product (the chair) -> place (the workshop).
- **The supply line**: bean -> roastery -> cup; each stop is a chapter with one sentence.
- **Time instead of space**: the camera stays still, the scroll moves the sun across a day or the year across seasons.
- **The street**: a main street of fictional shops; each shopfront is a concept from your own library (this is how
  the Zyqor portfolio intro works: Studio -> Concepts -> Main Street).
- **Exploded assembly**: parts fly in from off-screen in the order a craftsperson would assemble them.

Rules that keep it premium: one camera move, no cuts; the path is a spline with eased speed (slow at the chapters);
text appears only when the camera is still; the poster frame is a real frame from the move; on the phone the
**same** move plays with a composition designed for portrait (section 7), not a cropped landscape.

## 6. The filter (keep 1 in 10)

An idea survives only if **all** of these are yes:

1. **Ten-second test**: a stranger understands what the brand sells within ten seconds, without reading.
2. **One-sentence test**: you can describe it without colours, fonts or "modern".
3. **A real asset exists**: a CC0 / CC-BY model, scan, HDRI or texture that carries the hero is found **before**
   the brief (Poly Haven, Khronos glTF sample assets, Sketchfab filtered by licence, NASA public domain).
   If the hero would have to be modelled in code from spheres and lathes, the idea waits (see mistake 9.2).
4. **Three hand-made details**: you can name three details a template would never have (a ruler showing real
   size, the price list rotating with the chair, a pencil mark on the paper that is the cursor).
5. **Distinct from the library**: not the same mechanic as an existing concept (we flagged two lamp concepts that
   both "switch the light and the page re-themes": keep one).
6. **It works with a thumb**: every hover has a tap, every drag has a swipe, nothing needs a mouse.
7. **It can be honest**: the brand is fictional and labelled "Concept"; no fake clients, reviews or numbers.

## 7. Phone-first composition

Sketch the 390 x 844 frame **first**, then the 1440 x 900 frame. Most "the phone cut detail" problems are really
"the composition only worked in landscape".

- The hero object sits in the **upper 55%** of the phone frame; text and the primary action in the lower 45% (thumb zone).
- Portrait camera: raise the FOV a little or pull the camera back; never shrink the model's detail, textures or effects.
- One idea per screen height. If a desktop section has three columns, the phone gets three steps of a horizontal
  snap rail or a stack, not three tiny columns.
- 48 px tap targets, native scroll, the gesture drawn on screen ("drag to spin" with an SVG hand icon), no hover-only states.
- Same files: the phone page loads the same model, texture and HDRI URLs as desktop. Allowed differences: pixel ratio,
  canvas size, layout. Not allowed: fewer instances, lower shadow maps, dropped passes, a smaller "phone model".

## 8. Palette rules: 3 colours, no black, no purple, no AI gradients

| role | share | rule |
|---|---|---|
| `--c1` paper | ~70% | warm or tinted light (#F3D9E0, #EFE6D2), never pure #FFFFFF as a background |
| `--c2` ink | ~29% | a **coloured** dark (forest #26341C, navy #1E264C, espresso #331E17), never #000 or neutral near-black |
| `--c3` accent | ~1% | one saturated colour that is **not** purple/violet; buttons, the active state, one detail in the 3D scene |

- Ink on paper at least 4.5:1 (aim for 7:1); the accent at least 3:1 against paper or ink where it carries text.
- No purple-to-blue or pink-to-violet gradients: they read as "AI-made". A gradient, if any, stays inside one hue.
- The 3D scene obeys the palette too: tint the floor, the background and the rim light from the three colours,
  so the model looks photographed for this brand.
- Each concept in a library gets **its own** palette; a library page with eight green-and-gold concepts is one concept.
- `node tools/palette-check.mjs --colors "#c1,#c2,#c3"` checks contrast, black and purple; pass CSS files to
  catch stray hex values and gradients.

---

## 9. Mistakes Tab made + how to avoid

Exactly seven. These all happened while building this library and the Zyqor Studio portfolio (Oct 2026). Each has the fix we use now.
`tools/preflight.mjs` automates the checks marked **[auto]**.

### 9.1 The grey-clay orb (N004 Morrow Light)
- **What happened:** the sunrise lamp's glass orb used a plain matte material with weak environment light. In the
  first frame and in the poster it read as a lump of grey clay, not frosted glass. A reviewer failed the concept on
  "model quality" even though it passed every technical QA run.
- **Why it was bad:** the hero object *is* the concept. Technical QA (0 errors, budget, overflow) cannot see that a
  material looks cheap, so the page shipped "green" and looked amateur.
- **The check:** (1) every hero material gets a real HDRI plus PBR settings that match the material (glass:
  transmission, thickness, IOR, low roughness, clearcoat; metal: metalness 1 with a roughness map); (2) look at the
  **first frame and the poster** at 1440 and 390 yourself and answer "what material is this?" without the brief;
  (3) compare against a real photo of the material side by side. The fix was an opal glass shell (transmission 0.86,
  roughness 0.3, clearcoat, sheen, a faint warm core) and more HDRI light.

### 9.2 Placeholder models made in code instead of real CC0/CC-BY assets
- **What happened:** several first-batch builders modelled the hero in code because it was faster: a lathe jar for
  a salt brand, a faceted cabin and cone pines for a cabin brand, a cloth panel, a code-made car. They were meant as
  stand-ins and shipped as the product.
- **Why it was bad:** code primitives look like code primitives (perfect symmetry, no wear, no texture detail). The
  client's rule is "real premium assets only", so every one had to be redone later with real scans: double work.
- **The check [auto]:** find the real asset before the brief (filter 6.3). `preflight.mjs` fails a concept that loads
  no `.glb/.gltf` and warns on every code-made solid; code geometry is fine for floors, particles and UI, never for
  the product. A concept that truly has no model (a type foundry, a UI kit) passes with `--code-ok "reason"` and
  writes the search it did into `brief.md`.

### 9.3 The phone build cutting detail versus desktop (A018)
- **What happened:** the moon concept's phone page used 9 rocks instead of 12, 2,200 stars instead of 3,200, a
  180² terrain instead of 240² and half-size shadow maps, through `isM ? small : big` branches.
- **Why it was bad:** the rule is "the phone gets the same premium quality, only compressed". Phones are where most
  people will see the work; a quietly cheaper phone build is the version clients judge.
- **The check [auto]:** both pages load the same 3D files; `window.__stage.info()` must report the same effects on
  both; `preflight.mjs` fails any `isM ? <number>` line that sets counts, segments, shadow sizes or samples. Only
  pixel ratio, canvas size and layout may differ. If the phone is too slow, optimise the asset once (meshopt, WebP,
  1-2k textures) so *both* builds get the lighter file.

### 9.4 Missing nav and forms (N002, A018)
- **What happened:** two early concepts were beautiful single scenes with no navigation, two sections and no form.
- **Why it was bad:** they were demos, not production pages. A client cannot imagine their business inside a page
  that has no menu, no sections to read and no way to get in touch.
- **The check [auto]:** every concept has a `<nav>` (with a phone menu), at least four sections, and a form that
  validates and then answers honestly in the page: "Concept: not sent. <Brand> is fictional, so nothing left this
  page" (no `action`, no fetch). `preflight.mjs` fails a page with no nav, no form, or a form with an action URL.

### 9.5 Credit gaps
- **What happened:** the first builders shipped models and textures without the credit files the client asked for;
  a later fix found posters with no credit file and a Lab model that had silently gone missing from the site copy
  while its credit was still listed.
- **Why it was bad:** CC-BY is a licence condition, not a courtesy: without the author, source and licence shown,
  the use is not licensed. And a public repo with uncredited assets is a public mistake.
- **The check [auto]:** a `<asset>.credit.json` (title, author, author_url, source_url, licence + version,
  licence_url, attribution, changes, downloaded) next to **every** asset, including code-made ones (author "Zyqor
  Studio", MIT); every CC-BY credit visible on the page on desktop and phone; root `CREDITS.md` regenerated from the
  credit files; the push gate fails on any missing file. `preflight.mjs` checks the files a page references.

### 9.6 A literal "PLACEHOLDER" link sent to the client
- **What happened:** a message was drafted with the word `PLACEHOLDER` where a link would go, meaning to paste the
  real URL once it was made. The draft was sent as it was. The client received "PLACEHOLDER"; a correction with the
  real link followed minutes later.
- **Why it was bad:** it is the one mistake the client sees directly, and it makes every other promise look unchecked.
- **The check [auto]:** never draft with fill-in tokens; get the real URL first, copy it from the tool's output
  (never retype it), then write the message. Run `node tools/preflight.mjs --text "<message>"` (or the same regex
  in your own sender) before anything leaves; it fails on PLACEHOLDER, TODO, TBD, `{{ }}`, `<link>`, example.com and
  "[link]" with no URL. `--tree` runs the same scan over a whole push folder.

### 9.7 Hardlinked files breaking the push
- **What happened:** to save disk space, files were "copied" as hard links (`cp -l` / `os.link`) into a staging
  folder. The step that delivers files refused one of them outright ("artifact must be one regular unlinked file"),
  so the hand-off failed at the last moment; and editing a "copy" silently edits the original too, because both
  names point to the same bytes, which in a push-staging folder means the source of truth can change under you.
- **Why it was bad:** a push or delivery fails at the last step, under time pressure, and a hardlinked staging copy
  can rewrite the source of truth without anyone noticing.
- **The check [auto]:** staging and push folders hold real copies (`cp` / `shutil.copy2`, never `cp -l`, `ln`,
  `os.link`). Before a push run `node tools/preflight.mjs --tree <staging>`; it fails on any file with more than one
  link. Fix a hit with `cp f f.tmp && mv f.tmp f`.

---

## 9b. Habits that go with the seven

Not mistakes in the list above, just habits that keep a library honest:
- **One mechanic, one concept**: before building, run filter 6.5 against the whole library so two concepts do not share a signature.
- **"Live" means passed**: the index shows a concept as Live only when its `qa.json` says PASS.
- **Unclear licences go to the owner**: when a licence is unclear (a font, a stock clip), stop and ask; do not remove,
  replace or ship more of it on your own.

---

## 10. From card to brief (template)

Copy `examples/brief-template.md` into the concept folder as `brief.md` and fill it in **before code**:

- one-sentence pitch (no colours, no fonts) and the matrix card + constraint cards used
- the real assets (title, author, licence, URL) and what in the scene is code-made and why
- palette `--c1/--c2/--c3` with roles and the palette-check output
- the phone frame and the desktop frame, described or sketched
- states (load, idle, interacting, reduced motion, no WebGL poster) and the touch equivalent of every hover
- three hand-made details
- nav sections and the honest form

`examples/concept-cards.md` shows ten real cards from this library, how each was filtered, and the brief that
came out of the best one.

## 11. Files

| path | what |
|---|---|
| `tools/idea-matrix.mjs` | seeded material x motion x story x category generator, `--invert`, `--used`, `--json` |
| `tools/constraint-cards.mjs` | draws constraint cards |
| `tools/palette-check.mjs` | 3-colour rule: contrast, no black, no purple, no AI gradients, stray colours |
| `tools/preflight.mjs` | the section-9 checks: placeholders, hardlinks, credits, nav/form, phone = PC, code-made hero, emoji, Concept label |
| `data/*.json` | the lists (materials, motions, stories, constraints, categories): edit them, they are yours |
| `examples/concept-cards.md` | worked example: cards -> filter -> brief |
| `examples/brief-template.md` | the brief to fill in before code |
| `checklist.md` | one-page checklist for review |
| `CREDITS.md` | the idea sources this method builds on |
