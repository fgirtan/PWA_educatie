/* ============================================================
   CUM FUNCȚIONEAZĂ: 1) Circuit electric  2) Cum zboară avionul
   3) Calculatorul (biți)  4) Mecanisme (roți dințate, pârghii)
   ============================================================ */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }

  /* ============================================================
     1) CIRCUIT ELECTRIC
     ============================================================ */
  defineModule({
    id: 'circuit', title: 'Circuitul electric', sub: 'De ce se aprinde becul?',
    start: function (api) {
      const ctx = api.ctx;
      let on = true, par = false, n = 2, V = 6, burnt = [false, false, false], dots = [], flowT = 0;
      const R_BULB = 6;
      const r1 = api.row('');
      const bSw = api.button(r1, '🔘 Întrerupător: PORNIT', () => { on = !on; bSw.innerHTML = on ? '🔘 Întrerupător: PORNIT' : '⚪ Întrerupător: OPRIT'; api.say(on ? 'Circuitul e <b>închis</b>: curentul poate trece prin tot drumul.' : 'Circuitul e <b>deschis</b>: curentul nu are pe unde trece, deci nu se aprinde nimic!', 6000); });
      const bMode = api.button(r1, '➡️ Becuri în serie', () => { par = !par; bMode.innerHTML = par ? '🔀 Becuri în paralel' : '➡️ Becuri în serie'; api.say(par ? '<b>Paralel:</b> fiecare bec are propriul drum și primește toată tensiunea. Dacă unul se arde, celelalte rămân aprinse (așa e instalația din casa ta).' : '<b>Serie:</b> becurile sunt pe același drum și își împart tensiunea. Dacă unul se arde, toate se sting (ca la unele ghirlande vechi).', 9000); });
      api.button(r1, '➕ Bec', () => { n = Math.min(3, n + 1); });
      api.button(r1, '➖ Bec', () => { n = Math.max(1, n - 1); });
      api.button(r1, '🔧 Înlocuiește becurile', () => { burnt = [false, false, false]; api.say('Becuri noi!', 2500); });
      const r2 = api.row('');
      api.slider(r2, { label: 'Tensiunea bateriei', min: 1.5, max: 24, step: 0.5, value: V, fmt: (v) => fmt(v) + ' V', onInput: (v) => { V = v; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Curentul curge din baterie, prin becuri, înapoi la baterie. Încearcă: oprește întrerupătorul, schimbă serie/paralel, crește tensiunea… dar ai grijă să nu arzi becurile!', 12000);

      function geom() {
        const W = api.freeW, x0 = W * 0.14, x1 = W * 0.86, y0 = api.cy - api.unit * 0.55, y1 = api.cy + api.unit * 0.55;
        return { x0: x0, x1: x1, y0: y0, y1: y1 };
      }
      /* drumul electronilor (polilinie) pentru ramura k */
      function path(k) {
        const g = geom(), pts = [];
        if (!par) { pts.push([g.x0, g.y1], [g.x0, g.y0], [g.x1, g.y0], [g.x1, g.y1], [g.x0, g.y1]); }
        else { const bx = g.x0 + (g.x1 - g.x0) * (k + 1) / (n + 1); pts.push([g.x0, g.y1], [g.x0, g.y0], [bx, g.y0], [bx, g.y1], [g.x0, g.y1]); }
        let len = 0; const cum = [0];
        for (let i = 1; i < pts.length; i++) { len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(len); }
        return { pts: pts, len: len, cum: cum };
      }
      function at(p, u) { const d = (u % 1) * p.len; let i = 1; while (i < p.cum.length - 1 && p.cum[i] < d) i++; const k = (d - p.cum[i - 1]) / ((p.cum[i] - p.cum[i - 1]) || 1); return [lerp(p.pts[i - 1][0], p.pts[i][0], k), lerp(p.pts[i - 1][1], p.pts[i][1], k)]; }
      function solve() {
        /* întoarce [curent total, curent/putere pe fiecare bec] */
        const alive = []; for (let i = 0; i < n; i++) alive.push(!burnt[i]);
        if (!on) return { I: 0, per: Array(n).fill(0), Ib: Array(n).fill(0) };
        if (!par) {
          if (alive.some((a) => !a)) return { I: 0, per: Array(n).fill(0), Ib: Array(n).fill(0) };
          const I = V / (R_BULB * n); return { I: I, per: Array(n).fill(I * I * R_BULB), Ib: Array(n).fill(I), V1: V / n };
        }
        const Ib = alive.map((a) => a ? V / R_BULB : 0); return { I: Ib.reduce((a, b) => a + b, 0), per: Ib.map((i) => i * i * R_BULB), Ib: Ib, V1: V };
      }
      function bulb(x, y, p, dead, idx) {
        const ratio = clamp(p / 6, 0, 2.2);            // 6 W = strălucire normală
        const g = ctx.createRadialGradient(x, y, 0, x, y, 70 * (0.4 + ratio));
        if (!dead && ratio > 0.01) { g.addColorStop(0, 'rgba(255,230,120,' + clamp(ratio * 0.75, 0, 0.95) + ')'); g.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 70 * (0.4 + ratio), 0, 7); ctx.fill(); }
        ctx.fillStyle = dead ? '#3a3a3a' : 'rgb(255,' + Math.round(230 - 30 * clamp(ratio - 1, 0, 1)) + ',' + Math.round(80 + 100 * clamp(ratio, 0, 1)) + ')';
        if (!dead && ratio < 0.02) ctx.fillStyle = '#6b6f78';
        ctx.strokeStyle = '#dfe6f0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 22, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#9aa3b2'; ctx.fillRect(x - 10, y + 22, 20, 12);
        ctx.strokeStyle = dead ? '#777' : '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - 7, y + 20); ctx.lineTo(x - 6, y - 3); ctx.lineTo(x - 2, y - 7); ctx.lineTo(x + 2, y - 3); ctx.lineTo(x + 6, y - 7); ctx.lineTo(x + 7, y + 20); if (dead) { ctx.moveTo(x - 2, y - 7); ctx.lineTo(x + 1, y - 12); } ctx.stroke();
        if (dead) { ctx.fillStyle = '#ff7a7a'; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ars!', x, y - 30); }
      }
      function frame(dt, t) {
        bg(api, '#0a1226', '#05080f');
        const g = geom(), S = solve();
        /* ardere: puterea depășește 2,2× */
        for (let i = 0; i < n; i++) if (!burnt[i] && S.per[i] > 13.5) { burnt[i] = true; api.say('💥 <b>Becul s-a ars!</b> Tensiunea a fost prea mare pentru el. Apasă „Înlocuiește becurile”.', 6000); }
        const Sx = solve();
        /* fire */
        ctx.lineWidth = 6; ctx.strokeStyle = '#c9843a'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(g.x0, g.y1); ctx.lineTo(g.x0, g.y0); ctx.lineTo(g.x1, g.y0); ctx.lineTo(g.x1, g.y1); ctx.lineTo(g.x0, g.y1); ctx.stroke();
        if (par) for (let i = 0; i < n; i++) { const bx = g.x0 + (g.x1 - g.x0) * (i + 1) / (n + 1); ctx.beginPath(); ctx.moveTo(bx, g.y0); ctx.lineTo(bx, g.y1); ctx.stroke(); }
        /* baterie (stânga, la mijloc) */
        const by = (g.y0 + g.y1) / 2;
        ctx.fillStyle = '#0a1226'; ctx.fillRect(g.x0 - 18, by - 44, 36, 88);
        ctx.fillStyle = '#2a7a46'; ctx.fillRect(g.x0 - 18, by - 38, 36, 76); ctx.fillStyle = '#d9d2c0'; ctx.fillRect(g.x0 - 18, by - 38, 36, 18);
        ctx.fillStyle = '#fff'; ctx.font = '700 14px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+', g.x0, by - 24); ctx.fillText('−', g.x0, by + 28);
        ctx.font = '600 12px system-ui,sans-serif'; ctx.fillText(fmt(V) + ' V', g.x0 + 46, by + 4);
        /* întrerupător (sus, la 1/4) */
        const sx = g.x0 + (g.x1 - g.x0) * 0.2, sy = g.y0;
        ctx.fillStyle = '#0a1226'; ctx.fillRect(sx - 30, sy - 12, 60, 24);
        ctx.fillStyle = '#9aa3b2'; ctx.beginPath(); ctx.arc(sx - 26, sy, 5, 0, 7); ctx.arc(sx + 26, sy, 5, 0, 7); ctx.fill();
        ctx.strokeStyle = on ? '#7dffb0' : '#ff9a7a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx - 26, sy); ctx.lineTo(on ? sx + 26 : sx + 18, on ? sy : sy - 22); ctx.stroke();
        /* becuri */
        for (let i = 0; i < n; i++) {
          if (!par) { const bx = g.x0 + (g.x1 - g.x0) * (0.45 + 0.4 * (i + 0.5) / n); ctx.fillStyle = '#0a1226'; ctx.fillRect(bx - 28, g.y0 - 28, 56, 70); bulb(bx, g.y0 + 4, S.per[i], burnt[i], i); }
          else { const bx = g.x0 + (g.x1 - g.x0) * (i + 1) / (n + 1), byy = (g.y0 + g.y1) / 2; ctx.fillStyle = '#0a1226'; ctx.fillRect(bx - 28, byy - 28, 56, 70); bulb(bx, byy + 4, S.per[i], burnt[i], i); }
        }
        /* electroni */
        if (Sx.I > 0) {
          flowT += dt * Sx.I * 0.12;
          const paths = par ? Array.from({ length: n }, (_, k) => path(k)) : [path(0)];
          ctx.fillStyle = '#7ec8ff';
          paths.forEach((p, k) => {
            const cur = par ? Sx.Ib[k] : Sx.I; if (cur <= 0) return;
            const count = Math.round(p.len / 22);
            for (let j = 0; j < count; j++) { const q = at(p, j / count + flowT * (par ? cur / Sx.Ib[0] || 1 : 1) * 0.6); ctx.beginPath(); ctx.arc(q[0], q[1], 3.2, 0, 7); ctx.fill(); }
          });
        }
        info.innerHTML = '<b>Curent total:</b> ' + fmt(Sx.I, 2) + ' A · <b>Tensiune/bec:</b> ' + fmt(Sx.V1 || (on ? 0 : 0), 1) + ' V · <b>Putere/bec:</b> ' + fmt(Math.max(...Sx.per, 0), 1) + ' W (normal: 6 W)' + (Sx.I === 0 ? ' · <i>nu curge curent</i>' : '');
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('electronii (punctele albastre) curg de la − la + prin fire', 12, 86);
      }
      return { frame: frame };
    }
  });

  /* ============================================================
     2) CUM ZBOARĂ AVIONUL
     ============================================================ */
  defineModule({
    id: 'airplane', title: 'Cum zboară avionul', sub: 'Aripa, aerul și forța care ridică',
    start: function (api) {
      const ctx = api.ctx;
      let aoa = 6, speed = 0.6, alt = 0.5, vy = 0, wind = [], clouds = [];
      const MASS = 0.42;                                    // „greutatea” (în unități de portanță)
      for (let i = 0; i < 5; i++) clouds.push({ x: Math.random(), y: Math.random() * 0.8, s: 0.6 + Math.random() });
      for (let i = 0; i < 90; i++) wind.push({ x: Math.random(), y: Math.random(), k: Math.random() });
      const r1 = api.row('');
      api.slider(r1, { label: 'Unghiul aripii (față de aer)', min: -4, max: 24, step: 0.5, value: aoa, fmt: (v) => fmt(v, 0) + '°', onInput: (v) => { aoa = v; } });
      api.slider(r1, { label: 'Viteza', min: 0, max: 1, step: 0.01, value: speed, fmt: (v) => Math.round(80 + v * 800) + ' km/h', onInput: (v) => { speed = v; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      api.say('Aripa e înclinată puțin și împinge aerul în jos; aerul o împinge în sus (<b>portanța</b>). Dacă avionul e prea încet, nu zboară. Dacă unghiul e prea mare, aerul se desprinde de aripă și avionul „pică” (<b>angajare</b>).', 14000);
      const CL = (a) => a < 15 ? 0.1 + 0.11 * (a + 2) : Math.max(0.2, (0.1 + 0.11 * 17) - (a - 15) * 0.22);
      let stallSaid = false;
      function frame(dt, t) {
        const W = api.W, H = api.H, cx = api.cx, cy = api.cy, U = api.unit;
        const v = 0.15 + speed, lift = CL(aoa) * v * v * 0.55, stall = aoa > 15;
        /* mișcare verticală: portanță − greutate */
        const acc = (lift - MASS) * 1.6;
        vy += acc * dt; vy *= Math.exp(-dt * 1.2); alt = clamp(alt + vy * dt * 0.25, 0, 1);
        if (alt <= 0 && vy < 0) vy = 0;
        if (stall && !stallSaid) { stallSaid = true; api.say('⚠️ <b>Angajare!</b> Unghiul e prea mare: aerul nu mai urmează aripa, se face vâltoare, iar portanța scade brusc.', 8000); }
        if (!stall) stallSaid = false;
        bg(api, alt > 0.7 ? '#1b3f7d' : '#3d85c8', alt > 0.7 ? '#4a86c4' : '#b9dcf5');
        /* scena e oglindită: avionul zboară spre dreapta, aerul trece spre stânga */
        ctx.save(); ctx.translate(2 * cx, 0); ctx.scale(-1, 1);
        /* nori și sol care se mișcă */
        for (const c of clouds) { c.x += dt * v * 0.35 * c.s; if (c.x > 1.2) { c.x = -0.2; c.y = Math.random() * 0.8; } ctx.fillStyle = 'rgba(255,255,255,0.7)'; const cx2 = c.x * W, cy2 = (c.y * 0.6 + 0.05 + (alt - 0.5) * 0.25) * H + 40; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(cx2 + k * 22, cy2 + (k % 2) * 6, 22 + (k % 3) * 6, 0, 7); ctx.fill(); } }
        const gy = cy + U * 0.9 + (0.5 - alt) * U * 0.5;
        if (alt < 0.2) { ctx.fillStyle = '#4c8a3c'; ctx.fillRect(-W, gy, W * 3, H - gy); ctx.fillStyle = '#555'; ctx.fillRect(-W, gy + 4, W * 3, 10); ctx.fillStyle = '#fff'; for (let i = 0; i < 12; i++) ctx.fillRect(((i * 110 + t * v * 260) % (W + 110) + W + 110) % (W + 110) - 40, gy + 8, 50, 2); }
        const py = cy - U * 0.05 + (0.5 - alt) * U * 0.45;
        /* aripa (profil) rotită cu unghiul */
        const chord = U * 1.25;
        ctx.save(); ctx.translate(cx, py); ctx.rotate(-aoa * Math.PI / 180);
        const airfoilY = (x, up) => { const q = x / chord + 0.5; const th = 0.14 * (0.2969 * Math.sqrt(Math.max(q, 0)) - 0.126 * q - 0.3516 * q * q + 0.2843 * q * q * q - 0.1015 * q * q * q * q); return (up ? -1 : 1) * th * chord * 3.4 - (up ? 0.0 : 0) - 0.02 * chord * (1 - q) * 0; };
        /* linii de curent: deviate de profil */
        ctx.restore();
        ctx.save(); ctx.translate(cx, py);
        const a = aoa * Math.PI / 180;
        const defl = (x, y0) => { const d = x / (chord * 0.55), bump = Math.exp(-d * d), fall = 1 - Math.min(1, Math.abs(y0) / (U * 0.7)); return Math.sin(a) * chord * 0.5 * d * bump * fall; };
        for (let i = -9; i <= 9; i++) {
          if (i === 0) continue;
          const y0 = i * U * 0.075;
          ctx.strokeStyle = stall && i < 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath();
          for (let x = -W; x <= W; x += 6) {
            const d = (x / (chord * 0.55)), bump = Math.exp(-d * d);
            let dy = y0 + (i > 0 ? 1 : -1) * 0; const sgn = y0 > 0 ? 1 : -1;
            let yy = y0 + (-sgn) * 0;
            const rot = -Math.sin(a) * x * 0.0 ;
            yy = y0 + defl(x, y0);
            if (stall && y0 < 0 && x > 0) yy += Math.sin(x * 0.05 + t * 12 + i) * 10 * Math.min(1, x / chord) * 1.2;
            if (stall && y0 > 0 && x > 0) yy -= bump * 6;
            x === -W ? ctx.moveTo(cx - cx + x, yy) : ctx.lineTo(x, yy);
          }
          ctx.stroke();
        }
        /* particule de aer care curg pe liniile de curent */
        ctx.fillStyle = '#fff';
        for (const w of wind) {
          w.x += dt * (0.3 + v * 1.3) * (0.7 + w.k * 0.6); if (w.x > 1.1) { w.x = -0.1; w.y = Math.random(); }
          const lx = (w.x - 0.5) * W * 1.1, y0 = (w.y - 0.5) * U * 1.5; if (Math.abs(y0) < U * 0.07) continue;
          const d = lx / (chord * 0.55), bump = Math.exp(-d * d), sgn = y0 > 0 ? 1 : -1;
          let yy = y0 + defl(lx, y0);
          if (stall && y0 < 0 && lx > 0) yy += Math.sin(lx * 0.05 + t * 12) * 10 * Math.min(1, lx / chord) * 1.2;
          ctx.fillRect(lx, yy, 3, 1.6);
        }
        /* aripa (rotită: unghi pozitiv = botul în sus) */
        ctx.save(); ctx.rotate(a);
        ctx.fillStyle = '#e8edf5'; ctx.strokeStyle = '#3a4150'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = -chord / 2; x <= chord / 2; x += 4) { const y = airfoilY(x, true); x === -chord / 2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        for (let x = chord / 2; x >= -chord / 2; x -= 4) ctx.lineTo(x, airfoilY(x, false) * 0.3);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        /* o linie de referință spre direcția aerului */
        ctx.strokeStyle = 'rgba(255,80,80,0.0)'; ctx.restore();
        ctx.restore();
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '700 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('avionul zboară spre dreapta →', cx, api.cy - api.unit + 14);
        /* săgeți de forță */
        const arrow = (x, y, dy, col, txt) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + dy); ctx.stroke(); const s = dy < 0 ? -1 : 1; ctx.beginPath(); ctx.moveTo(x, y + dy + s * 14); ctx.lineTo(x - 9, y + dy); ctx.lineTo(x + 9, y + dy); ctx.fill(); ctx.font = '700 13px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 14, y + dy / 2 + 4); };
        arrow(cx + U * 0.25, py, -lift * 280, '#7dffb0', 'Portanță');
        arrow(cx - U * 0.25, py, MASS * 280, '#ff7a8a', 'Greutate');
        ctx.fillStyle = '#fff'; ctx.font = '700 15px system-ui,sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('Altitudine: ' + fmt(alt * 12000, 0) + ' m', 14, 86);
        ctx.fillText('Unghi: ' + fmt(aoa, 0) + '°', 14, 106);
        info.innerHTML = lift > MASS * 1.04 ? '⬆️ <b>Urcă</b> (portanța > greutate)' : lift < MASS * 0.96 ? '⬇️ <b>Coboară</b> (portanța < greutate)' : '➡️ <b>Zbor orizontal</b>' ;
        if (stall) info.innerHTML += ' · <b style="color:#ff8a8a">angajare!</b>';
      }
      return { frame: frame };
    }
  });

  /* ============================================================
     3) CALCULATORUL — BIȚI
     ============================================================ */
  defineModule({
    id: 'binary', title: 'Cum „gândește” calculatorul', sub: 'Totul e făcut din 0 și 1',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'num', bits = [0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0];   // 3 octeți
      const bs = {};
      const MODES = [['num', '🔢 Numere'], ['chr', '🔤 Litere'], ['col', '🎨 Culori']];
      const rm = api.row('');
      MODES.forEach(([k, t]) => { bs[k] = api.button(rm, t, () => setMode(k)); });
      const r2 = api.row('');
      api.button(r2, '🎲 Aleator', () => { const n = mode === 'col' ? 24 : 8; for (let i = 0; i < n; i++) bits[i] = Math.random() < 0.5 ? 1 : 0; });
      api.button(r2, '0️⃣ Toate 0', () => { bits.fill(0); });
      api.button(r2, '1️⃣ Toate 1', () => { const n = mode === 'col' ? 24 : 8; for (let i = 0; i < n; i++) bits[i] = 1; });
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      const MSG = {
        num: 'Un calculator are doar întrerupătoare: pornit (1) sau oprit (0). Cu <b>8 biți</b> (un octet) se pot număra 256 de valori: de la 0 la 255. Atinge un bit ca să-l schimbi! Fiecare bit valorează dublu față de cel din dreapta: 1, 2, 4, 8, 16, 32, 64, 128.',
        chr: 'Literele sunt tot numere! Fiecare literă are un cod (ASCII). „A” e 65, „B” e 66… Un calculator le păstrează ca biți. Schimbă biții și vezi ce literă iese.',
        col: 'O culoare = 3 octeți: cât <b>Roșu</b>, cât <b>Verde</b>, cât <b>Albastru</b> (0–255 fiecare). Așa afișează ecranul 16,7 milioane de culori!'
      };
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); api.say(MSG[m], 14000); }
      function layout() {
        const rows = mode === 'col' ? 3 : 1, W = api.freeW, cell = Math.min(60, (W - 20) / 8.6), gap = cell * 0.12;
        const total = 8 * cell + 7 * gap, x0 = (W - total) / 2;
        const rh = cell * 1.9, y0 = api.cy - (rows * rh) / 2 + (mode === 'col' ? 0 : -api.unit * 0.1);
        return { rows: rows, cell: cell, gap: gap, x0: x0, y0: y0, rh: rh };
      }
      api.pointer({ down: (x, y) => { const L = layout(); for (let r = 0; r < L.rows; r++) for (let i = 0; i < 8; i++) { const bx = L.x0 + i * (L.cell + L.gap), by = L.y0 + r * L.rh + L.cell * 0.3; if (x >= bx && x <= bx + L.cell && y >= by && y <= by + L.cell * 1.3) { bits[r * 8 + i] ^= 1; return; } } } });
      const byte = (r) => { let v = 0; for (let i = 0; i < 8; i++) v = v * 2 + bits[r * 8 + i]; return v; };
      setMode('num');
      function frame(dt, t) {
        bg(api, '#0a1226', '#05080f');
        const L = layout(), W = api.freeW;
        for (let r = 0; r < L.rows; r++) {
          for (let i = 0; i < 8; i++) {
            const bx = L.x0 + i * (L.cell + L.gap), by = L.y0 + r * L.rh + L.cell * 0.3, on = bits[r * 8 + i], val = 128 >> i;
            const tint = mode === 'col' ? (r === 0 ? '255,90,90' : r === 1 ? '90,230,120' : '100,150,255') : '255,214,102';
            ctx.fillStyle = on ? 'rgba(' + tint + ',0.95)' : '#1b2442'; ctx.strokeStyle = on ? '#fff' : '#3a4670'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, L.cell, L.cell * 1.3, 8) : ctx.rect(bx, by, L.cell, L.cell * 1.3); ctx.fill(); ctx.stroke();
            if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(bx + L.cell / 2, by + L.cell * 0.65, 0, bx + L.cell / 2, by + L.cell * 0.65, L.cell * 1.1); g.addColorStop(0, 'rgba(' + tint + ',0.4)'); g.addColorStop(1, 'rgba(' + tint + ',0)'); ctx.fillStyle = g; ctx.fillRect(bx - L.cell, by - L.cell, L.cell * 3, L.cell * 3); ctx.restore(); }
            ctx.fillStyle = on ? '#1a1a1a' : '#6a78a8'; ctx.font = '800 ' + Math.round(L.cell * 0.6) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(on ? '1' : '0', bx + L.cell / 2, by + L.cell * 0.85);
            ctx.fillStyle = on ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)'; ctx.font = '600 ' + Math.round(L.cell * 0.28) + 'px system-ui,sans-serif'; ctx.fillText(String(val), bx + L.cell / 2, by - 6);
          }
          if (mode === 'col') { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'left'; ctx.font = '700 12px system-ui,sans-serif'; ctx.fillText(['Roșu', 'Verde', 'Albastru'][r] + ' = ' + byte(r), L.x0, L.y0 + r * L.rh + L.cell * 0.05); }
        }
        const v = byte(0);
        if (mode === 'num') {
          const terms = []; for (let i = 0; i < 8; i++) if (bits[i]) terms.push(128 >> i);
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '800 ' + Math.round(L.cell * 1.3) + 'px system-ui,sans-serif'; ctx.fillText(String(v), W / 2, L.y0 + L.rh + 40);
          ctx.font = '600 14px system-ui,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText(terms.length ? terms.join(' + ') + ' = ' + v : 'toți biții sunt 0', W / 2, L.y0 + L.rh + 66);
          info.innerHTML = 'Valoare: <b>' + v + '</b> · în hexazecimal: <b>' + v.toString(16).toUpperCase().padStart(2, '0') + '</b>';
        } else if (mode === 'chr') {
          const ch = v >= 32 && v < 127 ? String.fromCharCode(v) : '·';
          ctx.fillStyle = '#ffd166'; ctx.textAlign = 'center'; ctx.font = '800 ' + Math.round(L.cell * 2.2) + 'px system-ui,sans-serif'; ctx.fillText(ch, W / 2, L.y0 + L.rh + 70);
          ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '600 14px system-ui,sans-serif'; ctx.fillText('cod ' + v + (v < 32 ? ' (caracter de control, nu se vede)' : ''), W / 2, L.y0 + L.rh + 98);
          info.innerHTML = 'Cod: <b>' + v + '</b> → <b>' + ch + '</b> · „' + 'ABC'.split('').map((c) => c + '=' + c.charCodeAt(0)).join(', ') + '”';
        } else {
          const R = byte(0), G = byte(1), B = byte(2);
          const sx = W / 2, sy = L.y0 + 3 * L.rh + 10, sw = Math.min(W - 40, 280);
          ctx.fillStyle = 'rgb(' + R + ',' + G + ',' + B + ')'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.rect(sx - sw / 2, sy, sw, 46); ctx.fill(); ctx.stroke();
          info.innerHTML = 'Culoare: <b>rgb(' + R + ', ' + G + ', ' + B + ')</b> · #' + [R, G, B].map((c) => c.toString(16).toUpperCase().padStart(2, '0')).join('');
        }
      }
      return { frame: frame };
    }
  });

  /* ============================================================
     4) MECANISME: roți dințate și pârghii
     ============================================================ */
  defineModule({
    id: 'mechanics', title: 'Mecanisme', sub: 'Roți dințate și pârghii',
    start: function (api) {
      const ctx = api.ctx;
      let mode = 'gears', nA = 12, nB = 24, nC = 8, rpm = 0.6, thA = 0, mL = 4, mR = 2, fulc = 0.5, tilt = 0, vT = 0;
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
      function gear(x, y, n, rad, th, col, label) {
        const hole = rad * 0.2, tooth = rad * 0.22, pitch = Math.PI * 2 / n;
        ctx.save(); ctx.translate(x, y); ctx.rotate(th);
        ctx.beginPath();
        for (let k = 0; k < n; k++) { const a = k * pitch; const r0 = rad - tooth * 0.5, r1 = rad + tooth * 0.5; ctx.lineTo(Math.cos(a - pitch * 0.28) * r0, Math.sin(a - pitch * 0.28) * r0); ctx.lineTo(Math.cos(a - pitch * 0.16) * r1, Math.sin(a - pitch * 0.16) * r1); ctx.lineTo(Math.cos(a + pitch * 0.16) * r1, Math.sin(a + pitch * 0.16) * r1); ctx.lineTo(Math.cos(a + pitch * 0.28) * r0, Math.sin(a + pitch * 0.28) * r0); }
        ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(0, 0, rad * 0.62, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.moveTo(Math.cos(k * 1.5708) * hole, Math.sin(k * 1.5708) * hole); ctx.lineTo(Math.cos(k * 1.5708) * rad * 0.58, Math.sin(k * 1.5708) * rad * 0.58); } ctx.stroke();
        ctx.fillStyle = '#0a1226'; ctx.beginPath(); ctx.arc(0, 0, hole, 0, 7); ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label + ' · ' + n + ' dinți', x, y + rad + 22);
      }
      function frame(dt, t) {
        bg(api, '#0b1330', '#05080f');
        const W = api.freeW, cx = api.cx, cy = api.cy, U = api.unit;
        if (mode === 'gears') {
          thA += rpm * Math.PI * 2 * dt;
          const m = Math.min(U * 0.12, (W - 30) / ((nA + nB + nC) * 0.5 + 8) * 0.5);        // „modulul”: raza = m·n/2
          const rA = m * nA / 2, rB = m * nB / 2, rC = m * nC / 2, gap = m * 0.0;
          const total = rA * 2 + rB * 2 + rC * 2, x0 = cx - total / 2 + rA, xB = x0 + rA + rB, xC = xB + rB + rC;
          const thB = Math.PI + Math.PI / nB - thA * nA / nB, thC = Math.PI + Math.PI / nC - thB * nB / nC;
          gear(x0, cy, nA, rA, thA, '#e8a23a', 'Roata 1');
          gear(xB, cy, nB, rB, thB, '#4aa3e0', 'Roata 2');
          gear(xC, cy, nC, rC, thC, '#7dd486', 'Roata 3');
          const w2 = -rpm * nA / nB, w3 = -w2 * nB / nC;
          ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '600 13px system-ui,sans-serif';
          ctx.fillText('↻ roata 1: ' + fmt(rpm, 2) + ' ture/s', 12, 84); ctx.fillText('roata 2: ' + fmt(w2, 2) + ' ture/s (' + (w2 * rpm < 0 ? 'sens opus' : 'același sens') + ')', 12, 102); ctx.fillText('roata 3: ' + fmt(-w3 * -1, 2) + ' ture/s', 12, 120);
          ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(nB > nA ? 'Roata 2 are mai mulți dinți → merge mai încet, dar mai cu forță.' : nB < nA ? 'Roata 2 are mai puțini dinți → merge mai repede, dar cu mai puțină forță.' : 'Același număr de dinți → aceeași viteză.', 12, 140);
        } else {
          const bw = Math.min(W - 40, U * 3), x0 = cx - bw / 2, py = cy + U * 0.35;
          const fx = x0 + bw * fulc;
          const tL = mL * (fx - x0) / bw, tR = mR * (x0 + bw - fx) / bw;      // momente (kg × fracție din bară)
          const target = clamp((tR - tL) * 0.55, -0.35, 0.35);
          vT += (target - tilt) * 40 * dt; vT *= Math.exp(-dt * 6); tilt += vT * dt;
          ctx.fillStyle = '#6b5a45'; ctx.beginPath(); ctx.moveTo(fx, py); ctx.lineTo(fx - 26, py + 56); ctx.lineTo(fx + 26, py + 56); ctx.closePath(); ctx.fill();
          ctx.save(); ctx.translate(fx, py); ctx.rotate(tilt);
          ctx.fillStyle = '#c9a56b'; ctx.fillRect(x0 - fx, -8, bw, 16);
          ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (let k = 1; k < 10; k++) ctx.fillRect(x0 - fx + bw * k / 10 - 1, -8, 2, 6);
          const wt = (x, mass, col) => { const s = 22 + mass * 3; ctx.fillStyle = col; ctx.fillRect(x - s / 2, -8 - s, s, s); ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(mass + ' kg', x, -8 - s / 2 + 4); };
          wt(x0 - fx + bw * 0.12, mL, '#e8683a'); wt(x0 - fx + bw * 0.88, mR, '#3a8ee8');
          ctx.restore();
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '600 12px system-ui,sans-serif';
          const dL = (fx - (x0 + bw * 0.12)) / bw * 10, dR = ((x0 + bw * 0.88) - fx) / bw * 10;
          info.innerHTML = 'Stânga: <b>' + mL + ' kg × ' + fmt(dL, 1) + '</b> = ' + fmt(mL * dL, 1) + ' · Dreapta: <b>' + mR + ' kg × ' + fmt(dR, 1) + '</b> = ' + fmt(mR * dR, 1) + (Math.abs(mL * dL - mR * dR) < 0.5 ? ' · ✅ <b>echilibru!</b>' : mL * dL > mR * dR ? ' · se lasă spre stânga' : ' · se lasă spre dreapta');
        }
      }
      setMode('gears');
      return { frame: frame };
    }
  });
})();
