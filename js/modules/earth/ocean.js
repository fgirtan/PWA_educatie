/* Modul: Oceane și adâncimi */
(function () {
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtN = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 0 : d });
  const mix = (c1, c2, t) => [0, 1, 2].map((i) => Math.round(lerp(c1[i], c2[i], clamp(t, 0, 1))));
  const rgb = (c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';

  /* ============================================================
     5) OCEANE ȘI ADÂNCIMI
     ============================================================ */
  defineModule({
    id: 'ocean', title: 'Oceane și adâncimi', sub: 'Scufundă-te și vezi cine trăiește acolo',
    start: function (api) {
      const ctx = api.ctx, MAX = 10935;
      let depth = 0, auto = false, W0 = 0;
      const ZONES = [[0, 200, 'Zona luminii', 'Soarele ajunge până aici. Aici trăiește 90% din viața mării: pești, delfini, țestoase, corali.'], [200, 1000, 'Zona de amurg', 'Lumina scade repede. Peștii au ochi mari și mulți strălucesc singuri (bioluminescență).'], [1000, 4000, 'Miezul nopții', 'Întuneric total și frig (2–4°C). Presiunea e de sute de ori mai mare ca la suprafață.'], [4000, 6000, 'Abisul', 'Aproape toată lumea e pustie, dar tot trăiesc aici caracatițe „Dumbo” și castraveți de mare.'], [6000, 11000, 'Hadalul (șanțurile)', 'Cele mai adânci locuri: peste 1.000 de atmosfere. Trăiesc doar creaturi mici, ca peștele-melc și crustaceii.']];
      /* viețuitoare: nume, interval de adâncime, tip desen, fapt */
      const SP = [
        ['Delfin', 0, 250, '🐬', 'Delfinii se scufundă rar sub 300 m. Respiră aer, ca noi!'],
        ['Țestoasă de mare', 0, 1000, '🐢', 'Țestoasa-piele se poate scufunda la peste 1.000 m.'],
        ['Rechin', 0, 1200, '🦈', 'Rechinii sunt pe Pământ de mai mult timp decât copacii.'],
        ['Ton', 0, 500, '🐟', 'Tonul înoată cu până la 70 km/h.'],
        ['Meduză', 0, 900, '🪼', 'Meduzele nu au creier, inimă sau oase — și există de 500 de milioane de ani.'],
        ['Calmar', 300, 1000, '🦑', 'Calmarii uriași au ochi cât farfuria — cei mai mari din lume.'],
        ['Cașalot', 200, 2200, '🐋', 'Cașalotul se scufundă până la 2.000 m ținându-și respirația ~1 oră, ca să vâneze calmari.'],
        ['Pește-viperă', 400, 2500, 'viper', 'Peștele-viperă are colți atât de lungi că nu-i încap în gură!'],
        ['Pește-pescar', 800, 3500, 'angler', 'Femela are o „undiță” luminoasă pe cap, cu care momește prada.'],
        ['Caracatiță Dumbo', 2500, 6000, '🐙', 'Se mișcă bătând din „urechi”, ca elefantul Dumbo.'],
        ['Castravete de mare', 4500, 10000, 'cuke', 'Trăiește pe fundul abisului și mănâncă „ninsoarea marină” căzută de sus.'],
        ['Pește-melc', 6000, 8200, 'snail', 'Cel mai adânc pește: trăiește la peste 8.000 m. Corpul lui e translucid și moale.'],
        ['Amfipod', 7000, 10935, 'amph', 'Crustaceu mic care trăiește în Groapa Marianelor, la ~11 km!']
      ];
      const MARK = [[40, 'Scafandru profesionist'], [300, 'Cel mai adânc loc pentru delfini'], [3800, 'Titanicul'], [8849, 'Everestul ar fi acoperit'], [10935, 'Groapa Marianelor (Challenger Deep)']];
      const crit = [];
      SP.forEach((s, i) => { const n = clamp(Math.round((s[2] - s[1]) / 600), 2, i === 6 ? 3 : 5); for (let k = 0; k < n; k++) crit.push({ i: i, d: lerp(Math.max(s[1], 25), s[2], (k + 0.15 + Math.random() * 0.7) / n), x: (k * 0.618 + i * 0.29 + Math.random() * 0.15) % 1, dx: (Math.random() < 0.5 ? -1 : 1) * (0.01 + Math.random() * 0.02), ph: Math.random() * 6.3 }); });
      const snow = []; for (let i = 0; i < 40; i++) snow.push([Math.random(), Math.random(), 0.6 + Math.random() * 1.4]);

      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Adâncime', min: 0, max: 1, step: 0.0005, value: 0, fmt: () => fmtN(depth) + ' m', onInput: (v) => { depth = Math.pow(v, 1.6) * MAX; auto = false; } });
      const bA = api.button(r1, '⬇ Coboară singur', () => { auto = !auto; if (depth >= MAX - 5) depth = 0; bA.innerHTML = auto ? '⏸ Oprește' : '⬇ Coboară singur'; });
      const r2 = api.row('Oceane și mări');
      [['🌊 Pacific', 'Oceanul Pacific: cel mai mare — 165 milioane km², adică mai mult decât toate uscaturile la un loc. Aici e și Groapa Marianelor.'], ['Atlantic', 'Oceanul Atlantic: se lărgește cu ~2,5 cm pe an, pe măsură ce Europa și America se depărtează.'], ['Indian', 'Oceanul Indian: cel mai cald dintre oceane.'], ['Arctic', 'Oceanul Arctic: cel mai mic și mai puțin adânc; mare parte e acoperit de gheață.'], ['Marea Neagră', 'Marea Neagră: adâncă de 2.212 m. Sub ~150 m nu mai e oxigen și aproape nu trăiește nimic — e o „mare moartă” pe 90% din volum. Dar în partea de sus trăiesc delfini și hamsii.']]
        .forEach(([t, f]) => api.button(r2, t, () => api.say('<b>' + t.replace('🌊 ', '') + '.</b> ' + f.replace(/^[^:]*: /, ''), 12000)));
      api.say('Trage în sus și în jos pe ecran sau folosește glisorul ca să te scufunzi. Atinge o viețuitoare ca să afli cine e!', 9000);
      let dragY = null, dragD = 0;
      let pickMoved = 0;
      api.pointer({
        down: (x, y) => { dragY = y; dragD = depth; pickMoved = 0; },
        move: (x, y) => { if (dragY !== null) { pickMoved = Math.abs(y - dragY); depth = clamp(dragD + (dragY - y) / 0.4 * -1 * -1, 0, MAX); auto = false; sl.set(Math.pow(depth / MAX, 1 / 1.6)); } },
        up: (x, y) => {
          if (pickMoved < 8) {
            let best = null, bd = 1e9;
            for (const c of crit) { const sx = c.x * api.W, sy = yOf(c.d), r = Math.max(40, sizeOf(c) * 0.5); const d = Math.hypot(sx - x, sy - y); if (d < r && d < bd) { bd = d; best = c; } }
            if (best) api.say('<b>' + SP[best.i][0] + '</b> (' + fmtN(SP[best.i][1]) + '–' + fmtN(SP[best.i][2]) + ' m). ' + SP[best.i][4], 9000);
          }
          dragY = null;
        }
      });
      const PX = 0.42;     // pixeli pe metru
      const yOf = (d) => api.cy - api.unit * 0.1 + (d - depth) * PX;
      function waterColor(d) {
        if (d < 200) return mix([46, 168, 220], [18, 96, 160], d / 200);
        if (d < 1000) return mix([18, 96, 160], [2, 12, 40], (d - 200) / 800);
        return mix([2, 12, 40], [0, 0, 6], clamp((d - 1000) / 3000, 0, 1));
      }
      let lastZone = -1;
      /* desenul fiecărei specii (Creatures): funcție, opțiuni, mărime în px la U = 300 */
      const LOOK = {
        'Delfin': ['dolphin', {}, 80], 'Țestoasă de mare': ['turtle', {}, 58], 'Rechin': ['shark', {}, 110], 'Ton': ['fish', { v: 'tuna' }, 62], 'Meduză': ['jelly', {}, 40],
        'Calmar': ['squid', { v: 'giant' }, 96], 'Cașalot': ['whale', { v: 'sperm' }, 180], 'Pește-viperă': ['fish', { v: 'viper' }, 56], 'Pește-pescar': ['angler', {}, 52],
        'Caracatiță Dumbo': ['dumbo', {}, 44], 'Castravete de mare': ['cucumber', {}, 54], 'Pește-melc': ['fish', { v: 'snail' }, 52], 'Amfipod': ['shrimp', {}, 32]
      };
      const LUM = { 'Meduză': 1, 'Calmar': 1, 'Pește-viperă': 1, 'Pește-pescar': 1 };
      const sizeOf = (c) => LOOK[SP[c.i][0]][2] * clamp(api.unit / 300, 0.55, 1.5);
      function drawCreature(c, x, y, t, lights) {
        const L = LOOK[SP[c.i][0]], dir = c.dx > 0 ? 1 : -1;
        const o = Object.assign({ flip: dir < 0, seed: c.ph, speed: 0.6 }, L[1]);
        if (lights) { if (!LUM[SP[c.i][0]] || c.d < 300) return; o.lightsOnly = true; }
        if (L[0] === 'jelly' && !lights) o.alpha = 0.92;
        Creatures[L[0]](ctx, x, y + Math.sin(t * 0.8 + c.ph) * 3, sizeOf(c), t, o);
      }
      /* întunericul adâncului: mască pe jumătate de rezoluție, cu „fereastra” farului decupată */
      let mask = null;
      const darkAt = (d) => clamp((d - 120) / 900, 0, 1) * 0.5;
      function drawMask(W, H, dTop, dBot, lamp) {
        if (darkAt(dBot) <= 0.001) return;
        const mw = Math.max(1, Math.ceil(W / 2)), mh = Math.max(1, Math.ceil(H / 2));
        if (!mask) mask = document.createElement('canvas');
        if (mask.width !== mw || mask.height !== mh) { mask.width = mw; mask.height = mh; }
        const m = mask.getContext('2d'); m.setTransform(0.5, 0, 0, 0.5, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H);
        const g = m.createLinearGradient(0, 0, 0, H);
        for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, 'rgba(2,6,16,' + darkAt(lerp(dTop, dBot, i / 6)).toFixed(3) + ')');
        m.fillStyle = g; m.fillRect(0, 0, W, H);
        if (lamp) {
          m.globalCompositeOperation = 'destination-out';
          const [lx, ly, R] = lamp, rg = m.createRadialGradient(lx, ly, 0, lx, ly, R);
          rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.6, 'rgba(0,0,0,0.75)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
          m.fillStyle = rg; m.beginPath(); m.moveTo(lx, ly - 6); m.lineTo(lx + R, ly - R * 0.5); m.quadraticCurveTo(lx + R * 1.12, ly, lx + R, ly + R * 0.5); m.lineTo(lx, ly + 6); m.closePath(); m.fill();
          const r2 = m.createRadialGradient(lx - 30, ly, 0, lx - 30, ly, 70); r2.addColorStop(0, 'rgba(0,0,0,0.85)'); r2.addColorStop(1, 'rgba(0,0,0,0)'); m.fillStyle = r2; m.beginPath(); m.arc(lx - 30, ly, 70, 0, 7); m.fill();
        }
        ctx.drawImage(mask, 0, 0, W, H);
      }
      /* submersibil de cercetare (tip „Alvin”) */
      function drawSub(x, y, t, k) {
        ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
        const hull = ctx.createLinearGradient(0, -16, 0, 16); hull.addColorStop(0, '#fbfbf6'); hull.addColorStop(0.5, '#e4e4dc'); hull.addColorStop(1, '#a8aca8');
        /* elice */
        const pr = Math.sin(t * 18);
        ctx.fillStyle = '#5a6470'; ctx.fillRect(-40, -2, 8, 4);
        ctx.fillStyle = '#3a4450'; ctx.beginPath(); ctx.ellipse(-41, 0, 2.5, 9 * Math.abs(pr) + 1.5, 0, 0, 7); ctx.fill();
        /* coada / cârme */
        ctx.fillStyle = '#d24a2a'; ctx.beginPath(); ctx.moveTo(-28, -6); ctx.lineTo(-38, -14); ctx.lineTo(-36, -2); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(-28, 6); ctx.lineTo(-38, 14); ctx.lineTo(-36, 2); ctx.closePath(); ctx.fill();
        /* corp */
        ctx.beginPath(); Art.smoothPath(ctx, [[30, 2], [24, -12], [4, -16], [-20, -14], [-32, -6], [-34, 2], [-28, 10], [-6, 15], [18, 13]], true);
        ctx.fillStyle = hull; ctx.fill(); ctx.strokeStyle = '#6a706c'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.save(); ctx.clip(); ctx.fillStyle = '#d24a2a'; ctx.fillRect(-40, 5, 80, 4); ctx.restore();
        /* turelă */
        ctx.beginPath(); Art.roundRectPath(ctx, -12, -24, 20, 10, 4); ctx.fillStyle = '#ecece4'; ctx.fill(); ctx.strokeStyle = '#6a706c'; ctx.stroke();
        ctx.fillStyle = '#2a3440'; ctx.fillRect(-6, -21, 8, 3);
        /* hublou */
        const gl = ctx.createLinearGradient(14, -8, 22, 2); gl.addColorStop(0, '#6ab0d8'); gl.addColorStop(1, '#1a4a6a');
        ctx.beginPath(); ctx.arc(17, -3, 5.5, 0, 7); ctx.fillStyle = gl; ctx.fill(); ctx.strokeStyle = '#5a6068'; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(15.5, -4.8, 1.5, 0, 7); ctx.fill();
        /* braț manipulator + far */
        ctx.strokeStyle = '#7a808a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(14, 11); ctx.lineTo(26, 16); ctx.lineTo(32, 12); ctx.stroke();
        ctx.fillStyle = '#4a5058'; ctx.beginPath(); Art.roundRectPath(ctx, 24, -14, 7, 6, 2); ctx.fill();
        ctx.fillStyle = depth > 150 ? '#fff6d8' : '#c8ccd0'; ctx.beginPath(); ctx.arc(31, -11, 2.2, 0, 7); ctx.fill();
        ctx.restore();
      }
      function frame(dt, t) {
        if (auto) { depth = Math.min(MAX, depth + dt * (depth < 1000 ? 120 : 380)); sl.set(Math.pow(depth / MAX, 1 / 1.6)); if (depth >= MAX) { auto = false; bA.innerHTML = '⬇ Coboară singur'; } }
        const W = api.W, H = api.H, U = api.unit;
        /* apa: gradient în funcție de adâncimea de sus și de jos */
        const g = ctx.createLinearGradient(0, 0, 0, H);
        const dTop = depth + (0 - yOf(depth)) / PX, dBot = depth + (H - yOf(depth)) / PX;
        for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, rgb(waterColor(clamp(lerp(dTop, dBot, i / 6), 0, MAX))));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        /* suprafața și cerul */
        const sy = yOf(0);
        if (sy > -40) {
          const sk = ctx.createLinearGradient(0, 0, 0, Math.max(1, sy)); sk.addColorStop(0, '#5aa4e0'); sk.addColorStop(1, '#cfe8f8'); ctx.fillStyle = sk; ctx.fillRect(0, 0, W, Math.max(0, sy + 2));
          if (sy > 60) { ctx.fillStyle = '#fff8e0'; ctx.beginPath(); ctx.arc(api.freeW * 0.8, sy * 0.35, Math.min(26, sy * 0.15), 0, 7); ctx.fill(); }
          const wy = (x) => sy + Math.sin(x * 0.03 + t * 1.2) * 2.5 + Math.sin(x * 0.011 - t * 0.7) * 2;
                    const sg = ctx.createLinearGradient(0, sy - 4, 0, sy + 60); sg.addColorStop(0, '#5ec0ea'); sg.addColorStop(1, rgb(waterColor(140))); ctx.fillStyle = sg;
          ctx.save(); ctx.beginPath(); ctx.moveTo(0, sy + 70); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, wy(x)); ctx.lineTo(W, sy + 70); ctx.closePath(); ctx.fill(); ctx.restore();
          ctx.strokeStyle = 'rgba(240,250,255,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, wy(x)); ctx.stroke();
          /* barca de pe suprafață (de unde pornește scufundarea) */
          const bx = api.freeW * 0.2, by = wy(bx);
          ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.sin(t * 1.2) * 0.03);
          ctx.fillStyle = '#e8ecef'; ctx.fillRect(-10, -22, 26, 12); ctx.fillStyle = '#3a5a7a'; ctx.fillRect(-6, -19, 6, 4); ctx.fillRect(3, -19, 6, 4);
          ctx.beginPath(); ctx.moveTo(-36, -10); ctx.lineTo(40, -10); ctx.lineTo(30, 6); ctx.lineTo(-30, 6); ctx.closePath(); ctx.fillStyle = '#2a4a6a'; ctx.fill(); ctx.fillStyle = '#d24a2a'; ctx.fillRect(-33, -10, 72, 4);
          ctx.restore();
        }
        /* fundul mării (Groapa Marianelor) */
        const fy = yOf(MAX + 80);
        if (fy < H) {
          const fg = ctx.createLinearGradient(0, fy - 30, 0, H); fg.addColorStop(0, '#4a4234'); fg.addColorStop(1, '#1a1712');
          ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, fy - 40);
          for (let x = 0; x <= W; x += 20) ctx.lineTo(x, fy - 40 * Math.max(0, 1 - x / (W * 0.25)) - 40 * Math.max(0, (x - W * 0.75) / (W * 0.25)) + Math.sin(x * 0.07) * 4);
          ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
        }
        /* „zăpadă marină” — fulgi rari de materie care cad spre fund (doar sub 200 m) */
        if (depth > 200) { ctx.fillStyle = 'rgba(220,230,240,' + (0.35 * clamp((depth - 200) / 400, 0, 1)).toFixed(2) + ')'; for (const s of snow) { const yy = (s[1] * H + t * 6 * s[2] + depth * 0.1) % H, xx = (s[0] * W + Math.sin(t * 0.3 + s[1] * 9) * 4); ctx.beginPath(); ctx.arc(xx, yy, s[2] * 0.8, 0, 7); ctx.fill(); } }
        /* creaturi */
        for (const c of crit) {
          c.x += c.dx * dt; if (c.x > 1.1) c.x = -0.1; if (c.x < -0.1) c.x = 1.1;
          const y = yOf(c.d); if (y < -100 || y > H + 100) continue;
          drawCreature(c, c.x * W, y, t, false);
        }
        /* submersibilul și farul lui */
        const sx = api.cx, sY = api.cy - api.unit * 0.1, k = clamp(U / 260, 0.9, 1.6);
        drawMask(W, H, dTop, dBot, depth > 120 ? [sx + 32 * k, sY - 11 * k, U * 0.95] : null);
        /* luminile proprii ale viețuitoarelor bioluminescente rămân vizibile în întuneric */
        for (const c of crit) { const y = yOf(c.d); if (y < -100 || y > H + 100) continue; drawCreature(c, c.x * W, y, t, true); }
        if (depth > 150) { const a = clamp((depth - 150) / 500, 0, 1) * 0.16, lx = sx + 32 * k, ly = sY - 11 * k, R = U * 0.95; const bg = ctx.createRadialGradient(lx, ly, 0, lx, ly, R); bg.addColorStop(0, 'rgba(255,246,214,' + a + ')'); bg.addColorStop(1, 'rgba(255,246,214,0)'); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(lx, ly - 3); ctx.lineTo(lx + R, ly - R * 0.5); ctx.quadraticCurveTo(lx + R * 1.12, ly, lx + R, ly + R * 0.5); ctx.lineTo(lx, ly + 3); ctx.closePath(); ctx.fill(); }
        drawSub(sx, sY, t, k);
        /* repere de adâncime (în dreapta) */
        const mfs = Art.fs(U, 0.036, 13);
        for (const m of MARK) {
          const y = yOf(m[0]); if (y > 70 && y < H - 4) {
            ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.moveTo(api.freeW * 0.55, y); ctx.lineTo(api.freeW - 6, y); ctx.stroke(); ctx.setLineDash([]);
            Art.text(ctx, m[1] + ' · ' + fmtN(m[0]) + ' m', api.freeW - 10, y - mfs * 0.75, { size: mfs, align: 'right', weight: 600, haloColor: 'rgba(5,10,25,0.6)' });
          }
        }
        /* tablou de bord */
        const press = 1 + depth / 10, temp = depth < 100 ? 20 - depth * 0.1 : depth < 1000 ? 10 - (depth - 100) / 900 * 6 : 3 + 1.0 * Math.min(1, (depth - 1000) / 9000) * -1;
        const dfs = Art.fs(U, 0.04, 13), lines = ['Adâncime: ' + fmtN(depth) + ' m', 'Presiune: ' + fmtN(press) + ' atm', 'Temperatură: ~' + fmtN(temp, 0) + '°C'];
        ctx.font = Art.font(dfs, 600); const pw = Math.max(...lines.map((s) => ctx.measureText(s).width)) + dfs * 1.6, ph = dfs * 1.5 * 3 + dfs * 0.9;
        Art.panel(ctx, 10, 70, pw, ph, { r: 12, bg: 'rgba(8,14,34,0.72)' });
        ctx.fillStyle = '#f4f7ff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; lines.forEach((s, i) => ctx.fillText(s, 10 + dfs * 0.8, 70 + dfs * 1.2 + i * dfs * 1.5));
        const z = ZONES.findIndex((q) => depth >= q[0] && depth < q[1]); const zi = z < 0 ? 4 : z;
        if (zi !== lastZone) { lastZone = zi; api.say('🌊 <b>' + ZONES[zi][2] + '</b> (' + fmtN(ZONES[zi][0]) + '–' + fmtN(ZONES[zi][1]) + ' m). ' + ZONES[zi][3], 9000); }
      }
      return { frame: frame };
    }
  });
})();
