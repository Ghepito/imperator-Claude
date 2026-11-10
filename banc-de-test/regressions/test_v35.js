// v3.5 : voyant d'expérience de l'académie (états, lancement, lecture de l'académie, badge).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const _v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', _n = v => v.split('.').map(Number), _ge = (a, b) => (a[0] - b[0]) || ((a[1] || 0) - (b[1] || 0));
t('version >= 3.5', _ge(_n(_v), _n('3.5')) >= 0, _v);

const debut = s.indexOf('        // v3.2 : colonne Recherche de l\'onglet Ressources.');
const fin = s.indexOf('\n        }\n', s.indexOf('function impExperimentState(')) + 11;
const code = s.slice(debut, fin);
const format = function () { const a = arguments; let i = 0; return this.replace(/%s/g, () => a[i++]); };
const R = new Function('String', 'String.prototype.format = ' + format.toString() + ';\n' + code +
  ';return { unit: impResearchUnitCost, xp: impExperimentState };')(String);

const H = 3600e3, now = 1e12;
t('cristal ≥ 300 000 : vert', R.xp(300000, 0, now, false).state === 'ready');
t('240 000 à 299 999, parchemin inconnu : orange', R.xp(250000, 0, now, null).state === 'scroll');
t('240 000 à 299 999, parchemin présent : orange', R.xp(240000, 0, now, true).state === 'scroll');
const ns = R.xp(250000, 0, now, false);
t('240 000 à 299 999, pas de parchemin : rouge (noscroll)', ns.state === 'blocked' && ns.reason === 'noscroll');
const cr = R.xp(182000, 0, now, true);
t('moins de 240 000 : rouge (cristal), manque 58 000', cr.state === 'blocked' && cr.reason === 'crystal' && cr.missing === 58000);
const cd = R.xp(900000, now + 2 * H, now, true);
t('labo en remise en état : rouge, temps restant', cd.state === 'blocked' && cd.reason === 'cooldown' && cd.remaining === 2 * H);
t('fin du délai : de nouveau vert', R.xp(900000, now, now, true).state === 'ready');
t('coût d\'un chercheur lu à l\'académie (7 - impôt 3 = 4)', R.unit(-999, 1, 6, 7) === 4);
t('sans académie lue : comme avant', R.unit(-1272, 318, 6, 0) === 4 && R.unit(0, 0, 6, undefined) === 6);

// Lecture de l'académie (capture du 10 nov. 2026) et lancement
t('académie : coût et points par chercheur lus (callback_data)', /cb\.researchProductionFactor > 0\) city\._updateResearchFactor/.test(s) &&
  /_updateAcademyData\(\{ costPerScientist: Number\(cb\.costPerScientist\) \}\)/.test(s));
t('académie : parchemin d\'Athéna lu (load_js)', /typeof params\.hasAthenaScroll === 'boolean'/.test(s));
t('académie revisitée : labo « vu »', /city\._ackExperiment\(\);\n\s+raiseResourcesChanged\(changes\);/.test(s));
t('formulaire accelResearchForm suivi', /form\.id == 'accelResearchForm'\) \{\n\s+processExperimentForm\(form\);/.test(s));
t('lancement : labo indisponible 4 h', /var EXPERIMENT_COOLDOWN = 4 \* Constants\.Time\.MILLIS_PER_HOUR;/.test(s) &&
  /city\._markExperimentLaunched\(launchedAt \+ EXPERIMENT_COOLDOWN\);/.test(s));
t('refus du jeu : rien n\'est enregistré', /if \(failure && !success\) return;/.test(s));
t('voyant dans le lien vers l\'académie', /<span id="%s" class="imp_rs_lamp imp_rs_lamp_%s"><\/span>%s<\/a>/.test(s));
t('clignotement à la fin du délai', /lastXp\.reason == 'cooldown' && now\.reason != 'cooldown'/.test(s));
t('compteur dans l\'en-tête', /id="ResearchExperimentCount" class="imp_rs_head_count"/.test(s));

// Badge du titre : module isolé
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<html><head><title>Ikariam</title></head><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window;
w.eval(fs.readFileSync(require.resolve('jquery1'), 'utf8'));
const m0 = s.indexOf('(function installExperienceBadge() {');
const m1 = s.indexOf('})();', m0) + 5;
const mk = (readyAt, ack, crystal) => ({ getExperimentReadyAt: () => readyAt, isExperimentAcknowledged: () => ack,
  getResource: () => ({ getCurrent: () => crystal }) });
const N = Date.now();
w.__villes = [mk(N - 1000, false, 300000), mk(N - 1000, true, 300000), mk(N + H, false, 300000), mk(N - 1000, false, 1000), mk(0, false, 900000)];
w.eval('var IkaTools = { EmpireData: { getOwnCities: function () { return window.__villes; } }, Constants: { Resources: { GLASS: "glass" } } };');
w.eval(s.slice(m0, m1));
setTimeout(() => {
  t('titre : (1) pour un seul labo redevenu disponible, non vu, avec du cristal', w.document.title === '(1) Ikariam', w.document.title);
  w.__villes[0] = mk(N - 1000, true, 300000);
  w.eval('setTimeout(function(){}, 0)');
  console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
}, 600);
