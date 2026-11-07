
        // ============================================================
        // v2.07 : helpers du bloc financier du Dashboard
        // ============================================================
        // v2.12 : dérivées de IMP_GODS (source unique des couleurs des dieux)
        var GOD_COLORS = {}, GOD_BG = {};
        $.each(IMP_GODS, function(id, g) { GOD_COLORS[g.name] = g.color; GOD_BG[g.name] = g.bg; });
        var _IMP_HORIZONS = {
            '1j':   { h:24,  end:'24h' },
            '1sem': { h:168, end:'7j'  },
            '1mois':{ h:720, end:'30j' }
        };
        var _impDashHorizon    = '1j';
        var _impDashGoldCache  = { current:0, net:0, hasData:false };
        var _impDashEventsBound = false;

        function _impFmtNum(n) {
            if (n == null || isNaN(n)) return '?';
            var s = n < 0 ? '-' : '', a = Math.abs(n);
            if (a >= 1e9) return s + (a/1e9).toFixed(1) + 'G';
            if (a >= 1e6) return s + (a/1e6).toFixed(1) + 'M';
            if (a >= 1e4) return s + Math.round(a/1e3) + 'k';
            return s + Math.round(a).toString();
        }
        function _impFmtS(n) {
            if (!isFinite(n) || n === 0) return '0';
            return (n > 0 ? '+' : '') + _impFmtNum(n);
        }

        // Construit le SVG de la courbe prospective (projection linéaire de l'or).
        function _impBuildGoldChartSvg(current, net, key) {
            var H = _IMP_HORIZONS[key] || _IMP_HORIZONS['1j'];
            var hours = H.h;
            var W = 328, Hgt = 104, padL = 6, padR = 6, padT = 10, padB = 18;
            var n = 48, pts = [], i, t, v;
            for (i = 0; i <= n; i++) {
                t = hours * i / n;
                v = current + net * t;
                if (v < 0) v = 0;
                pts.push({ t:t, v:v });
            }
            var vmin = Infinity, vmax = -Infinity;
            for (i = 0; i < pts.length; i++) { if (pts[i].v < vmin) vmin = pts[i].v; if (pts[i].v > vmax) vmax = pts[i].v; }
            if (vmax === vmin) vmax = vmin + 1;
            var pad = (vmax - vmin) * 0.10; vmin -= pad; vmax += pad; if (vmin < 0) vmin = 0;
            var innerW = W - padL - padR, innerH = Hgt - padT - padB;
            function X(tt){ return padL + innerW * (tt / hours); }
            function Y(vv){ return padT + innerH * (1 - (vv - vmin) / (vmax - vmin)); }

            var endV = current + net * hours; if (endV < 0) endV = 0;
            var bankrupt = net < 0 && (current + net * hours <= 0);
            var color = net > 0 ? '#4caf50' : net < 0 ? (bankrupt ? '#e05555' : '#e0a020') : '#888';

            var line = '', area = '';
            for (i = 0; i < pts.length; i++) {
                var px = X(pts[i].t).toFixed(1), py = Y(pts[i].v).toFixed(1);
                line += (i ? ' L ' : 'M ') + px + ' ' + py;
            }
            area = line + ' L ' + X(hours).toFixed(1) + ' ' + (padT + innerH).toFixed(1) +
                          ' L ' + X(0).toFixed(1)     + ' ' + (padT + innerH).toFixed(1) + ' Z';

            // bandes de survol (tooltip natif via <title>)
            var bands = '', nb = 12, gid = 'impGrad_' + key;
            for (i = 0; i < nb; i++) {
                var t0 = hours * i / nb, t1 = hours * (i + 1) / nb;
                var bx = X(t0), bw = X(t1) - X(t0);
                var tm = (t0 + t1) / 2, vm = current + net * tm; if (vm < 0) vm = 0;
                var lbl = (tm < 24 ? Math.round(tm) + 'h' : Math.round(tm/24) + 'j') + ' \u2192 ' + _impFmtNum(vm) + ' or';
                bands += '<rect x="' + bx.toFixed(1) + '" y="' + padT + '" width="' + bw.toFixed(1) + '" height="' + innerH +
                         '" fill="transparent"><title>' + lbl + '</title></rect>';
            }

            return '' +
            '<svg viewBox="0 0 ' + W + ' ' + Hgt + '" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">' +
                '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
                    '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.22"/>' +
                    '<stop offset="100%" stop-color="' + color + '" stop-opacity="0.02"/>' +
                '</linearGradient></defs>' +
                '<path d="' + area + '" fill="url(#' + gid + ')" stroke="none"/>' +
                '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linejoin="round"/>' +
                '<circle cx="' + X(0).toFixed(1) + '" cy="' + Y(pts[0].v).toFixed(1) + '" r="2.4" fill="' + color + '"/>' +
                '<circle cx="' + X(hours).toFixed(1) + '" cy="' + Y(endV).toFixed(1) + '" r="2.4" fill="' + color + '"/>' +
                '<text x="' + padL + '" y="' + (Hgt - 5) + '" font-size="9" fill="#999">Maintenant</text>' +
                '<text x="' + (W - padR) + '" y="' + (Hgt - 5) + '" font-size="9" fill="#999" text-anchor="end">' + H.end + '</text>' +
                bands +
            '</svg>';
        }

        // Le contenu complet du panneau graphique (boutons + courbe + pied).
        function _impGraphInner(current, net, key, hasData) {
            function btn(k, label) {
                var active = (k === key);
                return '<a href="javascript:void(0)" class="imp-fin-horizon" data-h="' + k + '" style="' +
                    'display:inline-block;padding:4px 12px;margin:0;font-size:11px;font-weight:500;cursor:pointer;' +
                    'border:0.5px solid rgba(0,0,0,0.15);border-radius:6px;text-decoration:none;' +
                    (active ? 'background:#4a5568;color:#fff;border-color:#4a5568' : 'background:#fff;color:#666') + '">' +
                    label + '</a>';
            }
            var header =
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em">\u2611 \u00c9volution prospective</div>' +
                    '<div style="display:flex;gap:6px">' + btn('1j','1 jour') + btn('1sem','1 semaine') + btn('1mois','1 mois') + '</div>' +
                '</div>';
            if (!hasData) {
                return header +
                    '<div style="padding:20px 8px;text-align:center;font-size:11px;color:#bbb">' +
                    'Donn\u00e9es d\'or indisponibles \u2014 recharge une page ou clique sur \u00ab Mettre \u00e0 jour \u00bb.</div>';
            }
            var H = _IMP_HORIZONS[key] || _IMP_HORIZONS['1j'];
            var gain = net * H.h, endV = Math.max(0, current + gain);
            var svg = _impBuildGoldChartSvg(current, net, key);
            var footColor = net > 0 ? '#4caf50' : net < 0 ? '#e05555' : '#888';
            var foot =
                '<div style="display:flex;justify-content:space-between;font-size:10px;color:#999;margin-top:4px">' +
                    '<span>Maintenant \u00b7 ' + _impFmtNum(current) + '</span>' +
                    '<span style="color:' + footColor + '">' + _impFmtS(gain) + ' \u2192 ' + _impFmtNum(endV) + '</span>' +
                '</div>';
            return header + '<div>' + svg + '</div>' + foot;
        }

        // Liaison unique des événements (survit aux redraws via délégation).
        function _impBindDashboardEventsOnce() {
            if (_impDashEventsBound) return;
            _impDashEventsBound = true;
            $(document).on('click', '.imp-fin-horizon', function() {
                var key = $(this).attr('data-h');
                if (!key || !_IMP_HORIZONS[key]) return;
                _impDashHorizon = key;
                var g = _impDashGoldCache;
                $('#imp-fin-graph').html(_impGraphInner(g.current, g.net, key, g.hasData));
            });
            $(document).on('click', '#imp-fin-refresh', function() {
                var $b = $(this);
                if ($b.data('busy')) return;
                $b.data('busy', 1).css('opacity', 0.5);
                var $st = $('#imp-fin-refresh-status');
                $st.text('mise \u00e0 jour\u2026');
                try {
                    IkaTools.EmpireData.refreshFinancesAndShrine(
                        function(i, total, name) { $st.text(i + '/' + total + ' \u00b7 ' + name); },
                        function() {
                            var d = new Date();
                            $st.text('\u2713 ' + ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2));
                            $b.data('busy', 0).css('opacity', 1);
                        }
                    );
                } catch(e) {
                    $st.text('erreur');
                    $b.data('busy', 0).css('opacity', 1);
                }
            });
        }

        function makeDashboardTab() {
            _impBindDashboardEventsOnce(); // v2.07
            function makeTableContent() {
                var cities  = IkaTools.EmpireData.getOwnCities();
                var civData = IkaTools.EmpireData.getCivilizationData();

                var totalPop = 0, totalResearch = 0;
                var resources  = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                var production = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                var capacity   = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                var wineConsumption = 0;

                $.each(cities, function(i, city) {
                    totalPop      += city.population || 0;
                    totalResearch += city.getResearch() || 0;
                    $.each(['wood','wine','marble','glass','sulfur'], function(j, res) {
                        var r = city.getResource(res);
                        if (r) {
                            resources[res]  += r.getCurrent()    || 0;
                            production[res] += (r.getProduction() || 0) * IkaTools.Constants.Time.SECONDS_PER_HOUR; // v2.20 : /s -> /h
                            if (r.getCapacity) {
                                var cap = r.getCapacity();
                                capacity[res] += (cap && cap.maximum ? cap.maximum : 0);
                            }
                            if (res === 'wine') wineConsumption += Math.abs(r.getConsumption() || 0) * IkaTools.Constants.Time.SECONDS_PER_HOUR; // v2.20 : /h
                        }
                    });
                });

                var wineAutonomy = wineConsumption > 0
                    ? Math.floor(resources.wine / wineConsumption / 24) : 999;

                var transports = 0, militaires = 0;
                $.each(civData.getMovements(), function(id, mv) {
                    if (mv.getMission() === IkaTools.Constants.Movements.Mission.TRANSPORT) transports++;
                    else militaires++;
                });

                var queue = [];
                $.each(cities, function(i, city) {
                    $.each(city.getBuildings(), function(j, b) {
                        var ct = b.getCompletionTime ? b.getCompletionTime() : null;
                        if (ct) {
                            var remaining = ct - IkaTools.View.gameTimeNow();
                            if (remaining > 0) {
                                queue.push({ city: city.getName(), building: b.getType(), level: b.getLevel(), remaining: remaining });
                            }
                        }
                    });
                });
                queue.sort(function(a, b) { return a.remaining - b.remaining; });

                function fmtTime(ms) {
                    var s = Math.floor(ms / 1000);
                    var d = Math.floor(s / 86400); s %= 86400;
                    var h = Math.floor(s / 3600);  s %= 3600;
                    var m = Math.floor(s / 60);
                    if (d > 0) return d + 'j ' + h + 'h';
                    if (h > 0) return h + 'h ' + m + 'm';
                    return m + 'm';
                }

                function fmtNum(n) {
                    if (n == null || isNaN(n)) return '?';
                    if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'G';
                    if (n >= 1000000)    return (n / 1000000).toFixed(1)    + 'M';
                    if (n >= 10000)      return Math.round(n / 1000)        + 'k';
                    return Math.round(n).toString();
                }

                var resColors = { wood:'#c8960c', wine:'#9b5fc0', marble:'#9e9e9e', glass:'#26c6da', sulfur:'#d4c020' };
                var resNames  = { wood:'Bois', wine:'Vin', marble:'Marbre', glass:'Cristal', sulfur:'Soufre' };

                function resBar(res) {
                    var pct = capacity[res] > 0 ? Math.min(100, Math.round(resources[res] / capacity[res] * 100)) : 0;
                    return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">' +
                        '<div style="width:10px;height:10px;border-radius:2px;flex-shrink:0;background:' + resColors[res] + '"></div>' +
                        '<div style="font-size:11px;color:#888;width:48px">' + resNames[res] + '</div>' +
                        '<div style="width:120px;height:5px;background:rgba(0,0,0,0.12);border-radius:3px;overflow:hidden">' +
                            '<div style="width:' + pct + '%;height:100%;background:' + resColors[res] + ';border-radius:3px"></div>' +
                        '</div>' +
                        '<div style="font-size:11px;width:60px;text-align:right">' + fmtNum(resources[res]) + '</div>' +
                        '<div style="font-size:11px;color:#888;width:56px;text-align:right">+' + fmtNum(production[res]) + '/h</div>' +
                    '</div>';
                }

                function cityRow(city) {
                    var pop = city.population || 0;
                    var sat = city.happinessScore != null ? city.happinessScore : '?';
                    var res = city.getResearch() || 0;
                    var satBad  = sat !== '?' && sat < 0;
                    var satWarn = sat !== '?' && sat >= 0 && sat < 50;
                    var satOk   = sat !== '?' && sat >= 50;
                    var satColor = satBad ? '#e05555' : satWarn ? '#e0a020' : satOk ? '#4caf50' : '#888';
                    var satBg    = satBad ? 'rgba(220,80,80,0.15)' : satWarn ? 'rgba(220,160,30,0.15)' : satOk ? 'rgba(60,180,60,0.15)' : 'rgba(0,0,0,0.08)';
                    var satLabel = satBad ? '! ' : satWarn ? '⚠ ' : satOk ? '✓ ' : '';
                    // Net or / h par ville
                    var hasGoldCity = city.cityGoldNetUpdated > 0;
                    // Fallback: si finances non ouvertes, montrer juste le coût scientifiques connu
                    var goldNetCity = hasGoldCity ? (city.cityGoldNet || 0) : null;
                    var sciCost = city.getScientists ? -(city.getScientists() || 0) * (civData.hasResearched(IkaTools.Constants.Research.Science.LETTER_CHUTE) ? 3 : 6) : 0;
                    var goldCityColor = goldNetCity !== null
                        ? (goldNetCity > 0 ? '#4caf50' : goldNetCity < 0 ? '#e05555' : '#888')
                        : '#bbb';
                    var goldCityLabel = goldNetCity !== null
                        ? (goldNetCity > 0 ? '+' : '') + fmtNum(goldNetCity)
                        : (sciCost !== 0 ? '<span title="Sci. seulement">' + fmtNum(sciCost) + '*</span>' : '—');
                    // v2.07 : divinité vénérée par la ville
                    var godName = city.worshipGodName || null;
                    var godCell;
                    if (godName) {
                        var gc = GOD_COLORS[godName] || '#888';
                        var gbg = GOD_BG[godName] || 'rgba(0,0,0,0.06)';
                        godCell = '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:' + gbg + ';color:' + gc + ';font-weight:500">' + godName + '</span>';
                    } else {
                        godCell = '<span style="font-size:11px;color:#bbb">&mdash;</span>';
                    }
                    return '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.07)">' +
                        '<td style="padding:4px 6px;font-size:11px;font-weight:500">' + __impH(city.getName()) + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right">' + fmtNum(pop) + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right">' + res + '</td>' +
                        '<td style="padding:4px 6px;text-align:center">' +
                            '<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:' + satBg + ';color:' + satColor + '">' + satLabel + sat + '</span>' +
                        '</td>' +
                        '<td style="padding:4px 6px;text-align:center">' + godCell + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right;color:' + goldCityColor + '">' + goldCityLabel + '</td>' +
                    '</tr>';
                }

                function queueRow(q) {
                    return '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.07)">' +
                        '<td style="padding:4px 6px;font-size:11px;color:#888">' + __impH(q.city) + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px">' + (localizer.localize('buildings', q.building) || q.building) + ' niv ' + q.level + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right;color:#888">' + fmtTime(q.remaining) + '</td>' +
                    '</tr>';
                }

                var wineColor = wineAutonomy < 7 ? '#e05555' : wineAutonomy < 30 ? '#e0a020' : '#4caf50';
                var wineLabel = wineAutonomy >= 999 ? '∞' : wineAutonomy + 'j';

                // Or
                var gd = civData.getGoldData();
                var goldCurrent = gd.current || 0;
                var goldNet     = gd.net     || 0;
                var goldRev     = gd.revenue    || 0;
                var goldGods    = gd.gods       || 0;
                var goldSci     = gd.scientists || 0;
                var goldUp      = gd.upkeep     || 0;
                var goldPrem    = gd.premium    || 0;
                var hasIncome   = gd.incomeUpdated  > 0;
                var hasGold     = gd.currentUpdated > 0;
                var goldColor   = goldNet > 0 ? '#4caf50' : goldNet < 0 ? '#e05555' : '#888';
                var goldProj1h  = goldNet;
                var goldProj1j  = goldNet * 24;
                var goldProj7j  = goldNet * 24 * 7;
                var goldAuto    = '';
                if (goldNet < 0 && goldCurrent > 0) {
                    var dl = goldCurrent / Math.abs(goldNet) / 24;
                    goldAuto = dl < 1 ? Math.round(dl*24)+'h avant faillite' : Math.floor(dl)+'j avant faillite';
                } else if (goldNet > 0) { goldAuto = 'surplus'; }
                function fmtS(n) {
                    if (!isFinite(n) || n === 0) return '0';
                    return (n > 0 ? '+' : '') + fmtNum(n);
                }
                function gRow(lbl, val) {
                    var c = val > 0 ? '#4caf50' : val < 0 ? '#e05555' : '#888';
                    return '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.05)">'+
                        '<td style="padding:3px 8px;font-size:11px;color:#555">' + lbl + '</td>'+
                        '<td style="padding:3px 8px;font-size:11px;text-align:right;color:'+c+'">'+fmtS(val)+'</td>'+
                    '</tr>';
                }

                // === v2.07 : valeurs dérivées du bloc financier ===
                var revenuBrut = goldRev + goldGods;                 // pop. + dieux
                var depenses   = goldSci + goldUp;                    // scientifiques + entretien (négatifs)
                var goldOr7j   = Math.max(0, goldCurrent + goldProj7j);
                // Répartitions (en %)
                var popVsGods  = revenuBrut !== 0 ? Math.round(goldRev / revenuBrut * 100) : 0;
                var pctSci     = Math.abs(depenses) > 0 ? Math.round(Math.abs(goldSci) / Math.abs(depenses) * 100) : 0;
                var pctUp      = Math.abs(depenses) > 0 ? Math.round(Math.abs(goldUp)  / Math.abs(depenses) * 100) : 0;
                // Regroupement des divinités par ville (ordre fixe du jeu)
                var GOD_ORDER = ['Pluton','Théia','Héphaïstos','Pan','Dionysos','Tyché'];
                var godGroups = {};
                $.each(cities, function(i, c) {
                    var g = c && c.worshipGodName;
                    if (g) { (godGroups[g] = godGroups[g] || []).push(c.getName()); }
                });
                var hasGodData = false; for (var _gk in godGroups) { if (godGroups.hasOwnProperty(_gk)) { hasGodData = true; break; } }
                var shrineFavor = (civData.getShrineData ? (civData.getShrineData().favor || 0) : 0);
                // Barre de répartition réutilisable
                function repBar(label, pct, colorL, extra) {
                    var p = Math.max(0, Math.min(100, pct || 0));
                    return '<div style="margin-bottom:6px">' +
                        '<div style="display:flex;justify-content:space-between;font-size:10px;color:#888;margin-bottom:2px">' +
                            '<span>' + label + '</span><span>' + (extra != null ? extra : (p + '%')) + '</span>' +
                        '</div>' +
                        '<div style="height:5px;background:rgba(0,0,0,0.10);border-radius:3px;overflow:hidden">' +
                            '<div style="width:' + p + '%;height:100%;background:' + colorL + ';border-radius:3px"></div>' +
                        '</div>' +
                    '</div>';
                }
                // Petit KPI financier
                function kpi(label, value, color, sub) {
                    return '<div style="background:rgba(0,0,0,0.05);border-radius:6px;padding:8px 10px">' +
                        '<div style="font-size:9px;color:#999;margin-bottom:2px">' + label + '</div>' +
                        '<div style="font-size:15px;font-weight:600;color:' + color + '">' + value + '</div>' +
                        (sub ? '<div style="font-size:9px;color:#aaa;margin-top:1px">' + sub + '</div>' : '') +
                    '</div>';
                }
                function projRow(lbl, val) {
                    return '<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0">' +
                        '<span style="color:#666">' + lbl + '</span><span style="font-weight:500;color:' + goldColor + '">' + val + '</span></div>';
                }
                function th(label, align) {
                    return '<th style="font-size:10px;color:#888;font-weight:400;text-align:' + align + ';padding:2px 6px">' + label + '</th>';
                }
                function godCards() {
                    var out = '<div style="display:flex;flex-wrap:wrap;gap:6px">';
                    $.each(GOD_ORDER, function(i, g) {
                        if (!godGroups[g]) return;
                        var col = GOD_COLORS[g] || '#888', bg = GOD_BG[g] || 'rgba(0,0,0,0.05)';
                        var citiesList = godGroups[g];
                        out += '<div style="flex:1 1 30%;min-width:120px;background:' + bg + ';border:0.5px solid ' + col + '55;border-radius:6px;padding:7px 9px">' +
                            '<div style="font-size:11px;font-weight:600;color:' + col + ';margin-bottom:3px">' + g +
                                ' <span style="font-weight:400;color:#999">(' + citiesList.length + ')</span></div>' +
                            '<div style="font-size:10px;color:#777;line-height:1.5">' + $.map(citiesList, __impH).join('<br>') + '</div>' +
                        '</div>';
                    });
                    out += '</div>';
                    return out;
                }
                function godFooter() {
                    var hasPluton = !!godGroups['Pluton'];
                    var others = [];
                    $.each(['Théia','Héphaïstos','Pan','Dionysos','Tyché'], function(i, g) { if (godGroups[g]) others.push(g); });
                    var parts = [];
                    if (hasPluton) parts.push('Bonus Pluton : <b style="color:#d4a017">' + _impFmtS(goldGods) + ' or/h</b>');
                    if (others.length) parts.push(others.join(' &amp; ') + ' : production ressources');
                    if (!parts.length) return '';
                    return '<div style="font-size:9px;color:#999;margin-top:8px;border-top:0.5px solid rgba(0,0,0,0.08);padding-top:6px">' + parts.join(' \u00b7 ') + '</div>';
                }

                // Mise en cache pour le graphique interactif (toggle 1j/1sem/1mois)
                _impDashGoldCache = { current: goldCurrent, net: goldNet, hasData: (hasIncome || hasGold) };

                var html = '<tbody><tr><td style="padding:10px;border:none">' +

                    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:10px">' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Population</div>' +
                            '<div style="font-size:18px;font-weight:500">' + fmtNum(totalPop) + '</div>' +
                            '<div style="font-size:10px;color:#888">' + cities.length + ' villes</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Recherche / h</div>' +
                            '<div style="font-size:18px;font-weight:500">' + fmtNum(totalResearch) + '</div>' +
                            '<div style="font-size:10px;color:#888">empire total</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Transports actifs</div>' +
                            '<div style="font-size:18px;font-weight:500">' + transports + '</div>' +
                            '<div style="font-size:10px;color:#888">' + militaires + ' militaires</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Autonomie vin</div>' +
                            '<div style="font-size:18px;font-weight:500;color:' + wineColor + '">' + wineLabel + '</div>' +
                            '<div style="font-size:10px;color:#888">stock / conso</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px;border-left:3px solid #d4a017">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Or empire</div>' +
                            '<div style="font-size:18px;font-weight:500">' + (hasGold ? fmtNum(goldCurrent) : '—') + '</div>' +
                            '<div style="font-size:10px;color:' + goldColor + '">' +
                                (hasIncome ? fmtS(goldNet)+'/h' : '<span style="color:#bbb;font-size:9px">ouvrir Finances</span>') +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;align-items:start">' +

                        // ===================== COLONNE GAUCHE : FINANCES =====================
                        '<div style="display:flex;flex-direction:column;gap:10px">' +

                            // En-tête + bouton de mise à jour manuelle
                            '<div style="display:flex;align-items:center;justify-content:space-between">' +
                                '<div style="font-size:10px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.05em">Finances</div>' +
                                '<div style="display:flex;align-items:center;gap:6px">' +
                                    '<span id="imp-fin-refresh-status" style="font-size:10px;color:#aaa"></span>' +
                                    '<a href="javascript:void(0)" id="imp-fin-refresh" title="Recharger finances + sanctuaire en arri\u00e8re-plan" style="font-size:10px;padding:3px 9px;border:0.5px solid rgba(0,0,0,0.15);border-radius:6px;background:#fff;color:#555;text-decoration:none">\u27f3 Mettre \u00e0 jour</a>' +
                                '</div>' +
                            '</div>' +

                            // Alerte contextuelle
                            (goldAuto ?
                                '<div style="border-radius:8px;padding:8px 12px;font-size:11px;font-weight:500;' +
                                    (goldNet < 0 ? 'background:rgba(224,85,85,0.12);border:0.5px solid rgba(224,85,85,0.35);color:#c0392b'
                                                 : 'background:rgba(76,175,80,0.12);border:0.5px solid rgba(76,175,80,0.35);color:#2e7d32') + '">' +
                                    (goldNet < 0 ? '\u26a0 ' + goldAuto : '\u2713 Surplus actif \u00b7 ' + _impFmtS(goldNet) + ' or/h') +
                                '</div>'
                            : '') +

                            // 3 KPIs
                            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
                                kpi('Revenu brut / h', _impFmtS(revenuBrut), '#4caf50', 'pop. + dieux') +
                                kpi('D\u00e9penses / h', _impFmtS(depenses), '#e05555', 'sci. + entretien') +
                                kpi('Solde net / h', _impFmtS(goldNet), goldColor, goldNet > 0 ? 'surplus actif' : (goldNet < 0 ? 'd\u00e9ficit' : '\u00e9quilibre')) +
                            '</div>' +

                            // Détail + Répartition
                            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
                                '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 6px 8px">' +
                                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;padding:0 6px">D\u00e9tail / h</div>' +
                                    '<table style="width:100%;border-collapse:collapse">' +
                                        gRow('Revenu population', goldRev) +
                                        gRow('Dieux (Pluton)', goldGods) +
                                        gRow('Scientifiques', goldSci) +
                                        gRow("Co\u00fbts d'entretien", goldUp) +
                                        '<tr><td style="padding:3px 8px;font-size:11px;color:#555">Bonus premium</td>' +
                                            '<td style="padding:3px 8px;font-size:11px;text-align:right;color:#888">' + (goldPrem ? _impFmtS(goldPrem) : '0 %') + '</td></tr>' +
                                        '<tr style="border-top:1px solid rgba(0,0,0,0.15)">' +
                                            '<td style="padding:5px 8px;font-size:11px;font-weight:700;color:#444">Net / h</td>' +
                                            '<td style="padding:5px 8px;font-size:12px;text-align:right;font-weight:700;color:' + goldColor + '">' + _impFmtS(goldNet) + '</td></tr>' +
                                    '</table>' +
                                '</div>' +
                                '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px 8px">' +
                                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">R\u00e9partition</div>' +
                                    repBar('Pop. vs Dieux', popVsGods, '#7cb342', popVsGods + ' / ' + (100 - popVsGods) + '%') +
                                    repBar('Scientifiques', pctSci, '#e0a020', pctSci + '% d\u00e9p.') +
                                    repBar('Entretien', pctUp, '#e05555', pctUp + '% d\u00e9p.') +
                                    '<div style="margin-top:8px;border-top:0.5px solid rgba(0,0,0,0.08);padding-top:6px">' +
                                        projRow('Dans 24h', _impFmtS(goldProj1j)) +
                                        projRow('Dans 7 j', _impFmtS(goldProj7j)) +
                                        projRow('Or dans 7j', _impFmtNum(goldOr7j)) +
                                    '</div>' +
                                '</div>' +
                            '</div>' +

                            // Sanctuaire divin
                            '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
                                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em">\u26a1 Sanctuaire divin</div>' +
                                    (shrineFavor > 0 ? '<div style="font-size:10px;color:#888">Faveur : <b style="color:#d4a017">' + _impFmtNum(shrineFavor) + '</b></div>' : '') +
                                '</div>' +
                                (hasGodData ? (godCards() + godFooter())
                                            : '<div style="font-size:11px;color:#bbb;padding:4px 0">Ouvre le Sanctuaire divin (ou \u00ab Mettre \u00e0 jour \u00bb) pour charger les divinit\u00e9s par ville.</div>') +
                            '</div>' +

                            // Graphique prospectif interactif
                            '<div id="imp-fin-graph" style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                                _impGraphInner(goldCurrent, goldNet, _impDashHorizon, (hasIncome || hasGold)) +
                            '</div>' +

                        '</div>' +

                        // ===================== COLONNE DROITE : VILLES =====================
                        '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                            '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;text-align:right">Villes</div>' +
                            '<table style="width:100%;border-collapse:collapse">' +
                                '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.12)">' +
                                    th('Ville', 'left') + th('Pop.', 'right') + th('Rech.', 'right') +
                                    th('Satis.', 'center') + th('Dieu', 'center') + th('Or/h', 'right') +
                                '</tr>' +
                                $.map(cities, cityRow).join('') +
                            '</table>' +
                            '<div style="font-size:9px;color:#aaa;margin-top:8px;line-height:1.4">' +
                                '* Or/h ville = estimation scientifiques uniquement.<br>' +
                                'Ouvrir Conseiller Finances (ou \u00ab Mettre \u00e0 jour \u00bb) pour les valeurs r\u00e9elles.' +
                            '</div>' +
                        '</div>' +

                    '</div>' +

                    (queue.length > 0 ?
                        '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                            '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">File de construction (' + queue.length + ')</div>' +
                            '<table style="width:100%;border-collapse:collapse">' +
                                $.map(queue, queueRow).join('') +
                            '</table>' +
                        '</div>'
                    : '') +

                '</td></tr></tbody>';

                return html;
            }

            var tab = new Tab('dashboard', localizer.localize('misc', 'dashboard'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewDashboardTable"/>' +
                '</div>'),
                'ImperatorOverviewDashboardTable',
                function() {
                    IkaTools.EmpireData.registerResourcesChangedHandler(function() {
                        tab.maybeRedraw(true);
                    });
                    IkaTools.EmpireData.registerGoldChangedHandler(function() {
                        tab.maybeRedraw(true);
                    });
                },
                makeTableContent);

            return tab.getTab();
        }
