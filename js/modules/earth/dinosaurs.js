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

  const BONE = '#f2ead6', ROCK = '#6a4a2e', STONE = '#d8c8a4';
  const leg = (ctx, x, y, a, l1, l2, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); const kx = x + Math.sin(a) * l1, ky = y + Math.cos(a) * l1; ctx.lineTo(kx, ky); ctx.lineTo(kx - Math.sin(a) * l2 * 0.4, ky + l2); ctx.lineTo(kx - Math.sin(a) * l2 * 0.4 + 22, ky + l2 + 4); ctx.stroke(); };
  const ribs = (ctx, x0, n, dx, y, h, w) => { ctx.lineWidth = w || 5; for (let i = 0; i < n; i++) { const x = x0 + i * dx, k = 1 - Math.abs(i - n / 2) / n; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y + h * k * 0.6, x - 5, y + h * k); ctx.stroke(); } };
  const FOS = [
    { n: 'un schelet de T-rex', t: 'Cel mai faimos dinozaur carnivor. Primul schelet de T-rex a fost găsit acum peste 100 de ani, în America.', draw: function (ctx, t) {
      ctx.beginPath(); ctx.moveTo(-330, -40); ctx.quadraticCurveTo(-200, -90, -40, -60); ctx.quadraticCurveTo(80, -40, 190, -110); ctx.stroke();
      for (let i = 0; i < 12; i++) { const x = -200 + i * 20; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, -70 + Math.abs(i - 6) * 2); ctx.quadraticCurveTo(x + 10, 0, x - 5, 40 - Math.abs(i - 6) * 4); ctx.stroke(); }
      ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-60, -50); ctx.lineTo(-40, 60); ctx.lineTo(-70, 140); ctx.lineTo(-30, 150); ctx.moveTo(-20, -50); ctx.lineTo(20, 60); ctx.lineTo(0, 140); ctx.lineTo(40, 150); ctx.stroke();
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(150, -80); ctx.lineTo(175, -40); ctx.lineTo(160, -20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(190, -150); ctx.quadraticCurveTo(300, -170, 330, -110); ctx.lineTo(290, -85); ctx.quadraticCurveTo(230, -70, 190, -90); ctx.closePath(); ctx.fill();
      ctx.fillStyle = ROCK; ctx.beginPath(); ctx.arc(240, -130, 12, 0, TAU); ctx.fill(); ctx.fillStyle = BONE; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(250 + i * 12, -92); ctx.lineTo(255 + i * 12, -78); ctx.lineTo(260 + i * 12, -92); ctx.fill(); }
    } },
    { n: 'un craniu de Triceratops', t: 'Craniul lui Triceratops e uriaș: aproape 2 metri, cât un om matur! Avea 3 coarne și un guler de os.', draw: function (ctx) {
      ctx.beginPath(); ctx.moveTo(-60, -120); ctx.quadraticCurveTo(80, -230, 230, -120); ctx.quadraticCurveTo(250, -30, 180, 40); ctx.lineTo(60, 60); ctx.quadraticCurveTo(-40, 90, -150, 80); ctx.lineTo(-250, 60); ctx.quadraticCurveTo(-260, 20, -210, 0); ctx.quadraticCurveTo(-120, -60, -60, -120); ctx.fill();
      ctx.fillStyle = ROCK; ctx.beginPath(); ctx.ellipse(110, -110, 40, 26, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(180, -60, 26, 20, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-50, -20, 20, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(-170, 30, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = BONE; for (let i = 0; i < 9; i++) { const a = -2.6 + i * 0.32; ctx.beginPath(); ctx.arc(90 + Math.cos(a) * 160, -40 + Math.sin(a) * 140, 12, 0, Math.PI * 2); ctx.fill(); }
      const horn = (x, y, a, l, w) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(-w * 0.3, -l * 0.6, 0, -l); ctx.quadraticCurveTo(w * 0.2, -l * 0.5, w, 0); ctx.fill(); ctx.restore(); };
      horn(-60, -60, -1.0, 170, 22); horn(-20, -40, -0.9, 150, 20); horn(-200, -5, -0.6, 60, 14);
      ctx.beginPath(); ctx.moveTo(-250, 60); ctx.quadraticCurveTo(-300, 50, -290, 90); ctx.lineTo(-240, 80); ctx.fill();
      ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-150, 90); ctx.quadraticCurveTo(-30, 140, 80, 90); ctx.stroke();
      ctx.fillStyle = ROCK; for (let i = 0; i < 6; i++) ctx.fillRect(-140 + i * 30, 92 + Math.sin(i) * 3, 6, 12);
    } },
    { n: 'un schelet de Stegosaurus', t: 'Stegosaurus avea plăci mari pe spate și 4 țepi în coadă. Plăcile poate îl ajutau să se încălzească la soare sau să-și sperie dușmanii.', draw: function (ctx) {
      ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-350, 30); ctx.quadraticCurveTo(-150, -110, 30, -90); ctx.quadraticCurveTo(200, -70, 300, 20); ctx.stroke();
      for (let i = 0; i < 9; i++) { const u = i / 8, x = -250 + u * 470, y = -60 - Math.sin(u * Math.PI) * 60, h = 40 + Math.sin(u * Math.PI) * 50; ctx.beginPath(); ctx.moveTo(x - 22, y + 8); ctx.lineTo(x, y - h); ctx.lineTo(x + 22, y + 8); ctx.closePath(); ctx.fill(); }
      ribs(ctx, -130, 10, 22, -80, 110);
      for (const [x, a] of [[-330, -0.9], [-310, -0.5], [-345, 0.6], [-325, 0.9]]) { ctx.save(); ctx.translate(x, 30); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(0, -60); ctx.lineTo(6, 0); ctx.fill(); ctx.restore(); }
      leg(ctx, -80, -40, -0.2, 90, 80, 12); leg(ctx, -40, -40, 0.1, 90, 80, 11); leg(ctx, 170, -40, 0.15, 70, 60, 10); leg(ctx, 200, -30, -0.1, 70, 60, 9);
      ctx.beginPath(); ctx.ellipse(310, 30, 34, 16, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = ROCK; ctx.beginPath(); ctx.arc(318, 24, 5, 0, Math.PI * 2); ctx.fill();
    } },
    { n: 'un schelet de Brachiosaurus', t: 'Gâtul lui Brachiosaurus avea vertebre uriașe, unele cât un copil! Paleontologii găsesc de obicei doar câteva oase și ghicesc restul.', draw: function (ctx) {
      ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(-380, 40); ctx.quadraticCurveTo(-200, -40, -60, -20); ctx.quadraticCurveTo(80, -10, 150, -80); ctx.quadraticCurveTo(220, -170, 250, -200); ctx.stroke();
      for (let i = 0; i < 10; i++) { const u = i / 9, x = 160 + u * 85, y = -90 - u * 110; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(275, -205, 34, 18, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = ROCK; ctx.beginPath(); ctx.arc(275, -212, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = BONE;
      ribs(ctx, -130, 9, 24, -25, 110, 6);
      leg(ctx, -140, -10, -0.1, 100, 90, 15); leg(ctx, -100, -10, 0.15, 100, 90, 13); leg(ctx, 60, -20, 0.05, 110, 90, 14); leg(ctx, 100, -25, -0.15, 110, 90, 12);
    } },
    { n: 'un schelet de Pteranodon', t: 'Oasele lui Pteranodon erau goale pe dinăuntru, ca la păsări, ca să fie ușor în zbor. Aripa era făcută din pielea întinsă pe un deget foarte lung!', draw: function (ctx) {
      ctx.lineWidth = 7; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(s * 90, -60); ctx.lineTo(s * 160, -20); ctx.lineTo(s * 380, -110); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(s * 160, -20); ctx.lineTo(s * 175, 10); ctx.moveTo(s * 160, -20); ctx.lineTo(s * 185, -5); ctx.stroke(); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(s * 10, 60); ctx.lineTo(s * 40, 130); ctx.lineTo(s * 30, 180); ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(0, 20, 22, 50, 0, 0, Math.PI * 2); ctx.fill(); ribs(ctx, -14, 4, 9, 0, 40, 3);
      ctx.beginPath(); ctx.moveTo(-10, -60); ctx.lineTo(-170, -70); ctx.lineTo(-10, -40); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(10, -60); ctx.lineTo(120, -140); ctx.lineTo(0, -45); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, -55, 22, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = ROCK; ctx.beginPath(); ctx.arc(-6, -58, 6, 0, Math.PI * 2); ctx.fill();
    } },
    { n: 'un amonit', t: 'Amoniții erau rude ale caracatițelor, cu o cochilie în spirală. Au trăit în mări pe vremea dinozaurilor. Fosilele lor se găsesc și în România!', draw: function (ctx) {
      ctx.fillStyle = STONE; ctx.beginPath(); ctx.arc(0, 0, 170, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#8a7652'; ctx.lineWidth = 5;
      ctx.beginPath(); for (let a = 0; a < Math.PI * 7; a += 0.05) { const r = 170 * Math.exp(-a * 0.12); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke();
      ctx.lineWidth = 3; for (let a = 0; a < Math.PI * 6; a += 0.22) { const r1 = 170 * Math.exp(-a * 0.12), r2 = 170 * Math.exp(-(a + Math.PI * 2) * 0.12); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); ctx.stroke(); }
    } },
    { n: 'un trilobit', t: 'Trilobiții au trăit în mări acum peste 500 de milioane de ani, cu mult înaintea dinozaurilor. Erau rude cu insectele și racii și aveau ochi făcuți din cristale!', draw: function (ctx) {
      ctx.save(); ctx.rotate(-0.2); ctx.fillStyle = STONE; ctx.beginPath(); ctx.ellipse(0, 0, 140, 210, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#7a6648'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0, -150, 135, 70, 0, Math.PI, Math.PI * 2); ctx.closePath(); ctx.stroke(); ctx.fillStyle = '#b8a47e'; ctx.beginPath(); ctx.ellipse(0, -160, 40, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(-70, -150, 18, 14, 0, 0, Math.PI * 2); ctx.ellipse(70, -150, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 12; i++) { const y = -90 + i * 22, w = 130 * Math.sqrt(1 - Math.pow((y + 10) / 220, 2)); ctx.beginPath(); ctx.moveTo(-w, y); ctx.quadraticCurveTo(0, y + 10, w, y); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-40, -100); ctx.lineTo(-30, 190); ctx.moveTo(40, -100); ctx.lineTo(30, 190); ctx.stroke(); ctx.restore();
    } },
    { n: 'un pește fosil', t: 'Când un pește moare și e acoperit repede de mâl, oasele lui se pot transforma în piatră. Așa vedem azi pești de acum milioane de ani, cu fiecare os la locul lui.', draw: function (ctx) {
      ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-280, 0); ctx.quadraticCurveTo(0, -20, 230, 0); ctx.stroke();
      ctx.lineWidth = 3; for (let i = 0; i < 22; i++) { const x = -200 + i * 19, k = Math.sin((i + 1) / 23 * Math.PI); ctx.beginPath(); ctx.moveTo(x, -8); ctx.quadraticCurveTo(x + 12, -60 * k, x + 22, -100 * k); ctx.moveTo(x, -4); ctx.quadraticCurveTo(x + 12, 50 * k, x + 22, 90 * k); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-280, 0); ctx.lineTo(-360, -80); ctx.lineTo(-340, 0); ctx.lineTo(-360, 80); ctx.closePath(); ctx.stroke();
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(230, -60); ctx.quadraticCurveTo(320, -40, 330, 10); ctx.quadraticCurveTo(300, 60, 230, 60); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(285, -15, 14, 0, Math.PI * 2); ctx.stroke();
    } }
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
      const GW = 40, GH = 22; let fos = 0, first = true; function resetSand() { sand = new Float32Array(GW * GH).fill(1); found = 0; if (first) { first = false; fos = Math.floor(Math.random() * FOS.length); } else { let n; do { n = Math.floor(Math.random() * FOS.length); } while (n === fos); fos = n; } }
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
            /* fosila de dedesubt (alta la fiecare groapă nouă) */
            ctx.save(); ctx.translate(500, 330); ctx.strokeStyle = BONE; ctx.fillStyle = BONE; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 9;
            FOS[fos].draw(ctx, t);
            ctx.restore();
            /* nisipul */
            let left = 0; for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const a = sand[j * GW + i]; left += a; if (a <= 0.02) continue; ctx.fillStyle = 'rgba(' + (196 + ((i * 7 + j * 3) % 5) * 6) + ',' + (160 + ((i * 3 + j * 5) % 5) * 5) + ',110,' + a + ')'; ctx.fillRect(100 + i * 20, 120 + j * (400 / GH), 21, 400 / GH + 1); }
            const pct = 1 - left / (GW * GH);
            if (pct > 0.7 && !found) { found = 1; api.say('<b>🎉 Ai găsit: ' + FOS[fos].n + '!</b> ' + FOS[fos].t); }
            A.label(ctx, pct > 0.7 ? '🎉 Ai găsit: ' + FOS[fos].n + '!' : '👆 Freacă cu degetul ca să sapi · ' + Math.round(pct * 100) + '%', 500, 60, { size: 18 });
          }
          ctx.restore();
        }
      };
    }
  });
})();
