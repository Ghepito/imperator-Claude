
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

            // v2.32 : le temps restant affiché est arrondi (« 06h 33m » : à la minute, « 1j 16h » : à
            // l'heure). L'heure d'arrivée affichée à côté (« 15:37:58 ») est exacte : on la retient si
            // elle concorde avec l'estimation, à la précision du temps restant près.
            function _impRefineWithClock(estimate, cellTxt, remTxt) {
                var clocks = String(cellTxt || '').match(/\d{1,2}:\d{2}:\d{2}/g);
                if (!clocks || !isFinite(estimate)) return estimate;
                var hms = clocks[clocks.length - 1].split(':');
                var unit = /\d+\s*s/i.test(remTxt) ? 1000 : /\d+\s*m/i.test(remTxt) ? 60000 :
                           /\d+\s*h/i.test(remTxt) ? 3600000 : 86400000;
                var d = new Date(estimate);
                d.setHours(parseInt(hms[0], 10), parseInt(hms[1], 10), parseInt(hms[2], 10), 0);
                var best = null;
                for (var k = -1; k <= 1; k++) {
                    var c = d.getTime() + k * 86400000;
                    if (best === null || Math.abs(c - estimate) < Math.abs(best - estimate)) best = c;
                }
                return Math.abs(best - estimate) <= unit ? best : estimate;
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
                                var completion = _impRefineWithClock(View.gameTimeNow() + remMs,
                                                                     $tr.children('td').eq(1).text(), remTxt); // v2.32

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
