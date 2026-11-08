

// --- Wrapper auto de updateAndStartTracking ---
(function waitForEmpireDataWrapper() {
    try {
        if (window.IkaTools &&
            IkaTools.EmpireData &&
            typeof IkaTools.EmpireData.updateAndStartTracking === 'function' &&
            !IkaTools.EmpireData.__imperatorWrapped) {

            var orig = IkaTools.EmpireData.updateAndStartTracking;

            IkaTools.EmpireData.updateAndStartTracking = function() {
                try {
                    return orig.apply(this, arguments);
                } catch (e) {
                    console.warn('Imperator wrapper: updateAndStartTracking a échoué :', e);
                }
            };

            IkaTools.EmpireData.__imperatorWrapped = true;
            return;
        }
    } catch (e) {
        console.warn('Imperator wrapper: erreur dans waitForEmpireDataWrapper', e);
    }

    // Si on n’a pas encore accès à la fonction, on réessaie dans 500 ms
    setTimeout(waitForEmpireDataWrapper, 500);
})();
// --- Fin wrapper updateAndStartTracking ---

$.extend(String.prototype, {
    format: function() {
        var pattern = /%s/g

        return function format() {
            var args = arguments;
            var itemIndex = 0;
            var str = this.replace(pattern, function replacer(match, key) {
                return args[itemIndex++];
            });
            return str;
        }
    }(),
    format2: function() {
        var pattern = /%{([a-zA-Z_0-9]+)}/g

        return function format2(args) {
            var str = this.replace(pattern, function replacer(match, key) {
                return args[key];
            });
            return str;
        }
    }(),
});

