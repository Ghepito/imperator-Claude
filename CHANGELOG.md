# Journal des versions

Tiré des lignes `@history` du script. Les liens d'installation de chaque version sont dans le README.

## 2.41

Restructuration, sans changement visible : plus aucune dependance circulaire (6 -> 0). Journal independant des utilitaires et de la sauvegarde ; outils communs de Chantiers et Boissons dans un fichier partage ; les onglets joignent la fenetre d'Imperator par un acces commun. Toute nouvelle boucle fait echouer les tests.

## 2.40

Infobulles de la recherche (onglet Ressources) : icone de l'ampoule retablie (ancien chemin relatif skin/layout/... remplace par celui de l'en-tete de colonne, /cdn/all/both/layout/bulb-on.png). Signale par Ghepito.

## 2.39

Restructuration, sans changement visible : la brique des vues (View) ne depend plus du modele de l'empire (c'est le modele qui lui indique comment retrouver la ville active) ; la bibliotheque n'utilise plus le nom global IkaTools pour joindre ses propres modules. Regle des couches verifiee par les tests.

## 2.38

Restructuration du coeur de l'empire, sans changement visible (7 onglets identiques au banc d'affichage) : magasin de donnees separe des evenements, acces en lecture regroupes, registre des types pour recreer les objets sauvegardes. Dependances circulaires : 16 -> 6.

## 2.37

Nettoyage, sans changement visible (7 onglets identiques au banc d'affichage) : 3 fonctions jamais utilisees et du code commente retires ; updateCurrentCity declaree (etait une variable globale implicite).

## 2.36

Reglages > Debug > Exporter mes donnees : telecharge un fichier JSON avec les donnees gardees par Imperator (empire, espionnage, aide des batiments, options), pour le banc d'affichage hors jeu. Rien n'est envoye.

## 2.35

Allegement : sauvegarde de l'empire regroupee (une ecriture par rafale, videe a la fermeture de la page) au lieu d'une ecriture complete a chaque reponse du jeu ; surlignage des ameliorations recalcule a l'ouverture, apres un changement ou toutes les 10 s (au lieu de 1,2 s) ; biens culturels reperes dans les reponses du jeu au lieu d'un observateur de toute la page ; rien ne tourne quand l'onglet du navigateur est cache.

## 2.34

Espionnage : la Cachette donne directement le joueur, son alliance et les coordonnees de chaque ville espionnee (plus besoin de passer sur l'ile pour sortir de 'donnees en attente'). Coordonnees lues aussi entre parentheses (elles valaient 0:0).

## 2.33

Infobulle 'En transit' (onglet Ressources) : l'heure d'arrivee est affichee apres le temps restant, comme pour les constructions (demande de Ghepito).

## 2.32

Mouvements : un transport lu en chargement dans le Conseiller militaire n'a pas de duree de trajet connue ; sa cargaison n'est plus creditee des la fin du chargement : on attend l'heure reelle du Conseiller (affichee '?' d'ici la). Heure d'arrivee lue a la seconde (heure affichee par le Conseiller) au lieu du temps restant arrondi. Capture : les donnees envoyees juste apres une vue (tableau des mouvements) sont aussi retenues.

## 2.31

Couts des batiments : l'aide du jeu (encyclopedie, page d'un batiment) est lue et retenue ; ses couts exacts servent avant les anciennes tables (perimees, chiffres tronques), et elle indique les niveaux au-dela de l'ancien maximum. Espionnage : joueur en vacances affiche 'En vacances' au lieu d'un nombre de navires ; navires a piller comptes a 580 par navire (au lieu de 500).

## 2.30

Icone du Spartiate : image du jeu (ikipedia/319.png, relevee par Ghepito) au lieu d'un nom d'image suppose. Textes : entree parasite 'dashboard' retiree des noms de batiments en francais. Premiere version construite depuis src/.

## 2.29

Espionnage sans requetes en arriere-plan : le Repaire ne recharge plus l'ile de chaque cible (donnees deja lues au passage sur l'ile). Mur et entrepot d'une ville espionnee lus a l'ouverture de sa vue : la colonne Pillable tient enfin compte de la protection de l'entrepot. Code mort retire (addTargetById, chargement de ville jamais appele). Capture : donnees de la derniere vue ville retenues.

