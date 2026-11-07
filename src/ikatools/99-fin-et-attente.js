
        function processAnchor() {
    var anchor = window.location.hash;
    if (anchor == '#ikaScriptToolsSuppressCityPreselect') {
        document.location.hash = '';
        View.suppressFirstChangeViewOfType('cityDetails');
    }
    if (anchor.substring(0, 35) == '#ikaScriptToolsLoadLocalIkariamUrl=') {
        var url = decodeURIComponent(anchor.substring(35));
        document.location.hash = '';
        View.suppressFirstChangeViewOfType('cityDetails'); // ← AVANT, inconditionnel
        IkaTools.View.loadLocalIkariamUrl(url);
    } else if (anchor.substring(0, 62) ==
               '#ikaScriptToolsLoadLocalIkariamUrl_DoNotSuppressFirstCityInfo=') {
        url = decodeURIComponent(anchor.substring(62));
        document.location.hash = '';
        IkaTools.View.loadLocalIkariamUrl(url);
    }
}

        function initialize(options) {
            processAnchor();
            $(window).bind('hashchange', processAnchor);
            options = $.extend({ trackData: true }, options);
            View.setGameTimeDifference(new Date().getTime() -
                                       unsafeWindow.ikariam.model.requestTime * Constants.Time.MILLIS_PER_SECOND -
                                       Constants.Time.INITIAL_PAGE_LOAD_DELTA);
            if (options.trackData) {
                IkaTools.EmpireData.updateAndStartTracking();
            }
        }

        return {
            Logging: Logging,
            Utils: Utils,
            View: View,
            Data: Data,
            Intl: Intl,
            EmpireData: EmpireData,
            Constants: Constants,
            UI: UI,
            Settings: Settings,

            initialize: initialize,
            processAnchor: processAnchor,
        };
    })();
}


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

