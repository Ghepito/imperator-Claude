// v3.17 : les réponses du jeu (headerData) mettent à jour ressources, production, vin et or.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.17', _ge(_n(_v), _n('3.17')) >= 0, _v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === _v);
const a = s.indexOf('_updateFromGlobalData: function _updateFromGlobalData('), b = s.indexOf('_updateFromBackgroundData:', a);
const body = s.slice(a + '_updateFromGlobalData: '.length, b).replace(/,\s*$/, '');
const Constants = { Buildings: { WINE_PRESS: 'vineyard', TAVERN: 'tavern' }, BuildingData: { tavern: { maxWine: [4, 8, 13, 18, 24] } },
                    Time: { SECONDS_PER_HOUR: 3600 } };
const $ = () => ({ text: () => '' });
let raised = 0;
const fn = new Function('$', 'Constants', 'raiseResourcesChanged', 'return (' + body + ');')($, Constants, () => raised++);
function city() {
  return { got: null, ap: null, wine: null, isOwn: () => true, getBuildingByType: () => null,
    _updateActionPoints(v) { this.ap = v; }, _updateTavernWineLevel(v) { this.wine = v; },
    _updateResources(cur, max, prod, tg, wine) { this.got = { cur, max, prod, tg, wine }; } };
}
// 1. Réponse du jeu après une amélioration : tout est dans headerData
const rep = { headerData: { currentResources: { resource: 120000, 1: 5000, 2: 30000, 3: 8000, 4: 900 },
  maxResources: { resource: 480000 }, resourceProduction: 1.5, tradegoodProduction: 0.8, wineSpendings: 13, maxActionPoints: 9 },
  backgroundData: { id: 18979 } };
const c1 = city(); fn.call(c1, rep, true);
t('réponse du jeu : ressources lues (bois 120 000 après débit)', c1.got && c1.got.cur && c1.got.cur.resource === 120000);
t('réponse du jeu : capacité, production, vin', c1.got && c1.got.max.resource === 480000 && c1.got.prod === 1.5 && c1.got.tg === 0.8 &&
  Math.abs(c1.got.wine - 13 / 3600) < 1e-9);
t('réponse du jeu : points d\'action et niveau de taverne', c1.ap === 9 && c1.wine === 3);
t('changement signalé (tableaux redessinés)', raised === 1);
// 2. Chargement de la page : à plat (dataSetForView), comme avant
const page = { currentResources: { resource: 99 }, resourceProduction: 2, tradegoodProduction: 1, wineSpendings: 0, maxActionPoints: 7,
               headerData: { currentResources: { resource: 1 } } };
const c2 = city(); fn.call(c2, page, true);
t('chargement : les valeurs à plat restent prioritaires', c2.got.cur.resource === 99 && c2.ap === 7 && c2.got.prod === 2);
// 3. Or : la réponse passe avant la page figée du chargement
const g = s.slice(s.indexOf('var responseGold = '), s.indexOf('// 4. DOM'));
t('or : montant de la réponse lu en premier', /g = responseGold > 1000 \? responseGold : 0;/.test(g) &&
  g.indexOf('g = responseGold') < g.indexOf('var model') && g.indexOf('var model') < g.indexOf('var dsv'));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
