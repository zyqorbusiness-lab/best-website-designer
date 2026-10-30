---
name: asset-sources-and-licence-check
description: Where to get real, free photos, textures, HDRIs and 3D models for premium sites (Wikimedia Commons, Poly Haven, ambientCG, Smithsonian Open Access, Sketchfab with licence filters, Openverse, Pexels and Unsplash), how to prove an asset's licence before it touches the repo, the credit format the repo's gate reads, and how CC BY attribution has to appear on the page. Includes scripts/licence-probe.mjs, which reads the licence from Commons, Poly Haven and ambientCG's own APIs and prints a credit.json draft.
when_to_use: before downloading any photo, texture, HDRI, model, video or font; when a client sends "an image from Google"; when tools/credits-check.mjs fails; when filling the assets table of a site spec (build-spec-and-storyboard)
license: MIT (text and code). Licence facts are summarised from each source's own licence page, listed under Sources.
version: 1.0.0
---

# Asset sources and licence check

Real photos and real models are what make a concept read as a real product. They are also the easiest way to get a
client a takedown letter. This skill is the short path: **find it on a source with a clear licence, prove the licence
on the asset's own page, write the credit file, show the credit where the licence asks for it.** Nothing goes into
`site/` or `skills/` without passing `node tools/credits-check.mjs`.

Two rules sit above everything here:

1. **No AI-generated images, ever.** Not for heroes, not for textures, not "just as a placeholder". They look generic,
   their legal status is unsettled, and Sujon's clients are paying for real. If no real photo exists, build the thing
   (three.js from primitives, a CC0 model, a photographed object) or design around it with type and colour.
2. **Unclear means skip.** If you cannot point at the licence line on the asset's own page, you do not have a licence.

This skill is the sourcing and checking half. Photo direction, grading into a palette, crops and knockouts live in
[`imagery-assets-licensing`](../imagery-assets-licensing/); 3D optimisation in
[`model-optimisation-phone`](../model-optimisation-phone/) and [`threejs-3d-premium`](../threejs-3d-premium/).

---

## 1. Where to look, by asset type

Start with the source that has the narrowest, clearest licence. CC0 sources first, then CC BY, then the platform
licences (Unsplash, Pexels) that need a per-photo check.

