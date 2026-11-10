// v3.11 : onglet Espionnage, colonnes déclarées (traits entre colonnes).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.11', _ge(_n(_v), _n('3.11')) >= 0, _v);
const m = s.match(/<colgroup class="espionage">([\s\S]*?)<\/colgroup>/);
t('9 colonnes après la cité (autant que d\'en-têtes)', !!m && (m[1].match(/<col /g) || []).length === 9);
t('colonnes placées avant l\'en-tête', /'%s%s<tbody>%s<\/tbody>'\.format\(\n\s+makeCols\(\),\n\s+makeTableHead\(\),/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
