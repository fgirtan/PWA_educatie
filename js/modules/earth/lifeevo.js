/* Modul: Evoluția faunei și a florei */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const PER = [
    { n: 'Precambrian', a: 4600, b: 541, era: 'Precambrian', sea: ['🦠', '🪼'], land: [], air: [], pl: [], top: '#40344a', bot: '#7a5a3a', f: 'Doar viețuitoare simple: bacterii și, spre final, creaturi moi, ca niște meduze (Ediacara).', fl: 'Alge și bacterii albastre-verzui în oceane. Ele produc oxigenul din aer. Uscatul e gol.' },
    { n: 'Cambrian', a: 541, b: 485, era: 'Paleozoic', sea: ['🦐', '🐚', '🪸', '🦞'], land: [], air: [], pl: [], top: '#2a4a6a', bot: '#7a6a4a', f: 'Explozia cambriană: apar aproape toate marile grupe de animale, cu cochilii și schelete: trilobiți, crustacee, viermi, primele animale cu spinare.', fl: 'Alge marine. Uscatul rămâne fără plante.' },
    { n: 'Ordovician', a: 485, b: 444, era: 'Paleozoic', sea: ['🐚', '🦑', '🦐', '🪸'], land: [], air: [], pl: ['🌱'], top: '#2a4a6a', bot: '#7a6a4a', f: 'Mări pline de viață: scoici, corali, cefalopode uriașe. Apar primii pești fără fălci. Se termină cu o extincție în masă.', fl: 'Primele plante mici, ca mușchii, ies pe uscat.', ev: '☠️ Extincție în masă (445 mil. ani): ~85% din specii' },
    { n: 'Silurian', a: 444, b: 419, era: 'Paleozoic', sea: ['🐟', '🦈', '🐚', '🦂'], land: ['🦂'], air: [], pl: ['🌱', '🌿'], top: '#355a7a', bot: '#7a7a4a', f: 'Apar peștii cu fălci. Primele animale (miriapode, scorpioni) ies pe uscat.', fl: 'Primele plante cu „vase” care duc apa: ferigile străbune.' },
    { n: 'Devonian', a: 419, b: 359, era: 'Paleozoic', sea: ['🐟', '🦈', '🐠'], land: ['🦎'], air: [], pl: ['🌿', '🌲'], top: '#3a6a9a', bot: '#5a7a4a', f: '„Epoca peștilor”. Unii pești cu înotătoare puternice (ca Tiktaalik) ies pe uscat și devin primii amfibieni cu patru picioare.', fl: 'Apar primele păduri, cu copaci înalți. Plantele schimbă clima și aerul.', ev: '☠️ Extincție în masă (372 mil. ani): ~75% din specii' },
    { n: 'Carbonifer', a: 359, b: 299, era: 'Paleozoic', sea: ['🐟', '🦈'], land: ['🐸', '🦎', '🪰'], air: ['🪰'], pl: ['🌴', '🌿', '🌲'], top: '#4a7aa0', bot: '#3a6a3a', f: 'Insecte uriașe (libelule cât un corb!), amfibieni mari. Apar primele reptile, care fac ouă pe uscat.', fl: 'Păduri imense de ferigi și licopode. Din ele s-a format cărbunele de azi.' },
    { n: 'Permian', a: 299, b: 252, era: 'Paleozoic', sea: ['🐟', '🦈'], land: ['🦎', '🐍'], air: [], pl: ['🌲', '🌴'], top: '#6a8aa0', bot: '#a07a4a', f: 'Domnesc reptilele cu aspect de mamifere (sinapsidele), ca Dimetrodon cu „pânza” pe spate.', fl: 'Conifere (brazi) peste tot; clima se usucă.', ev: '☠️ Marea Moarte (252 mil. ani): ~90% din specii marine' },
    { n: 'Triasic', a: 252, b: 201, era: 'Mesozoic', sea: ['🐬', '🐢', '🐟'], land: ['🦖', '🐭', '🐢'], air: [], pl: ['🌲', '🌴'], top: '#6a9ac0', bot: '#a08a5a', f: 'Apar primii dinozauri, primele mamifere (mici, ca șoarecii) și crocodilii. În mări trăiesc ihtiozauri.', fl: 'Conifere, cicade și ferigi.', ev: '☠️ Extincție în masă (201 mil. ani): ~75% din specii' },
    { n: 'Jurasic', a: 201, b: 145, era: 'Mesozoic', sea: ['🐬', '🦈'], land: ['🦕', '🦖'], air: ['🐦'], pl: ['🌲', '🌴', '🌿'], top: '#5aa0d0', bot: '#4a8a4a', f: 'Epoca dinozaurilor uriași: sauropode cât clădirile. Apar primele păsări (Archaeopteryx) din dinozauri cu pene.', fl: 'Păduri de conifere, cicade și ferigi, fără flori.' },
    { n: 'Cretacic', a: 145, b: 66, era: 'Mesozoic', sea: ['🐬', '🦈'], land: ['🦖', '🦕', '🐭'], air: ['🐦'], pl: ['🌲', '🌸', '🌼'], top: '#4a9ad8', bot: '#4a9a4a', f: 'T. rex și Triceratops. Mamifere mici trăiesc la umbra dinozaurilor, iar păsările se înmulțesc.', fl: 'Apar florile! Plantele cu flori (angiospermele) se răspândesc, iar odată cu ele albinele și fluturii.', ev: '☄️ Asteroid (66 mil. ani): dispar dinozaurii neaviari, ~76% din specii' },
    { n: 'Paleogen', a: 66, b: 23, era: 'Cenozoic', sea: ['🐋', '🦈', '🐟'], land: ['🐴', '🐒', '🐗'], air: ['🦇', '🦉'], pl: ['🌴', '🌳', '🌸'], top: '#4aa0e0', bot: '#3a9a4a', f: 'Mamiferele explodează în varietate: apar balenele, caii mici, liliecii, primatele. După dinozauri, mamiferele ocupă locul lor.', fl: 'Păduri tropicale întinse și flori peste tot.' },
    { n: 'Neogen', a: 23, b: 2.6, era: 'Cenozoic', sea: ['🐋', '🦈', '🐬'], land: ['🦒', '🐘', '🦍', '🐅'], air: ['🦅'], pl: ['🌾', '🌳'], top: '#4aa8e8', bot: '#a09a4a', f: 'Maimuțe mari (urangutani, gorile). Apar primii strămoși ai omului în Africa. Se văd animale de savană: girafe, elefanți.', fl: 'Se întind <b>ierburile</b> și savanele — de aici cerealele de azi: grâul, porumbul.' },
    { n: 'Cuaternar', a: 2.6, b: 0, era: 'Cenozoic', sea: ['🐋', '🐬', '🐟'], land: ['🦣', '🐅', '🧍', '🦌'], air: ['🦅'], pl: ['🌳', '🌾', '❄️'], top: '#6ab0e8', bot: '#c8d8e0', f: 'Epoca glaciară: mamuți și rinoceri lânoși. Apare omul și își schimbă lumea. Multe animale mari dispar.', fl: 'Ghețarii înaintează și se retrag. Omul începe să cultive plante și schimbă flora.' }
  ];
  const FLORA = [['Alge', 3000], ['Mușchi (uscat)', 470], ['Ferigi', 430], ['Primele păduri', 385], ['Conifere', 320], ['Plante cu flori', 130], ['Ierburi', 55]];
  const FAUNA = [['Animale marine', 575], ['Pești', 500], ['Amfibieni', 370], ['Reptile', 320], ['Dinozauri', 230], ['Mamifere', 210], ['Păsări', 150], ['Primate', 65], ['Oameni', 0.3]];
  defineModule({
    id: 'lifeevo', title: 'Fauna și flora în timp', sub: 'Cum s-au schimbat animalele și plantele pe Pământ',
    start: function (api) {
      const ctx = api.ctx;
      let idx = 1, play = false, acc = 0, crits = [], plants = [], lastIdx = -1;
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Perioada', min: 0, max: PER.length - 1, step: 1, value: idx, fmt: (v) => PER[v].n, onInput: (v) => { idx = v; play = false; bP.innerHTML = '▶ Derulează'; } });
      const bP = api.button(r1, '▶ Derulează', () => { play = !play; if (play && idx >= PER.length - 1) idx = 0; bP.innerHTML = play ? '⏸ Pauză' : '▶ Derulează'; });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      api.say('Trage de glisor prin <b>perioadele geologice</b> și vezi cum se schimbă animalele (fauna) și plantele (flora). Dedesubt apar grupele de viețuitoare care au apărut deja. Atenție la <b>extincțiile în masă</b> ☠️!', 15000);
      function build() {
        const P = PER[idx], W = api.freeW;
        const mk = (list, hab) => list.length ? Array.from({ length: hab === 'air' ? 3 : 6 }, (_, i) => ({ e: list[i % list.length], x: Math.random(), y: Math.random(), v: (0.02 + Math.random() * 0.05) * (Math.random() < 0.5 ? -1 : 1), hab: hab, s: 22 + Math.random() * 14 })) : [];
        crits = [].concat(mk(P.sea, 'sea'), mk(P.land, 'land'), mk(P.air, 'air'));
        plants = P.pl.length ? Array.from({ length: 9 }, (_, i) => ({ e: P.pl[i % P.pl.length], x: 0.42 + 0.56 * ((i * 0.37) % 1), s: 24 + (i % 3) * 5 })) : [];
        lastIdx = idx; api.say('<b>' + P.n + '</b> (' + fmt(P.a, P.a < 10 ? 1 : 0) + ' – ' + fmt(P.b, P.b < 10 ? 1 : 0) + ' mil. ani în urmă · era ' + P.era + '). <b>Faună:</b> ' + P.f + ' <b>Floră:</b> ' + P.fl + (P.ev ? ' <b>' + P.ev + '</b>' : ''), 22000);
      }
      function chip(x, y, txt, on) { ctx.font = '600 10px system-ui,sans-serif'; const w = ctx.measureText(txt).width + 14; ctx.fillStyle = on ? 'rgba(120,230,150,0.28)' : 'rgba(255,255,255,0.06)'; ctx.strokeStyle = on ? '#7dffb0' : 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, 20, 10) : ctx.rect(x, y, w, 20); ctx.fill(); ctx.stroke(); ctx.fillStyle = on ? '#fff' : 'rgba(255,255,255,0.4)'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 7, y + 14); return w + 6; }
      function frame(dt, t) {
        if (play) { acc += dt; if (acc > 2.8) { acc = 0; if (idx < PER.length - 1) { idx++; sl.set(idx); } else { play = false; bP.innerHTML = '↺ De la început'; } } }
        if (idx !== lastIdx) build();
        const P = PER[idx], W = api.freeW, U = api.unit, top = api.cy - U + 2, sceneH = Math.min(U * 1.05, 280), mid = (P.a + P.b) / 2;
        ctx.fillStyle = '#0a0f1a'; ctx.fillRect(0, 0, api.W, api.H);
        const sx = 10, sw = W - 20, sy = top + 4;
        ctx.save(); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(sx, sy, sw, sceneH, 14) : ctx.rect(sx, sy, sw, sceneH); ctx.clip();
        const sk = ctx.createLinearGradient(0, sy, 0, sy + sceneH); sk.addColorStop(0, P.top); sk.addColorStop(1, '#d8ecf8'); ctx.fillStyle = sk; ctx.fillRect(sx, sy, sw, sceneH);
        const gy = sy + sceneH * 0.72, seaW = sw * 0.4;
        /* mare (în stânga, secțiune) și uscat */
        const sea = ctx.createLinearGradient(0, gy - sceneH * 0.3, 0, sy + sceneH); sea.addColorStop(0, '#2a7ab8'); sea.addColorStop(1, '#0a2a52'); ctx.fillStyle = sea; ctx.fillRect(sx, gy - sceneH * 0.3, seaW, sceneH);
        ctx.fillStyle = P.bot; ctx.fillRect(sx + seaW, gy, sw - seaW, sceneH);
        ctx.fillStyle = P.pl.length ? '#3a8a3a' : '#7a6a5a'; ctx.fillRect(sx + seaW, gy - 4, sw - seaW, 8);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx, sy + sceneH - 10, seaW, 10);
        /* plante */
        for (const p of plants) { ctx.font = p.s + 'px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.e, sx + sw * p.x, gy + 2); }
        /* creaturi */
        for (const c of crits) {
          c.x += c.v * dt; const lo = c.hab === 'sea' ? 0.02 : c.hab === 'land' ? 0.42 : 0.05, hi = c.hab === 'sea' ? 0.38 : c.hab === 'land' ? 0.97 : 0.97; if (c.x > hi) { c.x = hi; c.v *= -1; } if (c.x < lo) { c.x = lo; c.v *= -1; }
          const px = sx + sw * c.x; let py;
          if (c.hab === 'sea') py = gy - sceneH * 0.22 + (sceneH * 0.74 - 30) * c.y + Math.sin(t * 2 + c.y * 9) * 3;
          else if (c.hab === 'land') py = gy - 4 + Math.abs(Math.sin(t * 3 + c.y * 9)) * -3 + 18;
          else py = sy + 30 + sceneH * 0.25 * c.y + Math.sin(t * 3 + c.x * 9) * 6;
          ctx.font = c.s + 'px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center';
          ctx.save(); ctx.translate(px, py); if (c.v < 0) ctx.scale(-1, 1); ctx.fillText(c.e, 0, 0); ctx.restore();
        }
        ctx.restore();
        ctx.fillStyle = 'rgba(8,14,34,0.8)'; ctx.fillRect(sx + 8, sy + 8, 170, 22); ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(P.n + ' · ' + fmt(P.a, P.a < 10 ? 1 : 0) + '–' + fmt(P.b, P.b < 10 ? 1 : 0) + ' mil.', sx + 14, sy + 23);
        if (P.ev) { ctx.fillStyle = 'rgba(180,40,40,0.85)'; ctx.fillRect(sx + 8, sy + 34, Math.min(sw - 16, 330), 22); ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.fillText(P.ev.length > 52 && sw < 380 ? P.ev.slice(0, 50) + '…' : P.ev, sx + 14, sy + 49); }
        /* grupe de viețuitoare: devin „aprinse” când au apărut */
        let cy2 = sy + sceneH + 12;
        ctx.fillStyle = '#7dffb0'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('🌿 Flora apărută până acum', sx, cy2 + 4);
        let cx = sx; cy2 += 10; FLORA.forEach(([n, a]) => { ctx.font = '600 10px system-ui,sans-serif'; const w = ctx.measureText(n).width + 20; if (cx + w > sx + sw) { cx = sx; cy2 += 24; } cx += chip(cx, cy2, n, a >= mid); });
        cy2 += 36; ctx.fillStyle = '#ffd166'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('🐾 Fauna apărută până acum', sx, cy2 - 6);
        cx = sx; FAUNA.forEach(([n, a]) => { ctx.font = '600 10px system-ui,sans-serif'; const w = ctx.measureText(n).width + 20; if (cx + w > sx + sw) { cx = sx; cy2 += 24; } cx += chip(cx, cy2, n, a >= mid); });
        info.innerHTML = '<b>' + P.n + '</b> · ' + fmt(P.a - P.b, 0) + ' mil. ani de durată · era <b>' + P.era + '</b>';
      }
      return { frame: frame };
    }
  });
})();
