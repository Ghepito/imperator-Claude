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
