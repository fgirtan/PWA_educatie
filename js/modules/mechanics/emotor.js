/* Modul: Motorul electric */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }

  /* ============================================================
     2) MOTORUL ELECTRIC (curent continuu, cu comutator)
     ============================================================ */
  defineModule({
    id: 'emotor', title: 'Motorul electric', sub: 'Magneți + curent = mișcare',
    start: function (api) {
      const ctx = api.ctx;
      let V = 0.7, phi = 0.5, w = 0, commut = true, rev = 1, turns = 2, fan = true, powered = true;
      const r1 = api.row('');
      api.slider(r1, { label: 'Tensiunea bateriei', min: 0, max: 1, step: 0.01, value: V, fmt: (v) => fmt(v * 12, 1) + ' V', onInput: (v) => { V = v; } });
      api.slider(r1, { label: 'Spire în bobină', min: 1, max: 5, step: 1, value: turns, fmt: (v) => v + (v === 1 ? ' spiră' : ' spire'), onInput: (v) => { turns = v; } });
      const r2 = api.row('');
      const bC = api.button(r2, '🔁 Comutator: ACTIV', () => { commut = !commut; bC.innerHTML = commut ? '🔁 Comutator: ACTIV' : '🚫 Comutator: ELIMINAT'; api.say(commut ? '<b>Comutatorul</b> inversează curentul din bobină la fiecare jumătate de tură, așa că forța împinge mereu în același sens — bobina se învârte continuu.' : 'Fără comutator, curentul nu se inversează: bobina se rotește doar până la poziția verticală, oscilează și se oprește!', 10000); });
      api.button(r2, '🔄 Inversează bateria', () => { rev = -rev; api.say('Curentul merge acum invers, deci și forța se schimbă: motorul se învârte în <b>celălalt sens</b>.', 7000); });
      const bF = api.button(r2, '🌀 Ventilator: DA', () => { fan = !fan; bF.innerHTML = fan ? '🌀 Ventilator: DA' : '🌀 Ventilator: NU'; });
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Într-un câmp magnetic, un fir prin care trece curent este <b>împins lateral</b>. Bobina are curent într-o parte „în sus” și în cealaltă „în jos”, deci cele două forțe o <b>răsucesc</b>. Comutatorul schimbă sensul curentului la timp, ca bobina să continue să se rotească.', 15000);
      function frame(dt, t) {
        bg(api, '#0c1330', '#05080f');
        const cx = api.cx, cy = api.cy - api.unit * 0.15, U = api.unit, R = U * 0.55;
        /* mișcarea: cuplu ∝ curent × cos φ (φ = unghiul planului bobinei față de câmp) */
        const Vv = V * 12, cur = (commut ? Math.sign(Math.cos(phi)) || 1 : 1) * rev * Vv;
        const torque = cur * Math.cos(phi) * turns * 0.0045;
        const emf = commut ? Math.abs(w) * 0.0008 * turns : 0;
        w += (torque * 900 - w * 0.9) * dt; w = clamp(w, -60, 60);
        if (Math.abs(Vv) < 0.05) w *= 0.97;
        phi += w * dt;
        /* magneți N / S */
        const mw = U * 0.5, mh = U * 1.05;
        ctx.fillStyle = '#d83a3a'; rrect(ctx, cx - R - mw - 14, cy - mh / 2, mw, mh, 8); ctx.fill();
        ctx.fillStyle = '#3a6ad8'; rrect(ctx, cx + R + 14, cy - mh / 2, mw, mh, 8); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '800 ' + Math.round(U * 0.26) + 'px system-ui,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('N', cx - R - mw / 2 - 14, cy + U * 0.1); ctx.fillText('S', cx + R + mw / 2 + 14, cy + U * 0.1);
        /* linii de câmp N→S */
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = -3; i <= 3; i++) { const y = cy + i * U * 0.13; ctx.beginPath(); ctx.moveTo(cx - R - 14, y); ctx.lineTo(cx + R + 14, y); ctx.stroke(); const ax = cx + ((t * 40 + i * 30) % (2 * R + 28)) - R - 14; ctx.beginPath(); ctx.moveTo(ax + 7, y); ctx.lineTo(ax - 3, y - 4); ctx.lineTo(ax - 3, y + 4); ctx.fill(); }
        /* bobina, văzută din capăt: două capete la ±R·0.8 */
        const ex = Math.cos(phi) * R * 0.78, ey = Math.sin(phi) * R * 0.78;
        const out = (cur * 1) > 0;                     // sensul curentului în capătul din dreapta
        ctx.strokeStyle = '#c98a3a'; ctx.lineWidth = 3 + turns * 1.5; ctx.beginPath(); ctx.moveTo(cx - ex, cy - ey); ctx.lineTo(cx + ex, cy + ey); ctx.stroke();
        ctx.fillStyle = '#0c1330'; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, 7); ctx.fill();
        const sym = (x, y, o) => { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#0a1226'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fillStyle = o ? '#7dffb0' : '#ff9a7a'; ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#0a1226'; ctx.lineWidth = 2.5; if (o) { ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fillStyle = '#0a1226'; ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke(); } };
        const o2 = cur > 0;
        sym(cx + ex, cy + ey, o2); sym(cx - ex, cy - ey, !o2);
        /* forțele pe fire: perpendicular pe câmp (vertical), ∝ curent */
        const F = (x, y, dirUp) => { const len = clamp(Math.abs(cur) * 4 + 8, 8, 70) * (Math.abs(cur) < 0.05 ? 0 : 1); if (!len) return; const s = dirUp ? -1 : 1; ctx.strokeStyle = '#ffd166'; ctx.fillStyle = '#ffd166'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + s * len); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y + s * (len + 12)); ctx.lineTo(x - 8, y + s * len); ctx.lineTo(x + 8, y + s * len); ctx.fill(); };
        F(cx + ex, cy + ey + (o2 ? -16 : 16), !o2); F(cx - ex, cy - ey + (o2 ? 16 : -16), o2);
        /* comutator (jos): inel despicat + perii */
        const kx = cx, ky = cy + R + U * 0.5, kr = U * 0.17;
        ctx.save(); ctx.translate(kx, ky); ctx.rotate(phi);
        ctx.lineWidth = 12; ctx.strokeStyle = '#d2a14e'; ctx.beginPath(); ctx.arc(0, 0, kr, 0.18, Math.PI - 0.18); ctx.stroke();
        ctx.strokeStyle = commut ? '#8aa0c8' : '#d2a14e'; ctx.beginPath(); ctx.arc(0, 0, kr, Math.PI + 0.18, Math.PI * 2 - 0.18); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#333'; ctx.fillRect(kx - kr - 22, ky - 6, 22, 12); ctx.fillRect(kx + kr, ky - 6, 22, 12);
        ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.fillText('comutator', kx, ky + kr + 22);
        /* ventilator pe ax */
        if (fan) { const fx = Math.min(api.freeW - 44, kx + kr + 90), fy = ky; ctx.save(); ctx.translate(fx, fy); ctx.rotate(phi); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.fillStyle = 'rgba(120,200,255,0.8)'; ctx.beginPath(); ctx.ellipse(0, -26, 9, 24, 0, 0, 7); ctx.fill(); } ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.fill(); ctx.restore(); }
        const rpm = Math.abs(w) / (2 * Math.PI) * 60;
        info.innerHTML = '<b>Viteza:</b> ' + fmt(rpm, 0) + ' rot/min · <b>Sens:</b> ' + (Math.abs(w) < 0.4 ? 'oprit' : w * rev > 0 ? '↻' : '↺') + (commut ? '' : ' · <i>fără comutator oscilează</i>');
      }
      return { frame: frame };
    }
  });
})();
