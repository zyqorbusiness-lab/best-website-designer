> Copied into the repo on 30 Oct 2026 from the working notes (`work/beast/`), so every skill's source can be checked. Paths below that start with `work/` or `site/library/_kit` refer to the working tree and the concept kit.

# 3D REPO — best points (oso95/scroll-world)

For the BEAST REPO (best-website-designer). Written 2026-10-28 (IST morning) by the repo3d helper of coordinator 2fc59ab0.
Sources read in full: the fresh clone in `work/beast/repo3d/scroll-world/` (every file), Sujon's messages
(`work/beast/sujon_messages_all.txt`), his rules (`memory/zyqor.md`, `memory/zyqor_skills.md`), portfolio v3
(`site/scrub-engine.js`, `site/config-desktop.js`, `site/m/config-mobile.js`, `site/index.html`, `site/lab/_kit/videoflow.js`,
`tools/video-flow/README.md`, `work/VIDEOFLOW_NOTES.md`), the bakery README (`zyqor_sites/bakery_scrollworld/README.txt`),
portfolio v2 notes, and the live GitHub repo (main = ec148e9).

Citations are `file Lnn` against the clone at commit 71cc36d. `SKILL` = `skills/scroll-world/SKILL.md`; `engine` =
`references/scrub-engine.js`; `prompts`, `pipeline`, `knockout`, `template` = the other files in `references/`.

---

## 0. Short version

- **What it is:** an agent skill (instructions + one vanilla-JS engine + scripts) for "fly through the world" landing pages.
  The camera move is a pre-rendered video, and scroll position drives `video.currentTime`. Its art pipeline is 100% AI generation
  (GPT Image stills + Seedance/Kling image-to-video, via the paid Monid/Higgsfield CLIs).
- **Licence:** MIT, "Copyright (c) 2026 cyw". We may copy, modify and republish anything in it, including in the public repo and in
  downloadable skills, **as long as the copyright line and MIT text travel with every copy or substantial portion**.
- **Problem found:** portfolio v3 already ships a modified copy of the engine (`site/scrub-engine.js`, live on GitHub main ec148e9)
  **without the MIT notice anywhere** (not in the file, CREDITS.md, LICENSE.md or README; README even says "custom scrub engine").
  Ready-to-apply fix: `work/beast/repo3d/LICENCE_FIX.md` (not applied, not pushed).
- **Biggest conflict:** its whole asset step is AI renders. Sujon wants real assets. Keep the engine, the encode and phone rules,
  the seam laws and the QA; swap the AI generation for **our own deterministic renders of CC0/CC-BY 3D scenes** or **real stock
  footage**. With our own renders the seam problem goes away (one camera path, cut at exact frames).
- **Correction to the brief:** scroll-world does *not* use image frame sequences. It scrubs MP4 video loaded as a Blob.
  Frame sequences on a canvas are portfolio v3's own `tools/video-flow` + `_kit/videoflow.js`.
- **Other 3D repos in Sujon's messages:** none. scroll-world (Oct 27, 6:16 AM, [m:036d5566]) is the only repo/3D link he sent in
  this chat. Details and the near-misses in §3.

---

## 1. What the repo is

| Fact | Value |
|---|---|
| URL | https://github.com/oso95/scroll-world (one branch, `main`; no tags) |
| Commit | 71cc36d, 2026-07-28 "docs: seam QA calibration — judge composition, not raw PSNR" |
| Local copy | `/home/user/tab/files/zyqor_skills/scroll-world/` is the same commit; `diff -rq` against the fresh clone: no differences |
| Author | "cyw" (cyw@cywang.me), plugin version 0.8.0 (`.claude-plugin/plugin.json`) |
| Popularity (GitHub API, read today) | 10,589 stars, 1,168 forks, last push 2026-07-29 |
| Size | 9 files, 120 KB. SKILL.md 49.5 KB, scrub-engine.js 28.7 KB, pipeline.md 16.2 KB, prompts.md 10.0 KB, README 6.9 KB, knockout.py 2.9 KB, index-template.html 2.7 KB, two plugin JSONs, LICENSE |
| Install/postinstall scripts, package.json | none (safe; checked again) |

