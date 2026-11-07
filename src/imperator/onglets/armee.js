
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
