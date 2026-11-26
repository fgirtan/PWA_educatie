/* Modul: Motorul termic — secțiune de muzeu tehnic */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const TAU = Math.PI * 2;

  /* textură de „secțiune” (hașuri fine pe metalul tăiat) */
  function hatch() { return Art.cached('eng-hatch', 14, 14, (c, w, h) => { c.strokeStyle = 'rgba(255,255,255,0.09)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-2, h + 2); c.lineTo(w + 2, -2); c.stroke(); }); }

  /* ============================================================
     1) MOTORUL TERMIC — 4 TIMPI
     ============================================================ */
  defineModule({
    id: 'engine', title: 'Motorul termic', sub: 'Cei 4 timpi: admisie, comprimare, ardere, evacuare',
    start: function (api) {
      const ctx = api.ctx;
      let th = 0, rps = 0.35, playing = true, lastStroke = -1, flash = 0;
      const flame = Art.particles(360), mist = Art.particles(240), smoke = Art.particles(220), flowDots = Art.particles(160);
      let accIn = 0, accEx = 0, accFl = 0, hatchPat = null;
      const STROKES = [
        { n: '1 · Admisie', c: '#4aa3e0', t: 'Pistonul coboară și trage în cilindru un amestec de aer și benzină prin supapa de admisie (deschisă).' },
        { n: '2 · Comprimare', c: '#e0c24a', t: 'Ambele supape sunt închise. Pistonul urcă și strânge amestecul: devine mic, dens și fierbinte.' },
        { n: '3 · Ardere (timpul motor)', c: '#ff6a3c', t: 'Bujia face o scânteie și amestecul explodează! Gazele fierbinți împing pistonul în jos cu mare forță. Doar acesta dă putere.' },
        { n: '4 · Evacuare', c: '#9aa3b2', t: 'Supapa de evacuare se deschide. Pistonul urcă și scoate gazele arse pe eapament. Apoi ciclul o ia de la capăt.' }
      ];
      const r1 = api.row('');
      const bP = api.button(r1, '⏸ Pauză', () => { playing = !playing; bP.innerHTML = playing ? '⏸ Pauză' : '▶ Pornește'; });
      api.slider(r1, { label: 'Viteza (încetinit)', min: 0.05, max: 3, step: 0.05, value: rps, fmt: (v) => fmt(v, 2) + ' rot/s', onInput: (v) => { rps = v; } });
      const r2 = api.row('Salt la timpul');
      STROKES.forEach((s, i) => api.button(r2, ['⬇️', '🗜️', '💥', '💨'][i] + ' ' + s.n.split('· ')[1].split(' ')[0], () => { th = i * Math.PI; playing = false; bP.innerHTML = '▶ Pornește'; flash = 0; }));
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Mașina ta (benzină) funcționează în <b>4 timpi</b>: admisie, comprimare, ardere, evacuare. Pistonul face 2 ture complete (720°) pentru un singur timp care dă putere!', 12000);

      const R_CR = 0.26, L_ROD = 0.6;       // în unități de „cursă” (biela e rigidă: lungime constantă)

      /* ---------- piese ---------- */
      function castFill(x, y, w, h, col) {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, Art.shade(col, 0.22)); g.addColorStop(0.55, col); g.addColorStop(1, Art.shade(col, -0.35));
        ctx.fillStyle = g; ctx.fill();
        if (!hatchPat) hatchPat = ctx.createPattern(hatch(), 'repeat');
        ctx.fillStyle = hatchPat; ctx.fill();
      }
      function valve(vx, hy, topY, hw, U, tint) {
        const sw = U * 0.012;
        /* tija */
        const g = ctx.createLinearGradient(vx - sw, 0, vx + sw, 0); g.addColorStop(0, '#7d8696'); g.addColorStop(0.4, '#e9edf4'); g.addColorStop(1, '#5d6574');
        ctx.fillStyle = g; ctx.fillRect(vx - sw, topY, sw * 2, hy - topY);
        /* talerul (ciupercă) */
        ctx.beginPath(); ctx.moveTo(vx - sw, hy - U * 0.035); ctx.quadraticCurveTo(vx - sw, hy - U * 0.008, vx - hw, hy - U * 0.006); ctx.lineTo(vx - hw, hy + U * 0.006); ctx.lineTo(vx + hw, hy + U * 0.006); ctx.lineTo(vx + hw, hy - U * 0.006); ctx.quadraticCurveTo(vx + sw, hy - U * 0.008, vx + sw, hy - U * 0.035); ctx.closePath();
        Art.volumeFill(ctx, vx - hw, hy - U * 0.03, vx + hw, hy + U * 0.01, tint, { hi: 0.4, lo: 0.45 });
        ctx.strokeStyle = 'rgba(20,24,34,0.6)'; ctx.lineWidth = 1; ctx.stroke();
      }
      function spring(vx, y0, y1, w, U) {
        const turns = 6; ctx.save(); ctx.lineCap = 'round';
        for (let pass = 0; pass < 2; pass++) {
          ctx.strokeStyle = pass ? '#d9dee8' : '#3d4452'; ctx.lineWidth = pass ? U * 0.006 : U * 0.013;
          ctx.beginPath();
          for (let i = 0; i <= turns * 12; i++) { const k = i / (turns * 12), y = lerp(y0, y1, k), x = vx + Math.sin(k * turns * TAU) * w; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.stroke();
        }
        ctx.restore();
      }
      function cam(x, y, rb, lift, dir) {
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) { const p = i / 48 * TAU; let d = Math.atan2(Math.sin(p - dir), Math.cos(p - dir)); const r = rb + (Math.abs(d) < Math.PI / 4 ? lift * Math.cos(2 * d) : 0); const px = x + Math.cos(p) * r, py = y + Math.sin(p) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.closePath(); Art.volumeFill(ctx, x - rb, y - rb, x + rb, y + rb * 1.6, '#8e97a8', { hi: 0.45 }); ctx.strokeStyle = 'rgba(15,20,30,0.7)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#2a303d'; ctx.beginPath(); ctx.arc(x, y, rb * 0.35, 0, TAU); ctx.fill();
      }
      function bolt(x0, y0, x1, y1, seed, w) {
        ctx.beginPath(); ctx.moveTo(x0, y0);
        for (let i = 1; i < 5; i++) { const k = i / 5; ctx.lineTo(lerp(x0, x1, k) + Art.noise1(seed + i * 3.1) * w, lerp(y0, y1, k)); }
        ctx.lineTo(x1, y1); ctx.stroke();
      }

      function frame(dt, t) {
        if (playing) th += rps * TAU * dt;
        const cyc = ((th % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);       // 0..720°
        const stroke = Math.floor(cyc / Math.PI), u = (cyc % Math.PI) / Math.PI;
        const a = th;                                                              // unghi manivelă
        const U = api.unit, W = api.freeW, cx = api.cx, cy = api.cy;
        if (stroke !== lastStroke) { lastStroke = stroke; api.say('<b style="color:' + STROKES[stroke].c + '">' + STROKES[stroke].n + '</b> — ' + STROKES[stroke].t); if (stroke === 2) flash = 1; }
        flash = Math.max(0, flash - dt * 1.5);

        /* ---------- geometrie (bielă rigidă) ---------- */
        const cw = U * 0.5, wt = U * 0.085, cl = cx - cw / 2, cr = cx + cw / 2;
        const headY = cy - U * 0.55, strokeLen = U * 0.56, crr = strokeLen / 2, Ls = L_ROD / (2 * R_CR) * strokeLen;
        const pH = U * 0.2, wOff = pH * 0.55;
        const crankY = headY + 4 + wOff + crr + Ls;
        const pin = [cx + Math.sin(a) * crr, crankY - Math.cos(a) * crr];
        const wristY = pin[1] - Math.sqrt(Ls * Ls - Math.pow(pin[0] - cx, 2));
        const pistonTop = wristY - wOff;
        const boreBot = headY + 4 + strokeLen + pH + U * 0.03;
        const Rc = U * 0.4;
        const headTop = headY - U * 0.2, hl = cl - wt - U * 0.03, hr = cr + wt + U * 0.03;
        const vxI = cx - cw * 0.28, vxE = cx + cw * 0.28, vl = U * 0.05, hw = cw * 0.17;
        const inL = stroke === 0 ? Math.sin(u * Math.PI) : 0, exL = stroke === 3 ? Math.sin(u * Math.PI) : 0;
        const portY = headY - U * 0.12, pipeW = U * 0.075;
        const hot = stroke === 2 ? clamp(1 - u * 1.1, 0, 1) : 0;
        const spin = playing ? rps : 0;

        /* ---------- fundal: sală de muzeu, spot de lumină ---------- */
        Art.backdrop(ctx, api.W, api.H, { top: '#1c2238', bottom: '#0e1220', vignette: false });
        Art.groundShadow(ctx, cx, crankY + Rc + U * 0.04, Rc * 1.3, U * 0.05, 0.4);

        /* ---------- carter (spate) ---------- */
        ctx.save();
        ctx.beginPath(); ctx.rect(cl - wt, boreBot - 4, cw + wt * 2, crankY - boreBot + 4); ctx.moveTo(cx + Rc, crankY); ctx.arc(cx, crankY, Rc, 0, TAU);
        castFill(cx - Rc, boreBot, Rc * 2, Rc * 2, '#5d6678');
        const ir = Rc - wt * 0.8;
        ctx.beginPath(); ctx.rect(cl, boreBot - 6, cw, crankY - boreBot + 6); ctx.moveTo(cx + ir, crankY); ctx.arc(cx, crankY, ir, 0, TAU);
        const cg = ctx.createRadialGradient(cx - ir * 0.3, crankY - ir * 0.4, ir * 0.1, cx, crankY, ir * 1.2); cg.addColorStop(0, '#2a3142'); cg.addColorStop(1, '#0d1019'); ctx.fillStyle = cg; ctx.fill();
        /* ulei în baie */
        ctx.save(); ctx.beginPath(); ctx.arc(cx, crankY, ir, 0, TAU); ctx.clip();
        const oy = crankY + ir * 0.62; ctx.beginPath(); ctx.moveTo(cx - ir, oy);
        for (let x = -ir; x <= ir; x += ir / 10) ctx.lineTo(cx + x, oy + Math.sin(x * 0.08 + t * 3) * U * 0.006);
        ctx.lineTo(cx + ir, crankY + ir); ctx.lineTo(cx - ir, crankY + ir); ctx.closePath();
        const og = ctx.createLinearGradient(0, oy, 0, crankY + ir); og.addColorStop(0, '#c98a2a'); og.addColorStop(1, '#5a3510'); ctx.fillStyle = og; ctx.fill();
        ctx.restore();
        ctx.restore();

        /* ---------- arbore cotit: contragreutate + braț ---------- */
        ctx.save(); ctx.translate(cx, crankY); ctx.rotate(a);
        ctx.beginPath(); ctx.arc(0, 0, crr * 1.12, 0.15, Math.PI - 0.15); ctx.lineTo(-crr * 0.32, -crr * 0.1); ctx.lineTo(-crr * 0.3, -crr); ctx.arc(0, -crr, crr * 0.3, Math.PI, 0); ctx.lineTo(crr * 0.32, -crr * 0.1); ctx.closePath();
        Art.volumeFill(ctx, -crr, -crr * 1.2, crr, crr * 1.1, '#7a8498', { hi: 0.35, lo: 0.5 });
        ctx.strokeStyle = 'rgba(10,14,24,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(0, 0, crr * 0.9, 0.4, Math.PI - 0.4); ctx.arc(0, 0, crr * 0.55, Math.PI - 0.4, 0.4, true); ctx.closePath(); ctx.fill();
        ctx.restore();
        Art.sphere(ctx, cx, crankY, crr * 0.26, '#9aa4b6', { rim: false });
        ctx.fillStyle = '#1a1f2b'; ctx.beginPath(); ctx.arc(cx, crankY, crr * 0.09, 0, TAU); ctx.fill();

        /* ---------- gazul din cameră ---------- */
        ctx.save(); ctx.beginPath(); ctx.rect(cl, headY, cw, Math.max(0, pistonTop - headY)); ctx.clip();
        let g1 = 'rgba(80,170,255,0.30)', g2 = 'rgba(40,110,220,0.45)';
        if (stroke === 1) { const k = u; g1 = 'rgba(' + Math.round(lerp(90, 255, k)) + ',' + Math.round(lerp(175, 205, k)) + ',' + Math.round(lerp(255, 110, k)) + ',' + lerp(0.35, 0.6, k) + ')'; g2 = 'rgba(' + Math.round(lerp(40, 230, k)) + ',' + Math.round(lerp(110, 140, k)) + ',' + Math.round(lerp(220, 60, k)) + ',' + lerp(0.45, 0.8, k) + ')'; }
        if (stroke === 2) { g1 = 'rgba(255,' + Math.round(200 + 50 * hot) + ',' + Math.round(90 + 120 * hot) + ',' + (0.4 + 0.5 * hot) + ')'; g2 = 'rgba(255,' + Math.round(90 + 50 * (1 - hot)) + ',30,' + (0.4 + 0.45 * hot) + ')'; }
        if (stroke === 3) { g1 = 'rgba(170,172,180,0.45)'; g2 = 'rgba(90,92,104,0.6)'; }
        const gg = ctx.createRadialGradient(cx, headY, 2, cx, headY, Math.max(cw, pistonTop - headY) * 1.1); gg.addColorStop(0, g1); gg.addColorStop(1, g2);
        ctx.fillStyle = '#0c0f18'; ctx.fillRect(cl, headY, cw, pistonTop - headY);
        ctx.fillStyle = gg; ctx.fillRect(cl, headY, cw, pistonTop - headY);
        if (stroke === 1) { /* moleculele se strâng */ ctx.fillStyle = 'rgba(255,255,255,' + (0.18 + u * 0.3) + ')'; for (let i = 0; i < 26; i++) { const px = cl + (i * 0.618 % 1) * cw, py = headY + ((i * 0.381 + Art.noise1(i + t * 2) * 0.05) % 1 + 1) % 1 * (pistonTop - headY); ctx.beginPath(); ctx.arc(px, py, U * 0.006, 0, TAU); ctx.fill(); } }
        mist.draw(ctx); flame.draw(ctx);
        ctx.restore();

        /* ---------- piston ---------- */
        Art.cylinder(ctx, cl + 2, pistonTop, cw - 4, pH, hot > 0 ? Art.mix('#c5ccd8', '#ffb070', hot * 0.5) : '#c5ccd8', true);
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(cl + 3, pistonTop + 1, cw - 6, 2);
        [0.13, 0.25, 0.37].forEach((k, i) => { const ry = pistonTop + pH * k; ctx.fillStyle = '#2b303c'; ctx.fillRect(cl + 2, ry - U * 0.008, cw - 4, U * 0.016); ctx.fillStyle = i < 2 ? '#8f97a8' : '#b5874a'; ctx.fillRect(cl, ry - U * 0.004, cw, U * 0.008); });
        /* fereastră în piston (secțiune) prin care se vede biela */
        ctx.fillStyle = 'rgba(15,18,28,0.75)'; Art.roundRectPath(ctx, cx - cw * 0.22, pistonTop + pH * 0.46, cw * 0.44, pH * 0.6, U * 0.02); ctx.fill();

        /* ---------- biela (rigidă) ---------- */
        const ang = Math.atan2(pin[1] - wristY, pin[0] - cx);
        ctx.save(); ctx.translate(cx, wristY); ctx.rotate(ang);
        const r1s = U * 0.042, r2s = U * 0.075, w1 = U * 0.026, w2 = U * 0.042;
        ctx.beginPath(); ctx.arc(0, 0, r1s, Math.PI / 2, -Math.PI / 2); ctx.lineTo(Ls * 0.25, -w1); ctx.lineTo(Ls - r2s * 0.6, -w2); ctx.arc(Ls, 0, r2s, -Math.PI * 0.7, Math.PI * 0.7); ctx.lineTo(Ls * 0.25, w1); ctx.closePath();
        const rg = ctx.createLinearGradient(0, -w2, 0, w2); rg.addColorStop(0, '#f2c77a'); rg.addColorStop(0.45, '#c9974a'); rg.addColorStop(1, '#6e4a1c');
        ctx.fillStyle = rg; ctx.fill(); ctx.strokeStyle = 'rgba(60,35,10,0.7)'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = 'rgba(70,45,15,0.45)'; Art.roundRectPath(ctx, r1s * 1.2, -w1 * 0.4, Ls - r1s * 1.2 - r2s * 1.3, w1 * 0.8, w1 * 0.4); ctx.fill();
        ctx.fillStyle = '#3a2a14'; [-1, 1].forEach((s) => { ctx.beginPath(); ctx.arc(Ls - r2s * 0.15, s * r2s * 0.78, U * 0.01, 0, TAU); ctx.fill(); });
        ctx.restore();
        Art.sphere(ctx, cx, wristY, U * 0.026, '#d7dce6', { rim: false });
        Art.sphere(ctx, pin[0], pin[1], U * 0.04, '#e0a64a', { rim: false });

        /* ---------- pereții cilindrului, cu canale de răcire ---------- */
        [[cl - wt, 0], [cr, 1]].forEach(([x]) => {
          ctx.beginPath(); ctx.rect(x, headY, wt, boreBot - headY); castFill(x, headY, wt, boreBot - headY, '#6b7487');
          ctx.fillStyle = 'rgba(70,150,230,0.55)'; Art.roundRectPath(ctx, x + wt * 0.3, headY + U * 0.04, wt * 0.4, boreBot - headY - U * 0.1, wt * 0.2); ctx.fill();
          ctx.fillStyle = 'rgba(200,235,255,0.35)'; ctx.fillRect(x + wt * 0.34, headY + U * 0.05, wt * 0.08, boreBot - headY - U * 0.13);
        });
        ctx.fillStyle = 'rgba(235,240,250,0.5)'; ctx.fillRect(cl - 1.5, headY, 1.5, boreBot - headY); ctx.fillRect(cr, headY, 1.5, boreBot - headY);

        /* ---------- conducte de admisie și evacuare ---------- */
        Art.tube(ctx, [[cx - U * 0.66, portY], [hl + 2, portY]], pipeW, '#7f8aa0');
        Art.tube(ctx, [[hr - 2, portY], [cx + U * 0.56, portY], [cx + U * 0.64, portY - U * 0.03]], pipeW, '#8a7f78');
        ctx.fillStyle = '#0f131c'; ctx.beginPath(); ctx.ellipse(cx - U * 0.66, portY, pipeW * 0.22, pipeW * 0.5, 0, 0, TAU); ctx.fill();
        /* fluxul de gaz prin conducte (secțiune) */
        ctx.save(); ctx.beginPath(); ctx.rect(cx - U * 0.7, portY - pipeW * 0.38, U * 1.4, pipeW * 0.76); ctx.clip(); flowDots.draw(ctx); ctx.restore();

        /* ---------- chiulasa (secțiune) cu canale ---------- */
        ctx.beginPath(); Art.roundRectPath(ctx, hl, headTop, hr - hl, headY - headTop, U * 0.03); castFill(hl, headTop, hr - hl, headY - headTop, '#8b95a8');
        ctx.save(); Art.roundRectPath(ctx, hl, headTop, hr - hl, headY - headTop + 2, U * 0.03); ctx.clip();
        ctx.lineCap = 'round'; ctx.strokeStyle = '#151a26'; ctx.lineWidth = pipeW * 0.8;
        ctx.beginPath(); Art.smoothPath(ctx, [[hl - 10, portY], [vxI - hw * 1.4, portY + U * 0.005], [vxI, headY - U * 0.04], [vxI, headY + 6]]); ctx.stroke();
        ctx.beginPath(); Art.smoothPath(ctx, [[hr + 10, portY], [vxE + hw * 1.4, portY + U * 0.005], [vxE, headY - U * 0.04], [vxE, headY + 6]]); ctx.stroke();
        if (inL > 0.02) { ctx.strokeStyle = 'rgba(120,200,255,' + (0.35 * inL) + ')'; ctx.lineWidth = pipeW * 0.5; ctx.beginPath(); Art.smoothPath(ctx, [[hl - 10, portY], [vxI - hw * 1.4, portY + U * 0.005], [vxI, headY - U * 0.04], [vxI, headY + 6]]); ctx.stroke(); }
        if (exL > 0.02) { ctx.strokeStyle = 'rgba(170,170,180,' + (0.4 * exL) + ')'; ctx.lineWidth = pipeW * 0.5; ctx.beginPath(); Art.smoothPath(ctx, [[hr + 10, portY], [vxE + hw * 1.4, portY + U * 0.005], [vxE, headY - U * 0.04], [vxE, headY + 6]]); ctx.stroke(); }
        ctx.restore();
        /* tavanul camerei de ardere */
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(cl, headY - 2, cw, 3);

        /* ---------- supape, arcuri, came ---------- */
        const camY = headTop - U * 0.09 - U * 0.04, rb = U * 0.04;
        [[vxI, inL, '#6fb4ec', Math.PI / 2 + (cyc / 2 - Math.PI / 4)], [vxE, exL, '#c79a86', Math.PI / 2 + (cyc / 2 - 1.75 * Math.PI)]].forEach(([vx, L, tint, dir]) => {
          const drop = L * vl, retY = headTop - U * 0.09 + drop;
          spring(vx, headTop - 1, retY + U * 0.01, hw * 0.55, U);
          valve(vx, headY + drop, retY, hw, U, tint);
          ctx.fillStyle = '#4b5263'; Art.roundRectPath(ctx, vx - hw * 0.75, retY - U * 0.004, hw * 1.5, U * 0.016, U * 0.006); ctx.fill();
          cam(vx, camY, rb, vl, dir);
        });
        ctx.strokeStyle = 'rgba(160,170,190,0.55)'; ctx.lineWidth = U * 0.012; ctx.beginPath(); ctx.moveTo(vxI + rb * 0.4, camY); ctx.lineTo(vxE - rb * 0.4, camY); ctx.stroke();

        /* ---------- bujia ---------- */
        const plugTop = headTop - U * 0.1;
        ctx.fillStyle = '#7b8494'; ctx.fillRect(cx - U * 0.018, headTop - U * 0.02, U * 0.036, headY - headTop + U * 0.02);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = headTop; y < headY - 3; y += U * 0.014) ctx.fillRect(cx - U * 0.018, y, U * 0.036, 1);
        ctx.beginPath(); ctx.moveTo(cx - U * 0.034, headTop - U * 0.045); ctx.lineTo(cx + U * 0.034, headTop - U * 0.045); ctx.lineTo(cx + U * 0.034, headTop); ctx.lineTo(cx - U * 0.034, headTop); ctx.closePath();
        Art.volumeFill(ctx, cx - U * 0.034, 0, cx + U * 0.034, 0, '#a3acbb');
        ctx.beginPath(); ctx.moveTo(cx - U * 0.022, headTop - U * 0.045); ctx.quadraticCurveTo(cx - U * 0.026, plugTop + U * 0.03, cx - U * 0.015, plugTop + U * 0.01); ctx.lineTo(cx + U * 0.015, plugTop + U * 0.01); ctx.quadraticCurveTo(cx + U * 0.026, plugTop + U * 0.03, cx + U * 0.022, headTop - U * 0.045); ctx.closePath();
        Art.volumeFill(ctx, cx - U * 0.025, 0, cx + U * 0.025, 0, '#efeae0', { hi: 0.5, lo: 0.3 });
        ctx.fillStyle = 'rgba(160,150,135,0.5)'; for (let k = 0; k < 3; k++) ctx.fillRect(cx - U * 0.022, headTop - U * 0.06 - k * U * 0.012, U * 0.044, 1.2);
        ctx.fillStyle = '#8a93a3'; Art.roundRectPath(ctx, cx - U * 0.01, plugTop - U * 0.02, U * 0.02, U * 0.035, U * 0.006); ctx.fill();
        const tipY = headY + U * 0.012;
        ctx.strokeStyle = '#c8ced8'; ctx.lineWidth = Math.max(1.5, U * 0.006); ctx.beginPath(); ctx.moveTo(cx, headY - 2); ctx.lineTo(cx, tipY); ctx.moveTo(cx - U * 0.014, headY); ctx.lineTo(cx - U * 0.014, tipY + U * 0.012); ctx.lineTo(cx - U * 0.002, tipY + U * 0.012); ctx.stroke();

        /* ---------- scânteia + flacăra ---------- */
        const sparkOn = stroke === 2 && u < 0.09;
        if (sparkOn || flash > 0.7) {
          Art.glow(ctx, cx, tipY + U * 0.006, U * 0.06, '#bfe6ff', 0.7);
          ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1.5, U * 0.006); ctx.lineCap = 'round'; bolt(cx, tipY, cx - U * 0.008, tipY + U * 0.012, t * 37, U * 0.006);
          ctx.strokeStyle = 'rgba(150,210,255,0.9)'; ctx.lineWidth = 1; for (let k = 0; k < 2; k++) { const an = 0.6 + k * 1.9; bolt(cx, tipY + U * 0.006, cx + Math.cos(an) * U * 0.05, tipY + U * 0.006 + Math.abs(Math.sin(an)) * U * 0.04, t * 50 + k * 9, U * 0.01); }
          ctx.restore();
        }
        if (flash > 0) Art.glow(ctx, cx, headY + U * 0.06, cw * 0.6, '#ffcf70', flash * 0.45);

        /* ---------- emisii de particule (legate de rotație) ---------- */
        if (spin > 0) {
          const rate = 55 * Math.min(1.5, spin / 0.35 * 0.5 + 0.5);
          if (inL > 0.05) { accIn += dt * rate * inL; while (accIn > 1) { accIn--; mist.emit({ x: vxI + (Math.random() - 0.5) * hw * 2, y: headY + inL * vl + U * 0.01, vx: (Math.random() - 0.3) * U * 0.5, vy: U * (0.3 + Math.random() * 0.6) * (0.5 + spin), life: 0.7 + Math.random() * 0.6, size: U * (0.006 + Math.random() * 0.008), color: Math.random() < 0.3 ? '#ffe39a' : '#a9dcff', drag: 1.5 }); flowDots.emit({ x: cx - U * 0.66, y: portY + (Math.random() - 0.5) * pipeW * 0.5, vx: U * (0.7 + spin * 0.8), life: 0.35 / (0.5 + spin * 0.6) + 0.2, size: U * 0.008, color: '#a9dcff', drag: 0 }); } }
          if (exL > 0.05) { accEx += dt * rate * exL; while (accEx > 1) { accEx--; flowDots.emit({ x: hr - 4, y: portY + (Math.random() - 0.5) * pipeW * 0.5, vx: U * (0.7 + spin * 0.8), life: 0.3 / (0.5 + spin * 0.6) + 0.15, size: U * 0.01, color: '#b8bcc6', drag: 0 }); if (Math.random() < 0.6) smoke.emit({ x: cx + U * 0.65, y: portY - U * 0.04, vx: U * (0.12 + Math.random() * 0.15), vy: -U * (0.08 + Math.random() * 0.12), g: -U * 0.06, life: 1.6 + Math.random(), size: U * 0.02, grow: U * 0.07, color: Math.random() < 0.5 ? '#9aa0ab' : '#6f7480', drag: 0.9 }); } }
          if (hot > 0.05) { accFl += dt * 120 * hot; while (accFl > 1) { accFl--; const an = Math.random() * Math.PI, sp = U * (0.3 + Math.random() * 0.9); flame.emit({ x: cx + (Math.random() - 0.5) * U * 0.02, y: headY + U * 0.02, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp * 0.7 + U * 0.2, life: 0.25 + Math.random() * 0.3, size: U * (0.035 + Math.random() * 0.04), grow: U * 0.05, color: Math.random() < 0.4 ? '#ffe27a' : '#ff8a2e', glow: true, drag: 2.5 }); } }
        }
        mist.update(dt); flame.update(dt); smoke.update(dt); flowDots.update(dt);
        smoke.draw(ctx);

        /* ---------- etichete ---------- */
        const F = Art.fs(U, 0.045, 13);
        Art.label(ctx, 'admisie', cx - U * 0.62, portY + pipeW * 1.25, { size: F, color: '#bfe2ff', tx: cx - U * 0.58, ty: portY + pipeW * 0.3 });
        Art.label(ctx, 'evacuare', cx + U * 0.6, portY + pipeW * 1.25, { size: F, color: '#e3e3e8', tx: cx + U * 0.54, ty: portY + pipeW * 0.3 });
        Art.label(ctx, 'bujie', cx + U * 0.36, headTop - U * 0.16, { size: F, color: '#fff3c4', tx: cx + U * 0.02, ty: plugTop + U * 0.02 });
        const lx = cl - wt - U * 0.05;
        Art.label(ctx, 'piston', lx, pistonTop + pH * 0.3, { size: F, align: 'right', tx: cl + U * 0.04, ty: pistonTop + pH * 0.3 });
        const rodMy = (wristY + pin[1]) / 2 + U * 0.04;
        Art.label(ctx, 'bielă', cx - Rc - U * 0.02, rodMy, { size: F, align: 'right', tx: (cx + pin[0]) / 2, ty: rodMy });
        Art.label(ctx, 'arbore cotit', cx - Rc * 0.7, crankY + Rc + U * 0.08, { size: F, tx: cx - crr * 0.5, ty: crankY + crr * 0.6 });

        /* ---------- cadranul ciclului (720°) ---------- */
        const dr = clamp(U * 0.17, 36, 72), dX = W - dr - 18, dY = cy + U * 0.42;
        ctx.beginPath(); ctx.arc(dX, dY, dr + 8, 0, TAU); const bz = ctx.createLinearGradient(dX - dr, dY - dr, dX + dr, dY + dr); bz.addColorStop(0, '#d9dee8'); bz.addColorStop(1, '#4a5263'); ctx.fillStyle = bz; ctx.fill();
        const fg = ctx.createRadialGradient(dX - dr * 0.3, dY - dr * 0.3, 2, dX, dY, dr + 4); fg.addColorStop(0, '#202a46'); fg.addColorStop(1, '#090d1a'); ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(dX, dY, dr + 3, 0, TAU); ctx.fill();
        for (let i = 0; i < 4; i++) { const on = i === stroke; ctx.strokeStyle = Art.rgba(STROKES[i].c, on ? 1 : 0.32); ctx.lineWidth = on ? dr * 0.32 : dr * 0.24; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.arc(dX, dY, dr * 0.74, -Math.PI / 2 + i * Math.PI / 2 + 0.04, -Math.PI / 2 + (i + 1) * Math.PI / 2 - 0.04); ctx.stroke(); }
        const na = -Math.PI / 2 + cyc / (4 * Math.PI) * TAU;
        ctx.save(); ctx.translate(dX, dY); ctx.rotate(na); ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(-dr * 0.12, -dr * 0.05); ctx.lineTo(dr * 0.86, 0); ctx.lineTo(-dr * 0.12, dr * 0.05); ctx.closePath(); ctx.fill(); ctx.restore();
        Art.sphere(ctx, dX, dY, dr * 0.12, '#c9ced8', { rim: false });
        Art.text(ctx, '720°', dX, dY + dr * 0.42, { size: Math.max(11, dr * 0.24) });
        Art.text(ctx, STROKES[stroke].n, W - 12, dY + dr + Math.max(20, F * 1.3), { size: F, color: STROKES[stroke].c, align: 'right' });

        info.innerHTML = '<b>Unghi:</b> ' + Math.round(cyc / (Math.PI * 2) * 360) + '° din 720° · <b style="color:' + STROKES[stroke].c + '">' + STROKES[stroke].n + '</b>';
      }
      return { frame: frame };
    }
  });
})();
