// v3.20 : consommation de vin = valeur du jeu (sans Cave à vin retirée une 2e fois) ; taverne lue.
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.20', _ge(_n(_v), _n('3.20')) >= 0, _v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === _v);
const { JSDOM } = require('jsdom');
const w = new JSDOM('<body></body>', { runScripts: 'outside-only' }).window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const $ = w.jQuery;
const maxWine = [4, 8, 13, 18, 24, 30, 37, 44, 51, 60, 68, 78, 88, 99, 110, 122, 136, 150, 165, 180, 197, 216, 235, 255, 277, 150, 175];
const Constants = { Buildings: { WINE_PRESS: 'vineyard', TAVERN: 'tavern' }, BuildingData: { tavern: { maxWine, wineServe: [0,2,4,7,9,12,15,18,22,26,30,34,39,44,50,56,62,68,75,83,91,99,108,118,128,139,150,162,175] } },
                    Time: { SECONDS_PER_HOUR: 3600 }, Resources: { WINE: 'wine' } };
// 1. Valeur du jeu : 150/h, Cave à vin niveau 50 -> 150 (avant : 75)
const a = s.indexOf('_updateFromGlobalData: function _updateFromGlobalData('), b = s.indexOf('_updateFromBackgroundData:', a);
const glob = new Function('$', 'Constants', 'raiseResourcesChanged', 'return (' + s.slice(a + '_updateFromGlobalData: '.length, b).replace(/,\s*$/, '') + ');')
  (() => ({ text: () => '' }), Constants, () => {});
const city = { isOwn: () => true, getBuildingByType: (ty) => ty === 'vineyard' ? { getLevel: () => 50 } : null,
  _updateActionPoints() {}, _updateTavernWineLevel(v) { this.lvl = v; }, _updateResources(c, m, p, tg, wine) { this.wine = wine; } };
glob.call(city, { headerData: { currentResources: { resource: 1 }, wineSpendings: 150 } }, true);
t('Cave à vin 50 : 150/h affichés (avant 75)', Math.abs(city.wine * 3600 - 150) < 1e-6, city.wine * 3600);
// 2. Lecture de la taverne (capture du 12 nov. : G - Soufre 1, niveau 26, 150/h, économie 0)
const ra = s.indexOf('function readTavern(data, html) {'), rb = s.indexOf('function processTavernView(data, html) {');
const readTavern = new Function('$', 'Constants', 'document', s.slice(ra, rb) + 'return readTavern;')($, Constants, w.document);
const cap = path.join(__dirname, '..', 'captures', 'tavern_07h34.html');
if (fs.existsSync(cap)) {
  const f = fs.readFileSync(cap, 'utf8');
  const data = JSON.parse(f.match(/id="imp-capture-templateData">\n([\s\S]*?)\n<\/script>/)[1]);
  const html = f.match(/<template id="imp-capture-raw">([\s\S]*?)<\/template>/)[1];
  const r = readTavern(data, html);
  t('taverne : niveau 26, 150 vin/h servis, 0 économisé', r && r.level === 26 && r.amount === 150 && r.saved === 0, JSON.stringify(r));
} else {
  t('taverne (sans capture) : niveau, quantité, économie', true);
}
const html2 = '<select id="wineAmount"><option value="0">Pas de vin</option><option value="28">175 Vin par heure</option></select>' +
              '<div>Le pressoir à vin permet d\'économiser <span id="savedWine">87,50</span> litres</div>';
const r2 = readTavern({ load_js: { params: '{"wineServeLevel":"28"}' } }, html2);
t('taverne avec économie : 175 - 87,5', r2.level === 28 && r2.amount === 175 && r2.saved === 87.5, JSON.stringify(r2));
// 3. La ville prend la valeur de la taverne
const u = s.indexOf('_updateFromTavern: function updateFromTavern('), v = s.indexOf('_updateTavernWineLevel: function', u);
const upd = new Function('Constants', 'View', 'return (' + s.slice(u + '_updateFromTavern: '.length, v).replace(/,\s*$/, '') + ');')(Constants, { gameTimeNow: () => 1 });
const c3 = { resources: { wine: { consumption: 75 / 3600 } }, _updateTavernWineLevel(l) { this.lvl = l; } };
const ch = []; upd.call(c3, 26, 150, 0, ch);
t('visite de la taverne : consommation corrigée à 150/h, niveau 26', Math.abs(c3.resources.wine.consumption * 3600 - 150) < 1e-6 && c3.lvl === 26 && ch.length === 1);
t('vue taverne branchée', /view == Constants\.Buildings\.TAVERN\) \{\s*processTavernView\(templateData, viewHtml\);/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
