---
name: unique-idea-and-concept
description: Find the ONE big idea a website is built around, then turn it into a story, a metaphor, a camera grammar and a chapter storyboard before any design starts. The "[product] as [thing or place]" sentence test, idea sources that are not templates, story arcs, what stays on screen, copy choreography, naming the style, analysing references without copying, and the questions to ask a client. Includes scripts/storyboard.mjs (idea check + storyboard skeleton) and links the generator tools of the unique-concepts skill.
when_to_use: "make it unique", "every site looks the same", "give me a concept for a [business]", "what's the big idea", start of every new website, pitch or concept, before the brief is written, when a draft looks like a template
license: MIT (text and code). Sources in CREDITS.md.
version: 1.0.0
---

# The one big idea

Sujon, 30 Oct 2026: *"kaisa ek unique premium advanced website banta hai"*. The answer from studying Awwwards
winners (`docs/how-top-designers-build-unique-sites.md`): they do not start from a layout. They start from **one
idea that belongs to the client**, and every colour, chapter, motion and interaction serves that idea.

This skill is the step before everything else. Its sibling [`unique-concepts`](../unique-concepts/) has the
idea-generating machines (matrix, constraint cards, inversion, filter, preflight); this skill is **how to choose,
shape and stage one idea into a site**.

```
ask (section 6) -> 20+ raw ideas (unique-concepts tools) -> the sentence test (section 1) -> pick 1
   -> metaphor + what stays on screen (2) -> story arc + chapters (3) -> camera grammar (4) -> named style (5)
   -> storyboard.mjs -> brief (section 8) -> build with the other skills
```

```bash
node scripts/storyboard.mjs --check "modern website for a bakery"                         # FAIL, with why
node scripts/storyboard.mjs --idea "a hi-fi shop as a tape deck that flips to side B" --category music --chapters 5
node ../unique-concepts/tools/idea-matrix.mjs --n 10 --invert                            # raw ideas
```

---

## 0. Desktop first, no compromise

*"PC me no compromise, ek dam best"* (Sujon, 30 Oct 2026). An idea is judged at its biggest:

1. **Stage the idea for a 1440 x 900 screen first**: what fills that frame in the first second? If the answer is
   "a headline and a button", the idea has not been staged yet.
2. **The desktop gets the full version of the signature moment** (the 3D object at full detail, the sound, the
   pointer interaction, the long pinned chapter). Never design the idea around what a phone can do and then
   leave the desktop half empty.
3. **Big ideas need room**: oversized object or type, generous empty space around it.

### Phone parity

- The **same idea, same object, same chapters** on the phone. If the idea cannot work on a 390px screen with a
  thumb, it is the wrong idea (or needs a touch version of the interaction, decided now).
- Write the touch equivalent of every pointer interaction in the storyboard's "Phone" column before building.

---

## 1. The sentence test

Write the idea as one sentence of the form:

> **"[the product or business] as [a physical thing or a place]"**, plus what the visitor does there.

| Passes | Why |
|---|---|
| "A messaging app as a tiny planet where you walk around delivering the letters." | Messenger by abeto, Awwwards Site of the Year 2025 |
| "A pet-sitting company whose site opens with: bounce a ball to get in." | Don't Board Me, SOTY 2024: the gate is the brand promise (a tired dog is a happy dog) |
| "A film library as a shelf of physical DVDs that spin in your hand." | A24 by Ravi Klaassens, SOTD Oct 2026 |
| "A webcam told as the team's desk, seen from above, with everything they ever made on it." | Opal Tadpole, SOTY 2024 |
| "A music school as a ukulele whose strings are the menu." | Zyqor concept N020 Chordline |
| "A hi-fi shop as a tape deck that plays and flips to side B." | Zyqor concept P017 Tapehead |

| Fails | Why |
|---|---|
| "A modern, clean website for a bakery." | no metaphor, only adjectives |
| "Premium landing page with 3D and animations." | describes effects, not an idea |
| "A dentist site with a hero, services and testimonials." | a wireframe, not an idea (and fake-proof bait) |

Rule from the existing skill, still the best test: **a concept is unique when someone can describe it in one
sentence without naming its colours or fonts.** If two of your ideas differ only by palette, you have one idea twice.

