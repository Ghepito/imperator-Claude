// v3.25 : lecture de l'Atelier et capacité réelle des navires.
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', nv = v.split('.').map(Number);
t('version >= 3.25', nv[0] > 3 || (nv[0] === 3 && nv[1] >= 25), v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === v);
const { JSDOM } = require('jsdom');
const w = new JSDOM('<body></body>', { runScripts: 'outside-only' }).window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const $ = w.jQuery;
const a = s.indexOf('var workshopData = new Data.Value('), b = s.indexOf('\n            }\n', s.indexOf('function getShipCapacity(kind) {')) + 15;
let now = 1795158790 * 1000, stored = null;
const Data = { Value: function () { this.v = { units: {}, names: {}, inProgress: null }; this.get = () => this.v; this.saveAsync = () => { stored = this.v; }; } };
const api = new Function('$', 'Data', 'View', 'raiseMilitaryChanged', 'console', s.slice(a, b) +
  'return { processWorkshopView, getShipCapacity, getWorkshopEffect, getWorkshopData };')($, Data, { gameTimeNow: () => now }, () => {}, { log() {}, warn() {} });
t('avant lecture : capacités de base 500 / 50 000', api.getShipCapacity('merchant') === 500 && api.getShipCapacity('freighter') === 50000);
const td = (f) => JSON.parse(fs.readFileSync(f, 'utf8').match(/id="imp-capture-templateData">\n([\s\S]*?)\n<\/script>/)[1]);
const capU = path.join(__dirname, '..', 'captures', 'workshop_units_07h34.html'), capN = path.join(__dirname, '..', 'captures', 'workshop_ships_08h13.html');
if (fs.existsSync(capU) && fs.existsSync(capN)) {
  api.processWorkshopView(td(capU));
  api.processWorkshopView(td(capN));
  const d = api.getWorkshopData();
  t('navire marchand : 620 (500 + 120, comme l\'aide du jeu)', api.getShipCapacity('merchant') === 620, api.getShipCapacity('merchant'));
  t('navire de charge : 53 000 (50 000 + 3 000)', api.getShipCapacity('freighter') === 53000, api.getShipCapacity('freighter'));
  t('Phalange : dommage +65 (niv. 13), armure +50 (niv. 10)', d.units[303].offensive.effect === 65 && d.units[303].offensive.level === 13 && d.units[303].defensive.effect === 50);
  t('les deux onglets fusionnés (24 unités)', Object.keys(d.units).length === 24);
  t('amélioration en cours : Lancier, armure 20 -> 25', d.inProgress && d.inProgress.unitId === '315' && d.inProgress.type === 'defensive' && d.inProgress.from === 20 && d.inProgress.to === 25, JSON.stringify(d.inProgress));
  t('fin de l\'amélioration : 5 h après le début', d.inProgress.end - d.inProgress.start === 18000 * 1000);
  t('pendant : armure du Lancier +20', api.getWorkshopEffect(315, 'defensive') === 20);
  now = d.inProgress.end + 1000;
  t('après la fin : armure du Lancier +25', api.getWorkshopEffect(315, 'defensive') === 25);
  t('prochain niveau gardé (coût, durée)', d.units[204].cargo.next.effect === 3500 && d.units[204].cargo.next.gold === 2363446 && d.units[204].cargo.next.duration === '7h');
} else {
  t('(captures absentes : lecture non rejouée)', true);
}
t('transports : capacité réelle, repli 580 / 50 000', /function __impCapFast\(\)\{ try \{ return IkaTools\.EmpireData\.getShipCapacity\('merchant'\) \|\| 580;/.test(s) && !/__IMP_CAP_FAST/.test(s));
t('pillage (espionnage) : navires selon la capacité réelle', /lootableResources \/ \(IkaTools\.EmpireData\.getShipCapacity\('merchant'\)/.test(s));
t('vue atelier branchée', /view == 'workshop'\) \{\s*processWorkshopView\(templateData\);/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
