
            // v2.07 : rafraîchissement manuel des données financières + Sanctuaire.
            // Utilisé par le bouton "Mettre à jour" du Dashboard.
            function refreshFinancesAndShrine(onProgress, onDone) {
                var steps = [];

                // 1. Or/finances : d'abord relire le modèle (instantané, empire live)
                try {
                    var model = unsafeWindow.ikariam && unsafeWindow.ikariam.model;
                    var src = (model && model.headerData && model.headerData.income !== undefined)
                                ? model.headerData
                                : (model && model.income !== undefined ? model : null);
                    if (src) {
                        var toNum = function(v){ var n=(typeof v==='string')?parseFloat(v.replace(',','.')):v; return isFinite(n)?Math.round(n):undefined; };
                        var upd = { incomeUpdated: Date.now() };
                        if (src.income           !== undefined) upd.revenue    = toNum(src.income);
                        if (src.godGoldResult    !== undefined) upd.gods       = toNum(src.godGoldResult);
                        if (src.scientistsUpkeep !== undefined) upd.scientists = toNum(src.scientistsUpkeep);
                        if (src.upkeep           !== undefined) upd.upkeep      = -Math.abs(toNum(src.upkeep)||0);
                        var gM = toNum(src.gold);
                        if (gM && gM > 1000) { upd.current = gM; upd.currentUpdated = Date.now(); }
                        getCivilizationData()._updateGoldData(upd);
                        raiseGoldChanged();
                    }
                } catch(eM) {}

                // Helper : extraire le HTML de vue depuis un tableau ajax
                function extractViewHtml(ajaxArray) {
                    var html = null;
                    try {
                        Utils.iterateIkariamAjaxResponse(ajaxArray, function(i, name, data) {
                            if (name === Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                                if (data && data[1]) html = data[1];
                            } else if (!html && (name === Constants.IkariamAjaxResponseType.ADD_WINDOW ||
                                                 name === Constants.IkariamAjaxResponseType.CREATE_VIEW)) {
                                if (data && data[1]) html = data[1];
                            }
                        });
                    } catch(e) {}
                    return html;
                }

                // 2. Étapes de fetch arrière-plan (finances puis sanctuaire)
                var domain = View.getDomain();
                steps.push({
                    name: 'Finances',
                    url: 'https://' + domain + '/index.php?view=finances',
                    handler: function(ajaxArray) {
                        var html = extractViewHtml(ajaxArray);
                        if (html) processFinancesView(null, html);
                    }
                });

                // Sanctuaire : trouver une ville qui possède le bâtiment + sa position
                try {
                    var cities = getOwnCities();
                    var shrineCity = null, shrinePos = null;
                    for (var c = 0; c < cities.length; c++) {
                        var b = cities[c] && cities[c].getBuildingByType
                                  ? cities[c].getBuildingByType(Constants.Buildings.DIVINE_SANCTUARY) : null;
                        if (b) { shrineCity = cities[c]; shrinePos = (b.getPosition ? b.getPosition() : null); break; }
                    }
                    if (shrineCity) {
                        var sUrl = 'https://' + domain + '/index.php?view=shrineOfOlympus&cityId=' +
                                   shrineCity.getId() + '&activeTab=tabWorship' +
                                   (shrinePos != null ? '&position=' + shrinePos : '');
                        steps.push({
                            name: 'Sanctuaire',
                            url: sUrl,
                            handler: function(ajaxArray) {
                                var html = extractViewHtml(ajaxArray);
                                if (html) processShrineView(null, html);
                            }
                        });
                    }
                } catch(eS) {}

                // Exécution séquentielle des étapes
                var idx = 0;
                function nextStep() {
                    if (idx >= steps.length) {
                        setTimeout(function(){ raiseGoldChanged(); }, 300);
                        if (onDone) onDone(steps.length);
                        return;
                    }
                    var step = steps[idx];
                    if (onProgress) onProgress(idx + 1, steps.length, step.name);
                    idx++;
                    try {
                        Utils.backgroundFetchIkariamFullPage(step.url, function(response, ajaxArray) {
                            try { step.handler(ajaxArray || []); } catch(eh) {}
                            setTimeout(nextStep, 800);
                        });
                    } catch(eF) {
                        setTimeout(nextStep, 100);
                    }
                }
                nextStep();
            }

            function processPremiumView(data) {
                var civilizationData = getCivilizationData();
                var changes = [];

                civilizationData._updatePremiumFeature(changes,
                                                       Constants.PremiumFeatures.DOUBLED_SAFE_CAPACITY,
                                                       $('#js_buySafecapacityBonusActiveTime').hasClass('green'));
                civilizationData._updatePremiumFeature(changes,
                                                       Constants.PremiumFeatures.DOUBLED_STORAGE_CAPACITY,
                                                       $('#js_buyStoragecapacityBonusActiveTime').hasClass('green'));

                raiseCivilizationDataChanged(changes);
            }

            function updateEmpireDataFromGlobalData(data) {
                // Game time diff - garde uniquement si la valeur est valide
                var serverTime = data['time'] || data[1];
                if (serverTime && Number.isFinite(Number(serverTime))) {
                    View.setGameTimeDifference(
                        new Date().getTime() - serverTime * Constants.Time.MILLIS_PER_SECOND
                    );
                }

                // Récupérations (selon format reçu)
                var headerData     = data['headerData']     || data[10];

                var backgroundData = data['backgroundData'] || data[11];

                // Sécurité : si pas de data exploitable
                if (!data) {
                    return;
                }

                // S'assure qu'on a un headerData dans data
                if (!data.headerData && headerData) data.headerData = headerData;

                // Forcer un id si manquant
                if (data.headerData && typeof data.headerData.id === "undefined") {
                    var currentCity = null;
                    try { currentCity = View.getCurrentCity && View.getCurrentCity(); } catch (e) {}

                    if (currentCity && typeof currentCity.id !== "undefined") {
                        data.headerData.id = currentCity.id;
                    } else {
                        console.warn("Imperator: impossible de déterminer la ville courante pour UPDATE_GLOBAL_DATA");
                        return;
                    }
                }

                // On passe le bloc complet (data), pas headerData
                try {
                    updateCurrentCity(data, backgroundData, true);
                } catch (e) {
                    console.warn("Imperator: erreur dans updateCurrentCity, mise à jour ignorée :", e);
                }
            }

            function updateAndStartTracking() {
                // Process all known cities that show up in the dropdown.
                // Drop any cities that are no longer there.
                var cities = { };
                var cityOrder = [];


                // --- PATCH SAFE : updateCurrentCity (sans redeclare) ---

                updateCurrentCity = function (globalData, backgroundData, correctWineConsumption) {
                    try {
                        var currentCity = null;

                        try { currentCity = View.getCurrentCity && View.getCurrentCity(); } catch (e) {}
                        if (!currentCity || !globalData) return;

                        // Background update seulement si backgroundData exploitable
                        try {
                            var bgId = parseInt(backgroundData && backgroundData.id, 10);
                            var curId = (typeof currentCity.getId === "function") ? currentCity.getId() : currentCity.id;
                            curId = parseInt(curId, 10);

                            if (backgroundData
                                && View.viewIsCity && View.viewIsCity()
                                && Number.isFinite(bgId) && Number.isFinite(curId)
                                && bgId === curId
                                && typeof currentCity._updateFromBackgroundData === "function") {
                                currentCity._updateFromBackgroundData(backgroundData);
                            }
                        } catch (e) {}

                        // Global update : protégé
                        try {
                            if (typeof currentCity._updateFromGlobalData === "function") {
                                currentCity._updateFromGlobalData(globalData, correctWineConsumption);
                            }
                        } catch (e) {
                            console.warn("[Imperator][SAFE] updateCurrentCity: _updateFromGlobalData ignoré", e);
                        }

                    } catch (e) {
                        console.warn("[Imperator][SAFE] updateCurrentCity ignoré (no-crash):", e);
                    }
                };


                $.each(unsafeWindow.dataSetForView.relatedCityData,
                       function updateFromPage_Each(key, value) {
                    if (key.substring(0, 5) == "city_") {
                        var city = empireData.get().cities[value.id] ||
                            new City(value.id, value.relationship);
                        city.type = value.relationship;

                        city.name = value.name;
                        city.islandCoordinates = parseCoordinates(value.coords);
                        if (value.tradegood) {
                            city.tradeGoodType = TRADE_GOOD_LOOKUP[value.tradegood];
                        }

                        empireData.get().cities[city.id] = city;
                        cityOrder.push(city.id);

                        Logging.debug("City %s[%s]: %o", city.name, city.id, city);
                    }
                });

                empireData.get().cityOrder = cityOrder;

                var globalData = {
                    maxActionPoints: parseInt($('#js_GlobalMenu_maxActionPoints').text()),
                };
                updateCurrentCity($.extend(globalData, unsafeWindow.dataSetForView),
                                  unsafeWindow.ikariam.backgroundView.screen.data,
                                  true);

                // v2.35 : sauvegarde regroupée (écrite au plus tard 500 ms après, ou à la fermeture)
                empireData.saveSoon();

                // Capturer l'or depuis dataSetForView (disponible au chargement)
                try {
                    var dsv = unsafeWindow.dataSetForView || {};
                    var initGold = parseInt(dsv.currentGold) || parseInt(dsv.gold) ||
                                   parseInt(dsv.goldAmount) || parseInt(dsv.headerData && dsv.headerData.gold) || 0;
                    if (initGold > 0) {
                        // Réinitialiser les timestamps pour éviter de charger de vieilles données
                        getCivilizationData().goldData.incomeUpdated  = 0;
                        getCivilizationData().goldData.currentUpdated = 0;
                        getCivilizationData()._updateGoldData({ current: initGold, currentUpdated: Date.now() });
                        raiseGoldChanged();
                    } else {
                        // Pas d'or dans dataSetForView : invalider les données stales
                        getCivilizationData().goldData.currentUpdated = 0;
                        getCivilizationData().goldData.incomeUpdated  = 0;
                    }
                } catch(e) {}


                // Export Imperator Map data
                try {
                    var mapCities = [];
                    $.each(getOwnCities(), function(i, city) {
                        var coords = city.getIslandCoordinates();
                        mapCities.push({
                            id:       city.getId(),
                            name:     city.getName(),
                            cx:       coords ? coords[0] : 0,
                            cy:       coords ? coords[1] : 0,
                            type:     city.getTradeGoodType ? city.getTradeGoodType() : city.tradeGoodType,
                            pop:      city.population || 0,
                            sat:      city.happinessScore,
                            islandId: city.islandId
                        });
                    });
                    var mapMovements = [];
                    $.each(getCivilizationData().getMovements(), function(id, mv) {
                        mapMovements.push({
                            id:             mv.getId ? mv.getId() : id,
                            mission:        mv.getMission(),
                            originCityId:   mv.getOriginCityId ? mv.getOriginCityId() : mv.originCityId,
                            targetCityId:   mv.getTargetCityId ? mv.getTargetCityId() : mv.targetCityId,
                            completionTime: mv.getCompletionTime ? mv.getCompletionTime() : mv.completionTime,
                            transports:     mv.transports || 0
                        });
                    });
                    // v2.19 : la liste calculée fait foi (l'onglet Armée la tient à jour).
                    // L'ancien "préserver les mouvements existants" recopiait indéfiniment des reliquats.
                    var mapTargets = [];
                    try {
                        var espTargets = IkaTools.EmpireData.Espionage.getTargets();
                        $.each(espTargets, function(i, target) {
                            var coords = target.getIslandCoordinates ? target.getIslandCoordinates() : target.coords;
                            if (coords && (coords[0] || coords[1])) {
                                mapTargets.push({
                                    id:   target.getId ? target.getId() : target.id,
                                    name: target.getName ? target.getName() : target.name,
                                    cx:   coords[0],
                                    cy:   coords[1]
                                });
                            }
                        });
                    } catch(e2) {}
                    localStorage.setItem('imperatorMapData', JSON.stringify({
                        cities:    mapCities,
                        movements: mapMovements,
                        targets:   mapTargets,
                        timestamp: Date.now()
                    }));

                } catch(e) {
                    console.warn('[Imperator] export mapData échoué:', e);
                }

                // ================================
                // [PATCH] City.updateResources SAFE
                // Empêche le crash si globalData.population est absent

                // =====================
                // PATCH TABLEAU (SAFE)
                // =====================

                /**
                  * Récupère une cityId "fiable" depuis plusieurs sources possibles.
                 */
                function __imp_getAnyCityId(globalData, backgroundData) {
                    // 1) backgroundData.id (souvent présent)
                    try {
                        const id = parseInt(backgroundData && backgroundData.id, 10);
                        if (Number.isFinite(id)) return id;
                    } catch (e) {}

                    // 2) globalData.headerData.id
                    try {
                        const id = parseInt(globalData && globalData.headerData && globalData.headerData.id, 10);
                        if (Number.isFinite(id)) return id;
                    } catch (e) {}

                    // 3) Ikariam API
                    try {
                        const apiId = unsafeWindow.ikariam && typeof unsafeWindow.ikariam.getCurrentCityId === 'function'
                        ? parseInt(unsafeWindow.ikariam.getCurrentCityId(), 10)
                        : NaN;
                        if (Number.isFinite(apiId)) return apiId;
                    } catch (e) {}

                    // 4) URL
                    try {
                        const m = /(?:\?|&)(?:cityId|currentCityId)=(\d+)/.exec(String(location.href));
                        if (m) {
                            const id = parseInt(m[1], 10);
                            if (Number.isFinite(id)) return id;
                        }
                    } catch (e) {}

                    return null;
                }


                // patch tableau
                View.registerIkariamAjaxResponseCallback(
                    function updateEmpireDataFromAjaxResponse(response) {

                        var globalData = null;
                        var backgroundData = null;
                        var view = null;
                        var viewHtml = null;
                        var templateData = null;

                        Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {

                            if (name == Constants.IkariamAjaxResponseType.UPDATE_GLOBAL_DATA) {
                                globalData = data;

                            } else if (name == Constants.IkariamAjaxResponseType.UPDATE_BACKGROUND_DATA) {
                                backgroundData = data;

                            } else if (name == Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                                // data = [viewName, html]
                                view = data && data[0];
                                viewHtml = data && data[1];

                            } else if (name == Constants.IkariamAjaxResponseType.UPDATE_TEMPLATE_DATA) {
                                templateData = data;
                            } else if (name == Constants.IkariamAjaxResponseType.ADD_WINDOW ||
                                       name == Constants.IkariamAjaxResponseType.CREATE_VIEW) {
                                // Bilan peut arriver via ADD_WINDOW ou CREATE_VIEW
                                var awHtml = (data && data[1]) || '';
                                var awId   = (data && data[0]) || '';
                                if (!viewHtml && (awId === 'bilan' || awId === 'finances' ||
                                    (awHtml.indexOf('Montant') >= 0 && (awHtml.indexOf('Dieux') >= 0 || awHtml.indexOf('Pluton') >= 0)))) {
                                    viewHtml = awHtml;
                                    view     = awId || view;
                                }
                            }
                        });

                        // ==========================
                        // FIX CRITIQUE : headerData.id
                        // ==========================
                        if (globalData) {
                            // Assure headerData
                            if (!globalData.headerData) globalData.headerData = {};

                            // Injecte un id si absent (sinon ta MAJ est ignorée)
                            if (!globalData.headerData.id) {
                                const anyId = __imp_getAnyCityId(globalData, backgroundData);
                                if (Number.isFinite(anyId)) {
                                    globalData.headerData.id = anyId;
                                }
                            }

                            // IMPORTANT : updateEmpireDataFromGlobalData a besoin de backgroundData
                            // -> si ta version ne le prend pas en paramètre, elle lit souvent une variable externe.
                            // Ici on passe les 2 (et on garde le call compatible si la fonction n’a qu’1 param).
                            try {
                                if (updateEmpireDataFromGlobalData.length >= 2) {
                                    updateEmpireDataFromGlobalData(globalData, backgroundData);
                                } else {
                                    // fallback ancien : la fonction n'accepte qu'1 param
                                    // mais updateCurrentCity est maintenant blindé => pas de crash
                                    updateEmpireDataFromGlobalData(globalData);
                                }
                            } catch (e) {
                                console.warn('[Imperator][SAFE] updateEmpireDataFromGlobalData a échoué:', e);
                            }
                            // Capturer l'or actuel (priorité : dataSetForView > model > DOM)
                            setTimeout(function captureCurrentGold() {
                                try {
                                    var g = 0;
                                    // 1. dataSetForView (données serveur, le plus fiable)
                                    var dsv = unsafeWindow.dataSetForView || {};
                                    g = parseInt(dsv.currentGold)||parseInt(dsv.gold)||parseInt(dsv.goldAmount)||0;
                                    // 2. Modèle Ikariam
                                    if (!g) {
                                        var model = unsafeWindow.ikariam && unsafeWindow.ikariam.model;
                                        if (model) g = parseInt(model.currentGold)||parseInt(model.gold)||parseInt(model.goldAmount)||0;
                                    }
                                    // 3. DOM : seulement si la valeur dépasse 100k (sinon risque de bruit)
                                    if (!g) {
                                        var sels = ['#js_GlobalMenu_itemGoldValue','#goldValue','[id$="GoldValue"]'];
                                        for (var si=0; si<sels.length; si++) {
                                            var $el = $(sels[si]).first();
                                            if (!$el.length) continue;
                                            var raw = $el.text().replace(/[\u00a0\s]/g,'').replace(',','.');
                                            if (/[0-9.]+G/i.test(raw)) { g=Math.round(parseFloat(raw)*1e9); break; }
                                            if (/[0-9.]+M/i.test(raw)) { g=Math.round(parseFloat(raw)*1e6); break; }
                                            if (/[0-9.]+k/i.test(raw)) { g=Math.round(parseFloat(raw)*1e3); break; }
                                        }
                                    }
                                    // N'accepter que des valeurs > 1000 (éviter les faux positifs)
                                    if (g > 1000) { getCivilizationData()._updateGoldData({current:g,currentUpdated:Date.now()}); raiseGoldChanged(); }

                                    // === Imperator v2.07 : capter la décomposition financière depuis ikariam.model ===
                                    // Le modèle expose income / godGoldResult / scientistsUpkeep / upkeep
                                    // sur (presque) chaque page. On alimente goldData en live, sans ouvrir les Finances.
                                    try {
                                        var m2 = unsafeWindow.ikariam && unsafeWindow.ikariam.model;
                                        var src = (m2 && (m2.income !== undefined || (m2.headerData && m2.headerData.income !== undefined)))
                                                    ? m2 : (m2 && m2.headerData ? m2.headerData : null);
                                        // Préférer headerData (valeurs empire globales) si présent
                                        if (m2 && m2.headerData && m2.headerData.income !== undefined) src = m2.headerData;
                                        else if (m2 && m2.income !== undefined) src = m2;
                                        else src = null;

                                        if (src) {
                                            var incUpd = { incomeUpdated: Date.now() };
                                            var toNum = function(v){ var n = (typeof v === 'string') ? parseFloat(v.replace(',','.')) : v; return isFinite(n) ? Math.round(n) : undefined; };
                                            if (src.income           !== undefined) incUpd.revenue    = toNum(src.income);
                                            if (src.godGoldResult    !== undefined) incUpd.gods       = toNum(src.godGoldResult);
                                            if (src.scientistsUpkeep !== undefined) incUpd.scientists = toNum(src.scientistsUpkeep);
                                            if (src.upkeep           !== undefined) incUpd.upkeep      = -Math.abs(toNum(src.upkeep) || 0);
                                            // Or actuel plus précis si dispo dans le modèle
                                            var gModel = toNum(src.gold);
                                            if (gModel && gModel > 1000) { incUpd.current = gModel; incUpd.currentUpdated = Date.now(); }
                                            // N'appliquer que si au moins une composante a été lue
                                            if (incUpd.revenue !== undefined || incUpd.gods !== undefined ||
                                                incUpd.scientists !== undefined || incUpd.upkeep !== undefined) {
                                                getCivilizationData()._updateGoldData(incUpd); // net recalculé automatiquement
                                                raiseGoldChanged();
                                            }
                                        }
                                    } catch(eInc) { /* silencieux : ne jamais casser le flux */ }
                                    // === fin ajout v2.07 ===
                                } catch(e) {}
                            }, 400);
                        }

                        // ==========================
                        // ROUTAGE EXISTANT (inchangé)
                        // ==========================
                        if (view == Constants.View.CITY_MILITARY) {
                            processCityMilitaryView(templateData, viewHtml); // v2.17
                        } else if (view == Constants.View.RELATED_CITIES) {
                            processRelatedCitiesView(templateData);
                        } else if (view == Constants.View.ACADEMY) {
                            processAcademyView(templateData);
                        } else if (view == Constants.View.PALACE) {
                            processPalaceView(templateData);
                        } else if (view == Constants.View.TOWN_HALL) {
                            processTownHallView(templateData);
                        } else if (view == Constants.View.TEMPLE) {
                            processTempleView(templateData);
                        } else if (view == Constants.View.RESEARCH_ADVISOR) {
                            processResearchAdvisorView(templateData);
                        } else if (view == Constants.View.FINANCES || view == 'bilan' || view == 'finances') {
                            processFinancesView(templateData, viewHtml);
                        } else if (view == Constants.View.SHRINE_OF_OLYMPUS || view == 'shrineOfOlympus') {
                            processShrineView(templateData, viewHtml);
                        } else if (view == Constants.View.BARRACKS) {
                            processBarracksView(viewHtml, templateData);
                        } else if (view == Constants.View.SHIPYARD) {
                            processShipyardView(viewHtml, templateData);
                        } else if (view == Constants.View.MILITARY_ADVISOR) {
                            processMilitaryAdvisorView(templateData);
                        } else if (view == Constants.View.PREMIUM) {
                            processPremiumView(templateData);
                        } else if (view == 'buildingDetail') {
                            processBuildingDetailView(viewHtml); // v2.31 : aide des bâtiments
                        }

                        if (unsafeWindow.ikariam && unsafeWindow.ikariam.templateView) {
                            if (unsafeWindow.ikariam.templateView.id == Constants.View.RESEARCH_ADVISOR) {
                                processResearchAdvisorView(templateData);
                            }
                        }
                        // Détecter le Bilan depuis le contenu HTML (CHANGE_VIEW, ADD_WINDOW, CREATE_VIEW)
                        if (viewHtml && view !== Constants.View.FINANCES && view !== 'bilan' && view !== 'finances') {
                            if (viewHtml.indexOf('Montant') >= 0 && (viewHtml.indexOf('Dieux') >= 0 || viewHtml.indexOf('Pluton') >= 0)) {
                                processFinancesView(templateData, viewHtml);
                            }
                        }
                        // v2.07 : détecter le Sanctuaire divin depuis le HTML (repli si le routage direct rate)
                        if (viewHtml && view !== Constants.View.SHRINE_OF_OLYMPUS && view !== 'shrineOfOlympus') {
                            if (viewHtml.indexOf('js_godSelect') >= 0 || viewHtml.indexOf('gods worshiping') >= 0) {
                                processShrineView(templateData, viewHtml);
                            }
                        }
                        // v2.07 : capter le coût réel d'agrandissement (tout type de bâtiment).
                        // La fonction vérifie elle-même la présence du panneau (viewHtml ou DOM live).
                        processBuildingUpgradeView(viewHtml);
                        // parseBilanDomIfVisible appelé uniquement via createTemplateView hook

                        // v2.35 : sauvegarde regroupée (écrite au plus tard 500 ms après, ou à la fermeture)
                        empireData.saveSoon();
                    },
                    true
                );

                // fin patch Tableau


                View.registerAjaxFormSubmitCallback(
                    function ajaxHandlerCallFromFormEmpireDataUpdate(form) {
                        if (form.id == 'transport'  || form.id == 'transportForm') {
                            processTransportForm(form);
                        } else if (form.id == 'deploymentForm') {
                            processDeploymentForm(form);
                        } else if (form.id == 'plunderForm') {
                            processPlunderForm(form);
                        } else if (form.id == 'setScientists') {
                            processSetScientistsForm(form);
                        }
                    });
            }


            function updateMovements(callback) {
    var actionRequest = $('input[name="actionRequest"]').val() || '';
    Utils.backgroundFetchIkariamFullPage(
        'https://' + document.domain + '/index.php?view=militaryAdvisor&activeTab=militaryMovements&actionRequest=' + actionRequest + '&ajax=1',
        function updateMovementsCallback(response, ajaxArray) {
            Utils.iterateIkariamAjaxResponse(ajaxArray, function(index, name, data) {
                if (name == Constants.IkariamAjaxResponseType.UPDATE_TEMPLATE_DATA) {
                    processMilitaryAdvisorView(data);
                }
            });
            empireData.saveAsync();
            if (callback) callback(ajaxArray);
        },
        { method: 'GET' });
}

            function getCities() {
                var data = empireData.get();
                var cities = [];
                for (var i = 0; i < data.cityOrder.length; i++) {
                    cities.push(data.cities[data.cityOrder[i]]);
                }
                return cities;
            }

            function getOwnCities() {
                return getCities().filter(function(city) {
                    return city.isOwn();
                });
            }

            function getCivilizationData() {
                return empireData.get().civilizationData;
            }

            function getDebugString(includePrivateData) {
                return JSON.stringify(empireData.get(), function debugStringify(name, value) {
                    if (name === 'name' || name === 'islandCoordinates') {
                        return undefined;
                    }
                    return value;
                });
            }

            function resetData() {
                empireData.reset();
            }
