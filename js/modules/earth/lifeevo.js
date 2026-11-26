/* Modul: Evoluția faunei și a florei — scenă în secțiune: apa și uscatul sunt la același nivel */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const SZ = { microbe: 38, jelly: 54, ediacara: 70, trilobite: 70, anomalo: 100, nautiloid: 96, ammonite: 66, coral: 60, shell: 40, eurypterid: 118, ostraco: 80, placoderm: 128, shark: 120, fish: 62, ichthyo: 112, whale: 170, dolphin: 96, turtle: 76, squid: 100, stromatolite: 56, algae: 70, tetrapod: 84, arthropleura: 120, amphibian: 96, earlyrep: 74, dimetrodon: 112, coelo: 96, sauropod: 200, trex: 165, trice: 130, shrew: 40, horse: 120, ape: 80, giraffe: 130, elephant: 120, mammoth: 130, smilodon: 110, deer: 90, human: 76, meganeura: 90, pterosaur: 120, archaeo: 70, bird: 50, bat: 54, eagle: 90, moss: 46, cooksonia: 40, fern: 70, lepido: 120, horsetail: 70, cycad: 80, conifer: 105, flower: 70, grass: 56, oak: 120, palm: 120 };
  const PER = [
    { n: 'Precambrian', a: 4600, b: 541, era: 'Precambrian', sea: ['microbe', 'ediacara', 'jelly'], bed: ['stromatolite'], land: [], air: [], pl: [], top: '#4a3a52', f: 'Doar viețuitoare simple: bacterii și, spre final, creaturi moi, ca niște frunze plate (Ediacara). Nu există încă animale cu oase sau cochilii.', fl: 'Alge și bacterii albastre-verzui în oceane (stromatolitele). Ele produc oxigenul din aer. Uscatul e gol, doar rocă.' },
    { n: 'Cambrian', a: 541, b: 485, era: 'Paleozoic', sea: ['trilobite', 'anomalo', 'ediacara'], bed: ['coral', 'shell'], land: [], air: [], pl: [], top: '#35567a', f: 'Explozia cambriană: apar aproape toate marile grupe de animale, cu cochilii și schelete: trilobiți, crustacee, viermi, și prădătorul Anomalocaris.', fl: 'Alge marine. Uscatul rămâne fără plante.' },
    { n: 'Ordovician', a: 485, b: 444, era: 'Paleozoic', sea: ['nautiloid', 'trilobite', 'eurypterid'], bed: ['coral', 'shell'], land: [], air: [], pl: ['moss'], top: '#35567a', f: 'Mări pline de viață: scoici, corali, cefalopode uriașe cu cochilie dreaptă. Apar primii pești fără fălci. Se termină cu o extincție în masă.', fl: 'Primele plante mici, ca mușchii, ies pe uscat.', ev: '☠️ Extincție în masă (445 mil. ani): ~85% din specii' },
    { n: 'Silurian', a: 444, b: 419, era: 'Paleozoic', sea: ['ostraco', 'eurypterid', 'nautiloid'], bed: ['coral', 'shell'], land: [], air: [], pl: ['moss', 'cooksonia'], top: '#3f6890', f: 'Apar peștii cu fălci, iar „scorpionii de mare” (euripteridele) ajung la 2 m. Primele artropode ies pe uscat.', fl: 'Primele plante cu „vase” care duc apa (Cooksonia): mici, fără frunze.' },
    { n: 'Devonian', a: 419, b: 359, era: 'Paleozoic', sea: ['placoderm', 'fish', 'ostraco'], bed: ['coral'], land: ['tetrapod'], air: [], pl: ['cooksonia', 'fern', 'horsetail'], top: '#4a78a0', f: '„Epoca peștilor”: peștii cu plăci osoase (Dunkleosteus) domină mările. Unii pești cu înotătoare puternice ies pe uscat și devin primii tetrapozi.', fl: 'Apar primele păduri, cu ferigi mari și coada-calului. Plantele schimbă clima și aerul.', ev: '☠️ Extincție în masă (372 mil. ani): ~75% din specii' },
    { n: 'Carbonifer', a: 359, b: 299, era: 'Paleozoic', sea: ['shark', 'fish'], bed: ['coral'], land: ['amphibian', 'earlyrep', 'arthropleura'], air: ['meganeura'], pl: ['lepido', 'fern', 'horsetail'], top: '#5a88a8', f: 'Insecte uriașe (libelula Meganeura avea aripi de ~70 cm), miriapode de 2 m și amfibieni mari. Apar primele reptile, care fac ouă pe uscat.', fl: 'Păduri imense de licopode cu scoarță solzoasă și ferigi. Din ele s-a format cărbunele de azi.' },
    { n: 'Permian', a: 299, b: 252, era: 'Paleozoic', sea: ['shark', 'fish'], bed: ['coral'], land: ['dimetrodon', 'earlyrep', 'amphibian'], air: [], pl: ['conifer', 'fern', 'horsetail'], top: '#7a9ab0', f: 'Domnesc reptilele cu aspect de mamifere (sinapsidele), ca Dimetrodon cu „pânza” pe spate (care nu e un dinozaur!).', fl: 'Conifere (brazi) peste tot; clima se usucă.', ev: '☠️ Marea Moarte (252 mil. ani): ~90% din specii marine' },
    { n: 'Triasic', a: 252, b: 201, era: 'Mesozoic', sea: ['ichthyo', 'fish', 'shark'], bed: ['coral'], land: ['coelo', 'shrew', 'earlyrep'], air: ['pterosaur'], pl: ['conifer', 'cycad', 'fern'], top: '#6a9ac0', f: 'Apar primii dinozauri (mici, bipezi), primele mamifere (cât un șoarece) și pterozaurii. În mări trăiesc ihtiozauri.', fl: 'Conifere, cicade și ferigi.', ev: '☠️ Extincție în masă (201 mil. ani): ~75% din specii' },
    { n: 'Jurasic', a: 201, b: 145, era: 'Mesozoic', sea: ['ichthyo', 'shark', 'ammonite'], bed: ['coral'], land: ['sauropod', 'coelo', 'shrew'], air: ['archaeo', 'pterosaur'], pl: ['conifer', 'cycad', 'fern', 'horsetail'], top: '#5aa0d0', f: 'Epoca dinozaurilor uriași: sauropode cât clădirile. Apar primele păsări (Archaeopteryx) din dinozauri cu pene.', fl: 'Păduri de conifere, cicade și ferigi, fără flori.' },
    { n: 'Cretacic', a: 145, b: 66, era: 'Mesozoic', sea: ['ichthyo', 'ammonite', 'shark'], bed: ['coral'], land: ['trex', 'trice', 'shrew'], air: ['pterosaur', 'bird'], pl: ['flower', 'conifer', 'fern', 'cycad'], top: '#4a9ad8', f: 'T. rex și Triceratops. Mamifere mici trăiesc la umbra dinozaurilor, iar păsările se înmulțesc.', fl: 'Apar florile! Plantele cu flori (angiospermele) se răspândesc, iar odată cu ele albinele și fluturii.', ev: '☄️ Asteroid (66 mil. ani): dispar dinozaurii neaviari, ~76% din specii' },
    { n: 'Paleogen', a: 66, b: 23, era: 'Cenozoic', sea: ['whale', 'shark', 'fish'], bed: ['coral'], land: ['horse', 'shrew', 'deer'], air: ['bat', 'bird'], pl: ['palm', 'oak', 'flower', 'fern'], top: '#4aa0e0', f: 'Mamiferele explodează în varietate: apar balenele, caii mici, liliecii, primatele. După dinozauri, mamiferele ocupă locul lor.', fl: 'Păduri tropicale întinse și flori peste tot.' },
    { n: 'Neogen', a: 23, b: 2.6, era: 'Cenozoic', sea: ['whale', 'dolphin', 'shark'], bed: ['coral'], land: ['giraffe', 'elephant', 'ape', 'horse'], air: ['eagle'], pl: ['grass', 'oak', 'palm'], top: '#4aa8e8', f: 'Maimuțe mari. Apar primii strămoși ai omului în Africa. Se văd animale de savană: girafe, elefanți, cai.', fl: 'Se întind <b>ierburile</b> și savanele — de aici cerealele de azi: grâul, porumbul.' },
    { n: 'Cuaternar', a: 2.6, b: 0, era: 'Cenozoic', sea: ['whale', 'dolphin', 'turtle'], bed: ['coral'], land: ['mammoth', 'smilodon', 'deer', 'human'], air: ['eagle'], pl: ['grass', 'oak', 'conifer'], top: '#6ab0e8', f: 'Epoca glaciară: mamuți și tigri cu colți de sabie. Apare omul și își schimbă lumea. Multe animale mari dispar.', fl: 'Ghețarii înaintează și se retrag. Omul începe să cultive plante și schimbă flora.' }
  ];
  const FLORA = [['Alge', 3000], ['Mușchi (uscat)', 470], ['Ferigi', 430], ['Primele păduri', 385], ['Conifere', 320], ['Plante cu flori', 130], ['Ierburi', 55]];
  const FAUNA = [['Animale marine', 575], ['Pești', 500], ['Amfibieni', 370], ['Reptile', 320], ['Dinozauri', 230], ['Mamifere', 210], ['Păsări', 150], ['Primate', 65], ['Oameni', 0.3]];
  defineModule({
    id: 'lifeevo', title: 'Fauna și flora în timp', sub: 'Cum s-au schimbat animalele și plantele pe Pământ',
    start: function (api) {
      const ctx = api.ctx;
      let idx = 1, play = false, acc = 0, crits = [], plants = [], bed = [], lastIdx = -1;
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Perioada', min: 0, max: PER.length - 1, step: 1, value: idx, fmt: (v) => PER[v].n, onInput: (v) => { idx = v; play = false; bP.innerHTML = '▶ Derulează'; } });
      const bP = api.button(r1, '▶ Derulează', () => { play = !play; if (play && idx >= PER.length - 1) idx = 0; bP.innerHTML = play ? '⏸ Pauză' : '▶ Derulează'; });
      const info = document.createElement('div'); info.className = 'mod-readout'; r1.appendChild(info);
      api.say('Trage de glisor prin <b>perioadele geologice</b> și vezi cum se schimbă animalele (fauna) și plantele (flora). Dedesubt apar grupele de viețuitoare care au apărut deja. Atenție la <b>extincțiile în masă</b> ☠️! Atinge un animal ca să-i afli numele.', 15000);
      const NAMES = { microbe: 'Bacterii', jelly: 'Meduză', ediacara: 'Dickinsonia (Ediacara)', trilobite: 'Trilobit', anomalo: 'Anomalocaris', nautiloid: 'Nautiloid cu cochilie dreaptă', ammonite: 'Amonit', coral: 'Corali', shell: 'Brahiopod (scoică)', eurypterid: 'Euripterid („scorpion de mare”)', ostraco: 'Pește fără fălci (ostracoderm)', placoderm: 'Dunkleosteus (pește cu plăci)', shark: 'Rechin', fish: 'Pește cu înotătoare osoase', ichthyo: 'Ihtiozaur', whale: 'Balenă', dolphin: 'Delfin', turtle: 'Țestoasă de mare', stromatolite: 'Stromatolit (colonie de alge)', algae: 'Alge', tetrapod: 'Tetrapod timpuriu (Ichthyostega)', arthropleura: 'Arthropleura (miriapod uriaș)', amphibian: 'Amfibian mare (Eryops)', earlyrep: 'Reptilă timpurie (Hylonomus)', dimetrodon: 'Dimetrodon', coelo: 'Dinozaur timpuriu (Coelophysis)', sauropod: 'Sauropod (Brachiosaurus)', trex: 'Tyrannosaurus rex', trice: 'Triceratops', shrew: 'Mamifer timpuriu', horse: 'Cal', ape: 'Maimuță mare', giraffe: 'Girafă', elephant: 'Elefant', mammoth: 'Mamut', smilodon: 'Smilodon (tigru cu colți de sabie)', deer: 'Cerb', human: 'Om', meganeura: 'Meganeura (libelulă uriașă)', pterosaur: 'Pterozaur (Pteranodon)', archaeo: 'Archaeopteryx', bird: 'Pasăre', bat: 'Liliac', eagle: 'Vultur', moss: 'Mușchi', cooksonia: 'Cooksonia', fern: 'Ferigă', lepido: 'Lepidodendron (licopod arborescent)', horsetail: 'Coada-calului', cycad: 'Cicadă', conifer: 'Conifer', flower: 'Plantă cu flori', grass: 'Iarbă', oak: 'Stejar', palm: 'Palmier' };
      let geo = null;
      function scene() { const W = api.freeW, U = api.unit, top = api.cy - U + 2, sceneH = Math.min(U * 1.25, 330), sx = 10, sw = W - 20, sy = top + 4, wl = sy + sceneH * 0.6, shore = sx + sw * 0.38; return { sx: sx, sw: sw, sy: sy, sh: sceneH, wl: wl, shore: shore, bot: sy + sceneH, unit: sceneH / 520 }; }
      const bedY = (g, x) => { const u = clamp((x - g.sx) / (g.shore - g.sx), 0, 1); return lerp(g.bot - 12, g.wl + 6, Math.pow(u, 2.2)); };
      function build() {
        const P = PER[idx], g = scene(); geo = g;
        const mk = (list, hab, n, lo, hi) => list.length ? Array.from({ length: n }, (_, i) => ({ k: list[i % list.length], slot: lo + (hi - lo) * (i + 0.5) / n, amp: (hi - lo) / n * 0.32, sp: 0.35 + Math.random() * 0.3, y: (i * 0.37 + 0.15) % 1, hab: hab, ph: Math.random() * 6 })) : [];
        crits = [].concat(mk(P.sea, 'sea', Math.min(P.sea.length + 1, 4), 0.07, 0.33), mk(P.land, 'land', Math.min(P.land.length + 1, 4), 0.5, 0.95), mk(P.air, 'air', Math.min(P.air.length + 1, 3), 0.1, 0.95));
        plants = P.pl.length ? Array.from({ length: 12 }, (_, i) => ({ k: P.pl[i % P.pl.length], x: 0.46 + 0.52 * ((i * 0.381) % 1), s: 1 })) : [];
        bed = P.bed.length ? Array.from({ length: 7 }, (_, i) => ({ k: P.bed[i % P.bed.length], x: 0.04 + 0.34 * ((i * 0.618) % 1) })) : [];
        if (P.n === 'Precambrian' || P.n === 'Cambrian') bed.push({ k: 'algae', x: 0.1 }, { k: 'algae', x: 0.22 }, { k: 'algae', x: 0.3 });
        lastIdx = idx; api.say('<b>' + P.n + '</b> (' + fmt(P.a, P.a < 10 ? 1 : 0) + ' – ' + fmt(P.b, P.b < 10 ? 1 : 0) + ' mil. ani în urmă · era ' + P.era + '). <b>Faună:</b> ' + P.f + ' <b>Floră:</b> ' + P.fl + (P.ev ? ' <b>' + P.ev + '</b>' : ''), 22000);
      }
      api.pointer({ down: (px, py) => { if (!geo) return; let best = null, bd = 44; const g = geo, all = crits.concat(plants.map((p) => ({ k: p.k, hab: 'plant', px: g.sx + g.sw * p.x, py: g.wl - 30 })), bed.map((p) => ({ k: p.k, hab: 'bed', px: g.sx + g.sw * p.x, py: bedY(g, g.sx + g.sw * p.x) - 20 }))); all.forEach((c) => { const x = c.px !== undefined ? c.px : c.sx, y = c.px !== undefined ? c.py : c.sy; if (x === undefined) return; const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = c; } }); if (best) api.say('👆 <b>' + (NAMES[best.k] || best.k) + '</b>', 5000); } });
      function chip(x, y, txt, on) { ctx.font = '600 10px system-ui,sans-serif'; const w = ctx.measureText(txt).width + 14; ctx.fillStyle = on ? 'rgba(120,230,150,0.28)' : 'rgba(255,255,255,0.06)'; ctx.strokeStyle = on ? '#7dffb0' : 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, 20, 10) : ctx.rect(x, y, w, 20); ctx.fill(); ctx.stroke(); ctx.fillStyle = on ? '#fff' : 'rgba(255,255,255,0.4)'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 7, y + 14); return w + 6; }
      function frame(dt, t) {
        if (play) { acc += dt; if (acc > 3) { acc = 0; if (idx < PER.length - 1) { idx++; sl.set(idx); } else { play = false; bP.innerHTML = '↺ De la început'; } } }
        if (idx !== lastIdx) build();
        const P = PER[idx], g = scene(); geo = g; const mid = (P.a + P.b) / 2, W = api.freeW, un = g.unit, barren = !P.pl.length;
        ctx.fillStyle = '#0a0f1a'; ctx.fillRect(0, 0, api.W, api.H);
        ctx.save(); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(g.sx, g.sy, g.sw, g.sh, 14) : ctx.rect(g.sx, g.sy, g.sw, g.sh); ctx.clip();
        /* cer */
        const sk = ctx.createLinearGradient(0, g.sy, 0, g.wl); sk.addColorStop(0, P.top); sk.addColorStop(1, '#dff0f8'); ctx.fillStyle = sk; ctx.fillRect(g.sx, g.sy, g.sw, g.sh);
        ctx.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 4; i++) { const cx = g.sx + ((t * 6 * (0.5 + i * 0.2) + i * 230) % (g.sw + 160)) - 80, cy = g.sy + 26 + i * 17; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(cx + k * 18, cy + (k % 2) * 4, 13 + (k % 3) * 4, 0, 6.3); ctx.fill(); } }
        /* munți îndepărtați, cu ceață */
        const mt = barren ? '#7a6a5a' : '#6a8aa8'; ctx.fillStyle = mt; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(g.shore - 20, g.wl); for (let x = g.shore - 20; x <= g.sx + g.sw + 20; x += 16) ctx.lineTo(x, g.wl - 22 * un * 2 - 20 * un * Math.sin((x) * 0.018) - 16 * un * Math.sin(x * 0.047)); ctx.lineTo(g.sx + g.sw + 20, g.wl); ctx.fill(); ctx.globalAlpha = 1;
        if (P.n === 'Precambrian' || P.n === 'Cambrian' || P.n === 'Ordovician') { /* vulcan în depărtare */ ctx.fillStyle = '#5a4a40'; ctx.beginPath(); ctx.moveTo(g.sx + g.sw * 0.82, g.wl); ctx.lineTo(g.sx + g.sw * 0.88, g.wl - 44 * un * 1.6); ctx.lineTo(g.sx + g.sw * 0.94, g.wl); ctx.fill(); ctx.fillStyle = 'rgba(255,120,40,0.8)'; ctx.beginPath(); ctx.arc(g.sx + g.sw * 0.88, g.wl - 70 * un * 1.6 + 26, 4, 0, 6.3); ctx.fill(); }
        /* pământul de dedesubt (același nivel cu apa; pe uscat urcă până la linia apei) */
        const soil = ctx.createLinearGradient(0, g.wl, 0, g.bot); soil.addColorStop(0, barren ? '#8a7a68' : '#5a8a3e'); soil.addColorStop(0.1, barren ? '#74644f' : '#6a5a3a'); soil.addColorStop(1, '#2e2418');
        ctx.fillStyle = soil; ctx.fillRect(g.sx, g.wl, g.sw, g.sh);
        ctx.fillStyle = barren ? '#9a8a76' : '#5a8a3e'; ctx.fillRect(g.shore + 30, g.wl - 2, g.sw, 6);
        /* mare: suprafața la aceeași linie wl ca uscatul */
        const sea = ctx.createLinearGradient(0, g.wl, 0, g.bot); sea.addColorStop(0, '#6ac0e0'); sea.addColorStop(0.3, '#2a7ab4'); sea.addColorStop(1, '#0e3258');
        ctx.fillStyle = sea; ctx.beginPath(); ctx.moveTo(g.sx, g.wl); for (let x = g.sx; x <= g.shore + 4; x += 6) ctx.lineTo(x, g.wl + Math.sin(x * 0.07 + t * 2) * 1.4); for (let x = g.shore + 4; x >= g.sx; x -= 8) ctx.lineTo(x, bedY(g, x)); ctx.closePath(); ctx.fill();
        /* fundul mării: nisip, până la plajă */
        ctx.fillStyle = '#c4b088'; ctx.beginPath(); ctx.moveTo(g.sx, bedY(g, g.sx)); for (let x = g.sx; x <= g.shore + 30; x += 8) ctx.lineTo(x, bedY(g, x)); ctx.lineTo(g.shore + 30, g.wl + 1); ctx.lineTo(g.shore + 34, g.wl + 14); for (let x = g.shore + 30; x >= g.sx; x -= 8) ctx.lineTo(x, bedY(g, x) + 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(g.sx + 30 + i * 80, g.wl); ctx.lineTo(g.sx + 62 + i * 80, g.wl); ctx.lineTo(g.sx + 80 + i * 80, bedY(g, g.sx + 80 + i * 80)); ctx.lineTo(g.sx + 20 + i * 80, bedY(g, g.sx + 20 + i * 80)); ctx.fill(); }
        /* spumă la țărm */
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(g.shore - 6, g.wl + 10 + Math.sin(t * 2) * 1.5); ctx.quadraticCurveTo(g.shore + 6, g.wl + 4, g.shore + 24, g.wl); ctx.stroke();
        /* plante pe uscat și pe fundul mării */
        const dr = (k, x, y, s, d) => window.Creatures.draw(ctx, k, x, y, (SZ[k] || 80) * un * (s || 1), d || 1, t);
        bed.forEach((b) => { const x = g.sx + g.sw * b.x; dr(b.k, x, bedY(g, x) + 3, 1); });
        plants.slice().sort((a, b) => a.x - b.x).forEach((p) => dr(p.k, g.sx + g.sw * p.x, g.wl + 4, 1));
        /* animale */
        crits.forEach((c) => {
          const ang = t * c.sp + c.ph, off = Math.sin(ang) * c.amp, dir = Math.cos(ang) >= 0 ? 1 : -1, px = g.sx + g.sw * (c.slot + off);
          let py;
          if (c.hab === 'sea') { const top = g.wl + 18 * un * 1.6, bot = bedY(g, px) - 14; py = lerp(top, Math.max(top + 8, bot), c.y) + Math.sin(t * 1.4 + c.ph) * 3; }
          else if (c.hab === 'land') py = g.wl + 3;
          else py = g.sy + 30 + (g.wl - g.sy) * 0.22 * c.y + Math.sin(t * 1.2 + c.ph) * 7;
          c.sx = px; c.sy = c.hab === 'land' ? py - 34 * un * 1.6 : py; dr(c.k, px, py, 1, dir);
        });
        ctx.restore();
        ctx.fillStyle = 'rgba(8,14,34,0.82)'; ctx.fillRect(g.sx + 8, g.sy + 8, 190, 22); ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(P.n + ' · ' + fmt(P.a, P.a < 10 ? 1 : 0) + '–' + fmt(P.b, P.b < 10 ? 1 : 0) + ' mil. ani', g.sx + 14, g.sy + 23);
        if (P.ev) { ctx.fillStyle = 'rgba(180,40,40,0.88)'; ctx.fillRect(g.sx + 8, g.sy + 34, Math.min(g.sw - 16, 340), 22); ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.fillText(P.ev.length > 52 && g.sw < 380 ? P.ev.slice(0, 50) + '…' : P.ev, g.sx + 14, g.sy + 49); }
        /* grupe de viețuitoare */
        let cy2 = g.sy + g.sh + 14;
        ctx.fillStyle = '#7dffb0'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('🌿 Flora apărută până acum', g.sx, cy2 + 4);
        let cx = g.sx; cy2 += 10; FLORA.forEach(([n, a]) => { ctx.font = '600 10px system-ui,sans-serif'; const w = ctx.measureText(n).width + 20; if (cx + w > g.sx + g.sw) { cx = g.sx; cy2 += 24; } cx += chip(cx, cy2, n, a >= mid); });
        cy2 += 40; ctx.fillStyle = '#ffd166'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('🐾 Fauna apărută până acum', g.sx, cy2 - 8);
        cx = g.sx; FAUNA.forEach(([n, a]) => { ctx.font = '600 10px system-ui,sans-serif'; const w = ctx.measureText(n).width + 20; if (cx + w > g.sx + g.sw) { cx = g.sx; cy2 += 24; } cx += chip(cx, cy2, n, a >= mid); });
        info.innerHTML = '<b>' + P.n + '</b> · ' + fmt(P.a - P.b, 0) + ' mil. ani de durată · era <b>' + P.era + '</b>';
      }
      return { frame: frame };
    }
  });
})();
