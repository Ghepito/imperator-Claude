# Banc de test Imperator

Teste le script hors jeu, sans le modifier : les parseurs sont extraits tels quels
du fichier `Imperator.user.js` et exécutés sur des pages réelles du jeu.

## Prérequis (une fois)
Node.js 18 ou plus, puis dans ce dossier :

    npm install

## Lancer tous les tests

    npm test

## Contenu
- `regressions/test_v2XX.js` : tests écrits pour chaque version (ils doivent rester verts
  sur toutes les versions suivantes).
- `test_views.js` : parseurs des vues du jeu (Troupes, Caserne, Chantier naval,
  Hôtel de Ville, Conseiller militaire, Bilan, Musée, Capacité, Vue île).
- `test_shrine.js` : parseur du Sanctuaire divin.

## Captures
`test_views.js` et `test_shrine.js` ont besoin de captures du jeu :
Options du script > Debug > Captures de vues > Télécharger, puis placer les fichiers
dans `captures/` (le test prend la plus récente par vue, d'après le début du nom :
`cityMilitary…`, `militaryAdvisor…`, `island…`, etc.).

Les captures contiennent les noms et scores d'autres joueurs : le dossier `captures/`
est exclu du dépôt (`.gitignore`) et ne doit jamais être publié.

## Lecture des résultats
- PASS / FAIL : comportement attendu.
- `[constat]` : comportement connu d'une ancienne version (souvent un bug). Quand le bug
  est corrigé, le constat est transformé en test normal.

Référence (v2.29, captures du 7 nov. 2026, jeu 17.6.1) : vues 63/63, Sanctuaire 10/10,
régressions toutes vertes.

## Banc d'affichage
`affichage/instantanes.js` fait tourner tout le script hors jeu (jsdom), avec les données
exportées depuis le jeu (Réglages > Debug > **Exporter mes données**, fichier placé dans
`donnees/export.json`), ouvre la fenêtre d'Imperator et dessine les **7 onglets**.

    node affichage/instantanes.js ../Imperator.user.js --enregistrer   # référence
    node affichage/instantanes.js ../Imperator.user.js                 # comparaison

Une réécriture du code est sûre quand les 7 onglets restent **identiques au caractère près**
à la référence (horloge figée à l'heure de l'export ; identifiants générés renumérotés).
Limite : les infobulles ne sont pas dessinées. Le dossier `donnees/` contient des données de
jeu (dont d'autres joueurs) : il est exclu du dépôt.
