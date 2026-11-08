// Lance tous les tests sur ../Imperator.user.js
// Usage : npm test   (depuis le dossier banc-de-test)
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const script = path.join(__dirname, '..', 'Imperator.user.js');
const captures = path.join(__dirname, 'captures');
const runs = [];
// 0) Imperator.user.js doit être exactement l'assemblage de src/
runs.push(['assemblage src/ (identique)', [path.join(__dirname, '..', 'outils', 'assembler.js'), '--verifier']]);

for (const f of fs.readdirSync(path.join(__dirname, 'regressions')).sort()) {
  if (f.endsWith('.js')) runs.push(['regressions/' + f, [path.join('regressions', f), script]]);
}
if (fs.existsSync(captures)) {
  const files = fs.readdirSync(captures);
  const shrine = files.filter(f => f.startsWith('shrine')).sort().pop();
  if (shrine) runs.push(['test_shrine.js', ['test_shrine.js', script, path.join(captures, shrine)]]);
  runs.push(['test_views.js', ['test_views.js', script, captures]]);
} else {
  console.log('(pas de dossier captures/ : test_views et test_shrine ignorés)');
}

// Banc d'affichage (si les données exportées sont présentes dans donnees/)
if (fs.existsSync(path.join(__dirname, 'donnees', 'export.json'))) {
  runs.push(['affichage/instantanes.js', [path.join('affichage', 'instantanes.js'), script]]);
}

let failed = 0;
for (const [name, args] of runs) {
  const r = spawnSync(process.execPath, args, { cwd: __dirname, encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  const last = out.trim().split('\n').pop();
  const ok = r.status === 0;
  if (!ok) { failed++; console.log(out.split('\n').filter(l => /FAIL|Error/.test(l)).join('\n')); }
  console.log((ok ? 'OK    ' : 'ÉCHEC ') + name.padEnd(28) + last);
}
console.log(failed ? `\n${failed} fichier(s) en échec` : '\nTout est vert.');
process.exit(failed ? 1 : 0);
