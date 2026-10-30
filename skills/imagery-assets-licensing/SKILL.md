---
name: imagery-assets-licensing
description: Finding, licensing, crediting and treating real images, video, 3D, icons, fonts and animations for premium websites - the free-source table with each licence's edges, the "unclear means skip" rule, credit files that pass the repo's credit gate, photo direction and consistent grading in the site's palette, crops for desktop and portrait, knockouts that keep contact shadows, own renders instead of AI images, icon and Lottie rules, and what never goes on a page (AI mentions, brand logos, recognisable people without release). Scripts write and validate credit files and cut product knockouts.
when_to_use: "find images for the site", "is this free to use", "credit / attribution", "licence", "stock photo", "hero photo", "make the photos look consistent", "remove background", "icons", "Lottie animation", any time an outside asset is added to a page
license: MIT (text and code). The demo's photos are CC0 (credited in CREDITS.md).
version: 1.0.0
---

# Imagery, assets and licensing

Two of Sujon's standing rules shape every asset decision:

- **Real, not decoration**: *"Real product photos/footage, not code-drawn visuals"*; *"Fake decorative graphics ki
  jagah: Real UI screenshots, Actual product workflow, Before/after..."* (his checklist). No AI renders, no AI images.
- **Credit everything, free only**: *"Koi bhi code/asset copy karne se pehle owner page ya repo me licence dekho.
  Paid, Pro ya unclear ho to skip. Source ka naam aur licence project notes me likho."* And: *"Agar licence unclear
  ho: Copy mat karo."*

```
what does the story need to SHOW? (section 1) -> source by type (2) -> read the licence + its edges (3)
   -> write the credit file (4) -> direct and grade into the palette (5-6) -> crop for 1440 and 390 (7)
   -> compress (performance skill) -> visible credits page (4) -> pre-ship scan (11)
```

`scripts/credit.mjs` writes a credit file next to an asset (`new`) and validates every asset in a folder against the
same rules as the repo's gate (`check`). `scripts/knockout.py` removes a flat background from a product shot by a
border-connected flood fill, so same-coloured areas inside the object survive and the contact shadow stays.
`examples/index.html` shows the treatments on two real CC0 photos.

---

## 0. Desktop first, no compromise

1. **Source at the largest size available** (Poly Haven 8K, Unsplash full resolution, museum TIFFs), so the desktop
   hero holds at 2x on a 1440-1920 screen and survives a close-up crop.
2. **Grade once at full resolution**, then export the size set (performance skill §3).
3. **Desktop gets the wide composition**: landscape crops, full-bleed heroes, detail crops for close-up chapters.

### Phone parity

- **The same photographs**, re-cropped for portrait (subject placed for 9:16 or 4:5), never a different, cheaper photo.
- Same grade, same grain; `<picture>` serves the portrait crop (responsive skill §7).
- Icons and line art as SVG: identical on both.

---

## 1. Decide what the page must show

| The story needs | Use | Never |
|---|---|---|
| The product itself | client photos, a real scan or model rendered by us (threejs skill) | AI renders, code-drawn product shapes |
| How it is used | real photos of the action, a screen recording of the real UI | stock "people smiling at laptops" |
| The place | photos of the real place, or CC0 location photography that matches it | generic city skylines |
| Craft / material | macro photos, real textures (Poly Haven, Wikimedia) | gradients pretending to be material |
| Proof | real client logos and words with permission | invented logos, testimonials, metrics (copywriting skill) |
| Mood only | one strong photo, or nothing | blobs, orbs, particles, noise meshes |

For a fictional concept site, use real photographs of real things (CC0/CC-BY), with labels painted out and the
fictional brand added in the layout, never "fake product" renders.

---

## 2. Free sources by asset type (and what each licence allows)

