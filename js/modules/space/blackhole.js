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
    const TAU = Math.PI * 2;
    const STARS = [];
    for (let i = 0; i < 380; i++) STARS.push({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random() * 1.4, a: 0.35 + Math.random() * 0.65, h: Math.random() });
    const R_IN = 1.5, R_OUT = 6.3;       // discul de acreție, în raze ale orizontului
    /* cer adânc cu nebuloase (pre-randat) */
    function skyTex() {
      return Art.cached('bh-sky2', api.W, api.H, (c, w, h) => { Art.backdrop(c, w, h, { top: '#080a1c', bottom: '#020309', vignette: false }); });
    }
    /* textura discului, văzut de sus (o singură dată, scalată apoi) */
    const diskTex = () => Art.cached('bh-disk', 640, 640, (c, w) => {
      const R = w / 2, ri = R * R_IN / R_OUT, k = (v) => (v - R_IN) / (R_OUT - R_IN);
      const g = c.createRadialGradient(R, R, ri, R, R, R);
      g.addColorStop(0, 'rgba(255,255,245,1)'); g.addColorStop(k(1.9), 'rgba(255,236,170,1)'); g.addColorStop(k(2.8), 'rgba(255,186,90,0.95)');
      g.addColorStop(k(4.0), 'rgba(240,110,45,0.8)'); g.addColorStop(k(5.3), 'rgba(170,45,30,0.45)'); g.addColorStop(1, 'rgba(90,20,30,0)');
      c.fillStyle = g; c.beginPath(); c.arc(R, R, R, 0, TAU); c.arc(R, R, ri, 0, TAU, true); c.fill();
      c.save(); c.beginPath(); c.arc(R, R, R, 0, TAU); c.arc(R, R, ri, 0, TAU, true); c.clip();
      let s = 23; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      c.lineCap = 'round';
      for (let i = 0; i < 900; i++) {
        const rr = ri + Math.pow(rnd(), 1.3) * (R - ri), a0 = rnd() * TAU, len = 0.15 + rnd() * 1.1;
        const bright = rnd() < 0.55;
        c.strokeStyle = bright ? 'rgba(255,250,225,' + (0.05 + rnd() * 0.16).toFixed(3) + ')' : 'rgba(40,5,0,' + (0.08 + rnd() * 0.2).toFixed(3) + ')';
        c.lineWidth = 0.8 + rnd() * 3.2;
        c.beginPath(); c.arc(R, R, rr, a0, a0 + len); c.stroke();
      }
      c.restore();
    });
    /* scântei fierbinți (resturi rupte de gaura neagră) */
    const sparks = [];
    function emitSpark(x, y, vx, vy, col) { sparks.push({ x: x, y: y, vx: vx, vy: vy, age: 0, life: 0.4 + Math.random() * 0.6, c: col }); if (sparks.length > 500) sparks.shift(); }
    function burst(x, y) { for (let i = 0; i < 8; i++) { const a = Math.random() * TAU, v = 30 + Math.random() * 60; emitSpark(x, y, Math.cos(a) * v, Math.sin(a) * v, '255,200,120'); } }
    const hotRGB = (k) => k < 0.33 ? Art.mix('#ff6a3c', '#ffb050', k / 0.33) : k < 0.7 ? Art.mix('#ffb050', '#fff2c0', (k - 0.33) / 0.37) : Art.mix('#fff2c0', '#ffffff', (k - 0.7) / 0.3);
    function step(dt) {
      const sub = 5, h = dt / sub;
      for (let s = 0; s < sub; s++) {
        for (const o of objs) {
          if (o.dead) continue;
          const dx = o.x - api.cx, dy = o.y - api.cy;
          const r = Math.hypot(dx, dy);
          if (r <= hr) {
            o.dead = 1; swallowed++; flash = Math.min(1, flash + 0.5); burst(o.x, o.y);
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

    /* discul (jumătatea din spate sau din față), cu efect Doppler: partea care vine spre noi e mai strălucitoare */
    function drawDiskHalf(front, t) {
      const cx = api.cx, cy = api.cy, Ro = hr * R_OUT, Ri = hr * R_IN, W = api.W, H = api.H;
      ctx.save();
      ctx.beginPath(); if (front) ctx.rect(0, cy, W, H - cy); else ctx.rect(0, 0, W, cy); ctx.clip();
      ctx.translate(cx, cy); ctx.scale(1, tilt);
      ctx.globalCompositeOperation = 'lighter';
      ctx.save(); ctx.rotate(-t * 0.5); ctx.drawImage(diskTex(), -Ro, -Ro, Ro * 2, Ro * 2); ctx.restore();
      ctx.globalAlpha = 0.55; ctx.save(); ctx.rotate(-t * 1.3 + 1); ctx.drawImage(diskTex(), -Ro * 0.62, -Ro * 0.62, Ro * 1.24, Ro * 1.24); ctx.restore();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(0, 0, Ro, 0, TAU); ctx.arc(0, 0, Ri, 0, TAU, true);
      const dg = ctx.createLinearGradient(-Ro, 0, Ro, 0);
      dg.addColorStop(0, 'rgba(255,230,190,0.22)'); dg.addColorStop(0.45, 'rgba(255,230,190,0.05)'); dg.addColorStop(0.5, 'rgba(0,0,0,0)'); dg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = dg; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      const dd = ctx.createLinearGradient(-Ro, 0, Ro, 0);
      dd.addColorStop(0, 'rgba(0,0,8,0)'); dd.addColorStop(0.5, 'rgba(0,0,8,0)'); dd.addColorStop(1, 'rgba(0,0,8,0.5)');
      ctx.fillStyle = dd; ctx.fill('evenodd');
      ctx.restore();
    }
    /* imaginea curbată a părții din spate a discului: arcul de deasupra (și cel slab de dedesubt) */
    function drawLensedArc() {
      const cx = api.cx, cy = api.cy, k = 0.55 + 0.45 * (1 - tilt);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const r = hr * (1.1 + i * 0.09), a = (0.55 - i * 0.06) * (0.55 + 0.45 * (1 - tilt));
        ctx.strokeStyle = 'rgba(' + (i < 2 ? '255,245,215' : i < 4 ? '255,200,120' : '240,120,60') + ',' + a.toFixed(3) + ')';
        ctx.lineWidth = hr * 0.12;
        ctx.beginPath(); ctx.ellipse(cx, cy, r, r * k, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,190,120,' + (a * 0.35).toFixed(3) + ')';
        ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.95, r * 0.95 * k * 0.8, 0, Math.PI * 0.08, Math.PI * 0.92); ctx.stroke();
      }
      ctx.restore();
    }

    function frame(dt, t) {
      step(dt);
      flash = Math.max(0, flash - dt * 1.6);
      for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.age += dt; if (p.age > p.life) { sparks.splice(i, 1); continue; } p.vx *= 0.97; p.vy *= 0.97; p.x += p.vx * dt; p.y += p.vy * dt; }
      const W = api.W, H = api.H, cx = api.cx, cy = api.cy, U = api.unit;
      /* fundal */
      ctx.drawImage(skyTex(), 0, 0, W, H);
      const thE = hr * 1.7;      // raza Einstein (schematică)
      for (const s of STARS) {
        const x = s.x * W - cx, y = s.y * H - cy, r = Math.hypot(x, y) || 1;
        const sq = Math.sqrt(r * r + 4 * thE * thE);
        const r1 = 0.5 * (r + sq), r2 = 0.5 * (sq - r);
        const bright = 0.6;
        const mag = Math.min(2.2, 1 + thE * thE / (r * r) * 0.8);      // lentila mărește stelele de lângă gaură
        ctx.fillStyle = 'rgba(' + (s.h > 0.7 ? '190,210,255' : s.h < 0.2 ? '255,220,190' : '255,255,255') + ',' + (s.a * (0.7 + 0.3 * bright)).toFixed(2) + ')';
        const px = cx + x / r * r1, py = cy + y / r * r1, sz = s.s * mag;
        ctx.beginPath(); ctx.arc(px, py, sz * 0.6, 0, TAU); ctx.fill();
        if (r2 > hr * 1.05 && r < thE * 5) {
          ctx.globalAlpha = 0.5 * Math.min(1, (r2 - hr) / hr);
          ctx.beginPath(); ctx.arc(cx - x / r * r2, cy - y / r * r2, sz * 0.6, 0, TAU); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      /* inelul Einstein: lumina stelelor din spate, adunată într-un cerc subțire */
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const er = ctx.createRadialGradient(cx, cy, thE * 0.85, cx, cy, thE * 1.2);
      er.addColorStop(0, 'rgba(160,190,255,0)'); er.addColorStop(0.5, 'rgba(170,200,255,0.10)'); er.addColorStop(1, 'rgba(160,190,255,0)');
      ctx.fillStyle = er; ctx.beginPath(); ctx.arc(cx, cy, thE * 1.2, 0, TAU); ctx.fill();
      ctx.restore();
      /* umbra: lumina e deviată, deci în jurul găurii cerul pare mai întunecat */
      const sh = ctx.createRadialGradient(cx, cy, hr, cx, cy, hr * 2.6);
      sh.addColorStop(0, 'rgba(0,0,0,0.95)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(cx, cy, hr * 2.6, 0, TAU); ctx.fill();

      drawDiskHalf(false, t);
      /* orizontul + inelul de fotoni */
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, hr, 0, TAU); ctx.fill();
      drawLensedArc();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const pr = ctx.createRadialGradient(cx, cy, hr * 0.98, cx, cy, hr * 1.25);
      pr.addColorStop(0, 'rgba(255,220,170,0)'); pr.addColorStop(0.15, 'rgba(255,235,200,' + (0.75 + flash * 0.25).toFixed(2) + ')'); pr.addColorStop(0.4, 'rgba(255,170,90,0.25)'); pr.addColorStop(1, 'rgba(255,140,60,0)');
      ctx.fillStyle = pr; ctx.beginPath(); ctx.arc(cx, cy, hr * 1.25, 0, TAU); ctx.arc(cx, cy, hr * 0.98, 0, TAU, true); ctx.fill();
      ctx.strokeStyle = 'rgba(255,248,230,' + (0.8 + flash * 0.2).toFixed(2) + ')'; ctx.lineWidth = 1.4 + flash * 4;
      ctx.beginPath(); ctx.arc(cx, cy, hr * 1.03, 0, TAU); ctx.stroke();
      ctx.restore();
      drawDiskHalf(true, t);

      /* cercuri educative */
      if (showGuides) {
        const fz = Art.fs(U, 0.032, 12);
        const ring = (k, col, text, ang) => {
          ctx.save(); ctx.setLineDash([4, 6]); ctx.lineWidth = 1.2; ctx.strokeStyle = col;
          ctx.beginPath(); ctx.arc(cx, cy, hr * k, 0, TAU); ctx.stroke(); ctx.restore();
          const tx = cx + Math.cos(ang) * hr * k, ty = cy + Math.sin(ang) * hr * k, right = Math.cos(ang) >= 0;
          const lx = cx + Math.cos(ang) * (hr * 3 + fz * 1.5), ly = cy + Math.sin(ang) * (hr * 3 + fz * 1.5);
          ctx.font = Art.font(fz, 700); const lw = ctx.measureText(text).width + fz * 1.1;
          let ax = right ? Math.min(lx, api.freeW - 8 - lw) : Math.max(lx, 8 + lw);
          Art.label(ctx, text, ax, ly, { size: fz, align: right ? 'left' : 'right', color: col, tx: tx, ty: ty, lineColor: col, bg: 'rgba(8,10,25,0.72)' });
        };
        ring(1, 'rgba(255,140,140,0.95)', 'orizontul evenimentelor', 0.75);
        ring(1.5, 'rgba(255,230,130,0.9)', 'sfera fotonilor', -2.35);
        ring(3, 'rgba(130,220,255,0.9)', 'ultima orbită stabilă', -0.7);
      }

      /* obiectele lansate */
      const sc = Math.max(0.8, Math.min(1.6, U / 300));
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const o of objs) {
        const dx = o.x - cx, dy = o.y - cy, r = Math.hypot(dx, dy) || 1;
        const fade = o.dead ? Math.max(0, 1 - o.dead * 1.4) : 1;
        const near = Math.max(0, Math.min(1, (hr * 4.2 - r) / (hr * 3.2)));
        /* dâra se estompează spre coadă */
        const n = o.trail.length / 2;
        if (n > 3) {
          const chunks = 10, per = Math.ceil(n / chunks);
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (let c = 0; c < chunks; c++) {
            const i0 = c * per, i1 = Math.min(n - 1, (c + 1) * per); if (i1 <= i0) continue;
            const k = (c + 1) / chunks;
            ctx.strokeStyle = o.type === 'photon' ? 'rgba(255,250,215,' + (0.75 * k * fade).toFixed(3) + ')' : Art.rgba(o.color, 0.55 * k * k * fade);
            ctx.lineWidth = o.type === 'photon' ? 0.8 + 1.6 * k : 0.6 + 2.2 * k * sc;
            ctx.beginPath(); ctx.moveTo(o.trail[i0 * 2], o.trail[i0 * 2 + 1]);
            for (let i = i0 + 1; i <= i1; i++) ctx.lineTo(o.trail[i * 2], o.trail[i * 2 + 1]);
            ctx.stroke();
          }
          ctx.restore();
        }
        if (o.dead && o.type === 'photon') continue;
        if (o.type === 'photon') {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          Art.glow(ctx, o.x, o.y, 6 * sc, '#fff6c8', 0.5);
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(o.x, o.y, 2.2 * sc, 0, TAU); ctx.fill();
          ctx.restore();
        } else {
          /* spaghetificare: se întinde pe direcția găurii, se încinge și strălucește */
          const stretch = 1 + near * 5.5;
          const sz = 7 * sc * (o.dead ? Math.max(0.1, 1 - o.dead * 1.4) : 1);
          const ang = Math.atan2(dy, dx);
          if (!o.dead && near > 0.25 && Math.random() < near * 0.25) emitSpark(o.x, o.y, o.vx * 0.8 + (Math.random() - 0.5) * 40, o.vy * 0.8 + (Math.random() - 0.5) * 40, near > 0.7 ? '255,240,200' : '255,170,90');
          ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(ang); ctx.globalAlpha = o.dead ? fade : 1;
          if (near > 0.05) { ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, sz * stretch * 1.6); gl.addColorStop(0, Art.rgba('#ffb050', 0.5 * near)); gl.addColorStop(1, 'rgba(255,120,50,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.ellipse(0, 0, sz * stretch * 1.6, sz * 2.2, 0, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
          const L = sz * stretch, Wd = sz / Math.sqrt(stretch);
          if (near < 0.05) {
            ctx.rotate(-ang);
            Art.sphere(ctx, 0, 0, sz, o.color, { lx: -dx / r * 0.45, ly: -dy / r * 0.45, rimColor: o.color });
          } else {
            const g = ctx.createLinearGradient(-L, 0, L, 0);
            g.addColorStop(0, Art.rgba(o.color, 0.9)); g.addColorStop(0.5, hotRGB(near * 0.7)); g.addColorStop(1, hotRGB(Math.min(1, near * 1.2)));
            ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, L, Wd, 0, 0, TAU); ctx.fill();
          }
          ctx.restore();
        }
      }
      if (sparks.length) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (const p of sparks) { if (Math.hypot(p.x - cx, p.y - cy) < hr * 1.02) continue; const k = 1 - p.age / p.life; ctx.strokeStyle = 'rgba(' + p.c + ',' + (0.85 * k).toFixed(2) + ')'; ctx.lineWidth = 1 + 1.5 * k; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); ctx.stroke(); }
        ctx.restore();
      }

      /* săgeata de țintire */
      if (aim) {
        const dx = aim.x1 - aim.x0, dy = aim.y1 - aim.y0, col = mode === 'photon' ? '#fff2a8' : '#7dffb0';
        if (Math.hypot(dx, dy) > 12) Art.arrow(ctx, aim.x0, aim.y0, aim.x1, aim.y1, { color: col, width: 3, dash: [8, 6] });
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(aim.x0, aim.y0, 5, 0, TAU); ctx.fill();
      }
      /* contor */
      Art.label(ctx, 'Înghițite: ' + swallowed, api.freeW - 14, 80, { size: Art.fs(U, 0.04, 13), align: 'right', color: '#ffd0a0' });
    }

    return { frame: frame, resize: () => setMass(logM) };
  }
});
