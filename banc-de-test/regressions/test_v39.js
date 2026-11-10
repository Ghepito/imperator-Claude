// v3.9 : cosmétique de la fenêtre (marge pour la barre de défilement, onglets sur toute la largeur).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.9', _ge(_n(_v), _n('3.9')) >= 0, _v);
t('marge droite du contenu (22 px)', /#cityBuildings \.imperator_overview \{ \\\nbox-sizing: border-box; \\\npadding-right: 22px;/.test(s));
t('onglets en flex, même marge', /#cityBuildings ul\.tabmenu \{ \\\ndisplay: flex !important; \\\nwidth: auto !important; \\\nmargin-right: 22px !important;/.test(s));
t('chaque onglet prend une part égale', /#cityBuildings ul\.tabmenu > li\.tab \{ \\\nflex: 1 1 0;/.test(s));
t('fenêtre des réglages non touchée', /#options \.tabmenu \.tab \{ \\\nwidth: auto;/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
