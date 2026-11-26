/* ============================================================
   MODUL: BIG BANG — de la prima fracțiune de secundă până azi
   Timpul e pe scară logaritmică (10⁻⁴³ s … 13,8 miliarde de ani).
   Temperatura și mărimea urmează modelul standard (aproximat).
   ============================================================ */
defineModule({
  id: 'bigbang',
  title: 'Big Bang',
  sub: 'Cum a început Universul și cum a ajuns până la noi',
  start: function (api) {
    const ctx = api.ctx;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
    const L0 = -43, L1 = 17.64, YR = 3.156e7;
    const T_REC = 1.2e13;                     // 380.000 de ani, în secunde
    let s = 0, playing = false, lastEra = -1;
    const lt = () => lerp(L0, L1, s);
    const tSec = () => Math.pow(10, lt());

    /* ---------- epoci ---------- */
    const ERAS = [
      { t: -43, n: 'Începutul', e: '💥', t1: 'Tot ce există acum — toată materia, spațiul și timpul — era strâns într-un punct mai mic decât un atom, infinit de fierbinte. Ce a fost „înainte”, nu știm încă.', p: 'Pe atunci nu existau particule: doar energie pură.' },
      { t: -36, n: 'Inflația', e: '🎈', t1: 'Într-o clipă mai scurtă decât ți-ai putea imagina, Universul se umflă de peste 10²⁶ ori — de la mai mic decât un atom la cât o portocală sau mai mult.', p: 'Inflația a întins mici „tremurături” din care aveau să se nască galaxiile.' },
      { t: -32, n: 'Energie fierbinte', e: '🔥', t1: 'Universul e o supă de energie extrem de fierbinte. Se formează primele particule, în perechi: materie și antimaterie.', p: 'Particule și antiparticule apar și dispar la loc, transformându-se în lumină.' },
      { t: -12, n: 'Supa de quarci', e: '🟣', t1: 'E atât de cald (peste un trilion de grade) încât nu pot exista nici măcar protoni. Plutesc liber quarci și gluoni — „cărămizile” cărămizilor.', p: 'Un quarc: o particulă fundamentală, de trei „culori” (roșu, verde, albastru — doar denumiri).' },
      { t: -6, n: 'Se nasc protonii', e: '⚛️', t1: 'Universul s-a răcit destul ca quarcii să se lege câte trei: apar protonii și neutronii, nucleele viitorilor atomi.', p: 'Un proton (roșu) sau un neutron (gri): din ei e făcut aproape tot ce atingi.' },
      { t: 0, n: 'Primele nuclee', e: '🧪', t1: 'După 1 secundă, neutrinii scapă liberi. După ~3 minute, protonii și neutronii se unesc în nuclee de heliu: 75% hidrogen și 25% heliu — și așa e Universul și azi.', p: 'Un nucleu de heliu: 2 protoni + 2 neutroni. Mai multe elemente nu s-au făcut încă.' },
      { t: 2.5, n: 'Ceața luminoasă', e: '🌫️', t1: 'Universul e o ceață opacă de nuclee, electroni și lumină. Lumina nu poate merge drept: se ciocnește mereu de electroni.', p: 'Un foton (lumină) prins în ceață — nu poate merge mai departe de câteva rânduri.' },
      { t: 13.08, n: 'Prima lumină', e: '💡', t1: 'La 380.000 de ani, Universul s-a răcit la ~3.000°C. Electronii se prind de nuclee și se formează atomii. Ceața dispare, iar lumina zboară liberă: o vedem și azi ca „fosforescența” cosmică, radiația de fond (CMB).', p: 'Un atom de hidrogen: un proton cu un electron. Lumina a trecut printre ei, liberă, pentru prima oară.' },
      { t: 14.6, n: 'Epoca întunecată', e: '🌑', t1: 'Nu există încă nicio stea. Universul e întunecat, plin de nori de hidrogen și heliu. Gravitația strânge încet norii în ciorchini.', p: 'Gaz de hidrogen și heliu, adunat de gravitate. Nu e nicio lumină.' },
      { t: 15.6, n: 'Primele stele', e: '⭐', t1: 'Acum ~200 de milioane de ani se aprind primele stele: uriașe, albastre și foarte scurte. Ele creează primele elemente grele: carbon, oxigen, fier.', p: 'O primă stea: de sute de ori mai mare decât Soarele. Trăiește doar câteva milioane de ani.' },
      { t: 16.5, n: 'Galaxiile și pânza cosmică', e: '🌌', t1: 'Stelele se adună în galaxii, iar galaxiile în filamente: o „pânză cosmică” cu goluri uriașe între ele. Se formează găuri negre uriașe în centrele galaxiilor.', p: 'O galaxie: sute de miliarde de stele ținute la un loc de gravitație.' },
      { t: 17.46, n: 'Soarele și Pământul', e: '🌍', t1: 'Acum 4,6 miliarde de ani, într-un nor de gaz din brațul unei galaxii obișnuite, se naște Soarele, iar în jurul lui, planetele. Atomii din corpul tău au fost făcuți în stele mai vechi.', p: 'Un atom de oxigen sau de carbon din tine: făcut într-o stea care a explodat înainte de Soare.' },
      { t: 17.6, n: 'Azi', e: '🧑‍🚀', t1: 'Universul are 13,8 miliarde de ani și se extinde în continuare, tot mai repede. Partea pe care o putem vedea are ~93 de miliarde de ani-lumină în diametru.', p: 'O galaxie îndepărtată, care se depărtează de noi. Cu cât e mai departe, cu atât fuge mai repede.' }
    ];
    const eraIdx = () => { const x = lt(); let k = 0; for (let i = 0; i < ERAS.length; i++) if (x >= ERAS[i].t) k = i; return k; };

    /* ---------- fizică aproximativă ---------- */
    function temperature(t) {
      if (t < T_REC) return Math.min(1e32, 1.5e10 / Math.sqrt(t));
      return 3000 * Math.pow(T_REC / t, 2 / 3);
    }
    const scaleA = (t) => 2.725 / temperature(t);
    function sizeM(t) { return 93e9 * 9.4607e15 * scaleA(t); }
    const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const sup = (n) => String(Math.abs(n)).split('').map((c) => SUP[+c]).join('');
    function timeText(t) {
      if (t < 1e-3) { const e = Math.floor(Math.log10(t)); return fmt(t / Math.pow(10, e), 1) + '×10' + (e < 0 ? '⁻' : '') + sup(e) + ' secunde'; }
      if (t < 1) return fmt(t * 1000, 0) + ' milisecunde';
      if (t < 120) return fmt(t, 0) + (Math.round(t) === 1 ? ' secundă' : ' secunde');
      if (t < 7200) return fmt(t / 60, 0) + ' minute';
      if (t < 86400 * 2) return fmt(t / 3600, 0) + ' ore';
      if (t < YR) return fmt(t / 86400, 0) + ' zile';
      const y = t / YR;
      if (y < 1e4) return fmt(y, 0) + ' ani';
      if (y < 1e6) return fmt(y / 1000, 0) + ' mii de ani';
      if (y < 1e9) return fmt(y / 1e6, 0) + ' milioane de ani';
      return fmt(y / 1e9, 2) + ' miliarde de ani';
    }
    function tempText(T) {
      if (T >= 1e12) { const e = Math.floor(Math.log10(T)); return fmt(T / Math.pow(10, e), 1) + '×10' + sup(e) + ' °C'; }
      if (T >= 1e6) return fmt(T / 1e6, 1) + ' milioane °C';
      if (T >= 1e4) return fmt(T / 1000, 0) + ' mii °C';
      if (T > 5) return fmt(T - 273.15, 0) + ' °C';
      return fmt(T - 273.15, 1) + ' °C (−270, aproape de zero absolut)';
    }
    function sizeText(m) {
      if (m < 1e-3) return 'mai mic decât un atom'.replace('mai mic decât un atom', fmt(m * 1000, 3) + ' mm');
      if (m < 1) return fmt(m * 100, 1) + ' cm';
      if (m < 1e4) return fmt(m, 0) + ' m';
      if (m < 1e10) return fmt(m / 1000, 0) + ' km';
      const AU = 1.496e11, LY = 9.4607e15;
      if (m < 1e14) return fmt(m / AU, 0) + ' UA';
      if (m < LY * 1e4) return fmt(m / LY, 0) + ' ani-lumină';
      if (m < LY * 1e9) return fmt(m / LY / 1e6, 0) + ' milioane de ani-lumină';
      return fmt(m / LY / 1e9, 0) + ' miliarde de ani-lumină';
    }

    /* ---------- particule (pozițiile lor sunt și zonele de atingere) ---------- */
    const TAU = Math.PI * 2;
    const N = 520, PART = [];
    for (let i = 0; i < N; i++) {
      const a = Math.random() * 6.2832, r = Math.sqrt(Math.random());
      PART.push({ a: a, r: r, j: Math.random() * 6.28, k: Math.random(), grp: Math.random() });
    }
    /* zgomot fractal + „pânza cosmică” (filamente = linii unde zgomotul trece prin zero) */
    const fbm = (x, y) => Art.noise2(x, y) + 0.5 * Art.noise2(x * 2.1 + 7, y * 2.1 + 3) + 0.25 * Art.noise2(x * 4.3 + 1, y * 4.3 + 9);
    const web = (u, v) => { const n = Art.noise2(u * 2.0 + 5.3, v * 2.0 + 2.1) + 0.35 * Art.noise2(u * 4.6 + 1.7, v * 4.6 + 8.2); return Math.pow(Math.max(0, 1 - Math.abs(n) * 2.2), 4); };
    /* galaxii așezate pe filamentele pânzei */
    const GAL = [];
    (function () {
      let tries = 0;
      while (GAL.length < 230 && tries < 40000) {
        tries++; const u = Math.random() * 2 - 1, v = Math.random() * 2 - 1;
        if (u * u + v * v > 0.92) continue;
        if (Math.random() > web(u, v)) continue;
        GAL.push({ x: u, y: v, ph: Math.random() * 6.3, tilt: 0.35 + Math.random() * 0.65, kind: Math.random() < 0.22 ? 3 : (Math.random() * 3) | 0, sz: 0.6 + Math.random() * 0.8, ig: 15.5 + Math.random() * 0.9, rot: (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.03) });
      }
      /* câteva galaxii mari, în prim-plan; prima e „Calea Lactee” */
      for (let i = 0; i < 9 && i < GAL.length; i++) { GAL[i].hero = true; GAL[i].kind = i % 4 === 3 ? 3 : i % 3; GAL[i].tilt = i === 0 ? 0.55 : GAL[i].tilt; }
      if (GAL.length) { GAL[0].x = -0.42; GAL[0].y = -0.3; GAL[0].kind = 0; }
    })();

    /* ---------- texturi și sprite-uri (desenate o singură dată) ---------- */
    const SPR = 64;
    const ball = (hex) => Art.cached('bb-ball-' + hex, SPR, SPR, (c, w) => Art.sphere(c, w / 2, w / 2, w * 0.44, hex, { rimColor: hex }));
    const puff = (rgb) => Art.cached('bb-puff-' + rgb, SPR, SPR, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(' + rgb + ',0.5)'); g.addColorStop(0.5, 'rgba(' + rgb + ',0.2)'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); });
    const helium = () => Art.cached('bb-he', SPR, SPR, (c, w) => { const r = w * 0.2; [[-0.4, -0.35, '#c9ced9'], [0.4, -0.3, '#e0525a'], [-0.35, 0.4, '#e0525a'], [0.38, 0.38, '#c9ced9']].forEach(([dx, dy, col]) => Art.sphere(c, w / 2 + dx * r * 1.5, w / 2 + dy * r * 1.5, r, col, { gloss: false })); });
    function noiseTex(key, size, colorAt) {
      return Art.cached(key, size, size, (c, w) => {
        const d = c.createImageData(w, w);
        for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) {
          const u = x / w * 2 - 1, v = y / w * 2 - 1, i = (y * w + x) * 4;
          if (u * u + v * v > 1) continue;
          const col = colorAt(u, v); d.data[i] = col[0]; d.data[i + 1] = col[1]; d.data[i + 2] = col[2]; d.data[i + 3] = col[3];
        }
        c.putImageData(d, 0, 0);
      });
    }
    const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
    /* plasmă fierbinte, turbulentă */
    const plasmaTex = () => noiseTex('bb-plasma', 200, (u, v) => { const n = clamp(0.5 + 0.45 * fbm(u * 3, v * 3), 0, 1); const c = n < 0.5 ? lerp3([150, 120, 255], [215, 225, 255], n / 0.5) : lerp3([215, 225, 255], [255, 255, 255], (n - 0.5) / 0.5); return [c[0], c[1], c[2], 255]; });
    /* radiația de fond (CMB): pete calde și reci, ca în harta Planck */
    const cmbTex = () => noiseTex('bb-cmb', 200, (u, v) => { const n = clamp(0.5 + 0.5 * fbm(u * 5 + 11, v * 5 + 4), 0, 1); const c = n < 0.5 ? lerp3([40, 70, 170], [235, 200, 90], n / 0.5) : lerp3([235, 200, 90], [215, 70, 40], (n - 0.5) / 0.5); return [c[0], c[1], c[2], 255]; });
    /* gaz întunecat, adunat în filamente */
    const webTex = (blue) => noiseTex(blue ? 'bb-web-b' : 'bb-web', 220, (u, v) => { const w = web(u, v), g = clamp(0.5 + 0.4 * fbm(u * 6, v * 6), 0, 1); return blue ? [120, 150, 230, Math.round(255 * w * 0.55)] : [110 + 40 * g, 80 + 25 * g, 120 + 30 * g, Math.round(255 * Math.min(1, w * 0.8 + 0.12 * g))]; });
    /* galaxie spirală (brațe, praf, nucleu) sau eliptică — ca în imaginile Hubble */
    function galaxyTex(kind) {
      return Art.cached('bb-gal-' + kind, 128, 128, (c, w) => {
        const R = w / 2; let s = 31 + kind * 17; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
        if (kind === 3) {
          c.translate(R, R); c.scale(1, 0.72);
          const g = c.createRadialGradient(0, 0, 0, 0, 0, R * 0.9); g.addColorStop(0, 'rgba(255,240,205,1)'); g.addColorStop(0.15, 'rgba(250,215,160,0.85)'); g.addColorStop(0.5, 'rgba(220,175,130,0.35)'); g.addColorStop(1, 'rgba(200,160,120,0)');
          c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 0.9, 0, TAU); c.fill(); return;
        }
        const arms = kind === 2 ? 3 : 2, wind = kind === 1 ? 0.3 : 0.22;
        const disk = c.createRadialGradient(R, R, 0, R, R, R * 0.95); disk.addColorStop(0, 'rgba(255,235,200,0.9)'); disk.addColorStop(0.25, 'rgba(230,215,200,0.35)'); disk.addColorStop(0.7, 'rgba(150,175,230,0.12)'); disk.addColorStop(1, 'rgba(120,150,220,0)');
        c.fillStyle = disk; c.fillRect(0, 0, w, w);
        for (let a = 0; a < arms; a++) {
          const off = a / arms * TAU;
          /* brațul: lumină difuză albăstruie */
          c.lineCap = 'round';
          for (let pass = 0; pass < 2; pass++) {
            c.beginPath();
            for (let th = 0.3; th < 3.4 * Math.PI; th += 0.08) { const r = 5 * Math.exp(wind * th); if (r > R * 0.95) break; const x = R + Math.cos(th + off) * r, y = R + Math.sin(th + off) * r; th === 0.3 ? c.moveTo(x, y) : c.lineTo(x, y); }
            c.strokeStyle = pass ? 'rgba(190,210,255,0.22)' : 'rgba(150,180,255,0.12)'; c.lineWidth = pass ? 4 : 10; c.stroke();
          }
          /* banda de praf, pe marginea interioară a brațului */
          c.beginPath();
          for (let th = 0.6; th < 3.4 * Math.PI; th += 0.08) { const r = 5 * Math.exp(wind * th) * 0.9; if (r > R * 0.85) break; const x = R + Math.cos(th + off - 0.12) * r, y = R + Math.sin(th + off - 0.12) * r; th === 0.6 ? c.moveTo(x, y) : c.lineTo(x, y); }
          c.strokeStyle = 'rgba(60,30,20,0.35)'; c.lineWidth = 1.6; c.stroke();
          /* stele și roiuri tinere (roz = nori de hidrogen) */
          for (let i = 0; i < 170; i++) {
            const th = 0.3 + rnd() * 3.3 * Math.PI, r = 5 * Math.exp(wind * th); if (r > R * 0.95) continue;
            const sp = (rnd() - 0.5) * (2 + r * 0.16), x = R + Math.cos(th + off) * r + Math.cos(th + off + 1.57) * sp, y = R + Math.sin(th + off) * r + Math.sin(th + off + 1.57) * sp;
            const q = rnd(); c.fillStyle = q < 0.12 ? 'rgba(255,150,190,0.8)' : q < 0.7 ? 'rgba(215,228,255,0.75)' : 'rgba(255,240,215,0.6)';
            c.beginPath(); c.arc(x, y, 0.5 + rnd() * 1.1, 0, TAU); c.fill();
          }
        }
        const core = c.createRadialGradient(R, R, 0, R, R, R * 0.22); core.addColorStop(0, 'rgba(255,250,230,1)'); core.addColorStop(0.5, 'rgba(255,225,170,0.6)'); core.addColorStop(1, 'rgba(255,210,150,0)');
        c.fillStyle = core; c.beginPath(); c.arc(R, R, R * 0.22, 0, TAU); c.fill();
      });
    }
    /* stea tânără: punct alb-albăstrui cu un halou mic (lumina ei ionizează gazul din jur) */
    const starSpr = () => Art.cached('bb-star', SPR, SPR, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(215,230,255,0.95)'); g.addColorStop(0.3, 'rgba(150,185,255,0.25)'); g.addColorStop(1, 'rgba(120,160,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); });
    /* harta Pământului (continente, nori) — 2 emisfere pe lățime, se derulează ca rotație */
    const earthMap = () => Art.cached('bb-earth', 256, 128, (c, w, h) => {
      c.fillStyle = '#1f5fa8'; c.fillRect(0, 0, w, h);
      const d = c.getImageData(0, 0, w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const lon = x / w * TAU, lat = (y / h - 0.5) * Math.PI, cx3 = Math.cos(lat) * Math.cos(lon), cy3 = Math.cos(lat) * Math.sin(lon), cz3 = Math.sin(lat);
        const n = Art.noise2(cx3 * 1.6 + 3 + cz3 * 0.7, cy3 * 1.6 + 5 + cz3) + 0.45 * Art.noise2(cx3 * 4 + 1, cy3 * 4 + cz3 * 3);
        const i = (y * w + x) * 4, polar = Math.abs(lat) > 1.22;
        if (polar) { d.data[i] = 236; d.data[i + 1] = 242; d.data[i + 2] = 248; }
        else if (n > 0.18) { const dry = Math.abs(lat) < 0.45 && n > 0.32; d.data[i] = dry ? 196 : 72 + n * 60; d.data[i + 1] = dry ? 168 : 128 + n * 40; d.data[i + 2] = dry ? 112 : 64; }
        else { const deep = clamp(-n, 0, 0.6); d.data[i] = 30 - deep * 20; d.data[i + 1] = 100 - deep * 40; d.data[i + 2] = 175 - deep * 30; }
      }
      c.putImageData(d, 0, 0);
      let s = 41; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 70; i++) { const x = rnd() * w, y = 10 + rnd() * (h - 20), r = 3 + rnd() * 9; c.fillStyle = 'rgba(255,255,255,' + (0.25 + rnd() * 0.35).toFixed(2) + ')'; c.beginPath(); c.ellipse(x, y, r * 2, r * 0.6, 0, 0, TAU); c.fill(); }
    });
    /* ---------- comenzi ---------- */
    const r1 = api.row('');
    const sl = api.slider(r1, { label: 'Timpul de la Big Bang', min: 0, max: 1, step: 0.0005, value: 0, fmt: () => timeText(tSec()), onInput: (v) => { s = v; playing = false; bP.innerHTML = '▶ Derulează'; } });
    const bP = api.button(r1, '▶ Derulează', () => { if (s >= 0.999) s = 0; playing = !playing; bP.innerHTML = playing ? '⏸ Pauză' : '▶ Derulează'; });
    const r2 = api.row('Salt la');
    [['💥 Început', 0], ['🎈 Inflația', 0.1], ['🟣 Quarci', 0.4], ['🧪 Heliu', 0.7], ['💡 Prima lumină', 0.91], ['⭐ Prima stea', 0.965], ['🌌 Galaxii', 0.99], ['🧑‍🚀 Azi', 1]]
      .forEach(([t, v]) => api.button(r2, t, () => { s = v; playing = false; bP.innerHTML = '▶ Derulează'; sl.set(v); }));
    const info = api.row(''); const readout = document.createElement('div'); readout.className = 'mod-readout'; info.appendChild(readout);

    api.pointer({
      down: (x, y) => {
        const e = ERAS[eraIdx()], m = tSec();
        let best = null, bd = 28;
        for (const p of PART) { const q = pos(p); const d = Math.hypot(q[0] - x, q[1] - y); if (d < bd && vis(p)) { bd = d; best = p; } }
        api.say(best ? '👆 ' + e.p : e.e + ' <b>' + e.n + '.</b> ' + e.t1, 9000);
        flash = 1;
      }
    });
    let flash = 0;
    function rv() { const m = sizeM(tSec()); return 0.05 + 0.9 * clamp((Math.log10(m) + 5) / 32, 0, 1); }
    function pos(p) { const R = rv() * api.unit; return [api.cx + Math.cos(p.a) * p.r * R, api.cy + Math.sin(p.a) * p.r * R]; }
    function vis(p) { return p.k < 0.9 && tSec() < 3e15 * 1.5; }
    function say(force) { const k = eraIdx(); if (k === lastEra && !force) return; lastEra = k; api.say(ERAS[k].e + ' <b>' + ERAS[k].n + '.</b> ' + ERAS[k].t1); }
    /* ---------- ilustrații: Pământ, Soare, astronaut ---------- */
    function drawEarth(x, y, r, t) {
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
      const map = earthMap(), mw = r * 4, off = (t * r * 0.12) % mw;
      ctx.drawImage(map, x - r - off, y - r, mw, r * 2); ctx.drawImage(map, x - r - off + mw, y - r, mw, r * 2);
      /* volum: partea de zi (stânga-sus) și noaptea */
      const sh = ctx.createRadialGradient(x - r * 0.45, y - r * 0.4, r * 0.1, x, y, r * 1.05);
      sh.addColorStop(0, 'rgba(255,255,255,0.12)'); sh.addColorStop(0.55, 'rgba(0,0,0,0)'); sh.addColorStop(0.85, 'rgba(0,5,25,0.5)'); sh.addColorStop(1, 'rgba(0,5,25,0.85)');
      ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.restore();
      ctx.strokeStyle = 'rgba(140,190,255,0.55)'; ctx.lineWidth = Math.max(1, r * 0.06);
      ctx.beginPath(); ctx.arc(x, y, r * 1.01, Math.PI * 0.75, Math.PI * 1.75); ctx.stroke();       // atmosfera, pe partea luminată
    }
    function drawSun(x, y, r) {
      const g = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.7); g.addColorStop(0, 'rgba(255,200,110,0.35)'); g.addColorStop(1, 'rgba(255,170,80,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.7, 0, TAU); ctx.fill();
      const s = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 0, x, y, r);
      s.addColorStop(0, '#fffbe8'); s.addColorStop(0.55, '#ffd76a'); s.addColorStop(1, '#f08a2a');
      ctx.fillStyle = s; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    function drawAstronaut(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35 + 0.08 * Math.sin(t * 0.6)); ctx.scale(s, s);
      const suit = (path) => { const g = ctx.createLinearGradient(-20, -20, 20, 25); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#dfe4ec'); g.addColorStop(1, '#a9b2c2'); ctx.fillStyle = g; path(); ctx.fill(); ctx.strokeStyle = '#8a93a5'; ctx.lineWidth = 1; ctx.stroke(); };
      /* rucsac */
      ctx.fillStyle = '#b8bfcc'; Art.roundRectPath(ctx, -15, -12, 30, 30, 5); ctx.fill(); ctx.strokeStyle = '#8a93a5'; ctx.stroke();
      /* picioare */
      suit(() => { ctx.beginPath(); Art.roundRectPath(ctx, -11, 14, 9, 22, 4); });
      suit(() => { ctx.beginPath(); ctx.save(); ctx.translate(6, 14); ctx.rotate(-0.25); Art.roundRectPath(ctx, -3, 0, 9, 22, 4); ctx.restore(); });
      ctx.fillStyle = '#6b7385'; Art.roundRectPath(ctx, -12, 32, 11, 6, 3); ctx.fill();
      /* corp */
      suit(() => { Art.roundRectPath(ctx, -12, -8, 24, 26, 8); });
      ctx.fillStyle = '#5a7bd6'; Art.roundRectPath(ctx, -6, 0, 12, 8, 2); ctx.fill();
      ctx.fillStyle = '#e04a4a'; ctx.beginPath(); ctx.arc(-3, 4, 1.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#7ee08a'; ctx.beginPath(); ctx.arc(2, 4, 1.3, 0, TAU); ctx.fill();
      /* brațe */
      suit(() => { ctx.beginPath(); ctx.save(); ctx.translate(-11, -4); ctx.rotate(0.9); Art.roundRectPath(ctx, -4, 0, 8, 20, 4); ctx.restore(); });
      suit(() => { ctx.beginPath(); ctx.save(); ctx.translate(11, -4); ctx.rotate(-1.9); Art.roundRectPath(ctx, -4, 0, 8, 20, 4); ctx.restore(); });
      /* cască cu vizor auriu */
      suit(() => { ctx.beginPath(); ctx.arc(0, -17, 12, 0, TAU); });
      const v = ctx.createLinearGradient(-8, -24, 8, -10); v.addColorStop(0, '#ffe7a0'); v.addColorStop(0.5, '#d9a23a'); v.addColorStop(1, '#7a5418');
      ctx.fillStyle = v; ctx.beginPath(); ctx.ellipse(1, -16, 8.5, 6.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-2.5, -18.5, 3, 1.6, -0.5, 0, TAU); ctx.fill();
      ctx.restore();
    }
    /* fereastră de „zoom” din pânza cosmică spre Calea Lactee, Soare și Pământ */
    function drawInset(x, R, t) {
      const U = api.unit, show = clamp((x - 17.46) / 0.05, 0, 1); if (show <= 0) return;
      const today = x >= 17.6, ir = U * 0.21, ix = api.cx + R * 0.52, iy = api.cy + R * 0.48;
      const g0 = GAL[0], gx = api.cx + g0.x * R, gy = api.cy + g0.y * R, fz = Art.fs(U, 0.034, 13);
      ctx.save(); ctx.globalAlpha = show;
      ctx.strokeStyle = 'rgba(220,230,255,0.5)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.arc(gx, gy, R * 0.06, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx + R * 0.045, gy + R * 0.04); ctx.lineTo(ix - ir * 0.7, iy - ir * 0.7); ctx.stroke(); ctx.setLineDash([]);
      Art.label(ctx, 'Calea Lactee', gx, gy - R * 0.06 - fz, { size: fz, bg: 'rgba(8,12,30,0.7)' });
      ctx.fillStyle = '#060918'; ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.clip();
      if (!today) {
        const sx = ix - ir * 0.45, sr = ir * 0.22, orb = ir * 0.95;
        ctx.strokeStyle = 'rgba(200,215,255,0.22)'; ctx.lineWidth = 1;
        for (const k of [0.45, 0.68, 0.95]) { ctx.beginPath(); ctx.ellipse(sx, iy, orb * k, orb * k * 0.42, 0, 0, TAU); ctx.stroke(); }
        drawSun(sx, iy, sr);
        const pa = (k, sp) => [sx + Math.cos(t * sp) * orb * k, iy + Math.sin(t * sp) * orb * k * 0.42];
        let q = pa(0.45, 0.5); Art.sphere(ctx, q[0], q[1], ir * 0.035, '#c9a27a', { gloss: false, rim: false });
        q = pa(0.68, 0.35); Art.sphere(ctx, q[0], q[1], ir * 0.05, '#e3c38a', { gloss: false, rim: false });
        q = pa(0.95, 0.25); drawEarth(q[0], q[1], ir * 0.07, t);
      } else {
        drawEarth(ix + ir * 0.15, iy + ir * 0.38, ir * 0.62, t);
        drawAstronaut(ix - ir * 0.35, iy - ir * 0.35, ir / 90, t);
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(220,230,255,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.stroke();
      Art.label(ctx, today ? 'Noi, azi, pe Pământ' : 'Soarele și Pământul', ix, iy + ir + fz * 1.2, { size: fz, bg: 'rgba(8,12,30,0.75)' });
      ctx.restore();
    }

    function frame(dt, tm) {
      if (playing) { s = Math.min(1, s + dt / 55); sl.set(s); if (s >= 1) { playing = false; bP.innerHTML = '↺ De la început'; } }
      flash = Math.max(0, flash - dt * 3);
      const t = tSec(), x = lt(), T = temperature(t), cx = api.cx, cy = api.cy, U = api.unit, R = rv() * U;
      const sk = clamp(U / 300, 0.9, 1.6);
      ctx.drawImage(Art.cached('bb-bg', api.W, api.H, (c, w, h) => Art.backdrop(c, w, h, { top: '#070917', bottom: '#020308', vignette: false })), 0, 0, api.W, api.H);
      say(false);
      const spr = (img, px, py, sz) => ctx.drawImage(img, px - sz, py - sz, sz * 2, sz * 2);

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(R * 1.02, 4), 0, TAU); ctx.clip();
      if (x < -32) {
        /* plasmă incandescentă: energie pură, care fierbe */
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(tm * 0.15); ctx.drawImage(plasmaTex(), -R, -R, R * 2, R * 2); ctx.restore();
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, 'rgba(255,255,255,0.75)'); g.addColorStop(0.6, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(110,90,220,0.45)');
        ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      } else if (x < -12) {
        /* supă de energie care se răcește: perechi particulă–antiparticulă apar și dispar */
        const cool = clamp((x + 32) / 20, 0, 1);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, Art.mix('#ffffff', '#ffd9a0', cool)); g.addColorStop(1, Art.mix('#b9b0ff', '#ff9a5a', cool));
        ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        ctx.save(); ctx.globalAlpha = 0.35; ctx.translate(cx, cy); ctx.rotate(tm * 0.1); ctx.drawImage(plasmaTex(), -R, -R, R * 2, R * 2); ctx.restore();
        for (let i = 0; i < 160; i += 2) {
          const p = PART[i], ph = (tm * 0.5 + p.j) % 1, q = pos(p), a = Math.sin(ph * Math.PI), d = a * 5 * sk;
          if (a < 0.08) continue;
          ctx.globalAlpha = a;
          spr(ball('#4f8ff0'), q[0] - d, q[1], 2.6 * sk); spr(ball('#e8508a'), q[0] + d, q[1], 2.6 * sk);
        }
        ctx.globalAlpha = 1;
      } else if (x < -6) {
        /* plasmă de quarci și gluoni */
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, '#f6c9a8'); g.addColorStop(1, '#c0607a');
        ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        ctx.strokeStyle = 'rgba(255,240,220,0.55)'; ctx.lineWidth = 1;
        for (let i = 0; i < 160; i += 2) {
          const a = pos(PART[i]), b = pos(PART[i + 1]); if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 26 * sk) continue;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]);                                         // gluon: linie ondulată
          for (let k = 1; k <= 8; k++) { const u = k / 8, w = Math.sin(u * TAU * 2) * 2.5; const nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny) || 1; ctx.lineTo(lerp(a[0], b[0], u) + nx / nl * w, lerp(a[1], b[1], u) + ny / nl * w); }
          ctx.stroke();
        }
        for (let i = 0; i < 420; i++) { const p = PART[i], q = pos(p); spr(ball(p.grp < 0.33 ? '#e64b4b' : p.grp < 0.66 ? '#3fbf5f' : '#4a7fe6'), q[0] + Math.sin(tm * 2 + p.j) * 2, q[1] + Math.cos(tm * 1.7 + p.j * 2) * 2, 2.8 * sk); }
      } else if (x < 13.08) {
        /* ceață fierbinte de nuclee, electroni și lumină */
        const cool = clamp((x + 6) / 19, 0, 1);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, Art.mix('#fff0d8', '#f7b878', cool)); g.addColorStop(1, Art.mix('#f2a070', '#c8603a', cool));
        ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        const heliumFrac = x < 0 ? 0 : x < 2.4 ? clamp(x / 2.4, 0, 1) * 0.12 : 0.12;
        const nBase = x < 0 ? 380 : 300;
        for (let i = 0; i < nBase; i++) {
          const p = PART[i], q = pos(p), jx = Math.sin(tm * 1.5 + p.j) * 2, jy = Math.cos(tm * 1.3 + p.j * 2) * 2;
          if (p.k < heliumFrac * 4 && p.grp < 0.35 && x >= 0) spr(helium(), q[0] + jx, q[1] + jy, 6 * sk);
          else if (p.grp < 0.62) spr(ball(p.grp < 0.5 ? '#e0525a' : '#c9ced9'), q[0] + jx, q[1] + jy, 3 * sk);
          else { ctx.fillStyle = '#3d6fd8'; ctx.beginPath(); ctx.arc(q[0] + jx, q[1] + jy, 1.4 * sk, 0, TAU); ctx.fill(); }
        }
        if (x > 2.4) {
          /* fotoni: unde scurte, care se lovesc mereu de electroni */
          ctx.strokeStyle = 'rgba(255,235,120,0.85)'; ctx.lineWidth = 1.3;
          for (let i = 0; i < 120; i++) {
            const p = PART[(i * 3) % N], q = pos(p), a = p.j * 9 + tm * (0.6 + p.k), ca = Math.cos(a), sa = Math.sin(a);
            ctx.beginPath(); for (let k = 0; k <= 6; k++) { const u = k / 6 * 11 * sk, w = Math.sin(k * 1.6) * 2; const px = q[0] + ca * u - sa * w, py = q[1] + sa * u + ca * w; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
          }
        }
      } else if (x < 14.6) {
        /* prima lumină: ceața dispare, rămâne „harta” radiației de fond */
        const fade = clamp(1 - (x - 13.08) / 1.4, 0, 1), appear = clamp((x - 13.08) / 0.3, 0, 1);
        ctx.globalAlpha = 0.25 + 0.6 * fade; ctx.drawImage(cmbTex(), cx - R, cy - R, R * 2, R * 2); ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(4,6,16,' + (0.35 + 0.45 * (1 - fade)).toFixed(2) + ')'; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        for (let i = 0; i < 160; i++) {
          const p = PART[i], q = pos(p), er = 4 * sk, ea = tm * (1 + p.k) + p.j;
          ctx.strokeStyle = 'rgba(170,200,255,' + (0.35 * appear).toFixed(2) + ')'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(q[0], q[1], er, 0, TAU); ctx.stroke();
          ctx.globalAlpha = appear; spr(ball('#e0525a'), q[0], q[1], 1.8 * sk); ctx.globalAlpha = 1;
          ctx.fillStyle = 'rgba(110,160,255,' + appear.toFixed(2) + ')'; ctx.beginPath(); ctx.arc(q[0] + Math.cos(ea) * er, q[1] + Math.sin(ea) * er, 1.1 * sk, 0, TAU); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(255,235,150,0.7)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        for (let i = 0; i < 40; i++) { const p = PART[i * 7 % N], a = p.j * 4, d = ((tm * 0.2 + p.k) % 1) * R * 2.2 - R * 1.1; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d); ctx.lineTo(cx + Math.cos(a) * (d + 18 * sk), cy + Math.sin(a) * (d + 18 * sk)); ctx.stroke(); }
      } else {
        /* epoca întunecată → primele stele → galaxii pe pânza cosmică */
        const clump = clamp((x - 14.6) / 1.5, 0, 1), starsOn = clamp((x - 15.5) / 0.9, 0, 1), galOn = clamp((x - 16.2) / 1.2, 0, 1);
        ctx.globalAlpha = 0.85 * (1 - galOn * 0.75); ctx.drawImage(webTex(false), cx - R, cy - R, R * 2, R * 2);
        ctx.globalAlpha = galOn * 0.8; ctx.drawImage(webTex(true), cx - R, cy - R, R * 2, R * 2); ctx.globalAlpha = 1;
        /* nori de gaz trași de gravitație spre filamente */
        const gasA = 0.55 * (1 - clamp((x - 15.4) / 1.2, 0, 1));
        if (gasA > 0.01) { ctx.globalAlpha = gasA; for (let i = 0; i < 160; i++) { const p = PART[i], q = pos(p), gg = GAL[i % GAL.length]; spr(puff('120,95,140'), lerp(q[0], cx + gg.x * R, clump * 0.85), lerp(q[1], cy + gg.y * R, clump * 0.85), (10 + p.k * 12) * sk * (1 - clump * 0.5)); } ctx.globalAlpha = 1; }
        /* primele stele: se aprind una câte una */
        if (starsOn > 0) for (let i = 0; i < GAL.length; i++) {
          const g = GAL[i], on = clamp((x - g.ig) / 0.12, 0, 1); if (on <= 0) continue;
          const a = on * (1 - galOn * 0.9); if (a < 0.02) continue;
          ctx.globalAlpha = a; spr(starSpr(), cx + g.x * R, cy + g.y * R, (6 + g.sz * 4) * sk); ctx.globalAlpha = 1;
        }
        /* galaxii */
        if (galOn > 0) for (let i = GAL.length - 1; i >= 0; i--) {
          const g = GAL[i], sz = (g.hero ? R * (i === 0 ? 0.13 : 0.075 + g.sz * 0.035) : R * 0.012 + g.sz * 5 * sk) * (0.5 + 0.5 * galOn);
          ctx.save(); ctx.globalAlpha = galOn; ctx.translate(cx + g.x * R, cy + g.y * R); ctx.rotate(g.ph + tm * g.rot); ctx.scale(1, g.tilt);
          ctx.drawImage(galaxyTex(g.kind), -sz, -sz, sz * 2, sz * 2); ctx.restore();
        }
      }
      if (flash) { ctx.fillStyle = 'rgba(255,255,255,' + (flash * 0.18).toFixed(3) + ')'; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); }
      ctx.restore();

      /* marginea Universului observabil */
      if (x < 13.08) {
        ctx.strokeStyle = 'rgba(255,230,200,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, Math.max(R, 4), 0, TAU); ctx.stroke();
      } else {
        const fade = clamp(1 - (x - 13.08) / 1.4, 0, 1);
        if (fade > 0) { ctx.strokeStyle = 'rgba(240,150,80,' + (0.6 * fade).toFixed(2) + ')'; ctx.lineWidth = 3 + 10 * (1 - fade); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); }
        ctx.save(); ctx.strokeStyle = 'rgba(255,190,120,0.3)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.restore();
      }
      drawInset(x, R, tm);
      /* etichetă */
      const ev = ERAS[eraIdx()];
      Art.label(ctx, ev.n, cx, api.cy - api.unit + 14, { size: Art.fs(U, 0.045, 14), bg: 'rgba(8,12,30,0.7)' });
      readout.innerHTML = '<b>Timp:</b> ' + timeText(t) + ' &nbsp;·&nbsp; <b>Temperatură:</b> ' + tempText(T) + ' &nbsp;·&nbsp; <b>Mărime:</b> ' + (x < -6 ? 'mai mică decât un atom' : sizeText(sizeM(t)));
    }
    return { frame: frame };
  }
});
