/* ============================================================
   DATE ASTRONOMICE — Universul Nostru
   Unități: distanțe în metri, perioade în zile.
   Pozițiile sunt aproximative (model didactic, nu efemeridă).
   ============================================================ */

const AU = 1.495978707e11;      // unitate astronomică
const LY = 9.4607304725808e15;  // an-lumină
const PC = 3.0856775814914e16;  // parsec
const KPC = 1000 * PC;
const MPC = 1e6 * PC;

/* ---------- SOARELE ---------- */
const SUN = {
  id: 'sun', name: 'Soarele', type: 'Stea (pitică galbenă)',
  radius: 6.9634e8, color: '#ffd24a', glow: '#ff9d2e',
  texture: 'sun',
  facts: [
    ['Diametru', '1.392.000 km (109 Pământuri)'],
    ['Temperatura la suprafață', '≈ 5.500 °C'],
    ['În miez', '≈ 15.000.000 °C'],
    ['Vârstă', '≈ 4,6 miliarde de ani'],
    ['Distanța de la Pământ', '150 milioane km (8 minute-lumină)'],
    ['Masa', '99,86% din tot Sistemul Solar']
  ],
  desc: 'Soarele este steaua noastră: o sferă uriașă de gaz fierbinte care produce energie prin fuziune nucleară — în fiecare secundă transformă 600 de milioane de tone de hidrogen în heliu. Lumina și căldura lui fac posibilă viața pe Pământ.',
  fun: 'Dacă Soarele ar fi o minge de fotbal, Pământul ar fi un grăunte de nisip la 25 de metri distanță!'
};

/* ---------- PLANETE ---------- */
/* a = semiaxa mare (m), e = excentricitate, P = perioada (zile),
   phase = unghiul de start (grade), rot = perioada de rotație (ore) */
