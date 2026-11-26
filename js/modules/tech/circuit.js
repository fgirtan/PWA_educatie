/* Modul: Circuitul electric */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }

  /* ============================================================
     1) CIRCUIT ELECTRIC — adaugi și scoți componente cu click
     ============================================================ */
  defineModule({
    id: 'circuit', title: 'Circuitul electric', sub: 'Adaugă componente și vezi ce se întâmplă',
    start: function (api) {
      const ctx = api.ctx;
      const TYPES = {
        bec: { n: 'Bec', R: 6, e: '💡', tip: '<b>Becul</b> are un fir subțire care se înfierbântă și strălucește. Dacă prin el trece prea mult curent, firul se arde!' },
        led: { n: 'LED', R: 30, e: '🔴', tip: '<b>LED-ul</b> luminează cu puțin curent, dar se arde ușor! Dacă îl pui direct pe baterie, pocnește. Pune un <b>rezistor</b> în serie cu el ca să-l protejezi.' },
        rez: { n: 'Rezistor', R: 12, e: '🟫', tip: '<b>Rezistorul</b> „strânge” curentul: cu cât are rezistență mai mare, cu atât trece mai puțin curent. Se încălzește (ca o plită!).' },
        fan: { n: 'Ventilator', R: 8, e: '🌀', tip: '<b>Ventilatorul</b> are un motor mic: cu cât primește mai multă putere, cu atât se rotește mai repede.' },
        buz: { n: 'Sonerie', R: 14, e: '🔔', tip: '<b>Soneria</b> transformă curentul în sunet. Dacă nu auzi nimic, ridică volumul telefonului!' }
      };
      let on = true, par = false, V = 6, comps = [], rmv = false, flowT = 0, aud = null, audLevel = 0;
      const mk = (type) => ({ type: type, burnt: false, ang: 0 });
      comps.push(mk('bec'), mk('bec'));
      const r0 = api.row('Adaugă');
      Object.keys(TYPES).forEach((k) => api.button(r0, TYPES[k].e + ' ' + TYPES[k].n, () => {
        if (comps.length >= 6) { api.say('Sunt destule componente! Scoate una ca să pui alta.', 3500); return; }
        comps.push(mk(k)); rmv = false; bRm.classList.remove('on'); bRm.innerHTML = '🗑️ Scoate componente'; api.say(TYPES[k].tip, 10000);
      }));
      const r1 = api.row('');
      const bSw = api.button(r1, '🔘 Întrerupător: PORNIT', () => { on = !on; bSw.innerHTML = on ? '🔘 Întrerupător: PORNIT' : '⚪ Întrerupător: OPRIT'; api.say(on ? 'Circuitul e <b>închis</b>: curentul poate trece.' : 'Circuitul e <b>deschis</b>: curentul nu are pe unde trece, deci nu se aprinde nimic!', 6000); });
      const bMode = api.button(r1, '➡️ În serie', () => { par = !par; bMode.innerHTML = par ? '🔀 În paralel' : '➡️ În serie'; api.say(par ? '<b>Paralel:</b> fiecare componentă are propriul drum și primește toată tensiunea. Dacă una se arde, celelalte merg (așa e instalația din casă).' : '<b>Serie:</b> componentele sunt pe același drum și își împart tensiunea. Dacă una se arde, toate se opresc (ca la ghirlandele vechi).', 9000); });
      const bRm = api.button(r1, '🗑️ Scoate componente', () => { rmv = !rmv; bRm.classList.toggle('on', rmv); bRm.innerHTML = rmv ? '✋ Atinge o componentă ca s-o scoți' : '🗑️ Scoate componente'; if (rmv) api.say('Mod scoatere: <b>atinge o componentă</b> ca s-o ștergi din circuit.', 5000); });
      api.button(r1, '🔧 Repară', () => { comps.forEach((c) => { c.burnt = false; }); api.say('Componentele arse au fost înlocuite!', 2500); });
      api.button(r1, '🧹 Golește', () => { comps = []; });
      const r2 = api.row('');
      api.slider(r2, { label: 'Tensiunea bateriei', min: 1.5, max: 24, step: 0.5, value: V, fmt: (v) => fmt(v) + ' V', onInput: (v) => { V = v; } });
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Adaugă componente din paletă (💡 🔴 🟫 🌀 🔔). Schimbă între serie și paralel, crește tensiunea… dar ai grijă să nu arzi becurile sau LED-urile! Pentru a scoate ceva, apasă „Scoate componente”.', 14000);

      function geom() { const W = api.freeW, U = api.unit; return { x0: W * 0.12, x1: W * 0.88, y0: api.cy - U * 0.5, y1: api.cy + U * 0.5, W: W }; }
      function slotX(g, i, n) { return g.x0 + (g.x1 - g.x0) * (0.3 + 0.62 * (i + 0.5) / Math.max(n, 1)); }
      function path(g, k, n) {
        const pts = !par ? [[g.x0, g.y1], [g.x0, g.y0], [g.x1, g.y0], [g.x1, g.y1], [g.x0, g.y1]] : [[g.x0, g.y1], [g.x0, g.y0], [slotX(g, k, n), g.y0], [slotX(g, k, n), g.y1], [g.x0, g.y1]];
        let len = 0; const cum = [0]; for (let i = 1; i < pts.length; i++) { len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(len); }
        return { pts: pts, len: len, cum: cum };
      }
      function at(p, u) { const d = (((u % 1) + 1) % 1) * p.len; let i = 1; while (i < p.cum.length - 1 && p.cum[i] < d) i++; const k = (d - p.cum[i - 1]) / ((p.cum[i] - p.cum[i - 1]) || 1); return [lerp(p.pts[i - 1][0], p.pts[i][0], k), lerp(p.pts[i - 1][1], p.pts[i][1], k)]; }
      function solve() {
        const n = comps.length, out = { I: 0, I_k: [], P: [], Vc: [], short: false };
        comps.forEach(() => { out.I_k.push(0); out.P.push(0); out.Vc.push(0); });
        if (!on) return out;
        if (n === 0) { out.short = true; out.I = 40; return out; }
        const R = comps.map((c) => TYPES[c.type].R);
        if (!par) {
          if (comps.some((c) => c.burnt)) return out;
          const I = V / R.reduce((a, b) => a + b, 0); out.I = I;
          comps.forEach((c, i) => { out.I_k[i] = I; out.Vc[i] = I * R[i]; out.P[i] = I * I * R[i]; });
        } else {
          comps.forEach((c, i) => { if (c.burnt) return; const I = V / R[i]; out.I_k[i] = I; out.Vc[i] = V; out.P[i] = I * I * R[i]; out.I += I; });
        }
        return out;
      }
      /* desene */
      function drawComp(c, x, y, p, I, t, dt) {
        const T = c.type, a = c.burnt ? 0 : 1;
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = '#0a1226'; ctx.fillRect(-30, -34, 60, 72);
        if (T === 'bec') {
          const ratio = clamp(p / 6, 0, 2.2);
          if (!c.burnt && ratio > 0.02) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 70 * (0.4 + ratio)); g.addColorStop(0, 'rgba(255,230,120,' + clamp(ratio * 0.75, 0, 0.95) + ')'); g.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 70 * (0.4 + ratio), 0, 7); ctx.fill(); }
          ctx.fillStyle = c.burnt ? '#3a3a3a' : ratio < 0.02 ? '#6b6f78' : 'rgb(255,' + Math.round(230 - 30 * clamp(ratio - 1, 0, 1)) + ',' + Math.round(80 + 100 * clamp(ratio, 0, 1)) + ')';
          ctx.strokeStyle = '#dfe6f0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 20, 0, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#9aa3b2'; ctx.fillRect(-9, 20, 18, 11);
          ctx.strokeStyle = c.burnt ? '#777' : '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(-6, -2); ctx.lineTo(-2, -6); ctx.lineTo(2, -2); ctx.lineTo(6, -6); ctx.lineTo(7, 18); ctx.stroke();
        } else if (T === 'led') {
          const ratio = clamp(I / 0.04, 0, 3);
          if (!c.burnt && ratio > 0.02) { const g = ctx.createRadialGradient(0, -4, 0, 0, -4, 60 * (0.4 + ratio * 0.5)); g.addColorStop(0, 'rgba(255,70,70,' + clamp(ratio * 0.8, 0, 0.95) + ')'); g.addColorStop(1, 'rgba(255,40,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -4, 60 * (0.4 + ratio * 0.5), 0, 7); ctx.fill(); }
          ctx.fillStyle = c.burnt ? '#2a2a2a' : ratio > 0.02 ? 'rgb(255,' + Math.round(110 - 40 * clamp(ratio - 1, 0, 1)) + ',90)' : '#8a3a3a';
          ctx.strokeStyle = '#dfe6f0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, -4, 14, Math.PI, 0); ctx.lineTo(14, 8); ctx.lineTo(-14, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = '#aab'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, 8); ctx.lineTo(-6, 26); ctx.moveTo(6, 8); ctx.lineTo(6, 22); ctx.stroke();
          if (c.burnt) { ctx.fillStyle = '#ff7a7a'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ars!', 0, -28); }
        } else if (T === 'rez') {
          const heat = clamp(p / 5, 0, 1);
          ctx.fillStyle = 'rgb(' + Math.round(210 + 45 * heat) + ',' + Math.round(180 - 110 * heat) + ',' + Math.round(130 - 100 * heat) + ')'; ctx.strokeStyle = '#6b5030'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-24, -9, 48, 18, 7) : ctx.rect(-24, -9, 48, 18); ctx.fill(); ctx.stroke();
          ['#b03030', '#222', '#b0802a'].forEach((cc, i) => { ctx.fillStyle = cc; ctx.fillRect(-12 + i * 9, -9, 4, 18); });
          if (heat > 0.05) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 44); g.addColorStop(0, 'rgba(255,120,40,' + heat * 0.7 + ')'); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,' + heat * 0.6 + ')'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(-10 + k * 10, -18 - ((t * 20 + k * 7) % 14), 2, 0, 7); ctx.fill(); } }
        } else if (T === 'fan') {
          c.ang += dt * clamp(p, 0, 40) * 1.4;
          ctx.strokeStyle = '#9aa3b2'; ctx.lineWidth = 3; ctx.fillStyle = '#1b2442'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fill(); ctx.stroke();
          ctx.rotate(c.ang); for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.fillStyle = 'rgba(120,200,255,0.85)'; ctx.beginPath(); ctx.ellipse(0, -11, 5, 11, 0, 0, 7); ctx.fill(); } ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill();
        } else if (T === 'buz') {
          ctx.fillStyle = '#d6c8a0'; ctx.strokeStyle = '#6b5a30'; ctx.lineWidth = 2; ctx.fillRect(-14, -12, 28, 24); ctx.strokeRect(-14, -12, 28, 24);
          ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill();
          const lvl = clamp(p / 4, 0, 1);
          if (lvl > 0.03) for (let k = 0; k < 3; k++) { const ph = ((t * 2 + k * 0.33) % 1); ctx.strokeStyle = 'rgba(255,255,255,' + (1 - ph) * lvl + ')'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(14, 0, 8 + ph * 22, -0.9, 0.9); ctx.stroke(); }
        }
        if (rmv) { ctx.fillStyle = 'rgba(255,60,60,0.9)'; ctx.beginPath(); ctx.arc(22, -26, 11, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✕', 22, -21); ctx.strokeStyle = 'rgba(255,90,90,' + (0.5 + 0.4 * Math.sin(t * 8)) + ')'; ctx.lineWidth = 2; ctx.strokeRect(-30, -34, 60, 72); }
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(TYPES[T].n, 0, 52);
        ctx.restore();
      }
      let t = 0;
      function compPos(g, i) { const n = comps.length; return !par ? [slotX(g, i, n), g.y0 + 4] : [slotX(g, i, n), (g.y0 + g.y1) / 2 + 4]; }
      api.pointer({ down: (x, y) => { if (!rmv) return; const g = geom(); for (let i = 0; i < comps.length; i++) { const q = compPos(g, i); if (Math.abs(x - q[0]) < 34 && Math.abs(y - q[1]) < 44) { api.say(TYPES[comps[i].type].e + ' <b>' + TYPES[comps[i].type].n + '</b> scos din circuit.', 2500); comps.splice(i, 1); return; } } } });
      function frame(dt, tm) {
        t = tm;
        bg(api, '#0a1226', '#05080f');
        const g = geom(), n = comps.length; let S = solve();
        for (let i = 0; i < n; i++) { const c = comps[i]; if (c.burnt) continue; if (c.type === 'bec' && S.P[i] > 13.5) { c.burnt = true; api.say('💥 <b>Becul s-a ars!</b> Tensiunea a fost prea mare pentru el. Apasă „Repară”.', 6000); } if (c.type === 'led' && S.I_k[i] > 0.15) { c.burnt = true; api.say('💥 <b>LED-ul s-a ars!</b> A trecut prea mult curent prin el. Pune un <b>rezistor în serie</b> și încearcă din nou.', 8000); } }
        S = solve();
        /* fire */
        ctx.lineWidth = 6; ctx.strokeStyle = S.short ? '#e04a3a' : '#c9843a'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(g.x0, g.y1); ctx.lineTo(g.x0, g.y0); ctx.lineTo(g.x1, g.y0); ctx.lineTo(g.x1, g.y1); ctx.lineTo(g.x0, g.y1); ctx.stroke();
        if (par) for (let i = 0; i < n; i++) { const bx = slotX(g, i, n); ctx.beginPath(); ctx.moveTo(bx, g.y0); ctx.lineTo(bx, g.y1); ctx.stroke(); }
        /* baterie */
        const by = (g.y0 + g.y1) / 2;
        ctx.fillStyle = '#0a1226'; ctx.fillRect(g.x0 - 18, by - 44, 36, 88);
        ctx.fillStyle = S.short ? '#a0382a' : '#2a7a46'; ctx.fillRect(g.x0 - 18, by - 38, 36, 76); ctx.fillStyle = '#d9d2c0'; ctx.fillRect(g.x0 - 18, by - 38, 36, 18);
        ctx.fillStyle = '#fff'; ctx.font = '700 14px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+', g.x0, by - 24); ctx.fillText('−', g.x0, by + 28);
        ctx.font = '600 12px system-ui,sans-serif'; ctx.fillText(fmt(V) + ' V', g.x0 + 46, by + 4);
        /* întrerupător */
        const sx = g.x0 + (g.x1 - g.x0) * 0.16, sy = g.y0;
        ctx.fillStyle = '#0a1226'; ctx.fillRect(sx - 30, sy - 12, 60, 24);
        ctx.fillStyle = '#9aa3b2'; ctx.beginPath(); ctx.arc(sx - 26, sy, 5, 0, 7); ctx.arc(sx + 26, sy, 5, 0, 7); ctx.fill();
        ctx.strokeStyle = on ? '#7dffb0' : '#ff9a7a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx - 26, sy); ctx.lineTo(on ? sx + 26 : sx + 18, on ? sy : sy - 22); ctx.stroke();
        /* componente */
        comps.forEach((c, i) => { const q = compPos(g, i); drawComp(c, q[0], q[1], S.P[i], S.I_k[i], tm, dt); });
        /* electroni */
        if (S.I > 0) {
          flowT += dt * Math.min(S.I, 3) * 0.12;
          const paths = par && n ? Array.from({ length: n }, (_, k) => path(g, k, n)) : [path(g, 0, n)];
          ctx.fillStyle = S.short ? '#ffb067' : '#7ec8ff';
          paths.forEach((p, k) => { const cur = par && n ? S.I_k[k] : S.I; if (cur <= 0) return; const count = Math.round(p.len / 22); const sp = par && n ? (cur / Math.max(...S.I_k, 0.001)) : 1; for (let j = 0; j < count; j++) { const q = at(p, j / count + flowT * 0.6 * sp * (S.short ? 3 : 1)); ctx.beginPath(); ctx.arc(q[0], q[1], 3.2, 0, 7); ctx.fill(); } });
        }
        if (S.short) { ctx.fillStyle = '#ff6a5a'; ctx.font = '700 16px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('⚠ SCURTCIRCUIT: curentul nu trece prin nimic și bateria se încinge!', g.W / 2, api.cy - api.unit * 0.12); for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(255,200,80,' + Math.random() + ')'; ctx.fillRect(g.x0 + (Math.random() - 0.5) * 30, by + (Math.random() - 0.5) * 80, 3, 3); } }
        /* sonerie: sunet proporțional cu puterea */
        let lvl = 0; comps.forEach((c, i) => { if (c.type === 'buz' && !c.burnt) lvl = Math.max(lvl, clamp(S.P[i] / 4, 0, 1)); });
        if (lvl > 0 && !aud) { try { const AC = window.AudioContext || window.webkitAudioContext; const ac = new AC(), o = ac.createOscillator(), gn = ac.createGain(); o.type = 'square'; o.frequency.value = 520; gn.gain.value = 0; o.connect(gn); gn.connect(ac.destination); o.start(); aud = { ac: ac, o: o, g: gn }; } catch (e) { aud = { dead: true }; } }
        if (aud && aud.g) aud.g.gain.setTargetAtTime(lvl * 0.03 * ((Math.sin(tm * 14) > 0) ? 1 : 0.2), aud.ac.currentTime, 0.02);
        info.innerHTML = S.short ? '<b>Scurtcircuit!</b> Pune ceva în circuit.' : '<b>Curent total:</b> ' + fmt(S.I, 2) + ' A · <b>Componente:</b> ' + n + '/6' + (n && S.I === 0 ? ' · <i>nu curge curent</i>' : '');
      }
      api.onCleanup(() => { if (aud && aud.g) { try { aud.g.gain.value = 0; aud.o.stop(); aud.ac.close(); } catch (e) { } } });
      return { frame: frame };
    }
  });
})();
