/* ============================================================
   MODULE INTERACTIVE — cadrul comun
   Fiecare modul (gaură neagră, explozii, gravitație) se înregistrează
   cu defineModule({ id, title, sub, start(api) }) și primește un „api”
   cu canvas-ul, panoul de comenzi și câteva ajutoare.
   ============================================================ */
(function () {
  const MODS = {};

  /* ---------- textele explicative pot fi ascunse (util când părintele povestește) ---------- */
  const textsOff = () => document.body.classList.contains('texts-off');
  function markNew(on) { const b = document.getElementById('mod-text'); if (b) b.classList.toggle('has-new', !!on); }
  function setTexts(on, save) {
    document.body.classList.toggle('texts-off', !on);
    const b = document.getElementById('mod-text');
    if (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.querySelector('span').textContent = on ? 'Text' : 'Text ascuns'; }
    if (on) markNew(false);
    if (save) { try { localStorage.setItem('texts', on ? 'on' : 'off'); } catch (e) { } }
    window.dispatchEvent(new Event('resize'));          // modulul își recalculează zona de desen
  }
  window.defineModule = function (d) { MODS[d.id] = d; };

  const $ = (s) => document.querySelector(s);
  let cur = null, curApi = null;

  function openModule(id) {
    const def = MODS[id];
    if (!def) return;
    closeModule(true);
    $('#home').classList.add('hidden');
    $('#module').classList.remove('hidden');
    $('#mod-title').textContent = def.title;
    $('#mod-sub').textContent = def.sub || '';
    /* secțiunea din care face parte modulul: culoarea și „firimitura” din bara de sus */
    const card = document.querySelector('[data-module="' + id + '"]');
    const secView = card && card.closest('.sec-view');
    const modEl = $('#module');
    if (secView) {
      modEl.style.setProperty('--c1', secView.style.getPropertyValue('--c1'));
      modEl.style.setProperty('--c2', secView.style.getPropertyValue('--c2'));
      const st = secView.querySelector('.sec-title');
      $('#mod-crumb').textContent = st ? st.textContent : '';
    } else $('#mod-crumb').textContent = '';
    const panel = $('#mod-panel'); panel.innerHTML = '';
    const info = $('#mod-info'); info.innerHTML = ''; info.classList.remove('show'); let lastSay = '';
    const canvas = $('#mod-canvas');
    const ctx = canvas.getContext('2d');
    const cleanups = [];
    let panelH = 0;

    /* ---------- „camera” generală: zoom ×1…×4 și deplasare (nu la modulele cu zoom propriu) ---------- */
    const ZMAX = 4, canZoom = !def.ownZoom;
    const view = { z: 1, ox: 0, oy: 0, zt: 1, oxt: 0, oyt: 0, pinching: false, gestureWasPinch: false };
    const clampView = () => {
      view.zt = Math.max(1, Math.min(ZMAX, view.zt));
      view.oxt = Math.min(0, Math.max(api.W - api.W * view.zt, view.oxt));
      /* sus lăsăm loc cât bara de titlu: ce e chiar sub ea (ex. capul copilului) poate fi adus în vedere */
      view.oyt = Math.min(view.zt > 1.001 ? 64 : 0, Math.max(api.H - api.H * view.zt, view.oyt));
    };
    function zoomAt(px, py, factor) {                     // mărește în jurul punctului (px, py) de pe ecran
      if (!canZoom) return;
      const z1 = Math.max(1, Math.min(ZMAX, view.zt * factor)), k = z1 / view.zt;
      view.oxt = px - (px - view.oxt) * k; view.oyt = py - (py - view.oyt) * k; view.zt = z1;
      clampView(); syncTools();
    }
    const zoomCenter = (f) => zoomAt(api.freeW / 2, api.cy, f);
    function zoomReset() { view.zt = 1; view.oxt = 0; view.oyt = 0; syncTools(); }

    /* ---------- timpul: pauză și încetinire ---------- */
    const SPEEDS = [1, 0.5, 0.25];
    let paused = false, speedI = 0, vt = 0;

    /* ---------- suprapuneri desenate peste modul (în coordonatele ecranului) ---------- */
    const ripples = [], trail = [];
    let laser = false, fade = 0, fadeT0 = 0, laserPt = null, laserIn = false;
    const snap = document.createElement('canvas');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const api = {
      canvas: canvas, ctx: ctx, panel: panel,
      W: 0, H: 0, DPR: 1, cx: 0, cy: 0, unit: 100, freeW: 0,
      /* zona liberă a ecranului (între bara de sus și panoul de jos) */
      layout: function () {
        const shown = info.classList.contains('show') && info.offsetParent !== null;   // ascuns în modul ?thumb=1
        const side = shown && window.matchMedia('(min-width: 900px)').matches;   // pe ecran lat: panou în dreapta
        const infoH = shown && !side ? info.offsetHeight + 8 : 0;
        const top = 62 + infoH;
        const freeH = Math.max(120, api.H - top - panelH);
        const freeW = side ? api.W - 372 : api.W;
        api.freeW = freeW;
        api.cx = freeW / 2;
        api.cy = top + freeH / 2;
        api.unit = Math.min(freeW, freeH) / 2;
      },
      say: function (html, ms) {
        lastSay = html;
        info.innerHTML = html;
        info.classList.add('show');
        clearTimeout(api._sayT);
        if (ms) api._sayT = setTimeout(() => { info.classList.remove('show'); markNew(false); }, ms);
        markNew(textsOff());                     // textele sunt ascunse: butonul „Text” arată că a apărut un mesaj nou
      },
      row: function (title) {
        const r = document.createElement('div');
        r.className = 'mod-row';
        if (title) { const t = document.createElement('span'); t.className = 'mod-rt'; t.textContent = title; r.appendChild(t); }
        panel.appendChild(r);
        return r;
      },
      button: function (row, text, fn, opts) {
        const b = document.createElement('button');
        b.className = 'pill' + (opts && opts.cls ? ' ' + opts.cls : '');
        b.innerHTML = text;
        b.addEventListener('click', () => fn(b));
        row.appendChild(b);
        return b;
      },
      slider: function (row, o) {
        const w = document.createElement('label');
        w.className = 'mod-slider';
        const lab = document.createElement('span');
        const inp = document.createElement('input');
        inp.type = 'range'; inp.min = o.min; inp.max = o.max; inp.step = o.step || 'any'; inp.value = o.value;
        const upd = () => { lab.innerHTML = o.label + ' · <b>' + (o.fmt ? o.fmt(Number(inp.value)) : inp.value) + '</b>'; };
        inp.addEventListener('input', () => { o.onInput(Number(inp.value)); upd(); });
        w.appendChild(lab); w.appendChild(inp); row.appendChild(w);
        upd();
        return { input: inp, set: function (v) { inp.value = v; upd(); }, refresh: upd };
      },
      /* pointer: down/move/up primesc (x, y) în pixeli CSS, relativ la canvas */
      pointer: function (h) {
        /* coordonatele ecranului → coordonatele desenului (prin zoom-ul general) */
        const pos = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left - view.ox) / view.z, (e.clientY - r.top - view.oy) / view.z]; };
        let down = false;
        const d = (e) => { if (view.pinching) return; down = true; try { canvas.setPointerCapture(e.pointerId); } catch (er) { } const p = pos(e); h.down && h.down(p[0], p[1], e); };
        const m = (e) => { if (view.pinching) return; const p = pos(e); if (down) h.move && h.move(p[0], p[1], e); else h.hover && h.hover(p[0], p[1], e); };
        const u = (e) => { if (!down) return; down = false; if (view.pinching || view.gestureWasPinch) return; const p = pos(e); h.up && h.up(p[0], p[1], e); };
        canvas.addEventListener('pointerdown', d);
        canvas.addEventListener('pointermove', m);
        canvas.addEventListener('pointerup', u);
        canvas.addEventListener('pointercancel', u);
        cleanups.push(() => {
          canvas.removeEventListener('pointerdown', d); canvas.removeEventListener('pointermove', m);
          canvas.removeEventListener('pointerup', u); canvas.removeEventListener('pointercancel', u);
        });
      },
      reshow: function () { if (!lastSay) return; if (textsOff()) setTexts(true, true); info.innerHTML = lastSay; info.classList.add('show'); clearTimeout(api._sayT); markNew(false); api.layout(); if (inst && inst.resize) inst.resize(); },
      onCleanup: function (fn) { cleanups.push(fn); }
    };

    function resize() {
      api.DPR = Math.min(window.devicePixelRatio || 1, 2);
      api.W = canvas.clientWidth; api.H = canvas.clientHeight;
      canvas.width = Math.round(api.W * api.DPR);
      canvas.height = Math.round(api.H * api.DPR);
      ctx.setTransform(api.DPR, 0, 0, api.DPR, 0, 0);
      panelH = panel.offsetHeight;
      api.layout();
      clampView(); view.z = view.zt; view.ox = view.oxt; view.oy = view.oyt;
      if (tools) tools.style.bottom = (panelH + 14) + 'px';
      if (inst && inst.resize) inst.resize();
    }
    const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    /* când apare/dispare/se schimbă bula de informații, mutăm desenul sub ea */
    const roInfo = window.ResizeObserver ? new ResizeObserver(() => { api.layout(); if (inst && inst.resize) inst.resize(); }) : null;
    if (roInfo) roInfo.observe(info);
    const closeInfo = () => { info.classList.remove('show'); clearTimeout(api._sayT); api.layout(); if (inst && inst.resize) inst.resize(); };
    info.addEventListener('click', closeInfo);
    cleanups.push(() => info.removeEventListener('click', closeInfo));
    cleanups.push(() => { if (roInfo) roInfo.disconnect(); });
    if (ro) { ro.observe(canvas); ro.observe(panel); }
    window.addEventListener('resize', resize);
    cleanups.push(() => { if (ro) ro.disconnect(); window.removeEventListener('resize', resize); });

    const rel = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const onWheel = (e) => { if (!canZoom) return; e.preventDefault(); const p = rel(e); zoomAt(p[0], p[1], Math.exp(-e.deltaY * 0.0015)); };
    let pinch = null;
    const tmid = (e) => { const r = canvas.getBoundingClientRect(); return [(e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left, (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top]; };
    const tdist = (e) => Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    const onTS = (e) => { if (!canZoom) return; if (e.touches.length === 2) { e.preventDefault(); const m = tmid(e); pinch = { d0: tdist(e), z0: view.zt, m0: m, ox0: view.oxt, oy0: view.oyt }; view.pinching = view.gestureWasPinch = true; } else if (e.touches.length === 1) view.gestureWasPinch = false; };
    const onTM = (e) => {
      if (!pinch || e.touches.length !== 2) return; e.preventDefault();
      const m = tmid(e), z1 = Math.max(1, Math.min(ZMAX, pinch.z0 * tdist(e) / pinch.d0)), k = z1 / pinch.z0;
      view.zt = z1; view.oxt = m[0] - (pinch.m0[0] - pinch.ox0) * k; view.oyt = m[1] - (pinch.m0[1] - pinch.oy0) * k; clampView(); syncTools();
    };
    const onTE = (e) => { if (e.touches.length < 2 && pinch) { pinch = null; setTimeout(() => { view.pinching = false; }, 60); } };
    const onDown = (e) => { const p = rel(e), tt = performance.now() / 1000; if (!reduceMotion) ripples.push({ x: p[0], y: p[1], t: tt }); if (laser) { trail.push({ x: p[0], y: p[1], t: tt }); laserPt = { x: p[0], y: p[1], t: tt }; } };
    const onMove = (e) => { if (!laser) return; const p = rel(e), tt = performance.now() / 1000; trail.push({ x: p[0], y: p[1], t: tt }); if (trail.length > 60) trail.shift(); laserPt = { x: p[0], y: p[1], t: tt }; laserIn = e.pointerType === 'mouse'; };
    const onLeave = () => { laserIn = false; };
    /* trecere lină: înainte ca un buton din panou să schimbe scena, păstrăm imaginea curentă */
    const onPanelClick = (e) => { if (reduceMotion || !e.target.closest('button')) return; snap.width = canvas.width; snap.height = canvas.height; const sc = snap.getContext('2d'); sc.clearRect(0, 0, snap.width, snap.height); sc.drawImage(canvas, 0, 0); fade = 1; fadeT0 = performance.now(); };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTS, { passive: false });
    canvas.addEventListener('touchmove', onTM, { passive: false });
    canvas.addEventListener('touchend', onTE); canvas.addEventListener('touchcancel', onTE);
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerleave', onLeave);
    panel.addEventListener('click', onPanelClick, true);
    cleanups.push(() => {
      canvas.removeEventListener('wheel', onWheel); canvas.removeEventListener('touchstart', onTS); canvas.removeEventListener('touchmove', onTM);
      canvas.removeEventListener('touchend', onTE); canvas.removeEventListener('touchcancel', onTE);
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave);
      panel.removeEventListener('click', onPanelClick, true);
    });

    /* bara de unelte din stânga: pauză, viteză, zoom, indicator */
    const tools = $('#mod-tools');
    function syncTools() {
      if (!tools) return;
      tools.classList.toggle('no-zoom', !canZoom);
      const pb = $('#mt-play'); pb.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-' + (paused ? 'play' : 'pause') + '"/></svg>'; pb.setAttribute('aria-label', paused ? 'Pornește animația' : 'Pune pauză'); pb.classList.toggle('on', paused);
      const sb = $('#mt-speed'); sb.textContent = ['1×', '½×', '¼×'][speedI]; sb.classList.toggle('on', speedI > 0); sb.setAttribute('aria-label', 'Viteza animației: ' + ['normală', 'jumătate', 'un sfert'][speedI]);
      $('#mt-zreset').classList.toggle('hidden', view.zt <= 1.001);
      $('#mt-zin').disabled = view.zt >= ZMAX - 0.001; $('#mt-zout').disabled = view.zt <= 1.001;
      $('#mt-laser').classList.toggle('on', laser); $('#mt-laser').setAttribute('aria-pressed', laser ? 'true' : 'false');
      canvas.classList.toggle('laser', laser);
    }
    const toolActs = {
      'mt-more': () => { tools.classList.toggle('open'); },
      'mt-play': () => { paused = !paused; }, 'mt-speed': () => { speedI = (speedI + 1) % SPEEDS.length; },
      'mt-zin': () => zoomCenter(1.5), 'mt-zout': () => zoomCenter(1 / 1.5), 'mt-zreset': zoomReset,
      'mt-laser': () => { laser = !laser; trail.length = 0; }
    };
    const onTool = (e) => { const b = e.target.closest('button'); if (!b || !toolActs[b.id]) return; toolActs[b.id](); syncTools(); };
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      const k = e.key;
      if (k === ' ' && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) { e.preventDefault(); paused = !paused; }
      else if (k === '+' || k === '=') zoomCenter(1.5);
      else if (k === '-' || k === '_') zoomCenter(1 / 1.5);
      else if (k === '0') zoomReset();
      else if (k === 'p' || k === 'P') { laser = !laser; trail.length = 0; }
      else if (k === 's' || k === 'S') speedI = (speedI + 1) % SPEEDS.length;
      else return;
      syncTools();
    };
    if (tools) tools.addEventListener('click', onTool);
    window.addEventListener('keydown', onKey);
    cleanups.push(() => { if (tools) tools.removeEventListener('click', onTool); window.removeEventListener('keydown', onKey); canvas.classList.remove('laser'); });

    let inst = null;
    let raf = 0, last = performance.now(), alive = true;
    inst = def.start(api) || {};
    resize();
    syncTools();

    function loop(now) {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const sdt = paused ? 0 : dt * SPEEDS[speedI];
      vt += sdt;
      /* camera se apropie lin de țintă */
      const k = 1 - Math.exp(-12 * dt);
      view.z += (view.zt - view.z) * k; view.ox += (view.oxt - view.ox) * k; view.oy += (view.oyt - view.oy) * k;
      if (Math.abs(view.z - view.zt) < 1e-4) { view.z = view.zt; view.ox = view.oxt; view.oy = view.oyt; }
      const D = api.DPR;
      if (view.oy > 0.5) { ctx.setTransform(D, 0, 0, D, 0, 0); ctx.fillStyle = '#070a17'; ctx.fillRect(0, 0, api.W, view.oy + 1); }   // fâșia de deasupra desenului
      ctx.setTransform(D * view.z, 0, 0, D * view.z, D * view.ox, D * view.oy);
      if (inst.frame && api.W >= 40 && api.H >= 40) inst.frame(sdt, vt);   // nu desenăm pe o suprafață încă nedimensionată
      ctx.setTransform(D, 0, 0, D, 0, 0);
      overlays(dt, now / 1000);
      raf = requestAnimationFrame(loop);
    }
    function overlays(dt, t) {
      /* trecere lină: imaginea dinainte de schimbare se estompează peste cea nouă */
      if (fade > 0) {
        fade = Math.max(0, 1 - (performance.now() - fadeT0) / 350);     // după ceasul real: durează 0,35 s și când browserul e încărcat
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = fade * fade * (3 - 2 * fade);
        ctx.drawImage(snap, 0, 0); ctx.restore();
      }
      /* cercuri la atingere */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i], a = (t - r.t) / 0.5; if (a >= 1) { ripples.splice(i, 1); continue; }
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2.5 * (1 - a) + 0.5;
        ctx.beginPath(); ctx.arc(r.x, r.y, 8 + 26 * (1 - Math.pow(1 - a, 3)), 0, 6.2832); ctx.stroke(); ctx.restore();
      }
      /* indicatorul pentru proiector: un punct care urmărește mouse-ul/degetul, cu o dâră scurtă */
      if (laser) {
        while (trail.length && t - trail[0].t > 0.35) trail.shift();
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let i = 1; i < trail.length; i++) { const a = 1 - (t - trail[i].t) / 0.35; ctx.strokeStyle = 'rgba(255,92,92,' + (0.45 * a).toFixed(3) + ')'; ctx.lineWidth = 6 * a + 1; ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke(); }
        ctx.restore();
        /* punctul rămâne cât timp cursorul e pe desen (pe ecran tactil: încă 1,5 s după ce ridici degetul) */
        if (laserPt && (laserIn || t - laserPt.t < 1.5)) {
          ctx.save(); const p = laserPt;
          ctx.fillStyle = 'rgba(255,92,92,0.25)'; ctx.beginPath(); ctx.arc(p.x, p.y, 18, 0, 6.2832); ctx.fill();
          ctx.fillStyle = '#ff5c5c'; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 6.2832); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        }
      }
    }
    raf = requestAnimationFrame(loop);
    curApi = api;
    if (window.UX) UX.onOpen(id, def.title);

    cur = {
      stop: function () {
        alive = false;
        cancelAnimationFrame(raf);
        clearTimeout(api._sayT);
        if (inst.stop) inst.stop();
        cleanups.forEach((f) => f());
      }
    };
  }

  function closeModule(silent) {
    if (cur) { cur.stop(); cur = null; curApi = null; if (window.UX) UX.onClose(); }
    if (silent) return;
    $('#module').classList.add('hidden');
    $('#home').classList.remove('hidden');
  }

  /* meniul de secțiuni: iconițe mari care duc la câmpul cu toate modulele */
  function showSection(id) {
    const hub = $('#hub');
    document.querySelectorAll('.sec-tab').forEach((t) => {
      const on = t.getAttribute('data-tab') === id;
      t.classList.toggle('active', on);
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
      if (on && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
    document.body.setAttribute('data-section', id || 'hub');
    document.querySelectorAll('.sec-view').forEach((v) => v.classList.add('hidden'));
    if (id) { hub.classList.add('hidden'); $('#sec-' + id).classList.remove('hidden'); try { sessionStorage.setItem('sec', id); } catch (e) { } }
    else { hub.classList.remove('hidden'); try { sessionStorage.removeItem('sec'); } catch (e) { } }
    const home = $('#home'); if (home) home.scrollTop = 0;
  }
  window.showSection = showSection;

  /* ---------- navigare cu adrese (#space, #m/heart, #harta) ----------
     Butonul Back din browser / telefon funcționează, iar fiecare modul
     are propriul link. ?thumb=1 ascunde interfața (pentru imaginile cardurilor). */
  const SECS = ['space', 'body', 'how', 'earth'];
  /* history.state.i = câți pași am făcut în aplicație; „Înapoi” folosește istoricul doar dacă există pași */
  const stepIdx = () => (history.state && history.state.i) || 0;
  const sectionOf = (modId) => { const c = document.querySelector('[data-module="' + modId + '"]'); const v = c && c.closest('.sec-view'); return v ? v.id.replace('sec-', '') : null; };
  function go(hash) { if (location.hash !== hash && !(hash === '#' && !location.hash)) history.pushState({ i: stepIdx() + 1 }, '', hash === '#' ? location.pathname + location.search : hash); route(); }
  function up(hash) { if (stepIdx() > 0) history.back(); else { history.replaceState({ i: 0 }, '', hash || location.pathname + location.search); route(); } }
  window.navTo = go;
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ''));
    const app = $('#app');
    if (h.indexOf('m/') === 0) {
      const id = h.slice(2);
      if (!MODS[id]) { history.replaceState(null, '', location.pathname + location.search); route(); return; }
      if (app && !app.classList.contains('hidden')) app.classList.add('hidden');
      const sec = sectionOf(id); if (sec) showSection(sec);
      if (!cur || cur.id !== id) { openModule(id); cur.id = id; }
      return;
    }
    if (cur) closeModule();
    if (h === 'harta') { if (typeof window.startApp === 'function' && app && app.classList.contains('hidden')) window.startApp(); return; }
    if (app && !app.classList.contains('hidden')) { app.classList.add('hidden'); $('#home').classList.remove('hidden'); }
    showSection(SECS.indexOf(h) >= 0 ? h : null);
  }

  window.addEventListener('DOMContentLoaded', () => {
    if (/[?&]thumb=1/.test(location.search)) document.body.classList.add('thumb');
    let pref = 'on'; try { pref = localStorage.getItem('texts') || 'on'; } catch (e) { }
    setTexts(pref !== 'off', false);
    const mhelp = $('#mod-help'); if (mhelp) mhelp.addEventListener('click', () => { if (curApi) curApi.reshow(); });
    const mfull = $('#mod-full'); if (mfull) mfull.addEventListener('click', () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { }); else document.exitFullscreen().catch(() => { }); });
    const tt = $('#mod-text');
    if (tt) tt.addEventListener('click', () => { const on = textsOff(); setTexts(on, true); if (on) { const inf = $('#mod-info'); if (inf.innerHTML) inf.classList.add('show'); window.dispatchEvent(new Event('resize')); } });
    window.addEventListener('keydown', (e) => { if ((e.key === 't' || e.key === 'T') && cur && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) $('#mod-text').click(); });
    document.querySelectorAll('.sec-tile').forEach((t) => {
      const id = t.getAttribute('data-section');
      const n = document.querySelectorAll('#sec-' + id + ' .card').length;
      document.querySelectorAll('[data-count="' + id + '"]').forEach((c) => { c.textContent = n + (n === 1 ? ' activitate' : ' activități'); });
      t.addEventListener('click', () => go('#' + id));
    });
    document.querySelectorAll('.sec-back').forEach((b) => b.addEventListener('click', () => up('')));
    document.querySelectorAll('.sec-tab').forEach((t) => t.addEventListener('click', () => go('#' + t.getAttribute('data-tab'))));
    const brand = $('#brand-home'); if (brand) brand.addEventListener('click', () => go('#'));
    const full = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { }); else document.exitFullscreen().catch(() => { }); };
    const hf = $('#btn-hub-full'); if (hf) hf.addEventListener('click', full);
    window.addEventListener('keydown', (e) => {
      const home = $('#home');
      if ((e.key === 'f' || e.key === 'F') && home && !home.classList.contains('hidden') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) full();
    });
    document.querySelectorAll('[data-module]').forEach((el) => {
      el.addEventListener('click', () => go('#m/' + el.getAttribute('data-module')));
    });
    const sp = $('#start-space'); if (sp) sp.addEventListener('click', () => { history.pushState({ i: stepIdx() + 1 }, '', '#harta'); });
    const mh = $('#btn-menu-home'); if (mh) mh.addEventListener('click', () => up('#space'));
    const back = () => { const id = cur && cur.id; up('#' + (sectionOf(id) || '')); };
    $('#mod-back').addEventListener('click', back);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && cur) back(); });
    window.addEventListener('hashchange', route);
    window.addEventListener('popstate', route);
    if (location.hash) route();
    else showSection(null);
  });
})();
