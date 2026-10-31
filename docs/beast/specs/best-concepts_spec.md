# "Best Concepts": the button + the page (plan, for Sujon's review)

Portfolio: https://zyqor-portfolio.vercel.app/ · repo zyqorbusiness-lab/best-website-designer, folder `site/`.
Principle (his words): "kam par flawless > zyada par average". The page lists only concepts that pass every gate below. It starts small on purpose.

## 1. Selection gate (a concept is listed only if ALL are true)
1. QA PASS on the latest harness run: 0 console errors at 1440 / 390 / 360, reduced motion, WebGL off.
2. A strong first screen AND a strong middle. Not "nice hero, then lists of text": the repo's own Oct 30 audit says that is the weak spot of most library concepts.
3. A signature interaction you remember after 10 seconds.
4. **Clean licences**: OFL/Google fonts only, no Mixkit, no Fontshare, every asset credited. (The Fontshare/Mixkit decision is still open from Oct 29, so anything that carries them waits.)
5. Honest content: CONCEPT tag, fictional brand, no fake stats.
6. Never Numivra (or any math/edu SaaS item he removed).

## 2. What I looked at (Oct 31, live site, 1440×900 first screen + a mid-page shot, plus the source files)
- All 19 built library concepts (N001–N010, N014, N020, N025, N048, A013, A018, A027, P017, P041): every page loaded with 0 console errors in my run.
- All 18 lab concepts (/lab/stride … /lab/volta).
- Fonts and assets read from the repo per page.

### Proposed shortlist: 5 (4 now + the new one when it passes)
| # | Concept | Live link | One line for the card | Why it's in |
|---|---|---|---|---|
| 1 | **Hotcoal Kitchen** (P041, Premium) | https://zyqor-portfolio.vercel.app/library/p/P041/ | Build your own wood-fired pizza: drag real toppings onto the base, then fire it. | The strongest piece: a real interactive product moment, real photo-scan ingredients, a full-height story. OFL fonts (Fraunces, Inter Tight). |
| 2 | **Ironbark Barbers** (N048) | https://zyqor-portfolio.vercel.app/library/n/N048/ | A real barber chair turns on a ring of six services; pump the seat to pick one. | Bold first screen, a memorable 3D interaction, a long and well-built page. OFL (Anton, Inter Tight). |
| 3 | **Glint Eyewear** (N014) | https://zyqor-portfolio.vercel.app/library/n/N014/ | Real spectacles over a live eye chart; the lenses refract the chart as you change the power. | The cleverest interaction in the library; a calm premium layout. OFL (Archivo, Inter Tight). |
| 4 | **Loomhouse Tailors** (N001) | https://zyqor-portfolio.vercel.app/library/n/N001/ | Hover a fabric swatch and the hero floods with that cloth from your cursor. | The most fashion-premium look; the longest polished page of the Normal tier. OFL (Instrument Serif, Inter Tight). |
| 5 | **Humdinger** (new 3D concept, once built and QA-passed) | /showcase/humdinger/ | A pocket groovebox you can actually play: the 3D device flips, opens up and makes real sound. | The Buttermax-level flagship he asked for today. Listed first once it passes the gate. |

### Looked at and NOT listed (honest reasons)
- **Northpine Cabins (N008)**: a great winter/summer 3D diorama hero, but its page loads the shared kit with Fontshare fonts and its middle is mostly text. It's the first candidate for slot 6 after a font swap + middle rebuild.
- **Kiln & Quiet (N002), Brasswick Diya (N007), Rootline Citrus (N010)**: clean heroes, thin middles. Good, not "best".
- **Cut & Grain (A027), Shelfline (A013), Tranquility Base (A018)**: strong scroll moments, but the first screen shows no product (type only).
- **Tapehead Hi-Fi (P017)**: the cassette scan still shows its original maker's badge (from the repo audit), and the dark brown background is close to his "no black" rule.
- **Glasskit (N009), Bathtime Duck (N025), Chordline (N020), Tidewell (N003), Morrow (N004), Fieldnote (N005), Quarry (N006)**: fine demos, not top-tier.
- **All 18 lab concepts (/lab/…)**: several are visually top-tier (Meridian watch, Hush headphones, Halde camera, Stride, Talus bike), BUT every lab page loads `lab/_kit/lab.css`, which carries Satoshi + Cabinet Grotesk (Fontshare), and Carmine/Longway/Rise use Mixkit frames. Until he decides the Fontshare/Mixkit question, they fail gate 4. If he says "swap the fonts to OFL", Meridian, Hush and Halde are the next three I'd add.

