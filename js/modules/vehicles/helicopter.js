/* Modul: Elicopterul */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  defineModule({
    id: 'helicopter', title: 'Elicopterul', sub: 'Cum stă pe loc în aer și de ce are o elice mică în coadă',
    start: function (api) {
      const ctx = api.ctx; let pow = 0.5, alt = 0.35, vy = 0, tilt = 0, tiltT = 0, tail = true, yaw = 0, yawV = 0, scroll = 0, ph = 0, vx = 0;
      const r = api.row('');
      const ps = api.slider(r, { label: 'Puterea rotorului', min: 0, max: 1, step: 0.01, value: pow, fmt: (v) => v < 0.05 ? 'oprit' : v < 0.47 ? 'coboară ⬇️' : v > 0.53 ? 'urcă ⬆️' : 'stă pe loc ⏸️', onInput: (v) => { pow = v; } });
      const r2 = api.row('');
      const bf = api.button(r2, '⬅️ Zboară înainte', () => { tiltT = tiltT ? 0 : 1; bf.classList.toggle('on', !!tiltT); api.say(tiltT ? 'Ca să meargă înainte, elicopterul <b>își apleacă rotorul</b> în față. Aerul e împins în jos și puțin în spate, așa că elicopterul merge înainte.' : MSG); });
      const bt = api.button(r2, '🔧 Oprește elicea din coadă', () => { tail = !tail; bt.classList.toggle('on', !tail); bt.innerHTML = tail ? '🔧 Oprește elicea din coadă' : '🔧 Pornește elicea din coadă'; api.say(tail ? 'Elicea din coadă împinge coada în lateral și <b>oprește corpul să se învârtă</b>. Uite, acum stă drept.' : '<b>Vai!</b> Rotorul mare se învârte într-o parte, iar corpul elicopterului începe să se învârtă <b>în partea cealaltă</b> (acțiune și reacțiune). De aceea e nevoie de elicea mică din coadă!'); });
      api.button(r2, '⏸️ Stai pe loc', () => { pow = 0.5; ps.set(0.5); tiltT = 0; bf.classList.remove('on'); });
      const MSG = 'Elicea mare de deasupra (<b>rotorul</b>) are pale care sunt ca niște <b>aripi care se învârt</b>. Ele împing aerul în jos, iar aerul împinge elicopterul în sus. Dacă împingerea e cât greutatea, elicopterul <b>stă pe loc în aer</b>, lucru pe care un avion nu-l poate face!';
      api.say(MSG);
      return {
        frame: function (dt, t) {
          const lift = pow * 2, acc = (lift - 1) * 6; vy += acc * dt; vy *= Math.exp(-1.6 * dt); alt = clamp(alt + vy * dt, 0, 1); if (alt <= 0 && vy < 0) vy = 0; if (alt >= 1 && vy > 0) vy = 0;
          tilt = A.damp(tilt, tiltT * 0.22, 3, dt); vx = A.damp(vx, alt > 0.05 ? tilt * 3 : 0, 2, dt); scroll += vx * dt * 300;
          if (!tail && pow > 0.1) yawV += dt * pow * 1.6; yawV *= Math.exp(-(tail ? 3 : 0.3) * dt); yaw += yawV * dt; if (tail) yaw = A.damp(yaw, Math.round(yaw / TAU) * TAU, 2, dt);
          ph += dt * pow * 40;
          const g = ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, '#4f97e0'); g.addColorStop(1, '#d6ecfb'); ctx.fillStyle = g; ctx.fillRect(0, 0, api.W, api.H);
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          for (let i = 0; i < 4; i++) A.cloud(ctx, ((i * 330 - scroll * 0.3) % 1300 + 1300) % 1300 - 150, 70 + (i % 2) * 50, 40);
          /* sol cu copaci */
          const gy = 540; ctx.fillStyle = '#6aa84f'; ctx.fillRect(-500, gy, 2000, 200); ctx.fillStyle = '#8a8a8a'; ctx.fillRect(-500, gy, 2000, 6);
          for (let i = 0; i < 9; i++) { const x = ((i * 170 - scroll) % 1530 + 1530) % 1530 - 260; window.Creatures.draw('tree', ctx, x, gy, 70 + (i % 3) * 20, t, { seed: i }); }
          ctx.fillStyle = '#ffd84a'; const hx = ((500 - scroll) % 3000 + 3000) % 3000 - 1000; ctx.beginPath(); ctx.ellipse(hx, gy + 3, 70, 10, 0, 0, TAU); ctx.fill(); A.text(ctx, 'H', hx, gy + 3, { size: 14, color: '#333', halo: false });
          const cx = 480, cy = lerp(gy - 62, 170, alt);
          /* aerul împins în jos */
          if (pow > 0.05) for (let i = 0; i < 14; i++) { const u = ((t * (0.8 + pow) + i / 14) % 1); const x = cx - 150 + (i * 23) % 300 + tilt * 120 * u, y = cy - 50 + u * 260; A.arrow(ctx, x, y, x + tilt * 30, y + 26, { color: 'rgba(255,255,255,' + 0.5 * (1 - u) * pow + ')', width: 2 }); }
          if (alt < 0.15 && pow > 0.3) for (let i = 0; i < 10; i++) { const u = ((t * 1.5 + i / 10) % 1); ctx.fillStyle = 'rgba(200,190,150,' + 0.4 * (1 - u) + ')'; ctx.beginPath(); ctx.arc(cx + (i % 2 ? 1 : -1) * (60 + u * 200), gy - 6 - Math.sin(u * 3) * 10, 8 + u * 10, 0, TAU); ctx.fill(); }
          A.groundShadow(ctx, cx, gy + 4, 130 * (1 - alt * 0.5), 12, 0.35 * (1 - alt * 0.6));
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(-tilt);
          const sx = Math.cos(yaw);                                   // corpul se rotește (văzut din lateral: se îngustează)
          ctx.save(); ctx.scale(Math.abs(sx) < 0.15 ? 0.15 * Math.sign(sx || 1) : sx, 1);
          /* coada */
          ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(40, -20); ctx.lineTo(230, -14); ctx.lineTo(230, -2); ctx.lineTo(40, 10); ctx.fill(); ctx.beginPath(); ctx.moveTo(215, -14); ctx.lineTo(240, -55); ctx.lineTo(250, -55); ctx.lineTo(236, -4); ctx.fill();
          /* elicea din coadă */
          if (tail) { for (let i = 0; i < 2; i++) { const a = ph * 1.6 + i * Math.PI; ctx.strokeStyle = '#333'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(240 - Math.cos(a) * 0, -30); ctx.lineTo(240 + Math.cos(a) * 0, -30 + Math.sin(a) * 26); ctx.lineTo(240, -30 - Math.sin(a) * 26); ctx.stroke(); } ctx.fillStyle = 'rgba(60,60,70,0.18)'; ctx.beginPath(); ctx.arc(240, -30, 27, 0, TAU); ctx.fill(); }
          /* corpul */
          const bg = ctx.createLinearGradient(0, -70, 0, 40); bg.addColorStop(0, '#ff6a5a'); bg.addColorStop(1, '#a8281e'); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(-110, 0); ctx.bezierCurveTo(-110, -70, -20, -75, 50, -55); ctx.quadraticCurveTo(80, -40, 70, 0); ctx.quadraticCurveTo(40, 35, -60, 32); ctx.quadraticCurveTo(-110, 28, -110, 0); ctx.fill();
          ctx.fillStyle = '#9fd6f0'; ctx.beginPath(); ctx.moveTo(-104, -6); ctx.bezierCurveTo(-100, -55, -55, -62, -30, -58); ctx.lineTo(-30, -6); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-70, -40, 16, 7, -0.4, 0, TAU); ctx.fill();
          ctx.strokeStyle = '#333'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-80, 30); ctx.lineTo(-90, 52); ctx.moveTo(30, 28); ctx.lineTo(40, 52); ctx.moveTo(-120, 52); ctx.lineTo(70, 52); ctx.stroke();
          ctx.restore();
          ctx.fillStyle = '#444'; ctx.fillRect(-6, -90, 12, 22);
          /* rotorul mare */
          const R = 220; ctx.fillStyle = 'rgba(40,40,50,' + 0.15 * clamp(pow * 2, 0, 1) + ')'; ctx.beginPath(); ctx.ellipse(0, -92, R, 14, 0, 0, TAU); ctx.fill();
          for (let i = 0; i < 4; i++) { const a = ph + i * TAU / 4, x = Math.cos(a) * R; ctx.strokeStyle = 'rgba(30,30,40,' + (pow > 0.6 ? 0.45 : 0.9) + ')'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, -92); ctx.lineTo(x, -92 + Math.sin(a) * 10); ctx.stroke(); }
          ctx.restore();
          /* săgețile de forțe */
          const lf = pow * 120, w0 = 60; A.arrow(ctx, cx - 150, cy - 40, cx - 150 - tilt * 80, cy - 40 - lf, { color: '#7dffb0', width: 6 }); A.text(ctx, 'împingerea rotorului', cx - 150, cy - 60 - lf, { size: 15, color: '#1a5a3a', halo: false });
          A.arrow(ctx, cx + 150, cy + 20, cx + 150, cy + 20 + w0, { color: '#ff5a6a', width: 6 }); A.text(ctx, 'greutatea', cx + 150, cy + 40 + w0, { size: 15, color: '#8a1a2a', halo: false });
          /* vedere de sus: rotația rotorului și a corpului */
          const ix = 860, iy = 470, ir = 80; ctx.fillStyle = 'rgba(10,15,35,0.75)'; A.roundRectPath(ctx, ix - 110, iy - 115, 220, 225, 14); ctx.fill();
          A.text(ctx, 'văzut de sus', ix, iy - 98, { size: 14 });
          ctx.save(); ctx.translate(ix, iy + 5); ctx.rotate(-yaw * (tail ? 0 : 1)); ctx.fillStyle = '#c0392b'; ctx.fillRect(0, -5, ir * 0.95, 10); ctx.beginPath(); ctx.ellipse(-8, 0, 28, 20, 0, 0, TAU); ctx.fill(); if (tail) A.arrow(ctx, ir * 0.95, -6, ir * 0.95, -32, { color: '#7dffb0', width: 3 }); ctx.restore();
          for (let i = 0; i < 4; i++) { const a = ph * 0.3 + i * TAU / 4; ctx.strokeStyle = 'rgba(30,30,40,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ix, iy + 5); ctx.lineTo(ix + Math.cos(a) * ir, iy + 5 + Math.sin(a) * ir); ctx.stroke(); }
          A.arrow(ctx, ix + ir * 0.7, iy - 65, ix + ir * 0.95, iy - 30, { color: '#ffe36a', width: 3, bend: -0.2 });
          A.text(ctx, tail ? 'corpul stă drept ✅' : 'corpul se învârte! 🌀', ix, iy + 100, { size: 14, color: tail ? '#7dffb0' : '#ffb0b8' });
          A.label(ctx, 'Înălțime: ' + Math.round(alt * 500) + ' m', 140, 90, { size: 16 });
          ctx.restore();
        }
      };
    }
  });
})();
