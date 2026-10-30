---
name: client-site-delivery-workflow
description: The end-to-end workflow for delivering a website to a client (or shipping a concept) - intake interview, facts sheet, brief and scope line with a written yes, the build loop with evidence at each gate, QA, preview and one round of changes, deploy to Vercel from Git (or a static preview host such as sites.tab.bot), custom domains, Search Console, and the handover pack that leaves the client owning their code, hosting, domain and data. Includes scripts/brief.mjs (brief template, check, scope line), scripts/handover.mjs (handover note built from the files and the live URLs), an example brief, a delivery tracker page, and the real handover report for the Zyqor portfolio.
when_to_use: a client says yes, before writing any code for a client, when quoting, when a site is ready to go live, "deploy this", "hand it over", "connect my domain", when a project has stalled between stages, at the end of any concept build
license: MIT (text and code). Sources credited in CREDITS.md.
version: 1.0.0
---

# Client site delivery workflow

A premium site can still be a bad delivery: built before the scope was agreed, launched with a placeholder in the
footer, hosted on the studio's account so the client cannot touch it, or handed over with no record of which photos
need credit. This skill is the order of operations that prevents all four. Every stage ends with **evidence**, not a
feeling (Sujon's Drive Q7: *"Report what actually happened, not what you intended."*).

```
1 Brief       interview -> facts sheet -> brief.json (brief.mjs --check) -> scope line -> written yes
2 Design      teardowns -> idea -> tier -> tokens            (premium-website-playbook steps 2-7)
3 Build       copy -> assets -> sections one at a time       (playbook steps 8-15)
4 QA          qa-harness + a11y + seo + copy + security + credits, real phone
5 Preview     preview URL -> one round of changes -> production deploy -> live checks -> domain
6 Handover    Search Console -> handover.mjs -> client owns repo, hosting, domain, accounts
```

Quick start (Node 18+, no install):

```bash
node scripts/brief.mjs --new projects/kessler            # brief.json + BRIEF.md templates
node scripts/brief.mjs --check projects/kessler/brief.json
node scripts/brief.mjs --quote projects/kessler/brief.json   # the scope line to send
node scripts/handover.mjs site --url https://client.vercel.app --brief projects/kessler/brief.json --out HANDOVER.md
```

---

## 0. Desktop first, no compromise

Zyqor Studio's rule (Sujon, 30 Oct 2026): *"PC me no compromise, ek dam best."* In delivery terms:

1. **The preview the client first sees is the desktop build at full quality**, on a real screen if you can share one,
   with the phone preview sent as a second link or a screen recording. First impressions decide the change requests.
2. **No "lite" desktop to hit a deadline.** If time is short, cut scope (a page, a section) with the client's
   agreement, never quality on the pages that ship.
3. **Every gate is checked at 1440 first**, then 390 and 360, then 375x667 for the first screen.

### Phone parity

- The client will open the link on their phone first, almost always (WhatsApp, Instagram DMs). Before sending any
  preview, open it on a phone yourself.
- The handover checks run at 390 as well as 1440 (`qa-harness`, `a11y-check`, `parity-check`).
- Phone-only behaviours (tap instead of hover, `tel:` links, maps) are listed in the handover so the client knows they
  are intended.

---

## 1. Rules (each with its reason)

| # | Rule | Why |
|---|---|---|
| DW-R1 | **No code before a written yes on the scope line.** | Drive Q1 ("write the brief before any code"); unpaid scope creep starts with an unagreed brief. |
| DW-R2 | **Every claim on the site traces to the facts sheet.** | Drive H1 (real proof or nothing); you cannot defend a number you invented. |
| DW-R3 | **Build one section at a time and judge the render, not the code.** | Drive Q4: *"Show the render, not the code. Judge by screenshots at 360, 768 and 1440 px, then on a real phone."* |
| DW-R4 | **Pass/fail table before launch; never ship a FAIL.** | Drive Q5. |
| DW-R5 | **One round of changes is in the quote; more is a new quote.** | Keeps a $300 job a $300 job. |
| DW-R6 | **The client owns everything at the end**: repo, hosting account, domain, Search Console, form inbox. | A site the client cannot edit or move is a hostage, not a deliverable. |
| DW-R7 | **No passwords in chats, docs or repos.** Use the provider's invite / transfer features. | Security (`web-security` §1). |
| DW-R8 | **Concepts are labelled; client work is honest about what is real.** | Drive H5, H7. |
| DW-R9 | **Restyles never remove working features.** | Drive Q13: *"Never remove a working feature when restyling. Test desktop and Android; every button."* |
| DW-R10 | **Report evidence**: every stage ends with a VERDICT line and the file that proves it. | Drive Q7. |

---

## 2. Stage 1: brief

**Interview** (20-30 minutes, call or voice notes). Open with *"Tell me about the business in your own words"*, then
only what cannot be defaulted (scroll-world's interview rule, SW-T22): what you sell and to whom, the one action a
visitor should take, pages, what you own (logo, photos, footage, notes), deadline, domain. The questions in
`copywriting-for-premium-sites` §2 produce the facts sheet at the same time.

**Brief**: `node scripts/brief.mjs --new <dir>` writes `brief.json` and `BRIEF.md`. Fill both; then:

```bash
node scripts/brief.mjs --check brief.json
```

It fails on missing goal / audience / primary action / deadline, on a feature outside the tier (3D in a NORMAL brief),
on a missing privacy page (Drive H6), and on "no photos and no plan for photos" (real photos only). It warns when the
scope is not approved yet.

**Scope line**: `--quote` prints the sentence to send, for example:

> Kessler Tire & Auto (concept): NORMAL website (from $300). Pages: home, services, contact, privacy. Includes:
> css-motion, real-photos, phone + desktop builds, SEO basics + sitemap, accessibility pass, Search Console setup.
> Not included: 3d, scroll-video, configurator, custom-cursor, sound. Delivery by 2026-11-14; one round of changes
> after the preview.

Send it in the client's channel (WhatsApp for most of Zyqor's clients) and record the yes with its date in
`brief.json > approvals`. The "Not included" list is as important as the included one.

Tier reference (Zyqor's prices; budgets from `performance-desktop-max-and-mobile`): NORMAL from $300, <= 1.5 MB;
ADVANCED around $1k, <= 3 MB; PREMIUM up to $10k, <= 8 MB.

---

## 3. Stage 2: design

Follow `premium-website-playbook` steps 2-7: teardowns (`award-site-teardown-method`), the idea
(`unique-idea-and-concept`), the tier's budget (`premium-tiers-normal-advanced-premium`), palette, type, layout. The
output the client sees at this stage is **one hero, rendered** at 1440 and 390 (not a mood board, not a Figma file
unless they asked), with the idea sentence and the palette sentence under it. Get a yes on direction before building
the rest.

---

## 4. Stage 3: build

1. **Copy first, locked** (`copywriting-for-premium-sites`): facts sheet -> draft -> `copy-lint.mjs` PASS -> client
   confirms the facts.
2. **Assets with credit files from the first download** (`imagery-assets-licensing`): `node tools/credits-check.mjs`.
3. **Sections one at a time** (DW-R3). After each: screenshots at 1440 and 390, name the weakest thing, fix it.
4. **Stack**: whatever gives the best result (Drive Q10: *"never restrict the output to a single self-contained HTML
   file unless I explicitly ask"*); static HTML/CSS/JS is the default for NORMAL because it is fast and free to host.
5. **Pin versions; self-host libraries** (Drive P7): no development-only CDNs (the Tailwind Play CDN) in production,
   no `@latest` URLs.
6. **Commit small, push often** to a Git repo from day one; the client will own it.

---

## 5. Stage 4: QA (the pass/fail table)

Run all of these against the final build and save each output beside the project (`reports/`):

| Check | Command / method | Pass |
|---|---|---|
| Layout and console at 1440 / 390 / 360 + reduced motion | `node skills/qa-harness/qa.mjs site` | 0 errors, 0 failed requests, 0 overflow |
| Short phone first screen | `parity-check.mjs <url> --cta "selector"` incl. 375x667 | primary action visible |
| Accessibility | `a11y-check.mjs site --pages ...` | exit 0; keyboard walk done by hand |
| SEO and sharing | `seo-check.mjs site` | exit 0; link preview checked on WhatsApp |
| Copy | `copy-lint.mjs site` | exit 0 |
| Security | `web-security/check.mjs site` | no HIGH |
| Credits | `tools/credits-check.mjs` | pass; CC BY attribution visible |
| Budget | `budget-check.mjs <url>` | inside the tier |
| Real phone | open the preview on an Android and an iPhone if possible | every button works (Drive Q13) |
| Forms | submit each form once with real data | arrives in the client's inbox, or says "Concept: not sent" |

Drive Q5's row list (layout 360/768/1440, real phone, links and buttons, forms, contrast, keyboard, images/alt,
reduced motion, performance, 3D fallback, console, SEO basics, trust, avoid list) is covered by the table above.
**Never ship a FAIL**; a FAIL you cannot fix is reported to the client in plain words with the plan.

---

## 6. Stage 5: preview, changes, deploy

### Preview

- Send **one preview link** (a Vercel preview deployment or a static preview host), the desktop screenshot and the
  phone screenshot, and a short list of what to check ("the hours, the prices, the photos of the bays").
- Collect all changes in **one message** (DW-R5). Make them, re-run the QA table, send the new link.

### Deploy to Vercel from Git (Zyqor's default for production)

1. Push the site to a GitHub repo (in the client's account, or transfer it at handover).
2. In Vercel: *Add New > Project > Import* the repo. For a static site set *Framework Preset: Other*, the output
   directory (this repo uses `site`) and the build command only if one is needed (this repo runs
   `node tools/join-parts.mjs` to rebuild split large files). Or commit a `vercel.json` with `outputDirectory`,
   `buildCommand`, `headers` (security headers, long cache for `/assets/`), as this repo does.
3. Every push to `main` deploys production; every other branch or pull request gets its own preview URL.
4. Check the deployment status before telling anyone it is live: the GitHub commit status (Vercel posts one) or the
   Vercel dashboard must say **Ready / success**, then open the live URL at 1440 and 390.

Terms to respect: Vercel's Hobby plan is for personal, non-commercial use under Vercel's own terms; a business site
belongs on a plan or a host that allows commercial use, in the client's own account. Sujon's Drive notes the same
family of caveats for other free hosts (GitHub Pages is not for an online business; Cloudflare Pages free has a
monthly deploy limit) (P8). Read each host's current terms before choosing.

### Static preview host (sites.tab.bot)

Zyqor uses `<name>.sites.tab.bot` for quick public previews and mirrors: a plain static upload of the built folder
(no build step on the host), so run any build step first (`join-parts`) and upload the output. Keep the URL without
version numbers for the main site (Sujon, 30 Oct 2026: "zyqor-portfolio", not "zyqor-portfolio-v3").

### Custom domain (when the client has one)

In the Vercel project: *Settings > Domains > Add*. Vercel then shows the exact DNS records to create at the registrar
(for an apex domain an `A` record, for `www` a `CNAME`); copy the values from that screen rather than from memory, wait
for the check to turn green, and Vercel issues the HTTPS certificate. Then set every page's canonical and `og:url` to
the new domain and regenerate the sitemap (`seo-and-meta` §4, §7).

---

## 7. Stage 6: Search Console and launch checks

1. Live URL answers 200 on desktop and phone; `sitemap.xml` and `robots.txt` answer 200 (`handover.mjs` checks all three).
2. Google Search Console: add the property, verify, submit `sitemap.xml`, inspect the home page and the key pages,
   add the client as **Owner** (`seo-and-meta` §8).
3. Link previews checked on WhatsApp and iMessage.
4. Forms tested on the live site.

---

## 8. Handover pack

```bash
node scripts/handover.mjs site --url https://client-site.vercel.app --brief brief.json --reports reports --out HANDOVER.md
```

`handover.mjs` builds the note from what is actually there: the page list, every credit file grouped by licence, the
CC BY attributions that must stay visible, font files shipped, third-party hosts the pages load, the live checks
(status, sitemap, robots, security headers) and the verdicts from the QA reports. It ends with the ownership checklist:

- [ ] GitHub repo transferred to the client (repo *Settings > Transfer ownership*) or the client added as admin.
- [ ] Hosting project in the client's account (Vercel can transfer a project between accounts / teams).
- [ ] Domain registered in the client's name; DNS records listed in the note.
- [ ] Search Console: client is Owner.
- [ ] Form notifications and analytics in the client's name.
- [ ] No passwords anywhere in the note or the repo (DW-R7).

Send HANDOVER.md (or the same content as a PDF) with the live link, the desktop and phone screenshots, and the fix
window agreed in the quote. `examples/HANDOVER.zyqor-portfolio.md` is the real note for this repo's portfolio.

---

## 9. Concept sites (Zyqor's portfolio work)

The same six stages, with three differences: the "client" is Sujon, the brand is fictional and labelled **Concept**,
and forms say **"Concept: not sent"**. Deploy to the portfolio (`site/library/...`), add it to the library index, run
the same QA table, and record the commit and the live URL. Concept P041 Hotcoal Kitchen followed this path on 30 Oct
2026 (built, QA'd at 1440/390/360, pushed, live on Vercel, added to the Concept Library).

---

## 10. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Brief | 20-min call, brief.json, scope line | + teardown board, direction approval on a rendered hero | + interview recording, workshop on the idea, signed scope |
| Build | static site, 1 page / up to 5 sections | 3-5 pages, scroll chapters, one 3D scene or scroll video | full site, multiple scenes or a configurator, microcopy for every state |
| QA | the table at 1440/390/360 | + 375x667, 1920, real phone | + slow-network test, screen-reader pass, second reviewer |
| Changes | one round | one round + one small tweak list | two rounds, scheduled |
| Deploy | client's Vercel or static host | + preview per branch | + staging and production, custom domain |
| Handover | HANDOVER.md + ownership checklist | + a short video walk-through | + editing guide, 30-day check-in |

(Planning defaults for Zyqor Studio; agree the real numbers in each quote.)

---

## 11. Do and don't

Do:
- Get the written yes on the scope line before code.
- Keep the facts sheet and trace every claim to it.
- Send previews only after opening them on a phone yourself.
- Check the deployment status and the live URL before saying "live".
- Hand over ownership of every account and file.
- Keep evidence (reports, screenshots) for every gate.

Don't:
- Build on the studio's hosting account and leave it there.
- Send passwords, or ask the client for theirs; use invites and transfers.
- Accept changes in scattered messages; collect them into one round.
- Remove a working feature during a restyle.
- Promise rankings, awards or results.
- Ship with a FAIL in the table.

---

## 12. Ship checklist

- [ ] `brief.mjs --check` PASS; scope line approved in writing (date recorded).
- [ ] Facts sheet complete; copy locked; `copy-lint` PASS.
- [ ] QA table complete with saved reports; no FAIL.
- [ ] Preview sent with desktop and phone screenshots; one round of changes done.
- [ ] Production deploy status success; live URL checked at 1440 and 390.
- [ ] Domain connected (if any); canonicals and sitemap use the final domain.
- [ ] Search Console verified, sitemap submitted, client is Owner.
- [ ] `handover.mjs` run; HANDOVER.md sent; ownership checklist ticked.
- [ ] Concept work: labelled, added to the library index, commit and URL recorded.

---

## 13. Files

| File | What |
|---|---|
| `scripts/brief.mjs` | `--new` writes brief.json + BRIEF.md; `--check` validates fields, tier features, privacy page, photo plan, approvals; `--quote` prints the scope line. Importable as an ES module (the tracker page uses it). |
| `scripts/handover.mjs` | builds HANDOVER.md from the site folder, credit files, brief, QA reports and live URL checks |
| `examples/brief.json` | a filled brief (fictional tire shop, NORMAL tier) that passes the check |
| `examples/HANDOVER.zyqor-portfolio.md` | the handover note generated for this repo's portfolio on 30 Oct 2026 |
| `examples/index.html` | delivery tracker: six stages with 18 gates and a live scope line; 6 self-tests |
| `CREDITS.md` | sources |

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 30 Oct 2026 ("PC me no compromise"; the portfolio URL without version numbers; the Vercel login and portfolio update); tier prices $300 / $1k / $10k.
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* Part F item 13 §3, §5 and Part E §0 (brief first, restyles keep features); *Website-Building-Guide-New-Site.md* §1 step 6, §6 "ORDER OF WORK", §7 (pass/fail table), §8 ("Free hosting options"; pin versions); *prismx-web-build-framework.txt* (PRISMX order; "Do not leave placeholder logic, fake security, broken buttons, or unfinished flows"); *DESIGN-LIBRARY-INDEX.md* §1, §3, §5; the GRV verification invariants. Points Q1, Q4-Q8, Q10, Q13, P7, P8, H1, H5-H7 in `docs/beast/DRIVE_POINTS.md`; mapping in `docs/beast/SKILLS_SOURCE_MAP.md`.
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: interview rule (SW-T22), automated seam QA (SW-T19), re-roll only the failure and run long jobs detached (SW-T21).
- Vercel documentation (importing a Git repository, preview and production deployments, `vercel.json`, custom domains, project transfers) and Vercel's fair-use / Hobby terms, https://vercel.com/docs ; GitHub Docs, transferring a repository.
- This repo: the portfolio's Vercel project (git-linked to `best-website-designer`, main auto-deploys) and the handover report in `examples/` (30 Oct 2026); concept P041's delivery path.
