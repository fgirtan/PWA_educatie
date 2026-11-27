/* Modul: Circuitul apei în natură */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  defineModule({
    id: 'watercycle', title: 'Circuitul apei', sub: 'Drumul unei picături: mare, nor, ploaie, râu',
    start: function (api) {
      const ctx = api.ctx; let heat = 0.6, cold = false, step = -1, stepT = 0;
      const r = api.row('');
      api.slider(r, { label: 'Căldura Soarelui', min: 0.1, max: 1, step: 0.01, value: heat, fmt: (v) => v < 0.35 ? 'slabă' : v > 0.75 ? 'puternică ☀️' : 'potrivită', onInput: (v) => { heat = v; } });
      const bc = api.button(r, '❄️ E iarnă', () => { cold = !cold; bc.classList.toggle('on', cold); api.say(cold ? 'Iarna, sus în nori e foarte frig: picăturile îngheață și cad ca <b>fulgi de zăpadă</b>. Zăpada se adună pe munți și se topește primăvara, umplând râurile.' : TXT); });
      const ST = [['☀️ Evaporarea', 'Soarele încălzește apa din mări și lacuri. O parte din ea se face <b>vapori</b> (invizibili) și urcă în aer. La fel se usucă rufele la soare!'], ['☁️ Condensarea', 'Sus e frig. Vaporii se răcesc și se strâng în <b>picături mititele</b>. Miliarde de picături laolaltă formează un <b>nor</b>.'], ['🌧️ Precipitațiile', 'Picăturile din nor se unesc, se fac tot mai mari și mai grele, și cad: <b>ploaie</b>, sau <b>zăpadă</b> când e frig.'], ['🏞️ Râurile', 'Apa de ploaie curge la vale în <b>pârâuri și râuri</b>, sau intră în pământ. Până la urmă, ajunge înapoi în <b>mare</b>. Și o luăm de la capăt!']];
      ST.forEach(([n, tx], i) => api.button(r, n, () => { step = i; stepT = 0; api.say('<b>' + n + '.</b> ' + tx); }));
      const TXT = 'Apa de pe Pământ nu se termină niciodată: ea face mereu <b>același drum</b>, în cerc. Din mare urcă în nori, din nori cade ca ploaie, iar râurile o duc înapoi în mare. Poate că apa pe care o bei a fost cândva băută de un dinozaur! 🦕';
      api.say(TXT);
      const vap = []; for (let i = 0; i < 40; i++) vap.push({ x: 60 + Math.random() * 360, y: 440 - Math.random() * 300, s: Math.random() });
      const drops = []; let cloud = 0.5;
      return {
        frame: function (dt, t) {
          stepT += dt;
          const g = ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, cold ? '#8aa0c0' : '#4f97e0'); g.addColorStop(1, cold ? '#e6eef6' : '#d6ecfb'); ctx.fillStyle = g; ctx.fillRect(0, 0, api.W, api.H);
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          const hl = (i) => step === i ? 0.5 + 0.5 * Math.sin(stepT * 5) : 0;
          /* soarele */
          A.glow(ctx, 90, 70, 90 + heat * 60, '#ffe08a', 0.9); ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.arc(90, 70, 40, 0, TAU); ctx.fill();
          /* marea */
          const sg = ctx.createLinearGradient(0, 440, 0, 600); sg.addColorStop(0, '#2a8fd8'); sg.addColorStop(1, '#0b3d78'); ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(-300, 440); for (let x = -300; x <= 470; x += 12) ctx.lineTo(x, 440 + Math.sin(x * 0.05 + t * 2) * 3); ctx.lineTo(470, 700); ctx.lineTo(-300, 700); ctx.fill();
          /* uscatul și muntele */
          ctx.fillStyle = cold ? '#d8e2ea' : '#5aa84a'; ctx.beginPath(); ctx.moveTo(440, 700); ctx.lineTo(440, 440); ctx.quadraticCurveTo(560, 420, 640, 380); ctx.lineTo(1300, 380); ctx.lineTo(1300, 700); ctx.fill();
          ctx.fillStyle = '#7a7f88'; ctx.beginPath(); ctx.moveTo(600, 400); ctx.lineTo(820, 150); ctx.lineTo(1000, 330); ctx.lineTo(1300, 300); ctx.lineTo(1300, 420); ctx.fill();
          ctx.fillStyle = '#f4f7fb'; ctx.beginPath(); ctx.moveTo(820, 150); ctx.lineTo(760, 220); ctx.lineTo(800, 210); ctx.lineTo(830, 230); ctx.lineTo(870, 205); ctx.closePath(); ctx.fill(); if (cold) { ctx.beginPath(); ctx.moveTo(820, 150); ctx.lineTo(680, 320); ctx.lineTo(960, 300); ctx.fill(); }
          /* râul */
          ctx.strokeStyle = '#3a9ae8'; ctx.lineWidth = 14 + hl(3) * 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(800, 230); ctx.bezierCurveTo(760, 330, 690, 360, 640, 420); ctx.bezierCurveTo(580, 470, 520, 460, 450, 450); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 8; i++) { const u = ((t * 0.2 + i / 8) % 1); const p = [[800, 230], [760, 330], [690, 360], [640, 420], [580, 470], [520, 460], [450, 450]]; const k = u * 6, a = p[Math.floor(k)], b = p[Math.min(6, Math.floor(k) + 1)]; ctx.beginPath(); ctx.arc(lerp(a[0], b[0], k % 1), lerp(a[1], b[1], k % 1), 3, 0, TAU); ctx.fill(); }
          for (let i = 0; i < 5; i++) window.CreatureH(cold ? 'conifer' : 'tree', ctx, 470 + i * 34, 445 - i * 9, 50, t, { seed: i });
          /* vaporii care urcă */
          for (const p of vap) { p.y -= dt * (20 + heat * 50) * (0.5 + p.s); p.x += Math.sin(t + p.s * 9) * dt * 6 + dt * 8; if (p.y < 140) { p.y = 440; p.x = 60 + Math.random() * 360; cloud = Math.min(1, cloud + 0.01); } const a = clamp((440 - p.y) / 100, 0, 1) * clamp((p.y - 140) / 60, 0, 1); ctx.strokeStyle = 'rgba(255,255,255,' + a * (0.5 + hl(0) * 0.5) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(p.x + 5, p.y - 6, p.x, p.y - 12); ctx.stroke(); }
          /* norul care se mută spre munte și plouă */
          const cx = 380 + ((t * 18) % 500), cy = 120, cs = 50 + cloud * 30 + hl(1) * 10;
          cloud = Math.max(0.2, cloud - dt * 0.02);
          const dark = clamp((cx - 500) / 250, 0, 1);
          ctx.save(); ctx.globalAlpha = 1; A.cloud(ctx, cx, cy, cs, 0.95); if (dark > 0) { ctx.globalAlpha = dark * 0.5; ctx.fillStyle = '#5a6a80'; ctx.beginPath(); ctx.ellipse(cx, cy + cs * 0.1, cs * 1.4, cs * 0.5, 0, 0, TAU); ctx.fill(); } ctx.restore();
          A.cloud(ctx, 260, 160, 55, 0.9);
          if (cx > 560) { for (let i = 0; i < 3; i++) drops.push({ x: cx + (Math.random() - 0.5) * cs * 2, y: cy + cs * 0.4, vy: cold ? 50 : 300, snow: cold }); }
          for (const d of drops) { d.y += d.vy * dt; if (d.snow) d.x += Math.sin(t * 3 + d.y * 0.05) * 0.6; }
          for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; if (d.y > (d.x > 600 ? 360 + (d.x - 600) * -0.2 + 100 : 440)) { drops.splice(i, 1); continue; } if (d.snow) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(d.x, d.y, 3, 0, TAU); ctx.fill(); } else { ctx.strokeStyle = 'rgba(70,140,230,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y + 10); ctx.stroke(); } }
          if (drops.length > 400) drops.splice(0, drops.length - 400);
          /* săgețile ciclului */
          const ar = (x0, y0, x1, y1, i, lab, lx, ly) => { const on = step === i || step < 0; A.arrow(ctx, x0, y0, x1, y1, { color: on ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', width: on ? 5 : 3, bend: 0.15 }); A.label(ctx, lab, lx, ly, { size: 15, color: step === i ? '#ffe08a' : '#fff' }); };
          ar(250, 400, 250, 210, 0, '☀️ Evaporare', 160, 300); ar(330, 110, 520, 90, 1, '☁️ Condensare', 430, 40); ar(700, 170, 700, 300, 2, cold ? '❄️ Ninsoare' : '🌧️ Ploaie', 790, 330); ar(620, 460, 500, 500, 3, '🏞️ Râul duce apa în mare', 560, 545);
          ctx.restore();
        }
      };
    }
  });
})();
