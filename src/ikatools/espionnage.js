
            var Espionage = function() {
                function Target(id) {
                    this._ikaToolsType = 'target';

                    if (id) {
                        this.id = id;

                        this.playerId = undefined;
                        this.allianceId = undefined;

                        this.townLevel = undefined;
                        this.wallLevel = undefined;
                        this.warehouseLevel = undefined;

                        this.islandId = undefined;
                        this.coords = undefined;

                        this.occupierId = undefined;
                        this.blockaderId = undefined;

                        this.tradeGoodType = undefined;

                        this.lastUpdateTime = 0;

                        this.military = new MilitaryUnits();
                        this.otherMilitary = new MilitaryUnits();
                        this.militaryLastSpyMessageId = 0;
                        this.militaryLastSpyTime = 0;

                        this.resources = {
                            wood: 0,
                            wine: 0,
                            marble: 0,
                            glass: 0,
                            sulfur: 0,

                            lastSpyMessageId: 0,
                            lastSpyTime: 0,
                        };

                        this.combats = {};
                    }
                }

                function combatComparer(combat1, combat2) {
                    return combat2.time - combat1.time;
                };

                $.extend(Target.prototype, {
                    getId: function getId() {
                        return this.id;
                    },
                    getName: function getName() {
                        return this.name;
                    },
                    getTownLevel: function getTownLevel() {
                        return this.townLevel;
                    },
                    getWallLevel: function getWallLevel() {
                        return this.wallLevel;
                    },
                    getIslandCoordinates: function getIslandCoordinates() {
                        return this.coords || [0, 0];
                    },
                    getIslandId: function getIslandId() {
                        return this.islandId;
                    },
                    getPlayer: function _getPlayer() {
                        return getPlayer(this.playerId);
                    },
                    getOccupier: function getOccupier() {
                        if (this.occupierId) {
                            return getPlayer(this.occupierId);
                        }
                        return null;
                    },
                    getBlockader: function getBlockader() {
                        if (this.blockaderId) {
                            return getPlayer(this.blockaderId);
                        }
                    },
                    getTradeGoodType: function getTradeGoodType() {
                        return this.tradeGoodType;
                    },
                    getMilitary: function getMilitary() {
                        return this.military;
                    },
                    getOtherMilitary: function getOtherMilitary() {
                        return this.otherMilitary;
                    },
                    hasResourceInfo: function hasResourceInfo() {
                        return this.resources.lastSpyMessageId > 0;
                    },
                    hasMilitaryInfo: function hasMilitaryInfo() {
                        return this.militaryLastSpyMessageId > 0;
                    },
                    getLootableResources: function getLootableResources(type) {
                        var available = this.resources[type];
                        $.each(this.getCombats(View.gameTimeNow() - this.resources.lastSpyTime),
                               function subtractCombatResources(index, combat) {
                            available -= combat.getLooted(type);
                        });
                        return Math.max(0, available -
                                        (this.getPlayer().isInactive() ?
                                         Constants.GamePlay.RESOURCE_PROTECTION_WAREHOUSE_INACTIVE :
                                         Constants.GamePlay.RESOURCE_PROTECTION_WAREHOUSE) * this.warehouseLevel -
                                        Constants.GamePlay.BASE_RESOURCE_PROTECTION);
                    },
                    getResourcesSpyTime: function getResourcesSpyTime() {
                        return this.resources.lastSpyTime;
                    },
                    getMilitarySpyTime: function getMilitarySpyTime() {
                        return this.militaryLastSpyTime;
                    },
                    getCombats: function getCombats(maxAge) {
                        var combats = [];
                        $.each(this.combats, function(index, combat) {
                            if (View.gameTimeNow() - combat.time <= maxAge) {
                                combats.push(combat);
                            }
                        });
                        combats.sort(combatComparer);
                        return combats;
                    },
                    remove: function remove() {
                        delete espionageData.get().targets[this.id];
                        espionageData.saveAsync();
                        raiseEspionageChanged({
                            type: 'targetRemoved',
                            targets: [this]
                        });
                    },

                    // v2.29 : plus de chargement de l'île en arrière-plan ; les données de la cible
                    // sont lues au passage sur son île (applyIslandToTargets) et dans sa vue ville
                    // (applyCityToTarget). Gardé pour les appels existants.
                    _refresh: function refresh(hasSpiesPresent, callback) {
                        callback();
                    },
                    _getOrAddCombat: function getOrAddCombat(id) {
                        var combat = this.combats[id];
                        if (!combat) {
                            combat = new Target.Combat(id);
                            this.combats[id] = combat;
                        }
                        return combat;
                    },
                });

                Target.Combat = function Target_Combat(id) {
                    this._ikaToolsType = 'targetCombat';

                    if (id) {
                        this.id = id;

                        this.type = undefined;
                        this.time = undefined;

                        this.resources = {
                            wood: 0,
                            wine: 0,
                            marble: 0,
                            glass: 0,
                            sulfur: 0,
                        };
                    }
                }

                $.extend(Target.Combat.prototype, {
                    getType: function getType() {
                        return this.type;
                    },
                    getTime: function getTime() {
                        return this.time;
                    },
                    getLooted: function getLooted(resourceType) {
                        return this.resources[resourceType];
                    },
                });

                function Player(id) {
                    this._ikaToolsType = 'player';

                    if (id) {
                        this.id = id;

                        this.name = null;
                        this.allianceId = null;
                        this.militaryScore = null;
                    }
                }

                $.extend(Player.prototype, {
                    _update: function update(name, state, allianceId, militaryScore) {
                        this.name = name;
                        if (state !== undefined) {
                            this.allianceId = allianceId;
                            this.militaryScore = militaryScore;
                            this.state = state;
                        }
                    },
                    getAlliance: function getAlliance() {
                        if (this.allianceId) {
                            return espionageData.get().alliances[this.allianceId];
                        } else {
                            return;
                        }
                    },
                    getName: function getName() {
                        return this.name;
                    },
                    getState: function getState() {
                        return this.state;
                    },
                    getMilitaryScore: function getMilitaryScore() {
                        return this.militaryScore;
                    },
                    isInactive: function isInactive() {
                        return this.state == Constants.PlayerState.INACTIVE;
                    },
                });

                function updateOrAddPlayer(id, name, state, allianceId, allianceName, militaryScore) {
                    var players = espionageData.get().players;
                    var player = players[id];
                    if (!player) {
                        player = new Player(id);
                        players[id] = player;
                    }
                    player._update(name, state, allianceId, militaryScore);
                    updateOrAddAlliance(allianceId, allianceName);
                }

                // v2.27 : met à jour les cibles d'espionnage présentes dans les données d'une île
                // (envoyées par le jeu à chaque affichage d'île). onlyTarget : limite à une cible.
                function _impArmyScore(data, playerId) {
                    var a = data.avatarScores && data.avatarScores[playerId];
                    var n = parseInt(String((a && a.army_score_main) || '0').replace(/[^0-9]/g, ''), 10);
                    return isFinite(n) ? n / 100 : 0;
                }
                function applyIslandToTargets(data, onlyTarget) {
                    var changed = [];
                    if (!data || !$.isArray(data.cities)) return changed;
                    var targets = espionageData.get().targets;
                    var players = espionageData.get().players;
                    $.each(data.cities, function(index, city) {
                        if (!city || (city.type && city.type !== 'city')) return;
                        var cid = parseInt(city.id);
                        var target = onlyTarget ? (onlyTarget.id == cid ? onlyTarget : null) : targets[cid];
                        if (!target) return;
                        var playerId = parseInt(city.ownerId);
                        if (!playerId) return;
                        if (target.playerId < 0 && target.playerId !== playerId) {
                            delete players[target.playerId]; // joueur provisoire (rapports d'espionnage)
                        }
                        target.name = city.name;
                        target.playerId = playerId;
                        target.townLevel = parseInt(city.level);
                        target.islandId = parseInt(data.islandId || data.id);
                        target.coords = [parseInt(data.xCoord), parseInt(data.yCoord)];
                        target.tradeGoodType = TRADE_GOOD_LOOKUP[data.tradegood];
                        updateOrAddPlayer(playerId, city.ownerName, city.state || '', parseInt(city.ownerAllyId) || 0,
                                          city.ownerAllyTag || '', _impArmyScore(data, playerId));
                        if (city.infos && city.infos['occupation']) {
                            target.occupierId = city.infos['occupation'].id;
                            updateOrAddPlayer(city.infos['occupation'].id, city.infos['occupation'].name);
                        } else {
                            target.occupierId = 0;
                        }
                        if (city.infos && city.infos['fleetAction']) {
                            target.blockaderId = city.infos['fleetAction'].id;
                            updateOrAddPlayer(city.infos['fleetAction'].id, city.infos['fleetAction'].name);
                        } else {
                            target.blockaderId = 0;
                        }
                        changed.push(target);
                    });
                    return changed;
                }

                // v2.29 : vue d'une ville espionnée (mêmes données que pour nos villes :
                // data.id = ville, data.position[i] = { building: 'type …', level })
                function applyCityToTarget(data) {
                    if (!data || data.cities || !data.position) return null;
                    var target = espionageData.get().targets[parseInt(data.id)];
                    if (!target) return null;
                    var wall = 0, warehouse = 0, seen = 0;
                    $.each(data.position, function(index, item) {
                        if (!item || typeof item.building !== 'string') return;
                        seen++;
                        var type = item.building.split(' ')[0];
                        var level = parseInt(item.level) || 0;
                        if (type == Constants.Buildings.WALL) wall = Math.max(wall, level);
                        else if (type == Constants.Buildings.WAREHOUSE) warehouse += level;
                    });
                    if (!seen) return null;
                    target.wallLevel = wall;
                    target.warehouseLevel = warehouse;
                    return target;
                }

                function Alliance(id) {
                    this._ikaToolsType = 'alliance';

                    if (id) {
                        this.id = id;
                        this.name = null;
                    }
                }

                $.extend(Alliance.prototype, {
                    _update: function update(name) {
                        this.name = name;
                    },
                    getName: function getName() {
                        return this.name;
                    },
                    getId: function getId() {
                        return this.id;
                    }
                });

                function updateOrAddAlliance(id, name) {
                    if (id) {
                        var alliances = espionageData.get().alliances;
                        var alliance = alliances[id];
                        if (!alliance) {
                            alliance = new Alliance(id);
                            alliances[id] = alliance;
                        }
                        alliance._update(name);
                    }
                }

                function getTargets() {
                    var targets = [];
                    $.each(espionageData.get().targets, function(index, target) {
                        targets.push(target);
                    });
                    return targets;
                }

                function getTarget(id) {
                    return espionageData.get().targets[id];
                }

                function getPlayer(id) {
                    return espionageData.get().players[id];
                }

                function getPlayers() {
                    return espionageData.get().players;
                }

                var espionageData = new Data.Value(
                    'espionageData',
                    {
                        targets: {},
                        alliances: {},
                        players: {},
                    },
                    {
                        reviver: function espionageDataReviver(key, value) {
                            if (value && value._ikaToolsType) {
                                var obj;

                                switch(value._ikaToolsType) {
                                    case 'target': obj = new Target(); break;
                                    case 'targetCombat': obj = new Target.Combat(); break;
                                    case 'player': obj = new Player(); break;
                                    case 'alliance': obj = new Alliance(); break;
                                    case 'militaryUnits': obj = new MilitaryUnits(); break;
                                }
                                $.extend(obj, value);
                                if (obj._postLoad) {
                                    obj._postLoad();
                                }
                                return obj;
                            }
                            return value;
                        },
                        version: 6,

                        loadCallback: function espionageDataLoaded() {
                        },
                    });

                var espionageChangedEvent = Utils.thunk(function() {
                    return new Utils.EventDispatcher();
                });

                function registerEspionageChangedHandler(callback) {
                    return espionageChangedEvent().addListener(callback);
                }

                function raiseEspionageChanged(changes) {
                    espionageChangedEvent().send(changes);
                }

                function startTracking() {
                    var messageIdRegex = /message(\d+)/
                    espionageData.load();

                    // v2.27 : à chaque île affichée, les cibles qui s'y trouvent sont mises à jour
                    View.registerIkariamAjaxResponseCallback(
                        function processIslandForTargets(response) {
                            try {
                                var bg = null;
                                Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                                    if (name == IkaTools.Constants.IkariamAjaxResponseType.UPDATE_BACKGROUND_DATA) {
                                        bg = data;
                                    } else if (name == IkaTools.Constants.IkariamAjaxResponseType.UPDATE_GLOBAL_DATA &&
                                               data && !bg) {
                                        bg = data['backgroundData'] || data[11] || null;
                                    }
                                });
                                var cityTarget = applyCityToTarget(bg);
                                if (cityTarget) {
                                    espionageData.saveAsync();
                                    raiseEspionageChanged({ type: 'targetsChanged', targets: [cityTarget] });
                                    console.log('[Imperator] Espionnage : ' + cityTarget.name + ' : mur ' +
                                                cityTarget.wallLevel + ', entrepôt ' + cityTarget.warehouseLevel);
                                }
                                var changed = applyIslandToTargets(bg);
                                if (changed.length) {
                                    espionageData.saveAsync();
                                    raiseEspionageChanged({ type: 'targetsChanged', targets: changed });
                                    console.log('[Imperator] Espionnage : ' + changed.length +
                                                ' cible(s) mise(s) à jour depuis l\'île', $.map(changed, function(t) {
                                                    var p = getPlayer(t.playerId), a = p && p.getAlliance();
                                                    return t.name + ' (' + (p ? p.getName() : '?') +
                                                           (a ? ', ' + a.getName() : '') + ')';
                                                }).join(', '));
                                }
                            } catch (e) {
                                console.warn('[Imperator] Lecture de l\'île pour l\'espionnage échouée', e);
                            }
                        }, true);

                    View.registerIkariamAjaxResponseCallback(
                        function processHideoutView(response) {
                            IkaTools.Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                                if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                                    if (data[0] == Constants.View.HIDEOUT) {
                                        var newTargets = [];
                                        $('#tabSafehouse li.city a').each(function(index, item) {
                                            var cityId = parseInt(Utils.parseUrlParams($(item).attr('href'))['cityId']);
                                            if (!cityId) return;
                                            if (getTarget(cityId)) return;
                                            var t = new Target(cityId);
                                            t.name = $(item).text().trim().split('(')[0].trim();
                                            var coordMatch = $(item).text().match(/\[(\d+)\s*:\s*(\d+)\]/);
                                            t.coords = coordMatch ? [parseInt(coordMatch[1]), parseInt(coordMatch[2])] : [0, 0];
                                            t.tradeGoodType = 'wood';
                                            t.islandId = 0;
                                            t.townLevel = 0;
                                            t.wallLevel = 0;
                                            t.warehouseLevel = 0;
                                            espionageData.get().targets[cityId] = t;
                                            newTargets.push(t);
                                        });
                                        if (newTargets.length > 0) {
                                            espionageData.saveAsync();
                                            raiseEspionageChanged({ type: 'targetsChanged', targets: newTargets });
                                        }

                                        setTimeout(function() {
                                            var reportHeaders = $(
                                                '#espionageReports tr.espionageReports, #espionageReports tr.espionageReportsalt');
                                            if (reportHeaders.length) {
                                                var changedTargets = [];
                                                reportHeaders.each(function(index, reportHeader) {
                                                    var success = $('td.resultImage img', reportHeader).attr('src') == '/cdn/all/both/buttons/yes.png';
                                                    var cityHref = $('td.targetCity a', reportHeader).attr('href');
                                                    if (!cityHref) return;
                                                    var cityId = parseInt(Utils.parseUrlParams(cityHref)['selectCity']);
                                                    if (!cityId) return;
                                                    var messageId = parseInt(reportHeader.id.match(messageIdRegex)[1]);
                                                    var tableMailMessage = $('#tbl_mail' + messageId);

                                                    var target = getTarget(cityId);
                                                    if (!target) {
                                                        target = new Target(cityId);
                                                        var coordMatch = $('td.targetCity a', reportHeader).text().match(/\[(\d+)\s*:\s*(\d+)\]/);
                                                        target.coords = coordMatch ? [parseInt(coordMatch[1]), parseInt(coordMatch[2])] : [0, 0];
                                                        target.name = $('td.targetCity a', reportHeader).text().trim().split('\n')[0].trim();
                                                        target.tradeGoodType = 'wood';
                                                        target.islandId = 0;
                                                        target.townLevel = 0;
                                                        target.wallLevel = 0;
                                                        target.warehouseLevel = 0;
                                                        espionageData.get().targets[cityId] = target;
                                                    }
                                                    var ownerName = $('td.targetOwner', reportHeader).text().trim();
                                                    if (ownerName && !target.playerId) {
                                                        var fakePlayerId = -cityId;
                                                        updateOrAddPlayer(fakePlayerId, ownerName, 'default', 0, '');
                                                        target.playerId = fakePlayerId;
                                                    }
                                                    if (!changedTargets.includes(target)) {
                                                        changedTargets.push(target);
                                                    }

                                                    if (success && target) {
                                                        if (tableMailMessage.find('table.resourcesTable').length &&
                                                            messageId > target.resources.lastSpyMessageId) {
                                                            var resourceTds = $('#tbl_mail' + messageId + ' td.count');
                                                            target.resources.wood   = parseInt(resourceTds.get(0).textContent.replace(',', ''));
                                                            target.resources.wine   = parseInt(resourceTds.get(1).textContent.replace(',', ''));
                                                            target.resources.marble = parseInt(resourceTds.get(2).textContent.replace(',', ''));
                                                            target.resources.glass  = parseInt(resourceTds.get(3).textContent.replace(',', ''));
                                                            target.resources.sulfur = parseInt(resourceTds.get(4).textContent.replace(',', ''));
                                                            target.resources.lastSpyMessageId = messageId;
                                                            target.resources.lastSpyTime =
                                                                Utils.parseIkariamTimestamp($('td.date', reportHeader).text()).getTime();
                                                            target._refresh(false, function() {
                                                                espionageData.saveAsync();
                                                                raiseEspionageChanged({
                                                                    type: 'targetsRefreshed',
                                                                    targets: [target],
                                                                });
                                                            });
                                                            changedTargets.push(target);
                                                        } else if ($('td.garrison', reportHeader).length &&
                                                                   messageId > target.militaryLastSpyMessageId &&
                                                                   tableMailMessage.find(' table.reportTable').length) {
                                                            readSpiedMilitary(target.getMilitary(),
                                                                              tableMailMessage.find('table.reportTable tr:nth-child(2) td.count'));
                                                            readSpiedMilitary(target.getOtherMilitary(),
                                                                              tableMailMessage.find('table.reportTable tr:nth-child(3) td.count'));
                                                            target.militaryLastSpyMessageId = messageId;
                                                            target.militaryLastSpyTime = Utils.parseIkariamTimestamp($('td.date', reportHeader).text()).getTime();
                                                            target._refresh(false, function() {
                                                                espionageData.saveAsync();
                                                                raiseEspionageChanged({
                                                                    type: 'targetsRefreshed',
                                                                    targets: [target],
                                                                });
                                                            });
                                                            changedTargets.push(target);
                                                        }
                                                    }
                                                });
                                                if (changedTargets.length) {
                                                    espionageData.saveAsync();
                                                    raiseEspionageChanged({
                                                        type: 'targetsChanged',
                                                        targets: changedTargets
                                                    });
                                                }
                                            }
                                        }, 500);
                                    } else if (data[0] == Constants.View.MILITARY_ADVISOR_REPORT) {
                                        var report = $('#troopsReport');
                                        var defender = report.find('.defender b:first a:first');
                                        if (defender.length) {
                                            var target = getTarget(parseInt(
                                                Utils.parseUrlParams(defender.attr('href'))['cityId']));
                                            if (target) {
                                                var header = report.find('.header');
                                                var result = report.find('div.result');
                                                var combatId = parseInt(Utils.parseUrlParams(
                                                    report.find('div p.link:first a.button:first',report).attr('href'))['detailedCombatId']);
                                                var combatTime = Utils.parseIkariamTimestamp(report.find('.header .date').text()).getTime();
                                                var type = report.find('.overview .fleet').length ?
                                                    IkaTools.Constants.CombatType.BLOCKADE : IkaTools.Constants.CombatType.PILLAGE;

                                                var combat = target._getOrAddCombat(combatId);
                                                combat.type = type;
                                                combat.time = combatTime;
                                                result.find('.resources li.value').each(function(index, item) {
                                                    var resourceInfo = $(item);
                                                    var src = resourceInfo.find('img').attr('src');
                                                    if (!src) return;
                                                    var srcMatch = src.match(/icon_([a-z]*)_small.png/);
                                                    if (!srcMatch) return;
                                                    var type = srcMatch[1];
                                                    if (type == 'crystal') {
                                                        type = Constants.Resources.GLASS;
                                                    }
                                                    var amount = parseInt(resourceInfo.text());
                                                    combat.resources[type] = amount;
                                                });

                                                target._refresh(false, function() {
                                                    espionageData.saveAsync();
                                                    raiseEspionageChanged({
                                                        type: 'targetsRefreshed',
                                                        targets: [target],
                                                    });
                                                });
                                            }

                                            espionageData.saveAsync();
                                            raiseEspionageChanged({
                                                type: 'combatUpdated',
                                                targets: [target],
                                            });
                                        }
                                    }
                                } else if (name == Constants.IkariamAjaxResponseType.BACKGROUND_DATA) {
                                }
                            });
                        }, true);
                }

                function readSpiedMilitary(military, unitTds) {
                    var baseArmyCount = true;
                    var baseNavyCount = true;
                    var navyOffset = 0;

                    if (unitTds.length == 14) { // army only
                        baseNavyCount = 0;
                    } else if (unitTds.length == 11) { // navy only
                        baseArmyCount = 0;
                        navyOffset = -14;
                    } else if (unitTds.length == 0) { // nothing
                        baseNavyCount = 0;
                        baseArmyCount = 0;
                    }
                    military._setCount(Constants.Military.HOPLITE, baseArmyCount && parseInt($(unitTds[0]).text()) || 0);
                    military._setCount(Constants.Military.STEAM_GIANT, baseArmyCount && parseInt($(unitTds[1]).text()) || 0);
                    military._setCount(Constants.Military.SPEARMAN, baseArmyCount && parseInt($(unitTds[2]).text()) || 0);
                    military._setCount(Constants.Military.SWORDSMAN, baseArmyCount && parseInt($(unitTds[3]).text()) || 0);
                    military._setCount(Constants.Military.SLINGER, baseArmyCount && parseInt($(unitTds[4]).text()) || 0);
                    military._setCount(Constants.Military.ARCHER, baseArmyCount && parseInt($(unitTds[5]).text()) || 0);
                    military._setCount(Constants.Military.GUNNER, baseArmyCount && parseInt($(unitTds[6]).text()) || 0);
                    military._setCount(Constants.Military.BATTERING_RAM, baseArmyCount && parseInt($(unitTds[7]).text()) || 0);
                    military._setCount(Constants.Military.CATAPULT, baseArmyCount && parseInt($(unitTds[8]).text()) || 0);
                    military._setCount(Constants.Military.MORTAR, baseArmyCount && parseInt($(unitTds[9]).text()) || 0);
                    military._setCount(Constants.Military.GYROCOPTER, baseArmyCount && parseInt($(unitTds[10]).text()) || 0);
                    military._setCount(Constants.Military.BALLOON_BOMBADIER, baseArmyCount && parseInt($(unitTds[11]).text()) || 0);
                    military._setCount(Constants.Military.COOK, baseArmyCount && parseInt($(unitTds[12]).text()) || 0);
                    military._setCount(Constants.Military.DOCTOR, baseArmyCount && parseInt($(unitTds[13]).text()) || 0);

                    military._setCount(Constants.Military.RAM_SHIP, parseInt(baseNavyCount && $(unitTds[16 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.FLAME_THROWER, parseInt(baseNavyCount && $(unitTds[14 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.STEAM_RAM, parseInt(baseNavyCount && $(unitTds[15 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.BALLISTA_SHIP, parseInt(baseNavyCount && $(unitTds[18 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.CATAPULT_SHIP, parseInt(baseNavyCount && $(unitTds[17 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.MORTAR_SHIP, parseInt(baseNavyCount && $(unitTds[19 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.SUBMARINE, parseInt(baseNavyCount && $(unitTds[21 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.PADDLE_SPEED_SHIP, parseInt(baseNavyCount && $(unitTds[22 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.BALLOON_CARRIER, parseInt(baseNavyCount && $(unitTds[23 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.TENDER, parseInt(baseNavyCount && $(unitTds[24 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.ROCKET_SHIP, parseInt(baseNavyCount && $(unitTds[20 + navyOffset]).text()) || 0);
                }

                function getDebugString(includePrivateData) {
                    return JSON.stringify(espionageData.get(), function debugStringify(name, value) {
                        if (name === 'name' || name === 'coordinates') {
                            return undefined;
                        }
                        return value;
                    });
                }

                function resetData() {
                    espionageData.reset();
                }

                return {
                    startTracking: startTracking,
                    registerEspionageChangedHandler: registerEspionageChangedHandler,
                    getTargets: getTargets,
                    getPlayers: getPlayers,

                    getDebugString: getDebugString,
                    resetData: resetData,
                };
            }();
