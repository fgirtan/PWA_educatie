/* Modul: Evoluția civilizației — diorame ilustrate pe epoci, repere desenate pe axă, curba populației */
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
  /* e = emoji folosit doar în textele HTML; ic = desenul de pe axă */
  const M = [
    { y: -9500, e: '🛕', ic: 'gobekli', n: 'Göbekli Tepe', t: 'Cel mai vechi templu cunoscut, în Turcia de azi: pietre uriașe sculptate, ridicate de vânători-culegători, înainte de agricultură!' },
    { y: -9000, e: '🌾', ic: 'wheat', n: 'Agricultura', t: 'Oamenii încep să cultive grâu și orz și să crească oi și capre. Nu mai trebuie să se mute după hrană: se așază în sate. Începe Neoliticul.' },
    { y: -7000, e: '🏘️', ic: 'town', n: 'Primele orașe', t: 'La Çatalhöyük, în Turcia, trăiau mii de oameni în case lipite una de alta, intrate prin acoperiș.' },
    { y: -5500, e: '🏺', ic: 'pot', n: 'Cultura Cucuteni', t: 'Pe teritoriul României, Moldovei și Ucrainei apare cultura Cucuteni: sate foarte mari (unele cu mii de locuitori) și ceramică pictată în spirale roșii și negre. Printre cele mai vechi „orașe” din Europa!' },
    { y: -5000, e: '🔶', ic: 'copper', n: 'Metalul: cuprul', t: 'Oamenii învață să topească cuprul și aurul. În Balcani s-au găsit unele dintre cele mai vechi obiecte de aur din lume (Varna, ~4600 î.Hr.).' },
    { y: -3500, e: '🛞', ic: 'wheel', n: 'Roata', t: 'Apare roata (la început la olărit și apoi la căruțe), iar în Sumer, în Mesopotamia, se ridică primele orașe-stat, ca Uruk.' },
    { y: -3300, e: '🥉', ic: 'bronze', n: 'Epoca bronzului', t: 'Cuprul amestecat cu staniu dă bronzul, mai tare. Cu bronz se fac arme, unelte și bijuterii; apar regate și comerț la distanțe mari.' },
    { y: -3200, e: '✍️', ic: 'tablet', n: 'Scrierea', t: 'Sumerienii scriu pe tăblițe de lut cu semne în formă de pană (cuneiform). Cu scrierea, oamenii pot păstra legi, socoteli și povești.' },
    { y: -3100, e: '🔺', ic: 'pyramid', n: 'Egiptul Antic', t: 'Valea Nilului e unificată sub un faraon. Peste ~500 de ani se ridică Marea Piramidă din Giza (~2560 î.Hr.), construită cu mii de lucrători.' },
    { y: -1200, e: '⚒️', ic: 'iron', n: 'Epoca fierului', t: 'Fierul, mai ieftin și mai rezistent decât bronzul, schimbă uneltele și armele. Plugurile de fier fac recoltele mai bogate.' },
    { y: -508, e: '🏛️', ic: 'temple', n: 'Democrația în Atena', t: 'Cetățenii Atenei încep să voteze legile ei înșiși. Grecii pun bazele filosofiei, matematicii și teatrului.' },
    { y: -221, e: '🏯', ic: 'wall', n: 'China unificată', t: 'Primul împărat unește China și începe construirea Marelui Zid. Chinezii inventează mătasea, busola și mai târziu hârtia.' },
    { y: -82, e: '⛰️', ic: 'dacia', n: 'Regatul dac', t: 'Burebista unește triburile dacilor într-un regat puternic, cu centrul în Munții Orăștiei. Cetățile dacice (Sarmizegetusa) sunt astăzi pe lista UNESCO.' },
    { y: -27, e: '🦅', ic: 'aqueduct', n: 'Imperiul Roman', t: 'Roma devine imperiu și construiește drumuri, apeducte și orașe în toată Europa. Latina e limba din care se naște și româna.' },
    { y: 106, e: '🇷🇴', ic: 'column', n: 'Dacia romană', t: 'Împăratul Traian cucerește Dacia după războaiele cu Decebal. Dacii și romanii se amestecă: aici începe poporul român, iar Columna lui Traian din Roma povestește războiul.' },
    { y: 105, e: '📜', ic: 'scroll', n: 'Hârtia', t: 'În China, Cai Lun perfecționează hârtia. Ea ajunge mai târziu în lumea întreagă și face cărțile mai ieftine.' },
    { y: 476, e: '🏰', ic: 'castle', n: 'Evul Mediu', t: 'Cade Imperiul Roman de Apus. Încep castelele, cavalerii, mănăstirile și universitățile; în Orient înfloresc Bizanțul și lumea arabă (cu matematică, medicină și astronomie).' },
    { y: 1450, e: '📚', ic: 'book', n: 'Tiparul', t: 'Gutenberg inventează tiparul cu litere mobile. Cărțile se produc repede și ideile se răspândesc mai ușor: începe Renașterea.' },
    { y: 1492, e: '⛵', ic: 'ship', n: 'Marile descoperiri', t: 'Corăbiile traversează oceanele: Columb ajunge în America, iar în anii următori se leagă toate continentele. Începe epoca modernă.' },
    { y: 1609, e: '🔭', ic: 'telescope', n: 'Telescopul', t: 'Galileo îndreaptă telescopul spre cer și vede lunile lui Jupiter. Știința modernă începe să verifice totul prin experimente.' },
    { y: 1769, e: '🏭', ic: 'factory', n: 'Revoluția industrială', t: 'Mașina cu abur (James Watt) pune în mișcare fabrici și locomotive. Orașele cresc, iar oamenii călătoresc și produc mult mai repede.' },
    { y: 1876, e: '☎️', ic: 'phone', n: 'Telefonul', t: 'Alexander Graham Bell inventează telefonul; oamenii pot vorbi la distanță. Peste doar câțiva ani, Edison face becul electric practic (1879).' },
    { y: 1903, e: '✈️', ic: 'plane', n: 'Avionul', t: 'Frații Wright zboară 12 secunde cu primul avion cu motor. În mai puțin de 70 de ani, omul ajunge pe Lună.' },
    { y: 1928, e: '💊', ic: 'pill', n: 'Penicilina', t: 'Alexander Fleming descoperă penicilina, primul antibiotic. Medicina salvează milioane de vieți și oamenii trăiesc mult mai mult.' },
    { y: 1969, e: '🌕', ic: 'moon', n: 'Omul pe Lună', t: 'Misiunea Apollo 11: Neil Armstrong și Buzz Aldrin merg pe Lună. În același an apare ARPANET, strămoșul internetului.' },
    { y: 1991, e: '🌐', ic: 'web', n: 'World Wide Web', t: 'Pânza mondială (www) devine publică. Informația ajunge la distanță de un click, iar internetul leagă oamenii din toată lumea.' },
    { y: 2007, e: '📱', ic: 'smartphone', n: 'Smartphone-ul', t: 'Telefonul devine un calculator de buzunar, cu cameră, hartă și internet. Astăzi miliarde de oameni au unul.' },
    { y: 2022, e: '🤖', ic: 'ai', n: 'Inteligența artificială', t: 'Programele de inteligență artificială învață din cantități uriașe de date și pot scrie, desena sau traduce. O nouă schimbare mare în felul în care muncim și învățăm.' }
  ].sort((a, b) => a.y - b.y);

  /* ================= ajutoare de desen ================= */
  const S = Art.shade;
  function poly(c, pts, close) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); if (close !== false) c.closePath(); }
  let lastFill = '#888888';
  function fillV(c, col, x0, y0, x1, y1, hi, lo) { lastFill = col; const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, S(col, hi === undefined ? 0.14 : hi)); g.addColorStop(1, S(col, -(lo === undefined ? 0.22 : lo))); c.fillStyle = g; c.fill(); }
  function edge(c, col, w) { c.strokeStyle = w ? (col || Art.ink(lastFill)) : Art.ink(lastFill); c.lineWidth = w || LWC; c.stroke(); }
  function box(c, x, y, w, h, col, sideW) {          /* cutie cu fața luminată și o latură în umbră (perspectivă simplă) */
    c.fillStyle = col; c.fillRect(x, y, w, h);
    if (sideW) { c.fillStyle = S(col, -0.25); poly(c, [[x + w, y], [x + w + sideW, y - sideW * 0.5], [x + w + sideW, y + h - sideW * 0.5], [x + w, y + h]]); c.fill(); }
  }
  /* om mic, îmbrăcat, din profil (pentru diorame): picioare și brațe cu volum, cap cu păr,
     nas, ureche și ochi care clipește; privește spre mijlocul scenei, respiră și gesticulează lin */
  let SCX = 0, LWC = 1;                     // mijlocul dioramei curente și grosimea conturului
  function limbC(c, x0, y0, x1, y1, r0, r1, col) {
    const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
    c.beginPath(); c.moveTo(x0 + nx * r0, y0 + ny * r0); c.lineTo(x1 + nx * r1, y1 + ny * r1); c.arc(x1, y1, r1, a + Math.PI / 2, a - Math.PI / 2, true);
    c.lineTo(x0 - nx * r0, y0 - ny * r0); c.arc(x0, y0, r0, a - Math.PI / 2, a + Math.PI / 2, true); c.closePath();
    c.fillStyle = col; c.fill();
  }
  function person(c, x, y, h, robe, skin, t, ph, hat) {
    const d = x < SCX ? 1 : -1, hair = ph % 2 ? '#3a2616' : '#24170e';
    const br = Math.sin(t * 1.6 + ph * 1.3), sway = Math.sin(t * 0.7 + ph) * h * 0.008;
    const gest = Math.max(0, Math.sin(t * 0.55 + ph * 2.1)), lw = Math.max(0.6, Math.min(LWC, h * 0.03));
    const legC = S(robe, -0.38), skinD = S(skin, -0.16), shoe = '#3a2a1e';
    c.save(); c.translate(x + sway, y); c.scale(d, 1); c.lineCap = 'round'; c.lineJoin = 'round';
    /* picioarele (cel din spate mai întunecat) și încălțările */
    limbC(c, -h * 0.03, -h * 0.5, -h * 0.05, -h * 0.03, h * 0.045, h * 0.032, S(legC, -0.15));
    limbC(c, h * 0.035, -h * 0.5, h * 0.05, -h * 0.03, h * 0.048, h * 0.034, legC);
    for (const [fx, col] of [[-h * 0.05, S(shoe, -0.2)], [h * 0.05, shoe]]) { c.beginPath(); c.ellipse(fx + h * 0.035, -h * 0.018, h * 0.06, h * 0.022, 0, 0, 7); c.fillStyle = col; c.fill(); }
    /* brațul din spate */
    limbC(c, -h * 0.02, -h * 0.78, -h * 0.06, -h * 0.5, h * 0.034, h * 0.027, S(robe, -0.22));
    c.beginPath(); c.arc(-h * 0.06, -h * 0.48, h * 0.03, 0, 7); c.fillStyle = skinD; c.fill();
    /* veșmântul: umeri rotunzi, talie, poale până sub genunchi */
    const bw = 1 + br * 0.012;
    c.beginPath(); c.moveTo(-h * 0.1 * bw, -h * 0.8);
    c.quadraticCurveTo(-h * 0.02, -h * 0.85, h * 0.09 * bw, -h * 0.8);
    c.quadraticCurveTo(h * 0.14 * bw, -h * 0.66, h * 0.11, -h * 0.52);
    c.quadraticCurveTo(h * 0.15, -h * 0.36, h * 0.16, -h * 0.24);
    c.quadraticCurveTo(0, -h * 0.21, -h * 0.15, -h * 0.25);
    c.quadraticCurveTo(-h * 0.14, -h * 0.4, -h * 0.12, -h * 0.52);
    c.quadraticCurveTo(-h * 0.15, -h * 0.68, -h * 0.1 * bw, -h * 0.8); c.closePath();
    fillV(c, robe, -h * 0.15, 0, h * 0.15, 0, 0.16, 0.28); c.strokeStyle = Art.ink(robe); c.lineWidth = lw; c.stroke();
    c.strokeStyle = S(robe, -0.3); c.lineWidth = Math.max(0.8, h * 0.025); c.beginPath(); c.moveTo(-h * 0.12, -h * 0.52); c.quadraticCurveTo(0, -h * 0.5, h * 0.11, -h * 0.52); c.stroke();
    c.strokeStyle = Art.rgba('#000000', 0.12); c.lineWidth = Math.max(0.6, h * 0.012); c.beginPath(); c.moveTo(-h * 0.04, -h * 0.48); c.lineTo(-h * 0.06, -h * 0.26); c.moveTo(h * 0.05, -h * 0.48); c.lineTo(h * 0.07, -h * 0.26); c.stroke();
    /* gâtul și capul (puțin mai mic decât la un desen animat: ~1/7 din înălțime) */
    const hr = h * 0.082, hx = h * 0.012, hy = -h * 0.905 + br * h * 0.003, nod = Math.sin(t * 0.8 + ph * 1.7) * 0.06 + gest * 0.05;
    limbC(c, 0, -h * 0.8, hx * 0.5, -h * 0.85, h * 0.028, h * 0.026, skinD);
    c.save(); c.translate(hx, hy); c.rotate(nod);
    c.beginPath(); c.moveTo(-hr * 0.85, -hr * 0.2); c.bezierCurveTo(-hr * 0.9, -hr * 1.05, hr * 0.7, -hr * 1.15, hr * 0.86, -hr * 0.25);
    c.lineTo(hr * 1.08, hr * 0.12); c.lineTo(hr * 0.86, hr * 0.22); c.quadraticCurveTo(hr * 0.9, hr * 0.62, hr * 0.62, hr * 0.85); c.quadraticCurveTo(hr * 0.1, hr * 1.02, -hr * 0.35, hr * 0.78); c.quadraticCurveTo(-hr * 0.95, hr * 0.45, -hr * 0.85, -hr * 0.2); c.closePath();
    const hg = c.createLinearGradient(-hr, -hr, hr, hr); hg.addColorStop(0, S(skin, 0.12)); hg.addColorStop(1, S(skin, -0.2)); c.fillStyle = hg; c.fill(); c.strokeStyle = Art.ink(skin); c.lineWidth = lw; c.stroke();
    /* părul sau pălăria */
    c.beginPath(); c.moveTo(-hr * 0.92, hr * 0.35); c.bezierCurveTo(-hr * 1.1, -hr * 0.9, hr * 0.55, -hr * 1.35, hr * 0.92, -hr * 0.3); c.quadraticCurveTo(hr * 0.5, -hr * 0.55, hr * 0.05, -hr * 0.35); c.quadraticCurveTo(-hr * 0.2, hr * 0.0, -hr * 0.45, hr * 0.42); c.closePath();
    c.fillStyle = hat || hair; c.fill();
    if (hat) { c.fillStyle = S(hat, -0.15); c.beginPath(); c.ellipse(hr * 0.05, -hr * 0.42, hr * 1.12, hr * 0.2, -0.08, 0, 7); c.fill(); }
    else { c.strokeStyle = S(hair, 0.3); c.lineWidth = Math.max(0.5, hr * 0.1); c.beginPath(); c.moveTo(-hr * 0.6, -hr * 0.45); c.quadraticCurveTo(-hr * 0.1, -hr * 0.95, hr * 0.5, -hr * 0.62); c.stroke(); }
    /* urechea, ochiul (clipește), sprânceana, gura */
    c.fillStyle = S(skin, -0.12); c.beginPath(); c.ellipse(-hr * 0.12, hr * 0.12, hr * 0.15, hr * 0.22, 0, 0, 7); c.fill();
    const bl = ((t + ph * 1.37) % (3.1 + ph * 0.4)) < 0.14;
    c.fillStyle = '#20140c';
    if (bl) c.fillRect(hr * 0.42, hr * 0.0, hr * 0.26, Math.max(0.6, hr * 0.06));
    else { c.beginPath(); c.ellipse(hr * 0.55, -hr * 0.02, hr * 0.1, hr * 0.13, 0, 0, 7); c.fill(); }
    c.strokeStyle = S(hair, 0.1); c.lineWidth = Math.max(0.5, hr * 0.1); c.beginPath(); c.moveTo(hr * 0.36, -hr * 0.28); c.lineTo(hr * 0.74, -hr * 0.26); c.stroke();
    c.strokeStyle = Art.rgba('#6a2a20', 0.7); c.lineWidth = Math.max(0.5, hr * 0.08); c.beginPath(); c.moveTo(hr * 0.62, hr * 0.5); c.lineTo(hr * 0.82, hr * 0.47); c.stroke();
    c.restore();
    /* brațul din față: atârnă și din când în când gesticulează */
    const ea = 0.15 + gest * 0.5, sx = h * 0.01, sy = -h * 0.77, ex = sx + Math.sin(0.08) * h * 0.15, ey = sy + h * 0.15;
    const wx = ex + Math.sin(ea) * h * 0.14, wy = ey + Math.cos(ea) * h * 0.14;
    limbC(c, sx, sy, ex, ey, h * 0.04, h * 0.032, S(robe, -0.06)); limbC(c, ex, ey, wx, wy, h * 0.03, h * 0.026, skin);
    c.beginPath(); c.arc(wx, wy, h * 0.03, 0, 7); c.fillStyle = skin; c.fill();
    c.restore();
  }
  function hills(c, W, y, amp, col, seed, step) { c.beginPath(); c.moveTo(0, y + amp * 3); for (let x = 0; x <= W + 8; x += step || 8) c.lineTo(x, y - amp * (0.5 + 0.5 * Art.noise1(x / W * 3 + seed))); c.lineTo(W, y + amp * 3); c.closePath(); c.fillStyle = col; c.fill(); }
  function sky(c, W, H, kind) { const sc = Art.SCENE[kind === 'smog' ? 'day' : kind] || Art.SCENE.day, g = c.createLinearGradient(0, 0, 0, H * 0.75); g.addColorStop(0, sc[0]); g.addColorStop(1, sc[1]); c.fillStyle = g; c.fillRect(0, 0, W, H); if (kind === 'smog') { c.fillStyle = 'rgba(150,140,125,0.35)'; c.fillRect(0, 0, W, H); } }
  function ground(c, W, H, gy, a, b) { const g = c.createLinearGradient(0, gy, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, gy, W, H - gy); }
  function tree(c, x, y, h, col, kind) {
    c.save(); c.translate(x, y);
    if (kind === 'palm') {
      c.strokeStyle = '#7a5a36'; c.lineWidth = h * 0.06; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(h * 0.1, -h * 0.5, h * 0.05, -h); c.stroke();
      c.fillStyle = col; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.55; c.beginPath(); c.moveTo(h * 0.05, -h); c.quadraticCurveTo(h * 0.05 + Math.cos(a) * h * 0.3, -h + Math.sin(a) * h * 0.3 - h * 0.08, h * 0.05 + Math.cos(a) * h * 0.45, -h + Math.sin(a) * h * 0.3 + h * 0.12); c.quadraticCurveTo(h * 0.05 + Math.cos(a) * h * 0.2, -h + Math.sin(a) * h * 0.15, h * 0.05, -h); c.fill(); }
    } else if (kind === 'pine') {
      c.fillStyle = '#5a4030'; c.fillRect(-h * 0.03, -h * 0.15, h * 0.06, h * 0.15);
      c.fillStyle = col; for (let i = 0; i < 3; i++) { const yy = -h * (0.12 + i * 0.25), ww = h * (0.26 - i * 0.06); poly(c, [[-ww, yy], [0, yy - h * 0.4], [ww, yy]]); c.fill(); }
    } else if (kind === 'cypress') {
      c.fillStyle = col; c.beginPath(); c.ellipse(0, -h * 0.5, h * 0.12, h * 0.5, 0, 0, 7); c.fill();
    } else {
      c.fillStyle = '#5a4030'; c.fillRect(-h * 0.04, -h * 0.45, h * 0.08, h * 0.45);
      c.fillStyle = col; c.beginPath(); c.arc(-h * 0.14, -h * 0.55, h * 0.22, 0, 7); c.arc(h * 0.14, -h * 0.58, h * 0.22, 0, 7); c.arc(0, -h * 0.75, h * 0.26, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.arc(-h * 0.08, -h * 0.82, h * 0.12, 0, 7); c.fill();
    }
    c.restore();
  }
  function flame(c, x, y, s, t) {          /* flacără mică, care explică focul (fără strălucire) */
    for (const [k, col] of [[1, '#e8602a'], [0.6, '#ffc14a']]) { const h = s * 2 * k * (1 + 0.06 * Math.sin(t * 3 + k * 4)), w = s * 0.7 * k, tip = Math.sin(t * 1.7 + k) * w * 0.2; c.beginPath(); c.moveTo(x - w, y); c.bezierCurveTo(x - w, y - h * 0.5, x + tip - w * 0.2, y - h * 0.7, x + tip, y - h); c.bezierCurveTo(x + tip + w * 0.3, y - h * 0.6, x + w, y - h * 0.45, x + w, y); c.closePath(); c.fillStyle = col; c.fill(); }
  }
  function smoke(c, x, y, s, t, col) {     /* fum de coș: câteva pufuri care urcă lent (explică arderea cărbunelui) */
    for (let i = 0; i < 5; i++) { const k = ((t * 0.12 + i / 5) % 1), r = s * (0.5 + k * 1.4); c.fillStyle = Art.rgba(col || '#8a8a8a', 0.45 * (1 - k)); c.beginPath(); c.arc(x + k * s * 3 + Math.sin(k * 6 + i) * s * 0.3, y - k * s * 6, r, 0, 7); c.fill(); }
  }

  /* ================= iconițele reperelor (desen în cercul unitate) ================= */
  const ICON = {
    gobekli(c) { for (const [x, h] of [[-0.4, 1.2], [0.38, 1.0]]) { c.beginPath(); c.rect(x - 0.13, 0.75 - h, 0.26, h); c.rect(x - 0.32, 0.75 - h - 0.22, 0.64, 0.24); fillV(c, '#c8b48e', x - 0.3, 0, x + 0.3, 0); edge(c, 'rgba(60,45,25,0.6)', 0.04); c.strokeStyle = '#7d6a4a'; c.lineWidth = 0.05; c.beginPath(); c.moveTo(x - 0.06, 0.1 - h * 0.3); c.quadraticCurveTo(x + 0.06, -h * 0.3, x - 0.04, 0.3 - h * 0.2); c.stroke(); } c.fillStyle = '#8a7a52'; c.fillRect(-0.85, 0.72, 1.7, 0.14); },
    wheat(c) { for (const [dx, a] of [[-0.35, -0.25], [0, 0], [0.35, 0.25]]) { c.save(); c.translate(dx, 0.85); c.rotate(a); c.strokeStyle = '#a8883a'; c.lineWidth = 0.06; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -1.0); c.stroke(); for (let i = 0; i < 5; i++) for (const sd of [-1, 1]) { c.save(); c.translate(0, -1.05 + i * 0.13); c.rotate(sd * 0.5); c.fillStyle = S('#e0b44a', -i * 0.04); c.beginPath(); c.ellipse(sd * 0.07, 0, 0.06, 0.12, 0, 0, 7); c.fill(); c.restore(); } c.restore(); } },
    town(c) { const B = [[-0.85, 0.1, 0.55, 0.6], [-0.35, -0.15, 0.55, 0.85], [0.15, 0.05, 0.6, 0.65]]; for (const [x, y, w, h] of B) { box(c, x, y, w, h, '#c9a678', 0.12); c.strokeStyle = 'rgba(80,55,30,0.5)'; c.lineWidth = 0.03; c.strokeRect(x, y, w, h); c.fillStyle = '#5a3e24'; c.fillRect(x + w * 0.4, y + h * 0.35, w * 0.2, w * 0.25); } c.strokeStyle = '#6a4a2a'; c.lineWidth = 0.05; c.beginPath(); c.moveTo(-0.1, -0.15); c.lineTo(-0.05, -0.6); c.moveTo(0.05, -0.15); c.lineTo(0.1, -0.6); for (let i = 0; i < 4; i++) { c.moveTo(-0.09 + i * 0.012, -0.22 - i * 0.11); c.lineTo(0.07 + i * 0.012, -0.22 - i * 0.11); } c.stroke(); },
    pot(c) { c.beginPath(); c.moveTo(-0.3, -0.75); c.lineTo(0.3, -0.75); c.quadraticCurveTo(0.25, -0.5, 0.6, -0.15); c.quadraticCurveTo(0.85, 0.25, 0.45, 0.7); c.lineTo(-0.45, 0.7); c.quadraticCurveTo(-0.85, 0.25, -0.6, -0.15); c.quadraticCurveTo(-0.25, -0.5, -0.3, -0.75); c.closePath(); fillV(c, '#e2b98a', -0.6, 0, 0.6, 0, 0.12, 0.25); edge(c, 'rgba(90,50,20,0.6)', 0.04); c.save(); c.clip(); c.lineWidth = 0.09; c.strokeStyle = '#a63a22'; for (const sx of [-0.3, 0.3]) { c.beginPath(); for (let i = 0; i < 40; i++) { const a = i * 0.3, r = 0.03 + i * 0.006; c.lineTo(sx + Math.cos(a) * r, 0.05 + Math.sin(a) * r); } c.stroke(); } c.strokeStyle = '#2a1a12'; c.lineWidth = 0.05; c.beginPath(); c.moveTo(-0.7, -0.35); c.quadraticCurveTo(0, -0.2, 0.7, -0.35); c.moveTo(-0.7, 0.45); c.quadraticCurveTo(0, 0.6, 0.7, 0.45); c.stroke(); c.restore(); },
    copper(c) { c.beginPath(); c.moveTo(-0.8, -0.35); c.quadraticCurveTo(0, -0.15, 0.8, -0.35); c.quadraticCurveTo(0.6, 0, 0.8, 0.35); c.quadraticCurveTo(0, 0.15, -0.8, 0.35); c.quadraticCurveTo(-0.6, 0, -0.8, -0.35); fillV(c, '#c8733a', -0.8, -0.4, 0.8, 0.4, 0.25, 0.3); edge(c, 'rgba(90,40,10,0.6)', 0.04); c.fillStyle = 'rgba(255,220,180,0.4)'; c.beginPath(); c.ellipse(-0.25, -0.12, 0.35, 0.06, -0.1, 0, 7); c.fill(); c.beginPath(); c.ellipse(0.45, 0.62, 0.22, 0.15, 0.3, 0, 7); fillV(c, '#f0c040', 0.2, 0.5, 0.65, 0.75, 0.3, 0.2); },
    wheel(c) { c.lineWidth = 0.17; c.strokeStyle = '#7a5230'; c.beginPath(); c.arc(0, 0, 0.75, 0, 7); c.stroke(); c.strokeStyle = '#a07040'; c.lineWidth = 0.06; c.beginPath(); c.arc(0, 0, 0.75, 0, 7); c.stroke(); c.lineWidth = 0.1; c.strokeStyle = '#8a6038'; c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.moveTo(0, 0); c.lineTo(Math.cos(a) * 0.7, Math.sin(a) * 0.7); } c.stroke(); c.beginPath(); c.arc(0, 0, 0.17, 0, 7); fillV(c, '#6a4428', -0.2, -0.2, 0.2, 0.2); },
    bronze(c) { c.save(); c.rotate(-0.5); c.fillStyle = '#6a4a2a'; c.fillRect(-0.06, -0.9, 0.12, 1.75); c.beginPath(); c.moveTo(0.06, -0.55); c.lineTo(0.55, -0.75); c.quadraticCurveTo(0.7, -0.4, 0.55, -0.05); c.lineTo(0.06, -0.25); c.closePath(); fillV(c, '#c09040', 0, -0.8, 0.6, 0, 0.3, 0.25); edge(c, 'rgba(80,50,10,0.6)', 0.04); c.restore(); },
    tablet(c) { c.beginPath(); Art.roundRectPath(c, -0.6, -0.8, 1.2, 1.55, 0.18); fillV(c, '#c7a27a', -0.6, -0.8, 0.6, 0.8, 0.15, 0.25); edge(c, 'rgba(90,60,30,0.6)', 0.04); c.fillStyle = '#7a5a3a'; for (let r = 0; r < 5; r++) for (let k = 0; k < 4; k++) { const x = -0.42 + k * 0.27 + (r % 2) * 0.06, y = -0.58 + r * 0.28; poly(c, [[x, y], [x + 0.14, y + 0.04], [x, y + 0.09]]); c.fill(); } c.strokeStyle = 'rgba(90,60,30,0.4)'; c.lineWidth = 0.03; c.beginPath(); for (let r = 1; r < 5; r++) { c.moveTo(-0.5, -0.64 + r * 0.28); c.lineTo(0.5, -0.64 + r * 0.28); } c.stroke(); },
    pyramid(c) { c.fillStyle = '#f2c64a'; c.beginPath(); c.arc(0.5, -0.5, 0.2, 0, 7); c.fill(); for (const [x, s] of [[0.35, 0.55], [-0.25, 0.85]]) { poly(c, [[x - s, 0.7], [x, 0.7 - s * 1.15], [x + s, 0.7]]); c.fillStyle = '#e0bb78'; c.fill(); poly(c, [[x, 0.7 - s * 1.15], [x + s, 0.7], [x + s * 0.25, 0.7]]); c.fillStyle = '#b48a50'; c.fill(); } c.fillStyle = '#c8a466'; c.fillRect(-0.95, 0.7, 1.9, 0.12); },
    iron(c) { c.beginPath(); c.moveTo(-0.7, 0.05); c.lineTo(0.55, 0.05); c.quadraticCurveTo(0.9, 0.05, 0.85, -0.12); c.lineTo(0.6, -0.15); c.lineTo(-0.6, -0.15); c.closePath(); c.moveTo(-0.3, 0.05); c.lineTo(0.3, 0.05); c.lineTo(0.2, 0.45); c.lineTo(0.45, 0.6); c.lineTo(-0.45, 0.6); c.lineTo(-0.2, 0.45); c.closePath(); fillV(c, '#5d636e', -0.7, -0.2, 0.7, 0.6, 0.3, 0.3); c.save(); c.translate(-0.1, -0.45); c.rotate(-0.6); c.fillStyle = '#8a6038'; c.fillRect(-0.05, -0.1, 0.1, 0.75); c.beginPath(); c.rect(-0.28, -0.3, 0.56, 0.22); fillV(c, '#7a808a', -0.3, -0.3, 0.3, -0.1, 0.3, 0.3); c.restore(); },
    temple(c) { poly(c, [[-0.9, -0.35], [0, -0.78], [0.9, -0.35]]); fillV(c, '#efe6d0', 0, -0.8, 0, -0.35, 0.1, 0.15); edge(c, 'rgba(100,90,70,0.5)', 0.03); c.fillStyle = '#e2d6bc'; c.fillRect(-0.85, -0.38, 1.7, 0.13); for (let i = 0; i < 6; i++) { const x = -0.72 + i * 0.288; c.beginPath(); c.rect(x - 0.065, -0.25, 0.13, 0.82); fillV(c, '#f2ead8', x - 0.07, 0, x + 0.07, 0, 0.1, 0.3); } c.fillStyle = '#d8ccb0'; c.fillRect(-0.92, 0.57, 1.84, 0.1); c.fillRect(-0.98, 0.67, 1.96, 0.1); },
    wall(c) { c.fillStyle = '#7a9a5a'; c.beginPath(); c.moveTo(-1, 0.9); c.quadraticCurveTo(-0.3, -0.1, 1, 0.3); c.lineTo(1, 1); c.lineTo(-1, 1); c.fill(); c.fillStyle = '#b8a890'; c.beginPath(); c.moveTo(-0.95, 0.55); c.quadraticCurveTo(-0.3, -0.22, 0.95, 0.12); c.lineTo(0.95, 0.3); c.quadraticCurveTo(-0.3, 0.0, -0.95, 0.72); c.fill(); for (let i = 0; i < 9; i++) { const k = i / 8, x = lerp(-0.9, 0.9, k), y = lerp(0.52, 0.1, k) - Math.sin(k * Math.PI) * 0.27; c.fillRect(x - 0.04, y - 0.1, 0.08, 0.1); } box(c, -0.12, -0.42, 0.3, 0.32, '#a89878', 0.08); poly(c, [[-0.16, -0.42], [0.03, -0.6], [0.22, -0.42]]); c.fillStyle = '#8a3a2a'; c.fill(); },
    dacia(c) { poly(c, [[-1, 0.8], [-0.35, -0.5], [0.05, 0.1], [0.45, -0.3], [1, 0.8]]); fillV(c, '#6a8a6a', -0.5, -0.5, 0.6, 0.8, 0.15, 0.25); c.fillStyle = '#d8ccb0'; c.fillRect(-0.62, -0.18, 0.55, 0.22); c.fillStyle = '#b8ab90'; for (let i = 0; i < 4; i++) c.fillRect(-0.6 + i * 0.15, -0.26, 0.08, 0.08); c.strokeStyle = 'rgba(80,70,50,0.6)'; c.lineWidth = 0.03; c.beginPath(); for (let i = 0; i < 3; i++) { c.moveTo(-0.62, -0.1 + i * 0.07); c.lineTo(-0.07, -0.1 + i * 0.07); } c.stroke(); },
    aqueduct(c) { c.beginPath(); c.rect(-0.95, -0.6, 1.9, 1.35); for (let i = 0; i < 4; i++) { const x = -0.72 + i * 0.48; c.moveTo(x + 0.17, 0.75); c.lineTo(x + 0.17, 0.2); c.arc(x, 0.2, 0.17, 0, Math.PI, true); c.lineTo(x - 0.17, 0.75); } for (let i = 0; i < 6; i++) { const x = -0.8 + i * 0.32; c.moveTo(x + 0.1, -0.15); c.lineTo(x + 0.1, -0.3); c.arc(x, -0.3, 0.1, 0, Math.PI, true); c.lineTo(x - 0.1, -0.15); } c.fillStyle = '#d6b88c'; c.fill('evenodd'); c.strokeStyle = 'rgba(90,60,30,0.5)'; c.lineWidth = 0.03; c.stroke(); c.fillStyle = '#5a9ad0'; c.fillRect(-0.95, -0.68, 1.9, 0.08); },
    column(c) { c.fillStyle = '#d6ccb4'; c.fillRect(-0.4, 0.62, 0.8, 0.2); c.fillRect(-0.3, -0.78, 0.6, 0.1); c.beginPath(); c.rect(-0.2, -0.7, 0.4, 1.32); fillV(c, '#efe6d0', -0.2, 0, 0.2, 0, 0.1, 0.3); c.save(); c.clip(); c.strokeStyle = 'rgba(120,100,70,0.6)'; c.lineWidth = 0.035; c.beginPath(); for (let i = -8; i < 10; i++) { c.moveTo(-0.25, i * 0.16); c.lineTo(0.25, i * 0.16 - 0.12); } c.stroke(); c.restore(); c.fillStyle = '#8a7a60'; c.beginPath(); c.arc(0, -0.86, 0.09, 0, 7); c.fill(); c.fillRect(-0.04, -0.82, 0.08, 0.06); },
    scroll(c) { c.beginPath(); c.rect(-0.55, -0.5, 1.1, 1.0); fillV(c, '#f0e2be', -0.5, -0.5, 0.5, 0.5, 0.1, 0.18); c.strokeStyle = 'rgba(140,110,60,0.6)'; c.lineWidth = 0.035; c.beginPath(); for (let i = 0; i < 5; i++) { c.moveTo(-0.4, -0.3 + i * 0.16); c.lineTo(0.38 - (i % 2) * 0.15, -0.3 + i * 0.16); } c.stroke(); for (const y of [-0.55, 0.55]) { c.beginPath(); Art.roundRectPath(c, -0.72, y - 0.12, 1.44, 0.24, 0.12); fillV(c, '#d8c08a', 0, y - 0.12, 0, y + 0.12, 0.2, 0.3); c.fillStyle = '#7a5230'; c.beginPath(); c.arc(-0.76, y, 0.08, 0, 7); c.arc(0.76, y, 0.08, 0, 7); c.fill(); } },
    castle(c) { const st = '#b8b0a0'; c.beginPath(); c.rect(-0.55, -0.15, 1.1, 0.9); fillV(c, st, -0.5, 0, 0.5, 0, 0.1, 0.2); for (const x of [-0.78, 0.48]) { c.beginPath(); c.rect(x, -0.5, 0.3, 1.25); fillV(c, st, x, 0, x + 0.3, 0, 0.15, 0.25); poly(c, [[x - 0.05, -0.5], [x + 0.15, -0.88], [x + 0.35, -0.5]]); c.fillStyle = '#4a5a8a'; c.fill(); } c.fillStyle = st; for (let i = 0; i < 5; i++) c.fillRect(-0.5 + i * 0.22, -0.25, 0.12, 0.1); c.beginPath(); c.moveTo(-0.15, 0.75); c.lineTo(-0.15, 0.4); c.arc(0, 0.4, 0.15, Math.PI, 0); c.lineTo(0.15, 0.75); c.fillStyle = '#4a3626'; c.fill(); c.strokeStyle = '#6a3a2a'; c.lineWidth = 0.03; c.beginPath(); c.moveTo(0.63, -0.88); c.lineTo(0.63, -1.0); c.stroke(); c.fillStyle = '#c0392b'; poly(c, [[0.63, -1.0], [0.8, -0.95], [0.63, -0.9]]); c.fill(); },
    book(c) { for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, -0.45); c.quadraticCurveTo(sd * 0.4, -0.62, sd * 0.85, -0.5); c.lineTo(sd * 0.85, 0.5); c.quadraticCurveTo(sd * 0.4, 0.38, 0, 0.55); c.closePath(); fillV(c, '#f6eedc', 0, -0.5, sd * 0.8, 0.5, 0.05, 0.15); edge(c, 'rgba(100,80,50,0.6)', 0.035); c.strokeStyle = 'rgba(60,50,40,0.55)'; c.lineWidth = 0.035; c.beginPath(); for (let i = 0; i < 5; i++) { const y = -0.28 + i * 0.15; c.moveTo(sd * 0.15, y); c.quadraticCurveTo(sd * 0.4, y - 0.08, sd * 0.7, y - 0.03); } c.stroke(); } c.fillStyle = '#7a2a22'; c.beginPath(); c.moveTo(-0.9, 0.52); c.quadraticCurveTo(0, 0.42, 0.9, 0.52); c.lineTo(0.9, 0.62); c.quadraticCurveTo(0, 0.52, -0.9, 0.62); c.fill(); },
    ship(c) { c.beginPath(); c.moveTo(-0.85, 0.2); c.lineTo(0.9, 0.15); c.quadraticCurveTo(0.6, 0.55, 0.4, 0.58); c.lineTo(-0.55, 0.58); c.quadraticCurveTo(-0.8, 0.45, -0.85, 0.2); fillV(c, '#7a4a28', 0, 0.15, 0, 0.6, 0.15, 0.25); c.strokeStyle = '#5a3a20'; c.lineWidth = 0.05; c.beginPath(); c.moveTo(-0.3, 0.2); c.lineTo(-0.3, -0.85); c.moveTo(0.3, 0.2); c.lineTo(0.3, -0.6); c.stroke(); for (const [x, top, h, w] of [[-0.3, -0.8, 0.85, 0.36], [0.3, -0.55, 0.62, 0.3]]) { c.beginPath(); c.moveTo(x - w, top); c.quadraticCurveTo(x, top + 0.08, x + w, top); c.quadraticCurveTo(x + w + 0.1, top + h * 0.5, x + w, top + h); c.lineTo(x - w, top + h); c.quadraticCurveTo(x - w + 0.08, top + h * 0.5, x - w, top); fillV(c, '#f2ead6', x - w, 0, x + w, 0, 0.05, 0.18); c.fillStyle = '#c0392b'; c.beginPath(); c.arc(x, top + h * 0.5, w * 0.25, 0, 7); c.fill(); c.strokeStyle = '#c0392b'; c.lineWidth = 0.035; c.beginPath(); c.moveTo(x, top + h * 0.3); c.lineTo(x, top + h * 0.7); c.moveTo(x - w * 0.2, top + h * 0.5); c.lineTo(x + w * 0.2, top + h * 0.5); c.stroke(); } c.fillStyle = '#4a8ac0'; c.fillRect(-1, 0.6, 2, 0.3); },
    telescope(c) { c.strokeStyle = '#5a4030'; c.lineWidth = 0.06; c.beginPath(); c.moveTo(0, 0.0); c.lineTo(-0.45, 0.85); c.moveTo(0, 0.0); c.lineTo(0.45, 0.85); c.moveTo(0, 0); c.lineTo(0, 0.85); c.stroke(); c.save(); c.rotate(-0.55); c.beginPath(); c.moveTo(-0.7, -0.1); c.lineTo(0.75, -0.17); c.lineTo(0.75, 0.17); c.lineTo(-0.7, 0.1); c.closePath(); fillV(c, '#b08a3a', 0, -0.17, 0, 0.17, 0.35, 0.3); edge(c, 'rgba(80,50,10,0.6)', 0.03); c.fillStyle = '#6a4a22'; c.fillRect(0.2, -0.16, 0.08, 0.32); c.restore(); c.fillStyle = '#f2d24a'; for (const [x, y, r] of [[0.6, -0.75, 0.1], [-0.55, -0.5, 0.06]]) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); } },
    factory(c) { c.fillStyle = 'rgba(140,140,140,0.5)'; c.beginPath(); c.arc(0.5, -0.82, 0.16, 0, 7); c.arc(0.68, -0.95, 0.12, 0, 7); c.fill(); c.beginPath(); c.rect(0.38, -0.7, 0.2, 1.0); fillV(c, '#9a4a32', 0.38, 0, 0.58, 0, 0.15, 0.25); c.beginPath(); c.moveTo(-0.9, 0.75); c.lineTo(-0.9, 0.0); c.lineTo(-0.55, -0.25); c.lineTo(-0.55, 0.0); c.lineTo(-0.2, -0.25); c.lineTo(-0.2, 0.0); c.lineTo(0.15, -0.25); c.lineTo(0.15, 0.0); c.lineTo(0.85, 0.0); c.lineTo(0.85, 0.75); c.closePath(); fillV(c, '#a85a3c', -0.9, -0.2, 0.9, 0.75, 0.15, 0.25); edge(c, 'rgba(70,30,15,0.5)', 0.03); c.fillStyle = '#f2d27a'; for (let i = 0; i < 4; i++) c.fillRect(-0.75 + i * 0.42, 0.2, 0.2, 0.22); },
    phone(c) { c.beginPath(); c.moveTo(-0.7, 0.75); c.lineTo(-0.55, 0.05); c.lineTo(0.55, 0.05); c.lineTo(0.7, 0.75); c.closePath(); fillV(c, '#2a2a2e', 0, 0, 0, 0.75, 0.25, 0.2); c.beginPath(); c.arc(0, 0.42, 0.25, 0, 7); c.fillStyle = '#e8e2d2'; c.fill(); c.fillStyle = '#2a2a2e'; for (let i = 0; i < 8; i++) { const a = i * 0.7 + 0.5; c.beginPath(); c.arc(Math.cos(a) * 0.16, 0.42 + Math.sin(a) * 0.16, 0.04, 0, 7); c.fill(); } c.beginPath(); c.moveTo(-0.75, -0.25); c.quadraticCurveTo(0, -0.55, 0.75, -0.25); c.lineTo(0.62, -0.05); c.quadraticCurveTo(0, -0.3, -0.62, -0.05); c.closePath(); fillV(c, '#3a3a40', 0, -0.5, 0, 0, 0.3, 0.2); c.beginPath(); c.ellipse(-0.68, -0.15, 0.17, 0.12, 0.3, 0, 7); c.ellipse(0.68, -0.15, 0.17, 0.12, -0.3, 0, 7); c.fill(); },
    plane(c) { c.fillStyle = '#c0a060'; c.fillRect(-0.85, -0.42, 1.5, 0.12); c.fillRect(-0.85, 0.12, 1.5, 0.12); c.strokeStyle = '#6a5030'; c.lineWidth = 0.035; c.beginPath(); for (const x of [-0.7, -0.2, 0.4]) { c.moveTo(x, -0.3); c.lineTo(x, 0.12); } c.stroke(); c.beginPath(); c.moveTo(-0.95, -0.05); c.quadraticCurveTo(0.2, -0.2, 0.85, -0.05); c.quadraticCurveTo(0.2, 0.1, -0.95, -0.05); fillV(c, '#d8c08a', 0, -0.15, 0, 0.08, 0.2, 0.3); c.fillStyle = '#6a5030'; c.fillRect(0.82, -0.32, 0.05, 0.55); },
    pill(c) { c.save(); c.rotate(-0.7); c.beginPath(); c.moveTo(0, -0.3); c.lineTo(-0.5, -0.3); c.arc(-0.5, 0, 0.3, -Math.PI / 2, Math.PI / 2, true); c.lineTo(0, 0.3); c.closePath(); fillV(c, '#e8e2d8', 0, -0.3, 0, 0.3, 0.2, 0.25); c.beginPath(); c.moveTo(0, -0.3); c.lineTo(0.5, -0.3); c.arc(0.5, 0, 0.3, -Math.PI / 2, Math.PI / 2); c.lineTo(0, 0.3); c.closePath(); fillV(c, '#d8503a', 0, -0.3, 0, 0.3, 0.25, 0.25); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(-0.6, -0.2, 1.1, 0.06); c.restore(); },
    moon(c) { c.beginPath(); c.arc(0, 0.1, 0.72, 0, 7); fillV(c, '#c8c8c4', -0.6, -0.6, 0.6, 0.8, 0.2, 0.35); c.fillStyle = 'rgba(90,90,90,0.35)'; for (const [x, y, r] of [[-0.3, -0.1, 0.16], [0.25, 0.3, 0.12], [0.1, -0.3, 0.08], [-0.15, 0.45, 0.09]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.strokeStyle = '#ddd'; c.lineWidth = 0.04; c.beginPath(); c.moveTo(0.42, -0.35); c.lineTo(0.42, -0.95); c.stroke(); c.fillStyle = '#fff'; c.fillRect(0.42, -0.95, 0.32, 0.2); c.fillStyle = '#3a5aa8'; c.fillRect(0.42, -0.95, 0.12, 0.1); c.fillStyle = '#c0392b'; for (let i = 0; i < 3; i++) c.fillRect(0.42, -0.9 + i * 0.05, 0.32, 0.02); },
    web(c) { c.beginPath(); c.arc(0, 0, 0.78, 0, 7); fillV(c, '#3a8ad0', -0.6, -0.6, 0.6, 0.6, 0.2, 0.3); c.save(); c.clip(); c.fillStyle = '#5aa04a'; c.beginPath(); Art.smoothPath(c, [[-0.6, -0.3], [-0.2, -0.5], [0.05, -0.2], [-0.15, 0.2], [-0.45, 0.35], [-0.7, 0.05]], true); c.fill(); c.beginPath(); Art.smoothPath(c, [[0.2, -0.1], [0.6, -0.3], [0.75, 0.1], [0.45, 0.6], [0.2, 0.3]], true); c.fill(); c.restore(); c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.03; c.beginPath(); c.ellipse(0, 0, 0.35, 0.78, 0, 0, 7); c.moveTo(-0.78, 0); c.lineTo(0.78, 0); c.stroke(); const N = [[-0.5, -0.45], [0.55, -0.35], [0.45, 0.5], [-0.4, 0.45], [0.05, -0.05]]; c.strokeStyle = '#ffd24a'; c.lineWidth = 0.05; c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(N[4][0], N[4][1]); c.lineTo(N[i][0], N[i][1]); } c.stroke(); c.fillStyle = '#ffd24a'; for (const [x, y] of N) { c.beginPath(); c.arc(x, y, 0.09, 0, 7); c.fill(); } },
    smartphone(c) { c.beginPath(); Art.roundRectPath(c, -0.45, -0.85, 0.9, 1.7, 0.15); fillV(c, '#2a2c34', -0.45, 0, 0.45, 0, 0.2, 0.2); c.beginPath(); Art.roundRectPath(c, -0.37, -0.72, 0.74, 1.44, 0.06); const g = c.createLinearGradient(0, -0.72, 0, 0.72); g.addColorStop(0, '#4a7ad8'); g.addColorStop(1, '#7a4ac8'); c.fillStyle = g; c.fill(); const cols = ['#f2c44a', '#4ad08a', '#e8604a', '#ffffff']; for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { c.fillStyle = cols[(r * 3 + k) % 4]; c.beginPath(); Art.roundRectPath(c, -0.3 + k * 0.22, -0.55 + r * 0.26, 0.15, 0.15, 0.04); c.fill(); } },
    ai(c) { c.beginPath(); Art.roundRectPath(c, -0.6, -0.5, 1.2, 1.05, 0.25); fillV(c, '#b8c4d4', -0.6, -0.5, 0.6, 0.55, 0.25, 0.3); edge(c, 'rgba(50,60,80,0.6)', 0.04); c.beginPath(); Art.roundRectPath(c, -0.45, -0.3, 0.9, 0.5, 0.15); c.fillStyle = '#1e2a3a'; c.fill(); c.fillStyle = '#5ee7ff'; c.beginPath(); c.arc(-0.2, -0.05, 0.09, 0, 7); c.arc(0.2, -0.05, 0.09, 0, 7); c.fill(); c.strokeStyle = '#5a6678'; c.lineWidth = 0.05; c.beginPath(); c.moveTo(0, -0.5); c.lineTo(0, -0.78); c.stroke(); c.fillStyle = '#e8604a'; c.beginPath(); c.arc(0, -0.82, 0.08, 0, 7); c.fill(); c.fillStyle = '#8a96a8'; c.fillRect(-0.72, -0.15, 0.12, 0.3); c.fillRect(0.6, -0.15, 0.12, 0.3); c.strokeStyle = '#5a6678'; c.lineWidth = 0.04; c.beginPath(); c.moveTo(-0.25, 0.37); c.lineTo(0.25, 0.37); c.stroke(); }
  };
  /* medalionul unui reper, randat o singură dată în cache (la rezoluția ecranului) */
  function medal(ic, r, on, dpr) {
    const px = Math.round((r + 3) * 2 * dpr);
    return Art.cached('civ_' + ic + '_' + (on ? 1 : 0) + '_' + px, px, px, (c, w) => {
      const R = r * dpr; c.translate(w / 2, w / 2);
      c.beginPath(); c.arc(0, 0, R, 0, 7); const g = c.createLinearGradient(0, -R, 0, R); g.addColorStop(0, on ? '#fff6dc' : '#f4ecdc'); g.addColorStop(1, on ? '#f1d99a' : '#d9cdb6'); c.fillStyle = g; c.fill();
      c.lineWidth = Math.max(1, (on ? 2.4 : 1.2) * dpr); c.strokeStyle = on ? '#c8962a' : 'rgba(80,60,40,0.55)'; c.stroke();
      c.save(); c.beginPath(); c.arc(0, 0, R - 1, 0, 7); c.clip(); c.scale(R * 0.68, R * 0.68); c.lineJoin = 'round'; ICON[ic](c); c.restore();
    });
  }

  /* ================= dioramele epocilor (coordonate locale 0..W, 0..H; k = scara) ================= */
  const SCENES = [
    { from: -12100, name: 'Tabără de vânători', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'dusk'); hills(c, W, gy - 40 * k, 22 * k, '#a8907a', 1); hills(c, W, gy - 12 * k, 12 * k, '#8a8a5a', 4);
      ground(c, W, H, gy, '#9a9a5a', '#6a6a3a');
      for (const [dx, s] of [[-150, 1], [-200, 0.7], [170, 0.9], [215, 0.7]]) tree(c, cx + dx * k, gy + 2 * k, 52 * k * s, '#4a6a4a', 'pine');
      for (const [dx, s] of [[-70, 1], [55, 0.85]]) {   /* corturi din piei pe pari */
        const x = cx + dx * k, w = 34 * k * s, h = 46 * k * s;
        poly(c, [[x - w, gy + 2 * k], [x, gy - h], [x + w, gy + 2 * k]]); fillV(c, '#b08a5e', x - w, 0, x + w, 0, 0.15, 0.3); edge(c, 'rgba(60,40,20,0.5)');
        c.strokeStyle = 'rgba(80,55,30,0.55)'; c.lineWidth = 1; c.beginPath(); for (let i = 1; i < 4; i++) { c.moveTo(x - w + i * w * 0.5, gy); c.lineTo(x, gy - h); } c.stroke();
        poly(c, [[x - w * 0.22, gy + 2 * k], [x, gy - h * 0.45], [x + w * 0.22, gy + 2 * k]]); c.fillStyle = '#3a2818'; c.fill();
        c.strokeStyle = '#5a3a20'; c.lineWidth = 2 * k; c.beginPath(); c.moveTo(x - 6 * k * s, gy - h - 8 * k * s); c.lineTo(x + 3 * k, gy - h + 5 * k); c.moveTo(x + 6 * k * s, gy - h - 8 * k * s); c.lineTo(x - 3 * k, gy - h + 5 * k); c.stroke();
      }
      c.fillStyle = '#6a6a6a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(cx + (-6 + i * 2.6) * k * 1.3, gy + 10 * k, 3 * k, 2 * k, 0, 0, 7); c.fill(); }
      flame(c, cx, gy + 9 * k, 6 * k, t);
      person(c, cx - 24 * k, gy + 14 * k, 26 * k, '#8a6a44', '#a87a58', t, 0); person(c, cx + 25 * k, gy + 15 * k, 24 * k, '#7a5a3a', '#9a6a48', t, 2);
    } },
    { from: -9700, name: 'Göbekli Tepe', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'day'); hills(c, W, gy - 30 * k, 18 * k, '#c8b088', 2);
      ground(c, W, H, gy, '#c8a870', '#9a7a48');
      c.beginPath(); c.ellipse(cx, gy + 8 * k, 140 * k, 26 * k, 0, 0, 7); c.fillStyle = '#b89a68'; c.fill();
      c.beginPath(); c.ellipse(cx, gy + 10 * k, 120 * k, 20 * k, 0, 0, 7); c.fillStyle = '#a88a5a'; c.fill();
      const P = [[-100, 0.75, 4], [-62, 0.9, 0], [-20, 1, -2], [24, 1, -2], [66, 0.9, 0], [104, 0.75, 4]];
      for (const [dx, s, dy] of P) {   /* stâlpi în formă de T, cu animale sculptate */
        const x = cx + dx * k, y = gy + (dy + 6) * k, h = 62 * k * s, w = 11 * k * s;
        c.beginPath(); c.rect(x - w / 2, y - h, w, h); fillV(c, '#d8c49c', x - w / 2, 0, x + w / 2, 0, 0.12, 0.3); edge(c, 'rgba(90,70,40,0.5)');
        c.beginPath(); c.rect(x - w * 1.5, y - h - 10 * k * s, w * 3, 11 * k * s); fillV(c, '#e0ceaa', 0, y - h - 10 * k * s, 0, y - h, 0.1, 0.25); edge(c, 'rgba(90,70,40,0.5)');
        c.strokeStyle = 'rgba(110,85,50,0.7)'; c.lineWidth = 1.2 * k; c.beginPath(); c.moveTo(x - w * 0.3, y - h * 0.55); c.quadraticCurveTo(x, y - h * 0.65, x + w * 0.3, y - h * 0.55); c.lineTo(x + w * 0.2, y - h * 0.45); c.moveTo(x - w * 0.2, y - h * 0.55); c.lineTo(x - w * 0.25, y - h * 0.42); c.stroke();
      }
      person(c, cx - 140 * k, gy + 16 * k, 26 * k, '#8a6a44', '#a87a58', t, 1); person(c, cx + 140 * k, gy + 16 * k, 26 * k, '#7a5a3a', '#9a6a48', t, 3);
    } },
    { from: -9000, name: 'Sat de agricultori', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'day'); hills(c, W, gy - 34 * k, 18 * k, '#9ab08a', 3); hills(c, W, gy - 10 * k, 8 * k, '#8aa86a', 6);
      ground(c, W, H, gy, '#9ab05a', '#6a8a3a');
      /* lan de grâu care se leagănă */
      const fx0 = cx + 20 * k, fx1 = Math.min(W - 10 * k, cx + 220 * k);
      c.fillStyle = '#c8a446'; c.fillRect(fx0, gy - 2 * k, fx1 - fx0, H - gy);
      c.strokeStyle = '#a88430'; c.lineWidth = 1.1 * k; c.beginPath();
      for (let r = 0; r < 5; r++) for (let x = fx0 + 3 * k; x < fx1; x += 6 * k) { const y = gy + r * 9 * k + 4 * k, sw = Math.sin(t * 1.3 + x * 0.05 + r) * 2 * k; c.moveTo(x, y + 6 * k); c.quadraticCurveTo(x + sw * 0.5, y, x + sw, y - 7 * k); }
      c.stroke(); c.fillStyle = '#e8c45a'; for (let r = 0; r < 5; r++) for (let x = fx0 + 3 * k; x < fx1; x += 6 * k) { const y = gy + r * 9 * k + 4 * k, sw = Math.sin(t * 1.3 + x * 0.05 + r) * 2 * k; c.beginPath(); c.ellipse(x + sw, y - 9 * k, 1.4 * k, 3 * k, sw * 0.05, 0, 7); c.fill(); }
      for (const [dx, s] of [[-140, 0.8], [-80, 1], [-25, 0.85]]) {  /* case rotunde cu acoperiș de stuf */
        const x = cx + dx * k, w = 26 * k * s, h = 22 * k * s;
        c.beginPath(); c.rect(x - w, gy - h, w * 2, h + 2 * k); fillV(c, '#c8a070', x - w, 0, x + w, 0, 0.12, 0.25); edge(c, 'rgba(80,55,30,0.5)');
        c.beginPath(); c.moveTo(x - w * 1.25, gy - h + 2 * k); c.quadraticCurveTo(x - w * 0.6, gy - h - h * 0.9, x, gy - h - h * 1.25); c.quadraticCurveTo(x + w * 0.6, gy - h - h * 0.9, x + w * 1.25, gy - h + 2 * k); c.closePath(); fillV(c, '#c0984a', x - w, gy - h * 2, x + w, gy - h, 0.2, 0.25); edge(c, 'rgba(90,60,20,0.5)');
        c.strokeStyle = 'rgba(120,85,30,0.6)'; c.lineWidth = 0.8 * k; c.beginPath(); for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6; c.moveTo(lerp(x - w * 1.1, x + w * 1.1, u), gy - h); c.lineTo(lerp(x - w * 0.3, x + w * 0.3, u), gy - h - h * 1.0); } c.stroke();
        c.beginPath(); c.moveTo(x - 5 * k * s, gy + 2 * k); c.lineTo(x - 5 * k * s, gy - h * 0.6); c.quadraticCurveTo(x, gy - h * 0.8, x + 5 * k * s, gy - h * 0.6); c.lineTo(x + 5 * k * s, gy + 2 * k); c.fillStyle = '#4a3220'; c.fill();
      }
      for (const [dx, ph] of [[-190, 0], [-170, 2]]) { const x = cx + dx * k, y = gy + 18 * k, b = Math.sin(t * 0.8 + ph) * k; /* oi */
        c.fillStyle = '#f2ece0'; c.beginPath(); c.ellipse(x, y - 8 * k + b, 10 * k, 6.5 * k, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(120,110,90,0.5)'; c.lineWidth = 1; c.stroke();
        c.fillStyle = '#3a3026'; c.beginPath(); c.ellipse(x + 10 * k, y - 10 * k + b, 3.5 * k, 2.6 * k, 0.4, 0, 7); c.fill(); c.fillRect(x - 6 * k, y - 3 * k, 1.6 * k, 4 * k); c.fillRect(x + 5 * k, y - 3 * k, 1.6 * k, 4 * k); }
      person(c, cx + 5 * k, gy + 20 * k, 26 * k, '#a8784a', '#b88a62', t, 1);
    } },
    { from: -7200, name: 'Sat mare (Çatalhöyük, Cucuteni)', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'day'); hills(c, W, gy - 30 * k, 16 * k, '#a8b08a', 5);
      ground(c, W, H, gy, '#b8a066', '#8a7040');
      const B = [[-150, 30, 34], [-112, 22, 46], [-70, 34, 36], [-30, 26, 52], [12, 30, 40], [50, 22, 48], [88, 32, 34], [126, 26, 42], [164, 30, 30]];
      for (const [dx, w, h] of B) {   /* case de chirpici lipite, cu intrare pe acoperiș */
        const x = cx + dx * k, ww = w * k, hh = h * k;
        box(c, x - ww / 2, gy - hh, ww, hh + 2 * k, '#d6b486', 6 * k);
        c.fillStyle = S('#d6b486', 0.12); poly(c, [[x - ww / 2, gy - hh], [x - ww / 2 + 6 * k, gy - hh - 3 * k], [x + ww / 2 + 6 * k, gy - hh - 3 * k], [x + ww / 2, gy - hh]]); c.fill();
        c.fillStyle = '#4a3420'; c.fillRect(x - 4 * k, gy - hh - 2.5 * k, 8 * k, 2.4 * k);
      }
      const lx = cx - 30 * k, ly = gy - 52 * k; c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.4 * k; c.beginPath(); c.moveTo(lx - 3 * k, ly - 3 * k); c.lineTo(lx - 2 * k, ly - 20 * k); c.moveTo(lx + 3 * k, ly - 3 * k); c.lineTo(lx + 4 * k, ly - 20 * k); for (let i = 0; i < 4; i++) { c.moveTo(lx - 2.6 * k, ly - 6 * k - i * 4 * k); c.lineTo(lx + 3.4 * k, ly - 6 * k - i * 4 * k); } c.stroke();
      /* vas Cucuteni în prim-plan */
      c.save(); c.translate(cx + 120 * k, gy + 26 * k); c.scale(16 * k, 16 * k); ICON.pot(c); c.restore();
      person(c, cx - 175 * k, gy + 22 * k, 26 * k, '#9a6a3a', '#b88a62', t, 0); person(c, cx + 80 * k, gy + 24 * k, 24 * k, '#7a8a5a', '#a87a58', t, 2);
    } },
    { from: -3600, name: 'Sumer: zigurat, roată și scriere', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'day'); ground(c, W, H, gy, '#d8b878', '#a88850');
      c.fillStyle = '#5a9ad0'; c.beginPath(); c.moveTo(0, gy + 30 * k); c.quadraticCurveTo(W * 0.5, gy + 20 * k, W, gy + 34 * k); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      const L = [[150, 26], [112, 22], [76, 20]]; let y = gy;
      for (const [w, h] of L) { c.beginPath(); c.rect(cx - w * k / 2, y - h * k, w * k, h * k); fillV(c, '#c89a62', cx - w * k / 2, 0, cx + w * k / 2, 0, 0.15, 0.3); edge(c, 'rgba(90,60,30,0.5)'); c.strokeStyle = 'rgba(110,75,40,0.35)'; c.lineWidth = 1; c.beginPath(); for (let i = 1; i < 4; i++) { c.moveTo(cx - w * k / 2, y - h * k * i / 4); c.lineTo(cx + w * k / 2, y - h * k * i / 4); } c.stroke(); y -= h * k; }
      c.beginPath(); c.rect(cx - 16 * k, y - 16 * k, 32 * k, 16 * k); fillV(c, '#3a6ab0', cx - 16 * k, 0, cx + 16 * k, 0, 0.2, 0.3); edge(c);
      poly(c, [[cx - 10 * k, gy], [cx - 4 * k, gy - 68 * k], [cx + 4 * k, gy - 68 * k], [cx + 10 * k, gy]]); c.fillStyle = '#b08858'; c.fill();
      /* car cu roți pline */
      const wx = cx - 150 * k + ((t * 6 * k) % (40 * k)), wy = gy + 16 * k;
      c.beginPath(); c.rect(wx - 22 * k, wy - 22 * k, 34 * k, 12 * k); fillV(c, '#8a6038', 0, wy - 22 * k, 0, wy - 10 * k); edge(c);
      for (const dx of [-14, 6]) { c.save(); c.translate(wx + dx * k, wy - 6 * k); c.rotate(t * 1.2); c.scale(8 * k, 8 * k); ICON.wheel(c); c.restore(); }
      c.fillStyle = '#8a7a6a'; c.beginPath(); c.ellipse(wx + 26 * k, wy - 14 * k, 11 * k, 7 * k, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(wx + 37 * k, wy - 20 * k, 4.5 * k, 3.5 * k, 0.5, 0, 7); c.fill(); c.fillRect(wx + 18 * k, wy - 9 * k, 2 * k, 8 * k); c.fillRect(wx + 31 * k, wy - 9 * k, 2 * k, 8 * k);
      c.save(); c.translate(cx + 135 * k, gy + 12 * k); c.scale(13 * k, 13 * k); ICON.tablet(c); c.restore();
      person(c, cx + 105 * k, gy + 24 * k, 26 * k, '#e8e0c8', '#a87a58', t, 1);
      tree(c, cx + 190 * k, gy + 2 * k, 50 * k, '#4a8a3a', 'palm'); tree(c, cx - 200 * k, gy + 2 * k, 44 * k, '#4a8a3a', 'palm');
    } },
    { from: -3150, name: 'Egiptul Antic', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'day'); ground(c, W, H, gy, '#e2c07a', '#b89050');
      c.fillStyle = '#f6d56a'; c.beginPath(); c.arc(cx + 150 * k, gy - 110 * k, 13 * k, 0, 7); c.fill();
      for (const [dx, s] of [[-90, 1], [10, 0.75], [85, 0.5]]) {    /* piramidele de la Giza */
        const x = cx + dx * k, w = 80 * k * s, h = 92 * k * s;
        poly(c, [[x - w, gy + 2 * k], [x, gy - h], [x + w, gy + 2 * k]]); c.fillStyle = '#e8c890'; c.fill();
        poly(c, [[x, gy - h], [x + w, gy + 2 * k], [x + w * 0.28, gy + 2 * k]]); c.fillStyle = '#b8925a'; c.fill();
        c.strokeStyle = 'rgba(140,105,60,0.35)'; c.lineWidth = 0.8; c.beginPath(); for (let i = 1; i < 9; i++) { const yy = gy - h + h * i / 9, hw = w * i / 9; c.moveTo(x - hw, yy); c.lineTo(x + hw * 0.28, yy); } c.stroke();
        if (s === 1) { poly(c, [[x - w * 0.09, gy - h * 0.91], [x, gy - h], [x + w * 0.09, gy - h * 0.91]]); c.fillStyle = '#f6eede'; c.fill(); }
      }
      c.fillStyle = '#4a90c8'; c.beginPath(); c.moveTo(0, gy + 26 * k); c.quadraticCurveTo(W * 0.5, gy + 16 * k, W, gy + 30 * k); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      c.fillStyle = '#6aa84a'; c.fillRect(0, gy + 20 * k, W, 4 * k);
      const bx = cx + 60 * k + Math.sin(t * 0.25) * 30 * k, by = gy + 40 * k + Math.sin(t) * k;      /* barcă de papirus */
      c.beginPath(); c.moveTo(bx - 34 * k, by - 8 * k); c.quadraticCurveTo(bx, by + 6 * k, bx + 34 * k, by - 8 * k); c.quadraticCurveTo(bx, by - 1 * k, bx - 34 * k, by - 8 * k); fillV(c, '#c8a450', 0, by - 8 * k, 0, by + 4 * k); edge(c);
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.4 * k; c.beginPath(); c.moveTo(bx, by - 3 * k); c.lineTo(bx, by - 40 * k); c.stroke();
      c.beginPath(); c.moveTo(bx - 1 * k, by - 38 * k); c.lineTo(bx + 18 * k, by - 34 * k); c.lineTo(bx + 16 * k, by - 10 * k); c.lineTo(bx - 1 * k, by - 9 * k); fillV(c, '#f2ead6', bx, 0, bx + 18 * k, 0, 0.05, 0.2);
      tree(c, cx - 190 * k, gy + 18 * k, 54 * k, '#4a8a3a', 'palm'); tree(c, cx - 165 * k, gy + 20 * k, 42 * k, '#3f7a34', 'palm'); tree(c, cx + 195 * k, gy + 18 * k, 48 * k, '#4a8a3a', 'palm');
      person(c, cx - 130 * k, gy + 18 * k, 26 * k, '#f2ead6', '#a8704a', t, 0, '#2a2a2a');
    } },
    { from: -1200, name: 'Grecia antică', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'day'); c.fillStyle = '#3a7ab8'; c.fillRect(0, gy - 26 * k, W, 26 * k);
      hills(c, W, gy - 10 * k, 18 * k, '#a8a878', 7);
      c.beginPath(); c.moveTo(cx - 170 * k, gy + 4 * k); c.quadraticCurveTo(cx - 120 * k, gy - 40 * k, cx - 60 * k, gy - 44 * k); c.lineTo(cx + 90 * k, gy - 44 * k); c.quadraticCurveTo(cx + 150 * k, gy - 40 * k, cx + 190 * k, gy + 4 * k); c.closePath(); fillV(c, '#b8a47a', 0, gy - 44 * k, 0, gy, 0.1, 0.2);
      ground(c, W, H, gy, '#a8a46a', '#7a7a48');
      const tx = cx + 15 * k, ty = gy - 44 * k, tw = 140 * k;     /* templu dorian (ca Parthenonul) */
      c.fillStyle = '#e2d8c0'; c.fillRect(tx - tw / 2 - 6 * k, ty - 8 * k, tw + 12 * k, 8 * k); c.fillStyle = '#d4c8ac'; c.fillRect(tx - tw / 2 - 10 * k, ty - 3 * k, tw + 20 * k, 4 * k);
      const ch = 48 * k; for (let i = 0; i < 8; i++) { const x = tx - tw / 2 + 6 * k + i * (tw - 12 * k) / 7; c.beginPath(); c.moveTo(x - 4.5 * k, ty - 8 * k); c.lineTo(x - 3.8 * k, ty - 8 * k - ch); c.lineTo(x + 3.8 * k, ty - 8 * k - ch); c.lineTo(x + 4.5 * k, ty - 8 * k); fillV(c, '#f4ecda', x - 5 * k, 0, x + 5 * k, 0, 0.1, 0.28); c.strokeStyle = 'rgba(150,135,105,0.6)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(x - 1.4 * k, ty - 9 * k); c.lineTo(x - 1.2 * k, ty - 7 * k - ch); c.moveTo(x + 1.4 * k, ty - 9 * k); c.lineTo(x + 1.2 * k, ty - 7 * k - ch); c.stroke(); c.fillStyle = '#e8dcc4'; c.fillRect(x - 6 * k, ty - 11 * k - ch, 12 * k, 3 * k); }
      const ey = ty - 11 * k - ch; c.fillStyle = '#e8dcc4'; c.fillRect(tx - tw / 2 - 4 * k, ey - 9 * k, tw + 8 * k, 9 * k); c.fillStyle = '#d2c6a8'; for (let i = 0; i < 16; i++) c.fillRect(tx - tw / 2 + i * tw / 16, ey - 7 * k, 2 * k, 5 * k);
      poly(c, [[tx - tw / 2 - 6 * k, ey - 9 * k], [tx, ey - 30 * k], [tx + tw / 2 + 6 * k, ey - 9 * k]]); fillV(c, '#efe6d2', 0, ey - 30 * k, 0, ey - 9 * k, 0.1, 0.15); edge(c, 'rgba(120,105,80,0.5)');
      tree(c, cx - 190 * k, gy + 8 * k, 46 * k, '#2f5a32', 'cypress'); tree(c, cx - 176 * k, gy + 10 * k, 36 * k, '#2f5a32', 'cypress'); tree(c, cx + 200 * k, gy + 10 * k, 40 * k, '#6a8a4a');
      person(c, cx - 90 * k, gy + 18 * k, 26 * k, '#f4f0e6', '#c89a72', t, 0); person(c, cx + 120 * k, gy + 20 * k, 25 * k, '#4a6ab0', '#c89a72', t, 2);
    } },
    { from: -100, name: 'Roma: apeduct și drum', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'day'); hills(c, W, gy - 36 * k, 20 * k, '#8aa87a', 8); hills(c, W, gy - 12 * k, 10 * k, '#7a9a5a', 9);
      ground(c, W, H, gy, '#8aa85a', '#5a7a3a');
      const ax0 = 0, ax1 = W, ah = 76 * k, top = gy - ah;   /* apeduct pe două niveluri de arcade */
      c.beginPath(); c.rect(ax0, top, ax1 - ax0, ah + 2 * k);
      const s1 = 34 * k, s2 = 17 * k, off = (cx % s1);
      for (let x = off - s1; x < W + s1; x += s1) { const r = s1 * 0.36; c.moveTo(x + r, gy + 2 * k); c.lineTo(x + r, gy - 24 * k); c.arc(x, gy - 24 * k, r, 0, Math.PI, true); c.lineTo(x - r, gy + 2 * k); }
      for (let x = off - s2; x < W + s2; x += s2) { const r = s2 * 0.34; c.moveTo(x + r, top + 30 * k); c.lineTo(x + r, top + 16 * k); c.arc(x, top + 16 * k, r, 0, Math.PI, true); c.lineTo(x - r, top + 30 * k); }
      const g = c.createLinearGradient(0, top, 0, gy); g.addColorStop(0, '#e2c696'); g.addColorStop(1, '#c8a472'); c.fillStyle = g; c.fill('evenodd'); c.strokeStyle = 'rgba(110,80,45,0.45)'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#c09a68'; c.fillRect(0, top + 30 * k, W, 3 * k); c.fillRect(0, top - 4 * k, W, 5 * k); c.fillStyle = '#6aaad8'; c.fillRect(0, top - 6 * k, W, 2 * k);
      c.fillStyle = '#9a9488'; c.beginPath(); c.moveTo(cx - 40 * k, H); c.lineTo(cx - 8 * k, gy + 4 * k); c.lineTo(cx + 8 * k, gy + 4 * k); c.lineTo(cx + 60 * k, H); c.fill();
      c.strokeStyle = 'rgba(70,65,55,0.45)'; c.lineWidth = 0.8; c.beginPath(); for (let i = 1; i < 6; i++) { const y = gy + 4 * k + (H - gy) * i / 6, hw = lerp(8, 50, i / 6) * k; c.moveTo(cx - hw + 5 * k * i / 6, y); c.lineTo(cx + hw + 5 * k * i / 6, y); } c.stroke();
      person(c, cx + 30 * k, gy + 30 * k, 28 * k, '#b03a2a', '#c89a72', t, 0); person(c, cx - 60 * k, gy + 24 * k, 26 * k, '#f2ead8', '#b88a62', t, 2);
      tree(c, cx - 170 * k, gy + 20 * k, 44 * k, '#2f5a32', 'cypress'); tree(c, cx + 160 * k, gy + 22 * k, 50 * k, '#2f5a32', 'cypress');
    } },
    { from: 476, name: 'Evul Mediu: castel', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'day'); hills(c, W, gy - 26 * k, 14 * k, '#8aa07a', 10);
      c.beginPath(); c.moveTo(cx - 190 * k, gy + 4 * k); c.quadraticCurveTo(cx - 60 * k, gy - 30 * k, cx + 10 * k, gy - 32 * k); c.quadraticCurveTo(cx + 110 * k, gy - 28 * k, cx + 210 * k, gy + 4 * k); c.closePath(); fillV(c, '#7a9a5a', 0, gy - 32 * k, 0, gy, 0.12, 0.2);
      ground(c, W, H, gy, '#7a9a4a', '#56762e');
      const st = '#bab2a2', by = gy - 28 * k;
      const wall = (x, y, w, h) => { c.beginPath(); c.rect(x, y, w, h); fillV(c, st, x, 0, x + w, 0, 0.12, 0.25); edge(c, 'rgba(70,65,55,0.5)'); c.fillStyle = st; for (let i = 0; i < w / (8 * k) - 1; i++) { c.fillRect(x + i * 8 * k, y - 4 * k, 5 * k, 4 * k); } };
      wall(cx - 70 * k, by - 34 * k, 140 * k, 36 * k);
      for (const [dx, h, w] of [[-80, 58, 26], [62, 58, 26], [-14, 78, 30]]) { const x = cx + dx * k; wall(x, by - h * k, w * k, h * k + 2 * k); poly(c, [[x - 3 * k, by - h * k], [x + w * k / 2, by - h * k - 26 * k], [x + w * k + 3 * k, by - h * k]]); fillV(c, '#4a5a8a', x, 0, x + w * k, 0, 0.15, 0.3); c.fillStyle = '#2a2420'; for (const yy of [0.35, 0.6]) { c.beginPath(); c.moveTo(x + w * k / 2 - 2 * k, by - h * k * (1 - yy) + 6 * k); c.lineTo(x + w * k / 2 - 2 * k, by - h * k * (1 - yy)); c.arc(x + w * k / 2, by - h * k * (1 - yy), 2 * k, Math.PI, 0); c.lineTo(x + w * k / 2 + 2 * k, by - h * k * (1 - yy) + 6 * k); c.fill(); } }
      const fx = cx + 1 * k, fy = by - 78 * k - 26 * k; c.strokeStyle = '#5a4a3a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, fy - 16 * k); c.stroke();
      c.fillStyle = '#c0392b'; c.beginPath(); c.moveTo(fx, fy - 16 * k); c.quadraticCurveTo(fx + 8 * k, fy - 16 * k + Math.sin(t * 2) * 2 * k, fx + 15 * k, fy - 13 * k); c.quadraticCurveTo(fx + 8 * k, fy - 10 * k + Math.sin(t * 2 + 1) * 2 * k, fx, fy - 9 * k); c.fill();
      c.beginPath(); c.moveTo(cx - 9 * k, by + 2 * k); c.lineTo(cx - 9 * k, by - 16 * k); c.arc(cx, by - 16 * k, 9 * k, Math.PI, 0); c.lineTo(cx + 9 * k, by + 2 * k); c.fillStyle = '#3a2a1e'; c.fill();
      for (const [dx, col] of [[-170, '#d8c49a'], [-140, '#e0cca4'], [150, '#d8c49a']]) { const x = cx + dx * k; box(c, x - 12 * k, gy - 16 * k + 14 * k, 24 * k, 16 * k, col, 0); poly(c, [[x - 15 * k, gy + 14 * k - 16 * k], [x, gy + 14 * k - 30 * k], [x + 15 * k, gy + 14 * k - 16 * k]]); c.fillStyle = '#8a4a2a'; c.fill(); c.fillStyle = '#4a3020'; c.fillRect(x - 3 * k, gy + 14 * k - 9 * k, 6 * k, 9 * k); }
      person(c, cx - 110 * k, gy + 24 * k, 26 * k, '#3a5a8a', '#c89a72', t, 0); person(c, cx + 110 * k, gy + 26 * k, 26 * k, '#7a3a3a', '#c89a72', t, 2, '#5a4030');
    } },
    { from: 1450, name: 'Port și corăbii', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'day'); c.fillStyle = '#3a80c0'; c.fillRect(0, gy - 8 * k, W, H - gy + 8 * k);
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; c.beginPath(); for (let r = 0; r < 4; r++) for (let x = ((t * 8 + r * 20) % 40) - 40; x < W; x += 40 * k) { const y = gy + r * 12 * k + 6 * k; c.moveTo(x, y); c.quadraticCurveTo(x + 6 * k, y - 2 * k, x + 12 * k, y); } c.stroke();
      const qx = cx - 200 * k; c.fillStyle = '#8a7a66'; c.fillRect(qx, gy - 4 * k, 150 * k, 10 * k);
      const HS = [[0, 38, '#e8dcc0', '#a8482a'], [28, 46, '#f0e6cc', '#8a3a24'], [58, 34, '#e0d0b0', '#a8482a'], [86, 42, '#ece0c4', '#7a3420'], [114, 36, '#e8d8bc', '#a8482a']];
      for (const [dx, h, col, roof] of HS) {   /* case cu structură de lemn (stil renascentist nordic) */
        const x = qx + dx * k + 4 * k, w = 26 * k, y = gy - 4 * k - h * k;
        c.beginPath(); c.rect(x, y, w, h * k); fillV(c, col, x, 0, x + w, 0, 0.1, 0.2); edge(c, 'rgba(70,45,25,0.6)');
        c.strokeStyle = '#5a3a22'; c.lineWidth = 1.3 * k; c.beginPath(); c.moveTo(x, y + h * k * 0.5); c.lineTo(x + w, y + h * k * 0.5); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h * k); c.moveTo(x, y); c.lineTo(x + w / 2, y + h * k * 0.5); c.moveTo(x + w, y); c.lineTo(x + w / 2, y + h * k * 0.5); c.stroke();
        poly(c, [[x - 2 * k, y], [x + w / 2, y - 18 * k], [x + w + 2 * k, y]]); c.fillStyle = roof; c.fill();
        c.fillStyle = '#4a6a8a'; c.fillRect(x + 4 * k, y + h * k * 0.62, 5 * k, 6 * k); c.fillRect(x + w - 9 * k, y + h * k * 0.62, 5 * k, 6 * k);
      }
      const sx = cx + 90 * k + Math.sin(t * 0.2) * 20 * k, sy = gy + 26 * k + Math.sin(t * 0.9) * 1.5 * k, rk = Math.sin(t * 0.9) * 0.025;  /* caravelă */
      c.save(); c.translate(sx, sy); c.rotate(rk); c.scale(52 * k, 52 * k); c.translate(0, -0.2); ICON.ship(c); c.restore();
      c.fillStyle = '#3a80c0'; c.fillRect(sx - 60 * k, sy + 10 * k, 120 * k, 8 * k);
      for (let i = 0; i < 2; i++) { const bx = ((t * 6 + i * 200) % (W + 60)) - 30, by = gy - 60 * k - i * 14 * k; c.strokeStyle = '#4a4a4a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(bx - 4 * k, by); c.quadraticCurveTo(bx - 2 * k, by - 3 * k, bx, by); c.quadraticCurveTo(bx + 2 * k, by - 3 * k, bx + 4 * k, by); c.stroke(); }
      person(c, qx + 130 * k, gy - 4 * k, 24 * k, '#2a3a5a', '#c89a72', t, 1, '#1a1a1a');
    } },
    { from: 1760, name: 'Revoluția industrială', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'smog'); hills(c, W, gy - 18 * k, 10 * k, '#8a9078', 11);
      ground(c, W, H, gy, '#7a7a5a', '#5a5a42');
      const fx = cx - 120 * k, fw = 170 * k;   /* fabrică de cărămidă cu acoperiș în dinți de fierăstrău */
      c.beginPath(); c.moveTo(fx, gy + 2 * k); c.lineTo(fx, gy - 40 * k); for (let i = 0; i < 5; i++) { const x = fx + i * fw / 5; c.lineTo(x + fw / 5 * 0.7, gy - 62 * k); c.lineTo(x + fw / 5 * 0.7, gy - 40 * k); c.lineTo(x + fw / 5, gy - 40 * k); } c.lineTo(fx + fw, gy + 2 * k); c.closePath(); fillV(c, '#a8583a', fx, 0, fx + fw, 0, 0.12, 0.25); edge(c, 'rgba(60,25,10,0.5)');
      c.strokeStyle = 'rgba(80,35,15,0.25)'; c.lineWidth = 0.7; c.beginPath(); for (let y = gy - 36 * k; y < gy; y += 4 * k) { c.moveTo(fx, y); c.lineTo(fx + fw, y); } c.stroke();
      c.fillStyle = '#f0d890'; for (let i = 0; i < 6; i++) { const x = fx + 10 * k + i * 26 * k; c.beginPath(); c.moveTo(x, gy - 8 * k); c.lineTo(x, gy - 24 * k); c.arc(x + 6 * k, gy - 24 * k, 6 * k, Math.PI, 0); c.lineTo(x + 12 * k, gy - 8 * k); c.fill(); }
      for (const [dx, h] of [[20, 110], [60, 92]]) { const x = fx + dx * k; c.beginPath(); c.moveTo(x - 6 * k, gy - 40 * k); c.lineTo(x - 4.5 * k, gy - h * k); c.lineTo(x + 4.5 * k, gy - h * k); c.lineTo(x + 6 * k, gy - 40 * k); fillV(c, '#8a3a24', x - 6 * k, 0, x + 6 * k, 0, 0.15, 0.25); c.fillStyle = '#5a2414'; c.fillRect(x - 5.5 * k, gy - h * k - 3 * k, 11 * k, 4 * k); smoke(c, x, gy - h * k - 4 * k, 6 * k, t + dx, '#6a6a6a'); }
      /* locomotivă cu abur pe șine */
      c.fillStyle = '#5a4a3a'; c.fillRect(0, gy + 22 * k, W, 3 * k); c.fillStyle = '#6a5a48'; for (let x = 0; x < W; x += 9 * k) c.fillRect(x, gy + 24 * k, 5 * k, 3 * k);
      const lx = ((t * 14 * k) % (W + 260 * k)) - 130 * k + 0, ly = gy + 22 * k;
      for (const [dx, r] of [[-26, 8], [-8, 8], [14, 6]]) { c.save(); c.translate(lx + dx * k, ly - r * k); c.rotate(t * 3); c.beginPath(); c.arc(0, 0, r * k, 0, 7); c.fillStyle = '#2a2a2e'; c.fill(); c.strokeStyle = '#c0392b'; c.lineWidth = 1.2 * k; c.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; c.moveTo(Math.cos(a) * r * k * 0.85, Math.sin(a) * r * k * 0.85); c.lineTo(-Math.cos(a) * r * k * 0.85, -Math.sin(a) * r * k * 0.85); } c.stroke(); c.restore(); }
      c.beginPath(); c.rect(lx - 22 * k, ly - 30 * k, 38 * k, 13 * k); fillV(c, '#2e3a32', 0, ly - 30 * k, 0, ly - 17 * k, 0.25, 0.2); edge(c);
      c.beginPath(); c.rect(lx - 40 * k, ly - 40 * k, 20 * k, 23 * k); fillV(c, '#3a2e2a', 0, ly - 40 * k, 0, ly - 17 * k, 0.2, 0.2); edge(c); c.fillStyle = '#f0d890'; c.fillRect(lx - 35 * k, ly - 36 * k, 9 * k, 7 * k);
      c.fillStyle = '#2a2a2a'; c.fillRect(lx + 4 * k, ly - 42 * k, 6 * k, 12 * k); poly(c, [[lx + 2 * k, ly - 42 * k], [lx + 12 * k, ly - 42 * k], [lx + 14 * k, ly - 47 * k], [lx, ly - 47 * k]]); c.fill();
      c.fillStyle = '#c8a040'; c.fillRect(lx - 22 * k, ly - 25 * k, 38 * k, 1.5 * k);
      smoke(c, lx + 7 * k, ly - 48 * k, 5 * k, t * 1.5, '#d0d0d0');
      person(c, cx + 150 * k, gy + 16 * k, 26 * k, '#3a3a4a', '#c89a72', t, 0, '#1a1a1a'); person(c, cx + 175 * k, gy + 16 * k, 23 * k, '#7a3a4a', '#c89a72', t, 2);
    } },
    { from: 1900, name: 'Orașul secolului XX', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'day'); ground(c, W, H, gy, '#7a8a7a', '#5a665a');
      const B = [[-200, 40, 70, '#c8b8a0'], [-155, 34, 110, '#a8b4c4'], [-115, 44, 84, '#d8c8a8'], [-62, 30, 150, '#b8c4d0'], [-26, 40, 96, '#c8a888'], [20, 36, 128, '#9fb0c4'], [62, 44, 76, '#d0c0a4'], [110, 34, 118, '#b0bccc'], [150, 40, 90, '#c8b098'], [195, 36, 66, '#a8b8c8']];
      for (const [dx, w, h0, col] of B) { const h = h0 * 0.55, x = cx + dx * k, y = gy - h * k; c.beginPath(); c.rect(x - w * k / 2, y, w * k, h * k + 2 * k); fillV(c, col, x - w * k / 2, 0, x + w * k / 2, 0, 0.12, 0.25); edge(c, 'rgba(50,55,70,0.45)'); c.fillStyle = 'rgba(60,80,110,0.55)'; for (let r = 0; r < h / 12 - 1; r++) for (let q = 0; q < w / 10; q++) c.fillRect(x - w * k / 2 + (3 + q * 10) * k, y + (6 + r * 12) * k, 5 * k, 6 * k); }
      const tx = cx - 62 * k, ty = gy - 150 * 0.55 * k; poly(c, [[tx - 8 * k, ty], [tx, ty - 26 * k], [tx + 8 * k, ty]]); c.fillStyle = '#c8d0d8'; c.fill(); c.strokeStyle = '#8a96a6'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(tx, ty - 26 * k); c.lineTo(tx, ty - 40 * k); c.stroke();
      c.fillStyle = '#4a4e56'; c.fillRect(0, gy + 6 * k, W, 14 * k); c.fillStyle = '#e8e0a0'; for (let x = 0; x < W; x += 20 * k) c.fillRect(x, gy + 12 * k, 10 * k, 1.5 * k);
      const carX = ((t * 30 * k) % (W + 80 * k)) - 40 * k; c.beginPath(); Art.roundRectPath(c, carX - 16 * k, gy + 2 * k, 32 * k, 9 * k, 3 * k); fillV(c, '#c0392b', 0, gy, 0, gy + 11 * k, 0.25, 0.2); c.beginPath(); Art.roundRectPath(c, carX - 9 * k, gy - 4 * k, 16 * k, 7 * k, 3 * k); c.fillStyle = '#9a2a20'; c.fill(); c.fillStyle = '#bfe0f0'; c.fillRect(carX - 6 * k, gy - 2.5 * k, 5 * k, 4 * k); c.fillRect(carX, gy - 2.5 * k, 5 * k, 4 * k); c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(carX - 9 * k, gy + 11 * k, 3.5 * k, 0, 7); c.arc(carX + 9 * k, gy + 11 * k, 3.5 * k, 0, 7); c.fill();
      const px = ((t * 22 * k) % (W + 120 * k)) - 60 * k, py = gy - 112 * k; c.save(); c.translate(px, Math.max(14 * k, py)); c.scale(20 * k, 20 * k); ICON.plane(c); c.restore();
      person(c, cx + 80 * k, gy + 34 * k, 26 * k, '#2a4a7a', '#c89a72', t, 0); person(c, cx + 104 * k, gy + 34 * k, 24 * k, '#8a4a6a', '#c89a72', t, 2);
    } },
    { from: 1990, name: 'Lumea conectată', draw(c, W, H, k, t, gy, cx) {
      sky(c, W, H, 'night'); ground(c, W, H, gy, '#2a3048', '#1a1e30');
      c.fillStyle = 'rgba(255,255,255,0.75)'; let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(rnd() * W, rnd() * (gy - 60 * k), 0.9, 0, 7); c.fill(); }
      c.fillStyle = '#e8e4d0'; c.beginPath(); c.arc(cx + 165 * k, gy - 100 * k, 9 * k, 0, 7); c.fill();
      /* satelit pe orbită */
      const a = t * 0.15, ox = cx + Math.cos(a) * 150 * k, oy = gy - 112 * k + Math.sin(a) * 10 * k;
      c.strokeStyle = 'rgba(160,190,255,0.25)'; c.lineWidth = 1; c.beginPath(); c.ellipse(cx, gy - 112 * k, 150 * k, 10 * k, 0, 0, 7); c.stroke();
      c.save(); c.translate(ox, oy); c.fillStyle = '#3a5ab0'; c.fillRect(-18 * k, -3 * k, 12 * k, 6 * k); c.fillRect(6 * k, -3 * k, 12 * k, 6 * k); c.strokeStyle = 'rgba(200,220,255,0.6)'; c.lineWidth = 0.6; for (const x0 of [-18, 6]) for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo((x0 + i * 4) * k, -3 * k); c.lineTo((x0 + i * 4) * k, 3 * k); c.stroke(); } c.beginPath(); c.rect(-6 * k, -5 * k, 12 * k, 10 * k); fillV(c, '#d8d0b0', -6 * k, 0, 6 * k, 0, 0.2, 0.3); c.restore();
      const B = [[-195, 30, 80], [-160, 34, 140], [-118, 40, 100], [-75, 32, 190], [-38, 38, 130], [5, 44, 210], [52, 34, 150], [92, 40, 120], [134, 32, 176], [172, 38, 96], [210, 30, 70]];
      for (const [dx, w, h0] of B) { const h = h0 * 0.45, x = cx + dx * k, y = gy - h * k; c.beginPath(); c.rect(x - w * k / 2, y, w * k, h * k + 2 * k); const g = c.createLinearGradient(x - w * k / 2, 0, x + w * k / 2, 0); g.addColorStop(0, '#3a4a78'); g.addColorStop(1, '#222c50'); c.fillStyle = g; c.fill(); c.fillStyle = 'rgba(255,220,140,0.75)'; for (let r = 0; r < h / 10 - 1; r++) for (let q = 0; q < w / 8 - 1; q++) if (((r * 7 + q * 3 + dx) % 5) < 2) c.fillRect(x - w * k / 2 + (4 + q * 8) * k, y + (5 + r * 10) * k, 3.5 * k, 4.5 * k); }
      const tx = cx + 5 * k, ty = gy - 210 * 0.45 * k; c.strokeStyle = '#8a96b0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx, ty - 24 * k); c.stroke(); c.fillStyle = '#ff5a5a'; c.beginPath(); c.arc(tx, ty - 24 * k, 2 * k, 0, 7); c.fill();
      /* legături de date între clădiri (internetul) */
      const N = B.map(([dx, w, h]) => [cx + dx * k, gy - h * 0.45 * k]); c.strokeStyle = 'rgba(94,231,255,0.35)'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < N.length - 1; i++) { const m = (N[i][0] + N[i + 1][0]) / 2; c.moveTo(N[i][0], N[i][1]); c.quadraticCurveTo(m, Math.min(N[i][1], N[i + 1][1]) - 30 * k, N[i + 1][0], N[i + 1][1]); } c.stroke();
      c.fillStyle = '#5ee7ff'; for (let i = 0; i < N.length - 1; i++) { const u = (t * 0.25 + i * 0.37) % 1, m = (N[i][0] + N[i + 1][0]) / 2, my = Math.min(N[i][1], N[i + 1][1]) - 30 * k, x = (1 - u) * (1 - u) * N[i][0] + 2 * u * (1 - u) * m + u * u * N[i + 1][0], y = (1 - u) * (1 - u) * N[i][1] + 2 * u * (1 - u) * my + u * u * N[i + 1][1]; c.beginPath(); c.arc(x, y, 1.6 * k, 0, 7); c.fill(); }
    } }
  ];
  const sceneAt = (yr) => { let i = 0; for (let j = 0; j < SCENES.length; j++) if (yr >= SCENES[j].from) i = j; return i; };

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
      function layout() {
        const ph = api.panel ? api.panel.offsetHeight : 0, halfH = Math.max(api.unit, api.H - ph - api.cy);
        const W = api.freeW, top = api.cy - halfH + 4, bottom = api.cy + halfH - 4, avail = bottom - top;
        const narrow = W < 560, medR = clamp(W / 58, 11, 18), dy = medR * 2.15;
        const perY = top + 4, perH = clamp(avail * 0.04, 18, 24);
        const axY = perY + perH + 10 + dy + medR + 2;
        const axB = axY + dy + medR + 8;
        const fBig = Art.fs(api.unit, 0.065, 16), fSm = Art.fs(api.unit, 0.042, 12.5);
        const textH = fBig * 1.3 + fSm * (narrow ? 2.6 : 1.6) + 6;
        const rest = bottom - textH - axB;
        const dioH = Math.max(60, rest * 0.64), popH = Math.max(40, rest - dioH - 10);
        lay = { W, top, bottom, x0: 14, w: W - 28, perY, perH, axY, dy, medR, dioY: axB, dioH, popY: axB + dioH + 10, popH, textY: bottom - textH, fBig, fSm, narrow };
      }
      const markY = (i) => lay.axY + ((i % 3) - 1) * lay.dy;
      function nearest() { let k = 0, bd = 1e9; M.forEach((m, i) => { const d = Math.abs(xOf(m.y) - x); if (d < bd) { bd = d; k = i; } }); return k; }
      api.pointer({ down: (px, py) => { if (!lay) layout(); let best = -1, bd = Math.max(22, lay.medR * 1.5); M.forEach((m, i) => { const mx = lay.x0 + lay.w * xOf(m.y), my = markY(i), d = Math.hypot(px - mx, py - my); if (d < bd) { bd = d; best = i; } }); if (best >= 0) { sel = best; x = xOf(M[best].y); sl.set(x); play = false; bP.innerHTML = '▶ Derulează'; api.say(M[best].e + ' <b>' + M[best].n + '</b> (' + yTxt(M[best].y) + '). ' + M[best].t, 22000); } else if (py > lay.perY) { x = clamp((px - lay.x0) / lay.w, 0, 1); sl.set(x); play = false; } } });
      /* diorama: scena curentă + trecere lină spre următoarea (randată separat, apoi suprapusă) */
      let off = null, sceneA = -1, fadeK = 1, prevScene = -1;
      function drawScene(c, i, w, h, t) { const k = Math.min(h / 165, w / 380), gy = h * 0.76; SCX = w / 2; LWC = Math.max(0.8, Art.lineW(api.unit) * 0.6); c.save(); SCENES[i].draw(c, w, h, k, t, gy, w / 2); c.restore(); }
      let lastInfo = '';
      function frame(dt, t) {
        if (play) { x = Math.min(1, x + dt * 0.03); sl.set(x); if (x >= 1) { play = false; bP.innerHTML = '↺ De la început'; } }
        layout(); const L = lay, dpr = api.DPR || 1;
        ctx.fillStyle = '#14121c'; ctx.fillRect(0, 0, api.W, api.H);
        const X = (y) => L.x0 + L.w * xOf(y), yr = yearOf(x);
        /* perioade */
        PER.forEach((p) => {
          const a = X(p[1]), b = X(p[2]), w = Math.max(2, b - a - 1.5);
          Art.roundRectPath(ctx, a, L.perY, w, L.perH, Math.min(6, w / 2)); ctx.fillStyle = p[3]; ctx.fill();
          const fz = Math.max(12, Math.min(13, L.perH * 0.55)); ctx.save(); ctx.font = Art.font(fz, 700); const tw = ctx.measureText(p[0]).width; ctx.restore();
          if (tw + 8 < w) Art.text(ctx, p[0], a + w / 2, L.perY + L.perH / 2 + 0.5, { size: fz, halo: false });
        });
        const cur = PER.find((p) => yr >= p[1] && yr < p[2]) || PER[PER.length - 1];
        /* axa cu reperele desenate */
        ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L.x0, L.axY); ctx.lineTo(L.x0 + L.w, L.axY); ctx.stroke();
        const nr = nearest(), cxp = L.x0 + L.w * x;
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cxp, L.perY + L.perH + 2); ctx.lineTo(cxp, L.dioY - 4); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1; ctx.beginPath(); M.forEach((m, i) => { const mx = X(m.y); ctx.moveTo(mx, L.axY); ctx.lineTo(mx, markY(i)); }); ctx.stroke();
        M.forEach((m, i) => { if (i === nr) return; const r = L.medR, img = medal(m.ic, r, false, dpr); ctx.drawImage(img, X(m.y) - r - 3, markY(i) - r - 3, (r + 3) * 2, (r + 3) * 2); });
        { const m = M[nr], r = L.medR * 1.35, img = medal(m.ic, r, true, dpr); ctx.drawImage(img, X(m.y) - r - 3, markY(nr) - r - 3, (r + 3) * 2, (r + 3) * 2); }
        /* diorama */
        const dw = Math.min(L.w, L.dioH * 2.8), dx0 = L.x0 + (L.w - dw) / 2, dy0 = L.dioY, dh = L.dioH, rr = 14;
        const si = sceneAt(yr);
        if (si !== sceneA) { prevScene = sceneA; sceneA = si; fadeK = prevScene < 0 ? 1 : 0; }
        fadeK = Math.min(1, fadeK + dt / 0.6);
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.3)'; Art.roundRectPath(ctx, dx0 + 2, dy0 + 5, dw, dh, rr); ctx.fill(); ctx.restore();
        ctx.save(); Art.roundRectPath(ctx, dx0, dy0, dw, dh, rr); ctx.clip(); ctx.translate(dx0, dy0);
        if (fadeK < 1 && prevScene >= 0) {
          drawScene(ctx, prevScene, dw, dh, t);
          const pw = Math.round(dw * dpr), phh = Math.round(dh * dpr);
          if (!off || off.width !== pw || off.height !== phh) { off = document.createElement('canvas'); off.width = pw; off.height = phh; }
          const oc = off.getContext('2d'); oc.setTransform(dpr, 0, 0, dpr, 0, 0); oc.clearRect(0, 0, dw, dh); drawScene(oc, sceneA, dw, dh, t);
          ctx.globalAlpha = Art.ease.inOut(fadeK); ctx.drawImage(off, 0, 0, dw, dh); ctx.globalAlpha = 1;
        } else drawScene(ctx, sceneA, dw, dh, t);
        ctx.restore();
        ctx.save(); Art.roundRectPath(ctx, dx0, dy0, dw, dh, rr); ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
        Art.label(ctx, SCENES[sceneA].name, dx0 + 10, dy0 + 10 + Art.labelSize(api.unit) * 0.9, { size: Art.labelSize(api.unit), align: 'left', bg: Art.LABEL_BG, border: false });
        /* populația: curbă netedă */
        const pY = L.popY, pH = L.popH, base = pY + pH, yOfP = (pp) => base - (pH - 22) * Math.pow(pp / 8.1e9, 0.55);
        Art.roundRectPath(ctx, L.x0, pY, L.w, pH, 12); ctx.fillStyle = '#1c1a28'; ctx.fill();
        Art.text(ctx, 'Câți oameni trăiesc pe Pământ', L.x0 + 12, pY + 13, { size: Math.max(12, L.fSm - 0.5), align: 'left', halo: false, color: 'rgba(235,240,255,0.8)', weight: 700 });
        ctx.save(); Art.roundRectPath(ctx, L.x0, pY, L.w, pH, 12); ctx.clip();
        const curve = []; for (let i = 0; i <= 160; i++) { const xx = i / 160; curve.push([L.x0 + L.w * xx, yOfP(popAt(yearOf(xx)))]); }
        ctx.strokeStyle = 'rgba(150,200,255,0.22)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]); ctx.beginPath(); curve.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.setLineDash([]);
        const past = curve.filter((p) => p[0] <= cxp); past.push([cxp, yOfP(popAt(yr))]);
        ctx.beginPath(); ctx.moveTo(L.x0, base); past.forEach((p) => ctx.lineTo(p[0], p[1])); ctx.lineTo(cxp, base); ctx.closePath();
        const g = ctx.createLinearGradient(0, pY, 0, base); g.addColorStop(0, 'rgba(110,190,255,0.55)'); g.addColorStop(1, 'rgba(110,190,255,0.08)'); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = '#8fd0ff'; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.beginPath(); past.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
        const pn = popAt(yr), py0 = yOfP(pn);
        /* oameni mici = cât de mulți (siluete desenate) */
        const nPeople = clamp(Math.round(Math.pow(pn / 8.1e9, 0.4) * 60), 1, 60), ph = clamp(pH * 0.2, 9, 14), cols = Math.max(10, Math.floor((L.w * 0.42) / (ph * 0.75)));
        ctx.fillStyle = 'rgba(200,230,255,0.75)';
        for (let i = 0; i < nPeople; i++) { const r = Math.floor(i / cols), q = i % cols, hx = L.x0 + 14 + q * ph * 0.75, hy = pY + 26 + ph + r * ph * 1.25; if (hy > base - 4) break; ctx.beginPath(); ctx.arc(hx, hy - ph * 0.78, ph * 0.17, 0, 7); ctx.moveTo(hx - ph * 0.22, hy); ctx.quadraticCurveTo(hx - ph * 0.24, hy - ph * 0.55, hx, hy - ph * 0.58); ctx.quadraticCurveTo(hx + ph * 0.24, hy - ph * 0.55, hx + ph * 0.22, hy); ctx.closePath(); ctx.fill(); }
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,209,102,0.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cxp, pY + 4); ctx.lineTo(cxp, base - 2); ctx.stroke();
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(cxp, py0, 4.5, 0, 7); ctx.fill(); ctx.strokeStyle = '#1c1a28'; ctx.lineWidth = 2; ctx.stroke();
        { const s = popTxt(pn); ctx.save(); ctx.font = Art.font(L.fSm, 800); const tw = ctx.measureText(s).width + L.fSm * 1.1; ctx.restore(); Art.label(ctx, s, clamp(cxp, L.x0 + tw / 2 + 4, L.x0 + L.w - tw / 2 - 4), clamp(py0 - L.fSm * 1.4, pY + L.fSm * 2.4, base - L.fSm), { size: L.fSm, bg: 'rgba(255,209,102,0.95)', color: '#2a1a05', weight: 800, border: false }); }
        /* anul și descrierea */
        const n = M[nr], ty = L.textY + L.fBig * 0.75;
        let tx = L.x0;
        if (Math.abs(yearOf(x) - n.y) < 600) { const r = L.fBig * 0.62, img = medal(n.ic, r, true, dpr); ctx.drawImage(img, tx - 3, ty - r - 3, (r + 3) * 2, (r + 3) * 2); tx += r * 2 + 8; }
        Art.text(ctx, yTxt(yr), tx, ty, { size: L.fBig, align: 'left', halo: false, weight: 800 });
        { const line = 'În jur de ' + popTxt(pn) + ' de oameni pe Pământ · epoca: ' + cur[0], o = { size: L.fSm, align: 'left', halo: false, weight: 600, color: 'rgba(235,240,255,0.85)' };
          ctx.save(); ctx.font = Art.font(L.fSm, 600); const fits = ctx.measureText(line).width < L.w; ctx.restore();
          if (fits) Art.text(ctx, line, L.x0, ty + L.fBig * 0.75 + L.fSm * 0.85, o);
          else { Art.text(ctx, 'În jur de ' + popTxt(pn) + ' de oameni pe Pământ', L.x0, ty + L.fBig * 0.72 + L.fSm * 0.6, o); Art.text(ctx, 'epoca: ' + cur[0], L.x0, ty + L.fBig * 0.72 + L.fSm * 1.75, o); } }
        const s2 = '<b>' + yTxt(yr) + '</b> · ' + cur[0] + ' · aproape: <b>' + n.e + ' ' + n.n + '</b> (' + yTxt(n.y) + ') · ~<b>' + popTxt(pn) + '</b> de oameni';
        if (s2 !== lastInfo) { info.innerHTML = s2; lastInfo = s2; }
        void sel;
      }
      return { frame: frame };
    }
  });
})();
