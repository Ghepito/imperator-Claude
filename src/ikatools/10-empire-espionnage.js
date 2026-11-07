        var EmpireData = function() {
            function Military(city) {
                this._ikaToolsType = 'military';

                this.lastArmyUpdate = 0;
                this.lastNavyUpdate = 0;

                this.present = new MilitaryUnits();
                this.armyTrainingBatches = [];
                this.navyTrainingBatches = [];

                this._setCity(city);
            }

            $.extend(Military.prototype, {
                _setCity: function setCity(city) {
                    if (city) {
                        this.city = Utils.fixedFunction(city);
                        this._startArmyTrainingTimers();
                        this._startNavyTrainingTimers();
                    }
                },
                _startTrainingTimers: function startTrainingTimers(batches) {
                    var military = this;
                    while (batches.length > 0 && batches[0].completionTime <= View.gameTimeNow()) {
                        var batch = batches.shift();
                        if ((batch.type == Constants.Military.ARMY &&
                             batch.getCompletionTime() > this.lastArmyUpdate) ||
                            (batch.type == Constants.Military.NAVY &&
                             batch.getCompletionTime() > this.lastNavyUpdate)) {
                            military.present._increment(batch.getUnits());
                        }
                    }
                    $.each(batches, function startTrainingBatchTimers(index, batch) {
                        if (batch.completionEvent) {
                            batch.completionEvent();
                        }
                        batch.completionEvent = militaryChangedEvent().scheduleSend(
                            'MilitaryTrainingComplete[' + military.city().getId() + ']',
                            batch.getCompletionTime() - View.gameTimeNow() +
                            Constants.Time.SAFE_TIME_DELTA,
                            function militaryTrainingComplete() {
                                military.present._increment(batches.shift().getUnits());
                                empireData.saveAsync();
                            },
                            [{
                                city: military.city(),
                                military: military,
                                type: 'training_complete',
                            }]);
                    });
                },
                _startArmyTrainingTimers: function startArmyTrainingTimers() {
                    this._startTrainingTimers(this.armyTrainingBatches);
                },
                _startNavyTrainingTimers: function startNavyTrainingTimers() {
                    this._startTrainingTimers(this.navyTrainingBatches);
                },
                _updatePresent: function updatePresent(unit, count) {
                    return this.present._setCount(unit, count);
                },
                _markPresentUpdated: function markPresentUpdated(army, navy) {
                    if (army || army === undefined) {
                        this.lastArmyUpdate = View.gameTimeNow();
                    }
                    if (navy || navy === undefined) {
                        this.lastNavyUpdate = View.gameTimeNow();
                    }
                },
                _setArmyTrainingBatches: function setArmyTrainingBatches(batches) {

                    $.each(this.armyTrainingBatches, function cancelTrainingBatchTimer(index, batch) {
                        if (batch.completionEvent) {
                            batch.completionEvent();
                        }
                    });

                    this.armyTrainingBatches = batches;

                    this._startArmyTrainingTimers();
                },
                _setNavyTrainingBatches: function setNavyTrainingBatches(batches) {
                    $.each(this.navyTrainingBatches, function cancelTrainingBatchTimer(index, batch) {
                        if (batch.completionEvent) {
                            batch.completionEvent();
                        }
                    });

                    this.navyTrainingBatches = batches;

                    this._startNavyTrainingTimers();
                },
                _increment: function increment(units) {
                    this.present._increment(units);
                },
                _decrement: function decrement(units) {
                    this.present._decrement(units);
                },
                _clear: function clear() {
                    this.present._clear();
                    this.armyTrainingBatches = [];
                    this.navyTrainingBatches = [];
                },
                getTrainingBatches: function getTrainingBatches(batches) {
                    return $.merge($.merge([], this.armyTrainingBatches), this.navyTrainingBatches);
                },
                getPresent: function getPresent() {
                    return this.present;
                },
            });

            function MilitaryUnits() {
                this._ikaToolsType = 'militaryUnits';

                this.units = {};
            }

            $.extend(MilitaryUnits.prototype, {
                _setCount: function setCount(unit, count) {
                    var oldCount = this.units[unit];
                    this.units[unit] = count;
                    return oldCount != count;
                },
                _increment: function increment(units) {
                    $.each(units.units, function(unit, count) {
                        this._setCount(unit, (this.getCount(unit) || 0) + count);
                    }.bind(this));
                },
                _decrement: function decrement(units) {
                    $.each(units.units, function(unit, count) {
                        this._setCount(unit, Math.max(0, (this.getCount(unit) || 0) - count));
                    }.bind(this));
                },
                _clear: function clear() {
                    this.units = {};
                },
                getCount: function getCount(unit) {
                    return this.units[unit];
                },
                getCounts: function getCounts() {
                    return this.units;
                },
                getCargoSize: function getCargoSize() {
                    var cargoSize = 0;
                    $.each(this.units, function addCargoSize(unit, count) {
                        cargoSize += Constants.UnitData[unit].cargoSize * count;
                    });
                    return cargoSize;
                },
            });

            function TrainingBatch(type, completionTime, units) {
                this._ikaToolsType = 'trainingBatch';

                this.type = type;
                this.units = units;
                this.completionTime = completionTime;
            }

            $.extend(TrainingBatch.prototype, {
                getUnits: function getUnits() {
                    return this.units;
                },
                getCompletionTime: function getCompletionTime() {
                    return this.completionTime;
                },
                _getType: function getType() {
                    return this.type;
                },
            });

            // v2.24 : signature des entrepôts/dépôts, pour savoir si la capacité lue est encore valable
            function _impWarehouseSig(city) {
                try {
                    var lv = [];
                    $.each(city.getBuildingsByType(Constants.Buildings.WAREHOUSE), function(i, b) { lv.push('w' + b.getLevel()); });
                    $.each(city.getBuildingsByType(Constants.Buildings.DUMP), function(i, b) { lv.push('d' + b.getLevel()); });
                    return lv.join(',');
                } catch (e) { return '?'; }
            }

            function City(id, type) {
                this._ikaToolsType = 'city';

                if (id) {
                    this.id = id;
                    this.type = type;

                    this.level = 0;

                    this.resources = {
                        wood: new City.Resource(this),
                        wine: new City.Resource(this),
                        marble: new City.Resource(this),
                        glass: new City.Resource(this),
                        sulfur: new City.Resource(this),
                    };

                    this.buildings = new Array(Constants.GamePlay.BUILDING_SPOTS);
                    for (var i = 0; i < Constants.GamePlay.BUILDING_SPOTS; i++) {
                        this.buildings[i] = new City.Building(this);
                    }
                    this.military = new Military();

                    this.actionPoints = 0;
                    this.researchPerHour = null;
                    this.happinessScore = null;
                    this.scientists = 0;
                    this.culturalGoods = 0;
                    this.priests = 0;
                    this.tavernWineLevel = 0;
                    this.population = undefined;

                    this.resourceUpdateTime = 0;
                    this.islandCoordinates = undefined;
                }
            }

            $.extend(City.prototype, {
                _postLoad: function postLoad() {
                    // Effacer les données or per-ville (non fiables entre sessions)
                    this.cityGoldNet        = 0;
                    this.cityGoldNetUpdated = 0;
                    while (this.buildings.length < Constants.GamePlay.BUILDING_SPOTS) {
                        this.buildings.push(new City.Building(this));
                    }
                    for (var i = 0; i < Constants.GamePlay.BUILDING_SPOTS; i++) {
                        this.buildings[i]._setCity(this);
                    }
                    if (this.isOwn()) {
                        this.resources[Constants.Resources.WOOD]._setCity(this);
                        this.resources[Constants.Resources.WINE]._setCity(this);
                        this.resources[Constants.Resources.MARBLE]._setCity(this);
                        this.resources[Constants.Resources.GLASS]._setCity(this);
                        this.resources[Constants.Resources.SULFUR]._setCity(this);
                    }
                    this.military._setCity(this);
                },
                _updateFromGlobalData: function _updateFromGlobalData(data, correctWineConsumption) {
                    var changes = [];
                    var ap = data.maxActionPoints;
                    if (ap == null) {
                        ap = parseInt($('#js_GlobalMenu_maxActionPoints').text());
                    }
                    if (!isNaN(ap)) {
                        this._updateActionPoints(ap, changes);
                    }

                    if (this.isOwn()) {
                        var wineConsumption = data.wineSpendings;
                        var baseWineConsumption = data.wineSpendings;

                        var winePress = this.getBuildingByType(Constants.Buildings.WINE_PRESS);
                        if (correctWineConsumption) {
                            if (winePress) {
                                wineConsumption = wineConsumption * (100 - winePress.getLevel()) / 100;
                            }
                        } else {
                            if (winePress) {
                                baseWineConsumption = Math.floor(
                                    wineConsumption / (100 - winePress.getLevel()) * 100);
                            }
                        }

                        // v2.20 : table maxWine (70 niveaux, maxWine[0] = niveau 1) au lieu de
                        // wineUse limitée à 48 entrées (niveaux > 47 jamais reconnus).
                        var maxWine = Constants.BuildingData[Constants.Buildings.TAVERN].maxWine;
                        if (isFinite(baseWineConsumption)) {
                            var wineLevel = 0;
                            if (baseWineConsumption > 0) {
                                wineLevel = maxWine.length;
                                for (var i = 0; i < maxWine.length; i++) {
                                    if (maxWine[i] >= baseWineConsumption) { wineLevel = i + 1; break; }
                                }
                            }
                            this._updateTavernWineLevel(wineLevel, changes);
                        }

                        this._updateResources(data.currentResources,
                                              data.maxResources || (data.headerData && data.headerData.maxResources), // v2.24
                                              data.resourceProduction,
                                              data.tradegoodProduction,
                                              wineConsumption / Constants.Time.SECONDS_PER_HOUR,
                                              changes);
                    }

                    raiseResourcesChanged(changes);
                },
                _updateFromBackgroundData: function _updateFromBackgroundData(data) {
                    this.islandId = parseInt(data.islandId);
                    if (this.isOwn()) {
                        this._updateBuildings(data.position);
                    }
                },
                _updateBuildings: function _updateBuildings(buildingsData) {
                    var changes = [];
                    for (var i = 0; i < Constants.GamePlay.BUILDING_SPOTS; i++) {
                        var building = this.buildings[i];
                        if (buildingsData[i]) {
                            if (building._update(i, buildingsData[i])) {
                                changes.push({
                                    city: this,
                                    building: building,
                                    type: Constants.BuildingEventType.DATA_REFRESH,
                                });
                            }
                        }
                    }
                    this.level = this.buildings[0].getLevel();
                    raiseBuildingsChanged(changes);
                },


                // Mise à jour Ressources

                _updateResources: function updateResources(
                currentInfo, maxInfo, woodProduction, resourceProduction, wineConsumption,
                 changedAccumulator) {

                    if (!currentInfo) return;

                    // Helper: prend la 1ère valeur EXISTANTE (pas "truthy") parmi plusieurs clés
                    function pick(obj, keys) {
                        if (!obj) return undefined;
                        for (let i = 0; i < keys.length; i++) {
                            const k = keys[i];
                            if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
                        }
                        return undefined;
                    }

                    // v2.24 : capacité réelle d'entrepôt envoyée par le jeu (même valeur pour toutes les ressources)
                    try {
                        var maxV = Number(pick(maxInfo, ["resource", "wood", "0", 0]));
                        if (isFinite(maxV) && maxV > 0) {
                            var firstRead = (this._realCapacity !== maxV);
                            this._realCapacity = maxV;
                            this._realCapacitySig = _impWarehouseSig(this);
                            this._realCapacityUpdated = View.gameTimeNow();
                            if (firstRead) {
                                console.log('[Imperator] Capacité réelle lue (' + this.getName() + ') : ' + maxV +
                                            ' (formule : ' + this._formulaCapacity().maximum + ')');
                            }
                        }
                    } catch (eCap) {}

                    // Bois : certains serveurs/versions utilisent "resource", d'autres "wood" ou "0"
                    const woodCurrent = pick(currentInfo, ["resource", "wood", "0"]);

                    // Luxes : parfois "1..4", parfois "wine/marble/glass/sulfur", parfois "1..4" mais en string/number
                    const wineCurrent   = pick(currentInfo, ["1", 1, "wine"]);
                    const marbleCurrent = pick(currentInfo, ["2", 2, "marble"]);
                    const glassCurrent  = pick(currentInfo, ["3", 3, "glass"]);
                    const sulfurCurrent = pick(currentInfo, ["4", 4, "sulfur"]);

                    this._updateResource(Constants.Resources.WOOD,
                                         changedAccumulator,
                                         woodCurrent,
                                         woodProduction);

                    this._updateResource(Constants.Resources.WINE,
                                         changedAccumulator,
                                         wineCurrent,
                                         this.getTradeGoodType() == Constants.Resources.WINE ? resourceProduction : undefined,
                                         wineConsumption);

                    this._updateResource(Constants.Resources.MARBLE,
                                         changedAccumulator,
                                         marbleCurrent,
                                         this.getTradeGoodType() == Constants.Resources.MARBLE ? resourceProduction : undefined);

                    this._updateResource(Constants.Resources.GLASS,
                                         changedAccumulator,
                                         glassCurrent,
                                         this.getTradeGoodType() == Constants.Resources.GLASS ? resourceProduction : undefined);

                    this._updateResource(Constants.Resources.SULFUR,
                                         changedAccumulator,
                                         sulfurCurrent,
                                         this.getTradeGoodType() == Constants.Resources.SULFUR ? resourceProduction : undefined);

                    this._updatePopulation(currentInfo.population != null ? currentInfo.population : undefined, changedAccumulator);
                    this.resourceUpdateTime = View.gameTimeNow();
                },


                _updateResource: function updateResource(
                name, changedAccumulator, current, max, production, consumption) {
                    var resource = this.resources[name];
                    if (resource._update(current, max, production, consumption)) {
                        changedAccumulator.push({
                            city: this,
                            type: name,
                            value: resource,
                        });
                    }
                },


                _incrementResource: function incrementResource(name, changedAccumulator, delta) {
                    var resource = this.resources[name];
                    if (delta) {
                        resource._increment(delta);
                        changedAccumulator.push({
                            city: this,
                            type: name,
                            value: resource,
                        });
                    }
                },

                // Fin mise à jour Ressources

                _updateActionPoints: function updateActionPoints(actionPoints, changedAccumulator) {
                    if (this.actionPoints != actionPoints) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.ACTION_POINTS,
                            value: actionPoints,
                        });
                    }
                    this.actionPoints = actionPoints;
                },
                _updateActionPointsBy: function updateActionPointsBy(delta, changedAccumulator) {
                    this._updateActionPoints(
                        Math.max(0, Math.min(this.actionPoints + delta, this.getMaxActionPoints())),
                        changedAccumulator);
                },
                _updateScientists: function updateScientists(scientists, changedAccumulator) {
                    if (this.scientists != scientists) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.SCIENTISTS,
                            value: scientists,
                        });
                    }
                    this.scientists = scientists;
                },

                _updateResearchPerHour: function updateResearchPerHour(value, changedAccumulator) {
                    this.researchPerHour = value;
                },

                _updateHappinessScore: function updateHappinessScore(value, changedAccumulator) {
                    this.happinessScore = value;
                },

                // Niveau taverne
                _updateTavernWineLevel: function updateTavernWineLevel(level, changedAccumulator) {
                    if (this.tavernWineLevel != level) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.TAVERN_WINE_LEVEL,
                            value: level,
                        });
                    }
                    this.tavernWineLevel = level;
                },

                // Traités culturels
                _updateCulturalGoods: function updateCulturalGoods(culturalGoods, changedAccumulator) {
                    if (this.culturalGoods != culturalGoods) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.CULTURAL_GOODS,
                            value: culturalGoods,
                        });
                    }
                    this.culturalGoods = culturalGoods;
                },

                // Population
                _updatePopulation: function updatePopulation(population, changedAccumulator) {
                    // Pas de donnée fiable dans cette réponse -> on garde la valeur précédente
                    // v2.08 : la vue Hôtel de Ville renvoie population=0 (le compteur de
                    // citoyens n'y est pas exposé) ; 0 (ou négatif) = donnée non fiable,
                    // on conserve la dernière valeur connue au lieu d'écraser à zéro.
                    if (population === undefined || population === null || isNaN(population) || Number(population) <= 0) {
                        return;
                    }
                    if (Math.abs(this.getPopulationData().population - population) >= 1) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.POPULATION,
                            value: population,
                        });
                    }
                    this.population = population;
                },

                // Priest
                _updatePriests: function updatePriests(priests, changedAccumulator) {
                    if (this.priests != priests) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.PRIESTS,
                            value: priests,
                        });
                    }
                    this.priests = priests;
                },

                getLastResourceUpdate: function getLastResourceUpdate() {
                    return this.resourceUpdateTime;
                },

                getTimeSinceResourceUpdate: function getTimeSinceLastResourceUpdate() {
                    return View.gameTimeNow() - this.resourceUpdateTime;
                },

                isOwn: function isOwn() {
                    return this.type == Constants.CityType.OWN;
                },
                isDeployment: function isDeployment() {
                    return this.type == Constants.CityType.DEPLOYMENT;
                },
                isOccupation: function isOccupation() {
                    return this.type == Constants.CityType.OCCUPATION;
                },
                getType: function getType() {
                    return this.type;
                },

                getBuildingByPosition: function getBuildingByPosition(position) {
                    return this.buildings[position];
                },
                getBuildingsByType: function getBuildingsByType(type) {
                    return this.buildings.filter(function buildingsFilter(building) {
                        return building.getType() == type;
                    });
                },
                getBuildingByType: function getBuildingByType(type) {
                    for (var i = 0; i < Constants.GamePlay.BUILDING_SPOTS; i++) {
                        var building = this.buildings[i];
                        if (building && building.getType() == type) {
                            return building;
                        }
                    }
                    return null;
                },
                getBuildings: function getBuildings() {
                    return this.buildings;
                },
                getMilitary: function getMilitary() {
                    return this.military;
                },
                getId: function getId() {
                    return this.id;
                },
                getName: function getName() {
                    return this.name;
                },
                getIslandId: function getIslandId() {
                    return this.islandId;
                },
                getTradeGoodType: function getTradeGoodType() {
                    return this.tradeGoodType;
                },
                getActionPoints: function getActionPoints() {
                    return this.actionPoints;
                },
                getMaxActionPoints: function getMaxActionPoints() {
                    return 3 + Math.floor(this.level / 4) - (this.isOwn() ? 0 : 2);
                },
                getCulturalGoods: function getCulturalGoods() {
                    return this.culturalGoods;
                },
                getTavernWineLevel: function getTavernWineLevel() {
                    return this.tavernWineLevel;
                },
                getPopulationData: function getPopulationData() {
                    var max = 0;
                    var happiness = 196;

                    var townHall = this.getBuildingByType(Constants.Buildings.TOWN_HALL);
                    var temple = this.getBuildingByType(Constants.Buildings.TEMPLE);
                    var palace = this.getBuildingByType(Constants.Buildings.PALACE);
                    var tavern = this.getBuildingByType(Constants.Buildings.TAVERN);
                    var museum = this.getBuildingByType(Constants.Buildings.MUSEUM);
                    var civData = getCivilizationData();

                    if (townHall) {
                        // Formula from http://ikariam.wikia.com/wiki/Citizen
                        max += Math.floor(10 * Math.pow(townHall.getLevel(), 1.5)) * 2 + 40;

                    }

                    if (civData.hasResearched(Constants.Research.Economy.HOLIDAY)) {
                        max += 50;
                        happiness += 25;
                    }
                    if (civData.hasResearched(Constants.Research.Economy.ECONOMIC_FUTURE)) {
                        var level = civData.getResearchLevel(Constants.Research.Economy.ECONOMIC_FUTURE);
                        max += 20 * level;
                        happiness += 10 * level;
                    }
                    if (palace) {
                        if (civData.hasResearched(Constants.Research.Science.WELL_CONSTRUCTION)) {
                            max += 50;
                            happiness += 50;
                        }
                        if (civData.hasResearched(Constants.Research.Economy.UTOPIA)) {
                            max += 200;
                            happiness += 200;
                        }
                    }

                    // v2.09 : lookups de bonus sécurisés — un index NaN / hors borne
                    // (ex. culturalGoods corrompu par une réponse Hôtel de Ville) ne doit
                    // JAMAIS rendre happiness = NaN (ce qui affichait population = 0).
                    function _impBonus(table, index) {
                        var v = table ? table[index] : undefined;
                        return (typeof v === 'number' && isFinite(v)) ? v : 0;
                    }
                    // v2.18 : les tables sont indexées à partir du niveau 1 (table[0] = niveau 1)
                    // -> on lit table[niveau - 1]. Niveau 0 -> index -1 -> undefined -> bonus 0.
                    function _impLevel(v) {
                        v = Math.round(Number(v));
                        return (isFinite(v) && v > 0) ? v : 0;
                    }

                    var _tavernLevel = tavern ? _impLevel(tavern.getLevel()) : 0;
                    var _museumLevel = museum ? _impLevel(museum.getLevel()) : 0;

                    // Taverne : bonus du bâtiment + bonus du vin RÉELLEMENT servi
                    // (et non plus le bonus au niveau max de la taverne).
                    // Le niveau servi ne peut pas dépasser le niveau de la taverne.
                    var _wineServed = Math.min(_impLevel(this.getTavernWineLevel()), _tavernLevel);
                    happiness += _impBonus(Constants.BuildingData.tavern.satisfaction, _tavernLevel - 1);
                    happiness += _impBonus(Constants.BuildingData.tavern.maxBonus, _wineServed - 1);

                    // Musée : bonus du bâtiment + 50 par traité culturel.
                    // Chaque niveau de musée accueille 1 traité -> plafonné au niveau du musée.
                    var _culturalGoods = Math.min(_impLevel(this.getCulturalGoods()), _museumLevel);
                    happiness += _impBonus(Constants.BuildingData.museum.satisfaction, _museumLevel - 1);
                    happiness += _impBonus(Constants.BuildingData.museum.maxBonus, _culturalGoods - 1);

                    var government = civData.getGovernment();
                    if (government == Constants.Government.DEMOCRACY) {
                        happiness += 75;
                    } else if (government == Constants.Government.DICTATORSHIP) {
                        happiness -= 75;
                    } else if (government == Constants.Government.THEOCRACY) {
                        if (temple) {
                            happiness += Math.min(150, this.getPriests() * 5 / max * 100 * 2);
                        } else {
                            happiness -= 20;
                        }
                    }

                    happiness = happiness * (1 - this.getCorruption());

                    // v2.10/2.11 : priorite aux VRAIES valeurs lues a l'hotel de ville.
                    // - happinessScore = satisfaction libre reelle (surplus) -> croissance
                    // - _realMax = plafond de logement reel ; _realGrowth = croissance/h reelle
                    // L'estimation par batiments ne sert que de repli (ville jamais visitee),
                    // car elle ne colle plus a l'equilibrage du jeu 2026.
                    var effHappiness = happiness;
                    if (this.happinessScore != null && isFinite(this.happinessScore)) {
                        effHappiness = this.population + this.happinessScore;
                    }
                    var effMax = (this._realMax != null && isFinite(this._realMax) && this._realMax > 0)
                        ? this._realMax : max;

                    var happinessDelta = effHappiness - this.population;
                    var currentPopulation = this.population +
                        happinessDelta * (1 - Math.pow(Math.E,
                                                       -(this.getTimeSinceResourceUpdate() / 50 / Constants.Time.MILLIS_PER_HOUR)));

                    var population = (effMax > 0) ? Math.min(currentPopulation, effMax) : currentPopulation;

                    var growth;
                    if (effMax > 0 && population >= effMax) {
                        growth = 0;                                 // plafond atteint
                    } else if (this._realGrowth != null && isFinite(this._realGrowth)) {
                        growth = this._realGrowth;                  // vraie croissance du jeu
                    } else {
                        growth = (effHappiness - population) / 50;  // repli : surplus/50
                    }

                    return {
                        population: population,
                        max: effMax,
                        happiness: effHappiness - population,
                        growth: growth,
                    };
                },
                getCorruption: function getCorruption() {
                    var palace = this.getBuildingByType(Constants.Buildings.GOVERNORS_RESIDENCE) ||
                        this.getBuildingByType(Constants.Buildings.PALACE);
                    var level = palace ? palace.getLevel() : 0;
                    var corruption = 1 - (level + 1) / getOwnCities().length;

                    var government = getCivilizationData().getGovernment();
                    if (government == Constants.Government.ARISTOCRACY ||
                        government == Constants.Government.OLIGARCHY) {
                        corruption += .03;
                    } else if (government == Constants.Government.NOMOCRACY) {
                        corruption -= .05;
                    } else if (government == Constants.Government.ANARCHY) {
                        corruption += .25;
                    }

                    return Math.min(Math.max(corruption, 0), 1);
                },
                getScientists: function getScientists() {
                    return this.scientists;
                },
                getResearch: function getResearch() {
                    if (this.researchPerHour != null) return this.researchPerHour;
                    var civData = getCivilizationData();
                    var multiplier = 1.0;

                    multiplier += civData.hasResearched(
                        IkaTools.Constants.Research.Science.PAPER) ? .02 : 0;
                    multiplier += civData.hasResearched(
                        IkaTools.Constants.Research.Science.INK) ? .04 : 0;
                    multiplier += civData.hasResearched(
                        IkaTools.Constants.Research.Science.MECHANICAL_PEN) ? .08 : 0;
                    multiplier += (civData.getResearchLevel(
                        IkaTools.Constants.Research.Science.SCIENTIFIC_FUTURE) || 0) * .02;
                    multiplier -= this.getCorruption();

                    return this.scientists * multiplier;
                },

                getResource: function getResource(resourceName) {
                    return this.resources[resourceName];
                },
                // v2.24 : capacité réelle lue dans le jeu si elle est encore valable
                // (aucun entrepôt/dépôt n'a changé de niveau depuis la lecture), sinon formule.
                getResourceCapacity: function getResourceCapacity() {
                    var cap = this._formulaCapacity();
                    var real = this._realCapacity;
                    if (real != null && isFinite(real) && real > 0 &&
                        this._realCapacitySig === _impWarehouseSig(this)) {
                        cap.maximum = real;
                        cap.real = true;
                    } else {
                        cap.real = false;
                    }
                    return cap;
                },
                _formulaCapacity: function getResourceMaximumCapacity() {
                    var total = 1500;
                    var safe = 100;

                    $.each(this.getBuildingsByType(Constants.Buildings.WAREHOUSE), function(i, building) {
                        total += Constants.BuildingData.warehouse.capacity[building.getLevel()]//8000 * building.getLevel();
                        safe += 480 * building.getLevel();
                    });
                    $.each(this.getBuildingsByType(Constants.Buildings.DUMP), function(i, building) {
                        total += Constants.BuildingData.dump.capacity[building.getLevel()]//8000 * building.getLevel();
                    });

                    var civilizationData = getCivilizationData();
                    if (civilizationData.isPremiumFeatureEnabled(
                        Constants.PremiumFeatures.DOUBLED_STORAGE_CAPACITY)) {
                        total *= 2;
                    }
                    if (civilizationData.isPremiumFeatureEnabled(
                        Constants.PremiumFeatures.DOUBLED_SAFE_CAPACITY)) {
                        safe *= 2;
                    }

                    return {
                        maximum: total,
                        safe: safe,
                    };
                },
                getIslandCoordinates: function getIslandCoordinates() {
                    return this.islandCoordinates;
                },
                getLoadingSpeed: function getLoadingSpeed() {
                    var speed = 10;
                    var ports = this.getBuildingsByType(Constants.Buildings.TRADING_PORT);
                    if (ports[0]) {
                        speed = Constants.BuildingData[Constants.Buildings.TRADING_PORT]
                            .loadingSpeed[ports[0].getLevel()];
                    }
                    if (ports[1]) {
                        speed += Constants.BuildingData[Constants.Buildings.TRADING_PORT]
                            .loadingSpeed[ports[1].getLevel()];
                    }
                    return speed / Constants.Time.SECONDS_PER_MINUTE;
                },
                getPriests: function getPriests() {
                    return this.priests;
                },
            });

            City.Resource = function City_Resource(city) {
                this._ikaToolsType = 'cityResource';
                this._setCity(city);
            }

            $.extend(City.Resource.prototype, {
                _setCity: function setCity(city) {
                    if (city) {
                        this.city = Utils.fixedFunction(city);
                    }
                },
                _update: function _update(current, production, consumption) {
                    var changed =
                        Math.abs(current - this.getCurrent()) > 3 ||
                        this.production != production ||
                        this.consumption != consumption;

                    this.current = current;
                    this.production = production;
                    this.consumption = consumption;

                    return changed;
                },
                _increment: function _increment(delta) {
                    this.current = Math.max(this.current + delta, 0);
                },
                getCurrent: function getCurrent() {
                    if (this.current === undefined) {
                        return undefined;
                    }

                    var current = this.current;
                    var now = View.gameTimeNow();
                    var max = this.city().getResourceCapacity().maximum;
                    var lastUpdate = this.city().getLastResourceUpdate();

                    if (this.production) {
                        current += this.production * (now - lastUpdate) /
                            Constants.Time.MILLIS_PER_SECOND;
                    }
                    if (this.consumption) {

                        // Wine use takes place on the hour.
                        var startHour = Math.floor(lastUpdate / Constants.Time.MILLIS_PER_HOUR);
                        var nowHour = Math.floor(now / Constants.Time.MILLIS_PER_HOUR);
                        current -=

                            this.consumption * Constants.Time.SECONDS_PER_HOUR * (nowHour - startHour);
                    }
                    return Math.max(0, Math.min(max, current));
                },

                /**
           * In milliseconds.
           */
                getTimeUntilFull: function getTimeUntilFull() {
                    var overallProduction = (this.production || 0) - (this.consumption || 0);
                    if (this.current === undefined) {
                        return Number.POSITIVE_INFINITY;
                    } else {
                        var current = this.getCurrent();
                        var max = this.city().getResourceCapacity().maximum;
                        var production = this.production;

                        if (overallProduction > 0) {
                            var secondsToNextHour = (Constants.Time.MILLIS_PER_HOUR -
                                                     (View.gameTimeNow() % Constants.Time.MILLIS_PER_HOUR)) /
                                Constants.Time.MILLIS_PER_SECOND;
                            var atNextHour = current + secondsToNextHour * production;

                            if (atNextHour >= max) {
                                return (max - current) / production * Constants.Time.MILLIS_PER_SECOND;
                            } else {
                                var hours = Math.floor(
                                    (max - atNextHour) / overallProduction / Constants.Time.SECONDS_PER_HOUR);
                                var atHours = atNextHour + overallProduction * hours * Constants.Time.SECONDS_PER_HOUR;
                                return (secondsToNextHour +
                                        hours * Constants.Time.SECONDS_PER_HOUR +
                                        (max - atHours) / production) * Constants.Time.MILLIS_PER_SECOND;
                            }
                        } else if (this.current && this.getCurrent() == max) {
                            // No production, but filled exactly to capacity
                            return 0;
                        } else {
                            return Number.POSITIVE_INFINITY;
                        }
                    }
                },

                /**
           * In milliseconds.
           */
                getTimeUntilEmpty: function getTimeUntilEmpty() {
                    if (this.current === undefined) {
                        return Number.POSITIVE_INFINITY;
                    } else if (this.consumption) {
                        if (this.production > this.consumption) {
                            // Could run out in first hour, but nobody is going to run their empire that
                            // way so it's not worth the effort of calculating.
                            return Number.POSITIVE_INFINITY;
                        } else {
                            // Wine use takes place on the hour.
                            var current = this.getCurrent();
                            var production = this.production || 0;

                            var secondsToNextHour = (Constants.Time.MILLIS_PER_HOUR -
                                                     (View.gameTimeNow() % Constants.Time.MILLIS_PER_HOUR)) /
                                Constants.Time.MILLIS_PER_SECOND;
                            // Compute to end of next hour
                            var atNextHour = current - this.consumption * Constants.Time.SECONDS_PER_HOUR +
                                production * secondsToNextHour;
                            if (atNextHour <= 0) {
                                return secondsToNextHour * Constants.Time.MILLIS_PER_SECOND;
                            } else {
                                var hourlyDiff =
                                    (this.consumption - production) * Constants.Time.SECONDS_PER_HOUR;
                                return Constants.Time.MILLIS_PER_SECOND * (secondsToNextHour +
                                                                           Math.ceil(atNextHour / hourlyDiff) * Constants.Time.SECONDS_PER_HOUR);
                            }
                        }
                    }
                    return Number.POSITIVE_INFINITY;
                },

                getCapacity: function getCapacity() {
                    return this.city().getResourceCapacity();
                },

                getProduction: function getProduction() {
                    return this.production;
                },

                getConsumption: function getConsumption() {
                    return this.consumption;
                },
            });


            // lignes 3785 TOOLS
            City.Building = function City_Building(city) {
                this._ikaToolsType = 'building';
                this._setCity(city);

                this.position = null;
                this.type = null;
                this.level = 0;
            }

            $.extend(City.Building.prototype, {
                _setCity: function setCity(city) {
                    if (city) {
                        this.city = Utils.fixedFunction(city);
                        this._scheduleUpgradeComplete();
                    }
                },
                _update: function _update(position, data) {
                    this.position = position;
                    var changed = false;

                    if (data.building.indexOf('buildingGround') >= 0) {
                        changed = !this.isEmpty();

                        this.type = '';
                        delete this.level;
                        delete this.completionTime;
                    } else {
                        var type = data.building.split(' ')[0];
                        var level = parseInt(data.level);
                        var isUpgrading = 'completed' in data;

                        changed = (type != this.getType() ||
                                   level != this.getLevel() ||
                                   isUpgrading != this.isUpgrading());

                        this.type = type;
                        this.level = level;
                        if (isUpgrading) {
                            var completionTime = parseInt(data.completed) * 1000;
                            if (this.completionTime != completionTime) {
                                this.completionTime = completionTime;
                                this._scheduleUpgradeComplete();
                            }
                        } else {
                            delete this.completionTime;
                        }
                    }

                    return changed;
                },
                _scheduleUpgradeComplete: function _scheduleUpgradeComplete() {
                    if (this.upgradeEvent) {
                        this.upgradeEvent();
                    }
                    if (this.completionTime) {
                        if (this.completionTime <= View.gameTimeNow()) {
                            this.level = this.level + 1;
                            delete this.completionTime;
                            raiseBuildingsChanged([{
                                city: this.city(),
                                building: this,
                                type: Constants.BuildingEventType.UPGRADE_COMPLETE,
                            }]);
                        } else {
                            this.upgradeEvent = buildingsChangedEvent().scheduleSend(
                                this.type + "->" + (this.level + 1),
                                // 0.5.0 still does a full page refresh if you're viewing the city when the
                                // building completes.  So we cheat a bit and send this event a few seconds
                                // before it actually takes place so it doesn't get lost as part of a page
                                // refresh that just sees it as a normal "info_refresh" event.
                                this.completionTime - View.gameTimeNow() + Constants.Time.SAFE_TIME_DELTA,
                                function() {
                                    this.level = this.level + 1;
                                    delete this.completionTime;
                                    empireData.saveAsync();
                                }.bind(this),
                                [{
                                    city: this.city(),
                                    building: this,
                                    type: Constants.BuildingEventType.UPGRADE_COMPLETE,
                                }]);
                        }
                    }
                },
                getPosition: function getPosition() {
                    return this.position;
                },
                isEmpty: function isEmpty() {
                    return !this.type;
                },
                getType: function getType() {
                    return this.type;
                },
                getLevel: function getLevel() {
                    return this.level;
                },
                isUpgrading: function isUpgrading() {
                    return (this.completionTime > View.gameTimeNow());
                },
                getRemainingUpgradeTime: function getRemainingUpgradeTime() {
                    var diff = this.completionTime - View.gameTimeNow();
                    return Math.max(diff, 0);
                },
                getCompletionTime: function getCompletionTime() {
                    return new Date(this.completionTime);
                },


                getUpgradeCosts: function getUpgradeCost() {

                    var city = this.city();
                    var civData = getCivilizationData();
                    var buildingCostData = Constants.BuildingData[this.getType()];

                    // v2.07 : préférer le VRAI coût capté depuis le jeu (panneau d'agrandissement).
                    // Valable uniquement si le bâtiment n'est pas en cours d'agrandissement et que
                    // le niveau capté correspond au niveau actuel (sinon le cache est périmé).
                    if (this.realUpgradeCost && !this.isUpgrading() &&
                        this.realUpgradeCost.forLevel === this.getLevel()) {
                        var rc = this.realUpgradeCost;
                        return {
                            wood: rc.wood, wine: rc.wine, marble: rc.marble,
                            glass: rc.glass, sulfur: rc.sulfur, time: rc.time, _real: true
                        };
                    }

                    // Patch Sécuriser getUpgradeCosts
                    // Si on n'a pas de données de coût (nouveau bâtiment inconnu), on renvoie 0 partout.
                    if (!buildingCostData) {
                        return {
                            wood: 0, wine: 0, marble: 0, glass: 0, sulfur: 0, time: 0, _real: false
                        };
                    }
                    // fin patch Sécuriser getUpgradeCosts

                    var level = this.getLevel() + (this.isUpgrading() ? 1 : 0);

                    var timeParams = buildingCostData.time;
                    var costs = {
                        wood: buildingCostData.wood[level] || 0,
                        wine: buildingCostData.wine[level] || 0,
                        marble: buildingCostData.marble[level] || 0,
                        glass: buildingCostData.glass[level] || 0,
                        sulfur: buildingCostData.sulfur[level] || 0,
                        time: Math.round(timeParams.a / timeParams.b *
                                         Math.pow(timeParams.c, level+1) - timeParams.d) * 1000,
                    };

                    var multiplier = 1.0;
                    multiplier -= civData.hasResearched(Constants.Research.Economy.PULLEY) ? .02 : 0;
                    multiplier -= civData.hasResearched(Constants.Research.Economy.GEOMETRY) ? .04 : 0;
                    multiplier -= civData.hasResearched(Constants.Research.Economy.SPIRIT_LEVEL) ? .08 : 0;

                    var carpenter = city.getBuildingByType(Constants.Buildings.CARPENTER);
                    var winePress = city.getBuildingByType(Constants.Buildings.WINE_PRESS);
                    var architect = city.getBuildingByType(Constants.Buildings.ARCHITECT);
                    var optician = city.getBuildingByType(Constants.Buildings.OPTICIAN);
                    var fireworker = city.getBuildingByType(Constants.Buildings.FIREWORK_TEST_AREA);


                    return {
                        wood: costs.wood * Math.max(0, (multiplier - (carpenter ? carpenter.getLevel() / 100 : 0))),
                        wine: costs.wine * Math.max(0, (multiplier - (winePress ? winePress.getLevel() / 100 : 0))),
                        marble: costs.marble * Math.max(0, (multiplier - (architect ? architect.getLevel() / 100 : 0))),
                        glass: costs.glass * Math.max(0, (multiplier - (optician ? optician.getLevel() / 100 : 0))),
                        sulfur: costs.sulfur * Math.max(0, (multiplier - (fireworker ? fireworker.getLevel() / 100 : 0))),
                        time: costs.time,
                        _real: false,
                    };
                },

                // Patch Rendre isMaxLevel safe

                isMaxLevel: function isMaxLevel() {
                    var type = this.getType();
                    var data = type && Constants.BuildingData[type];

                    // Si Imperator ne connaît pas ce bâtiment (ex: nouveau type, case vide, etc.),
                    // on considère juste qu'il n'est pas au niveau max.
                    // v2.20 : les tables écrivent "maxlevel" (minuscules) ; on accepte les deux.
                    var maxLevel = data ? (data.maxlevel != null ? data.maxlevel : data.maxLevel) : undefined;
                    if (!data || maxLevel == null || !isFinite(maxLevel)) {
                        return false;
                    }
                    // Le jeu a proposé un agrandissement pour ce niveau : ce n'est pas le max,
                    // même si notre table est en retard sur le jeu.
                    if (this.realUpgradeCost && this.realUpgradeCost.forLevel === this.getLevel() && !this.isUpgrading()) {
                        return false;
                    }

                    return (this.getLevel() + (this.isUpgrading() ? 1 : 0)) >= maxLevel;
                },


                // fin Patch Rendre isMaxLevel safe

            });

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
                        if (isFinite(this.transportTime)) {
                            this.completionTime += this.transportTime;
                        } else {
                            this._etaUnknown = true;
                        }
                        this._startTimer();
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
                    if (this.stage == Constants.Movements.Stage.LOADING) {
                        time += this.transportTime;
                    }
                    return time;
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

            var empireData = new Data.Value(
                'empireData',

                {
                    cities: {},
                    cityOrder: [],
                    civilizationData: new CivilizationData(),
                },
                {
                    reviver: function empireDataReviver(key, value) {
                        if (value && value._ikaToolsType) {
                            var obj;
                            switch(value._ikaToolsType) {
                                case 'city': obj = new City(); break;
                                case 'building': obj = new City.Building; break;
                                case 'cityResource': obj = new City.Resource(); break;
                                case 'military': obj = new Military(); break;
                                case 'militaryUnits': obj = new MilitaryUnits(); break;
                                case 'trainingBatch': obj = new TrainingBatch(); break;
                                case 'civilizationData': obj = new CivilizationData(); break;
                                case 'movement': obj = new Movement(); break;
                            }
                            $.extend(obj, value);
                            if (obj._postLoad) {
                                obj._postLoad();
                            }
                            return obj;
                        }
                        return value;
                    },
                    version: 28,
                    loadCallback: function empireDataLoaded() {
                        getCivilizationData()._startMovementTimers();
                    },
                });

            function raiseCivilizationDataChanged(changes) {
                if (changes.length) {
                    civilizationDataChangedEvent().send(changes);
                }
            }

            var civilizationDataChangedEvent = Utils.thunk(function() {
                return new Utils.EventDispatcher();
            });

            function registerCivilizationDataChangedHandler(callback) {
                return civilizationDataChangedEvent().addListener(callback);
            }

            function raiseMovementsChanged(changes) {
                if (changes.length) {
                    movementsChangedEvent().send(changes);
                }
            }

            var movementsChangedEvent = Utils.thunk(function() {
                return new Utils.EventDispatcher();
            });

            function registerMovementsChangedHandler(callback) {
                return movementsChangedEvent().addListener(callback);
            }

            function raiseResourcesChanged(changes) {
                if (changes.length) {
                    resourcesChangedEvent().send(changes);
                }
            }

            var resourcesChangedEvent = Utils.thunk(function() {
                return new Utils.EventDispatcher();
            });

            function registerResourcesChangedHandler(callback) {
                return resourcesChangedEvent().addListener(callback);
            }

            var buildingsChangedEvent = Utils.thunk(function() {
                var dispatcher = new Utils.EventDispatcher();
                return dispatcher;
            });

            function raiseBuildingsChanged(changes) {
                if (changes.length) {
                    buildingsChangedEvent().send(changes);
                }
            }

            function registerBuildingsChangedHandler(callback) {
                return buildingsChangedEvent().addListener(callback);
            }

            var militaryChangedEvent = Utils.thunk(function() {
                var dispatcher = new Utils.EventDispatcher();
                return dispatcher;
            });

            function raiseMilitaryChanged(changes) {
                if (changes.length) {
                    militaryChangedEvent().send(changes);
                }
            }

            function registerMilitaryChangedHandler(callback) {
                return militaryChangedEvent().addListener(callback);
            };

            var TRADE_GOOD_LOOKUP = {
                "1": Constants.Resources.WINE,
                "2": Constants.Resources.MARBLE,
                "3": Constants.Resources.GLASS,
                "4": Constants.Resources.SULFUR,
            };

            // Gold event
            var goldChangedEvent = Utils.thunk(function() { return new Utils.EventDispatcher(); });
            function raiseGoldChanged() { goldChangedEvent().send(); }
            function registerGoldChangedHandler(callback) { return goldChangedEvent().addListener(callback); }

            // v2.12 : Sanctuaire divin (affectations / bienveillances) mis à jour
            var shrineChangedEvent = Utils.thunk(function() { return new Utils.EventDispatcher(); });
            function raiseShrineChanged() { shrineChangedEvent().send(); }
            function registerShrineChangedHandler(callback) { return shrineChangedEvent().addListener(callback); }


            function getCity(id) {
                return empireData.get().cities[id];
            };

            var coordsRegex = /\[(\d+):(\d+)\]/;
            function parseCoordinates(coords) {
                var match = coords.match(coordsRegex);
                return [parseInt(match[1]), parseInt(match[2])];
            }

            function processTransportForm(form) {
                var city = View.getCurrentCity();

                var transports = parseInt($('#transporterCount').val()) || 0;
                var resources = {};
                resources[Constants.Resources.WOOD] =
                    parseInt($('#textfield_wood').val()) || 0;
                resources[Constants.Resources.WINE] =
                    parseInt($('#textfield_wine').val()) || 0;
                resources[Constants.Resources.MARBLE] =
                    parseInt($('#textfield_marble').val()) || 0;
                resources[Constants.Resources.GLASS] =
                    parseInt($('#textfield_glass').val()) || 0;
                resources[Constants.Resources.SULFUR] =
                    parseInt($('#textfield_sulfur').val()) || 0;
                if ($('#createColony').length) {
                    resources[Constants.Resources.WOOD] += 1250;
                }

                var destinationCityId = parseInt($(form.elements['destinationCityId']).val());

                var totalResources =
                    resources[Constants.Resources.WOOD] +
                    resources[Constants.Resources.WINE] +
                    resources[Constants.Resources.MARBLE] +
                    resources[Constants.Resources.GLASS] +
                    resources[Constants.Resources.SULFUR];

                var loadingCompletion = View.gameTimeNow() +
                    (totalResources / city.getLoadingSpeed() * Constants.Time.MILLIS_PER_SECOND);

                var movement = new Movement(
                    -(new Date().getTime()),
                    'own',
                    loadingCompletion, //TODO: multiple loads from same town (if own) stack
                    Constants.Movements.Mission.TRANSPORT,
                    Constants.Movements.Stage.LOADING,
                    city.getId(),
                    destinationCityId,
                    transports,
                    new MilitaryUnits(),
                    resources
                    // TODO: transport time for towns other than one's that are tracked
                );

                View.registerNextIkariamAjaxRequestCallback(function saveTransportData(response) {
                    Utils.iterateIkariamAjaxResponse(response,
                                                     function lookForSuccessFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                            data[0].type == 10) {
                            var changes = [];
                            getCivilizationData()._updateMovement(movement, changes);
                            raiseMovementsChanged(changes);
                        }
                    });
                });
            }

            function coordinatesEqual(coordinates1, coordinates2) {
                if (!coordinates1 || !coordinates2) {
                    return false;
                }
                return coordinates1[0] == coordinates2[0] &&
                    coordinates1[1] == coordinates2[1];
            }

            function processDeploymentForm(form) {
                var city = View.getCurrentCity();

                var transports = parseInt($('#transporterCount').html()) || 0;
                var mission = $(form.elements['function']).val() == 'deployArmy' ?
                    Constants.Movements.Mission.DEPLOY_ARMY : Constants.Movements.Mission.DEPLOY_NAVY;
                var destinationCityId = parseInt($(form.elements['destinationCityId']).val());
                var destinationCity = getCity(destinationCityId);

                var units = new MilitaryUnits();

                $.each(Constants.UnitIds, function countDeployingUnits(id, type) {
                    var elementId;
                    if (Constants.UnitData[type].isArmy) {
                        elementId = '#cargo_army_' + id;
                    } else {
                        elementId = '#cargo_fleet_' + id;
                    }
                    units._setCount(type, parseInt($(elementId).val()) || 0);
                });

                var cargoSize = units.getCargoSize();
                var loadingCompletion = new Date().getTime() +
                    (units.getCargoSize() / city.getLoadingSpeed() * Constants.Time.MILLIS_PER_SECOND);

                if (destinationCity &&
                    coordinatesEqual(destinationCity.getIslandCoordinates(),
                                     city.getIslandCoordinates())) {
                    loadingCompletion = new Date().getTime();
                }

                var movement = new Movement(
                    -(new Date().getTime()),
                    'own',
                    loadingCompletion, //TODO: multiple loads from same town (if own) stack
                    mission,
                    Constants.Movements.Stage.LOADING,
                    city.getId(),
                    destinationCityId,
                    transports,
                    units,
                    {}
                    // TODO: transport time for towns other than one's that are tracked
                );

                View.registerNextIkariamAjaxRequestCallback(function saveDeploymentData(response) {
                    Utils.iterateIkariamAjaxResponse(response,
                                                     function lookForSuccessFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                            data[0].type == 10) {
                            var military = city.getMilitary();
                            military._decrement(units);
                            raiseMilitaryChanged([{
                                military: military,
                                city: city,
                                type: 'movement_started',
                            }]);

                            var changes = [];
                            getCivilizationData()._updateMovement(movement, changes);
                            raiseMovementsChanged(changes);
                        }
                    });
                });
            }

            function processPlunderForm(form) {
                var city = View.getCurrentCity();
                var transports = parseInt($('#transporterCount').html()) || 0;
                var destinationCityId = parseInt($(form.elements['destinationCityId']).val());
                var destinationCity = getCity(destinationCityId);

                var units = new MilitaryUnits();
                $.each(Constants.UnitIds, function countDeployingUnits(id, type) {
                    units._setCount(type, parseInt($('#cargo_army_' + id).val()) || 0);
                });

                var cargoSize = units.getCargoSize();
                var loadingCompletion = new Date().getTime() +
                    (units.getCargoSize() / city.getLoadingSpeed() * Constants.Time.MILLIS_PER_SECOND);
                if (destinationCity &&
                    coordinatesEqual(destinationCity.getIslandCoordinates(),
                                     city.getIslandCoordinates())) {
                    loadingCompletion = new Date().getTime();
                }

                var movement = new Movement(
                    -(new Date().getTime()),
                    'own',
                    loadingCompletion, //TODO: multiple loads from same town (if own) stack
                    Constants.Movements.Mission.PLUNDER,
                    Constants.Movements.Stage.LOADING,
                    city.getId(),
                    destinationCityId,
                    transports,
                    units,
                    {}
                    // TODO: transport time for towns other than one's that are tracked
                );

                View.registerNextIkariamAjaxRequestCallback(function savePlunderData(response) {
                    Utils.iterateIkariamAjaxResponse(response,
                                                     function lookForSuccessFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                            data[0].type == 10) {
                            var military = city.getMilitary();
                            military._decrement(units);
                            raiseMilitaryChanged([{
                                military: military,
                                city: city,
                                type: 'movement_started',
                            }]);

                            var changes = [];
                            getCivilizationData()._updateMovement(movement, changes);
                            raiseMovementsChanged(changes);
                        }
                    });
                });
            }


            // ============================================================
            // v2.17 : « Troupes dans la ville » (view=cityMilitary)
            // Structure du jeu : #tabUnits / #tabShips > 1er .contentBox01h (Garnison / Navires)
            //   > table.militaryList (plusieurs tables de 7-8 colonnes)
            //     tr.title_img_row : <th></th> puis <th><div class="army s303"> (ou "fleet s211")
            //     tr.count         : <td>joueur</td> puis un <td> par unité, dans le même ordre
            // L'unité est identifiée par son id de jeu (s303 -> 303 -> phalanx), donc
            // indépendamment de la langue et des noms d'images (désormais hachés).
            // ============================================================
            function _impReadCityMilitary($root) {
                var res = { counts: {}, nb: 0, unknown: [], army: false, navy: false };
                $.each(['#tabUnits', '#tabShips'], function(t, tabSel) {
                    var $tab = $root.find(tabSel).first();
                    if (!$tab.length && $root.is(tabSel)) $tab = $root;
                    if (!$tab.length) return;
                    // 1er bloc uniquement : Garnison / Navires (pas Défenseur, Occupant...)
                    var $box = $tab.children('.contentBox01h').first();
                    $box.find('table.militaryList').each(function() {
                        var $heads = $(this).find('tr.title_img_row').first().children('th');
                        var $cells = $(this).find('tr.count').first().children('td');
                        $heads.each(function(i) {
                            if (i === 0) return; // colonne du nom du joueur
                            var $u = $(this).find('.army, .fleet').first();
                            var m = String($u.attr('class') || '').match(/\bs(\d+)\b/);
                            if (!m) return;
                            var type = Constants.UnitIds[parseInt(m[1], 10)];
                            if (!type || !Constants.UnitData[type]) {
                                res.unknown.push('s' + m[1] + ' (' + String($u.text()).trim() + ')');
                                return;
                            }
                            var n = _impInt($cells.eq(i).text());
                            if (n === null) return;
                            res.counts[type] = n;
                            res.nb++;
                            if (Constants.UnitData[type].isArmy) res.army = true; else res.navy = true;
                        });
                    });
                });
                return res;
            }

            function processCityMilitaryView(data, viewHtmlText) {
                // Ville concernée : celle de la page (lien premiumDummy?cityId=), sinon la ville active
                function pageCityId($root) {
                    var href = $root.find('a[href*="cityId="]').filter(function() {
                        return /premiumDummy/.test($(this).attr('href') || '');
                    }).first().attr('href') || '';
                    var m = href.match(/cityId=(\d+)/);
                    return m ? parseInt(m[1], 10) : null;
                }
                var current = View.getCurrentCity();
                var lastSig = null;

                function pass(isLast) {
                    try {
                        var $root = $('#cityMilitary');
                        var r = $root.length ? _impReadCityMilitary($root) : { nb: 0 };
                        if (!r.nb && viewHtmlText) {
                            $root = $('<div>').append($.parseHTML(String(viewHtmlText)));
                            r = _impReadCityMilitary($root);
                        }
                        if (!r.nb) {
                            if (isLast) console.warn('[Imperator] Troupes dans la ville : aucun effectif lu');
                            return;
                        }
                        var cid = pageCityId($root);
                        var c = (cid && getCity(cid)) || current;
                        if (!c) return;

                        var sig = c.getId() + '|' + JSON.stringify(r.counts);
                        if (sig === lastSig) return; // 2e passe identique
                        lastSig = sig;

                        var military = c.getMilitary();
                        $.each(r.counts, function(type, n) { military._updatePresent(type, n); });
                        military._markPresentUpdated(r.army, r.navy);

                        raiseMilitaryChanged([{ city: c, military: military, type: 'data_updated' }]);
                        empireData.save();
                        console.log('[Imperator] Troupes dans la ville lues (' + c.getName() + ') :', r.counts);
                        if (r.unknown.length && isLast) {
                            console.log('[Imperator] Unités non gérées par le script, ignorées :', r.unknown.join(', '));
                        }
                    } catch (e) {
                        console.warn('[Imperator] Lecture Troupes dans la ville a échoué', e);
                    }
                }
                setTimeout(function() { pass(false); }, 700);
                setTimeout(function() { pass(true); }, 2000);
            }

            function processRelatedCitiesView(data) {
                var city = View.getCurrentCity();
                var military = city.getMilitary();
                military._clear();

                var changed = false;

                var info = $('#relatedCities .contentBox01h:eq(0)');

                var whitespace = /\s+/;

                info.find('.troops .armybutton').each(function(i, element) {
                    var type = element.className.split(whitespace)[1];
                    changed |= military._updatePresent(type, parseInt(element.innerHTML));
                });
                info.find('.troops .fleetbutton').each(function(i, element) {
                    var type = element.className.split(whitespace)[1];
                    changed |= military._updatePresent(type, parseInt(element.innerHTML));
                });

                military._markPresentUpdated();

                if (changed) {
                    raiseMilitaryChanged([{
                        city: city,
                        military: military,
                        type: 'data_updated',
                    }]);
                }
            }

            function parseMilitaryUnitsFromPending(container) {
                var idRegex = /\d+/;
                var units = new MilitaryUnits();

                container.children('.army_wrapper').each(function(index, unitNode) {
                    unitNode = $(unitNode);
                    var type = Constants.UnitIds[
                        parseInt(unitNode.find('.army').attr('class').match(idRegex)[0])];
                    var count = parseInt(unitNode.find('.unitcounttextlabel').html());
                    units._setCount(type, count);
                });
                return units;
            }


                        // v2.15 : ne plante plus si le compte à rebours est introuvable (renvoie null)
            function parseTrainingBatches(viewHtmlText, type, buildingLevel) {
                var trainingBatches = [];
                var constructionList = $('#unitConstructionList');
                if (!constructionList.length) return trainingBatches;
                var m = String(viewHtmlText || '').match(/showUnitCountdown.'buildCountDown', 'buildProgress', (\d+)/);
                if (!m) {
                    console.warn('[Imperator] File de formation : compte à rebours introuvable, file conservée');
                    return null;
                }
                var completionTime = parseInt(m[1], 10) * 1000;
                trainingBatches.push(new TrainingBatch(type, completionTime,
                    parseMilitaryUnitsFromPending(constructionList)));
                constructionList.children('.constructionBlock').each(function() {
                    var units = parseMilitaryUnitsFromPending($(this));
                    completionTime += computeTrainingTime(buildingLevel, units);
                    trainingBatches.push(new TrainingBatch(type, completionTime, units));
                });
                return trainingBatches;
            }

            function computeTrainingTime(barracksLevel, units) {
                var time = 0;
                $.each(units.getCounts(), function(type, count) {
                    var data = Constants.UnitData[type];
                    time += count * Math.pow(0.95, barracksLevel - data.minimumBuildingLevelToBuild) *
                        data.baseBuildTime;
                });
                return time * Constants.Time.MILLIS_PER_SECOND;
            }

            // ============================================================
            // v2.15 : Caserne / Chantier naval — lecture fiable des effectifs
            // ============================================================
            var _IMP_BARRACKS_ORDER = [
                Constants.Military.HOPLITE, Constants.Military.STEAM_GIANT, Constants.Military.SPEARMAN,
                Constants.Military.SWORDSMAN, Constants.Military.SLINGER, Constants.Military.ARCHER,
                Constants.Military.GUNNER, Constants.Military.BATTERING_RAM, Constants.Military.CATAPULT,
                Constants.Military.MORTAR, Constants.Military.GYROCOPTER, Constants.Military.BALLOON_BOMBADIER,
                Constants.Military.COOK, Constants.Military.DOCTOR ];
            var _IMP_SHIPYARD_ORDER = [
                Constants.Military.FLAME_THROWER, Constants.Military.STEAM_RAM, Constants.Military.RAM_SHIP,
                Constants.Military.BALLISTA_SHIP, Constants.Military.CATAPULT_SHIP, Constants.Military.MORTAR_SHIP, // v2.24 : ordre du jeu
                Constants.Military.ROCKET_SHIP, Constants.Military.SUBMARINE, Constants.Military.PADDLE_SPEED_SHIP,
                Constants.Military.BALLOON_CARRIER, Constants.Military.TENDER ];

            // "1 250", "1.250", "1,250" -> 1250 ; illisible -> null
            function _impInt(txt) {
                var n = parseInt(String(txt == null ? '' : txt).replace(/[^\d]/g, ''), 10);
                return isFinite(n) ? n : null;
            }

            // <li class="unit phalanx"> ... <div id="js_barracksUnitUnitsAvailable1">50</div>
            function _impReadUnitList($root) {
                var res = { counts: {}, nb: 0 };
                $root.find('li.unit').each(function() {
                    var cls = String(this.className || '').split(/\s+/), type = null;
                    for (var i = 0; i < cls.length; i++) {
                        if (cls[i] !== 'unit' && Constants.UnitData[cls[i]]) { type = cls[i]; break; }
                    }
                    if (!type) return;
                    var $n = $(this).find('[id*="UnitUnitsAvailable"]').first();
                    if (!$n.length) $n = $(this).find('.unitinfo .scroll_view').first();
                    var n = _impInt($n.text());
                    if (n !== null) { res.counts[type] = n; res.nb++; }
                });
                return res;
            }

            function _impProcessTrainingBuilding(isArmy, viewHtmlText, data) {
                var city = View.getCurrentCity();
                if (!city) return;
                var cityId = city.getId();
                var label = isArmy ? 'Caserne' : 'Chantier naval';
                var lastSig = null;

                function pass(isLast) {
                    try {
                        var c = getCity(cityId);
                        if (!c) return;
                        var military = c.getMilitary();

                        // 1) page affichée (après rendu par le jeu)
                        var r = _impReadUnitList($(isArmy ? '#barracks' : '#shipyard'));
                        // 2) repli : HTML de la réponse serveur (sans exécuter ses scripts)
                        if (!r.nb && viewHtmlText) {
                            r = _impReadUnitList($('<div>').append($.parseHTML(String(viewHtmlText))));
                        }
                        // 3) repli : ancienne lecture par position (templateData)
                        if (!r.nb && data) {
                            $.each(isArmy ? _IMP_BARRACKS_ORDER : _IMP_SHIPYARD_ORDER, function(i, type) {
                                var e = data['js_barracksUnitUnitsAvailable' + (i + 1)];
                                var n = e ? _impInt(e.text) : null;
                                if (n !== null) { r.counts[type] = n; r.nb++; }
                            });
                        }
                        if (!r.nb) {
                            if (isLast) console.warn('[Imperator] ' + label + ' : aucun effectif lu (' + c.getName() + ')');
                            return;
                        }

                        var sig = JSON.stringify(r.counts) + '|' + $('#unitConstructionList').length;
                        if (sig === lastSig) return; // 2e passe identique : rien à refaire
                        lastSig = sig;

                        $.each(r.counts, function(type, n) { military._updatePresent(type, n); });
                        military._markPresentUpdated(isArmy, !isArmy);

                        try {
                            var b = c.getBuildingByType(isArmy ? Constants.Buildings.BARRACKS : Constants.Buildings.SHIPYARD);
                            var batches = parseTrainingBatches(viewHtmlText,
                                isArmy ? Constants.Military.ARMY : Constants.Military.NAVY, b ? b.getLevel() : 0);
                            if (batches !== null) {
                                if (isArmy) military._setArmyTrainingBatches(batches);
                                else military._setNavyTrainingBatches(batches);
                            }
                        } catch (eT) {
                            console.warn('[Imperator] ' + label + ' : file de formation ignorée', eT);
                        }

                        raiseMilitaryChanged([{ city: c, military: military, type: 'data_updated' }]);
                        empireData.save();
                        console.log('[Imperator] ' + label + ' lu (' + c.getName() + ') :', r.counts);
                    } catch (e) {
                        console.warn('[Imperator] Lecture ' + label + ' a échoué', e);
                    }
                }
                // Comme pour le Sanctuaire : deux passes, le temps que le jeu remplisse la page
                setTimeout(function() { pass(false); }, 700);
                setTimeout(function() { pass(true); }, 2000);
            }

            function processBarracksView(viewHtmlText, data) {
                _impProcessTrainingBuilding(true, viewHtmlText, data);
            }

            function processShipyardView(viewHtmlText, data) {
                _impProcessTrainingBuilding(false, viewHtmlText, data);
            }


            function processAcademyView(data) {
                var changes = [];
                var city = View.getCurrentCity();
                city._updateScientists(
                    parseInt(data['js_academy_research_tooltip_basic_production'].text),
                    changes);
                var researchEl = $('#valueResearch');
                if (researchEl.length) {
                    var total = parseInt(researchEl.text());
                    if (!isNaN(total)) city._updateResearchPerHour(total, changes);
                }
                raiseResourcesChanged(changes);
            }

            function processSetScientistsForm(form) {
                var scientists = parseInt($('#inputScientists').val());

                View.registerNextIkariamAjaxRequestCallback(function saveScientstsData(response) {
                    Utils.iterateIkariamAjaxResponse(response,
                                                     function lookForSuccessFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                            data[0].type == 10) {
                            var changes = [];
                            View.getCurrentCity()._updateScientists(scientists, changes);
                            raiseResourcesChanged(changes);
                        }
                    });
                });
            }

            function processPalaceView(data) {
                var changes = [];
                getCivilizationData()._updateGovernment(
                    $('.government_pic img').attr('src').slice(16, -8), changes);
                raiseCivilizationDataChanged(changes);
            }

            
            // v2.18 : lecture des biens culturels de TOUTES les villes, déclenchée par
            // l'apparition du formulaire de répartition (indépendant du nom de vue).
            (function _impWatchCulturalGoods() {
                function readAll(attempt) {
                    attempt = attempt || 0;
                    var inputs = $('#moveCulturalGoods input[id^="textfield_city_"]');
                    if (!inputs.length) {
                        if (attempt < 10) setTimeout(function () { readAll(attempt + 1); }, 300);
                        return;
                    }
                    try {
                        var changes = [];
                        var count = 0;
                        inputs.each(function (index, item) {
                            item = $(item);
                            var idMatch = /textfield_city_(\d+)/.exec(item.attr('id') || '');
                            if (!idMatch) return;
                            var city = getCity(parseInt(idMatch[1], 10));
                            var raw = String(item.val() == null ? '' : item.val()).replace(/[^\d]/g, '');
                            if (!city || raw === '') return;
                            var v = parseInt(raw, 10);
                            if (isFinite(v)) {
                                city._updateCulturalGoods(v, changes);
                                count++;
                            }
                        });
                        console.log('[Imperator] biens culturels lus pour ' + count + ' ville(s)');
                        if (changes.length) {
                            raiseResourcesChanged(changes);
                            empireData.saveAsync();
                        }
                    } catch (e) {
                        console.warn('[Imperator] lecture biens culturels ignorée', e);
                    }
                }

                function start() {
                    var lastForm = null;
                    var timer = null;
                    new MutationObserver(function () {
                        var form = document.getElementById('moveCulturalGoods');
                        if (!form || form === lastForm) return;
                        lastForm = form;
                        clearTimeout(timer);
                        timer = setTimeout(function () { readAll(); }, 300);
                    }).observe(document.body, { childList: true, subtree: true });
                }
                if (document.body) start();
                else document.addEventListener('DOMContentLoaded', start);
            })();



            function processTownHallView(data) {
                var changes = [];
                var city = View.getCurrentCity();

                // --- Humeur réelle depuis l’interface Ikariam ---
                try {
                    // Selon les versions Ikariam, l’ID peut varier un peu, adapte au besoin
                    var moodImg = document.querySelector("#js_TownHallSatisfactionOverviewMood img, #js_townHallMood img");
                    if (moodImg && moodImg.src) {
                        var src = moodImg.src;
                        var mood = "neutral";

                        if (src.indexOf("happy") >= 0 || src.indexOf("smiley_happy") >= 0) {
                            mood = "happy";
                        } else if (src.indexOf("ecstatic") >= 0) {
                            mood = "ecstatic";
                        } else if (src.indexOf("sad") >= 0) {
                            mood = "sad";
                        } else if (src.indexOf("angry") >= 0 || src.indexOf("outraged") >= 0) {
                            mood = "outraged";
                        } else if (src.indexOf("neutral") >= 0) {
                            mood = "neutral";
                        }

                        // On stocke l’humeur directement sur l’objet ville
                        city._imperatorMood = mood;
                    }
                } catch (e) {
                    console.warn("Imperator patch mood: erreur lecture humeur TownHall", e);
                }

               // v2.18 : lecture robuste des bonus (séparateur de milliers FR + table non linéaire)
                function _impReadTH(id) {
                    var txt = (data[id] && data[id].text != null) ? data[id].text : $('#' + id).text();
                    return _impNumFR(txt);   // déclaration de fonction -> hoistée, utilisable ici
                }
                function _impTavernLevelFromBonus(bonus) {
                    if (!isFinite(bonus) || bonus <= 0) return 0;
                    var tbl = Constants.BuildingData[Constants.Buildings.TAVERN].maxBonus;
                    var best = 0, bestDiff = Infinity;
                    for (var i = 0; i < tbl.length; i++) {
                        var d = Math.abs(tbl[i] - bonus);
                        if (d < bestDiff) { bestDiff = d; best = i + 1; }  // tbl[0] = niveau 1
                    }
                    return best;
                }
                try {
                    var _cgBonus = _impReadTH('js_TownHallSatisfactionOverviewCultureBoniTreatyBonusValue');
                    if (isFinite(_cgBonus)) city._updateCulturalGoods(Math.round(_cgBonus / 50), changes);
                } catch (e) {}
                try {
                    var _twBonus = _impReadTH('js_TownHallSatisfactionOverviewWineBoniServeBonusValue');
                    if (isFinite(_twBonus)) city._updateTavernWineLevel(_impTavernLevelFromBonus(_twBonus), changes);
                } catch (e) {}

                // v2.11 : lecture des VRAIES valeurs du jeu. Nombres FR -> separateur de
                // milliers = espace insecable (\u00a0) : parseInt s'arreterait au 1er espace
                // ("5 340" -> 5). On nettoie les espaces (normal/insecable/fin) et la virgule.
                function _impNumFR(txt) {
                    if (txt == null) return NaN;
                    var str = String(txt).replace(/[\s\u00a0\u202f\u2009]/g, '').replace(/\+/g, '').replace(',', '.');
                    var n = parseFloat(str);
                    return isFinite(n) ? n : NaN;
                }

                // Satisfaction libre reelle (surplus) -> pilote la croissance
                var _sat = _impNumFR($('#js_TownHallHappinessLargeValue').text());
                if (isFinite(_sat)) city._updateHappinessScore(_sat, changes);

                // Population reelle (l'onglet Hotel de Ville l'expose ; d'autres vues renvoient 0)
                try {
                    var _rp = _impNumFR($('#js_TownHallOccupiedSpace').text());
                    if (isFinite(_rp) && _rp > 0) city._updatePopulation(_rp, changes);
                } catch (e) {}

                // Plafond de logement reel
                try {
                    var _rm = _impNumFR($('#js_TownHallMaxInhabitants').text());
                    if (isFinite(_rm) && _rm > 0) city._realMax = _rm;
                } catch (e) {}

                // Croissance/heure reelle affichee par le jeu
                try {
                    var _rg = _impNumFR($('#js_TownHallPopulationGrowthValue').text());
                    if (isFinite(_rg)) city._realGrowth = _rg;
                } catch (e) {}

                raiseResourcesChanged(changes);
            }


            function processTempleView(data) {
                var changes = [];
                View.getCurrentCity()._updatePriests(
                    parseInt(data['js_TempleSlider'].slider.ini_value), changes);
                raiseResourcesChanged(changes);
            }

            function processResearchAdvisorView(data) {
                var civData = getCivilizationData();
                var idRegex = /researchId=([0-9]+)/i
                var levelRegex = /\((\d+)\)/;

                var researches =
                    JSON.parse(data['new_js_params'] || data['load_js'].params).currResearchType;

                var changes = [];
                $.each(researches, function (name, researchData) {
                    var id = parseInt(idRegex.exec(researchData.aHref)[1]);
                    var levelMatch = levelRegex.exec(name);
                    var level = levelMatch
                    ? parseInt(levelMatch[1]) - 1
                    : (researchData.liClass == 'explored' ? 1 : 0);

                    civData._updateResearch(id, level, changes);
                });
                raiseCivilizationDataChanged(changes);
            }

            // Parser le Bilan depuis le DOM live (fallback si AJAX non intercepté)
            var _bilanLastParsed = 0;
            function parseBilanDomIfVisible() {
                try {
                    // Anti-double-parse : attendre 3s minimum entre deux parsings
                    if (Date.now() - _bilanLastParsed < 3000) return;
                    // Chercher td.city dans le DOM (spécifique au Bilan)
                    var $cityCells = $('td.city');
                    if (!$cityCells.length) return;
                    // Vérifier que le conteneur ressemble au Bilan
                    var $container = $cityCells.first().closest('table').closest('div, section, article');
                    if (!$container.length) $container = $cityCells.first().closest('table').parent();
                    var html = $container.length ? $container[0].outerHTML : '';
                    if (!html) return;
                    if (html.indexOf('Montant') < 0 && html.indexOf('Dieux') < 0 && html.indexOf('Pluton') < 0) return;
                    _bilanLastParsed = Date.now();
                    processFinancesView(null, html);
                } catch(e) {}
            }

            // Hook createTemplateView dans le bon scope (parseBilanDomIfVisible accessible ici)
            (function hookCreateTemplateView() {
                try {
                    var orig = unsafeWindow.ikariam.createTemplateView;
                    if (orig && !orig.__imperatorHooked) {
                        unsafeWindow.ikariam.createTemplateView = function() {
                            var result = orig.apply(this, arguments);
                            setTimeout(parseBilanDomIfVisible, 300);
                            return result;
                        };
                        unsafeWindow.ikariam.createTemplateView.__imperatorHooked = true;
                    }
                } catch(e) {}
            })();

            function processFinancesView(data, viewHtmlStr) {
                var cities = getOwnCities();
                var scientistCost = 6;
                if (getCivilizationData().hasResearched(Constants.Research.Science.LETTER_CHUTE)) {
                    scientistCost = 3;
                }
                var changes = [];
                // Le parsing scientifiques est maintenant intégré dans parseBilanFromHtml

                // Parser le Bilan depuis son HTML (fiable, sans dépendance DOM live)
                if (viewHtmlStr) {
                    setTimeout(function parseBilanFromHtml() {
                        try {
                            var $b = $('<div>').html(viewHtmlStr);
                            var goldUpd = { incomeUpdated: Date.now() };
                            var found = 0;

                            // Helper: lire la valeur numérique d'une cellule
                            // - supprime les div.tooltip (valeurs décimales)
                            // - gère &nbsp; (\u00a0) comme séparateur de milliers
                            // - lit le <span> pour les valeurs négatives
                            function cellVal($td) {
                                if (!$td || !$td.length) return NaN;
                                var $span = $td.find('span').first();
                                var src   = $span.length ? $span.text() : $td.clone().find('div').remove().end().text();
                                var raw   = src.replace(/\u00a0/g,'').replace(/\s/g,'').replace(/[^0-9\-]/g,'');
                                return parseInt(raw);
                            }

                            // 1. Or actuel : ligne 'Montant de l\'or'
                            $b.find('tr').each(function() {
                                var lbl = $(this).find('td').first().text().toLowerCase();
                                if (lbl.indexOf('montant') < 0) return;
                                // v2.24 : la valeur est en 2e cellule (la dernière est l'offre premium) ;
                                // son infobulle donne le montant exact ("600 205 849,78").
                                var $val = $(this).find('td').eq(1);
                                var exact = $val.find('div.tooltip').first().text()
                                                .replace(/[\u00a0\u202f\s]/g,'').replace(',','.');
                                if (/^\d+(\.\d+)?$/.test(exact)) {
                                    goldUpd.current = Math.round(parseFloat(exact));
                                    goldUpd.currentUpdated = Date.now(); found++;
                                    return false;
                                }
                                var raw = $val.clone().find('div').remove().end().text();
                                raw = raw.replace(/\u00a0/g,'').replace(/\s/g,'').replace(',','.');
                                var g = 0;
                                if (/[0-9.]+G/i.test(raw)) g = Math.round(parseFloat(raw)*1e9);
                                else if (/[0-9.]+M/i.test(raw)) g = Math.round(parseFloat(raw)*1e6);
                                else if (/[0-9.]+k/i.test(raw)) g = Math.round(parseFloat(raw)*1e3);
                                else g = parseInt(raw.replace(/[^0-9]/g,'')) || 0;
                                if (g > 0) { goldUpd.current = g; goldUpd.currentUpdated = Date.now(); found++; }
                                return false;
                            });

                            // 2. Per-ville : td.city contient le nom
                            // Structure : [nom][revenu][scientifiques][résultat]
                            $b.find('td.city').each(function() {
                                var cityName = $(this).text().trim();
                                var $row     = $(this).closest('tr');
                                var $cells   = $row.find('td');
                                if ($cells.length < 4) return;
                                $.each(cities, function(i, city) {
                                    // Garde null : ignorer les entrées invalides
                                    if (!city || typeof city.getName !== 'function') return;
                                    var cName = city.getName();
                                    if (cityName !== cName && cityName !== 'G - '+cName &&
                                        cityName.replace(/^G\s*-\s*/,'') !== cName) return;
                                    // Or net par ville (dernière colonne = Résultat)
                                    var res = cellVal($($cells[$cells.length - 1]));
                                    if (!isNaN(res)) {
                                        city.cityGoldNet        = res;
                                        city.cityGoldNetUpdated = Date.now();
                                    }
                                    // Scientifiques (3ème colonne, valeur négative)
                                    if ($cells.length >= 3) {
                                        var sciCost = cellVal($($cells[2]));
                                        if (!isNaN(sciCost) && sciCost < 0) {
                                            var sciCount = Math.round(-sciCost / scientistCost);
                                            if (sciCount >= 0) city._updateScientists(sciCount, changes);
                                        }
                                    }
                                });
                            });
                            if (changes.length) raiseResourcesChanged(changes);

                            // 3. Lignes non-ville par texte (Dieux, Augmentez, Revenu, Entretien)
                            $b.find('tr').each(function() {
                                var $cells = $(this).find('td');
                                if (!$cells.length) return;
                                // Ignorer les lignes de ville et les lignes sigma
                                if ($cells.filter('.city').length || $cells.filter('.sigma').length) return;
                                var label = $cells.first().clone().find('div').remove().end()
                                                  .text().replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
                                var lc = label.toLowerCase();
                                // v2.24 : première cellule chiffrée après le libellé (la dernière peut être vide)
                                var num = NaN;
                                for (var ci = 1; ci < $cells.length && isNaN(num); ci++) num = cellVal($($cells[ci]));
                                if (isNaN(num)) return;
                                if (lc.indexOf('dieux') >= 0 || lc.indexOf('pluton') >= 0)   { goldUpd.gods    = num; found++; }
                                else if (lc.indexOf('entretien') >= 0)                       { goldUpd.upkeep  = -(Math.abs(num)); found++; }
                                else if (lc.indexOf('premium') >= 0 || lc.indexOf('augmentez') >= 0) { goldUpd.premium = num; found++; }
                                // v2.24 : la ligne « Revenu » du total inclut Pluton et déduit les scientifiques :
                                // le revenu est désormais la somme de la colonne Revenu des villes (comme ikariam.model).
                            });

                            // v2.24 : revenu des villes (colonne 2) et coût des scientifiques (ligne Somme, colonne 3)
                            var cityRevenue = 0, cityRows = 0;
                            $b.find('td.city').each(function() {
                                var $c = $(this).closest('tr').find('td');
                                var v = cellVal($($c[1]));
                                if (!isNaN(v)) { cityRevenue += v; cityRows++; }
                            });
                            if (cityRows > 0) { goldUpd.revenue = cityRevenue; found++; }
                            $b.find('tr.result').each(function() {
                                var $c = $(this).find('td');
                                if (!$c.first().hasClass('sigma') || $c.length < 4) return;
                                var sci = cellVal($($c[2]));
                                if (!isNaN(sci)) { goldUpd.scientists = -(Math.abs(sci)); found++; }
                                return false;
                            });

                            // 4. Lignes sigma (tr.result) : dernière = net
                            var sigmaResults = [];
                            $b.find('tr.result').each(function() {
                                var $valCells = $(this).find('td:not(.sigma)');
                                if (!$valCells.length) return;
                                var lastVal = cellVal($($valCells[$valCells.length - 1]));
                                if (!isNaN(lastVal)) sigmaResults.push(lastVal);
                            });
                            // Le dernier sigma = solde net final (après déduction de l'entretien armée)
                            if (sigmaResults.length > 0) { goldUpd.net = sigmaResults[sigmaResults.length - 1]; found++; }

                            if (found > 0) { getCivilizationData()._updateGoldData(goldUpd); raiseGoldChanged(); }
                        } catch(e) {}
                    }, 0);
                } else {
                    // Fallback: coût scientifiques calculé depuis données connues
                    try {
                        var totalSci = 0;
                        $.each(cities, function(i, c) {
                            if (!c || typeof c.getScientists !== 'function') return;
                            totalSci += (c.getScientists()||0) * scientistCost;
                        });
                        if (totalSci > 0) {
                            getCivilizationData()._updateGoldData({ scientists: -totalSci, incomeUpdated: Date.now() });
                            raiseGoldChanged();
                        }
                    } catch(e) {}
                }
                if (changes.length) raiseResourcesChanged(changes);
            }

            // ============================================================
            // v2.07 : Parser du Sanctuaire divin (vue shrineOfOlympus)
            // Extrait, pour chaque ville, la divinité vénérée + la faveur totale.
            // Robuste : ancres stables (data-known-city-id, classe god_*),
            // try/catch par entrée pour ne jamais casser en cas de maj Ikariam.
            // ============================================================
            var _shrineLastParsed = 0;
            // Mapping id divinité -> nom (ordre fixe du jeu)
            var SHRINE_GOD_NAMES = {
                '1':'Pan', '2':'Dionysos', '3':'Tyché',
                '4':'Pluton', '5':'Théia', '6':'Héphaïstos'
            };
            // Mapping classe CSS -> id divinité (repli si l'option selected manque)
            var SHRINE_GOD_CLASS = {
                'god_pan':'1', 'god_dionysus':'2', 'god_tyche':'3',
                'god_plutus':'4', 'god_theia':'5', 'god_hephaestos':'6'
            };
            // Seul Pluton (id 4) impacte l'or ; les autres gèrent les ressources.
            function shrineGodAffectsGold(godId) { return String(godId) === '4'; }

            // v2.12 : "2j 12h", "5h 30m", "45m"... -> millisecondes (null si illisible)
            function parseShrineDuration(txt) {
                var s = String(txt || '').replace(/\u00a0/g, ' ');
                var re = /(\d+)\s*(j|d|h|m|s)/gi, m, ms = 0, found = false;
                var unit = { j: 86400000, d: 86400000, h: 3600000, m: 60000, s: 1000 };
                while ((m = re.exec(s)) !== null) {
                    ms += parseInt(m[1], 10) * unit[m[2].toLowerCase()];
                    found = true;
                }
                return found ? ms : null;
            }

            function processShrineView(data, viewHtmlStr) {
                if (Date.now() - _shrineLastParsed < 2000) return; // anti-doublon
                if (!viewHtmlStr && typeof data !== 'string') {
                    // Certaines réponses passent le HTML dans templateData ; on tente une reconstruction
                    return;
                }
                _shrineLastParsed = Date.now();
                // v2.14 : la réponse serveur contient des champs VIDES (durées, jauges,
                // bénédictions), remplis ensuite par le JS du jeu. On lit donc la page
                // affichée une fois rendue ; le HTML brut ne sert que de repli.
                function parseShrineFromHtml() {
                    try {
                        var htmlSrc = viewHtmlStr || (typeof data === 'string' ? data : '');
                        var $s = null;
                        var $live = $('#shrineOfOlympus');
                        if ($live.length) {
                            var liveFilled = $live.find('ul.gods.overview .gracePeriod').filter(function() {
                                return /\d/.test($(this).text());
                            }).length > 0;
                            if (liveFilled) $s = $live;
                        }
                        if (!$s) {
                            if (!htmlSrc) return;
                            $s = $('<div>').html(htmlSrc);
                        }
                        var cities = getOwnCities();
                        var changes = [];
                        var assignedCount = 0;

                        // Faveur totale
                        try {
                            var favTxt = $s.find('#currentFavor').first().text();
                            var fav = parseInt((favTxt||'').replace(/[\u00a0\s]/g,'').replace(/[^0-9]/g,''));
                            if (!isNaN(fav)) getCivilizationData()._updateShrineData({ favor: fav, updated: Date.now() });
                        } catch(eFav) {}

                        // v2.12 : bienveillance par dieu (onglet Vue générale, présent dans
                        // la même réponse que l'onglet Vénérer). On stocke une date de fin
                        // absolue : le décompte se fait ensuite localement.
                        var godsParsed = 0;
                        try {
                            var nowG = Date.now();
                            // v2.14 : on part des données existantes (fusion, jamais d'écrasement par du vide)
                            var prevGods = getCivilizationData().getShrineData().gods || {};
                            var graces = $.extend(true, {}, prevGods);
                            $s.find('ul.gods.overview > li[data-god-id]').each(function() {
                                try {
                                    var $g = $(this);
                                    var gid = String($g.attr('data-god-id') || '');
                                    var $gp = $g.find('.gracePeriod').first();
                                    if (!gid || !$gp.length) return;
                                    var gTxt = $.trim($gp.text());
                                    var ms = parseShrineDuration(gTxt);
                                    // v2.13 : jauge de faveur "1000 / 1000"
                                    var favor = null, favorMax = null;
                                    try {
                                        var $pb = $g.find('.progressbar .innerDisplay').first();
                                        var fv = parseInt(($pb.find('.text').first().text() || '').replace(/[^0-9]/g, ''), 10);
                                        var fm = parseInt((($pb.text() || '').split('/')[1] || '').replace(/[^0-9]/g, ''), 10);
                                        if (isFinite(fv)) favor = fv;
                                        if (isFinite(fm) && fm > 0) favorMax = fm;
                                    } catch(eF) {}
                                    // v2.14 : seules les valeurs réellement lues sont mises à jour
                                    var entry = graces[gid] || {};
                                    entry.name = SHRINE_GOD_NAMES[gid] || $.trim($g.find('.godDescription > b').first().text()) || entry.name || '?';
                                    var readSomething = false;
                                    if (ms !== null) { entry.graceEnd = nowG + ms; entry.graceText = gTxt; readSomething = true; }
                                    if (favor !== null) { entry.favor = favor; readSomething = true; }
                                    if (favorMax !== null) entry.favorMax = favorMax;
                                    if (!readSomething) return; // champs vides : on garde l'existant
                                    entry.updated = nowG;
                                    graces[gid] = entry;
                                    godsParsed++;
                                } catch(eG1) {}
                            });
                            if (godsParsed > 0) {
                                getCivilizationData()._updateShrineData({ gods: graces, godsUpdated: nowG });
                            }
                        } catch(eG) {
                            console.warn('[Imperator] processShrineView : bienveillances ignorées', eG);
                        }

                        // Index rapide des villes par id (clé string)
                        var cityById = {};
                        $.each(cities, function(i, c) {
                            if (c && typeof c.getId === 'function') cityById[String(c.getId())] = c;
                        });

                        // Chaque ligne d'affectation
                        var seenCityIds = {}; // v2.12 : pour nettoyer les affectations retirées
                        var $worshipLis = $s.find('ul.gods.worshiping > li');
                        $worshipLis.each(function() {
                            try {
                                var $li = $(this);
                                var $citySel = $li.find('select.js_citySelect').first();
                                // 1) id ville : priorité à data-known-city-id (stable), sinon option selected
                                var cityId = $citySel.attr('data-known-city-id');
                                if (!cityId || cityId === '0') {
                                    cityId = $citySel.find('option[selected]').first().attr('value') ||
                                             $citySel.val();
                                }
                                cityId = String(cityId || '0');
                                if (cityId === '0' || !cityId) return; // slot vide

                                // 2) id divinité : option selected, sinon classe god_* du bloc détail
                                var $godSel = $li.find('select.js_godSelect').first();
                                var godId = $godSel.find('option[selected]').first().attr('value') || $godSel.val();
                                if (!godId || godId === '0') {
                                    var $godDiv = $li.find('.js_toggleBigContent .god').first();
                                    var cls = ($godDiv.attr('class') || '').split(/\s+/);
                                    for (var k=0; k<cls.length; k++) {
                                        if (SHRINE_GOD_CLASS[cls[k]]) { godId = SHRINE_GOD_CLASS[cls[k]]; break; }
                                    }
                                }
                                godId = String(godId || '0');
                                if (godId === '0') return;

                                var godName = SHRINE_GOD_NAMES[godId] ||
                                              ($godSel.find('option[selected]').first().text().trim()) || '?';

                                // 3) bénédiction (facultatif, tolérant aux absences)
                                var bonusTxt = $li.find('.currentBonus').first().text();
                                var bonus = parseFloat((bonusTxt||'').replace(',','.').replace(/[^0-9.]/g,''));
                                if (isNaN(bonus)) bonus = null;

                                // 4) écrire sur l'objet ville (persiste via reviver)
                                var city = cityById[cityId];
                                if (city) {
                                    seenCityIds[cityId] = true;
                                    city.worshipGodId       = godId;
                                    city.worshipGodName     = godName;
                                    if (bonus !== null) city.worshipGodBonus = bonus; // v2.14 : vide => on garde
                                    city.worshipGodUpdated  = Date.now();
                                    assignedCount++;
                                }
                            } catch(eLi) {
                                console.warn('[Imperator] processShrineView : entrée ignorée', eLi);
                            }
                        });

                        // v2.12 : une ville qui n'apparaît plus dans l'onglet Vénérer n'a plus de dieu
                        var cleared = 0;
                        if ($worshipLis.length > 0) {
                            $.each(cityById, function(cid, c) {
                                if (!seenCityIds[cid] && c.worshipGodId) {
                                    delete c.worshipGodId;
                                    delete c.worshipGodName;
                                    delete c.worshipGodBonus;
                                    delete c.worshipGodUpdated;
                                    cleared++;
                                }
                            });
                        }

                        if (assignedCount > 0 || godsParsed > 0 || cleared > 0) {
                            // Réutilise l'événement gold (le Dashboard écoute déjà dessus) pour redessiner
                            raiseGoldChanged();
                            raiseShrineChanged(); // v2.12 : onglet Ressources
                            empireData.save();
                        }
                    } catch(e) {
                        console.warn('[Imperator] processShrineView a échoué', e);
                    }
                }
                // v2.14 : deux passes, le temps que le jeu remplisse la page
                setTimeout(parseShrineFromHtml, 700);
                setTimeout(parseShrineFromHtml, 2000);
            }

            // ============================================================
            // v2.07 : Capture du VRAI coût d'agrandissement depuis le jeu.
            // Le modèle de la vue ville ne contient pas les coûts : ils sont
            // uniquement dans le panneau latéral "#buildingUpgrade" affiché à
            // l'ouverture d'un bâtiment. On le lit et on le met en cache sur
            // l'objet City.Building (persiste via le reviver), pour remplacer
            // les tables codées en dur (périmées) dans le tooltip.
            // ============================================================
            function processBuildingUpgradeView(viewHtml) {
                setTimeout(function parseBuildingUpgrade() {
                    try {
                        var $box = null;
                        if (viewHtml && viewHtml.indexOf('buildingUpgrade') >= 0) {
                            $box = $('<div>').html(viewHtml).find('#buildingUpgrade');
                        }
                        if (!$box || !$box.length) $box = $('#buildingUpgrade');   // repli DOM live
                        if (!$box || !$box.length) return;

                        // cityId / position / niveau courant depuis le bouton "Développer"
                        var href = $box.find('#js_buildingUpgradeButton').attr('href') ||
                                   $box.find('a[href*="cityId="]').first().attr('href') || '';
                        var cM = href.match(/cityId=(\d+)/), pM = href.match(/position=(\d+)/), lM = href.match(/level=(\d+)/);
                        var cityId = cM ? parseInt(cM[1], 10) : null;
                        var position = pM ? parseInt(pM[1], 10) : null;
                        var level = lM ? parseInt(lM[1], 10) : null;
                        if (level == null) {
                            var lt = ($box.find('.showLevel').text() || '').match(/(\d+)/);
                            if (lt) level = parseInt(lt[1], 10);
                        }
                        if (cityId == null || position == null || level == null) return;

                        // Coûts réels (classe crystal = verre). Les libellés ne contiennent
                        // aucun chiffre, donc on extrait le nombre du title en retirant tout non-digit.
                        var cost = { wood:0, wine:0, marble:0, glass:0, sulfur:0, time:0,
                                     forLevel: level, updated: Date.now() };
                        var classMap = { wood:'wood', wine:'wine', marble:'marble', crystal:'glass', sulfur:'sulfur' };
                        $box.find('ul.resources > li').each(function() {
                            var $li = $(this), cls = ($li.attr('class') || '').split(/\s+/);
                            if ($.inArray('time', cls) >= 0) {
                                // Exclure le tooltip interne (qui répète "21m 18s") avant de parser.
                                var timeTxt = $li.clone().children('div').remove().end().text();
                                var t = _impParseDurationMs(timeTxt);
                                if (t != null) cost.time = t;
                                return;
                            }
                            var key = null;
                            for (var i = 0; i < cls.length; i++) { if (classMap[cls[i]]) { key = classMap[cls[i]]; break; } }
                            if (!key) return;
                            var amtSrc = $li.attr('title') || $li.text();
                            var amt = parseInt(String(amtSrc).replace(/[^0-9]/g, ''), 10);
                            if (!isNaN(amt)) cost[key] = amt;
                        });

                        var city = getCity(cityId);
                        var building = city && city.getBuildingByPosition ? city.getBuildingByPosition(position) : null;
                        if (building) {
                            building.realUpgradeCost = cost;
                            empireData.save();
                        }
                    } catch(e) {
                        console.warn('[Imperator] processBuildingUpgradeView a échoué', e);
                    }
                }, 0);
            }

            // ============================================================
            // v2.07 : Parser des mouvements de troupes/flottes (conseiller militaire).
            // Remplace la fonction manquante (qui provoquait un ReferenceError et
            // interrompait le dispatcher). Lit les VRAIS temps d'arrivée fournis par
            // le jeu (réductions incluses) au lieu de les estimer par la formule de base.
            // ============================================================
            // Convertit "19m 50s" / "09h 28m" / "2j 03h" en millisecondes.
            function _impParseDurationMs(txt) {
                if (!txt) return null;
                var s = String(txt).replace(/\u00a0/g, ' ');
                var total = 0, found = false;
                var re = /(\d+)\s*([jhms])/gi, m;
                var mult = { j:86400000, h:3600000, m:60000, s:1000 };
                while ((m = re.exec(s)) !== null) {
                    var u = m[2].toLowerCase();
                    if (mult[u] != null) { total += parseInt(m[1], 10) * mult[u]; found = true; }
                }
                return found ? total : null;
            }

            function processMilitaryAdvisorView(templateData) {
                setTimeout(function parseMilitaryMovements() {
                    try {
                        // 1. Localiser le HTML du tableau des mouvements
                        var htmlStr = null;
                        if (templateData) {
                            var keys = ['js_MilitaryMovementsFleetMovementsTable',
                                        'militaryMovementsFleetMovementsTable',
                                        'js_MilitaryMovements'];
                            for (var k = 0; k < keys.length; k++) {
                                var e = templateData[keys[k]];
                                if (e) { htmlStr = (typeof e === 'string') ? e : (e.html || null); if (htmlStr) break; }
                            }
                        }
                        var $root;
                        if (htmlStr) $root = $('<div>').html(htmlStr);
                        else if ($('#js_MilitaryMovementsFleetMovementsTable').length) $root = $('#js_MilitaryMovementsFleetMovementsTable');
                        else return; // rien à parser (parse miss) -> ne rien casser

                        var missionMap = {
                            'transport':  Constants.Movements.Mission.TRANSPORT,
                            'deployarmy': Constants.Movements.Mission.DEPLOY_ARMY,
                            'deployfleet':Constants.Movements.Mission.DEPLOY_NAVY,
                            'plunder':    Constants.Movements.Mission.PLUNDER
                        };
                        var resClassMap = { wood:'wood', wine:'wine', marble:'marble', glass:'glass', sulfur:'sulfur' };

                        var parsed = [];
                        $root.find('table.military_event_table tr').each(function() {
                            try {
                                var $tr = $(this);
                                if ($tr.children('th').length) return;          // en-tête
                                var $mission = $tr.find('.mission_icon').first();
                                if (!$mission.length) return;

                                // eventId : depuis le lien "abort", sinon fleetInfoNNN
                                var eventId = null;
                                var abortHref = $tr.find('a.abort').attr('href') || '';
                                var mm = abortHref.match(/eventId=(\d+)/);
                                if (mm) eventId = parseInt(mm[1], 10);
                                if (!eventId) {
                                    var infoId = ($tr.find('[id^="fleetInfo"]').attr('id') || '');
                                    var mm2 = infoId.match(/fleetInfo(\d+)/);
                                    if (mm2) eventId = parseInt(mm2[1], 10);
                                }
                                if (!eventId) return;

                                // Mission
                                var mcls = ($mission.attr('class') || '').split(/\s+/);
                                var missionKey = null;
                                for (var c = 0; c < mcls.length; c++) { if (missionMap[mcls[c]]) { missionKey = mcls[c]; break; } }
                                if (!missionKey) return; // mission non gérée (trade, occupy, etc.)

                                // Temps d'arrivée RÉEL : 2e cellule, 1er span ("19m 50s")
                                var remTxt = $tr.children('td').eq(1).find('span').first().text();
                                var remMs = _impParseDurationMs(remTxt);
                                if (remMs == null) return;
                                var completion = View.gameTimeNow() + remMs;

                                // Origine / destination (cityId)
                                var oHref = $tr.find('td.source a').attr('href') || '';
                                var dHref = $tr.find('td.target a').attr('href') || '';
                                var oM = oHref.match(/cityId=(\d+)/), dM = dHref.match(/cityId=(\d+)/);
                                var originCityId = oM ? parseInt(oM[1], 10) : null;
                                var targetCityId = dM ? parseInt(dM[1], 10) : null;

                                // Cargaison par ressource
                                var resources = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                                $tr.find('.resource_icon').each(function() {
                                    var rc = ($(this).attr('class') || '').split(/\s+/), rname = null;
                                    for (var r = 0; r < rc.length; r++) { if (resClassMap[rc[r]]) { rname = resClassMap[rc[r]]; break; } }
                                    if (rname) {
                                        var amt = parseInt(($(this).attr('title') || '').replace(/[\u00a0\s]/g, '').replace(/[^0-9]/g, ''), 10) || 0;
                                        resources[rname] += amt;
                                    }
                                });

                                // v2.25 : étape du mouvement, lue à la flèche de la colonne centrale
                                // (classes du jeu, indépendantes de la langue)
                                var dirCls = String($tr.find('td.mission').first().attr('class') || '');
                                var stage;
                                if (/\barrow_left/.test(dirCls)) {
                                    stage = Constants.Movements.Stage.RETURNING;
                                } else if (/\barrow_right/.test(dirCls)) {
                                    stage = Constants.Movements.Stage.EN_ROUTE;
                                } else if ($tr.find('a.accLoading').length) {
                                    stage = Constants.Movements.Stage.LOADING;   // fin de chargement = completion
                                } else {
                                    stage = Constants.Movements.Stage.EN_ROUTE;  // cas inconnu : ancien comportement
                                }

                                // v2.25 : unités du mouvement (infobulle « Flotte / Unités / Cargaison »)
                                var rowUnits = {}, rowUnitsNb = 0;
                                $tr.find('.unit_detail_icon').each(function() {
                                    var uc = ($(this).attr('class') || '').split(/\s+/), utype = null;
                                    for (var u = 0; u < uc.length; u++) { if (Constants.UnitData[uc[u]]) { utype = uc[u]; break; } }
                                    if (!utype) return; // navires marchands, ressources
                                    var n = parseInt(String($(this).attr('title') || $(this).text()).replace(/[^0-9]/g, ''), 10);
                                    if (isFinite(n) && n > 0) { rowUnits[utype] = (rowUnits[utype] || 0) + n; rowUnitsNb++; }
                                });

                                parsed.push({
                                    eventId: eventId, mission: missionMap[missionKey], completion: completion,
                                    originCityId: originCityId, targetCityId: targetCityId, resources: resources,
                                    stage: stage, rowUnits: rowUnitsNb ? rowUnits : null
                                });
                            } catch(erRow) {
                                console.warn('[Imperator] processMilitaryAdvisorView : ligne ignorée', erRow);
                            }
                        });

                        // v2.16 : si le tableau du jeu est présent, la liste lue FAIT FOI
                        // (y compris vide) : tout mouvement absent est un reliquat.
                        var authoritative = $root.find('table.military_event_table').length > 0;
                        if (!parsed.length && !authoritative) return; // parse miss -> ne rien casser

                        var civ = getCivilizationData();
                        var changes = [];

                        function unitsCount(mv) {
                            var n = 0;
                            try { $.each(mv.getUnits().getCounts(), function(t, c) { n += c || 0; }); } catch (e) {}
                            return n;
                        }

                        // 2. Unités à conserver : le jeu ne les donne pas dans ce tableau.
                        //    Priorité : même mouvement réel déjà connu, sinon estimation locale
                        //    (id négatif) de même mission / origine / destination.
                        var known = {}, estimates = [];
                        $.each(civ.movements, function(id, mv) {
                            if (!mv) return;
                            if (mv.getId() < 0) estimates.push(mv); else known[String(mv.getId())] = mv;
                        });
                        function takeUnits(p) {
                            var k = known[String(p.eventId)];
                            if (k && unitsCount(k) > 0) return k.getUnits();
                            for (var i = 0; i < estimates.length; i++) {
                                var e = estimates[i];
                                if (e && e.getMission() === p.mission &&
                                    String(e.getOriginCityId()) === String(p.originCityId) &&
                                    String(e.getTargetCityId()) === String(p.targetCityId)) {
                                    estimates[i] = null; // une estimation ne sert qu'une fois
                                    return e.getUnits();
                                }
                            }
                            return new MilitaryUnits();
                        }
                        var unitsFor = {};
                        $.each(parsed, function(i, p) {
                            var fromEstimate = takeUnits(p); // consomme l'estimation locale correspondante
                            if (p.rowUnits) {                 // v2.25 : la ligne du jeu fait foi
                                var mu = new MilitaryUnits();
                                $.each(p.rowUnits, function(t, n) { mu._setCount(t, n); });
                                unitsFor[p.eventId] = mu;
                            } else {
                                unitsFor[p.eventId] = fromEstimate;
                            }
                        });

                        // 3. Retirer sans effet de bord : estimations locales (doublons) et,
                        //    si la liste fait foi, les mouvements réels qui n'y sont plus.
                        var seen = {};
                        $.each(parsed, function(i, p) { seen[String(p.eventId)] = true; });
                        var toDrop = [];
                        $.each(civ.movements, function(id, mv) {
                            if (!mv) { toDrop.push(id); return; }
                            var mid = mv.getId();
                            if (mid < 0) {
                                // Estimation : retirée si la liste fait foi, ou (ancien comportement) si transport
                                if (authoritative || mv.getMission() === Constants.Movements.Mission.TRANSPORT) toDrop.push(id);
                            } else if (authoritative && !seen[String(mid)]) {
                                toDrop.push(id);
                            }
                        });
                        $.each(toDrop, function(i, id) { civ._dropMovement(id, changes); });

                        // 4. Installer les mouvements réels (temps d'arrivée exact du jeu).
                        $.each(parsed, function(i, p) {
                            var mv = new Movement(
                                p.eventId, 'own', p.completion, p.mission,
                                p.stage || Constants.Movements.Stage.EN_ROUTE, // v2.25
                                p.originCityId, p.targetCityId,
                                0, unitsFor[p.eventId] || new MilitaryUnits(), p.resources, 0
                            );
                            civ._updateMovement(mv, changes);
                        });
                        if (toDrop.length) console.log('[Imperator] Conseiller militaire : ' + toDrop.length +
                                                       ' mouvement(s) obsolète(s) retiré(s), ' + parsed.length + ' lu(s)');

                        if (changes.length) raiseMovementsChanged(changes);
                        empireData.save();
                    } catch(e) {
                        console.warn('[Imperator] processMilitaryAdvisorView a échoué', e);
                    }
                }, 0);
            }

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

                //empireData.saveAsync(); <- valeur avant
                empireData.save();

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

                        //empireData.saveAsync();  <- valeur avant
                        empireData.save();
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

            return {
                updateAndStartTracking: Logging.debuggable(
                    { label: 'IkaTools.EmpireData.updateAndStartTracking', alwaysTime: true },
                    updateAndStartTracking),
                updateMovements: updateMovements,

                calculateTravelTime: calculateTravelTime,

                getCities: getCities,
                getOwnCities: getOwnCities,
                getCivilizationData: getCivilizationData,
                getCity: getCity,

                getDebugString: getDebugString,
                resetData: resetData,

                registerCivilizationDataChangedHandler: registerCivilizationDataChangedHandler,
                registerResourcesChangedHandler: registerResourcesChangedHandler,
                raiseResourcesChanged: raiseResourcesChanged,
                registerBuildingsChangedHandler: registerBuildingsChangedHandler,
                registerMilitaryChangedHandler: registerMilitaryChangedHandler,
                registerMovementsChangedHandler: registerMovementsChangedHandler,
                registerGoldChangedHandler: registerGoldChangedHandler,
                registerShrineChangedHandler: registerShrineChangedHandler, // v2.12
                refreshFinancesAndShrine: refreshFinancesAndShrine, // v2.07

                Espionage:Espionage,
            };
        }();

        function processAnchor() {
    var anchor = window.location.hash;
    if (anchor == '#ikaScriptToolsSuppressCityPreselect') {
        document.location.hash = '';
        View.suppressFirstChangeViewOfType('cityDetails');
    }
    if (anchor.substring(0, 35) == '#ikaScriptToolsLoadLocalIkariamUrl=') {
        var url = decodeURIComponent(anchor.substring(35));
        document.location.hash = '';
        View.suppressFirstChangeViewOfType('cityDetails'); // ← AVANT, inconditionnel
        IkaTools.View.loadLocalIkariamUrl(url);
    } else if (anchor.substring(0, 62) ==
               '#ikaScriptToolsLoadLocalIkariamUrl_DoNotSuppressFirstCityInfo=') {
        url = decodeURIComponent(anchor.substring(62));
        document.location.hash = '';
        IkaTools.View.loadLocalIkariamUrl(url);
    }
}

        function initialize(options) {
            processAnchor();
            $(window).bind('hashchange', processAnchor);
            options = $.extend({ trackData: true }, options);
            View.setGameTimeDifference(new Date().getTime() -
                                       unsafeWindow.ikariam.model.requestTime * Constants.Time.MILLIS_PER_SECOND -
                                       Constants.Time.INITIAL_PAGE_LOAD_DELTA);
            if (options.trackData) {
                IkaTools.EmpireData.updateAndStartTracking();
            }
        }

        return {
            Logging: Logging,
            Utils: Utils,
            View: View,
            Data: Data,
            Intl: Intl,
            EmpireData: EmpireData,
            Constants: Constants,
            UI: UI,
            Settings: Settings,

            initialize: initialize,
            processAnchor: processAnchor,
        };
    })();
}


