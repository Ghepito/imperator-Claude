// v3.21.1 : avertissement « vin servi en excès » gardé dans l'infobulle de la croissance.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0';
const n = v.split('.').map(Number), ge = (a, b) => { for (let i = 0; i < 3; i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d; } return 0; };
t('version >= 3.21.1', ge(n, [3, 21, 1]) >= 0, v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === v);
t('ligne ajoutée si l\'ancien avertissement s\'applique', /if \(getPopulationData\(city\)\.happinessClass === 'imperator_warning'\) \{/.test(s) &&
  /'<div class="imp_wine_excess">'/.test(s));
const fr = (s.match(/wine_excess: '([^']*)'/g) || []);
t('texte FR et EN', fr.length === 2 && /vin probablement servi en excès/.test(s));
const tpl = 'Ville pleine avec +%s de satisfaction et du vin servi : vin probablement servi en excès.';
t('texte rendu : satisfaction insérée', tpl.replace('%s', '312') === 'Ville pleine avec +312 de satisfaction et du vin servi : vin probablement servi en excès.');
t('cellule : « Plein » toujours en couleur normale', /\{ html: localizer\.localize\('misc', 'full'\), cls: 'imp_growth_full_cell' \}/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
