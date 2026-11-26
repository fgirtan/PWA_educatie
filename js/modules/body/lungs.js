/* Modul: Plămânii și respirația */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  function polyAt(poly, u) {                       // poly: {pts, cum, len, closed}
    const d = clamp(u, 0, 1) * poly.len; let i = 1;
    while (i < poly.cum.length - 1 && poly.cum[i] < d) i++;
    const k = (d - poly.cum[i - 1]) / ((poly.cum[i] - poly.cum[i - 1]) || 1);
    return { x: lerp(poly.pts[i - 1][0], poly.pts[i][0], k), y: lerp(poly.pts[i - 1][1], poly.pts[i][1], k), i: i - 1 };
  }
  function mkPoly(pts, closed) {
    const P = pts.slice(); if (closed) P.push(pts[0]);
    const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    return { pts: P, cum: cum, len: cum[cum.length - 1] };
  }

  /* ============================================================
     2) RESPIRAȚIA
     ============================================================ */
  defineModule({
    id: 'lungs', title: 'Plămânii și respirația', sub: 'Cum intră aerul și cum iese dioxidul de carbon',
    start: function (api) {
      const ctx = api.ctx;
      let rate = 14, deep = 0.55, tt = 0, hold = false, holdT = 0, vol = 0, last = 0, parts = [];
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Ritmul respirației', min: 6, max: 50, step: 1, value: rate, fmt: (v) => v + ' resp./min', onInput: (v) => { rate = v; } });
      const r2 = api.row('Ce faci?');
      [['😴 Somn', 11, 0.45], ['🧍 Repaus', 15, 0.55], ['🏃 Alergare', 38, 0.95]].forEach(([t, v, d]) => api.button(r2, t, () => { rate = v; deep = d; sl.set(v); api.say('<b>' + t.slice(3) + '.</b> ' + (v > 30 ? 'Mușchii cer mult oxigen, deci respiri mai des și mai adânc.' : v < 12 ? 'În somn respirația e rară și liniștită.' : 'Un adult respiră în repaus de 12–20 de ori pe minut.'), 8000); }));
      const bH = api.button(r2, '🤐 Ține respirația', () => { hold = !hold; holdT = 0; bH.classList.toggle('on', hold); bH.innerHTML = hold ? '💨 Dă drumul' : '🤐 Ține respirația'; if (hold) api.say('Cât poți ține? Nu aerul care lipsește te face să respiri, ci <b>dioxidul de carbon</b> care se adună în sânge: creierul îți cere să dai drumul!', 10000); });
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Când tragi aer în piept, <b>diafragma</b> (un mușchi sub plămâni) coboară, iar coastele se ridică: plămânii se umflă și aerul intră. Apoi ele se relaxează și aerul iese. Atinge plămânii sau diafragma ca să afli mai multe!', 14000);
      api.pointer({ down: (x, y) => { const U = api.unit, cx = api.cx, cy = api.cy; if (y > cy + 0.35 * U && y < cy + 0.7 * U) api.say('<b>Diafragma.</b> Mușchiul cel mai important pentru respirație. Sughițul e o contracție bruscă a ei!', 9000); else if (y < cy - 0.35 * U && Math.abs(x - cx) < 0.12 * U) api.say('<b>Traheea.</b> Tubul prin care trece aerul, ~12 cm. Se împarte în două bronhii, câte una pentru fiecare plămân.', 9000); else if (Math.abs(x - cx) > 0.12 * U && Math.abs(x - cx) < 0.7 * U && y > cy - 0.55 * U) api.say('<b>Plămânii.</b> Au ~500 de milioane de alveole mici, ca niște baloane. Dacă le-am întinde, ar acoperi un teren de tenis!', 9000); } });
      function frame(dt, t) {
        const U = api.unit, cx = api.cx, cy = api.cy;
        bg(api, '#0d1626', '#05080f');
        if (!hold) tt += dt * rate / 60; else holdT += dt;
        const cyc = tt % 1, v = hold ? vol : (1 - Math.cos(cyc * 2 * Math.PI)) / 2;
        const prevVol = vol; vol = v; const inhaling = !hold && (v - prevVol) >= 0;
        const s = 0.88 + 0.22 * v * deep * 1.6;
        /* cușca toracică */
        ctx.strokeStyle = 'rgba(220,225,240,0.5)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        for (let i = 0; i < 6; i++) { const yy = cy - 0.45 * U + i * 0.1 * U - 0.03 * U * v * deep, w = (0.62 - Math.abs(i - 2) * 0.03) * U * (0.95 + 0.07 * v * deep); for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sg * 0.04 * U, yy - 0.05 * U); ctx.quadraticCurveTo(cx + sg * w, yy - 0.12 * U, cx + sg * w * 0.96, yy + 0.12 * U); ctx.stroke(); } }
        ctx.strokeStyle = 'rgba(220,225,240,0.5)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, cy - 0.55 * U); ctx.lineTo(cx, cy + 0.15 * U); ctx.stroke();
        /* plămâni */
        for (const sg of [-1, 1]) { const lx = cx + sg * 0.3 * U, ly = cy - 0.02 * U, rx = U * 0.24 * s, ry = U * 0.38 * s; const g = ctx.createRadialGradient(lx, ly - ry * 0.3, 4, lx, ly, ry); g.addColorStop(0, '#ffb0c0'); g.addColorStop(1, '#d9607a'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(lx, ly, rx, ry, sg * 0.1, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke(); }
        /* trahee + bronhii */
        ctx.strokeStyle = '#c9d6ee'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(cx, cy - 0.85 * U); ctx.lineTo(cx, cy - 0.3 * U); ctx.stroke();
        ctx.lineWidth = 6; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx, cy - 0.3 * U); ctx.lineTo(cx + sg * 0.18 * U, cy - 0.12 * U); ctx.lineTo(cx + sg * 0.26 * U, cy + 0.12 * U); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + sg * 0.18 * U, cy - 0.12 * U); ctx.lineTo(cx + sg * 0.36 * U, cy - 0.2 * U); ctx.moveTo(cx + sg * 0.22 * U, cy + 0.0); ctx.lineTo(cx + sg * 0.38 * U, cy + 0.08 * U); ctx.stroke(); ctx.lineWidth = 6; }
        /* diafragma */
        const dy = cy + 0.38 * U + 0.14 * U * v * deep * 1.4;
        ctx.fillStyle = 'rgba(190,80,70,0.85)'; ctx.beginPath(); ctx.moveTo(cx - 0.62 * U, dy + 0.1 * U); ctx.quadraticCurveTo(cx, dy - 0.2 * U, cx + 0.62 * U, dy + 0.1 * U); ctx.lineTo(cx + 0.62 * U, dy + 0.16 * U); ctx.quadraticCurveTo(cx, dy - 0.1 * U, cx - 0.62 * U, dy + 0.16 * U); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('diafragma', cx, dy + 0.34 * U); ctx.fillText('trahee', cx + 0.2 * U, cy - 0.7 * U); ctx.fillText('plămân', cx - 0.3 * U, cy - 0.02 * U); ctx.fillText('plămân', cx + 0.3 * U, cy - 0.02 * U);
        /* particule: O₂ (albastru) intră, CO₂ (portocaliu) iese */
        if (!hold && Math.random() < dt * 24) parts.push({ y: inhaling ? cy - 0.95 * U : cy - 0.2 * U, dir: inhaling ? 1 : -1, k: 0 });
        parts = parts.filter((p) => { p.y += p.dir * dt * U * 0.55; return p.y > cy - 1.0 * U && p.y < cy - 0.1 * U; });
        for (const p of parts) { ctx.fillStyle = p.dir > 0 ? '#9fd8ff' : '#ffb067'; ctx.beginPath(); ctx.arc(cx + Math.sin(p.y * 0.1) * 4, p.y, 4, 0, 7); ctx.fill(); }
        /* alveolă (zoom) */
        const ax = api.freeW - 78, ay = cy + 0.6 * U, ar = 46;
        ctx.fillStyle = 'rgba(8,14,34,0.95)'; ctx.beginPath(); ctx.arc(ax, ay, ar + 16, 0, 7); ctx.fill();
        ctx.strokeStyle = '#ffb0c0'; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(255,200,215,0.25)'; ctx.beginPath(); ctx.arc(ax, ay - 6, ar - 12, 0, 7); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#ff4d5a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(ax, ay + ar - 8, 30, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
        for (let i = 0; i < 6; i++) { const u = ((t * 0.7 + i / 6) % 1); ctx.fillStyle = '#9fd8ff'; ctx.beginPath(); ctx.arc(ax + (i - 2.5) * 8, lerp(ay - 14, ay + ar - 22, u), 2.6, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#fff'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('alveolă (mărită)', ax, ay - ar - 24); ctx.fillStyle = '#9fd8ff'; ctx.fillText('O₂ → sânge', ax, ay + ar + 10); ctx.fillStyle = '#ffb067'; ctx.fillText('CO₂ ← sânge', ax, ay + ar + 22);
        const co2 = hold ? clamp(holdT / 40, 0, 1) : clamp(0.08 + deep * 0.0, 0, 1);
        if (hold) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '700 22px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(fmt(holdT, 0) + ' s', 16, api.cy - U + 36); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(16, api.cy - U + 46, 120, 8); ctx.fillStyle = '#ffb067'; ctx.fillRect(16, api.cy - U + 46, 120 * co2, 8); ctx.font = '600 10px system-ui,sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText('CO₂ în sânge', 16, api.cy - U + 66); if (holdT > 25) { ctx.fillStyle = '#ff9a7a'; ctx.fillText('creierul îți cere aer!', 16, api.cy - U + 80); } }
        info.innerHTML = '<b>Aer pe respirație:</b> ~' + fmt(0.5 * (deep / 0.55), 1) + ' L · <b>Pe minut:</b> ~' + fmt(rate * 0.5 * (deep / 0.55), 0) + ' L · <b>Pe zi:</b> ~' + fmt(rate * 0.5 * 1440 * (deep / 0.55) / 1000, 0) + ' mii de litri';
      }
      return { frame: frame };
    }
  });
})();
