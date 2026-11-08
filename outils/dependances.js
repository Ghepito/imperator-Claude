#!/usr/bin/env node
// Carte des dépendances entre les fichiers de src/ (ce que chaque fichier fournit et utilise).
//
//   node outils/dependances.js             écrit docs/DEPENDANCES.md
//   node outils/dependances.js --verifier  vérifie que docs/DEPENDANCES.md est à jour, et que chaque
//                                          fichier (hors enveloppes) se lit seul
//
// « Enveloppe » = fichier *ouverture.js / *fermeture.js : il ouvre ou ferme un bloc (IkaTools,
// EmpireData, Imperator, onglets) et n'est donc pas lisible seul, par construction.
const fs = require('fs'), path = require('path');
const acorn = require('acorn'), eslintScope = require('eslint-scope');

const racine = path.join(__dirname, '..'), src = path.join(racine, 'src');
const cible = path.join(racine, 'docs', 'DEPENDANCES.md');
const ordre = fs.readFileSync(path.join(src, 'ordre.txt'), 'utf8').split('\n').map(l => l.trim())
  .filter(l => l && !l.startsWith('#') && l.endsWith('.js'));
const enveloppe = f => /(ouverture|fermeture)\.js$/.test(f) || f === '00-entete.js';

// Noms fournis par le navigateur, le jeu ou Tampermonkey : pas des dépendances internes
const EXTERNES = new Set(('window document console setTimeout clearTimeout setInterval clearInterval Date Math JSON ' +
  'Object Array String Number Boolean RegExp Error TypeError parseInt parseFloat isNaN isFinite encodeURIComponent ' +
  'decodeURIComponent escape unescape Promise Map Set WeakMap Symbol Proxy Reflect Function Infinity NaN undefined ' +
  'navigator location localStorage sessionStorage Blob URL Notification AudioContext webkitAudioContext Image ' +
  'MutationObserver requestAnimationFrame alert confirm getComputedStyle performance XMLHttpRequest FormData ' +
  'Node Element HTMLElement Event CustomEvent KeyboardEvent DOMParser $ jQuery unsafeWindow GM_getValue GM_setValue ' +
  'GM_addStyle GM_notification GM_xmlhttpRequest GM_info GM_deleteValue GM_listValues ikariam ajax ajaxHandlerCall ' +
  'ajaxHandlerCallFromForm dataSetForView arguments eval globalThis self top parent Intl BigInt Uint8Array ' +
  'ArrayBuffer TextEncoder TextDecoder crypto atob btoa structuredClone queueMicrotask URLSearchParams').split(' '));

const fichiers = ordre.filter(f => !enveloppe(f));
const fournit = {}, utilise = {}, illisibles = [];
for (const f of fichiers) {
  const code = fs.readFileSync(path.join(src, f), 'utf8');
  let ast;
  try { ast = acorn.parse(code, { ecmaVersion: 'latest', allowReturnOutsideFunction: true, ranges: true }); }
  catch (e) { illisibles.push(f + ' : ' + e.message); continue; }
  const sm = eslintScope.analyze(ast, { ecmaVersion: 2022, sourceType: 'script' });
  const g = sm.globalScope;
  fournit[f] = g.variables.map(v => v.name).filter(n => n !== 'arguments');
  utilise[f] = [...new Set(g.through.map(r => r.identifier.name))].filter(n => !EXTERNES.has(n));
}
// Qui fournit quoi (les enveloppes déclarent IkaTools, EmpireData, Imperator, overviewTables)
const proprietaire = {};
for (const f of ordre.filter(enveloppe)) {
  const code = fs.readFileSync(path.join(src, f), 'utf8');
  for (const m of code.matchAll(/(?:var\s+|function\s+)([A-Za-z_$][\w$]*)/g)) if (!(m[1] in proprietaire)) proprietaire[m[1]] = f;
}
for (const f of fichiers) for (const n of (fournit[f] || [])) if (!(n in proprietaire)) proprietaire[n] = f;
const deps = {}, inconnus = {};
for (const f of fichiers) {
  deps[f] = {}; inconnus[f] = [];
  for (const n of (utilise[f] || [])) {
    const o = proprietaire[n];
    if (!o) { inconnus[f].push(n); continue; }
    if (o === f) continue;
    (deps[f][o] = deps[f][o] || []).push(n);
  }
}

// Dépendances circulaires (A utilise B et B utilise A). Liste tolérée : elle ne peut que diminuer.
const BOUCLES_TOLEREES = []; // v2.41 : plus aucune boucle ; toute nouvelle boucle fait échouer les tests
const boucles = [];
for (const a of fichiers) for (const b of Object.keys(deps[a] || {}))
  if (a < b && deps[b] && deps[b][a]) boucles.push(a.replace(/\.js$/, '') + ' <-> ' + b.replace(/\.js$/, ''));

