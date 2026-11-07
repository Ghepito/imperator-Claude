# Sources d'Imperator

`Imperator.user.js` (à la racine) est **fabriqué** à partir de ces fichiers :

    node outils/assembler.js

Ne pas modifier `Imperator.user.js` à la main : modifier le fichier de `src/` concerné,
puis réassembler. `npm test` (dans `banc-de-test/`) vérifie d'abord que les deux
correspondent.

L'ordre d'assemblage est dans `ordre.txt`. Tout nouveau fichier `.js` doit y être ajouté,
sinon l'assembleur refuse de travailler (pour qu'aucun fichier ne soit oublié en silence).

| Dossier / fichier | Contenu |
|---|---|
| `00-entete.js` | En-tête `==UserScript==` : nom, version, adresses de mise à jour, `@history` |
| `01-popover-chantiers.js` | Clic sur un niveau de bâtiment → popover « Planifier » |
| `02-garde-fous.js` | Erreurs connues du jeu masquées, filtre AJAX sûr, échappement HTML |
| **`ikatools/`** | **Bibliothèque : lit le jeu et tient le modèle de l'empire** |
| `ikatools/00-outils.js` | Journal, utilitaires, traduction, vues, sauvegarde, interface, réglages |
| `ikatools/constants.js` | **Données** du jeu : ressources, bâtiments, unités, coûts, vues |
| `ikatools/empire/00-armee.js` | Armée d'une ville, unités, lots en formation |
| `ikatools/empire/01-ville.js` | Ville : ressources, capacité d'entrepôt, bâtiments, population |
| `ikatools/empire/02-civilisation-mouvements.js` | Données de l'empire, temps de trajet, mouvements |
| `ikatools/empire/03-evenements.js` | Sauvegarde du modèle, événements (ressources, bâtiments, armée, or…) |
| `ikatools/empire/parseurs/` | **Un fichier par vue du jeu** : formulaires d'envoi, armée (troupes, caserne, chantier naval), ville (Hôtel de Ville, académie, palais, temple), finances (Bilan), sanctuaire, amélioration de bâtiment, conseiller militaire |
| `ikatools/empire/04-suivi.js` | Branchement sur les réponses du jeu, rafraîchissements |
| `ikatools/espionnage.js` | Cibles, joueurs, alliances, rapports, combats |
| `ikatools/empire/99-fin.js`, `ikatools/99-fin-et-attente.js` | Fermetures, attente des données au chargement |
| **`imperator/`** | **Interface : réglages, onglets, alertes** |
| `imperator/localisations.js` | **Données** : textes français et anglais |
| `imperator/styles.js` | **Données** : CSS des tableaux |
| `imperator/reglages.js` | Options du script (alertes, Debug, Captures…) |
| `imperator/composants.js` | Briques d'affichage : cases mises à jour, liens, infobulles |
| `imperator/onglets/` | **Un fichier par onglet** : cadre et bénédictions, Ressources, Tableau de bord, Bâtiments, Armée, Espionnage, Chantiers, Boissons, puis la fenêtre et le menu |
| `imperator/initialisation.js` | Boutons rapides, alertes, retouches, piraterie, démarrage |
| **`modules/`** | **Modules ajoutés, indépendants** : débit à l'envoi, capture des vues, surlignage |
| `99-demarrage.js` | Lancement d'Imperator |

**Fragments.** Pour l'instant, la plupart de ces fichiers sont des morceaux d'un même
ensemble : `ikatools/…` sont à l'intérieur de la fonction IkaTools, `imperator/…` à
l'intérieur de la fonction Imperator. Ils ne sont pas lisibles seuls, sauf les trois fichiers
de **données**, que `banc-de-test/regressions/test_sources.js` vérifie un par un.

Le plan complet du découpage est dans [`../docs/CARTE.md`](../docs/CARTE.md).
