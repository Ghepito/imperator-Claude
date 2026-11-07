# Sources d'Imperator

`Imperator.user.js` (à la racine) est **fabriqué** à partir de ces fichiers :

    node outils/assembler.js

Ne pas modifier `Imperator.user.js` à la main : modifier le fichier de `src/` concerné,
puis réassembler. `npm test` (dans `banc-de-test/`) vérifie d'abord que les deux
correspondent.

L'ordre d'assemblage est dans `ordre.txt`. Tout nouveau fichier `.js` doit y être ajouté,
sinon l'assembleur refuse de travailler (pour qu'aucun fichier ne soit oublié en silence).

| Fichier | Contenu |
|---|---|
| `00-entete.js` | En-tête `==UserScript==` : nom, version, adresses de mise à jour, `@history` |
| `01-popover-chantiers.js` | Clic sur un niveau de bâtiment → popover « Planifier » |
| `02-garde-fous.js` | Erreurs connues du jeu masquées, filtre AJAX sûr, échappement HTML |
| `ikatools/00-outils.js` | Bibliothèque IkaTools : journal, utilitaires, traduction, vues, sauvegarde, interface, réglages |
| `ikatools/constants.js` | **Données** du jeu : ressources, bâtiments, unités, coûts, vues |
| `ikatools/10-empire-espionnage.js` | Modèle de l'empire, parseurs des vues du jeu, suivi, espionnage (à découper) |
| `imperator/00-ouverture.js` | Début de l'interface Imperator |
| `imperator/localisations.js` | **Données** : textes français et anglais |
| `imperator/01-traducteur.js` | Branchement des textes |
| `imperator/styles.js` | **Données** : CSS des tableaux |
| `imperator/10-reglages-onglets-init.js` | Réglages, onglets, initialisation (à découper) |
| `modules/debit-envoi.js` | Ressources retirées de la ville dès l'envoi d'un transport |
| `modules/capture-vues.js` | Capture des vues du jeu pour le banc de test |
| `modules/surlignage-ameliorations.js` | Bâtiments améliorables mis en évidence |
| `99-demarrage.js` | Lancement d'Imperator |

**Fragments.** Pour l'instant, la plupart de ces fichiers sont des morceaux d'un même
ensemble : `ikatools/…` sont à l'intérieur de la fonction IkaTools, `imperator/…` à
l'intérieur de la fonction Imperator. Ils ne sont pas lisibles seuls, sauf les trois fichiers
de **données**, que `banc-de-test/regressions/test_sources.js` vérifie un par un.

Le plan complet du découpage est dans [`../docs/CARTE.md`](../docs/CARTE.md).
