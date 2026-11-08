// v2.32 : transport lu en chargement sans durée de trajet ; capture des réponses de suite.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const w = new JSDOM('<!doctype html><body></body>').window, $ = require('jquery')(w);
const C = new Function(s.slice(s.indexOf('        var Constants = {'), s.indexOf('        var EmpireData = function() {')) + ';return Constants;')();

// --- Movement, extrait tel quel
const a = s.indexOf('            function Movement(\n'), b = s.indexOf('\n            });\n', s.indexOf('            $.extend(Movement.prototype, {')) + 17;
let now = 1e12; const scheduled = [], credited = [], removed = [];
const target = { isOwn: () => true, getId: () => 2, getName: () => 'G - Marbre 4', _updateActionPointsBy() {},
  _incrementResource(r, changes, n) { credited.push([r, n]); } };
const civ = { _removeMovement(id) { removed.push(id); } };
const Movement = new Function('$', 'Constants', 'View', 'movementsChangedEvent', 'getCity', 'getCivilizationData', 'empireData',
  'raiseResourcesChanged', 'raiseMilitaryChanged', 'MilitaryUnits', 'console', s.slice(a, b) + 'return Movement;')(
  $, C, { gameTimeNow: () => now }, () => ({ scheduleSend: (n, delay, f) => { scheduled.push({ delay, f }); return function cancel() {}; }, cancel() {} }),
  id => id === 2 ? target : null, () => civ, { saveAsync() {} }, () => {}, () => {}, function () {}, { log() {}, warn() {} });
const L = C.Movements.Stage.LOADING, E = C.Movements.Stage.EN_ROUTE, T = C.Movements.Mission.TRANSPORT;

// 1) lu dans le Conseiller en chargement : trajet 0
const m = new Movement(3717941, 'own', now + 60000, T, L, 1, 2, 0, null, { wood: 550000 }, 0);
t('en chargement sans trajet : arrivée inconnue (« ? »)', m.isEtaUnknown());
now += 120000; m._updateAndStartTimer();
t('fin du chargement : passe « en route » sans minuterie', m.getStage() === E && m._etaUnknown === true);
scheduled.forEach(x => x.f());
t('rien crédité à la ville tant que l\'arrivée est inconnue', credited.length === 0 && removed.length === 0, credited);
m._updateAndStartTimer();
t('rechargé (F5) : toujours rien crédité', credited.length === 0);
t('gardé en transit (pas périmé) pendant 24 h', !m._isStale(now + 23 * 3600e3) && m._isStale(now + 25 * 3600e3));

// 2) envoyé depuis le formulaire avec un trajet connu : comportement inchangé
scheduled.length = 0; now = 2e12;
const f = new Movement(42, 'own', now + 60000, T, L, 1, 2, 3, null, { marble: 1000 }, 3600000);
t('trajet connu : arrivée = fin du chargement + trajet', !f.isEtaUnknown() && f.getArrivalTime() === now + 60000 + 3600000);
now += 120000; f._updateAndStartTimer();
t('fin du chargement : en route avec minuterie', f.getStage() === E && scheduled.length === 1 && !f._etaUnknown);
now += 3600000; scheduled[0].f();
t('à l\'arrivée : cargaison créditée', credited.length === 1 && credited[0][1] === 1000, credited);
t('le Conseiller affiche bien « ? » dans l\'infobulle en transit',
  /movement\.isEtaUnknown && movement\.isEtaUnknown\(\)\) \? '\?'/.test(s));

// --- Heure d'arrivée à la seconde
const ra = s.indexOf('            function _impRefineWithClock('), rb = s.indexOf('\n            }\n', ra) + 15;
const refine = new Function(s.slice(ra, rb) + 'return _impRefineWithClock;')();
const at = (h, mi, se, day = 8) => new Date(2026, 10, day, h, mi, se || 0).getTime();
t('« 06h 33m » + « 15:37:58 » → 15:37:58 exact', refine(at(9, 4) + (6 * 60 + 33) * 60000, '06h 33m (en cours) 15:37:58', '06h 33m') === at(15, 37, 58));
t('passage de minuit : 23:50 + « 20m » + « 0:10:05 » → lendemain', refine(at(23, 50) + 20 * 60000, '20m 0:10:05', '20m') === at(0, 10, 5, 9));
t('heure discordante (décalage d\'1 h) → estimation gardée', refine(at(9, 4) + 3600000, '1h 0m 11:04:30', '1h 0m') === at(9, 4) + 3600000);
t('pas d\'heure affichée → estimation gardée', refine(12345, '19m 50s', '19m 50s') === 12345);
t('branché dans la lecture du Conseiller', /_impRefineWithClock\(View\.gameTimeNow\(\) \+ remMs,/.test(s));

// --- Capture : réponse de suite rattachée à la vue
const blk = s.match(/\(function installViewCapture\(\) \{[\s\S]*?\n\}\)\(\);/)[0];
let cb = null; const Ty = { CHANGE_VIEW: 'changeView', UPDATE_TEMPLATE_DATA: 'updateTemplateData', ADD_WINDOW: 'addWindow', CREATE_VIEW: 'createView', UPDATE_BACKGROUND_DATA: 'updateBackgroundData', UPDATE_GLOBAL_DATA: 'updateGlobalData' };
const Ika = { View: { registerIkariamAjaxResponseCallback: f => { cb = f; } }, Utils: { iterateIkariamAjaxResponse: (r, f) => r.forEach((it, i) => f(i, it[0], it[1])) }, Constants: { IkariamAjaxResponseType: Ty } };
const win = {};
new Function('window', 'IkaTools', 'document', '$', 'setTimeout', 'setInterval', 'clearInterval', 'GM_info', 'Blob', 'URL', 'console', blk)
  (win, Ika, { getElementById: () => null }, () => ({ first() { return this; }, text() { return 'v17.6.1'; } }), () => 0, () => 0, () => 0,
   { script: { version: '2.32' } }, function () {}, {}, { log() {}, warn() {} });
cb([['changeView', ['militaryAdvisor', '<div></div>']], ['updateTemplateData', { a: 1 }]]);
cb([['updateTemplateData', { js_MilitaryMovementsFleetMovementsTable: '<table>row</table>' }]]);
const e = win.__impCaptures.militaryAdvisor;
t('tableau envoyé après la page : retenu avec la vue', e && e.followUps && e.followUps.length === 1 && /row/.test(e.followUps[0]));
t('fichier : bloc followUps', /id="imp-capture-followUps">\n\[\{[\s\S]*row/.test(win.__impBuildCapture(e)));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
