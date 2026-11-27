/* Modul: Luna — fazele Lunii și eclipsele */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  /* Luna văzută de pe Pământ; e = unghiul față de Soare (0 = lună nouă, 180 = lună plină) */
  function moonFace(ctx, x, y, r, e, o) {
    o = o || {}; e = ((e % 360) + 360) % 360;
    ctx.save();
    const lit = o.lit || '#f3efd9', dark = o.dark || '#1d2236';
    ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    const k = Math.cos(e * Math.PI / 180), wax = e < 180;
    ctx.fillStyle = lit; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !wax); ctx.closePath(); ctx.fill();
    ctx.fillStyle = k > 0 ? dark : lit; ctx.beginPath(); ctx.ellipse(x, y, r * Math.abs(k) + 0.3, r + 0.3, 0, 0, TAU); ctx.fill();
    /* cratere (se văd mai ales pe partea luminată) */
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    ctx.fillStyle = 'rgba(120,115,100,0.28)';
    [[-0.3, -0.25, 0.22], [0.25, -0.35, 0.14], [0.1, 0.2, 0.26], [-0.35, 0.35, 0.12], [0.45, 0.1, 0.1], [-0.05, -0.55, 0.08]].forEach(([a, b, c]) => { ctx.beginPath(); ctx.arc(x + a * r, y + b * r, c * r, 0, TAU); ctx.fill(); });
    if (o.tint) { ctx.fillStyle = o.tint; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    ctx.restore();
  }
  window.MoonFace = moonFace;
  const NAMES = [[0.9, 'Lună nouă', 'nu se vede: partea luminată e întoarsă spre Soare'], [6.5, 'Semilună în creștere', 'o felie subțire, ca o banană'], [8.3, 'Primul pătrar', 'jumătate de Lună'], [14, 'Luna crește', 'aproape plină'], [15.8, 'Lună plină', 'toată fața e luminată'], [21.3, 'Luna scade', 'începe să se micșoreze'], [23.2, 'Ultimul pătrar', 'cealaltă jumătate'], [28.6, 'Semilună în scădere', 'o felie subțire'], [29.6, 'Lună nouă', 'și o luăm de la capăt']];

  defineModule({
    id: 'moon', title: 'Luna: faze și eclipse', sub: 'De ce își schimbă Luna forma',
    start: function (api) {
      const ctx = api.ctx; let mode = 'phase', day = 4, play = true, ecl = 'solar', ep = 0, eplay = true;
      const bs = {}, rm = api.row('');
      [['phase', '🌓 Fazele Lunii'], ['ecl', '🌑 Eclipsele']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const rp = api.row(''), re = api.row('');
      const ds = api.slider(rp, { label: 'Ziua', min: 0, max: 29.5, step: 0.1, value: day, fmt: (v) => 'ziua ' + Math.round(v) + ' din 29', onInput: (v) => { day = v; play = false; pb.classList.remove('on'); } });
      const pb = api.button(rp, '▶ Luna se mișcă', () => { play = !play; pb.classList.toggle('on', play); }); pb.classList.add('on');
      const eb = {};
      [['solar', '☀️ Eclipsă de Soare'], ['lunar', '🌕 Eclipsă de Lună']].forEach(([k, s]) => { eb[k] = api.button(re, s, () => { ecl = k; ep = 0; for (const q in eb) eb[q].classList.toggle('on', q === k); api.say(TE[k]); }); });
      eb.solar.classList.add('on');
      const TE = {
        solar: '<b>Eclipsa de Soare:</b> Luna trece exact <b>între Soare și Pământ</b> și acoperă Soarele. Pentru câteva minute se face întuneric ziua și se văd stelele! (Nu te uita niciodată direct la Soare.)',
        lunar: '<b>Eclipsa de Lună:</b> Pământul trece exact <b>între Soare și Lună</b>. Umbra Pământului acoperă Luna, iar Luna devine <b>roșiatică</b>, ca o portocală.'
      };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rp.style.display = m === 'phase' ? '' : 'none'; re.style.display = m === 'ecl' ? '' : 'none'; api.say(m === 'phase' ? 'Luna nu are lumina ei: o luminează <b>Soarele</b>, mereu pe jumătate. Luna se învârte în jurul Pământului în <b>aproape o lună (29 de zile)</b>, și noi vedem din partea luminată când mai mult, când mai puțin. Asta sunt <b>fazele Lunii</b>.' : TE[ecl]); api.layout(); }
      const padL = () => api.W >= 700 ? 84 : 8;

      function drawPhase(dt, t) {
        if (play) { day = (day + dt * 1.6) % 29.53; ds.set(day); }
        A.scene(ctx, api.W, api.H, 'space'); A.stars(ctx, api.W, api.H, t, { alpha: 0.7 });
        const U = api.unit, W = api.freeW, wide = W > 700;
        const ex = wide ? padL() + (W - padL()) * 0.36 : W / 2, ey = wide ? api.cy : api.cy - U * 0.32;
        const ro = wide ? Math.min(U * 0.8, (W - padL()) * 0.24) : Math.min(W * 0.33, U * 0.6), er = ro * 0.24, mr = ro * 0.11;
        /* lumina Soarelui din stânga */
        A.glow(ctx, 0, ey, ro * 1.3, '#ffcc55', 0.5);
        for (let i = 0; i < 7; i++) { const yy = ey + (i - 3) * ro * 0.33, ph = (t * 0.5 + i * 0.13) % 1; A.arrow(ctx, padL() + 6, yy, padL() + 6 + ro * 0.5 * (0.5 + ph * 0.5), yy, { color: 'rgba(255,220,120,0.45)', width: 2 }); }
        A.text(ctx, 'lumina Soarelui →', padL() + 70, ey - ro * 1.25, { size: A.fs(U, 0.034, 11), color: '#ffe08a' });
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.arc(ex, ey, ro, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        window.EarthGlobe(ctx, ex, ey, er, t * 30, [-1, 0], 0, { pole: true });
        /* Luna pe orbită (văzută de sus): jumătatea dinspre Soare e luminată */
        const phi = Math.PI + day / 29.53 * TAU, mx = ex + Math.cos(phi) * ro, my = ey - Math.sin(phi) * ro;
        ctx.fillStyle = '#1d2236'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
        ctx.fillStyle = '#f3efd9'; ctx.beginPath(); ctx.arc(mx, my, mr, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(mx, my); ctx.stroke();
        A.arrow(ctx, ex + Math.cos(phi + 0.35) * ro * 1.12, ey - Math.sin(phi + 0.35) * ro * 1.12, ex + Math.cos(phi + 0.6) * ro * 1.12, ey - Math.sin(phi + 0.6) * ro * 1.12, { color: 'rgba(255,255,255,0.5)', width: 2, bend: 0.1 });
        /* 8 faze mici pe cerc, ca o hartă */
        for (let i = 0; i < 8; i++) { const d = i * 29.53 / 8, a = Math.PI + d / 29.53 * TAU, rr = ro * 1.38; moonFace(ctx, ex + Math.cos(a) * rr, ey - Math.sin(a) * rr, mr * 0.72, d / 29.53 * 360, { dark: '#2a3048' }); }
        /* cum se vede de pe Pământ */
        const fr = wide ? Math.min(U * 0.55, (W - ex - ro * 1.5) * 0.34) : U * 0.32, fx = wide ? W - fr - 50 : W / 2, fy = wide ? api.cy - fr * 0.15 : ey + ro * 1.55 + fr + 14;
        A.glow(ctx, fx, fy, fr * 1.6, '#e8e4ff', 0.18);
        moonFace(ctx, fx, fy, fr, day / 29.53 * 360);
        const nm = NAMES.find((n) => day < n[0]) || NAMES[0];
        A.label(ctx, '👀 Așa o vezi tu de pe Pământ', fx, fy - fr - 22, { size: A.labelSize(U) });
        A.text(ctx, nm[1], fx, fy + fr + 22, { size: A.fs(U, 0.06, 15), color: '#fff' });
        A.text(ctx, nm[2], fx, fy + fr + 44, { size: A.fs(U, 0.036, 11), color: 'rgba(255,255,255,0.7)' });
      }

      function drawEcl(dt, t) {
        if (eplay) ep = (ep + dt * 0.09) % 1;
        A.scene(ctx, api.W, api.H, 'space'); A.stars(ctx, api.W, api.H, t, { alpha: 0.6 });
        const U = api.unit, W = api.freeW, wide = W > 700, L = padL();
        const y0 = wide ? api.cy - U * 0.35 : api.cy - U * 0.55;
        /* vedere din lateral (nu e la scară) */
        const sx = L + U * 0.15, sr = U * 0.32;
        A.glow(ctx, sx, y0, sr * 2.2, '#ffb84a', 0.6);
        const sg = ctx.createRadialGradient(sx, y0, 0, sx, y0, sr); sg.addColorStop(0, '#fff8d0'); sg.addColorStop(1, '#ff9a1f'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, y0, sr, 0, TAU); ctx.fill();
        const k = Math.sin(ep * Math.PI), pass = (ep - 0.5) * 2;     // trecerea Lunii: -1 … 1
        let ex, mx, my, er = U * 0.13, mr = U * 0.045;
        if (ecl === 'solar') { ex = W - U * 0.35; mx = lerp(sx + sr, ex, 0.55); my = y0 + pass * U * 0.38; }
        else { ex = lerp(sx + sr, W, 0.55); mx = W - U * 0.25; my = y0 + pass * U * 0.38; }
        const align = 1 - clamp(Math.abs(pass) * 2.6, 0, 1);
        /* umbra */
        if (ecl === 'solar') { ctx.fillStyle = 'rgba(0,0,0,' + (0.5 * align) + ')'; ctx.beginPath(); ctx.moveTo(mx, my - mr); ctx.lineTo(ex - er * 0.9, my - mr * 0.25); ctx.lineTo(ex - er * 0.9, my + mr * 0.25); ctx.lineTo(mx, my + mr); ctx.fill(); }
        else { const g = ctx.createLinearGradient(ex, 0, W, 0); g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ex, y0 - er); ctx.lineTo(W, y0 - er * 0.55); ctx.lineTo(W, y0 + er * 0.55); ctx.lineTo(ex, y0 + er); ctx.fill(); }
        for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(255,220,120,0.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx + sr, y0 + (i - 1) * sr * 0.7); ctx.lineTo(W, y0 + (i - 1) * sr * 0.2); ctx.stroke(); }
        window.EarthGlobe(ctx, ex, y0, er, t * 20, [-1, 0], 0, {});
        if (ecl === 'solar' && align > 0.2) { ctx.fillStyle = 'rgba(0,0,0,' + align * 0.8 + ')'; ctx.beginPath(); ctx.ellipse(ex - er * 0.85, my, er * 0.08, er * 0.14, 0, 0, TAU); ctx.fill(); }
        const inSh = ecl === 'lunar' ? align : 0;
        moonFace(ctx, mx, my, mr, 180, { tint: inSh > 0 ? 'rgba(160,40,10,' + inSh * 0.8 + ')' : null });
        A.text(ctx, 'Soarele', sx, y0 + sr + 18, { size: A.fs(U, 0.035, 11) }); A.text(ctx, 'Pământul', ex, y0 + er + 18, { size: A.fs(U, 0.035, 11) }); A.text(ctx, 'Luna', mx, my - mr - 12, { size: A.fs(U, 0.035, 11) });
        A.text(ctx, '(desenul nu e la scară: în realitate sunt mult mai departe)', W / 2 + L / 2, y0 + U * 0.55, { size: A.fs(U, 0.03, 10), color: 'rgba(255,255,255,0.55)' });
        /* ce vezi */
        const vw = Math.min(W - L - 24, U * 1.5), vh = U * 0.62, vx = L + (W - L - vw) / 2, vy = y0 + U * 0.68;
        ctx.save(); A.roundRectPath(ctx, vx, vy, vw, vh, 14); ctx.clip();
        if (ecl === 'solar') {
          const cov = clamp(1 - Math.abs(pass) * 1.15, 0, 1), dark = Math.pow(cov, 6);
          const g = ctx.createLinearGradient(0, vy, 0, vy + vh); g.addColorStop(0, A.mix('#4a9be8', '#060a1c', dark)); g.addColorStop(1, A.mix('#bfe3ff', '#1b1f3a', dark)); ctx.fillStyle = g; ctx.fillRect(vx, vy, vw, vh);
          if (dark > 0.5) A.stars(ctx, api.W, api.H, t, { alpha: (dark - 0.5) * 2 });
          const cx = vx + vw / 2, cy = vy + vh * 0.42, r = vh * 0.2;
          if (dark > 0.85) { A.glow(ctx, cx, cy, r * 2.4, '#dfe8ff', 0.9 * (dark - 0.85) / 0.15); }
          A.glow(ctx, cx, cy, r * 2, '#ffe9a0', 0.6 * (1 - dark)); ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
          ctx.fillStyle = '#0a0d1a'; ctx.beginPath(); ctx.arc(cx + pass * r * 2.6, cy, r * 1.03, 0, TAU); ctx.fill();
          ctx.fillStyle = A.mix('#3d7a3a', '#0c140c', dark); ctx.beginPath(); ctx.moveTo(vx, vy + vh); for (let i = 0; i <= 12; i++) ctx.lineTo(vx + vw * i / 12, vy + vh * (0.82 + 0.06 * Math.sin(i * 1.7))); ctx.lineTo(vx + vw, vy + vh); ctx.fill();
        } else {
          ctx.fillStyle = '#070b1f'; ctx.fillRect(vx, vy, vw, vh); A.stars(ctx, api.W, api.H, t, { alpha: 0.8 });
          const cx = vx + vw / 2, cy = vy + vh * 0.45, r = vh * 0.24;
          moonFace(ctx, cx, cy, r, 180, { tint: 'rgba(170,45,10,' + inSh * 0.85 + ')' });
          if (inSh < 0.95) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip(); ctx.fillStyle = 'rgba(10,8,15,' + (0.75 * (1 - inSh)) * clamp(1 - Math.abs(pass) * 1.2, 0, 1) + ')'; ctx.beginPath(); ctx.arc(cx - pass * r * 3, cy, r * 1.6, 0, TAU); ctx.fill(); ctx.restore(); }
          ctx.fillStyle = '#0c140c'; ctx.beginPath(); ctx.moveTo(vx, vy + vh); for (let i = 0; i <= 12; i++) ctx.lineTo(vx + vw * i / 12, vy + vh * (0.84 + 0.05 * Math.sin(i * 1.3))); ctx.lineTo(vx + vw, vy + vh); ctx.fill();
        }
        ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; A.roundRectPath(ctx, vx, vy, vw, vh, 14); ctx.stroke();
        A.label(ctx, '👀 Ce vezi de pe Pământ', vx + vw / 2, vy - 4, { size: A.labelSize(U) });
      }
      setMode('phase');
      return { frame: function (dt, t) { if (mode === 'phase') drawPhase(dt, t); else drawEcl(dt, t); } };
    }
  });
})();
