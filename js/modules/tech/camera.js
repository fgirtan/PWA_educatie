/* Modul: Aparatul foto */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y, x + r, y); ctx.closePath(); }

  /* ============================================================
     2) APARATUL FOTO
     ============================================================ */
  defineModule({
    id: 'camera', title: 'Aparatul foto', sub: 'Lentila, focalizarea și expunerea',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'lens', f = 50, doM = 2, focus = 1.4, N = 8, shut = 125, iso = 100, bx = 0;
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
      function lens() {
        const U = api.unit, cx = api.freeW * 0.42, cy = api.cy - U * 0.05, F = fp(), u = uOf(), v = vOf(), s = focus * F;
        const h = U * 0.28;
        /* axa */
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(cx - u - 50, cy); ctx.lineTo(cx + U * 1.5, cy); ctx.stroke(); ctx.setLineDash([]);
        /* subiect */
        const ox = cx - u;
        ctx.strokeStyle = '#ffb067'; ctx.fillStyle = '#ffb067'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ox, cy); ctx.lineTo(ox, cy - h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox, cy - h - 10); ctx.lineTo(ox - 8, cy - h + 4); ctx.lineTo(ox + 8, cy - h + 4); ctx.fill();
        /* lentila */
        const g = ctx.createLinearGradient(cx - 14, 0, cx + 14, 0); g.addColorStop(0, 'rgba(160,220,255,0.7)'); g.addColorStop(1, 'rgba(100,170,255,0.4)'); ctx.fillStyle = g; ctx.strokeStyle = '#bfe3ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, 15, U * 0.5, 0, 0, 7); ctx.fill(); ctx.stroke();
        /* focare */
        ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center';
        for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + sg * F, cy, 3.5, 0, 7); ctx.fill(); ctx.fillText('F', cx + sg * F, cy + 18); }
        /* imaginea (răsturnată) */
        const hi = h * v / u, ix = cx + v, iy = cy + hi;
        ctx.strokeStyle = '#7dffb0'; ctx.fillStyle = '#7dffb0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ix, cy); ctx.lineTo(ix, iy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ix, iy + 9); ctx.lineTo(ix - 7, iy - 3); ctx.lineTo(ix + 7, iy - 3); ctx.fill();
        ctx.fillStyle = '#7dffb0'; ctx.fillText('imagine (răsturnată)', ix, iy + 28);
        /* raze */
        const rays = [[cx, cy - h, ix, iy], [cx, cy, ix, iy]];
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,230,120,0.95)'; ctx.beginPath(); ctx.moveTo(ox, cy - h); ctx.lineTo(cx, cy - h); ctx.lineTo(ix, iy); ctx.lineTo(cx + s, cy + (iy - (cy - h)) / (ix - cx) * s - h) ; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,170,90,0.95)'; ctx.beginPath(); ctx.moveTo(ox, cy - h); ctx.lineTo(cx, cy); ctx.lineTo(cx + s * 1.0, cy + (iy - cy) / (ix - cx) * s); ctx.stroke();
        /* senzor */
        const sx = cx + s, blur = Math.abs((cy - h + (iy - (cy - h)) / (ix - cx) * s) - (cy + (iy - cy) / (ix - cx) * s)) * 0.5;
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx, cy - U * 0.45); ctx.lineTo(sx, cy + U * 0.45); ctx.stroke();
        ctx.fillStyle = '#ffd166'; ctx.fillText('senzor', sx, cy - U * 0.45 - 8);
        ctx.fillStyle = 'rgba(255,209,102,' + clamp(0.3 + blur / 20, 0, 0.8) + ')'; ctx.beginPath(); ctx.arc(sx, cy + (iy - cy) / (ix - cx) * s + (-h * 0 ), Math.max(3, blur + 3), 0, 7); ctx.fill();
        /* poza rezultată (cadru) */
        const pw = Math.min(110, api.freeW * 0.2), ph = pw * 0.75, qx = api.freeW - pw - 14, qy = api.cy - U + 6 + 4;
        ctx.save(); ctx.fillStyle = '#1b2442'; ctx.fillRect(qx - 6, qy - 6, pw + 12, ph + 26); ctx.beginPath(); ctx.rect(qx, qy, pw, ph); ctx.clip();
        ctx.fillStyle = '#7ab6e8'; ctx.fillRect(qx, qy, pw, ph); ctx.fillStyle = '#4c8a3c'; ctx.fillRect(qx, qy + ph * 0.7, pw, ph * 0.3);
        try { ctx.filter = 'blur(' + clamp(blur * 0.35, 0, 9) + 'px)'; } catch (e) { }
        ctx.fillStyle = '#ffb067'; ctx.fillRect(qx + pw * 0.46, qy + ph * 0.25, pw * 0.08, ph * 0.5); ctx.beginPath(); ctx.arc(qx + pw * 0.5, qy + ph * 0.2, ph * 0.1, 0, 7); ctx.fill(); ctx.filter = 'none';
        ctx.restore(); ctx.fillStyle = blur < 3 ? '#7dffb0' : '#ff9a7a'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(blur < 3 ? 'poză clară ✓' : 'poză neclară', qx + pw / 2, qy + ph + 16);
        const vReal = f * doM * 1000 / (doM * 1000 - f);
        info.innerHTML = '<b>f =</b> ' + f + ' mm · <b>subiect:</b> ' + fmt(doM, 1) + ' m · imaginea s-ar forma la <b>' + fmt(vReal, 1) + ' mm</b> de lentilă';
      }
      function exposure(t, dt) {
        const U = api.unit, W = api.freeW, fw = Math.min(W - 24, U * 2), fh = fw * 0.62, fx = (W - fw) / 2, fy = api.cy - fh / 2 - 6;
        bx = (bx + dt * 0.25) % 1.4;
        const B = (iso / 100) * (1 / shut) / (1 / 125) / Math.pow(N / 8, 2);
        ctx.save(); ctx.beginPath(); rrect(ctx, fx, fy, fw, fh, 12); ctx.clip();
        /* fundal: cer, munți, copaci — neclar cu cât diafragma e mai deschisă */
        const sky = ctx.createLinearGradient(0, fy, 0, fy + fh); sky.addColorStop(0, '#5aa6e8'); sky.addColorStop(1, '#cfe8f7'); ctx.fillStyle = sky; ctx.fillRect(fx, fy, fw, fh);
        const bgBlur = clamp(7 * (1.4 / N) * 4.2, 0, 11) * (N < 5 ? 1 : N < 9 ? 0.35 : 0);
        try { ctx.filter = 'blur(' + bgBlur + 'px)'; } catch (e) { }
        ctx.fillStyle = '#6b8aa8'; ctx.beginPath(); ctx.moveTo(fx, fy + fh * 0.62); for (let x = 0; x <= fw; x += 10) ctx.lineTo(fx + x, fy + fh * (0.5 - 0.12 * Math.sin(x * 0.02) - 0.08 * Math.sin(x * 0.05))); ctx.lineTo(fx + fw, fy + fh * 0.62); ctx.fill();
        ctx.fillStyle = '#3d7a3c'; for (let i = 0; i < 9; i++) { const tx = fx + fw * (i + 0.4) / 9; ctx.beginPath(); ctx.moveTo(tx, fy + fh * 0.4); ctx.lineTo(tx - 16, fy + fh * 0.66); ctx.lineTo(tx + 16, fy + fh * 0.66); ctx.fill(); }
        ctx.fillStyle = '#ffd35a'; ctx.beginPath(); ctx.arc(fx + fw * 0.85, fy + fh * 0.17, 20, 0, 7); ctx.fill();
        ctx.filter = 'none';
        ctx.fillStyle = '#4c8a3c'; ctx.fillRect(fx, fy + fh * 0.66, fw, fh * 0.34); ctx.fillStyle = '#555'; ctx.fillRect(fx, fy + fh * 0.76, fw, fh * 0.14);
        /* subiectul care se mișcă (mașina) — blur de mișcare ∝ timp de expunere */
        const trail = clamp(fw * 0.5 * (125 / shut) * 0 + fw * 0.9 / shut * 6, 0, fw * 0.45);
        const carX = fx + fw * (bx - 0.2) / 1.0, cy2 = fy + fh * 0.74;
        const drawCar = (x, a) => { ctx.globalAlpha = a; ctx.fillStyle = '#e8453a'; rrect(ctx, x, cy2 - 22, 70, 18, 5); ctx.fill(); rrect(ctx, x + 14, cy2 - 36, 38, 18, 6); ctx.fill(); ctx.fillStyle = '#9fd6f0'; ctx.fillRect(x + 19, cy2 - 32, 12, 10); ctx.fillRect(x + 34, cy2 - 32, 12, 10); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x + 16, cy2 - 4, 7, 0, 7); ctx.arc(x + 54, cy2 - 4, 7, 0, 7); ctx.fill(); ctx.globalAlpha = 1; };
        const steps = Math.max(1, Math.round(trail / 6));
        for (let i = steps; i >= 0; i--) drawCar(carX - trail * i / steps, i === 0 ? 1 : 0.9 / steps + 0.05);
        ctx.restore();
        /* luminozitate: întunecat sau ars */
        ctx.save(); ctx.beginPath(); rrect(ctx, fx, fy, fw, fh, 12); ctx.clip();
        if (B < 1) { ctx.fillStyle = 'rgba(0,0,10,' + clamp(1 - Math.pow(B, 0.6), 0, 0.93) + ')'; ctx.fillRect(fx, fy, fw, fh); }
        else { ctx.fillStyle = 'rgba(255,255,255,' + clamp((B - 1) * 0.28, 0, 0.92) + ')'; ctx.fillRect(fx, fy, fw, fh); }
        /* zgomot ∝ ISO */
        const grain = clamp((iso - 100) / 3100, 0, 1) * 0.9;
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < grain * 700; i++) ctx.fillRect(fx + Math.random() * fw, fy + Math.random() * fh, 1.6, 1.6);
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; for (let i = 0; i < grain * 500; i++) ctx.fillRect(fx + Math.random() * fw, fy + Math.random() * fh, 1.6, 1.6);
        ctx.restore();
        ctx.strokeStyle = '#8aa0c8'; ctx.lineWidth = 3; rrect(ctx, fx, fy, fw, fh, 12); ctx.stroke();
        const lab = B < 0.55 ? ['Prea întunecată (subexpusă)', '#ff9a7a'] : B > 2 ? ['Prea luminoasă (supraexpusă)', '#ff9a7a'] : ['Expunere bună ✓', '#7dffb0'];
        ctx.fillStyle = lab[1]; ctx.font = '700 15px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(lab[0], W / 2, fy + fh + 26);
        const eff = []; if (N < 5) eff.push('fundal neclar (diafragmă deschisă)'); if (shut <= 30) eff.push('mașina e „ștearsă” (timp lung)'); if (iso >= 1600) eff.push('zgomot (ISO mare)'); if (!eff.length) eff.push('poză clară, fără efecte');
        info2.innerHTML = '<b>Efecte:</b> ' + eff.join(' · ');
      }
      function frame(dt, t) { bg(api, '#0b1330', '#05080f'); if (mode === 'lens') lens(); else exposure(t, dt); }
      setMode('lens');
      return { frame: frame };
    }
  });
})();
