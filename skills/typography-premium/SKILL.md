---
name: typography-premium
description: Premium web typography an agent can apply without guessing - choosing and pairing fonts (display + body + optional mono), a fluid type scale with exact clamp() values, tracking and leading by size, variable fonts, the craft details (balance, hanging punctuation, tabular numbers, optical sizes), loading without layout shift, and licensing (OFL vs Fontshare FFL vs paid foundries). Includes scripts/type-scale.mjs, a tested specimen page with masked line reveals and a scroll-lit manifesto, banned-font rules, tiers and a pre-ship checklist.
when_to_use: "which fonts", "make the type look premium / editorial / expensive", "headline feels cheap", "font pairing for a [industry] site", "fonts load late / text jumps", "can I use this font commercially", before writing any CSS for text
license: MIT (text and code). Fonts in examples/fonts are SIL OFL 1.1, credited per file.
version: 1.0.0
---

# Premium typography

On award sites the type **is** the layout: one oversized headline, a calm body face, small exact labels.
Most cheap-looking sites fail on type before anything else: default fonts, too many weights, headlines with
body-text spacing, and text that jumps when the web font arrives.

```
idea + industry -> 1 display face + 1 body face (+ mono for data) -> licence check -> fluid scale (type-scale.mjs)
    -> tracking/leading per size -> craft details -> loading (preload, swap, metric fallback) -> specimen QA at 1440/390/360
```

Quick start:

```bash
node scripts/type-scale.mjs --css                                    # fluid scale 360 -> 1440, ready to paste
node scripts/type-scale.mjs --min-vw 360 --max-vw 1920 --base 16:19 --ratio 1.2:1.38 --css   # bigger desktop ceiling
node scripts/type-scale.mjs --check "clamp(2.75rem, 6.5vw + 1rem, 6.5rem)"                    # px at 6 widths
```

`examples/index.html` is a working specimen: the scale, the pairing, a masked line reveal, an italic serif keyword
inside a grotesk headline, mono index tags, and a word-by-word scroll-lit manifesto, with self-tests.

---

## 0. Desktop first, no compromise

Sujon's rule (30 Oct 2026): *"PC me no compromise, ek dam best."* For type:

1. **The desktop headline is big.** On a 1440px screen the H1 is 96-110px and the hero display line may go to
   140-200px (one or two words). Do not cap headings at phone-friendly sizes. On screens wider than 1440px let the
   scale keep growing to a ceiling (run `type-scale.mjs --max-vw 1920`), or the hero looks small on a 27-inch monitor.
2. **Use every axis the font has.** Variable fonts carry weight, width and optical size; desktop gets the real optical
   size for display (`font-optical-sizing: auto`) and the exact weight (e.g. 640, not 600 or 700).
3. **Load the real fonts, all of them, before the hero animates.** No system-font headline on desktop, ever. Preload the
   display face used above the fold.
4. **Full craft details on**: kerning, ligatures, `text-wrap: balance` on headings, `hanging-punctuation`, tabular
   numbers in prices and specs, true italics (never a slanted roman).
5. **Line length 60-72 characters for body on desktop**, not the full container width.

### Phone parity

- **Same families, same weights, same files.** Never swap the phone to system fonts "for speed": two woff2 files
  of 20-60 KB each are not a performance problem. Phone = PC quality (Sujon, 27 Oct 2026).
- Sizes come from the same `clamp()` tokens, so the phone gets the same hierarchy, scaled.
- **Body text never below 16px on a phone** (also stops iOS from zooming into form fields).
- A hero headline on 360px holds **2-4 words per line, at most 3 lines**. If it needs more, the copy is too long,
  not the font too big.
- Hover-only type effects need a tap or scroll equivalent (see micro-interactions skill).

---

## 1. Rules with reasons

