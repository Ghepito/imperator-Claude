// v3.24 : propriétaire à côté du nom des villes (vue île).
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', nv = v.split('.').map(Number);
t('version >= 3.24', nv[0] > 3 || (nv[0] === 3 && nv[1] >= 24), v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === v);
t('branché même si la page ne s\'ouvre pas sur une île', /if \(showCityOwners\.isEnabled\(\)\) \{/.test(s) && !/showCityOwners\.isEnabled\(\) && IkaTools\.View\.viewIsIsland\(\)/.test(s));
const { JSDOM } = require('jsdom');
const cap = path.join(__dirname, '..', 'captures', 'island_14h12.html');
let html, bg;
if (fs.existsSync(cap)) {
  const f = fs.readFileSync(cap, 'utf8');
  html = f.match(/<template id="imp-capture-rendered">([\s\S]*?)<\/template>/)[1];
  bg = JSON.parse(f.match(/id="imp-capture-backgroundData">\n([\s\S]*?)\n<\/script>/)[1]);
} else {
  html = '<span id="js_cityLocation0TitleText">A</span><span id="js_cityLocation1TitleText">B</span><span id="js_cityLocation2TitleText"></span>';
  bg = { cities: [{ type: 'city', name: 'A', ownerName: 'Pierre' }, { type: 'city', name: 'B', ownerName: 'Paul' }, { type: 'buildplace' }] };
}
const w = new JSDOM('<body>' + html + '</body>', { runScripts: 'outside-only' }).window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const $ = w.jQuery;
const a = s.indexOf('var doLabelCities = function doLabelCities(data) {'), b = s.indexOf('addedStyles += \'#island .city', a);
let island = true;
const IkaTools = { View: { viewIsIsland: () => island } };
const label = new Function('$', 'IkaTools', s.slice(a, b) + 'return doLabelCities;')($, IkaTools);
const villes = bg.cities.map((c, i) => [i, c]).filter(([i, c]) => c && c.type !== 'buildplace');
label(bg);
const [i0, c0] = villes[0];
const txt = (i) => w.document.getElementById('js_cityLocation' + i + 'TitleText').textContent;
t('nom + propriétaire : « ' + c0.name + ' (' + c0.ownerName + ') »', txt(i0) === c0.name + ' (' + c0.ownerName + ')', txt(i0));
t('toutes les villes de l\'île (' + villes.length + ') étiquetées, sans s\'arrêter', villes.every(([i, c]) => txt(i) === c.name + ' (' + c.ownerName + ')'));
label(bg); label(bg);
t('pas de doublon à chaque mise à jour', txt(i0) === c0.name + ' (' + c0.ownerName + ')', txt(i0));
island = false; const avant = txt(i0); label({ cities: [{ type: 'city', name: 'X', ownerName: 'Y' }] });
t('hors vue île : rien n\'est touché', txt(i0) === avant);
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
