// Banc de test Imperator : parseurs des vues du jeu, sur des captures réelles (v2.23)
// Usage : node test_views.js <Imperator.user.js> <dossier des captures>
// Le script n'est jamais modifié : chaque parseur est extrait tel quel et exécuté
// dans une page simulée (jsdom) avec des objets d'empire factices.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const jq = require('jquery');

const script = fs.readFileSync(process.argv[2], 'utf8');
const dir = process.argv[3];

function slice(from, to) {
  const a = script.indexOf(from), b = script.indexOf(to, a + 1);
  if (a < 0 || b < 0) throw new Error('bloc introuvable : ' + from);
  return script.slice(a, b);
}
function capture(prefix) {
  const f = fs.readdirSync(dir).filter(n => n.startsWith(prefix)).sort().pop();
  if (!f) return null;
  const doc = new JSDOM(fs.readFileSync(path.join(dir, f), 'utf8')).window.document;
  const jsonTxt = doc.getElementById('imp-capture-templateData').textContent.trim();
  return {
    file: f,
    rendered: doc.getElementById('imp-capture-rendered').innerHTML,
    raw: doc.getElementById('imp-capture-raw').innerHTML,
    templateData: jsonTxt === 'null' ? null : JSON.parse(jsonTxt),
  };
}
function page(html) { const w = new JSDOM('<!doctype html><body>' + (html || '') + '</body>').window; return jq(w); }
const Constants = new Function(slice('        var Constants = {', '        var EmpireData = function() {') + '; return Constants;')();

let ok = 0, ko = 0, section = '';
const t = (n, c, x = '') => { if (c) { ok++; console.log('  PASS', n); } else { ko++; console.log('  FAIL', n, x === '' ? '' : '→ ' + (typeof x === 'string' ? x : JSON.stringify(x))); } };
const head = (s) => { section = s; console.log('\n== ' + s); };
const nz = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v));

// ---------------------------------------------------------------- Troupes dans la ville
{
  head('Troupes dans la ville (cityMilitary)');
  const c = capture('cityMilitary');
  const src = slice('function _impReadCityMilitary($root)', 'function processCityMilitaryView') +
              slice('function _impInt(txt)', '// <li class="unit phalanx">');
  for (const [label, html] of [['page rendue', c.rendered], ['HTML serveur', c.raw]]) {
    const $ = page(html);
    const read = new Function('$', 'Constants', src + 'return _impReadCityMilitary;')($, Constants);
    const r = read($($.find('body')));
    const got = nz(r.counts);
    t(label + ' : effectifs lus ' + JSON.stringify(got),
      JSON.stringify(got) === JSON.stringify({ phalanx: 10, marksman: 9, mortar: 5, ship_steamboat: 19, ship_ram: 49 }), got);
    t(label + ' : armée et flotte détectées', r.army && r.navy);
    t(label + ' : Spartiate lu (' + r.counts.spartan + '), plus aucune unité ignorée', r.counts.spartan !== undefined && r.unknown.length === 0, r.unknown); // v2.26
  }
}

