/* MODUL: EXPLOZII COSMICE — viața unei stele + „atinge cerul” */
defineModule({
  id: 'explosions',
  title: 'Explozii cosmice',
  sub: 'Cum mor stelele și ce se naște din ele',
  start: function (api) {
    const ctx = api.ctx, TAU = Math.PI * 2;
    let mode = 'life';
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const fmtN = (v) => v.toLocaleString('ro-RO', { maximumFractionDigits: 1 });
    function glow(x, y, r, rgb, a) {
      if (r <= 0 || a <= 0) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(0.4, 'rgba(' + rgb + ',' + (a * 0.35) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }

    /* ---------- fundal: cer adânc cu nebuloase (pre-randat) ---------- */
    function bg() {
      const tex = Art.cached('expl-bg2', api.W, api.H, (c, w, h) => {
        Art.backdrop(c, w, h, { top: '#0b0d24', bottom: '#03040c', vignette: false });
        let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
        const n = Math.round(w * h / 9000);
        for (let i = 0; i < n; i++) { c.fillStyle = 'rgba(225,232,255,' + (0.25 + rnd() * 0.4).toFixed(2) + ')'; c.beginPath(); c.arc(rnd() * w, rnd() * h, 0.5 + rnd() * 0.9, 0, TAU); c.fill(); }
      });
      ctx.drawImage(tex, 0, 0, api.W, api.H);
    }

    /* ---------- stea cu suprafață granulară (texturi în cache) ---------- */
    const PAL = {
      red: ['#ffe0c0', '#ffa060', '#ff6a30', '#a02a10'],
      yellow: ['#fffbe6', '#ffe08a', '#ffab3d', '#d0581a'],
      white: ['#ffffff', '#fff4d8', '#ffd890', '#d08a40'],
      blue: ['#ffffff', '#d8e6ff', '#90b4ff', '#4060d0'],
      giant: ['#ffd6a8', '#ff8a48', '#d8401e', '#6a1406'],
      dwarf: ['#ffffff', '#eef4ff', '#c0d2ff', '#7a92e0']
    };
    function starTex(name, big) {
      return Art.cached('expl-star-' + name + (big ? '-b' : ''), 256, 256, (c, w) => {
        const r = w / 2, p = PAL[name];
        const g = c.createRadialGradient(r * 0.78, r * 0.72, 0, r, r, r);
        g.addColorStop(0, p[0]); g.addColorStop(0.45, p[1]); g.addColorStop(0.82, p[2]); g.addColorStop(1, p[3]);
        c.fillStyle = g; c.beginPath(); c.arc(r, r, r, 0, TAU); c.fill();
        c.save(); c.beginPath(); c.arc(r, r, r, 0, TAU); c.clip();
        let s = big ? 21 : 9; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
        const n = big ? 160 : 1100;
        for (let i = 0; i < n; i++) {
          const a = rnd() * TAU, d = Math.sqrt(rnd()) * r, x = r + Math.cos(a) * d, y = r + Math.sin(a) * d;
          const rr = big ? 10 + rnd() * 26 : 2 + rnd() * 4.5;
          const hi = rnd() < 0.5;
          const gg = c.createRadialGradient(x, y, 0, x, y, rr);
          gg.addColorStop(0, hi ? 'rgba(255,255,235,' + (big ? 0.22 : 0.2) + ')' : 'rgba(90,20,0,' + (big ? 0.28 : 0.16) + ')'); gg.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = gg; c.fillRect(x - rr, y - rr, rr * 2, rr * 2);
        }
        const limb = c.createRadialGradient(r, r, r * 0.5, r, r, r); limb.addColorStop(0, 'rgba(0,0,0,0)'); limb.addColorStop(1, 'rgba(60,10,0,0.55)');
        c.fillStyle = limb; c.fillRect(0, 0, w, w); c.restore();
      });
    }
    function rgbOf(name) { const h = Art.hex(PAL[name][2]); return h.join(','); }
    function drawStar(x, y, r, name, t, o) {
      o = o || {}; const big = !!o.big, a = o.alpha === undefined ? 1 : o.alpha, rgb = rgbOf(name);
      ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
      glow(x, y, r * (big ? 1.5 : 2.2), rgb, 0.22);
      for (let k = 0; k < 1; k++) {
        const rr = r * (big ? 1.08 + k * 0.1 : 1.25 + k * 0.25);
        Art.blob(ctx, x, y, rr, t * (0.7 + k * 0.3), { points: 14, amp: big ? 0.05 : 0.07, seed: k * 2.7 });
        const g = ctx.createRadialGradient(x, y, r * 0.9, x, y, rr * 1.1);
        g.addColorStop(0, 'rgba(' + rgb + ',' + (0.45 - k * 0.15) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
        ctx.fillStyle = g; ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.translate(x, y); ctx.rotate(t * (big ? 0.03 : 0.06));
      ctx.drawImage(starTex(name, big), -r, -r, r * 2, r * 2);
      if (o.mix) { ctx.globalAlpha = a * o.mix[1]; ctx.drawImage(starTex(o.mix[0], big), -r, -r, r * 2, r * 2); }
      ctx.restore();
    }

    /* nor moale (sprite în cache, câte unul pe culoare) */
    const puff = (rgb) => Art.cached('expl-puff-' + rgb, 64, 64, (c, w) => {
      const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      g.addColorStop(0, 'rgba(' + rgb + ',0.55)'); g.addColorStop(0.45, 'rgba(' + rgb + ',0.25)'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
      c.fillStyle = g; c.fillRect(0, 0, w, w);
    });
    /* ---------- nebuloasă colorată (resturi de stea) ---------- */
    function nebula(x, y, R, t, a, cols, seed) {
      if (a <= 0.01 || R < 2) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < cols.length; k++) {
        const spr = puff(cols[k]), rr = R * (0.42 + k * 0.2), n = 20;
        for (let i = 0; i < n; i++) {
          const ang = i / n * TAU + seed + k * 0.6, nz = Art.noise1(seed * 3 + i * 0.83 + k * 7 + t * 0.15);
          const d = rr * (0.85 + 0.3 * nz), sz = R * (0.2 + 0.12 * Art.noise1(seed + i * 1.7 + k * 3)) * (1 + k * 0.25);
          ctx.globalAlpha = clamp(a * (0.42 + 0.25 * nz), 0, 1);
          ctx.drawImage(spr, x + Math.cos(ang) * d - sz, y + Math.sin(ang) * d * 0.92 - sz, sz * 2, sz * 2);
        }
      }
      ctx.restore();
    }
    /* filamente: dâre scurte orientate radial */
    function filaments(x, y, R, list, a, palette, sy) {
      if (a <= 0.01) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (const p of list) {
        const d = p.sp * R, c = Math.cos(p.a), s = Math.sin(p.a) * (sy || 1), len = 3 + p.s * 3 + R * 0.05 * p.sp;
        ctx.strokeStyle = 'rgba(' + palette(p.h) + ',' + (a * (0.35 + 0.5 * p.sp)).toFixed(3) + ')';
        ctx.lineWidth = p.s * 0.8;
        ctx.beginPath(); ctx.moveTo(x + c * d, y + s * d); ctx.lineTo(x + c * (d - len), y + s * (d - len)); ctx.stroke();
      }
      ctx.restore();
    }
    /* undă de șoc: inel gros cu gradient */
    function shock(x, y, R, a, rgb) {
      if (R < 2 || a <= 0.01) return;
      const w = Math.max(6, R * 0.16);
      const g = ctx.createRadialGradient(x, y, Math.max(0, R - w), x, y, R + w * 0.3);
      g.addColorStop(0, 'rgba(' + rgb + ',0)'); g.addColorStop(0.75, 'rgba(' + rgb + ',' + (0.55 * a).toFixed(3) + ')'); g.addColorStop(0.9, 'rgba(255,255,255,' + (0.7 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R + w * 0.3, 0, TAU); ctx.fill();
    }

    /* ---------- particule incandescente ---------- */
    const sparks = [];
    function emit(x, y, n, sp, cols, life) {
      for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = sp * (0.3 + Math.random()); sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: life * (0.5 + Math.random() * 0.8), c: cols[(Math.random() * cols.length) | 0], w: 1 + Math.random() * 2 }); }
      if (sparks.length > 700) sparks.splice(0, sparks.length - 700);
    }
    function sparksStep(dt) { for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.age += dt; if (p.age > p.life) { sparks.splice(i, 1); continue; } const d = Math.exp(-1.2 * dt); p.vx *= d; p.vy *= d; p.x += p.vx * dt; p.y += p.vy * dt; } }
    function sparksDraw() {
      if (!sparks.length) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (const p of sparks) { const k = 1 - p.age / p.life; ctx.strokeStyle = 'rgba(' + p.c + ',' + (k * 0.9).toFixed(2) + ')'; ctx.lineWidth = p.w * (0.4 + k); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.06, p.y - p.vy * 0.06); ctx.stroke(); }
      ctx.restore();
    }
    const HOT = ['255,220,150', '255,170,80', '255,110,60', '255,250,220'];

    /* ---------- tab-uri ---------- */
    const rt = api.row('');
    const bLife = api.button(rt, '⭐ Viața unei stele', () => setMode('life'));
    const bTap = api.button(rt, '💥 Atinge cerul', () => setMode('tap'));
    const lifeBox = api.row('');
    const tapBox = api.row('');
    function setMode(m) {
      mode = m;
      bLife.classList.toggle('on', m === 'life'); bTap.classList.toggle('on', m === 'tap');
      lifeBox.style.display = m === 'life' ? '' : 'none';
      tapBox.style.display = m === 'tap' ? '' : 'none';
      if (m === 'life') stageSay(true); else api.say('<b>Alege o explozie</b> și atinge cerul ca s-o declanșezi. Poți atinge de câte ori vrei!', 6000);
      api.layout();
    }

    /* ---------- VIAȚA UNEI STELE ---------- */
    let M = 12, T = 0, playing = true, lastStage = -1, snFired = false;
    const SN = []; for (let i = 0; i < 420; i++) SN.push({ a: Math.random() * 6.283, sp: 0.35 + Math.random() * 0.65, s: 1 + Math.random() * 2.2, h: Math.random() });
    const chips = document.createElement('div'); chips.className = 'mod-chips';
    const mSlider = api.slider(lifeBox, { label: 'Masa stelei', min: 0.5, max: 40, step: 0.1, value: M, fmt: (v) => fmtN(v) + (v < 1.5 ? ' Soare' : ' Sori'), onInput: (v) => { M = v; lastStage = -1; buildChips(); } });
    const tSlider = api.slider(lifeBox, { label: 'Timpul', min: 0, max: 1, step: 0.001, value: 0, fmt: () => '', onInput: (v) => { T = v; playing = false; bPlay.innerHTML = '▶ Pornește'; } });
    const bPlay = api.button(lifeBox, '⏸ Pauză', () => { if (T >= 1) T = 0; playing = !playing; bPlay.innerHTML = playing ? '⏸ Pauză' : '▶ Pornește'; });
    lifeBox.appendChild(chips);
    function cls() { return M < 8 ? 0 : M < 20 ? 1 : 2; }
    function stages() {
      const c = cls(), life = 1e10 * Math.pow(M, -2.5);
      const lt = life >= 1e9 ? fmtN(life / 1e9) + ' miliarde de ani' : life >= 1e6 ? fmtN(life / 1e6) + ' milioane de ani' : fmtN(life / 1e3) + ' mii de ani';
      if (c === 0) return [
        { n: 'Secvența principală', f: 0.40, t: 'Steaua își topește hidrogenul în heliu — așa strălucește. Durează ~' + lt + '. Soarele e la mijlocul acestei etape.' },
        { n: 'Gigantă roșie', f: 0.22, t: 'Hidrogenul din nucleu s-a terminat. Steaua se umflă și se înroșește. Când Soarele va ajunge aici, va înghiți Mercur și Venus.' },
        { n: 'Nebuloasă planetară', f: 0.20, t: 'Steaua își aruncă straturile de afară într-un nor frumos — o „nebuloasă planetară” (n-are legătură cu planetele!).' },
        { n: 'Pitică albă', f: 0.18, t: 'Rămâne nucleul: o pitică albă cât Pământul, dar cu masa unui Soare. O linguriță din ea ar cântări cât un elefant. Se răcește încet, încet.' }];
      return [
        { n: 'Secvența principală', f: 0.38, t: 'O stea mare și albastră: arde combustibilul repede și trăiește doar ~' + lt + '.' },
        { n: 'Supergigantă roșie', f: 0.22, t: 'Topește elemente tot mai grele — heliu, carbon, oxigen… până la fier. Fierul nu mai dă energie, deci nucleul nu mai are cu ce să reziste.' },
        { n: 'SUPERNOVĂ!', f: 0.12, t: 'Nucleul se prăbușește în mai puțin de o secundă, iar steaua explodează! Aproape tot fierul din sângele tău s-a făcut într-o astfel de stea.' },
        c === 1 ? { n: 'Stea neutronică', f: 0.28, t: 'Rămâne o stea neutronică: cât un oraș (20 km), dar o linguriță din ea cântărește cât un munte. Se învârte de zeci de ori pe secundă, ca un far cosmic (pulsar).' }
          : { n: 'Gaură neagră', f: 0.28, t: 'Nucleul e atât de greu încât nimic nu-l mai oprește din prăbușire: se naște o gaură neagră. Nici lumina nu mai scapă din ea!' }];
    }
    function stageAt(t) {
      const st = stages(); let a = 0;
      for (let i = 0; i < st.length; i++) { if (t < a + st[i].f || i === st.length - 1) return { i: i, u: clamp((t - a) / st[i].f, 0, 1), st: st }; a += st[i].f; }
    }
    function buildChips() {
      chips.innerHTML = '';
      stages().forEach((s, i) => { const c = document.createElement('span'); c.className = 'chip'; c.textContent = s.n; c.dataset.i = i; chips.appendChild(c); });
    }
    function stageSay(force) {
      const s = stageAt(T);
      if (!force && s.i === lastStage) return;
      lastStage = s.i;
      chips.childNodes.forEach((c, i) => c.classList.toggle('on', i === s.i));
      api.say('<b>' + s.st[s.i].n + '.</b> ' + s.st[s.i].t);
    }
    buildChips();

    function msName() { return M < 1 ? 'red' : M < 2 ? 'yellow' : M < 8 ? 'white' : 'blue'; }
    const snPal = (h) => h < 0.4 ? '255,190,90' : h < 0.75 ? '255,110,60' : '150,190,255';
    const remPal = (h) => h < 0.4 ? '255,150,90' : h < 0.75 ? '255,90,110' : '130,180,255';
    const pnPal = (h) => h < 0.5 ? '120,240,220' : '255,130,200';

    function drawLife(t) {
      const cx = api.cx, cy = api.cy, U = api.unit, s = stageAt(T), c = cls(), u = s.u;
      const msR = U * (0.10 + 0.05 * Math.log10(1 + M));
      const bigR = U * (c === 0 ? 0.55 : 0.70);
      const wob = 1 + 0.015 * Math.sin(t * 5);
      /* scânteile supernovei pornesc o singură dată */
      if (c > 0 && s.i === 2 && u < 0.25) { if (!snFired) { snFired = true; emit(cx, cy, 60, U * 1.2, HOT.concat(['150,190,255']), 2.2); } }
      else if (s.i < 2) snFired = false;
      ctx.save();
      if (s.i === 0) {
        const r = msR * lerp(1, 1.25, u) * wob, name = msName();
        const late = c === 0 && u > 0.75 ? (u - 0.75) / 0.25 : 0;
        drawStar(cx, cy, r, name, t, { mix: late > 0 ? ['red', late] : null });
      } else if (s.i === 1) {
        const r = lerp(msR * 1.25, bigR, Art.ease.inOut(u)) * wob * (1 + 0.03 * Math.sin(t * 2));
        /* atmosferă umflată, pulsând */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        glow(cx, cy, r * 1.9, '255,90,40', 0.32);
        ctx.restore();
        drawStar(cx, cy, r, 'giant', t, { big: true, mix: u < 0.3 ? [msName(), 1 - u / 0.3] : null });
      } else if (c === 0 && s.i === 2) {
        const R = lerp(0.12, 0.85, Art.ease.out(u)) * U;
        nebula(cx, cy, R, t, 1.5 - 0.5 * u, ['90,220,210', '120,170,255', '255,110,180', '255,80,90'], 1.3);
        /* lobi bipolari */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.6 * (1 - u * 0.4);
        for (const sg of [-1, 1]) for (let j = 0; j < 5; j++) { const sz = R * (0.22 + j * 0.03), py = cy + sg * R * (0.3 + j * 0.13), px = cx + Math.sin(j * 2.1 + sg) * R * 0.08; ctx.drawImage(puff(j % 2 ? '255,120,190' : '200,110,255'), px - sz, py - sz, sz * 2, sz * 2); }
        ctx.globalAlpha = 1;
        ctx.restore();
        filaments(cx, cy, R, SN.slice(0, 160), 0.4 * (1 - u * 0.4), pnPal);
        const shrink = lerp(bigR * 0.25, U * 0.035, Art.ease.out(Math.min(1, u * 1.5)));
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(cx, cy, U * 0.2, '170,210,255', 0.8); ctx.restore();
        drawStar(cx, cy, shrink, 'dwarf', t);
      } else if (c === 0) {
        const na = 1 - u, R = U * 0.85 + u * U * 0.2;
        nebula(cx, cy, R, t, 1.1 * na, ['90,220,210', '120,170,255', '255,110,180', '255,80,90'], 1.3);
        filaments(cx, cy, R, SN.slice(0, 160), 0.3 * na, pnPal);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        glow(cx, cy, U * 0.14, u < 0.5 ? '170,210,255' : '255,240,200', 0.75);
        ctx.restore();
        drawStar(cx, cy, U * 0.035, 'dwarf', t, { mix: u > 0.4 ? ['white', (u - 0.4) / 0.6] : null });
      } else if (s.i === 2) {
        const e = 1 - Math.pow(1 - u, 3), R = e * U * 0.95;
        /* nucleul se prăbușește, apoi explodează */
        if (u < 0.05) drawStar(cx, cy, lerp(bigR, U * 0.05, u / 0.05), 'giant', t, { big: true });
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        g.addColorStop(0, 'rgba(255,240,200,' + (0.5 * (1 - u)).toFixed(3) + ')'); g.addColorStop(0.5, 'rgba(255,130,60,' + (0.3 * (1 - u)).toFixed(3) + ')'); g.addColorStop(1, 'rgba(200,60,40,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, R), 0, TAU); ctx.fill();
        nebula(cx, cy, R * 0.9, t, 0.7 * u, ['255,150,80', '255,90,110', '130,170,255'], 4.2);
        filaments(cx, cy, R, SN, 0.95 * (1 - u * 0.35), snPal);
        shock(cx, cy, R, 1 - u * 0.8, '255,200,150');
        shock(cx, cy, R * 0.72, 0.5 * (1 - u), '150,190,255');
        const fl = Math.exp(-u * 7);
        glow(cx, cy, U * 0.6 * fl + 10, '255,250,235', Math.min(0.9, fl));
        ctx.restore();
      } else {
        const R = U * (0.95 + u * 0.25);
        nebula(cx, cy, R, t, 0.85, ['255,140,70', '255,80,110', '120,160,255', '180,110,255'], 4.2);
        filaments(cx, cy, R, SN, 0.55, remPal);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        if (c === 1) {
          /* pulsar: fascicule care se rotesc */
          const a = t * 9, L = U * 0.75;
          for (const sg of [1, -1]) {
            const ex = cx + Math.cos(a) * L * sg, ey = cy + Math.sin(a) * L * sg, px = -Math.sin(a) * L * 0.12, py = Math.cos(a) * L * 0.12;
            const g = ctx.createLinearGradient(cx, cy, ex, ey); g.addColorStop(0, 'rgba(190,225,255,0.85)'); g.addColorStop(1, 'rgba(120,180,255,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex + px, ey + py); ctx.lineTo(ex - px, ey - py); ctx.closePath(); ctx.fill();
          }
          glow(cx, cy, U * 0.16, '150,200,255', 0.85);
          ctx.restore();
          Art.sphere(ctx, cx, cy, U * 0.03, '#cfe6ff', { rimColor: '#ffffff' });
        } else {
          const r = U * 0.09;
          glow(cx, cy, r * 4, '255,150,60', 0.35);
          ctx.restore();
          diskBH(cx, cy, r, t);
        }
      }
      ctx.restore();
    }
    /* gaură neagră mică cu disc de acreție înclinat */
    function diskBH(x, y, r, t) {
      const ring = (front) => {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y); ctx.scale(1, 0.28);
        for (let k = 0; k < 6; k++) {
          const rr = r * (1.4 + k * 0.38), a0 = front ? 0 : Math.PI, col = k < 2 ? '255,240,200' : k < 4 ? '255,170,80' : '230,90,50';
          ctx.strokeStyle = 'rgba(' + col + ',' + (0.55 - k * 0.06) + ')'; ctx.lineWidth = r * 0.34;
          ctx.setLineDash([r * (0.6 + k * 0.2), r * 0.25]); ctx.lineDashOffset = -t * r * (6 - k * 0.7);
          ctx.beginPath(); ctx.arc(0, 0, rr, a0, a0 + Math.PI); ctx.stroke();
        }
        ctx.restore();
      };
      ring(false);
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,225,180,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * 1.05, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,170,90,0.35)'; ctx.lineWidth = r * 0.25; ctx.beginPath(); ctx.arc(x, y, r * 1.18, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.restore();
      ring(true);
    }

    /* ---------- ATINGE CERUL ---------- */
    const TYPES = {
      sn: { name: '💥 Supernovă', fact: '<b>Supernovă.</b> Poate străluci cât o galaxie întreagă, săptămâni la rând. Calciul din oasele tale s-a făcut în stele și a fost împrăștiat de astfel de explozii.', dur: 5 },
      nova: { name: '🌟 Novă', fact: '<b>Novă.</b> O pitică albă fură gaz de la o stea vecină; gazul se aprinde într-o explozie, dar steaua rămâne întreagă — și poate izbucni din nou!', dur: 4 },
      kilo: { name: '🔶 Kilonovă', fact: '<b>Kilonovă.</b> Două stele neutronice se ciocnesc. Așa se fac aurul și platina din bijuterii: fiecare inel de aur e un rest de ciocnire cosmică!', dur: 6 },
      grb: { name: '⚡ Rafală gamma', fact: '<b>Rafală de raze gamma.</b> Cea mai puternică explozie după Big Bang: în câteva secunde eliberează cât Soarele în toată viața lui. Energia iese în două jeturi înguste.', dur: 4 }
    };
    let type = 'sn', shown = {}, booms = [], count = 0;
    const typeBtns = {};
    for (const k in TYPES) typeBtns[k] = api.button(tapBox, TYPES[k].name, () => { type = k; for (const j in typeBtns) typeBtns[j].classList.toggle('on', j === k); api.say(TYPES[k].fact, 8000); });
    typeBtns.sn.classList.add('on');
    api.button(tapBox, '🧹 Curăță', () => { booms = []; sparks.length = 0; });
    function boom(x, y) {
      const T0 = TYPES[type], b = { x: x, y: y, type: type, age: 0, dur: T0.dur, p: [], ang: Math.random() * 6.283, seed: Math.random() * 20, fired: false };
      const n = type === 'grb' ? 0 : 170;
      for (let i = 0; i < n; i++) b.p.push({ a: Math.random() * 6.283, sp: 0.35 + Math.random() * 0.65, s: 1 + Math.random() * 2.4, h: Math.random() });
      booms.push(b); if (booms.length > 8) booms.shift();
      count++;
      const U = api.unit;
      if (type === 'sn') emit(x, y, 30, U * 1.0, HOT, 1.8);
      if (!shown[type]) { shown[type] = 1; api.say(T0.fact, 9000); }
    }
    function drawBoom(b, t) {
      const u = b.age / b.dur, U = api.unit, e = 1 - Math.pow(1 - clamp(u, 0, 1), 3), fade = 1 - clamp(u, 0, 1);
      if (b.type === 'sn') {
        const R = e * U * 0.7;
        nebula(b.x, b.y, R * 0.95, t, 0.8 * Math.sin(Math.min(1, u * 1.4) * Math.PI) + 0.1 * fade, ['255,150,80', '255,90,110', '130,170,255'], b.seed);
        filaments(b.x, b.y, R, b.p, 0.95 * fade, snPal);
        shock(b.x, b.y, R, fade, '255,210,160');
        const fl = Math.exp(-u * 8); glow(b.x, b.y, U * 0.35 * fl + 6, '255,250,235', Math.min(0.9, fl));
      } else if (b.type === 'nova') {
        const R = e * U * 0.38;
        /* steaua vecină și fluxul de gaz spre pitica albă */
        const ox = b.x + Math.cos(b.ang) * U * 0.16, oy = b.y + Math.sin(b.ang) * U * 0.16;
        const show = Math.min(1, (1 - u) * 3);
        glow(ox, oy, U * 0.08, '255,120,70', 0.6 * show);
        ctx.strokeStyle = 'rgba(255,150,100,' + (0.5 * show).toFixed(2) + ')'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.quadraticCurveTo((ox + b.x) / 2 - Math.sin(b.ang) * U * 0.06, (oy + b.y) / 2 + Math.cos(b.ang) * U * 0.06, b.x, b.y); ctx.stroke();
        shock(b.x, b.y, R, fade, '255,150,200');
        filaments(b.x, b.y, R * 1.05, b.p, 0.8 * fade, (h) => h < 0.5 ? '255,150,200' : '255,240,220');
        glow(b.x, b.y, U * 0.25 * (0.4 + Math.sin(u * 3.14)), '255,230,230', 0.9 * Math.sin(Math.min(1, u * 1.2) * 3.14) + 0.1);
        glow(b.x, b.y, 9, '230,240,255', 1);
      } else if (b.type === 'kilo') {
        if (u < 0.22) {
          const k = u / 0.22, a = b.ang + k * k * 18;
          for (let q = 0; q < 10; q++) {
            const kk = Math.max(0, k - q * 0.012), aa = b.ang + kk * kk * 18, dd = (1 - kk) * U * 0.2 + 3;
            for (const sg of [1, -1]) glow(b.x + Math.cos(aa) * dd * sg, b.y + Math.sin(aa) * dd * sg, 10 - q * 0.7, '150,200,255', 0.5 - q * 0.045);
          }
          const d = (1 - k) * U * 0.2 + 3;
          glow(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, 18, '190,220,255', 1);
          glow(b.x - Math.cos(a) * d, b.y - Math.sin(a) * d, 18, '190,220,255', 1);
        } else {
          if (!b.fired) { b.fired = true; emit(b.x, b.y, 30, U * 0.8, ['255,215,90', '255,190,60', '140,180,255'], 2.4); }
          const w = (u - 0.22) / 0.78, R = (1 - Math.pow(1 - w, 3)) * U * 0.6, f = 1 - w;
          nebula(b.x, b.y, R, t, 0.9 * f, ['255,200,80', '255,150,60', '120,160,255'], b.seed);
          filaments(b.x, b.y, R, b.p, 0.95 * f, (h) => h < 0.55 ? '255,205,70' : '120,170,255', 0.8);
          shock(b.x, b.y, R * 1.05, f, '255,220,140');
          const fl = Math.exp(-w * 7); glow(b.x, b.y, U * 0.5 * fl + 8, '255,230,150', fl);
        }
      } else {
        const L = e * U * 1.6, w = (U * 0.05) * fade + 2;
        for (const s of [-1, 1]) {
          const ca = Math.cos(b.ang) * s, sa = Math.sin(b.ang) * s, x2 = b.x + ca * L, y2 = b.y + sa * L;
          const g = ctx.createLinearGradient(b.x, b.y, x2, y2); g.addColorStop(0, 'rgba(230,210,255,' + fade.toFixed(2) + ')'); g.addColorStop(0.6, 'rgba(160,180,255,' + (0.5 * fade).toFixed(2) + ')'); g.addColorStop(1, 'rgba(120,200,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(b.x - sa * 2, b.y + ca * 2); ctx.lineTo(x2 - sa * w, y2 + ca * w); ctx.lineTo(x2 + sa * w, y2 - ca * w); ctx.lineTo(b.x + sa * 2, b.y - ca * 2); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.8 * fade).toFixed(2) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + ca * L * 0.7, b.y + sa * L * 0.7); ctx.stroke();
        }
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang + Math.PI / 2); ctx.scale(1, 0.3);
        ctx.strokeStyle = 'rgba(255,190,120,' + (0.7 * fade).toFixed(2) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, U * 0.05, 0, TAU); ctx.stroke(); ctx.restore();
        const fl = Math.exp(-u * 6); glow(b.x, b.y, U * 0.4 * fl + 8, '255,255,255', fl);
      }
    }
    api.pointer({ down: (x, y) => { if (mode === 'tap') boom(x, y); } });

    setMode('life'); stageSay(true);

    function frame(dt, t) {
      if (mode === 'life' && playing) {
        T = Math.min(1, T + dt / 32);
        tSlider.set(T);
        if (T >= 1) { playing = false; bPlay.innerHTML = '↺ Reia'; }
      }
      sparksStep(dt);
      bg();
      if (mode === 'life') { stageSay(false); drawLife(t); sparksDraw(); }
      else {
        ctx.globalCompositeOperation = 'lighter';
        for (const b of booms) { b.age += dt; drawBoom(b, t); }
        ctx.globalCompositeOperation = 'source-over';
        sparksDraw();
        booms = booms.filter((b) => b.age < b.dur);
        const fz = Art.fs(api.unit, 0.04, 13);
        Art.label(ctx, 'Explozii: ' + count, api.freeW - 14, 80, { size: fz, align: 'right', color: '#ffd9a8' });
        if (!count) Art.text(ctx, 'Atinge cerul!', api.cx, api.cy, { size: Art.fs(api.unit, 0.06, 18), color: 'rgba(235,240,255,0.8)', halo: false });
      }
    }
    return { frame: frame };
  }
});
