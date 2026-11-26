/* Modul: Evoluția omului — ilustrații de hominini la scară, peisaj care se schimbă cu epoca, cronologie elegantă */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
  const fmt = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 1 : d });
  const MAXA = 7.2e6;
  const xOf = (age) => 1 - Math.sqrt(Math.max(age, 0) / MAXA);                      // 0 = acum 7 mil. ani, 1 = azi
  const ageOf = (x) => Math.pow(1 - x, 2) * MAXA;
  const ageText = (a) => a >= 1e6 ? fmt(a / 1e6, 1) + ' mil. ani' : a >= 1000 ? fmt(Math.round(a / 100) * 100, 0) + ' de ani' : a > 50 ? fmt(a, 0) + ' de ani' : 'azi';
  const SP = [
    { n: 'Sahelanthropus', s: 7.0e6, e: 6.0e6, h: 1.1, br: 360, w: 'Ciad (Africa)', c: '#a07a5a', t: 'Cel mai vechi posibil strămoș al omului. Craniul lui, găsit în Ciad, arată că poate mergea pe două picioare, deși avea creier cât al unui cimpanzeu.' },
    { n: 'Ardipithecus', s: 4.5e6, e: 4.3e6, h: 1.2, br: 320, w: 'Etiopia', c: '#a8804a', t: 'Trăia în păduri și umbla și pe două picioare, și prin copaci. Avea degetul mare de la picior opus, ca să se agațe de crengi.' },
    { n: 'Australopithecus (Lucy)', s: 3.9e6, e: 2.9e6, h: 1.2, br: 450, w: 'Etiopia, Tanzania', c: '#b8883a', t: 'Faimoasa „Lucy” (3,2 mil. ani) mergea drept pe două picioare, dar avea încă brațe lungi. Creierul ei era cam de 3 ori mai mic decât al nostru. Urmele ei de pași s-au păstrat în cenușă vulcanică.' },
    { n: 'Paranthropus', s: 2.3e6, e: 1.2e6, h: 1.35, br: 520, w: 'Africa de Est', c: '#8a6a3a', t: 'Avea maxilare uriașe și dinți mari, pentru a mesteca plante dure. Nu e strămoșul nostru direct — o ramură care a dispărut.' },
    { n: 'Homo habilis', s: 2.4e6, e: 1.4e6, h: 1.3, br: 610, w: 'Africa', c: '#c8903a', t: '„Omul îndemânatic”: primul din genul Homo, asociat cu primele unelte de piatră cioplită. Creierul începe să crească.' },
    { n: 'Homo erectus', s: 1.9e6, e: 1.1e5, h: 1.7, br: 950, w: 'Africa, Asia, Europa', c: '#d8a040', t: '„Omul în picioare”: a trăit aproape 2 milioane de ani! Primul care a ieșit din Africa, a folosit securi de piatră și a ținut focul sub control (acum cel puțin 400.000 de ani).' },
    { n: 'Homo heidelbergensis', s: 7.0e5, e: 2.0e5, h: 1.75, br: 1250, w: 'Africa, Europa', c: '#e0b050', t: 'Înalt și puternic, cu creier mare. Vâna animale mari cu sulițe de lemn. Probabil strămoșul comun al neanderthalienilor și al nostru.' },
    { n: 'Homo naledi', s: 3.35e5, e: 2.36e5, h: 1.4, br: 560, w: 'Africa de Sud', c: '#9a7aa0', t: 'Mic de statură și cu creier mic, dar cu mâini și picioare moderne. A fost descoperit într-o peșteră adâncă din Africa de Sud.' },
    { n: 'Neanderthalienii', s: 4.0e5, e: 4.0e4, h: 1.65, br: 1450, w: 'Europa, Asia de Vest', c: '#7aa0c0', t: 'Puternici, adaptați la frig, cu creier chiar mai mare decât al nostru. Făceau focuri, haine, unelte și își îngropau morții. Mulți oameni de azi au 1–2% ADN neanderthalian. Au trăit și pe teritoriul României.' },
    { n: 'Denisovanii', s: 2.0e5, e: 5.0e4, h: 1.7, br: 1400, w: 'Asia', c: '#6ab0a0', t: 'O specie „misterioasă”, cunoscută mai ales din ADN și câteva oase găsite într-o peșteră din Siberia. Unii oameni din Asia și Oceania au și ADN denisovan.' },
    { n: 'Homo floresiensis', s: 1.0e5, e: 5.0e4, h: 1.06, br: 420, w: 'Insula Flores (Indonezia)', c: '#c07a8a', t: '„Hobbitul”: avea doar ~1 metru înălțime! A trăit pe o insulă izolată, unde corpul s-a micșorat în timp.' },
    { n: 'Homo sapiens (noi)', s: 3.0e5, e: 0, h: 1.7, br: 1350, w: 'Africa → tot globul', c: '#ffe27a', t: 'Noi! Primii au apărut în Africa acum ~300.000 de ani. Ne deosebim prin limbaj complex, artă (picturi în peșteri) și cooperare în grupuri mari. Suntem singura specie umană rămasă. În România, „Omul de la Peștera cu Oase” (40.000 de ani) e unul dintre cei mai vechi sapiens din Europa.' }
  ];
  /* cum arată fiecare specie (proporții reale aproximative, postură, blană, unelte) */
  const ST = [
    { short: 'Sahelanthropus', leg: 0.40, arm: 0.56, lean: 0.40, knee: 0.40, build: 1.05, belly: 1, brain: 0.0, snout: 0.95, brow: 0.9, nose: 0.05, chin: 0, jaw: 1.1, fur: 1, furC: '#3e2b1f', skin: '#5c4030', cloth: 'leaves', tool: null, seed: 1 },
    { short: 'Ardipithecus', leg: 0.42, arm: 0.55, lean: 0.32, knee: 0.32, build: 1.0, belly: 0.9, brain: 0.0, snout: 0.9, brow: 0.7, nose: 0.05, chin: 0, jaw: 1, fur: 1, furC: '#4b3322', skin: '#6a4a35', cloth: 'leaves', tool: null, toe: 1, seed: 2 },
    { short: 'Lucy', leg: 0.45, arm: 0.50, lean: 0.15, knee: 0.15, build: 1.0, belly: 1, brain: 0.12, snout: 0.75, brow: 0.6, nose: 0.1, chin: 0, jaw: 1, fur: 0.9, furC: '#6a4a2e', skin: '#7f5a3e', cloth: 'leaves', tool: null, seed: 3 },
    { short: 'Paranthropus', leg: 0.46, arm: 0.48, lean: 0.13, knee: 0.13, build: 1.18, belly: 1, brain: 0.2, snout: 0.65, brow: 0.85, nose: 0.1, chin: 0, jaw: 1.5, crest: 1, fur: 0.85, furC: '#3a291d', skin: '#634532', cloth: 'leaves', tool: 'stick', seed: 4 },
    { short: 'H. habilis', leg: 0.47, arm: 0.47, lean: 0.1, knee: 0.1, build: 1.0, belly: 0.7, brain: 0.33, snout: 0.5, brow: 0.6, nose: 0.25, chin: 0, jaw: 1, fur: 0.65, furC: '#5a3c27', skin: '#835b3d', cloth: 'hide', tool: 'stone', seed: 5 },
    { short: 'H. erectus', leg: 0.53, arm: 0.43, lean: 0.03, knee: 0.04, build: 1.0, belly: 0.2, brain: 0.55, snout: 0.3, brow: 0.9, nose: 0.55, chin: 0.1, jaw: 1.1, fur: 0.2, furC: '#3a2618', skin: '#7a5034', hair: '#24170f', cloth: 'hide', tool: 'handaxe', seed: 6 },
    { short: 'H. heidelberg.', leg: 0.52, arm: 0.43, lean: 0.03, knee: 0.04, build: 1.18, belly: 0.2, brain: 0.75, snout: 0.25, brow: 0.85, nose: 0.7, chin: 0.15, jaw: 1.15, fur: 0.12, furC: '#3a2618', skin: '#86593a', hair: '#2a1a10', cloth: 'loin', tool: 'spear', seed: 7 },
    { short: 'H. naledi', leg: 0.47, arm: 0.47, lean: 0.08, knee: 0.08, build: 0.95, belly: 0.5, brain: 0.28, snout: 0.45, brow: 0.7, nose: 0.3, chin: 0, jaw: 1, fur: 0.5, furC: '#4a3426', skin: '#6c4b36', cloth: 'leaves', tool: null, seed: 8 },
    { short: 'Neanderthal', leg: 0.48, arm: 0.43, lean: 0.04, knee: 0.05, build: 1.38, belly: 0.3, brain: 0.95, snout: 0.3, brow: 0.95, nose: 1.25, chin: 0.05, jaw: 1.15, bun: 1, fur: 0.08, furC: '#7a3e22', skin: '#d8a585', hair: '#8c4a26', beard: 1, cloth: 'cloak', tool: 'spearStone', seed: 9 },
    { short: 'Denisovan', leg: 0.5, arm: 0.43, lean: 0.03, knee: 0.04, build: 1.22, belly: 0.2, brain: 0.85, snout: 0.3, brow: 0.8, nose: 0.9, chin: 0.1, jaw: 1.2, fur: 0.05, furC: '#1e1612', skin: '#a37151', hair: '#1c1410', beard: 0.6, cloth: 'hide', tool: 'spear', seed: 10 },
    { short: 'H. floresiensis', leg: 0.45, arm: 0.48, lean: 0.06, knee: 0.07, build: 1.0, belly: 0.6, brain: 0.18, snout: 0.45, brow: 0.65, nose: 0.35, chin: 0, jaw: 1, fur: 0.3, furC: '#4a3122', skin: '#7a5238', hair: '#2a1a10', cloth: 'hide', tool: 'smallSpear', seed: 11 },
    { short: 'H. sapiens', leg: 0.53, arm: 0.42, lean: 0.0, knee: 0.02, build: 1.0, belly: 0.1, brain: 1.0, snout: 0.05, brow: 0.12, nose: 0.85, chin: 1, jaw: 0.9, fur: 0, furC: '#2a1a10', skin: '#c08a64', hair: '#2b1a10', longHair: 1, cloth: 'tunic', tool: 'spearStone', seed: 12 }
  ];
  const PER = [['Paleolitic inferior', 3.3e6, 3.0e5, '#7a5a3a'], ['Paleolitic mijlociu', 3.0e5, 5.0e4, '#a07a3a'], ['Paleolitic superior', 5.0e4, 1.17e4, '#c8a050'], ['Mezolitic', 1.17e4, 8.0e3, '#6aa0a0'], ['Neolitic', 8.0e3, 5.0e3, '#6ac080']];

  /* ---------- ajutoare de desen locale ---------- */
  let LWH = 1;                    // grosimea conturului (din Art.lineW, setată la fiecare cadru)
  /* membru conic (capsulă cu capete rotunde), umplut cu gradient de volum */
  function limb(ctx, ax, ay, bx, by, wa, wb, col, outline) {
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, a0 = Math.atan2(ny, nx);
    ctx.beginPath(); ctx.arc(ax, ay, wa / 2, a0, a0 + Math.PI); ctx.arc(bx, by, wb / 2, a0 + Math.PI, a0 + Math.PI * 2); ctx.closePath();
    const lit = (nx * -0.7 + ny * -0.7) > 0 ? 1 : -1, w = Math.max(wa, wb) / 2, mx = (ax + bx) / 2, my = (ay + by) / 2;
    const g = ctx.createLinearGradient(mx + nx * w * lit, my + ny * w * lit, mx - nx * w * lit, my - ny * w * lit);
    g.addColorStop(0, Art.shade(col, 0.14)); g.addColorStop(0.4, col); g.addColorStop(1, Art.shade(col, -0.28));
    ctx.fillStyle = g; ctx.fill();
    if (outline) { ctx.strokeStyle = Art.ink(col); ctx.lineWidth = LWH; ctx.stroke(); }
  }

  /* contur anatomic de-a lungul unui os: puncte [x, y, lățime-față, lățime-spate] → poligon închis */
  function contour(pts) {
    const F = [], B = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const fx = dy, fy = -dx, p = pts[i];
      F.push([p[0] + fx * p[2], p[1] + fy * p[2]]); B.push([p[0] - fx * p[3], p[1] - fy * p[3]]);
    }
    return F.concat(B.reverse());
  }
  /* eșantionează un os de la (ax,ay) la (bx,by) cu profilul [[t, față, spate], ...] (lățimi deja în px) */
  function bone(ax, ay, bx, by, prof, k) { return prof.map((q) => [lerp(ax, bx, q[0]), lerp(ay, by, q[0]), q[1] * k, q[2] * k]); }
  /* umple o formă cu modelare de volum: lumina vine din stânga-sus */
  function shapeFill(ctx, poly, col, ol, hi, lo) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of poly) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    ctx.beginPath(); Art.smoothPath(ctx, poly, true);
    const cx = (x0 + x1) / 2, w = Math.max(4, (x1 - x0) / 2);
    const g = ctx.createLinearGradient(cx - w, y0, cx + w, y0 + Math.min(y1 - y0, w * 0.6));
    g.addColorStop(0, Art.shade(col, hi === undefined ? 0.16 : hi)); g.addColorStop(0.45, col); g.addColorStop(1, Art.shade(col, -(lo === undefined ? 0.3 : lo)));
    ctx.fillStyle = g; ctx.fill();
    if (ol) { ctx.strokeStyle = Art.ink(col); ctx.globalAlpha *= 0.85; ctx.lineWidth = LWH; ctx.stroke(); ctx.globalAlpha /= 0.85; }
  }
  /* margine de blană: fire scurte pe contur */
  function furEdge(ctx, poly, col, len, from, to) {
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = 0.75; ctx.lineWidth = Math.max(0.6, len * 0.16); ctx.lineCap = 'round'; ctx.beginPath();
    const n = poly.length; let cx = 0, cy = 0; for (const p of poly) { cx += p[0]; cy += p[1]; } cx /= n; cy /= n;
    for (let i = Math.floor(n * (from || 0)); i < Math.floor(n * (to === undefined ? 1 : to)); i++) {
      const p = poly[i], q = poly[(i + 1) % n];
      const seg = Math.hypot(q[0] - p[0], q[1] - p[1]), m = Math.max(1, Math.round(seg / Math.max(1.5, len * 0.35)));
      for (let k = 0; k < m; k++) {
        const x = lerp(p[0], q[0], k / m), y = lerp(p[1], q[1], k / m); let ox = x - cx, oy = y - cy; const d = Math.hypot(ox, oy) || 1; ox /= d; oy /= d;
        const l = len * (0.55 + 0.45 * Math.abs(Math.sin(i * 3.1 + k * 1.7)));
        /* firul pornește din interior și curge în jos, ieșind puțin peste contur */
        ctx.moveTo(x - ox * l * 0.6, y - oy * l * 0.6 - l * 0.2); ctx.quadraticCurveTo(x + ox * l * 0.1, y + oy * l * 0.1, x + ox * l * 0.25, y + oy * l * 0.2 + l * 0.45);
      }
    }
    ctx.stroke(); ctx.restore();
  }

  /* ---------- un hominin ilustrat, din profil, cu picioarele în (0,0); s = înălțimea în px ---------- */
  function drawHominin(ctx, st, s, t, walk, phase, modern, an) {
    an = an || { open: 1, gx: 0, gy: 0, tilt: 0 };
    const seed = st.seed, breathe = Math.sin(t * 1.5 + seed) * 0.5 + 0.5;
    const skin = st.skin, furC = st.furC, body = Art.mix(skin, furC, st.fur), limbC = Art.mix(skin, furC, st.fur * 0.95);
    const ol = Art.ink(st.skin);
    const wk = s * (0.82 + 0.2 * st.build) * (st.lean > 0.25 ? 0.88 : 1);
    /* --- picioare: șold → genunchi → gleznă, cu ciclu de mers --- */
    const legL = st.leg * s, th = legL * 0.52, sh = legL * 0.48, fl = s * (st.leg > 0.5 ? 0.15 : 0.135) * (st.toe ? 1.1 : 1);
    const A = (0.32 + 0.12 * (1 - st.knee)) * walk, kn = st.knee + 0.05;
    function legPose(p) {
      const a = kn * 0.5 + A * Math.sin(p);
      const k = kn + walk * 0.9 * Math.max(0, Math.cos(p)) * (0.5 + 0.5 * Math.sin(p + 1.2));
      const kx = Math.sin(a) * th, ky = Math.cos(a) * th, b = a - k;
      const ax = kx + Math.sin(b) * sh, ay = ky + Math.cos(b) * sh;
      /* talpa: plată la sprijin, vârful ridicat la desprindere, călcâiul la aterizare */
      const fa = walk * (Math.sin(p) < 0 ? 0.45 * Math.max(0, -Math.cos(p) * 0.8 + Math.sin(-p) * 0.4) : -0.25 * Math.max(0, Math.sin(p)) * Math.max(0, Math.cos(p) + 0.3));
      const low = ay + footLow(fa);
      return { a, b, kx, ky, ax, ay, fa, low };
    }
    function footPts(ax, ay, fa) {
      const L = fl, c = Math.cos(fa), sn = Math.sin(fa);
      const loc = [[-0.08, -0.16], [-0.2, 0.0], [-0.22, 0.12], [-0.12, 0.2], [0.25, 0.19], [0.55, 0.22], [0.76, 0.2], [0.84, 0.15], [0.8, 0.09], [0.55, 0.05], [0.28, -0.03], [0.1, -0.13]];
      return loc.map(([u, v]) => [ax + (u * c - v * sn) * L, ay + (u * sn + v * c) * L]);
    }
    function footLow(fa) { const L = fl, c = Math.cos(fa), sn = Math.sin(fa); let m = -1e9; for (const [u, v] of [[-0.12, 0.2], [0.25, 0.19], [0.55, 0.22], [0.76, 0.2]]) m = Math.max(m, (u * sn + v * c) * L); return m; }
    const pN = legPose(phase), pF = legPose(phase + Math.PI);
    const bob = walk * s * 0.006 * Math.cos(phase * 2);
    const hipY = -Math.max(pN.low, pF.low) - bob, hipX = 0;
    const lean = st.lean + walk * 0.035;
    const ux = Math.sin(lean), uy = -Math.cos(lean), nx = Math.cos(lean), ny = Math.sin(lean);
    const T = s * (0.29 + 0.02 * (st.lean > 0.2 ? 1 : 0)), bw = s * 0.068 * st.build;
    const P = (a, f) => [hipX + ux * a * T + nx * f * bw, hipY + uy * a * T + ny * f * bw];
    const pants = modern ? '#3d5d8f' : null, shoe = modern ? '#f0f2f5' : null;
    const THIGH = [[0, 0.06, 0.068], [0.3, 0.062, 0.056], [0.65, 0.05, 0.044], [0.92, 0.038, 0.036], [1, 0.036, 0.035]];
    const SHIN = [[0, 0.036, 0.035], [0.12, 0.036, 0.043], [0.36, 0.032, 0.052], [0.62, 0.026, 0.036], [0.88, 0.02, 0.023], [1, 0.019, 0.021]];
    function drawLeg(p, far) {
      const sc = far ? -0.2 : 0;
      const kx = hipX + p.kx, ky = hipY + p.ky, ax = hipX + p.ax, ay = hipY + p.ay;
      /* laba */
      const fp = footPts(ax, ay, p.fa);
      shapeFill(ctx, fp, Art.shade(shoe || Art.mix(skin, furC, st.fur * 0.4), sc - 0.05), ol, 0.12, 0.28);
      if (shoe) { ctx.save(); ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = Math.max(1, s * 0.006); ctx.beginPath(); ctx.moveTo(fp[3][0], fp[3][1]); ctx.lineTo(fp[6][0], fp[6][1]); ctx.stroke(); ctx.restore(); }
      if (st.toe && !shoe) {          /* degetul mare opozabil al lui Ardipithecus */
        const c = Math.cos(p.fa), sn = Math.sin(p.fa), L = fl, tx = ax + (0.62 * c - 0.02 * sn) * L, ty = ay + (0.62 * sn + 0.02 * c) * L;
        ctx.save(); ctx.fillStyle = Art.shade(skin, sc - 0.12); ctx.beginPath(); ctx.ellipse(tx, ty, L * 0.16, L * 0.06, p.fa - 0.5, 0, 7); ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
      }
      /* gamba + coapsa ca un singur contur muscular */
      const pts = bone(hipX, hipY, kx, ky, THIGH, wk).concat(bone(kx, ky, ax, ay, SHIN, wk).slice(1));
      const poly = contour(pts);
      shapeFill(ctx, poly, Art.shade(pants || limbC, sc), ol);
      if (st.fur > 0.3 && !pants) furEdge(ctx, poly, Art.shade(furC, sc - 0.1), s * 0.014, 0.5, 1);
      /* rotula și tendonul — o umbră fină */
      ctx.save(); ctx.strokeStyle = Art.rgba('#1a0d05', 0.22); ctx.lineWidth = Math.max(0.8, s * 0.004); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(kx + s * 0.03 * Math.cos(p.a), ky - s * 0.012); ctx.quadraticCurveTo(kx + s * 0.04, ky + s * 0.01, kx + s * 0.025 * Math.cos(p.b), ky + s * 0.03); ctx.stroke(); ctx.restore();
    }
    /* --- brațe: umăr → cot → încheietură + mână --- */
    const upA = st.arm * 0.44 * s, foA = st.arm * 0.36 * s, hL = st.arm * 0.2 * s, ak = s * (0.8 + 0.25 * st.build);
    const S = P(0.9, -0.12);
    function armPose(p, near) {
      let aa = -lean * 0.4 + 0.05 + walk * 0.32 * -Math.sin(p), e = 0.18 + walk * 0.3 * (0.5 + 0.5 * Math.sin(-p + 0.4));
      if (near && st.tool) {
        if (st.tool === 'spear' || st.tool === 'spearStone' || st.tool === 'smallSpear') { aa = 0.22 + walk * 0.05 * Math.sin(p); e = 1.2; }
        else if (st.tool === 'stick') { aa = 0.3 + walk * 0.1 * -Math.sin(p); e = 0.7; }
        else if (st.tool === 'handaxe') { aa = 0.1 + walk * 0.22 * -Math.sin(p); e = 0.4; }
        else if (st.tool === 'stone') { aa = 0.08 + walk * 0.25 * -Math.sin(p); e = 0.5; }
      }
      aa += Math.sin(t * 0.9 + seed + (near ? 0 : 2)) * 0.015 * (1 - walk);
      const ex = S[0] + Math.sin(aa) * upA, ey = S[1] + Math.cos(aa) * upA, hx = ex + Math.sin(aa + e) * foA, hy = ey + Math.cos(aa + e) * foA;
      return { ex, ey, hx, hy, ang: aa + e, grip: near && !!st.tool };
    }
    const aN = armPose(phase + Math.PI, true), aF = armPose(phase, false);
    const UPPER = [[0, 0.046, 0.044], [0.2, 0.042, 0.04], [0.5, 0.036, 0.037], [0.82, 0.027, 0.029], [1, 0.025, 0.027]];
    const FORE = [[0, 0.025, 0.027], [0.2, 0.029, 0.03], [0.5, 0.025, 0.025], [0.85, 0.018, 0.018], [1, 0.017, 0.017]];
    function handPts(a) {
      const dx = Math.sin(a.ang), dy = Math.cos(a.ang), fx = dy, fy = -dx, L = hL;
      const loc = a.grip ? [[0, -0.18], [0.3, -0.28], [0.6, -0.26], [0.78, -0.1], [0.74, 0.1], [0.55, 0.22], [0.42, 0.34], [0.25, 0.32], [0.05, 0.18]]
        : [[0, -0.17], [0.35, -0.24], [0.7, -0.2], [0.95, -0.08], [1.0, 0.04], [0.85, 0.12], [0.6, 0.14], [0.5, 0.3], [0.32, 0.3], [0.12, 0.2], [0, 0.15]];
      return loc.map(([u, v]) => [a.hx + dx * u * L + fx * v * L, a.hy + dy * u * L + fy * v * L]);
    }
    function drawArm(a, far) {
      const sc = far ? -0.22 : 0;
      const pts = bone(S[0], S[1], a.ex, a.ey, UPPER, ak).concat(bone(a.ex, a.ey, a.hx, a.hy, FORE, ak).slice(1));
      const poly = contour(pts);
      shapeFill(ctx, handPts(a), Art.shade(Art.mix(skin, furC, st.fur * 0.3), sc - 0.04), ol, 0.12, 0.25);
      if (!far) { ctx.save(); ctx.translate(s * 0.012, s * 0.006); ctx.fillStyle = 'rgba(20,8,2,0.22)'; ctx.beginPath(); Art.smoothPath(ctx, poly, true); ctx.fill(); ctx.restore(); }
      shapeFill(ctx, poly, Art.shade(limbC, far ? sc : 0.06), far ? ol : 'rgba(25,12,5,0.6)');
      if (modern) { const sl = contour(bone(S[0], S[1], a.ex, a.ey, [[0, 0.056, 0.054], [0.45, 0.05, 0.05], [0.55, 0.048, 0.048]], ak)); shapeFill(ctx, sl, Art.shade('#d65a3c', sc), ol); }
      if (st.fur > 0.3) furEdge(ctx, poly, Art.shade(furC, sc - 0.1), s * 0.013, 0.45, 0.95);
    }
    /* --- unealta din mâna apropiată --- */
    function drawTool(a, behind) {
      const tl = st.tool; if (!tl) return;
      const hx = a.hx + Math.sin(a.ang) * hL * 0.45, hy = a.hy + Math.cos(a.ang) * hL * 0.45;
      ctx.save(); ctx.lineCap = 'round';
      if (tl === 'spear' || tl === 'spearStone' || tl === 'smallSpear') {
        if (!behind) { ctx.restore(); return; }
        const ang = 0.2, dx = Math.sin(ang), dy = -Math.cos(ang), len = s * (tl === 'smallSpear' ? 0.95 : 1.12);
        const x0 = hx - dx * len * 0.42, y0 = hy - dy * len * 0.42, x1 = hx + dx * len * 0.58, y1 = hy + dy * len * 0.58;
        ctx.strokeStyle = '#4a3018'; ctx.lineWidth = Math.max(2.4, s * 0.017); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.strokeStyle = '#7a5530'; ctx.lineWidth = Math.max(1, s * 0.007); ctx.beginPath(); ctx.moveTo(x0 - 0.8, y0); ctx.lineTo(x1 - 0.8, y1); ctx.stroke();
        if (tl === 'spearStone') {
          const L2 = s * 0.085, px = -dy, py = dx;
          ctx.beginPath(); ctx.moveTo(x1 + dx * L2, y1 + dy * L2); ctx.quadraticCurveTo(x1 + px * L2 * 0.32 + dx * L2 * 0.3, y1 + py * L2 * 0.32 + dy * L2 * 0.3, x1 - dx * L2 * 0.1, y1 - dy * L2 * 0.1); ctx.quadraticCurveTo(x1 - px * L2 * 0.32 + dx * L2 * 0.3, y1 - py * L2 * 0.32 + dy * L2 * 0.3, x1 + dx * L2, y1 + dy * L2);
          ctx.fillStyle = '#9b958a'; ctx.fill(); ctx.strokeStyle = 'rgba(40,35,30,0.6)'; ctx.lineWidth = 1; ctx.stroke();
          ctx.strokeStyle = '#c9c3b6'; ctx.beginPath(); ctx.moveTo(x1 + dx * L2 * 0.9, y1 + dy * L2 * 0.9); ctx.lineTo(x1 + dx * L2 * 0.2 + px * L2 * 0.12, y1 + dy * L2 * 0.2 + py * L2 * 0.12); ctx.stroke();
          ctx.strokeStyle = '#3a2410'; ctx.lineWidth = Math.max(1.2, s * 0.007);
          ctx.beginPath(); for (let i = 0; i < 3; i++) { const q = -L2 * (0.1 + i * 0.12); ctx.moveTo(x1 + dx * q + px * 3, y1 + dy * q + py * 3); ctx.lineTo(x1 + dx * q - px * 3, y1 + dy * q - py * 3); } ctx.stroke();
        } else { ctx.fillStyle = '#6a4626'; ctx.beginPath(); ctx.moveTo(x1 + dx * s * 0.05, y1 + dy * s * 0.05); ctx.lineTo(x1 - dy * s * 0.008, y1 + dx * s * 0.008); ctx.lineTo(x1 + dy * s * 0.008, y1 - dx * s * 0.008); ctx.closePath(); ctx.fill(); }
      } else if (tl === 'stick') {
        if (!behind) { ctx.restore(); return; }
        const ang = 2.6, dx = Math.sin(ang), dy = -Math.cos(ang), len = s * 0.62;
        ctx.strokeStyle = '#5e4024'; ctx.lineWidth = Math.max(2, s * 0.018); ctx.beginPath(); ctx.moveTo(hx - dx * len * 0.3, hy - dy * len * 0.3); ctx.quadraticCurveTo(hx + dx * len * 0.35 + 3, hy + dy * len * 0.35, hx + dx * len * 0.7, hy + dy * len * 0.7); ctx.stroke();
      } else if (tl === 'handaxe' || tl === 'stone') {
        if (behind) { ctx.restore(); return; }
        const r = s * (tl === 'handaxe' ? 0.06 : 0.038), cx = hx + Math.sin(a.ang) * r * 0.55, cy = hy + Math.cos(a.ang) * r * 0.55;
        ctx.translate(cx, cy); ctx.rotate(-a.ang + (tl === 'handaxe' ? 0 : 0.5));
        ctx.beginPath();
        if (tl === 'handaxe') { ctx.moveTo(0, r * 1.25); ctx.bezierCurveTo(r * 0.8, r * 0.6, r * 0.75, -r * 0.7, 0, -r * 0.8); ctx.bezierCurveTo(-r * 0.75, -r * 0.7, -r * 0.8, r * 0.6, 0, r * 1.25); }
        else { ctx.moveTo(-r, 0); ctx.quadraticCurveTo(-r * 0.6, -r * 0.8, r * 0.3, -r * 0.7); ctx.lineTo(r, r * 0.1); ctx.quadraticCurveTo(r * 0.3, r * 0.8, -r * 0.6, r * 0.6); ctx.closePath(); }
        const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#c9bea6'); g.addColorStop(1, '#6f6656'); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = 'rgba(40,30,20,0.6)'; ctx.lineWidth = 0.9; ctx.stroke();
        ctx.strokeStyle = 'rgba(60,50,40,0.45)'; ctx.beginPath(); ctx.moveTo(-r * 0.35, -r * 0.3); ctx.lineTo(r * 0.05, r * 0.25); ctx.moveTo(r * 0.2, -r * 0.45); ctx.lineTo(r * 0.3, r * 0.15); ctx.moveTo(-r * 0.3, r * 0.4); ctx.lineTo(r * 0.1, r * 0.75); ctx.stroke();
      }
      ctx.restore();
    }
    /* --- trunchiul, din profil (piept, abdomen, curbura lombară, fesieri) --- */
    const bel = st.belly, lum = st.lean > 0.2 ? 0.4 : 1, ch = 1 + breathe * 0.03;
    const torsoPts = [
      P(-0.06, 0.2), P(-0.02, -1.1), P(0.14, -1.2), P(0.32, -1.08 + 0.12 * lum), P(0.52, -1.0 + 0.1 * lum), P(0.76, -1.18), P(0.95, -1.05), P(1.07, -0.55),
      P(1.05, 0.42), P(0.92, 1.0 * ch), P(0.76, 1.18 * ch), P(0.6, 1.02 + 0.25 * bel), P(0.4, 1.0 + 0.5 * bel), P(0.2, 0.95 + 0.35 * bel), P(0.03, 0.78)
    ];
    function drawTorso() {
      shapeFill(ctx, torsoPts, modern ? '#d65a3c' : body, null, 0.16, 0.32);
      /* conturul doar deasupra șoldului, ca trunchiul să se continue natural în coapse */
      { const c1 = P(0.2, -4), c2 = P(0.2, 4), c3 = P(3, 4), c4 = P(3, -4); ctx.save(); ctx.beginPath(); ctx.moveTo(c1[0], c1[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(c3[0], c3[1]); ctx.lineTo(c4[0], c4[1]); ctx.closePath(); ctx.clip();
        ctx.beginPath(); Art.smoothPath(ctx, torsoPts, true); ctx.strokeStyle = ol; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }
      if (!modern) {
        ctx.save(); ctx.strokeStyle = 'rgba(30,15,5,0.18)'; ctx.lineWidth = Math.max(0.8, s * 0.004); ctx.lineCap = 'round'; ctx.beginPath();
        let q = P(0.86, 0.9), q2 = P(0.7, 1.05), q3 = P(0.66, 0.8); ctx.moveTo(q[0], q[1]); ctx.quadraticCurveTo(q2[0], q2[1], q3[0], q3[1]);   /* pieptul */
        q = P(0.86, -0.85); q2 = P(0.7, -0.75); q3 = P(0.62, -0.95); ctx.moveTo(q[0], q[1]); ctx.quadraticCurveTo(q2[0], q2[1], q3[0], q3[1]); /* omoplatul */
        ctx.stroke(); ctx.restore();
      }
      if (st.fur > 0.3 && !modern) furEdge(ctx, torsoPts, Art.shade(furC, -0.12), s * 0.016, 0, 0.55);
    }
    function drawClothes() {
      ctx.save(); ctx.lineJoin = 'round';
      if (st.cloth === 'loin' || st.cloth === 'hide') {
        const col = st.cloth === 'loin' ? '#8b5e34' : '#7a6a4c';
        const pts = [P(0.3, -1.12), P(0.32, 1.08 + 0.3 * bel), P(0.0, 1.05), P(-0.32, 0.95), P(-0.36, 0.3), P(-0.3, -0.1), P(-0.4, -0.7), P(-0.32, -1.32), P(0.05, -1.4)];
        shapeFill(ctx, pts, col, 'rgba(40,20,8,0.5)', 0.16, 0.34);
        ctx.strokeStyle = 'rgba(40,20,8,0.4)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i < 5; i++) { const q = P(-0.34 + 0.02 * (i % 2), lerp(-1.2, 0.9, i / 4)); ctx.moveTo(q[0], q[1]); const q2 = P(-0.08, lerp(-1.0, 0.75, i / 4)); ctx.lineTo(q2[0], q2[1]); } ctx.stroke();
        const b1 = P(0.28, -1.15), b2 = P(0.3, 1.1 + 0.3 * bel); ctx.strokeStyle = '#4a2e16'; ctx.lineWidth = Math.max(1.5, s * 0.012); ctx.beginPath(); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
      } else if (st.cloth === 'leaves') {
        /* fustă de frunze și ierburi legată la talie */
        const top = 0.3, n = 9;
        const band = [P(top, -1.18), P(top, 1.05 + 0.4 * bel), P(top - 0.1, 1.08 + 0.35 * bel), P(top - 0.1, -1.25)];
        for (let i = 0; i < n; i++) {
          const f = lerp(-1.25, 1.05 + 0.3 * bel, (i + 0.5) / n), r0 = P(top - 0.02, f), len = s * (0.12 + 0.02 * Math.sin(i * 2.1)), sw = Math.sin(t * 1.2 + i) * 0.04 * (0.4 + walk);
          const ang = Math.atan2(-uy, -ux) + (f > 0 ? -0.15 : 0.15) + sw, dx = Math.cos(ang), dy = Math.sin(ang), wx = -dy, wy = dx, wv = len * 0.28;
          const tip = [r0[0] + dx * len, r0[1] + dy * len];
          ctx.beginPath(); ctx.moveTo(r0[0], r0[1]);
          ctx.quadraticCurveTo(r0[0] + dx * len * 0.5 + wx * wv, r0[1] + dy * len * 0.5 + wy * wv, tip[0], tip[1]);
          ctx.quadraticCurveTo(r0[0] + dx * len * 0.5 - wx * wv, r0[1] + dy * len * 0.5 - wy * wv, r0[0], r0[1]);
          ctx.fillStyle = Art.shade(i % 2 ? '#6f8a3a' : '#5d7a32', (i % 3 - 1) * 0.08); ctx.fill(); ctx.strokeStyle = 'rgba(30,45,10,0.6)'; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r0[0] + dx * len * 0.85, r0[1] + dy * len * 0.85); ctx.strokeStyle = 'rgba(220,235,170,0.45)'; ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(band[0][0], band[0][1]); ctx.lineTo(band[1][0], band[1][1]); ctx.strokeStyle = '#5a3d1e'; ctx.lineWidth = Math.max(1.5, s * 0.012); ctx.stroke();
      } else if (st.cloth === 'cloak') {
        const pts = [P(1.08, -0.62), P(1.1, 0.25), P(0.98, 0.7), P(0.7, 0.75), P(0.35, 0.82), P(-0.3, 1.0), P(-0.42, 0.4), P(-0.4, -0.6), P(-0.3, -1.45), P(0.4, -1.4), P(0.8, -1.42)];
        shapeFill(ctx, pts, '#9c7650', 'rgba(50,30,12,0.5)', 0.18, 0.34);
        furEdge(ctx, pts, '#7c5a38', s * 0.022, 0.0, 1);
        ctx.strokeStyle = 'rgba(70,45,20,0.4)'; ctx.lineWidth = Math.max(0.8, s * 0.005); ctx.lineCap = 'round'; ctx.beginPath();
        for (let i = 0; i < 4; i++) { const q = P(0.9 - i * 0.25, -1.2 + i * 0.05), q2 = P(0.7 - i * 0.25, -0.4 + i * 0.1); ctx.moveTo(q[0], q[1]); ctx.quadraticCurveTo(q2[0] - 2, q2[1], q2[0], q2[1] + s * 0.05); }
        ctx.stroke();
        const k1 = P(1.02, 0.5); ctx.strokeStyle = '#4a2e16'; ctx.lineWidth = Math.max(1.2, s * 0.008); ctx.beginPath(); ctx.moveTo(k1[0] - 3, k1[1] - 2); ctx.lineTo(k1[0] + 3, k1[1] + 2); ctx.stroke();
      } else if (st.cloth === 'tunic' && !modern) {
        const pts = [P(1.06, -0.58), P(1.05, 0.48), P(0.92, 1.08), P(0.76, 1.26), P(0.55, 1.12), P(0.2, 1.08), P(-0.25, 1.2), P(-0.5, 1.25), P(-0.52, 0.2), P(-0.5, -1.35), P(-0.1, -1.42), P(0.3, -1.18), P(0.55, -1.08), P(0.78, -1.25)];
        shapeFill(ctx, pts, '#a2703e', 'rgba(50,28,10,0.5)', 0.16, 0.32);
        ctx.strokeStyle = 'rgba(60,35,12,0.75)'; ctx.lineWidth = Math.max(0.8, s * 0.005); ctx.beginPath();
        for (let i = 0; i < 9; i++) { const q = P(-0.5, lerp(-1.3, 1.2, i / 8)); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - ux * s * 0.035, q[1] - uy * s * 0.035); }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(60,35,12,0.35)'; ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = P(0.9 - i * 0.3, -0.9 + i * 0.1), b = P(0.75 - i * 0.3, 0.8); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } ctx.stroke();
        const b1 = P(0.2, -1.2), b2 = P(0.2, 1.1); ctx.strokeStyle = '#5a3418'; ctx.lineWidth = Math.max(1.5, s * 0.013); ctx.beginPath(); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
        /* colier cu scoici — primele podoabe */
        ctx.fillStyle = '#f1e6cf'; ctx.strokeStyle = 'rgba(80,60,30,0.6)'; ctx.lineWidth = 0.6;
        for (let i = 0; i < 4; i++) { const q = P(0.98 - i * 0.03, 0.2 + i * 0.22); ctx.beginPath(); ctx.ellipse(q[0], q[1], s * 0.0075, s * 0.011, 0.3, 0, 7); ctx.fill(); ctx.stroke(); }
      } else if (modern) {
        const b1 = P(0.0, -1.2), b2 = P(0.02, 0.85); ctx.strokeStyle = '#2d4670'; ctx.lineWidth = Math.max(2, s * 0.03); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
      }
      ctx.restore();
    }
    /* --- cap --- */
    const hr = s * 0.064 * (st.brain < 0.4 ? 1.06 : 1);
    const hf = 0.1 + st.snout * 0.55 + st.lean * 0.5, neckL = s * 0.045;
    const nb = P(1.02, -0.1), nod = Math.sin(phase * 2) * 0.025 * walk + Math.sin(t * 0.45 + seed) * 0.012 + an.tilt;
    const Hc = [nb[0] + Math.sin(hf) * neckL + hr * 0.2, nb[1] - Math.cos(hf) * neckL - hr * 0.3];
    function headPts() {
      const b = st.brain, p = st.snout, br = st.brow, ch = st.chin, jw = st.jaw, ns = st.nose, bun = st.bun || 0;
      return [
        [-0.88 - 0.1 * b - 0.12 * bun, 0.25], [-0.98 - 0.12 * b - 0.2 * bun, -0.22 - 0.08 * b], [-0.6 - 0.06 * b, lerp(-0.52, -0.9, b)],
        [-0.02, lerp(-0.62, -1.02, b) - (st.crest ? 0.16 : 0)], [0.48, lerp(-0.42, -0.82, b)], [0.64 + 0.16 * br, lerp(-0.2, -0.4, b)],
        [0.62 + 0.06 * br + 0.16 * p, -0.1], [0.66 + 0.24 * p + 0.14 * ns, 0.06], [0.74 + 0.3 * p + 0.24 * ns, 0.22], [0.66 + 0.5 * p, 0.32],
        [0.72 + 0.6 * p, 0.42], [0.66 + 0.58 * p, 0.53], [0.68 + 0.48 * p, 0.62], [0.52 + 0.26 * p + 0.16 * ch, 0.84 + 0.05 * jw], [0.18, 0.9 + 0.12 * (jw - 1)],
        [-0.24, 0.7 + 0.12 * (jw - 1)], [-0.6, 0.5]
      ];
    }
    function drawHead() {
      /* gâtul: de la ceafă la gât, cu mușchiul sternocleidomastoidian sugerat */
      const nB = P(1.02, -0.62), nF = P(1.02, 0.38);
      const neck = [nB, [Hc[0] - hr * 0.55, Hc[1] + hr * 0.35], [Hc[0] + hr * 0.15, Hc[1] + hr * 0.75], nF];
      shapeFill(ctx, neck, Art.shade(modern ? skin : Art.mix(body, skin, 0.25), -0.05), ol, 0.1, 0.3);
      ctx.save(); ctx.translate(Hc[0], Hc[1]); ctx.rotate(nod + st.lean * 0.15); ctx.scale(hr, hr);
      const pts = headPts(), b = st.brain;
      if (st.longHair && !modern) {
        ctx.fillStyle = Art.shade(st.hair, -0.1); ctx.beginPath(); Art.smoothPath(ctx, [[-0.1, -1.0], [-0.95, -0.6], [-1.2, 0.3], [-1.1, 1.25], [-0.75, 1.45], [-0.45, 1.0], [-0.4, 0.4]], true); ctx.fill();
      }
      ctx.beginPath(); Art.smoothPath(ctx, pts, true);
      const faceC = st.fur > 0.5 ? Art.shade(skin, -0.04) : skin;
      { const g = ctx.createRadialGradient(-0.1, -0.45, 0.1, 0.1, 0.05, 1.3); g.addColorStop(0, Art.shade(faceC, 0.14)); g.addColorStop(0.55, faceC); g.addColorStop(1, Art.shade(faceC, -0.32)); ctx.fillStyle = g; ctx.fill(); }
      ctx.save(); ctx.clip();
      /* modelajul feței: obraz, umbra sub pomete, maxilar */
      ctx.fillStyle = 'rgba(120,40,20,0.12)'; ctx.beginPath(); ctx.ellipse(0.35 + 0.15 * st.snout, 0.25, 0.22, 0.16, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(30,12,4,0.14)'; ctx.beginPath(); ctx.ellipse(0.1, 0.62, 0.45, 0.16, -0.3, 0, 7); ctx.fill();
      const hairC = st.hair || furC;
      if (st.fur > 0.15 || st.hair) {
        ctx.fillStyle = hairC; ctx.beginPath();
        if (st.fur > 0.5) { ctx.moveTo(0.4, -1.5); ctx.quadraticCurveTo(0.42, -0.55, 0.2, -0.3); ctx.quadraticCurveTo(0.02, 0.0, 0.08, 0.55); ctx.quadraticCurveTo(0.2, 0.85, 0.35, 1.1); ctx.lineTo(-2, 1.5); ctx.lineTo(-2, -2); ctx.closePath(); }
        else { const hl = lerp(-0.36, -0.66, b); ctx.moveTo(0.64, hl - 0.2); ctx.quadraticCurveTo(0.4, hl + 0.02, 0.05, hl + 0.06); ctx.quadraticCurveTo(-0.25, -0.15, -0.3, 0.3); ctx.quadraticCurveTo(-0.45, 0.55, -0.7, 0.62); ctx.lineTo(-2, 1.2); ctx.lineTo(-2, -2); ctx.lineTo(0.9, -2); ctx.closePath(); }
        ctx.fill();
        ctx.strokeStyle = Art.shade(hairC, 0.18); ctx.lineWidth = 0.035; ctx.lineCap = 'round'; ctx.beginPath();
        for (let i = 0; i < 6; i++) { const a0 = -2.6 + i * 0.28; ctx.moveTo(Math.cos(a0) * 0.75, Math.sin(a0) * 0.75 - 0.1); ctx.quadraticCurveTo(Math.cos(a0 + 0.2) * 0.85, Math.sin(a0 + 0.2) * 0.85 - 0.1, Math.cos(a0 + 0.35) * 0.7, Math.sin(a0 + 0.35) * 0.7); }
        ctx.stroke();
      }
      if (st.beard && !modern) { ctx.fillStyle = Art.rgba(st.hair, 0.9 * st.beard); ctx.beginPath(); Art.smoothPath(ctx, [[0.0, 0.2], [0.35, 0.42], [0.6 + 0.4 * st.snout, 0.6], [0.6, 1.1], [0.05, 1.05], [-0.42, 0.62]], true); ctx.fill(); }
      const ex = 0.42 + 0.2 * st.snout, ey = -0.08;
      ctx.fillStyle = 'rgba(40,18,8,' + (0.16 + 0.24 * st.brow) + ')'; ctx.beginPath(); ctx.ellipse(ex + 0.04, ey - 0.02, 0.24, 0.16, 0, 0, 7); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = ol; ctx.lineWidth = LWH / hr; ctx.beginPath(); Art.smoothPath(ctx, pts, true); ctx.stroke();
      /* arcada sprâncenei */
      ctx.strokeStyle = Art.shade(faceC, -0.42); ctx.lineWidth = 0.05 + 0.08 * st.brow; ctx.lineCap = 'round';
      const bu = 0.03 * Math.max(0, -an.gy) * (1 - st.brow * 0.5); ctx.beginPath(); ctx.moveTo(ex - 0.2, ey - 0.17 - 0.04 * st.brow - bu); ctx.quadraticCurveTo(ex + 0.05, ey - 0.29 - 0.06 * st.brow - bu, ex + 0.28, ey - 0.15 - bu); ctx.stroke();
      /* ochiul: pleoapă, iris, lumină mică */
      const blink = Math.max(0.06, an.open * (1 - 0.2 * Math.max(0, an.gy)));
      const igx = ex + 0.045 + an.gx * 0.022, igy = ey + an.gy * 0.022;
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey + 0.012 * (1 - blink), 0.1, 0.06 * blink, 0.05, 0, 7); ctx.fillStyle = st.brain > 0.8 ? '#efe6da' : '#cdb8a2'; ctx.fill(); ctx.clip();
      ctx.fillStyle = st.brain > 0.8 ? '#4a2c18' : '#2a170a'; ctx.beginPath(); ctx.arc(igx, igy, 0.058, 0, 7); ctx.fill();
      ctx.fillStyle = '#0c0603'; ctx.beginPath(); ctx.arc(igx + 0.005, igy, 0.028, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(igx - 0.015, igy - 0.02, 0.014, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(40,18,8,0.25)'; ctx.fillRect(ex - 0.12, ey - 0.08, 0.24, 0.035);
      ctx.restore();
      /* pleoapa de sus coboară la clipit */
      if (blink < 0.95) { ctx.fillStyle = Art.shade(faceC, -0.08); ctx.beginPath(); ctx.ellipse(ex, ey + 0.012 * (1 - blink), 0.104, 0.064, 0.05, Math.PI, Math.PI * 2); ctx.ellipse(ex, ey + 0.012 * (1 - blink), 0.104, 0.064 * blink, 0.05, 0, Math.PI, true); ctx.fill(); }
      ctx.strokeStyle = 'rgba(40,18,8,0.7)'; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.ellipse(ex, ey + 0.012 * (1 - blink), 0.1, 0.06 * blink, 0.05, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      /* nara, buzele, urechea */
      const nsx = 0.62 + 0.3 * st.snout + 0.14 * st.nose;
      ctx.strokeStyle = 'rgba(40,18,8,0.6)'; ctx.lineWidth = 0.04;
      ctx.beginPath(); ctx.moveTo(nsx - 0.12, 0.22); ctx.quadraticCurveTo(nsx - 0.04, 0.3, nsx + 0.04, 0.26); ctx.stroke();
      ctx.fillStyle = Art.shade(faceC, -0.22); ctx.beginPath(); ctx.ellipse(0.66 + 0.42 * st.snout, 0.47, 0.07, 0.035, 0.1, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0.46 + 0.3 * st.snout, 0.5); ctx.quadraticCurveTo(0.6 + 0.4 * st.snout, 0.53, 0.7 + 0.44 * st.snout, 0.49); ctx.stroke();
      ctx.fillStyle = Art.shade(faceC, -0.1); ctx.beginPath(); Art.smoothPath(ctx, [[-0.2, -0.12], [-0.04, -0.06], [-0.02, 0.12], [-0.1, 0.26], [-0.24, 0.2], [-0.28, 0.02]], true); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-0.14, 0.06, 0.06, -1.2, 1.5); ctx.stroke();
      ctx.restore();
    }
    /* --- ordinea de desen: ce e departe, apoi ce e aproape --- */
    drawArm(aF, true);
    drawLeg(pF, true);
    drawLeg(pN, false);
    drawTorso();
    drawClothes();
    drawHead();
    drawTool(aN, true);
    drawArm(aN, false);
    drawTool(aN, false);
    return { top: Hc[1] - hr * 1.1 };
  }

  /* ---------- peisajul (straturi pre-randate, pe epoci) ---------- */
  const VAR = {
    forest: { sky: ['#5d97c9', '#d4ead2'], far: '#7d9db0', snow: 0, hills: '#4a7a44', hills2: '#3c6a3a', g0: '#467a3a', g1: '#264a22', tree: 'broad', n: 5 },
    savanna: { sky: ['#4f8fd0', '#f7d9a0'], far: '#9b8ea6', snow: 0.12, hills: '#b59a55', hills2: '#a08440', g0: '#d6ad56', g1: '#8a6428', tree: 'acacia', n: 3 },
    ice: { sky: ['#8aa6c4', '#eef2f4'], far: '#b9c8d8', snow: 0.55, hills: '#9aa594', hills2: '#86927e', g0: '#c9c8ae', g1: '#7e7f6a', tree: 'pine', n: 4 },
    today: { sky: ['#3f8fe0', '#d6ecff'], far: '#8fb0c8', snow: 0.15, hills: '#6aac4a', hills2: '#4f9a3c', g0: '#74b452', g1: '#3a7a30', tree: 'round', n: 4 }
  };
  function ridge(seed, x, w, oct) { let v = 0, a = 1, f = 1; for (let i = 0; i < (oct || 3); i++) { v += Art.noise1(x / w * 3 * f + seed * 7.3 + i * 11) * a; a *= 0.5; f *= 2.1; } return v; }
  function paintTree(c, kind, x, y, h, col) {
    if (!(h > 2)) return;
    c.save(); c.translate(x, y);
    if (kind === 'acacia') {
      c.strokeStyle = '#4a3420'; c.lineWidth = h * 0.06; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(h * 0.05, -h * 0.4, -h * 0.15, -h * 0.75); c.moveTo(h * 0.02, -h * 0.35); c.quadraticCurveTo(h * 0.2, -h * 0.55, h * 0.3, -h * 0.75); c.stroke();
      c.fillStyle = col;
      c.beginPath(); c.ellipse(0, -h * 0.8, h * 0.62, h * 0.13, 0, 0, 7); c.ellipse(-h * 0.25, -h * 0.86, h * 0.3, h * 0.1, 0, 0, 7); c.ellipse(h * 0.3, -h * 0.84, h * 0.3, h * 0.1, 0, 0, 7); c.fill();
    } else if (kind === 'pine') {
      c.fillStyle = '#4a3a2a'; c.fillRect(-h * 0.03, -h * 0.15, h * 0.06, h * 0.15);
      for (let i = 0; i < 4; i++) { const yy = -h * (0.12 + i * 0.22), ww = h * (0.32 - i * 0.06); c.fillStyle = col; c.beginPath(); c.moveTo(-ww, yy); c.lineTo(0, yy - h * 0.36); c.lineTo(ww, yy); c.closePath(); c.fill(); }
    } else {
      c.strokeStyle = '#4a3420'; c.lineWidth = h * 0.08; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -h * 0.5); c.stroke();
      const r = h * (kind === 'broad' ? 0.36 : 0.3);
      c.fillStyle = col; c.beginPath(); for (const [dx, dy, k] of [[-0.45, -1.5, 0.85], [0.45, -1.6, 0.85], [0, -2.0, 1], [-0.2, -1.4, 0.8]]) { c.moveTo(dx * r + r * k, dy * r); c.arc(dx * r, dy * r, r * k, 0, 7); } c.fill();
    }
    c.restore();
  }
  function paintBg(c, W, H, gy, top, v) {
    const V = VAR[v], sh = Math.max(40, gy - top);
    const SKY = Art.SCENE.day, g = c.createLinearGradient(0, top, 0, gy); g.addColorStop(0, SKY[0]); g.addColorStop(1, SKY[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* munți îndepărtați — o singură siluetă plată */
    const base1 = gy - sh * 0.2, amp1 = sh * 0.3;
    c.beginPath(); c.moveTo(0, gy);
    for (let x = 0; x <= W + 10; x += 10) c.lineTo(x, base1 - amp1 * (0.5 + 0.5 * ridge(1, x, W, 2)));
    c.lineTo(W, gy); c.closePath(); c.fillStyle = Art.mix(V.far, SKY[1], 0.35); c.fill();
    if (V.snow > 0) {
      const lim = base1 - amp1 * (1 - V.snow * 0.9);
      c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(0, 0, W, lim); c.restore();
    }
    /* un deal în planul mediu */
    const base = gy - sh * 0.06, amp = sh * 0.08;
    c.beginPath(); c.moveTo(0, gy + 1);
    for (let x = 0; x <= W + 10; x += 10) c.lineTo(x, base - amp * (0.5 + 0.5 * ridge(3, x, W * 1.3, 2)));
    c.lineTo(W, gy + 1); c.closePath(); c.fillStyle = V.hills; c.fill();
    /* câțiva copaci, rari */
    let s = 3 + v.length; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < V.n; i++) { const xx = (i + 0.2 + rnd() * 0.6) / V.n * W, y = gy - sh * 0.04 * rnd(), h = sh * (0.16 + rnd() * 0.05) * (V.tree === 'broad' ? 1.15 : 1); paintTree(c, V.tree, xx, y, h, V.tree === 'acacia' ? '#6b7a3a' : V.tree === 'pine' ? '#4f6e5e' : V.tree === 'broad' ? '#4b8a44' : '#5aa548'); }
    /* solul: o fâșie de iarbă și apoi banda pentru etichete */
    c.fillStyle = V.g0; c.fillRect(0, gy, W, H - gy);
    c.fillStyle = V.g1; c.fillRect(0, gy + 10, W, H - gy - 10);
  }

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
      function showSpecies(p) { sel = p; x = clamp(xOf((sel.s + sel.e) / 2), 0, 1); sl.set(x); play = false; bP.innerHTML = '▶ Derulează'; api.say('<b>' + sel.n + '</b> · ' + ageText(sel.s) + ' – ' + ageText(sel.e) + ' · ' + sel.w + '. ' + sel.t + ' <i>Înălțime ~' + fmt(sel.h, 2) + ' m, creier ~' + sel.br + ' cm³.</i>', 20000); }

      let lay = null, halfH = api.unit;
      function measure() { const ph = api.panel ? api.panel.offsetHeight : 0; halfH = Math.max(api.unit, api.H - ph - api.cy); }
      function layout() {
        const W = api.freeW, top = api.cy - halfH + 4, bottom = api.cy + halfH - 4, avail = bottom - top;
        const narrow = W < 520;
        const labelW = narrow ? 100 : 172, cx0 = labelW + 14, cw = W - cx0 - 18;
        const perH = clamp(avail * 0.04, 16, 24), perY = top + 10, rowY = perY + perH + 8;
        const rowH = clamp((avail * 0.36 - perH - 30) / SP.length, avail > 380 ? 15.5 : 12, 24);
        const rowsEnd = rowY + SP.length * rowH;
        const panelB = rowsEnd + Art.fs(api.unit, 0.05, 13) * 1.9 + 6;
        const fName = Art.labelSize(api.unit), fH = Math.max(12, fName - 2);
        const groundY = bottom - (fName * 1.8 + fH * 1.3 + 12);
        const gY = Math.max(groundY, panelB + 60);
        lay = { W, top, bottom, labelW, cx0, cw, perY, perH, rowY, rowH, rowsEnd, panelB, groundY: gY, sceneTop: panelB + 6, narrow, fName, fH };
      }
      /* stare animată pentru fiecare specie (apariție, poziție) */
      const FIG = SP.map((p, i) => ({ p: 0, x: 0, placed: false, an: { open: 1, ph: -1, wait: 1 + ((i * 0.618) % 1) * 4, gx: 0, gy: 0, tgx: 0, tgy: 0, gw: (i * 0.37) % 1 * 2, tilt: 0, ttilt: 0 } }));
      /* viața din priviri: clipit la intervale neregulate, privirea și capul se mută lin */
      function animFig(a, dt, walking) {
        a.wait -= dt;
        if (a.wait <= 0 && a.ph < 0) { a.ph = 0; a.wait = Math.random() < 0.15 ? 0.3 : 2.4 + Math.random() * 4; }
        if (a.ph >= 0) { a.ph += dt / 0.18; a.open = a.ph >= 1 ? 1 : 1 - Math.sin(Math.PI * a.ph); if (a.ph >= 1) a.ph = -1; } else a.open = 1;
        a.gw -= dt;
        if (a.gw <= 0) { const r = Math.random(); a.tgx = r < 0.4 ? 0 : Math.random() * 2 - 1; a.tgy = walking ? 0.1 : r < 0.4 ? 0 : Math.random() * 1.6 - 0.8; a.ttilt = walking ? 0 : a.tgy * 0.06 + (Math.random() - 0.5) * 0.04; a.gw = 1.4 + Math.random() * 3; }
        a.gx = Art.damp(a.gx, a.tgx, 8, dt); a.gy = Art.damp(a.gy, a.tgy, 8, dt); a.tilt = Art.damp(a.tilt, a.ttilt, 2.2, dt);
      }
      let walk = 0, phase = 0, scroll = 0, lastX = x, pxPerM = 0, fireA = 0, hits = [];
      api.pointer({
        down: (px, py) => {
          if (!lay) layout();
          const i = Math.floor((py - lay.rowY) / lay.rowH);
          if (i >= 0 && i < SP.length) { showSpecies(SP[i]); return; }
          if (px > lay.cx0 && py < lay.rowY && py > lay.top) { x = clamp((px - lay.cx0) / lay.cw, 0, 1); sl.set(x); play = false; return; }
          for (const h of hits) if (Math.abs(px - h.x) < h.w && py > h.y0 && py < h.y1) { showSpecies(SP[h.i]); return; }
        }
      });
      /* cache de fundal (cel mult câteva variante păstrate) */
      const bgCache = new Map();
      function bgFor(v) {
        const D = Math.min(api.DPR || 1, 1.5), key = v + '|' + Math.round(api.W) + 'x' + Math.round(api.H) + '|' + Math.round(lay.groundY) + '|' + Math.round(lay.sceneTop) + '|' + Math.round(lay.W);
        let c = bgCache.get(key);
        if (!c) {
          for (const k of Array.from(bgCache.keys())) if (k.split('|').slice(1).join('|') !== key.split('|').slice(1).join('|') || bgCache.size > 3) bgCache.delete(k);
          c = document.createElement('canvas'); c.width = Math.max(1, Math.round(api.W * D)); c.height = Math.max(1, Math.round(api.H * D));
          const cc = c.getContext('2d'); cc.scale(D, D); paintBg(cc, api.W, api.H, lay.groundY, lay.sceneTop, v); bgCache.set(key, c);
        }
        return c;
      }
      let lastInfo = '';
      function frame(dt, t) {
        if (play) { x = Math.min(1, x + dt * 0.04); sl.set(x); if (x >= 1) { play = false; bP.innerHTML = '↺ De la început'; } }
        measure(); layout(); LWH = Math.max(0.8, Art.lineW(api.unit) * 0.6);
        const L = lay, age = ageOf(x), X = (a) => L.cx0 + L.cw * xOf(a);
        /* mers când timpul curge, respirație când stă */
        const moving = Math.abs(x - lastX) > 1e-6 || play; lastX = x;
        walk = Art.damp(walk, moving ? 1 : 0, moving ? 5 : 2.5, dt);
        phase += dt * 6.2 * walk; scroll += dt * walk * 40;
        /* ----- peisajul: amestec de epoci ----- */
        const wF = ss(2.6e6, 4.2e6, age), wI = 0.85 * ss(4.6e5, 3.2e5, age) * ss(0.9e4, 2.4e4, age), wT = ss(2.4e4, 0.8e4, age);
        const wS = Math.max(0, 1 - wF - wI - wT);
        const ws = [['forest', wF], ['savanna', wS], ['ice', wI], ['today', wT]].filter((w) => w[1] > 0.004).sort((a, b) => b[1] - a[1]).slice(0, 3);
        let acc = 0; ctx.save();
        ws.forEach((w, k) => { acc += w[1]; ctx.globalAlpha = k === 0 ? 1 : w[1] / acc; ctx.drawImage(bgFor(w[0]), 0, 0, api.W, api.H); });
        ctx.restore();
        /* ----- scena: figuri la scară reală ----- */
        const alive = aliveAt(age), n = alive.length;
        const fireOn = age <= 4.0e5 && age >= 1.0e4 && n > 0 ? 1 : 0; fireA = Art.damp(fireA, fireOn, 3, dt);
        const rulerW = L.narrow ? 34 : 44, fireW = fireA * (L.narrow ? 44 : 80);
        const left = 8 + rulerW + 6, right = L.W - 10 - fireW;
        const slotW = (right - left) / Math.max(1, n);
        const sceneH = L.groundY - L.sceneTop;
        const targetPx = Math.min((sceneH - 8) / 1.85, slotW * 0.95 / (1.8 * 0.55));
        pxPerM = pxPerM ? Art.damp(pxPerM, targetPx, 5, dt) : targetPx;
        /* rigla de înălțime */
        ctx.save();
        const rx = 12, fs1 = Math.max(12, Art.fs(api.unit, 0.036, 12));
        for (let m = 0.5; m <= 2.0001; m += 0.5) {
          const yy = L.groundY - m * pxPerM; if (yy < L.sceneTop - 4) continue;
          ctx.strokeStyle = 'rgba(30,40,60,0.14)'; ctx.setLineDash([3, 6]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rx, yy); ctx.lineTo(right, yy); ctx.stroke(); ctx.setLineDash([]);
          ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rx - 4, yy); ctx.lineTo(rx + 4, yy); ctx.stroke();
          Art.text(ctx, fmt(m, 1) + ' m', rx + 5, yy - fs1 * 0.7, { size: fs1, align: 'left', weight: 700, halo: false, color: '#1f2a3a' });
        }
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(rx - 1.5, L.groundY - Math.min(2, sceneH / pxPerM) * pxPerM, 3, Math.min(2, sceneH / pxPerM) * pxPerM);
        ctx.restore();
        /* focul de tabără */
        if (fireA > 0.02) {
          const fx = L.W - 10 - fireW * 0.5, fy = L.groundY, fsz = Math.min(fireW * 0.45, pxPerM * 0.3) * fireA;
          ctx.save(); ctx.globalAlpha = fireA;
          for (const [a, c] of [[-0.35, '#5a3a20'], [0.35, '#6a4426']]) limb(ctx, fx - Math.cos(a) * fsz, fy - 1 + Math.sin(a) * fsz * 0.1, fx + Math.cos(a) * fsz, fy - fsz * 0.25, fsz * 0.25, fsz * 0.22, c, 'rgba(0,0,0,0.35)');
          for (const [k, c] of [[1, '#f26a2a'], [0.6, '#ffc24a']]) {
            ctx.fillStyle = c; ctx.beginPath();
            const hh = fsz * 2.0 * k * (1 + 0.05 * Math.sin(t * 2.2 + k * 3)), ww = fsz * 0.7 * k, tip = Math.sin(t * 1.4 + k) * ww * 0.15;
            ctx.moveTo(fx - ww, fy - fsz * 0.15); ctx.bezierCurveTo(fx - ww, fy - hh * 0.5, fx + tip - ww * 0.2, fy - hh * 0.7, fx + tip, fy - hh); ctx.bezierCurveTo(fx + tip + ww * 0.3, fy - hh * 0.6, fx + ww, fy - hh * 0.45, fx + ww, fy - fsz * 0.15); ctx.closePath(); ctx.fill();
          }
          ctx.restore();
        }
        /* figurile */
        alive.forEach((p, k) => { const f = FIG[SP.indexOf(p)], tx = left + (k + 0.5) * slotW; if (f.p < 0.02 || !f.placed) { f.x = tx; f.placed = true; } f.tx = tx; });
        hits = [];
        const modern = age < 2000;
        SP.forEach((p, i) => {
          const f = FIG[i], on = alive.indexOf(p) >= 0;
          f.p = Art.damp(f.p, on ? 1 : 0, 4, dt); if (on) f.x = Art.damp(f.x, f.tx, 5, dt);
          if (f.p < 0.01) { f.placed = false; return; }
          const s = p.h * pxPerM, e = Art.ease.out(f.p), isSel = sel === p;
          animFig(f.an, dt, walk > 0.3);
          ctx.fillStyle = isSel ? 'rgba(255,209,102,' + 0.7 * e + ')' : 'rgba(0,0,0,' + 0.18 * e + ')'; ctx.beginPath(); ctx.ellipse(f.x + s * 0.03, L.groundY + 2, s * 0.22, s * 0.035, 0, 0, 7); ctx.fill();
          ctx.save(); ctx.globalAlpha = e; ctx.translate(f.x, L.groundY + (1 - e) * 12);
          drawHominin(ctx, ST[i], s, t, walk, phase + i * 1.7, modern && i === 11, f.an);
          ctx.restore();
          hits.push({ i, x: f.x, w: Math.max(18, s * 0.28), y0: L.groundY - s * 1.05, y1: L.groundY + L.fName * 2 });
        });
        /* etichete sub figuri (alternând pe două rânduri dacă nu încap) */
        ctx.save(); ctx.font = Art.font(L.fName, 800);
        const shown = SP.map((p, i) => [p, i]).filter(([p, i]) => FIG[i].p > 0.05);
        const crowded = shown.some(([p, i]) => ctx.measureText(ST[i].short).width + L.fName * 1.4 > slotW);
        ctx.restore();
        shown.forEach(([p, i], k) => {
          const f = FIG[i], a = Art.ease.out(f.p);
          ctx.save(); ctx.globalAlpha = a;
          const yN = L.groundY + 8 + L.fName * 0.9 + (crowded ? (k % 2) * (L.fName * 1.75) : 0);
          Art.label(ctx, (L.narrow || crowded) ? ST[i].short : p.n.split(' (')[0], f.x, yN, { size: L.fName, bg: sel === p ? 'rgba(255,209,102,0.92)' : Art.LABEL_BG, color: sel === p ? '#2a1a05' : '#fff', border: Art.rgba(p.c, 0.8) });
          if (!crowded) Art.text(ctx, fmt(p.h, 2) + ' m', f.x, yN + L.fName * 1.45, { size: L.fH, color: 'rgba(255,248,230,0.95)', halo: false });
          else Art.text(ctx, fmt(p.h, 2) + ' m', f.x, L.groundY - p.h * pxPerM - L.fH * 0.9, { size: L.fH, color: 'rgba(255,248,230,0.95)', halo: false });
          ctx.restore();
        });
        if (!n) Art.label(ctx, 'Pe vremea aceea încă nu existau strămoși ai omului cunoscuți.', L.W / 2, L.groundY - sceneH * 0.45, { size: Art.labelSize(api.unit), bg: Art.LABEL_BG, border: false });

        /* ----- cronologia (panou de sticlă deasupra cerului) ----- */
        ctx.fillStyle = '#17151f'; Art.roundRectPath(ctx, 6, L.top, L.W - 12, L.panelB - L.top, 14); ctx.fill();
        const fRow = clamp(L.rowH * 0.78, 12, 15);
        /* perioade */
        Art.text(ctx, 'perioade', L.labelW, L.perY + L.perH / 2, { size: Math.max(12, fRow - 1), align: 'right', color: 'rgba(255,240,210,0.75)', halo: false, weight: 600 });
        PER.forEach((p) => {
          const x0 = X(p[1]), x1 = X(p[2]), w = Math.max(2, x1 - x0 - 1.5);
          ctx.save(); Art.roundRectPath(ctx, x0, L.perY, w, L.perH, Math.min(7, w / 2));
          ctx.fillStyle = p[3]; ctx.fill(); ctx.restore();
          ctx.save(); ctx.font = Art.font(Math.max(12, fRow - 2), 700); const tw = ctx.measureText(p[0]).width; ctx.restore();
          if (tw + 8 < w) Art.text(ctx, p[0], x0 + w / 2, L.perY + L.perH / 2 + 0.5, { size: Math.max(12, fRow - 2), halo: false, color: '#fff' });
        });
        /* grila de timp, foarte discretă */
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.beginPath();
        [6e6, 5e6, 4e6, 3e6, 2e6, 1e6, 5e5, 1e5].forEach((a) => { const xx = X(a); ctx.moveTo(xx, L.rowY); ctx.lineTo(xx, L.rowsEnd); }); ctx.stroke(); ctx.restore();
        /* rânduri: specii */
        SP.forEach((p, i) => {
          const y = L.rowY + i * L.rowH, on = alive.indexOf(p) >= 0, isSel = sel === p;
          if (isSel || i % 2) { ctx.fillStyle = isSel ? 'rgba(255,209,102,0.14)' : 'rgba(255,255,255,0.035)'; Art.roundRectPath(ctx, 10, y + 1, L.W - 20, L.rowH - 2, 6); ctx.fill(); }
          const nm = L.narrow ? ST[i].short : p.n;
          Art.text(ctx, nm, L.labelW, y + L.rowH / 2 + 0.5, { size: fRow, align: 'right', weight: on || isSel ? 800 : 600, color: isSel ? '#ffd166' : on ? '#fff' : 'rgba(255,255,255,0.6)', halo: false });
          const x0 = X(p.s), x1 = Math.max(X(p.e), x0 + 4), bh = L.rowH - 7;
          ctx.save(); ctx.globalAlpha = on || isSel ? 1 : 0.62;
          Art.roundRectPath(ctx, x0, y + 3.5, x1 - x0, bh, bh / 2);
          ctx.fillStyle = p.c; ctx.fill();
          if (isSel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
          ctx.restore();
        });
        /* cursorul timpului */
        const cxp = L.cx0 + L.cw * x;
        ctx.save(); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cxp, L.perY - 3); ctx.lineTo(cxp, L.rowsEnd + 2); ctx.stroke(); ctx.restore();
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(cxp, L.perY - 2, 4.5, 0, 7); ctx.fill();
        const fl = Art.labelSize(api.unit);
        ctx.save(); ctx.font = Art.font(fl, 800); const lw = ctx.measureText(ageText(age)).width + fl * 1.1; ctx.restore();
        Art.label(ctx, ageText(age), clamp(cxp, 14 + lw / 2, L.W - 14 - lw / 2), L.rowsEnd + fl * 0.95 + 2, { size: fl, bg: 'rgba(255,209,102,0.95)', color: '#2a1a05', weight: 800, tx: cxp, ty: L.rowsEnd + 2, lineColor: '#ffd166' });

        const s2 = n ? '<b>' + ageText(age) + ':</b> ' + alive.map((p) => p.n.split(' (')[0]).join(', ') + (n > 1 ? ' — <b>' + n + ' specii trăiau în același timp</b>' : '') : 'Niciun strămoș cunoscut.';
        if (s2 !== lastInfo) { info.innerHTML = s2; lastInfo = s2; }
      }
      return { frame: frame };
    }
  });
})();
