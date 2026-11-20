// v3.26 : onglet Armée, ligne Atelier (B) et fiche au survol (C).
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', nv = v.split('.').map(Number);
t('version >= 3.26', nv[0] > 3 || (nv[0] === 3 && nv[1] >= 26), v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === v);
const { JSDOM } = require('jsdom');
const w = new JSDOM('<body></body>', { runScripts: 'outside-only' }).window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const $ = w.jQuery;
// Données de l'atelier (Phalange, Lancier en cours : armure 20 -> 25, 5 h, 1 h écoulée)
const start = 1795158728000, end = 1795176728000; let now = start + 3600e3;
const data = { units: {
  303: { offensive: { name: 'Lance supérieure', level: 13, effect: 65, next: { level: 14, effect: 70, gold: 1489590, crystal: 389594, duration: '14h' } },
         defensive: { name: 'Bouclier supérieur', level: 10, effect: 50, next: { level: 11, effect: 55, gold: 1711379, crystal: 389187, duration: '11h' } } },
  315: { offensive: { name: 'Lance supérieure', level: 5, effect: 25 }, defensive: { name: 'Armure en cuir supérieure', level: 4, effect: 20 } },
  201: { cargo: { name: 'Technique d`empilage supérieure', level: 6, effect: 120, next: { level: 7, effect: 140, gold: 2274282, crystal: 926917, duration: '7h' } } } },
  names: Object.fromEntries(Array.from({ length: 24 }, (_, i) => [String(300 + i), { name: 'u' + i }])),
  inProgress: { unitId: '315', unitName: 'Lancier', type: 'defensive', name: 'Armure en cuir supérieure', from: 20, to: 25, start, end }, updated: now - 2 * 3600e3 };
const effect = (id, type) => { const e = data.units[id] && data.units[id][type]; let x = e ? e.effect : 0;
  const p = data.inProgress; if (p && p.unitId == id && p.type === type && p.end <= now) x = Math.max(x, p.to); return x; };
const IkaTools = { Constants: { UnitIds: { 303: 'phalanx', 315: 'spearman', 310: 'cook' } },
  EmpireData: { getWorkshopData: () => data, getWorkshopEffect: effect },
  View: { gameTimeNow: () => now }, Intl: { formatInteger: n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') } };
const h = s.match(/function __impH\(value\) \{[\s\S]*?\n\}/)[0];
const a = s.indexOf('var IMP_WS_ID_BY_TYPE = {};'), b = s.indexOf('var impWsTickerOn = false;');
const api = new Function('$', 'IkaTools', h + s.slice(a, b) + 'return { impWsCell, impWsCard, impWsFmtLeft };')($, IkaTools);
const cell = $('<table><tr>' + api.impWsCell('phalanx') + api.impWsCell('spearman') + api.impWsCell('cook') + '</tr></table>').find('td');
t('Phalange : +65 / +50', /^\+65\/\+50$/.test(cell.eq(0).text()), cell.eq(0).text());
t('Lancier : +25 / +20 et amélioration en cours, 4h 00m restantes', /^\+25\/\+20/.test(cell.eq(1).text()) && /↑🛡 4h 00m/.test(cell.eq(1).text()), cell.eq(1).text());
t('barre de progression : 20 %', /width:20%/.test(cell.eq(1).html()));
t('cuisinier (pas d\'amélioration) : « - »', cell.eq(2).text() === '-');
const card = $('<div>' + api.impWsCard('phalanx', 'Phalange') + '</div>');
t('fiche : équipements, niveaux et bonus', /Lance supérieure niv\. 13\+65/.test(card.text()) && /Bouclier supérieur niv\. 10\+50/.test(card.text()), card.text());
t('fiche : prochains niveaux avec coût et durée', /Prochain ⚔ : niv\. 14 \(\+70\)1 489 590 or · 389 594 verre · 14h/.test(card.text()));
t('fiche : ancienneté de la lecture', /Atelier lu il y a 2 h/.test(card.text()));
const card2 = $('<div>' + api.impWsCard('spearman', 'Lancier') + '</div>');
t('fiche du Lancier : amélioration en cours', /↑ 🛡 Armure en cuir supérieure en cours \(\+20 → \+25\)4h 00m/.test(card2.text()), card2.text());
now = end + 60e3;
const after = $('<table><tr>' + api.impWsCell('spearman') + '</tr></table>').find('td');
t('après la fin : +25 et plus de pastille', after.text() === '+25/+25', after.text());
t('format : 1j 2h / 3h 05m / 42m', api.impWsFmtLeft(26 * 3600e3) === '1j 2h' && api.impWsFmtLeft(3 * 3600e3 + 5 * 60e3) === '3h 05m' && api.impWsFmtLeft(42 * 60e3) === '42m');
t('en-tête : fiche au survol (registerRefreshable)', /registerRefreshable\('ImperatorMilitaryHeader_' \+ type, function\(\) \{\s*try \{ return impWsCard\(type, displayName\); \}/.test(s));
t('ligne Atelier ajoutée seulement si l\'Atelier a été lu', /if \(!data \|\| !data\.units \|\| !Object\.keys\(data\.units\)\.length\) return '';/.test(s));
fs.writeFileSync(path.join(require('os').tmpdir(), 'imp_ws_card.html'), api.impWsCard('spearman', 'Lancier') + '<hr>' + api.impWsCard('phalanx', 'Phalange'));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
