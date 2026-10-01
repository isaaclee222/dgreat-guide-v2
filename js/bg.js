/*
  bg.js — the DIM synthwave backdrop. v13 lesson applied: the background no
  longer competes with content. One canvas, sparse stars + faint static grid,
  ~12 fps twinkle only. Pauses when hidden; reduced-motion = static frame.
*/
(function () {
  'use strict';
  if (document.getElementById('dg-bg')) return;
  const reduced = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const canvas = document.createElement('canvas');
  canvas.id = 'dg-bg';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-2;pointer-events:none;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }

  let W = 0, H = 0, stars = [], raf = 0, last = 0;
  const FRAME_MS = 1000 / 12;

  function resize() {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    stars = [];
    const n = Math.floor((W * H) / 16000);
    for (let i = 0; i < n; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H * 0.75, r: Math.random() * 1.3 + .3, p: Math.random() * Math.PI * 2 });
    }
    draw(performance.now(), true);
  }

  function grid() {
    ctx.strokeStyle = 'rgba(168,85,247,.07)';
    ctx.lineWidth = 1;
    const horizon = H * 0.78;
    for (let i = 0; i < 10; i++) {
      const y = horizon + Math.pow(i / 10, 1.7) * (H - horizon);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    const cx = W / 2;
    for (let i = -12; i <= 12; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * 26, horizon); ctx.lineTo(cx + i * W * 0.12, H); ctx.stroke();
    }
    const g = ctx.createRadialGradient(cx, horizon, 10, cx, horizon, W * 0.35);
    g.addColorStop(0, 'rgba(255,43,214,.10)');
    g.addColorStop(1, 'rgba(255,43,214,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function draw(t, force) {
    if (!force && t - last < FRAME_MS) { raf = requestAnimationFrame(draw); return; }
    last = t;
    ctx.clearRect(0, 0, W, H);
    grid();
    for (const s of stars) {
      const a = reduced ? .5 : (.3 + .45 * Math.abs(Math.sin(t / 1600 + s.p)));
      ctx.fillStyle = 'rgba(210,190,255,' + a.toFixed(2) + ')';
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    if (!reduced) raf = requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(draw);
  });
  addEventListener('resize', resize);
  resize();
  if (!reduced) raf = requestAnimationFrame(draw);
})();
