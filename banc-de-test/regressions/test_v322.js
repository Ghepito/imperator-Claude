// v3.22 : vin juste nécessaire selon la satisfaction sans vin et l'objectif choisi.
const fs = require('fs'), path = require('path');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
const v = (s.match(/@version\s+([0-9.]+)/) || [])[1] || '0', nv = v.split('.').map(Number);
t('version >= 3.22', nv[0] > 3 || (nv[0] === 3 && nv[1] >= 22), v);
t('nom et version d\'accord', (s.match(/@name\s+Imperator v([0-9.]+)/) || [])[1] === v);
const arr = (k) => JSON.parse('[' + s.match(new RegExp(k + ':\\[([^\\]]*)\\]'))[1] + ']');
const T = { wineServe: arr('wineServe'), maxBonus: s.match(/maxBonus:\[60,120,181[^\]]*\]/)[0].replace('maxBonus:', '') };
T.maxBonus = JSON.parse(T.maxBonus);
t('table du vin servi : niveau 26 = 150, 25 = 139, 24 = 128', T.wineServe[26] === 150 && T.wineServe[25] === 139 && T.wineServe[24] === 128);
t('table des bonus : 1 807 / 1 725 / 1 644 (captures de la taverne)', T.maxBonus[25] === 1807 && T.maxBonus[24] === 1725 && T.maxBonus[23] === 1644);
const a = s.indexOf('function impWinePlan(city) {'), b = s.indexOf('function impSigned(n)', a);
let target = '10';
const IkaTools = { Constants: { BuildingData: { tavern: T }, Buildings: { TAVERN: 'tavern' } }, View: { gameTimeNow: () => 0 } };
const wineTarget = { getValue: () => target };
const plan = new Function('IkaTools', 'wineTarget', s.slice(a, b) + 'return impWinePlan;')(IkaTools, wineTarget);
const city = (base, lvl) => ({ getSatisfactionNoWine: () => base, getSatisfactionNoWineUpdated: () => 1,
  getTavernWineLevel: () => lvl, getBuildingByType: () => ({ getLevel: () => 41 }) });
// G - Soufre 1 (taverne du 12 nov.) : sans vin -1712, niveau 26 servi -> +95
let p = plan(city(-1712, 26));
t('Soufre 1 : satisfaction actuelle +95', p.sat === 95, p.sat);
t('objectif ≥ +10 : 139/h suffisent (+13), économie 11/h', p.need === 25 && p.needAmount === 139 && p.satNeed === 13 && p.amount - p.needAmount === 11, JSON.stringify(p));
target = '50'; p = plan(city(-1712, 26));
t('objectif ≥ +50 : 150/h nécessaires, pas d\'excès', p.need === 26 && p.needAmount === 150);
target = '0'; p = plan(city(-1712, 26));
t('objectif ≥ 0 : 139/h', p.need === 25);
// Cristal 2 (captures) : 150 -> contente, 139 -> neutre, 128 -> triste ; sans vin ≈ -1700
target = '10'; p = plan(city(-1700, 24));
t('Cristal 2 à 128/h : triste (-56), 139/h suffiraient', p.sat === -56 && p.need === 25 && p.reachable, JSON.stringify(p));
p = plan(city(-5000, 26));
t('inatteignable : signalé', p.reachable === false && p.maxAmount === 438);
t('satisfaction inconnue : rien affiché', plan(city(null, 26)) === null);
// Lectures
t('Hôtel de ville : satisfaction - bonus du vin', /city\._updateSatisfactionNoWine\(_sat - \(isFinite\(_wb\) \? _wb : 0\), changes\);/.test(s));
t('taverne : startSatisfaction lu', /params\.startSatisfaction != null \? Number\(params\.startSatisfaction\)/.test(s));
t('taverne : l\'« économie du pressoir » n\'est plus soustraite', /var net = Math\.max\(0, amountPerHour \|\| 0\);/.test(s));
t('réglage de l\'objectif (neutre, +10, contente)', /'wine_target_full_city',\s*'10',/.test(s) && /showEspionageOverview, blessSoonThreshold, wineTarget\]/.test(s));
// Niveau servi depuis la consommation (liste du jeu)
const g = s.slice(s.indexOf('var wineServe = Constants.BuildingData[Constants.Buildings.TAVERN].wineServe;'));
t('niveau servi : 150/h -> 26 (liste du jeu)', /wineServe\[i\] >= baseWineConsumption - 0\.5\) \{ wineLevel = i; break; \}/.test(g));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