| # | Rule | Why |
|---|---|---|
| T-R1 | **One display face + one body face.** A mono is allowed as a third only for data (index numbers, specs, coordinates, prices). | His checklist: *"2-3 weight maximum... Proper heading/body contrast"*; Drive: "ek heading font + ek body font". More families = no voice. |
| T-R2 | **Two or three weights per family.** Typical: body 400 + 500/600; display one weight. | Every weight is a file and a decision; three is enough for hierarchy. |
| T-R3 | **Banned as defaults: Inter, Geist, Space Grotesk** (and Roboto/Arial/Helvetica as visible faces). | His 30-item avoid list. These are the defaults of AI tools and UI kits; a premium site needs a voice. |
| T-R4 | **Headlines get negative tracking, labels get positive tracking.** -0.04em at 80px+, -0.03em around 56px, 0 for body, +0.08 to +0.14em for small uppercase/mono labels. | Large type at default spacing looks loose and cheap; small caps at default spacing look cramped. |
| T-R5 | **Headline leading 0.92-1.05, body 1.5-1.7.** | Display type is read as a shape; body is read as lines. |
| T-R6 | **Fluid sizes with `clamp()`**, never fixed px for headings. | Master Award System §2 Step 4: *"Never hardcode static pixel sizes for headings."* One rule serves 360 to 1920. |
| T-R7 | **Body measure 45-75 characters** (`max-width: 62ch` is a good default). | Long lines tire the eye; short lines break rhythm. |
| T-R8 | **Contrast between display and body** in at least two of: classification (serif vs grotesk), width, weight, size. | Two similar sans faces read as a mistake. |
| T-R9 | **Real licence for every font**, self-hosted when the licence allows. | His Drive: *"har font ka apna licence padho"*. A pirated font on a client site is the client's legal risk. |
| T-R10 | **No layout shift when fonts load.** | Text that jumps reads as broken and costs Core Web Vitals (CLS). |
| T-R11 | **No em dashes in UI copy** for Zyqor sites; use commas, colons or full stops. | His avoid list ("em dashes"); they have become a tell of AI-written copy. |
| T-R12 | **Mono only where it carries information.** | Drive T2: "monospace index tags/metrics", not mono as decoration. |

---

## 2. Choosing the pair

### 2.1 Decision rules

1. Start from the **idea**, not the industry: a site about a hi-fi deck wants an engineered grotesk; a perfumer wants a
   high-contrast serif. Write the voice in three words ("warm, exact, slow").
2. Pick the **display face** first; it carries the voice. It can be expressive (condensed, high contrast, quirky).
3. Pick the **body face** for reading: open shapes, generous x-height, a real italic, at least 4 weights available.
4. Check the two side by side at H1 and 17px body, on paper and on the deep canvas.
5. Only add a mono if the site shows data (prices, specs, coordinates, numbered chapters).

### 2.2 Proven pairs (open licences unless stated)

| Use | Display | Body | Data | Licence |
|---|---|---|---|---|
| Portfolio / studio | Instrument Serif (italic for keywords) | Plus Jakarta Sans | JetBrains Mono | all OFL |
| Luxury / jewellery | Cormorant Garamond or Playfair Display | Plus Jakarta Sans | - | OFL |
| Real estate / interiors | Instrument Serif | Plus Jakarta Sans | Space Mono | OFL |
| Healthcare | Fraunces (soft optical size) | Plus Jakarta Sans | DM Mono | OFL |
| Dining / coffee / hotel | Newsreader or Cormorant Garamond | Work Sans | - | OFL |
| Education | Bricolage Grotesque | Plus Jakarta Sans | - | OFL |
| Fitness / sport | Anton or Oswald | DM Sans | - | OFL |
| Law / finance | Libre Baskerville or Newsreader | Work Sans | - | OFL |
| Streetwear / music | Archivo Black or Archivo (wdth 62-125) | Archivo | JetBrains Mono | OFL |
| Skincare / spa | Cormorant Garamond (italic accents) | Outfit | - | OFL |
| Engineering / hi-fi / tech product | Archivo (condensed 800) | Bricolage Grotesque or Work Sans | JetBrains Mono | OFL |

Rows come from Sujon's Drive (Master Award System §4 font column, Website-Building Guide §4e) with every row that
listed Inter, Geist or Space Grotesk changed (T-R3). On the 20 award winners studied on Oct 30 2026, the most common
pattern was **a grotesk + an editorial serif**; Neue Montreal (Pangram Pangram, paid) appeared on 6 of 20.