const PLANETS = [
  {
    id: 'mercury', name: 'Mercur', type: 'Planetă telurică',
    a: 0.387098 * AU, e: 0.2056, P: 87.969, phase: 20,
    radius: 2.4397e6, color: '#a89a8c', texture: 'cratered',
    facts: [
      ['Distanța de la Soare', '58 milioane km'],
      ['Un an', '88 de zile pământene'],
      ['O zi', '176 de zile pământene'],
      ['Temperatura', 'de la −180 °C la +430 °C'],
      ['Sateliți naturali', 'niciunul'],
      ['Diametru', '4.879 km']
    ],
    desc: 'Mercur este cea mai mică planetă și cea mai apropiată de Soare. Nu are atmosferă care să rețină căldura, așa că ziua se încinge ca un cuptor, iar noaptea îngheață. Suprafața lui e plină de cratere, ca a Lunii.',
    fun: 'Pe Mercur o zi durează mai mult decât un an! Se rotește foarte încet în jurul propriei axe.'
  },
  {
    id: 'venus', name: 'Venus', type: 'Planetă telurică',
    a: 0.723332 * AU, e: 0.0068, P: 224.701, phase: 120,
    radius: 6.0518e6, color: '#e8c87a', texture: 'venus',
    facts: [
      ['Distanța de la Soare', '108 milioane km'],
      ['Un an', '225 de zile'],
      ['Temperatura', '+465 °C (constant)'],
      ['Atmosfera', '96% dioxid de carbon'],
      ['Sateliți naturali', 'niciunul'],
      ['Diametru', '12.104 km']
    ],
    desc: 'Venus e aproape gemenea Pământului în mărime, dar are o atmosferă groasă de dioxid de carbon care prinde căldura — un efect de seră scăpat de sub control. Plouă cu acid sulfuric, iar presiunea la suprafață e de 90 de ori mai mare decât pe Pământ.',
    fun: 'Venus se rotește invers decât celelalte planete: acolo Soarele răsare la apus!'
  },
  {
    id: 'earth', name: 'Pământul', type: 'Planetă telurică',
    a: 1.000000 * AU, e: 0.0167, P: 365.256, phase: 250,
    radius: 6.371e6, color: '#4a9fd8', texture: 'earth',
    facts: [
      ['Distanța de la Soare', '150 milioane km'],
      ['Un an', '365,25 zile'],
      ['O zi', '24 de ore'],
      ['Temperatura medie', '+15 °C'],
      ['Sateliți naturali', '1 — Luna'],
      ['Diametru', '12.742 km'],
      ['Apă', '71% din suprafață']
    ],
    desc: 'Casa noastră — singura lume cunoscută cu viață. Are apă lichidă, o atmosferă cu oxigen și un câmp magnetic care ne apără de radiația Soarelui. Toți oamenii care au existat vreodată au trăit aici.',
    fun: 'Pământul nu e o sferă perfectă: e puțin turtit la poli și umflat la Ecuator, pentru că se învârte.',
    moons: [
      {
        id: 'moon', name: 'Luna', type: 'Satelit natural',
        a: 3.844e8, e: 0.0549, P: 27.322, phase: 40,
        radius: 1.7374e6, color: '#cfcac0', texture: 'cratered',
        facts: [
          ['Distanța de la Pământ', '384.400 km'],
          ['Diametru', '3.474 km'],
          ['Un tur al Pământului', '27,3 zile'],
          ['Gravitație', '1/6 din cea de pe Pământ'],
          ['Oameni care au pășit pe ea', '12']
        ],
        desc: 'Luna este singurul satelit natural al Pământului și singurul loc din afara planetei pe care au pășit oameni. Ne arată mereu aceeași față, pentru că se rotește exact în același ritm în care ne înconjoară.',
        fun: 'Urmele pașilor astronauților sunt încă acolo — nu există vânt care să le șteargă.'
      }
    ]
  },
  {
    id: 'mars', name: 'Marte', type: 'Planetă telurică',
    a: 1.523679 * AU, e: 0.0934, P: 686.980, phase: 310,
    radius: 3.3895e6, color: '#d1603d', texture: 'mars',
    facts: [
      ['Distanța de la Soare', '228 milioane km'],
      ['Un an', '687 de zile'],
      ['O zi', '24 h 37 min'],
      ['Temperatura medie', '−63 °C'],
      ['Sateliți naturali', '2 — Phobos și Deimos'],
      ['Diametru', '6.779 km']
    ],
    desc: 'Planeta Roșie își ia culoarea de la rugina (oxidul de fier) din praful ei. Are cel mai înalt vulcan din Sistemul Solar, Olympus Mons (22 km), și un canion, Valles Marineris, lung de 4.000 km. Acum pe Marte lucrează roboți trimiși de noi.',
    fun: 'Pe Marte ai putea sări de trei ori mai sus decât pe Pământ, pentru că gravitația e mult mai slabă.',
    moons: [
      { id: 'phobos', name: 'Phobos', type: 'Satelit natural', a: 9.376e6, e: 0.0151, P: 0.319, phase: 0,
        radius: 1.11e4, color: '#9a8f86', texture: 'rock',
        facts: [['Diametru', '22 km'], ['Un tur al lui Marte', '7 ore 39 min']],
        desc: 'Phobos e un satelit mic, neregulat, ca un cartof de piatră. Se apropie încet de Marte și, în câteva milioane de ani, se va sfărâma.',
        fun: 'Phobos ocolește Marte de trei ori într-o singură zi marțiană.' },
      { id: 'deimos', name: 'Deimos', type: 'Satelit natural', a: 2.346e7, e: 0.0002, P: 1.263, phase: 180,
        radius: 6.2e3, color: '#8d857d', texture: 'rock',
        facts: [['Diametru', '12 km'], ['Un tur al lui Marte', '30 ore']],
        desc: 'Deimos e cel mai mic dintre cei doi sateliți ai lui Marte — atât de mic că gravitația lui abia te-ar ține la suprafață.',
        fun: 'Numele lor vin din mitologia greacă: „Frica" și „Groaza", însoțitorii zeului Marte.' }
    ]
  },
  {
    id: 'jupiter', name: 'Jupiter', type: 'Gigantă gazoasă',
    a: 5.2044 * AU, e: 0.0489, P: 4332.59, phase: 75,
    radius: 6.9911e7, color: '#d8ae7e', texture: 'jupiter',
    facts: [
      ['Distanța de la Soare', '778 milioane km'],
      ['Un an', '11,9 ani pământeni'],
      ['O zi', 'doar 9 h 56 min'],
      ['Sateliți naturali', '95 cunoscuți'],
      ['Diametru', '139.820 km (11 Pământuri)'],
      ['Compoziție', 'hidrogen și heliu']
    ],
    desc: 'Jupiter e cea mai mare planetă: ar încăpea în ea peste 1.300 de Pământuri. Nu are suprafață solidă — e o minge imensă de gaz cu furtuni care durează secole. Marea Pată Roșie este un uragan mai lat decât Pământul.',
    fun: 'Jupiter e un „scut" pentru noi: cu gravitația lui uriașă deviază comete și asteroizi care altfel ar veni spre Pământ.',
    moons: [
      { id: 'io', name: 'Io', type: 'Satelit natural', a: 4.217e8, e: 0.0041, P: 1.769, phase: 0,
        radius: 1.8216e6, color: '#e8d96a', texture: 'io',
        facts: [['Diametru', '3.643 km'], ['Vulcani activi', 'peste 400']],
        desc: 'Io e locul cel mai vulcanic din Sistemul Solar. Jupiter o frământă cu gravitația lui și o încinge din interior, aruncând lavă la 300 km în spațiu.',
        fun: 'Io e galbenă-portocalie pentru că e acoperită de sulf de la erupții.' },
      { id: 'europa', name: 'Europa', type: 'Satelit natural', a: 6.709e8, e: 0.009, P: 3.551, phase: 90,
        radius: 1.5608e6, color: '#d9cfc0', texture: 'europa',
        facts: [['Diametru', '3.122 km'], ['Crustă de gheață', '15–25 km'], ['Ocean dedesubt', 'până la 100 km adâncime']],
        desc: 'Europa are o crustă de gheață netedă, crăpată, iar dedesubt un ocean de apă sărată — poate mai multă apă decât toate oceanele Pământului. Este unul dintre cele mai promițătoare locuri pentru a căuta viață.',
        fun: 'Sonda Europa Clipper zboară chiar acum spre ea ca să-i studieze oceanul ascuns.' },
      { id: 'ganymede', name: 'Ganymede', type: 'Satelit natural', a: 1.0704e9, e: 0.0013, P: 7.155, phase: 200,
        radius: 2.6341e6, color: '#b5a898', texture: 'cratered',
        facts: [['Diametru', '5.268 km'], ['Record', 'cel mai mare satelit din Sistemul Solar']],
        desc: 'Ganymede e mai mare decât planeta Mercur și singurul satelit cu câmp magnetic propriu. Are și el un ocean de apă sub gheață.',
        fun: 'Dacă ar orbita Soarele în loc de Jupiter, l-am numi planetă.' },
      { id: 'callisto', name: 'Callisto', type: 'Satelit natural', a: 1.8827e9, e: 0.0074, P: 16.689, phase: 300,
        radius: 2.4103e6, color: '#8e8275', texture: 'cratered',
        facts: [['Diametru', '4.821 km'], ['Vârsta suprafeței', '≈ 4 miliarde de ani']],
        desc: 'Callisto are cea mai plină de cratere suprafață din Sistemul Solar — nimic nu a mai schimbat-o de miliarde de ani. E ca un album de fotografii al istoriei timpurii.',
        fun: 'Galileo a descoperit acești patru sateliți în 1610 cu un telescop mai slab decât multe binocluri de azi.' }
    ]
  },
  {
    id: 'saturn', name: 'Saturn', type: 'Gigantă gazoasă',
    a: 9.5826 * AU, e: 0.0565, P: 10759.22, phase: 200,
    radius: 5.8232e7, color: '#e3d2a0', texture: 'saturn', rings: true,
    facts: [
      ['Distanța de la Soare', '1,43 miliarde km'],
      ['Un an', '29,5 ani pământeni'],
      ['Inelele', 'lățime 280.000 km, grosime ≈ 10 m'],
      ['Sateliți naturali', '146 cunoscuți'],
      ['Diametru', '116.460 km'],
      ['Densitate', 'mai mică decât a apei']
    ],
    desc: 'Saturn e planeta cu cele mai spectaculoase inele: miliarde de bucăți de gheață și rocă, de la grăunțe de praf la blocuri cât o casă, care o înconjoară ca un disc uriaș.',
    fun: 'Saturn e atât de ușoară pentru mărimea ei că, dacă ai avea o cadă suficient de mare, ar pluti!',
    moons: [
      { id: 'titan', name: 'Titan', type: 'Satelit natural', a: 1.2219e9, e: 0.0288, P: 15.945, phase: 30,
        radius: 2.5747e6, color: '#d9a85c', texture: 'titan',
        facts: [['Diametru', '5.150 km'], ['Atmosfera', 'mai densă decât a Pământului'], ['Temperatura', '−179 °C']],
        desc: 'Titan e singurul satelit cu o atmosferă adevărată și singurul loc din afara Pământului cu lacuri și fluvii la suprafață — doar că sunt de metan lichid, nu de apă.',
        fun: 'Pe Titan, cu gravitația mică și aerul dens, ai putea zbura dând din niște aripi prinse de brațe.' },
      { id: 'enceladus', name: 'Enceladus', type: 'Satelit natural', a: 2.380e8, e: 0.0047, P: 1.370, phase: 150,
        radius: 2.521e5, color: '#f0f4f6', texture: 'ice',
        facts: [['Diametru', '504 km'], ['Gheizere', 'la polul sud, până la 500 km înălțime']],
        desc: 'Enceladus e o lume mică de gheață care împroașcă în spațiu gheizere de apă dintr-un ocean ascuns. O parte din apa aceea formează unul dintre inelele lui Saturn.',
        fun: 'Sonda Cassini a zburat chiar prin acele gheizere și a „gustat" apa unui ocean extraterestru.' }
    ]
  },
  {
    id: 'uranus', name: 'Uranus', type: 'Gigantă de gheață',
    a: 19.2184 * AU, e: 0.0457, P: 30688.5, phase: 330,
    radius: 2.5362e7, color: '#9fe3e8', texture: 'uranus', rings: true, ringScale: 1.9,
    facts: [
      ['Distanța de la Soare', '2,87 miliarde km'],
      ['Un an', '84 de ani pământeni'],
      ['Temperatura', '−224 °C (cea mai rece)'],
      ['Sateliți naturali', '28 cunoscuți'],
      ['Diametru', '50.724 km'],
      ['Înclinarea axei', '98° — stă culcată']
    ],
    desc: 'Uranus se rostogolește pe o parte, probabil după o coliziune uriașă din tinerețea ei. Culoarea albastru-verzuie vine de la metanul din atmosferă. Are și ea inele, dar subțiri și întunecate.',
    fun: 'Pentru că stă culcată, la polii lui Uranus vara durează 42 de ani, urmată de o noapte de 42 de ani.'
  },
  {
    id: 'neptune', name: 'Neptun', type: 'Gigantă de gheață',
    a: 30.07 * AU, e: 0.0113, P: 60182, phase: 150,
    radius: 2.4622e7, color: '#4a6fd4', texture: 'neptune',
    facts: [
      ['Distanța de la Soare', '4,5 miliarde km'],
      ['Un an', '165 de ani pământeni'],
      ['Vânturi', 'până la 2.100 km/h — record'],
      ['Sateliți naturali', '16 cunoscuți'],
      ['Diametru', '49.244 km'],
      ['Lumina Soarelui', 'de 900 de ori mai slabă decât la noi']
    ],
    desc: 'Neptun e ultima planetă, atât de departe că Soarele se vede ca o stea foarte strălucitoare. Are cele mai rapide vânturi din Sistemul Solar. A fost găsită cu creionul și hârtia: matematicienii au calculat unde trebuie să fie, înainte s-o vadă cineva.',
    fun: 'De la descoperirea lui, în 1846, Neptun a făcut abia un tur complet în jurul Soarelui (în 2011).',
    moons: [
      { id: 'triton', name: 'Triton', type: 'Satelit natural', a: 3.5476e8, e: 0.000016, P: -5.877, phase: 70,
        radius: 1.3534e6, color: '#d6dde0', texture: 'ice',
        facts: [['Diametru', '2.707 km'], ['Orbită', 'retrogradă — invers decât planeta']],
        desc: 'Triton ocolește Neptun în sens invers, semn că probabil a fost capturat din Centura Kuiper. Are gheizere de azot și o suprafață ca o coajă de pepene.',
        fun: 'Triton e unul dintre cele mai reci locuri cunoscute: −235 °C.' }
    ]
  }
];

