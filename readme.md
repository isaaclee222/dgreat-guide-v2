# dgreat.guide v14 — ground-up rebuild

Static HTML/CSS/vanilla JS. No build step, no backend required. Open
`index.html` in a browser or deploy the folder to Netlify.

## What changed vs v13 (the short version)

- **One app, three views**: Counter (default), Academy, Meta. No page maze.
- **Replays are the answer format.** Every counter card embeds a big
  auto-playing battle-lane replay (v13's scenario theater, promoted from a
  side panel to center stage). Threats without an authored scenario get an
  auto-simulated one from the counter data + unit costs.
- **Academy** = one guided path of 39 parts across 5 chapters:
  Foundations (7), the Formation lab (the 12 most instructive replays),
  and per-race Threat mastery (the 20 Critical/High-priority threats).
  Every question, wrong answer, and explanation is HAND-WRITTEN in
  js/data/data-academy.js — nothing is auto-generated.
  XP comes from tests, replays, AND using the Counter view. Ranks:
  Nub → Nooblet → Noob → Standard Noob → DS Player → Bronze → Silver →
  Gold → Platinum → Diamond → Pro Guide Reader. Rank-ups open a
  center-screen "You have learned:" popup with your reading stats.
  Daily streaks. All localStorage, no accounts.
- **2026 meta migration**: Muta was nerfed out of the meta — removed as a
  threat/counter/recommendation everywhere (scripts/purge-muta.mjs);
  ZvZ content now teaches the Roach + Infestor shroud core.
- **Built to be shared in Discord.** Every counter card has "Copy Discord
  post" and "Copy link". `share/*.html` stubs carry OG tags + generated
  card images (`assets/og/*.png`) so links unfurl with unit art.
  Short URLs: `dgreat.guide/c/<responseId>` (see netlify.toml).
- Background is now a dim backdrop (~12fps twinkle); all animation budget
  moved into content. `prefers-reduced-motion` respected everywhere.

## Editing data (non-programmers welcome)

Same files and formats as v13, now under `js/data/`:

- `data-matchups.js` — threats, counters, timings (generated from the xlsx)
- `data-units.js`, `data-tierlist.js` — units + tier board
- `data-quizzes.js` — gas + ZvZ quizzes (used by the Academy)
- `data-scenarios.js` — authored replays (bad pass → good pass)
- `data-unit-costs.js` — mineral costs (drives cost bars + auto replays)
- `data-site-changelog.js` — player-facing changelog (Meta view)
- Meta spotlights (e.g. Infestor+Roach shroud) live at the top of
  `js/views-meta.js` in the `SPOTLIGHTS` array.
- Academy tests: `js/data/data-academy.js` (hand-curated question bank;
  add/edit questions there — q(prompt, correct, [3 wrong], explanation)).

## After editing matchup data, regenerate share assets

```
node scripts/generate-share.mjs   # share/*.html OG stubs
python3 scripts/generate-og.py    # assets/og/*.png unfurl images
```

(scripts/purge-muta.mjs is the one-shot 2026 muta-removal migration —
already applied; kept for reference.)

## Deploying with the Netlify CLI

One-time setup:

```
npm install -g netlify-cli
netlify login
netlify link        # link this folder to your existing dgreat.guide site
                    # (or `netlify init` to create a new site)
```

Every update after that:

```
npm run deploy          # regenerates share/*.html, deploys to production
npm run deploy:draft    # same, but to a draft preview URL first
```

Notes:
- `netlify.toml` already sets publish=".", the /c/* short-URL redirects,
  and the legacy v13 page redirects — they go live automatically.
- Discord share links: share/*.html + assets/og/*.png deploy as plain
  static files, so unfurls work with zero extra config on the custom
  domain dgreat.guide. If you ever deploy under a different domain, run
  `SITE_URL=https://your-domain npm run deploy` so the share stubs and
  copy-link buttons point at the right host (also update CANON in
  js/views-counter.js and js/views-meta.js).
- After editing unit/threat data, also rerun `python3 scripts/generate-og.py`
  if you want the unfurl images to reflect the new counters.

## Removed in v14

- **The old admin panel was deleted** (admin.html + Netlify Functions
  backend + community sync + worst-build voting). Content is edited
  directly in `js/data/` and shipped via the Netlify CLI.
- Standalone trainer pages — their content now lives inside the Academy.