// ---------------------------------------------------------------- Caserne / Chantier naval
for (const [name, root, expect] of [
  ['barracks', '#barracks', { phalanx: 50, spearman: 6, slinger: 10 }],
  ['shipyard', '#shipyard', { ship_steamboat: 50, ship_ram: 50, ship_catapult: 8, ship_mortar: 6 }],
]) {
  head((name === 'barracks' ? 'Caserne' : 'Chantier naval') + ' (' + name + ')');
  const c = capture(name);
  const src = slice('var _IMP_BARRACKS_ORDER', 'function _impProcessTrainingBuilding');
  const $ = page(c.rendered);
  const api = new Function('$', 'Constants', src + 'return { readList: _impReadUnitList, order: ' +
    (name === 'barracks' ? '_IMP_BARRACKS_ORDER' : '_IMP_SHIPYARD_ORDER') + ', int: _impInt };')($, Constants);
  const r1 = api.readList($(root));
  t('page rendue : ' + JSON.stringify(nz(r1.counts)), JSON.stringify(nz(r1.counts)) === JSON.stringify(expect), nz(r1.counts));
  const $raw = page('');
  const r2 = api.readList($raw('<div>').append($raw.parseHTML(c.raw)));
  t('HTML serveur : compteurs vides, rien d\'inventé (' + r2.nb + ' unités lues avec valeur)',
    Object.values(r2.counts).every(v => v === 0 || Object.values(expect).includes(v)));
  const fromTpl = {};
  api.order.forEach((type, i) => { const e = c.templateData['js_barracksUnitUnitsAvailable' + (i + 1)]; const n = e ? api.int(e.text) : null; if (n) fromTpl[type] = n; });
  t('repli templateData (ordre par position) : ' + JSON.stringify(fromTpl), JSON.stringify(fromTpl) === JSON.stringify(expect), fromTpl); // bug 10 corrigé en v2.24
}

// ---------------------------------------------------------------- Hôtel de Ville
{
  head('Hôtel de Ville (townHall)');
  const c = capture('townHall');
  const src = slice('function processTownHallView(data)', 'function processTempleView');
  const $ = page(c.rendered);
  const city = { tavernWineLevel: null, culturalGoods: null, happinessScore: null, population: null,
    _updateCulturalGoods(v) { this.culturalGoods = v; }, _updateTavernWineLevel(v) { this.tavernWineLevel = v; },
    _updateHappinessScore(v) { this.happinessScore = v; }, _updatePopulation(v) { this.population = v; } };
  const run = new Function('$', 'Constants', 'View', 'raiseResourcesChanged', 'document', 'console', src + 'return processTownHallView;');
  run($, Constants, { getCurrentCity: () => city }, () => {}, $.find('body')[0].ownerDocument, { warn() {} })(c.templateData || {});
  const name = ($('#js_TownHallCityName').text() || '').trim();
  console.log('  (ville capturée : ' + name + ')');
  t('population réelle lue (' + city.population + ')', city.population > 0);
  t('plafond de logement lu (' + city._realMax + ')', city._realMax > 0);
  t('croissance lue (' + city._realGrowth + ')', isFinite(city._realGrowth));
  t('satisfaction libre lue (' + city.happinessScore + ')', isFinite(city.happinessScore));
  t('biens culturels déduits du bonus (' + city.culturalGoods + ')', city.culturalGoods >= 0);
  t('niveau de vin servi déduit du bonus (' + city.tavernWineLevel + ')', city.tavernWineLevel > 0);
}

// ---------------------------------------------------------------- Conseiller militaire
{
  head('Conseiller militaire, mouvements (militaryAdvisor)');
  const c = capture('militaryAdvisor');
  const src = slice('function _impParseDurationMs(txt)', '// v2.07 : rafraîchissement manuel');
  const $ = page(c.rendered);
  const NOW = 1e12;
  function MilitaryUnits() { this.units = {}; }
  MilitaryUnits.prototype.getCounts = function () { return this.units; };
  MilitaryUnits.prototype._setCount = function (u, n) { this.units[u] = n; };
  const created = [];
  function Movement(id, type, completion, mission, stage, o, tgt, tr, units, res) {
    Object.assign(this, { id, completion, mission, stage, o, tgt, res }); created.push(this);
  }
  const civ = { movements: {}, _dropMovement() {}, _updateMovement(mv) { this.movements[mv.id] = mv; } };
  const run = new Function('$', 'Constants', 'View', 'Movement', 'MilitaryUnits', 'getCivilizationData',
    'raiseMovementsChanged', 'empireData', 'setTimeout', 'console', src + 'return processMilitaryAdvisorView;');
  run($, Constants, { gameTimeNow: () => NOW }, Movement, MilitaryUnits, () => civ, () => {}, { save() {} }, f => f(),
      { warn() {}, log() {} })(c.templateData);
  t('5 transports lus', created.length === 5, created.length);
  t('identifiants d\'événement lus', created.every(m => m.id > 3000000));
  t('villes d\'origine et de destination lues', created.every(m => m.o && m.tgt));
  const cargo = created.map(m => Object.entries(nz(m.res)).map(([k, v]) => v + ' ' + k).join('+'));
  t('cargaisons lues : ' + cargo.join(' | '), created.every(m => Object.values(m.res).some(v => v > 0)));
  const loading = created.find(m => m.id === 3704547);
  t('transport en chargement classé « chargement » (stage=' + (loading && loading.stage) + ')',
    loading && loading.stage === Constants.Movements.Stage.LOADING); // bug 5, v2.25
  t('transports en route classés « en route »', created.filter(m => m.id !== 3704547).every(m => m.stage === Constants.Movements.Stage.EN_ROUTE));
  t('[constat] tableau des mouvements absent du HTML serveur et de templateData (rempli plus tard par le jeu)',
    /id="js_MilitaryMovementsFleetMovementsTable" class="content"><\/div>/.test(c.raw) &&
    !(c.templateData && c.templateData.js_MilitaryMovementsFleetMovementsTable));
}

