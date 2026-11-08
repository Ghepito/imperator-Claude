// Banc de test Imperator : parseur du Sanctuaire divin sur une capture réelle
// Usage : node test_shrine.js <Imperator.user.js> <capture_shrineOfOlympus.html>
const fs = require('fs');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(process.argv[2], 'utf8');
const captureHtml = fs.readFileSync(process.argv[3], 'utf8');

// 1) Extraire les blocs de la capture
const cap = new JSDOM(captureHtml).window.document;
const rendered = cap.getElementById('imp-capture-rendered').innerHTML;
const raw = cap.getElementById('imp-capture-raw').innerHTML;

// 2) Extraire le parseur du script (sans le modifier)
const a = script.indexOf('            var _shrineLastParsed = 0;');
const b = script.indexOf('            // v2.07 : Capture du VRAI coût');
if (a < 0 || b < 0) throw new Error('parseur du Sanctuaire introuvable dans le script');
const parserSrc = script.slice(a, b);

function runParser(bodyHtml) {
  const dom = new JSDOM('<!doctype html><body>' + bodyHtml + '</body>');
  const $ = require('jquery')(dom.window);
  const cityIds = [...new Set((raw.match(/data-known-city-id="(\d+)"/g) || [])
    .map(x => x.match(/\d+/)[0]).filter(x => x !== '0'))];
  const cities = cityIds.map(id => ({ id, getId: () => id, getName: () => 'Ville ' + id }));
  const shrine = { favor: 0, updated: 0 };
  const civ = {
    getShrineData: () => shrine,
    _updateShrineData: (u) => { for (const k of ['favor', 'updated', 'gods', 'godsUpdated']) if (u[k] !== undefined) shrine[k] = u[k]; },
  };
  const warnings = [];
  const ctx = new Function('$', 'getOwnCities', 'getCivilizationData', 'raiseGoldChanged', 'raiseShrineChanged',
    'empireData', 'setTimeout', 'console',
    parserSrc + '\nreturn { processShrineView: processShrineView, parseShrineDuration: parseShrineDuration };');
  const api = ctx($, () => cities, () => civ, () => {}, () => {}, { save() {}, saveSoon() {} },
    (f) => f(), { warn: (...m) => warnings.push(m.join(' ')), log() {} });
  api.processShrineView(null, raw);
  return { shrine, cities, warnings };
}

let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };

// A) Page rendue (chemin normal en jeu)
const A = runParser(rendered);
const gods = A.shrine.gods || {};
const godIds = Object.keys(gods);
t('aucun avertissement du parseur', A.warnings.length === 0, A.warnings.join(' | '));
t('faveur totale lue', A.shrine.favor > 0, A.shrine.favor);
t('6 dieux lus dans la Vue générale', godIds.length === 6, godIds.join(','));
t('chaque dieu a une durée de protection', godIds.every(g => isFinite(gods[g].graceEnd)), JSON.stringify(gods));
t('chaque dieu a une jauge sur 1000', godIds.every(g => isFinite(gods[g].favor) && gods[g].favorMax === 1000));
const assigned = A.cities.filter(c => c.worshipGodId);
t('toutes les villes de la page ont un dieu affecté', assigned.length === A.cities.length && A.cities.length > 0, assigned.length + '/' + A.cities.length);
t('noms de dieux connus', assigned.every(c => ['Pan', 'Dionysos', 'Tyché', 'Pluton', 'Théia', 'Héphaïstos'].includes(c.worshipGodName)));
t('bénédiction lue pour chaque ville', assigned.every(c => typeof c.worshipGodBonus === 'number' && c.worshipGodBonus > 0),
  assigned.map(c => c.worshipGodBonus).join(','));

// B) HTML brut du serveur seul (repli) : les durées y sont vides, le parseur ne doit rien inventer
const B = runParser(""); if (B.warnings.length) console.log("  avertissements repli :", B.warnings.join(" | "));
const bGods = B.shrine.gods || {};
t('repli brut : affectations quand même lues', B.cities.filter(c => c.worshipGodId).length === B.cities.length && B.cities.length > 0);
t('repli brut : aucune durée inventée', Object.values(bGods).every(g => g.graceEnd === undefined || isFinite(g.graceEnd)));

// Résumé lisible
console.log('\nRésumé de la lecture (page rendue) :');
console.log('  Faveur disponible :', A.shrine.favor);
for (const g of godIds) {
  const e = gods[g];
  const h = Math.round((e.graceEnd - Date.now()) / 3600000);
  console.log(`  ${e.name.padEnd(11)} jauge ${String(e.favor).padStart(4)}/${e.favorMax} · protection « ${e.graceText} » (~${h} h)`);
}
const byGod = {};
assigned.forEach(c => (byGod[c.worshipGodName] = byGod[c.worshipGodName] || []).push(c.worshipGodBonus));
for (const n in byGod) console.log(`  ${n.padEnd(11)} ${byGod[n].length} ville(s), bénédiction ${byGod[n].join(' / ')} %`);
console.log(`\n${ok} réussis, ${ko} échoués`);
process.exit(ko ? 1 : 0);
