/* Modul: Creierul */
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
