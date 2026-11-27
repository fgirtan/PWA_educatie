/* Modul: Harta lumii — continente, oceane, România */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  /* contururi simplificate [longitudine, latitudine] */
  const WORLD = {
    namerica: { n: 'America de Nord', c: '#e8a04a', p: [[-168, 66], [-162, 70], [-140, 70], [-120, 72], [-95, 72], [-80, 73], [-65, 62], [-55, 52], [-66, 45], [-75, 38], [-80, 32], [-81, 25], [-90, 30], [-97, 27], [-97, 20], [-87, 21], [-83, 10], [-78, 8], [-85, 14], [-92, 15], [-105, 20], [-110, 24], [-115, 30], [-120, 35], [-124, 42], [-124, 48], [-135, 58], [-150, 60], [-165, 62]], an: ['🦅', '🐻', '🦬', '🦝'], f: 'Aici sunt <b>Canada, SUA și Mexic</b>. Au munți înalți (Munții Stâncoși), cascada Niagara și Marele Canion.' },
    greenland: { n: 'Groenlanda', c: '#dfe9f2', p: [[-52, 60], [-42, 60], [-22, 70], [-20, 80], [-60, 82], [-72, 78], [-56, 70]], an: ['🐻‍❄️'], f: 'Cea mai mare insulă din lume, acoperită aproape în întregime de gheață. Ține de America de Nord.' },
    samerica: { n: 'America de Sud', c: '#6ac85a', p: [[-78, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -42], [-68, -52], [-74, -52], [-72, -40], [-71, -30], [-70, -18], [-76, -12], [-81, -5], [-80, 2]], an: ['🦜', '🐒', '🦙', '🐆'], f: 'Aici e <b>pădurea Amazonului</b>, cea mai mare junglă din lume, și Munții Anzi, cu lame și condori.' },
    europe: { n: 'Europa', c: '#5aa0e8', p: [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [5, 53], [8, 57], [5, 62], [15, 69], [25, 71], [40, 68], [55, 68], [58, 56], [52, 47], [40, 44], [30, 41], [26, 40], [23, 36], [20, 40], [15, 38], [12, 44], [8, 44], [3, 42], [-2, 36]], an: ['🦌', '🐻', '🦊', '🦉'], f: '<b>Aici suntem noi!</b> Europa e un continent mic, dar cu multe țări. România e în sud-estul Europei, cu Munții Carpați și Marea Neagră.' },
    uk: { n: 'Europa', c: '#5aa0e8', p: [[-5, 50], [1, 51], [0, 53], [-3, 56], [-6, 58], [-5, 54]], part: 'europe' },
    asia: { n: 'Asia', c: '#e8d04a', p: [[58, 56], [55, 68], [80, 73], [100, 77], [120, 73], [140, 72], [160, 70], [180, 68], [180, 62], [163, 58], [155, 50], [142, 46], [135, 43], [128, 35], [122, 30], [120, 22], [108, 18], [106, 10], [100, 13], [103, 2], [98, 8], [92, 20], [88, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 25], [52, 27], [48, 30], [56, 18], [45, 12], [38, 20], [35, 30], [36, 36], [40, 42], [52, 47]], an: ['🐼', '🐯', '🐘', '🐪'], f: 'Cel mai mare continent, cu cei mai mulți oameni. Aici e cel mai înalt munte din lume, <b>Everestul</b>, și Marele Zid Chinezesc.' },
    japan: { n: 'Asia', c: '#e8d04a', p: [[130, 31], [135, 34], [140, 36], [142, 40], [141, 45], [139, 42], [136, 36], [131, 34]], part: 'asia' },
    indo: { n: 'Asia', c: '#e8d04a', p: [[95, 5], [105, -6], [115, -8], [120, -9], [110, -3], [100, 1]], part: 'asia' },
    africa: { n: 'Africa', c: '#e86a5a', p: [[-17, 15], [-17, 21], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [34, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [28, -34], [18, -35], [12, -18], [14, -8], [9, 4], [-8, 4], [-15, 10]], an: ['🦁', '🦒', '🐘', '🦓'], f: 'Aici e <b>deșertul Sahara</b>, cel mai mare deșert fierbinte, savana cu lei și girafe, și <b>Nilul</b>, unul dintre cele mai lungi râuri din lume.' },
    madagascar: { n: 'Africa', c: '#e86a5a', p: [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]], part: 'africa' },
    australia: { n: 'Australia', c: '#c86ae8', p: [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -28], [150, -37], [140, -38], [131, -31], [116, -35], [114, -28]], an: ['🦘', '🐨', '🦎', '🐊'], f: 'Un continent-insulă. Aici trăiesc animale care nu există în altă parte: <b>cangurul</b> și <b>koala</b>.' },
    nz: { n: 'Australia', c: '#c86ae8', p: [[172, -35], [175, -37], [178, -38], [174, -42], [168, -46], [171, -42]], part: 'australia' },
    antarctica: { n: 'Antarctica', c: '#f0f6fc', p: [[-180, -66], [-120, -72], [-60, -64], [0, -70], [60, -67], [120, -66], [180, -67], [180, -85], [-180, -85]], an: ['🐧', '🦭'], f: 'Cel mai rece loc de pe Pământ, acoperit de gheață groasă de kilometri. Aici trăiesc <b>pinguinii</b>, dar nu trăiesc oameni permanent.' }
  };
  window.WORLD = WORLD;
  const OCEANS = [['Oceanul Pacific', -150, 5], ['Oceanul Atlantic', -35, 20], ['Oceanul Indian', 75, -20], ['Oceanul Arctic', 0, 82], ['Oceanul Pacific', 170, 10]];
  defineModule({
    id: 'worldmap', title: 'Harta lumii', sub: 'Continentele, oceanele și unde e România',
    start: function (api) {
      const ctx = api.ctx; let sel = null, selT = 0;
      const r = api.row(''), bs = {};
      ['europe', 'asia', 'africa', 'namerica', 'samerica', 'australia', 'antarctica'].forEach((k) => { bs[k] = api.button(r, WORLD[k].n, () => pick(k)); });
      const br = api.button(r, '📍 România', () => { pick('europe'); selT = 0; ro = 1; api.say('<b>📍 România</b> e în sud-estul Europei. Are munți (Carpații), dealuri, câmpii, Delta Dunării și ieșire la <b>Marea Neagră</b>. Capitala e <b>București</b>.'); });
      let ro = 0;
      function pick(k) { sel = k; selT = 0; ro = 0; for (const q in bs) bs[q].classList.toggle('on', q === k); const w = WORLD[k]; api.say('<b>' + w.n + '.</b> ' + w.f); }
      api.say('Pe Pământ sunt <b>7 continente</b> (bucăți mari de uscat) și <b>5 oceane</b>. Atinge un continent ca să vezi ce animale trăiesc acolo!');
      let V = null, proj = null;
      const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
      api.pointer({ down: (x, y) => { if (!V || !proj) return; const p = V.inv(x, y), lon = (p[0] - proj.x0) / proj.k - 180, lat = 85 - (p[1] - proj.y0) / proj.k; for (const k in WORLD) if (inPoly(lon, lat, WORLD[k].p)) { pick(WORLD[k].part || k); return; } } });
      return {
        frame: function (dt, t) {
          selT += dt;
          ctx.fillStyle = '#0b3d78'; ctx.fillRect(0, 0, api.W, api.H);
          V = window.Fit(api, 1000, 560); ctx.save(); V.apply(ctx);
          const k = 1000 / 360, x0 = 0, y0 = 0; proj = { k: k, x0: x0, y0: y0 };
          const P = (lon, lat) => [x0 + (lon + 180) * k, y0 + (85 - lat) * k];
          const og = ctx.createLinearGradient(0, 0, 0, 560); og.addColorStop(0, '#2a6ab0'); og.addColorStop(0.5, '#1e7ac8'); og.addColorStop(1, '#2a6ab0'); ctx.fillStyle = og; ctx.fillRect(0, 0, 1000, 170 * k);
          ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; for (let lo = -180; lo <= 180; lo += 30) { const a = P(lo, 85), b = P(lo, -85); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } for (let la = -60; la <= 80; la += 30) { const a = P(-180, la), b = P(180, la); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
          const eq = P(0, 0); ctx.strokeStyle = 'rgba(255,220,120,0.35)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(0, eq[1]); ctx.lineTo(1000, eq[1]); ctx.stroke(); ctx.setLineDash([]); A.text(ctx, 'Ecuatorul', 60, eq[1] - 10, { size: 12, color: 'rgba(255,220,120,0.7)' });
          for (const o of OCEANS) { const p = P(o[1], o[2]); A.text(ctx, o[0], p[0], p[1], { size: 15, color: 'rgba(200,230,255,0.7)', halo: false }); }
          for (const key in WORLD) { const w = WORLD[key], on = sel && (key === sel || w.part === sel); ctx.beginPath(); w.p.forEach((q, i) => { const p = P(q[0], q[1]); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = on ? A.shade(w.c, 0.25) : sel ? A.mix(w.c, '#5a6a7a', 0.45) : w.c; ctx.fill(); ctx.strokeStyle = on ? '#fff' : 'rgba(0,0,0,0.25)'; ctx.lineWidth = on ? 3 : 1.5; ctx.stroke(); }
          /* animalele continentului ales */
          if (sel) { const w = WORLD[sel]; let cx = 0, cy = 0; w.p.forEach((q) => { cx += q[0]; cy += q[1]; }); cx /= w.p.length; cy /= w.p.length; if (sel === 'antarctica') cy = -75; const c = P(cx, cy); w.an.forEach((e, i) => { const a = i / w.an.length * TAU + selT * 0.4, rr = 34 + Math.min(1, selT * 2) * 30; window.Emoji(ctx, e, c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr * 0.7, 36 * Math.min(1, selT * 2)); }); A.label(ctx, w.n, c[0], c[1] - 90 < 20 ? c[1] + 100 : c[1] - 90, { size: 18, color: '#ffe08a' }); }
          /* România */
          const rp = P(25, 46); const pulse = 1 + 0.3 * Math.sin(t * 4); A.glow(ctx, rp[0], rp[1], 22 * pulse, '#ff4d6d', 0.8); ctx.fillStyle = '#ff4d6d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(rp[0], rp[1], 6, 0, TAU); ctx.fill(); ctx.stroke();
          A.label(ctx, '📍 Aici suntem noi!', rp[0] + (ro ? 0 : 0), rp[1] - 30, { size: ro ? 18 : 13, color: '#ffd0dc' });
          ctx.restore();
        }
      };
    }
  });
})();
