/* Modul: Plantele — de la sămânță la fruct, fotosinteza, polenizarea */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const STG = [[0, '🌰 Sămânța', 'Totul începe cu o <b>sămânță</b>. Înăuntru e o plantuță mititică și hrană pentru ea. Are nevoie de <b>apă, căldură și aer</b> ca să încolțească.'], [0.12, '🌱 Încolțirea', 'Sămânța bea apă, se umflă și crapă. Mai întâi iese <b>rădăcina</b>, care crește în jos, apoi <b>tulpina</b>, care crește în sus, spre lumină.'], [0.3, '🌿 Frunzele', 'Apar <b>frunzele</b>. Acum planta își poate face singură hrana din lumina Soarelui!'], [0.55, '🌼 Floarea', 'Planta crește și face o <b>floare</b> colorată și parfumată, ca să cheme albinele.'], [0.72, '🐝 Polenizarea', 'Albina vine după nectar și duce <b>polen</b> de la o floare la alta. Așa floarea poate face semințe.'], [0.85, '🍅 Fructul', 'Floarea se ofilește și din ea crește un <b>fruct</b>, cu <b>semințe</b> înăuntru. Din fiecare sămânță poate crește o plantă nouă!']];
  defineModule({
    id: 'plants', title: 'Plantele', sub: 'De la sămânță la fruct, și cum își fac singure hrana',
    start: function (api) {
      const ctx = api.ctx; let mode = 'grow', g = 0.05, play = true, light = 0.8, water = 0.7, last = -1;
      const rm = api.row(''), bs = {};
      [['grow', '🌱 Cum crește o plantă'], ['photo', '☀️ Fotosinteza']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const rg = api.row(''), rp = api.row('');
      const gs = api.slider(rg, { label: 'Timpul', min: 0, max: 1, step: 0.005, value: g, fmt: (v) => Math.round(v * 120) + ' zile', onInput: (v) => { g = v; play = false; pb.classList.remove('on'); } });
      const pb = api.button(rg, '▶ Crește', () => { play = !play; pb.classList.toggle('on', play); if (play && g >= 1) g = 0; }); pb.classList.add('on');
      api.slider(rp, { label: 'Lumina', min: 0, max: 1, step: 0.01, value: light, fmt: (v) => v < 0.2 ? 'întuneric' : v > 0.7 ? 'mult soare' : 'puțin soare', onInput: (v) => { light = v; } });
      api.slider(rp, { label: 'Apa', min: 0, max: 1, step: 0.01, value: water, fmt: (v) => v < 0.2 ? 'secetă' : v > 0.7 ? 'udată bine' : 'puțină', onInput: (v) => { water = v; } });
      function setMode(m) { mode = m; last = -1; for (const k in bs) bs[k].classList.toggle('on', k === m); rg.style.display = m === 'grow' ? '' : 'none'; rp.style.display = m === 'photo' ? '' : 'none'; if (m === 'photo') api.say('Plantele își fac singure hrana! Frunzele prind <b>lumina Soarelui</b>, iau din aer un gaz numit <b>dioxid de carbon</b>, iar rădăcinile aduc <b>apă</b>. Din ele, frunza face <b>zahăr</b> (hrana plantei) și dă afară <b>oxigen</b>, aerul pe care îl respirăm noi. Asta se numește <b>fotosinteză</b>.'); api.layout(); }
      setMode('grow');
      function plant(cx, gy, k, t, health) {
        const st = clamp((k - 0.1) / 0.6, 0, 1), H = 330 * st, sw = Math.sin(t * 1.2) * 4 * st;
        /* rădăcinile */
        const rk = clamp((k - 0.08) / 0.5, 0, 1); ctx.strokeStyle = '#d8c09a'; ctx.lineCap = 'round';
        for (let i = 0; i < 7; i++) { const a = Math.PI / 2 + (i - 3) * 0.32, L = rk * (60 + (i % 3) * 30); ctx.lineWidth = Math.max(1, 5 - Math.abs(i - 3)); ctx.beginPath(); ctx.moveTo(cx, gy + 4); ctx.quadraticCurveTo(cx + Math.cos(a) * L * 0.5 + (i - 3) * 6, gy + 4 + Math.sin(a) * L * 0.6, cx + Math.cos(a) * L, gy + 4 + Math.sin(a) * L); ctx.stroke(); }
        /* sămânța */
        if (k < 0.3) { ctx.fillStyle = '#a8743e'; ctx.save(); ctx.translate(cx, gy + 14); ctx.rotate(0.3); ctx.beginPath(); ctx.ellipse(0, 0, 16 * (1 - k), 10 * (1 - k), 0, 0, TAU); ctx.fill(); ctx.restore(); }
        if (st <= 0) return null;
        const col = A.mix('#b8a04a', '#4caf50', health);
        ctx.strokeStyle = A.shade(col, -0.15); ctx.lineWidth = 4 + st * 6; ctx.beginPath(); ctx.moveTo(cx, gy); ctx.quadraticCurveTo(cx + sw * 2, gy - H * 0.5, cx + sw * 3, gy - H); ctx.stroke();
        const nl = Math.floor(clamp((k - 0.2) / 0.35, 0, 1) * 8);
        for (let i = 0; i < nl; i++) { const yy = gy - H * (0.2 + i * 0.09), s = i % 2 ? 1 : -1, L = 50 + (i < 4 ? i * 6 : (8 - i) * 6); ctx.save(); ctx.translate(cx + sw * 3 * (0.2 + i * 0.09), yy); ctx.rotate(s * (0.9 - health * 0.3) + sw * 0.01); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * L * 0.5, -L * 0.35, s * L, 0); ctx.quadraticCurveTo(s * L * 0.5, L * 0.3, 0, 0); ctx.fill(); ctx.strokeStyle = A.shade(col, -0.3); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * L * 0.9, 0); ctx.stroke(); ctx.restore(); }
        return [cx + sw * 3, gy - H];
      }
      return {
        frame: function (dt, t) {
          A.scene(ctx, api.W, api.H, 'day');
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          const gy = 400; ctx.fillStyle = '#7a5536'; ctx.fillRect(-300, gy, 1600, 400); ctx.fillStyle = '#5aa84a'; ctx.fillRect(-300, gy - 8, 1600, 12);
          ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 60; i++) { ctx.beginPath(); ctx.arc((i * 97) % 1000, gy + 20 + (i * 53) % 180, 3 + (i % 3), 0, TAU); ctx.fill(); }
          if (mode === 'grow') {
            if (play) { g = Math.min(1, g + dt * 0.035); gs.set(g); if (g >= 1) { play = false; pb.classList.remove('on'); } }
            const si = STG.filter((s) => g >= s[0]).length - 1; if (si !== last) { last = si; api.say('<b>' + STG[si][1] + '.</b> ' + STG[si][2]); }
            A.glow(ctx, 880, 70, 120, '#ffe08a', 0.8); ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.arc(880, 70, 40, 0, TAU); ctx.fill();
            const top = plant(450, gy, g, t, 1);
            if (top && g > 0.55) { const fk = clamp((g - 0.55) / 0.1, 0, 1), wilt = clamp((g - 0.85) / 0.05, 0, 1); ctx.save(); ctx.translate(top[0], top[1]); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * 0.1; ctx.fillStyle = A.rgba('#ffd84a', 1 - wilt); ctx.beginPath(); ctx.ellipse(Math.cos(a) * 26 * fk, Math.sin(a) * 26 * fk, 18 * fk, 9 * fk, a, 0, TAU); ctx.fill(); } ctx.fillStyle = '#8a5a2a'; ctx.beginPath(); ctx.arc(0, 0, 14 * fk, 0, TAU); ctx.fill(); if (g > 0.85) { const r = clamp((g - 0.85) / 0.12, 0, 1); A.sphere(ctx, 0, 14, 10 + r * 30, A.mix('#7ac84a', '#e8394f', r)); if (r > 0.6) { ctx.fillStyle = '#f4e8c0'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(Math.cos(i * 1.3) * 12, 14 + Math.sin(i * 1.3) * 12, 3, 5, i, 0, TAU); ctx.fill(); } } } ctx.restore(); }
            if (g > 0.68 && g < 0.86) { const u = (g - 0.68) / 0.18, bx = lerp(820, top[0] + 30, Math.min(1, u * 1.8)) + Math.sin(t * 6) * 8, by = lerp(200, top[1] - 20, Math.min(1, u * 1.8)) + Math.cos(t * 9) * 6; window.Emoji(ctx, '🐝', bx, by, 40); ctx.fillStyle = '#ffd84a'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(bx - 10 - i * 12, by + 10 + Math.sin(t * 5 + i) * 4, 2.5, 0, TAU); ctx.fill(); } }
            if (g > 0.55) window.CreatureH('flower', ctx, 800, gy, 120, t, { color: '#ff7fb0' });
            const nm = STG.filter((s) => g >= s[0]).pop(); A.label(ctx, nm[1], 450, 520, { size: 22 });
            /* bara cu etape */
            STG.forEach((s, i) => { const x = 100 + i * 160; ctx.fillStyle = g >= s[0] ? '#4caf50' : 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(x, 575, 8, 0, TAU); ctx.fill(); A.text(ctx, s[1].split(' ')[0], x, 552, { size: 20, halo: false }); });
          } else {
            const health = clamp(Math.min(light, water) * 1.3, 0, 1), rate = Math.min(light, water);
            ctx.fillStyle = 'rgba(0,0,30,' + (1 - light) * 0.5 + ')'; ctx.fillRect(-300, -300, 1600, gy + 300);
            A.glow(ctx, 140, 80, 60 + light * 120, '#ffe08a', light); ctx.fillStyle = A.rgba('#ffe36a', 0.3 + light * 0.7); ctx.beginPath(); ctx.arc(140, 80, 40, 0, TAU); ctx.fill();
            const top = plant(500, gy, 0.6, t, health);
            /* razele de lumină */
            for (let i = 0; i < 6; i++) { const u = ((t * 0.5 + i / 6) % 1); A.arrow(ctx, 180 + i * 10, 110 + i * 12, lerp(180, 470, u), lerp(110, 240 + i * 14, u), { color: 'rgba(255,230,120,' + light * (1 - u * 0.4) + ')', width: 3 }); }
            /* apa urcă din rădăcini */
            for (let i = 0; i < 10; i++) { const u = ((t * 0.3 * (0.3 + water) + i / 10) % 1); ctx.fillStyle = 'rgba(80,160,255,' + water + ')'; ctx.beginPath(); ctx.arc(500 + Math.sin(u * 6 + i) * 3, lerp(gy + 90, gy - 200, u), 4, 0, TAU); ctx.fill(); }
            /* CO2 intră, O2 iese */
            for (let i = 0; i < 6; i++) { const u = ((t * 0.25 + i / 6) % 1); A.text(ctx, 'CO₂', lerp(860, 560, u), 200 + i * 20 + Math.sin(t + i) * 6, { size: 14, color: 'rgba(230,230,240,' + (1 - u) + ')', halo: false }); const w2 = ((t * 0.3 * (0.2 + rate) + i / 6) % 1); A.text(ctx, 'O₂', lerp(430, 120, w2), 260 + i * 18 - w2 * 40, { size: 16, color: 'rgba(125,255,176,' + rate * (1 - w2) + ')', halo: false }); }
            /* frunza mărită */
            const lx = 800, ly = 470; ctx.fillStyle = 'rgba(10,15,35,0.75)'; A.roundRectPath(ctx, lx - 160, ly - 70, 320, 140, 14); ctx.fill();
            A.text(ctx, '☀️ lumină + 💧 apă + CO₂', lx, ly - 40, { size: 16 }); A.text(ctx, '⬇️', lx, ly - 10, { size: 18 }); A.text(ctx, '🍬 zahăr (hrană) + 🫧 oxigen', lx, ly + 20, { size: 16, color: '#b0ffcc' });
            A.meter(ctx, lx - 120, ly + 42, 240, 12, rate, '#4ade80');
            A.label(ctx, health > 0.6 ? '😊 Planta e sănătoasă și verde' : health > 0.3 ? '😐 Planta crește încet' : '😢 Planta se ofilește: are nevoie de ' + (light < water ? 'lumină' : 'apă'), 500, 40, { size: 17 });
            A.label(ctx, 'rădăcinile beau apă', 300, 480, { size: 14, tx: 470, ty: 460 });
          }
          ctx.restore();
        }
      };
    }
  });
})();
