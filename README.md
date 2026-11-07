# Imperator pour Ikariam

Script Tampermonkey qui ajoute à Ikariam des tableaux de synthèse de l'empire :
ressources, bâtiments, armée, espionnage, tableau de bord financier, bénédictions divines,
mouvements de troupes et de flottes.

Version actuelle : **v2.27** (testée sur le serveur français, jeu 17.6.1,
Chrome + Tampermonkey 5.5.1).

## Installer ou mettre à jour
1. Ouvrir [`Imperator.user.js`](Imperator.user.js) puis cliquer sur **Raw**.
2. Tampermonkey propose l'installation (ou la mise à jour) : accepter.

Avant chaque mise à jour, faire un export Tampermonkey (sauvegarde).

## Revenir à une version précédente
Chaque version a son étiquette (`v2.19` à `v2.27`) : sur GitHub, menu des branches >
**Tags** > choisir la version > `Imperator.user.js` > **Raw**.

## Méthode de travail
Une version à la fois : périmètre validé, patch, tests hors jeu
(voir [`banc-de-test/`](banc-de-test/)), essai en jeu avec une liste de contrôle,
puis commit et étiquette. Le détail de chaque version est dans
[`CHANGELOG.md`](CHANGELOG.md).

## Crédits
Script d'origine : AubergineAnodyne (licence MIT). Maintenance et évolutions : Ghepito.
