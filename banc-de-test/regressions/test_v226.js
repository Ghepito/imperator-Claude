const fs=require('fs'); const s=fs.readFileSync(process.argv[2],'utf8');
let ok=0,ko=0; const t=(n,c,x='')=>{ if(c){ok++;console.log('PASS',n)} else {ko++;console.log('FAIL',n,x)} };
// --- Spartiate
t('constante SPARTAN', /SPARTAN: 'spartan'/.test(s));
t('identifiant 319 -> spartan', /319: 'spartan'/.test(s));
const ud=s.match(/\n {16}spartan: \{[\s\S]*?\n {16}\},/);
t('UnitData spartan (armée, vitesse, cale)', ud && /isArmy: true/.test(ud[0]) && /speed: 60/.test(ud[0]) && /cargoSize: 5/.test(ud[0]));
t('noms fr et en', /spartan: 'Spartiate'/.test(s) && /spartan: 'Spartan'/.test(s));
t('colonne Armée (ligne de front)', /STEAM_GIANT,\s*IkaTools\.Constants\.Military\.SPARTAN\]\}/.test(s));
t('icônes CSS (Armée + Espionnage)', (s.match(/th\.military_spartan \{/g)||[]).length===2);
t('pas dans l\'ordre de la caserne (non recrutable)', !/_IMP_BARRACKS_ORDER = \[[^\]]*SPARTAN/.test(s));
// --- Capture île
const blk=s.match(/\(function installViewCapture\(\) \{[\s\S]*?\n\}\)\(\);/)[0];
let cb=null, timers=[], clicked=null;
const T={CHANGE_VIEW:'changeView',UPDATE_TEMPLATE_DATA:'updateTemplateData',ADD_WINDOW:'addWindow',CREATE_VIEW:'createView',UPDATE_BACKGROUND_DATA:'updateBackgroundData',UPDATE_GLOBAL_DATA:'updateGlobalData'};
const IkaTools={View:{registerIkariamAjaxResponseCallback:(f)=>{cb=f;}},Utils:{iterateIkariamAjaxResponse:(r,f)=>r.forEach((it,i)=>f(i,it[0],it[1]))},Constants:{IkariamAjaxResponseType:T}};
const dom={island:{outerHTML:'<div id="island"><div class="city">X</div></div>'}};
const document={getElementById:id=>dom[id]||null, createElement:()=>({click(){clicked=this.download}, remove(){}}), body:{appendChild(){}}};
const win={}; const $=()=>({first(){return this;}, text(){return 'v17.6.1';}});
new Function('window','IkaTools','document','$','setTimeout','setInterval','clearInterval','GM_info','Blob','URL','console',blk)
 (win,IkaTools,document,$,(f)=>timers.push(f),()=>0,()=>0,{script:{version:'2.26'}},function(p){this.p=p},{createObjectURL:()=>'blob:x',revokeObjectURL(){}},{log(){},warn(){}});
cb([['updateGlobalData',{}],['updateBackgroundData',{id:'123',xCoord:'50',yCoord:'60',cities:[{id:'9',ownerName:'Bob',ownerAllyId:'77',ownerAllyTag:'ABC'}],actionRequest:'0123456789abcdef'}]]);
const e=win.__impCaptures.island;
t('données de l\'île retenues', !!e && /"ownerAllyTag": "ABC"/.test(e.backgroundData||''), e);
t('jeton masqué dans les données de l\'île', e && e.backgroundData.indexOf('0123456789abcdef')<0);
timers.forEach(f=>f());
t('page de l\'île capturée', e && /class="city"/.test(e.rendered||''));
const file=win.__impBuildCapture(e);
t('fichier : bloc backgroundData', /<script type="application\/json" id="imp-capture-backgroundData">[\s\S]*ABC/.test(file));
t('téléchargement capture_island_…', win.__impDownloadCapture('island') && /^capture_island_/.test(clicked), clicked);
// île via updateGlobalData (chargement complet)
delete win.__impCaptures.island;
cb([['updateGlobalData',{backgroundData:{id:'5',cities:[{id:'1'}]}}]]);
t('île lue aussi dans updateGlobalData', !!win.__impCaptures.island);
// vue ville (pas de liste de villes) : rien
delete win.__impCaptures.island;
cb([['updateBackgroundData',{id:'18977',position:[]}]]);
t('vue ville ignorée', !win.__impCaptures.island);
// les vues normales sont toujours retenues
cb([['changeView',['tavern','<div></div>']]]);
t('vue normale toujours retenue', !!win.__impCaptures.tavern);
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko?1:0);
