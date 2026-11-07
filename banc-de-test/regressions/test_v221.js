const fs=require('fs'); const s=fs.readFileSync(process.argv[2],'utf8');
let ok=0,ko=0; const t=(n,c,x='')=>{ if(c){ok++;console.log('PASS',n)} else {ko++;console.log('FAIL',n,x)} };
// Imperator localizations
const a=s.indexOf('    var localizations = {'), b=s.indexOf('    var localizer = new IkaTools.Intl.Localizer(localizations);');
const L=new Function(s.slice(a,b)+'; return localizations;')();
t('Imperator : seulement en + fr', JSON.stringify(Object.keys(L))==='["en","fr"]', Object.keys(L));
const missing=[]; (function walk(e,f,p){ for(const k in e){ if(typeof e[k]==='object'){ walk(e[k],(f||{})[k],p+k+'.'); } else if(!f||f[k]===undefined) missing.push(p+k);} })(L.en,L.fr,'');
t('toutes les clés anglaises existent en français', missing.length===0, missing.join(', '));
const all=[]; (function walk(o){for(const k in o){ typeof o[k]==='object'?walk(o[k]):all.push(o[k]);}})(L.fr);
t('plus de textes allemands en fr', !all.some(v=>/Optionen|speichern|Einstellungen/.test(v)));
t('Soufre / Marché noir / Tireur d\'élite', L.fr.resources.sulfur==='Soufre' && L.fr.buildings.blackMarket==='Marché noir' && L.fr.units.marksman==="Tireur d'élite");
t('navires remis dans le bon ordre', L.fr.units.ship_paddlespeedship==='Bateau rapide à aubes' && L.fr.units.ship_tender==='Bateau de soutien');
// IkaTools
const c=s.indexOf('var baseLocalizer = new Localizer({'), d=s.indexOf('// fin internationalisation');
const blk=s.slice(c+'var baseLocalizer = new Localizer('.length, s.lastIndexOf('});',d)+1);
const I=new Function('return '+blk)();
t('IkaTools : seulement en + fr', JSON.stringify(Object.keys(I))==='["en","fr"]', Object.keys(I));
t('IkaTools fr : Options du script / Réglages / Enregistrer', I.fr.settings.script_settings==='Options du script'&&I.fr.settings.settings==='Réglages'&&I.fr.settings.save==='Enregistrer');
t('séparateur de milliers fr inchangé (point)', I.fr.formatting.thousandsSeparator==='.');
// Langue par défaut
const m=s.match(/function configureLocalization\(\) \{([\s\S]*?)\n    \}\n/);
const run=(host,saved)=>{ let got=[]; const fake={setPreferredLanguage:l=>got.push(l)}; new Function('localizedLanguage','document','localizer','IkaTools',m[1])({getValue:()=>saved},{location:{host}},fake,{Intl:{localizer:fake}}); return got[0]; };
t('s1-fr.ikariam.gameforge.com -> fr', run('s1-fr.ikariam.gameforge.com','')==='fr');
t('s3-en.ikariam.gameforge.com -> en', run('s3-en.ikariam.gameforge.com','')==='en');
t('serveur .com -> en (plus turc)', run('s1.ikariam.com','')==='en');
t('s2-de -> en (langue retirée)', run('s2-de.ikariam.gameforge.com','')==='en');
t('ancien réglage tr enregistré -> en', run('s1-fr.ikariam.gameforge.com','tr')==='en');
t('choix Français forcé -> fr', run('s3-en.ikariam.gameforge.com','fr')==='fr');
t('menu Langue : 3 choix', /'Automatique': '',\s*'Français': 'fr',\s*'English': 'en',\s*\}/.test(s));
// Code mort
t('code mort retiré (hors en-tête)', !/probablysafealert|jsonResponseRegex|\/\*bindEventArgs|\/\*startIntervalSend|\/\*toIslandView|\/\/isMaxLevel/.test(s.slice(s.indexOf('==/UserScript=='))));
t('v2.20 conservée (notifications, maxlevel)', /function impNotify/.test(s) && /data\.maxlevel != null/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko?1:0);
