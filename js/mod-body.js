/* ============================================================
   CORPUL OMENESC: 1) Inima  2) Respirația  3) Scheletul
   4) Digestia  5) Creierul (zone, reflexe, memorie)
   ============================================================ */
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

  /* ============================================================
     3) SCHELETUL
     ============================================================ */
  defineModule({
    id: 'skeleton', title: 'Scheletul', sub: '206 oase care ne țin în picioare',
    start: function (api) {
      const ctx = api.ctx;
      let sel = null, quiz = null, score = 0, tries = 0;
      /* oase: tip 'e' (elipsă) sau 's' (segment), coordonate în unități; mirror = apare pe ambele părți */
      const B = [
        { n: 'Craniul', k: 'e', x: 0, y: -0.83, rx: 0.12, ry: 0.14, t: 'Protejează creierul. E format din 22 de oase lipite între ele (la bebeluși ele se sudează abia mai târziu — de-aia au „moalele” capului).' },
        { n: 'Mandibula', k: 'e', x: 0, y: -0.7, rx: 0.07, ry: 0.035, t: 'Singurul os al capului care se mișcă: te ajută să vorbești și să mesteci.' },
        { n: 'Coloana vertebrală', k: 's', x1: 0, y1: -0.67, x2: 0, y2: -0.08, w: 0.025, t: 'Are 33 de oase mici numite vertebre. E flexibilă și îți protejează măduva spinării, prin care trec „firele” spre creier.' },
        { n: 'Coastele', k: 'e', x: 0, y: -0.42, rx: 0.2, ry: 0.19, t: '12 perechi de coaste formează cușca toracică, ce apără inima și plămânii. Se mișcă puțin când respiri.' },
        { n: 'Sternul', k: 's', x1: 0, y1: -0.6, x2: 0, y2: -0.3, w: 0.022, t: 'Osul din mijlocul pieptului, de care se prind coastele.' },
        { n: 'Clavicula', k: 's', x1: -0.2, y1: -0.62, x2: 0.2, y2: -0.62, w: 0.015, t: 'Leagă umărul de stern. E cel mai des fracturat os din corp, mai ales la copii!' },
        { n: 'Humerus', k: 's', x1: -0.22, y1: -0.6, x2: -0.33, y2: -0.28, w: 0.028, mirror: true, t: 'Osul brațului, de la umăr la cot.' },
        { n: 'Radius și ulna', k: 's', x1: -0.33, y1: -0.27, x2: -0.4, y2: 0.04, w: 0.024, mirror: true, t: 'Cele două oase ale antebrațului. Ele se răsucesc una peste alta când întorci palma.' },
        { n: 'Mâna', k: 'e', x: -0.42, y: 0.1, rx: 0.045, ry: 0.07, mirror: true, t: 'O mână are 27 de oase! Într-un singur picior sunt 26.' },
        { n: 'Bazinul', k: 'e', x: 0, y: 0.02, rx: 0.2, ry: 0.1, t: 'Susține partea de sus a corpului și ține organele. Se leagă de coapse.' },
        { n: 'Femurul', k: 's', x1: -0.1, y1: 0.07, x2: -0.14, y2: 0.44, w: 0.04, mirror: true, t: 'Osul coapsei: cel mai lung și mai puternic os din corp — cam un sfert din înălțimea ta!' },
        { n: 'Rotula', k: 'e', x: -0.14, y: 0.48, rx: 0.035, ry: 0.035, mirror: true, t: 'Osul rotund din fața genunchiului, care îl apără.' },
        { n: 'Tibia și fibula', k: 's', x1: -0.14, y1: 0.52, x2: -0.14, y2: 0.86, w: 0.03, mirror: true, t: 'Oasele gambei. Tibia e osul gros, cel pe care îl simți în față, sub genunchi.' },
        { n: 'Laba piciorului', k: 'e', x: -0.16, y: 0.93, rx: 0.07, ry: 0.035, mirror: true, t: 'Oasele piciorului te ajută să stai drept și să mergi, ca niște arcuri.' }
      ];
      const r1 = api.row('');
      const bQ = api.button(r1, '🎯 Joc: găsește osul', () => { quiz = quiz ? null : pick(); bQ.classList.toggle('on', !!quiz); score = tries = 0; if (quiz) api.say('Atinge osul numit! Începe: <b>' + quiz.n + '</b>', 6000); else api.say('Joc oprit. Atinge un os ca să afli despre el.', 4000); });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      api.say('Un adult are <b>206 oase</b>; un nou-născut are ~300, dintre care multe se sudează pe parcurs. Cel mai mic os, <b>scărița</b> din ureche, are 3 mm. Atinge un os!', 12000);
      const pick = () => B[Math.floor(Math.random() * B.length)];
      function hit(x, y) {
        const U = api.unit, cx = api.cx, cy = api.cy; let best = null, bd = 1e9;
        for (const b of B) for (const sg of b.mirror ? [-1, 1] : [1]) {
          let d;
          if (b.k === 'e') { const dx = (x - (cx + sg * b.x * U)) / (b.rx * U + 8), dy = (y - (cy + b.y * U)) / (b.ry * U + 8); d = Math.hypot(dx, dy) - 1; }
          else { const ax = cx + sg * b.x1 * U, ay = cy + b.y1 * U, bx = cx + sg * b.x2 * U, by = cy + b.y2 * U, px = bx - ax, py = by - ay, tt = clamp(((x - ax) * px + (y - ay) * py) / (px * px + py * py), 0, 1); d = (Math.hypot(x - (ax + px * tt), y - (ay + py * tt)) - (b.w * U + 9)) / 40; }
          if (d < 0 && d < bd) { bd = d; best = b; }
        }
        return best;
      }
      api.pointer({ down: (x, y) => { const b = hit(x, y); if (!b) return; sel = b; if (quiz) { tries++; if (b === quiz) { score++; api.say('✅ <b>Corect!</b> ' + b.n + '. ' + b.t, 6000); quiz = pick(); setTimeout(() => api.say('Acum: <b>' + quiz.n + '</b>', 3000), 2500); } else api.say('❌ Asta e <b>' + b.n + '</b>. Încearcă din nou: <b>' + quiz.n + '</b>', 4000); } else api.say('<b>' + b.n + '.</b> ' + b.t, 14000); } });
      function frame(dt, t) {
        bg(api, '#10162b', '#05080f');
        const U = api.unit, cx = api.cx, cy = api.cy;
        ctx.lineCap = 'round';
        const style = (b) => { const on = sel === b; ctx.fillStyle = on ? '#ffe9a0' : '#ece6d6'; ctx.strokeStyle = on ? '#ffb020' : '#7a7260'; ctx.lineWidth = on ? 3 : 1.5; };
        for (const b of B) for (const sg of b.mirror ? [-1, 1] : [1]) {
          style(b);
          if (b.k === 'e') { ctx.beginPath(); ctx.ellipse(cx + sg * b.x * U, cy + b.y * U, b.rx * U, b.ry * U, 0, 0, 7); ctx.fill(); ctx.stroke(); }
          else { ctx.strokeStyle = sel === b ? '#ffb020' : '#7a7260'; ctx.lineWidth = b.w * U * 2 + 3; ctx.beginPath(); ctx.moveTo(cx + sg * b.x1 * U, cy + b.y1 * U); ctx.lineTo(cx + sg * b.x2 * U, cy + b.y2 * U); ctx.stroke(); ctx.strokeStyle = sel === b ? '#ffe9a0' : '#ece6d6'; ctx.lineWidth = b.w * U * 2; ctx.stroke(); }
        }
        /* detalii: coaste (arcuri) și vertebre */
        ctx.strokeStyle = '#7a7260'; ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) for (const sg of [-1, 1]) { const yy = cy + (-0.58 + i * 0.065) * U; ctx.beginPath(); ctx.moveTo(cx + sg * 0.02 * U, yy); ctx.quadraticCurveTo(cx + sg * 0.2 * U, yy - 0.02 * U, cx + sg * 0.17 * U, yy + 0.1 * U); ctx.stroke(); }
        ctx.fillStyle = '#7a7260'; for (let i = 0; i < 18; i++) ctx.fillRect(cx - 5, cy + (-0.66 + i * 0.033) * U, 10, 2);
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(cx - 0.045 * U, cy - 0.85 * U, 0.025 * U, 0, 7); ctx.arc(cx + 0.045 * U, cy - 0.85 * U, 0.025 * U, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '700 14px system-ui,sans-serif'; ctx.textAlign = 'left';
        if (sel) { ctx.fillStyle = '#ffd166'; ctx.fillText(sel.n, 14, api.cy - U + 22); }
        info.innerHTML = quiz ? '🎯 Găsește: <b>' + quiz.n + '</b> · scor: <b>' + score + '/' + tries + '</b>' : 'Atinge un os ca să afli cum se numește.';
      }
      return { frame: frame };
    }
  });

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

  /* ============================================================
     5) CREIERUL: zone, reflexe, memorie
     ============================================================ */
  defineModule({
    id: 'brain', title: 'Creierul', sub: 'Zone, reflexe și memorie',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'zones', sel = null;
      const bs = {};
      const rm = api.row('');
      [['zones', '🧠 Zonele'], ['reflex', '⚡ Reflexe'], ['memory', '🎵 Memorie']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const info = document.createElement('div'); info.className = 'mod-readout'; rm.appendChild(info);
      const REG = {
        frontal: { n: 'Lobul frontal', c: '#e8683a', t: 'Gândire, planificare, hotărâri și personalitate. Controlează și mișcările voluntare (să ridici mâna).' },
        parietal: { n: 'Lobul parietal', c: '#e8c33a', t: 'Primește atingerea, temperatura și durerea; te ajută să știi unde ești în spațiu.' },
        occipital: { n: 'Lobul occipital', c: '#4a8be8', t: 'Văzul! Nu vezi cu ochii, ci cu creierul: ochii doar trimit imaginea aici, în partea din spate a capului.' },
        temporal: { n: 'Lobul temporal', c: '#6acb7a', t: 'Auzul, limbajul și amintirile. Aici se păstrează și melodiile pe care le știi.' },
        cerebel: { n: 'Cerebelul', c: '#b46ae8', t: 'Echilibru și coordonare. Datorită lui poți merge pe bicicletă fără să te gândești la fiecare mișcare.' },
        stem: { n: 'Trunchiul cerebral', c: '#9a9aa8', t: 'Ține în viață corpul fără să te gândești: respirația, bătăile inimii, somnul. Face legătura cu măduva spinării.' }
      };
      function regionAt(nx, ny) {                       // în coordonate normalizate ale elipsei
        if (nx * nx + ny * ny > 1) return null;
        if (nx < -0.15 && ny < 0.15) return 'frontal';
        if (ny >= 0.15 && nx < 0.55) return 'temporal';
        if (nx >= 0.5) return 'occipital';
        return 'parietal';
      }
      const MSG = { zones: '86 de miliarde de neuroni lucrează în creierul tău — ~20% din energia corpului! Atinge o zonă ca să afli ce face.', reflex: 'Cât de repede reacționezi? Așteaptă ca ecranul să devină <b>verde</b>, apoi atinge cât poți de repede. Semnalul merge prin nervi cu ~100 m/s (360 km/h)!', memory: 'Joc de memorie: urmărește ordinea în care se aprind culorile, apoi repet-o. Cât de lungă poți ține minte?' };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); api.say(MSG[m], 12000); if (m === 'reflex') { rf = { s: 'idle', best: rf.best, ms: 0 }; } if (m === 'memory') { mem = { seq: [], show: 0, idx: 0, state: 'idle', flash: -1, flashT: 0, score: 0, best: mem.best, pos: 0 }; } api.layout(); }
      /* reflex */
      let rf = { s: 'idle', best: 0, ms: 0, t0: 0, delay: 0 };
      /* memorie */
      let mem = { seq: [], idx: 0, state: 'idle', flash: -1, flashT: 0, score: 0, best: 0, pos: 0 };
      const PADC = ['#e8453a', '#3ac55a', '#3a7be8', '#e8c53a'], PADN = ['roșu', 'verde', 'albastru', 'galben'];
      function memNext() { mem.seq.push(Math.floor(Math.random() * 4)); mem.state = 'show'; mem.pos = 0; mem.flashT = -0.6; mem.flash = -1; }
      function padRect(i) { const U = api.unit, s = Math.min(U * 0.95, api.freeW * 0.42), gx = s * 0.08; const x0 = api.cx - s - gx / 2, y0 = api.cy - s - gx / 2; return { x: x0 + (i % 2) * (s + gx), y: y0 + Math.floor(i / 2) * (s + gx), s: s }; }
      api.pointer({
        down: (x, y) => {
          if (mode === 'zones') {
            const U = api.unit, nx = (x - api.cx) / (U * 0.95), ny = (y - (api.cy - U * 0.08)) / (U * 0.66);
            if (Math.hypot((x - (api.cx + U * 0.5)), (y - (api.cy + U * 0.62))) < U * 0.22) sel = 'cerebel';
            else if (Math.abs(x - (api.cx + U * 0.12)) < U * 0.08 && y > api.cy + U * 0.45 && y < api.cy + U * 0.9) sel = 'stem';
            else sel = regionAt(nx, ny);
            if (sel) api.say('<b>' + REG[sel].n + '.</b> ' + REG[sel].t, 14000);
          } else if (mode === 'reflex') {
            if (rf.s === 'idle' || rf.s === 'result' || rf.s === 'early') { rf.s = 'wait'; rf.delay = 1.5 + Math.random() * 2.8; rf.t0 = performance.now(); }
            else if (rf.s === 'wait') { rf.s = 'early'; }
            else if (rf.s === 'go') { rf.ms = performance.now() - rf.t0; rf.s = 'result'; if (!rf.best || rf.ms < rf.best) rf.best = rf.ms; api.say(rf.ms < 200 ? '🚀 <b>' + Math.round(rf.ms) + ' ms</b> — foarte rapid!' : rf.ms < 300 ? '✅ <b>' + Math.round(rf.ms) + ' ms</b> — un timp bun. Media oamenilor e ~250 ms.' : '<b>' + Math.round(rf.ms) + ' ms</b>. Încearcă din nou — oboseala îți încetinește reflexele!', 7000); }
          } else {
            if (mem.state === 'idle' || mem.state === 'over') { mem = { seq: [], idx: 0, state: 'idle', flash: -1, flashT: 0, score: 0, best: mem.best, pos: 0 }; memNext(); return; }
            if (mem.state === 'input') for (let i = 0; i < 4; i++) { const r = padRect(i); if (x >= r.x && x <= r.x + r.s && y >= r.y && y <= r.y + r.s) { mem.flash = i; mem.flashT = 0.25; if (mem.seq[mem.idx] === i) { mem.idx++; if (mem.idx >= mem.seq.length) { mem.score = mem.seq.length; mem.best = Math.max(mem.best, mem.score); mem.idx = 0; mem.state = 'wait2'; mem.flashT = 0.7; } } else { mem.state = 'over'; api.say('😮 Ai greșit la pasul ' + (mem.idx + 1) + '! Ai ținut minte <b>' + mem.score + '</b> culori. Apasă pe ecran pentru o rundă nouă.', 8000); } return; } }
          }
        }
      });
      setMode('zones');
      function frame(dt, t) {
        const U = api.unit, cx = api.cx, cy = api.cy;
        bg(api, '#10101e', '#05060c');
        if (mode === 'zones') {
          const by = cy - U * 0.08, rx = U * 0.95, ry = U * 0.66;
          ctx.save(); ctx.beginPath(); ctx.ellipse(cx, by, rx, ry, 0, 0, 7); ctx.clip();
          const tint = (id) => sel === id ? REG[id].c : REG[id].c + 'cc';
          const sec = (id, f) => { ctx.fillStyle = tint(id); ctx.beginPath(); f(); ctx.fill(); };
          ctx.fillStyle = REG.parietal.c + (sel === 'parietal' ? '' : 'cc'); ctx.fillRect(cx - rx, by - ry, rx * 2, ry * 2);
          sec('frontal', () => { ctx.rect(cx - rx, by - ry, rx * 0.85, ry * 1.15); });
          sec('temporal', () => { ctx.rect(cx - rx, by + ry * 0.15, rx * 1.55, ry); });
          sec('occipital', () => { ctx.rect(cx + rx * 0.5, by - ry, rx * 0.5, ry * 2); });
          ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3;
          for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(cx - rx + i * rx * 0.25, by - ry); ctx.quadraticCurveTo(cx - rx + i * rx * 0.25 + 18 * Math.sin(i * 2), by, cx - rx + i * rx * 0.25 - 10, by + ry); ctx.stroke(); }
          ctx.restore();
          ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, by, rx, ry, 0, 0, 7); ctx.stroke();
          /* cerebel + trunchi */
          ctx.fillStyle = tint('cerebel'); ctx.beginPath(); ctx.ellipse(cx + U * 0.5, cy + U * 0.62, U * 0.32, U * 0.2, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.stroke();
          ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(cx + U * 0.5, cy + U * 0.62, U * 0.32 - i * 8, U * 0.2 - i * 5, 0, 0, 7); ctx.stroke(); }
          ctx.fillStyle = tint('stem'); ctx.fillRect(cx + U * 0.05, cy + U * 0.5, U * 0.14, U * 0.42); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.strokeRect(cx + U * 0.05, cy + U * 0.5, U * 0.14, U * 0.42);
          /* semnale: neuroni care „scânteie” */
          for (let i = 0; i < 18; i++) { const a = i * 2.4 + t * 0.6, rr = (0.15 + (i % 6) * 0.1) * U; const px = cx + Math.cos(a) * rr * 1.3, py = by + Math.sin(a * 1.3) * rr * 0.6; ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.5 * Math.abs(Math.sin(t * 3 + i))) + ')'; ctx.beginPath(); ctx.arc(px, py, 2.2, 0, 7); ctx.fill(); }
          ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('frontal', cx - rx * 0.6, by - ry * 0.25); ctx.fillText('parietal', cx + rx * 0.15, by - ry * 0.45); ctx.fillText('occipital', cx + rx * 0.76, by); ctx.fillText('temporal', cx - rx * 0.1, by + ry * 0.55); ctx.fillText('cerebel', cx + U * 0.5, cy + U * 0.64); ctx.fillText('trunchi', cx + U * 0.12, cy + U * 0.95);
          ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText('↖ față', cx - rx, by - ry - 8);
          info.innerHTML = sel ? '<b>' + REG[sel].n + '</b>' : 'Atinge o zonă a creierului.';
        } else if (mode === 'reflex') {
          if (rf.s === 'wait' && (performance.now() - rf.t0) / 1000 > rf.delay) { rf.s = 'go'; rf.t0 = performance.now(); }
          const col = rf.s === 'go' ? '#2fc65a' : rf.s === 'wait' ? '#d8433a' : rf.s === 'early' ? '#d8a03a' : '#3a5aa8';
          const w = Math.min(api.freeW - 32, U * 2), h = U * 1.2;
          ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 24) : ctx.rect(cx - w / 2, cy - h / 2, w, h); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '800 ' + Math.round(clamp(w * 0.07, 20, 36)) + 'px system-ui,sans-serif';
          const txt = { idle: 'Atinge ca să începi', wait: 'Așteaptă verdele…', go: 'ACUM! Atinge!', early: 'Prea devreme! Atinge pentru încă o încercare', result: Math.round(rf.ms) + ' ms · atinge pentru încă o încercare' }[rf.s];
          ctx.fillText(txt, cx, cy + 6);
          ctx.font = '600 14px system-ui,sans-serif'; ctx.fillText(rf.best ? 'Cel mai bun timp: ' + Math.round(rf.best) + ' ms' : 'Media oamenilor: ~250 ms', cx, cy + h / 2 - 22);
          info.innerHTML = 'Semnalul de la ochi la mână: ~0,2 s. Câinii și pisicile reacționează mai repede de 100 ms!';
        } else {
          if (mem.flashT > 0) { mem.flashT -= dt; if (mem.flashT <= 0) { mem.flash = -1; if (mem.state === 'wait2') memNext(); } }
          if (mem.state === 'show') { mem.flashT += 0; if (mem.flashT <= 0 && mem.flash === -1) { if (mem.pos < mem.seq.length) { mem.flash = mem.seq[mem.pos++]; mem.flashT = 0.5; } else { mem.state = 'input'; mem.idx = 0; } } }
          for (let i = 0; i < 4; i++) { const r = padRect(i), on = mem.flash === i; ctx.fillStyle = PADC[i]; ctx.globalAlpha = on ? 1 : 0.4; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(r.x, r.y, r.s, r.s, 20) : ctx.rect(r.x, r.y, r.s, r.s); ctx.fill(); if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke(); } ctx.globalAlpha = 1; }
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '800 20px system-ui,sans-serif';
          ctx.fillText(mem.state === 'idle' ? 'Atinge ecranul ca să începi' : mem.state === 'over' ? 'Joc terminat · atinge ca să reîncepi' : mem.state === 'show' ? 'Uită-te…' : mem.state === 'input' ? 'Acum tu!' : 'Bravo!', cx, cy - api.unit * 1.0 - 4 < 90 ? 96 : cy - api.unit * 1.0 - 4);
          info.innerHTML = 'Rundă: <b>' + (mem.seq.length || 0) + '</b> · scor: <b>' + mem.score + '</b> · cel mai bun: <b>' + mem.best + '</b>';
        }
      }
      return { frame: frame };
    }
  });
})();
