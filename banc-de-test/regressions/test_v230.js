const fs=require('fs'); const s=fs.readFileSync(process.argv[2],'utf8');
let ok=0,ko=0; const t=(n,c,x='')=>{ if(c){ok++;console.log('PASS',n)} else {ko++;console.log('FAIL',n,x)} };
t('icône du Spartiate : image du jeu, 2 tableaux', (s.match(/th\.military_spartan \{ \\\nbackground-image:url\("\/cdn\/all\/both\/ikipedia\/319\.png"\)/g)||[]).length===2);
t('ancien nom d\'image supposé retiré', s.indexOf('y60_spartan_faceright')<0);
t('icône du Spartiate ajustée à la case', /ikipedia\/319\.png"\); \\\nbackground-size: contain;/.test(s));
const i=s.indexOf('    var localizations = {'), L=new Function(s.slice(i, s.indexOf('    var localizer = ',i))+';return localizations;')();
t('« dashboard » n\'est plus parmi les bâtiments (fr)', !('dashboard' in L.fr.buildings) && !('dashboard' in L.en.buildings));
t('onglet Tableau de bord toujours traduit', L.fr.misc.dashboard==='Tableau de bord' && L.en.misc.dashboard==='Dashboard');
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko?1:0);
