/* Modul: Constelațiile — desene pe cerul nopții */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  /* stelele: [x, y, strălucire 1..3, culoare] în coordonate 0..1 ale cerului */
  const C = [
    { id: 'uma', n: 'Carul Mare', e: '🐻', s: [[0.36, 0.42, 2.2], [0.40, 0.33, 2.4], [0.27, 0.46, 2], [0.29, 0.37, 1.6], [0.22, 0.36, 2.3], [0.15, 0.37, 2.2], [0.09, 0.43, 2.2]], l: [[0, 1], [1, 3], [3, 2], [2, 0], [3, 4], [4, 5], [5, 6]],
      t: 'Cele mai cunoscute 7 stele: arată ca un <b>car cu oiște</b> (sau ca un polonic). Grecii vedeau în ele o <b>Ursoaică Mare</b>. Dacă prelungești marginea carului (cele 2 stele din față), ajungi la <b>Steaua Polară</b>, care arată mereu spre <b>Nord</b>. Marinarii o foloseau ca busolă!' },
    { id: 'umi', n: 'Carul Mic', e: '🐻', s: [[0.49, 0.12, 2.4, '#fff6d0'], [0.53, 0.16, 1.2], [0.56, 0.21, 1.2], [0.57, 0.27, 1.4], [0.63, 0.26, 1.2], [0.64, 0.32, 1.9], [0.58, 0.33, 1.7]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
      t: 'Un car mai mic, mai greu de văzut. La capătul oiștii lui e <b>Steaua Polară</b>: ea stă aproape nemișcată, iar tot cerul pare să se învârtă în jurul ei.' },
    { id: 'cas', n: 'Casiopeea', e: '👑', s: [[0.70, 0.10, 1.9], [0.74, 0.16, 2], [0.78, 0.11, 2], [0.82, 0.17, 1.8], [0.87, 0.12, 1.7]], l: [[0, 1], [1, 2], [2, 3], [3, 4]],
      t: 'Cinci stele în formă de <b>W</b> (sau M). În poveștile grecești, Casiopeea era o <b>regină</b> care se lăuda că e cea mai frumoasă și a fost pusă pe cer, pe tronul ei.' },
    { id: 'ori', n: 'Orion, vânătorul', e: '🏹', s: [[0.70, 0.58, 3, '#ffb27a'], [0.80, 0.59, 2.2], [0.735, 0.70, 2], [0.755, 0.69, 2.1], [0.775, 0.68, 2], [0.715, 0.82, 1.9], [0.82, 0.80, 3, '#bcd6ff'], [0.75, 0.53, 1.3]], l: [[7, 0], [7, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
      t: '<b>Orion</b>, marele vânător, se vede iarna. Cele 3 stele la rând din mijloc sunt <b>Centura lui Orion</b>. Steaua roșiatică de sus e <b>Betelgeuse</b>, o stea uriașă, iar cea albastră de jos e <b>Rigel</b>.' },
    { id: 'leo', n: 'Leul', e: '🦁', s: [[0.20, 0.80, 2.6], [0.21, 0.73, 1.5], [0.24, 0.68, 2.1], [0.28, 0.66, 1.5], [0.30, 0.70, 1.4], [0.36, 0.72, 1.6], [0.44, 0.77, 2], [0.36, 0.79, 1.5]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 7], [7, 0]],
      t: 'Un <b>leu</b> culcat. Coama lui arată ca un semn de întrebare întors. Steaua cea mai strălucitoare, <b>Regulus</b>, înseamnă „micul rege”. Se vede primăvara.' },
    { id: 'cyg', n: 'Lebăda', e: '🦢', s: [[0.12, 0.06, 2.4], [0.12, 0.15, 1.8], [0.12, 0.28, 1.6, '#ffd890'], [0.05, 0.13, 1.5], [0.19, 0.18, 1.5]], l: [[0, 1], [1, 2], [3, 1], [1, 4]],
      t: 'O <b>lebădă</b> care zboară cu aripile întinse, de-a lungul <b>Căii Lactee</b>. Se mai numește și „Crucea Nordului”. Se vede vara.' },
    { id: 'sco', n: 'Scorpionul', e: '🦂', s: [[0.47, 0.70, 1.5], [0.45, 0.75, 1.6], [0.46, 0.80, 1.4], [0.50, 0.82, 2.8, '#ff8a6a'], [0.53, 0.87, 1.6], [0.56, 0.91, 1.6], [0.60, 0.92, 1.6], [0.63, 0.89, 1.8], [0.62, 0.85, 1.6]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]],
      t: 'Un <b>scorpion</b> cu coada încârligată. În mijloc strălucește <b>Antares</b>, o stea roșie uriașă. Vara, la noi, se vede jos, aproape de orizont.' }
  ];

  defineModule({
    id: 'constellations', title: 'Constelațiile', sub: 'Desenele de pe cerul nopții',
    start: function (api) {
      const ctx = api.ctx; let sel = null, all = false, spin = false, ang = 0, glowT = 0;
      const r1 = api.row(''), bs = {};
      C.forEach((c) => { bs[c.id] = api.button(r1, c.e + ' ' + c.n.split(',')[0], () => pick(c.id)); });
      const r2 = api.row('');
      const ba = api.button(r2, '✨ Toate desenele', () => { all = !all; ba.classList.toggle('on', all); });
      const bp = api.button(r2, '🧭 Steaua Polară', () => pick('pol'));
      const bsp = api.button(r2, '🔄 Cerul se învârte', () => { spin = !spin; bsp.classList.toggle('on', spin); });
      function pick(id) { sel = id; glowT = 0; for (const k in bs) bs[k].classList.toggle('on', k === id); bp.classList.toggle('on', id === 'pol'); if (id === 'pol') api.say('<b>Steaua Polară</b> stă mereu deasupra <b>Polului Nord</b>. Ca s-o găsești: pornește de la cele 2 stele din fața <b>Carului Mare</b> și mergi drept în sus. Dacă te uiți spre ea, în fața ta e <b>Nordul</b>!'); else { const c = C.find((q) => q.id === id); api.say('<b>' + c.e + ' ' + c.n + '.</b> ' + c.t); } }
      api.say('Oamenii de demult au unit stelele cu linii închipuite și au văzut în ele <b>animale, eroi și obiecte</b>. Așa au apărut <b>constelațiile</b>. Atinge o stea sau alege un desen de jos!');
      let sky = { x: 0, y: 0, w: 1, h: 1 };
      const padL = () => api.W >= 700 ? 84 : 8;
      const P = (x, y) => { const px = 0.49, py = 0.12, dx = x - px, dy = (y - py) * sky.h / sky.w, c = Math.cos(ang), s = Math.sin(ang); return [sky.x + (px + dx * c - dy * s) * sky.w, sky.y + (py * sky.h / sky.w + dx * s + dy * c) * sky.w]; };
      api.pointer({ down: (x, y) => { let best = null, bd = 30; for (const c of C) for (const st of c.s) { const p = P(st[0], st[1]), d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = c.id; } } if (best) pick(best); } });
      let bgS = null;
      return {
        frame: function (dt, t) {
          if (spin) ang -= dt * 0.08; glowT += dt;
          const W = api.freeW, H = api.H, U = api.unit, L = padL();
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#040818'); g.addColorStop(0.75, '#0c1838'); g.addColorStop(1, '#1d2c5a'); ctx.fillStyle = g; ctx.fillRect(0, 0, api.W, H);
          const top = 70, bot = api.cy + U * 0.98; sky = { x: L, y: top, w: W - L - 10, h: bot - top };
          /* stele mărunte de fundal (se rotesc și ele) */
          if (!bgS) { let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; bgS = []; for (let i = 0; i < 380; i++) bgS.push([rnd() * 1.4 - 0.2, rnd() * 1.6 - 0.3, rnd()]); }
          for (const b of bgS) { const p = P(b[0], b[1]); ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.5 * b[2] * (0.6 + 0.4 * Math.sin(t * 2 + b[2] * 30))) + ')'; ctx.fillRect(p[0], p[1], b[2] > 0.85 ? 1.8 : 1.1, b[2] > 0.85 ? 1.8 : 1.1); }
          /* Calea Lactee */
          ctx.save(); const m1 = P(0.0, 0.0), m2 = P(0.3, 1.0); const mg = ctx.createLinearGradient(m1[0], m1[1], m2[0], m2[1]); mg.addColorStop(0, 'rgba(180,190,255,0)'); mg.addColorStop(0.5, 'rgba(180,190,255,0.08)'); mg.addColorStop(1, 'rgba(180,190,255,0)'); ctx.strokeStyle = mg; ctx.lineWidth = sky.w * 0.12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(m1[0], m1[1]); ctx.lineTo(m2[0], m2[1]); ctx.stroke(); ctx.restore();
          /* liniile */
          for (const c of C) {
            const on = all || sel === c.id, k = sel === c.id ? clamp(glowT * 1.2, 0, 1) : 1;
            if (on) { ctx.strokeStyle = sel === c.id ? 'rgba(255,214,110,0.85)' : 'rgba(150,180,255,0.45)'; ctx.lineWidth = sel === c.id ? 2.5 : 1.5; ctx.beginPath(); c.l.forEach(([a, b], i) => { if (i / c.l.length > k) return; const p = P(c.s[a][0], c.s[a][1]), q = P(c.s[b][0], c.s[b][1]); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke();
              let mx = 0, my = 0; c.s.forEach((s) => { const p = P(s[0], s[1]); mx += p[0]; my = Math.max(my, p[1]); }); mx /= c.s.length;
              A.label(ctx, c.e + ' ' + c.n.split(',')[0], mx, my + 22, { size: A.labelSize(U) * (sel === c.id ? 1 : 0.85), color: sel === c.id ? '#ffe08a' : '#cdd8ff' }); }
          }
          if (sel === 'pol') { const a = C[0].s[0], b = C[0].s[1], pa = P(a[0], a[1]), pb = P(b[0], b[1]), pp = P(0.49, 0.12); A.arrow(ctx, pa[0], pa[1], lerp(pa[0], pp[0], clamp(glowT * 0.7, 0, 0.92)), lerp(pa[1], pp[1], clamp(glowT * 0.7, 0, 0.92)), { color: '#7dffb0', width: 3, dash: [8, 6] }); ctx.strokeStyle = 'rgba(255,214,110,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); C[0].l.forEach(([i, j]) => { const p = P(C[0].s[i][0], C[0].s[i][1]), q = P(C[0].s[j][0], C[0].s[j][1]); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); A.label(ctx, '⭐ Steaua Polară', pp[0], pp[1] - 24, { size: A.labelSize(U), color: '#fff6d0' }); }
          /* stelele principale */
          for (const c of C) for (const s of c.s) { const p = P(s[0], s[1]), r = s[2] * 1.3 * (0.9 + 0.1 * Math.sin(t * 3 + s[0] * 40)), col = s[3] || '#ffffff'; A.glow(ctx, p[0], p[1], r * 5, col, 0.35); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill(); }
          /* orizontul cu dealuri și copaci */
          const hy = api.cy + U * 0.8; ctx.fillStyle = '#05080f'; ctx.beginPath(); ctx.moveTo(0, H); for (let i = 0; i <= 30; i++) { const x = api.W * i / 30; ctx.lineTo(x, hy + Math.sin(i * 0.6) * 10 + Math.sin(i * 1.7) * 5); } ctx.lineTo(api.W, H); ctx.fill();
          for (let i = 0; i < 9; i++) { const x = (i * 157 + 40) % api.W, y = hy + Math.sin(x / api.W * 30 * 0.6) * 10; ctx.beginPath(); ctx.moveTo(x - 9, y + 4); ctx.lineTo(x, y - 30 - (i % 3) * 10); ctx.lineTo(x + 9, y + 4); ctx.fill(); }
          A.text(ctx, 'N ↑ (spre Steaua Polară)', L + (W - L) * 0.49, hy + 22, { size: A.fs(U, 0.032, 10), color: 'rgba(255,255,255,0.5)' });
        }
      };
    }
  });
})();
