/* Modul: Digestia — ilustrație anatomică (stil atlas pentru copii) */
(function () {
  const A = window.Art, C = A.C, TAU = A.TAU;
  const clamp = A.clamp, lerp = A.lerp;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function polyAt(poly, u) {                       // poly: {pts, cum, len, closed}
    const d = clamp(u, 0, 1) * poly.len; let i = 1;
    while (i < poly.cum.length - 1 && poly.cum[i] < d) i++;
    const k = (d - poly.cum[i - 1]) / ((poly.cum[i] - poly.cum[i - 1]) || 1);
    return { x: lerp(poly.pts[i - 1][0], poly.pts[i][0], k), y: lerp(poly.pts[i - 1][1], poly.pts[i][1], k), i: i - 1 };
  }
  function mkPoly(pts, closed) {
    const P = pts.slice(); if (closed) P.push(pts[0]);
    const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    return { pts: P, cum: cum, len: cum[cum.length - 1] };
  }
  /* mărul desenat (nu emoji): corp roșu cu volum, codiță, frunză */
  function apple(ctx, x, y, r, bite) {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.62);
    ctx.bezierCurveTo(r * 0.35, -r * 1.05, r * 1.08, -r * 0.8, r * 1.0, -r * 0.05);
    ctx.bezierCurveTo(r * 0.95, r * 0.65, r * 0.45, r * 1.02, r * 0.12, r * 0.9);
    ctx.quadraticCurveTo(0, r * 0.84, -r * 0.12, r * 0.9);
    ctx.bezierCurveTo(-r * 0.45, r * 1.02, -r * 0.95, r * 0.65, -r * 1.0, -r * 0.05);
    ctx.bezierCurveTo(-r * 1.08, -r * 0.8, -r * 0.35, -r * 1.05, 0, -r * 0.62); ctx.closePath();
    const g = ctx.createRadialGradient(-r * 0.4, -r * 0.35, r * 0.05, 0, 0, r * 1.1);
    g.addColorStop(0, '#ff8f7a'); g.addColorStop(0.45, '#d92f2f'); g.addColorStop(1, '#7e1418');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#5e0e12'; ctx.lineWidth = Math.max(1, r * 0.06); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-r * 0.45, -r * 0.35, r * 0.18, r * 0.1, -0.7, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#5a3a1e'; ctx.lineWidth = Math.max(1.5, r * 0.1); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -r * 0.6); ctx.quadraticCurveTo(r * 0.05, -r * 0.95, r * 0.2, -r * 1.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.12, -r * 0.92); ctx.quadraticCurveTo(r * 0.55, -r * 1.35, r * 0.85, -r * 1.0); ctx.quadraticCurveTo(r * 0.45, -r * 0.8, r * 0.12, -r * 0.92); ctx.fillStyle = '#4e9a3a'; ctx.fill();
    ctx.restore();
  }

  defineModule({
    id: 'digestion', title: 'Digestia', sub: 'Drumul unei mese prin corp',
    start: function (api) {
      const ctx = api.ctx;
      let u = 0, playing = false;
      const PTS = [[0, -0.88], [0, -0.5], [0.1, -0.4], [0.18, -0.3], [0.08, -0.24], [-0.18, -0.15], [0.18, -0.12], [0.18, -0.04], [-0.18, -0.01], [-0.18, 0.07], [0.18, 0.1], [0.18, 0.18], [-0.18, 0.21], [-0.18, 0.28], [-0.3, 0.3], [-0.3, -0.2], [0.3, -0.2], [0.3, 0.3], [0.0, 0.5], [0.0, 0.64]];
      const poly = mkPoly(PTS, false);
      const ST = [
        { n: 'Gura', a: 0, b: 0.05, h: 'câteva secunde', t: 'Dinții taie și macină mâncarea, iar saliva începe să descompună amidonul. Mestecă bine!' },
        { n: 'Esofagul', a: 0.05, b: 0.13, h: '~10 secunde', t: 'Un tub muscular de ~25 cm. Mușchii lui împing mâncarea în jos prin mișcări de val (peristaltism) — ai putea mânca și cu capul în jos!' },
        { n: 'Stomacul', a: 0.13, b: 0.27, h: '2–4 ore', t: 'Un sac muscular care amestecă mâncarea cu acid puternic. Acidul omoară microbii; un strat de mucus îl apără de propriul acid.' },
        { n: 'Intestinul subțire', a: 0.27, b: 0.6, h: '3–5 ore', t: 'Are ~6 metri! Aici trec nutrienții din mâncare în sânge, prin milioane de „degețele” mici (vilozități).' },
        { n: 'Intestinul gros', a: 0.6, b: 0.97, h: '10–60 de ore', t: 'Are ~1,5 metri. Absoarbe apa și sărurile, iar bacteriile bune de aici ne ajută. Ce rămâne iese din corp.' },
        { n: 'Afară', a: 0.97, b: 1.0, h: '—', t: 'Drumul complet durează 1–3 zile!' }
      ];
      const stOf = (x) => ST.findIndex((s) => x >= s.a && x < s.b) < 0 ? ST.length - 1 : ST.findIndex((s) => x >= s.a && x < s.b);
      let lastSt = -1;
      const FR = []; for (let i = 0; i < 18; i++) FR.push({ a: i * 2.399, r: 0.25 + 0.75 * ((i * 0.618) % 1), k: (i * 0.37) % 1, sp: 0.5 + ((i * 0.29) % 1) });
      const r1 = api.row('');
      const bE = api.button(r1, '🍎 Mănâncă', () => { u = 0; playing = true; bE.innerHTML = '🍎 Mănâncă din nou'; lastSt = -1; });
      const sl = api.slider(r1, { label: 'Timpul după masă', min: 0, max: 1, step: 0.001, value: 0, fmt: () => timeText(), onInput: (v) => { u = v; playing = false; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      function timeText() {
        const i = stOf(u), s = ST[i]; if (i === 0) return fmt(u / 0.05 * 20, 0) + ' secunde'; if (i === 1) return fmt(20 + (u - 0.05) / 0.08 * 10, 0) + ' secunde';
        const hrs = i === 2 ? lerp(0, 3, (u - 0.13) / 0.14) : i === 3 ? 3 + lerp(0, 4, (u - 0.27) / 0.33) : 7 + lerp(0, 24, (u - 0.6) / 0.37);
        return hrs < 1 ? fmt(hrs * 60, 0) + ' minute' : fmt(hrs, 1) + ' ore';
      }
      api.say('Apasă <b>Mănâncă</b> și urmărește un măr pe tot drumul prin corp, sau trage de glisor. Atinge un organ ca să afli ce face.', 12000);
      api.pointer({ down: (x, y) => { const U = api.unit, mx = (x - api.cx) / U, my = (y - api.cy) / U; let best = 0, bd = 1e9; for (let i = 0; i < poly.pts.length; i++) for (let k = 0; k < 8; k++) { const q = polyAt(poly, (poly.cum[i] + (poly.cum[Math.min(i + 1, poly.cum.length - 1)] - poly.cum[i]) * k / 8) / poly.len); const d = Math.hypot(q.x - mx, q.y - my); if (d < bd) { bd = d; best = (poly.cum[i]) / poly.len; } } if (bd < 0.16) { const s = ST[stOf(best)]; api.say('<b>' + s.n + '</b> · ' + s.h + '. ' + s.t, 12000); } } });

      /* drumuri netede pentru desen (aceleași puncte ca traseul mâncării) */
      const SMALL = A.pathSampler(PTS.slice(4, 15), false, 14);
      const LARGE = A.pathSampler(PTS.slice(14), false, 14);
      /* tub muscular cu grosime variabilă (unde de peristaltism care se propagă) */
      function gut(X, Y, U, smp, w, col, t, o) {
        const n = Math.max(40, Math.round(smp.len * 90)), P = [];
        for (let i = 0; i <= n; i++) {
          const k = i / n, p = smp.at(k);
          const wave = Math.sin(k * smp.len * (o.freq || 40) - t * (o.speed || 3));
          const haus = o.haustra ? 0.14 * Math.abs(Math.sin(k * smp.len * 55)) : 0;
          P.push([X(p.x), Y(p.y), w * U * (1 + (o.amp || 0.12) * wave + haus)]);
        }
        ctx.save(); ctx.lineCap = 'round';
        for (const pass of [0, 1, 2]) {
          for (let i = 0; i < n; i++) {
            const a = P[i], b = P[i + 1], ww = (a[2] + b[2]) / 2;
            ctx.beginPath();
            if (pass === 2) { ctx.moveTo(a[0] - ww * 0.18, a[1] - ww * 0.18); ctx.lineTo(b[0] - ww * 0.18, b[1] - ww * 0.18); ctx.strokeStyle = 'rgba(255,240,230,0.28)'; ctx.lineWidth = ww * 0.22; }
            else { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.strokeStyle = pass === 0 ? A.shade(col, -0.45) : col; ctx.lineWidth = pass === 0 ? ww + Math.max(2, ww * 0.16) : ww; }
            ctx.stroke();
          }
          /* inelele haustrelor (intestinul gros) */
          if (pass === 1 && o.haustra) { ctx.strokeStyle = A.rgba(A.shade(col, -0.35), 0.6); ctx.lineWidth = 1.5; for (let i = 3; i < n; i += 4) { const a = P[i], b = P[Math.min(n, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, r = a[2] * 0.48; ctx.beginPath(); ctx.moveTo(a[0] + Math.cos(ang) * r, a[1] + Math.sin(ang) * r); ctx.lineTo(a[0] - Math.cos(ang) * r, a[1] - Math.sin(ang) * r); ctx.stroke(); } }
        }
        ctx.restore();
      }
      /* silueta unui copil (proporții de copil: cap mare, umeri înguști) */
      function child(X, Y, U) {
        ctx.save();
        const skin = C.skin, skinDk = A.shade(skin, -0.25);
        /* brațe */
        for (const sg of [-1, 1]) {
          ctx.beginPath(); A.smoothPath(ctx, [[X(sg * 0.34), Y(-0.62)], [X(sg * 0.45), Y(-0.3)], [X(sg * 0.49), Y(0.05)], [X(sg * 0.5), Y(0.3)]], false);
          ctx.lineCap = 'round'; ctx.strokeStyle = skinDk; ctx.lineWidth = U * 0.13; ctx.stroke(); ctx.strokeStyle = skin; ctx.lineWidth = U * 0.11; ctx.stroke();
          /* mâna */
          ctx.beginPath(); ctx.ellipse(X(sg * 0.505), Y(0.4), U * 0.055, U * 0.085, sg * -0.08, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.strokeStyle = skinDk; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(X(sg * 0.47), Y(0.38)); ctx.quadraticCurveTo(X(sg * 0.455), Y(0.43), X(sg * 0.47), Y(0.46)); ctx.stroke();
        }
        /* trunchi */
        const T = [[0.08, -0.78], [0.2, -0.72], [0.36, -0.66], [0.4, -0.52], [0.36, -0.2], [0.34, 0.2], [0.38, 0.55], [0.34, 0.78], [0.2, 1.02], [-0.2, 1.02], [-0.34, 0.78], [-0.38, 0.55], [-0.34, 0.2], [-0.36, -0.2], [-0.4, -0.52], [-0.36, -0.66], [-0.2, -0.72], [-0.08, -0.78]];
        ctx.beginPath(); A.smoothPath(ctx, T.map((p) => [X(p[0]), Y(p[1])]), true, 0.4);
        A.volumeFill(ctx, X(-0.4), 0, X(0.4), 0, skin, { hi: 0.12, lo: 0.28 }); ctx.strokeStyle = skinDk; ctx.lineWidth = 2; ctx.stroke();
        /* pantaloni scurți neutri (figură potrivită pentru copii) */
        ctx.save(); ctx.beginPath(); A.smoothPath(ctx, T.map((p) => [X(p[0]), Y(p[1])]), true, 0.4); ctx.clip();
        ctx.beginPath(); ctx.moveTo(X(-0.5), Y(0.8)); ctx.quadraticCurveTo(X(0), Y(0.77), X(0.5), Y(0.8)); ctx.lineTo(X(0.5), Y(1.1)); ctx.lineTo(X(-0.5), Y(1.1)); ctx.closePath();
        A.volumeFill(ctx, X(-0.4), 0, X(0.4), 0, '#3d6fa8', { hi: 0.12, lo: 0.3 });
        ctx.strokeStyle = '#2a4f7c'; ctx.lineWidth = Math.max(2, U * 0.012); ctx.beginPath(); ctx.moveTo(X(-0.5), Y(0.815)); ctx.quadraticCurveTo(X(0), Y(0.785), X(0.5), Y(0.815)); ctx.stroke();
        ctx.restore();
        /* cavitatea abdominală, deschisă ca într-un atlas */
        const CV = [[0, -0.66], [0.27, -0.6], [0.33, -0.3], [0.33, 0.2], [0.3, 0.55], [0.15, 0.72], [-0.15, 0.72], [-0.3, 0.55], [-0.33, 0.2], [-0.33, -0.3], [-0.27, -0.6]];
        ctx.beginPath(); A.smoothPath(ctx, CV.map((p) => [X(p[0]), Y(p[1])]), true);
        const cg = ctx.createRadialGradient(X(0), Y(0), U * 0.05, X(0), Y(0), U * 0.75); cg.addColorStop(0, '#6e2f3a'); cg.addColorStop(1, '#3e1822');
        ctx.fillStyle = cg; ctx.fill(); ctx.strokeStyle = 'rgba(120,50,50,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
        /* gâtul și capul */
        ctx.fillStyle = skin; ctx.fillRect(X(-0.065), Y(-0.84), U * 0.13, U * 0.1); ctx.fillStyle = A.rgba(skinDk, 0.5); ctx.fillRect(X(-0.065), Y(-0.8), U * 0.13, U * 0.02);
        const hx = X(0), hy = Y(-0.97), hr = U * 0.175;
        ctx.beginPath(); ctx.ellipse(hx, hy, hr * 0.92, hr, 0, 0, TAU); A.volumeFill(ctx, hx - hr, hy - hr, hx + hr, hy + hr, skin, { hi: 0.15, lo: 0.25 }); ctx.strokeStyle = skinDk; ctx.lineWidth = 2; ctx.stroke();
        /* păr */
        ctx.beginPath(); ctx.moveTo(hx - hr * 0.95, hy - hr * 0.05); ctx.bezierCurveTo(hx - hr * 1.0, hy - hr * 1.15, hx + hr * 1.0, hy - hr * 1.2, hx + hr * 0.95, hy - hr * 0.05); ctx.bezierCurveTo(hx + hr * 0.6, hy - hr * 0.55, hx - hr * 0.2, hy - hr * 0.7, hx - hr * 0.95, hy - hr * 0.05); ctx.fillStyle = '#5a3824'; ctx.fill();
        /* urechi, ochi, nas */
        ctx.fillStyle = skin; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.ellipse(hx + sg * hr * 0.92, hy + hr * 0.05, hr * 0.13, hr * 0.2, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = skinDk; ctx.lineWidth = 1.5; ctx.stroke(); }
        for (const sg of [-1, 1]) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(hx + sg * hr * 0.36, hy - hr * 0.02, hr * 0.14, hr * 0.09, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#4a3020'; ctx.beginPath(); ctx.arc(hx + sg * hr * 0.36, hy - hr * 0.02, hr * 0.07, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5a3824'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hx + sg * hr * 0.22, hy - hr * 0.22); ctx.quadraticCurveTo(hx + sg * hr * 0.36, hy - hr * 0.3, hx + sg * hr * 0.5, hy - hr * 0.22); ctx.stroke(); }
        ctx.strokeStyle = skinDk; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hx, hy + hr * 0.05); ctx.quadraticCurveTo(hx - hr * 0.08, hy + hr * 0.25, hx + hr * 0.04, hy + hr * 0.28); ctx.stroke();
        ctx.restore();
        return { hx: hx, hy: hy, hr: hr };
      }

      function frame(dt, t) {
        if (playing) { u = Math.min(1, u + dt * 0.045); sl.set(u); if (u >= 1) playing = false; }
        const U = api.unit, cx = api.cx, cy = api.cy, X = (x) => cx + x * U, Y = (y) => cy + y * U;
        A.backdrop(ctx, api.W, api.H, { top: '#1d1a2c', bottom: '#0f0d18', vignette: false });
        const p = polyAt(poly, u), si = stOf(u);
        const head = child(X, Y, U);
        /* gura: se mișcă atunci când mestecă */
        const chew = si === 0 && u > 0.002 ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
        ctx.save(); ctx.beginPath(); ctx.ellipse(X(0), Y(-0.88), U * 0.055, U * (0.012 + 0.025 * chew), 0, 0, TAU); ctx.fillStyle = '#7a2a30'; ctx.fill(); ctx.strokeStyle = '#a0464a'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        /* ficatul (în spatele stomacului) și vezica biliară */
        ctx.save();
        ctx.beginPath(); A.smoothPath(ctx, [[X(-0.31), Y(-0.52)], [X(-0.05), Y(-0.6)], [X(0.14), Y(-0.55)], [X(0.04), Y(-0.44)], [X(-0.14), Y(-0.33)], [X(-0.3), Y(-0.3)]], true);
        A.volumeFill(ctx, X(-0.3), Y(-0.6), X(0.1), Y(-0.3), '#8e3b34', { hi: 0.2, lo: 0.35 }); ctx.strokeStyle = '#5a201c'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(X(-0.1), Y(-0.33), U * 0.035, U * 0.022, 0.4, 0, TAU); ctx.fillStyle = '#5f8a3a'; ctx.fill();
        ctx.restore();

        /* intestinul gros (cadru) și intestinul subțire (ghem), cu peristaltism */
        gut(X, Y, U, LARGE, 0.085, '#c99a7a', t, { haustra: true, amp: 0.05, freq: 18, speed: 1.2 });
        gut(X, Y, U, SMALL, 0.05, '#e8a8a4', t, { amp: 0.14, freq: 45, speed: 3 });
        /* esofagul */
        const esoK = si === 1 ? 1 : 0;
        A.tube(ctx, [[X(0), Y(-0.86)], [X(0), Y(-0.68)], [X(0.0), Y(-0.52)], [X(0.07), Y(-0.43)]], U * (0.045 + 0.012 * esoK * Math.max(0, Math.sin(t * 6))), '#d98a8a', { gloss: 0.25 });
        /* stomacul: sac muscular în formă de J, cu pliuri (rugae) */
        const scx = X(0.12), scy = Y(-0.37);
        const churn = si === 2 ? Math.sin(t * 2.4) * 0.04 : 0;
        ctx.save(); ctx.translate(scx, scy); ctx.rotate(0.6); ctx.scale(1 + churn, 1 - churn);
        const sw = U * 0.2, sh = U * 0.13;
        const stomachPath = () => { ctx.beginPath(); ctx.moveTo(-sw * 0.55, -sh * 0.9); ctx.bezierCurveTo(-sw * 0.1, -sh * 1.3, sw * 0.9, -sh * 1.2, sw * 1.02, -sh * 0.1); ctx.bezierCurveTo(sw * 1.05, sh * 0.8, sw * 0.4, sh * 1.15, -sw * 0.25, sh * 0.95); ctx.bezierCurveTo(-sw * 0.8, sh * 0.8, -sw * 1.1, sh * 0.35, -sw * 1.0, -sh * 0.15); ctx.bezierCurveTo(-sw * 0.95, -sh * 0.5, -sw * 0.75, -sh * 0.55, -sw * 0.55, -sh * 0.9); ctx.closePath(); };
        stomachPath(); A.volumeFill(ctx, -sw, -sh, sw, sh, '#e3998c', { hi: 0.25, lo: 0.35 }); ctx.strokeStyle = '#8e4a44'; ctx.lineWidth = 2; ctx.stroke();
        ctx.save(); stomachPath(); ctx.clip(); ctx.strokeStyle = 'rgba(150,60,60,0.16)'; ctx.lineWidth = 1.2;
        for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-sw, i * sh * 0.25); ctx.bezierCurveTo(-sw * 0.3, i * sh * 0.25 - sh * 0.15, sw * 0.3, i * sh * 0.25 + sh * 0.15, sw, i * sh * 0.25); ctx.stroke(); }
        ctx.restore(); ctx.restore();

        /* mâncarea */
        const foodCol = si === 0 ? '#e83a3a' : si === 1 ? '#d9563a' : si === 2 ? '#d8b88a' : si === 3 ? '#e8d4a8' : '#9a6a3a';
        if (si === 3) for (let i = 0; i < 6; i++) { const q = polyAt(poly, clamp(u - i * 0.012, 0, 1)); A.sphere(ctx, X(q.x), Y(q.y), U * 0.025 * (1 - i * 0.1), foodCol, { rim: false, gloss: false }); }
        if (si === 0) apple(ctx, X(p.x), Y(p.y) + U * 0.07 * (1 - clamp(u / 0.03, 0, 1)), U * 0.05 * (1 - 0.35 * clamp(u / 0.05, 0, 1)));
        else if (si === 1) { A.sphere(ctx, X(p.x), Y(p.y), U * 0.038, '#d26a4a', { rim: false }); }
        else if (si !== 2) { A.sphere(ctx, X(p.x), Y(p.y), U * 0.035, foodCol, { rim: false }); }
        else {
          /* în stomac mărul se sparge în bucăți, se amestecă cu acid și devine pastă */
          const k = clamp((u - ST[2].a) / (ST[2].b - ST[2].a), 0, 1), ent = polyAt(poly, ST[2].a + 0.008);
          const cs = Math.cos(0.6), sn = Math.sin(0.6);
          ctx.save(); ctx.fillStyle = 'rgba(190,220,80,' + 0.28 * k + ')'; ctx.beginPath(); ctx.ellipse(scx, scy, U * 0.19, U * 0.12, 0.6, 0, TAU); ctx.fill(); ctx.restore();
          if (k < 0.12) { A.sphere(ctx, lerp(X(ent.x), scx, k / 0.12 * 0.5), lerp(Y(ent.y), scy, k / 0.12 * 0.5), U * 0.045, '#d24a3a', { rim: false }); }
          else {
            const m = clamp((k - 0.12) / 0.5, 0, 1);                          // 0 → bucăți mari, 1 → împrăștiate și mici
            for (let i = 0; i < FR.length; i++) {
              const f = FR[i], px0 = lerp(X(ent.x), scx, 0.5), py0 = lerp(Y(ent.y), scy, 0.5);
              const lx = Math.cos(f.a + t * 0.4 * f.sp) * f.r * U * 0.17, ly = Math.sin(f.a + t * 0.4 * f.sp) * f.r * U * 0.09;
              const tx = scx + lx * cs - ly * sn, ty = scy + lx * sn + ly * cs, e = 1 - Math.pow(1 - m, 2);
              const sz = U * (0.03 + 0.02 * f.k) * (1 - 0.62 * clamp((k - 0.2) / 0.8, 0, 1));
              const mush = clamp((k - 0.25) / 0.6, 0, 1);
              const col = 'rgb(' + Math.round(lerp(f.k > 0.5 ? 222 : 245, 214, mush)) + ',' + Math.round(lerp(f.k > 0.5 ? 60 : 226, 184, mush)) + ',' + Math.round(lerp(f.k > 0.5 ? 55 : 190, 138, mush)) + ')';
              const fx = lerp(px0, tx, e), fy = lerp(py0, ty, e);
              ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(fx, fy, sz, sz * 0.8, f.a, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(90,40,30,0.35)'; ctx.lineWidth = 1; ctx.stroke();
            }
            /* bule de acid (explică amestecul cu acidul gastric) */
            for (let i = 0; i < 7; i++) { const ph = ((t * 0.5 + i / 7) % 1), bx = scx + Math.sin(i * 5.1) * U * 0.12, by = scy + U * 0.06 - ph * U * 0.14; ctx.strokeStyle = 'rgba(200,235,100,' + 0.7 * (1 - ph) * clamp(k * 2, 0, 1) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, 2 + (i % 3), 0, TAU); ctx.stroke(); }
            if (k > 0.2) A.label(ctx, 'acid + mișcări → pastă (chim)', X(0.36), Y(-0.37), { size: A.fs(U, 0.036, 12), align: 'left', color: '#e2f5a0', bg: 'rgba(30,36,14,0.82)' });
          }
        }
        /* nutrienți care trec în sânge (intestinul subțire) */
        if (si === 3) for (let i = 0; i < 10; i++) { const k = ((t * 0.8 + i / 10) % 1); ctx.fillStyle = 'rgba(220,60,70,' + (1 - k) + ')'; ctx.beginPath(); ctx.arc(X(p.x) + 0.12 * U * k * (i % 2 ? 1 : -1), Y(p.y) - 0.02 * U * k, Math.max(2.5, U * 0.01), 0, TAU); ctx.fill(); }
        const fsm = A.fs(U, 0.038, 12);
        if (si === 3) A.label(ctx, 'nutrienți → sânge', X(0.42), Y(p.y), { size: fsm, align: 'left', color: '#ffc2c8', bg: 'rgba(50,14,20,0.82)' });
        if (si === 4) A.label(ctx, 'apa → sânge', X(0.42), Y(-0.1), { size: fsm, align: 'left', color: '#bfe6ff', bg: 'rgba(12,28,46,0.82)' });
        /* etichete */
        const fsz = A.fs(U, 0.042, 13), lb = { size: fsz, bg: 'rgba(18,14,30,0.8)' };
        A.label(ctx, 'Gura', X(-0.2), Y(-0.88), Object.assign({ align: 'right', tx: X(-0.06), ty: Y(-0.88) }, lb));
        A.label(ctx, 'Esofag', X(-0.2), Y(-0.65), Object.assign({ align: 'right', tx: X(-0.03), ty: Y(-0.65) }, lb));
        A.label(ctx, 'Stomac', X(0.44), Y(-0.52), Object.assign({ align: 'left', tx: X(0.24), ty: Y(-0.43) }, lb));
        A.label(ctx, 'Intestin subțire', X(-0.44), Y(0.08), Object.assign({ align: 'right', tx: X(-0.2), ty: Y(0.04) }, lb));
        A.label(ctx, 'Intestin gros', X(0.44), Y(0.3), Object.assign({ align: 'left', tx: X(0.33), ty: Y(0.3) }, lb));
        if (si !== lastSt) { lastSt = si; if (playing) api.say('<b>' + ST[si].n + '</b> · ' + ST[si].h + '. ' + ST[si].t, 8000); }
        info.innerHTML = '<b>' + ST[si].n + '</b> · <b>' + timeText() + '</b> după masă' + (si === 3 ? ' · intestinul subțire are ~6 m' : '');
      }
      return { frame: frame };
    }
  });
})();
