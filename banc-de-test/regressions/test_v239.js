// v2.39 : View ne dépend plus du modèle ; la bibliothèque n'utilise plus le global IkaTools en interne.
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
const src = path.join(__dirname, '..', '..', 'src', 'ikatools');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const view = fs.readFileSync(path.join(src, '04-view.js'), 'utf8');
t('View ne cite plus EmpireData', !/EmpireData/.test(view));
t('le modèle indique à View comment retrouver une ville', /View\.setCityLookup\(getCity\);/.test(s));
// comportement : ville active retrouvée par la fonction donnée
const a = view.indexOf('            var _cityLookup = null;'), b = view.indexOf('            function isActiveCity(city) {');
const fns = new Function('unsafeWindow', view.slice(view.indexOf('            function getCurrentCityId() {'), b) +
  'return { set: setCityLookup, get: getCurrentCity };')({ ikariam: { model: { relatedCityData: { selectedCity: 'city_7', city_7: { id: '7' } } } } });
t('avant branchement : pas de ville (null, sans erreur)', fns.get() === null);
fns.set(id => ({ id: id, name: 'G - Vin 1' }));
const c = fns.get();
t('après branchement : ville active retrouvée', c && c.id === '7' && c.name === 'G - Vin 1');
// plus d'appel au global IkaTools dans la bibliothèque (hors façade et étiquettes de journal)
const lib = [];
(function walk(d) { for (const n of fs.readdirSync(d)) { const p = path.join(d, n);
  if (fs.statSync(p).isDirectory()) walk(p); else if (n.endsWith('.js') && !/98-retour|ouverture|fermeture/.test(n)) lib.push(p); } })(src);
const usages = lib.flatMap(p => fs.readFileSync(p, 'utf8').split('\n').map((l, i) => [path.relative(src, p) + ':' + (i + 1), l]))
  .filter(([, l]) => /(^|[^'".\w])IkaTools\.[A-Z]/.test(l.replace(/'[^']*'|"[^"]*"/g, '')) && !/^\s*\/\//.test(l));
t('aucun appel au global IkaTools dans la bibliothèque', usages.length === 0, usages.map(u => u[0]).join(', '));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
