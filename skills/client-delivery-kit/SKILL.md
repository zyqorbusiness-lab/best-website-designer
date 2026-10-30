---
name: client-delivery-kit
description: The ready-to-send paperwork for selling and delivering a website to a real client - the brief form (questions to send before quoting), the price tiers (websites from $300, bigger packages up to $10k; what each tier includes is Sujon's to fill), a stage-by-stage timeline, the revision policy, message templates for quote, approval and launch, and the handover checklist (domain, hosting, credentials, credits, analytics, Search Console). Pairs with client-site-delivery-workflow, which covers the build process itself.
when_to_use: a lead says "interested" or "how much"; before quoting; before starting a client build; at launch; at handover; when a client asks for "one more change"
license: MIT (text). Prices and tier contents belong to Zyqor Studio.
version: 1.0.0
---

# Client delivery kit

[`client-site-delivery-workflow`](../client-site-delivery-workflow/) is *how* we build and ship a client site. This
kit is *what we send the client* at each step: the forms, the prices, the dates, the rules for changes and the
handover list. Everything here is written to be copied into WhatsApp or email as it is.

```
Lead says yes -> brief form (A) -> quote with tier + timeline (B, C) -> written OK + deposit
  -> spec + storyboard -> review gate (build-spec-and-storyboard) -> build -> preview -> revisions (D)
  -> launch -> handover checklist (E) -> follow-up after 14 days
```

Ground rules for every client:
- **Honest only.** No fake reviews, logos, ratings or "trusted by" lines on their site or in our pitch. Show concepts
  as concepts. Never promise rankings, traffic or sales numbers.
- **The client owns everything at the end:** domain, hosting account, code, content, analytics and Search Console.
- **Everything that matters is in writing** (WhatsApp is fine): scope, price, dates, approvals, change requests.

---

## A. Brief form (send before quoting)

Short version for WhatsApp (send this first; most small businesses answer five questions, not twenty):

```
Hi {name}, thanks! A few quick questions so I can quote properly:
1. What does the business do, and where? (city/area)
2. What should the website get people to do? (call, book, order, visit, request a quote)
3. Do you have a logo, photos of your work/place, and a list of services with prices?
4. Any website you like the look of? (a link is enough)
5. Do you already own a domain name (like yourbusiness.com)? If yes, which one?
6. When do you need it live?
```

Full brief (for anything above the starter tier, or after the short answers). Use it as a call script or a form:

**The business**
1. Business name exactly as it should appear. Year started.
2. What you sell or do, in your words. Your top 3 services or products.
3. Who your best customers are (age, area, what they care about).
4. What makes you different from the nearest competitor? One real fact (years, a method, a guarantee, a speciality).
5. Opening hours, address, service area, phone, email, booking/ordering link if any.

**The website's job**
6. The one action a visitor should take. The second action.
7. Pages you expect (home, services, about, gallery, contact, booking, menu, shop...).
8. Must-have features: booking, online ordering, payments, forms, map, reviews widget (real reviews only), blog,
   multiple languages.
9. Who will update the site after launch, and how often?

**Content you have**
10. Logo files (vector if possible). Brand colours if you have them.
11. Real photos of your work, team, place, products. If none: can we photograph, or should we use licensed stock?
12. Text: service descriptions, prices, about story. If none: we interview you and write it (see tier).
13. Real customer reviews you are allowed to quote, with the customer's first name (optional).

**Look and feel**
14. Two or three sites you like, and what you like about each (colours, layout, photos, feel).
15. Anything you do not want (colours, styles, words).

**Technical**
16. Domain: do you own one? Where is it registered? Who has the login?
17. Current website or hosting (if any) and who controls it.
18. Google Business Profile: do you have one, and who manages it?
19. Email at your domain (info@...)? Who provides it? (we must not break it when the domain moves)

**Project**
20. Deadline and why (opening, season, event). Budget range. Who gives the final OK.

A printable copy of the full form is in [`templates/brief-form.md`](templates/brief-form.md).
For a structured brief file and checks, use `scripts/brief.mjs` in
[`client-site-delivery-workflow`](../client-site-delivery-workflow/).

## B. Price tiers

The public line (used on calls and in the pitch): **"Websites start at $300, with bigger packages up to $10k."**

| Tier (working name) | Price | What it includes | Typical time |
|---|---|---|---|
| Starter | from $300 | TODO (Sujon): pages, copywriting yes/no, photos, forms, hosting help | TODO |
| Business | TODO | TODO (Sujon) | TODO |
| Premium | TODO | TODO (Sujon): custom design, scroll story, 3D/configurator? | TODO |
| Flagship | up to $10k | TODO (Sujon) | TODO |

Until Sujon fills the TODOs: quote only "from $300" and "up to $10k", and say the exact price comes after the brief.
Do not invent tier contents for a client.

Things to decide per tier when filling it (so quotes never surprise anyone):
- number of pages or sections; who writes the copy; who supplies photos;
- custom design vs adapted layout; motion/3D level (see
  [`premium-tiers-normal-advanced-premium`](../premium-tiers-normal-advanced-premium/) for what separates the levels);
- forms, booking, ordering, payments; languages;
- revision rounds included (section D); launch support and how long after launch fixes are free;
- what is NOT included (domain fee, hosting fees, paid plugins, stock photos, ongoing edits) and the hourly or
  per-change rate for extras;
- payment terms (for example deposit before start, balance before launch): TODO (Sujon).

Quote message template:

```
Hi {name}, here's the plan for {business}:
- {tier}: {what's included, 3-5 short lines}
- Price: ${price} ({payment terms})
- Timeline: about {n} days from when I have your logo, photos and texts
- Includes {n} rounds of changes; extra changes are ${rate} each
Not included: domain (~$12-20/year, in your name), {other}.
If that works, reply OK and I'll send the first design pictures within {n} days.
```

## C. Timeline (default stages)

Dates count from the day the client's content (logo, photos, texts) arrives, not from the first message. Say this in
the quote; it is the most common cause of "late" projects.

| Stage | What happens | Client does | Default length |
|---|---|---|---|
| 0. Brief | brief form answered, scope and price agreed in writing | answers the form, sends content | 1-3 days |
| 1. Spec + storyboard | full spec and 4-8 design stills ([`build-spec-and-storyboard`](../build-spec-and-storyboard/)) | reviews the pictures, says OK or asks for changes (round 1) | 1-3 days |
| 2. Build | the site built to the approved spec, desktop and phone | nothing (questions answered within a day) | 3-10 days by tier |
| 3. Preview | private preview link; QA passed ([`docs/QA_CHECKLIST.md`](../../docs/QA_CHECKLIST.md)) | checks every page on their phone, sends one list of changes (round 2) | 2-3 days |
| 4. Launch | domain connected, live checks, Search Console | approves going live | 1 day |
| 5. Handover | handover checklist (E) completed, files and logins in their name | confirms access works | 1 day |
| 6. Follow-up | check forms, analytics, search indexing | - | day 14 after launch |

Tell the client the date of each stage, not only the end date. If a stage slips because content is late, say the new
date the same day.

## D. Revision policy

Put this in the quote. Clients accept limits that were clear from day one; they fight limits that appear at the end.

1. **Included rounds:** TODO (Sujon), suggested default: one round on the storyboard, one round on the preview.
2. **A round is one list.** The client sends all changes for that stage in one message (or one shared doc). Changes
   sent one by one over several days count as several rounds.
3. **What counts as a revision:** changes inside the approved spec: text edits, swapping photos, colour tweaks within
   the palette, moving or resizing elements, fixing anything that does not match the approved storyboard.
4. **What is new scope** (quoted separately before doing it): new pages or sections, new features (booking, shop,
   languages), a different design direction after the storyboard was approved, new photo shoots.
5. **Our mistakes are never a revision.** Bugs, broken links, phone layout problems, anything failing the QA checklist
   are fixed free, any time during the project and for TODO (Sujon) days after launch.
6. **Turnaround:** we reply to a change list within 1 working day with what will change and by when.
7. **Approval in writing.** "OK" on WhatsApp is enough. The approved storyboard and preview are the reference for any
   later question.

Message when a change is new scope:

```
Good idea! That's outside what we agreed ({what was agreed}), so it would be ${price} extra and add about {n} days.
Want me to add it, or keep it for after launch?
```

## E. Handover checklist

Done when every box is ticked and the client has logged in to each account themselves.

**Domain**
- [ ] Domain registered in the **client's** name and account (their email), auto-renew on, renewal date told to them.
- [ ] DNS records for the site set and checked (apex + `www`, HTTPS working on both, one redirects to the other).
- [ ] Existing email records (MX, SPF, DKIM) untouched and tested by sending them a mail.

**Hosting**
- [ ] Site hosted on an account the client owns (for example Vercel or Netlify with them as owner), or the
      repository transferred to their GitHub. We stay only as an invited member if they want ongoing help.
- [ ] Production branch and deploy settings written down (what deploys where).
- [ ] Any monthly costs listed with who pays (free tier where possible).

**Credentials handover**
- [ ] Accounts created with the **client's email**, then we were invited, never the other way round.
- [ ] No passwords sent in plain chat or email. If a password must change hands, use a password manager's share
      link or have the client reset it themselves on a call.
- [ ] After handover, our access removed or reduced to what they asked for; 2-step verification on for them.
- [ ] A one-page list of every account (registrar, hosting, analytics, Search Console, forms, booking) with the login
      email for each, no passwords.

**Credits and licences**
- [ ] `node tools/credits-check.mjs` (or the project's own check) passes; every photo, font, model has a credit.
- [ ] CC BY credits visible on the page; full list in a credits page or file.
- [ ] Client told which assets are licensed stock and that the licences stay with the site.

**Analytics**
- [ ] Analytics installed on the live domain (a privacy-friendly one, or Google Analytics 4) under the client's account.
- [ ] Key actions tracked as events: calls (tel: taps), form sends, bookings, orders.
- [ ] Cookie notice if the analytics or region needs one.

**Search Console**
- [ ] Domain or URL-prefix property verified in Google Search Console under the client's Google account (we can be
      added as a user). The verification tag or DNS record stays in place.
- [ ] `sitemap.xml` submitted; homepage inspected and indexing requested. ([`seo-and-meta`](../seo-and-meta/))
- [ ] Google Business Profile website field points to the new site.

**Files and support**
- [ ] Source code, design files and original photos shared (repo link or a zip).
- [ ] A short "how to change your site" note: how to edit text, swap a photo, who to call.
- [ ] Support period and the rate after it written down.
- [ ] Follow-up booked for day 14: forms working, analytics receiving, pages indexed.

Launch message template:

```
{business} is live: {url}
Everything is in your name: domain ({registrar}), hosting ({host}), Google Search Console and analytics.
I've sent the account list (no passwords) and the files. Please log in to each once to check access.
Free fixes until {date}. I'll check in on {date} to make sure forms and Google are working.
```

## Common mistakes and the fix

| Mistake | What it causes | Fix |
|---|---|---|
| Quoting before the brief | wrong price, then a fight about scope | send the short brief first; quote "from $300" until then |
| Timeline counted from the first message | "you're late" while waiting for their photos | count from content received; say it in the quote |
| Unlimited changes | the project never ends | rounds written in the quote (section D) |
| Domain or hosting in the studio's name | client is locked in, trust breaks later | client's accounts from day one, we are invited |
| Passwords over WhatsApp | leaked access | client resets it, or a password manager share |
| Search Console verification removed at a redesign | property stops verifying | keep the tag/DNS record; check it in QA |
| Stock photos with no licence record | takedown risk on the client's site | credit files for everything, handed over |
| Fake reviews "to start with" | breaks trust and platform rules | real reviews only, or none |

## Files

- `templates/brief-form.md`: the full brief form, printable, for a call or to send as a file.

## Sources

- Zyqor Studio's pricing line (calls script, Oct 2026): "Websites start at $300, with bigger packages up to $10k".
  Tier contents: TODO (Sujon).
- The build and handover process: [`client-site-delivery-workflow`](../client-site-delivery-workflow/).
- Search Console verification and sitemaps: Google Search Central documentation (developers.google.com/search).
