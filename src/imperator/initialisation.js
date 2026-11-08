
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
