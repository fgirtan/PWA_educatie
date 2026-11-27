/* Modul: Internetul — drumul unui mesaj până la bunica */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const emoji = (ctx, e, x, y, s) => { ctx.save(); ctx.font = s + 'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, x, y); ctx.restore(); };
  const KIND = { msg: ['💬', 'un mesaj', 6, '#7dffb0'], photo: ['🖼️', 'o poză', 18, '#ffcf4a'], video: ['📹', 'un apel video', 40, '#ff8ac0'] };
  defineModule({
    id: 'internet', title: 'Internetul', sub: 'Cum ajunge un mesaj de la tine la bunica',
    start: function (api) {
      const ctx = api.ctx; let packets = [], kind = 'msg', sent = 0, got = 0, stream = false, slow = true;
      const r = api.row('');
      api.button(r, '💬 Trimite un mesaj', () => send('msg'));
      api.button(r, '🖼️ Trimite o poză', () => send('photo'));
      const bv = api.button(r, '📹 Apel video', () => { stream = !stream; bv.classList.toggle('on', stream); kind = 'video'; api.say('La un <b>apel video</b>, telefonul trimite fără oprire <b>zeci de imagini pe secundă</b>, fiecare tăiată în pachete. Ele zboară încontinuu, așa că bunica te vede în direct!'); });
      const bs = api.button(r, '🐢 Încetinit', () => { slow = !slow; bs.classList.toggle('on', slow); }); bs.classList.add('on');
      function send(k) { kind = k; sent = KIND[k][2]; got = 0; const n = KIND[k][2]; for (let i = 0; i < n; i++) packets.push({ u: -i * 0.035, route: i % 2, k: k, id: i }); api.say(k === 'msg' ? 'Mesajul tău e transformat în <b>cifre (0 și 1)</b> și tăiat în <b>pachete mici</b>, ca niște plicuri. Fiecare pachet are scrisă adresa bunicii. Ele pot merge pe drumuri diferite și se adună la loc pe telefonul ei!' : 'O poză e mult mai mare decât un mesaj, așa că e tăiată în <b>mult mai multe pachete</b>.'); }
      api.say('Internetul e o <b>rețea uriașă</b> de calculatoare legate între ele prin cabluri, unde radio și sateliți. Apasă <b>Trimite un mesaj</b> și urmărește drumul lui!');
      const NODES = { kid: [90, 430], router: [210, 330], street: [330, 250], center: [500, 160], sea: [640, 300], sat: [560, 60], tower: [780, 210], gran: [900, 420] };
      const routes = [[NODES.kid, NODES.router, NODES.street, NODES.center, NODES.sea, NODES.tower, NODES.gran], [NODES.kid, NODES.router, NODES.street, NODES.center, NODES.sat, NODES.tower, NODES.gran]].map((p) => A.pathSampler(p, false, 100));
      let vt = 0;
      return {
        frame: function (dt, t) {
          A.scene(ctx, api.W, api.H, 'night');
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          ctx.fillStyle = '#1d3a2a'; ctx.fillRect(0, 470, 560, 130); ctx.fillStyle = '#123a6a'; ctx.fillRect(560, 470, 260, 130); ctx.fillStyle = '#1d3a2a'; ctx.fillRect(820, 470, 180, 130);
          ctx.strokeStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(600 + i * 30, 500 + (i % 3) * 20, 10, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
          /* legăturile */
          const link = (a, b, col, dash, w) => { ctx.strokeStyle = col; ctx.lineWidth = w || 4; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]); };
          link(NODES.kid, NODES.router, 'rgba(125,200,255,0.5)', [4, 8]); link(NODES.router, NODES.street, '#8a8f98'); link(NODES.street, NODES.center, '#8a8f98'); link(NODES.center, NODES.sea, '#ffb43d', null, 5); link(NODES.sea, NODES.tower, '#ffb43d', null, 5); link(NODES.center, NODES.sat, 'rgba(255,255,255,0.4)', [6, 6]); link(NODES.sat, NODES.tower, 'rgba(255,255,255,0.4)', [6, 6]); link(NODES.tower, NODES.gran, 'rgba(125,200,255,0.5)', [4, 8]);
          /* undele radio (Wi-Fi și antena) */
          for (const [n, c] of [[NODES.router, '#7ad0ff'], [NODES.tower, '#7ad0ff']]) for (let i = 0; i < 3; i++) { const k = ((t * 0.8 + i / 3) % 1); ctx.strokeStyle = A.rgba(c, 0.5 * (1 - k)); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(n[0], n[1] - 20, 10 + k * 40, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
          /* nodurile */
          const node = (p, e, s, lab) => { A.glow(ctx, p[0], p[1], s, '#9fc4ff', 0.15); emoji(ctx, e, p[0], p[1], s); A.text(ctx, lab, p[0], p[1] + s * 0.75, { size: 14 }); };
          node(NODES.kid, '🧒', 64, 'tu, cu tableta'); node(NODES.router, '📶', 46, 'routerul Wi-Fi'); node(NODES.street, '🏙️', 54, 'cablul din oraș'); node(NODES.center, '🏢', 64, 'centrul de date'); node(NODES.sea, '🌊', 40, 'cablu sub mare'); node(NODES.sat, '🛰️', 48, 'satelit'); node(NODES.tower, '📡', 56, 'antena de telefonie'); node(NODES.gran, '👵', 64, 'bunica, cu telefonul');
          /* pachetele */
          const sp = slow ? 0.14 : 0.9; vt += dt;
          if (stream && Math.random() < dt * 10) packets.push({ u: 0, route: Math.random() < 0.5 ? 0 : 1, k: 'video', id: 0 });
          for (const p of packets) { p.u += dt * sp; if (p.u >= 1 && !p.done) { p.done = true; if (p.k !== 'video') got++; } if (p.u < 0 || p.done) continue; const q = routes[p.route].at(p.u); ctx.fillStyle = KIND[p.k][3]; ctx.save(); ctx.translate(q.x, q.y - 4); ctx.fillRect(-11, -7, 22, 14); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-11, -7); ctx.lineTo(0, 2); ctx.lineTo(11, -7); ctx.stroke(); ctx.restore(); }
          packets = packets.filter((p) => !p.done || p.k !== 'video');
          if (packets.length > 300) packets.splice(0, packets.length - 300);
          /* telefonul bunicii */
          if (sent) { const k = got / sent; A.panel(ctx, 820, 110, 170, 70, { r: 12 }); A.text(ctx, 'pachete sosite: ' + got + '/' + sent, 905, 132, { size: 13 }); A.meter(ctx, 835, 150, 140, 12, k, KIND[kind][3]); if (k >= 1) emoji(ctx, KIND[kind][0], NODES.gran[0] + 50, NODES.gran[1] - 50, 40); }
          A.text(ctx, '0110 1001 0111 …', 330, 560, { size: 16, color: 'rgba(125,255,176,0.6)' });
          A.text(ctx, slow ? '(încetinit: în realitate drumul durează mai puțin de o secundă!)' : '⚡ viteză reală: aproape cât lumina', 500, 590, { size: 14, color: 'rgba(255,255,255,0.7)' });
          ctx.restore();
        }
      };
    }
  });
})();