## 3. The button
**Desktop (site/index.html header `.nav`):** add one pill just before "Start a project":
`<a class="btn btn--best" href="best/">` + a small 4-point star SVG + "Best concepts".
- Style: outline pill, 1.5 px Pine border, Pine text, Ivory fill; on hover it fills Ochre #8F6420 with Ivory text and the star turns 45°. Same height as "Start a project", so the two read as a pair (primary = start a project, secondary = see the best).
- Also a second entry where people already look for work: at the end of the "(03) Concept library" heading block, a text link "See the 5 best →".
**Phone (site/m/index.html header):** the phone header today shows only the logo + "Start a project" (other nav links are hidden by m.css). Add a 40 px round icon button with the star (aria-label "Best concepts") left of "Start a project"; at ≥ 390 px it shows the word "Best" beside the star. Plus the same "See the 5 best →" link in the library section.
- Constraints respected: no edits to `site/assets/hero/*`, `config-desktop.js`, `m/config-mobile.js`; the `google-site-verification` meta in site/index.html stays exactly as it is; only the header markup and a few lines of CSS change (in site.css and m/m.css).

## 4. The page: /best/ (separate desktop `site/best/index.html` and phone `site/best/m.html`, same content)
- Look: the portfolio's own palette (Ivory #F3EDE1 page, Pine #17423C text, Ochre #8F6420 accent) and fonts (Fraunces display, Inter Tight body). No new colours.
- **Top:** a slim header with "← Back to portfolio" and the Zyqor logo. Kicker "(Best) Hand-picked", H1 in Fraunces: "Five concepts. Every one finished." Lead: "Only the work that passes every check on desktop and two phone sizes. Fictional brands, real 3D, built by hand."
- **List:** one big card per concept, stacked (not a grid: each concept gets the full width, like a gallery wall).
  - Desktop card (1200 × ~560): left 60% a muted, looping 6–8 s screen recording of the concept (poster first, `preload="none"`, starts when 40% visible, pauses off-screen); right 40%: a number "01", the name, a "CONCEPT" chip + tier chip (Premium / Normal), the one-line idea, 3 small tags (e.g. "Drag + drop", "Real scans", "Phone build"), and a button "Open live site ↗" (new tab). Hover: the video scales 1.02 and the button arrow nudges.
  - Phone card: the recording on top at 4:5 (new phone recordings of the 4 concepts: only N020 and P017 have one in `site/media/concepts/` today, and neither is on the list, so all 4 get new ones; the 3x captures from today's launch film can be the posters), then the text, then a full-width "Open live site" button.
- **Footer note:** "Every brand here is invented. Assets credited on each concept page." + "Want one like this for your business? Start a project" → the portfolio's #contact.
- Reveal: cards rise 20 px + fade (480 ms, expo-out), one at a time. Reduced motion: no autoplay video, posters only.
- Weight: page shell ≤ 150 KB; each video ≤ 1.2 MB (desktop) / 700 KB (phone), loaded lazily.
- SEO: title "Best concepts · Zyqor Studio", description, canonical `https://zyqor-portfolio.vercel.app/best/`, an `alternate` to m.html, og image = a 1200×630 collage of the 5 heroes. **Add `https://zyqor-portfolio.vercel.app/best/` (and `/showcase/humdinger/`) to `site/sitemap.xml`.**
- QA: the same gate (0 console errors 1440/390/360, no overflow, external links in a new tab).

## 5. Things only Sujon decides
1. The shortlist: 4 now (P041, N048, N014, N001) + Humdinger later. Should Northpine (N008) get the font swap + rebuild to join?
2. Fontshare/Mixkit: if he says "swap to OFL fonts", the lab's Meridian, Hush and Halde can be fixed and considered.
3. Button wording: "Best concepts" (my pick) vs "Top work" / "Best of Zyqor".


---

## 6. Build notes (Oct 31 2026, as built)
- Page: `site/best/index.html` + `best.css` + `best.js` at https://zyqor-portfolio.vercel.app/best/ . Order: Humdinger (passed the gate), Hotcoal P041, Ironbark N048, Glint N014, Loomhouse N001. Each card: a looping, muted screen recording made from that concept's own page (desktop 1280x800 page, about 7.5 s; phone build 390x844 cropped to 4:5), number, name, CONCEPT chip + tier chip, one line, 3 tags, "Open live site" (new tab). Clips load only when a card is 40 % on screen and pause off-screen; with reduced motion only the poster frames show.
- Recordings: frame by frame in headless Chrome with the page clock slowed 5x (so motion stays smooth), encoded H.264; every clip is far under the 1.2 MB / 700 KB budget.
- Deviation: ONE responsive page instead of index.html + m.html. It has no 3D and no heavy media, so a single page with a phone layout under 860 px is simpler and identical on both; it still picks the phone recording and poster on phones.
- Header button: desktop `site/index.html` nav gets an outline pill "Best concepts" with a 4-point star before "Start a project" (ivory fill, pine outline, fills ochre on hover, star turns 45 deg); under 1380 px wide it reads "Best". It is not a `.btn`, so the liquid-glass map does not turn it into a second ochre CTA. Phone `site/m/index.html`: a 40 px round star button before "Start a project", with the word "Best" from 421 px up (at 390 px the word pushed "Start a project" onto two lines). Both pages also get "See the 5 best ->" under the library intro.
- Untouched: site/assets/hero/*, config-desktop.js, m/config-mobile.js; the google-site-verification meta in site/index.html is unchanged. `/best/` and `/showcase/humdinger/` were added to site/sitemap.xml.
