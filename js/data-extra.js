/* ============================================================
   DATE SUPLIMENTARE — se adaugă peste listele din data.js
   ============================================================ */

/* ---------- sateliți naturali noi ---------- */
function addMoons(hostId, list, where) {
  const host = (where || PLANETS).find((p) => p.id === hostId);
  if (!host) return;
  host.moons = (host.moons || []).concat(list);
}

addMoons('saturn', [
  { id: 'mimas', name: 'Mimas', type: 'Satelit natural', a: 1.855e8, e: 0.0196, P: 0.942, phase: 220,
    radius: 1.982e5, color: '#d8dde0', texture: 'cratered',
    facts: [['Diametru', '396 km'], ['Craterul Herschel', '130 km — o treime din satelit']],
    desc: 'Mimas are un crater uriaș care îl face să semene izbitor cu „Steaua Morții" din filme. Impactul care l-a format aproape că a spart satelitul în bucăți.',
    fun: 'Dacă acel asteroid ar fi fost puțin mai mare, Mimas nu ar mai exista azi.' },
  { id: 'rhea', name: 'Rhea', type: 'Satelit natural', a: 5.271e8, e: 0.0013, P: 4.518, phase: 100,
    radius: 7.638e5, color: '#cfd4d8', texture: 'ice',
    facts: [['Diametru', '1.528 km'], ['Compoziție', 'trei sferturi gheață de apă']],
    desc: 'Al doilea satelit ca mărime al lui Saturn: o lume de gheață veche, plină de cratere strălucitoare.',
    fun: 'Gheața de acolo e atât de rece (−174 °C) încât e tare ca piatra.' },
  { id: 'iapetus', name: 'Iapetus', type: 'Satelit natural', a: 3.561e9, e: 0.0286, P: 79.32, phase: 330,
    radius: 7.345e5, color: '#b9ab96', texture: 'cratered',
    facts: [['Diametru', '1.469 km'], ['Ciudățenie', 'o emisferă albă, cealaltă neagră ca smoala']],
    desc: 'Iapetus are două fețe: una albă ca zăpada, cealaltă neagră ca funinginea. Praful întunecat vine de la un alt satelit și se lipește de fața din față, în direcția de mers.',
    fun: 'Are și un „brâu" de munți înalți de 13 km chiar pe ecuator, ca o cusătură de minge.' }
]);

addMoons('uranus', [
  { id: 'miranda', name: 'Miranda', type: 'Satelit natural', a: 1.299e8, e: 0.0013, P: 1.413, phase: 60,
    radius: 2.357e5, color: '#cdd3d6', texture: 'ice',
    facts: [['Diametru', '471 km'], ['Faleza Verona', '20 km înălțime — cea mai mare din Sistemul Solar']],
    desc: 'Miranda arată ca și cum ar fi fost spartă și lipită la loc: are canioane uriașe și terase care nu seamănă cu nimic altceva.',
    fun: 'O piatră aruncată de pe Faleza Verona ar cădea 12 minute până jos.' },
  { id: 'titania', name: 'Titania', type: 'Satelit natural', a: 4.358e8, e: 0.0011, P: 8.706, phase: 190,
    radius: 7.884e5, color: '#c3bdb4', texture: 'cratered',
    facts: [['Diametru', '1.578 km'], ['Cel mai mare', 'satelit al lui Uranus']],
    desc: 'Titania e cel mai mare satelit al lui Uranus, cu canioane lungi de sute de kilometri, săpate când interiorul ei a înghețat și s-a umflat.',
    fun: 'Numele vine din piesa lui Shakespeare „Visul unei nopți de vară" — toți sateliții lui Uranus poartă nume din literatură.' }
]);

addMoons('pluto', [
  { id: 'charon', name: 'Charon', type: 'Satelit natural', a: 1.9596e7, e: 0.0002, P: 6.387, phase: 15,
    radius: 6.06e5, color: '#b8b3ab', texture: 'cratered',
    facts: [['Diametru', '1.212 km'], ['Mărime', 'jumătate cât Pluto'], ['Distanța', '19.600 km']],
    desc: 'Charon e atât de mare față de Pluto încât cele două se rotesc în jurul unui punct aflat în afara lui Pluto — ca doi copii care se învârt ținându-se de mâini.',
    fun: 'De pe Pluto, Charon s-ar vedea mereu în același loc pe cer, uriaș, și nu ar apune niciodată.' }
], DWARFS);