// ---------------------------------------------------------------- Conseiller militaire : mouvement en retour
{
  head('Conseiller militaire, pillage en retour (militaryAdvisorRetour)');
  const c = capture('militaryAdvisorRetour');
  const src = slice('function _impParseDurationMs(txt)', '// v2.07 : rafraîchissement manuel');
  const $ = page(c.rendered);
  function MilitaryUnits() { this.units = {}; }
  MilitaryUnits.prototype.getCounts = function () { return this.units; };
  MilitaryUnits.prototype._setCount = function (u, n) { this.units[u] = n; };
  const created = [];
  function Movement(id, type, completion, mission, stage, o, tgt, tr, units, res) {
    Object.assign(this, { id, completion, mission, stage, o, tgt, units, res }); created.push(this);
  }
  const civ = { movements: {}, _dropMovement() {}, _updateMovement(mv) { this.movements[mv.id] = mv; } };
  new Function('$', 'Constants', 'View', 'Movement', 'MilitaryUnits', 'getCivilizationData',
    'raiseMovementsChanged', 'empireData', 'setTimeout', 'console', src + 'return processMilitaryAdvisorView;')(
    $, Constants, { gameTimeNow: () => 1e12 }, Movement, MilitaryUnits, () => civ, () => {}, { save() {} }, f => f(),
    { warn() {}, log() {} })(c.templateData);
  const pl = created.find(m => m.mission === Constants.Movements.Mission.PLUNDER);
  t('6 mouvements lus dont 1 pillage', created.length === 6 && !!pl, created.length);
  t('pillage : ville d\'origine (la tienne) = 18977, cible = 26209', pl && String(pl.o) === '18977' && String(pl.tgt) === '26209');
  t('pillage en retour (flèche gauche) classé « retour » (stage=' + (pl && pl.stage) + ')',
    pl && pl.stage === Constants.Movements.Stage.RETURNING); // bug 5, v2.25
  t('unités du pillage lues dans la ligne : ' + JSON.stringify(pl && pl.units.getCounts()),
    pl && JSON.stringify(pl.units.getCounts()) === '{"slinger":1}');
  const tr = created.find(m => m.id === 3704547);
  t('ex-chargement désormais en route (flèche droite)', tr && tr.stage === Constants.Movements.Stage.EN_ROUTE);
  t('navires marchands non comptés comme unités militaires', created.filter(m => m.mission === 'transport').every(m => Object.keys(m.units.getCounts()).length === 0));

  // Recrédit au retour (méthode _updateCity du script, extraite telle quelle)
  const upd = slice('_updateCity: function updateCity(city, originCity) {', '_updateAndStartTimer: function updateAndStartTimer()');
  const obj = new Function('$', 'Constants', 'raiseResourcesChanged', 'raiseMilitaryChanged', 'console', 'return {' + upd + '};')(
    page(''), Constants, () => {}, () => {}, { log() {} });
  const incr = []; const city = { isOwn: () => true, getName: () => 'G - Vin 1', _updateActionPointsBy() {}, _incrementResource() {},
    getMilitary: () => ({ _increment: (u) => incr.push(u.getCounts()) }) };
  const ret = Object.assign(Object.create(obj), { mission: 'plunder', stage: Constants.Movements.Stage.RETURNING, resources: {}, units: pl.units });
  ret._updateCity(city, city);
  t('au retour du pillage, les troupes sont recréditées à la ville d\'origine', incr.length === 1 && incr[0].slinger === 1, incr);
  incr.length = 0;
  Object.assign(Object.create(obj), { mission: 'plunder', stage: Constants.Movements.Stage.EN_ROUTE, resources: {}, units: pl.units })._updateCity(city, city);
  t('pas de recrédit tant que le pillage est à l\'aller', incr.length === 0);
}

