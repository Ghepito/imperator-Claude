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
| `10-coeur.js` | Garde-fous, bibliothèque IkaTools, interface Imperator (à découper ensuite) |
| `30-modules/debit-envoi.js` | Ressources retirées de la ville dès l'envoi d'un transport |
| `30-modules/capture-vues.js` | Capture des vues du jeu pour le banc de test |
| `30-modules/surlignage-ameliorations.js` | Bâtiments améliorables mis en évidence |
| `99-demarrage.js` | Lancement d'Imperator |

Le plan complet du découpage est dans [`../docs/CARTE.md`](../docs/CARTE.md).