What each file does:
- `SKILL.md` (763 lines): the procedure. Step 0 bootstrap (CLIs), Step 1 interview, Step 2 stills, Step 3 knockout, Step 4 camera
  architecture + model roster, Step 5 connectors (seam law), Step 6 encode, Step 7 assemble, Step 8 seam QA, then ~30 "hard-won" gotchas.
- `references/scrub-engine.js` (449 lines): `mountScrollWorld(container, config)`. Builds its own DOM, injects CSS in `@layer sw`,
  plays dive/connector clips as one chain by scroll, phone hardening built in.
- `references/pipeline.md`: bash scripts (stills → dives → boundary frames → connectors → encode → mobile encode; Monid variant).
- `references/prompts.md`: intake checklist, the "style preamble", prompt templates for stills, legs, dives, connectors, copy rules.
- `references/index-template.html`: minimal page that mounts the engine (viewport-fit=cover, theme vars).
- `references/knockout.py`: pure-PIL border-connected flood fill that removes a flat background but keeps matching colours inside the object.

---

## 2. Licence verdict (exact)

`LICENSE` is the standard MIT text, "Copyright (c) 2026 cyw" (`plugin.json` also says `"license": "MIT"`; GitHub API: `mit`).

**Allowed:** use, copy, modify, merge, publish, distribute, sublicense, sell: the engine, scripts, prompts and docs, in a public repo and in
downloadable skills, commercially, under our own licence for our changes.
**Condition (the only one):** "The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software." So every file that contains their code (or a large part of their docs) carries the notice.
**Not covered / don't reuse:** the README demo video (a GitHub user-attachment, not in the repo), the star-history image, the
author's name as an endorsement. Ideas and techniques are free anyway; only copied text/code needs the notice.

**Credit line to use everywhere** (CREDITS.md, skill READMEs, file headers):
> Scroll scrub engine adapted from scroll-world by cyw — https://github.com/oso95/scroll-world — MIT License, Copyright (c) 2026 cyw.

**Compliance gap in what is already public (verified on GitHub main ec148e9 today):** `site/scrub-engine.js` is their engine plus
v3 changes (diff vs the original: 283 added/removed lines, 231 non-empty added; same header "scroll-world - portable scroll-scrubbed camera-flight engine", same functions,
same CSS). The file has 0 occurrences of licence/copyright/cyw/oso95; CREDITS.md only says "Intro scroll-world clips ... all rights
reserved"; README L30 says "custom scrub engine". Also the deploy build is minified (bakery README: terser), which strips normal
comments, so the notice must be a `/*! ... */` comment. Fix text: `work/beast/repo3d/LICENCE_FIX.md`. Do this in the first beast-repo commit.

---

## 3. Other 3D repos / links Sujon gave — checked

Searched all 600+ of his messages in `sujon_messages_all.txt` (every URL, plus the words 3d, three, sketchfab, codepen, spline, repo,
github, skill, model, blender) and grepped all session transcripts for github/codepen/sketchfab/spline/codesandbox URLs.

