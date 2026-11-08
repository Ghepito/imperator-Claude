
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
                        Constants.Research.Science.PAPER) ? .02 : 0;
                    multiplier += civData.hasResearched(
                        Constants.Research.Science.INK) ? .04 : 0;
                    multiplier += civData.hasResearched(
                        Constants.Research.Science.MECHANICAL_PEN) ? .08 : 0;
                    multiplier += (civData.getResearchLevel(
                        Constants.Research.Science.SCIENTIFIC_FUTURE) || 0) * .02;
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
                    // v2.31 : coûts exacts lus dans l'aide du jeu (niveau à construire = level + 1)
                    var help = getHelpCost(this.getType(), level + 1);
                    var costs = help ? {
                        wood: help.wood, wine: help.wine, marble: help.marble,
                        glass: help.glass, sulfur: help.sulfur,
                        time: Math.round(timeParams.a / timeParams.b *
                                         Math.pow(timeParams.c, level+1) - timeParams.d) * 1000,
                    } : {
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
                        _help: !!help, // v2.31
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
                    // v2.31 : l'aide du jeu connaît le niveau suivant : ce n'est pas le max.
                    if (getHelpCost(type, this.getLevel() + (this.isUpgrading() ? 1 : 0) + 1)) {
                        return false;
                    }

                    return (this.getLevel() + (this.isUpgrading() ? 1 : 0)) >= maxLevel;
                },


                // fin Patch Rendre isMaxLevel safe

            });

            _impTypes.city = City;
            _impTypes.building = City.Building;
            _impTypes.cityResource = City.Resource;
