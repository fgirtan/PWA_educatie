/* Modul: Formarea reliefului — secțiune geologică ilustrată (straturi de rocă, munți cu zăpadă, ocean, vulcani) */
(function () {
  const A = window.Art;
  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtN = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 0 : d });
  const N1 = A.noise1, N2 = A.noise2;

  /* straturi sedimentare: gresie, șist, calcar, gresie roșie, marnă, bazalt */
  const STRATA = ['#c9a878', '#8e8274', '#d8cdb2', '#a8664a', '#b4a088', '#6e6660', '#5a4c44'];
  /* textură de rocă (granule, crăpături fine) — o singură dată */
  function rockTex() {
    return A.cached('rf-rock', 128, 128, (c, w, h) => {
      const d = c.createImageData(w, h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const o = (j * w + i) * 4, n = N2(i * 0.18, j * 0.18) * 0.5 + N2(i * 0.6 + 7, j * 0.6) * 0.35 + (((i * 73856093) ^ (j * 19349663)) & 255) / 255 * 0.3;
        const v = n > 0 ? 255 : 0; d.data[o] = d.data[o + 1] = d.data[o + 2] = v; d.data[o + 3] = Math.round(Math.min(1, Math.abs(n)) * 70);
      }
      c.putImageData(d, 0, 0);
    });
  }
  /* manta: rocă fierbinte, cu dungi de curgere */
  function mantleTex() {
    return A.cached('rf-mantle', 256, 128, (c, w, h) => {
      const d = c.createImageData(w, h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const o = (j * w + i) * 4, u = i / w * TAU;
        const n = N2(Math.cos(u) * 2 + 5, Math.sin(u) * 2 + j * 0.03) * 0.6 + N2(Math.cos(u) * 5, Math.sin(u) * 5 + j * 0.08) * 0.3;
        const f = j / h, k = 0.85 + n * 0.35;
        d.data[o] = clamp((200 + 50 * f) * k, 0, 255); d.data[o + 1] = clamp((70 + 40 * f) * k, 0, 255); d.data[o + 2] = clamp((28 + 10 * f) * k, 0, 255); d.data[o + 3] = 255;
      }
      c.putImageData(d, 0, 0);
    });
  }

  /* ============================================================
     2) FORMAREA REFLIEFULUI (secțiune transversală prin scoarță)
     ============================================================ */
  defineModule({
    id: 'relief', title: 'Formarea reliefului', sub: 'Plăcile tectonice construiesc munți, văi și oceane',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'collision', T = 0, playing = false, comp = 0, compPick = -1;
      const INFO = {
        collision: '<b>Ciocnire de plăci → munți.</b> Două plăci continentale se împing una într-alta și scoarța se încrețește în sus. Așa s-a născut Himalaya acum ~50 de milioane de ani, când India a lovit Asia. Everestul (8.849 m) încă crește ~4 mm pe an.',
        rift: '<b>Plăcile se depărtează → rift și ocean.</b> Scoarța se întinde și se rupe: apare o vale, apoi magma iese la suprafață. Așa se naște un ocean nou — Marea Roșie se deschide chiar acum.',
        subduction: '<b>O placă intră sub alta → vulcani.</b> Placa oceanică, mai grea, se scufundă în manta și formează un șanț adânc. Ea se topește, iar magma urcă și face un lanț de vulcani (Anzii, „Inelul de Foc”).',
        erosion: '<b>Eroziunea → munți tociți.</b> Ploaia, gheața și râurile macină munții încet. Munții Apalași (SUA) au fost cândva la fel de înalți ca Himalaya. Munții noștri Carpați au și ei zeci de milioane de ani.',
        heights: '<b>Cât de înalt?</b> Atinge un munte să-l compari. Everestul e cel mai înalt deasupra mării, dar măsurat de la bază cel mai înalt pe Pământ e Mauna Kea. Pe Marte, Olympus Mons le bate pe toate!'
      };
      const bs = {};
      const modes = [['collision', '🏔️ Ciocnire'], ['rift', '🌊 Rift'], ['subduction', '🌋 Subducție'], ['erosion', '🌧️ Eroziune'], ['heights', '📏 Înălțimi']];
      const rm = api.row('Procese');
      modes.forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rt = api.row('');
      const sl = api.slider(rt, { label: 'Timp', min: 0, max: 60, step: 0.1, value: 0, fmt: (v) => fmtN(v, 0) + ' mil. ani', onInput: (v) => { T = v; playing = false; bP.innerHTML = '▶'; } });
      const bP = api.button(rt, '▶ Pornește', () => { if (T >= 60) T = 0; playing = !playing; bP.innerHTML = playing ? '⏸' : '▶ Pornește'; });
      function setMode(k) { mode = k; T = 0; sl.set(0); playing = k !== 'heights'; bP.innerHTML = playing ? '⏸' : '▶ Pornește'; rt.style.display = k === 'heights' ? 'none' : ''; for (const j in bs) bs[j].classList.toggle('on', j === k); api.say(INFO[k]); api.layout(); }
      const PEAKS = [['Turnul Burj Khalifa', 0.828, '#9fb0c8', 'Cea mai înaltă clădire: 828 m.'], ['Vf. Moldoveanu', 2.544, '#7ea36b', 'Cel mai înalt vârf din România: 2.544 m.'], ['Mont Blanc', 4.806, '#a9c4de', 'Cel mai înalt vârf din Alpi: 4.806 m.'], ['Everest', 8.849, '#e8eef7', 'Cel mai înalt munte deasupra nivelului mării: 8.849 m. Avionul de pasageri zboară mai sus!'], ['Mauna Kea (de la bază)', 10.2, '#6c8a5a', 'Vulcan din Hawaii: doar 4.207 m deasupra mării, dar 10.200 m de la baza lui de pe fundul oceanului.'], ['Olympus Mons (Marte)', 21.9, '#c9694a', 'Vulcanul de pe Marte: 21,9 km — aproape de 2,5 ori Everestul!']];
      api.pointer({ down: (x, y) => { if (mode !== 'heights') return; const L = peakLayout(); let best = -1; L.forEach((p, i) => { if (Math.abs(x - p.x) < p.w / 2 && y > p.y - 10) best = i; }); if (best >= 0) { compPick = best; api.say('<b>' + PEAKS[best][0] + '.</b> ' + PEAKS[best][3]); } } });
      function peakLayout() {
        const W = api.freeW, base = api.cy + api.unit * 0.88, maxH = api.unit * 1.7, n = PEAKS.length, w = Math.min(90, (W - 20) / n);
        return PEAKS.map((p, i) => ({ x: W * (i + 0.5) / n, w: w, y: base - p[1] / 21.9 * maxH, base: base }));
      }
      /* relieful: înălțimea suprafeței (km, +sus) la poziția u ∈[0,1] */
      function surf(u, t) {
        const g = (c, w) => Math.exp(-Math.pow((u - c) / w, 2));
        const k = t / 60;
        if (mode === 'collision') return 0.2 + 8.8 * Math.pow(k, 0.8) * g(0.5, 0.11 + 0.05 * k) + 1.4 * k * g(0.5, 0.3) - 0.3 * g(0.36, 0.05) * k;
        if (mode === 'rift') { const w = 0.03 + 0.1 * k; return 0.3 - 1.2 * k * g(0.5, w * 1.2) + 0.5 * k * (g(0.5 - w * 1.6, 0.04) + g(0.5 + w * 1.6, 0.04)); }
        if (mode === 'subduction') return 0.3 - 3.2 * Math.min(1, k * 1.6) * g(0.42, 0.035) + (0.1 + 4.5 * k) * g(0.7, 0.07) + (0.3 + 1.5 * k) * g(0.6, 0.08) * 0.5 - 0.5 * (u < 0.42 ? 1 : 0) * (0.6);
        return 0.2 + 8.8 * Math.exp(-t / 22) * g(0.5, 0.12 + 0.12 * (t / 60)) + 0.3 * Math.exp(-t / 30);
      }
      /* relief vizual: suprafața + mici denivelări naturale (nu schimbă cifrele afișate) */
      const surfV = (u, t) => surf(u, t) + 0.12 * N1(u * 38 + 3) * Math.min(1, Math.max(0, surf(u, t)) * 0.5 + 0.2);

      function sky(W, H) {
        return A.cached('rf-sky', W, H, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6f9fcf'); g.addColorStop(0.5, '#b8d4ea'); g.addColorStop(1, '#e4eef4'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
      }
      function frame(dt, t) {
        if (playing && mode !== 'heights') { T = Math.min(60, T + dt * 4.5); sl.set(T); if (T >= 60) { playing = false; bP.innerHTML = '↺'; } }
        const W = api.W, H = api.H, U = api.unit;
        ctx.drawImage(sky(W, H), 0, 0);
        if (mode === 'heights') return drawHeights(t);
        const x0 = 8, x1 = api.freeW - 8, cw = x1 - x0, base = api.cy + api.unit * 0.25, km = api.unit * 1.5 / 22 * 2.2;
        const N = 120;
        const oceanLeft = mode === 'subduction', riftSea = mode === 'rift' && T > 14;
        const fsz = A.fs(U, 0.042, 13);
        /* nori de fundal, statici și discreți */
        if (mode !== 'erosion') { A.cloud(ctx, x0 + cw * 0.18, base - U * 1.05, U * 0.12, 0.55); A.cloud(ctx, x0 + cw * 0.82, base - U * 1.2, U * 0.09, 0.45); }

        /* mantaua: rocă topită parțial, care curge încet */
        const mt = mantleTex(), mTop = base + 30;
        ctx.save(); ctx.beginPath(); ctx.rect(x0, mTop, cw, H - mTop); ctx.clip();
        const mo = (t * 6) % (U * 3);
        for (let x = -mo; x < W; x += U * 3 - 1) ctx.drawImage(mt, x, mTop, U * 3 + 1, H - mTop);
        const mg = ctx.createLinearGradient(0, mTop, 0, H); mg.addColorStop(0, 'rgba(60,20,10,0.35)'); mg.addColorStop(0.3, 'rgba(0,0,0,0)'); ctx.fillStyle = mg; ctx.fillRect(0, mTop, W, H - mTop);
        ctx.restore();

        /* scoarța: straturi sedimentare care se cutează odată cu suprafața */
        const thick = (u) => 0.9 + (mode === 'collision' ? Math.max(0, surf(u, T) - 0.3) * 1.5 : mode === 'erosion' ? Math.max(0, surf(u, T) - 0.3) * 2.2 : 0);
        const top = [], bot = [];
        for (let i = 0; i <= N; i++) { const u = i / N; top.push([x0 + u * cw, base - surfV(u, T) * km]); bot.push([x0 + u * cw, base + 40 + thick(u) * km]); }
        const crustPath = () => { ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]); for (let i = 1; i <= N; i++) ctx.lineTo(top[i][0], top[i][1]); for (let i = N; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]); ctx.closePath(); };
        ctx.save(); crustPath(); ctx.clip();
        const B = STRATA.length;
        const by = (b, i) => { const f = b / B; return lerp(top[i][1], bot[i][1], f) + (b > 0 && b < B ? Math.sin(i * 0.31 + b * 1.7) * 1.2 : 0); };
        for (let b = 0; b < B; b++) {
          ctx.beginPath(); ctx.moveTo(x0, by(b, 0) - (b === 0 ? 4 : 0));
          for (let i = 1; i <= N; i++) ctx.lineTo(top[i][0], by(b, i) - (b === 0 ? 4 : 0));
          for (let i = N; i >= 0; i--) ctx.lineTo(top[i][0], by(b + 1, i) + 0.5);
          ctx.closePath(); ctx.fillStyle = STRATA[b]; ctx.fill();
          ctx.strokeStyle = 'rgba(40,28,20,0.25)'; ctx.lineWidth = 1; ctx.stroke();
        }
        /* granulele rocii se mișcă odată cu plăcile */
        const pat = ctx.createPattern(rockTex(), 'repeat'), sp = U * 0.004;
        const halves = mode === 'collision' ? [[x0, x0 + cw / 2, 1], [x0 + cw / 2, x1, -1]] : mode === 'rift' ? [[x0, x0 + cw / 2, -1], [x0 + cw / 2, x1, 1]] : mode === 'subduction' ? [[x0, x0 + cw * 0.42, 1], [x0 + cw * 0.42, x1, 0]] : [[x0, x1, 0]];
        for (const [a, b, dir] of halves) { ctx.save(); ctx.beginPath(); ctx.rect(a, 0, b - a, H); ctx.clip(); ctx.translate(dir * T * sp * 10, 0); ctx.fillStyle = pat; ctx.globalAlpha = 0.8; ctx.fillRect(-U * 3, 0, W + U * 6, H); ctx.restore(); }
        /* lumină din stânga pe versanți + vegetație, rocă, zăpadă */
        const sd = Math.max(5, U * 0.035);
        for (let i = 0; i < N; i++) {
          const ax = top[i][0], ay = top[i][1], bx = top[i + 1][0], byy = top[i + 1][1], h = (surf((i + 0.5) / N, T));
          const slope = (byy - ay) / (bx - ax), lit = clamp(0.5 + slope * 1.4, 0, 1);
          let col;
          if (h > 4.6 + 0.3 * N1(i * 0.4)) col = A.mix('#f6f9fc', '#b9c8da', lit);
          else if (h > 2.6) col = A.mix('#9a8a7a', '#5e5248', lit);
          else col = A.mix(A.mix('#7fae5a', '#8a7a62', clamp(Math.abs(slope) * 1.2, 0, 1)), A.mix('#3f6a34', '#4e4438', clamp(Math.abs(slope) * 1.2, 0, 1)), lit);
          const dd = h > 4.6 ? sd * 1.4 : sd;
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(ax, ay - 0.5); ctx.lineTo(bx + 0.6, byy - 0.5); ctx.lineTo(bx + 0.6, byy + dd); ctx.lineTo(ax, ay + dd); ctx.closePath(); ctx.fill();
        }
        /* umbra versanților din dreapta (lumina vine din stânga) */
        const sh = ctx.createLinearGradient(x0, 0, x1, 0); sh.addColorStop(0, 'rgba(255,240,210,0.06)'); sh.addColorStop(1, 'rgba(20,10,30,0.12)'); ctx.fillStyle = sh; ctx.fillRect(x0, 0, cw, H);
        ctx.restore();
        ctx.strokeStyle = 'rgba(40,30,24,0.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]); for (let i = 1; i <= N; i++) ctx.lineTo(top[i][0], top[i][1]); ctx.stroke();
        ctx.strokeStyle = 'rgba(70,20,10,0.6)'; ctx.beginPath(); ctx.moveTo(bot[0][0], bot[0][1]); for (let i = 1; i <= N; i++) ctx.lineTo(bot[i][0], bot[i][1]); ctx.stroke();

        /* subducție: placa oceanică (bazalt) coboară în manta */
        if (mode === 'subduction') {
          const sx0 = x0 + cw * 0.42, sy0 = base + 50, cxq = x0 + cw * 0.6, cyq = base + 90, ex = x0 + cw * 0.78, ey = base + 190, sw = Math.max(14, U * 0.09);
          ctx.save(); ctx.lineCap = 'butt';
          ctx.beginPath(); ctx.moveTo(sx0 - cw * 0.3, base + 44); ctx.lineTo(sx0, sy0); ctx.quadraticCurveTo(cxq, cyq, ex, ey);
          ctx.strokeStyle = '#2e3238'; ctx.lineWidth = sw + 4; ctx.stroke();
          ctx.strokeStyle = '#4a5058'; ctx.lineWidth = sw; ctx.stroke();
          ctx.strokeStyle = '#6a7078'; ctx.lineWidth = sw * 0.3; ctx.stroke();
          ctx.setLineDash([sw * 0.5, sw * 0.9]); ctx.lineDashOffset = -T * sw * 0.08; ctx.strokeStyle = 'rgba(20,24,30,0.6)'; ctx.lineWidth = sw * 0.75; ctx.stroke(); ctx.setLineDash([]);
          ctx.restore();
          /* magma care urcă din placa topită spre vulcani */
          const k = T / 60;
          if (k > 0.15) for (let i = 0; i < 5; i++) {
            const a = ((t * 0.12 + i / 5) % 1), vx0 = x0 + cw * (0.66 + (i % 3) * 0.035), vy0 = base + 140, vy1 = base - surf(0.62 + (i % 3) * 0.07, T) * km + 10;
            const yy = lerp(vy0, vy1, a), xx = lerp(vx0, x0 + cw * (0.62 + (i % 3) * 0.07), a);
            ctx.fillStyle = A.rgba('#ff7a2f', 0.85 * (1 - a * 0.3)); A.blob(ctx, xx, yy, U * 0.018 * (1 - a * 0.4), t, { amp: 0.2, seed: i }); ctx.fill();
          }
        }
        if (mode === 'rift' && T > 8) {
          const a = Math.min(1, (T - 8) / 15), w = 6 + T * 0.3, sy = base - surf(0.5, T) * km + 8, xm = x0 + cw * 0.5;
          const g = ctx.createLinearGradient(0, base + 44, 0, sy); g.addColorStop(0, A.rgba('#d8401a', a)); g.addColorStop(1, A.rgba('#ffb040', a));
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(xm - w * 0.5, base + 44); ctx.quadraticCurveTo(xm - w * 0.25, (sy + base) / 2, xm - w * 0.12, sy); ctx.lineTo(xm + w * 0.12, sy); ctx.quadraticCurveTo(xm + w * 0.25, (sy + base) / 2, xm + w * 0.5, base + 44); ctx.closePath(); ctx.fill();
        }
        /* apa, cu valuri line */
        if (oceanLeft || riftSea) {
          const sea = base - 6, xe = oceanLeft ? x0 + cw * 0.5 : x1;
          ctx.save();
          ctx.beginPath(); ctx.moveTo(x0, sea);
          for (let x = x0; x <= xe; x += 6) ctx.lineTo(x, sea + Math.sin(x * 0.06 + t * 1.4) * 1.6 + Math.sin(x * 0.023 - t) * 1.2);
          for (let i = N; i >= 0; i--) { const px = top[i][0]; if (px <= xe) ctx.lineTo(px, Math.max(sea, top[i][1])); }
          ctx.closePath();
          const wg = ctx.createLinearGradient(0, sea, 0, base + 40); wg.addColorStop(0, 'rgba(58,140,200,0.88)'); wg.addColorStop(1, 'rgba(14,52,110,0.92)'); ctx.fillStyle = wg; ctx.fill();
          ctx.strokeStyle = 'rgba(230,245,255,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath();
          for (let x = x0; x <= xe; x += 6) { const y = sea + Math.sin(x * 0.06 + t * 1.4) * 1.6 + Math.sin(x * 0.023 - t) * 1.2; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
          ctx.stroke(); ctx.restore();
        }
        /* vulcanii Anzilor */
        if (mode === 'subduction') {
          const k = T / 60;
          for (let i = 0; i < 3; i++) {
            const u = 0.62 + i * 0.07, vx = x0 + cw * u, vy = base - surf(u, T) * km;
            if (k > 0.25) {
              const a = Math.min(1, (k - 0.25) * 4);
              for (let j = 0; j < 4; j++) { const ph = (t * 0.15 + j / 4 + i * 0.3) % 1; ctx.fillStyle = A.rgba('#8a8690', 0.45 * a * (1 - ph)); ctx.beginPath(); ctx.arc(vx + ph * U * 0.12, vy - 6 - ph * U * 0.3, U * (0.02 + 0.05 * ph), 0, TAU); ctx.fill(); }
              ctx.fillStyle = A.rgba('#ff6a1f', a); ctx.beginPath(); ctx.ellipse(vx, vy + 1, U * 0.016, U * 0.007, 0, 0, TAU); ctx.fill();
              ctx.strokeStyle = A.rgba('#e8501c', 0.9 * a); ctx.lineWidth = Math.max(2, U * 0.008); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(vx + 2, vy + 2); ctx.quadraticCurveTo(vx + U * 0.03, vy + U * 0.04, vx + U * 0.05, vy + U * 0.06 * a); ctx.stroke();
            }
          }
        }
        /* săgeți de mișcare a plăcilor */
        const ay = base + 25, aw = Math.max(3, U * 0.02), al = U * 0.22;
        const arr = (x, dir) => A.arrow(ctx, x, ay, x + dir * al, ay, { color: 'rgba(255,214,110,0.95)', width: aw });
        if (mode === 'collision') { arr(x0 + cw * 0.12, 1); arr(x1 - cw * 0.12, -1); }
        if (mode === 'rift') { arr(x0 + cw * 0.38, -1); arr(x1 - cw * 0.38, 1); }
        if (mode === 'subduction') { arr(x0 + cw * 0.12, 1); }
        /* eroziune: nori de ploaie și ploaie */
        if (mode === 'erosion') {
          const cyc = base - surf(0.5, T) * km - U * 0.45;
          ctx.strokeStyle = 'rgba(120,150,190,0.7)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
          for (let i = 0; i < 30; i++) { const rx = x0 + cw * 0.25 + ((i * 53.7 + t * 30) % (cw * 0.5)), ry = cyc + ((i * 37 + t * 260) % (base - cyc)); ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 10); ctx.stroke(); }
          for (const [dx, s] of [[-0.12, 0.13], [0.02, 0.16], [0.15, 0.12]]) { A.cloud(ctx, x0 + cw * (0.5 + dx), cyc, U * s, 0.95); }
          ctx.fillStyle = 'rgba(70,80,100,0.25)'; ctx.beginPath(); ctx.ellipse(x0 + cw * 0.5, cyc + U * 0.04, U * 0.35, U * 0.06, 0, 0, TAU); ctx.fill();
          /* sedimente la baza muntelui */
          const sedA = Math.min(1, T / 40);
          for (const side of [-1, 1]) { const u = 0.5 + side * (0.2 + 0.08 * (T / 60)); const sx = x0 + cw * u, sy = base - surf(u, T) * km; ctx.fillStyle = A.rgba('#c9a878', 0.85 * sedA); ctx.beginPath(); ctx.ellipse(sx, sy + 2, U * 0.1 * sedA, U * 0.018 * sedA, 0, Math.PI, TAU); ctx.fill(); }
        }
        /* altitudine / etichete */
        const lab = (txt, u, dy) => A.label(ctx, txt, x0 + u * cw, base - surf(u, T) * km - (dy || 14) - fsz * 0.6, { size: fsz });
        if (mode === 'collision') { const h = surf(0.5, T) * 1000; lab('Altitudine: ' + fmtN(h) + ' m' + (h >= 8800 ? ' = Everest!' : ''), 0.5, 18); A.text(ctx, 'India', x0 + cw * 0.15, base + 10, { size: fsz }); A.text(ctx, 'Asia', x0 + cw * 0.85, base + 10, { size: fsz }); }
        if (mode === 'rift') { A.label(ctx, T > 14 ? 'Ocean nou' : 'Vale rift', x0 + cw * 0.5, base - 38 - fsz, { size: fsz }); }
        if (mode === 'subduction') { A.text(ctx, 'Placa oceanică', x0 + cw * 0.2, base + 70, { size: fsz }); A.label(ctx, 'Șanț', x0 + cw * 0.42, base - 22 - fsz, { size: fsz }); A.label(ctx, 'Anzi (vulcani)', x0 + cw * 0.68, base - surf(0.68, T) * km - U * 0.32, { size: fsz }); }
        if (mode === 'erosion') { const h = surf(0.5, T) * 1000; lab('Altitudine: ' + fmtN(h) + ' m', 0.5, 16); }
        A.text(ctx, 'Secțiune prin scoarță · timpul curge ×milioane', 14, api.cy + U - fsz * 0.8, { size: A.fs(U, 0.036, 12), align: 'left', weight: 600 });
      }

      /* ---------- comparația înălțimilor: munți ilustrați, turn, vulcani-scut ---------- */
      function profile(i, x) { /* x ∈ [-1,1] → înălțime relativă 0..1 */
        const ax = Math.abs(x);
        if (i === 4) return Math.pow(Math.max(0, 1 - Math.pow(ax, 1.6)), 0.9);
        if (i === 5) { const d = ax < 0.82 ? 1 - 0.42 * Math.pow(ax / 0.82, 1.8) : 0.58 * (1 - ax) / 0.18; return d - 0.04 * Math.exp(-Math.pow(x / 0.1, 2)); }
        const jag = 0.07 * (N1(x * 9 + i * 13) + 0.5 * N1(x * 23 + i * 5)) * (1 - ax);
        return clamp(Math.pow(1 - ax, 1.25) + jag * (1 - Math.pow(1 - ax, 6)), 0, 1);
      }
      function drawHeights(t) {
        const L = peakLayout(), base = L[0].base, U = api.unit, fsz = A.fs(U, 0.036, 12);
        /* sol și apă */
        const gg = ctx.createLinearGradient(0, base, 0, api.H); gg.addColorStop(0, '#6a7a52'); gg.addColorStop(0.15, '#4e5a3e'); gg.addColorStop(1, '#2e3428'); ctx.fillStyle = gg; ctx.fillRect(0, base, api.W, api.H - base);
        const HW = [0.18, 0.8, 0.95, 1.05, 1.5, 1.9];
        L.forEach((p, i) => {
          const hw = p.w * 0.5 * HW[i], H = base - p.y;
          ctx.save();
          if (i === 0) { /* Burj Khalifa: turn în trepte, sticlă */
            const w0 = p.w * 0.2;
            ctx.beginPath(); ctx.moveTo(p.x - w0, base);
            const steps = 7; for (let s = 0; s < steps; s++) { const y0 = base - H * 0.82 * s / steps, y1 = base - H * 0.82 * (s + 1) / steps, ww = w0 * (1 - s / steps * 0.85); ctx.lineTo(p.x - ww, y0); ctx.lineTo(p.x - ww, y1); }
            ctx.lineTo(p.x - 1, p.y); ctx.lineTo(p.x + 1, p.y);
            for (let s = steps - 1; s >= 0; s--) { const y0 = base - H * 0.82 * s / steps, y1 = base - H * 0.82 * (s + 1) / steps, ww = w0 * (1 - s / steps * 0.85); ctx.lineTo(p.x + ww, y1); ctx.lineTo(p.x + ww, y0); }
            ctx.closePath();
            const g = ctx.createLinearGradient(p.x - w0, 0, p.x + w0, 0); g.addColorStop(0, '#dfe8f2'); g.addColorStop(0.45, '#9fb2c8'); g.addColorStop(1, '#5a6a80'); ctx.fillStyle = g; ctx.fill();
            ctx.strokeStyle = 'rgba(40,50,70,0.6)'; ctx.lineWidth = 1; ctx.stroke();
          } else {
            const pts = []; const n = 40; for (let k = 0; k <= n; k++) { const x = -1 + 2 * k / n; pts.push([p.x + x * hw, base - profile(i, x) * H]); }
            const outline = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], base); pts.forEach((q) => ctx.lineTo(q[0], q[1])); ctx.lineTo(pts[n][0], base); ctx.closePath(); };
            const rock = i === 5 ? ['#c9805a', '#8a4a30'] : i === 4 ? ['#6e5a4e', '#3e322c'] : ['#9a8e82', '#5a5048'];
            outline(); const g = ctx.createLinearGradient(p.x - hw, 0, p.x + hw, 0); g.addColorStop(0, rock[0]); g.addColorStop(0.5, A.mix(rock[0], rock[1], 0.45)); g.addColorStop(1, rock[1]); ctx.fillStyle = g; ctx.fill();
            ctx.save(); outline(); ctx.clip();
            /* fața din umbră (dreapta vârfului) */
            let top = 0; pts.forEach((q, k) => { if (q[1] < pts[top][1]) top = k; });
            ctx.fillStyle = 'rgba(20,16,30,0.2)'; ctx.beginPath(); ctx.moveTo(pts[top][0], pts[top][1]);
            for (let k = 0; k <= 8; k++) ctx.lineTo(pts[top][0] + hw * 0.05 * Math.sin(k * 1.3) + hw * 0.12 * k / 8, pts[top][1] + H * k / 8);
            ctx.lineTo(p.x + hw * 1.2, base); ctx.lineTo(p.x + hw * 1.2, p.y - 5); ctx.closePath(); ctx.fill();
            /* pădure la poale (pe Pământ) */
            if (i >= 1 && i <= 3) { ctx.fillStyle = 'rgba(60,96,52,0.85)'; ctx.beginPath(); ctx.moveTo(p.x - hw * 1.1, base); for (let k = 0; k <= 20; k++) { const x = p.x - hw * 1.1 + hw * 2.2 * k / 20; ctx.lineTo(x, base - Math.min(H * 0.35, U * 0.09) * (0.7 + 0.3 * N1(k * 1.7 + i))); } ctx.lineTo(p.x + hw * 1.1, base); ctx.closePath(); ctx.fill(); }
            /* zăpadă pe vârf */
            const snow = [0, 0.82, 0.55, 0.42, 2, 2][i];
            if (snow < 1) {
              const sy = base - H * snow; ctx.fillStyle = '#f4f8fc'; ctx.beginPath(); ctx.moveTo(p.x - hw, p.y - 4);
              for (let k = 0; k <= 16; k++) { const x = p.x - hw + 2 * hw * k / 16; ctx.lineTo(x, sy + (k % 2 ? H * 0.05 : -H * 0.02) + N1(k * 2.3 + i) * H * 0.03); }
              ctx.lineTo(p.x + hw, p.y - 4); ctx.closePath(); ctx.fill();
              ctx.fillStyle = 'rgba(120,140,170,0.35)'; ctx.fillRect(pts[top][0] + 1, p.y - 4, hw, sy - p.y + H * 0.06);
            }
            /* Mauna Kea: partea de sub apă */
            if (i === 4) { const wl = base - H * (5.993 / 10.2); const wg = ctx.createLinearGradient(0, wl, 0, base); wg.addColorStop(0, 'rgba(60,140,200,0.7)'); wg.addColorStop(1, 'rgba(14,52,110,0.85)'); ctx.fillStyle = wg; ctx.fillRect(p.x - hw - 4, wl, hw * 2 + 8, base - wl); }
            ctx.restore();
            if (i === 4) { const wl = base - H * (5.993 / 10.2); ctx.strokeStyle = 'rgba(230,245,255,0.9)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let x = p.x - hw - 6; x <= p.x + hw + 6; x += 4) { const y = wl + Math.sin(x * 0.2 + t * 1.5) * 1.2; x === p.x - hw - 6 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
            ctx.strokeStyle = 'rgba(40,30,24,0.45)'; ctx.lineWidth = 1; outline(); ctx.stroke();
          }
          if (i === compPick) { ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x - p.w * 0.5, base + 3); ctx.lineTo(p.x + p.w * 0.5, base + 3); ctx.stroke(); A.arrow(ctx, p.x, Math.max(api.cy - U + fsz * 3, p.y - fsz * 3.2), p.x, p.y - fsz * 1.6, { color: '#ffd166', width: 3 }); }
          ctx.restore();
          A.text(ctx, fmtN(PEAKS[i][1] * 1000) + ' m', p.x, Math.max(api.cy - U + fsz * 2, p.y - fsz * 0.9), { size: fsz, color: i === compPick ? '#ffe7a0' : '#ffffff' });
          const words = PEAKS[i][0].split(' '); A.text(ctx, words[0], p.x, base + fsz * 1.2, { size: fsz }); if (words[1]) A.text(ctx, words.slice(1).join(' '), p.x, base + fsz * 2.4, { size: fsz * 0.9, weight: 600 });
        });
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5; const ey = L[3].y; ctx.beginPath(); ctx.moveTo(0, ey); ctx.lineTo(api.freeW, ey); ctx.stroke(); ctx.setLineDash([]);
        A.text(ctx, 'nivelul Everestului', 8, ey - fsz * 0.8, { size: fsz, align: 'left' });
      }
      setMode('collision');
      return { frame: frame };
    }
  });
})();
