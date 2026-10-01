/*
  app.js — shell: tab router, deep-link boot, streak.
  Views: counter (default) / learn / meta. All pre-wired, initialized lazily.
  Rank progress lives in the Academy summary + the level-up popup (engine.js).
*/
(function () {
  'use strict';
  const { get, set, touchStreak, toast } = window.DG;

  const inited = {};
  function initView(name) {
    if (inited[name]) return;
    inited[name] = true;
    if (name === 'learn' && window.DG_LEARN) window.DG_LEARN.init();
    if (name === 'meta' && window.DG_META) window.DG_META.init();
  }

  function show(name, push) {
    ['counter', 'learn', 'meta'].forEach(v => {
      const sec = document.getElementById('view-' + v);
      if (sec) sec.hidden = v !== name;
    });
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
    initView(name);
    set('lastView', name);
    if (push) window.scrollTo({ top: 0 });
    if (name === 'learn' && inited.learn && window.DG_LEARN) window.DG_LEARN.refresh(true);
  }

  document.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => show(t.dataset.view, true)));
  document.querySelector('[data-view-link]')?.addEventListener('click', e => {
    e.preventDefault();
    show('counter', true);
  });

  document.getElementById('share-site')?.addEventListener('click', () => {
    const url = 'https://dgreat.guide/';
    const msg = 'Learning Direct Strike? This site shows you the counter AND plays it out for you: ' + url;
    if (navigator.share) navigator.share({ title: 'dgreat.guide', text: msg, url }).catch(() => {});
    else if (navigator.clipboard?.writeText) navigator.clipboard.writeText(msg).then(() => toast('Copied — paste it anywhere'));
  });

  /* boot */
  const params = new URLSearchParams(location.search);
  touchStreak();
  window.DG_COUNTER.init(params);

  let startView = params.get('view') || '';
  if (!startView && (params.get('threat') || params.get('me'))) startView = 'counter';
  if (!startView) startView = get('lastView', 'counter');
  if (!['counter', 'learn', 'meta'].includes(startView)) startView = 'counter';
  show(startView, false);
})();
