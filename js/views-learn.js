/*
  views-learn.js — the Academy. ONE long guided path built from the real data:
   Chapter 1: Foundations (7 hand-written steps)
   Chapter 2: Formation lab — the 12 most instructive replays + hand-written tests
   Chapter 3-5: Threat mastery per race — the Critical/High threats + hand-written tests
  ~39 parts. ALL questions come from js/data/data-academy.js (hand-curated,
  no auto-generated answer choices). Rank-ups pop the center modal.
  The next thing to do is always the pulsing dot.
*/
(function () {
  'use strict';
  const { esc, slug, unitImage, get, set, bump, grantXP, rankFor } = window.DG;

  /* ---------- deterministic option shuffle (stable across re-renders) ---------- */
  function hashOf(str) {
    let h = 2166136261;
    const s = String(str);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seededShuffle(arr, seed) {
    const a = arr.slice();
    let h = hashOf(seed);
    for (let i = a.length - 1; i > 0; i--) {
      h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
      const j = h % (i + 1);
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function trim(s, n) {
    s = String(s || '').trim();
    n = n || 100;
    return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
  }
  function mcq(prompt, correct, distractorPool, explanation, seed) {
    const seen = { };
    seen[correct] = 1;
    const ds = [];
    for (const d of distractorPool) {
      if (!d || seen[d]) continue;
      seen[d] = 1;
      ds.push(d);
      if (ds.length === 3) break;
    }
    return { prompt: prompt, options: seededShuffle([correct].concat(ds), seed), correct: correct, explanation: explanation || '' };
  }

  /* ---------- static content ---------- */
  const LESSONS = {
    what: { title: 'What Direct Strike is', text: 'Direct Strike is a wave-based team strategy mode. You build an army that fights automatically, but your decisions before each wave decide how strong that wave becomes.' },
    skills: { title: 'The four core skills', text: 'Army spending, upgrade timing, micro, and strategy. Everything on this site trains one of these four.' },
    spend: { title: 'Army spending', text: 'You are not just buying units. You are buying wave strength. Bad spending gives your opponent a chance to punish you.' },
    upgrade: { title: 'Upgrade timing', text: 'Upgrades are good only when they affect enough units. Upgrading too early can lose the wave because you delayed army count.' },
    micro: { title: 'Micro', text: 'Auto-cast is useful, but it is not always smart. High Templar, Liberator, Viper, Raven, Ravager and Battlecruiser get much stronger with manual control.' },
    strategy: { title: 'Strategy', text: 'Your wave affects your teammates. Direct Strike is not three isolated 1v1s. Team strategy matters.' },
    gas: { title: 'Gas timing', text: 'Gas is not free. Early gas can make you lose wave strength, lose mid, and hand bounty to the enemy. Take it when your team is stable or already winning control.' },
    mid: { title: 'Mid control', text: 'Holding mid means your waves meet farther forward, pressure cannons, and shrink enemy space. Losing mid means your team is reacting instead of controlling.' },
    watch: { title: 'What to watch during waves', text: 'Watch what kills your army, what survives, whether your wave leaks, and whether your build helps or hurts the next teammate.' },
    shroud: { title: 'The shroud meta', text: 'The current ZvZ core is Roach + Infestor. Microbial Shroud is free and halves all ranged damage on units under it — ranged compositions trade terribly into it until they adapt.' }
  };

  const TRAPS = [
    { id: 'early-gas', label: 'Gas before stabilizing', severity: 'High', advice: 'Stabilize wave strength first. Gas is safer after mid control, cannon bounty, or several stable waves.' },
    { id: 'hydra-storm', label: 'Mass Hydras into High Templar', severity: 'Critical', advice: 'Add Roach buffers, spread Hydras, bait storm, or switch tech instead of one giant Hydra clump.' },
    { id: 'marine-storm', label: 'Mass Marines into storm', severity: 'Critical', advice: 'Spread, support, or transition. Terran usually needs Liberators, Ravens, Thors, Tanks, or BCs into heavy HT.' },
    { id: 'too-many-libs', label: 'Too many early Liberators', severity: 'Medium', advice: 'Liberators are strong, but three can be too many too early. Watch Stalker count and wave stability.' },
    { id: 'early-upgrade', label: 'Upgrade before enough units', severity: 'High', advice: 'Upgrades only pay off when they affect enough army. Losing count first can cost the wave.' },
    { id: 'blame-team', label: 'Blame teammate before watching all waves', severity: 'Medium', advice: 'Watch all three waves. Your build might create a bad handoff even if your own lane looks fine.' }
  ];

  const GLOSSARY = [
    ['Wave', 'The army that spawns from your side and fights the enemy wave.'],
    ['Mid', 'The center of the map. Holding it means pressure and safer gas.'],
    ['Cannon', 'Defensive structures. Killing them gives bounty; gas gets safer.'],
    ['Leak', 'Enemy units that survive your wave and continue onward.'],
    ['Gas', 'Economy investment: more future income, weaker immediate wave.'],
    ['Micro', 'Manual control of spells, targeting, or positioning.'],
    ['Bait', 'Cheap units used to draw spells before your real army arrives.'],
    ['Buffer', 'Durable frontline that soaks damage before your damage units.'],
    ['Clump', 'Units packed tightly. Clumps feed AoE like storm and fungal.'],
    ['Shroud', 'Microbial Shroud (Infestor). Free, and halves all ranged damage on units under it. The engine of the current ZvZ meta.'],
    ['Tech switch', 'Changing unit path because the current plan is countered.'],
    ['Hard counter', 'A response that strongly beats a specific enemy plan.'],
    ['Storm value', 'Damage one storm gets. Clumps give high value; spread and bait reduce it.'],
    ['Roach buffer', 'Roaches ahead of fragile Zerg units so storm hits Roaches first.'],
    ['Panic switch', 'A rushed tech change after losing a wave, usually underfunded.']
  ];

  /* ---------- chapter builders ---------- */
  function foundationSteps() {
    const gas = (window.DSA_GAS_SCENARIOS || []).map(function (s, i) {
      return mcq(s.prompt, s.correct, ['Yes', 'No'], s.explanation, 'gas' + i);
    });
    const zvz = (window.DSA_ZVZ_SCENARIOS || []).map(function (s, i) {
      return { prompt: s.prompt, options: seededShuffle(s.options, 'zvz' + i), correct: s.correct, explanation: s.explanation };
    });
    return [
      { id: 'basics', title: 'How the game actually works', sub: 'Foundations', xp: 25, lessons: [LESSONS.what, LESSONS.skills],
        quiz: [mcq('Your units fight automatically. So what actually decides who wins a wave?',
          'The decisions you make before the wave spawns',
          ['Clicking faster during the fight', 'Luck', 'Whoever has more upgrades, always'],
          'Direct Strike is decided between waves: what you buy, when, and in what shape.', 'basics1')] },
      { id: 'spending', title: 'Spending = wave strength', sub: 'Foundations', xp: 25, lessons: [LESSONS.spend, LESSONS.upgrade],
        quiz: [mcq('You can afford an upgrade OR two more units. Your wave has been trading evenly. What is usually right?',
          'More units — count first, upgrades when they affect enough army',
          ['Upgrade — upgrades always win', 'Save the minerals', 'Take gas'],
          'Upgrades only pay when they multiply across enough units.', 'spend1')] },
      { id: 'gas', title: 'Gas timing — the classic killer', sub: 'Foundations', xp: 40, lessons: [LESSONS.gas], quiz: gas, quizLabel: 'Gas or no gas?' },
      { id: 'formations', title: 'Formations vs AoE (storm eats clumps)', sub: 'Foundations', xp: 30, lessons: [LESSONS.watch],
        replay: { threat: 'High Templar', myRace: 'Zerg', counters: 'Roach,Hydralisk' },
        quiz: [mcq('Why did the second formation in the replay survive the same storms?',
          'Roach buffer in front + spread — storm lands on cheap HP',
          ['Better units', 'More upgrades', 'The enemy misclicked'],
          'Storm value comes from clumps. Buffers and spacing starve it.', 'form1')] },
      { id: 'micro', title: 'Micro & mid control', sub: 'Foundations', xp: 25, lessons: [LESSONS.micro, LESSONS.mid, LESSONS.strategy],
        quiz: [mcq('Which unit gains the MOST from turning off auto-cast?',
          'High Templar', ['Marine', 'Zealot', 'Roach'],
          'HT storm placement is the single highest-value micro in the mode.', 'micro1')] },
      { id: 'zvz', title: 'ZvZ — the Roach + Infestor era', sub: 'Foundations', xp: 60, lessons: [LESSONS.shroud],
        quiz: zvz, quizLabel: 'The shroud meta decision quiz',
        replay: { threat: 'Hydralisk', myRace: 'Zerg', counters: 'Roach,Infestor' } },
      { id: 'traps', title: 'Spot the noob traps', sub: 'Foundations', xp: 30, traps: true,
        quiz: [mcq('Your Hydra wave just evaporated to storms. Your first instinct should be…',
          'Fix the shape: buffer + spread, or tech switch',
          ['Build MORE Hydras', 'Take gas to catch up', 'Blame your teammate'],
          'Same units in a better shape often solves it before any tech switch.', 'traps1')] }
    ];
  }

  const scnById = {};
  function scenarioSteps() {
    const scns = Array.isArray(window.DSA_SCENARIOS) ? window.DSA_SCENARIOS : [];
    scns.forEach(function (s) { scnById[s.id] = s; });
    const bank = (window.DSA_ACADEMY && window.DSA_ACADEMY.formationLab) || [];
    const steps = [];
    bank.forEach(function (entry) {
      const s = scnById[entry.scenarioId];
      if (!s) return;
      const quiz = entry.questions.map(function (bq, i) {
        return mcq(bq.prompt, bq.correct, bq.wrong, bq.explain, entry.scenarioId + 'q' + i);
      });
      const icon = (s.enemy && s.enemy.units && s.enemy.units[0]) ? unitImage(s.enemy.units[0].name) : '';
      steps.push({ id: s.id, title: s.title, sub: 'Formation lab · watch first, then answer', xp: 20, scenarioId: s.id, quiz: quiz, icon: icon });
    });
    return steps;
  }

  function threatSteps(race) {
    const rows = ((window.DSA_MATCHUP_DATA || {}).threatResponses || []);
    const byId = {};
    rows.forEach(function (r) { byId[r.id] = r; });
    const bank = ((window.DSA_ACADEMY && window.DSA_ACADEMY.threats) || {})[race] || [];
    const steps = [];
    bank.forEach(function (entry) {
      const r = byId[entry.rowId];
      if (!r) return;
      const quiz = entry.questions.map(function (bq, i) {
        return mcq(bq.prompt, bq.correct, bq.wrong, bq.explain, entry.rowId + 'q' + i);
      });
      steps.push({
        id: 'thr_' + r.id,
        title: 'Counter: ' + r.enemyThreat,
        sub: race + ' threat mastery · priority: ' + (r.priority || 'Medium'),
        xp: 20,
        icon: r.enemyImage || unitImage(r.enemyThreat),
        replay: { threat: r.enemyThreat, myRace: race, counters: (r.counterUnits || []).join(',') },
        quiz: quiz
      });
    });
    return steps;
  }

  let CHAPTERS = null;
  function chapters() {
    if (!CHAPTERS) {
      CHAPTERS = [
        { title: 'Chapter 1 — Foundations', steps: foundationSteps() },
        { title: 'Chapter 2 — Formation lab', steps: scenarioSteps() },
        { title: 'Chapter 3 — Zerg threat mastery', steps: threatSteps('Zerg') },
        { title: 'Chapter 4 — Terran threat mastery', steps: threatSteps('Terran') },
        { title: 'Chapter 5 — Protoss threat mastery', steps: threatSteps('Protoss') }
      ];
    }
    return CHAPTERS;
  }
  function allSteps() {
    return chapters().reduce(function (acc, c) { return acc.concat(c.steps); }, []);
  }

  /* ---------- progress ---------- */
  function progress() { return get('learn', {}); }
  function stepDone(step, prog) {
    const p = (prog || progress())[step.id] || {};
    const qs = step.quiz || [];
    if (!qs.length) return false;
    for (let i = 0; i < qs.length; i++) if (!p['q' + i]) return false;
    return true;
  }

  /* ---------- summary ---------- */
  function renderSummary() {
    const box = document.getElementById('learn-summary');
    const steps = allSteps();
    const prog = progress();
    let done = 0;
    steps.forEach(function (s) { if (stepDone(s, prog)) done++; });
    const pct = Math.round((done / steps.length) * 100);
    const xp = get('xp', 0);
    const r = rankFor(xp);
    const streak = get('streak', { days: 0 }).days;
    let tests = 0;
    for (const k in prog) tests += Object.keys(prog[k] || {}).length;
    const C = 2 * Math.PI * 30;
    box.innerHTML = '<div class="panel">' +
      '<div class="ring"><svg width="74" height="74" viewBox="0 0 74 74">' +
      '<defs><linearGradient id="ringGrad"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient></defs>' +
      '<circle class="ring-bg" cx="37" cy="37" r="30" fill="none" stroke-width="6"/>' +
      '<circle class="ring-fg" cx="37" cy="37" r="30" fill="none" stroke-width="6" stroke-dasharray="' + C + '" stroke-dashoffset="' + (C * (1 - pct / 100)) + '"/>' +
      '</svg><span class="ring-txt">' + pct + '%</span></div>' +
      '<div class="learn-stats">' +
      '<div class="ls"><b>' + done + '/' + steps.length + '</b><span>parts done</span></div>' +
      '<div class="ls"><b>' + tests + '</b><span>tests passed</span></div>' +
      '<div class="ls"><b>' + xp + '</b><span>XP</span></div>' +
      '<div class="ls"><b>' + esc(r.name) + '</b><span>rank' + (r.next ? ' · next: ' + esc(r.next.name) + ' at ' + r.next.at : '') + '</span></div>' +
      '<div class="ls"><b>' + streak + '</b><span>day streak</span></div>' +
      '</div></div>';
  }

  /* ---------- path ---------- */
  function quizHTML(step) {
    return (step.quizLabel ? '<p><b>' + esc(step.quizLabel) + '</b></p>' : '') +
      (step.quiz || []).map(function (q, qi) {
        return '<div class="quiz-q" data-q="' + qi + '">' +
          '<div class="qq-prompt">' + esc(q.prompt) + '</div>' +
          '<div class="quiz-opts">' + q.options.map(function (o) {
            return '<button type="button" class="quiz-opt" data-opt="' + esc(o) + '">' + esc(o) + '</button>';
          }).join('') + '</div>' +
          '<div class="quiz-expl">' + esc(q.explanation || '') + '</div>' +
          '</div>';
      }).join('');
  }

  function trapsHTML() {
    return '<p><b>Which of these have YOU done this week?</b> Be honest — tap all that apply.</p>' +
      '<div class="trap-grid">' + TRAPS.map(function (t) {
        return '<button type="button" class="trap-btn" data-trap="' + t.id + '">' + esc(t.label) + '</button>';
      }).join('') + '</div><div class="trap-verdict"></div>';
  }

  function renderPath() {
    const list = document.getElementById('learn-path');
    const prog = progress();
    let nextMarked = false;
    let num = 0;
    let html = '';
    chapters().forEach(function (ch) {
      let chDone = 0;
      ch.steps.forEach(function (s) { if (stepDone(s, prog)) chDone++; });
      html += '<li class="chapter-head"><h3>' + esc(ch.title) + '</h3>' +
        '<span class="ch-progress">' + chDone + ' / ' + ch.steps.length + ' complete</span></li>';
      ch.steps.forEach(function (s) {
        num++;
        const done = stepDone(s, prog);
        const isNext = !done && !nextMarked;
        if (isNext) nextMarked = true;
        html += '<li class="step' + (done ? ' done' : '') + (isNext ? ' next open' : '') + '" data-step="' + s.id + '">' +
          '<span class="step-dot">' + (done ? '✓' : num) + '</span>' +
          '<div class="step-card">' +
          '<button type="button" class="step-head">' +
          (s.icon ? '<img class="step-icon" alt="" src="' + s.icon + '" onerror="this.style.display=\'none\'">' : '') +
          '<h3>' + esc(s.title) + '<span class="step-sub">' + esc(s.sub || '') + '</span></h3>' +
          '<span class="xp-pill">+' + s.xp + ' XP</span><span class="chev">▸</span></button>' +
          '<div class="step-body">' +
          (s.lessons || []).map(function (l) {
            return '<div class="lesson"><b>' + esc(l.title) + '</b><span>' + esc(l.text) + '</span></div>';
          }).join('') +
          ((s.replay || s.scenarioId) ? '<div class="rp-mount"></div>' : '') +
          (s.traps ? trapsHTML() : '') +
          quizHTML(s) +
          '</div></div></li>';
      });
    });
    list.innerHTML = html;

    const stepIndex = {};
    allSteps().forEach(function (s) { stepIndex[s.id] = s; });

    list.querySelectorAll('.step').forEach(function (li) {
      const step = stepIndex[li.dataset.step];
      if (!step) return;

      li.querySelector('.step-head').addEventListener('click', function () {
        const wasOpen = li.classList.contains('open');
        li.classList.toggle('open', !wasOpen);
        if (!wasOpen) mountStepReplay(li, step);
      });
      if (li.classList.contains('open')) mountStepReplay(li, step);

      li.querySelectorAll('.quiz-q').forEach(function (qEl) {
        const qi = Number(qEl.dataset.q);
        const q = step.quiz[qi];
        const answered = (progress()[step.id] || {})['q' + qi];
        if (answered) {
          qEl.querySelectorAll('.quiz-opt').forEach(function (b) {
            if (b.dataset.opt === q.correct) b.classList.add('correct');
          });
          if (q.explanation) qEl.querySelector('.quiz-expl').classList.add('show');
        }
        qEl.querySelectorAll('.quiz-opt').forEach(function (btn) {
          btn.addEventListener('click', function () {
            const right = btn.dataset.opt === q.correct;
            btn.classList.add(right ? 'correct' : 'wrong');
            if (right) {
              if (q.explanation) qEl.querySelector('.quiz-expl').classList.add('show');
              const p = progress();
              p[step.id] = p[step.id] || {};
              if (!p[step.id]['q' + qi]) {
                p[step.id]['q' + qi] = 1;
                set('learn', p);
                const per = Math.max(6, Math.round(step.xp / step.quiz.length));
                grantXP(per, null, 'test passed');
                if (stepDone(step)) {
                  bump('stepsDone');
                  grantXP(10, 'stepdone_' + step.id, 'part complete');
                  refresh(true);
                } else {
                  renderSummary();
                }
              }
            } else {
              setTimeout(function () { btn.classList.remove('wrong'); }, 600);
            }
          });
        });
      });

      li.querySelectorAll('.trap-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          btn.classList.toggle('picked');
          const picked = [];
          li.querySelectorAll('.trap-btn.picked').forEach(function (b) {
            const t = TRAPS.find(function (x) { return x.id === b.dataset.trap; });
            if (t) picked.push(t);
          });
          const v = li.querySelector('.trap-verdict');
          v.innerHTML = picked.length
            ? picked.map(function (t) {
                return '<div class="lesson"><b>' + esc(t.label) + ' · ' + esc(t.severity) + '</b><span>' + esc(t.advice) + '</span></div>';
              }).join('')
            : '<p class="sub">Nothing picked — either you are clean or you are lying. Both are fine.</p>';
        });
      });
    });
  }

  function mountStepReplay(li, step) {
    const m = li.querySelector('.rp-mount');
    if (!m || m._rp || !window.DG_REPLAY) return;
    const onWatched = function () {
      if (grantXP(5, 'watched_step_' + step.id, 'replay watched')) bump('replaysWatched');
    };
    if (step.scenarioId && scnById[step.scenarioId]) {
      window.DG_REPLAY.mount(m, { scenario: scnById[step.scenarioId], autoplay: true, onWatched: onWatched });
    } else if (step.replay) {
      window.DG_REPLAY.mount(m, {
        threat: step.replay.threat, myRace: step.replay.myRace,
        counterUnits: String(step.replay.counters || '').split(',').filter(Boolean),
        autoplay: true, onWatched: onWatched
      });
    }
  }

  function renderGlossary() {
    document.getElementById('glossary-box').innerHTML =
      '<h2 class="glow-h">Speak the language</h2>' +
      '<div class="gloss-grid">' + GLOSSARY.map(function (pair) {
        return '<div class="gloss-item"><b>' + esc(pair[0]) + '</b><p>' + esc(pair[1]) + '</p></div>';
      }).join('') + '</div>';
  }

  function refresh(keepOpen) {
    let openIds = null;
    if (keepOpen) {
      openIds = [];
      document.querySelectorAll('#learn-path .step.open').forEach(function (li) { openIds.push(li.dataset.step); });
    }
    renderSummary();
    renderPath();
    if (openIds) {
      const stepIndex = {};
      allSteps().forEach(function (s) { stepIndex[s.id] = s; });
      openIds.forEach(function (id) {
        const li = document.querySelector('#learn-path .step[data-step="' + id + '"]');
        if (li) { li.classList.add('open'); mountStepReplay(li, stepIndex[id]); }
      });
    }
  }

  function init() {
    renderSummary();
    renderPath();
    renderGlossary();
  }

  window.DG_LEARN = { init: init, refresh: refresh };
})();
