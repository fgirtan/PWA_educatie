/* Modul: Bicicleta — pedalele, lanțul, vitezele */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const FRONT = [34, 50], REAR = [32, 26, 21, 17, 13];
  defineModule({
    id: 'bicycle', title: 'Bicicleta', sub: 'Pedalele, lanțul și vitezele',
    start: function (api) {
      const ctx = api.ctx; let cad = 60, fi = 0, ri = 2, slope = 0, crank = 0, wheel = 0, scroll = 0, lean = 0;
      const r1 = api.row('');
      api.slider(r1, { label: 'Cât de repede pedalezi', min: 0, max: 100, step: 1, value: cad, fmt: (v) => v + ' ture pe minut', onInput: (v) => { cad = v; } });
      api.slider(r1, { label: 'Panta', min: -1, max: 1, step: 0.01, value: slope, fmt: (v) => v < -0.2 ? 'la vale ⬇️' : v > 0.2 ? 'la deal ⬆️' : 'drum drept', onInput: (v) => { slope = v; } });
      const r2 = api.row('Viteze:');
      const fb = [], rb = [];
      FRONT.forEach((n, i) => { fb.push(api.button(r2, 'Față ' + (i + 1), () => { fi = i; upd(); })); });
      REAR.forEach((n, i) => { rb.push(api.button(r2, 'Spate ' + (i + 1), () => { ri = i; upd(); })); });
      function upd() { fb.forEach((b, i) => b.classList.toggle('on', i === fi)); rb.forEach((b, i) => b.classList.toggle('on', i === ri)); }
      upd();
      api.say('Când apeși pe <b>pedale</b>, se învârte <b>foaia</b> (roata dințată mare din față). <b>Lanțul</b> duce mișcarea la <b>pinionul</b> din spate, care învârte roata. Schimbă vitezele: cu o roată dințată <b>mică în spate</b> mergi repede, dar e greu; cu una <b>mare în spate</b> e ușor, perfect la deal!');
      return {
        frame: function (dt, t) {
          const ratio = FRONT[fi] / REAR[ri], wR = 0.34;           // raza roții în metri
          const speed = cad / 60 * ratio * TAU * wR * 3.6;         // km/h
          const effort = clamp(ratio / 3.85 * (cad / 70) * (1 + slope * 1.4), 0, 1.4);
          crank += dt * cad / 60 * TAU; wheel += dt * cad / 60 * TAU * ratio; scroll += dt * speed / 3.6 * 60;
          lean = A.damp(lean, -slope * 0.12, 3, dt);
          A.scene(ctx, api.W, api.H, 'day');
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          for (let i = 0; i < 4; i++) A.cloud(ctx, ((i * 330 - scroll * 0.1) % 1300 + 1300) % 1300 - 150, 60 + (i % 2) * 40, 34);
          for (let i = 0; i < 6; i++) window.Creatures.draw('tree', ctx, ((i * 210 - scroll * 0.4) % 1260 + 1260) % 1260 - 130, 300, 60, t, { seed: i, alpha: 0.6 });
          ctx.save(); ctx.translate(430, 470); ctx.rotate(lean);
          ctx.fillStyle = '#7a7f88'; ctx.fillRect(-900, 60, 1800, 400); ctx.fillStyle = '#5aa84a'; ctx.fillRect(-900, 50, 1800, 12); ctx.fillStyle = '#fff'; for (let i = 0; i < 12; i++) ctx.fillRect(((i * 160 - scroll) % 1920 + 1920) % 1920 - 960, 110, 70, 6);
          const R = 95, rx = -170, fx = 170, wy = -40, bb = [-10, -30];
          const spokes = (cx, a) => { ctx.strokeStyle = '#222'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, wy, R, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#c0c6d2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, wy, R - 7, 0, TAU); ctx.stroke(); ctx.lineWidth = 1.5; for (let i = 0; i < 16; i++) { const q = a + i * TAU / 16; ctx.beginPath(); ctx.moveTo(cx, wy); ctx.lineTo(cx + Math.cos(q) * (R - 8), wy + Math.sin(q) * (R - 8)); ctx.stroke(); } ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(cx, wy, 7, 0, TAU); ctx.fill(); };
          spokes(rx, wheel); spokes(fx, wheel);
          /* foaia și pinionul (mărime după numărul de dinți) */
          const fr = FRONT[fi] * 1.15, rr = REAR[ri] * 1.15;
          const gear = (cx, cy, r, n, a, col) => { ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < n; i++) { const q = a + i * TAU / n; ctx.lineTo(cx + Math.cos(q) * (r + 4), cy + Math.sin(q) * (r + 4)); ctx.lineTo(cx + Math.cos(q + TAU / n / 2) * (r - 1), cy + Math.sin(q + TAU / n / 2) * (r - 1)); } ctx.closePath(); ctx.fill(); ctx.fillStyle = A.shade(col, -0.3); ctx.beginPath(); ctx.arc(cx, cy, r * 0.45, 0, TAU); ctx.fill(); };
          /* lanțul */
          ctx.strokeStyle = '#4a4f5a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bb[0], bb[1] - fr - 2); ctx.lineTo(rx, wy - rr - 2); ctx.moveTo(bb[0], bb[1] + fr + 2); ctx.lineTo(rx, wy + rr + 2); ctx.stroke();
          ctx.fillStyle = '#c0c6d2'; const cl = Math.hypot(bb[0] - rx, bb[1] - wy); for (let i = 0; i < 12; i++) { const u = ((wheel * rr / 40 + i / 12) % 1); ctx.beginPath(); ctx.arc(lerp(rx, bb[0], u), lerp(wy - rr - 2, bb[1] - fr - 2, u), 2.5, 0, TAU); ctx.fill(); }
          gear(rx, wy, rr, REAR[ri], wheel, '#ffb43d'); gear(bb[0], bb[1], fr, FRONT[fi], crank, '#ff6a3a');
          /* cadrul */
          ctx.strokeStyle = '#3a6ad0'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(rx, wy); ctx.lineTo(bb[0], bb[1]); ctx.lineTo(120, -160); ctx.lineTo(-60, -170); ctx.lineTo(rx, wy); ctx.moveTo(-60, -170); ctx.lineTo(bb[0], bb[1]); ctx.moveTo(120, -160); ctx.lineTo(fx, wy); ctx.moveTo(120, -160); ctx.lineTo(110, -205); ctx.stroke();
          ctx.strokeStyle = '#222'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(90, -205); ctx.lineTo(140, -210); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60, -170); ctx.lineTo(-66, -195); ctx.stroke(); ctx.fillStyle = '#222'; A.roundRectPath(ctx, -100, -205, 70, 14, 7); ctx.fill();
          /* manivela și pedalele */
          const pd = 58, p1 = [bb[0] + Math.cos(crank) * pd, bb[1] + Math.sin(crank) * pd], p2 = [bb[0] - Math.cos(crank) * pd, bb[1] - Math.sin(crank) * pd];
          ctx.strokeStyle = '#555'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(p2[0], p2[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); ctx.fillStyle = '#222'; [p1, p2].forEach((p) => ctx.fillRect(p[0] - 14, p[1] - 4, 28, 8));
          /* bicicliștii: picioare care urmăresc pedalele */
          const hip = [-60, -215], leg = (p, col) => { const d = Math.hypot(p[0] - hip[0], p[1] - hip[1]), L = 108, a0 = Math.atan2(p[1] - hip[1], p[0] - hip[0]), k = Math.acos(clamp(d / (2 * L), -1, 1)); const kn = [hip[0] + Math.cos(a0 - k) * L, hip[1] + Math.sin(a0 - k) * L]; ctx.strokeStyle = col; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(kn[0], kn[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); };
          leg(p2, '#2a3a5a'); 
          ctx.strokeStyle = '#ff5a5a'; ctx.lineWidth = 40; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(40, -330); ctx.stroke();
          ctx.strokeStyle = '#f2c09a'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(30, -315); ctx.lineTo(110, -260); ctx.lineTo(118, -210); ctx.stroke();
          ctx.fillStyle = '#f2c09a'; ctx.beginPath(); ctx.arc(70, -375, 32, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(66, -382, 36, Math.PI * 1.05, Math.PI * 2.05); ctx.fill();
          leg(p1, '#3a4a6a');
          ctx.restore();
          /* panoul cu viteze */
          A.panel(ctx, 660, 70, 320, 200, { r: 14 });
          A.text(ctx, 'Foaia: ' + FRONT[fi] + ' dinți · pinionul: ' + REAR[ri] + ' dinți', 805, 98, { size: 15 });
          A.text(ctx, '1 tură de pedală = ' + ratio.toLocaleString('ro-RO', { maximumFractionDigits: 1 }) + ' ture de roată', 805, 128, { size: 16, color: '#ffe08a' });
          A.text(ctx, '🚲 Viteza: ' + Math.round(speed * (1 - slope * 0.3)) + ' km/h', 805, 165, { size: 18, color: '#b0ffcc' });
          A.text(ctx, '💪 Efort', 690, 205, { size: 15, align: 'left' }); A.meter(ctx, 770, 197, 180, 16, effort / 1.4, effort > 1 ? '#ff5a6a' : effort > 0.6 ? '#ffb43d' : '#4ade80');
          A.text(ctx, effort > 1 ? 'prea greu! schimbă viteza 😓' : effort < 0.4 ? 'ușor 😊' : 'potrivit 🙂', 805, 240, { size: 15 });
          ctx.restore();
        }
      };
    }
  });
})();