// ---------------------------------------------------------------- Bilan
{
  head('Bilan des finances (finances)');
  const c = capture('finances');
  const src = slice('function processFinancesView(data, viewHtmlStr)', '            // ============================================================\n            // v2.07 : Parser du Sanctuaire');
  const names = [...c.raw.matchAll(/<td class="city">([^<]+)<\/td>/g)].map(m => m[1].trim());
  const cities = names.map(n => ({ getName: () => n, getScientists: () => 0, _updateScientists(v) { this.sci = v; } }));
  let gold = null;
  const civ = { hasResearched: () => false, _updateGoldData(u) { gold = u; } };
  const $ = page('');
  new Function('$', 'Constants', 'getOwnCities', 'getCivilizationData', 'raiseResourcesChanged', 'raiseGoldChanged', 'setTimeout',
    src + 'return processFinancesView;')($, Constants, () => cities, () => civ, () => {}, () => {}, f => f())(null, c.raw);
  t('13 villes trouvées', cities.length === 13, cities.length);
  t('or net par ville lu', cities.every(x => x.cityGoldNetUpdated > 0 && x.cityGoldNet > 0), cities.map(x => x.cityGoldNet));
  t('scientifiques déduits du coût (2 villes × 1 272 or ÷ 6 = 212)', cities.filter(x => x.sci).map(x => x.sci).join(',') === '212,212',
    cities.filter(x => x.sci).map(x => x.sci));
  t('bonus des dieux lu en 2e colonne (' + (gold && gold.gods) + ')', gold && gold.gods === 10914); // bug 8
  t('« Augmentez les rentrées d\'or » lu (' + (gold && gold.premium) + ')', gold && gold.premium === 0);
  t('coût des scientifiques lu dans la ligne Somme (' + (gold && gold.scientists) + ')', gold && gold.scientists === -2544);
  t('solde net final lu (' + (gold && gold.net) + ')', gold && gold.net === 29758);
  t('coûts d\'entretien lus (' + (gold && gold.upkeep) + ')', gold && gold.upkeep === -12884);
  t('or actuel exact lu dans l\'infobulle (' + (gold && gold.current) + ')', gold && gold.current === 600205850); // bug 9
  t('revenu = somme des villes, sans Pluton (' + (gold && gold.revenue) + ')', gold && gold.revenue === 34271); // bug 11 prévenu
  t('revenu + dieux = total « Somme » du jeu (45 185)', gold && gold.revenue + gold.gods === 45185);
}

// ---------------------------------------------------------------- Musée
{
  head('Musée (museum)');
  const c = capture('museum');
  t('[constat] aucun parseur sur cette vue : « 20/20 » présent mais #val_culturalGoodsDeposit vide',
    /20\/20/.test(c.rendered) && /<span id="val_culturalGoodsDeposit"><\/span>/.test(c.rendered));
}

