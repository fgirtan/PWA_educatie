/* Modul: Motorul termic */
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
})();
