/* Modul: Vulcani */
(function () {
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtN = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 0 : d });
  const mix = (c1, c2, t) => [0, 1, 2].map((i) => Math.round(lerp(c1[i], c2[i], clamp(t, 0, 1))));
  const rgb = (c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  function stars(n) { const a = []; for (let i = 0; i < n; i++) a.push([Math.random(), Math.random(), Math.random() * 1.4 + 0.3]); return a; }
  function drawStars(api, st) { api.ctx.fillStyle = 'rgba(255,255,255,0.65)'; for (const s of st) api.ctx.fillRect(s[0] * api.W, s[1] * api.H, s[2], s[2]); }

  /* ============================================================
     3) VULCANI
     ============================================================ */
  defineModule({
    id: 'volcano', title: 'Vulcani', sub: 'Cum se pregătește și cum explodează un vulcan',
    start: function (api) {
      const ctx = api.ctx;
      let visc = 0.6, gas = 0.6, press = 0, erupt = 0, parts = [], ash = [], lava = [], shake = 0, flow = 0, ptime = 0;
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

      /* tremur natural: unde netede cu frecvențe diferite (nu zgomot aleator la fiecare cadru) */
      const nz = (t, k, ph) => 0.5 * Math.sin(t * 6.7 * k + ph) + 0.3 * Math.sin(t * 11.9 * k + ph * 2.3 + 1.7) + 0.2 * Math.sin(t * 19.3 * k + ph * 0.6 + 0.4);
      function frame(dt, t) {
        const W = api.W, H = api.H, cx = api.cx, gy = api.cy + api.unit * 0.35, ex = explosive();
        if (ptime && !erupt) { press += dt * (0.12 + 0.1 * gas); sl.set(Math.min(1, press)); }
        const thr = 0.6 + 0.4 * visc;
        if (press >= thr && !erupt) { erupt = 1; ptime = 0; shake = 1; api.say(ex > 0.55 ? '💥 <b>EXPLOZIE!</b> Cenușă, bombe vulcanice și nori fierbinți.' : '🌋 <b>Erupție!</b> Lava iese și curge pe pantă.', 7000); }
        if (erupt) {
          press = Math.max(0, press - dt * (ex > 0.55 ? 0.22 : 0.07)); sl.set(press);
          const n = ex > 0.55 ? 7 : 3;
          for (let i = 0; i < n; i++) {
            const a = -Math.PI / 2 + (Math.random() - 0.5) * (ex > 0.55 ? 0.7 : 0.35), sp = (ex > 0.55 ? 380 : 190) * (0.5 + Math.random());
            parts.push({ x: cx, y: gy - api.unit * 0.8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, ember: 1 });
            if (ex > 0.55 && Math.random() < 0.7) ash.push({ x: cx + (Math.random() - 0.5) * 20, y: gy - api.unit * 0.8, vx: (Math.random() - 0.5) * 60, vy: -60 - Math.random() * 140, r: 14 + Math.random() * 20, life: 1 });
          }
          if (ex <= 0.55) flow = Math.min(1, flow + dt * 0.2);
          if (ex > 0.55 && Math.random() < dt * 5) lava.push({ x: cx, side: Math.random() < 0.5 ? -1 : 1, p: 0 });
          if (press < 0.04) { erupt = 0; api.say('Erupția s-a oprit. Camera magmatică s-a golit și se va umple din nou în timp.', 7000); }
        }
        shake = Math.max(0, shake - dt * 0.9);
        const shk = erupt || (ptime && press > 0.3) ? (3 + 11 * shake + press * 4) * 0.5 : 0, sx = nz(t, 1, 0.9) * shk * 1.6, sy = nz(t, 1.3, 3.1) * shk * 0.8;
        ctx.save(); ctx.translate(sx, sy);
        ctx.fillStyle = erupt && ex > 0.55 ? '#2a2830' : '#7ab6e8'; const sk = ctx.createLinearGradient(0, 0, 0, gy); sk.addColorStop(0, erupt && ex > 0.55 ? '#1a1820' : '#2c6aa8'); sk.addColorStop(1, erupt && ex > 0.55 ? '#4a4048' : '#bfe0f5'); ctx.fillStyle = sk; ctx.fillRect(-10, -10, W + 20, gy + 10);
        /* sol */
        const gs = ctx.createLinearGradient(0, gy, 0, H); gs.addColorStop(0, '#5a4636'); gs.addColorStop(0.4, '#3b2f28'); gs.addColorStop(1, '#241a16'); ctx.fillStyle = gs; ctx.fillRect(-10, gy, W + 20, H - gy + 10);
        /* conul vulcanului */
        const vh = api.unit * 0.8, vw = api.unit * 1.15, craterW = 16 + 10 * (1 - visc);
        const slope = (x) => Math.max(0, 1 - Math.abs(x - cx) / vw);
        ctx.fillStyle = '#6a5848'; ctx.beginPath(); ctx.moveTo(cx - vw, gy); ctx.lineTo(cx - craterW, gy - vh); ctx.lineTo(cx + craterW, gy - vh); ctx.lineTo(cx + vw, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.moveTo(cx, gy - vh); ctx.lineTo(cx + craterW, gy - vh); ctx.lineTo(cx + vw, gy); ctx.lineTo(cx, gy); ctx.closePath(); ctx.fill();
        /* secțiune: coș + cameră */
        const chY = gy + api.unit * 0.55, chR = api.unit * 0.3;
        ctx.fillStyle = '#2a1a16'; ctx.fillRect(cx - chR * 1.9, gy, chR * 3.8, H);
        ctx.fillStyle = '#2a1a16'; ctx.beginPath(); ctx.ellipse(cx, chY, chR * 1.9, chR, 0, 0, 7); ctx.fill();
        const gm = ctx.createRadialGradient(cx, chY, 5, cx, chY, chR * 1.8); gm.addColorStop(0, 'rgb(255,' + Math.round(200 - press * 130) + ',60)'); gm.addColorStop(1, '#a22a0c');
        ctx.fillStyle = gm; ctx.beginPath(); ctx.ellipse(cx, chY, chR * 1.8 * (0.9 + press * 0.1), chR * 0.85 * (0.9 + press * 0.1), 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#e8501c'; ctx.fillRect(cx - 9 - press * 4, gy - vh + 2, 18 + press * 8, chY - (gy - vh) - 2);
        /* bule de gaz care urcă */
        for (let i = 0; i < 6 + gas * 18; i++) { const a = ((t * (0.25 + visc * -0.15 + 0.15) + i * 0.173) % 1), bx = cx + Math.sin(i * 9.1 + t) * 8, by = chY - a * (chY - (gy - vh)); ctx.fillStyle = 'rgba(255,240,180,0.65)'; ctx.beginPath(); ctx.arc(bx, by, 2 + (i % 3), 0, 7); ctx.fill(); }
        /* râuri de lavă pe pantă (efuziv) */
        if (flow > 0 && ex <= 0.55 || erupt && ex <= 0.55) {
          ctx.strokeStyle = 'rgba(255,100,30,0.95)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
          for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + side * craterW, gy - vh); const L = flow; ctx.lineTo(cx + side * (craterW + (vw - craterW) * L), gy - vh + vh * L); ctx.stroke(); }
        }
        /* curgeri piroclastice */
        for (let i = lava.length - 1; i >= 0; i--) { const l = lava[i]; l.p += dt * 0.55; if (l.p > 1) { lava.splice(i, 1); continue; } const lx = cx + l.side * (craterW + (vw - craterW) * l.p), ly = gy - vh + vh * l.p; ctx.fillStyle = 'rgba(70,60,60,' + (0.8 * (1 - l.p * 0.4)).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(lx, ly - 8, 14 + l.p * 20, 0, 7); ctx.fill(); }
        /* cenușa */
        for (let i = ash.length - 1; i >= 0; i--) { const a = ash[i]; a.x += a.vx * dt; a.y += a.vy * dt; a.r += dt * 18; a.life -= dt * 0.18; if (a.life <= 0) { ash.splice(i, 1); continue; } ctx.fillStyle = 'rgba(70,64,68,' + (0.5 * a.life).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 7); ctx.fill(); }
        for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.vy += 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 0.45; if (p.life <= 0 || p.y > gy + 20) { parts.splice(i, 1); continue; } ctx.fillStyle = 'rgba(255,' + Math.round(80 + 120 * p.life) + ',40,' + p.life.toFixed(2) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.5 + p.life * 2, 0, 7); ctx.fill(); }
        if (parts.length > 700) parts.splice(0, 200);
        /* manometru */
        ctx.restore();
        const mx = 48, my = api.cy - api.unit * 0.3, mr = 30; ctx.fillStyle = 'rgba(10,16,38,0.85)'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill(); ctx.strokeStyle = '#7ec8ff'; ctx.lineWidth = 2; ctx.stroke();
        const ang = Math.PI * 0.8 + press * Math.PI * 1.4; ctx.strokeStyle = press > thr * 0.85 ? '#ff6a5a' : '#ffd166'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(ang) * (mr - 6), my + Math.sin(ang) * (mr - 6)); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('presiune', mx, my + mr + 14);
        ctx.font = '600 12px system-ui,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillText('cameră magmatică', cx, chY + 4); ctx.fillText('coș', cx + 32, gy + api.unit * 0.18); ctx.fillText('crater', cx, gy - vh - 12);
      }
      return { frame: frame };
    }
  });
})();
