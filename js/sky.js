/* ============================================================
   CERUL NOPȚII — constelații
   Stelele au coordonate cerești reale (ascensie dreaptă în ore,
   declinație în grade), proiectate stereografic.
   ============================================================ */

const CONSTELLATIONS = [
  {
    id: 'ursamajor', name: 'Ursa Mare (Carul Mare)', latin: 'Ursa Major',
    stars: [
      ['Dubhe', 11.062, 61.75, 1.8], ['Merak', 11.031, 56.38, 2.4],
      ['Phecda', 11.897, 53.69, 2.4], ['Megrez', 12.257, 57.03, 3.3],
      ['Alioth', 12.900, 55.96, 1.8], ['Mizar', 13.399, 54.93, 2.2],
      ['Alkaid', 13.792, 49.31, 1.9]
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
    facts: [['Vizibilă din România', 'tot anul'], ['Stele principale', '7'], ['Folos', 'arată Steaua Polară']],
    desc: 'Cea mai ușor de recunoscut grupare de stele de pe cerul nostru: patru stele formează „căruța", trei „oiștea". Dacă prelungești de 5 ori linia dintre ultimele două stele ale căruței (Merak → Dubhe), ajungi exact la Steaua Polară, adică la nord.',
    fun: 'Mizar, a doua stea din coadă, are o însoțitoare mică numită Alcor. Dacă le vezi pe amândouă separat, ai ochi foarte buni — la romani era un test de vedere!'
  },
  {
    id: 'ursaminor', name: 'Ursa Mică (Carul Mic)', latin: 'Ursa Minor',
    stars: [
      ['Polaris', 2.530, 89.26, 2.0], ['Yildun', 17.537, 86.59, 4.3],
      ['ε UMi', 16.766, 82.04, 4.2], ['ζ UMi', 15.734, 77.79, 4.3],
      ['η UMi', 16.291, 75.76, 5.0], ['Kochab', 14.845, 74.16, 2.1],
      ['Pherkad', 15.345, 71.83, 3.0]
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
    facts: [['Vizibilă', 'tot anul, mereu la nord'], ['Steaua Polară', 'în vârful cozii']],
    desc: 'Un car mai mic și mai palid, cu Steaua Polară în vârful cozii. Toate stelele cerului par să se rotească în jurul ei în timpul nopții, pentru că ea stă aproape exact deasupra Polului Nord.',
    fun: 'Peste 12.000 de ani, Pământul își va fi schimbat înclinarea și „steaua nordului" va fi Vega, nu Polaris.'
  },
  {
    id: 'cassiopeia', name: 'Cassiopeia (litera W)', latin: 'Cassiopeia',
    stars: [
      ['Caph', 0.153, 59.15, 2.3], ['Schedar', 0.675, 56.54, 2.2],
      ['γ Cas', 0.945, 60.72, 2.5], ['Ruchbah', 1.430, 60.24, 2.7],
      ['Segin', 1.906, 63.67, 3.4]
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
    facts: [['Formă', 'un W (sau M, când e răsturnată)'], ['Vizibilă', 'tot anul']],
    desc: 'Cinci stele în zigzag, de cealaltă parte a Stelei Polare față de Carul Mare. Când Carul e jos, Cassiopeia e sus — se rotesc una în jurul celeilalte, în jurul nordului.',
    fun: 'În mitologia greacă, Cassiopeia era o regină îngâmfată, pedepsită să se învârtă veșnic pe cer, uneori cu capul în jos.'
  },
  {
    id: 'orion', name: 'Orion (Vânătorul)', latin: 'Orion',
    stars: [
      ['Betelgeuse', 5.919, 7.41, 0.5], ['Bellatrix', 5.418, 6.35, 1.6],
      ['Mintaka', 5.533, -0.30, 2.2], ['Alnilam', 5.604, -1.20, 1.7],
      ['Alnitak', 5.679, -1.94, 1.8], ['Saiph', 5.796, -9.67, 2.1],
      ['Rigel', 5.242, -8.20, 0.1], ['Meissa', 5.586, 9.93, 3.4]
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [4, 5], [2, 6], [0, 7], [1, 7]],
    facts: [['Vizibilă din România', 'iarna, seara, spre sud'], ['Centura', '3 stele în linie dreaptă'], ['Conține', 'Nebuloasa Orion']],
    desc: 'Cea mai spectaculoasă constelație de iarnă: un vânător uriaș cu umerii Betelgeuse (roșie) și Bellatrix, picioarele Rigel și Saiph, și trei stele perfect aliniate care formează centura. Sub centură atârnă „sabia", care de fapt e Nebuloasa Orion.',
    fun: 'Cele trei stele din centură se mai numesc, la noi, „Cei trei crai de la Răsărit" sau „Grebla".'
  },
  {
    id: 'taurus', name: 'Taurul', latin: 'Taurus',
    stars: [
      ['Aldebaran', 4.599, 16.51, 0.9], ['ε Tau', 4.478, 19.18, 3.5],
      ['δ Tau', 4.382, 17.54, 3.8], ['γ Tau', 4.330, 15.63, 3.6],
      ['ζ Tau', 5.627, 21.14, 3.0], ['Elnath', 5.438, 28.61, 1.7]
    ],
    lines: [[0, 3], [3, 2], [2, 1], [1, 5], [0, 4]],
    facts: [['Vizibilă', 'iarna'], ['Ochiul taurului', 'Aldebaran'], ['Conține', 'Pleiadele și Nebuloasa Crab']],
    desc: 'Un V de stele formează capul taurului, cu Aldebaran portocalie ca ochi, iar două stele mai depărtate sunt vârfurile coarnelor. Chiar lângă el strălucește ghemul mic al Pleiadelor.',
    fun: 'Taurul e desenat pe pereții peșterii Lascaux, acum 17.000 de ani — probabil cea mai veche hartă a cerului din lume.'
  },
  {
    id: 'gemini', name: 'Gemenii', latin: 'Gemini',
    stars: [
      ['Castor', 7.577, 31.89, 1.6], ['Pollux', 7.755, 28.03, 1.1],
      ['Alhena', 6.629, 16.40, 1.9], ['Wasat', 7.335, 21.98, 3.5],
      ['Mebsuta', 6.732, 25.13, 3.0], ['Tejat', 6.383, 22.51, 2.9]
    ],
    lines: [[0, 4], [4, 5], [0, 1], [1, 3], [3, 2]],
    facts: [['Vizibilă', 'iarna și primăvara'], ['Două stele strălucitoare', 'Castor și Pollux']],
    desc: 'Doi frați gemeni ținându-se de mână, cu capetele marcate de stelele Castor și Pollux, foarte apropiate pe cer și ușor de găsit deasupra lui Orion.',
    fun: 'Castor pare o singură stea, dar este de fapt un sistem de șase stele care se învârt unele în jurul altora.'
  },
  {
    id: 'canismajor', name: 'Câinele Mare', latin: 'Canis Major',
    stars: [
      ['Sirius', 6.752, -16.72, -1.5], ['Mirzam', 6.378, -17.96, 2.0],
      ['Wezen', 7.140, -26.39, 1.8], ['Adhara', 6.977, -28.97, 1.5],
      ['Aludra', 7.402, -29.30, 2.4]
    ],
    lines: [[1, 0], [0, 2], [2, 3], [2, 4]],
    facts: [['Vizibilă', 'iarna, jos spre sud'], ['Sirius', 'cea mai strălucitoare stea de pe cer']],
    desc: 'Câinele de vânătoare al lui Orion. Îl găsești ușor: prelungești centura lui Orion în jos, spre stânga, și dai peste Sirius, cea mai strălucitoare stea a cerului nostru.',
    fun: 'Egiptenii antici știau că, atunci când Sirius răsare înaintea Soarelui, urmează revărsarea Nilului.'
  },
  {
    id: 'leo', name: 'Leul', latin: 'Leo',
    stars: [
      ['Regulus', 10.139, 11.97, 1.4], ['η Leo', 10.122, 16.76, 3.5],
      ['Algieba', 10.333, 19.84, 2.1], ['ζ Leo', 10.278, 23.42, 3.4],
      ['μ Leo', 9.880, 26.01, 3.9], ['ε Leo', 9.764, 23.77, 3.0],
      ['Zosma', 11.235, 20.52, 2.6], ['θ Leo', 11.237, 15.43, 3.3],
      ['Denebola', 11.818, 14.57, 2.1]
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 7], [7, 8], [8, 6], [6, 7]],
    facts: [['Vizibilă', 'primăvara'], ['Semn distinctiv', 'o „seceră" ca un semn de întrebare întors']],
    desc: 'Un leu culcat: capul și coama formează o seceră care arată ca un semn de întrebare oglindit, iar corpul se termină cu un triunghi — coada, Denebola.',
    fun: 'În fiecare noiembrie, din direcția Leului vine ploaia de stele căzătoare Leonidele.'
  },
  {
    id: 'bootes', name: 'Boarul', latin: 'Boötes',
    stars: [
      ['Arcturus', 14.261, 19.18, -0.05], ['Izar', 14.750, 27.07, 2.4],
      ['γ Boo', 14.534, 38.31, 3.0], ['β Boo', 15.032, 40.39, 3.5],
      ['δ Boo', 15.258, 33.31, 3.5], ['ρ Boo', 14.531, 30.37, 3.6]
    ],
    lines: [[0, 5], [5, 2], [2, 3], [3, 4], [4, 1], [1, 0]],
    facts: [['Vizibilă', 'primăvara și vara'], ['Formă', 'un zmeu sau un con de înghețată']],
    desc: 'Se găsește urmând curba cozii Carului Mare: „arcul duce la Arcturus". Arcturus e o gigantă portocalie, una dintre cele mai strălucitoare stele ale cerului.',
    fun: 'În 1933, lumina lui Arcturus a fost folosită pentru a deschide oficial Expoziția Mondială de la Chicago.'
  },
  {
    id: 'cygnus', name: 'Lebăda (Crucea Nordului)', latin: 'Cygnus',
    stars: [
      ['Deneb', 20.690, 45.28, 1.3], ['Sadr', 20.370, 40.26, 2.2],
      ['Albireo', 19.512, 27.96, 3.1], ['δ Cyg', 19.750, 45.13, 2.9],
      ['Gienah', 20.770, 33.97, 2.5]
    ],
    lines: [[0, 1], [1, 2], [3, 1], [1, 4]],
    facts: [['Vizibilă', 'vara și toamna'], ['Zboară', 'de-a lungul Căii Lactee']],
    desc: 'O lebădă cu aripile întinse, care zboară chiar prin mijlocul benzii Căii Lactee. Se mai numește și Crucea Nordului, pentru că stelele ei formează o cruce clară.',
    fun: 'Albireo, „ciocul" lebedei, arată prin telescop ca două stele lipite: una aurie și una albastră. E perechea preferată a astronomilor amatori.'
  },
  {
    id: 'lyra', name: 'Lira', latin: 'Lyra',
    stars: [
      ['Vega', 18.615, 38.78, 0.0], ['ζ Lyr', 18.746, 37.60, 4.3],
      ['δ Lyr', 18.908, 36.90, 4.3], ['γ Lyr', 18.982, 32.69, 3.2],
      ['β Lyr', 18.834, 33.36, 3.5]
    ],
    lines: [[0, 1], [1, 4], [4, 3], [3, 2], [2, 1]],
    facts: [['Vizibilă', 'vara'], ['Vega', 'a cincea stea ca strălucire'], ['Conține', 'Nebuloasa Inel']],
    desc: 'O constelație mică, dar ușor de găsit după Vega, care strălucește puternic aproape la zenit în serile de vară. Restul stelelor formează un mic paralelogram — instrumentul muzical.',
    fun: 'Între cele două stele de jos ale paralelogramului se ascunde Nebuloasa Inel, un balon de gaz lăsat de o stea moartă.'
  },
  {
    id: 'aquila', name: 'Vulturul', latin: 'Aquila',
    stars: [
      ['Altair', 19.846, 8.87, 0.8], ['Tarazed', 19.771, 10.61, 2.7],
      ['Alshain', 19.922, 6.41, 3.7], ['δ Aql', 19.425, 3.11, 3.4],
      ['θ Aql', 20.188, -0.82, 3.2]
    ],
    lines: [[1, 0], [0, 2], [0, 3], [0, 4]],
    facts: [['Vizibilă', 'vara'], ['Altair', 'una dintre cele mai apropiate stele strălucitoare']],
    desc: 'Vulturul care zboară de-a lungul Căii Lactee, cu Altair ca ochi — ușor de recunoscut pentru că are câte o stea de fiecare parte, ca un semn de carte.',
    fun: 'Altair se rotește atât de repede (o zi în 9 ore) încât s-a turtit: e mai lată la mijloc decât de la pol la pol.'
  },
  {
    id: 'summertriangle', name: 'Triunghiul de Vară', latin: 'asterism',
    stars: [['Vega', 18.615, 38.78, 0.0], ['Deneb', 20.690, 45.28, 1.3], ['Altair', 19.846, 8.87, 0.8]],
    lines: [[0, 1], [1, 2], [2, 0]],
    facts: [['Vizibil', 'din iunie până în noiembrie'], ['Nu e constelație', 'ci un „asterism" — un desen din stele a trei constelații']],
    desc: 'Trei stele foarte strălucitoare din trei constelații diferite (Lira, Lebăda și Vulturul) formează un triunghi uriaș, imposibil de ratat pe cerul de vară. E cel mai bun punct de pornire pentru a învăța cerul de vară.',
    fun: 'Calea Lactee trece chiar prin mijlocul triunghiului — într-o noapte întunecată, departe de oraș, se vede ca un abur luminos.'
  },
  {
    id: 'scorpius', name: 'Scorpionul', latin: 'Scorpius',
    stars: [
      ['Antares', 16.490, -26.43, 1.1], ['Dschubba', 16.005, -22.62, 2.3],
      ['π Sco', 15.981, -26.11, 2.9], ['β Sco', 16.090, -19.80, 2.6],
      ['τ Sco', 16.598, -28.22, 2.8], ['ε Sco', 16.836, -34.29, 2.3],
      ['μ Sco', 16.864, -38.05, 3.0], ['ζ Sco', 16.911, -42.36, 3.6],
      ['η Sco', 17.203, -43.24, 3.3], ['θ Sco', 17.622, -42.99, 1.9],
      ['ι Sco', 17.793, -40.13, 3.0], ['κ Sco', 17.708, -39.03, 2.4],
      ['Shaula', 17.560, -37.10, 1.6], ['Lesath', 17.512, -37.30, 2.7]
    ],
    lines: [[3, 1], [1, 2], [1, 0], [0, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13]],
    facts: [['Vizibilă din România', 'vara, foarte jos la orizontul sudic'], ['Inima', 'Antares, o supergigantă roșie']],
    desc: 'Una dintre puținele constelații care chiar seamănă cu ce ar trebui: un scorpion cu cleștii sus, corpul curbat și acul în vârful cozii. Din România se vede doar parțial, foarte jos spre sud, în serile de vară.',
    fun: 'În mit, acest scorpion l-a ucis pe vânătorul Orion. De aceea zeii i-au pus la capete opuse ale cerului: când răsare Scorpionul, Orion apune.'
  },
  {
    id: 'pegasus', name: 'Pegas (Marele Pătrat)', latin: 'Pegasus',
    stars: [
      ['Alpheratz', 0.140, 29.09, 2.1], ['Scheat', 23.063, 28.08, 2.4],
      ['Markab', 23.079, 15.21, 2.5], ['Algenib', 0.221, 15.18, 2.8]
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0]],
    facts: [['Vizibilă', 'toamna'], ['Formă', 'un pătrat mare și gol']],
    desc: 'Calul înaripat se recunoaște după un pătrat uriaș de patru stele, aproape gol în interior. De la colțul lui din stânga-sus pornește șirul de stele al Andromedei — iar acolo se află galaxia Andromeda.',
    fun: 'Numără stelele pe care le vezi în interiorul pătratului: dacă vezi mai mult de 4–5, ai un cer foarte curat, fără poluare luminoasă.'
  },
  {
    id: 'crux', name: 'Crucea Sudului', latin: 'Crux',
    stars: [
      ['Acrux', 12.443, -63.10, 0.8], ['Mimosa', 12.795, -59.69, 1.3],
      ['Gacrux', 12.519, -57.11, 1.6], ['Imai', 12.252, -58.75, 2.8]
    ],
    lines: [[0, 2], [1, 3]],
    facts: [['Vizibilă', 'doar din emisfera sudică'], ['Cea mai mică', 'constelație de pe cer'], ['Folos', 'arată sudul']],
    desc: 'Cea mai mică constelație de pe cer și cel mai important reper al emisferei sudice: brațul ei lung arată spre Polul Sud ceresc. Apare pe steagurile Australiei, Noii Zeelande și Braziliei.',
    fun: 'Din România nu se vede niciodată — ar trebui să cobori până în Egipt sau mai jos ca să-i zărești vârful.'
  }
];

/* pentru fiecare constelație adăugăm tipul și id-urile pentru catalog */
CONSTELLATIONS.forEach((c) => { c.type = 'Constelație · ' + c.latin; });

/* ---------- starea hărții cerului ---------- */
const sky = { ra: 6.0, dec: 25, fov: 110, target: null };

/* stele de fundal pe sfera cerească (generate o dată) */
const SKY_BG = (function () {
  const rng = makeRng(31415);
  const arr = [];
  for (let i = 0; i < 1500; i++) {
    const ra = rng() * 24;
    const dec = Math.asin(rng() * 2 - 1) * 180 / Math.PI;
    arr.push([ra, dec, 0.4 + rng() * 1.3, 0.25 + rng() * 0.6]);
  }
  return arr;
})();

/* banda Căii Lactee, aproximată prin puncte în jurul ecuatorului galactic */
const MW_BAND = (function () {
  const rng = makeRng(2718);
  const pts = [];
  /* polul galactic nord: RA 12.86h, Dec +27.13 */
  const ra0 = 12.857 * 15 * Math.PI / 180, dec0 = 27.13 * Math.PI / 180;
  for (let i = 0; i < 2600; i++) {
    const t = rng() * Math.PI * 2;
    const spread = (rng() - 0.5) * 0.32 + (rng() - 0.5) * 0.18;
    /* un cerc mare perpendicular pe polul galactic */
    const x = Math.cos(t), y = Math.sin(t), z = spread;
    /* rotim sistemul astfel încât axa z să fie polul galactic */
    const sd = Math.sin(dec0), cd = Math.cos(dec0);
    const X = x * sd + z * cd;
    const Y = y;
    const Z = -x * cd + z * sd;
    const dec = Math.asin(Z / Math.sqrt(X * X + Y * Y + Z * Z));
    let ra = Math.atan2(Y, X) + ra0;
    ra = ((ra % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    pts.push([ra * 12 / Math.PI, dec * 180 / Math.PI, 0.35 + rng() * 0.8, 0.08 + rng() * 0.2]);
  }
  return pts;
})();

/* ---------- proiecție stereografică ---------- */
function skyProject(raH, decD, W, H) {
  const ra = raH * 15 * Math.PI / 180, dec = decD * Math.PI / 180;
  const ra0 = sky.ra * 15 * Math.PI / 180, dec0 = sky.dec * Math.PI / 180;
  const cosc = Math.sin(dec0) * Math.sin(dec) + Math.cos(dec0) * Math.cos(dec) * Math.cos(ra - ra0);
  if (cosc < -0.2) return null;
  const k = 2 / (1 + cosc);
  const x = k * Math.cos(dec) * Math.sin(ra - ra0);
  const y = k * (Math.cos(dec0) * Math.sin(dec) - Math.sin(dec0) * Math.cos(dec) * Math.cos(ra - ra0));
  const scale = (Math.min(W, H) * 0.5) / (2 * Math.tan((sky.fov * Math.PI / 180) / 4));
  return [W / 2 - x * scale, H / 2 - y * scale + (typeof viewShift === 'number' ? viewShift : 0)];
}

function skyStarRadius(mag) {
  return Math.max(1.1, 5.4 - mag * 0.85) * (sky.fov < 60 ? 1.35 : 1);
}

/* ---------- desenare ---------- */
function drawSky(W, H, ctx, hitList, showLabels, selected) {
  ctx.fillStyle = '#05070f';
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 1.15, 0, W / 2, H * 1.15, H * 1.3);
  g.addColorStop(0, 'rgba(30,45,90,0.5)');
  g.addColorStop(1, 'rgba(5,7,15,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  /* Calea Lactee */
  for (const p of MW_BAND) {
    const s = skyProject(p[0], p[1], W, H);
    if (!s || s[0] < -20 || s[0] > W + 20 || s[1] < -20 || s[1] > H + 20) continue;
    ctx.fillStyle = 'rgba(190,205,255,' + p[3] + ')';
    ctx.beginPath(); ctx.arc(s[0], s[1], p[2], 0, Math.PI * 2); ctx.fill();
  }

  /* stele de fundal */
  for (const p of SKY_BG) {
    const s = skyProject(p[0], p[1], W, H);
    if (!s || s[0] < -20 || s[0] > W + 20 || s[1] < -20 || s[1] > H + 20) continue;
    ctx.fillStyle = 'rgba(255,255,255,' + p[3] * 0.8 + ')';
    ctx.beginPath(); ctx.arc(s[0], s[1], p[2], 0, Math.PI * 2); ctx.fill();
  }

  /* constelații */
  for (const c of CONSTELLATIONS) {
    const pts = c.stars.map((st) => skyProject(st[1], st[2], W, H));
    const vis = pts.filter((p) => p && p[0] > -150 && p[0] < W + 150 && p[1] > -150 && p[1] < H + 150);
    if (!vis.length) continue;
    const hot = selected === c;

    /* linii */
    ctx.strokeStyle = hot ? 'rgba(120,225,255,0.95)' : 'rgba(130,170,245,0.45)';
    ctx.lineWidth = hot ? 2.4 : 1.4;
    ctx.beginPath();
    for (const [a, b] of c.lines) {
      const p1 = pts[a], p2 = pts[b];
      if (!p1 || !p2) continue;
      ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);
    }
    ctx.stroke();

    /* stele */
    for (let i = 0; i < c.stars.length; i++) {
      const p = pts[i];
      if (!p) continue;
      const st = c.stars[i];
      const r = skyStarRadius(st[3]);
      const gg = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 3.4);
      gg.addColorStop(0, '#ffffff');
      gg.addColorStop(0.25, 'rgba(215,235,255,0.9)');
      gg.addColorStop(1, 'rgba(160,200,255,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(p[0], p[1], r * 3.4, 0, Math.PI * 2); ctx.fill();
      hitList.push({ x: p[0], y: p[1], r: Math.max(r * 2, 13), obj: skyStarObject(st, c) });
      if (showLabels && st[3] < 2.6 && sky.fov < 150) {
        ctx.font = '600 12px "Trebuchet MS", sans-serif';
        ctx.fillStyle = 'rgba(190,215,255,0.85)';
        ctx.textAlign = 'left';
        ctx.fillText(st[0], p[0] + r * 2 + 3, p[1] + 4);
      }
    }

    /* numele constelației */
    const cx = vis.reduce((a, p) => a + p[0], 0) / vis.length;
    const cy = vis.reduce((a, p) => a + p[1], 0) / vis.length;
    if (showLabels) {
      ctx.save();
      ctx.font = (hot ? '700 ' : '600 ') + (hot ? 18 : 15) + 'px "Trebuchet MS", sans-serif';
      ctx.fillStyle = hot ? '#8fe8ff' : 'rgba(150,200,255,0.75)';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 7;
      ctx.fillText(c.name, cx, cy);
      ctx.restore();
    }
    hitList.push({ x: cx, y: cy, r: 26, obj: c, weak: true });
  }
}

/* o stea din constelație devine obiect „clicabil"; dacă o avem deja
   în catalogul principal, deschidem fișa completă */
const skyStarCache = new Map();
function skyStarObject(st, c) {
  const key = c.id + '|' + st[0];
  if (skyStarCache.has(key)) return skyStarCache.get(key);
  const known = STARS.find((s) => s.name.toLowerCase().startsWith(st[0].toLowerCase()) && st[0].length > 3);
  let obj;
  if (known) {
    obj = known;
  } else {
    obj = {
      id: 'skystar-' + key, name: st[0], type: 'Stea din ' + c.name,
      facts: [['Constelația', c.name], ['Magnitudine', String(st[3]) + ' (cu cât e mai mic, cu atât e mai strălucitoare)'],
      ['Poziția pe cer', st[1].toFixed(1) + ' h / ' + st[2].toFixed(0) + '°']],
      desc: 'O stea din constelația ' + c.name + '. Toate stelele pe care le vedem noaptea cu ochiul liber fac parte din galaxia noastră, Calea Lactee.',
      fun: 'Lumina ei a plecat la drum cu mulți ani înainte să ajungă la ochiul tău — privim mereu în trecut.'
    };
  }
  skyStarCache.set(key, obj);
  return obj;
}

/* centrează harta pe o constelație */
function skyGoTo(c) {
  let ra = 0, dec = 0, n = 0;
  /* media pozițiilor, cu grijă la trecerea peste 0h */
  let sx0 = 0, sy0 = 0;
  for (const st of c.stars) {
    const a = st[1] * Math.PI / 12;
    sx0 += Math.cos(a); sy0 += Math.sin(a);
    dec += st[2]; n++;
  }
  ra = Math.atan2(sy0 / n, sx0 / n) * 12 / Math.PI;
  if (ra < 0) ra += 24;
  sky.ra = ra; sky.dec = dec / n;
  sky.fov = c.id === 'summertriangle' ? 95 : 70;
}
