
            var CivilizationData = function CivilizationData() {
                this._ikaToolsType = 'civilizationData';

                this.research = {};
                this.government = 'ikakratie';
                this.movements = {};
                this.premiumFeatures = {};
                this.goldData = {
                    current:0, revenue:0, gods:0, scientists:0,
                    upkeep:0, premium:0, net:0,
                    currentUpdated:0, incomeUpdated:0
                };
                // v2.07 : données du Sanctuaire divin (faveur totale + horodatage).
                // Les affectations dieu<->ville sont stockées sur chaque objet City
                // (city.worshipGodId / city.worshipGodName), qui persistent via le reviver.
                this.shrineData = { favor: 0, updated: 0 };
            }

            $.extend(CivilizationData.prototype, {
                _startMovementTimers: function _startMovementTimers() {
                    $.each(this.movements, function updateMovementsOnLoad(id, movement) {
                        if (movement._updateAndStartTimer()) {
                            delete this.movements[id];
                        }
                    }.bind(this));
                    this._purgeStaleMovements(); // v2.16
                },
                // v2.16 : retire un mouvement SANS effet de bord (pas de re-crédit d'unités ni de ressources)
                _dropMovement: function dropMovement(movementId, changedAccumulator) {
                    var movement = this.movements[movementId];
                    if (!movement) return;
                    try { movement._cancelTimer(); } catch (e) {}
                    delete this.movements[movementId];
                    if (changedAccumulator) {
                        changedAccumulator.push({
                            movement: movement,
                            type: Constants.Movements.EventType.CANCELLED,
                        });
                    }
                },
                // v2.16 : purge des mouvements périmés (reliquats). Silencieuse : appelée aussi
                // pendant un rendu, elle ne déclenche pas d'événement (évite un redessin en boucle).
                _purgeStaleMovements: function purgeStaleMovements() {
                    var now = View.gameTimeNow(), stale = [];
                    $.each(this.movements, function(id, mv) {
                        try { if (!mv || !mv._isStale || mv._isStale(now)) stale.push(id); }
                        catch (e) { stale.push(id); }
                    });
                    if (!stale.length) return 0;
                    for (var i = 0; i < stale.length; i++) this._dropMovement(stale[i], null);
                    console.log('[Imperator] ' + stale.length + ' mouvement(s) périmé(s) retiré(s)');
                    empireData.saveAsync();
                    return stale.length;
                },
                _updateGovernment: function updateGovernment(government, changedAccumulator) {
                    if (this.government != government) {
                        changedAccumulator.push({
                            type: Constants.CivilizationData.GOVERNMENT,
                            government: government,
                        });

                    }
                    this.government = government;
                },
                _updateResearch: function updateResearch(researchId, level, changedAccumulator) {
                    var oldResearch = this.research[researchId];
                    if (!oldResearch || oldResearch.level != level) {
                        changedAccumulator.push({
                            type: Constants.CivilizationData.RESEARCH,
                            id: researchId,
                            level: level,
                        });
                    }
                    this.research[researchId] = { level: level };
                },
                _updateMovement: function updateMovement(movement, changedAccumulator) {
                    var existing = this.movements[movement.getId()];
                    if (existing) {
                        existing._cancelTimer();
                    }
                    this.movements[movement.getId()] = movement;
                    movement._updateAndStartTimer();
                    if (!existing || (movement.getCompletionTime() != existing.getCompletionTime())) {
                        changedAccumulator.push({
                            movement: movement,
                            type: Constants.Movements.EventType.DATA_UPDATED,
                        });
                    }
                },
                _removeMovement: function removeMovement(movementId, changedAccumulator) {
                    var movement = this.movements[movementId];
                    if (movement) {
                        if (movement.stage == Constants.Movements.Stage.LOADING && movementId >= 0) {
                            var originCity = movement.getOriginCity();
                            movement._updateCity(originCity, originCity);
                        }
                        movement._cancelTimer();
                        delete this.movements[movementId];
                        changedAccumulator.push({
                            movement: movement,
                            type: Constants.Movements.EventType.CANCELLED,
                        });
                    }
                },
                _updatePremiumFeature: function updatePremiumFeature(
                changedAccumulator, feature, enabled) {
                    var currentlyEnabled = this.premiumFeatures[feature] || false;
                    if (currentlyEnabled != enabled) {
                        changedAccumulator.push({
                            type: Constants.CivilizationData.PREMIUM_FEATURE,
                            feature: feature,
                            enabled: enabled,
                        });
                    }
                    this.premiumFeatures[feature] = enabled;
                },
                hasResearched: function hasResearched(researchId) {
                    var research = this.research[researchId];
                    return research ? research.level > 0 : undefined;
                },
                getResearchLevel: function getResearchLevel(researchId) {
                    var research = this.research[researchId];
                    return research ? research.level : undefined;
                },
                getGovernment: function getGovernment() {
                    return this.government;
                },
                getMovements: function getMovements() {
                    this._purgeStaleMovements(); // v2.16
                    var movements = [];
                    $.each(this.movements, function(id, movement) {
                        movements.push(movement);
                    });
                    movements.sort(function compareMovements(m1, m2) {
                        return m1.getArrivalTime() - m2.getArrivalTime();
                    });
                    return movements;
                },
                getMovement: function getMovement(movementId) {
                    return this.movements[movementId];
                },
                isPremiumFeatureEnabled: function isPremiumFeatureEnabled(feature) {
                    return this.premiumFeatures[feature];
                },
                getGoldData: function getGoldData() {
                    if (!this.goldData) this.goldData = {current:0,revenue:0,gods:0,scientists:0,upkeep:0,premium:0,net:0,currentUpdated:0,incomeUpdated:0};
                    return this.goldData;
                },
                _updateGoldData: function _updateGoldData(upd) {
                    var gd = this.getGoldData();
                    if (upd.current    !== undefined) gd.current    = upd.current;
                    if (upd.revenue    !== undefined) gd.revenue    = upd.revenue;
                    if (upd.gods       !== undefined) gd.gods       = upd.gods;
                    if (upd.scientists !== undefined) gd.scientists = upd.scientists;
                    if (upd.upkeep     !== undefined) gd.upkeep     = upd.upkeep;
                    if (upd.premium    !== undefined) gd.premium    = upd.premium;
                    if (upd.net        !== undefined) gd.net        = upd.net;
                    if (upd.currentUpdated !== undefined) gd.currentUpdated = upd.currentUpdated;
                    if (upd.incomeUpdated  !== undefined) gd.incomeUpdated  = upd.incomeUpdated;
                    // Recalculer net si non fourni mais composants disponibles
                    if (upd.net === undefined && gd.incomeUpdated > 0) {
                        gd.net = (gd.revenue||0)+(gd.gods||0)+(gd.scientists||0)+(gd.upkeep||0)+(gd.premium||0);
                    }
                },
                // v3.5 : données lues dans une académie (valables pour tout l'empire) : coût d'un
                // chercheur pour la ville (impôt perdu + entretien), parchemin d'Athéna.
                getAcademyData: function getAcademyData() {
                    if (!this.academyData) this.academyData = { costPerScientist: 0, hasAthenaScroll: null,
                                                                isAthenaScrollActive: null, updated: 0 };
                    return this.academyData;
                },
                _updateAcademyData: function _updateAcademyData(upd) {
                    $.extend(this.getAcademyData(), upd, { updated: Date.now() });
                },
                // v2.07 : accès aux données Sanctuaire
                getShrineData: function getShrineData() {
                    if (!this.shrineData) this.shrineData = { favor: 0, updated: 0 };
                    return this.shrineData;
                },
                _updateShrineData: function _updateShrineData(upd) {
                    var sd = this.getShrineData();
                    if (upd.favor   !== undefined) sd.favor   = upd.favor;
                    if (upd.updated !== undefined) sd.updated = upd.updated;
                    // v2.12 : bienveillance par dieu { godId: {name, graceEnd, graceText, updated} }
                    if (upd.gods        !== undefined) sd.gods        = upd.gods;
                    if (upd.godsUpdated !== undefined) sd.godsUpdated = upd.godsUpdated;
                },
            });

            function calculateTravelTime(island1Coords, island2Coords, units, transporters) {
                // same island
                if (island1Coords[0] == island2Coords[0] &&
                    island1Coords[1] == island2Coords[1]) {
                    var baseTime = 10 * Constants.Time.MILLIS_PER_MINUTE;
                    var multiplier = transporters ? 60 : 80; // fastest unit
                    if (units) {
                        $.each(units.getCounts(), function applyUnitSpeed(type, count) {
                            if (count) {
                                var data = Constants.UnitData[type];
                                multiplier = Math.min(multiplier, data.speed);
                            }
                        });
                    }
                    return baseTime * 60 / multiplier;
                } else {
                    baseTime = 20 * Math.sqrt(Math.pow(island1Coords[0] - island2Coords[0], 2) +
                                              Math.pow(island1Coords[1] - island2Coords[1], 2)) *
                        Constants.Time.MILLIS_PER_MINUTE;
                    multiplier = 60; // fastest ship
                    if (units) {
                        $.each(units.getCounts(), function applyUnitSpeed(type, count) {
                            if (count) {
                                var data = Constants.UnitData[type];
                                if (!data.isArmy) {
                                    multiplier = Math.min(multiplier, data.speed);
                                }
                            }
                        });
                    }
                    return baseTime * 60 / multiplier;
                }
            }

            function Movement(
            id, type, completionTime, mission, stage, originCityId, targetCityId,
             transports, units, resources, transportTime) {
                this._ikaToolsType = 'movement';

                if (id) {
                    this.id = id;
                    this.completionTime = completionTime;
                    this.mission = mission;
                    this.stage = stage;
                    this.originCityId = originCityId;
                    this.targetCityId = targetCityId;
                    this.units = units;
                    this.transports = transports;
                    this.resources = resources;

                    this.transportTime = transportTime;

                    this.type = type;

                    var originCity = this.getOriginCity();
                    var targetCity = this.getTargetCity();

                    if (originCity && targetCity) {
                        var originCoords = originCity.getIslandCoordinates();
                        var targetCoords = targetCity.getIslandCoordinates();

                        if (originCoords && targetCoords) {
                            this.transportTime = calculateTravelTime(
                                originCoords, targetCoords, this.units, this.transports);
                        }
                    }

                    if (!this.transportTime) {
                        this.transportTime = Number.POSITIVE_INFINITY;
                    }

                    if (this.completionTime <= new Date().getTime()) {
                        this._toNextStage();
                    }
                }
            }

            $.extend(Movement.prototype, {
                _cancelTimer: function cancelTimer() {
                    if (this.completionEvent) {
                        this.completionEvent();
                    }
                },
                _startTimer: function startTimer() {
                    var remainingTime = this.getTimeRemaining();
                    if (isFinite(remainingTime)) {
                        this.completionEvent = movementsChangedEvent().scheduleSend(
                            'Movement[' + this.id + ']',
                            remainingTime + Constants.Time.SAFE_TIME_DELTA,
                            function moveToNextStage() {
                                if (this._toNextStage()) {
                                    getCivilizationData()._removeMovement(this.id, []);
                                }
                                empireData.saveAsync();
                            }.bind(this),
                            [{
                                previousStage: this.getStage(),
                                movement: this,
                                type: this._isFinalStage() ?
                                Constants.Movements.EventType.COMPLETED :
                                Constants.Movements.EventType.STAGE_CHANGED,
                            }]);
                    }
                },
                _updateCity: function updateCity(city, originCity) {
                    var resourceChanges = [];
                    if (city) {
                        if (originCity) {
                            originCity._updateActionPointsBy(1, resourceChanges);
                        }
                        if (city.isOwn() &&
                            (this.mission == Constants.Movements.Mission.TRANSPORT ||
                             this.mission == Constants.Movements.Mission.PLUNDER)) {
                            $.each(this.resources, function updateCityResource(name, value) {
                                city._incrementResource(name, resourceChanges, value);
                            });
                        }
                        raiseResourcesChanged(resourceChanges);

                        if (this.mission == Constants.Movements.Mission.DEPLOY_ARMY ||
                            this.mission == Constants.Movements.Mission.DEPLOY_NAVY) {
                            var military = city.getMilitary();
                            military._increment(this.units);
                            raiseMilitaryChanged([{
                                military: military,
                                city: city,
                                type: 'deployment_arrived',
                            }]);
                        } else if (this.mission == Constants.Movements.Mission.PLUNDER &&
                                   this.stage == Constants.Movements.Stage.RETURNING &&
                                   city.isOwn() && this.units) {
                            // v2.25 : les troupes d'un pillage reviennent dans leur ville
                            var plMilitary = city.getMilitary();
                            plMilitary._increment(this.units);
                            raiseMilitaryChanged([{
                                military: plMilitary,
                                city: city,
                                type: 'plunder_returned',
                            }]);
                            console.log('[Imperator] Retour de pillage (' + city.getName() + ') : troupes recréditées', this.units.getCounts());
                        }
                    }
                },
                _updateAndStartTimer: function updateAndStartTimer() {
                    this._cancelTimer();
                    // v2.32 : durée du trajet inconnue : on attend l'heure réelle du Conseiller militaire
                    if (this._etaUnknown) return false;

                    if (this.completionTime <= View.gameTimeNow()) {
                        return this._toNextStage();
                    } else {
                        this._startTimer();
                    }
                },
                _toNextStage: function toNextStage() {
                    var isFinalStage = this._isFinalStage();
                    if (this.stage == Constants.Movements.Stage.LOADING) {
                        this.stage = Constants.Movements.Stage.EN_ROUTE;
                        // v2.16 : Infinity devenait null à la sauvegarde JSON -> mouvement fantôme.
                        // Trajet inconnu (cible hors empire) : on garde la fin de chargement, la purge
                        // retirera l'estimation ; le conseiller militaire donne le vrai horaire.
                        // v2.32 : une durée nulle (transport lu en chargement dans le Conseiller) est
                        // aussi inconnue : sinon la cargaison était créditée dès la fin du chargement.
                        if (this._hasTransportTime()) {
                            this.completionTime += this.transportTime;
                            this._startTimer();
                        } else {
                            this._etaUnknown = true; // pas de minuterie : rien n'est crédité à l'aveugle
                            console.log('[Imperator] Mouvement ' + this.id + ' : chargement terminé, heure ' +
                                        'd\'arrivée en attente du Conseiller militaire');
                        }
                    } else if (this.stage == Constants.Movements.Stage.EN_ROUTE) {
                        if (isFinalStage) {
                            this._updateCity(this.getTargetCity(), this.getOriginCity());
                        }
                    } else if (this.stage == Constants.Movements.Stage.RETURNING) {
                        if (isFinalStage) {
                            var originCity = this.getOriginCity();
                            this._updateCity(originCity, originCity);
                        }
                    }
                    return isFinalStage;
                },
                _isFinalStage: function isFinalStage() {
                    if (this.stage == Constants.Movements.Stage.LOADING) {
                        return false;
                    } else if (this.stage == Constants.Movements.Stage.EN_ROUTE) {
                        if (this.mission == Constants.Movements.Mission.TRANSPORT) {
                            var city = getCity(this.targetCityId);
                            return city && city.isOwn();
                        } else if (this.mission == Constants.Movements.Mission.DEPLOY_ARMY ||
                                   this.mission == Constants.Movements.Mission.DEPLOY_NAVY) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                },
                // v2.16 : mouvement périmé = date illisible, ou arrivée dépassée de plus de 10 min
                _isStale: function isStale(now) {
                    var t = this.completionTime;
                    if (t === null || t === undefined || typeof t !== 'number' || !isFinite(t)) return true;
                    if (this.stage == Constants.Movements.Stage.LOADING) return false; // passera EN_ROUTE
                    // v2.32 : arrivée inconnue : gardé 24 h (le Conseiller militaire donnera l'heure réelle)
                    if (this._etaUnknown) return t + 24 * 60 * Constants.Time.MILLIS_PER_MINUTE < (now || View.gameTimeNow());
                    return t + 10 * Constants.Time.MILLIS_PER_MINUTE < (now || View.gameTimeNow());
                },
                getId: function getId() {
                    return this.id;
                },
                getMission: function getMission() {
                    return this.mission;
                },
                getStage: function getStage() {
                    return this.stage;
                },
                getOriginCityId: function getOriginCityId() {
                    return this.originCityId;
                },
                getTargetCityId: function getTargetCityId() {
                    return this.targetCityId;
                },
                getOriginCity: function getOriginCity() {
                    return this.originCityId && getCity(this.originCityId);
                },
                getTargetCity: function getTargetCity() {
                    return this.targetCityId && getCity(this.targetCityId);
                },
                getCompletionTime: function getCompletionTime() {
                    return this.completionTime;
                },
                getTimeRemaining: function getTimeRemaining() {
                    return this.completionTime - View.gameTimeNow();
                },
                getArrivalTime: function() {
                    var time = this.getCompletionTime();
                    if (this.stage == Constants.Movements.Stage.LOADING && this._hasTransportTime()) {
                        time += this.transportTime;
                    }
                    return time;
                },
                // v2.32 : durée de trajet connue (nombre > 0 ; 0, null, NaN = inconnue)
                _hasTransportTime: function hasTransportTime() {
                    return typeof this.transportTime === 'number' && isFinite(this.transportTime) && this.transportTime > 0;
                },
                // v2.32 : heure d'arrivée inconnue (en chargement sans trajet, ou chargement terminé)
                isEtaUnknown: function isEtaUnknown() {
                    return !!this._etaUnknown ||
                        (this.stage == Constants.Movements.Stage.LOADING && !this._hasTransportTime());
                },
                getUnits: function getUnits() {
                    return this.units;
                },
                getResource: function getResource(resourceName) {
                    return this.resources[resourceName];
                },
                isHostile: function isHostile() {
                    return this.type.indexOf('hostile') >= 0;
                },
                isOwn: function isOwn() {
                    return this.type.indexOf('own') >= 0;
                }
            });

            _impTypes.civilizationData = CivilizationData;
            _impTypes.movement = Movement;

