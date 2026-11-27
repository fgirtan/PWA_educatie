/* Modul: Ziua și noaptea · Anotimpurile */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp, D2R = Math.PI / 180;
  /* continentele, din „pete” [longitudine, latitudine, rază în grade] */
  const LAND = [
    [10, 50, 9], [25, 52, 8], [0, 45, 6], [15, 42, 5], [30, 60, 8], [20, 64, 6], [40, 48, 7],
    [20, 5, 14], [15, 20, 13], [8, 23, 8, 1], [28, 24, 7, 1], [45, 24, 5, 1], [30, -5, 11], [25, -20, 9], [0, 10, 8], [35, 12, 8], [20, -30, 6], [45, 5, 5], [47, -19, 3],
    [60, 50, 14], [90, 55, 15], [110, 40, 12], [80, 25, 9], [100, 20, 7], [120, 60, 12], [140, 65, 9], [50, 30, 8], [105, 10, 5], [137, 36, 4], [78, 15, 6], [115, -2, 5], [140, -5, 4],
    [-100, 45, 14], [-90, 35, 9], [-110, 60, 12], [-80, 52, 8], [-102, 25, 6], [-150, 62, 7], [-75, 40, 5], [-88, 15, 4], [-120, 40, 7],
    [-60, -10, 13], [-55, -25, 9], [-66, -40, 6], [-70, 0, 8], [-70, -50, 4], [-45, -8, 6],
    [134, -25, 11], [146, -32, 6], [-42, 72, 8], [0, -85, 14], [90, -80, 12], [180, -82, 12], [-90, -80, 12], [172, -42, 3]
  ];
  const RO = [25, 46];
  /* desenează globul: lumina vine din direcția (sx, sy) (vector pe ecran spre Soare) */
  function globe(ctx, gx, gy, R, rot, sun, tilt, opts) {
    opts = opts || {};
    ctx.save(); ctx.translate(gx, gy);
    { const sg = ctx.createRadialGradient(sun[0] * R * 0.4, sun[1] * R * 0.4, R * 0.1, 0, 0, R); sg.addColorStop(0, '#3a8ee0'); sg.addColorStop(1, '#14508f'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); }
    ctx.rotate(tilt || 0);
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
    for (const [lo, la, r, dz] of LAND) {
      const L = (lo + rot) * D2R, B = la * D2R, z = Math.cos(B) * Math.cos(L);
      if (z < -0.25) continue;
      const x = Math.cos(B) * Math.sin(L) * R, y = -Math.sin(B) * R, rr = r * D2R * R;
      ctx.fillStyle = Math.abs(la) > 66 ? '#eef4fa' : dz ? '#d9b46a' : '#4f9a45';
      ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.5, rr * Math.max(0.05, Math.cos(L))), Math.max(0.5, rr * Math.max(0.12, Math.cos(B))), 0, 0, TAU); ctx.fill();
    }
    if (opts.pole) { ctx.fillStyle = '#eef4fa'; ctx.beginPath(); ctx.ellipse(0, -R, R * 0.5, R * 0.16, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, R, R * 0.55, R * 0.16, 0, 0, TAU); ctx.fill(); }
    /* noaptea: partea dinspre umbră */
    const c = Math.cos(-(tilt || 0)), s = Math.sin(-(tilt || 0)), dx = sun[0] * c - sun[1] * s, dy = sun[0] * s + sun[1] * c;
    const g = ctx.createLinearGradient(dx * R, dy * R, -dx * R, -dy * R);
    g.addColorStop(0, 'rgba(4,8,30,0)'); g.addColorStop(0.45, 'rgba(4,8,30,0)'); g.addColorStop(0.56, 'rgba(4,8,30,0.72)'); g.addColorStop(1, 'rgba(4,8,30,0.8)');
    ctx.fillStyle = g; ctx.fillRect(-R, -R, R * 2, R * 2);
    if (opts.lights) for (const [lo, la] of LAND) { const L = (lo + rot) * D2R, B = la * D2R; if (Math.cos(B) * Math.cos(L) < 0.1 || Math.abs(la) > 62) continue; const x = Math.cos(B) * Math.sin(L) * R, y = -Math.sin(B) * R; if ((x * dx + y * dy) / R > -0.15) continue; ctx.fillStyle = 'rgba(255,214,120,0.85)'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x + ((k * 37 + lo) % 7 - 3) * R * 0.012, y + ((k * 53 + la) % 5 - 2) * R * 0.012, Math.max(1, R * 0.009), 0, TAU); ctx.fill(); } }
    ctx.restore();
    const at = ctx.createRadialGradient(0, 0, R * 0.92, 0, 0, R * 1.08); at.addColorStop(0, 'rgba(120,190,255,0)'); at.addColorStop(0.5, 'rgba(120,190,255,0.35)'); at.addColorStop(1, 'rgba(120,190,255,0)');
    ctx.fillStyle = at; ctx.beginPath(); ctx.arc(0, 0, R * 1.08, 0, TAU); ctx.fill();
    if (opts.axis) { ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(0, -R * 1.35); ctx.lineTo(0, R * 1.35); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#fff'; ctx.font = A.font(Math.max(10, R * 0.16)); ctx.textAlign = 'center'; ctx.fillText('N', 0, -R * 1.42); }
    if (opts.marker) {
      const L = (RO[0] + rot) * D2R, B = RO[1] * D2R, z = Math.cos(B) * Math.cos(L);
      if (z > 0) { const x = Math.cos(B) * Math.sin(L) * R, y = -Math.sin(B) * R; ctx.fillStyle = '#ff4d6d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, Math.max(4, R * 0.045), 0, TAU); ctx.fill(); ctx.stroke(); }
    }
    ctx.restore();
  }
  window.EarthGlobe = globe;

  function sunDisk(ctx, x, y, r, t) {
    A.glow(ctx, x, y, r * 3, '#ffcc55', 0.7);
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, '#fffbe0'); g.addColorStop(0.6, '#ffd54a'); g.addColorStop(1, '#ff9a1f');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  /* mic peisaj „la noi acasă” */
  function homeScene(ctx, x, y, w, h, o) {
    ctx.save(); A.roundRectPath(ctx, x, y, w, h, 12); ctx.clip();
    const sk = o.skyTop, g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, sk[0]); g.addColorStop(1, sk[1]); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    const gy = y + h * 0.78;
    if (o.stars) { ctx.fillStyle = 'rgba(255,255,255,' + o.stars + ')'; for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.arc(x + ((i * 73) % 97) / 97 * w, y + ((i * 41) % 61) / 61 * h * 0.6, 1.1, 0, TAU); ctx.fill(); } }
    if (o.sunAlt !== undefined && o.sunAlt > -8) { const sx = x + w * (o.sunX === undefined ? 0.5 : o.sunX), sy = gy - (o.sunAlt / 90) * h * 0.95; sunDisk(ctx, sx, sy, h * 0.07); }
    if (o.moon) { ctx.fillStyle = '#f4f1dc'; ctx.beginPath(); ctx.arc(x + w * 0.78, y + h * 0.22, h * 0.06, 0, TAU); ctx.fill(); ctx.fillStyle = o.skyTop[0]; ctx.beginPath(); ctx.arc(x + w * 0.78 + h * 0.03, y + h * 0.2, h * 0.055, 0, TAU); ctx.fill(); }
    ctx.fillStyle = o.ground; ctx.fillRect(x, gy, w, h);
    /* casa */
    const hx = x + w * 0.2, hw = w * 0.22, hh = h * 0.2;
    ctx.fillStyle = '#e9d8b8'; ctx.fillRect(hx, gy - hh, hw, hh); ctx.fillStyle = '#b5452f'; ctx.beginPath(); ctx.moveTo(hx - hw * 0.12, gy - hh); ctx.lineTo(hx + hw / 2, gy - hh - hh * 0.75); ctx.lineTo(hx + hw * 1.12, gy - hh); ctx.fill();
    ctx.fillStyle = o.night ? '#ffd56a' : '#6fb4e8'; ctx.fillRect(hx + hw * 0.15, gy - hh * 0.75, hw * 0.25, hh * 0.3); ctx.fillStyle = '#7a4a2a'; ctx.fillRect(hx + hw * 0.6, gy - hh * 0.6, hw * 0.24, hh * 0.6);
    if (o.snow) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(hx - hw * 0.12, gy - hh); ctx.lineTo(hx + hw / 2, gy - hh - hh * 0.75); ctx.lineTo(hx + hw * 1.12, gy - hh); ctx.lineTo(hx + hw / 2, gy - hh - hh * 0.55); ctx.fill(); }
    /* copacul */
    if (o.tree) { const tx = x + w * 0.68, th = h * 0.42; ctx.strokeStyle = '#6a4a2e'; ctx.lineWidth = Math.max(3, w * 0.025); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tx, gy); ctx.lineTo(tx, gy - th * 0.55); ctx.moveTo(tx, gy - th * 0.4); ctx.lineTo(tx - w * 0.06, gy - th * 0.72); ctx.moveTo(tx, gy - th * 0.45); ctx.lineTo(tx + w * 0.07, gy - th * 0.75); ctx.stroke();
      if (o.tree !== 'bare') { const cols = { summer: ['#3f9a3c', '#58b04a'], autumn: ['#e08a2a', '#c8562a'], spring: ['#7cc56a', '#ffb3cf'] }[o.tree]; for (let i = 0; i < 9; i++) { ctx.fillStyle = cols[i % 2]; ctx.beginPath(); ctx.arc(tx + Math.cos(i * 2.4) * w * 0.07, gy - th * 0.78 + Math.sin(i * 2.4) * h * 0.08, w * 0.055, 0, TAU); ctx.fill(); } }
      if (o.tree === 'autumn') for (let i = 0; i < 6; i++) { const ft = (o.t * 0.25 + i / 6) % 1; ctx.fillStyle = i % 2 ? '#e08a2a' : '#c8562a'; ctx.beginPath(); ctx.ellipse(tx + Math.sin(ft * 9 + i) * w * 0.08, gy - th * 0.7 + ft * th * 0.7, 3, 2, ft * 6, 0, TAU); ctx.fill(); }
    }
    if (o.snow) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 30; i++) { const ft = (o.t * 0.15 + i * 0.137) % 1; ctx.beginPath(); ctx.arc(x + ((i * 61) % 100) / 100 * w + Math.sin(o.t + i) * 4, y + ft * h * 0.8, 1.6, 0, TAU); ctx.fill(); } }
    if (o.dim) { ctx.fillStyle = 'rgba(5,10,40,' + o.dim + ')'; ctx.fillRect(x, y, w, h); }
    ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5; A.roundRectPath(ctx, x, y, w, h, 12); ctx.stroke();
  }

  defineModule({
    id: 'seasons', title: 'Ziua, noaptea și anotimpurile', sub: 'Pământul se învârte și e puțin aplecat',
    start: function (api) {
      const ctx = api.ctx; let mode = 'day', rot = -40, spd = 1, month = 5.7, play = true;
      const bs = {}, rm = api.row('');
      [['day', '🌗 Ziua și noaptea'], ['year', '🍂 Anotimpurile']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const rd = api.row(''), ry = api.row('');
      api.slider(rd, { label: 'Cât de repede se învârte', min: 0, max: 3, step: 0.1, value: spd, fmt: (v) => v === 0 ? 'oprit' : '×' + v.toFixed(1), onInput: (v) => { spd = v; } });
      const MN = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
      const ms = api.slider(ry, { label: 'Luna', min: 0, max: 11.99, step: 0.01, value: month, fmt: (v) => MN[Math.floor(v)], onInput: (v) => { month = v; play = false; pb.classList.remove('on'); } });
      const pb = api.button(ry, '▶ Mergi în jurul Soarelui', () => { play = !play; pb.classList.toggle('on', play); }); pb.classList.add('on');
      const T = {
        day: 'Pământul se învârte ca un titirez: o tură completă durează <b>o zi (24 de ore)</b>. Partea întoarsă spre Soare are <b>zi</b>, partea cealaltă are <b>noapte</b>. Punctul roșu e România: urmărește-l cum trece din zi în noapte!',
        year: 'Pământul face un drum în jurul Soarelui într-un <b>an</b>. El e puțin <b>aplecat</b>. Vara, partea noastră e aplecată spre Soare: Soarele urcă sus pe cer și zilele sunt lungi și calde. Iarna e aplecată în cealaltă parte: Soarele stă jos și e frig.'
      };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); rd.style.display = m === 'day' ? '' : 'none'; ry.style.display = m === 'year' ? '' : 'none'; api.say(T[m]); api.layout(); }
      const padL = () => api.W >= 700 ? 84 : 8;

      function drawDay(dt, t) {
        rot += dt * spd * 14;
        A.scene(ctx, api.W, api.H, 'space'); A.stars(ctx, api.W, api.H, t);
        const U = api.unit, W = api.freeW, wide = W > 640;
        const R = wide ? Math.min(U * 0.78, W * 0.24) : Math.min(U * 0.55, W * 0.3), gx = wide ? padL() + (W - padL()) * 0.45 : W * 0.56, gy = api.cy - (wide ? 0 : U * 0.42);
        sunDisk(ctx, padL() - R * 0.2, gy, R * 0.45, t);
        for (let i = 0; i < 6; i++) { const yy = gy + (i - 2.5) * R * 0.32, ph = (t * 0.6 + i * 0.17) % 1; A.arrow(ctx, padL() + R * 0.35, yy, padL() + R * 0.35 + (gx - R - padL() - R * 0.45) * (0.4 + ph * 0.6), yy, { color: 'rgba(255,220,120,' + (0.25 + 0.3 * (1 - ph)) + ')', width: 2 }); }
        globe(ctx, gx, gy, R, rot, [-1, 0], 0, { lights: true, marker: true });
        A.text(ctx, '☀️ ZI', gx - R * 0.55, gy - R - 18, { size: A.fs(U, 0.05, 13), color: '#ffe08a' });
        A.text(ctx, '🌙 NOAPTE', gx + R * 0.55, gy - R - 18, { size: A.fs(U, 0.05, 13), color: '#a9c4ff' });
        A.arrow(ctx, gx - R * 0.5, gy + R + 16, gx + R * 0.5, gy + R + 16, { color: 'rgba(255,255,255,0.6)', width: 2.5, bend: -0.12 });
        A.text(ctx, 'se învârte așa', gx, gy + R + 34, { size: A.fs(U, 0.035, 11), color: 'rgba(255,255,255,0.75)' });
        /* ora în România */
        let lr = ((RO[0] + rot) % 360 + 540) % 360 - 180; const hour = ((12 + (lr + 90) / 15) % 24 + 24) % 24;
        const day = hour > 6 && hour < 18, alt = Math.sin((hour - 6) / 12 * Math.PI) * 60;
        const bw = wide ? Math.min(240, W * 0.26) : Math.min(200, W * 0.5), bh = bw * 0.62, bx = wide ? W - bw - 16 : W / 2 - bw / 2, by = wide ? gy - bh / 2 : gy + R + 64;
        const tw = clamp((hour < 12 ? hour - 5 : 19 - hour) / 2, 0, 1);
        homeScene(ctx, bx, by, bw, bh, { skyTop: [A.mix('#0b1433', '#3f8fe0', tw), A.mix('#1c2650', hour < 12 ? '#ffc58a' : '#ffb07a', tw * (1 - tw) * 3.5 > 1 ? 1 : tw)], ground: A.mix('#1d3a1d', '#5aa84a', tw), sunAlt: day ? alt : -20, sunX: clamp((hour - 6) / 12, 0, 1) * 0.8 + 0.1, stars: 1 - tw, night: tw < 0.5, tree: 'summer', moon: tw < 0.3, t: t });
        const hh = Math.floor(hour), mm = Math.floor((hour - hh) * 60 / 10) * 10;
        A.label(ctx, '📍 În România e ora ' + hh + ':' + String(mm).padStart(2, '0') + (day ? '  ☀️ zi' : '  🌙 noapte'), bx + bw / 2, by - 18, { size: A.labelSize(U) });
      }

      function drawYear(dt, t) {
        if (play) { month = (month + dt * 0.5) % 12; ms.set(month); }
        A.scene(ctx, api.W, api.H, 'space'); A.stars(ctx, api.W, api.H, t);
        const U = api.unit, W = api.freeW, wide = W > 700;
        const bwW = Math.min(250, W * 0.27), avail = W - bwW - 32 - padL() - 70;
        const rx = wide ? Math.min(avail / 2, U * 1.25) : W * 0.36, ry = rx * 0.34;
        const ox = wide ? padL() + 50 + rx : W / 2, oy = wide ? api.cy : api.cy - U * 0.28;
        ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.ellipse(ox, oy, rx, ry, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        /* decembrie dreapta, martie în spate, iunie stânga, septembrie în față */
        const ang = (m) => (m - 11.7) / 12 * TAU;
        const pos = (m) => [ox + Math.cos(ang(m)) * rx, oy - Math.sin(ang(m)) * ry];
        [[11.7, 'decembrie ❄️'], [2.7, 'martie 🌷'], [5.7, 'iunie ☀️'], [8.7, 'septembrie 🍂']].forEach(([m, s]) => { const p = pos(m); A.text(ctx, s, p[0] + (p[0] > ox + 2 ? 1 : p[0] < ox - 2 ? -1 : 0) * 18, p[1] + (p[1] > oy + 2 ? 34 : p[1] < oy - 2 ? -30 : 0), { size: A.fs(U, 0.034, 11), color: 'rgba(255,255,255,0.65)' }); });
        const p = pos(month), behind = p[1] < oy, er = Math.max(18, U * 0.2);
        const drawE = () => { const dx = ox - p[0], dy = oy - p[1], d = Math.hypot(dx, dy) || 1; globe(ctx, p[0], p[1], er, t * 40, [dx / d, dy / d], 23.4 * D2R, { axis: true }); };
        if (behind) drawE();
        sunDisk(ctx, ox, oy, U * 0.16, t);
        if (!behind) drawE();
        /* în România */
        const decl = -23.44 * Math.cos((month + 0.3) / 12 * TAU), noon = 90 - 46 + decl, dayLen = 12 + 3.6 * Math.sin((month - 2.7) / 12 * TAU);
        const se = month < 2 || month >= 11 ? 'winter' : month < 5 ? 'spring' : month < 8 ? 'summer' : 'autumn';
        const NAME = { winter: 'Iarnă', spring: 'Primăvară', summer: 'Vară', autumn: 'Toamnă' };
        const bw = wide ? Math.min(250, W * 0.27) : Math.min(260, W * 0.62), bh = bw * 0.68, bx = wide ? W - bw - 16 : W / 2 - bw / 2, by = wide ? api.cy - bh / 2 : oy + ry + U * 0.32;
        homeScene(ctx, bx, by, bw, bh, { skyTop: ['#3f8fe0', se === 'winter' ? '#dfe9f2' : '#cfe9ff'], ground: { winter: '#f2f6fa', spring: '#7cc56a', summer: '#5aa84a', autumn: '#b7a04a' }[se], sunAlt: noon, tree: { winter: 'bare', spring: 'spring', summer: 'summer', autumn: 'autumn' }[se], snow: se === 'winter', t: t });
        ctx.strokeStyle = 'rgba(255,230,140,0.7)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(bx + bw * 0.5, by + bh * 0.78); ctx.lineTo(bx + bw * 0.5, by + bh * 0.78 - noon / 90 * bh * 0.95); ctx.stroke(); ctx.setLineDash([]);
        A.label(ctx, '📍 La noi: ' + NAME[se], bx + bw / 2, by - 18, { size: A.labelSize(U) });
        A.text(ctx, 'Soarele la prânz: ' + Math.round(noon) + '° · ziua: ' + Math.round(dayLen) + ' ore', bx + bw / 2, by + bh + 16, { size: A.fs(U, 0.034, 11), color: '#ffe9a8' });
      }
      setMode('day');
      return { frame: function (dt, t) { if (mode === 'day') drawDay(dt, t); else drawYear(dt, t); } };
    }
  });
})();
