// v3.15 : miracles toujours affichés avec leur état ; combat -> Armée, autres -> Ressources.
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.15', _ge(_n(_v), _n('3.15')) >= 0, _v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === _v);
const { JSDOM } = require('jsdom');
const w = new JSDOM('<body></body>', { runScripts: 'outside-only' }).window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const $ = w.jQuery;
// --- Lecture : Temple de G - Vin 1 (Forge de Héphaïstos niveau 5, activable)
const parse = s.slice(s.indexOf('function _impCountdownEnd(entry) {'), s.indexOf('function getIslandMiracles() {'));
const readTempleMiracle = new Function('$', parse + 'return readTempleMiracle;')($);
const cap = path.join(__dirname, '..', 'captures', 'temple_11h54.html');
const data = fs.existsSync(cap)
  ? JSON.parse(fs.readFileSync(cap, 'utf8').match(/id="imp-capture-templateData">\n([\s\S]*?)\n<\/script>/)[1])
  : { js_WonderViewButton: { buttonState: 'enabled', href: '?view=island&dialog=wonder&islandId=641' },
      js_WonderActivateButton: { buttonState: 'enabled', href: '?action=CityScreen&cityId=18977&function=activateWonder&position=23' },
      js_WonderTextHead: 'Forge de Héphaïstos (Niveau 5/5)', js_WonderTextDurationText: 'Durée: 1j',
      js_WonderTextCooldownText: 'Temps de rechargement: 1j 9h', js_WonderTextCooldown: '' };
const f = readTempleMiracle(data);
t('nom sans le niveau, niveau 5', f.name === 'Forge de Héphaïstos' && f.level === 5, f.name + ' / ' + f.level);
t('activable, ni actif ni en rechargement', f.canActivate === true && f.activeEnd === null && f.cooldownEnd === null);
t('île 641 et emplacement 23 lus', f.islandId === 641 && f.position === 23);
t('durée et rechargement gardés pour l\'infobulle', f.durationText === 'Durée: 1j' && f.cooldownText === 'Temps de rechargement: 1j 9h');
// --- États
const ui = s.slice(s.indexOf('var IMP_MIRACLE_MILITARY'), s.indexOf('function impBlessMakeCaption() {'));
const fmt = s.slice(s.indexOf('function impBlessFmtRemaining(ms) {'), s.indexOf('function impBlessFmtPct(v) {'));
const h = s.match(/function __impH\(value\) \{[\s\S]*?\n\}/)[0];
const now = Date.now();
const city = (id, name, isl, xy) => ({ getId: () => id, getName: () => name, getIslandId: () => isl, getIslandCoordinates: () => xy });
const villes = [city(18979, 'G - Marbre 4', 501, [51, 54]), city(18977, 'G - Vin 1', 641, [50, 52])];
const store = {
  501: { name: 'Temple de Poséidon', activeEnd: now + 14186000, cooldownEnd: null, position: 23, cityId: 18979, readAt: now },
  641: Object.assign({}, f, { cityId: 18977, readAt: now }),
};
const IkaTools = { EmpireData: { getIslandMiracles: () => store, getOwnCities: () => villes } };
const api = new Function('$', 'IkaTools', 'impBlessInstallOnce', h + fmt + ui +
  'return { impMiracleState, impMiracleChips, impMiracleMilitaryCaption, impMiracleBar };')($, IkaTools, () => {});
const S = (a, c, k) => api.impMiracleState(a, c, k, now).state + ' / ' + api.impMiracleState(a, c, k, now).label;
t('actif : actif 3h 56m', S(now + 14186000, 0, false) === 'active / actif 3h 56m', S(now + 14186000, 0, false));
t('rechargement : recharge 12h 00m', S(0, now + 12 * 3600e3 + 30e3, false) === 'cooldown / recharge 12h 00m', S(0, now + 12 * 3600e3 + 30e3, false));
t('activable : à activer', S(0, 0, true) === 'ready / à activer');
t('actif terminé : terminé (rechargement inconnu)', S(now - 1000, 0, false) === 'ended / terminé');
t('rechargement fini : à activer', S(0, now - 1000, false) === 'ready / à activer');
// --- Répartition
const res = $('<div>' + api.impMiracleChips(now, false) + '</div>'), arm = $('<table>' + api.impMiracleMilitaryCaption() + '<tbody></tbody></table>');
t('Ressources : Poséidon seul', res.find('.imp-miracle-chip').length === 1 && /^Poséidon actif 3h 56m$/.test(res.text()), res.text()); // v3.16 : plus de coordonnées sur la pastille
t('Armée : Héphaïstos seul, à activer, voyant orange', arm.find('.imp-miracle-chip.imp-miracle-ready').closest('caption.imp-miracle-cap').length === 1 &&
  /Héphaïstos à activer/.test(arm.text()), arm.text());
store[501].activeEnd = now - 1000;
const res2 = $('<div>' + api.impMiracleChips(now, false) + '</div>');
t('Poséidon terminé : toujours affiché, en orange', res2.find('.imp-miracle-chip.imp-miracle-ended').length === 1 && /terminé/.test(res2.text()));
t('Armée : le tableau reçoit la barre', /try \{ miracleCaption = impMiracleMilitaryCaption\(\); \}/.test(s) && /return miracleCaption \+ '%s%s%s<thead>/.test(s));
t('Armée : redessinée quand un Temple est relu', /registerShrineChangedHandler\(function\(\) \{\s*tab\.maybeRedraw\(true\);\s*\}\);/.test(s.slice(s.indexOf("var tab = new Tab('military'"))));
t('décompte : l\'état change sans redessiner', /\$\('\[data-imp-miracle-end\]'\)\.each/.test(s) && /removeClass\('imp-miracle-active imp-miracle-cooldown imp-miracle-ready imp-miracle-ended'\)/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
