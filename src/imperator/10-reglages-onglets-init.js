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
            return true;
        } catch (e) {
            console.warn('[Imperator] Notification échouée', e);
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


    function addSettingsLink() {
        var settingsWindow = new IkaTools.UI.SettingsWindow(
            'ImperatorSettings',
            'Ikariam Imperator',
            settings,
            [new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','general'),
                                                  [localizedLanguage]),
             new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','overviews'),
                                                  [showResourceOverview, showBuildingsOverview, showMilitaryOverview,
                                                   showEspionageOverview, blessSoonThreshold]),
             new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','tweaks'),
                                                  [autoAcceptDailyBonus, hideAds, hideFacebook, hideFriendsBar, hideChat,
                                                   transportButtons, donationButtons, showCityOwners,
                                                   preventAccidentalColonyDestruction, initializeColonizationMissionsForPirateRaiding
                                                  ]),
             new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','alerts'),
                                                  [testDesktopAlert, buildingCompletionAlert_Desktop,
                                                   transportMissionLoaded_Desktop, transportMissionArrived_Desktop,
                                                   transportMissionReturned_Desktop, deployArmyLoaded_Desktop,
                                                   deployArmyArrived_Desktop, deployArmyReturned_Desktop,
                                                   deployNavyArrived_Desktop, deployNavyReturned_Desktop,
                                                   pillageLoaded_Desktop, pillageArrived_Desktop, pillageReturned_Desktop,
                                                   /*ignoredHostileMissions*/]),
             new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','debug'),
                                                  [debugSetting, resetData, espionageDebugSetting, resetEspionageData,
                                                   exceptionLogSetting, refreshDataSetting, viewCaptureSetting]),
            ]);
        settingsWindow.registerSavedSettingsHandler(function reloadOnSavedSettings() {
            window.location.reload();
        });
        settingsWindow.addAsScriptOptionsLink();
    }

    function Updateable(container, permanent, ids) {
        this.container = container;
        this.ids = $.makeArray(ids);
        this.elements = [];
        if (!this.ids.length) {
            this.ids[0] = IkaTools.Utils.nextId("updateable_");
        }
        this.permanent = permanent;
        this.events = {};
    }

    $.extend(Updateable.prototype, {
        getElement: function getElement(index) {
            var element = this.elements[index];
            if (!element || !element.length) {
                element = $(document.getElementById(this.ids[index]));
                this.elements[index] = element;
            }
            return element;
        },
        getElements: function getElements() {
            for (var i = 0; i < this.ids.length; i++) {
                this.getElement(i);
            }
            return this.elements;
        },
        destroy: function destroy() {
            return this.container.destroy(this);
        },
        getId: function getId(index) {
            return this.ids[index];
        },
        getIdentifier: function getIdentifier() {
            return this.ids.join(',');
        },
        isPermanent: function isPermanent() {
            return this.permanent;
        },
        registerUpdate: function registerUpdate(eventName, f) {
            this.events[eventName] = f;
            return this;
        },
        updateForEvent: function updateForEvent(eventName) {
            var f = this.events[eventName];
            if (f) {
                f.apply(this, this.getElements());
            }
        },
        registerTickerUpdate: function registerTickerUpdate(f) {
            return this.registerUpdate('ticker', f);
        },
        registerFastTickerUpdate: function registerFastTickerUpdate(f) {
            return this.registerUpdate('fastTicker', f);
        },
    });

    function Updateables(name) {
        this.name = name;
        this.active = false;
        this.undispatchedEvents = {};
        this.updateables = {};
    }

    $.extend(Updateables.prototype, {
        create: function create() {
            var updateable = new Updateable(this, false, arguments);
            this.updateables[updateable.getIdentifier()] = updateable;
            return updateable;
        },
        createPermanent: function createPermanent() {
            var updateable = new Updateable(this, true, arguments)
            this.updateables[updateable.getIdentifier()] = updateable;
            return updateable;
        },
        destroy: function destroy(updateable) {
            delete this.updateables[updateable.getIdentifier()];
        },


        activate: function activate() {
            $.each(this.updateables, function (key, updateable) {
                updateable.getElements();
            });
            if (!this.tickerEvent) {
                this.tickerEvent = setInterval(IkaTools.Logging.debuggable(
                    { label: 'Imperator.Updateable.tickerUpdate[' +  this.name + ']', },
                    this.updateForEvent.bind(this, 'ticker')),
                                               4000);
            }
            if (!this.fastTickerEvent) {
                this.fastTickerEvent = setInterval(IkaTools.Logging.debuggable(
                    {label: 'Imperator.Updateable.fastTickerUpdate[' +  this.name + ']', },
                    this.updateForEvent.bind(this, 'fastTicker')),
                                                   1000);
            }
            this.active = true;
            this.updateForEvent('ticker');  // ← PATCH : premier passage immédiat
            $.each(this.undispatchedEvents, this.updateForEvent.bind(this));
            this.undispatchedEvents = {};
        },


        deactivate: function deactivate() {
            this.active = false;
            if (this.tickerEvent) {
                clearInterval(this.tickerEvent);
                delete this.tickerEvent;
            }
            if (this.fastTickerEvent) {
                clearInterval(this.fastTickerEvent);
                delete this.fastTickerEvent;
            }
        },
        updateForEvent: function updateForEvent(eventName) {
            if (this.active) {
                $.each(this.updateables, function(id, updateable) {
                    updateable.updateForEvent(eventName);
                });
            } else {
                this.undispatchedEvents[eventName] = true;
            }
        },
        clear: function clear() {
            var that = this;
            $.each(this.updateables, function(id, updateable) {
                if (!updateable.isPermanent()) {
                    delete that.updateables[id];
                }
            });
            this.undispatchedEvents = {};
        },
    });

    var clickHandler = function() {
        var idToHandlerMap = {};

        return {
            register: function register(id, f) {
                idToHandlerMap[id] = f;
            },
            dispatch: function(element) {
                var handler = idToHandlerMap[element.id];
                if (handler) {
                    handler();
                    return true;
                } else {
                    IkaTools.Logging.debug("No registered handler for ", element.id, element);
                    return false;
                }
            },
        }
    }();

    $('#container').on('click.imperator_link_handler', '.imperator_link',
                       IkaTools.Logging.debuggable('Imperator.overview.imperator_link.clicked',
                                                   function(e) {
        if (clickHandler.dispatch(e.currentTarget)) {
            e.preventDefault();
        }
    }));

    function Link(id) {
        this.id = id;
    }

    $.extend(Link.prototype, {
        getId: function getId() {
            return this.id;
        },
        toFunction: function toFunction(f, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate()) {
                    f();
                }
            });
            return this;
        },
        toCitysIslandView: function toCitysIslandView(city, view, params, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate()) {
                    IkaTools.View.goToCitysIslandView(city, view, params);
                }
            });
            return this;
        },
        toLocalView: function toLocalView(view, params, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate()) {
                    IkaTools.View.goToLocalView(view, params);
                }
            });
            return this;
        },
        toCityView: function toCityView(city, view, params, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate()) {
                    IkaTools.View.goToCityView(city, view, params);
                }
            });
            return this;
        },
        toCityActivation: function toCityActivation(city, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate(this)) {
                    IkaTools.View.activateCity(city);
                }
            });
            return this;
        },
        toIkariamPage: function toIkariamPage(params, anchor, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate(this)) {
                    IkaTools.View.goToIkariamFullPage(params, anchor);
                }
            });
            return this;
        },
    });

    var toolTips = new IkaTools.UI.ToolTipHandler(
        'imperator_tool_tip', $('<div class="tool_tip_container"/>'));
    toolTips.startHandling($('body'));

    function overviewTables() {
        function Tab(name, tabText, tabContentHolder, tabContentId, init, renderer) {
            this.updateables = new Updateables(name);

            var render = renderer.bind(this);
            this.mainUpdateable = this.updateables.createPermanent(tabContentId);
            this.mainUpdateable.registerUpdate('redraw', function(element) {
                element.removeClass(
                    'city_type_ownCity city_type_deployedCities city_type_occupiedCities');
                element.addClass('city_type_' + IkaTools.View.getCurrentCity().getType());
                element.html(render());
            });
            this.mainUpdateable.registerUpdate('cityChanged', function updateTabTableType(table) {
                table.removeClass(
                    'city_type_ownCity city_type_deployedCities city_type_occupiedCities');
                table.addClass('city_type_' + IkaTools.View.getCurrentCity().getType());
            });

            this.isActive = false;
            this.needsRedraw = true;
            this.render = renderer; // réactivé

            var tab = this;
            this.initFirstTime = IkaTools.Utils.thunk(function() {
                IkaTools.View.registerIkariamAjaxResponseCallback(function tab_CityChanged() {
                    tab.updateables.updateForEvent('cityChanged');
                    tab.maybeRedraw(true);
                });
                init.call(tab);
            });

            this.tab = new IkaTools.UI.TabPane.Tab(
                $('<b>%s</b>'.format(tabText)),
                tabContentHolder,
                {
                    activatedCallback: function() {
                        this.isActive = true;
                        this.maybeRedraw();
                        this.initFirstTime();
                        this.updateables.activate();


                    }.bind(this),
                    deactivatedCallback: function() {
                        this.isActive = false;
                        this.updateables.deactivate();
                    }.bind(this),
                });
        }

        $.extend(Tab.prototype, {
            maybeRedraw: function maybeRedraw(redraw) {
                this.needsRedraw = this.needsRedraw || redraw;
                if (this.isActive && this.needsRedraw) {
                    this.updateables.clear();
                    this.mainUpdateable.updateForEvent('redraw');
                    this.needsRedraw = false;
                }
            },
            getTab: function getTab() {
                return this.tab;
            }
        });

        // ============================================================
        // v2.13 : Bénédictions divines — repères visuels (onglet Ressources)
        // Source : Sanctuaire divin (onglets Vénérer + Vue générale, même réponse).
        // Mécanique (wiki Ikariam, vérifiée niv. 49 -> 101 %) :
        //   bénédiction max      = 3 + 2 × niveau du Sanctuaire
        //   bénédiction par ville = max × (0,4 + 0,6 × jauge / 1000)
        //   chaque don de 100 faveurs relance la protection à 3 jours ;
        //   protection écoulée => la jauge baisse (vitesse encore inconnue).
        // États : max (jauge 1000 + protection) / soon (fin de protection proche)
        //         weak (en baisse) / floor (jauge 0, bonus de base 40 %).
        // ============================================================
        var IMP_GODS = {
            // resource : ressource dont la production est bénie.
            // Pan -> bois : hypothèse (recherche « Seigneur des bois »), à confirmer.
            // Tyché : inconnue -> repli sur la ressource de luxe de la ville.
            '1': { name:'Pan',        color:'#7cb342', bg:'rgba(124,179,66,0.15)',  resource:'wood'   },
            '2': { name:'Dionysos',   color:'#9b5fc0', bg:'rgba(155,95,192,0.15)',  resource:'wine'   },
            '3': { name:'Tyché',      color:'#ec407a', bg:'rgba(236,64,122,0.15)',  resource:null     },
            '4': { name:'Pluton',     color:'#d4a017', bg:'rgba(212,160,23,0.15)',  resource:'gold'   },
            '5': { name:'Théia',      color:'#26c6da', bg:'rgba(38,198,218,0.15)',  resource:'glass'  },
            '6': { name:'Héphaïstos', color:'#c98a1a', bg:'rgba(201,138,26,0.15)',  resource:'sulfur' }
        };
        var IMP_BLESS_STALE_MS = 24 * 3600 * 1000; // au-delà : données jugées anciennes
        var IMP_BLESS_FAVOR_MAX = 1000;

        function impBlessSoonMs() {
            var h = parseInt(blessSoonThreshold && blessSoonThreshold.getValue ? blessSoonThreshold.getValue() : '12', 10);
            return (isFinite(h) && h > 0 ? h : 12) * 3600 * 1000;
        }

        function impBlessShrine() {
            try {
                var civ = IkaTools.EmpireData.getCivilizationData();
                return (civ && civ.getShrineData) ? civ.getShrineData() : {};
            } catch (e) { return {}; }
        }

        // Ville qui possède le Sanctuaire (+ position et niveau)
        function impBlessShrineCity() {
            try {
                var cities = IkaTools.EmpireData.getOwnCities();
                for (var i = 0; i < cities.length; i++) {
                    var b = cities[i] && cities[i].getBuildingByType
                        ? cities[i].getBuildingByType(IkaTools.Constants.Buildings.DIVINE_SANCTUARY) : null;
                    if (b) return { city: cities[i],
                                    position: b.getPosition ? b.getPosition() : null,
                                    level: b.getLevel ? parseInt(b.getLevel(), 10) : null };
                }
            } catch (e) {}
            return null;
        }

        // Bénédiction lue la plus haute (repli si le niveau du Sanctuaire est inconnu)
        function impBlessRefBonus() {
            var ref = null;
            try {
                $.each(IkaTools.EmpireData.getOwnCities(), function(i, c) {
                    var b = c && c.worshipGodBonus;
                    if (typeof b === 'number' && isFinite(b) && (ref === null || b > ref)) ref = b;
                });
            } catch (e) {}
            return ref;
        }

        // Bénédiction maximale : 3 + 2 × niveau (repli : plus haute valeur lue)
        function impBlessMaxBonus(refBonus) {
            var s = impBlessShrineCity();
            if (s && s.level && isFinite(s.level) && s.level > 0) return 3 + 2 * s.level;
            return (refBonus !== undefined) ? refBonus : impBlessRefBonus();
        }

        // Bénédiction par ville pour une jauge donnée
        function impBlessBonusForFavor(maxBonus, favor) {
            if (maxBonus === null || maxBonus === undefined || favor === null || favor === undefined) return null;
            var f = Math.max(0, Math.min(IMP_BLESS_FAVOR_MAX, favor));
            return maxBonus * (0.4 + 0.6 * f / IMP_BLESS_FAVOR_MAX);
        }

        // État à un instant donné (aussi utilisé par le ticker).
        // favor : jauge lue (null si inconnue) ; weakFlag : repli sur la bénédiction lue.
        function impBlessStateAt(graceEnd, favor, weakFlag, now) {
            if (favor === 0) return 'floor';
            var full = (favor === null || favor === undefined) ? !weakFlag : favor >= IMP_BLESS_FAVOR_MAX;
            if (!full) return 'weak';
            if (!graceEnd) return 'max'; // pas de durée connue : on se fie à la jauge
            var rem = graceEnd - now;
            if (rem <= 0) return 'weak'; // protection écoulée : la jauge baisse
            if (rem <= impBlessSoonMs()) return 'soon';
            return 'max';
        }

        // Toutes les infos de bénédiction d'une ville (null si aucun dieu)
        function impBlessInfo(city, refBonus) {
            if (!city || !city.worshipGodId) return null;
            var gid = String(city.worshipGodId);
            var meta = IMP_GODS[gid];
            if (!meta) return null;
            var sd = impBlessShrine();
            var g = (sd.gods && sd.gods[gid]) || null;
            var now = Date.now();
            if (refBonus === undefined) refBonus = impBlessRefBonus();
            var maxBonus = impBlessMaxBonus(refBonus);
            var readBonus = (typeof city.worshipGodBonus === 'number' && isFinite(city.worshipGodBonus)) ? city.worshipGodBonus : null;
            var favor = (g && typeof g.favor === 'number' && isFinite(g.favor)) ? g.favor : null;
            // Bénédiction : calculée depuis la jauge (exacte), sinon celle lue dans Vénérer
            var bonus = (favor !== null) ? impBlessBonusForFavor(maxBonus, favor) : readBonus;
            var weakFlag = (favor === null && readBonus !== null && maxBonus !== null && readBonus < maxBonus - 0.01);
            var graceEnd = g ? g.graceEnd : null;
            return {
                godId: gid, name: meta.name, color: meta.color, bg: meta.bg,
                resource: meta.resource || (city.getTradeGoodType ? city.getTradeGoodType() : null),
                favor: favor, maxBonus: maxBonus, bonus: bonus,
                graceEnd: graceEnd, weakFlag: weakFlag,
                stale: !g || (now - (sd.godsUpdated || 0) > IMP_BLESS_STALE_MS),
                lastUpdate: Math.max(sd.godsUpdated || 0, city.worshipGodUpdated || 0),
                state: impBlessStateAt(graceEnd, favor, weakFlag, now)
            };
        }

        function impBlessFmtRemaining(ms) {
            if (ms === null || ms === undefined || !isFinite(ms)) return '?';
            if (ms <= 0) return 'terminée';
            var m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mn = m % 60;
            if (d > 0) return d + 'j ' + h + 'h';
            if (h > 0) return h + 'h ' + (mn < 10 ? '0' : '') + mn + 'm';
            return mn + 'm';
        }

        function impBlessFmtAgo(ts) {
            if (!ts) return 'jamais';
            var m = Math.floor((Date.now() - ts) / 60000);
            if (m < 1) return "à l'instant";
            if (m < 60) return 'il y a ' + m + ' min';
            var h = Math.floor(m / 60);
            if (h < 48) return 'il y a ' + h + ' h';
            return 'il y a ' + Math.floor(h / 24) + ' j';
        }

        function impBlessFmtPct(v) {
            return (v === null || v === undefined || !isFinite(v)) ? '?' : v.toFixed(1).replace('.', ',') + ' %';
        }

        var IMP_BLESS_STATE_LABEL = { max:'Au max', soon:'Fin de protection proche', weak:'En baisse', floor:'Plancher' };

        function impBlessStateClasses(state, stale) {
            return 'imp-bless imp-bless-' + state + (stale ? ' imp-bless-stale' : '');
        }

        // Attributs lus par le ticker pour faire évoluer l'état sans redessiner
        function impBlessDataAttrs(info) {
            return ' data-imp-bless-end="' + (info.graceEnd || 0) + '"' +
                   ' data-imp-bless-favor="' + (info.favor === null || info.favor === undefined ? '' : info.favor) + '"' +
                   ' data-imp-bless-weak="' + (info.weakFlag ? 1 : 0) + '"' +
                   ' style="--imp-bless-c:' + info.color + ';--imp-bless-bg:' + info.bg + '"';
        }

        // Texte court d'une pastille du bandeau
        function impBlessChipLabel(state, graceEnd, favor, now) {
            if (state === 'max' || state === 'soon') return graceEnd ? impBlessFmtRemaining(graceEnd - now) : 'au max';
            if (state === 'floor') return 'plancher';
            if (favor !== null && favor !== undefined && favor < IMP_BLESS_FAVOR_MAX) return favor + '/' + IMP_BLESS_FAVOR_MAX;
            return 'en baisse';
        }

        // Contenu de l'infobulle (régénéré chaque seconde via registerRefreshable)
        function impBlessToolTipHtml(info, productionPerHour) {
            var now = Date.now();
            var state = impBlessStateAt(info.graceEnd, info.favor, info.weakFlag, now);
            var lowered = (state === 'weak' || state === 'floor');
            // Protection écoulée depuis la lecture : la jauge lue n'est plus d'actualité
            var driftSinceRead = info.graceEnd && info.graceEnd <= now &&
                                 info.favor !== null && info.favor >= IMP_BLESS_FAVOR_MAX;
            var rows = [];
            rows.push('<div class="imp-bless-tt-head" style="color:' + info.color + '">' + info.name +
                      ' <span class="imp-bless-tt-state imp-bless-tt-' + state + '">' + IMP_BLESS_STATE_LABEL[state] + '</span></div>');

            // Protection
            if (info.graceEnd && info.graceEnd > now) {
                rows.push('<div>Protection : encore <b>' + impBlessFmtRemaining(info.graceEnd - now) + '</b></div>');
            } else if (info.graceEnd) {
                rows.push('<div>Protection : <b>terminée</b>, la jauge baisse</div>');
            } else {
                rows.push('<div>Protection : <i>inconnue</i></div>');
            }

            // Jauge + bénédiction
            if (info.favor !== null) {
                rows.push('<div>Jauge : <b>' + info.favor + ' / ' + IMP_BLESS_FAVOR_MAX + '</b>' +
                          (driftSinceRead ? ' <i>(à la lecture)</i>' : '') + '</div>');
            }
            if (info.bonus !== null) {
                rows.push('<div>Bénédiction : <b>' + impBlessFmtPct(info.bonus) + '</b>' +
                          (info.maxBonus !== null && lowered && !driftSinceRead ? ' sur ' + impBlessFmtPct(info.maxBonus) : '') +
                          (driftSinceRead ? ' <i>(à la lecture)</i>' : '') + '</div>');
            }

            // Production (hors Pluton) : part divine au max, manque à gagner sinon.
            // prod × b / (100 + b) et prod × (max − b) / (100 + b) : ignorent les autres bonus
            // (Cinématorium...) => légère surestimation, d'où le « ≈ ».
            if (info.resource !== 'gold' && productionPerHour > 0 && info.bonus !== null) {
                if (!lowered) {
                    rows.push('<div>Part divine ≈ <b>+' + IkaTools.Intl.formatInteger(productionPerHour * info.bonus / (100 + info.bonus)) + '/h</b></div>');
                } else if (!driftSinceRead && info.maxBonus !== null && info.maxBonus > info.bonus) {
                    rows.push('<div class="imp-bless-tt-warn">Manque à gagner ≈ <b>−' +
                              IkaTools.Intl.formatInteger(productionPerHour * (info.maxBonus - info.bonus) / (100 + info.bonus)) + '/h</b></div>');
                }
            }

            // Ce qu'il faut donner
            if (lowered) {
                if (info.favor !== null && info.favor < IMP_BLESS_FAVOR_MAX) {
                    rows.push('<div>Pour revenir au max : <b>' + (IMP_BLESS_FAVOR_MAX - info.favor) + ' faveurs</b>' +
                              (info.maxBonus !== null ? ' (+' + impBlessFmtPct(info.maxBonus * 0.06) + ' par tranche de 100)' : '') + '</div>');
                } else {
                    rows.push('<div>Ouvrez le Sanctuaire pour lire la jauge actuelle.</div>');
                }
            }

            rows.push('<div class="imp-bless-tt-foot">Sanctuaire lu ' + impBlessFmtAgo(info.lastUpdate) +
                      (info.stale ? ', ouvrez-le pour actualiser' : '') + '</div>');
            return '<div class="imp-bless-tt">' + rows.join('') + '</div>';
        }

        // Bandeau de pastilles au-dessus du tableau (rendu dans un <caption>)
        function impBlessMakeCaption() {
            var sd = impBlessShrine();
            var ref = impBlessRefBonus();
            var counts = {}, weakByGod = {};
            $.each(IkaTools.EmpireData.getOwnCities(), function(i, c) {
                var info = impBlessInfo(c, ref);
                if (!info) return;
                counts[info.godId] = (counts[info.godId] || 0) + 1;
                if (info.weakFlag) weakByGod[info.godId] = true;
            });
            var ids = $.map(counts, function(v, k) { return k; });
            if (!ids.length) return '';
            var now = Date.now();
            var rank = { floor:0, weak:1, soon:2, max:3 };
            var toGive = 0, unknownGive = false;
            var rows = $.map(ids, function(gid) {
                var g = (sd.gods && sd.gods[gid]) || null;
                var favor = (g && typeof g.favor === 'number') ? g.favor : null;
                var end = g ? g.graceEnd : null;
                var state = impBlessStateAt(end, favor, !!weakByGod[gid], now);
                if (state === 'weak' || state === 'floor') {
                    if (favor !== null && favor < IMP_BLESS_FAVOR_MAX) toGive += IMP_BLESS_FAVOR_MAX - favor;
                    else unknownGive = true;
                }
                return { gid: gid, favor: favor, end: end, state: state };
            });
            // Tri : les plus urgents d'abord (plancher, en baisse, puis fin de protection la plus proche)
            rows.sort(function(a, b) {
                if (rank[a.state] !== rank[b.state]) return rank[a.state] - rank[b.state];
                return (a.end || Infinity) - (b.end || Infinity);
            });
            var stale = !sd.godsUpdated || (now - sd.godsUpdated > IMP_BLESS_STALE_MS);
            var chips = $.map(rows, function(r) {
                var meta = IMP_GODS[r.gid];
                var info = { graceEnd: r.end, favor: r.favor, weakFlag: !!weakByGod[r.gid], color: meta.color, bg: meta.bg };
                return '<a href="javascript:void(0);" class="imp-bless-chip ' + impBlessStateClasses(r.state, false) + '"' +
                       impBlessDataAttrs(info) + ' title="Ouvrir le Sanctuaire divin">' +
                       '<span class="imp-bless-dot"></span>' + meta.name + ' (' + counts[r.gid] + ')' +
                       ' <span class="imp-bless-rem">' + impBlessChipLabel(r.state, r.end, r.favor, now) + '</span></a>';
            }).join('');
            var give = '';
            if (toGive > 0 || unknownGive) {
                give = '<span class="imp-bless-bar-give">À donner : <b>' + (toGive > 0 ? IkaTools.Intl.formatInteger(toGive) : '') +
                       (unknownGive ? (toGive > 0 ? ' + ?' : '?') : '') + '</b>' +
                       (sd.favor ? ' / ' + IkaTools.Intl.formatInteger(sd.favor) + ' disponibles' : '') + '</span>';
            }
            return '<caption class="imp-bless-bar">' +
                   '<span class="imp-bless-bar-label">Bénédictions</span>' + chips + give +
                   '<span class="imp-bless-bar-upd' + (stale ? ' is-stale' : '') + '">Sanctuaire lu ' +
                   impBlessFmtAgo(sd.godsUpdated) + '</span></caption>';
        }

        // CSS + ticker + clic des pastilles : installés une seule fois
        var _impBlessInstalled = false;
        function impBlessInstallOnce() {
            if (_impBlessInstalled) return;
            _impBlessInstalled = true;
            GM_addStyle(
                '#ImperatorOverviewResourceTable td.imp-bless { position:relative; background-color:var(--imp-bless-bg) !important; box-shadow:inset 0 0 0 2px var(--imp-bless-c); }' +
                '#ImperatorOverviewResourceTable td.imp-bless-soon::after { content:""; position:absolute; top:2px; right:2px; width:7px; height:7px; border-radius:50%; background:#ef6c00; box-shadow:0 0 0 1px #fff8e1; }' +
                '#ImperatorOverviewResourceTable td.imp-bless-weak { background-color:rgba(192,57,43,0.07) !important; box-shadow:inset 0 0 0 2px rgba(192,57,43,0.55); background-image:repeating-linear-gradient(135deg, transparent 0 5px, rgba(192,57,43,0.08) 5px 7px); }' +
                '#ImperatorOverviewResourceTable td.imp-bless-floor { background-color:rgba(0,0,0,0.04) !important; box-shadow:inset 0 0 0 2px #a1978a; }' +
                '#ImperatorOverviewResourceTable td.imp-bless-stale::before { content:"\\23F1"; position:absolute; bottom:1px; right:2px; font-size:9px; line-height:9px; opacity:.55; }' +
                '.imp-bless-badge { display:inline-block; width:11px; height:11px; margin-left:4px; vertical-align:-1px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #ffe082, var(--imp-bless-c) 70%); box-shadow:0 0 0 1px rgba(90,62,27,.45); cursor:help; position:relative; }' +
                '.imp-bless-badge.imp-bless-soon { box-shadow:0 0 0 2px #ef6c00; }' +
                '.imp-bless-badge.imp-bless-weak { background:radial-gradient(circle at 35% 35%, #f3e5c0, #bfa36a 70%); box-shadow:0 0 0 1px #c0392b; }' +
                '.imp-bless-badge.imp-bless-floor { background:#bdb3a0; box-shadow:0 0 0 1px #8a7f70; }' +
                '#ImperatorOverviewResourceTable caption.imp-bless-bar { caption-side:top; text-align:left; padding:3px 2px 5px; font-size:11px; color:#5a3e1b; white-space:normal; }' +
                '.imp-bless-bar-label { font-weight:bold; margin-right:6px; }' +
                '.imp-bless-chip { display:inline-block; margin:1px 5px 1px 0; padding:1px 7px 1px 5px; border-radius:9px; background:var(--imp-bless-bg); border:1px solid var(--imp-bless-c); color:#5a3e1b !important; text-decoration:none !important; cursor:pointer; }' +
                '.imp-bless-chip:hover, .imp-bless-chip:focus { background:#fff8e1; outline:none; box-shadow:0 0 0 1px var(--imp-bless-c); }' +
                '.imp-bless-chip .imp-bless-dot { display:inline-block; width:7px; height:7px; margin-right:4px; border-radius:50%; background:var(--imp-bless-c); vertical-align:0; }' +
                '.imp-bless-chip .imp-bless-rem { font-weight:bold; }' +
                '.imp-bless-chip.imp-bless-soon .imp-bless-rem { color:#ef6c00; }' +
                '.imp-bless-chip.imp-bless-weak { border-style:dashed; border-color:#c0392b; background:rgba(192,57,43,0.07); }' +
                '.imp-bless-chip.imp-bless-weak .imp-bless-rem { color:#c0392b; }' +
                '.imp-bless-chip.imp-bless-floor { border-color:#a1978a; background:rgba(0,0,0,0.04); }' +
                '.imp-bless-chip.imp-bless-floor .imp-bless-dot { background:#a1978a; }' +
                '.imp-bless-bar-give { margin-left:6px; }' +
                '.imp-bless-bar-upd { float:right; color:#8a6d39; font-style:italic; }' +
                '.imp-bless-bar-upd.is-stale { color:#c0392b; font-style:normal; font-weight:bold; }' +
                '.imp-bless-tt { margin-top:4px; padding:4px 6px; border-top:1px solid #d8b871; font-size:11px; line-height:1.45; color:#5a3e1b; min-width:190px; }' +
                '.imp-bless-tt-head { font-weight:bold; }' +
                '.imp-bless-tt-state { font-weight:normal; font-size:10px; margin-left:4px; padding:0 4px; border-radius:6px; color:#fff; }' +
                '.imp-bless-tt-max { background:#558b2f; } .imp-bless-tt-soon { background:#ef6c00; } .imp-bless-tt-weak { background:#c0392b; } .imp-bless-tt-floor { background:#8a7f70; }' +
                '.imp-bless-tt-warn { color:#c0392b; }' +
                '.imp-bless-tt-foot { color:#8a6d39; font-style:italic; margin-top:2px; }'
            );

            // Ticker : fait évoluer états et libellés sans redessiner le tableau
            setInterval(function impBlessTick() {
                try {
                    var now = Date.now();
                    $('[data-imp-bless-end]').each(function() {
                        var $e = $(this);
                        var end = parseInt($e.attr('data-imp-bless-end'), 10) || null;
                        var fAttr = $e.attr('data-imp-bless-favor');
                        var favor = (fAttr === '' || fAttr === undefined) ? null : parseInt(fAttr, 10);
                        var weak = $e.attr('data-imp-bless-weak') === '1';
                        var state = impBlessStateAt(end, favor, weak, now);
                        $e.removeClass('imp-bless-max imp-bless-soon imp-bless-weak imp-bless-floor').addClass('imp-bless-' + state);
                        $e.find('.imp-bless-rem').text(impBlessChipLabel(state, end, favor, now));
                    });
                } catch (e) {}
            }, 30000);

            // Clic sur une pastille -> Sanctuaire divin, onglet Vue générale
            $(document).on('click', '.imp-bless-chip', function(ev) {
                ev.preventDefault();
                var s = impBlessShrineCity();
                if (!s) return;
                var params = { cityId: s.city.getId(), activeTab: 'tabOverview' };
                if (s.position !== null && s.position !== undefined) params.position = s.position;
                IkaTools.View.goToCityView(s.city, IkaTools.Constants.Buildings.DIVINE_SANCTUARY, params);
            });
        }

        function makeCityNameCells(table, city, excludeTradeGood) {
            var cityLink = new Link('CityLink_%s_%s'.format(table, city.getId()))
            .toCityActivation(city);
            // v2.12 : badge Pluton (bénédiction en or) dans l'onglet Ressources
            var blessBadge = '';
            if (table === 'resources') {
                try {
                    var bInfo = impBlessInfo(city);
                    if (bInfo && bInfo.resource === 'gold') {
                        var badgeId = 'ImpBlessBadge_' + city.getId();
                        blessBadge = '<span id="' + badgeId + '" class="imp-bless-badge imperator_tool_tip ' +
                                     impBlessStateClasses(bInfo.state, false) + '"' + impBlessDataAttrs(bInfo) + '></span>';
                        toolTips.registerRefreshable(badgeId, function() { return impBlessToolTipHtml(bInfo, 0); });
                    }
                } catch (eB) {}
            }
            return ('%s' +
                    '<td class="city_name">' +
                    '<a class="imperator_link" id="%s" href="javascript:void(0)">%s</a>' + blessBadge +
                    '</td>').format(
                (excludeTradeGood ? '' : ('<td class="city_tradegood imperator_link ">' +
                                          '<img src="/cdn/all/both/resources/icon_%s.png">' +
                                          '</td>').format(city.getTradeGoodType())),
                cityLink.getId(),
                __impH(city.getName()));
        }

        function makeCityNameColGroup(extraCols, excludeTradeGood) {
            return ('<colgroup class="city_name">' +
                    '%s' +
                    '<col class="city_name">' +
                    '%s' +
                    '</colgroup>').format(
                excludeTradeGood ? '' : '<col class="city_tradegood">',
                extraCols || '');
        }

        function makeCityNameHeaderCells(excludeTradeGood) {
            return '<th class="city_name" colspan="%s">%s</th>'.format(
                excludeTradeGood ? '1' : '2',
                localizer.localize('misc','city_name'));
        }

        function makeResourceTab() {
            function makeResourceUseTableRow(displaySign, usePerHour, usePerDay, usePerWeek) {
                return makeResourceUseTableRowRaw(
                    displaySign,
                    IkaTools.Intl.formatInteger(usePerHour),
                    IkaTools.Intl.formatInteger(usePerDay ||
                                                usePerHour * IkaTools.Constants.Time.HOURS_PER_DAY),
                    IkaTools.Intl.formatInteger(usePerWeek ||
                                                usePerHour * IkaTools.Constants.Time.HOURS_PER_WEEK));
            }

            function makeResourceUseTableRowRaw(displaySign, usePerHour, usePerDay, usePerWeek) {
                return '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>'.format(
                    displaySign, usePerHour, usePerDay, usePerWeek);
            }

            function makeResourceUseToolTip(icon, rows, footerRows) {
                return ('<table class="resource_use_tool_tip">' +
                        '<colgroup><col/><col/><col/><col/></colgroup>' +
                        '<thead>' +
                        '<tr>' +
                        '<th><img src="%s" height="12"/></th>' +
                        '<th>%s</th>' +
                        '<th>%s</th>' +
                        '<th>%s</th>' +
                        '</tr>' +
                        '</thead>' +
                        '<tbody>%s</tbody>' +
                        '<tfoot>%s</tfoot>' +
                        '</table>').format(
                    icon,
                    IkaTools.Intl.localizer.localize('timeunits','long','hour'),
                    IkaTools.Intl.localizer.localize('timeunits','long','day'),
                    IkaTools.Intl.localizer.localize('timeunits','long','week'),
                    rows.join(''),
                    footerRows ? footerRows.join('') : '')
            }

            // debut patch
            function __imp_ensureUpdateables(ctx) {
                // cas normal : déjà OK
                if (ctx && ctx.updateables && typeof ctx.updateables.create === 'function') {
                    return ctx.updateables;
                }

                // fallback : stub minimal (évite le crash)
                var stub = {
                    create: function () {
                        var ids = Array.prototype.slice.call(arguments);
                        return {
                            getId: function (i) { return ids[i] || ids[0] || ('imp_id_' + Math.random()); },
                            registerTickerUpdate: function () { return this; },
                            registerUpdate: function () { return this; }
                        };
                    }
                };

                if (ctx) ctx.updateables = stub;

                console.warn('[Imperator][FIX] updateables manquant -> stub installé (évite crash, updates live désactivées)');

                return stub;
            }
            //fin patch

            function makeTableContent() {
                var updateables = __imp_ensureUpdateables(this);
                var civData = IkaTools.EmpireData.getCivilizationData();
                impBlessInstallOnce();                    // v2.12
                var blessRefBonus = impBlessRefBonus();   // v2.12 : calculée une fois par rendu


                // Patch Patch “anti-?”

                function getResourceData(resource) {
                    // current / capacity peuvent être undefined selon la ville / état du cache
                    var current = resource && resource.getCurrent ? Number(resource.getCurrent()) : 0;
                    if (!isFinite(current)) current = 0;

                    var capacity = resource && resource.getCapacity ? (resource.getCapacity() || {}) : {};
                    var max = Number(capacity.maximum);
                    var safe = Number(capacity.safe);

                    if (!isFinite(max) || max < 0) max = 0;
                    if (!isFinite(safe) || safe < 0) safe = 0;

                    var timeUntilFull = resource && resource.getTimeUntilFull ? Number(resource.getTimeUntilFull()) : Number.POSITIVE_INFINITY;
                    var timeUntilEmpty = resource && resource.getTimeUntilEmpty ? Number(resource.getTimeUntilEmpty()) : Number.POSITIVE_INFINITY;

                    var millisUntilFull = Math.ceil(timeUntilFull);
                    var millisUntilEmpty = Math.ceil(timeUntilEmpty);

                    // Classes "full"
                    var fullClass = '';
                    if (isFinite(millisUntilFull)) {
                        if (millisUntilFull < 1 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            fullClass = 'expiration_now';
                        } else if (millisUntilFull <= 6 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            fullClass = 'expiration_imminent';
                        } else if (millisUntilFull <= 24 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            fullClass = 'expiration_soon';
                        } else if (millisUntilFull <= 48 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            fullClass = 'expiration_forseeable';
                        }
                    }

                    // Classes "empty"
                    var emptyClass = '';
                    if (isFinite(millisUntilEmpty)) {
                        if (millisUntilEmpty < 1 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            emptyClass = 'expiration_now';
                        } else if (millisUntilEmpty <= 6 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            emptyClass = 'expiration_imminent';
                        } else if (millisUntilEmpty <= 24 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            emptyClass = 'expiration_soon';
                        } else if (millisUntilEmpty <= 48 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            emptyClass = 'expiration_forseeable';
                        }
                    }

                    var percent = (max > 0) ? (current / max * 100) : 0;
                    if (!isFinite(percent)) percent = 0;
                    if (percent < 0) percent = 0;
                    if (percent > 100) percent = 100;

                    return {
                        current: current,
                        max: max,
                        percent: percent,
                        safe: safe,
                        fullClass: fullClass,
                        emptyClass: emptyClass,
                    };
                }
                // Fin patch Patch “anti-?”


                function makeResourceCells(movements, city, resourceName) {
                    var resource = city.getResource(resourceName);
                    var cityId = city.getId();

                    var currentUpdateable = updateables.create(
                        IkaTools.Utils.nextId('resource_current_'),
                        IkaTools.Utils.nextId('resource_current_percent_bar_'),
                        IkaTools.Utils.nextId('resource_current_percent_bar_active_'));

                    var resourceLink = new Link('Resource_%s_%s'.format(city.getId(), resourceName));

                    if (resourceName == IkaTools.Constants.Resources.WOOD) {
                        resourceLink.toCitysIslandView(
                            city, IkaTools.Constants.View.RESOURCE,
                            { type: 'resource', islandId: city.getIslandId(), cityId: city.getId() });
                    } else if (resourceName == city.getTradeGoodType()) {
                        resourceLink.toCitysIslandView(
                            city, IkaTools.Constants.View.TRADE_GOOD,
                            { type: IkaTools.Constants.TradeGoodOrdinals[city.getTradeGoodType()],
                             islandId: city.getIslandId(), cityId: city.getId() });
                    }

                    var data = getResourceData(resource);

                    var inTransit = 0;

                    function isCountableMovement(movement) {
                        if (movement.getResource(resourceName) > 0) {
                            if (movement.getMission() == IkaTools.Constants.Movements.Mission.PLUNDER) {
                                return movement.getOriginCityId() == cityId;
                            }
                            if (movement.getStage() == IkaTools.Constants.Movements.Stage.LOADING ||
                                movement.getStage() == IkaTools.Constants.Movements.Stage.EN_ROUTE) {
                                return movement.getTargetCityId() == cityId;
                            }
                            if (movement.getStage() == IkaTools.Constants.Movements.Stage.RETURNING) {
                                return movement.getOriginCityId() == cityId;
                            }
                        }
                        return false;
                    }

                    $.each(movements, function totalMovements(index, movement) {
                        var mission = movement.getMission();
                        var stage = movement.getStage();
                        if (isCountableMovement(movement)) {
                            inTransit += movement.getResource(resourceName) || 0;
                        }
                    });

                    var inTransitDivId = 'ResourcesInTransit_%s_%s'.format(city.getId(), resourceName);
                    if (inTransit) {
                        toolTips.registerRefreshable(inTransitDivId, function() {
                            return ('<table class="resources_in_transit_tool_tip">' +
                                    '<thead>' +
                                    '<tr>' +
                                    '<th>' +
                                    '<img src="/cdn/all/both/resources/icon_%s.png" height="12"/>' +
                                    '</th>' +
                                    '<th>%s</th>' +
                                    '</tr>' +
                                    '</thead>' +
                                    '<tbody>%s</tbody>' +
                                    '</table').format(
                                resourceName,
                                localizer.localize('misc','in_transit'),
                                $.map(movements, function makeResourcesInTransitRow(movement) {
                                    var count = movement.getResource(resourceName);
                                    if (isCountableMovement(movement)) {
                                        return '<tr><td class="resource_count">%s</td><td>%s</td></tr>'.format(
                                            IkaTools.Intl.formatInteger(count, true),
                                            IkaTools.Intl.formatRemainingTime(
                                                movement.getArrivalTime() - IkaTools.View.gameTimeNow()));
                                    } else {
                                        return '';
                                    }
                                }).join(''));
                        });
                    } else {
                        toolTips.deregister(inTransitDivId);
                    }

                    toolTips.registerRefreshable(currentUpdateable.getId(1), function() {
                        var timeToFull = resource.getTimeUntilFull();
                        var timeToEmpty = resource.getTimeUntilEmpty();

                        var timeRow = '';
                        if (isFinite(timeToFull)) {
                            timeRow = '<tr><td>%s:</td><td>%s</td>'.format(
                                localizer.localize('misc','time_to_full'),
                                IkaTools.Intl.formatRemainingTime(timeToFull,
                                                                  localizer.localize('misc','full')));
                        } else if (isFinite(timeToEmpty)) {
                            timeRow = '<tr><td>%s:</td><td>%s</td>'.format(
                                localizer.localize('misc','time_to_empty'),
                                IkaTools.Intl.formatRemainingTime(timeToEmpty,
                                                                  localizer.localize('misc','empty')));
                        }

                        var capacity = city.getResourceCapacity();
                        return ('<table>' +
                                '<colgroup><col/><col/></colgroup>' +
                                '<tbody>' +
                                '<tr><td>%s:</td><td>%s</td></tr>' +
                                '<tr><td>%s:</td><td>%s</td></tr>' +
                                '%s' +
                                '<tbody>' +
                                '<table>').format(
                            localizer.localize('misc','maximum_capacity'),
                            IkaTools.Intl.formatInteger(data.max),
                            localizer.localize('misc','safe_capacity'),
                            IkaTools.Intl.formatInteger(data.safe),
                            timeRow);
                    });

                    // Patch début
                    var currentContent = '?';
                    if (Number.isFinite(data.current)) {
                        currentContent = (
                            '<div id="%s" class="resource_current %s %s">%s</div>' +
                            '<div id="%s" class="resources_transporting imperator_tool_tip">%s</div>' +
                            '<div id="%s" class="percent_bar imperator_tool_tip %s">' +
                            '<div id="%s" class="percent_bar_active" style="width: %s%;" />' +
                            '</div>').format(
                            currentUpdateable.getId(0),
                            data.emptyClass,
                            data.current <= data.safe ? 'is_under_safe_limit' : '',
                            IkaTools.Intl.formatInteger(data.current),
                            inTransitDivId,
                            inTransit ? IkaTools.Intl.formatInteger(inTransit, true) : '-',
                            currentUpdateable.getId(1),
                            data.fullClass,
                            currentUpdateable.getId(2),
                            Number.isFinite(data.percent) ? data.percent : 0
                        );

                        currentUpdateable.registerTickerUpdate(function(amount, percentBar, activeBar) {
                            var data = getResourceData(resource);

                            if (!Number.isFinite(data.current)) return; // sécurité

                            if (data.current <= data.safe) {
                                amount.addClass('is_under_safe_limit');
                            } else {
                                amount.removeClass('is_under_safe_limit');
                            }

                            amount.html(IkaTools.Intl.formatInteger(data.current));

                            amount.removeClass('expiration_now expiration_imminent expiration_soon expiration_forseeable');
                            amount.addClass(data.emptyClass);

                            percentBar.removeClass('expiration_now expiration_imminent expiration_soon expiration_forseeable');
                            percentBar.addClass(data.fullClass);

                            activeBar.css('width', '%s%'.format(Number.isFinite(data.percent) ? data.percent : 0));
                        });
                    }

                    // patch Fin

                    var productionContent = '&nbsp;';
                    var production = resource.getProduction();
                    // v2.12 : bénédiction divine sur cette ressource ?
                    var blessInfo = null;
                    try {
                        var bi = impBlessInfo(city, blessRefBonus);
                        if (bi && bi.resource === resourceName) blessInfo = bi;
                    } catch (eBl) { blessInfo = null; }
                    if (production !== undefined) {
                        var productionPerHour = production * IkaTools.Constants.Time.SECONDS_PER_HOUR;
                        productionContent = IkaTools.Intl.formatInteger(productionPerHour, true);
                        var useToolTip = makeResourceUseToolTip('/cdn/all/both/resources/icon_%s.png'.format(resourceName),
                                                                [makeResourceUseTableRow('+', productionPerHour)]);
                        if (blessInfo) {
                            toolTips.registerRefreshable(resourceLink.getId(), function() {
                                return '<div>' + useToolTip + impBlessToolTipHtml(blessInfo, productionPerHour) + '</div>';
                            });
                        } else {
                            toolTips.registerSimple(resourceLink.getId(), useToolTip);
                        }
                    }
                    var blessTdClass = blessInfo ? ' ' + impBlessStateClasses(blessInfo.state, blessInfo.stale) : '';
                    var blessTdAttrs = blessInfo ? impBlessDataAttrs(blessInfo) : '';


                    var consumptionContent = '';
                    var consumption = resource.getConsumption();
                    var tavernLink = new Link('WineConsumptionTavern_%s'.format(city.getId()));
                    var tavern = city.getBuildingByType(IkaTools.Constants.Buildings.TAVERN);
                    if (tavern) {
                        tavernLink.toCityView(city, IkaTools.Constants.Buildings.TAVERN,
                                              { position: tavern.getPosition(), cityId: city.getId() });
                    }
                    if (tavern && consumption !== undefined) {
                        var consumptionPerHour =
                            Math.round(consumption * IkaTools.Constants.Time.SECONDS_PER_HOUR);
                        toolTips.registerSimple(tavernLink.getId(),
                                                makeResourceUseToolTip('/cdn/all/both/resources/icon_%s.png'.format(resourceName),
                                                                       [makeResourceUseTableRow('-', consumptionPerHour)]));
                        consumptionContent =
                            ('<a id="%s" class="imperator_link imperator_tool_tip" ' +
                             'href="javascript:void(0);">%s</a>').format(
                            tavernLink.getId(),
                            IkaTools.Intl.formatInteger(-consumptionPerHour, true));
                    }

                    return ('<td class="resource resource_%s">%s</td>' +
                            '<td class="resource resource_%s resource_change' + blessTdClass + '"' + blessTdAttrs + '>' +
                            '<div class="resource_production">' +
                            '<a id="%s" class="imperator_link imperator_tool_tip" ' +
                            'href="javascript:void(0);">%s</a>' +
                            '</div>' +
                            '<div class="resource_consumption">%s</div>' +
                            '</td>').format(
                        resourceName,
                        currentContent,
                        resourceName,
                        resourceLink.getId(),
                        productionContent,
                        consumptionContent);
                }

                // Calcul Recherche par ville

                function makeResearchCell(city) {
                    var scientists = city.getScientists();
                    var academy = city.getBuildingByType('academy');
                    if (academy) {
                        // ajout de 5% pour simuler La technocratie
                        var research = city.getResearch();
                        var link = new Link('ResearchTableAcademy_%s'.format(city.getId()))
                        .toCityView(city, IkaTools.Constants.Buildings.ACADEMY,
                                    { position: academy.getPosition(), cityId: city.getId() });
                        var maxScientists = IkaTools.Constants.BuildingData[
                            IkaTools.Constants.Buildings.ACADEMY].maxScientists[academy.getLevel()];

                        var percent = scientists / maxScientists * 100;
                        var percentBarId = IkaTools.Utils.nextId('research_percent_bar');


                        toolTips.registerSimple(link.getId(),
                                                makeResourceUseToolTip('skin/layout/bulb-on.png',
                                                                       [makeResourceUseTableRow('+', research)]));
                        toolTips.registerSimple(percentBarId,
                                                ('<table><tbody>' +
                                                 '<tr><td>%s:</td><td>%s</td></tr>' +
                                                 '<tr><td>%s:</td><td>%s</td></tr>' +
                                                 '</tbody></table>').format(
                            localizer.localize('misc','employed'),
                            scientists,
                            localizer.localize('misc','maximum_capacity'),
                            maxScientists));

                        return ('<td class="research">' +
                                '<div>' +
                                '<a id="%s" href="javascript:void(0)" ' +
                                'class="imperator_link imperator_tool_tip">%s</a>' +
                                '</div>' +
                                '<div id ="%s" class="percent_bar imperator_tool_tip percent_bar_desire_filled %s">' +
                                '<div class="percent_bar_active" style="width: %s%;" />' +
                                '</div>' +
                                '</td>').format(
                            link.getId(),
                            IkaTools.Intl.formatInteger(research, true),
                            percentBarId,
                            percent == 100 ? 'percent_bar_filled' : '',
                            percent);
                    }

                    return '<td class="research"></td>';
                }

                //   ICI

                function getPopulationData(city) {
                    var populationData = city.getPopulationData ? (city.getPopulationData() || {}) : {};

                    // --- BLINDAGE anti-NaN / anti-undefined ---
                    var pop = Number(populationData.population);
                    var max = Number(populationData.max);
                    var hap = Number(populationData.happiness);
                    var gro = Number(populationData.growth);

                    if (!isFinite(pop)) pop = 0;
                    if (!isFinite(max)) max = 0;
                    if (!isFinite(hap)) hap = 0;
                    if (!isFinite(gro)) gro = 0;

                    populationData.population = pop;
                    populationData.max = max;
                    populationData.happiness = hap;
                    populationData.growth = gro;

                    var icon = 'neutral';

                    // 1) humeur réelle si dispo
                    var mood = city._imperatorMood;
                    if (mood) {
                        if (mood === "happy") icon = "happy";
                        else if (mood === "ecstatic") icon = "ecstatic";
                        else if (mood === "sad") icon = "sad";
                        else if (mood === "outraged" || mood === "angry") icon = "outraged";
                        else icon = "neutral";
                    } else {
                        // 2) fallback via happinessScore si dispo, sinon calcul approximatif
                        var h = city.happinessScore != null ? city.happinessScore : populationData.happiness;
                        if (h < -50) icon = 'outraged';
                        else if (h < -0.5) icon = 'sad';
                        else if (h > 300) icon = 'ecstatic';
                        else if (h > 50) icon = 'happy';
                        else icon = 'neutral';
                    }

                    // % sécurisé
                    var percent = (populationData.max > 0)
                    ? (populationData.population / populationData.max * 100)
                    : 0;
                    if (!isFinite(percent)) percent = 0;

                    return $.extend({
                        icon: "/cdn/all/both/smilies/%s_x25.png".format(icon),
                        percent: percent,
                        percentClass: percent == 100 ? 'percent_bar_filled' : '',
                        happinessClass: percent == 100 && populationData.happiness >= 60
                        && city.getTavernWineLevel && city.getTavernWineLevel() > 0
                        ? 'imperator_warning' : '',
                    }, populationData);
                }

                //   ICI

               // v2.18 : places libres dans le musée (0 si complet ou pas de musée)
                function getMuseumGap(city) {
                    var museum = city.getBuildingByType(IkaTools.Constants.Buildings.MUSEUM);
                    var level = museum ? Math.round(Number(museum.getLevel())) || 0 : 0;
                    var goods = Math.round(Number(city.getCulturalGoods())) || 0;
                    return level > 0 ? Math.max(0, level - goods) : 0;
                }


                function makePopulationCells(city) {
                    var populationData = getPopulationData(city);
                    if (!populationData.population) {
                        return ('<td class="population">%s</td>' +
                                '<td class="population_growth_icon"></td>' +
                                '<td class="population_growth"/>').format(
                            IkaTools.Intl.formatInteger(populationData.population));
                    }

                    var updateable = updateables.create(
                        IkaTools.Utils.nextId('population_current_'),
                        IkaTools.Utils.nextId('population_current_percent_bar_'),
                        IkaTools.Utils.nextId('population_current_percent_bar_active_'),
                        IkaTools.Utils.nextId('population_growth_icon_'),
                        IkaTools.Utils.nextId('population_growth_'));

                    updateable.registerTickerUpdate(
                        function(population, percentBar, activeBar, icon, growth) {
                            var populationData = getPopulationData(city);
                            population.html(IkaTools.Intl.formatInteger(
                                Math.floor(populationData.population)));
                            percentBar.removeClass('percent_bar_filled');
                            percentBar.addClass(populationData.percentClass);
                            activeBar.css('width', '%s%'.format(populationData.percent));
                            icon.attr('src', populationData.icon);
                            var museumGap = getMuseumGap(city);
                            icon.parent()
                                .toggleClass('imp_museum_incomplete', museumGap > 0)
                                .attr('data-imp-gap', museumGap > 0 ? museumGap : null);
                            growth.removeClass('imperator_warning');
                            growth.addClass(populationData.happinessClass);
                            growth.html(
                                IkaTools.Intl.formatDecimal(populationData.growth, 2, true));
                        });

                    toolTips.registerRefreshable(updateable.getId(3), function() {
                        var data = city.getPopulationData();
                        var tavern = city.getBuildingByType(IkaTools.Constants.Buildings.TAVERN);
                        var museum = city.getBuildingByType(IkaTools.Constants.Buildings.MUSEUM);

                        var culturalGoods = city.getCulturalGoods();
                        var tavernWineLevel = city.getTavernWineLevel();

                                                var museumGap = getMuseumGap(city);
                        var cgStyle = museumGap > 0 ? ' style="color:#C0392B;font-weight:bold"' : '';
                        var cgNote  = museumGap > 0 ? ' (%s libre%s)'.format(museumGap, museumGap > 1 ? 's' : '') : '';

                        return ('<table>' +
                                '<tbody>' +
                                '<tr><td>%s:</td><td>%s</td></tr>' +
                                '<tr' + cgStyle + '><td>%s:</td><td>%s/%s' + cgNote + '</td></tr>' +
                                '<tr><td>%s:</td><td>%s/%s</td></tr>' +
                                '</tbody>' +
                                '</table>').format(
                            localizer.localize('misc','satisfaction'),
                            IkaTools.Intl.formatInteger(city.happinessScore != null ? city.happinessScore : data.happiness, true),
                            localizer.localize('misc','cultural_goods'),
                            IkaTools.Intl.formatInteger(culturalGoods),
                            IkaTools.Intl.formatInteger(museum ? museum.getLevel() : 0),
                            localizer.localize('misc','tavern_wine_serving_level'),
                            IkaTools.Intl.formatInteger(tavernWineLevel),
                            IkaTools.Intl.formatInteger(tavern ? tavern.getLevel() : 0));
                    });

                    toolTips.registerRefreshable(updateable.getId(4), function() {
                        var data = city.getPopulationData();
                        function growthIn(hours) {
                            var growth = data.happiness * ( 1 - Math.pow(Math.E, -hours / 50));
                            if (growth + data.population > data.max) {
                                growth = data.max - data.population;
                            }
                            return growth;
                        }

                        return makeResourceUseToolTip(
                            data.happiness >= 0 ? '/cdn/all/both/icons/growth_positive.png'
                            : '/cdn/all/both/icons/growth_negative.png',
                            [makeResourceUseTableRowRaw(data.happiness >= 0 ? '+' : '-',
                                                        IkaTools.Intl.formatDecimal(growthIn(1), 2),
                                                        IkaTools.Intl.formatDecimal(growthIn(24), 2),
                                                        IkaTools.Intl.formatDecimal(growthIn(168), 2))]);
                    });

                    toolTips.registerRefreshable(updateable.getId(1), function() {
                        var data = city.getPopulationData();
                        var timeToFull = Number.POSITIVE_INFINITY;

                        if (data.population == data.max) {
                            timeToFull = 0;
                        } else if (data.population + data.happiness > data.max) {
                            var finalHappiness = data.population + data.happiness - data.max;
                            timeToFull = (Math.log(data.happiness) - Math.log(finalHappiness)) *
                                50* IkaTools.Constants.Time.MILLIS_PER_HOUR;
                        }

                        return ('<table>' +
                                '<tbody>' +
                                '<tr><td>%s:</td><td>%s</td></tr>' +
                                '<tr><td>%s:</td><td>%s</td></tr>' +
                                '<tbody>' +
                                '<table>').format(
                            localizer.localize('misc','maximum_capacity'),
                            IkaTools.Intl.formatInteger(data.max),
                            localizer.localize('misc','time_to_full'),
                            IkaTools.Intl.formatRemainingTime(timeToFull,
                                                              localizer.localize('misc','full')));
                    });

                    return ('<td class="population">' +
                            '<div id="%s">%s</div>' +
                            '<div id="%s" ' +
                            'class="percent_bar percent_bar_desire_filled imperator_tool_tip %s">' +
                            '<div id="%s"class="percent_bar_active" style="width: %s%;" />' +
                            '</div>' +
                            '</td>' +
                            '<td class="population_growth_icon nowrap">' +
                            '<img id="%s" class="imperator_tool_tip" src="%s" />' +
                            '</td>'+
                            '<td class="population_growth %s">' +
                            '<span id="%s" class="imperator_tool_tip">%s</span>' +
                            '</td>'
                           ).format(
                        updateable.getId(0),
                        IkaTools.Intl.formatInteger(Math.floor(populationData.population)),
                        updateable.getId(1),
                        populationData.percentClass,
                        updateable.getId(2),
                        populationData.percent,
                        updateable.getId(3),
                        populationData.icon,
                        populationData.happinessClass,
                        updateable.getId(4),
                        IkaTools.Intl.formatDecimal(populationData.growth, 2, true));
                }

                function makeRow(movements, city) {
                    var transportLink = new Link('TransportGoods_%s'.format(city.getId())).toLocalView(
                        IkaTools.Constants.View.TRANSPORT,
                        {
                            templateView: IkaTools.Constants.View.CITY_DETAIL,
                            destinationCityId: city.getId(),
                        },
                        function() {
                            var go = !IkaTools.View.isActiveCity(city) &&
                                IkaTools.View.getCurrentCity().isOwn();
                            if (go) {
                                openResourcesTabOnTransportClose = true;
                            }
                            return go;
                        });
                    var cityLink = new Link('ResourceTabToTownHall_%s'.format(city.getId()))
                    .toCityView(city, IkaTools.Constants.View.TOWN_HALL,
                                { position: 0, cityId: city.getId() });


                    var rowUpdateable = updateables.create('ResourceTableRow_%s'.format(city.getId()))
                    .registerUpdate('cityChanged',
                                    function(element) {
                        if (IkaTools.View.isActiveCity(city)) {
                            element.addClass('current');
                        } else {
                            element.removeClass('current');
                        }
                    });

                    return ('<tr id="%s" class="%s">' +
                            '%s' +
                            '<td class="action_points">%s</td>' +
                            '<td class="actions">' +
                            '<a id="%s" class="imperator_link to_town_hall" ' +
                            'title="%s" href="javascript:void(0);"/>' +
                            '<a id="%s" class="imperator_link transport_goods" ' +
                            'title="%s" href="javascript:void(0);"/>' +
                            '</td>' +
                            '%s' +
                            '%s' +
                            '%s%s%s%s%s' +
                            '</tr>'
                           ).format(
                        rowUpdateable.getId(0),
                        IkaTools.View.isActiveCity(city) ? 'current' : '',
                        makeCityNameCells('resources', city),
                        IkaTools.Intl.formatInteger(city.getActionPoints()),
                        cityLink.getId(),
                        localizer.localize('actions','to_town_hall'),
                        transportLink.getId(),
                        localizer.localize('actions','transport_goods'),
                        makePopulationCells(city),
                        makeResearchCell(city),
                        makeResourceCells(movements, city, IkaTools.Constants.Resources.WOOD),
                        makeResourceCells(movements, city, IkaTools.Constants.Resources.WINE),
                        makeResourceCells(movements, city, IkaTools.Constants.Resources.MARBLE),
                        makeResourceCells(movements, city, IkaTools.Constants.Resources.GLASS),
                        makeResourceCells(movements, city, IkaTools.Constants.Resources.SULFUR));
                }

                function makeTotalsRow(cities) {
                    function makeResourceCells(cities, resourceName) {
                        var currentUpdateable =
                            updateables.create(IkaTools.Utils.nextId('resource_current_total'));

                        function makeCurrentContent() {
                            var total = 0;

                            $.each(cities, function(index, city) {
                                var resource = city.getResource(resourceName);
                                total += resource.getCurrent() || 0;
                            });
                            return IkaTools.Intl.formatInteger(total);
                        }

                        currentUpdateable.registerTickerUpdate(function(element) {
                            element.html(makeCurrentContent());
                        });

                        var production = 0;
                        var consumption = 0;

                        $.each(cities, function(index, city) {
                            var resource = city.getResource(resourceName);
                            production += resource.getProduction() || 0;
                            consumption += resource.getConsumption() || 0;
                        });

                        var rows = [makeResourceUseTableRow('+',
                                                            production * IkaTools.Constants.Time.SECONDS_PER_HOUR)];
                        var footer = null;
                        if (consumption) {
                            rows.push(makeResourceUseTableRow('-',
                                                              consumption * IkaTools.Constants.Time.SECONDS_PER_HOUR));
                            footer = [makeResourceUseTableRow('&sum;',
                                                              (production - consumption) * IkaTools.Constants.Time.SECONDS_PER_HOUR)];
                        }

                        toolTips.registerSimple('ResourceProductionTotal_' + resourceName,
                                                makeResourceUseToolTip(
                            '/cdn/all/both/resources/icon_%s.png'.format(resourceName), rows, footer));

                        return ('<td><span id="%s">%s</span></td>' +
                                '<td id="ResourceProductionTotal_%s" class="imperator_tool_tip">' +
                                '<div class="resource_production">%s</div>' +
                                '<div class="resource_consumption">%s</div>' +
                                '</td>').format(
                            currentUpdateable.getId(0),
                            makeCurrentContent(),
                            resourceName,
                            IkaTools.Intl.formatInteger(
                                production * IkaTools.Constants.Time.SECONDS_PER_HOUR, true),
                            consumption ? IkaTools.Intl.formatInteger(
                                -consumption * IkaTools.Constants.Time.SECONDS_PER_HOUR) : '');
                    }

                    function makeResearchCell(cities) {
                        var total = 0;
                        var culturalGoods = 0;
                        var isDemocracy = IkaTools.Constants.Government.DEMOCRACY ==
                            IkaTools.EmpireData.getCivilizationData().getGovernment();

                        $.each(cities, function(index, city) {
                            total += city.getResearch() || 0;
                            if (isDemocracy) {
                                culturalGoods += city.getCulturalGoods();
                            }
                        });

                        var rows = [makeResourceUseTableRow('+', total)];
                        var footer = undefined;
                        if (isDemocracy) {
                            rows.push(makeResourceUseTableRow(
                                '<img src="/cdn/all/both/museum/icon32_culturalgood.png" height="10"/>', culturalGoods));
                            footer = [makeResourceUseTableRow('&sum;', total + culturalGoods)];
                        }

                        // Total des recherches
                        toolTips.registerSimple('ResearchTotal',
                                                makeResourceUseToolTip(
                            'skin/layout/bulb-on.png', rows, footer));

                        let formattedTotal = Math.floor(total + culturalGoods).toLocaleString();
                        return '<td id="ResearchTotal" class="research imperator_tool_tip">' + formattedTotal + '</td>';


                        //      ancienne ligne pour afficher le total des recherches
                        //      return ('<td id="ResearchTotal" class="research imperator_tool_tip">%s</td>')
                        //     .format(IkaTools.Intl.formatInteger(total + culturalGoods, true));
                    }

                    function makePopulationCells(cities) {
                        function getData() {
                            var population = 0;
                            var growth = 0;

                            $.each(cities, function(index, city) {
                                var d = city.getPopulationData() || {};

                                var p = Number(d.population);
                                if (isFinite(p)) population += p;

                                var g = Number(d.growth);
                                if (isFinite(g)) growth += g;
                            });

                            return {
                                population: population,
                                growth: growth,
                            };
                        }

                        var updateable = updateables.create('population_total', 'population_growth_total');

                        updateable.registerTickerUpdate(function(populationCell, growthCell) {
                            var data = getData();
                            populationCell.html(IkaTools.Intl.formatInteger(data.population));
                            growthCell.html(IkaTools.Intl.formatDecimal(data.growth, 2, true));
                        });

                        var data = getData();
                        return ('<td id="%s" class="population">%s</td>' +
                                '<td/>' +
                                '<td id="%s" class="population_growth">%s</td>').format(
                            updateable.getId(0),
                            IkaTools.Intl.formatInteger(data.population),
                            updateable.getId(1),
                            IkaTools.Intl.formatDecimal(data.growth, 2, true));
                    }

                    return ('<tr><td colspan="4" class="totals_sigma_cell"/>' +
                            '%s%s%s%s%s%s%s</tr>').format(
                        makePopulationCells(cities),
                        makeResearchCell(cities),
                        makeResourceCells(cities, IkaTools.Constants.Resources.WOOD),
                        makeResourceCells(cities, IkaTools.Constants.Resources.WINE),
                        makeResourceCells(cities, IkaTools.Constants.Resources.MARBLE),
                        makeResourceCells(cities, IkaTools.Constants.Resources.GLASS),
                        makeResourceCells(cities, IkaTools.Constants.Resources.SULFUR));
                }

                function makeResourceColGroup(resource) {
                    return ('<colgroup class="resource resource_%s">' +
                            '<col class="resource_on_hand resource_%s"/>' +
                            '<col class="resource_use resource_%s"/>' +
                            '</colgroup>').format(
                        resource, resource, resource);
                }

                function makeCols() {
                    return ('%s' +
                            '<colgroup class="actions">' +
                            '<col class="actions"/>' +
                            '</colgroup>' +
                            '<colgroup class="population">' +
                            '<col class="population"/>' +
                            '<col class="population_growth_icon"/>' +
                            '<col class="population_growth"/>' +
                            '</colgroup>' +
                            '<colgroup class="research">' +
                            '<col class="research"/>' +
                            '</colgroup>' +
                            //'<colgroup class="financial">' +
                            //  '<col class="financial"/>' +
                            //'</colgroup>' +
                            '%s%s%s%s%s')
                        .format(makeCityNameColGroup('<col class="action_points">'),
                                makeResourceColGroup('wood'),
                                makeResourceColGroup('wine'),
                                makeResourceColGroup('marble'),
                                makeResourceColGroup('crystal'),
                                makeResourceColGroup('sulfur'));
                }

                function makeTableHead() {
                    toolTips.registerSimple('ResourcePopulationHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('misc','population')));
                    toolTips.registerSimple('ResourcePopulationGrowthHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('misc','population_growth')));
                    toolTips.registerSimple('ResourceResearchHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('misc','research')));
                    toolTips.registerSimple('ResourceTableActionPoints',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('misc','action_points')));
                    toolTips.registerSimple('ResourceWoodHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('resources','wood')));
                    toolTips.registerSimple('ResourceWineHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('resources','wine')));
                    toolTips.registerSimple('ResourceMarbleHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('resources','marble')));
                    toolTips.registerSimple('ResourceCrystalHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('resources','glass')));
                    toolTips.registerSimple('ResourceSulfurHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('resources','sulfur')));
                    return ('<thead>' +
                            '<tr>%s' +
                            '<th id="ResourceTableActionPoints" ' +
                            'class="action_points imperator_tool_tip">%s</th>' +
                            '<th class="actions">%s</th>' +
                            '<th colspan="1" id="ResourcePopulationHeader" ' +
                            'class="population imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourcePopulationGrowthHeader" ' +
                            'class="population_growth imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="ResourceResearchHeader" ' +
                            'class="research imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourceWoodHeader" ' +
                            'class="resource resource_wood imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourceWineHeader" ' +
                            'class="resource resource_wine imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourceMarbleHeader" ' +
                            'class="resource resource_marble imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourceCrystalHeader" ' +
                            'class="resource resource_crystal imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourceSulfurHeader" ' +
                            'class="resource resource_sulfur imperator_tool_tip">%s</th>' +
                            '</tr>' +
                            '</thead>').format(
                        makeCityNameHeaderCells(),
                        localizer.localize('misc','action_points'),
                        localizer.localize('misc','actions'),
                        localizer.localize('misc','population'),
                        localizer.localize('misc','population_growth'),
                        localizer.localize('misc','research'),
                        localizer.localize('resources','wood'),
                        localizer.localize('resources','wine'),
                        localizer.localize('resources','marble'),
                        localizer.localize('resources','glass'),
                        localizer.localize('resources','sulfur'));

                }

                var cities = IkaTools.EmpireData.getOwnCities();
                var movements = IkaTools.EmpireData.getCivilizationData().getMovements();
                var blessCaption = '';
                try { blessCaption = impBlessMakeCaption(); } catch (eCap) { blessCaption = ''; } // v2.12
                return blessCaption + '%s%s<tbody>%s</tbody><tfoot>%s</tfoot>'.format(
                    makeCols(),
                    makeTableHead(),
                    $.map(cities, makeRow.bind(null, movements)).join(''),
                    makeTotalsRow(cities));
            }

            var tab = new Tab('resources', localizer.localize('misc','resources'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewResourceTable"/>' +
                '</div>'),
                              'ImperatorOverviewResourceTable',
                              function() {
                IkaTools.EmpireData.registerResourcesChangedHandler(function(changes) {
                    tab.maybeRedraw(true);
                });
                IkaTools.EmpireData.registerBuildingsChangedHandler(function(changes) {
                    var redraw = false;
                    $.each(changes, function(index, change) {
                        var type = change.building.getType();
                        if (type == IkaTools.Constants.Buildings.TAVERN ||
                            type == IkaTools.Constants.Buildings.MUSEUM ||
                            type == IkaTools.Constants.Buildings.ACADEMY ||
                            type == IkaTools.Constants.Buildings.TOWN_HALL) {
                            redraw = true;
                        }
                    });
                    tab.maybeRedraw(redraw);
                });
                IkaTools.EmpireData.registerCivilizationDataChangedHandler(function(changes) {
                    tab.maybeRedraw(true);
                });
                IkaTools.EmpireData.registerMovementsChangedHandler(function(changes) {
                    var redraw = false;
                    $.each(changes, function(index, change) {
                        var mission = change.movement.mission;
                        if (mission == IkaTools.Constants.Movements.Mission.TRANSPORT ||
                            mission == IkaTools.Constants.Movements.Mission.PLUNDER) {
                            redraw = true;
                        }
                    });
                    tab.maybeRedraw(redraw);
                });
                // v2.12 : affectations / bienveillances relues au Sanctuaire
                IkaTools.EmpireData.registerShrineChangedHandler(function() {
                    tab.maybeRedraw(true);
                });
                            },
                              makeTableContent);

            return tab.getTab();

        }

        // ============================================================
        // v2.07 : helpers du bloc financier du Dashboard
        // ============================================================
        // v2.12 : dérivées de IMP_GODS (source unique des couleurs des dieux)
        var GOD_COLORS = {}, GOD_BG = {};
        $.each(IMP_GODS, function(id, g) { GOD_COLORS[g.name] = g.color; GOD_BG[g.name] = g.bg; });
        var _IMP_HORIZONS = {
            '1j':   { h:24,  end:'24h' },
            '1sem': { h:168, end:'7j'  },
            '1mois':{ h:720, end:'30j' }
        };
        var _impDashHorizon    = '1j';
        var _impDashGoldCache  = { current:0, net:0, hasData:false };
        var _impDashEventsBound = false;

        function _impFmtNum(n) {
            if (n == null || isNaN(n)) return '?';
            var s = n < 0 ? '-' : '', a = Math.abs(n);
            if (a >= 1e9) return s + (a/1e9).toFixed(1) + 'G';
            if (a >= 1e6) return s + (a/1e6).toFixed(1) + 'M';
            if (a >= 1e4) return s + Math.round(a/1e3) + 'k';
            return s + Math.round(a).toString();
        }
        function _impFmtS(n) {
            if (!isFinite(n) || n === 0) return '0';
            return (n > 0 ? '+' : '') + _impFmtNum(n);
        }

        // Construit le SVG de la courbe prospective (projection linéaire de l'or).
        function _impBuildGoldChartSvg(current, net, key) {
            var H = _IMP_HORIZONS[key] || _IMP_HORIZONS['1j'];
            var hours = H.h;
            var W = 328, Hgt = 104, padL = 6, padR = 6, padT = 10, padB = 18;
            var n = 48, pts = [], i, t, v;
            for (i = 0; i <= n; i++) {
                t = hours * i / n;
                v = current + net * t;
                if (v < 0) v = 0;
                pts.push({ t:t, v:v });
            }
            var vmin = Infinity, vmax = -Infinity;
            for (i = 0; i < pts.length; i++) { if (pts[i].v < vmin) vmin = pts[i].v; if (pts[i].v > vmax) vmax = pts[i].v; }
            if (vmax === vmin) vmax = vmin + 1;
            var pad = (vmax - vmin) * 0.10; vmin -= pad; vmax += pad; if (vmin < 0) vmin = 0;
            var innerW = W - padL - padR, innerH = Hgt - padT - padB;
            function X(tt){ return padL + innerW * (tt / hours); }
            function Y(vv){ return padT + innerH * (1 - (vv - vmin) / (vmax - vmin)); }

            var endV = current + net * hours; if (endV < 0) endV = 0;
            var bankrupt = net < 0 && (current + net * hours <= 0);
            var color = net > 0 ? '#4caf50' : net < 0 ? (bankrupt ? '#e05555' : '#e0a020') : '#888';

            var line = '', area = '';
            for (i = 0; i < pts.length; i++) {
                var px = X(pts[i].t).toFixed(1), py = Y(pts[i].v).toFixed(1);
                line += (i ? ' L ' : 'M ') + px + ' ' + py;
            }
            area = line + ' L ' + X(hours).toFixed(1) + ' ' + (padT + innerH).toFixed(1) +
                          ' L ' + X(0).toFixed(1)     + ' ' + (padT + innerH).toFixed(1) + ' Z';

            // bandes de survol (tooltip natif via <title>)
            var bands = '', nb = 12, gid = 'impGrad_' + key;
            for (i = 0; i < nb; i++) {
                var t0 = hours * i / nb, t1 = hours * (i + 1) / nb;
                var bx = X(t0), bw = X(t1) - X(t0);
                var tm = (t0 + t1) / 2, vm = current + net * tm; if (vm < 0) vm = 0;
                var lbl = (tm < 24 ? Math.round(tm) + 'h' : Math.round(tm/24) + 'j') + ' \u2192 ' + _impFmtNum(vm) + ' or';
                bands += '<rect x="' + bx.toFixed(1) + '" y="' + padT + '" width="' + bw.toFixed(1) + '" height="' + innerH +
                         '" fill="transparent"><title>' + lbl + '</title></rect>';
            }

            return '' +
            '<svg viewBox="0 0 ' + W + ' ' + Hgt + '" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">' +
                '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
                    '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.22"/>' +
                    '<stop offset="100%" stop-color="' + color + '" stop-opacity="0.02"/>' +
                '</linearGradient></defs>' +
                '<path d="' + area + '" fill="url(#' + gid + ')" stroke="none"/>' +
                '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linejoin="round"/>' +
                '<circle cx="' + X(0).toFixed(1) + '" cy="' + Y(pts[0].v).toFixed(1) + '" r="2.4" fill="' + color + '"/>' +
                '<circle cx="' + X(hours).toFixed(1) + '" cy="' + Y(endV).toFixed(1) + '" r="2.4" fill="' + color + '"/>' +
                '<text x="' + padL + '" y="' + (Hgt - 5) + '" font-size="9" fill="#999">Maintenant</text>' +
                '<text x="' + (W - padR) + '" y="' + (Hgt - 5) + '" font-size="9" fill="#999" text-anchor="end">' + H.end + '</text>' +
                bands +
            '</svg>';
        }

        // Le contenu complet du panneau graphique (boutons + courbe + pied).
        function _impGraphInner(current, net, key, hasData) {
            function btn(k, label) {
                var active = (k === key);
                return '<a href="javascript:void(0)" class="imp-fin-horizon" data-h="' + k + '" style="' +
                    'display:inline-block;padding:4px 12px;margin:0;font-size:11px;font-weight:500;cursor:pointer;' +
                    'border:0.5px solid rgba(0,0,0,0.15);border-radius:6px;text-decoration:none;' +
                    (active ? 'background:#4a5568;color:#fff;border-color:#4a5568' : 'background:#fff;color:#666') + '">' +
                    label + '</a>';
            }
            var header =
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em">\u2611 \u00c9volution prospective</div>' +
                    '<div style="display:flex;gap:6px">' + btn('1j','1 jour') + btn('1sem','1 semaine') + btn('1mois','1 mois') + '</div>' +
                '</div>';
            if (!hasData) {
                return header +
                    '<div style="padding:20px 8px;text-align:center;font-size:11px;color:#bbb">' +
                    'Donn\u00e9es d\'or indisponibles \u2014 recharge une page ou clique sur \u00ab Mettre \u00e0 jour \u00bb.</div>';
            }
            var H = _IMP_HORIZONS[key] || _IMP_HORIZONS['1j'];
            var gain = net * H.h, endV = Math.max(0, current + gain);
            var svg = _impBuildGoldChartSvg(current, net, key);
            var footColor = net > 0 ? '#4caf50' : net < 0 ? '#e05555' : '#888';
            var foot =
                '<div style="display:flex;justify-content:space-between;font-size:10px;color:#999;margin-top:4px">' +
                    '<span>Maintenant \u00b7 ' + _impFmtNum(current) + '</span>' +
                    '<span style="color:' + footColor + '">' + _impFmtS(gain) + ' \u2192 ' + _impFmtNum(endV) + '</span>' +
                '</div>';
            return header + '<div>' + svg + '</div>' + foot;
        }

        // Liaison unique des événements (survit aux redraws via délégation).
        function _impBindDashboardEventsOnce() {
            if (_impDashEventsBound) return;
            _impDashEventsBound = true;
            $(document).on('click', '.imp-fin-horizon', function() {
                var key = $(this).attr('data-h');
                if (!key || !_IMP_HORIZONS[key]) return;
                _impDashHorizon = key;
                var g = _impDashGoldCache;
                $('#imp-fin-graph').html(_impGraphInner(g.current, g.net, key, g.hasData));
            });
            $(document).on('click', '#imp-fin-refresh', function() {
                var $b = $(this);
                if ($b.data('busy')) return;
                $b.data('busy', 1).css('opacity', 0.5);
                var $st = $('#imp-fin-refresh-status');
                $st.text('mise \u00e0 jour\u2026');
                try {
                    IkaTools.EmpireData.refreshFinancesAndShrine(
                        function(i, total, name) { $st.text(i + '/' + total + ' \u00b7 ' + name); },
                        function() {
                            var d = new Date();
                            $st.text('\u2713 ' + ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2));
                            $b.data('busy', 0).css('opacity', 1);
                        }
                    );
                } catch(e) {
                    $st.text('erreur');
                    $b.data('busy', 0).css('opacity', 1);
                }
            });
        }

        function makeDashboardTab() {
            _impBindDashboardEventsOnce(); // v2.07
            function makeTableContent() {
                var cities  = IkaTools.EmpireData.getOwnCities();
                var civData = IkaTools.EmpireData.getCivilizationData();

                var totalPop = 0, totalResearch = 0;
                var resources  = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                var production = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                var capacity   = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                var wineConsumption = 0;

                $.each(cities, function(i, city) {
                    totalPop      += city.population || 0;
                    totalResearch += city.getResearch() || 0;
                    $.each(['wood','wine','marble','glass','sulfur'], function(j, res) {
                        var r = city.getResource(res);
                        if (r) {
                            resources[res]  += r.getCurrent()    || 0;
                            production[res] += (r.getProduction() || 0) * IkaTools.Constants.Time.SECONDS_PER_HOUR; // v2.20 : /s -> /h
                            if (r.getCapacity) {
                                var cap = r.getCapacity();
                                capacity[res] += (cap && cap.maximum ? cap.maximum : 0);
                            }
                            if (res === 'wine') wineConsumption += Math.abs(r.getConsumption() || 0) * IkaTools.Constants.Time.SECONDS_PER_HOUR; // v2.20 : /h
                        }
                    });
                });

                var wineAutonomy = wineConsumption > 0
                    ? Math.floor(resources.wine / wineConsumption / 24) : 999;

                var transports = 0, militaires = 0;
                $.each(civData.getMovements(), function(id, mv) {
                    if (mv.getMission() === IkaTools.Constants.Movements.Mission.TRANSPORT) transports++;
                    else militaires++;
                });

                var queue = [];
                $.each(cities, function(i, city) {
                    $.each(city.getBuildings(), function(j, b) {
                        var ct = b.getCompletionTime ? b.getCompletionTime() : null;
                        if (ct) {
                            var remaining = ct - IkaTools.View.gameTimeNow();
                            if (remaining > 0) {
                                queue.push({ city: city.getName(), building: b.getType(), level: b.getLevel(), remaining: remaining });
                            }
                        }
                    });
                });
                queue.sort(function(a, b) { return a.remaining - b.remaining; });

                function fmtTime(ms) {
                    var s = Math.floor(ms / 1000);
                    var d = Math.floor(s / 86400); s %= 86400;
                    var h = Math.floor(s / 3600);  s %= 3600;
                    var m = Math.floor(s / 60);
                    if (d > 0) return d + 'j ' + h + 'h';
                    if (h > 0) return h + 'h ' + m + 'm';
                    return m + 'm';
                }

                function fmtNum(n) {
                    if (n == null || isNaN(n)) return '?';
                    if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'G';
                    if (n >= 1000000)    return (n / 1000000).toFixed(1)    + 'M';
                    if (n >= 10000)      return Math.round(n / 1000)        + 'k';
                    return Math.round(n).toString();
                }

                var resColors = { wood:'#c8960c', wine:'#9b5fc0', marble:'#9e9e9e', glass:'#26c6da', sulfur:'#d4c020' };
                var resNames  = { wood:'Bois', wine:'Vin', marble:'Marbre', glass:'Cristal', sulfur:'Soufre' };

                function resBar(res) {
                    var pct = capacity[res] > 0 ? Math.min(100, Math.round(resources[res] / capacity[res] * 100)) : 0;
                    return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">' +
                        '<div style="width:10px;height:10px;border-radius:2px;flex-shrink:0;background:' + resColors[res] + '"></div>' +
                        '<div style="font-size:11px;color:#888;width:48px">' + resNames[res] + '</div>' +
                        '<div style="width:120px;height:5px;background:rgba(0,0,0,0.12);border-radius:3px;overflow:hidden">' +
                            '<div style="width:' + pct + '%;height:100%;background:' + resColors[res] + ';border-radius:3px"></div>' +
                        '</div>' +
                        '<div style="font-size:11px;width:60px;text-align:right">' + fmtNum(resources[res]) + '</div>' +
                        '<div style="font-size:11px;color:#888;width:56px;text-align:right">+' + fmtNum(production[res]) + '/h</div>' +
                    '</div>';
                }

                function cityRow(city) {
                    var pop = city.population || 0;
                    var sat = city.happinessScore != null ? city.happinessScore : '?';
                    var res = city.getResearch() || 0;
                    var satBad  = sat !== '?' && sat < 0;
                    var satWarn = sat !== '?' && sat >= 0 && sat < 50;
                    var satOk   = sat !== '?' && sat >= 50;
                    var satColor = satBad ? '#e05555' : satWarn ? '#e0a020' : satOk ? '#4caf50' : '#888';
                    var satBg    = satBad ? 'rgba(220,80,80,0.15)' : satWarn ? 'rgba(220,160,30,0.15)' : satOk ? 'rgba(60,180,60,0.15)' : 'rgba(0,0,0,0.08)';
                    var satLabel = satBad ? '! ' : satWarn ? '⚠ ' : satOk ? '✓ ' : '';
                    // Net or / h par ville
                    var hasGoldCity = city.cityGoldNetUpdated > 0;
                    // Fallback: si finances non ouvertes, montrer juste le coût scientifiques connu
                    var goldNetCity = hasGoldCity ? (city.cityGoldNet || 0) : null;
                    var sciCost = city.getScientists ? -(city.getScientists() || 0) * (civData.hasResearched(IkaTools.Constants.Research.Science.LETTER_CHUTE) ? 3 : 6) : 0;
                    var goldCityColor = goldNetCity !== null
                        ? (goldNetCity > 0 ? '#4caf50' : goldNetCity < 0 ? '#e05555' : '#888')
                        : '#bbb';
                    var goldCityLabel = goldNetCity !== null
                        ? (goldNetCity > 0 ? '+' : '') + fmtNum(goldNetCity)
                        : (sciCost !== 0 ? '<span title="Sci. seulement">' + fmtNum(sciCost) + '*</span>' : '—');
                    // v2.07 : divinité vénérée par la ville
                    var godName = city.worshipGodName || null;
                    var godCell;
                    if (godName) {
                        var gc = GOD_COLORS[godName] || '#888';
                        var gbg = GOD_BG[godName] || 'rgba(0,0,0,0.06)';
                        godCell = '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:' + gbg + ';color:' + gc + ';font-weight:500">' + godName + '</span>';
                    } else {
                        godCell = '<span style="font-size:11px;color:#bbb">&mdash;</span>';
                    }
                    return '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.07)">' +
                        '<td style="padding:4px 6px;font-size:11px;font-weight:500">' + __impH(city.getName()) + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right">' + fmtNum(pop) + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right">' + res + '</td>' +
                        '<td style="padding:4px 6px;text-align:center">' +
                            '<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:' + satBg + ';color:' + satColor + '">' + satLabel + sat + '</span>' +
                        '</td>' +
                        '<td style="padding:4px 6px;text-align:center">' + godCell + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right;color:' + goldCityColor + '">' + goldCityLabel + '</td>' +
                    '</tr>';
                }

                function queueRow(q) {
                    return '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.07)">' +
                        '<td style="padding:4px 6px;font-size:11px;color:#888">' + __impH(q.city) + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px">' + (localizer.localize('buildings', q.building) || q.building) + ' niv ' + q.level + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right;color:#888">' + fmtTime(q.remaining) + '</td>' +
                    '</tr>';
                }

                var wineColor = wineAutonomy < 7 ? '#e05555' : wineAutonomy < 30 ? '#e0a020' : '#4caf50';
                var wineLabel = wineAutonomy >= 999 ? '∞' : wineAutonomy + 'j';

                // Or
                var gd = civData.getGoldData();
                var goldCurrent = gd.current || 0;
                var goldNet     = gd.net     || 0;
                var goldRev     = gd.revenue    || 0;
                var goldGods    = gd.gods       || 0;
                var goldSci     = gd.scientists || 0;
                var goldUp      = gd.upkeep     || 0;
                var goldPrem    = gd.premium    || 0;
                var hasIncome   = gd.incomeUpdated  > 0;
                var hasGold     = gd.currentUpdated > 0;
                var goldColor   = goldNet > 0 ? '#4caf50' : goldNet < 0 ? '#e05555' : '#888';
                var goldProj1h  = goldNet;
                var goldProj1j  = goldNet * 24;
                var goldProj7j  = goldNet * 24 * 7;
                var goldAuto    = '';
                if (goldNet < 0 && goldCurrent > 0) {
                    var dl = goldCurrent / Math.abs(goldNet) / 24;
                    goldAuto = dl < 1 ? Math.round(dl*24)+'h avant faillite' : Math.floor(dl)+'j avant faillite';
                } else if (goldNet > 0) { goldAuto = 'surplus'; }
                function fmtS(n) {
                    if (!isFinite(n) || n === 0) return '0';
                    return (n > 0 ? '+' : '') + fmtNum(n);
                }
                function gRow(lbl, val) {
                    var c = val > 0 ? '#4caf50' : val < 0 ? '#e05555' : '#888';
                    return '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.05)">'+
                        '<td style="padding:3px 8px;font-size:11px;color:#555">' + lbl + '</td>'+
                        '<td style="padding:3px 8px;font-size:11px;text-align:right;color:'+c+'">'+fmtS(val)+'</td>'+
                    '</tr>';
                }

                // === v2.07 : valeurs dérivées du bloc financier ===
                var revenuBrut = goldRev + goldGods;                 // pop. + dieux
                var depenses   = goldSci + goldUp;                    // scientifiques + entretien (négatifs)
                var goldOr7j   = Math.max(0, goldCurrent + goldProj7j);
                // Répartitions (en %)
                var popVsGods  = revenuBrut !== 0 ? Math.round(goldRev / revenuBrut * 100) : 0;
                var pctSci     = Math.abs(depenses) > 0 ? Math.round(Math.abs(goldSci) / Math.abs(depenses) * 100) : 0;
                var pctUp      = Math.abs(depenses) > 0 ? Math.round(Math.abs(goldUp)  / Math.abs(depenses) * 100) : 0;
                // Regroupement des divinités par ville (ordre fixe du jeu)
                var GOD_ORDER = ['Pluton','Théia','Héphaïstos','Pan','Dionysos','Tyché'];
                var godGroups = {};
                $.each(cities, function(i, c) {
                    var g = c && c.worshipGodName;
                    if (g) { (godGroups[g] = godGroups[g] || []).push(c.getName()); }
                });
                var hasGodData = false; for (var _gk in godGroups) { if (godGroups.hasOwnProperty(_gk)) { hasGodData = true; break; } }
                var shrineFavor = (civData.getShrineData ? (civData.getShrineData().favor || 0) : 0);
                // Barre de répartition réutilisable
                function repBar(label, pct, colorL, extra) {
                    var p = Math.max(0, Math.min(100, pct || 0));
                    return '<div style="margin-bottom:6px">' +
                        '<div style="display:flex;justify-content:space-between;font-size:10px;color:#888;margin-bottom:2px">' +
                            '<span>' + label + '</span><span>' + (extra != null ? extra : (p + '%')) + '</span>' +
                        '</div>' +
                        '<div style="height:5px;background:rgba(0,0,0,0.10);border-radius:3px;overflow:hidden">' +
                            '<div style="width:' + p + '%;height:100%;background:' + colorL + ';border-radius:3px"></div>' +
                        '</div>' +
                    '</div>';
                }
                // Petit KPI financier
                function kpi(label, value, color, sub) {
                    return '<div style="background:rgba(0,0,0,0.05);border-radius:6px;padding:8px 10px">' +
                        '<div style="font-size:9px;color:#999;margin-bottom:2px">' + label + '</div>' +
                        '<div style="font-size:15px;font-weight:600;color:' + color + '">' + value + '</div>' +
                        (sub ? '<div style="font-size:9px;color:#aaa;margin-top:1px">' + sub + '</div>' : '') +
                    '</div>';
                }
                function projRow(lbl, val) {
                    return '<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0">' +
                        '<span style="color:#666">' + lbl + '</span><span style="font-weight:500;color:' + goldColor + '">' + val + '</span></div>';
                }
                function th(label, align) {
                    return '<th style="font-size:10px;color:#888;font-weight:400;text-align:' + align + ';padding:2px 6px">' + label + '</th>';
                }
                function godCards() {
                    var out = '<div style="display:flex;flex-wrap:wrap;gap:6px">';
                    $.each(GOD_ORDER, function(i, g) {
                        if (!godGroups[g]) return;
                        var col = GOD_COLORS[g] || '#888', bg = GOD_BG[g] || 'rgba(0,0,0,0.05)';
                        var citiesList = godGroups[g];
                        out += '<div style="flex:1 1 30%;min-width:120px;background:' + bg + ';border:0.5px solid ' + col + '55;border-radius:6px;padding:7px 9px">' +
                            '<div style="font-size:11px;font-weight:600;color:' + col + ';margin-bottom:3px">' + g +
                                ' <span style="font-weight:400;color:#999">(' + citiesList.length + ')</span></div>' +
                            '<div style="font-size:10px;color:#777;line-height:1.5">' + $.map(citiesList, __impH).join('<br>') + '</div>' +
                        '</div>';
                    });
                    out += '</div>';
                    return out;
                }
                function godFooter() {
                    var hasPluton = !!godGroups['Pluton'];
                    var others = [];
                    $.each(['Théia','Héphaïstos','Pan','Dionysos','Tyché'], function(i, g) { if (godGroups[g]) others.push(g); });
                    var parts = [];
                    if (hasPluton) parts.push('Bonus Pluton : <b style="color:#d4a017">' + _impFmtS(goldGods) + ' or/h</b>');
                    if (others.length) parts.push(others.join(' &amp; ') + ' : production ressources');
                    if (!parts.length) return '';
                    return '<div style="font-size:9px;color:#999;margin-top:8px;border-top:0.5px solid rgba(0,0,0,0.08);padding-top:6px">' + parts.join(' \u00b7 ') + '</div>';
                }

                // Mise en cache pour le graphique interactif (toggle 1j/1sem/1mois)
                _impDashGoldCache = { current: goldCurrent, net: goldNet, hasData: (hasIncome || hasGold) };

                var html = '<tbody><tr><td style="padding:10px;border:none">' +

                    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:10px">' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Population</div>' +
                            '<div style="font-size:18px;font-weight:500">' + fmtNum(totalPop) + '</div>' +
                            '<div style="font-size:10px;color:#888">' + cities.length + ' villes</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Recherche / h</div>' +
                            '<div style="font-size:18px;font-weight:500">' + fmtNum(totalResearch) + '</div>' +
                            '<div style="font-size:10px;color:#888">empire total</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Transports actifs</div>' +
                            '<div style="font-size:18px;font-weight:500">' + transports + '</div>' +
                            '<div style="font-size:10px;color:#888">' + militaires + ' militaires</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Autonomie vin</div>' +
                            '<div style="font-size:18px;font-weight:500;color:' + wineColor + '">' + wineLabel + '</div>' +
                            '<div style="font-size:10px;color:#888">stock / conso</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px;border-left:3px solid #d4a017">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Or empire</div>' +
                            '<div style="font-size:18px;font-weight:500">' + (hasGold ? fmtNum(goldCurrent) : '—') + '</div>' +
                            '<div style="font-size:10px;color:' + goldColor + '">' +
                                (hasIncome ? fmtS(goldNet)+'/h' : '<span style="color:#bbb;font-size:9px">ouvrir Finances</span>') +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;align-items:start">' +

                        // ===================== COLONNE GAUCHE : FINANCES =====================
                        '<div style="display:flex;flex-direction:column;gap:10px">' +

                            // En-tête + bouton de mise à jour manuelle
                            '<div style="display:flex;align-items:center;justify-content:space-between">' +
                                '<div style="font-size:10px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.05em">Finances</div>' +
                                '<div style="display:flex;align-items:center;gap:6px">' +
                                    '<span id="imp-fin-refresh-status" style="font-size:10px;color:#aaa"></span>' +
                                    '<a href="javascript:void(0)" id="imp-fin-refresh" title="Recharger finances + sanctuaire en arri\u00e8re-plan" style="font-size:10px;padding:3px 9px;border:0.5px solid rgba(0,0,0,0.15);border-radius:6px;background:#fff;color:#555;text-decoration:none">\u27f3 Mettre \u00e0 jour</a>' +
                                '</div>' +
                            '</div>' +

                            // Alerte contextuelle
                            (goldAuto ?
                                '<div style="border-radius:8px;padding:8px 12px;font-size:11px;font-weight:500;' +
                                    (goldNet < 0 ? 'background:rgba(224,85,85,0.12);border:0.5px solid rgba(224,85,85,0.35);color:#c0392b'
                                                 : 'background:rgba(76,175,80,0.12);border:0.5px solid rgba(76,175,80,0.35);color:#2e7d32') + '">' +
                                    (goldNet < 0 ? '\u26a0 ' + goldAuto : '\u2713 Surplus actif \u00b7 ' + _impFmtS(goldNet) + ' or/h') +
                                '</div>'
                            : '') +

                            // 3 KPIs
                            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
                                kpi('Revenu brut / h', _impFmtS(revenuBrut), '#4caf50', 'pop. + dieux') +
                                kpi('D\u00e9penses / h', _impFmtS(depenses), '#e05555', 'sci. + entretien') +
                                kpi('Solde net / h', _impFmtS(goldNet), goldColor, goldNet > 0 ? 'surplus actif' : (goldNet < 0 ? 'd\u00e9ficit' : '\u00e9quilibre')) +
                            '</div>' +

                            // Détail + Répartition
                            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
                                '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 6px 8px">' +
                                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;padding:0 6px">D\u00e9tail / h</div>' +
                                    '<table style="width:100%;border-collapse:collapse">' +
                                        gRow('Revenu population', goldRev) +
                                        gRow('Dieux (Pluton)', goldGods) +
                                        gRow('Scientifiques', goldSci) +
                                        gRow("Co\u00fbts d'entretien", goldUp) +
                                        '<tr><td style="padding:3px 8px;font-size:11px;color:#555">Bonus premium</td>' +
                                            '<td style="padding:3px 8px;font-size:11px;text-align:right;color:#888">' + (goldPrem ? _impFmtS(goldPrem) : '0 %') + '</td></tr>' +
                                        '<tr style="border-top:1px solid rgba(0,0,0,0.15)">' +
                                            '<td style="padding:5px 8px;font-size:11px;font-weight:700;color:#444">Net / h</td>' +
                                            '<td style="padding:5px 8px;font-size:12px;text-align:right;font-weight:700;color:' + goldColor + '">' + _impFmtS(goldNet) + '</td></tr>' +
                                    '</table>' +
                                '</div>' +
                                '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px 8px">' +
                                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">R\u00e9partition</div>' +
                                    repBar('Pop. vs Dieux', popVsGods, '#7cb342', popVsGods + ' / ' + (100 - popVsGods) + '%') +
                                    repBar('Scientifiques', pctSci, '#e0a020', pctSci + '% d\u00e9p.') +
                                    repBar('Entretien', pctUp, '#e05555', pctUp + '% d\u00e9p.') +
                                    '<div style="margin-top:8px;border-top:0.5px solid rgba(0,0,0,0.08);padding-top:6px">' +
                                        projRow('Dans 24h', _impFmtS(goldProj1j)) +
                                        projRow('Dans 7 j', _impFmtS(goldProj7j)) +
                                        projRow('Or dans 7j', _impFmtNum(goldOr7j)) +
                                    '</div>' +
                                '</div>' +
                            '</div>' +

                            // Sanctuaire divin
                            '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
                                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em">\u26a1 Sanctuaire divin</div>' +
                                    (shrineFavor > 0 ? '<div style="font-size:10px;color:#888">Faveur : <b style="color:#d4a017">' + _impFmtNum(shrineFavor) + '</b></div>' : '') +
                                '</div>' +
                                (hasGodData ? (godCards() + godFooter())
                                            : '<div style="font-size:11px;color:#bbb;padding:4px 0">Ouvre le Sanctuaire divin (ou \u00ab Mettre \u00e0 jour \u00bb) pour charger les divinit\u00e9s par ville.</div>') +
                            '</div>' +

                            // Graphique prospectif interactif
                            '<div id="imp-fin-graph" style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                                _impGraphInner(goldCurrent, goldNet, _impDashHorizon, (hasIncome || hasGold)) +
                            '</div>' +

                        '</div>' +

                        // ===================== COLONNE DROITE : VILLES =====================
                        '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                            '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;text-align:right">Villes</div>' +
                            '<table style="width:100%;border-collapse:collapse">' +
                                '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.12)">' +
                                    th('Ville', 'left') + th('Pop.', 'right') + th('Rech.', 'right') +
                                    th('Satis.', 'center') + th('Dieu', 'center') + th('Or/h', 'right') +
                                '</tr>' +
                                $.map(cities, cityRow).join('') +
                            '</table>' +
                            '<div style="font-size:9px;color:#aaa;margin-top:8px;line-height:1.4">' +
                                '* Or/h ville = estimation scientifiques uniquement.<br>' +
                                'Ouvrir Conseiller Finances (ou \u00ab Mettre \u00e0 jour \u00bb) pour les valeurs r\u00e9elles.' +
                            '</div>' +
                        '</div>' +

                    '</div>' +

                    (queue.length > 0 ?
                        '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                            '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">File de construction (' + queue.length + ')</div>' +
                            '<table style="width:100%;border-collapse:collapse">' +
                                $.map(queue, queueRow).join('') +
                            '</table>' +
                        '</div>'
                    : '') +

                '</td></tr></tbody>';

                return html;
            }

            var tab = new Tab('dashboard', localizer.localize('misc', 'dashboard'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewDashboardTable"/>' +
                '</div>'),
                'ImperatorOverviewDashboardTable',
                function() {
                    IkaTools.EmpireData.registerResourcesChangedHandler(function() {
                        tab.maybeRedraw(true);
                    });
                    IkaTools.EmpireData.registerGoldChangedHandler(function() {
                        tab.maybeRedraw(true);
                    });
                },
                makeTableContent);

            return tab.getTab();
        }

        function makeBuildingsTab() {
            var BUILDING_ORDER = [
                { name: 'growth',
                 buildings: [
                     IkaTools.Constants.Buildings.TOWN_HALL,
                     IkaTools.Constants.Buildings.PALACE,
                     IkaTools.Constants.Buildings.GOVERNORS_RESIDENCE,
                     IkaTools.Constants.Buildings.TAVERN,
                     IkaTools.Constants.Buildings.MUSEUM
                 ] },

                { name: 'research',
                 buildings: [
                     IkaTools.Constants.Buildings.ACADEMY,
                     IkaTools.Constants.Buildings.WORKSHOP,
                     IkaTools.Constants.Buildings.TEMPLE,
                     IkaTools.Constants.Buildings.DIVINE_SANCTUARY,
                     IkaTools.Constants.Buildings.CHRONOS_FORGE
                 ] },

                { name: 'diplomacy',
                 buildings: [
                     IkaTools.Constants.Buildings.EMBASSY
                 ] },

                { name: 'trading',
                 buildings: [
                     IkaTools.Constants.Buildings.WAREHOUSE,
                     IkaTools.Constants.Buildings.DUMP,
                     IkaTools.Constants.Buildings.TRADING_PORT,
                     IkaTools.Constants.Buildings.DOCKYARD,       // ajout
                     IkaTools.Constants.Buildings.TRADING_POST,
                     IkaTools.Constants.Buildings.BLACK_MARKET,
                     IkaTools.Constants.Buildings.MARINE_CHART_ARCHIVE
                 ] },

                { name: 'military',
                 buildings: [
                     IkaTools.Constants.Buildings.WALL,
                     IkaTools.Constants.Buildings.HIDEOUT,
                     IkaTools.Constants.Buildings.BARRACKS,
                     IkaTools.Constants.Buildings.SHIPYARD,
                     IkaTools.Constants.Buildings.PIRATE_FORTRESS
                 ] },

                { name: 'wood',
                 buildings: [
                     IkaTools.Constants.Buildings.FORESTER,
                     IkaTools.Constants.Buildings.CARPENTER
                 ] },

                { name: 'wine',
                 buildings: [
                     IkaTools.Constants.Buildings.WINERY,
                     IkaTools.Constants.Buildings.WINE_PRESS
                 ] },

                { name: 'marble',
                 buildings: [
                     IkaTools.Constants.Buildings.STONEMASON,
                     IkaTools.Constants.Buildings.ARCHITECT
                 ] },

                { name: 'crystal',
                 buildings: [
                     IkaTools.Constants.Buildings.GLASSBLOWER,
                     IkaTools.Constants.Buildings.OPTICIAN
                 ] },

                { name: 'sulfur',
                 buildings: [
                     IkaTools.Constants.Buildings.ALCHEMISTS_TOWER,
                     IkaTools.Constants.Buildings.FIREWORK_TEST_AREA
                 ] }
            ];


            function makeTableContent() {
                var updateables = this.updateables;

                var empireBuildingCounts = {};

                $.each(IkaTools.EmpireData.getOwnCities(), function(index, city) {
                    var cityBuildingCounts = {};
                    $.each(city.getBuildings(), function(index, building) {
                        if (!building.isEmpty()) {
                            cityBuildingCounts[building.getType()] =
                                (cityBuildingCounts[building.getType()] || 0) + 1;
                        }
                    });
                    $.each(cityBuildingCounts, function(key, value) {
                        empireBuildingCounts[key] = Math.max(
                            empireBuildingCounts[key] || 0, cityBuildingCounts[key]);
                    });
                });

                function makeCols(type) {
                    var count = empireBuildingCounts[type];
                    if (count) {
                        var html = '<col class="building building_%s"/>'.format(type);
                        for (var i = 1; i < count; i++) {
                            html += '<col class="building building_additional building_%s"/>'.format(type);
                        }
                        return html;
                    } else {
                        return '';
                    }
                }

                function makeColGroup(info) {
                    var group = $.map(info.buildings, makeCols).join('');
                    return !group ? '' :
                    '<colgroup class="buildings buildings_%s">%s</colgroup>'.format(
                        info.name, group);
                }

                function makeTableHeaderCells(type) {
                    var count = empireBuildingCounts[type];
                    var displayName = localizer.localize('buildings', type);
                    var toolTip = toolTips.registerSimple('ImperatorBuildingHeader_' + type,
                                                          $('<div class="nowrap">%s</div>'.format(displayName)));
                    return !count ? '' :
                    ('<th class="building building_%s imperator_tool_tip" ' +
                     'id="ImperatorBuildingHeader_%s" colspan="%s">%s</td>').format(
                        type,
                        type,
                        count,
                        displayName);
                }

                function makeTableHeadContent() {
                    var displayName = localizer.localize('misc','building_spots');
                    toolTips.registerSimple('ImperatorBuildingHeaderBuildingSpots',
                                            '<div class="nowrap">%s</div>'.format(displayName));
                    return ('%s' +
                            '<th class="actions">%s</th>' +
                            '<th class="building building_spots imperator_tool_tip" ' +
                            'id="ImperatorBuildingHeaderBuildingSpots">%s</th>' +
                            '%s').format(
                        makeCityNameHeaderCells(),
                        localizer.localize('misc','actions'),
                        displayName,
                        $.map(BUILDING_ORDER, function(info) {
                            return $.map(info.buildings, makeTableHeaderCells);
                        }).join(''));
                }

                function makeTableCell(city, building) {
                    var link = new Link('Building_%s_%s'.format(city.getId(), building.getPosition()))
                    .toCityView(city, building.getType(),
                                { position: building.getPosition(), cityId: city.getId() });
                    var isUpgrading = building.isUpgrading();
                    var toolTip = '';
                    if (!isUpgrading && building.isMaxLevel()) {
                        toolTips.deregister(link.getId());
                    } else if (!building.isMaxLevel()) {
                        toolTips.registerRefreshable(link.getId(), function() {
                            function makeCostRow(resource) {
                                var required = costs[resource];
                                if (!required) {
                                    return '';
                                }

                                var onHand = city.getResource(resource).getCurrent();

                                return ('<tr>' +
                                        '<td class="resource_icon">' +
                                        '<img src="/cdn/all/both/resources/icon_%s.png">' +
                                        '</td>' +
                                        '<td class="resource_cost">%s</td>' +
                                        '<td class="resource_missing">%s</td>' +
                                        '</tr>').format(
                                    resource,
                                    IkaTools.Intl.formatInteger(required),
                                    onHand >= required
                                    ? '<img src="/cdn/all/both/interface/check_mark_17px.png"/>'
                                    : IkaTools.Intl.formatInteger(onHand - required, true));
                            }

                            var upgradingHtml = '';
                            if (isUpgrading) {
                                upgradingHtml = ('<div class="imperator_tool_tip_title">%s</div>' +
                                                 '<div class="nowrap">%s (%s)</div>').format(
                                    localizer.localize('misc','constructing'),
                                    IkaTools.Intl.formatRemainingTime(
                                        building.getRemainingUpgradeTime()),
                                    IkaTools.Intl.formatAbsoluteTime(
                                        building.getCompletionTime()));
                            }

                            var costs = building.getUpgradeCosts();
                            var costTitle = (isUpgrading ?
                                localizer.localize('misc','next_level_cost') :
                                localizer.localize('misc','resource_cost')) +
                                (costs._real ? '' : ' <span style="opacity:.6;font-weight:400">(estimation)</span>');

                            return ('%s<table class="building_upgrade_costs">' +
                                    '<thead class="imperator_tool_tip_title">' +
                                    '<tr><th colspan="3">%s</th></tr>' +
                                    '</thead>' +
                                    '<tbody>' +
                                    '%s%s%s%s%s' +
                                    '</tbody>' +
                                    '<tfoot>' +
                                    '<tr>' +
                                    '<td class="resource_icon">' +
                                    '<img src="/cdn/all/both/resources/icon_time.png"/>' +
                                    '</td>' +
                                    '<td class="nowrap" colspan="2">%s</td>' +
                                    '</tr>' +
                                    '</tfoot>' +
                                    '<table>')
                                .format(
                                upgradingHtml,
                                costTitle,
                                makeCostRow(IkaTools.Constants.Resources.WOOD),
                                makeCostRow(IkaTools.Constants.Resources.WINE),
                                makeCostRow(IkaTools.Constants.Resources.MARBLE),
                                makeCostRow(IkaTools.Constants.Resources.GLASS),
                                makeCostRow(IkaTools.Constants.Resources.SULFUR),
                                IkaTools.Intl.formatRemainingTime(costs.time));
                        });
                    }
                    return ('<td class="%s">%s' +
                            '<a id="%s" class="imperator_link imperator_tool_tip" ' +
                            'href="javascript:void(0);">' +
                            '%s%s' +
                            '</a>' +
                            '</td>').format(
                        isUpgrading ? 'building_upgrading' : '',
                        toolTip,
                        link.getId(),
                        building.getLevel(),
                        isUpgrading ? ('&raquo;' + (building.getLevel() + 1)) : '');
                }

                function makeTableCells(city, type) {
                    var count = empireBuildingCounts[type];
                    var html = '';
                    if (count) {
                        var buildings = city.getBuildingsByType(type);
                        for (var i = 0; i < count; i++) {
                            if (i < buildings.length) {
                                html += makeTableCell(city, buildings[i]);
                            } else {
                                html += '<td/>';
                            }
                        }
                    }
                    return html;
                }

                function makeRow(city) {
                    var buildingSpots = city.getBuildingsByType('').length;
                    var rowUpdateable = updateables.create('BuildingsTableRow_%s'.format(city.getId()))
                    .registerUpdate('cityChanged',
                                    function(element) {
                        if (IkaTools.View.isActiveCity(city)) {
                            element.addClass('current');
                        } else {
                            element.removeClass('current');
                        }
                    });
                    var cityLink = new Link('BuildingTabToCity_%s'.format(city.getId()))
                    .toCityView(city, undefined, { },
                                function() {
                        makePopup().close();
                        return true;
                    });
                    var transportLink = new Link('BuildingTabTransportGoods_%s'.format(city.getId()))
                    .toLocalView(
                        IkaTools.Constants.View.TRANSPORT,
                        {
                            templateView: IkaTools.Constants.View.CITY_DETAIL,
                            destinationCityId: city.getId(),
                        },
                        function() {
                            var go = !IkaTools.View.isActiveCity(city) &&
                                IkaTools.View.getCurrentCity().isOwn();
                            if (go) {
                                openBuildingsTabOnTransportClose = true;
                            }
                            return go;
                        });

                    return ('<tr id="%s" class="%s">%s' +
                            '<td class="actions">' +
                            '<a id="%s" class="imperator_link to_city_view" ' +
                            'title="%s" href="javascript:void(0);"/>' +
                            '<a id="%s" class="imperator_link transport_goods" ' +
                            'title="%s" href="javascript:void(0);"/>' +
                            '</td>' +
                            '<td class="building building_spots">%s</td>' +
                            '%s' +
                            '</tr>').format(
                        rowUpdateable.getId(0),
                        (IkaTools.View.isActiveCity(city) ? 'current' : ''),
                        makeCityNameCells('buildings', city),
                        cityLink.getId(),
                        localizer.localize('actions','to_city_view'),
                        transportLink.getId(),
                        localizer.localize('actions','transport_goods'),
                        buildingSpots > 0 ? buildingSpots : '',
                        $.map(BUILDING_ORDER, function(info) {
                            return $.map(info.buildings, makeTableCells.bind(null, city));
                        }).join(''));
                }

                return ('%s<colgroup class="actions"><col class="actions"/></colgroup>' +
                        '%s<thead>%s</thead><tbody>%s</tbody>').format(
                    makeCityNameColGroup('<col class="building building_spots">'),
                    $.map(BUILDING_ORDER, makeColGroup).join(''),
                    makeTableHeadContent(),
                    $.map(IkaTools.EmpireData.getOwnCities(), makeRow).join(''));
            }

            var tab = new Tab('buildings', localizer.localize('misc','buildings'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewBuildingsTable"/>' +
                '</div>'),
                              'ImperatorOverviewBuildingsTable',
                              function() {
                IkaTools.EmpireData.registerBuildingsChangedHandler(function(changes) {
                    tab.maybeRedraw(true);
                });
            },
                              makeTableContent);

            return tab.getTab();
        }

        var UNIT_ORDER = [
            { name: 'army_front_line',
             units: [IkaTools.Constants.Military.HOPLITE,
                     IkaTools.Constants.Military.STEAM_GIANT,
                     IkaTools.Constants.Military.SPARTAN]}, // v2.26
            { name: 'army_flank',
             units: [IkaTools.Constants.Military.SPEARMAN,
                     IkaTools.Constants.Military.SWORDSMAN]},
            { name: 'army_ranged',
             units: [IkaTools.Constants.Military.SLINGER,
                     IkaTools.Constants.Military.ARCHER,
                     IkaTools.Constants.Military.GUNNER]},
            { name: 'army_seige',
             units: [IkaTools.Constants.Military.BATTERING_RAM,
                     IkaTools.Constants.Military.CATAPULT,
                     IkaTools.Constants.Military.MORTAR]},
            { name: 'army_flying',
             units: [IkaTools.Constants.Military.GYROCOPTER,
                     IkaTools.Constants.Military.BALLOON_BOMBADIER]},
            { name: 'army_support',
             units: [IkaTools.Constants.Military.COOK,
                     IkaTools.Constants.Military.DOCTOR]},
            { name: 'navy_front_line',
             units: [IkaTools.Constants.Military.FLAME_THROWER,
                     IkaTools.Constants.Military.STEAM_RAM]},
            { name: 'navy_flank',
             units: [IkaTools.Constants.Military.RAM_SHIP]},
            { name: 'navy_ranged',
             units: [IkaTools.Constants.Military.BALLISTA_SHIP,
                     IkaTools.Constants.Military.CATAPULT_SHIP,
                     IkaTools.Constants.Military.MORTAR_SHIP]},
            { name: 'navy_seige',
             units: [IkaTools.Constants.Military.SUBMARINE,
                     IkaTools.Constants.Military.ROCKET_SHIP]},
            { name: 'navy_flying',
             units: [IkaTools.Constants.Military.PADDLE_SPEED_SHIP,
                     IkaTools.Constants.Military.BALLOON_CARRIER]},
            { name: 'navy_support',
             units: [IkaTools.Constants.Military.TENDER]}
        ];

        function makeMilitaryTab() {
            function makeTableContent() {
                var cities = IkaTools.EmpireData.getCities();

                var updateables = this.updateables;
                var empireHasTroopType = {};

                $.each(cities, function(index, city) {
                    $.each(city.getMilitary().getPresent().getCounts(), function(unit, count) {
                        if (count) {
                            empireHasTroopType[unit] = true;
                        }
                    });
                    $.each(city.getMilitary().getTrainingBatches(), function(index, batch) {
                        $.each(batch.getUnits().getCounts(), function(unit, count) {
                            if (count) {
                                empireHasTroopType[unit] = true;
                            }
                        });
                    });
                });
                $.each(IkaTools.EmpireData.getCivilizationData().getMovements(),
                       function(index, movement) {
                    $.each(movement.getUnits().getCounts(), function(unit, count) {
                        if (count) {
                            empireHasTroopType[unit] = true;
                        }
                    });
                });

                function makeCol(type) {
                    return !empireHasTroopType[type] ? '' :
                    '<col class="military military_%s"/>'.format(type);
                }

                function makeColGroup(info) {
                    var group = $.map(info.units, makeCol).join('');
                    return !group ? '' :
                    '<colgroup class="military military_%s">%s</colgroup>'.format(
                        info.name, group);
                }

                function makeTableHeaderCell(type) {
                    var displayName = localizer.localize('units', type);
                    var toolTip = toolTips.registerSimple('ImperatorMilitaryHeader_' + type,
                                                          '<div class="nowrap">%s</div>'.format(displayName));
                    return !empireHasTroopType[type] ? '' :
                    ('<th class="military military_%s imperator_tool_tip" ' +
                     'id="ImperatorMilitaryHeader_%s">%s</td>').format(
                        type,
                        type,
                        displayName);
                }

                function makeTableHeadContent() {
                    toolTips.registerSimple('MilitaryTableActionPoints',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('misc','action_points')));
                    return ('%s<th id="MilitaryTableActionPoints" ' +
                            'class="action_points imperator_tool_tip">%s</th>' +
                            '<th class="actions">%s</th>%s').format(
                        makeCityNameHeaderCells(true),
                        localizer.localize('misc','action_points'),
                        localizer.localize('misc','actions'),
                        $.map(UNIT_ORDER, function(info) {
                            return $.map(info.units, makeTableHeaderCell);
                        }).join(''));
                }

                function makeTableCell(city, military, movements, type) {
                    var cityId = city.getId();
                    var count = military.getPresent().getCount(type);

                    function isDeploymentCountableMovement(movement) {
                        if (movement.getUnits().getCount(type) > 0) {
                            var mission = movement.getMission();
                            var stage = movement.getStage();
                            if (mission == IkaTools.Constants.Movements.Mission.DEPLOY_ARMY ||
                                mission == IkaTools.Constants.Movements.Mission.DEPLOY_NAVY) {
                                if (stage == IkaTools.Constants.Movements.Stage.LOADING ||
                                    stage == IkaTools.Constants.Movements.Stage.EN_ROUTE) {
                                    return movement.getTargetCityId() == cityId;
                                }
                                if (stage == IkaTools.Constants.Movements.Stage.RETURNING) {
                                    return movement.getOriginCityId() == cityId;
                                }
                            }
                        }
                        return false;
                    }

                    function isPlunderCountableMovement(movement) {
                        if (movement.getUnits().getCount(type) > 0) {
                            var mission = movement.getMission();
                            if (mission == IkaTools.Constants.Movements.Mission.PLUNDER) {
                                return movement.getOriginCityId() == cityId;
                            }
                        }
                        return false;
                    }

                    var trainingBatches = military.getTrainingBatches();
                    var trainingCount = 0;
                    $.each(trainingBatches, function countTraining(index, batch) {
                        trainingCount += batch.getUnits().getCount(type) || 0;
                    });

                    var hasIncomingDeployments = false;
                    $.each(movements, function isIncomingDeployment(index, movement) {
                        var mission = movement.getMission();
                        var stage = movement.getStage();
                        if (mission == IkaTools.Constants.Movements.Mission.DEPLOY_ARMY ||
                            mission == IkaTools.Constants.Movements.Mission.DEPLOY_NAVY) {
                            if (stage == IkaTools.Constants.Movements.Stage.LOADING ||
                                stage == IkaTools.Constants.Movements.Stage.EN_ROUTE) {
                                hasIncomingDeployments = true;
                            }
                            if (stage == IkaTools.Constants.Movements.Stage.RETURNING) {
                                hasIncomingDeployments = true;
                            }
                        }
                    });
                    var deployingCount = 0;
                    $.each(movements, function countDeploying(index, movement) {
                        if (isDeploymentCountableMovement(movement)) {
                            deployingCount += movement.getUnits().getCount(type) || 0;
                        }
                    });

                    var plunderingCount = 0;
                    $.each(movements, function countPlundering(index, movement) {
                        if (isPlunderCountableMovement(movement)) {
                            plunderingCount += movement.getUnits().getCount(type) || 0;
                        }
                    });

                    var trainingDivId = 'MilitaryTraining_%s_%s'.format(city.getId(), type);
                    if (trainingCount) {
                        var isArmy = IkaTools.Constants.UnitData[type].isArmy;
                        toolTips.registerRefreshable(trainingDivId, function() {
                            return ('<table class="training_units_tool_tip">' +
                                    '<thead>' +
                                    '<tr>' +
                                    '<th>' +
                                    '<img src="/cdn/all/both/characters/%s%s_faceright.png" ' +
                                    '%s="15" />' +
                                    '</th>' +
                                    '<th>%s</th>' +
                                    '</tr>' +
                                    '</thead>' +
                                    '<tbody>%s</tbody>' +
                                    '</table').format(
                                isArmy ? 'military/x60_y60/y60_' : 'fleet/60x60/',
                                type,
                                isArmy ? 'height' : 'width',
                                localizer.localize('misc','training'),
                                $.map(trainingBatches, function makeTrainingToolTipRow(batch) {
                                    var count = batch.getUnits().getCount(type);
                                    if (count) {
                                        return '<tr><td class="training_count">%s</td><td>%s</td></tr>'.format(
                                            IkaTools.Intl.formatInteger(count, true),
                                            IkaTools.Intl.formatRemainingTime(
                                                batch.getCompletionTime() - IkaTools.View.gameTimeNow()));
                                    } else {
                                        return '';
                                    }
                                }).join(''));
                        });
                    } else {
                        toolTips.deregister(trainingDivId);
                    }

                    var deployingDivId = 'MilitaryDeployment_%s_%s'.format(city.getId(), type);
                    if (deployingCount) {
                        isArmy = IkaTools.Constants.UnitData[type].isArmy;
                        toolTips.registerRefreshable(deployingDivId, function() {
                            return ('<table class="deploying_units_tool_tip">' +
                                    '<thead>' +
                                    '<tr>' +
                                    '<th>' +
                                    '<img src="/cdn/all/both/characters/%s%s_faceright.png" ' +
                                    '%s="15" />' +
                                    '</th>' +
                                    '<th>%s</th>' +
                                    '</tr>' +
                                    '</thead>' +
                                    '<tbody>%s</tbody>' +
                                    '</table').format(
                                isArmy ? 'military/x60_y60/y60_' : 'fleet/60x60/',
                                type,
                                isArmy ? 'height' : 'width',
                                localizer.localize('misc','deploying'),
                                $.map(movements, function makeDeployingToolTipRow(movement) {
                                    var count = movement.getUnits().getCount(type);
                                    if (isDeploymentCountableMovement(movement)) {
                                        return '<tr><td class="deploying_count">%s</td><td>%s</td></tr>'.format(
                                            IkaTools.Intl.formatInteger(count, true),
                                            IkaTools.Intl.formatRemainingTime(
                                                movement.getArrivalTime() - IkaTools.View.gameTimeNow()));
                                    } else {
                                        return '';
                                    }
                                }).join(''));
                        });
                    } else {
                        toolTips.deregister(deployingDivId);
                    }

                    var plunderingDivId = 'MilitaryPludering_%s_%s'.format(city.getId(), type);
                    if (plunderingCount) {
                        isArmy = IkaTools.Constants.UnitData[type].isArmy;
                        toolTips.registerRefreshable(plunderingDivId, function() {
                            return ('<table class="plundering_units_tool_tip">' +
                                    '<thead>' +
                                    '<tr>' +
                                    '<th>' +
                                    '<img src="/cdn/all/both/characters/%s%s_faceright.png" ' +
                                    '%s="15" />' +
                                    '</th>' +
                                    '<th>%s</th>' +
                                    '</tr>' +
                                    '</thead>' +
                                    '<tbody>%s</tbody>' +
                                    '</table').format(
                                isArmy ? 'military/x60_y60/y60_' : 'fleet/60x60/',
                                type,
                                isArmy ? 'height' : 'width',
                                localizer.localize('misc','plundering'),
                                $.map(movements, function makeDeployingToolTipRow(movement) {
                                    var count = movement.getUnits().getCount(type);
                                    if (isPlunderCountableMovement(movement)) {
                                        return '<tr><td class="plundering_count">%s</td><td>%s</td></tr>'.format(
                                            IkaTools.Intl.formatInteger(count, true),
                                            IkaTools.Intl.formatRemainingTime(
                                                movement.getArrivalTime() - IkaTools.View.gameTimeNow()));
                                    } else {
                                        return '';
                                    }
                                }).join(''));
                        });
                    } else {
                        toolTips.deregister(plunderingDivId);
                    }

                    return !empireHasTroopType[type] ? '' :
                    ('<td class="military military_%s">' +
                     '<div>%s</div>' +
                     '<div id="%s" class="military_training imperator_tool_tip">%s</div>' +
                     '<div id="%s" class="military_deploying imperator_tool_tip">%s</div>' +
                     '<div id="%s" class="military_plundering imperator_tool_tip">%s</div>' +
                     '</td>').format(
                        type,
                        count ? IkaTools.Intl.formatInteger(count) : '&nbsp;',
                        trainingDivId,
                        trainingCount ? IkaTools.Intl.formatInteger(trainingCount, true)
                        : (trainingBatches.length ? '&nbsp;' : ''),
                        deployingDivId,
                        deployingCount ? IkaTools.Intl.formatInteger(deployingCount, true)
                        : (hasIncomingDeployments ? '&nbsp;' : ''),
                        plunderingDivId,
                        plunderingCount ?
                        IkaTools.Intl.formatInteger(plunderingCount, true) : '');
                }

                function makeActionsCell(city) {
                    var deployTroopsLink = new Link('DeployArmy_%s'.format(city.getId())).toLocalView(
                        IkaTools.Constants.View.DEPLOY,
                        {
                            templateView: IkaTools.Constants.View.CITY_DETAIL,
                            destinationCityId: city.getId(),
                            deploymentType: 'army',
                        },
                        function() {
                            var go = !IkaTools.View.isActiveCity(city);
                            if (go) {
                                openMilitaryTabOnDeploymentClose = true;
                            }
                            return go;
                        });
                    var deployNavyLink = new Link('DeployNavy_%s'.format(city.getId())).toLocalView(
                        IkaTools.Constants.View.DEPLOY,
                        {
                            templateView: IkaTools.Constants.View.CITY_DETAIL,
                            destinationCityId: city.getId(),
                            deploymentType: 'fleet',
                        },
                        function() {
                            var go = !IkaTools.View.isActiveCity(city);
                            if (go) {
                                openMilitaryTabOnDeploymentClose = true;
                            }
                            return go;
                        });

                    var barracksLinkHtml = ''
                    var shipyardLinkHtml = '';

                    var barracks = city.getBuildingByType(IkaTools.Constants.Buildings.BARRACKS);
                    var shipyard = city.getBuildingByType(IkaTools.Constants.Buildings.SHIPYARD);

                    if (city.isOwn() && barracks) {
                        var barracksLink = new Link('MilitaryBarracks_%s'.format(city.getId()))
                        .toCityView(city, IkaTools.Constants.View.BARRACKS,
                                    { position: barracks.getPosition(), cityId: city.getId() });
                        barracksLinkHtml = ('<a id="%s" class="imperator_link to_barracks" ' +
                                            'title="%s" href="javascript:void(0);"></a>').format(
                            barracksLink.getId(),
                            localizer.localize('actions','to_barracks'));
                    }

                    if (city.isOwn() && shipyard) {
                        var shipyardLink = new Link('MilitaryShipyard_%s'.format(city.getId()))

                        .toCityView(city, IkaTools.Constants.View.SHIPYARD,
                                    { position: shipyard.getPosition(), cityId: city.getId() });
                        shipyardLinkHtml = ('<a id="%s" class="imperator_link to_shipyard" ' +
                                            'title="%s" href="javascript:void(0);"></a>').format(
                            shipyardLink.getId(),
                            localizer.localize('actions','to_shipyard'));
                    }
                    return ('<td class="actions">' +
                            '<a id="%s" class="imperator_link deploy_army" ' +
                            'title="%s" href="javascript:void(0);"></a>' +
                            '<a id="%s" class="imperator_link deploy_navy" ' +
                            'title="%s" href="javascript:void(0);"></a>' +
                            '%s%s' +
                            '</td>').format(
                        deployTroopsLink.getId(),
                        localizer.localize('actions','deploy_army'),
                        deployNavyLink.getId(),
                        localizer.localize('actions','deploy_navy'),
                        barracksLinkHtml,
                        shipyardLinkHtml);
                }

                function makeRow(movements, city) {
                    var rowUpdateable = updateables.create('MilitaryTableRow_%s'.format(city.getId()))
                    .registerUpdate('cityChanged',
                                    function(element) {
                        if (IkaTools.View.isActiveCity(city)) {
                            element.addClass('current');
                        } else {
                            element.removeClass('current');
                        }
                    });

                    return ('<tr id="%s" class="%s">' +
                            '%s' +
                            '<td class="action_points">%s</td>' +
                            '%s' +
                            '%s' +

                            '</tr>')
                        .format(
                        rowUpdateable.getId(0),
                        (IkaTools.View.isActiveCity(city) ? 'current' : ''),
                        makeCityNameCells('military', city, true),
                        IkaTools.Intl.formatInteger(city.getActionPoints()),
                        makeActionsCell(city),
                        $.map(UNIT_ORDER, function(info) {
                            return $.map(info.units, makeTableCell.bind(
                                null, city, city.getMilitary(), movements));
                        }).join(''));
                }

                function makeSummaryCell(type) {
                    if (!empireHasTroopType[type]) {
                        return '';
                    }
                    var count = 0;
                    $.each(cities, function(index, city) {
                        count += city.getMilitary().getPresent().getCount(type) || 0;
                    });
                    return '<td>%s</td>'.format(IkaTools.Intl.formatInteger(count));
                }

                function makeSummaryRow(cities) {
                    return '<tr><td colspan="3" class="totals_sigma_cell"/>%s</tr>'.format(
                        $.map(UNIT_ORDER, function(info) {
                            return $.map(info.units, makeSummaryCell);
                        }).join(''));
                }

                return '%s%s%s<thead>%s</thead><tbody>%s</tbody><tfoot>%s</tfoot>'.format(
                    makeCityNameColGroup('<col class="action_points">', true),
                    '<colgroup class="actions"><col class="actions"/></colgroup>',
                    $.map(UNIT_ORDER, makeColGroup).join(''),
                    makeTableHeadContent(),
                    $.map(cities, makeRow.bind(
                        null, IkaTools.EmpireData.getCivilizationData().getMovements())).join(''),
                    makeSummaryRow(cities));
            }

            var tab = new Tab('military', localizer.localize('misc','military'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewMilitaryTable"/>' +
                '</div>'),
                              'ImperatorOverviewMilitaryTable',
                              function() {
                IkaTools.EmpireData.registerMilitaryChangedHandler(function(changes) {
                    tab.maybeRedraw(true);
                });
                IkaTools.EmpireData.registerResourcesChangedHandler(function(changes) {
                    var redraw = false;
                    $.each(changes, function(index, change) {
                        if (change.type == IkaTools.Constants.Resources.ACTION_POINTS) {
                            redraw = true;
                        }
                    });
                    tab.maybeRedraw(redraw);
                });
                IkaTools.EmpireData.registerMovementsChangedHandler(function(changes) {
                    var redraw = false;
                    $.each(changes, function(index, change) {
                        var mission = change.movement.getMission();
                        if (mission == IkaTools.Constants.Movements.Mission.DEPLOY_ARMY ||
                            mission == IkaTools.Constants.Movements.Mission.DEPLOY_NAVY ||
                            mission == IkaTools.Constants.Movements.Mission.PLUNDER) {
                            redraw = true;
                        }
                    });
                    tab.maybeRedraw(redraw);
                });
            },
                              makeTableContent);

            return tab.getTab();
        }

        function makeEspionageTab() {
            function makeTableContent() {
                var updateables = this.updateables;

                function renderTarget(target) {
                    var player = target.getPlayer();
                    if (!player) {
                        return ('<tr><td colspan="9" class="imperator_espionage_row">' +
                                '<span class="imperator_link">' + __impH(target.getName() || target.getId()) + '</span>' +
                                ' <span style="color:#888;font-size:0.85em;">(données en attente)</span>' +
                                '</td></tr>');
                    }
                    var alliance = player.getAlliance();

                    // TODO: Add predicate when no spies.
                    var cityLink = new Link('EspionageCityLink_%s'.format(target.getId()))
                    .toIkariamPage({ view: IkaTools.Constants.BaseView.CITY, cityId: target.getId() });
                    var cityLinkHtml = ('<a id="%s" class="imperator_link espionage_to_city_view player_state_%s" ' +
                                        'title="%s" href="javascript:void(0);">%s</a>').format(
                        cityLink.getId(),
                        __impH(player.getState()),
                        localizer.localize('actions','to_city_view'),
                        __impH(target.getName()));
                    var occupierHtml = '';
                    if (target.getOccupier()) {
                        occupierHtml = ('<img id="EspionageOccupier_%s" ' +
                                        '     class="espionage_occupier imperator_tool_tip" ' +
                                        '     src="/cdn/all/both/img/island/soldat_red.png" />').format(
                            target.getId());
                        toolTips.registerSimple('EspionageOccupier_%s'.format(target.getId()),
                                                '<div class="nowrap">%s %s</div>'.format(
                            localizer.localize('espionage','occupied_by'), __impH(target.getOccupier().getName())));
                    }

                    var blockaderHtml = '';
                    if (target.getBlockader()) {
                        blockaderHtml = ('<img id="EspionageBlockader_%s" ' +
                                         '     class="espionage_blockader imperator_tool_tip" ' +
                                         '     src="/cdn/all/both/img/island/schiff_red.png" />').format(
                            target.getId());
                        toolTips.registerSimple('EspionageBlockader_%s'.format(target.getId()),
                                                '<div class="nowrap">%s %s</div>'.format(
                            localizer.localize('espionage','blockaded_by'), __impH(target.getBlockader().getName())));
                    }

                    var allianceLinkHtml = '';
                    if (alliance) {
                        var allianceLink = new Link('EspionageAllianceLink_%s'.format(target.getId()))
                        .toLocalView(IkaTools.Constants.View.ALLIANCE_PAGE, { allyId: alliance.getId()});
                        allianceLinkHtml = ('[<a id="%s" class="imperator_link" ' +
                                            'title="%s" href="javascript:void(0);">%s</a>]').format(
                            allianceLink.getId(),
                            localizer.localize('actions','view_alliance_page'),
                            __impH(alliance.getName()));
                    }
                    var playerLink = new Link('EspionagePlayerLink_%s'.format(target.getId()))
                    .toLocalView(IkaTools.Constants.View.HIGH_SCORE, { searchUser: player.getName() });
                    var playerLinkHtml = ('<a id="%s" class="imperator_link player_state_%s" ' +
                                          'title="%s" href="javascript:void(0);">%s</a> %s').format(
                        playerLink.getId(),
                        __impH(player.getState()),
                        localizer.localize('actions','view_high_score'),
                        __impH(player.getName()),
                        allianceLinkHtml);

                    var islandLink = new Link('EspionageIslandLink_%s'.format(target.getId()))
                    .toIkariamPage({ view: IkaTools.Constants.BaseView.ISLAND, cityId: target.getId() });
                    var islandLinkHtml = ('<a id="%s" class="imperator_link espionage_to_island_view" ' +
                                          'title="%s" href="javascript:void(0);">[%s:%s]</a>').format(
                        islandLink.getId(),
                        localizer.localize('actions','to_island_view'),
                        target.getIslandCoordinates()[0], target.getIslandCoordinates()[1]);

                    var spyActionLink = new Link('EspionageSpyActionLink_%s'.format(target.getId()))
                    .toIkariamPage(
                        { view : IkaTools.Constants.BaseView.CITY, cityId: target.getId() },
                        IkaTools.View.makeIkariamLoadLocalPageAnchor(
                            { view: IkaTools.Constants.View.SPY_MISSION, targetCityId: target.getId() }));
                    var spyActionLinkHtml = ('<a id="%s" class="imperator_link spy_mission" ' +
                                             'title="%s" href="javascript:void(0);"></a>').format(
                        spyActionLink.getId(),
                        localizer.localize('actions','spy_mission'));

                    var pillageLink = new Link('EspionagePillageLink_%s'.format(target.getId()))
                    .toIkariamPage(
                        { view: IkaTools.Constants.BaseView.ISLAND, cityId: target.getId() },
                        IkaTools.View.makeIkariamLoadLocalPageAnchor(
                            { view: IkaTools.Constants.View.PILLAGE, destinationCityId: target.getId() }, true));
                    var pillageLinkHtml = ('<a id="%s" class="imperator_link pillage_mission" ' +
                                           'title="%s" href="javascript:void(0);"></a>').format(
                        pillageLink.getId(),
                        localizer.localize('actions','pillage'));

                    var blockadeLink = new Link('EspionageBlockageLink_%s'.format(target.getId()))
                    .toIkariamPage(
                        { view: IkaTools.Constants.BaseView.ISLAND, cityId: target.getId() },
                        IkaTools.View.makeIkariamLoadLocalPageAnchor(
                            { view: IkaTools.Constants.View.BLOCKADE, destinationCityId: target.getId() }, true));
                    var blockadeLinkHtml = ('<a id="%s" class="imperator_link blockade_mission" ' +
                                            'title="%s" href="javascript:void(0);"></a>').format(
                        blockadeLink.getId(),
                        localizer.localize('actions','blockade'));

                    var sendSpyLink = new Link('EspionageSendSpyLink_%s'.format(target.getId()))
                    .toLocalView(IkaTools.Constants.View.SEND_SPY,
                                 { isMission: 1, destinationCityId: target.getId() });
                    var sendSpyLinkHtml = ('<a id="%s" class="imperator_link send_spy_mission" ' +
                                           'title="%s" href="javascript:void(0);"></a>').format(
                        sendSpyLink.getId(),
                        localizer.localize('actions','send_spy'));

                    var occupyLink = new Link('EspionageOccupyLink_%s'.format(target.getId()))
                    .toIkariamPage(
                        { view: IkaTools.Constants.BaseView.ISLAND, cityId: target.getId() },
                        IkaTools.View.makeIkariamLoadLocalPageAnchor(
                            { view: IkaTools.Constants.View.OCCUPY, destinationCityId: target.getId() }, true));
                    var occupyLinkHtml = ('<a id="%s" class="imperator_link occupy_mission" ' +
                                          'title="%s" href="javascript:void(0);"></a>').format(
                        occupyLink.getId(),
                        localizer.localize('actions','occupy'));
                    var removeTargetLink = new Link('EspionageRemoveTarget_%s'.format(target.getId()))
                    .toFunction(function removeTarget() {
                        target.remove();
                    });
                    var removeTargetHtml = ('<a id="%s" class="imperator_link remove_espionage_target" ' +
                                            'title="%s" href="javascript:void(0);"></a>').format(
                        removeTargetLink.getId(),
                        localizer.localize('espionage','remove_target'));

                    function renderTravelTime(city) {
                        return IkaTools.Intl.formatRemainingTime(
                            IkaTools.EmpireData.calculateTravelTime(
                                city.getIslandCoordinates(), target.getIslandCoordinates(), null, 1),
                            false, 3);
                    }

                    var travelTimeUpdateable = updateables.create('EspionageTravelTime_%s'.format(target.getId()));
                    travelTimeUpdateable.registerUpdate('cityChanged',
                                                        function updateTravelTimeOnCityChange(travelTime) {
                        travelTime.html(renderTravelTime(IkaTools.View.getCurrentCity()));
                    });

                    function makeTravelTimeTable() {
                        var cities = IkaTools.EmpireData.getCities();
                        cities.sort(function(city1, city2) {
                            return IkaTools.EmpireData.calculateTravelTime(
                                city1.getIslandCoordinates(), target.getIslandCoordinates()) -
                                IkaTools.EmpireData.calculateTravelTime(
                                city2.getIslandCoordinates(), target.getIslandCoordinates());
                        });
                        return ('<table class="travel_time">' +
                                '<thead><tr><td>%s</td><td>%s</td></tr></head>' +
                                '<tbody>%s</tbody>' +
                                '</table>').format(
                            localizer.localize('misc','city_name'),
                            localizer.localize('espionage','travel_time'),
                            $.map(cities, function(city) {
                                if (city.isOwn()) {
                                    return '<tr><td>%s</td><td>%s</td></tr>'.format(
                                        __impH(city.getName()),
                                        renderTravelTime(city));
                                } else {
                                    return '';
                                }
                            }).join(''));
                    }

                    toolTips.register('EspionageTravelTime_%s'.format(target.getId()),
                                      makeTravelTimeTable);


                    var lootableResources = NaN;
                    if (target.hasResourceInfo()) {
                        lootableResources =
                            target.getLootableResources(IkaTools.Constants.Resources.WOOD) +
                            target.getLootableResources(IkaTools.Constants.Resources.WINE) +
                            target.getLootableResources(IkaTools.Constants.Resources.MARBLE) +
                            target.getLootableResources(IkaTools.Constants.Resources.GLASS) +
                            target.getLootableResources(IkaTools.Constants.Resources.SULFUR);

                        function makeResourceTable() {
                            function makeLootableRow(resource) {
                                return ('<tr>' +
                                        '<td class="resource_icon">' +
                                        '<img src="/cdn/all/both/resources/icon_%s.png">' +
                                        '</td>' +
                                        '<td class="resource_lootable">%s</td>' +
                                        '</tr>').format(
                                    resource,
                                    IkaTools.Intl.formatInteger(target.getLootableResources(resource)));
                            }

                            return ('<table class="lootable_resources">' +
                                    '<thead class="imperator_tool_tip_title">' +
                                    '<tr><th colspan="2">%s</th></tr>' +
                                    '</thead>' +
                                    '<tbody>' +
                                    '%s%s%s%s%s' +
                                    '</tbody>' +
                                    '<tfoot>' +
                                    '<tr>' +
                                    '<td><img src="/cdn/all/both/layout/icon-status-small.png" height="11"/></td>' +
                                    '<td>%s</td>' +
                                    '</tr>' +
                                    '</tfoot>' +
                                    '<table>')
                                .format(
                                localizer.localize('espionage', 'resources_lootable'),
                                makeLootableRow(IkaTools.Constants.Resources.WOOD),
                                makeLootableRow(IkaTools.Constants.Resources.WINE),
                                makeLootableRow(IkaTools.Constants.Resources.MARBLE),
                                makeLootableRow(IkaTools.Constants.Resources.GLASS),
                                makeLootableRow(IkaTools.Constants.Resources.SULFUR),
                                IkaTools.Intl.formatRemainingTime(
                                    IkaTools.View.gameTimeNow() - target.getResourcesSpyTime()));
                        }

                        toolTips.register('EspionageLootableResources_%s'.format(target.getId()),
                                          makeResourceTable);
                    } else {
                        toolTips.deregister('EspionageLootableResources_%s'.format(target.getId()));
                    }

                    if (target.hasMilitaryInfo()) {
                        var military = target.getMilitary();
                        var otherMilitary = target.getOtherMilitary();

                        function makeGarrisonTableHeaderCell(type) {
                            var displayName = localizer.localize('units', type);
                            return (military.getCount(type) || otherMilitary.getCount(type)) ?
                                ('<th class="military military_%s">%s</th>').format(type, displayName) :
                            '';
                        }

                        function makeGarrisonTableBodyCell(type) {
                            var count = military.getCount(type);
                            var otherCount = otherMilitary.getCount(type);
                            if (!(count || otherCount)) {
                                return '';
                            }
                            var countDisplay = '';
                            if (count) {
                                countDisplay = IkaTools.Intl.formatInteger(count);
                            }
                            if (otherCount) {
                                countDisplay = '%s (%s)'.format(
                                    countDisplay, IkaTools.Intl.formatInteger(otherCount));
                            }
                            return '<td>%s</td>'.format(countDisplay);
                        }

                        function makeGarrisonTable() {
                            var header = $.map(UNIT_ORDER, function(info) {
                                return $.map(info.units, makeGarrisonTableHeaderCell);
                            }).join('') || '<th>%s</th>'.format(localizer.localize('misc','none'));
                            return ('<table class="target_military_garrison">' +
                                    '<thead><tr>%s</tr></thead>' +
                                    '<tbody><tr>%s</tr></tbody>' +
                                    '<tfoot>' +
                                    '<tr>' +
                                    '<td colspan="100"><img src="/cdn/all/both/layout/icon-status-small.png"/ height="11">%s</td>' +
                                    '</tr>' +
                                    '</tfoot>' +
                                    '</table>').format(
                                header,
                                $.map(UNIT_ORDER, function(info) {
                                    return $.map(info.units, makeGarrisonTableBodyCell);
                                }).join(''),
                                IkaTools.Intl.formatRemainingTime(
                                    IkaTools.View.gameTimeNow() - target.getMilitarySpyTime()));
                        }

                        toolTips.register('EspionageMilitaryReport_%s'.format(target.getId()),
                                          makeGarrisonTable);
                    } else {
                        toolTips.deregister('EspionageMilitaryReport_%s'.format(target.getId()));
                    }

                    var combats = target.getCombats(7 * IkaTools.Constants.Time.MILLIS_PER_DAY);
                    if (combats.length) {
                        function makeCombatsTable() {
                            function makeLootedRow(combat, resource) {
                                var looted = combat.getLooted(resource);
                                if (looted) {
                                    return ('<tr>' +
                                            '<td class="resource_icon">' +
                                            '<img src="/cdn/all/both/resources/icon_%s.png">' +
                                            '</td>' +
                                            '<td class="resource_looted">%s</td>' +
                                            '</tr>').format(
                                        resource,
                                        IkaTools.Intl.formatInteger(looted));
                                } else {
                                    return '';
                                }
                            }

                            function makeCombatRow(combat) {
                                return ('<tr>' +
                                        '<td>' +
                                        '<div class="combat_type_%s"/>' +
                                        '</td>' +
                                        '<td>%s</td>' +
                                        '<td><table class="combat_looted"><tbody>%s%s%s%s%s</tbody></table></td>' +
                                        '</tr>').format(
                                    combat.getType(),
                                    IkaTools.Intl.formatRemainingTime(
                                        IkaTools.View.gameTimeNow() - combat.getTime()),
                                    makeLootedRow(combat, IkaTools.Constants.Resources.WOOD),
                                    makeLootedRow(combat, IkaTools.Constants.Resources.WINE),
                                    makeLootedRow(combat, IkaTools.Constants.Resources.MARBLE),
                                    makeLootedRow(combat, IkaTools.Constants.Resources.GLASS),
                                    makeLootedRow(combat, IkaTools.Constants.Resources.SULFUR));
                            }

                            return ('<table class="espionage_combats">' +
                                    '<thead>' +
                                    '<tr>' +
                                    '<th></th>' +
                                    '<th>%s</th>' +
                                    '<th>%s</th>' +
                                    '</tr>' +
                                    '</thead>' +
                                    '<tbody>' +
                                    '%s' +
                                    '</tbody>' +
                                    '<table>').format(
                                localizer.localize('espionage','time_since'),
                                localizer.localize('espionage','resources_looted'),
                                $.map(combats, makeCombatRow).join(''));
                        }
                        toolTips.register('EspionageMilitaryActions_%s'.format(target.getId()),
                                          makeCombatsTable);
                    } else {
                        toolTips.deregister('EspionageMilitaryActions_%s'.format(target.getId()));
                    }

                    return ('<tr>' +
                            '<td class="city_tradegood"><img src="/cdn/all/both/resources/icon_%s.png"/>%s%s</td>' +
                            '<td class="city_name nowrap">%s</td>' +
                            '<td class="player nowrap">%s</td>' +
                            '<td class="location">%s</td>' +
                            '<td class="actions">%s%s%s%s%s%s</td>' +
                            '<td id="%s" class="travel_time  imperator_tool_tip">%s</td>' +
                            '<td class="townhall_level">%s</td>' +
                            '<td class="wall_level">%s</td>' +
                            '<td id="EspionageLootableResources_%s" class="resources_lootable imperator_tool_tip">%s</td>' +
                            '<td id="EspionageMilitaryActions_%s" class="combats imperator_tool_tip">%s</td>' +
                            '<td id="EspionageMilitaryReport_%s" class="military_score imperator_tool_tip">%s</td>' +
                            '</tr>').format(
                        target.getTradeGoodType(),
                        occupierHtml, blockaderHtml, cityLinkHtml,
                        playerLinkHtml,
                        islandLinkHtml,
                        spyActionLinkHtml, pillageLinkHtml, blockadeLinkHtml, occupyLinkHtml, sendSpyLinkHtml, removeTargetHtml,
                        travelTimeUpdateable.getId(0),
                        IkaTools.Intl.formatRemainingTime(
                            IkaTools.EmpireData.calculateTravelTime(
                                IkaTools.View.getCurrentCity().getIslandCoordinates(), target.getIslandCoordinates(), null, 1),
                            false, 3),
                        IkaTools.Intl.formatInteger(target.getTownLevel()),
                        IkaTools.Intl.formatInteger(target.getWallLevel()),
                        target.getId(),
                        IkaTools.Intl.formatInteger(Math.ceil(
                            lootableResources / IkaTools.Constants.GamePlay.RESOURCES_PER_TRANSPORT)),
                        target.getId(), combats.length ? IkaTools.Intl.formatInteger(combats.length) : '-',
                        target.getId(), IkaTools.Intl.formatInteger(player.getMilitaryScore()));
                }

                function makeTableHead() {
                    toolTips.registerSimple('EspionageLocationHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','location')));
                    toolTips.registerSimple('EspionageTravelTimeHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','travel_time')));
                    toolTips.registerSimple('EspionageTownHallLevelHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','townhall_level')));
                    toolTips.registerSimple('EspionageWallLevelHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','wall_level')));
                    toolTips.registerSimple('EspionageResourcesLootableHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','resources_lootable')));
                    toolTips.registerSimple('EspionageCombatsHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','combats')));
                    toolTips.registerSimple('EspionageMilitaryScoreHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','military_score')));
                    return ('<thead>' +
                            '<tr>' +
                            '%s' +
                            '<th colspan="1" id="EspionagePlayerHeader" ' +
                            'class="player imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageLocationHeader" ' +
                            'class="location imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageActionsHeader" ' +
                            'class="actions imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageTravelTimeHeader" ' +
                            'class="travel_time imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageTownHallLevelHeader" ' +
                            'class="townhall_level imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageWallLevelHeader" ' +
                            'class="wall_level imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageResourcesLootableHeader" ' +
                            'class="resources_lootable imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageCombatsHeader" ' +
                            'class="combats imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageMilitaryScoreHeader" ' +
                            'class="military_score imperator_tool_tip">%s</th>' +
                            '</tr>' +
                            '</thead>').format(
                        makeCityNameHeaderCells(),
                        localizer.localize('espionage','player'),
                        localizer.localize('espionage','location'),
                        localizer.localize('misc','actions'),
                        localizer.localize('espionage','travel_time'),
                        localizer.localize('espionage','townhall_level'),
                        localizer.localize('espionage','wall_level'),
                        localizer.localize('espionage','resources_lootable'),
                        localizer.localize('espionage','combats'),
                        localizer.localize('espionage','military_score'));
                }
                var targets = IkaTools.EmpireData.Espionage.getTargets();

                return '%s<tbody>%s</tbody>'.format(
                    makeTableHead(),
                    $.map(targets, renderTarget).join(''));
            }

            var tab = new Tab('espionage', localizer.localize('misc','espionage'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewEspionageTable"/>' +
                '</div>'),
                              'ImperatorOverviewEspionageTable',
                              function() {
                IkaTools.EmpireData.Espionage.registerEspionageChangedHandler(function(changes) {
                    tab.maybeRedraw(true);
                });
            },
                              makeTableContent);

            return tab.getTab();
        }

        var openResourcesTabOnTransportClose = false;
        var openBuildingsTabOnTransportClose = false;
        var openMilitaryTabOnDeploymentClose = false;

        //////////////////
        // Patch BLOC 1 //
        //////////////////

             /* ===== IMPERATOR — Onglet Chantiers (natif) ===== */
        var __IMP_CAP_FAST = 580; // capacité navire marchand (unité de la couche 2)

        function __impEsc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
        function __impFmt(n){ try { return IkaTools.Intl.formatInteger(Math.round(n)); } catch(e){ return String(Math.round(n)); } }

        /* ---- Persistance (survit aux rechargements de page) -------------- */
        window.__impSaveChantiers = function(){
            try{ GM_setValue('imperator_chantiers', JSON.stringify(window.ImperatorChantiers||[])); }catch(e){}
        };
        window.__impLoadChantiers = function(){
            try{ var raw=GM_getValue('imperator_chantiers','[]'); var a=JSON.parse(raw); if(a && a.length!==undefined) window.ImperatorChantiers=a; }catch(e){}
            if(!window.ImperatorChantiers || window.ImperatorChantiers.length===undefined) window.ImperatorChantiers=[];
        };
        window.__impLoadChantiers();

        /* ---- Villes protégées : on ne puise jamais dans leurs ressources ---- */
        window.__impSaveProtected = function(){
            try{ GM_setValue('imperator_protected', JSON.stringify(window.ImperatorProtected||[])); }catch(e){}
        };
        window.__impLoadProtected = function(){
            try{ var raw=GM_getValue('imperator_protected','[]'); var a=JSON.parse(raw); if(a && a.length!==undefined) window.ImperatorProtected=a; }catch(e){}
            if(!window.ImperatorProtected || window.ImperatorProtected.length===undefined) window.ImperatorProtected=[];
        };
        window.__impLoadProtected();
        function __impIsProtected(cityId){
            var arr=window.ImperatorProtected; if(!arr || !arr.length) return false;
            var id=String(cityId);
            for (var i=0;i<arr.length;i++){ if(String(arr[i])===id) return true; }
            return false;
        }
        /* Réouverture auto de l'onglet Chantiers après un "Aller à" (qui recharge la page). */
        try{
            var __rt = GM_getValue('imperator_reopen_tab','');
            if (__rt){
                GM_setValue('imperator_reopen_tab','');
                setTimeout(function(){ try{ makePopup(); if(__rt==='boissons' && window.ImperatorOpenBoissons) window.ImperatorOpenBoissons(); else if(window.ImperatorOpenChantiers) window.ImperatorOpenChantiers(); }catch(e){} }, 700);
            }
        }catch(e){}

        function __impFindCity(cityId){
            try{
                var cities = IkaTools.EmpireData.getOwnCities();
                for (var i=0;i<cities.length;i++){ if (String(cities[i].getId())===String(cityId)) return cities[i]; }
            }catch(e){}
            return null;
        }
        function __impDist(a,b){
            if(!a||!b) return Infinity;
            var dx=Number(a[0])-Number(b[0]), dy=Number(a[1])-Number(b[1]);
            return Math.sqrt(dx*dx+dy*dy); // 0 = même île
        }
        function __impSurplus(city, resKey){
            var R = IkaTools.Constants.Resources, stock = 0;
            try{ if (city && __impIsProtected(city.getId())) return 0; }catch(e){} // ville protégée -> pas de surplus
            try { var rr = city.getResource(resKey); stock = (rr&&rr.getCurrent)?Math.floor(rr.getCurrent()):0; } catch(e){ return 0; }
            if (resKey === R.WINE){
                var isWine=false;
                try { isWine = (city.getTradeGoodType && city.getTradeGoodType()===R.WINE); } catch(e){}
                if (!isWine) return 0;
                return Math.max(0, stock - 100000);
            }
            return Math.max(0, stock);
        }

        /* ---- Contrat d'ENVOI (figé) --------------------------------------- */
        function __impMakeEnvoi(f){
            f = f || {};
            return {
                id:         f.id || ((f.chantierId||'?')+'_'+(f.fromCityId||'?')+'_'+(f.resource||'?')),
                chantierId: f.chantierId, fromCityId: f.fromCityId, toCityId: f.toCityId,
                resource:   f.resource, quantity: f.quantity || 0,
                fleet:      f.fleet || null, ships: (f.ships!=null?f.ships:null),
                etaMinutes: (f.etaMinutes!=null?f.etaMinutes:null),
                status:     f.status || 'planned'
            };
        }
        window.ImperatorMakeEnvoi = __impMakeEnvoi;

        /* ---- Couche 1 : BILAN --------------------------------------------- */
        /* ---- Rapprochement : transports r\u00e9els en route vers une ville ---- */
        function __impIncoming(cityId){
            var R=IkaTools.Constants.Resources, keys=[R.WOOD,R.WINE,R.MARBLE,R.GLASS,R.SULFUR];
            var res={}, byRes={}, soonest=null; keys.forEach(function(k){res[k]=0; byRes[k]=[];});
            try{
                var civ=IkaTools.EmpireData.getCivilizationData();
                var movs=civ?civ.getMovements():[];
                (movs||[]).forEach(function(mv){
                    try{
                        if (!mv || !mv.getMission) return;
                        if (mv.getMission()!==IkaTools.Constants.Movements.Mission.TRANSPORT) return;
                        if (String(mv.getTargetCityId())!==String(cityId)) return;
                        var a=mv.getArrivalTime?mv.getArrivalTime():null;
                        if (a!=null && (soonest==null||a<soonest)) soonest=a;
                        var fromId=mv.getOriginCityId?mv.getOriginCityId():null, fromName='';
                        try{ var fc=__impFindCity(fromId); fromName=(fc&&fc.getName)?fc.getName():(fromId?('ville '+fromId):'?'); }catch(e){}
                        keys.forEach(function(k){
                            var q=mv.getResource?(mv.getResource(k)||0):0;
                            if (q>0){ res[k]+=q; byRes[k].push({ fromId:fromId, fromName:fromName, qty:q, arrival:a }); }
                        });
                    }catch(e){}
                });
            }catch(e){}
            return { res:res, byRes:byRes, soonest:soonest };
        }
        /* ---- Clôture : niveau cible + état d'avancement du chantier ---- */
        function __impTargetLevel(levelText){
            var s=String(levelText||''), i=s.indexOf('\u00bb');
            if (i>-1){ var a=parseInt(s.slice(i+1),10); if(!isNaN(a)) return a; }
            var n=parseInt(s,10); return isNaN(n)?0:n+1;
        }
        function __impCompletion(c){
            try{
                var city=__impFindCity(c.cityId);
                if (!city || !city.getBuildingByPosition) return {state:null};
                var b=city.getBuildingByPosition(parseInt(c.position,10));
                if (!b) return {state:null};
                var target=__impTargetLevel(c.level), lvl=0;
                try{ lvl=b.getLevel(); }catch(e){}
                if (target>0 && lvl>=target) return {state:'done', target:target, level:lvl};           // niveau atteint
                if (b.isUpgrading && b.isUpgrading() && (lvl+1)>=target) return {state:'building', target:target, level:lvl}; // lancé
                return {state:null, target:target, level:lvl};
            }catch(e){ return {state:null}; }
        }
        function __impComputeBilan(ch){
            try{
                var city = __impFindCity(ch.cityId);
                if (!city) return { error:'ville introuvable' };
                var building = city.getBuildingByPosition ? city.getBuildingByPosition(ch.position) : null;
                if (!building) return { error:'b\u00e2timent introuvable' };
                var costs = building.getUpgradeCosts();
                var R = IkaTools.Constants.Resources;
                var defs = [[R.WOOD,'Bois'],[R.WINE,'Vin'],[R.MARBLE,'Marbre'],[R.GLASS,'Cristal'],[R.SULFUR,'Soufre']];
                var inc = __impIncoming(ch.cityId);
                var lines=[], total=0;
                defs.forEach(function(d){
                    var key=d[0], need=Math.ceil(costs[key]||0);
                    if (need<=0) return;
                    var stock=0;
                    try { var rr=city.getResource(key); stock=(rr&&rr.getCurrent)?Math.floor(rr.getCurrent()):0; } catch(e){}
                    var incoming=Math.floor((inc.res[key])||0);
                    var deficit=Math.max(0, need-stock-incoming);
                    total+=deficit;
                    lines.push({ key:key, label:d[1], need:need, stock:stock, incoming:incoming, deficit:deficit });
                });
                var name=''; try { name = localizer.localize('buildings', building.getType()) || ''; } catch(e){}
                var curLvl=0; try { curLvl = building.getLevel(); } catch(e){}
                return { ok:true, estimation:!costs._real, name:name, lines:lines, total:total,
                         currentLevel:curLvl, targetLevel:curLvl+1, ageMin:__impAge(city),
                         incomingSoonest: inc.soonest, incomingByRes: inc.byRes, cityName:(city.getName?city.getName():'') };
            } catch(err){ return { error:'exception', detail:String(err) }; }
        }

        /* ---- Couche 2 : ROUTAGE ------------------------------------------- */
        function __impComputeRoutage(ch, bilan){
            var CAP = __IMP_CAP_FAST;
            var target = __impFindCity(ch.cityId);
            var targetCoords = target ? target.getIslandCoordinates() : null;

            var sources = [];
            try {
                var cities = IkaTools.EmpireData.getOwnCities();
                for (var i=0;i<cities.length;i++){
                    var cc = cities[i];
                    if (String(cc.getId())===String(ch.cityId)) continue; // pas soi-même
                    sources.push({ city:cc, dist:__impDist(cc.getIslandCoordinates(), targetCoords) });
                }
                sources.sort(function(a,b){ return a.dist - b.dist; });
            } catch(e){}

            var result = { byResource:{}, allEnvois:[] };
            (bilan.lines||[]).forEach(function(l){
                if (l.deficit<=0) return;
                var resKey=l.key, D=l.deficit;
                var remainingShips = Math.ceil(D / CAP);
                var envois=[];
                for (var i=0;i<sources.length && remainingShips>0;i++){
                    var s=sources[i];
                    var surplus=__impSurplus(s.city, resKey);
                    var availShips=Math.floor(surplus / CAP);
                    if (availShips<=0) continue;               // pas de quoi remplir un navire
                    var takeShips=Math.min(availShips, remainingShips);
                    var env=__impMakeEnvoi({
                        chantierId:ch.id, fromCityId:s.city.getId(), toCityId:ch.cityId,
                        resource:resKey, quantity:takeShips*CAP
                    });
                    env._shipsFast=takeShips;
                    env._fromName=(s.city.getName?s.city.getName():String(s.city.getId()));
                    env._dist=s.dist;
                    envois.push(env); result.allEnvois.push(env);
                    remainingShips-=takeShips;
                }
                result.byResource[resKey] = { label:l.label, deficit:D, envois:envois,
                                              covered:(remainingShips<=0), missingShips:remainingShips };
            });
            return result;
        }

        var __IMP_CAP_CARGO = 50000, __IMP_SPEED_FAST = 75, __IMP_SPEED_CARGO = 4;
        function __impFreeShips(sel){
            try { var t=$(sel).first().text(); var n=parseInt(String(t).replace(/[^0-9]/g,''),10); return isNaN(n)?0:n; } catch(e){ return 0; }
        }
        function __impFmtDur(min){
            if (min==null || !isFinite(min)) return '?';
            min=Math.round(min);
            if (min<1) return '<1 min';
            if (min<60) return min+' min';
            if (min<1440){ var h=Math.floor(min/60),m=min%60; return h+'h'+(m?(' '+(m<10?'0':'')+m):''); }
            var j=Math.floor(min/1440), hh=Math.round((min%1440)/60); return j+'j '+hh+'h';
        }

        /* ---- Couche 3b : FLOTTE + MAKESPAN + ARBITRAGE (estimation) ------- */
        // Makespan d'une livraison FAST d'une quantité q d'une ressource (navires pleins).
        function __impFastMakespan(target, targetCoords, resKey, q, F){
            var CAP=__IMP_CAP_FAST;
            if (q<=0) return { makespanMin:0, totalShips:0, fits:true, rotations:0, srcs:[], covered:true };
            var src=[]; var cities=IkaTools.EmpireData.getOwnCities();
            for (var i=0;i<cities.length;i++){
                var cc=cities[i]; if (String(cc.getId())===String(target.getId())) continue;
                var sp=__impSurplus(cc,resKey); if (sp<CAP) continue;
                src.push({ city:cc, dist:__impDist(cc.getIslandCoordinates(),targetCoords), surplus:sp });
            }
            src.sort(function(a,b){return a.dist-b.dist;});
            var remShips=Math.ceil(q/CAP), total=0, used=[];
            for (var i=0;i<src.length && remShips>0;i++){
                var o=src[i], av=Math.floor(o.surplus/CAP); if (av<=0) continue;
                var take=Math.min(av,remShips), qty=take*CAP;
                var ls=0; try{ls=o.city.getLoadingSpeed();}catch(x){}
                var tms=0; try{tms=IkaTools.EmpireData.calculateTravelTime(o.city.getIslandCoordinates(),targetCoords,null,true);}catch(x){}
                var loadMin=(ls>0)?((qty/ls)/60):0, travelMin=tms/60000;
                used.push({ name:(o.city.getName?o.city.getName():''), ships:take, qty:qty, loadMin:loadMin, travelMin:travelMin, dist:o.dist });
                total+=take; remShips-=take;
            }
            var fits=total<=F, rot=fits?1:Math.ceil(total/Math.max(1,F)), maxArr=0, maxCyc=0;
            used.forEach(function(u){ var a=u.loadMin+u.travelMin, c=u.loadMin+2*u.travelMin; if(a>maxArr)maxArr=a; if(c>maxCyc)maxCyc=c; });
            return { makespanMin:(fits?maxArr:rot*maxCyc), totalShips:total, fits:fits, rotations:rot, srcs:used, covered:(remShips<=0) };
        }
        // Makespan d'une livraison CARGO de k navires (pleins) depuis les sources cargo-eligibles.
        function __impCargoMakespan(target, targetCoords, resKey, k){
            var CAPc=__IMP_CAP_CARGO, RATIO=__IMP_SPEED_FAST/__IMP_SPEED_CARGO;
            if (k<=0) return { makespanMin:0, ok:true, load:0, srcs:[] };
            var src=[]; var cities=IkaTools.EmpireData.getOwnCities();
            for (var i=0;i<cities.length;i++){
                var cc=cities[i]; if (String(cc.getId())===String(target.getId())) continue;
                var sp=__impSurplus(cc,resKey), ca=Math.floor(sp/CAPc); if (ca<=0) continue;
                src.push({ city:cc, dist:__impDist(cc.getIslandCoordinates(),targetCoords), ca:ca });
            }
            src.sort(function(a,b){return a.dist-b.dist;});
            var rem=k, used=[], maxArr=0;
            for (var i=0;i<src.length && rem>0;i++){
                var o=src[i], take=Math.min(o.ca,rem), qty=take*CAPc;
                var ls=0; try{ls=o.city.getLoadingSpeed();}catch(x){}
                var tms=0; try{tms=IkaTools.EmpireData.calculateTravelTime(o.city.getIslandCoordinates(),targetCoords,null,true);}catch(x){}
                var loadMin=(ls>0)?((qty/ls)/60):0, travelMin=(tms/60000)*RATIO, arr=loadMin+travelMin;
                used.push({ name:(o.city.getName?o.city.getName():''), ca:take, qty:qty, dist:o.dist });
                if (arr>maxArr) maxArr=arr; rem-=take;
            }
            return { makespanMin:maxArr, ok:(rem<=0), load:(k-rem)*CAPc, srcs:used };
        }
        // Arbitrage rapide vs mixte pour une matière.
        function __impArbitrage(ch, target, targetCoords, resKey, label, deficit, F, C){
            var CAPf=__IMP_CAP_FAST, CAPc=__IMP_CAP_CARGO;
            var L=Math.ceil(deficit/CAPf)*CAPf;
            var fast=__impFastMakespan(target,targetCoords,resKey,L,F);
            var best={ fleet:'rapide', makespanMin:fast.makespanMin, fast:fast, cargo:null, cargoShips:0, gain:0,
                       label:label, deficit:deficit, loaded:L, fastOnlyMS:fast.makespanMin, covered:fast.covered };
            var maxK=Math.min(C, Math.ceil(L/CAPc));
            for (var k=1;k<=maxK;k++){
                var cargo=__impCargoMakespan(target,targetCoords,resKey,k);
                if (!cargo.ok || cargo.load<=0) break;      // plus assez de surplus cargo-eligible
                var remaining=Math.max(0, L-cargo.load);
                var fastRem=__impFastMakespan(target,targetCoords,resKey,remaining,F);
                var mixedMS=Math.max(cargo.makespanMin, fastRem.makespanMin);
                if (mixedMS < best.makespanMin-0.01){
                    best={ fleet:'mixte', makespanMin:mixedMS, fast:fastRem, cargo:cargo, cargoShips:k,
                           gain:(fast.makespanMin-mixedMS), label:label, deficit:deficit, loaded:L,
                           fastOnlyMS:fast.makespanMin, covered:fast.covered };
                }
            }
            return best;
        }

        function __impComputeFlotte(ch, bilan){
            var F=__impFreeShips('#js_GlobalMenu_freeTransporters');
            var C=__impFreeShips('#js_GlobalMenu_freeFreighters');
            var target=__impFindCity(ch.cityId);
            var targetCoords=target?target.getIslandCoordinates():null;
            var materials=[], chMakespan=0;
            (bilan.lines||[]).forEach(function(l){
                if (l.deficit<=0) return;
                var arb=__impArbitrage(ch,target,targetCoords,l.key,l.label,l.deficit,F,C);
                materials.push(arb);
                if (arb.makespanMin>chMakespan) chMakespan=arb.makespanMin;
            });
            return { F:F, C:C, materials:materials, chantierMakespanMin:chMakespan };
        }
        /* ---- Brique : passage à l'exécution (pré-remplissage, 2 temps) --- */
        function __impFireEvents(el){
            ['input','change','keyup','blur'].forEach(function(t){ try{ el.dispatchEvent(new Event(t,{bubbles:true})); }catch(e){} });
        }
        function __impFillTransport(p){
            try{
                var q=document.getElementById('textfield_'+p.res);
                if (q){ q.value=p.qty; __impFireEvents(q); }
                var sid=(p.fleet==='cargo')?'selectedFreightersInput':'selectedTransportersInput';
                var sh=document.getElementById(sid);
                if (sh){ sh.value=p.ships; __impFireEvents(sh); }
            }catch(e){}
        }
        function __impStartPrefillWatch(){
            var tries=0;
            var iv=setInterval(function(){
                tries++;
                var p=window.__impPendingPrefill;
                if (!p){ clearInterval(iv); return; }
                if (document.getElementById('textfield_'+p.res) && document.getElementById('submit')){
                    __impFillTransport(p); window.__impPendingPrefill=null; clearInterval(iv);
                } else if (tries>24){ clearInterval(iv); } // ~6 s puis abandon silencieux
            },250);
        }
        function __impPrepareEnvoi(env){
            var src=__impFindCity(env.from), ok=false;
            try{ ok = src && IkaTools.View.isActiveCity(src); }catch(e){}
            if (!ok) return; // sécurité absolue : un transport part de la ville active
            window.__impPendingPrefill={ res:env.res, qty:env.qty, fleet:env.fleet||'fast', ships:env.ships };
            window.__impReopenAfterTransport = env.reopen || 'chantiers'; // rouvrir le bon onglet quand le transport se ferme
            try{ makePopup().close(); }catch(e){}
            try{
                IkaTools.View.goToLocalView(IkaTools.Constants.View.TRANSPORT, {
                    templateView: IkaTools.Constants.View.CITY_DETAIL, destinationCityId: env.to
                });
            }catch(e){}
            __impStartPrefillWatch();
        }

        function __impMinAgo(ts){
            var m=Math.max(0, Math.round((Date.now()-ts)/60000));
            if (m<1) return '\u00e0 l\u2019instant';
            if (m<60) return m+' min';
            var h=Math.floor(m/60); return h+'h'+((m%60)?(' '+(m%60)+'min'):'');
        }
        /* ---- Fra\u00eecheur des donn\u00e9es (aucune requ\u00eate) ---------------------
         * L'instantan\u00e9 d'une ville se rafra\u00eechit quand tu la visites (capture
         * opportuniste native). On rend juste l'\u00e2ge des donn\u00e9es visible. */
        var __IMP_STALE_MIN = 30;
        function __impAge(city){
            try{
                if (!city || !city.getLastResourceUpdate) return null;
                if (!city.getLastResourceUpdate()) return null; // jamais mis \u00e0 jour
                var ms = city.getTimeSinceResourceUpdate ? city.getTimeSinceResourceUpdate() : 0;
                return Math.max(0, Math.round(ms/60000));
            }catch(e){ return null; }
        }
        function __impAgeTxt(m){
            if (m==null) return '?';
            if (m<1) return '\u00e0 l\u2019instant';
            if (m<60) return 'il y a '+m+' min';
            var h=Math.floor(m/60); return 'il y a '+h+'h'+((m%60)?(' '+(m%60)+'min'):'');
        }

        function __impInjectChantiersCSS(){
            if (document.getElementById('imp-ch-css')) return;
            var css =
              '#ImperatorOverviewChantiersTable td{padding:0;border:none;background:none;}' +
              '.imp-ch-wrap{font-family:sans-serif;color:#5A3E1B;padding:10px;}' +
              '.imp-ch-list{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start;}' +
              '.imp-ch-prot-wrap{margin-bottom:9px;padding-bottom:8px;border-bottom:1px solid #E4D3A5;}' +
              '.imp-ch-prot-h{font-size:10px;color:#8A6D39;margin-bottom:5px;}' +
              '.imp-ch-prot-list{display:flex;flex-wrap:wrap;gap:4px;}' +
              '.imp-ch-prot{font-size:11px;padding:2px 9px;border-radius:9px;border:1px solid #C6A85E;background:#F0E2C0;color:#8A6D39;text-decoration:none;}' +
              '.imp-ch-prot.on{background:#F3D0C0;border-color:#C97A54;color:#A34E1D;font-weight:600;}' +
              '#ImperatorOverviewBoissonsTable td{padding:0;border:none;background:none;}' +
              '.imp-boisson-group{border:1px solid #E4D3A5;background:#FCF5E1;border-radius:6px;padding:10px 12px;margin-bottom:8px;}' +
              '.imp-boisson-members{display:flex;flex-direction:column;gap:3px;margin-top:6px;}' +
              '.imp-boisson-mrow{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;font-size:12px;color:#5A3E1B;}' +
              '.imp-boisson-mrow .bnm{font-weight:600;min-width:92px;} .imp-boisson-mrow .blvl{color:#8A6D39;font-variant-numeric:tabular-nums;min-width:80px;}' +
              '.imp-boisson-mrow.def{background:#FBEFD9;border-radius:4px;padding:2px 5px;}' +
              '.imp-boisson-cfg{font-size:11px;font-weight:400;color:#8A6D39;margin-left:10px;}' +
              '.imp-boisson-trigger{width:82px;font-size:11px;padding:1px 4px;border:1px solid #B4914E;border-radius:4px;background:#FCF5E1;color:#5A3E1B;}' +
              '.imp-ch-head{font-size:14px;font-weight:600;margin-bottom:9px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}' +
              '.imp-ch-refresh-wrap{margin-left:auto;display:flex;align-items:center;gap:8px;font-weight:400;}' +
              '.imp-ch-refresh{font-size:11px;padding:3px 10px;border-radius:9px;border:1px solid #B4914E;background:#EFDEB2;color:#8A6D39;text-decoration:none;white-space:nowrap;cursor:pointer;}' +
              '.imp-ch-fresh{font-size:10px;color:#8A6D39;opacity:.85;}' +
              '.imp-ch-age{color:#8A6D39;opacity:.75;} .imp-ch-stale{color:#B5651D;font-weight:600;}' +
              '.imp-ch-count{background:#B98F45;color:#FBF4DE;border-radius:10px;font-size:11px;padding:1px 8px;margin-left:6px;}' +
              '.imp-ch-empty{font-size:12px;color:#8A6D39;text-align:center;padding:22px 10px;line-height:1.6;}' +
              '.imp-ch-row{display:flex;align-items:flex-start;gap:11px;padding:10px 12px;border:1px solid #E4D3A5;background:#FCF5E1;border-radius:6px;margin-bottom:6px;}' +
              '.imp-ch-main{flex:1;min-width:0;text-align:left;}' +
              '.imp-ch-t{font-size:13px;font-weight:600;} .imp-ch-c{font-size:11px;color:#8A6D39;margin-bottom:6px;}' +
              '.imp-ch-grid{display:grid;grid-template-columns:auto auto auto auto;column-gap:16px;row-gap:2px;width:max-content;margin:5px 0 7px;font-size:12px;}' +
              '.imp-ch-grid .gh{font-size:10px;font-weight:600;color:#8A6D39;padding-bottom:3px;border-bottom:1px solid #EADFBE;}' +
              '.imp-ch-grid .gc{color:#5A3E1B;} .imp-ch-grid .gr{text-align:right;font-variant-numeric:tabular-nums;} .imp-ch-grid .gm{color:#8A6D39;}' +
              '.imp-ch-grid5{grid-template-columns:auto auto auto auto auto;column-gap:14px;} .imp-ch-inc{color:#2E7D8E;font-weight:600;}' +
              '.imp-ch-enroute{font-size:11px;color:#2E7D8E;margin:4px 0 2px;padding:3px 8px;background:#E4F0F2;border-radius:5px;display:inline-block;}' +
              '.imp-ch-sent{color:#3E7D2A;font-weight:600;} .imp-ch-sent-line{background:#EAF3E0;border-radius:4px;}' +
              '.imp-ch-def{color:#B5651D;font-weight:600;font-variant-numeric:tabular-nums;} .imp-ch-okmark{color:#3E7D2A;font-weight:600;}' +
              '.imp-ch-rt{margin-top:8px;padding-top:7px;border-top:1px dashed #E4D3A5;}' +
              '.imp-ch-rt-h{font-size:10px;font-weight:700;color:#8A6D39;margin-bottom:5px;letter-spacing:.05em;}' +
              '.imp-ch-rt-res{font-size:12px;margin:4px 0 1px;} .imp-ch-rt-res .r{font-weight:600;}' +
              '.imp-ch-rt-env{font-size:12px;color:#5A3E1B;margin-left:14px;display:flex;flex-wrap:wrap;align-items:baseline;gap:3px 6px;} .imp-ch-rt-env .q{font-weight:600;} .imp-ch-rt-env .meta{color:#8A6D39;}' +
              '.imp-ch-rt-warn{font-size:11px;color:#B5651D;margin-left:14px;}' +
              '.imp-ch-foot2{font-size:11px;color:#8A6D39;padding-top:6px;margin-top:6px;border-top:1px solid #EADFBE;}' +
              '.imp-ch-side{display:flex;flex-direction:column;align-items:flex-end;gap:6px;white-space:nowrap;}' +
              '.imp-ch-badge{font-size:11px;padding:3px 9px;border-radius:10px;background:#F0E2C0;color:#8A6D39;border:0.8px solid #C6A85E;}' +
              '.imp-ch-badge-ok{background:#DDE8C4;color:#3E7D2A;border-color:#8FB06A;} .imp-ch-badge-err{background:#F3D9C0;color:#A34E1D;border-color:#C98A5A;}' +
              '.imp-ch-del{font-size:11px;padding:5px 10px;border-radius:5px;border:1px solid #B4914E;background:#EFDEB2;color:#8A6D39;cursor:pointer;text-decoration:none;}' +
              '.imp-ch-prep,.imp-ch-goto{font-size:11px;margin-left:auto;padding:2px 8px;border-radius:9px;border:1px solid #B4914E;text-decoration:none;white-space:nowrap;flex:0 0 auto;}' +
              '.imp-ch-prep{background:#D8B871;color:#5A3E1B;font-weight:600;} .imp-ch-goto{background:#EFDEB2;color:#8A6D39;}' +
              '.imp-ch-fl{margin-top:8px;padding-top:7px;border-top:1px dashed #E4D3A5;}' +
              '.imp-ch-fl-h{font-size:10px;font-weight:700;color:#8A6D39;margin-bottom:5px;letter-spacing:.05em;}' +
              '.imp-ch-fl-line{font-size:12px;color:#5A3E1B;margin:2px 0;}' +
              '.imp-ch-fl-ms{font-weight:600;} .imp-ch-fl-warn{color:#B5651D;}' +
              '.imp-ch-fl-src{font-size:11px;color:#8A6D39;margin-left:14px;}' +
              '.imp-ch-foot{font-size:11px;color:#8A6D39;margin-top:8px;padding-top:8px;border-top:1px solid #E4D3A5;line-height:1.5;}';
            var st=document.createElement('style'); st.id='imp-ch-css'; st.textContent=css; document.head.appendChild(st);
        }

        function __impInitChantiersDelegation(){
            if (window.__impChantiersDelegationDone) return;
            window.__impChantiersDelegationDone = true;
            document.addEventListener('click', function(e){
                var t=e.target;
                var prot = t.closest && t.closest('.imp-ch-prot[data-protect]');
                if (prot){
                    e.preventDefault();
                    var pid=prot.getAttribute('data-protect'), arr=window.ImperatorProtected||[], idx=-1;
                    for (var k=0;k<arr.length;k++){ if(String(arr[k])===String(pid)){ idx=k; break; } }
                    if (idx>-1) arr.splice(idx,1); else arr.push(pid);
                    window.ImperatorProtected=arr;
                    if (window.__impSaveProtected) window.__impSaveProtected();
                    if (window.__impChantiersRedraw) window.__impChantiersRedraw();
                    return;
                }
                var goTo = t.closest && t.closest('.imp-ch-goto[data-from]');
                if (goTo){ e.preventDefault(); try{ GM_setValue('imperator_reopen_tab', goTo.getAttribute('data-reopen')||'chantiers'); }catch(x){} try{ var c=__impFindCity(goTo.getAttribute('data-from')); if(c) IkaTools.View.activateCity(c); }catch(x){} return; }
                var prep = t.closest && t.closest('.imp-ch-prep[data-to]');
                if (prep){ e.preventDefault(); __impPrepareEnvoi({ from:prep.getAttribute('data-from'), to:prep.getAttribute('data-to'), res:prep.getAttribute('data-res'), qty:parseInt(prep.getAttribute('data-qty'),10), ships:parseInt(prep.getAttribute('data-ships'),10), fleet:prep.getAttribute('data-fleet'), reopen:prep.getAttribute('data-reopen')||'chantiers' }); return; }
                var del = t.closest && t.closest('.imp-ch-del[data-id]');
                if (del){ e.preventDefault(); var id=del.getAttribute('data-id'); window.ImperatorChantiers=(window.ImperatorChantiers||[]).filter(function(c){return c.id!==id;}); if(window.__impSaveChantiers) window.__impSaveChantiers(); if(window.__impChantiersRedraw) window.__impChantiersRedraw(); return; }
            }, false);
            document.addEventListener('change', function(e){
                var inp = (e.target && e.target.closest) ? e.target.closest('.imp-boisson-trigger') : null;
                if (!inp) return;
                var v = parseInt(String(inp.value).replace(/[^0-9]/g,''),10);
                if (isNaN(v)) v = __impWineTrigger();
                v = Math.max(0, Math.min(v, __IMP_WINE_TARGET));
                window.ImperatorWineTrigger = v;
                if (window.__impSaveWineTrigger) window.__impSaveWineTrigger();
                if (window.__impBoissonsRedraw) window.__impBoissonsRedraw();
            }, false);
        }

        /* ---- Réouverture auto de Chantiers après un transport (Préparer) ----
         * goToLocalView charge en AJAX : quand le transport se ferme (retour à
         * CITY_DETAIL), on rouvre l'onglet Chantiers -> le statut passe en "envoyé"
         * sans fermer/rouvrir à la main. Écouteur additif, aucun code coeur modifié. */
        function __impInitTransportReopen(){
            if (window.__impTransportReopenInit) return;
            window.__impTransportReopenInit = true;
            try{
                IkaTools.View.registerIkariamAjaxResponseCallback(function(response){
                    try{
                        IkaTools.Utils.iterateIkariamAjaxResponse(response, function(i,name,data){
                            if (name!==IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) return;
                            var view=data[0];
                            if (view===IkaTools.Constants.View.CITY_DETAIL && window.__impReopenAfterTransport){
                                var which=window.__impReopenAfterTransport; window.__impReopenAfterTransport=null;
                                try{ if(which==='boissons' && window.ImperatorOpenBoissons) window.ImperatorOpenBoissons(); else if(window.ImperatorOpenChantiers) window.ImperatorOpenChantiers(); }catch(e){}
                            }
                            if (view!==IkaTools.Constants.View.TRANSPORT) window.__impReopenAfterTransport=null;
                        });
                    }catch(e){}
                });
            }catch(e){}
        }

        function __impProtectedPanel(){
            var cities=[]; try{ cities=IkaTools.EmpireData.getOwnCities(); }catch(e){}
            if (!cities.length) return '';
            var chips=cities.map(function(c){
                var id=String(c.getId()), name=(c.getName?c.getName():id), on=__impIsProtected(id);
                return '<a class="imperator_link imp-ch-prot'+(on?' on':'')+'" href="javascript:void(0)" data-protect="'+__impEsc(id)+'">'+__impEsc(name)+'</a>';
            }).join('');
            return '<div class="imp-ch-prot-wrap"><div class="imp-ch-prot-h">Villes prot\u00e9g\u00e9es \u2014 clique pour exclure une ville des sources de routage</div>'+
                   '<div class="imp-ch-prot-list">'+chips+'</div></div>';
        }

        function makeChantiersTab(){
            __impInjectChantiersCSS();
            __impInitChantiersDelegation();
            __impInitTransportReopen();

            function renderLines(lines){
                var cells = lines.map(function(l){
                    var ecart = l.deficit>0 ? '<div class="imp-ch-def gr">-'+__impFmt(l.deficit)+'</div>'
                                            : '<div class="imp-ch-okmark gr">\u2713</div>';
                    var incCell = (l.incoming>0) ? '<div class="gc gr imp-ch-inc">+'+__impFmt(l.incoming)+'</div>'
                                                 : '<div class="gc gr gm">\u2014</div>';
                    return '<div class="gc">'+__impEsc(l.label)+'</div>'+
                           '<div class="gc gr">'+__impFmt(l.need)+'</div>'+
                           '<div class="gc gr gm">'+__impFmt(l.stock)+'</div>'+
                           incCell + ecart;
                }).join('');
                return '<div class="imp-ch-grid imp-ch-grid5">'+
                       '<div class="gh">Ressource</div><div class="gh gr">Besoin</div><div class="gh gr">Stock</div><div class="gh gr">En route</div><div class="gh gr">\u00c9cart</div>'+
                       cells + '</div>';
            }

            function renderRoutage(r, b){
                var R = IkaTools.Constants.Resources;
                var order=[R.WOOD,R.WINE,R.MARBLE,R.GLASS,R.SULFUR], labels={};
                labels[R.WOOD]='Bois'; labels[R.WINE]='Vin'; labels[R.MARBLE]='Marbre'; labels[R.GLASS]='Cristal'; labels[R.SULFUR]='Soufre';
                var incByRes=(b && b.incomingByRes)?b.incomingByRes:{};
                var html='<div class="imp-ch-rt"><div class="imp-ch-rt-h">ROUTAGE</div>', shown=false;
                order.forEach(function(key){
                    var sent=incByRes[key]||[], todo=r.byResource[key];
                    if (!sent.length && !todo) return;
                    shown=true;
                    var head='<span class="r">'+__impEsc(labels[key])+'</span>';
                    if (todo){
                        var loaded=todo.envois.reduce(function(s,e){return s+e.quantity;},0);
                        head+=' \u00b7 reste '+__impFmt(todo.deficit)+(loaded?(' \u2192 '+__impFmt(loaded)+' charg\u00e9s'):'');
                    } else { head+=' \u00b7 <span class="imp-ch-sent">tout envoy\u00e9</span>'; }
                    html+='<div class="imp-ch-rt-res">'+head+'</div>';
                    sent.forEach(function(e){
                        var arrTxt=''; try{ if(e.arrival!=null){ var m=Math.max(0,Math.round((e.arrival-IkaTools.View.gameTimeNow())/60000)); arrTxt=' \u00b7 arrive dans '+__impFmtDur(m); } }catch(x){}
                        html+='<div class="imp-ch-rt-env imp-ch-sent-line"><span class="imp-ch-sent">\u2713 envoy\u00e9</span> <span class="q">'+__impFmt(e.qty)+'</span> depuis '+__impEsc(e.fromName)+'<span class="meta">'+arrTxt+'</span></div>';
                    });
                    if (todo){
                        todo.envois.forEach(function(e){
                            var distTxt=(e._dist<0.5)?'m\u00eame \u00eele':(Math.round(e._dist*10)/10+' \u00eeles');
                            var src=__impFindCity(e.fromCityId), active=false;
                            try{ active=src && IkaTools.View.isActiveCity(src); }catch(x){}
                            var am=__impAge(src);
                            var ageMeta=(am!=null)?(' <span class="'+((am>__IMP_STALE_MIN)?'imp-ch-stale':'imp-ch-age')+'">\u00b7 '+__impAgeTxt(am)+'</span>'):'';
                            var action=active
                              ? '<a class="imperator_link imp-ch-prep" href="javascript:void(0)" data-from="'+e.fromCityId+'" data-to="'+e.toCityId+'" data-res="'+e.resource+'" data-qty="'+e.quantity+'" data-ships="'+e._shipsFast+'" data-fleet="fast">Pr\u00e9parer</a>'
                              : '<a class="imperator_link imp-ch-goto" href="javascript:void(0)" data-from="'+e.fromCityId+'">Aller \u00e0 '+__impEsc(e._fromName)+'</a>';
                            html+='<div class="imp-ch-rt-env">\u2192 <span class="q">'+__impFmt(e.quantity)+'</span> depuis '+__impEsc(e._fromName)+' <span class="meta">('+e._shipsFast+' nav., '+distTxt+')</span>'+ageMeta+' '+action+'</div>';
                        });
                        if (!todo.covered){
                            if (key===R.WINE && todo.envois.length===0) html+='<div class="imp-ch-rt-warn">Aucune ville de vin avec surplus disponible.</div>';
                            else html+='<div class="imp-ch-rt-warn">Surplus insuffisant pour couvrir le d\u00e9ficit.</div>';
                        }
                    }
                });
                html+='</div>';
                return shown?html:'';
            }

            function renderFlotte(fl){
                var h='<div class="imp-ch-fl"><div class="imp-ch-fl-h">FLOTTE &amp; MAKESPAN (estimation)</div>';
                fl.materials.forEach(function(m){
                    if (m.fleet==='mixte'){
                        h+='<div class="imp-ch-fl-line"><b>'+__impEsc(m.label)+'</b> : mixte \u00b7 '+m.cargoShips+' charge + '+m.fast.totalShips+' rapides \u00b7 ~'+__impFmtDur(m.makespanMin)+
                           ' <span style="color:#3E7D2A">(gain '+__impFmtDur(m.gain)+' vs rapide seul)</span></div>';
                    } else {
                        h+='<div class="imp-ch-fl-line"><b>'+__impEsc(m.label)+'</b> : rapide \u00b7 '+m.fast.totalShips+' nav.'+
                           (m.fast.fits?'':' <span class="imp-ch-fl-warn">('+m.fast.rotations+' rotations)</span>')+' \u00b7 ~'+__impFmtDur(m.makespanMin)+'</div>';
                    }
                    if (!m.covered) h+='<div class="imp-ch-fl-src imp-ch-fl-warn">surplus insuffisant (navires pleins) pour couvrir enti\u00e8rement</div>';
                });
                h+='<div class="imp-ch-fl-line imp-ch-fl-ms">Makespan du chantier : ~'+__impFmtDur(fl.chantierMakespanMin)+' <span style="opacity:.6;font-weight:400">(le plus long des flux \u00b7 trajet de base, hors r\u00e9ductions)</span></div>';
                h+='<div class="imp-ch-fl-line" style="opacity:.8">Flotte libre : '+fl.F+' rapides \u00b7 '+fl.C+' navires de charge</div>';
                h+='</div>';
                return h;
            }

            function renderRow(c){
                var __comp = __impCompletion(c);
                if (__comp.state==='building'){
                    var bb=__impComputeBilan(c);
                    var t=(bb && bb.ok && bb.name)?__impEsc(bb.name):('B\u00e2timent \u00b7 empl. '+__impEsc(c.position));
                    var ct=(bb && bb.ok && bb.cityName)?__impEsc(bb.cityName):('Cit\u00e9 '+__impEsc(c.cityId));
                    return '<div class="imp-ch-row"><div class="imp-ch-main">'+
                             '<div class="imp-ch-t">'+t+'</div>'+
                             '<div class="imp-ch-c">'+ct+' \u00b7 niveau '+__comp.level+' \u2192 '+__comp.target+'</div>'+
                             '<div class="imp-ch-foot2"><span class="imp-ch-sent">Am\u00e9lioration lanc\u00e9e</span> \u2014 en construction. Le chantier se clora \u00e0 la fin des travaux.</div>'+
                           '</div><div class="imp-ch-side">'+
                             '<span class="imp-ch-badge imp-ch-badge-ok">En construction</span>'+
                             '<a class="imperator_link imp-ch-del" href="javascript:void(0)" data-id="'+__impEsc(c.id)+'">Archiver</a>'+
                           '</div></div>';
                }
                var b = __impComputeBilan(c);
                var title = (b && b.ok && b.name) ? __impEsc(b.name) : ('B\u00e2timent \u00b7 empl. ' + __impEsc(c.position));
                var lvlTxt = (b && b.ok) ? ('niveau '+b.currentLevel+' \u2192 '+b.targetLevel) : ('niveau vis\u00e9 '+__impEsc(c.level));
                var cityTxt = (b && b.ok && b.cityName) ? __impEsc(b.cityName) : ('Cit\u00e9 '+__impEsc(c.cityId));
                var ageM = (b && b.ok) ? b.ageMin : null;
                var ageTxt = (ageM!=null) ? (' \u00b7 <span class="'+((ageM>__IMP_STALE_MIN)?'imp-ch-stale':'imp-ch-age')+'">donn\u00e9es '+__impAgeTxt(ageM)+'</span>') : '';
                var sub = cityTxt + ' \u00b7 ' + lvlTxt + ageTxt;
                var badge, breakdown='', footer, routage='';
                var hasIncoming=false;
                if (b && b.ok && b.incomingByRes){ for (var _k in b.incomingByRes){ if (b.incomingByRes[_k] && b.incomingByRes[_k].length){ hasIncoming=true; break; } } }

                if (b.error){
                    badge='<span class="imp-ch-badge imp-ch-badge-err">donn\u00e9es indispo.</span>';
                    footer='<div class="imp-ch-foot2">Lecture impossible ('+__impEsc(b.error)+') \u2014 rouvre l\u2019aper\u00e7u depuis Buildings.</div>';
                } else if (b.total===0 && !hasIncoming){
                    badge='<span class="imp-ch-badge imp-ch-badge-ok">Couvert localement</span>';
                    breakdown=renderLines(b.lines);
                    footer='<div class="imp-ch-foot2">Tout est en stock \u2014 pr\u00eat \u00e0 construire.'+(b.estimation?' <span style="opacity:.7">(co\u00fbt estim\u00e9)</span>':'')+'</div>';
                } else {
                    breakdown=renderLines(b.lines);
                    var r = __impComputeRoutage(c, b);
                    if (b.total>0){
                        badge='<span class="imp-ch-badge">D\u00e9ficit '+__impFmt(b.total)+'</span>';
                        routage = renderRoutage(r, b) + renderFlotte(__impComputeFlotte(c, b));
                        footer='<div class="imp-ch-foot2">Reste \u00e0 envoyer : '+__impFmt(b.total)+' unit\u00e9s'+(b.estimation?' <span style="opacity:.7">(co\u00fbt estim\u00e9)</span>':'')+'</div>';
                    } else {
                        badge='<span class="imp-ch-badge imp-ch-badge-ok">Tout envoy\u00e9</span>';
                        routage = renderRoutage(r, b);
                        footer='<div class="imp-ch-foot2">Tout est parti \u2014 en attente d\u2019arriv\u00e9e.</div>';
                    }
                }
                return '<div class="imp-ch-row"><div class="imp-ch-main">'+
                         '<div class="imp-ch-t">'+title+'</div><div class="imp-ch-c">'+sub+'</div>'+
                         breakdown + routage + footer +
                       '</div><div class="imp-ch-side">'+badge+
                         '<a class="imperator_link imp-ch-del" href="javascript:void(0)" data-id="'+__impEsc(c.id)+'">Retirer</a>'+
                       '</div></div>';
            }

            function makeTableContent(){
                var list = window.ImperatorChantiers || [];
                (function(){ var kept=[], pruned=false; list.forEach(function(c){ if(__impCompletion(c).state==='done') pruned=true; else kept.push(c); }); if(pruned){ window.ImperatorChantiers=kept; if(window.__impSaveChantiers) window.__impSaveChantiers(); list=kept; } })();
                var header = '<div class="imp-ch-head">Chantiers <span class="imp-ch-count">'+list.length+'</span>'+
                             '<span class="imp-ch-refresh-wrap"><span class="imp-ch-fresh">ressources rafra\u00eechies \u00e0 chaque visite de ville \u00b7 fra\u00eecheur indiqu\u00e9e par source</span></span></div>';
                var body;
                if (!list.length){
                    body='<div class="imp-ch-empty">Aucun chantier.<br>Survole un b\u00e2timent dans l\u2019onglet <b>Buildings</b> et clique <b>Planifier</b>.</div>';
                } else {
                    body='<div class="imp-ch-list">'+list.map(renderRow).join('')+'</div>'+
                         '<div class="imp-ch-foot">Moteur + ex\u00e9cution (2 temps) \u00b7 le clic pr\u00e9-remplit le transport, l\u2019envoi reste manuel.</div>';
                }
                return '<tbody><tr><td><div class="imp-ch-wrap">'+header+__impProtectedPanel()+body+'</div></td></tr></tbody>';
            }

            var tab = new Tab('chantiers', 'Chantiers', $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewChantiersTable"/>' +
                '</div>'),
                'ImperatorOverviewChantiersTable',
                function(){ window.__impChantiersRedraw = function(){ tab.maybeRedraw(true); }; },
                makeTableContent);

            return tab.getTab();
        }
        /* ===== IMPERATOR — Service de boissons (vin) ===== */
        var __IMP_WINE_TARGET = 100000, __IMP_WINE_SRC_FLOOR = 50000;
        window.__impSaveWineTrigger = function(){ try{ GM_setValue('imperator_wine_trigger', String(window.ImperatorWineTrigger)); }catch(e){} };
        window.__impLoadWineTrigger = function(){ var v=85000; try{ v=parseInt(GM_getValue('imperator_wine_trigger','85000'),10); if(isNaN(v)) v=85000; }catch(e){} window.ImperatorWineTrigger=Math.max(0,Math.min(v,__IMP_WINE_TARGET)); };
        window.__impLoadWineTrigger();
        function __impWineTrigger(){ var v=window.ImperatorWineTrigger; return (typeof v==='number' && !isNaN(v))?v:85000; }

        function __impWineGroups(){
            var R=IkaTools.Constants.Resources, cities=[];
            try{ cities=IkaTools.EmpireData.getOwnCities(); }catch(e){}
            var groups=[], others=[];
            cities.forEach(function(c){
                var isWine=false; try{ isWine=(c.getTradeGoodType && c.getTradeGoodType()===R.WINE); }catch(e){}
                if (isWine) groups.push({source:c, members:[]}); else others.push(c);
            });
            if (!groups.length) return [];
            others.forEach(function(c){
                var best=null, bd=Infinity, cc=null; try{ cc=c.getIslandCoordinates(); }catch(e){}
                groups.forEach(function(g){ var d=__impDist(cc, g.source.getIslandCoordinates()); if(d<bd){ bd=d; best=g; } });
                if (best) best.members.push(c);
            });
            return groups;
        }

        function __impWinePlan(g){
            var R=IkaTools.Constants.Resources, CAP=__IMP_CAP_FAST;
            var srcWine=0; try{ var rr=g.source.getResource(R.WINE); srcWine=(rr&&rr.getCurrent)?Math.floor(rr.getCurrent()):0; }catch(e){}
            var availShips=Math.max(0, Math.floor((srcWine-__IMP_WINE_SRC_FLOOR)/CAP));
            var TRIGGER=__impWineTrigger();
            var rows=g.members.map(function(c){
                var wine=0; try{ var r=c.getResource(R.WINE); wine=(r&&r.getCurrent)?Math.floor(r.getCurrent()):0; }catch(e){}
                var needs=(wine<TRIGGER);
                return { city:c, wine:wine, needs:needs, deficit:needs?Math.max(0,__IMP_WINE_TARGET-wine):0, envoiQty:0, envoiShips:0, shortfall:false };
            });
            rows.filter(function(x){return x.needs && x.deficit>0;})
                .sort(function(a,b){return b.deficit-a.deficit;})
                .forEach(function(x){
                    var need=Math.ceil(x.deficit/CAP), take=Math.min(need, availShips);
                    if (take>0){ x.envoiShips=take; x.envoiQty=take*CAP; availShips-=take; }
                    x.shortfall=(take<need);
                });
            return { source:g.source, srcWine:srcWine, distributable:Math.max(0,srcWine-__IMP_WINE_SRC_FLOOR), rows:rows };
        }

        function makeBoissonsTab(){
            __impInjectChantiersCSS();
            __impInitChantiersDelegation();
            __impInitTransportReopen();

            function memberRow(g, x){
                var name=(x.city.getName?x.city.getName():String(x.city.getId()));
                var age=__impAge(x.city);
                var ageTxt=(age!=null)?(' <span class="'+((age>__IMP_STALE_MIN)?'imp-ch-stale':'imp-ch-age')+'">\u00b7 '+__impAgeTxt(age)+'</span>'):'';
                if (x.wine>=__IMP_WINE_TARGET){
                    return '<div class="imp-boisson-mrow"><span class="bnm">'+__impEsc(name)+'</span><span class="blvl">'+__impFmt(x.wine)+' vin</span><span class="imp-ch-sent">\u2713 \u00e0 niveau</span>'+ageTxt+'</div>';
                }
                if (!x.needs){
                    return '<div class="imp-boisson-mrow"><span class="bnm">'+__impEsc(name)+'</span><span class="blvl">'+__impFmt(x.wine)+' vin</span><span class="imp-ch-age">au-dessus du seuil</span>'+ageTxt+'</div>';
                }
                var src=g.source, srcName=(src.getName?src.getName():String(src.getId())), active=false;
                try{ active=IkaTools.View.isActiveCity(src); }catch(e){}
                var action='';
                if (x.envoiShips>0){
                    action = active
                      ? '<a class="imperator_link imp-ch-prep" href="javascript:void(0)" data-from="'+src.getId()+'" data-to="'+x.city.getId()+'" data-res="wine" data-qty="'+x.envoiQty+'" data-ships="'+x.envoiShips+'" data-fleet="fast" data-reopen="boissons">Pr\u00e9parer</a>'
                      : '<a class="imperator_link imp-ch-goto" href="javascript:void(0)" data-from="'+src.getId()+'" data-reopen="boissons">Aller \u00e0 '+__impEsc(srcName)+'</a>';
                }
                var envoiTxt = (x.envoiShips>0)
                    ? ('<span class="benv">\u2192 '+__impFmt(x.envoiQty)+' ('+x.envoiShips+' nav.)'+(x.shortfall?' <span class="imp-ch-rt-warn">partiel</span>':'')+'</span>')
                    : '<span class="imp-ch-rt-warn">source insuffisante (plancher 50 000)</span>';
                return '<div class="imp-boisson-mrow def"><span class="bnm">'+__impEsc(name)+'</span><span class="blvl">'+__impFmt(x.wine)+' vin</span><span class="imp-ch-def">d\u00e9ficit '+__impFmt(x.deficit)+'</span>'+envoiTxt+ageTxt+' '+action+'</div>';
            }

            function renderGroup(g){
                var plan=__impWinePlan(g);
                var srcName=(g.source.getName?g.source.getName():String(g.source.getId()));
                var nbDef=plan.rows.filter(function(x){return x.deficit>0;}).length;
                return '<div class="imp-boisson-group">'+
                         '<div class="imp-ch-t">Groupe \u00b7 '+__impEsc(srcName)+'</div>'+
                         '<div class="imp-ch-c">'+__impEsc(srcName)+' : '+__impFmt(plan.srcWine)+' vin \u00b7 distribuable '+__impFmt(plan.distributable)+' \u00b7 '+(nbDef?(nbDef+' \u00e0 ravitailler'):'tout \u00e0 niveau')+'</div>'+
                         '<div class="imp-boisson-members">'+plan.rows.map(function(x){return memberRow(g,x);}).join('')+'</div>'+
                       '</div>';
            }

            function makeContent(){
                var groups=__impWineGroups();
                var body = groups.length ? groups.map(renderGroup).join('')
                    : '<div class="imp-ch-empty">Aucune ville productrice de vin d\u00e9tect\u00e9e.</div>';
                return '<tbody><tr><td><div class="imp-ch-wrap">'+
                       '<div class="imp-ch-head">Service de boissons'+
                         '<span class="imp-boisson-cfg">Seuil de r\u00e9appro : <input type="number" class="imp-boisson-trigger" value="'+__impWineTrigger()+'" min="0" max="'+__IMP_WINE_TARGET+'" step="1000"> vin <span class="imp-ch-age">(r\u00e9appro si en-dessous \u00b7 remplissage \u00e0 '+__impFmt(__IMP_WINE_TARGET)+')</span></span>'+
                       '</div>'+
                       body+
                       '<div class="imp-ch-foot">Cible '+__impFmt(__IMP_WINE_TARGET)+' vin/ville \u00b7 les sources gardent '+__impFmt(__IMP_WINE_SRC_FLOOR)+' \u00b7 navires pleins (580). Une visite \u00e0 la ville de vin = tu prépares tous ses envois d\u2019affilée.</div>'+
                       '</div></td></tr></tbody>';
            }

            var tab = new Tab('boissons', 'Service de boissons', $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewBoissonsTable"/>' +
                '</div>'),
                'ImperatorOverviewBoissonsTable',
                function(){
                    window.__impBoissonsRedraw = function(){ tab.maybeRedraw(true); };
                    try{ IkaTools.EmpireData.registerResourcesChangedHandler(function(){
                        var ae=document.activeElement;
                        if (ae && ae.classList && ae.classList.contains('imp-boisson-trigger')) return; // pas de redraw pendant l'\u00e9dition du seuil
                        tab.maybeRedraw(true);
                    }); }catch(e){}
                },
                makeContent);
            return tab.getTab();
        }
        /* ===== FIN Service de boissons ===== */

              //////////////////////////////////////
        /* ===== FIN Onglet Chantiers ===== */
        //////////////////////////////////////



        var makePopup = IkaTools.Utils.thunk(function makePopup() {
            var resourceTab = makeResourceTab();
            var buildingsTab = makeBuildingsTab();
            var militaryTab = makeMilitaryTab();
            var espionageTab = makeEspionageTab();
            var dashboardTab = makeDashboardTab();
            var chantiersTab = makeChantiersTab();
            var boissonsTab = makeBoissonsTab();

            var tabPane = new IkaTools.UI.TabPane(
                [resourceTab, buildingsTab, militaryTab, espionageTab, dashboardTab, chantiersTab, boissonsTab],
                {
                    tabActivatedCallback: function() {
                        IkaTools.UI.resizePopup();
                    },
                });


            function resizeImperatorWindow() {
                setTimeout(function() {
                    var $box = $('#cityBuildings');
                    $box.css({
                        'width': 'auto',
                        'min-width': '1150px',
                        'max-width': '98vw',
                        'background-size': '100% 100%'
                    });
                    $box.find('.mainContent, .minimizableContent, .hd, .ft').css({
                        'width': 'auto',
                        'min-width': '1150px',
                        'background-size': '100% 100%'
                    });
                    $box.find('.bd').css({
                        'width': 'auto',
                        'min-width': '1150px',
                    });
                }, 100);
            }

            var popup = new IkaTools.UI.PopupWindow(
                'cityBuildings',
                $('<div>Imperator Overview</div>'),
                tabPane.getContainer(),
                { oversized:true,
                 deactivatedCallback: function() {
                     resourceTab.deactivated();
                     buildingsTab.deactivated();
                     militaryTab.deactivated();
                     espionageTab.deactivated();
                 },
                }
            );


              window.ImperatorOpenChantiers = function () {
                popup.display(true);
                chantiersTab.activate();
                if (window.__impChantiersRedraw) window.__impChantiersRedraw();
                resizeImperatorWindow();
            };


              window.ImperatorOpenBoissons = function () {
                popup.display(true);
                boissonsTab.activate();
                if (window.__impBoissonsRedraw) window.__impBoissonsRedraw();
                resizeImperatorWindow();
            };


            function displayResources() {
                popup.display(true);
                resourceTab.activate();
                resizeImperatorWindow();
            }
            function displayBuildings() {
                popup.display(true);
                buildingsTab.activate();
                resizeImperatorWindow();
            }
            function displayMilitary() {
                popup.display(true);
                militaryTab.activate();
                resizeImperatorWindow();
            }
            function displayEspionage() {
                popup.display(true);
                espionageTab.activate();
                resizeImperatorWindow();
            }

            IkaTools.View.registerIkariamAjaxResponseCallback(
                function resetReopenTabVars(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response,
                                                              function lookForChangeView(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                            var view = data[0];
                            if (view == IkaTools.Constants.View.CITY_DETAIL) {
                                if (openResourcesTabOnTransportClose) {
                                    popup.display(true);
                                    resourceTab.activate();
                                }
                                if (openBuildingsTabOnTransportClose) {
                                    popup.display(true);
                                    buildingsTab.activate();
                                }
                                if (openMilitaryTabOnDeploymentClose) {
                                    popup.display(true);
                                    militaryTab.activate();
                                }
                            }
                            if (view != IkaTools.Constants.View.TRANSPORT) {
                                openResourcesTabOnTransportClose = false;
                                openBuildingsTabOnTransportClose = false;
                            }
                            if (view != IkaTools.Constants.View.DEPLOY) {
                                openMilitaryTabOnDeploymentClose = false;
                            }
                        }
                    });
                });

            return {
                displayResources: displayResources,
                displayBuildings: displayBuildings,
                displayMilitary: displayMilitary,
                displayEspionage: displayEspionage,
                close: popup.close.bind(popup),
            };
        });


        //PARTIE OPTIMISEE

        const menuImageUrl = '/cdn/all/both/friends/citymenu.png';

        function createMenuItem(imagePositionY, localizationKey) {
            return $(`
    <li>
      <div class="image" style="background: url(${menuImageUrl}) no-repeat 0 ${imagePositionY}px;"></div>
      <div class="name"><span class="namebox">${localizer.localize('misc', localizationKey)}</span></div>
    </li>
  `);
        }

        var leftMenuResourceContent = createMenuItem(-204, 'resource_overview');
        var leftMenuBuildingsContent = createMenuItem(-134, 'buildings_overview');
        var leftMenuArmyContent = createMenuItem(0, 'military_overview');
        var leftMenuEspionageContent = createMenuItem(-71, 'espionage_overview');


        const menuConfigurations = [
            { condition: showResourceOverview.isEnabled(), content: leftMenuResourceContent },
            { condition: showBuildingsOverview.isEnabled(), content: leftMenuBuildingsContent },
            { condition: showMilitaryOverview.isEnabled(), content: leftMenuArmyContent },
            { condition: showEspionageOverview.isEnabled(), content: leftMenuEspionageContent }
        ];

        const menuItems = menuConfigurations
        .filter(config => config.condition)
        .map(config => new IkaTools.UI.LeftMenu.Item(config.content));

        // FIN PARTIE OPTIMISEE


        var leftMenu = new IkaTools.UI.LeftMenu(menuItems, { atTop: true });
        leftMenu.display();

        return function overviewReady() {

            if (showResourceOverview.isEnabled()) {
                leftMenuResourceContent.mousedown(IkaTools.Logging.debuggable(
                    { label: 'Imperator.overview.showResourceTable.mousedown',
                     alwaysTime: true, profile: true },
                    function() {
                        makePopup().displayResources();
                    }));
            }
            if (showBuildingsOverview.isEnabled()) {
                leftMenuBuildingsContent.mousedown(IkaTools.Logging.debuggable(
                    { label: 'Imperator.overview.showBuildingsTable.mousedown',
                     alwaysTime: true, profile: true },
                    function() {
                        makePopup().displayBuildings();
                    }));
            }
            if (showMilitaryOverview.isEnabled()) {
                leftMenuArmyContent.mousedown(IkaTools.Logging.debuggable(
                    { label: 'Imperator.overview.showMilitaryTable.mousedown',
                     alwaysTime: true, profile: true },
                    function() {
                        makePopup().displayMilitary();
                    }));
            }
            if (showEspionageOverview.isEnabled()) {
                IkaTools.EmpireData.Espionage.startTracking();
                leftMenuEspionageContent.mousedown(IkaTools.Logging.debuggable(
                    { label: 'Imperator.overview.showEspionageTable.mousedown',
                     alwaysTime: true, profile: true},
                    function() {
                        makePopup().displayEspionage();
                    }));
            }
        };
    }

    function registerLoggingEventHandlers() {
        IkaTools.EmpireData.registerResourcesChangedHandler(function(changes) {
            IkaTools.Logging.debug('Resources changed: ', changes);
        });
        IkaTools.EmpireData.registerBuildingsChangedHandler(function(changes) {
            IkaTools.Logging.debug('Buildings changed: ', changes);
        });
        IkaTools.EmpireData.registerMilitaryChangedHandler(function(changes) {
            IkaTools.Logging.debug('Military changed: ', changes);
        });
        IkaTools.EmpireData.registerCivilizationDataChangedHandler(function(changes) {
            IkaTools.Logging.debug('CivilizationData changed: ', changes);
        });
        IkaTools.EmpireData.registerMovementsChangedHandler(function(changes) {
            IkaTools.Logging.debug('Movements changed: ', changes);
        });
        IkaTools.EmpireData.Espionage.registerEspionageChangedHandler(function(changes) {
            IkaTools.Logging.debug('Espionage changed: ', changes);
        });
    }

    function fireFakeKeyboardEvent(input) {
        // fake event so Ikariam handlers update related sliders and stuff
        var e = document.createEvent("KeyboardEvent");
        if (e.initKeyboardEvent) {
            e.initKeyboardEvent(
                'keyup', true, true, window, false, false, false, false, 13, 0);
        } else {
            e.initKeyEvent('keyup', true, true, window, false, false, false, false, 13, 0);
        }
        input.dispatchEvent(e);
    }

    function initQuickGoodsButtons() {
        function createButton(input, textName, increment) {
            var button = $('<a class="button" title="%s">%s</a>'.format(
                localizer.localize('tweaks',textName + '_text'),
                localizer.localize('tweaks',textName)));
            button.click(IkaTools.Logging.debuggable(
                'Imperator.quickGoodsSelectIncrement[' + increment + ']',
                function incrementSelectedGoods() {
                    var current = parseInt(input.val()) || 0;
                    var newValue =
                        Math.ceil((current + (increment > 0 ? 1 : -1)) / increment) * increment;
                    input.val(newValue);
                    fireFakeKeyboardEvent(input.get(0));
                }));
            return button;
        }

        function addChangeGoodsButtons(input) {
            var span = $('<span class="quick_goods_select"/>');
            var minus500Button = createButton(input, 'transport_minus_500', -500);
            var plus500Button = createButton(input, 'transport_plus_500', 500);
            var plus1000Button = createButton(input, 'transport_plus_1000', 1000);
            var plus5000Button = createButton(input, 'transport_plus_5000', 5000);
            span.append(minus500Button, plus500Button, plus1000Button, plus5000Button);

            input.after(span);
        }

        var stylesToAdd =
            '.quick_goods_select a, .quick_goods_select a:active {' +
            'margin: 3px; padding: 1px 3px; font-size: 10px; font-weight:normal;' +
            '}' +
            '#transport .quick_goods_select {' +
            'position: absolute;' +
            'top: 6px;' +
            'left: 468px;' +
            '}' +
            '.quick_goods_select {' +
            '-webkit-user-select: none;' +
            '-khtml-user-select: none;' +
            '-moz-user-select: none;' +
            '-o-user-select: none;' +
            'user-select: none;' +
            '}';

        if (transportButtons.isEnabled()) {
            stylesToAdd +=
                '#mission ul.resourceAssign { width: 640px; }' +
                '#mission .resourceAssign li { padding:0px; background-position:0 center;}' +
                '#mission .resourceAssign .sliderinput { margin:0 0 0 30px; width:400px;}' +
                '#mission .resourceAssign input.textfield {' +
                'position:relative;top:-26px;margin-left:-5px;' +
                '}';

            IkaTools.View.registerIkariamAjaxResponseCallback(
                function addTransportButtons(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response,
                                                              function lookForChangeView(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                            var view = data[0];
                            if (view == IkaTools.Constants.View.TRANSPORT ||
                                view == IkaTools.Constants.View.COLONIZE) {
                                $('#transportForm ul.resourceAssign li input').each(
                                    function(index, node) {
                                        addChangeGoodsButtons($(node));
                                    });
                            } else if (view == IkaTools.Constants.View.TAKE_OFFER) {
                                $('#transportForm td.input input').each(
                                    function(index, node) {
                                        addChangeGoodsButtons($(node));
                                    });
                            } else if (view == IkaTools.Constants.View.BRANCH_OFFICE) {
                                $('#branchOffice form[name=formkontor] tr input').filter(':even').each(
                                    function(index, node) {
                                        addChangeGoodsButtons($(node));
                                    });
                            } else if (view == IkaTools.Constants.View.BLACK_MARKET) {
                                $('#blackMarket form[name=formkontor] tr input').filter(':even').each(
                                    function(index, node) {
                                        addChangeGoodsButtons($(node));
                                    });
                            }
                        }
                    });
                }, true);
        }

        if (donationButtons.isEnabled()) {
            stylesToAdd +=
                '#donateForm input.textfield {' +
                'margin-bottom: 6px;' +
                '}';
            IkaTools.View.registerIkariamAjaxResponseCallback(
                function addTransportButtons(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response,
                                                              function lookForChangeView(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                            var view = data[0];
                            if (view == IkaTools.Constants.View.RESOURCE ||
                                view == IkaTools.Constants.View.TRADE_GOOD ) {
                                var input = $('#donateForm input.textfield');

                                var span = $('<span class="quick_goods_select"/>');
                                var plus1kButton = createButton(input, 'donate_plus_1000', 1000);
                                var plus10kButton = createButton(input, 'donate_plus_10000', 10000);
                                var plus100kButton = createButton(input, 'donate_plus_100000', 100000);
                                span.append(plus1kButton, plus10kButton, plus100kButton);

                                input.after(span);
                            }
                        }
                    });
                }, true);
        }

        return stylesToAdd;
    }

    function initBuildingDemolitionHandler() {
        var activeDemolitionInfo = null;

        IkaTools.View.registerIkariamAjaxResponseCallback(
            IkaTools.Utils.forEachIkariamAjaxResponseFunction(
                function demolitionHandler(index, name, value) {
                    if (name == IkaTools.Constants.IkariamAjaxResponseType.ADD_WINDOW &&
                        value[0] == 'buildings_demolition') {
                        var demolitionButton = $('#buildings_demolition a.button');
                        var hrefMatch = demolitionButton.attr('href').match(
                            /function=demolishBuilding&level=(\d+)&cityId=(\d+)&position=(\d+)/);
                        var level = parseInt(hrefMatch[1]);
                        var cityId = parseInt(hrefMatch[2]);
                        var position = parseInt(hrefMatch[3]);

                        if (activeDemolitionInfo &&
                            activeDemolitionInfo.level == level &&
                            activeDemolitionInfo.cityId == cityId &&
                            activeDemolitionInfo.position == position) {
                            activeDemolitionInfo.level = level - 1;
                            demolitionButton[0].click();
                        } else {
                            if (confirm(localizer.localize('tweaks', 'completely_demolish_building_prompt'))) {
                                if (level > 1) {
                                    activeDemolitionInfo = { level: level - 1, cityId: cityId, position: position };
                                    demolitionButton[0].click();
                                } else {
                                    activeDemolitionInfo = null;
                                }
                            }
                        }
                    } else if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                        demolitionButton = $('#buildingUpgrade .downgrade .action_btn');
                        if (demolitionButton.length > 0) {
                            hrefMatch = demolitionButton.attr('href').match(
                                /view=buildings_demolition&cityId=(\d+)&position=(\d+)&level=(\d+)/);
                            if (hrefMatch) {
                                level = parseInt(hrefMatch[3]);
                                cityId = parseInt(hrefMatch[1]);
                                position = parseInt(hrefMatch[2]);

                                if (activeDemolitionInfo &&
                                    activeDemolitionInfo.level == level &&
                                    activeDemolitionInfo.cityId == cityId &&
                                    activeDemolitionInfo.position == position) {
                                    demolitionButton[0].click();
                                }
                            }
                        }
                    }
                }));
    }

    function initTweaks() {
        if (autoAcceptDailyBonus.isEnabled()) {
            function submitDailyActivityBonus() {
                $('#dailyActivityBonus form').submit();
            }
            if (IkaTools.Utils.isChrome()) {
                // Who knows why you would send back a page that then immediately turns around
                // and queries the server it came from.  But then, you are not an Ikariam developer.
                // In all likelihood you posess at least a single brain cell (a sufficient but
                // not necessary condition).
                // In any case, the fact is that in Chrome this starts an ajax call before we
                // have had a chance to hook in any of the ajax handler overrides in developer
                // tools.  So to counteract the stupid things Ikariam developers did we have to
                // do this the bruteforce way.
                setTimeout(submitDailyActivityBonus, 500);
                setTimeout(submitDailyActivityBonus, 1000);
                setTimeout(submitDailyActivityBonus, 2000);
                setTimeout(submitDailyActivityBonus, 5000);
            } else {
                IkaTools.View.registerIkariamAjaxResponseCallback(
                    IkaTools.Utils.forEachIkariamAjaxResponseFunction(
                        function findDailyBonusWindow(index, name, value) {
                            if (name == IkaTools.Constants.IkariamAjaxResponseType.ADD_WINDOW &&
                                value[0] == 'dailyActivityBonus') {
                                submitDailyActivityBonus();
                            }
                        }));
            }
        }

        var addedStyles = '';

        if (hideAds.isEnabled()) {
            addedStyles += '.ad_banner { display: none; } ';
        }
        if (hideFacebook.isEnabled()) {
            addedStyles += '#facebook_button * { display: none !important; } ';
        }
        if (hideFriendsBar.isEnabled()) {
            addedStyles += '#js_viewFriends { display: none; } ';
        }
        if (hideChat.isEnabled()) {
            addedStyles += '#js_viewChat { display: none; } ';
        }

        addedStyles += initQuickGoodsButtons();

        initBuildingDemolitionHandler();

        if (showCityOwners.isEnabled() && IkaTools.View.viewIsIsland()) {
            function doLabelCities(data) {
                for (var i = 0; i < 19; i++) {
                    var cityData = data.cities[i];
                    if (cityData.type != 'buildplace') {
                        $('#js_cityLocation' + i + 'TitleText').append(' (' + cityData.ownerName + ')');
                    }
                }
            }

            addedStyles += '#island .city .scroll_img .center { overflow: hidden; width: 175px; } ' +
                '#island .city .scroll_img .after { left: 175px; } ';

            IkaTools.View.registerIkariamAjaxResponseCallback(
                function labelCityOwners(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.UPDATE_BACKGROUND_DATA) {
                            doLabelCities(data);
                        } else if (name == IkaTools.Constants.IkariamAjaxResponseType.UPDATE_GLOBAL_DATA) {
                            doLabelCities(data['backgroundData'] || data[11]);
                        }
                    });
                }, true);
        }

        if (preventAccidentalColonyDestruction.isEnabled()) {
            IkaTools.View.registerIkariamAjaxResponseCallback(
                function preventAccidentalColonyDestruction(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                            if (data[0] == IkaTools.Constants.View.ABOLISH_CITY) {
                                var cityId = parseInt($('#abolishCity input[name=cityId]').val());
                                var city = IkaTools.EmpireData.getCity(cityId);
                                var palace = city.getBuildingByType(IkaTools.Constants.Buildings.PALACE);
                                var governorsResidence = city.getBuildingByType(
                                    IkaTools.Constants.Buildings.GOVERNORS_RESIDENCE);
                                if (palace || governorsResidence) {
                                    unsafeWindow.ikariam.TemplateView.destroyTemplateView();
                                    alert(localizer.localize('tweaks', 'destroy_non_mobile_colony_prompt'));
                                }
                            }
                        }
                    });
                }, true);
        }

        if (initializeColonizationMissionsForPirateRaiding.isEnabled()) {
            IkaTools.View.registerIkariamAjaxResponseCallback(
                function initializeColonizationMissionsForPirateRaiding(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                            if (data[0] == IkaTools.Constants.View.COLONIZE) {
                                var woodInput = $('#textfield_wood');
                                var marbleInput = $('#textfield_marble');
                                var civData = IkaTools.EmpireData.getCivilizationData();

                                var multiplier = 1.0;
                                multiplier -= civData.hasResearched(
                                    IkaTools.Constants.Research.Economy.PULLEY) ? .02 : 0;
                                multiplier -= civData.hasResearched(
                                    IkaTools.Constants.Research.Economy.GEOMETRY) ? .04 : 0;
                                multiplier -= civData.hasResearched(
                                    IkaTools.Constants.Research.Economy.SPIRIT_LEVEL) ? .08 : 0;

                                woodInput.val(Math.ceil(multiplier *
                                                        IkaTools.Constants.BuildingData[IkaTools.Constants.Buildings.PIRATE_FORTRESS].wood[0]) - 250);
                                marbleInput.val(Math.ceil(multiplier *
                                                          IkaTools.Constants.BuildingData[IkaTools.Constants.Buildings.PIRATE_FORTRESS].marble[0]));

                                // Have to give time for Ikariam javascript that processes the click
                                // to be registered.
                                setTimeout(function() {$('#slider_capacity_min').get(0).click();}, 0);
                            }
                        }
                    });
                }, true);
        }

        GM_addStyle(addedStyles);
    }

    function initAlerts() {
        // v2.20 : GM_notification ; audio = son + notification qui reste affichée
        function showDesktopNotification(icon, title, text, audio) {
            return impNotify({ image: icon, title: title, text: text, sound: !!audio, sticky: !!audio });
        }

        if (buildingCompletionAlert_Desktop.isEnabled()) {
            IkaTools.EmpireData.registerBuildingsChangedHandler(
                function alertBuildingCompletion(changes) {
                    $.each(changes, function forEachBuildingChange(index, change) {
                        if (change.type == IkaTools.Constants.BuildingEventType.UPGRADE_COMPLETE) {
                            showDesktopNotification(
                                impAsset((IkaTools.Constants.BuildingData[change.building.getType()] || {}).icon),
                                localizer.localize('alerts','building_upgrade_complete'),
                                localizer.localize('alerts','building_upgrade_complete_text').format2(
                                    {
                                        building: localizer.localize('buildings', change.building.getType()),
                                        city: change.city.getName(),
                                        level: IkaTools.Intl.formatInteger(change.building.getLevel())
                                    }));
                        }
                    });
                });
        }

        var missionAlerts = {
            'transport:loading': transportMissionLoaded_Desktop.isEnabled(),
            'transport:en_route': transportMissionArrived_Desktop.isEnabled(),
            'transport:returning': transportMissionReturned_Desktop.isEnabled(),
            'deployarmy:loading': deployArmyLoaded_Desktop.isEnabled(),
            'deployarmy:en_route': deployArmyArrived_Desktop.isEnabled(),
            'deployarmy:returning': deployArmyReturned_Desktop.isEnabled(),
            'deploynavy:loading': false,
            'deploynavy:en_route': deployNavyArrived_Desktop.isEnabled(),
            'deploynavy:returning': deployNavyReturned_Desktop.isEnabled(),
            'plunder:loading': pillageLoaded_Desktop.isEnabled(),
            'plunder:en_route': pillageArrived_Desktop.isEnabled(),
            'plunder:returning': pillageReturned_Desktop.isEnabled(),
        }

        IkaTools.EmpireData.registerMovementsChangedHandler(function alertMissions(changes) {
            $.each(changes, function forEachMissionChange(index, change) {
                if (change.type == IkaTools.Constants.Movements.EventType.STAGE_CHANGED ||
                    change.type == IkaTools.Constants.Movements.EventType.COMPLETED) {
                    var mission = change.movement.getMission();
                    var stage = change.previousStage;
                    var cityName = IkaTools.Intl.localizer.localize('formatting','unknown');
                    if (stage == IkaTools.Constants.Movements.Stage.EN_ROUTE) {
                        var city = change.movement.getTargetCity();
                        if (city) {
                            cityName = city.getName();
                        }
                    } else {
                        city = change.movement.getOriginCity();
                        if (city) {
                            cityName = city.getName();
                        }
                    }
                    if (missionAlerts[mission + ':' + stage]) {
                        showDesktopNotification(
                            impAsset((IkaTools.Constants.Movements.MissionData[mission] || {}).icon),
                            localizer.localize('alerts','mission_update'),
                            localizer.localize('alerts', stage).format2({
                                type: localizer.localize('alerts', mission),
                                city: cityName,
                            }));
                    }
                }
            });
        });

        var underAttack = $('#advMilitary a').eq(0).hasClass('normalalert');
        var parsedIgnoredHostileMissions = JSON.parse(ignoredHostileMissions.getValue());
        var impNotifiedHostiles = {}; // v2.20

        IkaTools.View.registerIkariamAjaxResponseCallback(
            function enhancedMilitaryAdvisor(response) {
                try {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.UPDATE_GLOBAL_DATA) {

                            // Protection : structure différente suivant les réponses Ikariam
                            var headerData = data.headerData || data[11] || data[0];
                            if (!headerData || !headerData.advisors || !headerData.advisors.military) {
                                //console.warn("Imperator: pas de headerData.advisors.military dans la réponse :", data);
                                return; // on sort juste pour cette réponse, pas d’erreur
                            }

                            var militaryAdvisor = headerData.advisors.military;
                            var css = militaryAdvisor.cssclass || "";

                            if (css.indexOf('normalalert') >= 0) {
                                if (!underAttack) {
                                    showDesktopNotification(
                                        null,
                                        'Ikariam : attaque en approche',
                                        'Le conseiller militaire signale une attaque. Ouvre-le pour voir le détail.',
                                        true
                                    );
                                    underAttack = true;
                                } else {
                                    function onMovementUpdate(response) {
                                        var movements = IkaTools.EmpireData.getCivilizationData().getMovements();
                                        var foundUnignoredHostile = false;

                                        $.each(movements, function(index, movement) {
                                            if (movement.isHostile() &&
                                                parsedIgnoredHostileMissions.indexOf(movement.getId()) < 0 &&
                                                !impNotifiedHostiles[movement.getId()]) {
                                                impNotifiedHostiles[movement.getId()] = true; // v2.20 : une alerte par mouvement
                                                foundUnignoredHostile = true;
                                            }
                                        });

                                        if (foundUnignoredHostile) {
                                            showDesktopNotification(
                                                null,
                                                'Ikariam : nouvelle attaque',
                                                'Un nouveau mouvement hostile a été détecté.',
                                                true
                                            );
                                        }
                                        // v2.20 : on ne remplace plus l'icône rouge du conseiller par
                                        // « probablement sûr » : la détection des mouvements hostiles n'est
                                        // pas fiable et masquait une vraie attaque.
                                    }

                                    IkaTools.EmpireData.updateMovements(onMovementUpdate);
                                }
                            } else {
                                underAttack = false;
                            }
                        }
                    });
                } catch (e) {
                    console.warn("Imperator: erreur dans enhancedMilitaryAdvisor, ignorée :", e);
                }
            },
            true
        );



        // remplacement !!
    }

    function configureLocalization() {
        var language = localizedLanguage.getValue();
        if (!language) {
            var hostParts = document.location.host.split('\.');
            language = hostParts[hostParts.length - 1];
            if (language == "com" && hostParts.length == 4) {
                //for example: http://s1.en.ikariam.com
                language = hostParts[1];
            }

            // Format moderne Gameforge : sXX-<lang>.ikariam.gameforge.com -> <lang>
            if (hostParts.indexOf('gameforge') > -1) {
                var first = hostParts[0];
                language = (first.indexOf('-') > -1) ? first.split('-').pop() : first;
            }
        }

        // v2.21 : seuls le français et l'anglais existent ; tout le reste -> anglais
        if (language !== 'fr') {
            language = 'en';
        }
        localizer.setPreferredLanguage(language);
        IkaTools.Intl.localizer.setPreferredLanguage(language);
    }

    function initPirating() {
    }

    function initPendingIslandUrl() {
        function executePending() {
            var pendingCityId = GM_getValue('imperator_pending_city_id', '');
            if (!pendingCityId) return;
            if (!IkaTools.View.viewIsIsland()) return;

            var pendingView   = GM_getValue('imperator_pending_view', '');
            var pendingParams = {};
            try {
                pendingParams = JSON.parse(GM_getValue('imperator_pending_params', '{}'));
            } catch(e) {}

            var city = IkaTools.EmpireData.getCity(parseInt(pendingCityId));
            if (city) {
                GM_setValue('imperator_pending_city_id', '');
                GM_setValue('imperator_pending_view',    '');
                GM_setValue('imperator_pending_params',  '{}');
                IkaTools.View.goToCitysIslandView(city, pendingView, pendingParams);
            }
        }

        // Cas 1 : page island déjà chargée au boot
        executePending();
        // Cas 2 : island chargée par réponse AJAX
        IkaTools.View.registerIkariamAjaxResponseCallback(executePending, true);
    }

    function initBackgroundRefresh() {
        function refreshCity(city, callback) {
            var url = 'https://' + IkaTools.View.getDomain() +
                      '/index.php?view=townHall&cityId=' + city.getId();
            IkaTools.Utils.backgroundFetchIkariamFullPage(url, function(response, ajaxArray) {
                try {
                    var templateData = null;
                    IkaTools.Utils.iterateIkariamAjaxResponse(ajaxArray, function(i, name, data) {
                        if (name === IkaTools.Constants.IkariamAjaxResponseType.UPDATE_TEMPLATE_DATA) {
                            templateData = data;
                        }
                    });
                    if (!templateData) { callback(); return; }

                    var city2 = IkaTools.EmpireData.getCity(city.getId());
                    if (!city2) { callback(); return; }

                    var hapEl = templateData['js_TownHallHappinessLargeValue'];
                    if (hapEl) {
                        var score = parseInt(hapEl.text);
                        if (!isNaN(score)) city2.happinessScore = score;
                    }

                    var moodEl = templateData['js_TownHallSatisfactionOverviewMood'];
                    if (moodEl && moodEl.html) {
                        var src = moodEl.html;
                        var mood = 'neutral';
                        if (src.indexOf('ecstatic') >= 0)                          mood = 'ecstatic';
                        else if (src.indexOf('happy') >= 0)                        mood = 'happy';
                        else if (src.indexOf('sad') >= 0)                          mood = 'sad';
                        else if (src.indexOf('angry') >= 0 ||
                                 src.indexOf('outraged') >= 0)                     mood = 'outraged';
                        city2._imperatorMood = mood;
                    }

                } catch(e) {
                    console.warn('[Imperator] refreshCity échoué pour', city.getName(), e);
                }
                callback();
            });
        }

        function runRefresh(onProgress, onDone) {
            var cities = IkaTools.EmpireData.getOwnCities();
            var index = 0;
            var total = cities.length;

            function next() {
                if (index >= total) {
                    if (onDone) onDone(total);
                    return;
                }
                var city = cities[index];
                if (onProgress) onProgress(index + 1, total, city.getName());
                index++;
                refreshCity(city, function() {
                    setTimeout(next, 5000);
                });
            }
            next();
        }

        return { runRefresh: runRefresh };
    }
    var backgroundRefresh = null;
    function init() {
        configureLocalization();

        IkaTools.Logging.setAndSaveOptionsFromPageAnchor();

        addStyles();

        var overviewTablesReady = overviewTables();

        $(document).ready(function() {
            var readyAction = IkaTools.Logging.debuggable(
                {label: "Imperator.documentReady", group: true, alwaysTime: true, swallowException: true},
                function imperatorDocumentReady() {
                    registerLoggingEventHandlers();
                    initTweaks();
                    initAlerts();
                    initPirating();
                    initPendingIslandUrl();

                    backgroundRefresh = initBackgroundRefresh();

                    IkaTools.initialize();
                    overviewTablesReady();
                    addSettingsLink();

                });

            if (IkaTools.Utils.isChrome()) {
                // In Chrome sometimes we randomly execute before the ikariam "on-ready" scripts
                // which won't work because the stuff IkaTools.init needs will not be in the
                // javascript objects.  Move this setup to the end of the line.
                setTimeout(readyAction, 500);
            } else {
                readyAction();
            }
        });
    }

    return {
        init: init,
    }
}();


