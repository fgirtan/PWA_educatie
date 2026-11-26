/* Modul: Straturile Pământului — secțiune ilustrată prin planetă (rocă, magmă care curge, nucleu incandescent) */
(function () {
  const A = window.Art;
  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtN = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 0 : d });
  const mixc = (c1, c2, t) => { t = clamp(t, 0, 1); return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]; };
  const N2 = A.noise2;
  const fbm = (x, y) => N2(x, y) * 0.6 + N2(x * 2.1 + 5, y * 2.1) * 0.3 + N2(x * 4.3 + 9, y * 4.3) * 0.15;

  /* ---------- texturi pre-randate (o dată pe mărime) ---------- */
  /* exteriorul globului: ocean, continente organice, nori, lumină din stânga-sus */
  function globeTex(R) {
    const S = Math.ceil(R * 2 + 4);
    return A.cached('ly-globe3', S, S, (c, w) => {
      const d = c.createImageData(w, w), h = w / 2;
      let lx = -0.55, ly = 0.5, lz = 0.67; const ln = Math.hypot(lx, ly, lz); lx /= ln; ly /= ln; lz /= ln;
      const tilt = 0.35, ct = Math.cos(tilt), st = Math.sin(tilt);
      for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) {
        const nx = (i + 0.5 - h) / R, ny = (j + 0.5 - h) / R, r2 = nx * nx + ny * ny, o = (j * w + i) * 4;
        const r = Math.sqrt(r2), al = clamp((1 - r) * R + 0.5, 0, 1); if (al <= 0) continue;
        const z = Math.sqrt(Math.max(0, 1 - Math.min(1, r2))), y = -ny;
        const y1 = y * ct - z * st, z1 = y * st + z * ct;
        const lat = Math.asin(clamp(y1, -1, 1)) * 57.3, lon = Math.atan2(nx, z1) * 57.3, alat = Math.abs(lat);
        /* coordonate 3D pentru zgomot fără cusătură */
        const X = nx * 1.6, Y = y1 * 1.6, Z = z1 * 1.6;
        const land = fbm(X * 1.3 + Z * 0.7, Y * 1.3 - Z * 0.5) + 0.35 * N2(Z * 2 + 7, X * 2 - Y) + 0.02;
        let col;
        if (land > 0.08) {
          const e = land - 0.08, nz = N2(X * 6, Y * 6 + Z * 3);
          if (alat > 62) col = [150, 150, 128];
          else if (alat > 14 && alat < 34 && nz > -0.2) col = mixc([206, 178, 124], [180, 146, 98], nz + 0.4);
          else if (alat < 12) col = [46, 104, 50];
          else col = mixc([70, 124, 60], [104, 140, 76], nz * 0.5 + 0.5);
          if (e > 0.18) col = mixc(col, [128, 112, 96], clamp((e - 0.18) * 5, 0, 1));
          if (e < 0.02) col = mixc(col, [200, 188, 140], 0.4);
        } else {
          const sh = clamp((land + 0.12) / 0.2, 0, 1);
          col = mixc([16, 62, 132], [48, 140, 186], sh * sh);
        }
        if (alat > 74 + 4 * N2(X * 3, Z * 3)) col = [238, 244, 250];
        const cl = clamp((fbm(X * 2.2 + 11, Y * 4.5 + Z * 1.5) - 0.12) * 2.6, 0, 1) * 0.8;
        col = mixc(col, [250, 252, 255], cl);
        const lam = nx * lx + y * ly + z * lz, day = clamp((lam + 0.15) / 0.55, 0, 1), sh = 0.12 + 0.9 * day * day * (3 - 2 * day);
        const f = Math.pow(1 - z, 2.5) * 0.7 * (0.3 + day);
        d.data[o] = clamp(col[0] * sh + 110 * f, 0, 255); d.data[o + 1] = clamp(col[1] * sh + 180 * f, 0, 255); d.data[o + 2] = clamp(col[2] * sh + 255 * f, 0, 255); d.data[o + 3] = al * 255;
      }
      c.putImageData(d, 0, 0);
    });
  }
  /* interiorul: mantaua (rocă fierbinte cu pene de căldură) + nucleul extern (metal topit) — la jumătate de rezoluție */
  function innerTex(R, which) {
    const S = Math.max(64, Math.ceil(R));
    return A.cached('ly-' + which, S, S, (c, w) => {
      const d = c.createImageData(w, w), h = w / 2;
      for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) {
        const x = (i + 0.5 - h) / h, y = (j + 0.5 - h) / h, rr = Math.hypot(x, y), o = (j * w + i) * 4;
        if (rr > 1.01) continue;
        let col;
        if (which === 'mantle') {
          const f = clamp((1 - rr) / 0.455, 0, 1), n = fbm(x * 4.2, y * 4.2), n2 = N2(x * 11 + 3, y * 11);
          const a = Math.atan2(y, x), plume = Math.pow(Math.max(0, Math.sin(a * 7 + n * 2.6)), 6) * (0.4 + 0.6 * f);
          col = f < 0.5 ? mixc([118, 40, 22], [214, 84, 30], f / 0.5) : mixc([214, 84, 30], [255, 150, 54], (f - 0.5) / 0.5);
          const k = 0.82 + 0.3 * n + 0.08 * n2;
          col = [col[0] * k, col[1] * k, col[2] * k];
          col = mixc(col, [255, 196, 96], plume * 0.55);
          if (f < 0.06) col = mixc(col, [96, 40, 26], (0.06 - f) / 0.06 * 0.6);
        } else {
          const n = fbm(x * 3 + Math.sin(rr * 9) * 0.6, y * 3 + Math.cos(rr * 9) * 0.6), sw = Math.sin(Math.atan2(y, x) * 3 + rr * 14 + n * 3) * 0.5 + 0.5;
          col = mixc([238, 128, 24], [255, 206, 84], clamp(0.35 + n * 0.8 + sw * 0.25, 0, 1));
        }
        d.data[o] = clamp(col[0], 0, 255); d.data[o + 1] = clamp(col[1], 0, 255); d.data[o + 2] = clamp(col[2], 0, 255); d.data[o + 3] = 255;
      }
      c.putImageData(d, 0, 0);
    });
  }

  /* ============================================================
     4) STRATURILE PĂMÂNTULUI
     ============================================================ */
  defineModule({
    id: 'layers', title: 'Straturile Pământului', sub: 'Coboară până în centrul planetei',
    start: function (api) {
      const ctx = api.ctx;
      let depth = 0, drilling = false, quake = null, selLayer = -1, selGlow = 0, lastDepth = 0, bitSpin = 0;
      const LAY = [
        { n: 'Scoarța', a: 0, b: 35, c: '#8b6d4a', t: 'Stratul subțire pe care trăim: 5–70 km grosime. Pe scara unui măr, e cât coaja lui.' },
        { n: 'Mantaua', a: 35, b: 2900, c: '#d2531c', t: 'Rocă fierbinte, care curge foarte, foarte încet (cm pe an). Reprezintă ~84% din volumul Pământului. Curenții ei mișcă plăcile tectonice.' },
        { n: 'Nucleul extern', a: 2900, b: 5150, c: '#f5a623', t: 'Fier și nichel topite, lichide! Mișcarea lor creează câmpul magnetic al Pământului, care ne apără de vântul solar.' },
        { n: 'Nucleul intern', a: 5150, b: 6371, c: '#fff1b5', t: 'O bilă solidă de fier, cât 70% din Lună. E atât de fierbinte ca suprafața Soarelui (~5.400°C), dar presiunea uriașă o ține solidă.' }
      ];
      const TAB = [[0, 15, 0], [35, 600, 1], [100, 1300, 3.5], [410, 1600, 14], [2900, 3700, 135], [5150, 5000, 329], [6371, 5400, 364]];
      const lookup = (d, k) => { for (let i = 1; i < TAB.length; i++) if (d <= TAB[i][0]) return lerp(TAB[i - 1][k], TAB[i][k], (d - TAB[i - 1][0]) / (TAB[i][0] - TAB[i - 1][0])); return TAB[TAB.length - 1][k]; };
      const layerOf = (d) => LAY.findIndex((l) => d >= l.a && d < l.b) < 0 ? 3 : LAY.findIndex((l) => d >= l.a && d < l.b);
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Adâncimea', min: 0, max: 1, step: 0.001, value: 0, fmt: () => fmtN(depth) + ' km', onInput: (v) => { depth = Math.pow(v, 2.2) * 6371; drilling = false; } });
      api.button(r1, '⛏️ Sapă singur', () => { drilling = true; if (depth >= 6370) { depth = 0; } });
      api.button(r1, '💥 Cutremur', () => { quake = { t: 0 }; if (navigator.vibrate) navigator.vibrate([180, 60, 220, 60, 300, 80, 160]); api.say('<b>Unde seismice.</b> Undele P (verzi) trec prin tot Pământul. Undele S (roșii) NU trec prin nucleul extern — așa au aflat oamenii de știință că e lichid!', 10000); });
      const info = api.row('');
      const readout = document.createElement('div'); readout.className = 'mod-readout'; info.appendChild(readout);
      api.say('Trage de glisor ca să sapi spre centrul Pământului. Atinge un strat ca să afli despre el. Cea mai adâncă gaură făcută de oameni (Kola, Rusia) are doar 12 km!', 9000);
      api.pointer({ down: (x, y) => { const dx = x - api.cx, dy = y - api.cy, r = Math.hypot(dx, dy) / (api.unit * 0.86) * 6371; if (r < 6371) { const li = layerOf(6371 - r); selLayer = li; selGlow = 1; api.say('<b>' + LAY[li].n + '</b> (' + fmtN(LAY[li].a) + '–' + fmtN(LAY[li].b) + ' km). ' + LAY[li].t, 12000); } } });
      let lastL = -1;

      function frame(dt, t) {
        if (drilling) { depth = Math.min(6371, depth + dt * 330 + depth * dt * 0.12); sl.set(Math.pow(depth / 6371, 1 / 2.2)); if (depth >= 6371) drilling = false; }
        if (quake) { quake.t += dt; if (quake.t > 9) quake = null; }
        const cx = api.cx, cy = api.cy, R = api.unit * 0.86, U = api.unit, W = api.W, H = api.H;
        const px = (km) => km / 6371 * R;
        const rOC = px(6371 - 2900), rIC = px(6371 - 5150);
        selGlow = Math.max(0, selGlow - dt * 0.15);

        /* fundal */
        ctx.drawImage(A.cached('ly-bg', W, H, (c, w, h) => { A.backdrop(c, w, h, { top: '#0a0f22', bottom: '#04060e', vignette: false }); A.stars(c, w, h, 0, { alpha: 0.35, n: Math.round(Math.min(100, w * h / 10000)) }); }), 0, 0, W, H);

        /* cutremur: tot desenul tremură, tot mai slab pe măsură ce undele se sting */
        ctx.save();
        if (quake) { const amp = 14 * Math.max(0, 1 - quake.t / 7) * (quake.t < 0.4 ? quake.t / 0.4 : 1); ctx.translate((Math.random() - 0.5) * amp * 2, (Math.random() - 0.5) * amp * 2); }

        /* câmpul magnetic: linii de dipol, cu „curgere” lentă */
        ctx.save(); ctx.lineCap = 'round';
        for (const L of [1.45, 1.8, 2.25]) for (const side of [-1, 1]) {
          ctx.beginPath();
          for (let i = 0; i <= 60; i++) { const th = 0.12 + (Math.PI - 0.24) * i / 60, r = R * L * Math.pow(Math.sin(th), 2); const x = cx + side * r * Math.sin(th), y = cy - r * Math.cos(th); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.strokeStyle = A.rgba('#9fd0ff', 0.28); ctx.lineWidth = 1.5; ctx.stroke();
        }
        ctx.restore();


        /* felia scoasă: exteriorul globului (fără felie) */
        const wa0 = -Math.PI / 2 - 0.12, wa1 = 0.12;
        const gt = globeTex(R);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * 1.3, wa1, wa0 + Math.PI * 2); ctx.closePath(); ctx.clip();
        ctx.drawImage(gt, Math.round(cx - gt.width / 2), Math.round(cy - gt.height / 2));
        ctx.restore();

        /* felia (interior) */
        ctx.save();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, wa0, wa1); ctx.closePath(); ctx.clip();
        /* mantaua curge încet */
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.02); ctx.drawImage(innerTex(R, 'mantle'), -R, -R, R * 2, R * 2); ctx.restore();
        /* curenți de convecție în manta */
        ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = Math.max(2, R * 0.012);
        for (const [ac, dir] of [[-Math.PI / 2 + 0.3, 1], [-Math.PI / 4, -1], [-0.3, 1]]) {
          const r0 = rOC + (R - rOC) * 0.2, r1c = R - (R - rOC) * 0.16, da = 0.24;
          ctx.beginPath(); ctx.arc(cx, cy, r1c, ac - da, ac + da); ctx.arc(cx, cy, r0, ac + da, ac - da, true); ctx.closePath();
                    ctx.setLineDash([R * 0.025, R * 0.045]); ctx.lineDashOffset = t * R * 0.03 * dir; ctx.strokeStyle = A.rgba('#ffe2b0', 0.4); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.restore();
        /* nucleul extern: metal lichid care se rotește */
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rOC, 0, TAU); ctx.clip();
        ctx.translate(cx, cy); ctx.rotate(-t * 0.08); ctx.drawImage(innerTex(R, 'core'), -rOC, -rOC, rOC * 2, rOC * 2); ctx.restore();
        const cg = ctx.createRadialGradient(cx, cy, rOC * 0.85, cx, cy, rOC); cg.addColorStop(0, 'rgba(255,240,180,0)'); cg.addColorStop(1, 'rgba(120,30,10,0.55)'); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, rOC, 0, TAU); ctx.fill();
        /* nucleul intern: incandescent, cu halou care pulsează */
        const ig = ctx.createRadialGradient(cx - rIC * 0.3, cy - rIC * 0.35, rIC * 0.05, cx, cy, rIC);
        ig.addColorStop(0, '#ffffff'); ig.addColorStop(0.5, '#fff3c0'); ig.addColorStop(1, '#ffc850');
        ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(cx, cy, rIC, 0, TAU); ctx.fill();
        /* granițele dintre straturi */
        ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(60,10,0,0.45)';
        for (const r of [rOC, rIC]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); }
        /* scoarța: bandă de rocă stratificată (exagerată puțin ca să se vadă) */
        const cw = Math.max(4, px(35) * 1.6);
        ctx.lineWidth = cw; ctx.strokeStyle = '#7a5a3c'; ctx.beginPath(); ctx.arc(cx, cy, R - cw / 2, 0, TAU); ctx.stroke();
        ctx.lineWidth = Math.max(1, cw * 0.25); ctx.strokeStyle = '#a8865c'; ctx.beginPath(); ctx.arc(cx, cy, R - cw * 0.3, 0, TAU); ctx.stroke();
        ctx.strokeStyle = '#4caf50'; ctx.lineWidth = Math.max(1.2, cw * 0.18); ctx.beginPath(); ctx.arc(cx, cy, R - 0.5, 0, TAU); ctx.stroke();
        /* stratul selectat */
        if (selLayer >= 0 && selGlow > 0) {
          const ro = R - px(LAY[selLayer].a), ri = R - px(LAY[selLayer].b);
          ctx.save(); ctx.fillStyle = A.rgba('#ffe7a0', 0.22 * Math.min(1, selGlow * 2)); ctx.beginPath(); ctx.arc(cx, cy, Math.max(ro, ri + 3), 0, TAU); ctx.arc(cx, cy, Math.max(0, ri), 0, TAU, true); ctx.fill(); ctx.restore();
        }
        /* umbră pe pereții tăieturii, pentru adâncime */
        for (const [a, col] of [[wa0, 'rgba(255,255,255,0.12)'], [wa1, 'rgba(0,0,0,0.35)']]) {
          const nx = Math.cos(a + (a === wa0 ? 1 : -1) * Math.PI / 2), ny = Math.sin(a + (a === wa0 ? 1 : -1) * Math.PI / 2);
          const g = ctx.createLinearGradient(cx, cy, cx + nx * R * 0.12, cy + ny * R * 0.12); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        }
        ctx.restore();
        ctx.strokeStyle = 'rgba(30,10,5,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(wa0) * R, cy + Math.sin(wa0) * R); ctx.lineTo(cx, cy); ctx.lineTo(cx + Math.cos(wa1) * R, cy + Math.sin(wa1) * R); ctx.stroke();

        /* atmosfera, în afara tăieturii */
        ctx.save(); ctx.lineCap = 'round';
        ctx.strokeStyle = A.rgba('#6fb8ff', 0.18); ctx.lineWidth = R * 0.04; ctx.beginPath(); ctx.arc(cx, cy, R * 1.03, wa1 + 0.04, wa0 + Math.PI * 2 - 0.04); ctx.stroke();
        ctx.strokeStyle = A.rgba('#bfe3ff', 0.35); ctx.lineWidth = Math.max(1.5, R * 0.008); ctx.beginPath(); ctx.arc(cx, cy, R * 1.002, wa1 + 0.02, wa0 + Math.PI * 2 - 0.02); ctx.stroke();
        ctx.restore();

        /* burghiul: turlă la suprafață + tijă metalică + vârf care se rotește */
        const top = cy - R, by = top + px(depth), sw = Math.max(4, U * 0.022), th = U * 0.16;
        if (depth > 0.5) { ctx.strokeStyle = 'rgba(20,8,4,0.7)'; ctx.lineWidth = sw * 1.6; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, by); ctx.stroke(); }
        ctx.save(); ctx.lineCap = 'round';
        const lg = ctx.createLinearGradient(cx - th * 0.4, 0, cx + th * 0.4, 0); lg.addColorStop(0, '#e8eef7'); lg.addColorStop(1, '#6a7688');
        ctx.strokeStyle = lg; ctx.lineWidth = Math.max(2, sw * 0.45);
        ctx.beginPath(); ctx.moveTo(cx - th * 0.38, top + 1); ctx.lineTo(cx, top - th); ctx.lineTo(cx + th * 0.38, top + 1); ctx.stroke();
        ctx.lineWidth = Math.max(1, sw * 0.25);
        for (let k = 1; k <= 3; k++) { const yy = top - th * k / 4, hw = th * 0.38 * (1 - k / 4); ctx.beginPath(); ctx.moveTo(cx - hw, yy); ctx.lineTo(cx + hw, yy); ctx.stroke(); }
        ctx.restore();
        A.cylinder(ctx, cx - sw / 2, top - th * 0.9, sw, Math.max(1, by - (top - th * 0.9) - sw * 1.2), '#b8c4d4', true);
        const moving = Math.abs(depth - lastDepth) > 0.01; lastDepth = depth;
        if (moving) bitSpin += dt * 18;
        ctx.save(); ctx.translate(cx, by);
        ctx.beginPath(); ctx.moveTo(-sw * 1.05, -sw * 1.4); ctx.lineTo(sw * 1.05, -sw * 1.4); ctx.lineTo(0, sw * 1.2); ctx.closePath();
        A.volumeFill(ctx, -sw, -sw, sw, sw, '#ffc94a');
        ctx.strokeStyle = 'rgba(120,70,0,0.8)'; ctx.lineWidth = 1.2;
        for (let k = 0; k < 3; k++) { const ph = ((bitSpin + k / 3) % 1); const yy = -sw * 1.4 + ph * sw * 2.4, hw = sw * 1.05 * (1 - ph); ctx.beginPath(); ctx.moveTo(-hw, yy); ctx.lineTo(hw, yy + sw * 0.25); ctx.stroke(); }
        ctx.restore();
        const li = layerOf(depth);
        if (depth > 0 && depth < 13) A.label(ctx, 'Kola: 12 km', cx + sw * 2.5 + 8, top + px(12) + A.fs(U, 0.045, 13), { size: A.fs(U, 0.04, 13), align: 'left', tx: cx + sw * 0.6, ty: top + px(12) });

        /* unde seismice: fronturi de undă (cercuri) + raze; S se opresc la nucleul extern */
        if (quake) {
          const ex = cx, ey = cy - R, pr = quake.t * 0.6 * R, sr = quake.t * 0.34 * R;
          ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
          ctx.lineWidth = Math.max(2, R * 0.012);
          if (pr < 2.2 * R) { ctx.strokeStyle = A.rgba('#50ff96', 0.55 * (1 - pr / (2.2 * R))); ctx.beginPath(); ctx.arc(ex, ey, pr, 0, TAU); ctx.stroke(); }
          ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.arc(cx, cy, rOC, 0, TAU, true); ctx.clip('evenodd');
          if (sr < 2.2 * R) { ctx.strokeStyle = A.rgba('#ff5a5a', 0.55 * (1 - sr / (2.2 * R))); ctx.beginPath(); ctx.arc(ex, ey, sr, 0, TAU); ctx.stroke(); }
          ctx.restore();
          ctx.restore();
          ctx.save(); ctx.lineCap = 'round';
          for (let i = -4; i <= 4; i++) {
            const ang = Math.PI / 2 + i * 0.3, ca = Math.cos(ang), sa = Math.sin(ang), chord = 2 * R * sa;
            const disc = R * R * sa * sa - (R * R - rOC * rOC), sStop = disc >= 0 ? R * sa - Math.sqrt(disc) : chord;
            const lp = Math.min(pr, chord), ls = Math.min(sr, sStop * 0.99);
            const ray = (len, col) => { const x1 = ex + ca * len, y1 = ey + sa * len; const g = ctx.createLinearGradient(ex, ey, x1, y1); g.addColorStop(0, A.rgba(col, 0.05)); g.addColorStop(1, A.rgba(col, 0.9)); ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(x1, y1); ctx.stroke(); return [x1, y1]; };
            const hp = ray(lp, '#50ff96'); if (lp < chord) { ctx.fillStyle = '#50ff96'; ctx.beginPath(); ctx.arc(hp[0], hp[1], 3.5, 0, TAU); ctx.fill(); }
            const hs = ray(ls, '#ff5a5a'); if (ls < sStop * 0.99 || disc >= 0) { ctx.fillStyle = 'rgba(255,90,90,0.9)'; ctx.beginPath(); ctx.arc(hs[0], hs[1], 3.5, 0, TAU); ctx.fill(); }
          }
          ctx.restore();
          /* valuri la suprafață, în jurul epicentrului */
          for (let k = 0; k < 3; k++) { const ph = (quake.t * 0.8 - k * 0.35); if (ph > 0 && ph < 1.4) { ctx.strokeStyle = 'rgba(255,220,120,' + (0.7 * (1 - ph / 1.4)).toFixed(2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ex, ey, 10 + ph * R * 0.35, Math.PI, TAU); ctx.stroke(); } }
          if (quake.t < 4) { const k = clamp(Math.min(quake.t * 2, (4 - quake.t)), 0, 1); ctx.globalAlpha = k; A.label(ctx, 'unde P', cx - R * 0.55, cy + R * 0.2, { size: A.fs(U, 0.04, 13), color: '#7dffb0' }); A.label(ctx, 'unde S', cx - R * 0.55, cy + R * 0.2 + A.fs(U, 0.04, 13) * 2, { size: A.fs(U, 0.04, 13), color: '#ff8a8a' }); ctx.globalAlpha = 1; }
        }

        /* panou */
        if (li !== lastL) { lastL = li; if (!quake) api.say('<b>' + LAY[li].n + '.</b> ' + LAY[li].t, 9000); }
        const T = lookup(depth, 1), P = lookup(depth, 2);
        readout.innerHTML = '<b>' + LAY[li].n + '</b> · adâncime <b>' + fmtN(depth) + ' km</b> · temperatură ~<b>' + fmtN(T) + '°C</b> · presiune ~<b>' + (P < 0.01 ? '1' : fmtN(P * 9869)) + '</b> atmosfere' + (depth > 12 ? ' · oamenii au săpat doar 12 km' : '');

        /* etichete curate, cu linie spre strat */
        const fsz = A.fs(U, 0.042, 13);
        ctx.font = A.font(fsz, 700);
        LAY.forEach((l, i) => {
          const mid = i === 0 ? 0 : (l.a + l.b) / 2, rm = R - px(mid) - (i === 0 ? cw * 0.5 : 0), pa = -Math.PI / 4 + (i - 1.5) * 0.12;
          const pxx = cx + Math.cos(pa) * rm, pyy = cy + Math.sin(pa) * rm;
          const tw = ctx.measureText(l.n).width + fsz * 1.1;
          const lx = Math.min(cx + R * 1.08, api.freeW - tw - 8), ly = cy - R * 0.92 + i * fsz * 2.6;
          const on = i === li || i === selLayer;
          A.label(ctx, l.n, lx, ly, { size: fsz, align: 'left', tx: pxx, ty: pyy, bg: on ? A.rgba(A.shade(l.c, -0.35), 0.92) : 'rgba(10,15,35,0.82)', border: on ? A.rgba(l.c, 0.9) : undefined, lineColor: 'rgba(255,255,255,0.75)' });
        });
        ctx.restore();
      }
      return { frame: frame };
    }
  });
})();
