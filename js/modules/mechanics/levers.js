/* Modul: Pârghii și scripeți — cum ridici lucruri grele cu putere puțină */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  defineModule({
    id: 'levers', title: 'Pârghii și scripeți', sub: 'Cum ridici un elefant cu o mână',
    start: function (api) {
      const ctx = api.ctx; let mode = 'lever', piv = 0.5, kidPush = 0, ang = 0, angV = 0, ropes = 1, lift = 0, pull = 0;
      const rm = api.row(''), bs = {};
      [['lever', '⚖️ Pârghia'], ['pulley', '🏗️ Scripetele']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const rl = api.row(''), rp = api.row('');
      api.slider(rl, { label: 'Unde e sprijinul', min: 0.12, max: 0.88, step: 0.01, value: piv, fmt: (v) => v < 0.35 ? 'aproape de elefant' : v > 0.65 ? 'aproape de copil' : 'la mijloc', onInput: (v) => { piv = v; } });
      [1, 2, 4].forEach((n) => api.button(rp, n === 1 ? '1 scripete' : n + ' scripeți', () => { ropes = n; lift = 0; api.say(n === 1 ? 'Cu <b>un scripete</b> fix doar schimbi direcția: tragi în jos ca să ridici în sus. Dar trebuie să tragi cu toată greutatea pianului.' : 'Cu <b>' + n + ' fire</b> care țin scripetele de jos, greutatea se împarte: tragi de <b>' + n + ' ori mai ușor</b>! Dar trebuie să tragi o funie de ' + n + ' ori mai lungă. Așa funcționează macaralele!'); }));
      const pb = api.button(rp, '💪 Trage de funie', () => {}); pb.addEventListener('pointerdown', () => { pull = 1; }); window.addEventListener('pointerup', () => { pull = 0; });
      api.onCleanup && api.onCleanup(() => {});
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rl.style.display = m === 'lever' ? '' : 'none'; rp.style.display = m === 'pulley' ? '' : 'none'; api.say(m === 'lever' ? 'Un <b>balansoar</b> e o pârghie. Elefantul e greu, copilul e ușor. Dar dacă muți <b>sprijinul</b> aproape de elefant, copilul stă pe un braț foarte lung și îl poate ridica! „Dați-mi un punct de sprijin și voi mișca Pământul”, spunea <b>Arhimede</b>.' : 'Un <b>scripete</b> e o roată cu o funie. Ține apăsat pe <b>Trage de funie</b> și compară cât de greu e cu 1, 2 sau 4 scripeți.'); api.layout(); }
      setMode('lever');
      return {
        frame: function (dt, t) {
          A.scene(ctx, api.W, api.H, 'day');
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          ctx.fillStyle = '#6aa84f'; ctx.fillRect(-300, 500, 1600, 200);
          if (mode === 'lever') {
            const L = 760, x0 = 120, px = x0 + piv * L, py = 420, WE = 6, WK = 1;   // greutăți relative
            const tE = WE * (px - x0), tK = WK * (x0 + L - px), net = (tK - tE) / 2000;
            angV += net * dt * 3; angV *= Math.exp(-2.5 * dt); ang = clamp(ang + angV * dt, -0.32, 0.32); if (Math.abs(ang) >= 0.32) angV = 0;
            ctx.fillStyle = '#8a6a4a'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 45, 500); ctx.lineTo(px + 45, 500); ctx.fill();
            ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
            ctx.fillStyle = '#c89a5a'; A.roundRectPath(ctx, x0 - px, -12, L, 24, 8); ctx.fill(); ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2; ctx.stroke();
            window.Creatures.draw('elephant', ctx, x0 - px + 70, -12, 150, 0, {});
            ctx.fillStyle = '#ff6a5a'; A.roundRectPath(ctx, x0 + L - px - 50, -90, 40, 60, 12); ctx.fill(); ctx.fillStyle = '#f2c09a'; ctx.beginPath(); ctx.arc(x0 + L - px - 30, -110, 20, 0, TAU); ctx.fill(); ctx.fillStyle = '#5a3a1a'; ctx.beginPath(); ctx.arc(x0 + L - px - 30, -116, 20, Math.PI, TAU); ctx.fill(); ctx.strokeStyle = '#3a4a6a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x0 + L - px - 40, -32); ctx.lineTo(x0 + L - px - 40, -14); ctx.moveTo(x0 + L - px - 20, -32); ctx.lineTo(x0 + L - px - 20, -14); ctx.stroke();
            ctx.restore();
            const ya = 540; ctx.strokeStyle = '#ffe36a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, ya); ctx.lineTo(px - 4, ya); ctx.stroke(); ctx.strokeStyle = '#7dffb0'; ctx.beginPath(); ctx.moveTo(px + 4, ya); ctx.lineTo(x0 + L, ya); ctx.stroke();
            A.text(ctx, 'braț scurt', (x0 + px) / 2, ya + 22, { size: 14, color: '#ffe08a' }); A.text(ctx, 'braț lung', (px + x0 + L) / 2, ya + 22, { size: 14, color: '#b0ffcc' });
            const msg = Math.abs(tE - tK) < 300 ? '⚖️ Echilibru!' : tK > tE ? '🎉 Copilul ridică elefantul!' : '🐘 Elefantul e prea greu…';
            A.label(ctx, msg, 500, 80, { size: 20, color: tK > tE ? '#b0ffcc' : '#fff' });
            A.text(ctx, 'Elefantul e de 6 ori mai greu decât copilul', 500, 120, { size: 15, color: '#1a3a5a', halo: false });
            A.text(ctx, 'Ca să-l ridice, brațul copilului trebuie să fie de peste 6 ori mai lung', 500, 145, { size: 15, color: '#1a3a5a', halo: false });
          } else {
            const top = 90, cx = 520, W0 = 120;
            if (pull) lift = Math.min(1, lift + dt * 0.25 * (pull ? 1 : 0)); else lift = Math.max(0, lift - dt * 0.6 * (ropes === 1 ? 1 : 0.0));
            ctx.fillStyle = '#5b6577'; ctx.fillRect(250, top - 20, 520, 20);
            const ly = lerp(440, 220, lift);
            /* scripeții de sus */
            const n = ropes; const tops = []; for (let i = 0; i < Math.max(1, n / 2); i++) tops.push(cx - 40 + i * 60);
            const bots = n > 1 ? [cx - 10, cx + 50].slice(0, n / 2) : [];
            const wheel = (x, y, r) => { ctx.fillStyle = '#c0c6d2'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#5b6577'; ctx.beginPath(); ctx.arc(x, y, r * 0.3, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5b6577'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = lift * 12 + i * TAU / 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); ctx.stroke(); } };
            ctx.strokeStyle = '#d8b878'; ctx.lineWidth = 4;
            if (n === 1) { ctx.beginPath(); ctx.moveTo(cx - 28, top + 30); ctx.lineTo(cx - 28, ly - 40); ctx.moveTo(cx + 28, top + 30); ctx.lineTo(cx + 28, lerp(470, 470 + 0, lift) - lift * 0); ctx.stroke(); }
            else { const segs = []; tops.forEach((x) => segs.push(x)); ctx.beginPath(); for (let i = 0; i < n; i++) { const x = cx - 55 + i * 30; ctx.moveTo(x, top + 30); ctx.lineTo(x, ly - 30); } ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx + 70, top + 30); ctx.lineTo(cx + 70, 480); ctx.stroke(); }
            tops.forEach((x, i) => wheel(n === 1 ? cx : cx - 40 + i * 60, top + 30, n === 1 ? 28 : 26));
            if (n > 1) bots.forEach((x, i) => wheel(cx - 40 + i * 60, ly - 30, 24));
            /* pianul */
            ctx.fillStyle = '#2a2a30'; A.roundRectPath(ctx, cx - 90, ly - 10, 180, 110, 10); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(cx - 80, ly + 30, 160, 20); ctx.fillStyle = '#111'; for (let i = 0; i < 9; i++) ctx.fillRect(cx - 74 + i * 18, ly + 30, 8, 12); ctx.fillStyle = '#2a2a30'; ctx.fillRect(cx - 80, ly + 100, 12, 30); ctx.fillRect(cx + 68, ly + 100, 12, 30);
            A.label(ctx, '🎹 pian: 120 kg', cx, ly - 50 - (n > 1 ? 10 : 0), { size: 15 });
            /* omul care trage */
            const hx = n === 1 ? cx + 28 : cx + 70, hy = 470 + (pull ? 6 : 0);
            ctx.fillStyle = '#4a7ad0'; A.roundRectPath(ctx, hx + 20, 380, 50, 80, 14); ctx.fill(); ctx.fillStyle = '#f2c09a'; ctx.beginPath(); ctx.arc(hx + 45, 360, 22, 0, TAU); ctx.fill(); ctx.strokeStyle = '#f2c09a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(hx + 25, 400); ctx.lineTo(hx, hy - 40 + (pull ? 20 : 0)); ctx.stroke(); ctx.strokeStyle = '#3a4a6a'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(hx + 35, 460); ctx.lineTo(hx + 30, 500); ctx.moveTo(hx + 55, 460); ctx.lineTo(hx + 60, 500); ctx.stroke();
            const F = W0 / n;
            A.panel(ctx, 40, 120, 240, 170, { r: 14 });
            A.text(ctx, 'Fire care țin: ' + n, 160, 150, { size: 17 });
            A.text(ctx, 'Tragi cu: ' + F + ' kg', 160, 185, { size: 20, color: '#b0ffcc' });
            A.meter(ctx, 60, 205, 200, 16, F / W0, F > 60 ? '#ff5a6a' : '#4ade80');
            A.text(ctx, 'Funia trasă: ' + (n * lift * 2).toFixed(1) + ' m', 160, 250, { size: 15 });
            A.text(ctx, pull ? (n === 1 ? '😫 greu!' : n === 2 ? '😤 merge' : '😊 ușor!') : '👇 ține apăsat „Trage de funie”', 500, 555, { size: 18, color: '#1a2a4a', halo: false });
          }
          ctx.restore();
        }
      };
    }
  });
})();
