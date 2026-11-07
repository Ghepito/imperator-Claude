#!/usr/bin/env node
// Assemble les fichiers de src/ (dans l'ordre de src/ordre.txt) en un seul Imperator.user.js,
// le fichier que Tampermonkey installe.
//
//   node outils/assembler.js             écrit Imperator.user.js
//   node outils/assembler.js --verifier  vérifie que Imperator.user.js est à jour, sans rien écrire
//
// Les fichiers sont recollés tels quels, octet pour octet : aucun ajout, aucun retrait.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const racine = path.join(__dirname, '..');
const src = path.join(racine, 'src');
const cible = path.join(racine, 'Imperator.user.js');

const ordre = fs.readFileSync(path.join(src, 'ordre.txt'), 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

// Tout fichier .js de src/ doit figurer dans ordre.txt (sinon il serait oublié en silence)
const tous = [];
(function lister(dir) {
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n);
    if (fs.statSync(p).isDirectory()) lister(p);
    else if (n.endsWith('.js')) tous.push(path.relative(src, p).split(path.sep).join('/'));
  }
})(src);
const oublies = tous.filter(f => !ordre.includes(f));
const absents = ordre.filter(f => !tous.includes(f));
if (oublies.length || absents.length) {
  if (oublies.length) console.error('Fichiers de src/ absents de ordre.txt :', oublies.join(', '));
  if (absents.length) console.error('Fichiers de ordre.txt introuvables :', absents.join(', '));
  process.exit(2);
}

const morceaux = ordre.map(f => fs.readFileSync(path.join(src, f)));
const resultat = Buffer.concat(morceaux);
const empreinte = b => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
const version = (resultat.toString('utf8').match(/^\/\/ @version\s+(\S+)/m) || [])[1] || '?';

if (process.argv.includes('--verifier')) {
  const actuel = fs.existsSync(cible) ? fs.readFileSync(cible) : Buffer.alloc(0);
  if (Buffer.compare(actuel, resultat) === 0) {
    console.log(`Imperator.user.js à jour (v${version}, ${ordre.length} fichiers, empreinte ${empreinte(resultat)})`);
    process.exit(0);
  }
  console.error(`Imperator.user.js n'est PAS identique à l'assemblage de src/ ` +
                `(fichier ${empreinte(actuel)}, assemblage ${empreinte(resultat)}). Lancer : node outils/assembler.js`);
  process.exit(1);
}

fs.writeFileSync(cible, resultat);
console.log(`Imperator.user.js écrit : v${version}, ${ordre.length} fichiers, ` +
            `${resultat.length} octets, empreinte ${empreinte(resultat)}`);
