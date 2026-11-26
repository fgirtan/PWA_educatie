/* Modul: Mașina electrică și motorul ei — mașină ilustrată, magneți și bobine reale */
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

  /* frunză mică (simbol „verde”, desenată, nu emoji) */
  function leaf(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6); ctx.beginPath(); ctx.moveTo(0, s); ctx.quadraticCurveTo(-s * 0.9, 0, 0, -s); ctx.quadraticCurveTo(s * 0.9, 0, 0, s); ctx.closePath(); ctx.fillStyle = '#5fbf6a'; ctx.fill(); ctx.strokeStyle = '#2f7a3a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, s); ctx.lineTo(0, -s * 0.7); ctx.stroke(); ctx.restore(); }
  /* electromagnet: miez de fier + bobinaj de cupru, cu fața polului colorată */
  function coil(ctx, U, polN, strength) {
    const L = U * 0.22, w = U * 0.12;
    /* miez (talpă spre exterior) */
    ctx.beginPath(); Art.roundRectPath(ctx, U * 0.02, -w * 0.85, L * 0.35, w * 1.7, U * 0.012); Art.volumeFill(ctx, 0, -w, 0, w, '#7d8696');
    ctx.beginPath(); Art.roundRectPath(ctx, -L, -w * 0.32, L + U * 0.04, w * 0.64, U * 0.008); Art.volumeFill(ctx, 0, -w * 0.32, 0, w * 0.32, '#8a93a3');
    /* bobinaj */
    const cx0 = -L * 0.82, cx1 = -L * 0.02;
    ctx.beginPath(); Art.roundRectPath(ctx, cx0, -w * 0.55, cx1 - cx0, w * 1.1, U * 0.02);
    const cg = ctx.createLinearGradient(0, -w * 0.55, 0, w * 0.55); cg.addColorStop(0, '#f0b070'); cg.addColorStop(0.35, '#d0843f'); cg.addColorStop(1, '#7a4317'); ctx.fillStyle = cg; ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(90,45,10,0.55)'; ctx.lineWidth = 1; for (let x = cx0 + 2; x < cx1; x += Math.max(2.5, U * 0.011)) { ctx.beginPath(); ctx.moveTo(x, -w * 0.55); ctx.quadraticCurveTo(x + 1.5, 0, x, w * 0.55); ctx.stroke(); } ctx.restore();
    /* fața polului */
    const col = polN ? '#d8473c' : '#3b76d6';
    ctx.beginPath(); Art.roundRectPath(ctx, -L - U * 0.045, -w * 0.5, U * 0.05, w, U * 0.012); Art.volumeFill(ctx, -L - U * 0.045, -w * 0.5, -L, w * 0.5, col, { hi: 0.35 });
    if (strength > 0) { ctx.strokeStyle = Art.rgba(col, 0.25 * strength); ctx.lineWidth = 1.5; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(-L - U * 0.05, k * w * 0.3); ctx.quadraticCurveTo(-L - U * 0.13, k * w * 0.6, -L - U * 0.2, k * w * 0.9); ctx.stroke(); } }
  }
  function battery(ctx, x, y, w, h, lv) {
    ctx.beginPath(); Art.roundRectPath(ctx, x, y, w, h, h * 0.18); Art.volumeFill(ctx, x, y, x, y + h, '#2b3447', { hi: 0.25 });
    ctx.fillStyle = '#9aa3b2'; Art.roundRectPath(ctx, x + w, y + h * 0.3, w * 0.05, h * 0.4, 2); ctx.fill();
    const col = lv > 0.5 ? '#3fbf6a' : lv > 0.2 ? '#e0c23a' : '#e0503a';
    const cells = 5; for (let i = 0; i < cells; i++) { const on = lv > i / cells + 0.02; ctx.fillStyle = on ? col : 'rgba(255,255,255,0.08)'; Art.roundRectPath(ctx, x + w * 0.06 + i * (w * 0.88 / cells), y + h * 0.2, w * 0.88 / cells - 3, h * 0.6, 2); ctx.fill(); }
  }

  defineModule({
    id: 'emotor', title: 'Mașina electrică', sub: 'Baterie, motor și magneți care se împing',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'car', pedal = 0.35, braking = false, v = 0, dist = 0, bat = 1, wheelA = 0, flow = 0, plug = 0, energyUsed = 0, vS = 0, plugS = 0;
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
        const U = api.unit, W = api.freeW, F = Art.labelSize(U), LB = Art.LABEL_BG;
        if (mode === 'car') {
          /* simplu: viteză ∝ accelerație, frână = recuperare (neschimbat) */
          const target = pedal * 33 * (bat > 0.01 ? 1 : 0);
          v += (braking ? -v * 1.2 - 3 : (target - v) * 0.5) * dt; v = Math.max(0, v);
          const pw = (braking ? -v * 0.8 : v * 0.55 * (0.3 + pedal) * 0.6) * (v > 0.2 ? 1 : 0);
          bat = clamp(bat - pw * dt / 3600 * 60 / 60 * 0.9, 0, 1); if (plug > 0) { plug -= dt; bat = 1; }
          energyUsed += Math.max(0, pw) * dt / 3600; dist += v * dt * 3; wheelA += v / 0.33 * dt * 1.4; flow += dt * (Math.abs(pw) * 0.12) * (braking ? -1 : 1);
          vS = Art.damp(vS, v, 8, dt); plugS = Art.damp(plugS, plug > 0 ? 1 : 0, 6, dt);
          const gy = api.cy + U * 0.3;
          landscape(ctx, api, gy, dist, U);
          const carLen = Math.min(W * 0.66, U * 2.0), s = carLen / 440, cx = W * 0.54, groundY = gy + U * 0.13;
          const lv = clamp(bat, 0, 1), act = Math.abs(pw) > 0.02;
          /* stația de încărcare */
          if (plugS > 0.02) {
            const sx = cx - carLen * 0.5 - U * 0.25, sh = U * 0.5;
            ctx.save(); ctx.globalAlpha = plugS;
            ctx.beginPath(); Art.roundRectPath(ctx, sx - U * 0.07, groundY - sh, U * 0.14, sh, U * 0.03); Art.volumeFill(ctx, sx - U * 0.07, 0, sx + U * 0.07, 0, '#e8ecf1', { hi: 0.2 });
            ctx.fillStyle = '#1d2a3a'; Art.roundRectPath(ctx, sx - U * 0.045, groundY - sh * 0.85, U * 0.09, sh * 0.25, U * 0.012); ctx.fill();
            ctx.fillStyle = '#4ade80'; ctx.fillRect(sx - U * 0.035, groundY - sh * 0.73, U * 0.07 * ((t * 0.5) % 1), sh * 0.06);
            ctx.strokeStyle = '#2a2f38'; ctx.lineWidth = U * 0.014; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx + U * 0.07, groundY - sh * 0.45); ctx.bezierCurveTo(sx + U * 0.25, groundY - sh * 0.05, cx - carLen * 0.48, groundY - U * 0.02, cx - 214 * s, groundY - 60 * s); ctx.stroke();
            ctx.restore();
            Art.label(ctx, 'se încarcă', sx, groundY - sh - F, { size: F, bg: LB, color: '#7dffb0' });
          }
          Art.groundShadow(ctx, cx, groundY, carLen * 0.5, U * 0.035, 0.45);
          ctx.save(); ctx.translate(cx, groundY); ctx.scale(s, s);
              drawCarBody(ctx, '#2e8b74', {
            wheelA: wheelA * 0.5, braking: braking, lw: Art.lineW(U) / s,
            cut: (c) => {
              c.fillStyle = 'rgba(34,40,52,0.9)'; Art.roundRectPath(c, -178, -64, 370, 42, 10); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1.5; c.setLineDash([6, 4]); c.stroke(); c.setLineDash([]);
              battery(c, -100, -36, 200, 13, lv);
              c.beginPath(); Art.roundRectPath(c, -126, -60, 34, 20, 4); Art.volumeFill(c, -126, -60, -92, -40, '#e0a23a', { hi: 0.3 });
              c.fillStyle = 'rgba(0,0,0,0.35)'; for (let k = 0; k < 4; k++) c.fillRect(-122 + k * 8, -56, 4, 12);
              c.beginPath(); c.arc(-150, -34, 17, 0, TAU); const mg = c.createRadialGradient(-156, -40, 2, -150, -34, 17); mg.addColorStop(0, '#c8cfd9'); mg.addColorStop(1, '#4f5866'); c.fillStyle = mg; c.fill();
              c.save(); c.translate(-150, -34); c.rotate(wheelA * 1.5); c.fillStyle = '#d0843f'; for (let k = 0; k < 6; k++) { c.rotate(TAU / 6); c.fillRect(-2, -14, 4, 7); } c.restore();
              c.lineCap = 'round'; c.strokeStyle = '#c9843a'; c.lineWidth = 3;
              c.beginPath(); c.moveTo(-60, -30); c.lineTo(-60, -50); c.lineTo(-92, -50); c.moveTo(-126, -50); c.lineTo(-140, -50); c.lineTo(-145, -45); c.stroke();
              if (act) { const pts = [[-60, -30], [-60, -50], [-92, -50], [-126, -50], [-140, -50], [-145, -45]]; const smp = Art.pathSampler(pts, false, 6); c.fillStyle = braking ? '#7dffb0' : '#7ec8ff'; for (let i = 0; i < 7; i++) { const u = (((i / 7 + flow) % 1) + 1) % 1, p = smp.at(u); c.beginPath(); c.arc(p.x, p.y, 3.2, 0, TAU); c.fill(); } }
            }
          });
          ctx.restore();
          const lx = (x) => cx + x * s, ly = (y) => groundY + y * s;
          Art.label(ctx, 'baterie', lx(0), groundY + U * 0.1, { size: F, bg: LB, tx: lx(0), ty: ly(-30) });
          Art.label(ctx, 'controler', lx(-109), ly(-60) - U * 0.2, { size: F, bg: LB, tx: lx(-109), ty: ly(-60) });
          Art.label(ctx, 'motor', lx(-150), groundY + U * 0.1, { size: F, bg: LB, tx: lx(-150), ty: ly(-34) });
          /* panou de bord */
          const pX = 12, pY = api.cy - U + 8, pWd = Math.max(170, F * 12), pHt = F * 5.4;
          Art.panel(ctx, pX, pY, pWd, pHt, { r: 12 });
          Art.text(ctx, Math.round(vS * 3.6) + ' km/h', pX + 14, pY + F * 1.3, { size: F * 1.8, weight: 800, align: 'left', halo: false });
          battery(ctx, pX + 14, pY + F * 2.6, pWd - 40, F * 1.2, lv);
          Art.text(ctx, 'baterie ' + Math.round(lv * 100) + '%', pX + 14, pY + F * 4.5, { size: Math.max(12, F * 0.9), align: 'left', halo: false, color: 'rgba(226,234,255,0.85)' });
          if (v > 1 && !braking) { leaf(ctx, pX + 22, pY + pHt + F * 1.1, F * 0.55); Art.text(ctx, 'fără fum, fără benzină', pX + 34, pY + pHt + F * 1.1, { size: Math.max(12, F * 0.9), align: 'left', color: '#d8f5dc' }); }
          const range = pw > 0.05 ? bat * 60 / pw * v * 3.6 : Infinity;
          infoC.innerHTML = '<b>Putere:</b> ' + (braking && v > 0.5 ? 'recuperează ' + fmt(Math.abs(pw), 1) + ' kW' : fmt(Math.max(0, pw), 1) + ' kW') + ' · <b>Autonomie:</b> ' + (isFinite(range) ? '~' + fmt(Math.min(range, 999), 0) + ' km la viteza asta' : '—') + ' · <b>Parcurs:</b> ' + fmt(dist / 1000 * 3, 1) + ' km';
        } else {
          Art.scene(ctx, api.W, api.H, 'lab');
          const wide = W > U * 2.4, cx = api.cx - (wide ? U * 0.3 : U * 0.08), cy = api.cy - U * 0.05, R = U * (wide ? 0.62 : 0.48);
          /* controler: polaritatea fiecărui electromagnet (neschimbat) */
          const coils = [0, 1, 2, 3].map((i) => i * Math.PI / 2 + Math.PI / 4);
          const pol = coils.map((phi, i) => ctrl ? (Math.sin(th - phi) >= 0 ? 1 : -1) : (i % 2 ? -1 : 1));
          let torque = 0; coils.forEach((phi, i) => { torque += pol[i] * Math.sin(th - phi); });
          w += (torque * volt * 40 - w * 1.6) * dt; w = clamp(w, -40, 40); th += w * dt;
          /* carcasa statorului */
          ctx.beginPath(); ctx.arc(cx, cy, R + U * 0.1, 0, TAU); ctx.arc(cx, cy, R + U * 0.03, 0, TAU, true);
          const sg = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R); sg.addColorStop(0, '#9aa3b2'); sg.addColorStop(1, '#3d4553'); ctx.fillStyle = sg; ctx.fill();
          ctx.beginPath(); ctx.arc(cx, cy, R + U * 0.03, 0, TAU); ctx.fillStyle = 'rgba(10,14,24,0.6)'; ctx.fill();
          for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + Math.PI / 8; Art.sphere(ctx, cx + Math.cos(a) * (R + U * 0.065), cy + Math.sin(a) * (R + U * 0.065), U * 0.013, '#c9ced8', { rim: false, gloss: false }); }
          /* electromagneți */
          coils.forEach((phi, i) => {
            ctx.save(); ctx.translate(cx + Math.cos(phi) * (R + U * 0.03), cy + Math.sin(phi) * (R + U * 0.03)); ctx.rotate(phi);
            coil(ctx, U, pol[i] > 0, volt); ctx.restore();
            const px = cx + Math.cos(phi) * (R - U * 0.17), py = cy + Math.sin(phi) * (R - U * 0.17);
            Art.text(ctx, pol[i] > 0 ? 'N' : 'S', px, py, { size: Math.max(14, U * 0.07), weight: 800, color: pol[i] > 0 ? '#ffb4ac' : '#b4cdff' });
          });
          /* rotor: magnet permanent în mijloc (roșu = N, albastru = S) */
          const rr = R * 0.36;
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(th);
          ctx.beginPath(); ctx.arc(0, 0, rr * 1.08, 0, TAU); ctx.fillStyle = '#2a303c'; ctx.fill();
          ctx.beginPath(); ctx.arc(0, 0, rr, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fillStyle = '#d8473c'; ctx.fill();
          ctx.beginPath(); ctx.arc(0, 0, rr, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fillStyle = '#3b76d6'; ctx.fill();
          ctx.fillStyle = '#e9edf3'; ctx.fillRect(-1.5, -rr, 3, rr * 2);
          Art.text(ctx, 'N', rr * 0.5, 0, { size: Math.max(16, rr * 0.4), weight: 800 }); Art.text(ctx, 'S', -rr * 0.5, 0, { size: Math.max(16, rr * 0.4), weight: 800 });
          ctx.restore();
          /* lumină fixă pe rotor (volum) */
          const hl = ctx.createRadialGradient(cx - rr * 0.4, cy - rr * 0.45, 1, cx, cy, rr); hl.addColorStop(0, 'rgba(255,255,255,0.35)'); hl.addColorStop(0.6, 'rgba(255,255,255,0)'); hl.addColorStop(1, 'rgba(0,0,0,0.3)'); ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fill();
          Art.sphere(ctx, cx, cy, rr * 0.2, '#c9ced8', { rim: false });
          Art.label(ctx, 'magnetul din mijloc (rotorul)', cx, cy - R - U * 0.2, { size: F, bg: LB });
          /* baterie + controler (jos-stânga) */
          const bx = cx - R - U * 0.05, by = cy + R + U * 0.13;
          if (by + U * 0.1 < api.cy + U) {
            battery(ctx, bx - U * 0.32, by, U * 0.28, U * 0.09, 1);
            ctx.beginPath(); Art.roundRectPath(ctx, bx + U * 0.06, by - U * 0.005, U * 0.14, U * 0.1, U * 0.015); Art.volumeFill(ctx, 0, by, 0, by + U * 0.1, ctrl ? '#e0a23a' : '#6b7280', { hi: 0.3 });
            ctx.strokeStyle = '#c9843a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bx - U * 0.02, by + U * 0.045); ctx.lineTo(bx + U * 0.06, by + U * 0.045); ctx.moveTo(bx + U * 0.2, by + U * 0.045); ctx.quadraticCurveTo(cx - R * 0.3, by + U * 0.05, cx + Math.cos(coils[1]) * R * 0.95, cy + Math.sin(coils[1]) * R * 0.95 + U * 0.08); ctx.stroke();
            Art.text(ctx, 'baterie', bx - U * 0.18, by + U * 0.16, { size: Math.max(12, F * 0.9) }); Art.text(ctx, 'controler', bx + U * 0.13, by + U * 0.16, { size: Math.max(12, F * 0.9) });
          }
          /* roata atașată */
          const wr = U * (wide ? 0.17 : 0.14), rx = Math.min(api.freeW - wr - 16, cx + R + U * 0.35), ry = cy + R * 0.5;
          ctx.strokeStyle = '#8a93a3'; ctx.lineWidth = U * 0.02; ctx.beginPath(); ctx.moveTo(cx + R + U * 0.1, cy); ctx.lineTo(rx, cy); ctx.lineTo(rx, ry - wr); ctx.stroke();
          ctx.save(); ctx.translate(rx, ry + wr); wheel(ctx, 0, wr, th); ctx.restore();
          Art.label(ctx, 'roata mașinii', rx, ry + wr * 1.5, { size: F, bg: LB });
          const rpm = Math.abs(w) / (2 * Math.PI) * 60;
          infoM.innerHTML = '<b>Viteza motorului:</b> ' + fmt(rpm, 0) + ' rot/min' + (!ctrl && rpm < 5 ? ' · <i>fără controler s-a oprit</i>' : '') + ' · roșu = pol <b>N</b>, albastru = pol <b>S</b>';
        }
      }
      setMode('car');
      return { frame: frame };
    }
  });
})();
