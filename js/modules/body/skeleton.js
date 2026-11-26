/* Modul: Scheletul — ilustrație anatomică (stil atlas pentru copii) */
(function () {
  const A = window.Art, C = A.C, TAU = A.TAU;
  const clamp = A.clamp, lerp = A.lerp;

  defineModule({
    id: 'skeleton', title: 'Scheletul', sub: '206 oase care ne țin în picioare',
    start: function (api) {
      const ctx = api.ctx;
      let sel = null, quiz = null, score = 0, tries = 0, selT = 0;
      /* oase: tip 'e' (elipsă) sau 's' (segment), coordonate în unități; mirror = apare pe ambele părți
         (geometria e folosită și pentru atingere — desenul de mai jos respectă aceleași zone) */
      const B = [
        { n: 'Craniul', k: 'e', x: 0, y: -0.83, rx: 0.12, ry: 0.14, t: 'Protejează creierul. E format din 22 de oase lipite între ele (la bebeluși ele se sudează abia mai târziu — de-aia au „moalele” capului).' },
        { n: 'Mandibula', k: 'e', x: 0, y: -0.7, rx: 0.07, ry: 0.035, t: 'Singurul os al capului care se mișcă: te ajută să vorbești și să mesteci.' },
        { n: 'Coloana vertebrală', k: 's', x1: 0, y1: -0.67, x2: 0, y2: -0.08, w: 0.025, t: 'Are 33 de oase mici numite vertebre. E flexibilă și îți protejează măduva spinării, prin care trec „firele” spre creier.' },
        { n: 'Coastele', k: 'e', x: 0, y: -0.42, rx: 0.2, ry: 0.19, t: '12 perechi de coaste formează cușca toracică, ce apără inima și plămânii. Se mișcă puțin când respiri.' },
        { n: 'Sternul', k: 's', x1: 0, y1: -0.6, x2: 0, y2: -0.3, w: 0.022, t: 'Osul din mijlocul pieptului, de care se prind coastele.' },
        { n: 'Clavicula', k: 's', x1: -0.2, y1: -0.62, x2: 0.2, y2: -0.62, w: 0.015, t: 'Leagă umărul de stern. E cel mai des fracturat os din corp, mai ales la copii!' },
        { n: 'Humerus', k: 's', x1: -0.22, y1: -0.6, x2: -0.33, y2: -0.28, w: 0.028, mirror: true, t: 'Osul brațului, de la umăr la cot.' },
        { n: 'Radius și ulna', k: 's', x1: -0.33, y1: -0.27, x2: -0.4, y2: 0.04, w: 0.024, mirror: true, t: 'Cele două oase ale antebrațului. Ele se răsucesc una peste alta când întorci palma.' },
        { n: 'Bazinul', k: 'e', x: 0, y: 0.02, rx: 0.2, ry: 0.1, t: 'Susține partea de sus a corpului și ține organele. Se leagă de coapse.' },
        { n: 'Femurul', k: 's', x1: -0.1, y1: 0.07, x2: -0.14, y2: 0.44, w: 0.04, mirror: true, t: 'Osul coapsei: cel mai lung și mai puternic os din corp — cam un sfert din înălțimea ta!' },
        { n: 'Rotula', k: 'e', x: -0.14, y: 0.48, rx: 0.035, ry: 0.035, mirror: true, t: 'Osul rotund din fața genunchiului, care îl apără.' },
        { n: 'Tibia și fibula', k: 's', x1: -0.14, y1: 0.52, x2: -0.14, y2: 0.86, w: 0.03, mirror: true, t: 'Oasele gambei. Tibia e osul gros, cel pe care îl simți în față, sub genunchi.' }
      ];
      /* mâna și laba piciorului, cu fiecare os: încheietură, palmă/talpă, degete */
      (function () {
        const D = Math.PI / 180, fan = (x, y, ang, lens, n, w, w2) => { let cx = x, cy = y; const out = []; lens.forEach((L) => { out.push({ n: n, k: 's', x1: cx, y1: cy, x2: cx + Math.sin(ang * D) * L, y2: cy + Math.cos(ang * D) * L, w: w, mirror: true, t: w2, small: true }); cx += Math.sin(ang * D) * L; cy += Math.cos(ang * D) * L; }); return out; };
        const TC = 'Încheietura mâinii are 8 oase mici (carpiene), așezate în două rânduri. Ele fac mâna atât de mobilă.';
        const TM = 'Cele 5 oase ale palmei (metacarpiene), câte unul pentru fiecare deget.';
        const TF = 'Fiecare deget are 3 falange, iar degetul mare doar 2: în total 14 oase în degetele unei mâini. Ele îți dau precizie la scris, la desenat și la prins.';
        B.push({ n: 'Carpiene (încheietura)', k: 'e', x: -0.405, y: 0.085, rx: 0.035, ry: 0.022, mirror: true, t: TC });
        const hx = -0.405, hy = 0.1;
        [[-38, 0.035, [0.026, 0.02]], [-14, 0.062, [0.03, 0.02, 0.015]], [-2, 0.066, [0.034, 0.022, 0.016]], [10, 0.06, [0.03, 0.02, 0.015]], [24, 0.052, [0.024, 0.016, 0.013]]].forEach(([a, mc, ph]) => {
          fan(hx, hy, a, [mc], 'Metacarpiene (palma)', 0.008, TM).forEach((b) => B.push(b));
          const bx = hx + Math.sin(a * D) * mc, by = hy + Math.cos(a * D) * mc;
          fan(bx, by, a * 0.8, ph, 'Falangele mâinii (degetele)', 0.0065, TF).forEach((b) => B.push(b));
        });
        const TT = 'Laba are 7 oase tarsiene. Cel mai mare e calcaneul, osul călcâiului, care duce greutatea corpului.';
        const TMT = 'Cele 5 oase lungi din mijlocul labei (metatarsiene) formează bolta piciorului.';
        const TFT = 'Degetele piciorului au 14 oase, ca la mână, dar mai scurte. Degetul mare te ajută să te împingi când mergi.';
        B.push({ n: 'Tarsiene (laba, călcâiul)', k: 'e', x: -0.14, y: 0.925, rx: 0.045, ry: 0.032, mirror: true, t: TT });
        [[0.045, 0.034, [0.03, 0.022]], [0.022, 0.044, [0.015, 0.011, 0.008]], [0.0, 0.046, [0.014, 0.01, 0.008]], [-0.02, 0.042, [0.013, 0.009, 0.008]], [-0.04, 0.038, [0.012, 0.009, 0.007]]].forEach(([dx, mt, ph]) => {
          const x0 = -0.14 - 0.0, y0 = 0.945, x1 = -0.14 + dx, y1 = y0 + mt;
          B.push({ n: 'Metatarsiene (talpa)', k: 's', x1: x0 + dx * 0.25, y1: y0, x2: x1, y2: y1, w: 0.009, mirror: true, t: TMT, small: true });
          let cx = x1, cy = y1; ph.forEach((L) => { B.push({ n: 'Falangele piciorului (degetele)', k: 's', x1: cx, y1: cy, x2: cx + dx * 0.15, y2: cy + L, w: 0.007, mirror: true, t: TFT, small: true }); cx += dx * 0.15; cy += L; });
        });
      })();
      const r1 = api.row('');
      const bQ = api.button(r1, '🎯 Joc: găsește osul', () => { quiz = quiz ? null : pick(); bQ.classList.toggle('on', !!quiz); score = tries = 0; if (quiz) api.say('Atinge osul numit! Începe: <b>' + quiz.n + '</b>', 6000); else api.say('Joc oprit. Atinge un os ca să afli despre el.', 4000); });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      api.say('Un adult are <b>206 oase</b>; un nou-născut are ~300, dintre care multe se sudează pe parcurs. Cel mai mic os, <b>scărița</b> din ureche, are 3 mm. Atinge un os!', 12000);
      const pick = () => { const u = B.filter((b, i) => B.findIndex((c) => c.n === b.n) === i); return u[Math.floor(Math.random() * u.length)]; };
      function hit(x, y) {
        const U = api.unit * 0.88, cx = api.cx, cy = api.cy - api.unit * 0.04; let best = null, bd = 1e9;
        for (const b of B) for (const sg of b.mirror ? [-1, 1] : [1]) {
          let d;
          if (b.k === 'e') { const dx = (x - (cx + sg * b.x * U)) / (b.rx * U + 8), dy = (y - (cy + b.y * U)) / (b.ry * U + 8); d = Math.hypot(dx, dy) - 1; }
          else { const ax = cx + sg * b.x1 * U, ay = cy + b.y1 * U, bx = cx + sg * b.x2 * U, by = cy + b.y2 * U, px = bx - ax, py = by - ay, tt = clamp(((x - ax) * px + (y - ay) * py) / (px * px + py * py), 0, 1); d = (Math.hypot(x - (ax + px * tt), y - (ay + py * tt)) - (b.w * U + 9)) / 40; }
          if (d < 0 && d < bd) { bd = d; best = b; }
        }
        return best;
      }
      api.pointer({ down: (x, y) => { const b = hit(x, y); if (!b) return; if (sel !== b) selT = 0; sel = b; if (quiz) { tries++; if (b.n === quiz.n) { score++; api.say('✅ <b>Corect!</b> ' + b.n + '. ' + b.t, 6000); quiz = pick(); setTimeout(() => api.say('Acum: <b>' + quiz.n + '</b>', 3000), 2500); } else api.say('❌ Asta e <b>' + b.n + '</b>. Încearcă din nou: <b>' + quiz.n + '</b>', 4000); } else api.say('<b>' + b.n + '.</b> ' + b.t, 14000); } });

      /* ---------- ajutoare de desen pentru oase ---------- */
      const OUT = A.ink(C.boneShade), OUT_ON = '#d98a10';
      let ON = false;
      function boneFill(x0, y0, x1, y1) {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        if (ON) { g.addColorStop(0, '#fff7d6'); g.addColorStop(0.45, '#ffe08a'); g.addColorStop(1, '#d9a23a'); }
        else { g.addColorStop(0, '#fffaf0'); g.addColorStop(0.45, C.bone); g.addColorStop(1, C.boneShade); }
        return g;
      }
      /* desenează subdrumurile din fn() ca o singură formă: contur, umplere cu volum */
      function solid(fn, gx0, gy0, gx1, gy1, lw) {
        ctx.save(); ctx.lineJoin = 'round';
        ctx.beginPath(); fn(); ctx.strokeStyle = ON ? OUT_ON : OUT; ctx.lineWidth = (lw || 2.2) * A.lineW(api.unit) / 2 * (ON ? 1.8 : 1); ctx.stroke();
        ctx.beginPath(); fn(); ctx.fillStyle = boneFill(gx0, gy0, gx1, gy1); ctx.fill();
        ctx.restore();
      }
      /* os lung: diafiză cu „talie” și epifize îngroșate (capete cu doi condili) */
      function longBone(ax, ay, bx, by, w, o) {
        o = o || {}; const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, ux = dx / L, uy = dy / L;
        const ka = o.ka === undefined ? 1 : o.ka, kb = o.kb === undefined ? 1 : o.kb, waist = o.waist || 0.72;
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const fn = () => {
          ctx.moveTo(ax + nx * w, ay + ny * w); ctx.quadraticCurveTo(mx + nx * w * waist * 1.0, my + ny * w * waist, bx + nx * w, by + ny * w);
          ctx.lineTo(bx - nx * w, by - ny * w); ctx.quadraticCurveTo(mx - nx * w * waist, my - ny * w * waist, ax - nx * w, ay - ny * w); ctx.closePath();
          for (const [px, py, k, dir] of [[ax, ay, ka, -1], [bx, by, kb, 1]]) {
            if (k <= 0) continue; const r = w * 0.78 * k, cx0 = px + ux * dir * w * 0.25, cy0 = py + uy * dir * w * 0.25;
            for (const sd of [-1, 1]) { const qx = cx0 + nx * sd * w * 0.55, qy = cy0 + ny * sd * w * 0.55; ctx.moveTo(qx + r, qy); ctx.arc(qx, qy, r, 0, TAU); }
          }
        };
        const lsd = (nx * -1 + ny * -1) > 0 ? 1 : -1;   // partea luminată (stânga-sus)
        solid(fn, mx + nx * lsd * w * 1.4, my + ny * lsd * w * 1.4, mx - nx * lsd * w * 1.4, my - ny * lsd * w * 1.4, o.lw);
        /* luciu de-a lungul diafizei */
        if (w > 3) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1, w * 0.22); ctx.beginPath(); ctx.moveTo(ax + ux * w * 1.3 + nx * lsd * w * 0.45, ay + uy * w * 1.3 + ny * lsd * w * 0.45); ctx.quadraticCurveTo(mx + nx * lsd * w * 0.35, my + ny * lsd * w * 0.35, bx - ux * w * 1.3 + nx * lsd * w * 0.45, by - uy * w * 1.3 + ny * lsd * w * 0.45); ctx.stroke(); ctx.restore(); }
      }
      function pebbles(cx0, cy0, rx, ry, list) {
        solid(() => { for (const [ox, oy, r] of list) { const px = cx0 + ox * rx, py = cy0 + oy * ry, rr = r * Math.min(rx, ry); ctx.moveTo(px + rr, py); ctx.ellipse(px, py, rr * 1.1, rr * 0.9, 0.3, 0, TAU); } }, cx0 - rx, cy0 - ry, cx0 + rx, cy0 + ry, 1.6);
      }

      /* ---------- silueta corpului (fundal, pre-randată) ---------- */
      function silhouette(U, cx, cy) {
        const W = Math.round(api.freeW), H = Math.round(api.H);
        const tex = A.cached('skel-sil-' + Math.round(U) + '-' + Math.round(cx) + '-' + Math.round(cy), W, H, (c) => {
          const P = (x, y) => [cx + x * U, cy + y * U];
          c.fillStyle = '#ffffff'; c.strokeStyle = '#ffffff'; c.lineCap = 'round'; c.lineJoin = 'round';
          c.beginPath(); c.ellipse(cx, cy - 0.81 * U, 0.165 * U, 0.19 * U, 0, 0, TAU); c.fill();
          const torso = [P(-0.07, -0.66), P(-0.25, -0.64), P(-0.3, -0.56), P(-0.25, -0.3), P(-0.19, -0.12), P(-0.25, 0.08), P(-0.2, 0.16), P(0.2, 0.16), P(0.25, 0.08), P(0.19, -0.12), P(0.25, -0.3), P(0.3, -0.56), P(0.25, -0.64), P(0.07, -0.66)];
          c.beginPath(); c.moveTo(torso[0][0], torso[0][1]); for (let i = 1; i < torso.length; i++) { const p = torso[i - 1], q = torso[i]; c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } c.closePath(); c.fill();
          c.lineWidth = 0.14 * U; c.beginPath(); c.moveTo(cx, cy - 0.72 * U); c.lineTo(cx, cy - 0.6 * U); c.stroke();
          for (const sg of [-1, 1]) {
            c.lineWidth = 0.13 * U; c.beginPath(); c.moveTo(cx + sg * 0.24 * U, cy - 0.58 * U); c.lineTo(cx + sg * 0.33 * U, cy - 0.28 * U); c.stroke();
            c.lineWidth = 0.1 * U; c.beginPath(); c.moveTo(cx + sg * 0.33 * U, cy - 0.28 * U); c.lineTo(cx + sg * 0.4 * U, cy + 0.05 * U); c.stroke();
            c.beginPath(); c.ellipse(cx + sg * 0.415 * U, cy + 0.15 * U, 0.06 * U, 0.09 * U, sg * -0.15, 0, TAU); c.fill();
            c.lineWidth = 0.17 * U; c.beginPath(); c.moveTo(cx + sg * 0.11 * U, cy + 0.08 * U); c.lineTo(cx + sg * 0.14 * U, cy + 0.48 * U); c.stroke();
            c.lineWidth = 0.12 * U; c.beginPath(); c.moveTo(cx + sg * 0.14 * U, cy + 0.48 * U); c.lineTo(cx + sg * 0.14 * U, cy + 0.9 * U); c.stroke();
            c.beginPath(); c.ellipse(cx + sg * 0.14 * U, cy + 0.97 * U, 0.06 * U, 0.06 * U, 0, 0, TAU); c.fill();
          }
          /* colorare: gradient albăstrui ca o radiografie, cu margine luminoasă */
          c.globalCompositeOperation = 'source-in';
          const g = c.createLinearGradient(0, cy - U, 0, cy + U); g.addColorStop(0, '#7fb2ff'); g.addColorStop(1, '#3c5fb8');
          c.fillStyle = g; c.fillRect(0, 0, W, H);
        });
        ctx.save(); ctx.globalAlpha = 0.16; ctx.drawImage(tex, 0, 0); ctx.restore();
      }

      /* ---------- oasele speciale ---------- */
      function skull(x, y, rx, ry) {
        const P = (a, b) => [x + a * rx, y + b * ry];
        const crown = [P(0, -1), P(0.72, -0.82), P(1, -0.25), P(0.95, 0.25), P(0.78, 0.55), P(0.55, 0.85), P(0.3, 0.98), P(-0.3, 0.98), P(-0.55, 0.85), P(-0.78, 0.55), P(-0.95, 0.25), P(-1, -0.25), P(-0.72, -0.82)];
        solid(() => { A.smoothPath(ctx, crown, true); }, x - rx, y - ry, x + rx * 0.6, y + ry, 2.4);
        ctx.save();
        const sh = ctx.createRadialGradient(x - rx * 0.35, y - ry * 0.55, 1, x - rx * 0.3, y - ry * 0.45, rx * 0.7); sh.addColorStop(0, 'rgba(255,255,255,0.6)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.beginPath(); A.smoothPath(ctx, crown, true); ctx.fill();
        /* sutură */
        ctx.strokeStyle = 'rgba(110,95,70,0.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - rx * 0.62, y - ry * 0.55);
        for (let i = 1; i <= 10; i++) ctx.lineTo(x + lerp(-0.62, 0.62, i / 10) * rx, y - ry * (0.62 + 0.18 * Math.sin(i / 10 * Math.PI)) + (i % 2 ? 1 : -1));
        ctx.stroke();
        /* orbitele */
        for (const sd of [-1, 1]) {
          const ox = x + sd * rx * 0.4, oy = y + ry * 0.08;
          A.roundRectPath(ctx, ox - rx * 0.26, oy - ry * 0.18, rx * 0.52, ry * 0.38, rx * 0.2);
          const g = ctx.createRadialGradient(ox + sd * rx * 0.04, oy + ry * 0.04, 1, ox, oy, rx * 0.3); g.addColorStop(0, '#231b1a'); g.addColorStop(0.7, '#43362f'); g.addColorStop(1, '#8a7a60'); ctx.fillStyle = g; ctx.fill();
          ctx.strokeStyle = 'rgba(110,95,70,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
        }
        /* cavitatea nazală */
        ctx.beginPath(); ctx.moveTo(x, y + ry * 0.3); ctx.quadraticCurveTo(x - rx * 0.18, y + ry * 0.55, x - rx * 0.1, y + ry * 0.62); ctx.lineTo(x + rx * 0.1, y + ry * 0.62); ctx.quadraticCurveTo(x + rx * 0.18, y + ry * 0.55, x, y + ry * 0.3); ctx.fillStyle = '#2a2028'; ctx.fill();
        /* pomeții */
        ctx.strokeStyle = 'rgba(110,95,70,0.4)'; ctx.lineWidth = 1.4;
        for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sd * rx * 0.75, y + ry * 0.3); ctx.quadraticCurveTo(x + sd * rx * 0.55, y + ry * 0.55, x + sd * rx * 0.3, y + ry * 0.5); ctx.stroke(); }
        /* dinții de sus */
        const ty = y + ry * 0.82; ctx.fillStyle = ON ? '#fffbe8' : '#fbf7ee'; ctx.strokeStyle = 'rgba(110,95,70,0.65)'; ctx.lineWidth = 1;
        for (let i = -3; i <= 3; i++) { const w = rx * 0.11; A.roundRectPath(ctx, x + i * w * 1.05 - w / 2, ty - ry * 0.06, w, ry * 0.15, w * 0.3); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      }
      function mandible(x, y, rx, ry) {
        const fn = () => { ctx.moveTo(x - rx * 1.25, y - ry * 1.4); ctx.quadraticCurveTo(x - rx * 1.2, y + ry * 1.3, x, y + ry * 1.25); ctx.quadraticCurveTo(x + rx * 1.2, y + ry * 1.3, x + rx * 1.25, y - ry * 1.4); ctx.lineTo(x + rx * 0.95, y - ry * 1.2); ctx.quadraticCurveTo(x + rx * 0.85, y + ry * 0.2, x, y + ry * 0.15); ctx.quadraticCurveTo(x - rx * 0.85, y + ry * 0.2, x - rx * 0.95, y - ry * 1.2); ctx.closePath(); };
        solid(fn, x - rx, y - ry, x + rx, y + ry * 1.3, 2);
        ctx.save(); ctx.fillStyle = ON ? '#fffbe8' : '#fbf7ee'; ctx.strokeStyle = 'rgba(110,95,70,0.65)'; ctx.lineWidth = 1;
        for (let i = -3; i <= 3; i++) { const w = rx * 0.19, tx = x + i * w * 1.02, ty = y - ry * 0.2 + Math.abs(i) * ry * 0.08; A.roundRectPath(ctx, tx - w / 2, ty - ry * 0.4, w, ry * 0.5, w * 0.3); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      }
      function spine(x, y1, y2, w) {
        const n = 17, step = (y2 - y1) / n;
        /* discuri intervertebrale */
        ctx.save(); ctx.fillStyle = 'rgba(150,180,210,0.55)'; ctx.fillRect(x - w * 0.55, y1, w * 1.1, y2 - y1); ctx.restore();
        for (let i = 0; i < n; i++) {
          const yy = y1 + i * step + step * 0.12, h = step * 0.76, ww = w * (0.85 + 0.35 * i / n);
          solid(() => { A.roundRectPath(ctx, x - ww, yy, ww * 2, h, h * 0.35); ctx.moveTo(x - ww * 1.55 + h * 0.3, yy + h * 0.5); ctx.ellipse(x - ww * 1.25, yy + h * 0.45, ww * 0.42, h * 0.28, 0, 0, TAU); ctx.moveTo(x + ww * 1.67, yy + h * 0.45); ctx.ellipse(x + ww * 1.25, yy + h * 0.45, ww * 0.42, h * 0.28, 0, 0, TAU); }, x - ww, yy, x + ww, yy + h, 1.4);
        }
      }
      function ribcage(x, y, rx, ry, U) {
        const fn = (sg) => () => {
          for (let i = 0; i < 9; i++) {
            const yy = y - ry * 0.86 + i * ry * 0.19, w = rx * (0.62 + 0.38 * Math.sin(Math.min(1, (i + 2) / 7) * Math.PI / 2)) * (i > 6 ? 0.92 : 1);
            const th = Math.max(2, U * 0.011) * (1 - i * 0.04);
            const p0 = [x + sg * rx * 0.09, yy], p1 = [x + sg * w * 0.75, yy - ry * 0.13], p2 = [x + sg * w * 1.05, yy + ry * 0.12], p3 = [x + sg * w * 0.9, yy + ry * 0.42];
            ctx.moveTo(p0[0], p0[1] - th); ctx.bezierCurveTo(p1[0], p1[1] - th, p2[0] + sg * th, p2[1], p3[0] + sg * th * 0.5, p3[1]);
            ctx.lineTo(p3[0] - sg * th * 0.5, p3[1]); ctx.bezierCurveTo(p2[0] - sg * th, p2[1], p1[0], p1[1] + th, p0[0], p0[1] + th); ctx.closePath();
          }
        };
        for (const sg of [-1, 1]) solid(fn(sg), x - sg * rx * 0.2, y - ry, x + sg * rx, y + ry, 1.6);
        /* cartilaje costale (albăstrui) spre stern */
        ctx.save(); ctx.strokeStyle = ON ? 'rgba(255,230,170,0.8)' : 'rgba(190,215,235,0.75)'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(2, U * 0.012);
        for (let i = 0; i < 7; i++) { const yy = y - ry * 0.86 + i * ry * 0.19; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sg * rx * 0.04, yy + ry * 0.02); ctx.lineTo(x + sg * rx * 0.14, yy); ctx.stroke(); } }
        ctx.restore();
      }
      function sternum(x, y1, y2, w) {
        const fn = () => { ctx.moveTo(x - w * 1.3, y1); ctx.quadraticCurveTo(x, y1 - w * 0.8, x + w * 1.3, y1); ctx.lineTo(x + w * 0.9, y1 + (y2 - y1) * 0.25); ctx.lineTo(x + w, y2 - (y2 - y1) * 0.15); ctx.quadraticCurveTo(x, y2 + w * 1.2, x - w, y2 - (y2 - y1) * 0.15); ctx.lineTo(x - w * 0.9, y1 + (y2 - y1) * 0.25); ctx.closePath(); };
        solid(fn, x - w, y1, x + w, y2, 1.8);
      }
      function clavicle(x1, y1, x2, y2, w) {
        for (const [a, b] of [[x1, (x1 + x2) / 2], [x2, (x1 + x2) / 2]]) {
          const sd = Math.sign(a - b), L = Math.abs(a - b), mx = (a + b) / 2;
          const fn = () => { ctx.moveTo(b + sd * L * 0.08, y1 - w); ctx.bezierCurveTo(mx - sd * L * 0.1, y1 - w * 2.2, mx + sd * L * 0.2, y1 + w * 0.6, a, y1 - w * 1.4); ctx.arc(a, y1 - w * 0.3, w * 1.15, -Math.PI / 2, Math.PI / 2, sd < 0); ctx.bezierCurveTo(mx + sd * L * 0.2, y1 + w * 2.4, mx - sd * L * 0.1, y1, b + sd * L * 0.08, y1 + w * 1.1); ctx.arc(b + sd * L * 0.08, y1, w * 1.1, Math.PI / 2, -Math.PI / 2, sd > 0); ctx.closePath(); };
          solid(fn, mx, y1 - w * 2, mx, y1 + w * 2, 1.8);
        }
      }
      function pelvis(x, y, rx, ry) {
        const fn = () => {
          for (const sg of [-1, 1]) {
            /* aripa iliacă + ramura pubiană, cu orificiul obturator */
            ctx.moveTo(x + sg * rx * 0.18, y - ry * 0.6);
            ctx.bezierCurveTo(x + sg * rx * 0.45, y - ry * 1.5, x + sg * rx * 1.05, y - ry * 1.35, x + sg * rx * 1.0, y - ry * 0.55);
            ctx.bezierCurveTo(x + sg * rx * 0.95, y - ry * 0.05, x + sg * rx * 0.72, y + ry * 0.25, x + sg * rx * 0.62, y + ry * 0.55);
            ctx.bezierCurveTo(x + sg * rx * 0.6, y + ry * 1.05, x + sg * rx * 0.25, y + ry * 1.25, x + sg * rx * 0.06, y + ry * 1.05);
            ctx.lineTo(x + sg * rx * 0.06, y + ry * 0.55);
            ctx.bezierCurveTo(x + sg * rx * 0.2, y + ry * 0.35, x + sg * rx * 0.25, y - ry * 0.1, x + sg * rx * 0.18, y - ry * 0.6); ctx.closePath();
          }
          /* sacrul */
          ctx.moveTo(x - rx * 0.2, y - ry * 0.75); ctx.lineTo(x + rx * 0.2, y - ry * 0.75); ctx.quadraticCurveTo(x + rx * 0.16, y + ry * 0.4, x, y + ry * 0.65); ctx.quadraticCurveTo(x - rx * 0.16, y + ry * 0.4, x - rx * 0.2, y - ry * 0.75); ctx.closePath();
        };
        solid(fn, x - rx, y - ry, x + rx * 0.4, y + ry, 2);
        ctx.save(); ctx.fillStyle = 'rgba(30,25,35,0.75)';
        for (const sg of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sg * rx * 0.34, y + ry * 0.72, rx * 0.12, ry * 0.28, sg * 0.4, 0, TAU); ctx.fill(); }
        ctx.fillStyle = 'rgba(110,95,70,0.4)'; for (let i = 0; i < 4; i++) for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(x + sg * rx * 0.07, y - ry * 0.45 + i * ry * 0.27, Math.max(1.2, rx * 0.025), 0, TAU); ctx.fill(); }
        ctx.restore();
      }

      function frame(dt, t) {
        selT += dt;
        const U = api.unit * 0.88, cx = api.cx, cy = api.cy - api.unit * 0.04;
        A.scene(ctx, api.W, api.H, 'body');
        silhouette(U, cx, cy);
        A.groundShadow(ctx, cx, cy + 1.02 * U, U * 0.32, U * 0.05, 0.5);
        const appear = A.ease.back(clamp(selT / 0.35, 0, 1));
        let selAnchor = null;
        for (const b of B) for (const sg of b.mirror ? [-1, 1] : [1]) {
          ON = !!(sel && sel.n === b.n);
          ctx.save();
          if (b.k === 'e') {
            const x = cx + sg * b.x * U, y = cy + b.y * U, rx = b.rx * U, ry = b.ry * U;
            if (ON) { ctx.translate(x, y); ctx.scale(lerp(1.12, 1, appear), lerp(1.12, 1, appear)); ctx.translate(-x, -y); if (!selAnchor) selAnchor = [x, y]; }
            if (b.n === 'Craniul') skull(x, y, rx, ry);
            else if (b.n === 'Mandibula') mandible(x, y, rx, ry);
            else if (b.n === 'Coastele') ribcage(x, y, rx, ry, U);
            else if (b.n === 'Bazinul') pelvis(x, y, rx, ry);
            else if (b.n === 'Rotula') { solid(() => { ctx.moveTo(x + rx * 0.8, y - ry * 0.3); ctx.quadraticCurveTo(x, y - ry * 1.1, x - rx * 0.8, y - ry * 0.3); ctx.quadraticCurveTo(x - rx * 0.6, y + ry * 0.9, x, y + ry * 0.95); ctx.quadraticCurveTo(x + rx * 0.6, y + ry * 0.9, x + rx * 0.8, y - ry * 0.3); ctx.closePath(); }, x - rx, y - ry, x + rx, y + ry, 1.8); }
            else if (b.n.indexOf('Carpiene') === 0) pebbles(x, y, rx, ry, [[-0.6, -0.35, 0.45], [-0.05, -0.45, 0.45], [0.5, -0.4, 0.42], [0.85, 0.1, 0.38], [-0.7, 0.4, 0.42], [-0.2, 0.35, 0.42], [0.3, 0.4, 0.42], [0.75, 0.6, 0.32]]);
            else pebbles(x, y, rx, ry, [[-0.1, -0.6, 0.7], [-0.05, 0.25, 0.75], [0.55, 0.45, 0.45], [-0.55, 0.55, 0.4], [0.05, 0.85, 0.4], [0.5, -0.05, 0.4]]);
          } else {
            const ax = cx + sg * b.x1 * U, ay = cy + b.y1 * U, bx = cx + sg * b.x2 * U, by = cy + b.y2 * U, w = b.w * U;
            if (ON && !selAnchor) selAnchor = [(ax + bx) / 2, (ay + by) / 2];
            if (ON) { const mx = (ax + bx) / 2, my = (ay + by) / 2, k = lerp(1.1, 1, appear); ctx.translate(mx, my); ctx.scale(k, k); ctx.translate(-mx, -my); }
            if (b.n === 'Coloana vertebrală') spine(ax, ay, by, w);
            else if (b.n === 'Sternul') sternum(ax, ay, by, w);
            else if (b.n === 'Clavicula') clavicle(ax, ay, bx, by, w);
            else if (b.n === 'Radius și ulna') { const L = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / L, ny = (bx - ax) / L, o = w * 0.5; longBone(ax + nx * o, ay + ny * o, bx + nx * o * 1.3, by + ny * o * 1.3, w * 0.42, { ka: 1.2, kb: 0.8 }); longBone(ax - nx * o, ay - ny * o, bx - nx * o * 0.8, by - ny * o * 0.8, w * 0.48, { ka: 0.9, kb: 1.1 }); }
            else if (b.n === 'Tibia și fibula') { const med = -sg; longBone(ax + med * w * 0.3, ay, bx + med * w * 0.25, by, w * 0.72, { ka: 1.25, kb: 1 }); longBone(ax - med * w * 0.75, ay + w * 0.6, bx - med * w * 0.6, by - w * 0.2, w * 0.3, { ka: 1.1, kb: 1.2, waist: 0.85 }); }
            else if (b.n === 'Femurul') { longBone(ax, ay, bx, by, w * 0.62, { ka: 1.1, kb: 1.3, waist: 0.8 }); const hx = ax - sg * w * 0.55, hy = ay - w * 0.35; solid(() => { ctx.moveTo(ax - sg * w * 0.12 + w * 0.42, ay + w * 0.12); ctx.ellipse(ax - sg * w * 0.12, ay + w * 0.12, w * 0.42, w * 0.6, -sg * 0.7, 0, TAU); ctx.moveTo(hx + w * 0.55, hy); ctx.arc(hx, hy, w * 0.55, 0, TAU); }, hx - w, hy - w, hx + w, hy + w, 1.8); }
            else if (b.small) longBone(ax, ay, bx, by, Math.max(1.6, w), { ka: 0.9, kb: 0.9, waist: 0.75, lw: 1.3 });
            else longBone(ax, ay, bx, by, w * 0.6, { ka: 1.25, kb: 1.2 });
          }
          ctx.restore();
        }
        ON = false;
        /* evidențiere: etichetă cu linie spre osul atins */
        if (sel && selAnchor) {
          const lx = selAnchor[0] < cx ? Math.max(14, cx - 0.95 * U) : Math.min(api.freeW - 14, cx + 0.95 * U);
          const ly = clamp(selAnchor[1], cy - U + 20, cy + U - 20);
          ctx.save(); ctx.globalAlpha = clamp(selT / 0.25, 0, 1);
          A.label(ctx, sel.n, lx, ly, { size: A.labelSize(api.unit), align: selAnchor[0] < cx ? 'left' : 'right', tx: selAnchor[0], ty: selAnchor[1], bg: A.LABEL_BG, border: 'rgba(255,200,80,0.6)', color: '#ffe7a3', lineColor: 'rgba(255,200,80,0.85)' });
          ctx.restore();
        }
        info.innerHTML = quiz ? '🎯 Găsește: <b>' + quiz.n + '</b> · scor: <b>' + score + '/' + tries + '</b>' : 'Atinge un os ca să afli cum se numește.';
      }
      return { frame: frame };
    }
  });
})();
