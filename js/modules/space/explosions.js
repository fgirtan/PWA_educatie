/* MODUL: EXPLOZII COSMICE — viața unei stele + „atinge cerul” */
defineModule({
  id: 'explosions',
  title: 'Explozii cosmice',
  sub: 'Cum mor stelele și ce se naște din ele',
  start: function (api) {
    const ctx = api.ctx;
    let mode = 'life';
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const fmtN = (v) => v.toLocaleString('ro-RO', { maximumFractionDigits: 1 });
    function glow(x, y, r, rgb, a) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    const BG = []; for (let i = 0; i < 160; i++) BG.push([Math.random(), Math.random(), Math.random() * 1.5 + 0.4, Math.random()]);
    function bg(t) {
      ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, api.W, api.H);
      for (const s of BG) { ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.5 * Math.abs(Math.sin(t + s[3] * 9))).toFixed(2) + ')'; ctx.fillRect(s[0] * api.W, s[1] * api.H, s[2], s[2]); }
    }

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
    let M = 12, T = 0, playing = true, lastStage = -1;
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

    function msColor() { return M < 1 ? '255,150,90' : M < 2 ? '255,224,140' : M < 8 ? '255,246,224' : '170,205,255'; }
    function drawLife(t) {
      const cx = api.cx, cy = api.cy, U = api.unit, s = stageAt(T), c = cls(), u = s.u;
      const msR = U * (0.10 + 0.05 * Math.log10(1 + M));
      const bigR = U * (c === 0 ? 0.55 : 0.70);
      ctx.save();
      if (c > 0 && s.i === 2 && u < 0.18) ctx.translate((Math.random() - 0.5) * 10 * (1 - u / 0.18), (Math.random() - 0.5) * 10 * (1 - u / 0.18));
      ctx.globalCompositeOperation = 'lighter';
      const wob = 1 + 0.015 * Math.sin(t * 5);
      if (s.i === 0) {
        const r = msR * lerp(1, 1.25, u) * wob, col = u > 0.85 && c === 0 ? '255,200,110' : msColor();
        glow(cx, cy, r * 3.2, col, 0.35); glow(cx, cy, r * 1.4, col, 0.9);
        ctx.fillStyle = 'rgb(' + col + ')'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      } else if (s.i === 1) {
        const r = lerp(msR * 1.25, bigR, u) * wob * (1 + 0.03 * Math.sin(t * 2));
        const col = c === 0 ? '255,110,60' : '255,70,40';
        glow(cx, cy, r * 2.2, col, 0.45); glow(cx, cy, r * 1.15, col, 0.95);
        ctx.fillStyle = 'rgba(255,170,110,0.35)'; ctx.beginPath(); ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.55, 0, 7); ctx.fill();
      } else if (c === 0 && s.i === 2) {
        const R = lerp(0.12, 0.85, u) * U;
        const g = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R);
        g.addColorStop(0, 'rgba(120,255,220,0)'); g.addColorStop(0.75, 'rgba(120,230,255,' + (0.5 - 0.2 * u).toFixed(2) + ')'); g.addColorStop(0.93, 'rgba(255,120,200,' + (0.55 - 0.2 * u).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,120,200,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
        glow(cx, cy, U * 0.18, '170,210,255', 0.9);
      } else if (c === 0) {
        const na = 0.35 * (1 - u), R = U * 0.85 + u * U * 0.2;
        const g = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R);
        g.addColorStop(0, 'rgba(120,230,255,0)'); g.addColorStop(0.8, 'rgba(120,230,255,' + na.toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,120,200,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
        glow(cx, cy, U * 0.12, u < 0.5 ? '170,210,255' : '255,240,200', 0.85);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, U * 0.03, 0, 7); ctx.fill();
      } else if (s.i === 2) {
        const e = 1 - Math.pow(1 - u, 3), R = e * U * 0.95;
        for (const p of SN) {
          const d = p.sp * R;
          ctx.fillStyle = 'rgba(' + (p.h < 0.4 ? '255,190,90' : p.h < 0.75 ? '255,110,60' : '150,190,255') + ',' + (0.85 * (1 - u * 0.4)).toFixed(2) + ')';
          ctx.fillRect(cx + Math.cos(p.a) * d, cy + Math.sin(p.a) * d, p.s, p.s);
        }
        glow(cx, cy, R, '255,160,80', 0.3 * (1 - u));
        ctx.strokeStyle = 'rgba(255,230,190,' + (0.8 * (1 - u)).toFixed(2) + ')'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
        const fl = Math.exp(-u * 7);
        glow(cx, cy, U * 1.3 * fl + 20, '255,255,255', Math.min(1, fl * 1.3));
      } else {
        const R = U * (0.95 + u * 0.25);
        for (const p of SN) {
          ctx.fillStyle = 'rgba(' + (p.h < 0.4 ? '255,170,90' : p.h < 0.75 ? '255,110,80' : '150,190,255') + ',0.35)';
          ctx.fillRect(cx + Math.cos(p.a) * p.sp * R, cy + Math.sin(p.a) * p.sp * R, p.s, p.s);
        }
        if (c === 1) {
          const a = t * 9;
          glow(cx, cy, U * 0.14, '150,200,255', 0.8);
          ctx.strokeStyle = 'rgba(160,210,255,0.8)'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * U * 0.7, cy + Math.sin(a) * U * 0.7); ctx.lineTo(cx - Math.cos(a) * U * 0.7, cy - Math.sin(a) * U * 0.7); ctx.stroke();
          ctx.fillStyle = '#e8f4ff'; ctx.beginPath(); ctx.arc(cx, cy, U * 0.028, 0, 7); ctx.fill();
        } else {
          const r = U * 0.09;
          for (let k = 0; k < 150; k++) {
            const ph = k * 2.4 + t * (1.5 + (k % 7) * 0.12), rr = r * (1.5 + (k % 11) * 0.28);
            ctx.fillStyle = 'rgba(255,' + (150 + (k % 5) * 20) + ',80,0.7)';
            ctx.fillRect(cx + Math.cos(ph) * rr, cy + Math.sin(ph) * rr * 0.28, 1.8, 1.8);
          }
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
          ctx.strokeStyle = 'rgba(255,230,190,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r * 1.04, 0, 7); ctx.stroke();
        }
      }
      ctx.restore();
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
    api.button(tapBox, '🧹 Curăță', () => { booms = []; });
    function boom(x, y) {
      const T0 = TYPES[type], b = { x: x, y: y, type: type, age: 0, dur: T0.dur, p: [], ang: Math.random() * 6.283 };
      const n = type === 'grb' ? 0 : 170;
      for (let i = 0; i < n; i++) b.p.push({ a: Math.random() * 6.283, sp: 0.35 + Math.random() * 0.65, s: 1 + Math.random() * 2.4, h: Math.random() });
      booms.push(b); if (booms.length > 8) booms.shift();
      count++;
      if (!shown[type]) { shown[type] = 1; api.say(T0.fact, 9000); }
    }
    function drawBoom(b) {
      const u = b.age / b.dur, U = api.unit, e = 1 - Math.pow(1 - clamp(u, 0, 1), 3), fade = 1 - clamp(u, 0, 1);
      if (b.type === 'sn') {
        const R = e * U * 0.7;
        for (const p of b.p) { ctx.fillStyle = 'rgba(' + (p.h < 0.4 ? '255,190,90' : p.h < 0.75 ? '255,100,60' : '150,190,255') + ',' + (0.9 * fade).toFixed(2) + ')'; ctx.fillRect(b.x + Math.cos(p.a) * p.sp * R, b.y + Math.sin(p.a) * p.sp * R, p.s, p.s); }
        ctx.strokeStyle = 'rgba(255,225,180,' + (0.8 * fade).toFixed(2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, 7); ctx.stroke();
        const fl = Math.exp(-u * 8); glow(b.x, b.y, U * 0.7 * fl + 10, '255,255,255', Math.min(1, fl * 1.3));
      } else if (b.type === 'nova') {
        const R = e * U * 0.38;
        for (const p of b.p) { const rr = R * (0.8 + p.sp * 0.25); ctx.fillStyle = 'rgba(' + (p.h < 0.5 ? '255,150,200' : '255,240,220') + ',' + (0.85 * fade).toFixed(2) + ')'; ctx.fillRect(b.x + Math.cos(p.a) * rr, b.y + Math.sin(p.a) * rr, p.s, p.s); }
        glow(b.x, b.y, U * 0.25 * (0.4 + Math.sin(u * 3.14) ), '255,230,230', 0.9 * Math.sin(Math.min(1, u * 1.2) * 3.14) + 0.1);
      } else if (b.type === 'kilo') {
        if (u < 0.22) {
          const k = u / 0.22, d = (1 - k) * U * 0.2 + 3, a = b.ang + k * 14;
          glow(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, 16, '150,200,255', 1);
          glow(b.x - Math.cos(a) * d, b.y - Math.sin(a) * d, 16, '150,200,255', 1);
        } else {
          const w = (u - 0.22) / 0.78, R = (1 - Math.pow(1 - w, 3)) * U * 0.6, f = 1 - w;
          for (const p of b.p) { ctx.fillStyle = (p.h < 0.55 ? 'rgba(255,205,70,' : 'rgba(120,170,255,') + (0.95 * f).toFixed(2) + ')'; ctx.fillRect(b.x + Math.cos(p.a) * p.sp * R, b.y + Math.sin(p.a) * p.sp * R * 0.8, p.s + 0.6, p.s + 0.6); }
          const fl = Math.exp(-w * 7); glow(b.x, b.y, U * 0.5 * fl + 8, '255,230,150', fl);
        }
      } else {
        const L = e * U * 1.6, w = 5 * fade + 1;
        for (const s of [-1, 1]) {
          const x2 = b.x + Math.cos(b.ang) * L * s, y2 = b.y + Math.sin(b.ang) * L * s;
          const g = ctx.createLinearGradient(b.x, b.y, x2, y2); g.addColorStop(0, 'rgba(200,170,255,' + fade.toFixed(2) + ')'); g.addColorStop(1, 'rgba(120,200,255,0)');
          ctx.strokeStyle = g; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(x2, y2); ctx.stroke();
        }
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
      bg(t);
      if (mode === 'life') { stageSay(false); drawLife(t); }
      else {
        ctx.globalCompositeOperation = 'lighter';
        for (const b of booms) { b.age += dt; drawBoom(b); }
        ctx.globalCompositeOperation = 'source-over';
        booms = booms.filter((b) => b.age < b.dur);
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '600 14px system-ui,sans-serif'; ctx.textAlign = 'right';
        ctx.fillText('Explozii: ' + count, api.freeW - 14, 80);
        if (!count) { ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '18px system-ui,sans-serif'; ctx.fillText('Atinge cerul!', api.cx, api.cy); }
      }
    }
    return { frame: frame };
  }
});
