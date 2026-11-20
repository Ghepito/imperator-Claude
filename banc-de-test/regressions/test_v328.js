// v3.28 : coût horaire de l'armée et de la flotte par ville (onglet Armée).
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', nv = v.split('.').map(Number);
t('version >= 3.28', nv[0] > 3 || (nv[0] === 3 && nv[1] >= 28), v);
const { JSDOM } = require('jsdom');
const w = new JSDOM('<body></body>', { runScripts: 'outside-only' }).window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const $ = w.jQuery;
// 1. Entretien de base des unités dans les constantes
const ud = s.slice(s.indexOf('UnitData: {'), s.indexOf('UnitData: {') + 20000);
const upk = u => +((ud.match(new RegExp('\\n\\s+' + u + ': \\{\\n\\s+upkeep: (\\d+)')) || [])[1]);
t('entretien de base : Phalange 3, Lancier 1, Lance-flammes 25, Porte-ballons 100', upk('phalanx') === 3 && upk('spearman') === 1 && upk('ship_flamethrower') === 25 && upk('ship_ballooncarrier') === 100);
t('25 unités avec un entretien', (ud.match(/upkeep: \d+,/g) || []).length === 25);
// 2. Bilan : lecture des réductions
const a = s.indexOf('// v3.28 : réduction de l\'entretien militaire'), b = s.indexOf('// v2.24 : revenu des villes (colonne 2)');
const run = new Function('$', '$b', 'cellVal', 'goldUpd', 'var found = 0;' + s.slice(a, b) + 'return found;');
const cellVal = $td => parseInt($td.clone().find('div').remove().end().text().replace(/[^0-9-]/g, ''), 10);
const C = path.join(__dirname, '..', 'captures', 'finances_13h06.html');
if (fs.existsSync(C)) {
  const html = fs.readFileSync(C, 'utf8').match(/<template id="imp-capture-rendered">([\s\S]*?)<\/template>/)[1];
  const g = {}; run($, $('<div>').html(html.replace(/<script[\s\S]*?<\/script>/g, '')), cellVal, g);
  const m = g.militaryUpkeep || {};
  t('Bilan réel : troupes 7 063 -> 2 542,68 (64 %)', m.army && m.army.base === 7063 && Math.abs(m.army.real - 2542.68) < 0.01 && /Recherche \(64%\)/.test(m.army.cuts[0]), JSON.stringify(m.army));
  t('Bilan réel : flotte 28 725 -> 10 341 ; coefficient 0,36', m.navy && m.navy.base === 28725 && Math.abs(m.navy.factor - 0.36) < 1e-6, JSON.stringify(m.navy));
} else console.log('(capture du Bilan absente : partie réelle sautée)');
const tbl = '<table class="upkeepReductionTable"><tr><th>Coûts basiques</th></tr>' +
  '<tr><td class="reason">Troupes</td><td class="costs">1 000<div class="tooltip">1 000,00</div></td></tr>' +
  '<tr><td class="reason">- Recherche (64%)</td><td class="boldcosts">360<div class="tooltip">360,00</div></td></tr>' +
  '<tr><td class="reason">- Démocratie (10%)</td><td class="boldcosts">324<div class="tooltip">324,00</div></td></tr>' +
  '<tr><th>Frais supplémentaires</th></tr><tr><td class="reason">Troupes</td><td class="costs">50</td></tr></table>';
const g2 = {}; run($, $('<div>').html(tbl), cellVal, g2);
t('plusieurs réductions : coefficient = dernier coût / base (0,324)', Math.abs(g2.militaryUpkeep.army.factor - 0.324) < 1e-9 && g2.militaryUpkeep.army.cuts.length === 2);
t('« Frais supplémentaires » ignorés', g2.militaryUpkeep.army.base === 1000);
t('coefficient conservé dans les données d\'or', /if \(upd\.militaryUpkeep !== undefined\) gd\.militaryUpkeep = upd\.militaryUpkeep;/.test(s));
// 3. Calcul et affichage
const ca = s.indexOf('function impUpkeepCost(acc) {'), cb = s.indexOf('function impUpkeepNameCell(city, unitCells) {');
let gd = {};
const IkaTools = { EmpireData: { getCivilizationData: () => ({ getGoldData: () => gd }) }, Intl: { formatInteger: n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') } };
const api = new Function('IkaTools', s.slice(ca, cb) + 'return { impUpkeepCost, impUpkeepTitle };')(IkaTools);
let c = api.impUpkeepCost({ army: 207, navy: 1590 });
t('sans Bilan : coût de base, signalé comme estimé', !c.known && c.army + c.navy === 1797);
gd = { militaryUpkeep: { army: { factor: 0.36, cuts: ['Recherche (64%)'] }, navy: { factor: 0.36, cuts: ['Recherche (64%)'] } } };
c = api.impUpkeepCost({ army: 207, navy: 1590 });
t('avec Bilan : 1 797 × 0,36 = 647', c.known && Math.round(c.army + c.navy) === 647);
const ti = api.impUpkeepTitle({ army: 207, navy: 1590 }, c);
t('infobulle : détail troupes / flotte', /Troupes : 207 − Recherche \(64%\) = 75 or\/h/.test(ti) && /Flotte : 1 590 − Recherche \(64%\) = 572 or\/h/.test(ti), ti);
t('ligne : unités présentes + en mouvement', /var upkeepUnits = \(count \|\| 0\) \+ deployingCount \+ plunderingCount;/.test(s));
t('pied de colonne : total', /class="imp_upkeep imp_upkeep_total/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
