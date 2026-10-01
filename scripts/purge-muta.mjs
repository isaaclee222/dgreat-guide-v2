/*
  purge-muta.mjs — 2026 patch: Muta is bad now. One-shot data migration that
  removes Muta as a threat, a counter, and a recommendation across all data
  files, and rewrites ZvZ baselines around the Roach+Infestor shroud core.

    node scripts/purge-muta.mjs
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = f => {
  globalThis.window = {};
  eval(readFileSync(join(root, 'js/data', f), 'utf8'));
  return globalThis.window;
};
const emit = (f, header, assignments) => {
  const body = assignments.map(([lhs, obj, guard]) =>
    lhs + ' = ' + (guard ? lhs + ' || ' : '') + JSON.stringify(obj, null, 2) + ';').join('\n\n');
  writeFileSync(join(root, 'js/data', f), header + '\n' + body + '\n');
};
const isMuta = s => /^(muta|mutalisk|mutas|mutalisks)$/i.test(String(s || '').trim());

/* ---------- text scrubs (exact, sentence-safe) ---------- */
const TEXT_FIXES = [
  ['Corruptors/Muta ASAP', 'Corruptors ASAP'],
  ['use small Ling/Muta groups as bait', 'use small Ling groups as bait'],
  ['Use spread Roaches as a front buffer; keep Hydras far back and split; use small Ling/Muta groups as bait;', 'Use spread Roaches as a front buffer; keep Hydras far back and split; use small Ling groups as bait;'],
  ['overbuilt Lings/Mutas', 'overbuilt Lings'],
  ['More clumped Hydras; overbuilt Lings/Mutas;', 'More clumped Hydras; overbuilt Lings;'],
  ['Zerglings, Mutalisks, Banelings', 'Zerglings, Banelings'],
  ['Having hydras next round to mirror, or mutas if in the early game.', 'Having hydras next round to mirror.'],
  ['Corruptors or Mutalisks', 'Corruptors'],
  ['Add Corruptors or Mutas immediately', 'Add Corruptors immediately'],
  ['Corruptors/Muta', 'Corruptors'],
  ['Zerglings, Banelings, or Mutas', 'Zerglings or Banelings'],
  ['a Viper bomb, some Mutas, or Hydralisks helping', 'a Viper bomb or Hydralisks helping'],
  ['Zerg makes Corruptors or Mutas.', 'Zerg makes Corruptors.'],
  ['Mutas funding T3, T1 funding Corruptors', 'Old units funding T3, T1 funding Corruptors'],
  ['but your minerals are flying around as Mutas? Sell some.', 'but your minerals are locked in old units? Sell some.'],
  ['Still strong, but not a blind S-tier answer and bad into early ZvZ Muta.', 'Still strong, but not a blind S-tier answer — clumped Hydras feed the Roach+Infestor shroud core.'],
  ['Support/anti-air; useful vs Void Rays but not a strong opener or early Muta answer.', 'Support/anti-air; useful vs Void Rays but not a strong opener.'],
  ['High-skill spell control; can swing Muta fights when timed perfectly.', 'High-skill spell control; can swing air fights and clumps when timed perfectly.'],
  ['Zerg response: Roach, Zergling, Muta', 'Zerg response: Roach, Zergling'],
  ['Zerg response: Muta, Hydralisk', 'Zerg response: Hydralisk'],
  ['Zerg response: Corruptor, Muta', 'Zerg response: Corruptor'],
  ['Pure Muta after Ultra is active; upgrades before matching Ultra count.', 'Ignoring the Ultra count race; upgrades before matching Ultra count.'],
  ['Not getting a viper too when they have muta', 'Not adding your own Viper to answer theirs'],
  ['The Ultra transition ends whatever early-game advantage your Mutas earned. Switch into Ultras yourself and match their count before spending on upgrades; an upgraded but outnumbered Ultra line still loses. If minerals are tied up in aging Mutas, sell them — funding T3 before the round starts is worth more than sentiment about your flock.', 'The Ultra transition resets whatever early-game advantage anyone earned. Switch into Ultras yourself and match their count before spending on upgrades; an upgraded but outnumbered Ultra line still loses. If minerals are tied up in aging units, sell them — funding T3 before the round starts is worth more than sentiment.'],
];
function scrub(v) {
  if (typeof v === 'string') {
    let s = v;
    for (const [a, b] of TEXT_FIXES) s = s.split(a).join(b);
    return s;
  }
  if (Array.isArray(v)) return v.map(scrub);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) o[k] = scrub(v[k]);
    return o;
  }
  return v;
}

