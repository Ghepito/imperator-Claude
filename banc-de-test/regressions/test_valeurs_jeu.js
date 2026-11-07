// Valeurs du jeu vérifiées en jeu par Ghepito le 7 nov. 2026 (jeu 17.6.1).
// Si l'une change dans le script, ce test le signale : la modifier exprès, ici aussi.
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '..', '..', 'src');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const C = new Function(fs.readFileSync(path.join(src, 'ikatools/constants.js'), 'utf8') + ';return Constants;')();
const ch = fs.readFileSync(path.join(src, 'imperator/onglets/chantiers.js'), 'utf8');
const val = (re) => { const m = ch.match(re); return m ? Number(m[1]) : NaN; };

t('entrepôt : 480 en sécurité par niveau (vue Entrepôt, niveau 41)', C.GamePlay.RESOURCE_PROTECTION_WAREHOUSE === 480);
t('inactif : mot « inactive » dans les données de l\'île (Sirius-Black)', C.PlayerState.INACTIVE === 'inactive');
t('vacances : mot « vacation » (duxtoulouse)', C.PlayerState.VACATION === 'vacation');
t('navire marchand : capacité 580', val(/__IMP_CAP_FAST = (\d+)/) === 580);
t('navire marchand : vitesse 75', val(/__IMP_SPEED_FAST = (\d+)/) === 75);
t('navire de charge : capacité 50 000', val(/__IMP_CAP_CARGO = (\d+)/) === 50000);
t('navire de charge : vitesse 4', val(/__IMP_SPEED_CARGO = (\d+)/) === 4);
t('Spartiate : vitesse 60, poids 5 (encyclopédie du jeu)', C.UnitData.spartan.speed === 60 && C.UnitData.spartan.cargoSize === 5);
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
