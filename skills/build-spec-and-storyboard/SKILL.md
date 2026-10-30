---
name: build-spec-and-storyboard
description: Write a complete build spec and render a storyboard BEFORE any site code. The spec fixes the story beat by beat, the stack and folder layout, every design token as a table (scale units for desktop and phone, colours with hex and role, type with size/weight/tracking/line-height, spacing, motion easings and durations), an assets table with URL/use/licence, each section's exact layout and layering, the 3D or hero element part by part, a scroll timeline per section, and a QA checklist. Then 4-8 storyboard stills made from the real assets, and a review gate where the owner or client says yes before the build starts. Includes a full worked example (Halyard Arc, a fictional desk lamp) and scripts/spec-lint.mjs, which refuses a spec with gaps.
when_to_use: before building any website, concept, landing page or animation; when a client says "make it premium"; when a build keeps getting redone; when handing a build to another person or agent
license: MIT (text and code)
version: 1.0.0
---

# Build spec and storyboard (before any code)

Sujon's rule, 30 Oct 2026, 2:31 PM IST: *before any website, first a full detailed structure: fonts, colours, design,
each one chosen as the best one by one, a storyboard, everything imagined; then start the work.*

The reason is simple. Every redo in this repo came from a decision that was made while coding instead of before it.
The P041 pizza was built three times because "real pizza" was never defined up front (see
[`docs/case-studies/P041-hotcoal-kitchen.md`](../../docs/case-studies/P041-hotcoal-kitchen.md)). A spec is cheap to
change; a built page is not. An hour on the spec saves a day of rebuilding, and the storyboard lets the client say
"no" to a picture instead of to a finished site.

```
1 Brief        what it sells, for whom, the one feeling      (client-delivery-kit / unique-idea-and-concept)
2 Decide       each choice one by one, best of 2-3 options    (section 3 below)
3 Write SPEC   10 sections, numbers not adjectives            (section 2, example/SPEC-halyard-arc.md)
4 Lint         node scripts/spec-lint.mjs SPEC.md -> READY
5 Storyboard   4-8 stills from the real assets                (section 4)
6 Review gate  owner/client says yes, written into the spec   (section 5)
7 Build        the spec is the source of truth; changes go into it first
```

---

## 1. What "done" looks like for a spec

A spec is done when **someone who has never seen the idea could build the same page from it**, without asking a single
question about a colour, a size, a font, a position or a timing. Test it that way: hand it to another agent or a
colleague and ask what they would still need to guess. Every guess is a gap.

Numbers, not adjectives. "Large bold title" is a gap. "Display, Fraunces opsz 144, 112 / 48 px, weight 380, tracking
-0.035em, line height 0.95" is a decision.

## 2. The spec format (10 sections)

Write it as `SPEC.md` in the project's work folder (`work/<project>/SPEC.md`), not in `site/`. The headings below are
what `spec-lint.mjs` looks for.

### 2.1 Goal and story

- One sentence: product, page type, the one thing it does.
- The idea in two lines: what is the narrator or metaphor, what plays the "camera".
- **A beat table**: `# | Beat | Visitor sees | Visitor feels`. 4-7 beats. Each beat becomes a section or a moment.
- Draft copy for every beat, real words. Lorem ipsum hides layout problems (a three-word title and a nine-word title
  are different layouts).

### 2.2 Stack and setup

- Libraries **with versions** and why each is needed; "nothing else" written out, so no one adds a slider library later.
- The folder layout as a tree with one line per file saying what lives there.
- Desktop and phone files (`index.html` + `m.html` in this repo), where tokens live, where motion constants live.
- Page title and meta description.

### 2.3 Design tokens (all as tables)

| Token group | Must contain | Example line |
|---|---|---|
| Scale | the design frame and unit for desktop **and** phone | `--u: min(100vw / 1440, 100svh / 900)`; phone `min(100vw / 390, 100svh / 844)` |
| Colours | name, hex, role, contrast on the background | `pine #1E3530 all text 11.1:1` |
| Type | style, font, size desktop / phone, weight, tracking, line height | `Body, Inter Tight, 17 / 16, 400, 0, 1.5` |
| Spacing | page edge, header, gaps, widths, radii, desktop / phone | `page edge 40 / 20` |
| Motion | named easings as cubic-bezier, durations in ms, stagger, reduced-motion behaviour | `--ease-settle cubic-bezier(0.22, 1, 0.36, 1)` |

House rules that the lint enforces: no `#000000`, no purple or violet hue (255-320 deg), no decorative gradients.
Colours come from [`colour-systems`](../colour-systems/), type from [`typography-premium`](../typography-premium/),
spacing from [`layout-grid-spacing`](../layout-grid-spacing/), motion from
[`motion-and-scroll-storytelling`](../motion-and-scroll-storytelling/).

### 2.4 Assets

