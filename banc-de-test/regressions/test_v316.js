// v3.16 : une pastille par miracle, synthèse de tous ses Temples.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.16', _ge(_n(_v), _n('3.16')) >= 0, _v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === _v);
const { JSDOM } = require('jsdom');
const w = new JSDOM('<body></body>', { runScripts: 'outside-only' }).window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const $ = w.jQuery;
const ui = s.slice(s.indexOf('var IMP_MIRACLE_MILITARY'), s.indexOf('function impBlessMakeCaption() {'));
const fmt = s.slice(s.indexOf('function impBlessFmtRemaining(ms) {'), s.indexOf('function impBlessFmtPct(v) {'));
const h = s.match(/function __impH\(value\) \{[\s\S]*?\n\}/)[0];
const now = Date.now(), H = 3600e3;
const city = (id, name, isl, xy) => ({ getId: () => id, getName: () => name, getIslandId: () => isl, getIslandCoordinates: () => xy });
const villes = [city(1, 'G - Marbre 4', 501, [51, 54]), city(2, 'G - Vin 1', 641, [50, 52]), city(3, 'G - Cristal 1', 700, [48, 50]),
                city(4, 'G - Soufre 1', 800, [47, 49])];
const P = (o) => Object.assign({ name: 'Temple de Poséidon', activeEnd: null, cooldownEnd: null, canActivate: false, readAt: now }, o);
let store;
const IkaTools = { EmpireData: { getIslandMiracles: () => store, getOwnCities: () => villes } };
const api = new Function('$', 'IkaTools', 'impBlessInstallOnce', h + fmt + ui + 'return { impMiracleChips };')($, IkaTools, () => {});
const chips = () => $('<div>' + api.impMiracleChips(now, false) + '</div>').find('.imp-miracle-chip');
// 3 Temples de Poséidon : un actif 2h, un actif 5h, un activable
store = { 501: P({ cityId: 1, activeEnd: now + 2 * H + 30e3 }), 641: P({ cityId: 2, activeEnd: now + 5 * H + 30e3 }),
          700: P({ cityId: 3, canActivate: true, position: 9 }),
          800: { name: 'Forge de Héphaïstos', canActivate: true, cityId: 4, readAt: now } };
let c = chips();
t('une seule pastille pour Poséidon (Héphaïstos va dans l\'Armée)', c.length === 1, c.length);
t('actif : fin la plus lointaine, 3 Temples', c.text() === 'Poséidon (3) actif 5h 00m', c.text());
t('clic : Temple de la fin la plus lointaine', c.attr('data-imp-miracle-city') === '2');
t('infobulle : détail des 3 îles', (c.attr('title').match(/• /g) || []).length === 3 && /3 Temples/.test(c.attr('title')));
// Aucun actif : un activable l'emporte sur les rechargements
store[501] = P({ cityId: 1, cooldownEnd: now + 3 * H }); store[641] = P({ cityId: 2, cooldownEnd: now + 1 * H + 30e3 });
c = chips();
t('rien d\'actif, un activable : à activer (orange)', c.hasClass('imp-miracle-ready') && /à activer$/.test(c.text()), c.text());
t('clic : Temple où il est activable', c.attr('data-imp-miracle-city') === '3' && c.attr('data-imp-miracle-pos') === '9');
// Tous en rechargement : reprise la plus proche
store[700] = P({ cityId: 3, cooldownEnd: now + 6 * H });
c = chips();
t('tous en rechargement : reprise la plus proche (1h)', c.hasClass('imp-miracle-cooldown') && c.text() === 'Poséidon (3) recharge 1h 00m', c.text());
// Un seul Temple : pas de nombre
store = { 501: P({ cityId: 1, activeEnd: now + 2 * H + 30e3 }) };
t('un seul Temple : pas de « (1) »', chips().text() === 'Poséidon actif 2h 00m', chips().text());
// Décompte : la synthèse tient compte des autres Temples
t('décompte : synthèse avec les autres Temples', /var st = impMiracleSynth\(group, now\)\.st;/.test(s) && /data-imp-miracle-alt/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
