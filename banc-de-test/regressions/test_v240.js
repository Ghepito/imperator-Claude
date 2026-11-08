// v2.40 : icône de la recherche dans les infobulles (chemin d'image absolu).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
t('plus aucun chemin d\'image relatif « skin/… »', !/['"(]skin\//.test(s));
t('infobulles de la recherche : même image que l\'en-tête de colonne',
  (s.match(/makeResourceUseToolTip\('\/cdn\/all\/both\/layout\/bulb-on\.png'/g) || []).length === 1 &&
  /'\/cdn\/all\/both\/layout\/bulb-on\.png', rows, footer\)/.test(s) && /th\.research \{ \\\nbackground-image:url\("\/cdn\/all\/both\/layout\/bulb-on\.png"\)/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
