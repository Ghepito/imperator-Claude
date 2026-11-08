// v2.36 : export des données (registre des Data.Value, bouton Debug).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const $ = require('jquery')(new (require('jsdom').JSDOM)('').window);
const a = s.indexOf('        var Data = function() {'), b = s.indexOf('        var UI = function() {');
const store = {};
const Data = new Function('$', 'window', 'View', 'GM_setValue', 'GM_getValue', 'Logging', 'ikaToolsVersion',
  s.slice(a, b) + 'return Data;')($, { addEventListener() {} }, { getDomain: () => 's17-fr' },
  (k, v) => { store[k] = v; }, k => store[k], { debug() {}, debuggable: (l, f) => f }, '1');
const e = new Data.Value('empireData', {}, { version: 28 }), sp = new Data.Value('espionageData', {}, { version: 1 });
t('registre : chaque donnée sauvegardée est listée', Data.listValues().length === 2 && Data.listValues()[0] === e);
t('clés du jeu (domaine + nom + version)', /^s17-fr\/empireData\/28-/.test(e.key) && /^s17-fr\/espionageData\//.test(sp.key));
const r = s.slice(s.indexOf('    var dataExportSetting = settings.html('), s.indexOf('    var refreshDataSetting = settings.html('));
t('bouton « Exporter mes données » dans Réglages > Debug', /Exporter mes données/.test(r) && /viewCaptureSetting, dataExportSetting\]\)/.test(s));
t('export : sauvegarde en attente écrite d\'abord', /if \(v\.needsSave\) v\.doSave\(true\)/.test(r));
t('export : fichier téléchargé, rien envoyé sur le réseau', /download = name/.test(r) && !/GM_xmlhttpRequest|\$\.ajax|fetch\(/.test(r));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
