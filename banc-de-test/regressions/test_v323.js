// v3.23 : validation du service à la taverne -> niveau, consommation, satisfaction et humeur à jour.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', nv = v.split('.').map(Number);
t('version >= 3.23', nv[0] > 3 || (nv[0] === 3 && nv[1] >= 23), v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === v);
t('formulaire de la taverne suivi', /form\.id == 'wineAssignForm'\) \{\s*processWineAssignForm\(form\);/.test(s));
const { JSDOM } = require('jsdom');
const w = new JSDOM('<body></body>', { runScripts: 'outside-only' }).window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const $ = w.jQuery;
const maxBonus = JSON.parse(s.match(/maxBonus:\[60,120,181[^\]]*\]/)[0].replace('maxBonus:', ''));
const wineServe = JSON.parse('[' + s.match(/wineServe:\[([^\]]*)\]/)[1] + ']');
const Constants = { BuildingData: { tavern: { maxBonus, wineServe } }, Buildings: { TAVERN: 'tavern' },
  IkariamAjaxResponseType: { PROVIDE_FEEDBACK: 'provideFeedback', UPDATE_GLOBAL_DATA: 'updateGlobalData' }, Resources: { WINE: 'wine' },
  Time: { SECONDS_PER_HOUR: 3600 } };
// La ville : vraie méthode _updateFromTavern
const u = s.indexOf('_updateFromTavern: function updateFromTavern('), e = s.indexOf('_updateTavernWineLevel: function', u);
const upd = new Function('Constants', 'View', 'return (' + s.slice(u + '_updateFromTavern: '.length, e).replace(/,\s*$/, '') + ');')(Constants, { gameTimeNow: () => 1 });
function ville() {
  return { name: 'G - Cristal 2', satisfactionNoWine: -1700, tavernWineLevel: 26, resources: { wine: { consumption: 150 / 3600 } },
    getName() { return this.name; }, _updateFromTavern: upd, _updateTavernWineLevel(l) { this.tavernWineLevel = l; } };
}
// Le formulaire
const a = s.indexOf('function processWineAssignForm(form) {'), b = s.indexOf('function processSetScientistsForm(form) {');
function valider(level, reponse) {
  const c = ville(); let cb = null, raised = 0;
  const form = $('<form id="wineAssignForm"><input name="cityId" value="18975"><select name="amount">' +
    '<option value="24">128 Vin par heure</option><option value="25">139 Vin par heure</option><option value="26">150 Vin par heure</option></select></form>')[0];
  $(form).find('select').val(String(level));
  const fn = new Function('$', 'Constants', 'View', 'Utils', 'getCity', 'raiseResourcesChanged', 'console', s.slice(a, b) + 'return processWineAssignForm;')(
    $, Constants, { registerNextIkariamAjaxRequestCallback: f => { cb = f; }, getCurrentCity: () => c },
    { iterateIkariamAjaxResponse: (r, f) => r.forEach((x, i) => f(i, x[0], x[1])) }, () => c, () => raised++, { log() {} });
  fn(form); cb(reponse);
  return { c, raised };
}
let r = valider(25, [['provideFeedback', [{ type: 10 }]]]);
t('139/h acceptés : niveau 25, consommation 139/h', r.c.tavernWineLevel === 25 && Math.round(r.c.resources.wine.consumption * 3600) === 139 && r.raised === 1);
t('satisfaction recalculée : -1700 + 1725 = +25, neutre', r.c.happinessScore === 25 && r.c._imperatorMood === 'neutral');
r = valider(24, [['provideFeedback', [{ type: 10 }]]]);
t('128/h : -56, furieuse (comme la capture)', r.c.happinessScore === -56 && r.c._imperatorMood === 'outraged');
r = valider(26, [['provideFeedback', [{ type: 10 }]]]);
t('150/h : +107, contente', r.c.happinessScore === 107 && r.c._imperatorMood === 'happy');
r = valider(25, [['provideFeedback', [{ type: 11 }]]]);
t('refus du jeu : rien ne change', r.c.tavernWineLevel === 26 && r.raised === 0);
r = valider(25, [['updateGlobalData', { headerData: { wineSpendings: 139 } }]]);
t('sans message mais consommation = 139 : pris en compte', r.c.tavernWineLevel === 25);
r = valider(25, [['updateGlobalData', { headerData: { wineSpendings: 150 } }]]);
t('sans message et consommation inchangée : ignoré', r.c.tavernWineLevel === 26);
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
