/* Modul: Mașina — mașină ilustrată realist, drum cu peisaj, cadrane */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const TAU = Math.PI * 2;

  /* ---------- mașina în profil (botul spre dreapta, solul la y=0, lungime ≈ 440) ---------- */
  const BODY = [[-212, -18], [-221, -46], [-216, -80], [-196, -90], [-150, -95], [-108, -127], [-20, -133], [66, -94], [150, -86], [204, -76], [222, -58], [225, -30], [214, -17]];
  const GLASS = [[-142, -95], [-104, -121], [-22, -127], [58, -94]];
  function wheel(ctx, x, r, ang) {
    /* anvelopa */
    ctx.beginPath(); ctx.arc(x, -r, r, 0, TAU); ctx.fillStyle = '#1c1f24'; ctx.fill();
    const sg = ctx.createRadialGradient(x - r * 0.3, -r * 1.3, r * 0.2, x, -r, r); sg.addColorStop(0, '#3a3f47'); sg.addColorStop(1, '#16181c'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(x, -r, r * 0.97, 0, TAU); ctx.arc(x, -r, r * 0.7, 0, TAU, true); ctx.fill();
    /* janta */
    const rr = r * 0.68; ctx.beginPath(); ctx.arc(x, -r, rr, 0, TAU);
    const jg = ctx.createLinearGradient(x - rr, -r - rr, x + rr, -r + rr); jg.addColorStop(0, '#eef1f5'); jg.addColorStop(0.5, '#aab3c0'); jg.addColorStop(1, '#5e6674'); ctx.fillStyle = jg; ctx.fill();
    ctx.beginPath(); ctx.arc(x, -r, rr * 0.88, 0, TAU); ctx.fillStyle = '#2a2e35'; ctx.fill();
    /* disc de frână în spatele spițelor */
    ctx.beginPath(); ctx.arc(x, -r, rr * 0.7, 0, TAU); ctx.fillStyle = '#6d7480'; ctx.fill();
    /* spițe (se rotesc) */
    ctx.save(); ctx.translate(x, -r); ctx.rotate(ang);
    for (let k = 0; k < 5; k++) { ctx.rotate(TAU / 5); ctx.beginPath(); ctx.moveTo(-rr * 0.16, -rr * 0.2); ctx.lineTo(-rr * 0.22, -rr * 0.86); ctx.quadraticCurveTo(0, -rr * 0.92, rr * 0.22, -rr * 0.86); ctx.lineTo(rr * 0.16, -rr * 0.2); ctx.closePath(); const pg = ctx.createLinearGradient(-rr * 0.2, 0, rr * 0.2, 0); pg.addColorStop(0, '#f3f5f8'); pg.addColorStop(1, '#8c95a3'); ctx.fillStyle = pg; ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 0, rr * 0.26, 0, TAU); ctx.fillStyle = '#c9ced6'; ctx.fill(); ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1; ctx.stroke();
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + 0.6; ctx.fillStyle = '#4b525e'; ctx.beginPath(); ctx.arc(Math.cos(a) * rr * 0.15, Math.sin(a) * rr * 0.15, rr * 0.035, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  function drawCarBody(ctx, col, o) {
    o = o || {};
    const wr = 34, xr = -132, xf = 134;
    /* caroserie */
    ctx.beginPath(); Art.smoothPath(ctx, BODY, true, 0.35);
    const bg = ctx.createLinearGradient(0, -134, 0, -14); bg.addColorStop(0, Art.shade(col, 0.35)); bg.addColorStop(0.42, Art.shade(col, 0.12)); bg.addColorStop(0.5, col); bg.addColorStop(1, Art.shade(col, -0.45));
    ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = Art.ink(col); ctx.lineWidth = o.lw || 1.5; ctx.stroke();
    ctx.save(); ctx.beginPath(); Art.smoothPath(ctx, BODY, true, 0.35); ctx.clip();
    /* linia de umăr (lumină) */
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-210, -82); ctx.quadraticCurveTo(0, -84, 210, -64); ctx.stroke();
    ctx.strokeStyle = Art.rgba(Art.shade(col, -0.6), 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-210, -79); ctx.quadraticCurveTo(0, -81, 210, -61); ctx.stroke();
    /* prag inferior întunecat */
    ctx.fillStyle = 'rgba(20,22,28,0.55)'; ctx.fillRect(-230, -26, 460, 14);
    if (o.cut) o.cut(ctx);
    ctx.restore();
    /* geamuri */
    ctx.beginPath(); Art.smoothPath(ctx, GLASS, false, 0.3); ctx.lineTo(58, -90); ctx.lineTo(-142, -90); ctx.closePath();
    const gg = ctx.createLinearGradient(0, -127, 0, -88); gg.addColorStop(0, '#2e4058'); gg.addColorStop(1, '#6f8aa6'); ctx.fillStyle = gg; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.moveTo(-40, -130); ctx.lineTo(-10, -130); ctx.lineTo(-50, -86); ctx.lineTo(-80, -86); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(30, -130); ctx.lineTo(40, -130); ctx.lineTo(0, -86); ctx.lineTo(-10, -86); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = Art.shade(col, -0.5); ctx.fillRect(-42, -128, 8, 38);                  // stâlpul B
    ctx.strokeStyle = 'rgba(15,18,24,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); Art.smoothPath(ctx, GLASS, false, 0.3); ctx.stroke();
    /* uși, mânere, oglindă */
    ctx.strokeStyle = Art.rgba(Art.shade(col, -0.65), 0.8); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(62, -92); ctx.quadraticCurveTo(80, -50, 78, -24); ctx.moveTo(-38, -90); ctx.lineTo(-40, -24); ctx.moveTo(-142, -93); ctx.quadraticCurveTo(-160, -50, -150, -26); ctx.stroke();
    ctx.fillStyle = Art.shade(col, -0.35); [[42, -74], [-78, -74]].forEach(([x, y]) => { Art.roundRectPath(ctx, x, y, 20, 5, 2.5); ctx.fill(); });
    ctx.beginPath(); ctx.moveTo(62, -96); ctx.quadraticCurveTo(80, -104, 86, -96); ctx.lineTo(84, -88); ctx.lineTo(64, -90); ctx.closePath(); ctx.fillStyle = Art.shade(col, -0.2); ctx.fill();
    /* faruri și stopuri */
    ctx.beginPath(); ctx.moveTo(192, -76); ctx.quadraticCurveTo(212, -72, 220, -58); ctx.lineTo(198, -60); ctx.closePath(); const hg = ctx.createLinearGradient(196, -72, 219, -56); hg.addColorStop(0, '#fffbe8'); hg.addColorStop(1, '#c9d3dc'); ctx.fillStyle = hg; ctx.fill(); ctx.strokeStyle = 'rgba(40,45,55,0.6)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-198, -88); ctx.lineTo(-216, -80); ctx.lineTo(-219, -66); ctx.lineTo(-202, -70); ctx.closePath(); ctx.fillStyle = o.braking ? '#ff3a30' : '#b3261e'; ctx.fill();
    ctx.fillStyle = '#2a2d33'; Art.roundRectPath(ctx, 196, -40, 26, 8, 3); ctx.fill(); Art.roundRectPath(ctx, -221, -38, 20, 8, 3); ctx.fill();
    /* pasajele roților */
    [xr, xf].forEach((x) => { ctx.beginPath(); ctx.arc(x, -wr, wr + 6, Math.PI, 0); ctx.lineTo(x + wr + 6, -12); ctx.lineTo(x - wr - 6, -12); ctx.closePath(); ctx.fillStyle = '#101215'; ctx.fill(); });
    wheel(ctx, xr, wr, o.wheelA || 0); wheel(ctx, xf, wr, o.wheelA || 0);
    return { xr: xr, xf: xf, wr: wr };
  }
  /* roată dințată mică (pentru cutia de viteze) */
  function smallGear(ctx, x, y, n, r, a, col) {
    const m = r * 2 / n, p = TAU / n, ro = r + m * 0.9, rt = r - m;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath();
    for (let k = 0; k < n; k++) { const c = k * p; ctx.lineTo(Math.cos(c - p * 0.3) * rt, Math.sin(c - p * 0.3) * rt); ctx.lineTo(Math.cos(c - p * 0.15) * ro, Math.sin(c - p * 0.15) * ro); ctx.lineTo(Math.cos(c + p * 0.15) * ro, Math.sin(c + p * 0.15) * ro); ctx.lineTo(Math.cos(c + p * 0.3) * rt, Math.sin(c + p * 0.3) * rt); }
    ctx.closePath(); const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, ro); g.addColorStop(0, Art.shade(col, 0.35)); g.addColorStop(1, Art.shade(col, -0.35)); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = Art.shade(col, -0.6); ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, TAU); ctx.fillStyle = '#d5dae2'; ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, r * 0.12, 0, TAU); ctx.fillStyle = '#2a2f3a'; ctx.fill();
    ctx.restore();
  }
  /* cadran rotund de bord */
  function dial(ctx, x, y, r, val, max, label, red, unit, step, numDiv) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r + r * 0.12, 0, TAU); const bz = ctx.createLinearGradient(x - r, y - r, x + r, y + r); bz.addColorStop(0, '#e3e7ee'); bz.addColorStop(0.5, '#8d96a5'); bz.addColorStop(1, '#3e4552'); ctx.fillStyle = bz; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); const fg = ctx.createRadialGradient(x, y - r * 0.4, r * 0.1, x, y, r); fg.addColorStop(0, '#1d2638'); fg.addColorStop(1, '#0a0e18'); ctx.fillStyle = fg; ctx.fill();
    const A0 = 0.75 * Math.PI, A1 = 2.25 * Math.PI, ang = (v) => A0 + (A1 - A0) * clamp(v / max, 0, 1);
    if (red) { ctx.strokeStyle = '#d9382e'; ctx.lineWidth = r * 0.1; ctx.beginPath(); ctx.arc(x, y, r * 0.84, ang(red), A1); ctx.stroke(); }
    for (let v = 0; v <= max + 1e-6; v += step) { const a = ang(v), major = Math.abs(v / (step * numDiv) - Math.round(v / (step * numDiv))) < 1e-6; ctx.strokeStyle = major ? '#f2f4f8' : 'rgba(220,226,236,0.6)'; ctx.lineWidth = major ? 2 : 1; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); ctx.lineTo(x + Math.cos(a) * r * (major ? 0.74 : 0.8), y + Math.sin(a) * r * (major ? 0.74 : 0.8)); ctx.stroke(); if (major && r > 34) { ctx.fillStyle = '#e8ecf3'; ctx.font = Art.font(Math.max(12, r * 0.16), 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(Math.round(v)), x + Math.cos(a) * r * 0.58, y + Math.sin(a) * r * 0.58); } }
    ctx.fillStyle = 'rgba(220,228,240,0.75)'; ctx.font = Art.font(Math.max(12, r * 0.17), 600); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y - r * 0.3);
    const a = ang(val); ctx.strokeStyle = '#ff8a3d'; ctx.lineWidth = Math.max(2, r * 0.05); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * r * 0.12, y - Math.sin(a) * r * 0.12); ctx.lineTo(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r * 0.09, 0, TAU); ctx.fillStyle = '#c9ced6'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = Art.font(Math.max(12, r * 0.2), 800); ctx.fillText(Math.round(val) + ' ' + unit, x, y + r * 0.55);
    ctx.restore();
  }
  /* peisaj simplu, desaturat, cu parallax lent */
  function landscape(ctx, api, gy, dist, U) {
    const W = api.W;
    const g = ctx.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, Art.SCENE.day[0]); g.addColorStop(1, Art.SCENE.day[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, api.H);
    const hills = (base, amp, f, par, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, gy + 2); for (let x = 0; x <= W + 20; x += 16) { const X = x + dist * par; ctx.lineTo(x, base - amp * (0.55 + 0.25 * Math.sin(X * f) + 0.2 * Math.sin(X * f * 2.7 + 1.3))); } ctx.lineTo(W, gy + 2); ctx.closePath(); ctx.fill(); };
    hills(gy, U * 0.38, 0.004, 0.6, '#a7bccd');
    hills(gy, U * 0.2, 0.009, 1.6, '#93b08b');
    ctx.fillStyle = '#86a874'; ctx.fillRect(0, gy, W, api.H - gy);
    ctx.fillStyle = '#4d5157'; ctx.fillRect(0, gy + U * 0.05, W, U * 0.24);
    ctx.fillStyle = '#d9dcdf'; ctx.fillRect(0, gy + U * 0.05, W, 2); ctx.fillRect(0, gy + U * 0.29 - 2, W, 2);
    ctx.fillStyle = '#f2f2ee'; const per = U * 0.7; for (let x = -((dist * 18) % per); x < W; x += per) ctx.fillRect(x, gy + U * 0.17 - 1.5, per * 0.4, 3);
    const pp = U * 1.4; for (let x = -((dist * 12) % pp); x < W + pp; x += pp) { ctx.fillStyle = '#e9ecef'; ctx.fillRect(x, gy - U * 0.07, U * 0.018, U * 0.1); ctx.fillStyle = '#e0533b'; ctx.fillRect(x, gy - U * 0.06, U * 0.018, U * 0.015); }
  }

  /* ============================================================
     3) MAȘINA
     ============================================================ */
  defineModule({
    id: 'car', title: 'Mașina', sub: 'Motor, cutie de viteze și frâne',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'drive', thr = 0.3, gear = 1, v = 0, dist = 0, rpm = 900, wheelA = 0, gearA = 0, rpmS = 900, vS = 0;
      let pedal = 0.6, bspeed = 100, heat = 0, dots = 0, braking = false, bv = 0, bdist = 0, pedS = 0;
      const bs = {};
      const rm = api.row('');
      [['drive', '🚗 Motor și viteze'], ['brake', '🛑 Frânele']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rd = api.row(''), rb = api.row('');
      api.slider(rd, { label: 'Accelerația (pedala din dreapta)', min: 0, max: 1, step: 0.01, value: thr, fmt: (x) => Math.round(x * 100) + '%', onInput: (x) => { thr = x; } });
      const gb = {};
      ['N', 1, 2, 3, 4, 5].forEach((g) => { gb[g] = api.button(rd, 'Viteza ' + g, () => { gear = g === 'N' ? 0 : g; Object.keys(gb).forEach((k) => gb[k].classList.toggle('on', (k === 'N' ? 0 : +k) === gear)); if (gear > 0) api.say('<b>Viteza ' + gear + '.</b> ' + (gear === 1 ? 'Raport mare: multă forță, puțină viteză — bună la pornire.' : gear >= 4 ? 'Raport mic: viteză mare cu motorul în turații mici — economisești benzină.' : 'Un compromis între forță și viteză.'), 6000); else api.say('<b>Punctul mort.</b> Motorul nu e legat de roți: mașina nu e împinsă.', 4000); }); });
      gb[1].classList.add('on');
      const infoD = document.createElement('div'); infoD.className = 'mod-readout'; rd.appendChild(infoD);
      api.slider(rb, { label: 'Cât de tare apeși pedala de frână', min: 0, max: 1, step: 0.01, value: pedal, fmt: (x) => Math.round(x * 100) + '%', onInput: (x) => { pedal = x; } });
      [50, 100, 130].forEach((s) => api.button(rb, s + ' km/h', () => { bspeed = s; bv = s / 3.6; bdist = 0; braking = false; heat = 0; }));
      api.button(rb, '🛑 Frânează!', () => { if (!braking) { braking = true; bv = bspeed / 3.6; bdist = 0; } else { braking = false; } });
      const infoB = document.createElement('div'); infoB.className = 'mod-readout'; rb.appendChild(infoB);
      const MSG = { drive: 'Motorul învârte roțile prin <b>cutia de viteze</b>. Viteza 1 = forță mare, viteză mică; viteza 5 = viteză mare. Apasă accelerația și schimbă vitezele la timp: dacă turația ajunge în zona roșie, motorul „țipă”!', brake: 'Când apeși pedala, lichidul din conducte transmite presiunea până la <b>plăcuțele</b> care strâng discul. Forța se <b>multiplică</b> de zeci de ori. Apasă „Frânează!” ca să vezi distanța de oprire.' };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rd.style.display = m === 'drive' ? '' : 'none'; rb.style.display = m === 'brake' ? '' : 'none'; api.say(MSG[m], 14000); api.layout(); }
      const RAT = [0, 3.6, 2.1, 1.4, 1.0, 0.8], FINAL = 3.7, RW = 0.3;

      function frame(dt, t) {
        const U = api.unit, W = api.freeW, F = Art.labelSize(U), LB = Art.LABEL_BG;
        if (mode === 'drive') {
          /* fizică simplificată (neschimbată) */
          const ratio = RAT[gear], rawRpm = ratio ? v / (2 * Math.PI * RW) * 60 * ratio * FINAL : 0;
          const targetRpm = gear === 0 ? 900 + thr * 5500 : Math.max(900, rawRpm + thr * 0);
          rpm += (Math.max(targetRpm, gear === 0 ? 900 + thr * 5500 : 900) - rpm) * Math.min(1, dt * 8);
          if (gear > 0) rpm = Math.max(900, rawRpm);
          const torque = gear === 0 ? 0 : 220 * clamp(1 - Math.pow((rpm - 4200) / 4600, 2), 0.1, 1) * thr * (rpm > 6500 ? 0 : 1) * (rawRpm < 900 ? 0.6 : 1);
          const Fz = gear === 0 ? 0 : torque * ratio * FINAL / RW * 0.9;
          const drag = 0.5 * 1.2 * 0.7 * 2.2 * v * v + 150, a = (Fz - (v > 0.1 ? drag : 0)) / 1300;
          v = Math.max(0, v + a * dt * 3); dist += v * dt * 3; wheelA += v / RW * dt * 3; gearA += rpm / 60 * Math.PI * 2 * dt * 0.05;
          rpmS = Art.damp(rpmS, rpm, 10, dt); vS = Art.damp(vS, v, 10, dt);
          /* scenă */
          const gy = api.cy + U * 0.3;
          landscape(ctx, api, gy, dist, U);
          const carLen = Math.min(W * 0.72, U * 2.1), s = carLen / 440, cx = W * 0.5, groundY = gy + U * 0.13;
          Art.groundShadow(ctx, cx, groundY, carLen * 0.5, U * 0.035, 0.45);
          ctx.save(); ctx.translate(cx, groundY + Math.sin(t * 13) * v * 0.004); ctx.scale(s, s);
          const lab = [];
          drawCarBody(ctx, '#c8372d', {
            wheelA: wheelA * 0.5, lw: Art.lineW(U) / s,
            cut: (c) => {
              /* secțiune în caroserie: motor, cutie, arbore */
              c.fillStyle = 'rgba(38,42,52,0.88)'; Art.roundRectPath(c, -168, -68, 370, 44, 10); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1.5; c.setLineDash([6, 4]); c.stroke(); c.setLineDash([]);
              c.fillStyle = '#7b8392'; Art.roundRectPath(c, 128, -62, 66, 38, 6); c.fill();
              c.fillStyle = '#9aa3b2'; Art.roundRectPath(c, 132, -66, 58, 10, 3); c.fill();
              for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(30,34,42,0.6)'; c.fillRect(138 + k * 13, -54, 8, 22); }
              c.save(); c.translate(198, -40); c.rotate(gearA * 4); c.fillStyle = '#c9ced6'; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fill(); c.fillStyle = '#3c424e'; c.fillRect(-1.5, -8, 3, 8); c.restore();
              c.beginPath(); c.moveTo(126, -58); c.lineTo(84, -52); c.lineTo(84, -30); c.lineTo(126, -26); c.closePath(); const gbg = c.createLinearGradient(0, -58, 0, -26); gbg.addColorStop(0, '#c4cad4'); gbg.addColorStop(1, '#5e6674'); c.fillStyle = gbg; c.fill();
              smallGear(c, 112, -42, 10, 9, gearA * 3, '#e0a23a'); smallGear(c, 96, -42, Math.max(6, Math.round(10 / (0.7 + RAT[Math.max(1, gear)] * 0.35))), 6, -gearA * 3, '#5f95cf');
              Art.cylinder(c, -132, -36, 216, 8, '#9aa3b2');
              c.strokeStyle = 'rgba(30,34,42,0.5)'; c.lineWidth = 2; for (let k = 0; k < 9; k++) { const xx = -128 + ((k * 24 + gearA * 40 * (gear ? 1 : 0)) % 216); c.beginPath(); c.moveTo(xx, -36); c.lineTo(xx + 4, -28); c.stroke(); }
              c.fillStyle = '#7b8392'; c.beginPath(); c.arc(-132, -34, 13, 0, TAU); c.fill(); c.fillStyle = '#4b525e'; c.beginPath(); c.arc(-132, -34, 6, 0, TAU); c.fill();
            }
          });
          ctx.restore();
          Art.label(ctx, 'motor', cx + 160 * s, groundY - 112 * s, { size: F, bg: LB, tx: cx + 160 * s, ty: groundY - 60 * s });
          Art.label(ctx, 'cutie', cx + 98 * s, groundY + U * 0.09, { size: F, bg: LB, tx: cx + 104 * s, ty: groundY - 34 * s });
          Art.label(ctx, 'arbore', cx - 40 * s, groundY + U * 0.09, { size: F, bg: LB, tx: cx - 40 * s, ty: groundY - 32 * s });
          if (rpm > 6200) Art.label(ctx, 'Turație prea mare! Schimbă viteza!', W / 2, api.cy - U * 0.62, { size: F * 1.1, color: '#ffffff', bg: 'rgba(190,40,30,0.92)', border: false });
          /* cutia de viteze: angrenaj mărit */
          const pr = clamp(U * 0.1, 22, 46), ptop = api.cy - U + 8;
          if (gear > 0) {
            ctx.font = Art.font(Math.max(12, F * 0.85), 700); const pw = Math.max(pr * 5.4, ctx.measureText('angrenaj viteza 5 (raport 0.8)').width + 24), ph = pr * 3.3; Art.panel(ctx, 12, ptop, pw, ph, { r: 12 });
            const ratio = 0.7 + RAT[gear] * 0.35, r1 = pr * 0.62, r2 = r1 * ratio, n1 = 12, n2 = Math.max(6, Math.round(12 * ratio)), gyy = ptop + ph * 0.45;
            const xg = 12 + pw / 2 - (r1 + r2) / 2;
            smallGear(ctx, xg, gyy, n1, r1, gearA, '#e0a23a'); smallGear(ctx, xg + r1 + r2 + r1 * 0.18, gyy, n2, r2, -gearA * n1 / n2 + Math.PI / n2, '#5f95cf');
            Art.text(ctx, 'angrenaj viteza ' + gear + ' (raport ' + RAT[gear] + ')', 12 + pw / 2, ptop + ph - F * 0.75, { size: Math.max(12, F * 0.85), halo: false });
          }
          const dr = clamp(U * 0.17, 34, 66);
          dial(ctx, W - dr * 3.6 - 16, ptop + dr * 1.2, dr, rpmS / 1000, 8, 'turație', 6.5, '×1000', 0.5, 2);
          dial(ctx, W - dr * 1.25 - 12, ptop + dr * 1.2, dr, vS * 3.6, 200, 'viteză', 0, 'km/h', 10, 4);
          infoD.innerHTML = '<b>Turația:</b> ' + fmt(rpm, 0) + ' rot/min · <b>Viteza:</b> ' + fmt(v * 3.6, 0) + ' km/h · <b>Treapta:</b> ' + (gear || 'N');
        } else {
          /* frâne hidraulice (fizică neschimbată) */
          const mu = 0.8, g = 9.81, bf = pedal;
          if (braking) { const a = mu * g * bf; bv = Math.max(0, bv - a * dt * 2.2); bdist += bv * dt * 2.2; heat = clamp(heat + dt * bf * bv * 0.01, 0, 1); if (bv <= 0) { braking = false; } } else heat = Math.max(0, heat - dt * 0.2);
          const v0 = bspeed / 3.6, stopD = bf > 0.02 ? v0 * v0 / (2 * mu * g * bf) : Infinity;
          pedS = Art.damp(pedS, bf, 10, dt);
          Art.scene(ctx, api.W, api.H, 'lab');
          const cy = api.cy - U * 0.05;
          /* pedala */
          const px0 = Math.max(U * 0.25, W * 0.1), py0 = cy + U * 0.22, arm = U * 0.42;
          ctx.save(); ctx.translate(px0, py0); ctx.rotate(-0.4 + pedS * 0.28);
          ctx.beginPath(); ctx.moveTo(-U * 0.02, 0); ctx.quadraticCurveTo(-U * 0.04, -arm * 0.5, -U * 0.015, -arm); ctx.lineTo(U * 0.015, -arm); ctx.quadraticCurveTo(-U * 0.005, -arm * 0.5, U * 0.02, 0); ctx.closePath(); Art.volumeFill(ctx, -U * 0.03, 0, U * 0.03, 0, '#7b8392');
          ctx.beginPath(); Art.roundRectPath(ctx, -U * 0.09, -arm - U * 0.05, U * 0.18, U * 0.06, U * 0.02); ctx.fillStyle = '#25282e'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-U * 0.08, -arm - U * 0.05 + k * U * 0.015); ctx.lineTo(U * 0.08, -arm - U * 0.05 + k * U * 0.015); ctx.stroke(); }
          ctx.restore();
          Art.sphere(ctx, px0, py0, U * 0.025, '#aab3c0', { rim: false });
          Art.label(ctx, 'pedala', px0, py0 + U * 0.1, { size: F, bg: LB });
          /* pompa de frână */
          const mx = px0 + U * 0.28, my = cy, mw = U * 0.42, mh = U * 0.1;
          ctx.strokeStyle = '#9aa3b2'; ctx.lineWidth = U * 0.014; ctx.beginPath(); ctx.moveTo(px0 + Math.sin(-0.4 + pedS * 0.28) * arm * 0.55, py0 - Math.cos(-0.4 + pedS * 0.28) * arm * 0.55); ctx.lineTo(mx + U * 0.04 + pedS * mw * 0.25, my); ctx.stroke();
          Art.cylinder(ctx, mx, my - mh / 2, mw, mh, '#8a93a3');
          ctx.fillStyle = 'rgba(20,22,28,0.75)'; Art.roundRectPath(ctx, mx + mw * 0.08, my - mh * 0.32, mw * 0.84, mh * 0.64, mh * 0.2); ctx.fill();
          ctx.fillStyle = '#d9a64a'; ctx.fillRect(mx + mw * 0.12 + pedS * mw * 0.25, my - mh * 0.25, mw * 0.78 - pedS * mw * 0.25, mh * 0.5);
          ctx.fillStyle = '#b8bfca'; ctx.fillRect(mx + mw * 0.08 + pedS * mw * 0.25, my - mh * 0.3, mw * 0.05, mh * 0.6);
          ctx.beginPath(); Art.roundRectPath(ctx, mx + mw * 0.3, my - mh * 1.25, mw * 0.4, mh * 0.75, mh * 0.12); ctx.fillStyle = 'rgba(235,225,190,0.85)'; ctx.fill(); ctx.fillStyle = '#d9a64a'; ctx.fillRect(mx + mw * 0.32, my - mh * 0.9, mw * 0.36, mh * 0.35); ctx.fillStyle = '#2a2d33'; ctx.fillRect(mx + mw * 0.36, my - mh * 1.38, mw * 0.28, mh * 0.16);
          Art.label(ctx, 'pompa (cilindru mic)', mx + mw / 2, my + mh * 1.3, { size: F, bg: LB });
          /* conducta cu lichid */
          const dx = W * 0.64, dy = cy, dr = U * 0.42, lx0 = mx + mw, lx1 = dx + dr * 0.55;
          Art.tube(ctx, [[lx0, my], [dx - dr * 0.4, my], [dx - dr * 0.2, my - dr * 1.08], [lx1 + U * 0.06, dy - dr * 1.1], [lx1 + U * 0.06, dy - dr * 0.55]], U * 0.026, '#c98a3e');
          const pth = Art.pathSampler([[lx0, my], [dx - dr * 0.4, my], [dx - dr * 0.2, my - dr * 1.08], [lx1 + U * 0.06, dy - dr * 1.1], [lx1 + U * 0.06, dy - dr * 0.55]], false, 16);
          ctx.fillStyle = '#ffe9a8'; for (let i = 0; i < 10; i++) { const p = pth.at(((t * 0.6 * bf * 3 * 0.25 + i / 10) % 1)); ctx.beginPath(); ctx.arc(p.x, p.y, U * 0.008, 0, TAU); ctx.fill(); }
          Art.label(ctx, 'lichid de frână (nu se comprimă!)', Math.max(lx0, (lx0 + dx - dr) / 2), my + U * 0.09, { size: F, bg: LB });
          /* disc ventilat + butuc */
          const spin = braking ? bv / 8 : 7; dots += dt * spin * (1 - bf * 0.7);
          const hot = heat, dcol = Art.mix('#a9b0bb', '#ff6a2a', hot * 0.85);
          ctx.beginPath(); ctx.arc(dx, dy, dr, 0, TAU); const dg = ctx.createRadialGradient(dx - dr * 0.3, dy - dr * 0.3, dr * 0.2, dx, dy, dr); dg.addColorStop(0, Art.shade(dcol, 0.3)); dg.addColorStop(1, Art.shade(dcol, -0.3)); ctx.fillStyle = dg; ctx.fill(); ctx.strokeStyle = Art.ink(dcol); ctx.lineWidth = Art.lineW(U) * 1.2; ctx.stroke();
          ctx.save(); ctx.translate(dx, dy); ctx.rotate(dots);
          ctx.strokeStyle = 'rgba(255,255,255,0.12)'; for (let rr = dr * 0.45; rr < dr; rr += 3) { ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.stroke(); }
          for (let k = 0; k < 18; k++) { const a = k / 18 * TAU, r0 = dr * (k % 2 ? 0.72 : 0.84); ctx.fillStyle = 'rgba(20,22,28,0.7)'; ctx.beginPath(); ctx.arc(Math.cos(a) * r0, Math.sin(a) * r0, dr * 0.025, 0, TAU); ctx.fill(); }
          ctx.beginPath(); ctx.arc(0, 0, dr * 0.42, 0, TAU); const hg = ctx.createLinearGradient(-dr * 0.4, -dr * 0.4, dr * 0.4, dr * 0.4); hg.addColorStop(0, '#d7dce4'); hg.addColorStop(1, '#5d6574'); ctx.fillStyle = hg; ctx.fill();
          ctx.beginPath(); ctx.arc(0, 0, dr * 0.13, 0, TAU); ctx.fillStyle = '#2a2e36'; ctx.fill();
          for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; Art.sphere(ctx, Math.cos(a) * dr * 0.27, Math.sin(a) * dr * 0.27, dr * 0.045, '#c4cad3', { rim: false, gloss: false }); }
          ctx.restore();
          /* etrier + plăcuțe */
          const gap = (14 - bf * 12) * U / 260, ex = dx + dr * 0.55, ew = U * 0.2;
          ctx.beginPath(); Art.roundRectPath(ctx, ex + ew * 0.5, dy - dr * 0.52 - gap - U * 0.04, ew * 0.55, dr * 1.04 + gap * 2 + U * 0.08, U * 0.04); Art.volumeFill(ctx, ex + ew * 0.5, dy - dr, ex + ew, dy + dr, '#c0392b', { hi: 0.3 });
          ctx.beginPath(); Art.roundRectPath(ctx, ex + ew * 0.02, dy - dr * 0.12 - gap - U * 0.075, ew * 0.6, U * 0.03, U * 0.012); ctx.fillStyle = '#a8322a'; ctx.fill(); Art.roundRectPath(ctx, ex + ew * 0.02, dy + dr * 0.12 + gap + U * 0.045, ew * 0.6, U * 0.03, U * 0.012); ctx.fill();
          [-1, 1].forEach((sg) => Art.sphere(ctx, ex + ew * 0.78, dy + sg * dr * 0.32, U * 0.018, '#d8dde5', { rim: false, gloss: false }));
          ctx.fillStyle = '#3a3d44'; ctx.fillRect(ex, dy - dr * 0.12 - gap - U * 0.05, ew * 0.55, U * 0.05); ctx.fillRect(ex, dy + dr * 0.12 + gap, ew * 0.55, U * 0.05);
          ctx.fillStyle = '#6b6258'; ctx.fillRect(ex, dy - dr * 0.12 - gap - U * 0.012, ew * 0.55, U * 0.012); ctx.fillRect(ex, dy + dr * 0.12 + gap, ew * 0.55, U * 0.012);
          Art.label(ctx, 'plăcuțe', ex + ew * 0.3, dy - dr - U * 0.08, { size: F, bg: LB, tx: ex + ew * 0.3, ty: dy - dr * 0.12 - gap - U * 0.05 });
          Art.label(ctx, 'disc', dx - dr * 0.1, dy + dr + U * 0.08, { size: F, bg: LB });
          if (hot > 0.25) Art.label(ctx, 'disc încins: ' + Math.round(100 + hot * 500) + '°C', dx - dr * 0.4, dy - dr - U * 0.08, { size: F, bg: LB, color: '#ffb07a' });
          /* multiplicare de forță */
          const mult = 4 * 6;
          Art.label(ctx, 'Forța ta ×' + mult + ' (pârghie ×4, pistoane ×6)', W / 2, api.cy - U + F * 1.4, { size: F, bg: LB, color: '#ffd166' });
          /* distanța de oprire */
          const bw = Math.min(W - 40, U * 1.8), bx = (W - bw) / 2, by = api.cy + U * 0.68;
          const maxD = 140;
          Art.text(ctx, 'distanța de oprire de la ' + bspeed + ' km/h: ' + (isFinite(stopD) ? fmt(stopD, 0) + ' m' : '∞ (nu frânezi)'), bx, by - F * 0.9, { size: F, align: 'left' });
          Art.meter(ctx, bx, by, bw, Math.max(10, U * 0.04), clamp(stopD / maxD, 0, 1), '#e8453a');
          if (braking || bdist > 0) Art.meter(ctx, bx, by + Math.max(14, U * 0.055), bw, Math.max(7, U * 0.025), clamp(bdist / maxD, 0, 1), '#4ade80');
          infoB.innerHTML = '<b>Viteza:</b> ' + fmt(bv * 3.6, 0) + ' km/h · <b>Parcurs:</b> ' + fmt(bdist, 0) + ' m · la dublarea vitezei, distanța crește de <b>4 ori</b>!';
        }
      }
      setMode('drive');
      return { frame: frame };
    }
  });
})();
