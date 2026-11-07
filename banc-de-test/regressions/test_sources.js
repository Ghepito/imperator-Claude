// Les fichiers de données de src/ doivent rester de la donnée pure, lisible seule.
// Usage : node test_sources.js <Imperator.user.js>   (le script n'est pas utilisé : on lit src/)
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '..', '..', 'src');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const lire = f => fs.readFileSync(path.join(src, f), 'utf8');

let C = null, Lz = null, css = null;
try { C = new Function(lire('ikatools/constants.js') + ';return Constants;')(); } catch (e) { t('constants.js lisible seul', false, e.message); }
if (C) {
  t('constants.js lisible seul (' + Object.keys(C).length + ' groupes)', true);
  const ids = Object.values(C.UnitIds);
  t('chaque identifiant d\'unité a ses données (UnitIds → UnitData)', ids.every(u => C.UnitData[u]), ids.filter(u => !C.UnitData[u]));
  const mil = Object.values(C.Military).filter(u => u !== 'army' && u !== 'navy');
  t('chaque unité de Military a ses données', mil.every(u => C.UnitData[u]), mil.filter(u => !C.UnitData[u]));
}
try { Lz = new Function(lire('imperator/localisations.js') + ';return localizations;')(); } catch (e) { t('localisations.js lisible seul', false, e.message); }
if (Lz) {
  t('localisations.js lisible seul : ' + Object.keys(Lz).join(', '), JSON.stringify(Object.keys(Lz)) === '["en","fr"]');
  const cles = (o, p = '') => Object.entries(o).flatMap(([k, v]) => v && typeof v === 'object' ? cles(v, p + k + '.') : [p + k]);
  const en = new Set(cles(Lz.en)), fr = new Set(cles(Lz.fr));
  const manqueFr = [...en].filter(k => !fr.has(k)), manqueEn = [...fr].filter(k => !en.has(k));
  console.log('  info : ' + en.size + ' textes en anglais, ' + fr.size + ' en français ; sans traduction fr : ' +
              manqueFr.length + ', sans traduction en : ' + manqueEn.length);
  if (manqueFr.length) console.log('    fr manquants : ' + manqueFr.join(', '));
  if (manqueEn.length) console.log('    en manquants : ' + manqueEn.join(', '));
}
try { new Function('GM_addStyle', lire('imperator/styles.js') + ';addStyles();')(s => { css = s; }); } catch (e) { t('styles.js lisible seul', false, e.message); }
if (css !== null) {
  const o = (css.match(/\{/g) || []).length, f = (css.match(/\}/g) || []).length;
  t('styles.js : CSS seul (' + css.length + ' caractères), accolades équilibrées (' + o + '/' + f + ')', o === f);
}
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
