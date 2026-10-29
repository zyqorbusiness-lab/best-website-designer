# Worked example: cards -> filter -> brief

This is a real run from batch nb2 (2026-10-29), not a made-up example.

## 1. Draw ten cards

```
node tools/idea-matrix.mjs --seed 2910 --n 10
```

| # | category | material | motion | story | constraint card | verdict | why |
|---|---|---|---|---|---|---|---|
| 1 | Watchmaker | enamel | flip like a card | how it is made, step by step | Hand-made detail x3 | **drop** | No CC0 watch scan with separate parts was found; a code-made watch would be mistake 9.2. |
| 2 | Tailor | tin toy metal | peel a layer away | a sound you can see | Sound off | **drop** | "Sound you can see" fails the Sound off card as written; no tailor object that peels. |
| 3 | Nail Studio | linen | rotate a dial | the craftsperson's bench | One object | **drop** | Rotate a dial on a linen object has no real asset; would need a code-made prop as hero. |
| 4 | Spa | smoked glass with bubbles | slide on a rail | the first minute of using it | Slow down | **maybe** | Smoked glass is achievable (transmission) but no CC0 spa object; parked. |
| 5 | Guitar School | carbon weave | swing like a pendulum | a sound you can see | Macro first | **remix** | Guitar school + "a sound you can see" became N020 Chordline with the real Ukulele 01 scan (strings are the menu, Karplus-Strong pluck). The pendulum was dropped. |
| 6 | Knife Maker | graphite | slide on a rail | the craftsperson's bench | Real scale | **remix** | Knife maker + "slide on a rail" + "Real scale" fed A027 Cut & Grain (lengths measured from the Fish Knife scan). |
| 7 | Toy Shop | ice | reflection follows the pointer | a care guide that you play | Slow down | **drop** | Ice material on a toy has no honest asset; reflection-follows-pointer is already in N003. |
| 8 | Tile Maker | hammered brass | pour | a tiny museum of one object | One object | **drop** | Hammered brass "pour" needs a fluid sim the phone build would cut (mistake 9.3). |
| 9 | Bakery | chrome | reflection follows the pointer | the inside story (cross-section) | One verb | **drop** | Chrome bakery fails the "would a real brand ship this" test. |
| 10 | Knife Maker | glazed ceramic | assemble from parts | the inside story (cross-section) | Macro first | **keep** | Knife maker + "assemble from parts" + "Macro first": the Fish Knife scan has the blade and handle as separate meshes, so the exploded view is real geometry. Became A027. |

Ten cards, one keep, two remixes, one parked, six dropped. That ratio is normal: the filter (SKILL.md section 6) is
where the work is. The question that kills most cards is "which REAL CC0/CC-BY model carries this?".

## 2. The filter, applied to card 10

| question | answer |
|---|---|
| Real asset? | Poly Haven "Fish Knife" by Mateusz Sadek, CC0. Blade and handle are separate meshes. |
| Does the phone get the same thing? | Yes: one 488 KB GLB, same camera path; on phone the camera rolls 90 degrees so the long knife fits the tall screen (framing only). |
| Three hand-made details? | Lengths measured live from the scan; amber rim light on the edge only in chapter 01; the progress hairline is the scroll. |
| Distinct from the library? | First pinned exploded view of an object; A018 is a landscape descent. |
| Would a real knife maker ship it? | Yes: it is a product story (edge, parts, spine, together) with an order form. |

## 3. The brief that came out

See `site/library/a/A027/brief.md` in this repo: pitch, assets with licences, palette (#EFEEDA / #353F21 / #EAA21C,
palette-check PASS), phone and desktop frames, states, three details and the production shell, all written before the
first line of `app.js`.

## 4. The other six concepts of the same batch

| ID | name | where it came from |
|---|---|---|
| N020 | Chordline Music School | card 5, remixed |
| N025 | Bathtime Duck | inversion (section 4: toy shops show a grid, this is one duck in a bath) + "Thumb only" + "Data as decoration" |
| N048 | Ironbark Barbers | constraints "One verb" (swing) + "No cards" (the menu is a ring) on the Barbershop Chair 01 scan |
| N014 | Glint Eyewear | constraints "Wrong category" (an optician's chart wall as the layout) + "Data as decoration" on the Round Spectacles scan |
| A013 | Shelfline Ceramics | constraint "No cards" on four vase scans: a shelf, not a grid |
| P017 | Tapehead Hi-Fi | constraints "Data as decoration" + "Sound off" (the meter reads real audio, the page still works silent) on the Cassette Player scan |
