/* ============================================================
   MODULE: PLANETA PĂMÂNT
   1) Pământul în timp  2) Formarea reliefului (+Everest)  3) Vulcani
   4) Straturile Pământului  5) Oceane și adâncimi
   ============================================================ */
(function () {
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtN = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 0 : d });
  const mix = (c1, c2, t) => [0, 1, 2].map((i) => Math.round(lerp(c1[i], c2[i], clamp(t, 0, 1))));
  const rgb = (c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  function stars(n) { const a = []; for (let i = 0; i < n; i++) a.push([Math.random(), Math.random(), Math.random() * 1.4 + 0.3]); return a; }
  function drawStars(api, st) { api.ctx.fillStyle = 'rgba(255,255,255,0.65)'; for (const s of st) api.ctx.fillRect(s[0] * api.W, s[1] * api.H, s[2], s[2]); }

  /* ============================================================
     1) PĂMÂNTUL ÎN TIMP
     ============================================================ */
  const BLOBS = [
    [[-100, 45], [-25, 35], 26, 18], [[-120, 62], [-35, 50], 14, 8], [[-95, 20], [-40, 18], 9, 10], [[-42, 73], [-8, 62], 12, 8],
    [[-60, -15], [-15, -20], 14, 24], [[-68, -42], [-18, -45], 6, 12],
    [[15, 18], [5, 10], 24, 17], [[24, -15], [10, -15], 14, 16],
    [[15, 50], [15, 40], 16, 9], [[18, 64], [20, 55], 8, 7],
    [[70, 50], [60, 48], 28, 13], [[115, 52], [85, 52], 28, 14], [[105, 28], [75, 22], 18, 14],
    [[78, 22], [35, -30], 8, 10], [[47, 24], [30, 20], 8, 8], [[134, -25], [50, -50], 15, 10]
  ];
  const ERAS = [
    { ma: 4600, e: '🔥', n: 'Pământul se naște', t: 'O minge de rocă topită. Un corp cât Marte (Theia) o lovește, iar din resturi se naște Luna — la început, de zeci de ori mai aproape decât acum.' },
    { ma: 4000, e: '🌋', n: 'Lava se răcește', t: 'Se formează prima scoarță. Vulcanii erup peste tot, iar asteroizii continuă să lovească planeta. Nu există oxigen în aer.' },
    { ma: 3800, e: '🦠', n: 'Oceanele și prima viață', t: 'Vaporii au plouat milioane de ani și au umplut oceanele. În apă apar primele viețuitoare, microscopice.' },
    { ma: 2400, e: '🫧', n: 'Marea oxigenare', t: 'Alge microscopice produc oxigen. Aerul se schimbă, cerul devine albastru, iar fierul din ape ruginește.' },
    { ma: 720, e: '❄️', n: 'Pământ-bulgăre de zăpadă', t: 'Se crede că aproape toată planeta a fost acoperită de gheață, chiar și lângă ecuator.' },
    { ma: 635, e: '🪼', n: 'Gheața se topește', t: 'Clima se încălzește. Apar primele animale mari, moi, ca meduzele.' },
    { ma: 540, e: '🐚', n: 'Explozia cambriană', t: 'În câteva zeci de milioane de ani apar aproape toate marile grupe de animale: trilobiți, viermi, primii pești.' },
    { ma: 470, e: '🌱', n: 'Plantele ies pe uscat', t: 'Primele plante cuceresc uscatul și continentele încep să înverzească. Apoi urmează insectele.' },
    { ma: 250, e: '☠️', n: 'Pangeea și Marea Moarte', t: 'Toate continentele sunt lipite într-unul singur: Pangeea. Erupții uriașe în Siberia ucid ~90% din speciile marine.' },
    { ma: 230, e: '🦖', n: 'Epoca dinozaurilor', t: 'Pangeea se desparte încet. Dinozaurii domnesc pe uscat timp de peste 160 de milioane de ani.' },
    { ma: 66, e: '☄️', n: 'Asteroidul', t: 'Un asteroid de ~10 km lovește Mexicul. Dinozaurii dispar; supraviețuiesc păsările și mamiferele mici.' },
    { ma: 50, e: '🏔️', n: 'India lovește Asia', t: 'India, care „a înotat” spre nord, se ciocnește de Asia. Pământul se încrețește și se ridică Himalaya — cu Everestul.' },
    { ma: 3, e: '🧍', n: 'Strămoșii noștri', t: 'Pe aceeași scară, oamenii de azi (apăruți acum ~300.000 de ani) abia dacă ocupă ultima clipă.' },
    { ma: 0.02, e: '🌍', n: 'Azi', t: 'Continentele de azi. Se mișcă în continuare, cam cât cresc unghiile tale: 2–5 cm pe an.' }
  ];
  defineModule({
    id: 'earthtime', title: 'Pământul în timp', sub: 'De acum 4,6 miliarde de ani până azi',
    start: function (api) {
      const ctx = api.ctx, ST = stars(140);
      let s = 0, spin = 0, lastEra = -1, playing = false;
      const S = 150, off = document.createElement('canvas'); off.width = off.height = S;
      const octx = off.getContext('2d'), img = octx.createImageData(S, S);
      const ma = () => 4600 * Math.pow(1 - s, 3);
      const eraIdx = () => { const m = ma(); let k = 0; for (let i = 0; i < ERAS.length; i++) if (m <= ERAS[i].ma) k = i; return k; };
      const maText = (m) => m >= 1000 ? fmtN(m / 1000, 2) + ' miliarde de ani' : m >= 1 ? fmtN(m, 0) + ' milioane de ani' : 'azi';

      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Acum', min: 0, max: 1, step: 0.0005, value: 0, fmt: () => maText(ma()), onInput: (v) => { s = v; playing = false; bP.innerHTML = '▶ Derulează'; } });
      const bP = api.button(r1, '▶ Derulează', () => { if (s >= 0.999) s = 0; playing = !playing; bP.innerHTML = playing ? '⏸ Pauză' : '▶ Derulează'; });
      const r2 = api.row('Salt la');
      [['🔥 Naștere', 0], ['🦠 Viață', 0.075], ['🫧 Oxigen', 0.2], ['🐚 Cambrian', 0.51], ['🦖 Dinozauri', 0.62], ['☄️ Asteroid', 0.757], ['🌍 Azi', 1]]
        .forEach(([t, v]) => api.button(r2, t, () => { s = v; playing = false; bP.innerHTML = '▶ Derulează'; sl.set(v); }));

      function landNow() {
        const m = ma(), f = m >= 250 ? 0 : 1 - m / 250;
        const k = m >= 4000 ? 0.12 : m >= 540 ? lerp(1, 0.3, (m - 540) / 3460) : 1;
        return BLOBS.map((b) => ({ lon: lerp(b[1][0], b[0][0], f), lat: lerp(b[1][1], b[0][1], f), rx: b[2] * k, ry: b[3] * k }));
      }
      function renderGlobe() {
        const m = ma(), L = landNow(), d = img.data, h = S / 2;
        const lava = m > 4000, snow = m < 720 && m > 635;
        const ocean = lava ? [255, 90, 30] : m > 2400 ? [60, 100, 70] : mix([40, 90, 140], [30, 100, 190], 0.5);
        const oc = m > 3800 ? (m > 2400 ? [62, 106, 82] : mix([62, 106, 82], [28, 98, 188], (2400 - m) / 1900)) : ocean;
        const landC = lava ? [60, 30, 25] : m > 470 ? [138, 120, 100] : mix([138, 120, 100], [70, 150, 70], (470 - m) / 150);
        const cs = Math.cos(spin), sn = Math.sin(spin);
        for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
          const nx = (i + 0.5 - h) / h, ny = (j + 0.5 - h) / h, r2 = nx * nx + ny * ny, o = (j * S + i) * 4;
          if (r2 > 1) { d[o + 3] = 0; continue; }
          const z = Math.sqrt(1 - r2), y = -ny;
          const xr = nx * cs + z * sn, zr = -nx * sn + z * cs;
          const lon = Math.atan2(xr, zr) * 57.2958, lat = Math.asin(y) * 57.2958;
          const cl = Math.cos(lat * 0.01745);
          const noise = 0.5 * Math.sin(lon * 0.11 + 1.3) * Math.cos(lat * 0.17) + 0.35 * Math.sin(lon * 0.29 - lat * 0.23) + 0.2 * Math.sin(lon * 0.6 + lat * 0.5);
          let land = lat < -77 && m < 540 ? true : false;
          if (!land) for (let q = 0; q < L.length; q++) {
            let dx = lon - L[q].lon; dx = ((dx + 540) % 360) - 180;
            const dd = (dx * cl / L[q].rx) * (dx * cl / L[q].rx) + ((lat - L[q].lat) / L[q].ry) * ((lat - L[q].lat) / L[q].ry) + 0.3 * noise;
            if (dd < 1) { land = true; break; }
          }
          let c = land ? landC : oc;
          if (lava) { const gl = 0.5 + 0.5 * Math.sin(lon * 0.4 + lat * 0.7 + spin * 3); c = land ? mix([50, 28, 24], [120, 50, 30], gl) : mix([255, 70, 20], [255, 190, 60], gl); }
          else {
            if (snow || Math.abs(lat) > (m < 3 ? 74 : 80)) c = mix(c, [235, 242, 250], snow ? 0.95 : 0.85);
            if (m < 3800) { const cn = Math.sin(lon * 0.21 + spin * 1.5) * Math.cos(lat * 0.33 + 1) + Math.sin(lon * 0.5 - lat * 0.4); if (cn > 1.05) c = mix(c, [255, 255, 255], clamp((cn - 1.05) * 2.2, 0, 0.6)); }
          }
          const sh = 0.28 + 0.8 * clamp(nx * -0.45 + y * 0.45 + z * 0.75, 0, 1);
          d[o] = c[0] * sh; d[o + 1] = c[1] * sh; d[o + 2] = c[2] * sh; d[o + 3] = 255;
        }
        octx.putImageData(img, 0, 0);
      }
      function sayEra() { const k = eraIdx(); if (k === lastEra) return; lastEra = k; api.say(ERAS[k].e + ' <b>' + ERAS[k].n + '.</b> ' + ERAS[k].t); }

      function frame(dt, t) {
        if (playing) { s = Math.min(1, s + dt / 40); sl.set(s); if (s >= 1) { playing = false; bP.innerHTML = '↺ De la început'; } }
        spin += dt * 0.35;
        const m = ma(), cx = api.cx, cy = api.cy, R = api.unit * 0.82;
        ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, api.W, api.H); drawStars(api, ST);
        renderGlobe(); sayEra();
        /* atmosfera */
        const ac = m > 4000 ? '255,120,50' : m > 2400 ? '170,150,90' : '110,180,255';
        const g = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.22);
        g.addColorStop(0, 'rgba(' + ac + ',0.5)'); g.addColorStop(1, 'rgba(' + ac + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, 7); ctx.fill();
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, cx - R, cy - R, R * 2, R * 2);
        /* Luna: mare și aproape la început */
        const mr = lerp(0.3, 0.1, clamp((4400 - m) / 1500, 0, 1)), md = lerp(1.35, 1.75, clamp((4400 - m) / 4400, 0, 1));
        if (m < 4580) { const mx = cx + R * md * 0.9, my = cy - R * md * 0.45; ctx.fillStyle = '#c9c4bd'; ctx.beginPath(); ctx.arc(mx, my, R * mr, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(mx + R * mr * 0.3, my + R * mr * 0.2, R * mr * 0.35, 0, 7); ctx.fill(); }
        /* impact de asteroid (66 Ma) și bombardament timpuriu */
        if (m < 69 && m > 63) { const k = 1 - Math.abs(m - 66) / 3; ctx.globalCompositeOperation = 'lighter'; const fg = ctx.createRadialGradient(cx - R * 0.35, cy + R * 0.15, 0, cx - R * 0.35, cy + R * 0.15, R * 0.6); fg.addColorStop(0, 'rgba(255,220,150,' + k + ')'); fg.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx - R * 0.35, cy + R * 0.15, R * 0.6, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
        if (m > 3900) for (let i = 0; i < 3; i++) { const a = (t * 0.9 + i * 2.1) % 3, px = cx + R * (1.2 - a * 0.6) * (i % 2 ? -1 : 1), py = cy - R * (1.1 - a * 0.5); ctx.strokeStyle = 'rgba(255,200,120,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (i % 2 ? 24 : -24), py - 18); ctx.stroke(); }
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '700 22px system-ui,sans-serif';
        ctx.fillText(m >= 1 ? 'Acum ' + maText(m) : 'Azi', cx, api.cy - api.unit - 6 < 90 ? 92 : api.cy - api.unit - 6);
        ctx.font = '38px system-ui,sans-serif'; ctx.fillText(ERAS[eraIdx()].e, api.W - 34, 84);
      }
      return { frame: frame };
    }
  });

  /* ============================================================
     2) FORMAREA REFLIEFULUI (secțiune transversală prin scoarță)
     ============================================================ */
  defineModule({
    id: 'relief', title: 'Formarea reliefului', sub: 'Plăcile tectonice construiesc munți, văi și oceane',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'collision', T = 0, playing = false, comp = 0, compPick = -1;
      const INFO = {
        collision: '<b>Ciocnire de plăci → munți.</b> Două plăci continentale se împing una într-alta și scoarța se încrețește în sus. Așa s-a născut Himalaya acum ~50 de milioane de ani, când India a lovit Asia. Everestul (8.849 m) încă crește ~4 mm pe an.',
        rift: '<b>Plăcile se depărtează → rift și ocean.</b> Scoarța se întinde și se rupe: apare o vale, apoi magma iese la suprafață. Așa se naște un ocean nou — Marea Roșie se deschide chiar acum.',
        subduction: '<b>O placă intră sub alta → vulcani.</b> Placa oceanică, mai grea, se scufundă în manta și formează un șanț adânc. Ea se topește, iar magma urcă și face un lanț de vulcani (Anzii, „Inelul de Foc”).',
        erosion: '<b>Eroziunea → munți tociți.</b> Ploaia, gheața și râurile macină munții încet. Munții Apalași (SUA) au fost cândva la fel de înalți ca Himalaya. Munții noștri Carpați au și ei zeci de milioane de ani.',
        heights: '<b>Cât de înalt?</b> Atinge un munte să-l compari. Everestul e cel mai înalt deasupra mării, dar măsurat de la bază cel mai înalt pe Pământ e Mauna Kea. Pe Marte, Olympus Mons le bate pe toate!'
      };
      const bs = {};
      const modes = [['collision', '🏔️ Ciocnire'], ['rift', '🌊 Rift'], ['subduction', '🌋 Subducție'], ['erosion', '🌧️ Eroziune'], ['heights', '📏 Înălțimi']];
      const rm = api.row('Procese');
      modes.forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rt = api.row('');
      const sl = api.slider(rt, { label: 'Timp', min: 0, max: 60, step: 0.1, value: 0, fmt: (v) => fmtN(v, 0) + ' mil. ani', onInput: (v) => { T = v; playing = false; bP.innerHTML = '▶'; } });
      const bP = api.button(rt, '▶ Pornește', () => { if (T >= 60) T = 0; playing = !playing; bP.innerHTML = playing ? '⏸' : '▶ Pornește'; });
      function setMode(k) { mode = k; T = 0; sl.set(0); playing = k !== 'heights'; bP.innerHTML = playing ? '⏸' : '▶ Pornește'; rt.style.display = k === 'heights' ? 'none' : ''; for (const j in bs) bs[j].classList.toggle('on', j === k); api.say(INFO[k]); api.layout(); }
      const PEAKS = [['Turnul Burj Khalifa', 0.828, '#9fb0c8', 'Cea mai înaltă clădire: 828 m.'], ['Vf. Moldoveanu', 2.544, '#7ea36b', 'Cel mai înalt vârf din România: 2.544 m.'], ['Mont Blanc', 4.806, '#a9c4de', 'Cel mai înalt vârf din Alpi: 4.806 m.'], ['Everest', 8.849, '#e8eef7', 'Cel mai înalt munte deasupra nivelului mării: 8.849 m. Avionul de pasageri zboară mai sus!'], ['Mauna Kea (de la bază)', 10.2, '#6c8a5a', 'Vulcan din Hawaii: doar 4.207 m deasupra mării, dar 10.200 m de la baza lui de pe fundul oceanului.'], ['Olympus Mons (Marte)', 21.9, '#c9694a', 'Vulcanul de pe Marte: 21,9 km — aproape de 2,5 ori Everestul!']];
      api.pointer({ down: (x, y) => { if (mode !== 'heights') return; const L = peakLayout(); let best = -1; L.forEach((p, i) => { if (Math.abs(x - p.x) < p.w / 2 && y > p.y - 10) best = i; }); if (best >= 0) { compPick = best; api.say('<b>' + PEAKS[best][0] + '.</b> ' + PEAKS[best][3]); } } });
      function peakLayout() {
        const W = api.W, base = api.cy + api.unit * 0.88, maxH = api.unit * 1.7, n = PEAKS.length, w = Math.min(90, (W - 20) / n);
        return PEAKS.map((p, i) => ({ x: W * (i + 0.5) / n, w: w, y: base - p[1] / 21.9 * maxH, base: base }));
      }
      /* relieful: înălțimea suprafeței (km, +sus) la poziția u ∈[0,1] */
      function surf(u, t) {
        const g = (c, w) => Math.exp(-Math.pow((u - c) / w, 2));
        const k = t / 60;
        if (mode === 'collision') return 0.2 + 8.8 * Math.pow(k, 0.8) * g(0.5, 0.11 + 0.05 * k) + 1.4 * k * g(0.5, 0.3) - 0.3 * g(0.36, 0.05) * k;
        if (mode === 'rift') { const w = 0.03 + 0.1 * k; return 0.3 - 1.2 * k * g(0.5, w * 1.2) + 0.5 * k * (g(0.5 - w * 1.6, 0.04) + g(0.5 + w * 1.6, 0.04)); }
        if (mode === 'subduction') return 0.3 - 3.2 * Math.min(1, k * 1.6) * g(0.42, 0.035) + (0.1 + 4.5 * k) * g(0.7, 0.07) + (0.3 + 1.5 * k) * g(0.6, 0.08) * 0.5 - 0.5 * (u < 0.42 ? 1 : 0) * (0.6);
        return 0.2 + 8.8 * Math.exp(-t / 22) * g(0.5, 0.12 + 0.12 * (t / 60)) + 0.3 * Math.exp(-t / 30);
      }
      function frame(dt, t) {
        if (playing && mode !== 'heights') { T = Math.min(60, T + dt * 4.5); sl.set(T); if (T >= 60) { playing = false; bP.innerHTML = '↺'; } }
        const W = api.W, H = api.H; ctx.fillStyle = '#0b1230'; ctx.fillRect(0, 0, W, H);
        const g0 = ctx.createLinearGradient(0, 0, 0, H); g0.addColorStop(0, '#2c6aa8'); g0.addColorStop(0.55, '#a9d2ee'); g0.addColorStop(1, '#d6ebf7'); ctx.fillStyle = g0; ctx.fillRect(0, 0, W, api.cy + api.unit * 0.4);
        if (mode === 'heights') return drawHeights(t);
        const x0 = 8, x1 = W - 8, cw = x1 - x0, base = api.cy + api.unit * 0.25, km = api.unit * 1.5 / 22 * 2.2;
        const N = 90, sea = 0;
        /* apă (rift târziu și subducție: ocean în stânga) */
        const oceanLeft = mode === 'subduction', riftSea = mode === 'rift' && T > 14;
        /* manta */
        const gm = ctx.createLinearGradient(0, base + 40, 0, H); gm.addColorStop(0, '#d9561f'); gm.addColorStop(1, '#8a1f0c');
        ctx.fillStyle = gm; ctx.fillRect(0, base + 40, W, H - base - 40);
        for (let i = 0; i < 14; i++) { const px = (i / 14 + t * 0.02 * (i % 2 ? 1 : -1)) % 1; ctx.fillStyle = 'rgba(255,190,80,0.25)'; ctx.beginPath(); ctx.arc(px * W, base + 90 + (i % 4) * 28, 12 + (i % 3) * 6, 0, 7); ctx.fill(); }
        /* scoarța */
        const thick = (u) => 0.9 + (mode === 'collision' ? Math.max(0, surf(u, T) - 0.3) * 1.5 : mode === 'erosion' ? Math.max(0, surf(u, T) - 0.3) * 2.2 : 0);
        ctx.beginPath(); ctx.moveTo(x0, base);
        const pts = [];
        for (let i = 0; i <= N; i++) { const u = i / N; pts.push([x0 + u * cw, base - surf(u, T) * km]); }
        pts.forEach((p) => ctx.lineTo(p[0], p[1]));
        for (let i = N; i >= 0; i--) { const u = i / N; ctx.lineTo(x0 + u * cw, base + 40 + thick(u) * km * 1.0); }
        ctx.closePath();
        const gc = ctx.createLinearGradient(0, base - 9 * km, 0, base + 60); gc.addColorStop(0, '#ece9e2'); gc.addColorStop(0.18, '#8a7a62'); gc.addColorStop(0.6, '#5a4a3a'); gc.addColorStop(1, '#3a2f28');
        ctx.fillStyle = gc; ctx.fill();
        /* straturi (cute) */
        ctx.save(); ctx.clip();
        for (let b = 1; b <= 5; b++) { ctx.strokeStyle = b % 2 ? 'rgba(220,170,100,0.45)' : 'rgba(90,60,40,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= N; i++) { const u = i / N, y = base - (surf(u, T) - 0.2) * km * (1 - b * 0.12) + b * 7; i ? ctx.lineTo(x0 + u * cw, y) : ctx.moveTo(x0 + u * cw, y); } ctx.stroke(); }
        ctx.restore();
        /* apa */
        if (oceanLeft || riftSea) {
          ctx.fillStyle = 'rgba(30,110,190,0.75)'; ctx.beginPath(); ctx.moveTo(x0, base);
          const xe = oceanLeft ? x0 + cw * 0.5 : x1; ctx.lineTo(x0, base - 6); ctx.lineTo(xe, base - 6);
          for (let i = N; i >= 0; i--) { const u = i / N, px = x0 + u * cw; if (px <= xe) ctx.lineTo(px, Math.max(base - 6, base - surf(u, T) * km)); }
          ctx.closePath(); ctx.fill();
        }
        /* subducție: placa care intră */
        if (mode === 'subduction') {
          ctx.strokeStyle = '#4a3a30'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(x0 + cw * 0.42, base + 50); ctx.quadraticCurveTo(x0 + cw * 0.6, base + 90, x0 + cw * 0.78, base + 190); ctx.stroke();
          /* vulcani */
          const k = T / 60;
          for (let i = 0; i < 3; i++) { const vx = x0 + cw * (0.62 + i * 0.07), vy = base - surf(0.62 + i * 0.07, T) * km; if (k > 0.25) { ctx.fillStyle = 'rgba(255,90,30,0.9)'; ctx.beginPath(); ctx.arc(vx + (Math.random() - 0.5) * 3, vy - 4 - Math.random() * 12 * k, 3 + 3 * Math.random(), 0, 7); ctx.fill(); } }
          for (let i = 0; i < 8; i++) { const a = (t * 0.6 + i / 8) % 1; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x0 + cw * (0.45 + 0.28 * a), base + 55 + 125 * a * a + Math.sin(i * 5 + t * 6) * 4, 2.5, 2.5); }
        }
        if (mode === 'rift' && T > 8) { ctx.fillStyle = 'rgba(255,100,30,' + Math.min(1, (T - 8) / 15) + ')'; ctx.fillRect(x0 + cw * 0.5 - 3 - T * 0.15, base - surf(0.5, T) * km + 8, 6 + T * 0.3, base + 44 - (base - surf(0.5, T) * km + 8)); }
        /* săgeți de mișcare */
        const arrow = (x, y, dir) => { ctx.strokeStyle = '#ffd166'; ctx.fillStyle = '#ffd166'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dir * 50, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + dir * 62, y); ctx.lineTo(x + dir * 46, y - 9); ctx.lineTo(x + dir * 46, y + 9); ctx.fill(); };
        const ay = base + 25;
        if (mode === 'collision') { arrow(x0 + cw * 0.12, ay, 1); arrow(x1 - cw * 0.12, ay, -1); }
        if (mode === 'rift') { arrow(x0 + cw * 0.38, ay, -1); arrow(x1 - cw * 0.38, ay, 1); }
        if (mode === 'subduction') { arrow(x0 + cw * 0.12, ay, 1); arrow(x1 - cw * 0.12, ay, -0.0001); }
        /* ploaie la eroziune */
        if (mode === 'erosion') { ctx.strokeStyle = 'rgba(150,200,255,0.8)'; ctx.lineWidth = 1.5; for (let i = 0; i < 30; i++) { const rx = (i * 53.7 + t * 90) % W, ry = (i * 37 + t * 380) % (base - 40); ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 11); ctx.stroke(); } }
        /* altitudine / etichete */
        ctx.fillStyle = '#fff'; ctx.font = '600 13px system-ui,sans-serif'; ctx.textAlign = 'center';
        const lab = (txt, u, dy) => ctx.fillText(txt, x0 + u * cw, base - surf(u, T) * km - (dy || 14));
        if (mode === 'collision') { const h = surf(0.5, T) * 1000; lab('Altitudine: ' + fmtN(h) + ' m' + (h >= 8800 ? ' = Everest!' : ''), 0.5, 18); ctx.fillText('India', x0 + cw * 0.15, base + 12); ctx.fillText('Asia', x0 + cw * 0.85, base + 12); }
        if (mode === 'rift') { ctx.fillText(T > 14 ? 'Ocean nou' : 'Vale rift', x0 + cw * 0.5, base - 38); }
        if (mode === 'subduction') { ctx.fillText('Placa oceanică', x0 + cw * 0.2, base + 70); ctx.fillText('Șanț', x0 + cw * 0.42, base - 22); ctx.fillText('Anzi (vulcani)', x0 + cw * 0.68, base - surf(0.68, T) * km - 22); }
        if (mode === 'erosion') { const h = surf(0.5, T) * 1000; lab('Altitudine: ' + fmtN(h) + ' m', 0.5, 16); }
        ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillText('Secțiune prin scoarță · timpul curge ×milioane', 12, 90);
      }
      function drawHeights(t) {
        const L = peakLayout(), base = L[0].base;
        ctx.fillStyle = '#16355c'; ctx.fillRect(0, base, api.W, api.H - base);
        L.forEach((p, i) => {
          const c = PEAKS[i][2];
          ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(p.x - p.w / 2 - (i > 3 ? 20 : 0), base); ctx.lineTo(p.x, p.y); ctx.lineTo(p.x + p.w / 2 + (i > 3 ? 20 : 0), base); ctx.closePath(); ctx.fill();
          if (i === compPick) { ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.stroke(); }
          ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(fmtN(PEAKS[i][1] * 1000) + ' m', p.x, Math.max(120, p.y - 6));
          const words = PEAKS[i][0].split(' '); ctx.fillText(words[0], p.x, base + 16); if (words[1]) ctx.fillText(words.slice(1).join(' '), p.x, base + 29);
        });
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.setLineDash([5, 6]); const ey = L[3].y; ctx.beginPath(); ctx.moveTo(0, ey); ctx.lineTo(api.W, ey); ctx.stroke(); ctx.setLineDash([]);
        ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = '600 12px system-ui,sans-serif'; ctx.fillText('nivelul Everestului', 8, ey - 5);
      }
      setMode('collision');
      return { frame: frame };
    }
  });

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
        const sx = (erupt || (ptime && press > 0.3) ? (Math.random() - 0.5) * (4 + 14 * shake + press * 5) : 0), sy = sx * 0.6;
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

  /* ============================================================
     4) STRATURILE PĂMÂNTULUI
     ============================================================ */
  defineModule({
    id: 'layers', title: 'Straturile Pământului', sub: 'Coboară până în centrul planetei',
    start: function (api) {
      const ctx = api.ctx, ST = stars(100);
      let depth = 0, drilling = false, quake = null, selLayer = -1;
      const LAY = [
        { n: 'Scoarța', a: 0, b: 35, c: '#8b6d4a', t: 'Stratul subțire pe care trăim: 5–70 km grosime. Pe scara unui măr, e cât coaja lui.' },
        { n: 'Mantaua', a: 35, b: 2900, c: '#d2531c', t: 'Rocă fierbinte, care curge foarte, foarte încet (cm pe an). Reprezintă ~84% din volumul Pământului. Curenții ei mișcă plăcile tectonice.' },
        { n: 'Nucleul extern', a: 2900, b: 5150, c: '#f5a623', t: 'Fier și nichel topite, lichide! Mișcarea lor creează câmpul magnetic al Pământului, care ne apără de vântul solar.' },
        { n: 'Nucleul intern', a: 5150, b: 6371, c: '#fff1b5', t: 'O bilă solidă de fier, cât 70% din Lună. E atât de fierbinte ca suprafața Soarelui (~5.400°C), dar presiunea uriașă o ține solidă.' }
      ];
      const TAB = [[0, 15, 0], [35, 600, 1], [100, 1300, 3.5], [410, 1600, 14], [2900, 3700, 135], [5150, 5000, 329], [6371, 5400, 364]];
      const lookup = (d, k) => { for (let i = 1; i < TAB.length; i++) if (d <= TAB[i][0]) return lerp(TAB[i - 1][k], TAB[i][k], (d - TAB[i - 1][0]) / (TAB[i][0] - TAB[i - 1][0])); return TAB[TAB.length - 1][k]; };
      const layerOf = (d) => LAY.findIndex((l) => d >= l.a && d < l.b) < 0 ? 3 : LAY.findIndex((l) => d >= l.a && d < l.b);
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Adâncimea', min: 0, max: 1, step: 0.001, value: 0, fmt: () => fmtN(depth) + ' km', onInput: (v) => { depth = Math.pow(v, 2.2) * 6371; drilling = false; } });
      api.button(r1, '⛏️ Sapă singur', () => { drilling = true; if (depth >= 6370) { depth = 0; } });
      api.button(r1, '💥 Cutremur', () => { quake = { t: 0 }; api.say('<b>Unde seismice.</b> Undele P (verzi) trec prin tot Pământul. Undele S (roșii) NU trec prin nucleul extern — așa au aflat oamenii de știință că e lichid!', 10000); });
      const info = api.row('');
      const readout = document.createElement('div'); readout.className = 'mod-readout'; info.appendChild(readout);
      api.say('Trage de glisor ca să sapi spre centrul Pământului. Atinge un strat ca să afli despre el. Cea mai adâncă gaură făcută de oameni (Kola, Rusia) are doar 12 km!', 9000);
      api.pointer({ down: (x, y) => { const dx = x - api.cx, dy = y - api.cy, r = Math.hypot(dx, dy) / (api.unit * 0.86) * 6371; if (r < 6371) { const li = layerOf(6371 - r); selLayer = li; api.say('<b>' + LAY[li].n + '</b> (' + fmtN(LAY[li].a) + '–' + fmtN(LAY[li].b) + ' km). ' + LAY[li].t, 12000); } } });
      let lastL = -1;
      function frame(dt, t) {
        if (drilling) { depth = Math.min(6371, depth + dt * 330 + depth * dt * 0.12); sl.set(Math.pow(depth / 6371, 1 / 2.2)); if (depth >= 6371) drilling = false; }
        if (quake) { quake.t += dt; if (quake.t > 9) quake = null; }
        const cx = api.cx, cy = api.cy, R = api.unit * 0.86;
        ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, api.W, api.H); drawStars(api, ST);
        const px = (km) => km / 6371 * R;
        /* câmp magnetic */
        ctx.strokeStyle = 'rgba(140,200,255,0.28)'; ctx.lineWidth = 1.5;
        for (const k of [1.25, 1.5, 1.8]) { ctx.beginPath(); ctx.ellipse(cx, cy, R * k * 0.62, R * k, 0, 0, 7); ctx.stroke(); }
        /* felia scoasă */
        const wa0 = -Math.PI / 2 - 0.5, wa1 = -Math.PI / 2 + 0.5;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * 1.3, wa1, wa0 + Math.PI * 2); ctx.closePath(); ctx.clip();
        ctx.fillStyle = '#2a6fb5'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
        ctx.fillStyle = '#4f9a4a'; for (const [bx, by, br] of [[-0.45, -0.1, 0.28], [0.35, 0.3, 0.25], [0.2, -0.55, 0.17], [-0.2, 0.55, 0.15], [0.7, -0.1, 0.13]]) { ctx.beginPath(); ctx.arc(cx + bx * R, cy + by * R, br * R, 0, 7); ctx.fill(); }
        /* curenți în manta */
        ctx.strokeStyle = 'rgba(255,200,120,0.35)'; ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) { const a = i * 1.047 + t * 0.12, rr = px(1700 + (i % 2) * 600); ctx.beginPath(); ctx.arc(cx, cy, rr, a, a + 0.8); ctx.stroke(); }
        ctx.restore();
        /* felia (interior) */
        ctx.save();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, wa0, wa1); ctx.closePath(); ctx.clip();
        for (let i = 0; i < LAY.length; i++) { ctx.fillStyle = LAY[i].c; ctx.beginPath(); ctx.arc(cx, cy, px(6371 - LAY[i].a), 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.restore();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(wa0) * R, cy + Math.sin(wa0) * R); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(wa1) * R, cy + Math.sin(wa1) * R); ctx.stroke();
        /* atmosfera */
        ctx.strokeStyle = 'rgba(110,180,255,0.35)'; ctx.lineWidth = R * 0.06; ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, wa1, wa0 + Math.PI * 2); ctx.stroke();
        /* burghiul */
        const by = cy - R + px(depth); ctx.strokeStyle = '#e8eef7'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - R - 24); ctx.lineTo(cx, by); ctx.stroke();
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(cx, by + 8); ctx.lineTo(cx - 6, by - 4); ctx.lineTo(cx + 6, by - 4); ctx.fill();
        if (depth > 0 && depth < 13) { ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Kola: 12 km', cx + 12, cy - R + px(12) + 4); }
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, by, 7, 0, 7); ctx.stroke();
        /* unde seismice */
        if (quake) {
          const ep = { x: cx - Math.sin(0.3) * R * 0, y: cy - R };
          const pr = quake.t * 0.6 * R, sr = quake.t * 0.34 * R;
          ctx.lineWidth = 2;
          for (let i = -4; i <= 4; i++) {
            const a = -Math.PI / 2 + i * 0.34 + Math.PI * 0 + 0.0; const ang = Math.PI / 2 + i * 0.3;
            const dxx = Math.cos(ang), dyy = Math.sin(ang);
            /* P: trece prin tot; S: se oprește la nucleul extern (distanța 0.55R de centru) */
            const lenP = Math.min(pr, 2 * R), lenS = Math.min(sr, Math.abs(i) < 3 ? R * 0.9 : 2 * R * 0.95);
            ctx.strokeStyle = 'rgba(80,255,150,0.8)'; ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx + dxx * lenP * Math.sin(Math.abs(i) * 0.18 + 0.01) * 0.0 + (i * 0.17 * lenP) * 0.5, cy - R + lenP * 0.98); ctx.stroke();
            ctx.strokeStyle = 'rgba(255,90,90,0.8)'; ctx.beginPath(); ctx.moveTo(cx, cy - R); const sl2 = Math.abs(i) < 2 ? Math.min(lenS, R * 0.55) : lenS; ctx.lineTo(cx + (i * 0.17 * sl2) * 0.5, cy - R + sl2 * 0.98); ctx.stroke();
          }
        }
        /* panou */
        const li = layerOf(depth);
        if (li !== lastL) { lastL = li; if (!quake) api.say('<b>' + LAY[li].n + '.</b> ' + LAY[li].t, 9000); }
        const T = lookup(depth, 1), P = lookup(depth, 2);
        readout.innerHTML = '<b>' + LAY[li].n + '</b> · adâncime <b>' + fmtN(depth) + ' km</b> · temperatură ~<b>' + fmtN(T) + '°C</b> · presiune ~<b>' + (P < 0.01 ? '1' : fmtN(P * 9869)) + '</b> atmosfere' + (depth > 12 ? ' · oamenii au săpat doar 12 km' : '');
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'left';
        LAY.forEach((l, i) => { const mid = (l.a + l.b) / 2; ctx.fillStyle = i === 3 ? '#4a3a00' : '#fff'; if (i > 0) ctx.fillText(l.n, cx - R * 0.05 + 6, cy - R + px(mid) + 4 - (i === 1 ? 0 : 0)); });
        ctx.fillStyle = '#fff'; ctx.fillText('Scoarța', cx + R * 0.1, cy - R - 8);
      }
      return { frame: frame };
    }
  });

  /* ============================================================
     5) OCEANE ȘI ADÂNCIMI
     ============================================================ */
  defineModule({
    id: 'ocean', title: 'Oceane și adâncimi', sub: 'Scufundă-te și vezi cine trăiește acolo',
    start: function (api) {
      const ctx = api.ctx, MAX = 10935;
      let depth = 0, auto = false, W0 = 0;
      const ZONES = [[0, 200, 'Zona luminii', 'Soarele ajunge până aici. Aici trăiește 90% din viața mării: pești, delfini, țestoase, corali.'], [200, 1000, 'Zona de amurg', 'Lumina scade repede. Peștii au ochi mari și mulți strălucesc singuri (bioluminescență).'], [1000, 4000, 'Miezul nopții', 'Întuneric total și frig (2–4°C). Presiunea e de sute de ori mai mare ca la suprafață.'], [4000, 6000, 'Abisul', 'Aproape toată lumea e pustie, dar tot trăiesc aici caracatițe „Dumbo” și castraveți de mare.'], [6000, 11000, 'Hadalul (șanțurile)', 'Cele mai adânci locuri: peste 1.000 de atmosfere. Trăiesc doar creaturi mici, ca peștele-melc și crustaceii.']];
      /* viețuitoare: nume, interval de adâncime, tip desen, fapt */
      const SP = [
        ['Delfin', 0, 250, '🐬', 'Delfinii se scufundă rar sub 300 m. Respiră aer, ca noi!'],
        ['Țestoasă de mare', 0, 1000, '🐢', 'Țestoasa-piele se poate scufunda la peste 1.000 m.'],
        ['Rechin', 0, 1200, '🦈', 'Rechinii sunt pe Pământ de mai mult timp decât copacii.'],
        ['Ton', 0, 500, '🐟', 'Tonul înoată cu până la 70 km/h.'],
        ['Meduză', 0, 900, '🪼', 'Meduzele nu au creier, inimă sau oase — și există de 500 de milioane de ani.'],
        ['Calmar', 300, 1000, '🦑', 'Calmarii uriași au ochi cât farfuria — cei mai mari din lume.'],
        ['Cașalot', 200, 2200, '🐋', 'Cașalotul se scufundă până la 2.000 m ținându-și respirația ~1 oră, ca să vâneze calmari.'],
        ['Pește-viperă', 400, 2500, 'viper', 'Peștele-viperă are colți atât de lungi că nu-i încap în gură!'],
        ['Pește-pescar', 800, 3500, 'angler', 'Femela are o „undiță” luminoasă pe cap, cu care momește prada.'],
        ['Caracatiță Dumbo', 2500, 6000, '🐙', 'Se mișcă bătând din „urechi”, ca elefantul Dumbo.'],
        ['Castravete de mare', 4500, 10000, 'cuke', 'Trăiește pe fundul abisului și mănâncă „ninsoarea marină” căzută de sus.'],
        ['Pește-melc', 6000, 8200, 'snail', 'Cel mai adânc pește: trăiește la peste 8.000 m. Corpul lui e translucid și moale.'],
        ['Amfipod', 7000, 10935, 'amph', 'Crustaceu mic care trăiește în Groapa Marianelor, la ~11 km!']
      ];
      const MARK = [[40, 'Scafandru profesionist'], [300, 'Cel mai adânc loc pentru delfini'], [3800, 'Titanicul'], [8849, 'Everestul ar fi acoperit'], [10935, 'Groapa Marianelor (Challenger Deep)']];
      const crit = [];
      SP.forEach((s, i) => { const n = Math.max(3, Math.round((s[2] - s[1]) / 320)); for (let k = 0; k < Math.min(n, 9); k++) crit.push({ i: i, d: lerp(s[1], s[2], Math.random()), x: Math.random(), dx: (Math.random() < 0.5 ? -1 : 1) * (0.01 + Math.random() * 0.03), ph: Math.random() * 6.3 }); });
      const bubbles = []; for (let i = 0; i < 50; i++) bubbles.push([Math.random(), Math.random(), 1 + Math.random() * 2.5]);
      const snow = []; for (let i = 0; i < 70; i++) snow.push([Math.random(), Math.random(), 0.6 + Math.random() * 1.4]);

      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Adâncime', min: 0, max: 1, step: 0.0005, value: 0, fmt: () => fmtN(depth) + ' m', onInput: (v) => { depth = Math.pow(v, 1.6) * MAX; auto = false; } });
      const bA = api.button(r1, '⬇ Coboară singur', () => { auto = !auto; if (depth >= MAX - 5) depth = 0; bA.innerHTML = auto ? '⏸ Oprește' : '⬇ Coboară singur'; });
      const r2 = api.row('Oceane și mări');
      [['🌊 Pacific', 'Oceanul Pacific: cel mai mare — 165 milioane km², adică mai mult decât toate uscaturile la un loc. Aici e și Groapa Marianelor.'], ['Atlantic', 'Oceanul Atlantic: se lărgește cu ~2,5 cm pe an, pe măsură ce Europa și America se depărtează.'], ['Indian', 'Oceanul Indian: cel mai cald dintre oceane.'], ['Arctic', 'Oceanul Arctic: cel mai mic și mai puțin adânc; mare parte e acoperit de gheață.'], ['Marea Neagră', 'Marea Neagră: adâncă de 2.212 m. Sub ~150 m nu mai e oxigen și aproape nu trăiește nimic — e o „mare moartă” pe 90% din volum. Dar în partea de sus trăiesc delfini și hamsii.']]
        .forEach(([t, f]) => api.button(r2, t, () => api.say('<b>' + t.replace('🌊 ', '') + '.</b> ' + f.replace(/^[^:]*: /, ''), 12000)));
      api.say('Trage în sus și în jos pe ecran sau folosește glisorul ca să te scufunzi. Atinge o viețuitoare ca să afli cine e!', 9000);
      let dragY = null, dragD = 0;
      let pickMoved = 0;
      api.pointer({
        down: (x, y) => { dragY = y; dragD = depth; pickMoved = 0; },
        move: (x, y) => { if (dragY !== null) { pickMoved = Math.abs(y - dragY); depth = clamp(dragD + (dragY - y) / 0.4 * -1 * -1, 0, MAX); auto = false; sl.set(Math.pow(depth / MAX, 1 / 1.6)); } },
        up: (x, y) => {
          if (pickMoved < 8) {
            let best = null, bd = 40;
            for (const c of crit) { const sx = ((c.x * api.W) % api.W), sy = yOf(c.d); const d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = c; } }
            if (best) api.say('<b>' + SP[best.i][0] + '</b> (' + fmtN(SP[best.i][1]) + '–' + fmtN(SP[best.i][2]) + ' m). ' + SP[best.i][4], 9000);
          }
          dragY = null;
        }
      });
      const PX = 0.42;     // pixeli pe metru
      const yOf = (d) => api.cy - api.unit * 0.1 + (d - depth) * PX;
      function waterColor(d) {
        if (d < 200) return mix([46, 168, 220], [18, 96, 160], d / 200);
        if (d < 1000) return mix([18, 96, 160], [2, 12, 40], (d - 200) / 800);
        return mix([2, 12, 40], [0, 0, 6], clamp((d - 1000) / 3000, 0, 1));
      }
      let lastZone = -1;
      function drawCreature(c, x, y, t) {
        const s = SP[c.i], dir = c.dx > 0 ? 1 : -1;
        ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
        const bob = Math.sin(t * 2 + c.ph) * 3; ctx.translate(0, bob);
        const k = s[3];
        if (k === 'angler') { ctx.fillStyle = '#2b2236'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 15, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-34, -8); ctx.lineTo(-34, 8); ctx.fill(); ctx.strokeStyle = '#4a3a58'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12, -12); ctx.quadraticCurveTo(26, -34, 34, -22); ctx.stroke(); const g = ctx.createRadialGradient(34, -22, 0, 34, -22, 16); g.addColorStop(0, 'rgba(150,255,230,1)'); g.addColorStop(1, 'rgba(150,255,230,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(34, -22, 16, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(10, -3, 2.4, 0, 7); ctx.fill(); ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(18, 4); ctx.lineTo(14, 9); ctx.moveTo(14, 5); ctx.lineTo(10, 10); ctx.stroke(); }
        else if (k === 'viper') { ctx.fillStyle = '#16303a'; ctx.beginPath(); ctx.ellipse(0, 0, 26, 7, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(-38, -7); ctx.lineTo(-38, 7); ctx.fill(); ctx.fillStyle = 'rgba(120,255,200,0.9)'; for (let j = 0; j < 7; j++) ctx.fillRect(-18 + j * 5, 4, 2, 2); ctx.strokeStyle = '#eee'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(22, 2); ctx.lineTo(18, 9); ctx.moveTo(25, 2); ctx.lineTo(22, 10); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(19, -2, 1.8, 0, 7); ctx.fill(); }
        else if (k === 'cuke') { ctx.fillStyle = '#c9a07a'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#a07a5a'; for (let j = -3; j <= 3; j++) ctx.fillRect(j * 5, -9, 2, 4); }
        else if (k === 'snail') { ctx.fillStyle = 'rgba(255,220,230,0.75)'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 8, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(-34, -8, -40, 6); ctx.lineTo(-18, 5); ctx.fill(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(13, -2, 1.6, 0, 7); ctx.fill(); }
        else if (k === 'amph') { ctx.strokeStyle = 'rgba(255,180,140,0.95)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 8, 0.5, 4.4); ctx.stroke(); ctx.lineWidth = 1; for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(-5 + j * 3, 7); ctx.lineTo(-7 + j * 3, 13); ctx.stroke(); } }
        else { ctx.scale(dir, 1); ctx.font = (k === '🐋' || k === '🦈' ? 44 : k === '🪼' ? 28 : 32) + 'px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = clamp(1 - Math.max(0, c.d - 1000) / 8000, 0.7, 1); ctx.fillText(k, 0, 0); if (c.d > 600 && (k === '🪼' || k === '🦑')) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 30); g.addColorStop(0, 'rgba(120,200,255,0.35)'); g.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill(); } }
        ctx.restore();
      }
      function frame(dt, t) {
        if (auto) { depth = Math.min(MAX, depth + dt * (depth < 1000 ? 120 : 380)); sl.set(Math.pow(depth / MAX, 1 / 1.6)); if (depth >= MAX) { auto = false; bA.innerHTML = '⬇ Coboară singur'; } }
        const W = api.W, H = api.H;
        /* apa: gradient în funcție de adâncimea de sus și de jos */
        const g = ctx.createLinearGradient(0, 0, 0, H);
        const dTop = depth + (0 - yOf(depth)) / PX, dBot = depth + (H - yOf(depth)) / PX;
        for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, rgb(waterColor(clamp(lerp(dTop, dBot, i / 6), 0, MAX))));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        /* suprafața */
        const sy = yOf(0);
        if (sy > -40) { ctx.fillStyle = '#9fd8f5'; ctx.fillRect(0, 0, W, Math.max(0, sy)); const sk = ctx.createLinearGradient(0, 0, 0, sy); sk.addColorStop(0, '#6fb8e8'); sk.addColorStop(1, '#d6efff'); ctx.fillStyle = sk; ctx.fillRect(0, 0, W, Math.max(0, sy - 2)); ctx.fillStyle = '#e8f6ff'; ctx.beginPath(); ctx.moveTo(0, sy); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, sy + Math.sin(x * 0.05 + t * 2) * 3); ctx.lineTo(W, sy + 12); ctx.lineTo(0, sy + 12); ctx.fill(); }
        /* raze de soare */
        if (depth < 600) { ctx.globalAlpha = 0.14 * (1 - depth / 600); ctx.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(W * (i / 5 + 0.05), Math.max(0, sy)); ctx.lineTo(W * (i / 5 + 0.15), Math.max(0, sy)); ctx.lineTo(W * (i / 5 + 0.0) + 90 - i * 10, H); ctx.lineTo(W * (i / 5 - 0.1) + 40, H); ctx.fill(); } ctx.globalAlpha = 1; }
        /* fundul mării */
        const fy = yOf(MAX + 80); if (fy < H) { ctx.fillStyle = '#17120e'; ctx.fillRect(0, fy, W, H - fy); }
        /* „zăpadă marină” */
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; for (const s of snow) { const yy = (s[1] * H + t * 18 * s[2] + depth * 0.1) % H, xx = (s[0] * W + Math.sin(t + s[1] * 9) * 6); ctx.fillRect(xx, yy, s[2], s[2]); }
        /* creaturi */
        ctx.globalAlpha = 1;
        for (const c of crit) {
          c.x += c.dx * dt; if (c.x > 1.1) c.x = -0.1; if (c.x < -0.1) c.x = 1.1;
          const y = yOf(c.d); if (y < -60 || y > H + 60) continue;
          drawCreature(c, c.x * W, y, t);
        }
        /* bule */
        if (depth < 3000) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; for (const b of bubbles) { const yy = ((b[1] - t * 0.08 * b[2]) % 1 + 1) % 1 * H; ctx.beginPath(); ctx.arc(b[0] * W, yy, b[2], 0, 7); ctx.fill(); } }
        /* submersibilul */
        const sx = api.cx, sY = api.cy - api.unit * 0.1;
        if (depth > 150) { ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createRadialGradient(sx + 40, sY, 0, sx + 40, sY, 150); lg.addColorStop(0, 'rgba(255,245,200,0.55)'); lg.addColorStop(1, 'rgba(255,245,200,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(sx + 22, sY); ctx.lineTo(sx + 170, sY - 70); ctx.lineTo(sx + 170, sY + 70); ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.ellipse(sx, sY, 24, 11, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#7a5a10'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#2a4a6a'; ctx.beginPath(); ctx.arc(sx + 8, sY - 2, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd166'; ctx.fillRect(sx - 4, sY - 18, 8, 8); ctx.fillStyle = '#7a5a10'; ctx.fillRect(sx - 30, sY - 3, 7, 6);
        /* repere de adâncime (în dreapta) */
        ctx.textAlign = 'right'; ctx.font = '600 11px system-ui,sans-serif';
        for (const m of MARK) { const y = yOf(m[0]); if (y > 70 && y < H - 4) { ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(W - 160, y); ctx.lineTo(W - 4, y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#fff'; ctx.fillText(m[1] + ' · ' + fmtN(m[0]) + ' m', W - 6, y - 4); } }
        /* tablou de bord */
        const press = 1 + depth / 10, temp = depth < 100 ? 20 - depth * 0.1 : depth < 1000 ? 10 - (depth - 100) / 900 * 6 : 3 + 1.0 * Math.min(1, (depth - 1000) / 9000) * -1;
        ctx.fillStyle = 'rgba(8,14,34,0.78)'; ctx.fillRect(10, 70, 148, 62); ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = '600 12px system-ui,sans-serif';
        ctx.fillText('Adâncime: ' + fmtN(depth) + ' m', 18, 88); ctx.fillText('Presiune: ' + fmtN(press) + ' atm', 18, 105); ctx.fillText('Temperatură: ~' + fmtN(temp, 0) + '°C', 18, 122);
        const z = ZONES.findIndex((q) => depth >= q[0] && depth < q[1]); const zi = z < 0 ? 4 : z;
        if (zi !== lastZone) { lastZone = zi; api.say('🌊 <b>' + ZONES[zi][2] + '</b> (' + fmtN(ZONES[zi][0]) + '–' + fmtN(ZONES[zi][1]) + ' m). ' + ZONES[zi][3], 9000); }
      }
      return { frame: frame };
    }
  });
})();
