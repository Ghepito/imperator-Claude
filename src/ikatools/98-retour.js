
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
