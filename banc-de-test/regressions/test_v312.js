// v3.12 : liens Espionnage vers l'île d'une cible : l'île est donnée au jeu (islandId).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.12', _ge(_n(_v), _n('3.12')) >= 0, _v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === _v, (s.match(/@name[^\n]*/) || [])[0]);
const m = s.match(/var islandViewParams = ([^;]+);\s*if \(target\.getIslandId\(\) > 0\) \{\s*islandViewParams = ([^;]+);/);
t('paramètres : île connue -> islandId + cityId', !!m && /islandId: target\.getIslandId\(\)/.test(m[2]) && /cityId: target\.getId\(\)/.test(m[2]));
t('île inconnue (0) -> comme avant', !!m && !/islandId/.test(m[1]));
// Simulation : l'URL produite pour une cible sur [36:63]
if (m) {
  const ISLAND = 'island', target = { getId: () => 26209, getIslandId: () => 1234 };
  const IkaTools = { Constants: { BaseView: { ISLAND } } };
  let p = eval('(' + m[1] + ')'); if (target.getIslandId() > 0) p = eval('(' + m[2] + ')');
  const url = 'index.php?' + Object.entries(p).map(([k, v]) => k + '=' + v).join('&');
  t('URL : index.php?view=island&islandId=1234&cityId=26209', url === 'index.php?view=island&islandId=1234&cityId=26209', url);
}
const uses = (s.match(/\.toIkariamPage\(islandViewParams\)|^\s+islandViewParams,$/gm) || []).length;
t('île, pillage, blocus, occupation passent tous par ces paramètres', uses === 4, uses);
t('plus aucun lien d\'île sans islandId possible', !/\{ view: IkaTools\.Constants\.BaseView\.ISLAND, cityId: target\.getId\(\) \}\)/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