One table: `Asset | URL | Use | Licence | Status`. Every row has a real source URL (or "built in code, Zyqor Studio")
and a licence that is on the repo's allow-list. Licences are checked **now**, not at the end
([`asset-sources-and-licence-check`](../asset-sources-and-licence-check/); `licence-probe.mjs` fills the row for
Commons, Poly Haven and ambientCG). No AI images; if the right photo does not exist, the spec says what will be built
instead.

### 2.5 Layout, section by section

- Start with **structure and layering**: the DOM order, what is fixed, what is pinned, z-index of the canvas versus copy.
  Most "the text is behind the 3D" bugs are a layering decision nobody wrote down.
- Then one sub-heading per section, with positions in design pixels for desktop **and** phone: where the title's cap
  top sits, column x and width, where the hero object sits, what moves out of the way on phone.
- Phone is recomposed, not shrunk ([`responsive-phone-pc-parity`](../responsive-phone-pc-parity/)): same content,
  same object, different arrangement.

### 2.6 The hero / 3D element in detail

A part table: `Part | Geometry or file | Size | Material`. For 3D: units, the axes, renderer settings (tone mapping,
exposure, colour space, pixel ratio), environment, lights with numbers, named poses, render-on-demand, the
no-WebGL poster. For a video hero: source, encode settings, desktop and phone cuts
([`scroll-video-hero`](../scroll-video-hero/)). For a configurator: every layer and its order
([`interactive-product-configurator`](../interactive-product-configurator/)).

### 2.7 Scroll timeline

A table per section: `Section | Progress (0-100 %) | What moves | Ease`. Include the intro (time-based) and every
pinned stretch. If two things move in the same range, both are listed. This is the table that keeps motion from
being "added later".

### 2.8 Storyboard

The list of 4-8 frames: `Frame | File | Shows`. File names `sb_01.png ... sb_08.png` plus `storyboard.jpg` (contact
sheet). Method in section 4.

### 2.9 QA checklist

Copy [`docs/QA_CHECKLIST.md`](../../docs/QA_CHECKLIST.md) and add the checks specific to this page (the dial works by
keyboard, the poster matches the first frame, and so on).

### 2.10 Review gate

Who approves, what they were sent, their answer and the date, and what changed because of it.

## 3. Choosing each thing "one by one, the best one"

For each decision below, make 2-3 real options, put them side by side **at real size with the real copy**, pick one,
and write one line in the spec saying why. The "why" line is what stops a later change on a whim.

| Decision | Options to compare | How to judge | Write in the spec |
|---|---|---|---|
| Idea / narrator | 3 one-sentence ideas ("[product] as [thing]") | which one gives every section a job | the beat table |
| Palette | 3 palettes of 3-5 colours, each tested with the hero image | contrast numbers; does the product look best on it; no black/purple/gradient | colour table with contrast |
| Display font | 3 OFL families set in the real title at desktop and phone size | does the title fit in 2 lines at 390 px; does it match the product's material | type table + "why these" line |
| Text font | 2 families at 16-17 px in a 380 px column | reads easily for 3 paragraphs; numerals look right (`tnum`) | type table |
| Hero object | build in code vs CC0 model vs photo | which reads as the real product at 390 px and at 1440 px | part table |
| Hero pose / camera | 3 angles rendered as stills | silhouette is clear at thumbnail size | pose numbers |
| Motion character | 2 easing sets on the same 2-second test | does it feel like the product (heavy brass settles, a sneaker snaps) | motion table |
| Layout of each section | 2 sketches per section | the eye goes title -> object -> action, in that order | section positions |

Rules while choosing:
- Compare on the page colour and at phone width, never on a white artboard only.
- One decision at a time, starting with the idea, then the palette and type, then layout, then motion. Motion chosen
  before layout gets thrown away.
- Borrow techniques from teardowns ([`award-site-teardown-method`](../award-site-teardown-method/)), never someone's
  copy, code, prompt, layout values or assets.

## 4. The storyboard (4-8 stills before code)

The storyboard is a set of finished-looking frames of the most important moments, made with the **real** fonts,
colours, assets and (for 3D) the real model. It is not a sketch and not an AI mock-up. If a frame cannot be made,
the spec is not done.

How to make the frames (pick one):

1. **3D scenes (fastest for this repo):** write a scratch `storyboard.html` that loads only the model/scene code from
   the spec, sets each named pose, and overlays the copy in HTML with the real fonts. Screenshot each pose at 1440 x 900
   and 390 x 844 with the repo's headless screenshot script (one browser at a time). These scratch files later become
   the real page's `lamp.js` or equivalent, so nothing is wasted.
2. **Photo or 2D pages:** compose each frame in an HTML file with the real assets and tokens, or in a layout tool with
   the real files; export PNG.
3. **Animations (logo reveals, reels):** render stills from the real SVG paths at the key times (for example with
   resvg or a canvas script), at the output's aspect ratio (9:16 for a reel).

Which frames: the first thing the visitor sees, the end of the intro, one frame per main section at its strongest
moment, the final call to action, and one phone frame of the hardest section. 4 is the minimum, 8 the maximum; more
than 8 means the story has too many beats.

