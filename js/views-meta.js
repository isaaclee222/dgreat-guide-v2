/*
  views-meta.js — Meta spotlight (shareable), animated tier board, changelog.
*/
(function () {
  'use strict';
  const { esc, unitImage, get, set, toast, grantXP } = window.DG;

  const CANON = 'https://dgreat.guide/';

  /* Featured meta callouts — newest first. Editable by non-programmers. */
  const SPOTLIGHTS = [
    {
      id: 'infestor-roach-shroud',
      kicker: 'Meta spotlight',
      title: 'Infestor + Roach: the free shroud wall',
      units: ['Infestor', 'Roach'],
      text: 'Microbial Shroud is free and it halves all ranged damage hitting units under it. Park Infestors behind a Roach line and the Roaches suddenly cost twice as much to kill — while fungal locks whatever walks in. Ranged-heavy comps (Marine, Hydra, Stalker) trade horribly into it until they add AoE or air.',
      counterNote: 'Beat it with storm, Colossus, Liberator zones, or by forcing fights off the shroud.'
    }
  ];

  const TIER_VAL = { S: 4, A: 3, B: 2, C: 1, D: 0 };
  function normTier(t) {
    const s = String(t || '').trim();
    if (/^s/i.test(s)) return 'S';
    if (/^a/i.test(s)) return 'A';
    if (/^b/i.test(s)) return 'B';
    return s ? 'C' : '';
  }

  const state = { race: get('metaRace', 'All'), phase: get('metaPhase', 'now') };

  function renderSpotlight() {
    const box = document.getElementById('meta-spotlight');
    box.innerHTML = SPOTLIGHTS.map(s =>
      '<article class="spotlight">' +
      '<span class="sp-kicker">' + esc(s.kicker) + '</span>' +
      '<h3>' + esc(s.title) + '</h3>' +
      '<div class="sp-units">' + s.units.map(u => '<img alt="' + esc(u) + '" title="' + esc(u) + '" src="' + unitImage(u) + '" onerror="this.src=\'assets/units/unknown.png\'">').join('') + '</div>' +
      '<p>' + esc(s.text) + '</p>' +
      '<p class="sub">' + esc(s.counterNote || '') + '</p>' +
      '<div class="share-row" style="border-top:0;padding:0.6rem 0 0;">' +
      '<button type="button" class="btn hot sp-discord" data-id="' + s.id + '">📋 Copy Discord post</button>' +
      '<button type="button" class="btn sp-link" data-id="' + s.id + '">🔗 Copy link</button>' +
      '</div></article>').join('');

    box.querySelectorAll('.sp-discord').forEach(b => b.addEventListener('click', () => {
      const s = SPOTLIGHTS.find(x => x.id === b.dataset.id);
      const url = CANON + '?view=meta#' + s.id;
      const msg = '**' + s.title + '**\n' + s.text + '\n' + (s.counterNote || '') + '\nMore counters + replays: ' + url;
      (navigator.clipboard?.writeText ? navigator.clipboard.writeText(msg) : Promise.reject()).then(
        () => toast('Discord post copied — paste it in the server'),
        () => toast('Copy failed')
      );
      grantXP(5, 'shared_meta_' + s.id, 'spread the meta');
    }));
    box.querySelectorAll('.sp-link').forEach(b => b.addEventListener('click', () => {
      const url = CANON + '?view=meta#' + b.dataset.id;
      (navigator.clipboard?.writeText ? navigator.clipboard.writeText(url) : Promise.reject()).then(
        () => toast('Link copied'), () => toast('Copy failed'));
    }));
  }

  function tierOf(u) {
    if (state.phase === 'early') return normTier(u.earlyTier || u.tier);
    if (state.phase === 'late') return normTier(u.lateTier || u.tier);
    return normTier(u.tier);
  }

  function renderBoard() {
    const box = document.getElementById('tier-board');
    const units = (window.DSA_TIERLIST || []).filter(u => state.race === 'All' || u.race === state.race);
    const rowsHTML = ['S', 'A', 'B', 'C'].map(T => {
      const inTier = units.filter(u => tierOf(u) === T);
      if (!inTier.length) return '';
      return '<div class="tier-row"><div class="tier-key ' + T + '">' + T + '</div><div class="tier-units">' +
        inTier.map(u => {
          const dv = (TIER_VAL[normTier(u.newTier)] ?? null) !== null && (TIER_VAL[normTier(u.oldTier)] ?? null) !== null
            ? TIER_VAL[normTier(u.newTier)] - TIER_VAL[normTier(u.oldTier)] : 0;
          const delta = dv > 0 ? '<span class="delta up">▲</span>' : (dv < 0 ? '<span class="delta dn">▼</span>' : '');
          const funky = /sometimes/i.test(String(u.tier)) ? '<span class="delta" style="color:var(--gold)">≈</span>' : '';
          return '<div class="tier-unit" tabindex="0">' + delta + funky +
            '<img alt="" src="' + (u.image || unitImage(u.unit)) + '" onerror="this.src=\'assets/units/unknown.png\'">' +
            '<span>' + esc(u.unit) + '</span>' +
            '<div class="tu-tip"><b>' + esc(u.unit) + '</b> · ' + esc(u.race) +
            (u.oldTier && u.newTier && u.oldTier !== u.newTier ? '<br>moved ' + esc(u.oldTier) + ' → ' + esc(u.newTier) : '') +
            '<br>' + esc(u.notes || u.role || '') + '</div></div>';
        }).join('') + '</div></div>';
    }).join('');

    box.innerHTML =
      '<div class="tier-filters">' +
      ['All', 'Zerg', 'Terran', 'Protoss'].map(r =>
        '<button type="button" class="btn f-race' + (state.race === r ? ' hot' : '') + '" data-r="' + r + '">' + r + '</button>').join('') +
      '<span style="width:12px"></span>' +
      [['now', 'Current'], ['early', 'Early game'], ['late', 'Late game']].map(([k, l]) =>
        '<button type="button" class="btn f-phase' + (state.phase === k ? ' hot' : '') + '" data-p="' + k + '">' + l + '</button>').join('') +
      '</div>' +
      '<div class="tier-rows">' + rowsHTML + '</div>' +
      '<p class="sub" style="margin-top:.5rem">▲▼ = moved since last revision · ≈ = situational S. Hover a unit for why.</p>';

    box.querySelectorAll('.f-race').forEach(b => b.addEventListener('click', () => {
      state.race = b.dataset.r; set('metaRace', state.race); renderBoard();
    }));
    box.querySelectorAll('.f-phase').forEach(b => b.addEventListener('click', () => {
      state.phase = b.dataset.p; set('metaPhase', state.phase); renderBoard();
    }));
  }

  /* minimal markdown: ## headings, - bullets, **bold** */
  function md(src) {
    const lines = String(src || '').split(/\r?\n/);
    let html = '', inList = false;
    const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    lines.forEach(l => {
      if (/^\s*-\s+/.test(l)) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + inline(l.replace(/^\s*-\s+/, '')) + '</li>';
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        if (/^##\s+/.test(l)) html += '<h4>' + inline(l.replace(/^##\s+/, '')) + '</h4>';
        else if (/^#\s+/.test(l)) html += '<h4>' + inline(l.replace(/^#\s+/, '')) + '</h4>';
        else if (l.trim()) html += '<p>' + inline(l) + '</p>';
      }
    });
    if (inList) html += '</ul>';
    return html;
  }

  function renderChangelog() {
    const box = document.getElementById('changelog');
    const src = window.DSA_SITE_CHANGELOG;
    if (!src) { box.innerHTML = ''; return; }
    box.innerHTML = '<h2 class="glow-h">What changed on the site</h2><div class="log-entry">' + md(src) + '</div>';
  }

  function init() {
    renderSpotlight();
    renderBoard();
    renderChangelog();
  }

  window.DG_META = { init };
})();
