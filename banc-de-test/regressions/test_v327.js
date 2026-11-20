// v3.27 : contrôle de l'Atelier par les infobulles de la Caserne et du Chantier naval.
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', nv = v.split('.').map(Number);
t('version >= 3.27', nv[0] > 3 || (nv[0] === 3 && nv[1] >= 27), v);
const { JSDOM } = require('jsdom');
const w = new JSDOM('<body></body>', { runScripts: 'outside-only' }).window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const $ = w.jQuery;
const UnitIds = {}; (s.match(/UnitIds: \{([\s\S]*?)\n\s*\},/)[1].match(/(\d+): '(\w+)'/g) || []).forEach(x => { const m = x.match(/(\d+): '(\w+)'/); UnitIds[m[1]] = m[2]; });
let now = Date.parse('2026-11-20T09:00:00Z'), saved = 0, raised = 0;
const store = { units: {}, names: {}, inProgress: null };
const Data = { Value: function () { this.get = () => store; this.saveAsync = () => { saved++; }; } };
const a = s.indexOf('var workshopData = new Data.Value('), b = s.indexOf('function getWorkshopData() {');
const ws = new Function('$', 'Data', 'View', 'Constants', 'raiseMilitaryChanged', 'console',
  s.slice(a, b) + 'function getWorkshopEffect(i,t){var e=store.units[i]&&store.units[i][t];return e?e.effect:0;} return { processWorkshopView, consolidateWorkshopLevels };')(
  $, Data, { gameTimeNow: () => now }, { UnitIds }, () => { raised++; }, { log() {}, warn() {} });
// lecteur des infobulles : le vrai, extrait du script
const ra = s.indexOf('function _impReadUnitList($root) {'), rb = s.indexOf('function _impProcessTrainingBuilding(');
const read = new Function('$', 'Constants', 'function _impInt(t){var n=parseInt(String(t==null?"":t).replace(/[^\\d]/g,""),10);return isFinite(n)?n:null;}' +
  s.slice(ra, rb) + 'return _impReadUnitList;')($, { UnitData: new Proxy({}, { get: (o, k) => Object.values(UnitIds).includes(k) ? {} : undefined }) });
const C = path.join(__dirname, '..', 'captures');
const have = ['workshop_units_07h34.html', 'workshop_ships_08h13.html', 'barracks_13h05.html', 'shipyard_13h06.html'].every(f => fs.existsSync(path.join(C, f)));
if (have) {
  const td = f => JSON.parse(fs.readFileSync(path.join(C, f), 'utf8').match(/id="imp-capture-templateData">\n([\s\S]*?)\n<\/script>/)[1]);
  const body = f => { const m = fs.readFileSync(path.join(C, f), 'utf8').match(/<template id="imp-capture-rendered">([\s\S]*?)<\/template>/);
    return $('<div>').append($.parseHTML(m[1].replace(/<script[\s\S]*?<\/script>/g, ''))); };
  ws.processWorkshopView(td('workshop_units_07h34.html')); ws.processWorkshopView(td('workshop_ships_08h13.html'));
  const rb2 = read(body('barracks_13h05.html')), rs = read(body('shipyard_13h06.html'));
  t('Caserne : infobulles lues (14 unités, dont 12 avec amélioration)', rb2.nbUp >= 12, rb2.nbUp);
  t('Phalange : Lance supérieure (13) / Bouclier supérieur (10)', rb2.upgrades.phalanx.offensive.level === 13 && rb2.upgrades.phalanx.defensive.name === 'Bouclier supérieur');
  t('Lance-flammes : Cracheur infernal (3)', rs.upgrades.ship_flamethrower.offensive.name === 'Cracheur infernal' && rs.upgrades.ship_flamethrower.offensive.level === 3);
  const r1 = ws.consolidateWorkshopLevels(rb2.upgrades, 'Caserne'), r2 = ws.consolidateWorkshopLevels(rs.upgrades, 'Chantier naval');
  t('captures réelles : tout confirmé, rien à relire', r1.stale + r2.stale === 0 && r1.confirmed + r2.confirmed >= 40, JSON.stringify([r1, r2]));
} else console.log('(captures absentes : partie réelle sautée)');
// cas construits
store.units = { 315: { defensive: { desc: 'Armure', name: 'Armure en cuir supérieure', level: 4, effect: 20, next: { name: 'Armure en cuir supérieure', level: 5, effect: 25 } },
                       offensive: { desc: 'Dommage', name: 'Lance supérieure', level: 5, effect: 25, next: { level: 6, effect: 30 } } } };
store.inProgress = { unitId: '315', type: 'defensive', from: 20, to: 25, start: now - 3600e3, end: now - 60e3 };
raised = 0;
let r = ws.consolidateWorkshopLevels({ spearman: { defensive: { name: 'Armure en cuir supérieure', level: 5 }, offensive: { name: 'Lance supérieure', level: 5 } } }, 'Caserne');
t('niveau suivant vu : amélioration enregistrée (+25) et « en cours » effacée', r.promoted === 1 && store.units[315].defensive.effect === 25 && store.units[315].defensive.level === 5 && store.inProgress === null);
t('… l\'autre type confirmé, affichage rafraîchi', r.confirmed === 1 && raised === 1);
r = ws.consolidateWorkshopLevels({ spearman: { offensive: { name: 'Lance supérieure', level: 8 } } }, 'Caserne');
t('niveau plus haut sans bonus connu : à relire', r.stale === 1 && store.units[315].offensive.stale.level === 8 && store.units[315].offensive.effect === 25);
r = ws.consolidateWorkshopLevels({ spearman: { offensive: { name: 'Lance supérieure', level: 5 } } }, 'Caserne');
t('niveau revu égal : « à relire » levé', !store.units[315].offensive.stale);
store.units = {}; t('Atelier jamais lu : rien', ws.consolidateWorkshopLevels({ spearman: { offensive: { level: 3 } } }, 'Caserne') === null);
// affichage
t('fiche : ligne Prochain masquée pour l\'amélioration en cours', /if \(!e \|\| !e\.next \|\| w\.progType === kind\) return '';/.test(s));
t('cellule : « ⟳ à relire »', /⟳ à relire<\/span>/.test(s));
t('Caserne / Chantier naval appellent le contrôle', /consolidateWorkshopLevels\(ups, label\)/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
