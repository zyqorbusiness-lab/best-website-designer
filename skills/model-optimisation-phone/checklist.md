# Checklist: model-optimisation-phone

A model is done when every box is ticked.

## Optimise
- [ ] Ran `optimise.mjs` (not plain `gltf-transform optimize`, which simplifies, joins and merges materials by default).
- [ ] Triangles before = triangles after (no simplify).
- [ ] No REFUSED message was bypassed with an `--allow-*` / `--unsafe-demo` flag on the file that ships.
- [ ] Normal maps are WebP near-lossless or KTX2 UASTC. Never lossy WebP, never ETC1S.
- [ ] Hero textures are at least 2048 px (or their source size); only parts that are small on screen use `--max-for ...=1024`.
- [ ] glTF validator: 0 errors.
- [ ] Budget PASS, or the budget was raised on purpose (quality first) and the reason is written down.
- [ ] Report saved next to the model (`*.report.json`): sizes, triangles, textures, GPU estimate.
- [ ] GPU texture estimate checked: over ~200 MB means try `--max-for` on small parts (then verify again) or KTX2.

## Verify
- [ ] `verify.mjs` verdict IDENTICAL: every view >= 38 dB PSNR and <= 1% changed pixels.
- [ ] Close-ups cover the parts people will look at (named `views.json` for hero products, not only the automatic ones).
- [ ] `compare_closeups.jpg` looked at by a person: nothing soft, blocky, banded or shifted in the difference image.
- [ ] Desktop and 390 px renders both checked (`compare_desktop_phone.jpg`, `compare_closeup_desktop_phone.jpg`).

## Ship
- [ ] Desktop build and phone build load the SAME .glb, the SAME textures and the SAME HDRI. No `-m.glb`.
- [ ] Only the pixel ratio differs: DPR capped at 2, antialias on both.
- [ ] Lazy load near the viewport, paused off-screen and in hidden tabs, renders only when something moves.
- [ ] Poster image shows if WebGL fails; a short status line says so.
- [ ] `prefers-reduced-motion`: no idle spin, instant camera moves.
- [ ] Decoder files shipped next to the page (`libs/draco/gltf/`, `libs/basis/`) when draco or KTX2 is used.
- [ ] 0 console errors and no horizontal overflow at 1440x900, 390x844 and 360x740.
- [ ] Credits: model, HDRI and fonts with their exact licences.
- [ ] Files over ~3 MB split for GitHub (`.part` + `tools/join-parts.mjs` in the Zyqor repo).
