// v3.10 : espaces égaux à gauche et à droite, onglets centrés en hauteur, point-virgule du style des tableaux.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.10', _ge(_n(_v), _n('3.10')) >= 0, _v);
t('fond des tableaux : point-virgule présent', /background-color: #FAF3D7; [^\n]*\\\nborder-collapse: collapse;/.test(s));
t('espace droit 14 px (comme à gauche)', /padding-right: 14px;/.test(s) && /margin-right: 14px !important;/.test(s));
t('onglets centrés en hauteur', /li\.tab \{[^}]*display: flex !important; \\\nalign-items: center;/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
