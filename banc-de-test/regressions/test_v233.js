// v2.33 : heure d'arrivée dans l'infobulle « En transit ».
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const i = s.indexOf('function makeResourcesInTransitRow(movement) {');
const blk = s.slice(i, s.indexOf('}).join', i));
t('ligne « en transit » : temps restant + heure d\'arrivée', /formatRemainingTime\(\s*movement\.getArrivalTime\(\) - IkaTools\.View\.gameTimeNow\(\)\) \+\s*' \(' \+ IkaTools\.Intl\.formatAbsoluteTime\(new Date\(movement\.getArrivalTime\(\)\)\)/.test(blk), blk);
t('« ? » conservé quand l\'arrivée est inconnue', /isEtaUnknown\(\)\) \? '\?'/.test(blk));
// rendu, avec le vrai formateur d'heure du script
const fa = s.indexOf('            function formatAbsoluteTime(date) {'), fb = s.indexOf('            // ... (fin de formatAbsoluteTime)');
const fmt = new Function('Constants', 'baseLocalizer', 'padLeft',
  s.slice(fa, fb) + 'return formatAbsoluteTime;')({ Time: { MILLIS_PER_DAY: 864e5, MINUTES_PER_DAY: 1440 } },
  { localize: (a, b) => ({ today: "aujourd'hui", tomorrow: 'demain', yesterday: 'hier' })[b] || '' },
  (v, n, c) => String(v).padStart(n, String(c)));
const now = new Date(); const arr = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 37, 58);
t('rendu : « aujourd\'hui 15:37 »', fmt(arr) === "aujourd'hui 15:37", fmt(arr));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
