/*
  patch-infestor-meta.mjs — 2026 shroud-meta balance pass.
  - Infestor: S tier across the board (tier list + units).
  - Ultralisk: up to B tier early game.
  - Infestor threat rows (all 3 races): priority Critical, skill High,
    surfaced near the top, with the new counters:
      Protoss -> Disruptor | Terran -> Liberator | Zerg -> Infestor mirror.
  Run: node scripts/patch-infestor-meta.mjs   (then regen share/og)
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

const INFESTOR_NOTE = 'S across the board: free Microbial Shroud halves all ranged damage on the line in front while fungal locks clumps. The engine of the current meta.';
const ULTRA_NOTE = 'Early Ultra timings got real — B tier early now. Still an S-tier feeling timing in ZvZ Ultra mirrors.';

/* ---- 1. tier list ---- */
{
  const w = load('data-tierlist.js');
  const tl = w.DSA_TIERLIST.map(u => {
    if (u.slug === 'infestor') {
      return { ...u, tier: 'S', earlyTier: 'S', lateTier: 'S', oldTier: 'B', newTier: 'S', notes: INFESTOR_NOTE, role: INFESTOR_NOTE };
    }
    if (u.slug === 'ultralisk') {
      return { ...u, earlyTier: 'B', oldTier: 'C', newTier: 'B', notes: ULTRA_NOTE, role: ULTRA_NOTE };
    }
    return u;
  });
  emit('data-tierlist.js', '// Generated from the fill-in workbook; migrated by purge-muta + patch-infestor-meta.', [['window.DSA_TIERLIST', tl, false]]);
}

/* ---- 2. units ---- */
{
  const w = load('data-units.js');
  const units = w.DSA_UNITS.map(u => {
    if (u.slug === 'infestor') {
      return { ...u, tier: 'S', earlyTier: 'S', lateTier: 'S', oldTier: 'B', newTier: 'S',
        role: INFESTOR_NOTE, summary: INFESTOR_NOTE, tierNotes: INFESTOR_NOTE, skillLevel: 'High',
        strongAgainst: ['Any ranged-heavy composition (shroud)', 'Clumped Marines/Hydras (fungal)'],
        commonMistake: 'Trying to out-shoot a shrouded line with more ranged units.',
        beginnerWarning: 'Shroud is free. If you are ranged-only into Roach + Infestor, you are paying double for every kill.' };
    }
    if (u.slug === 'ultralisk') {
      return { ...u, earlyTier: 'B', oldTier: 'C', newTier: 'B', role: ULTRA_NOTE, summary: ULTRA_NOTE, tierNotes: ULTRA_NOTE };
    }
    return u;
  });
  emit('data-units.js', '// Generated from the fill-in workbook; migrated by purge-muta + patch-infestor-meta.', [['window.DSA_UNITS', units, false]]);
}

/* ---- 3. infestor threat rows ---- */
{
  const w = load('data-matchups.js');
  const d = w.DSA_MATCHUP_DATA;
  const img = u => ({ unit: u, slug: u.toLowerCase().replace(/\s+/g, '-'), image: 'assets/units/' + u.toLowerCase().replace(/\s+/g, '-') + '.png' });

  const PATCH = {
    infestor__protoss: {
      counterUnits: ['Disruptor'],
      recommended: ['Disruptor is the counter: novas do not care about Microbial Shroud — they vaporize the shrouded Roach line and the Infestors clumped behind it in one hit.'],
      avoid: ['Massing ranged units (Stalker/Adept) into the shroud', 'storm-only answers — drained Templar leave you naked'],
      warning: 'Shroud halves all ranged damage and it is free. Do not try to out-shoot it — delete it.',
      scoutTiming: 'Expect the Roach + Infestor core from the early-mid rounds.'
    },
    infestor__terran: {
      counterUnits: ['Liberator'],
      recommended: ['Liberator is the counter: siege zones force the Roaches off their shroud and punish the Infestors behind the line. Keep your bio spaced so fungal cannot snowball while the zones do the work.'],
      avoid: ['Adding more Marines into fungal + shroud', 'bio-only compositions'],
      warning: 'A shrouded line eats bio waves at half price. Zone it from above instead.',
      scoutTiming: 'Expect the Roach + Infestor core from the early-mid rounds.'
    },
    infestor__zerg: {
      counterUnits: ['Infestor'],
      recommended: ['Mirror them: your own Infestor core. Shroud against shroud cancels the ranged math, and the better fungals decide the fight — sell your Lings and Banes to fund it now.'],
      avoid: ['Keeping Baneling/Zergling', 'ranged-only waves into their shroud'],
      warning: 'The mirror is now the answer. Falling behind on Infestor count in ZvZ is falling behind, period.',
      scoutTiming: 'Assume every ZvZ opponent is building toward Roach + Infestor.'
    }
  };

  d.threatResponses = d.threatResponses.map(r => {
    const p = PATCH[r.id];
    if (!p) return r;
    return { ...r, ...p,
      priority: 'Critical', skillCap: 'High', importance: 'Critical', sortScore: 195,
      counterImages: p.counterUnits.map(img),
      responseText: p.recommended[0],
      avoidText: p.avoid.join('; ') + '.',
      notes: 'Shroud meta: free 50% ranged damage reduction under it. ' + (r.id === 'infestor__zerg' ? 'Mirror or die.' : 'Force fights off the shroud or ignore its math entirely.'),
      confidence: 'Known', hasResponse: true
    };
  });
  if (d.threatSorting && Array.isArray(d.threatSorting.rows)) {
    d.threatSorting.rows = d.threatSorting.rows.map(r =>
      /^infestor__/.test(r.id || '') ? { ...r, score: 195, priority: 'Critical', skillCap: 'High', importance: 'Critical', reasons: ['shroud meta patch'] } : r);
  }
  emit('data-matchups.js', '// Generated from the fill-in workbook; migrated by purge-muta + patch-infestor-meta.', [['window.DSA_MATCHUP_DATA', d, false]]);
}

console.log('infestor meta patch applied — regen share/og next');
