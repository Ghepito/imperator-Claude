# Imperator pour Ikariam

Script Tampermonkey qui ajoute à Ikariam des tableaux de synthèse de l'empire :
ressources, bâtiments, armée, espionnage, tableau de bord financier, bénédictions divines,
mouvements de troupes et de flottes.

Version actuelle : **v3.8** (version stable depuis la v3.0) (testée sur le serveur français, jeu 17.6.1,
Chrome + Tampermonkey 5.5.1).

## Ce qu'apporte la v3.0 par rapport à l'Imperator d'origine
- **Données vraies** : population, croissance, satisfaction, bilan financier et coûts des
  bâtiments lus dans les pages du jeu (aide de l'encyclopédie comprise) plutôt qu'estimés.
- **Onglets Chantiers et Boissons** : planification des améliorations (popup « Planifier »
  sur un niveau de bâtiment), préparation des envois, réouverture après le transport,
  autonomie en vin.
- **Bénédictions divines** : jauge de faveur par dieu, durée et bonus calculés comme le jeu.
- **Mouvements** : chargement, aller et retour distingués ; heure d'arrivée affichée ;
  ressources débitées dès l'envoi, créditées une seule fois à l'arrivée.
- **Armée** : troupes, caserne et chantier naval relus sur la structure actuelle du jeu ;
  Spartiate reconnu.
- **Espionnage** : joueur, alliance et coordonnées tirés de la Cachette et de l'île, sans
  requêtes en arrière-plan ; mur et entrepôt des cibles pris en compte.
- **Recherche** (v3.2) : par ville, anneau de remplissage de l'académie, chercheurs et coût
  en or par heure ; infobulle détaillée (places libres, manque à gagner, or par point) ; total
  de l'empire par heure, jour et semaine, en rouge si le solde d'or est négatif. Voyant
  d'expérience (v3.5) : possible, possible avec parchemin, impossible ; délai de 4 h décompté. Estimations (v3.6) : délai
  avant assez de cristal, prochaine recherche par domaine (conseiller en recherches).
- **Alertes de bureau** (fin de chargement, de construction…), avec leur historique (v3.1,
  entrée « Alertes » du menu de gauche), et mises à jour automatiques par Tampermonkey.
- **Plus léger et plus sûr** : français et anglais uniquement, sauvegarde regroupée, erreurs
  connues du jeu masquées, textes échappés.
- **Code restructuré** : 58 fichiers, aucune dépendance circulaire, vérifiés à chaque test.

## Limites connues
Fonctions écrites et testées hors jeu, pas encore vérifiées en jeu faute d'occasion :
- retour d'un pillage (butin en transit puis crédité) ;
- cible avec entrepôt (part protégée retirée du pillable) ; cible en mode vacances ;
- nouvelle cible complète dès l'ouverture de la Cachette ;
- icône du Spartiate ; notification de fin de construction.

Non traité : les **mouvements hostiles** (attaques, espionnage reçus), en attente d'une
capture du Conseiller militaire.

Les boutons de transport des onglets Ressources et Bâtiments rouvrent leur onglet seulement
si le jeu revient à la vue de la ville (choix assumé).

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
| v3.8 | [installer](https://github.com/Ghepito/imperator-Claude/raw/13738fedd16ae26a857ca58723a569d3c5b80f3f/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/13738fedd16ae26a857ca58723a569d3c5b80f3f/Imperator.user.js) |
| v3.7 | [installer](https://github.com/Ghepito/imperator-Claude/raw/d58ce619c087eb5d057b6c7b186a76ef64c4ed08/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/d58ce619c087eb5d057b6c7b186a76ef64c4ed08/Imperator.user.js) |
| v3.6 | [installer](https://github.com/Ghepito/imperator-Claude/raw/99905957273201112651c55fc5ad514a0f445707/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/99905957273201112651c55fc5ad514a0f445707/Imperator.user.js) |
| v3.5 | [installer](https://github.com/Ghepito/imperator-Claude/raw/7894f3a9bfae3071131b7e7647f6a3155e9ae649/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/7894f3a9bfae3071131b7e7647f6a3155e9ae649/Imperator.user.js) |
| v3.4 | [installer](https://github.com/Ghepito/imperator-Claude/raw/4fc6c13a422a668106b1fe62790d8bbd5454fa49/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/4fc6c13a422a668106b1fe62790d8bbd5454fa49/Imperator.user.js) |
| v3.3 | [installer](https://github.com/Ghepito/imperator-Claude/raw/c2c24a5db59cbe6fc74f67618e7f71bbd6e4675c/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/c2c24a5db59cbe6fc74f67618e7f71bbd6e4675c/Imperator.user.js) |
| v3.2 | [installer](https://github.com/Ghepito/imperator-Claude/raw/ea33cf724f9847e468dc43e8bdffed02670a1a6a/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/ea33cf724f9847e468dc43e8bdffed02670a1a6a/Imperator.user.js) |
| v3.1 | [installer](https://github.com/Ghepito/imperator-Claude/raw/9e583cd4fe41d38f4e3f890c88cc675c5a44197e/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/9e583cd4fe41d38f4e3f890c88cc675c5a44197e/Imperator.user.js) |
| **v3.0** | [installer](https://github.com/Ghepito/imperator-Claude/raw/6f5746d652acc1a5bd541c3ec1e8746db99691da/Imperator.user.js) | [voir le code](https://github.com/Ghepito/imperator-Claude/blob/6f5746d652acc1a5bd541c3ec1e8746db99691da/Imperator.user.js) |
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
puis un commit par version.

Règles depuis la v3.0 :
- toute nouvelle fonction ou correction est publiée avec son test ;
- ce qui change l'affichage ou le comportement en jeu est validé en jeu avant d'être
  considéré comme stable ;
- la vérification automatique (`npm test`, dépendances, banc d'affichage) doit rester verte. Le détail de chaque version est dans
[`CHANGELOG.md`](CHANGELOG.md).

## Architecture
Le code source est dans [`src/`](src/) ; `Imperator.user.js` en est l'assemblage
(`node outils/assembler.js`). La carte du script (blocs, tailles, dépendances) et le plan de
découpage en modules sont dans [`docs/CARTE.md`](docs/CARTE.md).

## Crédits
Script d'origine : AubergineAnodyne (licence MIT). Maintenance et évolutions : Ghepito.
