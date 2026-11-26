/* Modul: Digestia — ilustrație anatomică (stil atlas pentru copii) */
(function () {
  const A = window.Art, C = A.C, TAU = A.TAU;
  const clamp = A.clamp, lerp = A.lerp;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function polyAt(poly, u) {                       // poly: {pts, cum, len, closed}
    const d = clamp(u, 0, 1) * poly.len; let i = 1;
    while (i < poly.cum.length - 1 && poly.cum[i] < d) i++;
    const k = (d - poly.cum[i - 1]) / ((poly.cum[i] - poly.cum[i - 1]) || 1);
    return { x: lerp(poly.pts[i - 1][0], poly.pts[i][0], k), y: lerp(poly.pts[i - 1][1], poly.pts[i][1], k), i: i - 1 };
  }
  function mkPoly(pts, closed) {
    const P = pts.slice(); if (closed) P.push(pts[0]);
    const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    return { pts: P, cum: cum, len: cum[cum.length - 1] };
  }
  /* mărul desenat (nu emoji): corp roșu cu volum, codiță, frunză */
  function apple(ctx, x, y, r, bite) {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.62);
    ctx.bezierCurveTo(r * 0.35, -r * 1.05, r * 1.08, -r * 0.8, r * 1.0, -r * 0.05);
    ctx.bezierCurveTo(r * 0.95, r * 0.65, r * 0.45, r * 1.02, r * 0.12, r * 0.9);
    ctx.quadraticCurveTo(0, r * 0.84, -r * 0.12, r * 0.9);
    ctx.bezierCurveTo(-r * 0.45, r * 1.02, -r * 0.95, r * 0.65, -r * 1.0, -r * 0.05);
    ctx.bezierCurveTo(-r * 1.08, -r * 0.8, -r * 0.35, -r * 1.05, 0, -r * 0.62); ctx.closePath();
    const g = ctx.createRadialGradient(-r * 0.4, -r * 0.35, r * 0.05, 0, 0, r * 1.1);
    g.addColorStop(0, '#ff8f7a'); g.addColorStop(0.45, '#d92f2f'); g.addColorStop(1, '#7e1418');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#5e0e12'; ctx.lineWidth = Math.max(1, r * 0.06); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-r * 0.45, -r * 0.35, r * 0.18, r * 0.1, -0.7, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#5a3a1e'; ctx.lineWidth = Math.max(1.5, r * 0.1); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -r * 0.6); ctx.quadraticCurveTo(r * 0.05, -r * 0.95, r * 0.2, -r * 1.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.12, -r * 0.92); ctx.quadraticCurveTo(r * 0.55, -r * 1.35, r * 0.85, -r * 1.0); ctx.quadraticCurveTo(r * 0.45, -r * 0.8, r * 0.12, -r * 0.92); ctx.fillStyle = '#4e9a3a'; ctx.fill();
    ctx.restore();
  }

  /* ---------- fața copilului (coordonate în raze de cap: centrul capului = 0,0) ----------
     f = { gx, gy: privirea (-1..1), open: deschiderea ochilor (0..1), chew: 0..1, ym: înălțimea gurii } */
  const HAIR = '#5a3824', IRIS = '#6e4a2a', LIPS = '#c7766c';
  function headShape(ctx) {
    ctx.beginPath(); A.smoothPath(ctx, [[0, -1.0], [0.6, -0.88], [0.9, -0.44], [0.93, 0.04], [0.85, 0.44], [0.64, 0.79], [0.32, 0.98], [0, 1.03], [-0.32, 0.98], [-0.64, 0.79], [-0.85, 0.44], [-0.93, 0.04], [-0.9, -0.44], [-0.6, -0.88]], true);
  }
  function childFace(ctx, hx, hy, hr, f, lw) {
    const skin = C.skin, ink = A.ink(skin), L = lw / hr;
    ctx.save(); ctx.translate(hx, hy); ctx.scale(hr, hr); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    /* urechile (în spatele capului) */
    for (const sg of [-1, 1]) {
      ctx.save(); ctx.translate(sg * 0.9, 0.14);
      ctx.beginPath(); ctx.ellipse(0, 0, 0.15, 0.22, sg * 0.18, 0, TAU);
      const eg = ctx.createRadialGradient(-sg * 0.03, -0.05, 0.02, 0, 0, 0.24); eg.addColorStop(0, A.shade(skin, 0.05)); eg.addColorStop(1, A.shade(skin, -0.2));
      ctx.fillStyle = eg; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = L; ctx.stroke();
      ctx.strokeStyle = A.rgba('#8a4a3a', 0.45); ctx.lineWidth = L * 0.9; ctx.beginPath(); ctx.ellipse(sg * 0.01, 0.0, 0.075, 0.13, 0, -Math.PI / 2, Math.PI / 2, sg < 0); ctx.stroke();
      ctx.restore();
    }
    /* capul, cu lumină din stânga-sus */
    headShape(ctx);
    const hg = ctx.createRadialGradient(-0.32, -0.38, 0.08, -0.05, 0.05, 1.25);
    hg.addColorStop(0, A.shade(skin, 0.14)); hg.addColorStop(0.55, skin); hg.addColorStop(1, A.shade(skin, -0.2));
    ctx.fillStyle = hg; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = L; ctx.stroke();
    ctx.save(); headShape(ctx); ctx.clip();
    /* obrajii rumeni și umbra de sub bărbie */
    for (const sg of [-1, 1]) { const cg = ctx.createRadialGradient(sg * 0.5, 0.4, 0.02, sg * 0.5, 0.4, 0.3); cg.addColorStop(0, 'rgba(232,118,108,0.2)'); cg.addColorStop(1, 'rgba(232,118,108,0)'); ctx.fillStyle = cg; ctx.fillRect(sg * 0.5 - 0.32, 0.08, 0.64, 0.64); }
    const jg = ctx.createLinearGradient(0, 0.7, 0, 1.05); jg.addColorStop(0, 'rgba(120,60,45,0)'); jg.addColorStop(1, 'rgba(120,60,45,0.18)'); ctx.fillStyle = jg; ctx.fillRect(-1, 0.7, 2, 0.4);
    ctx.restore();
    /* nasul: mic, cu volum (umbră pe dreapta, vârf luminat, nări) */
    ctx.strokeStyle = A.rgba('#9a5a48', 0.35); ctx.lineWidth = 0.035;
    ctx.beginPath(); ctx.moveTo(0.07, 0.04); ctx.quadraticCurveTo(0.1, 0.16, 0.11, 0.25); ctx.stroke();
    const ng = ctx.createRadialGradient(-0.02, 0.23, 0, -0.02, 0.23, 0.08); ng.addColorStop(0, 'rgba(255,236,224,0.3)'); ng.addColorStop(1, 'rgba(255,236,224,0)'); ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(-0.02, 0.23, 0.08, 0, TAU); ctx.fill();
    ctx.strokeStyle = A.rgba('#8a4a3a', 0.45); ctx.lineWidth = 0.025;
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(sg * 0.075, 0.28, 0.04, sg > 0 ? -1.2 : Math.PI - 1.4, sg > 0 ? 1.4 : Math.PI + 1.2); ctx.stroke(); ctx.fillStyle = 'rgba(100,44,40,0.7)'; ctx.beginPath(); ctx.ellipse(sg * 0.05, 0.31, 0.026, 0.014, sg * 0.35, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(140,70,55,0.12)'; ctx.beginPath(); ctx.ellipse(0.01, 0.37, 0.09, 0.025, 0, 0, TAU); ctx.fill();
    /* ochii: albul ochiului, iris cu pupilă, lumină, pleoape și gene */
    const open = clamp(f.open, 0, 1) * (1 - 0.22 * Math.max(0, f.gy));
    for (const sg of [-1, 1]) {
      const ex = sg * 0.36, ey = 0.02, ix = ex - sg * 0.15, ox = ex + sg * 0.18;
      const up = lerp(0.05, -0.16, open), lo = 0.1;
      const eyePath = () => { ctx.beginPath(); ctx.moveTo(ix, ey + 0.02); ctx.bezierCurveTo(ix + sg * 0.06, ey + up, ox - sg * 0.1, ey + up, ox, ey - 0.005); ctx.bezierCurveTo(ox - sg * 0.08, ey + lo, ix + sg * 0.07, ey + lo, ix, ey + 0.02); ctx.closePath(); };
      /* pliul pleoapei de sus */
      ctx.strokeStyle = A.rgba('#9a5a48', 0.3); ctx.lineWidth = 0.022; ctx.beginPath(); ctx.moveTo(ix + sg * 0.02, ey - 0.06); ctx.quadraticCurveTo(ex, ey - 0.22 + (1 - open) * 0.05, ox - sg * 0.01, ey - 0.08); ctx.stroke();
      if (open > 0.08) {
        ctx.save(); eyePath(); ctx.fillStyle = '#f7f2ee'; ctx.fill(); ctx.clip();
        const irx = ex + f.gx * 0.065, iry = ey + 0.012 + f.gy * 0.035, ir = 0.085;
        const ig = ctx.createRadialGradient(irx, iry, 0.01, irx, iry, ir); ig.addColorStop(0, A.shade(IRIS, 0.25)); ig.addColorStop(0.55, IRIS); ig.addColorStop(0.9, A.shade(IRIS, -0.4)); ig.addColorStop(1, '#2a1a10');
        ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(irx, iry, ir, 0, TAU); ctx.fill();
        ctx.strokeStyle = A.rgba(A.shade(IRIS, 0.35), 0.5); ctx.lineWidth = 0.008; ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.moveTo(irx + Math.cos(a) * 0.045, iry + Math.sin(a) * 0.045); ctx.lineTo(irx + Math.cos(a) * 0.075, iry + Math.sin(a) * 0.075); } ctx.stroke();
        ctx.fillStyle = '#140b06'; ctx.beginPath(); ctx.arc(irx, iry, 0.037, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.arc(irx - 0.03, iry - 0.032, 0.019, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(irx + 0.028, iry + 0.026, 0.009, 0, TAU); ctx.fill();
        /* umbra pleoapei peste albul ochiului */
        const sg2 = ctx.createLinearGradient(0, ey + up * 0.6, 0, ey + 0.03); sg2.addColorStop(0, 'rgba(90,45,35,0.4)'); sg2.addColorStop(1, 'rgba(90,45,35,0)'); ctx.fillStyle = sg2; ctx.fillRect(ex - 0.25, ey - 0.2, 0.5, 0.25);
        ctx.restore();
        /* pleoapa de jos, fină */
        ctx.strokeStyle = A.rgba('#9a5a48', 0.4); ctx.lineWidth = 0.014; ctx.beginPath(); ctx.moveTo(ix + sg * 0.02, ey + 0.04); ctx.bezierCurveTo(ix + sg * 0.08, ey + lo + 0.01, ox - sg * 0.08, ey + lo + 0.01, ox - sg * 0.01, ey + 0.01); ctx.stroke();
      }
      /* linia pleoapei de sus (mai groasă spre colțul exterior) și genele */
      ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 0.03; ctx.beginPath(); ctx.moveTo(ix, ey + 0.02); ctx.bezierCurveTo(ix + sg * 0.06, ey + up, ox - sg * 0.1, ey + up, ox, ey - 0.005); ctx.stroke();
      ctx.lineWidth = 0.011; ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const k = 0.62 + i * 0.15, bx = lerp(ix, ox, k), by = ey + up * 0.75 * (1 - Math.pow(2 * k - 1, 2)) + (open < 0.3 ? 0.03 : 0) - 0.004;
        ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + sg * 0.02, by - 0.018 * open - 0.006, bx + sg * 0.035, by - 0.022 * open);
      }
      ctx.stroke();
      /* sprânceana: subțire, se ridică puțin când copilul privește în sus */
      const bl = -0.27 - 0.03 * Math.max(0, -f.gy);
      ctx.beginPath(); ctx.moveTo(ex - sg * 0.17, ey + bl + 0.04);
      ctx.quadraticCurveTo(ex + sg * 0.02, ey + bl - 0.07, ex + sg * 0.21, ey + bl + 0.02);
      ctx.quadraticCurveTo(ex + sg * 0.02, ey + bl - 0.035, ex - sg * 0.17, ey + bl + 0.075); ctx.closePath();
      ctx.fillStyle = A.rgba('#6a4430', 0.85); ctx.fill();
    }
    /* gura: buze cu arcul lui Cupidon; se deschide când mestecă */
    const ym = f.ym, mw = 0.17, op = 0.07 * clamp(f.chew, 0, 1);
    ctx.strokeStyle = A.rgba('#9a5a48', 0.18); ctx.lineWidth = 0.02; ctx.beginPath(); ctx.moveTo(-0.025, 0.37); ctx.lineTo(-0.03, ym - 0.06); ctx.moveTo(0.03, 0.37); ctx.lineTo(0.035, ym - 0.06); ctx.stroke();
    if (op > 0.004) {
      ctx.beginPath(); ctx.moveTo(-mw, ym); ctx.quadraticCurveTo(0, ym - 0.02 - op * 0.2, mw, ym); ctx.quadraticCurveTo(0, ym + op * 1.4 + 0.02, -mw, ym); ctx.closePath();
      ctx.fillStyle = '#5a1e22'; ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = '#f4efe6'; ctx.fillRect(-mw * 0.6, ym - 0.04, mw * 1.2, 0.035 + op * 0.15); ctx.restore();
    }
    const upper = () => { ctx.beginPath(); ctx.moveTo(-mw, ym); ctx.bezierCurveTo(-mw * 0.6, ym - 0.045, -0.07, ym - 0.07, -0.03, ym - 0.055); ctx.quadraticCurveTo(0, ym - 0.042, 0.03, ym - 0.055); ctx.bezierCurveTo(0.07, ym - 0.07, mw * 0.6, ym - 0.045, mw, ym); ctx.quadraticCurveTo(0, ym + 0.012 - op * 0.3, -mw, ym); ctx.closePath(); };
    upper(); const ug = ctx.createLinearGradient(0, ym - 0.07, 0, ym); ug.addColorStop(0, A.shade(LIPS, -0.05)); ug.addColorStop(1, A.shade(LIPS, -0.2)); ctx.fillStyle = ug; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-mw * 0.92, ym + 0.004 + op * 0.4); ctx.quadraticCurveTo(0, ym + 0.016 + op * 1.4, mw * 0.92, ym + 0.004 + op * 0.4); ctx.bezierCurveTo(mw * 0.6, ym + 0.1 + op, -mw * 0.6, ym + 0.1 + op, -mw * 0.92, ym + 0.004 + op * 0.4); ctx.closePath();
    const lg = ctx.createLinearGradient(0, ym, 0, ym + 0.1 + op); lg.addColorStop(0, A.shade(LIPS, 0.05)); lg.addColorStop(1, A.shade(LIPS, -0.12)); ctx.fillStyle = lg; ctx.fill();
    ctx.fillStyle = 'rgba(255,235,228,0.4)'; ctx.beginPath(); ctx.ellipse(-0.035, ym + 0.045 + op * 0.9, 0.05, 0.015, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = A.ink(LIPS); ctx.lineWidth = 0.018; ctx.beginPath(); ctx.moveTo(-mw - 0.01, ym - 0.004); ctx.quadraticCurveTo(0, ym + 0.016 + (op > 0.004 ? op * 0.2 : 0), mw + 0.01, ym - 0.004); ctx.stroke();
    ctx.fillStyle = 'rgba(140,70,60,0.14)'; ctx.beginPath(); ctx.ellipse(0, ym + 0.17 + op, 0.1, 0.03, 0, 0, TAU); ctx.fill();
    /* părul: cap de păr cu breton în șuvițe, luciu blând și fire */
    const hairPath = () => {
      ctx.beginPath(); ctx.moveTo(-0.9, 0.06);
      ctx.bezierCurveTo(-1.04, -0.42, -0.86, -0.98, -0.32, -1.1); ctx.bezierCurveTo(0.12, -1.18, 0.78, -1.06, 0.97, -0.5); ctx.bezierCurveTo(1.03, -0.3, 0.98, -0.06, 0.92, 0.06);
      const tips = [[0.86, -0.06], [0.83, -0.3], [0.64, -0.44], [0.47, -0.4], [0.3, -0.49], [0.12, -0.44], [-0.06, -0.52], [-0.26, -0.47], [-0.47, -0.55], [-0.68, -0.46], [-0.84, -0.26], [-0.9, 0.06]];
      for (let i = 0; i < tips.length; i++) { const p = tips[i], q = i ? tips[i - 1] : [0.92, 0.06]; ctx.quadraticCurveTo((p[0] + q[0]) / 2 + 0.03, Math.min(p[1], q[1]) - 0.06, p[0], p[1]); }
      ctx.closePath();
    };
    hairPath(); const hgr = ctx.createLinearGradient(-0.6, -1.1, 0.7, -0.1); hgr.addColorStop(0, A.shade(HAIR, 0.22)); hgr.addColorStop(0.5, HAIR); hgr.addColorStop(1, A.shade(HAIR, -0.35));
    ctx.fillStyle = hgr; ctx.fill(); ctx.strokeStyle = A.rgba(A.shade(HAIR, -0.4), 0.5); ctx.lineWidth = L * 0.6; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-0.9, 0.06); ctx.bezierCurveTo(-1.04, -0.42, -0.86, -0.98, -0.32, -1.1); ctx.bezierCurveTo(0.12, -1.18, 0.78, -1.06, 0.97, -0.5); ctx.bezierCurveTo(1.03, -0.3, 0.98, -0.06, 0.92, 0.06); ctx.strokeStyle = A.ink(HAIR); ctx.lineWidth = L; ctx.stroke();
    ctx.save(); hairPath(); ctx.clip();
    ctx.strokeStyle = 'rgba(255,226,196,0.16)'; ctx.lineWidth = 0.09; ctx.beginPath(); ctx.arc(0.05, -0.2, 0.78, -2.6, -1.75); ctx.stroke();
    const tips2 = [[0.84, -0.3], [0.62, -0.46], [0.42, -0.4], [0.24, -0.5], [0.05, -0.42], [-0.15, -0.53], [-0.36, -0.45], [-0.56, -0.55], [-0.74, -0.42], [-0.86, -0.2]];
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? 'rgba(160,110,75,0.45)' : A.rgba(A.shade(HAIR, -0.5), 0.55); ctx.lineWidth = pass ? 0.014 : 0.02; ctx.beginPath();
      for (let i = 0; i < tips2.length; i++) { const p = tips2[i], o = pass ? 0.05 : -0.02; ctx.moveTo(0.18 + o, -1.06); ctx.quadraticCurveTo(p[0] * 0.75 + o, -0.95 + p[1] * 0.1, p[0] + o * 0.5, p[1] - 0.04); }
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }

  defineModule({
    id: 'digestion', title: 'Digestia', sub: 'Drumul unei mese prin corp',
    start: function (api) {
      const ctx = api.ctx;
      let u = 0, playing = false;
      const PTS = [[0, -0.88], [0, -0.5], [0.1, -0.4], [0.18, -0.3], [0.08, -0.24], [-0.18, -0.15], [0.18, -0.12], [0.18, -0.04], [-0.18, -0.01], [-0.18, 0.07], [0.18, 0.1], [0.18, 0.18], [-0.18, 0.21], [-0.18, 0.28], [-0.3, 0.3], [-0.3, -0.2], [0.3, -0.2], [0.3, 0.3], [0.0, 0.5], [0.0, 0.64]];
      const poly = mkPoly(PTS, false);
      const ST = [
        { n: 'Gura', a: 0, b: 0.05, h: 'câteva secunde', t: 'Dinții taie și macină mâncarea, iar saliva începe să descompună amidonul. Mestecă bine!' },
        { n: 'Esofagul', a: 0.05, b: 0.13, h: '~10 secunde', t: 'Un tub muscular de ~25 cm. Mușchii lui împing mâncarea în jos prin mișcări de val (peristaltism) — ai putea mânca și cu capul în jos!' },
        { n: 'Stomacul', a: 0.13, b: 0.27, h: '2–4 ore', t: 'Un sac muscular care amestecă mâncarea cu acid puternic. Acidul omoară microbii; un strat de mucus îl apără de propriul acid.' },
        { n: 'Intestinul subțire', a: 0.27, b: 0.6, h: '3–5 ore', t: 'Are ~6 metri! Aici trec nutrienții din mâncare în sânge, prin milioane de „degețele” mici (vilozități).' },
        { n: 'Intestinul gros', a: 0.6, b: 0.97, h: '10–60 de ore', t: 'Are ~1,5 metri. Absoarbe apa și sărurile, iar bacteriile bune de aici ne ajută. Ce rămâne iese din corp.' },
        { n: 'Afară', a: 0.97, b: 1.0, h: '—', t: 'Drumul complet durează 1–3 zile!' }
      ];
      const stOf = (x) => ST.findIndex((s) => x >= s.a && x < s.b) < 0 ? ST.length - 1 : ST.findIndex((s) => x >= s.a && x < s.b);
      let lastSt = -1, lookAt = null;
      const gaze = { x: 0, y: 0.1, tx: 0, ty: 0.1, next: 1 }, blink = { wait: 1.5, ph: -1 };
      const FR = []; for (let i = 0; i < 18; i++) FR.push({ a: i * 2.399, r: 0.25 + 0.75 * ((i * 0.618) % 1), k: (i * 0.37) % 1, sp: 0.5 + ((i * 0.29) % 1) });
      const r1 = api.row('');
      const bE = api.button(r1, '🍎 Mănâncă', () => { u = 0; playing = true; bE.innerHTML = '🍎 Mănâncă din nou'; lastSt = -1; });
      const sl = api.slider(r1, { label: 'Timpul după masă', min: 0, max: 1, step: 0.001, value: 0, fmt: () => timeText(), onInput: (v) => { u = v; playing = false; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      function timeText() {
        const i = stOf(u), s = ST[i]; if (i === 0) return fmt(u / 0.05 * 20, 0) + ' secunde'; if (i === 1) return fmt(20 + (u - 0.05) / 0.08 * 10, 0) + ' secunde';
        const hrs = i === 2 ? lerp(0, 3, (u - 0.13) / 0.14) : i === 3 ? 3 + lerp(0, 4, (u - 0.27) / 0.33) : 7 + lerp(0, 24, (u - 0.6) / 0.37);
        return hrs < 1 ? fmt(hrs * 60, 0) + ' minute' : fmt(hrs, 1) + ' ore';
      }
      api.say('Apasă <b>Mănâncă</b> și urmărește un măr pe tot drumul prin corp, sau trage de glisor. Atinge un organ ca să afli ce face.', 12000);
      api.pointer({ down: (x, y) => { lookAt = { x: x, y: y, until: lastT + 2.5 }; const U = api.unit, mx = (x - api.cx) / U, my = (y - api.cy) / U; let best = 0, bd = 1e9; for (let i = 0; i < poly.pts.length; i++) for (let k = 0; k < 8; k++) { const q = polyAt(poly, (poly.cum[i] + (poly.cum[Math.min(i + 1, poly.cum.length - 1)] - poly.cum[i]) * k / 8) / poly.len); const d = Math.hypot(q.x - mx, q.y - my); if (d < bd) { bd = d; best = (poly.cum[i]) / poly.len; } } if (bd < 0.16) { const s = ST[stOf(best)]; api.say('<b>' + s.n + '</b> · ' + s.h + '. ' + s.t, 12000); } } });

      /* drumuri netede pentru desen (aceleași puncte ca traseul mâncării) */
      const SMALL = A.pathSampler(PTS.slice(4, 15), false, 14);
      const LARGE = A.pathSampler(PTS.slice(14), false, 14);
      /* tub muscular cu grosime variabilă (unde de peristaltism care se propagă) */
      function gut(X, Y, U, smp, w, col, t, o) {
        const n = Math.max(40, Math.round(smp.len * 90)), P = [];
        for (let i = 0; i <= n; i++) {
          const k = i / n, p = smp.at(k);
          const wave = Math.sin(k * smp.len * (o.freq || 40) - t * (o.speed || 3));
          const haus = o.haustra ? 0.14 * Math.abs(Math.sin(k * smp.len * 55)) : 0;
          P.push([X(p.x), Y(p.y), w * U * (1 + (o.amp || 0.12) * wave + haus)]);
        }
        ctx.save(); ctx.lineCap = 'round';
        for (const pass of [0, 1, 2]) {
          for (let i = 0; i < n; i++) {
            const a = P[i], b = P[i + 1], ww = (a[2] + b[2]) / 2;
            ctx.beginPath();
            if (pass === 2) { ctx.moveTo(a[0] - ww * 0.18, a[1] - ww * 0.18); ctx.lineTo(b[0] - ww * 0.18, b[1] - ww * 0.18); ctx.strokeStyle = 'rgba(255,240,230,0.28)'; ctx.lineWidth = ww * 0.22; }
            else { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.strokeStyle = pass === 0 ? A.ink(col) : col; ctx.lineWidth = pass === 0 ? ww + A.lineW(U) * 2 : ww; }
            ctx.stroke();
          }
          /* inelele haustrelor (intestinul gros) */
          if (pass === 1 && o.haustra) { ctx.strokeStyle = A.rgba(A.shade(col, -0.35), 0.6); ctx.lineWidth = 1.5; for (let i = 3; i < n; i += 4) { const a = P[i], b = P[Math.min(n, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, r = a[2] * 0.48; ctx.beginPath(); ctx.moveTo(a[0] + Math.cos(ang) * r, a[1] + Math.sin(ang) * r); ctx.lineTo(a[0] - Math.cos(ang) * r, a[1] - Math.sin(ang) * r); ctx.stroke(); } }
        }
        ctx.restore();
      }
      /* silueta unui copil (proporții de copil: cap mare, umeri înguști) */
      function child(X, Y, U, face) {
        ctx.save();
        const skin = C.skin, skinDk = A.shade(skin, -0.25), ink = A.ink(skin), LW = A.lineW(U);
        /* brațe */
        for (const sg of [-1, 1]) {
          ctx.beginPath(); A.smoothPath(ctx, [[X(sg * 0.34), Y(-0.62)], [X(sg * 0.45), Y(-0.3)], [X(sg * 0.49), Y(0.05)], [X(sg * 0.5), Y(0.3)]], false);
          ctx.lineCap = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = U * 0.11 + LW * 2; ctx.stroke(); ctx.strokeStyle = skin; ctx.lineWidth = U * 0.11; ctx.stroke();
          /* mâna */
          ctx.beginPath(); ctx.ellipse(X(sg * 0.505), Y(0.4), U * 0.055, U * 0.085, sg * -0.08, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = LW; ctx.stroke(); ctx.strokeStyle = skinDk;
          ctx.beginPath(); ctx.moveTo(X(sg * 0.47), Y(0.38)); ctx.quadraticCurveTo(X(sg * 0.455), Y(0.43), X(sg * 0.47), Y(0.46)); ctx.stroke();
        }
        /* trunchi */
        const T = [[0.08, -0.78], [0.2, -0.72], [0.36, -0.66], [0.4, -0.52], [0.36, -0.2], [0.34, 0.2], [0.38, 0.55], [0.34, 0.78], [0.2, 1.02], [-0.2, 1.02], [-0.34, 0.78], [-0.38, 0.55], [-0.34, 0.2], [-0.36, -0.2], [-0.4, -0.52], [-0.36, -0.66], [-0.2, -0.72], [-0.08, -0.78]];
        ctx.beginPath(); A.smoothPath(ctx, T.map((p) => [X(p[0]), Y(p[1])]), true, 0.4);
        A.volumeFill(ctx, X(-0.4), 0, X(0.4), 0, skin, { hi: 0.12, lo: 0.28 }); ctx.strokeStyle = ink; ctx.lineWidth = LW; ctx.stroke();
        /* pantaloni scurți neutri (figură potrivită pentru copii) */
        ctx.save(); ctx.beginPath(); A.smoothPath(ctx, T.map((p) => [X(p[0]), Y(p[1])]), true, 0.4); ctx.clip();
        ctx.beginPath(); ctx.moveTo(X(-0.5), Y(0.8)); ctx.quadraticCurveTo(X(0), Y(0.77), X(0.5), Y(0.8)); ctx.lineTo(X(0.5), Y(1.1)); ctx.lineTo(X(-0.5), Y(1.1)); ctx.closePath();
        A.volumeFill(ctx, X(-0.4), 0, X(0.4), 0, '#3d6fa8', { hi: 0.12, lo: 0.3 });
        ctx.strokeStyle = A.ink('#3d6fa8'); ctx.lineWidth = LW * 1.5; ctx.beginPath(); ctx.moveTo(X(-0.5), Y(0.815)); ctx.quadraticCurveTo(X(0), Y(0.785), X(0.5), Y(0.815)); ctx.stroke();
        ctx.restore();
        /* cavitatea abdominală, deschisă ca într-un atlas */
        const CV = [[0, -0.66], [0.27, -0.6], [0.33, -0.3], [0.33, 0.2], [0.3, 0.55], [0.15, 0.72], [-0.15, 0.72], [-0.3, 0.55], [-0.33, 0.2], [-0.33, -0.3], [-0.27, -0.6]];
        ctx.beginPath(); A.smoothPath(ctx, CV.map((p) => [X(p[0]), Y(p[1])]), true);
        const cg = ctx.createRadialGradient(X(0), Y(0), U * 0.05, X(0), Y(0), U * 0.75); cg.addColorStop(0, '#6e2f3a'); cg.addColorStop(1, '#3e1822');
        ctx.fillStyle = cg; ctx.fill(); ctx.strokeStyle = A.ink('#b06a5a'); ctx.lineWidth = LW; ctx.stroke();
        /* gâtul (cu umbra bărbiei) și capul */
        const hx = X(0), hy = Y(-0.97), hr = U * 0.175;
        ctx.beginPath(); ctx.moveTo(X(-0.07), Y(-0.86)); ctx.quadraticCurveTo(X(-0.062), Y(-0.79), X(-0.085), Y(-0.735)); ctx.lineTo(X(0.085), Y(-0.735)); ctx.quadraticCurveTo(X(0.062), Y(-0.79), X(0.07), Y(-0.86)); ctx.closePath();
        A.volumeFill(ctx, X(-0.07), 0, X(0.07), 0, skin, { hi: 0.1, lo: 0.3 });
        ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(120,60,45,0.28)'; ctx.beginPath(); ctx.ellipse(hx, hy + hr * 1.0, hr * 0.5, hr * 0.16, 0, 0, TAU); ctx.fill(); ctx.restore();
        ctx.strokeStyle = ink; ctx.lineWidth = LW; ctx.beginPath(); for (const sg of [-1, 1]) { ctx.moveTo(X(sg * 0.07), Y(-0.86)); ctx.quadraticCurveTo(X(sg * 0.062), Y(-0.79), X(sg * 0.085), Y(-0.735)); } ctx.stroke();
        childFace(ctx, hx, hy, hr, face, LW);
        ctx.restore();
        return { hx: hx, hy: hy, hr: hr };
      }

      let lastT = 0;
      function frame(dt, t) {
        lastT = t;
        if (playing) { u = Math.min(1, u + dt * 0.045); sl.set(u); if (u >= 1) playing = false; }
        const U = api.unit, cx = api.cx, cy = api.cy, X = (x) => cx + x * U, Y = (y) => cy + y * U;
        A.scene(ctx, api.W, api.H, 'body');
        const p = polyAt(poly, u), si = stOf(u);
        /* gura: se mișcă atunci când mestecă */
        const chew = si === 0 && u > 0.002 ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
        /* fața: clipit din când în când și privire care se mută lin (spre măr când mănâncă) */
        const hx = X(0), hy = Y(-0.97), hr = U * 0.175;
        let tx = null, ty = null;
        if (si === 0 && (playing || u > 0)) { tx = X(p.x); ty = Y(p.y) + U * 0.07 * (1 - clamp(u / 0.03, 0, 1)); }
        else if (playing) { tx = X(p.x); ty = Y(p.y); }
        else if (lookAt && t < lookAt.until) { tx = lookAt.x; ty = lookAt.y; }
        if (tx !== null) { const dx = tx - hx, dy = ty - hy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / (hr * 2.2)); gaze.tx = dx / d * k; gaze.ty = clamp(dy / d * k, -1, 1); gaze.next = 0.8 + Math.random() * 1.5; }
        else { gaze.next -= dt; if (gaze.next <= 0) { const r = Math.random(); gaze.tx = r < 0.45 ? 0 : (Math.random() * 2 - 1) * 0.85; gaze.ty = r < 0.45 ? 0.1 : (Math.random() * 2 - 1) * 0.55; gaze.next = 1.2 + Math.random() * 2.6; } }
        gaze.x = A.damp(gaze.x, gaze.tx, 9, dt); gaze.y = A.damp(gaze.y, gaze.ty, 9, dt);
        blink.wait -= dt;
        if (blink.wait <= 0 && blink.ph < 0) { blink.ph = 0; blink.wait = (Math.random() < 0.18 ? 0.25 : 2.2 + Math.random() * 3.5); }
        let open = 1; if (blink.ph >= 0) { blink.ph += dt / 0.17; open = blink.ph >= 1 ? 1 : 1 - Math.sin(Math.PI * blink.ph); if (blink.ph >= 1) blink.ph = -1; }
        const head = child(X, Y, U, { gx: gaze.x, gy: gaze.y, open: open, chew: chew, ym: (Y(-0.88) - hy) / hr });

        /* ficatul (în spatele stomacului) și vezica biliară */
        ctx.save();
        ctx.beginPath(); A.smoothPath(ctx, [[X(-0.31), Y(-0.52)], [X(-0.05), Y(-0.6)], [X(0.14), Y(-0.55)], [X(0.04), Y(-0.44)], [X(-0.14), Y(-0.33)], [X(-0.3), Y(-0.3)]], true);
        A.volumeFill(ctx, X(-0.3), Y(-0.6), X(0.1), Y(-0.3), '#8e3b34', { hi: 0.2, lo: 0.35 }); ctx.strokeStyle = A.ink('#8e3b34'); ctx.lineWidth = A.lineW(U); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(X(-0.1), Y(-0.33), U * 0.035, U * 0.022, 0.4, 0, TAU); ctx.fillStyle = '#5f8a3a'; ctx.fill();
        ctx.restore();

        /* intestinul gros (cadru) și intestinul subțire (ghem), cu peristaltism */
        gut(X, Y, U, LARGE, 0.085, '#c99a7a', t, { haustra: true, amp: 0.05, freq: 18, speed: 1.2 });
        gut(X, Y, U, SMALL, 0.05, '#e8a8a4', t, { amp: 0.14, freq: 45, speed: 3 });
        /* esofagul */
        const esoK = si === 1 ? 1 : 0;
        A.tube(ctx, [[X(0), Y(-0.79)], [X(0), Y(-0.68)], [X(0.0), Y(-0.52)], [X(0.07), Y(-0.43)]], U * (0.045 + 0.012 * esoK * Math.max(0, Math.sin(t * 6))), '#d98a8a', { gloss: 0.25 });
        /* stomacul: sac muscular în formă de J, cu pliuri (rugae) */
        const scx = X(0.12), scy = Y(-0.37);
        const churn = si === 2 ? Math.sin(t * 2.4) * 0.04 : 0;
        ctx.save(); ctx.translate(scx, scy); ctx.rotate(0.6); ctx.scale(1 + churn, 1 - churn);
        const sw = U * 0.2, sh = U * 0.13;
        const stomachPath = () => { ctx.beginPath(); ctx.moveTo(-sw * 0.55, -sh * 0.9); ctx.bezierCurveTo(-sw * 0.1, -sh * 1.3, sw * 0.9, -sh * 1.2, sw * 1.02, -sh * 0.1); ctx.bezierCurveTo(sw * 1.05, sh * 0.8, sw * 0.4, sh * 1.15, -sw * 0.25, sh * 0.95); ctx.bezierCurveTo(-sw * 0.8, sh * 0.8, -sw * 1.1, sh * 0.35, -sw * 1.0, -sh * 0.15); ctx.bezierCurveTo(-sw * 0.95, -sh * 0.5, -sw * 0.75, -sh * 0.55, -sw * 0.55, -sh * 0.9); ctx.closePath(); };
        stomachPath(); A.volumeFill(ctx, -sw, -sh, sw, sh, '#e3998c', { hi: 0.25, lo: 0.35 }); ctx.strokeStyle = A.ink('#e3998c'); ctx.lineWidth = A.lineW(U) / (1 + churn); ctx.stroke();
        ctx.save(); stomachPath(); ctx.clip(); ctx.strokeStyle = 'rgba(150,60,60,0.16)'; ctx.lineWidth = 1.2;
        for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-sw, i * sh * 0.25); ctx.bezierCurveTo(-sw * 0.3, i * sh * 0.25 - sh * 0.15, sw * 0.3, i * sh * 0.25 + sh * 0.15, sw, i * sh * 0.25); ctx.stroke(); }
        ctx.restore(); ctx.restore();

        /* mâncarea */
        const foodCol = si === 0 ? '#e83a3a' : si === 1 ? '#d9563a' : si === 2 ? '#d8b88a' : si === 3 ? '#e8d4a8' : '#9a6a3a';
        if (si === 3) for (let i = 0; i < 6; i++) { const q = polyAt(poly, clamp(u - i * 0.012, 0, 1)); A.sphere(ctx, X(q.x), Y(q.y), U * 0.025 * (1 - i * 0.1), foodCol, { rim: false, gloss: false }); }
        if (si === 0) apple(ctx, X(p.x), Y(p.y) + U * 0.07 * (1 - clamp(u / 0.03, 0, 1)), U * 0.05 * (1 - 0.35 * clamp(u / 0.05, 0, 1)));
        else if (si === 1) { A.sphere(ctx, X(p.x), Y(p.y), U * 0.038, '#d26a4a', { rim: false }); }
        else if (si !== 2) { A.sphere(ctx, X(p.x), Y(p.y), U * 0.035, foodCol, { rim: false }); }
        else {
          /* în stomac mărul se sparge în bucăți, se amestecă cu acid și devine pastă */
          const k = clamp((u - ST[2].a) / (ST[2].b - ST[2].a), 0, 1), ent = polyAt(poly, ST[2].a + 0.008);
          const cs = Math.cos(0.6), sn = Math.sin(0.6);
          ctx.save(); ctx.fillStyle = 'rgba(190,220,80,' + 0.28 * k + ')'; ctx.beginPath(); ctx.ellipse(scx, scy, U * 0.19, U * 0.12, 0.6, 0, TAU); ctx.fill(); ctx.restore();
          if (k < 0.12) { A.sphere(ctx, lerp(X(ent.x), scx, k / 0.12 * 0.5), lerp(Y(ent.y), scy, k / 0.12 * 0.5), U * 0.045, '#d24a3a', { rim: false }); }
          else {
            const m = clamp((k - 0.12) / 0.5, 0, 1);                          // 0 → bucăți mari, 1 → împrăștiate și mici
            for (let i = 0; i < FR.length; i++) {
              const f = FR[i], px0 = lerp(X(ent.x), scx, 0.5), py0 = lerp(Y(ent.y), scy, 0.5);
              const lx = Math.cos(f.a + t * 0.4 * f.sp) * f.r * U * 0.17, ly = Math.sin(f.a + t * 0.4 * f.sp) * f.r * U * 0.09;
              const tx = scx + lx * cs - ly * sn, ty = scy + lx * sn + ly * cs, e = 1 - Math.pow(1 - m, 2);
              const sz = U * (0.03 + 0.02 * f.k) * (1 - 0.62 * clamp((k - 0.2) / 0.8, 0, 1));
              const mush = clamp((k - 0.25) / 0.6, 0, 1);
              const col = 'rgb(' + Math.round(lerp(f.k > 0.5 ? 222 : 245, 214, mush)) + ',' + Math.round(lerp(f.k > 0.5 ? 60 : 226, 184, mush)) + ',' + Math.round(lerp(f.k > 0.5 ? 55 : 190, 138, mush)) + ')';
              const fx = lerp(px0, tx, e), fy = lerp(py0, ty, e);
              ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(fx, fy, sz, sz * 0.8, f.a, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(90,40,30,0.35)'; ctx.lineWidth = 1; ctx.stroke();
            }
            /* bule de acid (explică amestecul cu acidul gastric) */
            for (let i = 0; i < 7; i++) { const ph = ((t * 0.5 + i / 7) % 1), bx = scx + Math.sin(i * 5.1) * U * 0.12, by = scy + U * 0.06 - ph * U * 0.14; ctx.strokeStyle = 'rgba(200,235,100,' + 0.7 * (1 - ph) * clamp(k * 2, 0, 1) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, 2 + (i % 3), 0, TAU); ctx.stroke(); }
            if (k > 0.2) A.label(ctx, 'acid + mișcări → pastă (chim)', X(0.36), Y(-0.37), { size: A.labelSize(U), align: 'left', color: '#e2f5a0', bg: A.LABEL_BG });
          }
        }
        /* nutrienți care trec în sânge (intestinul subțire) */
        if (si === 3) for (let i = 0; i < 10; i++) { const k = ((t * 0.8 + i / 10) % 1); ctx.fillStyle = 'rgba(220,60,70,' + (1 - k) + ')'; ctx.beginPath(); ctx.arc(X(p.x) + 0.12 * U * k * (i % 2 ? 1 : -1), Y(p.y) - 0.02 * U * k, Math.max(2.5, U * 0.01), 0, TAU); ctx.fill(); }
        const fsm = A.labelSize(U), LW = A.lineW(U);
        if (si === 3) A.label(ctx, 'nutrienți → sânge', X(0.42), Y(p.y), { size: fsm, align: 'left', color: '#ffc2c8', bg: A.LABEL_BG });
        if (si === 4) A.label(ctx, 'apa → sânge', X(0.42), Y(-0.1), { size: fsm, align: 'left', color: '#bfe6ff', bg: A.LABEL_BG });
        /* etichete */
        const lb = { size: A.labelSize(U), bg: A.LABEL_BG };
        A.label(ctx, 'Gura', X(-0.2), Y(-0.88), Object.assign({ align: 'right', tx: X(-0.06), ty: Y(-0.88) }, lb));
        A.label(ctx, 'Esofag', X(-0.2), Y(-0.65), Object.assign({ align: 'right', tx: X(-0.03), ty: Y(-0.65) }, lb));
        A.label(ctx, 'Stomac', X(0.44), Y(-0.52), Object.assign({ align: 'left', tx: X(0.24), ty: Y(-0.43) }, lb));
        A.label(ctx, 'Intestin subțire', X(-0.44), Y(0.08), Object.assign({ align: 'right', tx: X(-0.2), ty: Y(0.04) }, lb));
        A.label(ctx, 'Intestin gros', X(0.44), Y(0.3), Object.assign({ align: 'left', tx: X(0.33), ty: Y(0.3) }, lb));
        if (si !== lastSt) { lastSt = si; if (playing) api.say('<b>' + ST[si].n + '</b> · ' + ST[si].h + '. ' + ST[si].t, 8000); }
        info.innerHTML = '<b>' + ST[si].n + '</b> · <b>' + timeText() + '</b> după masă' + (si === 3 ? ' · intestinul subțire are ~6 m' : '');
      }
      return { frame: frame };
    }
  });
})();
