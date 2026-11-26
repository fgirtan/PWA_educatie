/* Modul: Scheletul */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
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

  /* ============================================================
     3) SCHELETUL
     ============================================================ */
  defineModule({
    id: 'skeleton', title: 'Scheletul', sub: '206 oase care ne țin în picioare',
    start: function (api) {
      const ctx = api.ctx;
      let sel = null, quiz = null, score = 0, tries = 0;
      /* oase: tip 'e' (elipsă) sau 's' (segment), coordonate în unități; mirror = apare pe ambele părți */
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
        const D = Math.PI / 180, fan = (x, y, ang, lens, n, w, w2) => { let cx = x, cy = y; const out = []; lens.forEach((L) => { out.push({ n: n, k: 's', x1: cx, y1: cy, x2: cx + Math.sin(ang * D) * L, y2: cy + Math.cos(ang * D) * L, w: w, mirror: true, t: w2 }); cx += Math.sin(ang * D) * L; cy += Math.cos(ang * D) * L; }); return out; };
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
          B.push({ n: 'Metatarsiene (talpa)', k: 's', x1: x0 + dx * 0.25, y1: y0, x2: x1, y2: y1, w: 0.009, mirror: true, t: TMT });
          let cx = x1, cy = y1; ph.forEach((L) => { B.push({ n: 'Falangele piciorului (degetele)', k: 's', x1: cx, y1: cy, x2: cx + dx * 0.15, y2: cy + L, w: 0.007, mirror: true, t: TFT }); cx += dx * 0.15; cy += L; });
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
      api.pointer({ down: (x, y) => { const b = hit(x, y); if (!b) return; sel = b; if (quiz) { tries++; if (b.n === quiz.n) { score++; api.say('✅ <b>Corect!</b> ' + b.n + '. ' + b.t, 6000); quiz = pick(); setTimeout(() => api.say('Acum: <b>' + quiz.n + '</b>', 3000), 2500); } else api.say('❌ Asta e <b>' + b.n + '</b>. Încearcă din nou: <b>' + quiz.n + '</b>', 4000); } else api.say('<b>' + b.n + '.</b> ' + b.t, 14000); } });
      function frame(dt, t) {
        bg(api, '#10162b', '#05080f');
        const U = api.unit * 0.88, cx = api.cx, cy = api.cy - api.unit * 0.04;
        ctx.lineCap = 'round';
        const style = (b) => { const on = sel && sel.n === b.n; ctx.fillStyle = on ? '#ffe9a0' : '#ece6d6'; ctx.strokeStyle = on ? '#ffb020' : '#7a7260'; ctx.lineWidth = on ? 3 : 1.5; };
        for (const b of B) for (const sg of b.mirror ? [-1, 1] : [1]) {
          style(b);
          if (b.k === 'e') { ctx.beginPath(); ctx.ellipse(cx + sg * b.x * U, cy + b.y * U, b.rx * U, b.ry * U, 0, 0, 7); ctx.fill(); ctx.stroke(); }
          else { ctx.strokeStyle = sel && sel.n === b.n ? '#ffb020' : '#7a7260'; ctx.lineWidth = b.w * U * 2 + 3; ctx.beginPath(); ctx.moveTo(cx + sg * b.x1 * U, cy + b.y1 * U); ctx.lineTo(cx + sg * b.x2 * U, cy + b.y2 * U); ctx.stroke(); ctx.strokeStyle = sel && sel.n === b.n ? '#ffe9a0' : '#ece6d6'; ctx.lineWidth = b.w * U * 2; ctx.stroke(); }
        }
        /* detalii: coaste (arcuri) și vertebre */
        ctx.strokeStyle = '#7a7260'; ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) for (const sg of [-1, 1]) { const yy = cy + (-0.58 + i * 0.065) * U; ctx.beginPath(); ctx.moveTo(cx + sg * 0.02 * U, yy); ctx.quadraticCurveTo(cx + sg * 0.2 * U, yy - 0.02 * U, cx + sg * 0.17 * U, yy + 0.1 * U); ctx.stroke(); }
        ctx.fillStyle = '#7a7260'; for (let i = 0; i < 18; i++) ctx.fillRect(cx - 5, cy + (-0.66 + i * 0.033) * U, 10, 2);
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(cx - 0.045 * U, cy - 0.85 * U, 0.025 * U, 0, 7); ctx.arc(cx + 0.045 * U, cy - 0.85 * U, 0.025 * U, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '700 14px system-ui,sans-serif'; ctx.textAlign = 'left';
        if (sel) { ctx.fillStyle = '#ffd166'; ctx.fillText(sel.n, 14, api.cy - U + 22); }
        info.innerHTML = quiz ? '🎯 Găsește: <b>' + quiz.n + '</b> · scor: <b>' + score + '/' + tries + '</b>' : 'Atinge un os ca să afli cum se numește.';
      }
      return { frame: frame };
    }
  });
})();
