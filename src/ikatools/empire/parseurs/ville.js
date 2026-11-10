

            // v3.2 : recherche/h affichée par l'académie (séparateurs de milliers ignorés)
            function readAcademyResearchValue() {
                var el = $('#valueResearch');
                if (!el.length) return NaN;
                var digits = el.text().replace(/[^0-9]/g, '');
                return digits ? parseInt(digits, 10) : NaN;
            }

            // v3.2 : recherche/h estimée après un changement du nombre de chercheurs, en attendant
            // la valeur du jeu : même rendement par chercheur qu'avant, sinon celui des autres villes.
            function estimateResearchPerHour(city, oldScientists, oldResearch, newScientists) {
                if (!(newScientists > 0)) return 0;
                if (oldScientists > 0 && oldResearch > 0) {
                    return Math.round(oldResearch / oldScientists * newScientists);
                }
                var points = 0, count = 0;
                $.each(getOwnCities(), function(i, c) {
                    if (!c || c === city || c.researchPerHour == null) return;
                    var sc = Number(c.getScientists()) || 0;
                    if (sc > 0 && c.researchPerHour > 0) { points += c.researchPerHour; count += sc; }
                });
                return count > 0 ? Math.round(points / count * newScientists) : null;
            }

            function processAcademyView(data) {
                var changes = [];
                var city = View.getCurrentCity();
                var scientists = parseInt(data['js_academy_research_tooltip_basic_production'].text);
                city._updateScientists(scientists, changes);
                if (!isNaN(scientists)) city._markScientistsRead(); // v3.2
                var total = readAcademyResearchValue();
                if (!isNaN(total)) city._updateResearchPerHour(total, changes);
                raiseResourcesChanged(changes);
            }

            function processSetScientistsForm(form) {
                var scientists = parseInt($('#inputScientists').val());
                var shownBefore = readAcademyResearchValue(); // v3.2

                View.registerNextIkariamAjaxRequestCallback(function saveScientstsData(response) {
                    Utils.iterateIkariamAjaxResponse(response,
                                                     function lookForSuccessFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                            data[0].type == 10) {
                            var changes = [];
                            var city = View.getCurrentCity();
                            // v3.2 : la recherche/h suit tout de suite le nouveau nombre de chercheurs
                            var oldScientists = Number(city.getScientists()) || 0;
                            city._updateResearchPerHour(estimateResearchPerHour(
                                city, oldScientists, city.researchPerHour, scientists), changes);
                            city._updateScientists(scientists, changes);
                            city._markScientistsRead(); // v3.2
                            raiseResourcesChanged(changes);
                            // puis la valeur exacte, dès que l'académie l'affiche
                            setTimeout(function readExactResearch() {
                                var shown = readAcademyResearchValue();
                                if (isNaN(shown) || (shown === shownBefore && scientists !== oldScientists)) return;
                                if (shown === city.researchPerHour) return;
                                var exact = [];
                                city._updateResearchPerHour(shown, exact);
                                exact.push({ city: city, type: Constants.Resources.SCIENTISTS, value: scientists });
                                raiseResourcesChanged(exact);
                            }, 600);
                        }
                    });
                });
            }

            function processPalaceView(data) {
                var changes = [];
                getCivilizationData()._updateGovernment(
                    $('.government_pic img').attr('src').slice(16, -8), changes);
                raiseCivilizationDataChanged(changes);
            }

            
            // v2.18 : lecture des biens culturels de TOUTES les villes, déclenchée par
            // l'apparition du formulaire de répartition (indépendant du nom de vue).
            (function _impWatchCulturalGoods() {
                function readAll(attempt) {
                    attempt = attempt || 0;
                    var inputs = $('#moveCulturalGoods input[id^="textfield_city_"]');
                    if (!inputs.length) {
                        if (attempt < 10) setTimeout(function () { readAll(attempt + 1); }, 300);
                        return;
                    }
                    try {
                        var changes = [];
                        var count = 0;
                        inputs.each(function (index, item) {
                            item = $(item);
                            var idMatch = /textfield_city_(\d+)/.exec(item.attr('id') || '');
                            if (!idMatch) return;
                            var city = getCity(parseInt(idMatch[1], 10));
                            var raw = String(item.val() == null ? '' : item.val()).replace(/[^\d]/g, '');
                            if (!city || raw === '') return;
                            var v = parseInt(raw, 10);
                            if (isFinite(v)) {
                                city._updateCulturalGoods(v, changes);
                                count++;
                            }
                        });
                        console.log('[Imperator] biens culturels lus pour ' + count + ' ville(s)');
                        if (changes.length) {
                            raiseResourcesChanged(changes);
                            empireData.saveAsync();
                        }
                    } catch (e) {
                        console.warn('[Imperator] lecture biens culturels ignorée', e);
                    }
                }

                // v2.35 : plus d'observateur de toute la page (réveillé à chaque compte à rebours
                // du jeu) ; on regarde seulement les réponses du jeu qui contiennent le formulaire.
                var timer = null;
                function schedule() {
                    clearTimeout(timer);
                    timer = setTimeout(function () { readAll(); }, 300);
                }
                View.registerIkariamAjaxResponseCallback(function watchCulturalGoods(response) {
                    var seen = false;
                    try {
                        Utils.iterateIkariamAjaxResponse(response, function (index, name, data) {
                            if (seen || !data) return;
                            var html = typeof data === 'string' ? data :
                                       (typeof data[1] === 'string' ? data[1] : '');
                            if (html.indexOf('moveCulturalGoods') >= 0) seen = true;
                        });
                    } catch (e) {}
                    if (seen) schedule();
                });
                // Page chargée directement sur le formulaire (F5)
                function checkPage() { if (document.getElementById('moveCulturalGoods')) schedule(); }
                if (document.readyState !== 'loading') checkPage();
                else document.addEventListener('DOMContentLoaded', checkPage);
            })();



            function processTownHallView(data) {
                var changes = [];
                var city = View.getCurrentCity();

                // --- Humeur réelle depuis l’interface Ikariam ---
                try {
                    // Selon les versions Ikariam, l’ID peut varier un peu, adapte au besoin
                    var moodImg = document.querySelector("#js_TownHallSatisfactionOverviewMood img, #js_townHallMood img");
                    if (moodImg && moodImg.src) {
                        var src = moodImg.src;
                        var mood = "neutral";

                        if (src.indexOf("happy") >= 0 || src.indexOf("smiley_happy") >= 0) {
                            mood = "happy";
                        } else if (src.indexOf("ecstatic") >= 0) {
                            mood = "ecstatic";
                        } else if (src.indexOf("sad") >= 0) {
                            mood = "sad";
                        } else if (src.indexOf("angry") >= 0 || src.indexOf("outraged") >= 0) {
                            mood = "outraged";
                        } else if (src.indexOf("neutral") >= 0) {
                            mood = "neutral";
                        }

                        // On stocke l’humeur directement sur l’objet ville
                        city._imperatorMood = mood;
                    }
                } catch (e) {
                    console.warn("Imperator patch mood: erreur lecture humeur TownHall", e);
                }

               // v2.18 : lecture robuste des bonus (séparateur de milliers FR + table non linéaire)
                function _impReadTH(id) {
                    var txt = (data[id] && data[id].text != null) ? data[id].text : $('#' + id).text();
                    return _impNumFR(txt);   // déclaration de fonction -> hoistée, utilisable ici
                }
                function _impTavernLevelFromBonus(bonus) {
                    if (!isFinite(bonus) || bonus <= 0) return 0;
                    var tbl = Constants.BuildingData[Constants.Buildings.TAVERN].maxBonus;
                    var best = 0, bestDiff = Infinity;
                    for (var i = 0; i < tbl.length; i++) {
                        var d = Math.abs(tbl[i] - bonus);
                        if (d < bestDiff) { bestDiff = d; best = i + 1; }  // tbl[0] = niveau 1
                    }
                    return best;
                }
                try {
                    var _cgBonus = _impReadTH('js_TownHallSatisfactionOverviewCultureBoniTreatyBonusValue');
                    if (isFinite(_cgBonus)) city._updateCulturalGoods(Math.round(_cgBonus / 50), changes);
                } catch (e) {}
                try {
                    var _twBonus = _impReadTH('js_TownHallSatisfactionOverviewWineBoniServeBonusValue');
                    if (isFinite(_twBonus)) city._updateTavernWineLevel(_impTavernLevelFromBonus(_twBonus), changes);
                } catch (e) {}

                // v2.11 : lecture des VRAIES valeurs du jeu. Nombres FR -> separateur de
                // milliers = espace insecable (\u00a0) : parseInt s'arreterait au 1er espace
                // ("5 340" -> 5). On nettoie les espaces (normal/insecable/fin) et la virgule.
                function _impNumFR(txt) {
                    if (txt == null) return NaN;
                    var str = String(txt).replace(/[\s\u00a0\u202f\u2009]/g, '').replace(/\+/g, '').replace(',', '.');
                    var n = parseFloat(str);
                    return isFinite(n) ? n : NaN;
                }

                // Satisfaction libre reelle (surplus) -> pilote la croissance
                var _sat = _impNumFR($('#js_TownHallHappinessLargeValue').text());
                if (isFinite(_sat)) city._updateHappinessScore(_sat, changes);

                // Population reelle (l'onglet Hotel de Ville l'expose ; d'autres vues renvoient 0)
                try {
                    var _rp = _impNumFR($('#js_TownHallOccupiedSpace').text());
                    if (isFinite(_rp) && _rp > 0) city._updatePopulation(_rp, changes);
                } catch (e) {}

                // Plafond de logement reel
                try {
                    var _rm = _impNumFR($('#js_TownHallMaxInhabitants').text());
                    if (isFinite(_rm) && _rm > 0) city._realMax = _rm;
                } catch (e) {}

                // Croissance/heure reelle affichee par le jeu
                try {
                    var _rg = _impNumFR($('#js_TownHallPopulationGrowthValue').text());
                    if (isFinite(_rg)) city._realGrowth = _rg;
                } catch (e) {}

                raiseResourcesChanged(changes);
            }


            function processTempleView(data) {
                var changes = [];
                View.getCurrentCity()._updatePriests(
                    parseInt(data['js_TempleSlider'].slider.ini_value), changes);
                raiseResourcesChanged(changes);
            }

            function processResearchAdvisorView(data) {
                var civData = getCivilizationData();
                var idRegex = /researchId=([0-9]+)/i
                var levelRegex = /\((\d+)\)/;

                var researches =
                    JSON.parse(data['new_js_params'] || data['load_js'].params).currResearchType;

                var changes = [];
                $.each(researches, function (name, researchData) {
                    var id = parseInt(idRegex.exec(researchData.aHref)[1]);
                    var levelMatch = levelRegex.exec(name);
                    var level = levelMatch
                    ? parseInt(levelMatch[1]) - 1
                    : (researchData.liClass == 'explored' ? 1 : 0);

                    civData._updateResearch(id, level, changes);
                });
                raiseCivilizationDataChanged(changes);
            }
