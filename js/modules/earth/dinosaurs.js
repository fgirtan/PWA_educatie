/* Modul: Dinozaurii — mărimi, meteoritul, fosilele */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const DINO = [
    { k: 'trex', o: { v: 'trex' }, n: 'Tyrannosaurus rex', e: '🦖', h: 4, L: 12, w: '8 tone (cât 5 mașini)', f: '🥩 carnivor', p: 'acum 68–66 milioane de ani', t: 'Regele dinozaurilor carnivori! Avea dinți cât o banană și o mușcătură de 10 ori mai puternică decât a unui leu. Lăbuțele din față erau mici, dar foarte puternice.' },
    { k: 'sauropod', o: {}, n: 'Brachiosaurus', e: '🦕', h: 12, L: 22, w: '40 de tone (cât 6 elefanți)', f: '🌿 ierbivor', p: 'acum 154–150 milioane de ani', t: 'Unul dintre cele mai mari animale care au trăit pe uscat. Cu gâtul lung ajungea la frunzele din vârful copacilor, la înălțimea unei clădiri cu 4 etaje.' },
    { k: 'stego', o: {}, n: 'Stegosaurus', e: '🦕', h: 4, L: 9, w: '5 tone', f: '🌿 ierbivor', p: 'acum 155–150 milioane de ani', t: 'Avea plăci mari pe spate și 4 țepi la coadă, cu care se apăra de carnivore. Creierul lui era mic, cât o nucă!' },
    { k: 'trike', o: {}, n: 'Triceratops', e: '🦏', h: 3, L: 9, w: '9 tone', f: '🌿 ierbivor', p: 'acum 68–66 milioane de ani', t: 'Avea 3 coarne și un „guler” mare de os pe ceafă. Era vecin cu T-rex și se apăra cu coarnele.' },
    { k: 'trex', o: { v: 'small' }, n: 'Velociraptor', e: '🦖', h: 0.6, L: 2, w: '15 kg (cât un câine)', f: '🥩 carnivor', p: 'acum 75–71 milioane de ani', t: 'Mic și rapid, cât un curcan mare. Avea <b>pene</b> și o gheară curbată la picioare. Vâna probabil în grup.' },
    { k: 'ptero', o: {}, n: 'Pteranodon', e: '🦅', h: 1.8, L: 6, w: '25 kg', f: '🐟 pește', p: 'acum 86–84 milioane de ani', t: 'Nu era chiar dinozaur, ci o „reptilă zburătoare”, rudă cu ei. Aripile lui întinse măsurau 6 metri, cât o mașină și jumătate!' }
  ];
  function kid(ctx, x, y, h) { const s = h; ctx.fillStyle = '#3a6ad0'; ctx.fillRect(x - s * 0.08, y - s * 0.45, s * 0.07, s * 0.45); ctx.fillRect(x + s * 0.01, y - s * 0.45, s * 0.07, s * 0.45); ctx.fillStyle = '#ff5a6a'; A.roundRectPath(ctx, x - s * 0.13, y - s * 0.8, s * 0.26, s * 0.38, s * 0.06); ctx.fill(); ctx.fillStyle = '#f2c09a'; ctx.beginPath(); ctx.arc(x, y - s * 0.89, s * 0.11, 0, TAU); ctx.fill(); ctx.fillStyle = '#5a3a1a'; ctx.beginPath(); ctx.arc(x, y - s * 0.92, s * 0.11, Math.PI, TAU); ctx.fill(); }
  defineModule({
    id: 'dinosaurs', title: 'Dinozaurii', sub: 'Cât de mari erau, ce mâncau și ce s-a întâmplat cu ei',
    start: function (api) {
      const ctx = api.ctx; let mode = 'gallery', sel = 0, st = 0, sand = null, found = 0;
      const rm = api.row(''), bs = {};
      [['gallery', '🦖 Dinozaurii'], ['meteor', '☄️ Meteoritul'], ['dig', '⛏️ Caută fosile']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const rg = api.row(''), rmt = api.row(''), rdg = api.row('');
      const db = DINO.map((d, i) => api.button(rg, d.e + ' ' + d.n.split(' ')[0], () => pick(i)));
      api.button(rmt, '▶ Pornește povestea', () => { st = 0; });
      api.button(rdg, '🔄 Groapă nouă', () => resetSand());
      function pick(i) { sel = i; st = 0; db.forEach((b, j) => b.classList.toggle('on', j === i)); const d = DINO[i]; api.say('<b>' + d.e + ' ' + d.n + '.</b> ' + d.t); }
      function setMode(m) { mode = m; st = 0; for (const k in bs) bs[k].classList.toggle('on', k === m); rg.style.display = m === 'gallery' ? '' : 'none'; rmt.style.display = m === 'meteor' ? '' : 'none'; rdg.style.display = m === 'dig' ? '' : 'none'; if (m === 'gallery') pick(sel); else if (m === 'meteor') api.say('Acum <b>66 de milioane de ani</b>, un <b>asteroid</b> mare cât un oraș a lovit Pământul. Praful a acoperit Soarele mulți ani, s-a făcut frig, plantele s-au uscat și dinozaurii mari au dispărut. Dar unii au supraviețuit: <b>păsările</b> de azi sunt urmașii dinozaurilor! 🐦'); else { resetSand(); api.say('Dinozaurii au lăsat <b>fosile</b>: oase care, în milioane de ani, s-au transformat în piatră. <b>Paleontologii</b> le scot din pământ cu grijă, cu pensule. Freacă cu degetul ca să dai nisipul la o parte!'); } api.layout(); }
      const GW = 40, GH = 22; function resetSand() { sand = new Float32Array(GW * GH).fill(1); found = 0; }
      let V = null;
      api.pointer({ move: (x, y) => { if (mode !== 'dig' || !V || !sand) return; const p = V.inv(x, y); const gx = (p[0] - 100) / 800 * GW, gy = (p[1] - 120) / 400 * GH; for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const d = Math.hypot(i + 0.5 - gx, (j + 0.5 - gy) * 1.3); if (d < 2.2) sand[j * GW + i] = Math.max(0, sand[j * GW + i] - 0.25 * (2.2 - d)); } }, down: (x, y) => {} });
      function land(t, dark) {
        const g = ctx.createLinearGradient(0, -200, 0, 470); g.addColorStop(0, A.mix('#e89a60', '#2a1a1a', dark)); g.addColorStop(1, A.mix('#ffd8a0', '#3a2a22', dark)); ctx.fillStyle = g; ctx.fillRect(-400, -400, 1800, 900);
        ctx.fillStyle = A.mix('#7a5a6a', '#2a1a1a', dark); ctx.beginPath(); ctx.moveTo(-300, 420); ctx.lineTo(80, 260); ctx.lineTo(160, 300); ctx.lineTo(260, 220); ctx.lineTo(380, 330); ctx.lineTo(1300, 420); ctx.fill();
        ctx.fillStyle = A.mix('#6a8a3a', '#2a2a1a', dark); ctx.fillRect(-400, 470, 1800, 500);
      }
      setMode('gallery');
      return {
        frame: function (dt, t) {
          st += dt;
          ctx.fillStyle = '#1a1410'; ctx.fillRect(0, 0, api.W, api.H);
          V = window.Fit(api, 1000, 600); ctx.save(); V.apply(ctx);
          if (mode === 'gallery') {
            land(t, 0);
            for (let i = 0; i < 4; i++) window.CreatureH(i % 2 ? 'fern' : 'palm', ctx, 60 + i * 260, 480, i % 2 ? 60 : 160, t, { seed: i });
            const d = DINO[sel], gy = 490, maxH = Math.max(d.h * (d.k === 'sauropod' ? 1 : 1.05), 1.15), ppm = 330 / maxH;
            const kh = 1.15 * ppm, dh = d.h * ppm, walk = Math.sin(st * 0.4) * 30;
            A.groundShadow(ctx, 520 + walk, gy + 4, Math.min(260, dh * 1.1), 12, 0.35);
            const bob = d.k === 'ptero' ? -120 + Math.sin(t * 2) * 10 : 0;
            window.CreatureH(d.k, ctx, 520 + walk, gy + bob, dh, t, Object.assign({ face: -1, walk: d.k !== 'ptero' ? 0.6 : 0 }, d.o));
            kid(ctx, 230, gy, kh); A.text(ctx, 'tu (1,15 m)', 230, gy + 22, { size: 14 });
            ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(130, gy - dh); ctx.lineTo(900, gy - dh); ctx.stroke(); ctx.setLineDash([]);
            A.label(ctx, (d.k === 'ptero' ? 'aripi: ' + d.L : 'înalt: ' + d.h.toLocaleString('ro-RO')) + ' m', 140, gy - dh - 18, { size: 15, align: 'left' });
            A.panel(ctx, 680, 30, 300, 150, { r: 14 });
            A.text(ctx, d.e + ' ' + d.n, 830, 56, { size: 18, color: '#ffe08a' });
            [['📏 Lungime', d.L + ' m'], ['⚖️ Greutate', d.w], ['🍽️ Mânca', d.f], ['⏳ A trăit', d.p]].forEach(([a, b], i) => { A.text(ctx, a, 695, 86 + i * 24, { size: 13, align: 'left' }); A.text(ctx, b, 968, 86 + i * 24, { size: 13, align: 'right', color: '#b0ffcc' }); });
          } else if (mode === 'meteor') {
            const k = st; const flash = k > 4.5 && k < 5.4 ? 1 - Math.abs(k - 4.9) * 2 : 0, dark = clamp((k - 5) / 3, 0, 0.85) * (k > 13 ? clamp(1 - (k - 13) / 4, 0.1, 1) : 1);
            land(t, dark);
            if (k < 5) { for (let i = 0; i < 3; i++) window.CreatureH(['sauropod', 'trike', 'stego'][i], ctx, 200 + i * 260 + Math.sin(t * 0.3 + i) * 20, 480, [200, 70, 90][i], t, { face: i % 2 ? 1 : -1, walk: 0.4 }); window.CreatureH('ptero', ctx, 700 + Math.sin(t) * 40, 180, 50, t, {}); }
            if (k > 1.5 && k < 4.8) { const u = (k - 1.5) / 3.3, mx = lerp(1100, 560, u), my = lerp(-80, 470, u); ctx.strokeStyle = 'rgba(255,200,120,0.7)'; ctx.lineWidth = 18 * u + 4; ctx.beginPath(); ctx.moveTo(mx + 200 * (1 - u * 0.4), my - 180 * (1 - u * 0.4)); ctx.lineTo(mx, my); ctx.stroke(); A.glow(ctx, mx, my, 40 + u * 60, '#ffb040', 0.9); ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.arc(mx, my, 12 + u * 14, 0, TAU); ctx.fill(); }
            if (k >= 4.8 && k < 9) { const u = clamp((k - 4.8) / 3, 0, 1); A.glow(ctx, 560, 470, 100 + u * 600, '#ff7a2a', 0.8 * (1 - u)); for (let i = 0; i < 20; i++) { const a = -Math.PI * (0.1 + 0.8 * (i / 20)); ctx.fillStyle = 'rgba(90,70,60,' + 0.6 * (1 - u * 0.5) + ')'; ctx.beginPath(); ctx.arc(560 + Math.cos(a) * u * 500, 470 + Math.sin(a) * u * 300, 30 + u * 40, 0, TAU); ctx.fill(); } }
            if (k > 6) { ctx.fillStyle = 'rgba(60,50,45,' + dark * 0.6 + ')'; ctx.fillRect(-300, 0, 1600, 600); }
            if (k > 9 && k < 14) { for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(230,230,240,0.7)'; ctx.beginPath(); ctx.arc((i * 97 + t * 10) % 1000, (i * 61 + t * 40) % 600, 2, 0, TAU); ctx.fill(); } }
            if (k > 14) { window.CreatureH('mouse', ctx, 400, 485, 22, t, { walk: 1 }); window.CreatureH('bird', ctx, 600 + Math.sin(t) * 30, 300, 40, t, {}); window.CreatureH('sprout', ctx, 300, 480, 30, t, {}); window.CreatureH('sprout', ctx, 700, 480, 40, t, {}); }
            if (flash > 0) { ctx.fillStyle = 'rgba(255,240,200,' + flash + ')'; ctx.fillRect(-300, 0, 1600, 600); }
            const cap = k < 1.5 ? '🦕 Dinozaurii trăiesc liniștiți…' : k < 4.8 ? '☄️ Un asteroid uriaș se apropie!' : k < 9 ? '💥 Bum! Praful acoperă cerul' : k < 14 ? '❄️ Se face întuneric și frig, ani la rând' : '🐭🐦 Mamiferele mici și păsările au supraviețuit!';
            A.label(ctx, cap, 500, 60, { size: 20 });
          } else {
            ctx.fillStyle = '#6a4a2e'; ctx.fillRect(60, 90, 880, 460);
            /* scheletul de dedesubt */
            ctx.save(); ctx.translate(500, 330); ctx.strokeStyle = '#f2ead6'; ctx.fillStyle = '#f2ead6'; ctx.lineCap = 'round'; ctx.lineWidth = 9;
            ctx.beginPath(); ctx.moveTo(-330, -40); ctx.quadraticCurveTo(-200, -90, -40, -60); ctx.quadraticCurveTo(80, -40, 190, -110); ctx.stroke();
            for (let i = 0; i < 12; i++) { const x = -200 + i * 20; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, -70 + Math.abs(i - 6) * 2); ctx.quadraticCurveTo(x + 10, 0, x - 5, 40 - Math.abs(i - 6) * 4); ctx.stroke(); }
            ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-60, -50); ctx.lineTo(-40, 60); ctx.lineTo(-70, 140); ctx.lineTo(-30, 150); ctx.moveTo(-20, -50); ctx.lineTo(20, 60); ctx.lineTo(0, 140); ctx.lineTo(40, 150); ctx.stroke();
            ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(150, -80); ctx.lineTo(175, -40); ctx.lineTo(160, -20); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(190, -150); ctx.quadraticCurveTo(300, -170, 330, -110); ctx.lineTo(290, -85); ctx.quadraticCurveTo(230, -70, 190, -90); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#6a4a2e'; ctx.beginPath(); ctx.arc(240, -130, 12, 0, TAU); ctx.fill(); ctx.fillStyle = '#f2ead6'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(250 + i * 12, -92); ctx.lineTo(255 + i * 12, -78); ctx.lineTo(260 + i * 12, -92); ctx.fill(); }
            ctx.restore();
            /* nisipul */
            let left = 0; for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const a = sand[j * GW + i]; left += a; if (a <= 0.02) continue; ctx.fillStyle = 'rgba(' + (196 + ((i * 7 + j * 3) % 5) * 6) + ',' + (160 + ((i * 3 + j * 5) % 5) * 5) + ',110,' + a + ')'; ctx.fillRect(100 + i * 20, 120 + j * (400 / GH), 21, 400 / GH + 1); }
            const pct = 1 - left / (GW * GH);
            A.label(ctx, pct > 0.7 ? '🎉 Ai găsit un schelet de T-rex!' : '👆 Freacă cu degetul ca să sapi · ' + Math.round(pct * 100) + '%', 500, 60, { size: 18 });
          }
          ctx.restore();
        }
      };
    }
  });
})();
