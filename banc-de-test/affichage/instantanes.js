// Banc d'affichage : dessine les 7 onglets d'Imperator hors jeu, avec les données exportées
// (Réglages > Debug > Exporter mes données), et les compare à une référence.
//
//   node affichage/instantanes.js <Imperator.user.js> --enregistrer   enregistre la référence
//   node affichage/instantanes.js <Imperator.user.js>                 compare à la référence
//
// Données et références restent dans banc-de-test/donnees/ (privé, exclu du dépôt).
const fs = require('fs'), path = require('path');
const charger = require('./charger.js');

const script = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'Imperator.user.js'));
const enregistrer = process.argv.includes('--enregistrer');
const donnees = path.join(__dirname, '..', 'donnees');
const exportFile = path.join(donnees, 'export.json');
const refDir = path.join(donnees, 'reference');

// Identifiants générés à la volée (compteur) : renumérotés dans l'ordre d'apparition
const GENERES = ['resource_current_percent_bar_active_', 'resource_current_percent_bar_', 'resource_current_total',
  'resource_current_', 'research_percent_bar', 'population_current_percent_bar_active_', 'population_current_percent_bar_',
  'population_current_', 'population_growth_icon_', 'population_growth_', 'updateable_'];
function normaliser(html) {
  const vus = {};
  const re = new RegExp('\\b(' + GENERES.join('|') + ')([0-9a-f]+)\\b', 'g');
  return html.replace(re, (m, p, n) => { const k = p + n; if (!(k in vus)) vus[k] = p + '#' + Object.keys(vus).length; return vus[k]; });
}

// Ordre des onglets d'Imperator et table dessinée par chacun
const TABLES = ['ImperatorOverviewResourceTable', 'ImperatorOverviewBuildingsTable', 'ImperatorOverviewMilitaryTable',
  'ImperatorOverviewEspionageTable', 'ImperatorOverviewDashboardTable', 'ImperatorOverviewChantiersTable',
  'ImperatorOverviewBoissonsTable'];

async function dessiner() {
  const exp = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
  const now = Date.parse(exp.date);
  const p = await charger(script, exportFile, { now, wait: 800 });
  const $ = p.$;
  $('#leftMenu li').eq(0).trigger('mousedown');                  // ouvre la fenêtre d'Imperator
  await new Promise(r => setTimeout(r, 300));
  const onglets = {};
  const lis = p.document.querySelectorAll('#cityBuildings ul.tabmenu > li');
  for (let i = 0; i < lis.length; i++) {
    $(lis[i]).trigger('click');
    await new Promise(r => setTimeout(r, 300));
    const nom = $(lis[i]).text().trim();
    const table = p.document.getElementById(TABLES[i]);
    onglets[String(i + 1).padStart(2, '0') + '_' + nom.replace(/[^A-Za-zÀ-ÿ]+/g, '_')] =
      normaliser(table ? table.outerHTML : '(table ' + TABLES[i] + ' absente)');
  }
  const erreurs = p.logs.filter(l => /^error|EXEC|jsdomError/.test(l));
  p.window.close();
  return { onglets, erreurs };
}

(async () => {
  if (!fs.existsSync(exportFile)) { console.log('(pas de donnees/export.json : banc d\'affichage ignoré)'); process.exit(0); }
  const { onglets, erreurs } = await dessiner();
  let ok = 0, ko = 0;
  const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
  t('aucune erreur pendant le dessin', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  t('7 onglets dessinés', Object.keys(onglets).length === 7, Object.keys(onglets).join(', '));
  t('chaque onglet a un contenu (plus de 1 ko)', Object.values(onglets).every(v => v.length > 1024),
    Object.entries(onglets).map(([k, v]) => k + ':' + v.length).join(' '));
  if (enregistrer) {
    fs.mkdirSync(refDir, { recursive: true });
    for (const [k, v] of Object.entries(onglets)) fs.writeFileSync(path.join(refDir, k + '.html'), v);
    console.log('Référence enregistrée : ' + Object.entries(onglets).map(([k, v]) => k + ' (' + Math.round(v.length / 1024) + ' ko)').join(', '));
  } else {
    for (const [k, v] of Object.entries(onglets)) {
      const f = path.join(refDir, k + '.html');
      if (!fs.existsSync(f)) { t(k + ' : référence absente', false); continue; }
      const ref = fs.readFileSync(f, 'utf8');
      let i = 0; while (i < ref.length && ref[i] === v[i]) i++;
      t(k + ' identique à la référence (' + Math.round(v.length / 1024) + ' ko)', ref === v,
        ref === v ? '' : '\n   référence : …' + ref.slice(Math.max(0, i - 80), i + 120) + '…\n   obtenu    : …' + v.slice(Math.max(0, i - 80), i + 120) + '…');
    }
  }
  console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
})();