/* ---------- 1. matchups ---------- */
{
  const w = load('data-matchups.js');
  const d = w.DSA_MATCHUP_DATA;

  d.general = d.general.map(g => {
    if (g.myRace === 'Zerg' && g.enemyRace === 'Zerg') {
      g.overview = 'The current ZvZ core is Roach + Infestor: Microbial Shroud is free and halves all ranged damage hitting your line. Expect Lurker, Viper, and Ultra transitions as the game goes long.';
      g.priorities = [
        'Get the Roach + Infestor core online early',
        'shroud wins ranged trades — match it or force melee',
        'track Viper/Ultra/Lurker transitions.'
      ];
      if (/muta/i.test(g.positionNote || '')) {
        g.positionNote = g.position === 'Second'
          ? 'Round 2 aggression is more effective in this position'
          : 'If it is going well, bank round 2 toward a faster Infestor';
      }
    }
    return scrub(g);
  });

  d.threatResponses = d.threatResponses
    .filter(r => !isMuta(r.enemySlug) && !isMuta(r.enemyThreat))
    .map(r => {
      r.counterUnits = (r.counterUnits || []).filter(u => !isMuta(u));
      r.counterImages = (r.counterImages || []).filter(c => !isMuta(c.slug) && !isMuta(c.unit));

      if (r.id === 'viper__zerg') {
        r.recommended = ['If their Viper is winning value, spread your line, add your own Viper, and lean on the Roach+Infestor core — clumped air and clumped Hydras are what Viper farms.'];
        r.responseText = r.recommended[0];
        r.avoid = ['Clumping units for abduct/bomb value', 'ignoring their Viper count'];
        r.avoidText = 'Clumping units for abduct/bomb value; ignoring their Viper count.';
        r.notes = 'Viper value comes from clumps. Spread first, then trade.';
      }
      if (r.id === 'hydralisk__zerg') {
        r.scoutTiming = 'Hydra spikes can come any time after the opening rounds.';
        r.warning = 'Clumped Hydras feed fungal — the Roach+Infestor shroud core trades into them for free.';
        r.avoid = (r.avoid || []).filter(a => !/muta/i.test(a));
        if (!r.avoid.length) r.avoid = ['Overcommitting to one composition'];
        r.avoidText = r.avoid.join('; ') + '.';
      }
      if (r.id === 'ultralisk__zerg') {
        r.scoutTiming = 'Watch for the Ultra switch once the mid game money arrives.';
        r.recommended = ['Switch Ultra also; match count before upgrades; sell spare units if needed.'];
        r.responseText = r.recommended[0];
        r.avoid = ['Ignoring the Ultra count race', 'upgrades before matching Ultra count'];
        r.avoidText = 'Ignoring the Ultra count race; upgrades before matching Ultra count.';
        r.notes = 'Count usually beats upgrades when Ultras appear.';
      }
      r.avoid = (r.avoid || []).filter(a => !isMuta(a));
      return scrub(r);
    });

  d.allThreatUnits = d.allThreatUnits.filter(u => !isMuta(u));
  if (d.threatSorting) {
    if (Array.isArray(d.threatSorting.rows)) {
      d.threatSorting.rows = d.threatSorting.rows.filter(r =>
        !/(^|_)muta(_|$)/.test(String(r.id || '')) && !isMuta(r.enemyThreat));
    }
    const mo = d.threatSorting.weights && d.threatSorting.weights.manualOverrides;
    if (mo) for (const k of Object.keys(mo)) if (/muta/.test(k)) delete mo[k];
  }

  emit('data-matchups.js',
    '// Generated from the fill-in workbook; migrated by scripts/purge-muta.mjs (Muta removed from the meta).',
    [['window.DSA_MATCHUP_DATA', d, false]]);
  console.log('matchups: ' + d.threatResponses.length + ' responses kept');
}

