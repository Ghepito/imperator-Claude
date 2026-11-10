
        // v3.2 : colonne Recherche de l'onglet Ressources. Calculs et anneau de remplissage,
        // sans accès au jeu (testés hors jeu par le banc).

        // Impôt d'un citoyen (or/h) : ce qu'un citoyen cesse de payer quand il devient chercheur.
        var IMP_RS_CITIZEN_GOLD = 3;

        // Coût d'un chercheur (or/h), lu dans le jeu : entretien total des chercheurs / nombre de
        // chercheurs. Sinon (données absentes), la valeur par défaut fournie.
        // v3.5 : en priorité, le coût lu dans une académie (impôt perdu + entretien) moins l'impôt.
        function impResearchUnitCost(upkeepTotal, scientistsTotal, fallback, academyCostPerScientist) {
            var academyCost = Number(academyCostPerScientist);
            if (isFinite(academyCost) && academyCost > IMP_RS_CITIZEN_GOLD) {
                return academyCost - IMP_RS_CITIZEN_GOLD;
            }
            var upkeep = Math.abs(Number(upkeepTotal));
            var count = Number(scientistsTotal);
            if (isFinite(upkeep) && upkeep > 0 && isFinite(count) && count > 0) {
                return upkeep / count;
            }
            return fallback;
        }

        // Chiffres d'une ville : remplissage, coût direct, manque à gagner, coût total, or par point.
        function impResearchCityStats(scientists, maxScientists, research, unitCost) {
            scientists = Math.max(0, Number(scientists) || 0);
            maxScientists = Math.max(0, Number(maxScientists) || 0);
            research = Number(research) || 0;
            unitCost = Number(unitCost) || 0;
            var directCost = scientists * unitCost;
            var lostTax = scientists * IMP_RS_CITIZEN_GOLD;
            return {
                scientists: scientists,
                max: maxScientists,
                free: Math.max(0, maxScientists - scientists),
                full: maxScientists > 0 && scientists >= maxScientists,
                ratio: maxScientists > 0 ? Math.min(1, scientists / maxScientists) : 0,
                research: research,
                directCost: directCost,
                lostTax: lostTax,
                totalCost: directCost + lostTax,
                goldPerPoint: research > 0 ? (directCost + lostTax) / research : NaN,
            };
        }

        // Somme des chiffres de plusieurs villes.
        function impResearchTotals(statsList) {
            var t = { scientists: 0, research: 0, directCost: 0, lostTax: 0, totalCost: 0 };
            for (var i = 0; i < statsList.length; i++) {
                var s = statsList[i];
                t.scientists += s.scientists;
                t.research += s.research;
                t.directCost += s.directCost;
                t.lostTax += s.lostTax;
                t.totalCost += s.totalCost;
            }
            t.goldPerPoint = t.research > 0 ? t.totalCost / t.research : NaN;
            return t;
        }

        // Nombre maximal de chercheurs pour un niveau d'académie (au-delà du tableau : dernière valeur).
        function impResearchMaxScientists(table, level) {
            level = Math.round(Number(level)) || 0;
            if (!table || !table.length || level <= 0) return 0;
            return Number(table[Math.min(level, table.length - 1)]) || 0;
        }

        // Anneau de remplissage (11 px) : vert si l'académie est pleine, orange sinon.
        function impResearchRingSvg(ratio, full) {
            var circumference = 2 * Math.PI * 4.5;
            var filled = Math.max(0, Math.min(1, Number(ratio) || 0)) * circumference;
            return ('<svg class="imp_rs_ring" width="11" height="11" viewBox="0 0 12 12">' +
                    '<circle cx="6" cy="6" r="4.5" fill="none" stroke="#D8C29A" stroke-width="2.5"/>' +
                    (filled > 0 ?
                     '<circle cx="6" cy="6" r="4.5" fill="none" stroke="%s" stroke-width="2.5" ' +
                     'stroke-dasharray="%s %s" transform="rotate(-90 6 6)"/>' : '') +
                    '</svg>').format(
                full ? '#285E28' : '#D9822B',
                filled.toFixed(2),
                circumference.toFixed(2));
        }

        // v3.5 : expérience de l'académie (300 000 points de recherche contre du cristal).
        var IMP_XP_COST = 300000;          // cristal, sans parchemin
        var IMP_XP_SCROLL_COST = 240000;   // cristal, avec le parchemin d'Athéna (-20 %)

        // État du voyant : 'ready' (vert), 'scroll' (orange, avec parchemin), 'blocked' (rouge).
        // reason : 'cooldown' (labo en remise en état), 'crystal' (pas assez), 'noscroll'
        // (assez pour le parchemin, mais on sait qu'il n'y en a pas). hasScroll : true, false ou
        // null (inconnu : l'orange reste proposé).
        function impExperimentState(crystal, readyAt, now, hasScroll) {
            crystal = Number(crystal) || 0;
            readyAt = Number(readyAt) || 0;
            if (readyAt > now) {
                return { state: 'blocked', reason: 'cooldown', remaining: readyAt - now, crystal: crystal };
            }
            if (crystal >= IMP_XP_COST) return { state: 'ready', crystal: crystal };
            if (crystal >= IMP_XP_SCROLL_COST) {
                return hasScroll === false ?
                    { state: 'blocked', reason: 'noscroll', crystal: crystal } :
                    { state: 'scroll', crystal: crystal };
            }
            return { state: 'blocked', reason: 'crystal', crystal: crystal,
                     missing: IMP_XP_SCROLL_COST - crystal };
        }
