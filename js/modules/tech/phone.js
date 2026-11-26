/* Modul: Telefonul mobil */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y, x + r, y); ctx.closePath(); }

  /* ============================================================
     1) TELEFONUL MOBIL
     ============================================================ */
  defineModule({
    id: 'phone', title: 'Telefonul mobil', sub: 'Cum ajunge vocea ta la prieten și cum simte ecranul degetul',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'net', px = 0.2, drag = false, lastTower = -1, packets = [], tx = 0, ty = 0, touch = null;
      const bs = {};
      const rm = api.row('');
      [['net', '📡 Rețeaua'], ['screen', '👆 Ecranul tactil']].forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const info = document.createElement('div'); info.className = 'mod-readout'; rm.appendChild(info);
      const MSG = {
        net: 'Telefonul tău trimite <b>unde radio</b> către cel mai apropiat <b>turn</b>. De acolo, vocea merge prin cabluri (fibră optică) până la turnul prietenului, iar la final iar prin unde radio. <b>Trage telefonul</b> și vezi cum se schimbă semnalul și turnul!',
        screen: 'Ecranul are o plasă fină de electrozi care „simt” electricitatea. Degetul tău conduce electricitate și schimbă câmpul din jur; telefonul calculează unde ești. <b>Atinge și trage degetul</b> pe grilă!'
      };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); api.say(MSG[m], 14000); api.layout(); }
      const towers = () => { const W = api.freeW, y = api.cy - api.unit * 0.25; return [{ x: W * 0.16, y: y }, { x: W * 0.5, y: y - 8 }, { x: W * 0.84, y: y }]; };
      const phonePos = () => ({ x: api.freeW * px, y: api.cy + api.unit * 0.42 });
      const strength = (T, P) => 1 / (1 + Math.pow(Math.hypot(T.x - P.x, (T.y - P.y) * 0.5) / (api.unit * 0.55), 2.2));
      api.pointer({
        down: (x, y) => { if (mode === 'net') { const P = phonePos(); if (Math.hypot(x - P.x, y - P.y) < 50) drag = true; } else touch = [x, y]; },
        move: (x, y) => { if (mode === 'net' && drag) px = clamp(x / api.freeW, 0.05, 0.93); else if (mode === 'screen' && touch) touch = [x, y]; },
        up: () => { drag = false; touch = null; }
      });
      function drawPhone(x, y, s, glow, label) {
        ctx.save(); ctx.translate(x, y);
        if (glow) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 60); g.addColorStop(0, 'rgba(120,200,255,' + glow + ')'); g.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#1c2236'; ctx.strokeStyle = '#8aa0c8'; ctx.lineWidth = 3; rrect(ctx, -16 * s, -28 * s, 32 * s, 56 * s, 7 * s); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2f5aa8'; ctx.fillRect(-12 * s, -22 * s, 24 * s, 40 * s);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 22 * s, 2.5 * s, 0, 7); ctx.fill();
        ctx.restore();
        if (label) { ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label, x, y + 42 * s); }
      }
      function drawTower(T, active, i, str, t) {
        ctx.strokeStyle = active ? '#ffd166' : '#8a93a8'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(T.x - 14, T.y + 54); ctx.lineTo(T.x, T.y - 24); ctx.lineTo(T.x + 14, T.y + 54); ctx.moveTo(T.x - 9, T.y + 20); ctx.lineTo(T.x + 9, T.y + 20); ctx.moveTo(T.x - 6, T.y - 2); ctx.lineTo(T.x + 6, T.y - 2); ctx.stroke();
        ctx.fillStyle = active ? '#ffd166' : '#8a93a8'; ctx.beginPath(); ctx.arc(T.x, T.y - 26, 5, 0, 7); ctx.fill();
        /* acoperire (celulă) */
        ctx.strokeStyle = 'rgba(120,200,255,' + (active ? 0.45 : 0.18) + ')'; ctx.lineWidth = 2; ctx.setLineDash([5, 7]); ctx.beginPath(); ctx.arc(T.x, T.y + 40, api.unit * 0.62, Math.PI, 0); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Turn ' + (i + 1), T.x, T.y + 72);
        if (active) for (let k = 0; k < 3; k++) { const ph = ((t * 0.9 + k / 3) % 1); ctx.strokeStyle = 'rgba(255,209,102,' + (1 - ph) * 0.8 + ')'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(T.x, T.y - 26, 8 + ph * 30, -2.2, -0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(T.x, T.y - 26, 8 + ph * 30, Math.PI + 0.9, Math.PI + 2.2); ctx.stroke(); }
      }
      function frame(dt, t) {
        bg(api, '#0b1330', '#05080f');
        const U = api.unit, W = api.freeW;
        if (mode === 'net') {
          const T = towers(), P = phonePos(), S = T.map((q) => strength(q, P));
          let best = 0; S.forEach((s, i) => { if (s > S[best]) best = i; });
          const bars = S[best] > 0.55 ? 4 : S[best] > 0.35 ? 3 : S[best] > 0.2 ? 2 : S[best] > 0.1 ? 1 : 0;
          if (best !== lastTower) { if (lastTower >= 0 && bars > 0) api.say('🔄 <b>Predare (handover)!</b> Telefonul s-a conectat automat la <b>Turnul ' + (best + 1) + '</b>, care are semnal mai bun. Nu observi nimic, convorbirea continuă!', 7000); lastTower = best; }
          /* ground */
          ctx.fillStyle = '#16301f'; ctx.fillRect(-W, api.cy + U * 0.2, W * 3, api.H);
          T.forEach((q, i) => drawTower(q, i === best && bars > 0, i, S[i], t));
          /* fibră între turnuri */
          ctx.strokeStyle = '#4a6a9a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(T[0].x, T[0].y + 52); ctx.lineTo(T[1].x, T[1].y + 52); ctx.lineTo(T[2].x, T[2].y + 52); ctx.stroke();
          ctx.fillStyle = '#9fb4e0'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('fibră optică (lumină în cablu)', T[1].x, T[1].y + 92);
          /* prieten (dreapta) */
          const FR = { x: W * 0.93, y: api.cy + U * 0.42 }, fT = 2;
          drawPhone(FR.x, FR.y, 0.9, bars > 0 ? 0.35 : 0, 'Prietenul');
          /* telefonul tău */
          drawPhone(P.x, P.y, 1.05, bars > 0 ? 0.4 : 0, 'Tu');
          /* undă telefon → turn, pachete */
          if (bars > 0) {
            ctx.strokeStyle = 'rgba(120,200,255,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.moveTo(P.x, P.y - 28); ctx.lineTo(T[best].x, T[best].y - 26); ctx.stroke(); ctx.beginPath(); ctx.moveTo(T[fT].x, T[fT].y - 26); ctx.lineTo(FR.x, FR.y - 28); ctx.stroke(); ctx.setLineDash([]);
            if (Math.random() < dt * 5) packets.push({ u: 0 });
            const route = [[P.x, P.y - 28], [T[best].x, T[best].y - 26], [T[best].x, T[best].y + 52], [T[fT].x, T[fT].y + 52], [T[fT].x, T[fT].y - 26], [FR.x, FR.y - 28]];
            const segs = []; let L = 0; for (let i = 1; i < route.length; i++) { const d = Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]); segs.push(d); L += d; }
            packets = packets.filter((p) => { p.u += dt * 280 / L; return p.u < 1; });
            ctx.fillStyle = '#7dffb0';
            for (const p of packets) { let d = p.u * L, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; } const k = d / segs[i]; ctx.beginPath(); ctx.arc(lerp(route[i][0], route[i + 1][0], k), lerp(route[i][1], route[i + 1][1], k), 3.6, 0, 7); ctx.fill(); }
          } else { ctx.fillStyle = '#ff9a7a'; ctx.font = '700 14px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Fără semnal! Apropie-te de un turn.', W / 2, api.cy + U * 0.1); }
          /* bare de semnal */
          for (let i = 0; i < 4; i++) { ctx.fillStyle = i < bars ? '#7dffb0' : 'rgba(255,255,255,0.2)'; ctx.fillRect(P.x - 26 + i * 8, P.y - 56 - i * 5, 6, 8 + i * 5); }
          info.innerHTML = '<b>Semnal:</b> ' + bars + '/4 · <b>Conectat la:</b> ' + (bars ? 'Turnul ' + (best + 1) : 'nimic') + ' · Undele radio merg cu viteza luminii: 300.000 km/s';
        } else {
          /* ecran capacitiv */
          const cols = 8, rows = 12, gw = Math.min(W - 24, U * 1.5), gh = gw * rows / cols * 0.9;
          const gx = (W - gw) / 2, gy = api.cy - gh / 2 + 6, cw = gw / cols, ch = gh / rows;
          ctx.fillStyle = '#1b2442'; rrect(ctx, gx - 10, gy - 10, gw + 20, gh + 20, 14); ctx.fill();
          let sx = 0, sy = 0, sw = 0;
          for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const nx = gx + (c + 0.5) * cw, ny = gy + (r + 0.5) * ch;
            const v = touch ? Math.exp(-(Math.pow(nx - touch[0], 2) + Math.pow(ny - touch[1], 2)) / Math.pow(Math.min(cw, ch) * 1.5, 2)) : 0;
            ctx.fillStyle = v > 0.04 ? 'rgba(' + Math.round(60 + 195 * v) + ',' + Math.round(120 + 80 * (1 - v)) + ',' + Math.round(255 - 200 * v) + ',' + (0.35 + 0.65 * v) + ')' : 'rgba(80,110,170,0.28)';
            ctx.beginPath(); ctx.arc(nx, ny, Math.min(cw, ch) * 0.28 + v * 7, 0, 7); ctx.fill();
            sx += nx * v; sy += ny * v; sw += v;
          }
          ctx.strokeStyle = 'rgba(160,200,255,0.25)'; ctx.lineWidth = 1;
          for (let c = 0; c <= cols; c++) { ctx.beginPath(); ctx.moveTo(gx + c * cw, gy); ctx.lineTo(gx + c * cw, gy + gh); ctx.stroke(); }
          for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(gx, gy + r * ch); ctx.lineTo(gx + gw, gy + r * ch); ctx.stroke(); }
          if (touch && sw > 0.1) { const cx2 = sx / sw, cy2 = sy / sw; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx2, cy2, 14, 0, 7); ctx.moveTo(cx2 - 22, cy2); ctx.lineTo(cx2 + 22, cy2); ctx.moveTo(cx2, cy2 - 22); ctx.lineTo(cx2, cy2 + 22); ctx.stroke(); info.innerHTML = 'Telefonul calculează centrul petei: <b>x = ' + fmt((cx2 - gx) / gw * 100, 0) + '%, y = ' + fmt((cy2 - gy) / gh * 100, 0) + '%</b>'; }
          else info.innerHTML = 'Atinge grila: culoarea arată cât de mult s-a schimbat câmpul electric la fiecare electrod.';
        }
      }
      setMode('net');
      return { frame: frame };
    }
  });
})();
