// v2.41 : plus aucune dépendance circulaire ; fenêtre d'Imperator jointe par impPopup().
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const src = path.join(__dirname, '..', '..', 'src');
const lire = f => fs.readFileSync(path.join(src, f), 'utf8');
t('journal : ne cite plus Utils ni Data', !/\bUtils\.|\bData\./.test(lire('ikatools/01-logging.js')));
t('options de débogage : enregistrées par le module Data, même nom pour l\'appelant',
  /Logging\.setAndSaveOptionsFromPageAnchor = setAndSaveOptionsFromPageAnchor;/.test(lire('ikatools/05-data.js')) &&
  /IkaTools\.Logging\.setAndSaveOptionsFromPageAnchor\(\);/.test(s));
t('backgroundRefresh déclaré dans les réglages', /var backgroundRefresh = null;/.test(lire('imperator/reglages.js')) &&
  !/var backgroundRefresh/.test(lire('imperator/initialisation.js')));
t('onglets : plus d\'appel direct à makePopup hors du menu', !/makePopup/.test(lire('imperator/onglets/batiments.js') +
  lire('imperator/onglets/chantiers.js') + lire('imperator/onglets/boissons.js') + lire('imperator/onglets/00-transports.js')));
t('Chantiers et Boissons ne s\'utilisent plus l\'un l\'autre', !/__impWineTrigger|__IMP_WINE_TARGET/.test(lire('imperator/onglets/chantiers.js')) &&
  !/function __impFmt|function __impEsc/.test(lire('imperator/onglets/boissons.js')));
// comportement réel : réouverture de l'onglet Chantiers après un transport (passe par impPopup)
const exp = path.join(__dirname, '..', 'donnees', 'export.json');
(async () => {
  if (fs.existsSync(exp)) {
    const charger = require('../affichage/charger.js');
    const p = await charger(process.argv[2], exp, { wait: 1500, valeurs: { imperator_reopen_tab: 'chantiers' } });
    const erreurs = p.logs.filter(l => /^error|EXEC|jsdomError/.test(l));
    t('réouverture après transport : fenêtre ouverte sur Chantiers', !!p.document.getElementById('ImperatorOverviewChantiersTable') &&
      p.document.getElementById('ImperatorOverviewChantiersTable').innerHTML.length > 100, erreurs.join(' | '));
    t('réouverture : la demande est effacée (une seule fois)', p.store.imperator_reopen_tab === '');
    t('démarrage sans erreur (dont les options de débogage)', erreurs.length === 0, erreurs.slice(0, 2).join(' | '));
    p.window.close();
  } else console.log('(pas de donnees/export.json : test de réouverture ignoré)');
  console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
})();
