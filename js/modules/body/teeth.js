/* Modul: Dinții — de lapte și definitivi, ce e înăuntru, caria și periajul */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  /* un dinte văzut din față, la (x,y), lățime w; kind: 'inc' | 'can' | 'mol' */
  function tooth(ctx, x, y, w, h, kind, up, col) {
    ctx.save(); ctx.translate(x, y); if (!up) ctx.scale(1, -1);
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, A.shade(col || '#fbf8ee', -0.1)); g.addColorStop(0.4, col || '#ffffff'); g.addColorStop(1, A.shade(col || '#fbf8ee', -0.18));
    ctx.fillStyle = g; ctx.beginPath();
    if (kind === 'can') { ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, h * 0.6); ctx.quadraticCurveTo(0, h * 1.15, w / 2, h * 0.6); ctx.lineTo(w / 2, 0); }
    else if (kind === 'mol') { ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, h * 0.8); ctx.quadraticCurveTo(-w / 4, h * 0.95, 0, h * 0.82); ctx.quadraticCurveTo(w / 4, h * 0.95, w / 2, h * 0.8); ctx.lineTo(w / 2, 0); }
    else { ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, h * 0.9); ctx.quadraticCurveTo(0, h, w / 2, h * 0.9); ctx.lineTo(w / 2, 0); }
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(160,150,130,0.5)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }
  defineModule({
    id: 'teeth', title: 'Dinții', sub: 'De lapte și definitivi, caria și periajul',
    start: function (api) {
      const ctx = api.ctx; let mode = 'mouth', adult = false, sugar = 0, days = 0, brush = null, plaque = [];
      const rm = api.row(''), bs = {};
      [['mouth', '😁 Gura'], ['inside', '🦷 În dinte'], ['caries', '🍬 Caria'], ['brush', '🪥 Periajul']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const r1 = api.row(''), r3 = api.row('');
      const ba = api.button(r1, '👶 Dinți de lapte (20)', () => { adult = false; ba.classList.add('on'); bb.classList.remove('on'); api.say('Copiii mici au <b>20 de dinți de lapte</b>. Pe la <b>6 ani</b> încep să se clatine și să cadă, pentru că dedesubt cresc dinții definitivi, care îi împing afară.'); });
      const bb = api.button(r1, '🧑 Dinți definitivi (32)', () => { adult = true; bb.classList.add('on'); ba.classList.remove('on'); api.say('Adulții au <b>32 de dinți definitivi</b>. Ei trebuie să țină <b>toată viața</b>, așa că trebuie îngrijiți! Ultimii, „măselele de minte”, apar abia pe la 18–25 de ani.'); }); ba.classList.add('on');
      const ds = api.slider(r3, { label: 'Zile fără periaj', min: 0, max: 30, step: 0.1, value: 0, fmt: (v) => Math.round(v) + ' zile', onInput: (v) => { days = v; } });
      api.button(r3, '🍬 Mănâncă dulciuri', () => { sugar = 1; days = Math.min(30, days + 3); ds.set(days); });
      api.button(r3, '🪥 Du-te la dentist', () => { days = 0; ds.set(0); api.say('Dentistul curăță dintele și astupă gaura cu o <b>plombă</b>. Mai bine: periază-te ca să nu ajungi aici! 😊'); });
      const MSG = { mouth: 'Dinții au formă diferită după ce fac: <b>incisivii</b> (în față) taie ca o foarfecă, <b>caninii</b> (colții) rup, iar <b>măselele</b> macină mâncarea, ca o moară.', inside: 'Un dinte e ca o casă cu mai multe straturi. Afară e <b>smalțul</b>, cel mai tare material din corp, mai tare decât osul! Înăuntru e <b>pulpa</b>, cu vase de sânge și un <b>nerv</b>: de aceea doare când ai o carie adâncă.', caries: 'În gură trăiesc <b>bacterii</b>. Când mâncăm dulciuri, ele mănâncă și ele zahărul și scot un <b>acid</b> care roade smalțul, încet-încet. Așa apare o gaură în dinte: <b>caria</b>. Mută glisorul și vezi ce se întâmplă dacă nu te speli pe dinți!', brush: 'Trage <b>periuța</b> cu degetul peste dinți ca să cureți placa (stratul lipicios cu bacterii). Periază-te de <b>2 ori pe zi</b>, câte <b>2 minute</b>!' };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); r1.style.display = m === 'mouth' ? '' : 'none'; r3.style.display = m === 'caries' ? '' : 'none'; api.say(MSG[m]); if (m === 'brush') resetPlaque(); api.layout(); }
      function resetPlaque() { plaque = []; for (let i = 0; i < 70; i++) { const up = i % 2, k = (i * 0.137) % 1, a = Math.PI * (0.12 + 0.76 * k); plaque.push({ x: 500 - Math.cos(a) * 330, y: (up ? 172 : 428) + ((i * 7) % 5 - 2) * 6, a: 1, up: up, r: 9 + (i % 4) * 2 }); } }
      let V = null, bxy = [820, 470], scrub = 0;
      api.pointer({ down: (x, y) => { if (!V) return; brush = V.inv(x, y); }, move: (x, y) => { if (!V || !brush) return; const p = V.inv(x, y); scrub += Math.hypot(p[0] - brush[0], p[1] - brush[1]); brush = p; bxy = p; for (const q of plaque) if (Math.hypot(q.x - p[0], q.y - p[1]) < 55) q.a = Math.max(0, q.a - 0.08); }, up: () => { brush = null; } });
      function arch(cx, cy, rx, ry, up, n, kinds, wscale) {
        for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, a = Math.PI * (0.1 + 0.8 * u), x = cx - Math.cos(a) * rx, y = cy + (up ? -1 : 1) * Math.sin(a) * ry * 0.25; const kd = kinds[Math.min(kinds.length - 1, Math.floor(Math.abs(u - 0.5) * 2 * kinds.length))]; const w = (kd === 'mol' ? 52 : kd === 'can' ? 38 : 36) * wscale; tooth(ctx, x, y, w, kd === 'can' ? 62 : 56, kd, !up ? true : false); }
      }
      function mouth(t, opts) {
        ctx.fillStyle = '#5a1420'; ctx.beginPath(); ctx.ellipse(500, 300, 380, 190, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#e86a7a'; ctx.beginPath(); ctx.ellipse(500, 360, 220, 90, 0, Math.PI, TAU); ctx.fill();
        ctx.fillStyle = '#f08a96'; ctx.fillRect(130, 140, 740, 70); ctx.fillRect(130, 390, 740, 70);
        ctx.fillStyle = '#e57a86'; ctx.beginPath(); ctx.ellipse(500, 120, 400, 60, 0, 0, Math.PI); ctx.fill(); ctx.beginPath(); ctx.ellipse(500, 480, 400, 60, 0, Math.PI, TAU); ctx.fill();
        const n = adult ? 16 : 10, kinds = adult ? ['inc', 'inc', 'can', 'mol', 'mol', 'mol'] : ['inc', 'inc', 'can', 'mol', 'mol'];
        arch(500, 205, 340, 0, true, n, kinds, adult ? 0.82 : 1.2);
        arch(500, 395, 330, 0, false, n, kinds, adult ? 0.82 : 1.2);
        ctx.strokeStyle = '#c84a5a'; ctx.lineWidth = 26; ctx.beginPath(); ctx.ellipse(500, 300, 395, 205, 0, 0, TAU); ctx.stroke();
      }
      setMode('mouth');
      return {
        frame: function (dt, t) {
          A.scene(ctx, api.W, api.H, 'body');
          V = window.Fit(api, 1000, 600); ctx.save(); V.apply(ctx);
          if (mode === 'mouth') {
            mouth(t);
            A.label(ctx, 'Incisivi: taie ✂️', 500, 60, { size: 16, tx: 500, ty: 160 }); A.label(ctx, 'Canini: rup', 200, 60, { size: 16, tx: adult ? 300 : 280, ty: 170 }); A.label(ctx, 'Măsele: macină', 840, 60, { size: 16, tx: 780, ty: 185 });
            A.text(ctx, adult ? '32 de dinți' : '20 de dinți de lapte', 500, 560, { size: 22, color: '#ffe08a' });
          } else if (mode === 'inside') {
            const x = 500, y = 300, s = 1.2;
            ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
            ctx.fillStyle = '#f08a96'; ctx.fillRect(-260, -10, 520, 60); ctx.fillStyle = '#d8cfc0'; ctx.fillRect(-260, 50, 520, 190);
            ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.moveTo(-90, -40); ctx.bezierCurveTo(-110, -200, -40, -190, -20, -170); ctx.quadraticCurveTo(0, -185, 20, -170); ctx.bezierCurveTo(40, -190, 110, -200, 90, -40); ctx.lineTo(70, 150); ctx.quadraticCurveTo(55, 220, 35, 150); ctx.lineTo(10, 60); ctx.lineTo(-10, 60); ctx.lineTo(-35, 150); ctx.quadraticCurveTo(-55, 220, -70, 150); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#f4dca0'; ctx.beginPath(); ctx.moveTo(-70, -40); ctx.bezierCurveTo(-85, -160, -35, -150, -18, -140); ctx.quadraticCurveTo(0, -150, 18, -140); ctx.bezierCurveTo(35, -150, 85, -160, 70, -40); ctx.lineTo(55, 140); ctx.quadraticCurveTo(48, 180, 38, 140); ctx.lineTo(12, 40); ctx.lineTo(-12, 40); ctx.lineTo(-38, 140); ctx.quadraticCurveTo(-48, 180, -55, 140); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ff7a8a'; ctx.beginPath(); ctx.moveTo(-40, -60); ctx.quadraticCurveTo(-40, -120, 0, -110); ctx.quadraticCurveTo(40, -120, 40, -60); ctx.lineTo(40, -20); ctx.lineTo(42, 130); ctx.lineTo(34, 130); ctx.lineTo(20, 0); ctx.lineTo(-20, 0); ctx.lineTo(-34, 130); ctx.lineTo(-42, 130); ctx.lineTo(-40, -20); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#ffe36a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-38, 200); ctx.lineTo(-38, 120); ctx.moveTo(38, 200); ctx.lineTo(38, 120); ctx.moveTo(0, -60); ctx.lineTo(0, 10); ctx.stroke();
            window.NervePulse(ctx, [[0, -60], [0, 0], [-30, 60], [-38, 130], [-38, 220]], t, { n: 2, nerve: 'rgba(255,220,120,0)', r: 7 });
            ctx.restore();
            const L = (s2, lx, ly, tx, ty) => A.label(ctx, s2, lx, ly, { size: 16, tx: x + tx * s, ty: y + ty * s });
            L('Smalțul — cel mai tare din corp', 200, 110, -95, -120); L('Dentina', 190, 260, -70, -60); L('Pulpa, cu nervul', 820, 160, 30, -80); L('Gingia', 830, 300, 200, 10); L('Rădăcina, în os', 820, 440, 55, 140);
          } else if (mode === 'caries') {
            if (sugar > 0) sugar = Math.max(0, sugar - dt * 0.3);
            const k = clamp(days / 30, 0, 1), x = 380, y = 330;
            ctx.save(); ctx.translate(x, y); ctx.scale(1.3, 1.3);
            ctx.fillStyle = '#f08a96'; ctx.fillRect(-150, 40, 300, 60);
            const tcol = A.mix('#fffaf0', '#f0e2b8', k);
            ctx.fillStyle = tcol; ctx.beginPath(); ctx.moveTo(-90, 60); ctx.bezierCurveTo(-110, -120, -40, -110, -20, -90); ctx.quadraticCurveTo(0, -105, 20, -90); ctx.bezierCurveTo(40, -110, 110, -120, 90, 60); ctx.closePath(); ctx.fill();
            /* placa */
            ctx.fillStyle = 'rgba(230,210,140,' + (0.2 + k * 0.6) + ')'; ctx.beginPath(); ctx.ellipse(-40, -70, 40 * (0.3 + k), 18 * (0.3 + k), -0.3, 0, TAU); ctx.fill();
            /* gaura (caria) crește */
            if (k > 0.25) { const hk = (k - 0.25) / 0.75; ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); A.blob(ctx, -30, -75 + hk * 30, 8 + hk * 34, 1, { amp: 0.3, points: 8, sy: 1 + hk * 0.8 }); ctx.fill(); ctx.fillStyle = 'rgba(120,80,40,0.5)'; ctx.beginPath(); A.blob(ctx, -30, -75 + hk * 30, 14 + hk * 40, 2, { amp: 0.3, points: 8, sy: 1 + hk * 0.7 }); ctx.fill(); }
            /* bacteriile */
            const nb = 3 + Math.round(k * 12 + sugar * 6);
            for (let i = 0; i < nb; i++) { const a = i * 2.4 + t * 0.6, bx = -40 + Math.cos(a) * (30 + (i % 4) * 12), by = -80 + Math.sin(a) * 18; ctx.fillStyle = i % 2 ? '#7ac85a' : '#c86ae8'; ctx.beginPath(); ctx.ellipse(bx, by, 8, 5, a, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx + 2, by - 1, 1.6, 0, TAU); ctx.fill(); if (sugar > 0.2 || k > 0.3) { ctx.fillStyle = 'rgba(200,255,90,0.6)'; ctx.beginPath(); ctx.arc(bx + Math.sin(t * 5 + i) * 6, by + 8 + ((t * 20 + i * 5) % 14), 2.2, 0, TAU); ctx.fill(); } }
            if (sugar > 0.05) { ctx.save(); ctx.globalAlpha = sugar; ctx.font = '50px "Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🍬', 70, -120); ctx.restore(); }
            ctx.restore();
            const stage = k < 0.25 ? ['😁 Dinte sănătos', '#7dffb0'] : k < 0.55 ? ['😬 Smalțul începe să se strice', '#ffe08a'] : k < 0.85 ? ['😣 Carie: gaura ajunge în dentină', '#ffb070'] : ['😭 Doare! Caria a ajuns la nerv', '#ff7a8a'];
            A.text(ctx, stage[0], 760, 230, { size: 22, color: stage[1] });
            A.text(ctx, '🦠 bacterii + 🍬 zahăr = acid', 760, 290, { size: 18 }); A.text(ctx, 'acidul roade smalțul', 760, 320, { size: 16, color: 'rgba(255,255,255,0.75)' });
            A.text(ctx, '🪥 Periajul scoate bacteriile', 760, 380, { size: 18, color: '#b0ffcc' });
          } else {
            mouth(t);
            for (const q of plaque) if (q.a > 0.05) { ctx.fillStyle = 'rgba(225,205,120,' + q.a * 0.85 + ')'; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.fill(); if (q.a > 0.5) { ctx.fillStyle = 'rgba(120,200,90,' + q.a + ')'; ctx.beginPath(); ctx.ellipse(q.x + 3, q.y, 4, 2.5, 0, 0, TAU); ctx.fill(); } }
            if (brush) for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(bxy[0] + (Math.random() - 0.5) * 60, bxy[1] + (Math.random() - 0.5) * 30, 4 + Math.random() * 6, 0, TAU); ctx.fill(); }
            /* periuța */
            ctx.save(); ctx.translate(bxy[0], bxy[1]); ctx.rotate(-0.25); ctx.fillStyle = '#3ab0e8'; A.roundRectPath(ctx, 20, -12, 220, 24, 12); ctx.fill(); ctx.fillStyle = '#e8f4ff'; A.roundRectPath(ctx, -50, -14, 75, 28, 6); ctx.fill(); ctx.fillStyle = '#7ad0ff'; for (let i = 0; i < 9; i++) ctx.fillRect(-46 + i * 8, -34, 5, 22); ctx.restore();
            const left = plaque.filter((q) => q.a > 0.3).length;
            A.text(ctx, left ? '👆 Trage periuța peste dinți · placă rămasă: ' + left : '✨ Dinți curați! Bravo!', 500, 560, { size: 20, color: left ? '#fff' : '#7dffb0' });
            if (!left && Math.random() < 0.002) resetPlaque();
          }
          ctx.restore();
        }
      };
    }
  });
})();
