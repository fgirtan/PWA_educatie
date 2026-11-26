/* Modul: Mecanisme — roți dințate de muzeu și pârghia din lemn */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const TAU = Math.PI * 2;

  /* conturul unei roți dințate (dinți trapezoidali cu vârf rotunjit) */
  function gearPath(c, n, rad, m) {
    const p = TAU / n, rOut = rad + m * 0.95, rRoot = rad - m * 1.1;
    c.beginPath();
    for (let k = 0; k < n; k++) {
      const a = k * p;
      const a0 = a - p * 0.31, a1 = a - p * 0.15, a2 = a + p * 0.15, a3 = a + p * 0.31;
      if (k === 0) c.moveTo(Math.cos(a0) * rRoot, Math.sin(a0) * rRoot);
      c.quadraticCurveTo(Math.cos(a - p * 0.25) * rad, Math.sin(a - p * 0.25) * rad, Math.cos(a1) * rOut, Math.sin(a1) * rOut);
      c.arc(0, 0, rOut, a1, a2);
      c.quadraticCurveTo(Math.cos(a + p * 0.25) * rad, Math.sin(a + p * 0.25) * rad, Math.cos(a3) * rRoot, Math.sin(a3) * rRoot);
      c.arc(0, 0, rRoot, a3, a + p - p * 0.31);
    }
    c.closePath();
  }
  /* cache local mic (LRU) — sliderele schimbă des dimensiunile, nu păstrăm zeci de texturi */
  const _tc = new Map();
  function texCache(key, w, h, draw) {
    if (_tc.has(key)) { const c = _tc.get(key); _tc.delete(key); _tc.set(key, c); return c; }
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); draw(c.getContext('2d'), c.width, c.height);
    _tc.set(key, c); if (_tc.size > 9) _tc.delete(_tc.keys().next().value); return c;
  }
  /* textura roții (pre-randată o dată pentru n, rază, culoare) */
  function gearTexture(n, rad, m, col, dpr) {
    const rOut = rad + m * 0.95, S = Math.ceil((rOut + 4) * 2);
    return { S: S, img: texCache('gear|' + n + '|' + rad.toFixed(1) + '|' + m.toFixed(2) + '|' + col + '|' + dpr, S * dpr, S * dpr, (c, w) => {
      c.scale(dpr, dpr); c.translate(S / 2, S / 2);
      const rRoot = rad - m * 1.1, rWeb = rRoot - m * 1.3, rHub = Math.max(rad * 0.26, m * 2.2);
      gearPath(c, n, rad, m);
      const g = c.createRadialGradient(0, 0, rHub, 0, 0, rOut); g.addColorStop(0, Art.shade(col, 0.18)); g.addColorStop(0.75, col); g.addColorStop(1, Art.shade(col, -0.3));
      c.fillStyle = g; c.fill();
      c.save(); c.clip();
      let s = n * 31 + 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let r = rHub; r < rOut; r += 1.6) { c.strokeStyle = 'rgba(' + (rnd() < 0.5 ? '255,255,255' : '0,0,0') + ',' + (0.03 + rnd() * 0.05) + ')'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); }
      c.restore();
      c.strokeStyle = Art.shade(col, -0.55); c.lineWidth = 1.4; c.stroke();
      /* treaptă: obada (rim) iese în relief față de disc */
      if (rWeb > rHub + m) {
        c.beginPath(); c.arc(0, 0, rWeb, 0, TAU);
        const wg = c.createRadialGradient(0, 0, rHub, 0, 0, rWeb); wg.addColorStop(0, Art.shade(col, -0.12)); wg.addColorStop(1, Art.shade(col, -0.38)); c.fillStyle = wg; c.fill();
        c.strokeStyle = Art.shade(col, 0.35); c.lineWidth = 1.5; c.stroke();
        /* găuri de ușurare */
        const holes = n >= 18 ? 6 : n >= 11 ? 5 : 4, hr = (rWeb - rHub) * 0.34, hc = (rWeb + rHub) / 2;
        if (hr > 3) {
          c.save(); c.globalCompositeOperation = 'destination-out';
          for (let k = 0; k < holes; k++) { const a = k / holes * TAU + 0.3; c.beginPath(); c.arc(Math.cos(a) * hc, Math.sin(a) * hc, hr, 0, TAU); c.fill(); }
          c.restore();
          for (let k = 0; k < holes; k++) { const a = k / holes * TAU + 0.3; c.strokeStyle = Art.shade(col, -0.6); c.lineWidth = 2; c.beginPath(); c.arc(Math.cos(a) * hc, Math.sin(a) * hc, hr, 0, TAU); c.stroke(); }
        }
      }
      /* butuc + ax */
      c.beginPath(); c.arc(0, 0, rHub, 0, TAU);
      const hg = c.createRadialGradient(-rHub * 0.3, -rHub * 0.3, 1, 0, 0, rHub); hg.addColorStop(0, Art.shade(col, 0.4)); hg.addColorStop(1, Art.shade(col, -0.3)); c.fillStyle = hg; c.fill();
      c.strokeStyle = Art.shade(col, -0.55); c.lineWidth = 1.2; c.stroke();
      const ra = rHub * 0.5;
      c.beginPath(); c.arc(0, 0, ra, 0, TAU); const ag = c.createLinearGradient(-ra, -ra, ra, ra); ag.addColorStop(0, '#f1f4f8'); ag.addColorStop(1, '#5d6676'); c.fillStyle = ag; c.fill();
      c.fillStyle = '#2b313d'; c.fillRect(-ra * 0.18, -ra - 1, ra * 0.36, ra * 0.45);           // canal de pană
      c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; c.lineTo(Math.cos(a) * ra * 0.55, Math.sin(a) * ra * 0.55); } c.closePath(); c.fillStyle = '#9aa3b2'; c.fill(); c.strokeStyle = '#4a5260'; c.lineWidth = 1; c.stroke();
    }) };
  }
  function wrap(ctx, s, maxW) { const words = s.split(' '), out = []; let line = ''; for (const w of words) { const tl = line ? line + ' ' + w : w; if (ctx.measureText(tl).width > maxW && line) { out.push(line); line = w; } else line = tl; } if (line) out.push(line); return out; }

  /* ============================================================
     4) MECANISME: roți dințate și pârghii
     ============================================================ */
  defineModule({
    id: 'mechanics', title: 'Mecanisme', sub: 'Roți dințate și pârghii',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'gears', nA = 12, nB = 24, nC = 8, rpm = 0.6, thA = 0, mL = 4, mR = 2, fulc = 0.5, tilt = 0, vT = 0, dash = 0, bal = 0;
      const bs = {};
      const rm = api.row('');
      [['gears', '⚙️ Roți dințate'], ['lever', '⚖️ Pârghie']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const rg = api.row(''), rl = api.row('');
      api.slider(rg, { label: 'Viteza roții din stânga', min: -2, max: 2, step: 0.05, value: rpm, fmt: (v) => fmt(v) + ' ture/s', onInput: (v) => { rpm = v; } });
      api.slider(rg, { label: 'Dinți roata 2', min: 6, max: 36, step: 1, value: nB, fmt: (v) => v + ' dinți', onInput: (v) => { nB = v; } });
      api.slider(rg, { label: 'Dinți roata 3', min: 6, max: 36, step: 1, value: nC, fmt: (v) => v + ' dinți', onInput: (v) => { nC = v; } });
      api.slider(rl, { label: 'Greutatea din stânga', min: 1, max: 10, step: 1, value: mL, fmt: (v) => v + ' kg', onInput: (v) => { mL = v; } });
      api.slider(rl, { label: 'Greutatea din dreapta', min: 1, max: 10, step: 1, value: mR, fmt: (v) => v + ' kg', onInput: (v) => { mR = v; } });
      api.slider(rl, { label: 'Poziția reazemului', min: 0.15, max: 0.85, step: 0.01, value: fulc, fmt: (v) => v < 0.45 ? 'spre stânga' : v > 0.55 ? 'spre dreapta' : 'la mijloc', onInput: (v) => { fulc = v; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; rl.appendChild(info);
      const MSG = { gears: 'Roțile dințate își transmit mișcarea. <b>Două roți care se ating se rotesc în sensuri opuse.</b> O roată mică învârte una mare încet, dar cu mai multă forță (ca la bicicletă, la viteze). Schimbă numărul de dinți!', lever: 'Pârghia echilibrează greutăți: contează <b>greutatea × distanța</b> până la reazem. O greutate mică, departe de reazem, poate ridica una mare, aproape de reazem. Încearcă să o echilibrezi!' };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rg.style.display = m === 'gears' ? '' : 'none'; rl.style.display = m === 'lever' ? '' : 'none'; api.say(MSG[m], 14000); api.layout(); }

      const COLS = ['#d9a441', '#5f95cf', '#6fb878'];
      function gearShadow(x, y, rOut, U) { const ox = U * 0.025, oy = U * 0.045; const g = ctx.createRadialGradient(x + ox, y + oy, rOut * 0.6, x + ox, y + oy, rOut * 1.12); g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + ox, y + oy, rOut * 1.12, 0, TAU); ctx.fill(); }
      function gear(x, y, n, rad, m, th, col) {
        const dpr = Math.min(2, api.DPR || window.devicePixelRatio || 1);
        const tx = gearTexture(n, rad, m, col, dpr), rOut = rad + m * 0.95, rRoot = rad - m * 1.1;
        ctx.save(); ctx.translate(x, y); ctx.rotate(th); ctx.drawImage(tx.img, -tx.S / 2, -tx.S / 2, tx.S, tx.S); ctx.restore();
        /* lumină fixă (nu se rotește odată cu roata) */
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, rRoot, 0, TAU); ctx.clip();
        const hl = ctx.createRadialGradient(x - rOut * 0.45, y - rOut * 0.5, 0, x - rOut * 0.3, y - rOut * 0.3, rOut * 1.1); hl.addColorStop(0, 'rgba(255,255,255,0.28)'); hl.addColorStop(0.5, 'rgba(255,255,255,0.04)'); hl.addColorStop(1, 'rgba(0,0,0,0.22)');
        ctx.fillStyle = hl; ctx.fillRect(x - rOut, y - rOut, rOut * 2, rOut * 2); ctx.restore();
      }
      function turnArrow(x, y, r, w, col, U) {
        if (Math.abs(w) < 0.01) return;
        const dir = w > 0 ? 1 : -1, span = 0.9, a0 = -Math.PI / 2 - span / 2 * dir, a1 = -Math.PI / 2 + span / 2 * dir;
        ctx.save(); ctx.strokeStyle = Art.rgba(col, 0.9); ctx.fillStyle = Art.rgba(col, 0.95); ctx.lineWidth = Math.max(3, U * 0.018); ctx.lineCap = 'round';
        ctx.setLineDash([U * 0.04, U * 0.03]); ctx.lineDashOffset = -dash * dir * U * 0.07;
        ctx.beginPath(); ctx.arc(x, y, r, a0, a1, dir < 0); ctx.stroke(); ctx.setLineDash([]);
        const hx = x + Math.cos(a1) * r, hy = y + Math.sin(a1) * r, ta = a1 + dir * Math.PI / 2, h = Math.max(9, U * 0.05);
        ctx.beginPath(); ctx.moveTo(hx + Math.cos(ta) * h, hy + Math.sin(ta) * h); ctx.lineTo(hx + Math.cos(ta + 2.4) * h * 0.7, hy + Math.sin(ta + 2.4) * h * 0.7); ctx.lineTo(hx + Math.cos(ta - 2.4) * h * 0.7, hy + Math.sin(ta - 2.4) * h * 0.7); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      function rivet(x, y, r) { Art.sphere(ctx, x, y, r, '#9aa3b4', { rim: false }); }

      function drawGears(dt, t) {
        const W = api.freeW, cx = api.cx, cy = api.cy, U = api.unit;
        thA += rpm * TAU * dt; dash += dt;
        const nMax = Math.max(nA, nB, nC);
        const m = Math.max(1, Math.min(U * 0.12, (W - 30) / ((nA + nB + nC) * 0.5 + 8) * 0.5, U * 0.6 / (nMax / 2 + 1)));   // „modulul”: raza = m·n/2
        const rA = m * nA / 2, rB = m * nB / 2, rC = m * nC / 2;
        const total = rA * 2 + rB * 2 + rC * 2, x0 = cx - total / 2 + rA, xB = x0 + rA + rB, xC = xB + rB + rC, gy = cy + U * 0.14;
        const thB = Math.PI + Math.PI / nB - thA * nA / nB, thC = Math.PI + Math.PI / nC - thB * nB / nC;
        /* placa din spate (exponat), cu nituri și axe */
        const rMax = (nMax / 2 + 1) * m, px = Math.max(8, cx - total / 2 - m * 3), pw = Math.min(W - 16, total + m * 6), ptop = gy - rMax - m * 2.5, ph = rMax * 2 + m * 5;
        Art.metalPlate(ctx, px, ptop, pw, ph, 18, '#3c465c');
        ctx.save(); Art.roundRectPath(ctx, px, ptop, pw, ph, 18); ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 1; for (let y = ptop; y < ptop + ph; y += 3) { ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + pw, y + 6); ctx.stroke(); }
        ctx.restore();
        const rv = Math.max(3, U * 0.018); [[px + 14, ptop + 14], [px + pw - 14, ptop + 14], [px + 14, ptop + ph - 14], [px + pw - 14, ptop + ph - 14]].forEach(([x, y]) => rivet(x, y, rv));
        [[x0, rA], [xB, rB], [xC, rC]].forEach(([x]) => { Art.groundShadow(ctx, x + U * 0.02, gy + U * 0.03, U * 0.06, U * 0.06, 0.6); });
        gearShadow(x0, gy, rA + m, U); gearShadow(xB, gy, rB + m, U); gearShadow(xC, gy, rC + m, U);
        gear(x0, gy, nA, rA, m, thA, COLS[0]);
        gear(xB, gy, nB, rB, m, thB, COLS[1]);
        gear(xC, gy, nC, rC, m, thC, COLS[2]);
        /* punctele de contact: mică strălucire */
        const w2 = -rpm * nA / nB, w3 = -w2 * nB / nC;
        const F = Art.labelSize(U), LB = Art.LABEL_BG;
        [[x0, rA, rpm, 0], [xB, rB, w2, 1], [xC, rC, w3, 2]].forEach(([x, r, w, i]) => turnArrow(x, gy, r + m * 2.4, w, Art.shade(COLS[i], 0.35), U));
        [[x0, rA, nA, 'Roata 1', 0], [xB, rB, nB, 'Roata 2', 1], [xC, rC, nC, 'Roata 3', 2]].forEach(([x, r, n, lab, i]) => Art.label(ctx, lab + ' · ' + n + ' dinți', x, gy + r + m * 1.2 + F * 1.3, { size: F, bg: LB, color: Art.shade(COLS[i], 0.55) }));
        /* panou cu vitezele */
        ctx.save(); ctx.font = Art.font(F, 700);
        const pnW = Math.min(W - 24, Math.max(260, U * 1.5)), lh = F * 1.45;
        const note = nB > nA ? 'Roata 2 are mai mulți dinți → merge mai încet, dar mai cu forță.' : nB < nA ? 'Roata 2 are mai puțini dinți → merge mai repede, dar cu mai puțină forță.' : 'Același număr de dinți → aceeași viteză.';
        ctx.font = Art.font(Math.max(12, F * 0.92), 600); const nl = wrap(ctx, note, pnW - 24);
        ctx.restore();
        const pnH = lh * (3 + nl.length) + 18, pnX = 12, pnY = api.cy - U + 6;
        Art.panel(ctx, pnX, pnY, pnW, pnH, { r: 12 });
        const lines = [['↻ roata 1: ' + fmt(rpm, 2) + ' ture/s', COLS[0]], ['roata 2: ' + fmt(w2, 2) + ' ture/s (' + (w2 * rpm < 0 ? 'sens opus' : 'același sens') + ')', COLS[1]], ['roata 3: ' + fmt(-w3 * -1, 2) + ' ture/s', COLS[2]]];
        lines.forEach(([s, c], i) => { const yy = pnY + 9 + lh * (i + 0.5); ctx.fillStyle = Art.shade(c, 0.2); ctx.beginPath(); ctx.arc(pnX + 16, yy, F * 0.3, 0, TAU); ctx.fill(); Art.text(ctx, s, pnX + 28, yy, { size: F, align: 'left', halo: false }); });
        nl.forEach((s, i) => Art.text(ctx, s, pnX + 12, pnY + 9 + lh * (3.5 + i), { size: Math.max(12, F * 0.92), weight: 600, align: 'left', color: 'rgba(226,234,255,0.82)', halo: false }));
      }

      function weight(x, baseY, mass, col, U) {
        const s = U * (0.13 + mass * 0.024), w = s * 0.95, h = s;
        const top = baseY - h;
        /* mâner */
        ctx.save(); ctx.lineWidth = Math.max(3, s * 0.12); ctx.strokeStyle = '#2b2f38'; ctx.beginPath(); ctx.arc(x, top + s * 0.02, w * 0.26, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = Math.max(1, s * 0.03); ctx.beginPath(); ctx.arc(x, top + s * 0.02, w * 0.26, Math.PI * 1.1, Math.PI * 1.5); ctx.stroke(); ctx.restore();
        /* corp turnat (trapez rotunjit) */
        ctx.beginPath(); ctx.moveTo(x - w * 0.36, top); ctx.lineTo(x + w * 0.36, top); ctx.quadraticCurveTo(x + w * 0.44, top, x + w * 0.47, top + h * 0.12); ctx.lineTo(x + w * 0.52, baseY - h * 0.08); ctx.quadraticCurveTo(x + w * 0.53, baseY, x + w * 0.44, baseY); ctx.lineTo(x - w * 0.44, baseY); ctx.quadraticCurveTo(x - w * 0.53, baseY, x - w * 0.52, baseY - h * 0.08); ctx.lineTo(x - w * 0.47, top + h * 0.12); ctx.quadraticCurveTo(x - w * 0.44, top, x - w * 0.36, top); ctx.closePath();
        Art.volumeFill(ctx, x - w / 2, top, x + w / 2, baseY, col, { hi: 0.35, lo: 0.5 });
        ctx.strokeStyle = Art.ink(col); ctx.lineWidth = Art.lineW(U) * 1.2; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x - w * 0.4, top + h * 0.1, w * 0.08, h * 0.75);
        Art.text(ctx, mass + ' kg', x, top + h * 0.58, { size: Math.max(12, s * 0.3), weight: 800, haloColor: Art.rgba(Art.shade(col, -0.6), 0.9) });
      }

      function drawLever(dt, t) {
        const W = api.freeW, cx = api.cx, cy = api.cy, U = api.unit;
        const bw = Math.min(W - 40, U * 3), x0 = cx - bw / 2, py = cy + U * 0.3;
        const fx = x0 + bw * fulc;
        const tL = mL * (fx - x0) / bw, tR = mR * (x0 + bw - fx) / bw;      // momente (kg × fracție din bară)
        const target = clamp((tR - tL) * 0.55, -0.35, 0.35);
        const bt = Math.max(12, U * 0.075), ph = Math.max(44, U * 0.36), floorY = py + ph;
        vT += (target - tilt) * 40 * dt; vT *= Math.exp(-dt * 6); tilt += vT * dt;
        /* capătul scândurii se oprește pe podea (nu trece prin ea) */
        const limL = Math.asin(clamp((ph - bt * 0.5) / Math.max(1, fx - x0), 0, 1)), limR = Math.asin(clamp((ph - bt * 0.5) / Math.max(1, x0 + bw - fx), 0, 1));
        if (tilt < -limL) { tilt = -limL; vT = Math.max(0, vT) * 0.2; } if (tilt > limR) { tilt = limR; vT = Math.min(0, vT) * 0.2; }
        /* podea de muzeu (scândură lustruită) */
        const fg = ctx.createLinearGradient(0, floorY, 0, api.H); fg.addColorStop(0, '#5a3d27'); fg.addColorStop(1, '#22160d'); ctx.fillStyle = fg; ctx.fillRect(0, floorY, api.W, api.H - floorY);
        ctx.fillStyle = 'rgba(255,220,170,0.25)'; ctx.fillRect(0, floorY, api.W, 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; for (let i = 1; i < 6; i++) { const y = floorY + i * i * 6; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(api.W, y); ctx.stroke(); }
        Art.groundShadow(ctx, fx, floorY + 2, ph * 0.8, ph * 0.12, 0.6);
        Art.groundShadow(ctx, cx, floorY + 4, bw * 0.55, U * 0.04, 0.35);
        /* reazemul */
        ctx.beginPath(); ctx.moveTo(fx - ph * 0.55, floorY); ctx.quadraticCurveTo(fx - ph * 0.1, py + ph * 0.25, fx - ph * 0.1, py + bt * 0.4); ctx.quadraticCurveTo(fx, py - bt * 0.05, fx + ph * 0.1, py + bt * 0.4); ctx.quadraticCurveTo(fx + ph * 0.1, py + ph * 0.25, fx + ph * 0.55, floorY); ctx.closePath();
        Art.volumeFill(ctx, fx - ph * 0.5, py, fx + ph * 0.5, floorY, '#8a8f99', { hi: 0.4, lo: 0.5 });
        ctx.strokeStyle = Art.ink('#8a8f99'); ctx.lineWidth = Art.lineW(U) * 1.2; ctx.stroke();
        /* bara (scândură de lemn) */
        ctx.save(); ctx.translate(fx, py); ctx.rotate(tilt);
        const L = x0 - fx;
        Art.softShadow(ctx, () => { Art.roundRectPath(ctx, L, -bt / 2, bw, bt, bt * 0.3); const wg = ctx.createLinearGradient(0, -bt / 2, 0, bt / 2); wg.addColorStop(0, '#e6bd7f'); wg.addColorStop(0.45, '#c99a5b'); wg.addColorStop(1, '#7d5a30'); ctx.fillStyle = wg; ctx.fill(); }, { blur: 6, dy: 3, color: 'rgba(0,0,0,0.3)' });
        ctx.save(); Art.roundRectPath(ctx, L, -bt / 2, bw, bt, bt * 0.3); ctx.clip();
        ctx.strokeStyle = 'rgba(110,70,30,0.35)'; ctx.lineWidth = 1;
        for (let k = 0; k < 5; k++) { const yy = -bt * 0.35 + k * bt * 0.17; ctx.beginPath(); ctx.moveTo(L, yy); for (let x = 0; x <= bw; x += bw / 24) ctx.lineTo(L + x, yy + Math.sin(x * 0.03 + k * 2.1) * bt * 0.06 + Art.noise1(x * 0.02 + k * 5) * bt * 0.05); ctx.stroke(); }
        ctx.fillStyle = 'rgba(90,55,20,0.35)'; ctx.beginPath(); ctx.ellipse(L + bw * 0.31, bt * 0.05, bt * 0.25, bt * 0.12, 0, 0, TAU); ctx.fill();
        ctx.restore();
        ctx.fillStyle = 'rgba(60,35,10,0.65)'; for (let k = 1; k < 10; k++) ctx.fillRect(L + bw * k / 10 - 1, -bt / 2, 2, bt * 0.4);
        ctx.strokeStyle = Art.ink('#c99a5b'); ctx.lineWidth = Art.lineW(U); Art.roundRectPath(ctx, L, -bt / 2, bw, bt, bt * 0.3); ctx.stroke();
        weight(L + bw * 0.12, -bt / 2, mL, '#c8553a', U); weight(L + bw * 0.88, -bt / 2, mR, '#3a7fc8', U);
        ctx.restore();
        Art.sphere(ctx, fx, py, Math.max(4, bt * 0.32), '#d0d5de', { rim: false });
        const F = Art.labelSize(U), LB = Art.LABEL_BG;
        Art.label(ctx, 'reazem', fx, floorY + F * 1.6, { size: F, bg: LB, color: '#e9edf5' });
        const dL = (fx - (x0 + bw * 0.12)) / bw * 10, dR = ((x0 + bw * 0.88) - fx) / bw * 10;
        const balanced = Math.abs(mL * dL - mR * dR) < 0.5;
        bal = Art.damp(bal, balanced ? 1 : 0, 6, dt);
        if (bal > 0.02) { ctx.save(); ctx.globalAlpha = bal; Art.label(ctx, 'echilibru!', fx, py - U * 0.45, { size: F * 1.1, bg: LB, color: '#7dffb0' }); ctx.restore(); }
        info.innerHTML = 'Stânga: <b>' + mL + ' kg × ' + fmt(dL, 1) + '</b> = ' + fmt(mL * dL, 1) + ' · Dreapta: <b>' + mR + ' kg × ' + fmt(dR, 1) + '</b> = ' + fmt(mR * dR, 1) + (balanced ? ' · ✅ <b>echilibru!</b>' : mL * dL > mR * dR ? ' · se lasă spre stânga' : ' · se lasă spre dreapta');
      }

      function frame(dt, t) {
        const cx = api.cx, cy = api.cy, U = api.unit;
        Art.scene(ctx, api.W, api.H, 'lab');
        if (mode === 'gears') drawGears(dt, t); else drawLever(dt, t);
      }
      setMode('gears');
      return { frame: frame };
    }
  });
})();
