/* Modul: Cum „gândește” calculatorul */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }

  /* ============================================================
     3) CALCULATORUL — BIȚI
     ============================================================ */
  defineModule({
    id: 'binary', title: 'Cum „gândește” calculatorul', sub: 'Totul e făcut din 0 și 1',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'num', bits = [0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0];   // 3 octeți
      const bs = {};
      const MODES = [['num', '🔢 Numere'], ['chr', '🔤 Litere'], ['col', '🎨 Culori']];
      const rm = api.row('');
      MODES.forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const r2 = api.row('');
      api.button(r2, '🎲 Aleator', () => { const n = mode === 'col' ? 24 : 8; for (let i = 0; i < n; i++) bits[i] = Math.random() < 0.5 ? 1 : 0; });
      api.button(r2, '0️⃣ Toate 0', () => { bits.fill(0); });
      api.button(r2, '1️⃣ Toate 1', () => { const n = mode === 'col' ? 24 : 8; for (let i = 0; i < n; i++) bits[i] = 1; });
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      const MSG = {
        num: 'Un calculator are doar întrerupătoare: pornit (1) sau oprit (0). Cu <b>8 biți</b> (un octet) se pot număra 256 de valori: de la 0 la 255. Atinge un bit ca să-l schimbi! Fiecare bit valorează dublu față de cel din dreapta: 1, 2, 4, 8, 16, 32, 64, 128.',
        chr: 'Literele sunt tot numere! Fiecare literă are un cod (ASCII). „A” e 65, „B” e 66… Un calculator le păstrează ca biți. Schimbă biții și vezi ce literă iese.',
        col: 'O culoare = 3 octeți: cât <b>Roșu</b>, cât <b>Verde</b>, cât <b>Albastru</b> (0–255 fiecare). Așa afișează ecranul 16,7 milioane de culori!'
      };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); api.say(MSG[m], 14000); }
      function layout() {
        const rows = mode === 'col' ? 3 : 1, W = api.freeW, cell = Math.min(60, (W - 20) / 8.6), gap = cell * 0.12;
        const total = 8 * cell + 7 * gap, x0 = (W - total) / 2;
        const rh = cell * 1.9, y0 = api.cy - (rows * rh) / 2 + (mode === 'col' ? 0 : -api.unit * 0.1);
        return { rows: rows, cell: cell, gap: gap, x0: x0, y0: y0, rh: rh };
      }
      api.pointer({ down: (x, y) => { const L = layout(); for (let r = 0; r < L.rows; r++) for (let i = 0; i < 8; i++) { const bx = L.x0 + i * (L.cell + L.gap), by = L.y0 + r * L.rh + L.cell * 0.3; if (x >= bx && x <= bx + L.cell && y >= by && y <= by + L.cell * 1.3) { bits[r * 8 + i] ^= 1; return; } } } });
      const byte = (r) => { let v = 0; for (let i = 0; i < 8; i++) v = v * 2 + bits[r * 8 + i]; return v; };
      setMode('num');
      function frame(dt, t) {
        bg(api, '#0a1226', '#05080f');
        const L = layout(), W = api.freeW;
        for (let r = 0; r < L.rows; r++) {
          for (let i = 0; i < 8; i++) {
            const bx = L.x0 + i * (L.cell + L.gap), by = L.y0 + r * L.rh + L.cell * 0.3, on = bits[r * 8 + i], val = 128 >> i;
            const tint = mode === 'col' ? (r === 0 ? '255,90,90' : r === 1 ? '90,230,120' : '100,150,255') : '255,214,102';
            ctx.fillStyle = on ? 'rgba(' + tint + ',0.95)' : '#1b2442'; ctx.strokeStyle = on ? '#fff' : '#3a4670'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, L.cell, L.cell * 1.3, 8) : ctx.rect(bx, by, L.cell, L.cell * 1.3); ctx.fill(); ctx.stroke();
            if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(bx + L.cell / 2, by + L.cell * 0.65, 0, bx + L.cell / 2, by + L.cell * 0.65, L.cell * 1.1); g.addColorStop(0, 'rgba(' + tint + ',0.4)'); g.addColorStop(1, 'rgba(' + tint + ',0)'); ctx.fillStyle = g; ctx.fillRect(bx - L.cell, by - L.cell, L.cell * 3, L.cell * 3); ctx.restore(); }
            ctx.fillStyle = on ? '#1a1a1a' : '#6a78a8'; ctx.font = '800 ' + Math.round(L.cell * 0.6) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(on ? '1' : '0', bx + L.cell / 2, by + L.cell * 0.85);
            ctx.fillStyle = on ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)'; ctx.font = '600 ' + Math.round(L.cell * 0.28) + 'px system-ui,sans-serif'; ctx.fillText(String(val), bx + L.cell / 2, by - 6);
          }
          if (mode === 'col') { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'left'; ctx.font = '700 12px system-ui,sans-serif'; ctx.fillText(['Roșu', 'Verde', 'Albastru'][r] + ' = ' + byte(r), L.x0, L.y0 + r * L.rh + L.cell * 0.05); }
        }
        const v = byte(0);
        if (mode === 'num') {
          const terms = []; for (let i = 0; i < 8; i++) if (bits[i]) terms.push(128 >> i);
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '800 ' + Math.round(L.cell * 1.3) + 'px system-ui,sans-serif'; ctx.fillText(String(v), W / 2, L.y0 + L.rh + 40);
          ctx.font = '600 14px system-ui,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText(terms.length ? terms.join(' + ') + ' = ' + v : 'toți biții sunt 0', W / 2, L.y0 + L.rh + 66);
          info.innerHTML = 'Valoare: <b>' + v + '</b> · în hexazecimal: <b>' + v.toString(16).toUpperCase().padStart(2, '0') + '</b>';
        } else if (mode === 'chr') {
          const ch = v >= 32 && v < 127 ? String.fromCharCode(v) : '·';
          ctx.fillStyle = '#ffd166'; ctx.textAlign = 'center'; ctx.font = '800 ' + Math.round(L.cell * 2.2) + 'px system-ui,sans-serif'; ctx.fillText(ch, W / 2, L.y0 + L.rh + 70);
          ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '600 14px system-ui,sans-serif'; ctx.fillText('cod ' + v + (v < 32 ? ' (caracter de control, nu se vede)' : ''), W / 2, L.y0 + L.rh + 98);
          info.innerHTML = 'Cod: <b>' + v + '</b> → <b>' + ch + '</b> · „' + 'ABC'.split('').map((c) => c + '=' + c.charCodeAt(0)).join(', ') + '”';
        } else {
          const R = byte(0), G = byte(1), B = byte(2);
          const sx = W / 2, sy = L.y0 + 3 * L.rh + 10, sw = Math.min(W - 40, 280);
          ctx.fillStyle = 'rgb(' + R + ',' + G + ',' + B + ')'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.rect(sx - sw / 2, sy, sw, 46); ctx.fill(); ctx.stroke();
          info.innerHTML = 'Culoare: <b>rgb(' + R + ', ' + G + ', ' + B + ')</b> · #' + [R, G, B].map((c) => c.toString(16).toUpperCase().padStart(2, '0')).join('');
        }
      }
      return { frame: frame };
    }
  });
})();
