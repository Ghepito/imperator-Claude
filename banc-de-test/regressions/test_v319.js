// v3.19 : arrivée déjà comptée par le serveur -> transport retiré sans nouveau crédit.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.19', _ge(_n(_v), _n('3.19')) >= 0, _v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === _v);
const a = s.indexOf('_settleArrivalsCountedByServer: function'), b = s.indexOf('// v2.16 : purge des mouvements périmés', a);
const body = s.slice(a + '_settleArrivalsCountedByServer: '.length, b).replace(/,\s*$/, '');
const now = 1e12;
const Constants = { Movements: { Stage: { LOADING: 'loading', EN_ROUTE: 'en_route', RETURNING: 'returning' },
                                 Mission: { TRANSPORT: 'transport', PLUNDER: 'plunder', DEPLOY_ARMY: 'deployarmy' } } };
const View = { gameTimeNow: () => now };
const $ = { each: (o, f) => Object.keys(o).forEach(k => f(k, o[k])) };
const settle = new Function('$', 'Constants', 'View', 'console', 'return (' + body + ');')($, Constants, View, { log() {} });
let unitsBack = 0;
const mil = { _increment: () => unitsBack++ };
const mv = (o) => Object.assign({ _isFinalStage: () => true, getOriginCity: () => ({ isOwn: () => true, getMilitary: () => mil }) }, o);
const civ = {
  movements: {
    a: mv({ stage: 'en_route', mission: 'transport', targetCityId: 18984, completionTime: now - 5000 }),      // arrivé : compté par le serveur
    b: mv({ stage: 'en_route', mission: 'transport', targetCityId: 18984, completionTime: now + 600000 }),    // encore en route
    c: mv({ stage: 'en_route', mission: 'transport', targetCityId: 18979, completionTime: now - 5000 }),      // autre ville : la minuterie s'en charge
    d: mv({ stage: 'returning', mission: 'plunder', originCityId: 18984, completionTime: now - 1000, units: {} }), // retour de pillage arrivé
    e: mv({ stage: 'loading', mission: 'transport', targetCityId: 18984, completionTime: now - 1000 }),       // en chargement : pas une arrivée
    f: mv({ stage: 'en_route', mission: 'transport', targetCityId: 18984, completionTime: now - 1000, _etaUnknown: true }),
  },
  dropped: [],
  _dropMovement(id, acc) { this.dropped.push(id); delete this.movements[id]; acc.push({ id }); },
};
const changes = [];
const n = settle.call(civ, 18984, changes);
t('arrivé dans la ville du serveur : retiré sans crédit', civ.dropped.includes('a'));
t('retour de pillage arrivé : retiré, troupes recréditées', civ.dropped.includes('d') && unitsBack === 1);
t('encore en route : gardé', !civ.dropped.includes('b'));
t('autre ville : gardé (sa minuterie le créditera)', !civ.dropped.includes('c'));
t('en chargement / heure inconnue : gardés', !civ.dropped.includes('e') && !civ.dropped.includes('f'));
t('2 arrivées réglées, changements signalés', n === 2 && changes.length === 2);
t('branché après la lecture des ressources du serveur', /var hasResources = data\.currentResources \|\| \(data\.headerData && data\.headerData\.currentResources\);/.test(s) &&
  /_settleArrivalsCountedByServer\(serverCity\.getId\(\), mvChanges\)/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
