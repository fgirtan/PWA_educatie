/* UX: progres (stele), căutare, „Continuă”, mărime text, instalare, ghid de bun venit */
(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  let visited = new Set(store.get('visited', [])), last = store.get('lastModule', null), timer = 0, scale = store.get('uiScale', 1), deferred = null;
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const meta = {};                                    // id -> { title, desc, section, icon }
  const SECT_C = { space: '#8b7bff', body: '#ff6b8a', how: '#ffb43d', earth: '#35c3a0' };
  function scan() {
    $$('.sec-view').forEach((v) => { const sec = v.id.replace('sec-', ''), name = ($('.sec-title', v) || {}).textContent || ''; v.querySelectorAll('.card').forEach((c) => { const id = c.getAttribute('data-module') || (c.id === 'start-space' ? 'start-space' : null); if (!id) return; meta[id] = { title: ($('h3, h2', c) || {}).textContent || id, desc: ($('p', c) || {}).textContent || '', section: sec, sname: name.replace(/^[^\wăâîșțĂÂÎȘȚ]+/u, '').trim(), card: c }; }); });
  }
  const total = () => Object.keys(meta).length;
  function toast(msg) { let t = $('#ux-toast'); if (!t) { t = document.createElement('div'); t.id = 'ux-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3800); }
  function paint() {
    Object.keys(meta).forEach((id) => { const c = meta[id].card; let b = c.querySelector('.badge-done'); const on = visited.has(id); if (on && !b) { b = document.createElement('span'); b.className = 'badge-done'; b.textContent = '⭐ Explorat'; c.appendChild(b); } else if (!on && b) b.remove(); c.classList.toggle('done', on); });
    const n = visited.size, t = total();
    const bar = $('#ux-progress'); if (bar) { bar.querySelector('b').textContent = n + ' din ' + t; bar.querySelector('i').style.width = Math.round(n / Math.max(t, 1) * 100) + '%'; }
    $$('.sec-tile').forEach((tile) => { const sec = tile.getAttribute('data-section'), ids = Object.keys(meta).filter((i) => meta[i].section === sec), d = ids.filter((i) => visited.has(i)).length, c = tile.querySelector('.sec-count'); if (c) c.textContent = d + ' din ' + ids.length + ' explorate' + (d === ids.length && ids.length ? ' ⭐' : ''); });
    const rs = $('#ux-resume'); if (rs) { const ok = last && meta[last]; rs.classList.toggle('hidden', !ok); if (ok) rs.querySelector('span').textContent = meta[last].title; }
  }
  function applyScale() { document.documentElement.style.setProperty('--ux-zoom', String(scale)); ['.home-inner', '#mod-panel', '#mod-info'].forEach((s) => $$(s).forEach((e) => { e.style.zoom = scale === 1 ? '' : String(scale); })); const l = $('#ux-size-val'); if (l) l.textContent = Math.round(scale * 100) + '%'; }
  function search(q) {
    const tiles = $('.sec-tiles'), wrap = $('#ux-res-wrap'); q = norm(q.trim());
    tiles.classList.toggle('hidden', !!q); wrap.classList.toggle('hidden', !q);
    if (!q) return;
    const list = Object.keys(meta).filter((id) => norm(meta[id].title + ' ' + meta[id].desc + ' ' + meta[id].sname).includes(q));
    const box = $('#ux-results'); box.innerHTML = '';
    $('#ux-res-title').textContent = list.length ? list.length + (list.length === 1 ? ' rezultat' : ' rezultate') : 'Niciun rezultat';
    if (!list.length) { box.innerHTML = '<p class="sec-desc">Nu am găsit nimic. Încearcă: inimă, avion, vulcan, dinozauri, soare…</p>'; return; }
    list.forEach((id) => { const m = meta[id], b = document.createElement('button'); b.className = 'res'; b.innerHTML = '<span class="res-ico" style="--c1:' + (SECT_C[m.section] || '#7cc8ff') + '"></span><span><b></b><small></small></span>' + (visited.has(id) ? '<em>⭐</em>' : ''); b.querySelector('b').textContent = m.title; b.querySelector('small').textContent = m.sname + ' · ' + m.desc.slice(0, 70) + (m.desc.length > 70 ? '…' : ''); b.addEventListener('click', () => { const el = id === 'start-space' ? $('#start-space') : $('[data-module="' + id + '"]'); if (el) el.click(); }); box.appendChild(b); });
  }
  window.UX = {
    sectionName: (id) => meta[id] ? meta[id].sname : '',
    onOpen: (id, title) => { last = id; store.set('lastModule', id); clearTimeout(timer); if (!visited.has(id)) timer = setTimeout(() => { visited.add(id); store.set('visited', [...visited]); paint(); const n = visited.size; toast('⭐ Bravo! Ai explorat „' + title + '” — ' + n + ' din ' + total() + (n === total() ? '. Le-ai explorat pe toate! 🏆' : '')); }, 15000); },
    onClose: () => { clearTimeout(timer); paint(); },
    repaint: paint
  };
  window.addEventListener('DOMContentLoaded', () => {
    scan();
    const hub = $('#hub'), tag = $('.tagline', hub);
    /* bara de unelte a hub-ului */
    const bar = document.createElement('div'); bar.id = 'ux-bar';
    bar.innerHTML = '<label class="ux-search"><svg class="i" aria-hidden="true"><use href="#i-search"/></svg><input id="ux-q" type="search" placeholder="Caută: inimă, avion, vulcan, dinozauri…" aria-label="Caută o activitate" autocomplete="off"></label>' +
      '<button id="ux-resume" class="pill primary hidden" aria-label="Continuă de unde ai rămas"><svg class="i" aria-hidden="true"><use href="#i-play"/></svg>Continuă: <span></span></button>' +
      '<div id="ux-progress" aria-label="Progres"><span>⭐ Ai explorat <b></b></span><div class="pbar"><i></i></div></div>' +
      '<div class="ux-tools"><button id="ux-minus" class="icon" aria-label="Text mai mic" title="Text mai mic">A−</button><span id="ux-size-val"></span><button id="ux-plus" class="icon" aria-label="Text mai mare" title="Text mai mare">A+</button><button id="ux-install" class="pill hidden" aria-label="Instalează aplicația">Instalează</button></div>';
    tag.after(bar);
    const sv = document.createElement('div'); sv.id = 'ux-res-wrap'; sv.className = 'hidden'; sv.innerHTML = '<div class="ux-res-head"><h2 id="ux-res-title"></h2><button class="pill" id="ux-clear">Șterge căutarea</button></div><div id="ux-results" class="res-list"></div>'; $('.sec-tiles', hub).after(sv);
    $('#ux-q').addEventListener('input', (e) => search(e.target.value));
    $('#ux-clear').addEventListener('click', () => { $('#ux-q').value = ''; search(''); });
    $('#ux-resume').addEventListener('click', () => { const el = last === 'start-space' ? $('#start-space') : $('[data-module="' + last + '"]'); if (el) el.click(); });
    $('#ux-minus').addEventListener('click', () => { scale = Math.max(0.85, Math.round((scale - 0.1) * 10) / 10); store.set('uiScale', scale); applyScale(); });
    $('#ux-plus').addEventListener('click', () => { scale = Math.min(1.5, Math.round((scale + 0.1) * 10) / 10); store.set('uiScale', scale); applyScale(); });
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; $('#ux-install').classList.remove('hidden'); });
    $('#ux-install').addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch (e) { } deferred = null; $('#ux-install').classList.add('hidden'); });
    /* intrarea în modul/explorare = „ultima activitate” (și pentru Sistemul Solar) */
    const ss = $('#start-space'); if (ss) ss.addEventListener('click', () => { last = 'start-space'; store.set('lastModule', last); if (!visited.has('start-space')) { setTimeout(() => { visited.add('start-space'); store.set('visited', [...visited]); paint(); }, 15000); } });
    /* butoanele din modul au nevoie de zoom pe textul bulei/panoului */
    paint(); applyScale();
    /* mesaj de bun venit, o singură dată */
    if (!store.get('welcomed', false)) { store.set('welcomed', true); setTimeout(() => toast('Bun venit! Alege o secțiune sau caută o activitate. Primești ⭐ pentru fiecare lucru explorat.'), 900); }
  });
})();