// --- Wrapper auto de updateAndStartTracking ---
(function waitForEmpireDataWrapper() {
    try {
        if (window.IkaTools &&
            IkaTools.EmpireData &&
            typeof IkaTools.EmpireData.updateAndStartTracking === 'function' &&
            !IkaTools.EmpireData.__imperatorWrapped) {

            var orig = IkaTools.EmpireData.updateAndStartTracking;

            IkaTools.EmpireData.updateAndStartTracking = function() {
                try {
                    return orig.apply(this, arguments);
                } catch (e) {
                    console.warn('Imperator wrapper: updateAndStartTracking a échoué :', e);
                }
            };

            IkaTools.EmpireData.__imperatorWrapped = true;
            return;
        }
    } catch (e) {
        console.warn('Imperator wrapper: erreur dans waitForEmpireDataWrapper', e);
    }

    // Si on n’a pas encore accès à la fonction, on réessaie dans 500 ms
    setTimeout(waitForEmpireDataWrapper, 500);
})();
// --- Fin wrapper updateAndStartTracking ---

$.extend(String.prototype, {
    format: function() {
        var pattern = /%s/g

        return function format() {
            var args = arguments;
            var itemIndex = 0;
            var str = this.replace(pattern, function replacer(match, key) {
                return args[itemIndex++];
            });
            return str;
        }
    }(),
    format2: function() {
        var pattern = /%{([a-zA-Z_0-9]+)}/g

        return function format2(args) {
            var str = this.replace(pattern, function replacer(match, key) {
                return args[key];
            });
            return str;
        }
    }(),
});

