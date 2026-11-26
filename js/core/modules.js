/* ============================================================
   MODULE INTERACTIVE — cadrul comun
   Fiecare modul (gaură neagră, explozii, gravitație) se înregistrează
   cu defineModule({ id, title, sub, start(api) }) și primește un „api”
   cu canvas-ul, panoul de comenzi și câteva ajutoare.
   ============================================================ */
(function () {
  const MODS = {};
  window.defineModule = function (d) { MODS[d.id] = d; };

  const $ = (s) => document.querySelector(s);
  let cur = null;

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
    const view = card && card.closest('.sec-view');
    const modEl = $('#module');
    if (view) {
      modEl.style.setProperty('--c1', view.style.getPropertyValue('--c1'));
      modEl.style.setProperty('--c2', view.style.getPropertyValue('--c2'));
      const st = view.querySelector('.sec-title');
      $('#mod-crumb').textContent = st ? st.textContent : '';
    } else $('#mod-crumb').textContent = '';
    const panel = $('#mod-panel'); panel.innerHTML = '';
    const info = $('#mod-info'); info.innerHTML = ''; info.classList.remove('show');
    const canvas = $('#mod-canvas');
    const ctx = canvas.getContext('2d');
    const cleanups = [];
    let panelH = 0;

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
        info.innerHTML = html;
        info.classList.add('show');
        clearTimeout(api._sayT);
        if (ms) api._sayT = setTimeout(() => info.classList.remove('show'), ms);
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
        const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
        let down = false;
        const d = (e) => { down = true; canvas.setPointerCapture(e.pointerId); const p = pos(e); h.down && h.down(p[0], p[1], e); };
        const m = (e) => { const p = pos(e); if (down) h.move && h.move(p[0], p[1], e); else h.hover && h.hover(p[0], p[1], e); };
        const u = (e) => { if (!down) return; down = false; const p = pos(e); h.up && h.up(p[0], p[1], e); };
        canvas.addEventListener('pointerdown', d);
        canvas.addEventListener('pointermove', m);
        canvas.addEventListener('pointerup', u);
        canvas.addEventListener('pointercancel', u);
        cleanups.push(() => {
          canvas.removeEventListener('pointerdown', d); canvas.removeEventListener('pointermove', m);
          canvas.removeEventListener('pointerup', u); canvas.removeEventListener('pointercancel', u);
        });
      },
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
      if (inst && inst.resize) inst.resize();
    }
    const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    /* când apare/dispare/se schimbă bula de informații, mutăm desenul sub ea */
    const roInfo = window.ResizeObserver ? new ResizeObserver(() => { api.layout(); if (inst && inst.resize) inst.resize(); }) : null;
    if (roInfo) roInfo.observe(info);
    cleanups.push(() => { if (roInfo) roInfo.disconnect(); });
    if (ro) { ro.observe(canvas); ro.observe(panel); }
    window.addEventListener('resize', resize);
    cleanups.push(() => { if (ro) ro.disconnect(); window.removeEventListener('resize', resize); });

    let inst = null;
    let raf = 0, last = performance.now(), alive = true;
    inst = def.start(api) || {};
    resize();

    function loop(now) {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (inst.frame) inst.frame(dt, now / 1000);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

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
    if (cur) { cur.stop(); cur = null; }
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
