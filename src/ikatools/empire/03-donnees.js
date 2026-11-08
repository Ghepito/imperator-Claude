            // v2.38 : magasin de l'empire (données sauvegardées) et accès en lecture.
            // Les parseurs et le modèle passent par ici au lieu d'aller chercher dans 04-suivi.

            var empireData = new Data.Value(
                'empireData',

                {
                    cities: {},
                    cityOrder: [],
                    civilizationData: new _impTypes.civilizationData(),
                },
                {
                    reviver: function empireDataReviver(key, value) {
                        if (value && value._ikaToolsType) {
                            // v2.38 : type retrouvé dans le registre (00-types)
                            var Type = _impTypes[value._ikaToolsType];
                            var obj = Type ? new Type() : undefined;
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

            var TRADE_GOOD_LOOKUP = {
                "1": Constants.Resources.WINE,
                "2": Constants.Resources.MARBLE,
                "3": Constants.Resources.GLASS,
                "4": Constants.Resources.SULFUR,
            };

            function getCity(id) {
                return empireData.get().cities[id];
            };

            var coordsRegex = /\[(\d+):(\d+)\]/;
            function parseCoordinates(coords) {
                var match = coords.match(coordsRegex);
                return [parseInt(match[1]), parseInt(match[2])];
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

