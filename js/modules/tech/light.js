/* Modul: Lumina și culorile — prisma, curcubeul, cerul albastru, amestecul de culori */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const RB = ['#ff2a2a', '#ff8a1a', '#ffe81a', '#3ad84a', '#2a9aff', '#3a3ad8', '#9a3ad8'];
  const RN = ['roșu', 'portocaliu', 'galben', 'verde', 'albastru', 'indigo', 'violet'];
  defineModule({
    id: 'light', title: 'Lumina și culorile', sub: 'Curcubeul, prisma și de ce e cerul albastru',
    start: function (api) {
      const ctx = api.ctx; let mode = 'prism', pa = 0, sun = 0.7, rgb = [[380, 300], [620, 300], [500, 480]], drag = -1, rain = 1;
      const rm = api.row(''), bs = {};
      [['prism', '🔺 Prisma'], ['rainbow', '🌈 Curcubeul'], ['sky', '🌅 Cerul'], ['mix', '🎨 Amestecă lumina']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const rp = api.row(''), rs = api.row('');
      api.slider(rp, { label: 'Rotește prisma', min: -0.4, max: 0.4, step: 0.01, value: 0, fmt: (v) => Math.round(v * 57) + '°', onInput: (v) => { pa = v; } });
      api.slider(rs, { label: 'Ora zilei', min: 0, max: 1, step: 0.01, value: sun, fmt: (v) => v > 0.6 ? 'prânz ☀️' : v > 0.25 ? 'după-amiază' : v > 0.08 ? 'apus 🌇' : 'seara', onInput: (v) => { sun = v; } });
      const MSG = { prism: 'Lumina albă a Soarelui e de fapt un <b>amestec de toate culorile</b>! Când trece printr-o <b>prismă</b> de sticlă, fiecare culoare se frânge puțin altfel și se despart: roșu, portocaliu, galben, verde, albastru, indigo, violet.', rainbow: 'Un <b>curcubeu</b> apare când plouă și soarele e <b>în spatele tău</b>. Fiecare picătură de ploaie e ca o prismă mititică: desparte lumina în culori și o trimite înapoi spre tine.', sky: 'De ce e cerul <b>albastru</b>? Lumina Soarelui lovește bucățelele de aer, iar <b>albastrul</b> e împrăștiat în toate părțile, așa că îl vedem peste tot pe cer. Seara, lumina trece prin mult mai mult aer: albastrul se pierde pe drum și rămân <b>portocaliul și roșul</b> apusului.', mix: 'Pe un ecran (telefon, televizor), toate culorile se fac din doar <b>3 lumini: roșu, verde și albastru</b>. Trage cercurile ca să le amesteci: roșu + verde = galben, toate trei = <b>alb</b>!' };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rp.style.display = m === 'prism' ? '' : 'none'; rs.style.display = m === 'sky' ? '' : 'none'; api.say(MSG[m]); api.layout(); }
      let V = null;
      api.pointer({ down: (x, y) => { if (mode !== 'mix' || !V) return; const p = V.inv(x, y); drag = rgb.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 150); }, move: (x, y) => { if (drag < 0 || !V) return; const p = V.inv(x, y); rgb[drag] = [clamp(p[0], 100, 900), clamp(p[1], 100, 520)]; }, up: () => { drag = -1; } });
      setMode('prism');
      return {
        frame: function (dt, t) {
          if (mode === 'sky') { const g = ctx.createLinearGradient(0, 0, 0, api.H); const k = clamp(sun * 1.6, 0, 1); g.addColorStop(0, A.mix('#1a1a4a', '#3a8ee8', k)); g.addColorStop(1, A.mix(sun > 0.05 ? '#ff6a2a' : '#2a1a3a', '#cfe9ff', k)); ctx.fillStyle = g; ctx.fillRect(0, 0, api.W, api.H); }
          else if (mode === 'rainbow') A.scene(ctx, api.W, api.H, 'day'); else { ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, api.W, api.H); }
          V = window.Fit(api, 1000, 600); ctx.save(); V.apply(ctx);
          if (mode === 'prism') {
            const cx = 480, cy = 320, s = 140;
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(pa);
            const P = [[0, -s], [s * 0.87, s * 0.5], [-s * 0.87, s * 0.5]];
            ctx.restore();
            const rot = (p) => [cx + p[0] * Math.cos(pa) - p[1] * Math.sin(pa), cy + p[0] * Math.sin(pa) + p[1] * Math.cos(pa)];
            const Q = P.map(rot);
            const inP = [lerp(Q[2][0], Q[0][0], 0.5), lerp(Q[2][1], Q[0][1], 0.5)], outBase = [lerp(Q[0][0], Q[1][0], 0.55), lerp(Q[0][1], Q[1][1], 0.55)];
            ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(60, inP[1] - 60 + pa * 80); ctx.lineTo(inP[0], inP[1]); ctx.stroke(); A.glow(ctx, inP[0], inP[1], 30, '#ffffff', 0.6);
            for (let i = 0; i < 7; i++) { const o = [outBase[0] + (i - 3) * 3, outBase[1] + (i - 3) * 6]; ctx.strokeStyle = A.rgba(RB[i], 0.55); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(inP[0], inP[1]); ctx.lineTo(o[0], o[1]); ctx.stroke(); const a = 0.25 + i * 0.07 + pa * 0.8, L = 420; ctx.strokeStyle = RB[i]; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(o[0] + Math.cos(a) * L, o[1] + Math.sin(a) * L); ctx.stroke(); if (i % 2 === 0 || i === 6) A.text(ctx, RN[i], o[0] + Math.cos(a) * (L - 30) + 20, o[1] + Math.sin(a) * (L - 30), { size: 14, color: RB[i] }); }
            const g = ctx.createLinearGradient(Q[2][0], Q[2][1], Q[1][0], Q[0][1]); g.addColorStop(0, 'rgba(200,230,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0.12)'); ctx.fillStyle = g; ctx.strokeStyle = 'rgba(220,240,255,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); Q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); ctx.stroke();
            A.text(ctx, 'lumină albă ☀️', 150, inP[1] - 90 + pa * 80, { size: 16 }); A.text(ctx, 'prisma de sticlă', cx, cy + s * 0.75, { size: 15 });
          } else if (mode === 'rainbow') {
            ctx.fillStyle = 'rgba(80,90,110,0.35)'; ctx.fillRect(0, 0, 1000, 600);
            for (let i = 0; i < 6; i++) A.cloud(ctx, 120 + i * 160, 70 + (i % 2) * 20, 70, 0.95);
            ctx.save(); ctx.globalAlpha = 0.75; for (let i = 0; i < 7; i++) { ctx.strokeStyle = RB[i]; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(560, 560, 380 - i * 16, Math.PI, TAU); ctx.stroke(); } ctx.restore();
            ctx.strokeStyle = 'rgba(200,220,255,0.6)'; ctx.lineWidth = 1.5; for (let i = 0; i < 120; i++) { const x = (i * 83) % 1000, y = ((i * 47 + t * 500) % 520) + 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 16); ctx.stroke(); }
            ctx.fillStyle = '#5aa84a'; ctx.fillRect(0, 540, 1000, 60);
            /* copilul cu spatele la soare */
            const kx = 120, ky = 540; ctx.fillStyle = '#ff6a5a'; A.roundRectPath(ctx, kx - 20, ky - 95, 40, 55, 12); ctx.fill(); ctx.fillStyle = '#f2c09a'; ctx.beginPath(); ctx.arc(kx, ky - 112, 18, 0, TAU); ctx.fill(); ctx.fillStyle = '#5a3a1a'; ctx.beginPath(); ctx.arc(kx - 3, ky - 116, 18, Math.PI * 0.6, Math.PI * 1.9); ctx.fill(); ctx.strokeStyle = '#3a4a6a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(kx - 8, ky - 42); ctx.lineTo(kx - 8, ky); ctx.moveTo(kx + 8, ky - 42); ctx.lineTo(kx + 8, ky); ctx.stroke();
            A.glow(ctx, 20, 180, 120, '#ffe08a', 0.9); ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.arc(20, 180, 40, 0, TAU); ctx.fill();
            A.arrow(ctx, 70, 200, 520, 420, { color: 'rgba(255,240,180,0.8)', width: 4, dash: [10, 8] }); A.arrow(ctx, 520, 420, kx + 20, ky - 112, { color: 'rgba(255,120,120,0.8)', width: 4, dash: [10, 8] });
            /* picătura mărită */
            const dx = 820, dy = 380; ctx.fillStyle = 'rgba(10,15,35,0.7)'; A.roundRectPath(ctx, dx - 130, dy - 120, 260, 230, 16); ctx.fill(); A.text(ctx, 'o picătură, mărită', dx, dy - 100, { size: 14 });
            ctx.fillStyle = 'rgba(150,200,255,0.4)'; ctx.strokeStyle = '#bfe0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(dx, dy, 60, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(dx - 130, dy - 30); ctx.lineTo(dx - 52, dy - 30); ctx.lineTo(dx + 50, dy + 30); ctx.stroke();
            for (let i = 0; i < 7; i += 2) { ctx.strokeStyle = RB[i]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dx + 50, dy + 30); ctx.lineTo(dx - 40, dy + 45 - i * 2); ctx.lineTo(dx - 125, dy + 80 + i * 4); ctx.stroke(); }
            A.text(ctx, 'soarele trebuie să fie în spatele tău!', 330, 580, { size: 15 });
          } else if (mode === 'sky') {
            const sy = lerp(520, 90, sun), sx = lerp(900, 600, sun), k = clamp(sun * 1.6, 0, 1);
            A.glow(ctx, sx, sy, 160, sun > 0.25 ? '#fff4c0' : '#ff8a3a', 0.8); ctx.fillStyle = sun > 0.25 ? '#fff8d0' : A.mix('#ff4a1a', '#ffd04a', sun * 4); ctx.beginPath(); ctx.arc(sx, sy, 40, 0, TAU); ctx.fill();
            ctx.fillStyle = A.mix('#1a2a1a', '#5aa84a', k); ctx.beginPath(); ctx.moveTo(0, 600); for (let x = 0; x <= 1000; x += 50) ctx.lineTo(x, 520 + Math.sin(x * 0.01) * 20); ctx.lineTo(1000, 600); ctx.fill();
            /* atmosfera desenată ca o „pătură” curbă și razele prin ea */
            const ex = 150, ey = 900, er = 520; ctx.strokeStyle = 'rgba(160,200,255,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(ex, ey, er + 230, -Math.PI / 2 - 0.3, -0.2); ctx.stroke(); ctx.setLineDash([]);
            const ox = 150, oy = 520; const path = Math.round(1 / Math.max(0.15, sun));
            for (let i = 0; i < 18; i++) { const u = ((t * 0.4 + i / 18) % 1), x = lerp(sx, ox, u), y = lerp(sy, oy, u); const col = u < 0.5 ? '#ffffff' : (sun > 0.3 ? '#fff8d0' : '#ff8a3a'); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill(); if (i % 3 === 0 && u > 0.1 && u < 0.9) { const bl = (t * 2 + i) % 1; ctx.fillStyle = 'rgba(80,150,255,' + (1 - bl) * (sun > 0.3 ? 0.8 : 0.3) + ')'; ctx.beginPath(); ctx.arc(x + Math.cos(i) * bl * 60, y + Math.sin(i * 3) * bl * 60, 3.5, 0, TAU); ctx.fill(); } }
            ctx.fillStyle = '#ff6a5a'; A.roundRectPath(ctx, ox - 14, oy - 64, 28, 40, 9); ctx.fill(); ctx.fillStyle = '#f2c09a'; ctx.beginPath(); ctx.arc(ox, oy - 76, 13, 0, TAU); ctx.fill();
            A.label(ctx, sun > 0.3 ? 'Ziua: albastrul se împrăștiază peste tot pe cer 💙' : 'Seara: lumina trece prin mult aer, rămâne roșul 🧡', 500, 60, { size: 17 });
            A.text(ctx, '● puncte albastre = lumina albastră împrăștiată', 500, 100, { size: 14, color: sun > 0.3 ? '#0a2a5a' : '#fff', halo: sun <= 0.3 });
          } else {
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            [['#ff0000', 'roșu'], ['#00ff00', 'verde'], ['#0000ff', 'albastru']].forEach(([c], i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(rgb[i][0], rgb[i][1], 150, 0, TAU); ctx.fill(); });
            ctx.restore();
            ['roșu', 'verde', 'albastru'].forEach((n, i) => A.label(ctx, n, rgb[i][0], rgb[i][1] + (i === 2 ? 170 : -170), { size: 16 }));
            A.text(ctx, '👆 Trage cercurile de lumină', 500, 580, { size: 16, color: 'rgba(255,255,255,0.8)' });
            A.text(ctx, '🔴+🟢 = 🟡   🟢+🔵 = cyan   🔴+🔵 = mov   toate = ⚪', 500, 40, { size: 17 });
          }
          ctx.restore();
        }
      };
    }
  });
})();
