// v2.35 : allègement (sauvegarde regroupée, surlignage, biens culturels, bénédictions).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };

// --- Data.Value, extrait tel quel
const a = s.indexOf('        var Data = function() {'), b = s.indexOf('        var UI = function() {');
const listeners = {}, writes = [], timers = [];
const win = { addEventListener: (ev, f) => { listeners[ev] = f; } };
const fakeTimeout = (f, d) => { timers.push(f); return timers.length; };
const $ = require('jquery')(new (require('jsdom').JSDOM)('').window);
const Data = new Function('$', 'window', 'View', 'GM_setValue', 'GM_getValue', 'Logging', 'ikaToolsVersion', 'setTimeout', 'clearTimeout',
  s.slice(a, b) + 'return Data;')($, win, { getDomain: () => 's17-fr' }, (k, v) => writes.push(v), () => 'null',
  { debug() {}, debuggable: (l, f) => f }, '1', fakeTimeout, () => {});
const v = new Data.Value('empireData', { n: 0 }, { version: 28 });
v.get().n = 1; v.saveSoon(); v.get().n = 2; v.saveSoon(); v.get().n = 3; v.saveSoon();
t('3 demandes de sauvegarde → aucune écriture immédiate', writes.length === 0);
t('une seule minuterie pour la rafale', timers.length === 1, timers.length);
timers[0]();
t('une seule écriture, avec le dernier état', writes.length === 1 && JSON.parse(writes[0]).n === 3, writes);
v.get().n = 4; v.saveSoon(); listeners.pagehide();
t('fermeture de la page : la sauvegarde en attente est écrite tout de suite', writes.length === 2 && JSON.parse(writes[1]).n === 4);
timers[timers.length - 1]();
t('pas d\'écriture en double après la fermeture', writes.length === 2, writes.length);
t('beforeunload branché aussi', typeof listeners.beforeunload === 'function');
t('plus aucune sauvegarde synchrone de l\'empire', !/empireData\.save\(\)/.test(s));

// --- surlignage
const h = s.slice(s.indexOf('(function installUpgradeHighlight() {'), s.indexOf('})();', s.indexOf('(function installUpgradeHighlight() {')));
t('surlignage : recalcul complet au plus toutes les 10 s si rien ne change', /now - lastRun < 10000\) return;/.test(h));
t('surlignage : immédiat après un changement (ressources, bâtiments)', /registerResourcesChangedHandler\(markDirty\)/.test(h) && /registerBuildingsChangedHandler\(markDirty\)/.test(h));
t('surlignage : rien si l\'onglet du navigateur est caché', /if \(document\.hidden\) \{ wasVisible = false; return; \}/.test(h));
// --- biens culturels
const c = s.slice(s.indexOf('(function _impWatchCulturalGoods() {'), s.indexOf('function processTownHallView(data)'));
t('biens culturels : plus d\'observateur de toute la page', c.length > 0 && !/MutationObserver/.test(c));
t('biens culturels : repérés dans les réponses du jeu', /registerIkariamAjaxResponseCallback\(function watchCulturalGoods/.test(c) && /indexOf\('moveCulturalGoods'\)/.test(c));
// --- bénédictions
t('bénédictions : rien si l\'onglet du navigateur est caché', /function impBlessTick\(\) \{\s*try \{\s*if \(document\.hidden\) return;/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
