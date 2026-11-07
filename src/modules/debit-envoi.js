     ////////////
     // BLOC 2 //
     ////////////
(function installDebitOnSend() {
  'use strict';

  function ready() {
    return typeof IkaTools !== 'undefined' &&
           IkaTools.View && IkaTools.View.registerAjaxFormSubmitCallback &&
           IkaTools.View.registerNextIkariamAjaxRequestCallback &&
           IkaTools.Constants && IkaTools.Constants.Resources &&
           IkaTools.Utils && IkaTools.Utils.iterateIkariamAjaxResponse;
  }

  function resourceKeys() {
    var R = IkaTools.Constants.Resources;
    return [R.WOOD, R.WINE, R.MARBLE, R.GLASS, R.SULFUR];
  }

  function readCargo() {
    var R = IkaTools.Constants.Resources, c = {};
    c[R.WOOD]   = parseInt($('#textfield_wood').val())   || 0;
    c[R.WINE]   = parseInt($('#textfield_wine').val())   || 0;
    c[R.MARBLE] = parseInt($('#textfield_marble').val()) || 0;
    c[R.GLASS]  = parseInt($('#textfield_glass').val())  || 0;
    c[R.SULFUR] = parseInt($('#textfield_sulfur').val()) || 0;
    if ($('#createColony').length) { c[R.WOOD] += 1250; } // navire de colonie (comme le jeu)
    return c;
  }

  function install() {
    if (!ready()) return false;

    IkaTools.View.registerAjaxFormSubmitCallback(function onTransportSubmit(form) {
      try {
        // Le jeu route les transports sur ces id de formulaire (cf. dispatcher).
        if (!form || (form.id !== 'transport' && form.id !== 'transportForm')) return;

        var origin = IkaTools.View.getCurrentCity(); // un transport part TOUJOURS de la ville active
        if (!origin || !origin._incrementResource) return;

        var cargo = readCargo();
        var keys = resourceKeys();
        var total = 0;
        keys.forEach(function (k) { total += (cargo[k] || 0); });
        if (total <= 0) return;

        // Capture des stocks AVANT envoi (pour la garde anti-double-débit).
        var before = {};
        keys.forEach(function (k) {
          try { var r = origin.getResource(k); before[k] = (r && r.getCurrent) ? r.getCurrent() : null; }
          catch (e) { before[k] = null; }
        });

        // On ne débite QUE si le serveur confirme le succès (comme le jeu pour créer le mouvement).
        IkaTools.View.registerNextIkariamAjaxRequestCallback(function onTransportResponse(response) {
          try {
            var success = false;
            IkaTools.Utils.iterateIkariamAjaxResponse(response, function (index, name, data) {
              if (name === IkaTools.Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                  data && data[0] && data[0].type == 10) {
                success = true;
              }
            });
            if (!success) return;

            var changes = [];
            keys.forEach(function (k) {
              if (!cargo[k] || cargo[k] <= 0) return;
              // Garde : si le jeu a DÉJÀ débité l'origine (stock déjà retombé), on ne re-débite pas.
              try {
                var r = origin.getResource(k);
                var nowVal = (r && r.getCurrent) ? r.getCurrent() : null;
                if (before[k] != null && nowVal != null && (before[k] - nowVal) >= cargo[k] * 0.5) {
                  return; // déjà pris en compte ailleurs -> on saute (anti-double-débit)
                }
              } catch (e) {}
              origin._incrementResource(k, changes, -cargo[k]); // débit symétrique de l'arrivée
            });

            if (changes.length && IkaTools.EmpireData && IkaTools.EmpireData.raiseResourcesChanged) {
              IkaTools.EmpireData.raiseResourcesChanged(changes); // -> l'onglet Ressources se rafraîchit
            }
          } catch (e) { if (window.console) console.warn('[Imperator/DebitEnvoi] réponse:', e); }
        });
      } catch (e) { if (window.console) console.warn('[Imperator/DebitEnvoi] soumission:', e); }
    });

    return true;
  }

  if (install()) return;
  var tries = 0;
  var timer = setInterval(function () { tries++; if (install() || tries > 100) clearInterval(timer); }, 100);
})();

// fin BLOC //