## 2.28

Mises a jour automatiques : Tampermonkey verifie le depot GitHub (Ghepito/imperator-Claude) et propose chaque nouvelle version publiee.

## 2.27

Espionnage : joueur, alliance et score militaire des villes espionnees mis a jour a chaque passage sur leur ile (donnees du jeu), en plus de l'actualisation en arriere-plan. Score militaire (generaux) corrige : les espaces insecables du jeu le tronquaient. Les joueurs provisoires crees depuis les rapports sont remplaces par le vrai joueur.

## 2.26

Spartiate (s319) reconnu : lu dans 'Troupes dans la ville', colonne dans l'onglet Armee (ligne de front). Capture des vues : les donnees de la vue ile (villes, joueurs, alliances) sont aussi retenues, pour corriger les alliances de l'Espionnage en v2.27.

## 2.25

Mouvements : etape lue dans la ligne du Conseiller militaire (sans fleche = chargement, fleche droite = aller, fleche gauche = retour) au lieu de tout classer en route. Unites du mouvement lues dans la ligne (infobulle Flotte / Unites / Cargaison). Troupes recreditees a la ville d'origine au retour d'un pillage.

## 2.24

Donnees vraies : Bilan corrige (or actuel exact lu dans l'infobulle, bonus des dieux et Augmentez lus dans la bonne colonne, revenu = somme des villes comme le modele du jeu, cout des scientifiques). Chantier naval : ordre Baliste/Catapulte du repli corrige. Capacite des entrepots lue dans le jeu (maxResources), formule seulement en repli ou si un entrepot a change depuis la lecture.

## 2.23

Capture des vues : chaque vue du jeu ouverte est retenue en memoire (HTML serveur, templateData, page rendue, 20 vues max, jetons actionRequest masques). Reglages > Debug > Captures de vues : telechargement d'un fichier HTML par vue, servant de page de reference pour les tests hors jeu.

## 2.22

Console propre et securite : les deux erreurs connues du jeu (page HTML recue a la place du script view=city, puis "reading 'create'") sont masquees sans dependre du domaine du CDN, avec un message unique en console. Noms de villes, joueurs et alliances echappes avant insertion dans le HTML (Ressources, Batiments, Armee, Espionnage, Tableau de bord).

## 2.21

Allegement : langues francais + anglais uniquement (ba, de, es, hu, pl, ro, tr retirees), langue par defaut anglais hors fr. Traductions francaises corrigees (Options du script, Reglages, Enregistrer, Langue, Soufre, Marche noir, navires) et completees (Espionnage, Sanctuaire divin, Port de marchandises, actions, reglages). Code mort retire (style probablysafealert, regex inutilisee, blocs commentes).

## 2.20

Correctifs : niveau max detecte (maxlevel), case verte seulement si un cout est connu. Tableau de bord en unites par heure (production, autonomie vin). Alertes de bureau via GM_notification + son integre ; alerte d'attaque une seule fois, l'icone rouge du conseiller n'est plus masquee. Niveau de vin servi lu sur 70 niveaux. En-tete : jQuery en https, grants GM_notification/unsafeWindow.

## 2.19

Correctif sur le rafraichissement de la map 3D

## 2.18

Biens culturels/taverne : lecture Hôtel de Ville robuste (séparateur de milliers FR, niveau de vin par table non linéaire). getPopulationData : indices de bonus corrigés (table[niveau-1]), vin servi au lieu du niveau de taverne, plafonds musée/taverne. Biens culturels de toutes les villes lus automatiquement à l'ouverture du Musée (MutationObserver, l'ancien #val_culturalGoodsDeposit n'existant plus). Icône du tooltip de croissance alignée sur /cdn/all/both/icons/.

## 2.17

Armee: parseur 'Troupes dans la ville' reecrit sur la structure actuelle du jeu (th > div.army/fleet sNNN -> id d'unite, tr.count -> effectifs, plusieurs tables par onglet, bloc Garnison/Navires uniquement). Ne depend plus des noms d'images (haches par le CDN). Met a jour armee ET flotte d'un coup, ville lue depuis la page. Deux passes (700 ms / 2 s), log console, unites inconnues signalees (ex. Spartiate s319).

## 2.16

Armee: reliquats de deplacements supprimes. Mouvement au temps de trajet inconnu: plus de completionTime=Infinity (devenait null en sauvegarde -> mouvement fantome eternel). Purge automatique des mouvements perimes (date illisible, ou arrivee depassee de plus de 10 min) au chargement et a l'affichage. Conseiller militaire: la liste lue fait foi (mouvements absents retires sans re-crediter), unites recopiees depuis l'estimation locale correspondante (plus de mouvements reels vides ni de double comptage).

## 2.15

Armee: Caserne/Chantier naval lus sur la page affichee (classe du li -> unite, separateurs de milliers geres), repli HTML brut puis templateData. File de formation isolee (une erreur n'empeche plus l'enregistrement). Log console a chaque lecture.

## 2.14

Correctif Sanctuaire: la reponse serveur arrive avec .gracePeriod, jauge et .currentBonus VIDES (remplis ensuite par le JS du jeu). Le parseur lit desormais la page affichee (#shrineOfOlympus) apres rendu (passes a 700 ms et 2 s), le HTML brut ne sert que de repli. Une valeur illisible n'ecrase plus jamais une bonne valeur: fusion avec les donnees existantes (duree, jauge, benediction).

## 2.13

Benedictions divines: lecture de la jauge de faveur par dieu (x/1000) ; benediction calculee par la formule du jeu (max = 3 + 2 x niveau du Sanctuaire ; par ville = max x (0,4 + 0,6 x jauge/1000)). Quatre etats: Au max (jauge 1000 + protection), Fin de protection proche, En baisse (jauge < 1000 ou protection terminee), Plancher (jauge 0, bonus de base 40 %). Infobulle: protection, jauge, benediction, part divine au max ou manque a gagner, faveurs a donner. Bandeau: tri par urgence, jauge affichee en baisse, total a donner / faveur disponible. Libelles corriges (plus de 'expiree').

## 2.12

Ressources: reperes visuels des benedictions divines. Parser Sanctuaire etendu a l'onglet Vue generale (bienveillance par dieu -> date de fin absolue, decompte local) ; nettoyage des affectations retirees. Halo couleur du dieu sur la cellule de production boostee, etats Actif / Bientot fini (seuil reglable) / Affaibli, icone si donnees anciennes (>24h). Infobulle live (dieu, temps restant, benediction, part estimee). Badge Pluton sur le nom de la ville. Bandeau de pastilles par dieu (tri par urgence, clic -> Sanctuaire). Evenement shrineChanged dedie. Couleurs des dieux partagees avec le Dashboard.

## 2.11

Hotel de Ville: lecture DIRECTE des vraies valeurs du jeu (population js_TownHallOccupiedSpace, plafond js_TownHallMaxInhabitants, croissance js_TownHallPopulationGrowthValue, satisfaction js_TownHallHappinessLargeValue) via un parseur FR robuste (espace insecable + virgule). getPopulationData utilise _realMax et _realGrowth ; estimation par batiments uniquement en repli. Fin des ecarts croissance/max/pop vs jeu.

## 2.10

Croissance/population fiabilisees: getPopulationData pilote desormais la croissance par la satisfaction REELLE lue a l'hotel de ville (happinessScore) au lieu de l'estimation par batiments (qui comptait le bonus vin AU MAX -> croissance ~5x trop haute). Repli sur l'estimation si aucune valeur reelle connue.

## 2.09

Correctif Hotel de Ville (suite): la population/croissance ne tombent plus a 0 apres visite. getPopulationData: lookups de bonus (culturalGoods, taverne, musee) securises anti-NaN + repli si townHall absent. processTownHallView: extractions defensives, on n'ecrit plus de valeur non finie (plus de culturalGoods=NaN persiste/serialise).

## 2.08

Correctif Hotel de Ville: population et croissance ne sont plus remises a zero en visitant un hotel de ville. La vue townHall renvoie population=0 (compteur citoyens non expose sur cette vue); le garde-fou de _updatePopulation ignore desormais 0/negatif et conserve la derniere valeur connue.

## 2.07

Dashboard: bloc financier complet (KPIs, detail, repartition, projections), graphique prospectif interactif 1j/1sem/1mois, Sanctuaire divin en live (parser shrineOfOlympus + colonne Dieu), bouton MAJ manuelle. Donnees financieres lues directement depuis ikariam.model (income/gods/scientists/upkeep) sans ouvrir les Finances. Temps de transport: implementation de processMilitaryAdvisorView (etait manquant -> ReferenceError qui plantait le dispatcher) qui lit les VRAIS temps d'arrivee du jeu (reductions incluses) au lieu de l'estimation par formule de base. Cout d'agrandissement: capture du VRAI cout depuis le panneau #buildingUpgrade du jeu (les tables codees en dur etaient perimees) mis en cache par batiment; repli sur estimation (signalee) et plancher des reductions a 0. Console: suppression du log 'HTML bloque' et silencieux cible pour l'erreur 'reading create' du bundle jeu (cosmetique).

## 0.6

nettoyage code, simplifications et optimisations

## 0.5

correction actualisation des ressources

## 0.42

ajout Shrine of Olympus & Dockyard & Chronos's forge

## 0.40

corrections pour la version 16.0.0

## 0.38

petites corrections

## 0.36

ajout 5% à la recherche pour simuler la technocratie ligne 3615.

## 0.35

Included https URL. (by tuncayerguden).

## 0.34

Fixed blackmarket and sea chart archive buildins. (by tuncayerguden).

## 0.33

Updated @require greasyfork URL (by tuncayerguden).

## 0.32

Updated Turkish translation (by tuncayerguden).

## 0.31

Fixed blackmarket and sea chart archive buildins. (by tuncayerguden).

## 0.30

some bugs have been fixed and updated Turkish translation (by tuncayerguden).

## 0.29

Added new ikariam domain url (ikariam.gameforge.com) (by tuncayerguden).

## 0.28

Added Turkish translation (by tuncayerguden).

## 0.27

Fixed pillage of crystal not showing up.

## 0.26

Fixed colonization init-for-pirating implementation.

## 0.26

Fixed display of garrison table headers in Chrome.

## 0.25

Added espionage overview (FarmList reimplementation).

## 0.25

Removed "upgrade hover box" that shows only time for buildings that have already reached their max level.

## 0.25

Added option to initialize colonization missions for pirate raiding.

## 0.24

Added option to prevent destruction of non-mobile colonies (any town with a palace or governors residence).

## 0.24

Added option to show owner name next to city name on city view.

## 0.24

Added prompt to have script completely demolish building when downgrading by one level.

## 0.24

Added Hungarian translation (by Toroco).

## 0.24

Updated for Ikariam changes in 5.3.2.

## 0.23

Added support for Pirate Fortress (v0.5.3 new building).

## 0.23

Added Spanish translation (by Rada974).

## 0.23

Added French translation (by HÃ©liOGraph).

## 0.22

Added debug setting to reset all data to default.

## 0.22

Fixed column separators on military overview table (misaligned by 1).

## 0.22

Fixed labels on links to barracks and shipyard in military overview table.

## 0.22

Changed building tooltip to show costs for next level when upgrading.

## 0.21

Updated German translation (from Cherry).

## 0.21

Fixed a bug preventing mine links from working.

## 0.20

Updated Polish translation (from pitmm).

## 0.20

Added Bosnian translation (from Scavenger).

## 0.20

Added debug panel.

## 0.19

Made a couple tweaks to alert functionality for Chrome.

## 0.18

Added desktop alert functionality for building upgrades and transport/deploy army,navy/pillage missions.

## 0.17

Added quick loading buttons for transports and donations (basically the x500 payloads script).

## 0.17

Updated German translation.

## 0.17

Added Polish translation (by pitmm).

## 0.17

Fixed a bug that incoming trade/pillage mission resources did not show up in overview.

## 0.16

Switched to new version of dependent scripts.

## 0.15

Fixed translation of settings not being applied.

## 0.15

Updated German translation.

## 0.14

Reworked impelentation of auto daily bonus form submit for Chrome.

## 0.13

Fix for Chrome (hopefully).

## 0.12

Added support for localization (and German translation from Cherry).

## 0.12

Added option to automatically submit daily bonus form.

## 0.12

Added features to hide various minor parts of the interface (chat, friends list, facebook button, ads).

## 0.12

Show loading pillage missions in incoming transport.

## 0.11

Small tweak to work with TamperMonkey in Google Chrome.

## 0.10

Initial version.
