/* Modul: Cum creștem — de la bebeluș la bunic */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  /* înălțimea medie (cm) după vârstă */
  const HT = [[0, 50], [1, 75], [2, 87], [3, 96], [4, 103], [5, 110], [6, 116], [7, 122], [8, 128], [10, 138], [12, 150], [14, 162], [16, 170], [18, 174], [30, 175], [60, 173], [80, 168]];
  const ht = (a) => { for (let i = 1; i < HT.length; i++) if (a <= HT[i][0]) { const k = (a - HT[i - 1][0]) / (HT[i][0] - HT[i - 1][0]); return lerp(HT[i - 1][1], HT[i][1], k); } return 168; };
  const MS = [[0, '👶 Bebeluș', 'Un bebeluș are capul mare față de corp (un sfert din toată înălțimea!) și are aproape <b>300 de oase</b>. Doarme mult și bea lapte.'], [1, '🚶 Primii pași', 'Pe la <b>1 an</b>, copiii fac primii pași și spun primele cuvinte. Au crescut deja cu 25 cm!'], [3, '🧒 Copil mic', 'La <b>3 ani</b> au toți cei 20 de dinți de lapte. Aleargă, sar și pun o mulțime de întrebări: „De ce?”'], [6, '🎒 Școlar', 'Pe la <b>6 ani</b> încep să cadă dinții de lapte și să crească cei definitivi. Începe școala!'], [12, '🧑 Adolescent', 'În adolescență corpul crește foarte repede, uneori 10 cm într-un an! Vocea se schimbă și corpul se transformă.'], [18, '🧑‍🦱 Adult', 'Pe la <b>18–20 de ani</b> oasele se opresc din crescut. Unele oase s-au unit între ele: un adult are <b>206 oase</b>.'], [40, '🧔 Adult', 'Corpul nu mai crește, dar se reface mereu: pielea se schimbă complet cam o dată pe lună!'], [65, '👴 Bunic', 'La bătrânețe părul albește, pielea face riduri, iar omul poate să se micșoreze cu câțiva centimetri, pentru că se tasează discurile dintre vertebre.']];
  function person(ctx, x, gy, age, hpx, t) {
    const head = lerp(0.25, 0.13, clamp(age / 18, 0, 1)), H = hpx, hr = H * head / 2;
    const old = clamp((age - 55) / 25, 0, 1), stoop = old * 0.12, baby = age < 1;
    const skin = '#f2c09a', hair = A.mix(age < 1 ? '#c89a6a' : '#5a3a1a', '#e8e8ec', old), shirt = age < 3 ? '#7ad0ff' : age < 13 ? '#ff6a5a' : age < 30 ? '#4a7ad0' : age < 60 ? '#3a8a6a' : '#9a7ad0';
    const legL = H * lerp(0.32, 0.47, clamp(age / 18, 0, 1)), body = H - legL - hr * 2;
    ctx.save(); ctx.translate(x, gy);
    if (baby) { ctx.fillStyle = '#ffffff'; A.roundRectPath(ctx, -H * 0.18, -legL * 0.9, H * 0.36, legL * 0.9, H * 0.1); ctx.fill(); }
    ctx.lineCap = 'round'; ctx.strokeStyle = age < 3 ? '#ffffff' : '#3a4a6a'; ctx.lineWidth = H * 0.09;
    ctx.beginPath(); ctx.moveTo(-H * 0.06, -legL); ctx.lineTo(-H * 0.07 + (baby ? -H * 0.04 : 0), -H * 0.02); ctx.moveTo(H * 0.06, -legL); ctx.lineTo(H * 0.07, -H * 0.02); ctx.stroke();
    ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.ellipse(-H * 0.08, 0, H * 0.06, H * 0.025, 0, 0, TAU); ctx.ellipse(H * 0.08, 0, H * 0.06, H * 0.025, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(0, -legL); ctx.rotate(stoop);
    ctx.fillStyle = shirt; A.roundRectPath(ctx, -H * 0.12, -body, H * 0.24, body + H * 0.02, H * 0.06); ctx.fill();
    ctx.strokeStyle = shirt; ctx.lineWidth = H * 0.065; ctx.beginPath(); ctx.moveTo(-H * 0.12, -body * 0.85); ctx.lineTo(-H * 0.17, -body * 0.15); ctx.moveTo(H * 0.12, -body * 0.85); ctx.lineTo(H * 0.17 + (old > 0.3 ? H * 0.08 : 0), -body * 0.15 + (old > 0.3 ? H * 0.05 : 0)); ctx.stroke();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(-H * 0.17, -body * 0.12, H * 0.035, 0, TAU); ctx.arc(H * 0.17 + (old > 0.3 ? H * 0.08 : 0), -body * 0.12 + (old > 0.3 ? H * 0.05 : 0), H * 0.035, 0, TAU); ctx.fill();
    /* capul */
    const hy = -body - hr * 0.95; ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, hy, hr, 0, TAU); ctx.fill();
    ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, hy - hr * 0.1, hr * 1.02, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); if (age > 3 && age < 60) { ctx.beginPath(); ctx.arc(-hr * 0.8, hy - hr * 0.1, hr * 0.32, 0, TAU); ctx.arc(hr * 0.8, hy - hr * 0.1, hr * 0.32, 0, TAU); ctx.fill(); }
    if (age > 30 && age < 75 && Math.floor(age) % 2 === 0) { ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, hy + hr * 0.55, hr * 0.5, 0.2, Math.PI - 0.2); ctx.fill(); }
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(-hr * 0.35, hy, hr * 0.1, 0, TAU); ctx.arc(hr * 0.35, hy, hr * 0.1, 0, TAU); ctx.fill();
    if (old > 0.2) { ctx.strokeStyle = '#555'; ctx.lineWidth = Math.max(1, hr * 0.06); ctx.beginPath(); ctx.arc(-hr * 0.35, hy, hr * 0.22, 0, TAU); ctx.arc(hr * 0.35, hy, hr * 0.22, 0, TAU); ctx.moveTo(-hr * 0.13, hy); ctx.lineTo(hr * 0.13, hy); ctx.stroke(); }
    ctx.strokeStyle = '#b04a3a'; ctx.lineWidth = Math.max(1, hr * 0.08); ctx.beginPath(); ctx.arc(0, hy + hr * 0.3, hr * 0.3, 0.3, Math.PI - 0.3); ctx.stroke();
    if (baby) { ctx.fillStyle = '#ff9ab0'; ctx.beginPath(); ctx.arc(0, hy + hr * 0.45, hr * 0.12, 0, TAU); ctx.fill(); }
    ctx.restore();
    if (old > 0.45) { ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = H * 0.025; ctx.beginPath(); ctx.moveTo(H * 0.32, 0); ctx.lineTo(H * 0.3, -H * 0.5); ctx.quadraticCurveTo(H * 0.3, -H * 0.56, H * 0.24, -H * 0.55); ctx.stroke(); }
    ctx.restore();
  }
  defineModule({
    id: 'growth', title: 'Cum creștem', sub: 'De la bebeluș la bunic', ownZoom: false,
    start: function (api) {
      const ctx = api.ctx; let age = 6, play = false, lastMs = -1;
      const r = api.row('');
      const sl = api.slider(r, { label: 'Vârsta', min: 0, max: 80, step: 0.1, value: age, fmt: (v) => v < 1 ? Math.round(v * 12) + ' luni' : Math.floor(v) + (Math.floor(v) === 1 ? ' an' : ' ani'), onInput: (v) => { age = v; play = false; pb.classList.remove('on'); } });
      const pb = api.button(r, '▶ Crește!', () => { play = !play; pb.classList.toggle('on', play); if (play && age > 79) age = 0; });
      api.button(r, '🧒 Câți ani ai tu?', () => { age = 6; sl.set(6); });
      return {
        frame: function (dt, t) {
          if (play) { age += dt * (age < 20 ? 2 : 6); if (age >= 80) { age = 80; play = false; pb.classList.remove('on'); } sl.set(age); }
          const ms = MS.filter((m) => age >= m[0]).pop(); if (ms[0] !== lastMs) { lastMs = ms[0]; api.say('<b>' + ms[1] + '.</b> ' + ms[2]); }
          A.scene(ctx, api.W, api.H, 'body');
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          const gy = 560, ppc = 480 / 200;             // pixeli pe cm (200 cm = 480 px)
          /* peretele cu riglă */
          ctx.fillStyle = '#2a2440'; ctx.fillRect(380, 60, 520, gy - 60); ctx.fillStyle = '#3a3256'; ctx.fillRect(380, gy, 520, 30);
          ctx.fillStyle = '#ffe08a'; ctx.fillRect(400, gy - 200 * ppc, 34, 200 * ppc);
          for (let c = 0; c <= 200; c += 10) { const y = gy - c * ppc; ctx.fillStyle = '#5a4a20'; ctx.fillRect(400, y - 1, c % 50 === 0 ? 34 : 16, 2); if (c % 50 === 0) A.text(ctx, c + ' cm', 470, y, { size: 15, color: '#ffe08a' }); }
          /* liniuțe trase pe perete la fiecare an (ca acasă) */
          for (const a of [1, 3, 6, 10, 14, 18]) if (age >= a) { const y = gy - ht(a) * ppc; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(520, y); ctx.lineTo(560, y); ctx.stroke(); A.text(ctx, a + (a === 1 ? ' an' : ' ani'), 590, y, { size: 13, color: 'rgba(255,255,255,0.55)' }); }
          const h = ht(age), hp = h * ppc;
          person(ctx, 720, gy, age, hp, t);
          ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(430, gy - hp); ctx.lineTo(800, gy - hp); ctx.stroke(); ctx.setLineDash([]);
          A.label(ctx, Math.round(h) + ' cm', 850, gy - hp, { size: 18, color: '#b0ffcc' });
          /* fișa din stânga */
          A.panel(ctx, 30, 80, 320, 300, { r: 16 });
          A.text(ctx, ms[1], 190, 115, { size: 22, color: '#ffe08a' });
          const bones = age < 1 ? 300 : age < 18 ? Math.round(lerp(300, 206, clamp(age / 18, 0, 1))) : 206;
          const teeth = age < 0.5 ? 0 : age < 3 ? Math.round(lerp(1, 20, (age - 0.5) / 2.5)) : age < 6 ? 20 : age < 13 ? '20 → 28 (se schimbă)' : age < 21 ? 28 : 32;
          [['📏 Înălțime', Math.round(h) + ' cm'], ['🦴 Oase', '~' + bones], ['🦷 Dinți', String(teeth)], ['⚖️ Greutate', '~' + Math.round(age < 1 ? 3.5 + age * 6 : age < 18 ? 9 + age * 3.4 : age < 60 ? 70 : 68) + ' kg'], ['❤️ Bătăi ale inimii', (age < 1 ? 130 : age < 6 ? 105 : age < 12 ? 90 : 72) + ' pe minut']].forEach(([a, b], i) => { A.text(ctx, a, 50, 165 + i * 42, { size: 17, align: 'left' }); A.text(ctx, b, 330, 165 + i * 42, { size: 17, align: 'right', color: '#b0ffcc' }); });
          A.text(ctx, 'Capul unui bebeluș e 1/4 din corp; la adult e doar 1/8!', 190, 420, { size: 14, color: 'rgba(255,255,255,0.7)' });
          ctx.restore();
        }
      };
    }
  });
})();
