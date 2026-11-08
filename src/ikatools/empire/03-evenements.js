            // Événements de l'empire (abonnements et annonces), sans dépendance au modèle.
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

            // Gold event
            var goldChangedEvent = Utils.thunk(function() { return new Utils.EventDispatcher(); });
            function raiseGoldChanged() { goldChangedEvent().send(); }
            function registerGoldChangedHandler(callback) { return goldChangedEvent().addListener(callback); }

            // v2.12 : Sanctuaire divin (affectations / bienveillances) mis à jour
            var shrineChangedEvent = Utils.thunk(function() { return new Utils.EventDispatcher(); });
            function raiseShrineChanged() { shrineChangedEvent().send(); }
            function registerShrineChangedHandler(callback) { return shrineChangedEvent().addListener(callback); }


