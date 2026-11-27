/* Modul: Cele 5 simțuri — văz, auz, miros, gust, pipăit (fără sunet: undele se văd) */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const T = (ctx, s, x, y, o) => A.text(ctx, s, x, y, Object.assign({ size: 17 }, o || {}));
  const LB = (ctx, s, x, y, tx, ty) => A.label(ctx, s, x, y, { size: 15, tx: tx, ty: ty });
  const emoji = (ctx, e, x, y, s) => { ctx.save(); ctx.font = s + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, x, y); ctx.restore(); };
  const BR = [880, 110];

  defineModule({
    id: 'senses', title: 'Cele 5 simțuri', sub: 'Cum vedem, auzim, mirosim, gustăm și simțim',
    start: function (api) {
      const ctx = api.ctx; let sense = 'eye', st = 0, light = 0.5, loud = 0.6, pitch = 0.5, smell = 0, taste = 0, touch = 0;
      const r1 = api.row(''), bs = {};
      [['eye', '👁️ Văzul'], ['ear', '👂 Auzul'], ['nose', '👃 Mirosul'], ['tongue', '👅 Gustul'], ['skin', '✋ Pipăitul']].forEach(([k, s]) => { bs[k] = api.button(r1, s, () => set(k)); });
      const rows = { eye: api.row(''), ear: api.row(''), nose: api.row(''), tongue: api.row(''), skin: api.row('') };
      api.slider(rows.eye, { label: 'Lumina', min: 0, max: 1, step: 0.01, value: light, fmt: (v) => v < 0.3 ? 'întuneric 🌙' : v > 0.7 ? 'soare puternic ☀️' : 'normală', onInput: (v) => { light = v; } });
      api.slider(rows.ear, { label: 'Cât de tare', min: 0.1, max: 1, step: 0.01, value: loud, fmt: (v) => v < 0.35 ? 'încet (șoaptă)' : v > 0.75 ? 'foarte tare' : 'normal', onInput: (v) => { loud = v; } });
      api.slider(rows.ear, { label: 'Gros sau subțire', min: 0, max: 1, step: 0.01, value: pitch, fmt: (v) => v < 0.35 ? 'gros (tobă)' : v > 0.7 ? 'subțire (fluier)' : 'mijlociu', onInput: (v) => { pitch = v; } });
      const SM = [['🌸', 'flori', '#ff8ac0'], ['🍕', 'pizza', '#ffb43d'], ['🧀', 'brânză', '#ffe066'], ['🍋', 'lămâie', '#c8f04a']];
      SM.forEach(([e, n], i) => api.button(rows.nose, e + ' ' + n, () => { smell = i; st = 0; }));
      const TS = [['🍭', 'Dulce', '#ff8ac0', 'acadeaua'], ['🥨', 'Sărat', '#ffffff', 'covrigul'], ['🍋', 'Acru', '#d4f04a', 'lămâia'], ['☕', 'Amar', '#9a6a3a', 'cafeaua'], ['🍅', 'Gustos (umami)', '#ff5a3a', 'roșia']];
      TS.forEach(([e, n], i) => api.button(rows.tongue, e + ' ' + n, () => { taste = i; st = 0; }));
      const TO = [['🪶', 'pană', 'atingere ușoară', '#7dffb0'], ['🧊', 'gheață', 'rece!', '#7ad0ff'], ['☕', 'cană fierbinte', 'fierbinte!', '#ff7a4a'], ['🌵', 'țeapă', 'au, doare!', '#ff4d6d']];
      TO.forEach(([e, n], i) => api.button(rows.skin, e + ' ' + n, () => { touch = i; st = 0; }));
      const MSG = {
        eye: '<b>Văzul.</b> Lumina intră în ochi prin <b>pupilă</b> (gaura neagră). <b>Cristalinul</b> e ca o lupă: face o imagine pe fundul ochiului, pe <b>retină</b>, dar <b>răsturnată</b>! Nervul optic o duce la creier, care o întoarce la loc. Schimbă lumina și vezi cum se strânge pupila.',
        ear: '<b>Auzul.</b> Sunetul e aer care <b>vibrează</b>. Undele intră în ureche și fac să vibreze <b>timpanul</b>, ca pielea unei tobe. Trei oscioare mititele (cele mai mici din corp!) duc vibrația la <b>melc</b>, unde niște firișoare o transformă în semnal pentru creier.',
        nose: '<b>Mirosul.</b> Din flori, mâncare sau orice altceva zboară bucățele <b>invizibile</b> prin aer. Când respiri, ele ajung sus, în nas, unde sunt celule speciale care le „recunosc” și anunță creierul. Nasul poate deosebi mii de mirosuri!',
        tongue: '<b>Gustul.</b> Pe limbă ai mii de <b>papile gustative</b>. Ele simt 5 gusturi: <b>dulce, sărat, acru, amar și gustos (umami)</b>. Fiecare parte a limbii le simte pe toate. Știai că mirosul ajută mult la gust? De aceea, când ești răcit, mâncarea pare fără gust.',
        skin: '<b>Pipăitul.</b> Pielea e cel mai mare organ! În ea sunt senzori pentru <b>atingere, apăsare, cald, rece și durere</b>. Când atingi ceva fierbinte, mâna se retrage <b>singură</b>, înainte să te gândești: e un <b>reflex</b> care te apără.'
      };
      function set(k) { sense = k; st = 0; for (const q in bs) bs[q].classList.toggle('on', q === k); for (const q in rows) rows[q].style.display = q === k ? '' : 'none'; api.say(MSG[k]); api.layout(); }

      function brain(t, on, txt) { window.MiniBrain(ctx, BR[0], BR[1], 52, on ? 0.6 + 0.4 * Math.sin(t * 6) : 0, t); T(ctx, 'creierul', BR[0], BR[1] + 62, { size: 15, color: '#ffd0dc' }); if (txt && on) window.ThinkBubble(ctx, BR[0] - 70, BR[1] - 70, 18, txt); }

      function drawEye(t) {
        const ex = 560, ey = 320, R = 165, pr = lerp(34, 12, light);
        /* obiectul: un copac */
        const ox = 120, oyB = 420, oyT = 210;
        ctx.fillStyle = '#7a4a2a'; ctx.fillRect(ox - 10, 330, 20, 90); ctx.fillStyle = '#3f9a3c'; ctx.beginPath(); ctx.arc(ox, 280, 70, 0, TAU); ctx.fill(); ctx.fillStyle = '#e2333f'; [[-25, 270], [20, 300], [10, 245]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(ox + dx, dy, 9, 0, TAU); ctx.fill(); });
        A.groundShadow(ctx, ox, 422, 60, 8, 0.4);
        /* razele de lumină: de la vârf și de la bază, se încrucișează în cristalin */
        const lx = ex - R + 52, rx = ex + R - 18;
        const flow = (t * 0.6) % 1;
        [[oyT, '#ffe36a'], [oyB, '#7ad0ff']].forEach(([oy, c]) => { const iy = ey + (ey - oy) * 0.42; ctx.strokeStyle = A.rgba(c, 0.75); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox + 40, oy); ctx.lineTo(lx, ey + (oy - ey) * 0.12); ctx.lineTo(rx, iy); ctx.stroke(); for (let i = 0; i < 3; i++) { const u = (flow + i / 3) % 1, px = u < 0.6 ? lerp(ox + 40, lx, u / 0.6) : lerp(lx, rx, (u - 0.6) / 0.4), py = u < 0.6 ? lerp(oy, ey + (oy - ey) * 0.12, u / 0.6) : lerp(ey + (oy - ey) * 0.12, iy, (u - 0.6) / 0.4); A.glow(ctx, px, py, 9, c, 0.9); } });
        /* globul ocular */
        const g = ctx.createRadialGradient(ex - 40, ey - 50, 20, ex, ey, R); g.addColorStop(0, '#ffffff'); g.addColorStop(0.8, '#f4e6e2'); g.addColorStop(1, '#e2b8b0'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, R, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(200,225,240,0.35)'; ctx.beginPath(); ctx.arc(ex, ey, R - 10, 0, TAU); ctx.fill();
        /* retina (fundul ochiului) */
        ctx.strokeStyle = '#e0604a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(ex, ey, R - 6, -1.05, 1.05); ctx.stroke();
        /* imaginea răsturnată pe retină */
        ctx.save(); ctx.translate(rx - 10, ey); ctx.scale(0.28, -0.28); ctx.fillStyle = '#7a4a2a'; ctx.fillRect(-10, 10, 20, 90); ctx.fillStyle = '#3f9a3c'; ctx.beginPath(); ctx.arc(0, -40, 70, 0, TAU); ctx.fill(); ctx.restore();
        /* corneea, irisul, cristalinul */
        ctx.fillStyle = 'rgba(190,225,255,0.5)'; ctx.strokeStyle = 'rgba(140,190,230,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ex - R + 40, ey, 75, Math.PI * 0.68, Math.PI * 1.32); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#4a7ac0'; ctx.fillRect(ex - R + 40, ey - 78, 12, 78 - pr); ctx.fillRect(ex - R + 40, ey + pr, 12, 78 - pr);
        ctx.fillStyle = 'rgba(255,240,200,0.85)'; ctx.strokeStyle = '#d8b878'; ctx.beginPath(); ctx.ellipse(lx + 6, ey, 18, 48, 0, 0, TAU); ctx.fill(); ctx.stroke();
        /* nervul optic */
        const nerve = [[ex + R - 4, ey + 20], [ex + R + 60, ey + 10], [BR[0] - 60, 260], [BR[0] - 10, BR[1] + 40]];
        A.tube(ctx, [[ex + R - 10, ey + 20], [ex + R + 50, ey + 14]], 26, '#f0d080');
        window.NervePulse(ctx, nerve, t, { n: 3, active: true });
        brain(t, true, '🌳 Un copac!');
        /* etichete */
        LB(ctx, 'Corneea', ex - R + 20, ey - 150, ex - R - 30, ey - 40); LB(ctx, 'Irisul (colorat)', ex - 130, ey + 175, ex - R + 46, ey + 60); LB(ctx, 'Cristalinul (lupa)', ex - 40, ey - 200, lx + 6, ey - 40); LB(ctx, 'Retina', ex + 120, ey + 200, ex + R - 12, ey + 80); LB(ctx, 'Nervul optic', ex + R + 90, ey + 80, ex + R + 40, ey + 18);
        T(ctx, 'imaginea e răsturnată!', rx - 60, ey - 40, { size: 14, color: '#ffe36a' });
        /* ochiul din față: pupila */
        const fx = 140, fy = 530; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(fx, fy, 70, 40, 0, 0, TAU); ctx.fill(); const ig = ctx.createRadialGradient(fx, fy, pr * 0.5, fx, fy, 34); ig.addColorStop(0, '#2a4a7a'); ig.addColorStop(1, '#5a9ad8'); ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(fx, fy, 34, 0, TAU); ctx.fill(); ctx.fillStyle = '#05070c'; ctx.beginPath(); ctx.arc(fx, fy, pr * 0.75, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(fx - 10, fy - 10, 5, 0, TAU); ctx.fill();
        T(ctx, 'pupila ' + (light > 0.65 ? 'mică (multă lumină)' : light < 0.35 ? 'mare (puțină lumină)' : ''), fx + 160, fy, { size: 15 });
      }

      function drawEar(t) {
        const amp = loud, wl = lerp(70, 22, pitch), sx = 70, sy = 300;
        /* toba */
        ctx.fillStyle = '#c0392b'; ctx.fillRect(sx - 40, sy - 30, 70, 70); ctx.fillStyle = '#f4ead8'; ctx.beginPath(); ctx.ellipse(sx + 30, sy + 5, 14, 35 + Math.sin(t * lerp(8, 30, pitch)) * 3 * amp, 0, 0, TAU); ctx.fill();
        /* undele de sunet (se văd, nu se aud) */
        const sp = 120; for (let i = 0; i < 12; i++) { const d = ((t * sp) % wl) + i * wl; if (d > 300) continue; const a = (1 - d / 330) * amp; ctx.strokeStyle = 'rgba(125,200,255,' + a + ')'; ctx.lineWidth = 2 + amp * 4; ctx.beginPath(); ctx.arc(sx + 30, sy + 5, d + 10, -0.45, 0.45); ctx.stroke(); }
        /* urechea externă și canalul */
        const px = 330; ctx.fillStyle = '#e8b48e'; ctx.beginPath(); ctx.moveTo(px + 30, sy - 130); ctx.bezierCurveTo(px - 60, sy - 140, px - 70, sy + 20, px - 10, sy + 70); ctx.bezierCurveTo(px + 10, sy + 110, px + 50, sy + 90, px + 40, sy + 40); ctx.lineTo(px + 40, sy - 30); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#c08a64'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px + 10, sy - 100); ctx.bezierCurveTo(px - 40, sy - 100, px - 40, sy + 10, px, sy + 40); ctx.stroke();
        ctx.fillStyle = '#d89a74'; ctx.fillRect(px + 30, sy - 22, 130, 44); ctx.fillStyle = '#e8b48e'; ctx.fillRect(px + 160, sy - 120, 400, 260);
        ctx.fillStyle = '#b8765a'; ctx.fillRect(px + 30, sy - 16, 130, 32);
        /* timpanul vibrează */
        const dx = Math.sin(t * lerp(10, 40, pitch)) * 5 * amp; ctx.strokeStyle = '#ffcfb8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px + 160, sy - 30); ctx.quadraticCurveTo(px + 160 + dx * 2, sy, px + 160, sy + 30); ctx.stroke();
        /* oscioarele */
        ctx.fillStyle = '#f4ead8'; ctx.strokeStyle = '#b8a888'; ctx.lineWidth = 2; const ob = dx * 0.6;
        ctx.beginPath(); ctx.ellipse(px + 182 + ob, sy - 8, 16, 7, 0.6, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(px + 210 + ob, sy - 18, 14, 9, -0.3, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(px + 222 + ob, sy - 8); ctx.lineTo(px + 246 + ob, sy + 4); ctx.lineTo(px + 236 + ob, sy + 12); ctx.closePath(); ctx.fill(); ctx.stroke();
        /* melcul */
        const cx = px + 320, cy = sy + 10; ctx.strokeStyle = '#f0a0b0'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); for (let a = 0; a < TAU * 2.3; a += 0.1) { const rr = 70 - a * 4.6; ctx.lineTo(cx + Math.cos(a + Math.PI) * rr, cy + Math.sin(a + Math.PI) * rr * 0.9); } ctx.stroke();
        const hot = 1 - pitch; for (let k = 0; k < 24; k++) { const a = k / 24 * TAU * 2.3, rr = 70 - a * 4.6, on = Math.abs(k / 24 - hot) < 0.12; if (on) A.glow(ctx, cx + Math.cos(a + Math.PI) * rr, cy + Math.sin(a + Math.PI) * rr * 0.9, 12, '#ffe36a', amp); }
        const nerve = [[cx + 30, cy - 20], [cx + 120, cy - 80], [BR[0] - 70, BR[1] + 60], [BR[0] - 20, BR[1] + 30]];
        window.NervePulse(ctx, nerve, t, { n: 2 + Math.round(amp * 3), speed: 0.8 });
        brain(t, true, pitch < 0.35 ? '🥁 Bum-bum!' : pitch > 0.7 ? '🎵 Fiuuu!' : '🔔 Ding!');
        LB(ctx, 'Pavilionul urechii', px - 60, sy + 170, px - 20, sy + 60); LB(ctx, 'Timpanul', px + 150, sy + 180, px + 160, sy + 28); LB(ctx, '3 oscioare', px + 230, sy - 150, px + 210, sy - 22); LB(ctx, 'Melcul', cx + 40, sy + 180, cx + 10, cy + 60); LB(ctx, 'Unde de sunet', sx + 160, sy - 170, sx + 180, sy - 60);
      }

      function drawNose(t) {
        const s = SM[smell], k = clamp(st / 3, 0, 1);
        /* profilul capului */
        ctx.fillStyle = '#e8b48e'; ctx.beginPath(); ctx.moveTo(560, 60); ctx.bezierCurveTo(460, 60, 420, 140, 430, 200); ctx.lineTo(400, 300); ctx.quadraticCurveTo(395, 320, 425, 325); ctx.lineTo(430, 360); ctx.quadraticCurveTo(445, 380, 440, 400); ctx.quadraticCurveTo(470, 470, 540, 480); ctx.lineTo(560, 580); ctx.lineTo(820, 580); ctx.lineTo(820, 60); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#c87a6a'; ctx.beginPath(); ctx.moveTo(430, 300); ctx.quadraticCurveTo(470, 240, 540, 200); ctx.quadraticCurveTo(600, 190, 640, 230); ctx.quadraticCurveTo(620, 300, 560, 320); ctx.quadraticCurveTo(480, 330, 430, 318); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(470 + i * 10, 300 - i * 25); ctx.quadraticCurveTo(540, 280 - i * 25, 610, 290 - i * 22); ctx.stroke(); }
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(505, 175, 14, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a3a5a'; ctx.beginPath(); ctx.arc(500, 175, 7, 0, TAU); ctx.fill();
        /* zona mirosului (sus în nas) */
        const ry = 200, rx0 = 520, rx1 = 610; ctx.fillStyle = '#ffd36a'; ctx.fillRect(rx0, ry - 8, rx1 - rx0, 10);
        for (let i = 0; i < 8; i++) { ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rx0 + i * 12, ry); ctx.lineTo(rx0 + i * 12 + 4, ry + 14); ctx.stroke(); }
        /* sursa mirosului */
        emoji(ctx, s[0], 130, 330, 90);
        for (let i = 0; i < 26; i++) {
          const u = ((t * 0.18 + i / 26) % 1), p0 = [170, 320 + Math.sin(i) * 30], p1 = [410, 312], p2 = [520 + (i % 7) * 12, ry + 8];
          let x, y; if (u < 0.65) { const v = u / 0.65; x = lerp(p0[0], p1[0], v); y = lerp(p0[1], p1[1], v) + Math.sin(v * 9 + i) * 18 * (1 - v); } else { const v = (u - 0.65) / 0.35; x = lerp(p1[0], p2[0], v); y = lerp(p1[1], p2[1], v); }
          ctx.fillStyle = A.rgba(s[2], 0.9); ctx.beginPath(); ctx.arc(x, y, 5 + (i % 3), 0, TAU); ctx.fill();
        }
        window.NervePulse(ctx, [[565, ry - 8], [620, 130], [BR[0] - 80, BR[1] + 30], [BR[0] - 40, BR[1] + 20]], t, { n: 3 });
        brain(t, true, s[0] + ' Miroase a ' + s[1] + '!');
        LB(ctx, 'bucățele de miros (invizibile)', 260, 210, 300, 300); LB(ctx, 'celulele mirosului', 600, 130, 570, ry - 6); LB(ctx, 'nasul', 330, 420, 410, 320);
      }

      function drawTongue(t) {
        const s = TS[taste], k = clamp(st / 1.5, 0, 1);
        /* gura deschisă și limba */
        ctx.fillStyle = '#7a1e2a'; ctx.beginPath(); ctx.ellipse(380, 330, 300, 210, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; for (let i = 0; i < 10; i++) { const a = Math.PI + 0.25 + i * 0.27; ctx.beginPath(); A.roundRectPath(ctx, 380 + Math.cos(a) * 270 - 18, 330 + Math.sin(a) * 185 - 14, 36, 34, 8); ctx.fill(); }
        const tg = ctx.createRadialGradient(380, 300, 30, 380, 380, 260); tg.addColorStop(0, '#ff9aa8'); tg.addColorStop(1, '#e05a70'); ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(150, 360); ctx.bezierCurveTo(160, 220, 600, 220, 610, 360); ctx.bezierCurveTo(600, 520, 160, 520, 150, 360); ctx.fill();
        ctx.strokeStyle = 'rgba(160,40,60,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(380, 260); ctx.lineTo(380, 470); ctx.stroke();
        for (let i = 0; i < 90; i++) { const x = 190 + ((i * 53) % 380), y = 270 + ((i * 37) % 210); if (((x - 380) / 220) ** 2 + ((y - 370) / 120) ** 2 > 1) continue; ctx.fillStyle = 'rgba(255,200,210,0.7)'; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill(); }
        /* mâncarea și bucățelele de gust */
        emoji(ctx, s[0], 380, lerp(80, 150, k), 80);
        for (let i = 0; i < 18; i++) { const u = ((t * 0.5 + i / 18) % 1), x = 380 + Math.sin(i * 2.3) * 150 * u, y = lerp(170, 380 + Math.cos(i) * 60, u); ctx.fillStyle = A.rgba(s[2] === '#ffffff' ? '#f0f0f0' : s[2], 1 - u * 0.3); ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); }
        /* papila mărită */
        const zx = 760, zy = 400; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(470, 360); ctx.lineTo(zx - 110, zy); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#2a1a24'; ctx.beginPath(); ctx.arc(zx, zy, 110, 0, TAU); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.arc(zx, zy, 108, 0, TAU); ctx.clip();
        ctx.fillStyle = '#e8788a'; ctx.fillRect(zx - 110, zy - 40, 220, 160); ctx.fillStyle = '#ffd0d8'; ctx.beginPath(); ctx.ellipse(zx, zy + 30, 40, 55, 0, 0, TAU); ctx.fill();
        for (let i = 0; i < 5; i++) { ctx.fillStyle = i === taste ? s[2] === '#ffffff' ? '#e8e8f8' : s[2] : 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(zx - 24 + i * 12, zy + 30, 5, 30, (i - 2) * 0.15, 0, TAU); ctx.fill(); }
        for (let i = 0; i < 8; i++) { const u = ((t * 0.7 + i / 8) % 1); ctx.fillStyle = s[2] === '#ffffff' ? '#f0f0f0' : s[2]; ctx.beginPath(); ctx.arc(zx - 30 + (i * 17) % 60, zy - 100 + u * 110, 5, 0, TAU); ctx.fill(); }
        ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(zx, zy, 110, 0, TAU); ctx.stroke();
        T(ctx, 'o papilă gustativă, mărită', zx, zy + 132, { size: 15 });
        window.NervePulse(ctx, [[zx, zy + 80], [zx + 100, zy - 60], [BR[0] - 30, BR[1] + 110], [BR[0], BR[1] + 45]], t, { n: 3 });
        brain(t, k > 0.3, s[1] + '! ' + ['😋', '🙂', '😖', '😝', '😋'][taste]);
      }

      function drawSkin(t) {
        const o = TO[touch], k = clamp(st / 1.6, 0, 1), hot = touch >= 2;
        const pull = hot && st > 1.6 ? A.ease.out(clamp((st - 1.6) / 0.3, 0, 1)) * 60 : 0;
        /* brațul și mâna */
        ctx.save(); ctx.translate(-pull, 0);
        ctx.fillStyle = '#e8b48e'; ctx.beginPath(); ctx.moveTo(-20, 230); ctx.lineTo(260, 250); ctx.lineTo(260, 330); ctx.lineTo(-20, 360); ctx.fill();
        ctx.beginPath(); ctx.ellipse(300, 290, 70, 55, 0, 0, TAU); ctx.fill();
        [[-38, 70], [-14, 82], [10, 78], [32, 64]].forEach(([dy, l]) => { A.roundRectPath(ctx, 340, 290 + dy - 10, l, 22, 11); ctx.fill(); });
        A.roundRectPath(ctx, 290, 320, 60, 22, 11); ctx.fill();
        ctx.restore();
        /* obiectul se apropie de deget */
        const ox = lerp(700, 440, A.ease.inOut(k)), oy = 290 - 14;
        emoji(ctx, o[0], ox + 20, oy, 70);
        /* nervul spre creier, prin brațul și măduva spinării */
        const nerve = [[410 - pull, 280], [250 - pull, 270], [80, 250], [140, 130], [BR[0] - 160, 70], [BR[0] - 50, BR[1]]];
        window.NervePulse(ctx, nerve, t, { n: 3, active: k > 0.9, color: o[3] });
        brain(t, k > 0.95, o[0] + ' ' + o[2]);
        if (hot && st > 1.6) A.label(ctx, '⚡ Reflex: mâna se retrage singură!', 300, 450, { size: 16, color: '#ffe36a' });
        /* pielea mărită */
        const bx = 560, by = 330, bw = 380, bh = 230;
        ctx.save(); A.roundRectPath(ctx, bx, by, bw, bh, 16); ctx.clip();
        ctx.fillStyle = '#f2c6a8'; ctx.fillRect(bx, by, bw, 50); ctx.fillStyle = '#e8a08a'; ctx.fillRect(bx, by + 50, bw, 110); ctx.fillStyle = '#ffe6a0'; ctx.fillRect(bx, by + 160, bw, 70);
        for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(255,240,180,0.6)'; ctx.beginPath(); ctx.arc(bx + 30 + i * 65, by + 195, 22, 0, TAU); ctx.fill(); }
        const R = [['atingere', bx + 70, by + 70, 0], ['rece', bx + 160, by + 60, 1], ['cald', bx + 240, by + 62, 2], ['durere', bx + 320, by + 55, 3]];
        R.forEach(([n, x, y, i]) => { const on = i === touch && k > 0.9; if (on) A.glow(ctx, x, y, 40, o[3], 0.9); ctx.strokeStyle = on ? '#fff' : 'rgba(255,240,200,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, by + 150); ctx.lineTo(x, y + 10); ctx.stroke(); if (i === 0) { ctx.fillStyle = '#f8d8c8'; ctx.beginPath(); ctx.ellipse(x, y, 12, 18, 0, 0, TAU); ctx.fill(); ctx.stroke(); } else { for (let j = -1; j <= 1; j++) { ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(x + j * 14, y - 12); ctx.stroke(); } } A.text(ctx, n, x, by + 140, { size: 13 }); });
        ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; A.roundRectPath(ctx, bx, by, bw, bh, 16); ctx.stroke();
        T(ctx, 'pielea, văzută la microscop', bx + bw / 2, by - 14, { size: 15 });
      }

      set('eye');
      return {
        frame: function (dt, t) {
          st += dt;
          A.scene(ctx, api.W, api.H, 'body');
          const v = window.Fit(api, 1000, 600);
          ctx.save(); v.apply(ctx);
          ({ eye: drawEye, ear: drawEar, nose: drawNose, tongue: drawTongue, skin: drawSkin })[sense](t);
          ctx.restore();
        }
      };
    }
  });
})();
