
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
                            empireData.saveSoon(); // v2.35
                        }
                    } catch(e) {
                        console.warn('[Imperator] processShrineView a échoué', e);
                    }
                }
                // v2.14 : deux passes, le temps que le jeu remplisse la page
                setTimeout(parseShrineFromHtml, 700);
                setTimeout(parseShrineFromHtml, 2000);
            }
