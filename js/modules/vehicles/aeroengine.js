/* Modul: Motoarele avionului — cu reacție (turboventilator) și cu elice */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 0 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  const mixc = (a, b, t) => { const A = a.map((v, i) => Math.round(lerp(v, b[i], clamp(t, 0, 1)))); return 'rgb(' + A.join(',') + ')'; };

  defineModule({
    id: 'aeroengine', title: 'Motoarele avionului', sub: 'Motorul cu reacție și motorul cu elice',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'jet', thr = 0.55, ph = 0, parts = [], rpm = 2200, pitch = 18, vkmh = 120, pph = 0, flow = [];
      const bs = {};
      const rm = api.row('');
      [['jet', '✈️ Motorul cu reacție'], ['prop', '🛩️ Motorul cu elice']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rj = api.row(''), rp = api.row('');
      api.slider(rj, { label: 'Manetă de putere', min: 0, max: 1, step: 0.01, value: thr, fmt: (v) => v < 0.02 ? 'motor oprit' : v < 0.15 ? 'ralanti' : Math.round(v * 100) + '%', onInput: (v) => { thr = v; } });
      [['🛬 Ralanti', 0.12], ['🛫 Decolare', 1], ['☁️ Croazieră', 0.8]].forEach(([t, v]) => api.button(rj, t, () => { thr = v; rj.querySelector('input').value = v; rj.querySelector('input').dispatchEvent(new Event('input')); }));
      const infoJ = document.createElement('div'); infoJ.className = 'mod-readout'; rj.appendChild(infoJ);
      api.slider(rp, { label: 'Turația elicei', min: 0, max: 2700, step: 10, value: rpm, fmt: (v) => fmt(v) + ' rot/min', onInput: (v) => { rpm = v; } });
      api.slider(rp, { label: 'Pasul elicei (unghiul palei)', min: 5, max: 40, step: 1, value: pitch, fmt: (v) => v + '°', onInput: (v) => { pitch = v; } });
      api.slider(rp, { label: 'Viteza avionului', min: 0, max: 300, step: 5, value: vkmh, fmt: (v) => v + ' km/h', onInput: (v) => { vkmh = v; } });
      const infoP = document.createElement('div'); infoP.className = 'mod-readout'; rp.appendChild(infoP);
      const MSG = {
        jet: 'Motorul cu reacție lucrează în 4 pași: <b>aspiră</b> aer, îl <b>comprimă</b>, îl <b>arde</b> cu combustibil și îl <b>aruncă</b> înapoi cu viteză mare. Aerul aruncat înapoi împinge avionul înainte (legea a 3-a a lui Newton). Atinge o parte a motorului ca să afli ce face!',
        prop: 'Elicea e ca o <b>aripă care se învârte</b>: fiecare pală „taie” aerul și îl împinge înapoi, iar aerul împinge elicea (și avionul) înainte. Încearcă: crește turația, schimbă <b>pasul</b> elicei și viteza avionului. Ce se întâmplă când pala are unghiul prea mare?'
      };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rj.style.display = m === 'jet' ? '' : 'none'; rp.style.display = m === 'prop' ? '' : 'none'; api.say(MSG[m], 16000); api.layout(); }

      /* ---------------- MOTORUL CU REACȚIE ---------------- */
      const SEC = [
        { a: 0, b: 0.09, n: 'Admisia', t: 'Gura motorului: aici intră aerul. La decolare, un motor mare de avion aspiră peste o tonă de aer pe secundă!' },
        { a: 0.09, b: 0.14, n: 'Ventilatorul', t: 'Elicea uriașă din față (până la 3 m!). Cea mai mare parte din aer trece <b>pe lângă</b> miez (aer ocolitor) și dă ~80% din împingere. E mai liniștit și mai economic.' },
        { a: 0.15, b: 0.42, n: 'Compresorul', t: 'Rânduri de palete tot mai mici strâng aerul de zeci de ori. Aerul comprimat se încălzește și arde mult mai bine.' },
        { a: 0.42, b: 0.56, n: 'Camera de ardere', t: 'Aici se pulverizează combustibil (kerosen) și arde continuu. Gazele ajung la ~1.500–2.000°C — mai fierbinți decât punctul de topire al metalului, de aceea pereții sunt răciți cu aer.' },
        { a: 0.56, b: 0.73, n: 'Turbina', t: 'Gazele fierbinți învârt turbina. Ea e legată printr-un ax de compresor și de ventilator: motorul se ține singur în mișcare!' },
        { a: 0.73, b: 1, n: 'Ajutajul (evacuarea)', t: 'Gazele ies pe la spate cu viteză foarte mare. Aerul aruncat înapoi împinge motorul (și avionul) înainte — legea acțiunii și reacțiunii.' }
      ];
      const padL = () => api.W >= 700 ? 84 : 6;   // loc pentru bara de unelte din stânga
      function geo() { const W = api.freeW, U = api.unit, pl = padL(), L = Math.min((W - pl - 8) / 1.2, U * 3.3), R = L * 0.17, x0 = pl + Math.max(0, (W - pl - L * 1.2) / 2), cy = api.cy - U * 0.02; return { L: L, R: R, x0: x0, cy: cy, X: (f) => x0 + f * L }; }
      const Ro = (f) => f < 0.1 ? lerp(0.94, 1.02, f / 0.1) : f < 0.78 ? lerp(1.02, 0.84, (f - 0.1) / 0.68) : 0.84;
      const Rc = (f) => f < 0.15 ? 0 : f < 0.42 ? lerp(0.56, 0.32, (f - 0.15) / 0.27) : f < 0.56 ? 0.34 + 0.02 * Math.sin((f - 0.42) / 0.14 * Math.PI) : f < 0.73 ? lerp(0.34, 0.42, (f - 0.56) / 0.17) : f < 0.96 ? lerp(0.42, 0.27, (f - 0.73) / 0.23) : 0.27;
      const Rh = (f) => f < 0.07 ? 0 : f < 0.13 ? lerp(0, 0.17, (f - 0.07) / 0.06) : f < 0.9 ? 0.11 : f < 0.97 ? lerp(0.12, 0, (f - 0.9) / 0.07) : 0;
      function spawn(i) { const by = i % 5 < 3; return { f: -0.08 - Math.random() * 0.4, u: Math.random(), s: Math.random() < 0.5 ? -1 : 1, by: by, j: Math.random() }; }
      for (let i = 0; i < 170; i++) { const p = spawn(i); p.f = Math.random() * 1.25 - 0.05; parts.push(p); }
      function bladeRow(g, f, rIn, rOut, col, k, w, ph0) {
        const x = g.X(f);
        for (const s of [-1, 1]) for (let i = 0; i < k; i++) {
          const a = ph0 + i * Math.PI * 2 / k, vis = Math.sin(a), bw = Math.abs(vis) * w + 0.8;
          ctx.fillStyle = col; ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.cos(a));
          ctx.fillRect(x - bw / 2 + Math.cos(a) * w * 0.4, g.cy + s * rIn * g.R - (s < 0 ? (rOut - rIn) * g.R : 0), bw, (rOut - rIn) * g.R);
        }
        ctx.globalAlpha = 1;
      }
      function drawJet(dt, t) {
        const g = geo(), on = thr > 0.02, n1 = on ? 0.2 + 0.8 * thr : 0;
        ph += dt * n1 * 26;
        bg(api, '#0b1430', '#060a16');
        /* contur nacelă (tăietură longitudinală) */
        const prof = (fn, f0, f1, s) => { for (let f = f0; f <= f1 + 1e-6; f += 0.01) ctx.lineTo(g.X(f), g.cy + s * fn(f) * g.R); };
        // fundal canal ocolitor (bypass)
        for (const s of [-1, 1]) { ctx.fillStyle = 'rgba(80,150,220,0.16)'; ctx.beginPath(); ctx.moveTo(g.X(0.12), g.cy + s * Rc(0.15) * g.R); prof(Ro, 0.12, 0.78, s); for (let f = 0.78; f >= 0.15; f -= 0.01) ctx.lineTo(g.X(f), g.cy + s * Rc(f) * g.R); ctx.closePath(); ctx.fill(); }
        // miez: fundal după temperatură
        for (const s of [-1, 1]) { const gr = ctx.createLinearGradient(g.X(0.15), 0, g.X(0.96), 0); gr.addColorStop(0, 'rgba(90,150,210,0.28)'); gr.addColorStop(0.3, 'rgba(200,210,120,0.3)'); gr.addColorStop(0.45, 'rgba(255,140,50,' + (0.25 + 0.45 * n1) + ')'); gr.addColorStop(0.7, 'rgba(255,110,50,' + (0.2 + 0.3 * n1) + ')'); gr.addColorStop(1, 'rgba(255,90,40,0.15)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(g.X(0.15), g.cy + s * Rh(0.15) * g.R); prof(Rc, 0.15, 0.96, s); for (let f = 0.96; f >= 0.15; f -= 0.01) ctx.lineTo(g.X(f), g.cy + s * Rh(f) * g.R); ctx.closePath(); ctx.fill(); }
        // pereți: nacela exterioară și carcasa miezului
        ctx.lineWidth = 6; ctx.strokeStyle = '#aab4c4';
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(g.X(0), g.cy + s * Ro(0) * g.R); prof(Ro, 0, 0.78, s); ctx.stroke(); }
        const nac = ctx.createLinearGradient(0, g.cy - g.R * 1.1, 0, g.cy - g.R * 0.9); nac.addColorStop(0, '#dfe5ee'); nac.addColorStop(1, '#8a96a8');
        for (const s of [-1, 1]) { ctx.fillStyle = nac; ctx.beginPath(); ctx.moveTo(g.X(0), g.cy + s * Ro(0) * g.R); prof(Ro, 0, 0.78, s); for (let f = 0.78; f >= 0; f -= 0.02) ctx.lineTo(g.X(f), g.cy + s * (Ro(f) + 0.09 + 0.05 * Math.sin(f * Math.PI)) * g.R); ctx.closePath(); ctx.fill(); }
        ctx.lineWidth = 4; ctx.strokeStyle = '#8a96a8';
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(g.X(0.15), g.cy + s * Rc(0.15) * g.R); prof(Rc, 0.15, 0.96, s); ctx.stroke(); }
        // ax și con
        ctx.fillStyle = '#5a6476'; ctx.fillRect(g.X(0.12), g.cy - Rh(0.5) * g.R, g.X(0.9) - g.X(0.12), Rh(0.5) * g.R * 2);
        ctx.fillStyle = '#c8d0dc'; ctx.beginPath(); ctx.moveTo(g.X(0.06), g.cy); ctx.quadraticCurveTo(g.X(0.09), g.cy - 0.17 * g.R, g.X(0.13), g.cy - 0.17 * g.R); ctx.lineTo(g.X(0.13), g.cy + 0.17 * g.R); ctx.quadraticCurveTo(g.X(0.09), g.cy + 0.17 * g.R, g.X(0.06), g.cy); ctx.fill();
        ctx.fillStyle = '#7a8496'; ctx.beginPath(); ctx.moveTo(g.X(0.9), g.cy - 0.12 * g.R); ctx.lineTo(g.X(0.97), g.cy); ctx.lineTo(g.X(0.9), g.cy + 0.12 * g.R); ctx.fill();
        // palete: ventilator, compresor, turbină
        bladeRow(g, 0.115, 0.17, Ro(0.115) - 0.03, '#d0d8e4', 8, g.L * 0.022, ph * 0.6);
        for (let i = 0; i < 9; i++) { const f = 0.165 + i * 0.03; bladeRow(g, f, 0.11, Rc(f) - 0.01, i < 4 ? '#9ab4d8' : '#8aa4c8', 7, g.L * 0.009, ph * (1 + i * 0.05) + i); }
        for (let i = 0; i < 5; i++) { const f = 0.585 + i * 0.03; bladeRow(g, f, 0.11, Rc(f) - 0.01, i < 2 ? '#f0b050' : '#d89848', 7, g.L * 0.011, ph * 1.2 + i * 0.7); }
        // camera de ardere: căptușeală și flăcări
        for (const s of [-1, 1]) {
          ctx.strokeStyle = 'rgba(220,200,180,0.7)'; ctx.lineWidth = 2; ctx.strokeRect(g.X(0.435), g.cy + s * 0.15 * g.R - (s < 0 ? 0.16 * g.R : 0), g.X(0.55) - g.X(0.435), 0.16 * g.R);
          if (on) for (let k = 0; k < 7; k++) { const fx = g.X(0.45 + k * 0.014), fy = g.cy + s * 0.23 * g.R, fl = (0.5 + 0.5 * thr) * (0.75 + 0.25 * Math.sin(t * 17 + k * 1.7)); const fg = ctx.createRadialGradient(fx, fy, 0, fx + g.L * 0.012, fy, g.R * 0.11 * fl * 1.3); fg.addColorStop(0, 'rgba(255,255,210,0.95)'); fg.addColorStop(0.4, 'rgba(255,170,50,0.85)'); fg.addColorStop(1, 'rgba(255,80,20,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(fx + g.L * 0.01, fy, g.R * 0.13 * fl, g.R * 0.06 * fl, 0, 0, 6.3); ctx.fill(); }
        }
        // jet de evacuare
        if (on) { const ex = g.X(0.96); const jg = ctx.createLinearGradient(ex, 0, ex + g.L * 0.35, 0); jg.addColorStop(0, 'rgba(255,170,90,' + (0.35 + 0.4 * thr) + ')'); jg.addColorStop(1, 'rgba(255,120,60,0)'); ctx.fillStyle = jg; ctx.beginPath(); ctx.moveTo(ex, g.cy - 0.27 * g.R); ctx.quadraticCurveTo(ex + g.L * 0.2, g.cy - 0.34 * g.R * (1 + 0.05 * Math.sin(t * 9)), ex + g.L * 0.36, g.cy); ctx.quadraticCurveTo(ex + g.L * 0.2, g.cy + 0.34 * g.R, ex, g.cy + 0.27 * g.R); ctx.fill(); }
        // particule de aer
        for (const p of parts) {
          if (on) { const sp = p.by ? (p.f < 0.12 ? 1 : p.f < 0.78 ? 1.25 : 1.6) : (p.f < 0.15 ? 1 : p.f < 0.42 ? 0.72 : p.f < 0.56 ? 0.9 : p.f < 0.73 ? 1.3 : 2.1); p.f += dt * 0.18 * n1 * sp * (0.9 + p.j * 0.2); if (p.f > (p.by ? 1.15 : 1.3)) Object.assign(p, spawn(p.by ? 0 : 3)); }
          let r, col, a = 1;
          if (p.f < 0.12) { const top = Ro(Math.max(p.f, 0)) * 0.96, bot = p.f > 0.07 ? Rh(p.f) + 0.03 : 0.02; r = lerp(bot, top, p.by ? lerp(0.62, 1, p.u) : lerp(0, 0.55, p.u)); col = '#bfe6ff'; }
          else if (p.by) { const f = Math.min(p.f, 0.78), inR = (p.f < 0.15 ? 0.56 : Rc(f)) + 0.04, outR = (p.f < 0.78 ? Ro(f) : 0.84) - 0.04; r = lerp(inR, outR, p.u); if (p.f > 0.78) r = lerp(r, r * 0.95, (p.f - 0.78) * 2); col = '#9fd8ff'; a = p.f > 0.95 ? clamp(1 - (p.f - 0.95) / 0.2, 0, 1) : 1; }
          else { const f = Math.min(p.f, 0.96), inR = Rh(f) + 0.03, outR = Rc(f) - 0.03; r = lerp(inR, Math.max(inR + 0.02, outR), p.u); if (p.f > 0.96) r = r * (1 + (p.f - 0.96) * 0.6); col = p.f < 0.15 ? '#bfe6ff' : p.f < 0.42 ? mixc([160, 210, 255], [230, 240, 140], (p.f - 0.15) / 0.27) : p.f < 0.56 ? (Math.sin(t * 20 + p.j * 9) > 0 ? '#ffd060' : '#ff8030') : p.f < 0.73 ? '#ffb050' : '#ff7a40'; a = p.f > 0.96 ? clamp(1 - (p.f - 0.96) / 0.32, 0, 1) : 1; }
          ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(g.X(p.f), g.cy + p.s * r * g.R, 2.4, 0, 6.3); ctx.fill();
        }
        ctx.globalAlpha = 1;
        // săgeți: împingerea (înainte) și gazele (înapoi)
        const thrust = on ? Math.pow(thr, 1.6) * 120 : 0;
        if (thrust > 1) { const ax = g.X(0.3), ay = g.cy - g.R * 1.42, len = 30 + thrust * 1.3; ctx.strokeStyle = '#7dffb0'; ctx.fillStyle = '#7dffb0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ax + len, ay); ctx.lineTo(ax, ay); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ax - 16, ay); ctx.lineTo(ax, ay - 10); ctx.lineTo(ax, ay + 10); ctx.fill(); ctx.font = '700 12px system-ui,sans-serif'; const lbl = 'împingere: avionul merge înainte'; if (ax + len + 8 + ctx.measureText(lbl).width > api.freeW - 6) { ctx.textAlign = 'center'; ctx.fillText(lbl, Math.min(ax + len / 2, api.freeW - ctx.measureText(lbl).width / 2 - 6), ay - 14); } else { ctx.textAlign = 'left'; ctx.fillText(lbl, ax + len + 8, ay + 4); } }
        // etichete
        ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center';
        SEC.forEach((s, i) => { const xm = g.X((s.a + s.b) / 2), yb = g.cy + g.R * 1.28 + (i % 2) * 15; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xm, g.cy + g.R * (i === 0 || i === 1 ? 1.08 : 0.6)); ctx.lineTo(xm, yb - 10); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillText(s.n, xm, yb); });
        ctx.fillStyle = '#9fd8ff'; ctx.fillText('aer ocolitor (bypass) →', g.X(0.45), g.cy - g.R * 0.78);
        const n1p = Math.round(n1 * 100);
        infoJ.innerHTML = on ? '<b>Turație ventilator:</b> ' + n1p + '% · <b>Împingere:</b> ~' + fmt(thrust) + ' kN · <b>Aer aspirat:</b> ~' + fmt(thr * 1100) + ' kg/s · <b>Temperatură în camera de ardere:</b> ~' + fmt(400 + thr * 1400) + '°C' : 'Motorul e oprit. Mută maneta ca să-l pornești.';
      }

      /* ---------------- MOTORUL CU ELICE ---------------- */
      function drawProp(dt, t) {
        const W = api.freeW, U = api.unit, cx = api.cx, cy = api.cy - U * 0.08, R = Math.min(U * 0.62, 130), xp = Math.max(padL() + R * 0.3 + 20, cx - Math.min(W * 0.18, U * 0.9));
        const om = rpm / 60 * Math.PI * 2; pph += om * dt * 0.25;               // încetinit, ca să se vadă palele
        const v = vkmh / 3.6, rTip = 0.95, helix = Math.atan2(v, Math.max(1, om * rTip * 0.75)) * 180 / Math.PI;
        const aoa = pitch - helix, stall = aoa > 16, ct = rpm < 50 ? 0 : aoa < -2 ? 0 : stall ? Math.max(0.15, 1 - (aoa - 16) * 0.08) * 0.85 : (aoa + 2) / 18;
        const T = 3600 * Math.pow(rpm / 2700, 2) * clamp(ct, 0, 1.05) * (1 - v / 140 * 0.3);
        bg(api, '#3d85c8', '#b9dcf5');
        // nori care trec după viteză
        for (let i = 0; i < 5; i++) { const xx = ((i * 260 + t * (12 + vkmh * 0.9)) % (W + 200)) - 100, yy = cy - U * 0.85 + (i % 3) * 30; ctx.fillStyle = 'rgba(255,255,255,0.65)'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(xx + k * 20, yy + (k % 2) * 5, 16 + (k % 3) * 5, 0, 6.3); ctx.fill(); } }
        // fuzelaj și capotă (tăietură)
        const fx = xp + 14, fw = W - fx + 20;
        ctx.fillStyle = '#e8edf3'; ctx.beginPath(); ctx.moveTo(fx, cy - R * 0.32); ctx.quadraticCurveTo(fx + R * 0.4, cy - R * 0.5, fx + R * 1.6, cy - R * 0.48); ctx.lineTo(fx + fw, cy - R * 0.44); ctx.lineTo(fx + fw, cy + R * 0.4); ctx.lineTo(fx + R * 1.6, cy + R * 0.42); ctx.quadraticCurveTo(fx + R * 0.4, cy + R * 0.42, fx, cy + R * 0.26); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#7a8496'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#c0392b'; ctx.fillRect(fx + R * 1.7, cy - R * 0.08, fw, R * 0.07);
        ctx.fillStyle = '#9fd6f0'; ctx.beginPath(); ctx.moveTo(fx + R * 1.75, cy - R * 0.48); ctx.quadraticCurveTo(fx + R * 2.1, cy - R * 0.9, fx + R * 2.6, cy - R * 0.9); ctx.lineTo(fx + R * 2.7, cy - R * 0.46); ctx.closePath(); ctx.fill();
        // motorul cu pistoane (văzut prin capotă)
        const ex0 = fx + R * 0.35, ew = R * 1.05;
        ctx.fillStyle = 'rgba(40,46,60,0.92)'; ctx.fillRect(ex0, cy - R * 0.3, ew, R * 0.6);
        const crank = pph * 0.5;
        for (let i = 0; i < 3; i++) { const cxp = ex0 + ew * (0.2 + i * 0.3), ang = crank + i * 2.1, py = cy - R * 0.06 + Math.cos(ang) * R * 0.08; ctx.fillStyle = '#6a7488'; ctx.fillRect(cxp - R * 0.08, cy - R * 0.28, R * 0.16, R * 0.3); ctx.fillStyle = '#c8d0dc'; ctx.fillRect(cxp - R * 0.07, py - R * 0.12, R * 0.14, R * 0.08); ctx.strokeStyle = '#d2a14e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cxp, py - R * 0.04); ctx.lineTo(cxp + Math.sin(ang) * R * 0.05, cy + R * 0.16); ctx.stroke(); if (rpm > 50 && Math.cos(ang) > 0.92) { ctx.fillStyle = 'rgba(255,190,80,0.9)'; ctx.beginPath(); ctx.arc(cxp, cy - R * 0.24, 4, 0, 6.3); ctx.fill(); } }
        ctx.strokeStyle = '#8a96a8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xp, cy); ctx.lineTo(ex0 + ew, cy + R * 0.16 * 0); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('motor cu pistoane', ex0 + ew / 2, cy + R * 0.42); ctx.fillText('ax', (xp + ex0) / 2, cy - 8);
        // fluxul de aer: încet înainte de elice, rapid după (suflul elicei)
        if (!flow.length) for (let i = 0; i < 90; i++) flow.push({ x: Math.random(), y: (Math.random() * 2 - 1) * 1.4, j: Math.random() });
        const v0 = 0.05 + v * 0.0012, vb = v0 + (T / 3600) * 0.35;
        for (const p of flow) {
          const inDisc = Math.abs(p.y) < 0.95, ax = (lerp(-0.1, 1.1, p.x)), X = xp - W * 0.45 + ax * W * 0.95;
          const after = X > xp; p.x += dt * (inDisc && after ? vb : v0) * (0.8 + p.j * 0.4); if (p.x > 1) { p.x = 0; p.y = (Math.random() * 2 - 1) * 1.4; }
          const yy = inDisc && after ? p.y * lerp(1, 0.78, clamp((X - xp) / (W * 0.25), 0, 1)) : p.y;
          ctx.fillStyle = inDisc ? 'rgba(255,255,255,' + (after ? 0.85 : 0.5) + ')' : 'rgba(255,255,255,0.35)'; ctx.fillRect(X, cy + yy * R, inDisc && after ? 9 : 4, 1.8);
        }
        // elicea: 2 pale, văzute din lateral (scurtate de perspectivă)
        if (rpm > 600) { ctx.fillStyle = 'rgba(60,60,70,' + clamp((rpm - 600) / 3000, 0, 0.28) + ')'; ctx.beginPath(); ctx.ellipse(xp, cy, 7, R, 0, 0, 6.3); ctx.fill(); }
        for (let i = 0; i < 2; i++) { const a = pph + i * Math.PI, ext = Math.cos(a) * R, chord = 6 + Math.abs(Math.sin(a)) * 12 * (pitch / 25); ctx.fillStyle = '#2a2f3d'; ctx.beginPath(); ctx.moveTo(xp - chord / 2, cy); ctx.quadraticCurveTo(xp - chord, cy + ext * 0.5, xp - chord * 0.3, cy + ext); ctx.lineTo(xp + chord * 0.3, cy + ext); ctx.quadraticCurveTo(xp + chord * 0.6, cy + ext * 0.5, xp + chord / 2, cy); ctx.fill(); ctx.fillStyle = '#ffd166'; ctx.fillRect(xp - chord * 0.3, cy + ext - Math.sign(ext || 1) * 6, chord * 0.6, Math.sign(ext || 1) * 6); }
        ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(xp - 18, cy); ctx.quadraticCurveTo(xp - 8, cy - 14, xp + 8, cy - 14); ctx.lineTo(xp + 8, cy + 14); ctx.quadraticCurveTo(xp - 8, cy + 14, xp - 18, cy); ctx.fill();
        // săgeata de tracțiune
        if (T > 20) { const ay = cy - R * 1.1, len = 20 + T / 3600 * 140; ctx.strokeStyle = '#7dffb0'; ctx.fillStyle = '#7dffb0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xp + len, ay); ctx.lineTo(xp, ay); ctx.stroke(); ctx.beginPath(); ctx.moveTo(xp - 16, ay); ctx.lineTo(xp, ay - 10); ctx.lineTo(xp, ay + 10); ctx.fill(); ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('tracțiune: ~' + fmt(T) + ' N', Math.min(xp + len + 8, api.freeW - 110), ay + (xp + len + 8 > api.freeW - 110 ? -14 : 4)); }
        // desenul palei: „o aripă care se învârte”
        const bxw = Math.min(230, W * 0.42), bxh = 132, bx = padL() + 8, by = cy + R * 0.55 > api.cy + U - bxh ? api.cy + U - bxh - 6 : cy + R * 0.55;
        ctx.fillStyle = 'rgba(8,14,34,0.88)'; ctx.fillRect(bx, by, bxw, bxh); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.strokeRect(bx, by, bxw, bxh);
        ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Pala văzută în secțiune', bx + 8, by + 15);
        const ox = bx + bxw * 0.5, oy = by + bxh * 0.56;
        ctx.save(); ctx.translate(ox, oy); ctx.rotate(-pitch * Math.PI / 180 + Math.PI / 2);
        ctx.fillStyle = stall ? '#ff9a7a' : '#e8edf5'; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(-18, -9, 6, -6); ctx.quadraticCurveTo(24, -3, 30, 0); ctx.quadraticCurveTo(10, 3, -26, 0); ctx.fill();
        ctx.restore();
        const arr = (x1, y1, x2, y2, col, txt, tx, ty) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); const an = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - Math.cos(an - 0.4) * 9, y2 - Math.sin(an - 0.4) * 9); ctx.lineTo(x2 - Math.cos(an + 0.4) * 9, y2 - Math.sin(an + 0.4) * 9); ctx.fill(); ctx.font = '600 10px system-ui,sans-serif'; ctx.fillText(txt, tx, ty); };
        arr(ox + 50, oy - 30, ox + 50, oy + 26, '#ffd166', 'pala se mișcă ↓', ox + 56, oy + 20);
        const ha = helix * Math.PI / 180; arr(ox - 54 * Math.sin(ha) - 30, oy - 54 * Math.cos(ha) * 0 + 34, ox - 30 + 54 * Math.sin(ha) * 0.1, oy - 30, '#9fd8ff', 'aerul', ox - 92, oy + 40);
        const lf = clamp(ct, 0, 1) * 44; if (lf > 3) arr(ox, oy, ox - lf, oy - lf * 0.15, '#7dffb0', 'tracțiune', ox - lf - 30, oy - lf * 0.15 - 8);
        ctx.fillStyle = stall ? '#ff9a7a' : '#fff'; ctx.font = '600 10px system-ui,sans-serif'; ctx.fillText('unghi de atac: ' + Math.round(aoa) + '°' + (stall ? ' → angajare!' : ''), bx + 8, by + bxh - 8);
        infoP.innerHTML = '<b>Tracțiune:</b> ~' + fmt(T) + ' N · <b>Unghi de atac al palei:</b> ' + Math.round(aoa) + '°' + (stall ? ' · <b style="color:#ff9a7a">pala e în angajare: împinge puțin!</b>' : aoa < 0 ? ' · <i>pasul e prea mic pentru viteza asta</i>' : '') + ' · <i>Pas mic = bun la decolare, pas mare = bun în croazieră</i>';
      }
      api.pointer({ down: (x, y) => { if (mode !== 'jet') return; const g = geo(), f = (x - g.x0) / g.L; if (Math.abs(y - g.cy) > g.R * 1.5) return; const s = SEC.find((q) => f >= q.a && f <= q.b); if (s) api.say('<b>' + s.n + '.</b> ' + s.t, 14000); } });
      setMode('jet');
      return { frame: function (dt, t) { if (mode === 'jet') drawJet(dt, t); else drawProp(dt, t); } };
    }
  });
})();
