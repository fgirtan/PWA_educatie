/* Modul: Pământul în timp */
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
      let s = 0, spin = 0, tilt = 0.25, vSpin = 0, vTilt = 0, idle = 99, dragging = false, zoom = 1, lastEra = -1, playing = false;
      const S = 210, off = document.createElement('canvas'); off.width = off.height = S;
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
        const cs = Math.cos(spin), sn = Math.sin(spin), ct = Math.cos(tilt), st = Math.sin(tilt);
        for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
          const nx = (i + 0.5 - h) / h, ny = (j + 0.5 - h) / h, r2 = nx * nx + ny * ny, o = (j * S + i) * 4;
          if (r2 > 1) { d[o + 3] = 0; continue; }
          const z = Math.sqrt(1 - r2), y = -ny;
          const y1 = y * ct - z * st, z1 = y * st + z * ct;
          const xr = nx * cs + z1 * sn, zr = -nx * sn + z1 * cs;
          const lon = Math.atan2(xr, zr) * 57.2958, lat = Math.asin(clamp(y1, -1, 1)) * 57.2958;
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
            if (m < 3800) { const cn = Math.sin(lon * 0.09 + 2) * Math.cos(lat * 0.14 + 1) + 0.8 * Math.sin(lon * 0.17 - lat * 0.11) * Math.cos(lat * 0.2) + 0.5 * Math.sin(lon * 0.31 + lat * 0.27); if (cn > 0.75) c = mix(c, [255, 255, 255], clamp((cn - 0.75) * 1.6, 0, 0.55)); }
          }
          const sh = 0.28 + 0.8 * clamp(nx * -0.45 + y * 0.45 + z * 0.75, 0, 1);
          d[o] = c[0] * sh; d[o + 1] = c[1] * sh; d[o + 2] = c[2] * sh; d[o + 3] = 255;
        }
        octx.putImageData(img, 0, 0);
      }
      /* control: trage cu mouse-ul / degetul ca să rotești globul; rotița = zoom */
      let lx = 0, ly = 0, lt = 0;
      api.pointer({
        down: (x, y) => { dragging = true; lx = x; ly = y; lt = performance.now(); vSpin = 0; vTilt = 0; },
        move: (x, y) => {
          const dx = x - lx, dy = y - ly, now = performance.now(), dtm = Math.max(1, now - lt) / 1000, k = 2.4 / (api.unit * 0.82 * zoom);
          spin -= dx * k; tilt = clamp(tilt - dy * k, -1.35, 1.35);
          vSpin = vSpin * 0.6 - dx * k / dtm * 0.4; vTilt = vTilt * 0.6 - dy * k / dtm * 0.4;
          lx = x; ly = y; lt = now;
        },
        up: () => { dragging = false; if (performance.now() - lt > 120) { vSpin = 0; vTilt = 0; } }
      });
      const onWheel = (e) => { e.preventDefault(); zoom = clamp(zoom * Math.exp(-e.deltaY * 0.0015), 0.6, 1.7); };
      api.canvas.addEventListener('wheel', onWheel, { passive: false });
      api.onCleanup(() => api.canvas.removeEventListener('wheel', onWheel));
      r2.appendChild(Object.assign(document.createElement('span'), { className: 'mod-rt', textContent: 'Trage pe glob ca să-l rotești · rotița mouse-ului = zoom' }));
      api.button(r2, '🔍+', () => { zoom = clamp(zoom * 1.2, 0.6, 1.7); });
      api.button(r2, '🔍−', () => { zoom = clamp(zoom / 1.2, 0.6, 1.7); });
      api.button(r2, '↺ Glob', () => { spin = 0; tilt = 0.25; zoom = 1; vSpin = vTilt = 0; });
      function sayEra() { const k = eraIdx(); if (k === lastEra) return; lastEra = k; api.say(ERAS[k].e + ' <b>' + ERAS[k].n + '.</b> ' + ERAS[k].t); }

      function frame(dt, t) {
        if (playing) { s = Math.min(1, s + dt / 40); sl.set(s); if (s >= 1) { playing = false; bP.innerHTML = '↺ De la început'; } }
        if (dragging) { idle = 0; } else {
          idle += dt;
          spin += vSpin * dt; tilt = clamp(tilt + vTilt * dt, -1.35, 1.35);
          const damp = Math.exp(-dt * 3.5); vSpin *= damp; vTilt *= damp;
          if (idle > 3) { spin += dt * 0.35; tilt += (0.25 - tilt) * Math.min(1, dt * 0.8); }
        }
        const m = ma(), cx = api.cx, cy = api.cy, R = api.unit * 0.82 * zoom;
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
        ctx.fillText(m >= 1 ? 'Acum ' + maText(m) : 'Azi', cx, api.cy - api.unit + 14);
        ctx.font = '38px system-ui,sans-serif'; ctx.fillText(ERAS[eraIdx()].e, api.W - 34, 84);
      }
      return { frame: frame };
    }
  });
})();
