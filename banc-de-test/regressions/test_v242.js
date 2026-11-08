// v2.42 : croissance plafonnée signalée ; popup « Planifier » ancré au sommet de la fenêtre du bâtiment.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 2.42', _ge(_n(_v), _n('2.42')) >= 0, _v);
t('croissance : valeur plafonnée marquée « plein »', /var capped = growth \+ data\.population > data\.max;/.test(s) &&
  /imp_growth_full/.test(s) && /growthIn\(1\), growthIn\(24\), growthIn\(168\)/.test(s));
t('popup : ancrage dans la fenêtre du bâtiment', /dockWhenWindowOpens\(pop\);/.test(s) && /\.mainContentBox/.test(s) &&
  /p\._observer\.disconnect\(\)/.test(s));
// Comportement : popup près de la cellule, puis bandeau en haut de la fenêtre quand elle apparaît.
const { JSDOM } = require('jsdom');
const debut = s.indexOf('(function () {\n  \'use strict\';\n\n  var CELL'), fin = s.indexOf('})();', debut) + 5;
const dom = new JSDOM('<body><a class="imperator_tool_tip" id="Building_18978_23">34</a><div id="container"></div></body>', { runScripts: 'outside-only' });
dom.window.eval(s.slice(debut, fin));
const d = dom.window.document;
d.getElementById('Building_18978_23').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
const pop = d.querySelector('.imp-cr-pop');
t('popup ouvert au clic', !!pop && pop.parentNode === d.body);
d.getElementById('container').innerHTML = '<div id="temple" class="mainContentBox"><div class="hd header mainHeader">Temple</div><div class="mainContent"><div class="center"><img></div></div></div>';
setTimeout(() => {
  // v2.43 : le bandeau reste dans <body> (au-dessus de la fenêtre du jeu), il en suit la position.
  t('popup passé en bandeau quand la fenêtre du bâtiment s\'ouvre', pop.parentNode === d.body && pop.classList.contains('imp-cr-dock'));
  // Clic sur « Planifier » : l'image publicitaire du jeu ne reçoit rien, Chantiers est appelé.
  let pub = 0, ouvert = 0;
  d.getElementById('temple').addEventListener('click', () => pub++);
  d.addEventListener('click', e => { if (e.target.closest && e.target.closest('.imp-cr-pop')) pub++; });
  dom.window.ImperatorOpenChantiers = () => ouvert++;
  pop.querySelector('.imp-cr-plan').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  t('Planifier : Chantiers ouvert, le clic ne va pas au jeu', ouvert === 1 && pub === 0 && !d.querySelector('.imp-cr-pop'));
  console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
}, 20);
