// v3.21 : ville pleine, croissance nulle -> « Plein » en couleur normale.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.21', _ge(_n(_v), _n('3.21')) >= 0, _v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === _v);
const a = s.indexOf('function impGrowthDisplay(populationData) {'), b = s.indexOf('\n                }', a) + 18;
const fmt = (n, d, sign) => (sign && n >= 0 ? '+' : '') + n.toFixed(d);
const disp = new Function('localizer', 'IkaTools', s.slice(a, b) + 'return impGrowthDisplay;')(
  { localize: (x, k) => k === 'full' ? 'Plein' : k }, { Intl: { formatDecimal: fmt } });
const plein = disp({ population: 5340, max: 5340, growth: 0, happinessClass: 'imperator_warning' });
t('pleine, croissance 0 : « Plein », sans rouge', plein.html === 'Plein' && plein.cls === 'imp_growth_full_cell', JSON.stringify(plein));
const croit = disp({ population: 5000, max: 5340, growth: 12.5, happinessClass: '' });
t('pas pleine : +12.50 comme avant', croit.html === '+12.50' && croit.cls === '');
const baisse = disp({ population: 5340, max: 5340, growth: -3.2, happinessClass: '' });
t('pleine mais en baisse : la baisse reste affichée', baisse.html === '-3.20');
t('infobulle : « plein » seul quand la ville est déjà pleine', /if \(capped && Math\.abs\(growth\) < 0\.005\) \{/.test(s));
t('cellule et minuterie utilisent l\'affichage', /impGrowthDisplay\(populationData\)\.html\);/.test(s) && /var gd = impGrowthDisplay\(populationData\);/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
