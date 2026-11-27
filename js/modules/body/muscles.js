/* Modul: Mușchii — cum mișcăm oasele */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const MUS = [
    { id: 'face', n: 'Mușchii feței', p: [[0, -265]], r: 22, t: 'Peste 40 de mușchi mici în față! Cu ei zâmbești, te încrunți, clipești. Pentru un zâmbet folosești vreo 12 mușchi.' },
    { id: 'neck', n: 'Mușchii gâtului', p: [[0, -220]], r: 16, t: 'Țin capul drept (e greu cât un pepene mic!) și îl întorc stânga-dreapta.' },
    { id: 'chest', n: 'Pectoralii (pieptul)', p: [[-32, -165], [32, -165]], r: 30, t: 'Mușchii pieptului: îi folosești când împingi ceva sau când îmbrățișezi pe cineva.' },
    { id: 'heart', n: 'Inima', p: [[14, -150]], r: 13, t: 'Și <b>inima e un mușchi</b>! Cel mai harnic: bate fără oprire, zi și noapte, toată viața. Nu poți s-o oprești cu voia ta.' },
    { id: 'abs', n: 'Abdomenul (burta)', p: [[0, -95]], r: 32, t: 'Mușchii burții țin corpul drept și protejează organele dinăuntru. Îi folosești când te ridici din pat.' },
    { id: 'biceps', n: 'Bicepsul', p: [[-82, -150], [82, -150]], r: 18, t: '<b>Bicepsul</b> îndoaie brațul. Încearcă: pune mâna pe braț și îndoaie cotul. Simți cum se umflă?' },
    { id: 'thigh', n: 'Coapsa (cvadricepsul)', p: [[-30, 30], [30, 30]], r: 28, t: 'Mușchii coapsei sunt printre cei mai puternici: cu ei mergi, alergi, sari și urci scările.' },
    { id: 'calf', n: 'Gamba', p: [[-30, 150], [30, 150]], r: 18, t: 'Gamba te ridică pe vârfuri și te împinge înainte când mergi. E legată de călcâi printr-un tendon foarte puternic.' },
    { id: 'glute', n: 'Fesierii', p: [[0, -20]], r: 26, t: 'Cel mai mare mușchi din corp e <b>fesierul mare</b>, cel pe care stai! Te ajută să urci și să te ridici.' }
  ];
  defineModule({
    id: 'muscles', title: 'Mușchii', sub: 'Cum mișcăm oasele: mușchii trag, nu împing',
    start: function (api) {
      const ctx = api.ctx; let mode = 'arm', ang = 0.4, angT = 0.4, wt = 0, auto = true, sel = null, selT = 0;
      const rm = api.row(''), bs = {};
      [['arm', '💪 Brațul'], ['body', '🧍 Mușchii corpului']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const ra = api.row('');
      const sl = api.slider(ra, { label: 'Îndoaie brațul', min: 0, max: 1, step: 0.01, value: ang, fmt: (v) => v < 0.2 ? 'întins' : v > 0.8 ? 'îndoit tare' : 'puțin îndoit', onInput: (v) => { angT = v; auto = false; ab.classList.remove('on'); } });
      const ab = api.button(ra, '🔁 Singur', () => { auto = !auto; ab.classList.toggle('on', auto); }); ab.classList.add('on');
      const WT = ['fără greutate', '🍎 un măr', '🏋️ o ganteră'];
      api.button(ra, '🏋️ Schimbă greutatea', () => { wt = (wt + 1) % 3; api.say('Acum ține ' + WT[wt] + '. ' + (wt ? 'Bicepsul trebuie să tragă <b>mai tare</b>: vezi cum se face mai roșu și mai gros.' : '')); });
      function setMode(m) { mode = m; sel = null; for (const k in bs) bs[k].classList.toggle('on', k === m); ra.style.display = m === 'arm' ? '' : 'none'; api.say(m === 'arm' ? 'Mușchii pot doar să <b>tragă</b>, nu să împingă. De aceea lucrează în <b>perechi</b>: <b>bicepsul</b> (în față) se strânge și îndoaie brațul, iar <b>tricepsul</b> (în spate) se strânge și îl întinde la loc. Când unul trage, celălalt se relaxează.' : 'Avem peste <b>600 de mușchi</b>! Ei sunt legați de oase prin <b>tendoane</b>, ca niște sfori. Atinge corpul ca să afli ce face fiecare mușchi.'); api.layout(); }
      let V = null;
      api.pointer({ down: (x, y) => { if (mode !== 'body' || !V) return; const p = V.inv(x, y); let best = null, bd = 1e9; for (const m of MUS) for (const q of m.p) { const d = Math.hypot(p[0] - (500 + q[0] * 1.5), p[1] - (330 + q[1] * 1.0)); if (d < m.r * 1.6 + 14 && d < bd) { bd = d; best = m; } } if (best) { sel = best.id; selT = 0; api.say('<b>' + best.n + '.</b> ' + best.t); } } });

      function bone(x0, y0, x1, y1, w) { ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#d8ccb0'; ctx.lineWidth = w + 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = '#f2ead6'; ctx.lineWidth = w; ctx.stroke(); ctx.fillStyle = '#f2ead6'; ctx.beginPath(); ctx.arc(x0, y0, w * 0.85, 0, TAU); ctx.arc(x1, y1, w * 0.85, 0, TAU); ctx.fill(); ctx.restore(); }
      function muscle(p0, p1, thick, on, col) {
        const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
        const c = A.mix(col || '#b8404a', '#ff3a4a', on);
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(mx + nx * thick, my + ny * thick, p1[0], p1[1]); ctx.quadraticCurveTo(mx - nx * thick * 0.35, my - ny * thick * 0.35, p0[0], p0[1]); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(mx + nx * thick * (1 - i * 0.28), my + ny * thick * (1 - i * 0.28), p1[0], p1[1]); ctx.stroke(); }
      }
      function drawArm(dt, t) {
        if (auto) angT = (Math.sin(t * 0.9) + 1) / 2; ang = A.damp(ang, angT, 6, dt); sl.set(ang);
        const sh = [330, 170], elbow = [330, 420], a = lerp(0.05, 2.35, ang), fl = 230;
        const wrist = [elbow[0] + Math.sin(a) * fl, elbow[1] - Math.cos(a) * fl * -1 * -1 + 0];
        const wx = elbow[0] + Math.sin(Math.PI - a) * fl * 0 + Math.sin(a) * fl, wy = elbow[1] - Math.cos(Math.PI - a) * fl;
        /* conturul pielii (transparent) */
        ctx.save(); ctx.globalAlpha = 0.18; ctx.strokeStyle = '#f2c09a'; ctx.lineCap = 'round'; ctx.lineWidth = 120; ctx.beginPath(); ctx.moveTo(sh[0], sh[1] - 30); ctx.lineTo(elbow[0], elbow[1]); ctx.lineTo(wx, wy); ctx.stroke(); ctx.restore();
        /* omoplatul și oasele */
        ctx.fillStyle = '#e8dfc6'; ctx.beginPath(); ctx.moveTo(280, 120); ctx.lineTo(380, 110); ctx.lineTo(360, 230); ctx.closePath(); ctx.fill();
        bone(sh[0], sh[1], elbow[0], elbow[1], 22);
        bone(elbow[0], elbow[1], wx, wy, 16);
        /* mâna */
        ctx.fillStyle = '#f2c09a'; ctx.save(); ctx.translate(wx, wy); ctx.rotate(a - Math.PI / 2 + Math.PI); ctx.beginPath(); ctx.ellipse(0, -22, 26, 36, 0, 0, TAU); ctx.fill(); ctx.restore();
        if (wt) { ctx.save(); ctx.font = (wt === 1 ? 60 : 72) + 'px "Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(wt === 1 ? '🍎' : '🏋️', wx + Math.sin(a) * 40, wy - Math.cos(Math.PI - a) * 40 - 10); ctx.restore(); }
        /* bicepsul (în față) și tricepsul (în spate) */
        const load = 1 + wt * 0.5, bOn = clamp(ang * load * 0.8, 0, 1), tOn = clamp((1 - ang) * 0.9, 0, 1);
        const bIns = [elbow[0] + Math.sin(a) * 45, elbow[1] - Math.cos(Math.PI - a) * 45];
        muscle([sh[0] + 22, sh[1] + 20], bIns, lerp(28, 70, ang) + wt * 8, bOn);
        muscle([sh[0] - 18, sh[1] + 30], [elbow[0] - 20, elbow[1] + 18], lerp(-55, -25, ang), tOn, '#a8343e');
        /* tendoane */
        ctx.strokeStyle = '#f4f0e0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bIns[0], bIns[1]); ctx.lineTo(elbow[0] + Math.sin(a) * 25, elbow[1] - Math.cos(Math.PI - a) * 25); ctx.stroke();
        A.label(ctx, 'Bicepsul ' + (bOn > 0.5 ? '— trage! 💪' : '— se relaxează'), 640, 210, { size: 17, tx: (sh[0] + bIns[0]) / 2 + 30, ty: (sh[1] + bIns[1]) / 2, color: bOn > 0.5 ? '#ffb0b8' : '#fff' });
        A.label(ctx, 'Tricepsul ' + (tOn > 0.5 ? '— trage! 💪' : '— se relaxează'), 130, 330, { size: 17, tx: sh[0] - 40, ty: (sh[1] + elbow[1]) / 2 + 20, color: tOn > 0.5 ? '#ffb0b8' : '#fff' });
        A.label(ctx, 'Osul brațului', 140, 200, { size: 15, tx: sh[0] - 4, ty: sh[1] + 60 });
        A.label(ctx, 'Cotul (încheietura)', 160, 470, { size: 15, tx: elbow[0] - 14, ty: elbow[1] });
        A.label(ctx, 'Tendonul', 640, 470, { size: 15, tx: bIns[0] + 4, ty: bIns[1] + 4 });
        /* indicator de efort */
        A.text(ctx, 'Efortul bicepsului', 820, 380, { size: 15 }); A.meter(ctx, 720, 400, 200, 16, bOn, '#ff4a5a');
      }
      function drawBody(dt, t) {
        selT += dt; const cx = 500, cy = 330, sx = 1.5, sy = 1.0;
        const P = (x, y) => [cx + x * sx, cy + y * sy];
        /* siluetă */
        ctx.fillStyle = '#c86a6a';
        const head = P(0, -268); ctx.beginPath(); ctx.ellipse(head[0], head[1], 36, 44, 0, 0, TAU); ctx.fill();
        const seg = (pts, w) => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#b5555a'; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => { const q = P(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); };
        seg([[0, -230], [0, -210]], 34);
        ctx.fillStyle = '#b5555a'; ctx.beginPath(); const tl = P(-62, -200), tr = P(62, -200), br = P(42, -10), bl = P(-42, -10); ctx.moveTo(tl[0], tl[1]); ctx.lineTo(tr[0], tr[1]); ctx.lineTo(br[0], br[1]); ctx.lineTo(bl[0], bl[1]); ctx.fill();
        seg([[-62, -195], [-85, -110], [-95, -20]], 38); seg([[62, -195], [85, -110], [95, -20]], 38);
        seg([[-28, -10], [-32, 90], [-30, 210]], 46); seg([[28, -10], [32, 90], [30, 210]], 46);
        /* fibre (dungi) */
        ctx.strokeStyle = 'rgba(255,200,200,0.18)'; ctx.lineWidth = 2; for (let i = 0; i < 40; i++) { const p = P(((i * 37) % 120) - 60, ((i * 53) % 440) - 230); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + 4, p[1] + 16); ctx.stroke(); }
        ctx.fillStyle = '#f2ead6'; for (const s of [-1, 1]) { const k = P(s * 31, 92); ctx.beginPath(); ctx.ellipse(k[0], k[1], 13, 9, 0, 0, TAU); ctx.fill(); }
        /* zonele */
        for (const m of MUS) for (const q of m.p) { const p = P(q[0], q[1]), on = sel === m.id; if (on) { A.glow(ctx, p[0], p[1], m.r * 2.4, '#ffe36a', 0.6 + 0.3 * Math.sin(selT * 6)); } ctx.strokeStyle = on ? '#ffe36a' : 'rgba(255,255,255,0.35)'; ctx.lineWidth = on ? 3 : 1.5; ctx.setLineDash(on ? [] : [4, 4]); ctx.beginPath(); ctx.arc(p[0], p[1], m.r * 1.2, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
        if (sel) { const m = MUS.find((q) => q.id === sel), p = P(m.p[m.p.length - 1][0], m.p[0][1]); A.label(ctx, m.n, p[0] + 150, p[1], { size: 18, tx: p[0] + m.r * 1.2, ty: p[1], color: '#ffe08a' }); }
        else A.text(ctx, '👆 Atinge un cerc', cx, 590, { size: 16, color: 'rgba(255,255,255,0.7)' });
        A.text(ctx, '600+ mușchi', 160, 120, { size: 30, color: '#ffb0b8' }); A.text(ctx, 'aproape jumătate din greutatea ta', 160, 154, { size: 15 });
        A.text(ctx, 'cel mai mic: în ureche', 850, 120, { size: 16 }); A.text(ctx, 'cel mai mare: fesierul', 850, 150, { size: 16 }); A.text(ctx, 'cel mai harnic: inima ❤️', 850, 180, { size: 16 });
      }
      setMode('arm');
      return { frame: function (dt, t) { A.scene(ctx, api.W, api.H, 'body'); V = window.Fit(api, 1000, 600); ctx.save(); V.apply(ctx); if (mode === 'arm') drawArm(dt, t); else drawBody(dt, t); ctx.restore(); } };
    }
  });
})();
