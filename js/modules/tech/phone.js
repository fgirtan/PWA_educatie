/* Modul: Telefonul mobil */
(function () {
  const A = window.Art;
  const TAU = Math.PI * 2;
  const txt = (ctx, s, x, y, o) => A.text(ctx, s, x, y, Object.assign({ halo: false }, o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const rrect = (ctx, x, y, w, h, r) => A.roundRectPath(ctx, x, y, w, h, r);

  /* smartphone realist, centrat în (0,0); w = lățimea corpului */
  function smartphone(ctx, w, o) {
    o = o || {}; const h = w * 2.05, r = w * 0.17;
    ctx.save();
    A.groundShadow(ctx, w * 0.06, h * 0.52, w * 0.62, w * 0.1, 0.35);
    /* butoane laterale */
    ctx.fillStyle = '#7d8696'; rrect(ctx, w / 2 - 1, -h * 0.22, 3, h * 0.13, 1.5); ctx.fill(); rrect(ctx, -w / 2 - 2, -h * 0.28, 3, h * 0.08, 1.5); ctx.fill(); rrect(ctx, -w / 2 - 2, -h * 0.17, 3, h * 0.08, 1.5); ctx.fill();
    /* ramă de aluminiu */
    rrect(ctx, -w / 2, -h / 2, w, h, r);
    const fg = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); fg.addColorStop(0, '#9aa2b0'); fg.addColorStop(0.15, '#e3e7ee'); fg.addColorStop(0.5, '#b4bbc7'); fg.addColorStop(0.85, '#e3e7ee'); fg.addColorStop(1, '#808898'); ctx.fillStyle = fg; ctx.fill();
    /* sticla neagră */
    const b = w * 0.045; rrect(ctx, -w / 2 + b, -h / 2 + b, w - 2 * b, h - 2 * b, r - b); ctx.fillStyle = '#0b0d12'; ctx.fill();
    /* ecranul */
    const m = w * 0.085, sx = -w / 2 + m, sy = -h / 2 + m, sw = w - 2 * m, sh = h - 2 * m;
    ctx.save(); rrect(ctx, sx, sy, sw, sh, r * 0.7); ctx.clip();
    const sg = ctx.createLinearGradient(0, sy, 0, sy + sh); sg.addColorStop(0, o.on === false ? '#1a1e28' : '#2d4f86'); sg.addColorStop(1, o.on === false ? '#101318' : '#162a4e'); ctx.fillStyle = sg; ctx.fillRect(sx, sy, sw, sh);
    if (o.on !== false) {
      /* interfața unui apel: avatar, nume, durată, buton roșu */
      const ax = 0, ay = sy + sh * 0.3, ar = sw * 0.2;
      ctx.fillStyle = '#c9d6ec'; ctx.beginPath(); ctx.arc(ax, ay, ar, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7f93b8'; ctx.beginPath(); ctx.arc(ax, ay - ar * 0.22, ar * 0.38, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(ax, ay + ar * 0.62, ar * 0.62, ar * 0.42, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; rrect(ctx, -sw * 0.28, ay + ar * 1.35, sw * 0.56, Math.max(2, sh * 0.035), 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; rrect(ctx, -sw * 0.16, ay + ar * 1.35 + sh * 0.06, sw * 0.32, Math.max(2, sh * 0.025), 2); ctx.fill();
      ctx.fillStyle = '#e5484d'; ctx.beginPath(); ctx.arc(0, sy + sh * 0.84, sw * 0.13, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.2, sw * 0.035); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, sy + sh * 0.85, sw * 0.06, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    }
    /* reflexie simplă pe sticlă */
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + sw * 0.75, sy); ctx.lineTo(sx, sy + sh * 0.55); ctx.closePath(); ctx.fill();
    ctx.restore();
    /* camera frontală */
    ctx.fillStyle = '#05060a'; ctx.beginPath(); ctx.arc(0, sy + w * 0.07, w * 0.035, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(90,110,160,0.7)'; ctx.beginPath(); ctx.arc(-w * 0.008, sy + w * 0.062, w * 0.011, 0, TAU); ctx.fill();
    ctx.restore();
    return h;
  }

  /* ============================================================
     1) TELEFONUL MOBIL
     ============================================================ */
  defineModule({
    id: 'phone', title: 'Telefonul mobil', sub: 'Cum ajunge vocea ta la prieten și cum simte ecranul degetul',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'net', px = 0.2, drag = false, lastTower = -1, packets = [], tx = 0, ty = 0, touch = null, touchS = null;
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
      const phoneW = () => clamp(api.unit * 0.17, 30, 60);
      const strength = (T, P) => 1 / (1 + Math.pow(Math.hypot(T.x - P.x, (T.y - P.y) * 0.5) / (api.unit * 0.55), 2.2));
      api.pointer({
        down: (x, y) => { if (mode === 'net') { const P = phonePos(); if (Math.hypot(x - P.x, y - P.y) < Math.max(50, phoneW() * 1.2)) drag = true; } else touch = [x, y]; },
        move: (x, y) => { if (mode === 'net' && drag) px = clamp(x / api.freeW, 0.05, 0.93); else if (mode === 'screen' && touch) touch = [x, y]; },
        up: () => { drag = false; touch = null; }
      });

      /* fundal: cer blând, oraș discret în depărtare, câmp (cache pe mărime) */
      function scene() {
        const U = api.unit, gy = api.cy + U * 0.2;
        return A.cached('ph-scene-day-' + Math.round(gy), api.W, api.H, (c, w, h) => {
          const sky = c.createLinearGradient(0, 0, 0, gy); sky.addColorStop(0, A.SCENE.day[0]); sky.addColorStop(1, A.SCENE.day[1]); c.fillStyle = sky; c.fillRect(0, 0, w, gy + 2);
          /* dealuri și oraș, desaturate */
          c.fillStyle = '#a9b9c8'; c.beginPath(); c.moveTo(0, gy); const pts = []; for (let x = 0; x <= w; x += w / 10) pts.push([x, gy - U * (0.08 + 0.05 * Math.sin(x / w * 7 + 1))]); c.lineTo(0, pts[0][1]); A.smoothPath(c, pts, false); c.lineTo(w, gy); c.closePath(); c.fill();
          let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
          for (let x = w * 0.28; x < w * 0.72;) { const bw = U * (0.05 + rnd() * 0.06), bh = U * (0.08 + rnd() * 0.2); c.fillStyle = rnd() < 0.5 ? '#94a6ba' : '#8a9cb2'; c.fillRect(x, gy - bh, bw, bh); c.fillStyle = 'rgba(230,238,248,0.5)'; for (let yy = gy - bh + 5; yy < gy - 6; yy += 7) for (let xx = x + 3; xx < x + bw - 4; xx += 6) c.fillRect(xx, yy, 2.5, 3); x += bw + 2; }
          const g = c.createLinearGradient(0, gy, 0, h); g.addColorStop(0, '#7fa36a'); g.addColorStop(0.25, '#5f8752'); g.addColorStop(1, '#3d5c38'); c.fillStyle = g; c.fillRect(0, gy, w, h - gy);
          c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(0, gy, w, 2);
        });
      }
      /* turn de telefonie: structură metalică zăbrelită, antene panou */
      function drawTower(T, active, i, gy, t) {
        const top = T.y - 26, H = gy - top, bw = clamp(H * 0.2, 18, 46), tw = bw * 0.22;
        A.groundShadow(ctx, T.x, gy, bw * 0.9, bw * 0.18, 0.35);
        const L = (u) => lerp(T.x - bw / 2, T.x - tw / 2, u), R = (u) => lerp(T.x + bw / 2, T.x + tw / 2, u), Y = (u) => lerp(gy, top + H * 0.12, u);
        ctx.save(); ctx.lineCap = 'round';
        ctx.strokeStyle = '#6e7686'; ctx.lineWidth = 1.2; ctx.beginPath();
        const n = 6; for (let k = 0; k < n; k++) { const u0 = k / n, u1 = (k + 1) / n; ctx.moveTo(L(u0), Y(u0)); ctx.lineTo(R(u1), Y(u1)); ctx.moveTo(R(u0), Y(u0)); ctx.lineTo(L(u1), Y(u1)); ctx.moveTo(L(u1), Y(u1)); ctx.lineTo(R(u1), Y(u1)); }
        ctx.stroke();
        ctx.strokeStyle = '#4e5566'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(L(0), Y(0)); ctx.lineTo(L(1), Y(1)); ctx.moveTo(R(0), Y(0)); ctx.lineTo(R(1), Y(1)); ctx.stroke();
        /* catarg + antene panou (3) */
        ctx.strokeStyle = '#5b6272'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(T.x, Y(1)); ctx.lineTo(T.x, top - 4); ctx.stroke();
        const ah = H * 0.16, aw = Math.max(4, bw * 0.16);
        [-1, 0, 1].forEach((d) => { const ax = T.x + d * aw * 1.5 - aw / 2; rrect(ctx, ax, top + 2, aw, ah, aw * 0.35); const g = ctx.createLinearGradient(ax, 0, ax + aw, 0); g.addColorStop(0, '#f2f4f7'); g.addColorStop(1, '#b8bfca'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#8a93a2'; ctx.lineWidth = 0.8; ctx.stroke(); });
        /* antenă parabolică (legătura de rețea) */
        ctx.fillStyle = '#e8ebf0'; ctx.beginPath(); ctx.ellipse(T.x + bw * 0.16, top + H * 0.32, aw * 0.6, aw * 1.4, 0, -Math.PI / 2, Math.PI / 2); ctx.fill(); ctx.strokeStyle = '#8a93a2'; ctx.stroke();
        /* lumina de avertizare (roșie, fixă) */
        ctx.fillStyle = '#d93a3a'; ctx.beginPath(); ctx.arc(T.x, top - 6, 3, 0, TAU); ctx.fill();
        ctx.restore();
        /* acoperire (celulă) */
        ctx.strokeStyle = 'rgba(40,70,130,' + (active ? 0.35 : 0.14) + ')'; ctx.lineWidth = 1.6; ctx.setLineDash([5, 7]); ctx.beginPath(); ctx.arc(T.x, T.y + 40, api.unit * 0.62, Math.PI, 0); ctx.stroke(); ctx.setLineDash([]);
        A.label(ctx, 'Turn ' + (i + 1), T.x, top - 48, { size: A.labelSize(api.unit), bg: A.LABEL_BG, color: active ? '#ffe08a' : '#e6ecf5' });
        /* unde radio din antenele turnului activ — arcuri care se extind lin */
        if (active) for (let k = 0; k < 3; k++) { const ph = ((t * 0.5 + k / 3) % 1); ctx.strokeStyle = 'rgba(255,200,70,' + Math.sin(ph * Math.PI) * 0.7 + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(T.x, top + ah * 0.4, 10 + ph * 34, -2.3, -0.85); ctx.stroke(); ctx.beginPath(); ctx.arc(T.x, top + ah * 0.4, 10 + ph * 34, Math.PI + 0.85, Math.PI + 2.3); ctx.stroke(); }
      }
      /* undă radio între două puncte: fronturi de undă (arce) care călătoresc */
      function radioLink(x0, y0, x1, y1, t, col) {
        const d = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0), n = Math.max(3, Math.round(d / 40));
        ctx.save(); ctx.lineCap = 'round';
        for (let k = 0; k < n; k++) {
          const u = ((t * 0.45 + k / n) % 1), x = lerp(x0, x1, u), y = lerp(y0, y1, u), al = Math.sin(u * Math.PI) * 0.8, r = 9 + Math.sin(u * Math.PI) * 9;
          ctx.strokeStyle = A.rgba(col, al); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(x - Math.cos(a) * r, y - Math.sin(a) * r, r, a - 0.8, a + 0.8); ctx.stroke();
        }
        ctx.restore();
      }
      function bars(x, y, n, s) {
        for (let i = 0; i < 4; i++) { const bw = 5 * s, bh = (7 + i * 5) * s, bx = x - 13 * s + i * 7.5 * s; rrect(ctx, bx, y - bh, bw, bh, 1.5 * s); ctx.fillStyle = i < n ? '#2fbf62' : 'rgba(255,255,255,0.35)'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.stroke(); }
      }

      function frame(dt, t) {
        const U = api.unit, W = api.freeW;
        if (mode === 'net') {
          const gy = api.cy + U * 0.2;
          ctx.drawImage(scene(), 0, 0, api.W, api.H);
          const T = towers(), P = phonePos(), S = T.map((q) => strength(q, P));
          let best = 0; S.forEach((s, i) => { if (s > S[best]) best = i; });
          const nb = S[best] > 0.55 ? 4 : S[best] > 0.35 ? 3 : S[best] > 0.2 ? 2 : S[best] > 0.1 ? 1 : 0;
          if (best !== lastTower) { if (lastTower >= 0 && nb > 0) api.say('🔄 <b>Predare (handover)!</b> Telefonul s-a conectat automat la <b>Turnul ' + (best + 1) + '</b>, care are semnal mai bun. Nu observi nimic, convorbirea continuă!', 7000); lastTower = best; }
          /* fibra optică îngropată între turnuri */
          const fy = gy + U * 0.07, fT = 2;
          ctx.save(); ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(40,30,20,0.35)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(T[0].x, fy); ctx.lineTo(T[2].x, fy); ctx.stroke();
          ctx.strokeStyle = '#26303f'; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = '#4fb3e0'; ctx.lineWidth = 1.6; ctx.stroke();
          T.forEach((q) => { ctx.strokeStyle = '#26303f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(q.x, gy - 2); ctx.lineTo(q.x, fy); ctx.stroke(); });
          ctx.restore();
          A.label(ctx, 'fibră optică (lumină în cablu)', T[1].x, fy + A.labelSize(U) * 1.4, { size: A.labelSize(U), bg: A.LABEL_BG, color: '#eef6e6', weight: 600 });
          T.forEach((q, i) => drawTower(q, i === best && nb > 0, i, gy, t));
          /* prieten (dreapta) și telefonul tău */
          const FR = { x: W * 0.93, y: api.cy + U * 0.42 }, pw = phoneW(), lab = A.labelSize(U);
          const ph1 = (() => { ctx.save(); ctx.translate(FR.x, FR.y); const h = smartphone(ctx, pw * 0.9, { on: nb > 0 }); ctx.restore(); return h; })();
          A.label(ctx, 'Prietenul', Math.min(FR.x, W - lab * 3.6), FR.y + ph1 / 2 + lab * 1.2, { size: lab, bg: A.LABEL_BG });
          const tilt = drag ? 0.08 : 0;
          ctx.save(); ctx.translate(P.x, P.y); ctx.rotate(tilt); const ph2 = smartphone(ctx, pw, { on: nb > 0 }); ctx.restore();
          A.label(ctx, 'Tu', P.x, P.y + ph2 / 2 + lab * 1.2, { size: lab, bg: A.LABEL_BG, color: '#ffe08a' });
          /* unde radio + pachete de date */
          const pTop = P.y - ph2 / 2, fTop = FR.y - ph1 / 2;
          if (nb > 0) {
            const at = (q) => [q.x, q.y - 18];
            radioLink(P.x, pTop - 6, at(T[best])[0], at(T[best])[1], t, '#2a6fd6');
            radioLink(at(T[fT])[0], at(T[fT])[1], FR.x, fTop - 6, t, '#2a6fd6');
            if (Math.random() < dt * 5) packets.push({ u: 0 });
            const route = [[P.x, pTop - 6], at(T[best]), [T[best].x, fy], [T[fT].x, fy], at(T[fT]), [FR.x, fTop - 6]];
            const segs = []; let L = 0; for (let i = 1; i < route.length; i++) { const d = Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]); segs.push(d); L += d; }
            packets = packets.filter((p) => { p.u += dt * 280 / L; return p.u < 1; });
            ctx.fillStyle = '#3ee07a'; ctx.strokeStyle = '#11663a'; ctx.lineWidth = 1;
            for (const p of packets) { let d = p.u * L, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; } const k = d / segs[i]; ctx.beginPath(); ctx.arc(lerp(route[i][0], route[i + 1][0], k), lerp(route[i][1], route[i + 1][1], k), 3.6, 0, TAU); ctx.fill(); ctx.stroke(); }
          } else A.label(ctx, 'Fără semnal! Apropie-te de un turn.', W / 2, api.cy + U * 0.1, { size: A.labelSize(U), color: '#ffb0a0', bg: A.LABEL_BG });
          /* bare de semnal */
          ctx.save(); rrect(ctx, P.x - 19, pTop - 40, 38, 30, 8); ctx.fillStyle = 'rgba(20,30,50,0.75)'; ctx.fill(); ctx.restore();
          bars(P.x + 1, pTop - 15, nb, 1);
          info.innerHTML = '<b>Semnal:</b> ' + nb + '/4 · <b>Conectat la:</b> ' + (nb ? 'Turnul ' + (best + 1) : 'nimic') + ' · Undele radio merg cu viteza luminii: 300.000 km/s';
        } else {
          A.scene(ctx, api.W, api.H, 'lab');
          /* ecran capacitiv */
          const cols = 8, rows = 12, gw = Math.min(W - 24, U * 1.5, (U * 2 - 56) / 1.35), gh = gw * rows / cols * 0.9;
          const gx = (W - gw) / 2, gy = api.cy - gh / 2 + 6, cw = gw / cols, ch = gh / rows;
          /* corpul telefonului în jurul ecranului */
          const fr = Math.max(10, gw * 0.06);
          A.softShadow(ctx, () => { rrect(ctx, gx - fr, gy - fr * 1.6, gw + fr * 2, gh + fr * 3.2, fr * 2.2); const fg = ctx.createLinearGradient(gx - fr, 0, gx + gw + fr, 0); fg.addColorStop(0, '#8e96a5'); fg.addColorStop(0.1, '#dfe3ea'); fg.addColorStop(0.5, '#aeb5c2'); fg.addColorStop(0.9, '#dfe3ea'); fg.addColorStop(1, '#7c8494'); ctx.fillStyle = fg; ctx.fill(); }, { blur: 14, dy: 6 });
          rrect(ctx, gx - fr * 0.8, gy - fr * 1.4, gw + fr * 1.6, gh + fr * 2.8, fr * 1.9); ctx.fillStyle = '#0b0d12'; ctx.fill();
          ctx.fillStyle = '#05060a'; ctx.beginPath(); ctx.arc(gx + gw / 2, gy - fr * 0.7, fr * 0.22, 0, TAU); ctx.fill();
          rrect(ctx, gx - 2, gy - 2, gw + 4, gh + 4, 8); const sg = ctx.createLinearGradient(0, gy, 0, gy + gh); sg.addColorStop(0, '#1b2a48'); sg.addColorStop(1, '#101a30'); ctx.fillStyle = sg; ctx.fill();
          /* electrozi transparenți: rânduri și coloane */
          ctx.strokeStyle = 'rgba(140,180,240,0.22)'; ctx.lineWidth = Math.max(2, Math.min(cw, ch) * 0.12);
          for (let c = 0; c < cols; c++) { ctx.beginPath(); ctx.moveTo(gx + (c + 0.5) * cw, gy + 3); ctx.lineTo(gx + (c + 0.5) * cw, gy + gh - 3); ctx.stroke(); }
          for (let r = 0; r < rows; r++) { ctx.beginPath(); ctx.moveTo(gx + 3, gy + (r + 0.5) * ch); ctx.lineTo(gx + gw - 3, gy + (r + 0.5) * ch); ctx.stroke(); }
          let sx = 0, sy = 0, sw = 0;
          for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const nx = gx + (c + 0.5) * cw, ny = gy + (r + 0.5) * ch;
            const v = touch ? Math.exp(-(Math.pow(nx - touch[0], 2) + Math.pow(ny - touch[1], 2)) / Math.pow(Math.min(cw, ch) * 1.5, 2)) : 0;
            const rr = Math.min(cw, ch) * 0.26 + v * 6;
            ctx.fillStyle = v > 0.04 ? 'rgba(' + Math.round(60 + 195 * v) + ',' + Math.round(120 + 80 * (1 - v)) + ',' + Math.round(255 - 200 * v) + ',' + (0.45 + 0.55 * v) + ')' : 'rgba(110,150,210,0.35)';
            ctx.beginPath(); ctx.moveTo(nx, ny - rr); ctx.lineTo(nx + rr, ny); ctx.lineTo(nx, ny + rr); ctx.lineTo(nx - rr, ny); ctx.closePath(); ctx.fill();
            sx += nx * v; sy += ny * v; sw += v;
          }
          /* degetul care atinge ecranul */
          if (touch) touchS = touchS ? [A.damp(touchS[0], touch[0], 30, dt), A.damp(touchS[1], touch[1], 30, dt)] : touch.slice(); else touchS = null;
          if (touchS) {
            const fx = touchS[0], fyy = touchS[1], fw = Math.min(cw, ch) * 1.7;
            ctx.save(); ctx.translate(fx, fyy); ctx.rotate(-0.25);
            ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.moveTo(-fw / 2, fw * 0.2); ctx.bezierCurveTo(-fw / 2, -fw * 0.75, fw / 2, -fw * 0.75, fw / 2, fw * 0.2); ctx.lineTo(fw * 0.58, fw * 3.2); ctx.lineTo(-fw * 0.58, fw * 3.2); ctx.closePath();
            const sk = ctx.createLinearGradient(-fw / 2, 0, fw / 2, 0); sk.addColorStop(0, '#c98a6c'); sk.addColorStop(0.4, '#f0c0a4'); sk.addColorStop(1, '#b97a5e'); ctx.fillStyle = sk; ctx.fill();
            ctx.strokeStyle = 'rgba(120,70,50,0.6)'; ctx.lineWidth = 1; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-fw * 0.3, fw * 0.05); ctx.bezierCurveTo(-fw * 0.32, -fw * 0.42, fw * 0.32, -fw * 0.42, fw * 0.3, fw * 0.05); ctx.lineTo(fw * 0.3, fw * 0.55); ctx.quadraticCurveTo(0, fw * 0.65, -fw * 0.3, fw * 0.55); ctx.closePath();
            ctx.fillStyle = '#f6d6c6'; ctx.fill(); ctx.strokeStyle = 'rgba(150,90,70,0.5)'; ctx.stroke();
            ctx.strokeStyle = 'rgba(140,80,60,0.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-fw * 0.35, fw * 1.6); ctx.quadraticCurveTo(0, fw * 1.7, fw * 0.35, fw * 1.6); ctx.stroke();
            ctx.restore();
          }
          if (touch && sw > 0.1) { const cx2 = sx / sw, cy2 = sy / sw; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx2, cy2, 14, 0, TAU); ctx.moveTo(cx2 - 22, cy2); ctx.lineTo(cx2 - 8, cy2); ctx.moveTo(cx2 + 8, cy2); ctx.lineTo(cx2 + 22, cy2); ctx.moveTo(cx2, cy2 - 22); ctx.lineTo(cx2, cy2 - 8); ctx.moveTo(cx2, cy2 + 8); ctx.lineTo(cx2, cy2 + 22); ctx.stroke(); info.innerHTML = 'Telefonul calculează centrul petei: <b>x = ' + fmt((cx2 - gx) / gw * 100, 0) + '%, y = ' + fmt((cy2 - gy) / gh * 100, 0) + '%</b>'; }
          else info.innerHTML = 'Atinge grila: culoarea arată cât de mult s-a schimbat câmpul electric la fiecare electrod.';
        }
      }
      setMode('net');
      return { frame: frame };
    }
  });
})();
