/* ============================================================
   MODUL: GAURA NEAGRĂ
   Fizică „pseudo-Newtoniană” (Paczyński–Wiita): are orizont, ultima orbită
   stabilă la 3 raze Schwarzschild și prăbușire dincolo de ea.
   Lumina urmează ecuația reală a geodezicelor nule (a = −1,5·rs·h²/r⁵·r).
   ============================================================ */
defineModule({
  id: 'blackhole',
  title: 'Gaura neagră',
  sub: 'Aruncă lucruri înăuntru și vezi ce se întâmplă',
  start: function (api) {
    const ctx = api.ctx;
    const C = 700;                       // viteza luminii pe ecran (px/s)
    let logM = 0.7;                      // log10(masa în mase solare)
    let mode = 'rock';                   // 'rock' | 'photon'
    let tilt = 0.30;                     // înclinarea discului
    let showGuides = true;
    let swallowed = 0;
    let objs = [];
    let aim = null;
    let flash = 0;
    let hr = 60, GM = 0;

    /* ---------- mărimi reale ---------- */
    const fmtN = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
    function massText(M) {
      if (M < 0.3) return fmtN(M / 3.003e-6, 1) + (M / 3.003e-6 < 1.5 ? ' masă' : ' mase') + ' Pământ';
      if (M < 1e4) return fmtN(M, M < 10 ? 1 : 0) + (M < 1.5 ? ' Soare' : ' Sori');
      if (M < 1e9) return fmtN(M / 1e6, 1) + ' milioane de Sori';
      return fmtN(M / 1e9, 1) + ' miliarde de Sori';
    }
    function lenText(km) {
      const m = km * 1000;
      if (m < 1) return fmtN(m * 1000, 1) + ' mm';
      if (m < 1000) return fmtN(m, 0) + ' m';
      if (km < 1e5) return fmtN(km, 1) + ' km';
      if (km < 1.4e7) return fmtN(km / 1000, 0) + ' mii de km';
      return fmtN(km / 1.496e8, 2) + ' UA';
    }
    function compareText(D) {   // D = diametrul orizontului, în km
      if (D < 1.2e-5) return 'mai mic decât o boabă de mazăre';
      if (D < 5e-5) return 'cât o boabă de mazăre';
      if (D < 1e-3) return 'cât o minge';
      if (D < 0.2) return 'cât un bloc';
      if (D < 2) return 'cât un cartier';
      if (D < 20) return 'cât un oraș mic';
      if (D < 200) return 'cât un oraș mare';
      if (D < 1.2e4) return 'cât o țară';
      if (D < 1.39e6) return 'mai mare decât Pământul (' + fmtN(D / 12742, 0) + ' Pământuri)';
      if (D < 6e9) return 'cât ' + fmtN(D / 1.39e6, 0) + ' Sori puși unul lângă altul';
      return 'mai mare decât tot Sistemul Solar (' + fmtN(D / 1.496e8, 0) + ' UA)';
    }
    function setMass(l) {
      logM = l;
      const t = (logM + 6) / 16;
      hr = api.unit * (0.10 + 0.20 * t);
      GM = hr * C * C / 2;
      const M = Math.pow(10, logM), rsKm = 2.953 * M;
      readout.innerHTML = '<b>Masa:</b> ' + massText(M) + ' &nbsp;·&nbsp; <b>Orizont:</b> ' + lenText(rsKm * 2) +
        ' diametru, ' + compareText(rsKm * 2);
    }

    /* ---------- comenzi ---------- */
    const r1 = api.row('Masa');
    const readout = document.createElement('div');
    readout.className = 'mod-readout';
    const massSlider = api.slider(r1, {
      label: 'Cât de grea', min: -6, max: 10, step: 0.01, value: logM,
      fmt: () => '', onInput: (v) => setMass(v)
    });
    r1.appendChild(readout);
    const r2 = api.row('Preseturi');
    const presets = [['🌍 Pământ', -5.52], ['☀️ Soare', 0], ['⭐ Stea mare', 1.3], ['🌌 Sagittarius A*', 6.63], ['🕳️ M87*', 9.81]];
    presets.forEach(([t, v]) => api.button(r2, t, () => { massSlider.set(v); setMass(v); explain(v); }));
    const r3 = api.row('Ce lansezi');
    const bRock = api.button(r3, '🪨 Planetă', () => setMode('rock'));
    const bPhoton = api.button(r3, '💡 Lumină', () => setMode('photon'));
    api.button(r3, '🔦 Raze de lumină', () => rays());
    const r4 = api.row('');
    api.slider(r4, { label: 'Înclinarea discului', min: 0.04, max: 1, step: 0.01, value: tilt, fmt: (v) => Math.round(v * 90) + '°', onInput: (v) => { tilt = v; } });
    const bG = api.button(r4, '⭕ Cercuri', () => { showGuides = !showGuides; bG.classList.toggle('on', showGuides); });
    bG.classList.add('on');
    api.button(r4, '🧹 Curăță', () => { objs = []; swallowed = 0; });

    function setMode(m) {
      mode = m;
      bRock.classList.toggle('on', m === 'rock');
      bPhoton.classList.toggle('on', m === 'photon');
      api.say(m === 'rock'
        ? '<b>Planetă.</b> Atinge o dată: pornește pe o orbită circulară. Trage cu degetul: alegi tu direcția și viteza.'
        : '<b>Lumină.</b> Trage cu degetul într-o direcție. Lumina merge mereu cu aceeași viteză — dar drumul ei se curbează!', 6000);
    }
    function explain(v) {
      const t = { '-5.52': 'Dacă am strânge tot Pământul într-o gaură neagră, ar avea cât o boabă de mazăre!', '0': 'Un Soare transformat în gaură neagră ar avea doar ~6 km lățime. Dar gravitația de departe ar fi la fel ca acum: Pământul ar continua să se rotească în jurul ei.', '1.3': 'Găurile negre stelare se nasc când stele uriașe explodează.', '6.63': 'Sagittarius A* e gaura neagră din mijlocul Căii Lactee, la 26.000 de ani-lumină de noi.', '9.81': 'M87* e prima gaură neagră fotografiată vreodată, în 2019.' }[String(v)];
      if (t) api.say(t, 9000);
    }
    setMode('rock');
    setMass(logM);

    /* ---------- lansări ---------- */
    function launch(x, y, vx, vy, type) {
      const o = { x: x, y: y, vx: vx, vy: vy, type: type, trail: [], age: 0, dead: 0, color: ['#7fd1ff', '#ffb36b', '#b7ff8a', '#ff8fb8', '#d8b4ff'][Math.floor(Math.random() * 5)] };
      objs.push(o);
      if (objs.length > 90) objs.shift();
    }
    function circular(x, y) {
      const dx = x - api.cx, dy = y - api.cy, r = Math.hypot(dx, dy) || 1;
      const v = Math.sqrt(GM * r) / Math.max(r - hr, hr * 0.1);
      return [-dy / r * v, dx / r * v];
    }
    function rays() {
      const n = 11, top = api.cy - api.unit * 0.95, bot = api.cy + api.unit * 0.95;
      for (let i = 0; i < n; i++) {
        launch(-10, lerp(top, bot, i / (n - 1)), C, 0, 'photon');
      }
      api.say('<b>Raze de lumină paralele.</b> Cele care trec aproape se curbează, iar cele care nimeresc prea aproape sunt înghițite. Lumina din spatele găurii se vede ocolind-o — așa apar imaginile duble ale stelelor.', 9000);
    }
    const lerp = (a, b, t) => a + (b - a) * t;

    api.pointer({
      down: (x, y) => { aim = { x0: x, y0: y, x1: x, y1: y }; },
      move: (x, y) => { if (aim) { aim.x1 = x; aim.y1 = y; } },
      up: (x, y) => {
        if (!aim) return;
        const dx = x - aim.x0, dy = y - aim.y0, d = Math.hypot(dx, dy);
        if (d < 12) {
          if (mode === 'rock') {
            const v = circular(aim.x0, aim.y0);
            launch(aim.x0, aim.y0, v[0], v[1], 'rock');
            const r = Math.hypot(aim.x0 - api.cx, aim.y0 - api.cy);
            if (r < hr * 3) api.say('Prea aproape! Sub 3 raze Schwarzschild nu mai există orbite stabile — obiectul se prăbușește.', 6000);
          } else {
            launch(aim.x0, aim.y0, C, 0, 'photon');
          }
        } else if (mode === 'rock') {
          launch(aim.x0, aim.y0, dx * 2.2, dy * 2.2, 'rock');
        } else {
          launch(aim.x0, aim.y0, dx / d * C, dy / d * C, 'photon');
        }
        aim = null;
      }
    });

    /* ---------- fundal: stele lentilate ---------- */
    const STARS = [];
    for (let i = 0; i < 380; i++) STARS.push({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random() * 1.4, a: 0.35 + Math.random() * 0.65, h: Math.random() });
    /* particulele discului de acreție */
    const DISK = [];
    for (let i = 0; i < 900; i++) {
      const q = Math.pow(Math.random(), 1.5);
      DISK.push({ q: q, ph: Math.random() * Math.PI * 2, j: (Math.random() - 0.5), s: 0.8 + Math.random() * 1.6 });
    }
    function diskColor(rr) {
      return rr < 2.0 ? '255,244,214' : rr < 3.0 ? '255,214,128' : rr < 4.4 ? '255,158,64' : '222,84,44';
    }

    function step(dt) {
      const sub = 5, h = dt / sub;
      for (let s = 0; s < sub; s++) {
        for (const o of objs) {
          if (o.dead) continue;
          const dx = o.x - api.cx, dy = o.y - api.cy;
          const r = Math.hypot(dx, dy);
          if (r <= hr) {
            o.dead = 1; swallowed++; flash = Math.min(1, flash + 0.5);
            if (swallowed === 1) api.say('<b>Înghițit!</b> Dincolo de orizontul evenimentelor nu mai poate ieși nimic — nici măcar lumina.', 7000);
            continue;
          }
          let ax, ay;
          if (o.type === 'photon') {
            const hh = dx * o.vy - dy * o.vx;
            const k = -1.5 * hr * hh * hh / Math.pow(r, 5);
            ax = k * dx; ay = k * dy;
          } else {
            const g = GM / Math.pow(Math.max(r - hr, hr * 0.12), 2);
            ax = -g * dx / r; ay = -g * dy / r;
          }
          o.vx += ax * h; o.vy += ay * h;
          o.x += o.vx * h; o.y += o.vy * h;
        }
      }
      for (const o of objs) {
        if (o.dead) { o.dead += dt; continue; }
        o.age += dt;
        o.trail.push(o.x, o.y);
        if (o.trail.length > (o.type === 'photon' ? 140 : 260)) o.trail.splice(0, 2);
        if (o.x < -api.W || o.x > api.W * 2 || o.y < -api.H || o.y > api.H * 2) o.dead = 99;
      }
      objs = objs.filter((o) => o.dead < 1.2 || o.type === 'photon' && o.dead < 0.8);
    }

    function frame(dt, t) {
      step(dt);
      flash = Math.max(0, flash - dt * 1.6);
      const W = api.W, H = api.H, cx = api.cx, cy = api.cy;
      /* fundal */
      ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, W, H);
      const thE = hr * 1.7;      // raza Einstein (schematică)
      for (const s of STARS) {
        const x = s.x * W - cx, y = s.y * H - cy, r = Math.hypot(x, y) || 1;
        const sq = Math.sqrt(r * r + 4 * thE * thE);
        const r1 = 0.5 * (r + sq), r2 = 0.5 * (sq - r);
        const bright = 0.5 + 0.5 * Math.sin(t * 1.5 + s.h * 30);
        ctx.fillStyle = 'rgba(' + (s.h > 0.7 ? '190,210,255' : s.h < 0.2 ? '255,220,190' : '255,255,255') + ',' + (s.a * (0.7 + 0.3 * bright)).toFixed(2) + ')';
        ctx.fillRect(cx + x / r * r1, cy + y / r * r1, s.s, s.s);
        if (r2 > hr * 1.05 && r < thE * 5) {
          ctx.globalAlpha = 0.5 * Math.min(1, (r2 - hr) / hr);
          ctx.fillRect(cx - x / r * r2, cy - y / r * r2, s.s, s.s);
          ctx.globalAlpha = 1;
        }
      }
      /* disc — partea din spate (și imaginea lui curbată peste gaură) */
      const drawDisk = (front) => {
        for (const d of DISK) {
          const rr = 1.5 + d.q * 4.8;
          const R = rr * hr;
          const ph = d.ph + t * 1.4 / Math.pow(rr, 1.5);
          const sinp = Math.sin(ph), cosp = Math.cos(ph);
          const isFront = sinp > 0;
          const dop = 0.55 + 0.45 * (-cosp);
          const col = diskColor(rr);
          if (isFront === front) {
            ctx.fillStyle = 'rgba(' + col + ',' + (0.75 * dop).toFixed(2) + ')';
            ctx.fillRect(cx + cosp * R, cy + sinp * R * tilt + d.j * hr * 0.12, d.s, d.s);
          }
          if (!front && !isFront && rr < 3.6) {
            /* imaginea curbată a părții din spate: un arc deasupra găurii */
            const lr = hr * (1.05 + (rr - 1.5) * 0.28);
            ctx.fillStyle = 'rgba(' + col + ',' + (0.55 * dop).toFixed(2) + ')';
            ctx.fillRect(cx + cosp * lr, cy - Math.abs(sinp) * lr * (0.55 + 0.45 * (1 - tilt)) + d.j * hr * 0.05, d.s, d.s);
          }
        }
      };
      ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(cx, cy, hr * 0.9, cx, cy, hr * 4.2);
      glow.addColorStop(0, 'rgba(255,170,80,0.28)'); glow.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, hr * 4.2, 0, 7); ctx.fill();
      drawDisk(false);
      ctx.globalCompositeOperation = 'source-over';
      /* orizontul + inelul de fotoni */
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, hr, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,230,190,' + (0.65 + flash * 0.35).toFixed(2) + ')'; ctx.lineWidth = 2.2 + flash * 4;
      ctx.beginPath(); ctx.arc(cx, cy, hr * 1.03, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,190,120,0.25)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(cx, cy, hr * 1.06, 0, 7); ctx.stroke();
      drawDisk(true);
      ctx.globalCompositeOperation = 'source-over';

      /* cercuri educative */
      if (showGuides) {
        ctx.save();
        ctx.setLineDash([4, 6]); ctx.lineWidth = 1; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'left';
        const ring = (k, col, text) => {
          ctx.strokeStyle = col; ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(cx, cy, hr * k, 0, 7); ctx.stroke();
          ctx.fillText(text, cx + hr * k * 0.71 + 6, cy - hr * k * 0.71 - 4);
        };
        ring(1, 'rgba(255,120,120,0.9)', 'orizontul evenimentelor');
        ring(1.5, 'rgba(255,230,120,0.75)', 'sfera fotonilor');
        ring(3, 'rgba(120,220,255,0.75)', 'ultima orbită stabilă');
        ctx.restore();
      }

      /* obiectele lansate */
      for (const o of objs) {
        const dx = o.x - cx, dy = o.y - cy, r = Math.hypot(dx, dy);
        const fade = o.dead ? Math.max(0, 1 - o.dead * 1.4) : 1;
        if (o.trail.length > 4) {
          ctx.lineWidth = o.type === 'photon' ? 1.8 : 1.4;
          ctx.strokeStyle = o.type === 'photon' ? 'rgba(255,255,220,' + (0.7 * fade).toFixed(2) + ')' : o.color;
          ctx.globalAlpha = (o.type === 'photon' ? 1 : 0.55) * fade;
          ctx.beginPath(); ctx.moveTo(o.trail[0], o.trail[1]);
          for (let i = 2; i < o.trail.length; i += 2) ctx.lineTo(o.trail[i], o.trail[i + 1]);
          ctx.stroke(); ctx.globalAlpha = 1;
        }
        if (o.dead && o.dead > 0.0) { if (o.type === 'photon') continue; }
        if (o.type === 'photon') {
          ctx.fillStyle = '#fffbe0';
          ctx.beginPath(); ctx.arc(o.x, o.y, 2.6, 0, 7); ctx.fill();
        } else {
          /* spaghetificare: se întinde pe direcția găurii când e aproape */
          const near = Math.max(0, (hr * 4.2 - r) / (hr * 3.2));
          const stretch = 1 + near * 5.5;
          const sz = 7 * (o.dead ? Math.max(0.1, 1 - o.dead * 1.4) : 1);
          const red = Math.min(1, near);
          ctx.save();
          ctx.translate(o.x, o.y); ctx.rotate(Math.atan2(dy, dx));
          ctx.globalAlpha = Math.max(0.15, 1 - near * 0.55) * (o.dead ? fade : 1);
          ctx.fillStyle = red > 0.5 ? '#ff7a5a' : o.color;
          ctx.beginPath(); ctx.ellipse(0, 0, sz * stretch, sz / Math.sqrt(stretch), 0, 0, 7); ctx.fill();
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      }

      /* săgeata de țintire */
      if (aim) {
        const dx = aim.x1 - aim.x0, dy = aim.y1 - aim.y0;
        if (Math.hypot(dx, dy) > 12) {
          ctx.strokeStyle = '#7dffb0'; ctx.fillStyle = '#7dffb0'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
          ctx.beginPath(); ctx.moveTo(aim.x0, aim.y0); ctx.lineTo(aim.x1, aim.y1); ctx.stroke(); ctx.setLineDash([]);
          const a = Math.atan2(dy, dx);
          ctx.beginPath(); ctx.moveTo(aim.x1, aim.y1);
          ctx.lineTo(aim.x1 - Math.cos(a - 0.4) * 14, aim.y1 - Math.sin(a - 0.4) * 14);
          ctx.lineTo(aim.x1 - Math.cos(a + 0.4) * 14, aim.y1 - Math.sin(a + 0.4) * 14); ctx.fill();
        }
        ctx.fillStyle = '#7dffb0'; ctx.beginPath(); ctx.arc(aim.x0, aim.y0, 5, 0, 7); ctx.fill();
      }
      /* contor */
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '600 14px system-ui, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('Înghițite: ' + swallowed, api.freeW - 14, 80);
    }

    return { frame: frame, resize: () => setMass(logM) };
  }
});
