/* Modul: Microbii și apărarea corpului — spălatul pe mâini, globulele albe, vaccinul */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  function germ(ctx, x, y, r, t, col, face, a) {
    ctx.save(); ctx.globalAlpha = a === undefined ? 1 : a; ctx.translate(x, y);
    ctx.strokeStyle = A.shade(col, -0.3); ctx.lineWidth = r * 0.18; ctx.lineCap = 'round';
    for (let k = 0; k < 9; k++) { const an = k / 9 * TAU + t * 0.5; ctx.beginPath(); ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r); ctx.lineTo(Math.cos(an) * r * 1.45, Math.sin(an) * r * 1.45); ctx.stroke(); ctx.fillStyle = A.shade(col, -0.3); ctx.beginPath(); ctx.arc(Math.cos(an) * r * 1.5, Math.sin(an) * r * 1.5, r * 0.15, 0, TAU); ctx.fill(); }
    ctx.fillStyle = col; A.blob(ctx, 0, 0, r, t + x * 0.01, { amp: 0.12, points: 8 }); ctx.fill();
    if (face !== false) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-r * 0.32, -r * 0.15, r * 0.24, 0, TAU); ctx.arc(r * 0.32, -r * 0.15, r * 0.24, 0, TAU); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-r * 0.28, -r * 0.1, r * 0.11, 0, TAU); ctx.arc(r * 0.36, -r * 0.1, r * 0.11, 0, TAU); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.arc(0, r * 0.35, r * 0.25, Math.PI + 0.4, -0.4); ctx.stroke(); }
    ctx.restore();
  }
  function wbc(ctx, x, y, r, t) { ctx.fillStyle = 'rgba(245,247,255,0.95)'; A.blob(ctx, x, y, r, t * 1.4 + x * 0.01, { amp: 0.16, points: 10 }); ctx.fill(); ctx.fillStyle = '#9a7ad8'; A.blob(ctx, x + r * 0.15, y, r * 0.42, t + 2, { amp: 0.3, points: 7 }); ctx.fill(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.3, r * 0.08, 0, TAU); ctx.arc(x - r * 0.05, y - r * 0.32, r * 0.08, 0, TAU); ctx.fill(); }
  function antibody(ctx, x, y, s, a, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.strokeStyle = col || '#ffd84a'; ctx.lineWidth = s * 0.25; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, s); ctx.lineTo(0, 0); ctx.lineTo(-s * 0.7, -s * 0.8); ctx.moveTo(0, 0); ctx.lineTo(s * 0.7, -s * 0.8); ctx.stroke(); ctx.restore(); }
  defineModule({
    id: 'immune', title: 'Microbii și apărarea corpului', sub: 'De ce ne spălăm pe mâini și cum ne apără corpul',
    start: function (api) {
      const ctx = api.ctx; let mode = 'hands', st = 0, washing = 0, round = 0;
      const rm = api.row(''), bs = {};
      [['hands', '🧼 Mâinile'], ['fight', '⚔️ Bătălia din corp'], ['vaccine', '💉 Vaccinul']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const rh = api.row(''), rf = api.row(''), rv = api.row('');
      api.button(rh, '🧼 Spală pe mâini (20 de secunde)', () => { washing = 0.001; });
      api.button(rh, '🖐️ Murdărește mâinile', () => { washing = 0; dirty(); });
      api.button(rf, '🦠 Intră microbi', () => { addGerms(6); });
      api.button(rv, '▶ Prima întâlnire', () => { round = 1; st = 0; resetV(); api.say('<b>Prima dată</b> când microbul intră, corpul nu-l cunoaște. Îi trebuie <b>câteva zile</b> să facă „cheile” potrivite (anticorpii). Între timp, microbii se înmulțesc și tu ești bolnav. 🤒'); });
      api.button(rv, '💉 Cu vaccin', () => { round = 2; st = 0; resetV(); api.say('<b>Vaccinul</b> îi arată corpului o „poză” a microbului, fără să te îmbolnăvească. Corpul învață și își <b>amintește</b>. Când vine microbul adevărat, anticorpii sunt <b>gata imediat</b> și îl prind înainte să se înmulțească! 💪'); });
      const MSG = { hands: 'Microbii sunt viețuitoare <b>atât de mici</b> încât nu le vezi cu ochiul liber. Ei stau peste tot: pe mâini, pe jucării, pe clanțe. Unii ne pot îmbolnăvi. <b>Săpunul</b> îi desprinde de piele, iar apa îi spală. Apasă butonul ca să speli mâinile!', fight: 'Dacă un microb intră în corp, îl așteaptă armata: <b>globulele albe</b>. Unele îl înghit, altele fac <b>anticorpi</b> (ca niște cleștișori în formă de Y) care se lipesc de microbi și îi opresc.', vaccine: 'Cum ne ajută un <b>vaccin</b>? Compară cele două întâlniri cu același microb: prima fără vaccin, a doua cu vaccin.' };
      function setMode(m) { mode = m; st = 0; for (const k in bs) bs[k].classList.toggle('on', k === m); rh.style.display = m === 'hands' ? '' : 'none'; rf.style.display = m === 'fight' ? '' : 'none'; rv.style.display = m === 'vaccine' ? '' : 'none'; api.say(MSG[m]); if (m === 'fight') { fg.length = 0; addGerms(5); } if (m === 'vaccine') { round = 0; resetV(); } api.layout(); }
      const hg = []; function dirty() { hg.length = 0; for (let i = 0; i < 28; i++) hg.push({ x: 320 + Math.random() * 360, y: 180 + Math.random() * 300, c: ['#5ac85a', '#ff8a3a', '#b46ae8', '#3ac8c8'][i % 4], r: 9 + Math.random() * 6, a: 1, vy: 0 }); } dirty();
      const fg = [], cells = [{ x: 200, y: 300, vx: 0, vy: 0 }, { x: 800, y: 250, vx: 0, vy: 0 }, { x: 500, y: 480, vx: 0, vy: 0 }], abs = [];
      function addGerms(n) { for (let i = 0; i < n; i++) fg.push({ x: 60 + Math.random() * 120, y: 150 + Math.random() * 350, vx: 20 + Math.random() * 30, vy: (Math.random() - 0.5) * 30, hit: 0, dead: 0 }); }
      let vg = [], vab = [], hist = [];
      function resetV() { vg = [{ x: 200, y: 330, dead: 0 }]; vab = []; hist = []; }
      setMode('hands');
      return {
        frame: function (dt, t) {
          st += dt; A.scene(ctx, api.W, api.H, 'body');
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          if (mode === 'hands') {
            /* două mâini (palme) */
            for (const s of [-1, 1]) { const cx = 500 + s * 120; ctx.save(); ctx.translate(cx, 330); ctx.scale(s, 1); ctx.fillStyle = '#f2c09a'; A.roundRectPath(ctx, -80, -60, 160, 190, 60); ctx.fill(); [[-70, -120, 34], [-28, -150, 36], [16, -145, 35], [56, -110, 32]].forEach(([x, y, w]) => { A.roundRectPath(ctx, x, y, w, 110, w / 2); ctx.fill(); }); ctx.save(); ctx.translate(80, 40); ctx.rotate(0.7); A.roundRectPath(ctx, -16, -10, 34, 90, 17); ctx.fill(); ctx.restore(); ctx.strokeStyle = 'rgba(180,110,80,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-50, 20); ctx.quadraticCurveTo(0, 50, 50, 10); ctx.stroke(); ctx.restore(); }
            if (washing > 0) {
              washing += dt / 6;
              for (let i = 0; i < 26; i++) { const a = i * 2.3 + t * 2, r = 30 + (i % 5) * 40; const x = 500 + Math.cos(a) * r * 1.8, y = 330 + Math.sin(a * 1.3) * r; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.fillStyle = 'rgba(200,230,255,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 8 + (i % 4) * 6, 0, TAU); ctx.fill(); ctx.stroke(); }
              if (washing > 0.5) for (let i = 0; i < 30; i++) { const u = ((t * 1.2 + i / 30) % 1); ctx.strokeStyle = 'rgba(120,190,255,0.6)'; ctx.lineWidth = 3; const x = 380 + (i * 37) % 240; ctx.beginPath(); ctx.moveTo(x, 60 + u * 520); ctx.lineTo(x, 80 + u * 520); ctx.stroke(); }
              for (const g of hg) { if (washing > 0.3) { g.a = Math.max(0, g.a - dt * 0.3); g.vy += dt * 60; g.y += g.vy * dt * (washing > 0.5 ? 1 : 0.2); } }
              const secs = Math.min(20, Math.floor(washing * 20)); A.label(ctx, '⏱️ ' + secs + ' secunde', 500, 90, { size: 20 });
              if (washing >= 1) { washing = 0; api.say('<b>Gata, mâinile sunt curate!</b> ✨ Spală-te pe mâini <b>înainte să mănânci</b>, după ce mergi la toaletă și când vii de afară.'); }
            }
            for (const g of hg) if (g.a > 0.02 && g.y < 640) germ(ctx, g.x, g.y, g.r, t * 2 + g.x, g.c, true, g.a);
            const left = hg.filter((g) => g.a > 0.3).length; A.text(ctx, left ? '🦠 microbi pe mâini: ' + left : '✨ mâini curate!', 500, 560, { size: 20, color: left ? '#ffb0b8' : '#7dffb0' });
            A.text(ctx, '(în realitate microbii sunt invizibili; aici sunt măriți)', 500, 590, { size: 13, color: 'rgba(255,255,255,0.6)' });
          } else if (mode === 'fight') {
            const g0 = ctx.createRadialGradient(500, 300, 50, 500, 300, 560); g0.addColorStop(0, '#5a1a2a'); g0.addColorStop(1, '#250812'); ctx.fillStyle = g0; ctx.fillRect(0, 0, 1000, 600);
            for (let i = 0; i < 30; i++) { ctx.fillStyle = 'rgba(232,57,79,0.35)'; ctx.beginPath(); ctx.ellipse((i * 113 + t * 25) % 1040 - 20, (i * 71) % 600, 16, 10, i, 0, TAU); ctx.fill(); }
            for (const g of fg) { if (g.dead) { g.dead += dt; continue; } g.x += g.vx * dt; g.y += g.vy * dt; if (g.y < 100 || g.y > 560) g.vy *= -1; if (g.x > 960) g.vx = -Math.abs(g.vx); if (g.x < 40) g.vx = Math.abs(g.vx); if (g.hit > 0.99) g.dead = 0.01; }
            for (const c of cells) { const tg = fg.filter((g) => !g.dead).sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y))[0]; const tx = tg ? tg.x : 500 + Math.sin(t * 0.3 + c.x) * 300, ty = tg ? tg.y : 320 + Math.cos(t * 0.4 + c.y) * 150; const d = Math.hypot(tx - c.x, ty - c.y) || 1; c.vx = lerp(c.vx, (tx - c.x) / d * 70, dt * 1.5); c.vy = lerp(c.vy, (ty - c.y) / d * 70, dt * 1.5); c.x += c.vx * dt; c.y += c.vy * dt; if (tg && d < 40) tg.hit = Math.min(1, tg.hit + dt * 0.8); if (tg && Math.random() < dt * 1.5) abs.push({ x: c.x, y: c.y, tg: tg, a: Math.random() * TAU, stuck: false }); }
            for (let i = abs.length - 1; i >= 0; i--) { const a = abs[i]; if (!a.tg || a.tg.dead > 0.5) { abs.splice(i, 1); continue; } const dx = a.tg.x - a.x, dy = a.tg.y - a.y, d = Math.hypot(dx, dy); if (d > 22) { a.x += dx / d * 160 * dt; a.y += dy / d * 160 * dt; } else { a.stuck = true; a.tg.hit = Math.min(1, a.tg.hit + dt * 0.15); a.x = a.tg.x - dx / d * 22; a.y = a.tg.y - dy / d * 22; } antibody(ctx, a.x, a.y, 9, Math.atan2(dy, dx) + Math.PI / 2); }
            for (let i = fg.length - 1; i >= 0; i--) { const g = fg[i]; if (g.dead > 1) { fg.splice(i, 1); continue; } germ(ctx, g.x, g.y, 18 * (g.dead ? 1 - g.dead : 1), t * 2 + i, '#5ac85a', true, g.dead ? 1 - g.dead : 1); }
            for (const c of cells) wbc(ctx, c.x, c.y, 42, t);
            A.label(ctx, 'globulă albă', cells[0].x, cells[0].y - 60, { size: 15 }); A.label(ctx, 'Y = anticorpi', 860, 560, { size: 15, color: '#ffe08a' });
            A.text(ctx, fg.length ? '🦠 microbi: ' + fg.filter((g) => !g.dead).length : '🏆 Corpul a câștigat!', 500, 70, { size: 22, color: fg.length ? '#ffb0b8' : '#7dffb0' });
          } else {
            /* două „cronologii”: microbi în timp */
            const x0 = 120, x1 = 900, y0 = 140, y1 = 470;
            ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0 - 20); ctx.lineTo(x0, y1); ctx.lineTo(x1 + 20, y1); ctx.stroke();
            A.text(ctx, 'câți microbi', x0, y0 - 40, { size: 15 }); A.text(ctx, 'zile →', x1, y1 + 26, { size: 15 });
            for (let d = 0; d <= 10; d++) A.text(ctx, String(d), lerp(x0, x1, d / 10), y1 + 26, { size: 13, color: 'rgba(255,255,255,0.6)' });
            const curve = (k, vac) => { if (vac) return Math.exp(-Math.pow((k - 0.06) / 0.05, 2)) * 0.1 + (k < 0.06 ? k / 0.06 * 0.1 : 0) * 0; return Math.exp(-Math.pow((k - 0.45) / 0.18, 2)); };
            const dur = 8, k = round ? clamp(st / dur, 0, 1) : 0;
            const drawC = (vac, col, kk) => { ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i <= 100 * kk; i++) { const u = i / 100, y = vac ? Math.min(0.12, Math.exp(-Math.pow((u - 0.08) / 0.05, 2)) * 0.12) : curve(u); ctx.lineTo(lerp(x0, x1, u), lerp(y1, y0, y)); } ctx.stroke(); };
            if (round >= 1) drawC(false, '#ff5a6a', round === 1 ? k : 1);
            if (round === 2) drawC(true, '#7dffb0', k);
            ctx.strokeStyle = 'rgba(255,220,120,0.5)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(x0, lerp(y1, y0, 0.35)); ctx.lineTo(x1, lerp(y1, y0, 0.35)); ctx.stroke(); ctx.setLineDash([]); A.text(ctx, 'peste linie: ești bolnav 🤒', x1 - 80, lerp(y1, y0, 0.35) - 14, { size: 14, color: '#ffe08a' });
            if (round >= 1) A.label(ctx, '🔴 fără vaccin', lerp(x0, x1, 0.45), y0 - 10, { size: 15, color: '#ffb0b8' });
            if (round === 2) A.label(ctx, '🟢 cu vaccin: prins imediat!', lerp(x0, x1, 0.25), lerp(y1, y0, 0.2) - 6, { size: 15, color: '#b0ffcc' });
            if (!round) A.text(ctx, 'Apasă „Prima întâlnire”, apoi „Cu vaccin”', 500, 300, { size: 18 });
            /* scenă mică: microb + anticorpi */
            const bx = 760, by = 250; if (round) { const fast = round === 2, ready = fast ? 0.1 : 0.4; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t, kk = clamp((k - ready) / 0.2, 0, 1); antibody(ctx, bx + Math.cos(a) * lerp(90, 30, kk), by + Math.sin(a) * lerp(90, 30, kk), 10, a - Math.PI / 2); } germ(ctx, bx, by, 18, t * 2, '#5ac85a', true, k > ready + 0.25 ? clamp(1 - (k - ready - 0.25) * 3, 0, 1) : 1); }
          }
          ctx.restore();
        }
      };
    }
  });
})();