/* ---------- PLANETE PITICE ---------- */
const DWARFS = [
  { id: 'ceres', name: 'Ceres', type: 'Planetă pitică (centura de asteroizi)',
    a: 2.7675 * AU, e: 0.0758, P: 1681.6, phase: 95, radius: 4.73e5, color: '#9b958c', texture: 'rock',
    facts: [['Diametru', '940 km'], ['Un an', '4,6 ani'], ['Descoperită', '1801']],
    desc: 'Ceres e cel mai mare obiect din centura de asteroizi și singura planetă pitică din interiorul Sistemului Solar. Are pete albe strălucitoare de sare și, probabil, apă înghețată sub suprafață.',
    fun: 'Ceres singură conține cam o treime din toată masa centurii de asteroizi.' },
  { id: 'pluto', name: 'Pluto', type: 'Planetă pitică (Centura Kuiper)',
    a: 39.48 * AU, e: 0.2488, P: 90560, phase: 240, radius: 1.1883e6, color: '#cbb295', texture: 'pluto',
    facts: [['Distanța de la Soare', '5,9 miliarde km'], ['Un an', '248 de ani'], ['Temperatura', '−229 °C'], ['Sateliți', '5 — cel mare e Charon']],
    desc: 'Pluto a fost considerată a noua planetă până în 2006, când a fost reclasificată ca planetă pitică. În 2015 sonda New Horizons ne-a arătat-o de aproape: munți de gheață de apă și o inimă uriașă de azot înghețat, Sputnik Planitia.',
    fun: 'Pluto și satelitul lui Charon se rotesc unul în jurul celuilalt ca doi dansatori care se țin de mâini.' },
  { id: 'haumea', name: 'Haumea', type: 'Planetă pitică (Centura Kuiper)',
    a: 43.13 * AU, e: 0.191, P: 103774, phase: 20, radius: 8.16e5, color: '#ddd6ca', texture: 'ice',
    facts: [['Un an', '284 de ani'], ['Formă', 'alungită ca o minge de rugbi'], ['O zi', 'doar 4 ore']],
    desc: 'Haumea se rotește atât de repede că s-a turtit și s-a alungit. Are și un inel subțire și doi sateliți mici.',
    fun: 'E una dintre cele mai rapide obiecte mari din Sistemul Solar: o zi acolo durează 4 ore.' },
  { id: 'makemake', name: 'Makemake', type: 'Planetă pitică (Centura Kuiper)',
    a: 45.43 * AU, e: 0.159, P: 112897, phase: 300, radius: 7.15e5, color: '#c9a391', texture: 'ice',
    facts: [['Un an', '309 ani'], ['Diametru', '1.430 km'], ['Descoperită', '2005']],
    desc: 'Makemake e un obiect înghețat, roșiatic, din Centura Kuiper. Numele vine de la zeul creator al poporului din Insula Paștelui.',
    fun: 'E atât de departe că Soarele de acolo ar arăta doar ca o stea foarte strălucitoare.' },
  { id: 'eris', name: 'Eris', type: 'Planetă pitică (disc difuz)',
    a: 67.78 * AU, e: 0.4418, P: 203830, phase: 130, radius: 1.163e6, color: '#e3e6e8', texture: 'ice',
    facts: [['Un an', '558 de ani'], ['Diametru', '2.326 km'], ['Masa', 'mai mare decât a lui Pluto']],
    desc: 'Descoperirea lui Eris, aproape la fel de mare ca Pluto, a dus la crearea categoriei de „planetă pitică". Orbita ei e foarte alungită și înclinată.',
    fun: 'Eris a fost poreclită la început „Xena", după eroina din serialul de televiziune.' },
  { id: 'sedna', name: 'Sedna', type: 'Obiect transneptunian',
    a: 506 * AU, e: 0.8496, P: 4.16e6, phase: 60, radius: 4.5e5, color: '#b8705a', texture: 'rock',
    facts: [['Un an', '11.400 de ani'], ['Cea mai mare depărtare', '937 AU']],
    desc: 'Sedna are una dintre cele mai mari orbite cunoscute. Chiar și în punctul cel mai apropiat e de două ori mai departe decât Neptun. Nimeni nu știe sigur cum a ajuns pe o asemenea orbită.',
    fun: 'Ultima dată când Sedna a fost atât de aproape de Soare ca acum, oamenii trăiau în epoca de piatră.' }
];

