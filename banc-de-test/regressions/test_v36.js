// v3.6 : estimations (cristal avant expérience, prochaine recherche via le conseiller en recherches).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.6', _ge(_n(_v), _n('3.6')) >= 0, _v);

// Lecture du conseiller (extrait de la capture du 10 nov. 2026)
const p0 = s.indexOf('            function parseGameNumber(value) {');
const p1 = s.indexOf('\n            }\n', s.indexOf('function readResearchAdvisorNumbers(')) + 14;
const P = new Function(s.slice(p0, p1) + ';return { num: parseGameNumber, read: readResearchAdvisorNumbers };')();
t('nombres du jeu', P.num('3 360 298') === 3360298 && P.num('1 081,84') === 1081.84 && P.num({ text: '15 264 000' }) === 15264000 &&
  P.num('1,081.84') === 1081.84 && P.num('3.360.298') === 3360298 && isNaN(P.num('-')) && P.num('0') === 0);
const data = {
  js_researchAdvisorPoints: '3 360 298', js_researchAdvisorTime: '1 081,84',
  js_researchAdvisorChangeResearchTypeTxt0: 'Marine', js_researchAdvisorNextResearchName0: 'Avenir de la marine (25)', js_researchAdvisorNextResearchCost0: { text: '0' },
  js_researchAdvisorChangeResearchTypeTxt1: 'Économie', js_researchAdvisorNextResearchName1: 'Avenir de l`économie (25)', js_researchAdvisorNextResearchCost1: { text: '0' },
  js_researchAdvisorChangeResearchTypeTxt2: 'Science', js_researchAdvisorNextResearchName2: 'Avenir de la science (25)', js_researchAdvisorNextResearchCost2: { text: '15 264 000', addClass: 'red' },
  js_researchAdvisorChangeResearchTypeTxt3: 'Armée', js_researchAdvisorNextResearchName3: 'Avenir de l`armée (25)', js_researchAdvisorNextResearchCost3: { text: '0' },
  js_researchAdvisorChangeResearchTypeTxt4: 'Mythologie', js_researchAdvisorNextResearchName4: '', js_researchAdvisorNextResearchCost4: { text: '-' },
};
const a = P.read(data);
t('conseiller : 3 360 298 points, 1 081,84/h', a.points === 3360298 && a.perHour === 1081.84);
t('conseiller : 5 domaines, Science à 15 264 000', a.domains.length === 5 && a.domains[2].cost === 15264000 && a.domains[2].domain === 'Science' && a.domains[4].cost === 0);
t('sans points : rien', P.read({}) === null);

const debut = s.indexOf('        // v3.2 : colonne Recherche de l\'onglet Ressources.');
const fin = s.indexOf('\n        }\n', s.indexOf('function impNextResearches(')) + 11;
const format = function () { const ar = arguments; let i = 0; return this.replace(/%s/g, () => ar[i++]); };
const R = new Function('String', 'String.prototype.format = ' + format.toString() + ';\n' + s.slice(debut, fin) +
  ';return { reach: impTimeToReach, next: impNextResearches };')(String);
const H = 3600000;
t('délai : 58 000 cristal à 1 000/h = 58 h', R.reach(182000, 240000, 1000) === 58 * H);
t('délai : déjà atteint 0, sans production infini', R.reach(300000, 240000, 0) === 0 && R.reach(1, 240000, 0) === Infinity);
const n = R.next(a.points, a.perHour, a.domains);
t('prochaine recherche : seul le domaine Science (les autres au maximum)', n.length === 1 && n[0].domain === 'Science');
t('Science : 11 903 702 points manquants, ~458 jours (le jeu : 1A 3M), 40 expériences', n[0].missing === 11903702 &&
  Math.round(n[0].time / 86400000) === 458 && n[0].experiments === 40);
t('tri par points manquants', R.next(0, 10, [{ cost: 500 }, { cost: 100 }, { cost: 0 }]).map(x => x.cost).join() === '100,500');

t('lecture branchée sur le conseiller', /var advisor = readResearchAdvisorNumbers\(data\);/.test(s));
t('expérience lancée : +300 000 points', /_updateResearchAdvisorData\(\{ points: advisor\.points \+ 300000 \}\)/.test(s));
t('infobulle du total : bloc prochaine recherche', /makeNextResearchBlock\(total\) \+/.test(s));
t('infobulle d\'une ville : délais du cristal', /describeExperimentState\(xp, city\)/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
