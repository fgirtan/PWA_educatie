/* Modul: Circuitul electric */
(function () {
  const A = window.Art;
  const TAU = Math.PI * 2;
  /* text curat, fără halou gros */
  const txt = (ctx, s, x, y, o) => A.text(ctx, s, x, y, Object.assign({ halo: false }, o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });

  /* ---------- ajutoare locale de desen ---------- */
  /* sprite luminos (punct cu halou), pus în cache — pentru electroni și scântei */
  function dotSprite(color) {
    return A.cached('circ-dot-' + color, 48, 48, (c, w, h) => {
      const g = c.createRadialGradient(24, 24, 0, 24, 24, 24);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.16, A.rgba(color, 0.95)); g.addColorStop(0.45, A.rgba(color, 0.32)); g.addColorStop(1, A.rgba(color, 0));
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    });
  }
  /* buclă închisă cu colțuri rotunjite → listă densă de puncte (aceeași formă pentru fir și pentru electroni) */
  function loopPts(verts, radii) {
    const n = verts.length, out = [];
    for (let i = 0; i < n; i++) {
      const P = verts[(i - 1 + n) % n], V = verts[i], N = verts[(i + 1) % n];
      const dp = Math.hypot(P[0] - V[0], P[1] - V[1]) || 1, dn = Math.hypot(N[0] - V[0], N[1] - V[1]) || 1;
      const rr = Math.min(radii[i], dp / 2, dn / 2);
      const a = [V[0] + (P[0] - V[0]) / dp * rr, V[1] + (P[1] - V[1]) / dp * rr], b = [V[0] + (N[0] - V[0]) / dn * rr, V[1] + (N[1] - V[1]) / dn * rr];
      const steps = rr > 2 ? 8 : 1;
      for (let s = 0; s <= steps; s++) { const t = s / steps, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * V[0] + t * t * b[0], u * u * a[1] + 2 * u * t * V[1] + t * t * b[1]]); }
    }
    out.push(out[0].slice());
    const cum = [0]; for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
    return { pts: out, len: cum[cum.length - 1], cum: cum };
  }
  function polyPath(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); }
  /* fir de cupru cu izolație colorată: umbră, contur, izolație, luciu */
  function wire(ctx, buildPath, w, col) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.save(); ctx.translate(0, w * 0.55); buildPath(); ctx.strokeStyle = 'rgba(0,0,0,0.38)'; ctx.lineWidth = w + 4; ctx.stroke(); ctx.restore();
    buildPath(); ctx.strokeStyle = A.shade(col, -0.55); ctx.lineWidth = w + 3; ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    ctx.save(); ctx.translate(-w * 0.12, -w * 0.2); buildPath(); ctx.strokeStyle = 'rgba(255,255,255,0.38)'; ctx.lineWidth = Math.max(1, w * 0.26); ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  /* bornă cu șurub (alamă) */
  function screw(ctx, x, y, r) {
    A.sphere(ctx, x, y, r, '#d9a441', { rim: false });
    ctx.save(); ctx.strokeStyle = 'rgba(70,40,10,0.75)'; ctx.lineWidth = Math.max(1, r * 0.28); ctx.beginPath(); ctx.moveTo(x - r * 0.55, y + r * 0.2); ctx.lineTo(x + r * 0.55, y - r * 0.2); ctx.stroke(); ctx.restore();
  }

  /* ============================================================
     1) CIRCUIT ELECTRIC — adaugi și scoți componente cu click
     ============================================================ */
  defineModule({
    id: 'circuit', title: 'Circuitul electric', sub: 'Adaugă componente și vezi ce se întâmplă',
    start: function (api) {
      const ctx = api.ctx;
      const TYPES = {
        bec: { n: 'Bec', R: 6, e: '💡', tip: '<b>Becul</b> are un fir subțire care se înfierbântă și strălucește. Dacă prin el trece prea mult curent, firul se arde!' },
        led: { n: 'LED', R: 30, e: '🔴', tip: '<b>LED-ul</b> luminează cu puțin curent, dar se arde ușor! Dacă îl pui direct pe baterie, pocnește. Pune un <b>rezistor</b> în serie cu el ca să-l protejezi.' },
        rez: { n: 'Rezistor', R: 12, e: '🟫', tip: '<b>Rezistorul</b> „strânge” curentul: cu cât are rezistență mai mare, cu atât trece mai puțin curent. Se încălzește (ca o plită!).' },
        fan: { n: 'Ventilator', R: 8, e: '🌀', tip: '<b>Ventilatorul</b> are un motor mic: cu cât primește mai multă putere, cu atât se rotește mai repede.' },
        buz: { n: 'Sonerie', R: 14, e: '🔔', tip: '<b>Soneria</b> transformă curentul în sunet. Dacă nu auzi nimic, ridică volumul telefonului!' }
      };
      let on = true, par = false, V = 6, comps = [], rmv = false, flowT = 0, aud = null, audLevel = 0;
      const MAXC = 20, CAP = 5;                        // componente maxime; capacitatea bateriei (Ah)
      let bats = [1], charge = 1, tscale = 150, elapsed = 0, energy = 0, drained = false, Veff = 6;
      let swAng = 0, shortK = 0;                       // animații: pârghia întrerupătorului, strălucirea scurtcircuitului
      const sparks = A.particles(500), smoke = A.particles(240);
      const mk = (type) => ({ type: type, burnt: false, ang: 0, glow: 0, pop: 0, seed: Math.random() * 100 });
      comps.push(mk('bec'), mk('bec'));
      const r0 = api.row('Adaugă');
      Object.keys(TYPES).forEach((k) => api.button(r0, TYPES[k].e + ' ' + TYPES[k].n, () => {
        if (comps.length >= MAXC) { api.say('Sunt destule componente (' + MAXC + ')! Scoate una ca să pui alta.', 3500); return; }
        comps.push(mk(k)); rmv = false; bRm.classList.remove('on'); bRm.innerHTML = '🗑️ Scoate componente'; api.say(TYPES[k].tip, 10000);
      }));
      const r1 = api.row('');
      const bSw = api.button(r1, '🔘 Întrerupător: PORNIT', () => { on = !on; bSw.innerHTML = on ? '🔘 Întrerupător: PORNIT' : '⚪ Întrerupător: OPRIT'; api.say(on ? 'Circuitul e <b>închis</b>: curentul poate trece.' : 'Circuitul e <b>deschis</b>: curentul nu are pe unde trece, deci nu se aprinde nimic!', 6000); });
      const bMode = api.button(r1, '➡️ În serie', () => { par = !par; bMode.innerHTML = par ? '🔀 În paralel' : '➡️ În serie'; api.say(par ? '<b>Paralel:</b> fiecare componentă are propriul drum și primește toată tensiunea. Dacă una se arde, celelalte merg (așa e instalația din casă).' : '<b>Serie:</b> componentele sunt pe același drum și își împart tensiunea. Dacă una se arde, toate se opresc (ca la ghirlandele vechi).', 9000); });
      const bRm = api.button(r1, '🗑️ Scoate componente', () => { rmv = !rmv; bRm.classList.toggle('on', rmv); bRm.innerHTML = rmv ? '✋ Atinge o componentă ca s-o scoți' : '🗑️ Scoate componente'; if (rmv) api.say('Mod scoatere: <b>atinge o componentă</b> ca s-o ștergi din circuit.', 5000); });
      api.button(r1, '🔧 Repară', () => { comps.forEach((c) => { c.burnt = false; }); api.say('Componentele arse au fost înlocuite!', 2500); });
      api.button(r1, '🧹 Golește', () => { comps = []; });
      api.button(r0, '➕ 5 becuri', () => { for (let i = 0; i < 5 && comps.length < MAXC; i++) comps.push(mk('bec')); api.say('Cu cât pui mai mulți consumatori, cu atât bateria se golește mai repede! Urmărește nivelul ei.', 8000); });
      const r2 = api.row('');
      api.slider(r2, { label: 'Viteza timpului', min: 0, max: 1, step: 0.01, value: 0.5, fmt: (v) => '×' + Math.round(Math.exp(Math.log(20) + v * (Math.log(1500) - Math.log(20)))), onInput: (v) => { tscale = Math.exp(Math.log(20) + v * (Math.log(1500) - Math.log(20))); } });
      api.button(r2, '🔋 Baterie nouă', () => { if (bats.length < 4) { bats.push(1); api.say('<b>Baterie nouă</b> adăugată în paralel: tensiunea rămâne la fel, dar <b>capacitatea crește</b> (' + bats.length + ' × ' + CAP + ' Ah), deci circuitul merge mai mult timp. Bateriile se golesc împreună.', 9000); } else { let m = 0; bats.forEach((c, i) => { if (c < bats[m]) m = i; }); bats[m] = 1; api.say('Ai 4 baterii: am înlocuit-o pe cea mai goală cu una nouă.', 5000); } drained = false; });
      api.button(r2, '➖ Scoate o baterie', () => { if (bats.length > 1) { let m = 0; bats.forEach((c, i) => { if (c < bats[m]) m = i; }); bats.splice(m, 1); api.say('Am scos bateria cea mai goală. Rămân ' + bats.length + '.', 3500); } else api.say('Circuitul are nevoie de cel puțin o baterie!', 3500); });
      api.button(r2, '⚡ Încarcă toate', () => { bats = bats.map(() => 1); drained = false; api.say('Toate bateriile sunt încărcate la 100%.', 3000); });
      api.slider(r2, { label: 'Tensiunea bateriei', min: 1.5, max: 24, step: 0.5, value: V, fmt: (v) => fmt(v) + ' V', onInput: (v) => { V = v; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Adaugă componente din paletă (💡 🔴 🟫 🌀 🔔). Schimbă între serie și paralel, crește tensiunea… dar ai grijă să nu arzi becurile sau LED-urile! Pentru a scoate ceva, apasă „Scoate componente”.', 14000);

      function geom() { const W = api.freeW, U = api.unit; return { x0: W * 0.12, x1: W * 0.88, y0: api.cy - U * 0.5, y1: api.cy + U * 0.5, W: W }; }
      function slotX(g, i, n) { return g.x0 + (g.x1 - g.x0) * (0.3 + 0.62 * (i + 0.5) / Math.max(n, 1)); }
      const big = () => clamp(api.unit / 210, 1, 1.6);   // pe ecrane mari componentele cresc
      const cornerR = () => clamp(api.unit * 0.16, 14, 46);
      /* drumul electronilor: aceeași buclă rotunjită ca firul desenat */
      function path(g, k, n) {
        const R = cornerR();
        if (!par) return loopPts([[g.x0, g.y1], [g.x0, g.y0], [g.x1, g.y0], [g.x1, g.y1]], [R, R, R, R]);
        const sx = slotX(g, k, n);
        return loopPts([[g.x0, g.y1], [g.x0, g.y0], [sx, g.y0], [sx, g.y1]], [R, R, 5, 5]);
      }
      function at(p, u) { const d = (((u % 1) + 1) % 1) * p.len; let lo = 0, hi = p.cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p.cum[m] < d) lo = m; else hi = m; } const k = (d - p.cum[lo]) / ((p.cum[hi] - p.cum[lo]) || 1); return [lerp(p.pts[lo][0], p.pts[hi][0], k), lerp(p.pts[lo][1], p.pts[hi][1], k)]; }
      function solve() {
        const n = comps.length, out = { I: 0, I_k: [], P: [], Vc: [], short: false };
        comps.forEach(() => { out.I_k.push(0); out.P.push(0); out.Vc.push(0); });
        if (!on) return out;
        if (n === 0) { out.short = true; out.I = 40; return out; }
        const R = comps.map((c) => TYPES[c.type].R);
        if (!par) {
          if (comps.some((c) => c.burnt)) return out;
          const I = Veff / R.reduce((a, b) => a + b, 0); out.I = I;
          comps.forEach((c, i) => { out.I_k[i] = I; out.Vc[i] = I * R[i]; out.P[i] = I * I * R[i]; });
        } else {
          comps.forEach((c, i) => { if (c.burnt) return; const I = Veff / R[i]; out.I_k[i] = I; out.Vc[i] = Veff; out.P[i] = I * I * R[i]; out.I += I; });
        }
        return out;
      }
      function burst(x, y, n, s) {
        for (let k = 0; k < n; k++) { const a = Math.random() * TAU, v = (80 + Math.random() * 260) * s; sparks.emit({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80 * s, g: 520, drag: 1.6, life: 0.35 + Math.random() * 0.55, size: (4 + Math.random() * 5) * s, color: Math.random() < 0.5 ? '#fff1a8' : '#ffb347' }); }
        for (let k = 0; k < 5; k++) smoke.emit({ x: x + (Math.random() - 0.5) * 10 * s, y: y, vx: (Math.random() - 0.5) * 20, vy: -30 - Math.random() * 30, drag: 0.6, life: 1.6 + Math.random(), size: 5 * s, grow: 14 * s, color: '#3a3a44' });
      }

      /* ---------- componentele, desenate ---------- */
      function base(sc) {
        ctx.save();
        A.roundRectPath(ctx, -30, -30, 60, 68, 13); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
        ctx.translate(0, -4);
        A.roundRectPath(ctx, -30, -30, 60, 68, 13);
        const g = ctx.createLinearGradient(-30, -30, 20, 40); g.addColorStop(0, '#3b4a78'); g.addColorStop(0.55, '#26325a'); g.addColorStop(1, '#161e3a'); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
        A.roundRectPath(ctx, -26, -26, 52, 60, 10); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
        screw(ctx, -22, -26, 3.2); screw(ctx, 22, -26, 3.2);
      }
      function bulb(c, ratio, t) {
        const lit = !c.burnt && ratio > 0.02, k = c.glow;   // k = strălucire netezită
        if (lit) { A.glow(ctx, 0, -6, 46 * (0.5 + ratio * 0.6), '#ffcf6a', clamp(k * 0.55, 0, 0.7)); }
        const glass = () => { ctx.beginPath(); ctx.moveTo(-8, 12); ctx.bezierCurveTo(-8, 5, -18, 3, -18, -6); ctx.arc(0, -6, 18, Math.PI, 0); ctx.bezierCurveTo(18, 3, 8, 5, 8, 12); ctx.closePath(); };
        /* soclul filetat */
        A.cylinder(ctx, -8.5, 11, 17, 15, '#c3c9d3', true);
        ctx.strokeStyle = 'rgba(60,66,80,0.65)'; ctx.lineWidth = 1.2; for (let y = 14; y <= 23; y += 4) { ctx.beginPath(); ctx.moveTo(-8.5, y); ctx.lineTo(8.5, y + 2); ctx.stroke(); }
        ctx.fillStyle = '#2a2d36'; ctx.beginPath(); ctx.ellipse(0, 27, 4.5, 2.6, 0, 0, TAU); ctx.fill();
        /* sticla */
        glass();
        const gg = ctx.createRadialGradient(-5, -12, 1, 0, -4, 22);
        if (c.burnt) { gg.addColorStop(0, 'rgba(120,120,128,0.55)'); gg.addColorStop(1, 'rgba(40,40,48,0.75)'); }
        else if (lit) { const a = clamp(k, 0, 1.4); gg.addColorStop(0, 'rgba(255,252,225,' + clamp(0.35 + a * 0.6, 0, 1) + ')'); gg.addColorStop(0.55, 'rgba(255,214,120,' + clamp(0.18 + a * 0.5, 0, 0.9) + ')'); gg.addColorStop(1, 'rgba(255,160,60,' + clamp(0.1 + a * 0.35, 0, 0.7) + ')'); }
        else { gg.addColorStop(0, 'rgba(230,240,255,0.30)'); gg.addColorStop(0.7, 'rgba(170,195,230,0.14)'); gg.addColorStop(1, 'rgba(140,170,220,0.32)'); }
        ctx.fillStyle = gg; ctx.fill();
        /* suporturi + filament spiralat */
        ctx.strokeStyle = 'rgba(190,195,205,0.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, 12); ctx.lineTo(-6, -3); ctx.moveTo(3, 12); ctx.lineTo(6, -3); ctx.stroke();
        const fc = c.burnt ? '#55504a' : lit ? A.mix('#ff8a3a', '#fffbe6', clamp(k * 0.8, 0, 1)) : '#8a7f70';
        ctx.strokeStyle = fc; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.beginPath();
        if (!c.burnt) { for (let i = 0; i <= 24; i++) { const u = i / 24, x = lerp(-6, 6, u) + Math.sin(u * TAU * 4) * 0.9, y = -3 - Math.abs(Math.cos(u * TAU * 4)) * 2.4 - Math.sin(u * Math.PI) * 2; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } }
        else { ctx.moveTo(-6, -3); ctx.quadraticCurveTo(-3, -4, -2, 2); ctx.moveTo(6, -3); ctx.quadraticCurveTo(4, -2, 3, 4); }
        ctx.stroke();
        if (lit) A.glow(ctx, 0, -5, 12 + 8 * clamp(k, 0, 1.5), '#fff2c0', clamp(k * 0.9, 0, 1));
        /* contur + luciu */
        glass(); ctx.strokeStyle = c.burnt ? 'rgba(160,160,170,0.5)' : 'rgba(235,245,255,0.6)'; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, -6, 13.5, 3.5, 4.35); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(-6.5, -16.5, 1.6, 0, TAU); ctx.fill();
        if (c.burnt) { ctx.fillStyle = 'rgba(20,20,24,0.45)'; ctx.beginPath(); ctx.ellipse(1, -14, 10, 6, 0, 0, TAU); ctx.fill(); }
      }
      function led(c, ratio, t) {
        const lit = !c.burnt && ratio > 0.02, k = c.glow;
        if (lit) A.glow(ctx, 0, -6, 40 * (0.5 + ratio * 0.4), '#ff3a3a', clamp(k * 0.55, 0, 0.7));
        /* picioarele (anod mai lung) */
        ctx.strokeStyle = '#c9ced8'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-5, 10); ctx.lineTo(-5, 31); ctx.moveTo(5, 10); ctx.lineTo(5, 22); ctx.quadraticCurveTo(5, 25, 7, 27); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-5.6, 11); ctx.lineTo(-5.6, 30); ctx.stroke();
        /* corpul din rășină */
        const dome = () => { ctx.beginPath(); ctx.moveTo(-11, 8); ctx.lineTo(-11, -6); ctx.arc(0, -6, 11, Math.PI, 0); ctx.lineTo(11, 8); ctx.closePath(); };
        dome();
        const g = ctx.createRadialGradient(-3, -9, 1, 0, -2, 17);
        if (c.burnt) { g.addColorStop(0, '#4a3434'); g.addColorStop(1, '#141010'); }
        else if (lit) { const a = clamp(k, 0, 1.6); g.addColorStop(0, A.mix('#ff9a8a', '#fff4f0', clamp(a * 0.7, 0, 1))); g.addColorStop(0.45, A.mix('#d82a2a', '#ff5a4a', clamp(a, 0, 1))); g.addColorStop(1, '#8a0e14'); }
        else { g.addColorStop(0, 'rgba(240,120,130,0.85)'); g.addColorStop(0.5, 'rgba(170,30,45,0.85)'); g.addColorStop(1, 'rgba(80,10,20,0.95)'); }
        ctx.fillStyle = g; ctx.fill();
        /* cadrul interior (anod + cupă) */
        ctx.strokeStyle = 'rgba(40,10,10,0.55)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-5, 8); ctx.lineTo(-5, -2); ctx.moveTo(5, 8); ctx.lineTo(5, -1); ctx.lineTo(1, -4); ctx.stroke();
        ctx.fillStyle = 'rgba(40,10,10,0.5)'; ctx.fillRect(-7, -4, 5, 3);
        if (lit) A.glow(ctx, -2, -3, 9 + 6 * clamp(k, 0, 1.5), '#fff0e0', clamp(k, 0, 1));
        /* guler + luciu */
        A.roundRectPath(ctx, -13, 7, 26, 4, 2); ctx.fillStyle = c.burnt ? '#2a1a1a' : lit ? '#ff6a5a' : '#9a2a36'; ctx.fill();
        dome(); ctx.strokeStyle = 'rgba(255,220,220,0.35)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-7.5, 5); ctx.lineTo(-7.5, -6); ctx.arc(0, -6, 7.5, Math.PI, Math.PI * 1.35); ctx.stroke();
        if (c.burnt) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(2, -9, 6, 4, 0.4, 0, TAU); ctx.fill(); }
      }
      function resistor(c, p, t) {
        const heat = clamp(p / 5, 0, 1);
        if (heat > 0.05) A.glow(ctx, 0, 0, 34, '#ff7828', heat * 0.45);
        ctx.strokeStyle = '#c9ced8'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.stroke();
        const body = () => { ctx.beginPath(); ctx.moveTo(-14, -6); ctx.lineTo(14, -6); ctx.bezierCurveTo(17, -10, 24, -10, 24, 0); ctx.bezierCurveTo(24, 10, 17, 10, 14, 6); ctx.lineTo(-14, 6); ctx.bezierCurveTo(-17, 10, -24, 10, -24, 0); ctx.bezierCurveTo(-24, -10, -17, -10, -14, -6); ctx.closePath(); };
        const col = A.mix('#e6cc9c', '#ff5a24', heat * 0.85);
        body(); A.volumeFill(ctx, 0, -10, 0, 10, col, { hi: 0.35, lo: 0.4 });
        ctx.save(); body(); ctx.clip();
        [['#7a4a22', -17], ['#1e1e22', -8], ['#c8352d', -1], ['#d4a436', 14]].forEach(([cc, x]) => { ctx.fillStyle = cc; ctx.fillRect(x, -11, 4, 22); });
        const sh = ctx.createLinearGradient(0, -10, 0, 10); sh.addColorStop(0, 'rgba(255,255,255,0.35)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.3)'); ctx.fillStyle = sh; ctx.fillRect(-25, -11, 50, 22);
        ctx.restore();
        body(); ctx.strokeStyle = A.shade(col, -0.5); ctx.lineWidth = 1; ctx.stroke();
        /* aer cald care urcă */
        if (heat > 0.05) { ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { const ph = (t * 0.7 + k / 3) % 1; ctx.strokeStyle = 'rgba(255,230,200,' + heat * 0.55 * Math.sin(ph * Math.PI) + ')'; ctx.lineWidth = 1.8; ctx.beginPath(); for (let i = 0; i <= 10; i++) { const y = -12 - ph * 16 - i * 1.4, x = -10 + k * 10 + Math.sin(i * 0.8 + t * 5 + k) * 2.5; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); } }
      }
      function fan(c, p, t, dt) {
        const spd = clamp(p, 0, 40) * 1.4; c.ang += dt * spd;
        A.metalPlate(ctx, -25, -25, 50, 50, 10, '#4a5675');
        ctx.fillStyle = '#0d1226'; ctx.beginPath(); ctx.arc(0, 0, 21, 0, TAU); ctx.fill();
        const inner = ctx.createRadialGradient(0, 0, 4, 0, 0, 21); inner.addColorStop(0, 'rgba(60,80,130,0.4)'); inner.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = inner; ctx.fill();
        [[-19, -19], [19, -19], [-19, 19], [19, 19]].forEach(([x, y]) => { ctx.fillStyle = '#1a2036'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill(); });
        const blades = (alpha, off) => {
          ctx.save(); ctx.rotate(c.ang + off);
          for (let k = 0; k < 5; k++) {
            ctx.rotate(TAU / 5);
            ctx.beginPath(); ctx.moveTo(2, -3); ctx.bezierCurveTo(8, -6, 18, -6, 19, 2); ctx.bezierCurveTo(14, 6, 7, 5, 2, 3); ctx.closePath();
            const bg = ctx.createLinearGradient(0, -6, 0, 6); bg.addColorStop(0, 'rgba(190,235,255,' + alpha + ')'); bg.addColorStop(1, 'rgba(60,150,220,' + alpha + ')'); ctx.fillStyle = bg; ctx.fill();
          }
          ctx.restore();
        };
        if (spd > 14) { ctx.fillStyle = 'rgba(140,200,255,' + clamp((spd - 14) / 40, 0, 0.3) + ')'; ctx.beginPath(); ctx.arc(0, 0, 19, 0, TAU); ctx.fill(); blades(0.25, -0.18); blades(0.25, -0.36); blades(0.55, 0); }
        else blades(0.95, 0);
        A.sphere(ctx, 0, 0, 5, '#c9d2e2', { rim: false });
      }
      function buzzer(c, p, t) {
        const lvl = clamp(p / 4, 0, 1);
        if (lvl > 0.03) { ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { const ph = (t * 1.6 + k / 3) % 1, a = Math.sin(ph * Math.PI) * lvl; ctx.strokeStyle = 'rgba(255,226,138,' + a + ')'; ctx.lineWidth = 2.6 - ph; ctx.beginPath(); ctx.arc(0, 0, 21 + ph * 22, -0.75, 0.75); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 21 + ph * 22, Math.PI - 0.75, Math.PI + 0.75); ctx.stroke(); } }
        const jx = lvl > 0.03 ? Math.sin(t * 90) * lvl * 0.9 : 0;
        ctx.save(); ctx.translate(jx, 0);
        ctx.fillStyle = '#0a0a10'; ctx.beginPath(); ctx.ellipse(0, 4, 18, 18, 0, 0, TAU); ctx.fill();
        A.sphere(ctx, 0, 0, 18, '#30323c', { rim: false, gloss: false });
        ctx.fillStyle = '#1b1c22'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.fill();
        const rg = ctx.createRadialGradient(-3, -3, 0, 0, 0, 12); rg.addColorStop(0, 'rgba(120,124,140,0.6)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = rg; ctx.fill();
        ctx.fillStyle = '#050508'; ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 16, 3.6, 4.6); ctx.stroke();
        ctx.strokeStyle = '#d0d4de'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-12, -14); ctx.lineTo(-8, -14); ctx.moveTo(-10, -16); ctx.lineTo(-10, -12); ctx.stroke();
        ctx.restore();
      }
      function drawComp(c, x, y, p, I, t, dt, sc) {
        const T = c.type;
        c.pop = A.damp(c.pop, 1, 9, dt);
        const target = c.burnt ? 0 : T === 'bec' ? clamp(p / 6, 0, 2.2) : T === 'led' ? clamp(I / 0.04, 0, 3) : 0;
        c.glow = A.damp(c.glow, target, 10, dt);
        ctx.save(); ctx.translate(x, y); ctx.scale(sc * A.ease.back(clamp(c.pop, 0, 1)), sc * A.ease.back(clamp(c.pop, 0, 1)));
        base(sc);
        if (T === 'bec') bulb(c, clamp(p / 6, 0, 2.2), t);
        else if (T === 'led') led(c, clamp(I / 0.04, 0, 3), t);
        else if (T === 'rez') resistor(c, p, t);
        else if (T === 'fan') fan(c, p, t, dt);
        else if (T === 'buz') buzzer(c, p, t);
        if (rmv) {
          const pul = 0.8;
          A.roundRectPath(ctx, -32, -36, 64, 72, 14); ctx.strokeStyle = 'rgba(255,90,90,' + pul + ')'; ctx.lineWidth = 2.5; ctx.stroke();
          A.sphere(ctx, 22, -28, 11, '#e8394f', { rim: false });
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(18, -32); ctx.lineTo(26, -24); ctx.moveTo(26, -32); ctx.lineTo(18, -24); ctx.stroke();
        }
        ctx.restore();
        if (false) smoke.emit({ x: x + (Math.random() - 0.5) * 8 * sc, y: y - 20 * sc, vx: (Math.random() - 0.5) * 10, vy: -22 - Math.random() * 14, drag: 0.4, life: 1.8, size: 3 * sc, grow: 9 * sc, color: '#4a4a55' });
      }
      let t = 0;
      function layoutComps(g) {
        const n = comps.length, out = [];
        if (!par) {
          const pts = [[g.x0 + (g.x1 - g.x0) * 0.26, g.y0], [g.x1, g.y0], [g.x1, g.y1], [g.x0, g.y1], [g.x0, (g.y0 + g.y1) / 2 + Math.min(bats.length, 4) * 38 * big() * (bats.length <= 1 ? 1 : bats.length === 2 ? 0.82 : 0.66) * 2 / 2 + 30 * big()]];
          const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
          const L = cum[cum.length - 1], sc = clamp((L / Math.max(n, 1)) / 78, 0.4, big());
          for (let i = 0; i < n; i++) { const d = (i + 0.5) / n * L; let k = 1; while (k < cum.length - 1 && cum[k] < d) k++; const f = (d - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1); out.push({ x: lerp(pts[k - 1][0], pts[k][0], f), y: lerp(pts[k - 1][1], pts[k][1], f) + 4, s: sc }); }
        } else {
          const sp = (g.x1 - g.x0) * 0.62 / Math.max(n, 1), sc = clamp(sp / 64, 0.38, big());
          for (let i = 0; i < n; i++) out.push({ x: slotX(g, i, n), y: (g.y0 + g.y1) / 2 + 4, s: sc });
        }
        return out;
      }
      function compPos(g, i) { const q = layoutComps(g)[i]; return [q.x, q.y, q.s]; }
      api.pointer({ down: (x, y) => { if (!rmv) return; const g = geom(); for (let i = 0; i < comps.length; i++) { const q = compPos(g, i); if (Math.abs(x - q[0]) < 34 * q[2] + 6 && Math.abs(y - q[1]) < 44 * q[2] + 6) { api.say(TYPES[comps[i].type].e + ' <b>' + TYPES[comps[i].type].n + '</b> scos din circuit.', 2500); smoke.emit({ x: q[0], y: q[1], vy: -20, life: 0.8, size: 10, grow: 40, color: '#8a93a8' }); comps.splice(i, 1); return; } } } });

      /* fundal: placă de montaj (cache pe mărime) */
      function board() {
        return A.cached('circ-board', api.W, api.H, (c, w, h) => {
          A.backdrop(c, w, h, { top: '#1a2444', bottom: '#0e1428', vignette: false });
        });
      }
      const elecCol = '#7ec8ff', hotCol = '#ffb067';

      function frame(dt, tm) {
        t = tm;
        ctx.drawImage(board(), 0, 0, api.W, api.H);
        const g = geom(), n = comps.length, U = api.unit;
        const liveB = bats.filter((c) => c > 0.0005), meanLive = liveB.length ? liveB.reduce((a, c) => a + c, 0) / liveB.length : 0;
        charge = bats.reduce((a, c) => a + c, 0) / bats.length;
        Veff = on && liveB.length ? V * (meanLive > 0.2 ? 1 : meanLive / 0.2) : 0;
        let S = solve();
        const Lc = layoutComps(g);
        for (let i = 0; i < n; i++) { const c = comps[i]; if (c.burnt) continue; if (c.type === 'bec' && S.P[i] > 13.5) { c.burnt = true; burst(Lc[i].x, Lc[i].y - 6 * Lc[i].s, 18, Lc[i].s); api.say('💥 <b>Becul s-a ars!</b> Tensiunea a fost prea mare pentru el. Apasă „Repară”.', 6000); } if (c.type === 'led' && S.I_k[i] > 0.15) { c.burnt = true; burst(Lc[i].x, Lc[i].y - 6 * Lc[i].s, 16, Lc[i].s); api.say('💥 <b>LED-ul s-a ars!</b> A trecut prea mult curent prin el. Pune un <b>rezistor în serie</b> și încearcă din nou.', 8000); } }
        S = solve();
        /* supratensiune: scântei mici înainte să se ardă */
        for (let i = 0; i < n; i++) { const c = comps[i]; if (c.burnt) continue; const risk = c.type === 'bec' ? (S.P[i] - 9) / 4.5 : c.type === 'led' ? (S.I_k[i] - 0.09) / 0.06 : 0; if (risk > 0 && Math.random() < dt * 4 * risk) { const a = Math.random() * TAU; sparks.emit({ x: Lc[i].x + Math.cos(a) * 8 * Lc[i].s, y: Lc[i].y - 8 * Lc[i].s + Math.sin(a) * 8 * Lc[i].s, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120 - 60, g: 400, drag: 2, life: 0.35, size: 4 * Lc[i].s, color: '#fff1a8' }); } }
        /* bateria se consumă: curent × timp */
        if (S.I > 0 && liveB.length) { const hrs = dt * tscale / 3600, per = S.I * hrs / CAP / liveB.length; bats = bats.map((c) => c > 0.0005 ? Math.max(0, c - per) : c); elapsed += hrs; energy += Veff * S.I * hrs; }
        if (!liveB.length && !drained && on) { drained = true; api.say('🪫 <b>Bateria s-a descărcat!</b> Prea mulți consumatori au golit-o repede. Pune o <b>baterie nouă</b> sau apasă „Încarcă toate”.', 9000); }
        if (liveB.length && meanLive > 0.05) drained = false;
        shortK = A.damp(shortK, S.short ? 1 : 0, 4, dt);

        /* fire */
        const R = cornerR(), wW = clamp(U * 0.03, 5, 9);
        const mainLoop = loopPts([[g.x0, g.y1], [g.x0, g.y0], [g.x1, g.y0], [g.x1, g.y1]], [R, R, R, R]);
        const wireCol = A.mix('#d8443a', '#ff8a3a', shortK);
        if (shortK > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; polyPath(ctx, mainLoop.pts); ctx.strokeStyle = 'rgba(255,120,40,' + 0.25 * shortK + ')'; ctx.lineWidth = wW * 2.2; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }
        wire(ctx, () => polyPath(ctx, mainLoop.pts), wW, wireCol);
        if (par) for (let i = 0; i < n; i++) { const bx = slotX(g, i, n); wire(ctx, () => { ctx.beginPath(); ctx.moveTo(bx, g.y0); ctx.lineTo(bx, g.y1); }, wW * 0.85, '#2f7fd8'); [g.y0, g.y1].forEach((yy) => A.sphere(ctx, bx, yy, wW * 0.8, '#c0c6d0', { rim: false })); }

        /* electroni — puncte luminoase care curg pe fire */
        if (S.I > 0) {
          flowT += dt * Math.min(S.I, 3) * 0.12;
          const paths = par && n ? Array.from({ length: n }, (_, k) => path(g, k, n)) : [path(g, 0, n)];
          const ec = S.short ? hotCol : elecCol, ds = clamp(U * 0.014, 3, 5);
          ctx.save(); ctx.fillStyle = ec; ctx.strokeStyle = A.shade(ec, -0.5); ctx.lineWidth = 1;
          paths.forEach((p, k) => {
            const cur = par && n ? S.I_k[k] : S.I; if (cur <= 0) return;
            const count = Math.round(p.len / 22); const sp = par && n ? (cur / Math.max(...S.I_k, 0.001)) : 1;
            for (let j = 0; j < count; j++) { const q = at(p, j / count + flowT * 0.6 * sp * (S.short ? 3 : 1)); ctx.beginPath(); ctx.arc(q[0], q[1], ds, 0, TAU); ctx.fill(); ctx.stroke(); }
          });
          ctx.restore();
        }

        /* întrerupător cu pârghie */
        const sx = g.x0 + (g.x1 - g.x0) * 0.16, sy = g.y0;
        swAng = A.damp(swAng, on ? 0 : -0.75, 10, dt);
        ctx.save(); ctx.translate(sx, sy); ctx.scale(big(), big());
        A.softShadow(ctx, () => { A.roundRectPath(ctx, -36, -11, 72, 22, 9); const pg = ctx.createLinearGradient(0, -11, 0, 11); pg.addColorStop(0, '#f1ebe0'); pg.addColorStop(1, '#bdb2a0'); ctx.fillStyle = pg; ctx.fill(); }, { blur: 8, dy: 3 });
        A.roundRectPath(ctx, -36, -11, 72, 22, 9); ctx.strokeStyle = 'rgba(80,60,40,0.4)'; ctx.lineWidth = 1; ctx.stroke();
        screw(ctx, 26, 0, 5);
        ctx.save(); ctx.translate(-26, 0); ctx.rotate(swAng);
        ctx.lineCap = 'round'; ctx.strokeStyle = '#5b6577'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(54, 0); ctx.stroke();
        ctx.strokeStyle = '#d7dde8'; ctx.lineWidth = 4.5; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(2, -1.4); ctx.lineTo(52, -1.4); ctx.stroke();
        ctx.lineWidth = 9; ctx.strokeStyle = '#a3202c'; ctx.beginPath(); ctx.moveTo(56, 0); ctx.lineTo(68, 0); ctx.stroke();
        A.sphere(ctx, 68, 0, 6.5, '#e8394f', { rim: false });
        ctx.restore();
        screw(ctx, -26, 0, 5.5);
        ctx.restore();

        /* pachet de baterii (în paralel), pe latura din stânga — baterii „reale” */
        const by = (g.y0 + g.y1) / 2, kB = bats.length, bf = (kB <= 1 ? 1 : kB === 2 ? 0.82 : 0.66) * big(), bH = 76 * bf, bStep = 88 * bf, bw = 36 * bf;
        const pctSize = Math.max(12, Math.round(A.fs(U, 0.05, 12) * Math.max(0.8, bf)));
        bats.forEach((cc, i) => {
          const cy2 = by + (i - (kB - 1) / 2) * bStep, lv = clamp(cc, 0, 1), top = cy2 - bH / 2, x = g.x0 - bw / 2;
          A.groundShadow(ctx, g.x0 + 3, cy2 + 4, bw * 0.9, bH * 0.6, 0.45);
          if (shortK > 0.05) A.glow(ctx, g.x0, cy2, bH * 0.7, '#ff5a1f', 0.4 * shortK);
          /* borna + */
          A.cylinder(ctx, g.x0 - bw * 0.18, top - 6 * bf, bw * 0.36, 8 * bf, '#c7ccd6', true);
          /* corpul: înveliș negru + capăt arămiu */
          A.cylinder(ctx, x, top, bw, bH, '#24262e', true);
          ctx.save(); A.roundRectPath(ctx, x, top, bw, bH, bw * 0.18); ctx.clip(); A.cylinder(ctx, x, top - 4, bw, bH * 0.32 + 4, '#d0843f', true); ctx.restore();
          A.cylinder(ctx, x + 1, top + bH - 5 * bf, bw - 2, 5 * bf, '#9aa3b2', true);
          /* indicatorul de încărcare (fereastră pe baterie) */
          const wx = g.x0 - bw * 0.14, wy = top + bH * 0.4, ww = bw * 0.28, wh = bH * 0.48;
          A.roundRectPath(ctx, wx, wy, ww, wh, ww / 2); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill();
          const lc = S.short ? '#ff5a3a' : lv > 0.5 ? '#3ee07a' : lv > 0.2 ? '#f2cf3a' : '#ff5a3a';
          if (lv > 0.01) { ctx.save(); A.roundRectPath(ctx, wx, wy, ww, wh, ww / 2); ctx.clip(); const lg = ctx.createLinearGradient(wx, 0, wx + ww, 0); lg.addColorStop(0, A.shade(lc, -0.3)); lg.addColorStop(0.4, A.shade(lc, 0.3)); lg.addColorStop(1, A.shade(lc, -0.35)); ctx.fillStyle = lg; ctx.fillRect(wx, wy + wh * (1 - lv), ww, wh * lv); ctx.restore(); }
          txt(ctx, '+', g.x0, top + bH * 0.15, { size: Math.max(11, 15 * bf), color: '#2a1a08', halo: false, weight: 900 });
          txt(ctx, '−', g.x0, top + bH * 0.94 - 6 * bf, { size: Math.max(10, 13 * bf), color: '#e8ecf4', halo: false, weight: 900 });
          txt(ctx, Math.round(lv * 100) + '%', g.x0 + bw / 2 + 6, cy2, { size: pctSize, align: 'left', color: lv > 0.2 ? '#7dffb0' : '#ff8a7a', halo: false });
          if (S.short && Math.random() < dt * 6) { const a = -Math.random() * Math.PI; sparks.emit({ x: g.x0 + (Math.random() - 0.5) * bw, y: top + Math.random() * bH, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, g: 420, drag: 1.5, life: 0.4 + Math.random() * 0.4, size: 5, color: Math.random() < 0.5 ? '#fff1a8' : '#ffb347' }); }
        });
        const topY = by - ((kB - 1) / 2) * bStep - bH / 2 - 14 * bf - 12;
        A.label(ctx, fmt(V) + ' V' + (kB > 1 ? ' · ' + kB + ' baterii' : ''), Math.max(6, g.x0 - bw / 2 - 4), topY, { size: Math.max(12, A.fs(U, 0.045, 12)), align: 'left', color: '#ffe08a' });

        /* componente */
        const lblSize = Math.max(12, A.fs(U, 0.042, 12));
        comps.forEach((c, i) => { const q = Lc[i]; drawComp(c, q.x, q.y, S.P[i], S.I_k[i], tm, dt, q.s); });
        comps.forEach((c, i) => { const q = Lc[i]; if (q.s > 0.55) txt(ctx, TYPES[c.type].n + (c.burnt ? ' (ars!)' : ''), q.x, q.y + 46 * q.s, { size: lblSize, color: c.burnt ? '#ff8a7a' : 'rgba(235,242,255,0.92)', halo: false }); });

        /* scântei + fum */
        sparks.update(dt); smoke.update(dt);
        smoke.draw(ctx);
        if (sparks.list.length) {
          ctx.save(); ctx.lineCap = 'round';
          for (const p of sparks.list) { const k = 1 - p.age / p.life; ctx.strokeStyle = A.rgba(p.color, k); ctx.lineWidth = Math.max(1.5, p.size * 0.45); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025); ctx.stroke(); }
          ctx.restore();
        }

        if (S.short) {
          const ls = Math.max(13, A.fs(U, 0.05, 13)), ly = api.cy - U * 0.14, pul = 1;
          const b = A.label(ctx, 'SCURTCIRCUIT!', g.W / 2 + ls * 0.8, ly, { size: ls * 1.15, bg: 'rgba(120,16,20,' + 0.85 * pul + ')', color: '#fff', border: 'rgba(255,160,120,0.6)' });
          /* triunghi de avertizare desenat */
          const tx = b.x - ls * 1.1, ty = ly, ts = ls * 0.85;
          ctx.save(); ctx.beginPath(); ctx.moveTo(tx, ty - ts); ctx.lineTo(tx + ts * 1.05, ty + ts * 0.75); ctx.lineTo(tx - ts * 1.05, ty + ts * 0.75); ctx.closePath(); ctx.fillStyle = '#ffcf4a'; ctx.strokeStyle = '#7a4a00'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#3a2000'; ctx.fillRect(tx - ts * 0.08, ty - ts * 0.45, ts * 0.16, ts * 0.65); ctx.beginPath(); ctx.arc(tx, ty + ts * 0.45, ts * 0.1, 0, TAU); ctx.fill(); ctx.restore();
          txt(ctx, 'curentul nu trece prin nimic și bateria se încinge!', g.W / 2, ly + ls * 1.9, { size: ls * 0.9, color: '#ffb8a8', halo: false });
        }
        /* sonerie: sunet proporțional cu puterea */
        let lvl = 0; comps.forEach((c, i) => { if (c.type === 'buz' && !c.burnt) lvl = Math.max(lvl, clamp(S.P[i] / 4, 0, 1)); });
        if (lvl > 0 && !aud) { try { const AC = window.AudioContext || window.webkitAudioContext; const ac = new AC(), o = ac.createOscillator(), gn = ac.createGain(); o.type = 'square'; o.frequency.value = 520; gn.gain.value = 0; o.connect(gn); gn.connect(ac.destination); o.start(); aud = { ac: ac, o: o, g: gn }; } catch (e) { aud = { dead: true }; } }
        if (aud && aud.g) aud.g.gain.setTargetAtTime(lvl * 0.03 * ((Math.sin(tm * 14) > 0) ? 1 : 0.2), aud.ac.currentTime, 0.02);
        const left = S.I > 0 ? bats.reduce((a, c) => a + c, 0) * CAP / S.I : Infinity, ft = (h) => !isFinite(h) ? '—' : h < 1 ? fmt(h * 60, 0) + ' min' : fmt(h, 1) + ' ore';
        info.innerHTML = (S.short ? '<b>Scurtcircuit!</b> ' : '') + '<b>Curent:</b> ' + fmt(S.I, 2) + ' A · <b>Componente:</b> ' + n + '/' + MAXC + ' · <b>Baterii:</b> ' + bats.length + ' (' + Math.round(charge * 100) + '%)' + (S.I > 0 ? ' · se golește în ~<b>' + ft(left) + '</b>' : ' · <i>nu curge curent</i>') + ' · <b>Energie consumată:</b> ' + fmt(energy, 1) + ' Wh · <b>Timp trecut:</b> ' + ft(elapsed);
      }
      api.onCleanup(() => { if (aud && aud.g) { try { aud.g.gain.value = 0; aud.o.stop(); aud.ac.close(); } catch (e) { } } });
      return { frame: frame };
    }
  });
})();