/* ---------- COMETE ---------- */
const COMETS = [
  { id: 'halley', name: 'Cometa Halley', type: 'Cometă periodică',
    a: 17.834 * AU, e: 0.96714, P: 27510, phase: 205, radius: 5.5e3, color: '#bfe9ff', texture: 'comet',
    facts: [['Perioada', '76 de ani'], ['Următoarea trecere', '2061'], ['Nucleul', '15 × 8 km']],
    desc: 'Cea mai faimoasă cometă. Pe măsură ce se apropie de Soare, gheața din ea se transformă în gaz și formează o coadă strălucitoare lungă de milioane de kilometri. Edmond Halley a fost primul care a înțeles că e aceeași cometă care revine.',
    fun: 'Dacă ai acum 6 ani, vei putea s-o vezi în 2061 — atunci vei avea 41!' },
  { id: 'encke', name: 'Cometa Encke', type: 'Cometă periodică',
    a: 2.215 * AU, e: 0.8485, P: 1204, phase: 40, radius: 2.4e3, color: '#cfe8e0', texture: 'comet',
    facts: [['Perioada', '3,3 ani — cea mai scurtă'], ['Nucleul', '4,8 km']],
    desc: 'Encke are cea mai scurtă perioadă dintre cometele cunoscute. Praful lăsat de ea în urmă produce ploaia de meteori Taurizii, în noiembrie.',
    fun: 'Stelele căzătoare pe care le vedem sunt adesea firimituri de praf lăsate de comete.' },
  { id: 'tempel1', name: 'Cometa Tempel 1', type: 'Cometă periodică',
    a: 3.145 * AU, e: 0.512, P: 2039, phase: 260, radius: 3.0e3, color: '#d3e7f2', texture: 'comet',
    facts: [['Perioada', '5,6 ani'], ['Vizitată de', 'Deep Impact (2005)']],
    desc: 'În 2005 oamenii au trimis intenționat un proiectil în această cometă, ca să vadă din ce e făcută pe dinăuntru. Praful ridicat ne-a arătat gheață, materie organică și pulbere foarte fină.',
    fun: 'Cometele sunt ca niște „frigidere" ale Sistemului Solar: păstrează materia din care s-au născut planetele.' },
  { id: 'churyumov', name: '67P / Churyumov–Gerasimenko', type: 'Cometă periodică',
    a: 3.463 * AU, e: 0.641, P: 2353, phase: 100, radius: 2.0e3, color: '#c9d8e0', texture: 'comet',
    facts: [['Perioada', '6,4 ani'], ['Formă', 'ca o rățușcă de cauciuc'], ['Vizitată de', 'Rosetta + Philae (2014)']],
    desc: 'Prima cometă pe care a aterizat un robot: micul modul Philae, trimis de sonda europeană Rosetta. Are două lobi lipiți, ca doi bulgări de zăpadă uniți.',
    fun: 'Gravitația e atât de slabă pe ea că Philae a ricoșat de două ori înainte să se oprească.' }
];

/* ---------- ASTEROIZI ---------- */
const ASTEROIDS = [
  { id: 'vesta', name: 'Vesta', type: 'Asteroid', a: 2.361 * AU, e: 0.0887, P: 1325.75, phase: 15,
    radius: 2.626e5, color: '#a8a096', texture: 'rock',
    facts: [['Diametru', '525 km'], ['Al doilea', 'cel mai masiv asteroid']],
    desc: 'Vesta e un asteroid uriaș, cu un crater atât de mare la polul sud că bucățile aruncate din el au ajuns până pe Pământ ca meteoriți.',
    fun: 'Unele pietre găsite pe Pământ sunt, de fapt, fragmente din Vesta.' },
  { id: 'pallas', name: 'Pallas', type: 'Asteroid', a: 2.773 * AU, e: 0.2302, P: 1686, phase: 170,
    radius: 2.56e5, color: '#9aa0a4', texture: 'rock',
    facts: [['Diametru', '512 km'], ['Orbită', 'foarte înclinată']],
    desc: 'Pallas are o orbită mult mai înclinată decât restul asteroizilor, ca și cum ar merge pe o altă bandă a autostrăzii.',
    fun: 'A fost descoperit în 1802, la doar un an după Ceres.' },
  { id: 'juno', name: 'Juno', type: 'Asteroid', a: 2.670 * AU, e: 0.2562, P: 1593, phase: 290,
    radius: 1.235e5, color: '#b0a79b', texture: 'rock',
    facts: [['Diametru', '247 km'], ['Descoperit', '1804']],
    desc: 'Juno a fost al treilea asteroid descoperit vreodată. La început, asteroizii au fost considerați planete — abia mai târziu s-a înțeles că sunt mii.',
    fun: 'În centura de asteroizi sunt peste un milion de obiecte mai mari de 1 km — și totuși e aproape goală: distanțele dintre ele sunt enorme.' },
  { id: 'bennu', name: 'Bennu', type: 'Asteroid apropiat de Pământ', a: 1.126 * AU, e: 0.2037, P: 436.6, phase: 215,
    radius: 2.45e2, color: '#6e665f', texture: 'rock',
    facts: [['Diametru', '490 m'], ['Probe aduse pe Pământ', '2023, de OSIRIS-REx']],
    desc: 'Bennu e un asteroid-grămadă de moloz: mii de pietre ținute slab împreună de gravitație. O sondă a luat mostre din el și le-a adus acasă pentru studiu.',
    fun: 'Când sonda a atins Bennu, s-a scufundat în suprafață ca într-o groapă de bile — nu era deloc tare.' },
  { id: 'eros', name: 'Eros', type: 'Asteroid apropiat de Pământ', a: 1.458 * AU, e: 0.2229, P: 643.2, phase: 55,
    radius: 8.42e3, color: '#8a7f73', texture: 'rock',
    facts: [['Lungime', '34 km'], ['Primul asteroid', 'pe care a aterizat o sondă (2001)']],
    desc: 'Eros e un asteroid alungit, ca o arahidă uriașă. Sonda NEAR Shoemaker s-a așezat pe el, prima aterizare pe un asteroid din istorie.',
    fun: 'Pe Eros ai cântări cam 1.000 de ori mai puțin decât pe Pământ.' }
];

/* ---------- SATELIȚI ARTIFICIALI ȘI SONDE ACTIVE (2026) ----------
   around: 'earth' | 'sun' ; r = rază orbitală reală (m), dar
   pentru vizibilitate sunt desenați cu distanțe exagerate. */
