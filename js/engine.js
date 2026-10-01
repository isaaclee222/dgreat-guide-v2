/*
  engine.js — shared utilities + player progression (XP / ranks / streak).
  Rank-ups open a center-screen popup ("You have learned: …") that must be
  dismissed with a click. Progress persists in localStorage (DG14_ prefix).
*/
(function () {
  'use strict';

  const SLUG_ALIAS = {
    'widowmine': 'widow-mine', 'siegetank': 'siege-tank', 'sigetank': 'siege-tank',
    'pheonix': 'phoenix', 'voidray': 'void-ray', 'mutalisk': 'muta', 'muta': 'muta',
    'hydra': 'hydralisk', 'ling': 'zergling', 'lings': 'zergling', 'collos': 'colossus',
    'high templar': 'high-templar', 'ht': 'high-templar'
  };

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function slug(v) {
    const raw = String(v || '').toLowerCase().trim();
    if (SLUG_ALIAS[raw]) return SLUG_ALIAS[raw];
    return raw.replace(/&/g, ' and ').replace(/\s*\/\s*/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
  }
  function unitImage(name) { return 'assets/units/' + slug(name) + '.png'; }
  function costOf(name) {
    const c = window.DSA_UNIT_COSTS || {};
    return Number(c[slug(name)] || 0);
  }
  function raceVar(race) {
    return { Zerg: 'var(--zerg)', Terran: 'var(--terran)', Protoss: 'var(--protoss)' }[race] || 'var(--cyan)';
  }
  function reducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------- storage ---------- */
  function get(key, fallback) {
    try { const v = localStorage.getItem('DG14_' + key); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  }
  function set(key, value) {
    try { localStorage.setItem('DG14_' + key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }
  function bump(key) { set(key, get(key, 0) + 1); }

  /* ---------- ranks ---------- */
  const RANKS = [
    { name: 'Nub', at: 0, msg: 'Everyone starts here. It only gets better.' },
    { name: 'Nooblet', at: 30, msg: 'You are officially not a Nub anymore. The journey begins.' },
    { name: 'Noob', at: 80, msg: 'A full Noob — you already know more than you did yesterday.' },
    { name: 'Standard Noob', at: 150, msg: 'Standard Noob achieved. Dangerously close to competent.' },
    { name: 'DS Player', at: 240, msg: 'A real DS Player now. Teammates may start listening to you.' },
    { name: 'Bronze', at: 360, msg: 'Bronze. Your waves have shape and your gas has timing.' },
    { name: 'Silver', at: 500, msg: 'Silver — you read threats before they read you.' },
    { name: 'Gold', at: 680, msg: 'Gold. You are the one typing the counter in team chat.' },
    { name: 'Platinum', at: 900, msg: 'Platinum — panic switches are a thing of your past.' },
    { name: 'Diamond', at: 1150, msg: 'Diamond. Storm stopped surprising you. It never should have.' },
    { name: 'Pro Guide Reader', at: 1450, msg: 'The final rank. You read the whole guide — now make someone else read it.' }
  ];
  function rankFor(xp) {
    let cur = RANKS[0], next = null;
    for (let i = 0; i < RANKS.length; i++) {
      if (xp >= RANKS[i].at) cur = RANKS[i];
      else { next = RANKS[i]; break; }
    }
    const base = cur.at;
    const span = next ? next.at - base : 1;
    return Object.assign({}, cur, { next: next, pct: next ? Math.min(100, Math.round(((xp - base) / span) * 100)) : 100 });
  }

  /* ---------- toast ---------- */
  let toastTimer = 0;
  function toast(msg, kind) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (kind === 'xp' ? ' xp' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = 'toast'; }, 2600);
  }

  /* ---------- level-up popup (center screen, click to dismiss) ---------- */
  function statLine(label, value) {
    return '<div class="lvl-stat"><b>' + value + '</b><span>' + esc(label) + '</span></div>';
  }
  function showLevelUp(rank) {
    const old = document.querySelector('.lvl-overlay');
    if (old) old.remove();
    const learn = get('learn', {});
    let testsPassed = 0;
    for (const k in learn) testsPassed += Object.keys(learn[k] || {}).length;
    const stepsDone = get('stepsDone', 0);
    const countersRead = get('countersRead', 0);
    const replays = get('replaysWatched', 0);

    const ov = document.createElement('div');
    ov.className = 'lvl-overlay';
    ov.innerHTML =
      '<div class="lvl-card" role="alertdialog" aria-modal="true" aria-label="Rank up">' +
      '<span class="lvl-kicker">Rank up</span>' +
      '<h2 class="lvl-rank">' + esc(rank.name) + '</h2>' +
      '<p class="lvl-msg">' + esc(rank.msg) + '</p>' +
      '<p class="lvl-learned">You have learned:</p>' +
      '<div class="lvl-stats">' +
      statLine('counters read', countersRead) +
      statLine('replays watched', replays) +
      statLine('tests passed', testsPassed) +
      statLine('path steps done', stepsDone) +
      '</div>' +
      (rank.next ? '<p class="lvl-next">Next rank: ' + esc(rank.next.name) + ' at ' + rank.next.at + ' XP</p>' : '') +
      '<button type="button" class="btn hot big lvl-close">Keep going &#9656;</button>' +
      '</div>';
    document.body.appendChild(ov);
    ov.querySelector('.lvl-close').addEventListener('click', function () { ov.remove(); });
    ov.querySelector('.lvl-close').focus();
  }

  /* ---------- XP / streak ---------- */
  function today() { return new Date().toISOString().slice(0, 10); }

  function grantXP(amount, onceKey, label) {
    if (onceKey) {
      const seen = get('xpSeen', {});
      if (seen[onceKey]) return false;
      seen[onceKey] = 1;
      set('xpSeen', seen);
    }
    const before = get('xp', 0);
    const after = before + amount;
    set('xp', after);
    const rBefore = rankFor(before), rAfter = rankFor(after);
    if (rAfter.name !== rBefore.name) {
      showLevelUp(rAfter);
    } else {
      toast('+' + amount + ' XP' + (label ? ' — ' + label : ''), 'xp');
    }
    return true;
  }

  function touchStreak() {
    const t = today();
    const s = get('streak', { last: '', days: 0 });
    if (s.last === t) return s.days;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    s.days = (s.last === y) ? s.days + 1 : 1;
    s.last = t;
    set('streak', s);
    if (s.days > 1) grantXP(10, 'streak_' + t, s.days + ' day streak');
    return s.days;
  }

  window.DG = {
    esc: esc, slug: slug, unitImage: unitImage, costOf: costOf, raceVar: raceVar, reducedMotion: reducedMotion,
    get: get, set: set, bump: bump, RANKS: RANKS, rankFor: rankFor, grantXP: grantXP,
    touchStreak: touchStreak, toast: toast, showLevelUp: showLevelUp
  };
})();
