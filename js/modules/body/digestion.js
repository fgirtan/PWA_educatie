/* Modul: Digestia */
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
     4) DIGESTIA
     ============================================================ */
  defineModule({
    id: 'digestion', title: 'Digestia', sub: 'Drumul unei mese prin corp',
    start: function (api) {
      const ctx = api.ctx;
      let u = 0, playing = false;
      const PTS = [[0, -0.88], [0, -0.5], [0.1, -0.4], [0.18, -0.3], [0.08, -0.24], [-0.18, -0.15], [0.18, -0.12], [0.18, -0.04], [-0.18, -0.01], [-0.18, 0.07], [0.18, 0.1], [0.18, 0.18], [-0.18, 0.21], [-0.18, 0.28], [-0.3, 0.3], [-0.3, -0.2], [0.3, -0.2], [0.3, 0.3], [0.0, 0.5], [0.0, 0.64]];
      const poly = mkPoly(PTS, false);
      const ST = [
        { n: 'Gura', a: 0, b: 0.05, h: 'câteva secunde', t: 'Dinții taie și macină mâncarea, iar saliva începe să descompună amidonul. Mestecă bine!' },
        { n: 'Esofagul', a: 0.05, b: 0.13, h: '~10 secunde', t: 'Un tub muscular de ~25 cm. Mușchii lui împing mâncarea în jos prin mișcări de val (peristaltism) — ai putea mânca și cu capul în jos!' },
        { n: 'Stomacul', a: 0.13, b: 0.27, h: '2–4 ore', t: 'Un sac muscular care amestecă mâncarea cu acid puternic. Acidul omoară microbii; un strat de mucus îl apără de propriul acid.' },
        { n: 'Intestinul subțire', a: 0.27, b: 0.6, h: '3–5 ore', t: 'Are ~6 metri! Aici trec nutrienții din mâncare în sânge, prin milioane de „degețele” mici (vilozități).' },
        { n: 'Intestinul gros', a: 0.6, b: 0.97, h: '10–60 de ore', t: 'Are ~1,5 metri. Absoarbe apa și sărurile, iar bacteriile bune de aici ne ajută. Ce rămâne iese din corp.' },
        { n: 'Afară', a: 0.97, b: 1.0, h: '—', t: 'Drumul complet durează 1–3 zile!' }
      ];
      const stOf = (x) => ST.findIndex((s) => x >= s.a && x < s.b) < 0 ? ST.length - 1 : ST.findIndex((s) => x >= s.a && x < s.b);
      let lastSt = -1;
      const r1 = api.row('');
      const bE = api.button(r1, '🍎 Mănâncă', () => { u = 0; playing = true; bE.innerHTML = '🍎 Mănâncă din nou'; lastSt = -1; });
      const sl = api.slider(r1, { label: 'Timpul după masă', min: 0, max: 1, step: 0.001, value: 0, fmt: () => timeText(), onInput: (v) => { u = v; playing = false; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      function timeText() {
        const i = stOf(u), s = ST[i]; if (i === 0) return fmt(u / 0.05 * 20, 0) + ' secunde'; if (i === 1) return fmt(20 + (u - 0.05) / 0.08 * 10, 0) + ' secunde';
        const hrs = i === 2 ? lerp(0, 3, (u - 0.13) / 0.14) : i === 3 ? 3 + lerp(0, 4, (u - 0.27) / 0.33) : 7 + lerp(0, 24, (u - 0.6) / 0.37);
        return hrs < 1 ? fmt(hrs * 60, 0) + ' minute' : fmt(hrs, 1) + ' ore';
      }
      api.say('Apasă <b>Mănâncă</b> și urmărește un măr pe tot drumul prin corp, sau trage de glisor. Atinge un organ ca să afli ce face.', 12000);
      api.pointer({ down: (x, y) => { const U = api.unit, mx = (x - api.cx) / U, my = (y - api.cy) / U; let best = 0, bd = 1e9; for (let i = 0; i < poly.pts.length; i++) for (let k = 0; k < 8; k++) { const q = polyAt(poly, (poly.cum[i] + (poly.cum[Math.min(i + 1, poly.cum.length - 1)] - poly.cum[i]) * k / 8) / poly.len); const d = Math.hypot(q.x - mx, q.y - my); if (d < bd) { bd = d; best = (poly.cum[i]) / poly.len; } } if (bd < 0.16) { const s = ST[stOf(best)]; api.say('<b>' + s.n + '</b> · ' + s.h + '. ' + s.t, 12000); } } });
      function frame(dt, t) {
        if (playing) { u = Math.min(1, u + dt * 0.045); sl.set(u); if (u >= 1) playing = false; }
        const U = api.unit, cx = api.cx, cy = api.cy, X = (x) => cx + x * U, Y = (y) => cy + y * U;
        bg(api, '#1a1020', '#0a0710');
        /* silueta corpului */
        ctx.fillStyle = 'rgba(255,200,170,0.08)'; ctx.beginPath(); ctx.ellipse(X(0), Y(-0.1), U * 0.55, U * 0.95, 0, 0, 7); ctx.fill();
        /* organe */
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const tube = (a, b, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for (let i = a; i <= b; i++) i === a ? ctx.moveTo(X(PTS[i][0]), Y(PTS[i][1])) : ctx.lineTo(X(PTS[i][0]), Y(PTS[i][1])); ctx.stroke(); };
        tube(1, 1, 1, 'transparent');
        ctx.strokeStyle = '#d98a8a'; ctx.lineWidth = U * 0.05; ctx.beginPath(); ctx.moveTo(X(0), Y(-0.8)); ctx.lineTo(X(0), Y(-0.5)); ctx.stroke();
        ctx.fillStyle = '#e07a7a'; ctx.beginPath(); ctx.ellipse(X(0), Y(-0.88), U * 0.1, U * 0.07, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#e8a090'; ctx.strokeStyle = '#a05050'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(X(0.12), Y(-0.37), U * 0.2, U * 0.13, 0.6, 0, 7); ctx.fill(); ctx.stroke();
        tube(4, 13, U * 0.05, '#e8a8a8'); tube(13, 14, U * 0.05, '#e8a8a8');
        tube(14, 19, U * 0.085, '#c98c60');
        /* mâncarea */
        const p = polyAt(poly, u), si = stOf(u);
        const foodCol = si === 0 ? '#e83a3a' : si === 1 ? '#d9563a' : si === 2 ? '#d8b88a' : si === 3 ? '#e8d4a8' : '#9a6a3a';
        if (si === 3 || si === 2) for (let i = 0; i < 6; i++) { const q = polyAt(poly, clamp(u - i * 0.012, 0, 1)); ctx.fillStyle = foodCol; ctx.beginPath(); ctx.arc(X(q.x), Y(q.y), U * 0.025 * (1 - i * 0.1), 0, 7); ctx.fill(); }
        ctx.fillStyle = foodCol; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), U * (si <= 1 ? 0.04 : si === 2 ? 0.055 : 0.035), 0, 7); ctx.fill(); ctx.stroke();
        /* nutrienți care trec în sânge (intestinul subțire) */
        if (si === 3) for (let i = 0; i < 10; i++) { const k = ((t * 0.8 + i / 10) % 1); ctx.fillStyle = 'rgba(255,90,100,' + (1 - k) + ')'; ctx.beginPath(); ctx.arc(X(p.x) + 0.12 * U * k * (i % 2 ? 1 : -1), Y(p.y) - 0.02 * U * k, 3, 0, 7); ctx.fill(); }
        if (si === 3) { ctx.fillStyle = '#ff8a94'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('nutrienți → sânge', X(0.3), Y(p.y)); }
        if (si === 4) { ctx.fillStyle = '#9fd8ff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('apa → sânge', X(0.34), Y(-0.1)); }
        /* etichete */
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'right';
        ctx.fillText('Gura', X(-0.15), Y(-0.86)); ctx.fillText('Esofag', X(-0.06), Y(-0.65)); ctx.fillText('Stomac', X(-0.1), Y(-0.37)); ctx.fillText('Intestin subțire', X(-0.34), Y(0.0)); ctx.textAlign = 'left'; ctx.fillText('Intestin gros', X(0.34), Y(0.3));
        if (si !== lastSt) { lastSt = si; if (playing) api.say('<b>' + ST[si].n + '</b> · ' + ST[si].h + '. ' + ST[si].t, 8000); }
        info.innerHTML = '<b>' + ST[si].n + '</b> · <b>' + timeText() + '</b> după masă' + (si === 3 ? ' · intestinul subțire are ~6 m' : '');
      }
      return { frame: frame };
    }
  });
})();
