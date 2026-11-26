/* Modul: Pământul în timp — ilustrație de documentar (glob luminat, atmosferă, nori, continente organice) */
(function () {
  const A = window.Art;
  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const fmtN = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 0 : d });
  const mixc = (c1, c2, t) => { t = clamp(t, 0, 1); return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]; };
  const N2 = A.noise2;
  /* zgomot fără cusătură pe longitudine (amestec între două eșantioane decalate cu 360°) */
  const pn = (lon, lat, sc, ox) => { const u = (lon + 180) / 360; return N2((lon + 180) * sc + (ox || 0), (lat + 90) * sc) * (1 - u) + N2((lon - 180) * sc + (ox || 0), (lat + 90) * sc) * u; };

  /* ============================================================
     1) PĂMÂNTUL ÎN TIMP
     ============================================================ */
  const BLOBS = [
    [[-100, 45], [-25, 35], 26, 18], [[-120, 62], [-35, 50], 14, 8], [[-95, 20], [-40, 18], 9, 10], [[-42, 73], [-8, 62], 12, 8],
    [[-60, -15], [-15, -20], 14, 24], [[-68, -42], [-18, -45], 6, 12],
    [[15, 18], [5, 10], 24, 17], [[24, -15], [10, -15], 14, 16],
    [[15, 50], [15, 40], 16, 9], [[18, 64], [20, 55], 8, 7],
    [[70, 50], [60, 48], 28, 13], [[115, 52], [85, 52], 28, 14], [[105, 28], [75, 22], 18, 14],
    [[78, 22], [35, -30], 8, 10], [[47, 24], [30, 20], 8, 8], [[134, -25], [50, -50], 15, 10]
  ];
  const ERAS = [
    { ma: 4600, e: '🔥', n: 'Pământul se naște', t: 'O minge de rocă topită. Un corp cât Marte (Theia) o lovește, iar din resturi se naște Luna — la început, de zeci de ori mai aproape decât acum.' },
    { ma: 4000, e: '🌋', n: 'Lava se răcește', t: 'Se formează prima scoarță. Vulcanii erup peste tot, iar asteroizii continuă să lovească planeta. Nu există oxigen în aer.' },
    { ma: 3800, e: '🦠', n: 'Oceanele și prima viață', t: 'Vaporii au plouat milioane de ani și au umplut oceanele. În apă apar primele viețuitoare, microscopice.' },
    { ma: 2400, e: '🫧', n: 'Marea oxigenare', t: 'Alge microscopice produc oxigen. Aerul se schimbă, cerul devine albastru, iar fierul din ape ruginește.' },
    { ma: 720, e: '❄️', n: 'Pământ-bulgăre de zăpadă', t: 'Se crede că aproape toată planeta a fost acoperită de gheață, chiar și lângă ecuator.' },
    { ma: 635, e: '🪼', n: 'Gheața se topește', t: 'Clima se încălzește. Apar primele animale mari, moi, ca meduzele.' },
    { ma: 540, e: '🐚', n: 'Explozia cambriană', t: 'În câteva zeci de milioane de ani apar aproape toate marile grupe de animale: trilobiți, viermi, primii pești.' },
    { ma: 470, e: '🌱', n: 'Plantele ies pe uscat', t: 'Primele plante cuceresc uscatul și continentele încep să înverzească. Apoi urmează insectele.' },
    { ma: 250, e: '☠️', n: 'Pangeea și Marea Moarte', t: 'Toate continentele sunt lipite într-unul singur: Pangeea. Erupții uriașe în Siberia ucid ~90% din speciile marine.' },
    { ma: 230, e: '🦖', n: 'Epoca dinozaurilor', t: 'Pangeea se desparte încet. Dinozaurii domnesc pe uscat timp de peste 160 de milioane de ani.' },
    { ma: 66, e: '☄️', n: 'Asteroidul', t: 'Un asteroid de ~10 km lovește Mexicul. Dinozaurii dispar; supraviețuiesc păsările și mamiferele mici.' },
    { ma: 50, e: '🏔️', n: 'India lovește Asia', t: 'India, care „a înotat” spre nord, se ciocnește de Asia. Pământul se încrețește și se ridică Himalaya — cu Everestul.' },
    { ma: 3, e: '🧍', n: 'Strămoșii noștri', t: 'Pe aceeași scară, oamenii de azi (apăruți acum ~300.000 de ani) abia dacă ocupă ultima clipă.' },
    { ma: 0.02, e: '🌍', n: 'Azi', t: 'Continentele de azi. Se mișcă în continuare, cam cât cresc unghiile tale: 2–5 cm pe an.' }
  ];
  /* fundalul medalionului pentru fiecare epocă */
  const ERA_BG = ['#5a1a0c', '#3a1d16', '#123a3a', '#12405a', '#2a4a6a', '#1a2f5a', '#173a4a', '#1f4a2a', '#3a2a22', '#2a4a22', '#3a1f2a', '#2a3a5a', '#4a3a22', '#123a5a'];

  /* ---------- ilustrațiile epocilor (desenate, fără emoji) — cutie 100×100, centrată ---------- */
  function flamePath(c, sway, s) {
    c.beginPath(); c.moveTo(0, 35 * s);
    c.bezierCurveTo(28 * s, 35 * s, 30 * s, 5 * s, 12 * s, -10 * s);
    c.bezierCurveTo(8 * s, -20 * s, (4 + sway) * s, -30 * s, sway * s, -44 * s);
    c.bezierCurveTo(-10 * s, -25 * s, -30 * s, -12 * s, -28 * s, 8 * s);
    c.bezierCurveTo(-27 * s, 25 * s, -14 * s, 35 * s, 0, 35 * s); c.closePath();
  }
  function leaf(c, x, y, ang, len, w, col) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(len * 0.3, -w, len * 0.75, -w, len, 0); c.bezierCurveTo(len * 0.75, w * 0.8, len * 0.3, w * 0.8, 0, 0); c.closePath();
    const g = c.createLinearGradient(0, -w, 0, w); g.addColorStop(0, A.shade(col, 0.3)); g.addColorStop(1, A.shade(col, -0.35)); c.fillStyle = g; c.fill();
    c.strokeStyle = A.rgba('#ffffff', 0.35); c.lineWidth = 1.5; c.beginPath(); c.moveTo(len * 0.08, 0); c.lineTo(len * 0.85, 0); c.stroke();
    c.restore();
  }
  function drawIcon(c, k, x, y, r, t) {
    c.save(); c.translate(x, y); c.scale(r / 50, r / 50);
    /* medalion */
    const bg = c.createRadialGradient(-15, -18, 4, 0, 0, 52); bg.addColorStop(0, A.shade(ERA_BG[k], 0.35)); bg.addColorStop(1, A.shade(ERA_BG[k], -0.45));
    c.fillStyle = bg; c.beginPath(); c.arc(0, 0, 50, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.arc(0, 0, 47, 0, TAU); c.clip();
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (k === 0) { /* planetă topită + flăcări */
      const sw = Math.sin(t * 5) * 4 + A.wobble(t * 3, 1, 3);
      c.save(); c.translate(0, 6);
      flamePath(c, sw, 1.05); let g = c.createLinearGradient(0, -44, 0, 35); g.addColorStop(0, '#ffd34a'); g.addColorStop(0.5, '#ff7a2f'); g.addColorStop(1, '#c2280e'); c.fillStyle = g; c.fill();
      flamePath(c, sw * 0.6, 0.6); c.translate(0, 0); g = c.createLinearGradient(0, -26, 0, 20); g.addColorStop(0, '#fffbe0'); g.addColorStop(1, '#ffc94a'); c.fillStyle = g; c.fill();
      c.restore();
    } else if (k === 1) { /* vulcan cu lavă și fum */
      for (let i = 0; i < 3; i++) { const a = (t * 0.35 + i / 3) % 1; c.fillStyle = A.rgba('#9a9098', 0.7 * (1 - a)); c.beginPath(); c.arc(-4 + a * 14 + i * 3, -14 - a * 34, 7 + a * 10, 0, TAU); c.fill(); }
      c.beginPath(); c.moveTo(-46, 42); c.quadraticCurveTo(-20, 20, -10, -8); c.lineTo(10, -8); c.quadraticCurveTo(20, 20, 46, 42); c.closePath();
      A.volumeFill(c, -40, -10, 40, 40, '#7a5a46');
      c.fillStyle = A.rgba('#000000', 0.2); c.beginPath(); c.moveTo(0, -8); c.lineTo(10, -8); c.quadraticCurveTo(20, 20, 46, 42); c.lineTo(8, 42); c.closePath(); c.fill();
      c.fillStyle = '#ff6a1f'; c.beginPath(); c.moveTo(-10, -8); c.quadraticCurveTo(0, -14, 10, -8); c.quadraticCurveTo(4, 6, 2, 20); c.quadraticCurveTo(-1, 6, -10, -8); c.fill();
      c.fillStyle = '#ffd34a'; c.beginPath(); c.ellipse(0, -9, 8, 3, 0, 0, TAU); c.fill();
    } else if (k === 2) { /* celulă microscopică */
      c.strokeStyle = A.rgba('#a8f0c8', 0.8); c.lineWidth = 2;
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * 0.4, w = Math.sin(t * 6 + i) * 0.25; c.beginPath(); c.moveTo(Math.cos(a) * 26, Math.sin(a) * 22); c.quadraticCurveTo(Math.cos(a + w) * 34, Math.sin(a + w) * 30, Math.cos(a + w * 2) * 39, Math.sin(a + w * 2) * 35); c.stroke(); }
      A.blob(c, 0, 0, 27, t, { amp: 0.13, seed: 3, sy: 0.85 });
      const g = c.createRadialGradient(-8, -8, 2, 0, 0, 30); g.addColorStop(0, '#c8f7b0'); g.addColorStop(0.6, '#4fbf7a'); g.addColorStop(1, '#1e6a4a'); c.fillStyle = g; c.fill();
      c.strokeStyle = '#1a5a40'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#2a7a5a'; c.beginPath(); c.arc(5, 3, 8, 0, TAU); c.fill(); c.fillStyle = A.rgba('#ffffff', 0.5); c.beginPath(); c.arc(-10, -9, 4, 0, TAU); c.fill();
      c.fillStyle = A.rgba('#e8ffd0', 0.7); for (const [px, py] of [[-12, 8], [14, -10], [-3, 14]]) { c.beginPath(); c.arc(px, py, 2.4, 0, TAU); c.fill(); }
    } else if (k === 3) { /* alge + bule de oxigen */
      c.strokeStyle = '#3fa86a'; c.lineWidth = 5;
      for (let i = 0; i < 4; i++) { const bx = -30 + i * 19; c.beginPath(); c.moveTo(bx, 50); c.quadraticCurveTo(bx + Math.sin(t * 2 + i) * 8, 30, bx + Math.sin(t * 2 + i + 1) * 6, 12 + (i % 2) * 8); c.stroke(); }
      for (let i = 0; i < 6; i++) { const a = (t * 0.3 + i * 0.37) % 1, bx = -26 + i * 11 + Math.sin(t * 3 + i) * 3, by = 30 - a * 80, br = 4 + (i % 3) * 3; c.globalAlpha = Math.min(1, (1 - a) * 3); c.fillStyle = A.rgba('#bfefff', 0.25); c.strokeStyle = A.rgba('#e8fbff', 0.9); c.lineWidth = 1.8; c.beginPath(); c.arc(bx, by, br, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(bx - br * 0.35, by - br * 0.35, br * 0.25, 0, TAU); c.fill(); }
      c.globalAlpha = 1;
    } else if (k === 4) { /* fulg de zăpadă */
      c.rotate(t * 0.2); c.strokeStyle = '#eaf6ff'; c.lineWidth = 5;
      for (let i = 0; i < 6; i++) { c.save(); c.rotate(i * TAU / 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -36); c.moveTo(0, -14); c.lineTo(-9, -23); c.moveTo(0, -14); c.lineTo(9, -23); c.moveTo(0, -25); c.lineTo(-7, -32); c.moveTo(0, -25); c.lineTo(7, -32); c.stroke(); c.restore(); }
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.fill();
    } else if (k === 5) { /* meduză care pulsează */
      const p = 1 + Math.sin(t * 3) * 0.07; c.translate(0, -6 + Math.sin(t * 3 + 1) * 3);
      c.strokeStyle = A.rgba('#e9b8ff', 0.75); c.lineWidth = 3;
      for (let i = 0; i < 5; i++) { const bx = -16 + i * 8; c.beginPath(); c.moveTo(bx, 2); for (let s = 1; s <= 6; s++) c.lineTo(bx + Math.sin(t * 3 + s * 0.9 + i) * 4, 2 + s * 7); c.stroke(); }
      c.save(); c.scale(p, 1 / p);
      c.beginPath(); c.moveTo(-26, 4); c.bezierCurveTo(-28, -30, 28, -30, 26, 4);
      for (let i = 0; i < 5; i++) { const x0 = 26 - i * 10.4; c.quadraticCurveTo(x0 - 5.2, 10, x0 - 10.4, 4); }
      c.closePath(); const g = c.createRadialGradient(-8, -16, 2, 0, -6, 32); g.addColorStop(0, '#fbe4ff'); g.addColorStop(0.5, '#c88af0'); g.addColorStop(1, '#7a4ab8'); c.fillStyle = g; c.globalAlpha = 0.92; c.fill(); c.globalAlpha = 1;
      c.fillStyle = A.rgba('#ffffff', 0.45); c.beginPath(); c.ellipse(-9, -14, 7, 4, -0.5, 0, TAU); c.fill();
      c.restore();
    } else if (k === 6) { /* trilobit */
      c.rotate(-0.25 + Math.sin(t * 1.5) * 0.05);
      c.beginPath(); c.ellipse(0, 6, 22, 30, 0, 0, TAU); A.volumeFill(c, -22, -24, 22, 36, '#9a7a5a');
      c.beginPath(); c.moveTo(-24, -10); c.quadraticCurveTo(-26, -34, 0, -36); c.quadraticCurveTo(26, -34, 24, -10); c.quadraticCurveTo(0, -4, -24, -10); A.volumeFill(c, -24, -36, 24, -6, '#b08a62');
      c.strokeStyle = '#4a3424'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = A.rgba('#3a2818', 0.8); c.lineWidth = 2;
      for (let i = 0; i < 7; i++) { const yy = -4 + i * 5.6, hw = 20 * Math.sqrt(Math.max(0, 1 - Math.pow((yy - 6) / 30, 2))); c.beginPath(); c.moveTo(-hw, yy); c.quadraticCurveTo(0, yy + 3, hw, yy); c.stroke(); }
      c.beginPath(); c.moveTo(-7, -6); c.lineTo(-6, 34); c.moveTo(7, -6); c.lineTo(6, 34); c.stroke();
      c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(-11, -20, 3.2, 0, TAU); c.arc(11, -20, 3.2, 0, TAU); c.fill();
      c.fillStyle = A.rgba('#ffffff', 0.3); c.beginPath(); c.ellipse(-8, -26, 8, 3, -0.3, 0, TAU); c.fill();
    } else if (k === 7) { /* răsad pe sol */
      const sw = Math.sin(t * 1.6) * 0.08;
      c.beginPath(); c.moveTo(-50, 50); c.lineTo(-50, 30); c.quadraticCurveTo(0, 16, 50, 30); c.lineTo(50, 50); c.closePath(); A.volumeFill(c, 0, 18, 0, 50, '#7a5536');
      c.save(); c.translate(0, 26); c.rotate(sw);
      c.strokeStyle = '#3f9a4a'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-4, -22, 2, -40); c.stroke();
      leaf(c, 1, -30, -0.5, 30, 10, '#5cc45a'); leaf(c, 0, -22, Math.PI + 0.45, 26, 9, '#4caf50');
      c.restore();
    } else if (k === 8) { /* schelet de pește — marea extincție */
      c.translate(0, 2); c.rotate(-0.12);
      c.strokeStyle = '#efe6d2'; c.fillStyle = '#efe6d2'; c.lineWidth = 4;
      c.beginPath(); c.moveTo(-18, 0); c.lineTo(26, 0); c.stroke();
      for (let i = 0; i < 6; i++) { const xx = -12 + i * 7, hh = 14 - Math.abs(i - 2) * 2; c.lineWidth = 3; c.beginPath(); c.moveTo(xx, -hh); c.quadraticCurveTo(xx + 3, 0, xx, hh); c.stroke(); }
      c.beginPath(); c.moveTo(26, 0); c.lineTo(42, -14); c.lineTo(38, 0); c.lineTo(42, 14); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-18, -16); c.quadraticCurveTo(-42, -12, -44, 2); c.quadraticCurveTo(-36, 16, -18, 16); c.quadraticCurveTo(-22, 0, -18, -16); c.closePath(); c.fill();
      c.fillStyle = ERA_BG[8]; c.beginPath(); c.arc(-31, -3, 4, 0, TAU); c.fill();
      c.strokeStyle = A.rgba('#b9ab8c', 1); c.lineWidth = 1.5; c.beginPath(); c.arc(-30, 6, 6, 0.2, 1.4); c.stroke();
    } else if (k === 9) { /* dinozaur sauropod: siluetă netedă, picioare care pășesc */
      const st = Math.sin(t * 2.2), g = c.createLinearGradient(0, -42, 0, 26); g.addColorStop(0, '#8fae6a'); g.addColorStop(0.6, '#5e7e48'); g.addColorStop(1, '#3e5634');
      const leg = (x, ph, far) => { const sw = Math.sin(t * 2.2 + ph) * 4; c.beginPath(); c.moveTo(x - 4, 6); c.quadraticCurveTo(x - 5 + sw * 0.3, 18, x - 4 + sw, 30); c.lineTo(x + 4 + sw, 30); c.quadraticCurveTo(x + 4 + sw * 0.3, 18, x + 5, 6); c.closePath(); c.fillStyle = far ? '#3e5634' : g; c.fill(); };
      leg(-6, 1.6, true); leg(20, 0, true);
      c.beginPath(); A.smoothPath(c, [[-44, -37 + st * 0.6], [-38, -42 + st * 0.6], [-31, -38], [-22, -22], [-12, -8], [4, -10], [20, -9], [34, -2], [52, 14], [32, 8], [22, 10], [6, 12], [-10, 10], [-18, 0], [-28, -20], [-36, -32]], true, 0.6);
      c.fillStyle = g; c.fill();
      c.strokeStyle = 'rgba(30,44,24,0.6)'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = 'rgba(255,255,240,0.18)'; c.beginPath(); c.ellipse(6, -5, 15, 3.5, -0.05, 0, TAU); c.fill();
      leg(-12, 0, false); leg(14, 1.6, false);
      c.fillStyle = '#1a2414'; c.beginPath(); c.arc(-39, -39 + st * 0.6, 1.3, 0, TAU); c.fill();
    } else if (k === 10) { /* asteroid cu dâră */
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createLinearGradient(-48, -48, 8, 8); g.addColorStop(0, A.rgba('#ff7a2f', 0)); g.addColorStop(0.7, A.rgba('#ffb040', 0.7)); g.addColorStop(1, A.rgba('#fff2c0', 0.95));
      c.fillStyle = g; c.beginPath(); c.moveTo(-50, -38); c.lineTo(14, 2); c.lineTo(2, 14); c.closePath(); c.fill();
      c.restore();
      A.blob(c, 10, 10, 15, 0, { amp: 0.25, seed: 7 }); A.volumeFill(c, -5, -5, 25, 25, '#8a7a6c');
      c.fillStyle = A.rgba('#3a3028', 0.6); c.beginPath(); c.arc(14, 12, 3.5, 0, TAU); c.arc(5, 16, 2.4, 0, TAU); c.fill();
    } else if (k === 11) { /* munți cu zăpadă */
      c.beginPath(); c.moveTo(-50, 44); c.lineTo(-22, -6); c.lineTo(-10, 8); c.lineTo(6, -30); c.lineTo(50, 44); c.closePath(); A.volumeFill(c, -40, -30, 40, 44, '#6f7f98');
      c.fillStyle = A.rgba('#000000', 0.22); c.beginPath(); c.moveTo(6, -30); c.lineTo(50, 44); c.lineTo(14, 44); c.lineTo(10, 0); c.closePath(); c.fill();
      c.fillStyle = '#f4f8ff'; c.beginPath(); c.moveTo(6, -30); c.lineTo(17, -11); c.lineTo(11, -14); c.lineTo(6, -8); c.lineTo(0, -15); c.lineTo(-5, -12); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-22, -6); c.lineTo(-15, 4); c.lineTo(-20, 2); c.lineTo(-26, 4); c.closePath(); c.fill();
      c.fillStyle = '#3f6a44'; c.beginPath(); c.moveTo(-50, 50); c.lineTo(-50, 36); c.quadraticCurveTo(0, 26, 50, 38); c.lineTo(50, 50); c.fill();
    } else if (k === 12) { /* om preistoric care merge: membre cu volum, articulații îndoite */
      const w = Math.sin(t * 3.2), w2 = Math.cos(t * 3.2);
      const limb = (x0, y0, x1, y1, r0, r1, col) => { const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a); c.beginPath(); c.moveTo(x0 + nx * r0, y0 + ny * r0); c.lineTo(x1 + nx * r1, y1 + ny * r1); c.arc(x1, y1, r1, a + Math.PI / 2, a - Math.PI / 2, true); c.lineTo(x0 - nx * r0, y0 - ny * r0); c.arc(x0, y0, r0, a - Math.PI / 2, a + Math.PI / 2, true); c.closePath(); c.fillStyle = col; c.fill(); };
      const leg = (s, col) => { const hx = 0, hy = 6, kx = hx + 7 * s, ky = 21 - Math.max(0, -s) * 2, fx = kx - 2 + 5 * s - Math.max(0, s) * 3, fy = 36; limb(hx, hy, kx, ky, 5, 4, col); limb(kx, ky, fx, fy, 4, 3, col); c.beginPath(); c.ellipse(fx - 3, fy + 2, 5, 2.2, 0, 0, TAU); c.fillStyle = col; c.fill(); };
      const arm = (s, col) => { const sx = 0, sy = -16, ex = sx + 6 * s, ey = -3, hx = ex + 4 * s + 2, hy = 8; limb(sx, sy, ex, ey, 3.6, 3, col); limb(ex, ey, hx, hy, 3, 2.6, col); };
      c.translate(0, 0);
      leg(-w, '#9a6446'); arm(w, '#9a6446');
      c.beginPath(); c.moveTo(-6, -18); c.quadraticCurveTo(-8, -4, -5, 6); c.lineTo(6, 6); c.quadraticCurveTo(8, -6, 6, -18); c.quadraticCurveTo(0, -21, -6, -18); c.closePath();
      const tg = c.createLinearGradient(-8, 0, 8, 0); tg.addColorStop(0, '#d49a72'); tg.addColorStop(1, '#a86e4e'); c.fillStyle = tg; c.fill();
      c.fillStyle = '#6a4a2c'; c.beginPath(); c.moveTo(-6, 0); c.lineTo(6, 0); c.lineTo(7, 9); c.lineTo(-1, 12); c.lineTo(-7, 9); c.closePath(); c.fill();
      leg(w, '#c48a62'); arm(-w, '#c48a62');
      limb(0, -20, 1, -24, 3, 3, '#b87c58');
      c.beginPath(); c.ellipse(1, -31, 7, 8, 0.15, 0, TAU); const hg = c.createRadialGradient(-2, -34, 1, 1, -31, 9); hg.addColorStop(0, '#dca480'); hg.addColorStop(1, '#a86e4e'); c.fillStyle = hg; c.fill();
      c.fillStyle = '#3a2618'; c.beginPath(); c.ellipse(2, -36, 7.5, 5, 0.2, Math.PI * 0.9, Math.PI * 2.15); c.fill();
      c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(-3.5, -31, 1, 0, TAU); c.fill();
    } else { /* glob */
      A.sphere(c, 0, 0, 34, '#2a7fd0', { rimColor: '#bfe3ff' });
      c.save(); c.beginPath(); c.arc(0, 0, 34, 0, TAU); c.clip(); c.fillStyle = '#4caf50';
      const o = (t * 6) % 80;
      for (const [bx, by, br] of [[-14, -10, 12], [10, 10, 10], [18, -16, 7], [-6, 18, 6]]) { let xx = bx + o; if (xx > 44) xx -= 80; A.blob(c, xx, by, br, 0, { seed: bx, amp: 0.3 }); c.fill(); }
      const sg = c.createRadialGradient(-12, -14, 2, 0, 0, 36); sg.addColorStop(0, 'rgba(255,255,255,0.35)'); sg.addColorStop(0.5, 'rgba(255,255,255,0)'); sg.addColorStop(1, 'rgba(0,10,40,0.55)');
      c.fillStyle = sg; c.fillRect(-36, -36, 72, 72);
      c.restore();
      c.strokeStyle = A.rgba('#8fd0ff', 0.6); c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, 35, 0, TAU); c.stroke();
    }
    c.restore();
    c.strokeStyle = A.rgba('#ffe7b0', 0.55); c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 48.5, 0, TAU); c.stroke();
    c.strokeStyle = A.rgba('#000000', 0.35); c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, 50.5, 0, TAU); c.stroke();
    c.restore();
  }

  /* ---------- harta norilor (o singură dată) ---------- */
  const MW = 320, MH = 160;
  let CLOUD = null;
  function buildClouds() {
    CLOUD = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) {
      const lat = 90 - (j + 0.5) / MH * 180, al = Math.abs(lat);
      const band = 0.55 + 0.45 * Math.max(Math.exp(-Math.pow((al - 55) / 14, 2)), Math.exp(-Math.pow(al / 8, 2)) * 0.8);
      for (let i = 0; i < MW; i++) {
        const lon = (i + 0.5) / MW * 360 - 180;
        let v = pn(lon * 1.0, lat * 2.0, 0.035, 11) * 0.6 + pn(lon, lat * 2, 0.08, 31) * 0.3 + pn(lon, lat, 0.2, 53) * 0.15;
        v = clamp((v + 0.06) * 2.6, 0, 1) * band;
        CLOUD[j * MW + i] = Math.round(v * 255);
      }
    }
  }

  defineModule({
    id: 'earthtime', title: 'Pământul în timp', sub: 'De acum 4,6 miliarde de ani până azi',
    start: function (api) {
      const ctx = api.ctx;
      let s = 0, spin = 0, tilt = 0.25, vSpin = 0, vTilt = 0, idle = 99, dragging = false, zoom = 1, lastEra = -1, playing = false;
      let eraChangeT = -9, prevEra = 0, simT = 0;
      if (!CLOUD) buildClouds();
      const ma = () => 4600 * Math.pow(1 - s, 3);
      const eraIdx = () => { const m = ma(); let k = 0; for (let i = 0; i < ERAS.length; i++) if (m <= ERAS[i].ma) k = i; return k; };
      const maText = (m) => m >= 1000 ? fmtN(m / 1000, 2) + ' miliarde de ani' : m >= 1 ? fmtN(m, 0) + ' milioane de ani' : 'azi';

      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Acum', min: 0, max: 1, step: 0.0005, value: 0, fmt: () => maText(ma()), onInput: (v) => { s = v; playing = false; bP.innerHTML = '▶ Derulează'; } });
      const bP = api.button(r1, '▶ Derulează', () => { if (s >= 0.999) s = 0; playing = !playing; bP.innerHTML = playing ? '⏸ Pauză' : '▶ Derulează'; });
      const r2 = api.row('Salt la');
      [['🔥 Naștere', 0], ['🦠 Viață', 0.075], ['🫧 Oxigen', 0.2], ['🐚 Cambrian', 0.51], ['🦖 Dinozauri', 0.62], ['☄️ Asteroid', 0.757], ['🌍 Azi', 1]]
        .forEach(([t, v]) => api.button(r2, t, () => { s = v; playing = false; bP.innerHTML = '▶ Derulează'; sl.set(v); }));

      function landNow(m) {
        const f = m >= 250 ? 0 : 1 - m / 250;
        const k = m >= 4000 ? 0.12 : m >= 540 ? lerp(1, 0.3, (m - 540) / 3460) : 1;
        return BLOBS.map((b) => ({ lon: lerp(b[1][0], b[0][0], f), lat: lerp(b[1][1], b[0][1], f), rx: b[2] * k, ry: b[3] * k }));
      }

      /* ---------- harta planetei pentru epoca curentă (echirectangulară, se recalculează doar când se schimbă timpul) ---------- */
      const MR = new Uint8Array(MW * MH), MG = new Uint8Array(MW * MH), MB = new Uint8Array(MW * MH), ME = new Uint8Array(MW * MH), MS = new Uint8Array(MW * MH), MN = new Uint8Array(MW * MH);
      let mapKey = -1, look = null;
      function eraLook(m) {
        const lava = m > 4000, snow = m < 720 && m > 635;
        let deep, shallow;
        if (m > 3800) { deep = [52, 70, 66]; shallow = [92, 104, 88]; }
        else if (m > 2400) { const k = (3800 - m) / 1400; deep = mixc([38, 88, 82], [30, 84, 96], k); shallow = mixc([80, 140, 110], [70, 150, 140], k); }
        else { const k = clamp((2400 - m) / 1700, 0, 1); deep = mixc([30, 84, 110], [14, 62, 140], k); shallow = mixc([70, 150, 150], [44, 150, 196], k); }
        const atm = lava ? '#ff7a3a' : m > 2400 ? '#e0a868' : '#6fb8ff';
        const cloudK = lava ? 0 : m > 3800 ? 0.45 : m > 2400 ? 0.7 : snow ? 0.55 : 0.85;
        const cloudC = m > 2400 ? [236, 206, 160] : [250, 252, 255];
        return { lava, snow, deep, shallow, atm, cloudK, cloudC, veg: m < 470 ? clamp((470 - m) / 150, 0, 1) : 0 };
      }
      function buildMap(m) {
        const L = landNow(m), lk = look;
        const crust = clamp((4600 - m) / 600, 0, 1), seamW = lerp(0.55, 0.07, Math.pow(crust, 0.7));
        const capLat = m < 3 ? 72 : 80, rust = m < 2400 && m > 470 ? clamp((2400 - m) / 800, 0, 1) * 0.6 : 0, hot = m < 4000 && m > 2600;
        for (let j = 0; j < MH; j++) {
          const lat = 90 - (j + 0.5) / MH * 180, al = Math.abs(lat), cl = Math.cos(lat * 0.017453);
          for (let i = 0; i < MW; i++) {
            const lon = (i + 0.5) / MW * 360 - 180, o = j * MW + i;
            let c, e = 0, sp = 0, nl = 0;
            if (lk.lava) {
              const v = Math.abs(pn(lon, lat, 0.045, 3) + 0.45 * pn(lon, lat, 0.12, 9));
              const q = v / seamW, w = 1 - sstep(0.7, 1.25, q), cq = pn(lon, lat, 0.2, 5) * 0.5 + 0.5;
              const mol = mixc([255, 222, 120], [222, 70, 20], Math.min(1, q)), cr = mixc([46, 26, 22], [96, 52, 36], cq);
              c = mixc(cr, mol, w); e = Math.round(lerp(40 * (1 - crust), 255 * (1 - Math.min(1, q) * 0.55), w));
              MR[o] = c[0]; MG[o] = c[1]; MB[o] = c[2]; ME[o] = e; MS[o] = 0; MN[o] = 0; continue;
            }
            let minE = 9, mt = 0;
            for (let q = 0; q < L.length; q++) {
              const b = L[q]; let dx = lon - b.lon; dx = ((dx + 540) % 360) - 180;
              const dl = lat - b.lat, a1 = dx * cl / b.rx, b1 = dl / b.ry, dd = a1 * a1 + b1 * b1;
              if (dd > 3.4) continue;
              const ee = dd + 0.5 * N2(dx * 0.06 + q * 5.1, dl * 0.06 + q * 2.7) + 0.22 * N2(dx * 0.17 + q * 3.3, dl * 0.17 - q);
              if (ee < minE) { minE = ee; mt = N2(dx * 0.11 + q * 9.1, dl * 0.11 + q * 4.3); }
            }
            const land = minE < 1 || (lat < -77 && m < 540);
            if (land) {
              const el = clamp(1 - minE, 0, 1), nz = N2(lon * 0.13 + 7, lat * 0.13);
              let barren = mixc([122, 104, 86], [156, 124, 94], nz * 0.5 + 0.5);
              if (hot) barren = mixc([66, 58, 54], [96, 82, 72], nz * 0.5 + 0.5);
              if (rust) barren = mixc(barren, [168, 92, 58], rust);
              barren = mixc(barren, [92, 80, 72], clamp((mt - 0.15) * 2.5, 0, 0.6) * clamp(el * 3, 0, 1));
              c = barren;
              if (lk.veg > 0) {
                let v;
                if (al > 62) v = [128, 132, 108];
                else if (al > 14 && al < 36 && nz > -0.15) v = mixc([214, 184, 126], [196, 160, 104], nz);
                else if (al < 12) v = [38, 104, 46];
                else v = mixc([64, 122, 56], [92, 140, 70], nz * 0.5 + 0.5);
                if (el < 0.08 && al < 50) v = mixc(v, [214, 196, 140], 0.5);
                if (el > 0.25) v = mixc(v, [122, 108, 94], clamp((mt - 0.2) * 3, 0, 1) * clamp((el - 0.25) * 4, 0, 1));
                if (el > 0.35 && al > 25) v = mixc(v, [236, 240, 246], clamp((mt - 0.5) * 5, 0, 1));
                c = mixc(barren, v, lk.veg);
              }
              if (hot && mt > 0.5 && el > 0.2) { c = [255, 120, 40]; e = 160; }
              if (m < 0.1 && al > 8 && al < 60 && el > 0.05 && N2(lon * 0.4, lat * 0.4) > 0.22) nl = Math.round(clamp((N2(lon * 0.9 + 3, lat * 0.9) + 0.5) * 255, 60, 255));
            } else {
              const sh = minE < 1.7 ? 1 - (minE - 1) / 0.7 : 0, nz = N2(lon * 0.08 + 21, lat * 0.08) * 0.08;
              c = mixc(lk.deep, lk.shallow, clamp(sh * sh + nz, 0, 1)); sp = 1;
            }
            const capEdge = capLat + 5 * N2(lon * 0.07, lat * 0.02 + 40);
            if (al > capEdge) { c = mixc([226, 236, 246], [244, 248, 255], N2(lon * 0.2, lat * 0.2) * 0.5 + 0.5); sp = 0; e = 0; }
            if (lk.snow) { const crack = Math.abs(N2(lon * 0.09 + 50, lat * 0.09)); c = land ? [242, 246, 252] : crack < 0.03 ? [120, 170, 210] : mixc([206, 226, 242], [232, 242, 252], crack * 2); sp = 0; e = 0; }
            MR[o] = c[0]; MG[o] = c[1]; MB[o] = c[2]; ME[o] = e; MS[o] = sp; MN[o] = nl;
          }
        }
      }

      /* ---------- globul: parametri per pixel calculați o dată (lumina e fixă, din stânga-sus) ---------- */
      let S = 0, off = null, octx = null, img = null, PX = null;
      function setupGlobe(size) {
        S = size; off = document.createElement('canvas'); off.width = off.height = S; octx = off.getContext('2d'); img = octx.createImageData(S, S);
        const h = S / 2; PX = new Float32Array(S * S * 7);
        let lx = -0.6, ly = 0.5, lz = 0.62; const ln = Math.hypot(lx, ly, lz); lx /= ln; ly /= ln; lz /= ln;
        let hx = lx, hy = ly, hz = lz + 1; const hn = Math.hypot(hx, hy, hz); hx /= hn; hy /= hn; hz /= hn;
        for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
          const nx = (i + 0.5 - h) / h, ny = (j + 0.5 - h) / h, r2 = nx * nx + ny * ny, p = (j * S + i) * 7, r = Math.sqrt(r2);
          const al = clamp((1 - r) * h + 0.5, 0, 1);
          if (al <= 0) { PX[p + 5] = 0; continue; }
          const z = Math.sqrt(Math.max(0, 1 - Math.min(1, r2))), y = -ny;
          PX[p] = nx; PX[p + 1] = y; PX[p + 2] = z;
          PX[p + 3] = nx * lx + y * ly + z * lz;
          PX[p + 4] = Math.pow(Math.max(0, nx * hx + y * hy + z * hz), 140);
          PX[p + 5] = al; PX[p + 6] = Math.pow(1 - z, 2.4);
        }
      }
      function renderGlobe(t) {
        const d = img.data, lk = look;
        const cs = Math.cos(spin), sn = Math.sin(spin), ct = Math.cos(tilt), st = Math.sin(tilt);
        const coff = Math.floor(t * 2.2) % MW, cK = lk.cloudK, cc = lk.cloudC;
        const ar = A.hex(lk.atm), INV = 1 / TAU, INVP = 1 / Math.PI;
        for (let q = 0, n = S * S; q < n; q++) {
          const p = q * 7, o = q * 4, al = PX[p + 5];
          if (al <= 0) { d[o + 3] = 0; continue; }
          const X = PX[p], Y = PX[p + 1], Z = PX[p + 2];
          const y1 = Y * ct - Z * st, z1 = Y * st + Z * ct;
          const xr = X * cs + z1 * sn, zr = -X * sn + z1 * cs;
          const lon = Math.atan2(xr, zr), lat = Math.asin(y1 > 1 ? 1 : y1 < -1 ? -1 : y1);
          let u = ((lon * INV + 0.5) * MW) | 0; if (u >= MW) u -= MW; if (u < 0) u += MW;
          let v = ((0.5 - lat * INVP) * MH) | 0; if (v >= MH) v = MH - 1; if (v < 0) v = 0;
          const ti = v * MW + u;
          let r = MR[ti], g = MG[ti], b = MB[ti];
          const lam = PX[p + 3], dl = clamp((lam + 0.12) / 0.42, 0, 1), day = dl * dl * (3 - 2 * dl);
          let ca = 0;
          if (cK > 0) { let cu = u + coff; if (cu >= MW) cu -= MW; ca = CLOUD[v * MW + cu] / 255 * cK; r += (cc[0] - r) * ca; g += (cc[1] - g) * ca; b += (cc[2] - b) * ca; }
          const sh = 0.045 + 0.98 * day * (0.82 + 0.18 * lam);
          r *= sh; g *= sh; b *= sh;
          r += 4 * (1 - day); g += 7 * (1 - day); b += 16 * (1 - day);
          if (MS[ti]) { const spc = PX[p + 4] * 130 * (1 - ca); r += spc; g += spc * 0.96; b += spc * 0.88; }
          const e = ME[ti];
          if (e) { const pul = (0.72 + 0.28 * Math.sin(u * 0.23 + v * 0.31 + t * 2.4)) * e / 255 * (1 - ca * 0.6); r += 255 * pul * (1 - day * 0.35); g += 120 * pul * (1 - day * 0.35); b += 30 * pul * (1 - day * 0.35); }
          const nl = MN[ti]; if (nl && day < 0.4) { const k = nl / 255 * (0.4 - day) / 0.4 * (1 - ca); r += 255 * k; g += 196 * k; b += 110 * k; }
          const f = PX[p + 6] * (0.25 + 0.75 * day); r += ar[0] * f * 0.85; g += ar[1] * f * 0.85; b += ar[2] * f * 0.85;
          d[o] = r > 255 ? 255 : r; d[o + 1] = g > 255 ? 255 : g; d[o + 2] = b > 255 ? 255 : b; d[o + 3] = al * 255;
        }
        octx.putImageData(img, 0, 0);
      }

      /* control: trage cu mouse-ul / degetul ca să rotești globul; rotița = zoom */
      let lx = 0, ly = 0, lt = 0;
      api.pointer({
        down: (x, y) => { dragging = true; lx = x; ly = y; lt = performance.now(); vSpin = 0; vTilt = 0; },
        move: (x, y) => {
          const dx = x - lx, dy = y - ly, now = performance.now(), dtm = Math.max(1, now - lt) / 1000, k = 2.4 / (api.unit * 0.82 * zoom);
          spin -= dx * k; tilt = clamp(tilt - dy * k, -1.35, 1.35);
          vSpin = vSpin * 0.6 - dx * k / dtm * 0.4; vTilt = vTilt * 0.6 - dy * k / dtm * 0.4;
          lx = x; ly = y; lt = now;
        },
        up: () => { dragging = false; if (performance.now() - lt > 120) { vSpin = 0; vTilt = 0; } }
      });
      const onWheel = (e) => { e.preventDefault(); zoom = clamp(zoom * Math.exp(-e.deltaY * 0.0015), 0.6, 1.7); };
      api.canvas.addEventListener('wheel', onWheel, { passive: false });
      api.onCleanup(() => api.canvas.removeEventListener('wheel', onWheel));
      r2.appendChild(Object.assign(document.createElement('span'), { className: 'mod-rt', textContent: 'Trage pe glob ca să-l rotești · rotița mouse-ului = zoom' }));
      api.button(r2, '🔍+', () => { zoom = clamp(zoom * 1.2, 0.6, 1.7); });
      api.button(r2, '🔍−', () => { zoom = clamp(zoom / 1.2, 0.6, 1.7); });
      api.button(r2, '↺ Glob', () => { spin = 0; tilt = 0.25; zoom = 1; vSpin = vTilt = 0; });
      function sayEra() { const k = eraIdx(); if (k === lastEra) return; if (lastEra >= 0) prevEra = lastEra; lastEra = k; eraChangeT = simT; api.say(ERAS[k].e + ' <b>' + ERAS[k].n + '.</b> ' + ERAS[k].t); }

      /* resturi de la impactul cu Theia (inel care formează Luna) */
      const DEB = []; { let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 150; i++) DEB.push({ a: rnd() * TAU, r: 1.25 + rnd() * 0.55, s: 0.6 + rnd() * 0.9, z: 0.6 + rnd() * 2.2, h: rnd() }); }
      function debris(cx, cy, R, k, t, front) {
        ctx.save();
        for (const p of DEB) {
          const a = p.a + t * 0.25 * p.s / p.r, sa = Math.sin(a);
          if ((sa > 0) !== front) continue;
          const x = cx + Math.cos(a) * R * p.r, y = cy + sa * R * p.r * 0.28 - Math.cos(a) * R * 0.1;
          ctx.fillStyle = p.h > 0.6 ? A.rgba('#ffb060', 0.8 * k) : A.rgba('#c8a890', 0.6 * k);
          ctx.beginPath(); ctx.arc(x, y, p.z, 0, TAU); ctx.fill();
        }
        ctx.restore();
      }
      /* meteorit cu dâră de foc */
      function meteor(x0, y0, x1, y1, k, size) {
        const x = lerp(x0, x1, k), y = lerp(y0, y1, k), ang = Math.atan2(y1 - y0, x1 - x0), len = size * 9;
        const tx = x - Math.cos(ang) * len, ty = y - Math.sin(ang) * len;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(tx, ty, x, y); g.addColorStop(0, 'rgba(255,120,40,0)'); g.addColorStop(0.75, 'rgba(255,170,80,0.55)'); g.addColorStop(1, 'rgba(255,245,210,0.95)');
        ctx.fillStyle = g; ctx.beginPath(); const nx = -Math.sin(ang) * size * 0.9, ny = Math.cos(ang) * size * 0.9;
        ctx.moveTo(tx, ty); ctx.lineTo(x + nx, y + ny); ctx.arc(x, y, size * 0.9, ang + Math.PI / 2, ang - Math.PI / 2, true); ctx.closePath(); ctx.fill();
        ctx.restore();
        A.glow(ctx, x, y, size * 1.8, '#ffb060', 0.5);
        ctx.fillStyle = '#6a5a4e'; ctx.beginPath(); ctx.arc(x, y, size * 0.55, 0, TAU); ctx.fill();
      }

      function frame(dt, t) {
        simT = t;
        if (playing) { s = Math.min(1, s + dt / 40); sl.set(s); if (s >= 1) { playing = false; bP.innerHTML = '↺ De la început'; } }
        if (dragging) { idle = 0; } else {
          idle += dt;
          spin += vSpin * dt; tilt = clamp(tilt + vTilt * dt, -1.35, 1.35);
          const damp = Math.exp(-dt * 3.5); vSpin *= damp; vTilt *= damp;
          if (idle > 3) { spin += dt * 0.35; tilt += (0.25 - tilt) * Math.min(1, dt * 0.8); }
        }
        const m = ma(), cx = api.cx, cy = api.cy, R = api.unit * 0.82 * zoom, W = api.W, H = api.H, U = api.unit;
        /* fundal: spațiu adânc cu nebuloasă discretă și lumina Soarelui din stânga */
        const bg = A.cached('et-bg', W, H, (c, w, h) => {
          A.backdrop(c, w, h, { top: '#0a0f22', bottom: '#04060e', vignette: false });
          A.stars(c, w, h, 0, { alpha: 0.4, n: Math.round(Math.min(120, w * h / 9000)) });
        });
        ctx.drawImage(bg, 0, 0, W, H);

        const key = Math.round(s * 300);
        if (key !== mapKey) { mapKey = key; look = eraLook(m); buildMap(m); }
        const want = clamp(Math.round(R * 1.25), 160, 320);
        if (!PX || Math.abs(want - S) > 24) setupGlobe(want);
        renderGlobe(t); sayEra();

        /* Luna: mare, aproape și încă fierbinte la început */
        const mr = lerp(0.3, 0.1, clamp((4400 - m) / 1500, 0, 1)), md = lerp(1.35, 1.75, clamp((4400 - m) / 4400, 0, 1));
        const mx = cx + R * md * 0.9, my = cy - R * md * 0.45, mR = R * mr;
        const drawMoon = () => {
          const hot = clamp((m - 4300) / 250, 0, 1);
          
          A.sphere(ctx, mx, my, mR, A.mix('#bdb6ad', '#c0502a', hot), { rimColor: '#ffffff', lx: -0.6, ly: -0.4 });
          ctx.save(); ctx.beginPath(); ctx.arc(mx, my, mR, 0, TAU); ctx.clip();
          for (const [ax, ay, ar] of [[0.25, 0.15, 0.3], [-0.3, 0.35, 0.18], [0.1, -0.4, 0.15], [-0.2, -0.1, 0.12], [0.45, -0.15, 0.1]]) {
            ctx.fillStyle = hot > 0.3 ? 'rgba(80,20,10,0.35)' : 'rgba(70,66,62,0.32)'; ctx.beginPath(); ctx.ellipse(mx + ax * mR, my + ay * mR, ar * mR, ar * mR * 0.85, 0, 0, TAU); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = Math.max(0.8, mR * 0.025); ctx.beginPath(); ctx.arc(mx + ax * mR, my + ay * mR, ar * mR, 2.2, 4.6); ctx.stroke();
          }
          const tg = ctx.createLinearGradient(mx - mR, my - mR * 0.6, mx + mR, my + mR * 0.6); tg.addColorStop(0.45, 'rgba(0,0,12,0)'); tg.addColorStop(1, 'rgba(0,0,12,0.75)'); ctx.fillStyle = tg; ctx.fillRect(mx - mR, my - mR, mR * 2, mR * 2);
          ctx.restore();
        };
        const behindMoon = my + mR < cy - R * 0.2 || Math.hypot(mx - cx, my - cy) > R + mR;
        if (m < 4580 && !behindMoon) drawMoon();

        /* atmosfera: halou exterior, mai puternic pe partea luminată */
        const ac = look.atm;
        const ag = ctx.createRadialGradient(cx, cy, R * 0.97, cx, cy, R * 1.12);
        ag.addColorStop(0, A.rgba(ac, 0.4)); ag.addColorStop(0.35, A.rgba(ac, 0.1)); ag.addColorStop(1, A.rgba(ac, 0));
        ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, TAU); ctx.fill();

        const debK = m > 4440 && m < 4592 ? Math.min(1, (4592 - m) / 20) * Math.min(1, (m - 4440) / 60) : 0;
        if (debK > 0) debris(cx, cy, R, debK, t, false);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, cx - R, cy - R, R * 2, R * 2);
        /* margine luminoasă pe partea însorită */
        if (debK > 0) debris(cx, cy, R, debK, t, true);
        if (m < 4580 && behindMoon) drawMoon();

        /* Theia, chiar înainte de impact */
        if (m > 4588) {
          const k = clamp((m - 4588) / 12, 0, 1), tr = R * 0.52, tx = Math.max(tr * 0.75, cx - R * (0.95 + 0.35 * k)), ty = Math.max(cy - U + tr * 0.9, cy - R * (0.55 + 0.25 * k));
          A.sphere(ctx, tx, ty, tr, '#8a6a58', { lx: -0.5, ly: -0.5, rimColor: '#ffb070' });
          A.label(ctx, 'Theia', tx, ty - tr - A.fs(U, 0.05, 14), { size: A.fs(U, 0.045, 13), color: '#ffd9b0' });
        }
        /* bombardamentul timpuriu: meteoriți cu dâre */
        if (m > 3900) for (let i = 0; i < 3; i++) {
          const per = 2.2 + i * 0.37, a = ((t + i * 1.31) % per) / per, ang = -2.4 + i * 0.55, tgt = ang + 0.5;
          const x0 = cx + Math.cos(ang) * R * 2.2, y0 = cy + Math.sin(ang) * R * 1.6, x1 = cx + Math.cos(tgt) * R * 0.9, y1 = cy + Math.sin(tgt) * R * 0.9;
          if (a < 0.8) meteor(x0, y0, x1, y1, A.ease.in(a / 0.8), Math.max(2.5, R * 0.018));
          else { const fk = (a - 0.8) / 0.2; A.glow(ctx, x1, y1, R * (0.03 + 0.06 * fk), '#ffd08a', 0.6 * (1 - fk)); }
        }
        /* asteroidul de acum 66 de milioane de ani */
        const ix = cx - R * 0.35, iy = cy + R * 0.15;
        if (m > 66 && m < 72) { const k = clamp((72 - m) / 6, 0, 1); meteor(ix - R * 1.6, iy - R * 1.5, ix, iy, A.ease.in(k), Math.max(4, R * 0.035)); }
        if (m < 69 && m > 63) {
          const k = 1 - Math.abs(m - 66) / 3;
          ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
          const sr = R * (0.12 + (66 - Math.min(66, m) + 0.3) * 0.12);
          ctx.fillStyle = A.rgba('#2a1c14', 0.45 * k); ctx.beginPath(); ctx.ellipse(ix, iy, sr * 1.35, sr * 1.2, 0, 0, TAU); ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = A.rgba('#ff9a40', 0.8 * k); ctx.lineWidth = Math.max(3, R * 0.03); ctx.beginPath(); ctx.ellipse(ix, iy, sr, sr * 0.88, 0, 0, TAU); ctx.stroke();
          ctx.strokeStyle = A.rgba('#ffd08a', 0.55 * k); ctx.lineWidth = Math.max(1.5, R * 0.008);
          for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + 0.3, l0 = sr * 0.4, l1 = sr * (1.1 + 0.5 * ((i * 7) % 3) / 2); ctx.beginPath(); ctx.moveTo(ix + Math.cos(a) * l0, iy + Math.sin(a) * l0); ctx.lineTo(ix + Math.cos(a) * l1, iy + Math.sin(a) * l1); ctx.stroke(); }
          ctx.restore();
          A.glow(ctx, ix, iy, R * 0.25, '#fff0c0', 0.8 * k);
        }

        /* titlul: cât de demult */
        const top = cy - U;
        A.text(ctx, m >= 1 ? 'Acum ' + maText(m) : 'Azi', cx, top + A.fs(U, 0.06, 16) * 0.9, { size: A.fs(U, 0.075, 18), weight: 800 });
        /* medalionul epocii (desenat) */
        const k = eraIdx(), ir = clamp(U * 0.16, 30, 62), ix2 = api.freeW - ir - 14, iy2 = top + ir + 6;
        const pop = A.ease.back(clamp((t - eraChangeT) * 2.5, 0, 1));
        drawIcon(ctx, k, ix2, iy2, ir * (0.6 + 0.4 * pop), t);
        A.label(ctx, ERAS[k].n, ix2 + ir, iy2 + ir + A.fs(U, 0.05, 14), { size: A.fs(U, 0.04, 13), align: 'right' });
      }
      return { frame: frame };
    }
  });
})();
