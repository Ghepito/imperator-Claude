// v3.18 : une expérience n'est comptée que sur confirmation du serveur.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.18', _ge(_n(_v), _n('3.18')) >= 0, _v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === _v);
const a = s.indexOf('var EXPERIMENT_COOLDOWN'), b = s.indexOf('function processSetScientistsForm', a);
const code = s.slice(a, b);
const PF = 'provideFeedback';
function essai(feedback) {
  let cb = null, marked = 0, pts = null;
  const city = { getName: () => 'G - Cristal 1', getScientists: () => 0, _markExperimentLaunched() { marked++; } };
  const civ = { getResearchAdvisorData: () => ({ updated: 1, points: 1000 }), _updateResearchAdvisorData(d) { pts = d.points; }, _updateAcademyData() {} };
  const deps = {
    Constants: { Time: { MILLIS_PER_HOUR: 3600e3 }, IkariamAjaxResponseType: { PROVIDE_FEEDBACK: PF }, Resources: { SCIENTISTS: 'scientists' } },
    $: (f) => ({ find: () => ({ val: () => '' }) }),
    getCity: () => city, View: { getCurrentCity: () => city, registerNextIkariamAjaxRequestCallback: f => { cb = f; } },
    Utils: { iterateIkariamAjaxResponse: (r, f) => r.forEach((x, i) => f(i, x[0], x[1])) },
    getCivilizationData: () => civ, raiseResourcesChanged: () => {}, console: { log() {} },
  };
  const fn = new Function(...Object.keys(deps), code + 'return processExperimentForm;')(...Object.values(deps));
  fn({});
  cb(feedback);
  return { marked, pts };
}
const ok10 = essai([[PF, [{ type: 10 }]]]);
t('confirmée : labo indisponible et +300 000 points', ok10.marked === 1 && ok10.pts === 301000);
const ko11 = essai([[PF, [{ type: 11 }]]]);
t('refusée : rien de compté', ko11.marked === 0 && ko11.pts === null);
const rien = essai([['updateGlobalData', {}]]);
t('sans retour du jeu : rien de compté (avant : comptée)', rien.marked === 0 && rien.pts === null);
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
