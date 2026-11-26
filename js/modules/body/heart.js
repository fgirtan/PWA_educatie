/* Modul: Inima și circulația */
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
     1) INIMA ȘI CIRCULAȚIA
     ============================================================ */
  defineModule({
    id: 'heart', title: 'Inima și circulația', sub: 'Cum ajunge sângele peste tot în corp',
    start: function (api) {
      const ctx = api.ctx;
      let bpm = 70, phase = 0, flowU = 0, ecg = [];
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Pulsul', min: 40, max: 200, step: 1, value: bpm, fmt: (v) => v + ' bătăi/min', onInput: (v) => { bpm = v; } });
      const r2 = api.row('Ce faci?');
      [['😴 Somn', 55, 'În somn inima bate mai rar: ~55 de bătăi pe minut. Corpul are nevoie de mai puțin oxigen.'], ['🧍 Repaus', 70, 'În repaus, inima unui adult bate de ~70 de ori pe minut. Copiii au pulsul mai rapid: 80–100.'], ['🚶 Mers', 100, 'La mers, mușchii cer mai mult oxigen, așa că inima pompează mai repede.'], ['🏃 Alergare', 160, 'La alergare, inima poate ajunge la 160–180 de bătăi pe minut și pompează de 4–5 ori mai mult sânge decât în repaus!']]
        .forEach(([t, v, f]) => api.button(r2, t, () => { bpm = v; sl.set(v); api.say('<b>' + t.slice(3) + '.</b> ' + f, 9000); }));
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Inima e o pompă cu <b>4 camere</b>. Partea dreaptă trimite sângele <b style="color:#7aa0ff">sărac în oxigen</b> la plămâni; partea stângă trimite sângele <b style="color:#ff6a77">bogat în oxigen</b> în tot corpul. Atinge o cameră ca să afli mai multe!', 14000);

      const PTS = [[-0.55, -0.45, 'b'], [-0.28, -0.12, 'b'], [-0.24, 0.2, 'b'], [-0.18, -0.35, 'b'], [-0.32, -0.72, 'b'], [0.0, -0.82, 'r'], [0.32, -0.72, 'r'], [0.18, -0.35, 'r'], [0.26, -0.12, 'r'], [0.26, 0.2, 'r'], [0.55, -0.2, 'r'], [0.8, 0.3, 'r'], [0.55, 0.8, 'b'], [-0.55, 0.8, 'b'], [-0.8, 0.2, 'b']];
      const poly = mkPoly(PTS.map((p) => [p[0], p[1]]), true);
      const col = (c, a) => c === 'r' ? 'rgba(255,77,90,' + a + ')' : 'rgba(80,125,255,' + a + ')';
      const bump = (p, a, b) => p >= a && p < b ? Math.sin(Math.PI * (p - a) / (b - a)) : 0;
      const CH = [
        { n: 'Atriul drept', x: -0.27, y: -0.1, r: 0.12, c: 'b', t: 'Aici intră sângele sărac în oxigen, venit din corp prin venele mari (cave).' },
        { n: 'Ventriculul drept', x: -0.24, y: 0.2, r: 0.15, c: 'b', t: 'Pompează sângele spre plămâni, ca să ia oxigen proaspăt.' },
        { n: 'Atriul stâng', x: 0.26, y: -0.1, r: 0.12, c: 'r', t: 'Primește sângele bogat în oxigen de la plămâni.' },
        { n: 'Ventriculul stâng', x: 0.26, y: 0.2, r: 0.17, c: 'r', t: 'Cea mai puternică cameră: împinge sângele prin aortă în tot corpul, până în degetul mic de la picior. Are pereții cei mai groși.' }
      ];
      api.pointer({ down: (x, y) => { const U = api.unit; for (const c of CH) if (Math.hypot(x - (api.cx + c.x * U), y - (api.cy + c.y * U)) < c.r * U * 1.3) { api.say('<b>' + c.n + '.</b> ' + c.t, 9000); return; } const lung = Math.hypot(x - api.cx, y - (api.cy - 0.78 * U)) < 0.4 * U; if (lung) api.say('<b>Plămânii.</b> Aici sângele lasă dioxidul de carbon și ia oxigen: devine din albastru, roșu.', 9000); if (y > api.cy + 0.7 * U) api.say('<b>Corpul.</b> În capilare, sângele lasă oxigenul mușchilor, creierului și organelor și devine din nou albastru. Un ciclu complet durează ~1 minut.', 9000); } });
      function frame(dt, t) {
        phase = (phase + dt * bpm / 60) % 1;
        const beatMul = 1 + 1.2 * bump(phase, 0.12, 0.42);
        flowU = (flowU + dt * (bpm / 70) * 0.11 * beatMul) % 1;
        const U = api.unit, cx = api.cx, cy = api.cy, A = bump(phase, 0.0, 0.14), V = bump(phase, 0.14, 0.44);
        const X = (x) => cx + x * U, Y = (y) => cy + y * U;
        bg(api, '#190d16', '#0a0710');
        /* vase */
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let i = 0; i < PTS.length; i++) { const a = PTS[i], b = PTS[(i + 1) % PTS.length]; ctx.strokeStyle = col(a[2], 0.38); ctx.lineWidth = 0.075 * U; ctx.beginPath(); ctx.moveTo(X(a[0]), Y(a[1])); ctx.lineTo(X(b[0]), Y(b[1])); ctx.stroke(); }
        /* plămâni și corp */
        ctx.fillStyle = 'rgba(255,170,190,0.18)'; ctx.beginPath(); ctx.ellipse(X(0), Y(-0.77), U * 0.5, U * 0.14, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Plămâni', X(0), Y(-0.9)); ctx.fillText('Restul corpului', X(0), Y(0.92));
        ctx.fillText('din corp', X(-0.8), Y(-0.07)); ctx.fillText('spre corp', X(0.8), Y(0.1));
        /* camere */
        for (const c of CH) { const s = c.y < 0 ? 1 - 0.14 * A : 1 - 0.16 * V; ctx.fillStyle = col(c.c, 0.95); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(X(c.x), Y(c.y), U * c.r * s, U * c.r * s * 1.12, 0, 0, 7); ctx.fill(); ctx.stroke(); }
        ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.round(U * 0.05 + 6) + 'px system-ui,sans-serif';
        ctx.fillText('AD', X(-0.27), Y(-0.09)); ctx.fillText('VD', X(-0.24), Y(0.22)); ctx.fillText('AS', X(0.26), Y(-0.09)); ctx.fillText('VS', X(0.26), Y(0.22));
        /* globule */
        for (let i = 0; i < 70; i++) {
          const u = (flowU + i / 70) % 1, p = polyAt(poly, u), c = PTS[Math.min(p.i, PTS.length - 1)][2];
          ctx.fillStyle = c === 'r' ? '#ff8a94' : '#9db8ff'; ctx.beginPath(); ctx.arc(X(p.x) + Math.sin(i * 7 + t * 3) * 3, Y(p.y) + Math.cos(i * 5 + t * 3) * 3, 3.2, 0, 7); ctx.fill();
        }
        /* EKG */
        const ev = bump(phase, 0.03, 0.10) * 0.2 + (phase > 0.14 && phase < 0.2 ? Math.sin(Math.PI * (phase - 0.14) / 0.06) * 1.0 : 0) - (phase > 0.2 && phase < 0.24 ? 0.25 : 0) + bump(phase, 0.32, 0.46) * 0.3;
        ecg.push(ev); if (ecg.length > 240) ecg.shift();
        const ex = 14, ey = api.cy - U + 38, ew = Math.min(api.freeW * 0.42, 230);
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(ex - 4, ey - 34, ew + 8, 52);
        ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 2; ctx.beginPath();
        ecg.forEach((v, i) => { const px = ex + i / 240 * ew, py = ey - v * 26; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('EKG · ' + bpm + ' bătăi/min', ex, ey + 14);
        /* bătaia: inimă pulsând */
        ctx.fillStyle = 'rgba(255,90,110,' + (0.5 + 0.5 * V) + ')'; ctx.font = (24 + 14 * V) + 'px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.fillText('❤', api.freeW - 16, api.cy - U + 40);
        info.innerHTML = 'Pompează ~<b>' + fmt(bpm * 0.07, 1) + ' litri/minut</b> · ~<b>' + fmt(bpm * 1440 / 1000, 0) + ' mii de bătăi pe zi</b>';
      }
      return { frame: frame };
    }
  });
})();
