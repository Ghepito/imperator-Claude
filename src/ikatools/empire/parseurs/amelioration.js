
            // ============================================================
            // v2.07 : Capture du VRAI coût d'agrandissement depuis le jeu.
            // Le modèle de la vue ville ne contient pas les coûts : ils sont
            // uniquement dans le panneau latéral "#buildingUpgrade" affiché à
            // l'ouverture d'un bâtiment. On le lit et on le met en cache sur
            // l'objet City.Building (persiste via le reviver), pour remplacer
            // les tables codées en dur (périmées) dans le tooltip.
            // ============================================================
            function processBuildingUpgradeView(viewHtml) {
                setTimeout(function parseBuildingUpgrade() {
                    try {
                        var $box = null;
                        if (viewHtml && viewHtml.indexOf('buildingUpgrade') >= 0) {
                            $box = $('<div>').html(viewHtml).find('#buildingUpgrade');
                        }
                        if (!$box || !$box.length) $box = $('#buildingUpgrade');   // repli DOM live
                        if (!$box || !$box.length) return;

                        // cityId / position / niveau courant depuis le bouton "Développer"
                        var href = $box.find('#js_buildingUpgradeButton').attr('href') ||
                                   $box.find('a[href*="cityId="]').first().attr('href') || '';
                        var cM = href.match(/cityId=(\d+)/), pM = href.match(/position=(\d+)/), lM = href.match(/level=(\d+)/);
                        var cityId = cM ? parseInt(cM[1], 10) : null;
                        var position = pM ? parseInt(pM[1], 10) : null;
                        var level = lM ? parseInt(lM[1], 10) : null;
                        if (level == null) {
                            var lt = ($box.find('.showLevel').text() || '').match(/(\d+)/);
                            if (lt) level = parseInt(lt[1], 10);
                        }
                        if (cityId == null || position == null || level == null) return;

                        // Coûts réels (classe crystal = verre). Les libellés ne contiennent
                        // aucun chiffre, donc on extrait le nombre du title en retirant tout non-digit.
                        var cost = { wood:0, wine:0, marble:0, glass:0, sulfur:0, time:0,
                                     forLevel: level, updated: Date.now() };
                        var classMap = { wood:'wood', wine:'wine', marble:'marble', crystal:'glass', sulfur:'sulfur' };
                        $box.find('ul.resources > li').each(function() {
                            var $li = $(this), cls = ($li.attr('class') || '').split(/\s+/);
                            if ($.inArray('time', cls) >= 0) {
                                // Exclure le tooltip interne (qui répète "21m 18s") avant de parser.
                                var timeTxt = $li.clone().children('div').remove().end().text();
                                var t = _impParseDurationMs(timeTxt);
                                if (t != null) cost.time = t;
                                return;
                            }
                            var key = null;
                            for (var i = 0; i < cls.length; i++) { if (classMap[cls[i]]) { key = classMap[cls[i]]; break; } }
                            if (!key) return;
                            var amtSrc = $li.attr('title') || $li.text();
                            var amt = parseInt(String(amtSrc).replace(/[^0-9]/g, ''), 10);
                            if (!isNaN(amt)) cost[key] = amt;
                        });

                        var city = getCity(cityId);
                        var building = city && city.getBuildingByPosition ? city.getBuildingByPosition(position) : null;
                        if (building) {
                            building.realUpgradeCost = cost;
                            empireData.save();
                        }
                    } catch(e) {
                        console.warn('[Imperator] processBuildingUpgradeView a échoué', e);
                    }
                }, 0);
            }