| Type | Source | Licence | Edges to check |
|---|---|---|---|
| Photos | Unsplash | Unsplash License | free commercial use; **does not cover trademarks, logos or recognisable people**; no selling unaltered copies; no building a competing service |
| Photos | Pexels | Pexels License | same shape as Unsplash; identifiable people/brands need care |
| Photos, scans | Wikimedia Commons | per file (CC0, CC BY, CC BY-SA, PD) | read the file page; BY needs attribution, BY-SA needs share-alike on the image |
| Photos, 3D | Smithsonian Open Access | CC0 where marked | only items marked CC0 |
| Photos | NASA | public domain (with exceptions) | no NASA logo use implying endorsement; some images are third-party |
| HDRIs, textures, models | Poly Haven | CC0 1.0 | none; credit as courtesy |
| Models | Khronos glTF Sample Assets | per model | exclude non-free ones (threejs skill §2) |
| Video | Mixkit | Mixkit Stock Video Free License | free for commercial use in projects; **no redistribution as stock**; review per Sujon's gate |
| Video | Pexels / Pixabay video | their licences | same edges as photos |
| Icons | Phosphor (MIT), Tabler (MIT) | MIT | keep the licence text; **never Lucide** (his list) |
| Fonts | Google Fonts (OFL), Fontshare (ITF FFL, read each font) | OFL / ITF | self-host; Fontshare fonts have per-font terms (typography skill §8) |
| Animations | LottieFiles free items | per item (Lottie Simple License for free items) | *"IconScout name alone is not proof of free use"*; skip anything Pro |
| Code | GitHub repos | per repo | no licence file = all rights reserved = do not copy |

**Never**: paid/Pro items, "free for personal use" assets on client work, images found through image search, assets
from other agencies' sites, AI generators.

---

## 3. The licence rules (with reasons)

| # | Rule | Why |
|---|---|---|
| IM-R1 | Read the licence on the **owner's page** before downloading | his rule; aggregators mislabel |
| IM-R2 | **Unclear, paid, Pro or missing licence = skip** (write it yourself or find an MIT/OFL/CC0 alternative) | Drive H8 |
| IM-R3 | For mixed libraries, **only the free part**, with attribution | Drive H9 |
| IM-R4 | **Crop out or paint out logos, labels and trademarks** on photos and scans | Unsplash licence edge (Drive H10); MA Part C's replacement skincare photo shows a printed label |
| IM-R5 | **No recognisable people** in commercial contexts without a model release; prefer hands, backs, distance | licence edges; privacy |
| IM-R6 | CC BY / BY-SA: **visible attribution on the page that uses it** (author, title, source, licence) | the licence; the repo gate checks it by author-name match |
| IM-R7 | **No AI images, no AI renders, no "AI" wording** anywhere (pages, alt text, credits) | his rules (Drive H4, R-real) |
| IM-R8 | Every asset gets a **credit file** at the moment it is added | his credit rule (28 Oct 2026); afterwards nobody remembers the source |

---

## 4. Credit files and the credits page

The repo's gate (`tools/credits-check.mjs`) requires `<asset>.credit.json` next to every asset (or one `credit.json`
for a folder holding one asset), with these keys, all non-empty:

```json
{
  "title": "Salt-crystals",
  "author": "Nate Steiner",
  "author_url": "https://www.flickr.com/photos/44124484443@N01/",
  "source_url": "https://commons.wikimedia.org/wiki/File:Salt-crystals.jpg",
  "licence": "CC0 1.0",
  "licence_url": "https://creativecommons.org/publicdomain/zero/1.0/",
  "attribution": "\"Salt-crystals\" by Nate Steiner, via Wikimedia Commons, CC0 1.0",
  "changes": "cropped, resized, converted to WebP",
  "downloaded": "2026-10-28"
}
```
Allowed licences (Sujon, 28 Oct 2026): CC0 1.0, CC BY 4.0, CC BY 3.0, SIL OFL 1.1, MIT, Apache 2.0, Public domain
(NASA | Smithsonian); Unsplash/Pexels only with `"verified": true` after checking the photo page; ITF FFL, Mixkit,
CC BY-SA, CC BY 3.0 US and own work are "review" licences.

