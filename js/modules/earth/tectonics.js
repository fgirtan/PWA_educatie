/* Modul: Plăcile tectonice — Pangeea și cum se nasc munții */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  /* deplasarea fiecărui continent acum 250 de milioane de ani (Pangeea): [Δlon, Δlat, rotație] — aproximativ */
  const PANG = { namerica: [38, -12, -0.25], greenland: [30, -12, -0.2], samerica: [42, 8, -0.45], europe: [5, -16, 0.05], uk: [12, -14, 0], asia: [-8, -18, 0.1], japan: [-25, -15, 0.1], indo: [-30, -25, 0.3], africa: [0, -8, 0.05], madagascar: [-10, -5, 0], australia: [-78, -4, 0.7], nz: [-90, 0, 0.6], antarctica: [45, 30, 0] };
  defineModule({
    id: 'tectonics', title: 'Plăcile tectonice', sub: 'Continentele se mișcă! Pangeea și cum se nasc munții',
    start: function (api) {
      const ctx = api.ctx; let mode = 'pangea', age = 250, play = true, push = 0, pushT = 0, kind = 'collide';
      const rm = api.row(''), bs = {};
      [['pangea', '🌍 Pangeea'], ['plates', '⛰️ Cum se nasc munții']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const rp = api.row(''), rl = api.row('');
      const as = api.slider(rp, { label: 'Acum câți ani', min: 0, max: 250, step: 1, value: age, fmt: (v) => v < 1 ? 'azi' : v + ' milioane de ani', onInput: (v) => { age = v; play = false; pb.classList.remove('on'); } });
      const pb = api.button(rp, '▶ Mișcă continentele', () => { play = !play; pb.classList.toggle('on', play); if (play && age < 1) age = 250; }); pb.classList.add('on');
      const kb = {};
      [['collide', '🏔️ Plăcile se ciocnesc'], ['subduct', '🌋 Una intră sub alta'], ['apart', '↔️ Plăcile se despart']].forEach(([k, s]) => { kb[k] = api.button(rl, s, () => { kind = k; push = 0; for (const q in kb) kb[q].classList.toggle('on', q === k); api.say(KT[k]); }); });
      kb.collide.classList.add('on');
      const KT = { collide: 'Când două plăci cu continente <b>se ciocnesc</b>, niciuna nu vrea să cedeze: marginile se încrețesc și se ridică, ca o față de masă împinsă. Așa s-au format <b>Himalaya</b> (cu Everestul), Alpii și <b>Carpații</b>!', subduct: 'Când o placă de sub ocean (mai grea) se ciocnește cu una de continent, intră <b>pe dedesubt</b>. Acolo se topește și face <b>vulcani</b>, iar mișcarea ei bruscă produce <b>cutremure</b>.', apart: 'Unde plăcile <b>se depărtează</b>, lava urcă din adânc și umple crăpătura. Așa se naște fundul oceanelor. Oceanul Atlantic se lărgește cu câțiva centimetri pe an, cât cresc unghiile tale!' };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rp.style.display = m === 'pangea' ? '' : 'none'; rl.style.display = m === 'plates' ? '' : 'none'; api.say(m === 'pangea' ? 'Știai că <b>continentele se mișcă</b>? Foarte încet, cam 2–5 cm pe an. Acum 250 de milioane de ani, pe vremea primilor dinozauri, toate erau lipite într-un singur continent uriaș: <b>Pangeea</b>. Uită-te cum se potrivesc America de Sud și Africa, ca un puzzle!' : 'Scoarța Pământului e spartă în bucăți mari, numite <b>plăci tectonice</b>, care plutesc pe roca fierbinte de dedesubt. Unde se întâlnesc, se întâmplă lucruri mari!'); api.layout(); }
      setMode('pangea');
      return {
        frame: function (dt, t) {
          if (mode === 'pangea') {
            if (play) { age = Math.max(0, age - dt * 25); as.set(Math.round(age)); if (age <= 0) { play = false; pb.classList.remove('on'); } }
            ctx.fillStyle = '#0b3d78'; ctx.fillRect(0, 0, api.W, api.H);
            const v = window.Fit(api, 1000, 560); ctx.save(); v.apply(ctx);
            const k = 1000 / 360, P = (lon, lat) => [(lon + 180) * k, (85 - lat) * k];
            ctx.fillStyle = '#1e6ab8'; ctx.fillRect(0, 0, 1000, 170 * k);
            const f = A.ease.inOut(age / 250), W = window.WORLD || {};
            for (const key in W) { const w = W[key], d = PANG[key] || [0, 0, 0]; let cx = 0, cy = 0; w.p.forEach((q) => { cx += q[0]; cy += q[1]; }); cx /= w.p.length; cy /= w.p.length; const r = d[2] * f, c = Math.cos(r), s = Math.sin(r);
              ctx.beginPath(); w.p.forEach((q, i) => { const dx = q[0] - cx, dy = q[1] - cy, sq = key === 'antarctica' ? 1 - 0.78 * f : 1, lon = cx + d[0] * f + (dx * c - dy * s) * sq, lat = cy + d[1] * f + dx * s + dy * c, p = P(lon, lat); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = A.mix(w.c, '#8a7a5a', f * 0.5); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5; ctx.stroke(); }
            A.label(ctx, age < 1 ? '🌍 Azi' : age > 200 ? '🦕 Pangeea, acum ' + Math.round(age) + ' milioane de ani' : '⏳ acum ' + Math.round(age) + ' milioane de ani', 500, 40, { size: 20 });
            if (age > 180) A.text(ctx, 'un singur continent uriaș, înconjurat de un singur ocean', 500, 520, { size: 15, color: '#cfe6ff' });
            ctx.restore();
          } else {
            pushT += dt; push = Math.min(1, push + dt * 0.12);
            A.scene(ctx, api.W, api.H, 'day');
            const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
            const sy = 300;
            /* mantaua (rocă fierbinte) */
            const mg = ctx.createLinearGradient(0, sy + 60, 0, 700); mg.addColorStop(0, '#d8602a'); mg.addColorStop(1, '#8a1a0a'); ctx.fillStyle = mg; ctx.fillRect(-300, sy + 60, 1600, 500);
            for (let i = 0; i < 6; i++) { const cx = 100 + i * 170, r = 60; ctx.strokeStyle = 'rgba(255,200,120,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, sy + 170, r, t * 0.5 + i, t * 0.5 + i + Math.PI * 1.4); ctx.stroke(); }
            if (kind === 'collide') {
              const gap = lerp(80, 0, push), hgt = Math.max(0, push - 0.3) / 0.7 * 170;
              for (const s of [-1, 1]) { const x0 = 500 + s * gap / 2; ctx.fillStyle = '#7a6a4a'; ctx.beginPath(); ctx.moveTo(x0, sy - hgt); for (let i = 0; i <= 10; i++) { const xx = x0 + s * i * 50, yy = sy - hgt * Math.exp(-i * 0.5) + Math.sin(i * 1.7) * 4; ctx.lineTo(xx, yy); } ctx.lineTo(x0 + s * 600, sy); ctx.lineTo(x0 + s * 600, sy + 70); ctx.lineTo(x0, sy + 70 + hgt * 0.4); ctx.fill(); ctx.fillStyle = '#5aa84a'; ctx.beginPath(); for (let i = 0; i <= 10; i++) { const xx = x0 + s * i * 50, yy = sy - hgt * Math.exp(-i * 0.5) + Math.sin(i * 1.7) * 4; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.lineTo(x0 + s * 600, sy); ctx.lineTo(x0 + s * 600, sy + 8); for (let i = 10; i >= 0; i--) { const xx = x0 + s * i * 50, yy = sy - hgt * Math.exp(-i * 0.5) + Math.sin(i * 1.7) * 4 + 10; ctx.lineTo(xx, yy); } ctx.fill(); A.arrow(ctx, x0 + s * 360, sy + 120, x0 + s * 280, sy + 120, { color: '#fff', width: 6 }); }
              if (hgt > 60) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(500 - 40, sy - hgt + 45); ctx.lineTo(500, sy - hgt); ctx.lineTo(500 + 40, sy - hgt + 45); ctx.fill(); }
              A.label(ctx, hgt > 100 ? '🏔️ S-au ridicat munți!' : '➡️ ⬅️ Plăcile se împing', 500, 70, { size: 20 });
            } else if (kind === 'subduct') {
              const off = push * 160;
              ctx.fillStyle = '#2a7ad0'; ctx.fillRect(-300, sy - 30, 820, 30);
              ctx.fillStyle = '#4a4a5a'; ctx.beginPath(); ctx.moveTo(-300, sy); ctx.lineTo(500, sy); ctx.quadraticCurveTo(580, sy + 30, 620 + off * 0.2, sy + 200); ctx.lineTo(560 + off * 0.2, sy + 220); ctx.quadraticCurveTo(520, sy + 70, 480, sy + 50); ctx.lineTo(-300, sy + 50); ctx.fill();
              ctx.fillStyle = '#7a6a4a'; ctx.beginPath(); ctx.moveTo(520, sy - 20); ctx.lineTo(1300, sy - 20); ctx.lineTo(1300, sy + 80); ctx.lineTo(600, sy + 80); ctx.fill(); ctx.fillStyle = '#5aa84a'; ctx.fillRect(520, sy - 28, 780, 10);
              const vh = 40 + push * 120; ctx.fillStyle = '#6a5a4a'; ctx.beginPath(); ctx.moveTo(660, sy - 20); ctx.lineTo(740, sy - 20 - vh); ctx.lineTo(770, sy - 20 - vh); ctx.lineTo(850, sy - 20); ctx.fill();
              if (push > 0.5) { A.glow(ctx, 755, sy - 20 - vh, 50, '#ff7a2a', 0.8); for (let i = 0; i < 6; i++) { const u = ((t * 0.6 + i / 6) % 1); ctx.fillStyle = 'rgba(110,100,100,' + (1 - u) * 0.7 + ')'; ctx.beginPath(); ctx.arc(755 + Math.sin(i) * u * 50, sy - 20 - vh - u * 140, 14 + u * 26, 0, TAU); ctx.fill(); } }
              ctx.strokeStyle = '#ffb040'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(600, sy + 160); ctx.quadraticCurveTo(680, sy + 80, 750, sy - 20 - vh * 0.5); ctx.stroke();
              if (Math.sin(t * 3) > 0.92) { ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(560, sy + 120, 20 + i * 18, 0, TAU); ctx.stroke(); } A.label(ctx, '⚡ cutremur!', 560, sy + 190, { size: 15, color: '#ffe08a' }); }
              A.arrow(ctx, 100, sy + 25, 220, sy + 25, { color: '#fff', width: 6 }); A.text(ctx, 'placa oceanului', 160, sy + 95, { size: 15 }); A.text(ctx, 'placa continentului', 950, sy + 110, { size: 15 });
              A.label(ctx, push > 0.5 ? '🌋 Vulcan!' : '⬇️ Placa grea intră pe dedesubt', 500, 70, { size: 20 });
            } else {
              const gap = push * 260;
              ctx.fillStyle = '#2a7ad0'; ctx.fillRect(500 - gap / 2 - 10, sy - 40, gap + 20, 40);
              for (const s of [-1, 1]) { const x0 = 500 + s * gap / 2; ctx.fillStyle = '#7a6a4a'; ctx.beginPath(); ctx.moveTo(x0, sy); ctx.lineTo(x0 + s * 700, sy); ctx.lineTo(x0 + s * 700, sy + 70); ctx.lineTo(x0, sy + 70); ctx.fill(); ctx.fillStyle = '#5aa84a'; ctx.fillRect(Math.min(x0, x0 + s * 700), sy - 8, 700, 10); A.arrow(ctx, x0 + s * 120, sy + 120, x0 + s * 220, sy + 120, { color: '#fff', width: 6 }); }
              ctx.fillStyle = '#3a3a48'; ctx.fillRect(500 - gap / 2, sy - 2, gap, 72);
              for (let i = 0; i < 8; i++) { const u = ((t * 0.5 + i / 8) % 1); ctx.fillStyle = 'rgba(255,' + (120 + u * 100) + ',40,' + (1 - u) + ')'; ctx.beginPath(); ctx.arc(500 + Math.sin(i * 3) * 10, sy + 200 - u * 210, 10 - u * 4, 0, TAU); ctx.fill(); }
              A.glow(ctx, 500, sy + 10, 40, '#ff7a2a', 0.8);
              A.label(ctx, gap > 120 ? '🌊 S-a născut un ocean nou!' : '⬅️ ➡️ Plăcile se depărtează, lava urcă', 500, 70, { size: 20 });
            }
            A.text(ctx, 'mantaua: rocă fierbinte care curge foarte încet', 500, 560, { size: 15, color: '#ffe0c0' });
            ctx.restore();
          }
        }
      };
    }
  });
})();
