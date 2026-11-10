// v3.5 : badge dans le titre de l'onglet du navigateur, « (2) Ikariam … », quand des labos
// d'académie sont redevenus disponibles (4 h après une expérience) et que la ville a assez
// de cristal pour une nouvelle expérience. Le compte baisse dès que l'académie est revisitée.

(function installExperienceBadge() {
  'use strict';

  var SCROLL_COST = 240000; // cristal minimal (avec le parchemin d'Athéna)

  function ready() {
    return typeof IkaTools !== 'undefined' && IkaTools.EmpireData &&
           IkaTools.EmpireData.getOwnCities && IkaTools.Constants && IkaTools.Constants.Resources;
  }

  function countReadyAgain() {
    var n = 0, now = Date.now();
    $.each(IkaTools.EmpireData.getOwnCities(), function (i, city) {
      if (!city || !city.getExperimentReadyAt) return;
      var readyAt = city.getExperimentReadyAt();
      if (!readyAt || readyAt > now || city.isExperimentAcknowledged()) return;
      var glass = city.getResource(IkaTools.Constants.Resources.GLASS);
      var crystal = glass && glass.getCurrent ? Number(glass.getCurrent()) || 0 : 0;
      if (crystal >= SCROLL_COST) n++;
    });
    return n;
  }

  function update() {
    var n = 0;
    try { n = countReadyAgain(); } catch (e) { n = 0; }
    var title = document.title.replace(/^\(\d+\) /, '');
    var wanted = n ? '(' + n + ') ' + title : title;
    if (document.title !== wanted) document.title = wanted;
  }

  var tries = 0, wait = setInterval(function () {
    tries++;
    if (ready()) {
      clearInterval(wait);
      update();
      setInterval(update, 15000);
    } else if (tries > 100) {
      clearInterval(wait);
    }
  }, 200);
})();
