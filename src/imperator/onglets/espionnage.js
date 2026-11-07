
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
                        // v2.31 : un joueur en vacances ne peut pas être pillé
                        (player && player.getState() == IkaTools.Constants.PlayerState.VACATION ?
                         localizer.localize('espionage', 'on_vacation') :
                         IkaTools.Intl.formatInteger(Math.ceil(
                            lootableResources / IkaTools.Constants.GamePlay.RESOURCES_PER_TRANSPORT))),
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
