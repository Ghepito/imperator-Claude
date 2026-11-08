// v2.34 : joueur, alliance et coordonnées lus dans la Cachette.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const C = new Function(s.slice(s.indexOf('        var Constants = {'), s.indexOf('        var EmpireData = function() {')) + ';return Constants;')();
const re = s.match(/var urlParamsRegex = [^\n]*/)[0];
const pu = s.slice(s.indexOf('            function parseUrlParams(url) {'), s.indexOf('\n            }\n', s.indexOf('            function parseUrlParams(url) {')) + 15);
const $0 = require('jquery')(new JSDOM('').window);
const Utils = { parseUrlParams: new Function('$', re + '\n' + pu + 'return parseUrlParams;')($0) };
const loopA = s.indexOf("                                        var newTargets = [];"), loopB = s.indexOf("                                        if (newTargets.length > 0) {", loopA);
const model = s.slice(s.indexOf('                function Player(id) {'), s.indexOf('                function getPlayers() {'));

function run(html, store) {
  const w = new JSDOM('<!doctype html><body>' + html + '</body>').window, $ = require('jquery')(w);
  function Target(id) { this.id = id; }
  return new Function('$', 'Utils', 'Constants', 'espionageData', 'TRADE_GOOD_LOOKUP', 'Target',
    model + s.slice(loopA, loopB) + 'return { newTargets: newTargets, getPlayer: getPlayer };')(
    $, Utils, C, { get: () => store }, {}, Target);
}
const caps = path.join(__dirname, '..', 'captures');
const f = fs.existsSync(caps) && fs.readdirSync(caps).find(n => n.startsWith('safehouse'));
const html = f ? new JSDOM(fs.readFileSync(path.join(caps, f), 'utf8')).window.document.getElementById('imp-capture-raw').innerHTML
  : `<div id="tabSafehouse"><div class="spyinfo"><ul><li class="user"><a href="index.php?view=avatarProfile&avatarId=100266">Deus</a>
     [<a href="index.php?view=allyPage&allyId=56">Folie</a>]</li><li class="city"><a href="index.php?view=city&cityId=2890">Polis (37:63)</a></li></ul></div>
     <div class="spyinfo"><ul><li class="user"><a href="index.php?view=avatarProfile&avatarId=100726">Culot</a></li>
     <li class="city"><a href="index.php?view=city&cityId=26209">Polis (37:63)</a></li></ul></div></div>`;

// 1) cibles nouvelles
const store = { targets: {}, players: {}, alliances: {} };
const r = run(html, store);
const deus = store.targets[2890], culot = store.targets[26209];
t('2 cibles créées depuis la Cachette', r.newTargets.length === 2 && deus && culot, r.newTargets.length);
t('coordonnées lues entre parenthèses : 37:63 (au lieu de 0:0)', deus.coords.join(':') === '37:63' && culot.coords.join(':') === '37:63');
t('nom de ville sans les coordonnées : « Polis »', deus.name === 'Polis');
const pd = r.getPlayer(deus.playerId);
t('Polis 2890 : joueur Deus (100266)', deus.playerId === 100266 && pd && pd.getName() === 'Deus');
t('alliance Folie (56) dès la Cachette', pd && pd.getAlliance() && pd.getAlliance().getName() === 'Folie' && pd.allianceId === 56);
const pc = r.getPlayer(culot.playerId);
t('Polis 26209 : joueur Culot, sans alliance', culot.playerId === 100726 && pc && pc.getName() === 'Culot' && !pc.getAlliance());

// 2) cible existante avec joueur provisoire et coordonnées 0:0 (v2.33 et avant)
const s2 = { targets: {}, players: { '-2890': { name: 'Deus' } }, alliances: {} };
s2.targets[2890] = { id: 2890, name: 'Polis', coords: [0, 0], playerId: -2890 };
const r2 = run(html, s2);
t('cible existante : coordonnées corrigées, joueur provisoire remplacé', s2.targets[2890].coords.join(':') === '37:63' &&
  s2.targets[2890].playerId === 100266 && !s2.players['-2890']);
// 3) le score militaire déjà connu n'est pas écrasé
const s3 = { targets: {}, players: {}, alliances: {} };
run(html, s3); s3.players[100266].militaryScore = 7; s3.players[100266].state = 'inactive';
run(html, s3);
t('score militaire et état déjà lus sur l\'île conservés', s3.players[100266].militaryScore === 7 && s3.players[100266].state === 'inactive');
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