`storyboard.mjs --check "<sentence>"` catches the mechanical failures (no metaphor, vague words, too long/short).
Taste is still yours.

---

## 2. The metaphor and what stays on screen

The "thing or place" after **as** becomes three decisions:

| Decision | Question | Example (tape deck) |
|---|---|---|
| The object | What is on screen from the first chapter to the last? | the deck itself, in 3D |
| The verb | What does the visitor do to it? | press play, flip the tape to side B |
| The world | Where does it live? (material, light, sound) | a warm wooden shelf, amber light, tape hiss on opt-in |

The object staying on screen is the device top designers use most (study doc §2; @ayzz.thedesigner's pattern C,
"travelling hero object": one product stays while the layout rearranges around it). It is also what makes
scroll storytelling feel like one piece instead of stacked sections.

### Where good metaphors come from (in order of strength)

1. **The product's own physical form or tool** (the instrument, the deck, the knife, the chair, the jar).
2. **The place the service happens** (the kitchen, the workshop, the clinic waiting room seen differently).
3. **A ritual of the customer** (unboxing, the first sip, the fitting, the before-and-after).
4. **An inversion of the category** (a law firm as a quiet library; a gym as a slow-motion gallery):
   `unique-concepts` §3 and `tools/idea-matrix.mjs --invert`.
5. **A material** (paper, brass, cloth, wax) that the whole site is made of.

Avoid metaphors that need explaining, need a fake object (code-made placeholder geometry is a known Zyqor
mistake, `unique-concepts` §9.2), or need a real brand's logo.

---

## 3. Story: chapters, not sections

Sujon's checklist: *"Website ko sections ka collection mat banao. Flow banao: Problem, Product, How it works, Proof,
Details, CTA. Har section previous section ko naturally continue kare."*

### 3.1 The arcs

| Arc | Chapters | Use for |
|---|---|---|
| **Six-step flow** (his checklist) | Problem -> Product -> How it works -> Proof -> Details -> CTA | most client sites |
| **Five-chapter product arc** (Master Award System, Structure 03) | silhouette reveal with rim light -> 90° orbit with a material macro and a glass HUD -> exploded view with 1px leader lines -> finish studio (swatches change material and light) -> spec sheet with a sticky reservation bar | physical products, PREMIUM |
| **Journey / flight** (scroll-world) | arrive -> travel through scenes -> arrive at the destination (CTA) | places, worlds, hospitality, real estate |
| **Manifesto** | one statement lit word by word -> evidence -> invitation | studios, agencies, causes |
| **Before / after** | the problem state -> the change, dragged by the visitor -> the result | services, renovation, beauty |

"Proof" always means **real** proof: the product itself up close, real specs, materials, a working demo, real
photos. Never invented testimonials, ratings or logos (his rule; Drive H1, X3).

### 3.2 Each chapter, one line and one picture

For each chapter write: a 3-6 word title, one plain sentence, one picture (what the object is doing), and whether
it has an interaction. These copy limits come from scroll-world's prompt rules (eyebrow 2-4 words, title 3-6 words,
one plain sentence of body, 0-3 proof tags) and keep the idea, not the text, in charge.

### 3.3 Copy choreography (scroll-world T15)

