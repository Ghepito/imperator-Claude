
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
                        impPopup().close(); // v2.41
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
