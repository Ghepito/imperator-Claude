# Journal des versions

Tiré des lignes `@history` du script. Les liens d'installation de chaque version sont dans le README.

## 3.16

Miracles : une seule pastille par miracle (un miracle actif vaut pour toutes les iles), synthese de ses Temples : actif (fin la plus lointaine), sinon a activer, sinon rechargement (reprise la plus proche), sinon termine. Nombre de Temples entre parentheses, detail ile par ile au survol.

## 3.15

Miracles toujours affiches avec leur etat : actif (decompte), en rechargement (decompte), a activer ou termine (pastille orange clignotante). Miracles de combat (Hephaistos, Ares, Colosse) dans l'onglet Armee, les autres (Poseidon...) dans la barre des Ressources. Nom sans le niveau.

## 3.14

Miracles : a la lecture du Temple, le miracle de l'ile et sa fin exacte sont retenus. Les miracles actifs s'affichent a droite de la barre des benedictions (dieu, ile, temps restant, decompte) ; les autres ne sont pas montres. Clic : Temple de la ville.

## 3.13

Popup Planifier l'amelioration : il n'apparait plus pres de la case pendant l'ouverture de la fenetre du batiment ; il s'affiche directement en bandeau sur la fenetre (ou pres de la case si aucune fenetre ne s'ouvre en 3 s).

## 3.12

Espionnage : les liens vers l'ile d'une cible (coordonnees, pillage, blocus, occupation) donnent aussi l'ile au jeu ; depuis une autre ile, on change bien d'ile au lieu de voir seulement la fiche du joueur.

## 3.11

Onglet Espionnage : traits entre les colonnes, comme dans les autres onglets (colonnes déclarées). Signalé par Ghepito.

## 3.10

Fenêtre d'Imperator : même espace libre à droite qu'à gauche, noms des onglets centrés dans la hauteur. Tableaux : couleur de fond et bordures fusionnées enfin appliquées (point-virgule manquant dans le style). Signalé par Ghepito.

## 3.9

Fenêtre d'Imperator : marge à droite pour la barre de défilement du jeu (le texte « Sanctuaire lu il y a … » et la dernière colonne ne butent plus dessus) ; onglets étirés sur toute la largeur du tableau. Signalé par Ghepito.

## 3.8

Infobulles : gardées entières dans la fenêtre de tous les côtés. Bord droit : affichées à gauche du curseur (ou calées contre le bord) ; bas : au-dessus ; jamais au-delà du haut ni du bord gauche ; position revue quand une infobulle rafraîchie change de taille. Signalé par Ghepito.

## 3.7

Colonne Recherche : les durées de moins d'une heure s'affichent (minutes, secondes) : ancienneté du relevé de l'académie (« Relevé il y a » restait vide), temps restant du labo, ancienneté du conseiller en recherches. Signalé par Ghepito.

## 3.6

Colonne Recherche : dans l'infobulle d'une ville, délai avant que le cristal suffise (« orange dans ~10 j, vert dans ~13 j ») d'après sa production. Infobulle du total : points de recherche accumulés et, pour chaque domaine, points manquants pour la prochaine recherche, délai estimé et nombre d'expériences qui suffiraient (données du conseiller en recherches, points estimés à l'instant ; +300 000 à chaque expérience lancée).

## 3.5

Colonne Recherche : voyant d'expérience devant la recherche/h (vert : possible, orange : possible avec le parchemin d'Athéna, rouge : cristal insuffisant, pas de parchemin ou labo en remise en état), clic = académie de la ville. Lancement détecté (boutons de l'académie) : labo indisponible 4 h, décompte dans l'infobulle, le voyant clignote à la fin et le titre de l'onglet du navigateur affiche le nombre de labos redevenus disponibles. En-tête : nombre d'expériences possibles (vert · orange). Coût d'un chercheur, points par chercheur et présence du parchemin lus dans l'académie.

## 3.4

Infobulles en bas de fenêtre : la hauteur est mesurée sur le contenu de l'infobulle (la boîte qui le porte n'a pas de hauteur), elles passent donc bien au-dessus du curseur ; fenêtre visible lue directement (zoom du navigateur compris).

## 3.3

Colonne Recherche : après confirmation du nombre de chercheurs à l'académie, la recherche/h de la ville est mise à jour aussitôt (estimée, puis lue dans l'académie). Infobulles : affichées au-dessus du curseur quand elles dépasseraient le bas de la fenêtre (total de la recherche notamment).

## 3.2

Colonne Recherche (onglet Ressources) : la barre de progression est remplacée par un anneau de remplissage de l'académie, le nombre de chercheurs et leur coût en or par heure ; ville sans académie : tiret ; case grisée si l'académie n'a pas été revue depuis 24 h. Infobulle : chercheurs/max, places libres, coût direct, manque à gagner, or net de la ville, or par point, ancienneté du relevé. Total : chercheurs et coût de l'empire (rouge si le solde d'or est négatif), détail par heure, jour et semaine. Le nombre de chercheurs lu à l'académie n'est plus écrasé par une estimation du Bilan.

## 3.1

Historique des alertes : chaque alerte de bureau (ou celle qui n'a pas pu s'afficher) est notee avec son heure ; les 50 dernieres se consultent par l'entree Alertes du menu de gauche (cloche, nombre de non lues, bouton Vider).

## 3.0 — version stable

Sortie de la bêta. Aucun changement de code par rapport à la 2.44 : le code est restructuré (58 fichiers, aucune dépendance circulaire, couches vérifiées à chaque test) et toutes les fonctions d'usage courant sont validées en jeu. Limites connues : voir le README.

## 2.44

Popup Planifier : le clic ne passe plus a l'image publicitaire de la fenetre du jeu (le bandeau reste hors de la fenetre, au-dessus, et retient ses clics) ; Planifier repond a chaque clic.

## 2.43

Chantiers et Boissons : apres un envoi prepare, la fenetre d'Imperator se rouvre des que le serveur confirme le transport (le jeu reste sur le port au lieu de revenir a la ville).

## 2.42

Infobulle de croissance : une valeur plafonnee par la population maximale porte la mention (plein). Popup Planifier l'amelioration : des que la fenetre du batiment s'ouvre, il devient un bandeau compact a son sommet (sur l'image decorative), sans cacher les donnees.

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
