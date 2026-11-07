const fs=require('fs'); const s=fs.readFileSync(process.argv[2],'utf8');
let ok=0,ko=0; const t=(n,c,x='')=>{ if(c){ok++;console.log('PASS',n)} else {ko++;console.log('FAIL',n,x)} };
// --- plus de requêtes de l'Espionnage
const a=s.indexOf('function Target(id)'), b=s.indexOf('function startTracking()');
const esp=s.slice(a,b);
t('module Espionnage : aucun chargement en arrière-plan', a>0 && b>a && !/backgroundFetch/.test(esp));
t('_refresh rappelle directement', /_refresh: function refresh\(hasSpiesPresent, callback\) \{\s*callback\(\);\s*\}/.test(s));
t('code mort retiré', !/addTargetById|_refreshCityCallback|_refreshIslandCallback/.test(s.slice(s.indexOf('==/UserScript=='))));
// --- mur et entrepôt
const src=s.slice(s.indexOf('                function applyCityToTarget(data) {'), s.indexOf('                function Alliance(id) {'));
const store={targets:{555:{id:555,name:'Cible',wallLevel:0,warehouseLevel:0}}};
const $={each:(o,f)=>{ if(Array.isArray(o)) o.forEach((v,i)=>f(i,v)); else Object.keys(o).forEach(k=>f(k,o[k])); }};
const Constants={Buildings:{WALL:'wall',WAREHOUSE:'warehouse'}};
const apply=new Function('$','Constants','espionageData',src+'return applyCityToTarget;')($,Constants,{get:()=>store});
const pos=[{building:'townHall',level:'30'},{building:'warehouse',level:'20'},{building:'buildingGround land'},
           {building:'warehouse constructionSite',level:'18',completed:'1'},{building:'tavern',level:'40'}];
pos[14]={building:'wall',level:'35'};
const r=apply({id:'555',position:pos});
t('vue ville d\'une cible : mur 35, entrepôts 20 + 18', r && r.wallLevel===35 && r.warehouseLevel===38, r);
t('ville non espionnée : ignorée', apply({id:'18977',position:pos})===null);
t('vue île : ignorée', apply({id:'555',cities:[],position:pos})===null);
t('données vides : rien modifié', apply({id:'555',position:[]})===null && store.targets[555].warehouseLevel===38);
// pillable : protection 480 par niveau d'entrepôt + 100
const prot = 480*38+100;
t('protection de l\'entrepôt prise en compte (' + prot + ')', /RESOURCE_PROTECTION_WAREHOUSE\) \* this\.warehouseLevel/.test(s));
// --- capture de la vue ville
const blk=s.match(/\(function installViewCapture\(\) \{[\s\S]*?\n\}\)\(\);/)[0];
let cb=null; const T={CHANGE_VIEW:'changeView',UPDATE_TEMPLATE_DATA:'updateTemplateData',ADD_WINDOW:'addWindow',CREATE_VIEW:'createView',UPDATE_BACKGROUND_DATA:'updateBackgroundData',UPDATE_GLOBAL_DATA:'updateGlobalData'};
const IkaTools={View:{registerIkariamAjaxResponseCallback:(f)=>{cb=f;}},Utils:{iterateIkariamAjaxResponse:(r,f)=>r.forEach((it,i)=>f(i,it[0],it[1]))},Constants:{IkariamAjaxResponseType:T}};
const win={}; const doc={getElementById:()=>null,createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
new Function('window','IkaTools','document','$','setTimeout','setInterval','clearInterval','GM_info','Blob','URL','console',blk)
 (win,IkaTools,doc,()=>({first(){return this},text(){return 'v17.6.1'}}),()=>0,()=>0,()=>0,{script:{version:'2.29'}},function(){},{createObjectURL:()=>'',revokeObjectURL(){}},{log(){},warn(){}});
for(let i=0;i<5;i++) cb([['updateBackgroundData',{id:String(i),position:[{building:'wall',level:'1'}]}]]);
t('vue ville : une seule place (cityData)', Object.keys(win.__impCaptures).join()==='cityData' && /"id": "4"/.test(win.__impCaptures.cityData.backgroundData));
cb([['updateBackgroundData',{id:'7',cities:[{id:'1'}]}]]);
t('vue île toujours retenue', !!win.__impCaptures.island);
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko?1:0);
