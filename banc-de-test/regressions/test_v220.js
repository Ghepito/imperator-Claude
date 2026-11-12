const fs=require('fs'); const s=fs.readFileSync(process.argv[2],'utf8');
let ok=0, ko=0; const t=(n,c)=>{ if(c){ok++;console.log('PASS',n)} else {ko++;console.log('FAIL',n)} };
// --- isMaxLevel ---
const m=s.match(/\n {16}isMaxLevel: function isMaxLevel\(\) \{([\s\S]*?)\n                \},/);
const BuildingData={ warehouse:{maxlevel:85}, foo:{} };
// v2.31 : isMaxLevel consulte aussi l'aide du jeu (getHelpCost) ; ici, aide vide.
const isMax=new Function('Constants','getHelpCost','return function(){'+m[1]+'}')({BuildingData},()=>null);
const B=(type,level,upg,real)=>({getType:()=>type,getLevel:()=>level,isUpgrading:()=>upg,realUpgradeCost:real});
t('niveau 85/85 = max', isMax.call(B('warehouse',85,false))===true);
t('niveau 84 = pas max', isMax.call(B('warehouse',84,false))===false);
t('84 en cours -> max', isMax.call(B('warehouse',84,true))===true);
t('table en retard mais coût réel proposé -> pas max', isMax.call(B('warehouse',85,false,{forLevel:85}))===false);
t('bâtiment inconnu -> pas max', isMax.call(B('foo',10,false))===false);
// --- niveau de vin --- (v3.22 : recherche dans la liste du vin servi, wineServe, et non plus maxWine)
const w=s.match(/var wineServe = Constants\.BuildingData\[Constants\.Buildings\.TAVERN\]\.wineServe;([\s\S]*?)\n                        \}\n/);
const tav=s.match(/maxWine:\[([\d,]+)\]/)[1].split(',').map(Number);
const serve=s.match(/wineServe:\[([\d,]+)\]/)[1].split(',').map(Number);
const level=(base)=>{let got=null; const self={_updateTavernWineLevel:(l)=>got=l}; new Function('Constants','baseWineConsumption','changes','var wineServe=Constants.BuildingData.tavern.wineServe;'+w[1]+'}').call(self,{BuildingData:{tavern:{maxWine:tav,wineServe:serve}},Buildings:{TAVERN:'tavern'}},base,[]); return got;};
t('70 niveaux dans maxWine', tav.length===70);
t('conso 0 -> niveau 0', level(0)===0);
t('conso 2 -> niveau 1', level(2)===1);
t('conso 150 -> niveau 26', level(150)===26);
t('conso 438 -> niveau 41', level(438)===41);
t('conso NaN -> pas de mise à jour', level(NaN)===null);
// --- dashboard ---
t('dashboard production x3600', /production\[res\] \+= \(r\.getProduction\(\) \|\| 0\) \* IkaTools\.Constants\.Time\.SECONDS_PER_HOUR/.test(s));
const autonomy=(stock,perSec)=>Math.floor(stock/(perSec*3600)/24);
t('autonomie: 100000 vin, 300/h -> 13 j', autonomy(100000,300/3600)===13);
// --- notifications ---
t('plus aucun appel webkitNotifications', !/window\.webkitNotifications/.test(s));
t('grant GM_notification', /@grant\s+GM_notification/.test(s));
const h=s.match(/function impNotify\(opts\) \{[\s\S]*?\n    \}\n/)[0];
let sent=null; const impNotify=new Function('GM_notification','impBeep','window','console','impAlertHistoryAdd',h+'return impNotify;')((d)=>sent=d,()=>{}, {focus(){}}, {log(){},warn(){}}, ()=>{});
t('impNotify envoie titre/texte', impNotify({title:'A',text:'B'})===true && sent.title==='A' && sent.timeout===15000);
impNotify({title:'X',sound:true,sticky:true}); t('alerte collante sans timeout + texte non vide', sent.timeout===undefined && sent.text===' ');
t('icône rouge conseiller non masquée', !/removeClass\('normalalert'\)/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko?1:0);