| Date (IST) | Ref | What | 3D repo? |
|---|---|---|---|
| Oct 27 06:16 | [m:036d5566] | "Install this skills https://github.com/oso95/scroll-world.git" | **Yes, the only one** |
| Oct 27 06:25-06:30 | [m:8983c8a1], [m:1b134106], [m:1a6e33e2], [m:0f94294d] | "3D scroll wala effect mast"; "$1k aur $10k plans ke liye hi best rahega"; permanent rule to use the skill on every website | about scroll-world |
| Oct 27 15:32 | [m:9e9535a1] | instagram.com/ayzz.thedesigner | design reference (the "ayzz patterns"), not a repo |
| Oct 27 18:09 | [m:b282a2af] | drive.google.com/file/d/1OTIowxn… "Aha se vi best best sahi sahi points repo me katdo" | his premium-design Drive file (Drive helper's item) |
| Oct 25 16:53 | [m:f84c21fd] | lottiefiles.com free emoji animations | reel editing, not 3D |

Not from his messages but worth knowing: other GitHub links in the transcripts come from (a) assets Tab used (KhronosGroup
glTF-Sample-Assets, usd-wg CarbonFrameBike, meshoptimizer, lenis, fonts) or (b) his Drive's `DESIGN-LIBRARY-INDEX.md` L73-85
(howseen-ai/claude-motion-design, udaysharmadev/Gravitas, nextlevelbuilder/ui-ux-pro-max-skill, Ashutoshx7/VengenceUI, shadcn-ui,
youtube-agent-skill, browser-use/video-use) and its L67 game-asset links (cgtrader grass, sketchfab grass-02, pixabay 3D). None is a
3D-scene repo; they belong to the Drive analysis. **Verdict: the brief is right — scroll-world is the only 3D repo he gave.**

---

## 4. Sujon's rules that decide how we use it

1. **Permanent: every website uses the scroll-world skill** (Oct 27 06:28, [m:1a6e33e2]: "jab vi website bana na ha o skills use kagma
   ha and har time use karna ha bilkul mat [bhool]"). For 300 concepts this can't mean 300 AI video chains; it means every concept
   uses the scroll-world *method*: scroll-driven camera/time, the engine or its loading/phone rules, seam QA. §8 maps it per tier.
2. **Separate heavy desktop + light phone builds** (Oct 27 06:29, memory) — **but** Oct 27 20:23 [m:59766d2a]: "mobile ke liya vi utna hi
   primium and wasa hi quality chaiye ... sirf asa compress kago ki quality me koi difference na aye". Newer rule wins: keep two builds
   (separate pages, as v3 does), but the phone gets the same scene at quality that looks identical — native 9:16, not a 540x960 crf-31 squeeze.
3. **Real assets, not AI:** "koi emojis nahi real hona chahiye sab" (Oct 27 09:13, [m:1f2c5deb]); "video flow se bana lega real assets
   use karega har time" (Oct 27 18:06, [m:4542f872]); "primium high quality savi real assist hi use kato koi fake emojis" (Oct 27 19:00,
   [m:18a0d1a9]); "Quality ai feel design ... improvement" (Oct 27 18:22, [m:bfe1f4ca]); Drive: "real footage, no AI feel".
4. **Auto play + Skip buttons** on scroll-world pages (Oct 27 09:12, [m:7632f475]) — v3 built this into the engine.
5. One premium 3-colour palette per site, no black, no purple / AI-gradient colours, premium fonts (Oct 27 12:15, [m:e6ab4818]).
6. Lazy-load reveal effects on every site (Oct 27 06:29, memory). Preview before anything goes live.
7. Drive: "Portfolio sites: no endless/infinity loop animations" (`drive/DESIGN-LIBRARY-INDEX.md` L22) — see §6 (particles).

---

## 5. The best techniques (each cited, v3 status, beast-repo use)

Legend: **v3** = what portfolio v3 already does; **Beast** = where it goes.

### A. The core idea

**T1. Scroll drives time, not the camera.** A pre-rendered clip holds the camera move; scroll only maps to `currentTime`
(SKILL L21-26; README L74-76). Reverse scroll plays the move backwards for free (SKILL L443-446).
v3: yes (home intro, bakery). Beast: the base of every ADVANCED/PREMIUM "flight" concept.

**T2. Blob-loaded video = always seekable.** Static hosts that don't answer byte-range requests pin `seekable` to [0,0] and the video
freezes on frame 0. Fetch each clip as a Blob and play it from an object URL (SKILL L528-533; engine L198-211; gotcha L659-660).
Because of this, all-intra is not needed. v3: yes, extended (byte-split parts joined into one Blob). Beast: mandatory in the kit.

**T3. Interleaved segment chain.** Sections become `dive0, conn0, dive1, … diveN-1`; each segment gets `w` viewport-heights of scroll
(`diveScroll` 1.3, `connScroll` 0.9, per-section `scroll`), track height = total + 1vh so the last move completes (engine L86-101, L182-191).
v3: yes (3 sections, no connectors). Beast: the PREMIUM scene template.

**T4. Optional connectors.** A missing connector (`null`) simply crossfades the two dives, so a page still completes when one clip can't
be made (engine L93-100; SKILL L677-679). v3: uses this (`connectors: []`). Beast: keep; also lets a NORMAL concept be stills-only.

### B. Seams and camera motion

**T5. The seam law: frame-identical handoffs.** Each connector starts on the *actual last rendered frame* of the previous clip and ends on
the *actual first frame* of the next, never the original still (SKILL L32-35, L473-497; pipeline §3 L85-97). Plus a short crossfade as
insurance, never as the fix (SKILL L516-519; engine `crossfade` 0.12 vh, L79). Beast: with our own renders we get this *by construction*
(one camera path, cut at frame k: segment i ends on frame k, segment i+1 starts on frame k). Keep a tiny crossfade (0.04-0.08).

**T6. Velocity continuity / motion-handoff contract.** Position continuity isn't enough: the camera must never reverse across a seam
(that reads as a rewind). Inside one clip anything goes. Every leg ends in ~1 s of slow forward drift and the next begins with the same
drift (SKILL L394-409; prompts L80-84). Architecture A (always-forward take, for realistic worlds) vs B (dive + pull-out hop, only for
miniature/map worlds) (SKILL L369-392). Beast: rule for our camera splines (tangent continuous at section boundaries; ease to a constant
forward speed for the last second of each section). Goes in the camera-path skill.

**T7. Camera grammar by concept.** Product/luxury: slow half-orbit then carry on; real estate: steadicam through doorways, crane-up in
atria; industrial: low lateral track with foreground parallax; travel: rise-and-reveal then swoop; food/craft: push in close, ease back
(SKILL L411-427; move library prompts L106-115); locked-isometric variant for the calmest look (SKILL L429-436; prompts L92-104).
Beast: implement each as a reusable spline preset; tag every PREMIUM concept with one grammar so the 100 don't all move alike.

**T8. Pacing: dwell + linger.** Per-section `scroll` (more scroll = longer stay) and `linger` 0-1, a monotone remap
`(1-L)·x + L·(4(x-.5)^3+.5)` so the camera slows mid-scene exactly when the copy peaks and speeds up near seams; f(0)=0, f(1)=1 keeps
seam frames intact (engine L175-178; SKILL L438-441, L590-594). Rule of thumb: expressive motion in the clip, restraint in the mapping.
v3: yes (`linger: 0.35` on Studio). Beast: in the kit, and reusable for any scroll animation (CSS/three.js) — NORMAL tier too.

### C. Encoding and delivery

**T9. Desktop encode recipe.** Native resolution (don't downscale), `-crf 20`, small GOP `-g 8 -keyint_min 8 -sc_threshold 0`, light
`unsharp=5:5:0.8:5:5:0.0`, `-an`, `+faststart`, yuv420p. All-intra bloats an 8 s clip to ~25 MB vs ~8 MB at GOP 8 (SKILL L534-546;
pipeline §5 L119-132). v3/bakery measured their own tuning: 1080p 24 fps, crf 26 keyint 12 (first clip crf 29 keyint 16) with no
visible 1:1 difference; keyint 24 made seeks slower (p95 ~1 s) (bakery README v3). Beast: put both numbers in the encode skill
(their crf 20 as "max quality", ours as "measured web budget").

**T10. Phone encode: smaller frame + tighter GOP, native portrait.** Phone seek cost scales with frames-from-keyframe, so a 1080p g8 file
that scrubs on a laptop stutters on a phone; 720 wide, `-g 4`, crf 23 (SKILL L548-558; pipeline §6 L143-157). The mobile version is
a *native 9:16* chain, never a centre crop (SKILL L129-149; pipeline §6b L173-198) with `stillMobile` posters taken from the portrait
clip's own frame 0 (no landscape-to-portrait flash). v3: native 9:16 phone clips (540x960, 20 fps). Beast: render the same scene a
second time with a portrait camera (same path, wider vertical FOV) → identical look on phone, satisfying the "same quality" rule;
720x1280 g4 by default, not 540.

**T11. Lazy prefetch window + reduced motion = no video at all.** Clips load only within ±1.6 viewport-heights of the scroll position
(engine L230); under `prefers-reduced-motion` no clip is ever fetched — stills cross-dissolve instead (engine L198-201; SKILL L646).
v3: replaced the window with a stricter queue (one clip in flight; current + 2 ahead + 1 behind; only the first clip before the visitor
engages). Beast: ship v3's queue (it's better) and keep scroll-world's reduced-motion rule.

### D. Phone hardening (the most valuable code in the engine)

**T12. Seek coalescing.** In the rAF loop never set `currentTime` while `video.seeking`; keep lerping `cur` toward the target (factor
0.18) and snap to the latest target once free; coarser seek step on phones (eps 0.02 vs 0.008) (engine L273-287; SKILL L598-601).
Stops fast flicks from freezing the clip. v3: yes, plus the loop sleeps when idle (wakes on scroll). Beast: kit + encode skill.

**T13. iOS blank-video fix.** Keep the still visible as a poster until the video fires `seeked` (a real frame painted), not on
`loadedmetadata`; on the first touch prime every loaded clip with muted `play()`→`pause()`; keep `muted` + `playsinline` attributes
(engine L213-217, L291-307; SKILL L689-693). v3: yes. Beast: kit; QA must check it.

**T14. No scroll jump on mobile.** Ignore height-only `resize` events on touch (URL bar sliding), relayout only on width change or
`orientationchange`; `dvh` + `env(safe-area-inset-bottom)` for copy; `viewport-fit=cover` (engine L312-322 and CSS L413-422;
SKILL L694-699; template L5). Drop per-frame decoration (particles) on coarse pointers (engine L309-310). v3: yes. Beast: kit.

### E. Page craft

**T15. Copy choreography.** First section's copy greets on landing and fades by 62% of its segment; middle sections peak at the
centre; the last fades in by 40% and holds the CTA; copy drifts 4 vh; pointer events only when opacity > 0.5 (engine L244-256).
Copy rules: eyebrow 2-4 words, title 3-6 words, one plain sentence of body, 0-3 proof tags (prompts L164-170). Readability scrim on the
copy side, full-width bottom scrim on phones (CSS L388, L415). Beast: reuse in every scroll concept; fits Sujon's "plain real copy".

**T16. Theme through a cascade layer.** All default CSS lives in `@layer sw`, so a page's own `:root { --sw-bg; --sw-ink; --sw-accent;
--sw-font-* }` wins with no specificity hacks (engine L438-442; SKILL L680-684). Beast: every concept sets its 3 palette colours and
premium fonts this way. (Defaults must be changed — see §6.)

**T17. One shared "style preamble" = cohesion.** The same style text, byte for byte, in every scene prompt is what makes separate scenes
read as one world (prompts L3-4, L33-43; SKILL L100-103, L248-250). Beast translation (no AI): one shared look preset per concept —
the same HDRI, light rig, tone mapping (ACES), material palette, camera lens and colour grade for all scenes.

**T18. Compose for the centre.** Clips render `object-fit: cover` at `object-position: center 42%`; keep the focal subject centred with
headroom, nothing essential at the edges (prompts L65-70; CSS L385). Beast: camera framing rule for both 16:9 and 9:16 renders.

### F. Process and QA

**T19. Seam QA you can automate.** Screenshot just before and just after each seam; judge by composition, not PSNR (a good 1080p seam
can read 18-25 dB from shimmer); check console errors, `video.seekable.end(0) > 0`, that `currentTime` tracks scroll; on phone emulation
with CPU throttled 4-6x scroll fast; verify the `-m.mp4` is served and `videoWidth < videoHeight`; URL-bar collapse doesn't jump;
reduced motion shows stills only (SKILL L613-646). v3: has its own QA harness (`work/fqa/`, `__swInfo()` hook). Beast: one
`qa-scroll.mjs` in the QA skill that does exactly this list at 1440/390/360.

**T20. Previz cheap, then final; decide cost before spending.** Run the whole chain at draft quality, approve, then render finals
(SKILL L163-165; pipeline L298-302); compute and state the total before generating (SKILL L151-198); calibrate on one item first (L192-198).
Beast: our version = a fast low-sample/480p render of the full path to check timing and seams, then the final render; state render
minutes per concept in the batch plan.

**T21. Re-roll the one failure, not the batch; run long jobs detached and poll** (SKILL L68-71, L246-247, L462-463; pipeline L26-28).
Matches our box rules (timeout -k, no captured background pipes).

**T22. Ask the subject openly, then only what can't be defaulted** (SKILL L80-88): good guidance for the skills' own docs and for client
intake ("What should this world be about?"), and always ask about the mobile version (SKILL L129-136).

**T23. knockout.py: border-connected flood fill.** Removes a flat background from a render or product photo while keeping
same-coloured areas *inside* the object (cream walls), softens the edge with a 1.4 px blur, keeps the contact shadow (knockout L1-21,
L39-79). Pure PIL. v3: not used anywhere. Beast: handy for NORMAL concepts that float a product shot (our own renders or CC0 photos)
over the page colour. Can be vendored with the MIT notice.

---

## 6. What NOT to copy (and what to use instead)

| In scroll-world | Why not | Use instead |
|---|---|---|
| The whole asset pipeline: GPT Image stills, Seedance/Kling image-to-video (SKILL Steps 2-5; pipeline §1, §2, §4, §7; prompts) | Sujon: real assets only, no AI feel (§4.3). Also needs paid third-party CLIs and accounts (Monid, Higgsfield, Codex) | **Own deterministic renders**: a three.js scene of verified CC0/CC-BY models (Poly Haven, Khronos glTF samples) with one camera spline, rendered frame by frame (fixed timestep) in headless Chrome, encoded with T9/T10. Or **real stock footage** (Mixkit/Pexels/Coverr, licence logged) through v3's video-flow, cut into sections. |
| Connectors as separate generated clips + NSFW re-roll lore (SKILL L467-519, L668-679) | An AI-generation workaround; our renders have identical seam frames by construction | Cut one continuous render at section frames; keep the *law* (T5/T6) as the QA check |
| Monid/Higgsfield/Codex specifics, prices, model roster, bash-3.2/zsh notes (SKILL L45-75, L151-203, L276-367, L705-750) | Irrelevant on our stack | Drop |
| Default theme: accent `#8a7bb5` / template `#9B7EBD` (purple), `ui-rounded` system display font, gradient "brand mark" square (engine CSS L359-361, L377; template L10-15) | Sujon: no purple/AI colours, premium fonts, real logos only for real brands | Every concept sets `--sw-*` to its own 3-colour palette and self-hosted premium fonts; drop the fake brand mark |
| Drifting particles `sw-drift ... infinite` (engine L339-354, CSS L367-372; on by default with `atmosphere`) | Drive rule: no endless loop animations on portfolio sites (`DESIGN-LIBRARY-INDEX.md` L22). v3 still shows them on desktop (`atmosphere: true`) | `atmosphere: true` for the gradient only, particles off (add a `particles:false` option) |
| Centre-crop mobile encodes (pipeline §6) | Their own doc calls it a stopgap; Sujon wants the same quality on phone | Native 9:16 render of the same scene (T10) |
| "Emons logistics site" as the reference look, sample brand "Pearl & Co." / boba copy (README L10-11; SKILL L7; engine L11) | A real company's site; sample copy | Original worlds per concept, fictional brands labelled Concept |
| Copying SKILL.md/prompts.md wholesale into our `skills/` | They teach the AI pipeline; would contradict our rules | Write our own skill text; link upstream as the source of the method; vendor only the engine (with notice) |
| video-flow README line "or an AI video tool" (v3 `tools/video-flow/README.md`, "AI product renders and 3D renders") | Same AI conflict, in our own repo | Reword in the beast commit: "Blender, Spline, three.js or real footage" |

