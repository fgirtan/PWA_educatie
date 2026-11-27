/* Modul: Racheta — acțiune și reacțiune */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  defineModule({
    id: 'rocketphys', title: 'Racheta: acțiune și reacțiune', sub: 'De ce zboară un balon, o rachetă și un copil pe skateboard',
    start: function (api) {
      const ctx = api.ctx; let mode = 'balloon', st = 0, bal = null, thrust = 0.6, fuel = 1, ry = 0, rv = 0, launched = false, sk = { x: 0, v: 0, balls: [] };
      const rm = api.row(''), bs = {};
      [['balloon', '🎈 Balonul'], ['rocket', '🚀 Racheta'], ['skate', '🛹 Skateboardul']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const rb = api.row(''), rr = api.row(''), rs = api.row('');
      api.button(rb, '🎈 Umflă și dă drumul', () => { bal = { x: 500, y: 420, vx: 0, vy: 0, a: -Math.PI / 2, air: 1 }; });
      api.slider(rr, { label: 'Puterea motorului', min: 0, max: 1, step: 0.01, value: thrust, fmt: (v) => Math.round(v * 100) + '%', onInput: (v) => { thrust = v; } });
      api.button(rr, '🔥 Lansează', () => { launched = true; ry = 0; rv = 0; fuel = 1; });
      api.button(rr, '⟲ Pe rampă', () => { launched = false; ry = 0; rv = 0; fuel = 1; });
      api.button(rs, '🏀 Aruncă o minge înapoi', () => { sk.balls.push({ rx: -50, y: -110, vx: -220, vy: -120 }); sk.v += 45; });
      api.button(rs, '⟲ De la capăt', () => { sk = { x: 0, v: 0, balls: [] }; });
      const MSG = { balloon: 'Umflă un balon și dă-i drumul: aerul iese în spate, iar balonul zboară în față! Asta e <b>legea acțiunii și reacțiunii</b>: dacă împingi ceva într-o parte, ești împins în partea cealaltă.', rocket: 'Racheta funcționează la fel ca balonul: arde combustibil și aruncă gaze fierbinți <b>în jos</b>, foarte repede, iar gazele împing racheta <b>în sus</b>. Dacă motorul împinge <b>mai tare decât greutatea</b> rachetei, ea decolează. Încearcă cu putere mică și cu putere mare!', skate: 'Stai pe un skateboard și arunci o minge grea <b>înapoi</b>. Ce se întâmplă? Tu mergi <b>înainte</b>! Cu cât arunci mai multe mingi, cu atât mergi mai repede. Așa merge și o rachetă în spațiu, unde nu are de ce să se sprijine.' };
      function setMode(m) { mode = m; st = 0; for (const k in bs) bs[k].classList.toggle('on', k === m); rb.style.display = m === 'balloon' ? '' : 'none'; rr.style.display = m === 'rocket' ? '' : 'none'; rs.style.display = m === 'skate' ? '' : 'none'; api.say(MSG[m]); api.layout(); }
      const ps = A.particles(500);
      setMode('balloon');
      return {
        frame: function (dt, t) {
          st += dt;
          if (mode === 'rocket' && launched) { A.scene(ctx, api.W, api.H, 'day'); const k = clamp(ry / 900, 0, 1); ctx.fillStyle = 'rgba(5,8,25,' + k + ')'; ctx.fillRect(0, 0, api.W, api.H); } else A.scene(ctx, api.W, api.H, mode === 'balloon' ? 'lab' : 'day');
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          if (mode === 'balloon') {
            ctx.fillStyle = '#3a3256'; ctx.fillRect(0, 520, 1000, 80);
            if (!bal) { ctx.save(); ctx.translate(500, 400); A.sphere(ctx, 0, -40, 60, '#ff4d6d', { rim: false }); ctx.fillStyle = '#d0304a'; ctx.beginPath(); ctx.moveTo(-8, 18); ctx.lineTo(8, 18); ctx.lineTo(0, 30); ctx.fill(); ctx.restore(); A.text(ctx, 'Apasă „Umflă și dă drumul”', 500, 520 + 40, { size: 18 }); }
            else {
              if (bal.air > 0) { bal.air -= dt * 0.35; const f = 600 * bal.air; bal.a += Math.sin(t * 9) * dt * 3; bal.vx += Math.cos(bal.a) * f * dt; bal.vy += Math.sin(bal.a) * f * dt; for (let i = 0; i < 3; i++) ps.emit({ x: bal.x - Math.cos(bal.a) * 50 * (0.4 + bal.air * 0.6), y: bal.y - Math.sin(bal.a) * 50 * (0.4 + bal.air * 0.6), vx: -Math.cos(bal.a + (Math.random() - 0.5) * 0.5) * 300, vy: -Math.sin(bal.a + (Math.random() - 0.5) * 0.5) * 300, size: 4, grow: 10, life: 0.5, color: '#cfe6ff', drag: 3 }); }
              else bal.vy += 300 * dt;
              bal.vx *= Math.exp(-1.2 * dt); bal.vy *= Math.exp(-1.2 * dt); bal.x += bal.vx * dt; bal.y += bal.vy * dt;
              if (bal.x < 60 || bal.x > 940) { bal.vx *= -0.6; bal.x = clamp(bal.x, 60, 940); bal.a = Math.PI - bal.a; } if (bal.y < 60) { bal.vy *= -0.6; bal.y = 60; bal.a = -bal.a; } if (bal.y > 500) { bal.y = 500; bal.vy = 0; bal.vx *= 0.8; }
              ps.update(dt); ps.draw(ctx);
              const s = 0.4 + Math.max(0, bal.air) * 0.6; ctx.save(); ctx.translate(bal.x, bal.y); ctx.rotate(bal.a + Math.PI / 2); A.sphere(ctx, 0, 0, 60 * s, '#ff4d6d', { rim: false }); ctx.fillStyle = '#d0304a'; ctx.beginPath(); ctx.moveTo(-8, 58 * s); ctx.lineTo(8, 58 * s); ctx.lineTo(0, 70 * s); ctx.fill(); ctx.restore();
              if (bal.air > 0) { A.arrow(ctx, bal.x - Math.cos(bal.a) * 70, bal.y - Math.sin(bal.a) * 70, bal.x - Math.cos(bal.a) * 150, bal.y - Math.sin(bal.a) * 150, { color: '#9fd8ff', width: 4 }); A.arrow(ctx, bal.x + Math.cos(bal.a) * 70, bal.y + Math.sin(bal.a) * 70, bal.x + Math.cos(bal.a) * 150, bal.y + Math.sin(bal.a) * 150, { color: '#7dffb0', width: 4 }); }
              A.label(ctx, '🔵 aerul iese în spate  →  🟢 balonul merge în față', 500, 60, { size: 16 });
            }
          } else if (mode === 'rocket') {
            const W0 = 0.5, F = launched && fuel > 0 ? thrust : 0, a = (F - W0) * 420 + (ry > 0 ? 0 : 0);
            if (launched) { if (fuel > 0) fuel -= dt * 0.08; if (ry > 0 || F > W0) { rv += a * dt; ry = Math.max(0, ry + rv * dt); if (ry <= 0) { rv = 0; } } }
            const gy = 520 + Math.min(ry, 2000) * 1; ctx.fillStyle = '#6aa84f'; if (gy < 640) ctx.fillRect(-300, gy, 1600, 300);
            const cy = clamp(420 - ry, 160, 420);
            if (F > 0) for (let i = 0; i < 5; i++) ps.emit({ x: 500 + (Math.random() - 0.5) * 20, y: cy + 110, vx: (Math.random() - 0.5) * 120, vy: 300 + Math.random() * 200 - rv * 0.3, size: 8 + Math.random() * 8, grow: 25, life: 1.2, color: Math.random() < 0.4 ? '#ffb040' : '#e8e8ee', drag: 1.5 });
            ps.update(dt); ps.draw(ctx);
            ctx.save(); ctx.translate(500, cy); ctx.fillStyle = '#eef1f6'; ctx.beginPath(); ctx.moveTo(0, -110); ctx.quadraticCurveTo(40, -60, 34, 60); ctx.lineTo(-34, 60); ctx.quadraticCurveTo(-40, -60, 0, -110); ctx.fill(); ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(-34, 30); ctx.lineTo(-64, 95); ctx.lineTo(-30, 80); ctx.fill(); ctx.beginPath(); ctx.moveTo(34, 30); ctx.lineTo(64, 95); ctx.lineTo(30, 80); ctx.fill(); ctx.fillStyle = '#3a6ad0'; ctx.beginPath(); ctx.arc(0, -30, 16, 0, TAU); ctx.fill(); ctx.fillStyle = '#5b6577'; ctx.fillRect(-24, 60, 48, 22);
            if (F > 0) { const fl = 60 + F * 90 + Math.sin(t * 40) * 8; const fg = ctx.createLinearGradient(0, 82, 0, 82 + fl); fg.addColorStop(0, '#fffbe0'); fg.addColorStop(0.4, '#ffc34a'); fg.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-22, 82); ctx.quadraticCurveTo(-26, 82 + fl * 0.5, 0, 82 + fl); ctx.quadraticCurveTo(26, 82 + fl * 0.5, 22, 82); ctx.fill(); }
            ctx.restore();
            A.arrow(ctx, 640, cy, 640, cy - F * 220, { color: '#7dffb0', width: 7 }); A.text(ctx, 'împingerea: ' + Math.round(F * 100) + '%', 700, cy - F * 220 - 18, { size: 16, color: '#b0ffcc' });
            A.arrow(ctx, 360, cy, 360, cy + W0 * 220, { color: '#ff5a6a', width: 7 }); A.text(ctx, 'greutatea: 50%', 300, cy + W0 * 220 + 22, { size: 16, color: '#ffb0b8' });
            A.label(ctx, 'Înălțime: ' + Math.round(ry * 0.5) + ' m', 150, 80, { size: 16 }); A.text(ctx, 'combustibil', 150, 130, { size: 14 }); A.meter(ctx, 80, 145, 140, 14, fuel, '#ffb43d');
            if (launched && F <= W0 && ry <= 0) A.label(ctx, '😕 Prea slab: împingerea e mai mică decât greutatea', 500, 560, { size: 16, color: '#ffe08a' });
          } else {
            sk.v *= Math.exp(-0.25 * dt); sk.x += sk.v * dt;
            const gy = 470, off = sk.x; ctx.fillStyle = '#8a8f98'; ctx.fillRect(-300, gy + 30, 1600, 200); ctx.fillStyle = '#fff'; for (let i = 0; i < 14; i++) ctx.fillRect(((i * 120 - off) % 1680 + 1680) % 1680 - 340, gy + 70, 60, 6);
            const kx = 380; ctx.fillStyle = '#c0392b'; A.roundRectPath(ctx, kx - 70, gy + 6, 140, 14, 7); ctx.fill(); ctx.fillStyle = '#222'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(kx + s * 45, gy + 28, 10, 0, TAU); ctx.fill(); }
            ctx.strokeStyle = '#3a4a6a'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(kx - 20, gy); ctx.lineTo(kx - 10, gy - 70); ctx.lineTo(kx + 20, gy); ctx.stroke(); ctx.fillStyle = '#ff6a5a'; A.roundRectPath(ctx, kx - 30, gy - 150, 60, 85, 18); ctx.fill(); ctx.fillStyle = '#f2c09a'; ctx.beginPath(); ctx.arc(kx, gy - 175, 26, 0, TAU); ctx.fill(); ctx.fillStyle = '#5a3a1a'; ctx.beginPath(); ctx.arc(kx, gy - 182, 26, Math.PI, TAU); ctx.fill();
            const throwing = sk.balls.length && sk.balls[sk.balls.length - 1].rx > -160; ctx.strokeStyle = '#f2c09a'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(kx - 20, gy - 135); ctx.lineTo(throwing ? kx - 80 : kx - 30, throwing ? gy - 120 : gy - 90); ctx.stroke();
            for (const b of sk.balls) { b.vy += 500 * dt; b.rx += (b.vx - sk.v) * dt; b.y += b.vy * dt; if (b.y > 20) { b.y = 20; b.vy *= -0.4; b.vx *= 0.6; } A.sphere(ctx, kx + b.rx, gy + b.y - 10, 18, '#ff8a3a'); }
            sk.balls = sk.balls.filter((b) => b.rx > -kx - 400);
            if (sk.v > 5) A.arrow(ctx, kx + 90, gy - 100, kx + 90 + Math.min(200, sk.v * 1.5), gy - 100, { color: '#7dffb0', width: 6 });
            A.label(ctx, 'Viteza: ' + Math.round(sk.v / 10) + ' km/h', 800, 100, { size: 17 });
            A.text(ctx, '🔵 mingea merge înapoi  →  🟢 copilul merge înainte', 500, 560, { size: 16 });
          }
          ctx.restore();
        }
      };
    }
  });
})();
