
            // Parser le Bilan depuis le DOM live (fallback si AJAX non intercepté)
            var _bilanLastParsed = 0;
            function parseBilanDomIfVisible() {
                try {
                    // Anti-double-parse : attendre 3s minimum entre deux parsings
                    if (Date.now() - _bilanLastParsed < 3000) return;
                    // Chercher td.city dans le DOM (spécifique au Bilan)
                    var $cityCells = $('td.city');
                    if (!$cityCells.length) return;
                    // Vérifier que le conteneur ressemble au Bilan
                    var $container = $cityCells.first().closest('table').closest('div, section, article');
                    if (!$container.length) $container = $cityCells.first().closest('table').parent();
                    var html = $container.length ? $container[0].outerHTML : '';
                    if (!html) return;
                    if (html.indexOf('Montant') < 0 && html.indexOf('Dieux') < 0 && html.indexOf('Pluton') < 0) return;
                    _bilanLastParsed = Date.now();
                    processFinancesView(null, html);
                } catch(e) {}
            }

            // Hook createTemplateView dans le bon scope (parseBilanDomIfVisible accessible ici)
            (function hookCreateTemplateView() {
                try {
                    var orig = unsafeWindow.ikariam.createTemplateView;
                    if (orig && !orig.__imperatorHooked) {
                        unsafeWindow.ikariam.createTemplateView = function() {
                            var result = orig.apply(this, arguments);
                            setTimeout(parseBilanDomIfVisible, 300);
                            return result;
                        };
                        unsafeWindow.ikariam.createTemplateView.__imperatorHooked = true;
                    }
                } catch(e) {}
            })();

            function processFinancesView(data, viewHtmlStr) {
                var cities = getOwnCities();
                var scientistCost = 6;
                if (getCivilizationData().hasResearched(Constants.Research.Science.LETTER_CHUTE)) {
                    scientistCost = 3;
                }
                var changes = [];
                // Le parsing scientifiques est maintenant intégré dans parseBilanFromHtml

                // Parser le Bilan depuis son HTML (fiable, sans dépendance DOM live)
                if (viewHtmlStr) {
                    setTimeout(function parseBilanFromHtml() {
                        try {
                            var $b = $('<div>').html(viewHtmlStr);
                            var goldUpd = { incomeUpdated: Date.now() };
                            var found = 0;

                            // Helper: lire la valeur numérique d'une cellule
                            // - supprime les div.tooltip (valeurs décimales)
                            // - gère &nbsp; (\u00a0) comme séparateur de milliers
                            // - lit le <span> pour les valeurs négatives
                            function cellVal($td) {
                                if (!$td || !$td.length) return NaN;
                                var $span = $td.find('span').first();
                                var src   = $span.length ? $span.text() : $td.clone().find('div').remove().end().text();
                                var raw   = src.replace(/\u00a0/g,'').replace(/\s/g,'').replace(/[^0-9\-]/g,'');
                                return parseInt(raw);
                            }

                            // 1. Or actuel : ligne 'Montant de l\'or'
                            $b.find('tr').each(function() {
                                var lbl = $(this).find('td').first().text().toLowerCase();
                                if (lbl.indexOf('montant') < 0) return;
                                // v2.24 : la valeur est en 2e cellule (la dernière est l'offre premium) ;
                                // son infobulle donne le montant exact ("600 205 849,78").
                                var $val = $(this).find('td').eq(1);
                                var exact = $val.find('div.tooltip').first().text()
                                                .replace(/[\u00a0\u202f\s]/g,'').replace(',','.');
                                if (/^\d+(\.\d+)?$/.test(exact)) {
                                    goldUpd.current = Math.round(parseFloat(exact));
                                    goldUpd.currentUpdated = Date.now(); found++;
                                    return false;
                                }
                                var raw = $val.clone().find('div').remove().end().text();
                                raw = raw.replace(/\u00a0/g,'').replace(/\s/g,'').replace(',','.');
                                var g = 0;
                                if (/[0-9.]+G/i.test(raw)) g = Math.round(parseFloat(raw)*1e9);
                                else if (/[0-9.]+M/i.test(raw)) g = Math.round(parseFloat(raw)*1e6);
                                else if (/[0-9.]+k/i.test(raw)) g = Math.round(parseFloat(raw)*1e3);
                                else g = parseInt(raw.replace(/[^0-9]/g,'')) || 0;
                                if (g > 0) { goldUpd.current = g; goldUpd.currentUpdated = Date.now(); found++; }
                                return false;
                            });

                            // 2. Per-ville : td.city contient le nom
                            // Structure : [nom][revenu][scientifiques][résultat]
                            $b.find('td.city').each(function() {
                                var cityName = $(this).text().trim();
                                var $row     = $(this).closest('tr');
                                var $cells   = $row.find('td');
                                if ($cells.length < 4) return;
                                $.each(cities, function(i, city) {
                                    // Garde null : ignorer les entrées invalides
                                    if (!city || typeof city.getName !== 'function') return;
                                    var cName = city.getName();
                                    if (cityName !== cName && cityName !== 'G - '+cName &&
                                        cityName.replace(/^G\s*-\s*/,'') !== cName) return;
                                    // Or net par ville (dernière colonne = Résultat)
                                    var res = cellVal($($cells[$cells.length - 1]));
                                    if (!isNaN(res)) {
                                        city.cityGoldNet        = res;
                                        city.cityGoldNetUpdated = Date.now();
                                    }
                                    // Scientifiques (3ème colonne, valeur négative)
                                    // v3.2 : seulement si l'académie n'a jamais été lue. Le coût d'un
                                    // chercheur varie (recherches, forme de gouvernement) : un nombre
                                    // déduit du coût peut être faux et ne doit pas écraser un relevé.
                                    if ($cells.length >= 3 && !city.getScientistsReadAt()) {
                                        var sciCost = cellVal($($cells[2]));
                                        if (!isNaN(sciCost) && sciCost < 0) {
                                            var sciCount = Math.round(-sciCost / scientistCost);
                                            if (sciCount >= 0) city._updateScientists(sciCount, changes);
                                        }
                                    }
                                });
                            });
                            if (changes.length) raiseResourcesChanged(changes);

                            // 3. Lignes non-ville par texte (Dieux, Augmentez, Revenu, Entretien)
                            $b.find('tr').each(function() {
                                var $cells = $(this).find('td');
                                if (!$cells.length) return;
                                // Ignorer les lignes de ville et les lignes sigma
                                if ($cells.filter('.city').length || $cells.filter('.sigma').length) return;
                                var label = $cells.first().clone().find('div').remove().end()
                                                  .text().replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
                                var lc = label.toLowerCase();
                                // v2.24 : première cellule chiffrée après le libellé (la dernière peut être vide)
                                var num = NaN;
                                for (var ci = 1; ci < $cells.length && isNaN(num); ci++) num = cellVal($($cells[ci]));
                                if (isNaN(num)) return;
                                if (lc.indexOf('dieux') >= 0 || lc.indexOf('pluton') >= 0)   { goldUpd.gods    = num; found++; }
                                else if (lc.indexOf('entretien') >= 0)                       { goldUpd.upkeep  = -(Math.abs(num)); found++; }
                                else if (lc.indexOf('premium') >= 0 || lc.indexOf('augmentez') >= 0) { goldUpd.premium = num; found++; }
                                // v2.24 : la ligne « Revenu » du total inclut Pluton et déduit les scientifiques :
                                // le revenu est désormais la somme de la colonne Revenu des villes (comme ikariam.model).
                            });

                            // v2.24 : revenu des villes (colonne 2) et coût des scientifiques (ligne Somme, colonne 3)
                            var cityRevenue = 0, cityRows = 0;
                            $b.find('td.city').each(function() {
                                var $c = $(this).closest('tr').find('td');
                                var v = cellVal($($c[1]));
                                if (!isNaN(v)) { cityRevenue += v; cityRows++; }
                            });
                            if (cityRows > 0) { goldUpd.revenue = cityRevenue; found++; }
                            $b.find('tr.result').each(function() {
                                var $c = $(this).find('td');
                                if (!$c.first().hasClass('sigma') || $c.length < 4) return;
                                var sci = cellVal($($c[2]));
                                if (!isNaN(sci)) { goldUpd.scientists = -(Math.abs(sci)); found++; }
                                return false;
                            });

                            // 4. Lignes sigma (tr.result) : dernière = net
                            var sigmaResults = [];
                            $b.find('tr.result').each(function() {
                                var $valCells = $(this).find('td:not(.sigma)');
                                if (!$valCells.length) return;
                                var lastVal = cellVal($($valCells[$valCells.length - 1]));
                                if (!isNaN(lastVal)) sigmaResults.push(lastVal);
                            });
                            // Le dernier sigma = solde net final (après déduction de l'entretien armée)
                            if (sigmaResults.length > 0) { goldUpd.net = sigmaResults[sigmaResults.length - 1]; found++; }

                            if (found > 0) { getCivilizationData()._updateGoldData(goldUpd); raiseGoldChanged(); }
                        } catch(e) {}
                    }, 0);
                } else {
                    // Fallback: coût scientifiques calculé depuis données connues
                    try {
                        var totalSci = 0;
                        $.each(cities, function(i, c) {
                            if (!c || typeof c.getScientists !== 'function') return;
                            totalSci += (c.getScientists()||0) * scientistCost;
                        });
                        if (totalSci > 0) {
                            getCivilizationData()._updateGoldData({ scientists: -totalSci, incomeUpdated: Date.now() });
                            raiseGoldChanged();
                        }
                    } catch(e) {}
                }
                if (changes.length) raiseResourcesChanged(changes);
            }
