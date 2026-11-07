

(function () {
  'use strict';

  var CELL = 'a.imperator_tool_tip[id^="Building_"]';
  injectPopoverCSS();

  // Clic délibéré sur une cellule de bâtiment -> popover (délégation).
  document.addEventListener('click', function (e) {
    try {
      var cell = e.target.closest && e.target.closest(CELL);
      if (!cell) return;
      e.preventDefault();
      openPopover(cell);
    } catch (err) { if (window.console) console.warn('[Imperator/Relais]', err); }
  }, false);

  function parseTarget(cell) {
    var parts = String(cell.id || '').split('_');
    var level = String(cell.textContent || '').trim();
    return {
      rawId: cell.id || '',
      cityId: parts[1] || '?',
      position: parts[2] || '?',
      level: level,
      upgrading: level.indexOf('\u00bb') > -1
    };
  }

  function openPopover(cell) {
    closePopover();
    var tgt = parseTarget(cell);
    var pop = document.createElement('div');
    pop.className = 'imp-cr-pop';
    pop.innerHTML =
      '<div class="imp-cr-pt">Planifier l\u2019am\u00e9lioration</div>' +
      '<div class="imp-cr-line">Cit\u00e9 <b>' + esc(tgt.cityId) + '</b> \u00b7 emplacement <b>' + esc(tgt.position) + '</b></div>' +
      '<div class="imp-cr-line">Niveau <b>' + esc(tgt.level) + '</b>' + (tgt.upgrading ? ' <span class="imp-cr-warn">(d\u00e9j\u00e0 en cours)</span>' : '') + '</div>' +
      '<div class="imp-cr-note">Le d\u00e9tail du routage sera calcul\u00e9 dans l\u2019onglet Chantiers.</div>' +
      '<div class="imp-cr-btns"><button class="imp-cr-cancel">Annuler</button><button class="imp-cr-plan">Planifier \u2192</button></div>';
    document.body.appendChild(pop);
    positionNear(pop, cell);

    pop.querySelector('.imp-cr-plan').addEventListener('click', function () { planifier(tgt); closePopover(); });
    pop.querySelector('.imp-cr-cancel').addEventListener('click', closePopover);

    var outside = function (ev) {
      if (!pop.contains(ev.target) && !(ev.target.closest && ev.target.closest(CELL))) closePopover();
    };
    pop._outside = outside;
    setTimeout(function () { document.addEventListener('mousedown', outside, true); }, 0);
  }

  function closePopover() {
    var p = document.querySelector('.imp-cr-pop');
    if (!p) return;
    if (p._outside) document.removeEventListener('mousedown', p._outside, true);
    p.remove();
  }

  function positionNear(pop, cell) {
    try {
      var r = cell.getBoundingClientRect(), w = pop.offsetWidth || 230, h = pop.offsetHeight || 150;
      var left = Math.min(r.left, window.innerWidth - w - 10);
      var top = r.bottom + 6; if (top + h > window.innerHeight - 10) top = r.top - h - 6;
      pop.style.left = Math.max(10, left) + 'px';
      pop.style.top = Math.max(10, top) + 'px';
    } catch (e) {}
  }

  function planifier(tgt) {
    window.ImperatorChantiers = window.ImperatorChantiers || [];
    if (!window.ImperatorChantiers.some(function (c) { return c.id === tgt.rawId; })) {
      window.ImperatorChantiers.push({ id: tgt.rawId, cityId: tgt.cityId, position: tgt.position, level: tgt.level });
    }
    if (window.__impSaveChantiers) window.__impSaveChantiers();   // persistance (survit aux rechargements)
    window.ImperatorChantierEnAttente = tgt;   // contrat pour le moteur
    if (typeof window.ImperatorOpenChantiers === 'function') window.ImperatorOpenChantiers();
    else if (window.__impChantiersRedraw) window.__impChantiersRedraw();
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function injectPopoverCSS() {
    if (document.getElementById('imp-cr-css')) return;
    var css =
      '.imp-cr-pop{position:fixed;z-index:99999;width:230px;font-family:sans-serif;background:#FCF5E1;border:1.5px solid #8A6D39;border-radius:8px;box-shadow:0 4px 14px rgba(90,62,27,.28);padding:11px 12px;color:#5A3E1B}' +
      '.imp-cr-pt{font-size:13px;font-weight:600;margin-bottom:6px}' +
      '.imp-cr-line{font-size:12px;margin:2px 0}.imp-cr-warn{color:#A34E1D}' +
      '.imp-cr-note{font-size:11px;color:#8A6D39;margin:8px 0 9px;line-height:1.4}' +
      '.imp-cr-btns{display:flex;gap:8px}' +
      '.imp-cr-btns button{flex:1;font-size:12px;padding:6px;border-radius:5px;cursor:pointer}' +
      '.imp-cr-cancel{background:#EFDEB2;border:1px solid #B4914E;color:#8A6D39}' +
      '.imp-cr-plan{background:#D8B871;border:1px solid #8A6D39;color:#5A3E1B;font-weight:600}';
    var st = document.createElement('style'); st.id = 'imp-cr-css'; st.textContent = css; document.head.appendChild(st);
  }
})();


