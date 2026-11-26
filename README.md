# Universul Nostru

Aplicație web educațională (PWA) pentru copii, în limba română — gândită pentru a fi folosită cu un proiector.
Prima secțiune, **Spațiul**, este completă: Sistemul Solar cu orbite reale, sateliți naturali, sateliți
artificiali și sonde active, comete, asteroizi, stele vecine, nebuloase, Calea Lactee, galaxii și pânza cosmică.

Totul este desenat procedural în `<canvas>` — nu există imagini externe, biblioteci sau conexiune la internet.

## Cum o pornești

**Varianta simplă (dublu-click):** deschide `index.html` direct în Chrome/Edge/Safari.
Funcționează tot, mai puțin instalarea ca aplicație (service worker-ul cere `http://`).

**Varianta recomandată (server local, permite instalarea):**

```bash
python3 /Users/florin/Desktop/Munca/univers-app/serve.py
```

Apoi deschide `http://localhost:8787`. În Chrome apare în bara de adresă iconița „Instalează" —
după instalare pornește ca aplicație separată, pe tot ecranul, și merge și fără internet.

Pentru proiector: tasta <kbd>F</kbd> (ecran complet).

## Ce se poate face

| Acțiune | Cum |
| --- | --- |
| Informații + fotografie reală despre un obiect | click pe el |
| Zbor către un obiect | dublu-click, sau butonul „Zoom la obiect", sau din Catalog |
| Zoom | rotița mouse-ului, pinch, butoanele `+` / `−` sau slider-ul |
| Deplasare | tragi cu mouse-ul / degetul, sau săgețile |
| Viteza timpului | slider-ul de jos: de la ore/secundă la mii de ani/secundă |
| Pauză | butonul ⏸ sau <kbd>Space</kbd> |
| Tur ghidat (29 de opriri) | butonul „★ Tur ghidat", apoi <kbd>N</kbd> pentru pasul următor |
| Constelațiile de pe cer | butonul „✨ Cerul nopții" sau <kbd>C</kbd> |
| Joc: „Găsește planeta Marte!" | butonul „🎯 Joc" sau <kbd>G</kbd> |
| Orbite / nume | butoanele „Orbite" și „Nume", sau <kbd>O</kbd> / <kbd>L</kbd> |

### Lucruri gândite pentru copil

- **Fotografii reale** pentru aproape fiecare obiect (NASA/ESA, descărcate local), cu sursa și licența scrise sub poză.
- **Joc „Găsește!"**: aplicația cere un obiect, copilul dă click, se ține scorul (10 întrebări). În modul „Cerul nopții" întreabă constelații.
- **Vârsta pe altă planetă**: scrii vârsta copilului în „?" → Ajutor, iar fișa fiecărei planete arată ce vârstă ar avea acolo.
- **Distanța acum**: fișa arată cât de departe e obiectul de Pământ chiar în acel moment al simulării și cât face lumina până acolo.
- **Zi și noapte**: planetele și sateliții sunt luminați din partea Soarelui — se văd fazele Lunii și terminatorul zi/noapte.
- **Constelații**: 16 constelații cu stelele la coordonatele lor cerești reale, cu legendele, cu indicii de genul „cum o găsești pe cer" și cu desenul istoric al figurii (gravuri din *Urania's Mirror*, 1824, și Hevelius, 1690 — domeniu public).
- **Optimizată pentru telefon**: bara de sus cu iconuri, fișele urcă de jos ca niște „foi", imaginea se deplasează automat ca obiectul să rămână vizibil deasupra fișei, pinch pentru zoom, mai puține particule pe ecrane mici ca să rămână fluidă.
- **Roboții de pe Marte**: Perseverance, Curiosity și elicopterul Ingenuity apar pe suprafața planetei când dai zoom.

### Nivelurile de zoom

