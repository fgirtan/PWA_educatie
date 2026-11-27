/* Modul: Frigiderul — cum „mută” căldura din interior afară */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const emoji = (ctx, e, x, y, s) => { ctx.save(); ctx.font = s + 'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, x, y); ctx.restore(); };
  defineModule({
    id: 'fridge', title: 'Frigiderul', sub: 'Cum scoate căldura din interior',
    start: function (api) {
      const ctx = api.ctx; let on = true, door = 0, doorT = 0, temp = 4;
      const r = api.row('');
      const bo = api.button(r, '⚡ Oprește frigiderul', () => { on = !on; bo.innerHTML = on ? '⚡ Oprește frigiderul' : '⚡ Pornește frigiderul'; });
      const bd = api.button(r, '🚪 Deschide ușa', () => { doorT = doorT ? 0 : 1; bd.innerHTML = doorT ? '🚪 Închide ușa' : '🚪 Deschide ușa'; if (doorT) api.say('Ușa deschisă lasă <b>aerul cald</b> din cameră să intre, iar frigiderul trebuie să muncească mai mult. De aceea nu ținem ușa deschisă!'); });
      api.say('Frigiderul nu „face” frig: el <b>mută căldura</b> din interior afară! Prin niște țevi circulă un lichid special. Înăuntru, el <b>se evaporă</b> și ia căldura cu el (la fel cum te răcorești când ieși ud din apă). Apoi <b>compresorul</b> îl strânge și îl trimite în spate, unde lasă căldura afară. Pune mâna pe spatele frigiderului: e cald!');
      const loop = [[700, 520], [700, 380], [760, 340], [760, 140], [700, 100], [560, 100], [430, 110], [430, 180], [560, 180], [430, 230], [560, 260], [640, 300], [640, 520]];
      const S = A.pathSampler(loop, true, 120);
      const parts = []; for (let i = 0; i < 60; i++) parts.push(i / 60);
      return {
        frame: function (dt, t) {
          door = A.damp(door, doorT, 4, dt);
          const target = on ? (door > 0.5 ? 12 : 4) : 21; temp = A.damp(temp, target, door > 0.5 ? 0.5 : 0.25, dt);
          A.scene(ctx, api.W, api.H, 'lab');
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          /* corpul frigiderului (în secțiune) */
          ctx.fillStyle = '#e8ecf2'; A.roundRectPath(ctx, 230, 60, 420, 500, 22); ctx.fill();
          const ig = ctx.createLinearGradient(0, 80, 0, 540); ig.addColorStop(0, A.mix('#bfe6ff', '#ffe6c8', clamp((temp - 4) / 17, 0, 1))); ig.addColorStop(1, A.mix('#e6f4ff', '#fff2e0', clamp((temp - 4) / 17, 0, 1))); ctx.fillStyle = ig; ctx.fillRect(255, 85, 370, 450);
          ctx.strokeStyle = '#c8ced8'; ctx.lineWidth = 4; for (const y of [210, 330, 440]) { ctx.beginPath(); ctx.moveTo(255, y); ctx.lineTo(625, y); ctx.stroke(); }
          emoji(ctx, '🥛', 300, 300, 48); emoji(ctx, '🧀', 380, 310, 40); emoji(ctx, '🍉', 470, 410, 48); emoji(ctx, '🥚', 540, 312, 36); emoji(ctx, '🍎', 330, 412, 40); emoji(ctx, '🧃', 560, 410, 44); emoji(ctx, '🍦', 300, 500, 40); emoji(ctx, '🥕', 420, 505, 40);
          /* ușa care se deschide */
          if (door > 0.02) { ctx.fillStyle = 'rgba(232,236,242,0.95)'; ctx.beginPath(); ctx.moveTo(230, 60); ctx.lineTo(230 - 160 * door, 90); ctx.lineTo(230 - 160 * door, 530); ctx.lineTo(230, 560); ctx.fill(); for (let i = 0; i < 8; i++) { const u = ((t * 0.5 + i / 8) % 1); ctx.fillStyle = 'rgba(255,150,80,' + 0.5 * (1 - u) * door + ')'; ctx.beginPath(); ctx.arc(150 + u * 200, 200 + i * 40, 10, 0, TAU); ctx.fill(); } }
          /* țevile: evaporatorul (sus, înăuntru) și condensatorul (în spate) */
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 10; ctx.beginPath(); A.smoothPath(ctx, [[560, 100], [430, 110], [430, 180], [560, 180], [430, 230], [560, 260]], false); ctx.stroke();
          ctx.strokeStyle = '#ff7a4a'; ctx.beginPath(); A.smoothPath(ctx, [[700, 380], [760, 340], [760, 140], [700, 100]], false); ctx.stroke();
          ctx.strokeStyle = '#aab4c4'; ctx.beginPath(); A.smoothPath(ctx, [[560, 260], [640, 300], [640, 520], [700, 520], [700, 380]], false); ctx.stroke(); ctx.beginPath(); ctx.moveTo(700, 100); ctx.lineTo(560, 100); ctx.stroke();
          for (let i = 0; i < 6; i++) { ctx.strokeStyle = '#ff7a4a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(745, 150 + i * 36); ctx.lineTo(790, 150 + i * 36); ctx.stroke(); }
          /* compresorul */
          ctx.fillStyle = '#4a5262'; A.roundRectPath(ctx, 660, 470, 90, 70, 14); ctx.fill(); if (on) { ctx.fillStyle = '#7dffb0'; ctx.beginPath(); ctx.arc(735, 485, 5 + Math.sin(t * 8), 0, TAU); ctx.fill(); }
          /* lichidul care circulă */
          if (on) for (let i = 0; i < parts.length; i++) parts[i] = (parts[i] + dt * 0.06) % 1;
          for (const u of parts) { const p = S.at(u), cold = p.x < 600 && p.y < 280, hot = p.x > 700 && p.y < 400; ctx.fillStyle = cold ? '#e6f6ff' : hot ? '#ffd0a0' : '#ffffff'; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, TAU); ctx.fill(); }
          /* săgețile de căldură */
          if (on) { for (let i = 0; i < 4; i++) { const u = ((t * 0.5 + i / 4) % 1); A.arrow(ctx, 360 + i * 50, 330 - u * 90, 360 + i * 50, 300 - u * 90, { color: 'rgba(255,140,70,' + (1 - u) * 0.7 + ')', width: 3 }); } for (let i = 0; i < 5; i++) { const u = ((t * 0.6 + i / 5) % 1); A.arrow(ctx, 800 + u * 80, 160 + i * 40, 830 + u * 80, 150 + i * 40 - u * 10, { color: 'rgba(255,110,60,' + (1 - u) + ')', width: 4 }); } }
          /* termometrul */
          const tx = 120, ty = 300; ctx.fillStyle = '#fff'; A.roundRectPath(ctx, tx - 14, ty - 150, 28, 260, 14); ctx.fill(); ctx.fillStyle = temp > 8 ? '#ff5a3a' : '#3a8ee8'; const h = clamp((temp + 5) / 30, 0, 1) * 220; ctx.fillRect(tx - 6, ty + 90 - h, 12, h + 10); ctx.beginPath(); ctx.arc(tx, ty + 110, 22, 0, TAU); ctx.fill();
          A.label(ctx, 'Înăuntru: ' + Math.round(temp) + '°C', tx, ty - 180, { size: 17, color: temp > 8 ? '#ffb0b8' : '#b0e0ff' });
          A.label(ctx, '❄️ Evaporatorul: ia căldura', 450, 40, { size: 15, tx: 495, ty: 108 }); A.label(ctx, '🔥 În spate: lasă căldura afară', 840, 70, { size: 15, tx: 765, ty: 160 }); A.label(ctx, '⚙️ Compresorul', 850, 520, { size: 15, tx: 750, ty: 505 });
          if (!on) A.label(ctx, 'Frigiderul e oprit: mâncarea se încălzește 🥵', 440, 580, { size: 16, color: '#ffe08a' });
          ctx.restore();
        }
      };
    }
  });
})();
