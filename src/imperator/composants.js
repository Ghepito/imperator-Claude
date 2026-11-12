

    function addSettingsLink() {
        var settingsWindow = new IkaTools.UI.SettingsWindow(
            'ImperatorSettings',
            'Ikariam Imperator',
            settings,
            [new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','general'),
                                                  [localizedLanguage]),
             new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','overviews'),
                                                  [showResourceOverview, showBuildingsOverview, showMilitaryOverview,
                                                   showEspionageOverview, blessSoonThreshold, wineTarget]),
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
                                                   exceptionLogSetting, refreshDataSetting, viewCaptureSetting, dataExportSetting]),
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
