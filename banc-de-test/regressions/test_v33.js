// v3.3 : recherche/h mise à jour dès la confirmation des chercheurs ; infobulles au-dessus du curseur en bas de fenêtre.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.3', _ge(_n(_v), _n('3.3')) >= 0, _v);

// Estimation de la recherche/h, isolée telle qu'elle est dans le script
const a = s.indexOf('            function estimateResearchPerHour(');
const b = s.indexOf('\n            }\n', a) + 14;
const code = s.slice(a, b);
const villes = [];
const mk = (sci, rph) => ({ researchPerHour: rph, getScientists: () => sci });
const est = new Function('$', 'getOwnCities', code + ';return estimateResearchPerHour;')(
  { each: (arr, f) => arr.forEach((v, i) => f(i, v)) }, () => villes);
const ici = mk(0, 0);
villes.push(ici, mk(318, 540), mk(200, 340), mk(0, 0));
t('même rendement qu\'avant (318 → 159 chercheurs : 270)', est(ici, 318, 540, 159) === 270);
t('0 → 5 chercheurs : rendement moyen des autres villes (880/518 × 5 ≈ 8)', est(ici, 0, 0, 5) === Math.round(880 / 518 * 5));
t('0 chercheur : 0 point', est(ici, 318, 540, 0) === 0);
villes.length = 0; villes.push(ici);
t('aucune référence : formule du modèle (null)', est(ici, 0, 0, 5) === null);

t('confirmation : recherche/h estimée avant de prévenir l\'onglet', /city\._updateResearchPerHour\(estimateResearchPerHour\(\n\s+city, oldScientists, city\.researchPerHour, scientists\), changes\);\n\s+city\._updateScientists\(scientists, changes\);/.test(s));
t('puis valeur exacte lue dans l\'académie', /setTimeout\(function readExactResearch\(\)/.test(s));
t('séparateurs de milliers ignorés à la lecture', /el\.text\(\)\.replace\(\/\[\^0-9\]\/g, ''\)/.test(s));

// Infobulle : au-dessus du curseur si elle dépasse le bas de la fenêtre
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<body></body>', { runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const f0 = s.indexOf('                _fitInViewport: function _fitInViewport() {');
const f1 = s.indexOf('\n                },\n', f0) + 19;
w.eval('window.__fit = {' + s.slice(f0, f1) + '};');
const fit = w.__fit._fitInViewport;
const $ = w.jQuery;
const box = $('<div style="position:absolute"/>').appendTo(w.document.body);
const inner = $('<div class="tool_tip_container" style="position:absolute"/>').appendTo(box);
const h = { toolTipContainer: box, options: { offsetY: 20, toolTipContainer: inner } };
Object.defineProperty(w.document.documentElement, 'clientHeight', { value: 600 });
w.innerHeight = 600;
box.outerHeight = () => 0;            // v3.4 : la boîte porteuse n'a pas de hauteur (contenu en absolu)
inner.outerHeight = () => 200;
w.jQuery.fn.outerHeight = function () { return this[0] === inner[0] ? 200 : 0; };
h._lastPageY = 100; box.css('top', '120px'); fit.call(h);
t('en haut de la fenêtre : sous le curseur', box.css('top') === '120px', box.css('top'));
h._lastPageY = 550; box.css('top', '570px'); fit.call(h);
t('en bas de la fenêtre : au-dessus du curseur', box.css('top') === '340px', box.css('top'));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
