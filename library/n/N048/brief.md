# N048 Ironbark Barbers (best-4 build #2, Oct 31 2026)

Fictional barbershop, labelled Concept everywhere. Built to docs/beast/specs/ironbark-barbers_spec.md (section 10 = what changed).

Beats: poster first paint -> hero chair (CC0 scan) turns into view and settles with a 2 cm hydraulic dip; drag / swipe /
arrow keys swing it onto six services (detents every 60 deg), ring labels (desktop) or a chip rail (phone) and the ticket
follow it -> #shop (200vh / 170svh pinned): camera pulls back 1.6 m -> 4.2 m, lamps switch on at 0.25 / 0.45, mirror,
shelf, stool, board fade from bone silhouettes to full material -> #services (260vh / 220svh pinned): the chair swings
through all six; each stop: index, name, includes, time, sample price; the chalkboard writes the price in chalk; the
mirror name swaps -> #visit-steps (140vh / 120svh): barber pole stripes travel with scroll, four steps light up ->
#book: service synced with the chair both ways, day chips, 4x3 time chips, name, phone, "Concept: not sent" -> #hours.

Files: index.html, m.html, style.css, m.css, app.js (scroll engine, hero chair, UI, form), shop.js (the shop scene),
chalk.js (chalk writer). Models are shared under library/_assets/models/ (same files on phone and desktop).
Fonts: Anton, Inter Tight, JetBrains Mono (OFL), self-hosted. Only Google/OFL fonts, self-hosted; the shared kit stylesheets are not loaded.
