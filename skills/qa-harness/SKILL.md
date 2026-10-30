---
name: qa-harness
description: One command that opens every page of a static site at 1440x900, 390x844 and 360x740 plus a reduced-motion pass, and reports console errors, failed requests, horizontal overflow (naming the element), WebGL, broken links and stuck reveals, with screenshots, results.json and a pass/fail report that ends in a VERDICT.
when-to-use: Before you call any page "done", before every commit that touches a page, and before you show a site to anyone. Especially for 3D/WebGL, scroll-animated and separate desktop/phone builds, where most bugs only show at one width.
licence: MIT
---

# qa-harness

The rule this skill exists for: **no page ships on "it looked fine on my screen".** A page is done when the harness says `VERDICT: PASS` at all three sizes and you have looked at the contact sheet yourself. The report always lists what it could *not* verify (a real phone, real-device frame rate, design quality), so nobody mistakes a green check for a finished site.

## What it checks, per page, per size

| Check | FAIL when | Warn when |
|---|---|---|
| Console | any `console.error` or uncaught exception (with file:line) | `console.warn` |
| Network | a request fails or answers 4xx/5xx | a media request is aborted (`ERR_ABORTED`) |
| Horizontal overflow | the page scrolls sideways at any point while scrolling down. The **overflow finder** names the element that sticks out past the screen *and* past its parent, how many px, and the container to fix | wide content hidden by `overflow-x: hidden` on html/body (iOS can still pan) |
| Images | an image failed to load | images without `alt` |
| WebGL | the page asked for WebGL and got none although the browser has it | — |
| Reveals | — | text still invisible after a full scroll (a scroll reveal that never fired) |
| Reduced motion | — | endless CSS animations, or the screen still moving on its own (pixel diff, with the area and a red diff image) |
| Layout shift | — | CLS over 0.1 while loading |
| Links | an internal link or asset is missing; an external link is broken (with `--external`) | an `#anchor` with no matching id; an external link without `target="_blank"` (FAIL with `--preset zyqor`) |
| Content | (with `--preset zyqor`) emoji or placeholder text in the page | emoji / lorem ipsum / TODO |

Plus: screenshots at the top and at 4 points down every page, a **CPU-throttle smoke run** (phone, CPU 4x slower: load time, scroll fps, long tasks), and an optional **no-WebGL profile** that proves the poster fallback is there.

Phone sizes run in Chromium by default; `--webkit` runs them in WebKit, Safari's engine (after `npx playwright install webkit`), which is the closest you get to an iPhone without one.

Sizes (profiles): `desktop` 1440x900 · `phone` 390x844 @2x, iPhone UA, touch · `small` 360x740 @2x, Android UA · `reduced` 1440 with `prefers-reduced-motion: reduce` · `reduced-phone` · `nowebgl`. Default: the first four. `--full`: all six plus the throttle run on every page.

Separate phone builds are understood: if a folder holds `index.html` **and** `m.html`, the desktop profiles load `index.html` and the phone profiles load `m.html` (`--phone-file` changes the name).

## Method

1. **Install once** (Node 18+): `npm install` in this folder, then `npx playwright install chromium`. Already have Chrome? Skip the second step and pass `--chrome /path/to/chrome` (or nothing: the harness also finds Google Chrome on its own).
2. **Run it on the folder you deploy**, not on a dev server with hot reload:
   `node qa.mjs ./site` — it serves the folder on a local port itself, finds every `.html`, and tests each one. Live site instead: `node qa.mjs https://your-preview.example` (crawls same-origin links; `--pages` to pick).
3. **Read the verdict line**, then open `qa-report/report.html` (contact sheet, red border = failed run) and `qa-report/report.md` (every problem with its evidence).
4. **Fix the first FAIL, re-run, repeat.** Overflow comes with a "Fix at" line and an evidence screenshot taken wider than the screen with the screen edge drawn as a dashed line, so you see exactly what sticks out.
5. **Read the warnings.** They are not noise: a stuck reveal on the phone is invisible content for real users; idle motion under reduced motion is a broken promise to people who get motion-sick.
6. **For 3D pages, prove the phone shows the same model**: `node tools/compare.mjs ./site --desktop lab/hush/index.html --phone lab/hush/m.html --selector canvas` writes one image with both builds side by side and a pixel close-up row. Point the close-ups at the same part of the model with `--focus-desktop cx,cy,size` and `--focus-phone cx,cy,size` (fractions of each capture). More pixels on the phone close-up = the phone got the full model, not a cheaper one.
7. **Say what was not verified.** Copy the report's "Not verified" list into your hand-off. Then open the live URL on a real phone.

## Rules that came from real bugs (v3 portfolio, Oct 2026)

- Check **360**, not only 390: a 28px overflow on one demo existed only at 360 (3D annotation labels).
- Scroll the **whole** page at every size; overflow and stuck reveals often appear only mid-page, after a pinned section or a lazy model loads.
- Test the **phone build itself** (`m.html`), with a phone user agent and touch, because a desktop page that redirects to its phone build can pass while the phone build fails.
- Treat walled external sites (Unsplash, Pexels, Instagram answer bots with 401/403/429) as "open by hand", not as broken.
- A link to `#something` with no matching id is only OK when a script handles it (smooth scroll to a pinned section); the harness warns, you decide.
- Measure layout shift **before** scrolling: pinned ScrollTrigger sections cause big shifts during scroll that users never feel as jumps.
- Software WebGL (SwiftShader) is used by default so results match on every machine. Its frame rate is not a phone's, and it is CPU-heavy: on a shared machine run one harness at a time (`flock /tmp/chrome.lock node qa.mjs ...`).
- Run `--profiles ...,nowebgl` on every 3D page at least once: on the v3 portfolio all three tested demos threw "Error creating WebGL context" with WebGL off, a bug no normal QA pass sees.

