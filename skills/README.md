# Skills: free, downloadable, tested

Each folder here is one self-contained skill you can download and use on your own projects: a written method (`SKILL.md`, readable by people and by AI coding agents), a working example, starter code, a QA checklist and an MIT licence. Every example was checked at 1440x900, 390x844 and 360x740 with 0 console errors before it shipped.

## Ready

| Skill | What it gives you |
|---|---|
| [`qa-harness`](qa-harness/) | One command that checks every page of a site at desktop and two phone sizes plus reduced motion: console errors, failed requests, horizontal overflow (and which element causes it), WebGL, broken links, screenshots, and a pass/fail report that ends in a verdict. |
| [`liquid-glass-ui`](liquid-glass-ui/) | A drop-in liquid-glass UI kit (nav pill, cards, buttons, segmented control, switch, slider, sheet, phone tab bar) with edge refraction, specular rim, hairline and fallbacks. Plain CSS + one small JS file. |
| [`model-optimisation-phone`](model-optimisation-phone/) | Turn one glTF/GLB into one optimised file that desktop and phone both load and that looks identical, then prove it with side-by-side renders. |

## Coming next
`lab-demo-template`, `3d-product-scroll`, `scroll-world-real` (scroll-world without AI renders), `scroll-video-delivery`, `camera-path-renderer`, `video-to-scroll`, `hdri-lighting-materials`, `premium-typography`, `colour-3-palette`, `scroll-animation`, `micro-interactions`, `shader-starters`, `physics-interactions`, `asset-sourcing-credits`, `award-site-system`, `motion-design-system`, `performance-budget`, `honest-portfolio`, `concept-library-index`.

## How to get one
- Download the whole repo as a ZIP (green "Code" button, then "Download ZIP") and copy the skill folder you want, or
- `npx degit zyqorbusiness-lab/best-website-designer/skills/qa-harness my-qa` (any skill name works).
- Large example files are stored as numbered parts because of an upload limit. After downloading, run `node tools/join-parts.mjs` from the repo root once and they are rebuilt (checksums verified).

To use a skill with an AI coding agent, copy its folder into your agent's skills directory; `SKILL.md` has the name, description and when-to-use at the top.

Code in these folders is MIT (see each `LICENSE`). Third-party models, HDRIs, photos and fonts in the examples keep their own licences, listed in each skill's README.