// Couches : un fichier n'utilise que des fichiers de sa couche ou des couches inférieures.
//  1 base (garde-fous, constantes, briques IkaTools)  2 modèle (empire, espionnage)
//  3 façade IkaTools (98-retour, ouverture qui déclare IkaTools)  4 interface Imperator  5 modules ajoutés
function couche(f) {
  if (/^ikatools\/(00-ouverture|98-retour|zz-fermeture)\.js$/.test(f) || f === '03-attente-donnees.js') return 3;
  if (/^ikatools\/empire\/98-retour\.js$/.test(f)) return 3;
  if (/^ikatools\/(empire\/|espionnage)/.test(f)) return 2;
  if (/^(ikatools\/|0[0-2]-)/.test(f)) return 1;
  if (/^imperator\//.test(f)) return 4;
  return 5;
}
const viols = [];
for (const f of fichiers) for (const o of Object.keys(deps[f] || {}))
  if (couche(o) > couche(f)) viols.push(f.replace(/\.js$/, '') + ' (couche ' + couche(f) + ') utilise ' + o.replace(/\.js$/, '') +
                                          ' (couche ' + couche(o) + ') : ' + deps[f][o].join(', '));

const court = f => f.replace(/\.js$/, '');
let md = '# Dépendances entre les fichiers de `src/`\n\n' +
  'Généré par `node outils/dependances.js` : ne pas modifier à la main. ' +
  'Pour chaque fichier, ce qu\'il **fournit** (noms qu\'il déclare) et ce qu\'il **utilise** des autres fichiers.\n\n' +
  'Les fichiers *ouverture* / *fermeture* sont des enveloppes (ils ouvrent ou ferment IkaTools, EmpireData, ' +
  'Imperator, les onglets) : ils ne sont pas lisibles seuls, par construction. Tous les autres le sont.\n\n';
md += '| Fichier | Fournit | Utilise (fichier : noms) |\n|---|---|---|\n';
for (const f of fichiers) {
  const fo = (fournit[f] || []); const d = deps[f] || {};
  const u = Object.keys(d).map(o => '`' + court(o) + '` : ' + d[o].sort().join(', ')).join('<br>');
  md += '| `' + court(f) + '` | ' + (fo.length > 8 ? fo.slice(0, 8).join(', ') + ' … (' + fo.length + ')' : fo.join(', ') || '–') +
        ' | ' + (u || '–') + (inconnus[f].length ? '<br>*hors src (globaux du script)* : ' + inconnus[f].sort().join(', ') : '') + ' |\n';
}
md += '\n## Couches\n\n1 base (garde-fous, constantes, briques IkaTools) → 2 modèle (empire, espionnage) → ' +
  '3 façade IkaTools → 4 interface Imperator → 5 modules ajoutés. Un fichier n\'utilise que sa couche ou les ' +
  'couches inférieures (' + (viols.length ? viols.length + ' écart(s)' : 'aucun écart') + ').\n';
md += '\n## Dépendances circulaires (' + boucles.length + ')\n\n' +
  (boucles.length ? boucles.map(b => '- `' + b + '`').join('\n') : 'Aucune.') + '\n';
md += '\n## Graphe\n\n```mermaid\nflowchart LR\n';
const id = f => court(f).replace(/[^A-Za-z0-9]/g, '_');
for (const f of fichiers) for (const o of Object.keys(deps[f] || {})) md += '  ' + id(f) + '["' + court(f) + '"] --> ' + id(o) + '["' + court(o) + '"]\n';
md += '```\n';

if (process.argv.includes('--verifier')) {
  let ko = 0;
  if (illisibles.length) { ko++; console.error('Fichiers non lisibles seuls :\n  ' + illisibles.join('\n  ')); }
  if (viols.length) { ko++; console.error('Dépendances vers une couche supérieure :\n  ' + viols.join('\n  ')); }
  const nouvelles = boucles.filter(b => !BOUCLES_TOLEREES.includes(b));
  if (nouvelles.length) { ko++; console.error('Nouvelles dépendances circulaires :\n  ' + nouvelles.join('\n  ')); }
  const resolues = BOUCLES_TOLEREES.filter(b => !boucles.includes(b));
  if (resolues.length) console.log('Boucles résolues, à retirer de BOUCLES_TOLEREES : ' + resolues.join(' ; '));
  const fuites = fichiers.filter(f => inconnus[f] && inconnus[f].length).map(f => f + ' : ' + inconnus[f].join(', '));
  if (fuites.length) { ko++; console.error('Noms utilisés mais déclarés nulle part (variables globales implicites ?) :\n  ' + fuites.join('\n  ')); }
  const actuel = fs.existsSync(cible) ? fs.readFileSync(cible, 'utf8') : '';
  if (actuel !== md) { ko++; console.error('docs/DEPENDANCES.md n\'est pas à jour : lancer node outils/dependances.js'); }
  if (!ko) console.log(`Dépendances à jour ; ${fichiers.length} fichiers lisibles seuls, ${ordre.length - fichiers.length} enveloppes, ${boucles.length} boucles tolérées`);
  process.exit(ko ? 1 : 0);
}
fs.writeFileSync(cible, md);
console.log('docs/DEPENDANCES.md écrit (' + fichiers.length + ' fichiers, ' + illisibles.length + ' illisibles)');
if (illisibles.length) console.log(illisibles.join('\n'));
