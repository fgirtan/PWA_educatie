/* ============================================================
   MOTOARE ȘI VEHICULE: 1) Motorul termic (4 timpi)
   2) Motorul electric  3) Trenul
   ============================================================ */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }

  /* ============================================================
     1) MOTORUL TERMIC — 4 TIMPI
     ============================================================ */
  defineModule({
    id: 'engine', title: 'Motorul termic', sub: 'Cei 4 timpi: admisie, comprimare, ardere, evacuare',
    start: function (api) {
      const ctx = api.ctx;
      let th = 0, rps = 0.35, playing = true, lastStroke = -1, flash = 0, parts = [];
      const STROKES = [
        { n: '1 · Admisie', c: '#4aa3e0', t: 'Pistonul coboară și trage în cilindru un amestec de aer și benzină prin supapa de admisie (deschisă).' },
        { n: '2 · Comprimare', c: '#e0c24a', t: 'Ambele supape sunt închise. Pistonul urcă și strânge amestecul: devine mic, dens și fierbinte.' },
        { n: '3 · Ardere (timpul motor)', c: '#ff6a3c', t: 'Bujia face o scânteie și amestecul explodează! Gazele fierbinți împing pistonul în jos cu mare forță. Doar acesta dă putere.' },
        { n: '4 · Evacuare', c: '#9aa3b2', t: 'Supapa de evacuare se deschide. Pistonul urcă și scoate gazele arse pe eapament. Apoi ciclul o ia de la capăt.' }
      ];
      const r1 = api.row('');
      const bP = api.button(r1, '⏸ Pauză', () => { playing = !playing; bP.innerHTML = playing ? '⏸ Pauză' : '▶ Pornește'; });
      api.slider(r1, { label: 'Viteza (încetinit)', min: 0.05, max: 3, step: 0.05, value: rps, fmt: (v) => fmt(v, 2) + ' rot/s', onInput: (v) => { rps = v; } });
      const r2 = api.row('Salt la timpul');
      STROKES.forEach((s, i) => api.button(r2, ['⬇️', '🗜️', '💥', '💨'][i] + ' ' + s.n.split('· ')[1].split(' ')[0], () => { th = i * Math.PI; playing = false; bP.innerHTML = '▶ Pornește'; flash = 0; }));
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Mașina ta (benzină) funcționează în <b>4 timpi</b>: admisie, comprimare, ardere, evacuare. Pistonul face 2 ture complete (720°) pentru un singur timp care dă putere!', 12000);

      const R_CR = 0.26, L_ROD = 0.85;       // în unități de „cursă”
      const distBelow = (a) => R_CR * (1 - Math.cos(a)) + L_ROD - Math.sqrt(L_ROD * L_ROD - Math.pow(R_CR * Math.sin(a), 2));
      function frame(dt, t) {
        if (playing) th += rps * Math.PI * 2 * dt;
        const cyc = ((th % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);       // 0..720°
        const stroke = Math.floor(cyc / Math.PI), u = (cyc % Math.PI) / Math.PI;
        const a = th;                                                              // unghi manivelă
        const U = api.unit, W = api.freeW, cx = api.cx, top = api.cy - U * 0.95;
        bg(api, '#10162b', '#05080f');
        if (stroke !== lastStroke) { lastStroke = stroke; api.say('<b style="color:' + STROKES[stroke].c + '">' + STROKES[stroke].n + '</b> — ' + STROKES[stroke].t); if (stroke === 2) flash = 1; if (stroke === 3) for (let i = 0; i < 22; i++) parts.push({ x: 0, y: 0, k: Math.random(), kind: 'ex' }); if (stroke === 0) for (let i = 0; i < 22; i++) parts.push({ x: 0, y: 0, k: Math.random(), kind: 'in' }); }
        flash = Math.max(0, flash - dt * 1.5);
        const cw = U * 0.55, ch = U * 1.0, cl = cx - cw / 2, cr = cx + cw / 2;     // cilindru
        const headY = top + U * 0.28, strokeLen = U * 0.62;
        const pistonTop = headY + distBelow(a) / (2 * R_CR) * strokeLen + 6;
        /* camera de ardere: gaz */
        const hot = stroke === 2 ? clamp(1 - u * 1.1, 0, 1) : 0;
        let gc = 'rgba(80,170,255,0.45)';
        if (stroke === 1) gc = 'rgba(' + Math.round(lerp(80, 255, u)) + ',' + Math.round(lerp(170, 190, u)) + ',' + Math.round(lerp(255, 80, u)) + ',' + lerp(0.5, 0.8, u) + ')';
        if (stroke === 2) gc = 'rgba(255,' + Math.round(110 + 80 * (1 - hot)) + ',40,' + (0.45 + 0.4 * hot) + ')';
        if (stroke === 3) gc = 'rgba(150,155,165,0.55)';
        ctx.fillStyle = gc; ctx.fillRect(cl + 4, headY, cw - 8, pistonTop - headY);
        if (flash > 0) { const g = ctx.createRadialGradient(cx, headY + 10, 0, cx, headY + 10, cw * 1.3); g.addColorStop(0, 'rgba(255,255,220,' + flash + ')'); g.addColorStop(1, 'rgba(255,150,40,0)'); ctx.fillStyle = g; ctx.fillRect(cl, headY - 20, cw, 160); }
        /* particule prin supape */
        parts = parts.filter((p) => { p.k += dt * 0.9; return p.k < 1.6; });
        for (const p of parts) { const side = p.kind === 'in' ? -1 : 1, kk = p.k, px = cx + side * (cw * 0.28 - (p.kind === 'in' ? 0 : 0)) + side * Math.max(0, (p.kind === 'in' ? 1 - kk : kk) ) * cw * 0.9, py = headY - U * 0.16 + (p.kind === 'in' ? Math.min(kk, 1) * U * 0.2 : -Math.min(kk, 1) * 8); ctx.fillStyle = p.kind === 'in' ? 'rgba(120,200,255,0.8)' : 'rgba(170,170,180,0.7)'; ctx.beginPath(); ctx.arc(px, py - (p.kind === 'in' ? 0 : 0), 3, 0, 7); ctx.fill(); }
        /* chiulasa + supape + bujie */
        ctx.fillStyle = '#4b5366'; rrect(ctx, cl - 10, headY - 46, cw + 20, 50, 6); ctx.fill();
        const inOpen = stroke === 0, exOpen = stroke === 3;
        const valve = (x, open, col) => { const dy = open ? 14 : 0; ctx.fillStyle = col; ctx.fillRect(x - 3, headY - 36 + dy, 6, 34); ctx.fillRect(x - 15, headY - 4 + dy, 30, 6); };
        valve(cx - cw * 0.28, inOpen, '#4aa3e0'); valve(cx + cw * 0.28, exOpen, '#9aa3b2');
        ctx.fillStyle = '#d9d2c0'; ctx.fillRect(cx - 4, headY - 46, 8, 36); ctx.fillStyle = '#ffd166'; ctx.fillRect(cx - 1.5, headY - 12, 3, 10);
        ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('admisie', cx - cw * 0.28, headY - 52); ctx.fillText('evacuare', cx + cw * 0.28, headY - 52); ctx.fillText('bujie', cx, headY - 52 - 0);
        /* pereții cilindrului */
        ctx.fillStyle = '#6b7488'; ctx.fillRect(cl - 10, headY + 4, 10, ch + 30); ctx.fillRect(cr, headY + 4, 10, ch + 30);
        /* piston */
        ctx.fillStyle = '#c8cdd8'; rrect(ctx, cl + 2, pistonTop, cw - 4, U * 0.22, 4); ctx.fill(); ctx.strokeStyle = '#444'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#444'; for (let i = 0; i < 2; i++) ctx.fillRect(cl + 2, pistonTop + 6 + i * 7, cw - 4, 2);
        /* bielă + manivelă */
        const crankY = headY + strokeLen + U * 0.55, cr_ = strokeLen / 2, pinX = cx + Math.sin(a) * cr_, pinY = crankY + Math.cos(a) * cr_ * -1 * -1 * 0 + (-Math.cos(a)) * cr_ * -1;
        const pin = [cx + Math.sin(a) * cr_, crankY - Math.cos(a) * cr_];
        const wrist = [cx, pistonTop + U * 0.11];
        ctx.strokeStyle = '#d2a14e'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(wrist[0], wrist[1]); ctx.lineTo(pin[0], pin[1]); ctx.stroke();
        ctx.save(); ctx.translate(cx, crankY); ctx.rotate(a);
        ctx.fillStyle = '#3a4258'; ctx.beginPath(); ctx.arc(0, 0, cr_ * 1.25, 0, 7); ctx.fill(); ctx.strokeStyle = '#7c86a0'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#6a7390'; ctx.fillRect(-4, -cr_ * 1.1, 8, cr_ * 1.1); ctx.restore();
        ctx.fillStyle = '#e8a23a'; ctx.beginPath(); ctx.arc(pin[0], pin[1], 7, 0, 7); ctx.fill();
        ctx.fillStyle = '#0a1226'; ctx.beginPath(); ctx.arc(cx, crankY, 8, 0, 7); ctx.fill();
        /* ceasul ciclului */
        const dx = W - 70, dy = api.cy - U * 0.45, dr = 46;
        for (let i = 0; i < 4; i++) { ctx.strokeStyle = STROKES[i].c; ctx.globalAlpha = i === stroke ? 1 : 0.35; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(dx, dy, dr, -Math.PI / 2 + i * Math.PI / 2, -Math.PI / 2 + (i + 1) * Math.PI / 2 - 0.05); ctx.stroke(); }
        ctx.globalAlpha = 1; const ca = -Math.PI / 2 + cyc / 2 / 2; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(-Math.PI / 2 + cyc / (4 * Math.PI) * Math.PI * 2) * (dr - 18), dy + Math.sin(-Math.PI / 2 + cyc / (4 * Math.PI) * Math.PI * 2) * (dr - 18)); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('720°', dx, dy + 4);
        info.innerHTML = '<b>Unghi:</b> ' + Math.round(cyc / (Math.PI * 2) * 360) + '° din 720° · <b style="color:' + STROKES[stroke].c + '">' + STROKES[stroke].n + '</b>';
      }
      return { frame: frame };
    }
  });

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
