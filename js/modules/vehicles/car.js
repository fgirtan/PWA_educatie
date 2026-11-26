/* Modul: Mașina */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y, x + r, y); ctx.closePath(); }

  /* ============================================================
     3) MAȘINA
     ============================================================ */
  defineModule({
    id: 'car', title: 'Mașina', sub: 'Motor, cutie de viteze și frâne',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'drive', thr = 0.3, gear = 1, v = 0, dist = 0, rpm = 900, wheelA = 0, gearA = 0;
      let pedal = 0.6, bspeed = 100, heat = 0, dots = 0, braking = false, bv = 0, bdist = 0;
      const bs = {};
      const rm = api.row('');
      [['drive', '🚗 Motor și viteze'], ['brake', '🛑 Frânele']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rd = api.row(''), rb = api.row('');
      api.slider(rd, { label: 'Accelerația (pedala din dreapta)', min: 0, max: 1, step: 0.01, value: thr, fmt: (x) => Math.round(x * 100) + '%', onInput: (x) => { thr = x; } });
      const gb = {};
      ['N', 1, 2, 3, 4, 5].forEach((g) => { gb[g] = api.button(rd, 'Viteza ' + g, () => { gear = g === 'N' ? 0 : g; Object.keys(gb).forEach((k) => gb[k].classList.toggle('on', (k === 'N' ? 0 : +k) === gear)); if (gear > 0) api.say('<b>Viteza ' + gear + '.</b> ' + (gear === 1 ? 'Raport mare: multă forță, puțină viteză — bună la pornire.' : gear >= 4 ? 'Raport mic: viteză mare cu motorul în turații mici — economisești benzină.' : 'Un compromis între forță și viteză.'), 6000); else api.say('<b>Punctul mort.</b> Motorul nu e legat de roți: mașina nu e împinsă.', 4000); }); });
      gb[1].classList.add('on');
      const infoD = document.createElement('div'); infoD.className = 'mod-readout'; rd.appendChild(infoD);
      api.slider(rb, { label: 'Cât de tare apeși pedala de frână', min: 0, max: 1, step: 0.01, value: pedal, fmt: (x) => Math.round(x * 100) + '%', onInput: (x) => { pedal = x; } });
      [50, 100, 130].forEach((s) => api.button(rb, s + ' km/h', () => { bspeed = s; bv = s / 3.6; bdist = 0; braking = false; heat = 0; }));
      const bBr = api.button(rb, '🛑 Frânează!', () => { if (!braking) { braking = true; bv = bspeed / 3.6; bdist = 0; } else { braking = false; } });
      const infoB = document.createElement('div'); infoB.className = 'mod-readout'; rb.appendChild(infoB);
      const MSG = { drive: 'Motorul învârte roțile prin <b>cutia de viteze</b>. Viteza 1 = forță mare, viteză mică; viteza 5 = viteză mare. Apasă accelerația și schimbă vitezele la timp: dacă turația ajunge în zona roșie, motorul „țipă”!', brake: 'Când apeși pedala, lichidul din conducte transmite presiunea până la <b>plăcuțele</b> care strâng discul. Forța se <b>multiplică</b> de zeci de ori. Apasă „Frânează!” ca să vezi distanța de oprire.' };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rd.style.display = m === 'drive' ? '' : 'none'; rb.style.display = m === 'brake' ? '' : 'none'; api.say(MSG[m], 14000); api.layout(); }
      const RAT = [0, 3.6, 2.1, 1.4, 1.0, 0.8], FINAL = 3.7, RW = 0.3;
      function gauge(x, y, r, val, max, label, red, unit) {
        ctx.fillStyle = 'rgba(8,14,34,0.95)'; ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 7); ctx.fill(); ctx.strokeStyle = '#8aa0c8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0.75 * Math.PI, 2.25 * Math.PI); ctx.stroke();
        if (red) { ctx.strokeStyle = '#e8453a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, r - 5, (0.75 + 1.5 * red / max) * Math.PI, 2.25 * Math.PI); ctx.stroke(); }
        const a = (0.75 + 1.5 * clamp(val / max, 0, 1)) * Math.PI; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * (r - 8), y + Math.sin(a) * (r - 8)); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '700 12px system-ui,sans-serif'; ctx.fillText(Math.round(val) + ' ' + unit, x, y + r * 0.55); ctx.font = '600 10px system-ui,sans-serif'; ctx.fillText(label, x, y - r * 0.35);
      }
      function gearPair(x, y, s, angle, ratio) {
        const r1 = 17 * s, r2 = r1 * ratio, drawG = (gx, gy, r, a, n, col) => { ctx.save(); ctx.translate(gx, gy); ctx.rotate(a); ctx.fillStyle = col; ctx.beginPath(); for (let k = 0; k < n; k++) { const t = k / n * Math.PI * 2, p = Math.PI / n; ctx.lineTo(Math.cos(t - p * 0.5) * r, Math.sin(t - p * 0.5) * r); ctx.lineTo(Math.cos(t - p * 0.3) * (r + 6), Math.sin(t - p * 0.3) * (r + 6)); ctx.lineTo(Math.cos(t + p * 0.3) * (r + 6), Math.sin(t + p * 0.3) * (r + 6)); ctx.lineTo(Math.cos(t + p * 0.5) * r, Math.sin(t + p * 0.5) * r); } ctx.closePath(); ctx.fill(); ctx.fillStyle = '#0b1330'; ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, 7); ctx.fill(); ctx.restore(); };
        drawG(x, y, r1, angle, 12, '#e8a23a'); drawG(x + r1 + r2 + 6, y, r2, -angle / ratio * (12 / Math.max(6, Math.round(12 * ratio))) , Math.max(6, Math.round(12 * ratio)), '#4aa3e0');
      }
      function frame(dt, t) {
        const U = api.unit, W = api.freeW;
        if (mode === 'drive') {
          /* fizică simplificată */
          const ratio = RAT[gear], rawRpm = ratio ? v / (2 * Math.PI * RW) * 60 * ratio * FINAL : 0;
          const targetRpm = gear === 0 ? 900 + thr * 5500 : Math.max(900, rawRpm + thr * 0);
          rpm += (Math.max(targetRpm, gear === 0 ? 900 + thr * 5500 : 900) - rpm) * Math.min(1, dt * 8);
          if (gear > 0) rpm = Math.max(900, rawRpm);
          const torque = gear === 0 ? 0 : 220 * clamp(1 - Math.pow((rpm - 4200) / 4600, 2), 0.1, 1) * thr * (rpm > 6500 ? 0 : 1) * (rawRpm < 900 ? 0.6 : 1);
          const F = gear === 0 ? 0 : torque * ratio * FINAL / RW * 0.9;
          const drag = 0.5 * 1.2 * 0.7 * 2.2 * v * v + 150, a = (F - (v > 0.1 ? drag : 0) - (gear === 0 ? 0 : 0)) / 1300;
          v = Math.max(0, v + a * dt * 3); dist += v * dt * 3; wheelA += v / RW * dt * 3; gearA += rpm / 60 * Math.PI * 2 * dt * 0.05;
          /* scenă */
          bg(api, '#2c6aa8', '#bfe3f5');
          const gy = api.cy + U * 0.35;
          ctx.fillStyle = '#6a8fb0'; ctx.beginPath(); ctx.moveTo(-W, gy); for (let x = -50; x <= W * 1.5; x += 20) ctx.lineTo(x, gy - 50 - 30 * Math.sin((x + dist * 6) * 0.01)); ctx.lineTo(W * 1.5, gy); ctx.fill();
          ctx.fillStyle = '#4c8a3c'; ctx.fillRect(-W, gy, W * 3, api.H); ctx.fillStyle = '#444'; ctx.fillRect(-W, gy + 4, W * 3, 36); ctx.fillStyle = '#fff'; for (let i = 0; i < 14; i++) ctx.fillRect(((i * 120 - dist * 18) % (W + 140) + W + 140) % (W + 140) - 60, gy + 20, 60, 4);
          /* mașina, cu „tăietură” */
          const cx = W * 0.5, cy = gy - 8, s = clamp(W / 460, 0.6, 1.15);
          ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
          ctx.fillStyle = '#d94034'; rrect(ctx, -110, -48, 220, 38, 12); ctx.fill(); rrect(ctx, -62, -86, 124, 44, 14); ctx.fill();
          ctx.fillStyle = '#9fd6f0'; ctx.fillRect(-52, -80, 44, 30); ctx.fillRect(2, -80, 44, 30);
          ctx.fillStyle = '#2a2f3d'; ctx.fillRect(-100, -30, 70, 20); ctx.fillStyle = '#e8a23a'; ctx.fillRect(-96, -26, 22, 12);
          ctx.fillStyle = '#8aa0c8'; ctx.fillRect(-30, -22, 60, 6); ctx.fillStyle = '#6a7390'; ctx.fillRect(-26, -34, 22, 16); ctx.fillRect(2, -34, 22, 16);
          ctx.strokeStyle = '#8aa0c8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(30, -19); ctx.lineTo(80, -19); ctx.stroke();
          const wheel = (wx) => { ctx.save(); ctx.translate(wx, -8); ctx.rotate(wheelA); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fill(); ctx.strokeStyle = '#9aa3b2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.stroke(); for (let k = 0; k < 5; k++) { ctx.rotate(Math.PI * 2 / 5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -13); ctx.stroke(); } ctx.restore(); };
          wheel(-66); wheel(72);
          ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('motor', -75, -34); ctx.fillText('cutie', 0, -38); ctx.fillText('arbore', 55, -24);
          ctx.restore();
          if (rpm > 6200) { ctx.fillStyle = 'rgba(255,60,60,' + (0.4 + 0.4 * Math.sin(t * 20)) + ')'; ctx.font = '700 15px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Turație prea mare! Schimbă viteza!', W / 2, api.cy - U * 0.7); }
          /* cutia de viteze: angrenaj mărit */
          if (gear > 0) { ctx.fillStyle = 'rgba(8,14,34,0.92)'; rrect(ctx, 12, api.cy - U + 8, 150, 100, 10); ctx.fill(); gearPair(34, api.cy - U + 58, 1.0, gearA, 0.7 + RAT[gear] * 0.35); ctx.fillStyle = '#fff'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('angrenaj viteza ' + gear + ' (raport ' + RAT[gear] + ')', 87, api.cy - U + 102); }
          gauge(W - 120, api.cy - U + 62, 44, rpm / 1000, 8, 'turație', 6.5, '×1000');
          gauge(W - 46, api.cy - U + 62, 38, v * 3.6, 200, 'viteză', 0, 'km/h');
          infoD.innerHTML = '<b>Turația:</b> ' + fmt(rpm, 0) + ' rot/min · <b>Viteza:</b> ' + fmt(v * 3.6, 0) + ' km/h · <b>Treapta:</b> ' + (gear || 'N');
        } else {
          /* frâne hidraulice */
          const mu = 0.8, g = 9.81, bf = pedal;
          if (braking) { const a = mu * g * bf; bv = Math.max(0, bv - a * dt * 2.2); bdist += bv * dt * 2.2; heat = clamp(heat + dt * bf * bv * 0.01, 0, 1); if (bv <= 0) { braking = false; } } else heat = Math.max(0, heat - dt * 0.2);
          const v0 = bspeed / 3.6, stopD = bf > 0.02 ? v0 * v0 / (2 * mu * g * bf) : Infinity;
          bg(api, '#10162b', '#05080f');
          const cx = W * 0.5, cy = api.cy - U * 0.05;
          /* pedală → pompă → conducte → piston */
          const px0 = W * 0.1, py0 = cy + U * 0.1;
          ctx.fillStyle = '#6a7390'; ctx.save(); ctx.translate(px0, py0); ctx.rotate(-0.4 + bf * 0.28); ctx.fillRect(-6, -70, 12, 80); ctx.fillStyle = '#d0d4e0'; ctx.fillRect(-18, -76, 36, 10); ctx.restore();
          ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('pedala', px0, py0 + 22);
          const mx = W * 0.22, my = cy + U * 0.0;
          ctx.fillStyle = '#394058'; rrect(ctx, mx, my - 12, 70, 24, 6); ctx.fill(); ctx.fillStyle = '#d9a64a'; ctx.fillRect(mx + 4 + bf * 18, my - 8, 56 - bf * 18, 16);
          ctx.fillStyle = '#fff'; ctx.fillText('pompa (cilindru mic)', mx + 35, my + 28);
          /* conducta cu lichid */
          const dx = W * 0.62, dy = cy;
          ctx.strokeStyle = '#d9a64a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(mx + 70, my); ctx.lineTo(dx - 60, my); ctx.stroke();
          ctx.fillStyle = '#ffe9a8'; for (let i = 0; i < 8; i++) { const u = ((t * 0.6 * bf * 3 + i / 8) % 1); ctx.beginPath(); ctx.arc(lerp(mx + 70, dx - 60, u), my, 3, 0, 7); ctx.fill(); }
          ctx.fillStyle = '#fff'; ctx.fillText('lichid de frână (nu se comprimă!)', (mx + 70 + dx - 60) / 2, my - 14);
          /* disc + etrier */
          const dr = U * 0.42, spin = braking ? bv / 8 : 7; dots += dt * spin * (1 - bf * 0.7);
          const hot = heat; ctx.save(); ctx.translate(dx, dy); ctx.rotate(dots);
          ctx.fillStyle = 'rgb(' + Math.round(150 + 105 * hot) + ',' + Math.round(155 - 85 * hot) + ',' + Math.round(170 - 150 * hot) + ')'; ctx.beginPath(); ctx.arc(0, 0, dr, 0, 7); ctx.fill();
          ctx.fillStyle = '#0b1330'; ctx.beginPath(); ctx.arc(0, 0, dr * 0.35, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 3; for (let k = 0; k < 10; k++) { ctx.beginPath(); ctx.arc(Math.cos(k * 0.628) * dr * 0.7, Math.sin(k * 0.628) * dr * 0.7, 6, 0, 7); ctx.stroke(); }
          ctx.restore();
          const gap = 14 - bf * 12;
          ctx.fillStyle = '#c0392b'; rrect(ctx, dx + dr * 0.55, dy - 40 - gap, 56, 22, 5); ctx.fill(); rrect(ctx, dx + dr * 0.55, dy + 18 + gap, 56, 22, 5); ctx.fill();
          ctx.fillStyle = '#3a3f55'; ctx.fillRect(dx + dr * 0.55 + 56, dy - 52 - gap, 14, 104 + gap * 2);
          ctx.fillStyle = '#fff'; ctx.fillText('plăcuțe', dx + dr * 0.55 + 28, dy - 52 - gap); ctx.fillText('disc', dx - dr * 0.1, dy + dr + 18);
          if (hot > 0.25) { ctx.fillStyle = 'rgba(255,120,40,' + hot * 0.7 + ')'; ctx.font = '700 12px system-ui,sans-serif'; ctx.fillText('disc încins: ' + Math.round(100 + hot * 500) + '°C', dx, dy - dr - 10); }
          /* multiplicare de forță */
          const mult = 4 * 6;
          ctx.fillStyle = '#ffd166'; ctx.font = '700 13px system-ui,sans-serif'; ctx.fillText('Forța ta ×' + mult + ' (pârghie ×4, pistoane ×6)', W / 2, api.cy - U + 22);
          /* distanța de oprire */
          const bw = Math.min(W - 40, 360), bx = (W - bw) / 2, by = api.cy + U * 0.62;
          ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(bx, by, bw, 14);
          const maxD = 140; ctx.fillStyle = '#e8453a'; ctx.fillRect(bx, by, bw * clamp(stopD / maxD, 0, 1), 14);
          if (braking || bdist > 0) { ctx.fillStyle = '#7dffb0'; ctx.fillRect(bx, by + 18, bw * clamp(bdist / maxD, 0, 1), 8); }
          ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '600 11px system-ui,sans-serif'; ctx.fillText('distanța de oprire de la ' + bspeed + ' km/h: ' + (isFinite(stopD) ? fmt(stopD, 0) + ' m' : '∞ (nu frânezi)'), bx, by - 6);
          infoB.innerHTML = '<b>Viteza:</b> ' + fmt(bv * 3.6, 0) + ' km/h · <b>Parcurs:</b> ' + fmt(bdist, 0) + ' m · la dublarea vitezei, distanța crește de <b>4 ori</b>!';
        }
      }
      setMode('drive');
      return { frame: frame };
    }
  });
})();