/* ---------- comete noi ---------- */
COMETS.push(
  { id: 'halebopp', name: 'Cometa Hale-Bopp', type: 'Cometă cu perioadă lungă',
    a: 186 * AU, e: 0.995, P: 925000, phase: 182, radius: 3.0e4, color: '#d8f0ff', texture: 'comet',
    facts: [['Perioada', '≈ 2.530 de ani'], ['Vizibilă cu ochiul liber', '18 luni, în 1996–1997'], ['Nucleul', '60 km']],
    desc: 'Una dintre cele mai spectaculoase comete din istorie: a strălucit pe cerul nopții un an și jumătate și a avut două cozi, una albastră de gaz și una albă de praf.',
    fun: 'Se va întoarce în jurul anului 4385 — părinții părinților părinților tăi, de 100 de ori.' },
  { id: 'neowise', name: 'Cometa NEOWISE', type: 'Cometă cu perioadă lungă',
    a: 358 * AU, e: 0.9992, P: 2470000, phase: 95, radius: 2.5e3, color: '#ffe3c0', texture: 'comet',
    facts: [['Descoperită', 'martie 2020'], ['Perioada', '≈ 6.800 de ani'], ['Nucleul', '5 km']],
    desc: 'Cea mai frumoasă cometă văzută de pe Pământ în ultimii 20 de ani. În iulie 2020 a putut fi fotografiată chiar și cu telefonul, deasupra orizontului.',
    fun: 'A fost descoperită de un telescop spațial care caută asteroizi periculoși — NEOWISE.' }
);

/* ---------- asteroizi noi ---------- */
ASTEROIDS.push(
  { id: 'psyche', name: 'Psyche', type: 'Asteroid metalic', a: 2.923 * AU, e: 0.134, P: 1826, phase: 240,
    radius: 1.11e5, color: '#8f8d93', texture: 'rock',
    facts: [['Diametru', '226 km'], ['Compoziție', 'mult fier și nichel'], ['Sondă pe drum', 'Psyche, ajunge în 2029']],
    desc: 'Psyche e un asteroid făcut în mare parte din metal — se crede că este miezul dezgolit al unei planete care nu a mai apucat să se formeze.',
    fun: 'Fierul din el ar ajunge pentru a construi poduri pe toată planeta de miliarde de ori.' },
  { id: 'apophis', name: 'Apophis', type: 'Asteroid apropiat de Pământ', a: 0.9224 * AU, e: 0.1915, P: 323.6, phase: 70,
    radius: 1.85e2, color: '#7a6e63', texture: 'rock',
    facts: [['Diametru', '370 m'], ['Trece pe lângă noi', '13 aprilie 2029'], ['La ce distanță', '31.600 km — sub sateliții TV']],
    desc: 'În 2029 acest asteroid va trece mai aproape de Pământ decât sateliții de televiziune și se va vedea cu ochiul liber. Astronomii au verificat: nu ne va lovi.',
    fun: 'Va fi prima dată când un asteroid atât de mare trece atât de aproape și putem să-l studiem pe îndelete.' },
  { id: 'itokawa', name: 'Itokawa', type: 'Asteroid apropiat de Pământ', a: 1.324 * AU, e: 0.28, P: 556, phase: 300,
    radius: 1.65e2, color: '#9a9186', texture: 'rock',
    facts: [['Lungime', '535 m'], ['Primele probe aduse', 'de sonda japoneză Hayabusa, 2010']],
    desc: 'Un asteroid în formă de alună, din care sonda japoneză Hayabusa a adus pe Pământ primele fire de praf dintr-un asteroid.',
    fun: 'Nu e o piatră întreagă, ci o grămadă de pietriș ținută laolaltă de gravitație.' }
);

