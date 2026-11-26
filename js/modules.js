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
    const panel = $('#mod-panel'); panel.innerHTML = '';
    const info = $('#mod-info'); info.innerHTML = ''; info.classList.remove('show');
    const canvas = $('#mod-canvas');
    const ctx = canvas.getContext('2d');
    const cleanups = [];
    let panelH = 0;

    const api = {
      canvas: canvas, ctx: ctx, panel: panel,
      W: 0, H: 0, DPR: 1, cx: 0, cy: 0, unit: 100,
      /* zona liberă a ecranului (între bara de sus și panoul de jos) */
      layout: function () {
        const top = 62;
        const freeH = Math.max(120, api.H - top - panelH);
        api.cx = api.W / 2;
        api.cy = top + freeH / 2;
        api.unit = Math.min(api.W, freeH) / 2;
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

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-module]').forEach((el) => {
      el.addEventListener('click', () => openModule(el.getAttribute('data-module')));
    });
    $('#mod-back').addEventListener('click', () => closeModule());
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cur) closeModule();
    });
  });
})();
