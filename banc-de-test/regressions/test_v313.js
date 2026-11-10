// v3.13 : popup « Planifier » invisible jusqu'à l'ouverture de la fenêtre du bâtiment.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.13', _ge(_n(_v), _n('3.13')) >= 0, _v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === _v);
t('classe d\'attente invisible', /\.imp-cr-pop\.imp-cr-wait\{visibility:hidden !important\}/.test(s));
const { JSDOM } = require('jsdom');
const debut = s.indexOf('(function () {\n  \'use strict\';\n\n  var CELL'), fin = s.indexOf('})();', debut) + 5;
function page() {
  const dom = new JSDOM('<body><a class="imperator_tool_tip" id="Building_18978_23">34</a><div id="container"></div></body>', { runScripts: 'outside-only' });
  dom.window.eval(s.slice(debut, fin));
  const d = dom.window.document;
  d.getElementById('Building_18978_23').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  return { dom, d, pop: d.querySelector('.imp-cr-pop') };
}
// 1. La fenêtre s'ouvre : le popup n'apparaît qu'à ce moment, déjà en bandeau.
const a = page();
t('au clic : popup créé mais en attente (invisible)', !!a.pop && a.pop.classList.contains('imp-cr-wait'));
a.d.getElementById('container').innerHTML = '<div id="temple" class="mainContentBox"><div class="mainHeader">Temple</div><div class="mainContent"></div></div>';
setTimeout(() => {
  t('fenêtre ouverte : visible, directement en bandeau', !a.pop.classList.contains('imp-cr-wait') && a.pop.classList.contains('imp-cr-dock'));
  // 2. Aucune fenêtre : après 3 s, visible près de la case.
  const b = page();
  // jsdom ne calcule pas de mise en page : on simule une case visible à l'écran.
  b.d.getElementById('Building_18978_23').getClientRects = () => [{ left: 40, top: 40, width: 20, height: 12 }];
  // 3. Aucune fenêtre et la case a disparu : retiré.
  const c = page(); c.d.getElementById('Building_18978_23').remove();
  setTimeout(() => {
    t('pas de fenêtre en 3 s, case présente : affiché près de la case', !!b.d.querySelector('.imp-cr-pop') && !b.pop.classList.contains('imp-cr-wait') && !b.pop.classList.contains('imp-cr-dock'));
    t('pas de fenêtre, case disparue : popup retiré', !c.d.querySelector('.imp-cr-pop'));
    console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
  }, 3150);
}, 30);
