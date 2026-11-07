const fs=require('fs'); const s=fs.readFileSync(process.argv[2],'utf8');
let ok=0,ko=0; const t=(n,c,x='')=>{ if(c){ok++;console.log('PASS',n)} else {ko++;console.log('FAIL',n,x)} };
// Silencieux
const blk=s.match(/\(function installGameCreateErrorSilencer\(\) \{[\s\S]*?\n\}\)\(\);/)[0];
let handler=null, infos=0; const win={addEventListener:(type,f)=>{ if(type==='error') handler=f; }};
new Function('unsafeWindow','window','console',blk)(win,win,{info(){infos++}});
const fire=(message,filename)=>{ let prevented=false; handler({message,filename,preventDefault(){prevented=true},stopImmediatePropagation(){}}); return prevented; };
const G='https://s1-fr.ikariam.gameforge.com';
t('SyntaxError sur ?view=city masquée', fire("Uncaught SyntaxError: Unexpected token '<'", G+'/?view=city&oldBackgroundView=island&mainbox_x=259'));
t('SyntaxError sur index.php?view=city masquée', fire("Uncaught SyntaxError: Unexpected token '<'", G+'/index.php?view=city&x=1'));
t("'reading create' du code du jeu masquée", fire("Uncaught TypeError: Cannot read properties of undefined (reading 'create')", 'https://gf3.geo.gfsrv.net/cdn/1129e5bcd2b2d7edbdcaff08ceeadd.js'));
t("'reading create' d'un autre domaine masquée", fire("Uncaught TypeError: Cannot read properties of undefined (reading 'create')", 'https://cdn.example.net/1129e5bc.js'));
t('un seul message info', infos===1);
t('erreur Imperator jamais masquée', !fire("Uncaught TypeError: Cannot read properties of undefined (reading 'create')", 'chrome-extension://x/userscript.html?name=Imperator-v2.22.user.js'));
t("SyntaxError d'une autre vue non masquée", !fire("Uncaught SyntaxError: Unexpected token '<'", G+'/?view=cityMilitary&x=1'));
t('autre erreur du jeu non masquée', !fire("Uncaught TypeError: x is not a function", 'https://gf3.geo.gfsrv.net/cdn/a.js'));
t('installé une seule fois', (()=>{ let n=0; const w2={__imp_create_error_silencer:true, addEventListener(){n++}}; new Function('unsafeWindow','window','console',blk)(w2,w2,console); return n===0; })());
// Échappement
const h=s.match(/function __impH\(value\) \{[\s\S]*?\n\}/)[0]; const H=new Function(h+'return __impH;')();
t('échappe < > & " \'', H(`<img src=x onerror="a('b')">&`)==='&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;');
t('null -> vide, accents intacts', H(null)==='' && H('G - Cité 3 é')==='G - Cité 3 é');
const uses=(s.match(/__impH\(/g)||[]).length; t('11 points échappés (+ définition)', uses===13, uses);
t('plus de filtre basé sur le domaine gfsrv', !/gfsrv\\\.net\|\\\.geo\\\.gf/.test(s));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko?1:0);
