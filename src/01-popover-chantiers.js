

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
    dockWhenWindowOpens(pop);   // v2.42 : rejoint le haut de la fenêtre du bâtiment

    // v2.43 : les clics dans le popup ne vont jamais au jeu
    ['mousedown', 'mouseup', 'click'].forEach(function (t) {
      pop.addEventListener(t, function (ev) { ev.stopPropagation(); }, false);
    });
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
    if (p._observer) p._observer.disconnect();
    if (p._follow) clearInterval(p._follow);
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

  // v2.42 : le clic ouvre aussi la fenêtre du bâtiment (chargée par le jeu juste après).
  // Dès qu'elle apparaît, le popup passe en bandeau compact à son sommet, sur l'image
  // décorative sous la barre de titre : il suit la fenêtre et ne cache pas ses données.
  function dockWhenWindowOpens(pop) {
    if (typeof MutationObserver !== 'function') return;
    var found = function (node) {
      if (!node || node.nodeType !== 1) return null;
      var box = node.matches && node.matches('.mainContentBox') ? node :
        (node.querySelector && node.querySelector('.mainContentBox'));
      return box && box.querySelector('.mainHeader') ? box : null;
    };
    var obs = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var box = found(added[j]);
          if (box) { obs.disconnect(); pop._observer = null; dockInto(pop, box); return; }
        }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    pop._observer = obs;
    setTimeout(function () { obs.disconnect(); }, 5000);
  }

  // v2.43 : le bandeau reste dans <body>, au-dessus de tout (et non dans la fenêtre du jeu,
  // où l'image publicitaire et les gestionnaires du jeu attrapaient le clic). Il suit la
  // fenêtre par sa position à l'écran, recalculée tant qu'il est ouvert.
  function dockInto(pop, box) {
    try {
      if (!pop.parentNode) return;   // déjà fermé
      pop.classList.add('imp-cr-dock');
      var place = function () {
        if (!pop.parentNode) { clearInterval(pop._follow); return; }
        if (!box.isConnected) return;   // fenêtre fermée : le bandeau reste où il est
        var header = box.querySelector('.mainHeader');
        var r = box.getBoundingClientRect(), hr = header ? header.getBoundingClientRect() : r;
        var banner = box.querySelector('.mainContent > .center img');
        var w = Math.min(r.width - 24, 560);
        if (banner && banner.offsetWidth > 300) w = Math.min(w, banner.offsetWidth);
        pop.style.width = w + 'px';
        pop.style.left = Math.round(r.left + (r.width - w) / 2) + 'px';
        pop.style.top = Math.round(hr.bottom + 4) + 'px';
      };
      place();
      pop._follow = setInterval(place, 250);
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
      '.imp-cr-plan{background:#D8B871;border:1px solid #8A6D39;color:#5A3E1B;font-weight:600}' +
      // v2.42 : bandeau compact au sommet de la fenêtre du bâtiment
      '.imp-cr-pop.imp-cr-dock{position:fixed;box-sizing:border-box;padding:6px 10px;display:grid;' +
      'grid-template-columns:auto auto 1fr 190px;column-gap:14px;row-gap:2px;align-items:center;text-align:left}' +
      '.imp-cr-dock .imp-cr-pt{grid-column:1 / span 2;grid-row:1;margin:0}' +
      '.imp-cr-dock .imp-cr-line{grid-row:2;margin:0;white-space:nowrap}' +
      '.imp-cr-dock .imp-cr-line:nth-of-type(2){grid-column:1}.imp-cr-dock .imp-cr-line:nth-of-type(3){grid-column:2}' +
      '.imp-cr-dock .imp-cr-note{display:none}' +
      '.imp-cr-dock .imp-cr-btns{grid-column:4;grid-row:1 / span 2}';
    var st = document.createElement('style'); st.id = 'imp-cr-css'; st.textContent = css; document.head.appendChild(st);
  }
})();