const SPACECRAFT = [
  { id: 'iss', name: 'ISS — Stația Spațială Internațională', short: 'ISS', around: 'earth',
    r: 6.771e6, P: 0.0645, phase: 0, color: '#ffffff', kind: 'station',
    facts: [['Altitudine', '≈ 400 km'], ['Viteză', '27.600 km/h'], ['Un tur al Pământului', '90 de minute'], ['Locuită continuu din', 'anul 2000'], ['Mărime', 'cât un teren de fotbal']],
    desc: 'Cel mai mare obiect construit de oameni în spațiu. Pe ea trăiesc permanent astronauți din mai multe țări, care fac experimente în imponderabilitate. Se poate vedea cu ochiul liber de pe Pământ, ca o stea foarte luminoasă care traversează cerul.',
    fun: 'Astronauții de pe ISS văd 16 răsărituri de soare în fiecare zi!' },
  { id: 'tiangong', name: 'Tiangong — stația spațială chineză', short: 'Tiangong', around: 'earth',
    r: 6.76e6, P: 0.0644, phase: 140, color: '#ffd9a0', kind: 'station',
    facts: [['Altitudine', '≈ 390 km'], ['Module', '3'], ['Echipaj', '3 astronauți']],
    desc: 'A doua stație spațială locuită care funcționează acum. A fost asamblată în orbită între 2021 și 2022.',
    fun: 'Numele „Tiangong" înseamnă „Palatul Ceresc".' },
  { id: 'hubble', name: 'Telescopul Spațial Hubble', short: 'Hubble', around: 'earth',
    r: 6.906e6, P: 0.0664, phase: 220, color: '#b9d9ff', kind: 'telescope',
    facts: [['Lansat', '1990'], ['Altitudine', '535 km'], ['Observații', 'peste 1,6 milioane']],
    desc: 'Hubble orbitează deasupra atmosferei, așa că vede cerul perfect clar. Ne-a dat cele mai frumoase imagini cu nebuloase și galaxii și a ajutat la măsurarea vârstei Universului.',
    fun: 'Astronauții l-au reparat și modernizat în zbor, de cinci ori.' },
  { id: 'starlink', name: 'Sateliți de comunicații (Starlink și alții)', short: 'sateliți', around: 'earth',
    r: 6.92e6, P: 0.0668, phase: 60, color: '#9fe6c0', kind: 'swarm',
    facts: [['Sateliți activi pe orbită', 'peste 12.000'], ['Altitudine tipică', '350–600 km'], ['La ce folosesc', 'internet, telefonie, navigație']],
    desc: 'În jurul Pământului se învârt mii de sateliți care ne aduc internet, televiziune, GPS și prognoza meteo. Noaptea pot fi văzuți ca puncte de lumină ce se deplasează constant printre stele.',
    fun: 'GPS-ul din telefon funcționează pentru că ascultă, în același timp, semnalele a cel puțin patru sateliți.' },
  { id: 'jwst', name: 'Telescopul Spațial James Webb', short: 'James Webb', around: 'sun',
    r: 1.01 * AU, P: 365.25, phase: 250, offsetDeg: 0, color: '#ffd27f', kind: 'telescope',
    facts: [['Lansat', '25 decembrie 2021'], ['Poziția', 'punctul L2, la 1,5 milioane km de Pământ'], ['Oglinda', '6,5 m, din 18 segmente aurite'], ['Temperatura de lucru', '−233 °C']],
    desc: 'Cel mai puternic telescop spațial. Privește în infraroșu, așa că vede prin nori de praf și până la primele galaxii formate după Big Bang. Stă mereu în umbra Pământului, la punctul L2, și ne însoțește în jurul Soarelui.',
    fun: 'Parasolarul lui, cât un teren de tenis, face diferența între +85 °C pe o față și −233 °C pe cealaltă.' },
  { id: 'parker', name: 'Parker Solar Probe', short: 'Parker', around: 'sun',
    r: 0.35 * AU, P: 88, phase: 120, color: '#ff9b5a', kind: 'probe',
    facts: [['Lansată', '2018'], ['Record de viteză', '692.000 km/h'], ['Cea mai apropiată trecere', '6,1 milioane km de Soare']],
    desc: 'Sonda care „atinge" Soarele: zboară prin coroana solară protejată de un scut termic de carbon. Este cel mai rapid obiect construit vreodată de om.',
    fun: 'La viteza ei maximă ar ajunge de la București la New York în mai puțin de un minut.' },
  { id: 'juno-probe', name: 'Sonda Juno (la Jupiter)', short: 'Juno (sondă)', around: 'sun',
    r: 5.2044 * AU, P: 4332.59, phase: 75, color: '#cfe0ff', kind: 'probe',
    facts: [['Lansată', '2011'], ['A ajuns la Jupiter', '2016'], ['Alimentare', 'panouri solare uriașe']],
    desc: 'Juno zboară pe orbite lungi în jurul lui Jupiter, trecând pe la poli ca să studieze câmpul magnetic, aurorele și ce se ascunde sub nori.',
    fun: 'Juno a fotografiat polii lui Jupiter pentru prima dată: arată ca o supă de cicloni albaștri.' },
  { id: 'clipper', name: 'Europa Clipper', short: 'Europa Clipper', around: 'sun',
    r: 3.1 * AU, P: 1900, phase: 155, color: '#a8f0ff', kind: 'probe',
    facts: [['Lansată', 'octombrie 2024'], ['Ajunge la Jupiter', '2030'], ['Misiune', 'oceanul de sub gheața Europei']],
    desc: 'Sondă aflată acum în drum spre Jupiter. Va trece de aproape pe lângă satelitul Europa de aproape 50 de ori, ca să afle dacă oceanul său ascuns ar putea găzdui viață.',
    fun: 'Are cele mai mari panouri solare trimise vreodată într-o misiune planetară — cât un teren de baschet.' },
  { id: 'lucy', name: 'Sonda Lucy', short: 'Lucy', around: 'sun',
    r: 4.1 * AU, P: 2200, phase: 40, color: '#e8c8ff', kind: 'probe',
    facts: [['Lansată', '2021'], ['Ținte', '8 asteroizi'], ['Durata misiunii', '12 ani']],
    desc: 'Lucy explorează asteroizii troieni — două „nori" de asteroizi care merg pe orbita lui Jupiter, înaintea și în urma planetei. Sunt fosile din vremea nașterii planetelor.',
    fun: 'Numele vine de la fosila „Lucy", pentru că și acești asteroizi sunt fosile — ale Sistemului Solar.' },
  { id: 'newhorizons', name: 'New Horizons', short: 'New Horizons', around: 'sun',
    r: 62 * AU, P: 1.8e5, phase: 192, color: '#ffe9b0', kind: 'probe',
    facts: [['Lansată', '2006'], ['A trecut pe la Pluto', '2015'], ['Distanța acum', 'peste 60 AU'], ['Semnalul', 'face ≈ 9 ore până la noi']],
    desc: 'Sonda care ne-a arătat prima dată Pluto de aproape. Acum continuă prin Centura Kuiper, trimițând date despre marginea Sistemului Solar.',
    fun: 'Pe ea sunt și câteva grame din cenușa lui Clyde Tombaugh, omul care a descoperit Pluto.' },
  { id: 'voyager1', name: 'Voyager 1', short: 'Voyager 1', around: 'sun',
    r: 168 * AU, P: 1.0e6, phase: 35, color: '#ffffff', kind: 'probe',
    facts: [['Lansată', '1977'], ['Distanța', 'peste 25 miliarde km'], ['Obiectul cel mai îndepărtat', 'construit de om'], ['Semnalul', 'face ≈ 23 de ore până la noi']],
    desc: 'Voyager 1 a părăsit zona de influență a Soarelui și zboară acum prin spațiul dintre stele. Încă vorbește cu noi, cu un emițător mai slab decât un bec de frigider.',
    fun: 'Duce cu ea un disc de aur cu muzică, saluturi în 55 de limbi și sunete de pe Pământ — un mesaj pentru oricine o va găsi.' },
  { id: 'voyager2', name: 'Voyager 2', short: 'Voyager 2', around: 'sun',
    r: 140 * AU, P: 9.0e5, phase: 220, color: '#f0f0f0', kind: 'probe',
    facts: [['Lansată', '1977'], ['Singura sondă', 'care a vizitat Uranus și Neptun'], ['Distanța', 'peste 21 miliarde km']],
    desc: 'Voyager 2 a făcut marele tur: Jupiter, Saturn, Uranus și Neptun. Este singura sondă care a văzut de aproape ultimele două planete.',
    fun: 'Calculatorul ei are o memorie de câteva mii de ori mai mică decât o singură poză din telefonul tău.' }
];

