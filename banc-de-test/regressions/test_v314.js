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
t('miracle inactif : pas de fin', readTempleMiracle({ js_WonderTextHead: 'Forge de Héphaïstos (Niveau 5/5)', js_WonderTextDuration: '' }).activeEnd === null);
t('page sans miracle : rien', readTempleMiracle({}) === null);
// L'affichage (v3.14 : actifs seulement) est remplacé en v3.15 : voir test_v315.js.
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
