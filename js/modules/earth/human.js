/* Modul: Evoluția omului */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  function bg(api, c1, c2) { const g = api.ctx.createLinearGradient(0, 0, 0, api.H); g.addColorStop(0, c1); g.addColorStop(1, c2); api.ctx.fillStyle = g; api.ctx.fillRect(0, 0, api.W, api.H); }
  const MAXA = 7.2e6;
  const xOf = (age) => 1 - Math.sqrt(Math.max(age, 0) / MAXA);                      // 0 = acum 7 mil. ani, 1 = azi
  const ageOf = (x) => Math.pow(1 - x, 2) * MAXA;
  const ageText = (a) => a >= 1e6 ? fmt(a / 1e6, 1) + ' mil. ani' : a >= 1000 ? fmt(Math.round(a / 100) * 100, 0) + ' de ani' : a > 50 ? fmt(a, 0) + ' de ani' : 'azi';
  const SP = [
    { n: 'Sahelanthropus', look: { lean: .35, arm: .9, brow: 1, jaw: 1, snout: .4, fur: true, skin: '#6a4a38', hair: '#2a1c14' }, s: 7.0e6, e: 6.0e6, h: 1.1, br: 360, w: 'Ciad (Africa)', c: '#a07a5a', t: 'Cel mai vechi posibil strămoș al omului. Craniul lui, găsit în Ciad, arată că poate mergea pe două picioare, deși avea creier cât al unui cimpanzeu.' },
    { n: 'Ardipithecus', look: { lean: .3, arm: .85, brow: .9, snout: .35, fur: true, skin: '#6e4c36', hair: '#2a1c14' }, s: 4.5e6, e: 4.3e6, h: 1.2, br: 320, w: 'Etiopia', c: '#a8804a', t: 'Trăia în păduri și umbla și pe două picioare, și prin copaci. Avea degetul mare de la picior opus, ca să se agațe de crengi.' },
    { n: 'Australopithecus (Lucy)', look: { lean: .22, arm: .75, brow: .8, snout: .3, fur: true, skin: '#7a5238', hair: '#2a1c14' }, s: 3.9e6, e: 2.9e6, h: 1.2, br: 450, w: 'Etiopia, Tanzania', c: '#b8883a', t: 'Faimoasa „Lucy” (3,2 mil. ani) mergea drept pe două picioare, dar avea încă brațe lungi. Creierul ei era cam de 3 ori mai mic decât al nostru. Urmele ei de pași s-au păstrat în cenușă vulcanică.' },
    { n: 'Paranthropus', look: { lean: .2, arm: .6, brow: 1, jaw: 1.2, crest: .25, snout: .2, skin: '#6a4630', hair: '#2a1c14' }, s: 2.3e6, e: 1.2e6, h: 1.35, br: 520, w: 'Africa de Est', c: '#8a6a3a', t: 'Avea maxilare uriașe și dinți mari, pentru a mesteca plante dure. Nu e strămoșul nostru direct — o ramură care a dispărut.' },
    { n: 'Homo habilis', look: { lean: .15, arm: .6, brow: .7, snout: .2, nose: 1, skin: '#8a5c3c', hair: '#2a1c14' }, s: 2.4e6, e: 1.4e6, h: 1.3, br: 610, w: 'Africa', c: '#c8903a', t: '„Omul îndemânatic”: primul din genul Homo, asociat cu primele unelte de piatră cioplită. Creierul începe să crească.' },
    { n: 'Homo erectus', look: { lean: .06, arm: .45, brow: 1, snout: .12, nose: 1, skin: '#9a6a44', hair: '#2a1c14' }, s: 1.9e6, e: 1.1e5, h: 1.7, br: 950, w: 'Africa, Asia, Europa', c: '#d8a040', t: '„Omul în picioare”: a trăit aproape 2 milioane de ani! Primul care a ieșit din Africa, a folosit securi de piatră și a ținut focul sub control (acum cel puțin 400.000 de ani).' },
    { n: 'Homo heidelbergensis', look: { lean: .04, arm: .4, brow: .9, snout: .1, nose: 1, skin: '#a07048', hair: '#3a2616' }, s: 7.0e5, e: 2.0e5, h: 1.75, br: 1250, w: 'Africa, Europa', c: '#e0b050', t: 'Înalt și puternic, cu creier mare. Vâna animale mari cu sulițe de lemn. Probabil strămoșul comun al neanderthalienilor și al nostru.' },
    { n: 'Homo naledi', look: { lean: .1, arm: .65, brow: .6, nose: 1, skin: '#8a5a3a', hair: '#2a1c14' }, s: 3.35e5, e: 2.36e5, h: 1.4, br: 560, w: 'Africa de Sud', c: '#9a7aa0', t: 'Mic de statură și cu creier mic, dar cu mâini și picioare moderne. A fost descoperit într-o peșteră adâncă din Africa de Sud.' },
    { n: 'Neanderthalienii', look: { lean: .05, arm: .38, brow: .95, snout: .1, nose: 2, build: 1.2, skin: '#d0a888', hair: '#6a4a2a' }, s: 4.0e5, e: 4.0e4, h: 1.65, br: 1450, w: 'Europa, Asia de Vest', c: '#7aa0c0', t: 'Puternici, adaptați la frig, cu creier chiar mai mare decât al nostru. Făceau focuri, haine, unelte și își îngropau morții. Mulți oameni de azi au 1–2% ADN neanderthalian. Au trăit și pe teritoriul României.' },
    { n: 'Denisovanii', look: { lean: .05, arm: .4, brow: .8, nose: 1, skin: '#b88862', hair: '#1a1008' }, s: 2.0e5, e: 5.0e4, h: 1.7, br: 1400, w: 'Asia', c: '#6ab0a0', t: 'O specie „misterioasă”, cunoscută mai ales din ADN și câteva oase găsite într-o peșteră din Siberia. Unii oameni din Asia și Oceania au și ADN denisovan.' },
    { n: 'Homo floresiensis', look: { lean: .1, arm: .6, brow: .6, nose: 1, skin: '#8a5a3a', hair: '#2a1c14' }, s: 1.0e5, e: 5.0e4, h: 1.06, br: 420, w: 'Insula Flores (Indonezia)', c: '#c07a8a', t: '„Hobbitul”: avea doar ~1 metru înălțime! A trăit pe o insulă izolată, unde corpul s-a micșorat în timp.' },
    { n: 'Homo sapiens (noi)', look: { lean: 0, arm: .38, brow: .1, nose: 1, skin: '#c8905a', hair: '#2a1a10', cloth: '#4a7a9a' }, s: 3.0e5, e: 0, h: 1.7, br: 1350, w: 'Africa → tot globul', c: '#ffe27a', t: 'Noi! Primii au apărut în Africa acum ~300.000 de ani. Ne deosebim prin limbaj complex, artă (picturi în peșteri) și cooperare în grupuri mari. Suntem singura specie umană rămasă. În România, „Omul de la Peștera cu Oase” (40.000 de ani) e unul dintre cei mai vechi sapiens din Europa.' }
  ];
  const PER = [['Paleolitic inferior', 3.3e6, 3.0e5, '#7a5a3a'], ['Paleolitic mijlociu', 3.0e5, 5.0e4, '#a07a3a'], ['Paleolitic superior', 5.0e4, 1.17e4, '#c8a050'], ['Mezolitic', 1.17e4, 8.0e3, '#6aa0a0'], ['Neolitic', 8.0e3, 5.0e3, '#6ac080']];
  defineModule({
    id: 'human', title: 'Evoluția omului', sub: 'Speciile umane și perioadele lor, de acum 7 milioane de ani',
    start: function (api) {
      const ctx = api.ctx;
      let x = 0.35, sel = null, play = false;
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Acum', min: 0, max: 1, step: 0.001, value: x, fmt: () => ageText(ageOf(x)), onInput: (v) => { x = v; play = false; bP.innerHTML = '▶ Derulează'; } });
      const bP = api.button(r1, '▶ Derulează', () => { play = !play; if (play && x > 0.99) x = 0; bP.innerHTML = play ? '⏸ Pauză' : '▶ Derulează'; });
      const r2 = api.row('Salt la');
      [['🦍 7 mil. ani', 0.0], ['👣 Lucy', 0.35], ['🪨 Habilis', 0.46], ['🔥 Erectus', 0.7], ['🦴 Neanderthal', 0.9], ['🧑 Azi', 1]].forEach(([t, v]) => api.button(r2, t, () => { x = v; sl.set(v); play = false; bP.innerHTML = '▶ Derulează'; }));
      const info = document.createElement('div'); info.className = 'mod-readout'; r2.appendChild(info);
      api.say('Familia omului are o istorie lungă: în trecut au trăit <b>multe specii umane</b>, uneori chiar în același timp! Trage de glisor prin timp sau atinge o specie ca să afli despre ea. Doar <b>Homo sapiens</b> (noi) a rămas.', 15000);
      const aliveAt = (age) => SP.filter((p) => age <= p.s && age >= p.e);
      let lay = null;
      function layout() {
        const W = api.freeW, top = api.cy - api.unit + 2, free = api.unit * 2;
        const labelW = W < 520 ? 88 : 140, cx0 = labelW + 6, cw = W - cx0 - 10, perY = top + 6, perH = 18, rowY = perY + perH + 8;
        const rowH = clamp((free * 0.5) / SP.length, 13, 24);
        lay = { W: W, top: top, labelW: labelW, cx0: cx0, cw: cw, perY: perY, perH: perH, rowY: rowY, rowH: rowH, figBase: api.cy + api.unit - 34, free: free };
      }
      api.pointer({ down: (px, py) => { if (!lay) layout(); const i = Math.floor((py - lay.rowY) / lay.rowH); if (i >= 0 && i < SP.length) { sel = SP[i]; x = clamp(xOf((sel.s + sel.e) / 2), 0, 1); sl.set(x); play = false; bP.innerHTML = '▶ Derulează'; api.say('<b>' + sel.n + '</b> · ' + ageText(sel.s) + ' – ' + ageText(sel.e) + ' · ' + sel.w + '. ' + sel.t + ' <i>Înălțime ~' + fmt(sel.h, 2) + ' m, creier ~' + sel.br + ' cm³.</i>', 20000); } else if (px > lay.cx0 && py < lay.rowY) { x = clamp((px - lay.cx0) / lay.cw, 0, 1); sl.set(x); play = false; } } });
      function person(px, base, p, figH, label, t) {
        const sp = Object.assign({ h: p.h, brain: p.br }, p.look);
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(px, base + 1, figH * 0.2, figH * 0.035, 0, 0, 6.3); ctx.fill();
        window.Creatures.hominin(ctx, px, base, figH / 100, sp, t, 1);
        ctx.fillStyle = '#fff'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label, px, base + 13); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(fmt(p.h, 2) + ' m · creier ' + p.br + ' cm³', px, base + 24);
      }
      function frame(dt, t) {
        if (play) { x = Math.min(1, x + dt * 0.04); sl.set(x); if (x >= 1) { play = false; bP.innerHTML = '↺ De la început'; } }
        layout(); bg(api, '#14100c', '#0a0806');
        const L = lay, age = ageOf(x), X = (a) => L.cx0 + L.cw * xOf(a);
        /* perioade */
        PER.forEach((p) => { const x0 = X(p[1]), x1 = X(p[2]); ctx.fillStyle = p[3]; ctx.fillRect(x0, L.perY, Math.max(2, x1 - x0 - 1), L.perH); if (x1 - x0 > 60) { ctx.fillStyle = '#fff'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p[0], (x0 + x1) / 2, L.perY + 12); } });
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.fillText('perioade', L.labelW, L.perY + 12);
        /* rânduri: specii */
        const alive = aliveAt(age);
        SP.forEach((p, i) => {
          const y = L.rowY + i * L.rowH, on = alive.indexOf(p) >= 0, isSel = sel === p;
          ctx.fillStyle = isSel ? 'rgba(255,255,255,0.1)' : i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0)'; ctx.fillRect(4, y, L.W - 8, L.rowH);
          ctx.fillStyle = on || isSel ? '#fff' : 'rgba(255,255,255,0.55)'; ctx.font = (on ? '700 ' : '600 ') + Math.min(11, L.rowH - 3) + 'px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.fillText(L.labelW < 100 ? p.n.replace('Homo ', 'H. ').replace(' (noi)', '').replace(' (Lucy)', '').replace('Neanderthalienii', 'Neanderthal').replace('Denisovanii', 'Denisovan') : p.n, L.labelW, y + L.rowH * 0.7);
          const x0 = X(p.s), x1 = Math.max(X(p.e), x0 + 3);
          ctx.fillStyle = p.c; ctx.globalAlpha = on ? 1 : 0.7; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, y + 3, x1 - x0, L.rowH - 6, 4) : ctx.rect(x0, y + 3, x1 - x0, L.rowH - 6); ctx.fill(); ctx.globalAlpha = 1;
          if (isSel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(x0, y + 2, x1 - x0, L.rowH - 4); }
        });
        /* cursorul timpului */
        const cxp = L.cx0 + L.cw * x; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cxp, L.perY - 2); ctx.lineTo(cxp, L.rowY + SP.length * L.rowH); ctx.stroke();
        ctx.fillStyle = '#ffd166'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = cxp > L.W - 70 ? 'right' : 'left'; ctx.fillText(ageText(age), cxp + (cxp > L.W - 70 ? -4 : 4), L.rowY + SP.length * L.rowH + 14);
        /* siluete pentru speciile contemporane */
        const figH = Math.min(L.free * 0.25, 130), n = alive.length;
        ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(10, L.figBase - figH, L.W - 20, 1); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '600 9px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('1,8 m', 12, L.figBase - figH - 3);
        alive.forEach((p, i) => person(L.W * (i + 0.5) / Math.max(n, 1), L.figBase, p, figH, p.n.split(' (')[0].replace('Homo ', 'H. '), t));
        if (!n) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '600 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Pe vremea aceea încă nu existau strămoși ai omului cunoscuți.', L.W / 2, L.figBase - 40); }
        info.innerHTML = n ? '<b>' + ageText(age) + ':</b> ' + alive.map((p) => p.n.split(' (')[0]).join(', ') + (n > 1 ? ' — <b>' + n + ' specii trăiau în același timp</b>' : '') : 'Niciun strămoș cunoscut.';
      }
      return { frame: frame };
    }
  });
})();
