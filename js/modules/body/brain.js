/* Modul: Creierul — ilustrație anatomică (vedere laterală, stil atlas) */
(function () {
  const A = window.Art, C = A.C, TAU = A.TAU;
  const clamp = A.clamp, lerp = A.lerp;

  /* contururi în coordonate normalizate ale elipsei creierului (nx, ny ∈ [-1, 1]); fața e în stânga */
  const OUTLINE = [[-0.97, -0.05], [-0.92, -0.52], [-0.62, -0.88], [-0.15, -1.0], [0.35, -0.94], [0.76, -0.66], [0.97, -0.22], [0.98, 0.18], [0.86, 0.48], [0.6, 0.6], [0.3, 0.6], [0.08, 0.72], [-0.2, 0.84], [-0.46, 0.8], [-0.62, 0.56], [-0.64, 0.36], [-0.8, 0.38], [-0.95, 0.24]];
  const CS = [[-0.04, -1.05], [-0.1, -0.7], [-0.07, -0.42], [-0.18, -0.12], [-0.2, 0.18]];       // șanțul central
  const LS = [[-0.66, 0.33], [-0.4, 0.22], [-0.2, 0.18], [0.1, 0.12], [0.5, 0.08]];               // șanțul lateral (Sylvius)
  const PO = [[0.52, -1.05], [0.48, -0.55], [0.54, -0.05], [0.5, 0.5], [0.5, 0.9]];               // granița parieto-occipitală

  /* căi de-a lungul circumvoluțiunilor (pentru semnale), în coordonate normalizate — nu depind de mărime,
     deci rămân valabile și când textura vine din cache */
  let PATHS = [];

  defineModule({
    id: 'brain', title: 'Creierul', sub: 'Zone, reflexe și memorie',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'zones', sel = null, selT = 0;
      const bs = {};
      const rm = api.row('');
      [['zones', '🧠 Zonele'], ['reflex', '⚡ Reflexe'], ['memory', '🎵 Memorie']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const info = document.createElement('div'); info.className = 'mod-readout'; rm.appendChild(info);
      const REG = {
        frontal: { n: 'Lobul frontal', c: '#e8683a', t: 'Gândire, planificare, hotărâri și personalitate. Controlează și mișcările voluntare (să ridici mâna).' },
        parietal: { n: 'Lobul parietal', c: '#e8c33a', t: 'Primește atingerea, temperatura și durerea; te ajută să știi unde ești în spațiu.' },
        occipital: { n: 'Lobul occipital', c: '#4a8be8', t: 'Văzul! Nu vezi cu ochii, ci cu creierul: ochii doar trimit imaginea aici, în partea din spate a capului.' },
        temporal: { n: 'Lobul temporal', c: '#6acb7a', t: 'Auzul, limbajul și amintirile. Aici se păstrează și melodiile pe care le știi.' },
        cerebel: { n: 'Cerebelul', c: '#b46ae8', t: 'Echilibru și coordonare. Datorită lui poți merge pe bicicletă fără să te gândești la fiecare mișcare.' },
        stem: { n: 'Trunchiul cerebral', c: '#9a9aa8', t: 'Ține în viață corpul fără să te gândești: respirația, bătăile inimii, somnul. Face legătura cu măduva spinării.' }
      };
      function regionAt(nx, ny) {                       // în coordonate normalizate ale elipsei
        if (nx * nx + ny * ny > 1) return null;
        if (nx < -0.15 && ny < 0.15) return 'frontal';
        if (ny >= 0.15 && nx < 0.55) return 'temporal';
        if (nx >= 0.5) return 'occipital';
        return 'parietal';
      }
      const MSG = { zones: '86 de miliarde de neuroni lucrează în creierul tău — ~20% din energia corpului! Atinge o zonă ca să afli ce face.', reflex: 'Cât de repede reacționezi? Așteaptă ca ecranul să devină <b>verde</b>, apoi atinge cât poți de repede. Semnalul merge prin nervi cu ~100 m/s (360 km/h)!', memory: 'Joc de memorie: urmărește ordinea în care se aprind culorile, apoi repet-o. Cât de lungă poți ține minte?' };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); api.say(MSG[m], 12000); if (m === 'reflex') { rf = { s: 'idle', best: rf.best, ms: 0 }; } if (m === 'memory') { mem = { seq: [], show: 0, idx: 0, state: 'idle', flash: -1, flashT: 0, score: 0, best: mem.best, pos: 0 }; } api.layout(); }
      /* reflex */
      let rf = { s: 'idle', best: 0, ms: 0, t0: 0, delay: 0 };
      /* memorie */
      let mem = { seq: [], idx: 0, state: 'idle', flash: -1, flashT: 0, score: 0, best: 0, pos: 0 };
      const PADC = ['#e8453a', '#3ac55a', '#3a7be8', '#e8c53a'], PADN = ['roșu', 'verde', 'albastru', 'galben'];
      const padLit = [0, 0, 0, 0];
      function memNext() { mem.seq.push(Math.floor(Math.random() * 4)); mem.state = 'show'; mem.pos = 0; mem.flashT = -0.6; mem.flash = -1; }
      function padRect(i) { const U = api.unit, s = Math.min(U * 0.95, api.freeW * 0.42), gx = s * 0.08; const x0 = api.cx - s - gx / 2, y0 = api.cy - s - gx / 2; return { x: x0 + (i % 2) * (s + gx), y: y0 + Math.floor(i / 2) * (s + gx), s: s }; }
      api.pointer({
        down: (x, y) => {
          if (mode === 'zones') {
            const U = api.unit, nx = (x - api.cx) / (U * 0.95), ny = (y - (api.cy - U * 0.08)) / (U * 0.66);
            const prev = sel;
            if (Math.hypot((x - (api.cx + U * 0.5)), (y - (api.cy + U * 0.62))) < U * 0.22) sel = 'cerebel';
            else if (Math.abs(x - (api.cx + U * 0.12)) < U * 0.08 && y > api.cy + U * 0.45 && y < api.cy + U * 0.9) sel = 'stem';
            else sel = regionAt(nx, ny);
            if (sel !== prev) selT = 0;
            if (sel) api.say('<b>' + REG[sel].n + '.</b> ' + REG[sel].t, 14000);
          } else if (mode === 'reflex') {
            if (rf.s === 'idle' || rf.s === 'result' || rf.s === 'early') { rf.s = 'wait'; rf.delay = 1.5 + Math.random() * 2.8; rf.t0 = performance.now(); }
            else if (rf.s === 'wait') { rf.s = 'early'; }
            else if (rf.s === 'go') { rf.ms = performance.now() - rf.t0; rf.s = 'result'; if (!rf.best || rf.ms < rf.best) rf.best = rf.ms; api.say(rf.ms < 200 ? '🚀 <b>' + Math.round(rf.ms) + ' ms</b> — foarte rapid!' : rf.ms < 300 ? '✅ <b>' + Math.round(rf.ms) + ' ms</b> — un timp bun. Media oamenilor e ~250 ms.' : '<b>' + Math.round(rf.ms) + ' ms</b>. Încearcă din nou — oboseala îți încetinește reflexele!', 7000); }
          } else {
            if (mem.state === 'idle' || mem.state === 'over') { mem = { seq: [], idx: 0, state: 'idle', flash: -1, flashT: 0, score: 0, best: mem.best, pos: 0 }; memNext(); return; }
            if (mem.state === 'input') for (let i = 0; i < 4; i++) { const r = padRect(i); if (x >= r.x && x <= r.x + r.s && y >= r.y && y <= r.y + r.s) { mem.flash = i; mem.flashT = 0.25; if (mem.seq[mem.idx] === i) { mem.idx++; if (mem.idx >= mem.seq.length) { mem.score = mem.seq.length; mem.best = Math.max(mem.best, mem.score); mem.idx = 0; mem.state = 'wait2'; mem.flashT = 0.7; } } else { mem.state = 'over'; api.say('😮 Ai greșit la pasul ' + (mem.idx + 1) + '! Ai ținut minte <b>' + mem.score + '</b> culori. Apasă pe ecran pentru o rundă nouă.', 8000); } return; } }
          }
        }
      });

      /* ---------- desenul creierului (pre-randat o dată pe mărime) ---------- */
      const i0 = (a, b) => (Math.sin(a * 12.9898 + b * 78.233) * 43758.5453) % 6.28;   // fază pseudo-aleatoare per girus
      function brainOutline(c, bx, by, rx, ry) { c.beginPath(); A.smoothPath(c, OUTLINE.map((p) => [bx + p[0] * rx, by + p[1] * ry]), true); }
      function sulcus(c, pts, bx, by, rx, ry, w) {
        c.beginPath(); A.smoothPath(c, pts.map((p) => [bx + p[0] * rx, by + p[1] * ry]), false);
        c.strokeStyle = 'rgba(105,45,55,0.85)'; c.lineWidth = w; c.stroke();
        c.save(); c.translate(-w * 0.35, -w * 0.35); c.beginPath(); A.smoothPath(c, pts.map((p) => [bx + p[0] * rx, by + p[1] * ry]), false); c.strokeStyle = 'rgba(255,230,225,0.35)'; c.lineWidth = w * 0.35; c.stroke(); c.restore();
      }
      function brainTexture(U) {
        const dpr = api.DPR || window.devicePixelRatio || 1;
        const rx = U * 0.95, ry = U * 0.66, pad = 12;
        const w = rx * 2 + pad * 2, h = ry + U * 0.08 + U * 0.95 + pad * 2;   // de sus până la capătul trunchiului
        const bx = rx + pad, by = ry + pad;                                   // centrul emisferei în textură
        const tex = A.cached('brain-tex-' + Math.round(U) + '-' + dpr, w * dpr, h * dpr, (c) => {
          c.scale(dpr, dpr); c.lineCap = 'round'; c.lineJoin = 'round';
          const oy = by + U * 0.08;                                          // = api.cy în textură
          /* trunchiul cerebral */
          c.beginPath(); c.moveTo(bx + U * 0.02, oy + U * 0.42); c.bezierCurveTo(bx + U * 0.0, oy + U * 0.62, bx + U * 0.07, oy + U * 0.8, bx + U * 0.08, oy + U * 0.94);
          c.lineTo(bx + U * 0.17, oy + U * 0.94); c.bezierCurveTo(bx + U * 0.17, oy + U * 0.78, bx + U * 0.22, oy + U * 0.6, bx + U * 0.22, oy + U * 0.45); c.closePath();
          A.volumeFill(c, bx, 0, bx + U * 0.22, 0, '#d8b2ae', { hi: 0.2, lo: 0.35 }); c.strokeStyle = 'rgba(110,60,65,0.7)'; c.lineWidth = 1.5; c.stroke();
          c.strokeStyle = 'rgba(110,60,65,0.35)'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { const yy = oy + U * (0.5 + i * 0.1); c.beginPath(); c.moveTo(bx + U * 0.05, yy); c.quadraticCurveTo(bx + U * 0.12, yy + U * 0.02, bx + U * 0.2, yy); c.stroke(); }
          /* cerebelul, cu foliile fine */
          const ex = bx + U * 0.5, ey = oy + U * 0.58, erx = U * 0.32, ery = U * 0.24;
          c.beginPath(); c.ellipse(ex, ey, erx, ery, -0.08, 0, TAU);
          const cg = c.createRadialGradient(ex - erx * 0.35, ey - ery * 0.45, 2, ex, ey, erx); cg.addColorStop(0, '#f0c9c4'); cg.addColorStop(0.6, '#d69c9c'); cg.addColorStop(1, '#a8696e');
          c.fillStyle = cg; c.fill(); c.strokeStyle = 'rgba(105,45,55,0.8)'; c.lineWidth = 2; c.stroke();
          c.save(); c.beginPath(); c.ellipse(ex, ey, erx, ery, -0.08, 0, TAU); c.clip();
          for (let i = 1; i < 13; i++) { const yy = ey - ery + i * ery * 2 / 13; c.beginPath(); c.moveTo(ex - erx * 1.05, yy + ery * 0.25); c.quadraticCurveTo(ex, yy - ery * 0.35 + Math.sin(i * 1.7) * 2, ex + erx * 1.05, yy + ery * 0.2); c.strokeStyle = 'rgba(105,45,55,0.5)'; c.lineWidth = 1.3; c.stroke(); c.save(); c.translate(0, -1.5); c.strokeStyle = 'rgba(255,230,225,0.3)'; c.lineWidth = 1; c.stroke(); c.restore(); }
          c.restore();
          /* emisfera: volum */
          brainOutline(c, bx, by, rx, ry);
          const g = c.createRadialGradient(bx - rx * 0.35, by - ry * 0.45, rx * 0.05, bx, by, rx * 1.05);
          g.addColorStop(0, '#f6d6cf'); g.addColorStop(0.55, '#e4aeaa'); g.addColorStop(1, '#b87479');
          c.fillStyle = g; c.fill();
          /* circumvoluțiuni (girusuri): linii de șanț care urmează un câmp de curgere lin */
          c.save(); brainOutline(c, bx, by, rx, ry); c.clip();
          let s = 17; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
          PATHS = [];
          const lw = Math.max(1.4, U * 0.01), step = rx * 0.028, gap = rx * 0.125;
          for (let gy = by - ry; gy < by + ry; gy += gap * 0.8) for (let gx = bx - rx; gx < bx + rx; gx += gap) {
            let x = gx + (rnd() - 0.5) * gap * 0.8, y = gy + (rnd() - 0.5) * gap * 0.6;
            const nx0 = (x - bx) / rx, ny0 = (y - by) / ry; if (nx0 * nx0 + ny0 * ny0 > 0.92) continue;
            const pts = [[x, y]], dir = rnd() < 0.5 ? 1 : -1, len = 7 + Math.floor(rnd() * 8);
            for (let k = 0; k < len; k++) {
              const qx = (x - bx) / rx, qy = (y - by) / ry;
              const a = Math.atan2(qy, qx) + Math.PI / 2 + A.noise2(qx * 2.2 + 5, qy * 2.2 + 2) * 1.5 + Math.sin(k * 0.9 + i0(gx, gy)) * 0.28;
              x += Math.cos(a) * step * dir; y += Math.sin(a) * step * dir; pts.push([x, y]);
            }
            c.beginPath(); A.smoothPath(c, pts, false);
            c.strokeStyle = 'rgba(118,48,58,0.62)'; c.lineWidth = lw; c.stroke();
            c.save(); c.translate(lw * 1.1, lw * 1.1); c.beginPath(); A.smoothPath(c, pts, false); c.strokeStyle = 'rgba(255,238,232,0.45)'; c.lineWidth = lw * 0.7; c.stroke(); c.restore();
            if (rnd() < 0.35) PATHS.push(pts.map((p) => [(p[0] - bx) / rx, (p[1] - by) / ry]));
          }
          /* șanțurile mari */
          sulcus(c, CS, bx, by, rx, ry, Math.max(2.5, U * 0.02));
          sulcus(c, LS, bx, by, rx, ry, Math.max(3, U * 0.026));
          sulcus(c, PO.slice(0, 3), bx, by, rx, ry, Math.max(2, U * 0.014));
          /* umbră pe marginea de jos (volum) */
          const sh = c.createLinearGradient(0, by + ry * 0.2, 0, by + ry); sh.addColorStop(0, 'rgba(80,20,30,0)'); sh.addColorStop(1, 'rgba(80,20,30,0.3)'); c.fillStyle = sh; c.fillRect(bx - rx, by, rx * 2, ry);
          c.restore();
          brainOutline(c, bx, by, rx, ry); c.strokeStyle = 'rgba(100,40,50,0.85)'; c.lineWidth = 2; c.stroke();
        });
        return { tex: tex, w: w, h: h, bx: bx, by: by, rx: rx, ry: ry };
      }
      /* zonele colorate, ușor transparente, peste textură */
      function lobePath(id, X, Y) {
        ctx.beginPath();
        if (id === 'frontal') { ctx.moveTo(X(-1.2), Y(-1.2)); for (const p of CS) ctx.lineTo(X(p[0]), Y(p[1])); for (let i = 2; i >= 0; i--) ctx.lineTo(X(LS[i][0]), Y(LS[i][1])); ctx.lineTo(X(-0.7), Y(0.6)); ctx.lineTo(X(-1.2), Y(0.6)); }
        else if (id === 'temporal') { ctx.moveTo(X(-0.7), Y(0.6)); for (const p of LS) ctx.lineTo(X(p[0]), Y(p[1])); ctx.lineTo(X(0.54), Y(0.08)); ctx.lineTo(X(0.5), Y(1.2)); ctx.lineTo(X(-0.7), Y(1.2)); }
        else if (id === 'occipital') { ctx.moveTo(X(PO[0][0]), Y(PO[0][1])); for (const p of PO) ctx.lineTo(X(p[0]), Y(p[1])); ctx.lineTo(X(1.2), Y(1.2)); ctx.lineTo(X(1.2), Y(-1.2)); }
        else { ctx.rect(X(-1.2), Y(-1.2), X(1.2) - X(-1.2), Y(1.2) - Y(-1.2)); }
        ctx.closePath();
      }

      setMode('zones');
      function frame(dt, t) {
        selT += dt;
        const U = api.unit, cx = api.cx, cy = api.cy;
        A.backdrop(ctx, api.W, api.H, { top: '#161a2e', bottom: '#0b0d18', vignette: false });
        if (mode === 'zones') {
          const by = cy - U * 0.08, rx = U * 0.95, ry = U * 0.66;
          const X = (nx) => cx + nx * rx, Y = (ny) => by + ny * ry;
          const T = brainTexture(U);
          A.groundShadow(ctx, cx + U * 0.1, cy + U * 0.95, U * 0.5, U * 0.05, 0.35);
          ctx.drawImage(T.tex, cx - T.bx, by - T.by, T.w, T.h);
          /* colorarea lobilor (subtilă; lobul atins devine mai intens) */
          const k = A.ease.out(clamp(selT / 0.4, 0, 1));
          ctx.save(); ctx.beginPath(); A.smoothPath(ctx, OUTLINE.map((p) => [X(p[0]), Y(p[1])]), true); ctx.clip();
          for (const id of ['parietal', 'frontal', 'temporal', 'occipital']) {
            lobePath(id, X, Y);
            ctx.fillStyle = A.rgba(REG[id].c, sel === id ? lerp(0.16, 0.42, k) : (sel ? 0.05 : 0.14)); ctx.fill();
          }
          ctx.restore();
          /* cerebel și trunchi: aceeași regulă */
          ctx.save(); ctx.beginPath(); ctx.ellipse(cx + U * 0.5, cy + U * 0.58, U * 0.32, U * 0.24, -0.08, 0, TAU);
          ctx.fillStyle = A.rgba(REG.cerebel.c, sel === 'cerebel' ? lerp(0.16, 0.42, k) : (sel ? 0.05 : 0.14)); ctx.fill();
          ctx.beginPath(); ctx.moveTo(cx + U * 0.02, cy + U * 0.42); ctx.bezierCurveTo(cx, cy + U * 0.62, cx + U * 0.07, cy + U * 0.8, cx + U * 0.08, cy + U * 0.94); ctx.lineTo(cx + U * 0.17, cy + U * 0.94); ctx.bezierCurveTo(cx + U * 0.17, cy + U * 0.78, cx + U * 0.22, cy + U * 0.6, cx + U * 0.22, cy + U * 0.45); ctx.closePath();
          ctx.fillStyle = A.rgba('#7a7a90', sel === 'stem' ? lerp(0.15, 0.45, k) : 0.1); ctx.fill();
          ctx.restore();
          /* semnale nervoase: câteva impulsuri care parcurg girusurile zonei atinse */
          if (sel && PATHS.length) {
            const list = PATHS.filter((pp) => { const m = pp[Math.floor(pp.length / 2)]; return sel === 'cerebel' || sel === 'stem' ? false : regionAt(m[0], m[1]) === sel; }).slice(0, 10);
            ctx.save();
            list.forEach((pp, i) => {
              const u = ((t * 0.45 + i * 0.37) % 1), f = u * (pp.length - 1), j = Math.floor(f), q = f - j, a = pp[j], b = pp[Math.min(pp.length - 1, j + 1)];
              const px = X(lerp(a[0], b[0], q)), py = Y(lerp(a[1], b[1], q)), al = Math.sin(Math.PI * u);
              ctx.globalAlpha = al; ctx.fillStyle = '#ffffff'; ctx.strokeStyle = A.shade(REG[sel].c, -0.4); ctx.lineWidth = 1.5;
              ctx.beginPath(); ctx.arc(px, py, Math.max(2.5, U * 0.012), 0, TAU); ctx.fill(); ctx.stroke();
            });
            ctx.restore();
          }
          /* etichete */
          const fsz = A.fs(U, 0.045, 13);
          const lab = (id, s, x, y) => A.label(ctx, s, x, y, { size: fsz, bg: sel === id ? A.rgba(A.shade(REG[id].c, -0.55), 0.92) : 'rgba(20,16,30,0.72)', border: sel === id ? A.rgba(REG[id].c, 0.9) : 'rgba(255,255,255,0.15)' });
          lab('frontal', 'frontal', cx - rx * 0.6, by - ry * 0.25); lab('parietal', 'parietal', cx + rx * 0.15, by - ry * 0.45); lab('occipital', 'occipital', cx + rx * 0.76, by); lab('temporal', 'temporal', cx - rx * 0.1, by + ry * 0.55); lab('cerebel', 'cerebel', cx + U * 0.5, cy + U * 0.64); lab('stem', 'trunchi', cx + U * 0.12, cy + U * 0.95);
          A.arrow(ctx, Math.max(46, cx - rx * 0.78), by - ry - 6, Math.max(10, cx - rx - 4), by - ry - 6, { color: 'rgba(255,255,255,0.75)', width: 2 });
          A.text(ctx, 'față', Math.max(52, cx - rx * 0.72), by - ry - 6, { size: A.fs(U, 0.038, 12), align: 'left', halo: false, color: 'rgba(255,255,255,0.85)' });
          info.innerHTML = sel ? '<b>' + REG[sel].n + '</b>' : 'Atinge o zonă a creierului.';
        } else if (mode === 'reflex') {
          if (rf.s === 'wait' && (performance.now() - rf.t0) / 1000 > rf.delay) { rf.s = 'go'; rf.t0 = performance.now(); }
          const col = rf.s === 'go' ? '#2fae57' : rf.s === 'wait' ? '#c9443c' : rf.s === 'early' ? '#d39a36' : '#3a5aa8';
          const w = Math.min(api.freeW - 32, U * 2), h = U * 1.2;
          A.roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 24); A.volumeFill(ctx, 0, cy - h / 2, 0, cy + h / 2, col, { hi: 0.12, lo: 0.18 });
          ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; ctx.stroke();
          const txt = { idle: 'Atinge ca să începi', wait: 'Așteaptă verdele…', go: 'ACUM! Atinge!', early: 'Prea devreme! Atinge pentru încă o încercare', result: Math.round(rf.ms) + ' ms · atinge pentru încă o încercare' }[rf.s];
          A.text(ctx, txt, cx, cy, { size: Math.round(clamp(w * 0.06, 18, 34)), weight: 800, halo: false });
          A.text(ctx, rf.best ? 'Cel mai bun timp: ' + Math.round(rf.best) + ' ms' : 'Media oamenilor: ~250 ms', cx, cy + h / 2 - 26, { size: A.fs(U, 0.045, 14), weight: 600, halo: false, color: 'rgba(255,255,255,0.85)' });
          info.innerHTML = 'Semnalul de la ochi la mână: ~0,2 s. Câinii și pisicile reacționează mai repede de 100 ms!';
        } else {
          if (mem.flashT > 0) { mem.flashT -= dt; if (mem.flashT <= 0) { mem.flash = -1; if (mem.state === 'wait2') memNext(); } }
          if (mem.state === 'show') { mem.flashT += 0; if (mem.flashT <= 0 && mem.flash === -1) { if (mem.pos < mem.seq.length) { mem.flash = mem.seq[mem.pos++]; mem.flashT = 0.5; } else { mem.state = 'input'; mem.idx = 0; } } }
          for (let i = 0; i < 4; i++) {
            const r = padRect(i), on = mem.flash === i;
            padLit[i] = A.damp(padLit[i], on ? 1 : 0, on ? 30 : 10, dt);
            const L = padLit[i];
            A.roundRectPath(ctx, r.x, r.y, r.s, r.s, 20);
            A.volumeFill(ctx, r.x, r.y, r.x + r.s * 0.4, r.y + r.s, A.mix(A.shade(PADC[i], -0.45), A.shade(PADC[i], 0.15), L), { hi: 0.12, lo: 0.2 });
            ctx.strokeStyle = L > 0.5 ? '#ffffff' : 'rgba(255,255,255,0.12)'; ctx.lineWidth = L > 0.5 ? 4 : 1.5; ctx.stroke();
          }
          const ty = cy - api.unit * 1.0 - 4 < 90 ? 96 : cy - api.unit * 1.0 - 4;
          A.label(ctx, mem.state === 'idle' ? 'Atinge ecranul ca să începi' : mem.state === 'over' ? 'Joc terminat · atinge ca să reîncepi' : mem.state === 'show' ? 'Uită-te…' : mem.state === 'input' ? 'Acum tu!' : 'Bravo!', cx, ty, { size: A.fs(U, 0.05, 16), weight: 800, bg: 'rgba(10,14,30,0.88)' });
          info.innerHTML = 'Rundă: <b>' + (mem.seq.length || 0) + '</b> · scor: <b>' + mem.score + '</b> · cel mai bun: <b>' + mem.best + '</b>';
        }
      }
      return { frame: frame };
    }
  });
})();
