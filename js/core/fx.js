/* Efecte grafice: fundal animat cu stele și meteori pentru ecranul de start */
(function () {
  const cv = document.createElement('canvas');
  cv.id = 'hub-fx';
  cv.setAttribute('aria-hidden', 'true');
  let ctx = cv.getContext('2d'), W = 0, H = 0, stars = [], meteors = [], raf = 0, last = 0;
  function size() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.round(Math.min(220, W * H / 7000));
    stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + 0.3, p: Math.random() * 6.28, s: 0.6 + Math.random() * 1.8, c: Math.random() < 0.18 ? '170,205,255' : Math.random() < 0.1 ? '255,214,170' : '255,255,255' }));
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const home = document.getElementById('home');
    if (!home || home.classList.contains('hidden')) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    ctx.clearRect(0, 0, W, H);
    const t = now / 1000;
    for (const s of stars) { const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.s + s.p)); ctx.fillStyle = 'rgba(' + s.c + ',' + a.toFixed(2) + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); }
    if (Math.random() < dt * 0.35) meteors.push({ x: Math.random() * W * 0.9, y: Math.random() * H * 0.4, vx: 380 + Math.random() * 260, vy: 160 + Math.random() * 120, l: 0 });
    meteors = meteors.filter((m) => m.l < 1.1);
    for (const m of meteors) {
      m.l += dt * 1.1; m.x += m.vx * dt; m.y += m.vy * dt;
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 0.18, m.y - m.vy * 0.18);
      g.addColorStop(0, 'rgba(255,255,255,' + (1 - m.l / 1.1) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 0.18, m.y - m.vy * 0.18); ctx.stroke();
    }
  }
  window.addEventListener('DOMContentLoaded', () => {
    const home = document.getElementById('home'); if (!home) return;
    home.insertBefore(cv, home.firstChild);
    size(); window.addEventListener('resize', size);
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) raf = requestAnimationFrame(frame);
  });
})();
