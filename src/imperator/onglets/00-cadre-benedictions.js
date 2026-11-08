        // v2.41 : accès à la fenêtre d'Imperator pour les onglets, renseigné par 99-popup-menu
        // (les onglets ne dépendent plus du fichier qui les assemble).
        var _impPopupProvider = null;
        function impPopup() { return _impPopupProvider(); }

        function Tab(name, tabText, tabContentHolder, tabContentId, init, renderer) {
            this.updateables = new Updateables(name);

            var render = renderer.bind(this);
            this.mainUpdateable = this.updateables.createPermanent(tabContentId);
            this.mainUpdateable.registerUpdate('redraw', function(element) {
                element.removeClass(
                    'city_type_ownCity city_type_deployedCities city_type_occupiedCities');
                element.addClass('city_type_' + IkaTools.View.getCurrentCity().getType());
                element.html(render());
            });
            this.mainUpdateable.registerUpdate('cityChanged', function updateTabTableType(table) {
                table.removeClass(
                    'city_type_ownCity city_type_deployedCities city_type_occupiedCities');
                table.addClass('city_type_' + IkaTools.View.getCurrentCity().getType());
            });

            this.isActive = false;
            this.needsRedraw = true;
            this.render = renderer; // réactivé

            var tab = this;
            this.initFirstTime = IkaTools.Utils.thunk(function() {
                IkaTools.View.registerIkariamAjaxResponseCallback(function tab_CityChanged() {
                    tab.updateables.updateForEvent('cityChanged');
                    tab.maybeRedraw(true);
                });
                init.call(tab);
            });

            this.tab = new IkaTools.UI.TabPane.Tab(
                $('<b>%s</b>'.format(tabText)),
                tabContentHolder,
                {
                    activatedCallback: function() {
                        this.isActive = true;
                        this.maybeRedraw();
                        this.initFirstTime();
                        this.updateables.activate();


                    }.bind(this),
                    deactivatedCallback: function() {
                        this.isActive = false;
                        this.updateables.deactivate();
                    }.bind(this),
                });
        }

        $.extend(Tab.prototype, {
            maybeRedraw: function maybeRedraw(redraw) {
                this.needsRedraw = this.needsRedraw || redraw;
                if (this.isActive && this.needsRedraw) {
                    this.updateables.clear();
                    this.mainUpdateable.updateForEvent('redraw');
                    this.needsRedraw = false;
                }
            },
            getTab: function getTab() {
                return this.tab;
            }
        });

        // ============================================================
        // v2.13 : Bénédictions divines — repères visuels (onglet Ressources)
        // Source : Sanctuaire divin (onglets Vénérer + Vue générale, même réponse).
        // Mécanique (wiki Ikariam, vérifiée niv. 49 -> 101 %) :
        //   bénédiction max      = 3 + 2 × niveau du Sanctuaire
        //   bénédiction par ville = max × (0,4 + 0,6 × jauge / 1000)
        //   chaque don de 100 faveurs relance la protection à 3 jours ;
        //   protection écoulée => la jauge baisse (vitesse encore inconnue).
        // États : max (jauge 1000 + protection) / soon (fin de protection proche)
        //         weak (en baisse) / floor (jauge 0, bonus de base 40 %).
        // ============================================================
        var IMP_GODS = {
            // resource : ressource dont la production est bénie.
            // Pan -> bois : hypothèse (recherche « Seigneur des bois »), à confirmer.
            // Tyché : inconnue -> repli sur la ressource de luxe de la ville.
            '1': { name:'Pan',        color:'#7cb342', bg:'rgba(124,179,66,0.15)',  resource:'wood'   },
            '2': { name:'Dionysos',   color:'#9b5fc0', bg:'rgba(155,95,192,0.15)',  resource:'wine'   },
            '3': { name:'Tyché',      color:'#ec407a', bg:'rgba(236,64,122,0.15)',  resource:null     },
            '4': { name:'Pluton',     color:'#d4a017', bg:'rgba(212,160,23,0.15)',  resource:'gold'   },
            '5': { name:'Théia',      color:'#26c6da', bg:'rgba(38,198,218,0.15)',  resource:'glass'  },
            '6': { name:'Héphaïstos', color:'#c98a1a', bg:'rgba(201,138,26,0.15)',  resource:'sulfur' }
        };
        var IMP_BLESS_STALE_MS = 24 * 3600 * 1000; // au-delà : données jugées anciennes
        var IMP_BLESS_FAVOR_MAX = 1000;

        function impBlessSoonMs() {
            var h = parseInt(blessSoonThreshold && blessSoonThreshold.getValue ? blessSoonThreshold.getValue() : '12', 10);
            return (isFinite(h) && h > 0 ? h : 12) * 3600 * 1000;
        }

        function impBlessShrine() {
            try {
                var civ = IkaTools.EmpireData.getCivilizationData();
                return (civ && civ.getShrineData) ? civ.getShrineData() : {};
            } catch (e) { return {}; }
        }

        // Ville qui possède le Sanctuaire (+ position et niveau)
        function impBlessShrineCity() {
            try {
                var cities = IkaTools.EmpireData.getOwnCities();
                for (var i = 0; i < cities.length; i++) {
                    var b = cities[i] && cities[i].getBuildingByType
                        ? cities[i].getBuildingByType(IkaTools.Constants.Buildings.DIVINE_SANCTUARY) : null;
                    if (b) return { city: cities[i],
                                    position: b.getPosition ? b.getPosition() : null,
                                    level: b.getLevel ? parseInt(b.getLevel(), 10) : null };
                }
            } catch (e) {}
            return null;
        }

        // Bénédiction lue la plus haute (repli si le niveau du Sanctuaire est inconnu)
        function impBlessRefBonus() {
            var ref = null;
            try {
                $.each(IkaTools.EmpireData.getOwnCities(), function(i, c) {
                    var b = c && c.worshipGodBonus;
                    if (typeof b === 'number' && isFinite(b) && (ref === null || b > ref)) ref = b;
                });
            } catch (e) {}
            return ref;
        }

        // Bénédiction maximale : 3 + 2 × niveau (repli : plus haute valeur lue)
        function impBlessMaxBonus(refBonus) {
            var s = impBlessShrineCity();
            if (s && s.level && isFinite(s.level) && s.level > 0) return 3 + 2 * s.level;
            return (refBonus !== undefined) ? refBonus : impBlessRefBonus();
        }

        // Bénédiction par ville pour une jauge donnée
        function impBlessBonusForFavor(maxBonus, favor) {
            if (maxBonus === null || maxBonus === undefined || favor === null || favor === undefined) return null;
            var f = Math.max(0, Math.min(IMP_BLESS_FAVOR_MAX, favor));
            return maxBonus * (0.4 + 0.6 * f / IMP_BLESS_FAVOR_MAX);
        }

        // État à un instant donné (aussi utilisé par le ticker).
        // favor : jauge lue (null si inconnue) ; weakFlag : repli sur la bénédiction lue.
        function impBlessStateAt(graceEnd, favor, weakFlag, now) {
            if (favor === 0) return 'floor';
            var full = (favor === null || favor === undefined) ? !weakFlag : favor >= IMP_BLESS_FAVOR_MAX;
            if (!full) return 'weak';
            if (!graceEnd) return 'max'; // pas de durée connue : on se fie à la jauge
            var rem = graceEnd - now;
            if (rem <= 0) return 'weak'; // protection écoulée : la jauge baisse
            if (rem <= impBlessSoonMs()) return 'soon';
            return 'max';
        }

        // Toutes les infos de bénédiction d'une ville (null si aucun dieu)
        function impBlessInfo(city, refBonus) {
            if (!city || !city.worshipGodId) return null;
            var gid = String(city.worshipGodId);
            var meta = IMP_GODS[gid];
            if (!meta) return null;
            var sd = impBlessShrine();
            var g = (sd.gods && sd.gods[gid]) || null;
            var now = Date.now();
            if (refBonus === undefined) refBonus = impBlessRefBonus();
            var maxBonus = impBlessMaxBonus(refBonus);
            var readBonus = (typeof city.worshipGodBonus === 'number' && isFinite(city.worshipGodBonus)) ? city.worshipGodBonus : null;
            var favor = (g && typeof g.favor === 'number' && isFinite(g.favor)) ? g.favor : null;
            // Bénédiction : calculée depuis la jauge (exacte), sinon celle lue dans Vénérer
            var bonus = (favor !== null) ? impBlessBonusForFavor(maxBonus, favor) : readBonus;
            var weakFlag = (favor === null && readBonus !== null && maxBonus !== null && readBonus < maxBonus - 0.01);
            var graceEnd = g ? g.graceEnd : null;
            return {
                godId: gid, name: meta.name, color: meta.color, bg: meta.bg,
                resource: meta.resource || (city.getTradeGoodType ? city.getTradeGoodType() : null),
                favor: favor, maxBonus: maxBonus, bonus: bonus,
                graceEnd: graceEnd, weakFlag: weakFlag,
                stale: !g || (now - (sd.godsUpdated || 0) > IMP_BLESS_STALE_MS),
                lastUpdate: Math.max(sd.godsUpdated || 0, city.worshipGodUpdated || 0),
                state: impBlessStateAt(graceEnd, favor, weakFlag, now)
            };
        }

        function impBlessFmtRemaining(ms) {
            if (ms === null || ms === undefined || !isFinite(ms)) return '?';
            if (ms <= 0) return 'terminée';
            var m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mn = m % 60;
            if (d > 0) return d + 'j ' + h + 'h';
            if (h > 0) return h + 'h ' + (mn < 10 ? '0' : '') + mn + 'm';
            return mn + 'm';
        }

        function impBlessFmtAgo(ts) {
            if (!ts) return 'jamais';
            var m = Math.floor((Date.now() - ts) / 60000);
            if (m < 1) return "à l'instant";
            if (m < 60) return 'il y a ' + m + ' min';
            var h = Math.floor(m / 60);
            if (h < 48) return 'il y a ' + h + ' h';
            return 'il y a ' + Math.floor(h / 24) + ' j';
        }

        function impBlessFmtPct(v) {
            return (v === null || v === undefined || !isFinite(v)) ? '?' : v.toFixed(1).replace('.', ',') + ' %';
        }

        var IMP_BLESS_STATE_LABEL = { max:'Au max', soon:'Fin de protection proche', weak:'En baisse', floor:'Plancher' };

        function impBlessStateClasses(state, stale) {
            return 'imp-bless imp-bless-' + state + (stale ? ' imp-bless-stale' : '');
        }

        // Attributs lus par le ticker pour faire évoluer l'état sans redessiner
        function impBlessDataAttrs(info) {
            return ' data-imp-bless-end="' + (info.graceEnd || 0) + '"' +
                   ' data-imp-bless-favor="' + (info.favor === null || info.favor === undefined ? '' : info.favor) + '"' +
                   ' data-imp-bless-weak="' + (info.weakFlag ? 1 : 0) + '"' +
                   ' style="--imp-bless-c:' + info.color + ';--imp-bless-bg:' + info.bg + '"';
        }

        // Texte court d'une pastille du bandeau
        function impBlessChipLabel(state, graceEnd, favor, now) {
            if (state === 'max' || state === 'soon') return graceEnd ? impBlessFmtRemaining(graceEnd - now) : 'au max';
            if (state === 'floor') return 'plancher';
            if (favor !== null && favor !== undefined && favor < IMP_BLESS_FAVOR_MAX) return favor + '/' + IMP_BLESS_FAVOR_MAX;
            return 'en baisse';
        }

        // Contenu de l'infobulle (régénéré chaque seconde via registerRefreshable)
        function impBlessToolTipHtml(info, productionPerHour) {
            var now = Date.now();
            var state = impBlessStateAt(info.graceEnd, info.favor, info.weakFlag, now);
            var lowered = (state === 'weak' || state === 'floor');
            // Protection écoulée depuis la lecture : la jauge lue n'est plus d'actualité
            var driftSinceRead = info.graceEnd && info.graceEnd <= now &&
                                 info.favor !== null && info.favor >= IMP_BLESS_FAVOR_MAX;
            var rows = [];
            rows.push('<div class="imp-bless-tt-head" style="color:' + info.color + '">' + info.name +
                      ' <span class="imp-bless-tt-state imp-bless-tt-' + state + '">' + IMP_BLESS_STATE_LABEL[state] + '</span></div>');

            // Protection
            if (info.graceEnd && info.graceEnd > now) {
                rows.push('<div>Protection : encore <b>' + impBlessFmtRemaining(info.graceEnd - now) + '</b></div>');
            } else if (info.graceEnd) {
                rows.push('<div>Protection : <b>terminée</b>, la jauge baisse</div>');
            } else {
                rows.push('<div>Protection : <i>inconnue</i></div>');
            }

            // Jauge + bénédiction
            if (info.favor !== null) {
                rows.push('<div>Jauge : <b>' + info.favor + ' / ' + IMP_BLESS_FAVOR_MAX + '</b>' +
                          (driftSinceRead ? ' <i>(à la lecture)</i>' : '') + '</div>');
            }
            if (info.bonus !== null) {
                rows.push('<div>Bénédiction : <b>' + impBlessFmtPct(info.bonus) + '</b>' +
                          (info.maxBonus !== null && lowered && !driftSinceRead ? ' sur ' + impBlessFmtPct(info.maxBonus) : '') +
                          (driftSinceRead ? ' <i>(à la lecture)</i>' : '') + '</div>');
            }

            // Production (hors Pluton) : part divine au max, manque à gagner sinon.
            // prod × b / (100 + b) et prod × (max − b) / (100 + b) : ignorent les autres bonus
            // (Cinématorium...) => légère surestimation, d'où le « ≈ ».
            if (info.resource !== 'gold' && productionPerHour > 0 && info.bonus !== null) {
                if (!lowered) {
                    rows.push('<div>Part divine ≈ <b>+' + IkaTools.Intl.formatInteger(productionPerHour * info.bonus / (100 + info.bonus)) + '/h</b></div>');
                } else if (!driftSinceRead && info.maxBonus !== null && info.maxBonus > info.bonus) {
                    rows.push('<div class="imp-bless-tt-warn">Manque à gagner ≈ <b>−' +
                              IkaTools.Intl.formatInteger(productionPerHour * (info.maxBonus - info.bonus) / (100 + info.bonus)) + '/h</b></div>');
                }
            }

            // Ce qu'il faut donner
            if (lowered) {
                if (info.favor !== null && info.favor < IMP_BLESS_FAVOR_MAX) {
                    rows.push('<div>Pour revenir au max : <b>' + (IMP_BLESS_FAVOR_MAX - info.favor) + ' faveurs</b>' +
                              (info.maxBonus !== null ? ' (+' + impBlessFmtPct(info.maxBonus * 0.06) + ' par tranche de 100)' : '') + '</div>');
                } else {
                    rows.push('<div>Ouvrez le Sanctuaire pour lire la jauge actuelle.</div>');
                }
            }

            rows.push('<div class="imp-bless-tt-foot">Sanctuaire lu ' + impBlessFmtAgo(info.lastUpdate) +
                      (info.stale ? ', ouvrez-le pour actualiser' : '') + '</div>');
            return '<div class="imp-bless-tt">' + rows.join('') + '</div>';
        }

        // Bandeau de pastilles au-dessus du tableau (rendu dans un <caption>)
        function impBlessMakeCaption() {
            var sd = impBlessShrine();
            var ref = impBlessRefBonus();
            var counts = {}, weakByGod = {};
            $.each(IkaTools.EmpireData.getOwnCities(), function(i, c) {
                var info = impBlessInfo(c, ref);
                if (!info) return;
                counts[info.godId] = (counts[info.godId] || 0) + 1;
                if (info.weakFlag) weakByGod[info.godId] = true;
            });
            var ids = $.map(counts, function(v, k) { return k; });
            if (!ids.length) return '';
            var now = Date.now();
            var rank = { floor:0, weak:1, soon:2, max:3 };
            var toGive = 0, unknownGive = false;
            var rows = $.map(ids, function(gid) {
                var g = (sd.gods && sd.gods[gid]) || null;
                var favor = (g && typeof g.favor === 'number') ? g.favor : null;
                var end = g ? g.graceEnd : null;
                var state = impBlessStateAt(end, favor, !!weakByGod[gid], now);
                if (state === 'weak' || state === 'floor') {
                    if (favor !== null && favor < IMP_BLESS_FAVOR_MAX) toGive += IMP_BLESS_FAVOR_MAX - favor;
                    else unknownGive = true;
                }
                return { gid: gid, favor: favor, end: end, state: state };
            });
            // Tri : les plus urgents d'abord (plancher, en baisse, puis fin de protection la plus proche)
            rows.sort(function(a, b) {
                if (rank[a.state] !== rank[b.state]) return rank[a.state] - rank[b.state];
                return (a.end || Infinity) - (b.end || Infinity);
            });
            var stale = !sd.godsUpdated || (now - sd.godsUpdated > IMP_BLESS_STALE_MS);
            var chips = $.map(rows, function(r) {
                var meta = IMP_GODS[r.gid];
                var info = { graceEnd: r.end, favor: r.favor, weakFlag: !!weakByGod[r.gid], color: meta.color, bg: meta.bg };
                return '<a href="javascript:void(0);" class="imp-bless-chip ' + impBlessStateClasses(r.state, false) + '"' +
                       impBlessDataAttrs(info) + ' title="Ouvrir le Sanctuaire divin">' +
                       '<span class="imp-bless-dot"></span>' + meta.name + ' (' + counts[r.gid] + ')' +
                       ' <span class="imp-bless-rem">' + impBlessChipLabel(r.state, r.end, r.favor, now) + '</span></a>';
            }).join('');
            var give = '';
            if (toGive > 0 || unknownGive) {
                give = '<span class="imp-bless-bar-give">À donner : <b>' + (toGive > 0 ? IkaTools.Intl.formatInteger(toGive) : '') +
                       (unknownGive ? (toGive > 0 ? ' + ?' : '?') : '') + '</b>' +
                       (sd.favor ? ' / ' + IkaTools.Intl.formatInteger(sd.favor) + ' disponibles' : '') + '</span>';
            }
            return '<caption class="imp-bless-bar">' +
                   '<span class="imp-bless-bar-label">Bénédictions</span>' + chips + give +
                   '<span class="imp-bless-bar-upd' + (stale ? ' is-stale' : '') + '">Sanctuaire lu ' +
                   impBlessFmtAgo(sd.godsUpdated) + '</span></caption>';
        }

        // CSS + ticker + clic des pastilles : installés une seule fois
        var _impBlessInstalled = false;
        function impBlessInstallOnce() {
            if (_impBlessInstalled) return;
            _impBlessInstalled = true;
            GM_addStyle(
                '#ImperatorOverviewResourceTable td.imp-bless { position:relative; background-color:var(--imp-bless-bg) !important; box-shadow:inset 0 0 0 2px var(--imp-bless-c); }' +
                '#ImperatorOverviewResourceTable td.imp-bless-soon::after { content:""; position:absolute; top:2px; right:2px; width:7px; height:7px; border-radius:50%; background:#ef6c00; box-shadow:0 0 0 1px #fff8e1; }' +
                '#ImperatorOverviewResourceTable td.imp-bless-weak { background-color:rgba(192,57,43,0.07) !important; box-shadow:inset 0 0 0 2px rgba(192,57,43,0.55); background-image:repeating-linear-gradient(135deg, transparent 0 5px, rgba(192,57,43,0.08) 5px 7px); }' +
                '#ImperatorOverviewResourceTable td.imp-bless-floor { background-color:rgba(0,0,0,0.04) !important; box-shadow:inset 0 0 0 2px #a1978a; }' +
                '#ImperatorOverviewResourceTable td.imp-bless-stale::before { content:"\\23F1"; position:absolute; bottom:1px; right:2px; font-size:9px; line-height:9px; opacity:.55; }' +
                '.imp-bless-badge { display:inline-block; width:11px; height:11px; margin-left:4px; vertical-align:-1px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #ffe082, var(--imp-bless-c) 70%); box-shadow:0 0 0 1px rgba(90,62,27,.45); cursor:help; position:relative; }' +
                '.imp-bless-badge.imp-bless-soon { box-shadow:0 0 0 2px #ef6c00; }' +
                '.imp-bless-badge.imp-bless-weak { background:radial-gradient(circle at 35% 35%, #f3e5c0, #bfa36a 70%); box-shadow:0 0 0 1px #c0392b; }' +
                '.imp-bless-badge.imp-bless-floor { background:#bdb3a0; box-shadow:0 0 0 1px #8a7f70; }' +
                '#ImperatorOverviewResourceTable caption.imp-bless-bar { caption-side:top; text-align:left; padding:3px 2px 5px; font-size:11px; color:#5a3e1b; white-space:normal; }' +
                '.imp-bless-bar-label { font-weight:bold; margin-right:6px; }' +
                '.imp-bless-chip { display:inline-block; margin:1px 5px 1px 0; padding:1px 7px 1px 5px; border-radius:9px; background:var(--imp-bless-bg); border:1px solid var(--imp-bless-c); color:#5a3e1b !important; text-decoration:none !important; cursor:pointer; }' +
                '.imp-bless-chip:hover, .imp-bless-chip:focus { background:#fff8e1; outline:none; box-shadow:0 0 0 1px var(--imp-bless-c); }' +
                '.imp-bless-chip .imp-bless-dot { display:inline-block; width:7px; height:7px; margin-right:4px; border-radius:50%; background:var(--imp-bless-c); vertical-align:0; }' +
                '.imp-bless-chip .imp-bless-rem { font-weight:bold; }' +
                '.imp-bless-chip.imp-bless-soon .imp-bless-rem { color:#ef6c00; }' +
                '.imp-bless-chip.imp-bless-weak { border-style:dashed; border-color:#c0392b; background:rgba(192,57,43,0.07); }' +
                '.imp-bless-chip.imp-bless-weak .imp-bless-rem { color:#c0392b; }' +
                '.imp-bless-chip.imp-bless-floor { border-color:#a1978a; background:rgba(0,0,0,0.04); }' +
                '.imp-bless-chip.imp-bless-floor .imp-bless-dot { background:#a1978a; }' +
                '.imp-bless-bar-give { margin-left:6px; }' +
                '.imp-bless-bar-upd { float:right; color:#8a6d39; font-style:italic; }' +
                '.imp-bless-bar-upd.is-stale { color:#c0392b; font-style:normal; font-weight:bold; }' +
                '.imp-bless-tt { margin-top:4px; padding:4px 6px; border-top:1px solid #d8b871; font-size:11px; line-height:1.45; color:#5a3e1b; min-width:190px; }' +
                '.imp-bless-tt-head { font-weight:bold; }' +
                '.imp-bless-tt-state { font-weight:normal; font-size:10px; margin-left:4px; padding:0 4px; border-radius:6px; color:#fff; }' +
                '.imp-bless-tt-max { background:#558b2f; } .imp-bless-tt-soon { background:#ef6c00; } .imp-bless-tt-weak { background:#c0392b; } .imp-bless-tt-floor { background:#8a7f70; }' +
                '.imp-bless-tt-warn { color:#c0392b; }' +
                '.imp-bless-tt-foot { color:#8a6d39; font-style:italic; margin-top:2px; }'
            );

            // Ticker : fait évoluer états et libellés sans redessiner le tableau
            setInterval(function impBlessTick() {
                try {
                    if (document.hidden) return; // v2.35 : onglet du navigateur en arrière-plan
                    var now = Date.now();
                    $('[data-imp-bless-end]').each(function() {
                        var $e = $(this);
                        var end = parseInt($e.attr('data-imp-bless-end'), 10) || null;
                        var fAttr = $e.attr('data-imp-bless-favor');
                        var favor = (fAttr === '' || fAttr === undefined) ? null : parseInt(fAttr, 10);
                        var weak = $e.attr('data-imp-bless-weak') === '1';
                        var state = impBlessStateAt(end, favor, weak, now);
                        $e.removeClass('imp-bless-max imp-bless-soon imp-bless-weak imp-bless-floor').addClass('imp-bless-' + state);
                        $e.find('.imp-bless-rem').text(impBlessChipLabel(state, end, favor, now));
                    });
                } catch (e) {}
            }, 30000);

            // Clic sur une pastille -> Sanctuaire divin, onglet Vue générale
            $(document).on('click', '.imp-bless-chip', function(ev) {
                ev.preventDefault();
                var s = impBlessShrineCity();
                if (!s) return;
                var params = { cityId: s.city.getId(), activeTab: 'tabOverview' };
                if (s.position !== null && s.position !== undefined) params.position = s.position;
                IkaTools.View.goToCityView(s.city, IkaTools.Constants.Buildings.DIVINE_SANCTUARY, params);
            });
        }

        function makeCityNameCells(table, city, excludeTradeGood) {
            var cityLink = new Link('CityLink_%s_%s'.format(table, city.getId()))
            .toCityActivation(city);
            // v2.12 : badge Pluton (bénédiction en or) dans l'onglet Ressources
            var blessBadge = '';
            if (table === 'resources') {
                try {
                    var bInfo = impBlessInfo(city);
                    if (bInfo && bInfo.resource === 'gold') {
                        var badgeId = 'ImpBlessBadge_' + city.getId();
                        blessBadge = '<span id="' + badgeId + '" class="imp-bless-badge imperator_tool_tip ' +
                                     impBlessStateClasses(bInfo.state, false) + '"' + impBlessDataAttrs(bInfo) + '></span>';
                        toolTips.registerRefreshable(badgeId, function() { return impBlessToolTipHtml(bInfo, 0); });
                    }
                } catch (eB) {}
            }
            return ('%s' +
                    '<td class="city_name">' +
                    '<a class="imperator_link" id="%s" href="javascript:void(0)">%s</a>' + blessBadge +
                    '</td>').format(
                (excludeTradeGood ? '' : ('<td class="city_tradegood imperator_link ">' +
                                          '<img src="/cdn/all/both/resources/icon_%s.png">' +
                                          '</td>').format(city.getTradeGoodType())),
                cityLink.getId(),
                __impH(city.getName()));
        }

        function makeCityNameColGroup(extraCols, excludeTradeGood) {
            return ('<colgroup class="city_name">' +
                    '%s' +
                    '<col class="city_name">' +
                    '%s' +
                    '</colgroup>').format(
                excludeTradeGood ? '' : '<col class="city_tradegood">',
                extraCols || '');
        }

        function makeCityNameHeaderCells(excludeTradeGood) {
            return '<th class="city_name" colspan="%s">%s</th>'.format(
                excludeTradeGood ? '1' : '2',
                localizer.localize('misc','city_name'));
        }
