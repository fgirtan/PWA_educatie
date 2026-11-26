/* Modul: Inima și circulația — ilustrație anatomică (stil atlas pentru copii) */
(function () {
  const A = window.Art, C = A.C, TAU = A.TAU;
  const clamp = A.clamp, lerp = A.lerp;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });

  /* globulă roșie (disc biconcav) pre-randată: o singură dată per culoare */
  function rbcSprite(key, col) {
    return A.cached('heart-rbc-' + key, 48, 48, (c, w) => {
      const r = w * 0.42, x = w / 2, y = w / 2;
      const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
      g.addColorStop(0, A.shade(col, 0.35)); g.addColorStop(0.7, col); g.addColorStop(1, A.shade(col, -0.45));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      const d = c.createRadialGradient(x + r * 0.08, y + r * 0.08, 0, x, y, r * 0.5);
      d.addColorStop(0, A.rgba(A.shade(col, -0.35), 0.75)); d.addColorStop(1, A.rgba(A.shade(col, -0.35), 0));
      c.fillStyle = d; c.beginPath(); c.arc(x, y, r * 0.5, 0, TAU); c.fill();
    });
  }
  /* inimioară mică (pentru panoul EKG) — desenată, nu emoji */
  function miniHeart(ctx, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, 0.35); ctx.bezierCurveTo(-0.95, -0.25, -0.55, -1.05, 0, -0.5); ctx.bezierCurveTo(0.55, -1.05, 0.95, -0.25, 0, 0.35); ctx.closePath();
    const g = ctx.createLinearGradient(-1, -1, 1, 0.5); g.addColorStop(0, A.shade(col, 0.35)); g.addColorStop(1, A.shade(col, -0.35));
    ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-0.38, -0.5, 0.14, 0.09, -0.6, 0, TAU); ctx.fill();
    ctx.restore();
  }

  defineModule({
    id: 'heart', title: 'Inima și circulația', sub: 'Cum ajunge sângele peste tot în corp',
    start: function (api) {
      const ctx = api.ctx;
      let bpm = 70, phase = 0, flowU = 0, ecg = [], beatS = { x: 0, v: 0 };
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Pulsul', min: 40, max: 200, step: 1, value: bpm, fmt: (v) => v + ' bătăi/min', onInput: (v) => { bpm = v; } });
      const r2 = api.row('Ce faci?');
      [['😴 Somn', 55, 'În somn inima bate mai rar: ~55 de bătăi pe minut. Corpul are nevoie de mai puțin oxigen.'], ['🧍 Repaus', 70, 'În repaus, inima unui adult bate de ~70 de ori pe minut. Copiii au pulsul mai rapid: 80–100.'], ['🚶 Mers', 100, 'La mers, mușchii cer mai mult oxigen, așa că inima pompează mai repede.'], ['🏃 Alergare', 160, 'La alergare, inima poate ajunge la 160–180 de bătăi pe minut și pompează de 4–5 ori mai mult sânge decât în repaus!']]
        .forEach(([t, v, f]) => api.button(r2, t, () => { bpm = v; sl.set(v); api.say('<b>' + t.slice(3) + '.</b> ' + f, 9000); }));
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Inima e o pompă cu <b>4 camere</b>. Partea dreaptă trimite sângele <b style="color:#7aa0ff">sărac în oxigen</b> la plămâni; partea stângă trimite sângele <b style="color:#ff6a77">bogat în oxigen</b> în tot corpul. Atinge o cameră ca să afli mai multe!', 14000);

      /* camerele inimii (coordonate în unități, față de centru) — folosite și la desen, și la atingere */
      const CH = [
        { n: 'Atriul drept', x: -0.2, y: -0.02, r: 0.12, c: 'b', t: 'Aici intră sângele sărac în oxigen, venit din corp prin venele mari (cave).' },
        { n: 'Ventriculul drept', x: -0.16, y: 0.3, r: 0.15, c: 'b', t: 'Pompează sângele spre plămâni, ca să ia oxigen proaspăt.' },
        { n: 'Atriul stâng', x: 0.22, y: -0.02, r: 0.12, c: 'r', t: 'Primește sângele bogat în oxigen de la plămâni.' },
        { n: 'Ventriculul stâng', x: 0.18, y: 0.3, r: 0.17, c: 'r', t: 'Cea mai puternică cameră: împinge sângele prin aortă în tot corpul, până în degetul mic de la picior. Are pereții cei mai groși.' }
      ];
      api.pointer({ down: (x, y) => { const U = api.unit; for (const c of CH) if (Math.hypot(x - (api.cx + c.x * U), y - (api.cy + c.y * U)) < c.r * U * 1.3) { api.say('<b>' + c.n + '.</b> ' + c.t, 9000); return; } const lung = Math.hypot(x - api.cx, y - (api.cy - 0.78 * U)) < 0.4 * U; if (lung) api.say('<b>Plămânii.</b> Aici sângele lasă dioxidul de carbon și ia oxigen: devine din albastru, roșu.', 9000); if (y > api.cy + 0.7 * U) api.say('<b>Corpul.</b> În capilare, sângele lasă oxigenul mușchilor, creierului și organelor și devine din nou albastru. Un ciclu complet durează ~1 minut.', 9000); } });

      /* circuitul complet, pe segmente: c = 'b' (albastru), 'r' (roșu), 'br'/'rb' = capilare (se schimbă culoarea);
         inside = segmentul trece prin camerele inimii (globulele se desenează peste inimă) */
      const SEG = [
        { c: 'rb', w: 0, pts: [[0.6, 0.78], [0.32, 0.86], [0, 0.83], [-0.32, 0.86], [-0.6, 0.78]] },                         // capilarele corpului
        { c: 'b', w: 0.075, pts: [[-0.6, 0.78], [-0.79, 0.5], [-0.82, 0.12], [-0.66, -0.16], [-0.4, -0.13], [-0.24, -0.05]] },    // venele cave
        { c: 'b', w: 0, inside: true, pts: [[-0.24, -0.05], [-0.2, -0.02], [-0.18, 0.14], [-0.16, 0.3]] },                      // AD → VD
        { c: 'b', w: 0, inside: true, pts: [[-0.16, 0.3], [-0.08, 0.14], [-0.05, -0.1]] },                                      // VD → artera pulmonară
        { c: 'b', w: 0.065, pts: [[-0.05, -0.1], [-0.07, -0.38], [-0.2, -0.58], [-0.36, -0.72]] },                               // artera pulmonară
        { c: 'br', w: 0, pts: [[-0.36, -0.72], [-0.2, -0.84], [0, -0.8], [0.2, -0.84], [0.36, -0.72]] },                        // capilarele plămânilor
        { c: 'r', w: 0.06, pts: [[0.36, -0.72], [0.44, -0.52], [0.4, -0.28], [0.28, -0.12]] },                                  // venele pulmonare
        { c: 'r', w: 0, inside: true, pts: [[0.28, -0.12], [0.22, -0.02], [0.2, 0.14], [0.18, 0.3]] },                          // AS → VS
        { c: 'r', w: 0, inside: true, pts: [[0.18, 0.3], [0.09, 0.12], [0.05, -0.12]] },                                        // VS → aortă
        { c: 'r', w: 0.085, pts: [[0.05, -0.12], [0.05, -0.4], [0.18, -0.58], [0.42, -0.54], [0.64, -0.3], [0.8, 0.1], [0.77, 0.5], [0.6, 0.78]] } // aorta
      ];
      let total = 0;
      for (const s of SEG) { s.smp = A.pathSampler(s.pts, false, 16); s.u0 = total; total += s.smp.len; }
      for (const s of SEG) { s.u0 /= total; s.u1 = s.u0 + s.smp.len / total; }
      function sampleLoop(u) {
        u = ((u % 1) + 1) % 1;
        for (const s of SEG) if (u <= s.u1) { const k = (u - s.u0) / (s.u1 - s.u0); const p = s.smp.at(k); const red = s.c === 'r' ? 1 : s.c === 'b' ? 0 : s.c === 'br' ? A.ease.inOut(k) : 1 - A.ease.inOut(k); return { x: p.x, y: p.y, red: red, inside: !!s.inside }; }
        const p = SEG[0].smp.at(0); return { x: p.x, y: p.y, red: 1, inside: false };
      }
      const BLUE = '#3d63e0', RED = '#e8394f';
      const N = 74, GL = []; for (let i = 0; i < N; i++) GL.push({ o: i / N + (Math.sin(i * 12.9) * 0.004), s: i * 1.7 });

      /* puls cu easing: contracție rapidă, relaxare lentă */
      function envelope(p) {
        const atr = p < 0.13 ? Math.sin(Math.PI * p / 0.13) : 0;
        let ven = 0;
        if (p >= 0.14 && p < 0.23) ven = A.ease.out((p - 0.14) / 0.09);
        else if (p >= 0.23 && p < 0.62) ven = 1 - A.ease.inOut((p - 0.23) / 0.39);
        return { a: atr, v: ven };
      }
      const bump = (p, a, b) => p >= a && p < b ? Math.sin(Math.PI * (p - a) / (b - a)) : 0;

      function capillaryBed(X, Y, U, seg, t, flip) {
        /* rețea fină de capilare care trece din albastru în roșu (sau invers) */
        const pts = seg.pts, a = pts[0], b = pts[pts.length - 1];
        const g = ctx.createLinearGradient(X(a[0]), 0, X(b[0]), 0);
        const c0 = seg.c === 'br' ? BLUE : RED, c1 = seg.c === 'br' ? RED : BLUE;
        g.addColorStop(0.1, c0); g.addColorStop(0.9, c1);
        ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = g;
        for (let k = -2; k <= 2; k++) {
          ctx.globalAlpha = k === 0 ? 0.95 : 0.55; ctx.lineWidth = k === 0 ? Math.max(3, U * 0.026) : Math.max(1.5, U * 0.011);
          ctx.beginPath(); const q = pts.map((p, i) => [X(p[0]), Y(p[1]) + (i > 0 && i < pts.length - 1 ? k * U * 0.035 * flip + Math.sin(i * 2.3 + k) * U * 0.01 : 0)]);
          A.smoothPath(ctx, q, false); ctx.stroke();
        }
        /* ochiuri de legătură */
        ctx.globalAlpha = 0.4; ctx.lineWidth = Math.max(1, U * 0.007);
        for (let i = 1; i < 9; i++) { const u = i / 9, p = seg.smp.at(u); ctx.beginPath(); ctx.moveTo(X(p.x), Y(p.y) - U * 0.07); ctx.quadraticCurveTo(X(p.x) + U * 0.03, Y(p.y), X(p.x), Y(p.y) + U * 0.07); ctx.stroke(); }
        ctx.restore();
      }

      function drawLungs(X, Y, U, t, br) {
        for (const sg of [-1, 1]) {
          const lx = X(sg * 0.3), ly = Y(-0.8), s = 1.12 + 0.03 * Math.sin(t * 1.6);
          ctx.save(); ctx.translate(lx, ly); ctx.scale(s * sg, s);
          ctx.beginPath(); ctx.moveTo(-0.02 * U, -0.13 * U);
          ctx.bezierCurveTo(-0.14 * U, -0.17 * U, -0.27 * U, -0.06 * U, -0.27 * U, 0.06 * U);
          ctx.bezierCurveTo(-0.27 * U, 0.14 * U, -0.12 * U, 0.15 * U, 0.02 * U, 0.12 * U);
          ctx.bezierCurveTo(0.09 * U, 0.1 * U, 0.1 * U, 0.03 * U, 0.08 * U, -0.03 * U);
          ctx.bezierCurveTo(0.06 * U, -0.1 * U, 0.04 * U, -0.12 * U, -0.02 * U, -0.13 * U); ctx.closePath();
          A.volumeFill(ctx, -0.27 * U, -0.17 * U, 0.1 * U, 0.15 * U, '#e48a9c', { hi: 0.22, lo: 0.35 });
          ctx.strokeStyle = A.ink('#e48a9c'); ctx.lineWidth = A.lineW(U); ctx.stroke();
          /* textură spongioasă: alveole */
          ctx.clip(); ctx.fillStyle = 'rgba(255,230,236,0.22)';
          for (let i = 0; i < 22; i++) { const ax = (-0.24 + ((i * 0.37) % 1) * 0.3) * U, ay = (-0.12 + ((i * 0.61) % 1) * 0.25) * U; ctx.beginPath(); ctx.arc(ax, ay, U * (0.012 + (i % 3) * 0.004), 0, TAU); ctx.fill(); }
          ctx.restore();
        }
        A.label(ctx, 'Plămâni', X(0.74), Y(-0.88), { size: A.labelSize(U), bg: A.LABEL_BG, color: '#ffd3de' });
      }

      function frame(dt, t) {
        phase = (phase + dt * bpm / 60) % 1;
        const env = envelope(phase), Va = env.v, Aa = env.a;
        const beatMul = 1 + 1.2 * bump(phase, 0.12, 0.42);
        flowU = (flowU + dt * (bpm / 70) * 0.11 * beatMul) % 1;
        const squeeze = A.spring(beatS, Va, dt, 260, 18);
        const U = api.unit, cx = api.cx, cy = api.cy;
        const X = (x) => cx + x * U, Y = (y) => cy + y * U;

        /* fundal: cel comun al secțiunii Corpul omenesc */
        A.scene(ctx, api.W, api.H, 'body');

        /* rețeaua de capilare (corp + plămâni) */
        drawLungs(X, Y, U, t);
        capillaryBed(X, Y, U, SEG[5], t, 1);
        capillaryBed(X, Y, U, SEG[0], t, -1);
        A.label(ctx, 'Restul corpului', X(0), Y(0.96), { size: A.labelSize(U), bg: A.LABEL_BG });

        /* vasele mari: tuburi curbe cu luciu; artera pulmonară sub aortă */
        const vw = (w) => w * U * (1 + 0.06 * squeeze);
        A.tube(ctx, SEG[1].pts.map((p) => [X(p[0]), Y(p[1])]), vw(SEG[1].w), BLUE);
        A.tube(ctx, SEG[6].pts.map((p) => [X(p[0]), Y(p[1])]), vw(SEG[6].w), '#d8364c');
        A.tube(ctx, SEG[4].pts.map((p) => [X(p[0]), Y(p[1])]), vw(SEG[4].w), '#4a6ae6');
        A.tube(ctx, SEG[9].pts.map((p) => [X(p[0]), Y(p[1])]), vw(SEG[9].w), RED, { gloss: 0.34 });
        /* globule pe vase (în spatele inimii) */
        const gr = Math.max(3.2, U * 0.019), spR = rbcSprite('r', '#ff5a6a'), spB = rbcSprite('b', '#6d8cff');
        const inside = [];
        for (let i = 0; i < N; i++) {
          const g = GL[i], p = sampleLoop(flowU + g.o);
          const px = X(p.x), py = Y(p.y);
          if (p.inside) { inside.push([px, py, p.red]); continue; }
          drawRBC(px, py, p.red);
        }
        function drawRBC(px, py, red) {
          const r = gr;
          if (red > 0.02 && red < 0.98) { ctx.globalAlpha = 1 - red; ctx.drawImage(spB, px - r, py - r, r * 2, r * 2); ctx.globalAlpha = red; ctx.drawImage(spR, px - r, py - r, r * 2, r * 2); ctx.globalAlpha = 1; }
          else ctx.drawImage(red >= 0.5 ? spR : spB, px - r, py - r, r * 2, r * 2);
        }

        /* ===== INIMA ===== */
        const hx = X(0), hy = Y(0.12), hsx = U * 0.5, hsy = U * 0.54;
        const sx = 1 - 0.045 * squeeze + 0.012 * Aa, sy = 1 - 0.06 * squeeze + 0.01 * Aa;
        const HP = [[-0.3, -0.66], [-0.62, -0.6], [-0.86, -0.34], [-0.92, 0.02], [-0.8, 0.36], [-0.5, 0.64], [-0.1, 0.86], [0.28, 1.0], [0.6, 0.8], [0.84, 0.4], [0.93, -0.02], [0.84, -0.4], [0.58, -0.62], [0.26, -0.64], [0.0, -0.56]];
        const heartPath = () => { ctx.beginPath(); A.smoothPath(ctx, HP.map((p) => [p[0] * hsx, p[1] * hsy]), true); };
        A.groundShadow(ctx, hx + U * 0.06, hy + hsy * 0.95, hsx * 0.8, hsy * 0.12, 0.35);
        ctx.save(); ctx.translate(hx, hy); ctx.scale(sx, sy);
        /* urechiușele atriilor */
        for (const [ax, ay, rot, col] of [[-0.62, -0.62, -0.5, '#8d3a66'], [0.66, -0.58, 0.45, '#b33a4a']]) {
          ctx.save(); ctx.translate(ax * hsx, ay * hsy); ctx.rotate(rot);
          A.blob(ctx, 0, 0, hsx * 0.2, t * 0.3, { sx: 1.25, sy: 0.75, amp: 0.1, seed: ax * 3 });
          A.volumeFill(ctx, -hsx * 0.2, -hsx * 0.2, hsx * 0.2, hsx * 0.2, col, { hi: 0.25, lo: 0.4 });
          ctx.strokeStyle = A.ink(col); ctx.lineWidth = A.lineW(U); ctx.stroke(); ctx.restore();
        }
        /* mușchiul (miocardul) cu volum */
          heartPath();
          const wall = ctx.createRadialGradient(-0.35 * hsx, -0.45 * hsy, hsx * 0.05, 0.1 * hsx, 0.15 * hsy, hsx * 1.25);
          wall.addColorStop(0, '#d9837c'); wall.addColorStop(0.35, '#b44a4e'); wall.addColorStop(0.75, '#80283a'); wall.addColorStop(1, '#4a1220');
          ctx.fillStyle = wall; ctx.fill();
        
        ctx.save(); heartPath(); ctx.clip();
        /* fibre musculare în spirală */
        ctx.lineCap = 'round';
        for (let i = 0; i < 16; i++) {
          const k = i / 15, ox = lerp(-1.05, 1.05, k) * hsx;
          ctx.strokeStyle = i % 2 ? 'rgba(255,190,190,0.09)' : 'rgba(60,0,15,0.14)'; ctx.lineWidth = Math.max(1.5, U * 0.012);
          ctx.beginPath(); ctx.moveTo(ox - 0.3 * hsx, -0.9 * hsy); ctx.bezierCurveTo(ox + 0.25 * hsx, -0.3 * hsy, ox - 0.2 * hsx, 0.4 * hsy, ox + 0.35 * hsx, 1.05 * hsy); ctx.stroke();
        }
        /* vase coronare pe suprafață (tuburi fine) */
        ctx.globalAlpha = 0.85;
        A.tube(ctx, [[0.1 * hsx, -0.36 * hsy], [0.5 * hsx, -0.2 * hsy], [0.78 * hsx, 0.15 * hsy], [0.62 * hsx, 0.55 * hsy], [0.32 * hsx, 0.86 * hsy]], Math.max(2, U * 0.012), '#f0a070', { gloss: 0.35 });
        A.tube(ctx, [[-0.08 * hsx, -0.36 * hsy], [-0.55 * hsx, -0.25 * hsy], [-0.84 * hsx, 0.05 * hsy], [-0.7 * hsx, 0.4 * hsy], [-0.3 * hsx, 0.72 * hsy]], Math.max(2, U * 0.011), '#f0a070', { gloss: 0.35 });
        ctx.globalAlpha = 1;
        /* cavitățile: albastre (partea dreaptă a inimii = stânga ecranului) și roșii */
        const cav = (c, rx, ry, rot, shrink) => {
          const x = c.x * U, y = (c.y - 0.12) * U, R = Math.max(rx, ry) * U;
          ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(shrink, shrink);
          ctx.beginPath(); ctx.ellipse(0, 0, rx * U + 4, ry * U + 4, 0, 0, TAU); ctx.fillStyle = 'rgba(70,0,20,0.45)'; ctx.fill();   // endocard (margine)
          const g = ctx.createRadialGradient(-rx * U * 0.35, -ry * U * 0.4, 1, 0, 0, R);
          const base = c.c === 'r' ? ['#ff8a92', '#e23a4c', '#8e1426'] : ['#93adff', '#4466dd', '#1f2f8a'];
          g.addColorStop(0, base[0]); g.addColorStop(0.55, base[1]); g.addColorStop(1, base[2]);
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx * U, ry * U, 0, 0, TAU); ctx.fill();
          /* trabecule (mici creste ale peretelui interior) */
          ctx.strokeStyle = 'rgba(0,0,30,0.22)'; ctx.lineWidth = 1.2;
          for (let i = 0; i < 4; i++) { const a = 1.9 + i * 0.35; ctx.beginPath(); ctx.moveTo(Math.cos(a) * rx * U * 0.95, Math.sin(a) * ry * U * 0.95); ctx.lineTo(Math.cos(a) * rx * U * 0.6, Math.sin(a) * ry * U * 0.6); ctx.stroke(); }
          ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.ellipse(-rx * U * 0.35, -ry * U * 0.45, rx * U * 0.28, ry * U * 0.15, -0.4, 0, TAU); ctx.fill();
          ctx.restore();
        };
        cav(CH[0], 0.115, 0.13, 0, 1 - 0.18 * Aa); cav(CH[1], 0.12, 0.21, 0.12, 1 - 0.24 * squeeze);
        cav(CH[2], 0.105, 0.12, 0, 1 - 0.18 * Aa); cav(CH[3], 0.1, 0.2, -0.12, 1 - 0.32 * squeeze);   // ventricul stâng: cavitate mai mică, perete mai gros
        /* septul (peretele din mijloc) */
        ctx.strokeStyle = 'rgba(255,200,200,0.16)'; ctx.lineWidth = Math.max(2, U * 0.02);
        ctx.beginPath(); ctx.moveTo(0.02 * U, -0.2 * U); ctx.bezierCurveTo(0.0, 0.05 * U, 0.03 * U, 0.25 * U, 0.02 * U, 0.42 * U); ctx.stroke();
        /* valve atrioventriculare: foițe care se deschid lin la diastolă */
        const openK = 1 - clamp(squeeze * 1.6, 0, 1);
        ctx.lineCap = 'round';
        for (const vx of [-0.18, 0.2]) {
          const y0 = 0.04 * U, L = 0.085 * U;
          for (const sd of [-1, 1]) {
            const ang = sd * lerp(0, 1.05, openK);
            const bx = (vx + sd * 0.095) * U, ex = bx - sd * Math.cos(ang) * L, ey = y0 + Math.abs(Math.sin(ang)) * L;
            ctx.strokeStyle = 'rgba(60,10,20,0.6)'; ctx.lineWidth = Math.max(4, U * 0.022); ctx.beginPath(); ctx.moveTo(bx, y0); ctx.quadraticCurveTo((bx + ex) / 2, (y0 + ey) / 2 - U * 0.012, ex, ey); ctx.stroke();
            ctx.strokeStyle = '#ffe7d6'; ctx.lineWidth = Math.max(2.5, U * 0.013); ctx.stroke();
          }
        }
        /* luciu umed și lumină de contur */
        const shg = ctx.createRadialGradient(-0.45 * hsx, -0.55 * hsy, 2, -0.35 * hsx, -0.4 * hsy, hsx * 0.75); shg.addColorStop(0, 'rgba(255,240,230,0.2)'); shg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = shg; ctx.fillRect(-hsx, -hsy, hsx * 2, hsy * 2.2);
        ctx.restore();
        heartPath(); ctx.strokeStyle = A.ink('#80283a'); ctx.lineWidth = A.lineW(U) * 2; ctx.stroke();
        ctx.restore();

        /* globule în interiorul camerelor */
        for (const g of inside) drawRBC(g[0], g[1], g[2]);

        /* etichete */
        const fsz = A.fs(U, 0.062, 14);
        for (const [c, t2] of [[CH[0], 'AD'], [CH[1], 'VD'], [CH[2], 'AS'], [CH[3], 'VS']]) A.text(ctx, t2, X(c.x), Y(c.y), { size: fsz, weight: 800 });
        const fsm = A.fs(U, 0.04, 12);
        A.text(ctx, 'sept', X(0.02), Y(0.56), { size: fsm, color: '#ffd6dc' });
        A.text(ctx, 'valve', X(0.02), Y(0.14), { size: fsm, color: '#fff0e0' });
        A.label(ctx, 'din corp', X(-0.82), Y(-0.3), { size: A.labelSize(U), bg: A.LABEL_BG, color: '#c8d6ff' });
        A.label(ctx, 'spre corp', X(0.82), Y(-0.08), { size: A.labelSize(U), bg: A.LABEL_BG, color: '#ffd0d6' });

        /* EKG într-un panou curat */
        const ev = bump(phase, 0.03, 0.10) * 0.2 + (phase > 0.14 && phase < 0.2 ? Math.sin(Math.PI * (phase - 0.14) / 0.06) * 1.0 : 0) - (phase > 0.2 && phase < 0.24 ? 0.25 : 0) + bump(phase, 0.32, 0.46) * 0.3;
        ecg.push(ev); if (ecg.length > 240) ecg.shift();
        const pw = Math.round(clamp(api.freeW * 0.3, 150, 270)), ph = Math.round(clamp(U * 0.3, 70, 96));
        const px0 = 12, py0 = Math.max(70, cy - U + 4);
        A.panel(ctx, px0, py0, pw, ph, { r: 12, bg: 'rgba(6,18,16,0.86)', border: 'rgba(125,255,176,0.22)' });
        const gx0 = px0 + 10, gy0 = py0 + 8, gw = pw - 20, gh = ph - 30;
        ctx.save(); ctx.strokeStyle = 'rgba(125,255,176,0.09)'; ctx.lineWidth = 1;
        for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(gx0 + i * gw / 8, gy0); ctx.lineTo(gx0 + i * gw / 8, gy0 + gh); ctx.stroke(); }
        for (let i = 0; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(gx0, gy0 + i * gh / 3); ctx.lineTo(gx0 + gw, gy0 + i * gh / 3); ctx.stroke(); }
        const base = gy0 + gh * 0.68, amp = gh * 0.62;
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        const trace = () => { ctx.beginPath(); ecg.forEach((v, i) => { const qx = gx0 + i / 240 * gw, qy = base - v * amp; i ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy); }); };
        ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 2; trace(); ctx.stroke();
        if (ecg.length) { const lx = gx0 + (ecg.length - 1) / 240 * gw, ly = base - ecg[ecg.length - 1] * amp; ctx.fillStyle = '#eafff2'; ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, TAU); ctx.fill(); }
        ctx.restore();
        A.text(ctx, 'EKG · ' + bpm + ' bătăi/min', px0 + 10, py0 + ph - 11, { size: A.fs(U, 0.036, 12), align: 'left', color: '#c9ffe0', halo: false });
        /* inimioara care bate (desenată) */
        const hs = 9 * (1 + 0.35 * squeeze);
        miniHeart(ctx, px0 + pw - 16, py0 + ph - 12, hs, '#ff5a6e');

        info.innerHTML = 'Pompează ~<b>' + fmt(bpm * 0.07, 1) + ' litri/minut</b> · ~<b>' + fmt(bpm * 1440 / 1000, 0) + ' mii de bătăi pe zi</b>';
      }
      return { frame: frame };
    }
  });
})();
