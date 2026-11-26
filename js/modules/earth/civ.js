/* Modul: Evoluția civilizației */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const NOW = 2025, MAXA = 12100;
  const xOf = (year) => 1 - Math.sqrt(Math.max(NOW - year, 0) / MAXA);
  const yearOf = (x) => Math.round(NOW - Math.pow(1 - x, 2) * MAXA);
  const yTxt = (y) => y < 0 ? Math.abs(y) + ' î.Hr.' : y > 0 ? y + ' d.Hr.' : 'anul 0';
  const PER = [['Vânători-culegători', -12100, -10000, '#6a5a3a'], ['Neolitic', -10000, -3300, '#5a8a4a'], ['Epoca bronzului', -3300, -1200, '#b8803a'], ['Fierul și Antichitatea', -1200, 476, '#8a6aa0'], ['Evul Mediu', 476, 1492, '#6a7a9a'], ['Epoca modernă', 1492, 1760, '#4a8ab0'], ['Industrial', 1760, 1900, '#8a8a8a'], ['Azi', 1900, 2025, '#e0c040']];
  const POP = [[-10000, 4e6], [-5000, 5e6], [-3000, 14e6], [-1000, 50e6], [0, 200e6], [1000, 300e6], [1500, 460e6], [1800, 1.0e9], [1900, 1.6e9], [1950, 2.5e9], [2000, 6.1e9], [2025, 8.1e9]];
  const popAt = (y) => { if (y <= POP[0][0]) return POP[0][1]; for (let i = 1; i < POP.length; i++) if (y <= POP[i][0]) { const f = (y - POP[i - 1][0]) / (POP[i][0] - POP[i - 1][0]); return Math.exp(lerp(Math.log(POP[i - 1][1]), Math.log(POP[i][1]), f)); } return POP[POP.length - 1][1]; };
  const popTxt = (p) => p >= 1e9 ? fmt(p / 1e9, 1) + ' miliarde' : p >= 1e6 ? fmt(p / 1e6, p < 1e7 ? 1 : 0) + ' milioane' : fmt(p / 1e3, 0) + ' mii';
  const M = [
    { y: -9500, e: '🛕', n: 'Göbekli Tepe', t: 'Cel mai vechi templu cunoscut, în Turcia de azi: pietre uriașe sculptate, ridicate de vânători-culegători, înainte de agricultură!' },
    { y: -9000, e: '🌾', n: 'Agricultura', t: 'Oamenii încep să cultive grâu și orz și să crească oi și capre. Nu mai trebuie să se mute după hrană: se așază în sate. Începe Neoliticul.' },
    { y: -7000, e: '🏘️', n: 'Primele orașe', t: 'La Çatalhöyük, în Turcia, trăiau mii de oameni în case lipite una de alta, intrate prin acoperiș.' },
    { y: -5500, e: '🏺', n: 'Cultura Cucuteni', t: 'Pe teritoriul României, Moldovei și Ucrainei apare cultura Cucuteni: sate foarte mari (unele cu mii de locuitori) și ceramică pictată în spirale roșii și negre. Printre cele mai vechi „orașe” din Europa!' },
    { y: -5000, e: '🔶', n: 'Metalul: cuprul', t: 'Oamenii învață să topească cuprul și aurul. În Balcani s-au găsit unele dintre cele mai vechi obiecte de aur din lume (Varna, ~4600 î.Hr.).' },
    { y: -3500, e: '🛞', n: 'Roata', t: 'Apare roata (la început la olărit și apoi la căruțe), iar în Sumer, în Mesopotamia, se ridică primele orașe-stat, ca Uruk.' },
    { y: -3300, e: '🥉', n: 'Epoca bronzului', t: 'Cuprul amestecat cu staniu dă bronzul, mai tare. Cu bronz se fac arme, unelte și bijuterii; apar regate și comerț la distanțe mari.' },
    { y: -3200, e: '✍️', n: 'Scrierea', t: 'Sumerienii scriu pe tăblițe de lut cu semne în formă de pană (cuneiform). Cu scrierea, oamenii pot păstra legi, socoteli și povești.' },
    { y: -3100, e: '🔺', n: 'Egiptul Antic', t: 'Valea Nilului e unificată sub un faraon. Peste ~500 de ani se ridică Marea Piramidă din Giza (~2560 î.Hr.), construită cu mii de lucrători.' },
    { y: -1200, e: '⚒️', n: 'Epoca fierului', t: 'Fierul, mai ieftin și mai rezistent decât bronzul, schimbă uneltele și armele. Plugurile de fier fac recoltele mai bogate.' },
    { y: -508, e: '🏛️', n: 'Democrația în Atena', t: 'Cetățenii Atenei încep să voteze legile ei înșiși. Grecii pun bazele filosofiei, matematicii și teatrului.' },
    { y: -221, e: '🏯', n: 'China unificată', t: 'Primul împărat unește China și începe construirea Marelui Zid. Chinezii inventează mătasea, busola și mai târziu hârtia.' },
    { y: -82, e: '⛰️', n: 'Regatul dac', t: 'Burebista unește triburile dacilor într-un regat puternic, cu centrul în Munții Orăștiei. Cetățile dacice (Sarmizegetusa) sunt astăzi pe lista UNESCO.' },
    { y: -27, e: '🦅', n: 'Imperiul Roman', t: 'Roma devine imperiu și construiește drumuri, apeducte și orașe în toată Europa. Latina e limba din care se naște și româna.' },
    { y: 106, e: '🇷🇴', n: 'Dacia romană', t: 'Împăratul Traian cucerește Dacia după războaiele cu Decebal. Dacii și romanii se amestecă: aici începe poporul român, iar Columna lui Traian din Roma povestește războiul.' },
    { y: 105, e: '📜', n: 'Hârtia', t: 'În China, Cai Lun perfecționează hârtia. Ea ajunge mai târziu în lumea întreagă și face cărțile mai ieftine.' },
    { y: 476, e: '🏰', n: 'Evul Mediu', t: 'Cade Imperiul Roman de Apus. Încep castelele, cavalerii, mănăstirile și universitățile; în Orient înfloresc Bizanțul și lumea arabă (cu matematică, medicină și astronomie).' },
    { y: 1450, e: '📚', n: 'Tiparul', t: 'Gutenberg inventează tiparul cu litere mobile. Cărțile se produc repede și ideile se răspândesc mai ușor: începe Renașterea.' },
    { y: 1492, e: '⛵', n: 'Marile descoperiri', t: 'Corăbiile traversează oceanele: Columb ajunge în America, iar în anii următori se leagă toate continentele. Începe epoca modernă.' },
    { y: 1609, e: '🔭', n: 'Telescopul', t: 'Galileo îndreaptă telescopul spre cer și vede lunile lui Jupiter. Știința modernă începe să verifice totul prin experimente.' },
    { y: 1769, e: '🏭', n: 'Revoluția industrială', t: 'Mașina cu abur (James Watt) pune în mișcare fabrici și locomotive. Orașele cresc, iar oamenii călătoresc și produc mult mai repede.' },
    { y: 1876, e: '☎️', n: 'Telefonul', t: 'Alexander Graham Bell inventează telefonul; oamenii pot vorbi la distanță. Peste doar câțiva ani, Edison face becul electric practic (1879).' },
    { y: 1903, e: '✈️', n: 'Avionul', t: 'Frații Wright zboară 12 secunde cu primul avion cu motor. În mai puțin de 70 de ani, omul ajunge pe Lună.' },
    { y: 1928, e: '💊', n: 'Penicilina', t: 'Alexander Fleming descoperă penicilina, primul antibiotic. Medicina salvează milioane de vieți și oamenii trăiesc mult mai mult.' },
    { y: 1969, e: '🌕', n: 'Omul pe Lună', t: 'Misiunea Apollo 11: Neil Armstrong și Buzz Aldrin merg pe Lună. În același an apare ARPANET, strămoșul internetului.' },
    { y: 1991, e: '🌐', n: 'World Wide Web', t: 'Pânza mondială (www) devine publică. Informația ajunge la distanță de un click, iar internetul leagă oamenii din toată lumea.' },
    { y: 2007, e: '📱', n: 'Smartphone-ul', t: 'Telefonul devine un calculator de buzunar, cu cameră, hartă și internet. Astăzi miliarde de oameni au unul.' },
    { y: 2022, e: '🤖', n: 'Inteligența artificială', t: 'Programele de inteligență artificială învață din cantități uriașe de date și pot scrie, desena sau traduce. O nouă schimbare mare în felul în care muncim și învățăm.' }
  ].sort((a, b) => a.y - b.y);
  defineModule({
    id: 'civ', title: 'Evoluția civilizației', sub: 'De la primele sate la internet',
    start: function (api) {
      const ctx = api.ctx;
      let x = 0.3, sel = -1, play = false;
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Anul', min: 0, max: 1, step: 0.001, value: x, fmt: () => yTxt(yearOf(x)), onInput: (v) => { x = v; play = false; bP.innerHTML = '▶ Derulează'; } });
      const bP = api.button(r1, '▶ Derulează', () => { play = !play; if (play && x > 0.995) x = 0; bP.innerHTML = play ? '⏸ Pauză' : '▶ Derulează'; });
      const r2 = api.row('Salt la');
      [['🌾 Agricultura', -9000], ['✍️ Scrierea', -3200], ['🏛️ Roma', -27], ['📚 Tiparul', 1450], ['🏭 Industrial', 1769], ['🌐 Internetul', 1991]].forEach(([t, y]) => api.button(r2, t, () => { x = xOf(y); sl.set(x); play = false; bP.innerHTML = '▶ Derulează'; }));
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Trage de glisor sau atinge o imagine pe axă: urmărești cum s-a schimbat viața oamenilor în ultimii 12.000 de ani, de la <b>primele sate</b> până la <b>internet</b>. Graficul arată câți oameni trăiau pe Pământ.', 15000);
      let lay = null;
      function layout() { const W = api.freeW, top = api.cy - api.unit + 2, free = api.unit * 2; lay = { W: W, top: top, x0: 14, w: W - 28, perY: top + 4, axY: top + Math.max(80, free * 0.36), popY: top + free * 0.5, popH: free * 0.34, free: free }; }
      function nearest() { let k = 0, bd = 1e9; M.forEach((m, i) => { const d = Math.abs(xOf(m.y) - x); if (d < bd) { bd = d; k = i; } }); return k; }
      api.pointer({ down: (px, py) => { if (!lay) layout(); let best = -1, bd = 26; M.forEach((m, i) => { const mx = lay.x0 + lay.w * xOf(m.y), my = lay.axY + ((i % 3) - 1) * 30, d = Math.hypot(px - mx, py - my); if (d < bd) { bd = d; best = i; } }); if (best >= 0) { sel = best; x = xOf(M[best].y); sl.set(x); play = false; bP.innerHTML = '▶ Derulează'; api.say(M[best].e + ' <b>' + M[best].n + '</b> (' + yTxt(M[best].y) + '). ' + M[best].t, 22000); } else if (py > lay.perY) { x = clamp((px - lay.x0) / lay.w, 0, 1); sl.set(x); play = false; } } });
      let lastN = -1;
      function frame(dt, t) {
        if (play) { x = Math.min(1, x + dt * 0.03); sl.set(x); if (x >= 1) { play = false; bP.innerHTML = '↺ De la început'; } }
        layout(); const L = lay;
        const g = ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, '#171220'); g.addColorStop(1, '#09070d'); ctx.fillStyle = g; ctx.fillRect(0, 0, api.W, api.H);
        const X = (y) => L.x0 + L.w * xOf(y), yr = yearOf(x);
        /* perioade */
        PER.forEach((p) => { const a = X(p[1]), b = X(p[2]); ctx.fillStyle = p[3]; ctx.fillRect(a, L.perY, Math.max(2, b - a - 1), 20); if (b - a > 54) { ctx.fillStyle = '#fff'; ctx.font = '600 9px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p[0], (a + b) / 2, L.perY + 13); } });
        const cur = PER.find((p) => yr >= p[1] && yr < p[2]) || PER[PER.length - 1];
        /* axa și reperele */
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L.x0, L.axY); ctx.lineTo(L.x0 + L.w, L.axY); ctx.stroke();
        const nr = nearest();
        M.forEach((m, i) => { const mx = X(m.y), my = L.axY + ((i % 3) - 1) * 30, on = i === nr, big = on ? 20 : 14; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mx, L.axY); ctx.lineTo(mx, my); ctx.stroke(); ctx.fillStyle = on ? 'rgba(255,214,102,0.9)' : 'rgba(40,36,56,0.9)'; ctx.beginPath(); ctx.arc(mx, my, big, 0, 7); ctx.fill(); ctx.strokeStyle = on ? '#fff' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = on ? 2 : 1; ctx.stroke(); ctx.font = (on ? 20 : 14) + 'px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(m.e, mx, my + 1); ctx.textBaseline = 'alphabetic'; });
        const cxp = L.x0 + L.w * x; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cxp, L.perY + 22); ctx.lineTo(cxp, L.popY + L.popH); ctx.stroke();
        /* evoluția populației */
        ctx.fillStyle = 'rgba(8,14,34,0.7)'; ctx.fillRect(L.x0, L.popY, L.w, L.popH);
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Câți oameni trăiesc pe Pământ', L.x0 + 6, L.popY + 12);
        ctx.fillStyle = 'rgba(120,200,255,0.5)'; ctx.beginPath(); ctx.moveTo(L.x0, L.popY + L.popH);
        for (let i = 0; i <= 120; i++) { const xx = i / 120, y = yearOf(xx), pp = popAt(y); ctx.lineTo(L.x0 + L.w * xx, L.popY + L.popH - L.popH * 0.85 * Math.pow(pp / 8.1e9, 0.55)); if (xx > x) break; }
        ctx.lineTo(cxp, L.popY + L.popH); ctx.closePath(); ctx.fill();
        const pn = popAt(yr);
        /* oameni (mici) = cât de mulți */
        const nPeople = clamp(Math.round(Math.pow(pn / 8.1e9, 0.4) * 60), 1, 60);
        ctx.fillStyle = '#9fd8ff'; for (let i = 0; i < nPeople; i++) { const px = L.x0 + 10 + ((i * 53.7) % (L.w - 20)), py = L.popY + L.popH - 6 - ((i * 31) % (L.popH * 0.5)); ctx.font = '10px system-ui'; ctx.fillText('•', px, py); }
        const n = M[nr]; if (nr !== lastN && !play) { lastN = nr; }
        ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '700 15px system-ui,sans-serif'; ctx.fillText((Math.abs(yearOf(x) - n.y) < 600 ? n.e + ' ' : '') + yTxt(yr), L.x0, L.popY + L.popH + 22);
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '600 11px system-ui,sans-serif'; ctx.fillText('În jur de ' + popTxt(pn) + ' de oameni pe Pământ · epoca: ' + cur[0], L.x0, L.popY + L.popH + 38);
        info.innerHTML = '<b>' + yTxt(yr) + '</b> · ' + cur[0] + ' · aproape: <b>' + n.e + ' ' + n.n + '</b> (' + yTxt(n.y) + ') · ~<b>' + popTxt(pn) + '</b> de oameni';
      }
      return { frame: frame };
    }
  });
})();
