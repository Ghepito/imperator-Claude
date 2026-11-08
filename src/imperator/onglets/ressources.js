
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
                                            // v2.32 : « ? » tant que l'heure d'arrivée est inconnue
                                            // v2.33 : temps restant suivi de l'heure d'arrivée (« 6h 22m (aujourd'hui 15:37) »)
                                            (movement.isEtaUnknown && movement.isEtaUnknown()) ? '?' :
                                            '<span class="nowrap">' + IkaTools.Intl.formatRemainingTime(
                                                movement.getArrivalTime() - IkaTools.View.gameTimeNow()) +
                                            ' (' + IkaTools.Intl.formatAbsoluteTime(new Date(movement.getArrivalTime())) +
                                            ')</span>');
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
                                                makeResourceUseToolTip('/cdn/all/both/layout/bulb-on.png',
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
                            '/cdn/all/both/layout/bulb-on.png', rows, footer));

                        let formattedTotal = Math.floor(total + culturalGoods).toLocaleString();
                        return '<td id="ResearchTotal" class="research imperator_tool_tip">' + formattedTotal + '</td>';


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
