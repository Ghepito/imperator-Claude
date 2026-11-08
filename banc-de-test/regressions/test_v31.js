// v3.1 : historique des alertes (enregistrement, lecture, non lues, vidage, affichage).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.1', _ge(_n(_v), _n('3.1')) >= 0, _v);

// Le module, isolé, avec une fausse sauvegarde Tampermonkey et le vrai jQuery.
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<body></body>', { runScripts: 'outside-only' });
const w = dom.window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const debut = s.indexOf('    // v3.1 : historique des alertes de bureau.');
const fin = s.indexOf('\n', s.indexOf('function impAlertHistoryStyles() {'));
const finStyles = s.indexOf('\n    }\n', fin) + 7;
const code = s.slice(debut, finStyles);
const h = s.match(/function __impH\(value\) \{[\s\S]*?\n\}/)[0];
const store = {};
w.GM_getValue = (k, d) => (k in store ? store[k] : d);
w.GM_setValue = (k, v) => { store[k] = v; };
w.GM_addStyle = () => {};
w.eval(h + `
  var IkaTools = { Data: { Value: function (key, def) { this.key = key; this.data = def;
    this.load = function () { var r = JSON.parse(GM_getValue(this.key, 'null')); if (r !== null) this.data = r; return this.data; };
    this.save = function () { GM_setValue(this.key, JSON.stringify(this.data)); }; } } };
  var localizer = { localize: function (a, k) { return k; } };
` + code + `
  window.__ah = { add: impAlertHistoryAdd, list: impAlertHistoryList, unread: impAlertHistoryUnread,
                  show: impAlertHistoryShow, clear: impAlertHistoryClear, onChange: impAlertHistoryOnChange };`);
const ah = w.__ah;
let changes = 0; ah.onChange(() => changes++);
ah.add('Mission mise à jour', 'Chargement de Transport terminé à G - Vin 1', true);
ah.add('Bâtiment terminé', '<b>G - Marbre 4</b>', false);
t('deux alertes enregistrées, la plus récente en premier', ah.list().length === 2 && ah.list()[0].title === 'Bâtiment terminé');
t('deux non lues', ah.unread() === 2);
t('le compteur est prévenu à chaque ajout', changes === 2);
t('alerte non affichée marquée', ah.list()[0].shown === false && ah.list()[1].shown === true);
for (let i = 0; i < 60; i++) ah.add('A' + i, '', true);
t('50 alertes au plus', ah.list().length === 50 && ah.list()[0].title === 'A59');
ah.show();
const d = w.document, p = d.getElementById('ImperatorAlertHistory');
t('panneau affiché, non lues en gras', !!p && p.querySelectorAll('li.imp_ah_unread').length === 50);
t('textes échappés', !p.innerHTML.includes('<b>G - Marbre'));
t('ouverture : tout passe en lu', ah.unread() === 0);
p.querySelector('.imp_ah_close').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
t('fermeture', !d.getElementById('ImperatorAlertHistory'));
ah.show(); d.querySelector('.imp_ah_clear').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
t('Vider : liste vide et message', ah.list().length === 0 && /alert_history_empty/.test(d.getElementById('ImperatorAlertHistory').textContent));
// Une alerte écrite par un autre onglet est relue
store[Object.keys(store)[0]] = JSON.stringify([{ time: Date.now(), title: 'Autre onglet', text: '', shown: true, read: false }]);
t('alerte d\'un autre onglet relue', ah.unread() === 1 && ah.list()[0].title === 'Autre onglet');
// Branchements
t('impNotify enregistre (affichée ou non), pas le test', (s.match(/if \(!opts\.test\) impAlertHistoryAdd\(/g) || []).length === 3 && /test: true,/.test(s));
t('entrée Alertes dans le menu de gauche', /concat\(\[new IkaTools\.UI\.LeftMenu\.Item\(leftMenuAlertsContent\)\]\)/.test(s) &&
  /leftMenuAlertsContent\.mousedown\(function\(\) \{ impAlertHistoryShow\(\); \}\)/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
