// v3.2 : colonne Recherche (calculs, anneau, branchements).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.2', _ge(_n(_v), _n('3.2')) >= 0, _v);

// Les fonctions de calcul, isolées telles qu'elles sont dans le script.
const debut = s.indexOf('        // v3.2 : colonne Recherche de l\'onglet Ressources.');
const fin = s.indexOf('\n        }\n', s.indexOf('function impResearchRingSvg(')) + 11;
t('fonctions de la colonne Recherche trouvées', debut > 0 && fin > debut);
const code = s.slice(debut, fin);
const format = function () { const a = arguments; let i = 0; return this.replace(/%s/g, () => a[i++]); };
const R = new Function('String', 'String.prototype.format = ' + format.toString() + ';\n' + code +
  ';return { unit: impResearchUnitCost, city: impResearchCityStats, totals: impResearchTotals, ' +
  'max: impResearchMaxScientists, ring: impResearchRingSvg };')(String);

// Cas de la capture du 10 nov. 2026 : 318 chercheurs, 1 272 or d'entretien, 540 points/h.
t('coût d\'un chercheur lu dans le jeu (1 272 / 318 = 4)', R.unit(-1272, 318, 6) === 4);
t('coût par défaut sans données', R.unit(0, 318, 6) === 6 && R.unit(-1272, 0, 3) === 3 && R.unit(undefined, undefined, 6) === 6);
const c = R.city(318, 318, 540, 4);
t('coût direct 1 272, manque à gagner 954, total 2 226', c.directCost === 1272 && c.lostTax === 954 && c.totalCost === 2226);
t('académie pleine, aucune place libre', c.full && c.free === 0 && c.ratio === 1);
t('or par point ≈ 4,1', Math.abs(c.goldPerPoint - 2226 / 540) < 1e-9);
const p = R.city(200, 318, 340, 4);
t('académie partielle : 118 places libres', !p.full && p.free === 118 && Math.abs(p.ratio - 200 / 318) < 1e-9);
const z = R.city(0, 0, 0, 4);
t('aucun chercheur : pas de division par zéro', z.ratio === 0 && !z.full && isNaN(z.goldPerPoint) && z.totalCost === 0);
const tot = R.totals([c, p]);
t('total : 518 chercheurs, 2 072 or, 880 points', tot.scientists === 518 && tot.directCost === 2072 && tot.research === 880);
t('total vide', R.totals([]).scientists === 0 && isNaN(R.totals([]).goldPerPoint));
const table = [0, 8, 12, 16];
t('max par niveau, borné au tableau', R.max(table, 2) === 12 && R.max(table, 10) === 16 && R.max(table, 0) === 0 && R.max(null, 3) === 0);
t('anneau plein vert', /stroke="#285E28"/.test(R.ring(1, true)) && /stroke-dasharray="28\.27 28\.27"/.test(R.ring(1, true)));
t('anneau partiel orange', /stroke="#D9822B"/.test(R.ring(0.5, false)) && /stroke-dasharray="14\.14 /.test(R.ring(0.5, false)));
t('anneau vide : piste seule', (R.ring(0, false).match(/<circle/g) || []).length === 1);

// Branchements
t('ville sans académie : tiret', /<td class="research"><span class="imp_rs_none">&mdash;<\/span><\/td>/.test(s));
t('plus de barre de progression dans la colonne Recherche', !/research_percent_bar/.test(s));
t('case de total : coût en rouge si le solde d\'or est négatif', /goldNegative \? ' imp_rs_negative' : ''/.test(s) &&
  /registerGoldChangedHandler\(function\(\) \{\n\s+var gd = IkaTools\.EmpireData\.getCivilizationData\(\)\.getGoldData\(\);/.test(s));
t('relevé de l\'académie daté', /city\._markScientistsRead\(\); \/\/ v3\.2/.test(s) && /View\.getCurrentCity\(\)\._markScientistsRead\(\); \/\/ v3\.2/.test(s));
t('le Bilan n\'écrase plus un relevé de l\'académie', /\$cells\.length >= 3 && !city\.getScientistsReadAt\(\)/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