/* ---------- sonde și roboți noi (inclusiv pe Marte) ---------- */
SPACECRAFT.push(
  { id: 'chandra', name: 'Observatorul Chandra (raze X)', short: 'Chandra', around: 'earth',
    r: 1.3e8, P: 2.65, phase: 300, color: '#c8b4ff', kind: 'telescope',
    facts: [['Lansat', '1999'], ['Vede', 'raze X, nu lumină obișnuită'], ['Orbită', 'foarte alungită, până la 139.000 km']],
    desc: 'Chandra vede razele X pe care atmosfera noastră le oprește: gaz încins la milioane de grade, rămășițe de supernove și materie care cade în găuri negre.',
    fun: 'Oglinzile lui sunt cele mai netede suprafețe făcute vreodată — dacă ar fi mari cât România, cea mai mare denivelare ar fi de 5 cm.' },
  { id: 'gaia', name: 'Gaia — cartograful galaxiei', short: 'Gaia', around: 'sun',
    r: 1.01 * AU, P: 365.25, phase: 252, color: '#b7ffd8', kind: 'telescope',
    facts: [['Lansat', '2013 (ESA)'], ['Stele măsurate', 'aproape 2 miliarde'], ['Poziția', 'punctul L2, lângă James Webb']],
    desc: 'Gaia a măsurat poziția și mișcarea a aproape două miliarde de stele și a făcut cea mai bună hartă 3D a Căii Lactee. Datorită ei știm cum arată galaxia noastră din afară.',
    fun: 'Gaia poate măsura un unghi atât de mic cât diametrul unui fir de păr văzut de la 1.000 km.' },
  { id: 'solarorbiter', name: 'Solar Orbiter', short: 'Solar Orbiter', around: 'sun',
    r: 0.6 * AU, P: 168, phase: 200, color: '#ffc46b', kind: 'probe',
    facts: [['Lansată', '2020 (ESA/NASA)'], ['Premieră', 'primele poze cu polii Soarelui']],
    desc: 'Sondă care zboară pe lângă Soare pe o orbită înclinată, ca să vadă ceea ce de pe Pământ nu se vede niciodată: polii Soarelui.',
    fun: 'Scutul ei termic e acoperit cu un praf de cărbune, ca picturile rupestre din peșteri.' },
  { id: 'bepicolombo', name: 'BepiColombo (spre Mercur)', short: 'BepiColombo', around: 'sun',
    r: 0.45 * AU, P: 110, phase: 25, color: '#ffd9b0', kind: 'probe',
    facts: [['Lansată', '2018 (ESA/JAXA)'], ['Intră pe orbita lui Mercur', 'noiembrie 2026 – 2027'], ['Frânare', 'a folosit 9 treceri pe lângă planete']],
    desc: 'Pentru a ajunge la Mercur nu e de ajuns să zbori spre el: trebuie să frânezi enorm, altfel Soarele te trage prea tare. BepiColombo a făcut nouă ocoluri pe lângă Pământ, Venus și Mercur ca să încetinească.',
    fun: 'Drumul până la Mercur, vecinul nostru, durează 7 ani — mai mult decât până la Jupiter.' },
  { id: 'juice', name: 'JUICE (spre sateliții lui Jupiter)', short: 'JUICE', around: 'sun',
    r: 2.4 * AU, P: 1360, phase: 310, color: '#a9d8ff', kind: 'probe',
    facts: [['Lansată', 'aprilie 2023 (ESA)'], ['Ajunge la Jupiter', '2031'], ['Ținta principală', 'Ganymede']],
    desc: 'Sondă europeană aflată acum în drum spre Jupiter, ca să studieze cei trei sateliți cu oceane ascunse: Ganymede, Callisto și Europa.',
    fun: 'Va fi prima navă care intră pe orbita unui satelit al altei planete.' },
  /* --- roboți pe Marte --- */
  { id: 'perseverance', name: 'Roverul Perseverance', short: 'Perseverance', around: 'mars',
    r: 3.39e6, P: 400, phase: 30, color: '#ffffff', kind: 'rover', icon: 'rover',
    trail: [[-0.12,-0.28],[0.00,-0.30],[0.12,-0.22],[0.20,-0.08],[0.16,0.06],[0.04,0.12],[-0.08,0.04],[-0.10,-0.10],[0.02,-0.12]],
    startLabel: 'Aterizare', endLabel: 'Aici ajunge',
    facts: [['A aterizat', '18 februarie 2021'], ['Unde', 'craterul Jezero, un fost lac'], ['Mărime', 'cât o mașină mică'], ['Ce face', 'strânge probe de rocă pentru a fi aduse pe Pământ']],
    desc: 'Cel mai avansat robot trimis pe Marte. Caută urme de viață veche în rocile unui lac secat și pune deoparte tuburi cu probe, pe care o misiune viitoare le va aduce acasă. Tot el a produs pentru prima dată oxigen din aerul marțian.',
    fun: 'Pe parașuta lui era scris, în cod binar, mesajul „Dare Mighty Things" — „Îndrăznește lucruri mărețe".' },
  { id: 'curiosity', name: 'Roverul Curiosity', short: 'Curiosity', around: 'mars',
    r: 3.39e6, P: 520, phase: 210, color: '#ffe0b0', kind: 'rover', icon: 'rover',
    trail: [[-0.50,0.30],[-0.36,0.34],[-0.22,0.30],[-0.10,0.38],[0.04,0.36],[0.16,0.44],[0.28,0.40],[0.40,0.50]],
    startLabel: 'Aterizare', endLabel: 'Muntele Sharp',
    facts: [['A aterizat', '6 august 2012'], ['Unde', 'craterul Gale, la poalele unui munte'], ['Distanța parcursă', 'peste 34 km'], ['Alimentare', 'baterie nucleară']],
    desc: 'Curiosity urcă de peste zece ani pe un munte marțian, citind straturile de rocă precum paginile unei cărți. A dovedit că pe Marte a existat apă dulce, bună de băut.',
    fun: 'În fiecare an, pe 5 august, roverul își cântă singur „La mulți ani" — sau cel puțin a făcut-o o dată, în 2013.' },
  { id: 'ingenuity', name: 'Elicopterul Ingenuity', short: 'Ingenuity', around: 'mars',
    r: 3.39e6, P: 300, phase: 120, color: '#9fe6ff', kind: 'rover', icon: 'heli',
    trail: [[-0.12,-0.28],[0.02,-0.34],[0.14,-0.26],[0.10,-0.12],[-0.02,-0.06],[-0.14,-0.12]],
    startLabel: 'Primul zbor', endLabel: 'Ultimul zbor',
    facts: [['Primul zbor', '19 aprilie 2021'], ['Zboruri', '72'], ['Greutate', '1,8 kg'], ['Ultimul zbor', 'ianuarie 2024']],
    desc: 'Primul aparat care a zburat pe o altă planetă. Aerul de pe Marte e de 100 de ori mai subțire decât al nostru, așa că elicele lui se roteau de 40 de ori pe secundă. A zburat de 72 de ori, deși era construit pentru 5.',
    fun: 'Sub panoul lui solar are o bucățică din aripa primului avion al fraților Wright.' }
);

