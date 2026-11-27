/* Modul: Magneții */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const emoji = (ctx, e, x, y, s, rot) => { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.font = s + 'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, 0, 0); ctx.restore(); };
  function bar(ctx, x, y, a, flip, len) {
    len = len || 180; ctx.save(); ctx.translate(x, y); ctx.rotate(a); const h = 54;
    ctx.fillStyle = flip ? '#3a6ad0' : '#e8394f'; A.roundRectPath(ctx, -len / 2, -h / 2, len / 2, h, 8); ctx.fill(); ctx.fillStyle = flip ? '#e8394f' : '#3a6ad0'; A.roundRectPath(ctx, 0, -h / 2, len / 2, h, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = A.font(26, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(flip ? 'S' : 'N', -len / 4, 2); ctx.fillText(flip ? 'N' : 'S', len / 4, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-len / 2 + 6, -h / 2 + 5, len - 12, 8); ctx.restore();
  }
  const ITEMS = [['📎', 'agrafă', true], ['🔩', 'șurub', true], ['🪙', 'monedă', false], ['🥄', 'lingură de oțel', true], ['✏️', 'creion', false], ['🧸', 'ursuleț', false], ['🔑', 'cheie', true], ['🧦', 'șosetă', false]];
  defineModule({
    id: 'magnets', title: 'Magneții', sub: 'Se atrag, se resping și arată Nordul',
    start: function (api) {
      const ctx = api.ctx; let mode = 'two', m2 = { x: 680, y: 300, vx: 0 }, flip = false, mag = { x: 500, y: 140 }, its = [], comp = 0, drag = null;
      const rm = api.row(''), bs = {};
      [['two', '🧲 Doi magneți'], ['pick', '📎 Ce atrage magnetul?'], ['earth', '🧭 Busola și Pământul']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const r2 = api.row('');
      api.button(r2, '🔄 Întoarce magnetul', () => { flip = !flip; });
      const MSG = { two: 'Fiecare magnet are doi poli: <b>Nord (N)</b> și <b>Sud (S)</b>. Polii <b>diferiți se atrag</b> (N cu S), iar polii <b>la fel se resping</b> (N cu N, S cu S). Trage magnetul din dreapta sau întoarce-l!', pick: 'Magnetul atrage doar lucrurile care conțin <b>fier</b> (sau oțel). Hârtia, lemnul, plasticul și majoritatea monedelor nu sunt atrase. Trage magnetul deasupra obiectelor!', earth: 'Și <b>Pământul e un magnet uriaș</b>! Acul busolei e un magnet mic care se întoarce mereu spre <b>Nord</b>. Așa se orientau marinarii pe mare, chiar și noaptea sau pe ceață.' };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); r2.style.display = m === 'two' ? '' : 'none'; api.say(MSG[m]); if (m === 'pick') { its = ITEMS.map((q, i) => ({ q: q, x: 130 + i * 105, y: 500, hx: 130 + i * 105, stuck: false })); mag = { x: 500, y: 140 }; } api.layout(); }
      let V = null;
      api.pointer({ down: (x, y) => { if (!V) return; const p = V.inv(x, y); drag = p; }, move: (x, y) => { if (!V || !drag) return; const p = V.inv(x, y); if (mode === 'two') { m2.x = clamp(p[0], 420, 920); m2.vx = 0; } else if (mode === 'pick') { mag.x = clamp(p[0], 80, 920); mag.y = clamp(p[1], 80, 480); } else comp = Math.atan2(p[1] - 300, p[0] - 500); }, up: () => { drag = null; } });
      setMode('two');
      return {
        frame: function (dt, t) {
          A.scene(ctx, api.W, api.H, 'lab');
          V = window.Fit(api, 1000, 600); ctx.save(); V.apply(ctx);
          if (mode === 'two') {
            const m1x = 300, y = 300, d = m2.x - m1x - 180, attract = flip ? -1 : 1;     // m1: N stânga, S dreapta; m2 normal: N stânga → S-N se atrag
            if (!drag) { const f = attract * 9000 / Math.max(30, d) / Math.max(30, d) * 60; m2.vx += -f * dt * 10; m2.vx *= Math.exp(-3 * dt); m2.x = clamp(m2.x + m2.vx * dt, m1x + 180, 940); if (m2.x <= m1x + 180) m2.vx = 0; }
            /* liniile câmpului */
            ctx.strokeStyle = 'rgba(180,200,255,0.3)'; ctx.lineWidth = 1.5;
            for (let i = -4; i <= 4; i++) { if (!i) continue; const k = i * 26; ctx.beginPath(); if (attract > 0 && d < 260) { ctx.moveTo(m1x + 90, y + k * 0.3); ctx.bezierCurveTo(m1x + 90 + d * 0.3, y + k, m2.x - 90 - d * 0.3, y + k, m2.x - 90, y + k * 0.3); } else { ctx.moveTo(m1x + 90, y); ctx.bezierCurveTo(m1x + 90 + 60, y + k * 4, m1x - 90 - 60, y + k * 4, m1x - 90, y); } ctx.stroke(); }
            for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, r = 120 + (i % 3) * 20; ctx.fillStyle = 'rgba(200,200,210,0.5)'; ctx.fillRect(m1x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r * 0.8, 6, 2); }
            bar(ctx, m1x, y, 0, false); bar(ctx, m2.x, y, 0, flip);
            if (d < 200) { const s = attract > 0 ? 'Se atrag! 🤝 (S lângă N)' : 'Se resping! 🙅 (N lângă N)'; A.label(ctx, s, (m1x + m2.x) / 2, y - 90, { size: 19, color: attract > 0 ? '#b0ffcc' : '#ffb0b8' }); A.arrow(ctx, m2.x - 100, y + 60, m2.x - 100 - 50 * attract, y + 60, { color: attract > 0 ? '#7dffb0' : '#ff5a6a', width: 5 }); }
            A.text(ctx, '👆 Trage magnetul din dreapta', 650, 520, { size: 16, color: 'rgba(255,255,255,0.75)' });
          } else if (mode === 'pick') {
            ctx.fillStyle = '#5a4632'; ctx.fillRect(40, 530, 920, 30);
            for (const it of its) {
              const dx = mag.x - it.x, dy = mag.y + 40 - it.y, d = Math.hypot(dx, dy);
              if (it.q[2] && (it.stuck || d < 170)) { it.stuck = true; it.x = lerp(it.x, mag.x + (it.hx - 500) * 0.06, dt * 8); it.y = lerp(it.y, mag.y + 55 + (its.indexOf(it) % 3) * 6, dt * 8); }
              else if (!it.q[2]) { it.y = lerp(it.y, 500, dt * 5); if (d < 170) it.x = it.hx + Math.sin(t * 20) * 1.5; }
              if (it.stuck && d > 300) it.stuck = false;
              emoji(ctx, it.q[0], it.x, it.y, 50, it.stuck ? Math.sin(t * 3 + it.hx) * 0.2 : 0);
              if (!it.stuck) A.text(ctx, it.q[1], it.hx, 560 + 16, { size: 13 });
            }
            /* magnetul potcoavă */
            ctx.save(); ctx.translate(mag.x, mag.y); ctx.strokeStyle = '#e8394f'; ctx.lineWidth = 34; ctx.beginPath(); ctx.arc(0, -10, 50, Math.PI, TAU); ctx.stroke(); ctx.fillStyle = '#e8394f'; ctx.fillRect(-67, -10, 34, 40); ctx.fillRect(33, -10, 34, 40); ctx.fillStyle = '#d8dde6'; ctx.fillRect(-67, 30, 34, 22); ctx.fillRect(33, 30, 34, 22); ctx.restore();
            A.glow(ctx, mag.x, mag.y + 60, 120, '#9fc4ff', 0.12);
            const yes = its.filter((i) => i.stuck).map((i) => i.q[1]); A.label(ctx, yes.length ? '🧲 A prins: ' + yes.join(', ') : '👆 Trage magnetul peste obiecte', 500, 60, { size: 17 });
          } else {
            const ex = 330, ey = 300, R = 150;
            /* liniile câmpului Pământului */
            ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 2; for (let i = 1; i <= 4; i++) { const k = i * 0.55; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(ex + s * R * k, ey, R * k, R * k * 1.15, 0, 0, TAU); ctx.stroke(); } }
            window.EarthGlobe(ctx, ex, ey, R, t * 15, [-0.6, -0.4], 0, {});
            ctx.save(); ctx.translate(ex, ey); ctx.globalAlpha = 0.85; bar(ctx, 0, 0, -Math.PI / 2, true, 150); ctx.restore();
            A.text(ctx, 'Nordul ⬆️', ex, ey - R - 30, { size: 17, color: '#ffe08a' });
            /* busola */
            const cx = 750, cy = 300, cr = 130;
            if (!drag) comp = A.damp(comp, -Math.PI / 2 + Math.sin(t * 2) * 0.03, 3, dt);
            ctx.fillStyle = '#c8a050'; ctx.beginPath(); ctx.arc(cx, cy, cr + 16, 0, TAU); ctx.fill(); ctx.fillStyle = '#f8f4e8'; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, TAU); ctx.fill();
            [['N', -Math.PI / 2, '#e8394f'], ['E', 0, '#333'], ['S', Math.PI / 2, '#333'], ['V', Math.PI, '#333']].forEach(([s, a, c]) => A.text(ctx, s, cx + Math.cos(a) * (cr - 24), cy + Math.sin(a) * (cr - 24), { size: 24, color: c, halo: false }));
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(comp + Math.PI / 2); ctx.fillStyle = '#e8394f'; ctx.beginPath(); ctx.moveTo(0, -cr * 0.8); ctx.lineTo(14, 0); ctx.lineTo(-14, 0); ctx.fill(); ctx.fillStyle = '#3a4a6a'; ctx.beginPath(); ctx.moveTo(0, cr * 0.8); ctx.lineTo(14, 0); ctx.lineTo(-14, 0); ctx.fill(); ctx.fillStyle = '#c8a050'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill(); ctx.restore();
            A.text(ctx, '👆 Învârte acul: se întoarce singur spre Nord', cx, cy + cr + 50, { size: 15, color: 'rgba(255,255,255,0.8)' });
          }
          ctx.restore();
        }
      };
    }
  });
})();
