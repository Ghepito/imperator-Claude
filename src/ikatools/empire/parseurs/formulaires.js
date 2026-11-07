
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