Also note honestly: **v3's home intro clips are AI renders** (portfolio_v2 `src/README.txt` L7: "hero stills (gpt-image-2.5) and raw Kling
v3 pro clips"; the bakery likewise used Kling v3 pro). They predate the "real assets" rule. The beast repo should not add more of these;
whether to re-make the v3 intro with own renders is a call for Sujon (flag to root).

---

## 7. What portfolio v3 already uses (and what it added)

| Piece | Status in v3 | Where |
|---|---|---|
| Engine (`mountScrollWorld`) | **Used**, modified (diff: 283 added/removed lines; 41 KB vs 28.7 KB) | `site/scrub-engine.js`, same file on GitHub |
| Blob loading, seek coalescing, iOS priming, URL-bar fix, safe-area, @layer theme, linger, reduced motion | Used (inherited) | same |
| Sections | 3: Studio (clip), Concepts (still only, zooming), Main Street (clip); `connectors: []` (crossfade, no connector clips) | `config-desktop.js`, `m/config-mobile.js` |
| Clips | desktop 1920x1080 24 fps: d-studio 2.5 s 1.0 MB, d-mainstreet 4.0 s 2.3 MB; phone 540x960 20 fps: m-studio 0.5 MB, m-mainstreet 0.3 MB (native portrait) | `site/assets/hero/` |
| Separate builds | `index.html` redirects phones (≤860 px, or coarse + portrait) to `/m/` before paint | `site/index.html` L6 |
| **Added by v3 (not in scroll-world):** | | |
| First clip preloaded in `<head>` (`window.__swPre`) and reused by the engine (no double download; skipped on saveData/reduced motion) | | `index.html` L29; engine `loadClip` |
| Load queue: first clip only until the visitor engages, then current + 2 ahead + 1 behind, one at a time; posters attached lazily | | engine `loadQueue` |
| Byte-split clip parts fetched in parallel and joined into one Blob | | engine `loadClip` |
| Idle rAF sleep (`kick()`), DOM writes skipped when unchanged | | engine `read`/`raf` |
| Last scene never fades to bare background | | engine `read` |
| Auto play / Pause / Skip tour with inline SVG icons (Sujon's ask) | | engine `setupTour` |
| `sw:firstready` event (loader exit), `__swInfo()` read-only QA hook, Lenis-aware jumps | | engine |
| **Not used:** connectors / seam law, route rail and nav (`nav:false`), `stillMobile` (separate build instead), knockout.py, the AI pipeline itself in v3 (clips came from v2), Step 8 seam QA | | |
| Frame-sequence scrolling (different technique, v3's own): video → webp frames, canvas cover-fit around a focus point, progressive load order frame 0, last, every 8th, 4th, 2nd, rest; size budgets per set | `tools/video-flow/`, `site/lab/_kit/videoflow.js` L52-54; Lab demos 12-14 (Mixkit footage) | |

---

## 8. How the beast repo should use it

### Per tier
- **NORMAL (100):** no video chain. Reuse the engine's *page craft*: copy choreography (T15), linger easing for CSS/SVG scroll motion
  (T8), reduced-motion and safe-area rules (T11, T14), `@layer` theming (T16). A "stills world" variant is allowed: the engine already
  supports still-only sections (zoom 1.03→1.17 while scrolling, engine L238-241) — real photos or our own renders, knockout (T23) for floating products.
- **ADVANCED (100):** scroll-scrubbed real footage. Either video-flow frame sequences (one continuous shot) or the scroll-world engine
  with one continuous clip cut into 3-5 sections (seams identical by construction). Real CC0/stock footage, credited. Live three.js
  scroll cameras also count here (T6/T7 rules for the camera).
- **PREMIUM (100):** the full scroll-world bar with real assets: a world built from verified CC0/CC-BY models, shared look preset (T17),
  camera spline with a grammar preset (T7) and the handoff contract (T6), rendered at 1920x1080 and natively at 9:16 from the same path
  (T10), encoded T9/T10, engine with v3's loading + tour, seam QA (T19). Optional finale: hand off from the pre-rendered flight to a
  live three.js product (same model) for interaction.

### Code and credit
- One engine for the whole library: `library/_kit/scroll-world-engine.js` = v3's engine + a `particles:false` option + neutral
  defaults, with the MIT header from `LICENCE_FIX.md`. Don't fork it per concept.
- CREDITS.md "Code from other projects" entry (text in `LICENCE_FIX.md`), repeated in each skill README that ships the engine.
- Concept metadata should name its scroll-world technique (e.g. `technique: "sw-chain/own-render"`, `"sw-single-clip/footage"`,
  `"sw-stills"`, `"frames/video-flow"`) so the "every site uses the skill" rule is visible and checkable.

### Honest limits
- Rendering on this box is software GL: no GPU (no nvidia-smi, no /dev/dri, checked today), v3's QA ran in a software-rendered browser, and Blender is not installed. A three.js frame render at 1080p will be
  slow — **unmeasured**; measure one 10 s path before promising batch times. `pip install bpy` (Blender as a module) is possible but heavy;
  not tested.
- Phone builds were never tested on a real phone (v3 final report). T13/T14 exist exactly for iOS; ask Sujon to open one PREMIUM concept on his phone early.

---

## 9. Proposed downloadable skills (derived from scroll-world)

Each: `SKILL.md` + `README.md`, working example, install/use steps, LICENSE (MIT, Zyqor Studio) + upstream notice where code is reused.

1. **`skills/scroll-world-real/` — Scroll World with real assets.** The method without AI: plan sections and camera grammar, build a
   CC0 scene or pick continuous footage, render/cut, encode, mount, QA. Ships the Zyqor-hardened engine (with notice), `template.html`
   (desktop) + `m/template.html` (phone, separate build + redirect snippet), `encode.sh` (desktop + phone recipes, T9/T10), a 3-section
   example built from one Khronos/Poly Haven scene, and the seam law/handoff contract/grammar table rewritten in our words.
2. **`skills/scroll-video-delivery/` — Smooth scroll video on every phone.** Everything about serving scrubbed video: Blob seekability,
   GOP/crf tables (their numbers + our measured ones), byte-split parts + `join-parts.mjs` for GitHub's file limit, head preload reuse,
   one-in-flight load queue, seek coalescing, iOS priming, URL-bar fix, size budgets, and `qa-scroll.mjs` (T19 checklist at 1440/390/360,
   console errors, `seekable`, portrait check, reduced motion, CPU throttle). Works with any scrub engine.
3. **`skills/camera-path-renderer/` — Cinematic camera flights from 3D models.** three.js + glTF: camera spline presets (half-orbit,
   crane-up, lateral track, push-in-ease-back, rise-and-swoop, locked-iso), tangent-continuous section boundaries, look preset JSON
   (HDRI, ACES, light rig, lens), deterministic frame export via headless Chrome (one at a time), one path → 16:9 and 9:16 renders,
   ffmpeg encode + exact-frame section cuts, preview (480p) vs final. This is the "no AI" replacement for scroll-world's Steps 2-5.

(video-flow already exists in v3 and covers "video → frame-sequence site"; it should sit beside these, with the AI wording fixed.)

---

## 10. Things for the coordinator to decide or pass up

1. Apply the licence fix (`LICENCE_FIX.md`) in the first beast commit — it's a live MIT compliance gap in the public repo.
2. v3 home intro clips are AI renders (Kling + gpt-image), made before the "real assets" rule; ask Sujon whether to re-render with own CC0 scenes.
3. Particles loop on v3 desktop vs the Drive "no endless loop" rule — small change (`particles:false`).
4. Measure one own-render path (time, size) before committing PREMIUM batch estimates.