/* ---------- STELE APROPIATE (în ani-lumină) ---------- */
const STARS = [
  { id: 'proxima', name: 'Proxima Centauri', type: 'Pitică roșie', dist: 4.2465, ang: 15, size: 2.2, color: '#ff8a5c',
    facts: [['Distanța', '4,25 ani-lumină'], ['Cea mai apropiată stea', 'după Soare'], ['Planete', 'cel puțin 3, una în zona locuibilă']],
    desc: 'Cea mai apropiată stea de noi, dar prea slabă ca să fie văzută cu ochiul liber. În jurul ei se învârte Proxima b, o planetă cam de mărimea Pământului.',
    fun: 'Chiar și cu cea mai rapidă rachetă de azi, drumul până acolo ar dura peste 70.000 de ani.' },
  { id: 'alphacen', name: 'Alpha Centauri A și B', type: 'Sistem dublu', dist: 4.3650, ang: 18, size: 3.4, color: '#fff2cf',
    facts: [['Distanța', '4,37 ani-lumină'], ['Două stele', 'care se rotesc una în jurul celeilalte'], ['Alpha Centauri A', 'aproape gemenă cu Soarele']],
    desc: 'Sistemul stelar cel mai apropiat: două stele asemănătoare Soarelui care se învârt una în jurul celeilalte la fiecare 80 de ani, plus Proxima, mai departe.',
    fun: 'De pe o planetă din acest sistem ai vedea doi sori pe cer.' },
  { id: 'barnard', name: 'Steaua lui Barnard', type: 'Pitică roșie', dist: 5.963, ang: 115, size: 2.0, color: '#ff7a4d',
    facts: [['Distanța', '5,96 ani-lumină'], ['Mișcare pe cer', 'cea mai rapidă cunoscută']],
    desc: 'Se deplasează pe cer mai repede decât orice altă stea: cât lățimea Lunii la fiecare 180 de ani.',
    fun: 'În jur de anul 11800 va fi cea mai apropiată stea de Soare.' },
  { id: 'sirius', name: 'Sirius', type: 'Stea albă + pitică albă', dist: 8.6, ang: 205, size: 5.2, color: '#cfe4ff',
    facts: [['Distanța', '8,6 ani-lumină'], ['Strălucire', 'cea mai luminoasă stea de pe cerul nopții'], ['Însoțitor', 'o pitică albă, Sirius B']],
    desc: 'Sirius e steaua cea mai strălucitoare de pe cerul nostru, ușor de găsit iarna, sub constelația Orion. Are un însoțitor mic și foarte dens: o stea moartă, cât Pământul, dar grea ca Soarele.',
    fun: 'O linguriță de materie din Sirius B ar cântări câteva tone.' },
  { id: 'altair', name: 'Altair', type: 'Stea albă', dist: 16.7, ang: 300, size: 4.0, color: '#e8f0ff',
    facts: [['Distanța', '16,7 ani-lumină'], ['Rotație', 'o zi în 9 ore — e turtită']],
    desc: 'Altair se rotește atât de repede că nu mai e rotundă, ci turtită la poli. Face parte din Triunghiul de Vară, ușor de recunoscut pe cerul de vacanță.',
    fun: 'La Ecuatorul ei, materia se mișcă cu peste 280 km pe secundă.' },
  { id: 'vega', name: 'Vega', type: 'Stea albă-albăstruie', dist: 25.0, ang: 335, size: 4.6, color: '#dbe8ff',
    facts: [['Distanța', '25 ani-lumină'], ['Vârstă', '≈ 450 milioane de ani'], ['Are', 'un disc de praf în jur']],
    desc: 'Vega e una dintre cele mai strălucitoare stele de pe cerul de vară și a fost prima stea, în afară de Soare, fotografiată vreodată.',
    fun: 'Peste aproximativ 12.000 de ani, Vega va fi noua Stea Polară.' },
  { id: 'arcturus', name: 'Arcturus', type: 'Gigantă portocalie', dist: 36.7, ang: 90, size: 5.0, color: '#ffc98a',
    facts: [['Distanța', '36,7 ani-lumină'], ['Diametru', '25 de ori mai mare decât Soarele']],
    desc: 'O stea bătrână, umflată, care și-a consumat deja hidrogenul din miez. Așa va arăta și Soarele nostru peste câteva miliarde de ani.',
    fun: 'E cea mai strălucitoare stea din jumătatea nordică a cerului.' },
  { id: 'betelgeuse', name: 'Betelgeuse', type: 'Supergigantă roșie', dist: 548, ang: 240, size: 7.0, color: '#ff6b4a',
    facts: [['Distanța', '≈ 550 ani-lumină'], ['Diametru', 'de 700 de ori mai mare decât Soarele'], ['Viitor', 'va exploda ca supernovă']],
    desc: 'Umărul uriaș roșu al constelației Orion. Dacă ar fi în locul Soarelui, ar înghiți orbitele lui Mercur, Venus, Pământ și Marte. Va exploda ca supernovă — poate peste 100.000 de ani, poate mâine.',
    fun: 'Când va exploda, va străluci pe cerul nostru aproape ca Luna plină, și se va vedea și ziua.' },
  { id: 'rigel', name: 'Rigel', type: 'Supergigantă albastră', dist: 860, ang: 255, size: 6.4, color: '#a8c8ff',
    facts: [['Distanța', '≈ 860 ani-lumină'], ['Luminozitate', 'de 120.000 de ori Soarele']],
    desc: 'Piciorul strălucitor al lui Orion: o stea tânără, foarte fierbinte și extrem de puternică, care își arde combustibilul într-un ritm amețitor.',
    fun: 'Stelele albastre trăiesc scurt și intens: câteva milioane de ani, în loc de miliarde.' },
  { id: 'polaris', name: 'Polaris — Steaua Polară', type: 'Supergigantă galbenă', dist: 447, ang: 160, size: 5.6, color: '#fff6dd',
    facts: [['Distanța', '≈ 450 ani-lumină'], ['Poziția', 'aproape exact deasupra Polului Nord'], ['Sistem', 'de fapt trei stele']],
    desc: 'Steaua care arată mereu nordul, pentru că se află aproape pe prelungirea axei Pământului. Timp de mii de ani, călătorii și corăbierii s-au orientat după ea.',
    fun: 'Nu e cea mai strălucitoare stea de pe cer — doar cea mai folositoare.' }
];

