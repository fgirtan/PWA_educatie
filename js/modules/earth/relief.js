/* Modul: Formarea reliefului */
(function () {
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtN = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 0 : d });
  const mix = (c1, c2, t) => [0, 1, 2].map((i) => Math.round(lerp(c1[i], c2[i], clamp(t, 0, 1))));
  const rgb = (c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  function stars(n) { const a = []; for (let i = 0; i < n; i++) a.push([Math.random(), Math.random(), Math.random() * 1.4 + 0.3]); return a; }
  function drawStars(api, st) { api.ctx.fillStyle = 'rgba(255,255,255,0.65)'; for (const s of st) api.ctx.fillRect(s[0] * api.W, s[1] * api.H, s[2], s[2]); }

  /* ============================================================
     2) FORMAREA REFLIEFULUI (secțiune transversală prin scoarță)
     ============================================================ */
  defineModule({
    id: 'relief', title: 'Formarea reliefului', sub: 'Plăcile tectonice construiesc munți, văi și oceane',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'collision', T = 0, playing = false, comp = 0, compPick = -1;
      const INFO = {
        collision: '<b>Ciocnire de plăci → munți.</b> Două plăci continentale se împing una într-alta și scoarța se încrețește în sus. Așa s-a născut Himalaya acum ~50 de milioane de ani, când India a lovit Asia. Everestul (8.849 m) încă crește ~4 mm pe an.',
        rift: '<b>Plăcile se depărtează → rift și ocean.</b> Scoarța se întinde și se rupe: apare o vale, apoi magma iese la suprafață. Așa se naște un ocean nou — Marea Roșie se deschide chiar acum.',
        subduction: '<b>O placă intră sub alta → vulcani.</b> Placa oceanică, mai grea, se scufundă în manta și formează un șanț adânc. Ea se topește, iar magma urcă și face un lanț de vulcani (Anzii, „Inelul de Foc”).',
        erosion: '<b>Eroziunea → munți tociți.</b> Ploaia, gheața și râurile macină munții încet. Munții Apalași (SUA) au fost cândva la fel de înalți ca Himalaya. Munții noștri Carpați au și ei zeci de milioane de ani.',
        heights: '<b>Cât de înalt?</b> Atinge un munte să-l compari. Everestul e cel mai înalt deasupra mării, dar măsurat de la bază cel mai înalt pe Pământ e Mauna Kea. Pe Marte, Olympus Mons le bate pe toate!'
      };
      const bs = {};
      const modes = [['collision', '🏔️ Ciocnire'], ['rift', '🌊 Rift'], ['subduction', '🌋 Subducție'], ['erosion', '🌧️ Eroziune'], ['heights', '📏 Înălțimi']];
      const rm = api.row('Procese');
      modes.forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rt = api.row('');
      const sl = api.slider(rt, { label: 'Timp', min: 0, max: 60, step: 0.1, value: 0, fmt: (v) => fmtN(v, 0) + ' mil. ani', onInput: (v) => { T = v; playing = false; bP.innerHTML = '▶'; } });
      const bP = api.button(rt, '▶ Pornește', () => { if (T >= 60) T = 0; playing = !playing; bP.innerHTML = playing ? '⏸' : '▶ Pornește'; });
      function setMode(k) { mode = k; T = 0; sl.set(0); playing = k !== 'heights'; bP.innerHTML = playing ? '⏸' : '▶ Pornește'; rt.style.display = k === 'heights' ? 'none' : ''; for (const j in bs) bs[j].classList.toggle('on', j === k); api.say(INFO[k]); api.layout(); }
      const PEAKS = [['Turnul Burj Khalifa', 0.828, '#9fb0c8', 'Cea mai înaltă clădire: 828 m.'], ['Vf. Moldoveanu', 2.544, '#7ea36b', 'Cel mai înalt vârf din România: 2.544 m.'], ['Mont Blanc', 4.806, '#a9c4de', 'Cel mai înalt vârf din Alpi: 4.806 m.'], ['Everest', 8.849, '#e8eef7', 'Cel mai înalt munte deasupra nivelului mării: 8.849 m. Avionul de pasageri zboară mai sus!'], ['Mauna Kea (de la bază)', 10.2, '#6c8a5a', 'Vulcan din Hawaii: doar 4.207 m deasupra mării, dar 10.200 m de la baza lui de pe fundul oceanului.'], ['Olympus Mons (Marte)', 21.9, '#c9694a', 'Vulcanul de pe Marte: 21,9 km — aproape de 2,5 ori Everestul!']];
      api.pointer({ down: (x, y) => { if (mode !== 'heights') return; const L = peakLayout(); let best = -1; L.forEach((p, i) => { if (Math.abs(x - p.x) < p.w / 2 && y > p.y - 10) best = i; }); if (best >= 0) { compPick = best; api.say('<b>' + PEAKS[best][0] + '.</b> ' + PEAKS[best][3]); } } });
      function peakLayout() {
        const W = api.freeW, base = api.cy + api.unit * 0.88, maxH = api.unit * 1.7, n = PEAKS.length, w = Math.min(90, (W - 20) / n);
        return PEAKS.map((p, i) => ({ x: W * (i + 0.5) / n, w: w, y: base - p[1] / 21.9 * maxH, base: base }));
      }
      /* relieful: înălțimea suprafeței (km, +sus) la poziția u ∈[0,1] */
      function surf(u, t) {
        const g = (c, w) => Math.exp(-Math.pow((u - c) / w, 2));
        const k = t / 60;
        if (mode === 'collision') return 0.2 + 8.8 * Math.pow(k, 0.8) * g(0.5, 0.11 + 0.05 * k) + 1.4 * k * g(0.5, 0.3) - 0.3 * g(0.36, 0.05) * k;
        if (mode === 'rift') { const w = 0.03 + 0.1 * k; return 0.3 - 1.2 * k * g(0.5, w * 1.2) + 0.5 * k * (g(0.5 - w * 1.6, 0.04) + g(0.5 + w * 1.6, 0.04)); }
        if (mode === 'subduction') return 0.3 - 3.2 * Math.min(1, k * 1.6) * g(0.42, 0.035) + (0.1 + 4.5 * k) * g(0.7, 0.07) + (0.3 + 1.5 * k) * g(0.6, 0.08) * 0.5 - 0.5 * (u < 0.42 ? 1 : 0) * (0.6);
        return 0.2 + 8.8 * Math.exp(-t / 22) * g(0.5, 0.12 + 0.12 * (t / 60)) + 0.3 * Math.exp(-t / 30);
      }
      function frame(dt, t) {
        if (playing && mode !== 'heights') { T = Math.min(60, T + dt * 4.5); sl.set(T); if (T >= 60) { playing = false; bP.innerHTML = '↺'; } }
        const W = api.W, H = api.H; ctx.fillStyle = '#0b1230'; ctx.fillRect(0, 0, W, H);
        const g0 = ctx.createLinearGradient(0, 0, 0, H); g0.addColorStop(0, '#2c6aa8'); g0.addColorStop(0.55, '#a9d2ee'); g0.addColorStop(1, '#d6ebf7'); ctx.fillStyle = g0; ctx.fillRect(0, 0, W, api.cy + api.unit * 0.4);
        if (mode === 'heights') return drawHeights(t);
        const x0 = 8, x1 = api.freeW - 8, cw = x1 - x0, base = api.cy + api.unit * 0.25, km = api.unit * 1.5 / 22 * 2.2;
        const N = 90, sea = 0;
        /* apă (rift târziu și subducție: ocean în stânga) */
        const oceanLeft = mode === 'subduction', riftSea = mode === 'rift' && T > 14;
        /* manta */
        const gm = ctx.createLinearGradient(0, base + 40, 0, H); gm.addColorStop(0, '#d9561f'); gm.addColorStop(1, '#8a1f0c');
        ctx.fillStyle = gm; ctx.fillRect(0, base + 40, W, H - base - 40);
        for (let i = 0; i < 14; i++) { const px = (i / 14 + t * 0.02 * (i % 2 ? 1 : -1)) % 1; ctx.fillStyle = 'rgba(255,190,80,0.25)'; ctx.beginPath(); ctx.arc(px * W, base + 90 + (i % 4) * 28, 12 + (i % 3) * 6, 0, 7); ctx.fill(); }
        /* scoarța */
        const thick = (u) => 0.9 + (mode === 'collision' ? Math.max(0, surf(u, T) - 0.3) * 1.5 : mode === 'erosion' ? Math.max(0, surf(u, T) - 0.3) * 2.2 : 0);
        ctx.beginPath(); ctx.moveTo(x0, base);
        const pts = [];
        for (let i = 0; i <= N; i++) { const u = i / N; pts.push([x0 + u * cw, base - surf(u, T) * km]); }
        pts.forEach((p) => ctx.lineTo(p[0], p[1]));
        for (let i = N; i >= 0; i--) { const u = i / N; ctx.lineTo(x0 + u * cw, base + 40 + thick(u) * km * 1.0); }
        ctx.closePath();
        const gc = ctx.createLinearGradient(0, base - 9 * km, 0, base + 60); gc.addColorStop(0, '#ece9e2'); gc.addColorStop(0.18, '#8a7a62'); gc.addColorStop(0.6, '#5a4a3a'); gc.addColorStop(1, '#3a2f28');
        ctx.fillStyle = gc; ctx.fill();
        /* straturi (cute) */
        ctx.save(); ctx.clip();
        for (let b = 1; b <= 5; b++) { ctx.strokeStyle = b % 2 ? 'rgba(220,170,100,0.45)' : 'rgba(90,60,40,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= N; i++) { const u = i / N, y = base - (surf(u, T) - 0.2) * km * (1 - b * 0.12) + b * 7; i ? ctx.lineTo(x0 + u * cw, y) : ctx.moveTo(x0 + u * cw, y); } ctx.stroke(); }
        ctx.restore();
        /* apa */
        if (oceanLeft || riftSea) {
          ctx.fillStyle = 'rgba(30,110,190,0.75)'; ctx.beginPath(); ctx.moveTo(x0, base);
          const xe = oceanLeft ? x0 + cw * 0.5 : x1; ctx.lineTo(x0, base - 6); ctx.lineTo(xe, base - 6);
          for (let i = N; i >= 0; i--) { const u = i / N, px = x0 + u * cw; if (px <= xe) ctx.lineTo(px, Math.max(base - 6, base - surf(u, T) * km)); }
          ctx.closePath(); ctx.fill();
        }
        /* subducție: placa care intră */
        if (mode === 'subduction') {
          ctx.strokeStyle = '#4a3a30'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(x0 + cw * 0.42, base + 50); ctx.quadraticCurveTo(x0 + cw * 0.6, base + 90, x0 + cw * 0.78, base + 190); ctx.stroke();
          /* vulcani */
          const k = T / 60;
          for (let i = 0; i < 3; i++) { const vx = x0 + cw * (0.62 + i * 0.07), vy = base - surf(0.62 + i * 0.07, T) * km; if (k > 0.25) { ctx.fillStyle = 'rgba(255,90,30,0.9)'; ctx.beginPath(); ctx.arc(vx + (Math.random() - 0.5) * 3, vy - 4 - Math.random() * 12 * k, 3 + 3 * Math.random(), 0, 7); ctx.fill(); } }
          for (let i = 0; i < 8; i++) { const a = (t * 0.6 + i / 8) % 1; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x0 + cw * (0.45 + 0.28 * a), base + 55 + 125 * a * a + Math.sin(i * 5 + t * 6) * 4, 2.5, 2.5); }
        }
        if (mode === 'rift' && T > 8) { ctx.fillStyle = 'rgba(255,100,30,' + Math.min(1, (T - 8) / 15) + ')'; ctx.fillRect(x0 + cw * 0.5 - 3 - T * 0.15, base - surf(0.5, T) * km + 8, 6 + T * 0.3, base + 44 - (base - surf(0.5, T) * km + 8)); }
        /* săgeți de mișcare */
        const arrow = (x, y, dir) => { ctx.strokeStyle = '#ffd166'; ctx.fillStyle = '#ffd166'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dir * 50, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + dir * 62, y); ctx.lineTo(x + dir * 46, y - 9); ctx.lineTo(x + dir * 46, y + 9); ctx.fill(); };
        const ay = base + 25;
        if (mode === 'collision') { arrow(x0 + cw * 0.12, ay, 1); arrow(x1 - cw * 0.12, ay, -1); }
        if (mode === 'rift') { arrow(x0 + cw * 0.38, ay, -1); arrow(x1 - cw * 0.38, ay, 1); }
        if (mode === 'subduction') { arrow(x0 + cw * 0.12, ay, 1); arrow(x1 - cw * 0.12, ay, -0.0001); }
        /* ploaie la eroziune */
        if (mode === 'erosion') { ctx.strokeStyle = 'rgba(150,200,255,0.8)'; ctx.lineWidth = 1.5; for (let i = 0; i < 30; i++) { const rx = (i * 53.7 + t * 90) % W, ry = (i * 37 + t * 380) % (base - 40); ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 11); ctx.stroke(); } }
        /* altitudine / etichete */
        ctx.fillStyle = '#fff'; ctx.font = '600 13px system-ui,sans-serif'; ctx.textAlign = 'center';
        const lab = (txt, u, dy) => ctx.fillText(txt, x0 + u * cw, base - surf(u, T) * km - (dy || 14));
        if (mode === 'collision') { const h = surf(0.5, T) * 1000; lab('Altitudine: ' + fmtN(h) + ' m' + (h >= 8800 ? ' = Everest!' : ''), 0.5, 18); ctx.fillText('India', x0 + cw * 0.15, base + 12); ctx.fillText('Asia', x0 + cw * 0.85, base + 12); }
        if (mode === 'rift') { ctx.fillText(T > 14 ? 'Ocean nou' : 'Vale rift', x0 + cw * 0.5, base - 38); }
        if (mode === 'subduction') { ctx.fillText('Placa oceanică', x0 + cw * 0.2, base + 70); ctx.fillText('Șanț', x0 + cw * 0.42, base - 22); ctx.fillText('Anzi (vulcani)', x0 + cw * 0.68, base - surf(0.68, T) * km - 22); }
        if (mode === 'erosion') { const h = surf(0.5, T) * 1000; lab('Altitudine: ' + fmtN(h) + ' m', 0.5, 16); }
        ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillText('Secțiune prin scoarță · timpul curge ×milioane', 12, 90);
      }
      function drawHeights(t) {
        const L = peakLayout(), base = L[0].base;
        ctx.fillStyle = '#16355c'; ctx.fillRect(0, base, api.W, api.H - base);
        L.forEach((p, i) => {
          const c = PEAKS[i][2];
          ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(p.x - p.w / 2 - (i > 3 ? 20 : 0), base); ctx.lineTo(p.x, p.y); ctx.lineTo(p.x + p.w / 2 + (i > 3 ? 20 : 0), base); ctx.closePath(); ctx.fill();
          if (i === compPick) { ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.stroke(); }
          ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(fmtN(PEAKS[i][1] * 1000) + ' m', p.x, Math.max(120, p.y - 6));
          const words = PEAKS[i][0].split(' '); ctx.fillText(words[0], p.x, base + 16); if (words[1]) ctx.fillText(words.slice(1).join(' '), p.x, base + 29);
        });
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.setLineDash([5, 6]); const ey = L[3].y; ctx.beginPath(); ctx.moveTo(0, ey); ctx.lineTo(api.W, ey); ctx.stroke(); ctx.setLineDash([]);
        ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = '600 12px system-ui,sans-serif'; ctx.fillText('nivelul Everestului', 8, ey - 5);
      }
      setMode('collision');
      return { frame: frame };
    }
  });
})();