### 2.3 Fonts already used in this repo (and their licences)

| Font | Licence | Status |
|---|---|---|
| Instrument Serif, Fraunces, Bricolage Grotesque, Archivo, Anton, JetBrains Mono, Inter Tight, Unbounded, Roboto Flex | SIL OFL 1.1 | free to self-host, subset, bundle in a public repo |
| Cabinet Grotesk, Satoshi, General Sans, Zodiak, Switzer, Boska (Indian Type Foundry via Fontshare) | ITF Free Font License | free for commercial use and web embedding; **see the caution in section 7** |

Inter Tight is a separate family from Inter. The portfolio uses it as a body face; it is allowed, but do not pick it as
a default for new work (it reads close to Inter).

---

## 3. The fluid scale

Run `node scripts/type-scale.mjs --css`. Defaults: 360px to 1440px, body 16 to 18px, ratio 1.2 on phone to 1.333 on
desktop (a bigger ratio on big screens = more drama where there is room).

```css
:root{
  --fs-small:clamp(0.8333rem, 0.8298rem + 0.0157vw, 0.844rem);
  --fs-body:clamp(1rem, 0.9583rem + 0.1852vw, 1.125rem);
  --fs-h6:clamp(1.2rem, 1.1001rem + 0.4439vw, 1.4996rem);
  --fs-h5:clamp(1.44rem, 1.2537rem + 0.8281vw, 1.999rem);
  --fs-h4:clamp(1.728rem, 1.4158rem + 1.3877vw, 2.6647rem);
  --fs-h3:clamp(2.0736rem, 1.5808rem + 2.1902vw, 3.552rem);
  --fs-h2:clamp(2.4883rem, 1.7395rem + 3.3281vw, 4.7348rem);
  --fs-h1:clamp(2.986rem, 1.8775rem + 4.9267vw, 6.3115rem);
}
```

The Drive's own values (Master Award System §2 Step 4) are also good and are what Zyqor concepts ship with:

| Token | Value | At 360 / 1440 | Leading | Tracking | Weight |
|---|---|---|---|---|---|
| H1 | `clamp(2.75rem, 6.5vw + 1rem, 6.5rem)` | 44 / 104px | 0.96 | -0.04em | 600 |
| H2 | `clamp(2rem, 4vw + 0.5rem, 4rem)` | 32 / 64px | 1.04 | -0.03em | 600 |
| H3 | `clamp(1.25rem, 2vw, 1.75rem)` | 20 / 28px | 1.2 | -0.02em | 500-600 |
| Body | `clamp(1rem, 1.1vw, 1.15rem)` | 16 / 18.4px | 1.65 | 0 | 400 |
| Eyebrow / index | mono `0.75rem`, uppercase | 12px | 1 | +0.14em | 500 |

(`type-scale.mjs --check` verified the H1 numbers.)

### Tracking and leading by size (what `type-scale.mjs` prints)

| Size | Leading (sans / serif) | Tracking |
|---|---|---|
| 80px and up | 0.95 / 1.0 | -0.04em |
| 56-80px | 0.95 / 1.0 | -0.035em |
| 36-56px | 1.02 / 1.05 | -0.025em |
| 24-36px | 1.12 | -0.015em |
| 20-24px | 1.3 | 0 |
| body 16-20px | 1.55-1.7 | 0 |
| under 14px | 1.5 | +0.02em (uppercase/mono labels +0.08 to +0.14em) |

Condensed and high-contrast serif display faces usually need 0.03-0.05 more leading than a grotesk at the same size;
check descenders do not touch the next line's ascenders.

---

## 4. Craft details (the things judges notice)

```css
html{ -webkit-text-size-adjust:100%; text-rendering:optimizeLegibility; font-kerning:normal;
      font-optical-sizing:auto; font-synthesis:none; }      /* never fake bold or italic */
h1,h2,h3{ text-wrap:balance; }                              /* even line lengths in headlines */
p,li{ text-wrap:pretty; hanging-punctuation:first allow-end; } /* no orphans; quotes hang (Safari) */
.price,.spec,table{ font-variant-numeric:tabular-nums lining-nums; } /* columns of numbers line up */
.eyebrow{ font-family:var(--font-mono); font-size:.75rem; letter-spacing:.14em; text-transform:uppercase; }
abbr,.caps{ font-variant-caps:all-small-caps; letter-spacing:.04em; }
em,i{ font-style:italic; }   /* only with a real italic file loaded (font-synthesis:none stops fake slants) */
```

