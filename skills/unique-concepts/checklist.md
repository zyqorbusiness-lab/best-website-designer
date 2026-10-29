# Unique-concept checklist (review in 5 minutes)

**Idea**
- [ ] One-sentence pitch with no colours or fonts
- [ ] Ten-second test passed by someone who did not see the brief
- [ ] Not the same mechanic as any concept already in the library
- [ ] Two constraint cards named in brief.md
- [ ] Three hand-made details named and visible on the page

**Assets**
- [ ] Hero is a real CC0 / CC-BY model or scan (or `--code-ok` with the search written down)
- [ ] `<asset>.credit.json` next to every asset (9 fields), CC-BY shown on desktop and phone
- [ ] No AI images, no emoji (inline SVG icons only)

**Look**
- [ ] Hero material reads correctly in the first frame and in the poster (glass looks like glass)
- [ ] 3 colours: paper, coloured ink, one accent ~1%; palette-check PASS; no black, no purple, no AI gradient
- [ ] Phone frame designed first; hero in the top 55%, action in the thumb zone

**Production**
- [ ] Nav (with phone menu), 4+ sections, honest form ("Concept: not sent"), "Concept" label, contact footer
- [ ] Phone = PC: same 3D files and effects; no `isM ?` detail cuts
- [ ] Reduced motion respected; poster shows with WebGL off
- [ ] 0 console errors and no horizontal overflow at 1440, 390, 360; inside the weight budget

**Before it leaves**
- [ ] `preflight.mjs <concept>` PASS
- [ ] `preflight.mjs --tree <staging>` PASS (no hardlinks, no PLACEHOLDER)
- [ ] Every message with a link checked with `preflight.mjs --text` and the link copied from tool output