/* ---------- stele noi ---------- */
STARS.push(
  { id: 'aldebaran', name: 'Aldebaran', type: 'Gigantă portocalie', dist: 65.3, ang: 265, size: 5.2, color: '#ffb46b', rsun: 44,
    facts: [['Distanța', '65 ani-lumină'], ['Diametru', 'de 44 de ori Soarele'], ['Unde', 'ochiul Taurului']],
    desc: 'Ochiul roșu-portocaliu al constelației Taurul. Pare să facă parte din roiul Hyadelor, dar de fapt se află mult mai aproape de noi.',
    fun: 'Sonda Pioneer 10, plecată în 1972, se îndreaptă spre Aldebaran: va ajunge peste 2 milioane de ani.' },
  { id: 'antares', name: 'Antares', type: 'Supergigantă roșie', dist: 550, ang: 150, size: 6.6, color: '#ff6a52', rsun: 680,
    facts: [['Distanța', '≈ 550 ani-lumină'], ['Diametru', 'de 680 de ori Soarele'], ['Unde', 'inima Scorpionului']],
    desc: 'Inima roșie a Scorpionului. Numele înseamnă „rivala lui Marte", pentru că are aceeași culoare roșiatică.',
    fun: 'Dacă ar lua locul Soarelui, suprafața ei ar ajunge dincolo de orbita lui Marte.' },
  { id: 'capella', name: 'Capella', type: 'Sistem de patru stele', dist: 42.9, ang: 35, size: 5.0, color: '#ffe9b0', rsun: 12,
    facts: [['Distanța', '43 ani-lumină'], ['Stele', '4, două mari și două mici'], ['Unde', 'constelația Vizitiul']],
    desc: 'Ce pare o singură stea strălucitoare sunt de fapt patru stele legate între ele prin gravitație: două gigante galbene și două pitice roșii.',
    fun: 'E una dintre cele mai strălucitoare stele de pe cerul de iarnă al României.' },
  { id: 'deneb', name: 'Deneb', type: 'Supergigantă albă', dist: 2615, ang: 310, size: 6.2, color: '#dce9ff', rsun: 203,
    facts: [['Distanța', '≈ 2.600 ani-lumină'], ['Luminozitate', 'de 200.000 de ori Soarele'], ['Unde', 'coada Lebedei']],
    desc: 'Una dintre cele mai puternice stele pe care le putem vedea cu ochiul liber. Pare doar potrivit de strălucitoare pentru că este extrem de departe.',
    fun: 'Lumina care ajunge azi la noi de la Deneb a plecat de acolo pe vremea Daciei.' },
  { id: 'fomalhaut', name: 'Fomalhaut', type: 'Stea albă tânără', dist: 25.1, ang: 85, size: 4.4, color: '#e6f0ff', rsun: 1.8,
    facts: [['Distanța', '25 ani-lumină'], ['Vârsta', 'doar 440 milioane de ani'], ['În jur', 'un inel uriaș de praf']],
    desc: 'O stea tânără înconjurată de un inel de praf și pietre — un sistem planetar prins chiar în timpul formării. Telescopul James Webb i-a fotografiat inelele.',
    fun: 'Așa arăta Sistemul Solar la începutul lui, înainte ca planetele să se adune.' },
  { id: 'trappist', name: 'TRAPPIST-1', type: 'Pitică roșie cu 7 planete', dist: 40.7, ang: 195, size: 2.4, color: '#ff8257', rsun: 0.12,
    facts: [['Distanța', '41 ani-lumină'], ['Planete', '7, toate de mărimea Pământului'], ['Trei dintre ele', 'în zona cu apă lichidă']],
    desc: 'O stea mică și roșie cu șapte planete de mărimea Pământului strânse foarte aproape de ea. Este cel mai interesant sistem găsit până acum în căutarea vieții.',
    fun: 'De pe o planetă din acest sistem, celelalte s-ar vedea pe cer mai mari decât Luna noastră.' }
);
/* raza stelelor deja existente, în raze solare (pentru comparații) */
const STAR_RADII = {
  proxima: 0.15, alphacen: 1.22, barnard: 0.19, sirius: 1.71, altair: 1.8,
  vega: 2.36, arcturus: 25, betelgeuse: 764, rigel: 78, polaris: 46
};
Object.keys(STAR_RADII).forEach((id) => {
  const s = STARS.find((x) => x.id === id);
  if (s) s.rsun = STAR_RADII[id];
});