| Need | First choice | Licence there | Watch out for |
|---|---|---|---|
| HDRI (lighting for 3D) | [Poly Haven](https://polyhaven.com/hdris) | CC0, every asset | none; pick the resolution you need (1k/2k for web, 4k only for a hero reflection) |
| PBR textures (wood, marble, metal, fabric, paper) | [ambientCG](https://ambientcg.com/list), [Poly Haven textures](https://polyhaven.com/textures) | CC0, every asset | download the 1K or 2K JPG set, not 8K; ambientCG ids look like `Marble012`, `Wood066`, `Metal034` |
| 3D models, simple and clean | [Poly Haven models](https://polyhaven.com/models), [Kenney](https://kenney.nl/assets), [Quaternius](https://quaternius.com/) | CC0 | game-style models need a material pass to look premium |
| 3D models, specific objects | [Sketchfab](https://sketchfab.com/search?features=downloadable&type=models) with the licence filter | per model: CC0, CC BY, CC BY-SA, CC BY-ND, CC BY-NC, or paid Standard/Editorial | only CC0 and CC BY pass the gate as-is; CC BY-SA is flagged for review; ND, NC, Standard, Editorial: skip |
| Photos of real things (food, objects, places, animals, buildings) | [Wikimedia Commons](https://commons.wikimedia.org/) | per file: CC0, CC BY, CC BY-SA, public domain | read each file page's licence box; check for people (personality rights) and logos (trademarks) |
| Museum objects, specimens, historical photos | [Smithsonian Open Access](https://www.si.edu/openaccess) | CC0 where the item shows the CC0 mark | many items are NOT CC0; only use the ones marked; the API needs a free api.data.gov key |
| Search across CC sources at once | [Openverse](https://openverse.org/) | shows each item's licence | it is a search engine: always open the original page and read the licence there |
| Lifestyle / mood photos | [Unsplash](https://unsplash.com/), [Pexels](https://www.pexels.com/) | their own licences (free use, no attribution required) | Unsplash+ photos are paid; recognisable people, brands and artworks can still need permission; the gate wants `"verified": true` |
| Space and earth imagery | [NASA Image and Video Library](https://images.nasa.gov/) | generally not copyrighted | NASA logos/insignia are restricted; some images on NASA sites are third-party; record as `Public domain (NASA)` |
| Fonts | [Google Fonts](https://fonts.google.com/) | mostly SIL OFL 1.1 | check each family's licence tab; Fontshare's ITF Free Font License is flagged for review by the gate |

Search tips that save an hour:
- Commons: search in English and in the object's home language (`pizza margherita`, `Neapolitan pizza`), then open
  the **category** page of a good hit: categories hold the same object shot many ways.
- Commons: add `filetype:bitmap` and sort by resolution in the search options; anything under 1600 px wide is too small
  for a desktop hero.
- Sketchfab: Search -> Downloadable -> Licence. Sort by "Most liked" inside a narrow query ("brass desk lamp", not "lamp").
  Open the model page and read the licence under the description; the search filter is a hint, the page is the proof.
- Poly Haven and ambientCG names are stable: the same id gives the same asset next year. Put the id in the spec.
- For a product that does not exist (every concept), build the product in 3D and photograph the *context* (desk,
  table, kitchen) from CC0 sources. Do not hunt for a "photo of a product like ours".

## 2. What each licence lets you do

| Licence | Commercial client site | Must credit | Can modify | Repo gate |
|---|---|---|---|---|
| CC0 1.0 | yes | no (we credit anyway) | yes | PASS |
| CC BY 4.0 / 3.0 / 2.0 | yes | yes, visibly, with title, author, source, licence; say if you changed it | yes | PASS, plus visible-attribution check |
| CC BY-SA | yes, but your adapted asset must carry CC BY-SA too | yes | yes, under the same licence | REVIEW (fails unless `--allow-flagged`) |
| CC BY-ND | only unmodified; a crop or recolour can count as a modification | yes | no | FAIL |
| CC BY-NC | no: a client site and a studio portfolio are commercial | yes | yes | FAIL |
| Public domain (USDA, NASA, Smithsonian, author release) | yes | no (we credit anyway) | yes | PASS when written exactly as the gate spells it |
| Unsplash / Pexels licence | yes, not as a bare resale or stock-competitor use | no (we credit anyway) | yes | PASS only with `"verified": true` |
| SIL OFL 1.1 (fonts) | yes | keep the licence with the font files | yes, rename if modified | PASS |
| "Free for personal use", "Royalty free" with no licence text, Pinterest, Google Images, Behance shots | no | n/a | n/a | FAIL: skip |

"Commercial" in plain words: if the page helps anyone make money (a client's site, Sujon's portfolio that sells his
work), it is commercial. NC licences are out for all of it.

## 3. How to verify a licence (5 minutes per asset, written down)

Do this **before** the download, and save what you saw.

1. **Open the asset's own page**, not a search result or a blog that embedded it. For Commons, the `File:` page; for
   Sketchfab, the model page; for Unsplash, the photo page.
2. **Read the licence where the asset lives.** Commons: the licence box under "Licensing". Sketchfab: the licence line
   under the description. Poly Haven and ambientCG: the site licence covers every asset (CC0).
3. **Check the author really is the author.** On Commons, "own work" by an uploader who also uploaded film stills or
   magazine scans is a red flag. A Flickr import shows the Flickr review template; that is good.
4. **Look for extra restrictions.** Commons templates for personality rights, trademarks, or freedom-of-panorama notes;
   Smithsonian items without the CC0 mark; Unsplash photos with a visible brand front and centre.
5. **Run the probe** where an API exists, so the credit file is copied, not typed:

```bash
node skills/asset-sources-and-licence-check/scripts/licence-probe.mjs \
  "https://commons.wikimedia.org/wiki/File:Neapolitan_pizza_at_Trappica_(48701940197).jpg"
# -> prints a credit.json draft; stderr says: licence: CC BY 2.0 -> ON the allow-list, attribution required
node skills/asset-sources-and-licence-check/scripts/licence-probe.mjs https://polyhaven.com/a/studio_small_09 \
  --write site/assets/hdri/studio_small_09_1k.hdr
# -> writes studio_small_09_1k.hdr.credit.json (author Sergej Majboroda, CC0 1.0)
```

   Exit code 0 = on the allow-list, 2 = needs review or no API (Sketchfab, Unsplash, Pexels: it prints the manual
   checklist), 1 = error (no such file, network).
6. **Public domain on Commons** comes back as "Public domain (check which...)" on purpose: the gate only accepts the
   named kinds (`Public domain (USDA)`, `(NASA)`, `(Smithsonian)`, `(author release)`). Read the template on the page
   (for example PD-USGov-USDA-ARS or PD-self) and write the matching words.
7. **Write the date** you checked into `downloaded`. Licences can change later; what counts is what the page said
   when you took it.

Tested on 30 Oct 2026: the probe returned CC BY 2.0 (attribution required) for the Trappica pizza photo used in P041,
"Public domain" for Evan-Amos's pizza slicer (recorded in the repo as `Public domain (author release)` after reading
the page), CC0 for Poly Haven `studio_small_09` and ambientCG `Marble012`, and exit 1 for a file that does not exist.

## 4. The credit file (what tools/credits-check.mjs reads)

Every asset file under `site/` or `skills/` with an asset extension (`.jpg .png .webp .avif .svg .gif .glb .gltf .bin
.hdr .exr .ktx2 .mp4 .webm .mov .mp3 .ogg .wav .m4a .woff2 .woff .ttf .otf`) needs a credit, found in this order:

1. `<file>.credit.json` next to it (a split `x.glb.part1` uses `x.glb.credit.json`);
2. one `credit.json` in the asset's folder (for a folder that holds one asset, such as a frame sequence; if it lists
   `files`, the asset must be in that list);
3. for glTF companions (`.bin`, textures) named inside a `.gltf`, that `.gltf`'s credit file.

All nine keys must be present and non-empty:

```json
{
 "title": "Marble 012",
 "author": "ambientCG",
 "author_url": "https://ambientcg.com/",
 "source_url": "https://ambientcg.com/view?id=Marble012",
 "licence": "CC0 1.0",
 "licence_url": "https://creativecommons.org/publicdomain/zero/1.0/",
 "attribution": "\"Marble 012\" by ambientCG (https://ambientcg.com/view?id=Marble012), CC0 1.0.",
 "changes": "converted to luminance, re-tinted warm (Lab a* +1.5, b* +7.5), 2048 px WebP q82",
 "downloaded": "2026-10-30"
}
```

- `licence` must match the allow-list spelling exactly: `CC0 1.0`, `CC BY 4.0`, `CC BY 3.0`, `CC BY 2.0`,
  `SIL OFL 1.1`, `MIT`, `Apache 2.0`, `Public domain (NASA|Smithsonian|USDA|author release)`. Unsplash and Pexels
  pass only with `"verified": true`. ITF FFL, Mixkit, CC BY-SA, CC BY 3.0 US and own-work "All rights reserved" are
  flagged for review.
- `downloaded` is `YYYY-MM-DD`.
- `changes` is honest and specific. "Edited" is not a change log; "cropped to the disc, cut out with a colour mask,
  2048 px WebP" is.
- Your own renders and screenshots are credited too: author `Zyqor Studio`, licence `MIT`, and the attribution names
  any third-party photos visible in them (see `site/library/p/P041/poster.webp.credit.json`).

## 5. Credit on the page (CC BY needs visible text)

The gate fails a CC BY asset if the author's name and the words "CC BY" (or "Creative Commons") are not visible as
text on each page that uses it. Rules that keep pages passing and readable:

- Use the TASL order: **Title, Author, Source, Licence**, plus "changes" when you changed it:
  `"Neapolitan pizza at Trappica" by Bex Walton (Wikimedia Commons), CC BY 2.0, cut out and recoloured.`
- Put it in a small credits panel or footer line on the same page. A link to the concept folder's own page works when
  that page carries the full credit (CC BY 4.0 §3(a)(2) allows a link to a resource that holds the attribution).
- Link the title to the source and the licence name to the deed.
- Do not hide it with `display:none` or 1 px text: that fails the spirit of the licence and the gate reads text, not CSS.
- Keep a full list in the concept's `credits.json` and in the repo-wide `CREDITS.md` (`node tools/credits-build.mjs`).

## 6. Workflow for one site

1. In the spec's assets table, write each asset as `id | URL | use | licence | status` (status: candidate, verified,
   downloaded, credited). See [`build-spec-and-storyboard`](../build-spec-and-storyboard/).
2. Verify (section 3) and probe before downloading. Save the original in `work/<project>/src/` with the probe output.
3. Optimise into `site/...` (sizes from [`performance-desktop-max-and-mobile`](../performance-desktop-max-and-mobile/)).
4. Write `<file>.credit.json`; fill `changes` with what you actually did.
5. Add the visible line for any CC BY asset.
6. `node tools/credits-check.mjs` must print `"fail": 0`. Commit only then.

## 7. Common mistakes and the fix

| Mistake | What happens | Fix |
|---|---|---|
| Took a "free" image from Google Images or Pinterest | no licence at all; a client can get a takedown or an invoice | find the original source; if none, skip |
| Trusted Openverse/Sketchfab search filters | the filter was stale or the model was re-licensed | the asset's own page is the proof; screenshot the licence line |
| CC BY photo with the credit only in `credits.json` | gate FAIL: "CC BY attribution not visible" | add the visible TASL line on the page |
| Licence typed as `CC-BY 4.0` or `CC BY 4` | gate FAIL: not on the allow-list | copy the spelling from the probe output |
| A crop of a CC BY-ND photo | modification of a no-derivatives work | pick another photo |
| A Sketchfab model under "Standard" licence used in a public repo | paid licences rarely allow redistribution of the file | buy only for client sites where the file stays private, or use CC0/CC BY |
| Unsplash photo of a person used in an ad-like hero | personality rights can still apply | choose shots without recognisable faces, or get a release |
| A Commons "public domain" photo credited as just "Public domain" | gate FAIL | read the PD template and write `Public domain (author release)` etc. |
| Placeholder AI image "until we find a real one" | it ships | never put one in; use a flat colour block with the asset id written on it |

## 8. Do and don't

Do:
- prefer CC0 for anything you will cut, recolour or composite heavily;
- keep originals and probe output beside the source files, so a future audit takes minutes;
- credit CC0 and public-domain authors too: it costs one line and builds trust with clients;
- re-check Sketchfab and Unsplash pages on the day of a client handover.

Don't:
- use NC or ND assets anywhere in a client site or the portfolio;
- copy assets from a site you are studying (a teardown takes ideas, never files; see
  [`award-site-teardown-method`](../award-site-teardown-method/));
- use reference images a client sends (a magazine photo, a competitor's site) as assets: they are style references
  only, and the credit says so (`"licence": "Reference only"` lives in `credits.json`, never on a shipped file);
- use AI-generated images, upscales of copyrighted images, or "AI-cleaned" versions of someone's photo.

## 9. Checklist

- [ ] every asset traced to its own page; licence read there; date written
- [ ] licence on the allow-list, spelled exactly; Unsplash/Pexels marked `"verified": true` only after the photo page was read
- [ ] no NC, ND, Standard/Editorial, "personal use", Google/Pinterest images, AI images
- [ ] `<file>.credit.json` (or folder `credit.json`) with all nine keys; `changes` says what was done
- [ ] CC BY: author + licence visible as text on every page that shows the asset
- [ ] `node tools/credits-check.mjs` -> `"fail": 0`
- [ ] `CREDITS.md` rebuilt (`node tools/credits-build.mjs`)

## 10. Source by source: the fastest honest path

### Wikimedia Commons (photos of real things)

```bash
node skills/asset-sources-and-licence-check/scripts/commons-search.mjs "neapolitan pizza" --min 1600
#  3024x3024  CC BY 2.0   Bex Walton from London, England   https://commons.wikimedia.org/wiki/File:Neapolitan_pizza_at_Trappica_(48701940197).jpg
#  2252x1756  Public domain  [PD: name the kind] Stevemconst61   https://commons.wikimedia.org/wiki/File:Neapolitan_pizza.jpg
#  ... 26 of 40 hits shown (min width 1600px, gate-passing licences only)
```

- The search reads Commons' own API (`generator=search` in the File namespace, `filetype:bitmap`) and keeps only files
  at least `--min` px wide whose licence passes the gate. `--all` also shows CC BY-SA ([REVIEW]) and failing licences.
- Pick 3-5 candidates, open each page, look at the photo at 100 %: focus, noise, white balance, whether the light
  direction matches your other assets. A sharp 2000 px photo beats a soft 6000 px one.
- Then `licence-probe.mjs <File: URL> --write <asset>` for the one you keep.
- Download the original from the "Original file" link (the probe prints it). Never save the page preview.

### Poly Haven (HDRIs, textures, models; all CC0)

```bash
curl -s https://api.polyhaven.com/files/studio_small_09 | jq -r '.hdri["1k"].hdr.url'
# https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr   (1.6 MB)
curl -sLo site/assets/hdri/studio_small_09_1k.hdr "$(curl -s https://api.polyhaven.com/files/studio_small_09 | jq -r '.hdri["1k"].hdr.url')"
node skills/asset-sources-and-licence-check/scripts/licence-probe.mjs https://polyhaven.com/a/studio_small_09 \
  --write site/assets/hdri/studio_small_09_1k.hdr
```

- `api.polyhaven.com/info/<id>` gives the name, authors and type; `api.polyhaven.com/files/<id>` gives a download URL
  per resolution and format.
- Web sizes: HDRI 1k for lighting and soft reflections, 2k only when a polished surface reflects it in a close-up.
  Textures 1k (phone and most desktop), 2k for a surface that fills the screen.
- Credit the named author (the probe reads it from the API), even though CC0 does not ask for it.

### ambientCG (PBR textures; all CC0)

- Asset ids are stable (`Marble012`, `Wood066`, `Metal034`, `Paper002`, `Fabric026`); the page is
  `https://ambientcg.com/view?id=<id>`.
- Download the `1K-JPG` or `2K-JPG` zip, keep only the maps you use (colour, normal, roughness; skip displacement for
  the web), convert to WebP or KTX2.
- Re-tint into your palette instead of hunting for "the right colour" marble: P041 v3 converted Marble012 to luminance
  and tinted it warm (Lab a* +1.5, b* +7.5) so it would not read lavender next to tomato red.

### Smithsonian Open Access (museum objects, specimens)

- Search on si.edu/openaccess and filter to CC0, or use the API (`api.si.edu/openaccess/api/v1.0/search?q=...&api_key=KEY`,
  free key from api.data.gov).
- In the API record, use only items whose usage says CC0 (`content.descriptiveNonRepeating.metadata_usage.access`).
  Many items are shown but not CC0.
- Credit as `Public domain (Smithsonian)` only when the record says CC0 or public domain; otherwise skip.

### Sketchfab (specific 3D models)

1. Search with Downloadable on and a narrow query; open the model page.
2. Read the licence under the description. CC0 or CC BY 4.0: continue. CC BY-SA: only after review. Anything else: skip.
3. Check the triangle count and textures on the page: under ~100k triangles and 2k textures is a web-sized start.
4. Download glTF/GLB (signed-in account), optimise ([`model-optimisation-phone`](../model-optimisation-phone/)), and
   write the credit by hand with the exact model URL; the probe prints the manual checklist for Sketchfab.
5. CC BY: the author's name and "CC BY 4.0" go on the page that shows the model (the gate checks it).

### Unsplash and Pexels (mood and lifestyle photos)

- Free to use without credit under their own licences, but: no recognisable people in ad-like uses without care, no
  brands front and centre, and Unsplash+ photos are paid.
- Read the photo page and the photographer's page. Then write `"licence": "Unsplash License"` (or `Pexels License`)
  and `"verified": true` in the credit file; without `verified` the gate fails it on purpose.
- Credit the photographer anyway; it is good practice and clients notice.

## 11. When the right asset does not exist

This happens on every concept: the product is fictional. In order of preference:

1. **Build it.** A lamp, a speaker, a bottle or a keyboard can be built from primitives in three.js with real CC0
   textures and an HDRI (see the worked example in [`build-spec-and-storyboard`](../build-spec-and-storyboard/)).
2. **Use a CC0 model as a base and change it** (materials, proportions, colour) so it becomes the brand's product.
3. **Photograph context, not the product.** A CC0 desk, kitchen or street, with the product as a 3D render or a
   clean graphic.
4. **Design around it** with type, colour and layout. A strong typographic hero beats a weak photo.
5. **Never** an AI image, an "inspired" redraw of someone's product photo, or a screenshot of another brand's site.

## 12. Tiers: how much asset work each price level gets

| Tier | Asset work | Typical sources |
|---|---|---|
| Normal (from $300) | the client's own photos, cleaned and cropped; 1-3 licensed context photos; credits page | client, Commons, Unsplash/Pexels (verified) |
| Advanced | graded photo set in one light and palette, cut-outs, one CC0 texture system | Commons, ambientCG, Poly Haven |
| Premium | a built 3D product or configurator from real photo layers, HDRI lighting, every asset credited on page | Poly Haven, ambientCG, Sketchfab CC0/CC BY, own builds |

See [`premium-tiers-normal-advanced-premium`](../premium-tiers-normal-advanced-premium/) for the rest of each tier.

## Files

- `scripts/commons-search.mjs`: Commons search filtered to gate-passing licences and a minimum width (tested 30 Oct 2026:
  "neapolitan pizza" -> 26 of 40 hits kept; "marble countertop" --all marks CC BY-SA hits [REVIEW]).
- `scripts/licence-probe.mjs`: licence + credit draft from Wikimedia Commons, Poly Haven and ambientCG APIs; manual
  checklist for other hosts. Node 18+, no install. Exit 0 / 2 / 1 as described in section 3.
- The gate itself: `tools/credits-check.mjs` (repo root).

## Sources

- Creative Commons licence deeds and "Recommended practices for attribution" (TASL): creativecommons.org/licenses,
  wiki.creativecommons.org/wiki/Recommended_practices_for_attribution
- CC BY 4.0 legal code §3(a)(2) (attribution by link to a resource that carries it): creativecommons.org/licenses/by/4.0/legalcode
- Poly Haven licence (all assets CC0): polyhaven.com/license; API: api.polyhaven.com
- ambientCG licence (all assets CC0): ambientcg.com/license; API: ambientcg.com/api/v2/full_json
- Wikimedia Commons licensing and the imageinfo/extmetadata API: commons.wikimedia.org/wiki/Commons:Licensing,
  mediawiki.org/wiki/API:Imageinfo
- Smithsonian Open Access terms and API: si.edu/openaccess, edan.si.edu/openaccess/apidocs
- Sketchfab licences: sketchfab.com/licenses
- Unsplash licence: unsplash.com/license; Pexels licence: pexels.com/license
- NASA Images and Media Usage Guidelines (nasa.gov)
- The repo's credit gate: `tools/credits-check.mjs` (Sujon's credit rule, 28 Oct 2026)
