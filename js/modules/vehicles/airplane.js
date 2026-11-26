/* Modul: Cum zboară avionul — avion ilustrat, cer cu parallax, curenți de aer */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const TAU = Math.PI * 2;

  /* profil NACA (grosime) — x în [-c/2, c/2], față la +x */
  function foilT(x, chord) { const q = clamp(0.5 - x / chord, 0, 1); return 0.12 / 0.2 * chord * (0.2969 * Math.sqrt(q) - 0.126 * q - 0.3516 * q * q + 0.2843 * q * q * q - 0.1015 * q * q * q * q); }
  function foilCamber(x, chord) { const q = clamp(0.5 - x / chord, 0, 1); return chord * 0.04 * Math.sin(Math.PI * q) * (1 - q * 0.3); }

  /* ============================================================
     2) CUM ZBOARĂ AVIONUL
     ============================================================ */
  defineModule({
    id: 'airplane', title: 'Cum zboară avionul', sub: 'Aripa, aerul și forța care ridică',
    start: function (api) {
      const ctx = api.ctx;
      let aoa = 6, speed = 0.6, alt = 0.5, vy = 0, flowT = 0, scroll = 0, aoaS = 6, buffet = 0;
      const MASS = 0.42;                                    // „greutatea” (în unități de portanță)
      let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const clouds = []; for (let i = 0; i < 7; i++) { const z = i < 3 ? 0.4 : i < 6 ? 0.7 : 1; clouds.push({ x: rnd() * 1.4, a: rnd() * 1.3 - 0.15, s: (0.5 + rnd() * 0.6) * z, z: z }); }
      const wind = []; for (let i = 0; i < 34; i++) wind.push({ x: rnd(), y: rnd(), k: rnd() });
      const r1 = api.row('');
      api.slider(r1, { label: 'Unghiul aripii (față de aer)', min: -4, max: 24, step: 0.5, value: aoa, fmt: (v) => fmt(v, 0) + '°', onInput: (v) => { aoa = v; } });
      api.slider(r1, { label: 'Viteza', min: 0, max: 1, step: 0.01, value: speed, fmt: (v) => Math.round(80 + v * 800) + ' km/h', onInput: (v) => { speed = v; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      api.say('Aripa e înclinată puțin și împinge aerul în jos; aerul o împinge în sus (<b>portanța</b>). Dacă avionul e prea încet, nu zboară. Dacă unghiul e prea mare, aerul se desprinde de aripă și avionul „pică” (<b>angajare</b>).', 14000);
      const CL = (a) => a < 15 ? 0.1 + 0.11 * (a + 2) : Math.max(0.2, (0.1 + 0.11 * 17) - (a - 15) * 0.22);
      let stallSaid = false;

      /* ---------- avionul (vedere laterală, botul la +x) ---------- */
      function drawPlane(Lp, chord, wingX, wingY, stall, t) {
        const fh = Lp * 0.115;                                  // înălțimea fuzelajului
        const nose = Lp * 0.5, tail = -Lp * 0.5;
        /* aripa îndepărtată (în spatele fuzelajului) */
        ctx.save(); ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.moveTo(wingX + chord * 0.35, wingY - fh * 0.05); ctx.lineTo(wingX - chord * 0.75, wingY - fh * 0.75); ctx.lineTo(wingX - chord * 0.95, wingY - fh * 0.7); ctx.lineTo(wingX - chord * 0.45, wingY + fh * 0.05); ctx.closePath(); ctx.fillStyle = '#9fb0c8'; ctx.fill(); ctx.restore();
        /* ampenaj orizontal (spate) */
        ctx.beginPath(); ctx.ellipse(tail + Lp * 0.1, -fh * 0.32, Lp * 0.09, fh * 0.1, -0.03, 0, TAU); Art.volumeFill(ctx, 0, -fh * 0.45, 0, -fh * 0.2, '#d9e1ec');
        /* fuzelaj */
        ctx.beginPath();
        ctx.moveTo(nose, fh * 0.12);
        ctx.bezierCurveTo(nose + fh * 0.12, -fh * 0.25, nose - fh * 0.5, -fh * 0.62, nose - fh * 1.3, -fh * 0.55);
        ctx.lineTo(tail + Lp * 0.24, -fh * 0.55);
        ctx.bezierCurveTo(tail + Lp * 0.12, -fh * 0.55, tail + Lp * 0.04, -fh * 0.62, tail, -fh * 0.6);
        ctx.lineTo(tail - fh * 0.05, -fh * 0.42);
        ctx.bezierCurveTo(tail + Lp * 0.1, -fh * 0.2, tail + Lp * 0.2, fh * 0.45, tail + Lp * 0.3, fh * 0.5);
        ctx.lineTo(nose - fh * 1.2, fh * 0.5);
        ctx.bezierCurveTo(nose - fh * 0.4, fh * 0.5, nose - fh * 0.05, fh * 0.42, nose, fh * 0.12);
        ctx.closePath();
        const fg = ctx.createLinearGradient(0, -fh * 0.6, 0, fh * 0.5); fg.addColorStop(0, '#ffffff'); fg.addColorStop(0.45, '#e9eef5'); fg.addColorStop(0.8, '#b8c4d4'); fg.addColorStop(1, '#8b99ad');
        ctx.fillStyle = fg; ctx.fill(); ctx.strokeStyle = Art.ink('#b8c4d4'); ctx.lineWidth = Art.lineW(api.unit); ctx.stroke();
        ctx.save(); ctx.clip();
        /* dungă colorată */
        ctx.fillStyle = '#2b7bd6'; ctx.beginPath(); ctx.moveTo(nose, fh * 0.18); ctx.lineTo(tail, fh * 0.02); ctx.lineTo(tail, fh * 0.12); ctx.lineTo(nose, fh * 0.3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffb43d'; ctx.beginPath(); ctx.moveTo(nose, fh * 0.31); ctx.lineTo(tail, fh * 0.13); ctx.lineTo(tail, fh * 0.17); ctx.lineTo(nose, fh * 0.36); ctx.closePath(); ctx.fill();
        /* luciu sus */
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(tail, -fh * 0.5, Lp, fh * 0.08);
        ctx.restore();
        /* hublouri */
        const nW = Math.max(6, Math.round(Lp / (fh * 0.55))) - 4;
        for (let i = 0; i < nW; i++) { const x = nose - fh * 1.9 - i * fh * 0.42; if (x < tail + Lp * 0.25) break; ctx.fillStyle = '#20324f'; Art.roundRectPath(ctx, x - fh * 0.1, -fh * 0.28, fh * 0.2, fh * 0.24, fh * 0.08); ctx.fill(); ctx.fillStyle = 'rgba(170,215,255,0.6)'; ctx.fillRect(x - fh * 0.06, -fh * 0.25, fh * 0.05, fh * 0.08); }
        /* parbriz */
        ctx.beginPath(); ctx.moveTo(nose - fh * 0.55, -fh * 0.33); ctx.quadraticCurveTo(nose - fh * 0.25, -fh * 0.3, nose - fh * 0.12, -fh * 0.12); ctx.lineTo(nose - fh * 0.62, -fh * 0.12); ctx.closePath();
        const wg = ctx.createLinearGradient(nose - fh * 0.6, -fh * 0.35, nose - fh * 0.1, -fh * 0.1); wg.addColorStop(0, '#16284a'); wg.addColorStop(1, '#4d86c6'); ctx.fillStyle = wg; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(nose - fh * 0.5, -fh * 0.27); ctx.lineTo(nose - fh * 0.3, -fh * 0.24); ctx.stroke();
        /* ușă */
        ctx.strokeStyle = 'rgba(80,95,120,0.5)'; ctx.lineWidth = 1; Art.roundRectPath(ctx, nose - fh * 1.55, -fh * 0.4, fh * 0.28, fh * 0.62, fh * 0.06); ctx.stroke();
        /* deriva */
        ctx.beginPath(); ctx.moveTo(tail + Lp * 0.2, -fh * 0.55); ctx.lineTo(tail + Lp * 0.06, -fh * 1.55); ctx.quadraticCurveTo(tail + Lp * 0.03, -fh * 1.62, tail + Lp * 0.0, -fh * 1.55); ctx.lineTo(tail - fh * 0.02, -fh * 0.58); ctx.closePath();
        Art.volumeFill(ctx, tail, -fh * 1.6, tail + Lp * 0.2, -fh * 0.5, '#2b7bd6', { hi: 0.35 });
        ctx.fillStyle = '#ffb43d'; ctx.beginPath(); ctx.arc(tail + Lp * 0.075, -fh * 1.15, fh * 0.16, 0, TAU); ctx.fill();
        /* trenul de aterizare când e jos */
        if (alt < 0.12) { const k = clamp((0.12 - alt) / 0.06, 0, 1); [nose - fh * 1.0, wingX - chord * 0.1].forEach((x) => { ctx.strokeStyle = '#6b7280'; ctx.lineWidth = fh * 0.07; ctx.beginPath(); ctx.moveTo(x, fh * 0.45); ctx.lineTo(x, fh * (0.45 + 0.4 * k)); ctx.stroke(); Art.sphere(ctx, x, fh * (0.5 + 0.45 * k), fh * 0.15, '#2b2f38', { rim: false }); }); }
        /* motorul de sub aripă */
        const ex = wingX + chord * 0.05, ey = wingY + fh * 0.35;
        ctx.beginPath(); Art.roundRectPath(ctx, ex - chord * 0.35, ey - fh * 0.2, chord * 0.62, fh * 0.42, fh * 0.2); Art.volumeFill(ctx, 0, ey - fh * 0.2, 0, ey + fh * 0.22, '#c8d2df', { hi: 0.4 });
        ctx.fillStyle = '#20283a'; ctx.beginPath(); ctx.ellipse(ex + chord * 0.27, ey + fh * 0.01, fh * 0.07, fh * 0.19, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(200,210,225,0.7)'; ctx.lineWidth = 1; for (let k = 0; k < 4; k++) { const yy = ey + Math.sin(t * 40 + k * 1.6) * fh * 0.15; ctx.beginPath(); ctx.moveTo(ex + chord * 0.27, yy); ctx.lineTo(ex + chord * 0.27, yy + 1); ctx.stroke(); }
        /* aripa — secțiunea (profilul) evidențiată */
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) { const x = chord / 2 - chord * i / 40, y = -foilT(x, chord) - foilCamber(x, chord); i ? ctx.lineTo(wingX + x, wingY + y) : ctx.moveTo(wingX + x, wingY + y); }
        for (let i = 0; i <= 40; i++) { const x = -chord / 2 + chord * i / 40, y = foilT(x, chord) * 0.55 - foilCamber(x, chord); ctx.lineTo(wingX + x, wingY + y); }
        ctx.closePath();
        const ag = ctx.createLinearGradient(0, wingY - chord * 0.1, 0, wingY + chord * 0.06); ag.addColorStop(0, stall ? '#ffd2c8' : '#fff8e6'); ag.addColorStop(0.6, stall ? '#f0a090' : '#ffd98a'); ag.addColorStop(1, stall ? '#b06050' : '#c7923a');
        ctx.fillStyle = ag; ctx.fill(); ctx.strokeStyle = Art.ink(stall ? '#f0a090' : '#ffd98a'); ctx.lineWidth = Art.lineW(api.unit) * 1.3; ctx.stroke();
        ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(120,80,30,0.35)'; ctx.lineWidth = 1; for (let k = 1; k < 6; k++) { const x = wingX + chord / 2 - chord * k / 6; ctx.beginPath(); ctx.moveTo(x, wingY - chord * 0.12); ctx.lineTo(x, wingY + chord * 0.1); ctx.stroke(); } ctx.restore();
        ctx.fillStyle = 'rgba(120,80,30,0.55)'; ctx.beginPath(); ctx.arc(wingX + chord * 0.2, wingY - foilCamber(chord * 0.2, chord) - foilT(chord * 0.2, chord) * 0.2, chord * 0.025, 0, TAU); ctx.fill();
      }

      function frame(dt, t) {
        const W = api.freeW, cx = api.cx, cy = api.cy, U = api.unit;
        const v = 0.15 + speed, lift = CL(aoa) * v * v * 0.55, stall = aoa > 15;
        /* mișcare verticală: portanță − greutate */
        const acc = (lift - MASS) * 1.6;
        vy += acc * dt; vy *= Math.exp(-dt * 1.2); alt = clamp(alt + vy * dt * 0.25, 0, 1);
        if (alt <= 0 && vy < 0) vy = 0;
        if (stall && !stallSaid) { stallSaid = true; api.say('⚠️ <b>Angajare!</b> Unghiul e prea mare: aerul nu mai urmează aripa, se face vâltoare, iar portanța scade brusc.', 8000); }
        if (!stall) stallSaid = false;
        aoaS = Art.damp(aoaS, aoa, 6, dt); buffet = Art.damp(buffet, stall ? 1 : 0, 4, dt);
        flowT += dt * (0.3 + v * 1.3); scroll += dt * v;

        /* ---------- cerul (se închide la culoare cu altitudinea) ---------- */
        const top = Art.mix(Art.SCENE.day[0], '#123068', clamp((alt - 0.3) / 0.7, 0, 1)), bot = Art.mix(Art.SCENE.day[1], '#5b8fd0', clamp((alt - 0.3) / 0.7, 0, 1));
        Art.daySky(ctx, api.W, api.H, { top: top, bottom: bot });

        /* ---------- nori în parallax (3 straturi) ---------- */
        for (const c of clouds) {
          c.x -= dt * v * 0.22 * c.z; if (c.x < -0.25) { c.x = 1.25 + rnd() * 0.2; c.a = alt + (rnd() - 0.5) * 1.4; }
          const sx = c.x * W, sy = cy - (c.a - alt) * U * 3 * c.z;
          if (sy < -U || sy > api.H + U) continue;
          Art.cloud(ctx, sx, sy, U * 0.22 * c.s, c.z < 0.5 ? 0.35 : c.z < 0.9 ? 0.55 : 0.7);
        }

        /* ---------- solul (vizibil la altitudine mică), în parallax ---------- */
        const gy = cy + U * 0.75 + alt * U * 2.2;
        if (gy < api.H + U * 0.3) {
          const hills = (y0, amp, f, par, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, api.H); for (let x = 0; x <= api.W + 20; x += 20) ctx.lineTo(x, y0 - amp * (0.6 + 0.4 * Math.sin((x + scroll * par * 600) * f) * Math.sin((x + scroll * par * 600) * f * 0.37 + 1))); ctx.lineTo(api.W, api.H); ctx.closePath(); ctx.fill(); };
          hills(gy - U * 0.05, U * 0.22, 0.006, 0.15, '#86a9c9');
          hills(gy, U * 0.12, 0.011, 0.4, '#5f9a58');
          ctx.fillStyle = '#4c8a3c'; ctx.fillRect(0, gy + U * 0.04, api.W, api.H);
          ctx.fillStyle = '#545a64'; ctx.fillRect(0, gy + U * 0.1, api.W, U * 0.08);
          ctx.fillStyle = 'rgba(255,255,255,0.85)'; const per = U * 0.6; for (let x = -((scroll * 900) % per); x < api.W; x += per) ctx.fillRect(x, gy + U * 0.135, per * 0.45, U * 0.012);
          for (let i = 0; i < 9; i++) { const px = ((i * 173 - scroll * 520) % (api.W + 120) + api.W + 120) % (api.W + 120) - 60, ty = gy + U * 0.06; ctx.fillStyle = '#5a3d27'; ctx.fillRect(px - 2, ty - U * 0.05, 4, U * 0.05); Art.sphere(ctx, px, ty - U * 0.08, U * 0.05, '#3f8a45', { rim: false }); }
        }

        /* ---------- geometria avionului ---------- */
        const Lp = Math.min(W * 0.78, U * 1.75), chord = Lp * 0.3;
        const py = cy - U * 0.05 + (0.5 - alt) * U * 0.45 + Art.wobble(t, 2, U * 0.012) + buffet * Math.sin(t * 14) * U * 0.004;
        const a = aoaS * Math.PI / 180, wingLX = -Lp * 0.04, wingLY = Lp * 0.03;
        const cosA = Math.cos(-a), sinA = Math.sin(-a);
        const wcx = cx + (wingLX * cosA - wingLY * sinA), wcy = py + (wingLX * sinA + wingLY * cosA);

        /* ---------- curenți de aer care ocolesc profilul ---------- */
        const half = chord / 2;
        const flowY = (x, y0, tt, row) => {          // x relativ la aripă (față +x), y0 = distanța liniei
          const f = Math.exp(-Math.pow(y0 / (chord * 0.55), 2));
          const win = Math.exp(-Math.pow(x / (chord * 0.62), 4));
          const d = -x / (chord * 0.55), bump = Math.exp(-d * d), fall = 1 - Math.min(1, Math.abs(y0) / (U * 0.8));
          let y = y0 + Math.sin(a) * chord * 0.55 * d * bump * fall;                 // deviere (în spate aerul coboară)
          y += -x * Math.sin(a) * f * win;                                         // urmează aripa înclinată
          const xs = clamp(x, -half, half);
          if (y0 < 0) y -= (foilT(xs, chord) + foilCamber(xs, chord)) * f * win * 1.25; else y += (foilT(xs, chord) * 0.55) * f * win * 1.25;
          if (stall && y0 < 0 && x < half * 0.4) { const k = clamp((half * 0.4 - x) / chord, 0, 1.5); y -= k * U * 0.05 * f; y += Math.sin(x * 0.06 + tt * 12 + row) * U * 0.03 * k * (0.4 + f); }
          return y;
        };
        ctx.save(); ctx.lineCap = 'round';
        for (let i = -7; i <= 7; i++) {
          if (i === 0) continue;
          const y0 = i * U * 0.095, near = Math.exp(-Math.pow(y0 / (chord * 0.6), 2));
          const turb = stall && i < 0;
          const lg = ctx.createLinearGradient(0, 0, W, 0); const al = turb ? 0.3 : 0.32 + 0.3 * near;
          lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.15, 'rgba(255,255,255,' + al + ')'); lg.addColorStop(0.85, 'rgba(255,255,255,' + al + ')'); lg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = lg; ctx.lineWidth = 1.2 + near * 1.4;
                    ctx.beginPath();
          for (let sx = 0; sx <= W; sx += 7) { const yy = wcy + flowY(sx - wcx, y0, t, i); sx ? ctx.lineTo(sx, yy) : ctx.moveTo(sx, yy); }
          ctx.stroke();
        }
        ctx.setLineDash([]);
        /* particule de aer (picături luminoase pe linii) */
        for (const w of wind) {
          w.x -= dt * (0.3 + v * 1.3) * (0.7 + w.k * 0.6) * 0.6; if (w.x < -0.05) { w.x = 1.05; w.y = rnd(); }
          const sx = w.x * W, y0 = (w.y - 0.5) * U * 1.5; if (Math.abs(y0) < U * 0.05) continue;
          const yy = wcy + flowY(sx - wcx, y0, t, 0), y2 = wcy + flowY(sx - wcx + 10, y0, t, 0);
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, yy); ctx.lineTo(sx + 10 + v * 8, y2); ctx.stroke();
        }
        /* vârtejuri la angajare */
        if (buffet > 0.02) {
          for (let k = 0; k < 4; k++) {
            const ph = ((t * 0.7 * (0.5 + v) + k / 4) % 1), vx = wcx + half * 0.2 - ph * chord * 2.6, vyy = wcy - chord * 0.18 - ph * chord * 0.25 + Math.sin(k * 2) * chord * 0.05, rr = chord * (0.07 + ph * 0.12);
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.7 * buffet * (1 - ph)) + ')'; ctx.lineWidth = 2; ctx.beginPath();
            for (let j = 0; j <= 40; j++) { const an = j / 40 * TAU * 1.6 + t * 7, r = rr * (1 - j / 46); j ? ctx.lineTo(vx + Math.cos(an) * r, vyy + Math.sin(an) * r * 0.8) : ctx.moveTo(vx + Math.cos(an) * r, vyy + Math.sin(an) * r * 0.8); }
            ctx.stroke();
          }
        }
        ctx.restore();

        /* ---------- avionul ---------- */
        Art.groundShadow(ctx, cx, Math.min(gy + U * 0.12, api.H - 4), Lp * 0.45 * clamp(1 - alt * 4, 0, 1) + 1, U * 0.03, 0.35 * clamp(1 - alt * 5, 0, 1));
        ctx.save(); ctx.translate(cx, py); ctx.rotate(-a);
        drawPlane(Lp, chord, wingLX, wingLY, stall, t);
        ctx.restore();

        /* ---------- săgeți de forță ---------- */
        const F = Art.labelSize(U), LB = Art.LABEL_BG;
        const fa = (x, y, len, col, txt) => { Art.arrow(ctx, x, y, x, y + len, { color: col, width: Math.max(4, U * 0.022) }); Art.label(ctx, txt, x + U * 0.06, y + len * 0.6, { size: F, bg: LB, align: 'left', color: col }); };
        fa(wcx + U * 0.06, wcy - U * 0.03, -lift * U * 0.9, '#7dffb0', 'Portanță');
        fa(cx - Lp * 0.12, py + U * 0.05, MASS * U * 0.9, '#ff8a9a', 'Greutate');
        if (buffet > 0.3) Art.label(ctx, 'angajare!', wcx - chord * 0.6, wcy - chord * 0.55, { size: F, color: '#ffb0a0', bg: 'rgba(80,10,10,0.8)' });

        /* ---------- instrumente ---------- */
        Art.label(ctx, 'avionul zboară spre dreapta →', cx, cy - U + F * 1.2, { size: F, bg: LB });
        const pw = Math.max(150, F * 11), pX = 12, pY = cy - U + F * 2.6;
        Art.panel(ctx, pX, pY, pw, F * 3.4, { r: 12 });
        Art.text(ctx, 'Altitudine: ' + fmt(alt * 12000, 0) + ' m', pX + 12, pY + F * 1.05, { size: F, align: 'left', halo: false });
        Art.text(ctx, 'Unghi: ' + fmt(aoa, 0) + '°', pX + 12, pY + F * 2.4, { size: F, align: 'left', halo: false, color: stall ? '#ffb0a0' : '#f4f7ff' });
        Art.meter(ctx, pX + pw - 22, pY + 8, 10, F * 3.4 - 16, 0, '#7dffb0');
        ctx.fillStyle = '#7dffb0'; const mh = (F * 3.4 - 16) * alt; Art.roundRectPath(ctx, pX + pw - 22, pY + 8 + (F * 3.4 - 16) - mh, 10, Math.max(4, mh), 5); ctx.fill();

        info.innerHTML = lift > MASS * 1.04 ? '⬆️ <b>Urcă</b> (portanța > greutate)' : lift < MASS * 0.96 ? '⬇️ <b>Coboară</b> (portanța < greutate)' : '➡️ <b>Zbor orizontal</b>';
        if (stall) info.innerHTML += ' · <b style="color:#ff8a8a">angajare!</b>';
      }
      return { frame: frame };
    }
  });
})();