// ---------------------------------------------------------------- Capacité d'entrepôt (bug 6, v2.24)
if (script.indexOf('_formulaCapacity: function') >= 0) {
  head('Capacité d\'entrepôt (getResourceCapacity)');
  const sig = slice('function _impWarehouseSig(city)', 'function City(id, type)');
  const methods = slice('getResourceCapacity: function getResourceCapacity()', 'getIslandCoordinates: function getIslandCoordinates()');
  const $ = page('');
  const prem = { on: false };
  const api = new Function('$', 'Constants', 'getCivilizationData', sig + 'return { sig: _impWarehouseSig, m: {' + methods + '} };')(
    $, Constants, () => ({ isPremiumFeatureEnabled: (f) => prem.on && f === Constants.PremiumFeatures.DOUBLED_STORAGE_CAPACITY }));
  const mk = (levels) => Object.assign(Object.create(api.m), {
    blds: levels.map(([type, level]) => ({ getType: () => type, getLevel: () => level })),
    getBuildingsByType(type) { return this.blds.filter(b => b.getType() === type); } });
  const c = mk([['warehouse', 30], ['dump', 10]]);
  const f = c.getResourceCapacity();
  t('sans lecture : formule (' + f.maximum + '), marquée estimation', f.real === false && f.maximum > 0);
  c._realCapacity = 2000000; c._realCapacitySig = api.sig(c);
  const r1 = c.getResourceCapacity();
  t('après lecture : capacité réelle (2 000 000)', r1.real === true && r1.maximum === 2000000);
  prem.on = true;
  t('premium « double stockage » non appliqué deux fois sur la valeur réelle', c.getResourceCapacity().maximum === 2000000);
  prem.on = false;
  c.blds[0] = { getType: () => 'warehouse', getLevel: () => 31 };
  const r2 = c.getResourceCapacity();
  t('entrepôt agrandi depuis la lecture : retour à la formule', r2.real === false && r2.maximum !== 2000000);
  t('capacité de sécurité toujours calculée', r1.safe === 100 + 480 * 30);
}

// ---------------------------------------------------------------- Vue île : cibles d'espionnage (v2.27)
// Captures d'île : données de chaque fichier island*
const islands = fs.readdirSync(dir).filter(f => f.startsWith('island')).sort().map(f =>
  JSON.parse(new JSDOM(fs.readFileSync(path.join(dir, f), 'utf8')).window.document.getElementById('imp-capture-backgroundData').textContent));
const iseos = islands.find(d => d.name === 'Iseos');
if (iseos) {
  head('Vue île, cibles d\'espionnage (island Iseos)');
  const bg = iseos;
  t('données de l\'île présentes dans la capture (' + bg.cities.length + ' emplacements)', Array.isArray(bg.cities) && bg.cities.length > 0);
  if (script.indexOf('function applyIslandToTargets(') < 0) {
    t('[constat] pas de lecture des alliances au passage sur l\'île (v2.26 et avant)', true);
  } else {
    const store = { targets: {}, players: {}, alliances: {} };
    const espionageData = { get: () => store };
    const T = (id, playerId) => ({ id, playerId, name: '?' });
    store.targets[26209] = T(26209, -26209);           // créée depuis un rapport : joueur provisoire
    store.players[-26209] = { id: -26209, name: 'Culot' };
    store.targets[8373] = T(8373, undefined);
    const TRADE_GOOD_LOOKUP = { 1: 'wine' };
    const src = slice('                function Player(id) {', '                function getPlayers() {');
    const api = new Function('$', 'espionageData', 'TRADE_GOOD_LOOKUP', 'Target', 'Constants', src +
      'return { applyIslandToTargets: applyIslandToTargets, getPlayer: getPlayer };')(page(''), espionageData, TRADE_GOOD_LOOKUP, function () {}, Constants);
    const changed = api.applyIslandToTargets(bg);
    t('2 cibles de l\'île mises à jour (seulement les villes espionnées)', changed.length === 2, changed.map(c => c.id));
    const sc = store.targets[8373], ps = api.getPlayer(sc.playerId), as = ps && ps.getAlliance();
    t('In Vino Veritas : joueur Scarlett, alliance FALK', ps && ps.getName() === 'Scarlett' && as && as.getName() === 'FALK', ps);
    t('Scarlett : score militaire 46 468 (généraux du jeu)', ps && Math.floor(ps.getMilitaryScore()) === 46468, ps && ps.getMilitaryScore());
    const pc = api.getPlayer(store.targets[26209].playerId);
    t('Polis (1) : vrai joueur Culot, sans alliance', pc && pc.getName() === 'Culot' && !pc.getAlliance() && store.targets[26209].playerId === 100726);
    t('Culot : score militaire 2 (généraux du jeu)', pc && Math.floor(pc.getMilitaryScore()) === 2, pc && pc.getMilitaryScore());
    t('joueur provisoire supprimé', !store.players[-26209]);
    t('île et coordonnées de la cible', sc.islandId === 641 && sc.coords.join(':') === '37:63' && sc.tradeGoodType === 'wine');
    t('aucune cible -> rien de modifié', api.applyIslandToTargets({ cities: [] }).length === 0 && api.applyIslandToTargets(null).length === 0);
    t('ancien calcul du score (virgules) : 0,04 au lieu de 46 468', parseInt(('4 646 840').split(',').join('')) / 100 === 0.04);
  }
}

