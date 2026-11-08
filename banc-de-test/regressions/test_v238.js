// v2.38 : registre des types, magasin séparé, plus de boucle dans le cœur de l'empire.
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
const src = path.join(__dirname, '..', '..', 'src', 'ikatools', 'empire');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const types = ['military', 'militaryUnits', 'trainingBatch', 'city', 'building', 'cityResource', 'civilizationData', 'movement'];
t('les 8 types du modèle sont inscrits au registre', types.every(k => new RegExp('_impTypes\\.' + k + ' = ').test(s)), types.filter(k => !new RegExp('_impTypes\\.' + k + ' = ').test(s)));
const donnees = fs.readFileSync(path.join(src, '03-donnees.js'), 'utf8');
t('le magasin ne cite plus aucune classe du modèle', !/new (City|Military|MilitaryUnits|TrainingBatch|CivilizationData|Movement)\b/.test(donnees));
t('le magasin recrée les objets par le registre', /var Type = _impTypes\[value\._ikaToolsType\];/.test(donnees));
t('accès en lecture regroupés dans le magasin', /function getCities\(\)/.test(donnees) && /function getOwnCities\(\)/.test(donnees) && /function getCivilizationData\(\)/.test(donnees));
const suivi = fs.readFileSync(path.join(src, '04-suivi.js'), 'utf8');
t('04-suivi ne les définit plus', !/function getCities\(\)|function getOwnCities\(\)|function getCivilizationData\(\)/.test(suivi));
// le registre est rempli avant le magasin (ordre d'assemblage)
const iReg = s.indexOf('var _impTypes = {};'), iLast = s.indexOf('_impTypes.movement = Movement;'), iStore = s.indexOf("'empireData',");
t('ordre : registre → modèle → magasin', iReg > 0 && iReg < iLast && iLast < iStore);
// recréation : un objet sauvegardé revient avec ses méthodes
const rv = donnees.slice(donnees.indexOf('reviver: function empireDataReviver(key, value) {') + 9, donnees.indexOf('version: 28'));
function City() {} City.prototype.isOwn = function () { return this.type === 'ownCity'; };
const $ = { extend: Object.assign };
const reviver = new Function('_impTypes', '$', 'return ' + rv.trim().replace(/,\s*$/, ''))({ city: City }, $);
const c = JSON.parse('{"a":{"_ikaToolsType":"city","type":"ownCity","name":"G - Vin 1"}}', reviver).a;
t('un objet sauvegardé revient avec ses méthodes', c instanceof City && c.isOwn() && c.name === 'G - Vin 1');
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