```bash
node scripts/credit.mjs new img/salt.webp --title "Salt-crystals" --author "Nate Steiner" --author-url ... \
  --source https://commons.wikimedia.org/wiki/File:Salt-crystals.jpg --licence "CC0 1.0" --changes "cropped, WebP"
node scripts/credit.mjs check site/          # same rules as the repo gate; exits 1 on any missing/invalid credit
```

Every site has a **visible credits section or page** listing each asset (title, author, source link, licence), plus
fonts and code libraries. CC BY attributions also sit near the asset if the licence asks for it.

---

## 5. Photo direction (what makes a photo premium)

- **One light logic** across all photos (soft window light, or hard sun, not both), matching the 3D and DOM light.
- **Restraint in subject**: one subject, negative space where the type will sit (plan it in the crop).
- **Texture and detail**: macro crops of material for close-up chapters (Drive H2: *"Product ke important features ke close-ups"*).
- **Colour fits the palette**: pick photos whose dominant hues are near the site's three colours, then grade (section 6).
- **No stock clichés**: handshakes, laptops on beaches, smiling call-centre staff, light bulbs, chess pieces.

---

## 6. Grading into the palette

Grade all photos the same way so they read as one shoot:

| Treatment | How | When |
|---|---|---|
| Unified grade | the same curve + saturation in an editor, or CSS `filter: saturate(.85) contrast(1.05) sepia(.08)` | always (subtle) |
| Duotone in the palette | grayscale, then map shadows to ink and highlights to canvas (`mix-blend-mode` or SVG `feColorMatrix`) | editorial sites, many mixed sources |
| Grain | the page's own grain layer over images (colour skill §7), 3-6% | when the site uses grain |
| Warm/cool split | warm highlights, cool shadows, matching the key/rim light | product and interiors |

