
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
                getIslandMiracles: getIslandMiracles, // v3.14

                Espionage:Espionage,
            };