1. **Aproape de planetă** – planeta mare pe ecran, cu sateliții ei (pe Pământ: Luna, ISS, Tiangong, Hubble, roiul de sateliți).
2. **Sistemul Solar** – planete, centura de asteroizi, troienii lui Jupiter, Centura Kuiper, comete cu coadă, sonde (Parker, Juno, Lucy, Europa Clipper, New Horizons, Voyager 1 și 2).
3. **Vecinii Soarelui** – stelele apropiate (Proxima, Alpha Centauri, Sirius, Betelgeuse…) și nebuloasele apropiate.
4. **Calea Lactee** – galaxia noastră cu brațele spiralate, nebuloase, roiuri și gaura neagră Sagittarius A*.
5. **Universul îndepărtat** – Norii Magellanici, Andromeda, Sombrero, Roiul Fecioarei, Superroiul Laniakea și pânza cosmică.

## Structura

```
univers-app/
├── index.html              interfața
├── css/style.css           stiluri (contrast mare, text mare — pentru proiector)
├── js/data.js              datele astronomice de bază și textele în română
├── js/data-extra.js        obiectele adăugate ulterior (sateliți, comete, sonde, roveri, galaxii)
├── js/sky.js               constelațiile și harta cerului
├── js/textures.js          texturi procedurale (planete, nebuloase, galaxii)
├── js/app.js               motorul: orbite Kepler, zoom, click, tur, joc, voce
├── photos/                 fotografiile reale + credits.json (autor și licență)
├── sw.js                   service worker (funcționare offline)
├── manifest.webmanifest    configurația PWA
├── icons/                  iconițele aplicației
└── serve.py                server local pentru dezvoltare
```

## Cum adaugi sau modifici conținut

Tot conținutul educațional stă în `js/data.js`. Un obiect arată așa:

```js
{
  id: 'mars', name: 'Marte', type: 'Planetă telurică',
  a: 1.523679 * AU,   // semiaxa mare a orbitei
  e: 0.0934,          // excentricitatea
  P: 686.980,         // perioada orbitală, în zile
  phase: 310,         // poziția de start pe orbită, în grade
  radius: 3.3895e6,   // raza reală, în metri
  color: '#d1603d', texture: 'mars',
  facts: [['Un an', '687 de zile']],
  desc: 'Text explicativ…',
  fun: 'Curiozitate pentru copil…'
}
```

Adaugă-l în lista potrivită (`PLANETS`, `DWARFS`, `COMETS`, `ASTEROIDS`, `SPACECRAFT`, `STARS`,
`GALACTIC`, `DEEPSPACE`) și apare automat și pe ecran, și în Catalog.

**Important:** după orice modificare a fișierelor `.js` / `.css`:

1. urcă numărul din `index.html` (`?v=2` → `?v=3`, la toate scripturile și la stil) — și aceleași valori în lista `ASSETS` din `sw.js`;
2. urcă versiunea cache-ului din `sw.js` (`const CACHE = 'univers-v3'` → `v4`).

Altfel browserul (și service worker-ul) servesc varianta veche. În timpul dezvoltării poți deschide
`http://localhost:8787/?nosw=1`, care nu înregistrează deloc service worker-ul.

## Fotografiile

Pozele din folderul `photos/` sunt descărcate local (aplicația rămâne complet offline). Sunt imaginile
principale din articolele Wikipedia ale fiecărui obiect — în marea majoritate fotografii oficiale
NASA / ESA / JPL, aflate în domeniul public sau sub licență Creative Commons. Sub fiecare poză,
aplicația afișează autorul și licența, luate din `photos/credits.json`.

Dacă vrei să înlocuiești o poză cu alta, pune fișierul `photos/<id>.jpg` (id-ul obiectului din `js/data.js`)
și actualizează intrarea corespunzătoare din `credits.json`. Dacă un obiect nu are poză, aplicația
afișează doar desenul generat de ea — nu apare niciun spațiu gol.

## Precizie

Distanțele dintre planete și formele orbitelor (elipse Kepler) sunt reale. Pentru a fi vizibile pe ecran:

- planetele și sateliții au o dimensiune minimă de câțiva pixeli când sunt departe;
- orbitele sateliților artificiali din jurul Pământului sunt desenate exagerat de mari (altfel ar fi la mai puțin de un pixel de suprafață) — aplicația spune asta în fișa lor;
- pozițiile pe orbită pornesc din poziții aproximative pentru 26 noiembrie 2026, nu dintr-o efemeridă exactă;
- gaura neagră Sagittarius A* este desenată simbolic, mult mai mare decât în realitate.
