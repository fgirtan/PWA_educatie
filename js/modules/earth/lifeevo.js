/* Modul: Evoluția faunei și a florei */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  /* specii desenate (Creatures): funcție, opțiuni, mărime (fracție din înălțimea scenei), viteză relativă */
  const SPEC = {
    bacteria: ['bacteria', {}, 0.12, 0.2], jelly: ['jelly', {}, 0.1, 0.25], trilobite: ['trilobite', {}, 0.11, 0.25, 'floor'], anomalo: ['anomalo', {}, 0.2, 0.6],
    shrimp: ['shrimp', {}, 0.07, 0.4], ortho: ['squid', { v: 'ortho' }, 0.22, 0.5], jawless: ['fish', { v: 'jawless' }, 0.13, 0.6], fish: ['fish', {}, 0.12, 0.8],
    shark: ['shark', {}, 0.24, 0.9], eurypterid: ['scorpion', { v: 'sea' }, 0.16, 0.4, 'floor'], placoderm: ['fish', { v: 'placoderm' }, 0.26, 0.6], ammonite: ['ammonite', {}, 0.1, 0.35],
    ichthyo: ['dolphin', { v: 'ichthyo' }, 0.26, 0.9], seaturtle: ['turtle', {}, 0.16, 0.45], plesio: ['plesio', {}, 0.32, 0.6], whale: ['whale', {}, 0.36, 0.5], dolphin: ['dolphin', {}, 0.22, 1],
    scorpion: ['scorpion', {}, 0.16, 0.5], tetrapod: ['lizard', { v: 'tetrapod' }, 0.32, 0.35], frog: ['frog', {}, 0.16, 0.6], lizard: ['lizard', {}, 0.26, 0.7], dimetro: ['lizard', { v: 'dimetro' }, 0.32, 0.45],
    coelo: ['trex', { v: 'small' }, 0.3, 0.8], mouse: ['mouse', {}, 0.13, 0.8], turtle: ['turtle', { land: true }, 0.18, 0.2], sauropod: ['sauropod', {}, 0.56, 0.3], stego: ['stego', {}, 0.38, 0.35],
    allo: ['trex', { v: 'allo' }, 0.44, 0.5], trex: ['trex', {}, 0.48, 0.5], trike: ['trike', {}, 0.38, 0.35], horse: ['horse', {}, 0.24, 0.6], monkey: ['ape', { v: 'monkey' }, 0.18, 0.5],
    giraffe: ['giraffe', {}, 0.4, 0.4], elephant: ['elephant', {}, 0.4, 0.3], ape: ['ape', {}, 0.26, 0.4], tiger: ['cat', {}, 0.3, 0.6], mammoth: ['elephant', { v: 'mammoth' }, 0.42, 0.3],
    saber: ['cat', { v: 'saber' }, 0.3, 0.55], human: ['human', {}, 0.26, 0.45], deer: ['horse', { v: 'deer' }, 0.26, 0.6],
    dragonfly: ['dragonfly', {}, 0.18, 0.8], archae: ['bird', { v: 'archae' }, 0.12, 0.7], ptero: ['ptero', {}, 0.2, 0.6], bird: ['bird', {}, 0.1, 0.8], bat: ['bat', {}, 0.09, 0.9], owl: ['bird', { v: 'owl' }, 0.11, 0.6], eagle: ['bird', { v: 'eagle' }, 0.14, 0.6]
  };
  /* plante: funcție, opțiuni, înălțime (fracție din scenă) */
  const PL = {
    moss: ['sprout', { v: 'moss' }, 0.1], cooksonia: ['sprout', { v: 'cooksonia' }, 0.14], fern: ['fern', {}, 0.2], treefern: ['palm', { v: 'treefern' }, 0.42], lepido: ['palm', { v: 'lepido' }, 0.55],
    conifer: ['conifer', {}, 0.45], snowfir: ['conifer', { snow: true }, 0.45], cycad: ['palm', { v: 'cycad' }, 0.26], palm: ['palm', {}, 0.48], flower: ['flower', {}, 0.13], flower2: ['flower', { color: '#ffd23a', center: '#c8701a' }, 0.12],
    tree: ['tree', {}, 0.46], acacia: ['tree', { v: 'acacia' }, 0.42], grass: ['grass', {}, 0.12], grain: ['grass', { v: 'grain', color: '#b8a850' }, 0.13],
    algae: ['algae', {}, 0.3], coral: ['coral', {}, 0.16], stroma: ['stroma', {}, 0.12], charnia: ['charnia', {}, 0.2]
  };
  /* sea = în apă, land = pe uscat, air = în aer; sp = plante pe fundul mării, pl = plante pe uscat */
  const PER = [
    { n: 'Precambrian', a: 4600, b: 541, era: 'Precambrian', sea: ['bacteria', 'jelly'], land: [], air: [], sp: ['stroma', 'charnia'], pl: [], top: '#4a4058', hz: '#d8a888', bot: '#7a5a42', f: 'Doar viețuitoare simple: bacterii și, spre final, creaturi moi, ca niște meduze (Ediacara).', fl: 'Alge și bacterii albastre-verzui în oceane. Ele produc oxigenul din aer. Uscatul e gol.' },
    { n: 'Cambrian', a: 541, b: 485, era: 'Paleozoic', sea: ['trilobite', 'anomalo', 'trilobite', 'shrimp'], land: [], air: [], sp: ['algae', 'coral'], pl: [], top: '#3a5a7a', hz: '#c8d4d8', bot: '#8a7458', f: 'Explozia cambriană: apar aproape toate marile grupe de animale, cu cochilii și schelete: trilobiți, crustacee, viermi, primele animale cu spinare.', fl: 'Alge marine. Uscatul rămâne fără plante.' },
    { n: 'Ordovician', a: 485, b: 444, era: 'Paleozoic', sea: ['ortho', 'trilobite', 'jawless', 'jelly'], land: [], air: [], sp: ['coral', 'algae'], pl: ['moss'], top: '#3a5a7a', hz: '#c8d4d8', bot: '#857258', f: 'Mări pline de viață: scoici, corali, cefalopode uriașe. Apar primii pești fără fălci. Se termină cu o extincție în masă.', fl: 'Primele plante mici, ca mușchii, ies pe uscat.', ev: '☠️ Extincție în masă (445 mil. ani): ~85% din specii' },
    { n: 'Silurian', a: 444, b: 419, era: 'Paleozoic', sea: ['fish', 'shark', 'ortho', 'eurypterid'], land: ['scorpion'], air: [], sp: ['coral', 'algae'], pl: ['cooksonia', 'moss'], top: '#41678a', hz: '#ccd8da', bot: '#7e7652', f: 'Apar peștii cu fălci. Primele animale (miriapode, scorpioni) ies pe uscat.', fl: 'Primele plante cu „vase” care duc apa: ferigile străbune.' },
    { n: 'Devonian', a: 419, b: 359, era: 'Paleozoic', sea: ['placoderm', 'shark', 'fish', 'ammonite'], land: ['tetrapod'], air: [], sp: ['algae', 'coral'], pl: ['fern', 'treefern', 'cooksonia'], top: '#4672a0', hz: '#d0dcdc', bot: '#6a7448', f: '„Epoca peștilor”. Unii pești cu înotătoare puternice (ca Tiktaalik) ies pe uscat și devin primii amfibieni cu patru picioare.', fl: 'Apar primele păduri, cu copaci înalți. Plantele schimbă clima și aerul.', ev: '☠️ Extincție în masă (372 mil. ani): ~75% din specii' },
    { n: 'Carbonifer', a: 359, b: 299, era: 'Paleozoic', sea: ['fish', 'shark'], land: ['frog', 'lizard', 'tetrapod'], air: ['dragonfly'], sp: ['algae'], pl: ['lepido', 'fern', 'treefern'], top: '#5a80a0', hz: '#d4dcd0', bot: '#4a6a3a', f: 'Insecte uriașe (libelule cât un corb!), amfibieni mari. Apar primele reptile, care fac ouă pe uscat.', fl: 'Păduri imense de ferigi și licopode. Din ele s-a format cărbunele de azi.' },
    { n: 'Permian', a: 299, b: 252, era: 'Paleozoic', sea: ['fish', 'shark', 'ammonite'], land: ['dimetro', 'lizard'], air: [], sp: ['algae'], pl: ['conifer', 'cycad'], top: '#6a8aa6', hz: '#e6dcc4', bot: '#a8845a', f: 'Domnesc reptilele cu aspect de mamifere (sinapsidele), ca Dimetrodon cu „pânza” pe spate.', fl: 'Conifere (brazi) peste tot; clima se usucă.', ev: '☠️ Marea Moarte (252 mil. ani): ~90% din specii marine' },
    { n: 'Triasic', a: 252, b: 201, era: 'Mesozoic', sea: ['ichthyo', 'seaturtle', 'fish'], land: ['coelo', 'mouse', 'turtle'], air: [], sp: ['algae', 'coral'], pl: ['conifer', 'cycad', 'fern'], top: '#6a9ac0', hz: '#e4e0cc', bot: '#a89060', f: 'Apar primii dinozauri, primele mamifere (mici, ca șoarecii) și crocodilii. În mări trăiesc ihtiozauri.', fl: 'Conifere, cicade și ferigi.', ev: '☠️ Extincție în masă (201 mil. ani): ~75% din specii' },
    { n: 'Jurasic', a: 201, b: 145, era: 'Mesozoic', sea: ['ichthyo', 'plesio', 'shark', 'ammonite'], land: ['sauropod', 'stego', 'allo'], air: ['archae', 'ptero'], sp: ['algae', 'coral'], pl: ['conifer', 'cycad', 'fern'], top: '#5aa0d0', hz: '#dcecee', bot: '#5a8a48', f: 'Epoca dinozaurilor uriași: sauropode cât clădirile. Apar primele păsări (Archaeopteryx) din dinozauri cu pene.', fl: 'Păduri de conifere, cicade și ferigi, fără flori.' },
    { n: 'Cretacic', a: 145, b: 66, era: 'Mesozoic', sea: ['plesio', 'shark', 'ammonite'], land: ['trex', 'trike', 'mouse'], air: ['ptero', 'bird'], sp: ['coral', 'algae'], pl: ['conifer', 'flower', 'flower2', 'fern'], top: '#4a9ad8', hz: '#dceaf2', bot: '#5a9a4a', f: 'T. rex și Triceratops. Mamifere mici trăiesc la umbra dinozaurilor, iar păsările se înmulțesc.', fl: 'Apar florile! Plantele cu flori (angiospermele) se răspândesc, iar odată cu ele albinele și fluturii.', ev: '☄️ Asteroid (66 mil. ani): dispar dinozaurii neaviari, ~76% din specii' },
    { n: 'Paleogen', a: 66, b: 23, era: 'Cenozoic', sea: ['whale', 'shark', 'fish'], land: ['horse', 'monkey', 'mouse'], air: ['bat', 'owl'], sp: ['coral', 'algae'], pl: ['palm', 'tree', 'flower'], top: '#4aa0e0', hz: '#dcecf4', bot: '#4a9a48', f: 'Mamiferele explodează în varietate: apar balenele, caii mici, liliecii, primatele. După dinozauri, mamiferele ocupă locul lor.', fl: 'Păduri tropicale întinse și flori peste tot.' },
    { n: 'Neogen', a: 23, b: 2.6, era: 'Cenozoic', sea: ['whale', 'shark', 'dolphin'], land: ['giraffe', 'elephant', 'ape', 'tiger'], air: ['eagle'], sp: ['coral', 'algae'], pl: ['acacia', 'grass', 'grain'], top: '#4aa8e8', hz: '#ecead4', bot: '#b0a058', f: 'Maimuțe mari (urangutani, gorile). Apar primii strămoși ai omului în Africa. Se văd animale de savană: girafe, elefanți.', fl: 'Se întind <b>ierburile</b> și savanele — de aici cerealele de azi: grâul, porumbul.' },
    { n: 'Cuaternar', a: 2.6, b: 0, era: 'Cenozoic', sea: ['whale', 'dolphin', 'fish'], land: ['mammoth', 'saber', 'human', 'deer'], air: ['eagle'], sp: ['algae'], pl: ['snowfir', 'grass', 'snowfir'], snow: true, top: '#7ab0dc', hz: '#e8f0f4', bot: '#dfe8ee', f: 'Epoca glaciară: mamuți și rinoceri lânoși. Apare omul și își schimbă lumea. Multe animale mari dispar.', fl: 'Ghețarii înaintează și se retrag. Omul începe să cultive plante și schimbă flora.' }
  ];
  const FLORA = [['Alge', 3000], ['Mușchi (uscat)', 470], ['Ferigi', 430], ['Primele păduri', 385], ['Conifere', 320], ['Plante cu flori', 130], ['Ierburi', 55]];
  const FAUNA = [['Animale marine', 575], ['Pești', 500], ['Amfibieni', 370], ['Reptile', 320], ['Dinozauri', 230], ['Mamifere', 210], ['Păsări', 150], ['Primate', 65], ['Oameni', 0.3]];
  /* text pe canvas fără emoji */
  const noEmoji = (s) => s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]️?/gu, '').trim();
  let seedN = 1; const rnd = () => { seedN = (seedN * 16807) % 2147483647; return seedN / 2147483647; };

  defineModule({
    id: 'lifeevo', title: 'Fauna și flora în timp', sub: 'Cum s-au schimbat animalele și plantele pe Pământ',
    start: function (api) {
      const ctx = api.ctx;
      let idx = 1, play = false, acc = 0, crits = [], plants = [], seaPlants = [], lastIdx = -1, fade = 1;
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Perioada', min: 0, max: PER.length - 1, step: 1, value: idx, fmt: (v) => PER[v].n, onInput: (v) => { idx = v; play = false; bP.innerHTML = '▶ Derulează'; } });
      const bP = api.button(r1, '▶ Derulează', () => { play = !play; if (play && idx >= PER.length - 1) idx = 0; bP.innerHTML = play ? '⏸ Pauză' : '▶ Derulează'; });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      api.say('Trage de glisor prin <b>perioadele geologice</b> și vezi cum se schimbă animalele (fauna) și plantele (flora). Dedesubt apar grupele de viețuitoare care au apărut deja. Atenție la <b>extincțiile în masă</b> ☠️!', 15000);
      function build() {
        const P = PER[idx]; seedN = 7 + idx * 131;
        const mk = (list, hab, n) => list.length ? Array.from({ length: n }, (_, i) => {
          const small = list.slice().sort((a, b) => SPEC[a][2] - SPEC[b][2])[0], k = i < list.length ? list[i] : small, sp = SPEC[k], dir = rnd() < 0.5 ? -1 : 1;
          return { k: k, hab: sp[4] === 'floor' ? 'floor' : hab, x: hab === 'land' ? 0.5 + 0.47 * (i + 0.2 + rnd() * 0.6) / n : hab === 'sea' ? 0.38 * (i + 0.2 + rnd() * 0.6) / n : (i + 0.2 + rnd() * 0.6) / n, y: (i + rnd() * 0.6) / n, dir: dir, face: dir, sp: sp[3] * (0.8 + rnd() * 0.4), ph: rnd() * 6, seed: rnd() * 10, pause: rnd() * 2, go: 1 };
        }) : [];
        crits = [].concat(mk(P.sea, 'sea', Math.min(4, P.sea.length + 1)), mk(P.land, 'land', Math.min(4, Math.max(2, P.land.length))), mk(P.air, 'air', P.air.length ? 2 : 0));
        plants = P.pl.length ? Array.from({ length: 6 }, (_, i) => { const k = P.pl[i % P.pl.length]; return { k: k, x: [0.52, 0.7, 0.86, 0.97, 0.61, 0.79][i], back: PL[k][2] > 0.3 || i % 2 === 0, seed: i * 1.7 }; }) : [];
        plants.sort((a, b) => (b.back ? 1 : 0) - (a.back ? 1 : 0));
        seaPlants = P.sp.map((k, i) => ({ k: k, x: 0.06 + i * 0.17 + (i % 2) * 0.05, seed: i * 2.3 })).concat(P.sp.length ? [{ k: P.sp[0], x: 0.33, seed: 5 }] : []);
        lastIdx = idx; fade = 0;
        api.say('<b>' + P.n + '</b> (' + fmt(P.a, P.a < 10 ? 1 : 0) + ' – ' + fmt(P.b, P.b < 10 ? 1 : 0) + ' mil. ani în urmă · era ' + P.era + '). <b>Faună:</b> ' + P.f + ' <b>Floră:</b> ' + P.fl + (P.ev ? ' <b>' + P.ev + '</b>' : ''), 22000);
      }
      /* etichete-grup („cipuri”) */
      function chipLayout(list, x0, w, fsz) {
        ctx.font = Art.font(fsz, 600); const out = []; let cx = x0, row = 0; const h = fsz * 1.9, gap = 6;
        for (const [n, a] of list) { const cw = ctx.measureText(n).width + fsz * 1.4; if (cx + cw > x0 + w && cx > x0) { cx = x0; row++; } out.push({ n: n, a: a, x: cx, row: row, w: cw }); cx += cw + gap; }
        return { items: out, rows: row + 1, h: h };
      }
      function drawChips(L, y0, mid, col, fsz) {
        for (const c of L.items) {
          const on = c.a >= mid, y = y0 + c.row * (L.h + 6);
          Art.roundRectPath(ctx, c.x, y, c.w, L.h, L.h / 2);
          ctx.fillStyle = on ? Art.rgba(col, 0.2) : 'rgba(255,255,255,0.04)'; ctx.fill();
          ctx.strokeStyle = on ? Art.rgba(col, 0.85) : 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.font = Art.font(fsz, 600); ctx.fillStyle = on ? '#f4f7ff' : 'rgba(255,255,255,0.42)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.n, c.x + c.w / 2, y + L.h / 2 + 0.5);
        }
      }
      function heading(x, y, txt, col, fsz, leaf) {
        ctx.save(); ctx.fillStyle = col; ctx.translate(x + fsz * 0.45, y);
        if (leaf) { ctx.beginPath(); ctx.moveTo(-fsz * 0.4, fsz * 0.35); ctx.quadraticCurveTo(-fsz * 0.45, -fsz * 0.4, fsz * 0.4, -fsz * 0.4); ctx.quadraticCurveTo(fsz * 0.35, fsz * 0.35, -fsz * 0.4, fsz * 0.35); ctx.fill(); }
        else { ctx.beginPath(); ctx.ellipse(0, fsz * 0.12, fsz * 0.26, fsz * 0.22, 0, 0, 7); ctx.fill(); for (let i = 0; i < 4; i++) { const a = -2.6 + i * 0.55; ctx.beginPath(); ctx.arc(Math.cos(a) * fsz * 0.42, Math.sin(a) * fsz * 0.38 + fsz * 0.08, fsz * 0.11, 0, 7); ctx.fill(); } }
        ctx.restore();
        ctx.font = Art.font(fsz, 700); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x + fsz * 1.2, y);
      }
      /* fundalul scenei */
      function scene(P, sx, sy, sw, sh, gy, seaW, t) {
        const sk = ctx.createLinearGradient(0, sy, 0, gy); sk.addColorStop(0, P.top); sk.addColorStop(1, P.hz); ctx.fillStyle = sk; ctx.fillRect(sx, sy, sw, gy - sy + 2);
        /* soare discret */
        ctx.fillStyle = idx === 0 ? 'rgba(255,214,170,0.85)' : 'rgba(255,248,225,0.9)'; ctx.beginPath(); ctx.arc(sx + sw * 0.82, sy + sh * 0.16, sh * 0.05, 0, 7); ctx.fill();
        /* dealuri / munți în depărtare */
        const far = Creatures.mix(P.hz, P.snow ? '#b8c8d8' : idx === 0 ? '#5a4040' : '#5a7a8a', 0.45);
        ctx.fillStyle = far; ctx.beginPath(); ctx.moveTo(sx, gy + 1);
        for (let i = 0; i <= 24; i++) { const u = i / 24, x = lerp(sx, sx + sw, u); const h = (idx === 0 || P.snow ? 0.22 : 0.12) * sh * (0.45 + 0.55 * Math.abs(Art.noise1(u * 3.2 + idx * 1.3))); ctx.lineTo(x, gy - h); }
        ctx.lineTo(sx + sw, gy + 1); ctx.closePath(); ctx.fill();
        if (P.snow) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.moveTo(sx, gy + 1); for (let i = 0; i <= 24; i++) { const u = i / 24, x = lerp(sx, sx + sw, u); const h = 0.22 * sh * (0.45 + 0.55 * Math.abs(Art.noise1(u * 3.2 + idx * 1.3))); ctx.lineTo(x, gy - h + (u * 37 % 1) * 2); } ctx.lineTo(sx + sw, gy - sh * 0.06); ctx.lineTo(sx, gy - sh * 0.05); ctx.closePath(); ctx.fill(); }
        if (idx === 0) { /* vulcan precambrian */ const vx = sx + sw * 0.7, vb = gy + 1, vh = sh * 0.3; ctx.fillStyle = Creatures.mix(far, '#3a2a2a', 0.35); ctx.beginPath(); ctx.moveTo(vx - sh * 0.35, vb); ctx.quadraticCurveTo(vx - sh * 0.1, vb - vh * 0.6, vx - sh * 0.05, vb - vh); ctx.lineTo(vx + sh * 0.05, vb - vh); ctx.quadraticCurveTo(vx + sh * 0.1, vb - vh * 0.6, vx + sh * 0.35, vb); ctx.fill(); ctx.fillStyle = '#e8743a'; ctx.beginPath(); ctx.moveTo(vx - sh * 0.05, vb - vh); ctx.lineTo(vx + sh * 0.05, vb - vh); ctx.lineTo(vx + sh * 0.02, vb - vh + sh * 0.05); ctx.lineTo(vx - sh * 0.025, vb - vh + sh * 0.07); ctx.closePath(); ctx.fill(); }
        /* sol pe uscat */
        const gnd = P.pl.length && !P.snow ? Creatures.mix(P.bot, '#4a8a3a', 0.25) : P.bot;
        const gg = ctx.createLinearGradient(0, gy, 0, sy + sh); gg.addColorStop(0, Creatures.shade(gnd, 0.12)); gg.addColorStop(1, Creatures.shade(gnd, -0.25));
        ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(sx + seaW - sh * 0.04, gy); ctx.lineTo(sx + sw, gy); ctx.lineTo(sx + sw, sy + sh); ctx.lineTo(sx + seaW + sh * 0.1, sy + sh); ctx.quadraticCurveTo(sx + seaW - sh * 0.02, gy + sh * 0.2, sx + seaW - sh * 0.04, gy); ctx.fill();
        /* apă: secțiune prin mare, lumina scade cu adâncimea */
        const wt = gy - sh * 0.02;
        const wg = ctx.createLinearGradient(0, wt, 0, sy + sh); wg.addColorStop(0, idx === 0 ? '#3a7a8a' : '#3a8cc0'); wg.addColorStop(1, '#0c2c58');
        ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(sx, wt);
        for (let x = 0; x <= seaW; x += 8) ctx.lineTo(sx + x, wt + Math.sin(x * 0.045 + t * 1.2) * 1.6);
        ctx.lineTo(sx + seaW - sh * 0.04 + 2, wt); ctx.quadraticCurveTo(sx + seaW - sh * 0.02, gy + sh * 0.2, sx + seaW + sh * 0.1, sy + sh); ctx.lineTo(sx, sy + sh); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(230,246,255,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let x = 0; x <= seaW - sh * 0.04; x += 8) ctx.lineTo(sx + x, wt + Math.sin(x * 0.045 + t * 1.2) * 1.6); ctx.stroke();
        /* fundul mării */
        const fb = sy + sh - sh * 0.07;
        ctx.fillStyle = idx === 0 ? '#5a4a3e' : '#6a5a44'; ctx.beginPath(); ctx.moveTo(sx, sy + sh); ctx.lineTo(sx, fb);
        for (let i = 0; i <= 12; i++) { const u = i / 12; ctx.lineTo(sx + u * (seaW + sh * 0.06), fb + Math.sin(u * 9 + idx) * sh * 0.012 + u * u * sh * 0.03); }
        ctx.lineTo(sx + seaW + sh * 0.1, sy + sh); ctx.closePath(); ctx.fill();
        return fb;
      }
      function frame(dt, t) {
        if (play) { acc += dt; if (acc > 2.8) { acc = 0; if (idx < PER.length - 1) { idx++; sl.set(idx); } else { play = false; bP.innerHTML = '↺ De la început'; } } }
        if (idx !== lastIdx) build();
        fade = Math.min(1, fade + dt * 2.5);
        const P = PER[idx], W = api.freeW, U = api.unit, mid = (P.a + P.b) / 2;
        const fsz = Art.fs(U, 0.034, 13), hfs = Art.fs(U, 0.038, 13);
        const sx = 10, sw = W - 20, top = api.cy - U + 4, avail = 2 * U - 8;
        const LF = chipLayout(FLORA, sx, sw, fsz), LA = chipLayout(FAUNA, sx, sw, fsz);
        const chipsH = hfs * 1.6 + LF.rows * (LF.h + 6) + 8 + hfs * 1.6 + LA.rows * (LA.h + 6);
        const sh = clamp(avail - chipsH - 14, U * 0.7, Math.min(U * 1.5, 620)), sy = top;
        ctx.fillStyle = '#0a0f1a'; ctx.fillRect(0, 0, api.W, api.H);
        ctx.save(); Art.roundRectPath(ctx, sx, sy, sw, sh, 14); ctx.clip();
        const gy = sy + sh * 0.5, seaW = sw * 0.42;
        const fb = scene(P, sx, sy, sw, sh, gy, seaW, t);
        /* plante marine */
        for (const p of seaPlants) { const d = PL[p.k]; Creatures[d[0]](ctx, sx + seaW * p.x * 2.2, fb + sh * 0.02, sh * d[2] * 0.8, t, Object.assign({ seed: p.seed }, d[1])); }
        /* creaturi */
        const order = crits.slice().sort((a, b) => (a.hab === 'land' && b.hab === 'land') ? a.y - b.y : 0);
        for (const c of order) {
          const spc = SPEC[c.k], hab = c.hab, size = sh * spc[2] * (hab === 'sea' || hab === 'floor' ? 1.1 : 1);
          const hw = size * 0.55 / sw, lo = (hab === 'land' ? 0.46 : 0.0) + hw, hi = (hab === 'land' || hab === 'air' ? 1 : 0.4) - hw;
          if (c.pause > 0) { c.pause -= dt; c.go = Art.damp(c.go, 0, 4, dt); } else { c.go = Art.damp(c.go, 1, 3, dt); if (Math.random() < dt * 0.06 && hab !== 'air') c.pause = 1 + Math.random() * 2; }
          const pxSpeed = size * 0.45 * c.sp * c.go * Math.min(1, Math.abs(c.face) * 1.4);
          c.x += c.dir * pxSpeed * dt / sw;
          if (c.x > hi) { c.x = hi; c.dir = -1; } if (c.x < lo) { c.x = lo; c.dir = 1; }
          c.face = Art.damp(c.face, c.dir, 4, dt);
          c.ph += pxSpeed * dt / (size * 0.2) * Math.PI;
          const px = sx + sw * c.x; let py;
          if (hab === 'sea') py = gy + sh * 0.06 + (fb - gy - sh * 0.16) * c.y + Math.sin(t * 0.6 + c.seed) * sh * 0.015;
          else if (hab === 'floor') py = fb + sh * 0.005;
          else if (hab === 'air') py = sy + sh * 0.12 + sh * 0.22 * c.y + Math.sin(t * 0.9 + c.seed) * sh * 0.02;
          else py = gy + (sy + sh - gy) * (0.25 + c.y * 0.6);
          const sc = hab === 'land' ? 0.82 + c.y * 0.22 : 1;
          const o = Object.assign({ face: c.face, seed: c.seed, speed: c.go, alpha: fade }, spc[1]);
          if (hab === 'land') { o.ph = c.ph; o.moving = c.go > 0.2; Art.groundShadow(ctx, px, py, size * sc * 0.4, size * sc * 0.07, 0.25); }
          Creatures[spc[0]](ctx, px, py, size * sc, t, o);
        }
        /* plante pe uscat (cele din față, după animale din spate) */
        for (const p of plants) { const d = PL[p.k], py = p.back ? gy + sh * 0.03 : sy + sh - sh * 0.02; Creatures[d[0]](ctx, sx + sw * p.x, py, sh * d[2] * (p.back ? 0.85 : 0.75), t, Object.assign({ seed: p.seed, alpha: fade }, d[1])); }
        ctx.restore();
        /* contur fin al scenei */
        Art.roundRectPath(ctx, sx, sy, sw, sh, 14); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke();
        /* eticheta perioadei */
        const lfs = Art.fs(U, 0.04, 13);
        const lb = Art.label(ctx, P.n + ' · ' + fmt(P.a, P.a < 10 ? 1 : 0) + '–' + fmt(P.b, P.b < 10 ? 1 : 0) + ' mil. ani', sx + 10, sy + 10 + lfs, { size: lfs, align: 'left', bg: 'rgba(10,15,35,0.72)' });
        if (P.ev) {
          let s = noEmoji(P.ev); const maxW = sw - 24; ctx.font = Art.font(lfs * 0.92, 700);
          while (ctx.measureText(s).width + lfs * 2 > maxW && s.length > 12) s = s.slice(0, -2);
          if (s !== noEmoji(P.ev)) s = s.trim() + '…';
          Art.label(ctx, s, sx + 10, lb.y + lb.h + 6 + lfs * 0.9, { size: lfs * 0.92, align: 'left', bg: 'rgba(150,32,40,0.85)', border: 'rgba(255,160,160,0.4)' });
        }
        /* grupe de viețuitoare: devin „aprinse” când au apărut */
        let y = sy + sh + 12 + hfs * 0.7;
        heading(sx, y, 'Flora apărută până acum', '#7dffb0', hfs, true);
        y += hfs * 0.9; drawChips(LF, y, mid, '#5ee08f', fsz); y += LF.rows * (LF.h + 6) + 8 + hfs * 0.7;
        heading(sx, y, 'Fauna apărută până acum', '#ffd166', hfs, false);
        y += hfs * 0.9; drawChips(LA, y, mid, '#ffc04a', fsz);
        info.innerHTML = '<b>' + P.n + '</b> · ' + fmt(P.a - P.b, 0) + ' mil. ani de durată · era <b>' + P.era + '</b>';
      }
      return { frame: frame };
    }
  });
})();
