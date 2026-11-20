
            // ============================================================
            // v3.25 : Atelier (vue « workshop »). Les améliorations valent pour toutes les unités du
            // joueur. Le jeu donne, par unité (id du jeu) et par type (offensive = dommage,
            // defensive = armure, cargo = espace de chargement) le niveau et le bonus actuels,
            // le niveau suivant (coût, durée) et l'amélioration en cours (début et fin, en secondes
            // serveur). Un onglet à la fois (Unités ou Navires) : on fusionne les deux.
            // ============================================================

            // { units: { <id>: { offensive|defensive|cargo: { desc, name, level, effect, next } } },
            //   names: { <id>: { name, image } }, inProgress: {...} | null, updated }
            var workshopData = new Data.Value('workshopData', { units: {}, names: {}, inProgress: null }, { version: 1 });

            // Capacités de base, sans atelier (vérifiées le 20 nov. 2026 : 620 = 500 + 120,
            // 53 000 = 50 000 + 3 000, aide du jeu et atelier niveau 6).
            var _IMP_SHIP_BASE = { merchant: { id: 201, base: 500 }, freighter: { id: 204, base: 50000 } };

            function _impWsInt(v) {
                var n = parseInt(String(v == null ? '' : v).replace(/[^0-9]/g, ''), 10);
                return isFinite(n) ? n : null;
            }

            function readWorkshopTemplate(data) {
                if (!data || !data.completeData) return null;
                var units = {}, names = {};
                $.each(data.completeData, function(id, types) {
                    var u = units[id] = {};
                    $.each(types || {}, function(type, t) {
                        if (!t || !t.currentLevel) return;
                        var n = t.nextLevel;
                        u[type] = {
                            desc: t.upgradeTypeDesc || '',
                            name: t.currentLevel.upgradeName || '',
                            level: parseInt(t.currentLevel.upgradeLevel, 10) || 0,
                            effect: Number(t.currentLevel.upgradeEffect) || 0,
                            next: n ? { name: n.upgradeName || '', level: parseInt(n.upgradeLevel, 10) || 0,
                                        effect: Number(n.upgradeEffect) || 0, gold: _impWsInt(n.goldCosts),
                                        crystal: _impWsInt(n.crystalCosts), duration: n.duration || '' } : null,
                        };
                    });
                });
                $.each(data.unitDetails || {}, function(id, d) {
                    names[id] = { name: (d && d.unitName) || '', image: (d && d.unitImage) || '' };
                });
                return { tab: data.activeTab || '', units: units, names: names,
                         inProgress: data.inProgress || null, hasInProgressField: 'inProgress' in data };
            }

            // Retrouve l'unité et le type de l'amélioration en cours (le jeu ne donne que nom, image,
            // type lisible et bonus avant/après).
            function _impWsLocateInProgress(p, store) {
                if (!p) return null;
                var unitId = null;
                $.each(store.names, function(id, n) {
                    if (unitId) return;
                    if ((p.unitImage && n.image === p.unitImage) || (p.unitName && n.name === p.unitName)) unitId = id;
                });
                var type = null;
                if (unitId && store.units[unitId]) {
                    $.each(store.units[unitId], function(t, e) {
                        if (!type && e.desc === p.upgradeTypeDesc) type = t;
                    });
                }
                if (!type) type = /armure|armor/i.test(p.upgradeTypeDesc || '') ? 'defensive'
                               : /charge|cargo/i.test(p.upgradeTypeDesc || '') ? 'cargo' : 'offensive';
                return { unitId: unitId, unitName: p.unitName || '', type: type, name: p.upgradeName || '',
                         from: Number(p.effectOldLevel) || 0, to: Number(p.effectNewLevel) || 0,
                         start: (Number(p.startTime) || 0) * 1000, end: (Number(p.endTime) || 0) * 1000 };
            }

            function processWorkshopView(data) {
                try {
                    var r = readWorkshopTemplate(data);
                    if (!r) return;
                    var store = workshopData.get();
                    store.units = store.units || {};
                    store.names = store.names || {};
                    $.each(r.units, function(id, u) { store.units[id] = $.extend(store.units[id] || {}, u); });
                    $.extend(store.names, r.names);
                    if (r.hasInProgressField) store.inProgress = _impWsLocateInProgress(r.inProgress, store);
                    store.updated = View.gameTimeNow();
                    workshopData.saveAsync();
                    raiseMilitaryChanged([]);
                    console.log('[Imperator] Atelier (' + r.tab + ') : ' + Object.keys(r.units).length + ' unités lues' +
                                (store.inProgress ? ', amélioration en cours : ' + store.inProgress.unitName +
                                 ' (' + store.inProgress.type + ' ' + store.inProgress.from + ' -> ' + store.inProgress.to + ')' : '') +
                                ' ; marchand ' + getShipCapacity('merchant') + ', cargo ' + getShipCapacity('freighter'));
                } catch (e) {
                    console.warn('[Imperator] Lecture de l\'atelier échouée', e);
                }
            }

            // ============================================================
            // v3.27 : contrôle par la Caserne et le Chantier naval. Leurs infobulles donnent le nom et
            // le niveau de chaque amélioration (« Cracheur infernal (3) »), pas le bonus. On confronte ce
            // niveau à l'Atelier lu :
            //   - même niveau            -> confirmé ;
            //   - niveau « suivant » lu  -> le bonus est connu : l'amélioration est enregistrée ;
            //   - autre niveau plus haut -> bonus inconnu : « Atelier à relire ».
            // ============================================================
            function _impWsIdByType(type) {
                var ids = Constants.UnitIds || {};
                for (var id in ids) if (ids.hasOwnProperty(id) && ids[id] === type) return id;
                return null;
            }

            function consolidateWorkshopLevels(upgrades, source) {
                var store = workshopData.get();
                if (!store.units || !Object.keys(store.units).length) return null; // Atelier jamais lu
                var now = View.gameTimeNow(), res = { confirmed: 0, promoted: 0, stale: 0 }, changed = false;
                $.each(upgrades, function(type, up) {
                    var id = _impWsIdByType(type);
                    var u = id && store.units[id];
                    if (!u) return;
                    $.each(up, function(kind, seen) {
                        var e = u[kind];
                        if (!e || !seen || !(seen.level >= 0)) return;
                        if (seen.level === e.level) {
                            res.confirmed++;
                            if (e.stale) { delete e.stale; changed = true; }
                        } else if (seen.level > e.level && e.next && seen.level === e.next.level) {
                            u[kind] = { desc: e.desc, name: e.next.name || seen.name, level: e.next.level,
                                        effect: e.next.effect, next: null, from: source, at: now };
                            var p = store.inProgress;
                            if (p && p.unitId == id && p.type === kind) store.inProgress = null;
                            res.promoted++; changed = true;
                        } else if (seen.level > e.level) {
                            if (!e.stale || e.stale.level !== seen.level) {
                                e.stale = { level: seen.level, name: seen.name, from: source, at: now };
                                changed = true;
                            }
                            res.stale++;
                        }
                    });
                });
                store.checked = { from: source, at: now, confirmed: res.confirmed };
                workshopData.saveAsync();
                if (changed) raiseMilitaryChanged([]);
                console.log('[Imperator] ' + source + ' : améliorations de l\'Atelier ' + res.confirmed + ' confirmées, ' +
                            res.promoted + ' mises à jour, ' + res.stale + ' à relire');
                return res;
            }

            // v3.28 : entretien de base par unité. Valeurs du jeu dans Constants.UnitData[type].upkeep,
            // remplacées par celles lues à la Caserne / au Chantier naval si le jeu les change.
            var unitUpkeepData = new Data.Value('unitUpkeep', {}, { version: 1 });
            function recordUnitUpkeep(map) {
                var st = unitUpkeepData.get(), changed = false;
                $.each(map, function(type, v) {
                    var def = Constants.UnitData[type] && Constants.UnitData[type].upkeep;
                    if (v === def) { if (st[type] !== undefined) { delete st[type]; changed = true; } }
                    else if (st[type] !== v) { st[type] = v; changed = true; }
                });
                if (changed) unitUpkeepData.saveAsync();
            }
            function getUnitUpkeep(type) {
                var st = unitUpkeepData.get();
                if (st[type] !== undefined) return st[type];
                return (Constants.UnitData[type] && Constants.UnitData[type].upkeep) || 0;
            }

            function getWorkshopData() {
                return workshopData.get();
            }

            // Bonus actuel d'une unité pour un type, en comptant une amélioration terminée depuis la lecture.
            function getWorkshopEffect(unitId, type) {
                var store = workshopData.get();
                var e = store.units && store.units[unitId] && store.units[unitId][type];
                var effect = e ? e.effect : 0;
                var p = store.inProgress;
                if (p && p.unitId == unitId && p.type === type && p.end && p.end <= View.gameTimeNow()) {
                    effect = Math.max(effect, p.to);
                }
                return effect;
            }

            // Capacité d'un navire : 'merchant' (navire marchand) ou 'freighter' (navire de charge).
            function getShipCapacity(kind) {
                var s = _IMP_SHIP_BASE[kind];
                if (!s) return 0;
                return s.base + getWorkshopEffect(s.id, 'cargo');
            }
