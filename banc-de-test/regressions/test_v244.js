// v2.44 : popup « Planifier » hors de la fenêtre du jeu, clics retenus.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 2.44', _ge(_n(_v), _n('2.44')) >= 0, _v);
t('le bandeau n\'est plus inséré dans la fenêtre du jeu', !/box\.appendChild\(pop\)/.test(s));
t('les clics du popup ne remontent pas au jeu', /\['mousedown', 'mouseup', 'click'\]\.forEach/.test(s) && /ev\.stopPropagation\(\)/.test(s));
t('suivi de la fenêtre arrêté à la fermeture', /if \(p\._follow\) clearInterval\(p\._follow\);/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