/* ---------- nebuloase și roiuri noi ---------- */
GALACTIC.push(
  { id: 'lagoon', name: 'Nebuloasa Lagună (M8)', type: 'Nebuloasă de formare stelară',
    dist: 1.25, ang: 170, size: 110, color: '#ff8fb0', kind: 'nebula',
    facts: [['Distanța', '4.100 ani-lumină'], ['Lățime', '110 ani-lumină']],
    desc: 'Un nor roz uriaș din constelația Săgetătorul, destul de strălucitor cât să fie văzut cu binoclul în nopțile de vară. În interior, stele noi suflă bule în gaz.',
    fun: 'Culoarea roz vine de la hidrogenul care strălucește, încins de stelele tinere din interior.' },
  { id: 'ring', name: 'Nebuloasa Inel (M57)', type: 'Nebuloasă planetară',
    dist: 0.72, ang: 300, size: 2.6, color: '#8ff0d0', kind: 'nebula',
    facts: [['Distanța', '2.300 ani-lumină'], ['Formă', 'un inel — de fapt un balon văzut din față']],
    desc: 'Pare un inel de fum colorat, dar este un balon de gaz aruncat de o stea pe moarte; îl vedem prin mijloc, de aceea marginile par mai luminoase.',
    fun: 'E una dintre primele ținte pe care și le aleg copiii când se uită prima dată printr-un telescop.' },
  { id: 'horsehead', name: 'Nebuloasa Cap de Cal', type: 'Nebuloasă întunecată',
    dist: 0.42, ang: 248, size: 3.5, color: '#b38cff', kind: 'nebula',
    facts: [['Distanța', '1.375 ani-lumină'], ['Ce este', 'un nor de praf care acoperă lumina din spate']],
    desc: 'Un nor de praf în formă de cap de cal, care se vede ca o siluetă neagră pe un fundal roșu luminos. E unul dintre cele mai fotografiate obiecte de pe cer.',
    fun: 'Peste câteva milioane de ani, „calul" se va destrăma — profită acum de el.' },
  { id: 'carina', name: 'Nebuloasa Carina', type: 'Nebuloasă de formare stelară',
    dist: 2.3, ang: 205, size: 460, color: '#ffb48f', kind: 'nebula',
    facts: [['Distanța', '7.500 ani-lumină'], ['Lățime', '460 ani-lumină'], ['Conține', 'Eta Carinae, o stea uriașă instabilă']],
    desc: 'Una dintre cele mai mari pepiniere de stele din galaxie. „Stâncile cosmice" fotografiate de telescopul James Webb în prima lui imagine sunt chiar marginea acestui nor.',
    fun: 'Steaua Eta Carinae din mijloc e de 100 de ori mai grea decât Soarele și poate exploda oricând.' },
  { id: 'omegacen', name: 'Omega Centauri', type: 'Roi globular',
    dist: 5.2, ang: 230, size: 150, color: '#ffeccf', kind: 'cluster',
    facts: [['Distanța', '17.000 ani-lumină'], ['Stele', '10 milioane'], ['Cel mai mare', 'roi globular al galaxiei']],
    desc: 'O minge de zece milioane de stele — atât de mare încât s-ar putea să fie, de fapt, miezul rămas dintr-o galaxie mică înghițită de Calea Lactee.',
    fun: 'În centrul lui, cerul nopții ar fi plin de mii de stele mai strălucitoare decât Venus.' }
);

