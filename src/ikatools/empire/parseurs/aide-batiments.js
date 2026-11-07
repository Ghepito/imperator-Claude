
            // ============================================================
            // v2.31 : Aide des bâtiments (vue « buildingDetail » de l'encyclopédie).
            // La page donne, niveau par niveau, les coûts EXACTS du jeu (dans l'infobulle
            // de chaque case ; le texte visible est arrondi : « 1,50T »). On les garde
            // par type de bâtiment : getUpgradeCosts s'en sert avant les anciennes tables.
            // ============================================================

            // Le jeu ne nomme pas les colonnes : il met une image. Noms de fichiers relevés
            // le 7 nov. 2026 (jeu 17.6.1) sur l'aide de l'Académie et de la Résidence.
            var _IMP_HELP_COLUMNS = {
                'c3527b2f694fb882563c04df6d8972': 'wood',
                '94ddfda045a8f5ced3397d791fd064': 'wine',
                'fc258b990c1a2a36c5aeb9872fc08a': 'marble',
                '417b4059940b2ae2680c070a197d8c': 'glass',
                '5578a7dfa3e98124439cca4a387a61': 'sulfur',
                '465f0358d2cb09c07cd0f5a53e38eb': 'time',
            };
            var _IMP_HELP_RESOURCES = ['wood', 'wine', 'marble', 'glass', 'sulfur'];

            // { <type>: { levels: { <niveau>: { wood, wine, marble, glass, sulfur } }, updated } }
            var buildingHelpData = new Data.Value('buildingHelpCosts', {}, { version: 1 });

            function _impHelpInt(txt) {
                var s = String(txt == null ? '' : txt).replace(/[^0-9]/g, '');
                return s ? parseInt(s, 10) : null;
            }

            // Lit une page d'aide. Renvoie { type, levels, unknown } ou null si ce n'en est pas une.
            function parseBuildingDetailHtml(html) {
                if (!html) return null;
                var $root = $('<div></div>').append($.parseHTML(String(html), document, false));
                var $img = $root.find('div.buildingimg').first();
                var type = $.trim(String($img.parent('td').attr('class') || '')).split(/\s+/)[0];
                var known = false;
                $.each(Constants.Buildings, function(k, v) { if (v === type) known = true; });
                if (!type || !known) return null;

                var $table = $root.find('table').filter(function() {
                    return $(this).find('td.level').length > 0;
                }).first();
                if (!$table.length) return null;

                var columns = [], unknown = [];
                $table.find('tr').first().children('th').each(function(i) {
                    var key = null;
                    if (i > 0 && $(this).hasClass('costs')) {
                        var m = String($(this).find('img').attr('src') || '').match(/([0-9a-f]{20,})\.png/);
                        key = m ? (_IMP_HELP_COLUMNS[m[1]] || null) : null;
                        if (!key) unknown.push(m ? m[1] : '?');
                    }
                    columns.push(key);
                });

                var levels = {}, count = 0;
                $table.find('tr').each(function() {
                    var $tds = $(this).children('td');
                    if (!$tds.first().hasClass('level')) return;
                    var level = _impHelpInt($tds.first().text());
                    if (!level) return;
                    var costs = { wood: 0, wine: 0, marble: 0, glass: 0, sulfur: 0 };
                    $tds.each(function(i) {
                        var key = columns[i];
                        if (!key || key === 'time') return;
                        var $tip = $(this).find('div.tooltip').first();
                        var n = _impHelpInt($tip.length ? $tip.text() : $(this).text());
                        if (n !== null) costs[key] = n;
                    });
                    levels[level] = costs;
                    count++;
                });
                if (!count) return null;
                return { type: type, levels: levels, unknown: unknown };
            }

            function processBuildingDetailView(html) {
                try {
                    var r = parseBuildingDetailHtml(html);
                    if (!r) return;
                    if (r.unknown.length) {
                        // Une colonne non reconnue : on ne stocke rien plutôt qu'un coût faux.
                        console.warn('[Imperator] Aide des bâtiments (' + r.type + ') : colonne non reconnue (' +
                                     r.unknown.join(', ') + '), lecture ignorée');
                        return;
                    }
                    var store = buildingHelpData.get();
                    var entry = store[r.type] || (store[r.type] = { levels: {} });
                    $.extend(entry.levels, r.levels);
                    entry.updated = Date.now();
                    buildingHelpData.saveAsync();
                    var lv = $.map(r.levels, function(v, k) { return parseInt(k, 10); }).sort(function(a, b) { return a - b; });
                    console.log('[Imperator] Aide des bâtiments (' + r.type + ') : niveaux ' + lv[0] + ' à ' +
                                lv[lv.length - 1] + ' lus');
                } catch (e) {
                    console.warn('[Imperator] Lecture de l\'aide des bâtiments échouée', e);
                }
            }

            // Coût de base (avant réductions) pour CONSTRUIRE le niveau donné, ou null si inconnu.
            function getHelpCost(type, level) {
                var entry = type && buildingHelpData.get()[type];
                return (entry && entry.levels && entry.levels[level]) || null;
            }
