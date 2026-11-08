// v2.43 : réouverture de Chantiers/Boissons sur la confirmation du transport (le jeu reste sur le port).
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let ok = 0, ko = 0;
const t = (n, c, x = '') => { if (c) { ok++; console.log('PASS', n); } else { ko++; console.log('FAIL', n, x); } };
t('version >= 2.43', /@version        2\.4[3-9]\n/.test(s));
const i = s.indexOf('function __impInitTransportReopen(){'), bloc = s.slice(i, s.indexOf('function __impProtectedPanel(){', i));
t('écoute l\'envoi du formulaire de transport', /registerAjaxFormSubmitCallback\(function\(form\)/.test(bloc) &&
  /form\.id!=='transport' && form\.id!=='transportForm'/.test(bloc));
t('rouvre seulement si le serveur confirme (retour de type 10)', /PROVIDE_FEEDBACK/.test(bloc) && /data\[0\]\.type==10\) success=true/.test(bloc) &&
  /if \(!success\) return;/.test(bloc));
t('onglet demandé retenu au moment de l\'envoi', /var which=window\.__impReopenAfterTransport;/.test(bloc));
t('la réouverture au retour à la ville reste en place', /view===IkaTools\.Constants\.View\.CITY_DETAIL && window\.__impReopenAfterTransport/.test(bloc));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
