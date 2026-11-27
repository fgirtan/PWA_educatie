/* Modul: Vaporul și submarinul — de ce plutesc lucrurile */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const emoji = (ctx, e, x, y, s) => { ctx.save(); ctx.font = s + 'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, x, y); ctx.restore(); };
  /* obiecte: densitate față de apă (<1 plutește) */
  const OBJ = [
    { k: 'rock', n: '🪨 Piatră', d: 2.6, w: 70, h: 50, t: 'Piatra e <b>mai grea decât apa</b> pe care o împinge la o parte, așa că se scufundă.' },
    { k: 'wood', n: '🪵 Lemn', d: 0.6, w: 120, h: 40, t: 'Lemnul e <b>mai ușor decât apa</b>: plutește. Apa îl împinge în sus mai tare decât îl trage greutatea în jos.' },
    { k: 'ball', n: '⚫ Bilă de fier', d: 7.8, w: 46, h: 46, t: 'O bilă de fier se duce la fund ca o piatră…' },
    { k: 'ship', n: '🚢 Vapor de fier', d: 0.45, w: 220, h: 70, t: '…dar dacă faci <b>din același fier</b> un vapor gol pe dinăuntru, plutește! Vaporul e mare și dă la o parte <b>multă apă</b>, iar apa îl împinge în sus cu o forță cât greutatea acelei ape. Asta a descoperit <b>Arhimede</b>, acum peste 2000 de ani.' },
    { k: 'duck', n: '🦆 Rățușcă de cauciuc', d: 0.15, w: 70, h: 60, t: 'Rățușca e plină de aer: plutește aproape toată deasupra apei.' }
  ];
  defineModule({
    id: 'boat', title: 'Vaporul și submarinul', sub: 'De ce plutește un vapor de fier și cum se scufundă un submarin',
    start: function (api) {
      const ctx = api.ctx; let mode = 'float', lastLevel = 330, items = [], ballast = 0.3, ballT = 0.3, depth = 0, dv = 0;
      const rm = api.row(''), bs = {};
      [['float', '🛁 Ce plutește?'], ['sub', '🌊 Submarinul']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const rf = api.row(''), rs = api.row('');
      OBJ.forEach((o) => api.button(rf, o.n, () => { items.push({ o: o, x: 260 + (items.length % 4) * 140, y: 80, vy: 0, a: 0 }); if (items.length > 5) items.shift(); api.say(o.t); }));
      api.button(rf, '🧹 Golește', () => { items = []; });
      api.button(rs, '💧 Umple rezervoarele cu apă', () => { ballT = 1; api.say('Submarinul își umple <b>rezervoarele cu apă de mare</b>. Se face mai greu decât apa pe care o dă la o parte, așa că <b>se scufundă</b>.'); });
      api.button(rs, '💨 Suflă aer în rezervoare', () => { ballT = 0; api.say('Aerul comprimat împinge apa afară din rezervoare. Submarinul se face mai ușor și <b>urcă</b> la suprafață.'); });
      api.button(rs, '⚖️ Pe jumătate', () => { ballT = 0.5; api.say('Cu rezervoarele pe jumătate pline, submarinul cântărește <b>exact</b> cât apa pe care o dă la o parte: <b>plutește în mijlocul apei</b>, ca un pește.'); });
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rf.style.display = m === 'float' ? '' : 'none'; rs.style.display = m === 'sub' ? '' : 'none'; api.say(m === 'float' ? 'De ce unele lucruri plutesc și altele se scufundă? Nu contează doar cât de grele sunt, ci și <b>cât loc ocupă</b>. Aruncă obiecte în apă și urmărește <b>nivelul apei</b>!' : 'Submarinul poate să plutească la suprafață sau să meargă pe sub apă. Secretul: <b>rezervoarele</b> lui, pe care le umple cu apă sau cu aer.'); api.layout(); }
      setMode('float');
      return {
        frame: function (dt, t) {
          A.scene(ctx, api.W, api.H, mode === 'sub' ? 'day' : 'lab');
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          if (mode === 'float') {
            const x0 = 150, x1 = 850, y1 = 560, base = 330;
            let disp = 0; for (const it of items) { const sub = clamp((it.y + it.o.h / 2 - lastLevel) / it.o.h, 0, 1); disp += sub * it.o.w * it.o.h; }
            const level = lastLevel = A.damp(lastLevel, base - disp / 700 * 3, 6, dt);
            /* acvariul */
            const wg = ctx.createLinearGradient(0, level, 0, y1); wg.addColorStop(0, 'rgba(90,180,240,0.55)'); wg.addColorStop(1, 'rgba(20,90,170,0.75)'); ctx.fillStyle = wg; ctx.fillRect(x0, level, x1 - x0, y1 - level);
            ctx.strokeStyle = 'rgba(200,230,255,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = x0; x <= x1; x += 10) ctx.lineTo(x, level + Math.sin(x * 0.05 + t * 3) * 2); ctx.stroke();
            ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, 120); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, 120); ctx.stroke();
            ctx.strokeStyle = '#ffe36a'; ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, base); ctx.lineTo(x1 + 40, base); ctx.stroke(); ctx.setLineDash([]); A.text(ctx, 'la început', x1 + 80, base, { size: 13, color: '#ffe36a' }); A.label(ctx, 'nivelul apei', x1 + 80, level - 22, { size: 14, tx: x1 + 2, ty: level });
            for (const it of items) {
              const o = it.o, sub = clamp((it.y + o.h / 2 - level) / o.h, 0, 1), buoy = sub / o.d, net = 1 - buoy;
              it.vy += net * 500 * dt; it.vy *= Math.exp(-(sub > 0 ? 3 : 0.2) * dt); it.y += it.vy * dt; if (it.y + o.h / 2 > y1 - 4) { it.y = y1 - 4 - o.h / 2; it.vy = 0; }
              it.a = sub > 0 && sub < 1 ? Math.sin(t * 2 + it.x) * 0.05 : 0;
              ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.a);
              if (o.k === 'rock') { ctx.fillStyle = '#7a7f88'; A.blob(ctx, 0, 0, 30, 0, { amp: 0.2, sx: 1.2, sy: 0.85 }); ctx.fill(); }
              else if (o.k === 'wood') { A.cylinder(ctx, -60, -20, 120, 40, '#a8743e', false); ctx.fillStyle = '#d8a86a'; ctx.beginPath(); ctx.ellipse(60, 0, 8, 20, 0, 0, TAU); ctx.fill(); }
              else if (o.k === 'ball') A.sphere(ctx, 0, 0, 23, '#4a4f5a');
              else if (o.k === 'ship') { ctx.fillStyle = '#5a6577'; ctx.beginPath(); ctx.moveTo(-110, -20); ctx.lineTo(110, -20); ctx.lineTo(85, 35); ctx.lineTo(-85, 35); ctx.fill(); ctx.fillStyle = '#c0392b'; ctx.fillRect(-85, 20, 170, 15); ctx.fillStyle = '#eee'; ctx.fillRect(-50, -50, 90, 30); ctx.fillStyle = '#333'; ctx.fillRect(10, -78, 18, 28); }
              else emoji(ctx, '🦆', 0, 0, 64);
              ctx.restore();
              if (sub > 0.05 && sub < 0.99 || (sub >= 0.99 && it.y + o.h / 2 < y1 - 6)) A.arrow(ctx, it.x + o.w / 2 + 14, it.y + 30, it.x + o.w / 2 + 14, it.y + 30 - buoy * 50, { color: '#7dffb0', width: 4 });
            }
            A.text(ctx, '⬆️ verde = apa împinge în sus', 500, 80, { size: 16, color: '#b0ffcc' });
            if (!items.length) A.text(ctx, 'Alege un obiect de jos ca să-l arunci în apă', 500, 250, { size: 18 });
          } else {
            ballast = A.damp(ballast, ballT, 0.8, dt);
            const dens = lerp(0.9, 1.1, ballast); dv += (dens - 1) * 120 * dt; dv *= Math.exp(-1.2 * dt); depth = clamp(depth + dv * dt, 0, 1); if (depth <= 0 && dv < 0) dv = 0; if (depth >= 1 && dv > 0) dv = 0;
            const sea = 180; const sg = ctx.createLinearGradient(0, sea, 0, 600); sg.addColorStop(0, '#2a8fd8'); sg.addColorStop(1, '#06204a'); ctx.fillStyle = sg; ctx.fillRect(-300, sea, 1600, 500);
            ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = -300; x <= 1300; x += 12) ctx.lineTo(x, sea + Math.sin(x * 0.03 + t * 2) * 4); ctx.stroke();
            for (let i = 0; i < 6; i++) window.Creatures.draw('fish', ctx, ((i * 220 + t * 30 * (i % 2 ? 1 : -1)) % 1300 + 1300) % 1300 - 150, 300 + (i * 47) % 250, 40, t, { face: i % 2 ? 1 : -1, seed: i, color: ['#ffb43d', '#ff6a8a', '#7ad0ff'][i % 3] });
            ctx.fillStyle = '#c8a86a'; ctx.beginPath(); ctx.moveTo(-300, 600); for (let x = -300; x <= 1300; x += 40) ctx.lineTo(x, 575 + Math.sin(x * 0.02) * 10); ctx.lineTo(1300, 600); ctx.fill();
            const sx = 500, sy = lerp(sea - 5, 510, depth), L = 340, H = 80;
            ctx.save(); ctx.translate(sx, sy);
            const hg = ctx.createLinearGradient(0, -H / 2, 0, H / 2); hg.addColorStop(0, '#7a8494'); hg.addColorStop(1, '#2a3040'); ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(0, 0, L / 2, H / 2, 0, 0, TAU); ctx.fill();
            ctx.fillStyle = '#4a5262'; A.roundRectPath(ctx, -40, -H / 2 - 50, 80, 56, 12); ctx.fill(); ctx.fillRect(-4, -H / 2 - 80, 8, 32); ctx.fillRect(-4, -H / 2 - 80, 22, 6);
            ctx.fillStyle = '#ffe36a'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 40, -6, 7, 0, TAU); ctx.fill(); }
            /* rezervoarele (văzute prin perete) */
            for (const s of [-1, 1]) { const tx = s * 115, tw = 70, th = 50; ctx.fillStyle = 'rgba(255,255,255,0.85)'; A.roundRectPath(ctx, tx - tw / 2, -th / 2, tw, th, 10); ctx.fill(); ctx.save(); A.roundRectPath(ctx, tx - tw / 2, -th / 2, tw, th, 10); ctx.clip(); ctx.fillStyle = '#2a7ad0'; ctx.fillRect(tx - tw / 2, th / 2 - th * ballast, tw, th * ballast); ctx.restore(); }
            ctx.fillStyle = '#333'; for (let i = 0; i < 3; i++) { const a = t * 8 + i * TAU / 3; ctx.beginPath(); ctx.ellipse(L / 2 + 8, Math.sin(a) * 14, 4, Math.abs(Math.cos(a)) * 14 + 2, 0, 0, TAU); ctx.fill(); }
            ctx.restore();
            if (Math.abs(ballast - ballT) > 0.02) for (let i = 0; i < 8; i++) { const u = ((t * 1.5 + i / 8) % 1), up = ballT < ballast; ctx.fillStyle = up ? 'rgba(255,255,255,0.7)' : 'rgba(150,210,255,0.8)'; ctx.beginPath(); ctx.arc(sx + (i % 2 ? 115 : -115) + Math.sin(i + t * 3) * 10, sy + (up ? -30 - u * 120 : 40 + u * 20), 4 + (i % 3), 0, TAU); ctx.fill(); }
            A.label(ctx, 'rezervoare: ' + Math.round(ballast * 100) + '% apă', sx, sy + 70, { size: 15 });
            A.label(ctx, 'Adâncime: ' + Math.round(depth * 300) + ' m', 140, 230, { size: 16 });
            A.arrow(ctx, sx + 200, sy, sx + 200, sy - 50, { color: '#7dffb0', width: 4 }); A.arrow(ctx, sx + 230, sy, sx + 230, sy + 50 * dens, { color: '#ff5a6a', width: 4 });
            A.text(ctx, 'apa împinge în sus', sx + 200, sy - 70, { size: 13, color: '#b0ffcc' }); A.text(ctx, 'greutatea', sx + 240, sy + 70 * dens, { size: 13, color: '#ffb0b8' });
          }
          ctx.restore();
        }
      };
    }
  });
})();
