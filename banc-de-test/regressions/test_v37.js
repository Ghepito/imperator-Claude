// v3.7 : durées de moins d'une heure affichées dans la colonne Recherche (« Relevé il y a » vide).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.7', _ge(_n(_v), _n('3.7')) >= 0, _v);
// La fonction du jeu, isolée : résolution 2 (jours, heures) = vide sous une heure ; résolution par défaut = minutes
const f0 = s.indexOf('            function formatRemainingTime(millis, complete, maxResolution) {');
const f1 = s.indexOf('\n            }\n', f0) + 14;
const fmt = new Function('$', 'Constants', 'baseLocalizer', s.slice(f0, f1) + ';return formatRemainingTime;')(
  { map: (a, f) => a.map(f) }, { Time: { MILLIS_PER_SECOND: 1000 } },
  { localize: (a, b, c) => ({ day: 'J', hour: 'h', minute: 'm', second: 's' })[c] || '' });
String.prototype.format = function () { const a = arguments; let i = 0; return this.replace(/%s/g, () => a[i++]); };
t('cause : résolution 2 sous une heure → vide', fmt(25 * 60e3, '', 2) === '');
t('résolution par défaut : 25m 0s', fmt(25 * 60e3, '') === '25m 0s', fmt(25 * 60e3, ''));
t('plus aucune durée de la colonne en résolution 2', !/formatRemainingTime\((Math\.max\()?(ms|xp\.remaining|Date\.now\(\) - readAt)[^;]*, '', 2\)/.test(s));
t('au moins 1 s (jamais vide)', (s.match(/formatRemainingTime\(Math\.max\([^,]+, 1000\), ''\)/g) || []).length === 3);
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
