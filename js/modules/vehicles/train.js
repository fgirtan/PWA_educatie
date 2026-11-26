/* Modul: Trenul */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }

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
      function drawLoco(x, y, s, sc) {
        ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
        const body = (bx, bw, col) => { ctx.fillStyle = col; rrect(ctx, bx, -64, bw, 52, 8); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#9fd6f0'; for (let i = 0; i < Math.floor(bw / 36); i++) ctx.fillRect(bx + 10 + i * 36, -54, 24, 18); };
        /* vagoane */
        body(-330, 150, '#3a6ab8'); body(-170, 150, '#3a6ab8');
        ctx.fillStyle = '#555'; ctx.fillRect(-182, -34, 16, 6);
        /* locomotiva */
        ctx.fillStyle = '#c0392b'; rrect(ctx, -20, -70, 190, 58, 14); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#9fd6f0'; rrect(ctx, 120, -62, 36, 26, 5); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(0, -50, 100, 8);
        ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(166, -26, 5, 0, 7); ctx.fill();
        /* pantograf */
        ctx.strokeStyle = '#222'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40, -70); ctx.lineTo(60, -98); ctx.lineTo(40, -126); ctx.stroke(); ctx.beginPath(); ctx.moveTo(30, -126); ctx.lineTo(70, -126); ctx.stroke();
        /* roți */
        const wheel = (wx) => { ctx.save(); ctx.translate(wx, -8); ctx.rotate(wheelAng); ctx.fillStyle = '#2a2f3d'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.fill(); ctx.strokeStyle = '#9aa3b2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.moveTo(0, -18); ctx.lineTo(0, 18); ctx.stroke(); ctx.restore(); };
        [10, 52, 112, 154, -300, -258, -140, -98].forEach(wheel);
        ctx.restore();
      }
      function frame(dt, t) {
        if (mode === 'loc') {
          /* fizică simplă */
          const acc = brake ? -9 : thr * 5.5;
          v = clamp(v + (acc - v * 0.012 * (1 + v * 0.01)) * dt * 6, 0, 180);
          if (brake && v < 0.3) v = 0;
          dist += v * dt * 2.2; wheelAng += v * dt * 0.09;
          const pw = brake ? -v * 12 : thr * 5200 * (1 - v / 220);
          energy = clamp(energy + pw * dt / 3600, -1e9, 1e9);
          const W = api.W, H = api.H, gy = api.cy + api.unit * 0.55;
          bg(api, '#2c6aa8', '#bfe3f5');
          /* munți îndepărtați */
          ctx.fillStyle = '#6a8fb0'; ctx.beginPath(); ctx.moveTo(0, gy); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, gy - 50 - 40 * Math.sin((x + dist * 0.12) * 0.012) - 20 * Math.sin((x + dist * 0.12) * 0.03)); ctx.lineTo(W, gy); ctx.fill();
          ctx.fillStyle = '#4c8a3c'; ctx.fillRect(0, gy, W, H - gy);
          ctx.fillStyle = '#6a5a48'; ctx.fillRect(0, gy + 2, W, 12);
          ctx.fillStyle = '#3b3b3b'; ctx.fillRect(0, gy + 4, W, 3);
          ctx.fillStyle = '#7a6a54'; for (let i = 0; i < 40; i++) { const x = ((i * 36 - dist * 1.0) % (W + 72) + W + 72) % (W + 72) - 36; ctx.fillRect(x, gy + 6, 14, 6); }
          /* stâlpi + fir de contact */
          const wy = gy - 190;
          ctx.strokeStyle = '#222'; ctx.lineWidth = 3;
          for (let i = 0; i < 6; i++) { const x = ((i * 320 - dist * 1.0) % (W + 640) + W + 640) % (W + 640) - 200; ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, wy - 14); ctx.moveTo(x - 30, wy - 6); ctx.lineTo(x + 30, wy - 6); ctx.stroke(); }
          ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, wy); ctx.lineTo(W, wy); ctx.stroke();
          /* tren */
          const FW = api.freeW, sc = clamp(FW / 560, 0.55, 1.15), tx = FW * 0.62;
          drawLoco(tx, gy, v, sc);
          /* scânteie la pantograf */
          if (thr > 0.05 && !brake && v > 1) { ctx.fillStyle = 'rgba(160,220,255,0.9)'; ctx.fillRect(tx + (60 - 4) * sc, wy - 3 + (Math.random() - 0.5) * 2, 8, 6); }
          /* diagrama fluxului de energie (sus-stânga) */
          const dx0 = 16, dy0 = api.cy - api.unit + 6, bw = Math.min(api.freeW - 32, 360), bh = 54;
          ctx.fillStyle = 'rgba(8,14,34,0.82)'; rrect(ctx, dx0, dy0, bw, bh + 10, 10); ctx.fill();
          const names = ['Fir de contact', 'Pantograf', 'Transformator', 'Motoare', 'Roți'], nodes = names.map((n, i) => dx0 + 24 + (bw - 48) * i / 4);
          flow += dt * (brake ? -1 : 1) * Math.min(1, (thr * (brake ? 0 : 1) + (brake ? Math.min(1, v / 60) : 0)) * 1.2 + 0.0) * 1.2;
          ctx.strokeStyle = '#4a5a88'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(nodes[0], dy0 + 22); ctx.lineTo(nodes[4], dy0 + 22); ctx.stroke();
          const active = brake ? v > 1 : thr > 0.02;
          if (active) for (let i = 0; i < 14; i++) { const u = (((i / 14 + flow * 0.35) % 1) + 1) % 1; ctx.fillStyle = brake ? '#7dffb0' : '#ffd166'; ctx.beginPath(); ctx.arc(lerp(nodes[0], nodes[4], u), dy0 + 22, 3.2, 0, 7); ctx.fill(); }
          names.forEach((n, i) => { ctx.fillStyle = '#c9d6ff'; ctx.beginPath(); ctx.arc(nodes[i], dy0 + 22, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(n, nodes[i], dy0 + 46); });
          ctx.fillStyle = '#fff'; ctx.font = '800 28px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(Math.round(v) + ' km/h', 16, dy0 + bh + 44);
          info.innerHTML = '<b>Putere:</b> ' + (brake ? 'recuperează ' + fmt(Math.max(0, v * 12), 0) + ' kW (înapoi în rețea)' : fmt(Math.max(0, pw), 0) + ' kW (din rețea)') + ' · <b>Distanță:</b> ' + fmt(dist / 1000 * 3, 1) + ' km';
        } else {
          bg(api, '#0c1330', '#05080f');
          const W = api.W, cx = api.cx, U = api.unit, cy = api.cy, R0 = U * 0.28, lam = 0.45;
          if (!dragging) { const target = curve ? 0.55 : 0; offV += (-(off - target) * 14 - offV * 3.2) * dt; off += offV * dt; }
          wt += dt;
          const gauge = U * 1.0;                                         // distanța dintre șine
          const ox = off * U * 0.35;
          /* șine (secțiune) */
          const railY = cy + R0 * 1.05, railW = 22;
          ctx.fillStyle = '#8a8f99'; ctx.fillRect(cx - gauge / 2 - railW / 2, railY, railW, 16); ctx.fillRect(cx + gauge / 2 - railW / 2, railY, railW, 16);
          ctx.fillStyle = '#5a4a38'; ctx.fillRect(cx - gauge / 2 - 70, railY + 16, gauge + 140, 14);
          /* osie + roți conice (în secțiune): raza crește spre interior */
          const rL = R0 * (1 + lam * (-ox / U) * 0.9), rR = R0 * (1 + lam * (ox / U) * 0.9);
          const wheelShape = (x, r, dir) => { ctx.fillStyle = '#3c4258'; ctx.strokeStyle = '#a0a8c0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - dir * 10, cy + R0 * 1.05 - (r - R0 * 0.2)); ctx.lineTo(x - dir * 10 + dir * 46, cy + R0 * 1.05 - (r - R0 * 0.2) * 0.7 - R0 * 0.1); ctx.lineTo(x - dir * 10 + dir * 46, cy + R0 * 1.05); ctx.lineTo(x - dir * 10, cy + R0 * 1.05); ctx.closePath(); ctx.fill(); ctx.stroke(); };
          const wl = cx - gauge / 2 + ox, wr = cx + gauge / 2 + ox;
          wheelShape(wl - 4, rL, 1); wheelShape(wr + 4, rR, -1);
          ctx.strokeStyle = '#c9a56b'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(wl + 40, railY - 26); ctx.lineTo(wr - 40, railY - 26); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('roată', wl + 22, railY + 40); ctx.fillText('roată', wr - 22, railY + 40); ctx.fillText('osie', cx + ox, railY - 38);
          /* diametre */
          ctx.fillText('diametru: ' + fmt(rL / R0 * 100, 0) + '%', wl + 22, railY - 70); ctx.fillText('diametru: ' + fmt(rR / R0 * 100, 0) + '%', wr - 22, railY - 70);
          /* săgeți: care roată avansează mai mult */
          const arr = (x, len, col) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, railY - 100); ctx.lineTo(x, railY - 100 - len); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, railY - 100 - len - 12); ctx.lineTo(x - 8, railY - 100 - len); ctx.lineTo(x + 8, railY - 100 - len); ctx.fill(); };
          arr(wl + 22, 30 * rL / R0, '#7dffb0'); arr(wr - 22, 30 * rR / R0, '#7dffb0');
          const steer = rR - rL;
          ctx.fillStyle = '#ffd166'; ctx.font = '700 ' + (api.W < 500 ? 12 : 14) + 'px system-ui,sans-serif'; ctx.fillText(Math.abs(off) < 0.03 ? '✅ osia e centrată: roți egale' : (steer > 0 ? 'roata dreaptă e mai rapidă → osia virează la stânga' : 'roata stângă e mai rapidă → osia virează la dreapta'), cx, cy - U * 0.85);
          ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '600 12px system-ui,sans-serif'; ctx.fillText(curve ? 'în curbă: osia se ia singură după șine' : 'trage osia lateral cu degetul', cx, cy - U * 0.85 + 22);
        }
      }
      return { frame: frame };
    }
  });
})();