/* ---------- galaxii noi ---------- */
DEEPSPACE.push(
  { id: 'm87', name: 'Galaxia M87', type: 'Galaxie eliptică uriașă',
    dist: 16.4, ang: 62, size: 240, color: '#ffeedd', kind: 'galaxy',
    facts: [['Distanța', '53 milioane ani-lumină'], ['Gaura neagră', 'de 6,5 miliarde de ori Soarele'], ['Prima fotografie a unei găuri negre', '2019']],
    desc: 'Galaxia uriașă din centrul Roiului Fecioarei. Gaura ei neagră a fost prima fotografiată vreodată, în 2019, și aruncă un jet de materie lung de 5.000 de ani-lumină.',
    fun: 'În acea primă fotografie, inelul portocaliu este lumină care a ocolit gaura neagră înainte să ajungă la noi.' },
  { id: 'bode', name: 'Galaxia Bode (M81)', type: 'Galaxie spirală',
    dist: 3.7, ang: 20, size: 90, color: '#e4ecff', kind: 'galaxy',
    facts: [['Distanța', '12 milioane ani-lumină'], ['Vecină cu', 'Galaxia Țigara (M82)']],
    desc: 'O spirală aproape perfectă, cu brațe clare. Împreună cu vecina ei M82 formează o pereche care se influențează prin gravitație.',
    fun: 'Poate fi văzută cu un binoclu bun, de la țară, ca o pată ovală de lumină.' },
  { id: 'cigar', name: 'Galaxia Țigara (M82)', type: 'Galaxie cu explozie de stele',
    dist: 3.6, ang: 24, size: 37, color: '#ffd2c0', kind: 'galaxy',
    facts: [['Distanța', '12 milioane ani-lumină'], ['Naște stele', 'de 10 ori mai repede decât Calea Lactee']],
    desc: 'Trasă și frământată de gravitația vecinei M81, această galaxie a intrat într-o criză de naștere de stele și aruncă în afară coloane roșii de gaz fierbinte.',
    fun: 'Arată ca o țigară aprinsă, cu „fum" roșu ieșind din mijloc.' },
  { id: 'centaurusA', name: 'Centaurus A', type: 'Galaxie activă',
    dist: 3.8, ang: 240, size: 60, color: '#dcd4ff', kind: 'galaxy',
    facts: [['Distanța', '12 milioane ani-lumină'], ['Semn particular', 'o bandă groasă de praf peste mijloc'], ['Emite', 'unde radio puternice']],
    desc: 'Cea mai apropiată galaxie activă: în centrul ei, o gaură neagră uriașă înghite materie și aruncă jeturi gigantice, vizibile pentru radiotelescoape.',
    fun: 'Banda ei de praf e rămășița unei galaxii mai mici pe care a înghițit-o.' },
  { id: 'localgroup', name: 'Grupul Local', type: 'Grup de galaxii (casa noastră)',
    dist: 0.42, ang: 325, size: 10000, color: '#a8c0f0', kind: 'web',
    facts: [['Întindere', '10 milioane ani-lumină'], ['Galaxii', 'peste 80'], ['Cele mari', 'Andromeda, Calea Lactee, Triangulum']],
    desc: 'Vecinătatea noastră de galaxii: peste 80 de galaxii legate prin gravitație, dintre care doar trei sunt mari. Restul sunt galaxii pitice care le dau târcoale.',
    fun: 'Calea Lactee și Andromeda cad una spre cealaltă și se vor contopi — dar stelele sunt atât de depărtate între ele încât nu se va ciocni aproape nimic.' }
);
