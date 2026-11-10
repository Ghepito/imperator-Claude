// v3.14 : miracles actifs (Temple) dans la barre des bénédictions.
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.14', _ge(_n(_v), _n('3.14')) >= 0, _v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === _v);
const { JSDOM } = require('jsdom');
const w = new JSDOM('<body></body>', { runScripts: 'outside-only' }).window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const $ = w.jQuery;
// --- Lecture : templateData du Temple (capture du 10 nov., Poséidon actif, 3h 56m restantes)
const cap = path.join(__dirname, '..', 'captures', 'temple_11h40.html');
const parse = s.slice(s.indexOf('function _impCountdownEnd(entry) {'), s.indexOf('function getIslandMiracles() {'));
const readTempleMiracle = new Function('$', parse + 'return readTempleMiracle;')($);
let data;
if (fs.existsSync(cap)) {
  data = JSON.parse(fs.readFileSync(cap, 'utf8').match(/id="imp-capture-templateData">\n([\s\S]*?)\n<\/script>/)[1]);
} else {   // dépôt sans captures : extrait suffisant de la même page
  data = { js_WonderTextHead: 'Temple de Poséidon', js_WonderTextCooldown: '',
           js_WonderTextDuration: { countdown: { enddate: 1794321390, currentdate: 1794307204,
                                                  timeout_ajaxrequest: '?view=temple&cityId=18979&position=23' } } };
}
const avant = Date.now(), m = readTempleMiracle(data);
t('nom du miracle lu', m && m.name === 'Temple de Poséidon', m && m.name);
const left = m && m.activeEnd - avant;
t('fin = maintenant + (enddate − currentdate) = 3h 56m 26s', m && Math.abs(left - 14186000) < 2000, left);
t('pas de rechargement en cours', m && m.cooldownEnd === null);
t('emplacement du Temple lu (23)', m && m.position === 23);
t('miracle inactif : pas de fin', readTempleMiracle({ js_WonderTextHead: 'Forge de Héphaïstos', js_WonderTextDuration: '' }).activeEnd === null);
t('page sans miracle : rien', readTempleMiracle({}) === null);
// --- Affichage
const ui = s.slice(s.indexOf('function impMiracleGod(name) {'), s.indexOf('function impBlessMakeCaption() {'));
const fmt = s.slice(s.indexOf('function impBlessFmtRemaining(ms) {'), s.indexOf('function impBlessFmtPct(v) {'));
const h = s.match(/function __impH\(value\) \{[\s\S]*?\n\}/)[0];
const now = Date.now();
const city = (id, name, isl, xy) => ({ getId: () => id, getName: () => name, getIslandId: () => isl, getIslandCoordinates: () => xy });
const villes = [city(18979, 'G - Marbre 4', 501, [51, 54]), city(18980, 'G - Marbre 5', 501, [51, 54]), city(18977, 'G - Vin 1', 502, [50, 52])];
const store = {
  501: { name: 'Temple de Poséidon', activeEnd: now + 14186000, cooldownEnd: null, position: 23, cityId: 18979, readAt: now },
  502: { name: 'Forge de Héphaïstos', activeEnd: null, cooldownEnd: now + 3600e3, position: 7, cityId: 18977, readAt: now },
  777: { name: 'Bosquet d’Hadès', activeEnd: now + 3600e3, cityId: 1, readAt: now },   // île sans ville à moi
};
const IkaTools = { EmpireData: { getIslandMiracles: () => store, getOwnCities: () => villes } };
const api = new Function('$', 'IkaTools', h + fmt + ui + 'return { impMiracleChips, impMiracleGod };')($, IkaTools);
const html = api.impMiracleChips(now);
const d = $('<div>' + html + '</div>');
t('un seul miracle montré : l\'actif sur une de mes îles', d.find('.imp-miracle-chip').length === 1, d.find('.imp-miracle-chip').length);
t('libellé : Poséidon [51:54] 3h 56m', d.find('.imp-miracle-chip').text() === 'Poséidon [51:54] 3h 56m', d.find('.imp-miracle-chip').text());
t('décompte et Temple (ville, emplacement) dans le lien', d.find('[data-imp-miracle-end]').length === 1 &&
  d.find('.imp-miracle-chip').attr('data-imp-miracle-city') === '18979' && d.find('.imp-miracle-chip').attr('data-imp-miracle-pos') === '23');
t('infobulle : villes de l\'île', /G - Marbre 4, G - Marbre 5/.test(d.find('.imp-miracle-chip').attr('title')));
t('nom du dieu : « Bosquet d’Hadès » -> Hadès', api.impMiracleGod('Bosquet d’Hadès') === 'Hadès');
store[501].activeEnd = now - 1000;
t('miracle terminé : plus rien', api.impMiracleChips(now) === '');
t('barre : miracles à droite, après « Sanctuaire lu »', /'<\/span>' \+\s*\(miracles \? '<span class="imp-miracle-bar">/.test(s));
t('barre affichée s\'il n\'y a qu\'un miracle', /if \(!ids\.length && !miracles\) return '';/.test(s));
t('décompte : un miracle terminé disparaît', /\$\('\[data-imp-miracle-end\]'\)\.each/.test(s) && /\$e\.remove\(\);/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
