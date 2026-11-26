/* Modul: Cum zboară avionul */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }

  /* ============================================================
     2) CUM ZBOARĂ AVIONUL
     ============================================================ */
  defineModule({
    id: 'airplane', title: 'Cum zboară avionul', sub: 'Aripa, aerul și forța care ridică',
    start: function (api) {
      const ctx = api.ctx;
      let aoa = 6, speed = 0.6, alt = 0.5, vy = 0, wind = [], clouds = [];
      const MASS = 0.42;                                    // „greutatea” (în unități de portanță)
      for (let i = 0; i < 5; i++) clouds.push({ x: Math.random(), y: Math.random() * 0.8, s: 0.6 + Math.random() });
      for (let i = 0; i < 90; i++) wind.push({ x: Math.random(), y: Math.random(), k: Math.random() });
      const r1 = api.row('');
      api.slider(r1, { label: 'Unghiul aripii (față de aer)', min: -4, max: 24, step: 0.5, value: aoa, fmt: (v) => fmt(v, 0) + '°', onInput: (v) => { aoa = v; } });
      api.slider(r1, { label: 'Viteza', min: 0, max: 1, step: 0.01, value: speed, fmt: (v) => Math.round(80 + v * 800) + ' km/h', onInput: (v) => { speed = v; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      api.say('Aripa e înclinată puțin și împinge aerul în jos; aerul o împinge în sus (<b>portanța</b>). Dacă avionul e prea încet, nu zboară. Dacă unghiul e prea mare, aerul se desprinde de aripă și avionul „pică” (<b>angajare</b>).', 14000);
      const CL = (a) => a < 15 ? 0.1 + 0.11 * (a + 2) : Math.max(0.2, (0.1 + 0.11 * 17) - (a - 15) * 0.22);
      let stallSaid = false;
      function frame(dt, t) {
        const W = api.W, H = api.H, cx = api.cx, cy = api.cy, U = api.unit;
        const v = 0.15 + speed, lift = CL(aoa) * v * v * 0.55, stall = aoa > 15;
        /* mișcare verticală: portanță − greutate */
        const acc = (lift - MASS) * 1.6;
        vy += acc * dt; vy *= Math.exp(-dt * 1.2); alt = clamp(alt + vy * dt * 0.25, 0, 1);
        if (alt <= 0 && vy < 0) vy = 0;
        if (stall && !stallSaid) { stallSaid = true; api.say('⚠️ <b>Angajare!</b> Unghiul e prea mare: aerul nu mai urmează aripa, se face vâltoare, iar portanța scade brusc.', 8000); }
        if (!stall) stallSaid = false;
        bg(api, alt > 0.7 ? '#1b3f7d' : '#3d85c8', alt > 0.7 ? '#4a86c4' : '#b9dcf5');
        /* scena e oglindită: avionul zboară spre dreapta, aerul trece spre stânga */
        ctx.save(); ctx.translate(2 * cx, 0); ctx.scale(-1, 1);
        /* nori și sol care se mișcă */
        for (const c of clouds) { c.x += dt * v * 0.35 * c.s; if (c.x > 1.2) { c.x = -0.2; c.y = Math.random() * 0.8; } ctx.fillStyle = 'rgba(255,255,255,0.7)'; const cx2 = c.x * W, cy2 = (c.y * 0.6 + 0.05 + (alt - 0.5) * 0.25) * H + 40; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(cx2 + k * 22, cy2 + (k % 2) * 6, 22 + (k % 3) * 6, 0, 7); ctx.fill(); } }
        const gy = cy + U * 0.9 + (0.5 - alt) * U * 0.5;
        if (alt < 0.2) { ctx.fillStyle = '#4c8a3c'; ctx.fillRect(-W, gy, W * 3, H - gy); ctx.fillStyle = '#555'; ctx.fillRect(-W, gy + 4, W * 3, 10); ctx.fillStyle = '#fff'; for (let i = 0; i < 12; i++) ctx.fillRect(((i * 110 + t * v * 260) % (W + 110) + W + 110) % (W + 110) - 40, gy + 8, 50, 2); }
        const py = cy - U * 0.05 + (0.5 - alt) * U * 0.45;
        /* aripa (profil) rotită cu unghiul */
        const chord = U * 1.25;
        ctx.save(); ctx.translate(cx, py); ctx.rotate(-aoa * Math.PI / 180);
        const airfoilY = (x, up) => { const q = x / chord + 0.5; const th = 0.14 * (0.2969 * Math.sqrt(Math.max(q, 0)) - 0.126 * q - 0.3516 * q * q + 0.2843 * q * q * q - 0.1015 * q * q * q * q); return (up ? -1 : 1) * th * chord * 3.4 - (up ? 0.0 : 0) - 0.02 * chord * (1 - q) * 0; };
        /* linii de curent: deviate de profil */
        ctx.restore();
        ctx.save(); ctx.translate(cx, py);
        const a = aoa * Math.PI / 180;
        const defl = (x, y0) => { const d = x / (chord * 0.55), bump = Math.exp(-d * d), fall = 1 - Math.min(1, Math.abs(y0) / (U * 0.7)); return Math.sin(a) * chord * 0.5 * d * bump * fall; };
        for (let i = -9; i <= 9; i++) {
          if (i === 0) continue;
          const y0 = i * U * 0.075;
          ctx.strokeStyle = stall && i < 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath();
          for (let x = -W; x <= W; x += 6) {
            const d = (x / (chord * 0.55)), bump = Math.exp(-d * d);
            let dy = y0 + (i > 0 ? 1 : -1) * 0; const sgn = y0 > 0 ? 1 : -1;
            let yy = y0 + (-sgn) * 0;
            const rot = -Math.sin(a) * x * 0.0 ;
            yy = y0 + defl(x, y0);
            if (stall && y0 < 0 && x > 0) yy += Math.sin(x * 0.05 + t * 12 + i) * 10 * Math.min(1, x / chord) * 1.2;
            if (stall && y0 > 0 && x > 0) yy -= bump * 6;
            x === -W ? ctx.moveTo(cx - cx + x, yy) : ctx.lineTo(x, yy);
          }
          ctx.stroke();
        }
        /* particule de aer care curg pe liniile de curent */
        ctx.fillStyle = '#fff';
        for (const w of wind) {
          w.x += dt * (0.3 + v * 1.3) * (0.7 + w.k * 0.6); if (w.x > 1.1) { w.x = -0.1; w.y = Math.random(); }
          const lx = (w.x - 0.5) * W * 1.1, y0 = (w.y - 0.5) * U * 1.5; if (Math.abs(y0) < U * 0.07) continue;
          const d = lx / (chord * 0.55), bump = Math.exp(-d * d), sgn = y0 > 0 ? 1 : -1;
          let yy = y0 + defl(lx, y0);
          if (stall && y0 < 0 && lx > 0) yy += Math.sin(lx * 0.05 + t * 12) * 10 * Math.min(1, lx / chord) * 1.2;
          ctx.fillRect(lx, yy, 3, 1.6);
        }
        /* aripa (rotită: unghi pozitiv = botul în sus) */
        ctx.save(); ctx.rotate(a);
        ctx.fillStyle = '#e8edf5'; ctx.strokeStyle = '#3a4150'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = -chord / 2; x <= chord / 2; x += 4) { const y = airfoilY(x, true); x === -chord / 2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        for (let x = chord / 2; x >= -chord / 2; x -= 4) ctx.lineTo(x, airfoilY(x, false) * 0.3);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        /* o linie de referință spre direcția aerului */
        ctx.strokeStyle = 'rgba(255,80,80,0.0)'; ctx.restore();
        ctx.restore();
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '700 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('avionul zboară spre dreapta →', cx, api.cy - api.unit + 14);
        /* săgeți de forță */
        const arrow = (x, y, dy, col, txt) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + dy); ctx.stroke(); const s = dy < 0 ? -1 : 1; ctx.beginPath(); ctx.moveTo(x, y + dy + s * 14); ctx.lineTo(x - 9, y + dy); ctx.lineTo(x + 9, y + dy); ctx.fill(); ctx.font = '700 13px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 14, y + dy / 2 + 4); };
        arrow(cx + U * 0.25, py, -lift * 280, '#7dffb0', 'Portanță');
        arrow(cx - U * 0.25, py, MASS * 280, '#ff7a8a', 'Greutate');
        ctx.fillStyle = '#fff'; ctx.font = '700 15px system-ui,sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('Altitudine: ' + fmt(alt * 12000, 0) + ' m', 14, 86);
        ctx.fillText('Unghi: ' + fmt(aoa, 0) + '°', 14, 106);
        info.innerHTML = lift > MASS * 1.04 ? '⬆️ <b>Urcă</b> (portanța > greutate)' : lift < MASS * 0.96 ? '⬇️ <b>Coboară</b> (portanța < greutate)' : '➡️ <b>Zbor orizontal</b>' ;
        if (stall) info.innerHTML += ' · <b style="color:#ff8a8a">angajare!</b>';
      }
      return { frame: frame };
    }
  });
})();
