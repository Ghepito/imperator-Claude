// v2.31 : aide des bâtiments, joueurs en vacances, navires à piller.
// Usage : node test_v231.js <Imperator.user.js>   (captures buildingDetail* dans ../captures si présentes)
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };

const a = s.indexOf('            var _IMP_HELP_COLUMNS = {'), b = s.indexOf('            // ============================================================\n            // v2.07 : Parser des mouvements');
t('parseur de l\'aide présent', a > 0 && b > a);
const w = new JSDOM('<!doctype html><body></body>').window, $ = require('jquery')(w);
const C = new Function(s.slice(s.indexOf('        var Constants = {'), s.indexOf('        var EmpireData = function() {')) + ';return Constants;')();
let saved = 0; const store = {};
const Data = { Value: function () { this.get = () => store; this.saveAsync = () => { saved++; }; } };
const logs = [];
const api = new Function('$', 'Constants', 'Data', 'document', 'console', s.slice(a, b) +
  'return { parse: parseBuildingDetailHtml, process: processBuildingDetailView, get: getHelpCost };')
  ($, C, Data, w.document, { log: m => logs.push(m), warn: m => logs.push('W ' + m) });

const dir = path.join(__dirname, '..', 'captures');
const cap = p => { const f = fs.existsSync(dir) && fs.readdirSync(dir).find(n => n.startsWith(p));
  return f ? new JSDOM(fs.readFileSync(path.join(dir, f), 'utf8')).window.document.getElementById('imp-capture-raw').innerHTML : null; };
const acad = cap('buildingDetail_academy'), pal = cap('buildingDetail_palaceColony');
if (acad) {
  const r = api.parse(acad);
  t('Académie reconnue, niveaux 27 à 76', r && r.type === 'academy' && r.levels[27] && r.levels[76] && !r.levels[26]);
  t('niveau 27 exact : bois 314 572, cristal 684 674', r.levels[27].wood === 314572 && r.levels[27].glass === 684674 && r.levels[27].marble === 0, r.levels[27]);
  t('niveau 76 exact malgré l\'affichage arrondi (1,50T)', r.levels[76].wood === 1503595510656 && r.levels[76].glass === 13421893903907);
  api.process(acad);
  t('stocké et retrouvé : getHelpCost(academy, 31)', api.get('academy', 31) && api.get('academy', 31).wood === 1164835 && saved === 1);
  t('niveau absent de l\'aide → null', api.get('academy', 5) === null && api.get('tavern', 30) === null);
  // colonne inconnue : rien n'est stocké
  const n0 = saved; api.process(acad.replace('c3527b2f694fb882563c04df6d8972', 'ffffffffffffffffffffffffffffff'));
  t('image de colonne inconnue → lecture refusée, rien de stocké', saved === n0 && logs.some(l => /colonne non reconnue/.test(l)));
}
if (pal) {
  const r = api.parse(pal);
  t('Résidence du gouverneur : 5 ressources au niveau 10', r && r.type === 'palaceColony' &&
    JSON.stringify(r.levels[10]) === JSON.stringify({ wood: 1937630, wine: 562079, marble: 649350, glass: 523522, sulfur: 704713 }), r && r.levels[10]);
}
t('page sans tableau d\'aide → ignorée', api.parse('<div><p>rien</p></div>') === null && api.parse('') === null);

// branchements
t('routage de la vue buildingDetail', /view == 'buildingDetail'\) \{\s*processBuildingDetailView\(viewHtml\)/.test(s));
t('getUpgradeCosts : aide avant les anciennes tables', /var help = getHelpCost\(this\.getType\(\), level \+ 1\);/.test(s));
t('isMaxLevel : niveau suivant connu par l\'aide → pas au maximum', /if \(getHelpCost\(type, this\.getLevel\(\)/.test(s));
t('navires à piller : 580 par navire', C.GamePlay.RESOURCES_PER_TRANSPORT === 580);
t('joueur en vacances : « En vacances » au lieu d\'un nombre', /PlayerState\.VACATION \?\s*localizer\.localize\('espionage', 'on_vacation'\)/.test(s) &&
  /on_vacation: 'En vacances'/.test(s) && /on_vacation: 'On vacation'/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
