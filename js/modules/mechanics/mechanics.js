/* Modul: Mecanisme */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }

  /* ============================================================
     4) MECANISME: roți dințate și pârghii
     ============================================================ */
  defineModule({
    id: 'mechanics', title: 'Mecanisme', sub: 'Roți dințate și pârghii',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'gears', nA = 12, nB = 24, nC = 8, rpm = 0.6, thA = 0, mL = 4, mR = 2, fulc = 0.5, tilt = 0, vT = 0;
      const bs = {};
      const rm = api.row('');
      [['gears', '⚙️ Roți dințate'], ['lever', '⚖️ Pârghie']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rg = api.row(''), rl = api.row('');
      api.slider(rg, { label: 'Viteza roții din stânga', min: -2, max: 2, step: 0.05, value: rpm, fmt: (v) => fmt(v) + ' ture/s', onInput: (v) => { rpm = v; } });
      api.slider(rg, { label: 'Dinți roata 2', min: 6, max: 36, step: 1, value: nB, fmt: (v) => v + ' dinți', onInput: (v) => { nB = v; } });
      api.slider(rg, { label: 'Dinți roata 3', min: 6, max: 36, step: 1, value: nC, fmt: (v) => v + ' dinți', onInput: (v) => { nC = v; } });
      api.slider(rl, { label: 'Greutatea din stânga', min: 1, max: 10, step: 1, value: mL, fmt: (v) => v + ' kg', onInput: (v) => { mL = v; } });
      api.slider(rl, { label: 'Greutatea din dreapta', min: 1, max: 10, step: 1, value: mR, fmt: (v) => v + ' kg', onInput: (v) => { mR = v; } });
      api.slider(rl, { label: 'Poziția reazemului', min: 0.15, max: 0.85, step: 0.01, value: fulc, fmt: (v) => v < 0.45 ? 'spre stânga' : v > 0.55 ? 'spre dreapta' : 'la mijloc', onInput: (v) => { fulc = v; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; rl.appendChild(info);
      const MSG = { gears: 'Roțile dințate își transmit mișcarea. <b>Două roți care se ating se rotesc în sensuri opuse.</b> O roată mică învârte una mare încet, dar cu mai multă forță (ca la bicicletă, la viteze). Schimbă numărul de dinți!', lever: 'Pârghia echilibrează greutăți: contează <b>greutatea × distanța</b> până la reazem. O greutate mică, departe de reazem, poate ridica una mare, aproape de reazem. Încearcă să o echilibrezi!' };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rg.style.display = m === 'gears' ? '' : 'none'; rl.style.display = m === 'lever' ? '' : 'none'; api.say(MSG[m], 14000); api.layout(); }
      function gear(x, y, n, rad, th, col, label) {
        const hole = rad * 0.2, tooth = rad * 0.22, pitch = Math.PI * 2 / n;
        ctx.save(); ctx.translate(x, y); ctx.rotate(th);
        ctx.beginPath();
        for (let k = 0; k < n; k++) { const a = k * pitch; const r0 = rad - tooth * 0.5, r1 = rad + tooth * 0.5; ctx.lineTo(Math.cos(a - pitch * 0.28) * r0, Math.sin(a - pitch * 0.28) * r0); ctx.lineTo(Math.cos(a - pitch * 0.16) * r1, Math.sin(a - pitch * 0.16) * r1); ctx.lineTo(Math.cos(a + pitch * 0.16) * r1, Math.sin(a + pitch * 0.16) * r1); ctx.lineTo(Math.cos(a + pitch * 0.28) * r0, Math.sin(a + pitch * 0.28) * r0); }
        ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(0, 0, rad * 0.62, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.moveTo(Math.cos(k * 1.5708) * hole, Math.sin(k * 1.5708) * hole); ctx.lineTo(Math.cos(k * 1.5708) * rad * 0.58, Math.sin(k * 1.5708) * rad * 0.58); } ctx.stroke();
        ctx.fillStyle = '#0a1226'; ctx.beginPath(); ctx.arc(0, 0, hole, 0, 7); ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label + ' · ' + n + ' dinți', x, y + rad + 22);
      }
      function frame(dt, t) {
        bg(api, '#0b1330', '#05080f');
        const W = api.freeW, cx = api.cx, cy = api.cy, U = api.unit;
        if (mode === 'gears') {
          thA += rpm * Math.PI * 2 * dt;
          const m = Math.min(U * 0.12, (W - 30) / ((nA + nB + nC) * 0.5 + 8) * 0.5);        // „modulul”: raza = m·n/2
          const rA = m * nA / 2, rB = m * nB / 2, rC = m * nC / 2, gap = m * 0.0;
          const total = rA * 2 + rB * 2 + rC * 2, x0 = cx - total / 2 + rA, xB = x0 + rA + rB, xC = xB + rB + rC;
          const thB = Math.PI + Math.PI / nB - thA * nA / nB, thC = Math.PI + Math.PI / nC - thB * nB / nC;
          gear(x0, cy, nA, rA, thA, '#e8a23a', 'Roata 1');
          gear(xB, cy, nB, rB, thB, '#4aa3e0', 'Roata 2');
          gear(xC, cy, nC, rC, thC, '#7dd486', 'Roata 3');
          const w2 = -rpm * nA / nB, w3 = -w2 * nB / nC;
          ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '600 13px system-ui,sans-serif';
          ctx.fillText('↻ roata 1: ' + fmt(rpm, 2) + ' ture/s', 12, 84); ctx.fillText('roata 2: ' + fmt(w2, 2) + ' ture/s (' + (w2 * rpm < 0 ? 'sens opus' : 'același sens') + ')', 12, 102); ctx.fillText('roata 3: ' + fmt(-w3 * -1, 2) + ' ture/s', 12, 120);
          ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(nB > nA ? 'Roata 2 are mai mulți dinți → merge mai încet, dar mai cu forță.' : nB < nA ? 'Roata 2 are mai puțini dinți → merge mai repede, dar cu mai puțină forță.' : 'Același număr de dinți → aceeași viteză.', 12, 140);
        } else {
          const bw = Math.min(W - 40, U * 3), x0 = cx - bw / 2, py = cy + U * 0.35;
          const fx = x0 + bw * fulc;
          const tL = mL * (fx - x0) / bw, tR = mR * (x0 + bw - fx) / bw;      // momente (kg × fracție din bară)
          const target = clamp((tR - tL) * 0.55, -0.35, 0.35);
          vT += (target - tilt) * 40 * dt; vT *= Math.exp(-dt * 6); tilt += vT * dt;
          ctx.fillStyle = '#6b5a45'; ctx.beginPath(); ctx.moveTo(fx, py); ctx.lineTo(fx - 26, py + 56); ctx.lineTo(fx + 26, py + 56); ctx.closePath(); ctx.fill();
          ctx.save(); ctx.translate(fx, py); ctx.rotate(tilt);
          ctx.fillStyle = '#c9a56b'; ctx.fillRect(x0 - fx, -8, bw, 16);
          ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (let k = 1; k < 10; k++) ctx.fillRect(x0 - fx + bw * k / 10 - 1, -8, 2, 6);
          const wt = (x, mass, col) => { const s = 22 + mass * 3; ctx.fillStyle = col; ctx.fillRect(x - s / 2, -8 - s, s, s); ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(mass + ' kg', x, -8 - s / 2 + 4); };
          wt(x0 - fx + bw * 0.12, mL, '#e8683a'); wt(x0 - fx + bw * 0.88, mR, '#3a8ee8');
          ctx.restore();
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '600 12px system-ui,sans-serif';
          const dL = (fx - (x0 + bw * 0.12)) / bw * 10, dR = ((x0 + bw * 0.88) - fx) / bw * 10;
          info.innerHTML = 'Stânga: <b>' + mL + ' kg × ' + fmt(dL, 1) + '</b> = ' + fmt(mL * dL, 1) + ' · Dreapta: <b>' + mR + ' kg × ' + fmt(dR, 1) + '</b> = ' + fmt(mR * dR, 1) + (Math.abs(mL * dL - mR * dR) < 0.5 ? ' · ✅ <b>echilibru!</b>' : mL * dL > mR * dR ? ' · se lasă spre stânga' : ' · se lasă spre dreapta');
        }
      }
      setMode('gears');
      return { frame: frame };
    }
  });
})();
