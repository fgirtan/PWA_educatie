/* Modul: Oceane și adâncimi */
(function () {
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtN = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 0 : d });
  const mix = (c1, c2, t) => [0, 1, 2].map((i) => Math.round(lerp(c1[i], c2[i], clamp(t, 0, 1))));
  const rgb = (c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  function stars(n) { const a = []; for (let i = 0; i < n; i++) a.push([Math.random(), Math.random(), Math.random() * 1.4 + 0.3]); return a; }
  function drawStars(api, st) { api.ctx.fillStyle = 'rgba(255,255,255,0.65)'; for (const s of st) api.ctx.fillRect(s[0] * api.W, s[1] * api.H, s[2], s[2]); }

  /* ============================================================
     5) OCEANE ȘI ADÂNCIMI
     ============================================================ */
  defineModule({
    id: 'ocean', title: 'Oceane și adâncimi', sub: 'Scufundă-te și vezi cine trăiește acolo',
    start: function (api) {
      const ctx = api.ctx, MAX = 10935;
      let depth = 0, auto = false, W0 = 0;
      const ZONES = [[0, 200, 'Zona luminii', 'Soarele ajunge până aici. Aici trăiește 90% din viața mării: pești, delfini, țestoase, corali.'], [200, 1000, 'Zona de amurg', 'Lumina scade repede. Peștii au ochi mari și mulți strălucesc singuri (bioluminescență).'], [1000, 4000, 'Miezul nopții', 'Întuneric total și frig (2–4°C). Presiunea e de sute de ori mai mare ca la suprafață.'], [4000, 6000, 'Abisul', 'Aproape toată lumea e pustie, dar tot trăiesc aici caracatițe „Dumbo” și castraveți de mare.'], [6000, 11000, 'Hadalul (șanțurile)', 'Cele mai adânci locuri: peste 1.000 de atmosfere. Trăiesc doar creaturi mici, ca peștele-melc și crustaceii.']];
      /* viețuitoare: nume, interval de adâncime, tip desen, fapt */
      const SP = [
        ['Delfin', 0, 250, '🐬', 'Delfinii se scufundă rar sub 300 m. Respiră aer, ca noi!'],
        ['Țestoasă de mare', 0, 1000, '🐢', 'Țestoasa-piele se poate scufunda la peste 1.000 m.'],
        ['Rechin', 0, 1200, '🦈', 'Rechinii sunt pe Pământ de mai mult timp decât copacii.'],
        ['Ton', 0, 500, '🐟', 'Tonul înoată cu până la 70 km/h.'],
        ['Meduză', 0, 900, '🪼', 'Meduzele nu au creier, inimă sau oase — și există de 500 de milioane de ani.'],
        ['Calmar', 300, 1000, '🦑', 'Calmarii uriași au ochi cât farfuria — cei mai mari din lume.'],
        ['Cașalot', 200, 2200, '🐋', 'Cașalotul se scufundă până la 2.000 m ținându-și respirația ~1 oră, ca să vâneze calmari.'],
        ['Pește-viperă', 400, 2500, 'viper', 'Peștele-viperă are colți atât de lungi că nu-i încap în gură!'],
        ['Pește-pescar', 800, 3500, 'angler', 'Femela are o „undiță” luminoasă pe cap, cu care momește prada.'],
        ['Caracatiță Dumbo', 2500, 6000, '🐙', 'Se mișcă bătând din „urechi”, ca elefantul Dumbo.'],
        ['Castravete de mare', 4500, 10000, 'cuke', 'Trăiește pe fundul abisului și mănâncă „ninsoarea marină” căzută de sus.'],
        ['Pește-melc', 6000, 8200, 'snail', 'Cel mai adânc pește: trăiește la peste 8.000 m. Corpul lui e translucid și moale.'],
        ['Amfipod', 7000, 10935, 'amph', 'Crustaceu mic care trăiește în Groapa Marianelor, la ~11 km!']
      ];
      const MARK = [[40, 'Scafandru profesionist'], [300, 'Cel mai adânc loc pentru delfini'], [3800, 'Titanicul'], [8849, 'Everestul ar fi acoperit'], [10935, 'Groapa Marianelor (Challenger Deep)']];
      const crit = [];
      SP.forEach((s, i) => { const n = Math.max(3, Math.round((s[2] - s[1]) / 320)); for (let k = 0; k < Math.min(n, 9); k++) crit.push({ i: i, d: lerp(s[1], s[2], Math.random()), x: Math.random(), dx: (Math.random() < 0.5 ? -1 : 1) * (0.01 + Math.random() * 0.03), ph: Math.random() * 6.3 }); });
      const bubbles = []; for (let i = 0; i < 50; i++) bubbles.push([Math.random(), Math.random(), 1 + Math.random() * 2.5]);
      const snow = []; for (let i = 0; i < 70; i++) snow.push([Math.random(), Math.random(), 0.6 + Math.random() * 1.4]);

      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Adâncime', min: 0, max: 1, step: 0.0005, value: 0, fmt: () => fmtN(depth) + ' m', onInput: (v) => { depth = Math.pow(v, 1.6) * MAX; auto = false; } });
      const bA = api.button(r1, '⬇ Coboară singur', () => { auto = !auto; if (depth >= MAX - 5) depth = 0; bA.innerHTML = auto ? '⏸ Oprește' : '⬇ Coboară singur'; });
      const r2 = api.row('Oceane și mări');
      [['🌊 Pacific', 'Oceanul Pacific: cel mai mare — 165 milioane km², adică mai mult decât toate uscaturile la un loc. Aici e și Groapa Marianelor.'], ['Atlantic', 'Oceanul Atlantic: se lărgește cu ~2,5 cm pe an, pe măsură ce Europa și America se depărtează.'], ['Indian', 'Oceanul Indian: cel mai cald dintre oceane.'], ['Arctic', 'Oceanul Arctic: cel mai mic și mai puțin adânc; mare parte e acoperit de gheață.'], ['Marea Neagră', 'Marea Neagră: adâncă de 2.212 m. Sub ~150 m nu mai e oxigen și aproape nu trăiește nimic — e o „mare moartă” pe 90% din volum. Dar în partea de sus trăiesc delfini și hamsii.']]
        .forEach(([t, f]) => api.button(r2, t, () => api.say('<b>' + t.replace('🌊 ', '') + '.</b> ' + f.replace(/^[^:]*: /, ''), 12000)));
      api.say('Trage în sus și în jos pe ecran sau folosește glisorul ca să te scufunzi. Atinge o viețuitoare ca să afli cine e!', 9000);
      let dragY = null, dragD = 0;
      let pickMoved = 0;
      api.pointer({
        down: (x, y) => { dragY = y; dragD = depth; pickMoved = 0; },
        move: (x, y) => { if (dragY !== null) { pickMoved = Math.abs(y - dragY); depth = clamp(dragD + (dragY - y) / 0.4 * -1 * -1, 0, MAX); auto = false; sl.set(Math.pow(depth / MAX, 1 / 1.6)); } },
        up: (x, y) => {
          if (pickMoved < 8) {
            let best = null, bd = 40;
            for (const c of crit) { const sx = ((c.x * api.W) % api.W), sy = yOf(c.d); const d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = c; } }
            if (best) api.say('<b>' + SP[best.i][0] + '</b> (' + fmtN(SP[best.i][1]) + '–' + fmtN(SP[best.i][2]) + ' m). ' + SP[best.i][4], 9000);
          }
          dragY = null;
        }
      });
      const PX = 0.42;     // pixeli pe metru
      const yOf = (d) => api.cy - api.unit * 0.1 + (d - depth) * PX;
      function waterColor(d) {
        if (d < 200) return mix([46, 168, 220], [18, 96, 160], d / 200);
        if (d < 1000) return mix([18, 96, 160], [2, 12, 40], (d - 200) / 800);
        return mix([2, 12, 40], [0, 0, 6], clamp((d - 1000) / 3000, 0, 1));
      }
      let lastZone = -1;
      function drawCreature(c, x, y, t) {
        const s = SP[c.i], dir = c.dx > 0 ? 1 : -1;
        ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
        const bob = Math.sin(t * 2 + c.ph) * 3; ctx.translate(0, bob);
        const k = s[3];
        if (k === 'angler') { ctx.fillStyle = '#2b2236'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 15, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-34, -8); ctx.lineTo(-34, 8); ctx.fill(); ctx.strokeStyle = '#4a3a58'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12, -12); ctx.quadraticCurveTo(26, -34, 34, -22); ctx.stroke(); const g = ctx.createRadialGradient(34, -22, 0, 34, -22, 16); g.addColorStop(0, 'rgba(150,255,230,1)'); g.addColorStop(1, 'rgba(150,255,230,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(34, -22, 16, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(10, -3, 2.4, 0, 7); ctx.fill(); ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(18, 4); ctx.lineTo(14, 9); ctx.moveTo(14, 5); ctx.lineTo(10, 10); ctx.stroke(); }
        else if (k === 'viper') { ctx.fillStyle = '#16303a'; ctx.beginPath(); ctx.ellipse(0, 0, 26, 7, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(-38, -7); ctx.lineTo(-38, 7); ctx.fill(); ctx.fillStyle = 'rgba(120,255,200,0.9)'; for (let j = 0; j < 7; j++) ctx.fillRect(-18 + j * 5, 4, 2, 2); ctx.strokeStyle = '#eee'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(22, 2); ctx.lineTo(18, 9); ctx.moveTo(25, 2); ctx.lineTo(22, 10); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(19, -2, 1.8, 0, 7); ctx.fill(); }
        else if (k === 'cuke') { ctx.fillStyle = '#c9a07a'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#a07a5a'; for (let j = -3; j <= 3; j++) ctx.fillRect(j * 5, -9, 2, 4); }
        else if (k === 'snail') { ctx.fillStyle = 'rgba(255,220,230,0.75)'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 8, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(-34, -8, -40, 6); ctx.lineTo(-18, 5); ctx.fill(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(13, -2, 1.6, 0, 7); ctx.fill(); }
        else if (k === 'amph') { ctx.strokeStyle = 'rgba(255,180,140,0.95)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 8, 0.5, 4.4); ctx.stroke(); ctx.lineWidth = 1; for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(-5 + j * 3, 7); ctx.lineTo(-7 + j * 3, 13); ctx.stroke(); } }
        else { ctx.scale(dir, 1); ctx.font = (k === '🐋' || k === '🦈' ? 44 : k === '🪼' ? 28 : 32) + 'px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = clamp(1 - Math.max(0, c.d - 1000) / 8000, 0.7, 1); ctx.fillText(k, 0, 0); if (c.d > 600 && (k === '🪼' || k === '🦑')) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 30); g.addColorStop(0, 'rgba(120,200,255,0.35)'); g.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill(); } }
        ctx.restore();
      }
      function frame(dt, t) {
        if (auto) { depth = Math.min(MAX, depth + dt * (depth < 1000 ? 120 : 380)); sl.set(Math.pow(depth / MAX, 1 / 1.6)); if (depth >= MAX) { auto = false; bA.innerHTML = '⬇ Coboară singur'; } }
        const W = api.W, H = api.H;
        /* apa: gradient în funcție de adâncimea de sus și de jos */
        const g = ctx.createLinearGradient(0, 0, 0, H);
        const dTop = depth + (0 - yOf(depth)) / PX, dBot = depth + (H - yOf(depth)) / PX;
        for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, rgb(waterColor(clamp(lerp(dTop, dBot, i / 6), 0, MAX))));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        /* suprafața */
        const sy = yOf(0);
        if (sy > -40) { ctx.fillStyle = '#9fd8f5'; ctx.fillRect(0, 0, W, Math.max(0, sy)); const sk = ctx.createLinearGradient(0, 0, 0, sy); sk.addColorStop(0, '#6fb8e8'); sk.addColorStop(1, '#d6efff'); ctx.fillStyle = sk; ctx.fillRect(0, 0, W, Math.max(0, sy - 2)); ctx.fillStyle = '#e8f6ff'; ctx.beginPath(); ctx.moveTo(0, sy); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, sy + Math.sin(x * 0.05 + t * 2) * 3); ctx.lineTo(W, sy + 12); ctx.lineTo(0, sy + 12); ctx.fill(); }
        /* raze de soare */
        if (depth < 600) { ctx.globalAlpha = 0.14 * (1 - depth / 600); ctx.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(W * (i / 5 + 0.05), Math.max(0, sy)); ctx.lineTo(W * (i / 5 + 0.15), Math.max(0, sy)); ctx.lineTo(W * (i / 5 + 0.0) + 90 - i * 10, H); ctx.lineTo(W * (i / 5 - 0.1) + 40, H); ctx.fill(); } ctx.globalAlpha = 1; }
        /* fundul mării */
        const fy = yOf(MAX + 80); if (fy < H) { ctx.fillStyle = '#17120e'; ctx.fillRect(0, fy, W, H - fy); }
        /* „zăpadă marină” */
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; for (const s of snow) { const yy = (s[1] * H + t * 18 * s[2] + depth * 0.1) % H, xx = (s[0] * W + Math.sin(t + s[1] * 9) * 6); ctx.fillRect(xx, yy, s[2], s[2]); }
        /* creaturi */
        ctx.globalAlpha = 1;
        for (const c of crit) {
          c.x += c.dx * dt; if (c.x > 1.1) c.x = -0.1; if (c.x < -0.1) c.x = 1.1;
          const y = yOf(c.d); if (y < -60 || y > H + 60) continue;
          drawCreature(c, c.x * W, y, t);
        }
        /* bule */
        if (depth < 3000) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; for (const b of bubbles) { const yy = ((b[1] - t * 0.08 * b[2]) % 1 + 1) % 1 * H; ctx.beginPath(); ctx.arc(b[0] * W, yy, b[2], 0, 7); ctx.fill(); } }
        /* submersibilul */
        const sx = api.cx, sY = api.cy - api.unit * 0.1;
        if (depth > 150) { ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createRadialGradient(sx + 40, sY, 0, sx + 40, sY, 150); lg.addColorStop(0, 'rgba(255,245,200,0.55)'); lg.addColorStop(1, 'rgba(255,245,200,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(sx + 22, sY); ctx.lineTo(sx + 170, sY - 70); ctx.lineTo(sx + 170, sY + 70); ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.ellipse(sx, sY, 24, 11, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#7a5a10'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#2a4a6a'; ctx.beginPath(); ctx.arc(sx + 8, sY - 2, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd166'; ctx.fillRect(sx - 4, sY - 18, 8, 8); ctx.fillStyle = '#7a5a10'; ctx.fillRect(sx - 30, sY - 3, 7, 6);
        /* repere de adâncime (în dreapta) */
        ctx.textAlign = 'right'; ctx.font = '600 11px system-ui,sans-serif';
        for (const m of MARK) { const y = yOf(m[0]); if (y > 70 && y < H - 4) { ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(api.freeW - 160, y); ctx.lineTo(api.freeW - 4, y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#fff'; ctx.fillText(m[1] + ' · ' + fmtN(m[0]) + ' m', api.freeW - 6, y - 4); } }
        /* tablou de bord */
        const press = 1 + depth / 10, temp = depth < 100 ? 20 - depth * 0.1 : depth < 1000 ? 10 - (depth - 100) / 900 * 6 : 3 + 1.0 * Math.min(1, (depth - 1000) / 9000) * -1;
        ctx.fillStyle = 'rgba(8,14,34,0.78)'; ctx.fillRect(10, 70, 148, 62); ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = '600 12px system-ui,sans-serif';
        ctx.fillText('Adâncime: ' + fmtN(depth) + ' m', 18, 88); ctx.fillText('Presiune: ' + fmtN(press) + ' atm', 18, 105); ctx.fillText('Temperatură: ~' + fmtN(temp, 0) + '°C', 18, 122);
        const z = ZONES.findIndex((q) => depth >= q[0] && depth < q[1]); const zi = z < 0 ? 4 : z;
        if (zi !== lastZone) { lastZone = zi; api.say('🌊 <b>' + ZONES[zi][2] + '</b> (' + fmtN(ZONES[zi][0]) + '–' + fmtN(ZONES[zi][1]) + ' m). ' + ZONES[zi][3], 9000); }
      }
      return { frame: frame };
    }
  });
})();
