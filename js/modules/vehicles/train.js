/* Modul: Trenul — locomotivă electrică detaliată, catenară, roți conice */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const TAU = Math.PI * 2;

  /* roată de tren (vedere laterală): bandaj cu buză, disc cu găuri, butuc */
  function railWheel(ctx, x, y, r, ang) {
    ctx.beginPath(); ctx.arc(x, y, r * 1.12, 0, TAU); ctx.fillStyle = '#2a2d33'; ctx.fill();          // buza (flanșa)
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#b9c0ca'); g.addColorStop(1, '#4b525d'); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, TAU); ctx.fillStyle = '#3c424c'; ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.13, 0, TAU); ctx.fillStyle = '#23272e'; ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 0, r * 0.26, 0, TAU); ctx.fillStyle = '#8a929e'; ctx.fill();
    ctx.fillStyle = '#d0d5dd'; ctx.fillRect(-r * 0.05, -r * 0.24, r * 0.1, r * 0.2);
    ctx.restore();
  }
  function bogie(ctx, x, ang, r, col) {
    const w = 46;
    railWheel(ctx, x - w / 2, -r, r, ang); railWheel(ctx, x + w / 2, -r, r, ang);
    ctx.beginPath(); Art.roundRectPath(ctx, x - w / 2 - r * 0.9, -r * 1.55, w + r * 1.8, r * 0.75, 4); Art.volumeFill(ctx, 0, -r * 1.55, 0, -r * 0.8, col || '#3b4048', { hi: 0.25 });
    ctx.fillStyle = '#5a616c'; [x - w / 2, x + w / 2].forEach((ax) => { ctx.beginPath(); ctx.arc(ax, -r, r * 0.3, 0, TAU); ctx.fill(); });
    ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 2.5; for (const sx of [x - 7, x + 7]) { ctx.beginPath(); for (let k = 0; k <= 12; k++) { const yy = -r * 1.55 - k * 0.9; ctx.lineTo(sx + (k % 2 ? 3 : -3), yy); } ctx.stroke(); }
  }
  function wagon(ctx, x0, len, wheelAng) {
    const top = -92, bot = -34;
    ctx.beginPath(); Art.roundRectPath(ctx, x0, top, len, bot - top, 10);
    const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, '#dfe6ee'); g.addColorStop(0.08, '#f1f4f7'); g.addColorStop(0.15, '#2f6aa8'); g.addColorStop(0.85, '#245689'); g.addColorStop(1, '#173a5e');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#0f2238'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#f1f4f7'; ctx.fillRect(x0, -48, len, 4);
    const nWin = Math.floor((len - 40) / 22);
    for (let i = 0; i < nWin; i++) { const wx = x0 + 22 + i * 22; ctx.beginPath(); Art.roundRectPath(ctx, wx, -78, 16, 20, 4); const wg = ctx.createLinearGradient(0, -78, 0, -58); wg.addColorStop(0, '#203247'); wg.addColorStop(1, '#5d7a99'); ctx.fillStyle = wg; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(wx + 3, -76, 3, 16); }
    ctx.strokeStyle = 'rgba(10,25,45,0.7)'; ctx.lineWidth = 1; [x0 + 6, x0 + len - 18].forEach((dx) => { Art.roundRectPath(ctx, dx, -80, 12, 44, 3); ctx.stroke(); });
    ctx.fillStyle = '#8b939e'; ctx.fillRect(x0 + 8, top - 4, len - 16, 5);
    ctx.fillStyle = '#2a2d33'; ctx.fillRect(x0 + 4, bot, len - 8, 5);
    bogie(ctx, x0 + 32, wheelAng, 11); bogie(ctx, x0 + len - 32, wheelAng, 11);
  }

  /* ============================================================
     3) TRENUL
     ============================================================ */
  defineModule({
    id: 'train', title: 'Trenul', sub: 'Locomotiva electrică și roțile pe șină',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'loc', thr = 0.35, brake = false, v = 0, dist = 0, wheelAng = 0, flow = 0, energy = 0;
      let off = 0, offV = 0, curve = false, dragging = false, wt = 0;
      const bs = {};
      const rm = api.row('');
      [['loc', '🚆 Locomotiva'], ['wheel', '🛞 Roțile pe șină']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rl = api.row(''), rw = api.row('');
      api.slider(rl, { label: 'Accelerație', min: 0, max: 1, step: 0.01, value: thr, fmt: (x) => Math.round(x * 100) + '%', onInput: (x) => { thr = x; } });
      const bB = api.button(rl, '🛑 Frână', () => { brake = !brake; bB.classList.toggle('on', brake); bB.innerHTML = brake ? '🛑 Frână: ACTIVĂ' : '🛑 Frână'; if (brake) api.say('<b>Frâna electrică (recuperare):</b> motoarele devin generatoare și trimit curent înapoi în rețea! Trenul încetinește și produce energie.', 9000); });
      const info = document.createElement('div'); info.className = 'mod-readout'; rl.appendChild(info);
      const bCu = api.button(rw, '↪️ Intră în curbă', () => { curve = !curve; bCu.classList.toggle('on', curve); bCu.innerHTML = curve ? '↪️ În curbă (apasă ca să ieși)' : '↪️ Intră în curbă'; if (curve) api.say('În curbă, roata din exterior trebuie să parcurgă un drum mai lung. Roțile sunt <b>conice</b>: cea din exterior se sprijină pe un diametru mai mare și merge mai repede — trenul se ia singur după curbă!', 12000); });
      const MSG = {
        loc: 'Locomotiva electrică ia curent din <b>firul de contact</b> (catenară), prin <b>pantograf</b>. Un transformator coboară tensiunea (25.000 V → câteva sute), apoi <b>motoarele de tracțiune</b> învârt roțile. Trage de glisor ca să accelerezi!',
        wheel: 'O osie are două roți conice legate rigid. <b>Trage cu degetul</b> osia lateral: roata unde ajunge pe un diametru mai mare avansează mai mult și o readuce la centru. Așa nu au nevoie trenurile de volan!'
      };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rl.style.display = m === 'loc' ? '' : 'none'; rw.style.display = m === 'wheel' ? '' : 'none'; api.say(MSG[m], 14000); api.layout(); }
      api.pointer({
        down: (x, y) => { if (mode === 'wheel') { dragging = true; off = clamp((x - api.cx) / (api.unit * 0.9), -1, 1); offV = 0; } },
        move: (x, y) => { if (mode === 'wheel' && dragging) off = clamp((x - api.cx) / (api.unit * 0.9), -1, 1); },
        up: () => { dragging = false; }
      });
      setMode('loc');
      const WIRE = -178;                      // înălțimea firului de contact (unități locale)

      function drawLoco(x, y, sc, powered, t) {
        ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
        /* vagoane */
        wagon(ctx, -332, 150, wheelAng); wagon(ctx, -174, 150, wheelAng);
        ctx.fillStyle = '#2a2d33'; ctx.fillRect(-184, -46, 12, 6); ctx.fillRect(-26, -46, 10, 6);
        /* echipament pe acoperiș */
        ctx.beginPath(); Art.roundRectPath(ctx, 60, -104, 70, 10, 3); Art.volumeFill(ctx, 0, -104, 0, -94, '#8d96a3');
        for (const ix of [18, 70, 112]) { ctx.fillStyle = '#c47a3a'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(ix, -97 - k * 3, 4, 1.6, 0, 0, TAU); ctx.fill(); } }
        /* pantograful (un singur braț articulat), atinge firul */
        const baseX = 30, baseY = -100, topY = WIRE + 3, h = baseY - topY;
        const lower = h * 0.55, kneeX = baseX + 34, kneeY = baseY - lower;
        ctx.lineCap = 'round'; ctx.strokeStyle = '#3a3f47'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(kneeX, kneeY); ctx.lineTo(baseX + 6, topY + 4); ctx.stroke();
        ctx.strokeStyle = '#6d747f'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(baseX + 8, baseY); ctx.lineTo(kneeX - 4, kneeY + 6); ctx.stroke();
        ctx.fillStyle = '#3a3f47'; ctx.beginPath(); ctx.arc(kneeX, kneeY, 3.5, 0, TAU); ctx.fill();
        ctx.beginPath(); Art.roundRectPath(ctx, baseX - 14, topY, 40, 5, 2.5); ctx.fillStyle = '#2a2d33'; ctx.fill(); ctx.fillStyle = '#c9a24a'; ctx.fillRect(baseX - 10, topY, 32, 2);
        ctx.fillStyle = '#4b525d'; ctx.fillRect(baseX - 8, baseY - 2, 18, 6);
        if (powered) { ctx.strokeStyle = 'rgba(190,225,255,0.95)'; ctx.lineWidth = 1.5; const sp = (t * 7) % 1; if (sp < 0.45) { for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k - 1) * 0.9 + Math.sin(t * 23 + k) * 0.3; ctx.beginPath(); ctx.moveTo(baseX + 6, topY); ctx.lineTo(baseX + 6 + Math.cos(a) * 7, topY + Math.sin(a) * 7 - 1); ctx.stroke(); } } }
        /* caroseria locomotivei */
        ctx.beginPath(); ctx.moveTo(-16, -34); ctx.lineTo(-18, -84); ctx.quadraticCurveTo(-18, -94, -6, -95); ctx.lineTo(150, -95); ctx.quadraticCurveTo(166, -95, 174, -86); ctx.lineTo(186, -62); ctx.quadraticCurveTo(190, -50, 188, -38); ctx.lineTo(184, -34); ctx.closePath();
        const lg = ctx.createLinearGradient(0, -95, 0, -34); lg.addColorStop(0, '#e6533f'); lg.addColorStop(0.5, '#c0392b'); lg.addColorStop(1, '#7c2119');
        ctx.fillStyle = lg; ctx.fill(); ctx.strokeStyle = '#4a130e'; ctx.lineWidth = 1.3; ctx.stroke();
        ctx.save(); ctx.clip();
        ctx.fillStyle = '#f3f3f0'; ctx.fillRect(-20, -52, 210, 6); ctx.fillStyle = '#2b2f36'; ctx.fillRect(-20, -46, 210, 3);
        ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(-20, -93, 210, 4);
        ctx.restore();
        /* parbriz + geam lateral cabină */
        ctx.beginPath(); ctx.moveTo(158, -88); ctx.lineTo(171, -88); ctx.lineTo(182, -64); ctx.lineTo(166, -64); ctx.closePath();
        const wg = ctx.createLinearGradient(158, -88, 182, -64); wg.addColorStop(0, '#1b2a3d'); wg.addColorStop(1, '#6b8bab'); ctx.fillStyle = wg; ctx.fill();
        ctx.beginPath(); Art.roundRectPath(ctx, 140, -86, 16, 20, 3); ctx.fill();
        ctx.beginPath(); Art.roundRectPath(ctx, -12, -86, 12, 20, 3); ctx.fillStyle = '#2a3b50'; ctx.fill();
        /* uși și grilaje */
        ctx.strokeStyle = 'rgba(60,15,10,0.8)'; ctx.lineWidth = 1; Art.roundRectPath(ctx, 124, -88, 13, 50, 2); ctx.stroke(); Art.roundRectPath(ctx, 2, -88, 13, 50, 2); ctx.stroke();
        for (const gx of [24, 62, 96]) { ctx.fillStyle = 'rgba(40,10,8,0.55)'; Art.roundRectPath(ctx, gx, -86, 24, 26, 2); ctx.fill(); ctx.strokeStyle = 'rgba(255,200,190,0.25)'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(gx + 2, -83 + k * 4); ctx.lineTo(gx + 22, -83 + k * 4); ctx.stroke(); } }
        /* faruri, tampoane */
        ctx.fillStyle = '#fff5d6'; ctx.beginPath(); ctx.arc(185, -44, 3, 0, TAU); ctx.fill();
        ctx.fillStyle = '#2a2d33'; ctx.fillRect(186, -40, 8, 5); ctx.fillRect(-26, -40, 10, 5);
        ctx.fillStyle = '#25282e'; ctx.fillRect(-14, -34, 196, 6);
        /* boghiuri cu roți (pozițiile vechi ale roților) */
        bogie(ctx, 31, wheelAng, 14, '#33373e'); bogie(ctx, 133, wheelAng, 14, '#33373e');
        ctx.restore();
      }

      function frame(dt, t) {
        const U = api.unit, F = Art.labelSize(U), LB = Art.LABEL_BG;
        if (mode === 'loc') {
          /* fizică simplă (neschimbată) */
          const acc = brake ? -9 : thr * 5.5;
          v = clamp(v + (acc - v * 0.012 * (1 + v * 0.01)) * dt * 6, 0, 180);
          if (brake && v < 0.3) v = 0;
          dist += v * dt * 2.2; wheelAng += v * dt * 0.09;
          const pw = brake ? -v * 12 : thr * 5200 * (1 - v / 220);
          energy = clamp(energy + pw * dt / 3600, -1e9, 1e9);
          const W = api.W, H = api.H, gy = api.cy + U * 0.55;
          const FW = api.freeW, sc = clamp(Math.min(FW / 600, U / 215), 0.5, 1.7), tx = FW * 0.62;
          /* cer + dealuri îndepărtate (parallax lent) */
          const sg = ctx.createLinearGradient(0, 0, 0, gy); sg.addColorStop(0, Art.SCENE.day[0]); sg.addColorStop(1, Art.SCENE.day[1]); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
          const hills = (amp, f, par, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, gy); for (let x = 0; x <= W + 20; x += 16) { const X = x + dist * par; ctx.lineTo(x, gy - amp * (0.55 + 0.3 * Math.sin(X * f) + 0.15 * Math.sin(X * f * 3.1 + 2))); } ctx.lineTo(W, gy); ctx.closePath(); ctx.fill(); };
          hills(U * 0.5, 0.004, 0.05, '#a9bdcd'); hills(U * 0.26, 0.009, 0.15, '#93b08b');
          ctx.fillStyle = '#86a874'; ctx.fillRect(0, gy, W, H - gy);
          /* terasament, traverse, șine */
          ctx.fillStyle = '#9a9387'; ctx.beginPath(); ctx.moveTo(0, gy - 2 * sc); ctx.lineTo(W, gy - 2 * sc); ctx.lineTo(W, gy + 16 * sc); ctx.lineTo(0, gy + 16 * sc); ctx.closePath(); ctx.fill();
          const sp = 22 * sc; for (let x = -((dist * 1.0) % sp); x < W; x += sp) { ctx.fillStyle = '#6a5640'; ctx.fillRect(x, gy + 2 * sc, 13 * sc, 5 * sc); }
          ctx.fillStyle = '#5b616b'; ctx.fillRect(0, gy - 1 * sc, W, 4 * sc); ctx.fillStyle = '#d5dae1'; ctx.fillRect(0, gy - 1 * sc, W, 1.2 * sc);
          /* catenara: stâlpi, fir purtător, pendule, fir de contact */
          const wy = gy + WIRE * sc, my = wy - 22 * sc, per = 320 * sc, x0 = -((dist * 1.0) % per) - per;
          for (let x = x0; x < W + per; x += per) {
            ctx.fillStyle = '#7d858f'; ctx.fillRect(x - 3 * sc, my - 14 * sc, 6 * sc, gy - my + 14 * sc);
            ctx.fillStyle = '#5e656e'; ctx.fillRect(x - 3 * sc, my - 12 * sc, 34 * sc, 3 * sc);
            ctx.strokeStyle = '#4a5058'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + 30 * sc, my - 10 * sc); ctx.lineTo(x + 30 * sc, wy); ctx.stroke();
            ctx.strokeStyle = '#3a3f46'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + 30 * sc, my - 10 * sc); ctx.quadraticCurveTo(x + 30 * sc + per / 2, my + 14 * sc, x + 30 * sc + per, my - 10 * sc); ctx.stroke();
            for (let k = 1; k < 6; k++) { const u = k / 6, dx = x + 30 * sc + per * u, dyy = my - 10 * sc + 4 * u * (1 - u) * 24 * sc * 0.5 * 2; ctx.beginPath(); ctx.moveTo(dx, dyy); ctx.lineTo(dx, wy); ctx.stroke(); }
          }
          ctx.strokeStyle = '#1f2328'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, wy); ctx.lineTo(W, wy); ctx.stroke();
          /* tren */
          Art.groundShadow(ctx, tx - 70 * sc, gy + 2 * sc, 270 * sc, 6 * sc, 0.3);
          const powered = thr > 0.05 && !brake && v > 1;
          drawLoco(tx, gy - 1 * sc, sc, powered, t);
          /* diagrama fluxului de energie (sus-stânga) */
          const dx0 = 12, dy0 = api.cy - U + 6, bw = Math.min(api.freeW - 24, Math.max(320, U * 1.6)), bh = F * (bw < 470 ? 4.4 : 3.9);
          Art.panel(ctx, dx0, dy0, bw, bh, { r: 12 });
          const small = bw < 470;
          const names = ['Fir de contact', 'Pantograf', 'Transformator', 'Motoare', 'Roți'], nodes = names.map((n, i) => dx0 + F * 3.4 + (bw - F * 6.8) * i / 4);
          flow += dt * (brake ? -1 : 1) * Math.min(1, (thr * (brake ? 0 : 1) + (brake ? Math.min(1, v / 60) : 0)) * 1.2) * 1.2;
          const ly = dy0 + bh * 0.36;
          ctx.strokeStyle = '#4a5a88'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(nodes[0], ly); ctx.lineTo(nodes[4], ly); ctx.stroke();
          const active = brake ? v > 1 : thr > 0.02;
          if (active) for (let i = 0; i < 14; i++) { const u = (((i / 14 + flow * 0.35) % 1) + 1) % 1; ctx.fillStyle = brake ? '#7dffb0' : '#ffd166'; ctx.beginPath(); ctx.arc(lerp(nodes[0], nodes[4], u), ly, 3.4, 0, TAU); ctx.fill(); }
          names.forEach((n, i) => { ctx.fillStyle = '#c9d6ff'; ctx.beginPath(); ctx.arc(nodes[i], ly, 6.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a3460'; ctx.beginPath(); ctx.arc(nodes[i], ly, 3, 0, TAU); ctx.fill(); Art.text(ctx, n, nodes[i], ly + F * (small && i % 2 ? 2.05 : 1.15), { size: Math.max(12, F * 0.8), halo: false }); });
          Art.text(ctx, Math.round(v) + ' km/h', dx0 + 4, dy0 + bh + F * 1.7, { size: F * 2, weight: 800, align: 'left' });
          info.innerHTML = '<b>Putere:</b> ' + (brake ? 'recuperează ' + fmt(Math.max(0, v * 12), 0) + ' kW (înapoi în rețea)' : fmt(Math.max(0, pw), 0) + ' kW (din rețea)') + ' · <b>Distanță:</b> ' + fmt(dist / 1000 * 3, 1) + ' km';
        } else {
          Art.scene(ctx, api.W, api.H, 'lab');
          const cx = api.cx, cy = api.cy, R0 = U * 0.28, lam = 0.45;
          if (!dragging) { const target = curve ? 0.55 : 0; offV += (-(off - target) * 14 - offV * 3.2) * dt; off += offV * dt; }
          wt += dt;
          const gauge = U * 1.0;                                         // distanța dintre șine
          const ox = off * U * 0.35;
          const railY = cy + R0 * 1.05;
          /* traversă + piatră */
          ctx.fillStyle = '#5a5248'; ctx.beginPath(); ctx.moveTo(cx - gauge / 2 - U * 0.45, railY + U * 0.2); ctx.lineTo(cx + gauge / 2 + U * 0.45, railY + U * 0.2); ctx.lineTo(cx + gauge / 2 + U * 0.6, railY + U * 0.42); ctx.lineTo(cx - gauge / 2 - U * 0.6, railY + U * 0.42); ctx.closePath(); ctx.fill();
          ctx.beginPath(); Art.roundRectPath(ctx, cx - gauge / 2 - U * 0.32, railY + U * 0.085, gauge + U * 0.64, U * 0.09, U * 0.015); Art.volumeFill(ctx, 0, railY + U * 0.085, 0, railY + U * 0.175, '#a49e94', { hi: 0.2 });
          /* șinele în secțiune (ciupercă, inimă, talpă) */
          const rail = (x) => { const hw = U * 0.04; ctx.beginPath(); ctx.moveTo(x - hw, railY + U * 0.005); ctx.quadraticCurveTo(x - hw, railY - U * 0.005, x - hw * 0.7, railY - U * 0.005); ctx.lineTo(x + hw * 0.7, railY - U * 0.005); ctx.quadraticCurveTo(x + hw, railY - U * 0.005, x + hw, railY + U * 0.005); ctx.lineTo(x + hw, railY + U * 0.03); ctx.lineTo(x + hw * 0.3, railY + U * 0.04); ctx.lineTo(x + hw * 0.3, railY + U * 0.07); ctx.lineTo(x + hw * 1.6, railY + U * 0.078); ctx.lineTo(x + hw * 1.6, railY + U * 0.088); ctx.lineTo(x - hw * 1.6, railY + U * 0.088); ctx.lineTo(x - hw * 1.6, railY + U * 0.078); ctx.lineTo(x - hw * 0.3, railY + U * 0.07); ctx.lineTo(x - hw * 0.3, railY + U * 0.04); ctx.lineTo(x - hw, railY + U * 0.03); ctx.closePath(); Art.volumeFill(ctx, x - hw, railY, x + hw, railY + U * 0.09, '#9aa1ab', { hi: 0.4 }); ctx.strokeStyle = Art.ink('#9aa1ab'); ctx.lineWidth = Art.lineW(U); ctx.stroke(); ctx.fillStyle = '#e2e6ec'; ctx.fillRect(x - hw * 0.7, railY - U * 0.005, hw * 1.4, 2); };
          rail(cx - gauge / 2); rail(cx + gauge / 2);
          /* osie + roți conice: raza crește spre buză (spre interior) */
          const rL = R0 * (1 + lam * (-ox / U) * 0.9), rR = R0 * (1 + lam * (ox / U) * 0.9);
          const wl = cx - gauge / 2 + ox, wr = cx + gauge / 2 + ox, wW = U * 0.13;
          const wheel = (x, r, dir) => {       // dir = 1: buza spre dreapta (roata stângă)
            const ay = railY - r, xi = x + dir * wW * 0.55, xo = x - dir * wW * 0.45;
            const rOut = r * 0.86;               // marginea exterioară are rază mai mică (con)
            ctx.beginPath(); ctx.moveTo(xo, ay - rOut); ctx.lineTo(xi, ay - r); ctx.lineTo(xi, ay - r - U * 0.0); ctx.lineTo(xi + dir * U * 0.025, ay - r * 1.0); ctx.lineTo(xi + dir * U * 0.025, railY + U * 0.03); ctx.quadraticCurveTo(xi, railY + U * 0.035, xi, railY); ctx.lineTo(xo, ay + rOut); ctx.closePath();
            const g = ctx.createLinearGradient(0, ay - r, 0, ay + r); g.addColorStop(0, '#6f7782'); g.addColorStop(0.3, '#d4d9e0'); g.addColorStop(0.55, '#a3abb6'); g.addColorStop(1, '#4a515b'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = Art.ink('#a3abb6'); ctx.lineWidth = Art.lineW(U) * 1.2; ctx.stroke();
            ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(30,34,40,0.3)'; ctx.lineWidth = 1; for (let k = 0; k < 8; k++) { const ph = (k / 8 + wt * 0.4) % 1, yy = ay - Math.cos(ph * Math.PI) * r; ctx.beginPath(); ctx.moveTo(xo, yy); ctx.lineTo(xi + dir * U * 0.03, yy); ctx.stroke(); } ctx.restore();
            ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(lerp(xo, xi, 0.5), railY, U * 0.008, 0, TAU); ctx.fill();
            return { x: (xo + xi) / 2, ay: ay, top: ay - r };
          };
          /* osia (se înclină puțin dacă razele diferă) */
          const aL = railY - rL, aR = railY - rR;
          ctx.save(); ctx.lineCap = 'round';
          ctx.strokeStyle = '#3c424c'; ctx.lineWidth = U * 0.075; ctx.beginPath(); ctx.moveTo(wl - wW * 0.6, aL); ctx.lineTo(wr + wW * 0.6, aR); ctx.stroke();
          const ag = ctx.createLinearGradient(0, Math.min(aL, aR) - U * 0.03, 0, Math.max(aL, aR) + U * 0.03); ag.addColorStop(0, '#e6ebf1'); ag.addColorStop(0.5, '#9aa3af'); ag.addColorStop(1, '#4d545f'); ctx.strokeStyle = ag; ctx.lineWidth = U * 0.06; ctx.beginPath(); ctx.moveTo(wl - wW * 0.6, aL); ctx.lineTo(wr + wW * 0.6, aR); ctx.stroke();
          ctx.restore();
          const WL = wheel(wl, rL, 1), WR = wheel(wr, rR, -1);
          Art.label(ctx, 'osie', cx + ox, (aL + aR) / 2 - U * 0.09, { size: F, bg: LB });
          Art.label(ctx, 'roată', WL.x - wW, WL.ay, { size: F, bg: LB, align: 'right' }); Art.label(ctx, 'roată', WR.x + wW, WR.ay, { size: F, bg: LB, align: 'left' });
          /* diametre */
          const topMin = Math.min(WL.top, WR.top);
          Art.text(ctx, 'diametru: ' + fmt(rL / R0 * 100, 0) + '%', WL.x, topMin - U * 0.06, { size: F });
          Art.text(ctx, 'diametru: ' + fmt(rR / R0 * 100, 0) + '%', WR.x, topMin - U * 0.06, { size: F });
          /* săgeți: care roată avansează mai mult */
          const ab = topMin - U * 0.12;
          Art.arrow(ctx, WL.x, ab, WL.x, ab - U * 0.11 * rL / R0, { color: '#7dffb0', width: Math.max(4, U * 0.018) });
          Art.arrow(ctx, WR.x, ab, WR.x, ab - U * 0.11 * rR / R0, { color: '#7dffb0', width: Math.max(4, U * 0.018) });
          const steer = rR - rL;
          Art.text(ctx, Math.abs(off) < 0.03 ? 'osia e centrată: roți egale ✓' : (steer > 0 ? 'roata dreaptă e mai rapidă → osia virează la stânga' : 'roata stângă e mai rapidă → osia virează la dreapta'), cx, cy - U * 0.85, { size: api.W < 500 ? Math.max(13, F * 0.9) : F * 1.05, color: '#ffd166' });
          Art.text(ctx, curve ? 'în curbă: osia se ia singură după șine' : 'trage osia lateral cu degetul', cx, cy - U * 0.85 + F * 1.6, { size: Math.max(12, F * 0.9), color: 'rgba(255,255,255,0.75)' });
        }
      }
      return { frame: frame };
    }
  });
})();
