/*
  Player-facing site changelog, rendered by js/matchup-hub.js into the
  Changelog tab on the matchup helper. Plain markdown subset: ## headings,
  "- " bullets, **bold**, ~~strikethrough~~, `code`, --- rules.
  Newest update first. Edit freely — no programming knowledge needed.
  (The internal developer log lives in CHANGELOG.md and is not shown on-site.)
*/
window.DSA_SITE_CHANGELOG = `
## The v14 Rebuild — new meta, new Academy

- **The Shroud Meta is here.** Infestor is now **S tier across the board**: Microbial Shroud is free and halves all ranged damage on the line in front of it. Roach + Infestor is the ZvZ core.
- **Muta is gone.** Nerfed out of the meta — removed as a threat, a counter, and a recommendation across the entire guide. Tier list says it plainly: do not build.
- **Ultralisk up to B tier early.** Early Ultra timings are real now.
- **New Infestor counters** on the matchup cards for all three races: **Disruptor** (Protoss — novas ignore the shroud), **Liberator** (Terran — zone it from above), and the **Infestor mirror** (Zerg — shroud vs shroud, better fungals win).
- **The Academy** replaced the old trainer pages: a 39-part guided path — watch the replay, pass the test. Every question is hand-written. New rank ladder from **Nub** to **Pro Guide Reader**, with a proper level-up popup showing how much you have learned.
- **Share it in Discord.** Every counter card has Copy Discord post / Copy link, and links unfurl with unit art. Meta spotlights are shareable too.
- **The old admin panel was deleted.** Content now lives in plain data files (js/data/) and the site deploys straight from the Netlify CLI.

---
## The One-Screen Update — everything in one place

- The whole site now fits on one screen, built for desktop. The matchup helper lives on the right, and everything else — strategy database, spotlight, tier list, current meta, and this changelog — lives on the left.
- Switch between left-side pages instantly with the new buttons. No loading, no waiting: every page is already there.
- The site remembers where you left off — your races, your selected threat, and your last-open page are all restored on your next visit.
- A big visual cleanup: one unified look, more room for the helper, and threat responses that read top-to-bottom without squinting.
- Pro tip from the header: put me on your second monitor while you queue.

---

## The Visual Lessons Update

- New animated formation lessons: press "Watch it play out" on a strategy and see the bad version fail, then the good version win.
- Strategy Spotlight: hand-picked reads other players are using, filtered to your race, with a shuffle button when you want fresh ideas.
- Cycle through the visualizer library with the arrow buttons — a different lesson order every visit.

---

## The Speed Update

- Major performance pass: faster page loads, smoother background animation, and less work for your GPU while you read.
- Off-screen sections no longer cost you frames. Scrolling stays smooth even with everything on one page.

---

## Worst Build of the Week

- New community widget on the helper: the top 3 most-voted disaster builds rotate at the bottom of the page.
- Submit the build that made your team ask questions, and vote on everyone else's.
- Cleaner navigation: the pages you use most are one click away, the rest live under "More".

---

## The Smarter Helper Update

- The priority threat deck now surfaces the threats most likely to decide the wave, not just an alphabetical list.
- The general matchup advice card politely gets out of the way once you start digging into threats — and comes back with one click.
- A little red arrow now shows new players exactly where to start.
- Your race picks are remembered between visits.

---

## Community Update

- Strategy guides, matchup notes, and tier placements can now be updated by community editors — fresh info without waiting for a site rebuild.
- New guides and edits flow to everyone automatically.

---

## Launch

- Direct Strike Academy goes live: the Matchup Helper (pick your race, see what beats what), phase-based tier list, unit counter index, gas and ZvZ trainers, beginner path, glossary, and the noob trap detector.
- Built for the current meta, updated as the meta moves.
`;