/* ---------- 2. units + tierlist ---------- */
{
  const w = load('data-units.js');
  const units = w.DSA_UNITS.map(u => {
    if (isMuta(u.slug) || isMuta(u.name)) {
      return { ...u,
        tier: 'C', earlyTier: 'C', lateTier: 'C', oldTier: 'S', newTier: 'C',
        role: 'Nerfed out of the meta. No longer a real ZvZ opener — do not build.',
        summary: 'Nerfed out of the meta. No longer a real ZvZ opener — do not build.',
        tierNotes: 'Nerfed out of the meta. No longer a real ZvZ opener — do not build.',
        strongAgainst: [],
        commonMistake: 'Opening Muta out of habit from the old meta.',
        beginnerWarning: 'Muta is bad in the current patch. The ZvZ core is Roach + Infestor now.'
      };
    }
    return scrub(u);
  });
  emit('data-units.js', '// Generated from the fill-in workbook; migrated by scripts/purge-muta.mjs.',
    [['window.DSA_UNITS', units, false]]);

  const w2 = load('data-tierlist.js');
  const tl = w2.DSA_TIERLIST.map(u => {
    if (isMuta(u.slug) || isMuta(u.unit)) {
      return { ...u, tier: 'C', earlyTier: 'C', lateTier: 'C', oldTier: 'S', newTier: 'C',
        notes: 'Nerfed out of the meta — do not build.', role: 'Nerfed out of the meta — do not build.' };
    }
    return scrub(u);
  });
  emit('data-tierlist.js', '// Generated from the fill-in workbook; migrated by scripts/purge-muta.mjs.',
    [['window.DSA_TIERLIST', tl, false]]);
  console.log('units/tierlist: muta demoted to C');
}

/* ---------- 3. scenarios ---------- */
{
  const w = load('data-scenarios.js');
  const DROP = new Set(['scn-zvz-muta-spread', 'scn-muta-vs-queen-wall']);
  const scns = w.DSA_SCENARIOS
    .filter(s => !DROP.has(s.id))
    .map(s => {
      for (const side of [s.badSetup, s.goodSetup, s.enemy]) {
        if (side && side.units) side.units = side.units.map(u => isMuta(u.name) ? { ...u, name: 'Zergling' } : u);
        if (side && /muta/i.test(side.label || '')) side.label = side.label.replace(/\s*\/?\s*Muta(s)?/gi, '').replace(/\/\//g, '/');
      }
      s.threats = (s.threats || []).filter(t => !isMuta(t));
      return scrub(s);
    });
  emit('data-scenarios.js',
    '/*\n  Battle scenario data (bad pass -> good pass replays).\n  Coordinates: x/y are % of the stage. Allies x 2-38, enemies x 62-96.\n  fx: storm | fungal | nova | mine. Migrated by scripts/purge-muta.mjs.\n*/',
    [['window.DSA_SCENARIOS', scns, true]]);
  console.log('scenarios: ' + scns.length + ' kept (2 muta scenarios dropped)');
}

/* ---------- 4. strategy guides ---------- */
{
  const w = load('data-strategy-guides.js');
  const DROP = new Set(['guide-zvz-muta-window']);
  const guides = (w.DSA_STRATEGY_GUIDES || [])
    .filter(g => !DROP.has(g.id) && !/muta era/i.test(g.title || ''))
    .map(g => {
      g.tags = (g.tags || []).filter(t => !isMuta(t));
      return scrub(g);
    });
  emit('data-strategy-guides.js', '// Strategy guides; migrated by scripts/purge-muta.mjs.',
    [['window.DSA_STRATEGY_GUIDES', guides, true], ['window.DSA_RACE_GUIDES', w.DSA_RACE_GUIDES || [], true]]);
  console.log('guides: ' + guides.length + ' kept');
}

console.log('done — now rerun generate-share.mjs and generate-og.py');