Contact sheet: put all frames on one image (`storyboard.jpg`), 3-4 per row, with the frame number, section name and
timecode or scroll % under each. This is the one picture the client actually looks at on a phone.

Look at every frame yourself at 100 % and at phone size. Ask: is the product clear in one second? Is the text
readable? Would a stranger believe this is a real product? Fix the spec, re-render, repeat.

## 5. The review gate

Nothing is built until the owner (for a concept) or the client says yes to the storyboard.

What to send (one message, readable on a phone):
1. `storyboard.jpg`;
2. a palette + type card (one image);
3. five to seven lines: the idea in one line, then one line per beat;
4. one question that is easy to answer: "theek hai? phir build shuru" / "Good to build, or change anything?"

Then:
- Write the answer and the date into section 10 of the spec, word for word.
- Apply the changes **to the spec first**, re-render only the frames that changed, and send those.
- A "yes" covers the spec as sent. Anything new later (a new section, a new effect) goes through a small gate again.
- For client work the gate is also the scope: the approved spec is what the price covers
  ([`client-delivery-kit`](../client-delivery-kit/)).

## 6. Time budget

| Site size | Spec | Storyboard | Review | Build |
|---|---|---|---|---|
| One-page concept | 45-90 min | 30-60 min | same day | 3-6 h |
| Premium product page with 3D | 2-3 h | 1-2 h | 1 round | 1-2 days |
| Client site, 5+ pages | half a day | 2-3 h (home + one inner page) | 1-2 rounds | per quote |

Spending 20-30 % of the time before code is normal. It is what makes the build fast.

## 7. Common mistakes and the fix

| Mistake | What it causes | Fix |
|---|---|---|
| Adjectives instead of numbers ("big title", "warm colours") | the builder guesses; every guess is a redo | write the size, weight, hex, ms |
| Phone left for "later" | phone becomes a squashed desktop | a phone position for every section, in the spec |
| Assets "to be found" | a late hunt ends with a weak photo or an unlicensed one | assets table filled and verified before the gate |
| Storyboard drawn by hand or generated | the client approves a picture the build cannot match | frames from the real assets and model only |
| Motion added after the build | it fights the layout; janky pins | scroll timeline table in the spec |
| No "why" line on choices | the next person changes the font on a whim | one "why" line per decision |
| Building while waiting for the yes | work is thrown away when they ask for changes | wait, or work on the next project's spec |
| Copying a reference's spec, values or prompt | not ours; looks fake when the client sees the original | take the technique, write our own numbers |

## 8. Checklist (before the review gate)

- [ ] goal sentence, beat table and real draft copy for every beat
- [ ] stack with versions, folder tree, title and description
- [ ] token tables: scale (desktop + phone), colours (hex, role, contrast), type (size, weight, tracking, line height),
      spacing, motion (cubic-bezier, ms, reduced motion)
- [ ] no black, no purple, no decorative gradients
- [ ] assets table: URL, use, licence on the allow-list, status verified; no AI images
- [ ] structure + layering, then every section with desktop and phone positions
- [ ] hero/3D part table with sizes, materials, renderer, light, poses, fallback
- [ ] scroll timeline table for every section, intro included
- [ ] 4-8 storyboard frames from real assets + contact sheet, looked at at phone size
- [ ] QA checklist copied and extended
- [ ] `node scripts/spec-lint.mjs SPEC.md` prints READY
- [ ] sent to the owner/client; answer and date written into the spec

## Files

- `example/SPEC-halyard-arc.md`: a full spec for a fictional brass desk lamp (story, stack, tokens, assets with
  verified CC0/OFL sources, five sections with desktop and phone positions, the lamp part by part, the scroll timeline,
  six storyboard frames, QA, review gate). It passes the lint.
- `scripts/spec-lint.mjs`: checks a SPEC.md for the 10 sections, numeric tokens (scale unit, 3+ hex colours, weight,
  tracking, line height, cubic-bezier and durations, spacing), the palette rules, asset rows with URL and licence,
  3+ laid-out sections with desktop and phone positions and layering, a scroll timeline, 4-8 storyboard frames, no
  lorem ipsum, no fake social proof. `node scripts/spec-lint.mjs SPEC.md [--json]`; exit 0 = READY, 1 = gaps.

## Sources

- Sujon Hoque's process rule, WhatsApp, 30 Oct 2026 2:31 PM IST (spec + storyboard before any work).
- The P041 Hotcoal Kitchen rebuilds, 30 Oct 2026 (repo commits d5dc6e0, 3486d98, 8cbdb89, 6caaecf) as the reason for
  the rule.
- WCAG 2.2 contrast thresholds (4.5:1 body text, 3:1 large text and graphics): w3.org/TR/WCAG22.
- Asset licences as checked in `asset-sources-and-licence-check` (Poly Haven and ambientCG CC0; Google Fonts OFL).
