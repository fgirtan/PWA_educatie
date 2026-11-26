/* Modul: Panourile solare */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  const mix = (a, b, t) => 'rgb(' + [0, 1, 2].map((i) => Math.round(lerp(a[i], b[i], clamp(t, 0, 1)))).join(',') + ')';

  defineModule({
    id: 'solar', title: 'Panourile solare', sub: 'Cum face soarele curent electric',
    start: function (api) {
      const ctx = api.ctx;
      let hour = 7, play = true, tilt = 0, tracker = false, cloud = 0, cloudOn = false, bat = 0.4, energy = 0, speed = 1, photons = [], hist = new Array(241).fill(null), lastDay = 0;
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
      function frame(dt, t) {
        if (play) { hour += dt * 0.9 * speed; if (hour >= 24) { hour -= 24; hist.fill(null); energy = 0; } slH.set(hour); }
        const U = api.unit, W = api.freeW, cx = api.cx, H = api.H;
        const sn = sunAt(hour), b = sn.b;
        const effTilt = tracker ? clamp(Math.round((b - Math.PI / 2) * 180 / Math.PI), -60, 60) : tilt; if (tracker) slT.set(effTilt);
        cloud += ((cloudOn ? 1 : 0) - cloud) * Math.min(1, dt * 1.5);
        const light = sn.up ? Math.max(0, Math.sin(b)) : 0;                         // intensitatea lumii (dimineața/seara mai slabă)
        const inc = sn.up ? Math.max(0, Math.sin(b - effTilt * Math.PI / 180)) : 0;  // cât de drept bate soarele pe panou
        const P = PMAX * inc * Math.pow(light, 0.4) * (1 - 0.82 * cloud);
        const hrs = dt * 0.9 * speed * (play ? 1 : 0);
        bat = clamp(bat + (P - LOAD) * hrs / CAP, 0, 1); energy += P * hrs;
        hist[Math.round(hour * 10)] = P;
        /* cer */
        const day = clamp(Math.sin(b) * 1.4 + 0.1, 0, 1), nightA = sn.up ? clamp(1 - Math.sin(b) * 3, 0, 1) * 0.0 : 1;
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, mix([8, 12, 40], [40, 120, 210], day)); sky.addColorStop(1, mix([14, 20, 50], [190, 225, 245], day));
        ctx.fillStyle = sky; ctx.fillRect(0, 0, api.W, H);
        const hy = api.cy + U * 0.2;
        if (day < 0.6) { ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * (1 - day / 0.6)) + ')'; for (let i = 0; i < 60; i++) ctx.fillRect((i * 97.3) % W, (i * 53.7) % (hy - 30), 1.6, 1.6); if (!sn.up) { ctx.fillStyle = '#e8e4d0'; ctx.beginPath(); ctx.arc(W * 0.8, api.cy - U * 0.55, 16, 0, 7); ctx.fill(); } }
        /* soarele pe arc */
        const sxp = lerp(W * 0.06, W * 0.94, (hour - 6) / 14), syp = hy - Math.sin(b) * U * 0.95;
        if (sn.up) { const g = ctx.createRadialGradient(sxp, syp, 0, sxp, syp, 90); g.addColorStop(0, 'rgba(255,230,120,0.9)'); g.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sxp, syp, 90, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd35a'; ctx.beginPath(); ctx.arc(sxp, syp, 22, 0, 7); ctx.fill(); }
        /* nori */
        if (cloud > 0.02) for (let i = 0; i < 5; i++) { const cxp = ((t * 14 * (0.6 + i * 0.2) + i * W * 0.3) % (W * 1.3)) - W * 0.15, cyp = api.cy - U * 0.7 + (i % 3) * 22; ctx.fillStyle = 'rgba(235,240,248,' + 0.88 * cloud + ')'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(cxp + k * 26, cyp + (k % 2) * 8, 26 + (k % 3) * 8, 0, 7); ctx.fill(); } }
        /* sol + casă */
        ctx.fillStyle = '#3e7a3a'; ctx.fillRect(0, hy, api.W, H - hy);
        const hx = cx - U * 0.15, hw = U * 0.9, hh = U * 0.42, hxl = hx - hw / 2;
        ctx.fillStyle = '#d9c9a8'; ctx.fillRect(hxl, hy - hh, hw, hh); ctx.fillStyle = '#8a3a2a'; ctx.beginPath(); ctx.moveTo(hxl - 14, hy - hh); ctx.lineTo(hx, hy - hh - U * 0.3); ctx.lineTo(hxl + hw + 14, hy - hh); ctx.closePath(); ctx.fill();
        /* geamuri: se aprind când bateria dă lumină */
        const lit = (!sn.up || P < LOAD) && bat > 0.01 || P > LOAD * 0.5;
        ctx.fillStyle = lit ? '#ffe9a0' : '#2a3a5a'; ctx.fillRect(hxl + hw * 0.12, hy - hh * 0.7, hw * 0.22, hh * 0.38); ctx.fillRect(hxl + hw * 0.66, hy - hh * 0.7, hw * 0.22, hh * 0.38);
        if (lit) { ctx.fillStyle = 'rgba(255,230,140,0.25)'; ctx.fillRect(hxl + hw * 0.1, hy - hh * 0.72, hw * 0.26, hh * 0.42); ctx.fillRect(hxl + hw * 0.64, hy - hh * 0.72, hw * 0.26, hh * 0.42); }
        ctx.fillStyle = '#6a4a30'; ctx.fillRect(hx - hw * 0.07, hy - hh * 0.55, hw * 0.14, hh * 0.55);
        /* panoul pe acoperiș */
        const px = hx, py = hy - hh - U * 0.14, pw = U * 0.5, ph = 14;
        ctx.save(); ctx.translate(px, py); ctx.rotate(effTilt * Math.PI / 180);
        ctx.fillStyle = '#1b2f6e'; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); ctx.strokeStyle = '#7aa0ff'; ctx.lineWidth = 1; for (let k = 0; k <= 8; k++) { ctx.beginPath(); ctx.moveTo(-pw / 2 + pw * k / 8, -ph / 2); ctx.lineTo(-pw / 2 + pw * k / 8, ph / 2); ctx.stroke(); }
        ctx.strokeStyle = '#ccd'; ctx.lineWidth = 2; ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
        if (P > 5) { ctx.fillStyle = 'rgba(255,255,160,' + clamp(P / PMAX, 0, 1) * 0.55 + ')'; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); }
        ctx.restore();
        ctx.fillStyle = '#555'; ctx.fillRect(px - 3, py + 6, 6, hy - hh - py - 2 + hh * 0 + 8);
        /* fotoni de la soare la panou */
        if (sn.up && light > 0.05 && Math.random() < dt * (30 * light * (1 - 0.8 * cloud))) photons.push({ k: 0 });
        photons = photons.filter((p) => { p.k += dt * 0.9; return p.k < 1; });
        ctx.fillStyle = '#ffe27a';
        for (const p of photons) { const x = lerp(sxp, px, p.k), y = lerp(syp, py, p.k); ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); }
        /* cabluri: panou → baterie → casă, cu electroni */
        const bx = hx + hw * 0.8, by = hy + 26;
        ctx.strokeStyle = '#c9843a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py + 8); ctx.lineTo(px, hy - hh - 4); ctx.lineTo(hxl + hw + 4, hy - hh - 4); ctx.lineTo(hxl + hw + 4, hy + 10); ctx.lineTo(bx, by - 18); ctx.stroke();
        if (P > 5) { ctx.fillStyle = '#7ec8ff'; for (let i = 0; i < 6; i++) { const u = (((i / 6 + t * 0.5 * (0.3 + P / PMAX)) % 1)); const x = lerp(px, hxl + hw + 4, clamp(u * 2, 0, 1)), y = u < 0.5 ? lerp(py + 8, hy - hh - 4, u * 2) : lerp(hy - hh - 4, hy + 10, (u - 0.5) * 2); ctx.beginPath(); ctx.arc(u < 0.5 ? px : hxl + hw + 4, y, 3, 0, 7); ctx.fill(); } }
        /* baterie */
        ctx.fillStyle = '#0a1226'; ctx.fillRect(bx - 20, by - 18, 40, 36); ctx.strokeStyle = '#8aa0c8'; ctx.lineWidth = 2; ctx.strokeRect(bx - 20, by - 18, 40, 36);
        ctx.fillStyle = bat > 0.5 ? '#2fbf62' : bat > 0.2 ? '#e0c23a' : '#e0503a'; ctx.fillRect(bx - 18, by + 16 - 32 * bat, 36, 32 * bat);
        ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('baterie', bx, by + 32); ctx.fillText(Math.round(bat * 100) + '%', bx, by + 4);
        ctx.fillText('panou solar', px, py - 16);
        /* grafic: puterea produsă în timpul zilei */
        const gw = Math.min(W - 30, 360), gx = 14, gy = api.cy - U + 8, gh = 52;
        ctx.fillStyle = 'rgba(8,14,34,0.85)'; ctx.fillRect(gx, gy, gw, gh + 22);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
        ctx.fillStyle = 'rgba(255,214,102,0.5)'; ctx.beginPath(); ctx.moveTo(gx, gy + gh); for (let i = 0; i <= 240; i++) { const v = hist[i]; if (v !== null) ctx.lineTo(gx + gw * i / 240, gy + gh - gh * clamp(v / PMAX, 0, 1)); } ctx.lineTo(gx + gw * Math.round(hour * 10) / 240, gy + gh); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(gx + gw * hour / 24, gy); ctx.lineTo(gx + gw * hour / 24, gy + gh); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('puterea produsă azi (0–24 h)', gx + 6, gy + gh + 14);
        info.innerHTML = '<b>Putere:</b> ' + fmt(P, 0) + ' W · <b>Produs azi:</b> ' + fmt(energy, 0) + ' Wh · <b>Baterie:</b> ' + Math.round(bat * 100) + '% · casa consumă ' + LOAD + ' W' + (P < 5 && !sn.up ? ' · <i>noaptea casa folosește bateria</i>' : '');
      }
      return { frame: frame };
    }
  });
})();
