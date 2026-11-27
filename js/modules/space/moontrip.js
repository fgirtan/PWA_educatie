/* Modul: Drumul spre Lună — o misiune pas cu pas */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  /* racheta cu 3 trepte (înălțime h, vârful sus). stages = câte trepte mai are (3, 2, 1, 0 = doar capsula) */
  function rocket(ctx, x, y, h, stages, flame, t, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    const w = h * 0.1, segs = [[0.42, 1.0], [0.28, 0.92], [0.16, 0.8]];       // [înălțime, lățime relativă]
    let yy = 0;                                                                // y = baza treptelor rămase (0 = jos)
    const parts = [];
    for (let i = 3 - stages; i < 3; i++) parts.push(i);
    let total = 0; parts.forEach((i) => { total += segs[i][0]; }); total += 0.14;
    yy = total * h / 2;                                                        // centrat
    const bottom = yy;
    for (const i of parts) {
      const sh = segs[i][0] * h, sw = w * segs[i][1];
      const g = ctx.createLinearGradient(-sw, 0, sw, 0); g.addColorStop(0, '#b9c0cc'); g.addColorStop(0.4, '#ffffff'); g.addColorStop(1, '#8e96a6');
      ctx.fillStyle = g; ctx.fillRect(-sw, yy - sh, sw * 2, sh);
      ctx.fillStyle = '#1d2230'; ctx.fillRect(-sw, yy - sh * 0.18, sw * 2, sh * 0.06); if (i === 0) { ctx.fillRect(-sw, yy - sh * 0.7, sw, sh * 0.25); ctx.fillRect(0, yy - sh * 0.45, sw, sh * 0.25); }
      if (i === 0) { ctx.fillStyle = '#9aa2b2'; ctx.beginPath(); ctx.moveTo(-sw, yy - sh * 0.25); ctx.lineTo(-sw * 1.6, yy); ctx.lineTo(-sw, yy); ctx.fill(); ctx.beginPath(); ctx.moveTo(sw, yy - sh * 0.25); ctx.lineTo(sw * 1.6, yy); ctx.lineTo(sw, yy); ctx.fill(); }
      yy -= sh;
    }
    /* capsula + turnul de salvare */
    const cw = w * 0.7, ch = h * 0.1;
    ctx.fillStyle = '#d7dbe3'; ctx.beginPath(); ctx.moveTo(-cw, yy); ctx.lineTo(-cw * 0.25, yy - ch); ctx.lineTo(cw * 0.25, yy - ch); ctx.lineTo(cw, yy); ctx.fill();
    ctx.fillStyle = '#3a4a6a'; ctx.fillRect(-cw * 0.15, yy - ch * 0.62, cw * 0.3, ch * 0.22);
    if (stages > 0) { ctx.strokeStyle = '#e04a3a'; ctx.lineWidth = Math.max(1, w * 0.12); ctx.beginPath(); ctx.moveTo(0, yy - ch); ctx.lineTo(0, yy - ch - h * 0.06); ctx.stroke(); }
    if (flame > 0) {
      const fw = w * (stages === 3 ? 0.9 : 0.55), fl = h * (0.25 + 0.06 * Math.sin(t * 40)) * flame;
      const fg = ctx.createLinearGradient(0, bottom, 0, bottom + fl); fg.addColorStop(0, '#fffbe0'); fg.addColorStop(0.3, '#ffd34a'); fg.addColorStop(0.7, 'rgba(255,120,30,0.8)'); fg.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-fw, bottom); ctx.quadraticCurveTo(-fw * 1.2, bottom + fl * 0.5, 0, bottom + fl); ctx.quadraticCurveTo(fw * 1.2, bottom + fl * 0.5, fw, bottom); ctx.fill();
    }
    ctx.restore();
  }
  function moonSurface(ctx, W, y, H) {
    const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, '#a9a9ad'); g.addColorStop(1, '#5e5e64'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, H); for (let i = 0; i <= 20; i++) ctx.lineTo(W * i / 20, y + Math.sin(i * 1.9) * 5 + Math.sin(i * 0.7) * 8); ctx.lineTo(W, H); ctx.fill();
    ctx.fillStyle = 'rgba(60,60,66,0.35)'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse((i * 137) % W, y + 24 + (i * 53) % Math.max(20, H - y - 30), 18 + (i % 3) * 12, 5 + (i % 3) * 3, 0, 0, TAU); ctx.fill(); }
  }
  function astronaut(ctx, x, y, s, t, walk) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
    const ph = t * 3, leg = walk ? Math.sin(ph) * 14 : 0;
    ctx.fillStyle = '#e9ecf2'; ctx.strokeStyle = '#9aa2b2'; ctx.lineWidth = 3;
    ctx.save(); ctx.translate(-8, -40); ctx.rotate(leg * 0.02); A.roundRectPath(ctx, -8, 0, 16, 42, 7); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(8, -40); ctx.rotate(-leg * 0.02); A.roundRectPath(ctx, -8, 0, 16, 42, 7); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#cfd5df'; A.roundRectPath(ctx, -30, -92, 18, 44, 6); ctx.fill();        // rucsacul
    ctx.fillStyle = '#e9ecf2'; A.roundRectPath(ctx, -20, -95, 40, 58, 14); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(20, -88); ctx.rotate(0.5 + Math.sin(ph) * 0.2); A.roundRectPath(ctx, -6, 0, 12, 36, 6); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, -112, 22, 0, TAU); ctx.fill(); ctx.stroke();
    const vg = ctx.createLinearGradient(-14, -124, 14, -100); vg.addColorStop(0, '#ffd77a'); vg.addColorStop(1, '#b06a1a'); ctx.fillStyle = vg; ctx.beginPath(); ctx.ellipse(4, -112, 15, 12, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-1, -117, 5, 3, -0.5, 0, TAU); ctx.fill();
    ctx.restore();
  }
  window.Astronaut = astronaut;
  function lander(ctx, x, y, s, flame, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
    ctx.strokeStyle = '#c9a23a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-30, -30); ctx.lineTo(-52, 0); ctx.moveTo(30, -30); ctx.lineTo(52, 0); ctx.moveTo(-20, -28); ctx.lineTo(-30, 0); ctx.moveTo(20, -28); ctx.lineTo(30, 0); ctx.stroke();
    ctx.fillStyle = '#c9a23a'; ctx.fillRect(-60, -3, 16, 4); ctx.fillRect(44, -3, 16, 4);
    const g = ctx.createLinearGradient(0, -60, 0, -26); g.addColorStop(0, '#f6d66a'); g.addColorStop(1, '#a8801e'); ctx.fillStyle = g; ctx.fillRect(-34, -58, 68, 30);
    ctx.fillStyle = '#c3c8d2'; ctx.beginPath(); ctx.moveTo(-26, -58); ctx.lineTo(-20, -92); ctx.lineTo(22, -92); ctx.lineTo(28, -58); ctx.fill();
    ctx.fillStyle = '#2a3348'; ctx.beginPath(); ctx.moveTo(-8, -80); ctx.lineTo(4, -80); ctx.lineTo(0, -70); ctx.lineTo(-10, -70); ctx.fill();
    if (flame > 0) { const fg = ctx.createLinearGradient(0, -28, 0, 10 + 30 * flame); fg.addColorStop(0, 'rgba(255,240,200,0.95)'); fg.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-8, -28); ctx.lineTo(0, 10 + 30 * flame + Math.sin(t * 40) * 4); ctx.lineTo(8, -28); ctx.fill(); }
    ctx.restore();
  }
  const STEPS = [
    ['🚀 Pe rampă', 'Racheta stă pe rampa de lansare. E înaltă cât un bloc de <b>36 de etaje</b> și e plină cu combustibil. Sus, în <b>capsulă</b>, stau 3 astronauți. Numărătoarea inversă: 10, 9, 8…'],
    ['🔥 Decolarea', 'Motoarele pornesc cu un foc uriaș! Gazele fierbinți sunt aruncate în jos, iar racheta e împinsă în sus. Urcă tot mai repede și cerul se face tot mai închis la culoare.'],
    ['✂️ Treptele se desprind', 'Când o treaptă își termină combustibilul, se desprinde și cade, ca racheta să fie mai ușoară. Apoi pornește motorul treptei următoare.'],
    ['🌍 În jurul Pământului', 'Am ajuns în spațiu! Nava se învârte în jurul Pământului, foarte repede: un tur durează doar o oră și jumătate.'],
    ['🌙 Spre Lună', 'Motorul pornește din nou și nava pleacă spre Lună. Drumul durează <b>3 zile</b>. Pământul se vede tot mai mic în urmă.'],
    ['🔄 În jurul Lunii', 'Nava se învârte în jurul Lunii. Doi astronauți trec în <b>modulul lunar</b>, care se desprinde și coboară. Al treilea rămâne sus și îi așteaptă.'],
    ['🛬 Aselenizarea', 'Modulul lunar coboară încet, cu motorul aprins ca o frână. Praful zboară… și picioarele ating solul Lunii: am aselenizat!'],
    ['👨‍🚀 Pe Lună', 'Astronauții ies afară! Pe Lună sunt de 6 ori mai ușori, așa că merg <b>țopăind</b>. Nu e aer, așa că poartă costume speciale. Urmele pașilor rămân acolo milioane de ani, pentru că nu bate vântul. Pe cer se vede Pământul.'],
    ['🪂 Acasă', 'După 3 zile de drum înapoi, capsula intră în aer atât de repede încât se înroșește de căldură. Apoi se deschid <b>parașutele</b> și capsula cade ușor în ocean. Bun venit acasă!']
  ];

  defineModule({
    id: 'moontrip', title: 'Drumul spre Lună', sub: 'O misiune pas cu pas, de la rampă până pe Lună și înapoi',
    start: function (api) {
      const ctx = api.ctx; let step = 0, st = 0, auto = true;
      const r = api.row('');
      const prev = api.button(r, '◀', () => go(step - 1)), next = api.button(r, 'Pasul următor ▶', () => go(step + 1));
      const ab = api.button(r, '⏯ Automat', () => { auto = !auto; ab.classList.toggle('on', auto); }); ab.classList.add('on');
      api.button(r, '⟲ De la început', () => go(0));
      const DUR = [5, 7, 6, 7, 8, 7, 7, 9, 9];
      function go(i) { step = (i + STEPS.length) % STEPS.length; st = 0; api.say('<b>' + STEPS[step][0] + '.</b> ' + STEPS[step][1]); }
      const smoke = A.particles(400);
      const padL = () => api.W >= 700 ? 84 : 8;
      go(0);
      return {
        frame: function (dt, t) {
          st += dt; if (auto && st > DUR[step]) go(step + 1);
          const W = api.freeW, H = api.H, U = api.unit, cx = padL() + (W - padL()) / 2, k = clamp(st / DUR[step], 0, 1);
          const RH = Math.min(U * 1.3, H * 0.55);
          if (step <= 2) {
            const alt = step === 0 ? 0 : step === 1 ? Math.pow(k, 2) : 1;
            const sky = step === 2 ? 1 : alt;
            const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, A.mix('#4f97e0', '#02040c', sky)); g.addColorStop(1, A.mix('#cfe6fb', '#0d1a40', sky)); ctx.fillStyle = g; ctx.fillRect(0, 0, api.W, H);
            if (sky > 0.6) A.stars(ctx, api.W, H, t, { alpha: (sky - 0.6) * 2.5 });
            const gy = api.cy + RH * 0.55 + alt * H * 1.2;
            if (gy < H + 50) {
              ctx.fillStyle = '#5a8a46'; ctx.fillRect(0, gy, api.W, H); ctx.fillStyle = '#7a7f88'; ctx.fillRect(cx - RH * 0.3, gy - 6, RH * 0.6, 12);
              /* turnul de lansare */
              const tx = cx + RH * 0.17; ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 3; for (let i = 0; i < 12; i++) { const y1 = gy - i * RH * 0.09; ctx.strokeRect(tx, y1 - RH * 0.09, RH * 0.08, RH * 0.09); ctx.beginPath(); ctx.moveTo(tx, y1); ctx.lineTo(tx + RH * 0.08, y1 - RH * 0.09); ctx.stroke(); }
              if (step === 0) for (let i = 0; i < 3; i++) { ctx.strokeStyle = '#8a8f98'; ctx.beginPath(); ctx.moveTo(tx, gy - RH * (0.35 + i * 0.25)); ctx.lineTo(cx + RH * 0.06, gy - RH * (0.35 + i * 0.25)); ctx.stroke(); }
            }
            let ry = step === 0 ? api.cy + RH * 0.05 : step === 1 ? api.cy + RH * 0.05 - Math.min(k * 3, 1) * RH * 0.1 : api.cy - RH * 0.05;
            const shake = step === 1 && k < 0.3 ? Math.sin(t * 60) * 2 : 0;
            const stages = step === 2 ? (k < 0.45 ? 2 : 1) : 3;
            if (step === 0 && st > DUR[0] - 1.2) for (let i = 0; i < 6; i++) smoke.emit({ x: cx + (Math.random() - 0.5) * RH * 0.3, y: gy - 4, vx: (Math.random() - 0.5) * 120, vy: -Math.random() * 20, size: 10 + Math.random() * 14, grow: 30, life: 2.5, color: '#e8e8ee', drag: 1.2 });
            if (step === 1) for (let i = 0; i < 5; i++) smoke.emit({ x: cx + (Math.random() - 0.5) * 20, y: ry + RH * 0.5, vx: (Math.random() - 0.5) * 160, vy: 120 + Math.random() * 100 + alt * 400, size: 8 + Math.random() * 10, grow: 26, life: 2, color: alt > 0.5 ? '#9aa0b4' : '#f0f0f4', drag: 1.5 });
            smoke.update(dt); smoke.draw(ctx);
            /* treapta care cade */
            if (step === 2) { const fk = k < 0.45 ? k / 0.45 : (k - 0.45) / 0.55, fy = ry + RH * 0.4 + fk * RH * 1.1; ctx.globalAlpha = 1 - fk * 0.8; rocket(ctx, cx - fk * RH * 0.2, fy, RH * (k < 0.45 ? 0.62 : 0.4), 1, 0, t, fk * 1.6); ctx.globalAlpha = 1; }
            rocket(ctx, cx + shake, ry, RH, stages, step === 0 ? (st > DUR[0] - 1 ? 0.5 : 0) : 1, t, 0);
            if (step === 0) { const n = Math.max(0, Math.ceil(10 - st * 10 / (DUR[0] - 0.5))); A.text(ctx, n > 0 ? String(n) : '🔥', padL() + (W - padL()) * 0.18, api.cy, { size: A.fs(U, 0.3, 40), color: '#fff' }); }
            else A.label(ctx, 'Altitudine: ' + Math.round(step === 1 ? alt * 70 : 70 + k * 100) + ' km', padL() + 110, api.cy - U * 0.6, { size: A.labelSize(U) });
          } else if (step === 3) {
            A.scene(ctx, api.W, H, 'space'); A.stars(ctx, api.W, H, t);
            const R = U * 0.55; window.EarthGlobe(ctx, cx, api.cy, R, t * 20, [-0.8, -0.3], 0.2, { lights: true });
            const a = st * 1.1, ex = cx + Math.cos(a) * R * 1.35, ey = api.cy + Math.sin(a) * R * 0.5;
            ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.ellipse(cx, api.cy, R * 1.35, R * 0.5, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
            if (Math.sin(a) > -0.3 || Math.abs(Math.cos(a)) > 0.75) rocket(ctx, ex, ey, U * 0.22, 1, 0, t, a + Math.PI);
          } else if (step === 4) {
            A.scene(ctx, api.W, H, 'space'); A.stars(ctx, api.W, H, t);
            const x0 = padL() + U * 0.35, x1 = W - U * 0.35, yy = api.cy;
            window.EarthGlobe(ctx, x0, yy, U * 0.28 * (1 - k * 0.3), t * 20, [-1, 0], 0, {}); window.MoonFace(ctx, x1, yy, U * 0.1 + k * U * 0.08, 180);
            const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push([lerp(x0 + U * 0.3, x1 - U * 0.2, u), yy - Math.sin(u * Math.PI) * U * 0.35 * (u < 0.5 ? 1 : 1)]); }
            ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.setLineDash([4, 6]); ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.setLineDash([]);
            const i = Math.min(59, Math.floor(k * 60)), p = pts[i], q = pts[i + 1];
            rocket(ctx, p[0], p[1], U * 0.18, 0, k < 0.1 ? 1 : 0, t, Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2);
            A.label(ctx, 'Ziua ' + (1 + Math.floor(k * 2.99)) + ' din 3', cx, yy + U * 0.55, { size: A.labelSize(U) });
          } else if (step === 5) {
            A.scene(ctx, api.W, H, 'space'); A.stars(ctx, api.W, H, t);
            const R = U * 0.4; window.MoonFace(ctx, cx, api.cy + R * 0.2, R, 180);
            const a = st * 0.9, ex = cx + Math.cos(a) * R * 1.4, ey = api.cy + R * 0.2 + Math.sin(a) * R * 0.45;
            if (Math.sin(a) > -0.2 || Math.abs(Math.cos(a)) > 0.7) rocket(ctx, ex, ey, U * 0.16, 0, 0, t, a + Math.PI);
            if (k > 0.5) { const d = (k - 0.5) * 2; lander(ctx, ex + d * R * 0.1, ey + d * R * 0.5, U * 0.1 * (1 - d * 0.4), 0.4, t); }
          } else if (step === 6) {
            A.scene(ctx, api.W, H, 'space'); A.stars(ctx, api.W, H, t);
            const gy = api.cy + U * 0.55; moonSurface(ctx, api.W, gy, H);
            const ly = lerp(api.cy - U * 0.9, gy, A.ease.out(clamp(k * 1.25, 0, 1)));
            if (k < 0.8) for (let i = 0; i < 4; i++) { const d = clamp(1 - (gy - ly) / (U * 0.8), 0, 1); if (d > 0) smoke.emit({ x: cx + (Math.random() - 0.5) * 30, y: gy, vx: (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 160) * d, vy: -Math.random() * 30, size: 4 + Math.random() * 6, grow: 10, life: 1.4, color: '#b8b6b0', drag: 0.6 }); }
            smoke.update(dt); smoke.draw(ctx);
            lander(ctx, cx, ly, U * 0.42, k < 0.8 ? 1 : 0, t);
            if (k > 0.82) A.label(ctx, '✅ Am aselenizat!', cx, api.cy - U * 0.6, { size: A.fs(U, 0.06, 15) });
          } else if (step === 7) {
            A.scene(ctx, api.W, H, 'space'); A.stars(ctx, api.W, H, t);
            window.EarthGlobe(ctx, W - U * 0.4, api.cy - U * 0.55, U * 0.16, t * 10, [-1, 0.2], 0, {});
            const gy = api.cy + U * 0.55; moonSurface(ctx, api.W, gy, H);
            lander(ctx, padL() + U * 0.45, gy, U * 0.42, 0, t);
            /* steagul */
            const fx = cx + U * 0.45; ctx.strokeStyle = '#ddd'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx, gy); ctx.lineTo(fx, gy - U * 0.5); ctx.lineTo(fx + U * 0.25, gy - U * 0.5); ctx.stroke(); ctx.fillStyle = '#e8e8f0'; ctx.fillRect(fx, gy - U * 0.5, U * 0.25, U * 0.15); ctx.fillStyle = '#3a6ad0'; ctx.fillRect(fx, gy - U * 0.5, U * 0.1, U * 0.08); ctx.fillStyle = '#d04040'; for (let i = 0; i < 3; i++) ctx.fillRect(fx + U * 0.1, gy - U * 0.5 + i * U * 0.05, U * 0.15, U * 0.025);
            /* astronautul țopăie, lasă urme */
            const ph = (st * 0.6) % 1, ax = lerp(padL() + U * 0.75, cx + U * 0.25, (st / DUR[7])), hop = Math.abs(Math.sin(st * 2.4)) * U * 0.12;
            ctx.fillStyle = 'rgba(70,70,76,0.6)'; for (let i = 0; i < 14; i++) { const fxp = padL() + U * 0.75 + i * U * 0.06; if (fxp < ax - 10) { ctx.beginPath(); ctx.ellipse(fxp, gy + 6 + (i % 2) * 4, 5, 2, 0, 0, TAU); ctx.fill(); } }
            astronaut(ctx, ax, gy + 2 - hop, U * 0.32, st, true);
            A.text(ctx, 'Pământul', W - U * 0.4, api.cy - U * 0.3, { size: A.fs(U, 0.035, 11), color: '#bfe0ff' });
          } else {
            const reentry = k < 0.4, sea = !reentry;
            const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, reentry ? '#081028' : '#4f97e0'); g.addColorStop(1, reentry ? '#2a3c70' : '#cfe6fb'); ctx.fillStyle = g; ctx.fillRect(0, 0, api.W, H);
            const cy0 = reentry ? lerp(api.cy - U * 0.6, api.cy, k / 0.4) : lerp(api.cy - U * 0.4, api.cy + U * 0.42, clamp((k - 0.4) / 0.5, 0, 1));
            if (sea) { const sy = api.cy + U * 0.55; ctx.fillStyle = '#1e6aa8'; ctx.fillRect(0, sy, api.W, H); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc((i * 97 + t * 20) % api.W, sy + 12 + (i % 4) * 12, 10, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } A.cloud(ctx, padL() + U * 0.4, api.cy - U * 0.5, U * 0.15); A.cloud(ctx, W - U * 0.4, api.cy - U * 0.3, U * 0.12); }
            if (reentry) { A.glow(ctx, cx, cy0 + U * 0.08, U * 0.35, '#ff7a2f', 0.9); for (let i = 0; i < 4; i++) smoke.emit({ x: cx + (Math.random() - 0.5) * U * 0.15, y: cy0 - U * 0.05, vx: (Math.random() - 0.5) * 40, vy: -200 - Math.random() * 100, size: 6, grow: 8, life: 0.7, color: '#ffb060', glow: true, drag: 1 }); smoke.update(dt); smoke.draw(ctx); }
            else { const pr = U * 0.22; ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5; for (let i = -1; i <= 1; i++) { const px = cx + i * pr * 0.9, py = cy0 - U * 0.55; ctx.fillStyle = i === 0 ? '#ffffff' : '#ff6a3a'; ctx.beginPath(); ctx.arc(px, py, pr * 0.55, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(px - pr * 0.55, py); ctx.lineTo(cx, cy0 - U * 0.08); ctx.lineTo(px + pr * 0.55, py); ctx.stroke(); } }
            const cw = U * 0.1; ctx.fillStyle = reentry ? '#ffb080' : '#d7dbe3'; ctx.beginPath(); ctx.moveTo(cx - cw, cy0); ctx.lineTo(cx - cw * 0.3, cy0 - cw); ctx.lineTo(cx + cw * 0.3, cy0 - cw); ctx.lineTo(cx + cw, cy0); ctx.fill();
            if (k > 0.9) A.label(ctx, '🎉 Bun venit acasă!', cx, api.cy - U * 0.75, { size: A.fs(U, 0.06, 15) });
          }
          /* bara cu pași */
          const n = STEPS.length, bw = Math.min(W - padL() - 30, 520), bx = padL() + (W - padL() - bw) / 2, by = 82;
          for (let i = 0; i < n; i++) { const x = bx + bw * i / (n - 1); ctx.fillStyle = i < step ? 'rgba(139,123,255,0.9)' : i === step ? '#ffcf4a' : 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(x, by, i === step ? 7 : 5, 0, TAU); ctx.fill(); if (i < n - 1) { ctx.fillStyle = i < step ? 'rgba(139,123,255,0.6)' : 'rgba(255,255,255,0.15)'; ctx.fillRect(x + 7, by - 1, bw / (n - 1) - 14, 2); } }
          A.text(ctx, STEPS[step][0], bx + bw / 2, by + 22, { size: A.fs(U, 0.045, 13) });
        }
      };
    }
  });
})();