/* ---------- OBIECTE DIN CALEA LACTEE (kpc față de Soare) ---------- */
const GALACTIC = [
  { id: 'orion-neb', name: 'Nebuloasa Orion (M42)', type: 'Nebuloasă de formare stelară',
    dist: 0.412, ang: 250, size: 24, color: '#ff9ec4', kind: 'nebula',
    facts: [['Distanța', '1.344 ani-lumină'], ['Lățime', '24 ani-lumină'], ['Stele noi', 'peste 700 în formare']],
    desc: 'O pepinieră de stele: un nor imens de gaz și praf în care se nasc chiar acum stele noi. Se vede ca o pată difuză sub cele trei stele din centura lui Orion, chiar și cu un binoclu.',
    fun: 'Soarele nostru s-a născut, acum 4,6 miliarde de ani, într-un nor exact ca acesta.' },
  { id: 'crab', name: 'Nebuloasa Crab (M1)', type: 'Rămășiță de supernovă',
    dist: 2.0, ang: 235, size: 11, color: '#9fe8c0', kind: 'nebula',
    facts: [['Distanța', '6.500 ani-lumină'], ['Explozia', 'văzută de pe Pământ în anul 1054'], ['În centru', 'un pulsar care se rotește de 30 de ori pe secundă']],
    desc: 'Ce rămâne după moartea unei stele masive: un nor de gaz care încă se împrăștie cu 1.500 km pe secundă. În mijloc stă o stea neutronică, materie strivită atât de tare încât o linguriță ar cântări un miliard de tone.',
    fun: 'Astronomii chinezi au notat în anul 1054 o „stea oaspete" care a strălucit ziua timp de 23 de zile. Asta a fost explozia.' },
  { id: 'eagle', name: 'Nebuloasa Acvila (M16)', type: 'Nebuloasă de formare stelară',
    dist: 2.0, ang: 300, size: 70, color: '#c0a8ff', kind: 'nebula',
    facts: [['Distanța', '≈ 6.500 ani-lumină'], ['Celebră pentru', '„Stâlpii Creației"']],
    desc: 'Aici se află Stâlpii Creației, coloane de gaz și praf înalte de ani-lumină, fotografiate de Hubble și apoi de James Webb. În vârfurile lor se aprind stele noi.',
    fun: 'Stâlpii sunt atât de mari că lumina are nevoie de 4 ani ca să treacă de la baza până la vârful unuia.' },
  { id: 'helix', name: 'Nebuloasa Helix', type: 'Nebuloasă planetară',
    dist: 0.199, ang: 20, size: 2.9, color: '#7fe3ff', kind: 'nebula',
    facts: [['Distanța', '650 ani-lumină'], ['Poreclă', '„Ochiul lui Dumnezeu"']],
    desc: 'Învelișul de gaz aruncat de o stea asemănătoare Soarelui la sfârșitul vieții. În centru a rămas o pitică albă, miezul fierbinte al stelei moarte. Așa se va sfârși și Soarele nostru.',
    fun: 'Nu are nicio legătură cu planetele: numele „nebuloasă planetară" vine de la faptul că, în telescoapele vechi, arătau ca niște discuri de planete.' },
  { id: 'pleiades', name: 'Pleiadele (Cloșca)', type: 'Roi deschis de stele',
    dist: 0.136, ang: 270, size: 43, color: '#cfe0ff', kind: 'cluster',
    facts: [['Distanța', '444 ani-lumină'], ['Stele', 'peste 1.000'], ['Vârstă', '≈ 100 milioane de ani']],
    desc: 'Un grup de stele tinere, albastre, născute împreună și încă înfășurate în rămășițe de praf. În România sunt cunoscute ca Cloșca cu pui.',
    fun: 'Cu ochiul liber se văd în general 6–7 stele, dar cu binoclul apar deodată zeci.' },
  { id: 'm13', name: 'Roiul Hercule (M13)', type: 'Roi globular',
    dist: 6.8, ang: 115, size: 145, color: '#ffe6b0', kind: 'cluster',
    facts: [['Distanța', '22.000 ani-lumină'], ['Stele', 'câteva sute de mii'], ['Vârstă', '≈ 11,6 miliarde de ani']],
    desc: 'O minge uriașă de stele foarte bătrâne, strânse atât de dens încât în centru sunt mii de stele într-un singur an-lumină cub.',
    fun: 'În 1974 oamenii au trimis un mesaj radio către M13. Răspunsul, dacă vine vreodată, ar ajunge în jurul anului 46000.' },
  { id: 'sgrA', name: 'Sagittarius A* — gaura neagră centrală', type: 'Gaură neagră supermasivă',
    dist: 8.178, ang: 180, size: 6, color: '#ffb347', kind: 'blackhole',
    facts: [['Distanța', '26.700 ani-lumină'], ['Masa', 'de 4,3 milioane de ori Soarele'], ['Diametrul orizontului', '24 milioane km'], ['Prima imagine', '2022'], ['Atenție', 'desenul este simbolic — în realitate e mult mai mică decât pare aici']],
    desc: 'În centrul galaxiei noastre se află o gaură neagră supermasivă. Nu „înghite" galaxia — stelele din jur o orbitează, așa cum planetele orbitează Soarele. Gravitația ei e atât de puternică încât nici lumina nu poate scăpa.',
    fun: 'A fost fotografiată prin unirea mai multor radiotelescoape de pe tot globul, formând un telescop virtual cât Pământul.' }
];