## Weight and layout-shift numbers: `tools/weight.mjs`
The harness says whether a page is broken. It does not say how heavy it is, and "make it lighter" needs a before and an after. `tools/weight.mjs` opens each URL with the cache off and reports:
- `initialBytes`: everything downloaded by the end of load + `idle` ms (what the first screen costs);
- `scrolledBytes`: after walking the whole page 700 px at a time (what a full visit costs, lazy files included);
- `byExt`: KB per file type (mp4, glb, webp, hdr, js, woff2, ...); `top`: the biggest files by path;
- `lcp` + `lcpEl` (which element was the largest paint), `cls` + `sh`: every shift over 0.01 with the elements, their old and new top, and their heights.

```bash
node tools/weight.mjs '{"runs":[
  {"key":"desk","url":"https://site.example/","w":1440,"h":900,"scroll":true,"shot":"desk.jpg"},
  {"key":"phone","url":"https://site.example/m/","w":390,"h":844,"mobile":true,"dpr":2,"scroll":true},
  {"key":"desk-reduced","url":"https://site.example/","w":1440,"h":900,"reduced":true,"scroll":true}]}'
```
Run it on the **live** URL before you change anything and keep the JSON. The "after" means nothing without it.

### What the numbers said on the Zyqor home page (Oct 30 2026)
| | before | after | what did it |
|---|---|---|---|
| desktop CLS | 1.51 | 0.02 | `sh` pointed at the pinned horizontal gallery (a ScrollTrigger pin) and the scroll world, whose heights arrived late; the gallery now uses CSS `position: sticky` and the scroll world reserves its height (`min-height: 520vh`) in a `<style>` in the head |
| desktop LCP | 1.47 s | 1.07 s | measured, not engineered: single runs under SwiftShader vary by a few hundred ms, so treat it as "no worse" |
| desktop full scroll | 29.3 MB | 27.4 MB | data maps of the 3D models to 1024 px (see `model-optimisation-phone` section 7) |
| phone `/m/` full scroll | 14.7 MB | 12.3 MB | same files |
| biggest item left | | 13.6 MB of project-card mp4s | the next target, not touched on the day |

### Reading the shift list
- A shift with a **0 x 0 rect becoming a full-screen rect in the first 100 ms** is a flash of unstyled content, not your layout. On the P042 page it was an inline `<svg>` without `width`/`height`, drawn at 1421 x 883 px until the CSS arrived, scoring CLS 1.0. Give inline SVGs width and height; load shared CSS as `<link>` in the head.
- A shift from a `pin-spacer` is a ScrollTrigger pin measured too early. Prefer CSS sticky, or call `ScrollTrigger.refresh()` after images and fonts settle, and reserve the height.
- A small shift on a fixed nav at scroll time (0.004) is the nav hiding on scroll. Harmless, but it shows up; know it so you do not chase it.

## Section contact sheets for scroll stories
For a page told in chapters (sticky sections with a fixed 3D stage), the default 4 screenshots land between chapters. Shoot one frame per section instead: scroll each section to about 60 % of its own progress, wait for the camera to settle (3 s under SwiftShader; the camera lerps per frame and software WebGL runs few frames), shoot, then paste the frames into one sheet (desktop 3 x 2, phone 6 in a row). On P042 this sheet caught three bugs the error checks could not: close-ups cropped off the right edge, the product rolled 20 degrees in the top-down shot (an off-centre `lookAt`), and every phone frame cropped because the phone used the desktop camera distance.

## Running beside other agents on one machine
- One Chrome at a time: wrap every browser run in `flock /tmp/<project>-chrome.lock ...`. Two SwiftShader Chromes on 4 CPUs make each other time out.
- Put `timeout -k 5 <seconds>` on every command. Plain `timeout` sends SIGTERM only, and a stuck Chrome can ignore it.
- Start your own static server on a free port and kill it when you finish; leave other people's servers alone.
- When two agents push to one GitHub repo, read the branch head right before each commit and commit on top of it. A cached "get ref" answer can be minutes old: a 422 "not a fast forward" means somebody else pushed, not that your files are wrong. Re-read the head from a second endpoint and retry; never force.

## Options you will use

`--pages a,b` · `--full` · `--external` · `--webkit` (phone sizes in Safari's engine) · `--preset zyqor` · `--strict` (warnings fail) · `--wait 3000` (heavy 3D) · `--shots 8` · `--out DIR` · `--profiles desktop,phone` · `--chrome PATH` · `--cdp ws://...` / `--remote browserbase` (cloud browser, URL targets only) · `--gpu` · `--config qa.config.json`.

Exit code `0` = PASS, `1` = FAIL, `2` = the harness itself could not run (bad path, no Chrome).

## Files

- `qa.mjs` — the CLI. `lib/` — server, browser finder, in-page probes, pixel diff, report writer.
- `tools/compare.mjs` — desktop vs phone crop of the same model. `tools/overflow.mjs` — the overflow finder alone, one URL, one width. `tools/weight.mjs` — bytes (first view and full scroll, by type), LCP and CLS with the shifting elements.
- `adapters/browserbase.mjs` — optional remote browser.
- `starter/` — `qa.config.json` and a GitHub Actions workflow.
- `example/` — a 3-page site with two deliberate bugs, the real report it produced, the fixed site and its passing report.
- `checklist.md` — what "done" means, including the human checks the harness cannot do.
