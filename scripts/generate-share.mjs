/*
  generate-share.mjs — build-time generator for Discord-shareable pages.
  For every filled threat response it writes share/<id>.html containing
  OG meta tags (title, description, per-threat image) plus an instant
  redirect into the app deep link. Rerun after editing data-matchups.js:

    node scripts/generate-share.mjs
*/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CANON = (process.env.SITE_URL || 'https://dgreat.guide').replace(/\/+$/, '');

globalThis.window = {};
eval(readFileSync(join(root, 'js/data/data-matchups.js'), 'utf8'));
const data = globalThis.window.DSA_MATCHUP_DATA;

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rows = (data.threatResponses || []).filter(r => r.hasResponse);
mkdirSync(join(root, 'share'), { recursive: true });

let count = 0;
for (const r of rows) {
  const q = new URLSearchParams({ me: r.myRace, threat: r.enemySlug }).toString();
  const app = '../index.html?' + q;
  const canonUrl = CANON + '/?' + q;
  const title = r.enemyThreat + ' killing you? Here’s the counter — dgreat.guide';
  const descLine = (r.recommended && r.recommended[0]) || r.responseText || 'Watch the counter play out.';
  const desc = ('[' + r.myRace + '] Counter: ' + (r.counterUnits || []).join(' + ') + '. ' + descLine).slice(0, 280);
  const img = CANON + '/assets/og/' + r.enemySlug + '.png';

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta property="og:site_name" content="dgreat.guide">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:url" content="${esc(canonUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<meta http-equiv="refresh" content="0; url=${esc(app)}">
<script>location.replace(${JSON.stringify(app)});</script>
</head><body>
<p>Opening the counter for ${esc(r.enemyThreat)}… <a href="${esc(app)}">continue</a></p>
</body></html>`;

  writeFileSync(join(root, 'share', r.id + '.html'), html);
  count++;
}
console.log('wrote ' + count + ' share pages to share/');
