/* Modul: Vremea — soare, nori, ploaie, furtună, ninsoare, grindină, tornadă (fără sunet) */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const W = {
    sun: ['☀️ Senin', 'Când cerul e <b>senin</b>, Soarele încălzește pământul, iar aerul cald urcă. Vara poate fi foarte cald, peste 30°C!', 26],
    cloud: ['☁️ Înnorat', 'Norii sunt făcuți din <b>miliarde de picături mititele</b> de apă (sau cristale de gheață), atât de ușoare încât plutesc. Norii albi și pufoși se numesc <b>cumulus</b>.', 18],
    rain: ['🌧️ Ploaie', 'Când picăturile din nor se unesc și se fac prea grele, cad ca <b>ploaie</b>. Norii de ploaie sunt groși și gri, pentru că lumina Soarelui nu mai trece prin ei.', 14],
    storm: ['⛈️ Furtună', 'În norii uriași de furtună, gheața și picăturile se freacă și se încarcă cu <b>electricitate</b>. Când se descarcă, apare <b>fulgerul</b>, mai fierbinte decât suprafața Soarelui! Tunetul e zgomotul făcut de aerul încins de fulger. Fulgerul se vede înaintea tunetului, pentru că lumina e mult mai rapidă decât sunetul.', 20],
    snow: ['❄️ Ninsoare', 'Când e foarte frig sus în nori, apa îngheață în <b>cristale de gheață</b> cu 6 brațe: fulgii de zăpadă. Nu există doi fulgi la fel!', -3],
    hail: ['🧊 Grindină', 'În norii de furtună, vântul aruncă picăturile în sus și în jos de multe ori. De fiecare dată mai îngheață un strat, până se fac <b>bile de gheață</b> care cad: grindina.', 22],
    tornado: ['🌪️ Tornadă', 'O <b>tornadă</b> e o coloană de aer care se învârte foarte repede, coborând dintr-un nor de furtună până la pământ. E rară la noi, dar foarte puternică.', 24],
    fog: ['🌫️ Ceață', '<b>Ceața</b> e un nor care stă chiar pe pământ! Apare mai ales dimineața, când aerul de jos e rece și umed.', 8]
  };
  defineModule({
    id: 'weather', title: 'Vremea', sub: 'De unde vin ploaia, zăpada, fulgerele și tornadele',
    start: function (api) {
      const ctx = api.ctx; let w = 'sun', st = 0, bolt = null, boltT = 0;
      const r = api.row(''), bs = {};
      for (const k in W) bs[k] = api.button(r, W[k][0], () => set(k));
      function set(k) { w = k; st = 0; for (const q in bs) bs[q].classList.toggle('on', q === k); api.say('<b>' + W[k][0] + '.</b> ' + W[k][1]); }
      const P = []; for (let i = 0; i < 260; i++) P.push({ x: Math.random() * 1000, y: Math.random() * 600, s: Math.random() });
      set('sun');
      return {
        frame: function (dt, t) {
          st += dt; boltT -= dt;
          const dark = { sun: 0, cloud: 0.15, rain: 0.45, storm: 0.75, snow: 0.3, hail: 0.6, tornado: 0.7, fog: 0.2 }[w];
          const g = ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, A.mix(w === 'snow' ? '#9aaac0' : '#3f8fe0', '#2a3040', dark)); g.addColorStop(1, A.mix(w === 'snow' ? '#e8eef4' : '#cfe9ff', '#5a6070', dark)); ctx.fillStyle = g; ctx.fillRect(0, 0, api.W, api.H);
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          if (w === 'sun') { A.glow(ctx, 800, 110, 220, '#fff2b0', 0.9); ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.arc(800, 110, 55, 0, TAU); ctx.fill(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * 0.2; ctx.strokeStyle = 'rgba(255,220,100,0.7)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(800 + Math.cos(a) * 70, 110 + Math.sin(a) * 70); ctx.lineTo(800 + Math.cos(a) * 95, 110 + Math.sin(a) * 95); ctx.stroke(); } for (let i = 0; i < 6; i++) { const u = ((t * 0.3 + i / 6) % 1); ctx.strokeStyle = 'rgba(255,200,150,' + 0.4 * (1 - u) + ')'; ctx.lineWidth = 2; ctx.beginPath(); for (let y = 0; y < 60; y += 6) ctx.lineTo(200 + i * 110 + Math.sin(y * 0.2 + t * 4) * 5, 480 - u * 150 - y); ctx.stroke(); } }
          /* sol, casă, copac */
          const gc = w === 'snow' ? '#f4f7fb' : A.mix('#5aa84a', '#2a4a2a', dark * 0.6);
          ctx.fillStyle = gc; ctx.beginPath(); ctx.moveTo(-300, 700); ctx.lineTo(-300, 480); for (let x = -300; x <= 1300; x += 50) ctx.lineTo(x, 480 + Math.sin(x * 0.01) * 10); ctx.lineTo(1300, 700); ctx.fill();
          ctx.fillStyle = '#e9d8b8'; ctx.fillRect(160, 380, 150, 100); ctx.fillStyle = '#b5452f'; ctx.beginPath(); ctx.moveTo(140, 380); ctx.lineTo(235, 310); ctx.lineTo(330, 380); ctx.fill(); if (w === 'snow') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(140, 380); ctx.lineTo(235, 310); ctx.lineTo(330, 380); ctx.lineTo(235, 330); ctx.fill(); }
          ctx.fillStyle = dark > 0.4 ? '#ffd56a' : '#6fb4e8'; ctx.fillRect(180, 400, 40, 34); ctx.fillStyle = '#7a4a2a'; ctx.fillRect(250, 420, 36, 60);
          const sway = w === 'storm' || w === 'tornado' ? Math.sin(t * 3) * 0.08 : w === 'rain' ? Math.sin(t * 2) * 0.03 : 0;
          ctx.save(); ctx.translate(560, 485); ctx.rotate(sway); window.CreatureH(w === 'snow' ? 'conifer' : 'tree', ctx, 0, 0, 170, t, {}); ctx.restore();
          /* norii */
          if (w !== 'sun') {
            const n = w === 'cloud' ? 4 : 7, cc = A.mix('#ffffff', '#4a5060', dark);
            for (let i = 0; i < n; i++) { const x = ((i * 190 + t * (w === 'storm' || w === 'tornado' ? 30 : 12)) % 1300) - 150, y = 70 + (i % 3) * 30, s = w === 'cloud' ? 60 + (i % 2) * 20 : 90; ctx.save(); A.cloud(ctx, x, y, s, 1); ctx.globalCompositeOperation = 'source-atop'; ctx.restore(); ctx.fillStyle = A.rgba(cc, dark > 0.3 ? 0.75 : 0); ctx.beginPath(); ctx.ellipse(x, y + 10, s * 1.3, s * 0.45, 0, 0, TAU); ctx.fill(); }
          }
          /* precipitații */
          if (w === 'rain' || w === 'storm') for (const p of P) { p.y += dt * (500 + p.s * 300); p.x -= dt * (w === 'storm' ? 120 : 30); if (p.y > 600) { p.y = 120; p.x = Math.random() * 1100; } ctx.strokeStyle = 'rgba(180,210,255,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - (w === 'storm' ? 5 : 2), p.y + 14); ctx.stroke(); }
          if (w === 'snow') for (const p of P) { p.y += dt * (30 + p.s * 30); p.x += Math.sin(t + p.s * 20) * dt * 20; if (p.y > 600) { p.y = 100; p.x = Math.random() * 1000; } ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, 2 + p.s * 2.5, 0, TAU); ctx.fill(); }
          if (w === 'hail') for (const p of P.slice(0, 120)) { p.y += dt * (420 + p.s * 200); if (p.y > 480) { p.y = 120; p.x = Math.random() * 1000; } A.sphere(ctx, p.x, p.y, 4 + p.s * 4, '#e6f2ff', { rim: false }); }
          if (w === 'fog') { for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(235,240,245,0.35)'; ctx.beginPath(); ctx.ellipse(((i * 220 + t * 15) % 1400) - 200, 420 + (i % 3) * 30, 320, 70, 0, 0, TAU); ctx.fill(); } ctx.fillStyle = 'rgba(230,235,240,0.45)'; ctx.fillRect(-300, 0, 1600, 700); }
          /* fulgerul */
          if (w === 'storm') { if (boltT < -1.5 - Math.random() * 2) { boltT = 0.35; const x0 = 300 + Math.random() * 500; bolt = [[x0, 110]]; let x = x0, y = 110; while (y < 470) { x += (Math.random() - 0.5) * 70; y += 30 + Math.random() * 30; bolt.push([x, y]); } } if (boltT > 0 && bolt) { ctx.fillStyle = 'rgba(255,255,240,' + boltT * 1.4 + ')'; ctx.fillRect(-300, 0, 1600, 700); ctx.strokeStyle = '#fffbe0'; ctx.lineWidth = 6; ctx.shadowColor = '#cfe0ff'; ctx.shadowBlur = 20; ctx.beginPath(); bolt.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.shadowBlur = 0; } }
          /* tornada */
          if (w === 'tornado') { const tx = 780 + Math.sin(t * 0.4) * 80; { const fg = ctx.createLinearGradient(tx - 130, 0, tx + 130, 0); fg.addColorStop(0, 'rgba(90,90,100,0.15)'); fg.addColorStop(0.5, 'rgba(110,110,120,0.75)'); fg.addColorStop(1, 'rgba(90,90,100,0.15)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(tx - 130, 130); ctx.quadraticCurveTo(tx - 30, 300, tx - 18 + Math.sin(t * 2) * 10, 480); ctx.lineTo(tx + 18 + Math.sin(t * 2) * 10, 480); ctx.quadraticCurveTo(tx + 30, 300, tx + 130, 130); ctx.fill(); } for (let i = 0; i < 26; i++) { const k = i / 26, y = lerp(130, 480, k), r = lerp(130, 20, Math.pow(k, 0.7)); ctx.strokeStyle = 'rgba(70,70,80,' + (0.5 + 0.4 * k) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(tx + Math.sin(t * 2 + k * 4) * 20 * k, y, r, r * 0.22, 0, t * 4 + i, t * 4 + i + Math.PI * 1.3); ctx.stroke(); } for (let i = 0; i < 12; i++) { const a = t * 3 + i; ctx.fillStyle = '#6a5a4a'; ctx.fillRect(tx + Math.cos(a) * (30 + i * 4), 470 - i * 10 + Math.sin(a) * 6, 6, 4); } }
          /* termometrul */
          const temp = W[w][2]; A.panel(ctx, 20, 20, 160, 70, { r: 12 }); A.text(ctx, '🌡️ ' + temp + '°C', 100, 55, { size: 26, color: temp > 20 ? '#ffb070' : temp < 2 ? '#a0d8ff' : '#fff' });
          ctx.restore();
        }
      };
    }
  });
})();