| Detail | Do | Why |
|---|---|---|
| Quotes and apostrophes | Use real typographic marks: ’ “ ” | Straight quotes in a headline are an instant amateur tell. |
| Numbers | Tabular in tables and prices, proportional in running text | Prices that jump in width look broken in an odometer. |
| Italic keyword | One italic serif word inside a grotesk headline (*"Built to be* **heard**"); one per headline | Drive T4 "Typography as Architecture"; it adds voice without a third font. |
| Index tags | `01 // Studio` in mono, uppercase, tracked | Drive T2; gives the page a reading order. |
| Widows | `text-wrap: pretty`, or a `&nbsp;` between the last two words | A single word on the last line of a headline breaks the shape. |
| Baseline alignment | Align labels and numbers across columns to one baseline | Drive T9: "baseline alignment, text wrapping, optical spacing". |
| Optical size | Use the display cut (or `opsz` axis) for big type, text cut for body | Thin details survive at large size only. |
| Selection | `::selection` in the accent | A detail people find when they copy text. |

---

## 5. Motion for type (two patterns, tested in the example)

### 5.1 Masked line reveal (Drive T5)

Each line sits in an `overflow:hidden` mask and rises from `translateY(105%)` to `0` with a 0.08 s stagger on the
settle curve. Fast, no bounce, no blur (Sujon's verdict on reveals, Drive M5).

```html
<h2 class="reveal-lines"><span class="line"><span>Made slowly,</span></span><span class="line"><span>sold <em>quietly</em>.</span></span></h2>
```
```css
.reveal-lines .line{display:block;overflow:hidden;padding-bottom:.08em}       /* padding keeps descenders inside the mask */
.reveal-lines .line>span{display:inline-block;transform:translateY(105%);transition:transform .9s cubic-bezier(.16,1,.3,1)}
.reveal-lines.is-in .line>span{transform:none}
.reveal-lines .line:nth-child(2)>span{transition-delay:.08s}
.reveal-lines .line:nth-child(3)>span{transition-delay:.16s}
@media (prefers-reduced-motion: reduce){.reveal-lines .line>span{transform:none;transition:none}}
```
```js
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.4 });
document.querySelectorAll('.reveal-lines').forEach((el) => io.observe(el));
```

Write the lines by hand (one span per visual line) for the hero; for long text, split by words instead, because the
browser decides line breaks and they differ between 1440 and 390.

### 5.2 Word-by-word scroll-lit manifesto (Drive T6)

A pinned stage about 150-200vh tall; each word goes from opacity 0.15 to 1 as the scroll passes it. Reduced motion
shows the paragraph fully lit.

```js
function manifesto(section){
  const p = section.querySelector('p');
  p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  const words = [...p.querySelectorAll('.w')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { words.forEach((w) => (w.style.opacity = 1)); return; }
  let ticking = false;
  const update = () => { ticking = false;
    const r = section.getBoundingClientRect(); const total = r.height - innerHeight;
    const t = Math.min(1, Math.max(0, -r.top / total));           // 0..1 through the pinned stage
    const lit = t * words.length * 1.15;                          // finish lighting a little before the end
    words.forEach((w, i) => (w.style.opacity = Math.min(1, Math.max(0.15, lit - i + 0.15))));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}
```
```css
.manifesto{height:200vh}
.manifesto .stick{position:sticky;top:0;height:100vh;display:grid;place-items:center}
.manifesto p{font-size:var(--fs-h3);line-height:1.15;letter-spacing:-.02em;max-width:22ch}
.manifesto .w{opacity:.15;transition:opacity .2s linear}
```

On phones use `100svh` for the sticky stage height so the URL bar does not resize it.

---

## 6. Loading fonts without layout shift

```html
<!-- Preload only the face used above the fold (one or two files) -->
<link rel="preload" href="/fonts/display.woff2" as="font" type="font/woff2" crossorigin>
```
```css
@font-face{font-family:"Display";src:url(/fonts/display.woff2) format("woff2");
  font-weight:200 800;            /* variable range: one file, every weight */
  font-style:normal;font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC}
/* A metric-matched fallback so the swap does not move text: */
@font-face{font-family:"Display Fallback";src:local("Arial");
  size-adjust:104%;ascent-override:92%;descent-override:24%;line-gap-override:0%}
h1{font-family:"Display","Display Fallback",sans-serif}
```

- The override numbers above are an **example shape**, not values for your font. Generate the real ones from the font
  file with Fontaine (unjs) or the Capsize metrics package, then check: screenshot with the font blocked and with it
  loaded; the headline should not move.
- `font-display: swap` for body; for a hero display line that animates in, wait for it instead:
  `await document.fonts.load('600 1em "Display"')` before starting the reveal, with a 1.5 s timeout so a slow network
  still gets text.
- Subset to Latin (`pyftsubset` from fontTools, or `glyphhanger`) **only if the licence allows modification**
  (OFL does; ITF FFL as read in this repo does not, see section 7). Keep the full file for languages you serve
  (Hindi copy needs a Devanagari-capable face such as Mukta, Hind or Noto Sans Devanagari, all OFL).
- Budget: 2-4 font files, 20-130 KB each as woff2, under 300 KB total for type.

---

## 7. Licensing (read this before downloading any font)

| Source | Licence | Self-host? | Subset/convert? | In a public repo / download kit? | Notes |
|---|---|---|---|---|---|
| Google Fonts (most) | SIL OFL 1.1 (some Apache 2.0) | yes | yes (OFL: keep the licence, respect Reserved Font Names when modified) | yes, with the OFL text | The safe default. |
| Fontshare (Indian Type Foundry) | ITF Free Font License (FFL) | yes, as published | **no** as read in this repo's credits notes (served unmodified) | **open question**: the licence forbids redistributing the fonts on their own; a public repo where anyone can download the woff2 files is close to that | Zyqor's repo decision on these files is pending with Sujon; until he decides, use OFL faces in anything downloadable. |
| Pangram Pangram, Klim, Grilli Type, Commercial Type, Dinamo, etc. | paid EULA (web licence priced by monthly page views) | per EULA | per EULA | no | Free "trial" or "personal use" downloads are **not** for client sites. |
| Adobe Fonts | subscription | no (served from Adobe's kit) | no | no | Stops working when the subscription ends. |
| Font "free download" sites | unknown | treat as no | no | no | His Drive rule: unclear licence means do not use. |

Every font gets a credit line (family, designer, licence, source URL, date) in the project's CREDITS file and, for
this repo, a `.credit.json` beside the file (the credit gate fails without it).

---

## 8. Do and don't

| Do | Because |
|---|---|
| Choose the display face from the idea's voice | the type then belongs to the brand |
| Use one variable file instead of 4 static weights | fewer requests, every weight available |
| Set headlines by hand on the hero (line breaks chosen) | the most-seen line deserves a decision |
| Preload the above-the-fold face | the hero reveal waits for the right font |
| Check a headline at 360px before falling in love with it | phone parity |

| Don't | Because |
|---|---|
| Use Inter, Geist or Space Grotesk as the voice | his avoid list; default AI look |
| Use more than two families plus mono | no voice, more bytes |
| Fake bold or italic (`font-synthesis`) | smeared shapes, an instant tell |
| Letter-space lowercase body text | it breaks word shapes |
| Center long paragraphs | ragged both sides is hard to read; center only 1-2 short lines |
| Use ALL CAPS for more than a short label | caps are slow to read |
| Animate text with blur or bounce | his verdict: fast and smooth, no bounce, no blur |
| Ship a font you cannot show a licence for | legal risk lands on the client |

---

## 9. Tiers: normal vs advanced vs premium

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Families | display + body (OFL) | display + body + mono | a characterful display (variable, maybe paid licence) + body + mono |
| Scale | Drive tokens or `type-scale.mjs` defaults | tuned ratio, 1920 ceiling | per-breakpoint tuned, hand-set hero lines, optical sizes |
| Motion | masked line reveal on headings | + word-lit manifesto, split headings | + type that reacts to the 3D scene or a variant (weight/width axes animated on scroll) |
| Craft | balance, tabular nums, real quotes | + hanging punctuation, small caps, metric fallback | + kerning pairs checked on the hero, custom wordmark in the footer |
| Loading | swap, 2-3 files | preload + metric fallback | preload + `document.fonts.load` gate + per-language subsets |
| Proof | specimen screenshot at 1440 / 390 | + CLS 0 on font swap | + licence file in the handover |

---

## 10. Pre-ship checklist

- [ ] Display + body (+ mono only for data). Families counted in DevTools > Network > Font: at most 3.
- [ ] At most 3 weights per family actually requested.
- [ ] None of Inter / Geist / Space Grotesk as a visible face.
- [ ] Every heading size is a `clamp()` token; `type-scale.mjs --check` run on the H1 at 360 and 1440.
- [ ] Headline tracking negative, label tracking positive, body leading 1.5-1.7.
- [ ] Body text 16px or more at 360px; measure 45-75 characters on desktop.
- [ ] `text-wrap: balance` on headings, `pretty` on paragraphs, tabular numbers on prices.
- [ ] Real quotes and apostrophes; no em dashes in UI copy.
- [ ] Above-the-fold face preloaded; no visible jump when fonts load (CLS 0).
- [ ] Hero headline: at most 3 lines at 360px, no single-word last line.
- [ ] Every font has a licence you can name and a credit line; nothing from a trial download.
- [ ] Same fonts on phone and desktop.
- [ ] Reduced motion: all text visible without animation.

## 11. Files

| File | What |
|---|---|
| `scripts/type-scale.mjs` | fluid scale generator, clamp evaluator, tracking/leading rules (ES module, also importable) |
| `examples/index.html` | specimen: scale, pairing, masked reveal, italic keyword, mono tags, scroll-lit manifesto, self-tests |
| `examples/fonts/` | Bricolage Grotesque, Archivo, Instrument Serif (roman + italic), JetBrains Mono, all SIL OFL 1.1, each with a `.credit.json` |

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 27 Oct 2026 ("premium fonts"), 30 Oct 2026 ("PC me no compromise"); his 30-item avoid list (2 Oct 2026, his Drive).
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* Part E §1 (agency-standard type), §2 Step 4 (fluid scale values), §4 (industry font rows), §7 Part C rules 1-2 (italic keyword, masked lines), Structure 10 (kinetic manifesto), §12; Part F items 13-14 (heading + body, 2-3 weights, Fontshare licence note); *web-design-promo-checklist.txt* ("Typography", "Details that make it feel premium"); *Website-Building-Guide-New-Site.md* §2, §4a-4e, §5b, §8.
- Drive points T1-T9, M5, X7 (see `docs/beast/SKILLS_SOURCE_MAP.md`).
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: copy rules (eyebrow 2-4 words, title 3-6 words, one plain sentence) and `--sw-font-*` tokens through a cascade layer; its `ui-rounded` system display font is the counter-example (no premium face).
- Awwwards Sites of the Year and Sites of the Day read on Oct 30 2026 (font observations in `docs/how-top-designers-build-unique-sites.md`).
- SIL Open Font License 1.1, https://openfontlicense.org ; ITF Free Font License as summarised in this repo's `docs/CREDITS_NOTES.md`; Fontshare, https://www.fontshare.com.
- W3C CSS Fonts Level 4 (`font-optical-sizing`, `size-adjust`, `ascent-override`), CSS Text Level 4 (`text-wrap: balance | pretty`, `hanging-punctuation`); Fontaine (https://github.com/unjs/fontaine) and Capsize (https://seek-oss.github.io/capsize/) for fallback metrics; fontTools `pyftsubset` and glyphhanger for subsetting.
- Robert Bringhurst, *The Elements of Typographic Style* (measure of 45-75 characters).
