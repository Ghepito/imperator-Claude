
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

        // v3.26 : Atelier dans l'onglet Armée (maquettes B + C validées le 20 nov. 2026) :
        // ligne « Atelier ⚔ / 🛡 » sous les en-têtes, fiche complète au survol de l'en-tête.
        var IMP_WS_ID_BY_TYPE = {};
        $.each(IkaTools.Constants.UnitIds, function(id, type) { IMP_WS_ID_BY_TYPE[type] = id; });

        function impWsFmtLeft(ms) {
            var m = Math.max(0, Math.round(ms / 60000)), h = Math.floor(m / 60), d = Math.floor(h / 24);
            if (d > 0) return d + 'j ' + (h % 24) + 'h';
            if (h > 0) return h + 'h ' + ('0' + (m % 60)).slice(-2) + 'm';
            return m + 'm';
        }
        // Données d'atelier d'un type d'unité : { off, def, cargo, prog } ou null si jamais lu.
        function impWsInfo(type) {
            var data = IkaTools.EmpireData.getWorkshopData ? IkaTools.EmpireData.getWorkshopData() : null;
            var id = IMP_WS_ID_BY_TYPE[type];
            var u = data && data.units && id ? data.units[id] : null;
            if (!u) return null;
            var p = data.inProgress && data.inProgress.unitId == id ? data.inProgress : null;
            var progType = p ? p.type : null;           // v3.27 : même terminée, son « niveau suivant » est déjà pris
            var now = IkaTools.View.gameTimeNow();
            if (p && p.end && p.end <= now) p = null;   // terminée : getWorkshopEffect en tient compte
            var stale = [];                             // v3.27 : niveaux plus hauts vus à la Caserne / au Chantier naval
            $.each(['offensive', 'defensive', 'cargo'], function(i, k) { if (u[k] && u[k].stale) stale.push({ type: k, e: u[k] }); });
            return { id: id, off: u.offensive || null, def: u.defensive || null, cargo: u.cargo || null, prog: p,
                     progType: progType, stale: stale, checked: data.checked || null,
                     offEffect: IkaTools.EmpireData.getWorkshopEffect(id, 'offensive'),
                     defEffect: IkaTools.EmpireData.getWorkshopEffect(id, 'defensive'),
                     updated: data.updated || 0 };
        }
        function impWsProgBadge(p) {
            var icon = p.type === 'defensive' ? '🛡' : p.type === 'cargo' ? '📦' : '⚔';
            var pct = p.end > p.start ? Math.min(100, Math.max(0, (IkaTools.View.gameTimeNow() - p.start) * 100 / (p.end - p.start))) : 0;
            return '<span class="imp_ws_prog" data-imp-ws-start="' + p.start + '" data-imp-ws-end="' + p.end + '" data-imp-ws-icon="' + icon + '">' +
                   '↑' + icon + ' <span class="imp_ws_left">' + impWsFmtLeft(p.end - IkaTools.View.gameTimeNow()) + '</span></span>' +
                   '<div class="imp_ws_bar"><i style="width:' + Math.round(pct) + '%"></i></div>';
        }
        function impWsCell(type) {
            var w = impWsInfo(type);
            if (!w) {
                // Atelier lu mais unité absente : le jeu ne l'améliore pas (cuisinier, médecin, bateau de soutien)
                var d = IkaTools.EmpireData.getWorkshopData ? IkaTools.EmpireData.getWorkshopData() : null;
                var known = d && d.names && Object.keys(d.names).length >= 20;
                return '<td class="imp_ws_cell imp_ws_unknown" title="' + (known ? 'Pas d\'amélioration à l\'Atelier' :
                       'Onglet de l\'Atelier pas encore lu') + '">' + (known ? '-' : '?') + '</td>';
            }
            var parts = [];
            // v3.27.1 : sur une seule ligne, sans espaces (les colonnes du jeu sont étroites)
            if (w.off || w.def) parts.push('<span class="imp_ws_val"><b>' + (w.off ? '+' + w.offEffect : '-') + '</b>/<b>' + (w.def ? '+' + w.defEffect : '-') + '</b></span>');
            if (w.cargo) parts.push('📦 <b>+' + IkaTools.Intl.formatInteger(IkaTools.EmpireData.getWorkshopEffect(w.id, 'cargo')) + '</b>');
            if (!parts.length) parts.push('-');
            var stale = w.stale.length ? '<br><span class="imp_ws_stale" title="' + __impH($.map(w.stale, function(x) {
                    return x.e.stale.from + ' : ' + x.e.stale.name + ' niv. ' + x.e.stale.level + ' (Atelier : niv. ' + x.e.level + ')';
                }).join(' ; ') + '. Ouvre l\'Atelier pour connaître le nouveau bonus.') + '">⟳ à relire</span>' : '';
            return '<td class="imp_ws_cell">' + parts.join('<br>') + (w.prog ? '<br>' + impWsProgBadge(w.prog) : '') + stale + '</td>';
        }
        function impWsCard(type, displayName) {
            var w = impWsInfo(type);
            var h = function(t) { return __impH(String(t == null ? '' : t)); };
            if (!w) return '<div class="imp_ws_card"><h4>' + h(displayName) + '</h4><div class="imp_ws_lv">Atelier pas encore lu : ouvre l\'Atelier (onglets Unités et Navires).</div></div>';
            var line = function(icon, e, effect) {
                if (!e) return '';
                return '<div class="imp_ws_row"><span>' + icon + ' ' + h(e.name) + ' <span class="imp_ws_lv">niv. ' + e.level + '</span></span><b>+' +
                       IkaTools.Intl.formatInteger(effect) + '</b></div>';
            };
            var next = function(icon, e, kind) {
                if (!e || !e.next || w.progType === kind) return '';   // v3.27 : déjà en cours
                return '<div class="imp_ws_row imp_ws_lv"><span>Prochain ' + icon + ' : niv. ' + e.next.level + ' (+' + IkaTools.Intl.formatInteger(e.next.effect) + ')</span><span>' +
                       (e.next.gold != null ? IkaTools.Intl.formatInteger(e.next.gold) + ' or · ' : '') +
                       (e.next.crystal != null ? IkaTools.Intl.formatInteger(e.next.crystal) + ' verre · ' : '') + h(e.next.duration) + '</span></div>';
            };
            var p = w.prog, prog = '';
            if (p) {
                var icon = p.type === 'defensive' ? '🛡' : p.type === 'cargo' ? '📦' : '⚔';
                prog = '<div class="imp_ws_row imp_ws_doing"><span>↑ ' + icon + ' ' + h(p.name) + ' en cours (+' + p.from + ' → +' + p.to + ')</span><b>' +
                       impWsFmtLeft(p.end - IkaTools.View.gameTimeNow()) + '</b></div>' + impWsProgBadge(p).replace(/^[\s\S]*?<\/span><\/span>/, '');
            }
            var agoTxt = function(t) {
                var ago = Math.round((IkaTools.View.gameTimeNow() - t) / 3600000);
                return ago < 1 ? 'il y a moins d\'une heure' : ago < 48 ? 'il y a ' + ago + ' h' : 'il y a ' + Math.round(ago / 24) + ' j';
            };
            return '<div class="imp_ws_card"><h4>' + h(displayName) + ' — Atelier</h4>' +
                   line('⚔', w.off, w.offEffect) + line('🛡', w.def, w.defEffect) +
                   line('📦', w.cargo, w.cargo ? IkaTools.EmpireData.getWorkshopEffect(w.id, 'cargo') : 0) + prog +
                   next('⚔', w.off, 'offensive') + next('🛡', w.def, 'defensive') + next('📦', w.cargo, 'cargo') +
                   $.map(w.stale, function(x) {
                       return '<div class="imp_ws_row imp_ws_stale"><span>⟳ ' + h(x.e.stale.from) + ' : ' + h(x.e.stale.name) + ' niv. ' + x.e.stale.level +
                              ' (Atelier : niv. ' + x.e.level + ')</span><span>Atelier à relire</span></div>';
                   }).join('') +
                   '<div class="imp_ws_lv">Atelier lu ' + agoTxt(w.updated) +
                   (w.checked && w.checked.at > w.updated ? ' · niveaux contrôlés (' + h(w.checked.from) + ') ' + agoTxt(w.checked.at) : '') + '</div></div>';
        }
        var impWsTickerOn = false;
        function impWsInstallTicker() {
            if (impWsTickerOn) return;
            impWsTickerOn = true;
            setInterval(function() {
                try {
                    var now = IkaTools.View.gameTimeNow();
                    $('#ImperatorOverviewMilitaryTable .imp_ws_prog').each(function() {
                        var $e = $(this), start = +$e.attr('data-imp-ws-start'), end = +$e.attr('data-imp-ws-end');
                        $e.find('.imp_ws_left').text(end > now ? impWsFmtLeft(end - now) : 'terminé');
                        if (end > start) $e.next('.imp_ws_bar').find('i').css('width', Math.min(100, Math.max(0, (now - start) * 100 / (end - start))) + '%');
                    });
                } catch (e) {}
            }, 30000);
        }

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
                    // v3.26 : fiche de l'Atelier au survol (C), à jour à chaque ouverture
                    var toolTip = toolTips.registerRefreshable('ImperatorMilitaryHeader_' + type, function() {
                        try { return impWsCard(type, displayName); }
                        catch (e) { return '<div class="nowrap">' + __impH(displayName) + '</div>'; }
                    });
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

                // v3.26 : ligne « Atelier ⚔ / 🛡 » (B), seulement si l'Atelier a été lu
                function makeWorkshopRow() {
                    var data = IkaTools.EmpireData.getWorkshopData ? IkaTools.EmpireData.getWorkshopData() : null;
                    if (!data || !data.units || !Object.keys(data.units).length) return '';
                    impWsInstallTicker();
                    return '<tr class="imp_ws_tr"><td colspan="3" class="imp_ws_label">Atelier ⚔ / 🛡</td>%s</tr>'.format(
                        $.map(UNIT_ORDER, function(info) {
                            return $.map(info.units, function(type) { return empireHasTroopType[type] ? impWsCell(type) : ''; });
                        }).join(''));
                }

                function makeSummaryRow(cities) {
                    return '<tr><td colspan="3" class="totals_sigma_cell"/>%s</tr>'.format(
                        $.map(UNIT_ORDER, function(info) {
                            return $.map(info.units, makeSummaryCell);
                        }).join(''));
                }

                var miracleCaption = '';
                try { miracleCaption = impMiracleMilitaryCaption(); } catch (eMir) {} // v3.15
                return miracleCaption + '%s%s%s<thead>%s</thead><tbody>%s</tbody><tfoot>%s</tfoot>'.format(
                    makeCityNameColGroup('<col class="action_points">', true),
                    '<colgroup class="actions"><col class="actions"/></colgroup>',
                    $.map(UNIT_ORDER, makeColGroup).join(''),
                    '<tr>' + makeTableHeadContent() + '</tr>' + makeWorkshopRow(),   // v3.26
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
                // v3.15 : un Temple relu met à jour la barre des miracles
                IkaTools.EmpireData.registerShrineChangedHandler(function() {
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
