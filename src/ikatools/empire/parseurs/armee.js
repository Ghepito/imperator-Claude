

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
