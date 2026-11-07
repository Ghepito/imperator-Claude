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
