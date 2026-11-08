# Imperator pour Ikariam

Script Tampermonkey qui ajoute à Ikariam des tableaux de synthèse de l'empire :
ressources, bâtiments, armée, espionnage, tableau de bord financier, bénédictions divines,
mouvements de troupes et de flottes.

Version actuelle : **v2.44** (testée sur le serveur français, jeu 17.6.1,
Chrome + Tampermonkey 5.5.1).

## Installer ou mettre à jour
1. Ouvrir [`Imperator.user.js`](Imperator.user.js) puis cliquer sur **Raw**.
2. Tampermonkey propose l'installation (ou la mise à jour) : accepter.

Si seul le code s'affiche (Tampermonkey n'intercepte pas la page) : copier l'adresse
du lien, puis dans Tampermonkey > **Tableau de bord** > **Utilitaires** >
**Installer depuis une URL**, coller l'adresse et cliquer sur **Installer**.

Depuis la v2.28, Tampermonkey vérifie lui-même ce dépôt et propose chaque nouvelle
version (Tableau de bord > Rechercher des mises à jour pour forcer la vérification).

Avant chaque mise à jour, faire un export Tampermonkey (sauvegarde).

## Revenir à une version précédente
Chaque version est un commit du dépôt. Le lien « installer » pointe vers le fichier de
cette version (clic droit > Copier l'adresse du lien, puis « Installer depuis une URL »
comme ci-dessus si Tampermonkey ne l'intercepte pas).

| Version | Installer | Code |
|---|---|---|
| v2.44 | [installer](https://github.com/Ghepito/imperator-Claude/raw/29193696dc45e7b472be88a067fb177ae7ccc878/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/29193696dc45e7b472be88a067fb177ae7ccc878/Imperator.user.js) |
| v2.43 | [installer](https://github.com/Ghepito/imperator-Claude/raw/6d11db0de795771cd3db0b023a61423702f65e01/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/6d11db0de795771cd3db0b023a61423702f65e01/Imperator.user.js) |
| v2.42 | [installer](https://github.com/Ghepito/imperator-Claude/raw/36152b915ad151ee81f91c3cc2aac0fe40428000/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/36152b915ad151ee81f91c3cc2aac0fe40428000/Imperator.user.js) |
| v2.41 | [installer](https://github.com/Ghepito/imperator-Claude/raw/8472d7fbb4a8be0ba800bc9ca62ab36f56582040/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/8472d7fbb4a8be0ba800bc9ca62ab36f56582040/Imperator.user.js) |
| v2.40 | [installer](https://github.com/Ghepito/imperator-Claude/raw/55ab7fa0431a51344f855678cae9f547a9a8856b/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/55ab7fa0431a51344f855678cae9f547a9a8856b/Imperator.user.js) |
| v2.39 | [installer](https://github.com/Ghepito/imperator-Claude/raw/3d7dc1239264ce900086f603ae44b0a2617a1eb1/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/3d7dc1239264ce900086f603ae44b0a2617a1eb1/Imperator.user.js) |
| v2.38 | [installer](https://github.com/Ghepito/imperator-Claude/raw/2eb764ca588d4f297ee965b5dd8d5b633b6e1690/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/2eb764ca588d4f297ee965b5dd8d5b633b6e1690/Imperator.user.js) |
| v2.37 | [installer](https://github.com/Ghepito/imperator-Claude/raw/b3f26e1fc5bb4ca5f07f3ad2371dbe29566b308f/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/b3f26e1fc5bb4ca5f07f3ad2371dbe29566b308f/Imperator.user.js) |
| v2.36 | [installer](https://github.com/Ghepito/imperator-Claude/raw/4de0d0282e8d9f4d7bd0d66aa9efa3f065bf2f90/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/4de0d0282e8d9f4d7bd0d66aa9efa3f065bf2f90/Imperator.user.js) |
| v2.35 | [installer](https://github.com/Ghepito/imperator-Claude/raw/92e9bcd2e2f0417930b3e2bb032e1c19b39aead2/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/92e9bcd2e2f0417930b3e2bb032e1c19b39aead2/Imperator.user.js) |
| v2.34 | [installer](https://github.com/Ghepito/imperator-Claude/raw/80775180402c371ef07952a8a30dc0301cf3dd67/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/80775180402c371ef07952a8a30dc0301cf3dd67/Imperator.user.js) |
| v2.33 | [installer](https://github.com/Ghepito/imperator-Claude/raw/ffc48cf20fb51472e4629f52e5642db4db4cef12/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/ffc48cf20fb51472e4629f52e5642db4db4cef12/Imperator.user.js) |
| v2.32 | [installer](https://github.com/Ghepito/imperator-Claude/raw/8681ad31e079a44c979c063c7d8a46864cfda0e9/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/8681ad31e079a44c979c063c7d8a46864cfda0e9/Imperator.user.js) |
| v2.31 | [installer](https://github.com/Ghepito/imperator-Claude/raw/5db54453b0cb869a59ff35583a8256063bdc43e3/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/5db54453b0cb869a59ff35583a8256063bdc43e3/Imperator.user.js) |
| v2.30 | [installer](https://github.com/Ghepito/imperator-Claude/raw/c8aa494773a2e4aeaf4a4869f310a0e26d14b7ce/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/c8aa494773a2e4aeaf4a4869f310a0e26d14b7ce/Imperator.user.js) |
| v2.29 | [installer](https://github.com/Ghepito/imperator-Claude/raw/93f945d67cfb3523fd3039d315abf0d1e5d257c5/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/93f945d67cfb3523fd3039d315abf0d1e5d257c5/Imperator.user.js) |
| v2.28 | [installer](https://github.com/Ghepito/imperator-Claude/raw/ff56c783dc0421544a3bd05c85d2c08442eb52ad/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/ff56c783dc0421544a3bd05c85d2c08442eb52ad/Imperator.user.js) |
| v2.27 | [installer](https://github.com/Ghepito/imperator-Claude/raw/b2bfb1e44e161e4518baf3813724edee9dbf44cc/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/b2bfb1e44e161e4518baf3813724edee9dbf44cc/Imperator.user.js) |
| v2.26 | [installer](https://github.com/Ghepito/imperator-Claude/raw/e78d3c824179f522bf737e8895a8e1e537068a86/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/e78d3c824179f522bf737e8895a8e1e537068a86/Imperator.user.js) |
| v2.25 | [installer](https://github.com/Ghepito/imperator-Claude/raw/bb97ae9768dca6e2be24e256e5549d0d50ae3b5a/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/bb97ae9768dca6e2be24e256e5549d0d50ae3b5a/Imperator.user.js) |
| v2.24 | [installer](https://github.com/Ghepito/imperator-Claude/raw/fb70d1358574657986fa06ee32f1de3617a64762/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/fb70d1358574657986fa06ee32f1de3617a64762/Imperator.user.js) |
| v2.23 | [installer](https://github.com/Ghepito/imperator-Claude/raw/cd370293b6806ced6fd415bd30ee6a7fd472821b/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/cd370293b6806ced6fd415bd30ee6a7fd472821b/Imperator.user.js) |
| v2.22 | [installer](https://github.com/Ghepito/imperator-Claude/raw/16a94bb0d8aae1bc948b6af427c46cfa19179fd1/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/16a94bb0d8aae1bc948b6af427c46cfa19179fd1/Imperator.user.js) |
| v2.21 | [installer](https://github.com/Ghepito/imperator-Claude/raw/758e47f2f7d7a5cbcf2a0a8e488730b76bfafc13/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/758e47f2f7d7a5cbcf2a0a8e488730b76bfafc13/Imperator.user.js) |
| v2.20 | [installer](https://github.com/Ghepito/imperator-Claude/raw/342402da7159f688e9594f2bf64abc7e71cd1446/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/342402da7159f688e9594f2bf64abc7e71cd1446/Imperator.user.js) |
| v2.19 | [installer](https://github.com/Ghepito/imperator-Claude/raw/3fb34d6cc43d079a13fb2e9847574f93c54e8f9e/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/3fb34d6cc43d079a13fb2e9847574f93c54e8f9e/Imperator.user.js) |

## Méthode de travail
Une version à la fois : périmètre validé, patch, tests hors jeu
(voir [`banc-de-test/`](banc-de-test/)), essai en jeu avec une liste de contrôle,
puis un commit par version. Le détail de chaque version est dans
[`CHANGELOG.md`](CHANGELOG.md).

## Architecture
Le code source est dans [`src/`](src/) ; `Imperator.user.js` en est l'assemblage
(`node outils/assembler.js`). La carte du script (blocs, tailles, dépendances) et le plan de
découpage en modules sont dans [`docs/CARTE.md`](docs/CARTE.md).

## Crédits
Script d'origine : AubergineAnodyne (licence MIT). Maintenance et évolutions : Ghepito.
