    // v2.41 : rafraîchissement en arrière-plan, installé par init() (initialisation.js)
    var backgroundRefresh = null;

    var settings = new IkaTools.Settings.Settings('ImperatorSettings');

    var localizedLanguage = settings.choice(
        'language',
        '',
        {
            'Automatique': '',
            'Français': 'fr',
            'English': 'en',
        },
        localizer.delayedLocalize('settings','language'));

    var showResourceOverview = settings.boolean(
        'show_resource_overview',
        true,
        localizer.delayedLocalize('misc','resource_overview'));
    var showBuildingsOverview = settings.boolean(
        'show_buildings_overview',
        true,
        localizer.delayedLocalize('misc','buildings_overview'));
    var showMilitaryOverview = settings.boolean(
        'show_military_overview',
        true,
        localizer.delayedLocalize('misc','military_overview'));
    var showEspionageOverview = settings.boolean(
        'show_espionage_overview',
        true,
        localizer.delayedLocalize('misc','espionage_overview'));


    var autoAcceptDailyBonus = settings.boolean(
        'auto_accept_daily_bonus',
        true,
        localizer.delayedLocalize('settings','auto_accept_daily_bonus'));
    var hideAds = settings.boolean(
        'hide_ads',
        true,
        localizer.delayedLocalize('settings','hide_ads'));
    var hideFacebook = settings.boolean(
        'hide_facebook',
        true,
        localizer.delayedLocalize('settings','hide_facebook'));
    var hideFriendsBar = settings.boolean(
        'hide_friends_bar',
        false,
        localizer.delayedLocalize('settings','hide_friends_bar'));
    var hideChat = settings.boolean(
        'hide_chat',
        false,
        localizer.delayedLocalize('settings','hide_chat'));
    var transportButtons = settings.boolean(
        'transport_buttons',
        true,
        localizer.delayedLocalize('settings','transport_buttons'));
    var donationButtons = settings.boolean(
        'donation_buttons',
        true,
        localizer.delayedLocalize('settings','donation_buttons'));
    var showCityOwners = settings.boolean(
        'show_city_owners',
        false,
        localizer.delayedLocalize('settings', 'show_city_owners'));
    var preventAccidentalColonyDestruction = settings.boolean(
        'prevent_accidental_colony_destruction',
        true,
        localizer.delayedLocalize('settings', 'prevent_accidental_colony_destruction'));
    var initializeColonizationMissionsForPirateRaiding = settings.boolean(
        'initialize_colonization_missions_for_pirate_raiding',
        false,
        localizer.delayedLocalize('settings', 'initialize_colonization_missions_for_pirate_raiding'));

    // v2.12 : seuil de l'état « bientôt fini » des bénédictions divines
    var blessSoonThreshold = settings.choice(
        'bless_soon_threshold_hours',
        '12',
        { '6 h': '6', '12 h': '12', '24 h': '24', '48 h': '48' },
        IkaTools.Utils.fixedFunction('Bénédictions divines : alerte « bientôt fini »'));

    // ============================================================
    // v2.20 : notifications de bureau via GM_notification (Tampermonkey)
    // remplace l ancienne API webkit, retirée des navigateurs.
    // ============================================================
    function impAsset(path) {
        if (!path) return undefined;
        return location.origin + (String(path).charAt(0) === '/' ? '' : '/') + path;
    }
    function impBeep(times) {
        try {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            var ctx = impBeep._ctx || (impBeep._ctx = new Ctx());
            if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
            var t0 = ctx.currentTime;
            for (var i = 0; i < (times || 3); i++) {
                var o = ctx.createOscillator(), g = ctx.createGain(), t = t0 + i * 0.5;
                o.type = 'square';
                o.frequency.value = 880;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
                o.connect(g); g.connect(ctx.destination);
                o.start(t); o.stop(t + 0.4);
            }
        } catch (e) {}
    }
    function impNotify(opts) {
        opts = opts || {};
        if (typeof GM_notification !== 'function') {
            console.warn('[Imperator] GM_notification indisponible (grant manquant ?)');
            if (!opts.test) impAlertHistoryAdd(opts.title || 'Imperator', opts.text, false); // v3.1
            return false;
        }
        try {
            var d = {
                title: opts.title || 'Imperator',
                text: opts.text || ' ',
                silent: !!opts.sound,
                onclick: function() { try { window.focus(); } catch (e) {} },
            };
            if (opts.image) d.image = opts.image;
            if (!opts.sticky) d.timeout = 15000;
            GM_notification(d);
            if (opts.sound) impBeep(3);
            console.log('[Imperator] Notification :', d.title, '-', d.text);
            if (!opts.test) impAlertHistoryAdd(d.title, d.text, true); // v3.1
            return true;
        } catch (e) {
            console.warn('[Imperator] Notification échouée', e);
            if (!opts.test) impAlertHistoryAdd(opts.title || 'Imperator', opts.text, false); // v3.1
            return false;
        }
    }

    var testDesktopAlert = settings.html(
        function desktopAlertHtml() {
            return '<a id="DesktopAlertTest" class="button">%s</a>'.format(
                localizer.localize('settings','do_test'));
        },
        function desktopAlertPostRender() {
            // v2.20 : test via GM_notification (+ son)
            $('#DesktopAlertTest').click(IkaTools.Logging.debuggable(
                'Imperator.testDesktopAlert',
                function testDesktopAlert() {
                    var ok = impNotify({
                        title: localizer.localize('settings','test_desktop_alert_title'),
                        text: localizer.localize('settings','test_desktop_alert_text'),
                        sound: true,
                        test: true,   // v3.1 : le test n'entre pas dans l'historique
                    });
                    if (!ok) alert(localizer.localize('settings','desktop_alerts_not_supported'));
                }));
        },
        localizer.delayedLocalize('settings','test_desktop_alert'));

    var buildingCompletionAlert_Desktop = settings.boolean(
        'building_completion_alert_desktop',
        false,
        localizer.delayedLocalize('settings','building_completion_alert_desktop'));
    var transportMissionLoaded_Desktop = settings.boolean(
        'transport_loaded_alert_desktop',
        false,
        localizer.delayedLocalize('settings','transport_loaded_alert_desktop'));
    var transportMissionArrived_Desktop = settings.boolean(
        'transport_arrived_alert_desktop',
        false,
        localizer.delayedLocalize('settings','transport_arrived_alert_desktop'));
    var transportMissionReturned_Desktop = settings.boolean(
        'transport_returned_alert_desktop',
        false,
        localizer.delayedLocalize('settings','transport_returned_alert_desktop'));
    var deployArmyLoaded_Desktop = settings.boolean(
        'deploy_army_loaded_alert_desktop',
        false,
        localizer.delayedLocalize('settings','deploy_army_loaded_alert_desktop'));
    var deployArmyArrived_Desktop = settings.boolean(
        'deploy_army_arrived_alert_desktop',
        false,
        localizer.delayedLocalize('settings','deploy_army_arrived_alert_desktop'));
    var deployArmyReturned_Desktop = settings.boolean(
        'deploy_army_returned_alert_desktop',
        false,
        localizer.delayedLocalize('settings','deploy_army_returned_alert_desktop'));
    var deployNavyArrived_Desktop = settings.boolean(
        'deploy_navy_arrived_alert_desktop',
        false,
        localizer.delayedLocalize('settings','deploy_navy_arrived_alert_desktop'));
    var deployNavyReturned_Desktop = settings.boolean(
        'deploy_navy_returned_alert_desktop',
        false,
        localizer.delayedLocalize('settings','deploy_navy_returned_alert_desktop'));
    var pillageLoaded_Desktop = settings.boolean(
        'pillage_loaded_alert_desktop',
        false,
        localizer.delayedLocalize('settings','pillage_loaded_alert_desktop'));
    var pillageArrived_Desktop = settings.boolean(
        'pillage_arrived_alert_desktop',
        false,
        localizer.delayedLocalize('settings','pillage_arrived_alert_desktop'));
    var pillageReturned_Desktop = settings.boolean(
        'pillage_returned_alert_desktop',
        false,
        localizer.delayedLocalize('settings','pillage_returned_alert_desktop'));
    var ignoredHostileMissions = settings.text(
        'ignored_hostile_missions',
        '[]',
        localizer.delayedLocalize('settings', 'ignored_hostile_missions'));


    var debugSetting = settings.html(
        function debugHtml() {
            return '<input id="EmpireDataDebug" type="text" style="width:100%"/>';
        },
        function debugPostRender() {
            $('#EmpireDataDebug').val(IkaTools.EmpireData.getDebugString());
        },
        IkaTools.Utils.fixedFunction('Empire data'));
    var resetData = settings.html(
        function resetDataHtml() {
            return '<a id="ResetImperatorData" class="button">Reset</a>';
        },
        function resetDataPostRender() {
            $('#ResetImperatorData').click(function resetDataClicked() {
                IkaTools.EmpireData.resetData();
                window.location.reload();
            });
        },
        IkaTools.Utils.fixedFunction('Reset data'));
    var espionageDebugSetting = settings.html(
        function debugHtml() {
            return '<input id="EspionageDataDebug" type="text" style="width:100%"/>';
        },
        function debugPostRender() {
            $('#EspionageDataDebug').val(IkaTools.EmpireData.Espionage.getDebugString());
        },
        IkaTools.Utils.fixedFunction('Espionage data'));
    var resetEspionageData = settings.html(
        function resetDataHtml() {
            return '<a id="ResetEspionageData" class="button">Reset Espionage</a>';
        },
        function resetDataPostRender() {
            $('#ResetEspionageData').click(function resetDataClicked() {
                IkaTools.EmpireData.Espionage.resetData();
                window.location.reload();
            });
        },
        IkaTools.Utils.fixedFunction('Reset espionage data'));
    var exceptionLogSetting = settings.html(
        function exceptionLogHtml() {
            return '<input id="ExceptionLog" type="text" style="width:100%"/>';
        },
        function exceptionLogPostRender() {
            $('#ExceptionLog').val(JSON.stringify(IkaTools.Logging.getExceptionLog()));
        },
        IkaTools.Utils.fixedFunction('Errors'));


    // v2.23 : liste des vues capturées, avec téléchargement
    var viewCaptureSetting = settings.html(
        function viewCaptureHtml() {
            return '<div id="ImperatorCaptures"></div>';
        },
        function viewCapturePostRender() {
            if (typeof window.__impRenderCaptures === 'function') {
                window.__impRenderCaptures($('#ImperatorCaptures'));
            }
        },
        IkaTools.Utils.fixedFunction('Captures de vues'));

    // v2.36 : export des données d'Imperator (banc d'affichage hors jeu). Rien n'est envoyé :
    // un fichier est téléchargé sur l'ordinateur.
    var dataExportSetting = settings.html(
        function dataExportHtml() {
            return '<a id="ImperatorDataExport" class="button">Exporter mes données</a>' +
                   '<span id="ImperatorDataExportStatus" style="margin-left:8px;font-size:11px;"></span>';
        },
        function dataExportPostRender() {
            $('#ImperatorDataExport').click(function() {
                try {
                    var values = {}, n = 0, size = 0;
                    $.each(IkaTools.Data.listValues(), function(i, v) {
                        try { if (v.needsSave) v.doSave(true); } catch (e) {}
                        var raw = GM_getValue(v.key);
                        if (raw === undefined || raw === null) return;
                        values[v.key] = raw;
                        n++; size += String(raw).length;
                    });
                    var file = JSON.stringify({
                        format: 'imperator-export',
                        imperator: (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.version : '?',
                        date: new Date().toISOString(),
                        domain: IkaTools.View.getDomain(),
                        values: values,
                    }, null, 1);
                    var d = new Date(), p = function(x) { return (x < 10 ? '0' : '') + x; };
                    var name = 'imperator_donnees_' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
                               '_' + p(d.getHours()) + 'h' + p(d.getMinutes()) + '.json';
                    var url = URL.createObjectURL(new Blob([file], { type: 'application/json;charset=utf-8' }));
                    var a = document.createElement('a');
                    a.href = url; a.download = name;
                    document.body.appendChild(a); a.click();
                    setTimeout(function() { try { URL.revokeObjectURL(url); a.remove(); } catch (e) {} }, 1000);
                    $('#ImperatorDataExportStatus').text(n + ' jeux de données, ' + Math.round(size / 1024) + ' ko');
                    console.log('[Imperator] Données exportées : ' + name + ' (' + n + ' jeux, ' + Math.round(size / 1024) + ' ko)');
                } catch (e) {
                    $('#ImperatorDataExportStatus').text('échec : ' + e);
                }
            });
        },
        IkaTools.Utils.fixedFunction('Exporter mes données'));

    var refreshDataSetting = settings.html(
        function refreshDataHtml() {
            return '<a id="ImperatorRefreshData" class="button">Mettre à jour</a>' +
                   '<span id="ImperatorRefreshStatus" style="margin-left:8px;font-size:11px;"></span>';
        },
        function refreshDataPostRender() {
            $('#ImperatorRefreshData').click(function() {
                var btn = $('#ImperatorRefreshData');
                var status = $('#ImperatorRefreshStatus');
                btn.css('opacity', '0.5').off('click');
                backgroundRefresh.runRefresh(
                    function(i, total, name) {
                        status.text(i + '/' + total + ' — ' + name);
                    },
                    function(total) {
                        var now = new Date();
                        var hhmm = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
                        status.text('MAJ terminée à ' + hhmm);
                        btn.css('opacity', '1');
                    }
                );
            });
        },
        IkaTools.Utils.fixedFunction('Mise à jour des données'));
