/* Modul: Aparatul foto */
(function () {
  const A = window.Art;
  const TAU = Math.PI * 2;
  /* text curat, fără halou gros */
  const txt = (ctx, s, x, y, o) => A.text(ctx, s, x, y, Object.assign({ halo: false }, o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const rrect = (ctx, x, y, w, h, r) => A.roundRectPath(ctx, x, y, w, h, r);

  /* lumânare (subiectul din experimentul cu lentila); baza în (0,0), vârful flăcării la (0,-h) */
  function candle(ctx, h, t, alpha) {
    ctx.save(); ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    const bw = h * 0.17, bh = h * 0.66;
    ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.ellipse(0, 0, bw * 1.7, bw * 0.45, 0, 0, TAU); ctx.fill();
    A.cylinder(ctx, -bw / 2, -bh, bw, bh, '#f3e6cf', true);
    ctx.fillStyle = '#fff6e6'; ctx.beginPath(); ctx.ellipse(0, -bh, bw / 2, bw * 0.16, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,215,0.9)'; ctx.beginPath(); ctx.moveTo(bw * 0.15, -bh); ctx.quadraticCurveTo(bw * 0.3, -bh + bh * 0.12, bw * 0.22, -bh + bh * 0.2); ctx.quadraticCurveTo(bw * 0.08, -bh + bh * 0.12, bw * 0.15, -bh); ctx.fill();
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = Math.max(1, h * 0.012); ctx.beginPath(); ctx.moveTo(0, -bh); ctx.lineTo(0, -bh - h * 0.05); ctx.stroke();
    const fl = (h - bh) * 0.95, sw = Math.sin(t * 7) * fl * 0.06;
    A.glow(ctx, 0, -h + fl * 0.45, fl * 1.1, '#ffb347', 0.35 * (alpha === undefined ? 1 : alpha));
    ctx.beginPath(); ctx.moveTo(0, -bh - h * 0.02); ctx.bezierCurveTo(-fl * 0.32, -bh - fl * 0.25, -fl * 0.12, -h + fl * 0.2, sw, -h); ctx.bezierCurveTo(fl * 0.14, -h + fl * 0.2, fl * 0.32, -bh - fl * 0.25, 0, -bh - h * 0.02);
    const g = ctx.createLinearGradient(0, -h, 0, -bh); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.55, '#ffc23a'); g.addColorStop(1, '#ff7a2f'); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,240,0.85)'; ctx.beginPath(); ctx.ellipse(0, -bh - fl * 0.28, fl * 0.07, fl * 0.2, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  /* ============================================================
     2) APARATUL FOTO
     ============================================================ */
  defineModule({
    id: 'camera', title: 'Aparatul foto', sub: 'Lentila, focalizarea și expunerea',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'lens', f = 50, doM = 2, focus = 1.4, N = 8, shut = 125, iso = 100, bx = 0, blurS = 0;
      const bs = {};
      const rm = api.row('');
      [['lens', '🔍 Lentila și focalizarea'], ['exp', '☀️ Expunerea']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rl = api.row(''), re = api.row('');
      const slF = api.slider(rl, { label: 'Distanța focală', min: 20, max: 100, step: 1, value: f, fmt: (v) => v + ' mm', onInput: (v) => { f = v; } });
      api.slider(rl, { label: 'Cât de departe e subiectul', min: 0.3, max: 10, step: 0.05, value: doM, fmt: (v) => fmt(v, 1) + ' m', onInput: (v) => { doM = v; } });
      const slFo = api.slider(rl, { label: 'Focalizare (distanța lentilă–senzor)', min: 1.0, max: 2.1, step: 0.005, value: focus, fmt: (v) => fmt(v * f, 0) + ' mm', onInput: (v) => { focus = v; } });
      api.button(rl, '🎯 Autofocus', () => { focus = clamp(vOf() / fp(), 1.0, 2.1); slFo.set(focus); api.say('Autofocus: aparatul mută lentila până când imaginea cade <b>exact pe senzor</b>.', 5000); });
      const info = document.createElement('div'); info.className = 'mod-readout'; rl.appendChild(info);
      api.slider(re, { label: 'Diafragma', min: 0, max: 5, step: 1, value: 3, fmt: (v) => 'f/' + [1.4, 2.8, 4, 5.6, 8, 16][v], onInput: (v) => { N = [1.4, 2.8, 4, 5.6, 8, 16][v]; } });
      api.slider(re, { label: 'Timp de expunere', min: 0, max: 5, step: 1, value: 2, fmt: (v) => '1/' + [1000, 500, 125, 30, 8, 2][v] + ' s', onInput: (v) => { shut = [1000, 500, 125, 30, 8, 2][v]; } });
      api.slider(re, { label: 'ISO', min: 0, max: 4, step: 1, value: 0, fmt: (v) => [100, 400, 800, 1600, 3200][v], onInput: (v) => { iso = [100, 400, 800, 1600, 3200][v]; } });
      const info2 = document.createElement('div'); info2.className = 'mod-readout'; re.appendChild(info2);
      const MSG = {
        lens: 'Lentila adună razele de lumină dintr-un punct și le face să se întâlnească într-un alt punct: <b>imaginea</b> (răsturnată!). Doar dacă senzorul e <b>exact</b> acolo, poza e clară. Mută <b>focalizarea</b> sau apasă Autofocus.',
        exp: 'Trei lucruri decid cât de luminoasă e poza: <b>diafragma</b> (cât de mare e gaura prin care intră lumina), <b>timpul</b> (cât stă deschis obturatorul) și <b>ISO</b> (cât de sensibil e senzorul). Fiecare are și un „efect secundar”!'
      };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rl.style.display = m === 'lens' ? '' : 'none'; re.style.display = m === 'exp' ? '' : 'none'; api.say(MSG[m], 14000); api.layout(); }
      /* geometrie schematică: focala în pixeli */
      const fp = () => f * api.unit * 0.0065;
      const uOf = () => { const F = fp(), cx = api.freeW * 0.42; return Math.max(F * 1.12, Math.min(F * (1.15 + clamp(doM * 1000 / f / 6, 1, 12) * 0.28), cx - 40)); };
      const vOf = () => { const u = uOf(), F = fp(); return F * u / (u - F); };

      /* fundaluri în cache */
      const studioBg = () => A.cached('cam-studio-lab', api.W, api.H, (c, w, h) => { A.scene(c, w, h, 'lab'); });
      /* poza cu lumânarea (clară); estomparea se face la desen */
      const candlePhoto = (pw, ph) => A.cached('cam-candle-photo', pw, ph, (c, w, h) => {
        const g = c.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, w * 0.8); g.addColorStop(0, '#6a4424'); g.addColorStop(0.5, '#2a1a14'); g.addColorStop(1, '#0c0808'); c.fillStyle = g; c.fillRect(0, 0, w, h);
        const tg = c.createLinearGradient(0, h * 0.74, 0, h); tg.addColorStop(0, '#5a3a22'); tg.addColorStop(1, '#2a1a10'); c.fillStyle = tg; c.fillRect(0, h * 0.74, w, h * 0.26);
        c.save(); c.translate(w * 0.5, h * 0.8); candle(c, h * 0.62, 0.3); c.restore();
      });
      function lens(t, dt) {
        const U = api.unit, cx = api.freeW * 0.42, cy = api.cy - U * 0.05, F = fp(), u = uOf(), v = vOf(), s = focus * F;
        const h = U * 0.28, LH = U * 0.47;
        const ox = cx - u, hi = h * v / u, ix = cx + v, iy = cy + hi;
        const yTopAt = (x) => (cy - h) + (iy - (cy - h)) / (ix - cx) * (x - cx);          // raza paralelă, după lentilă
        const yCenAt = (x) => cy + (iy - cy) / (ix - cx) * (x - cx);                       // raza prin centru
        const sx = cx + s, blur = Math.abs(yTopAt(sx) - yCenAt(sx)) * 0.5;
        blurS = A.damp(blurS, blur, 12, dt);
        const lab = Math.max(12, A.fs(U, 0.045, 12)), LS = A.labelSize(U);
        /* corpul aparatului, în secțiune */
        const bx0 = cx - U * 0.16, bx1 = cx + 2.1 * F + U * 0.14, by0 = cy - U * 0.6, by1 = cy + U * 0.6;
        ctx.save();
        rrect(ctx, bx0, by0, bx1 - bx0, by1 - by0, U * 0.08);
        const bg = ctx.createLinearGradient(0, by0, 0, by1); bg.addColorStop(0, 'rgba(70,80,110,0.38)'); bg.addColorStop(1, 'rgba(20,24,40,0.5)'); ctx.fillStyle = bg; ctx.fill();
        ctx.strokeStyle = 'rgba(170,190,230,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([10, 6]); ctx.stroke(); ctx.setLineDash([]);
        const hx = bx1 - (bx1 - bx0) * 0.55; ctx.beginPath(); ctx.moveTo(hx - U * 0.2, by0); ctx.lineTo(hx - U * 0.12, by0 - U * 0.12); ctx.lineTo(hx + U * 0.12, by0 - U * 0.12); ctx.lineTo(hx + U * 0.2, by0); ctx.fillStyle = 'rgba(60,70,100,0.4)'; ctx.fill(); ctx.strokeStyle = 'rgba(170,190,230,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
        A.sphere(ctx, bx1 - U * 0.12, by0 - U * 0.025, U * 0.035, '#c9d2e2', { rim: false });
        ctx.restore();
        A.label(ctx, 'aparatul foto (în secțiune)', (bx0 + bx1) / 2, by1 + LS * 1.2, { size: LS, bg: A.LABEL_BG, color: 'rgba(200,215,255,0.85)', weight: 600 });
        /* axa optică */
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(ox - 50, cy); ctx.lineTo(Math.max(sx, ix) + U * 0.3, cy); ctx.stroke(); ctx.setLineDash([]);
        /* subiectul: o lumânare */
        A.groundShadow(ctx, ox, cy + 3, h * 0.35, h * 0.06, 0.5);
        ctx.save(); ctx.translate(ox, cy); candle(ctx, h, t); ctx.restore();
        /* conul de lumină: toate razele din vârful flăcării converg */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const tx = ox, ty = cy - h, yb = (yl) => yl + (iy - yl) / (ix - cx) * (sx - cx);
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(cx, cy - LH); ctx.lineTo(sx, yb(cy - LH)); ctx.lineTo(sx, yb(cy + LH)); ctx.lineTo(cx, cy + LH); ctx.closePath();
        const cg = ctx.createLinearGradient(tx, 0, sx, 0); cg.addColorStop(0, 'rgba(255,200,90,0.05)'); cg.addColorStop(0.5, 'rgba(255,200,90,0.13)'); cg.addColorStop(1, 'rgba(255,220,120,0.22)'); ctx.fillStyle = cg; ctx.fill();
        ctx.restore();
        /* razele principale, cu impulsuri de lumină care curg */
        const ray = (pts, col) => {
          ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
          ctx.strokeStyle = A.rgba(col, 0.95); ctx.lineWidth = 2; ctx.stroke();
          ctx.setLineDash([3, 26]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = 'rgba(255,255,240,0.8)'; ctx.lineWidth = 3; ctx.stroke();
          ctx.restore();
        };
        ray([[ox, cy - h], [cx, cy - h], [ix, iy], [cx + s, yTopAt(cx + s)]], '#ffe678');
        ray([[ox, cy - h], [cx, cy], [cx + s, yCenAt(cx + s)]], '#ffaa5a');
        /* lentila biconvexă + montura */
        const lw = 16;
        ctx.save();
        ctx.beginPath(); ctx.ellipse(cx, cy, lw, LH * 1.06, 0, 0, TAU);
        const lg = ctx.createLinearGradient(cx - lw, 0, cx + lw, 0); lg.addColorStop(0, 'rgba(190,235,255,0.55)'); lg.addColorStop(0.5, 'rgba(120,190,255,0.25)'); lg.addColorStop(1, 'rgba(80,140,230,0.5)'); ctx.fillStyle = lg; ctx.fill();
        ctx.strokeStyle = 'rgba(210,240,255,0.85)'; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx - lw * 0.35, cy - LH * 0.15, lw * 0.35, LH * 0.6, 0, 3.6, 4.6); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(cx - lw * 0.3, cy - LH * 0.55, 2.2, 5, 0, 0, TAU); ctx.fill();
        ctx.restore();
        [cy - LH * 1.06 - 12, cy + LH * 1.06 - 2].forEach((yy) => A.cylinder(ctx, cx - lw - 8, yy, lw * 2 + 16, 14, '#5b6577'));
        A.label(ctx, 'lentila', cx, cy - LH * 1.06 - LS * 1.6, { size: LS, bg: A.LABEL_BG, color: '#bfe3ff' });
        /* focarele */
        for (const sg of [-1, 1]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + sg * F, cy, 3.5, 0, TAU); ctx.fill(); txt(ctx, 'F', cx + sg * F, cy + lab * 1.3, { size: lab }); }
        /* imaginea (răsturnată) — unde s-ar forma clar */
        ctx.save(); ctx.translate(ix, cy); ctx.scale(1, -1); candle(ctx, hi, t, 0.55); ctx.restore();
        { const lt = 'imagine (răsturnată)'; ctx.save(); ctx.font = A.font(LS, 700); const lw2 = ctx.measureText(lt).width + LS * 1.1; ctx.restore(); /* lângă senzor, nu peste el — dar în ecran */ A.label(ctx, lt, Math.min(Math.max(ix, cx + s) + 14, api.freeW - 8 - lw2), iy + LS * 1.6, { size: LS, bg: A.LABEL_BG, color: '#7dffb0', align: 'left' }); }
        /* senzorul */
        const sh = U * 0.9;
        ctx.save();
        rrect(ctx, sx - 2, cy - sh / 2 - 6, 14, sh + 12, 3); ctx.fillStyle = '#1a3a2a'; ctx.fill();
        rrect(ctx, sx - 5, cy - sh / 2, 10, sh, 3);
        const sg2 = ctx.createLinearGradient(sx - 5, 0, sx + 5, 0); sg2.addColorStop(0, '#4a3a8a'); sg2.addColorStop(0.5, '#8a7ad8'); sg2.addColorStop(1, '#2a2050'); ctx.fillStyle = sg2; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1; for (let y = cy - sh / 2 + 6; y < cy + sh / 2; y += 6) { ctx.beginPath(); ctx.moveTo(sx - 5, y); ctx.lineTo(sx + 5, y); ctx.stroke(); }
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.5; rrect(ctx, sx - 5, cy - sh / 2, 10, sh, 3); ctx.stroke();
        ctx.restore();
        A.label(ctx, 'senzor', sx, cy - sh / 2 - LS * 1.4, { size: LS, bg: A.LABEL_BG, color: '#ffd166' });
        /* pata de lumină pe senzor: mică = clar, mare = neclar */
        const spotY = yCenAt(sx), spotR = Math.max(3, blurS + 3);
        A.glow(ctx, sx, spotY, spotR * 2.2, '#ffd166', clamp(0.9 - blurS / 40, 0.3, 0.9));
        /* poza rezultată (polaroid) */
        const pw = Math.min(U * 0.62, api.freeW * 0.22, 190), ph = pw * 0.75, qx = api.freeW - pw - 18, qy = api.cy - U + 14;
        ctx.save(); ctx.translate(qx + pw / 2, qy + ph / 2); ctx.rotate(0.03); ctx.translate(-(qx + pw / 2), -(qy + ph / 2));
        A.softShadow(ctx, () => { rrect(ctx, qx - 8, qy - 8, pw + 16, ph + 34, 6); ctx.fillStyle = '#f4f1ea'; ctx.fill(); }, { blur: 16, dy: 6 });
        ctx.beginPath(); ctx.rect(qx, qy, pw, ph); ctx.save(); ctx.clip();
        try { ctx.filter = 'blur(' + clamp(blurS * 0.35, 0, 9) + 'px)'; } catch (e) { }
        ctx.drawImage(candlePhoto(pw, ph), qx, qy, pw, ph); ctx.filter = 'none';
        ctx.restore();
        const ok = blur < 3;
        txt(ctx, ok ? 'poză clară ✓' : 'poză neclară', qx + pw / 2, qy + ph + 14, { size: Math.max(12, lab * 0.95), color: ok ? '#1f8a4a' : '#c0392b', halo: false, weight: 800 });
        ctx.restore();
        const vReal = f * doM * 1000 / (doM * 1000 - f);
        info.innerHTML = '<b>f =</b> ' + f + ' mm · <b>subiect:</b> ' + fmt(doM, 1) + ' m · imaginea s-ar forma la <b>' + fmt(vReal, 1) + ' mm</b> de lentilă';
      }

      /* ---------- expunerea ---------- */
      const farScene = (w, h) => A.cached('cam-far', w, h, (c) => {
        const sky = c.createLinearGradient(0, 0, 0, h * 0.66); sky.addColorStop(0, '#3f8fe0'); sky.addColorStop(1, '#cfe8f7'); c.fillStyle = sky; c.fillRect(0, 0, w, h);
        const sx = w * 0.85, sy = h * 0.17, sr = h * 0.075; const sg = c.createRadialGradient(sx, sy, 0, sx, sy, sr * 5); sg.addColorStop(0, 'rgba(255,245,200,0.9)'); sg.addColorStop(0.2, 'rgba(255,230,150,0.35)'); sg.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = sg; c.fillRect(0, 0, w, h);
        c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(sx, sy, sr, 0, TAU); c.fill();
        A.cloud(c, w * 0.22, h * 0.16, h * 0.08, 0.9); A.cloud(c, w * 0.55, h * 0.1, h * 0.06, 0.8);
        const ridge = (base, amp, f1, f2, ph, col1, col2) => { c.beginPath(); c.moveTo(0, h); const pts = []; for (let x = 0; x <= w; x += w / 14) pts.push([x, h * (base - amp * (0.6 * Math.sin(x / w * f1 + ph) + 0.4 * Math.sin(x / w * f2 + ph * 2)))]); c.lineTo(0, pts[0][1]); A.smoothPath(c, pts, false); c.lineTo(w, h); c.closePath(); const g = c.createLinearGradient(0, h * (base - amp), 0, h * 0.7); g.addColorStop(0, col1); g.addColorStop(1, col2); c.fillStyle = g; c.fill(); };
        ridge(0.5, 0.13, 7, 17, 0.3, '#8aa4c4', '#6b88a8');
        c.fillStyle = 'rgba(255,255,255,0.8)'; for (const [mx, my] of [[0.3, 0.38], [0.62, 0.4]]) { c.beginPath(); c.ellipse(w * mx, h * my, w * 0.025, h * 0.012, 0, 0, TAU); c.fill(); }
        ridge(0.6, 0.06, 5, 13, 1.4, '#5f8a68', '#3e6a4a');
        for (let i = 0; i < 11; i++) {
          const tx = w * (i + 0.3 + 0.3 * Math.sin(i * 7.1)) / 11, base = h * 0.67, th = h * (0.2 + 0.06 * Math.sin(i * 3.3)), tw = th * 0.42;
          c.fillStyle = '#4a3020'; c.fillRect(tx - tw * 0.07, base - th * 0.15, tw * 0.14, th * 0.15);
          for (let k = 0; k < 3; k++) { const y0 = base - th * (0.15 + k * 0.27), y1 = y0 - th * 0.45, ww = tw * (1 - k * 0.22); c.beginPath(); c.moveTo(tx, y1); c.quadraticCurveTo(tx - ww * 0.2, y0 - th * 0.1, tx - ww / 2, y0); c.quadraticCurveTo(tx, y0 - th * 0.05, tx + ww / 2, y0); c.quadraticCurveTo(tx + ww * 0.2, y0 - th * 0.1, tx, y1); const g = c.createLinearGradient(tx - ww / 2, 0, tx + ww / 2, 0); g.addColorStop(0, '#4f9a52'); g.addColorStop(1, '#245a30'); c.fillStyle = g; c.fill(); }
        }
      });
      const nearScene = (w, h) => A.cached('cam-near', w, h, (c) => {
        const g = c.createLinearGradient(0, h * 0.66, 0, h); g.addColorStop(0, '#5a9a48'); g.addColorStop(1, '#3a7a34'); c.fillStyle = g; c.fillRect(0, h * 0.66, w, h * 0.34);
        const rg = c.createLinearGradient(0, h * 0.76, 0, h * 0.9); rg.addColorStop(0, '#5a5e66'); rg.addColorStop(1, '#3a3d44'); c.fillStyle = rg; c.fillRect(0, h * 0.76, w, h * 0.14);
        c.fillStyle = '#c8ccd2'; c.fillRect(0, h * 0.76, w, h * 0.006); c.fillRect(0, h * 0.894, w, h * 0.006);
        c.fillStyle = '#f2f0e0'; for (let x = 0; x < w; x += w / 10) c.fillRect(x, h * 0.826, w / 20, h * 0.008);
        c.fillStyle = 'rgba(30,80,30,0.6)'; for (let x = 0; x < w; x += 7) { const hh = 4 + (x * 13 % 7); c.fillRect(x, h * 0.755 - hh, 1.5, hh); }
      });
      const noiseTex = (dark) => A.cached('cam-noise-' + (dark ? 'd' : 'l'), 256, 256, (c, w, h) => { const d = c.createImageData(w, h); let s = dark ? 3 : 5; for (let i = 0; i < d.data.length; i += 4) { s = (s * 16807) % 2147483647; const on = (s % 100) < 14; const v = dark ? 0 : 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = on ? 150 + (s % 100) : 0; } c.putImageData(d, 0, 0); });
      function car(x, y, k, a) {
        ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(k, k);
        if (a > 0.9) A.groundShadow(ctx, 36, 0, 40, 5, 0.5);
        ctx.beginPath(); ctx.moveTo(2, -8); ctx.quadraticCurveTo(0, -20, 8, -22); ctx.lineTo(16, -23); ctx.quadraticCurveTo(22, -36, 34, -37); ctx.lineTo(48, -37); ctx.quadraticCurveTo(56, -36, 60, -24); ctx.lineTo(66, -22); ctx.quadraticCurveTo(72, -20, 72, -12); ctx.lineTo(72, -8); ctx.closePath();
        A.volumeFill(ctx, 0, -37, 0, -6, '#e8453a', { hi: 0.3, lo: 0.4 });
        ctx.fillStyle = '#bfe6f7'; ctx.beginPath(); ctx.moveTo(22, -24); ctx.quadraticCurveTo(26, -33, 34, -34); ctx.lineTo(39, -34); ctx.lineTo(39, -24); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(43, -24); ctx.lineTo(43, -34); ctx.lineTo(48, -34); ctx.quadraticCurveTo(54, -33, 57, -24); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(26, -31, 3, 5);
        ctx.fillStyle = '#fff2a8'; ctx.beginPath(); ctx.ellipse(70, -16, 2.5, 3, 0, 0, TAU); ctx.fill();
        for (const wx of [17, 56]) { ctx.fillStyle = '#1a1a1e'; ctx.beginPath(); ctx.arc(wx, -6, 8, 0, TAU); ctx.fill(); A.sphere(ctx, wx, -6, 4, '#c9d2e2', { rim: false }); }
        ctx.restore();
      }
      function exposure(t, dt) {
        const U = api.unit, W = api.freeW, pad = clamp(U * 0.08, 10, 22), fw = Math.min(W - 24 - pad * 2, U * 2), fh = fw * 0.62, fx = (W - fw) / 2, fy = api.cy - fh / 2 - 6;
        bx = (bx + dt * 0.25) % 1.4;
        const B = (iso / 100) * (1 / shut) / (1 / 125) / Math.pow(N / 8, 2);
        /* corpul aparatului (spatele), cu ecranul */
        const cx0 = fx - pad, cy0 = fy - pad, cw = fw + pad * 2, ch = fh + pad * 2;
        A.softShadow(ctx, () => { rrect(ctx, cx0, cy0, cw, ch, pad * 1.2); const g = ctx.createLinearGradient(0, cy0, 0, cy0 + ch); g.addColorStop(0, '#3a3f4c'); g.addColorStop(0.5, '#23262f'); g.addColorStop(1, '#14161c'); ctx.fillStyle = g; ctx.fill(); }, { blur: 10, dy: 4 });
        rrect(ctx, cx0, cy0, cw, ch, pad * 1.2); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; ctx.stroke();
        /* cocoașa vizorului + declanșator */
        ctx.save(); ctx.beginPath(); ctx.moveTo(cx0 + cw * 0.38, cy0 + 2); ctx.lineTo(cx0 + cw * 0.42, cy0 - pad * 1.4); ctx.lineTo(cx0 + cw * 0.58, cy0 - pad * 1.4); ctx.lineTo(cx0 + cw * 0.62, cy0 + 2); ctx.closePath(); ctx.fillStyle = '#2c303a'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.stroke(); ctx.restore();
        A.cylinder(ctx, cx0 + cw * 0.82, cy0 - pad * 0.7, cw * 0.07, pad * 0.75, '#8a93a8');
        A.sphere(ctx, cx0 + cw * 0.12, cy0 - pad * 0.3, pad * 0.35, '#e8394f', { rim: false });
        ctx.save(); ctx.beginPath(); rrect(ctx, fx, fy, fw, fh, 10); ctx.clip();
        /* fundal: cer, munți, copaci — neclar cu cât diafragma e mai deschisă */
        const bgBlur = clamp(7 * (1.4 / N) * 4.2, 0, 11) * (N < 5 ? 1 : N < 9 ? 0.35 : 0);
        try { ctx.filter = 'blur(' + bgBlur + 'px)'; } catch (e) { }
        ctx.drawImage(farScene(fw, fh), fx - (bgBlur ? 6 : 0), fy - (bgBlur ? 6 : 0), fw + (bgBlur ? 12 : 0), fh + (bgBlur ? 12 : 0));
        ctx.filter = 'none';
        ctx.drawImage(nearScene(fw, fh), fx, fy, fw, fh);
        /* subiectul care se mișcă (mașina) — blur de mișcare ∝ timp de expunere */
        const trail = clamp(fw * 0.5 * (125 / shut) * 0 + fw * 0.9 / shut * 6, 0, fw * 0.45);
        const carX = fx + fw * (bx - 0.2) / 1.0, cy2 = fy + fh * 0.84, ck = fw / 520;
        const steps = Math.max(1, Math.round(trail / 6));
        for (let i = steps; i >= 0; i--) car(carX - trail * i / steps, cy2, ck, i === 0 ? 1 : 0.9 / steps + 0.05);
        ctx.restore();
        /* luminozitate: întunecat sau ars */
        ctx.save(); ctx.beginPath(); rrect(ctx, fx, fy, fw, fh, 10); ctx.clip();
        if (B < 1) { ctx.fillStyle = 'rgba(0,0,10,' + clamp(1 - Math.pow(B, 0.6), 0, 0.93) + ')'; ctx.fillRect(fx, fy, fw, fh); }
        else { ctx.fillStyle = 'rgba(255,255,255,' + clamp((B - 1) * 0.28, 0, 0.92) + ')'; ctx.fillRect(fx, fy, fw, fh); }
        /* zgomot ∝ ISO (textură pre-randată, mutată aleator la fiecare cadru) */
        const grain = clamp((iso - 100) / 3100, 0, 1) * 0.9;
        if (grain > 0) for (const dark of [false, true]) { ctx.globalAlpha = grain * (dark ? 0.8 : 1); ctx.fillStyle = ctx.createPattern(noiseTex(dark), 'repeat'); const fr = Math.floor(t * 30), ox = (fr * 97 + (dark ? 131 : 0)) % 256, oy = (fr * 61 + (dark ? 77 : 0)) % 256; /* după timpul modulului: la pauză, zgomotul stă pe loc */ ctx.translate(ox, oy); ctx.fillRect(fx - ox, fy - oy, fw, fh); ctx.translate(-ox, -oy); }
        ctx.globalAlpha = 1;
        /* reflexie pe sticla ecranului */
        const rg = ctx.createLinearGradient(fx, fy, fx + fw * 0.6, fy + fh); rg.addColorStop(0, 'rgba(255,255,255,0.12)'); rg.addColorStop(0.35, 'rgba(255,255,255,0.03)'); rg.addColorStop(0.36, 'rgba(255,255,255,0)'); ctx.fillStyle = rg; ctx.fillRect(fx, fy, fw, fh);
        ctx.restore();
        rrect(ctx, fx, fy, fw, fh, 10); ctx.strokeStyle = A.ink('#3a3f4c'); ctx.lineWidth = A.lineW(U) * 1.5; ctx.stroke();
        const lab = B < 0.55 ? ['Prea întunecată (subexpusă)', '#ff9a7a'] : B > 2 ? ['Prea luminoasă (supraexpusă)', '#ff9a7a'] : ['Expunere bună ✓', '#7dffb0'];
        A.label(ctx, lab[0], W / 2, cy0 + ch + Math.max(22, A.fs(U, 0.07, 22)), { size: A.labelSize(U), bg: A.LABEL_BG, color: lab[1] });
        const eff = []; if (N < 5) eff.push('fundal neclar (diafragmă deschisă)'); if (shut <= 30) eff.push('mașina e „ștearsă” (timp lung)'); if (iso >= 1600) eff.push('zgomot (ISO mare)'); if (!eff.length) eff.push('poză clară, fără efecte');
        info2.innerHTML = '<b>Efecte:</b> ' + eff.join(' · ');
      }
      function frame(dt, t) { ctx.drawImage(studioBg(), 0, 0, api.W, api.H); if (mode === 'lens') lens(t, dt); else exposure(t, dt); }
      setMode('lens');
      return { frame: frame };
    }
  });
})();
