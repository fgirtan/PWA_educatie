/* Modul: Vulcani — stratovulcan ilustrat în secțiune: straturi, cameră magmatică, erupție cu lavă, cenușă și bombe */
(function () {
  const A = window.Art;
  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const N1 = A.noise1, N2 = A.noise2;

  /* norișor de cenușă / fum (sprite pre-randat, umbrit natural: lumină sus-stânga) */
  function puff(dark) {
    return A.cached(dark ? 'vo-puff-d' : 'vo-puff', 96, 96, (c, w) => {
      const h = w / 2;
      for (const [dx, dy, r] of [[0, 0, 0.62], [-0.3, 0.1, 0.42], [0.28, 0.08, 0.45], [0.05, -0.25, 0.42]]) {
        const g = c.createRadialGradient(h + (dx - 0.12) * h, h + (dy - 0.15) * h, 0, h + dx * h, h + dy * h, r * h);
        if (dark) { g.addColorStop(0, 'rgba(120,112,112,0.95)'); g.addColorStop(0.6, 'rgba(70,64,66,0.85)'); g.addColorStop(1, 'rgba(50,46,48,0)'); }
        else { g.addColorStop(0, 'rgba(206,202,200,0.95)'); g.addColorStop(0.6, 'rgba(150,144,146,0.8)'); g.addColorStop(1, 'rgba(120,116,118,0)'); }
        c.fillStyle = g; c.beginPath(); c.arc(h + dx * h, h + dy * h, r * h, 0, TAU); c.fill();
      }
    });
  }
  /* magmă: textură de rocă topită care curge */
  function magmaTex() {
    return A.cached('vo-magma', 128, 64, (c, w, h) => {
      const d = c.createImageData(w, h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const u = i / w * TAU, n = N2(Math.cos(u) * 1.5 + 3, Math.sin(u) * 1.5 + j * 0.06) * 0.6 + N2(Math.cos(u) * 4, Math.sin(u) * 4 + j * 0.15) * 0.35, o = (j * w + i) * 4;
        const k = clamp(0.55 + n, 0, 1);
        d.data[o] = 255; d.data[o + 1] = Math.round(lerp(70, 200, k)); d.data[o + 2] = Math.round(lerp(20, 70, k)); d.data[o + 3] = 255;
      }
      c.putImageData(d, 0, 0);
    });
  }

  /* ============================================================
     3) VULCANI
     ============================================================ */
  defineModule({
    id: 'volcano', title: 'Vulcani', sub: 'Cum se pregătește și cum explodează un vulcan',
    start: function (api) {
      const ctx = api.ctx;
      let visc = 0.6, gas = 0.6, press = 0, erupt = 0, parts = [], ash = [], lava = [], bombs = [], shake = 0, flow = 0, ptime = 0, dark = 0, needle = 0;
      const r1 = api.row('Tipul magmei');
      api.slider(r1, { label: 'Vâscozitate', min: 0, max: 1, step: 0.01, value: visc, fmt: (v) => v < 0.35 ? 'fluidă' : v < 0.7 ? 'medie' : 'groasă', onInput: (v) => { visc = v; typeSay(); } });
      api.slider(r1, { label: 'Gaze în magmă', min: 0, max: 1, step: 0.01, value: gas, fmt: (v) => v < 0.35 ? 'puține' : v < 0.7 ? 'medii' : 'multe', onInput: (v) => { gas = v; typeSay(); } });
      const r2 = api.row('');
      const bE = api.button(r2, '🔥 Pornește erupția', () => { if (!erupt) { press = Math.max(press, 0.02); ptime = 1; } api.say('Magma se adună în cameră. Presiunea crește…', 5000); });
      api.button(r2, '🌊 Hawaii', () => preset(0.1, 0.15, 'Hawaii (Kilauea): lavă fluidă care curge în râuri — erupție „blândă”, efuzivă.'));
      api.button(r2, '🏔️ Vezuviu', () => preset(0.75, 0.8, 'Vezuviu (79 d.Hr.): magmă groasă și plină de gaze — explozie cu nor de cenușă care a îngropat Pompeii.'));
      api.button(r2, '💥 Krakatoa', () => preset(0.95, 1, 'Krakatoa (1883): una din cele mai puternice explozii din istorie; s-a auzit la 4.800 km distanță.'));
      const sl = api.slider(r2, { label: 'Presiunea din cameră', min: 0, max: 1, step: 0.01, value: 0, fmt: (v) => Math.round(v * 100) + '%', onInput: (v) => { press = v; ptime = 0; } });
      function preset(v, g, txt) { visc = v; gas = g; api.say(txt, 9000); }
      function explosive() { return visc * 0.5 + gas * 0.5; }
      function typeSay() { api.say(explosive() > 0.55 ? '<b>Magmă groasă + gaze</b> = gazele nu pot scăpa și se adună ca într-o sticlă de suc scuturată… la erupție — <b>explozie</b>!' : '<b>Magmă fluidă</b>: gazele scapă ușor, deci lava curge liniștit pe pantă — erupție <b>efuzivă</b>.', 6000); }
      api.say('Alege tipul de magmă și apasă <b>Pornește erupția</b>. Vezi cum crește presiunea în camera magmatică!', 8000);

      /* fundalul static: cer, dealuri îndepărtate, sol în secțiune cu straturi de rocă */
      function scene(W, H, gy, U) {
        return A.cached('vo-scene-' + Math.round(gy) + '-' + Math.round(U), W, H, (c, w, h) => {
          const g = c.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, '#6c9ccc'); g.addColorStop(0.7, '#b6d2e6'); g.addColorStop(1, '#dbe6ea'); c.fillStyle = g; c.fillRect(0, 0, w, gy + 2);
          /* dealuri îndepărtate, desaturate */
          for (const [k, col, amp] of [[0, '#a9b8b4', 0.22], [1, '#8fa294', 0.13]]) {
            c.fillStyle = col; c.beginPath(); c.moveTo(0, gy);
            for (let x = 0; x <= w; x += 8) c.lineTo(x, gy - U * (amp * 0.5 + amp * 0.5 * (0.5 + 0.5 * N1(x / U * 1.6 + k * 7))));
            c.lineTo(w, gy); c.closePath(); c.fill();
          }
          /* straturi de rocă sub sol */
          const lay = ['#6b5a45', '#7d6a52', '#5e4f42', '#8a765c', '#54463c', '#6a5848', '#4a3e36', '#5a4a40'];
          let y = gy; const bh = (h - gy) / lay.length;
          for (let i = 0; i < lay.length; i++) {
            const y0 = y, y1 = gy + bh * (i + 1) + (i === lay.length - 1 ? 50 : 0);
            c.fillStyle = lay[i]; c.beginPath(); c.moveTo(0, y0);
            for (let x = 0; x <= w; x += 10) c.lineTo(x, (i ? y0 + N1(x / U * 2 + i * 3) * bh * 0.12 : y0));
            for (let x = w; x >= 0; x -= 10) c.lineTo(x, y1 + N1(x / U * 2 + (i + 1) * 3) * bh * 0.12);
            c.closePath(); c.fill(); y = y1;
          }
          /* granule de rocă */
          let sd = 3; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
          for (let i = 0; i < w * (h - gy) / 220; i++) { const x = rnd() * w, yy = gy + 6 + rnd() * (h - gy); c.fillStyle = rnd() < 0.5 ? 'rgba(255,240,220,0.12)' : 'rgba(0,0,0,0.14)'; c.beginPath(); c.ellipse(x, yy, 1 + rnd() * 3, 0.7 + rnd() * 1.5, rnd() * 3, 0, TAU); c.fill(); }
          /* sol cu iarbă */
          c.fillStyle = '#5f7a40'; c.fillRect(0, gy - 2, w, 6); c.fillStyle = '#3f5530'; c.fillRect(0, gy + 4, w, 3);
        });
      }

      function frame(dt, t) {
        const W = api.W, H = api.H, cx = api.cx, U = api.unit, gy = api.cy + U * 0.35, ex = explosive();
        if (ptime && !erupt) { press += dt * (0.12 + 0.1 * gas); sl.set(Math.min(1, press)); }
        const thr = 0.6 + 0.4 * visc;
        const vh = U * 0.8, vw = U * 1.15, craterW = 16 + 10 * (1 - visc), topY = gy - vh;
        if (press >= thr && !erupt) { erupt = 1; ptime = 0; shake = 1; api.say(ex > 0.55 ? '💥 <b>EXPLOZIE!</b> Cenușă, bombe vulcanice și nori fierbinți.' : '🌋 <b>Erupție!</b> Lava iese și curge pe pantă.', 7000); }
        if (erupt) {
          press = Math.max(0, press - dt * (ex > 0.55 ? 0.22 : 0.07)); sl.set(press);
          const n = ex > 0.55 ? 5 : 3;
          for (let i = 0; i < n; i++) {
            const a = -Math.PI / 2 + (Math.random() - 0.5) * (ex > 0.55 ? 0.8 : 0.35), sp = (ex > 0.55 ? 380 : 190) * (0.5 + Math.random()) * U / 300;
            parts.push({ x: cx + (Math.random() - 0.5) * craterW, y: topY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1 });
          }
          if (ex > 0.55) {
            if (Math.random() < dt * 30) ash.push({ x: cx + (Math.random() - 0.5) * craterW, y: topY, vx: (Math.random() - 0.5) * 30, vy: -(90 + Math.random() * 120) * U / 300, r: U * (0.07 + Math.random() * 0.05), life: 1, rot: Math.random() * TAU, dk: Math.random() < 0.5 });
            if (Math.random() < dt * 2.2) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.3, sp = (260 + Math.random() * 200) * U / 300; bombs.push({ x: cx, y: topY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: U * (0.012 + Math.random() * 0.012), trail: [], rot: 0 }); }
          }
          if (ex <= 0.55) flow = Math.min(1, flow + dt * 0.2);
          if (ex > 0.55 && Math.random() < dt * 5) lava.push({ x: cx, side: Math.random() < 0.5 ? -1 : 1, p: 0, s: Math.random() });
          if (press < 0.04) { erupt = 0; api.say('Erupția s-a oprit. Camera magmatică s-a golit și se va umple din nou în timp.', 7000); }
        } else flow = Math.max(0, flow - dt * 0.02);
        shake = Math.max(0, shake - dt * 0.9);
        dark = A.damp(dark, erupt && ex > 0.55 ? 1 : Math.min(0.6, ash.length / 80), 0.8, dt);
        needle = A.damp(needle, press, 6, dt);
        const sx = (erupt || (ptime && press > 0.3) ? (Math.random() - 0.5) * (2 + 10 * shake + press * 4) : 0), sy = sx * 0.6;
        ctx.save(); ctx.translate(sx, sy);
        ctx.drawImage(scene(W, H, gy, U), 0, 0);
        /* cerul se întunecă de cenușă */
        if (dark > 0.01) { const dg = ctx.createLinearGradient(0, 0, 0, gy); dg.addColorStop(0, A.rgba('#1e1a1e', 0.85 * dark)); dg.addColorStop(1, A.rgba('#4a4044', 0.6 * dark)); ctx.fillStyle = dg; ctx.fillRect(-10, -10, W + 20, gy + 10); }

        /* conul vulcanului: profil concav, lumină din stânga */
        const prof = (x) => { const d = clamp((Math.abs(x - cx) - craterW) / (vw - craterW), 0, 1); return gy - vh * Math.pow(1 - d, 1.55); };
        const conePath = () => { ctx.beginPath(); ctx.moveTo(cx - vw - 4, gy + 2); for (let k = 0; k <= 40; k++) { const x = cx - vw + (vw - craterW) * k / 40; ctx.lineTo(x, prof(x) + (k < 40 ? N1(k * 0.9) * U * 0.006 : 0)); } ctx.quadraticCurveTo(cx, topY + U * 0.05, cx + craterW, topY); for (let k = 40; k >= 0; k--) { const x = cx + vw - (vw - craterW) * k / 40; ctx.lineTo(x, prof(x) + (k < 40 ? N1(k * 0.9 + 9) * U * 0.006 : 0)); } ctx.lineTo(cx + vw + 4, gy + 2); ctx.closePath(); };
        conePath();
        const cg = ctx.createLinearGradient(cx - vw, 0, cx + vw, 0); cg.addColorStop(0, '#8a7666'); cg.addColorStop(0.45, '#6e5c50'); cg.addColorStop(1, '#3e322e'); ctx.fillStyle = cg; ctx.fill();
        ctx.save(); conePath(); ctx.clip();
        /* vegetație la poale */
        const vg = ctx.createLinearGradient(0, gy - vh * 0.35, 0, gy); vg.addColorStop(0, 'rgba(90,120,60,0)'); vg.addColorStop(1, 'rgba(90,120,60,0.75)'); ctx.fillStyle = vg; ctx.fillRect(cx - vw, gy - vh * 0.35, vw * 2, vh * 0.35);
        /* ravene (dâre radiale) */
        ctx.lineCap = 'round';
        for (let i = 0; i < 18; i++) { const s = (i / 17) * 2 - 1, xs = cx + s * craterW * 1.2, xe = cx + s * vw * 0.95 + N1(i * 3.1) * U * 0.04; ctx.strokeStyle = i % 3 ? 'rgba(30,22,20,0.22)' : 'rgba(255,240,220,0.12)'; ctx.lineWidth = 1 + (i % 2); ctx.beginPath(); ctx.moveTo(xs, topY + 4); ctx.quadraticCurveTo(lerp(xs, xe, 0.4) + N1(i) * 6, lerp(topY, gy, 0.45), xe, gy); ctx.stroke(); }
        /* secțiune prin con: straturi alternante de lavă și cenușă */
        ctx.beginPath(); ctx.moveTo(cx - craterW * 1.4, topY); ctx.lineTo(cx + craterW * 1.4, topY); ctx.lineTo(cx + U * 0.55, gy); ctx.lineTo(cx - U * 0.55, gy); ctx.closePath(); ctx.clip();
        const lc = ['#5a4238', '#8a7060', '#4a3a34', '#9a8270', '#3e302c', '#7a6052'];
        for (let k = 0; k <= 16; k++) { const off = k * U * 0.045; ctx.fillStyle = lc[k % lc.length]; ctx.beginPath(); ctx.moveTo(cx - vw * 1.2, prof(cx - vw * 1.2) + off); for (let q = 0; q <= 30; q++) { const x = cx - vw + 2 * vw * q / 30; ctx.lineTo(x, prof(x) + off + N1(q * 0.7 + k) * 2); } ctx.lineTo(cx + vw * 1.2, gy + 10); ctx.lineTo(cx - vw * 1.2, gy + 10); ctx.closePath(); ctx.fill(); }
        ctx.restore();
        ctx.strokeStyle = 'rgba(30,20,16,0.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx - craterW * 1.4, topY + 2); ctx.lineTo(cx - U * 0.55, gy); ctx.moveTo(cx + craterW * 1.4, topY + 2); ctx.lineTo(cx + U * 0.55, gy); ctx.stroke();

        /* camera magmatică și coșul */
        const chY = gy + U * 0.5, chR = U * 0.3, erx = chR * 1.8 * (0.92 + press * 0.08), ery = chR * 0.78 * (0.92 + press * 0.08);
        ctx.fillStyle = '#2e1e1a'; ctx.beginPath(); ctx.ellipse(cx, chY, erx + 6, ery + 5, 0, 0, TAU); ctx.fill();
        const cwid = Math.max(4, U * (0.032 + press * 0.014));
        ctx.beginPath(); ctx.moveTo(cx - cwid - 5, chY - ery * 0.6); ctx.bezierCurveTo(cx - cwid - 6, gy, cx - cwid * 0.6 - 4, topY + vh * 0.5, cx - cwid * 0.8 - 3, topY); ctx.lineTo(cx + cwid * 0.8 + 3, topY); ctx.bezierCurveTo(cx + cwid * 0.6 + 4, topY + vh * 0.5, cx + cwid + 6, gy, cx + cwid + 5, chY - ery * 0.6); ctx.closePath(); ctx.fillStyle = '#2e1e1a'; ctx.fill();
        const mt = magmaTex();
        const magmaFill = (path, scroll) => { ctx.save(); path(); ctx.clip(); const hh = (chY + ery) - topY, oy = (scroll % hh); for (let y = chY + ery - oy - hh; y < chY + ery + hh; y += hh - 1) ctx.drawImage(mt, cx - erx, y, erx * 2, hh); ctx.restore(); };
        const conduit = () => { ctx.beginPath(); ctx.moveTo(cx - cwid, chY - ery * 0.6); ctx.bezierCurveTo(cx - cwid, gy, cx - cwid * 0.6, topY + vh * 0.5, cx - cwid * 0.8, topY + 2); ctx.lineTo(cx + cwid * 0.8, topY + 2); ctx.bezierCurveTo(cx + cwid * 0.6, topY + vh * 0.5, cx + cwid, gy, cx + cwid, chY - ery * 0.6); ctx.closePath(); };
        magmaFill(conduit, t * (20 + (erupt ? 120 : press * 40)));
        const chamber = () => { ctx.beginPath(); ctx.ellipse(cx, chY, erx, ery, 0, 0, TAU); };
        magmaFill(chamber, t * 8);
        const sh = ctx.createRadialGradient(cx - erx * 0.2, chY - ery * 0.3, ery * 0.2, cx, chY, erx); sh.addColorStop(0, A.rgba('#fff2b0', 0.35 + press * 0.3)); sh.addColorStop(0.6, 'rgba(255,140,40,0)'); sh.addColorStop(1, 'rgba(120,20,6,0.65)');
        ctx.fillStyle = sh; chamber(); ctx.fill();
        /* rocă încălzită în jurul camerei (fenomenul: căldura magmei) */
        ctx.save(); ctx.translate(cx, chY); ctx.scale(1, ery / erx); const hg2 = ctx.createRadialGradient(0, 0, erx * 0.95, 0, 0, erx * 1.22); hg2.addColorStop(0, A.rgba('#ff7a2f', 0.25 + press * 0.3)); hg2.addColorStop(1, 'rgba(255,122,47,0)'); ctx.fillStyle = hg2; ctx.beginPath(); ctx.arc(0, 0, erx * 1.22, 0, TAU); ctx.fill(); ctx.restore();
        /* bule de gaz care urcă */
        for (let i = 0; i < 6 + gas * 18; i++) { const a = ((t * (0.25 + visc * -0.15 + 0.15) + i * 0.173) % 1), bx = cx + Math.sin(i * 9.1 + t) * cwid * 0.45, byy = chY - a * (chY - topY), br = Math.max(1, cwid * (0.12 + (i % 3) * 0.06)); ctx.fillStyle = 'rgba(255,244,200,0.75)'; ctx.beginPath(); ctx.arc(bx, byy, br, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(160,60,10,0.5)'; ctx.lineWidth = 0.8; ctx.stroke(); }
        /* craterul */
        ctx.fillStyle = '#2a201c'; ctx.beginPath(); ctx.ellipse(cx, topY + 1, craterW + 3, U * 0.018, 0, 0, TAU); ctx.fill();
        if (erupt || press > 0.4) { ctx.fillStyle = A.rgba('#ff8a2a', clamp(press * 1.4, 0.3, 1)); ctx.beginPath(); ctx.ellipse(cx, topY + 1, craterW * 0.8, U * 0.012, 0, 0, TAU); ctx.fill(); }

        /* râuri de lavă pe pantă (efuziv) */
        if (flow > 0 && ex <= 0.55 || erupt && ex <= 0.55) {
          for (const side of [-1, 1]) {
            const L = flow, n = 26, pts = [];
            for (let k = 0; k <= n; k++) { const f = k / n * L, x = cx + side * (craterW + (vw - craterW) * f + Math.sin(f * 9 + side) * U * 0.025 * f); pts.push([x, prof(x) - 1]); }
            if (pts.length < 2) continue;
            ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); A.smoothPath(ctx, pts); ctx.strokeStyle = '#4a2014'; ctx.lineWidth = Math.max(6, U * 0.035); ctx.stroke();
            ctx.strokeStyle = '#d8401a'; ctx.lineWidth = Math.max(4, U * 0.024); ctx.stroke();
            ctx.setLineDash([U * 0.03, U * 0.05]); ctx.lineDashOffset = -t * U * 0.08; ctx.strokeStyle = '#ffb040'; ctx.lineWidth = Math.max(2, U * 0.01); ctx.stroke(); ctx.setLineDash([]);
            ctx.restore();
            const e = pts[pts.length - 1]; ctx.fillStyle = '#ff7a2f'; A.blob(ctx, e[0], e[1] + 1, Math.max(4, U * 0.02), t, { amp: 0.25, seed: side + 3, sy: 0.6 }); ctx.fill();
          }
        }
        /* curgeri piroclastice (nori fierbinți pe pantă) */
        const pf = puff(true);
        for (let i = lava.length - 1; i >= 0; i--) { const l = lava[i]; l.p += dt * 0.5; if (l.p > 1) { lava.splice(i, 1); continue; } const x = cx + l.side * (craterW + (vw - craterW) * l.p), y = prof(x), r = U * (0.06 + l.p * 0.1); ctx.globalAlpha = 0.85 * (1 - l.p * 0.5); ctx.drawImage(pf, x - r, y - r * 1.2, r * 2, r * 2); ctx.globalAlpha = 1; }
        /* coloana de cenușă: urcă, se lățește și e dusă de vânt */
        for (let i = ash.length - 1; i >= 0; i--) {
          const a = ash[i]; const hgt = (gy - a.y) / (vh * 3);
          a.vx += (14 + hgt * 50) * dt * U / 300; a.vy *= Math.exp(-dt * 0.25); a.x += a.vx * dt; a.y += a.vy * dt; a.r += dt * U * 0.06; a.life -= dt * 0.1;
          if (a.life <= 0) { ash.splice(i, 1); continue; }
          ctx.globalAlpha = Math.min(1, a.life * 1.5) * 0.9; ctx.drawImage(puff(a.dk), a.x - a.r, a.y - a.r, a.r * 2, a.r * 2); ctx.globalAlpha = 1;
        }
        /* lavă aruncată (fântână) */
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]; p.vy += 420 * dt * U / 300; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 0.45;
          if (p.life <= 0 || p.y > prof(p.x) + 2) { parts.splice(i, 1); continue; }
          ctx.strokeStyle = 'rgba(255,' + Math.round(90 + 120 * p.life) + ',40,' + (p.life * 0.8).toFixed(2) + ')'; ctx.lineWidth = 1.5 + p.life * 2; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025); ctx.stroke();
        }
        if (parts.length > 500) parts.splice(0, 150);
        /* bombe vulcanice cu traiectorie */
        for (let i = bombs.length - 1; i >= 0; i--) {
          const b = bombs[i]; b.vy += 420 * dt * U / 300; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += dt * 4; b.trail.push([b.x, b.y]); if (b.trail.length > 18) b.trail.shift();
          if (b.y > Math.max(prof(b.x), b.x < cx - vw || b.x > cx + vw ? gy : 0) || b.y > H) { bombs.splice(i, 1); continue; }
          ctx.strokeStyle = 'rgba(80,70,70,0.45)'; ctx.lineWidth = 1.5; ctx.setLineDash([2, 4]); ctx.beginPath(); b.trail.forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); ctx.setLineDash([]);
          ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot); A.blob(ctx, 0, 0, b.r, 0, { amp: 0.3, seed: i % 5 }); ctx.fillStyle = '#3a302c'; ctx.fill(); ctx.fillStyle = '#ff7a2f'; ctx.beginPath(); ctx.arc(b.r * 0.2, b.r * 0.1, b.r * 0.35, 0, TAU); ctx.fill(); ctx.restore();
        }
        ctx.restore();

        /* manometru */
        const mr = Math.max(30, U * 0.11), mx = mr + 18, my = api.cy - U * 0.3;
        ctx.fillStyle = 'rgba(14,20,40,0.88)'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(200,210,230,0.6)'; ctx.lineWidth = 2; ctx.stroke();
        const a0 = Math.PI * 0.8, span = Math.PI * 1.4;
        for (const [f0, f1, col] of [[0, 0.55, '#4ade80'], [0.55, 0.8, '#ffcf4a'], [0.8, 1, '#ff5a6a']]) { ctx.strokeStyle = col; ctx.lineWidth = Math.max(3, mr * 0.12); ctx.beginPath(); ctx.arc(mx, my, mr * 0.78, a0 + span * f0, a0 + span * f1); ctx.stroke(); }
        const ang = a0 + clamp(needle, 0, 1) * span; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(ang) * mr * 0.7, my + Math.sin(ang) * mr * 0.7); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(mx, my, 3.5, 0, TAU); ctx.fill();
        const fsz = A.fs(U, 0.04, 13);
        A.text(ctx, 'presiune', mx, my + mr + fsz, { size: fsz });
        A.label(ctx, 'cameră magmatică', cx, chY + ery + fsz * 1.4 > api.cy + U - fsz ? chY : chY + ery + fsz * 1.4, { size: fsz });
        A.label(ctx, 'coș', cx + U * 0.2, gy + U * 0.16, { size: fsz, align: 'left', tx: cx + cwid, ty: gy + U * 0.16 });
        A.label(ctx, 'crater', cx, topY - fsz * 1.6, { size: fsz });
      }
      return { frame: frame };
    }
  });
})();