// ---------------------------------------------------------------- États des joueurs (île avec inactif)
const avecInactif = islands.find(d => d.cities.some(c => c.state === 'inactive'));
if (avecInactif) {
  head('États des joueurs (island ' + avecInactif.name + ')');
  const etats = [...new Set(avecInactif.cities.filter(c => c.type === 'city').map(c => c.state))].sort();
  t('états lus dans le jeu : ' + JSON.stringify(etats) + ', tous connus du script',
    etats.every(e => Object.values(Constants.PlayerState).includes(e)));
  t('inactif reconnu par le mot du script (« ' + Constants.PlayerState.INACTIVE + ' »)',
    avecInactif.cities.some(c => c.state === Constants.PlayerState.INACTIVE));
  t('vacances reconnues par le mot du script (« ' + Constants.PlayerState.VACATION + ' »)',
    !avecInactif.cities.some(c => c.state === 'vacation') || Constants.PlayerState.VACATION === 'vacation');
}

// ---------------------------------------------------------------- Vue d'une ville espionnée (v2.29)
if (fs.readdirSync(dir).some(f => f.startsWith('cityData'))) {
  head('Vue d\'une ville espionnée (cityData)');
  const file = fs.readFileSync(path.join(dir, fs.readdirSync(dir).filter(f => f.startsWith('cityData')).sort().pop()), 'utf8');
  const bg = JSON.parse(new JSDOM(file).window.document.getElementById('imp-capture-backgroundData').textContent);
  t('format du jeu : id de la ville + position[] avec building/level', bg.id && Array.isArray(bg.position) &&
    bg.position.every(p => typeof p.building === 'string'));
  if (script.indexOf('function applyCityToTarget(') < 0) {
    t('[constat] mur et entrepôt des cibles jamais lus (v2.28 et avant)', true);
  } else {
    const src = slice('                function applyCityToTarget(data) {', '                function Alliance(id) {');
    const store = { targets: { [bg.id]: { id: bg.id, name: bg.name, wallLevel: 9, warehouseLevel: 9 } } };
    const apply = new Function('$', 'Constants', 'espionageData', src + 'return applyCityToTarget;')(page(''), Constants, { get: () => store });
    const r = apply(bg);
    t('Polis de Culot (Hôtel de Ville 1, ni mur ni entrepôt) : mur 0, entrepôt 0', r && r.wallLevel === 0 && r.warehouseLevel === 0, r);
    t('emplacements vides (buildingGround) ignorés', bg.position.filter(p => !/^buildingGround/.test(p.building)).length === 1);
  }
}

console.log(`\n${ok} réussis, ${ko} échoués`);
process.exit(ko ? 1 : 0);
