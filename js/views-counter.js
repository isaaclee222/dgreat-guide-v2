/*
  views-counter.js — the main view. Flow: pick races -> threat deck -> counter
  card with a BIG replay + share row. Deep links: ?me=&enemy=&threat=
*/
(function () {
  'use strict';
  const { esc, slug, unitImage, costOf, get, set, bump, grantXP, toast } = window.DG;

  const RACES = ['Zerg', 'Terran', 'Protoss'];
  const CANON = 'https://dgreat.guide/';

  const state = {
    me: get('race', ''),
    enemy: get('enemyRace', 'Any'),
    threat: ''
  };

  function data() { return window.DSA_MATCHUP_DATA || { general: [], threatResponses: [] }; }

  function rows() {
    return (data().threatResponses || []).filter(r =>
      r.hasResponse &&
      r.myRace === state.me &&
      (state.enemy === 'Any' || r.enemyRaceContext === 'Any' || r.enemyRaceContext === state.enemy) &&
      (state.enemy === 'Any' || !r.unitRace || r.unitRace === state.enemy)
    ).sort((a, b) => (b.sortScore || 0) - (a.sortScore || 0));
  }

  function deepLink(extra) {
    const p = new URLSearchParams();
    if (state.me) p.set('me', state.me);
    if (state.enemy && state.enemy !== 'Any') p.set('enemy', state.enemy);
    if (state.threat) p.set('threat', slug(state.threat));
    const q = p.toString();
    return { canon: CANON + (q ? '?' + q : ''), local: location.pathname + (q ? '?' + q : '') };
  }

  function syncURL() {
    try { history.replaceState(null, '', deepLink().local + location.hash); } catch (e) { /* file:// */ }
  }

  /* ---------- race pickers ---------- */
  function raceBtn(race, small) {
    return '<button type="button" class="race-btn" data-race="' + race + '">' +
      race + (small ? '<small>' + small + '</small>' : '') + '</button>';
  }

  function renderPickers() {
    const my = document.getElementById('my-race');
    const en = document.getElementById('enemy-race');
    my.innerHTML = RACES.map(r => raceBtn(r, { Zerg: 'swarm', Terran: 'machines', Protoss: 'templar' }[r])).join('');
    en.innerHTML = raceBtn('Any', 'show all') + RACES.map(r => raceBtn(r)).join('');
    my.querySelectorAll('.race-btn').forEach(b => b.addEventListener('click', () => {
      state.me = b.dataset.race; set('race', state.me);
      state.threat = '';
      grantXP(10, 'picked_race', 'race locked in');
      renderAll();
    }));
    en.querySelectorAll('.race-btn').forEach(b => b.addEventListener('click', () => {
      state.enemy = b.dataset.race; set('enemyRace', state.enemy);
      renderAll();
    }));
  }

  function paintPickers() {
    document.querySelectorAll('#my-race .race-btn').forEach(b => b.classList.toggle('on', b.dataset.race === state.me));
    document.querySelectorAll('#enemy-race .race-btn').forEach(b => b.classList.toggle('on', b.dataset.race === state.enemy));
    const bar = document.getElementById('vs-bar');
    let hint = bar.querySelector('.coach-hint');
    if (!state.me) {
      if (!hint) {
        hint = document.createElement('span');
        hint.className = 'coach-hint';
        hint.textContent = '① Start here — pick your race';
        bar.appendChild(hint);
      }
    } else if (hint) hint.remove();
  }

  /* ---------- baseline ---------- */
  function renderBaseline() {
    const box = document.getElementById('baseline');
    if (!state.me) { box.innerHTML = ''; return; }
    const enemy = state.enemy === 'Any' ? null : state.enemy;
    const all = (data().general || []).filter(g => g.myRace === state.me && (!enemy || g.enemyRace === enemy));
    if (!all.length) { box.innerHTML = ''; return; }
    const first = all[0];
    const posNotes = enemy ? all.filter(g => g.positionNote).map(g =>
      '<div class="pos-note"><b>' + esc(g.position) + ':</b> ' + esc(g.positionNote) + '</div>').join('') : '';
    box.innerHTML =
      '<details class="baseline-card panel"' + (get('baselineOpen', true) ? ' open' : '') + '>' +
      '<summary>Baseline plan — ' + esc(state.me) + (enemy ? ' vs ' + esc(enemy) : ' (pick an enemy race for specifics)') + '</summary>' +
      '<p>' + esc(first.overview || '') + '</p>' +
      (first.priorities?.length ? '<ul>' + first.priorities.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>' : '') +
      posNotes + '</details>';
    const det = box.querySelector('details');
    det.addEventListener('toggle', () => set('baselineOpen', det.open));
  }

  /* ---------- threat deck ---------- */
  function badge(priority) {
    const p = String(priority || '').toLowerCase();
    if (p === 'critical') return '<span class="badge crit">Critical</span>';
    if (p === 'high') return '<span class="badge high">High</span>';
    return '<span class="badge med">' + esc(priority || 'Medium') + '</span>';
  }

  function renderDeck() {
    const deck = document.getElementById('threat-deck');
    if (!state.me) {
      deck.innerHTML = '<p class="sub">Pick your race above and the threat board loads for your matchup.</p>';
      return;
    }
    const list = rows();
    if (!list.length) {
      deck.innerHTML = '<p class="sub">No filled responses for this filter yet. Try "Any" enemy race.</p>';
      return;
    }
    deck.innerHTML = list.map((r, i) =>
      '<button type="button" class="threat-tile' + (slug(r.enemyThreat) === slug(state.threat) ? ' on' : '') +
      '" data-threat="' + esc(r.enemyThreat) + '" style="--i:' + i + '">' +
      badge(r.priority) +
      '<img alt="" src="' + (r.enemyImage || unitImage(r.enemyThreat)) + '" onerror="this.src=\'assets/units/unknown.png\'">' +
      '<span class="t-name">' + esc(r.enemyThreat) + '</span>' +
      '<span class="t-meta">' + esc(r.unitRace || '') + ' · skill: ' + esc(r.skillCap || '?') + '</span>' +
      '</button>').join('');
    deck.querySelectorAll('.threat-tile').forEach(t => t.addEventListener('click', () => {
      selectThreat(t.dataset.threat, true);
    }));
  }

  /* ---------- counter card ---------- */
  function typewrite(el, text) {
    if (window.DG.reducedMotion()) { el.textContent = text; return; }
    let i = 0;
    el.textContent = '';
    const step = () => {
      if (i <= text.length) { el.textContent = text.slice(0, i); i += 2; setTimeout(step, 24); }
    };
    step();
  }

  function chainHTML(r) {
    const chips = (r.counterImages && r.counterImages.length
      ? r.counterImages
      : (r.counterUnits || []).map(u => ({ unit: u, image: unitImage(u) })));
    if (!chips.length) return '';
    return '<div class="chain"><span class="ch-label">The counter chain</span>' +
      chips.map((c, i) =>
        (i ? '<span class="chain-arrow">+</span>' : '') +
        '<span class="chain-chip" style="animation-delay:' + (i * 120) + 'ms">' +
        '<img alt="" src="' + esc(c.image) + '" onerror="this.src=\'assets/units/unknown.png\'">' +
        esc(c.unit) + '<small>' + (costOf(c.unit) || '?') + 'm</small></span>'
      ).join('') + '</div>';
  }

  function block(title, cls, inner) {
    return inner ? '<div class="info-block ' + cls + '"><h4>' + title + '</h4>' + inner + '</div>' : '';
  }
  function listOrText(list, text) {
    if (list && list.length) return '<ul>' + list.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
    return text ? '<p>' + esc(text) + '</p>' : '';
  }

  function discordPost(r, url) {
    const line = (r.recommended && r.recommended[0]) || r.responseText || '';
    return '**' + r.enemyThreat + ' wrecking you in Direct Strike?**\n' +
      (line ? line.slice(0, 180) + (line.length > 180 ? '…' : '') + '\n' : '') +
      'Counter: ' + (r.counterUnits || []).join(' + ') + '\n' +
      '▶ Watch the replay: ' + url;
  }

  function copy(text, okMsg) {
    const done = () => toast(okMsg || 'Copied');
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed — select manually'); }
    ta.remove();
  }

  function renderCard() {
    const box = document.getElementById('counter-card');
    if (!state.threat) { box.innerHTML = ''; return; }
    const r = rows().find(x => slug(x.enemyThreat) === slug(state.threat)) ||
      (data().threatResponses || []).find(x => x.myRace === state.me && slug(x.enemyThreat) === slug(state.threat));
    if (!r) { box.innerHTML = ''; return; }
    if (grantXP(3, 'read_' + r.id, 'counter studied')) bump('countersRead');

    const links = deepLink();
    const votesKey = 'vote_' + r.id;
    const myVote = get(votesKey, 0);

    box.innerHTML =
      '<article class="counter-card">' +
      '<div class="cc-head">' +
      '<img alt="" src="' + (r.enemyImage || unitImage(r.enemyThreat)) + '" onerror="this.src=\'assets/units/unknown.png\'">' +
      '<div class="cc-title"><h3>' + esc(r.enemyThreat) + '</h3><span class="typed"></span></div>' +
      '<div class="cc-tags">' +
      '<span class="tag hot">' + esc(r.priority || 'threat') + '</span>' +
      '<span class="tag">' + esc(r.unitRace || '') + '</span>' +
      '<span class="tag cool">phase: ' + esc(r.phase || 'Any') + '</span>' +
      '<span class="tag">skill: ' + esc(r.skillCap || '?') + '</span>' +
      '</div></div>' +
      '<div class="cc-body">' +
      '<div class="cc-replay"><div class="rp-mount"></div></div>' +
      '<div class="cc-info">' +
      chainHTML(r) +
      '<div class="cost-bar"></div>' +
      block('When to expect it', '', r.scoutTiming ? '<p>' + esc(r.scoutTiming) + '</p>' : '') +
      block('When to respond', '', r.responseTiming ? '<p>' + esc(r.responseTiming) + '</p>' : '') +
      block('Do this', '', listOrText(r.recommended, r.responseText)) +
      block('Do not do this', 'avoid', listOrText(r.avoid, r.avoidText)) +
      (r.warning ? '<div class="warn-strip info-block warn"><h4>Warning</h4><p>' + esc(r.warning) + '</p></div>' : '') +
      (r.notes ? block('Notes', '', '<p>' + esc(r.notes) + '</p>') : '') +
      '</div></div>' +
      '<div class="share-row">' +
      '<button type="button" class="btn hot cc-discord">📋 Copy Discord post</button>' +
      '<button type="button" class="btn cc-link">🔗 Copy link</button>' +
      (navigator.share ? '<button type="button" class="btn cc-share">↗ Share</button>' : '') +
      '<div class="vote-pair"><span>Did this help?</span>' +
      '<button type="button" class="btn cc-up"' + (myVote === 1 ? ' style="border-color:var(--green)"' : '') + '>👍</button>' +
      '<button type="button" class="btn cc-dn"' + (myVote === -1 ? ' style="border-color:var(--red)"' : '') + '>👎</button></div>' +
      '</div></article>';

    typewrite(box.querySelector('.typed'), r.scoutTiming || ('Threat detected — ' + (r.priority || 'respond') + ' priority.'));

    const ctrl = window.DG_REPLAY.mount(box.querySelector('.rp-mount'), {
      threat: r.enemyThreat, myRace: state.me, counterUnits: r.counterUnits,
      onWatched: () => { if (grantXP(5, 'watched_' + slug(r.enemyThreat), 'replay watched')) bump('replaysWatched'); }
    });

    const scn = ctrl?.scenario;
    if (scn) {
      const a = (scn.goodSetup?.units || []).reduce((s, u) => s + costOf(u.name), 0);
      const e = (scn.enemy?.units || []).reduce((s, u) => s + costOf(u.name), 0);
      const diff = e - a;
      const pct = e > 0 ? Math.min(100, Math.round((a / e) * 100)) : 100;
      const cb = box.querySelector('.cost-bar');
      cb.innerHTML = '<div class="cb-track"><i style="width:0"></i></div>' +
        '<div class="cb-line"><span>Your line: <b>' + a + '</b> min</span>' +
        '<span class="cb-verdict ' + (diff >= 0 ? 'good' : (diff > -200 ? '' : 'bad')) + '">' +
        (diff >= 0 ? 'You spend ' + diff + ' less' : 'You spend ' + (-diff) + ' more') + '</span>' +
        '<span>Their wave: <b>' + e + '</b> min</span></div>';
      requestAnimationFrame(() => { cb.querySelector('i').style.width = pct + '%'; });
    }

    box.querySelector('.cc-discord').addEventListener('click', () => {
      copy(discordPost(r, links.canon), 'Discord post copied — paste it in the server');
      grantXP(5, 'shared_' + r.id, 'spread the word');
    });
    box.querySelector('.cc-link').addEventListener('click', () => copy(links.canon, 'Link copied'));
    box.querySelector('.cc-share')?.addEventListener('click', () => {
      navigator.share({ title: 'dgreat.guide — counter ' + r.enemyThreat, text: 'The counter to ' + r.enemyThreat + ' in Direct Strike:', url: links.canon }).catch(() => {});
    });
    box.querySelector('.cc-up').addEventListener('click', () => { set(votesKey, 1); toast('Noted — glad it helped'); renderCard(); });
    box.querySelector('.cc-dn').addEventListener('click', () => { set(votesKey, -1); toast('Noted — we\'ll review this one'); renderCard(); });
  }

  function selectThreat(name, scroll) {
    state.threat = name;
    syncURL();
    renderDeck();
    renderCard();
    if (scroll) {
      const card = document.getElementById('counter-card');
      setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  function renderAll() {
    paintPickers();
    renderBaseline();
    renderDeck();
    renderCard();
    syncURL();
  }

  function init(params) {
    if (params.get('me') && RACES.includes(params.get('me'))) { state.me = params.get('me'); set('race', state.me); }
    if (params.get('enemy')) state.enemy = params.get('enemy');
    if (params.get('threat')) {
      const t = (data().threatResponses || []).find(x => slug(x.enemyThreat) === slug(params.get('threat')) && (!state.me || x.myRace === state.me));
      if (t) { state.me = state.me || t.myRace; state.threat = t.enemyThreat; }
    }
    renderPickers();
    renderAll();
    if (state.threat) setTimeout(() => document.getElementById('counter-card').scrollIntoView({ block: 'center' }), 200);
  }

  window.DG_COUNTER = { init, selectThreat, state };
})();
