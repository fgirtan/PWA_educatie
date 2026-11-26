/* Modul: Plămânii și respirația — ilustrație anatomică (stil atlas pentru copii) */
(function () {
  const A = window.Art, C = A.C, TAU = A.TAU;
  const clamp = A.clamp, lerp = A.lerp;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });

  /* arbore bronșic determinist (pentru plămânul din dreapta ecranului; se oglindește) */
  function buildTree() {
    const out = []; let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    function grow(x, y, ang, len, w, depth) {
      const x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len;
      const bend = (rnd() - 0.5) * 0.4;
      out.push({ x0: x, y0: y, mx: (x + x1) / 2 + Math.cos(ang + 1.57) * len * bend * 0.3, my: (y + y1) / 2 + Math.sin(ang + 1.57) * len * bend * 0.3, x1: x1, y1: y1, w: w, d: depth, leaf: depth === 0 });
      if (depth <= 0) return;
      const spread = 0.42 + rnd() * 0.2;
      grow(x1, y1, ang - spread, len * (0.68 + rnd() * 0.1), w * 0.68, depth - 1);
      grow(x1, y1, ang + spread * 0.9, len * (0.66 + rnd() * 0.1), w * 0.66, depth - 1);
    }
    const hx = 0.2, hy = -0.06;
    grow(hx, hy, -1.25, 0.13, 0.026, 3);   // lobul superior
    grow(hx, hy, 0.15, 0.1, 0.024, 3);     // lobul mijlociu / lingula
    grow(hx, hy, 1.15, 0.14, 0.028, 3);    // lobul inferior
    grow(hx, hy, 0.75, 0.12, 0.022, 3);
    return out;
  }
  /* conturul plămânului, în coordonate „laterale” (q > 0 = spre exterior), relativ la centrul plămânului */
  const LUNG_R = [[0.0, -0.4], [0.13, -0.31], [0.21, -0.08], [0.25, 0.2], [0.24, 0.35], [0.1, 0.33], [-0.07, 0.3], [-0.13, 0.19], [-0.12, -0.01], [-0.09, -0.22], [-0.05, -0.36]];
  const LUNG_L = [[0.0, -0.4], [0.13, -0.31], [0.21, -0.08], [0.25, 0.2], [0.24, 0.35], [0.1, 0.33], [-0.02, 0.3], [-0.04, 0.2], [-0.1, 0.12], [-0.12, -0.01], [-0.09, -0.22], [-0.05, -0.36]];

  const SX = 1.3, SY = 1.1;   // proporțiile plămânului
  function dotSprite(key, col) {
    return A.cached('lungs-dot-' + key, 32, 32, (c, w) => {
      const r = w * 0.36, g = c.createRadialGradient(w * 0.42, w * 0.42, 0, w / 2, w / 2, r);
      g.addColorStop(0, A.shade(col, 0.3)); g.addColorStop(1, A.shade(col, -0.2));
      c.fillStyle = g; c.beginPath(); c.arc(w / 2, w / 2, r, 0, TAU); c.fill(); c.strokeStyle = A.shade(col, -0.45); c.lineWidth = 2; c.stroke();
    });
  }

  defineModule({
    id: 'lungs', title: 'Plămânii și respirația', sub: 'Cum intră aerul și cum iese dioxidul de carbon',
    start: function (api) {
      const ctx = api.ctx;
      let rate = 14, deep = 0.55, tt = 0, hold = false, holdT = 0, vol = 0, parts = [], deepS = 0.55;
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Ritmul respirației', min: 6, max: 50, step: 1, value: rate, fmt: (v) => v + ' resp./min', onInput: (v) => { rate = v; } });
      const r2 = api.row('Ce faci?');
      [['😴 Somn', 11, 0.45], ['🧍 Repaus', 15, 0.55], ['🏃 Alergare', 38, 0.95]].forEach(([t, v, d]) => api.button(r2, t, () => { rate = v; deep = d; sl.set(v); api.say('<b>' + t.slice(3) + '.</b> ' + (v > 30 ? 'Mușchii cer mult oxigen, deci respiri mai des și mai adânc.' : v < 12 ? 'În somn respirația e rară și liniștită.' : 'Un adult respiră în repaus de 12–20 de ori pe minut.'), 8000); }));
      const bH = api.button(r2, '🤐 Ține respirația', () => { hold = !hold; holdT = 0; bH.classList.toggle('on', hold); bH.innerHTML = hold ? '💨 Dă drumul' : '🤐 Ține respirația'; if (hold) api.say('Cât poți ține? Nu aerul care lipsește te face să respiri, ci <b>dioxidul de carbon</b> care se adună în sânge: creierul îți cere să dai drumul!', 10000); });
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Când tragi aer în piept, <b>diafragma</b> (un mușchi sub plămâni) coboară, iar coastele se ridică: plămânii se umflă și aerul intră. Apoi ele se relaxează și aerul iese. Atinge plămânii sau diafragma ca să afli mai multe!', 14000);
      api.pointer({ down: (x, y) => { const U = api.unit, cx = api.cx, cy = api.cy; if (y > cy + 0.35 * U && y < cy + 0.7 * U) api.say('<b>Diafragma.</b> Mușchiul cel mai important pentru respirație. Sughițul e o contracție bruscă a ei!', 9000); else if (y < cy - 0.35 * U && Math.abs(x - cx) < 0.12 * U) api.say('<b>Traheea.</b> Tubul prin care trece aerul, ~12 cm. Se împarte în două bronhii, câte una pentru fiecare plămân.', 9000); else if (Math.abs(x - cx) > 0.12 * U && Math.abs(x - cx) < 0.7 * U && y > cy - 0.55 * U) api.say('<b>Plămânii.</b> Au ~500 de milioane de alveole mici, ca niște baloane. Dacă le-am întinde, ar acoperi un teren de tenis!', 9000); } });

      const TREE = buildTree();
      const ALV = []; { let s = 5; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 46; i++) ALV.push([r() * 0.46 - 0.17, r() * 0.72 - 0.38, 0.008 + r() * 0.01]); }

      function lungPath(lx, ly, sg, U, s, shape) {
        const pts = shape.map((p) => [lx + sg * p[0] * SX * U * s , ly + p[1] * SY * U * s]);
        ctx.beginPath(); A.smoothPath(ctx, pts, true);
      }
      function torso(X, Y, U, v) {
        const k = 1 + 0.025 * v;
        const P = [[0.15, -1.08], [0.16, -0.86], [0.3, -0.78], [0.62, -0.72], [0.84, -0.6], [0.86, -0.3], [0.8, 0.15], [0.7, 0.6], [0.72, 1.05]];
        const pts = P.map((p) => [X(p[0] * k), Y(p[1])]).concat(P.slice().reverse().map((p) => [X(-p[0] * k), Y(p[1])]));
        ctx.save(); ctx.beginPath(); A.smoothPath(ctx, pts, true, 0.35);
        const g = ctx.createLinearGradient(X(-0.9), 0, X(0.9), 0);
        g.addColorStop(0, 'rgba(242,184,160,0.05)'); g.addColorStop(0.35, 'rgba(242,184,160,0.13)'); g.addColorStop(1, 'rgba(242,184,160,0.03)');
        ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,210,190,0.22)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      }
      function ribs(X, Y, U, v, d, alpha, wMul) {
        ctx.save(); ctx.lineCap = 'round';
        for (let i = 0; i < 7; i++) {
          const yy = -0.5 + i * 0.1 - 0.035 * v * d, w = (0.6 - Math.abs(i - 2.5) * 0.035) * (0.96 + 0.06 * v * d);
          for (const sg of [-1, 1]) {
            const path = () => { ctx.beginPath(); ctx.moveTo(X(sg * 0.04), Y(yy - 0.05)); ctx.bezierCurveTo(X(sg * w * 0.55), Y(yy - 0.16), X(sg * w * 1.02), Y(yy - 0.08), X(sg * w * 0.97), Y(yy + 0.14)); };
            ctx.globalAlpha = alpha; path();
            ctx.strokeStyle = C.boneShade; ctx.lineWidth = U * 0.034 * wMul; ctx.stroke();
            ctx.strokeStyle = C.bone; ctx.lineWidth = U * 0.022 * wMul; ctx.stroke();
            ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = U * 0.006 * wMul; ctx.stroke();
          }
        }
        ctx.restore();
      }

      function frame(dt, t) {
        const U = api.unit, cx = api.cx, cy = api.cy, X = (x) => cx + x * U, Y = (y) => cy + y * U;
        deepS = A.damp(deepS, deep, 3, dt);
        if (!hold) tt += dt * rate / 60; else holdT += dt;
        const cyc = tt % 1, v = hold ? vol : (1 - Math.cos(cyc * 2 * Math.PI)) / 2;
        const prevVol = vol; vol = v; const inhaling = !hold && (v - prevVol) >= 0;
        const d = deepS, s = 0.88 + 0.22 * v * d * 1.6;

        A.scene(ctx, api.W, api.H, 'body');
        torso(X, Y, U, v * d);
        /* coloana și coastele din spate */
        ctx.save(); ctx.globalAlpha = 0.55;
        for (let i = 0; i < 13; i++) { const yy = Y(-0.62 + i * 0.065); ctx.fillStyle = i % 2 ? C.boneShade : C.bone; A.roundRectPath(ctx, X(-0.03), yy, U * 0.06, U * 0.05, U * 0.015); ctx.fill(); }
        ctx.restore();
        ribs(X, Y, U, v, d, 0.6, 1);

        /* inima, ascunsă puțin în spatele plămânilor */
        ctx.save(); ctx.translate(X(0.05), Y(0.15)); ctx.rotate(-0.25); const hb = 1 + 0.04 * Math.max(0, Math.sin(t * 7.3));
        ctx.scale(hb, hb); const hr = U * 0.16;
        ctx.beginPath(); A.smoothPath(ctx, [[-0.3, -0.66], [-0.62, -0.6], [-0.86, -0.34], [-0.92, 0.02], [-0.8, 0.36], [-0.5, 0.64], [-0.1, 0.86], [0.28, 1.0], [0.6, 0.8], [0.84, 0.4], [0.93, -0.02], [0.84, -0.4], [0.58, -0.62], [0.26, -0.64], [0.0, -0.56]].map((p) => [p[0] * hr, p[1] * hr]), true);
        A.volumeFill(ctx, -hr, -hr, hr, hr, '#b8364a'); ctx.strokeStyle = A.ink('#b8364a'); ctx.lineWidth = A.lineW(U); ctx.stroke(); ctx.restore();
        /* plămânii */
        for (const sg of [-1, 1]) {
          const lx = X(sg * 0.3), ly = Y(-0.02), shape = sg > 0 ? LUNG_L : LUNG_R;
          lungPath(lx, ly, sg, U, s, shape); A.volumeFill(ctx, lx - 0.28 * U, ly - 0.4 * U * s, lx + 0.28 * U, ly + 0.36 * U * s, '#e48a9c', { hi: 0.22, lo: 0.38 });
          ctx.save(); lungPath(lx, ly, sg, U, s, shape); ctx.clip();
          /* lumină laterală + reflex */
          const rg = ctx.createRadialGradient(lx - sg * 0.02 * U - 0.06 * U, ly - 0.2 * U * s , U * 0.02, lx, ly, U * 0.45 * s); rg.addColorStop(0, 'rgba(255,235,240,0.45)'); rg.addColorStop(0.5, 'rgba(255,200,215,0)'); ctx.fillStyle = rg; ctx.fillRect(lx - U * 0.4, ly - U * 0.5, U * 0.8, U);
          /* textură spongioasă: alveole */
          ctx.strokeStyle = 'rgba(160,50,80,0.22)'; ctx.fillStyle = 'rgba(255,225,232,0.18)'; ctx.lineWidth = 1;
          for (const a of ALV) { const ax = lx + sg * a[0] * SX * U * s , ay = ly + a[1] * SY * U * s , r = a[2] * U * (0.9 + 0.25 * v * d); ctx.beginPath(); ctx.arc(ax, ay, r, 0, TAU); ctx.fill(); ctx.stroke(); }
          /* fisurile dintre lobi */
          ctx.strokeStyle = 'rgba(120,30,60,0.45)'; ctx.lineWidth = Math.max(1.5, U * 0.008);
          ctx.beginPath(); ctx.moveTo(lx + sg * -0.1 * SX * U * s, ly - 0.12 * SY * U * s); ctx.bezierCurveTo(lx + sg * 0.05 * SX * U * s, ly - 0.02 * U * s , lx + sg * 0.15 * SX * U * s, ly + 0.12 * U * s , lx + sg * 0.25 * SX * U * s, ly + 0.26 * SY * U * s); ctx.stroke();
          if (sg < 0) { ctx.beginPath(); ctx.moveTo(lx + sg * -0.02 * SX * U * s, ly + 0.06 * SY * U * s); ctx.quadraticCurveTo(lx + sg * 0.12 * SX * U * s, ly + 0.02 * U * s , lx + sg * 0.23 * SX * U * s, ly + 0.04 * SY * U * s); ctx.stroke(); }
          /* arborele bronșic */
          ctx.lineCap = 'round';
          for (const pass of [0, 1]) for (const b of TREE) {
            const tx = (x, y) => [X(sg * 0.3) + sg * (x - 0.3) * SX * U * s , ly + (y + 0.02) * SY * U * s];
            const p0 = tx(b.x0, b.y0), pm = tx(b.mx, b.my), p1 = tx(b.x1, b.y1);
            ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(pm[0], pm[1], p1[0], p1[1]);
            if (pass === 0) { ctx.strokeStyle = 'rgba(110,70,110,0.55)'; ctx.lineWidth = b.w * U + 2.5; }
            else { ctx.strokeStyle = b.d >= 2 ? '#e9eefa' : '#f4d6e2'; ctx.lineWidth = b.w * U; }
            ctx.stroke();
            if (pass === 1 && b.leaf) { const r = U * (0.018 + 0.006 * v * d); ctx.fillStyle = 'rgba(255,180,200,0.9)'; for (const [ox, oy] of [[0, 0], [0.6, 0.5], [-0.5, 0.6]]) { ctx.beginPath(); ctx.arc(p1[0] + ox * r, p1[1] + oy * r, r * 0.7, 0, TAU); ctx.fill(); } ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(p1[0] - r * 0.25, p1[1] - r * 0.25, r * 0.22, 0, TAU); ctx.fill(); }
          }
          ctx.restore();
          lungPath(lx, ly, sg, U, s, shape); ctx.strokeStyle = A.ink('#e48a9c'); ctx.lineWidth = A.lineW(U) * 1.3; ctx.stroke();
        }
        /* coastele din față, transparente, peste plămâni */
        ribs(X, Y, U, v, d, 0.16, 0.8);

        /* traheea și bronhiile principale (cu inele de cartilaj) */
        const trach = [[X(0), Y(-1.0)], [X(0), Y(-0.6)], [X(0), Y(-0.3)]];
        A.tube(ctx, trach, U * 0.06, '#d9e2f2', { gloss: 0.4 });
        ctx.save(); ctx.strokeStyle = 'rgba(120,130,160,0.55)'; ctx.lineWidth = Math.max(1.5, U * 0.007);
        for (let i = 0; i < 9; i++) { const yy = Y(-0.95 + i * 0.07); ctx.beginPath(); ctx.ellipse(X(0), yy, U * 0.03, U * 0.008, 0, 0, Math.PI); ctx.stroke(); }
        ctx.restore();
        for (const sg of [-1, 1]) A.tube(ctx, [[X(0), Y(-0.31)], [X(sg * 0.1), Y(-0.2)], [X(sg * 0.2 * s / 0.88 * 0.92), Y(-0.08)]], U * 0.042, '#d9e2f2', { gloss: 0.35 });

        /* diafragma: mușchi în formă de cupolă care coboară lin la inspirație */
        const dy = cy + 0.38 * U + 0.14 * U * v * d * 1.4;
        const th = U * 0.075;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(X(-0.68), dy + 0.12 * U); ctx.bezierCurveTo(X(-0.45), dy - 0.2 * U, X(-0.12), dy - 0.18 * U, X(0), dy - 0.1 * U); ctx.bezierCurveTo(X(0.12), dy - 0.18 * U, X(0.45), dy - 0.2 * U, X(0.68), dy + 0.12 * U);
        ctx.lineTo(X(0.68), dy + 0.12 * U + th); ctx.bezierCurveTo(X(0.45), dy - 0.2 * U + th, X(0.12), dy - 0.18 * U + th, X(0), dy - 0.1 * U + th); ctx.bezierCurveTo(X(-0.12), dy - 0.18 * U + th, X(-0.45), dy - 0.2 * U + th, X(-0.68), dy + 0.12 * U + th); ctx.closePath();
        A.volumeFill(ctx, 0, dy - 0.2 * U, 0, dy + 0.2 * U, '#b9554e', { hi: 0.25, lo: 0.4 });
        ctx.clip(); ctx.strokeStyle = 'rgba(255,200,190,0.22)'; ctx.lineWidth = 1.2;
        for (let i = -12; i <= 12; i++) { const x0 = X(i * 0.055); ctx.beginPath(); ctx.moveTo(x0, dy - 0.25 * U); ctx.lineTo(x0 + i * U * 0.012, dy + 0.25 * U); ctx.stroke(); }
        ctx.restore();
        /* săgeți care arată mișcarea diafragmei */
        const dirA = inhaling ? 1 : -1, aA = 0.35 + 0.4 * Math.sin(Math.PI * v);
        if (!hold) for (const sg of [-1, 1]) { ctx.save(); ctx.globalAlpha = aA; A.arrow(ctx, X(sg * 0.5), dy + 0.12 * U - dirA * 0.06 * U, X(sg * 0.5), dy + 0.12 * U + dirA * 0.06 * U, { color: '#ffd2c4', width: Math.max(2, U * 0.01) }); ctx.restore(); }

        /* particule: O₂ (albastru) intră, CO₂ (portocaliu) iese */
        if (!hold && Math.random() < dt * 26) parts.push({ y: inhaling ? cy - 1.0 * U : cy - 0.12 * U, dir: inhaling ? 1 : -1, side: Math.random() < 0.5 ? -1 : 1, ph: Math.random() * 6 });
        parts = parts.filter((p) => { p.y += p.dir * dt * U * 0.55; return p.y > cy - 1.02 * U && p.y < cy - 0.08 * U; });
        const spO = dotSprite('o2', '#9fd8ff'), spC = dotSprite('co2', '#ffb067'), pr = Math.max(3.5, U * 0.022);
        for (const p of parts) {
          const below = Math.max(0, p.y - (cy - 0.31 * U));
          const px = cx + p.side * below * 0.9 + Math.sin(p.y * 0.08 + p.ph) * U * 0.008;
          ctx.drawImage(p.dir > 0 ? spO : spC, px - pr, p.y - pr, pr * 2, pr * 2);
        }

        /* etichete */
        const fsz = A.labelSize(U);
        A.label(ctx, 'trahee', X(0.2), Y(-0.72), { size: fsz, tx: X(0.03), ty: Y(-0.72), bg: A.LABEL_BG });
        A.label(ctx, 'plămân', X(-0.36), Y(-0.02), { size: fsz, bg: A.LABEL_BG });
        A.label(ctx, 'plămân', X(0.36), Y(-0.02), { size: fsz, bg: A.LABEL_BG });
        A.label(ctx, 'diafragma', X(0), dy + 0.3 * U, { size: fsz, bg: A.LABEL_BG, color: '#ffe0d6' });
        if (!hold) A.text(ctx, inhaling ? 'inspiră…' : 'expiră…', X(-0.2), Y(-0.9), { size: A.fs(U, 0.04, 12), color: inhaling ? '#bfe6ff' : '#ffd0a0', align: 'right' });

        /* alveolă (mărită) într-un medalion */
        const ar = clamp(U * 0.17, 40, 72), ax = api.freeW - ar - 26, ay = cy + 0.6 * U;
        ctx.save();
        ctx.beginPath(); ctx.arc(ax, ay, ar + 10, 0, TAU); ctx.fillStyle = 'rgba(8,14,34,0.95)'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,190,210,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ax, ay, ar + 10, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(ax, ay, ar + 8, 0, TAU); ctx.clip();
        const bg2 = ctx.createRadialGradient(ax, ay - ar * 0.3, 2, ax, ay, ar * 1.2); bg2.addColorStop(0, '#2a1830'); bg2.addColorStop(1, '#0c0c1e'); ctx.fillStyle = bg2; ctx.fillRect(ax - ar - 10, ay - ar - 10, ar * 2 + 20, ar * 2 + 20);
        /* bronhiola + ciorchine de alveole */
        A.tube(ctx, [[ax, ay - ar - 12], [ax, ay - ar * 0.55]], ar * 0.16, '#e9eefa', { gloss: 0.4 });
        const inf = 0.85 + 0.2 * v * d;
        for (const [ox, oy, rr] of [[0, -0.18, 0.36], [-0.38, 0.02, 0.3], [0.38, 0.02, 0.3], [-0.2, 0.3, 0.27], [0.2, 0.3, 0.27]]) {
          const bx = ax + ox * ar, by = ay + oy * ar, r = rr * ar * inf;
          ctx.save(); ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU);
          const g = ctx.createRadialGradient(bx - r * 0.35, by - r * 0.4, r * 0.1, bx, by, r); g.addColorStop(0, 'rgba(255,225,235,0.75)'); g.addColorStop(0.7, 'rgba(240,140,170,0.55)'); g.addColorStop(1, 'rgba(170,60,100,0.8)');
          ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,200,220,0.75)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
        }
        /* capilarul care învelește alveolele (din albastru devine roșu) */
        const cap = [[ax - ar * 1.05, ay + ar * 0.45], [ax - ar * 0.55, ay + ar * 0.62], [ax, ay + ar * 0.66], [ax + ar * 0.55, ay + ar * 0.62], [ax + ar * 1.05, ay + ar * 0.45]];
        ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); A.smoothPath(ctx, cap, false);
        const cg = ctx.createLinearGradient(ax - ar, 0, ax + ar, 0); cg.addColorStop(0, C.vein); cg.addColorStop(1, C.blood);
        ctx.strokeStyle = 'rgba(40,0,10,0.6)'; ctx.lineWidth = ar * 0.22; ctx.stroke(); ctx.strokeStyle = cg; ctx.lineWidth = ar * 0.17; ctx.stroke(); ctx.restore();
        for (let i = 0; i < 6; i++) { const u = ((t * 0.7 + i / 6) % 1), e = A.ease.inOut(u); const qx = ax + (i - 2.5) * ar * 0.17; ctx.globalAlpha = Math.sin(Math.PI * u); ctx.drawImage(spO, qx - pr * 0.8, lerp(ay - ar * 0.2, ay + ar * 0.62, e) - pr * 0.8, pr * 1.6, pr * 1.6); ctx.drawImage(spC, qx + ar * 0.08 - pr * 0.8, lerp(ay + ar * 0.62, ay - ar * 0.2, e) - pr * 0.8, pr * 1.6, pr * 1.6); }
        ctx.globalAlpha = 1;
        ctx.restore();
        const fsm = A.fs(U, 0.036, 12);
        A.text(ctx, 'alveolă (mărită)', ax, ay - ar - 24, { size: fsm });
        A.text(ctx, 'O₂ → sânge', ax, ay + ar + 24, { size: fsm, color: '#9fd8ff' });
        A.text(ctx, 'CO₂ ← sânge', ax, ay + ar + 24 + fsm * 1.3, { size: fsm, color: '#ffb067' });

        /* ține respirația: cronometru și CO₂ în sânge */
        const co2 = hold ? clamp(holdT / 40, 0, 1) : clamp(0.08 + deep * 0.0, 0, 1);
        if (hold) {
          const px0 = 12, py0 = Math.max(70, cy - U + 4), pw = 170, ph = holdT > 25 ? 102 : 84;
          A.panel(ctx, px0, py0, pw, ph, { r: 12 });
          A.text(ctx, fmt(holdT, 0) + ' s', px0 + 14, py0 + 24, { size: 24, align: 'left', weight: 800, halo: false });
          A.meter(ctx, px0 + 14, py0 + 44, pw - 28, 9, co2, '#ffb067');
          A.text(ctx, 'CO₂ în sânge', px0 + 14, py0 + 68, { size: 13, align: 'left', halo: false, color: C.dim });
          if (holdT > 25) A.text(ctx, 'creierul îți cere aer!', px0 + 14, py0 + 88, { size: 13, align: 'left', halo: false, color: '#ff9a7a' });
        }
        info.innerHTML = '<b>Aer pe respirație:</b> ~' + fmt(0.5 * (deep / 0.55), 1) + ' L · <b>Pe minut:</b> ~' + fmt(rate * 0.5 * (deep / 0.55), 0) + ' L · <b>Pe zi:</b> ~' + fmt(rate * 0.5 * 1440 * (deep / 0.55) / 1000, 0) + ' mii de litri';
      }
      return { frame: frame };
    }
  });
})();
