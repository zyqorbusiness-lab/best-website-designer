# QA checklist: what "done" means

Copy this into the hand-off of every page or site. The first block is what the harness proves; the second block is yours.

## The harness (paste the verdict line)

- [ ] `VERDICT: PASS` with the default profiles (1440x900, 390x844, 360x740, reduced motion)
- [ ] 0 console errors and 0 uncaught errors on every page at every size
- [ ] 0 failed requests and 0 4xx/5xx
- [ ] 0 horizontal overflow at 390 **and** 360, checked down the whole page
- [ ] 0 broken internal links or missing assets
- [ ] External links checked with `--external` (walled sites opened by hand) and opening in a new tab
- [ ] Every warning read and either fixed or explained in one line
- [ ] 3D pages: `--profiles ...,nowebgl` shows a real poster, not a blank box
- [ ] 3D pages with a phone build: `tools/compare.mjs` image shows the same model and textures on the phone
- [ ] CPU-throttle smoke: no errors, no long task over 1 s

## Human checks (the harness cannot do these)

- [ ] Opened on a **real iPhone** (Safari) and a **real Android** (Chrome): readable without zoom, taps land, nothing jumps
- [ ] Scrolled by finger on the real phone: smooth, no stutter when the 3D loads
- [ ] Looked at every screenshot in `report.html`: crops, alignment, spacing, text wrapping, nothing cut off
- [ ] Reduced motion turned on in the phone's settings: content still makes sense, nothing spins on its own
- [ ] Keyboard only: every control reachable, focus visible
- [ ] Lighthouse (Chrome DevTools, mobile): real numbers recorded, not targets
- [ ] Copy read once out loud: no placeholder text, no fake clients or numbers

## The hand-off ends with

```
VERDICT: PASS (harness, <date>, <n> pages x <n> sizes)
Not verified: <copy the list from report.md, minus what you then checked by hand>
```
