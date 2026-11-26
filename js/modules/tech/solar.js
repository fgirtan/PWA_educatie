/* Modul: Panourile solare */
(function () {
  const A = window.Art;
  const TAU = Math.PI * 2;
  const txt = (ctx, s, x, y, o) => A.text(ctx, s, x, y, Object.assign({ halo: false }, o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const mix = (a, b, t) => 'rgb(' + [0, 1, 2].map((i) => Math.round(lerp(a[i], b[i], clamp(t, 0, 1)))).join(',') + ')';
  const rrect = (ctx, x, y, w, h, r) => A.roundRectPath(ctx, x, y, w, h, r);

  defineModule({
    id: 'solar', title: 'Panourile solare', sub: 'Cum face soarele curent electric',
    start: function (api) {
      const ctx = api.ctx;
      let hour = 7, play = true, tilt = 0, tracker = false, cloud = 0, cloudOn = false, bat = 0.4, energy = 0, speed = 1, photons = [], hist = new Array(241).fill(null), lastDay = 0;
      let batShown = 0.4;
      const PMAX = 400, CAP = 1000, LOAD = 60;               // W vârf, Wh baterie, W consum casă
      const r1 = api.row('');
      const slH = api.slider(r1, { label: 'Ora din zi', min: 0, max: 24, step: 0.05, value: hour, fmt: (v) => { const h = Math.floor(v), m = Math.floor((v - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }, onInput: (v) => { hour = v; play = false; bP.innerHTML = '▶ Pornește ziua'; } });
      const bP = api.button(r1, '⏸ Pauză', () => { play = !play; bP.innerHTML = play ? '⏸ Pauză' : '▶ Pornește ziua'; });
      const r2 = api.row('');
      const slT = api.slider(r2, { label: 'Înclinarea panoului', min: -60, max: 60, step: 1, value: tilt, fmt: (v) => (v < -5 ? '← spre est ' : v > 5 ? 'spre vest → ' : 'drept ') + Math.abs(v) + '°', onInput: (v) => { tilt = v; } });
      const bTr = api.button(r2, '🔄 Urmărește soarele: NU', () => { tracker = !tracker; bTr.classList.toggle('on', tracker); bTr.innerHTML = '🔄 Urmărește soarele: ' + (tracker ? 'DA' : 'NU'); api.say(tracker ? 'Panoul se întoarce după soare tot timpul zilei și produce mai mult!' : 'Acum panoul stă pe loc. Încearcă să-l înclini singur spre soare!', 7000); });
      const bC = api.button(r2, '☁️ Nor', () => { cloudOn = !cloudOn; bC.classList.toggle('on', cloudOn); api.say(cloudOn ? 'Norii opresc o parte din lumină, deci panoul produce <b>mult mai puțin</b>.' : 'Cer senin!', 6000); });
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Un <b>panou solar</b> e făcut din celule de siliciu. Când lumina (fotonii) lovește celula, <b>smulge electroni</b> și îi pune în mișcare: iese curent electric! Cu cât soarele bate mai drept pe panou, cu atât iese mai mult. Curentul încarcă o <b>baterie</b>, iar noaptea casa folosește bateria.', 16000);

      function sunAt(h) { const b = Math.PI * (h - 6) / 14; return { b: b, up: h > 6 && h < 20 }; }
      let effTiltS = 0;

      /* peisajul (dealuri, copaci) — desenat o dată, colorat de zi; noaptea se întunecă cu un strat peste */
      function land(hy) {
        const U = api.unit;
        return A.cached('sol-land-' + Math.round(hy), api.W, api.H, (c, w, h) => {
          const ridge = (base, amp, f, ph, col) => { const pts = []; for (let x = 0; x <= w + w / 10; x += w / 10) pts.push([x, base - amp * (0.6 + 0.4 * Math.sin(x / w * f + ph))]); c.beginPath(); c.moveTo(0, h); c.lineTo(0, pts[0][1]); A.smoothPath(c, pts, false); c.lineTo(w, h); c.closePath(); c.fillStyle = col; c.fill(); };
          ridge(hy, U * 0.22, 5, 0.6, '#9fb6a4');
          ridge(hy, U * 0.12, 8, 2.1, '#7fa27c');
          const g = c.createLinearGradient(0, hy, 0, h); g.addColorStop(0, '#6f9a58'); g.addColorStop(1, '#4a7240'); c.fillStyle = g; c.fillRect(0, hy, w, h - hy);
          /* câțiva copaci în depărtare */
          for (const [fx, s] of [[0.06, 1], [0.1, 0.8], [0.9, 1.1], [0.95, 0.85], [0.7, 0.7]]) {
            const x = w * fx, th = U * 0.2 * s;
            c.fillStyle = '#5a4030'; c.fillRect(x - th * 0.05, hy - th * 0.35, th * 0.1, th * 0.35);
            const tg = c.createRadialGradient(x - th * 0.12, hy - th * 0.7, th * 0.05, x, hy - th * 0.6, th * 0.42); tg.addColorStop(0, '#6c9e58'); tg.addColorStop(1, '#3e6a3a'); c.fillStyle = tg;
            c.beginPath(); c.ellipse(x, hy - th * 0.62, th * 0.3, th * 0.38, 0, 0, TAU); c.fill();
          }
        });
      }
      const starField = () => A.cached('sol-stars', api.W, api.H, (c, w, h) => { let s = 17; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 90; i++) { const r = rnd() < 0.85 ? 0.8 : 1.4; c.fillStyle = 'rgba(255,255,255,' + (0.4 + rnd() * 0.5) + ')'; c.beginPath(); c.arc(rnd() * w, rnd() * h * 0.6, r, 0, TAU); c.fill(); } });

      function house(hxl, hy, hw, hh, U, roofH) {
        const hx = hxl + hw / 2;
        A.groundShadow(ctx, hx + hw * 0.05, hy, hw * 0.62, hw * 0.06, 0.4);
        /* coș */
        ctx.fillStyle = '#8a5a48'; ctx.fillRect(hxl + hw * 0.7, hy - hh - roofH * 0.8, hw * 0.09, roofH * 0.6); ctx.fillStyle = '#6a4436'; ctx.fillRect(hxl + hw * 0.69, hy - hh - roofH * 0.82, hw * 0.11, roofH * 0.08);
        /* pereți */
        const wg = ctx.createLinearGradient(hxl, 0, hxl + hw, 0); wg.addColorStop(0, '#efe3c8'); wg.addColorStop(1, '#d4c3a0'); ctx.fillStyle = wg; ctx.fillRect(hxl, hy - hh, hw, hh);
        ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(hxl, hy - hh * 0.08, hw, hh * 0.08);
        /* acoperiș din țigle */
        ctx.save(); ctx.beginPath(); ctx.moveTo(hxl - hw * 0.08, hy - hh); ctx.lineTo(hx, hy - hh - roofH); ctx.lineTo(hxl + hw * 1.08, hy - hh); ctx.closePath();
        const rg = ctx.createLinearGradient(0, hy - hh - roofH, 0, hy - hh); rg.addColorStop(0, '#b4533a'); rg.addColorStop(1, '#8a3a2a'); ctx.fillStyle = rg; ctx.fill(); ctx.clip();
        ctx.strokeStyle = 'rgba(60,20,10,0.35)'; ctx.lineWidth = 1; for (let y = hy - hh - roofH + 6; y < hy - hh; y += Math.max(5, roofH / 7)) { ctx.beginPath(); ctx.moveTo(hxl - hw * 0.1, y); ctx.lineTo(hxl + hw * 1.1, y); ctx.stroke(); }
        ctx.restore();
        ctx.strokeStyle = '#6a2a1e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hxl - hw * 0.08, hy - hh); ctx.lineTo(hx, hy - hh - roofH); ctx.lineTo(hxl + hw * 1.08, hy - hh); ctx.stroke();
        /* ușa */
        const dw = hw * 0.14, dh = hh * 0.55, dx = hx - dw / 2;
        rrect(ctx, dx, hy - dh, dw, dh, dw * 0.12); const dg = ctx.createLinearGradient(dx, 0, dx + dw, 0); dg.addColorStop(0, '#7a5236'); dg.addColorStop(1, '#5a3a24'); ctx.fillStyle = dg; ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1; ctx.strokeRect(dx + dw * 0.18, hy - dh * 0.9, dw * 0.64, dh * 0.35); ctx.strokeRect(dx + dw * 0.18, hy - dh * 0.48, dw * 0.64, dh * 0.38);
        ctx.fillStyle = '#d8b04a'; ctx.beginPath(); ctx.arc(dx + dw * 0.8, hy - dh * 0.5, Math.max(1.5, dw * 0.06), 0, TAU); ctx.fill();
      }
      function windows(hxl, hy, hw, hh, lit, k) {
        for (const fx of [0.12, 0.66]) {
          const x = hxl + hw * fx, y = hy - hh * 0.7, w = hw * 0.22, h = hh * 0.38;
          ctx.fillStyle = '#f4efe4'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
          ctx.fillStyle = lit ? mix([42, 58, 90], [255, 222, 140], k) : '#2a3a5a'; ctx.fillRect(x, y, w, h);
          if (!lit || k < 0.5) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.45, y); ctx.lineTo(x, y + h * 0.6); ctx.closePath(); ctx.fill(); }
          ctx.fillStyle = '#f4efe4'; ctx.fillRect(x + w / 2 - 1.5, y, 3, h); ctx.fillRect(x, y + h / 2 - 1.5, w, 3);
          ctx.fillStyle = '#c9bfae'; ctx.fillRect(x - 5, y + h + 3, w + 10, 3);
        }
      }
      /* panou solar realist (cadru de aluminiu, celule albastre, sticlă) — centrat, rotit cu înclinarea */
      function panel(pw, ph, P) {
        ctx.fillStyle = '#5b6272'; ctx.fillRect(-pw / 2 + 2, ph / 2, pw - 4, 3);
        const fr = Math.max(2, ph * 0.12);
        rrect(ctx, -pw / 2, -ph / 2, pw, ph, 2); const fg = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); fg.addColorStop(0, '#e6eaf0'); fg.addColorStop(1, '#9aa3b2'); ctx.fillStyle = fg; ctx.fill();
        const cx0 = -pw / 2 + fr, cy0 = -ph / 2 + fr, cw = pw - 2 * fr, chh = ph - 2 * fr;
        const cg = ctx.createLinearGradient(0, cy0, 0, cy0 + chh); cg.addColorStop(0, '#2b4a9a'); cg.addColorStop(1, '#14275e'); ctx.fillStyle = cg; ctx.fillRect(cx0, cy0, cw, chh);
        const nc = 10, nr = 2;
        ctx.strokeStyle = 'rgba(200,215,240,0.55)'; ctx.lineWidth = 1;
        for (let k = 1; k < nc; k++) { ctx.beginPath(); ctx.moveTo(cx0 + cw * k / nc, cy0); ctx.lineTo(cx0 + cw * k / nc, cy0 + chh); ctx.stroke(); }
        for (let k = 1; k < nr; k++) { ctx.beginPath(); ctx.moveTo(cx0, cy0 + chh * k / nr); ctx.lineTo(cx0 + cw, cy0 + chh * k / nr); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(160,180,220,0.25)'; ctx.lineWidth = 0.6; for (let k = 0; k < nc * 3; k++) { const x = cx0 + cw * (k + 0.5) / (nc * 3); ctx.beginPath(); ctx.moveTo(x, cy0); ctx.lineTo(x, cy0 + chh); ctx.stroke(); }
        /* reflexia cerului pe sticlă + strălucire când produce */
        ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.beginPath(); ctx.moveTo(cx0 + cw * 0.08, cy0); ctx.lineTo(cx0 + cw * 0.3, cy0); ctx.lineTo(cx0 + cw * 0.22, cy0 + chh); ctx.lineTo(cx0, cy0 + chh); ctx.closePath(); ctx.fill();
        if (P > 5) { ctx.fillStyle = 'rgba(255,250,200,' + clamp(P / PMAX, 0, 1) * 0.35 + ')'; ctx.fillRect(cx0, cy0, cw, chh); }
      }
      function battery(bx, by, bw, bh, lv) {
        A.groundShadow(ctx, bx, by + bh / 2, bw * 0.7, bw * 0.08, 0.4);
        /* bornele */
        A.cylinder(ctx, bx - bw * 0.3, by - bh / 2 - bh * 0.1, bw * 0.16, bh * 0.12, '#c7ccd6', true);
        A.cylinder(ctx, bx + bw * 0.14, by - bh / 2 - bh * 0.1, bw * 0.16, bh * 0.12, '#c7ccd6', true);
        /* carcasa */
        rrect(ctx, bx - bw / 2, by - bh / 2, bw, bh, bw * 0.1);
        const g = ctx.createLinearGradient(bx - bw / 2, 0, bx + bw / 2, 0); g.addColorStop(0, '#3a414f'); g.addColorStop(0.3, '#5a6272'); g.addColorStop(1, '#23272f'); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();
        /* fereastra cu nivelul (animat lin) */
        const wx = bx - bw * 0.36, wy = by - bh * 0.32, ww = bw * 0.72, wh = bh * 0.62;
        rrect(ctx, wx, wy, ww, wh, 4); ctx.fillStyle = '#0d1118'; ctx.fill();
        const col = lv > 0.5 ? '#3cc46a' : lv > 0.2 ? '#e8c23a' : '#e2533e';
        if (lv > 0.005) { ctx.save(); rrect(ctx, wx, wy, ww, wh, 4); ctx.clip(); const fy = wy + wh * (1 - lv); const lg = ctx.createLinearGradient(wx, 0, wx + ww, 0); lg.addColorStop(0, A.shade(col, -0.2)); lg.addColorStop(0.5, A.shade(col, 0.15)); lg.addColorStop(1, A.shade(col, -0.25)); ctx.fillStyle = lg; ctx.fillRect(wx, fy, ww, wh); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(wx, fy, ww, 2); ctx.restore(); }
        /* fulger desenat */
        ctx.save(); ctx.translate(bx, wy + wh / 2); const s = wh * 0.28; ctx.beginPath(); ctx.moveTo(s * 0.15, -s); ctx.lineTo(-s * 0.45, s * 0.12); ctx.lineTo(-s * 0.02, s * 0.12); ctx.lineTo(-s * 0.18, s); ctx.lineTo(s * 0.45, -s * 0.15); ctx.lineTo(s * 0.02, -s * 0.15); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill(); ctx.restore();
      }

      function frame(dt, t) {
        if (play) { hour += dt * 0.9 * speed; if (hour >= 24) { hour -= 24; hist.fill(null); energy = 0; } slH.set(hour); }
        const U = api.unit, W = api.freeW, cx = api.cx, H = api.H;
        const sn = sunAt(hour), b = sn.b;
        const effTilt = tracker ? clamp(Math.round((b - Math.PI / 2) * 180 / Math.PI), -60, 60) : tilt; if (tracker) slT.set(effTilt);
        effTiltS = A.damp(effTiltS, effTilt, 8, dt);
        cloud += ((cloudOn ? 1 : 0) - cloud) * Math.min(1, dt * 1.5);
        const light = sn.up ? Math.max(0, Math.sin(b)) : 0;                         // intensitatea lumii (dimineața/seara mai slabă)
        const inc = sn.up ? Math.max(0, Math.sin(b - effTilt * Math.PI / 180)) : 0;  // cât de drept bate soarele pe panou
        const P = PMAX * inc * Math.pow(light, 0.4) * (1 - 0.82 * cloud);
        const hrs = dt * 0.9 * speed * (play ? 1 : 0);
        bat = clamp(bat + (P - LOAD) * hrs / CAP, 0, 1); energy += P * hrs;
        batShown = A.damp(batShown, bat, 6, dt);
        hist[Math.round(hour * 10)] = P;
        /* cer: noapte → răsărit (cald) → zi */
        const day = clamp(Math.sin(b) * 1.4 + 0.1, 0, 1), dusk = sn.up ? clamp(1 - Math.abs(Math.sin(b)) * 3.2, 0, 1) : 0;
        const hy = api.cy + U * 0.2;
        const sky = ctx.createLinearGradient(0, 0, 0, hy);
        sky.addColorStop(0, mix([12, 18, 44], [70, 130, 205], day)); sky.addColorStop(1, mix(mix2([20, 28, 60], [240, 170, 120], dusk), [200, 226, 245], day));
        ctx.fillStyle = sky; ctx.fillRect(0, 0, api.W, hy + 2);
        if (day < 0.6) { ctx.save(); ctx.globalAlpha = 1 - day / 0.6; ctx.drawImage(starField(), 0, 0, api.W, api.H); ctx.restore(); }
        if (!sn.up) { const mx = W * 0.8, my = api.cy - U * 0.55, mr = clamp(U * 0.06, 12, 24); ctx.fillStyle = '#ece8d8'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(160,155,140,0.35)'; for (const [dx, dy, r] of [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.16], [-0.05, 0.4, 0.12]]) { ctx.beginPath(); ctx.arc(mx + dx * mr, my + dy * mr, r * mr, 0, TAU); ctx.fill(); } }
        /* soarele pe arc */
        const sxp = lerp(W * 0.06, W * 0.94, (hour - 6) / 14), syp = hy - Math.sin(b) * U * 0.95, sr = clamp(U * 0.07, 14, 30);
        if (sn.up) {
          A.glow(ctx, sxp, syp, sr * 3, '#ffe9a0', 0.35 * (1 - cloud * 0.7));
          const sg = ctx.createRadialGradient(sxp - sr * 0.3, syp - sr * 0.3, 0, sxp, syp, sr); sg.addColorStop(0, '#fffbe0'); sg.addColorStop(1, dusk > 0.3 ? '#ffb04a' : '#ffd84a'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sxp, syp, sr, 0, TAU); ctx.fill();
          ctx.save(); ctx.strokeStyle = 'rgba(255,220,110,0.7)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + t * 0.08; ctx.beginPath(); ctx.moveTo(sxp + Math.cos(a) * sr * 1.3, syp + Math.sin(a) * sr * 1.3); ctx.lineTo(sxp + Math.cos(a) * sr * 1.65, syp + Math.sin(a) * sr * 1.65); ctx.stroke(); } ctx.restore();
        }
        /* nori */
        if (cloud > 0.02) for (let i = 0; i < 5; i++) { const cxp = ((t * 10 * (0.6 + i * 0.2) + i * W * 0.3) % (W * 1.3)) - W * 0.15, cyp = api.cy - U * 0.7 + (i % 3) * 22; A.cloud(ctx, cxp + 50, cyp, 34 + (i % 3) * 8, 0.92 * cloud); }
        /* peisaj + casă, întunecate noaptea */
        ctx.drawImage(land(hy), 0, 0, api.W, api.H);
        const hx = cx - U * 0.15, hw = U * 0.9, hh = U * 0.42, hxl = hx - hw / 2, roofH = U * 0.3;
        house(hxl, hy, hw, hh, U, roofH);
        const dark = (1 - day) * 0.55;
        if (dark > 0.01) { ctx.fillStyle = 'rgba(8,12,34,' + dark + ')'; ctx.fillRect(0, 0, api.W, H); }
        /* geamuri: se aprind când bateria dă lumină */
        const lit = (!sn.up || P < LOAD) && bat > 0.01 || P > LOAD * 0.5;
        windows(hxl, hy, hw, hh, lit, clamp(dark * 2, 0.35, 1));
        /* panoul pe acoperiș, pe un suport */
        const px = hx, py = hy - hh - U * 0.14, pw = U * 0.5, ph = clamp(U * 0.06, 12, 24);
        ctx.fillStyle = '#5b6272'; ctx.fillRect(px - 3, py + 4, 6, hy - hh - py - 2 + 8);
        ctx.save(); ctx.translate(px, py); ctx.rotate(effTiltS * Math.PI / 180); panel(pw, ph, P); ctx.restore();
        A.sphere(ctx, px, py, 4, '#9aa3b2', { rim: false });
        /* fotoni de la soare la panou (lumina explică fenomenul) */
        if (sn.up && light > 0.05 && Math.random() < dt * (30 * light * (1 - 0.8 * cloud))) photons.push({ k: 0 });
        photons = sn.up ? photons.filter((p) => { p.k += dt * 0.9; return p.k < 1; }) : [];
        ctx.save(); ctx.lineCap = 'round';
        for (const p of photons) { const x = lerp(sxp, px, p.k), y = lerp(syp, py, p.k), x2 = lerp(sxp, px, Math.max(0, p.k - 0.04)), y2 = lerp(syp, py, Math.max(0, p.k - 0.04)); ctx.strokeStyle = 'rgba(255,214,90,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x, y); ctx.stroke(); ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill(); }
        ctx.restore();
        /* cabluri: panou → baterie → casă, cu electroni */
        const bw = clamp(U * 0.2, 40, 80), bh = bw * 0.9, bx = hx + hw * 0.8, by = hy + bh * 0.55;
        const cab = [[px, py + 8], [px, hy - hh - 4], [hxl + hw + 4, hy - hh - 4], [hxl + hw + 4, hy + 10], [bx - bw * 0.22, by - bh / 2 - bh * 0.08]];
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(cab[0][0], cab[0][1]); for (let i = 1; i < cab.length; i++) ctx.lineTo(cab[i][0], cab[i][1]);
        ctx.strokeStyle = '#151820'; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = '#3a3f4c'; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
        if (P > 5) { ctx.fillStyle = '#7ec8ff'; ctx.strokeStyle = '#1f4f80'; ctx.lineWidth = 1; for (let i = 0; i < 6; i++) { const u = (((i / 6 + t * 0.5 * (0.3 + P / PMAX)) % 1)); const y = u < 0.5 ? lerp(py + 8, hy - hh - 4, u * 2) : lerp(hy - hh - 4, hy + 10, (u - 0.5) * 2); ctx.beginPath(); ctx.arc(u < 0.5 ? px : hxl + hw + 4, y, 3, 0, TAU); ctx.fill(); ctx.stroke(); } }
        /* baterie */
        battery(bx, by, bw, bh, clamp(batShown, 0, 1));
        const lab = Math.max(12, A.fs(U, 0.042, 12));
        txt(ctx, 'baterie ' + Math.round(bat * 100) + '%', bx, by + bh / 2 + lab * 1.1, { size: lab, color: '#fff', weight: 700 });
        A.label(ctx, 'panou solar', px, py - ph - lab, { size: lab, bg: 'rgba(15,22,45,0.7)' });
        /* grafic: puterea produsă în timpul zilei */
        const gw = Math.min(W - 30, 360), gx = 14, gy = api.cy - U + 8, gh = 52;
        A.panel(ctx, gx, gy, gw, gh + 24, { r: 10, bg: 'rgba(10,16,36,0.82)' });
        const ix = gx + 8, iw = gw - 16, iy = gy + 6, ih = gh - 6;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ix, iy + ih); ctx.lineTo(ix + iw, iy + ih); ctx.stroke();
        const ag = ctx.createLinearGradient(0, iy, 0, iy + ih); ag.addColorStop(0, 'rgba(255,209,102,0.7)'); ag.addColorStop(1, 'rgba(255,209,102,0.15)'); ctx.fillStyle = ag;
        ctx.beginPath(); ctx.moveTo(ix, iy + ih); for (let i = 0; i <= 240; i++) { const v = hist[i]; if (v !== null) ctx.lineTo(ix + iw * i / 240, iy + ih - ih * clamp(v / PMAX, 0, 1)); } ctx.lineTo(ix + iw * Math.round(hour * 10) / 240, iy + ih); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ix + iw * hour / 24, iy); ctx.lineTo(ix + iw * hour / 24, iy + ih); ctx.stroke();
        txt(ctx, 'puterea produsă azi (0–24 h)', ix, gy + gh + 13, { size: Math.max(12, A.fs(U, 0.038, 12)), align: 'left', color: 'rgba(235,240,255,0.85)', weight: 600 });
        info.innerHTML = '<b>Putere:</b> ' + fmt(P, 0) + ' W · <b>Produs azi:</b> ' + fmt(energy, 0) + ' Wh · <b>Baterie:</b> ' + Math.round(bat * 100) + '% · casa consumă ' + LOAD + ' W' + (P < 5 && !sn.up ? ' · <i>noaptea casa folosește bateria</i>' : '');
      }
      /* amestec RGB care întoarce tot tablou (pentru amestecuri în lanț) */
      function mix2(a, b, t) { return [0, 1, 2].map((i) => lerp(a[i], b[i], clamp(t, 0, 1))); }
      return { frame: frame };
    }
  });
})();