```html
<svg width="0" height="0" aria-hidden="true"><filter id="duo"><feColorMatrix type="matrix"
  values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 1 0"/><feComponentTransfer>
  <feFuncR type="table" tableValues="0.09 0.95"/><feFuncG type="table" tableValues="0.20 0.93"/><feFuncB type="table" tableValues="0.18 0.88"/>
</feComponentTransfer></filter></svg>
<img src="photo.webp" style="filter:url(#duo)" alt="...">
```
The `tableValues` are the ink and canvas colours as 0-1 channels (here ink #17332E -> canvas #F2EDE0). Grade
destructively (in the file) for heroes so the browser does no work; CSS filters are fine for small images.

---

## 7. Crops for desktop and phone

- Desktop hero 16:9 or 21:9 (full-bleed) with the subject on a third and room for type.
- Phone hero 4:5 or 9:16 with the subject in the upper half and copy below (responsive skill §6).
- Set `object-position` per crop when one file serves both (`object-position: 62% 40%`), or export two files.
- Never crop through faces, hands or product edges; leave the object's full silhouette when it is the hero.

---

## 8. Knockouts (product on the page colour)

`scripts/knockout.py` (pure Pillow) removes a flat background connected to the image border while keeping
same-coloured areas inside the object (a cream product on a cream sweep) and the soft contact shadow, then softens
the edge with a 1.4 px blur. Approach from scroll-world's `knockout.py` (MIT), re-implemented here.

```bash
python3 scripts/knockout.py product.jpg product.png --tolerance 18 --keep-shadow
```
Use it on our own renders or CC0 photos shot on a plain sweep. Complex hair/fur/glass needs a manual mask.

---

## 9. Own renders instead of AI images

When no photo exists, **render the real model** (Poly Haven / client CAD) in three.js or Blender with the site's light
rig and save stills (the components' `scroll-3d-stage/poster.webp` is a CC0 model rendered by us, credited as
"render by Zyqor Studio" with the model's author). This is how posters, fallbacks and OG images are made.

---

## 10. Icons, Lottie and video

- **Icons**: Phosphor or Tabler (MIT) subset, or custom SVG; one stroke width (1.5 px at 24 px) site-wide; never
  Lucide, never emoji, no sparkles, arrows only as a static "opens in new tab" mark (Drive H13).
- **Lottie**: free LottieFiles items only, recoloured to the palette, played on click (micro-interactions), never looped.
- **Video**: Mixkit / Pexels / client footage; re-encode (performance skill §4); remove audio unless it is the brand;
  credit like a photo.

---

## 11. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Sources | good CC0/Unsplash photos, credited | curated set with one grade, portrait crops | client shoot or real scans/renders, art-directed, macro chapter |
| Treatment | unified subtle grade | grade + duotone or grain system | full grade pipeline, knockouts, own renders for posters |
| Credits | credits section | credits page + credit files | credits page, credit files, licence notes per asset in the handover |

---

## 12. Do and don't

| Do | Because |
|---|---|
| Show the real product, place and people's hands at work | his "real, not decoration" rule |
| Write the credit file the moment the asset arrives | the gate and the handover need it |
| Paint out logos and labels | licence edges |
| Grade every photo into the palette | one shoot, one site |
| Render a real model for posters and OG images | real, credited, no AI |

| Don't | Because |
|---|---|
| Use AI images or say "AI" anywhere | his rule; it reads cheap |
| Copy from a repo or site without a licence | all rights reserved by default |
| Use "personal use only" assets on client work | licence breach |
| Use recognisable people without a release | privacy, licence edges |
| Use Lucide, emoji, sparkle icons | his avoid list |

---

## 13. Pre-ship checklist

- [ ] `node scripts/credit.mjs check site/` (or `node tools/credits-check.mjs`) passes.
- [ ] Every CC BY asset credited visibly on the page that uses it.
- [ ] Logos, labels, trademarks removed; no recognisable people without release.
- [ ] No AI images, no "AI" in copy, alt text or credits.
- [ ] One grade across all photos; portrait crops exist for full-bleed media.
- [ ] Icons from one MIT set or custom; no Lucide/emoji/sparkles.
- [ ] Alt text written for every meaningful image (accessibility skill); decorative images `alt=""`.
- [ ] Credits page lists photos, video, 3D, fonts and code libraries.

## 14. Files

| File | What |
|---|---|
| `scripts/credit.mjs` | `new` writes `<asset>.credit.json` with the gate's keys; `check <dir>` validates every asset against the allow-list (exits 1 on failure) |
| `scripts/knockout.py` | border-connected flood-fill knockout (Pillow), keeps inner same-colour areas and the contact shadow, soft edge |
| `examples/index.html` | grade, duotone, grain, art-directed crops and a credits block on two real CC0 photos; self-tests |

## Sources

- Sujon Hoque (Zyqor Studio): credit rule and licence allow-list (28 Oct 2026), real premium assets only and no AI (27 Oct 2026), WhatsApp 30 Oct 2026 ("PC me no compromise").
- Sujon's Drive: *web-design-promo-checklist.txt* ("Real product visuals"); *DESIGN-LIBRARY-INDEX.md* §1, §5; *Master-Award-Website-Guide-Improved-v4.2* Part C (Unsplash licence, replacement photo), Part F items 13-14 (free only, licence before copying, icons); *Website-Building-Guide-New-Site.md* §2, §5b, §8; *lottie-icon-click-animation-note.txt*; *Master Motion Graphics Video Creator* §17.
- Drive points T8, I11, H2, H4, H8, H9, H10, H13 (`docs/beast/SKILLS_SOURCE_MAP.md`).
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: `knockout.py` border-connected flood fill (T23), approach re-implemented.
- Licences read: Unsplash License (unsplash.com/license), Pexels License (pexels.com/license), Creative Commons licence deeds (CC0 1.0, CC BY 4.0, CC BY-SA 4.0), Mixkit licence (mixkit.co/license), Poly Haven licence (CC0), Phosphor and Tabler (MIT), SIL OFL 1.1, Smithsonian Open Access terms, NASA media usage guidelines.
- Repo tool: `tools/credits-check.mjs` (the credit gate).
