/* Modul: Cât de mari sunt lucrurile — de la furnică la galaxie */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  /* măsoară o creatură desenată (cât de înaltă e la size = 100) */
  const MEAS = {};
  function measure(name) {
    if (MEAS[name]) return MEAS[name];
    const c = document.createElement('canvas'); c.width = 600; c.height = 600; const x = c.getContext('2d');
    window.Creatures.draw(name, x, 300, 400, 100, 0, {});
    const d = x.getImageData(0, 0, 600, 600).data; let y0 = 600, y1 = 0, x0 = 600, x1 = 0;
    for (let yy = 0; yy < 600; yy += 2) for (let xx = 0; xx < 600; xx += 2) if (d[(yy * 600 + xx) * 4 + 3] > 20) { if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; }
    return (MEAS[name] = { h: Math.max(1, y1 - y0), w: Math.max(1, x1 - x0), base: y1 - 400 });
  }
  const crt = (name) => function (ctx, x, y, hpx, t) { const m = measure(name), s = 100 * hpx / m.h; window.Creatures.draw(name, ctx, x, y - m.base * s / 100, s, t * 0.3, {}); };
  const sphereObj = (col, ring) => function (ctx, x, y, hpx) { const r = hpx / 2; if (ring) { ctx.strokeStyle = 'rgba(230,200,150,0.7)'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.beginPath(); ctx.ellipse(x, y - r, r * 1.9, r * 0.45, -0.2, 0, TAU); ctx.stroke(); } A.sphere(ctx, x, y - r, r, col); };
  const OBJ = [
    { n: 'Furnica', h: 0.005, w: 0.009, f: function (ctx, x, y, h) { const s = h; ctx.fillStyle = '#3a1e10'; [[-0.55, 0.3], [0, 0.22], [0.45, 0.26]].forEach(([d, r]) => { ctx.beginPath(); ctx.ellipse(x + d * s, y - s * 0.45, r * s, r * s * 0.8, 0, 0, TAU); ctx.fill(); }); ctx.strokeStyle = '#3a1e10'; ctx.lineWidth = Math.max(0.5, s * 0.05); for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + i * s * 0.15, y - s * 0.4); ctx.lineTo(x + i * s * 0.35, y); ctx.stroke(); } } },
    { n: 'Șoarecele', h: 0.05, w: 0.1, f: crt('mouse') },
    { n: 'Pisica', h: 0.25, w: 0.45, f: crt('cat') },
    { n: 'Copilul', h: 1.15, w: 0.4, f: function (ctx, x, y, h) { const s = h; ctx.fillStyle = '#3a6ad0'; ctx.fillRect(x - s * 0.08, y - s * 0.45, s * 0.07, s * 0.45); ctx.fillRect(x + s * 0.01, y - s * 0.45, s * 0.07, s * 0.45); ctx.fillStyle = '#ff5a6a'; A.roundRectPath(ctx, x - s * 0.13, y - s * 0.8, s * 0.26, s * 0.38, s * 0.06); ctx.fill(); ctx.fillStyle = '#f2c09a'; ctx.beginPath(); ctx.arc(x, y - s * 0.89, s * 0.11, 0, TAU); ctx.fill(); ctx.fillStyle = '#5a3a1a'; ctx.beginPath(); ctx.arc(x, y - s * 0.92, s * 0.11, Math.PI, TAU); ctx.fill(); ctx.strokeStyle = '#f2c09a'; ctx.lineWidth = s * 0.05; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - s * 0.13, y - s * 0.75); ctx.lineTo(x - s * 0.2, y - s * 0.5); ctx.moveTo(x + s * 0.13, y - s * 0.75); ctx.lineTo(x + s * 0.22, y - s * 0.95); ctx.stroke(); } },
    { n: 'Elefantul', h: 3.2, w: 5, f: crt('elephant') },
    { n: 'Girafa', h: 5.5, w: 3, f: crt('giraffe') },
    { n: 'Casa', h: 9, w: 10, f: function (ctx, x, y, h) { const w = h * 1.1; ctx.fillStyle = '#e9d8b8'; ctx.fillRect(x - w / 2, y - h * 0.6, w, h * 0.6); ctx.fillStyle = '#b5452f'; ctx.beginPath(); ctx.moveTo(x - w * 0.58, y - h * 0.6); ctx.lineTo(x, y - h); ctx.lineTo(x + w * 0.58, y - h * 0.6); ctx.fill(); ctx.fillStyle = '#6fb4e8'; ctx.fillRect(x - w * 0.35, y - h * 0.45, w * 0.2, h * 0.16); ctx.fillRect(x + w * 0.15, y - h * 0.45, w * 0.2, h * 0.16); ctx.fillStyle = '#7a4a2a'; ctx.fillRect(x - w * 0.08, y - h * 0.3, w * 0.16, h * 0.3); } },
    { n: 'Turnul Eiffel', h: 330, w: 125, f: function (ctx, x, y, h) { ctx.strokeStyle = '#8a6a4a'; ctx.fillStyle = '#8a6a4a'; ctx.lineWidth = Math.max(1, h * 0.01); ctx.beginPath(); ctx.moveTo(x - h * 0.19, y); ctx.quadraticCurveTo(x - h * 0.05, y - h * 0.45, x - h * 0.012, y - h * 0.95); ctx.lineTo(x + h * 0.012, y - h * 0.95); ctx.quadraticCurveTo(x + h * 0.05, y - h * 0.45, x + h * 0.19, y); ctx.lineTo(x + h * 0.12, y); ctx.quadraticCurveTo(x, y - h * 0.2, x - h * 0.12, y); ctx.closePath(); ctx.fill(); ctx.fillRect(x - h * 0.1, y - h * 0.3, h * 0.2, h * 0.02); ctx.fillRect(x - h * 0.05, y - h * 0.6, h * 0.1, h * 0.015); ctx.fillRect(x - h * 0.003, y - h, h * 0.006, h * 0.06); } },
    { n: 'Zgârie-norul cel mai înalt', h: 828, w: 120, f: function (ctx, x, y, h) { const g = ctx.createLinearGradient(x - h * 0.06, 0, x + h * 0.06, 0); g.addColorStop(0, '#7a8aa0'); g.addColorStop(0.5, '#dfe7f2'); g.addColorStop(1, '#6a7a90'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - h * 0.07, y); ctx.lineTo(x - h * 0.05, y - h * 0.4); ctx.lineTo(x - h * 0.03, y - h * 0.7); ctx.lineTo(x - h * 0.01, y - h * 0.85); ctx.lineTo(x, y - h); ctx.lineTo(x + h * 0.01, y - h * 0.85); ctx.lineTo(x + h * 0.03, y - h * 0.7); ctx.lineTo(x + h * 0.05, y - h * 0.4); ctx.lineTo(x + h * 0.07, y); ctx.fill(); } },
    { n: 'Muntele Everest', h: 8849, w: 25000, f: function (ctx, x, y, h) { const w = h * 2.6; ctx.fillStyle = '#6a7080'; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w * 0.12, y - h * 0.75); ctx.lineTo(x, y - h); ctx.lineTo(x + w * 0.15, y - h * 0.7); ctx.lineTo(x + w / 2, y); ctx.fill(); ctx.fillStyle = '#f4f7fb'; ctx.beginPath(); ctx.moveTo(x - w * 0.12, y - h * 0.75); ctx.lineTo(x, y - h); ctx.lineTo(x + w * 0.15, y - h * 0.7); ctx.lineTo(x + w * 0.06, y - h * 0.74); ctx.lineTo(x - w * 0.02, y - h * 0.68); ctx.fill(); } },
    { n: 'Luna', h: 3.474e6, w: 3.474e6, f: function (ctx, x, y, h) { window.MoonFace ? window.MoonFace(ctx, x, y - h / 2, h / 2, 180) : A.sphere(ctx, x, y - h / 2, h / 2, '#ccc'); } },
    { n: 'Pământul', h: 1.2742e7, w: 1.2742e7, f: function (ctx, x, y, h, t) { if (window.EarthGlobe) window.EarthGlobe(ctx, x, y - h / 2, h / 2, t * 10, [-0.7, -0.5], 0, {}); else A.sphere(ctx, x, y - h / 2, h / 2, '#2a7ad0'); } },
    { n: 'Jupiter', h: 1.398e8, w: 1.398e8, f: function (ctx, x, y, h) { const r = h / 2, cy = y - r; A.sphere(ctx, x, cy, r, '#c9a27a'); ctx.save(); ctx.beginPath(); ctx.arc(x, cy, r, 0, TAU); ctx.clip(); for (let i = -4; i <= 4; i++) { ctx.fillStyle = i % 2 ? 'rgba(150,100,70,0.35)' : 'rgba(240,220,190,0.3)'; ctx.fillRect(x - r, cy + i * r * 0.2, r * 2, r * 0.1); } ctx.fillStyle = 'rgba(190,80,50,0.7)'; ctx.beginPath(); ctx.ellipse(x + r * 0.3, cy + r * 0.35, r * 0.18, r * 0.1, 0, 0, TAU); ctx.fill(); ctx.restore(); } },
    { n: 'Soarele', h: 1.3927e9, w: 1.3927e9, f: function (ctx, x, y, h) { const r = h / 2; A.glow(ctx, x, y - r, r * 1.8, '#ffb84a', 0.6); const g = ctx.createRadialGradient(x - r * 0.3, y - r * 1.3, r * 0.1, x, y - r, r); g.addColorStop(0, '#fff8d0'); g.addColorStop(1, '#ff9a1f'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - r, r, 0, TAU); ctx.fill(); } },
    { n: 'Steaua Betelgeuse', h: 1.06e12, w: 1.06e12, f: function (ctx, x, y, h) { const r = h / 2; A.glow(ctx, x, y - r, r * 1.6, '#ff6a3a', 0.5); const g = ctx.createRadialGradient(x - r * 0.3, y - r * 1.3, r * 0.1, x, y - r, r); g.addColorStop(0, '#ffd0a0'); g.addColorStop(1, '#d0401a'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - r, r, 0, TAU); ctx.fill(); } },
    { n: 'Sistemul Solar', h: 9e12, w: 9e12, f: function (ctx, x, y, h) { const r = h / 2, cy = y - r; [0.004, 0.008, 0.011, 0.017, 0.058, 0.106, 0.213, 1 / 3 * 1, 0.5].forEach((k, i) => { ctx.strokeStyle = 'rgba(255,255,255,' + (i > 6 ? 0.35 : 0.2) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, cy, Math.max(0.5, k * 2 * r), 0, TAU); ctx.stroke(); }); A.glow(ctx, x, cy, Math.max(3, r * 0.03), '#ffcc55', 0.9); } },
    { n: 'Galaxia noastră (Calea Lactee)', h: 9.46e20, w: 9.46e20, f: function (ctx, x, y, h, t) { const r = h / 2, cy = y - r; A.glow(ctx, x, cy, r * 0.35, '#ffe8c0', 0.8); for (let arm = 0; arm < 4; arm++) for (let i = 0; i < 120; i++) { const u = i / 120, a = arm * TAU / 4 + u * 5 + t * 0.02, d = u * r * 0.95; const px = x + Math.cos(a) * d, py = cy + Math.sin(a) * d * 0.95; ctx.fillStyle = 'rgba(' + (180 + (i % 3) * 25) + ',' + (190 + (i % 5) * 10) + ',255,' + (0.5 - u * 0.3) + ')'; ctx.beginPath(); ctx.arc(px + Math.sin(i * 7) * r * 0.03, py + Math.cos(i * 5) * r * 0.03, Math.max(0.6, r * 0.012 * (1 - u * 0.5)), 0, TAU); ctx.fill(); } } }
  ];
  function fmtLen(m) {
    if (m >= 9e15) return Math.round(m / 9.46e15).toLocaleString('ro-RO') + ' de ani-lumină';
    if (m >= 1e12) return (m / 1e12).toLocaleString('ro-RO', { maximumFractionDigits: 1 }) + ' miliarde de km';
    if (m >= 1e9) return (m / 1e9).toLocaleString('ro-RO', { maximumFractionDigits: 1 }) + ' milioane de km';
    if (m >= 1e6) return Math.round(m / 1e3).toLocaleString('ro-RO') + ' km';
    if (m >= 1000) return (m / 1000).toLocaleString('ro-RO', { maximumFractionDigits: 1 }) + ' km';
    if (m >= 1) return m.toLocaleString('ro-RO', { maximumFractionDigits: 1 }) + ' m';
    if (m >= 0.01) return Math.round(m * 100) + ' cm';
    return Math.round(m * 1000) + ' mm';
  }
  const times = (n) => n >= 1e6 ? (n / 1e6).toLocaleString('ro-RO', { maximumFractionDigits: 0 }) + ' milioane' : n >= 1000 ? Math.round(n).toLocaleString('ro-RO') : n >= 10 ? Math.round(n) : n.toLocaleString('ro-RO', { maximumFractionDigits: 1 });

  defineModule({
    id: 'scale', title: 'Cât de mari sunt lucrurile', sub: 'De la o furnică până la galaxie', ownZoom: true,
    start: function (api) {
      const ctx = api.ctx; let s = 3, target = 3, play = false;
      const N = OBJ.length;
      let x = 0; OBJ.forEach((o, i) => { if (i) x += Math.max(o.w, OBJ[i - 1].w) * 0.35; o.x = x + o.w / 2; x += o.w; });
      const r = api.row('');
      api.button(r, '◀ Mai mic', () => { target = Math.max(0, Math.round(target) - 1); play = false; pb.classList.remove('on'); });
      api.button(r, 'Mai mare ▶', () => { target = Math.min(N - 1, Math.round(target) + 1); play = false; pb.classList.remove('on'); });
      const pb = api.button(r, '🚀 Călătorie automată', () => { play = !play; pb.classList.toggle('on', play); if (play && target >= N - 1) { target = 0; s = 0; } });
      const sl = api.slider(r, { label: 'Mărimea', min: 0, max: N - 1, step: 0.01, value: s, fmt: (v) => OBJ[Math.round(v)].n, onInput: (v) => { target = v; play = false; pb.classList.remove('on'); } });
      api.say('Hai să comparăm mărimile! Începem cu un <b>copil</b> și mergem spre lucruri tot mai mari: munți, Luna, Pământul, Soarele… până la toată <b>galaxia</b>. Apasă <b>Mai mare</b> sau trage cu degetul pe ecran.');
      let drag = null;
      api.pointer({ down: (px) => { drag = { x: px, s: target }; }, move: (px) => { if (drag) { target = clamp(drag.s - (px - drag.x) / 120, 0, N - 1); play = false; } }, up: () => { drag = null; } });
      const lh = (i) => Math.log(OBJ[clamp(i, 0, N - 1)].h);
      return {
        frame: function (dt, t) {
          if (play) { target = Math.min(N - 1, target + dt * 0.35); if (target >= N - 1) { play = false; pb.classList.remove('on'); } }
          s = A.damp(s, target, 4, dt); sl.set(s);
          const W = api.freeW, U = api.unit, H = api.H;
          const i = Math.floor(s), f = s - i, lgH = lerp(lh(i), lh(i + 1), f);
          const viewH = Math.exp(lgH) / 0.5;                      // metri pe înălțimea zonei de desen
          const ppm = (U * 1.6) / viewH;                          // pixeli pe metru
          const camX = Math.exp(lerp(Math.log(OBJ[i].x), Math.log(OBJ[Math.min(N - 1, i + 1)].x), f));
          const space = clamp((s - 9) / 1.2, 0, 1);
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, A.mix('#5aa0e6', '#03050e', space)); g.addColorStop(1, A.mix('#d6ecfb', '#0b1026', space)); ctx.fillStyle = g; ctx.fillRect(0, 0, api.W, H);
          if (space > 0.2) A.stars(ctx, api.W, H, t, { alpha: space });
          const gy = api.cy + U * 0.6;
          if (space < 1) { ctx.fillStyle = A.rgba('#5aa84a', 1 - space); ctx.fillRect(0, gy, api.W, H - gy); }
          else { ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(api.W, gy); ctx.stroke(); }
          const cxs = W / 2;
          for (let k = 0; k < N; k++) {
            const o = OBJ[k], hp = o.h * ppm, xp = cxs + (o.x - camX) * ppm;
            if (hp < 0.6 || xp + o.w * ppm < -50 || xp - o.w * ppm > api.W + 50 || hp > H * 40) continue;
            ctx.save(); o.f(ctx, xp, gy, hp, t); ctx.restore();
            if (hp > 14 && hp < H * 3) A.label(ctx, o.n, xp, Math.max(gy - Math.min(hp, H) - 18, 100), { size: A.labelSize(U) * (k === Math.round(s) ? 1 : 0.8), color: k === Math.round(s) ? '#ffe08a' : '#fff' });
          }
          const cur = OBJ[Math.round(s)], prev = OBJ[Math.round(s) - 1];
          const bw = Math.min(W - 30, 520), bx = (W - bw) / 2, by = gy + 14;
          A.panel(ctx, bx, by, bw, 62, { r: 12 });
          A.text(ctx, cur.n + ': ' + fmtLen(cur.h), W / 2, by + 20, { size: A.fs(U, 0.05, 14), color: '#ffe08a' });
          if (prev) A.text(ctx, 'E de ' + times(cur.h / prev.h) + ' ori mai mare decât ' + prev.n.toLowerCase(), W / 2, by + 44, { size: A.fs(U, 0.036, 11), color: '#fff' });
        }
      };
    }
  });
})();
