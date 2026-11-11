

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
                // v3.5 : facteur exact lu dans l'académie (points par chercheur)
                if (city.researchFactor > 0) return Math.floor(newScientists * city.researchFactor);
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
                // v3.5 : coût d'un chercheur, points par chercheur, parchemin d'Athéna
                try {
                    var cb = data['js_AcademySlider'].slider.callback_data;
                    if (cb.researchProductionFactor > 0) city._updateResearchFactor(Number(cb.researchProductionFactor));
                    if (cb.costPerScientist > 0) {
                        getCivilizationData()._updateAcademyData({ costPerScientist: Number(cb.costPerScientist) });
                    }
                } catch (eCb) {}
                try {
                    var lj = data['load_js'];
                    var params = typeof lj.params === 'string' ? JSON.parse(lj.params) : lj.params;
                    if (params && typeof params.hasAthenaScroll === 'boolean') {
                        getCivilizationData()._updateAcademyData({
                            hasAthenaScroll: params.hasAthenaScroll,
                            isAthenaScrollActive: !!params.isAthenaScrollActive });
                    }
                } catch (eLj) {}
                city._ackExperiment();
                raiseResourcesChanged(changes);
            }

            // v3.5 : lancement d'une expérience (boutons « Lancer l'expérience » et « Utiliser le
            // parchemin d'Athéna »). Si le jeu confirme, le labo de la ville est indisponible 4 h.
            var EXPERIMENT_COOLDOWN = 4 * Constants.Time.MILLIS_PER_HOUR;
            function processExperimentForm(form) {
                var cityId = parseInt($(form).find('input[name="cityId"]').val(), 10);
                var city = (cityId && getCity(cityId)) || View.getCurrentCity();
                var withScroll = $(form).find('input[name="useAthenasScroll"]').val() == '1';
                var launchedAt = Date.now();

                View.registerNextIkariamAjaxRequestCallback(function saveExperiment(response) {
                    var success = false, failure = false;
                    Utils.iterateIkariamAjaxResponse(response, function lookForFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK) {
                            if (data && data[0] && data[0].type == 10) success = true; else failure = true;
                        }
                    });
                    // v3.18 : comptée seulement si le serveur confirme (vérifié en jeu le 11 nov. 2026 :
                    // le jeu renvoie bien la confirmation). Sans retour, rien n'est compté.
                    console.log('[Imperator] Expérience ' + (city && city.getName ? city.getName() : '?') +
                                (withScroll ? ' (parchemin)' : '') + ' : ' +
                                (success ? 'confirmée' : failure ? 'refusée' : 'sans retour du jeu, non comptée'));
                    if (!success) return;
                    if (!city) return;
                    city._markExperimentLaunched(launchedAt + EXPERIMENT_COOLDOWN);
                    if (withScroll) getCivilizationData()._updateAcademyData({ hasAthenaScroll: null });
                    // v3.6 : les 300 000 points de l'expérience s'ajoutent aux points accumulés
                    var advisor = getCivilizationData().getResearchAdvisorData();
                    if (advisor.updated) getCivilizationData()._updateResearchAdvisorData({ points: advisor.points + 300000 });
                    raiseResourcesChanged([{ city: city, type: Constants.Resources.SCIENTISTS,
                                             value: city.getScientists() }]);
                });
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
                // v3.14 : miracle de l'île (actif jusqu'à…, rechargement jusqu'à…)
                try {
                    var city = View.getCurrentCity();
                    var m = readTempleMiracle(data);
                    if (m && city && city.getIslandId()) {
                        var store = islandMiracleData.get();
                        m.cityId = city.getId();
                        m.readAt = Date.now();
                        store[city.getIslandId()] = m;
                        islandMiracleData.saveAsync();
                        raiseShrineChanged();   // la barre des bénédictions se redessine
                    }
                } catch (eMir) {}
            }

            // v3.14 : miracles par île, relevés au Temple.
            // { <islandId>: { name, activeEnd, cooldownEnd, position, cityId, readAt } } ; heures locales en ms.
            var islandMiracleData = new Data.Value('islandMiracles', {}, { version: 1 });

            // Le jeu donne la fin en secondes serveur (enddate) avec l'heure serveur (currentdate) :
            // on garde l'écart, ajouté à l'heure locale, pour ne pas dépendre du réglage de l'horloge.
            function _impCountdownEnd(entry) {
                var c = entry && entry.countdown;
                if (!c || !c.enddate || !c.currentdate) return null;
                var left = (parseInt(c.enddate, 10) - parseInt(c.currentdate, 10)) * 1000;
                return left > 0 ? Date.now() + left : null;
            }

            function readTempleMiracle(data) {
                if (!data) return null;
                var name = data['js_WonderTextHead'];
                if (name && typeof name === 'object') name = name.text;
                name = $.trim(String(name || ''));
                if (!name) return null;
                // v3.15 : « Forge de Héphaïstos (Niveau 5/5) » -> nom + niveau
                var level = null, lm = /\s*\((?:Niveau|Level)\s*(\d+)[^)]*\)\s*$/i.exec(name);
                if (lm) { level = parseInt(lm[1], 10); name = $.trim(name.slice(0, lm.index)); }
                var activeEnd = _impCountdownEnd(data['js_WonderTextDuration']);
                var cooldownEnd = _impCountdownEnd(data['js_WonderTextCooldown']);
                var txt = function(k) { var v = data[k]; if (v && typeof v === 'object') v = v.text; return $.trim(String(v || '')); };
                var act = data['js_WonderActivateButton'];
                var position = null;
                var req = (data['js_WonderTextDuration'] && data['js_WonderTextDuration'].countdown &&
                           data['js_WonderTextDuration'].countdown.timeout_ajaxrequest) || (act && act.href) || '';
                var pm = /position=(\d+)/.exec(String(req));
                if (pm) position = parseInt(pm[1], 10);
                var view = data['js_WonderViewButton'];
                var im = /islandId=(\d+)/.exec(String((view && view.href) || ''));
                return { name: name, level: level, activeEnd: activeEnd, cooldownEnd: cooldownEnd, position: position,
                         canActivate: !!(act && act.buttonState === 'enabled'),
                         islandId: im ? parseInt(im[1], 10) : null,
                         durationText: activeEnd ? '' : txt('js_WonderTextDurationText').replace(/<[^>]*>/g, ''),
                         cooldownText: cooldownEnd ? '' : txt('js_WonderTextCooldownText').replace(/<[^>]*>/g, '') };
            }

            function getIslandMiracles() {
                return islandMiracleData.get();
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
                // v3.6 : points accumulés, points/h et coût de la prochaine recherche par domaine
                try {
                    var advisor = readResearchAdvisorNumbers(data);
                    if (advisor) civData._updateResearchAdvisorData(advisor);
                } catch (eAdv) {}
                raiseCivilizationDataChanged(changes);
            }

            // v3.6 : nombre du jeu (« 3 360 298 », « 1 081,84 ») ; NaN si absent
            function parseGameNumber(value) {
                if (value && typeof value === 'object') value = value.text;
                if (value === undefined || value === null) return NaN;
                var s = String(value).replace(/[\s\u00a0\u202f]/g, '');
                if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');      // 1.081,84
                else if (/\.\d{1,2}$/.test(s)) s = s.replace(/,/g, '');                  // 1,081.84
                else s = s.replace(/[.,]/g, '');                                         // 3.360.298
                return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
            }

            function readResearchAdvisorNumbers(data) {
                var points = parseGameNumber(data['js_researchAdvisorPoints']);
                var perHour = parseGameNumber(data['js_researchAdvisorTime']);
                if (isNaN(points)) return null;
                var domains = [];
                for (var i = 0; i < 10; i++) {
                    if (!(('js_researchAdvisorNextResearchCost' + i) in data)) break;
                    var cost = parseGameNumber(data['js_researchAdvisorNextResearchCost' + i]);
                    var name = data['js_researchAdvisorNextResearchName' + i] || '';
                    var domain = data['js_researchAdvisorChangeResearchTypeTxt' + i] || '';
                    domains.push({ domain: String(domain), name: String(name), cost: isNaN(cost) ? 0 : cost });
                }
                return { points: points, perHour: isNaN(perHour) ? 0 : perHour, domains: domains, updated: Date.now() };
            }
