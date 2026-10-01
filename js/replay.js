/*
  replay.js — the battle lane. Every counter gets an animated replay, front
  and center (v13 lesson: a small side panel gets ignored).

  Two modes:
   1. Authored scenario (js/data/data-scenarios.js): bad pass -> good pass,
      exactly like v13's scenario theater but bigger and autoplaying.
   2. Auto-generated: no authored scenario? We synthesize one — enemy wave of
      the threat unit vs a cost-balanced line of the recommended counters.

  API:
    DG_REPLAY.mount(el, { threat, myRace, counterUnits, autoplay:true })
    DG_REPLAY.findScenario(threat, myRace)
*/
(function () {
  'use strict';
  const { esc, slug, unitImage, costOf, reducedMotion } = window.DG;

  const ADVANCE_MS = 1900;
  const PASS_MS = 4600;

  function scenarios() { return Array.isArray(window.DSA_SCENARIOS) ? window.DSA_SCENARIOS : []; }

  function findScenario(threat, myRace) {
    const key = slug(threat);
    if (!key || key === 'unknown') return null;
    const hits = scenarios().filter(s =>
      (s.threats || []).some(t => slug(t) === key) ||
      (s.enemy?.units || []).some(u => slug(u.name) === key)
    );
    if (!hits.length) return null;
    return hits.find(s => !myRace || (s.races || []).includes(myRace)) || hits[0];
  }

  function sideTotal(units) { return (units || []).reduce((s, u) => s + costOf(u.name), 0); }

  /* Build a synthetic scenario from a threat + counter chain. */
  function autoScenario(threat, counterUnits) {
    const tCost = Math.max(20, costOf(threat));
    const eCount = Math.max(3, Math.min(6, Math.round(760 / tCost)));
    const enemy = [];
    for (let i = 0; i < eCount; i++) {
      enemy.push({ name: threat, x: 68 + (i % 2) * 13 + (i % 3) * 3, y: 16 + i * (66 / Math.max(1, eCount - 1)) });
    }
    const enemyTotal = sideTotal(enemy);
    const names = (counterUnits && counterUnits.length ? counterUnits : ['Marine']).slice(0, 3);
    const allies = [];
    let total = 0, guard = 0, i = 0;
    while (total < enemyTotal - 120 && allies.length < 8 && guard < 40) {
      const n = names[i % names.length];
      allies.push({ name: n });
      total += Math.max(20, costOf(n));
      i++; guard++;
    }
    if (!allies.length) names.forEach(n => allies.push({ name: n }));
    const cols = [14, 27];
    allies.forEach((u, idx) => {
      u.x = cols[idx % 2] + (idx % 3);
      u.y = 14 + idx * (72 / Math.max(1, allies.length - 1));
    });
    return {
      auto: true,
      title: esc(threat) + ' wave vs your counter line',
      fx: 'nova',
      goodSetup: { label: 'Counter line', units: allies },
      enemy: { units: enemy },
      outcome: { good: 'The recommended counter takes the trade. Match their count and keep this shape.' }
    };
  }

  function unitEl(u, side) {
    const el = document.createElement('div');
    el.className = 'rp-unit ' + side;
    el.style.left = u.x + '%';
    el.style.top = u.y + '%';
    el.innerHTML = '<img alt="" src="' + unitImage(u.name) + '" onerror="this.src=\'assets/units/unknown.png\'">';
    el.title = u.name;
    return el;
  }

  function mount(container, opts) {
    if (!container) return null;
    if (container._rp) container._rp.destroy();
    const scn = (opts.scenario || findScenario(opts.threat, opts.myRace)) || autoScenario(opts.threat, opts.counterUnits);
    const authored = !scn.auto;

    container.classList.add('replay');
    container.innerHTML =
      '<div class="replay-stage"><div class="mid-line"></div></div>' +
      '<div class="rp-caption"><span class="cap-badge good">Replay</span><span class="cap-txt">' +
      (authored ? esc(scn.lesson || scn.title || '') : 'Auto-simulated from the counter data.') + '</span></div>' +
      '<div class="rp-controls">' +
      '<button type="button" class="btn rp-play">▶ Play</button>' +
      '<div class="rp-progress"><i></i></div></div>' +
      '<div class="rp-cost"><b class="ally">You: <span class="rc-a">0</span> min</b>' +
      '<b class="enemy">Them: <span class="rc-e">0</span> min</b></div>';

    const stage = container.querySelector('.replay-stage');
    const capBadge = container.querySelector('.cap-badge');
    const capTxt = container.querySelector('.cap-txt');
    const playBtn = container.querySelector('.rp-play');
    const progress = container.querySelector('.rp-progress i');
    const timers = [];
    let playing = false;

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearTimers() { timers.forEach(clearTimeout); timers.length = 0; }
    function caption(kind, text) {
      capBadge.className = 'cap-badge ' + kind;
      capBadge.textContent = kind === 'bad' ? 'The mistake' : (authored ? 'The fix' : 'The counter');
      capTxt.textContent = text || '';
    }
    function runProgress(ms) {
      progress.classList.remove('run');
      void progress.offsetWidth;
      progress.style.setProperty('--run', ms + 'ms');
      progress.classList.add('run');
    }
    function costs(allySide) {
      container.querySelector('.rc-a').textContent = sideTotal(allySide);
      container.querySelector('.rc-e').textContent = sideTotal(scn.enemy.units);
    }

    function placePass(setup) {
      stage.innerHTML = '<div class="mid-line"></div>';
      const els = { allies: [], enemies: [] };
      (setup.units || []).forEach(u => { const el = unitEl(u, 'ally'); stage.appendChild(el); els.allies.push(el); });
      (scn.enemy.units || []).forEach(u => { const el = unitEl(u, 'enemy'); stage.appendChild(el); els.enemies.push(el); });
      costs(setup.units);
      return els;
    }

    function flash(x, y) {
      const f = document.createElement('div');
      f.className = 'rp-flash ' + (scn.fx || 'nova');
      f.style.left = x + '%'; f.style.top = y + '%';
      stage.appendChild(f);
      requestAnimationFrame(() => f.classList.add('go'));
      later(() => f.remove(), 900);
    }

    function advance(els) {
      const w = stage.clientWidth;
      els.allies.forEach(el => { el.style.setProperty('--tf', 'translateX(' + w * 0.16 + 'px)'); el.style.transform = 'translateX(' + w * 0.16 + 'px)'; });
      els.enemies.forEach(el => { el.style.setProperty('--tf', 'translateX(' + (-w * 0.16) + 'px)'); el.style.transform = 'translateX(' + (-w * 0.16) + 'px)'; });
    }

    function kill(list, stagger) {
      list.forEach((el, i) => later(() => { el.classList.add('hit'); later(() => el.classList.add('dead'), 260); }, i * (stagger || 130)));
    }
    function crown(list) { list.forEach(el => el.classList.add('winner')); }

    function passBad(thenGood) {
      const els = placePass(scn.badSetup);
      caption('bad', (scn.badSetup.label || 'Bad setup') + ' — watch what happens.');
      runProgress(PASS_MS);
      later(() => advance(els), 120);
      later(() => flash(46, 42), ADVANCE_MS - 250);
      later(() => { kill(els.allies, 110); crown(els.enemies); caption('bad', scn.outcome?.bad || 'The formation loses.'); }, ADVANCE_MS + 150);
      later(thenGood, PASS_MS);
    }

    function passGood(done) {
      const els = placePass(scn.goodSetup);
      caption('good', (scn.goodSetup.label || 'Counter') + (authored ? ' — same enemy wave, new result.' : ''));
      runProgress(PASS_MS);
      later(() => advance(els), 120);
      later(() => flash(52, 46), ADVANCE_MS - 250);
      later(() => { kill(els.enemies, 140); crown(els.allies); caption('good', scn.outcome?.good || 'The counter holds.'); }, ADVANCE_MS + 150);
      later(done, PASS_MS);
    }

    function finish() {
      playing = false;
      playBtn.textContent = '↺ Replay';
      if (opts.onWatched) opts.onWatched(scn);
    }

    function play() {
      if (playing) return;
      playing = true;
      clearTimers();
      playBtn.textContent = '… running';
      if (authored && scn.badSetup) passBad(() => passGood(finish));
      else passGood(finish);
    }

    function staticFrame() {
      const setup = scn.goodSetup;
      const els = placePass(setup);
      crown(els.allies);
      caption('good', scn.outcome?.good || 'The counter holds.');
      playBtn.textContent = '▶ Play';
    }

    playBtn.addEventListener('click', play);

    if (reducedMotion()) {
      staticFrame();
    } else {
      placePass(authored && scn.badSetup ? scn.badSetup : scn.goodSetup);
      caption(authored && scn.badSetup ? 'bad' : 'good', 'Press play — or just scroll, it starts on its own.');
      if (opts.autoplay !== false && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
          entries.forEach(en => { if (en.isIntersecting) { io.disconnect(); later(play, 350); } });
        }, { threshold: 0.45 });
        io.observe(stage);
      }
    }

    const ctrl = { play, destroy() { clearTimers(); container._rp = null; }, scenario: scn, authored };
    container._rp = ctrl;
    return ctrl;
  }

  window.DG_REPLAY = { mount, findScenario, autoScenario };
})();
