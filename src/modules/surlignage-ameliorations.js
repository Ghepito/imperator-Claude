// fonction couleur si bâtiment ok //

(function installUpgradeHighlight() {
  'use strict';

  var TABLE_ID = 'ImperatorOverviewBuildingsTable';
  var CELL_SEL = 'a.imperator_tool_tip[id^="Building_"]';

  injectCSS();

  function ready() {
    return typeof IkaTools !== 'undefined' &&
           IkaTools.EmpireData && IkaTools.EmpireData.getCity &&
           IkaTools.Constants && IkaTools.Constants.Resources;
  }

  function findCity(cityId) {
    try {
      return IkaTools.EmpireData.getCity(cityId) ||
             IkaTools.EmpireData.getCity(parseInt(cityId, 10)) || null;
    } catch (e) { return null; }
  }

  function isLaunchable(cell) {
    try {
      var parts = String(cell.id || '').split('_');
      var city = findCity(parts[1]);
      if (!city || !city.getBuildingByPosition) return false;
      var b = city.getBuildingByPosition(parseInt(parts[2], 10));
      if (!b) return false;
      if (b.isEmpty && b.isEmpty()) return false;        // emplacement vide
      if (b.isUpgrading && b.isUpgrading()) return false; // déjà en cours
      if (b.isMaxLevel && b.isMaxLevel()) return false;   // niveau max
      var costs = b.getUpgradeCosts && b.getUpgradeCosts();
      if (!costs) return false;
      var R = IkaTools.Constants.Resources, keys = [R.WOOD, R.WINE, R.MARBLE, R.GLASS, R.SULFUR];
      var anyCost = false; // v2.20 : coût inconnu (tout à 0) -> jamais vert
      for (var i = 0; i < keys.length; i++) {
        var need = Math.ceil(costs[keys[i]] || 0);
        if (need <= 0) continue;
        anyCost = true;
        var stock = 0;
        try { var rr = city.getResource(keys[i]); stock = (rr && rr.getCurrent) ? rr.getCurrent() : 0; } catch (e) {}
        if (stock < need) return false; // pas assez -> pas vert
      }
      return anyCost;
    } catch (e) { return false; }
  }

  // v2.35 : recalcul complet seulement à l'ouverture de l'onglet, après un changement
  // (ressources, bâtiments) ou toutes les 10 s pour suivre la production.
  var lastRun = 0, wasVisible = false, dirty = true;
  function markDirty() { dirty = true; setTimeout(decorate, 0); }
  function decorate() {
    try {
      if (document.hidden) { wasVisible = false; return; }
      var table = document.getElementById(TABLE_ID);
      if (!table || table.offsetParent === null) { wasVisible = false; return; } // onglet Bâtiments fermé
      var now = Date.now();
      if (wasVisible && !dirty && now - lastRun < 10000) return;
      wasVisible = true; dirty = false; lastRun = now;
      var cells = table.querySelectorAll(CELL_SEL);
      for (var i = 0; i < cells.length; i++) {
        if (isLaunchable(cells[i])) cells[i].classList.add('imp-up-ok');
        else cells[i].classList.remove('imp-up-ok');
      }
    } catch (e) {}
  }

  function start() {
    if (!ready()) return false;
    // Feedback immédiat quand ressources / bâtiments changent (arrivée, envoi, fin d'upgrade…)
    try { IkaTools.EmpireData.registerResourcesChangedHandler(markDirty); } catch (e) {}
    try { IkaTools.EmpireData.registerBuildingsChangedHandler(markDirty); } catch (e) {}
    // Filet : couvre l'ouverture de l'aperçu et les changements d'onglet (ne coûte rien si non visible).
    setInterval(decorate, 1200);
    decorate();
    return true;
  }

  function injectCSS() {
    if (document.getElementById('imp-up-css')) return;
    var css =
      'a.imperator_tool_tip.imp-up-ok{' +
        'background:#DCE8C2 !important;' +
        'color:#2E6B1E !important;' +
        'font-weight:700 !important;' +
        'border-radius:4px !important;' +
        'box-shadow:inset 0 0 0 1px #7FA857 !important;' +
      '}';
    var st = document.createElement('style'); st.id = 'imp-up-css'; st.textContent = css; document.head.appendChild(st);
  }

  if (start()) return;
  var n = 0, t = setInterval(function () { n++; if (start() || n > 100) clearInterval(t); }, 100);
})();



