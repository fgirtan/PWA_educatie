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

    /* ---------- particule ---------- */
    const N = 520, PART = [];
    for (let i = 0; i < N; i++) {
      const a = Math.random() * 6.2832, r = Math.sqrt(Math.random());
      PART.push({ a: a, r: r, j: Math.random() * 6.28, k: Math.random(), grp: Math.random() });
    }
    /* galaxii: așezate pe filamente */
    const GAL = [];
    (function () {
      const nodes = []; for (let i = 0; i < 14; i++) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 0.9; nodes.push([Math.cos(a) * r, Math.sin(a) * r]); }
      for (let i = 0; i < 14; i++) for (let k = 1; k <= 2; k++) {
        const A = nodes[i], B = nodes[(i * 5 + k * 3) % 14];
        for (let q = 0; q < 14; q++) { const u = q / 14, jx = (Math.random() - 0.5) * 0.06, jy = (Math.random() - 0.5) * 0.06; const x = lerp(A[0], B[0], u) + jx, y = lerp(A[1], B[1], u) + jy; if (x * x + y * y < 0.98) GAL.push({ x: x, y: y, sz: 0.6 + Math.random() * 1.2, ph: Math.random() * 6.3, sp: Math.random() < 0.5 }); }
      }
    })();
    const BG = []; for (let i = 0; i < 90; i++) BG.push([Math.random(), Math.random(), Math.random() * 1.3 + 0.3]);

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
    function tempRGB(T) { if (T > 1e9) return [200, 220, 255]; if (T > 1e5) return [255, 245, 220]; if (T > 6000) return [255, 214, 150]; return [255, 150, 70]; }

    function frame(dt, tm) {
      if (playing) { s = Math.min(1, s + dt / 55); sl.set(s); if (s >= 1) { playing = false; bP.innerHTML = '↺ De la început'; } }
      flash = Math.max(0, flash - dt * 3);
      const t = tSec(), x = lt(), T = temperature(t), cx = api.cx, cy = api.cy, U = api.unit, R = rv() * U;
      ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, api.W, api.H);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (const b of BG) ctx.fillRect(b[0] * api.W, b[1] * api.H, b[2], b[2]);
      say(false);
      const hot = x < 13.08;                         // ceață opacă înainte de prima lumină
      /* sfera Universului observabil */
      if (hot) {
        const rgb = tempRGB(T), g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.25);
        const a = x < -32 ? 1 : x < 0 ? 0.95 : 0.85 - 0.25 * clamp((x - 2.5) / 10.6, 0, 1);
        g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(0.7, 'rgba(' + rgb.map((v) => Math.round(v * 0.85)) + ',' + (a * 0.8) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, 7); ctx.fill();
      } else {
        const fade = clamp(1 - (x - 13.08) / 1.4, 0, 1);            // ultima strălucire (CMB)
        if (fade > 0) { ctx.strokeStyle = 'rgba(255,150,70,' + (0.8 * fade) + ')'; ctx.lineWidth = 10 + 40 * (1 - fade); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(255,170,90,0.35)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R * 1.0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      }
      if (flash) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, 'rgba(255,255,255,' + flash * 0.4 + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill(); }

      /* conținutul, în funcție de epocă */
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(R * 1.02, 4), 0, 7); ctx.clip();
      if (x < -32) {
        for (let i = 0; i < 90; i++) { const p = PART[i]; ctx.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.6 * Math.abs(Math.sin(tm * 9 + p.j))) + ')'; const q = pos(p); ctx.fillRect(q[0], q[1], 2, 2); }
      } else if (x < -12) {
        /* perechi particulă–antiparticulă care apar și dispar */
        for (let i = 0; i < 160; i++) { const p = PART[i], ph = (tm * 1.6 + p.j) % 1, q = pos(p), a = Math.sin(ph * 3.14); ctx.fillStyle = 'rgba(' + (i % 2 ? '120,200,255' : '255,160,200') + ',' + a * 0.9 + ')'; ctx.beginPath(); ctx.arc(q[0] + Math.sin(tm * 6 + p.j) * 3, q[1] + Math.cos(tm * 5 + p.j) * 3, 2 + a, 0, 7); ctx.fill(); }
      } else if (x < -6) {
        for (let i = 0; i < 420; i++) { const p = PART[i], q = pos(p); const col = p.grp < 0.33 ? '255,80,80' : p.grp < 0.66 ? '90,230,120' : '100,150,255'; ctx.fillStyle = 'rgba(' + col + ',0.9)'; ctx.beginPath(); ctx.arc(q[0] + Math.sin(tm * 8 + p.j) * 4, q[1] + Math.cos(tm * 7 + p.j * 2) * 4, 2.6, 0, 7); ctx.fill(); }
      } else if (x < 13.08) {
        const heliumFrac = x < 0 ? 0 : x < 2.4 ? clamp((x + 0.0) / 2.4, 0, 1) * 0.12 : 0.12;
        const nBase = x < 0 ? 380 : 300;
        for (let i = 0; i < nBase; i++) {
          const p = PART[i], q = pos(p), jx = Math.sin(tm * 5 + p.j) * 3, jy = Math.cos(tm * 4 + p.j * 2) * 3;
          if (p.k < heliumFrac * 4 && p.grp < 0.35 && x >= 0) {
            for (let c = 0; c < 4; c++) { ctx.fillStyle = c % 2 ? 'rgba(200,205,215,0.95)' : 'rgba(255,90,90,0.95)'; ctx.beginPath(); ctx.arc(q[0] + jx + (c % 2) * 4 - 2, q[1] + jy + (c < 2 ? -2 : 2.5), 2.2, 0, 7); ctx.fill(); }
          } else {
            ctx.fillStyle = p.grp < 0.5 ? 'rgba(255,90,90,0.95)' : p.grp < 0.62 ? 'rgba(200,205,215,0.95)' : 'rgba(110,170,255,0.85)';
            ctx.beginPath(); ctx.arc(q[0] + jx, q[1] + jy, p.grp < 0.62 ? 2.8 : 1.6, 0, 7); ctx.fill();
          }
        }
        if (x > 2.4) {
          /* fotoni: linii galbene scurte, care se ciocnesc */
          ctx.strokeStyle = 'rgba(255,240,150,0.7)'; ctx.lineWidth = 1.2;
          for (let i = 0; i < 160; i++) { const p = PART[(i * 3) % N], q = pos(p), a = p.j * 9 + tm * (2 + p.k * 4); ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + Math.cos(a) * 9, q[1] + Math.sin(a) * 9); ctx.stroke(); }
        }
      } else if (x < 14.6) {
        /* atomi liberi, lumină liberă */
        const appear = clamp((x - 13.08) / 0.3, 0, 1);
        for (let i = 0; i < 260; i++) { const p = PART[i], q = pos(p); ctx.strokeStyle = 'rgba(255,200,140,' + 0.7 * appear * (1 - (x - 13.08) / 1.6) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(255,120,120,' + 0.9 * appear + ')'; ctx.fillRect(q[0] - 0.5, q[1] - 0.5, 1.6, 1.6); }
        ctx.strokeStyle = 'rgba(255,230,160,0.55)'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 40; i++) { const p = PART[i * 7 % N], a = p.j * 4, d = ((tm * 0.35 + p.k) % 1) * R * 2.2 - R * 1.1; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d); ctx.lineTo(cx + Math.cos(a) * (d + 22), cy + Math.sin(a) * (d + 22)); ctx.stroke(); }
      } else {
        /* epoca întunecată → stele → galaxii */
        const gas = 1 - clamp((x - 14.6) / 1.5, 0, 1) * 0.6;
        for (let i = 0; i < 220; i++) { const p = PART[i], q = pos(p); ctx.fillStyle = 'rgba(120,90,140,' + 0.25 * gas + ')'; ctx.beginPath(); ctx.arc(q[0], q[1], 9 + p.k * 14, 0, 7); ctx.fill(); }
        const starsOn = clamp((x - 15.5) / 0.9, 0, 1), galOn = clamp((x - 16.2) / 1.2, 0, 1);
        const showAll = starsOn > 0;
        if (showAll) for (let i = 0; i < GAL.length; i++) {
          const g = GAL[i], tw = 0.6 + 0.4 * Math.sin(tm * 2 + g.ph), px = cx + g.x * R, py = cy + g.y * R;
          const fromWeb = galOn > 0 ? 1 : 0;
          const col = x < 17.1 ? '170,205,255' : g.sp ? '255,230,190' : '200,220,255';
          const sz = g.sz * (0.7 + 1.4 * galOn) * (1 + (x > 17 ? 0.6 : 0));
          ctx.fillStyle = 'rgba(' + col + ',' + (0.9 * starsOn * tw) + ')'; ctx.beginPath(); ctx.arc(px, py, sz, 0, 7); ctx.fill();
          if (galOn > 0.5) { ctx.fillStyle = 'rgba(' + col + ',' + (0.12 * galOn) + ')'; ctx.beginPath(); ctx.ellipse(px, py, sz * 3.2, sz * 1.5, g.ph, 0, 7); ctx.fill(); }
        }
      }
      ctx.restore();
      /* etichetă */
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '700 17px system-ui,sans-serif';
      const ev = ERAS[eraIdx()];
      ctx.fillText(ev.e + ' ' + ev.n, cx, api.cy - api.unit + 14);
      readout.innerHTML = '<b>Timp:</b> ' + timeText(t) + ' &nbsp;·&nbsp; <b>Temperatură:</b> ' + tempText(T) + ' &nbsp;·&nbsp; <b>Mărime:</b> ' + (x < -6 ? 'mai mică decât un atom' : sizeText(sizeM(t)));
    }
    return { frame: frame };
  }
});