/* ---------- STRUCTURI MARI (Mpc) ---------- */
const DEEPSPACE = [
  { id: 'milkyway', name: 'Calea Lactee', type: 'Galaxie spirală (casa noastră)',
    dist: 0, ang: 0, size: 100, color: '#cfd8ff', kind: 'galaxy',
    facts: [['Diametru', '≈ 100.000 ani-lumină'], ['Stele', '100–400 miliarde'], ['Vârstă', '13,6 miliarde de ani'], ['Soarele face un tur', 'în 230 milioane de ani']],
    desc: 'Galaxia noastră: un disc uriaș de stele, gaz și praf, cu brațe spiralate. Soarele e o stea obișnuită, undeva pe brațul Orion, la două treimi de centru. Banda luminoasă care traversează cerul în nopțile întunecate e chiar discul ei, văzut din interior.',
    fun: 'De la ultima dată când Soarele a fost în acest punct al galaxiei, pe Pământ trăiau dinozaurii.' },
  { id: 'lmc', name: 'Marele Nor Magellanic', type: 'Galaxie satelit',
    dist: 0.0499, ang: 200, size: 14, color: '#ffd9e8', kind: 'galaxy',
    facts: [['Distanța', '163.000 ani-lumină'], ['Diametru', '14.000 ani-lumină']],
    desc: 'O galaxie mică ce orbitează Calea Lactee. Se vede cu ochiul liber din hemisfera sudică, ca un nor luminos desprins de restul cerului.',
    fun: 'Aici a explodat în 1987 supernova cea mai apropiată observată de astronomii moderni.' },
  { id: 'smc', name: 'Micul Nor Magellanic', type: 'Galaxie satelit',
    dist: 0.0613, ang: 210, size: 7, color: '#ffe3f0', kind: 'galaxy',
    facts: [['Distanța', '200.000 ani-lumină'], ['Diametru', '7.000 ani-lumină']],
    desc: 'Sora mai mică a Marelui Nor Magellanic. Amândouă sunt trase și deformate de gravitația Căii Lactee.',
    fun: 'Navigatorii lui Magellan le-au folosit ca repere pe cer în primul ocol al Pământului.' },
  { id: 'andromeda', name: 'Galaxia Andromeda (M31)', type: 'Galaxie spirală',
    dist: 0.765, ang: 325, size: 220, color: '#dfe6ff', kind: 'galaxy',
    facts: [['Distanța', '2,5 milioane ani-lumină'], ['Stele', '≈ 1.000 miliarde'], ['Diametru', '220.000 ani-lumină'], ['Se apropie cu', '110 km/s']],
    desc: 'Cea mai apropiată galaxie mare și cel mai îndepărtat obiect care se vede cu ochiul liber. Vine spre noi: peste aproximativ 4 miliarde de ani se va contopi cu Calea Lactee într-o galaxie nouă, mai mare.',
    fun: 'Lumina care ajunge acum la ochii noștri de la Andromeda a plecat de acolo înainte să existe primii oameni.' },
  { id: 'triangulum', name: 'Galaxia Triangulum (M33)', type: 'Galaxie spirală',
    dist: 0.97, ang: 315, size: 60, color: '#e8eaff', kind: 'galaxy',
    facts: [['Distanța', '3 milioane ani-lumină'], ['Stele', '≈ 40 miliarde']],
    desc: 'A treia galaxie mare din Grupul Local, după Andromeda și Calea Lactee. E bogată în regiuni unde se nasc stele.',
    fun: 'În nopți foarte întunecate, cu ochi antrenați, se poate zări și ea fără telescop.' },
  { id: 'sombrero', name: 'Galaxia Sombrero (M104)', type: 'Galaxie lenticulară',
    dist: 9.55, ang: 100, size: 50, color: '#ffeccf', kind: 'galaxy',
    facts: [['Distanța', '31 milioane ani-lumină'], ['Formă', 'disc văzut aproape din profil']],
    desc: 'O galaxie pe care o vedem aproape din muchie, cu o bandă groasă de praf care îi dă forma unei pălării mexicane.',
    fun: 'În centrul ei stă o gaură neagră de un miliard de ori mai masivă decât Soarele.' },
  { id: 'whirlpool', name: 'Galaxia Vârtej (M51)', type: 'Galaxie spirală în interacțiune',
    dist: 8.58, ang: 135, size: 76, color: '#d8e8ff', kind: 'galaxy',
    facts: [['Distanța', '28 milioane ani-lumină'], ['Însoțitor', 'o galaxie mică pe care o „mănâncă"']],
    desc: 'Cea mai frumoasă spirală văzută din față. Brațele ei sunt atât de clare pentru că o galaxie mică trece pe lângă ea și le stârnește cu gravitația.',
    fun: 'A fost prima galaxie în care oamenii au recunoscut o structură în spirală, în 1845.' },
  { id: 'virgo', name: 'Roiul de galaxii din Fecioară', type: 'Roi de galaxii',
    dist: 16.5, ang: 60, size: 15000, color: '#cfe0f0', kind: 'cluster',
    facts: [['Distanța', '54 milioane ani-lumină'], ['Galaxii', 'peste 1.300'], ['Întindere', '15 milioane ani-lumină']],
    desc: 'Cel mai apropiat roi mare de galaxii și centrul de greutate al superroiului în care ne aflăm. Grupul Local, cu Calea Lactee și Andromeda, cade încet spre el.',
    fun: 'Galaxia M87 din acest roi găzduiește prima gaură neagră fotografiată vreodată, în 2019.' },
  { id: 'laniakea', name: 'Superroiul Laniakea', type: 'Superroi de galaxii',
    dist: 77, ang: 45, size: 520000, color: '#b9c8e8', kind: 'web',
    facts: [['Întindere', '520 milioane ani-lumină'], ['Galaxii', 'peste 100.000'], ['Numit', 'în 2014']],
    desc: 'Casa noastră cosmică la cea mai mare scară: un superroi imens de galaxii legate între ele, care curg toate spre o regiune numită Marele Atractor. „Laniakea" înseamnă „cerul nemărginit" în hawaiană.',
    fun: 'La scara asta, galaxiile nu mai sunt puncte: sunt firicele pe o pânză uriașă de păianjen cosmică.' },
  { id: 'cosmicweb', name: 'Pânza cosmică', type: 'Structura Universului',
    dist: 400, ang: 0, size: 2000000, color: '#9fb0d8', kind: 'web',
    facts: [['Universul observabil', '93 miliarde ani-lumină în diametru'], ['Galaxii', '≈ 2.000 de miliarde'], ['Vârsta Universului', '13,8 miliarde de ani']],
    desc: 'La cea mai mare scară, Universul nu e nici gol, nici uniform: galaxiile se adună în filamente lungi și pereți, lăsând între ele goluri imense. Seamănă cu un burete sau cu o pânză de păianjen de lumină.',
    fun: 'Tot ce vedem — stele, galaxii, noi — e doar 5% din Univers. Restul e materie întunecată și energie întunecată, pe care încă nu le înțelegem.' }
];
