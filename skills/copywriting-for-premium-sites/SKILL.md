---
name: copywriting-for-premium-sites
description: Write the words of a premium website so they sound like a specific business written by a person - the facts sheet interview, the voice brief, headline / eyebrow / body / CTA formulas with numbers (scroll-world's 2-4 / 3-6 / one-sentence rule), honest proof (no invented testimonials, logos, metrics or awards), concept labelling, microcopy for forms, errors, empty and 404 states, copy that also serves search, US English for US clients, and a banned list with replacements. Includes scripts/copy-lint.mjs (filler, AI wording, em dashes, fake proof, generic buttons; exit 1 on errors), a live before/after copy desk page, and what the linter found and fixed on the portfolio.
when_to_use: before motion or layout polish on any page, "write the copy", "the text sounds generic / like AI", "make the headline better", writing CTAs, forms, error messages, 404 pages, a client gives you bullet notes, reviewing a site's words before launch
license: MIT (text and code). Sources credited in CREDITS.md.
version: 1.0.0
---

# Copywriting for premium sites

Premium copy is **specific, short and true**. The fastest way a beautiful site starts to look like every other
generated page is its words: "Elevate your digital journey with seamless, cutting-edge solutions." Nobody has ever
bought bread, a haircut or a website because of that sentence. A premium page names the thing, the place, the number
and the next step, in the voice of the business.

```
interview -> facts sheet -> voice brief -> page skeleton (eyebrow / title / body / proof / CTA per section)
   -> draft -> copy-lint.mjs -> read aloud -> cut 20% -> client approves the facts -> lock before motion
```

Quick start (Node 18+, no install):

```bash
node scripts/copy-lint.mjs ./site                      # every .html in the folder; exit 1 on errors
node scripts/copy-lint.mjs draft.txt --allow "AI"      # a text file; allow a word when the client's product really is about it
node scripts/copy-lint.mjs ./site --json copy.json
```

`examples/index.html` shows one bakery hero before and after these rules, linted live, plus a box to lint any text.

---

## 0. Desktop first, no compromise

Zyqor Studio's rule (Sujon, 30 Oct 2026): *"PC me no compromise, ek dam best."* For words that means:

1. **Write for the big screen's display type first.** A 3-6 word title set at 96-140 px at 1440 wide is the hero's
   centrepiece; every word must earn that size. Read it at full size in the browser, not in a document.
2. **Measure 60-75 characters** for body text at 1440 (`max-width: 62ch` is a good default). Long lines are the most
   common reason premium layouts read as cheap.
3. **Use the room**: desktop can carry a proof row, a short manifesto, a caption under every image. Write them; do not
   cut content from desktop to match the phone.

### Phone parity

- **The same words on the phone.** Do not write a second, shorter site; write tight copy once. The phone may hide
  an image caption behind a tap, never a fact.
- Titles that wrap to 2-3 lines at 360 px: use `text-wrap: balance` on headings and check no line holds a single word.
- CTA text must fit one line in a 44-48 px button at 360 px (about 20 characters at 16 px).
- Phone numbers are links (`tel:`), addresses open maps, emails open mail: on a phone, copy is also a control.

---

## 1. The rules (each with its reason)

| # | Rule | Why |
|---|---|---|
| CW-R1 | **Specific nouns and numbers beat adjectives.** "120 loaves by 7 am" beats "freshly baked daily". | The Drive's own example: *"Hand-finished Grade-5 brushed titanium"* over "premium quality" (point H3). Specifics are believable and nobody else can say them. |
| CW-R2 | **No filler phrases** (the banned list, section 9). | They are the signature of template and generated copy; Sujon's Drive bans them by name (MA Part E §1 "Generic Marketing Fluff"). |
| CW-R3 | **Nothing on the page says or looks AI.** No "AI-powered", no "no AI imagery" either. | His rule: *"Website me AI ka mention kahin nahi"* (H4). Even denying it puts the word on the page. |
| CW-R4 | **Real proof or nothing.** Named customers with permission, real numbers with a source, real screenshots. If none exist: leave the block out or mark it "sample". | Drive H1. A fake testimonial is a lie a customer can catch, and in many places it is illegal advertising. |
| CW-R5 | **Never claim an award** or "Awwwards-level". | Not verifiable (Drive H7). Describe what the site does instead. |
| CW-R6 | **Concepts are labelled concepts**: fictional brand, "Concept: not sent" on forms. | Drive H5; the portfolio's honesty is part of its pitch. |
| CW-R7 | **One language, one spelling, one voice per site.** US clients get US English ("color", "center"). | Drive H11 ("har page par same"). Mixed spelling reads as pasted. |
| CW-R8 | **Calm, specific CTAs**: verb + object + context. | Drive H12: *"Clear, Contextual, Visible, Action-specific"*; not a giant glowing "Get started". |
| CW-R9 | **No em dashes, no "it's not X, it's Y", no checkmark bullets.** | Sujon's avoid list (2 Oct 2026) names all three as tells of generated copy. Use commas, colons, full stops; plain lists or numbered rows. |
| CW-R10 | **Write the copy before the motion.** | Choreography times words (scroll-world fades the first section's copy by 62% of its segment, SW-T15); you cannot time words that do not exist. |
| CW-R11 | **One idea per section, one focal point.** The section's title says the idea. | Drive L4: one focal point per section. Copy is the first place a section loses focus. |
| CW-R12 | **Read it aloud.** Anything you would not say to the customer across the counter goes. | Spoken rhythm exposes filler faster than any script. |

---

## 2. The interview and the facts sheet (before writing a word)

Ask the client (or, for a concept, decide and write down) these, in this order. The first question is open; the rest
fill the gaps (scroll-world's interview rule, SW-T22: ask the subject openly, then only what cannot be defaulted).

1. "Tell me about the business in your own words." (Record the phrases they use; the best lines come from here.)
2. What do you sell, to whom, where? (Products / services, the customer, the town or area.)
3. What is true about you that a competitor cannot say? (Years, a method, an ingredient, a machine, a guarantee.)
4. Numbers you can stand behind: years open, items made per day, response time, price from.
5. What should a visitor do first? (Call, book, order, visit, request a quote.)
6. Opening hours, address, phone, email, booking link.
7. Real proof you have permission to show: reviews (with the reviewer's consent or from a public profile, quoted
   exactly), customer names, press, photos.
8. Words you never want used about you. Competitors you do not want to sound like.

Write the answers as a **facts sheet** (`copy/facts.md`): one line per fact, with its source ("owner, call 30 Oct").
Every claim on the site must trace to a line here. That is how "no made-up facts" is enforced in practice.

---

## 3. The voice brief (5 lines)

```
Voice: [3 adjectives]            e.g. warm, exact, unhurried
We sound like: [a person]        e.g. the head baker explaining the oven to a regular
We never sound like: [2-3]       e.g. a startup, a supermarket flyer, a motivational poster
Person: we / I                   Sujon's own site: "I" (one person, start to finish); a team business: "we"
Reading level: plain             short words, sentences of 12-20 words, no jargon the customer would not use
```

Put the voice brief next to the 5-line token summary (playbook §5). Type and colour carry the same adjectives.

---

## 4. The section skeleton and its numbers

Every section of a premium page has the same five slots. Fill them, then delete what the section does not need.

| Slot | Length | Job | Example (concept bakery) |
|---|---|---|---|
| Eyebrow | 2-4 words | where we are / what kind of section | "Open at 6:30" |
| Title | 3-6 words (hero), up to 8 for inner sections | the idea of the section, in one breath | "Sourdough out of the oven by seven." |
| Body | 1 plain sentence (scroll story) or 2-4 sentences (static section), 12-20 words each | the facts that make the title believable | "We bake 120 loaves every morning on Market Street, from flour milled forty miles away." |
| Proof | 0-3 short tags or one quote / number with its source | why believe it | "48-hour ferment · Stone deck oven" |
| CTA | 2-5 words | the next action, in the visitor's words | "Order tomorrow's loaf" |

The eyebrow / title / body / proof-tags numbers are scroll-world's copy rules for scroll chapters (prompts L164-170;
SW-T15). They hold for static sections too, with the body allowed to grow to 2-4 sentences.

---

## 5. Headlines

Formulas that produce specific titles (fill with facts from the sheet; never with adjectives):

| Formula | Example |
|---|---|
| [Product] + [the moment it is best] | "Sourdough out of the oven by seven." |
| [Result] + [time or number] | "Tires fitted while you wait, usually 40 minutes." |
| [Place] + [what happens there] | "A barber's chair on Fourth Street since 1994." |
| [The customer's problem], answered | "Need it altered by Friday? We can do that." |
| The idea sentence, said plainly (from `unique-idea-and-concept`) | "A coffee roaster you walk through, bean to cup." |
| A short claim + a fact underneath | "Quiet cars." / "Every repair road-tested for 15 miles." |

Rules: 3-8 words; one idea; no question marks unless it is the customer's real question; a full stop is allowed and
reads confident; avoid the brand name in the H1 of the home page if the logo already says it (but the `<title>` must
carry it, see `seo-and-meta`). Use `text-wrap: balance`.

The italic-serif keyword move (Drive T4: one word in an italic serif inside a tight sans headline) works only on a
word that carries the meaning: "Six live sites. *Go on,* open one."

---

## 6. Body copy

- **12-20 words per sentence on average**, nothing over 28 (the linter warns). One idea per paragraph, 2-4 sentences.
- **Concrete first, feeling second**: "Flour from a mill forty miles away" makes the reader feel "local and careful"
  without either word.
- **Active voice, present tense, the customer as "you"** where it is natural.
- **Cut 20% after the first draft.** Delete "very", "really", "truly", "simply", "just", "in order to", "we believe".
- **Numbers as digits** ("7 am", "40 minutes", "$300"); spell out one to nine only in running prose if the brand prefers.
- **Prices are honest**: "from $300" means a real $300 package exists (Zyqor's tiers: $300 / $1k / $10k).

---

## 7. CTAs and links

| Bad | Good | Why |
|---|---|---|
| Learn more | See the menu | names what opens |
| Get started | Book a fitting | names the action |
| Submit | Send my request | says what happens |
| Click here | Read the full case study | the link text works out of context (screen readers list links) |
| Contact us | Call the shop · (330) 555-0142 | on a phone this is the fastest path |
| Buy now!!! | Order tomorrow's loaf | calm, specific |

One primary CTA per screen; a secondary one is a text link, not a second big button. The same action has the same
words everywhere on the site (Drive H11: "button language").

---

## 8. Proof, honestly

What counts, strongest first: real numbers from the business with a source on the page ("120 loaves a day, owner's
count, Oct 2026"); named customers with permission; quotes copied exactly from public reviews (Google, Yelp), credited
with the reviewer's first name and the platform; real photos of real work; press with a link.

What never goes on the page: invented testimonials, stock "customer" photos with quotes, logo walls of companies that are
not customers, "+184% conversion" with no source, star ratings typed by hand, "award-winning". Sujon's Drive notes
that every client name, metric and logo in its own 14 blueprints is a placeholder (H1), so blueprints are never
copied with their proof.

For a concept site: no proof section at all, or a clearly labelled sample ("Sample review, concept brand").

---

## 9. Banned list (with what to write instead)

`copy-lint.mjs` errors on these. The replacement is always a fact.

| Banned | Write instead |
|---|---|
| unlock the power / potential | what it actually does |
| seamless(ly) (except "seamless loop") | the step that got shorter |
| elevate your ... | what improves, by how much |
| digital / creative journey | the actual process, in steps |
| next level, take it to the next level | the specific change |
| cutting-edge, state-of-the-art, innovative solutions | the technique or the machine by name |
| game-changer, revolutionise | what changed, before and after |
| in today's fast-paced world | the customer's problem, first sentence |
| world-class, best-in-class | the fact that would prove it |
| harness the power, unleash, empower | what the customer can now do |
| leverage our ... | "use" |
| synergy, tapestry, a testament to | cut it |
| delve into, dive into, embark on | "look at", "start" |
| crafted with love / passion, pixel-perfect, we are passionate about | how it was made; show it |
| one-stop shop | the list of what is included |
| transform your business | the before and after |
| lorem ipsum, placeholder, TBD | the real copy |
| AI, AI-powered, AI-generated, "no AI imagery" | nothing (rule CW-R3) |
| em dash (—), "it's not X, it's Y", ✓ bullets | comma / colon / full stop; one positive statement; plain list |

Warnings (check, then keep or fix): percentages and big counts (source?), "trusted by", star ratings, testimonials,
award words (fine when describing references, never as a claim), exclamation marks (one at most), sentences over 28
words, headlines over 10 words, generic button text, mixed US/UK spelling.

---

## 10. Microcopy: the states nobody writes

Sujon's Drive (A5): *"Designers aksar happy path bana ke bhaag jaate hain."* Every state gets words:

| State | Write | Example |
|---|---|---|
| Form label | the noun, above the field | "Email" |
| Hint | why or format, under the label | "We write once, when it ships." |
| Error | what is wrong + how to fix, next to the field | "That email is missing something: it should look like name@example.com." |
| Success | what happens next, with a time | "Got it. We'll call you before 5 pm tomorrow." |
| Concept form | honest | "Concept: not sent." |
| Loading | what is loading | "Loading the 3D model (2.4 MB)" |
| Empty | why empty + the next action | "No pizzas yet. Drag a base onto the board to start." |
| 404 | admit it + the 2 most useful links | "This page moved or never existed. Try the menu or call the shop." |
| Offline | what still works | "You're offline. The menu below is saved; ordering needs a connection." |

Errors never blame ("invalid input"); they say what to do. Errors are text, not only red colour (accessibility skill).

---

## 11. Copy that also serves search

- The H1 says what the page is in the words people type ("Tire shop in Canton, OH" can be the H1 under a poetic
  display line, or the `<title>`), see `seo-and-meta`.
- Title 30-60 characters, description 120-160, both written by hand per page, both linted.
- Service pages each get their own heading and 2-4 sentences of real description.
- Alt text describes the image's job in plain words; never "AI-generated", never keyword lists.

---

## 12. Templates

**Local business, $300 (one page).**

```
Hero      eyebrow: [neighbourhood or hours]   title: [product + best moment / result + time]   body: [2 facts]   CTA: [call / book / order]
Services  title: "What we do"-style plain heading; 3-6 services, each: name, one sentence, price from
Why us    3 facts from the sheet (years, method, guarantee), each a number + one sentence
Proof     2-3 real reviews quoted exactly (or no section)
Visit     address (map link), hours as text, phone (tel:), parking / access line
Footer    name, address, phone, email, privacy link, "Website by Zyqor Studio"
```

**Portfolio case card.** Title = the client or concept + what it is; one sentence of what was hard; 2-3 tags of
technique; "Concept" label when fictional; link text "Open the site".

---

## 13. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Source | facts sheet from one call | facts sheet + voice brief | facts sheet, voice brief, interview recording, on-site photos |
| Writing | one draft, linted, client checks facts | draft, rewrite, linted, read aloud | draft, rewrite, read aloud, a second writer's pass, client sign-off on every claim |
| Pages | 1 page, 5-6 sections | 3-5 pages, scroll chapters written to timing | full site incl. microcopy for every state, 404, emails |
| Proof | real reviews or none | + numbers with sources | + case material, named customers with permission |
| Search | title + description per page | + service pages | + copy planned per search intent |

---

## 14. What copy-lint found on this repo's portfolio (30 Oct 2026)

Run on `site/` (110 pages):

| Finding | Count | Action |
|---|---|---|
| Pages mentioning AI ("no AI imagery", "No AI art", "AI-generated images are used") | 7 pages | **fixed in this push**: sentences reworded without the word (CW-R3) |
| Em dashes in concept pages (mostly decorative separators in Lab concepts: halde, plinth, stride...) | 57 | left for the concept owner; replace with "·" or a colon |
| Filler: "Seamless" in the page-transition demo copy, "placeholder" in a sticky-story demo | 4 | left (component demo text); fix in the components pass |
| Long sentences (> 28 words), mostly in credits and component notes | 47 | warnings |
| Unsourced proof patterns (percentages in concept copy) | 32 | warnings: concept brands, labelled as concepts |
| Mixed US/UK spelling on the same page | 8 pages | warnings: pick US for client-facing pages |

---

## 15. Do and don't

Do:
- Interview first, write the facts sheet, trace every claim to it.
- Write the eyebrow / title / body / proof / CTA for every section before any motion.
- Use numbers, names, places, times.
- Keep one primary CTA per screen, with the same words for the same action everywhere.
- Lint, read aloud, cut 20%.
- Label concepts and concept forms.

Don't:
- Use any phrase from the banned list, or mention AI in any form.
- Invent testimonials, logos, ratings, metrics or awards.
- Write a shorter second site for phones.
- Put words in images or canvas only (search and screen readers cannot read them).
- Mix US and UK spelling, or mix voices between pages.
- Let a reference's copy into the build (take its rhythm, never its words).

---

## 16. Pre-ship checklist

- [ ] Facts sheet exists; every claim on the site traces to a line in it.
- [ ] Voice brief written; one person ("I" / "we") used throughout.
- [ ] Every section has a title of 3-8 words and a body of real facts; hero title 3-6 words.
- [ ] `node scripts/copy-lint.mjs ./site` prints `VERDICT: PASS`; warnings read and judged.
- [ ] No AI mention anywhere, including alt text, titles and meta descriptions.
- [ ] Proof is real, sourced or absent; concept pages labelled.
- [ ] CTAs are verb + object; the same action uses the same words site-wide.
- [ ] Microcopy for every form state, empty state and the 404 page.
- [ ] US spelling for US clients; one spelling per site.
- [ ] Read aloud once at 1440 and once on a phone.

---

## 17. Files

| File | What |
|---|---|
| `scripts/copy-lint.mjs` | linter: banned filler (34 patterns), AI mentions, em dashes, "not X, it's Y", checkmark bullets (errors); award words, proof needing a source, generic CTAs, long sentences and headlines, exclamation marks, mixed spelling (warnings). Folder or files, `--allow`, `--json`, exit 1 on errors. Importable as an ES module. |
| `examples/index.html` | before/after bakery hero linted live + a box to lint any text; 11 self-tests (`window.__skillTest`). |
| `CREDITS.md` | sources |

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 30 Oct 2026 ("PC me no compromise"); no AI mention on his sites; his 30-item avoid list of 2 Oct 2026 9:39 AM (em dashes, "it's not x, it's y", checkmark bullets, pure white, no TOS, no privacy policy...), quoted verbatim in `docs/beast/DRIVE_POINTS.md` §13; tier prices $300 / $1k / $10k.
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* Part E §1 (the anti-AI-slop table, "Generic Marketing Fluff", the "Hand-finished Grade-5 brushed titanium" example), Part F item 1 (avoid list), item 13 §3; *web-design-promo-checklist.txt* ("Real proof", "Brand consistency", "CTA design", "UX states"); *DESIGN-LIBRARY-INDEX.md* §1-2; *Website-Building-Guide-New-Site.md* §2, §5, §6 rule 3. Points H1-H7, H11, H12, A5, L4, L14, T4 in `docs/beast/DRIVE_POINTS.md`; mapping in `docs/beast/SKILLS_SOURCE_MAP.md`.
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: copy rules (eyebrow 2-4 words, title 3-6 words, one plain sentence, 0-3 proof tags; prompts L164-170), copy choreography timing (engine L244-256), the interview rule (SKILL L80-88): SW-T15, SW-T22 in `docs/beast/SCROLL_WORLD_POINTS.md`.
- W3C WCAG 2.2 SC 2.4.4 Link Purpose (link text in context) and 3.3.1 / 3.3.3 (error identification and suggestion), https://www.w3.org/TR/WCAG22/.
- This repo: `copy-lint.mjs` run on `site/`, 30 Oct 2026 (section 14).