- The first chapter's copy greets on landing and fades by about 62% of its segment.
- Middle chapters' copy peaks at the centre of their segment.
- The last chapter's copy fades in by 40% and holds the CTA.
- Copy drifts about 4vh as it fades; it only takes pointer events when more than half visible.
- Pacing: give each chapter its own scroll length (more scroll = longer stay) and slow the motion where the copy
  peaks (scroll-world's "linger" remap, motion skill).

---

## 4. Camera grammar by concept (scroll-world T7)

Every scroll concept picks **one** grammar, so a library of sites does not all move alike.

| Concept type | Camera grammar |
|---|---|
| Product, luxury | slow half-orbit around the object, then carry on; macro on the material |
| Real estate, interiors | steadicam through doorways, crane up in tall rooms, end on the window view |
| Industrial, engineering | low lateral track with foreground parallax, then a reveal of scale |
| Travel, places | rise and reveal over the landscape, then swoop to the arrival |
| Food, craft | push in close on the hands or the dish, ease back to the room |
| Calm brands | locked isometric view; each chapter adds one object (scroll-world's "locked-isometric" variant) |

Seams between chapters follow scroll-world's laws (motion skill): the camera never reverses across a seam, and each
leg ends in about one second of slow forward drift that the next leg continues.

**One shared look per concept** (scroll-world T17, translated without AI): the same HDRI, light rig, tone mapping,
material palette, lens and colour grade in every scene. That is what makes separate scenes read as one world.

---

## 5. Name the style, analyse references, copy nothing

**Name the style** (Drive Q2): never "modern" or "beautiful". Name it: Minimalism, Liquid Glass, Neo-Brutalism,
Editorial, Skeuomorphic, Spatial UI, Swiss, Maximalism, Bento (only if chosen). One named style per project, not
one style for everything.

**Analyse each reference before using it** (Drive Q3), in writing: style and why; palette (approximate hex);
typography; layout (grid, order, density, whitespace); shape (radius, borders, icons); components; motion (mark
anything you guess from a still image as *inference*); what to take (structure, rhythm, hierarchy, choreography)
and what never to take (logo, brand, illustration, text, photos).

**Copy the choreography, never the content** (Drive M12): *"Take the grammar, never the content or logos."*
Every reference used gets a credit line as inspiration.

### Idea seeds from @ayzz.thedesigner (techniques, studied Oct 27 2026)

| | Pattern | As an idea seed |
|---|---|---|
| A | Colourway morph | the variant switch floods the whole page with the product's colour |
| B | Giant type behind the product | the product name, viewport-wide, behind the object |
| C | Travelling hero object | one object crosses every chapter while the layout rearranges |
| D | Physical reveals | paper tear, organic masks, stepped block wipes |
| E | Orbit and radial fans | items on a ring; the active one turns to the front |
| F | Callouts and exploded views | leader lines and labels on separated parts |
| G | Kinetic editorial type | words appear one by one; serif italic inside grotesk |
| H | Product in a world | floating island, podium, foreground leaves for depth |
| I | Micro UI | rolling numbers, add-to-cart into a gift box, liquid-glass lens |
| J | Process as content | brief, moodboard, wireframe, final, shown as the story |
| K | Physics and 3D scroll | draggable falling objects, product turning with scroll |

Combine at most two per site, and only when they serve the sentence.

---

## 6. Asking the client (scroll-world T22, adapted)

Ask the subject openly first, then only what cannot be defaulted:

1. "What should this site make people feel or do?" (open)
2. "What is the one thing only you have?" (the object, the place, the ritual)
3. "Who visits, and on what device?" (always ask about the phone)
4. "What must be on the page?" (prices, booking, menu, legal)
5. "What do you already have?" (photos, a product to scan, a logo, brand colours)
6. "Which tier?" (premium-tiers skill: $300 / $1k / $10k)

Everything else (palette, fonts, structure, motion) is your job and is defaulted by the other skills.

---

## 7. The filter (keep one)

From `unique-concepts` §6 plus the study:
- [ ] Passes the sentence test.
- [ ] A real, licensable asset exists for the object (or the client has one).
- [ ] The signature interaction works with a thumb.
- [ ] It fits the tier's budget and time.
- [ ] Three hand-made signature details can be named now.
- [ ] Nobody in the last 20 sites you made used the same object + verb pair.
- [ ] It needs no fake proof to persuade.

---

## 8. The brief (write before any code, Drive Q1)

```
Idea sentence:            [product] as [thing/place], and the visitor [verb]
Stays on screen:          [object]
Named style:              [Editorial / Liquid Glass / ...]
Structure (layout §2):    [01-14]
Arc + chapters:           [6-step / 5-chapter / journey / manifesto / before-after], storyboard attached
Camera grammar:           [from section 4]
Palette sentence:         [colour-systems §3 step 1] + palette.mjs output
Fonts:                    [display / body / mono], licences
Signature interaction:    [pointer version] / [touch version]
Three signature details:  1. 2. 3.
Tier + budget:            [NORMAL / ADVANCED / PREMIUM], own files <= [1.5 / 3 / 8] MB
Assets + licences:        [model / photos / footage / sound], source URLs
States:                   loading, empty, error, success, reduced motion, no WebGL
Real proof:               [what proves it, honestly]
```

---

## 9. Do and don't

| Do | Because |
|---|---|
| Write the sentence before opening any design tool | the idea leads, the layout follows |
| Keep one object on screen across chapters | continuity reads as one designed piece |
| Pick the camera grammar from the concept | a library where every site moves alike is a template |
| Ask about the phone in the first conversation | the idea must survive a thumb |
| Credit every reference as inspiration | honest, and his credit rule |

| Don't | Because |
|---|---|
| Start from "hero + features + about" | it is a wireframe, not an idea |
| Pick an idea for its effect ("let's do particles") | effects without meaning read as AI |
| Use a metaphor that needs a paragraph to explain | the 3-second test fails |
| Clone a reference's look or text | his rule: original design, not a brand clone |
| Invent proof to make the story work | dishonest; the idea should persuade on its own |

---

## 10. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Idea scope | one metaphor carried by one interaction on one page | the metaphor becomes a scroll journey (3-5 chapters) | a world: multiple scenes or a configurator, sound if it is the idea |
| Object | a photo, an SVG drawing or one light model | a real model or real footage moving with scroll | a detailed real model that holds a close-up, every chapter |
| Story | 1-3 beats | 4-5 chapters with copy choreography | 5-6 chapters, page transitions, camera grammar with seams checked |
| Proof | the interaction itself | + real specs or demo | + photography, materials macro, finish studio |

---

## 11. Pre-build checklist

- [ ] `storyboard.mjs --check` passes the idea sentence; a human agrees it is the brand's own idea.
- [ ] Object, verb and world written (section 2).
- [ ] Arc chosen; each chapter has a title, a sentence, a picture, a phone note.
- [ ] Camera grammar chosen (scroll sites).
- [ ] Style named; references analysed in writing; credits listed.
- [ ] Touch version of every interaction decided.
- [ ] Brief (section 8) complete, including tier, budget, assets and licences.
- [ ] Filter (section 7) passed.

## 12. Files

| File | What |
|---|---|
| `scripts/storyboard.mjs` | idea sentence check + chapter storyboard skeleton (markdown or JSON) |
| `examples/storyboards.md` | three worked storyboards (NORMAL, ADVANCED, PREMIUM) |
| `../unique-concepts/` | idea matrix, constraint cards, inversion, palette check, preflight (the generator side) |

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 30 Oct 2026 9:42 AM IST ("kaisa ek unique premium advanced website banta hai"), 30 Oct 6:34 AM ("kaisa unique website banate hai"), 30 Oct 9:44 AM ("PC me no compromise"), 27 Oct 2026 (real assets only, phone same quality).
- Sujon's Drive: *web-design-promo-checklist.txt* ("Visual storytelling"); *Master-Award-Website-Guide-Improved-v4.2* Part E Structure 03 (five-chapter product arc), Part F item 13 §1-§2, §5-§6 (named style, reference analysis, brief, flow); *DESIGN-LIBRARY-INDEX.md* (per-project styles, choreography not content, concepts labelled); *Website-Building-Guide-New-Site.md* §6 (order of work).
- Drive points L5, Q1-Q3, M12, D1, D5, H1, H2, H5 (mapping in `docs/beast/SKILLS_SOURCE_MAP.md`).
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: camera grammar by concept and the locked-isometric variant (SKILL L411-436, prompts L92-115), pacing and linger (SKILL L438-441), copy choreography and copy limits (engine L244-256, prompts L164-170), one shared style preamble (prompts L3-43), ask the subject openly (SKILL L80-88), always ask about mobile (SKILL L129-136). Points T7, T8, T15, T17, T18, T22 in `docs/beast/SCROLL_WORLD_POINTS.md`.
- Award sites, Awwwards pages read Oct 30 2026: Messenger (abeto), Don't Board Me (The First The Last), A24 (Ravi Klaassens), Opal Tadpole (Claudio Guglieri and team), Igloo Inc (abeto); see `docs/how-top-designers-build-unique-sites.md` §1-§2.
- @ayzz.thedesigner (Abdul Mutakabar Ayaz), public Instagram posts studied Oct 27 2026: patterns A-K, described, nothing copied.
- The existing `unique-concepts` skill (Zyqor Studio) and the methods it credits (Zwicky's morphological box, Eno and Schmidt's Oblique Strategies, SCAMPER, Kleon's *Steal Like an Artist*).
