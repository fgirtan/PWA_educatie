/* Modul: Cum „gândește” calculatorul */
(function () {
  const A = window.Art;
  const TAU = Math.PI * 2;
  /* text curat, fără halou gros */
  const txt = (ctx, s, x, y, o) => A.text(ctx, s, x, y, Object.assign({ halo: false }, o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function dotSprite(color) {
    return A.cached('bin-dot-' + color, 48, 48, (c, w, h) => {
      const g = c.createRadialGradient(24, 24, 0, 24, 24, 24);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, A.rgba(color, 0.95)); g.addColorStop(0.5, A.rgba(color, 0.3)); g.addColorStop(1, A.rgba(color, 0));
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    });
  }
  /* amestec de culori care întoarce tot hex (ca Art.shade/sphere să poată lucra cu el) */
  function mixHex(a, b, t) { const x = A.hex(a), y = A.hex(b); return '#' + [0, 1, 2].map((i) => Math.round(lerp(x[i], y[i], clamp(t, 0, 1))).toString(16).padStart(2, '0')).join(''); }
  const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3; };

  /* ============================================================
     3) CALCULATORUL — BIȚI
     ============================================================ */
  defineModule({
    id: 'binary', title: 'Cum „gândește” calculatorul', sub: 'Totul e făcut din 0 și 1',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'num', bits = [0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0];   // 3 octeți
      const lv = bits.slice(), pop = bits.map(() => 0), prev = bits.slice();     // animații: lumină netezită, „pop” la schimbare
      let shown = 0, shownC = [0, 0, 0], modeK = 0;
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
      function setMode(m) { mode = m; modeK = 0; for (const k in bs) bs[k].classList.toggle('on', k === m); api.say(MSG[m], 14000); }
      function layout() {
        const rows = mode === 'col' ? 3 : 1, W = api.freeW, cell = Math.min(60, (W - 20) / 8.6), gap = cell * 0.12;
        const total = 8 * cell + 7 * gap, x0 = (W - total) / 2;
        const rh = cell * 1.9, y0 = api.cy - (rows * rh) / 2 + (mode === 'col' ? 0 : -api.unit * 0.1);
        return { rows: rows, cell: cell, gap: gap, x0: x0, y0: y0, rh: rh };
      }
      api.pointer({ down: (x, y) => { const L = layout(); for (let r = 0; r < L.rows; r++) for (let i = 0; i < 8; i++) { const bx = L.x0 + i * (L.cell + L.gap), by = L.y0 + r * L.rh + L.cell * 0.3; if (x >= bx && x <= bx + L.cell && y >= by && y <= by + L.cell * 1.3) { bits[r * 8 + i] ^= 1; return; } } } });
      const byte = (r) => { let v = 0; for (let i = 0; i < 8; i++) v = v * 2 + bits[r * 8 + i]; return v; };
      setMode('num');

      /* fundal: placă de circuit (cache pe mărime) */
      function boardBg() {
        return A.cached('bin-board', api.W, api.H, (c, w, h) => {
          A.backdrop(c, w, h, { top: '#18213f', bottom: '#0c1226', vignette: false });
          if (false) { let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
          c.lineCap = 'round'; c.lineJoin = 'round';
          for (let i = 0; i < 46; i++) {
            let x = rnd() * w, y = rnd() * h; c.strokeStyle = 'rgba(90,200,170,' + (0.05 + rnd() * 0.07) + ')'; c.lineWidth = 1.5 + rnd() * 2;
            c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { const L = 30 + rnd() * 120, d = Math.floor(rnd() * 4); if (d === 0) x += L; else if (d === 1) y += L; else if (d === 2) { x += L * 0.7; y += L * 0.7; } else { x -= L * 0.7; y += L * 0.7; } c.lineTo(x, y); } c.stroke();
            c.fillStyle = 'rgba(120,220,190,0.12)'; c.beginPath(); c.arc(x, y, 3.5, 0, TAU); c.fill();
          }
          } });
      }
      const TINT = ['#ffd166', '#ff5a5a', '#5ae678', '#6496ff'];

      function bitCell(bx, by, cell, k, tint, val, p, dim) {
        const w = cell, h = cell * 1.3, s = 1 + 0.1 * Math.sin(Math.min(1, p) * Math.PI);
        ctx.save(); ctx.translate(bx + w / 2, by + h / 2); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
        /* carcasa */
        A.roundRectPath(ctx, 1, 4, w, h, 9); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();
        A.metalPlate(ctx, 0, 0, w, h, 9, '#2c3a62');
        A.roundRectPath(ctx, w * 0.08, w * 0.08, w * 0.84, h - w * 0.16, 7); ctx.fillStyle = 'rgba(5,10,25,0.55)'; ctx.fill();
        /* LED-ul */
        const lx = w / 2, ly = h * 0.36, lr = w * 0.27;
        if (k > 0.02) A.glow(ctx, lx, ly, w * 0.75, tint, 0.3 * k);
        ctx.fillStyle = '#0a0f1c'; ctx.beginPath(); ctx.arc(lx, ly, lr * 1.18, 0, TAU); ctx.fill();
        A.sphere(ctx, lx, ly, lr, mixHex(mixHex(tint, '#000000', 0.78), tint, k), { rim: false, gloss: false });
        if (k > 0.02) { const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr); g.addColorStop(0, 'rgba(255,255,255,' + 0.85 * k + ')'); g.addColorStop(0.45, A.rgba(tint, 0.6 * k)); g.addColorStop(1, A.rgba(tint, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, TAU); ctx.fill(); }
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(1, lr * 0.16); ctx.beginPath(); ctx.arc(lx, ly, lr * 0.68, 3.5, 4.4); ctx.stroke();
        /* fereastra cu cifra */
        const dx = w * 0.18, dy = h * 0.64, dw = w * 0.64, dh = h * 0.27;
        A.roundRectPath(ctx, dx, dy, dw, dh, 5); ctx.fillStyle = '#050a14'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke();
        txt(ctx, val ? '1' : '0', w / 2, dy + dh / 2 + 1, { size: Math.max(12, cell * 0.36), weight: 800, color: A.mix('#55648f', tint, k), halo: false });
        if (dim) { A.roundRectPath(ctx, 0, 0, w, h, 9); ctx.fillStyle = 'rgba(5,8,20,0.35)'; ctx.fill(); }
        ctx.restore();
      }

      function frame(dt, t) {
        ctx.drawImage(boardBg(), 0, 0, api.W, api.H);
        const L = layout(), W = api.freeW, U = api.unit;
        modeK = A.damp(modeK, 1, 6, dt);
        for (let i = 0; i < 24; i++) { if (bits[i] !== prev[i]) { pop[i] = 0.0001; prev[i] = bits[i]; } if (pop[i] > 0) { pop[i] += dt * 4; if (pop[i] >= 1) pop[i] = 0; } lv[i] = A.damp(lv[i], bits[i], 12, dt); }
        const lblSize = Math.max(12, Math.round(L.cell * 0.28));
        const v = byte(0);
        const cellsBot = L.y0 + L.cell * 1.6, pad = Math.max(22, L.cell * 0.5);
        const ns = mode === 'num' ? Math.max(28, L.cell * 1.3) : Math.max(40, L.cell * 2.2);
        const pw = mode === 'num' ? ns * 2.6 : ns * 1.5, ph = mode === 'num' ? ns * 1.25 : ns * 1.3;
        const ptop = cellsBot + pad, ny = ptop + ph * 0.5;      // centrul panoului cu rezultatul
        /* trasee de la biți spre rezultat (cu impulsuri luminoase pe biții aprinși) */
        if (mode !== 'col') {
          const ty = ptop + 2;
          for (let i = 0; i < 8; i++) {
            const sx = L.x0 + i * (L.cell + L.gap) + L.cell / 2, sy = L.y0 + L.cell * 0.3 + L.cell * 1.3, ex = W / 2 + (i - 3.5) * L.cell * 0.12, ey = ty;
            const c1y = sy + (ey - sy) * 0.6, c2y = sy + (ey - sy) * 0.3;
            ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = A.rgba('#7aa8ff', 0.18 + 0.3 * lv[i]); ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx, c1y, ex, c2y, ex, ey); ctx.stroke(); ctx.restore();
            if (false) {
              ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = lv[i];
              const spr = dotSprite('#ffd166'), ds = Math.max(6, L.cell * 0.14);
              for (let k = 0; k < 2; k++) { const u = ((t * 0.7 + i * 0.137 + k * 0.5) % 1); ctx.drawImage(spr, bez(sx, sx, ex, ex, u) - ds, bez(sy, c1y, c2y, ey, u) - ds, ds * 2, ds * 2); }
              ctx.restore();
            }
          }
        }
        for (let r = 0; r < L.rows; r++) {
          const tint = mode === 'col' ? TINT[r + 1] : TINT[0];
          for (let i = 0; i < 8; i++) {
            const bx = L.x0 + i * (L.cell + L.gap), by = L.y0 + r * L.rh + L.cell * 0.3, on = bits[r * 8 + i], val = 128 >> i;
            bitCell(bx, by, L.cell, lv[r * 8 + i], tint, on, pop[r * 8 + i], false);
            if (mode !== 'col' || r === 0) txt(ctx, String(val), bx + L.cell / 2, by - lblSize * (mode === 'col' ? 2.5 : 0.75), { size: lblSize, color: on ? '#ffffff' : 'rgba(200,215,255,0.55)', weight: 700, halo: false });
          }
          if (mode === 'col') A.label(ctx, ['Roșu', 'Verde', 'Albastru'][r] + ' = ' + byte(r), L.x0, L.y0 + r * L.rh + L.cell * 0.3 - lblSize * 1.05, { size: lblSize, align: 'left', color: '#fff', bg: A.rgba(A.shade(tint, -0.55), 0.9), border: A.rgba(tint, 0.6) });
        }
        if (mode === 'num') {
          shown = A.damp(shown, v, 9, dt); const sv = Math.abs(shown - v) < 0.5 ? v : Math.round(shown);
          const terms = []; for (let i = 0; i < 8; i++) if (bits[i]) terms.push(128 >> i);
          A.panel(ctx, W / 2 - pw / 2, ptop, pw, ph, { r: 14, bg: 'rgba(6,12,28,0.88)', border: 'rgba(255,209,102,0.35)' });
          txt(ctx, String(sv), W / 2, ny + ns * 0.03, { size: ns, weight: 800, color: '#ffe7a8', halo: false });
          txt(ctx, terms.length ? terms.join(' + ') + ' = ' + v : 'toți biții sunt 0', W / 2, ptop + ph + 20, { size: Math.max(13, A.fs(U, 0.05, 13)), color: 'rgba(235,240,255,0.9)', weight: 600, halo: false });
          info.innerHTML = 'Valoare: <b>' + v + '</b> · în hexazecimal: <b>' + v.toString(16).toUpperCase().padStart(2, '0') + '</b>';
        } else if (mode === 'chr') {
          const ch = v >= 32 && v < 127 ? String.fromCharCode(v) : '·';
          A.panel(ctx, W / 2 - pw / 2, ptop, pw, ph, { r: 16, bg: 'rgba(6,12,28,0.9)', border: 'rgba(255,209,102,0.35)' });
          /* linii de ecran discrete */
          ctx.save(); A.roundRectPath(ctx, W / 2 - pw / 2 + 6, ptop + 6, pw - 12, ph - 12, 11); ctx.clip();
          const sg = ctx.createLinearGradient(0, ptop, 0, ptop + ph); sg.addColorStop(0, 'rgba(40,60,110,0.45)'); sg.addColorStop(1, 'rgba(10,16,36,0.2)'); ctx.fillStyle = sg; ctx.fillRect(W / 2 - pw / 2, ny - ph, pw, ph * 2);
          ctx.restore();
          const sc = 0.85 + 0.15 * A.ease.back(clamp(modeK, 0, 1));
          ctx.save(); ctx.translate(W / 2, ny + ns * 0.03); ctx.scale(sc, sc); txt(ctx, ch, 0, 0, { size: ns, weight: 800, color: '#ffd166', halo: false }); ctx.restore();
          txt(ctx, 'cod ' + v + (v < 32 ? ' (caracter de control, nu se vede)' : ''), W / 2, ptop + ph + 20, { size: Math.max(13, A.fs(U, 0.05, 13)), color: 'rgba(235,240,255,0.9)', weight: 600 });
          info.innerHTML = 'Cod: <b>' + v + '</b> → <b>' + ch + '</b> · „' + 'ABC'.split('').map((c) => c + '=' + c.charCodeAt(0)).join(', ') + '”';
        } else {
          const R = byte(0), G = byte(1), B = byte(2);
          for (let k = 0; k < 3; k++) shownC[k] = A.damp(shownC[k], [R, G, B][k], 10, dt);
          const cr = Math.round(shownC[0]), cg = Math.round(shownC[1]), cb = Math.round(shownC[2]);
          const sx = W / 2, sy = L.y0 + 3 * L.rh + 10, sw = Math.min(W - 40, 280), sh = Math.max(46, L.cell * 0.95);
          /* pixelul de ecran văzut cu lupa: 3 sub-pixeli R, G, B */
          const px = sx - sw / 2, pw = sh * 0.95;
          A.roundRectPath(ctx, px - 4, sy - 4, pw + 8, sh + 8, 10); ctx.fillStyle = '#05070d'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.stroke();
          [[cr, '#ff3030'], [cg, '#30ff60'], [cb, '#3070ff']].forEach(([vv, col], k) => {
            const bw = pw / 3 - 3, bxx = px + k * (pw / 3) + 1.5, a = vv / 255;
            A.roundRectPath(ctx, bxx, sy, bw, sh, 4); ctx.fillStyle = A.rgba(col, 0.08 + 0.92 * a); ctx.fill();
            if (a > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = A.rgba('#ffffff', 0.25 * a); A.roundRectPath(ctx, bxx + bw * 0.25, sy + 3, bw * 0.3, sh - 6, 3); ctx.fill(); ctx.restore(); }
          });
          A.arrow(ctx, px + pw + 10, sy + sh / 2, px + pw + 34, sy + sh / 2, { color: 'rgba(255,255,255,0.7)', width: 3 });
          const qx = px + pw + 44, qw = sx + sw / 2 - qx, col = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
          const lum = (cr * 0.3 + cg * 0.59 + cb * 0.11) / 255;
          if (false) { const hx = '#' + [cr, cg, cb].map((c) => c.toString(16).padStart(2, '0')).join(''); A.glow(ctx, qx + qw / 2, sy + sh / 2, qw * 0.8, hx, 0.35 * lum); }
          A.softShadow(ctx, () => { A.roundRectPath(ctx, qx, sy, qw, sh, 12); ctx.fillStyle = col; ctx.fill(); }, { blur: 14, dy: 4 });
          A.roundRectPath(ctx, qx, sy, qw, sh, 12); const gl = ctx.createLinearGradient(0, sy, 0, sy + sh); gl.addColorStop(0, 'rgba(255,255,255,0.28)'); gl.addColorStop(0.45, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(0,0,0,0.18)'); ctx.fillStyle = gl; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
          info.innerHTML = 'Culoare: <b>rgb(' + R + ', ' + G + ', ' + B + ')</b> · #' + [R, G, B].map((c) => c.toString(16).toUpperCase().padStart(2, '0')).join('');
        }
      }
      return { frame: frame };
    }
  });
})();
