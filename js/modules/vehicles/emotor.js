/* Modul: Mașina electrică și motorul ei */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }

  defineModule({
    id: 'emotor', title: 'Mașina electrică', sub: 'Baterie, motor și magneți care se împing',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'car', pedal = 0.35, braking = false, v = 0, dist = 0, bat = 1, wheelA = 0, flow = 0, plug = 0, energyUsed = 0;
      let th = 0.4, w = 0, ctrl = true, volt = 0.7;
      const bs = {};
      const rm = api.row('');
      [['car', '🚗 Mașina'], ['motor', '🧲 Cum se învârte motorul']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rc = api.row(''), rmot = api.row('');
      api.slider(rc, { label: 'Pedala de accelerație', min: 0, max: 1, step: 0.01, value: pedal, fmt: (x) => Math.round(x * 100) + '%', onInput: (x) => { pedal = x; } });
      const bB = api.button(rc, '🛑 Frână', () => { braking = !braking; bB.classList.toggle('on', braking); bB.innerHTML = braking ? '🛑 Frână: ACTIVĂ' : '🛑 Frână'; if (braking) api.say('<b>Frâna recuperatoare:</b> când frânezi, motorul se face <b>generator</b> și trimite curent înapoi în baterie. Mașinile electrice își „reîncarcă” puțin bateria la fiecare frânare!', 10000); });
      api.button(rc, '🔌 Încarcă la stație', () => { plug = 3; bat = 1; api.say('Bateria se încarcă la o stație de încărcare, ca telefonul tău, dar mai mare!', 5000); });
      const infoC = document.createElement('div'); infoC.className = 'mod-readout'; rc.appendChild(infoC);
      api.slider(rmot, { label: 'Cât curent dai motorului', min: 0.1, max: 1, step: 0.01, value: volt, fmt: (x) => Math.round(x * 100) + '%', onInput: (x) => { volt = x; } });
      const bCt = api.button(rmot, '🧠 Controlerul: PORNIT', () => { ctrl = !ctrl; bCt.innerHTML = ctrl ? '🧠 Controlerul: PORNIT' : '🧠 Controlerul: OPRIT'; api.say(ctrl ? '<b>Controlerul</b> schimbă la momentul potrivit care electromagnet atrage și care împinge, așa că magnetul din mijloc se tot învârte.' : 'Fără controler, electromagneții rămân mereu la fel: magnetul din mijloc se așază într-o poziție, oscilează puțin și <b>se oprește</b>!', 10000); });
      const infoM = document.createElement('div'); infoM.className = 'mod-readout'; rmot.appendChild(infoM);
      const MSG = {
        car: 'O mașină electrică nu are benzină! <b>Bateria</b> dă curent unui <b>controler</b>, iar controlerul îl trimite <b>motorului</b>, care învârte roțile. Apasă pe pedală și urmărește cum curge curentul (punctele albastre). Fără fum, fără zgomot de motor!',
        motor: 'Motorul electric e plin de <b>magneți</b>. Doi poli la fel (N–N sau S–S) <b>se resping</b>, doi poli diferiți (N–S) <b>se atrag</b>. Electromagneții din jur își schimbă polii pe rând, iar magnetul din mijloc tot aleargă după ei!'
      };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rc.style.display = m === 'car' ? '' : 'none'; rmot.style.display = m === 'motor' ? '' : 'none'; api.say(MSG[m], 14000); api.layout(); }
      function frame(dt, t) {
        const U = api.unit, W = api.freeW;
        if (mode === 'car') {
          /* simplu: viteză ∝ accelerație, frână = recuperare */
          const target = pedal * 33 * (bat > 0.01 ? 1 : 0);        // m/s ≈ până la ~120 km/h
          v += (braking ? -v * 1.2 - 3 : (target - v) * 0.5) * dt; v = Math.max(0, v);
          const pw = (braking ? -v * 0.8 : v * 0.55 * (0.3 + pedal) * 0.6) * (v > 0.2 ? 1 : 0);          // kW (negativ la recuperare)
          bat = clamp(bat - pw * dt / 3600 * 60 / 60 * 0.9 - 0 , 0, 1) ; if (plug > 0) { plug -= dt; bat = 1; }
          energyUsed += Math.max(0, pw) * dt / 3600; dist += v * dt * 3; wheelA += v / 0.33 * dt * 1.4; flow += dt * (Math.abs(pw) * 0.12 + 0.0) * (braking ? -1 : 1);
          bg(api, '#2c6aa8', '#bfe3f5');
          const gy = api.cy + U * 0.35;
          ctx.fillStyle = '#6a8fb0'; ctx.beginPath(); ctx.moveTo(-W, gy); for (let x = -50; x <= W * 1.5; x += 20) ctx.lineTo(x, gy - 50 - 30 * Math.sin((x + dist * 6) * 0.01)); ctx.lineTo(W * 1.5, gy); ctx.fill();
          ctx.fillStyle = '#4c8a3c'; ctx.fillRect(-W, gy, W * 3, api.H); ctx.fillStyle = '#444'; ctx.fillRect(-W, gy + 4, W * 3, 36); ctx.fillStyle = '#fff'; for (let i = 0; i < 14; i++) ctx.fillRect(((i * 120 - dist * 18) % (W + 140) + W + 140) % (W + 140) - 60, gy + 20, 60, 4);
          const cx = W * 0.5, cy = gy - 8, s = clamp(W / 440, 0.62, 1.2);
          ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
          /* caroserie verde (electrică) */
          ctx.fillStyle = '#2fbf8a'; rrect(ctx, -112, -50, 224, 40, 14); ctx.fill(); rrect(ctx, -66, -92, 128, 46, 16); ctx.fill();
          ctx.fillStyle = '#9fd6f0'; ctx.fillRect(-56, -86, 46, 32); ctx.fillRect(0, -86, 46, 32);
          /* baterie sub podea */
          ctx.fillStyle = '#1a2a52'; ctx.strokeStyle = '#7aa0ff'; ctx.lineWidth = 2; rrect(ctx, -76, -26, 110, 16, 4); ctx.fill(); ctx.stroke();
          const lv = clamp(bat, 0, 1); ctx.fillStyle = lv > 0.5 ? '#2fbf62' : lv > 0.2 ? '#e0c23a' : '#e0503a'; ctx.fillRect(-74, -24, 106 * lv, 12);
          /* controler și motor */
          ctx.fillStyle = '#e8a23a'; ctx.fillRect(40, -34, 22, 16); ctx.fillStyle = '#6a7390'; rrect(ctx, 64, -36, 26, 22, 4); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = '700 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('baterie', -22, -31); ctx.textAlign = 'right'; ctx.fillText('controler', 52, -42); ctx.textAlign = 'left'; ctx.fillText('motor', 66, -42);
          /* fire cu curent (puncte) */
          const path = [[-22, -18], [-22, -22], [51, -22], [51, -26], [77, -26], [77, -14]];
          ctx.strokeStyle = '#c9843a'; ctx.lineWidth = 3; ctx.beginPath(); path.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
          const act = Math.abs(pw) > 0.02;
          if (act) { ctx.fillStyle = braking ? '#7dffb0' : '#7ec8ff'; for (let i = 0; i < 9; i++) { let u = (((i / 9 + flow) % 1) + 1) % 1; const L = path.length - 1, f = u * L, k = Math.min(L - 1, Math.floor(f)), r = f - k; ctx.beginPath(); ctx.arc(lerp(path[k][0], path[k + 1][0], r), lerp(path[k][1], path[k + 1][1], r), 3, 0, 7); ctx.fill(); } }
          const wheel = (wx) => { ctx.save(); ctx.translate(wx, -8); ctx.rotate(wheelA); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fill(); ctx.strokeStyle = '#9aa3b2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.stroke(); for (let k = 0; k < 5; k++) { ctx.rotate(Math.PI * 2 / 5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -13); ctx.stroke(); } ctx.restore(); };
          wheel(-68); wheel(74);
          /* stație de încărcare */
          if (plug > 0) { ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-112, -40); ctx.lineTo(-150, -40); ctx.lineTo(-150, 0); ctx.stroke(); ctx.fillStyle = '#7dffb0'; ctx.font = '700 12px system-ui,sans-serif'; ctx.fillText('⚡ se încarcă', -150, -50); }
          ctx.restore();
          /* panou de bord */
          ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '800 26px system-ui,sans-serif'; ctx.fillText(Math.round(v * 3.6) + ' km/h', 16, api.cy - U + 38);
          ctx.fillStyle = 'rgba(8,14,34,0.85)'; rrect(ctx, 16, api.cy - U + 48, 150, 22, 8); ctx.fill(); ctx.fillStyle = lv > 0.5 ? '#2fbf62' : lv > 0.2 ? '#e0c23a' : '#e0503a'; rrect(ctx, 18, api.cy - U + 50, 146 * lv, 18, 6); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui,sans-serif'; ctx.fillText('baterie ' + Math.round(lv * 100) + '%', 24, api.cy - U + 63);
          if (v > 1 && !braking) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '600 11px system-ui,sans-serif'; ctx.fillText('fără fum, fără benzină 🌱', 16, api.cy - U + 88); }
          const range = pw > 0.05 ? bat * 60 / pw * v * 3.6 : Infinity;
          infoC.innerHTML = '<b>Putere:</b> ' + (braking && v > 0.5 ? 'recuperează ' + fmt(Math.abs(pw), 1) + ' kW' : fmt(Math.max(0, pw), 1) + ' kW') + ' · <b>Autonomie:</b> ' + (isFinite(range) ? '~' + fmt(Math.min(range, 999), 0) + ' km la viteza asta' : '—') + ' · <b>Parcurs:</b> ' + fmt(dist / 1000 * 3, 1) + ' km';
        } else {
          bg(api, '#0c1330', '#05080f');
          const cx = api.cx, cy = api.cy - U * 0.05, R = U * 0.62;
          /* controler: polaritatea fiecărui electromagnet */
          const coils = [0, 1, 2, 3].map((i) => i * Math.PI / 2 + Math.PI / 4);
          const pol = coils.map((phi, i) => ctrl ? (Math.sin(th - phi) >= 0 ? 1 : -1) : (i % 2 ? -1 : 1));
          let torque = 0; coils.forEach((phi, i) => { torque += pol[i] * Math.sin(th - phi); });
          w += (torque * volt * 40 - w * 1.6) * dt; w = clamp(w, -40, 40); th += w * dt;
          /* electromagneți */
          coils.forEach((phi, i) => {
            const x = cx + Math.cos(phi) * R, y = cy + Math.sin(phi) * R, N = pol[i] > 0, col = N ? '#e8453a' : '#3a7be8';
            ctx.save(); ctx.translate(x, y); ctx.rotate(phi);
            ctx.fillStyle = '#394058'; rrect(ctx, -22, -26, 44, 52, 8); ctx.fill();
            ctx.strokeStyle = '#c9843a'; ctx.lineWidth = 3; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(-22, k * 8); ctx.lineTo(22, k * 8); ctx.stroke(); }
            ctx.fillStyle = col; ctx.fillRect(-26 - 0, -10, 8, 20); ctx.rotate(-phi); ctx.fillStyle = '#fff'; ctx.font = '800 14px system-ui,sans-serif'; ctx.textAlign = 'center';
            ctx.restore();
            const px = cx + Math.cos(phi) * (R - 38), py = cy + Math.sin(phi) * (R - 38);
            ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, 15, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = '800 15px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(N ? 'N' : 'S', px, py + 5);
          });
          /* rotor: magnet în mijloc */
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(th);
          ctx.fillStyle = '#e8453a'; ctx.beginPath(); ctx.arc(0, 0, R * 0.36, -Math.PI / 2, Math.PI / 2, true); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#3a7be8'; ctx.beginPath(); ctx.arc(0, 0, R * 0.36, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * 0.36, 0, 7); ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = '800 22px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('S', -R * 0.18, 8); ctx.fillText('N', R * 0.18, 8);
          ctx.restore();
          /* săgeată: ce atrage / împinge N-ul magnetului */
          ctx.fillStyle = '#fff'; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('magnetul din mijloc (rotorul)', cx, cy - R * 0.5);
          /* roata atașată */
          const rx = Math.min(api.freeW - 52, cx + R + 80), ry = cy + R * 0.5;
          ctx.save(); ctx.translate(rx, ry); ctx.rotate(th); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill(); ctx.strokeStyle = '#9aa3b2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.stroke(); for (let k = 0; k < 5; k++) { ctx.rotate(Math.PI * 2 / 5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18); ctx.stroke(); } ctx.restore();
          ctx.fillStyle = '#fff'; ctx.fillText('roata mașinii', rx, ry + 48);
          const rpm = Math.abs(w) / (2 * Math.PI) * 60;
          infoM.innerHTML = '<b>Viteza motorului:</b> ' + fmt(rpm, 0) + ' rot/min' + (!ctrl && rpm < 5 ? ' · <i>fără controler s-a oprit</i>' : '') + ' · roșu = pol <b>N</b>, albastru = pol <b>S</b>';
        }
      }
      setMode('car');
      return { frame: frame };
    }
  });
})();
