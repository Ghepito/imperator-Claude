// ==UserScript==
// @name           Imperator v3.1
// @version        3.11
// @namespace      Laurent / aubergineanodyne
// @description    Overview tables for Ikariam 0.5.0+ desktop versions in the style of Ikariam Empire Board or Ikariam ExMachina.  Rule your empire with ease!
// @author         AubergineAnodyne (Turkish translation edit by tuncayerguden)
// @license MIT
// @homepageURL    https://github.com/Ghepito/imperator-Claude
// @updateURL      https://raw.githubusercontent.com/Ghepito/imperator-Claude/main/Imperator.user.js
// @downloadURL    https://raw.githubusercontent.com/Ghepito/imperator-Claude/main/Imperator.user.js
//
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest
// @grant          GM_notification
// @grant          unsafeWindow
// @include        http://s*.ikariam.gameforge.com/*
// @include        https://s*.ikariam.gameforge.com/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
//
// @history        3.11 Onglet Espionnage : traits entre les colonnes, comme dans les autres onglets (colonnes declarees).
// @history        3.10 Fenetre d'Imperator : meme espace libre a droite qu'a gauche, noms des onglets centres dans la hauteur. Tableaux : couleur de fond et bordures fusionnees enfin appliquees (point-virgule manquant dans le style).
// @history        3.9 Fenetre d'Imperator : marge a droite pour la barre de defilement du jeu (le texte "Sanctuaire lu il y a ..." et la derniere colonne ne butent plus dessus) ; onglets etires sur toute la largeur du tableau.
// @history        3.8 Infobulles : gardees entieres dans la fenetre de tous les cotes. Bord droit : affichees a gauche du curseur (ou calees contre le bord) ; bas : au-dessus ; jamais au-dela du haut ni du bord gauche ; position revue quand une infobulle rafraichie change de taille.
// @history        3.7 Colonne Recherche : les durees de moins d'une heure s'affichent (minutes, secondes) : anciennete du releve de l'academie ("Releve il y a" restait vide), temps restant du labo, anciennete du conseiller en recherches.
// @history        3.6 Colonne Recherche : infobulle d'une ville, delai avant que le cristal suffise (orange dans ~, vert dans ~) d'apres sa production. Infobulle du total : points de recherche accumules et, pour chaque domaine, points manquants pour la prochaine recherche, delai estime et nombre d'experiences qui suffiraient (donnees du conseiller en recherches, points estimes a l'instant ; +300 000 a chaque experience lancee).
// @history        3.5 Colonne Recherche : voyant d'experience devant la recherche/h (vert : possible, orange : possible avec le parchemin d'Athena, rouge : cristal insuffisant, pas de parchemin ou labo en remise en etat), clic = academie de la ville. Lancement detecte (bouton de l'academie) : labo indisponible 4 h, decompte dans l'infobulle, le voyant clignote a la fin et le titre de l'onglet affiche le nombre de labos redevenus disponibles. En-tete : nombre d'experiences possibles (vert · orange). Cout d'un chercheur et points par chercheur lus dans l'academie ; presence du parchemin lue dans l'academie.
// @history        3.4 Infobulles en bas de fenetre : la hauteur est mesuree sur le contenu de l'infobulle (la boite qui le porte n'a pas de hauteur), elles passent donc bien au-dessus du curseur ; fenetre visible lue directement (zoom du navigateur compris).
// @history        3.3 Colonne Recherche : apres confirmation du nombre de chercheurs a l'academie, la recherche/h de la ville est mise a jour aussitot (estimee, puis lue dans l'academie). Infobulles : affichees au-dessus du curseur quand elles depasseraient le bas de la fenetre (total de la recherche notamment).
// @history        3.2 Colonne Recherche (onglet Ressources) : la barre de progression est remplacee par un anneau de remplissage de l'academie, le nombre de chercheurs et leur cout en or par heure ; ville sans academie : tiret ; case grisee si l'academie n'a pas ete revue depuis 24 h. Infobulle : chercheurs/max, places libres, cout direct, manque a gagner, or net de la ville, or par point, anciennete du releve. Total : chercheurs et cout de l'empire (rouge si le solde d'or est negatif), detail par heure, jour et semaine. Le nombre de chercheurs lu a l'academie n'est plus ecrase par une estimation du Bilan.
// @history        3.1 Historique des alertes : chaque alerte de bureau (ou celle qui n'a pas pu s'afficher) est notee avec son heure ; les 50 dernieres se consultent par l'entree Alertes du menu de gauche (cloche, nombre de non lues, bouton Vider).
// @history        3.0 Version stable (sortie de la beta). Aucun changement de code par rapport a la 2.44 : code restructure (58 fichiers, aucune dependance circulaire, couches verifiees), toutes les fonctions courantes validees en jeu. Limites connues dans le README.
// @history        2.44 Popup Planifier : le clic ne passe plus a l'image publicitaire de la fenetre du jeu (le bandeau reste hors de la fenetre, au-dessus, et retient ses clics) ; Planifier repond a chaque clic.
// @history        2.43 Chantiers et Boissons : apres un envoi prepare, la fenetre d'Imperator se rouvre des que le serveur confirme le transport (le jeu reste sur le port au lieu de revenir a la ville).
// @history        2.42 Infobulle de croissance : une valeur plafonnee par la population maximale porte la mention (plein). Popup Planifier l'amelioration : des que la fenetre du batiment s'ouvre, il devient un bandeau compact a son sommet (sur l'image decorative), sans cacher les donnees.
// @history        2.41 Restructuration, sans changement visible : plus aucune dependance circulaire (6 -> 0). Journal independant des utilitaires et de la sauvegarde ; outils communs de Chantiers et Boissons dans un fichier partage ; les onglets joignent la fenetre d'Imperator par un acces commun. Toute nouvelle boucle fait echouer les tests.
// @history        2.40 Infobulles de la recherche (onglet Ressources) : icone de l'ampoule retablie (ancien chemin relatif skin/layout/... remplace par celui de l'en-tete de colonne, /cdn/all/both/layout/bulb-on.png). Signale par Ghepito.
// @history        2.39 Restructuration, sans changement visible : la brique des vues (View) ne depend plus du modele de l'empire (c'est le modele qui lui indique comment retrouver la ville active) ; la bibliotheque n'utilise plus le nom global IkaTools pour joindre ses propres modules. Regle des couches verifiee par les tests.
// @history        2.38 Restructuration du coeur de l'empire, sans changement visible (7 onglets identiques au banc d'affichage) : magasin de donnees separe des evenements, acces en lecture regroupes, registre des types pour recreer les objets sauvegardes. Dependances circulaires : 16 -> 6.
// @history        2.37 Nettoyage, sans changement visible (7 onglets identiques au banc d'affichage) : 3 fonctions jamais utilisees et du code commente retires ; updateCurrentCity declaree (etait une variable globale implicite).
// @history        2.36 Reglages > Debug > Exporter mes donnees : telecharge un fichier JSON avec les donnees gardees par Imperator (empire, espionnage, aide des batiments, options), pour le banc d'affichage hors jeu. Rien n'est envoye.
// @history        2.35 Allegement : sauvegarde de l'empire regroupee (une ecriture par rafale, videe a la fermeture de la page) au lieu d'une ecriture complete a chaque reponse du jeu ; surlignage des ameliorations recalcule a l'ouverture, apres un changement ou toutes les 10 s (au lieu de 1,2 s) ; biens culturels reperes dans les reponses du jeu au lieu d'un observateur de toute la page ; rien ne tourne quand l'onglet du navigateur est cache.
// @history        2.34 Espionnage : la Cachette donne directement le joueur, son alliance et les coordonnees de chaque ville espionnee (plus besoin de passer sur l'ile pour sortir de 'donnees en attente'). Coordonnees lues aussi entre parentheses (elles valaient 0:0).
// @history        2.33 Infobulle 'En transit' (onglet Ressources) : l'heure d'arrivee est affichee apres le temps restant, comme pour les constructions (demande de Ghepito).
// @history        2.32 Mouvements : un transport lu en chargement dans le Conseiller militaire n'a pas de duree de trajet connue ; sa cargaison n'est plus creditee des la fin du chargement : on attend l'heure reelle du Conseiller (affichee '?' d'ici la). Heure d'arrivee lue a la seconde (heure affichee par le Conseiller) au lieu du temps restant arrondi. Capture : les donnees envoyees juste apres une vue (tableau des mouvements) sont aussi retenues.
// @history        2.31 Couts des batiments : l'aide du jeu (encyclopedie, page d'un batiment) est lue et retenue ; ses couts exacts servent avant les anciennes tables (perimees, chiffres tronques), et elle indique les niveaux au-dela de l'ancien maximum. Espionnage : joueur en vacances affiche 'En vacances' au lieu d'un nombre de navires ; navires a piller comptes a 580 par navire (au lieu de 500).
// @history        2.30 Icone du Spartiate : image du jeu (ikipedia/319.png, relevee par Ghepito) au lieu d'un nom d'image suppose. Textes : entree parasite 'dashboard' retiree des noms de batiments en francais. Premiere version construite depuis src/.
// @history        2.29 Espionnage sans requetes en arriere-plan : le Repaire ne recharge plus l'ile de chaque cible (donnees deja lues au passage sur l'ile). Mur et entrepot d'une ville espionnee lus a l'ouverture de sa vue : la colonne Pillable tient enfin compte de la protection de l'entrepot. Code mort retire (addTargetById, chargement de ville jamais appele). Capture : donnees de la derniere vue ville retenues.
// @history        2.28 Mises a jour automatiques : Tampermonkey verifie le depot GitHub (Ghepito/imperator-Claude) et propose chaque nouvelle version publiee.
// @history        2.27 Espionnage : joueur, alliance et score militaire des villes espionnees mis a jour a chaque passage sur leur ile (donnees du jeu), en plus de l'actualisation en arriere-plan. Score militaire (generaux) corrige : les espaces insecables du jeu le tronquaient. Les joueurs provisoires crees depuis les rapports sont remplaces par le vrai joueur.
// @history        2.26 Spartiate (s319) reconnu : lu dans 'Troupes dans la ville', colonne dans l'onglet Armee (ligne de front). Capture des vues : les donnees de la vue ile (villes, joueurs, alliances) sont aussi retenues, pour corriger les alliances de l'Espionnage en v2.27.
// @history        2.25 Mouvements : etape lue dans la ligne du Conseiller militaire (sans fleche = chargement, fleche droite = aller, fleche gauche = retour) au lieu de tout classer en route. Unites du mouvement lues dans la ligne (infobulle Flotte / Unites / Cargaison). Troupes recreditees a la ville d'origine au retour d'un pillage.
// @history        2.24 Donnees vraies : Bilan corrige (or actuel exact lu dans l'infobulle, bonus des dieux et Augmentez lus dans la bonne colonne, revenu = somme des villes comme le modele du jeu, cout des scientifiques). Chantier naval : ordre Baliste/Catapulte du repli corrige. Capacite des entrepots lue dans le jeu (maxResources), formule seulement en repli ou si un entrepot a change depuis la lecture.
// @history        2.23 Capture des vues : chaque vue du jeu ouverte est retenue en memoire (HTML serveur, templateData, page rendue, 20 vues max, jetons actionRequest masques). Reglages > Debug > Captures de vues : telechargement d'un fichier HTML par vue, servant de page de reference pour les tests hors jeu.
// @history        2.22 Console propre et securite : les deux erreurs connues du jeu (page HTML recue a la place du script view=city, puis "reading 'create'") sont masquees sans dependre du domaine du CDN, avec un message unique en console. Noms de villes, joueurs et alliances echappes avant insertion dans le HTML (Ressources, Batiments, Armee, Espionnage, Tableau de bord).
// @history        2.21 Allegement : langues francais + anglais uniquement (ba, de, es, hu, pl, ro, tr retirees), langue par defaut anglais hors fr. Traductions francaises corrigees (Options du script, Reglages, Enregistrer, Langue, Soufre, Marche noir, navires) et completees (Espionnage, Sanctuaire divin, Port de marchandises, actions, reglages). Code mort retire (style probablysafealert, regex inutilisee, blocs commentes).
// @history        2.20 Correctifs : niveau max detecte (maxlevel), case verte seulement si un cout est connu. Tableau de bord en unites par heure (production, autonomie vin). Alertes de bureau via GM_notification + son integre ; alerte d'attaque une seule fois, l'icone rouge du conseiller n'est plus masquee. Niveau de vin servi lu sur 70 niveaux. En-tete : jQuery en https, grants GM_notification/unsafeWindow.
// @history        2.19 Correctif sur le rafraichissement de la map 3D
// @history        2.18 Biens culturels/taverne : lecture Hôtel de Ville robuste (séparateur de milliers FR, niveau de vin par table non linéaire). getPopulationData : indices de bonus corrigés (table[niveau-1]), vin servi au lieu du niveau de taverne, plafonds musée/taverne. Biens culturels de toutes les villes lus automatiquement à l'ouverture du Musée (MutationObserver, l'ancien #val_culturalGoodsDeposit n'existant plus). Icône du tooltip de croissance alignée sur /cdn/all/both/icons/.
// @history        2.17 Armee: parseur 'Troupes dans la ville' reecrit sur la structure actuelle du jeu (th > div.army/fleet sNNN -> id d'unite, tr.count -> effectifs, plusieurs tables par onglet, bloc Garnison/Navires uniquement). Ne depend plus des noms d'images (haches par le CDN). Met a jour armee ET flotte d'un coup, ville lue depuis la page. Deux passes (700 ms / 2 s), log console, unites inconnues signalees (ex. Spartiate s319).
// @history        2.16 Armee: reliquats de deplacements supprimes. Mouvement au temps de trajet inconnu: plus de completionTime=Infinity (devenait null en sauvegarde -> mouvement fantome eternel). Purge automatique des mouvements perimes (date illisible, ou arrivee depassee de plus de 10 min) au chargement et a l'affichage. Conseiller militaire: la liste lue fait foi (mouvements absents retires sans re-crediter), unites recopiees depuis l'estimation locale correspondante (plus de mouvements reels vides ni de double comptage).
// @history        2.15 Armee: Caserne/Chantier naval lus sur la page affichee (classe du li -> unite, separateurs de milliers geres), repli HTML brut puis templateData. File de formation isolee (une erreur n'empeche plus l'enregistrement). Log console a chaque lecture.
// @history        2.14 Correctif Sanctuaire: la reponse serveur arrive avec .gracePeriod, jauge et .currentBonus VIDES (remplis ensuite par le JS du jeu). Le parseur lit desormais la page affichee (#shrineOfOlympus) apres rendu (passes a 700 ms et 2 s), le HTML brut ne sert que de repli. Une valeur illisible n'ecrase plus jamais une bonne valeur: fusion avec les donnees existantes (duree, jauge, benediction).
// @history        2.13 Benedictions divines: lecture de la jauge de faveur par dieu (x/1000) ; benediction calculee par la formule du jeu (max = 3 + 2 x niveau du Sanctuaire ; par ville = max x (0,4 + 0,6 x jauge/1000)). Quatre etats: Au max (jauge 1000 + protection), Fin de protection proche, En baisse (jauge < 1000 ou protection terminee), Plancher (jauge 0, bonus de base 40 %). Infobulle: protection, jauge, benediction, part divine au max ou manque a gagner, faveurs a donner. Bandeau: tri par urgence, jauge affichee en baisse, total a donner / faveur disponible. Libelles corriges (plus de 'expiree').
// @history        2.12 Ressources: reperes visuels des benedictions divines. Parser Sanctuaire etendu a l'onglet Vue generale (bienveillance par dieu -> date de fin absolue, decompte local) ; nettoyage des affectations retirees. Halo couleur du dieu sur la cellule de production boostee, etats Actif / Bientot fini (seuil reglable) / Affaibli, icone si donnees anciennes (>24h). Infobulle live (dieu, temps restant, benediction, part estimee). Badge Pluton sur le nom de la ville. Bandeau de pastilles par dieu (tri par urgence, clic -> Sanctuaire). Evenement shrineChanged dedie. Couleurs des dieux partagees avec le Dashboard.
// @history        2.11 Hotel de Ville: lecture DIRECTE des vraies valeurs du jeu (population js_TownHallOccupiedSpace, plafond js_TownHallMaxInhabitants, croissance js_TownHallPopulationGrowthValue, satisfaction js_TownHallHappinessLargeValue) via un parseur FR robuste (espace insecable + virgule). getPopulationData utilise _realMax et _realGrowth ; estimation par batiments uniquement en repli. Fin des ecarts croissance/max/pop vs jeu.
// @history        2.10 Croissance/population fiabilisees: getPopulationData pilote desormais la croissance par la satisfaction REELLE lue a l'hotel de ville (happinessScore) au lieu de l'estimation par batiments (qui comptait le bonus vin AU MAX -> croissance ~5x trop haute). Repli sur l'estimation si aucune valeur reelle connue.
// @history        2.09 Correctif Hotel de Ville (suite): la population/croissance ne tombent plus a 0 apres visite. getPopulationData: lookups de bonus (culturalGoods, taverne, musee) securises anti-NaN + repli si townHall absent. processTownHallView: extractions defensives, on n'ecrit plus de valeur non finie (plus de culturalGoods=NaN persiste/serialise).
// @history        2.08 Correctif Hotel de Ville: population et croissance ne sont plus remises a zero en visitant un hotel de ville. La vue townHall renvoie population=0 (compteur citoyens non expose sur cette vue); le garde-fou de _updatePopulation ignore desormais 0/negatif et conserve la derniere valeur connue.
// @history        2.07 Dashboard: bloc financier complet (KPIs, detail, repartition, projections), graphique prospectif interactif 1j/1sem/1mois, Sanctuaire divin en live (parser shrineOfOlympus + colonne Dieu), bouton MAJ manuelle. Donnees financieres lues directement depuis ikariam.model (income/gods/scientists/upkeep) sans ouvrir les Finances. Temps de transport: implementation de processMilitaryAdvisorView (etait manquant -> ReferenceError qui plantait le dispatcher) qui lit les VRAIS temps d'arrivee du jeu (reductions incluses) au lieu de l'estimation par formule de base. Cout d'agrandissement: capture du VRAI cout depuis le panneau #buildingUpgrade du jeu (les tables codees en dur etaient perimees) mis en cache par batiment; repli sur estimation (signalee) et plancher des reductions a 0. Console: suppression du log 'HTML bloque' et silencieux cible pour l'erreur 'reading create' du bundle jeu (cosmetique).
// @history        0.6 nettoyage code, simplifications et optimisations
// @history        0.5 correction actualisation des ressources
// @history        0.42 ajout Shrine of Olympus & Dockyard & Chronos's forge
// @history        0.40 corrections pour la version 16.0.0
// @history        0.38 petites corrections
// @history        0.36 ajout 5% à la recherche pour simuler la technocratie ligne 3615.
// @history        0.35 Included https URL. (by tuncayerguden).
// @history        0.34 Fixed blackmarket and sea chart archive buildins. (by tuncayerguden).
// @history        0.33 Updated @require greasyfork URL (by tuncayerguden).
// @history        0.32 Updated Turkish translation (by tuncayerguden).
// @history        0.31 Fixed blackmarket and sea chart archive buildins. (by tuncayerguden).
// @history        0.30 some bugs have been fixed and updated Turkish translation (by tuncayerguden).
// @history        0.29 Added new ikariam domain url (ikariam.gameforge.com) (by tuncayerguden).
// @history        0.28 Added Turkish translation (by tuncayerguden).
// @history        0.27 Fixed pillage of crystal not showing up.
// @history        0.26 Fixed colonization init-for-pirating implementation.
// @history        0.26 Fixed display of garrison table headers in Chrome.
// @history        0.25 Added espionage overview (FarmList reimplementation).
// @history        0.25 Removed "upgrade hover box" that shows only time for buildings that have already reached their max level.
// @history        0.25 Added option to initialize colonization missions for pirate raiding.
// @history        0.24 Added option to prevent destruction of non-mobile colonies (any town with a palace or governors residence).
// @history        0.24 Added option to show owner name next to city name on city view.
// @history        0.24 Added prompt to have script completely demolish building when downgrading by one level.
// @history        0.24 Added Hungarian translation (by Toroco).
// @history        0.24 Updated for Ikariam changes in 5.3.2.
// @history        0.23 Added support for Pirate Fortress (v0.5.3 new building).
// @history        0.23 Added Spanish translation (by Rada974).
// @history        0.23 Added French translation (by HÃ©liOGraph).
// @history        0.22 Added debug setting to reset all data to default.
// @history        0.22 Fixed column separators on military overview table (misaligned by 1).
// @history        0.22 Fixed labels on links to barracks and shipyard in military overview table.
// @history        0.22 Changed building tooltip to show costs for next level when upgrading.
// @history        0.21 Updated German translation (from Cherry).
// @history        0.21 Fixed a bug preventing mine links from working.
// @history        0.20 Updated Polish translation (from pitmm).
// @history        0.20 Added Bosnian translation (from Scavenger).
// @history        0.20 Added debug panel.
// @history        0.19 Made a couple tweaks to alert functionality for Chrome.
// @history        0.18 Added desktop alert functionality for building upgrades and transport/deploy army,navy/pillage missions.
// @history        0.17 Added quick loading buttons for transports and donations (basically the x500 payloads script).
// @history        0.17 Updated German translation.
// @history        0.17 Added Polish translation (by pitmm).
// @history        0.17 Fixed a bug that incoming trade/pillage mission resources did not show up in overview.
// @history        0.16 Switched to new version of dependent scripts.
// @history        0.15 Fixed translation of settings not being applied.
// @history        0.15 Updated German translation.
// @history        0.14 Reworked impelentation of auto daily bonus form submit for Chrome.
// @history        0.13 Fix for Chrome (hopefully).
// @history        0.12 Added support for localization (and German translation from Cherry).
// @history        0.12 Added option to automatically submit daily bonus form.
// @history        0.12 Added features to hide various minor parts of the interface (chat, friends list, facebook button, ads).
// @history        0.12 Show loading pillage missions in incoming transport.
// @history        0.11 Small tweak to work with TamperMonkey in Google Chrome.
// @history        0.10 Initial version.
// ==/UserScript==


(function () {
  'use strict';

  var CELL = 'a.imperator_tool_tip[id^="Building_"]';
  injectPopoverCSS();

  // Clic délibéré sur une cellule de bâtiment -> popover (délégation).
  document.addEventListener('click', function (e) {
    try {
      var cell = e.target.closest && e.target.closest(CELL);
      if (!cell) return;
      e.preventDefault();
      openPopover(cell);
    } catch (err) { if (window.console) console.warn('[Imperator/Relais]', err); }
  }, false);

  function parseTarget(cell) {
    var parts = String(cell.id || '').split('_');
    var level = String(cell.textContent || '').trim();
    return {
      rawId: cell.id || '',
      cityId: parts[1] || '?',
      position: parts[2] || '?',
      level: level,
      upgrading: level.indexOf('\u00bb') > -1
    };
  }

  function openPopover(cell) {
    closePopover();
    var tgt = parseTarget(cell);
    var pop = document.createElement('div');
    pop.className = 'imp-cr-pop';
    pop.innerHTML =
      '<div class="imp-cr-pt">Planifier l\u2019am\u00e9lioration</div>' +
      '<div class="imp-cr-line">Cit\u00e9 <b>' + esc(tgt.cityId) + '</b> \u00b7 emplacement <b>' + esc(tgt.position) + '</b></div>' +
      '<div class="imp-cr-line">Niveau <b>' + esc(tgt.level) + '</b>' + (tgt.upgrading ? ' <span class="imp-cr-warn">(d\u00e9j\u00e0 en cours)</span>' : '') + '</div>' +
      '<div class="imp-cr-note">Le d\u00e9tail du routage sera calcul\u00e9 dans l\u2019onglet Chantiers.</div>' +
      '<div class="imp-cr-btns"><button class="imp-cr-cancel">Annuler</button><button class="imp-cr-plan">Planifier \u2192</button></div>';
    document.body.appendChild(pop);
    positionNear(pop, cell);
    dockWhenWindowOpens(pop);   // v2.42 : rejoint le haut de la fenêtre du bâtiment

    // v2.43 : les clics dans le popup ne vont jamais au jeu
    ['mousedown', 'mouseup', 'click'].forEach(function (t) {
      pop.addEventListener(t, function (ev) { ev.stopPropagation(); }, false);
    });
    pop.querySelector('.imp-cr-plan').addEventListener('click', function () { planifier(tgt); closePopover(); });
    pop.querySelector('.imp-cr-cancel').addEventListener('click', closePopover);

    var outside = function (ev) {
      if (!pop.contains(ev.target) && !(ev.target.closest && ev.target.closest(CELL))) closePopover();
    };
    pop._outside = outside;
    setTimeout(function () { document.addEventListener('mousedown', outside, true); }, 0);
  }

  function closePopover() {
    var p = document.querySelector('.imp-cr-pop');
    if (!p) return;
    if (p._outside) document.removeEventListener('mousedown', p._outside, true);
    if (p._observer) p._observer.disconnect();
    if (p._follow) clearInterval(p._follow);
    p.remove();
  }

  function positionNear(pop, cell) {
    try {
      var r = cell.getBoundingClientRect(), w = pop.offsetWidth || 230, h = pop.offsetHeight || 150;
      var left = Math.min(r.left, window.innerWidth - w - 10);
      var top = r.bottom + 6; if (top + h > window.innerHeight - 10) top = r.top - h - 6;
      pop.style.left = Math.max(10, left) + 'px';
      pop.style.top = Math.max(10, top) + 'px';
    } catch (e) {}
  }

  // v2.42 : le clic ouvre aussi la fenêtre du bâtiment (chargée par le jeu juste après).
  // Dès qu'elle apparaît, le popup passe en bandeau compact à son sommet, sur l'image
  // décorative sous la barre de titre : il suit la fenêtre et ne cache pas ses données.
  function dockWhenWindowOpens(pop) {
    if (typeof MutationObserver !== 'function') return;
    var found = function (node) {
      if (!node || node.nodeType !== 1) return null;
      var box = node.matches && node.matches('.mainContentBox') ? node :
        (node.querySelector && node.querySelector('.mainContentBox'));
      return box && box.querySelector('.mainHeader') ? box : null;
    };
    var obs = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var box = found(added[j]);
          if (box) { obs.disconnect(); pop._observer = null; dockInto(pop, box); return; }
        }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    pop._observer = obs;
    setTimeout(function () { obs.disconnect(); }, 5000);
  }

  // v2.43 : le bandeau reste dans <body>, au-dessus de tout (et non dans la fenêtre du jeu,
  // où l'image publicitaire et les gestionnaires du jeu attrapaient le clic). Il suit la
  // fenêtre par sa position à l'écran, recalculée tant qu'il est ouvert.
  function dockInto(pop, box) {
    try {
      if (!pop.parentNode) return;   // déjà fermé
      pop.classList.add('imp-cr-dock');
      var place = function () {
        if (!pop.parentNode) { clearInterval(pop._follow); return; }
        if (!box.isConnected) return;   // fenêtre fermée : le bandeau reste où il est
        var header = box.querySelector('.mainHeader');
        var r = box.getBoundingClientRect(), hr = header ? header.getBoundingClientRect() : r;
        var banner = box.querySelector('.mainContent > .center img');
        var w = Math.min(r.width - 24, 560);
        if (banner && banner.offsetWidth > 300) w = Math.min(w, banner.offsetWidth);
        pop.style.width = w + 'px';
        pop.style.left = Math.round(r.left + (r.width - w) / 2) + 'px';
        pop.style.top = Math.round(hr.bottom + 4) + 'px';
      };
      place();
      pop._follow = setInterval(place, 250);
    } catch (e) {}
  }

  function planifier(tgt) {
    window.ImperatorChantiers = window.ImperatorChantiers || [];
    if (!window.ImperatorChantiers.some(function (c) { return c.id === tgt.rawId; })) {
      window.ImperatorChantiers.push({ id: tgt.rawId, cityId: tgt.cityId, position: tgt.position, level: tgt.level });
    }
    if (window.__impSaveChantiers) window.__impSaveChantiers();   // persistance (survit aux rechargements)
    window.ImperatorChantierEnAttente = tgt;   // contrat pour le moteur
    if (typeof window.ImperatorOpenChantiers === 'function') window.ImperatorOpenChantiers();
    else if (window.__impChantiersRedraw) window.__impChantiersRedraw();
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function injectPopoverCSS() {
    if (document.getElementById('imp-cr-css')) return;
    var css =
      '.imp-cr-pop{position:fixed;z-index:99999;width:230px;font-family:sans-serif;background:#FCF5E1;border:1.5px solid #8A6D39;border-radius:8px;box-shadow:0 4px 14px rgba(90,62,27,.28);padding:11px 12px;color:#5A3E1B}' +
      '.imp-cr-pt{font-size:13px;font-weight:600;margin-bottom:6px}' +
      '.imp-cr-line{font-size:12px;margin:2px 0}.imp-cr-warn{color:#A34E1D}' +
      '.imp-cr-note{font-size:11px;color:#8A6D39;margin:8px 0 9px;line-height:1.4}' +
      '.imp-cr-btns{display:flex;gap:8px}' +
      '.imp-cr-btns button{flex:1;font-size:12px;padding:6px;border-radius:5px;cursor:pointer}' +
      '.imp-cr-cancel{background:#EFDEB2;border:1px solid #B4914E;color:#8A6D39}' +
      '.imp-cr-plan{background:#D8B871;border:1px solid #8A6D39;color:#5A3E1B;font-weight:600}' +
      // v2.42 : bandeau compact au sommet de la fenêtre du bâtiment
      '.imp-cr-pop.imp-cr-dock{position:fixed;box-sizing:border-box;padding:6px 10px;display:grid;' +
      'grid-template-columns:auto auto 1fr 190px;column-gap:14px;row-gap:2px;align-items:center;text-align:left}' +
      '.imp-cr-dock .imp-cr-pt{grid-column:1 / span 2;grid-row:1;margin:0}' +
      '.imp-cr-dock .imp-cr-line{grid-row:2;margin:0;white-space:nowrap}' +
      '.imp-cr-dock .imp-cr-line:nth-of-type(2){grid-column:1}.imp-cr-dock .imp-cr-line:nth-of-type(3){grid-column:2}' +
      '.imp-cr-dock .imp-cr-note{display:none}' +
      '.imp-cr-dock .imp-cr-btns{grid-column:4;grid-row:1 / span 2}';
    var st = document.createElement('style'); st.id = 'imp-cr-css'; st.textContent = css; document.head.appendChild(st);
  }
})();


// [Patch 1] Bloquer l'évaluation de HTML comme JS (window.jQuery ET unsafeWindow.jQuery)
(function installGlobalEvalGuards() {
    if (window.__imp_eval_guard_installed) return;
    window.__imp_eval_guard_installed = true;

    function hookJQ(jq, label) {
        if (!jq || !jq.globalEval || jq.__imp_eval_hooked) return false;
        jq.__imp_eval_hooked = true;

        const old = jq.globalEval;
        jq.globalEval = function (data) {
            try {
                if (typeof data === 'string' && data.trim().startsWith('<')) {
                    // HTML reçu au lieu de JS : on bloque silencieusement (anti-crash).
                    // (v2.07 : plus de console.warn — bruit inutile.)
                    return;
                }
            } catch (e) {}
            return old.apply(this, arguments);
        };
        return true;
    }

    function tryInstall() {
        let ok = false;
        ok = hookJQ(window.jQuery, 'window.jQuery') || ok;
        try { ok = hookJQ(unsafeWindow && unsafeWindow.jQuery, 'unsafeWindow.jQuery') || ok; } catch(e) {}
        return ok;
    }

    if (tryInstall()) return;
    let tries = 0;
    const t = setInterval(() => {
        tries++;
        if (tryInstall() || tries > 100) clearInterval(t); // ~10s max
    }, 100);
})();

// [Patch 1b] v2.07 : silencier le bruit console d'une erreur du module pub/layout
// du jeu (bundle Gameforge) qui échoue à créer son widget quand il reçoit du HTML
// au lieu d'un script. Purement cosmétique — le jeu fonctionne normalement.
// Portée volontairement étroite : on ne masque QUE le message exact "reading 'create'"
// ET seulement s'il provient d'un script du CDN jeu (jamais d'Imperator/userscript),
// pour ne dissimuler aucune autre erreur.
// v2.22 : ne dépend plus du domaine du CDN (qui a changé). Deux erreurs connues,
// et elles seules, sont masquées : jamais une erreur venant d'Imperator.
(function installGameCreateErrorSilencer() {
    var w;
    try { w = unsafeWindow; } catch (e) { w = window; }
    if (!w || w.__imp_create_error_silencer) return;
    w.__imp_create_error_silencer = true;
    var masked = 0;
    function isKnownGameNoise(msg, src) {
        if (src.indexOf('userscript') >= 0 || src.indexOf('Imperator') >= 0) return false;
        // 1) le jeu charge ?view=city comme un script et reçoit une page HTML
        if (/Unexpected token '<'/.test(msg) && /[?&]view=city(?:&|$)/.test(src)) return true;
        // 2) conséquence directe dans le code du jeu
        if (msg.indexOf("reading 'create'") >= 0 && /\.js(?:\?|#|$)/.test(src)) return true;
        return false;
    }
    w.addEventListener('error', function (e) {
        try {
            var msg = (e && e.message) ? String(e.message) : '';
            var src = (e && e.filename) ? String(e.filename) : '';
            if (isKnownGameNoise(msg, src)) {
                masked++;
                if (masked === 1) {
                    console.info('[Imperator] Erreurs connues du jeu masquées (view=city reçue en HTML) : sans effet sur le jeu.');
                }
                e.preventDefault();
                if (e.stopImmediatePropagation) e.stopImmediatePropagation();
                return false;
            }
        } catch (err) {}
    }, true);
})();


// [Patch 2 SAFE v2] Ne casse pas view=city.
// - Laisse passer le vrai JS (script).
// - Si on reçoit du HTML à la place d'un script (cas toxique), on NE DONNE PAS ça au jeu.

(function installAjaxPrefilterSafeV2() {
    if (window.__imp_ajax_prefilter_safe_v2_installed) return;
    window.__imp_ajax_prefilter_safe_v2_installed = true;

    function hook(jq, label) {
        if (!jq || !jq.ajaxPrefilter || jq.__imp_prefilter_safe_v2_hooked) return false;
        jq.__imp_prefilter_safe_v2_hooked = true;

        jq.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            try {
                if (!options) return;

                const url = options.url ? String(options.url) : "";
                const isCity = url.indexOf("index.php?view=city") !== -1;
                const dt = (options.dataType ? String(options.dataType).toLowerCase() : "");

                // On ne vise QUE le cas "script" (c'est là que jQuery eval)
                if (!isCity || dt !== "script") return;

                const oldSuccess = options.success;
                const oldError = options.error;

                options.success = function (data, textStatus, xhr) {
                    try {
                        // jQuery peut fournir string (source script). On détecte "HTML"
                        const txt = (typeof data === "string") ? data.trim() : "";
                        if (txt.startsWith("<")) {
                            console.warn("[Imperator][SAFE] view=city attendu SCRIPT mais HTML reçu → succès ignoré (prevent crash). URL=", url);

                            // Optionnel : prévenir l'erreur callback si présent, mais SANS casser le jeu
                            if (typeof oldError === "function") {
                                try { oldError.call(this, xhr || jqXHR, "parsererror", "HTML instead of script"); } catch (e) {}
                            }
                            return; // ⚠️ crucial : ne PAS appeler oldSuccess
                        }
                    } catch (e) {}

                    // Sinon -> comportement normal
                    if (typeof oldSuccess === "function") {
                        return oldSuccess.apply(this, arguments);
                    }
                };

                // Converters : si jamais jQuery passe par "text script", on neutralise uniquement HTML
                const oldConverters = options.converters || {};
                if (!oldConverters.__imp_text_script_safe) {
                    const prev = oldConverters["text script"];
                    options.converters = Object.assign({}, oldConverters, {
                        __imp_text_script_safe: true,
                        "text script": function (text) {
                            try {
                                const t = String(text || "").trim();
                                if (t.startsWith("<")) {
                                    console.warn("[Imperator][SAFE] converter text→script: HTML détecté → script vidé (prevent crash). URL=", url);
                                    return ""; // script vide
                                }
                            } catch (e) {}
                            return prev ? prev(text) : text;
                        }
                    });
                }

            } catch (e) {}
        });

        return true;
    }

    function tryInstall() {
        let ok = false;
        ok = hook(window.jQuery, "window.jQuery") || ok;
        try { ok = hook(unsafeWindow && unsafeWindow.jQuery, "unsafeWindow.jQuery") || ok; } catch(e) {}
        return ok;
    }

    if (tryInstall()) return;
    let tries = 0;
    const t = setInterval(() => {
        tries++;
        if (tryInstall() || tries > 100) clearInterval(t);
    }, 100);
})();

// fin patch 1 & 2

// v2.22 : échappement de tout texte venu du jeu avant insertion dans du HTML
function __impH(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}


// Ici Tools

if (typeof IkaTools == 'undefined') {
    var IkaTools = (function() {
        var ikaToolsVersion = 0;

        /**
       * Support functions for logging, profiling, and debugging.
       */
        var Logging = (function() {
            var exceptionLog = [];

            var options = {
                debug: false,
                timings: false,
                profile: false,
            };

            function getExceptionLog() {
                return exceptionLog;
            }

            /**
         * Analogous to console.log, but may have been disabled through options.
         */
            function debug() {
                if (options.debug && console && console.log) {
                    // console.log is not a true javascript function.  In some browsers we can't call
                    // it with console.log.apply syntax.  Instead we just manually support up to 6
                    // arguments.
                    switch (arguments.length) {
                        case 0:
                            console.log();
                            break;
                        case 1:
                            console.log(arguments[0]);
                            break;
                        case 2:
                            console.log(arguments[0], arguments[1]);
                            break;
                        case 3:
                            console.log(arguments[0], arguments[1], arguments[2]);
                            break;
                        case 4:
                            console.log(arguments[0], arguments[1], arguments[2], arguments[3]);
                            break;
                        case 5:
                            console.log(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                            break;
                        default:
                            console.log(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4],
                                        arguments[5]);
                            break;
                    }
                }
            }

            /**
         * Debug a caught exception.
         */
            function debugException(text, ex) {
                exceptionLog.push({text: text, stack: ex.stack, message: ex.message});
                if (console && console.error) {
                    console.error('IkaTools.debugException (in %s)\n%s\n\n%s\n', text, ex, ex.stack);
                }
            }


            /**
         * Wrap a function to catch and log an exception.
         * If the time property is true in options (or absent) then time the function call.
         * (May set alwaysTime option to output time regardless of disabled logging settings.)
         * If the group property is true in options (or absent) then group the function call.
         */
            var _labelSeq = 0;
            function debuggable(debugOptions, func) {
                if (typeof(debugOptions) == 'string') {
                    debugOptions = { label: debugOptions };
                }
                debugOptions = $.extend({ time: true,
                                         group: true,
                                         profile: false,
                                         swallowException: false,
                                        }, debugOptions);
                if (!debugOptions.label) {
                    // v2.41 : compteur propre au journal (le journal ne dépend plus des utilitaires)
                    debugOptions.label = '_debuggable' + (++_labelSeq).toString(16);
                }

                return function debuggableWrapper() {
                    var time = ((options.timings && debugOptions.time) || debugOptions.alwaysTime) &&
                        console && console.time;
                    var group = debugOptions.group && (options.group) && console && console.group;
                    var profile = debugOptions.profile && options.profile && console && console.profile;
                    try {
                        if (profile) {
                            console.profile(debugOptions.label);
                        }
                        if (group) {
                            console.group(debugOptions.label);
                        }
                        if (time) {
                            console.time(debugOptions.label);
                        }
                        return func.apply(this, arguments);
                    } catch (ex) {
                        Logging.debugException(debugOptions.label, ex);
                        if (!debugOptions.swallowException) {
                            throw ex;
                        }
                    } finally {
                        if (time) {
                            console.timeEnd(debugOptions.label);
                        }
                        if (group) {
                            console.groupEnd(debugOptions.label);
                        }
                        if (profile) {
                            console.profileEnd(debugOptions.label);
                        }
                    }
                };
            }

            /**
         * Wrap a console.time/timeEnd pair around a function.  May be disabled
         * through options.
         */
            function time(timeOptions, func) {
                return function time() {
                    var time = (options.timings || timeOptions.alwaysTime) && console && console.time;
                    try {
                        if (time) {
                            console.time(timeOptions.label);
                        }
                        return func.apply(this, arguments);
                    } finally {
                        if (time) {
                            console.timeEnd(timeOptions.label);
                        }
                    }
                }
            }

            /**
         * Wrap a console.group/groupEnd pair around a function.  May be disabled
         * through options.
         */
            function group(groupOptions, func) {
                var label;

                var collapsed = false;

                return function group() {
                    var group = (options.timings || options.debug) && console && console.group;
                    try {
                        if (group) {
                            if (groupOptions.collapsed && console.groupCollapsed) {
                                console.groupCollapsed(groupOptions.label);
                            } else {
                                console.group(groupOptions.label);
                            }
                        }
                        return func.apply(this, arguments);
                    } finally {
                        if (group) {
                            console.groupEnd(groupOptions.label);
                        }
                    }
                }
            }

            /**
         * Sets logging options.  Properties are debug, timings, and profile.
         */
            function setOptions(newOptions) {
                $.extend(options, newOptions);
            }

            return {
                debug: debug,
                debugException: debugException,
                debuggable: debuggable,
                time: time,
                group: group,
                setOptions: setOptions, // v2.41 : options réglées depuis le module Data
                getExceptionLog: getExceptionLog,
            };
        })();

        /**
       * Random utils that don't belong anywhere else.
       */
        var Utils = function() {
            function thunk(func) {
                var computed = false;
                var value;

                function thunker() {
                    if (!computed) {
                        value = func();
                        computed = true;
                    }
                    return value;
                }

                return thunker;
            }

            function resettable(func) {
                var value = func();

                function getValue() {
                    return value;
                }

                getValue.reset = function() {
                    var ret = value;
                    value = func();
                    return ret;
                }

                getValue.set = function(v) {
                    value = v;
                }

                return getValue;
            }

            function fixedFunction(value) {
                return function() {
                    return value;
                }
            }

            var nextId = function() {
                var id = 10000;
                function nextId(prefix) {
                    id++;
                    if (prefix) {
                        return prefix + id.toString(16);
                    } else {
                        return id;
                    }
                };
                return nextId;
            }();

            var nextIntegerId = function() {
                var id = 100000;
                return function nextIntegerId() {
                    return id++;
                };
            }();

            function EventDispatcher(name) {
                this.name = name;
                this.listeners = [];
            }

            $.extend(EventDispatcher.prototype, {
                addListener: function addListener(l) {
                    var listener = Logging.debuggable(
                        {
                            label: 'EventDispatcher[' + this.name + '].ListenerWrapper',
                            swallowException: true,
                        },
                        function() {
                            l.apply(null, arguments)
                        });
                    this.listeners.push(listener);
                    return {
                        cancel: this._cancelListener.bind(this, listener),
                    };
                },
                _cancelListener: function(listener) {
                    for (var i = 0, len = this.listeners.length; i < len; i++) {
                        if (this.listeners[i] === listener) {
                            this.listeners.splice(i, 1);
                            return;
                        }
                    }
                },
                send: function send() {
                    var listeners = this.listeners.slice();
                    for (var i = 0, len = listeners.length; i < len; i++) {
                        listeners[i].apply(null, arguments);
                    }
                },
                scheduleSend: function(name, delay, callback) {
                    var that = this;
                    var sendArgs = [];
                    for (var i = 3; i < arguments.length; i++)  {
                        sendArgs.push(arguments[i]);
                    }
                    return clearTimeout.bind(null, setTimeout(
                        function scheduledSend() {
                            callback();
                            that.send.apply(that, sendArgs);
                        },
                        Math.max(delay, 10)));

                },
                toJSON: function toJSON() {
                    return undefined;
                },
            });

            function getVersion() {
                var parts = $.map(
                    $('#GF_toolbar li.version span').text().match(/[0-9]+/g),
                    function(x) {
                        return parseInt(x);
                    }).concat([0,0,0,0,0,0,0]);
                return {
                    greaterThanOrEqual: function() {
                        for (var i = 0; i < arguments.length; i++) {
                            if (parts[i] != arguments[i]) {
                                return parts[i] >= arguments[i];
                            }
                        }
                        return true;
                    },
                    lessThan: function() {
                        for (var i = 0; i < arguments.length; i++) {
                            if (parts[i] != arguments[i]) {
                                return parts[i] < arguments[i];
                            }
                        }
                        return false;
                    },
                };
            }

            function isChrome() {
                return navigator.vendor.match(/Google/) || navigator.userAgent.match(/Chrome/);
            }

            function iterateIkariamAjaxResponse(response, f) {
                $.each(response, function iterateIkariamAjaxResponseItem(index, item) {
                    f(index, item[0], item[1]);
                });
            }

            function forEachIkariamAjaxResponseFunction(f) {
                return function forEachIkariamResponse(response) {
                    iterateIkariamAjaxResponse(response, f);
                }
            }

            function backgroundFetchPage(url, callback, options) {
                options = $.extend({method: 'GET', data: ''}, options);

                var headers = {
                    'User-agent': navigator.userAgent,
                    'Cookie': document.cookie,
                    'Referer': 'http://' + document.domain + '/index.php',
                };
                if(options.method == 'POST') {
                    headers['Content-type'] = 'application/x-www-form-urlencoded';
                }
                setTimeout(function() {
                    GM_xmlhttpRequest ({
                        method: options.method,
                        url: url,
                        data: options.data,
                        headers: headers,
                        onload: Logging.debuggable('IkaTools.Utils.backgroundGetIkariamPage[' + url + ']', callback)
                    });
                }, 0);
            }

            function backgroundFetchIkariamAjaxPage(url, callback, options) {
                backgroundFetchPage(url, function(response) {
                    callback(JSON.parse(response.responseText));
                }, options);
            }


            function backgroundFetchIkariamFullPage(url, callback, options) {
                backgroundFetchPage(url, function(response) {
                    // Patch Correctif “source” : extraire ajaxResponse depuis le HTML
                    function extractAjaxResponseFromHtml(html) {
                        if (!html || typeof html !== 'string') return null;
                        // Format courant : ikariam.getClass(ajax.Responder, [ ... ] );
                        var m = html.match(/ikariam\.getClass\(ajax\.Responder,\s*(\[[\s\S]*?\])\s*\)\s*;/);
                        if (!m || !m[1]) return null;
                        try {
                            return JSON.parse(m[1]);
                        } catch (e) {
                            console.warn('[Imperator][XHR] Extraction trouvée mais JSON.parse a échoué', e);
                            return null;
                        }
                    }

                    var txt = response.responseText;
                    var ajax = null;

                    // 1) Tentative JSON pur
                    try { ajax = JSON.parse(txt); } catch (e) {}

                    // 2) Sinon extraction depuis HTML
                    if (!ajax) {
                        ajax = extractAjaxResponseFromHtml(txt);
                    }

                    // 3) Fallback
                    if (!ajax) ajax = [];

                    callback(response, ajax);

                }, options);
            }


            // Ici
            var urlParamsRegex = /\?([^\#]*)(#|$)/;
            function parseUrlParams(url) {
                var paramsList = url.match(urlParamsRegex)[1].split('&');
                var params = {};
                $.each(paramsList, function(index, item) {
                    var paramParts = item.split('=');
                    if (paramParts.length == 2) {
                        params[paramParts[0]] = decodeURIComponent(paramParts[1]);
                    }
                });
                return params;
            }

            var timestampRegex = /(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+):(\d+)/i;
            function parseIkariamTimestamp(timestamp){
                var d = new Date();
                //Get the local GMT offset in hours
                //Attempt to match the constituent parts of the timestamp
                var match = timestamp.match(timestampRegex);
                if (match){
                    d.setTime(0);
                    d.setDate(parseInt(match[1], 10));
                    d.setMonth(parseInt(match[2], 10)-1);
                    d.setFullYear(parseInt(match[3], 10));
                    d.setHours(parseInt(match[4], 10));
                    d.setMinutes(parseInt(match[5], 10));
                    d.setSeconds(parseInt(match[6], 10));
                    //Adjust the time to get its TZ correct
                    d.setTime(d.getTime() - d.getTimezoneOffset() * Constants.Time.MILLIS_PER_MINUTE -
                              Constants.Time.MILLIS_PER_HOUR);  // Server time is german = GMT+1
                }
                return d;
            }

            return {
                thunk: thunk,
                resettable: resettable,
                fixedFunction: fixedFunction,
                EventDispatcher: EventDispatcher,
                nextId: nextId,
                nextIntegerId: nextIntegerId,
                getVersion: thunk(getVersion),
                isChrome: thunk(isChrome),
                iterateIkariamAjaxResponse: iterateIkariamAjaxResponse,
                forEachIkariamAjaxResponseFunction: forEachIkariamAjaxResponseFunction,

                backgroundFetchIkariamAjaxPage: backgroundFetchIkariamAjaxPage,
                backgroundFetchIkariamFullPage: backgroundFetchIkariamFullPage,

                parseUrlParams: parseUrlParams,
                parseIkariamTimestamp: parseIkariamTimestamp,
            };
        }();


        /**
       *  Internationalization and localization routines.
       */
        var Intl = function() {
            function Localizer(allLanguages) {
                this.allLanguages = allLanguages;
                this.languages = ['en'];
            }
            $.extend(Localizer.prototype, {
                localize: function localize(identifier) {
                    var identifierParts = identifier.split('.');
                    if (arguments.length > 1) {
                        identifierParts = $.makeArray(arguments);
                    }
                    for (var i = 0; i < this.languages.length; i++) {
                        var languageConfig = this.allLanguages[this.languages[i]];
                        if (languageConfig !== undefined) {
                            var translation = this.find(languageConfig, identifierParts);
                            if (translation !== undefined) {
                                return translation;
                            }
                        }
                    }
                    return '?#!' + identifierParts.join(',') + '!#?';
                },
                delayedLocalize: function delayedLocalize() {
                    var args = arguments;
                    var t = this;
                    return function doLocalize() {
                        return t.localize.apply(t, args);
                    };
                },
                find: function find(config, parts) {

                    for (var i = 0; i < parts.length; i++) {
                        config = config[parts[i]];
                        if (config === undefined) {
                            return undefined;
                        }
                    }
                    return config;
                },
                setPreferredLanguage: function setPreferredLanguage(language) {
                    this.languages.unshift(language);
                },
            });

            var baseLocalizer = new Localizer({
                en: {
                    formatting: {
                        "thousandsSeparator": ",",
                        "unknown": "?",
                        hourFormatAMPM: true,
                    },
                    timeunits: {
                        long: {
                            day: 'Day',
                            hour: 'Hour',
                            week: 'Week',
                        },
                        short: {
                            day: 'D',
                            hour: 'h',
                            minute: 'm',
                            second: 's',
                        },
                        complete: '-',
                        yesterday: 'yesterday',
                        tomorrow: 'tomorrow',
                        today: 'today',
                        am: 'AM',
                        pm: 'PM',
                    },
                    settings: {
                        script_settings: 'Script Options',
                        settings: 'Settings',
                        save: 'Save',
                    },
                },
                fr: {
                    formatting: {
                        "thousandsSeparator": ".",
                        "unknown": "?",
                        hourFormatAMPM: false,
                    },
                    timeunits: {
                        long: {
                            day: 'Jour',
                            hour: 'Heure',
                            week: 'Semaine',
                        },
                        short: {
                            day: 'J',
                            hour: 'h',
                            minute: 'm',
                            second: 's',
                        },
                        complete: '-',
                        yesterday: 'hier',
                        tomorrow: 'demain',
                        today: 'aujourd\'hui',
                        am: 'AM',
                        pm: 'PM',
                    },
                    settings: {
                        script_settings: 'Options du script',
                        settings: 'Réglages',
                        save: 'Enregistrer',
                    },
                },
            });

            // -------------------------
            // fin internationalisation
            // -------------------------


            function formatInteger(number, forceShowSign) {
                if (number === undefined || isNaN(number)) {
                    return baseLocalizer.localize('formatting.unknown');
                }

                number = Math.floor(number);

                var separator = baseLocalizer.localize('formatting.thousandsSeparator');
                var s = number.toString();

                var sign = forceShowSign ? '+' : '';
                if (number === 0) {
                    sign = '';
                } else if (number < 0) {
                    sign = '-';
                    s = s.substring(1);
                }

                var i = s.length - 3;
                while (i > 0) {
                    s = s.substring(0, i) + separator + s.substring(i);
                    i -= 3;
                }
                return sign + s;
            };

            function formatDecimal(number, digits, forceShowSign) {
                if (number === undefined || isNaN(number)) {
                    return baseLocalizer.localize('formatting.unknown');
                }
                var value = number.toFixed(digits);
                if (forceShowSign && number >= 0) { // .5 * Math.pow(10, -digits)) {
                    value = '+' + value;
                }
                return value;
            }

            function formatRemainingTime(millis, complete, maxResolution) {
                maxResolution = maxResolution || 4;
                if (millis == Number.POSITIVE_INFINITY) {
                    return '&infin;';
                }
                var seconds = Math.ceil(millis / Constants.Time.MILLIS_PER_SECOND);
                if (seconds <= 0) {
                    return complete || baseLocalizer.localize('timeunits','complete');
                }

                var parts = [];
                if (maxResolution >= 1) {
                    parts.push({value: Math.floor((seconds / 60 / 60 / 24)), label: 'day'});
                }
                if (maxResolution >= 2) {
                    parts.push({value: Math.floor((seconds / 60/ 60) % 24), label: 'hour' });
                }
                if (maxResolution >= 3) {
                    parts.push({value: Math.floor((seconds / 60) % 60), label: 'minute' });
                }
                if (maxResolution >= 4) {
                    parts.push({value: Math.floor((seconds) % 60), label: 'second' });
                }

                while (parts[0] && !parts[0].value) {
                    parts.shift();
                }
                parts.splice(2);
                return $.map(parts, function(part) {
                    return '%s%s'.format(part.value,
                                         baseLocalizer.localize('timeunits','short',part.label));
                }).join(' ');
            }

            function padLeft(s, length, char) {
                while (s.length < length) {
                    s = char + s;
                }
                return s;
            }

            function formatAbsoluteTime(date) {
                var now = new Date();

                var dateDay = Math.floor(date.valueOf() / Constants.Time.MILLIS_PER_DAY -
                                         date.getTimezoneOffset() / Constants.Time.MINUTES_PER_DAY);
                var nowDay = Math.floor(now.valueOf() / Constants.Time.MILLIS_PER_DAY -
                                        now.getTimezoneOffset() / Constants.Time.MINUTES_PER_DAY);

                var dayString = '';
                if (dateDay == nowDay + 1) {
                    dayString = baseLocalizer.localize('timeunits','tomorrow');
                } else if (dateDay == nowDay - 1) {
                    dayString = baseLocalizer.localize('timeunits','yesterday');
                } else if (dateDay == nowDay) {
                    dayString = baseLocalizer.localize('timeunits','today');
                } else {
                    dayString = date.toLocaleDateString();
                }

                var timeString = '';
                if (baseLocalizer.localize('formatting', 'hourFormatAMPM')) {
                    var m = '';
                    if (date.getHours() == 0) {
                        timeString = '12';
                        m = baseLocalizer.localize('timeunits','am');
                    } else if (date.getHours() == 12) {
                        timeString = '12';
                        m = baseLocalizer.localize('timeunits','pm');
                    } else if (date.getHours() > 12) {
                        timeString = (date.getHours() - 12).toString();
                        m = baseLocalizer.localize('timeunits','pm');
                    } else {
                        timeString = date.getHours().toString();
                        m = baseLocalizer.localize('timeunits','am');
                    }
                    timeString = timeString + ':' +
                        padLeft(date.getMinutes().toString(), 2, 0) + ' ' + m;
                } else {
                    timeString = date.getHours().toString() + ':' +

                        padLeft(date.getMinutes().toString(), 2, '0');
                }

                return dayString + ' ' + timeString;
            }

            // ... (fin de formatAbsoluteTime)
            return {
                Localizer: Localizer,
                localizer: baseLocalizer,
                formatInteger: formatInteger,
                formatDecimal: formatDecimal,
                formatRemainingTime: formatRemainingTime,
                formatAbsoluteTime: formatAbsoluteTime,
            };
        }();

        var View = function() {
            function getDomain() {
                return document.domain;
            }

            function getCurrentCityId() {
                // Sécurité si l'objet ikariam n'est pas encore chargé
                try {
                    var relatedCityData = unsafeWindow.ikariam.model.relatedCityData;
                    return relatedCityData[relatedCityData.selectedCity].id;
                } catch (e) {
                    return null;
                }
            }

            // v2.39 : la brique des vues ne va plus chercher le modèle de l'empire elle-même ;
            // c'est le modèle qui lui indique comment retrouver une ville (setCityLookup).
            var _cityLookup = null;
            function setCityLookup(lookup) {
                _cityLookup = lookup;
            }

            function getCurrentCity() {
                var id = getCurrentCityId();
                return (id && _cityLookup) ? _cityLookup(id) : null;
            }

            function isActiveCity(city) {
                return city && city.getId() == getCurrentCityId();
            }

            function getCurrentIslandId() {
                // Version plus robuste pour 2026
                var islandLink = $("#js_islandBread").attr("href") || $(".island").attr("href");
                if (islandLink) {
                    var m = islandLink.match(/islandId=(\d+)/);
                    return m ? parseInt(m[1]) : null;
                }
                return null;
            };

            function getViewType() {
                // Priorité à l'URL — plus fiable que backgroundView
                // qui conserve l'ancienne vue après navigation AJAX
                var urlView = new URLSearchParams(window.location.search).get('view');
                if (urlView) return urlView;
                try {
                    return unsafeWindow.ikariam.backgroundView.id;
                } catch (e) {
                    return 'unknown';
                }
            }

            function viewIsIsland() { return getViewType() == 'island'; }
            function viewIsCity() { return getViewType() == 'city'; }

            function getIkariamBaseViewParams() {
                var ik = unsafeWindow.ikariam;
                var x = parseInt(ik.mainbox_x) || 0;
                var y = parseInt(ik.mainbox_y) || 0;
                var z = parseInt(ik.mainbox_z) || 0;
                if (x || y || z) {
                    return {
                        mainbox_x: x,
                        mainbox_y: y,
                        mainbox_z: z,
                    };
                }
                return {};
            }

            function makeFullIkariamUrl(params, anchor) {
                // Correction forcée en HTTPS pour 2026
                return 'https://' + getDomain() + '/index.php?' +
                    $.map(params, function(value, key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
                }).join('&') +
                    (anchor ? '#' + anchor : '');
            }

            function makeLocalIkariamUrl(params) {
                return '?' + $.map(params, function(value, key) { return key + '=' + value; }).join('&');
            }

            function loadLocalIkariamUrl(url) {
                Logging.debug("loadLocalIkariamUrl: ", url);
                // Injection directe pour contourner les sandbox de contenu
                if (typeof unsafeWindow.ajaxHandlerCall === 'function') {
                    unsafeWindow.ajaxHandlerCall(url);
                } else {
                    window.location.assign('javascript:ajaxHandlerCall(' + JSON.stringify(url) + '); void(0);');
                }
            }

            function goToIkariamPage(city, mainView, mainParams, view, viewParams, anchor) {
                var changeParams = {
                    // Whacked up logic I don't really understand that makes transitioning to
                    // island mine/mill pages work.  Yes, it's completely incomprehensible how Ikariam
                    // developers could screw this up, but somehow they can make the mill go to the mine
                    // if you say the old view is island when you want to go to an island page.
                    // Truly incredible!
                    oldView: mainView == 'island' ? getViewType() : mainView,
                    action: 'header',
                    function: 'changeCurrentCity',
                    cityId: city.getId(),
                    actionRequest: unsafeWindow.ikariam.model.actionRequest,
                };

                $.extend(changeParams, getIkariamBaseViewParams(), mainParams);

                if (view) {
                    $.extend(changeParams, viewParams);
                    changeParams.templateView = view;
                }

                $.extend(changeParams, { backgroundView: mainView } );

                if (mainView == 'island' && view && !anchor) {
                    // Stupid ikariam developers still include the city preselect when we ask for a
                    // specific view.  Which will overwrite whatever view (mine/mill/wonder) we
                    // actually want to see.  Set this hack to suppress that transition when the page
                    // loads.
                    anchor = 'ikaScriptToolsSuppressCityPreselect';
                }

                if (getViewType() == mainView) {
                    loadLocalIkariamUrl(makeLocalIkariamUrl(changeParams));
                    return;
                }

                var url = makeFullIkariamUrl(changeParams, anchor);
                Logging.debug('goToIkariamPage: ', url);
                window.location.assign(url);
            }

            function goToLocalView(view, params) {
                loadLocalIkariamUrl(makeLocalIkariamUrl($.extend({view: view}, params)));
            }

            function goToCitysIslandView(city, view, params) {
                if (isActiveCity(city) && viewIsIsland() &&
                    getCurrentIslandId() == city.getIslandId()) {
                    if (view) {
                        loadLocalIkariamUrl(makeLocalIkariamUrl($.extend({view: view}, params)));
                    }
                } else if (viewIsIsland()) {
                    goToIkariamPage(city, 'island',
                        { currentIslandId: city.getIslandId() },
                        view, params);
                } else {
                    GM_setValue('imperator_pending_city_id', String(city.getId()));
                    GM_setValue('imperator_pending_view',    view || '');
                    GM_setValue('imperator_pending_params',  JSON.stringify(params || {}));
                    var islandId = city.getIslandId();
                    window.location.assign(
                        'https://' + getDomain() + '/index.php?view=island&islandId=' + islandId
                    );
                }
            }

            function goToIslandView(city, islandId, view, params) {
                if (isActiveCity(city) && viewIsIsland() &&
                    getCurrentIslandId() == islandId) {
                    if (view) {
                        loadLocalIkariamUrl(makeLocalIkariamUrl($.extend({view: view}, params)));
                    }
                } else {
                    goToIkariamPage(city, 'island', { currentIslandId: islandId }, view, params);
                }
            }

            function goToIkariamFullPage(params, anchor) {
                var url = makeFullIkariamUrl(params, anchor);
                // Remplacement par HTTPS forcé si nécessaire
                url = url.replace("http://", "https://");
                Logging.debug('goToIkariamFullPage: ', url);
                window.location.replace(url);
            }

            function makeIkariamLoadLocalPageAnchor(params, doNotSuppressFirstCityInfo) {
                if (doNotSuppressFirstCityInfo) {
                    return 'ikaScriptToolsLoadLocalIkariamUrl_DoNotSuppressFirstCityInfo=' +
                        encodeURIComponent(makeLocalIkariamUrl(params));
                } else {
                    return 'ikaScriptToolsLoadLocalIkariamUrl=' +
                        encodeURIComponent(makeLocalIkariamUrl(params));
                }
            }

            function goToCityView(city, view, params) {
                if (isActiveCity(city) && viewIsCity()) {
                    if (view) {
                        loadLocalIkariamUrl(makeLocalIkariamUrl($.extend({view: view}, params)));
                    }
                } else {
                    goToIkariamPage(city, 'city', null, view, params);
                }
            }

            function activateCity(city) {
                if (!isActiveCity(city)) {
                    goToIkariamPage(city, getViewType());
                }
            }

            var suppressingChangeView = false;
            var superSuppressChangeView = Utils.resettable(Utils.fixedFunction(false));

            var initialPageAjaxResponse = Utils.thunk(function findInitialPageAjaxResponse() {
                var regex = /ikariam.getClass\(ajax.Responder, (.*)\);/;
                var response = [];
                $('script').each(function findInitialPageAjaxResponse(index, script) {
                    var match = regex.exec(script.innerHTML);
                    if (match) {
                        response = JSON.parse(match[1]);
                    }
                });
                return response;
            });

            unsafeWindow.ajax.Responder.changeView = function(changeView) {
                return Logging.debuggable(
                    'IkaTools.View.changeViewReplacement',
                    function customChangeView(params) {
                        if (suppressingChangeView && suppressingChangeView == params[0]) {
                            Logging.debug("Suppressing change to view: ", params[0]);
                        } else if (superSuppressChangeView() == params[0]) {
                            superSuppressChangeView.reset();
                            Logging.debug("Super suppressing change to view", params[0]);
                        } else {
                            changeView.apply(this, arguments);
                        }
                    });
            }(unsafeWindow.ajax.Responder.changeView);

            var ajaxResponseEvent = new Utils.EventDispatcher();

            function registerIkariamAjaxResponseCallback(f, fireInitialPageView) {
                var canceller = ajaxResponseEvent.addListener(f);
                if (fireInitialPageView) {
                    f(initialPageAjaxResponse());
                }
                return canceller;
            }

            var suppressNextAjaxChangeView = Utils.resettable(Utils.fixedFunction(null));

            function suppressChangeViewOfNextAjaxResponse(type) {
                suppressNextAjaxChangeView.set(type);
            }

            function suppressFirstChangeViewOfType(type) {
                superSuppressChangeView.set(type);
            }

            var nextAjaxResponseEvent =
                Utils.resettable(function() { return new Utils.EventDispatcher(); });

            function registerNextIkariamAjaxRequestCallback(f) {

                return nextAjaxResponseEvent().addListener(f);
            }

            function replaceExecuteAjaxRequest(executeAjaxRequest) {
                return function customExecuteAjaxRequest() {
                    var ajaxEvent = nextAjaxResponseEvent.reset();
                    var suppressChangeView = suppressNextAjaxChangeView.reset();

                    var args = $.makeArray(arguments);
                    args.push(undefined);

                    if (!args[1]) {
                        args[1] = function customAjaxCallback(responseText) {
                            suppressingChangeView = suppressChangeView;
                            var responder = unsafeWindow.ikariam.getClass(
                                unsafeWindow.ajax.Responder, responseText);
                            unsafeWindow.ikariam.controller.ajaxResponder = responder;
                            suppressingChangeView = null;

                            ajaxResponseEvent.send(responder.responseArray);
                            ajaxEvent.send(responder.responseArray);
                        }
                        args[1].isScriptInterceptor = true;
                    } else if (args[1].isScriptInterceptor) {
                        // Allows multiple instances of this script to work
                        var func = args[1];
                        args[1] = function customAjaxCallbackWrapper() {
                            suppressingChangeView = suppressChangeView;
                            func.apply(this, arguments);
                            suppressingChangeView = null;

                            var responseArray = unsafeWindow.ikariam.controller.ajaxResponder.responseArray;
                            ajaxResponseEvent.send(responseArray);
                            ajaxEvent.send(responseArray);
                        }
                    }
                    var ret = executeAjaxRequest.apply(this, args);
                };
            }

            if (unsafeWindow.ikariam.controller) {
                unsafeWindow.ikariam.controller.executeAjaxRequest =
                    replaceExecuteAjaxRequest(unsafeWindow.ikariam.controller.executeAjaxRequest);
            } else {
                unsafeWindow.ikariam.Controller.executeAjaxRequest =
                    replaceExecuteAjaxRequest(unsafeWindow.ikariam.Controller.executeAjaxRequest);
            }

            var ajaxFormEvent = new Utils.EventDispatcher();

            unsafeWindow.ajaxHandlerCallFromForm = function(ajaxHandlerCallFromForm) {
                return function customerAjaxHandlerCallFromForm(form) {
                    ajaxFormEvent.send(form);
                    return ajaxHandlerCallFromForm.apply(this, arguments);
                };
            }(unsafeWindow.ajaxHandlerCallFromForm);

            function registerAjaxFormSubmitCallback(f) {
                return ajaxFormEvent.addListener(f);
            }

            var gameTimeDifference = 0;

            function setGameTimeDifference(value) {
                Logging.debug("Game time difference: ", value);
                gameTimeDifference = value;
            }

            function getGameTimeDifference() {
                return gameTimeDifference;
            }

            function gameTimeNow() {
                return new Date().getTime() - gameTimeDifference;
            }

            return {
                getDomain: getDomain,

                getCurrentCityId: getCurrentCityId,
                getCurrentCity: getCurrentCity,
                setCityLookup: setCityLookup, // v2.39
                isActiveCity: isActiveCity,

                getCurrentIslandId: getCurrentIslandId,

                getViewType: getViewType,
                viewIsIsland: viewIsIsland,
                viewIsCity: viewIsCity,

                goToCitysIslandView: goToCitysIslandView,
                goToCityView: goToCityView,
                goToIslandView: goToIslandView,
                goToLocalView: goToLocalView,
                activateCity: activateCity,
                goToIkariamFullPage: goToIkariamFullPage,
                makeIkariamLoadLocalPageAnchor: makeIkariamLoadLocalPageAnchor,

                //registerViewChangedListener: registerViewChangedListener,
                suppressChangeViewOfNextAjaxResponse: suppressChangeViewOfNextAjaxResponse,
                suppressFirstChangeViewOfType: suppressFirstChangeViewOfType,
                registerNextIkariamAjaxRequestCallback: registerNextIkariamAjaxRequestCallback,
                registerIkariamAjaxResponseCallback: registerIkariamAjaxResponseCallback,
                registerAjaxFormSubmitCallback: registerAjaxFormSubmitCallback,

                loadLocalIkariamUrl: loadLocalIkariamUrl,

                setGameTimeDifference: setGameTimeDifference,
                getGameTimeDifference: getGameTimeDifference,
                gameTimeNow: gameTimeNow,
            };
        }();

        /**
       * Data value class for encapsulating GM_getValue/GM_setValue access and
       * serialization/deserialization.

       */
        var Data = function() {
            // v2.35 : sauvegardes regroupées (saveSoon) ; tout ce qui attend est écrit
            // avant que la page ne se ferme ou ne change.
            var _impPending = [];
            function _impFlushPending() {
                var list = _impPending; _impPending = [];
                for (var i = 0; i < list.length; i++) {
                    try { list[i]._flushSoon(); } catch (e) {}
                }
            }
            try {
                window.addEventListener('pagehide', _impFlushPending);
                window.addEventListener('beforeunload', _impFlushPending);
            } catch (e) {}

            var _impValues = []; // v2.36 : toutes les données sauvegardées (pour l'export)

            function Value(key, defaultValue, options) {
                _impValues.push(this);
                this.options = $.extend({ useDomain: true, loadCallback: function() {} }, options);
                if (this.options.useDomain) {
                    this.key = View.getDomain() + "/" + key + "/" +
                        (options.version || ikaToolsVersion) + '-' + ikaToolsVersion;
                } else {
                    this.key = key + "/" + ikaToolsVersion;
                }
                this.defaultValue = defaultValue;
                this.data = defaultValue;
                this.needsSave = false;
            }

            $.extend(Value.prototype, {
                load: function load() {
                    var rawValue = GM_getValue(this.key, "null");
                    if (rawValue !== undefined) {
                        var data = JSON.parse(rawValue, this.options.reviver);
                        Logging.debug('Loaded data "%s": %s -> %o', this.key, rawValue, data);
                        if (data !== null) {
                            this.data = data;
                        }
                    } else {
                    }
                    this.loaded = true;
                    this.options.loadCallback(this.data);
                    return this.data;
                },
                save: function save() {
                    return this.doSave(true);
                },
                doSave: function doSave(force) {
                    if (this.needsSave || force) {
                        var value = JSON.stringify(this.data, this.options.stringifier);
                        Logging.debug('Saved data "%s": %o -> %s', this.key, this.data, value);
                        GM_setValue(this.key, value);
                        this.needsSave = false;
                    }
                    return this.data;
                },
                // v2.35 : une seule écriture pour une rafale de demandes (dans les 500 ms)
                saveSoon: function saveSoon() {
                    this.needsSave = true;
                    if (this._soonTimer) return;
                    _impPending.push(this);
                    this._soonTimer = setTimeout(this._flushSoon.bind(this), 500);
                },
                _flushSoon: function flushSoon() {
                    if (this._soonTimer) { clearTimeout(this._soonTimer); this._soonTimer = null; }
                    var i = _impPending.indexOf(this);
                    if (i >= 0) _impPending.splice(i, 1);
                    this.doSave(false);
                },
                saveAsync: function saveAsync() {
                    this.needsSave = true;
                    setTimeout(Logging.debuggable('IkaTools.Data.Value[' + this.key + ']',
                                                  this.doSave.bind(this, false)), 0);
                },
                get: function get() {
                    if (!this.loaded) {
                        var value = this.load();
                        return value;
                    }
                    return this.data;
                },
                set: function set(data) {
                    this.data = data;
                    return data;
                },
                reset: function reset() {
                    this.set(this.defaultValue);
                    this.save();
                },
            });

            /**
         * Allows logging options to be configured by browsing to various anchors
         * (and persisted for future page views).
         */
            // v2.41 : déplacée depuis le journal (qui ne dépend plus de Data) ; toujours appelée
            // sous le nom Logging.setAndSaveOptionsFromPageAnchor.
            function setAndSaveOptionsFromPageAnchor() {
                var savedOptions = new Data.Value(
                    'debugOptions',
                    { debug: false, timings: false, profile: false , group: false},
                    { useDomain: false, version: 0 });
                savedOptions.get();

                var anchor = window.location.hash;

                if (anchor.substring(0, 15) == '#ikaScriptTools') {
                    if (anchor == '#ikaScriptToolsDebugAll') {
                        savedOptions.get().debug = true;
                        savedOptions.get().timings = true;
                        savedOptions.get().profile = true;
                    } else if (anchor == '#ikaScriptToolsDebugNone') {
                        savedOptions.get().debug = false;
                        savedOptions.get().timings = false;
                        savedOptions.get().profile = false;
                    } else if (anchor == '#ikaScriptToolsDebugOn') {
                        savedOptions.get().debug = true;
                    } else if (anchor == '#ikaScriptToolsDebugOff') {

                        savedOptions.get().debug = false;
                    } else if (anchor == '#ikaScriptToolsGroupOn') {
                        savedOptions.get().group = true;
                    } else if (anchor == '#ikaScriptToolsGroupOff') {
                        savedOptions.get().group = false;
                    } else if (anchor == '#ikaScriptToolsTimingsOn') {
                        savedOptions.get().timings = true;
                    } else if (anchor == '#ikaScriptToolsTimingsOff') {
                        savedOptions.get().timings = false;
                    } else if (anchor == '#ikaScriptToolsProfilesOn') {
                        savedOptions.get().profile = true;
                    } else if (anchor == '#ikaScriptToolsProfilesOff') {
                        savedOptions.get().profile = false;
                    }
                    savedOptions.saveAsync();
                }
                Logging.setOptions(savedOptions.get());
            }
            Logging.setAndSaveOptionsFromPageAnchor = setAndSaveOptionsFromPageAnchor;

            return {
                Value: Value,
                listValues: function listValues() { return _impValues.slice(); }, // v2.36
            };
        }();

        var UI = function() {
            function ToolTipHandler(toolTipClass, toolTipContainer, options) {
                this.toolTips = {};
                this.options = $.extend({
                    delay: 200,
                    activeClass: 'active',
                    offsetX: 0,
                    offsetY: 20,
                    toolTipClass: toolTipClass,
                    toolTipContainer: toolTipContainer || $('<div/>'),
                }, options);
                this.toolTipContainer =
                    $('<div style="position: absolute; z-index: 100000; display:none;"/>');
                this.toolTipContainer.append(this.options.toolTipContainer);

                this.activeToolTipElement = null;
                this.pendingShowEvent = null;
                this.activeToolTip = null;

                var body = $('body');
                body.append(this.toolTipContainer);
            }

            $.extend(ToolTipHandler.prototype, {
                _getCurrentToolTip: function _getCurrentToolTip() {
                    if (this.activeToolTipElement) {
                        var id = this.activeToolTipElement.id;
                        if (id) {
                            return this.toolTips[id];
                        }
                    }
                },
                _reset: function _reset() {
                    clearTimeout(this.pendingShowEvent);
                    this.toolTipContainer.hide();

                    var toolTipInfo = this._getCurrentToolTip();
                    if (this.activeToolTip && this.activeToolTip.deactivated) {
                        this.activeToolTip.deactivated($(this.activeToolTipElement));
                    }
                    this.activeToolTip = null;

                    this.options.toolTipContainer.empty();
                    this.activeToolTipElement = null;
                },
                _showToolTip: function _showToolTip() {
                    var toolTipInfo = this._getCurrentToolTip();
                    if (toolTipInfo) {
                        this.activeToolTip = toolTipInfo.contentCreator($(this.activeToolTipElement));
                        this.options.toolTipContainer.append(this.activeToolTip);
                        this.toolTipContainer.show();
                        this._fitInViewport();
                    }
                },
                // v3.2 : une infobulle qui dépasserait le bas de la fenêtre s'affiche au-dessus du curseur
                _fitInViewport: function _fitInViewport() {
                    var y = this._lastPageY;
                    if (y === undefined) return;
                    // v3.4 : le contenu (classe tool_tip_container) est en position absolue ; la
                    // boîte qui le porte a donc une taille nulle : on mesure le contenu.
                    var content = $(this.options.toolTipContainer);
                    var height = Math.max(this.toolTipContainer.outerHeight() || 0, content.outerHeight() || 0);
                    var width = Math.max(this.toolTipContainer.outerWidth() || 0, content.outerWidth() || 0);
                    var root = document.documentElement;
                    var viewTop = window.pageYOffset || $(window).scrollTop() || 0;
                    var viewLeft = window.pageXOffset || $(window).scrollLeft() || 0;
                    // largeur et hauteur visibles, barres de défilement exclues
                    var viewWidth = (root && root.clientWidth) || window.innerWidth || $(window).width();
                    var viewHeight = window.innerHeight || (root && root.clientHeight) || $(window).height();
                    var margin = 4;

                    // Vertical : sous le curseur ; au-dessus s'il dépasse le bas ; jamais au-dessus du haut
                    var top = y + this.options.offsetY;
                    if (top + height > viewTop + viewHeight - margin) top = y - height - 10;
                    top = Math.max(viewTop + margin, top);

                    // v3.8 : horizontal : à droite du curseur ; à gauche s'il dépasse le bord droit ;
                    // jamais au-delà du bord gauche
                    var css = { top: top + 'px' };
                    var x = this._lastPageX;
                    if (x !== undefined) {
                        var left = x + this.options.offsetX;
                        if (left + width > viewLeft + viewWidth - margin) left = x - width - 10;
                        if (left < viewLeft + margin) left = viewLeft + viewWidth - margin - width; // calée à droite
                        css.left = Math.max(viewLeft + margin, left) + 'px';
                    }
                    this.toolTipContainer.css(css);
                },
                _mouseOver: function _mouseOver(e) {
                    var toolTipElement = $(e.target).closest('.' + this.options.toolTipClass);
                    if (toolTipElement.get(0) == this.activeToolTipElement) {
                        return;
                    }

                    this._reset();

                    if (toolTipElement.length > 0) {
                        this.activeToolTipElement = toolTipElement[0];
                        this._lastPageY = e.pageY;
                        this._lastPageX = e.pageX;
                        this.toolTipContainer.css({
                            left: (e.pageX + this.options.offsetX) + 'px',
                            top: (e.pageY + this.options.offsetY) + 'px',
                        });

                        this.pendingShowEvent = setTimeout(Logging.debuggable(
                            'IkaTools.UI.ToolTipHandler.showToolTip[' + this.options.toolTipClass + ']',
                            this._showToolTip.bind(this)), this.options.delay);
                    }
                },
                _mouseOut: function _mouseOut(e) {
                    if (this.activeToolTipElement) {
                        var target = $(e.relatedTarget).closest('.' + this.options.toolTipClass);
                        if (target.get(0) != this.activeToolTipElement) {
                            this._reset();
                            return;
                        }
                    }
                },
                _mouseMove: function _mouseMove(e) {
                    if (this.activeToolTipElement && !this.activeToolTip) {
                        this._lastPageY = e.pageY;
                        this._lastPageX = e.pageX;
                        this.toolTipContainer.css({
                            left: (e.pageX + this.options.offsetX)+ 'px',
                            top: (e.pageY + this.options.offsetY) + 'px',
                        });
                    }
                },

                register: function registerToolTip(id, contentCreator) {
                    this.toolTips[id] = {
                        contentCreator: contentCreator,
                    };
                },

                registerSimple: function registerSimpleToolTip(id, content) {
                    this.register(id, function() {
                        return $(content);
                    });
                },

                registerRefreshable: function registerRefreshableToolTip(id, contentGenerator) {
                    var toolTip = this;

                    this.register(id, function() {
                        var id =  Utils.nextId();
                        var interval = setInterval(Logging.debuggable('IkaTools.ToolTip.refresh[' + id + ']',
                                                                      function refreshToolTip() {
                            toolTip.options.toolTipContainer.html(contentGenerator());
                            toolTip._fitInViewport(); // v3.8 : le contenu peut changer de taille
                        }), Constants.Time.MILLIS_PER_SECOND);

                        var tip = $(contentGenerator());
                        tip.deactivated = function() {
                            clearInterval(interval);
                        };
                        return tip;
                    });
                },

                deregister: function deregister(id) {
                    delete this.toolTips[id];
                },

                startHandling: function startHandling(element) {
                    element.on('mouseover'/*, '.' + this.options.toolTipClass*/, Logging.debuggable(
                        'IkaTools.UI.ToolTipHandler.mouseOver[' + this.options.toolTipClass + ']',
                        this._mouseOver.bind(this)));
                    element.on('mouseout'/*, '.' + this.options.toolTipClass*/, Logging.debuggable(
                        'IkaTools.UI.ToolTipHandler.mouseOut[' + this.options.toolTipClass + ']',
                        this._mouseOut.bind(this)))
                    element.on('mousemove', '.' + this.options.toolTipClass, Logging.debuggable(
                        'IkaTools.UI.ToolTipHandler.mouseMove[' + this.options.toolTipClass + ']',
                        this._mouseMove.bind(this)))
                }
            });

            function LeftMenu(items, options) {
                this.items = items;
                this.active = false;
                this.options = $.extend({atTop: false }, options);
            }

            $.extend(LeftMenu.prototype, {
                ITEM_CONTRACTED_WIDTH: 53,
                ITEM_EXPANDED_WIDTH: 199,
                ITEM_Z_INDEX_EXPANDED: 120000,
                ITEM_Z_INDEX_CONTRACTED: 65,
                ANIMATION_DURATION: 300,

                display: function display() {
                    // Add leftMenu div and "standard" contents if we are in a
                    // view where it is not already present
                    var leftMenuDiv = $('#leftMenu');
                    if (!leftMenuDiv.length) {
                        leftMenuDiv = $('<div id="leftMenu" >' +
                                        '<div class="slot_menu city_menu" style="z-index: 65; ">' +
                                        '<ul class="menu_slots"/>' +
                                        '</div>' +
                                        '</div>');
                        $('#container').append(leftMenuDiv);
                    }

                    // Setup event handlers
                    for (var i = 0; i < this.items.length; i++) {
                        var item = this.items[i];
                        item.element.width(this.ITEM_COLLAPSED_WIDTH + 'px');
                        item.element.mouseenter(this.expand.bind(this, item));
                        item.element.mouseleave(this.contract.bind(this, item));
                    }

                    this.holderDiv = $('.slot_menu', leftMenuDiv);
                    this.holderDiv.hover(this.menuActivated.bind(this),
                                         this.menuPassivated.bind(this));

                    // Add elements to ui
                    var menuSlots = $('ul.menu_slots', leftMenuDiv);
                    if (this.options.atTop) {
                        for (var i = this.items.length - 1; i >= 0; i--) {
                            menuSlots.prepend(this.items[i].element);
                        }
                    } else {
                        for (var i = 0; i < this.items.length; i++) {
                            menuSlots.append(this.items[i].element);
                        }
                    }
                },
                menuActivated: function menuActivated() {
                    this.active = true;
                    this.holderDiv.css('z-index', this.ITEM_Z_INDEX_EXPANDED);
                },
                menuPassivated: function menuPassivated() {
                    this.active = false;
                },
                contract: function contract(item) {
                    var holder = item.element.parent().parent();
                    item.element.animate(
                        { width: this.ITEM_CONTRACTED_WIDTH },
                        300,
                        'swing',
                        this.contractComplete.bind(this)
                    );
                },
                contractComplete: function contractComplete() {
                    if (!this.active) {
                        this.holderDiv.css('z-index', this.ITEM_Z_INDEX_CONTRACTED);
                    }
                },
                expand: function expand(item) {
                    item.element.animate(
                        { width: this.ITEM_EXPANDED_WIDTH },
                        300,
                        'swing');
                    this.holderDiv.css('z-index', this.ITEM_Z_INDEX_EXPANDED);

                },
            });

            LeftMenu.Item = function LeftMenu_Item(element) {
                this.element = element;
            }

            function resizePopup() {
                unsafeWindow.ikariam.controller.adjustSizes();
            }

            var destroyedTemplateViewEvent = Utils.thunk(function() {
                var dispatcher = new Utils.EventDispatcher();
                var oldDestroyTemplateView = unsafeWindow.ikariam.TemplateView.destroyTemplateView;
                unsafeWindow.ikariam.TemplateView.destroyTemplateView =
                    function customDestroyTemplateView() {
                    oldDestroyTemplateView.apply(this, arguments);
                    dispatcher.send();
                };
                return dispatcher;
            });

            function PopupWindow(id, header, content, options) {
                this.id = id;
                this.headerElement = $(header);
                this.contentElement = $(content);
                this.options = $.extend({
                    sidebars: [],
                    oversized: false,
                    activatedCallback: function() {},
                    deactivatedCallback: function() {},
                }, options);
                this.isActive = false;

                destroyedTemplateViewEvent().addListener(this._popupDestroyed.bind(this));
            }

            $.extend(PopupWindow.prototype, {
                _popupDestroyed: function _popupDestroyed() {
                    if (this.isActive) {
                        this.options.deactivatedCallback(this);
                    }
                    this.isActive = false;
                },
                display: function display(skipResize) {
                    // Always display it.  There's no good way to track if it is
                    // already displayed because there is no callback when it is destroyed.
                    // (One can replace unsafeWindow.ikariam.destroyTemplateView, but there
                    // are still some issues with quickly switching between views that can
                    // mess things up and will still be considered "active" when its not visible.
                    var templateViewArg = {
                        boxId: this.id,
                        headerElem: this.headerElement.html(),
                        contentElem: '<div><div id="ikaPopupTempHolder"></div></div>',
                        sidebarEls: this.options.sidebars,
                        oversized: this.options.oversized,
                        replaceBox: true,
                        keepSidebars: false
                    };
                    this.isActive = true;
                    this.activePopup = unsafeWindow.ikariam.createTemplateView(templateViewArg);
                    // Null out the id or submitting the change city form will send it as the
                    // templateView
                    unsafeWindow.ikariam.templateView.id = null;
                    unsafeWindow.ikariam.model.viewParams = null;
                    $('#ikaPopupTempHolder').replaceWith(this.contentElement);

                    this.options.activatedCallback(this);

                    if (skipResize) {
                        unsafeWindow.ikariam.controller.adjustSizes();
                    }
                },
                close: function close() {
                    if (this.isActive) {
                        unsafeWindow.ikariam.TemplateView.destroyTemplateView();
                    }
                }
            });

            function TabPane(tabs, options) {
                this.tabs = tabs;
                this.options = $.extend({ tabActivatedCallback: function() {} }, options);

                this.currentTab = null;

                this.container = $("<div/>");

                var tabsContainer = $('<ul class="tabmenu"/>');
                this.container.append(tabsContainer);

                for (var i = 0; i < tabs.length; i++) {
                    var tab = tabs[i];
                    tab.tabPane = this;

                    tabsContainer.append(tab.tabHolder)
                    this.container.append(tab.contentHolder);
                    tab.contentHolder.hide();
                    tab.tabHolder.click(
                        Logging.debuggable('IkaTools.TabPane.Tab.click',
                                                    this.activate.bind(this, tab)));
                }
            }

            $.extend(TabPane.prototype, {
                getContainer: function getContainer() {
                    return this.container;
                },
                activate: function activate(tab) {
                    if (this.currentTab !== tab) {

                        if (this.currentTab) {
                            this.currentTab.contentHolder.hide();
                            this.currentTab.tabHolder.removeClass('selected');
                            this.currentTab.deactivated();
                        }

                        tab.contentHolder.show();
                        tab.tabHolder.addClass('selected');
                    }
                    tab.activated();
                    this.options.tabActivatedCallback(this.currentTab, tab);
                    this.currentTab = tab;
                }
            });

            TabPane.Tab = function Tab(tab, content, options) {
                this.tab = $(tab);
                this.content = $(content);
                this.options = $.extend({ activatedCallback: function() {},
                                         deactivatedCallback: function() {} },
                                        options);

                this.contentHolder = $('<div/>');
                this.contentHolder.append(this.content);

                this.tabHolder = $('<li class="tab"/>');
                this.tabHolder.append(this.tab);
            }

            $.extend(TabPane.Tab.prototype, {
                activate: function activate() {
                    this.tabPane.activate(this);
                },
                activated: function activated() {
                    this.options.activatedCallback(this);
                },
                deactivated: function deactivated() {
                    this.options.deactivatedCallback(this);
                },
            });

            function SettingsWindow(id, scriptName, settings, settingGroups) {
                this.id = id;
                this.settings = settings;
                this.scriptName = scriptName;
                this.settingGroups = settingGroups;
                this.saveEvent = new Utils.EventDispatcher();
            }

            $.extend(SettingsWindow.prototype, {
                show: function show() {
                    var tabs = $.map(this.settingGroups, function makeTab(group, index) {
                        var content = $.map(group.getSettings(), this.renderSetting.bind(this)).join('');
                        content = '<div class="contentBox01h">' +
                            '<h3 class="header">' +
                            Intl.localizer.localize('settings','settings') +
                            '</h3>' +
                            '<div class="content">' +
                            '<table class="table01"><tbody>' + content + '</tbody></table>' +
                            '</div>' +
                            '<div class="footer"/>' +
                            '</div>' +
                            '<div class="centerButton">' +
                            '<a class="ikaScriptToolsSaveOptions button">' +
                            Intl.localizer.localize('settings','save') +
                            '</a>' +
                            '</div>';
                        return new TabPane.Tab('<b>' + group.getName() + '</b>', content, {});
                    }.bind(this));
                    var tabPane = new TabPane(tabs,  {
                        tabActivatedCallback: function() {
                            resizePopup();
                        },
                    });
                    var popup = new PopupWindow(
                        'options',
                        $('<div>' + Intl.localizer.localize('settings','script_settings') + ': ' +
                          this.scriptName + '</div>'),
                        tabPane.getContainer());
                    tabs[0].activate();
                    popup.display();
                    $.each(this.settingGroups, function postRenderSettingsGroup(index, group) {
                        $.each(group.getSettings(), this.postRenderSetting.bind(this));
                    }.bind(this));
                    $('.ikaScriptToolsSaveOptions').click(Logging.debuggable(
                        'IkaTools.UI.SettingsWindow.saveSettings',
                        this._save.bind(this)));
                },
                renderSetting: function renderSetting(setting, index) {
                    var type = setting.getType();
                    var html = '<tr><td>' + setting.getLabel()() + '</td><td class="left">';
                    if (type == Settings.Type.BOOLEAN) {
                        html += '<input id="ikaScriptToolsSettingInput_' + setting.getName() +
                            '" type="checkbox" ' + (setting.isEnabled() ? 'checked' : '' ) + '/>';
                    } else if (type == Settings.Type.CHOICE) {
                        html += '<select id="ikaScriptToolsSettingInput_' + setting.getName() + '">';
                        $.each(setting.getChoices(), function renderOption(key, value) {
                            html += '<option value="' + value + '"' +
                                (setting.getValue() == value ? 'selected="selected"' : '') + '>' + key + '</option>';
                        })
                        html += '</select>';
                    } else if (type == Settings.Type.HTML) {
                        html += setting.getHtml()();
                    } else if (type == Settings.Type.TEXT) {
                        html += '<input id="ikaScriptToolsSettingInput_' + setting.getName()
                            + '" value="' + setting.getValue() + '"/>';
                    }
                    html += '</td>';
                    return html;
                },
                postRenderSetting: function postRenderSetting(index, setting) {
                    var type = setting.getType();
                    if (type == Settings.Type.HTML) {

                        setting.getPostRender()();
                    }
                },
                _save: function save() {
                    $.each(this.settingGroups, function saveGroup(index, group) {
                        $.each(group.getSettings(), this._saveSetting.bind(this));
                    }.bind(this));
                    this.settings.save();
                    this.saveEvent.send(this);
                },
                _saveSetting: function saveSetting(index, setting) {
                    var type = setting.getType();
                    if (type == Settings.Type.BOOLEAN) {
                        setting.setEnabled(
                            $('#ikaScriptToolsSettingInput_' + setting.getName()).is(':checked'));
                    } else if (type == Settings.Type.CHOICE) {
                        setting.setValue(
                            $('#ikaScriptToolsSettingInput_' + setting.getName()).val());
                    } else if (type == Settings.Type.TEXT) {
                        setting.setValue(
                            $('#ikaScriptToolsSettingInput_' + setting.getName()).val());
                    }
                },
                registerSavedSettingsHandler: function registerSavedSettingsHandler(f) {
                    return this.saveEvent.addListener(f);
                },
                addAsScriptOptionsLink: function addAsScriptOptionsLink() {
                    if($('#IkaScriptToolSettingsDropdown').size() == 0) {
                        GM_addStyle(
                            '#IkaScriptToolSettingsDropdown { ' +
                            '  position:absolute; ' +
                            '}' +
                            '#IkaScriptToolSettingsDropdown:hover {' +
                            '  padding-bottom:20px;' +
                            '}' +
                            '#IkaScriptToolSettingsDropdown #IkaScriptToolsSettingsDropdownLinks { ' +
                            '  display:none;' +
                            '}' +
                            '#IkaScriptToolSettingsDropdown:hover #IkaScriptToolsSettingsDropdownLinks {' +
                            '  display:block;' +
                            '}' +
                            '#IkaScriptToolsSettingsDropdownLinks { ' +
                            '  background-color:#FFF5E1; ' +
                            '  padding:.5em; ' +
                            '  padding-bottom:0; ' +
                            '  border:1px solid #666; ' +
                            '  position:absolute; ' +
                            '  right:-80px; ' +
                            '  margin-top:2px; ' +
                            '  width:170px;' +
                            '}' +
                            '#IkaScriptToolsSettingsDropdownLinks a { ' +
                            '  color:#666; ' +
                            '  cursor:pointer; ' +
                            '  margin-left:0; ' +
                            '  padding-left:.2em; ' +
                            '  display:block; ' +
                            '  margin-bottom:.5em;' +
                            '}'
                        );

                        var li = document.createElement('li');
                        li.id = 'IkaOptionsDropdown';
                        $('#GF_toolbar ul').append($(
                            '<li id="IkaScriptToolSettingsDropdown">' +
                            '<a href="javascript:void(0);">' +
                            Intl.localizer.localize('settings','script_settings') + '</a>' +
                            '<div id="IkaScriptToolsSettingsDropdownLinks">' +
                            '</li>'));
                    }
                    var link = $('<a>' + this.scriptName + '</a>');
                    link.click(Logging.debuggable('IkaTools.UI.SettingsWindow.showSettings',
                                                  this.show.bind(this)));
                    $('#IkaScriptToolsSettingsDropdownLinks').append(link);
                },
            });

            SettingsWindow.Group = function(name, settings) {
                this.name = name;
                this.settings = settings;
            }

            $.extend(SettingsWindow.Group.prototype, {
                getName: function getName() {
                    return this.name;
                },
                getSettings: function getSettings() {
                    return this.settings;
                },
            });

            return {
                ToolTipHandler: ToolTipHandler,
                LeftMenu: LeftMenu,
                resizePopup: resizePopup,
                PopupWindow: PopupWindow,
                TabPane: TabPane,
                SettingsWindow: SettingsWindow,
            };
        }();

        var Settings = function() {
            var Type = {
                BOOLEAN: 1,
                CHOICE: 2,
                HTML: 3,
                TEXT: 4,
            }

            function Settings(name) {
                this.name = name;
                this.data = new Data.Value('scriptOptions_' + name, { }, { version: 1 });
            }

            $.extend(Settings.prototype, {
                _getValue: function getValue(name, defaultValue) {
                    var value = this.data.get()[name];
                    return value === undefined ? defaultValue : value;
                },
                _setValue: function setValue(name, value) {
                    this.data.get()[name] = value;
                },
                save: function save() {
                    this.data.save();
                },

                boolean: function boolean(name, enabled, labelFunc) {
                    return new Boolean(this, name, this._getValue(name, enabled), labelFunc);
                },

                choice: function choice(name, value, choices, labelFunc) {
                    return new Choice(this, name, this._getValue(name, value), choices, labelFunc);
                },

                html: function html(htmlFunc, postRender, labelFunc) {
                    return new Html(htmlFunc, postRender, labelFunc);
                },

                text: function text(name, value, labelFunc) {
                    return new Text(this, name, this._getValue(name, value), labelFunc);
                }
            });

            function Boolean(settings, name, enabled, labelFunc) {
                this.settings = settings;
                this.name = name;
                this.enabled = enabled;
                this.labelFunc= labelFunc;
            }

            $.extend(Boolean.prototype, {
                isEnabled: function isEnabled() {
                    return this.enabled;
                },
                setEnabled: function(enabled) {
                    this.enabled = enabled;
                    this.settings._setValue(this.name, enabled);
                },
                getName: function getName() {
                    return this.name;
                },
                getType: function getType() {
                    return Type.BOOLEAN;
                },
                getLabel: function getLabel() {
                    return this.labelFunc;
                },
            });

            function Choice(settings, name, value, choices, labelFunc) {
                this.settings = settings;
                this.name = name;
                this.value = value;
                this.choices = choices;
                this.labelFunc = labelFunc;
            }

            $.extend(Choice.prototype, {
                getValue: function getValue() {
                    return this.value;
                },
                setValue: function setValue(value) {
                    this.value = value;
                    this.settings._setValue(this.name, value);
                },
                getChoices: function getChoices() {
                    return this.choices;
                },
                getName: function getName() {
                    return this.name;
                },
                getType: function getType() {
                    return Type.CHOICE;
                },
                getLabel: function getLabel() {
                    return this.labelFunc;
                },
            });

            function Html(htmlFunc, postRender, labelFunc) {
                this.labelFunc = labelFunc;
                this.htmlFunc = htmlFunc;
                this.postRender = postRender;
            }

            $.extend(Html.prototype, {
                getHtml: function getHtml() {
                    return this.htmlFunc;
                },
                getPostRender: function getPostRender() {
                    return this.postRender;
                },
                getType: function getType() {
                    return Type.HTML;
                },
                getLabel: function getLabel() {
                    return this.labelFunc;
                },
            });

            function Text(settings, name, value, labelFunc) {
                this.settings = settings;
                this.name = name;
                this.value = value;
                this.labelFunc = labelFunc;
            }

            $.extend(Text.prototype, {
                getValue: function getValue() {
                    return this.value;
                },
                setValue: function setValue(value) {
                    this.value = value;
                    this.settings._setValue(this.name, value);
                },
                getName: function getName() {
                    return this.name;
                },
                getType: function getType() {
                    return Type.TEXT;
                },
                getLabel: function getLabel() {
                    return this.labelFunc;
                },
            });

            return {
                Settings: Settings,
                Type: Type,
            };
        }();

        var Constants = {
            Resources: {
                WOOD: 'wood',
                WINE: 'wine',
                MARBLE: 'marble',
                GLASS: 'glass',
                SULFUR: 'sulfur',

                POPULATION: 'population',
                CITIZENS: 'citizens',

                SCIENTISTS: 'scientists',
                ACTION_POINTS: 'actionPoints',
                CULTURAL_GOODS: 'culturalGoods',
                TAVERN_WINE_LEVEL: 'tavernWineLevel',
                PRIESTS: 'priests',
            },

            CivilizationData: {
                GOVERNMENT: 'government',
                RESEARCH: 'research',
                MOVEMENT: 'movement',
                PREMIUM_FEATURE: 'premiumFeature',
            },

            PremiumFeatures: {
                DOUBLED_STORAGE_CAPACITY: 'doubledStorageCapacity',
                DOUBLED_SAFE_CAPACITY: 'doubledSafeCapacity',
            },

            Movements: {
                Mission: {
                    TRANSPORT: 'transport',
                    DEPLOY_ARMY: 'deployarmy',
                    DEPLOY_NAVY: 'deployfleet',
                    PLUNDER: 'plunder',
                },

                Stage: {
                    LOADING: 'loading',
                    EN_ROUTE: 'en_route',
                    RETURNING: 'returning',
                },

                EventType: {
                    DATA_UPDATED: 'dataUpdated',
                    STAGE_CHANGED: 'stageChanged',
                    CANCELLED: 'cancelled',
                    COMPLETED: 'completed',
                },

                MissionData: {
                    transport: {
                        icon: '/cdn/all/both/actions/transport.jpg',
                    },
                    deployarmy: {
                        icon: '/cdn/all/both/actions/occupy.jpg',
                    },
                    deployfleet: {
                        icon: '/cdn/all/both/actions/blockade.jpg',
                    },
                    plunder: {
                        icon: '/cdn/all/both/actions/plunder.jpg',
                    },
                    piracyRaid: {
                        icon: '/cdn/all/both/actions/piracyRaid.jpg',
                    },
                }
            },

            BuildingEventType: {
                DATA_REFRESH: 'dataRefresh',
                UPGRADE_COMPLETE: 'upgradeComplete',
            },

            // Liste des bâtiments

            Buildings: {
                TOWN_HALL: 'townHall',
                PALACE: 'palace',
                GOVERNORS_RESIDENCE: 'palaceColony',
                TAVERN: 'tavern',
                MUSEUM: 'museum',
                ACADEMY: 'academy',
                WORKSHOP: 'workshop',
                TEMPLE: 'temple',
                DIVINE_SANCTUARY: 'shrineOfOlympus',// 👈 AJOUT
                CHRONOS_FORGE: 'chronosForge',// 👈 AJOUT
                EMBASSY: 'embassy',
                WAREHOUSE: 'warehouse',
                DUMP: 'dump',
                TRADING_PORT: 'port',
                DOCKYARD: 'dockyard',// 👈 AJOUT
                TRADING_POST: 'branchOffice',
                BLACK_MARKET: 'blackMarket',
                MARINE_CHART_ARCHIVE: 'marineChartArchive',
                WALL: 'wall',
                HIDEOUT: 'safehouse',
                BARRACKS: 'barracks',
                SHIPYARD: 'shipyard',
                PIRATE_FORTRESS: 'pirateFortress',
                FORESTER: 'forester',
                CARPENTER: 'carpentering',
                WINERY: 'winegrower',
                WINE_PRESS: 'vineyard',
                STONEMASON: 'stonemason',
                ARCHITECT: 'architect',
                GLASSBLOWER: 'glassblowing',
                OPTICIAN: 'optician',
                ALCHEMISTS_TOWER: 'alchemist',
                FIREWORK_TEST_AREA: 'fireworker',
            },


            // Time data from http://ikariam.wikia.com/wiki/User_blog:Warrior_fr/Actual_building_Time_formula
            // Rest of data from http://ikariam.wikia.com/ building pages.

            BuildingData: {
                academy: {
                    maxlevel:50,
                    wood:[55,58,98,226,328,538,844,1143,1723,2291,3367,4434,6403,8387,10965,1562,20374,28767,37471,48786,63496,88974,124014,150549,209779,272798,378372,461226,639658,883624,1081231,1493547,2063095,2849833,3936586,5437761,7511392,10375779,14332469,19797999,27347750,37776516,52182177,72081279,99568686,137538116,189986771,262436146,362513298,500753777],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    glass:[0,0,0,0,193,368,639,936,1503,211,3255,4485,6761,9226,12555,18599,25216,36997,50063,67702,91516,133177,192765,243011,351634,474841,683916,865717,1246777,1788499,2272591,3259901,4676140,6707654,9621744,13801839,19797943,28399010,40736746,58434518,83820952,120236331,172472097,247401296,354882919,509059121,730216007,1047452831,1502510795,2155265251],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:1440, b:1, c:1.2, d:720},
                    icon  :'/cdn/all/both/img/city/academy_l.png',
                    maxScientists: [0, 8, 12, 16, 22, 28, 35, 43, 51, 60, 69, 79, 89, 100, 111, 122, 134, 146, 159, 172, 185, 198, 212, 227, 241, 256, 271, 287, 302, 318, 335, 351, 368 ],
                },
                alchemist: {
                    maxlevel:61,
                    wood:[235,401,617,898,1263,1738,2354,3157,4199,5554,7316,9607,12585,16456,21488,28030,36535,47591,61963,80649,104938,136516,177565,230931,300306,390494,507737,660154,858296,1115880,1450740,1886057,2451998,3187758,4144296,5387857,7004569,9106400,11838919,15391374,20009798,26014054,33819980,43968198,57161548,74313771,96612788,125602976,163292127,212290500,275991607,358807234,466472992,606445556,788419092,1024996652,1332563034,1732419548,2252259306,2928085165,3806703211],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,99,219,374,577,840,1182,1627,2205,2955,3931,5202,6852,8997,11786,15412,20125,26253,34219,44574,58037,75538,98289,127865,166315,216300,281279,365753,475568,618329,803918,1045183,1358855,1766663,2296859,2986173,3882359,5047500,6562314,8531740,11092214,14421117,18749061,24375871,31691353,41202296,53567581,69643833,90544754,117718283,153046903,198978051,258693667,336330631,437267348,568496341,739108674,960923743,1249308082,1624239900,2111693096],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:72000, b:11, c:1.1, d:6120},
                    icon  :'/cdn/all/both/img/city/alchemist_l.png',
                },
                architect: {
                    maxlevel:50,
                    wood:[159,250,355,477,619,783,974,1195,1452,1750,2095,2495,2960,3500,4125,4850,5692,6668,7800,9114,10637,12404,14454,16832,19591,22791,26503,30809,35804,41599,48319,56116,65170,75686,87899,102082,118554,137684,159900,185702,215666,250465,290880,337815,392325,455629,529148,614530,713689,828848],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[91,137,190,253,325,408,504,615,743,890,1060,1255,1480,1739,2037,2379,2774,3227,3748,4348,5037,5829,6738,7784,8986,10367,11953,13774,15867,18271,21031,24201,27848,32046,36876,42434,48830,56190,64659,74406,85621,98526,113377,130466,150131,172760,198799,228763,263244,302922],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:125660, b:37, c:1.06, d:2628},
                    icon  :'/cdn/all/both/img/city/architect_l.png',
                },
                barracks: {
                    maxlevel:49,
                    wood:[42,98,167,254,361,493,658,862,1115,1429,1818,2301,2899,3641,4561,5701,7116,887,11044,13741,17086,21233,26375,32751,40658,50461,62618,77693,96385,119564,148305,183944,228137,282936,350886,435146,539626,669183,829833,1029039,1276055,1582354,1962165,2433131,3017129,3741286,4639240,5752704,7133399],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,0,0,0,0,0,153,370,640,975,1389,1904,2542,3332,4312,5528,7037,8907,11224,14099,17664,22084,27566,34363,42791,53241,662,82268,102193,126901,157539,195528,242636,30105,373483,4633,574672,712774,884021,1096368,1359677,1686180,2091044,2593076,3215595,3987519,4944704],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:25200, b:11, c:1.1, d:1728},
                    icon  :'/cdn/all/both/img/city/barracks_l.png',
                },
                branchOffice: {
                    maxlevel:72,
                    wood:[41,148,297,499,770,113,1602,2218,3017,4047,5367,7054,9201,11924,15369,19716,25185,32054,40663,51434,64885,81661,10255,12853,1608,200835,250454,311885,387872,481778,597732,740796,917337,1135187,1404015,1735749,2145109,2650258,3273613,4043584,4994655,6169425,7620506,9412889,11626849,14361545,17739456,21911869,27065655,33431640,41294936,51007721,63005003,77824109,96128747,118738731,146666701,181163475,223774071,276406902,341419250,421722842,520914258,643436013,794775525,981710881,1212614410,1497827655,1850124544,2285283504,2822794124,3486730050],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,0,464,681,965,1337,1818,2439,3235,4252,5547,7188,9265,11885,15182,19323,24512,31004,39114,49226,61819,77479,96933,121067,150978,188009,233815,290424,360322,446564,552986,684311,846366,1046343,1293113,1597627,1973398,2437552,3010878,3719054,4593796,5674284,7008907,8657442,10693723,13208947,16315766,20153328,24893505,30748599,37980844,46914155,57948631,71578478,88414142,109209651,134896382,166624778,205815871,254224933,314020081,387879387,479110822,591800408,730995225,902929453,1115303588,1377629325,1701655566,2101894617],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    capacity:[400,1600,3600,6400,10000,14400,19600,25600,32400,40000,48400,57600,67600,78400,90000,102400,115600,129600,144400,160000,176400,193600,211600,230400,250000,270400,291600,313600,336400,360000,384400,409600,435600,462400,490000,518400,547600,577600,608400,640842,675014,711009,748923,788858,830924,875232,921903,971062,1022844,1077386,1134836,1195351,1259092,1326232,1396952,1471443,1549906,1632554,1719608,1811305,1907891,2009628,2116789,2229665,2348560,2473795,2605708,2744655,2891011,3045172,3207553,3378593],
                    time  :{a:108000, b:11, c:1.1, d:9360},
                    icon  :'/cdn/all/both/img/city/branchoffice_l.png',
                },
                blackMarket: {
                    maxlevel:25,
                    wood:[378,762,1169,1625,2163,2827,3666,4734,6093,7813,9967,12634,15900,19855,24596,30222,36841,44565,53507,63790,75540,88886,103963,120912,139876],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[223,451,694,968,1297,1709,2236,2915,3786,4895,6290,8024,10154,12738,15841,19528,23871,28942,34817,41579,49307,58089,68014,79175,91664],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:0, b:0, c:0, d:0},
                    icon  :'/cdn/all/both/img/city/blackmarket_l.png',
                },
                marineChartArchive: {
                    maxlevel:40,
                    wood:[497,1116,1834,2667,3634,4755,6056,7564,9314,11344,13698,16431,19599,23275,27538,32484,38221,44877,52596,61551,71939,83990,97968,114183,132992,154810,180120,209478,243534,283039,328865,382024,443687,515217,598191,694442,806092,935607,1085844,1260119],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[297,916,1647,2509,3526,4727,6143,7815,9787,12115,14861,18103,21926,26438,31764,38047,45461,54210,64533,76715,91089,108051,128066,151684,179552,212438,251242,297031,351062,414819,490052,578827,683582,807192,953052,1125168,1328263,1567917,1850707,2184400],
                    glass:[138,525,982,1521,2156,2906,3792,4837,6069,7525,9241,11266,13656,16476,19804,23731,28366,33834,40285,47899,56883,67484,79993,94754,112173,132726,156978,185596,219366,259214,306235,361719,427191,504447,595611,703182,830117,979901,1156644,1365203],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:0, b:0, c:0, d:0},
                    icon  :'/cdn/all/both/img/city/marinechartarchive_l.png',
                },
                carpentering: {
                    maxlevel:50,
                    wood:[54,104,165,235,319,417,533,668,827,1013,1231,1487,1787,2137,2549,3030,3593,4252,5023,5925,6980,8213,9656,11343,13316,15621,18317,21468,25150,29454,34482,40359,47238,55289,64713,75743,88653,103763,121449,142149,166377,194734,227925,266773,312242,365461,427751,500657,585990,685867],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,0,0,0,0,308,381,469,575,701,853,1036,1254,1517,1832,2211,2664,3208,3862,4645,5586,6715,8070,9696,11646,13987,16796,20167,24212,29067,34894,41891,50291,60374,72479,87013,104459,125403,150548,180733,216971,260475,312702,375400,450669,541030,649509,779739],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:125660, b:37, c:1.06, d:2808},
                    icon  :'/cdn/all/both/img/city/carpentering_l.png',
                },
                dump: {
                    maxlevel:80,
                    wood:[550,990,1518,2153,2913,3827,4922,6237,7815,9708,11980,14706,17978,21904,26615,32268,39052,47193,56962,68685,82752,99633,119890,144198,173369,208372,250377,300784,361270,433855,520956,625478,750903,901415,1082027,1298764,1558847,1870946,2245466,2694889,3234264,3881593,4658484,5590867,6709864,8052825,9664577,11598917,13920408,16706541,20050310,24063326,28879536,34659697,41596742,49922218,59914014,71905643,86297363,103569548,124298713,149176766,179034093,214867283,257872389,309484852,371427409,445767602,534986785,642062945,770570110,924797636,1109893386,1332035549,1598638868,1918602120,2302605153,2763465357,3316565485,3980367111],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[427,801,1242,1763,2375,3103,3959,4969,6161,7567,9226,11184,13494,16221,19437,23233,27713,32999,39235,46595,55279,65527,77620,91888,108725,128594,152037,179702,212345,250864,296317,349952,413240,487921,576043,680028,802731,947520,1118371,1319975,1557920,1838759,2170225,2561442,3023182,3568157,4211372,4970538,5866554,6924092,8172266,9645444,11384185,13436361,15858473,18717208,22091275,26073570,30773734,36321177,42868631,50596365,59717144,70482083,83187570,98183417,115882499,136772114,161427405,190527194,224872670,265409450,313253612,369722426,436370616,515033175,607875879,717454917,846787273,999433788],
                    glass:[602,985,1434,1959,2572,3032,4130,5113,6263,7608,9183,11024,13179,15701,18650,22102,26139,30864,36391,42859,50426,59279,69637,81756,95936,112525,131936,154646,173476,212303,248675,291232,341021,399276,467434,547178,640478,749641,877361,1026793,1201676,1406345,1645873,1926197,2254267,2638213,3087553,3613423,4228860,4949118,5792050,6778550,7933070,9284227,10865512,12716122,14881927,17416611,20383001,23854625,27917535,32672439,38237196,44749739,52371496,61291388,71730512,83947623,98245548,114978689,134561813,157480325,184302310,215692604,252429279,295422930,345739242,404625407,473541040,554194356],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    capacity:[32000,65401,101073,139585,181437,227119,277128,331991,392268,458564,531535,611896,700427,797983,905498,1024000,1154614,1298578,1457248,1632119,1824830,2037185,2271165,2528951,2812939,3125764,3470326,3849813,4267731,4727939,5234678,5792619,6406896,7083160,7827629,8647143,9549229,10542172,11635086,12838003,14161964,15619122,17222851,18987875,20930401,23068269,25421121,28010583,30860463,33996977,37448993,41248299,45429902,50032358,55098129,60673986,66811447,73567262,81003948,89190382,98202448,108123754,119046431,131072000,144312338,158890744,174943109,192619216,212084166,233519956,257127222,283127160,311763649,343305589,378049493,416322336,458484710,504934306,556109751,612494861],
                    time  :{a:32000, b:13, c:1.17, d:2160},
                    icon  :'/cdn/all/both/img/city/dump_l.png',
                },
                embassy: {
                    maxlevel:78,
                    wood:[208,356,535,750,1008,1317,1689,2134,2668,331,4078,5002,611,7439,9036,1095,13247,16004,19313,23283,28048,33764,40625,48857,58737,70592,84817,101888,122373,146955,176454,211853,254352,305378,366639,440191,528497,634519,761809,914635,1098120,1318413,1582899,1900444,2281690,2739419,3288971,3948770,4740930,5692004,6833873,8204811,9850772,11826928,14199519,17048074,20468075,24574160,29503963,35422730,42528856,51060537,61303752,73601851,88367060,106094308,127377805,152930967,183610329,220444254,264667405,317762127,381508140,458042191,549929678,660250643,792703010,951726544],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[133,294,491,731,1023,1381,1816,2347,2996,3787,4753,593,7366,9119,11257,13865,17048,20931,25667,31446,38497,47097,57591,70393,86012,105066,128312,156673,191273,233485,284984,347812,424491,518075,632291,771688,941816,1149450,1402860,1712137,2089598,2550275,3112514,3798706,4636175,5658276,6905710,8428156,10286243,12553968,15321640,18699477,22822000,27853382,33993991,41488371,50634975,61798058,75422175,92049891,112343384,137110819,167338529,204230298,249255296,304206590,371272550,453123999,553020573,674940534,823739201,1005342303,1226981968,1497484733,1827623048,2230544282,2722294292,3322456440],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:96000, b:7, c:1.05, d:10080},
                    icon  :'/cdn/all/both/img/city/embassy_l.png',
                },
                fireworker: {
                    maxlevel:50,
                    wood:[234,303,382,473,578,699,837,996,1180,1391,1633,1911,2232,2601,3024,3512,4072,4717,5458,6311,7291,8419,9715,11206,12921,14893,17161,19768,22767,26216,30182,34744,39994,46038,52996,61005,70225,80839,93056,107119,123308,141943,163395,188088,216514,249236,286902,330262,380174,437629],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[116,182,259,348,452,571,711,872,1060,1277,1529,1823,2162,2555,3012,3542,4157,4869,5696,6655,7768,9059,10556,12292,14307,16644,19356,22500,26148,30379,35288,40981,47593,55271,64188,74543,86571,100537,116757,135594,157471,182876,212380,246644,286436,332648,386316,448642,521023,605081],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:125660, b:37, c:1.06, d:2628},
                    icon  :'/cdn/all/both/img/city/fireworker_l.png',
                },
                forester: {
                    maxlevel:61,
                    wood:[215,369,571,832,1173,1615,2189,2936,3907,5171,6812,8946,1172,15327,20015,26111,34034,44334,57725,75133,97764,127184,165429,215148,279783,36381,473043,615046,79965,1039635,1351616,1757192,2284467,2969962,3861151,5019757,6526023,8484269,11030122,14339902,18642840,24236948,31509665,40964688,53256856,69237501,90013417,117023507,152138445,197790230,257140627,334300142,434612711,565025809,734571624,954992608,1241554740,1614104820,2098445027,2728119932,3546739737],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,89,203,352,546,798,1125,155,2103,2822,3756,4971,6550,8603,11272,14742,19252,25115,32738,42647,55529,72276,94047,122348,159140,206971,269149,349982,455064,591671,769260,1000126,1300278,1690511,2197858,2857466,3715034,4829968,6279511,8164084,10614242,13799729,17941227,23325646,30326008,39427279,51259973,66643826,86644597,112647886,146455135,190408425,247552729,321846860,418437727,544016901,707284190,919550337,1195520604,1554313513,2020785330],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:72000, b:11, c:1.1, d:6120},
                    icon  :'/cdn/all/both/img/city/forester_l.png',
                },
                glassblowing: {
                    maxlevel:61,
                    wood:[235,401,617,898,1263,1738,2354,3157,4199,5554,7316,9607,12585,16456,21488,2803,36535,47591,61963,80649,104938,136516,177565,230931,300306,390494,507737,660154,858296,1115880,1450740,1886057,2451998,3187758,4144296,5387857,7004569,9106400,11838919,15391374,20009798,26014054,33819980,43968198,57161548,74313771,96612788,125602976,163292127,212290500,275991607,358807234,466472992,606445556,788419092,1024996652,1332563034,1732419548,2252259306,2928085165,3806703211],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,99,219,374,577,840,1182,1627,2205,2955,3931,5202,6852,8997,11786,15412,20125,26253,34219,44574,58037,75538,98289,127865,166315,216300,281279,365753,475568,618329,803918,1045183,1358855,1766663,2296859,2986173,3882359,5047500,6562314,8531740,11092214,14421117,18749061,24375871,31691353,41202296,53567581,69643833,90544754,117718283,153046903,198978051,258693667,336330631,437267348,568496341,739108674,960923743,1249308082,1624239900,2111693096],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:72000, b:11, c:1.1, d:6120},
                    icon  :'/cdn/all/both/img/city/glassblowing_l.png',
                },
                museum: {
                    maxlevel:36,
                    wood:[481,1234,2363,4055,6595,10405,16119,2469,37548,56833,85762,129155,194244,291878,438329,658006,987521,1481794,2223204,3335317,5003487,7505999,11260150,16891952,25340520,38014669,57027835,85550503,128338880,192528010,288821553,433276641,649981434,975071871,1462757402,2194360517],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[240,1023,2212,4021,6769,10946,17296,26948,41618,63917,97812,149332,227642,346674,527603,802613,1220630,1856015,2821801,4289796,6521148,9913144,15069498,22907948,34823590,52937193,80472645,122330751,185961486,282689952,429732042,653258546,993053083,1509592842,2294812419,3488466488],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    satisfaction:[20,41,63,88,114,144,176,211,250,294,341,395,453,518,590,670,759,857,965,1086,1219,1367,1530,1711,1912,2134,2380,2652,2953,3286,3655,4064,4516,5016,5569,6182],
                    maxBonus:[50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1400,1450,1500,1550,1600,1650,1700,1750,1800],
                    time  :{a:18000, b:1, c:1.1, d:14040},
                    icon  :'/cdn/all/both/img/city/museum_r.png',
                },
                optician: {
                    maxlevel:50,
                    wood:[102,161,231,311,405,513,638,784,952,1148,1376,1639,1944,2298,2710,3187,3741,4382,5127,5990,6992,8154,9503,11066,12881,14984,17426,20257,23541,27352,31771,36898,42851,49765,57795,67121,77951,90528,105135,122100,141801,164681,191253,222113,257950,299572,347908,404045,469238,544951],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,30,82,143,214,296,391,502,630,778,951,1150,1382,1652,1963,2325,2745,3232,3797,4453,5213,6094,7117,8304,9681,11277,13129,15277,17770,20661,24014,27905,32425,37679,43783,50877,59119,68698,79827,92761,107789,125252,145545,169125,196525,228365,265363,308354,358312,416362],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:125660, b:37, c:1.06, d:2772},
                    icon  :'/cdn/all/both/img/city/optician_l.png',
                },
                palace: {
                    maxlevel:20,
                    wood:[612,5008,13801,31386,66557,136898,27758,558944,1121673,2247131,4079425,7405756,13444352,24406772,44307863,80436146,146023147,265089275,481240988,873641108],
                    wine:[0,0,0,9372,19014,38299,76868,154007,308284,616838,1233946,2468433,4937948,9878058,19760441,39529536,79076377,158187373,316443997,633026529],
                    marble:[0,1233,3909,9262,19967,41378,84199,169841,341125,683694,1368832,2740554,5486893,10985369,21993924,44034272,88161489,176509062,353390684,707527273],
                    glass:[0,0,0,0,18221,36464,72948,145917,291856,583733,1167487,2335016,4670116,9340398,18681126,37362913,74727147,149456937,298919160,597848890],
                    sulfur:[0,0,2656,8858,21263,46072,95691,194928,393402,790351,1584248,3175603,6365454,12759465,25576175,51267094,102764189,205989415,412902967,827658356],
                    time  :{a:11520, b:1, c:1.4, d:0},
                    icon  :'/cdn/all/both/img/city/palace_l.png',
                },
                palaceColony:{
                    maxlevel:20,
                    wood:[612,5008,13801,31386,66557,136898,27758,558944,1121673,2247131,4079425,7405756,13444352,24406772,44307863,80436146,146023147,265089275,481240988,873641108],
                    wine:[0,0,0,9372,19014,38299,76868,154007,308284,616838,1233946,2468433,4937948,9878058,19760441,39529536,79076377,158187373,316443997,633026529],
                    marble:[0,1233,3909,9262,19967,41378,84199,169841,341125,683694,1368832,2740554,5486893,10985369,21993924,44034272,88161489,176509062,353390684,707527273],
                    glass:[0,0,0,0,18221,36464,72948,145917,291856,583733,1167487,2335016,4670116,9340398,18681126,37362913,74727147,149456937,298919160,597848890],
                    sulfur:[0,0,2656,8858,21263,46072,95691,194928,393402,790351,1584248,3175603,6365454,12759465,25576175,51267094,102764189,205989415,412902967,827658356],
                    time  :{a:11520, b:1, c:1.4, d:0},
                    icon  :'/cdn/all/both/img/city/palaceColony_l.png',
                },
                pirateFortress:{
                    maxlevel:30,
                    wood:[387,779,1194,1664,2229,2947,3883,5117,6737,8844,11549,14976,19258,24539,30972,38724,47969,58894,71694,86577,103757,123463,145929,171405,200146,232419,268500,308676,353243,402507],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[215,434,673,956,1319,1808,2479,3396,4633,6274,8412,11149,14594,18866,24096,30418,37979,46932,57441,69677,83818,100053,118579,139599,163326,189984,219798,253009,289861,330608],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time   :{a:1550, b:1, c:1.2, d:1800},
                    icon   :'/cdn/all/both/img/city/pirateFortress_l.png',
                },
                port: {
                    maxlevel:74,
                    wood:[51,129,235,368,547,768,1038,1414,1811,2352,3041,3863,4892,6108,7611,954,11808,14673,18143,22329,27356,33703,41278,50493,61881,75359,92107,112468,136757,166786,20283,246402,299897,364631,441994,537638,652033,790936,959771,1164024,1412356,1711592,2073513,2513976,3045758,3690710,4471434,5417311,6563277,7951657,9633732,11671630,14140619,17131894,20755934,25146596,30466049,36910766,44718784,54178492,65639285,79524466,96346887,116727883,141420228,171335934,207579939,251490917,304690720,369144286,447232209,541838670,656457962,795323552],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,0,0,151,280,464,680,978,1374,1871,2518,3318,4343,57,7366,9536,12267,15687,19949,25492,32366,41024,52078,65675,83109,105055,132228,166917,210098,264169,332782,418793,525453,6616,830582,1043000,1310271,1645242,2066850,2593492,3253373,4084635,5124763,6431252,8069741,10125666,12705379,15942324,20003946,25100346,31495153,39519164,49587450,62220829,78072811,97963398,122921504,154238178,193533392,242839836,304708068,382338449,479746700,601971622,755335750,947772410,1189236100,1492217420,1872389200,2349417230,2947977544,3699032889],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    loadingSpeed:[30,60,93,129,169,213,261,315,373,437,508,586,672,766,869,983,1108,1246,1398,1565,1748,195,2172,2416,2685,298,3305,3663,4056,4489,4965,5488,6064,6698,7394,8161,9004,9931,10951,12073,13308,14666,16159,17802,19609,21597,23784,2616,288,3174,3498,3852,4242,4668,5142,5664,624,687,7566,8334,9174,10104,1113,12258,13494,14862,16368,1803,19854,21864,24078,26514,29202,3216],
                    time  :{a:50400, b:23, c:1.15, d:1512},
                    icon  :'/cdn/all/both/img/city/port_r.png',
                },
                safehouse: {
                    maxlevel:60,
                    wood:[97,213,345,497,669,866,1089,1345,1636,1967,2346,2777,3268,3829,4467,5196,6026,6972,8052,9281,10683,12282,14104,16181,1855,21249,24327,27836,31836,36396,41593,47519,54288,62022,70857,80952,92484,105659,120712,137908,157555,180,205642,234938,268407,306644,350328,400235,457252,522392,596811,681832,778964,889934,1016714,1161553,1327026,1516072,1732050,1978795],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,110,169,236,314,405,509,632,774,937,1128,1349,1604,1902,2247,2647,3110,3648,4272,4996,5836,6810,7940,9251,10772,12536,14582,16955,19708,22902,26613,30927,35939,41764,48532,56397,65538,76159,88501,102844,119511,13888,161387,187542,217936,253256,294299,341995,39742,461827,536672,623647,724717,842167,978652,1137256,1321562,1535739],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:96000, b:7, c:1.05, d:12960},
                    icon  :'/cdn/all/both/img/city/safehouse_l.png',
                },
                shipyard: {
                    maxlevel:38,
                    wood:[90,173,278,410,577,786,105,1383,1802,2331,2997,3835,4892,6224,7903,10017,12681,16039,20268,25597,32312,40774,51434,64868,81792,103119,129989,163847,206506,260258,327985,41332,520843,656322,827026,1042112,1313121,1654593],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,0,0,669,904,1201,1575,2047,2641,339,4332,5521,7018,8904,11281,14276,1805,22804,28796,36344,45856,5784,7294,91966,11594,146145,184205,23216,292584,368717,464645,585515,737811,929703,1171488,1476136],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:64800, b:7, c:1.05, d:7128},
                    icon  :'/cdn/all/both/img/city/shipyard_l.png',
                },

                // ajout de temple Divin -> ShrineOfOlympus

                shrineOfOlympus: {
                    maxlevel:50,
                    wood:[42,98,167,254,361,493,658,862,1115,1429,1818,2301,2899,3641,4561,5701,7116,887,11044,13741,17086,21233,26375,32751,40658,50461,62618,77693,96385,119564,148305,183944,228137,282936,350886,435146,539626,669183,829833,1029039,1276055,1582354,1962165,2433131,3017129,3741286,4639240,5752704,7133399],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,0,0,0,0,0,153,370,640,975,1389,1904,2542,3332,4312,5528,7037,8907,11224,14099,17664,22084,27566,34363,42791,53241,662,82268,102193,126901,157539,195528,242636,30105,373483,4633,574672,712774,884021,1096368,1359677,1686180,2091044,2593076,3215595,3987519,4944704],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:25200, b:11, c:1.1, d:1728},
                    icon  :'/cdn/all/both/img/city/shrineOfOlympus_l.png',
                },

                // ajout de Port de marchandises -> Dockyard

                dockyard: {
                    maxlevel:50,
                    wood:[42,98,167,254,361,493,658,862,1115,1429,1818,2301,2899,3641,4561,5701,7116,887,11044,13741,17086,21233,26375,32751,40658,50461,62618,77693,96385,119564,148305,183944,228137,282936,350886,435146,539626,669183,829833,1029039,1276055,1582354,1962165,2433131,3017129,3741286,4639240,5752704,7133399],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,0,0,0,0,0,153,370,640,975,1389,1904,2542,3332,4312,5528,7037,8907,11224,14099,17664,22084,27566,34363,42791,53241,662,82268,102193,126901,157539,195528,242636,30105,373483,4633,574672,712774,884021,1096368,1359677,1686180,2091044,2593076,3215595,3987519,4944704],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:25200, b:11, c:1.1, d:1728},
                    icon  :'/cdn/all/both/buildings/x40_y40/dockyard.png',
                },

                // ajout de Forge de Chronos  -> chronosForge

                chronosForge: {
                    maxlevel:50,
                    wood:[42,98,167,254,361,493,658,862,1115,1429,1818,2301,2899,3641,4561,5701,7116,887,11044,13741,17086,21233,26375,32751,40658,50461,62618,77693,96385,119564,148305,183944,228137,282936,350886,435146,539626,669183,829833,1029039,1276055,1582354,1962165,2433131,3017129,3741286,4639240,5752704,7133399],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,0,0,0,0,0,153,370,640,975,1389,1904,2542,3332,4312,5528,7037,8907,11224,14099,17664,22084,27566,34363,42791,53241,662,82268,102193,126901,157539,195528,242636,30105,373483,4633,574672,712774,884021,1096368,1359677,1686180,2091044,2593076,3215595,3987519,4944704],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:25200, b:11, c:1.1, d:1728},
                    icon  :'/cdn/all/both/buildings/x40_y40/chronosForge.png',
                },

                stonemason: {
                    maxlevel:61,
                    wood:[235,401,617,898,1263,1738,2354,3157,4199,5554,7316,9607,12585,16456,21488,28030,36535,47591,61963,80649,104938,136516,177565,230931,300306,390494,507737,660154,858296,1115880,1450740,1886057,2451998,3187758,4144296,5387857,7004569,9106400,11838919,15391374,20009798,26014054,33819980,43968198,57161548,74313771,96612788,125602976,163292127,212290500,275991607,358807234,466472992,606445556,788419092,1024996652,1332563034,1732419548,2252259306,2928085165,3806703211],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,99,219,374,577,840,1182,1627,2205,2955,3931,5202,6852,8997,11786,15412,20125,26253,34219,44574,58037,75538,98289,127865,166315,216300,281279,365753,475568,618329,803918,1045183,1358855,1766663,2296859,2986173,3882359,5047500,6562314,8531740,11092214,14421117,18749061,24375871,31691353,41202296,53567581,69643833,90544754,117718283,153046903,198978051,258693667,336330631,437267348,568496341,739108674,960923743,1249308082,1624239900,2111693096],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:72000, b:11, c:1.1, d:6120},
                    icon  :'/cdn/all/both/img/city/stonemason_l.png',
                },
                temple: {
                    maxlevel:56,
                    wood:[185,196,286,399,514,653,823,1029,1231,1524,1816,2160,2650,3143,3833,4408,5359,6163,7471,8812,10134,12236,14407,16568,19939,22931,27543,31674,37201,43672,51248,58934,69131,82618,93217,111324,128023,149952,175636,205722,240960,282234,330578,387204,453528,531214,622206,728784,853617,999835,1171097,1371695,1606653,1881858,2204204,2581763],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[148,163,249,363,487,646,850,1109,1384,1788,2223,2760,3533,4372,5565,6677,8471,10166,12858,15825,18990,23928,29398,35277,44302,53162,66630,79955,97989,120036,146983,176379,215889,269226,316976,395001,474001,579334,708075,865425,1057743,1292797,1580085,1931216,2360375,2884904,3525994,4309550,5267229,6437726,7868332,9616852,11753933,14365921,17558351,21460211],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:2160, b:1, c:1.1, d:0},
                    icon  :'/cdn/all/both/img/city/temple_l.png',
                },
                tavern: {
                    maxlevel:70,
                    wood:[86,190,315,465,645,860,1119,143,1803,225,2787,3431,4203,5131,6244,758,9183,11106,13414,16183,19507,23495,28281,34023,40915,49185,59108,71017,85306,102455,123032,147725,177357,212916,255585,306789,368233,441967,530448,636624,764036,916929,1100402,1320569,1584770,1901810,2282259,2738814,3286701,3944191,4733208,5680066,6816336,8179914,9816267,11779966,14136495,16964436,20358093,24430637,29317873,35182779,42220933,50667036,60802744,72966054,87562577,105079069,126099653,151325310],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,80,104,135,177,229,299,388,504,657,853,1109,1442,1875,2438,3169,412,5356,6963,9052,11768,15298,19887,25854,3361,43693,56801,73841,95994,124792,16223,210899,274168,356419,463345,602349,783054,1017969,1323361,1720368,2236479,2907424,3779650,4913547,6387610,8303891,10795057,14033573,18243642,23716732,30831747,40081266,52105638,67737320,88058503,114476037,148818827,193464446,251503743,326954818,425041200,552553478,718319416,933815102,1213959454,1578147056,2051590869,2667067736],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    maxWine:[4,8,13,18,24,30,37,44,51,60,68,78,88,99,110,122,136,150,165,180,197,216,235,255,277,300,325,351,378,408,439,472,507,544,584,626,670,717,766,818,874,933,995,1060,1129,1203,1280,1361,1449,1541,1640,1745,1857,1976,2102,2237,2380,2532,2694,2867,3050,3246,3453,3675,3910,4160,4426,4710,5011,5332],
                    satisfaction:[12,24,36,48,61,73,86,99,112,125,138,152,165,179,193,207,222,236,251,266,282,297,313,329,345,361,378,395,412,430,448,466,484,502,521,540,560,580,600,620,641,662,683,705,727,749,772,795,819,843,867,891,916,942,968,994,1021,1048,1075,1103,1131,1160,1189,1219,1249,1280,1311,1343,1375,1408],
                    maxBonus:[60,120,181,242,304,367,430,494,559,624,691,758,826,896,966,1037,1109,1182,1256,1332,1408,1485,1564,1644,1725,1807,1891,1975,2061,2149,2238,2328,2419,2512,2606,2702,2800,2898,2999,3101,3204,3310,3416,3525,3635,3747,3861,3976,4094,4213,4334,4457,4582,4709,4838,4969,5103,5238,5375,5515,5657,5801,5947,6096,6247,6400,6556,6714,6875,7038],
                    time  :{a:10800, b:1, c:1.06, d:10440},
                    icon  :'/cdn/all/both/img/city/taverne_r.png',
                    wineUse: [0, 4, 8, 13, 18, 24, 30, 37, 44, 51, 60, 68, 78, 88, 99, 110, 122, 136, 150, 165, 180, 197, 216, 235, 255, 277, 300, 325, 351, 378, 408, 439, 472, 507, 544, 584, 626, 670, 717, 766, 818, 874, 933, 995, 1060, 1129, 1202, 1280, 1362],
                },
                townHall: {
                    maxlevel:66,
                    wood:[0,135,288,535,793,1195,1732,2327,3148,4107,5308,6943,8841,11199,14124,18047,21863,27765,34599,42385,52638,64331,80802,9721,12177,146383,180609,222632,270815,333385,405226,492419,59823,735066,892521,1095676,1315122,1613532,1957605,2374710,2880686,3494469,4239031,5142235,6237884,7566981,9179268,11135082,13507617,16385666,19876937,24112088,29249616,35481790,43041845,52212708,63337596,76832847,93203512,113062251,137152263,166375099,201824404,244826841,296991745,360271352],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,0,245,473,804,1213,1798,2532,3501,4871,6567,8784,11674,15698,19995,26678,34915,44905,58539,75091,98986,12498,164305,207293,26843,347289,443409,572956,731026,932491,1189231,1534000,1955370,2520083,3175628,4090537,5210432,6636074,8451790,10764309,13709563,17460677,22238144,28322787,36072268,45942107,58512461,74522227,94912471,120881750,153956559,196081062,249731375,318061105,405086733,515923697,657087086,836874602,1065854305,1357485815,1728911472,2201963988,2804449784,3571783476],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:1800, b:1, c:1.17, d:-1080},
                    icon  :'/cdn/all/both/img/city/townhall_l.png',
                },
                vineyard: {
                    maxlevel:50,
                    wood:[291,363,447,542,651,778,923,1091,1283,1504,1758,2050,2386,2773,3217,3728,4316,4992,5769,6664,7691,8874,10234,11797,13595,15664,18041,20776,23921,27538,31697,36480,41984,48318,55608,63998,73654,84767,97556,112275,129215,148711,171148,196970,226689,260891,300253,345554,397690,457692],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[105,170,245,332,433,550,686,843,1026,1238,1484,1769,2100,2484,2930,3446,4046,4741,5547,6482,7568,8826,10286,11979,13944,16223,18866,21932,25489,29615,34401,39953,46401,53891,62588,72689,84421,98046,113870,132247,153591,178380,207168,240604,279436,324534,376912,437743,508391,590441],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:125660, b:37, c:1.06, d:2232},
                    icon  :'/cdn/all/both/img/city/vineyard_l.png',
                },
                wall: {
                    maxlevel:48,
                    wood:[98,310,565,870,1237,1677,2205,2839,3599,4512,5608,6922,8498,10391,12662,15387,18657,22581,2729,32941,39722,47859,57623,6934,83401,100275,120522,144819,173976,208964,250949,301332,361791,434343,521404,625877,751246,901687,1082217,1298853,1558817,1870773,2245120,2694337,3233397,3880269,4656516,5588011],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,174,443,767,1155,1621,218,285,3655,4621,578,717,8839,10842,13245,16129,19589,23742,28725,34705,41881,50491,60824,73223,88103,105958,127384,153096,18395,220975,265404,31872,382698,459473,551602,662157,794823,954022,1145061,1374308,1649405,1979520,2375658,2851025,3421465,4105993,4927426,5913145],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:57600, b:11, c:1.1, d:3240},
                    icon  :'/cdn/all/both/img/city/wall.png',
                },
                warehouse: {
                    maxlevel:85,
                    wood:[137,247,380,538,728,957,123,1559,1953,2426,2995,3676,4494,5476,6653,8066,9763,11798,1424,17171,20688,24908,29972,36049,43342,52093,62594,75195,90318,108464,130239,156369,187725,225353,270506,324691,389711,467736,561366,673722,808565,970396,1164618,1397712,1677459,2013197,2416131,2899711,3480078,4176604,5012536,6015778,7219815,8664836,10399072,12480410,14978319,17976177,21574046,25892014,31074209,37293603,44757785,53715898,64466945,77369775,92855062,111439673,133743930,160512304,192638273,231194140,277466828,333000831,399649768,479638253,575636150,690847686,829118402,995063513,1194221950,1433241242,1720099398,2064371199,2477547780],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,0,0,82,181,300,442,614,819,1066,1362,1717,2143,2653,3268,4004,4887,5946,7218,8745,10577,12775,15412,18577,22376,26934,32403,38966,46842,56293,67634,81245,97576,117174,140691,168911,202776,243415,29218,350699,420938,505244,606436,727895,87368,1048662,1258691,1510786,1813370,2176555,2612483,3135717,3763747,4517560,5422349,6508351,7811859,9376439,11254377,13508432,16213936,19461305,23359065,28037479,33652897,40392985,48482997,58193295,69848398,83837814,100629067,120783314,144974107,174009893,208861041,250692266,300901556,361166892,433502324,520325282,624537363,749621309,899757388,1079963105,1296260886],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    capacity:[8000,16401,25455,35331,46181,58159,71421,86138,102493,120687,140942,163502,188637,216646,24786,282647,321416,364622,412768,466416,526189,592779,666959,749584,841609,944094,1058219,1185297,1326787,1484315,1659690,1854922,2072252,2314171,2583453,2883186,3216807,3588142,4001450,4461476,4973499,5543400,6177729,6883779,7669673,8544460,9518219,10602179,11808851,13152172,14647676,16312668,18166439,20230485,22528769,25088000,27937955,31111829,34646637,38583648,42968887,47853679,53295269,59357506,66111616,73637056,82022473,91366775,101780329,113386298,126322135,140741251,156814887,174734197,194712581,216988297,241827374,269526873,300418536,334872863,373303675,416173213,463997848,517354466,576887609],
                    time  :{a:2880, b:1, c:1.14, d:2160},
                    icon  :'/cdn/all/both/img/city/warehouse_l.png',
                },
                winegrower: {
                    maxlevel:61,
                    wood:[235,401,617,898,1263,1738,2354,3157,4199,5554,7316,9607,12585,16456,21488,28030,36535,47591,61963,80649,104938,136516,177565,230931,300306,390494,507737,660154,858296,1115880,1450740,1886057,2451998,3187758,4144296,5387857,7004569,9106400,11838919,15391374,20009798,26014054,33819980,43968198,57161548,74313771,96612788,125602976,163292127,212290500,275991607,358807234,466472992,606445556,788419092,1024996652,1332563034,1732419548,2252259306,2928085165,3806703211],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[0,99,219,374,577,840,1182,1627,2205,2955,3931,5202,6852,8997,11786,15412,20125,26253,34219,44574,58037,75538,98289,127865,166315,216300,281279,365753,475568,618329,803918,1045183,1358855,1766663,2296859,2986173,3882359,5047500,6562314,8531740,11092214,14421117,18749061,24375871,31691353,41202296,53567581,69643833,90544754,117718283,153046903,198978051,258693667,336330631,437267348,568496341,739108674,960923743,1249308082,1624239900,2111693096],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:72000, b:11, c:1.1, d:6120},
                    icon  :'/cdn/all/both/img/city/winegrower_l.png',
                },
                workshop: {
                    maxlevel:32,
                    wood:[189,329,489,671,879,1117,1387,1695,2046,2447,2904,3424,4017,4693,5465,6344,7346,8488,9791,11275,12967,14896,17096,19604,22462,25721,29436,33671,38498,44002,50277,57429],
                    wine:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    marble:[81,143,215,300,396,509,639,791,967,1171,1407,1682,2000,2369,2797,3294,3870,4539,5314,6214,7257,8468,9871,11500,13390,15581,18123,21072,24493,28461,33064,38404],
                    glass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    sulfur:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    time  :{a:96000, b:7, c:1.05, d:11880},
                    icon  :'/cdn/all/both/img/city/workshop_l.png',
                },
            },

            Research: {
                Seafaring: {
                    CARPENTRY: 2150,
                    DECK_WEAPONS: 1010,
                    PIRACY: 1170,
                    SHIP_MAINTENANCE: 1020,
                    DRAFT: 1130,
                    EXPANSION: 1030,
                    FOREIGN_CULTURES: 1040,
                    PITCH: 1050,
                    MARKET: 2070,
                    GREEK_FIRE: 1060,
                    COUNTERWEIGHT: 1070,
                    DIPLOMACY: 1080,
                    SEA_MAPS: 1090,
                    PADDLE_WHEEL_ENGINE: 1100,
                    CAULKING: 1140,
                    MORTAR_ATTACHMENT: 1110,
                    MASSIVE_RAM: 1150,
                    OFFSHORE_BASE: 1160,
                    SEAFARING_FUTURE: 1999,
                },

                Economy: {
                    CONSERVATION: 2010,
                    PULLEY: 2020,
                    WEALTH: 2030,
                    WINE_CULTURE: 2040,
                    IMPROVED_RESOURCE_GATHERING: 2130,
                    GEOMETRY: 2060,
                    ARCHITECTURE: 1120,
                    HOLIDAY: 2080,
                    LEGISLATION: 2170,
                    CULINARY_SPECIALITIES: 2050,
                    HELPING_HANDS: 2090,
                    SPIRIT_LEVEL: 2100,
                    WINE_PRESS: 2140,
                    DEPOT: 2160,
                    BUREACRACY: 2110,
                    UTOPIA: 2120,
                    ECONOMIC_FUTURE: 2999,
                },

                Science: {
                    WELL_CONSTRUCTION: 3010,
                    PAPER: 3020,
                    ESPIONAGE: 3030,
                    POLYTHEISM: 3040,
                    INK: 3050,
                    GOVERNMENT_FORMATION: 3150,
                    INVENTION: 3140,
                    CULTURAL_EXCHANGE: 3060,
                    ANATOMY: 3070,
                    OPTICS: 3080,
                    EXPERIMENTS: 3081,
                    MECHANICAL_PEN: 3090,
                    BIRDS_FLIGHT: 3100,
                    LETTER_CHUTE: 3110,
                    STATE_RELIGION: 3160,
                    PRESSURE_CHAMBER: 3120,
                    ARCHIMEDEAN_PRINCIPLE: 3130,
                    SCIENTIFIC_FUTURE: 3999,
                },

                Military: {
                    DRY_DOCKS: 4010,
                    MAPS: 4020,
                    PROFESSIONAL_ARMY: 4030,
                    SEIGE: 4040,
                    CODE_OF_HONOR: 4050,
                    BALLISTICS: 4060,
                    LAW_OF_THE_LEVEL: 4070,
                    GOVERNOR: 4080,
                    PYROTECHNICS: 4130,
                    LOGISTICS: 4090,
                    GUNPOWDER: 4100,
                    ROBOTICS: 4110,
                    CANNON_CASTING: 4120,
                    MILITARISTIC_FUTURE: 4999,
                },
            },

            Government: {
                ANARCHY: 'anarchie',

                IKACRACY: 'ikakratie',
                ARISTOCRACY: 'aristokratie',
                DICTATORSHIP: 'diktatur',
                DEMOCRACY: 'demokratie',
                NOMOCRACY: 'nomokratie',
                OLIGARCHY: 'oligarchie',
                TECHNOCRACY: 'technokratie',
                THEOCRACY: 'theokratie',
            },

            TradeGoodOrdinals: {
                WINE: 1,
                MARBLE: 2,
                GLASS: 3,
                SULFUR: 4,
            },

            Time: {
                SECONDS_PER_HOUR: 3600,
                SECONDS_PER_MINUTE: 60,
                MILLIS_PER_DAY: 1000 * 60 * 60 * 24,
                MILLIS_PER_HOUR: 1000 * 60 * 60,
                MILLIS_PER_SECOND: 1000,
                MILLIS_PER_MINUTE: 60000,
                MINUTES_PER_DAY: 24 * 60,
                MINUTES_PER_HOUR: 60,
                HOURS_PER_DAY: 24,
                HOURS_PER_WEEK: 24 * 7,

                SAFE_TIME_DELTA: 1000,
                INITIAL_PAGE_LOAD_DELTA: 2000,
            },

            GamePlay: {
                BUILDING_SPOTS: 25, // passé de 24 à 26
                HAPPINESS_PER_CULTURAL_GOOD: 50,
                HAPPINESS_PER_WINE_SERVING_LEVEL: 60,
                BASE_RESOURCE_PROTECTION: 100,
                RESOURCES_PER_TRANSPORT: 580, // v2.31 : capacité d'un navire marchand (vérifiée en jeu)
                RESOURCE_PROTECTION_WAREHOUSE: 480,
                RESOURCE_PROTECTION_WAREHOUSE_INACTIVE: 80,
            },

            BaseView: {
                ISLAND: 'island',
                CITY: 'city',
                WORLD: 'worldview',
            },

            Military: {
                // Army
                HOPLITE: 'phalanx',
                STEAM_GIANT: 'steamgiant',
                SPARTAN: 'spartan', // v2.26 (unité non recrutable, s319)
                SPEARMAN: 'spearman',
                SWORDSMAN: 'swordsman',
                SLINGER: 'slinger',
                ARCHER: 'archer',
                GUNNER: 'marksman',
                BATTERING_RAM: 'ram',
                CATAPULT: 'catapult',
                MORTAR: 'mortar',
                GYROCOPTER: 'gyrocopter',
                BALLOON_BOMBADIER: 'bombardier',
                COOK: 'cook',
                DOCTOR: 'medic',
                ARMY: 'army',

                // Navy
                RAM_SHIP: 'ship_ram',
                FLAME_THROWER: 'ship_flamethrower',
                STEAM_RAM: 'ship_steamboat',
                BALLISTA_SHIP: 'ship_ballista',
                CATAPULT_SHIP: 'ship_catapult',
                MORTAR_SHIP: 'ship_mortar',
                SUBMARINE: 'ship_submarine',
                PADDLE_SPEED_SHIP: 'ship_paddlespeedship',
                BALLOON_CARRIER: 'ship_ballooncarrier',
                TENDER: 'ship_tender',
                ROCKET_SHIP: 'ship_rocketship',
                NAVY: 'navy',
            },

            UnitData: {
                spearman: {
                    minimumBuildingLevelToBuild: 1,
                    baseBuildTime: 60,
                    isArmy: true,
                    speed: 60,
                    cargoSize: 3,
                },
                slinger: {
                    minimumBuildingLevelToBuild: 2,
                    baseBuildTime: 90,
                    isArmy: true,
                    speed: 60,
                    cargoSize: 3,
                },
                ram: {
                    minimumBuildingLevelToBuild: 3,
                    baseBuildTime: 600,
                    isArmy: true,
                    speed: 40,
                    cargoSize: 30,
                },
                phalanx: {
                    minimumBuildingLevelToBuild: 4,
                    baseBuildTime: 300,
                    isArmy: true,
                    speed: 60,
                    cargoSize: 5,
                },
                cook: {
                    minimumBuildingLevelToBuild: 5,
                    baseBuildTime: 1200,
                    isArmy: true,
                    speed: 40,
                    cargoSize: 20,
                },
                swordsman: {
                    minimumBuildingLevelToBuild: 6,
                    baseBuildTime: 180,
                    isArmy: true,
                    speed: 60,
                    cargoSize: 3,
                },
                archer: {
                    minimumBuildingLevelToBuild: 7,
                    baseBuildTime: 240,
                    isArmy: true,
                    speed: 60,
                    cargoSize: 5,
                },
                catapult: {
                    minimumBuildingLevelToBuild: 8,
                    baseBuildTime: 1800,
                    isArmy: true,
                    speed: 40,
                    cargoSize: 30,
                },
                medic: {
                    minimumBuildingLevelToBuild: 9,
                    baseBuildTime: 1200,

                    isArmy: true,
                    speed: 60,
                    cargoSize: 10,
                },
                gyrocopter: {
                    minimumBuildingLevelToBuild: 10,
                    baseBuildTime: 900,
                    isArmy: true,
                    speed: 80,
                    cargoSize: 15,
                },
                bombardier: {
                    minimumBuildingLevelToBuild: 11,
                    baseBuildTime: 1800,
                    isArmy: true,
                    speed: 20,
                    cargoSize: 30,
                },
                steamgiant: {
                    minimumBuildingLevelToBuild: 12,
                    baseBuildTime: 900,
                    isArmy: true,
                    speed: 40,
                    cargoSize: 15,
                },
                marksman: {
                    minimumBuildingLevelToBuild: 13,
                    baseBuildTime: 600,
                    isArmy: true,
                    speed: 60,
                    cargoSize: 5,
                },
                mortar: {
                    minimumBuildingLevelToBuild: 14,
                    baseBuildTime: 2400,
                    isArmy: true,
                    speed: 40,
                    cargoSize: 30,
                },

                barbarian: {
                    minimumBuildingLevelToBuild: 1,
                    baseBuildTime: 1,
                    isArmy: true,
                    speed: 40,
                    cargoSize: 5,
                },
                // v2.26 : Spartiate (non recrutable). Vitesse et place en cale
                // reprises de l'hoplite, faute de valeur publiée par le jeu.
                spartan: {
                    minimumBuildingLevelToBuild: 1,
                    baseBuildTime: 1,
                    isArmy: true,
                    speed: 60,
                    cargoSize: 5,
                },

                ship_ram: {
                    minimumBuildingLevelToBuild: 1,
                    baseBuildTime: 2400,
                    isArmy: false,
                    speed: 40,
                    cargoSize: 0,
                },
                ship_flamethrower: {
                    minimumBuildingLevelToBuild: 4,
                    baseBuildTime: 1800,
                    isArmy: false,
                    speed: 40,
                    cargoSize: 0,
                },
                ship_submarine: {
                    minimumBuildingLevelToBuild: 19,
                    baseBuildTime: 3600,
                    isArmy: false,
                    speed: 40,
                    cargoSize: 0,
                },
                ship_ballista: {
                    minimumBuildingLevelToBuild: 3,
                    baseBuildTime: 3000,
                    isArmy: false,
                    speed: 40,
                    cargoSize: 0,
                },
                ship_catapult: {
                    minimumBuildingLevelToBuild: 3,
                    baseBuildTime: 3000,
                    isArmy: false,
                    speed: 40,
                    cargoSize: 0,
                },
                ship_mortar: {
                    minimumBuildingLevelToBuild: 17,
                    baseBuildTime: 3000,
                    isArmy: false,
                    speed: 30,
                    cargoSize: 0,
                },
                ship_steamboat: {
                    minimumBuildingLevelToBuild: 15,
                    baseBuildTime: 2400,
                    isArmy: false,
                    speed: 40,
                    cargoSize: 0,
                },
                ship_rocketship: {
                    minimumBuildingLevelToBuild: 11,
                    baseBuildTime: 3600,
                    isArmy: false,
                    speed: 30,
                    cargoSize: 0,
                },
                ship_paddlespeedship: {
                    minimumBuildingLevelToBuild: 13,
                    baseBuildTime: 1800,
                    isArmy: false,
                    speed: 60,
                    cargoSize: 0,
                },
                ship_ballooncarrier: {
                    minimumBuildingLevelToBuild: 7,
                    baseBuildTime: 3900,
                    isArmy: false,
                    speed: 20,
                    cargoSize: 0,
                },
                ship_tender: {
                    minimumBuildingLevelToBuild: 9,
                    baseBuildTime: 2400,
                    isArmy: false,
                    speed: 30,
                    cargoSize: 0,
                },
            },

            UnitIds: {
                301: 'slinger',
                302: 'swordsman',
                303: 'phalanx',
                304: 'marksman',
                305: 'mortar',
                306: 'catapult',
                307: 'ram',
                308: 'steamgiant',
                309: 'bombardier',
                310: 'cook',
                311: 'medic',
                312: 'gyrocopter',
                313: 'archer',
                315: 'spearman',
                316: 'barbarian',
                319: 'spartan', // v2.26

                210: 'ship_ram',
                211: 'ship_flamethrower',
                212: 'ship_submarine',
                213: 'ship_ballista',
                214: 'ship_catapult',
                215: 'ship_mortar',
                216: 'ship_steamboat',
                217: 'ship_rocketship',
                218: 'ship_paddlespeedship',
                219: 'ship_ballooncarrier',
                220: 'ship_tender',
            },

            IkariamAjaxResponseType: {
                RELOAD: 'reload',
                PROVIDE_FEEDBACK: 'provideFeedback',
                QUEST_DATA: 'questData',
                UPDATE_GLOBAL_DATA: 'updateGlobalData',
                UPDATE_TEMPLATE_DATA: 'updateTemplateData',
                UPDATE_BACKGROUND_DATA: 'updateBackgroundData',
                CLOSE_VIEW: 'closeView',
                CHANGE_VIEW: 'changeView',
                ADD_WINDOW: 'addWindow',
                CREATE_VIEW: 'createView',
                EVAL_SCRIPT: 'evalScript',
            },


            CityType: {
                OWN: 'ownCity',
                DEPLOYMENT: 'deployedCities',
                OCCUPATION: 'occupiedCities',
            },

            View: {
                CITY_DETAIL: 'cityDetails',
                CITY_MILITARY: 'cityMilitary',
                RELATED_CITIES: 'relatedCities',
                ACADEMY: 'academy',
                PALACE: 'palace',
                MUSEUM: 'museum',
                ASSIGN_CULTURAL_POSSESSIONS: 'culturalPossessions_assign',
                TOWN_HALL: 'townHall',
                TEMPLE: 'temple',
                RESEARCH_ADVISOR: 'researchAdvisor',
                FINANCES: 'finances',
                BILAN: 'bilan',
                SHRINE_OF_OLYMPUS: 'shrineOfOlympus', // v2.07 : vue Sanctuaire divin
                BARRACKS: 'barracks',
                SHIPYARD: 'shipyard',
                PIRATE_FORTRESS: 'pirateFortress',
                MILITARY_ADVISOR: 'militaryAdvisor',
                MILITARY_ADVISOR_REPORT: 'militaryAdvisorReportView',
                PREMIUM: 'premium',
                TRANSPORT: 'transport',
                DEPLOY: 'deployment',
                BRANCH_OFFICE: 'branchOffice',
                BLACK_MARKET: 'blackMarket',
                TAKE_OFFER: 'takeOffer',
                RESOURCE: 'resource',
                TRADE_GOOD: 'tradegood',
                ABOLISH_CITY: 'abolishCity',
                HIDEOUT: 'safehouse',
                PILLAGE: 'plunder',
                BLOCKADE: 'blockade',
                SEND_SPY: 'sendSpy',
                SPY_MISSION: 'spyMissions',
                HIGH_SCORE: 'highscore',
                ALLIANCE_PAGE: 'allyPage',
                OCCUPY: 'occupy',
                COLONIZE: 'colonize',
            },

            PlayerState: {
                INACTIVE: 'inactive',
                NORMAL: '',
                VACATION: 'vacation',
                NEW: 'noob',
            },

            CombatType: {
                BLOCKADE: 'blockade',
                PILLAGE: 'plunder',
            },
        };

        var EmpireData = function() {
            // v2.38 : registre des types du modèle. Chaque fichier du modèle y inscrit ses classes ;
            // le magasin (03-donnees) s'en sert pour recréer les objets sauvegardés, sans dépendre
            // directement des fichiers du modèle (plus de dépendance circulaire).
            var _impTypes = {};

            function Military(city) {
                this._ikaToolsType = 'military';

                this.lastArmyUpdate = 0;
                this.lastNavyUpdate = 0;

                this.present = new MilitaryUnits();
                this.armyTrainingBatches = [];
                this.navyTrainingBatches = [];

                this._setCity(city);
            }

            $.extend(Military.prototype, {
                _setCity: function setCity(city) {
                    if (city) {
                        this.city = Utils.fixedFunction(city);
                        this._startArmyTrainingTimers();
                        this._startNavyTrainingTimers();
                    }
                },
                _startTrainingTimers: function startTrainingTimers(batches) {
                    var military = this;
                    while (batches.length > 0 && batches[0].completionTime <= View.gameTimeNow()) {
                        var batch = batches.shift();
                        if ((batch.type == Constants.Military.ARMY &&
                             batch.getCompletionTime() > this.lastArmyUpdate) ||
                            (batch.type == Constants.Military.NAVY &&
                             batch.getCompletionTime() > this.lastNavyUpdate)) {
                            military.present._increment(batch.getUnits());
                        }
                    }
                    $.each(batches, function startTrainingBatchTimers(index, batch) {
                        if (batch.completionEvent) {
                            batch.completionEvent();
                        }
                        batch.completionEvent = militaryChangedEvent().scheduleSend(
                            'MilitaryTrainingComplete[' + military.city().getId() + ']',
                            batch.getCompletionTime() - View.gameTimeNow() +
                            Constants.Time.SAFE_TIME_DELTA,
                            function militaryTrainingComplete() {
                                military.present._increment(batches.shift().getUnits());
                                empireData.saveAsync();
                            },
                            [{
                                city: military.city(),
                                military: military,
                                type: 'training_complete',
                            }]);
                    });
                },
                _startArmyTrainingTimers: function startArmyTrainingTimers() {
                    this._startTrainingTimers(this.armyTrainingBatches);
                },
                _startNavyTrainingTimers: function startNavyTrainingTimers() {
                    this._startTrainingTimers(this.navyTrainingBatches);
                },
                _updatePresent: function updatePresent(unit, count) {
                    return this.present._setCount(unit, count);
                },
                _markPresentUpdated: function markPresentUpdated(army, navy) {
                    if (army || army === undefined) {
                        this.lastArmyUpdate = View.gameTimeNow();
                    }
                    if (navy || navy === undefined) {
                        this.lastNavyUpdate = View.gameTimeNow();
                    }
                },
                _setArmyTrainingBatches: function setArmyTrainingBatches(batches) {

                    $.each(this.armyTrainingBatches, function cancelTrainingBatchTimer(index, batch) {
                        if (batch.completionEvent) {
                            batch.completionEvent();
                        }
                    });

                    this.armyTrainingBatches = batches;

                    this._startArmyTrainingTimers();
                },
                _setNavyTrainingBatches: function setNavyTrainingBatches(batches) {
                    $.each(this.navyTrainingBatches, function cancelTrainingBatchTimer(index, batch) {
                        if (batch.completionEvent) {
                            batch.completionEvent();
                        }
                    });

                    this.navyTrainingBatches = batches;

                    this._startNavyTrainingTimers();
                },
                _increment: function increment(units) {
                    this.present._increment(units);
                },
                _decrement: function decrement(units) {
                    this.present._decrement(units);
                },
                _clear: function clear() {
                    this.present._clear();
                    this.armyTrainingBatches = [];
                    this.navyTrainingBatches = [];
                },
                getTrainingBatches: function getTrainingBatches(batches) {
                    return $.merge($.merge([], this.armyTrainingBatches), this.navyTrainingBatches);
                },
                getPresent: function getPresent() {
                    return this.present;
                },
            });

            function MilitaryUnits() {
                this._ikaToolsType = 'militaryUnits';

                this.units = {};
            }

            $.extend(MilitaryUnits.prototype, {
                _setCount: function setCount(unit, count) {
                    var oldCount = this.units[unit];
                    this.units[unit] = count;
                    return oldCount != count;
                },
                _increment: function increment(units) {
                    $.each(units.units, function(unit, count) {
                        this._setCount(unit, (this.getCount(unit) || 0) + count);
                    }.bind(this));
                },
                _decrement: function decrement(units) {
                    $.each(units.units, function(unit, count) {
                        this._setCount(unit, Math.max(0, (this.getCount(unit) || 0) - count));
                    }.bind(this));
                },
                _clear: function clear() {
                    this.units = {};
                },
                getCount: function getCount(unit) {
                    return this.units[unit];
                },
                getCounts: function getCounts() {
                    return this.units;
                },
                getCargoSize: function getCargoSize() {
                    var cargoSize = 0;
                    $.each(this.units, function addCargoSize(unit, count) {
                        cargoSize += Constants.UnitData[unit].cargoSize * count;
                    });
                    return cargoSize;
                },
            });

            function TrainingBatch(type, completionTime, units) {
                this._ikaToolsType = 'trainingBatch';

                this.type = type;
                this.units = units;
                this.completionTime = completionTime;
            }

            $.extend(TrainingBatch.prototype, {
                getUnits: function getUnits() {
                    return this.units;
                },
                getCompletionTime: function getCompletionTime() {
                    return this.completionTime;
                },
                _getType: function getType() {
                    return this.type;
                },
            });

            _impTypes.military = Military;
            _impTypes.militaryUnits = MilitaryUnits;
            _impTypes.trainingBatch = TrainingBatch;

            // v2.24 : signature des entrepôts/dépôts, pour savoir si la capacité lue est encore valable
            function _impWarehouseSig(city) {
                try {
                    var lv = [];
                    $.each(city.getBuildingsByType(Constants.Buildings.WAREHOUSE), function(i, b) { lv.push('w' + b.getLevel()); });
                    $.each(city.getBuildingsByType(Constants.Buildings.DUMP), function(i, b) { lv.push('d' + b.getLevel()); });
                    return lv.join(',');
                } catch (e) { return '?'; }
            }

            function City(id, type) {
                this._ikaToolsType = 'city';

                if (id) {
                    this.id = id;
                    this.type = type;

                    this.level = 0;

                    this.resources = {
                        wood: new City.Resource(this),
                        wine: new City.Resource(this),
                        marble: new City.Resource(this),
                        glass: new City.Resource(this),
                        sulfur: new City.Resource(this),
                    };

                    this.buildings = new Array(Constants.GamePlay.BUILDING_SPOTS);
                    for (var i = 0; i < Constants.GamePlay.BUILDING_SPOTS; i++) {
                        this.buildings[i] = new City.Building(this);
                    }
                    this.military = new Military();

                    this.actionPoints = 0;
                    this.researchPerHour = null;
                    this.happinessScore = null;
                    this.scientists = 0;
                    this.culturalGoods = 0;
                    this.priests = 0;
                    this.tavernWineLevel = 0;
                    this.population = undefined;

                    this.resourceUpdateTime = 0;
                    this.islandCoordinates = undefined;
                }
            }

            $.extend(City.prototype, {
                _postLoad: function postLoad() {
                    // Effacer les données or per-ville (non fiables entre sessions)
                    this.cityGoldNet        = 0;
                    this.cityGoldNetUpdated = 0;
                    while (this.buildings.length < Constants.GamePlay.BUILDING_SPOTS) {
                        this.buildings.push(new City.Building(this));
                    }
                    for (var i = 0; i < Constants.GamePlay.BUILDING_SPOTS; i++) {
                        this.buildings[i]._setCity(this);
                    }
                    if (this.isOwn()) {
                        this.resources[Constants.Resources.WOOD]._setCity(this);
                        this.resources[Constants.Resources.WINE]._setCity(this);
                        this.resources[Constants.Resources.MARBLE]._setCity(this);
                        this.resources[Constants.Resources.GLASS]._setCity(this);
                        this.resources[Constants.Resources.SULFUR]._setCity(this);
                    }
                    this.military._setCity(this);
                },
                _updateFromGlobalData: function _updateFromGlobalData(data, correctWineConsumption) {
                    var changes = [];
                    var ap = data.maxActionPoints;
                    if (ap == null) {
                        ap = parseInt($('#js_GlobalMenu_maxActionPoints').text());
                    }
                    if (!isNaN(ap)) {
                        this._updateActionPoints(ap, changes);
                    }

                    if (this.isOwn()) {
                        var wineConsumption = data.wineSpendings;
                        var baseWineConsumption = data.wineSpendings;

                        var winePress = this.getBuildingByType(Constants.Buildings.WINE_PRESS);
                        if (correctWineConsumption) {
                            if (winePress) {
                                wineConsumption = wineConsumption * (100 - winePress.getLevel()) / 100;
                            }
                        } else {
                            if (winePress) {
                                baseWineConsumption = Math.floor(
                                    wineConsumption / (100 - winePress.getLevel()) * 100);
                            }
                        }

                        // v2.20 : table maxWine (70 niveaux, maxWine[0] = niveau 1) au lieu de
                        // wineUse limitée à 48 entrées (niveaux > 47 jamais reconnus).
                        var maxWine = Constants.BuildingData[Constants.Buildings.TAVERN].maxWine;
                        if (isFinite(baseWineConsumption)) {
                            var wineLevel = 0;
                            if (baseWineConsumption > 0) {
                                wineLevel = maxWine.length;
                                for (var i = 0; i < maxWine.length; i++) {
                                    if (maxWine[i] >= baseWineConsumption) { wineLevel = i + 1; break; }
                                }
                            }
                            this._updateTavernWineLevel(wineLevel, changes);
                        }

                        this._updateResources(data.currentResources,
                                              data.maxResources || (data.headerData && data.headerData.maxResources), // v2.24
                                              data.resourceProduction,
                                              data.tradegoodProduction,
                                              wineConsumption / Constants.Time.SECONDS_PER_HOUR,
                                              changes);
                    }

                    raiseResourcesChanged(changes);
                },
                _updateFromBackgroundData: function _updateFromBackgroundData(data) {
                    this.islandId = parseInt(data.islandId);
                    if (this.isOwn()) {
                        this._updateBuildings(data.position);
                    }
                },
                _updateBuildings: function _updateBuildings(buildingsData) {
                    var changes = [];
                    for (var i = 0; i < Constants.GamePlay.BUILDING_SPOTS; i++) {
                        var building = this.buildings[i];
                        if (buildingsData[i]) {
                            if (building._update(i, buildingsData[i])) {
                                changes.push({
                                    city: this,
                                    building: building,
                                    type: Constants.BuildingEventType.DATA_REFRESH,
                                });
                            }
                        }
                    }
                    this.level = this.buildings[0].getLevel();
                    raiseBuildingsChanged(changes);
                },


                // Mise à jour Ressources

                _updateResources: function updateResources(
                currentInfo, maxInfo, woodProduction, resourceProduction, wineConsumption,
                 changedAccumulator) {

                    if (!currentInfo) return;

                    // Helper: prend la 1ère valeur EXISTANTE (pas "truthy") parmi plusieurs clés
                    function pick(obj, keys) {
                        if (!obj) return undefined;
                        for (let i = 0; i < keys.length; i++) {
                            const k = keys[i];
                            if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
                        }
                        return undefined;
                    }

                    // v2.24 : capacité réelle d'entrepôt envoyée par le jeu (même valeur pour toutes les ressources)
                    try {
                        var maxV = Number(pick(maxInfo, ["resource", "wood", "0", 0]));
                        if (isFinite(maxV) && maxV > 0) {
                            var firstRead = (this._realCapacity !== maxV);
                            this._realCapacity = maxV;
                            this._realCapacitySig = _impWarehouseSig(this);
                            this._realCapacityUpdated = View.gameTimeNow();
                            if (firstRead) {
                                console.log('[Imperator] Capacité réelle lue (' + this.getName() + ') : ' + maxV +
                                            ' (formule : ' + this._formulaCapacity().maximum + ')');
                            }
                        }
                    } catch (eCap) {}

                    // Bois : certains serveurs/versions utilisent "resource", d'autres "wood" ou "0"
                    const woodCurrent = pick(currentInfo, ["resource", "wood", "0"]);

                    // Luxes : parfois "1..4", parfois "wine/marble/glass/sulfur", parfois "1..4" mais en string/number
                    const wineCurrent   = pick(currentInfo, ["1", 1, "wine"]);
                    const marbleCurrent = pick(currentInfo, ["2", 2, "marble"]);
                    const glassCurrent  = pick(currentInfo, ["3", 3, "glass"]);
                    const sulfurCurrent = pick(currentInfo, ["4", 4, "sulfur"]);

                    this._updateResource(Constants.Resources.WOOD,
                                         changedAccumulator,
                                         woodCurrent,
                                         woodProduction);

                    this._updateResource(Constants.Resources.WINE,
                                         changedAccumulator,
                                         wineCurrent,
                                         this.getTradeGoodType() == Constants.Resources.WINE ? resourceProduction : undefined,
                                         wineConsumption);

                    this._updateResource(Constants.Resources.MARBLE,
                                         changedAccumulator,
                                         marbleCurrent,
                                         this.getTradeGoodType() == Constants.Resources.MARBLE ? resourceProduction : undefined);

                    this._updateResource(Constants.Resources.GLASS,
                                         changedAccumulator,
                                         glassCurrent,
                                         this.getTradeGoodType() == Constants.Resources.GLASS ? resourceProduction : undefined);

                    this._updateResource(Constants.Resources.SULFUR,
                                         changedAccumulator,
                                         sulfurCurrent,
                                         this.getTradeGoodType() == Constants.Resources.SULFUR ? resourceProduction : undefined);

                    this._updatePopulation(currentInfo.population != null ? currentInfo.population : undefined, changedAccumulator);
                    this.resourceUpdateTime = View.gameTimeNow();
                },


                _updateResource: function updateResource(
                name, changedAccumulator, current, max, production, consumption) {
                    var resource = this.resources[name];
                    if (resource._update(current, max, production, consumption)) {
                        changedAccumulator.push({
                            city: this,
                            type: name,
                            value: resource,
                        });
                    }
                },


                _incrementResource: function incrementResource(name, changedAccumulator, delta) {
                    var resource = this.resources[name];
                    if (delta) {
                        resource._increment(delta);
                        changedAccumulator.push({
                            city: this,
                            type: name,
                            value: resource,
                        });
                    }
                },

                // Fin mise à jour Ressources

                _updateActionPoints: function updateActionPoints(actionPoints, changedAccumulator) {
                    if (this.actionPoints != actionPoints) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.ACTION_POINTS,
                            value: actionPoints,
                        });
                    }
                    this.actionPoints = actionPoints;
                },
                _updateActionPointsBy: function updateActionPointsBy(delta, changedAccumulator) {
                    this._updateActionPoints(
                        Math.max(0, Math.min(this.actionPoints + delta, this.getMaxActionPoints())),
                        changedAccumulator);
                },
                _updateScientists: function updateScientists(scientists, changedAccumulator) {
                    if (this.scientists != scientists) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.SCIENTISTS,
                            value: scientists,
                        });
                    }
                    this.scientists = scientists;
                },
                // v3.2 : heure du dernier relevé fiable du nombre de chercheurs (académie ou
                // formulaire de l'académie). 0 = jamais relevé (nombre déduit ou inconnu).
                _markScientistsRead: function markScientistsRead() {
                    this.scientistsReadAt = Date.now();
                },
                getScientistsReadAt: function getScientistsReadAt() {
                    return this.scientistsReadAt || 0;
                },
                // v3.5 : expérience de l'académie. Heure à laquelle le labo redevient utilisable
                // (lancement + 4 h), et « vu » une fois l'académie revisitée après cette heure.
                _markExperimentLaunched: function markExperimentLaunched(readyAt) {
                    this.experimentReadyAt = readyAt;
                    this.experimentAck = false;
                },
                _ackExperiment: function ackExperiment() {
                    if (this.experimentReadyAt && this.experimentReadyAt <= Date.now()) {
                        this.experimentAck = true;
                    }
                },
                getExperimentReadyAt: function getExperimentReadyAt() {
                    return this.experimentReadyAt || 0;
                },
                isExperimentAcknowledged: function isExperimentAcknowledged() {
                    return !!this.experimentAck;
                },
                // v3.5 : points de recherche par chercheur, lus dans l'académie
                _updateResearchFactor: function updateResearchFactor(factor) {
                    if (factor > 0) this.researchFactor = factor;
                },

                _updateResearchPerHour: function updateResearchPerHour(value, changedAccumulator) {
                    this.researchPerHour = value;
                },

                _updateHappinessScore: function updateHappinessScore(value, changedAccumulator) {
                    this.happinessScore = value;
                },

                // Niveau taverne
                _updateTavernWineLevel: function updateTavernWineLevel(level, changedAccumulator) {
                    if (this.tavernWineLevel != level) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.TAVERN_WINE_LEVEL,
                            value: level,
                        });
                    }
                    this.tavernWineLevel = level;
                },

                // Traités culturels
                _updateCulturalGoods: function updateCulturalGoods(culturalGoods, changedAccumulator) {
                    if (this.culturalGoods != culturalGoods) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.CULTURAL_GOODS,
                            value: culturalGoods,
                        });
                    }
                    this.culturalGoods = culturalGoods;
                },

                // Population
                _updatePopulation: function updatePopulation(population, changedAccumulator) {
                    // Pas de donnée fiable dans cette réponse -> on garde la valeur précédente
                    // v2.08 : la vue Hôtel de Ville renvoie population=0 (le compteur de
                    // citoyens n'y est pas exposé) ; 0 (ou négatif) = donnée non fiable,
                    // on conserve la dernière valeur connue au lieu d'écraser à zéro.
                    if (population === undefined || population === null || isNaN(population) || Number(population) <= 0) {
                        return;
                    }
                    if (Math.abs(this.getPopulationData().population - population) >= 1) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.POPULATION,
                            value: population,
                        });
                    }
                    this.population = population;
                },

                // Priest
                _updatePriests: function updatePriests(priests, changedAccumulator) {
                    if (this.priests != priests) {
                        changedAccumulator.push({
                            city: this,
                            type: Constants.Resources.PRIESTS,
                            value: priests,
                        });
                    }
                    this.priests = priests;
                },

                getLastResourceUpdate: function getLastResourceUpdate() {
                    return this.resourceUpdateTime;
                },

                getTimeSinceResourceUpdate: function getTimeSinceLastResourceUpdate() {
                    return View.gameTimeNow() - this.resourceUpdateTime;
                },

                isOwn: function isOwn() {
                    return this.type == Constants.CityType.OWN;
                },
                isDeployment: function isDeployment() {
                    return this.type == Constants.CityType.DEPLOYMENT;
                },
                isOccupation: function isOccupation() {
                    return this.type == Constants.CityType.OCCUPATION;
                },
                getType: function getType() {
                    return this.type;
                },

                getBuildingByPosition: function getBuildingByPosition(position) {
                    return this.buildings[position];
                },
                getBuildingsByType: function getBuildingsByType(type) {
                    return this.buildings.filter(function buildingsFilter(building) {
                        return building.getType() == type;
                    });
                },
                getBuildingByType: function getBuildingByType(type) {
                    for (var i = 0; i < Constants.GamePlay.BUILDING_SPOTS; i++) {
                        var building = this.buildings[i];
                        if (building && building.getType() == type) {
                            return building;
                        }
                    }
                    return null;
                },
                getBuildings: function getBuildings() {
                    return this.buildings;
                },
                getMilitary: function getMilitary() {
                    return this.military;
                },
                getId: function getId() {
                    return this.id;
                },
                getName: function getName() {
                    return this.name;
                },
                getIslandId: function getIslandId() {
                    return this.islandId;
                },
                getTradeGoodType: function getTradeGoodType() {
                    return this.tradeGoodType;
                },
                getActionPoints: function getActionPoints() {
                    return this.actionPoints;
                },
                getMaxActionPoints: function getMaxActionPoints() {
                    return 3 + Math.floor(this.level / 4) - (this.isOwn() ? 0 : 2);
                },
                getCulturalGoods: function getCulturalGoods() {
                    return this.culturalGoods;
                },
                getTavernWineLevel: function getTavernWineLevel() {
                    return this.tavernWineLevel;
                },
                getPopulationData: function getPopulationData() {
                    var max = 0;
                    var happiness = 196;

                    var townHall = this.getBuildingByType(Constants.Buildings.TOWN_HALL);
                    var temple = this.getBuildingByType(Constants.Buildings.TEMPLE);
                    var palace = this.getBuildingByType(Constants.Buildings.PALACE);
                    var tavern = this.getBuildingByType(Constants.Buildings.TAVERN);
                    var museum = this.getBuildingByType(Constants.Buildings.MUSEUM);
                    var civData = getCivilizationData();

                    if (townHall) {
                        // Formula from http://ikariam.wikia.com/wiki/Citizen
                        max += Math.floor(10 * Math.pow(townHall.getLevel(), 1.5)) * 2 + 40;

                    }

                    if (civData.hasResearched(Constants.Research.Economy.HOLIDAY)) {
                        max += 50;
                        happiness += 25;
                    }
                    if (civData.hasResearched(Constants.Research.Economy.ECONOMIC_FUTURE)) {
                        var level = civData.getResearchLevel(Constants.Research.Economy.ECONOMIC_FUTURE);
                        max += 20 * level;
                        happiness += 10 * level;
                    }
                    if (palace) {
                        if (civData.hasResearched(Constants.Research.Science.WELL_CONSTRUCTION)) {
                            max += 50;
                            happiness += 50;
                        }
                        if (civData.hasResearched(Constants.Research.Economy.UTOPIA)) {
                            max += 200;
                            happiness += 200;
                        }
                    }

                    // v2.09 : lookups de bonus sécurisés — un index NaN / hors borne
                    // (ex. culturalGoods corrompu par une réponse Hôtel de Ville) ne doit
                    // JAMAIS rendre happiness = NaN (ce qui affichait population = 0).
                    function _impBonus(table, index) {
                        var v = table ? table[index] : undefined;
                        return (typeof v === 'number' && isFinite(v)) ? v : 0;
                    }
                    // v2.18 : les tables sont indexées à partir du niveau 1 (table[0] = niveau 1)
                    // -> on lit table[niveau - 1]. Niveau 0 -> index -1 -> undefined -> bonus 0.
                    function _impLevel(v) {
                        v = Math.round(Number(v));
                        return (isFinite(v) && v > 0) ? v : 0;
                    }

                    var _tavernLevel = tavern ? _impLevel(tavern.getLevel()) : 0;
                    var _museumLevel = museum ? _impLevel(museum.getLevel()) : 0;

                    // Taverne : bonus du bâtiment + bonus du vin RÉELLEMENT servi
                    // (et non plus le bonus au niveau max de la taverne).
                    // Le niveau servi ne peut pas dépasser le niveau de la taverne.
                    var _wineServed = Math.min(_impLevel(this.getTavernWineLevel()), _tavernLevel);
                    happiness += _impBonus(Constants.BuildingData.tavern.satisfaction, _tavernLevel - 1);
                    happiness += _impBonus(Constants.BuildingData.tavern.maxBonus, _wineServed - 1);

                    // Musée : bonus du bâtiment + 50 par traité culturel.
                    // Chaque niveau de musée accueille 1 traité -> plafonné au niveau du musée.
                    var _culturalGoods = Math.min(_impLevel(this.getCulturalGoods()), _museumLevel);
                    happiness += _impBonus(Constants.BuildingData.museum.satisfaction, _museumLevel - 1);
                    happiness += _impBonus(Constants.BuildingData.museum.maxBonus, _culturalGoods - 1);

                    var government = civData.getGovernment();
                    if (government == Constants.Government.DEMOCRACY) {
                        happiness += 75;
                    } else if (government == Constants.Government.DICTATORSHIP) {
                        happiness -= 75;
                    } else if (government == Constants.Government.THEOCRACY) {
                        if (temple) {
                            happiness += Math.min(150, this.getPriests() * 5 / max * 100 * 2);
                        } else {
                            happiness -= 20;
                        }
                    }

                    happiness = happiness * (1 - this.getCorruption());

                    // v2.10/2.11 : priorite aux VRAIES valeurs lues a l'hotel de ville.
                    // - happinessScore = satisfaction libre reelle (surplus) -> croissance
                    // - _realMax = plafond de logement reel ; _realGrowth = croissance/h reelle
                    // L'estimation par batiments ne sert que de repli (ville jamais visitee),
                    // car elle ne colle plus a l'equilibrage du jeu 2026.
                    var effHappiness = happiness;
                    if (this.happinessScore != null && isFinite(this.happinessScore)) {
                        effHappiness = this.population + this.happinessScore;
                    }
                    var effMax = (this._realMax != null && isFinite(this._realMax) && this._realMax > 0)
                        ? this._realMax : max;

                    var happinessDelta = effHappiness - this.population;
                    var currentPopulation = this.population +
                        happinessDelta * (1 - Math.pow(Math.E,
                                                       -(this.getTimeSinceResourceUpdate() / 50 / Constants.Time.MILLIS_PER_HOUR)));

                    var population = (effMax > 0) ? Math.min(currentPopulation, effMax) : currentPopulation;

                    var growth;
                    if (effMax > 0 && population >= effMax) {
                        growth = 0;                                 // plafond atteint
                    } else if (this._realGrowth != null && isFinite(this._realGrowth)) {
                        growth = this._realGrowth;                  // vraie croissance du jeu
                    } else {
                        growth = (effHappiness - population) / 50;  // repli : surplus/50
                    }

                    return {
                        population: population,
                        max: effMax,
                        happiness: effHappiness - population,
                        growth: growth,
                    };
                },
                getCorruption: function getCorruption() {
                    var palace = this.getBuildingByType(Constants.Buildings.GOVERNORS_RESIDENCE) ||
                        this.getBuildingByType(Constants.Buildings.PALACE);
                    var level = palace ? palace.getLevel() : 0;
                    var corruption = 1 - (level + 1) / getOwnCities().length;

                    var government = getCivilizationData().getGovernment();
                    if (government == Constants.Government.ARISTOCRACY ||
                        government == Constants.Government.OLIGARCHY) {
                        corruption += .03;
                    } else if (government == Constants.Government.NOMOCRACY) {
                        corruption -= .05;
                    } else if (government == Constants.Government.ANARCHY) {
                        corruption += .25;
                    }

                    return Math.min(Math.max(corruption, 0), 1);
                },
                getScientists: function getScientists() {
                    return this.scientists;
                },
                getResearch: function getResearch() {
                    if (this.researchPerHour != null) return this.researchPerHour;
                    var civData = getCivilizationData();
                    var multiplier = 1.0;

                    multiplier += civData.hasResearched(
                        Constants.Research.Science.PAPER) ? .02 : 0;
                    multiplier += civData.hasResearched(
                        Constants.Research.Science.INK) ? .04 : 0;
                    multiplier += civData.hasResearched(
                        Constants.Research.Science.MECHANICAL_PEN) ? .08 : 0;
                    multiplier += (civData.getResearchLevel(
                        Constants.Research.Science.SCIENTIFIC_FUTURE) || 0) * .02;
                    multiplier -= this.getCorruption();

                    return this.scientists * multiplier;
                },

                getResource: function getResource(resourceName) {
                    return this.resources[resourceName];
                },
                // v2.24 : capacité réelle lue dans le jeu si elle est encore valable
                // (aucun entrepôt/dépôt n'a changé de niveau depuis la lecture), sinon formule.
                getResourceCapacity: function getResourceCapacity() {
                    var cap = this._formulaCapacity();
                    var real = this._realCapacity;
                    if (real != null && isFinite(real) && real > 0 &&
                        this._realCapacitySig === _impWarehouseSig(this)) {
                        cap.maximum = real;
                        cap.real = true;
                    } else {
                        cap.real = false;
                    }
                    return cap;
                },
                _formulaCapacity: function getResourceMaximumCapacity() {
                    var total = 1500;
                    var safe = 100;

                    $.each(this.getBuildingsByType(Constants.Buildings.WAREHOUSE), function(i, building) {
                        total += Constants.BuildingData.warehouse.capacity[building.getLevel()]//8000 * building.getLevel();
                        safe += 480 * building.getLevel();
                    });
                    $.each(this.getBuildingsByType(Constants.Buildings.DUMP), function(i, building) {
                        total += Constants.BuildingData.dump.capacity[building.getLevel()]//8000 * building.getLevel();
                    });

                    var civilizationData = getCivilizationData();
                    if (civilizationData.isPremiumFeatureEnabled(
                        Constants.PremiumFeatures.DOUBLED_STORAGE_CAPACITY)) {
                        total *= 2;
                    }
                    if (civilizationData.isPremiumFeatureEnabled(
                        Constants.PremiumFeatures.DOUBLED_SAFE_CAPACITY)) {
                        safe *= 2;
                    }

                    return {
                        maximum: total,
                        safe: safe,
                    };
                },
                getIslandCoordinates: function getIslandCoordinates() {
                    return this.islandCoordinates;
                },
                getLoadingSpeed: function getLoadingSpeed() {
                    var speed = 10;
                    var ports = this.getBuildingsByType(Constants.Buildings.TRADING_PORT);
                    if (ports[0]) {
                        speed = Constants.BuildingData[Constants.Buildings.TRADING_PORT]
                            .loadingSpeed[ports[0].getLevel()];
                    }
                    if (ports[1]) {
                        speed += Constants.BuildingData[Constants.Buildings.TRADING_PORT]
                            .loadingSpeed[ports[1].getLevel()];
                    }
                    return speed / Constants.Time.SECONDS_PER_MINUTE;
                },
                getPriests: function getPriests() {
                    return this.priests;
                },
            });

            City.Resource = function City_Resource(city) {
                this._ikaToolsType = 'cityResource';
                this._setCity(city);
            }

            $.extend(City.Resource.prototype, {
                _setCity: function setCity(city) {
                    if (city) {
                        this.city = Utils.fixedFunction(city);
                    }
                },
                _update: function _update(current, production, consumption) {
                    var changed =
                        Math.abs(current - this.getCurrent()) > 3 ||
                        this.production != production ||
                        this.consumption != consumption;

                    this.current = current;
                    this.production = production;
                    this.consumption = consumption;

                    return changed;
                },
                _increment: function _increment(delta) {
                    this.current = Math.max(this.current + delta, 0);
                },
                getCurrent: function getCurrent() {
                    if (this.current === undefined) {
                        return undefined;
                    }

                    var current = this.current;
                    var now = View.gameTimeNow();
                    var max = this.city().getResourceCapacity().maximum;
                    var lastUpdate = this.city().getLastResourceUpdate();

                    if (this.production) {
                        current += this.production * (now - lastUpdate) /
                            Constants.Time.MILLIS_PER_SECOND;
                    }
                    if (this.consumption) {

                        // Wine use takes place on the hour.
                        var startHour = Math.floor(lastUpdate / Constants.Time.MILLIS_PER_HOUR);
                        var nowHour = Math.floor(now / Constants.Time.MILLIS_PER_HOUR);
                        current -=

                            this.consumption * Constants.Time.SECONDS_PER_HOUR * (nowHour - startHour);
                    }
                    return Math.max(0, Math.min(max, current));
                },

                /**
           * In milliseconds.
           */
                getTimeUntilFull: function getTimeUntilFull() {
                    var overallProduction = (this.production || 0) - (this.consumption || 0);
                    if (this.current === undefined) {
                        return Number.POSITIVE_INFINITY;
                    } else {
                        var current = this.getCurrent();
                        var max = this.city().getResourceCapacity().maximum;
                        var production = this.production;

                        if (overallProduction > 0) {
                            var secondsToNextHour = (Constants.Time.MILLIS_PER_HOUR -
                                                     (View.gameTimeNow() % Constants.Time.MILLIS_PER_HOUR)) /
                                Constants.Time.MILLIS_PER_SECOND;
                            var atNextHour = current + secondsToNextHour * production;

                            if (atNextHour >= max) {
                                return (max - current) / production * Constants.Time.MILLIS_PER_SECOND;
                            } else {
                                var hours = Math.floor(
                                    (max - atNextHour) / overallProduction / Constants.Time.SECONDS_PER_HOUR);
                                var atHours = atNextHour + overallProduction * hours * Constants.Time.SECONDS_PER_HOUR;
                                return (secondsToNextHour +
                                        hours * Constants.Time.SECONDS_PER_HOUR +
                                        (max - atHours) / production) * Constants.Time.MILLIS_PER_SECOND;
                            }
                        } else if (this.current && this.getCurrent() == max) {
                            // No production, but filled exactly to capacity
                            return 0;
                        } else {
                            return Number.POSITIVE_INFINITY;
                        }
                    }
                },

                /**
           * In milliseconds.
           */
                getTimeUntilEmpty: function getTimeUntilEmpty() {
                    if (this.current === undefined) {
                        return Number.POSITIVE_INFINITY;
                    } else if (this.consumption) {
                        if (this.production > this.consumption) {
                            // Could run out in first hour, but nobody is going to run their empire that
                            // way so it's not worth the effort of calculating.
                            return Number.POSITIVE_INFINITY;
                        } else {
                            // Wine use takes place on the hour.
                            var current = this.getCurrent();
                            var production = this.production || 0;

                            var secondsToNextHour = (Constants.Time.MILLIS_PER_HOUR -
                                                     (View.gameTimeNow() % Constants.Time.MILLIS_PER_HOUR)) /
                                Constants.Time.MILLIS_PER_SECOND;
                            // Compute to end of next hour
                            var atNextHour = current - this.consumption * Constants.Time.SECONDS_PER_HOUR +
                                production * secondsToNextHour;
                            if (atNextHour <= 0) {
                                return secondsToNextHour * Constants.Time.MILLIS_PER_SECOND;
                            } else {
                                var hourlyDiff =
                                    (this.consumption - production) * Constants.Time.SECONDS_PER_HOUR;
                                return Constants.Time.MILLIS_PER_SECOND * (secondsToNextHour +
                                                                           Math.ceil(atNextHour / hourlyDiff) * Constants.Time.SECONDS_PER_HOUR);
                            }
                        }
                    }
                    return Number.POSITIVE_INFINITY;
                },

                getCapacity: function getCapacity() {
                    return this.city().getResourceCapacity();
                },

                getProduction: function getProduction() {
                    return this.production;
                },

                getConsumption: function getConsumption() {
                    return this.consumption;
                },
            });


            // lignes 3785 TOOLS
            City.Building = function City_Building(city) {
                this._ikaToolsType = 'building';
                this._setCity(city);

                this.position = null;
                this.type = null;
                this.level = 0;
            }

            $.extend(City.Building.prototype, {
                _setCity: function setCity(city) {
                    if (city) {
                        this.city = Utils.fixedFunction(city);
                        this._scheduleUpgradeComplete();
                    }
                },
                _update: function _update(position, data) {
                    this.position = position;
                    var changed = false;

                    if (data.building.indexOf('buildingGround') >= 0) {
                        changed = !this.isEmpty();

                        this.type = '';
                        delete this.level;
                        delete this.completionTime;
                    } else {
                        var type = data.building.split(' ')[0];
                        var level = parseInt(data.level);
                        var isUpgrading = 'completed' in data;

                        changed = (type != this.getType() ||
                                   level != this.getLevel() ||
                                   isUpgrading != this.isUpgrading());

                        this.type = type;
                        this.level = level;
                        if (isUpgrading) {
                            var completionTime = parseInt(data.completed) * 1000;
                            if (this.completionTime != completionTime) {
                                this.completionTime = completionTime;
                                this._scheduleUpgradeComplete();
                            }
                        } else {
                            delete this.completionTime;
                        }
                    }

                    return changed;
                },
                _scheduleUpgradeComplete: function _scheduleUpgradeComplete() {
                    if (this.upgradeEvent) {
                        this.upgradeEvent();
                    }
                    if (this.completionTime) {
                        if (this.completionTime <= View.gameTimeNow()) {
                            this.level = this.level + 1;
                            delete this.completionTime;
                            raiseBuildingsChanged([{
                                city: this.city(),
                                building: this,
                                type: Constants.BuildingEventType.UPGRADE_COMPLETE,
                            }]);
                        } else {
                            this.upgradeEvent = buildingsChangedEvent().scheduleSend(
                                this.type + "->" + (this.level + 1),
                                // 0.5.0 still does a full page refresh if you're viewing the city when the
                                // building completes.  So we cheat a bit and send this event a few seconds
                                // before it actually takes place so it doesn't get lost as part of a page
                                // refresh that just sees it as a normal "info_refresh" event.
                                this.completionTime - View.gameTimeNow() + Constants.Time.SAFE_TIME_DELTA,
                                function() {
                                    this.level = this.level + 1;
                                    delete this.completionTime;
                                    empireData.saveAsync();
                                }.bind(this),
                                [{
                                    city: this.city(),
                                    building: this,
                                    type: Constants.BuildingEventType.UPGRADE_COMPLETE,
                                }]);
                        }
                    }
                },
                getPosition: function getPosition() {
                    return this.position;
                },
                isEmpty: function isEmpty() {
                    return !this.type;
                },
                getType: function getType() {
                    return this.type;
                },
                getLevel: function getLevel() {
                    return this.level;
                },
                isUpgrading: function isUpgrading() {
                    return (this.completionTime > View.gameTimeNow());
                },
                getRemainingUpgradeTime: function getRemainingUpgradeTime() {
                    var diff = this.completionTime - View.gameTimeNow();
                    return Math.max(diff, 0);
                },
                getCompletionTime: function getCompletionTime() {
                    return new Date(this.completionTime);
                },


                getUpgradeCosts: function getUpgradeCost() {

                    var city = this.city();
                    var civData = getCivilizationData();
                    var buildingCostData = Constants.BuildingData[this.getType()];

                    // v2.07 : préférer le VRAI coût capté depuis le jeu (panneau d'agrandissement).
                    // Valable uniquement si le bâtiment n'est pas en cours d'agrandissement et que
                    // le niveau capté correspond au niveau actuel (sinon le cache est périmé).
                    if (this.realUpgradeCost && !this.isUpgrading() &&
                        this.realUpgradeCost.forLevel === this.getLevel()) {
                        var rc = this.realUpgradeCost;
                        return {
                            wood: rc.wood, wine: rc.wine, marble: rc.marble,
                            glass: rc.glass, sulfur: rc.sulfur, time: rc.time, _real: true
                        };
                    }

                    // Patch Sécuriser getUpgradeCosts
                    // Si on n'a pas de données de coût (nouveau bâtiment inconnu), on renvoie 0 partout.
                    if (!buildingCostData) {
                        return {
                            wood: 0, wine: 0, marble: 0, glass: 0, sulfur: 0, time: 0, _real: false
                        };
                    }
                    // fin patch Sécuriser getUpgradeCosts

                    var level = this.getLevel() + (this.isUpgrading() ? 1 : 0);

                    var timeParams = buildingCostData.time;
                    // v2.31 : coûts exacts lus dans l'aide du jeu (niveau à construire = level + 1)
                    var help = getHelpCost(this.getType(), level + 1);
                    var costs = help ? {
                        wood: help.wood, wine: help.wine, marble: help.marble,
                        glass: help.glass, sulfur: help.sulfur,
                        time: Math.round(timeParams.a / timeParams.b *
                                         Math.pow(timeParams.c, level+1) - timeParams.d) * 1000,
                    } : {
                        wood: buildingCostData.wood[level] || 0,
                        wine: buildingCostData.wine[level] || 0,
                        marble: buildingCostData.marble[level] || 0,
                        glass: buildingCostData.glass[level] || 0,
                        sulfur: buildingCostData.sulfur[level] || 0,
                        time: Math.round(timeParams.a / timeParams.b *
                                         Math.pow(timeParams.c, level+1) - timeParams.d) * 1000,
                    };

                    var multiplier = 1.0;
                    multiplier -= civData.hasResearched(Constants.Research.Economy.PULLEY) ? .02 : 0;
                    multiplier -= civData.hasResearched(Constants.Research.Economy.GEOMETRY) ? .04 : 0;
                    multiplier -= civData.hasResearched(Constants.Research.Economy.SPIRIT_LEVEL) ? .08 : 0;

                    var carpenter = city.getBuildingByType(Constants.Buildings.CARPENTER);
                    var winePress = city.getBuildingByType(Constants.Buildings.WINE_PRESS);
                    var architect = city.getBuildingByType(Constants.Buildings.ARCHITECT);
                    var optician = city.getBuildingByType(Constants.Buildings.OPTICIAN);
                    var fireworker = city.getBuildingByType(Constants.Buildings.FIREWORK_TEST_AREA);


                    return {
                        wood: costs.wood * Math.max(0, (multiplier - (carpenter ? carpenter.getLevel() / 100 : 0))),
                        wine: costs.wine * Math.max(0, (multiplier - (winePress ? winePress.getLevel() / 100 : 0))),
                        marble: costs.marble * Math.max(0, (multiplier - (architect ? architect.getLevel() / 100 : 0))),
                        glass: costs.glass * Math.max(0, (multiplier - (optician ? optician.getLevel() / 100 : 0))),
                        sulfur: costs.sulfur * Math.max(0, (multiplier - (fireworker ? fireworker.getLevel() / 100 : 0))),
                        time: costs.time,
                        _real: false,
                        _help: !!help, // v2.31
                    };
                },

                // Patch Rendre isMaxLevel safe

                isMaxLevel: function isMaxLevel() {
                    var type = this.getType();
                    var data = type && Constants.BuildingData[type];

                    // Si Imperator ne connaît pas ce bâtiment (ex: nouveau type, case vide, etc.),
                    // on considère juste qu'il n'est pas au niveau max.
                    // v2.20 : les tables écrivent "maxlevel" (minuscules) ; on accepte les deux.
                    var maxLevel = data ? (data.maxlevel != null ? data.maxlevel : data.maxLevel) : undefined;
                    if (!data || maxLevel == null || !isFinite(maxLevel)) {
                        return false;
                    }
                    // Le jeu a proposé un agrandissement pour ce niveau : ce n'est pas le max,
                    // même si notre table est en retard sur le jeu.
                    if (this.realUpgradeCost && this.realUpgradeCost.forLevel === this.getLevel() && !this.isUpgrading()) {
                        return false;
                    }
                    // v2.31 : l'aide du jeu connaît le niveau suivant : ce n'est pas le max.
                    if (getHelpCost(type, this.getLevel() + (this.isUpgrading() ? 1 : 0) + 1)) {
                        return false;
                    }

                    return (this.getLevel() + (this.isUpgrading() ? 1 : 0)) >= maxLevel;
                },


                // fin Patch Rendre isMaxLevel safe

            });

            _impTypes.city = City;
            _impTypes.building = City.Building;
            _impTypes.cityResource = City.Resource;

            var CivilizationData = function CivilizationData() {
                this._ikaToolsType = 'civilizationData';

                this.research = {};
                this.government = 'ikakratie';
                this.movements = {};
                this.premiumFeatures = {};
                this.goldData = {
                    current:0, revenue:0, gods:0, scientists:0,
                    upkeep:0, premium:0, net:0,
                    currentUpdated:0, incomeUpdated:0
                };
                // v2.07 : données du Sanctuaire divin (faveur totale + horodatage).
                // Les affectations dieu<->ville sont stockées sur chaque objet City
                // (city.worshipGodId / city.worshipGodName), qui persistent via le reviver.
                this.shrineData = { favor: 0, updated: 0 };
            }

            $.extend(CivilizationData.prototype, {
                _startMovementTimers: function _startMovementTimers() {
                    $.each(this.movements, function updateMovementsOnLoad(id, movement) {
                        if (movement._updateAndStartTimer()) {
                            delete this.movements[id];
                        }
                    }.bind(this));
                    this._purgeStaleMovements(); // v2.16
                },
                // v2.16 : retire un mouvement SANS effet de bord (pas de re-crédit d'unités ni de ressources)
                _dropMovement: function dropMovement(movementId, changedAccumulator) {
                    var movement = this.movements[movementId];
                    if (!movement) return;
                    try { movement._cancelTimer(); } catch (e) {}
                    delete this.movements[movementId];
                    if (changedAccumulator) {
                        changedAccumulator.push({
                            movement: movement,
                            type: Constants.Movements.EventType.CANCELLED,
                        });
                    }
                },
                // v2.16 : purge des mouvements périmés (reliquats). Silencieuse : appelée aussi
                // pendant un rendu, elle ne déclenche pas d'événement (évite un redessin en boucle).
                _purgeStaleMovements: function purgeStaleMovements() {
                    var now = View.gameTimeNow(), stale = [];
                    $.each(this.movements, function(id, mv) {
                        try { if (!mv || !mv._isStale || mv._isStale(now)) stale.push(id); }
                        catch (e) { stale.push(id); }
                    });
                    if (!stale.length) return 0;
                    for (var i = 0; i < stale.length; i++) this._dropMovement(stale[i], null);
                    console.log('[Imperator] ' + stale.length + ' mouvement(s) périmé(s) retiré(s)');
                    empireData.saveAsync();
                    return stale.length;
                },
                _updateGovernment: function updateGovernment(government, changedAccumulator) {
                    if (this.government != government) {
                        changedAccumulator.push({
                            type: Constants.CivilizationData.GOVERNMENT,
                            government: government,
                        });

                    }
                    this.government = government;
                },
                _updateResearch: function updateResearch(researchId, level, changedAccumulator) {
                    var oldResearch = this.research[researchId];
                    if (!oldResearch || oldResearch.level != level) {
                        changedAccumulator.push({
                            type: Constants.CivilizationData.RESEARCH,
                            id: researchId,
                            level: level,
                        });
                    }
                    this.research[researchId] = { level: level };
                },
                _updateMovement: function updateMovement(movement, changedAccumulator) {
                    var existing = this.movements[movement.getId()];
                    if (existing) {
                        existing._cancelTimer();
                    }
                    this.movements[movement.getId()] = movement;
                    movement._updateAndStartTimer();
                    if (!existing || (movement.getCompletionTime() != existing.getCompletionTime())) {
                        changedAccumulator.push({
                            movement: movement,
                            type: Constants.Movements.EventType.DATA_UPDATED,
                        });
                    }
                },
                _removeMovement: function removeMovement(movementId, changedAccumulator) {
                    var movement = this.movements[movementId];
                    if (movement) {
                        if (movement.stage == Constants.Movements.Stage.LOADING && movementId >= 0) {
                            var originCity = movement.getOriginCity();
                            movement._updateCity(originCity, originCity);
                        }
                        movement._cancelTimer();
                        delete this.movements[movementId];
                        changedAccumulator.push({
                            movement: movement,
                            type: Constants.Movements.EventType.CANCELLED,
                        });
                    }
                },
                _updatePremiumFeature: function updatePremiumFeature(
                changedAccumulator, feature, enabled) {
                    var currentlyEnabled = this.premiumFeatures[feature] || false;
                    if (currentlyEnabled != enabled) {
                        changedAccumulator.push({
                            type: Constants.CivilizationData.PREMIUM_FEATURE,
                            feature: feature,
                            enabled: enabled,
                        });
                    }
                    this.premiumFeatures[feature] = enabled;
                },
                hasResearched: function hasResearched(researchId) {
                    var research = this.research[researchId];
                    return research ? research.level > 0 : undefined;
                },
                getResearchLevel: function getResearchLevel(researchId) {
                    var research = this.research[researchId];
                    return research ? research.level : undefined;
                },
                getGovernment: function getGovernment() {
                    return this.government;
                },
                getMovements: function getMovements() {
                    this._purgeStaleMovements(); // v2.16
                    var movements = [];
                    $.each(this.movements, function(id, movement) {
                        movements.push(movement);
                    });
                    movements.sort(function compareMovements(m1, m2) {
                        return m1.getArrivalTime() - m2.getArrivalTime();
                    });
                    return movements;
                },
                getMovement: function getMovement(movementId) {
                    return this.movements[movementId];
                },
                isPremiumFeatureEnabled: function isPremiumFeatureEnabled(feature) {
                    return this.premiumFeatures[feature];
                },
                getGoldData: function getGoldData() {
                    if (!this.goldData) this.goldData = {current:0,revenue:0,gods:0,scientists:0,upkeep:0,premium:0,net:0,currentUpdated:0,incomeUpdated:0};
                    return this.goldData;
                },
                _updateGoldData: function _updateGoldData(upd) {
                    var gd = this.getGoldData();
                    if (upd.current    !== undefined) gd.current    = upd.current;
                    if (upd.revenue    !== undefined) gd.revenue    = upd.revenue;
                    if (upd.gods       !== undefined) gd.gods       = upd.gods;
                    if (upd.scientists !== undefined) gd.scientists = upd.scientists;
                    if (upd.upkeep     !== undefined) gd.upkeep     = upd.upkeep;
                    if (upd.premium    !== undefined) gd.premium    = upd.premium;
                    if (upd.net        !== undefined) gd.net        = upd.net;
                    if (upd.currentUpdated !== undefined) gd.currentUpdated = upd.currentUpdated;
                    if (upd.incomeUpdated  !== undefined) gd.incomeUpdated  = upd.incomeUpdated;
                    // Recalculer net si non fourni mais composants disponibles
                    if (upd.net === undefined && gd.incomeUpdated > 0) {
                        gd.net = (gd.revenue||0)+(gd.gods||0)+(gd.scientists||0)+(gd.upkeep||0)+(gd.premium||0);
                    }
                },
                // v3.5 : données lues dans une académie (valables pour tout l'empire) : coût d'un
                // chercheur pour la ville (impôt perdu + entretien), parchemin d'Athéna.
                getAcademyData: function getAcademyData() {
                    if (!this.academyData) this.academyData = { costPerScientist: 0, hasAthenaScroll: null,
                                                                isAthenaScrollActive: null, updated: 0 };
                    return this.academyData;
                },
                _updateAcademyData: function _updateAcademyData(upd) {
                    $.extend(this.getAcademyData(), upd, { updated: Date.now() });
                },
                // v3.6 : conseiller en recherches : points accumulés, points/h, coût de la prochaine
                // recherche de chaque domaine ({ name, cost }, cost 0 = maximum atteint).
                getResearchAdvisorData: function getResearchAdvisorData() {
                    if (!this.researchAdvisorData) this.researchAdvisorData = { points: 0, perHour: 0, domains: [], updated: 0 };
                    return this.researchAdvisorData;
                },
                _updateResearchAdvisorData: function _updateResearchAdvisorData(upd) {
                    $.extend(this.getResearchAdvisorData(), upd);
                },
                // v2.07 : accès aux données Sanctuaire
                getShrineData: function getShrineData() {
                    if (!this.shrineData) this.shrineData = { favor: 0, updated: 0 };
                    return this.shrineData;
                },
                _updateShrineData: function _updateShrineData(upd) {
                    var sd = this.getShrineData();
                    if (upd.favor   !== undefined) sd.favor   = upd.favor;
                    if (upd.updated !== undefined) sd.updated = upd.updated;
                    // v2.12 : bienveillance par dieu { godId: {name, graceEnd, graceText, updated} }
                    if (upd.gods        !== undefined) sd.gods        = upd.gods;
                    if (upd.godsUpdated !== undefined) sd.godsUpdated = upd.godsUpdated;
                },
            });

            function calculateTravelTime(island1Coords, island2Coords, units, transporters) {
                // same island
                if (island1Coords[0] == island2Coords[0] &&
                    island1Coords[1] == island2Coords[1]) {
                    var baseTime = 10 * Constants.Time.MILLIS_PER_MINUTE;
                    var multiplier = transporters ? 60 : 80; // fastest unit
                    if (units) {
                        $.each(units.getCounts(), function applyUnitSpeed(type, count) {
                            if (count) {
                                var data = Constants.UnitData[type];
                                multiplier = Math.min(multiplier, data.speed);
                            }
                        });
                    }
                    return baseTime * 60 / multiplier;
                } else {
                    baseTime = 20 * Math.sqrt(Math.pow(island1Coords[0] - island2Coords[0], 2) +
                                              Math.pow(island1Coords[1] - island2Coords[1], 2)) *
                        Constants.Time.MILLIS_PER_MINUTE;
                    multiplier = 60; // fastest ship
                    if (units) {
                        $.each(units.getCounts(), function applyUnitSpeed(type, count) {
                            if (count) {
                                var data = Constants.UnitData[type];
                                if (!data.isArmy) {
                                    multiplier = Math.min(multiplier, data.speed);
                                }
                            }
                        });
                    }
                    return baseTime * 60 / multiplier;
                }
            }

            function Movement(
            id, type, completionTime, mission, stage, originCityId, targetCityId,
             transports, units, resources, transportTime) {
                this._ikaToolsType = 'movement';

                if (id) {
                    this.id = id;
                    this.completionTime = completionTime;
                    this.mission = mission;
                    this.stage = stage;
                    this.originCityId = originCityId;
                    this.targetCityId = targetCityId;
                    this.units = units;
                    this.transports = transports;
                    this.resources = resources;

                    this.transportTime = transportTime;

                    this.type = type;

                    var originCity = this.getOriginCity();
                    var targetCity = this.getTargetCity();

                    if (originCity && targetCity) {
                        var originCoords = originCity.getIslandCoordinates();
                        var targetCoords = targetCity.getIslandCoordinates();

                        if (originCoords && targetCoords) {
                            this.transportTime = calculateTravelTime(
                                originCoords, targetCoords, this.units, this.transports);
                        }
                    }

                    if (!this.transportTime) {
                        this.transportTime = Number.POSITIVE_INFINITY;
                    }

                    if (this.completionTime <= new Date().getTime()) {
                        this._toNextStage();
                    }
                }
            }

            $.extend(Movement.prototype, {
                _cancelTimer: function cancelTimer() {
                    if (this.completionEvent) {
                        this.completionEvent();
                    }
                },
                _startTimer: function startTimer() {
                    var remainingTime = this.getTimeRemaining();
                    if (isFinite(remainingTime)) {
                        this.completionEvent = movementsChangedEvent().scheduleSend(
                            'Movement[' + this.id + ']',
                            remainingTime + Constants.Time.SAFE_TIME_DELTA,
                            function moveToNextStage() {
                                if (this._toNextStage()) {
                                    getCivilizationData()._removeMovement(this.id, []);
                                }
                                empireData.saveAsync();
                            }.bind(this),
                            [{
                                previousStage: this.getStage(),
                                movement: this,
                                type: this._isFinalStage() ?
                                Constants.Movements.EventType.COMPLETED :
                                Constants.Movements.EventType.STAGE_CHANGED,
                            }]);
                    }
                },
                _updateCity: function updateCity(city, originCity) {
                    var resourceChanges = [];
                    if (city) {
                        if (originCity) {
                            originCity._updateActionPointsBy(1, resourceChanges);
                        }
                        if (city.isOwn() &&
                            (this.mission == Constants.Movements.Mission.TRANSPORT ||
                             this.mission == Constants.Movements.Mission.PLUNDER)) {
                            $.each(this.resources, function updateCityResource(name, value) {
                                city._incrementResource(name, resourceChanges, value);
                            });
                        }
                        raiseResourcesChanged(resourceChanges);

                        if (this.mission == Constants.Movements.Mission.DEPLOY_ARMY ||
                            this.mission == Constants.Movements.Mission.DEPLOY_NAVY) {
                            var military = city.getMilitary();
                            military._increment(this.units);
                            raiseMilitaryChanged([{
                                military: military,
                                city: city,
                                type: 'deployment_arrived',
                            }]);
                        } else if (this.mission == Constants.Movements.Mission.PLUNDER &&
                                   this.stage == Constants.Movements.Stage.RETURNING &&
                                   city.isOwn() && this.units) {
                            // v2.25 : les troupes d'un pillage reviennent dans leur ville
                            var plMilitary = city.getMilitary();
                            plMilitary._increment(this.units);
                            raiseMilitaryChanged([{
                                military: plMilitary,
                                city: city,
                                type: 'plunder_returned',
                            }]);
                            console.log('[Imperator] Retour de pillage (' + city.getName() + ') : troupes recréditées', this.units.getCounts());
                        }
                    }
                },
                _updateAndStartTimer: function updateAndStartTimer() {
                    this._cancelTimer();
                    // v2.32 : durée du trajet inconnue : on attend l'heure réelle du Conseiller militaire
                    if (this._etaUnknown) return false;

                    if (this.completionTime <= View.gameTimeNow()) {
                        return this._toNextStage();
                    } else {
                        this._startTimer();
                    }
                },
                _toNextStage: function toNextStage() {
                    var isFinalStage = this._isFinalStage();
                    if (this.stage == Constants.Movements.Stage.LOADING) {
                        this.stage = Constants.Movements.Stage.EN_ROUTE;
                        // v2.16 : Infinity devenait null à la sauvegarde JSON -> mouvement fantôme.
                        // Trajet inconnu (cible hors empire) : on garde la fin de chargement, la purge
                        // retirera l'estimation ; le conseiller militaire donne le vrai horaire.
                        // v2.32 : une durée nulle (transport lu en chargement dans le Conseiller) est
                        // aussi inconnue : sinon la cargaison était créditée dès la fin du chargement.
                        if (this._hasTransportTime()) {
                            this.completionTime += this.transportTime;
                            this._startTimer();
                        } else {
                            this._etaUnknown = true; // pas de minuterie : rien n'est crédité à l'aveugle
                            console.log('[Imperator] Mouvement ' + this.id + ' : chargement terminé, heure ' +
                                        'd\'arrivée en attente du Conseiller militaire');
                        }
                    } else if (this.stage == Constants.Movements.Stage.EN_ROUTE) {
                        if (isFinalStage) {
                            this._updateCity(this.getTargetCity(), this.getOriginCity());
                        }
                    } else if (this.stage == Constants.Movements.Stage.RETURNING) {
                        if (isFinalStage) {
                            var originCity = this.getOriginCity();
                            this._updateCity(originCity, originCity);
                        }
                    }
                    return isFinalStage;
                },
                _isFinalStage: function isFinalStage() {
                    if (this.stage == Constants.Movements.Stage.LOADING) {
                        return false;
                    } else if (this.stage == Constants.Movements.Stage.EN_ROUTE) {
                        if (this.mission == Constants.Movements.Mission.TRANSPORT) {
                            var city = getCity(this.targetCityId);
                            return city && city.isOwn();
                        } else if (this.mission == Constants.Movements.Mission.DEPLOY_ARMY ||
                                   this.mission == Constants.Movements.Mission.DEPLOY_NAVY) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                },
                // v2.16 : mouvement périmé = date illisible, ou arrivée dépassée de plus de 10 min
                _isStale: function isStale(now) {
                    var t = this.completionTime;
                    if (t === null || t === undefined || typeof t !== 'number' || !isFinite(t)) return true;
                    if (this.stage == Constants.Movements.Stage.LOADING) return false; // passera EN_ROUTE
                    // v2.32 : arrivée inconnue : gardé 24 h (le Conseiller militaire donnera l'heure réelle)
                    if (this._etaUnknown) return t + 24 * 60 * Constants.Time.MILLIS_PER_MINUTE < (now || View.gameTimeNow());
                    return t + 10 * Constants.Time.MILLIS_PER_MINUTE < (now || View.gameTimeNow());
                },
                getId: function getId() {
                    return this.id;
                },
                getMission: function getMission() {
                    return this.mission;
                },
                getStage: function getStage() {
                    return this.stage;
                },
                getOriginCityId: function getOriginCityId() {
                    return this.originCityId;
                },
                getTargetCityId: function getTargetCityId() {
                    return this.targetCityId;
                },
                getOriginCity: function getOriginCity() {
                    return this.originCityId && getCity(this.originCityId);
                },
                getTargetCity: function getTargetCity() {
                    return this.targetCityId && getCity(this.targetCityId);
                },
                getCompletionTime: function getCompletionTime() {
                    return this.completionTime;
                },
                getTimeRemaining: function getTimeRemaining() {
                    return this.completionTime - View.gameTimeNow();
                },
                getArrivalTime: function() {
                    var time = this.getCompletionTime();
                    if (this.stage == Constants.Movements.Stage.LOADING && this._hasTransportTime()) {
                        time += this.transportTime;
                    }
                    return time;
                },
                // v2.32 : durée de trajet connue (nombre > 0 ; 0, null, NaN = inconnue)
                _hasTransportTime: function hasTransportTime() {
                    return typeof this.transportTime === 'number' && isFinite(this.transportTime) && this.transportTime > 0;
                },
                // v2.32 : heure d'arrivée inconnue (en chargement sans trajet, ou chargement terminé)
                isEtaUnknown: function isEtaUnknown() {
                    return !!this._etaUnknown ||
                        (this.stage == Constants.Movements.Stage.LOADING && !this._hasTransportTime());
                },
                getUnits: function getUnits() {
                    return this.units;
                },
                getResource: function getResource(resourceName) {
                    return this.resources[resourceName];
                },
                isHostile: function isHostile() {
                    return this.type.indexOf('hostile') >= 0;
                },
                isOwn: function isOwn() {
                    return this.type.indexOf('own') >= 0;
                }
            });

            _impTypes.civilizationData = CivilizationData;
            _impTypes.movement = Movement;

            // v2.38 : magasin de l'empire (données sauvegardées) et accès en lecture.
            // Les parseurs et le modèle passent par ici au lieu d'aller chercher dans 04-suivi.

            var empireData = new Data.Value(
                'empireData',

                {
                    cities: {},
                    cityOrder: [],
                    civilizationData: new _impTypes.civilizationData(),
                },
                {
                    reviver: function empireDataReviver(key, value) {
                        if (value && value._ikaToolsType) {
                            // v2.38 : type retrouvé dans le registre (00-types)
                            var Type = _impTypes[value._ikaToolsType];
                            var obj = Type ? new Type() : undefined;
                            $.extend(obj, value);
                            if (obj._postLoad) {
                                obj._postLoad();
                            }
                            return obj;
                        }
                        return value;
                    },
                    version: 28,
                    loadCallback: function empireDataLoaded() {
                        getCivilizationData()._startMovementTimers();
                    },
                });

            var TRADE_GOOD_LOOKUP = {
                "1": Constants.Resources.WINE,
                "2": Constants.Resources.MARBLE,
                "3": Constants.Resources.GLASS,
                "4": Constants.Resources.SULFUR,
            };

            function getCity(id) {
                return empireData.get().cities[id];
            };
            View.setCityLookup(getCity); // v2.39 : la ville active est retrouvée ici

            var coordsRegex = /\[(\d+):(\d+)\]/;
            function parseCoordinates(coords) {
                var match = coords.match(coordsRegex);
                return [parseInt(match[1]), parseInt(match[2])];
            }

            function getCities() {
                var data = empireData.get();
                var cities = [];
                for (var i = 0; i < data.cityOrder.length; i++) {
                    cities.push(data.cities[data.cityOrder[i]]);
                }
                return cities;
            }

            function getOwnCities() {
                return getCities().filter(function(city) {
                    return city.isOwn();
                });
            }

            function getCivilizationData() {
                return empireData.get().civilizationData;
            }

            // Événements de l'empire (abonnements et annonces), sans dépendance au modèle.
            function raiseCivilizationDataChanged(changes) {
                if (changes.length) {
                    civilizationDataChangedEvent().send(changes);
                }
            }

            var civilizationDataChangedEvent = Utils.thunk(function() {
                return new Utils.EventDispatcher();
            });

            function registerCivilizationDataChangedHandler(callback) {
                return civilizationDataChangedEvent().addListener(callback);
            }

            function raiseMovementsChanged(changes) {
                if (changes.length) {
                    movementsChangedEvent().send(changes);
                }
            }

            var movementsChangedEvent = Utils.thunk(function() {
                return new Utils.EventDispatcher();
            });

            function registerMovementsChangedHandler(callback) {
                return movementsChangedEvent().addListener(callback);
            }

            function raiseResourcesChanged(changes) {
                if (changes.length) {
                    resourcesChangedEvent().send(changes);
                }
            }

            var resourcesChangedEvent = Utils.thunk(function() {
                return new Utils.EventDispatcher();
            });

            function registerResourcesChangedHandler(callback) {
                return resourcesChangedEvent().addListener(callback);
            }

            var buildingsChangedEvent = Utils.thunk(function() {
                var dispatcher = new Utils.EventDispatcher();
                return dispatcher;
            });

            function raiseBuildingsChanged(changes) {
                if (changes.length) {
                    buildingsChangedEvent().send(changes);
                }
            }

            function registerBuildingsChangedHandler(callback) {
                return buildingsChangedEvent().addListener(callback);
            }

            var militaryChangedEvent = Utils.thunk(function() {
                var dispatcher = new Utils.EventDispatcher();
                return dispatcher;
            });

            function raiseMilitaryChanged(changes) {
                if (changes.length) {
                    militaryChangedEvent().send(changes);
                }
            }

            function registerMilitaryChangedHandler(callback) {
                return militaryChangedEvent().addListener(callback);
            };

            // Gold event
            var goldChangedEvent = Utils.thunk(function() { return new Utils.EventDispatcher(); });
            function raiseGoldChanged() { goldChangedEvent().send(); }
            function registerGoldChangedHandler(callback) { return goldChangedEvent().addListener(callback); }

            // v2.12 : Sanctuaire divin (affectations / bienveillances) mis à jour
            var shrineChangedEvent = Utils.thunk(function() { return new Utils.EventDispatcher(); });
            function raiseShrineChanged() { shrineChangedEvent().send(); }
            function registerShrineChangedHandler(callback) { return shrineChangedEvent().addListener(callback); }



            function processTransportForm(form) {
                var city = View.getCurrentCity();

                var transports = parseInt($('#transporterCount').val()) || 0;
                var resources = {};
                resources[Constants.Resources.WOOD] =
                    parseInt($('#textfield_wood').val()) || 0;
                resources[Constants.Resources.WINE] =
                    parseInt($('#textfield_wine').val()) || 0;
                resources[Constants.Resources.MARBLE] =
                    parseInt($('#textfield_marble').val()) || 0;
                resources[Constants.Resources.GLASS] =
                    parseInt($('#textfield_glass').val()) || 0;
                resources[Constants.Resources.SULFUR] =
                    parseInt($('#textfield_sulfur').val()) || 0;
                if ($('#createColony').length) {
                    resources[Constants.Resources.WOOD] += 1250;
                }

                var destinationCityId = parseInt($(form.elements['destinationCityId']).val());

                var totalResources =
                    resources[Constants.Resources.WOOD] +
                    resources[Constants.Resources.WINE] +
                    resources[Constants.Resources.MARBLE] +
                    resources[Constants.Resources.GLASS] +
                    resources[Constants.Resources.SULFUR];

                var loadingCompletion = View.gameTimeNow() +
                    (totalResources / city.getLoadingSpeed() * Constants.Time.MILLIS_PER_SECOND);

                var movement = new Movement(
                    -(new Date().getTime()),
                    'own',
                    loadingCompletion, //TODO: multiple loads from same town (if own) stack
                    Constants.Movements.Mission.TRANSPORT,
                    Constants.Movements.Stage.LOADING,
                    city.getId(),
                    destinationCityId,
                    transports,
                    new MilitaryUnits(),
                    resources
                    // TODO: transport time for towns other than one's that are tracked
                );

                View.registerNextIkariamAjaxRequestCallback(function saveTransportData(response) {
                    Utils.iterateIkariamAjaxResponse(response,
                                                     function lookForSuccessFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                            data[0].type == 10) {
                            var changes = [];
                            getCivilizationData()._updateMovement(movement, changes);
                            raiseMovementsChanged(changes);
                        }
                    });
                });
            }

            function coordinatesEqual(coordinates1, coordinates2) {
                if (!coordinates1 || !coordinates2) {
                    return false;
                }
                return coordinates1[0] == coordinates2[0] &&
                    coordinates1[1] == coordinates2[1];
            }

            function processDeploymentForm(form) {
                var city = View.getCurrentCity();

                var transports = parseInt($('#transporterCount').html()) || 0;
                var mission = $(form.elements['function']).val() == 'deployArmy' ?
                    Constants.Movements.Mission.DEPLOY_ARMY : Constants.Movements.Mission.DEPLOY_NAVY;
                var destinationCityId = parseInt($(form.elements['destinationCityId']).val());
                var destinationCity = getCity(destinationCityId);

                var units = new MilitaryUnits();

                $.each(Constants.UnitIds, function countDeployingUnits(id, type) {
                    var elementId;
                    if (Constants.UnitData[type].isArmy) {
                        elementId = '#cargo_army_' + id;
                    } else {
                        elementId = '#cargo_fleet_' + id;
                    }
                    units._setCount(type, parseInt($(elementId).val()) || 0);
                });

                var cargoSize = units.getCargoSize();
                var loadingCompletion = new Date().getTime() +
                    (units.getCargoSize() / city.getLoadingSpeed() * Constants.Time.MILLIS_PER_SECOND);

                if (destinationCity &&
                    coordinatesEqual(destinationCity.getIslandCoordinates(),
                                     city.getIslandCoordinates())) {
                    loadingCompletion = new Date().getTime();
                }

                var movement = new Movement(
                    -(new Date().getTime()),
                    'own',
                    loadingCompletion, //TODO: multiple loads from same town (if own) stack
                    mission,
                    Constants.Movements.Stage.LOADING,
                    city.getId(),
                    destinationCityId,
                    transports,
                    units,
                    {}
                    // TODO: transport time for towns other than one's that are tracked
                );

                View.registerNextIkariamAjaxRequestCallback(function saveDeploymentData(response) {
                    Utils.iterateIkariamAjaxResponse(response,
                                                     function lookForSuccessFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                            data[0].type == 10) {
                            var military = city.getMilitary();
                            military._decrement(units);
                            raiseMilitaryChanged([{
                                military: military,
                                city: city,
                                type: 'movement_started',
                            }]);

                            var changes = [];
                            getCivilizationData()._updateMovement(movement, changes);
                            raiseMovementsChanged(changes);
                        }
                    });
                });
            }

            function processPlunderForm(form) {
                var city = View.getCurrentCity();
                var transports = parseInt($('#transporterCount').html()) || 0;
                var destinationCityId = parseInt($(form.elements['destinationCityId']).val());
                var destinationCity = getCity(destinationCityId);

                var units = new MilitaryUnits();
                $.each(Constants.UnitIds, function countDeployingUnits(id, type) {
                    units._setCount(type, parseInt($('#cargo_army_' + id).val()) || 0);
                });

                var cargoSize = units.getCargoSize();
                var loadingCompletion = new Date().getTime() +
                    (units.getCargoSize() / city.getLoadingSpeed() * Constants.Time.MILLIS_PER_SECOND);
                if (destinationCity &&
                    coordinatesEqual(destinationCity.getIslandCoordinates(),
                                     city.getIslandCoordinates())) {
                    loadingCompletion = new Date().getTime();
                }

                var movement = new Movement(
                    -(new Date().getTime()),
                    'own',
                    loadingCompletion, //TODO: multiple loads from same town (if own) stack
                    Constants.Movements.Mission.PLUNDER,
                    Constants.Movements.Stage.LOADING,
                    city.getId(),
                    destinationCityId,
                    transports,
                    units,
                    {}
                    // TODO: transport time for towns other than one's that are tracked
                );

                View.registerNextIkariamAjaxRequestCallback(function savePlunderData(response) {
                    Utils.iterateIkariamAjaxResponse(response,
                                                     function lookForSuccessFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                            data[0].type == 10) {
                            var military = city.getMilitary();
                            military._decrement(units);
                            raiseMilitaryChanged([{
                                military: military,
                                city: city,
                                type: 'movement_started',
                            }]);

                            var changes = [];
                            getCivilizationData()._updateMovement(movement, changes);
                            raiseMovementsChanged(changes);
                        }
                    });
                });
            }


            // ============================================================
            // v2.17 : « Troupes dans la ville » (view=cityMilitary)
            // Structure du jeu : #tabUnits / #tabShips > 1er .contentBox01h (Garnison / Navires)
            //   > table.militaryList (plusieurs tables de 7-8 colonnes)
            //     tr.title_img_row : <th></th> puis <th><div class="army s303"> (ou "fleet s211")
            //     tr.count         : <td>joueur</td> puis un <td> par unité, dans le même ordre
            // L'unité est identifiée par son id de jeu (s303 -> 303 -> phalanx), donc
            // indépendamment de la langue et des noms d'images (désormais hachés).
            // ============================================================
            function _impReadCityMilitary($root) {
                var res = { counts: {}, nb: 0, unknown: [], army: false, navy: false };
                $.each(['#tabUnits', '#tabShips'], function(t, tabSel) {
                    var $tab = $root.find(tabSel).first();
                    if (!$tab.length && $root.is(tabSel)) $tab = $root;
                    if (!$tab.length) return;
                    // 1er bloc uniquement : Garnison / Navires (pas Défenseur, Occupant...)
                    var $box = $tab.children('.contentBox01h').first();
                    $box.find('table.militaryList').each(function() {
                        var $heads = $(this).find('tr.title_img_row').first().children('th');
                        var $cells = $(this).find('tr.count').first().children('td');
                        $heads.each(function(i) {
                            if (i === 0) return; // colonne du nom du joueur
                            var $u = $(this).find('.army, .fleet').first();
                            var m = String($u.attr('class') || '').match(/\bs(\d+)\b/);
                            if (!m) return;
                            var type = Constants.UnitIds[parseInt(m[1], 10)];
                            if (!type || !Constants.UnitData[type]) {
                                res.unknown.push('s' + m[1] + ' (' + String($u.text()).trim() + ')');
                                return;
                            }
                            var n = _impInt($cells.eq(i).text());
                            if (n === null) return;
                            res.counts[type] = n;
                            res.nb++;
                            if (Constants.UnitData[type].isArmy) res.army = true; else res.navy = true;
                        });
                    });
                });
                return res;
            }

            function processCityMilitaryView(data, viewHtmlText) {
                // Ville concernée : celle de la page (lien premiumDummy?cityId=), sinon la ville active
                function pageCityId($root) {
                    var href = $root.find('a[href*="cityId="]').filter(function() {
                        return /premiumDummy/.test($(this).attr('href') || '');
                    }).first().attr('href') || '';
                    var m = href.match(/cityId=(\d+)/);
                    return m ? parseInt(m[1], 10) : null;
                }
                var current = View.getCurrentCity();
                var lastSig = null;

                function pass(isLast) {
                    try {
                        var $root = $('#cityMilitary');
                        var r = $root.length ? _impReadCityMilitary($root) : { nb: 0 };
                        if (!r.nb && viewHtmlText) {
                            $root = $('<div>').append($.parseHTML(String(viewHtmlText)));
                            r = _impReadCityMilitary($root);
                        }
                        if (!r.nb) {
                            if (isLast) console.warn('[Imperator] Troupes dans la ville : aucun effectif lu');
                            return;
                        }
                        var cid = pageCityId($root);
                        var c = (cid && getCity(cid)) || current;
                        if (!c) return;

                        var sig = c.getId() + '|' + JSON.stringify(r.counts);
                        if (sig === lastSig) return; // 2e passe identique
                        lastSig = sig;

                        var military = c.getMilitary();
                        $.each(r.counts, function(type, n) { military._updatePresent(type, n); });
                        military._markPresentUpdated(r.army, r.navy);

                        raiseMilitaryChanged([{ city: c, military: military, type: 'data_updated' }]);
                        empireData.saveSoon(); // v2.35
                        console.log('[Imperator] Troupes dans la ville lues (' + c.getName() + ') :', r.counts);
                        if (r.unknown.length && isLast) {
                            console.log('[Imperator] Unités non gérées par le script, ignorées :', r.unknown.join(', '));
                        }
                    } catch (e) {
                        console.warn('[Imperator] Lecture Troupes dans la ville a échoué', e);
                    }
                }
                setTimeout(function() { pass(false); }, 700);
                setTimeout(function() { pass(true); }, 2000);
            }

            function processRelatedCitiesView(data) {
                var city = View.getCurrentCity();
                var military = city.getMilitary();
                military._clear();

                var changed = false;

                var info = $('#relatedCities .contentBox01h:eq(0)');

                var whitespace = /\s+/;

                info.find('.troops .armybutton').each(function(i, element) {
                    var type = element.className.split(whitespace)[1];
                    changed |= military._updatePresent(type, parseInt(element.innerHTML));
                });
                info.find('.troops .fleetbutton').each(function(i, element) {
                    var type = element.className.split(whitespace)[1];
                    changed |= military._updatePresent(type, parseInt(element.innerHTML));
                });

                military._markPresentUpdated();

                if (changed) {
                    raiseMilitaryChanged([{
                        city: city,
                        military: military,
                        type: 'data_updated',
                    }]);
                }
            }

            function parseMilitaryUnitsFromPending(container) {
                var idRegex = /\d+/;
                var units = new MilitaryUnits();

                container.children('.army_wrapper').each(function(index, unitNode) {
                    unitNode = $(unitNode);
                    var type = Constants.UnitIds[
                        parseInt(unitNode.find('.army').attr('class').match(idRegex)[0])];
                    var count = parseInt(unitNode.find('.unitcounttextlabel').html());
                    units._setCount(type, count);
                });
                return units;
            }


                        // v2.15 : ne plante plus si le compte à rebours est introuvable (renvoie null)
            function parseTrainingBatches(viewHtmlText, type, buildingLevel) {
                var trainingBatches = [];
                var constructionList = $('#unitConstructionList');
                if (!constructionList.length) return trainingBatches;
                var m = String(viewHtmlText || '').match(/showUnitCountdown.'buildCountDown', 'buildProgress', (\d+)/);
                if (!m) {
                    console.warn('[Imperator] File de formation : compte à rebours introuvable, file conservée');
                    return null;
                }
                var completionTime = parseInt(m[1], 10) * 1000;
                trainingBatches.push(new TrainingBatch(type, completionTime,
                    parseMilitaryUnitsFromPending(constructionList)));
                constructionList.children('.constructionBlock').each(function() {
                    var units = parseMilitaryUnitsFromPending($(this));
                    completionTime += computeTrainingTime(buildingLevel, units);
                    trainingBatches.push(new TrainingBatch(type, completionTime, units));
                });
                return trainingBatches;
            }

            function computeTrainingTime(barracksLevel, units) {
                var time = 0;
                $.each(units.getCounts(), function(type, count) {
                    var data = Constants.UnitData[type];
                    time += count * Math.pow(0.95, barracksLevel - data.minimumBuildingLevelToBuild) *
                        data.baseBuildTime;
                });
                return time * Constants.Time.MILLIS_PER_SECOND;
            }

            // ============================================================
            // v2.15 : Caserne / Chantier naval — lecture fiable des effectifs
            // ============================================================
            var _IMP_BARRACKS_ORDER = [
                Constants.Military.HOPLITE, Constants.Military.STEAM_GIANT, Constants.Military.SPEARMAN,
                Constants.Military.SWORDSMAN, Constants.Military.SLINGER, Constants.Military.ARCHER,
                Constants.Military.GUNNER, Constants.Military.BATTERING_RAM, Constants.Military.CATAPULT,
                Constants.Military.MORTAR, Constants.Military.GYROCOPTER, Constants.Military.BALLOON_BOMBADIER,
                Constants.Military.COOK, Constants.Military.DOCTOR ];
            var _IMP_SHIPYARD_ORDER = [
                Constants.Military.FLAME_THROWER, Constants.Military.STEAM_RAM, Constants.Military.RAM_SHIP,
                Constants.Military.BALLISTA_SHIP, Constants.Military.CATAPULT_SHIP, Constants.Military.MORTAR_SHIP, // v2.24 : ordre du jeu
                Constants.Military.ROCKET_SHIP, Constants.Military.SUBMARINE, Constants.Military.PADDLE_SPEED_SHIP,
                Constants.Military.BALLOON_CARRIER, Constants.Military.TENDER ];

            // "1 250", "1.250", "1,250" -> 1250 ; illisible -> null
            function _impInt(txt) {
                var n = parseInt(String(txt == null ? '' : txt).replace(/[^\d]/g, ''), 10);
                return isFinite(n) ? n : null;
            }

            // <li class="unit phalanx"> ... <div id="js_barracksUnitUnitsAvailable1">50</div>
            function _impReadUnitList($root) {
                var res = { counts: {}, nb: 0 };
                $root.find('li.unit').each(function() {
                    var cls = String(this.className || '').split(/\s+/), type = null;
                    for (var i = 0; i < cls.length; i++) {
                        if (cls[i] !== 'unit' && Constants.UnitData[cls[i]]) { type = cls[i]; break; }
                    }
                    if (!type) return;
                    var $n = $(this).find('[id*="UnitUnitsAvailable"]').first();
                    if (!$n.length) $n = $(this).find('.unitinfo .scroll_view').first();
                    var n = _impInt($n.text());
                    if (n !== null) { res.counts[type] = n; res.nb++; }
                });
                return res;
            }

            function _impProcessTrainingBuilding(isArmy, viewHtmlText, data) {
                var city = View.getCurrentCity();
                if (!city) return;
                var cityId = city.getId();
                var label = isArmy ? 'Caserne' : 'Chantier naval';
                var lastSig = null;

                function pass(isLast) {
                    try {
                        var c = getCity(cityId);
                        if (!c) return;
                        var military = c.getMilitary();

                        // 1) page affichée (après rendu par le jeu)
                        var r = _impReadUnitList($(isArmy ? '#barracks' : '#shipyard'));
                        // 2) repli : HTML de la réponse serveur (sans exécuter ses scripts)
                        if (!r.nb && viewHtmlText) {
                            r = _impReadUnitList($('<div>').append($.parseHTML(String(viewHtmlText))));
                        }
                        // 3) repli : ancienne lecture par position (templateData)
                        if (!r.nb && data) {
                            $.each(isArmy ? _IMP_BARRACKS_ORDER : _IMP_SHIPYARD_ORDER, function(i, type) {
                                var e = data['js_barracksUnitUnitsAvailable' + (i + 1)];
                                var n = e ? _impInt(e.text) : null;
                                if (n !== null) { r.counts[type] = n; r.nb++; }
                            });
                        }
                        if (!r.nb) {
                            if (isLast) console.warn('[Imperator] ' + label + ' : aucun effectif lu (' + c.getName() + ')');
                            return;
                        }

                        var sig = JSON.stringify(r.counts) + '|' + $('#unitConstructionList').length;
                        if (sig === lastSig) return; // 2e passe identique : rien à refaire
                        lastSig = sig;

                        $.each(r.counts, function(type, n) { military._updatePresent(type, n); });
                        military._markPresentUpdated(isArmy, !isArmy);

                        try {
                            var b = c.getBuildingByType(isArmy ? Constants.Buildings.BARRACKS : Constants.Buildings.SHIPYARD);
                            var batches = parseTrainingBatches(viewHtmlText,
                                isArmy ? Constants.Military.ARMY : Constants.Military.NAVY, b ? b.getLevel() : 0);
                            if (batches !== null) {
                                if (isArmy) military._setArmyTrainingBatches(batches);
                                else military._setNavyTrainingBatches(batches);
                            }
                        } catch (eT) {
                            console.warn('[Imperator] ' + label + ' : file de formation ignorée', eT);
                        }

                        raiseMilitaryChanged([{ city: c, military: military, type: 'data_updated' }]);
                        empireData.saveSoon(); // v2.35
                        console.log('[Imperator] ' + label + ' lu (' + c.getName() + ') :', r.counts);
                    } catch (e) {
                        console.warn('[Imperator] Lecture ' + label + ' a échoué', e);
                    }
                }
                // Comme pour le Sanctuaire : deux passes, le temps que le jeu remplisse la page
                setTimeout(function() { pass(false); }, 700);
                setTimeout(function() { pass(true); }, 2000);
            }

            function processBarracksView(viewHtmlText, data) {
                _impProcessTrainingBuilding(true, viewHtmlText, data);
            }

            function processShipyardView(viewHtmlText, data) {
                _impProcessTrainingBuilding(false, viewHtmlText, data);
            }


            // v3.2 : recherche/h affichée par l'académie (séparateurs de milliers ignorés)
            function readAcademyResearchValue() {
                var el = $('#valueResearch');
                if (!el.length) return NaN;
                var digits = el.text().replace(/[^0-9]/g, '');
                return digits ? parseInt(digits, 10) : NaN;
            }

            // v3.2 : recherche/h estimée après un changement du nombre de chercheurs, en attendant
            // la valeur du jeu : même rendement par chercheur qu'avant, sinon celui des autres villes.
            function estimateResearchPerHour(city, oldScientists, oldResearch, newScientists) {
                if (!(newScientists > 0)) return 0;
                // v3.5 : facteur exact lu dans l'académie (points par chercheur)
                if (city.researchFactor > 0) return Math.floor(newScientists * city.researchFactor);
                if (oldScientists > 0 && oldResearch > 0) {
                    return Math.round(oldResearch / oldScientists * newScientists);
                }
                var points = 0, count = 0;
                $.each(getOwnCities(), function(i, c) {
                    if (!c || c === city || c.researchPerHour == null) return;
                    var sc = Number(c.getScientists()) || 0;
                    if (sc > 0 && c.researchPerHour > 0) { points += c.researchPerHour; count += sc; }
                });
                return count > 0 ? Math.round(points / count * newScientists) : null;
            }

            function processAcademyView(data) {
                var changes = [];
                var city = View.getCurrentCity();
                var scientists = parseInt(data['js_academy_research_tooltip_basic_production'].text);
                city._updateScientists(scientists, changes);
                if (!isNaN(scientists)) city._markScientistsRead(); // v3.2
                var total = readAcademyResearchValue();
                if (!isNaN(total)) city._updateResearchPerHour(total, changes);
                // v3.5 : coût d'un chercheur, points par chercheur, parchemin d'Athéna
                try {
                    var cb = data['js_AcademySlider'].slider.callback_data;
                    if (cb.researchProductionFactor > 0) city._updateResearchFactor(Number(cb.researchProductionFactor));
                    if (cb.costPerScientist > 0) {
                        getCivilizationData()._updateAcademyData({ costPerScientist: Number(cb.costPerScientist) });
                    }
                } catch (eCb) {}
                try {
                    var lj = data['load_js'];
                    var params = typeof lj.params === 'string' ? JSON.parse(lj.params) : lj.params;
                    if (params && typeof params.hasAthenaScroll === 'boolean') {
                        getCivilizationData()._updateAcademyData({
                            hasAthenaScroll: params.hasAthenaScroll,
                            isAthenaScrollActive: !!params.isAthenaScrollActive });
                    }
                } catch (eLj) {}
                city._ackExperiment();
                raiseResourcesChanged(changes);
            }

            // v3.5 : lancement d'une expérience (boutons « Lancer l'expérience » et « Utiliser le
            // parchemin d'Athéna »). Si le jeu confirme, le labo de la ville est indisponible 4 h.
            var EXPERIMENT_COOLDOWN = 4 * Constants.Time.MILLIS_PER_HOUR;
            function processExperimentForm(form) {
                var cityId = parseInt($(form).find('input[name="cityId"]').val(), 10);
                var city = (cityId && getCity(cityId)) || View.getCurrentCity();
                var withScroll = $(form).find('input[name="useAthenasScroll"]').val() == '1';
                var launchedAt = Date.now();

                View.registerNextIkariamAjaxRequestCallback(function saveExperiment(response) {
                    var success = false, failure = false;
                    Utils.iterateIkariamAjaxResponse(response, function lookForFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK) {
                            if (data && data[0] && data[0].type == 10) success = true; else failure = true;
                        }
                    });
                    console.log('[Imperator] Expérience ' + (city && city.getName ? city.getName() : '?') +
                                (withScroll ? ' (parchemin)' : '') + ' : ' +
                                (success ? 'confirmée' : failure ? 'refusée' : 'sans retour du jeu, comptée lancée'));
                    if (failure && !success) return;
                    if (!city) return;
                    city._markExperimentLaunched(launchedAt + EXPERIMENT_COOLDOWN);
                    if (withScroll) getCivilizationData()._updateAcademyData({ hasAthenaScroll: null });
                    // v3.6 : les 300 000 points de l'expérience s'ajoutent aux points accumulés
                    var advisor = getCivilizationData().getResearchAdvisorData();
                    if (advisor.updated) getCivilizationData()._updateResearchAdvisorData({ points: advisor.points + 300000 });
                    raiseResourcesChanged([{ city: city, type: Constants.Resources.SCIENTISTS,
                                             value: city.getScientists() }]);
                });
            }

            function processSetScientistsForm(form) {
                var scientists = parseInt($('#inputScientists').val());
                var shownBefore = readAcademyResearchValue(); // v3.2

                View.registerNextIkariamAjaxRequestCallback(function saveScientstsData(response) {
                    Utils.iterateIkariamAjaxResponse(response,
                                                     function lookForSuccessFeedback(index, name, data) {
                        if (name == Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                            data[0].type == 10) {
                            var changes = [];
                            var city = View.getCurrentCity();
                            // v3.2 : la recherche/h suit tout de suite le nouveau nombre de chercheurs
                            var oldScientists = Number(city.getScientists()) || 0;
                            city._updateResearchPerHour(estimateResearchPerHour(
                                city, oldScientists, city.researchPerHour, scientists), changes);
                            city._updateScientists(scientists, changes);
                            city._markScientistsRead(); // v3.2
                            raiseResourcesChanged(changes);
                            // puis la valeur exacte, dès que l'académie l'affiche
                            setTimeout(function readExactResearch() {
                                var shown = readAcademyResearchValue();
                                if (isNaN(shown) || (shown === shownBefore && scientists !== oldScientists)) return;
                                if (shown === city.researchPerHour) return;
                                var exact = [];
                                city._updateResearchPerHour(shown, exact);
                                exact.push({ city: city, type: Constants.Resources.SCIENTISTS, value: scientists });
                                raiseResourcesChanged(exact);
                            }, 600);
                        }
                    });
                });
            }

            function processPalaceView(data) {
                var changes = [];
                getCivilizationData()._updateGovernment(
                    $('.government_pic img').attr('src').slice(16, -8), changes);
                raiseCivilizationDataChanged(changes);
            }

            
            // v2.18 : lecture des biens culturels de TOUTES les villes, déclenchée par
            // l'apparition du formulaire de répartition (indépendant du nom de vue).
            (function _impWatchCulturalGoods() {
                function readAll(attempt) {
                    attempt = attempt || 0;
                    var inputs = $('#moveCulturalGoods input[id^="textfield_city_"]');
                    if (!inputs.length) {
                        if (attempt < 10) setTimeout(function () { readAll(attempt + 1); }, 300);
                        return;
                    }
                    try {
                        var changes = [];
                        var count = 0;
                        inputs.each(function (index, item) {
                            item = $(item);
                            var idMatch = /textfield_city_(\d+)/.exec(item.attr('id') || '');
                            if (!idMatch) return;
                            var city = getCity(parseInt(idMatch[1], 10));
                            var raw = String(item.val() == null ? '' : item.val()).replace(/[^\d]/g, '');
                            if (!city || raw === '') return;
                            var v = parseInt(raw, 10);
                            if (isFinite(v)) {
                                city._updateCulturalGoods(v, changes);
                                count++;
                            }
                        });
                        console.log('[Imperator] biens culturels lus pour ' + count + ' ville(s)');
                        if (changes.length) {
                            raiseResourcesChanged(changes);
                            empireData.saveAsync();
                        }
                    } catch (e) {
                        console.warn('[Imperator] lecture biens culturels ignorée', e);
                    }
                }

                // v2.35 : plus d'observateur de toute la page (réveillé à chaque compte à rebours
                // du jeu) ; on regarde seulement les réponses du jeu qui contiennent le formulaire.
                var timer = null;
                function schedule() {
                    clearTimeout(timer);
                    timer = setTimeout(function () { readAll(); }, 300);
                }
                View.registerIkariamAjaxResponseCallback(function watchCulturalGoods(response) {
                    var seen = false;
                    try {
                        Utils.iterateIkariamAjaxResponse(response, function (index, name, data) {
                            if (seen || !data) return;
                            var html = typeof data === 'string' ? data :
                                       (typeof data[1] === 'string' ? data[1] : '');
                            if (html.indexOf('moveCulturalGoods') >= 0) seen = true;
                        });
                    } catch (e) {}
                    if (seen) schedule();
                });
                // Page chargée directement sur le formulaire (F5)
                function checkPage() { if (document.getElementById('moveCulturalGoods')) schedule(); }
                if (document.readyState !== 'loading') checkPage();
                else document.addEventListener('DOMContentLoaded', checkPage);
            })();



            function processTownHallView(data) {
                var changes = [];
                var city = View.getCurrentCity();

                // --- Humeur réelle depuis l’interface Ikariam ---
                try {
                    // Selon les versions Ikariam, l’ID peut varier un peu, adapte au besoin
                    var moodImg = document.querySelector("#js_TownHallSatisfactionOverviewMood img, #js_townHallMood img");
                    if (moodImg && moodImg.src) {
                        var src = moodImg.src;
                        var mood = "neutral";

                        if (src.indexOf("happy") >= 0 || src.indexOf("smiley_happy") >= 0) {
                            mood = "happy";
                        } else if (src.indexOf("ecstatic") >= 0) {
                            mood = "ecstatic";
                        } else if (src.indexOf("sad") >= 0) {
                            mood = "sad";
                        } else if (src.indexOf("angry") >= 0 || src.indexOf("outraged") >= 0) {
                            mood = "outraged";
                        } else if (src.indexOf("neutral") >= 0) {
                            mood = "neutral";
                        }

                        // On stocke l’humeur directement sur l’objet ville
                        city._imperatorMood = mood;
                    }
                } catch (e) {
                    console.warn("Imperator patch mood: erreur lecture humeur TownHall", e);
                }

               // v2.18 : lecture robuste des bonus (séparateur de milliers FR + table non linéaire)
                function _impReadTH(id) {
                    var txt = (data[id] && data[id].text != null) ? data[id].text : $('#' + id).text();
                    return _impNumFR(txt);   // déclaration de fonction -> hoistée, utilisable ici
                }
                function _impTavernLevelFromBonus(bonus) {
                    if (!isFinite(bonus) || bonus <= 0) return 0;
                    var tbl = Constants.BuildingData[Constants.Buildings.TAVERN].maxBonus;
                    var best = 0, bestDiff = Infinity;
                    for (var i = 0; i < tbl.length; i++) {
                        var d = Math.abs(tbl[i] - bonus);
                        if (d < bestDiff) { bestDiff = d; best = i + 1; }  // tbl[0] = niveau 1
                    }
                    return best;
                }
                try {
                    var _cgBonus = _impReadTH('js_TownHallSatisfactionOverviewCultureBoniTreatyBonusValue');
                    if (isFinite(_cgBonus)) city._updateCulturalGoods(Math.round(_cgBonus / 50), changes);
                } catch (e) {}
                try {
                    var _twBonus = _impReadTH('js_TownHallSatisfactionOverviewWineBoniServeBonusValue');
                    if (isFinite(_twBonus)) city._updateTavernWineLevel(_impTavernLevelFromBonus(_twBonus), changes);
                } catch (e) {}

                // v2.11 : lecture des VRAIES valeurs du jeu. Nombres FR -> separateur de
                // milliers = espace insecable (\u00a0) : parseInt s'arreterait au 1er espace
                // ("5 340" -> 5). On nettoie les espaces (normal/insecable/fin) et la virgule.
                function _impNumFR(txt) {
                    if (txt == null) return NaN;
                    var str = String(txt).replace(/[\s\u00a0\u202f\u2009]/g, '').replace(/\+/g, '').replace(',', '.');
                    var n = parseFloat(str);
                    return isFinite(n) ? n : NaN;
                }

                // Satisfaction libre reelle (surplus) -> pilote la croissance
                var _sat = _impNumFR($('#js_TownHallHappinessLargeValue').text());
                if (isFinite(_sat)) city._updateHappinessScore(_sat, changes);

                // Population reelle (l'onglet Hotel de Ville l'expose ; d'autres vues renvoient 0)
                try {
                    var _rp = _impNumFR($('#js_TownHallOccupiedSpace').text());
                    if (isFinite(_rp) && _rp > 0) city._updatePopulation(_rp, changes);
                } catch (e) {}

                // Plafond de logement reel
                try {
                    var _rm = _impNumFR($('#js_TownHallMaxInhabitants').text());
                    if (isFinite(_rm) && _rm > 0) city._realMax = _rm;
                } catch (e) {}

                // Croissance/heure reelle affichee par le jeu
                try {
                    var _rg = _impNumFR($('#js_TownHallPopulationGrowthValue').text());
                    if (isFinite(_rg)) city._realGrowth = _rg;
                } catch (e) {}

                raiseResourcesChanged(changes);
            }


            function processTempleView(data) {
                var changes = [];
                View.getCurrentCity()._updatePriests(
                    parseInt(data['js_TempleSlider'].slider.ini_value), changes);
                raiseResourcesChanged(changes);
            }

            function processResearchAdvisorView(data) {
                var civData = getCivilizationData();
                var idRegex = /researchId=([0-9]+)/i
                var levelRegex = /\((\d+)\)/;

                var researches =
                    JSON.parse(data['new_js_params'] || data['load_js'].params).currResearchType;

                var changes = [];
                $.each(researches, function (name, researchData) {
                    var id = parseInt(idRegex.exec(researchData.aHref)[1]);
                    var levelMatch = levelRegex.exec(name);
                    var level = levelMatch
                    ? parseInt(levelMatch[1]) - 1
                    : (researchData.liClass == 'explored' ? 1 : 0);

                    civData._updateResearch(id, level, changes);
                });
                // v3.6 : points accumulés, points/h et coût de la prochaine recherche par domaine
                try {
                    var advisor = readResearchAdvisorNumbers(data);
                    if (advisor) civData._updateResearchAdvisorData(advisor);
                } catch (eAdv) {}
                raiseCivilizationDataChanged(changes);
            }

            // v3.6 : nombre du jeu (« 3 360 298 », « 1 081,84 ») ; NaN si absent
            function parseGameNumber(value) {
                if (value && typeof value === 'object') value = value.text;
                if (value === undefined || value === null) return NaN;
                var s = String(value).replace(/[\s\u00a0\u202f]/g, '');
                if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');      // 1.081,84
                else if (/\.\d{1,2}$/.test(s)) s = s.replace(/,/g, '');                  // 1,081.84
                else s = s.replace(/[.,]/g, '');                                         // 3.360.298
                return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
            }

            function readResearchAdvisorNumbers(data) {
                var points = parseGameNumber(data['js_researchAdvisorPoints']);
                var perHour = parseGameNumber(data['js_researchAdvisorTime']);
                if (isNaN(points)) return null;
                var domains = [];
                for (var i = 0; i < 10; i++) {
                    if (!(('js_researchAdvisorNextResearchCost' + i) in data)) break;
                    var cost = parseGameNumber(data['js_researchAdvisorNextResearchCost' + i]);
                    var name = data['js_researchAdvisorNextResearchName' + i] || '';
                    var domain = data['js_researchAdvisorChangeResearchTypeTxt' + i] || '';
                    domains.push({ domain: String(domain), name: String(name), cost: isNaN(cost) ? 0 : cost });
                }
                return { points: points, perHour: isNaN(perHour) ? 0 : perHour, domains: domains, updated: Date.now() };
            }

            // Parser le Bilan depuis le DOM live (fallback si AJAX non intercepté)
            var _bilanLastParsed = 0;
            function parseBilanDomIfVisible() {
                try {
                    // Anti-double-parse : attendre 3s minimum entre deux parsings
                    if (Date.now() - _bilanLastParsed < 3000) return;
                    // Chercher td.city dans le DOM (spécifique au Bilan)
                    var $cityCells = $('td.city');
                    if (!$cityCells.length) return;
                    // Vérifier que le conteneur ressemble au Bilan
                    var $container = $cityCells.first().closest('table').closest('div, section, article');
                    if (!$container.length) $container = $cityCells.first().closest('table').parent();
                    var html = $container.length ? $container[0].outerHTML : '';
                    if (!html) return;
                    if (html.indexOf('Montant') < 0 && html.indexOf('Dieux') < 0 && html.indexOf('Pluton') < 0) return;
                    _bilanLastParsed = Date.now();
                    processFinancesView(null, html);
                } catch(e) {}
            }

            // Hook createTemplateView dans le bon scope (parseBilanDomIfVisible accessible ici)
            (function hookCreateTemplateView() {
                try {
                    var orig = unsafeWindow.ikariam.createTemplateView;
                    if (orig && !orig.__imperatorHooked) {
                        unsafeWindow.ikariam.createTemplateView = function() {
                            var result = orig.apply(this, arguments);
                            setTimeout(parseBilanDomIfVisible, 300);
                            return result;
                        };
                        unsafeWindow.ikariam.createTemplateView.__imperatorHooked = true;
                    }
                } catch(e) {}
            })();

            function processFinancesView(data, viewHtmlStr) {
                var cities = getOwnCities();
                var scientistCost = 6;
                if (getCivilizationData().hasResearched(Constants.Research.Science.LETTER_CHUTE)) {
                    scientistCost = 3;
                }
                var changes = [];
                // Le parsing scientifiques est maintenant intégré dans parseBilanFromHtml

                // Parser le Bilan depuis son HTML (fiable, sans dépendance DOM live)
                if (viewHtmlStr) {
                    setTimeout(function parseBilanFromHtml() {
                        try {
                            var $b = $('<div>').html(viewHtmlStr);
                            var goldUpd = { incomeUpdated: Date.now() };
                            var found = 0;

                            // Helper: lire la valeur numérique d'une cellule
                            // - supprime les div.tooltip (valeurs décimales)
                            // - gère &nbsp; (\u00a0) comme séparateur de milliers
                            // - lit le <span> pour les valeurs négatives
                            function cellVal($td) {
                                if (!$td || !$td.length) return NaN;
                                var $span = $td.find('span').first();
                                var src   = $span.length ? $span.text() : $td.clone().find('div').remove().end().text();
                                var raw   = src.replace(/\u00a0/g,'').replace(/\s/g,'').replace(/[^0-9\-]/g,'');
                                return parseInt(raw);
                            }

                            // 1. Or actuel : ligne 'Montant de l\'or'
                            $b.find('tr').each(function() {
                                var lbl = $(this).find('td').first().text().toLowerCase();
                                if (lbl.indexOf('montant') < 0) return;
                                // v2.24 : la valeur est en 2e cellule (la dernière est l'offre premium) ;
                                // son infobulle donne le montant exact ("600 205 849,78").
                                var $val = $(this).find('td').eq(1);
                                var exact = $val.find('div.tooltip').first().text()
                                                .replace(/[\u00a0\u202f\s]/g,'').replace(',','.');
                                if (/^\d+(\.\d+)?$/.test(exact)) {
                                    goldUpd.current = Math.round(parseFloat(exact));
                                    goldUpd.currentUpdated = Date.now(); found++;
                                    return false;
                                }
                                var raw = $val.clone().find('div').remove().end().text();
                                raw = raw.replace(/\u00a0/g,'').replace(/\s/g,'').replace(',','.');
                                var g = 0;
                                if (/[0-9.]+G/i.test(raw)) g = Math.round(parseFloat(raw)*1e9);
                                else if (/[0-9.]+M/i.test(raw)) g = Math.round(parseFloat(raw)*1e6);
                                else if (/[0-9.]+k/i.test(raw)) g = Math.round(parseFloat(raw)*1e3);
                                else g = parseInt(raw.replace(/[^0-9]/g,'')) || 0;
                                if (g > 0) { goldUpd.current = g; goldUpd.currentUpdated = Date.now(); found++; }
                                return false;
                            });

                            // 2. Per-ville : td.city contient le nom
                            // Structure : [nom][revenu][scientifiques][résultat]
                            $b.find('td.city').each(function() {
                                var cityName = $(this).text().trim();
                                var $row     = $(this).closest('tr');
                                var $cells   = $row.find('td');
                                if ($cells.length < 4) return;
                                $.each(cities, function(i, city) {
                                    // Garde null : ignorer les entrées invalides
                                    if (!city || typeof city.getName !== 'function') return;
                                    var cName = city.getName();
                                    if (cityName !== cName && cityName !== 'G - '+cName &&
                                        cityName.replace(/^G\s*-\s*/,'') !== cName) return;
                                    // Or net par ville (dernière colonne = Résultat)
                                    var res = cellVal($($cells[$cells.length - 1]));
                                    if (!isNaN(res)) {
                                        city.cityGoldNet        = res;
                                        city.cityGoldNetUpdated = Date.now();
                                    }
                                    // Scientifiques (3ème colonne, valeur négative)
                                    // v3.2 : seulement si l'académie n'a jamais été lue. Le coût d'un
                                    // chercheur varie (recherches, forme de gouvernement) : un nombre
                                    // déduit du coût peut être faux et ne doit pas écraser un relevé.
                                    if ($cells.length >= 3 && !city.getScientistsReadAt()) {
                                        var sciCost = cellVal($($cells[2]));
                                        if (!isNaN(sciCost) && sciCost < 0) {
                                            var sciCount = Math.round(-sciCost / scientistCost);
                                            if (sciCount >= 0) city._updateScientists(sciCount, changes);
                                        }
                                    }
                                });
                            });
                            if (changes.length) raiseResourcesChanged(changes);

                            // 3. Lignes non-ville par texte (Dieux, Augmentez, Revenu, Entretien)
                            $b.find('tr').each(function() {
                                var $cells = $(this).find('td');
                                if (!$cells.length) return;
                                // Ignorer les lignes de ville et les lignes sigma
                                if ($cells.filter('.city').length || $cells.filter('.sigma').length) return;
                                var label = $cells.first().clone().find('div').remove().end()
                                                  .text().replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
                                var lc = label.toLowerCase();
                                // v2.24 : première cellule chiffrée après le libellé (la dernière peut être vide)
                                var num = NaN;
                                for (var ci = 1; ci < $cells.length && isNaN(num); ci++) num = cellVal($($cells[ci]));
                                if (isNaN(num)) return;
                                if (lc.indexOf('dieux') >= 0 || lc.indexOf('pluton') >= 0)   { goldUpd.gods    = num; found++; }
                                else if (lc.indexOf('entretien') >= 0)                       { goldUpd.upkeep  = -(Math.abs(num)); found++; }
                                else if (lc.indexOf('premium') >= 0 || lc.indexOf('augmentez') >= 0) { goldUpd.premium = num; found++; }
                                // v2.24 : la ligne « Revenu » du total inclut Pluton et déduit les scientifiques :
                                // le revenu est désormais la somme de la colonne Revenu des villes (comme ikariam.model).
                            });

                            // v2.24 : revenu des villes (colonne 2) et coût des scientifiques (ligne Somme, colonne 3)
                            var cityRevenue = 0, cityRows = 0;
                            $b.find('td.city').each(function() {
                                var $c = $(this).closest('tr').find('td');
                                var v = cellVal($($c[1]));
                                if (!isNaN(v)) { cityRevenue += v; cityRows++; }
                            });
                            if (cityRows > 0) { goldUpd.revenue = cityRevenue; found++; }
                            $b.find('tr.result').each(function() {
                                var $c = $(this).find('td');
                                if (!$c.first().hasClass('sigma') || $c.length < 4) return;
                                var sci = cellVal($($c[2]));
                                if (!isNaN(sci)) { goldUpd.scientists = -(Math.abs(sci)); found++; }
                                return false;
                            });

                            // 4. Lignes sigma (tr.result) : dernière = net
                            var sigmaResults = [];
                            $b.find('tr.result').each(function() {
                                var $valCells = $(this).find('td:not(.sigma)');
                                if (!$valCells.length) return;
                                var lastVal = cellVal($($valCells[$valCells.length - 1]));
                                if (!isNaN(lastVal)) sigmaResults.push(lastVal);
                            });
                            // Le dernier sigma = solde net final (après déduction de l'entretien armée)
                            if (sigmaResults.length > 0) { goldUpd.net = sigmaResults[sigmaResults.length - 1]; found++; }

                            if (found > 0) { getCivilizationData()._updateGoldData(goldUpd); raiseGoldChanged(); }
                        } catch(e) {}
                    }, 0);
                } else {
                    // Fallback: coût scientifiques calculé depuis données connues
                    try {
                        var totalSci = 0;
                        $.each(cities, function(i, c) {
                            if (!c || typeof c.getScientists !== 'function') return;
                            totalSci += (c.getScientists()||0) * scientistCost;
                        });
                        if (totalSci > 0) {
                            getCivilizationData()._updateGoldData({ scientists: -totalSci, incomeUpdated: Date.now() });
                            raiseGoldChanged();
                        }
                    } catch(e) {}
                }
                if (changes.length) raiseResourcesChanged(changes);
            }

            // ============================================================
            // v2.07 : Parser du Sanctuaire divin (vue shrineOfOlympus)
            // Extrait, pour chaque ville, la divinité vénérée + la faveur totale.
            // Robuste : ancres stables (data-known-city-id, classe god_*),
            // try/catch par entrée pour ne jamais casser en cas de maj Ikariam.
            // ============================================================
            var _shrineLastParsed = 0;
            // Mapping id divinité -> nom (ordre fixe du jeu)
            var SHRINE_GOD_NAMES = {
                '1':'Pan', '2':'Dionysos', '3':'Tyché',
                '4':'Pluton', '5':'Théia', '6':'Héphaïstos'
            };
            // Mapping classe CSS -> id divinité (repli si l'option selected manque)
            var SHRINE_GOD_CLASS = {
                'god_pan':'1', 'god_dionysus':'2', 'god_tyche':'3',
                'god_plutus':'4', 'god_theia':'5', 'god_hephaestos':'6'
            };

            // v2.12 : "2j 12h", "5h 30m", "45m"... -> millisecondes (null si illisible)
            function parseShrineDuration(txt) {
                var s = String(txt || '').replace(/\u00a0/g, ' ');
                var re = /(\d+)\s*(j|d|h|m|s)/gi, m, ms = 0, found = false;
                var unit = { j: 86400000, d: 86400000, h: 3600000, m: 60000, s: 1000 };
                while ((m = re.exec(s)) !== null) {
                    ms += parseInt(m[1], 10) * unit[m[2].toLowerCase()];
                    found = true;
                }
                return found ? ms : null;
            }

            function processShrineView(data, viewHtmlStr) {
                if (Date.now() - _shrineLastParsed < 2000) return; // anti-doublon
                if (!viewHtmlStr && typeof data !== 'string') {
                    // Certaines réponses passent le HTML dans templateData ; on tente une reconstruction
                    return;
                }
                _shrineLastParsed = Date.now();
                // v2.14 : la réponse serveur contient des champs VIDES (durées, jauges,
                // bénédictions), remplis ensuite par le JS du jeu. On lit donc la page
                // affichée une fois rendue ; le HTML brut ne sert que de repli.
                function parseShrineFromHtml() {
                    try {
                        var htmlSrc = viewHtmlStr || (typeof data === 'string' ? data : '');
                        var $s = null;
                        var $live = $('#shrineOfOlympus');
                        if ($live.length) {
                            var liveFilled = $live.find('ul.gods.overview .gracePeriod').filter(function() {
                                return /\d/.test($(this).text());
                            }).length > 0;
                            if (liveFilled) $s = $live;
                        }
                        if (!$s) {
                            if (!htmlSrc) return;
                            $s = $('<div>').html(htmlSrc);
                        }
                        var cities = getOwnCities();
                        var changes = [];
                        var assignedCount = 0;

                        // Faveur totale
                        try {
                            var favTxt = $s.find('#currentFavor').first().text();
                            var fav = parseInt((favTxt||'').replace(/[\u00a0\s]/g,'').replace(/[^0-9]/g,''));
                            if (!isNaN(fav)) getCivilizationData()._updateShrineData({ favor: fav, updated: Date.now() });
                        } catch(eFav) {}

                        // v2.12 : bienveillance par dieu (onglet Vue générale, présent dans
                        // la même réponse que l'onglet Vénérer). On stocke une date de fin
                        // absolue : le décompte se fait ensuite localement.
                        var godsParsed = 0;
                        try {
                            var nowG = Date.now();
                            // v2.14 : on part des données existantes (fusion, jamais d'écrasement par du vide)
                            var prevGods = getCivilizationData().getShrineData().gods || {};
                            var graces = $.extend(true, {}, prevGods);
                            $s.find('ul.gods.overview > li[data-god-id]').each(function() {
                                try {
                                    var $g = $(this);
                                    var gid = String($g.attr('data-god-id') || '');
                                    var $gp = $g.find('.gracePeriod').first();
                                    if (!gid || !$gp.length) return;
                                    var gTxt = $.trim($gp.text());
                                    var ms = parseShrineDuration(gTxt);
                                    // v2.13 : jauge de faveur "1000 / 1000"
                                    var favor = null, favorMax = null;
                                    try {
                                        var $pb = $g.find('.progressbar .innerDisplay').first();
                                        var fv = parseInt(($pb.find('.text').first().text() || '').replace(/[^0-9]/g, ''), 10);
                                        var fm = parseInt((($pb.text() || '').split('/')[1] || '').replace(/[^0-9]/g, ''), 10);
                                        if (isFinite(fv)) favor = fv;
                                        if (isFinite(fm) && fm > 0) favorMax = fm;
                                    } catch(eF) {}
                                    // v2.14 : seules les valeurs réellement lues sont mises à jour
                                    var entry = graces[gid] || {};
                                    entry.name = SHRINE_GOD_NAMES[gid] || $.trim($g.find('.godDescription > b').first().text()) || entry.name || '?';
                                    var readSomething = false;
                                    if (ms !== null) { entry.graceEnd = nowG + ms; entry.graceText = gTxt; readSomething = true; }
                                    if (favor !== null) { entry.favor = favor; readSomething = true; }
                                    if (favorMax !== null) entry.favorMax = favorMax;
                                    if (!readSomething) return; // champs vides : on garde l'existant
                                    entry.updated = nowG;
                                    graces[gid] = entry;
                                    godsParsed++;
                                } catch(eG1) {}
                            });
                            if (godsParsed > 0) {
                                getCivilizationData()._updateShrineData({ gods: graces, godsUpdated: nowG });
                            }
                        } catch(eG) {
                            console.warn('[Imperator] processShrineView : bienveillances ignorées', eG);
                        }

                        // Index rapide des villes par id (clé string)
                        var cityById = {};
                        $.each(cities, function(i, c) {
                            if (c && typeof c.getId === 'function') cityById[String(c.getId())] = c;
                        });

                        // Chaque ligne d'affectation
                        var seenCityIds = {}; // v2.12 : pour nettoyer les affectations retirées
                        var $worshipLis = $s.find('ul.gods.worshiping > li');
                        $worshipLis.each(function() {
                            try {
                                var $li = $(this);
                                var $citySel = $li.find('select.js_citySelect').first();
                                // 1) id ville : priorité à data-known-city-id (stable), sinon option selected
                                var cityId = $citySel.attr('data-known-city-id');
                                if (!cityId || cityId === '0') {
                                    cityId = $citySel.find('option[selected]').first().attr('value') ||
                                             $citySel.val();
                                }
                                cityId = String(cityId || '0');
                                if (cityId === '0' || !cityId) return; // slot vide

                                // 2) id divinité : option selected, sinon classe god_* du bloc détail
                                var $godSel = $li.find('select.js_godSelect').first();
                                var godId = $godSel.find('option[selected]').first().attr('value') || $godSel.val();
                                if (!godId || godId === '0') {
                                    var $godDiv = $li.find('.js_toggleBigContent .god').first();
                                    var cls = ($godDiv.attr('class') || '').split(/\s+/);
                                    for (var k=0; k<cls.length; k++) {
                                        if (SHRINE_GOD_CLASS[cls[k]]) { godId = SHRINE_GOD_CLASS[cls[k]]; break; }
                                    }
                                }
                                godId = String(godId || '0');
                                if (godId === '0') return;

                                var godName = SHRINE_GOD_NAMES[godId] ||
                                              ($godSel.find('option[selected]').first().text().trim()) || '?';

                                // 3) bénédiction (facultatif, tolérant aux absences)
                                var bonusTxt = $li.find('.currentBonus').first().text();
                                var bonus = parseFloat((bonusTxt||'').replace(',','.').replace(/[^0-9.]/g,''));
                                if (isNaN(bonus)) bonus = null;

                                // 4) écrire sur l'objet ville (persiste via reviver)
                                var city = cityById[cityId];
                                if (city) {
                                    seenCityIds[cityId] = true;
                                    city.worshipGodId       = godId;
                                    city.worshipGodName     = godName;
                                    if (bonus !== null) city.worshipGodBonus = bonus; // v2.14 : vide => on garde
                                    city.worshipGodUpdated  = Date.now();
                                    assignedCount++;
                                }
                            } catch(eLi) {
                                console.warn('[Imperator] processShrineView : entrée ignorée', eLi);
                            }
                        });

                        // v2.12 : une ville qui n'apparaît plus dans l'onglet Vénérer n'a plus de dieu
                        var cleared = 0;
                        if ($worshipLis.length > 0) {
                            $.each(cityById, function(cid, c) {
                                if (!seenCityIds[cid] && c.worshipGodId) {
                                    delete c.worshipGodId;
                                    delete c.worshipGodName;
                                    delete c.worshipGodBonus;
                                    delete c.worshipGodUpdated;
                                    cleared++;
                                }
                            });
                        }

                        if (assignedCount > 0 || godsParsed > 0 || cleared > 0) {
                            // Réutilise l'événement gold (le Dashboard écoute déjà dessus) pour redessiner
                            raiseGoldChanged();
                            raiseShrineChanged(); // v2.12 : onglet Ressources
                            empireData.saveSoon(); // v2.35
                        }
                    } catch(e) {
                        console.warn('[Imperator] processShrineView a échoué', e);
                    }
                }
                // v2.14 : deux passes, le temps que le jeu remplisse la page
                setTimeout(parseShrineFromHtml, 700);
                setTimeout(parseShrineFromHtml, 2000);
            }

            // ============================================================
            // v2.07 : Capture du VRAI coût d'agrandissement depuis le jeu.
            // Le modèle de la vue ville ne contient pas les coûts : ils sont
            // uniquement dans le panneau latéral "#buildingUpgrade" affiché à
            // l'ouverture d'un bâtiment. On le lit et on le met en cache sur
            // l'objet City.Building (persiste via le reviver), pour remplacer
            // les tables codées en dur (périmées) dans le tooltip.
            // ============================================================
            function processBuildingUpgradeView(viewHtml) {
                setTimeout(function parseBuildingUpgrade() {
                    try {
                        var $box = null;
                        if (viewHtml && viewHtml.indexOf('buildingUpgrade') >= 0) {
                            $box = $('<div>').html(viewHtml).find('#buildingUpgrade');
                        }
                        if (!$box || !$box.length) $box = $('#buildingUpgrade');   // repli DOM live
                        if (!$box || !$box.length) return;

                        // cityId / position / niveau courant depuis le bouton "Développer"
                        var href = $box.find('#js_buildingUpgradeButton').attr('href') ||
                                   $box.find('a[href*="cityId="]').first().attr('href') || '';
                        var cM = href.match(/cityId=(\d+)/), pM = href.match(/position=(\d+)/), lM = href.match(/level=(\d+)/);
                        var cityId = cM ? parseInt(cM[1], 10) : null;
                        var position = pM ? parseInt(pM[1], 10) : null;
                        var level = lM ? parseInt(lM[1], 10) : null;
                        if (level == null) {
                            var lt = ($box.find('.showLevel').text() || '').match(/(\d+)/);
                            if (lt) level = parseInt(lt[1], 10);
                        }
                        if (cityId == null || position == null || level == null) return;

                        // Coûts réels (classe crystal = verre). Les libellés ne contiennent
                        // aucun chiffre, donc on extrait le nombre du title en retirant tout non-digit.
                        var cost = { wood:0, wine:0, marble:0, glass:0, sulfur:0, time:0,
                                     forLevel: level, updated: Date.now() };
                        var classMap = { wood:'wood', wine:'wine', marble:'marble', crystal:'glass', sulfur:'sulfur' };
                        $box.find('ul.resources > li').each(function() {
                            var $li = $(this), cls = ($li.attr('class') || '').split(/\s+/);
                            if ($.inArray('time', cls) >= 0) {
                                // Exclure le tooltip interne (qui répète "21m 18s") avant de parser.
                                var timeTxt = $li.clone().children('div').remove().end().text();
                                var t = _impParseDurationMs(timeTxt);
                                if (t != null) cost.time = t;
                                return;
                            }
                            var key = null;
                            for (var i = 0; i < cls.length; i++) { if (classMap[cls[i]]) { key = classMap[cls[i]]; break; } }
                            if (!key) return;
                            var amtSrc = $li.attr('title') || $li.text();
                            var amt = parseInt(String(amtSrc).replace(/[^0-9]/g, ''), 10);
                            if (!isNaN(amt)) cost[key] = amt;
                        });

                        var city = getCity(cityId);
                        var building = city && city.getBuildingByPosition ? city.getBuildingByPosition(position) : null;
                        if (building) {
                            building.realUpgradeCost = cost;
                            empireData.saveSoon(); // v2.35
                        }
                    } catch(e) {
                        console.warn('[Imperator] processBuildingUpgradeView a échoué', e);
                    }
                }, 0);
            }

            // ============================================================
            // v2.31 : Aide des bâtiments (vue « buildingDetail » de l'encyclopédie).
            // La page donne, niveau par niveau, les coûts EXACTS du jeu (dans l'infobulle
            // de chaque case ; le texte visible est arrondi : « 1,50T »). On les garde
            // par type de bâtiment : getUpgradeCosts s'en sert avant les anciennes tables.
            // ============================================================

            // Le jeu ne nomme pas les colonnes : il met une image. Noms de fichiers relevés
            // le 7 nov. 2026 (jeu 17.6.1) sur l'aide de l'Académie et de la Résidence.
            var _IMP_HELP_COLUMNS = {
                'c3527b2f694fb882563c04df6d8972': 'wood',
                '94ddfda045a8f5ced3397d791fd064': 'wine',
                'fc258b990c1a2a36c5aeb9872fc08a': 'marble',
                '417b4059940b2ae2680c070a197d8c': 'glass',
                '5578a7dfa3e98124439cca4a387a61': 'sulfur',
                '465f0358d2cb09c07cd0f5a53e38eb': 'time',
            };
            var _IMP_HELP_RESOURCES = ['wood', 'wine', 'marble', 'glass', 'sulfur'];

            // { <type>: { levels: { <niveau>: { wood, wine, marble, glass, sulfur } }, updated } }
            var buildingHelpData = new Data.Value('buildingHelpCosts', {}, { version: 1 });

            function _impHelpInt(txt) {
                var s = String(txt == null ? '' : txt).replace(/[^0-9]/g, '');
                return s ? parseInt(s, 10) : null;
            }

            // Lit une page d'aide. Renvoie { type, levels, unknown } ou null si ce n'en est pas une.
            function parseBuildingDetailHtml(html) {
                if (!html) return null;
                var $root = $('<div></div>').append($.parseHTML(String(html), document, false));
                var $img = $root.find('div.buildingimg').first();
                var type = $.trim(String($img.parent('td').attr('class') || '')).split(/\s+/)[0];
                var known = false;
                $.each(Constants.Buildings, function(k, v) { if (v === type) known = true; });
                if (!type || !known) return null;

                var $table = $root.find('table').filter(function() {
                    return $(this).find('td.level').length > 0;
                }).first();
                if (!$table.length) return null;

                var columns = [], unknown = [];
                $table.find('tr').first().children('th').each(function(i) {
                    var key = null;
                    if (i > 0 && $(this).hasClass('costs')) {
                        var m = String($(this).find('img').attr('src') || '').match(/([0-9a-f]{20,})\.png/);
                        key = m ? (_IMP_HELP_COLUMNS[m[1]] || null) : null;
                        if (!key) unknown.push(m ? m[1] : '?');
                    }
                    columns.push(key);
                });

                var levels = {}, count = 0;
                $table.find('tr').each(function() {
                    var $tds = $(this).children('td');
                    if (!$tds.first().hasClass('level')) return;
                    var level = _impHelpInt($tds.first().text());
                    if (!level) return;
                    var costs = { wood: 0, wine: 0, marble: 0, glass: 0, sulfur: 0 };
                    $tds.each(function(i) {
                        var key = columns[i];
                        if (!key || key === 'time') return;
                        var $tip = $(this).find('div.tooltip').first();
                        var n = _impHelpInt($tip.length ? $tip.text() : $(this).text());
                        if (n !== null) costs[key] = n;
                    });
                    levels[level] = costs;
                    count++;
                });
                if (!count) return null;
                return { type: type, levels: levels, unknown: unknown };
            }

            function processBuildingDetailView(html) {
                try {
                    var r = parseBuildingDetailHtml(html);
                    if (!r) return;
                    if (r.unknown.length) {
                        // Une colonne non reconnue : on ne stocke rien plutôt qu'un coût faux.
                        console.warn('[Imperator] Aide des bâtiments (' + r.type + ') : colonne non reconnue (' +
                                     r.unknown.join(', ') + '), lecture ignorée');
                        return;
                    }
                    var store = buildingHelpData.get();
                    var entry = store[r.type] || (store[r.type] = { levels: {} });
                    $.extend(entry.levels, r.levels);
                    entry.updated = Date.now();
                    buildingHelpData.saveAsync();
                    var lv = $.map(r.levels, function(v, k) { return parseInt(k, 10); }).sort(function(a, b) { return a - b; });
                    console.log('[Imperator] Aide des bâtiments (' + r.type + ') : niveaux ' + lv[0] + ' à ' +
                                lv[lv.length - 1] + ' lus');
                } catch (e) {
                    console.warn('[Imperator] Lecture de l\'aide des bâtiments échouée', e);
                }
            }

            // Coût de base (avant réductions) pour CONSTRUIRE le niveau donné, ou null si inconnu.
            function getHelpCost(type, level) {
                var entry = type && buildingHelpData.get()[type];
                return (entry && entry.levels && entry.levels[level]) || null;
            }

            // ============================================================
            // v2.07 : Parser des mouvements de troupes/flottes (conseiller militaire).
            // Remplace la fonction manquante (qui provoquait un ReferenceError et
            // interrompait le dispatcher). Lit les VRAIS temps d'arrivée fournis par
            // le jeu (réductions incluses) au lieu de les estimer par la formule de base.
            // ============================================================
            // Convertit "19m 50s" / "09h 28m" / "2j 03h" en millisecondes.
            function _impParseDurationMs(txt) {
                if (!txt) return null;
                var s = String(txt).replace(/\u00a0/g, ' ');
                var total = 0, found = false;
                var re = /(\d+)\s*([jhms])/gi, m;
                var mult = { j:86400000, h:3600000, m:60000, s:1000 };
                while ((m = re.exec(s)) !== null) {
                    var u = m[2].toLowerCase();
                    if (mult[u] != null) { total += parseInt(m[1], 10) * mult[u]; found = true; }
                }
                return found ? total : null;
            }

            // v2.32 : le temps restant affiché est arrondi (« 06h 33m » : à la minute, « 1j 16h » : à
            // l'heure). L'heure d'arrivée affichée à côté (« 15:37:58 ») est exacte : on la retient si
            // elle concorde avec l'estimation, à la précision du temps restant près.
            function _impRefineWithClock(estimate, cellTxt, remTxt) {
                var clocks = String(cellTxt || '').match(/\d{1,2}:\d{2}:\d{2}/g);
                if (!clocks || !isFinite(estimate)) return estimate;
                var hms = clocks[clocks.length - 1].split(':');
                var unit = /\d+\s*s/i.test(remTxt) ? 1000 : /\d+\s*m/i.test(remTxt) ? 60000 :
                           /\d+\s*h/i.test(remTxt) ? 3600000 : 86400000;
                var d = new Date(estimate);
                d.setHours(parseInt(hms[0], 10), parseInt(hms[1], 10), parseInt(hms[2], 10), 0);
                var best = null;
                for (var k = -1; k <= 1; k++) {
                    var c = d.getTime() + k * 86400000;
                    if (best === null || Math.abs(c - estimate) < Math.abs(best - estimate)) best = c;
                }
                return Math.abs(best - estimate) <= unit ? best : estimate;
            }

            function processMilitaryAdvisorView(templateData) {
                setTimeout(function parseMilitaryMovements() {
                    try {
                        // 1. Localiser le HTML du tableau des mouvements
                        var htmlStr = null;
                        if (templateData) {
                            var keys = ['js_MilitaryMovementsFleetMovementsTable',
                                        'militaryMovementsFleetMovementsTable',
                                        'js_MilitaryMovements'];
                            for (var k = 0; k < keys.length; k++) {
                                var e = templateData[keys[k]];
                                if (e) { htmlStr = (typeof e === 'string') ? e : (e.html || null); if (htmlStr) break; }
                            }
                        }
                        var $root;
                        if (htmlStr) $root = $('<div>').html(htmlStr);
                        else if ($('#js_MilitaryMovementsFleetMovementsTable').length) $root = $('#js_MilitaryMovementsFleetMovementsTable');
                        else return; // rien à parser (parse miss) -> ne rien casser

                        var missionMap = {
                            'transport':  Constants.Movements.Mission.TRANSPORT,
                            'deployarmy': Constants.Movements.Mission.DEPLOY_ARMY,
                            'deployfleet':Constants.Movements.Mission.DEPLOY_NAVY,
                            'plunder':    Constants.Movements.Mission.PLUNDER
                        };
                        var resClassMap = { wood:'wood', wine:'wine', marble:'marble', glass:'glass', sulfur:'sulfur' };

                        var parsed = [];
                        $root.find('table.military_event_table tr').each(function() {
                            try {
                                var $tr = $(this);
                                if ($tr.children('th').length) return;          // en-tête
                                var $mission = $tr.find('.mission_icon').first();
                                if (!$mission.length) return;

                                // eventId : depuis le lien "abort", sinon fleetInfoNNN
                                var eventId = null;
                                var abortHref = $tr.find('a.abort').attr('href') || '';
                                var mm = abortHref.match(/eventId=(\d+)/);
                                if (mm) eventId = parseInt(mm[1], 10);
                                if (!eventId) {
                                    var infoId = ($tr.find('[id^="fleetInfo"]').attr('id') || '');
                                    var mm2 = infoId.match(/fleetInfo(\d+)/);
                                    if (mm2) eventId = parseInt(mm2[1], 10);
                                }
                                if (!eventId) return;

                                // Mission
                                var mcls = ($mission.attr('class') || '').split(/\s+/);
                                var missionKey = null;
                                for (var c = 0; c < mcls.length; c++) { if (missionMap[mcls[c]]) { missionKey = mcls[c]; break; } }
                                if (!missionKey) return; // mission non gérée (trade, occupy, etc.)

                                // Temps d'arrivée RÉEL : 2e cellule, 1er span ("19m 50s")
                                var remTxt = $tr.children('td').eq(1).find('span').first().text();
                                var remMs = _impParseDurationMs(remTxt);
                                if (remMs == null) return;
                                var completion = _impRefineWithClock(View.gameTimeNow() + remMs,
                                                                     $tr.children('td').eq(1).text(), remTxt); // v2.32

                                // Origine / destination (cityId)
                                var oHref = $tr.find('td.source a').attr('href') || '';
                                var dHref = $tr.find('td.target a').attr('href') || '';
                                var oM = oHref.match(/cityId=(\d+)/), dM = dHref.match(/cityId=(\d+)/);
                                var originCityId = oM ? parseInt(oM[1], 10) : null;
                                var targetCityId = dM ? parseInt(dM[1], 10) : null;

                                // Cargaison par ressource
                                var resources = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                                $tr.find('.resource_icon').each(function() {
                                    var rc = ($(this).attr('class') || '').split(/\s+/), rname = null;
                                    for (var r = 0; r < rc.length; r++) { if (resClassMap[rc[r]]) { rname = resClassMap[rc[r]]; break; } }
                                    if (rname) {
                                        var amt = parseInt(($(this).attr('title') || '').replace(/[\u00a0\s]/g, '').replace(/[^0-9]/g, ''), 10) || 0;
                                        resources[rname] += amt;
                                    }
                                });

                                // v2.25 : étape du mouvement, lue à la flèche de la colonne centrale
                                // (classes du jeu, indépendantes de la langue)
                                var dirCls = String($tr.find('td.mission').first().attr('class') || '');
                                var stage;
                                if (/\barrow_left/.test(dirCls)) {
                                    stage = Constants.Movements.Stage.RETURNING;
                                } else if (/\barrow_right/.test(dirCls)) {
                                    stage = Constants.Movements.Stage.EN_ROUTE;
                                } else if ($tr.find('a.accLoading').length) {
                                    stage = Constants.Movements.Stage.LOADING;   // fin de chargement = completion
                                } else {
                                    stage = Constants.Movements.Stage.EN_ROUTE;  // cas inconnu : ancien comportement
                                }

                                // v2.25 : unités du mouvement (infobulle « Flotte / Unités / Cargaison »)
                                var rowUnits = {}, rowUnitsNb = 0;
                                $tr.find('.unit_detail_icon').each(function() {
                                    var uc = ($(this).attr('class') || '').split(/\s+/), utype = null;
                                    for (var u = 0; u < uc.length; u++) { if (Constants.UnitData[uc[u]]) { utype = uc[u]; break; } }
                                    if (!utype) return; // navires marchands, ressources
                                    var n = parseInt(String($(this).attr('title') || $(this).text()).replace(/[^0-9]/g, ''), 10);
                                    if (isFinite(n) && n > 0) { rowUnits[utype] = (rowUnits[utype] || 0) + n; rowUnitsNb++; }
                                });

                                parsed.push({
                                    eventId: eventId, mission: missionMap[missionKey], completion: completion,
                                    originCityId: originCityId, targetCityId: targetCityId, resources: resources,
                                    stage: stage, rowUnits: rowUnitsNb ? rowUnits : null
                                });
                            } catch(erRow) {
                                console.warn('[Imperator] processMilitaryAdvisorView : ligne ignorée', erRow);
                            }
                        });

                        // v2.16 : si le tableau du jeu est présent, la liste lue FAIT FOI
                        // (y compris vide) : tout mouvement absent est un reliquat.
                        var authoritative = $root.find('table.military_event_table').length > 0;
                        if (!parsed.length && !authoritative) return; // parse miss -> ne rien casser

                        var civ = getCivilizationData();
                        var changes = [];

                        function unitsCount(mv) {
                            var n = 0;
                            try { $.each(mv.getUnits().getCounts(), function(t, c) { n += c || 0; }); } catch (e) {}
                            return n;
                        }

                        // 2. Unités à conserver : le jeu ne les donne pas dans ce tableau.
                        //    Priorité : même mouvement réel déjà connu, sinon estimation locale
                        //    (id négatif) de même mission / origine / destination.
                        var known = {}, estimates = [];
                        $.each(civ.movements, function(id, mv) {
                            if (!mv) return;
                            if (mv.getId() < 0) estimates.push(mv); else known[String(mv.getId())] = mv;
                        });
                        function takeUnits(p) {
                            var k = known[String(p.eventId)];
                            if (k && unitsCount(k) > 0) return k.getUnits();
                            for (var i = 0; i < estimates.length; i++) {
                                var e = estimates[i];
                                if (e && e.getMission() === p.mission &&
                                    String(e.getOriginCityId()) === String(p.originCityId) &&
                                    String(e.getTargetCityId()) === String(p.targetCityId)) {
                                    estimates[i] = null; // une estimation ne sert qu'une fois
                                    return e.getUnits();
                                }
                            }
                            return new MilitaryUnits();
                        }
                        var unitsFor = {};
                        $.each(parsed, function(i, p) {
                            var fromEstimate = takeUnits(p); // consomme l'estimation locale correspondante
                            if (p.rowUnits) {                 // v2.25 : la ligne du jeu fait foi
                                var mu = new MilitaryUnits();
                                $.each(p.rowUnits, function(t, n) { mu._setCount(t, n); });
                                unitsFor[p.eventId] = mu;
                            } else {
                                unitsFor[p.eventId] = fromEstimate;
                            }
                        });

                        // 3. Retirer sans effet de bord : estimations locales (doublons) et,
                        //    si la liste fait foi, les mouvements réels qui n'y sont plus.
                        var seen = {};
                        $.each(parsed, function(i, p) { seen[String(p.eventId)] = true; });
                        var toDrop = [];
                        $.each(civ.movements, function(id, mv) {
                            if (!mv) { toDrop.push(id); return; }
                            var mid = mv.getId();
                            if (mid < 0) {
                                // Estimation : retirée si la liste fait foi, ou (ancien comportement) si transport
                                if (authoritative || mv.getMission() === Constants.Movements.Mission.TRANSPORT) toDrop.push(id);
                            } else if (authoritative && !seen[String(mid)]) {
                                toDrop.push(id);
                            }
                        });
                        $.each(toDrop, function(i, id) { civ._dropMovement(id, changes); });

                        // 4. Installer les mouvements réels (temps d'arrivée exact du jeu).
                        $.each(parsed, function(i, p) {
                            var mv = new Movement(
                                p.eventId, 'own', p.completion, p.mission,
                                p.stage || Constants.Movements.Stage.EN_ROUTE, // v2.25
                                p.originCityId, p.targetCityId,
                                0, unitsFor[p.eventId] || new MilitaryUnits(), p.resources, 0
                            );
                            civ._updateMovement(mv, changes);
                        });
                        if (toDrop.length) console.log('[Imperator] Conseiller militaire : ' + toDrop.length +
                                                       ' mouvement(s) obsolète(s) retiré(s), ' + parsed.length + ' lu(s)');

                        if (changes.length) raiseMovementsChanged(changes);
                        empireData.saveSoon(); // v2.35
                    } catch(e) {
                        console.warn('[Imperator] processMilitaryAdvisorView a échoué', e);
                    }
                }, 0);
            }

            // v2.37 : déclarée ici (c'était une variable globale implicite) ; la fonction est
            // installée par updateAndStartTracking.
            var updateCurrentCity = null;

            // v2.07 : rafraîchissement manuel des données financières + Sanctuaire.
            // Utilisé par le bouton "Mettre à jour" du Dashboard.
            function refreshFinancesAndShrine(onProgress, onDone) {
                var steps = [];

                // 1. Or/finances : d'abord relire le modèle (instantané, empire live)
                try {
                    var model = unsafeWindow.ikariam && unsafeWindow.ikariam.model;
                    var src = (model && model.headerData && model.headerData.income !== undefined)
                                ? model.headerData
                                : (model && model.income !== undefined ? model : null);
                    if (src) {
                        var toNum = function(v){ var n=(typeof v==='string')?parseFloat(v.replace(',','.')):v; return isFinite(n)?Math.round(n):undefined; };
                        var upd = { incomeUpdated: Date.now() };
                        if (src.income           !== undefined) upd.revenue    = toNum(src.income);
                        if (src.godGoldResult    !== undefined) upd.gods       = toNum(src.godGoldResult);
                        if (src.scientistsUpkeep !== undefined) upd.scientists = toNum(src.scientistsUpkeep);
                        if (src.upkeep           !== undefined) upd.upkeep      = -Math.abs(toNum(src.upkeep)||0);
                        var gM = toNum(src.gold);
                        if (gM && gM > 1000) { upd.current = gM; upd.currentUpdated = Date.now(); }
                        getCivilizationData()._updateGoldData(upd);
                        raiseGoldChanged();
                    }
                } catch(eM) {}

                // Helper : extraire le HTML de vue depuis un tableau ajax
                function extractViewHtml(ajaxArray) {
                    var html = null;
                    try {
                        Utils.iterateIkariamAjaxResponse(ajaxArray, function(i, name, data) {
                            if (name === Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                                if (data && data[1]) html = data[1];
                            } else if (!html && (name === Constants.IkariamAjaxResponseType.ADD_WINDOW ||
                                                 name === Constants.IkariamAjaxResponseType.CREATE_VIEW)) {
                                if (data && data[1]) html = data[1];
                            }
                        });
                    } catch(e) {}
                    return html;
                }

                // 2. Étapes de fetch arrière-plan (finances puis sanctuaire)
                var domain = View.getDomain();
                steps.push({
                    name: 'Finances',
                    url: 'https://' + domain + '/index.php?view=finances',
                    handler: function(ajaxArray) {
                        var html = extractViewHtml(ajaxArray);
                        if (html) processFinancesView(null, html);
                    }
                });

                // Sanctuaire : trouver une ville qui possède le bâtiment + sa position
                try {
                    var cities = getOwnCities();
                    var shrineCity = null, shrinePos = null;
                    for (var c = 0; c < cities.length; c++) {
                        var b = cities[c] && cities[c].getBuildingByType
                                  ? cities[c].getBuildingByType(Constants.Buildings.DIVINE_SANCTUARY) : null;
                        if (b) { shrineCity = cities[c]; shrinePos = (b.getPosition ? b.getPosition() : null); break; }
                    }
                    if (shrineCity) {
                        var sUrl = 'https://' + domain + '/index.php?view=shrineOfOlympus&cityId=' +
                                   shrineCity.getId() + '&activeTab=tabWorship' +
                                   (shrinePos != null ? '&position=' + shrinePos : '');
                        steps.push({
                            name: 'Sanctuaire',
                            url: sUrl,
                            handler: function(ajaxArray) {
                                var html = extractViewHtml(ajaxArray);
                                if (html) processShrineView(null, html);
                            }
                        });
                    }
                } catch(eS) {}

                // Exécution séquentielle des étapes
                var idx = 0;
                function nextStep() {
                    if (idx >= steps.length) {
                        setTimeout(function(){ raiseGoldChanged(); }, 300);
                        if (onDone) onDone(steps.length);
                        return;
                    }
                    var step = steps[idx];
                    if (onProgress) onProgress(idx + 1, steps.length, step.name);
                    idx++;
                    try {
                        Utils.backgroundFetchIkariamFullPage(step.url, function(response, ajaxArray) {
                            try { step.handler(ajaxArray || []); } catch(eh) {}
                            setTimeout(nextStep, 800);
                        });
                    } catch(eF) {
                        setTimeout(nextStep, 100);
                    }
                }
                nextStep();
            }

            function processPremiumView(data) {
                var civilizationData = getCivilizationData();
                var changes = [];

                civilizationData._updatePremiumFeature(changes,
                                                       Constants.PremiumFeatures.DOUBLED_SAFE_CAPACITY,
                                                       $('#js_buySafecapacityBonusActiveTime').hasClass('green'));
                civilizationData._updatePremiumFeature(changes,
                                                       Constants.PremiumFeatures.DOUBLED_STORAGE_CAPACITY,
                                                       $('#js_buyStoragecapacityBonusActiveTime').hasClass('green'));

                raiseCivilizationDataChanged(changes);
            }

            function updateEmpireDataFromGlobalData(data) {
                // Game time diff - garde uniquement si la valeur est valide
                var serverTime = data['time'] || data[1];
                if (serverTime && Number.isFinite(Number(serverTime))) {
                    View.setGameTimeDifference(
                        new Date().getTime() - serverTime * Constants.Time.MILLIS_PER_SECOND
                    );
                }

                // Récupérations (selon format reçu)
                var headerData     = data['headerData']     || data[10];

                var backgroundData = data['backgroundData'] || data[11];

                // Sécurité : si pas de data exploitable
                if (!data) {
                    return;
                }

                // S'assure qu'on a un headerData dans data
                if (!data.headerData && headerData) data.headerData = headerData;

                // Forcer un id si manquant
                if (data.headerData && typeof data.headerData.id === "undefined") {
                    var currentCity = null;
                    try { currentCity = View.getCurrentCity && View.getCurrentCity(); } catch (e) {}

                    if (currentCity && typeof currentCity.id !== "undefined") {
                        data.headerData.id = currentCity.id;
                    } else {
                        console.warn("Imperator: impossible de déterminer la ville courante pour UPDATE_GLOBAL_DATA");
                        return;
                    }
                }

                // On passe le bloc complet (data), pas headerData
                try {
                    updateCurrentCity(data, backgroundData, true);
                } catch (e) {
                    console.warn("Imperator: erreur dans updateCurrentCity, mise à jour ignorée :", e);
                }
            }

            function updateAndStartTracking() {
                // Process all known cities that show up in the dropdown.
                // Drop any cities that are no longer there.
                var cities = { };
                var cityOrder = [];


                // --- PATCH SAFE : updateCurrentCity (sans redeclare) ---

                updateCurrentCity = function (globalData, backgroundData, correctWineConsumption) {
                    try {
                        var currentCity = null;

                        try { currentCity = View.getCurrentCity && View.getCurrentCity(); } catch (e) {}
                        if (!currentCity || !globalData) return;

                        // Background update seulement si backgroundData exploitable
                        try {
                            var bgId = parseInt(backgroundData && backgroundData.id, 10);
                            var curId = (typeof currentCity.getId === "function") ? currentCity.getId() : currentCity.id;
                            curId = parseInt(curId, 10);

                            if (backgroundData
                                && View.viewIsCity && View.viewIsCity()
                                && Number.isFinite(bgId) && Number.isFinite(curId)
                                && bgId === curId
                                && typeof currentCity._updateFromBackgroundData === "function") {
                                currentCity._updateFromBackgroundData(backgroundData);
                            }
                        } catch (e) {}

                        // Global update : protégé
                        try {
                            if (typeof currentCity._updateFromGlobalData === "function") {
                                currentCity._updateFromGlobalData(globalData, correctWineConsumption);
                            }
                        } catch (e) {
                            console.warn("[Imperator][SAFE] updateCurrentCity: _updateFromGlobalData ignoré", e);
                        }

                    } catch (e) {
                        console.warn("[Imperator][SAFE] updateCurrentCity ignoré (no-crash):", e);
                    }
                };


                $.each(unsafeWindow.dataSetForView.relatedCityData,
                       function updateFromPage_Each(key, value) {
                    if (key.substring(0, 5) == "city_") {
                        var city = empireData.get().cities[value.id] ||
                            new City(value.id, value.relationship);
                        city.type = value.relationship;

                        city.name = value.name;
                        city.islandCoordinates = parseCoordinates(value.coords);
                        if (value.tradegood) {
                            city.tradeGoodType = TRADE_GOOD_LOOKUP[value.tradegood];
                        }

                        empireData.get().cities[city.id] = city;
                        cityOrder.push(city.id);

                        Logging.debug("City %s[%s]: %o", city.name, city.id, city);
                    }
                });

                empireData.get().cityOrder = cityOrder;

                var globalData = {
                    maxActionPoints: parseInt($('#js_GlobalMenu_maxActionPoints').text()),
                };
                updateCurrentCity($.extend(globalData, unsafeWindow.dataSetForView),
                                  unsafeWindow.ikariam.backgroundView.screen.data,
                                  true);

                // v2.35 : sauvegarde regroupée (écrite au plus tard 500 ms après, ou à la fermeture)
                empireData.saveSoon();

                // Capturer l'or depuis dataSetForView (disponible au chargement)
                try {
                    var dsv = unsafeWindow.dataSetForView || {};
                    var initGold = parseInt(dsv.currentGold) || parseInt(dsv.gold) ||
                                   parseInt(dsv.goldAmount) || parseInt(dsv.headerData && dsv.headerData.gold) || 0;
                    if (initGold > 0) {
                        // Réinitialiser les timestamps pour éviter de charger de vieilles données
                        getCivilizationData().goldData.incomeUpdated  = 0;
                        getCivilizationData().goldData.currentUpdated = 0;
                        getCivilizationData()._updateGoldData({ current: initGold, currentUpdated: Date.now() });
                        raiseGoldChanged();
                    } else {
                        // Pas d'or dans dataSetForView : invalider les données stales
                        getCivilizationData().goldData.currentUpdated = 0;
                        getCivilizationData().goldData.incomeUpdated  = 0;
                    }
                } catch(e) {}


                // Export Imperator Map data
                try {
                    var mapCities = [];
                    $.each(getOwnCities(), function(i, city) {
                        var coords = city.getIslandCoordinates();
                        mapCities.push({
                            id:       city.getId(),
                            name:     city.getName(),
                            cx:       coords ? coords[0] : 0,
                            cy:       coords ? coords[1] : 0,
                            type:     city.getTradeGoodType ? city.getTradeGoodType() : city.tradeGoodType,
                            pop:      city.population || 0,
                            sat:      city.happinessScore,
                            islandId: city.islandId
                        });
                    });
                    var mapMovements = [];
                    $.each(getCivilizationData().getMovements(), function(id, mv) {
                        mapMovements.push({
                            id:             mv.getId ? mv.getId() : id,
                            mission:        mv.getMission(),
                            originCityId:   mv.getOriginCityId ? mv.getOriginCityId() : mv.originCityId,
                            targetCityId:   mv.getTargetCityId ? mv.getTargetCityId() : mv.targetCityId,
                            completionTime: mv.getCompletionTime ? mv.getCompletionTime() : mv.completionTime,
                            transports:     mv.transports || 0
                        });
                    });
                    // v2.19 : la liste calculée fait foi (l'onglet Armée la tient à jour).
                    // L'ancien "préserver les mouvements existants" recopiait indéfiniment des reliquats.
                    var mapTargets = [];
                    try {
                        var espTargets = Espionage.getTargets();
                        $.each(espTargets, function(i, target) {
                            var coords = target.getIslandCoordinates ? target.getIslandCoordinates() : target.coords;
                            if (coords && (coords[0] || coords[1])) {
                                mapTargets.push({
                                    id:   target.getId ? target.getId() : target.id,
                                    name: target.getName ? target.getName() : target.name,
                                    cx:   coords[0],
                                    cy:   coords[1]
                                });
                            }
                        });
                    } catch(e2) {}
                    localStorage.setItem('imperatorMapData', JSON.stringify({
                        cities:    mapCities,
                        movements: mapMovements,
                        targets:   mapTargets,
                        timestamp: Date.now()
                    }));

                } catch(e) {
                    console.warn('[Imperator] export mapData échoué:', e);
                }

                // ================================
                // [PATCH] City.updateResources SAFE
                // Empêche le crash si globalData.population est absent

                // =====================
                // PATCH TABLEAU (SAFE)
                // =====================

                /**
                  * Récupère une cityId "fiable" depuis plusieurs sources possibles.
                 */
                function __imp_getAnyCityId(globalData, backgroundData) {
                    // 1) backgroundData.id (souvent présent)
                    try {
                        const id = parseInt(backgroundData && backgroundData.id, 10);
                        if (Number.isFinite(id)) return id;
                    } catch (e) {}

                    // 2) globalData.headerData.id
                    try {
                        const id = parseInt(globalData && globalData.headerData && globalData.headerData.id, 10);
                        if (Number.isFinite(id)) return id;
                    } catch (e) {}

                    // 3) Ikariam API
                    try {
                        const apiId = unsafeWindow.ikariam && typeof unsafeWindow.ikariam.getCurrentCityId === 'function'
                        ? parseInt(unsafeWindow.ikariam.getCurrentCityId(), 10)
                        : NaN;
                        if (Number.isFinite(apiId)) return apiId;
                    } catch (e) {}

                    // 4) URL
                    try {
                        const m = /(?:\?|&)(?:cityId|currentCityId)=(\d+)/.exec(String(location.href));
                        if (m) {
                            const id = parseInt(m[1], 10);
                            if (Number.isFinite(id)) return id;
                        }
                    } catch (e) {}

                    return null;
                }


                // patch tableau
                View.registerIkariamAjaxResponseCallback(
                    function updateEmpireDataFromAjaxResponse(response) {

                        var globalData = null;
                        var backgroundData = null;
                        var view = null;
                        var viewHtml = null;
                        var templateData = null;

                        Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {

                            if (name == Constants.IkariamAjaxResponseType.UPDATE_GLOBAL_DATA) {
                                globalData = data;

                            } else if (name == Constants.IkariamAjaxResponseType.UPDATE_BACKGROUND_DATA) {
                                backgroundData = data;

                            } else if (name == Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                                // data = [viewName, html]
                                view = data && data[0];
                                viewHtml = data && data[1];

                            } else if (name == Constants.IkariamAjaxResponseType.UPDATE_TEMPLATE_DATA) {
                                templateData = data;
                            } else if (name == Constants.IkariamAjaxResponseType.ADD_WINDOW ||
                                       name == Constants.IkariamAjaxResponseType.CREATE_VIEW) {
                                // Bilan peut arriver via ADD_WINDOW ou CREATE_VIEW
                                var awHtml = (data && data[1]) || '';
                                var awId   = (data && data[0]) || '';
                                if (!viewHtml && (awId === 'bilan' || awId === 'finances' ||
                                    (awHtml.indexOf('Montant') >= 0 && (awHtml.indexOf('Dieux') >= 0 || awHtml.indexOf('Pluton') >= 0)))) {
                                    viewHtml = awHtml;
                                    view     = awId || view;
                                }
                            }
                        });

                        // ==========================
                        // FIX CRITIQUE : headerData.id
                        // ==========================
                        if (globalData) {
                            // Assure headerData
                            if (!globalData.headerData) globalData.headerData = {};

                            // Injecte un id si absent (sinon ta MAJ est ignorée)
                            if (!globalData.headerData.id) {
                                const anyId = __imp_getAnyCityId(globalData, backgroundData);
                                if (Number.isFinite(anyId)) {
                                    globalData.headerData.id = anyId;
                                }
                            }

                            // IMPORTANT : updateEmpireDataFromGlobalData a besoin de backgroundData
                            // -> si ta version ne le prend pas en paramètre, elle lit souvent une variable externe.
                            // Ici on passe les 2 (et on garde le call compatible si la fonction n’a qu’1 param).
                            try {
                                if (updateEmpireDataFromGlobalData.length >= 2) {
                                    updateEmpireDataFromGlobalData(globalData, backgroundData);
                                } else {
                                    // fallback ancien : la fonction n'accepte qu'1 param
                                    // mais updateCurrentCity est maintenant blindé => pas de crash
                                    updateEmpireDataFromGlobalData(globalData);
                                }
                            } catch (e) {
                                console.warn('[Imperator][SAFE] updateEmpireDataFromGlobalData a échoué:', e);
                            }
                            // Capturer l'or actuel (priorité : dataSetForView > model > DOM)
                            setTimeout(function captureCurrentGold() {
                                try {
                                    var g = 0;
                                    // 1. dataSetForView (données serveur, le plus fiable)
                                    var dsv = unsafeWindow.dataSetForView || {};
                                    g = parseInt(dsv.currentGold)||parseInt(dsv.gold)||parseInt(dsv.goldAmount)||0;
                                    // 2. Modèle Ikariam
                                    if (!g) {
                                        var model = unsafeWindow.ikariam && unsafeWindow.ikariam.model;
                                        if (model) g = parseInt(model.currentGold)||parseInt(model.gold)||parseInt(model.goldAmount)||0;
                                    }
                                    // 3. DOM : seulement si la valeur dépasse 100k (sinon risque de bruit)
                                    if (!g) {
                                        var sels = ['#js_GlobalMenu_itemGoldValue','#goldValue','[id$="GoldValue"]'];
                                        for (var si=0; si<sels.length; si++) {
                                            var $el = $(sels[si]).first();
                                            if (!$el.length) continue;
                                            var raw = $el.text().replace(/[\u00a0\s]/g,'').replace(',','.');
                                            if (/[0-9.]+G/i.test(raw)) { g=Math.round(parseFloat(raw)*1e9); break; }
                                            if (/[0-9.]+M/i.test(raw)) { g=Math.round(parseFloat(raw)*1e6); break; }
                                            if (/[0-9.]+k/i.test(raw)) { g=Math.round(parseFloat(raw)*1e3); break; }
                                        }
                                    }
                                    // N'accepter que des valeurs > 1000 (éviter les faux positifs)
                                    if (g > 1000) { getCivilizationData()._updateGoldData({current:g,currentUpdated:Date.now()}); raiseGoldChanged(); }

                                    // === Imperator v2.07 : capter la décomposition financière depuis ikariam.model ===
                                    // Le modèle expose income / godGoldResult / scientistsUpkeep / upkeep
                                    // sur (presque) chaque page. On alimente goldData en live, sans ouvrir les Finances.
                                    try {
                                        var m2 = unsafeWindow.ikariam && unsafeWindow.ikariam.model;
                                        var src = (m2 && (m2.income !== undefined || (m2.headerData && m2.headerData.income !== undefined)))
                                                    ? m2 : (m2 && m2.headerData ? m2.headerData : null);
                                        // Préférer headerData (valeurs empire globales) si présent
                                        if (m2 && m2.headerData && m2.headerData.income !== undefined) src = m2.headerData;
                                        else if (m2 && m2.income !== undefined) src = m2;
                                        else src = null;

                                        if (src) {
                                            var incUpd = { incomeUpdated: Date.now() };
                                            var toNum = function(v){ var n = (typeof v === 'string') ? parseFloat(v.replace(',','.')) : v; return isFinite(n) ? Math.round(n) : undefined; };
                                            if (src.income           !== undefined) incUpd.revenue    = toNum(src.income);
                                            if (src.godGoldResult    !== undefined) incUpd.gods       = toNum(src.godGoldResult);
                                            if (src.scientistsUpkeep !== undefined) incUpd.scientists = toNum(src.scientistsUpkeep);
                                            if (src.upkeep           !== undefined) incUpd.upkeep      = -Math.abs(toNum(src.upkeep) || 0);
                                            // Or actuel plus précis si dispo dans le modèle
                                            var gModel = toNum(src.gold);
                                            if (gModel && gModel > 1000) { incUpd.current = gModel; incUpd.currentUpdated = Date.now(); }
                                            // N'appliquer que si au moins une composante a été lue
                                            if (incUpd.revenue !== undefined || incUpd.gods !== undefined ||
                                                incUpd.scientists !== undefined || incUpd.upkeep !== undefined) {
                                                getCivilizationData()._updateGoldData(incUpd); // net recalculé automatiquement
                                                raiseGoldChanged();
                                            }
                                        }
                                    } catch(eInc) { /* silencieux : ne jamais casser le flux */ }
                                    // === fin ajout v2.07 ===
                                } catch(e) {}
                            }, 400);
                        }

                        // ==========================
                        // ROUTAGE EXISTANT (inchangé)
                        // ==========================
                        if (view == Constants.View.CITY_MILITARY) {
                            processCityMilitaryView(templateData, viewHtml); // v2.17
                        } else if (view == Constants.View.RELATED_CITIES) {
                            processRelatedCitiesView(templateData);
                        } else if (view == Constants.View.ACADEMY) {
                            processAcademyView(templateData);
                        } else if (view == Constants.View.PALACE) {
                            processPalaceView(templateData);
                        } else if (view == Constants.View.TOWN_HALL) {
                            processTownHallView(templateData);
                        } else if (view == Constants.View.TEMPLE) {
                            processTempleView(templateData);
                        } else if (view == Constants.View.RESEARCH_ADVISOR) {
                            processResearchAdvisorView(templateData);
                        } else if (view == Constants.View.FINANCES || view == 'bilan' || view == 'finances') {
                            processFinancesView(templateData, viewHtml);
                        } else if (view == Constants.View.SHRINE_OF_OLYMPUS || view == 'shrineOfOlympus') {
                            processShrineView(templateData, viewHtml);
                        } else if (view == Constants.View.BARRACKS) {
                            processBarracksView(viewHtml, templateData);
                        } else if (view == Constants.View.SHIPYARD) {
                            processShipyardView(viewHtml, templateData);
                        } else if (view == Constants.View.MILITARY_ADVISOR) {
                            processMilitaryAdvisorView(templateData);
                        } else if (view == Constants.View.PREMIUM) {
                            processPremiumView(templateData);
                        } else if (view == 'buildingDetail') {
                            processBuildingDetailView(viewHtml); // v2.31 : aide des bâtiments
                        }

                        if (unsafeWindow.ikariam && unsafeWindow.ikariam.templateView) {
                            if (unsafeWindow.ikariam.templateView.id == Constants.View.RESEARCH_ADVISOR) {
                                processResearchAdvisorView(templateData);
                            }
                        }
                        // Détecter le Bilan depuis le contenu HTML (CHANGE_VIEW, ADD_WINDOW, CREATE_VIEW)
                        if (viewHtml && view !== Constants.View.FINANCES && view !== 'bilan' && view !== 'finances') {
                            if (viewHtml.indexOf('Montant') >= 0 && (viewHtml.indexOf('Dieux') >= 0 || viewHtml.indexOf('Pluton') >= 0)) {
                                processFinancesView(templateData, viewHtml);
                            }
                        }
                        // v2.07 : détecter le Sanctuaire divin depuis le HTML (repli si le routage direct rate)
                        if (viewHtml && view !== Constants.View.SHRINE_OF_OLYMPUS && view !== 'shrineOfOlympus') {
                            if (viewHtml.indexOf('js_godSelect') >= 0 || viewHtml.indexOf('gods worshiping') >= 0) {
                                processShrineView(templateData, viewHtml);
                            }
                        }
                        // v2.07 : capter le coût réel d'agrandissement (tout type de bâtiment).
                        // La fonction vérifie elle-même la présence du panneau (viewHtml ou DOM live).
                        processBuildingUpgradeView(viewHtml);
                        // parseBilanDomIfVisible appelé uniquement via createTemplateView hook

                        // v2.35 : sauvegarde regroupée (écrite au plus tard 500 ms après, ou à la fermeture)
                        empireData.saveSoon();
                    },
                    true
                );

                // fin patch Tableau


                View.registerAjaxFormSubmitCallback(
                    function ajaxHandlerCallFromFormEmpireDataUpdate(form) {
                        if (form.id == 'transport'  || form.id == 'transportForm') {
                            processTransportForm(form);
                        } else if (form.id == 'deploymentForm') {
                            processDeploymentForm(form);
                        } else if (form.id == 'plunderForm') {
                            processPlunderForm(form);
                        } else if (form.id == 'setScientists') {
                            processSetScientistsForm(form);
                        } else if (form.id == 'accelResearchForm') {
                            processExperimentForm(form); // v3.5
                        }
                    });
            }


            function updateMovements(callback) {
    var actionRequest = $('input[name="actionRequest"]').val() || '';
    Utils.backgroundFetchIkariamFullPage(
        'https://' + document.domain + '/index.php?view=militaryAdvisor&activeTab=militaryMovements&actionRequest=' + actionRequest + '&ajax=1',
        function updateMovementsCallback(response, ajaxArray) {
            Utils.iterateIkariamAjaxResponse(ajaxArray, function(index, name, data) {
                if (name == Constants.IkariamAjaxResponseType.UPDATE_TEMPLATE_DATA) {
                    processMilitaryAdvisorView(data);
                }
            });
            empireData.saveAsync();
            if (callback) callback(ajaxArray);
        },
        { method: 'GET' });
}

            function getDebugString(includePrivateData) {
                return JSON.stringify(empireData.get(), function debugStringify(name, value) {
                    if (name === 'name' || name === 'islandCoordinates') {
                        return undefined;
                    }
                    return value;
                });
            }

            function resetData() {
                empireData.reset();
            }

            var Espionage = function() {
                function Target(id) {
                    this._ikaToolsType = 'target';

                    if (id) {
                        this.id = id;

                        this.playerId = undefined;
                        this.allianceId = undefined;

                        this.townLevel = undefined;
                        this.wallLevel = undefined;
                        this.warehouseLevel = undefined;

                        this.islandId = undefined;
                        this.coords = undefined;

                        this.occupierId = undefined;
                        this.blockaderId = undefined;

                        this.tradeGoodType = undefined;

                        this.lastUpdateTime = 0;

                        this.military = new MilitaryUnits();
                        this.otherMilitary = new MilitaryUnits();
                        this.militaryLastSpyMessageId = 0;
                        this.militaryLastSpyTime = 0;

                        this.resources = {
                            wood: 0,
                            wine: 0,
                            marble: 0,
                            glass: 0,
                            sulfur: 0,

                            lastSpyMessageId: 0,
                            lastSpyTime: 0,
                        };

                        this.combats = {};
                    }
                }

                function combatComparer(combat1, combat2) {
                    return combat2.time - combat1.time;
                };

                $.extend(Target.prototype, {
                    getId: function getId() {
                        return this.id;
                    },
                    getName: function getName() {
                        return this.name;
                    },
                    getTownLevel: function getTownLevel() {
                        return this.townLevel;
                    },
                    getWallLevel: function getWallLevel() {
                        return this.wallLevel;
                    },
                    getIslandCoordinates: function getIslandCoordinates() {
                        return this.coords || [0, 0];
                    },
                    getIslandId: function getIslandId() {
                        return this.islandId;
                    },
                    getPlayer: function _getPlayer() {
                        return getPlayer(this.playerId);
                    },
                    getOccupier: function getOccupier() {
                        if (this.occupierId) {
                            return getPlayer(this.occupierId);
                        }
                        return null;
                    },
                    getBlockader: function getBlockader() {
                        if (this.blockaderId) {
                            return getPlayer(this.blockaderId);
                        }
                    },
                    getTradeGoodType: function getTradeGoodType() {
                        return this.tradeGoodType;
                    },
                    getMilitary: function getMilitary() {
                        return this.military;
                    },
                    getOtherMilitary: function getOtherMilitary() {
                        return this.otherMilitary;
                    },
                    hasResourceInfo: function hasResourceInfo() {
                        return this.resources.lastSpyMessageId > 0;
                    },
                    hasMilitaryInfo: function hasMilitaryInfo() {
                        return this.militaryLastSpyMessageId > 0;
                    },
                    getLootableResources: function getLootableResources(type) {
                        var available = this.resources[type];
                        $.each(this.getCombats(View.gameTimeNow() - this.resources.lastSpyTime),
                               function subtractCombatResources(index, combat) {
                            available -= combat.getLooted(type);
                        });
                        return Math.max(0, available -
                                        (this.getPlayer().isInactive() ?
                                         Constants.GamePlay.RESOURCE_PROTECTION_WAREHOUSE_INACTIVE :
                                         Constants.GamePlay.RESOURCE_PROTECTION_WAREHOUSE) * this.warehouseLevel -
                                        Constants.GamePlay.BASE_RESOURCE_PROTECTION);
                    },
                    getResourcesSpyTime: function getResourcesSpyTime() {
                        return this.resources.lastSpyTime;
                    },
                    getMilitarySpyTime: function getMilitarySpyTime() {
                        return this.militaryLastSpyTime;
                    },
                    getCombats: function getCombats(maxAge) {
                        var combats = [];
                        $.each(this.combats, function(index, combat) {
                            if (View.gameTimeNow() - combat.time <= maxAge) {
                                combats.push(combat);
                            }
                        });
                        combats.sort(combatComparer);
                        return combats;
                    },
                    remove: function remove() {
                        delete espionageData.get().targets[this.id];
                        espionageData.saveAsync();
                        raiseEspionageChanged({
                            type: 'targetRemoved',
                            targets: [this]
                        });
                    },

                    // v2.29 : plus de chargement de l'île en arrière-plan ; les données de la cible
                    // sont lues au passage sur son île (applyIslandToTargets) et dans sa vue ville
                    // (applyCityToTarget). Gardé pour les appels existants.
                    _refresh: function refresh(hasSpiesPresent, callback) {
                        callback();
                    },
                    _getOrAddCombat: function getOrAddCombat(id) {
                        var combat = this.combats[id];
                        if (!combat) {
                            combat = new Target.Combat(id);
                            this.combats[id] = combat;
                        }
                        return combat;
                    },
                });

                Target.Combat = function Target_Combat(id) {
                    this._ikaToolsType = 'targetCombat';

                    if (id) {
                        this.id = id;

                        this.type = undefined;
                        this.time = undefined;

                        this.resources = {
                            wood: 0,
                            wine: 0,
                            marble: 0,
                            glass: 0,
                            sulfur: 0,
                        };
                    }
                }

                $.extend(Target.Combat.prototype, {
                    getType: function getType() {
                        return this.type;
                    },
                    getTime: function getTime() {
                        return this.time;
                    },
                    getLooted: function getLooted(resourceType) {
                        return this.resources[resourceType];
                    },
                });

                function Player(id) {
                    this._ikaToolsType = 'player';

                    if (id) {
                        this.id = id;

                        this.name = null;
                        this.allianceId = null;
                        this.militaryScore = null;
                    }
                }

                $.extend(Player.prototype, {
                    _update: function update(name, state, allianceId, militaryScore) {
                        this.name = name;
                        if (state !== undefined) {
                            this.allianceId = allianceId;
                            this.militaryScore = militaryScore;
                            this.state = state;
                        }
                    },
                    getAlliance: function getAlliance() {
                        if (this.allianceId) {
                            return espionageData.get().alliances[this.allianceId];
                        } else {
                            return;
                        }
                    },
                    getName: function getName() {
                        return this.name;
                    },
                    getState: function getState() {
                        return this.state;
                    },
                    getMilitaryScore: function getMilitaryScore() {
                        return this.militaryScore;
                    },
                    isInactive: function isInactive() {
                        return this.state == Constants.PlayerState.INACTIVE;
                    },
                });

                function updateOrAddPlayer(id, name, state, allianceId, allianceName, militaryScore) {
                    var players = espionageData.get().players;
                    var player = players[id];
                    if (!player) {
                        player = new Player(id);
                        players[id] = player;
                    }
                    player._update(name, state, allianceId, militaryScore);
                    updateOrAddAlliance(allianceId, allianceName);
                }

                // v2.27 : met à jour les cibles d'espionnage présentes dans les données d'une île
                // (envoyées par le jeu à chaque affichage d'île). onlyTarget : limite à une cible.
                function _impArmyScore(data, playerId) {
                    var a = data.avatarScores && data.avatarScores[playerId];
                    var n = parseInt(String((a && a.army_score_main) || '0').replace(/[^0-9]/g, ''), 10);
                    return isFinite(n) ? n / 100 : 0;
                }
                function applyIslandToTargets(data, onlyTarget) {
                    var changed = [];
                    if (!data || !$.isArray(data.cities)) return changed;
                    var targets = espionageData.get().targets;
                    var players = espionageData.get().players;
                    $.each(data.cities, function(index, city) {
                        if (!city || (city.type && city.type !== 'city')) return;
                        var cid = parseInt(city.id);
                        var target = onlyTarget ? (onlyTarget.id == cid ? onlyTarget : null) : targets[cid];
                        if (!target) return;
                        var playerId = parseInt(city.ownerId);
                        if (!playerId) return;
                        if (target.playerId < 0 && target.playerId !== playerId) {
                            delete players[target.playerId]; // joueur provisoire (rapports d'espionnage)
                        }
                        target.name = city.name;
                        target.playerId = playerId;
                        target.townLevel = parseInt(city.level);
                        target.islandId = parseInt(data.islandId || data.id);
                        target.coords = [parseInt(data.xCoord), parseInt(data.yCoord)];
                        target.tradeGoodType = TRADE_GOOD_LOOKUP[data.tradegood];
                        updateOrAddPlayer(playerId, city.ownerName, city.state || '', parseInt(city.ownerAllyId) || 0,
                                          city.ownerAllyTag || '', _impArmyScore(data, playerId));
                        if (city.infos && city.infos['occupation']) {
                            target.occupierId = city.infos['occupation'].id;
                            updateOrAddPlayer(city.infos['occupation'].id, city.infos['occupation'].name);
                        } else {
                            target.occupierId = 0;
                        }
                        if (city.infos && city.infos['fleetAction']) {
                            target.blockaderId = city.infos['fleetAction'].id;
                            updateOrAddPlayer(city.infos['fleetAction'].id, city.infos['fleetAction'].name);
                        } else {
                            target.blockaderId = 0;
                        }
                        changed.push(target);
                    });
                    return changed;
                }

                // v2.29 : vue d'une ville espionnée (mêmes données que pour nos villes :
                // data.id = ville, data.position[i] = { building: 'type …', level })
                function applyCityToTarget(data) {
                    if (!data || data.cities || !data.position) return null;
                    var target = espionageData.get().targets[parseInt(data.id)];
                    if (!target) return null;
                    var wall = 0, warehouse = 0, seen = 0;
                    $.each(data.position, function(index, item) {
                        if (!item || typeof item.building !== 'string') return;
                        seen++;
                        var type = item.building.split(' ')[0];
                        var level = parseInt(item.level) || 0;
                        if (type == Constants.Buildings.WALL) wall = Math.max(wall, level);
                        else if (type == Constants.Buildings.WAREHOUSE) warehouse += level;
                    });
                    if (!seen) return null;
                    target.wallLevel = wall;
                    target.warehouseLevel = warehouse;
                    return target;
                }

                function Alliance(id) {
                    this._ikaToolsType = 'alliance';

                    if (id) {
                        this.id = id;
                        this.name = null;
                    }
                }

                $.extend(Alliance.prototype, {
                    _update: function update(name) {
                        this.name = name;
                    },
                    getName: function getName() {
                        return this.name;
                    },
                    getId: function getId() {
                        return this.id;
                    }
                });

                function updateOrAddAlliance(id, name) {
                    if (id) {
                        var alliances = espionageData.get().alliances;
                        var alliance = alliances[id];
                        if (!alliance) {
                            alliance = new Alliance(id);
                            alliances[id] = alliance;
                        }
                        alliance._update(name);
                    }
                }

                function getTargets() {
                    var targets = [];
                    $.each(espionageData.get().targets, function(index, target) {
                        targets.push(target);
                    });
                    return targets;
                }

                function getTarget(id) {
                    return espionageData.get().targets[id];
                }

                function getPlayer(id) {
                    return espionageData.get().players[id];
                }

                function getPlayers() {
                    return espionageData.get().players;
                }

                var espionageData = new Data.Value(
                    'espionageData',
                    {
                        targets: {},
                        alliances: {},
                        players: {},
                    },
                    {
                        reviver: function espionageDataReviver(key, value) {
                            if (value && value._ikaToolsType) {
                                var obj;

                                switch(value._ikaToolsType) {
                                    case 'target': obj = new Target(); break;
                                    case 'targetCombat': obj = new Target.Combat(); break;
                                    case 'player': obj = new Player(); break;
                                    case 'alliance': obj = new Alliance(); break;
                                    case 'militaryUnits': obj = new MilitaryUnits(); break;
                                }
                                $.extend(obj, value);
                                if (obj._postLoad) {
                                    obj._postLoad();
                                }
                                return obj;
                            }
                            return value;
                        },
                        version: 6,

                        loadCallback: function espionageDataLoaded() {
                        },
                    });

                var espionageChangedEvent = Utils.thunk(function() {
                    return new Utils.EventDispatcher();
                });

                function registerEspionageChangedHandler(callback) {
                    return espionageChangedEvent().addListener(callback);
                }

                function raiseEspionageChanged(changes) {
                    espionageChangedEvent().send(changes);
                }

                function startTracking() {
                    var messageIdRegex = /message(\d+)/
                    espionageData.load();

                    // v2.27 : à chaque île affichée, les cibles qui s'y trouvent sont mises à jour
                    View.registerIkariamAjaxResponseCallback(
                        function processIslandForTargets(response) {
                            try {
                                var bg = null;
                                Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                                    if (name == Constants.IkariamAjaxResponseType.UPDATE_BACKGROUND_DATA) {
                                        bg = data;
                                    } else if (name == Constants.IkariamAjaxResponseType.UPDATE_GLOBAL_DATA &&
                                               data && !bg) {
                                        bg = data['backgroundData'] || data[11] || null;
                                    }
                                });
                                var cityTarget = applyCityToTarget(bg);
                                if (cityTarget) {
                                    espionageData.saveAsync();
                                    raiseEspionageChanged({ type: 'targetsChanged', targets: [cityTarget] });
                                    console.log('[Imperator] Espionnage : ' + cityTarget.name + ' : mur ' +
                                                cityTarget.wallLevel + ', entrepôt ' + cityTarget.warehouseLevel);
                                }
                                var changed = applyIslandToTargets(bg);
                                if (changed.length) {
                                    espionageData.saveAsync();
                                    raiseEspionageChanged({ type: 'targetsChanged', targets: changed });
                                    console.log('[Imperator] Espionnage : ' + changed.length +
                                                ' cible(s) mise(s) à jour depuis l\'île', $.map(changed, function(t) {
                                                    var p = getPlayer(t.playerId), a = p && p.getAlliance();
                                                    return t.name + ' (' + (p ? p.getName() : '?') +
                                                           (a ? ', ' + a.getName() : '') + ')';
                                                }).join(', '));
                                }
                            } catch (e) {
                                console.warn('[Imperator] Lecture de l\'île pour l\'espionnage échouée', e);
                            }
                        }, true);

                    View.registerIkariamAjaxResponseCallback(
                        function processHideoutView(response) {
                            Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                                if (name == Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                                    if (data[0] == Constants.View.HIDEOUT) {
                                        var newTargets = [];
                                        $('#tabSafehouse li.city a').each(function(index, item) {
                                            var cityId = parseInt(Utils.parseUrlParams($(item).attr('href'))['cityId']);
                                            if (!cityId) return;
                                            // v2.34 : le jeu écrit « Polis (37:63) » ici (parenthèses), « [37:63] » ailleurs
                                            var coordMatch = $(item).text().match(/[\[(]\s*(\d+)\s*:\s*(\d+)\s*[\])]/);
                                            var t = getTarget(cityId);
                                            var isNew = !t;
                                            if (isNew) {
                                                t = new Target(cityId);
                                                t.name = $(item).text().trim().split(/[\[(]/)[0].trim();
                                                t.tradeGoodType = 'wood';
                                                t.islandId = 0;
                                                t.townLevel = 0;
                                                t.wallLevel = 0;
                                                t.warehouseLevel = 0;
                                                espionageData.get().targets[cityId] = t;
                                            }
                                            var changed = isNew;
                                            if (coordMatch && (!t.coords || !t.coords[0])) {
                                                t.coords = [parseInt(coordMatch[1]), parseInt(coordMatch[2])];
                                                changed = true;
                                            } else if (!t.coords) {
                                                t.coords = [0, 0];
                                            }
                                            // v2.34 : joueur et alliance, affichés dans la même fiche de la Cachette
                                            var $info = $(item).closest('div.spyinfo');
                                            var $user = $info.find('li.user a[href*="avatarProfile"]').first();
                                            var playerId = $user.length ?
                                                parseInt(Utils.parseUrlParams($user.attr('href'))['avatarId']) : 0;
                                            if (playerId) {
                                                var players = espionageData.get().players;
                                                if (t.playerId < 0 && t.playerId !== playerId) delete players[t.playerId];
                                                var $ally = $info.find('li.user a[href*="allyPage"]').first();
                                                var allyId = $ally.length ?
                                                    (parseInt(Utils.parseUrlParams($ally.attr('href'))['allyId']) || 0) : 0;
                                                var known = players[playerId];
                                                updateOrAddPlayer(playerId, $user.text().trim(),
                                                                  (known && known.getState()) || '', allyId,
                                                                  allyId ? $ally.text().trim() : '',
                                                                  known ? known.getMilitaryScore() : undefined);
                                                t.playerId = playerId;
                                                changed = true;
                                            }
                                            if (changed) newTargets.push(t);
                                        });
                                        if (newTargets.length > 0) {
                                            espionageData.saveAsync();
                                            raiseEspionageChanged({ type: 'targetsChanged', targets: newTargets });
                                        }

                                        setTimeout(function() {
                                            var reportHeaders = $(
                                                '#espionageReports tr.espionageReports, #espionageReports tr.espionageReportsalt');
                                            if (reportHeaders.length) {
                                                var changedTargets = [];
                                                reportHeaders.each(function(index, reportHeader) {
                                                    var success = $('td.resultImage img', reportHeader).attr('src') == '/cdn/all/both/buttons/yes.png';
                                                    var cityHref = $('td.targetCity a', reportHeader).attr('href');
                                                    if (!cityHref) return;
                                                    var cityId = parseInt(Utils.parseUrlParams(cityHref)['selectCity']);
                                                    if (!cityId) return;
                                                    var messageId = parseInt(reportHeader.id.match(messageIdRegex)[1]);
                                                    var tableMailMessage = $('#tbl_mail' + messageId);

                                                    var target = getTarget(cityId);
                                                    if (!target) {
                                                        target = new Target(cityId);
                                                        var coordMatch = $('td.targetCity a', reportHeader).text().match(/\[(\d+)\s*:\s*(\d+)\]/);
                                                        target.coords = coordMatch ? [parseInt(coordMatch[1]), parseInt(coordMatch[2])] : [0, 0];
                                                        target.name = $('td.targetCity a', reportHeader).text().trim().split('\n')[0].trim();
                                                        target.tradeGoodType = 'wood';
                                                        target.islandId = 0;
                                                        target.townLevel = 0;
                                                        target.wallLevel = 0;
                                                        target.warehouseLevel = 0;
                                                        espionageData.get().targets[cityId] = target;
                                                    }
                                                    var ownerName = $('td.targetOwner', reportHeader).text().trim();
                                                    if (ownerName && !target.playerId) {
                                                        var fakePlayerId = -cityId;
                                                        updateOrAddPlayer(fakePlayerId, ownerName, 'default', 0, '');
                                                        target.playerId = fakePlayerId;
                                                    }
                                                    if (!changedTargets.includes(target)) {
                                                        changedTargets.push(target);
                                                    }

                                                    if (success && target) {
                                                        if (tableMailMessage.find('table.resourcesTable').length &&
                                                            messageId > target.resources.lastSpyMessageId) {
                                                            var resourceTds = $('#tbl_mail' + messageId + ' td.count');
                                                            target.resources.wood   = parseInt(resourceTds.get(0).textContent.replace(',', ''));
                                                            target.resources.wine   = parseInt(resourceTds.get(1).textContent.replace(',', ''));
                                                            target.resources.marble = parseInt(resourceTds.get(2).textContent.replace(',', ''));
                                                            target.resources.glass  = parseInt(resourceTds.get(3).textContent.replace(',', ''));
                                                            target.resources.sulfur = parseInt(resourceTds.get(4).textContent.replace(',', ''));
                                                            target.resources.lastSpyMessageId = messageId;
                                                            target.resources.lastSpyTime =
                                                                Utils.parseIkariamTimestamp($('td.date', reportHeader).text()).getTime();
                                                            target._refresh(false, function() {
                                                                espionageData.saveAsync();
                                                                raiseEspionageChanged({
                                                                    type: 'targetsRefreshed',
                                                                    targets: [target],
                                                                });
                                                            });
                                                            changedTargets.push(target);
                                                        } else if ($('td.garrison', reportHeader).length &&
                                                                   messageId > target.militaryLastSpyMessageId &&
                                                                   tableMailMessage.find(' table.reportTable').length) {
                                                            readSpiedMilitary(target.getMilitary(),
                                                                              tableMailMessage.find('table.reportTable tr:nth-child(2) td.count'));
                                                            readSpiedMilitary(target.getOtherMilitary(),
                                                                              tableMailMessage.find('table.reportTable tr:nth-child(3) td.count'));
                                                            target.militaryLastSpyMessageId = messageId;
                                                            target.militaryLastSpyTime = Utils.parseIkariamTimestamp($('td.date', reportHeader).text()).getTime();
                                                            target._refresh(false, function() {
                                                                espionageData.saveAsync();
                                                                raiseEspionageChanged({
                                                                    type: 'targetsRefreshed',
                                                                    targets: [target],
                                                                });
                                                            });
                                                            changedTargets.push(target);
                                                        }
                                                    }
                                                });
                                                if (changedTargets.length) {
                                                    espionageData.saveAsync();
                                                    raiseEspionageChanged({
                                                        type: 'targetsChanged',
                                                        targets: changedTargets
                                                    });
                                                }
                                            }
                                        }, 500);
                                    } else if (data[0] == Constants.View.MILITARY_ADVISOR_REPORT) {
                                        var report = $('#troopsReport');
                                        var defender = report.find('.defender b:first a:first');
                                        if (defender.length) {
                                            var target = getTarget(parseInt(
                                                Utils.parseUrlParams(defender.attr('href'))['cityId']));
                                            if (target) {
                                                var header = report.find('.header');
                                                var result = report.find('div.result');
                                                var combatId = parseInt(Utils.parseUrlParams(
                                                    report.find('div p.link:first a.button:first',report).attr('href'))['detailedCombatId']);
                                                var combatTime = Utils.parseIkariamTimestamp(report.find('.header .date').text()).getTime();
                                                var type = report.find('.overview .fleet').length ?
                                                    Constants.CombatType.BLOCKADE : Constants.CombatType.PILLAGE;

                                                var combat = target._getOrAddCombat(combatId);
                                                combat.type = type;
                                                combat.time = combatTime;
                                                result.find('.resources li.value').each(function(index, item) {
                                                    var resourceInfo = $(item);
                                                    var src = resourceInfo.find('img').attr('src');
                                                    if (!src) return;
                                                    var srcMatch = src.match(/icon_([a-z]*)_small.png/);
                                                    if (!srcMatch) return;
                                                    var type = srcMatch[1];
                                                    if (type == 'crystal') {
                                                        type = Constants.Resources.GLASS;
                                                    }
                                                    var amount = parseInt(resourceInfo.text());
                                                    combat.resources[type] = amount;
                                                });

                                                target._refresh(false, function() {
                                                    espionageData.saveAsync();
                                                    raiseEspionageChanged({
                                                        type: 'targetsRefreshed',
                                                        targets: [target],
                                                    });
                                                });
                                            }

                                            espionageData.saveAsync();
                                            raiseEspionageChanged({
                                                type: 'combatUpdated',
                                                targets: [target],
                                            });
                                        }
                                    }
                                } else if (name == Constants.IkariamAjaxResponseType.BACKGROUND_DATA) {
                                }
                            });
                        }, true);
                }

                function readSpiedMilitary(military, unitTds) {
                    var baseArmyCount = true;
                    var baseNavyCount = true;
                    var navyOffset = 0;

                    if (unitTds.length == 14) { // army only
                        baseNavyCount = 0;
                    } else if (unitTds.length == 11) { // navy only
                        baseArmyCount = 0;
                        navyOffset = -14;
                    } else if (unitTds.length == 0) { // nothing
                        baseNavyCount = 0;
                        baseArmyCount = 0;
                    }
                    military._setCount(Constants.Military.HOPLITE, baseArmyCount && parseInt($(unitTds[0]).text()) || 0);
                    military._setCount(Constants.Military.STEAM_GIANT, baseArmyCount && parseInt($(unitTds[1]).text()) || 0);
                    military._setCount(Constants.Military.SPEARMAN, baseArmyCount && parseInt($(unitTds[2]).text()) || 0);
                    military._setCount(Constants.Military.SWORDSMAN, baseArmyCount && parseInt($(unitTds[3]).text()) || 0);
                    military._setCount(Constants.Military.SLINGER, baseArmyCount && parseInt($(unitTds[4]).text()) || 0);
                    military._setCount(Constants.Military.ARCHER, baseArmyCount && parseInt($(unitTds[5]).text()) || 0);
                    military._setCount(Constants.Military.GUNNER, baseArmyCount && parseInt($(unitTds[6]).text()) || 0);
                    military._setCount(Constants.Military.BATTERING_RAM, baseArmyCount && parseInt($(unitTds[7]).text()) || 0);
                    military._setCount(Constants.Military.CATAPULT, baseArmyCount && parseInt($(unitTds[8]).text()) || 0);
                    military._setCount(Constants.Military.MORTAR, baseArmyCount && parseInt($(unitTds[9]).text()) || 0);
                    military._setCount(Constants.Military.GYROCOPTER, baseArmyCount && parseInt($(unitTds[10]).text()) || 0);
                    military._setCount(Constants.Military.BALLOON_BOMBADIER, baseArmyCount && parseInt($(unitTds[11]).text()) || 0);
                    military._setCount(Constants.Military.COOK, baseArmyCount && parseInt($(unitTds[12]).text()) || 0);
                    military._setCount(Constants.Military.DOCTOR, baseArmyCount && parseInt($(unitTds[13]).text()) || 0);

                    military._setCount(Constants.Military.RAM_SHIP, parseInt(baseNavyCount && $(unitTds[16 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.FLAME_THROWER, parseInt(baseNavyCount && $(unitTds[14 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.STEAM_RAM, parseInt(baseNavyCount && $(unitTds[15 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.BALLISTA_SHIP, parseInt(baseNavyCount && $(unitTds[18 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.CATAPULT_SHIP, parseInt(baseNavyCount && $(unitTds[17 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.MORTAR_SHIP, parseInt(baseNavyCount && $(unitTds[19 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.SUBMARINE, parseInt(baseNavyCount && $(unitTds[21 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.PADDLE_SPEED_SHIP, parseInt(baseNavyCount && $(unitTds[22 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.BALLOON_CARRIER, parseInt(baseNavyCount && $(unitTds[23 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.TENDER, parseInt(baseNavyCount && $(unitTds[24 + navyOffset]).text()) || 0);
                    military._setCount(Constants.Military.ROCKET_SHIP, parseInt(baseNavyCount && $(unitTds[20 + navyOffset]).text()) || 0);
                }

                function getDebugString(includePrivateData) {
                    return JSON.stringify(espionageData.get(), function debugStringify(name, value) {
                        if (name === 'name' || name === 'coordinates') {
                            return undefined;
                        }
                        return value;
                    });
                }

                function resetData() {
                    espionageData.reset();
                }

                return {
                    startTracking: startTracking,
                    registerEspionageChangedHandler: registerEspionageChangedHandler,
                    getTargets: getTargets,
                    getPlayers: getPlayers,

                    getDebugString: getDebugString,
                    resetData: resetData,
                };
            }();

            return {
                updateAndStartTracking: Logging.debuggable(
                    { label: 'IkaTools.EmpireData.updateAndStartTracking', alwaysTime: true },
                    updateAndStartTracking),
                updateMovements: updateMovements,

                calculateTravelTime: calculateTravelTime,

                getCities: getCities,
                getOwnCities: getOwnCities,
                getCivilizationData: getCivilizationData,
                getCity: getCity,

                getDebugString: getDebugString,
                resetData: resetData,

                registerCivilizationDataChangedHandler: registerCivilizationDataChangedHandler,
                registerResourcesChangedHandler: registerResourcesChangedHandler,
                raiseResourcesChanged: raiseResourcesChanged,
                registerBuildingsChangedHandler: registerBuildingsChangedHandler,
                registerMilitaryChangedHandler: registerMilitaryChangedHandler,
                registerMovementsChangedHandler: registerMovementsChangedHandler,
                registerGoldChangedHandler: registerGoldChangedHandler,
                registerShrineChangedHandler: registerShrineChangedHandler, // v2.12
                refreshFinancesAndShrine: refreshFinancesAndShrine, // v2.07

                Espionage:Espionage,
            };
        }();

        function processAnchor() {
    var anchor = window.location.hash;
    if (anchor == '#ikaScriptToolsSuppressCityPreselect') {
        document.location.hash = '';
        View.suppressFirstChangeViewOfType('cityDetails');
    }
    if (anchor.substring(0, 35) == '#ikaScriptToolsLoadLocalIkariamUrl=') {
        var url = decodeURIComponent(anchor.substring(35));
        document.location.hash = '';
        View.suppressFirstChangeViewOfType('cityDetails'); // ← AVANT, inconditionnel
        IkaTools.View.loadLocalIkariamUrl(url);
    } else if (anchor.substring(0, 62) ==
               '#ikaScriptToolsLoadLocalIkariamUrl_DoNotSuppressFirstCityInfo=') {
        url = decodeURIComponent(anchor.substring(62));
        document.location.hash = '';
        IkaTools.View.loadLocalIkariamUrl(url);
    }
}

        function initialize(options) {
            processAnchor();
            $(window).bind('hashchange', processAnchor);
            options = $.extend({ trackData: true }, options);
            View.setGameTimeDifference(new Date().getTime() -
                                       unsafeWindow.ikariam.model.requestTime * Constants.Time.MILLIS_PER_SECOND -
                                       Constants.Time.INITIAL_PAGE_LOAD_DELTA);
            if (options.trackData) {
                IkaTools.EmpireData.updateAndStartTracking();
            }
        }

        return {
            Logging: Logging,
            Utils: Utils,
            View: View,
            Data: Data,
            Intl: Intl,
            EmpireData: EmpireData,
            Constants: Constants,
            UI: UI,
            Settings: Settings,

            initialize: initialize,
            processAnchor: processAnchor,
        };
    })();
}


// --- Wrapper auto de updateAndStartTracking ---
(function waitForEmpireDataWrapper() {
    try {
        if (window.IkaTools &&
            IkaTools.EmpireData &&
            typeof IkaTools.EmpireData.updateAndStartTracking === 'function' &&
            !IkaTools.EmpireData.__imperatorWrapped) {

            var orig = IkaTools.EmpireData.updateAndStartTracking;

            IkaTools.EmpireData.updateAndStartTracking = function() {
                try {
                    return orig.apply(this, arguments);
                } catch (e) {
                    console.warn('Imperator wrapper: updateAndStartTracking a échoué :', e);
                }
            };

            IkaTools.EmpireData.__imperatorWrapped = true;
            return;
        }
    } catch (e) {
        console.warn('Imperator wrapper: erreur dans waitForEmpireDataWrapper', e);
    }

    // Si on n’a pas encore accès à la fonction, on réessaie dans 500 ms
    setTimeout(waitForEmpireDataWrapper, 500);
})();
// --- Fin wrapper updateAndStartTracking ---

$.extend(String.prototype, {
    format: function() {
        var pattern = /%s/g

        return function format() {
            var args = arguments;
            var itemIndex = 0;
            var str = this.replace(pattern, function replacer(match, key) {
                return args[itemIndex++];
            });
            return str;
        }
    }(),
    format2: function() {
        var pattern = /%{([a-zA-Z_0-9]+)}/g

        return function format2(args) {
            var str = this.replace(pattern, function replacer(match, key) {
                return args[key];
            });
            return str;
        }
    }(),
});

var Imperator = function Imperator() {
    var localizations = {
        en: {
            misc: {
                resource_overview: 'Resource Overview',
                buildings_overview: 'Buildings Overview',
                military_overview: 'Military Overview',
                espionage_overview: 'Espionage Overview',
                alert_history: 'Alerts', // v3.1
                alert_history_title: 'Alert history (last 50)',
                alert_history_empty: 'No alert yet.',
                alert_history_clear: 'Clear',
                alert_history_not_shown: 'This alert could not be shown on the desktop.',

                upkeep: "Upkeep",
                growth: "Growth",
                trade_good: "Trade Good",
                city_name: "City",
                action_points: "Action Points",
                actions: "Actions",
                research: "Research",
                building_spots: "Building Spots",

                constructing: "Constructing",
                summary: "Summary:",

                population: "Population",
                population_growth: "Growth",

                resources: 'Resources',
                buildings: 'Buildings',
                military: 'Military',
                espionage: 'Espionage',
                dashboard: 'Dashboard',

                resource_overview: 'Resources Overview',
                buildings_overview: 'Buildings Overview',
                military_overview: 'Military Overview',

                resource_cost: 'Cost',
                next_level_cost: 'Next Level Cost',
                missing: 'Missing',

                full: 'Full',
                time_to_full: 'To Full',
                time_to_empty: 'To Empty',

                maximum_capacity: 'Capacity',
                safe_capacity: 'Safe',
                employed: 'Employed',

                // v3.2 : colonne Recherche
                rs_scientists: 'Scientists',
                rs_free: 'Free places',
                rs_academy_level: 'Academy level %s',
                rs_direct_cost: 'Direct cost',
                rs_lost_tax: 'Lost taxes',
                rs_total_cost: 'Total cost',
                rs_city_gold_net: 'City net gold',
                rs_gold_per_point: 'Gold per research point',
                rs_read_ago: 'Read %s ago',
                rs_never_read: 'Academy not visited yet',
                rs_empire_gold_negative: 'Empire gold balance is negative',
                rs_per_hour: '/h',
                rs_xp: 'Experiment',
                rs_xp_ready: 'possible',
                rs_xp_scroll: 'possible with Athena\'s scroll',
                rs_xp_cooldown: 'lab ready in %s',
                rs_xp_crystal: 'crystal %s / %s',
                rs_xp_noscroll: 'no Athena\'s scroll (crystal %s / %s)',
                rs_xp_header: 'Experiments possible: %s, with scroll: %s',
                rs_xp_eta_scroll: 'orange in ~%s',
                rs_xp_eta_ready: 'green in ~%s',
                rs_days: '%s d',
                rs_points: 'Research points',
                rs_next: '%s: %s points missing, ~%s (or %s experiments)',
                rs_next_ready: '%s: enough points',
                rs_advisor_age: 'Research advisor read %s ago',
                rs_advisor_never: 'Open the research advisor to estimate the next research',

                satisfaction: 'Satisfaction',
                tavern_wine_serving_level: 'Tavern Level',
                cultural_goods: 'Cultural Goods',

                units: 'Units',
                training: 'Training',
                deploying: 'Deploying',
                plundering: 'Plundering',

                in_transit: 'Transporting',
                none: 'None',
            },
            tweaks: {
                transport_minus_500: '-',
                transport_plus_500: '+500',
                transport_plus_1000: '+1k',
                transport_plus_5000: '+5k',

                transport_minus_500_text: 'Remove 500 goods',
                transport_plus_500_text: 'Add 500 goods',
                transport_plus_1000_text: 'Add 1000 goods',
                transport_plus_5000_text: 'Add 5000 goods',

                donate_plus_1000: '+1k',
                donate_plus_10000: '+10k',
                donate_plus_100000: '+100k',

                donate_plus_1000_text: 'Add 1000 wood to donation',
                donate_plus_10000_text: 'Add 10000 wood to donation',
                donate_plus_100000_text: 'Add 100000 wood to donation',

                completely_demolish_building_prompt: 'Do you want to completely demolish this building?',
                destroy_non_mobile_colony_prompt:
                'Demolition of non-mobile colony blocked by "Ikariam Imperator"!  If you really ' +
                'want to demolish this town, first turn off the protection option in ' +
                '"Ikariam Imperator" options.',
            },
            actions: {
                deploy_army: 'Deploy Army',
                deploy_navy: 'Deploy Navy',
                transport_goods: 'Transport Goods',
                to_town_hall: 'To Town Hall',
                to_city_view: 'View City',
                to_island_view: 'View Island',
                to_barracks: 'To Barracks',
                to_shipyard: 'To Shipyard',
                spy_mission: 'Spy Mission',
                blockade: 'Blockade',
                pillage: 'Pillage',
                occupy: 'Occupy',
                send_spy: 'Send Spy',
                view_high_score: 'View Score',
                view_alliance_page: 'View Alliance Page',
            },
            resources: {
                wood: 'Wood',
                wine: 'Wine',
                marble: 'Marble',
                glass: 'Crystal',
                sulfur: 'Sulfur',
            },
            buildings: {
                townHall: 'Town Hall',
                palace: 'Palace',
                palaceColony: 'Governor\'s Residence',
                tavern: 'Tavern',
                museum: 'Museum',
                academy: 'Academy',
                workshop: 'Workshop',
                temple: 'Temple',
                embassy: 'Embassy',
                warehouse: 'Warehouse',
                dump: 'Dump',
                port: 'Trading Port',
                branchOffice: 'Trading Post',
                blackMarket: 'Black Market',
                marineChartArchive: 'Sea Chart Archive',
                wall: 'Wall',
                safehouse: 'Hideout',
                barracks: 'Barracks',
                shipyard: 'Shipyard',
                pirateFortress: 'Pirate Fortress',
                forester: 'Forester',
                carpentering: 'Carpenter',
                winegrower: 'Winegrower',
                vineyard: 'Wine Press',
                stonemason: 'Stonemason',
                architect: 'Architect',
                glassblowing: 'Glassblower',
                optician: 'Optician',
                alchemist: 'Alchemist\'s Tower',
                fireworker: 'Firework Test Area',
                shrineOfOlympus: 'Shrine Of Olympus',// 👈 AJOUT
                dockyard: 'Dockyard',// 👈 AJOUT
                chronosForge: 'Chronos\'s Forge'// 👈 AJOUT
            },
            units: {
                phalanx: 'Hoplite',
                steamgiant: 'Steam Giant',
                spartan: 'Spartan',
                spearman: 'Spearman',
                swordsman: 'Swordsman',
                slinger: 'Slinger',
                archer: 'Archer',
                marksman: 'Sulphur Carabineer',
                ram: 'Ram',
                catapult: 'Catapult',
                mortar: 'Mortar',
                gyrocopter: 'Gyrocopter',
                bombardier: 'Balloon-Bombadier',
                cook: 'Cook',
                medic: 'Doctor',

                ship_ram: 'Ram Ship',
                ship_flamethrower: 'Fire Ship',
                ship_steamboat: 'Steam Ram',
                ship_ballista: 'Ballista Ship',
                ship_catapult: 'Catapult Ship',
                ship_mortar: 'Mortar Ship',
                ship_submarine: 'Diving Boat',
                ship_paddlespeedship: 'Paddle Speedboat',
                ship_ballooncarrier: 'Balloon Carrier',
                ship_tender: 'Tender',
                ship_rocketship: 'Rocker Ship',
            },
            alerts: {
                building_upgrade_complete: 'Building upgrade complete',
                building_upgrade_complete_text: '%{building} in %{city} upgraded to level %{level}',

                mission_update: 'Mission update',

                loading: '%{type} has finished loading in %{city}',
                en_route: '%{type} has arrived in %{city}',
                returning: '%{type} has returned to %{city}',

                deployarmy: 'Army deployment',
                deploynavy: 'Navy deployment',
                plunder: 'Pillage',
                transport: 'Transport',
            },
            espionage: {
                player: 'Player',
                townhall_level: 'Town Hall Level',
                wall_level: 'Wall Level',
                travel_time: 'Travel Time',
                resources_lootable: 'Lootable',
                on_vacation: 'On vacation',
                resources_looted: 'Looted',
                combats: 'Combats',
                military_score: 'Military Score',
                location: 'Location',
                view_island: 'View Island',
                occupied_by: 'Occupied by',
                blockaded_by: 'Blockaded by',
                time_since: 'Time Since',
                remove_target: 'Remove Target',
            },
            settings: {
                general: 'General',
                language: 'Language',

                overviews: 'Overviews',

                tweaks: 'Tweaks',
                auto_accept_daily_bonus: 'Automatically submit daily bonus form',
                hide_ads: 'Hide ads',
                hide_facebook: 'Hide facebook button',
                hide_friends_bar: 'Hide friends bar',
                hide_chat: 'Hide chat',
                transport_buttons: 'Add transport buttons: -500, +500, +1k, +5k',
                donation_buttons: 'Add donation buttons: +1k, +10k, +100k',
                show_city_owners: 'Show city owner next to city name (island view)',
                prevent_accidental_colony_destruction: 'Prevent destruction of non-mobile colonies',
                initialize_colonization_missions_for_pirate_raiding:
                'Initialize colonization missions with wood and marble to build level 1 pirate fortress and use max draft speed',

                alerts: 'Alerts',
                do_test: 'Test',
                test_desktop_alert: 'Test desktop notification',
                test_desktop_alert_title: 'Test notification',
                test_desktop_alert_text: 'Successful notification!  Click to dismiss.',
                desktop_alerts_not_supported: 'Notification failed: check that Tampermonkey allows GM_notification for this script and that the browser may show notifications.',

                building_completion_alert_desktop: 'Desktop notification: building upgrade complete',
                transport_loaded_alert_desktop: 'Desktop notification: transport mission loaded',
                transport_arrived_alert_desktop: 'Desktop notification: transport mission arrived',
                transport_returned_alert_desktop: 'Desktop notification: transport mission returned',
                deploy_army_loaded_alert_desktop: 'Desktop notification: deploy army loaded',
                deploy_army_arrived_alert_desktop: 'Desktop notification: deploy army arrived',
                deploy_army_returned_alert_desktop: 'Desktop notification: deploy army returned',
                deploy_navy_arrived_alert_desktop: 'Desktop notification: deploy navy arrived',
                deploy_navy_returned_alert_desktop: 'Desktop notification: deploy navy returned',
                pillage_loaded_alert_desktop: 'Desktop notification: pillage loaded',
                pillage_arrived_alert_desktop: 'Desktop notification: pillage arrived',
                pillage_returned_alert_desktop: 'Desktop notification: pillage returned',

                debug: 'Debug',
            },
        },
        fr: {
            misc: {
                resource_overview: 'Vue générale des Ressources',
                buildings_overview: 'Vue générale des Bâtiments',
                military_overview: 'Vue générale des Troupes',
                espionage_overview: 'Vue générale de l\'espionnage',
                alert_history: 'Alertes', // v3.1
                alert_history_title: 'Historique des alertes (50 dernières)',
                alert_history_empty: 'Aucune alerte pour l\'instant.',
                alert_history_clear: 'Vider',
                alert_history_not_shown: 'Cette alerte n\'a pas pu s\'afficher sur le bureau.',

                upkeep: "Entretien",
                growth: "Croissance",
                trade_good: "Ressource de luxe",
                city_name: "Cité",
                action_points: "Points d'Action",
                actions: "Actions",
                research: "Recherche",
                building_spots: "Emplacement de Construction",

                constructing: "En cours de construction",
                summary: "Résumé:",

                population: "Population",
                population_growth: "Croissance",

                resources: 'Ressources',
                buildings: 'Bâtiments',
                military: 'Armée',
                espionage: 'Espionnage',
                dashboard: 'Tableau de bord',

                resource_overview: 'Vue générale des Ressources',
                buildings_overview: 'Vue générale des Bâtiments',
                military_overview: 'Vue générale des Troupes',

                resource_cost: 'Coût',
                next_level_cost: 'Coût du prochain niveau',
                missing: 'Manquant',

                full: 'Plein',
                time_to_full: 'Jusqu\'au maximum',
                time_to_empty: 'Jusqu\'au minimum',

                maximum_capacity: 'Capacité',
                safe_capacity: 'Sécurisé',
                employed: 'Utilisé',

                // v3.2 : colonne Recherche
                rs_scientists: 'Chercheurs',
                rs_free: 'Places libres',
                rs_academy_level: 'Académie niveau %s',
                rs_direct_cost: 'Coût direct',
                rs_lost_tax: 'Manque à gagner',
                rs_total_cost: 'Coût total',
                rs_city_gold_net: 'Or net de la ville',
                rs_gold_per_point: 'Or par point de recherche',
                rs_read_ago: 'Relevé il y a %s',
                rs_never_read: 'Académie pas encore visitée',
                rs_empire_gold_negative: 'Solde d\'or de l\'empire négatif',
                rs_per_hour: '/h',
                rs_xp: 'Expérience',
                rs_xp_ready: 'possible',
                rs_xp_scroll: 'possible avec le parchemin d\'Athéna',
                rs_xp_cooldown: 'labo prêt dans %s',
                rs_xp_crystal: 'cristal %s / %s',
                rs_xp_noscroll: 'pas de parchemin d\'Athéna (cristal %s / %s)',
                rs_xp_header: 'Expériences possibles : %s, avec parchemin : %s',
                rs_xp_eta_scroll: 'orange dans ~%s',
                rs_xp_eta_ready: 'vert dans ~%s',
                rs_days: '%s j',
                rs_points: 'Points de recherche',
                rs_next: '%s : %s points manquants, ~%s (ou %s expériences)',
                rs_next_ready: '%s : points suffisants',
                rs_advisor_age: 'Conseiller en recherches lu il y a %s',
                rs_advisor_never: 'Ouvrir le conseiller en recherches pour estimer la prochaine recherche',

                satisfaction: 'Satisfaction',
                tavern_wine_serving_level: 'Niveau de la Taverne',
                cultural_goods: 'Biens Culturels',

                units: 'Unités',
                training: 'Formation',
                deploying: 'Déploiement',
                plundering: 'Pillage',

                in_transit: 'En transit',
                none: 'Aucune',
            },
            tweaks: {
                transport_minus_500: '-',
                transport_plus_500: '+500',
                transport_plus_1000: '+1k',
                transport_plus_5000: '+5k',

                transport_minus_500_text: 'Enlever 500 unités',
                transport_plus_500_text: 'Ajouter 500 unités',
                transport_plus_1000_text: 'Ajouter 1000 unités',
                transport_plus_5000_text: 'Ajouter 5000 unités',

                donate_plus_1000: '+1k',
                donate_plus_10000: '+10k',
                donate_plus_100000: '+100k',

                donate_plus_1000_text: 'Ajouter 1000 unités de bois en donation',
                donate_plus_10000_text: 'Ajouter 10000 unités de bois en donation',
                donate_plus_100000_text: 'Ajouter 100000 unités de bois en donation',

                completely_demolish_building_prompt: 'Voulez-vous démolir complètement ce bâtiment ?',
                destroy_non_mobile_colony_prompt:
                'Démolition d\'une colonie non mobile bloquée par « Ikariam Imperator » ! Si vous voulez ' +
                'vraiment démolir cette ville, désactivez d\'abord l\'option de protection dans ' +
                'les options d\'« Ikariam Imperator ».',
            },
            actions: {
                deploy_army: 'Déployer Troupes',
                deploy_navy: 'Déployer Flottes',
                transport_goods: 'Transporter des Marchandises',
                to_town_hall: 'Montrer l\'Hôtel de Ville',
                to_city_view: 'Montrer la Ville',
                to_barracks: 'Montrer la Caserne',
                to_shipyard: 'Montrer le Chantier Naval',
                to_island_view: 'Voir l\'île',
                spy_mission: 'Mission d\'espionnage',
                blockade: 'Blocus',
                pillage: 'Piller',
                occupy: 'Occuper',
                send_spy: 'Envoyer un espion',
                view_high_score: 'Voir le classement',
                view_alliance_page: 'Voir la page de l\'alliance',
            },
            resources: {
                wood: 'Bois',
                wine: 'Vin',
                marble: 'Marbre',
                glass: 'Cristal',
                sulfur: 'Soufre',
            },
            buildings: {
                townHall: 'Hôtel de Ville',
                palace: 'Palais',
                palaceColony: 'Résidence du Gouverneur',
                tavern: 'Taverne',
                museum: 'Musée',
                academy: 'Académie',
                workshop: 'Atelier',
                temple: 'Temple',
                embassy: 'Ambassade',
                warehouse: 'Entrepôt',
                dump: 'Dépôt',
                port: 'Port commercial',
                branchOffice: 'Comptoir',
                blackMarket: 'Marché noir',
                marineChartArchive: 'Archive Carte Marine',
                wall: 'Mur d\'enceinte',
                safehouse: 'Cachette',
                barracks: 'Caserne',
                shipyard: 'Chantier naval',
                forester: 'Maison Forestière',
                carpentering: 'Menuisier',
                winegrower: 'Pressoir à vin',
                vineyard: 'Cave à vin',
                stonemason: 'Tailleur de pierres',
                architect: 'Bureau de l\'architecte',
                glassblowing: 'Verrier',
                optician: 'Opticien',
                alchemist: 'Tour des alchimistes',
                fireworker: 'Zone de test des artificiers',
                chronosForge: 'Forge de Chronos',// 👈 AJOUT
                shrineOfOlympus: 'Sanctuaire divin',
                dockyard: 'Port de marchandises',
                pirateFortress: 'Forteresse pirate',
            },
            units: {
                phalanx: 'Phalange',
                steamgiant: 'Géant à vapeur',
                spartan: 'Spartiate',
                spearman: 'Lancier',
                swordsman: 'Epéiste',
                slinger: 'Lance-pierre',
                archer: 'Archer',
                marksman: 'Tireur d\'élite',
                ram: 'Bélier',
                catapult: 'Catapulte',
                mortar: 'Mortier',
                gyrocopter: 'Gyrocoptère',
                bombardier: 'Bombardier',
                cook: 'Cuisinier',
                medic: 'Médecin',

                ship_ram: 'Bateau bélier',
                ship_flamethrower: 'Lance-flammes',
                ship_steamboat: 'Bélier à vapeur',
                ship_ballista: 'Bateau Baliste',
                ship_catapult: 'Bateau à catapulte',
                ship_mortar: 'Bateau à mortier',
                ship_submarine: 'Bateau de plongée',
                ship_paddlespeedship: 'Bateau rapide à aubes',
                ship_ballooncarrier: 'Porte-ballons',
                ship_tender: 'Bateau de soutien',
                ship_rocketship: 'Bateau lance-missiles',
            },
            alerts: {
                building_upgrade_complete: 'Expansion du bâtiment terminée',
                building_upgrade_complete_text: '%{building} niveau %{level} terminé(e) à%{city}',

                mission_update: 'Mission mise à jour',

                loading: 'Chargement de %{type} terminé à %{city}',
                en_route: '%{type} sont arrivés à %{city}',
                returning: '%{type} sont retournés à %{city}',

                deployarmy: 'Déploiement de l’Armée',
                deploynavy: 'Déploiement de la Flotte',
                plunder: 'Pillage',
                transport: 'Transport',
            },
            espionage: {
                player: 'Joueur',
                townhall_level: 'Niveau de l\'Hôtel de Ville',
                wall_level: 'Niveau du mur',
                travel_time: 'Durée du trajet',
                resources_lootable: 'Pillable',
                on_vacation: 'En vacances',
                resources_looted: 'Pillé',
                combats: 'Combats',
                military_score: 'Score militaire',
                location: 'Position',
                view_island: 'Voir l\'île',
                occupied_by: 'Occupée par',
                blockaded_by: 'Bloquée par',
                time_since: 'Il y a',
                remove_target: 'Retirer la cible',
            },
            settings: {
                general: 'Options générales',
                language: 'Langue',

                overviews: 'Vues',

                tweaks: 'Ajustements',
                auto_accept_daily_bonus: 'Valider automatiquement le bonus quotidien',
                hide_ads: 'Masquer les publicités',
                hide_facebook: 'Masquer le bouton Facebook',
                hide_friends_bar: 'Masquer la barre de contact',
                hide_chat: 'Masquer le chat',
                transport_buttons: 'Ajouter boutons de transport: -500, +500, +1k, +5k',
                donation_buttons: 'Ajouter boutons de donation: +1k, +10k, +100k',
                show_city_owners: 'Afficher le propriétaire à côté du nom des villes (vue île)',
                prevent_accidental_colony_destruction: 'Empêcher la démolition des colonies non mobiles',
                initialize_colonization_missions_for_pirate_raiding:
                'Préparer les missions de colonisation avec le bois et le marbre d\'une forteresse pirate niveau 1 et la vitesse de chargement maximale',

                alerts: 'Alertes',
                do_test: 'Test',
                test_desktop_alert: 'Tester la notification bureau',
                test_desktop_alert_title: 'Tester le titre de la notification',
                test_desktop_alert_text: 'Notification Réussie ! Cliquez pour fermer.',
                desktop_alerts_not_supported: 'Notification impossible : vérifiez que Tampermonkey autorise GM_notification pour ce script et que le navigateur peut afficher des notifications.',

                building_completion_alert_desktop: 'Notification: Expansion du Bâtiment terminée',
                transport_loaded_alert_desktop: 'Notification: Chargement terminé',
                transport_arrived_alert_desktop: 'Notification: Transport terminé',
                transport_returned_alert_desktop: 'Notification: Retour terminé',
                deploy_army_loaded_alert_desktop: 'Notification: Chargement de Troupes terminé',
                deploy_army_arrived_alert_desktop: 'Notification: Troupes déployées',
                deploy_army_returned_alert_desktop: 'Notification: Retour des Troupes',
                deploy_navy_arrived_alert_desktop: 'Notification: Flottes déployées',
                deploy_navy_returned_alert_desktop: 'Notification: Retour des Flottes',
                pillage_loaded_alert_desktop: 'Notification: Chargement pillage',
                pillage_arrived_alert_desktop: 'Notification: Pillage en cours',
                pillage_returned_alert_desktop: 'Notification: Retour du pillage',

                debug: 'Debug',
            },
        },
    };
    var localizer = new IkaTools.Intl.Localizer(localizations);

    // CORRECTION IMPERATOR.OVERVIEW manquant
    window.Imperator = window.Imperator || {};
    window.Imperator.overview = window.Imperator.overview || {};


    function addStyles() {
        GM_addStyle('\
/*-------------------------main board ----------------------*/ \
\
.imperator_overview { \
width: 100% !important; \
overflow-x: auto !important; \
//margin: 0 auto; \
//padding: 15px 0; \
} \
\
.imperator_overview.ltr, \
.imperator_overview.ltr * { \
direction: ltr; \
} \
\
.imperator_overview.rtl, \
.imperator_overview.rtl * { \
direction: rtl; \
} \
\
/*************************************************************/ \
/* Generic */ \
\
.nowrap { \
white-space: nowrap; \
} \
\
/*************************************************************/ \
/* Main overview table formatting */ \
\
.imperator_overview table.overview { \
width: auto !important; \
min-width: 851px !important; \
margin-bottom: 3px; \
background-color: #FAF3D7; /* v3.10 : point-virgule manquant */ \
border-collapse: collapse; \
border: 1px solid #E4B873; \
color: #542C0F; \
\
height: auto; \
line-height: 12px; \
font-size: 11px; \
min-width: 10px; \
vertical-align: top; \
text-align: right; \
\
cursor:default; \
overflow-x: scroll; \
} \
\
.imperator_overview a, \
.imperator_overview p { \
line-height: 12px; \
font-size: 11px; \
} \
\
.imperator_overview table.overview tbody tr { \
min-height: 22px; \
height: 22px; \
} \
\
.imperator_overview table.overview colgroup { \
border-left: 2px solid #DEC285; \
border-right: 2px solid #DEC285; \
} \
\
.imperator_overview table.overview td { \
padding: 1px 2px; \
min-width: 11px; \
} \
\
.imperator_overview table.overview tbody td { \
vertical-align: top; \
} \
\
.imperator_overview table.overview col { \
border-left: 1px dashed #ECCF8E; \
border-right: 1px dashed #ECCF8E; \
min-width: 20px; \
} \
\
.imperator_overview table.overview col { \
border-left: 1px dashed #ECCF8E; \
border-right: 1px dashed #ECCF8E; \
min-width: 20px; \
} \
\
.imperator_overview table.overview col.city_name { \
border-left: none; \
text-align: left; \
width: 95px; \
} \
\
.imperator_overview table.overview td.city_name { \
text-align: left; \
} \
\
.imperator_overview table.overview col.city_tradegood { \
border-right: none; \
width: 20px; \
} \
\
.imperator_overview table.overview td.city_tradegood img { \
height: 12pt; \
} \
\
.imperator_overview table.overview thead { \
background: #F8E7B3 url(/cdn/all/both/input/button.png) repeat-x scroll 0 bottom; \
} \
\
.imperator_overview table.overview tfoot {  \
background: #E7C680 url(/cdn/all/both/input/button.png) repeat-x scroll 0 0; \
border-top: 2px solid #CB9B6A; \
vertical-align: top; \
} \
\
.imperator_overview table.overview tbody tr { \
border-top: 1px solid #ECCF8E; \
} \
\
.imperator_overview table.overview tbody tr:nth-child(odd) { \
background-color: #FAEEC0; \
} \
\
.imperator_overview table.overview td.city_name, \
.imperator_overview table.overview th.city_name { \
width: 95px; \
max-width: 95px; \
overflow: hidden; \
} \
\
.imperator_overview table.overview tbody tr.current { \
background-color: #FAE0BB; \
} \
\
.imperator_overview table.overview tbody tr:hover { \
background-color: #FAF7EB; \
border:1px solid #CB9B6A; \
} \
\
.imperator_overview table.overview tfoot tr {  \
} \
\
.imperator_overview table.overview th { \
height: 22px; \
width: auto; \
padding: 1px; \
padding-bottom: 2px; \
padding-left: 3px; \
text-align: center; \
font-weight: bold; \
} \
\
.imperator_overview table.overview th.city_name, \
.imperator_overview table.overview td.city_name { \
overflow: hidden; \
} \
\
.imperator_overview table.overview td.totals_sigma_cell:after { \
content: url("/cdn/all/both/layout/sigma.png"); \
} \
\
/**************************************************************/ \
/* Tool tip formatting */ \
\
.tool_tip_container { \
background-color: #FAF3D7; \
border: 1px solid #CB9B6A; \
font-size: 11px; \
position: absolute; \
text-align: left; \
z-index: 110000; \
white-space: nowrap; \
} \
\
.tool_tip_container * { \
padding: 2px 3px; \
} \
\
.tool_tip_container thead,  \
.imperator_tool_tip_title { \
background: #F8E7B3 url("/cdn/all/both/input/button.png") repeat-x scroll 0 bottom; \
white-space: nowrap; \
border-bottom: 1px solid #CB9B6A; \
} \
\
.tool_tip_container tfoot { \
background: #E7C680 url("/cdn/all/both/input/button.png") repeat-x scroll 0 0; \
border-top: 1px solid #CB9B6A; \
} \
\
table.building_upgrade_costs { \
width: 100%; \
} \
\
table.building_upgrade_costs td *, \
table.lootable_resources td *, \
table.target_military_garrison tfoot td *, \
table.combat_looted td * { \
padding: 0px 2px; \
} \
\
table.espionage_combats > tbody > tr:nth-child(even), \
table.travel_time tr:nth-child(even) { \
background-color: #FAEEC0; \
} \
\
table.building_upgrade_costs td.resource_icon img, \
table.building_upgrade_costs td.resource_missing img, \
table.lootable_resources td.resource_icon img, \
table.combat_looted td.resource_icon img { \
height: 11px; \
} \
\
table.resource_use_tool_tip, \
table.lootable_resources tbody td.resource_lootable, \
table.target_military_garrison tbody td { \
text-align: right; \
} \
\
table.resource_use_tool_tip col { \
border-left: 1px dashed #ECCF8E; \
border-right: 1px dashed #ECCF8E; \
} \
\
table.resource_use_tool_tip col:first-of-type { \
border-left: none; \
} \
\
table.resource_use_tool_tip col:last-of-type { \
border-right: none; \
} \
\
table.resource_use_tool_tip .imp_growth_full { \
font-size: 10px; \
font-style: italic; \
color: #8A6D39; \
white-space: nowrap; \
} \
\
table.building_upgrade_costs td.resource_missing { \
color: #AA0303; \
text-align: right; \
} \
\
table.building_upgrade_costs td.resource_cost { \
text-align: right; \
} \
\
table.resources_in_transit_tool_tip img, \
table.resource_use_tool_tip img { \
padding: 0px 0px; \
padding-top: 1px; \
} \
\
table.resources_in_transit_tool_tip .resource_count, \
table.training_units_tool_tip .training_count, \
table.deploying_units_tool_tip .deploying_count  \
table.plundering_units_tool_tip .plundering_count{ \
text-align: right; \
} \
\
div.combat_type_blockade, \
div.combat_type_plunder { \
max-width: 25px; \
width: 25px; \
height: 15px; \
max-height: 15px; \
background-size: 25px auto; \
background-position: left top; \
background-repeat: no-repeat; \
background-position: 0px 0px; \
} \
div.combat_type_blockade { \
background-image: url("/cdn/all/both/actions/blockade.jpg"); \
} \
div.combat_type_plunder { \
background-image: url("/cdn/all/both/actions/plunder.jpg"); \
} \
\
/**************************************************************/ \
/* Resource table specific formatting */ \
\
#ImperatorOverviewResourceTable .resource_consumption, \
#ImperatorOverviewResourceTable .resource_consumption a { \
font-size: 9px; \
} \
\
#ImperatorOverviewResourceTable .resources_transporting { \
font-size: 9px; \
line-height: 10px; \
color: #4455EB; \
} \
\
#ImperatorOverviewResourceTable .is_under_safe_limit:before { \
content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAJCAYAAAD+WDajAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEFJREFUeNpi/P//PwMIhOrzQhhAsPriZ0YQzYQugcxnQhaE6YABxhA9HhRdyICJAQ/AayzxOtFdzYRuFLIVAAEGANwqFwuukYKqAAAAAElFTkSuQmCC"); \
float: left; \
} \
\
#ImperatorOverviewResourceTable .resource_current { \
white-space: nowrap; \
} \
\
#ImperatorOverviewResourceTable td.research, \
#ImperatorOverviewResourceTable td.population, \
#ImperatorOverviewResourceTable td.population_growth { \
text-align: center;; \
} \
\
/* v3.2 : colonne Recherche */ \
#ImperatorOverviewResourceTable td.research .imp_rs_l1 { \
font-weight: bold; \
white-space: nowrap; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_l2 { \
display: flex; \
justify-content: space-between; \
align-items: center; \
gap: 4px; \
font-size: 10px; \
white-space: nowrap; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_sci { \
display: inline-flex; \
align-items: center; \
gap: 2px; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_ring { \
display: block; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_cost { \
color: #8A5A00; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_cost.imp_rs_negative { \
color: #C0392B; \
font-weight: bold; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_none { \
color: #B9A27E; \
} \
#ImperatorOverviewResourceTable td.research.imp_rs_stale { \
opacity: 0.55; \
} \
/* v3.5 : voyant experience */ \
#ImperatorOverviewResourceTable td.research .imp_rs_lamp { \
display: inline-block; \
width: 8px; \
height: 8px; \
border-radius: 50%; \
margin-right: 4px; \
vertical-align: middle; \
box-shadow: 0 0 0 1px rgba(0,0,0,0.25); \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_lamp_ready { background-color: #2E9E2E; } \
#ImperatorOverviewResourceTable td.research .imp_rs_lamp_scroll { background-color: #F0A020; } \
#ImperatorOverviewResourceTable td.research .imp_rs_lamp_blocked { background-color: #D23C3C; } \
@keyframes imp_rs_blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } } \
#ImperatorOverviewResourceTable td.research .imp_rs_lamp_blink { animation: imp_rs_blink 0.8s ease-in-out 10; } \
#ImperatorOverviewResourceTable th.research { \
position: relative; \
} \
#ImperatorOverviewResourceTable th.research .imp_rs_head_count { \
position: absolute; \
right: 2px; \
bottom: 1px; \
font-size: 10px; \
font-weight: bold; \
color: #5A3A1A; \
} \
#ImperatorOverviewResourceTable th.research .imp_rs_head_ready { color: #2E9E2E; } \
#ImperatorOverviewResourceTable th.research .imp_rs_head_scroll { color: #D9822B; } \
.imp_rs_tip tr.imp_rs_xp_ready { color: #2E7D2E; font-weight: bold; } \
.imp_rs_tip .imp_rs_tip_next { margin-top: 4px; border-top: 1px solid #CB9B6A; } \
.imp_rs_tip .imp_rs_next_first { color: #2E5E9E; } \
.imp_rs_tip tr.imp_rs_xp_scroll { color: #B8650F; font-weight: bold; } \
.imp_rs_tip tr.imp_rs_xp_blocked { color: #C0392B; } \
.imp_rs_tip .imp_rs_tip_title { \
font-weight: bold; \
margin-bottom: 2px; \
} \
.imp_rs_tip td.imp_rs_val { \
text-align: right; \
white-space: nowrap; \
} \
.imp_rs_tip tr.imp_rs_warn { \
color: #C0392B; \
} \
.imp_rs_tip tr.imp_rs_gold { \
color: #8A5A00; \
} \
.imp_rs_tip tr.imp_rs_muted, \
.imp_rs_tip .imp_rs_tip_age { \
color: #8C7355; \
font-size: 10px; \
} \
.imp_rs_tip .imp_rs_tip_alert { \
color: #C0392B; \
font-weight: bold; \
} \
\
#ImperatorOverviewResourceTable td.population_growth_icon img { \
width: 18px; \
} \
\
#ImperatorOverviewResourceTable td.population_growth_icon { \
position: relative; \
} \
\
#ImperatorOverviewResourceTable td.population_growth_icon.imp_museum_incomplete img { \
box-shadow: 0 0 0 2px #E8A33D; \
border-radius: 50%; \
} \
\
#ImperatorOverviewResourceTable td.population_growth_icon.imp_museum_incomplete::after { \
content: attr(data-imp-gap); \
position: absolute; \
right: 1px; \
bottom: 1px; \
min-width: 11px; \
height: 11px; \
padding: 0 2px; \
border-radius: 6px; \
background: #C0392B; \
color: #fff; \
font: bold 9px/11px Arial, sans-serif; \
text-align: center; \
pointer-events: none; \
} \
\
#ImperatorOverviewResourceTable a.transport_goods, \
#ImperatorOverviewResourceTable a.to_town_hall, \
#ImperatorOverviewBuildingsTable a.transport_goods, \
#ImperatorOverviewBuildingsTable a.to_city_view, \
#ImperatorOverviewMilitaryTable a.deploy_army, \
#ImperatorOverviewMilitaryTable a.deploy_navy, \
#ImperatorOverviewMilitaryTable a.to_barracks, \
#ImperatorOverviewMilitaryTable a.to_shipyard, \
#ImperatorOverviewEspionageTable a.spy_mission, \
#ImperatorOverviewEspionageTable a.pillage_mission, \
#ImperatorOverviewEspionageTable a.blockade_mission, \
#ImperatorOverviewEspionageTable a.occupy_mission, \
#ImperatorOverviewEspionageTable a.send_spy_mission, \
#ImperatorOverviewEspionageTable a.remove_espionage_target { \
\
max-width: 25px; \
width: 25px; \
height: 17px; \
display: inline-block; \
background-size: 25px auto; \
background-position: left top; \
background-repeat: no-repeat; \
background-position: 0px 0px; \
} \
\
#ImperatorOverviewResourceTable a.transport_goods, \
#ImperatorOverviewBuildingsTable a.transport_goods { \
background-image: url("/cdn/all/both/actions/transport.jpg"); \
margin-left: 2px; \
} \
\
#ImperatorOverviewResourceTable a.to_town_hall, \
#ImperatorOverviewBuildingsTable a.to_city_view { \
background-image: url("/cdn/all/both/layout/icon-city2.png"); \
} \
\
#ImperatorOverviewResourceTable a.transport_goods:hover, \
#ImperatorOverviewBuildingsTable a.transport_goods:hover, \
#ImperatorOverviewMilitaryTable a.deploy_navy:hover, \
#ImperatorOverviewMilitaryTable a.deploy_army:hover, \
#ImperatorOverviewEspionageTable a.pillage_mission:hover, \
#ImperatorOverviewEspionageTable a.blockade_mission:hover, \
#ImperatorOverviewEspionageTable a.occupy_mission:hover, \
#ImperatorOverviewEspionageTable a.send_spy_mission:hover { \
background-position: 0px -17px; \
} \
\
#ImperatorOverviewResourceTable tr.current a.transport_goods, \
#ImperatorOverviewBuildingsTable tr.current a.transport_goods, \
#ImperatorOverviewMilitaryTable tr.current a.deploy_navy, \
#ImperatorOverviewMilitaryTable tr.current a.deploy_army { \
background-position: 0px -34px; \
} \
\
#ImperatorOverviewResourceTable.city_type_deployedCities a.transport_goods, \
#ImperatorOverviewResourceTable.city_type_occupiedCities a.transport_goods, \
#ImperatorOverviewBuildingsTable.city_type_deployedCities a.transport_goods, \
#ImperatorOverviewBuildingsTable.city_type_occupiedCities a.transport_goods { \
background-position: 0px -34px; \
} \
\
.imperator_overview table.overview td.actions { \
text-align: left; \
} \
\
#ImperatorOverviewResourceTable th.actions, \
#ImperatorOverviewBuildingsTable th.actions, \
#ImperatorOverviewBuildingsTable td.actions, \
#ImperatorOverviewMilitaryTable th.actions { \
width: 52px !important; \
max-width: 52px !important; \
min-width: 52px !important; \
}  \
\
/************************************************************/ \
/* Percent bars and warning indications */ \
\
.imperator_overview .percent_bar { \
border-radius: 2px; \
height: 3px; \
background-color: !transparent; \
border: 1px solid #B07D56; \
overflow: hidden; \
min-width: 45px; \
margin-top: 1px; \
} \
\
.imperator_overview .percent_bar .percent_bar_active {  \
height: 100%; \
border-top-left-radius: 2px; \
border-bottom-left-radius: 2px; \
background-color: #481010; \
} \
\
.imperator_overview .percent_bar.expiration_forseeable .percent_bar_active { \
background-color: #7F1D1A; \
} \
\
.imperator_overview .percent_bar.expiration_soon .percent_bar_active {  \
background-color: #B42521; \
} \
\
.imperator_overview .percent_bar.expiration_imminent .percent_bar_active, \
.imperator_overview .percent_bar.expiration_now .percent_bar_active {  \
background-color: #FF0000; \
} \
\
.imperator_overview .percent_bar.percent_bar_desire_filled.percent_bar_filled \
.percent_bar_active { \
background-color: #285E28; \
} \
\
.imperator_overview .expiration_now, \
.imperator_overview .expiration_imminent { \
font-weight: bold; \
color: red; \
} \
\
.imperator_overview .expiration_soon { \
font-weight: bold; \
color: #B42521; \
} \
\
.imperator_overview .expiration_forseeable { \
color: #8F1D1A; \
} \
\
.imperator_overview .imperator_warning { \
color: red; \
} \
\
/***************************************************************/ \
/* Buildings table specific formatting */ \
\
#ImperatorOverviewBuildingsTable tbody td{ \
vertical-align: middle; \
} \
\
#ImperatorOverviewBuildingsTable th {  \
max-width: 15px; \
width: 15px; \
overflow: hidden;  \
cursor: default; \
height: 36px; \
} \
\
#ImperatorOverviewBuildingsTable td {  \
width: 15px; \
} \
#ImperatorOverviewBuildingsTable th.building[colspan="2"] { max-width: 20px; } \
#ImperatorOverviewBuildingsTable th.building[colspan="3"] { max-width: 35px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="4"] { max-width: 45px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="5"] { max-width: 55px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="6"] { max-width: 65px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="7"] { max-width: 75px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="8"] { max-width: 85px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="9"] { max-width: 95px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="10"] { max-width: 100px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="11"] { max-width: 105px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="12"] { max-width: 110px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="13"] { max-width: 115px;} \
\
\
#ImperatorOverviewBuildingsTable td.building_upgrading a { \
font-weight: bold; \
color: green; \
} \
\
#ImperatorOverviewBuildingsTable col.building.building_additional { \
border-left: none; \
} \
\
#ImperatorOverviewBuildingsTable col.building { \
border-right: none; \
} \
\
/**************************************************************/ \
/* Military table specific formatting */ \
\
#ImperatorOverviewMilitaryTable thead { \
height: 36px; \
cursor: default; \
} \
\
#ImperatorOverviewMilitaryTable th { \
overflow: hidden; \
max-width: 23px; \
} \
\
#ImperatorOverviewMilitaryTable a.deploy_army { \
background-image: url("/cdn/all/both/actions/move_army.jpg"); \
} \
\
#ImperatorOverviewMilitaryTable a.deploy_navy { \
background-image: url("/cdn/all/both/actions/move_fleet.jpg"); \
margin-left: 2px; \
} \
\
#ImperatorOverviewMilitaryTable a.to_barracks { \
background-image:url("/cdn/all/both/img/city/barracks_l.png"); \
background-size: 30px auto; \
background-position: bottom left; \
} \
\
#ImperatorOverviewMilitaryTable a.to_shipyard { \
background-image:url("/cdn/all/both/img/city/shipyard_l.png"); \
} \
\
#ImperatorOverviewMilitaryTable a.to_barracks+a.to_shipyard { \
margin-left: 2px; \
} \
\
#ImperatorOverviewMilitaryTable .military_training { \
font-size: 9px; \
line-height: 10px; \
color: green; \
} \
\
#ImperatorOverviewMilitaryTable .military_deploying { \
font-size: 9px; \
line-height: 10px; \
color: #4455EB; \
} \
\
#ImperatorOverviewMilitaryTable .military_plundering { \
font-size: 9px; \
line-height: 10px; \
color: #8302A3; \
} \
/**************************************************************/ \
/* Espionage table specific formatting */ \
\
#ImperatorOverviewEspionageTable td.city_tradegood { \
width: auto; \
min-width: 50px; \
text-align: left; \
} \
#ImperatorOverviewEspionageTable td.actions { \
min-width: 160px; \
} \
#ImperatorOverviewEspionageTable a.spy_mission { \
/*background-image: url("/cdn/all/both/friends/citymenu.png"); \
background-position: 0px -129px; */\
background-image: url("/cdn/all/both/layout/icon-mission.png"); \
} \
#ImperatorOverviewEspionageTable a.pillage_mission { \
background-image: url("/cdn/all/both/actions/plunder.jpg"); \
margin-left: 2px; \
} \
#ImperatorOverviewEspionageTable a.blockade_mission { \
background-image: url("/cdn/all/both/actions/blockade.jpg"); \
margin-left: 2px; \
} \
#ImperatorOverviewEspionageTable a.occupy_mission { \
background-image: url("/cdn/all/both/actions/occupy.jpg"); \
margin-left: 2px; \
} \
#ImperatorOverviewEspionageTable a.send_spy_mission { \
background-image: url("/cdn/all/both/actions/espionage.jpg"); \
margin-left: 2px; \
} \
#ImperatorOverviewEspionageTable a.remove_espionage_target { \
background-image: url("/cdn/all/both/actions/defend.jpg"); \
background-position: 0px -34px; \
margin-left: 2px; \
} \
#ImperatorOverviewEspionageTable a.player_state_inactive { \
color: grey; \
} \
#ImperatorOverviewEspionageTable a.player_state_vacation { \
color: green; \
} \
#ImperatorOverviewEspionageTable tbody td { \
vertical-align: middle; \
} \
#ImperatorOverviewEspionageTable td.player, \
#ImperatorOverviewEspionageTable td.location { \
text-align: left; \
} \
.espionage_blockader, \
.espionage_occupier { \
margin-left: 1pt; \
margin-right: 1pt; \
} \
.target_military_garrison thead th { \
height: 36px; \
cursor: default; \
} \
.target_military_garrison th { \
overflow: hidden; \
max-width: 23px; \
} \
.target_military_garrison th.military { \
background-size: auto 33px; \
} \
.target_military_garrison th.military_phalanx { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_phalanx_faceright.png"); \
} \
.target_military_garrison th.military_steamgiant { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_steamgiant_faceright.png"); \
} \
.target_military_garrison th.military_spartan { \
background-image:url("/cdn/all/both/ikipedia/319.png"); \
background-size: contain; \
background-repeat: no-repeat; \
background-position: center; \
} \
.target_military_garrison th.military_spearman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_spearman_faceright.png"); \
} \
.target_military_garrison th.military_swordsman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_swordsman_faceright.png"); \
} \
.target_military_garrison th.military_slinger { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_slinger_faceright.png"); \
} \
.target_military_garrison th.military_archer { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_archer_faceright.png"); \
} \
.target_military_garrison th.military_marksman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_marksman_faceright.png"); \
} \
.target_military_garrison th.military_ram { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_ram_faceright.png"); \
background-size: auto 18px; \
} \
.target_military_garrison th.military_catapult { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_catapult_faceright.png"); \
background-size: auto 23px; \
} \
.target_military_garrison th.military_mortar { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_mortar_faceright.png"); \
background-size: auto 22px; \
} \
.target_military_garrison th.military_gyrocopter { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_gyrocopter_faceright.png"); \
background-size: auto 21px; \
} \
.target_military_garrison th.military_bombardier { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_bombardier_faceright.png"); \
} \
.target_military_garrison th.military_cook { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_cook_faceright.png"); \
} \
.target_military_garrison th.military_medic { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_medic_faceright.png"); \
} \
.target_military_garrison th.military_ship_flamethrower { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_flamethrower_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_steamboat { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_steamboat_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_ram { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ram_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_ballista { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ballista_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_catapult { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_catapult_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_mortar { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_mortar_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_submarine { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_submarine_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_paddlespeedship { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_paddlespeedship_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_ballooncarrier { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ballooncarrier_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_tender { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_tender_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_rocketship { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_rocketship_faceright.png"); \
background-size: 33px auto; \
} \
\
/*****************************************************************/ \
/* Image styling for table headers */ \
\
#ImperatorOverviewBuildingsTable th.building, \
#ImperatorOverviewMilitaryTable th.military, \
.imperator_overview table.overview th.action_points, \
#ImperatorOverviewResourceTable th.population, \
#ImperatorOverviewResourceTable th.population_growth, \
#ImperatorOverviewResourceTable th.research, \
#ImperatorOverviewResourceTable th.resource, \
#ImperatorOverviewEspionageTable th.location, \
#ImperatorOverviewEspionageTable th.travel_time, \
#ImperatorOverviewEspionageTable th.townhall_level, \
#ImperatorOverviewEspionageTable th.wall_level, \
#ImperatorOverviewEspionageTable th.resources_lootable, \
#ImperatorOverviewEspionageTable th.combats, \
#ImperatorOverviewEspionageTable th.military_score, \
.target_military_garrison th.military \
{ \
-webkit-user-select: none; \
-khtml-user-select: none; \
-moz-user-select: none; \
-o-user-select: none; \
user-select: none; \
cursor: default; \
color: transparent; \
background-repeat: no-repeat; \
background-attachment: center; \
background-position: center; \
} \
\
.imperator_overview table.overview td.action_points, \
.imperator_overview table.overview th.action_points { \
max-width: 20px; \
width: 20px; \
overflow: hidden; \
} \
\
.imperator_overview table.overview th.action_points { \
background-image:url("/cdn/all/both/resources/icon_actionpoints.png"); \
max-width: 20px; \
} \
.imperator_overview table.overview td.action_points { \
max-width: 20px; \
} \
\
#ImperatorOverviewResourceTable th.population { \
background-image:url("/cdn/all/both/resources/icon_population.png"); \
} \
\
#ImperatorOverviewResourceTable th.population_growth { \
background-image:url("/cdn/all/both/icons/growth_positive.png"); \
} \
\
#ImperatorOverviewResourceTable th.research { \
background-image:url("/cdn/all/both/layout/bulb-on.png"); \
} \
\
#ImperatorOverviewResourceTable th.resource_wood { \
background-image:url("/cdn/all/both/resources/icon_wood.png"); \
} \
\
#ImperatorOverviewResourceTable th.resource_wine { \
background-image:url("/cdn/all/both/resources/icon_wine.png"); \
} \
\
#ImperatorOverviewResourceTable th.resource_marble { \
background-image:url("/cdn/all/both/resources/icon_marble.png"); \
} \
\
#ImperatorOverviewResourceTable th.resource_crystal { \
background-image:url("/cdn/all/both/resources/icon_crystal.png"); \
} \
\
#ImperatorOverviewResourceTable th.resource_sulfur { \
background-image:url("/cdn/all/both/resources/icon_sulfur.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building { \
background-size: 55px; \
} \
\
#ImperatorOverviewBuildingsTable th.building_spots { \
background-image:url("/cdn/all/both/img/city/flag_red.png"); \
background-size: 25px; \
} \
\
#ImperatorOverviewBuildingsTable th.building_townHall { \
background-image:url("/cdn/all/both/img/city/townhall_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_palace { \
background-image:url("/cdn/all/both/img/city/palace_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_palaceColony { \
background-image:url("/cdn/all/both/img/city/palaceColony_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_tavern { \
background-image:url("/cdn/all/both/img/city/taverne_r.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_museum { \
background-image:url("/cdn/all/both/img/city/museum_r.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_academy { \
background-image:url("/cdn/all/both/img/city/academy_l.png"); \
}       \
\
#ImperatorOverviewBuildingsTable th.building_workshop { \
background-image:url("/cdn/all/both/img/city/workshop_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_temple { \
background-image:url("/cdn/all/both/img/city/temple_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_embassy { \
background-image:url("/cdn/all/both/img/city/embassy_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_warehouse { \
background-image:url("/cdn/all/both/img/city/warehouse_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_dump { \
background-image:url("/cdn/all/both/img/city/dump_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_branchOffice { \
background-image:url("/cdn/all/both/img/city/branchoffice_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_blackMarket { \
background-image:url("/cdn/all/both/img/city/blackmarket_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_marineChartArchive { \
background-image:url("/cdn/all/both/img/city/marinechartarchive_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_port { \
background-image:url("/cdn/all/both/img/city/port_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_wall { \
background-image:url("/cdn/all/both/img/city/wall.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_safehouse { \
background-image:url("/cdn/all/both/img/city/safehouse_l.png"); \
background-size: 65px; \
} \
\
#ImperatorOverviewBuildingsTable th.building_barracks { \
background-image:url("/cdn/all/both/img/city/barracks_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_shipyard { \
background-image:url("/cdn/all/both/img/city/shipyard_l.png"); \
background-size: 45px; \
} \
\
#ImperatorOverviewBuildingsTable th.building_pirateFortress { \
background-image:url("/cdn/all/both/img/city/pirateFortress_l.png"); \
background-size: 45px; \
} \
\
#ImperatorOverviewBuildingsTable th.building_forester { \
background-image:url("/cdn/all/both/img/city/forester_l.png"); \
}       \
\
#ImperatorOverviewBuildingsTable th.building_carpentering { \
background-image:url("/cdn/all/both/img/city/carpentering_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_winegrower { \
background-image:url("/cdn/all/both/img/city/winegrower_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_vineyard { \
background-image:url("/cdn/all/both/img/city/vineyard_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_stonemason { \
background-image:url("/cdn/all/both/img/city/stonemason_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_architect { \
background-image:url("/cdn/all/both/img/city/architect_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_glassblowing { \
background-image:url("/cdn/all/both/img/city/glassblowing_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_optician { \
background-image:url("/cdn/all/both/img/city/optician_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_alchemist { \
background-image:url("/cdn/all/both/img/city/alchemist_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_fireworker { \
background-image:url("/cdn/all/both/img/city/fireworker_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_dockyard { \
background-image:url("/cdn/all/both/img/city/dockyard_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_shrineOfOlympus { \
background-image:url("/cdn/all/both/img/city/shrineOfOlympus_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_chronosForge { \
background-image:url("/cdn/all/both/img/city/chronosForge_l.png"); \
} \
\
#ImperatorOverviewMilitaryTable th.military { \
background-size: auto 33px; \
} \
\
#ImperatorOverviewMilitaryTable th.military_phalanx { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_phalanx_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_steamgiant { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_steamgiant_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_spartan { \
background-image:url("/cdn/all/both/ikipedia/319.png"); \
background-size: contain; \
background-repeat: no-repeat; \
background-position: center; \
} \
#ImperatorOverviewMilitaryTable th.military_spearman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_spearman_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_swordsman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_swordsman_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_slinger { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_slinger_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_archer { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_archer_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_marksman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_marksman_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_ram { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_ram_faceright.png"); \
background-size: auto 18px; \
} \
#ImperatorOverviewMilitaryTable th.military_catapult { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_catapult_faceright.png"); \
background-size: auto 23px; \
} \
#ImperatorOverviewMilitaryTable th.military_mortar { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_mortar_faceright.png"); \
background-size: auto 22px; \
} \
#ImperatorOverviewMilitaryTable th.military_gyrocopter { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_gyrocopter_faceright.png"); \
background-size: auto 21px; \
} \
#ImperatorOverviewMilitaryTable th.military_bombardier { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_bombardier_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_cook { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_cook_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_medic { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_medic_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_ship_flamethrower { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_flamethrower_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_steamboat { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_steamboat_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_ram { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ram_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_ballista { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ballista_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_catapult { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_catapult_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_mortar { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_mortar_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_submarine { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_submarine_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_paddlespeedship { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_paddlespeedship_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_ballooncarrier { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ballooncarrier_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_tender { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_tender_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_rocketship { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_rocketship_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewEspionageTable th.location { \
background-image: url("/cdn/all/both/layout/icon-island.png"); \
} \
#ImperatorOverviewEspionageTable th.travel_time { \
background-image: url("/cdn/all/both/resources/icon_time.png"); \
} \
#ImperatorOverviewEspionageTable th.townhall_level { \
background-image:url("/cdn/all/both/img/city/townhall_l.png"); \
background-size: auto 100%; \
} \
#ImperatorOverviewEspionageTable th.wall_level { \
background-image:url("/cdn/all/both/img/city/wall.png"); \
background-size: auto 100%; \
} \
#ImperatorOverviewEspionageTable th.resources_lootable { \
background-image: url("/cdn/all/both/characters/fleet/40x40/ship_transport_r_40x40.png"); \
background-size: auto 100%; \
} \
#ImperatorOverviewEspionageTable th.combats { \
background-image: url("/cdn/all/both/minimized/plunder.png"); \
background-size: auto 120%; \
} \
#ImperatorOverviewEspionageTable th.military_score { \
background-image: url("/cdn/all/both/characters/military/x60_y60/y60_phalanx_faceright.png"); \
background-size: auto 100%; \
} \
#ImperatorOverviewEspionageTable td.location, \
#ImperatorOverviewEspionageTable td.travel_time, \
#ImperatorOverviewEspionageTable td.townhall_level, \
#ImperatorOverviewEspionageTable td.wall_level, \
#ImperatorOverviewEspionageTable td.resources_lootable, \
#ImperatorOverviewEspionageTable td.combats, \
#ImperatorOverviewEspionageTable td.military_score { \
text-align: center; \
} \
#ImperatorOverviewMilitaryTable td.action_points, \
#ImperatorOverviewMilitaryTable td.military { \
text-align: center; \
vertical-align: middle; \
} \
\
/********************** Settings dialog *************************/ \
#options .tabmenu .tab { \
width: auto; \
} \
/* Agrandissement fenêtre principale */ \
#popup_content, \
#templateView, \
.templateView, \
.mainContent { \
width: auto !important; \
max-width: 98vw !important; \
} \
\
.imperator_overview { \
width: 100% !important; \
overflow-x: auto !important; \
} \
\
.imperator_overview table.overview { \
width: 100% !important; \
min-width: 851px !important; \
} \
/* v3.9 : marge a droite pour la barre de defilement du jeu (le texte ne bute plus dessus) */ \
#cityBuildings .imperator_overview { \
box-sizing: border-box; \
padding-right: 14px; /* v3.10 : meme espace qu a gauche */ \
} \
/* v3.9 : onglets etires sur toute la largeur du tableau */ \
#cityBuildings ul.tabmenu { \
display: flex !important; \
width: auto !important; \
margin-right: 14px !important; \
} \
#cityBuildings ul.tabmenu > li.tab { \
flex: 1 1 0; \
float: none !important; \
width: auto !important; \
min-width: 0; \
text-align: center; \
white-space: nowrap; \
background-size: 100% 100% !important; \
display: flex !important; \
align-items: center; \
justify-content: center; \
padding-top: 0 !important; \
padding-bottom: 0 !important; \
} \
/* v3.10 : nom de l onglet centre dans la hauteur */ \
#cityBuildings ul.tabmenu > li.tab > b { \
display: block; \
margin: 0 !important; \
padding: 0 !important; \
line-height: normal !important; \
} \
'
                   );
    }


    // ============================================================
    // v3.1 : historique des alertes de bureau.
    // Chaque alerte envoyée (ou qui n'a pas pu s'afficher) est notée : heure, titre, texte.
    // Les 50 dernières sont gardées. Consultation par l'entrée « Alertes » du menu de gauche.
    // ============================================================
    var IMP_ALERT_HISTORY_MAX = 50;
    var impAlertHistoryData = new IkaTools.Data.Value('alertHistory', [], { version: 1 });
    var impAlertHistoryListeners = [];

    // Relit la valeur sauvegardée : un autre onglet du jeu a pu ajouter des alertes.
    function impAlertHistoryList() {
        var list;
        try { list = impAlertHistoryData.load(); } catch (e) { list = impAlertHistoryData.data; }
        return Array.isArray(list) ? list : [];
    }

    function impAlertHistorySave(list) {
        impAlertHistoryData.data = list;
        try { impAlertHistoryData.save(); } catch (e) {}
        $.each(impAlertHistoryListeners, function(i, f) { try { f(); } catch (e) {} });
    }

    function impAlertHistoryAdd(title, text, shown) {
        try {
            var list = impAlertHistoryList().slice();
            list.unshift({ time: Date.now(), title: String(title || ''), text: String(text || ''),
                           shown: !!shown, read: false });
            if (list.length > IMP_ALERT_HISTORY_MAX) list.length = IMP_ALERT_HISTORY_MAX;
            impAlertHistorySave(list);
        } catch (e) {
            console.warn('[Imperator] Historique des alertes : enregistrement échoué', e);
        }
    }

    function impAlertHistoryUnread() {
        var n = 0;
        $.each(impAlertHistoryList(), function(i, a) { if (a && !a.read) n++; });
        return n;
    }

    function impAlertHistoryMarkRead() {
        var list = impAlertHistoryList(), changed = false;
        $.each(list, function(i, a) { if (a && !a.read) { a.read = true; changed = true; } });
        if (changed) impAlertHistorySave(list);
    }

    function impAlertHistoryClear() {
        impAlertHistorySave([]);
    }

    function impAlertHistoryOnChange(f) {
        impAlertHistoryListeners.push(f);
    }

    function impAlertTimeLabel(time) {
        var d = new Date(time), now = new Date();
        var two = function(n) { return (n < 10 ? '0' : '') + n; };
        var hm = two(d.getHours()) + ':' + two(d.getMinutes());
        if (d.toDateString() === now.toDateString()) return hm;
        return two(d.getDate()) + '/' + two(d.getMonth() + 1) + ' ' + hm;
    }

    // Panneau de consultation (indépendant des fenêtres du jeu).
    function impAlertHistoryShow() {
        impAlertHistoryStyles();
        $('#ImperatorAlertHistory').remove();
        var list = impAlertHistoryList();
        var rows = $.map(list, function(a) {
            if (!a) return null;
            return '<li class="' + (a.read ? '' : 'imp_ah_unread') + '">' +
                '<span class="imp_ah_time">' + __impH(impAlertTimeLabel(a.time)) + '</span>' +
                '<span class="imp_ah_title">' + __impH(a.title) + '</span>' +
                (a.shown ? '' : '<span class="imp_ah_notshown" title="' +
                    __impH(localizer.localize('misc', 'alert_history_not_shown')) + '">⚠</span>') +
                '<div class="imp_ah_text">' + __impH(a.text) + '</div></li>';
        }).join('');
        var panel = $('<div id="ImperatorAlertHistory">' +
            '<div class="imp_ah_head"><span>' + __impH(localizer.localize('misc', 'alert_history_title')) +
            '</span><a class="imp_ah_close" title="×">×</a></div>' +
            (rows ? '<ul>' + rows + '</ul>' :
                '<div class="imp_ah_empty">' + __impH(localizer.localize('misc', 'alert_history_empty')) + '</div>') +
            '<div class="imp_ah_foot"><a class="button imp_ah_clear">' +
            __impH(localizer.localize('misc', 'alert_history_clear')) + '</a></div></div>');
        panel.find('.imp_ah_close').click(function() { panel.remove(); });
        panel.find('.imp_ah_clear').click(function() { impAlertHistoryClear(); impAlertHistoryShow(); });
        $('body').append(panel);
        // Les alertes non lues restent en gras pendant cette consultation, puis passent en « lues ».
        impAlertHistoryMarkRead();
    }

    var impAlertHistoryStyled = false;
    function impAlertHistoryStyles() {
        if (impAlertHistoryStyled) return;
        impAlertHistoryStyled = true;
        GM_addStyle(
            '#ImperatorAlertHistory{position:fixed;left:70px;top:120px;z-index:130000;width:400px;max-height:70vh;' +
            'display:flex;flex-direction:column;background:#FCF5E1;border:1.5px solid #8A6D39;border-radius:8px;' +
            'box-shadow:0 4px 14px rgba(90,62,27,.28);color:#5A3E1B;font:12px Arial,sans-serif}' +
            '#ImperatorAlertHistory .imp_ah_head{display:flex;justify-content:space-between;align-items:center;' +
            'padding:8px 12px;background:#E4C88D;border-radius:6px 6px 0 0;font-weight:bold;font-size:13px}' +
            '#ImperatorAlertHistory .imp_ah_close{cursor:pointer;font-size:18px;line-height:14px;color:#5A3E1B}' +
            '#ImperatorAlertHistory ul{margin:0;padding:0;list-style:none;overflow-y:auto}' +
            '#ImperatorAlertHistory li{padding:6px 12px;border-bottom:1px solid #E8D8B0}' +
            '#ImperatorAlertHistory .imp_ah_time{color:#8A6D39;margin-right:8px;font-size:11px}' +
            '#ImperatorAlertHistory .imp_ah_unread .imp_ah_title,#ImperatorAlertHistory .imp_ah_unread .imp_ah_text{font-weight:bold}' +
            '#ImperatorAlertHistory .imp_ah_notshown{margin-left:6px;color:#B03A2E;cursor:help}' +
            '#ImperatorAlertHistory .imp_ah_text{margin-top:2px}' +
            '#ImperatorAlertHistory .imp_ah_empty{padding:16px 12px;font-style:italic}' +
            '#ImperatorAlertHistory .imp_ah_foot{padding:8px 12px;text-align:right}' +
            '#leftMenu .imp_ah_bell{background:none !important;font-size:24px;line-height:42px;text-align:center;position:relative}' +
            '#leftMenu .imp_ah_badge{position:absolute;top:2px;right:2px;min-width:16px;height:16px;padding:0 3px;' +
            'border-radius:8px;background:#C0392B;color:#fff;font:bold 10px/16px Arial,sans-serif;text-align:center}');
    }
    // v2.41 : rafraîchissement en arrière-plan, installé par init() (initialisation.js)
    var backgroundRefresh = null;

    var settings = new IkaTools.Settings.Settings('ImperatorSettings');

    var localizedLanguage = settings.choice(
        'language',
        '',
        {
            'Automatique': '',
            'Français': 'fr',
            'English': 'en',
        },
        localizer.delayedLocalize('settings','language'));

    var showResourceOverview = settings.boolean(
        'show_resource_overview',
        true,
        localizer.delayedLocalize('misc','resource_overview'));
    var showBuildingsOverview = settings.boolean(
        'show_buildings_overview',
        true,
        localizer.delayedLocalize('misc','buildings_overview'));
    var showMilitaryOverview = settings.boolean(
        'show_military_overview',
        true,
        localizer.delayedLocalize('misc','military_overview'));
    var showEspionageOverview = settings.boolean(
        'show_espionage_overview',
        true,
        localizer.delayedLocalize('misc','espionage_overview'));


    var autoAcceptDailyBonus = settings.boolean(
        'auto_accept_daily_bonus',
        true,
        localizer.delayedLocalize('settings','auto_accept_daily_bonus'));
    var hideAds = settings.boolean(
        'hide_ads',
        true,
        localizer.delayedLocalize('settings','hide_ads'));
    var hideFacebook = settings.boolean(
        'hide_facebook',
        true,
        localizer.delayedLocalize('settings','hide_facebook'));
    var hideFriendsBar = settings.boolean(
        'hide_friends_bar',
        false,
        localizer.delayedLocalize('settings','hide_friends_bar'));
    var hideChat = settings.boolean(
        'hide_chat',
        false,
        localizer.delayedLocalize('settings','hide_chat'));
    var transportButtons = settings.boolean(
        'transport_buttons',
        true,
        localizer.delayedLocalize('settings','transport_buttons'));
    var donationButtons = settings.boolean(
        'donation_buttons',
        true,
        localizer.delayedLocalize('settings','donation_buttons'));
    var showCityOwners = settings.boolean(
        'show_city_owners',
        false,
        localizer.delayedLocalize('settings', 'show_city_owners'));
    var preventAccidentalColonyDestruction = settings.boolean(
        'prevent_accidental_colony_destruction',
        true,
        localizer.delayedLocalize('settings', 'prevent_accidental_colony_destruction'));
    var initializeColonizationMissionsForPirateRaiding = settings.boolean(
        'initialize_colonization_missions_for_pirate_raiding',
        false,
        localizer.delayedLocalize('settings', 'initialize_colonization_missions_for_pirate_raiding'));

    // v2.12 : seuil de l'état « bientôt fini » des bénédictions divines
    var blessSoonThreshold = settings.choice(
        'bless_soon_threshold_hours',
        '12',
        { '6 h': '6', '12 h': '12', '24 h': '24', '48 h': '48' },
        IkaTools.Utils.fixedFunction('Bénédictions divines : alerte « bientôt fini »'));

    // ============================================================
    // v2.20 : notifications de bureau via GM_notification (Tampermonkey)
    // remplace l ancienne API webkit, retirée des navigateurs.
    // ============================================================
    function impAsset(path) {
        if (!path) return undefined;
        return location.origin + (String(path).charAt(0) === '/' ? '' : '/') + path;
    }
    function impBeep(times) {
        try {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            var ctx = impBeep._ctx || (impBeep._ctx = new Ctx());
            if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
            var t0 = ctx.currentTime;
            for (var i = 0; i < (times || 3); i++) {
                var o = ctx.createOscillator(), g = ctx.createGain(), t = t0 + i * 0.5;
                o.type = 'square';
                o.frequency.value = 880;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
                o.connect(g); g.connect(ctx.destination);
                o.start(t); o.stop(t + 0.4);
            }
        } catch (e) {}
    }
    function impNotify(opts) {
        opts = opts || {};
        if (typeof GM_notification !== 'function') {
            console.warn('[Imperator] GM_notification indisponible (grant manquant ?)');
            if (!opts.test) impAlertHistoryAdd(opts.title || 'Imperator', opts.text, false); // v3.1
            return false;
        }
        try {
            var d = {
                title: opts.title || 'Imperator',
                text: opts.text || ' ',
                silent: !!opts.sound,
                onclick: function() { try { window.focus(); } catch (e) {} },
            };
            if (opts.image) d.image = opts.image;
            if (!opts.sticky) d.timeout = 15000;
            GM_notification(d);
            if (opts.sound) impBeep(3);
            console.log('[Imperator] Notification :', d.title, '-', d.text);
            if (!opts.test) impAlertHistoryAdd(d.title, d.text, true); // v3.1
            return true;
        } catch (e) {
            console.warn('[Imperator] Notification échouée', e);
            if (!opts.test) impAlertHistoryAdd(opts.title || 'Imperator', opts.text, false); // v3.1
            return false;
        }
    }

    var testDesktopAlert = settings.html(
        function desktopAlertHtml() {
            return '<a id="DesktopAlertTest" class="button">%s</a>'.format(
                localizer.localize('settings','do_test'));
        },
        function desktopAlertPostRender() {
            // v2.20 : test via GM_notification (+ son)
            $('#DesktopAlertTest').click(IkaTools.Logging.debuggable(
                'Imperator.testDesktopAlert',
                function testDesktopAlert() {
                    var ok = impNotify({
                        title: localizer.localize('settings','test_desktop_alert_title'),
                        text: localizer.localize('settings','test_desktop_alert_text'),
                        sound: true,
                        test: true,   // v3.1 : le test n'entre pas dans l'historique
                    });
                    if (!ok) alert(localizer.localize('settings','desktop_alerts_not_supported'));
                }));
        },
        localizer.delayedLocalize('settings','test_desktop_alert'));

    var buildingCompletionAlert_Desktop = settings.boolean(
        'building_completion_alert_desktop',
        false,
        localizer.delayedLocalize('settings','building_completion_alert_desktop'));
    var transportMissionLoaded_Desktop = settings.boolean(
        'transport_loaded_alert_desktop',
        false,
        localizer.delayedLocalize('settings','transport_loaded_alert_desktop'));
    var transportMissionArrived_Desktop = settings.boolean(
        'transport_arrived_alert_desktop',
        false,
        localizer.delayedLocalize('settings','transport_arrived_alert_desktop'));
    var transportMissionReturned_Desktop = settings.boolean(
        'transport_returned_alert_desktop',
        false,
        localizer.delayedLocalize('settings','transport_returned_alert_desktop'));
    var deployArmyLoaded_Desktop = settings.boolean(
        'deploy_army_loaded_alert_desktop',
        false,
        localizer.delayedLocalize('settings','deploy_army_loaded_alert_desktop'));
    var deployArmyArrived_Desktop = settings.boolean(
        'deploy_army_arrived_alert_desktop',
        false,
        localizer.delayedLocalize('settings','deploy_army_arrived_alert_desktop'));
    var deployArmyReturned_Desktop = settings.boolean(
        'deploy_army_returned_alert_desktop',
        false,
        localizer.delayedLocalize('settings','deploy_army_returned_alert_desktop'));
    var deployNavyArrived_Desktop = settings.boolean(
        'deploy_navy_arrived_alert_desktop',
        false,
        localizer.delayedLocalize('settings','deploy_navy_arrived_alert_desktop'));
    var deployNavyReturned_Desktop = settings.boolean(
        'deploy_navy_returned_alert_desktop',
        false,
        localizer.delayedLocalize('settings','deploy_navy_returned_alert_desktop'));
    var pillageLoaded_Desktop = settings.boolean(
        'pillage_loaded_alert_desktop',
        false,
        localizer.delayedLocalize('settings','pillage_loaded_alert_desktop'));
    var pillageArrived_Desktop = settings.boolean(
        'pillage_arrived_alert_desktop',
        false,
        localizer.delayedLocalize('settings','pillage_arrived_alert_desktop'));
    var pillageReturned_Desktop = settings.boolean(
        'pillage_returned_alert_desktop',
        false,
        localizer.delayedLocalize('settings','pillage_returned_alert_desktop'));
    var ignoredHostileMissions = settings.text(
        'ignored_hostile_missions',
        '[]',
        localizer.delayedLocalize('settings', 'ignored_hostile_missions'));


    var debugSetting = settings.html(
        function debugHtml() {
            return '<input id="EmpireDataDebug" type="text" style="width:100%"/>';
        },
        function debugPostRender() {
            $('#EmpireDataDebug').val(IkaTools.EmpireData.getDebugString());
        },
        IkaTools.Utils.fixedFunction('Empire data'));
    var resetData = settings.html(
        function resetDataHtml() {
            return '<a id="ResetImperatorData" class="button">Reset</a>';
        },
        function resetDataPostRender() {
            $('#ResetImperatorData').click(function resetDataClicked() {
                IkaTools.EmpireData.resetData();
                window.location.reload();
            });
        },
        IkaTools.Utils.fixedFunction('Reset data'));
    var espionageDebugSetting = settings.html(
        function debugHtml() {
            return '<input id="EspionageDataDebug" type="text" style="width:100%"/>';
        },
        function debugPostRender() {
            $('#EspionageDataDebug').val(IkaTools.EmpireData.Espionage.getDebugString());
        },
        IkaTools.Utils.fixedFunction('Espionage data'));
    var resetEspionageData = settings.html(
        function resetDataHtml() {
            return '<a id="ResetEspionageData" class="button">Reset Espionage</a>';
        },
        function resetDataPostRender() {
            $('#ResetEspionageData').click(function resetDataClicked() {
                IkaTools.EmpireData.Espionage.resetData();
                window.location.reload();
            });
        },
        IkaTools.Utils.fixedFunction('Reset espionage data'));
    var exceptionLogSetting = settings.html(
        function exceptionLogHtml() {
            return '<input id="ExceptionLog" type="text" style="width:100%"/>';
        },
        function exceptionLogPostRender() {
            $('#ExceptionLog').val(JSON.stringify(IkaTools.Logging.getExceptionLog()));
        },
        IkaTools.Utils.fixedFunction('Errors'));


    // v2.23 : liste des vues capturées, avec téléchargement
    var viewCaptureSetting = settings.html(
        function viewCaptureHtml() {
            return '<div id="ImperatorCaptures"></div>';
        },
        function viewCapturePostRender() {
            if (typeof window.__impRenderCaptures === 'function') {
                window.__impRenderCaptures($('#ImperatorCaptures'));
            }
        },
        IkaTools.Utils.fixedFunction('Captures de vues'));

    // v2.36 : export des données d'Imperator (banc d'affichage hors jeu). Rien n'est envoyé :
    // un fichier est téléchargé sur l'ordinateur.
    var dataExportSetting = settings.html(
        function dataExportHtml() {
            return '<a id="ImperatorDataExport" class="button">Exporter mes données</a>' +
                   '<span id="ImperatorDataExportStatus" style="margin-left:8px;font-size:11px;"></span>';
        },
        function dataExportPostRender() {
            $('#ImperatorDataExport').click(function() {
                try {
                    var values = {}, n = 0, size = 0;
                    $.each(IkaTools.Data.listValues(), function(i, v) {
                        try { if (v.needsSave) v.doSave(true); } catch (e) {}
                        var raw = GM_getValue(v.key);
                        if (raw === undefined || raw === null) return;
                        values[v.key] = raw;
                        n++; size += String(raw).length;
                    });
                    var file = JSON.stringify({
                        format: 'imperator-export',
                        imperator: (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.version : '?',
                        date: new Date().toISOString(),
                        domain: IkaTools.View.getDomain(),
                        values: values,
                    }, null, 1);
                    var d = new Date(), p = function(x) { return (x < 10 ? '0' : '') + x; };
                    var name = 'imperator_donnees_' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
                               '_' + p(d.getHours()) + 'h' + p(d.getMinutes()) + '.json';
                    var url = URL.createObjectURL(new Blob([file], { type: 'application/json;charset=utf-8' }));
                    var a = document.createElement('a');
                    a.href = url; a.download = name;
                    document.body.appendChild(a); a.click();
                    setTimeout(function() { try { URL.revokeObjectURL(url); a.remove(); } catch (e) {} }, 1000);
                    $('#ImperatorDataExportStatus').text(n + ' jeux de données, ' + Math.round(size / 1024) + ' ko');
                    console.log('[Imperator] Données exportées : ' + name + ' (' + n + ' jeux, ' + Math.round(size / 1024) + ' ko)');
                } catch (e) {
                    $('#ImperatorDataExportStatus').text('échec : ' + e);
                }
            });
        },
        IkaTools.Utils.fixedFunction('Exporter mes données'));

    var refreshDataSetting = settings.html(
        function refreshDataHtml() {
            return '<a id="ImperatorRefreshData" class="button">Mettre à jour</a>' +
                   '<span id="ImperatorRefreshStatus" style="margin-left:8px;font-size:11px;"></span>';
        },
        function refreshDataPostRender() {
            $('#ImperatorRefreshData').click(function() {
                var btn = $('#ImperatorRefreshData');
                var status = $('#ImperatorRefreshStatus');
                btn.css('opacity', '0.5').off('click');
                backgroundRefresh.runRefresh(
                    function(i, total, name) {
                        status.text(i + '/' + total + ' — ' + name);
                    },
                    function(total) {
                        var now = new Date();
                        var hhmm = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
                        status.text('MAJ terminée à ' + hhmm);
                        btn.css('opacity', '1');
                    }
                );
            });
        },
        IkaTools.Utils.fixedFunction('Mise à jour des données'));


    function addSettingsLink() {
        var settingsWindow = new IkaTools.UI.SettingsWindow(
            'ImperatorSettings',
            'Ikariam Imperator',
            settings,
            [new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','general'),
                                                  [localizedLanguage]),
             new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','overviews'),
                                                  [showResourceOverview, showBuildingsOverview, showMilitaryOverview,
                                                   showEspionageOverview, blessSoonThreshold]),
             new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','tweaks'),
                                                  [autoAcceptDailyBonus, hideAds, hideFacebook, hideFriendsBar, hideChat,
                                                   transportButtons, donationButtons, showCityOwners,
                                                   preventAccidentalColonyDestruction, initializeColonizationMissionsForPirateRaiding
                                                  ]),
             new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','alerts'),
                                                  [testDesktopAlert, buildingCompletionAlert_Desktop,
                                                   transportMissionLoaded_Desktop, transportMissionArrived_Desktop,
                                                   transportMissionReturned_Desktop, deployArmyLoaded_Desktop,
                                                   deployArmyArrived_Desktop, deployArmyReturned_Desktop,
                                                   deployNavyArrived_Desktop, deployNavyReturned_Desktop,
                                                   pillageLoaded_Desktop, pillageArrived_Desktop, pillageReturned_Desktop,
                                                   /*ignoredHostileMissions*/]),
             new IkaTools.UI.SettingsWindow.Group(localizer.localize('settings','debug'),
                                                  [debugSetting, resetData, espionageDebugSetting, resetEspionageData,
                                                   exceptionLogSetting, refreshDataSetting, viewCaptureSetting, dataExportSetting]),
            ]);
        settingsWindow.registerSavedSettingsHandler(function reloadOnSavedSettings() {
            window.location.reload();
        });
        settingsWindow.addAsScriptOptionsLink();
    }

    function Updateable(container, permanent, ids) {
        this.container = container;
        this.ids = $.makeArray(ids);
        this.elements = [];
        if (!this.ids.length) {
            this.ids[0] = IkaTools.Utils.nextId("updateable_");
        }
        this.permanent = permanent;
        this.events = {};
    }

    $.extend(Updateable.prototype, {
        getElement: function getElement(index) {
            var element = this.elements[index];
            if (!element || !element.length) {
                element = $(document.getElementById(this.ids[index]));
                this.elements[index] = element;
            }
            return element;
        },
        getElements: function getElements() {
            for (var i = 0; i < this.ids.length; i++) {
                this.getElement(i);
            }
            return this.elements;
        },
        destroy: function destroy() {
            return this.container.destroy(this);
        },
        getId: function getId(index) {
            return this.ids[index];
        },
        getIdentifier: function getIdentifier() {
            return this.ids.join(',');
        },
        isPermanent: function isPermanent() {
            return this.permanent;
        },
        registerUpdate: function registerUpdate(eventName, f) {
            this.events[eventName] = f;
            return this;
        },
        updateForEvent: function updateForEvent(eventName) {
            var f = this.events[eventName];
            if (f) {
                f.apply(this, this.getElements());
            }
        },
        registerTickerUpdate: function registerTickerUpdate(f) {
            return this.registerUpdate('ticker', f);
        },
        registerFastTickerUpdate: function registerFastTickerUpdate(f) {
            return this.registerUpdate('fastTicker', f);
        },
    });

    function Updateables(name) {
        this.name = name;
        this.active = false;
        this.undispatchedEvents = {};
        this.updateables = {};
    }

    $.extend(Updateables.prototype, {
        create: function create() {
            var updateable = new Updateable(this, false, arguments);
            this.updateables[updateable.getIdentifier()] = updateable;
            return updateable;
        },
        createPermanent: function createPermanent() {
            var updateable = new Updateable(this, true, arguments)
            this.updateables[updateable.getIdentifier()] = updateable;
            return updateable;
        },
        destroy: function destroy(updateable) {
            delete this.updateables[updateable.getIdentifier()];
        },


        activate: function activate() {
            $.each(this.updateables, function (key, updateable) {
                updateable.getElements();
            });
            if (!this.tickerEvent) {
                this.tickerEvent = setInterval(IkaTools.Logging.debuggable(
                    { label: 'Imperator.Updateable.tickerUpdate[' +  this.name + ']', },
                    this.updateForEvent.bind(this, 'ticker')),
                                               4000);
            }
            if (!this.fastTickerEvent) {
                this.fastTickerEvent = setInterval(IkaTools.Logging.debuggable(
                    {label: 'Imperator.Updateable.fastTickerUpdate[' +  this.name + ']', },
                    this.updateForEvent.bind(this, 'fastTicker')),
                                                   1000);
            }
            this.active = true;
            this.updateForEvent('ticker');  // ← PATCH : premier passage immédiat
            $.each(this.undispatchedEvents, this.updateForEvent.bind(this));
            this.undispatchedEvents = {};
        },


        deactivate: function deactivate() {
            this.active = false;
            if (this.tickerEvent) {
                clearInterval(this.tickerEvent);
                delete this.tickerEvent;
            }
            if (this.fastTickerEvent) {
                clearInterval(this.fastTickerEvent);
                delete this.fastTickerEvent;
            }
        },
        updateForEvent: function updateForEvent(eventName) {
            if (this.active) {
                $.each(this.updateables, function(id, updateable) {
                    updateable.updateForEvent(eventName);
                });
            } else {
                this.undispatchedEvents[eventName] = true;
            }
        },
        clear: function clear() {
            var that = this;
            $.each(this.updateables, function(id, updateable) {
                if (!updateable.isPermanent()) {
                    delete that.updateables[id];
                }
            });
            this.undispatchedEvents = {};
        },
    });

    var clickHandler = function() {
        var idToHandlerMap = {};

        return {
            register: function register(id, f) {
                idToHandlerMap[id] = f;
            },
            dispatch: function(element) {
                var handler = idToHandlerMap[element.id];
                if (handler) {
                    handler();
                    return true;
                } else {
                    IkaTools.Logging.debug("No registered handler for ", element.id, element);
                    return false;
                }
            },
        }
    }();

    $('#container').on('click.imperator_link_handler', '.imperator_link',
                       IkaTools.Logging.debuggable('Imperator.overview.imperator_link.clicked',
                                                   function(e) {
        if (clickHandler.dispatch(e.currentTarget)) {
            e.preventDefault();
        }
    }));

    function Link(id) {
        this.id = id;
    }

    $.extend(Link.prototype, {
        getId: function getId() {
            return this.id;
        },
        toFunction: function toFunction(f, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate()) {
                    f();
                }
            });
            return this;
        },
        toCitysIslandView: function toCitysIslandView(city, view, params, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate()) {
                    IkaTools.View.goToCitysIslandView(city, view, params);
                }
            });
            return this;
        },
        toLocalView: function toLocalView(view, params, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate()) {
                    IkaTools.View.goToLocalView(view, params);
                }
            });
            return this;
        },
        toCityView: function toCityView(city, view, params, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate()) {
                    IkaTools.View.goToCityView(city, view, params);
                }
            });
            return this;
        },
        toCityActivation: function toCityActivation(city, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate(this)) {
                    IkaTools.View.activateCity(city);
                }
            });
            return this;
        },
        toIkariamPage: function toIkariamPage(params, anchor, predicate) {
            clickHandler.register(this.id, function() {
                if (!predicate || predicate(this)) {
                    IkaTools.View.goToIkariamFullPage(params, anchor);
                }
            });
            return this;
        },
    });

    var toolTips = new IkaTools.UI.ToolTipHandler(
        'imperator_tool_tip', $('<div class="tool_tip_container"/>'));
    toolTips.startHandling($('body'));

    function overviewTables() {
        // v2.41 : accès à la fenêtre d'Imperator pour les onglets, renseigné par 99-popup-menu
        // (les onglets ne dépendent plus du fichier qui les assemble).
        var _impPopupProvider = null;
        function impPopup() { return _impPopupProvider(); }

        function Tab(name, tabText, tabContentHolder, tabContentId, init, renderer) {
            this.updateables = new Updateables(name);

            var render = renderer.bind(this);
            this.mainUpdateable = this.updateables.createPermanent(tabContentId);
            this.mainUpdateable.registerUpdate('redraw', function(element) {
                element.removeClass(
                    'city_type_ownCity city_type_deployedCities city_type_occupiedCities');
                element.addClass('city_type_' + IkaTools.View.getCurrentCity().getType());
                element.html(render());
            });
            this.mainUpdateable.registerUpdate('cityChanged', function updateTabTableType(table) {
                table.removeClass(
                    'city_type_ownCity city_type_deployedCities city_type_occupiedCities');
                table.addClass('city_type_' + IkaTools.View.getCurrentCity().getType());
            });

            this.isActive = false;
            this.needsRedraw = true;
            this.render = renderer; // réactivé

            var tab = this;
            this.initFirstTime = IkaTools.Utils.thunk(function() {
                IkaTools.View.registerIkariamAjaxResponseCallback(function tab_CityChanged() {
                    tab.updateables.updateForEvent('cityChanged');
                    tab.maybeRedraw(true);
                });
                init.call(tab);
            });

            this.tab = new IkaTools.UI.TabPane.Tab(
                $('<b>%s</b>'.format(tabText)),
                tabContentHolder,
                {
                    activatedCallback: function() {
                        this.isActive = true;
                        this.maybeRedraw();
                        this.initFirstTime();
                        this.updateables.activate();


                    }.bind(this),
                    deactivatedCallback: function() {
                        this.isActive = false;
                        this.updateables.deactivate();
                    }.bind(this),
                });
        }

        $.extend(Tab.prototype, {
            maybeRedraw: function maybeRedraw(redraw) {
                this.needsRedraw = this.needsRedraw || redraw;
                if (this.isActive && this.needsRedraw) {
                    this.updateables.clear();
                    this.mainUpdateable.updateForEvent('redraw');
                    this.needsRedraw = false;
                }
            },
            getTab: function getTab() {
                return this.tab;
            }
        });

        // ============================================================
        // v2.13 : Bénédictions divines — repères visuels (onglet Ressources)
        // Source : Sanctuaire divin (onglets Vénérer + Vue générale, même réponse).
        // Mécanique (wiki Ikariam, vérifiée niv. 49 -> 101 %) :
        //   bénédiction max      = 3 + 2 × niveau du Sanctuaire
        //   bénédiction par ville = max × (0,4 + 0,6 × jauge / 1000)
        //   chaque don de 100 faveurs relance la protection à 3 jours ;
        //   protection écoulée => la jauge baisse (vitesse encore inconnue).
        // États : max (jauge 1000 + protection) / soon (fin de protection proche)
        //         weak (en baisse) / floor (jauge 0, bonus de base 40 %).
        // ============================================================
        var IMP_GODS = {
            // resource : ressource dont la production est bénie.
            // Pan -> bois : hypothèse (recherche « Seigneur des bois »), à confirmer.
            // Tyché : inconnue -> repli sur la ressource de luxe de la ville.
            '1': { name:'Pan',        color:'#7cb342', bg:'rgba(124,179,66,0.15)',  resource:'wood'   },
            '2': { name:'Dionysos',   color:'#9b5fc0', bg:'rgba(155,95,192,0.15)',  resource:'wine'   },
            '3': { name:'Tyché',      color:'#ec407a', bg:'rgba(236,64,122,0.15)',  resource:null     },
            '4': { name:'Pluton',     color:'#d4a017', bg:'rgba(212,160,23,0.15)',  resource:'gold'   },
            '5': { name:'Théia',      color:'#26c6da', bg:'rgba(38,198,218,0.15)',  resource:'glass'  },
            '6': { name:'Héphaïstos', color:'#c98a1a', bg:'rgba(201,138,26,0.15)',  resource:'sulfur' }
        };
        var IMP_BLESS_STALE_MS = 24 * 3600 * 1000; // au-delà : données jugées anciennes
        var IMP_BLESS_FAVOR_MAX = 1000;

        function impBlessSoonMs() {
            var h = parseInt(blessSoonThreshold && blessSoonThreshold.getValue ? blessSoonThreshold.getValue() : '12', 10);
            return (isFinite(h) && h > 0 ? h : 12) * 3600 * 1000;
        }

        function impBlessShrine() {
            try {
                var civ = IkaTools.EmpireData.getCivilizationData();
                return (civ && civ.getShrineData) ? civ.getShrineData() : {};
            } catch (e) { return {}; }
        }

        // Ville qui possède le Sanctuaire (+ position et niveau)
        function impBlessShrineCity() {
            try {
                var cities = IkaTools.EmpireData.getOwnCities();
                for (var i = 0; i < cities.length; i++) {
                    var b = cities[i] && cities[i].getBuildingByType
                        ? cities[i].getBuildingByType(IkaTools.Constants.Buildings.DIVINE_SANCTUARY) : null;
                    if (b) return { city: cities[i],
                                    position: b.getPosition ? b.getPosition() : null,
                                    level: b.getLevel ? parseInt(b.getLevel(), 10) : null };
                }
            } catch (e) {}
            return null;
        }

        // Bénédiction lue la plus haute (repli si le niveau du Sanctuaire est inconnu)
        function impBlessRefBonus() {
            var ref = null;
            try {
                $.each(IkaTools.EmpireData.getOwnCities(), function(i, c) {
                    var b = c && c.worshipGodBonus;
                    if (typeof b === 'number' && isFinite(b) && (ref === null || b > ref)) ref = b;
                });
            } catch (e) {}
            return ref;
        }

        // Bénédiction maximale : 3 + 2 × niveau (repli : plus haute valeur lue)
        function impBlessMaxBonus(refBonus) {
            var s = impBlessShrineCity();
            if (s && s.level && isFinite(s.level) && s.level > 0) return 3 + 2 * s.level;
            return (refBonus !== undefined) ? refBonus : impBlessRefBonus();
        }

        // Bénédiction par ville pour une jauge donnée
        function impBlessBonusForFavor(maxBonus, favor) {
            if (maxBonus === null || maxBonus === undefined || favor === null || favor === undefined) return null;
            var f = Math.max(0, Math.min(IMP_BLESS_FAVOR_MAX, favor));
            return maxBonus * (0.4 + 0.6 * f / IMP_BLESS_FAVOR_MAX);
        }

        // État à un instant donné (aussi utilisé par le ticker).
        // favor : jauge lue (null si inconnue) ; weakFlag : repli sur la bénédiction lue.
        function impBlessStateAt(graceEnd, favor, weakFlag, now) {
            if (favor === 0) return 'floor';
            var full = (favor === null || favor === undefined) ? !weakFlag : favor >= IMP_BLESS_FAVOR_MAX;
            if (!full) return 'weak';
            if (!graceEnd) return 'max'; // pas de durée connue : on se fie à la jauge
            var rem = graceEnd - now;
            if (rem <= 0) return 'weak'; // protection écoulée : la jauge baisse
            if (rem <= impBlessSoonMs()) return 'soon';
            return 'max';
        }

        // Toutes les infos de bénédiction d'une ville (null si aucun dieu)
        function impBlessInfo(city, refBonus) {
            if (!city || !city.worshipGodId) return null;
            var gid = String(city.worshipGodId);
            var meta = IMP_GODS[gid];
            if (!meta) return null;
            var sd = impBlessShrine();
            var g = (sd.gods && sd.gods[gid]) || null;
            var now = Date.now();
            if (refBonus === undefined) refBonus = impBlessRefBonus();
            var maxBonus = impBlessMaxBonus(refBonus);
            var readBonus = (typeof city.worshipGodBonus === 'number' && isFinite(city.worshipGodBonus)) ? city.worshipGodBonus : null;
            var favor = (g && typeof g.favor === 'number' && isFinite(g.favor)) ? g.favor : null;
            // Bénédiction : calculée depuis la jauge (exacte), sinon celle lue dans Vénérer
            var bonus = (favor !== null) ? impBlessBonusForFavor(maxBonus, favor) : readBonus;
            var weakFlag = (favor === null && readBonus !== null && maxBonus !== null && readBonus < maxBonus - 0.01);
            var graceEnd = g ? g.graceEnd : null;
            return {
                godId: gid, name: meta.name, color: meta.color, bg: meta.bg,
                resource: meta.resource || (city.getTradeGoodType ? city.getTradeGoodType() : null),
                favor: favor, maxBonus: maxBonus, bonus: bonus,
                graceEnd: graceEnd, weakFlag: weakFlag,
                stale: !g || (now - (sd.godsUpdated || 0) > IMP_BLESS_STALE_MS),
                lastUpdate: Math.max(sd.godsUpdated || 0, city.worshipGodUpdated || 0),
                state: impBlessStateAt(graceEnd, favor, weakFlag, now)
            };
        }

        function impBlessFmtRemaining(ms) {
            if (ms === null || ms === undefined || !isFinite(ms)) return '?';
            if (ms <= 0) return 'terminée';
            var m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mn = m % 60;
            if (d > 0) return d + 'j ' + h + 'h';
            if (h > 0) return h + 'h ' + (mn < 10 ? '0' : '') + mn + 'm';
            return mn + 'm';
        }

        function impBlessFmtAgo(ts) {
            if (!ts) return 'jamais';
            var m = Math.floor((Date.now() - ts) / 60000);
            if (m < 1) return "à l'instant";
            if (m < 60) return 'il y a ' + m + ' min';
            var h = Math.floor(m / 60);
            if (h < 48) return 'il y a ' + h + ' h';
            return 'il y a ' + Math.floor(h / 24) + ' j';
        }

        function impBlessFmtPct(v) {
            return (v === null || v === undefined || !isFinite(v)) ? '?' : v.toFixed(1).replace('.', ',') + ' %';
        }

        var IMP_BLESS_STATE_LABEL = { max:'Au max', soon:'Fin de protection proche', weak:'En baisse', floor:'Plancher' };

        function impBlessStateClasses(state, stale) {
            return 'imp-bless imp-bless-' + state + (stale ? ' imp-bless-stale' : '');
        }

        // Attributs lus par le ticker pour faire évoluer l'état sans redessiner
        function impBlessDataAttrs(info) {
            return ' data-imp-bless-end="' + (info.graceEnd || 0) + '"' +
                   ' data-imp-bless-favor="' + (info.favor === null || info.favor === undefined ? '' : info.favor) + '"' +
                   ' data-imp-bless-weak="' + (info.weakFlag ? 1 : 0) + '"' +
                   ' style="--imp-bless-c:' + info.color + ';--imp-bless-bg:' + info.bg + '"';
        }

        // Texte court d'une pastille du bandeau
        function impBlessChipLabel(state, graceEnd, favor, now) {
            if (state === 'max' || state === 'soon') return graceEnd ? impBlessFmtRemaining(graceEnd - now) : 'au max';
            if (state === 'floor') return 'plancher';
            if (favor !== null && favor !== undefined && favor < IMP_BLESS_FAVOR_MAX) return favor + '/' + IMP_BLESS_FAVOR_MAX;
            return 'en baisse';
        }

        // Contenu de l'infobulle (régénéré chaque seconde via registerRefreshable)
        function impBlessToolTipHtml(info, productionPerHour) {
            var now = Date.now();
            var state = impBlessStateAt(info.graceEnd, info.favor, info.weakFlag, now);
            var lowered = (state === 'weak' || state === 'floor');
            // Protection écoulée depuis la lecture : la jauge lue n'est plus d'actualité
            var driftSinceRead = info.graceEnd && info.graceEnd <= now &&
                                 info.favor !== null && info.favor >= IMP_BLESS_FAVOR_MAX;
            var rows = [];
            rows.push('<div class="imp-bless-tt-head" style="color:' + info.color + '">' + info.name +
                      ' <span class="imp-bless-tt-state imp-bless-tt-' + state + '">' + IMP_BLESS_STATE_LABEL[state] + '</span></div>');

            // Protection
            if (info.graceEnd && info.graceEnd > now) {
                rows.push('<div>Protection : encore <b>' + impBlessFmtRemaining(info.graceEnd - now) + '</b></div>');
            } else if (info.graceEnd) {
                rows.push('<div>Protection : <b>terminée</b>, la jauge baisse</div>');
            } else {
                rows.push('<div>Protection : <i>inconnue</i></div>');
            }

            // Jauge + bénédiction
            if (info.favor !== null) {
                rows.push('<div>Jauge : <b>' + info.favor + ' / ' + IMP_BLESS_FAVOR_MAX + '</b>' +
                          (driftSinceRead ? ' <i>(à la lecture)</i>' : '') + '</div>');
            }
            if (info.bonus !== null) {
                rows.push('<div>Bénédiction : <b>' + impBlessFmtPct(info.bonus) + '</b>' +
                          (info.maxBonus !== null && lowered && !driftSinceRead ? ' sur ' + impBlessFmtPct(info.maxBonus) : '') +
                          (driftSinceRead ? ' <i>(à la lecture)</i>' : '') + '</div>');
            }

            // Production (hors Pluton) : part divine au max, manque à gagner sinon.
            // prod × b / (100 + b) et prod × (max − b) / (100 + b) : ignorent les autres bonus
            // (Cinématorium...) => légère surestimation, d'où le « ≈ ».
            if (info.resource !== 'gold' && productionPerHour > 0 && info.bonus !== null) {
                if (!lowered) {
                    rows.push('<div>Part divine ≈ <b>+' + IkaTools.Intl.formatInteger(productionPerHour * info.bonus / (100 + info.bonus)) + '/h</b></div>');
                } else if (!driftSinceRead && info.maxBonus !== null && info.maxBonus > info.bonus) {
                    rows.push('<div class="imp-bless-tt-warn">Manque à gagner ≈ <b>−' +
                              IkaTools.Intl.formatInteger(productionPerHour * (info.maxBonus - info.bonus) / (100 + info.bonus)) + '/h</b></div>');
                }
            }

            // Ce qu'il faut donner
            if (lowered) {
                if (info.favor !== null && info.favor < IMP_BLESS_FAVOR_MAX) {
                    rows.push('<div>Pour revenir au max : <b>' + (IMP_BLESS_FAVOR_MAX - info.favor) + ' faveurs</b>' +
                              (info.maxBonus !== null ? ' (+' + impBlessFmtPct(info.maxBonus * 0.06) + ' par tranche de 100)' : '') + '</div>');
                } else {
                    rows.push('<div>Ouvrez le Sanctuaire pour lire la jauge actuelle.</div>');
                }
            }

            rows.push('<div class="imp-bless-tt-foot">Sanctuaire lu ' + impBlessFmtAgo(info.lastUpdate) +
                      (info.stale ? ', ouvrez-le pour actualiser' : '') + '</div>');
            return '<div class="imp-bless-tt">' + rows.join('') + '</div>';
        }

        // Bandeau de pastilles au-dessus du tableau (rendu dans un <caption>)
        function impBlessMakeCaption() {
            var sd = impBlessShrine();
            var ref = impBlessRefBonus();
            var counts = {}, weakByGod = {};
            $.each(IkaTools.EmpireData.getOwnCities(), function(i, c) {
                var info = impBlessInfo(c, ref);
                if (!info) return;
                counts[info.godId] = (counts[info.godId] || 0) + 1;
                if (info.weakFlag) weakByGod[info.godId] = true;
            });
            var ids = $.map(counts, function(v, k) { return k; });
            if (!ids.length) return '';
            var now = Date.now();
            var rank = { floor:0, weak:1, soon:2, max:3 };
            var toGive = 0, unknownGive = false;
            var rows = $.map(ids, function(gid) {
                var g = (sd.gods && sd.gods[gid]) || null;
                var favor = (g && typeof g.favor === 'number') ? g.favor : null;
                var end = g ? g.graceEnd : null;
                var state = impBlessStateAt(end, favor, !!weakByGod[gid], now);
                if (state === 'weak' || state === 'floor') {
                    if (favor !== null && favor < IMP_BLESS_FAVOR_MAX) toGive += IMP_BLESS_FAVOR_MAX - favor;
                    else unknownGive = true;
                }
                return { gid: gid, favor: favor, end: end, state: state };
            });
            // Tri : les plus urgents d'abord (plancher, en baisse, puis fin de protection la plus proche)
            rows.sort(function(a, b) {
                if (rank[a.state] !== rank[b.state]) return rank[a.state] - rank[b.state];
                return (a.end || Infinity) - (b.end || Infinity);
            });
            var stale = !sd.godsUpdated || (now - sd.godsUpdated > IMP_BLESS_STALE_MS);
            var chips = $.map(rows, function(r) {
                var meta = IMP_GODS[r.gid];
                var info = { graceEnd: r.end, favor: r.favor, weakFlag: !!weakByGod[r.gid], color: meta.color, bg: meta.bg };
                return '<a href="javascript:void(0);" class="imp-bless-chip ' + impBlessStateClasses(r.state, false) + '"' +
                       impBlessDataAttrs(info) + ' title="Ouvrir le Sanctuaire divin">' +
                       '<span class="imp-bless-dot"></span>' + meta.name + ' (' + counts[r.gid] + ')' +
                       ' <span class="imp-bless-rem">' + impBlessChipLabel(r.state, r.end, r.favor, now) + '</span></a>';
            }).join('');
            var give = '';
            if (toGive > 0 || unknownGive) {
                give = '<span class="imp-bless-bar-give">À donner : <b>' + (toGive > 0 ? IkaTools.Intl.formatInteger(toGive) : '') +
                       (unknownGive ? (toGive > 0 ? ' + ?' : '?') : '') + '</b>' +
                       (sd.favor ? ' / ' + IkaTools.Intl.formatInteger(sd.favor) + ' disponibles' : '') + '</span>';
            }
            return '<caption class="imp-bless-bar">' +
                   '<span class="imp-bless-bar-label">Bénédictions</span>' + chips + give +
                   '<span class="imp-bless-bar-upd' + (stale ? ' is-stale' : '') + '">Sanctuaire lu ' +
                   impBlessFmtAgo(sd.godsUpdated) + '</span></caption>';
        }

        // CSS + ticker + clic des pastilles : installés une seule fois
        var _impBlessInstalled = false;
        function impBlessInstallOnce() {
            if (_impBlessInstalled) return;
            _impBlessInstalled = true;
            GM_addStyle(
                '#ImperatorOverviewResourceTable td.imp-bless { position:relative; background-color:var(--imp-bless-bg) !important; box-shadow:inset 0 0 0 2px var(--imp-bless-c); }' +
                '#ImperatorOverviewResourceTable td.imp-bless-soon::after { content:""; position:absolute; top:2px; right:2px; width:7px; height:7px; border-radius:50%; background:#ef6c00; box-shadow:0 0 0 1px #fff8e1; }' +
                '#ImperatorOverviewResourceTable td.imp-bless-weak { background-color:rgba(192,57,43,0.07) !important; box-shadow:inset 0 0 0 2px rgba(192,57,43,0.55); background-image:repeating-linear-gradient(135deg, transparent 0 5px, rgba(192,57,43,0.08) 5px 7px); }' +
                '#ImperatorOverviewResourceTable td.imp-bless-floor { background-color:rgba(0,0,0,0.04) !important; box-shadow:inset 0 0 0 2px #a1978a; }' +
                '#ImperatorOverviewResourceTable td.imp-bless-stale::before { content:"\\23F1"; position:absolute; bottom:1px; right:2px; font-size:9px; line-height:9px; opacity:.55; }' +
                '.imp-bless-badge { display:inline-block; width:11px; height:11px; margin-left:4px; vertical-align:-1px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #ffe082, var(--imp-bless-c) 70%); box-shadow:0 0 0 1px rgba(90,62,27,.45); cursor:help; position:relative; }' +
                '.imp-bless-badge.imp-bless-soon { box-shadow:0 0 0 2px #ef6c00; }' +
                '.imp-bless-badge.imp-bless-weak { background:radial-gradient(circle at 35% 35%, #f3e5c0, #bfa36a 70%); box-shadow:0 0 0 1px #c0392b; }' +
                '.imp-bless-badge.imp-bless-floor { background:#bdb3a0; box-shadow:0 0 0 1px #8a7f70; }' +
                '#ImperatorOverviewResourceTable caption.imp-bless-bar { caption-side:top; text-align:left; padding:3px 2px 5px; font-size:11px; color:#5a3e1b; white-space:normal; }' +
                '.imp-bless-bar-label { font-weight:bold; margin-right:6px; }' +
                '.imp-bless-chip { display:inline-block; margin:1px 5px 1px 0; padding:1px 7px 1px 5px; border-radius:9px; background:var(--imp-bless-bg); border:1px solid var(--imp-bless-c); color:#5a3e1b !important; text-decoration:none !important; cursor:pointer; }' +
                '.imp-bless-chip:hover, .imp-bless-chip:focus { background:#fff8e1; outline:none; box-shadow:0 0 0 1px var(--imp-bless-c); }' +
                '.imp-bless-chip .imp-bless-dot { display:inline-block; width:7px; height:7px; margin-right:4px; border-radius:50%; background:var(--imp-bless-c); vertical-align:0; }' +
                '.imp-bless-chip .imp-bless-rem { font-weight:bold; }' +
                '.imp-bless-chip.imp-bless-soon .imp-bless-rem { color:#ef6c00; }' +
                '.imp-bless-chip.imp-bless-weak { border-style:dashed; border-color:#c0392b; background:rgba(192,57,43,0.07); }' +
                '.imp-bless-chip.imp-bless-weak .imp-bless-rem { color:#c0392b; }' +
                '.imp-bless-chip.imp-bless-floor { border-color:#a1978a; background:rgba(0,0,0,0.04); }' +
                '.imp-bless-chip.imp-bless-floor .imp-bless-dot { background:#a1978a; }' +
                '.imp-bless-bar-give { margin-left:6px; }' +
                '.imp-bless-bar-upd { float:right; color:#8a6d39; font-style:italic; }' +
                '.imp-bless-bar-upd.is-stale { color:#c0392b; font-style:normal; font-weight:bold; }' +
                '.imp-bless-tt { margin-top:4px; padding:4px 6px; border-top:1px solid #d8b871; font-size:11px; line-height:1.45; color:#5a3e1b; min-width:190px; }' +
                '.imp-bless-tt-head { font-weight:bold; }' +
                '.imp-bless-tt-state { font-weight:normal; font-size:10px; margin-left:4px; padding:0 4px; border-radius:6px; color:#fff; }' +
                '.imp-bless-tt-max { background:#558b2f; } .imp-bless-tt-soon { background:#ef6c00; } .imp-bless-tt-weak { background:#c0392b; } .imp-bless-tt-floor { background:#8a7f70; }' +
                '.imp-bless-tt-warn { color:#c0392b; }' +
                '.imp-bless-tt-foot { color:#8a6d39; font-style:italic; margin-top:2px; }'
            );

            // Ticker : fait évoluer états et libellés sans redessiner le tableau
            setInterval(function impBlessTick() {
                try {
                    if (document.hidden) return; // v2.35 : onglet du navigateur en arrière-plan
                    var now = Date.now();
                    $('[data-imp-bless-end]').each(function() {
                        var $e = $(this);
                        var end = parseInt($e.attr('data-imp-bless-end'), 10) || null;
                        var fAttr = $e.attr('data-imp-bless-favor');
                        var favor = (fAttr === '' || fAttr === undefined) ? null : parseInt(fAttr, 10);
                        var weak = $e.attr('data-imp-bless-weak') === '1';
                        var state = impBlessStateAt(end, favor, weak, now);
                        $e.removeClass('imp-bless-max imp-bless-soon imp-bless-weak imp-bless-floor').addClass('imp-bless-' + state);
                        $e.find('.imp-bless-rem').text(impBlessChipLabel(state, end, favor, now));
                    });
                } catch (e) {}
            }, 30000);

            // Clic sur une pastille -> Sanctuaire divin, onglet Vue générale
            $(document).on('click', '.imp-bless-chip', function(ev) {
                ev.preventDefault();
                var s = impBlessShrineCity();
                if (!s) return;
                var params = { cityId: s.city.getId(), activeTab: 'tabOverview' };
                if (s.position !== null && s.position !== undefined) params.position = s.position;
                IkaTools.View.goToCityView(s.city, IkaTools.Constants.Buildings.DIVINE_SANCTUARY, params);
            });
        }

        function makeCityNameCells(table, city, excludeTradeGood) {
            var cityLink = new Link('CityLink_%s_%s'.format(table, city.getId()))
            .toCityActivation(city);
            // v2.12 : badge Pluton (bénédiction en or) dans l'onglet Ressources
            var blessBadge = '';
            if (table === 'resources') {
                try {
                    var bInfo = impBlessInfo(city);
                    if (bInfo && bInfo.resource === 'gold') {
                        var badgeId = 'ImpBlessBadge_' + city.getId();
                        blessBadge = '<span id="' + badgeId + '" class="imp-bless-badge imperator_tool_tip ' +
                                     impBlessStateClasses(bInfo.state, false) + '"' + impBlessDataAttrs(bInfo) + '></span>';
                        toolTips.registerRefreshable(badgeId, function() { return impBlessToolTipHtml(bInfo, 0); });
                    }
                } catch (eB) {}
            }
            return ('%s' +
                    '<td class="city_name">' +
                    '<a class="imperator_link" id="%s" href="javascript:void(0)">%s</a>' + blessBadge +
                    '</td>').format(
                (excludeTradeGood ? '' : ('<td class="city_tradegood imperator_link ">' +
                                          '<img src="/cdn/all/both/resources/icon_%s.png">' +
                                          '</td>').format(city.getTradeGoodType())),
                cityLink.getId(),
                __impH(city.getName()));
        }

        function makeCityNameColGroup(extraCols, excludeTradeGood) {
            return ('<colgroup class="city_name">' +
                    '%s' +
                    '<col class="city_name">' +
                    '%s' +
                    '</colgroup>').format(
                excludeTradeGood ? '' : '<col class="city_tradegood">',
                extraCols || '');
        }

        function makeCityNameHeaderCells(excludeTradeGood) {
            return '<th class="city_name" colspan="%s">%s</th>'.format(
                excludeTradeGood ? '1' : '2',
                localizer.localize('misc','city_name'));
        }
        // v2.41 : outils communs aux onglets Chantiers et Boissons (calculs de transport, envois,
        // préférences, réouverture après un transport), sortis de chantiers.js et boissons.js.

        var openResourcesTabOnTransportClose = false;
        var openBuildingsTabOnTransportClose = false;
        var openMilitaryTabOnDeploymentClose = false;

        //////////////////
        // Patch BLOC 1 //
        //////////////////

             /* ===== IMPERATOR — Onglet Chantiers (natif) ===== */
        var __IMP_CAP_FAST = 580; // capacité navire marchand (unité de la couche 2)

        function __impEsc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
        function __impFmt(n){ try { return IkaTools.Intl.formatInteger(Math.round(n)); } catch(e){ return String(Math.round(n)); } }

        /* ---- Persistance (survit aux rechargements de page) -------------- */
        window.__impSaveChantiers = function(){
            try{ GM_setValue('imperator_chantiers', JSON.stringify(window.ImperatorChantiers||[])); }catch(e){}
        };
        window.__impLoadChantiers = function(){
            try{ var raw=GM_getValue('imperator_chantiers','[]'); var a=JSON.parse(raw); if(a && a.length!==undefined) window.ImperatorChantiers=a; }catch(e){}
            if(!window.ImperatorChantiers || window.ImperatorChantiers.length===undefined) window.ImperatorChantiers=[];
        };
        window.__impLoadChantiers();

        /* ---- Villes protégées : on ne puise jamais dans leurs ressources ---- */
        window.__impSaveProtected = function(){
            try{ GM_setValue('imperator_protected', JSON.stringify(window.ImperatorProtected||[])); }catch(e){}
        };
        window.__impLoadProtected = function(){
            try{ var raw=GM_getValue('imperator_protected','[]'); var a=JSON.parse(raw); if(a && a.length!==undefined) window.ImperatorProtected=a; }catch(e){}
            if(!window.ImperatorProtected || window.ImperatorProtected.length===undefined) window.ImperatorProtected=[];
        };
        window.__impLoadProtected();
        function __impIsProtected(cityId){
            var arr=window.ImperatorProtected; if(!arr || !arr.length) return false;
            var id=String(cityId);
            for (var i=0;i<arr.length;i++){ if(String(arr[i])===id) return true; }
            return false;
        }
        /* Réouverture auto de l'onglet Chantiers après un "Aller à" (qui recharge la page). */
        try{
            var __rt = GM_getValue('imperator_reopen_tab','');
            if (__rt){
                GM_setValue('imperator_reopen_tab','');
                setTimeout(function(){ try{ impPopup(); if(__rt==='boissons' && window.ImperatorOpenBoissons) window.ImperatorOpenBoissons(); else if(window.ImperatorOpenChantiers) window.ImperatorOpenChantiers(); }catch(e){} }, 700);
            }
        }catch(e){}

        function __impFindCity(cityId){
            try{
                var cities = IkaTools.EmpireData.getOwnCities();
                for (var i=0;i<cities.length;i++){ if (String(cities[i].getId())===String(cityId)) return cities[i]; }
            }catch(e){}
            return null;
        }
        function __impDist(a,b){
            if(!a||!b) return Infinity;
            var dx=Number(a[0])-Number(b[0]), dy=Number(a[1])-Number(b[1]);
            return Math.sqrt(dx*dx+dy*dy); // 0 = même île
        }
        function __impSurplus(city, resKey){
            var R = IkaTools.Constants.Resources, stock = 0;
            try{ if (city && __impIsProtected(city.getId())) return 0; }catch(e){} // ville protégée -> pas de surplus
            try { var rr = city.getResource(resKey); stock = (rr&&rr.getCurrent)?Math.floor(rr.getCurrent()):0; } catch(e){ return 0; }
            if (resKey === R.WINE){
                var isWine=false;
                try { isWine = (city.getTradeGoodType && city.getTradeGoodType()===R.WINE); } catch(e){}
                if (!isWine) return 0;
                return Math.max(0, stock - 100000);
            }
            return Math.max(0, stock);
        }

        /* ---- Contrat d'ENVOI (figé) --------------------------------------- */
        function __impMakeEnvoi(f){
            f = f || {};
            return {
                id:         f.id || ((f.chantierId||'?')+'_'+(f.fromCityId||'?')+'_'+(f.resource||'?')),
                chantierId: f.chantierId, fromCityId: f.fromCityId, toCityId: f.toCityId,
                resource:   f.resource, quantity: f.quantity || 0,
                fleet:      f.fleet || null, ships: (f.ships!=null?f.ships:null),
                etaMinutes: (f.etaMinutes!=null?f.etaMinutes:null),
                status:     f.status || 'planned'
            };
        }
        window.ImperatorMakeEnvoi = __impMakeEnvoi;

        /* ---- Couche 1 : BILAN --------------------------------------------- */
        /* ---- Rapprochement : transports r\u00e9els en route vers une ville ---- */
        function __impIncoming(cityId){
            var R=IkaTools.Constants.Resources, keys=[R.WOOD,R.WINE,R.MARBLE,R.GLASS,R.SULFUR];
            var res={}, byRes={}, soonest=null; keys.forEach(function(k){res[k]=0; byRes[k]=[];});
            try{
                var civ=IkaTools.EmpireData.getCivilizationData();
                var movs=civ?civ.getMovements():[];
                (movs||[]).forEach(function(mv){
                    try{
                        if (!mv || !mv.getMission) return;
                        if (mv.getMission()!==IkaTools.Constants.Movements.Mission.TRANSPORT) return;
                        if (String(mv.getTargetCityId())!==String(cityId)) return;
                        var a=mv.getArrivalTime?mv.getArrivalTime():null;
                        if (a!=null && (soonest==null||a<soonest)) soonest=a;
                        var fromId=mv.getOriginCityId?mv.getOriginCityId():null, fromName='';
                        try{ var fc=__impFindCity(fromId); fromName=(fc&&fc.getName)?fc.getName():(fromId?('ville '+fromId):'?'); }catch(e){}
                        keys.forEach(function(k){
                            var q=mv.getResource?(mv.getResource(k)||0):0;
                            if (q>0){ res[k]+=q; byRes[k].push({ fromId:fromId, fromName:fromName, qty:q, arrival:a }); }
                        });
                    }catch(e){}
                });
            }catch(e){}
            return { res:res, byRes:byRes, soonest:soonest };
        }
        /* ---- Clôture : niveau cible + état d'avancement du chantier ---- */
        function __impTargetLevel(levelText){
            var s=String(levelText||''), i=s.indexOf('\u00bb');
            if (i>-1){ var a=parseInt(s.slice(i+1),10); if(!isNaN(a)) return a; }
            var n=parseInt(s,10); return isNaN(n)?0:n+1;
        }
        function __impCompletion(c){
            try{
                var city=__impFindCity(c.cityId);
                if (!city || !city.getBuildingByPosition) return {state:null};
                var b=city.getBuildingByPosition(parseInt(c.position,10));
                if (!b) return {state:null};
                var target=__impTargetLevel(c.level), lvl=0;
                try{ lvl=b.getLevel(); }catch(e){}
                if (target>0 && lvl>=target) return {state:'done', target:target, level:lvl};           // niveau atteint
                if (b.isUpgrading && b.isUpgrading() && (lvl+1)>=target) return {state:'building', target:target, level:lvl}; // lancé
                return {state:null, target:target, level:lvl};
            }catch(e){ return {state:null}; }
        }
        function __impComputeBilan(ch){
            try{
                var city = __impFindCity(ch.cityId);
                if (!city) return { error:'ville introuvable' };
                var building = city.getBuildingByPosition ? city.getBuildingByPosition(ch.position) : null;
                if (!building) return { error:'b\u00e2timent introuvable' };
                var costs = building.getUpgradeCosts();
                var R = IkaTools.Constants.Resources;
                var defs = [[R.WOOD,'Bois'],[R.WINE,'Vin'],[R.MARBLE,'Marbre'],[R.GLASS,'Cristal'],[R.SULFUR,'Soufre']];
                var inc = __impIncoming(ch.cityId);
                var lines=[], total=0;
                defs.forEach(function(d){
                    var key=d[0], need=Math.ceil(costs[key]||0);
                    if (need<=0) return;
                    var stock=0;
                    try { var rr=city.getResource(key); stock=(rr&&rr.getCurrent)?Math.floor(rr.getCurrent()):0; } catch(e){}
                    var incoming=Math.floor((inc.res[key])||0);
                    var deficit=Math.max(0, need-stock-incoming);
                    total+=deficit;
                    lines.push({ key:key, label:d[1], need:need, stock:stock, incoming:incoming, deficit:deficit });
                });
                var name=''; try { name = localizer.localize('buildings', building.getType()) || ''; } catch(e){}
                var curLvl=0; try { curLvl = building.getLevel(); } catch(e){}
                return { ok:true, estimation:!costs._real, name:name, lines:lines, total:total,
                         currentLevel:curLvl, targetLevel:curLvl+1, ageMin:__impAge(city),
                         incomingSoonest: inc.soonest, incomingByRes: inc.byRes, cityName:(city.getName?city.getName():'') };
            } catch(err){ return { error:'exception', detail:String(err) }; }
        }

        /* ---- Couche 2 : ROUTAGE ------------------------------------------- */
        function __impComputeRoutage(ch, bilan){
            var CAP = __IMP_CAP_FAST;
            var target = __impFindCity(ch.cityId);
            var targetCoords = target ? target.getIslandCoordinates() : null;

            var sources = [];
            try {
                var cities = IkaTools.EmpireData.getOwnCities();
                for (var i=0;i<cities.length;i++){
                    var cc = cities[i];
                    if (String(cc.getId())===String(ch.cityId)) continue; // pas soi-même
                    sources.push({ city:cc, dist:__impDist(cc.getIslandCoordinates(), targetCoords) });
                }
                sources.sort(function(a,b){ return a.dist - b.dist; });
            } catch(e){}

            var result = { byResource:{}, allEnvois:[] };
            (bilan.lines||[]).forEach(function(l){
                if (l.deficit<=0) return;
                var resKey=l.key, D=l.deficit;
                var remainingShips = Math.ceil(D / CAP);
                var envois=[];
                for (var i=0;i<sources.length && remainingShips>0;i++){
                    var s=sources[i];
                    var surplus=__impSurplus(s.city, resKey);
                    var availShips=Math.floor(surplus / CAP);
                    if (availShips<=0) continue;               // pas de quoi remplir un navire
                    var takeShips=Math.min(availShips, remainingShips);
                    var env=__impMakeEnvoi({
                        chantierId:ch.id, fromCityId:s.city.getId(), toCityId:ch.cityId,
                        resource:resKey, quantity:takeShips*CAP
                    });
                    env._shipsFast=takeShips;
                    env._fromName=(s.city.getName?s.city.getName():String(s.city.getId()));
                    env._dist=s.dist;
                    envois.push(env); result.allEnvois.push(env);
                    remainingShips-=takeShips;
                }
                result.byResource[resKey] = { label:l.label, deficit:D, envois:envois,
                                              covered:(remainingShips<=0), missingShips:remainingShips };
            });
            return result;
        }

        var __IMP_CAP_CARGO = 50000, __IMP_SPEED_FAST = 75, __IMP_SPEED_CARGO = 4;
        function __impFreeShips(sel){
            try { var t=$(sel).first().text(); var n=parseInt(String(t).replace(/[^0-9]/g,''),10); return isNaN(n)?0:n; } catch(e){ return 0; }
        }
        function __impFmtDur(min){
            if (min==null || !isFinite(min)) return '?';
            min=Math.round(min);
            if (min<1) return '<1 min';
            if (min<60) return min+' min';
            if (min<1440){ var h=Math.floor(min/60),m=min%60; return h+'h'+(m?(' '+(m<10?'0':'')+m):''); }
            var j=Math.floor(min/1440), hh=Math.round((min%1440)/60); return j+'j '+hh+'h';
        }

        /* ---- Couche 3b : FLOTTE + MAKESPAN + ARBITRAGE (estimation) ------- */
        // Makespan d'une livraison FAST d'une quantité q d'une ressource (navires pleins).
        function __impFastMakespan(target, targetCoords, resKey, q, F){
            var CAP=__IMP_CAP_FAST;
            if (q<=0) return { makespanMin:0, totalShips:0, fits:true, rotations:0, srcs:[], covered:true };
            var src=[]; var cities=IkaTools.EmpireData.getOwnCities();
            for (var i=0;i<cities.length;i++){
                var cc=cities[i]; if (String(cc.getId())===String(target.getId())) continue;
                var sp=__impSurplus(cc,resKey); if (sp<CAP) continue;
                src.push({ city:cc, dist:__impDist(cc.getIslandCoordinates(),targetCoords), surplus:sp });
            }
            src.sort(function(a,b){return a.dist-b.dist;});
            var remShips=Math.ceil(q/CAP), total=0, used=[];
            for (var i=0;i<src.length && remShips>0;i++){
                var o=src[i], av=Math.floor(o.surplus/CAP); if (av<=0) continue;
                var take=Math.min(av,remShips), qty=take*CAP;
                var ls=0; try{ls=o.city.getLoadingSpeed();}catch(x){}
                var tms=0; try{tms=IkaTools.EmpireData.calculateTravelTime(o.city.getIslandCoordinates(),targetCoords,null,true);}catch(x){}
                var loadMin=(ls>0)?((qty/ls)/60):0, travelMin=tms/60000;
                used.push({ name:(o.city.getName?o.city.getName():''), ships:take, qty:qty, loadMin:loadMin, travelMin:travelMin, dist:o.dist });
                total+=take; remShips-=take;
            }
            var fits=total<=F, rot=fits?1:Math.ceil(total/Math.max(1,F)), maxArr=0, maxCyc=0;
            used.forEach(function(u){ var a=u.loadMin+u.travelMin, c=u.loadMin+2*u.travelMin; if(a>maxArr)maxArr=a; if(c>maxCyc)maxCyc=c; });
            return { makespanMin:(fits?maxArr:rot*maxCyc), totalShips:total, fits:fits, rotations:rot, srcs:used, covered:(remShips<=0) };
        }
        // Makespan d'une livraison CARGO de k navires (pleins) depuis les sources cargo-eligibles.
        function __impCargoMakespan(target, targetCoords, resKey, k){
            var CAPc=__IMP_CAP_CARGO, RATIO=__IMP_SPEED_FAST/__IMP_SPEED_CARGO;
            if (k<=0) return { makespanMin:0, ok:true, load:0, srcs:[] };
            var src=[]; var cities=IkaTools.EmpireData.getOwnCities();
            for (var i=0;i<cities.length;i++){
                var cc=cities[i]; if (String(cc.getId())===String(target.getId())) continue;
                var sp=__impSurplus(cc,resKey), ca=Math.floor(sp/CAPc); if (ca<=0) continue;
                src.push({ city:cc, dist:__impDist(cc.getIslandCoordinates(),targetCoords), ca:ca });
            }
            src.sort(function(a,b){return a.dist-b.dist;});
            var rem=k, used=[], maxArr=0;
            for (var i=0;i<src.length && rem>0;i++){
                var o=src[i], take=Math.min(o.ca,rem), qty=take*CAPc;
                var ls=0; try{ls=o.city.getLoadingSpeed();}catch(x){}
                var tms=0; try{tms=IkaTools.EmpireData.calculateTravelTime(o.city.getIslandCoordinates(),targetCoords,null,true);}catch(x){}
                var loadMin=(ls>0)?((qty/ls)/60):0, travelMin=(tms/60000)*RATIO, arr=loadMin+travelMin;
                used.push({ name:(o.city.getName?o.city.getName():''), ca:take, qty:qty, dist:o.dist });
                if (arr>maxArr) maxArr=arr; rem-=take;
            }
            return { makespanMin:maxArr, ok:(rem<=0), load:(k-rem)*CAPc, srcs:used };
        }
        // Arbitrage rapide vs mixte pour une matière.
        function __impArbitrage(ch, target, targetCoords, resKey, label, deficit, F, C){
            var CAPf=__IMP_CAP_FAST, CAPc=__IMP_CAP_CARGO;
            var L=Math.ceil(deficit/CAPf)*CAPf;
            var fast=__impFastMakespan(target,targetCoords,resKey,L,F);
            var best={ fleet:'rapide', makespanMin:fast.makespanMin, fast:fast, cargo:null, cargoShips:0, gain:0,
                       label:label, deficit:deficit, loaded:L, fastOnlyMS:fast.makespanMin, covered:fast.covered };
            var maxK=Math.min(C, Math.ceil(L/CAPc));
            for (var k=1;k<=maxK;k++){
                var cargo=__impCargoMakespan(target,targetCoords,resKey,k);
                if (!cargo.ok || cargo.load<=0) break;      // plus assez de surplus cargo-eligible
                var remaining=Math.max(0, L-cargo.load);
                var fastRem=__impFastMakespan(target,targetCoords,resKey,remaining,F);
                var mixedMS=Math.max(cargo.makespanMin, fastRem.makespanMin);
                if (mixedMS < best.makespanMin-0.01){
                    best={ fleet:'mixte', makespanMin:mixedMS, fast:fastRem, cargo:cargo, cargoShips:k,
                           gain:(fast.makespanMin-mixedMS), label:label, deficit:deficit, loaded:L,
                           fastOnlyMS:fast.makespanMin, covered:fast.covered };
                }
            }
            return best;
        }

        function __impComputeFlotte(ch, bilan){
            var F=__impFreeShips('#js_GlobalMenu_freeTransporters');
            var C=__impFreeShips('#js_GlobalMenu_freeFreighters');
            var target=__impFindCity(ch.cityId);
            var targetCoords=target?target.getIslandCoordinates():null;
            var materials=[], chMakespan=0;
            (bilan.lines||[]).forEach(function(l){
                if (l.deficit<=0) return;
                var arb=__impArbitrage(ch,target,targetCoords,l.key,l.label,l.deficit,F,C);
                materials.push(arb);
                if (arb.makespanMin>chMakespan) chMakespan=arb.makespanMin;
            });
            return { F:F, C:C, materials:materials, chantierMakespanMin:chMakespan };
        }
        /* ---- Brique : passage à l'exécution (pré-remplissage, 2 temps) --- */
        function __impFireEvents(el){
            ['input','change','keyup','blur'].forEach(function(t){ try{ el.dispatchEvent(new Event(t,{bubbles:true})); }catch(e){} });
        }
        function __impFillTransport(p){
            try{
                var q=document.getElementById('textfield_'+p.res);
                if (q){ q.value=p.qty; __impFireEvents(q); }
                var sid=(p.fleet==='cargo')?'selectedFreightersInput':'selectedTransportersInput';
                var sh=document.getElementById(sid);
                if (sh){ sh.value=p.ships; __impFireEvents(sh); }
            }catch(e){}
        }
        function __impStartPrefillWatch(){
            var tries=0;
            var iv=setInterval(function(){
                tries++;
                var p=window.__impPendingPrefill;
                if (!p){ clearInterval(iv); return; }
                if (document.getElementById('textfield_'+p.res) && document.getElementById('submit')){
                    __impFillTransport(p); window.__impPendingPrefill=null; clearInterval(iv);
                } else if (tries>24){ clearInterval(iv); } // ~6 s puis abandon silencieux
            },250);
        }
        function __impPrepareEnvoi(env){
            var src=__impFindCity(env.from), ok=false;
            try{ ok = src && IkaTools.View.isActiveCity(src); }catch(e){}
            if (!ok) return; // sécurité absolue : un transport part de la ville active
            window.__impPendingPrefill={ res:env.res, qty:env.qty, fleet:env.fleet||'fast', ships:env.ships };
            window.__impReopenAfterTransport = env.reopen || 'chantiers'; // rouvrir le bon onglet quand le transport se ferme
            try{ impPopup().close(); }catch(e){}
            try{
                IkaTools.View.goToLocalView(IkaTools.Constants.View.TRANSPORT, {
                    templateView: IkaTools.Constants.View.CITY_DETAIL, destinationCityId: env.to
                });
            }catch(e){}
            __impStartPrefillWatch();
        }

        /* ---- Fra\u00eecheur des donn\u00e9es (aucune requ\u00eate) ---------------------
         * L'instantan\u00e9 d'une ville se rafra\u00eechit quand tu la visites (capture
         * opportuniste native). On rend juste l'\u00e2ge des donn\u00e9es visible. */
        var __IMP_STALE_MIN = 30;
        function __impAge(city){
            try{
                if (!city || !city.getLastResourceUpdate) return null;
                if (!city.getLastResourceUpdate()) return null; // jamais mis \u00e0 jour
                var ms = city.getTimeSinceResourceUpdate ? city.getTimeSinceResourceUpdate() : 0;
                return Math.max(0, Math.round(ms/60000));
            }catch(e){ return null; }
        }
        function __impAgeTxt(m){
            if (m==null) return '?';
            if (m<1) return '\u00e0 l\u2019instant';
            if (m<60) return 'il y a '+m+' min';
            var h=Math.floor(m/60); return 'il y a '+h+'h'+((m%60)?(' '+(m%60)+'min'):'');
        }

        function __impInjectChantiersCSS(){
            if (document.getElementById('imp-ch-css')) return;
            var css =
              '#ImperatorOverviewChantiersTable td{padding:0;border:none;background:none;}' +
              '.imp-ch-wrap{font-family:sans-serif;color:#5A3E1B;padding:10px;}' +
              '.imp-ch-list{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start;}' +
              '.imp-ch-prot-wrap{margin-bottom:9px;padding-bottom:8px;border-bottom:1px solid #E4D3A5;}' +
              '.imp-ch-prot-h{font-size:10px;color:#8A6D39;margin-bottom:5px;}' +
              '.imp-ch-prot-list{display:flex;flex-wrap:wrap;gap:4px;}' +
              '.imp-ch-prot{font-size:11px;padding:2px 9px;border-radius:9px;border:1px solid #C6A85E;background:#F0E2C0;color:#8A6D39;text-decoration:none;}' +
              '.imp-ch-prot.on{background:#F3D0C0;border-color:#C97A54;color:#A34E1D;font-weight:600;}' +
              '#ImperatorOverviewBoissonsTable td{padding:0;border:none;background:none;}' +
              '.imp-boisson-group{border:1px solid #E4D3A5;background:#FCF5E1;border-radius:6px;padding:10px 12px;margin-bottom:8px;}' +
              '.imp-boisson-members{display:flex;flex-direction:column;gap:3px;margin-top:6px;}' +
              '.imp-boisson-mrow{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;font-size:12px;color:#5A3E1B;}' +
              '.imp-boisson-mrow .bnm{font-weight:600;min-width:92px;} .imp-boisson-mrow .blvl{color:#8A6D39;font-variant-numeric:tabular-nums;min-width:80px;}' +
              '.imp-boisson-mrow.def{background:#FBEFD9;border-radius:4px;padding:2px 5px;}' +
              '.imp-boisson-cfg{font-size:11px;font-weight:400;color:#8A6D39;margin-left:10px;}' +
              '.imp-boisson-trigger{width:82px;font-size:11px;padding:1px 4px;border:1px solid #B4914E;border-radius:4px;background:#FCF5E1;color:#5A3E1B;}' +
              '.imp-ch-head{font-size:14px;font-weight:600;margin-bottom:9px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}' +
              '.imp-ch-refresh-wrap{margin-left:auto;display:flex;align-items:center;gap:8px;font-weight:400;}' +
              '.imp-ch-refresh{font-size:11px;padding:3px 10px;border-radius:9px;border:1px solid #B4914E;background:#EFDEB2;color:#8A6D39;text-decoration:none;white-space:nowrap;cursor:pointer;}' +
              '.imp-ch-fresh{font-size:10px;color:#8A6D39;opacity:.85;}' +
              '.imp-ch-age{color:#8A6D39;opacity:.75;} .imp-ch-stale{color:#B5651D;font-weight:600;}' +
              '.imp-ch-count{background:#B98F45;color:#FBF4DE;border-radius:10px;font-size:11px;padding:1px 8px;margin-left:6px;}' +
              '.imp-ch-empty{font-size:12px;color:#8A6D39;text-align:center;padding:22px 10px;line-height:1.6;}' +
              '.imp-ch-row{display:flex;align-items:flex-start;gap:11px;padding:10px 12px;border:1px solid #E4D3A5;background:#FCF5E1;border-radius:6px;margin-bottom:6px;}' +
              '.imp-ch-main{flex:1;min-width:0;text-align:left;}' +
              '.imp-ch-t{font-size:13px;font-weight:600;} .imp-ch-c{font-size:11px;color:#8A6D39;margin-bottom:6px;}' +
              '.imp-ch-grid{display:grid;grid-template-columns:auto auto auto auto;column-gap:16px;row-gap:2px;width:max-content;margin:5px 0 7px;font-size:12px;}' +
              '.imp-ch-grid .gh{font-size:10px;font-weight:600;color:#8A6D39;padding-bottom:3px;border-bottom:1px solid #EADFBE;}' +
              '.imp-ch-grid .gc{color:#5A3E1B;} .imp-ch-grid .gr{text-align:right;font-variant-numeric:tabular-nums;} .imp-ch-grid .gm{color:#8A6D39;}' +
              '.imp-ch-grid5{grid-template-columns:auto auto auto auto auto;column-gap:14px;} .imp-ch-inc{color:#2E7D8E;font-weight:600;}' +
              '.imp-ch-enroute{font-size:11px;color:#2E7D8E;margin:4px 0 2px;padding:3px 8px;background:#E4F0F2;border-radius:5px;display:inline-block;}' +
              '.imp-ch-sent{color:#3E7D2A;font-weight:600;} .imp-ch-sent-line{background:#EAF3E0;border-radius:4px;}' +
              '.imp-ch-def{color:#B5651D;font-weight:600;font-variant-numeric:tabular-nums;} .imp-ch-okmark{color:#3E7D2A;font-weight:600;}' +
              '.imp-ch-rt{margin-top:8px;padding-top:7px;border-top:1px dashed #E4D3A5;}' +
              '.imp-ch-rt-h{font-size:10px;font-weight:700;color:#8A6D39;margin-bottom:5px;letter-spacing:.05em;}' +
              '.imp-ch-rt-res{font-size:12px;margin:4px 0 1px;} .imp-ch-rt-res .r{font-weight:600;}' +
              '.imp-ch-rt-env{font-size:12px;color:#5A3E1B;margin-left:14px;display:flex;flex-wrap:wrap;align-items:baseline;gap:3px 6px;} .imp-ch-rt-env .q{font-weight:600;} .imp-ch-rt-env .meta{color:#8A6D39;}' +
              '.imp-ch-rt-warn{font-size:11px;color:#B5651D;margin-left:14px;}' +
              '.imp-ch-foot2{font-size:11px;color:#8A6D39;padding-top:6px;margin-top:6px;border-top:1px solid #EADFBE;}' +
              '.imp-ch-side{display:flex;flex-direction:column;align-items:flex-end;gap:6px;white-space:nowrap;}' +
              '.imp-ch-badge{font-size:11px;padding:3px 9px;border-radius:10px;background:#F0E2C0;color:#8A6D39;border:0.8px solid #C6A85E;}' +
              '.imp-ch-badge-ok{background:#DDE8C4;color:#3E7D2A;border-color:#8FB06A;} .imp-ch-badge-err{background:#F3D9C0;color:#A34E1D;border-color:#C98A5A;}' +
              '.imp-ch-del{font-size:11px;padding:5px 10px;border-radius:5px;border:1px solid #B4914E;background:#EFDEB2;color:#8A6D39;cursor:pointer;text-decoration:none;}' +
              '.imp-ch-prep,.imp-ch-goto{font-size:11px;margin-left:auto;padding:2px 8px;border-radius:9px;border:1px solid #B4914E;text-decoration:none;white-space:nowrap;flex:0 0 auto;}' +
              '.imp-ch-prep{background:#D8B871;color:#5A3E1B;font-weight:600;} .imp-ch-goto{background:#EFDEB2;color:#8A6D39;}' +
              '.imp-ch-fl{margin-top:8px;padding-top:7px;border-top:1px dashed #E4D3A5;}' +
              '.imp-ch-fl-h{font-size:10px;font-weight:700;color:#8A6D39;margin-bottom:5px;letter-spacing:.05em;}' +
              '.imp-ch-fl-line{font-size:12px;color:#5A3E1B;margin:2px 0;}' +
              '.imp-ch-fl-ms{font-weight:600;} .imp-ch-fl-warn{color:#B5651D;}' +
              '.imp-ch-fl-src{font-size:11px;color:#8A6D39;margin-left:14px;}' +
              '.imp-ch-foot{font-size:11px;color:#8A6D39;margin-top:8px;padding-top:8px;border-top:1px solid #E4D3A5;line-height:1.5;}';
            var st=document.createElement('style'); st.id='imp-ch-css'; st.textContent=css; document.head.appendChild(st);
        }

        function __impInitChantiersDelegation(){
            if (window.__impChantiersDelegationDone) return;
            window.__impChantiersDelegationDone = true;
            document.addEventListener('click', function(e){
                var t=e.target;
                var prot = t.closest && t.closest('.imp-ch-prot[data-protect]');
                if (prot){
                    e.preventDefault();
                    var pid=prot.getAttribute('data-protect'), arr=window.ImperatorProtected||[], idx=-1;
                    for (var k=0;k<arr.length;k++){ if(String(arr[k])===String(pid)){ idx=k; break; } }
                    if (idx>-1) arr.splice(idx,1); else arr.push(pid);
                    window.ImperatorProtected=arr;
                    if (window.__impSaveProtected) window.__impSaveProtected();
                    if (window.__impChantiersRedraw) window.__impChantiersRedraw();
                    return;
                }
                var goTo = t.closest && t.closest('.imp-ch-goto[data-from]');
                if (goTo){ e.preventDefault(); try{ GM_setValue('imperator_reopen_tab', goTo.getAttribute('data-reopen')||'chantiers'); }catch(x){} try{ var c=__impFindCity(goTo.getAttribute('data-from')); if(c) IkaTools.View.activateCity(c); }catch(x){} return; }
                var prep = t.closest && t.closest('.imp-ch-prep[data-to]');
                if (prep){ e.preventDefault(); __impPrepareEnvoi({ from:prep.getAttribute('data-from'), to:prep.getAttribute('data-to'), res:prep.getAttribute('data-res'), qty:parseInt(prep.getAttribute('data-qty'),10), ships:parseInt(prep.getAttribute('data-ships'),10), fleet:prep.getAttribute('data-fleet'), reopen:prep.getAttribute('data-reopen')||'chantiers' }); return; }
                var del = t.closest && t.closest('.imp-ch-del[data-id]');
                if (del){ e.preventDefault(); var id=del.getAttribute('data-id'); window.ImperatorChantiers=(window.ImperatorChantiers||[]).filter(function(c){return c.id!==id;}); if(window.__impSaveChantiers) window.__impSaveChantiers(); if(window.__impChantiersRedraw) window.__impChantiersRedraw(); return; }
            }, false);
            document.addEventListener('change', function(e){
                var inp = (e.target && e.target.closest) ? e.target.closest('.imp-boisson-trigger') : null;
                if (!inp) return;
                var v = parseInt(String(inp.value).replace(/[^0-9]/g,''),10);
                if (isNaN(v)) v = __impWineTrigger();
                v = Math.max(0, Math.min(v, __IMP_WINE_TARGET));
                window.ImperatorWineTrigger = v;
                if (window.__impSaveWineTrigger) window.__impSaveWineTrigger();
                if (window.__impBoissonsRedraw) window.__impBoissonsRedraw();
            }, false);
        }

        /* ---- Réouverture auto de Chantiers après un transport (Préparer) ----
         * goToLocalView charge en AJAX : quand le transport se ferme (retour à
         * CITY_DETAIL), on rouvre l'onglet Chantiers -> le statut passe en "envoyé"
         * sans fermer/rouvrir à la main. Écouteur additif, aucun code coeur modifié. */
        function __impInitTransportReopen(){
            if (window.__impTransportReopenInit) return;
            window.__impTransportReopenInit = true;
            try{
                IkaTools.View.registerIkariamAjaxResponseCallback(function(response){
                    try{
                        IkaTools.Utils.iterateIkariamAjaxResponse(response, function(i,name,data){
                            if (name!==IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) return;
                            var view=data[0];
                            if (view===IkaTools.Constants.View.CITY_DETAIL && window.__impReopenAfterTransport){
                                var which=window.__impReopenAfterTransport; window.__impReopenAfterTransport=null;
                                try{ if(which==='boissons' && window.ImperatorOpenBoissons) window.ImperatorOpenBoissons(); else if(window.ImperatorOpenChantiers) window.ImperatorOpenChantiers(); }catch(e){}
                            }
                            if (view!==IkaTools.Constants.View.TRANSPORT) window.__impReopenAfterTransport=null;
                        });
                    }catch(e){}
                });
                // v2.42 : après l'envoi, le jeu reste sur le port (pas de retour à la ville).
                // On rouvre donc dès que le serveur confirme le transport (même signal que le
                // débit à l'envoi : retour de type 10).
                IkaTools.View.registerAjaxFormSubmitCallback(function(form){
                    try{
                        if (!form || (form.id!=='transport' && form.id!=='transportForm')) return;
                        var which=window.__impReopenAfterTransport;
                        if (!which) return;
                        IkaTools.View.registerNextIkariamAjaxRequestCallback(function(response){
                            try{
                                var success=false;
                                IkaTools.Utils.iterateIkariamAjaxResponse(response, function(i,name,data){
                                    if (name===IkaTools.Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                                        data && data[0] && data[0].type==10) success=true;
                                });
                                if (!success) return;
                                window.__impReopenAfterTransport=null;
                                setTimeout(function(){
                                    try{ if(which==='boissons' && window.ImperatorOpenBoissons) window.ImperatorOpenBoissons(); else if(window.ImperatorOpenChantiers) window.ImperatorOpenChantiers(); }catch(e){}
                                }, 300);
                            }catch(e){}
                        });
                    }catch(e){}
                });
            }catch(e){}
        }

        function __impProtectedPanel(){
            var cities=[]; try{ cities=IkaTools.EmpireData.getOwnCities(); }catch(e){}
            if (!cities.length) return '';
            var chips=cities.map(function(c){
                var id=String(c.getId()), name=(c.getName?c.getName():id), on=__impIsProtected(id);
                return '<a class="imperator_link imp-ch-prot'+(on?' on':'')+'" href="javascript:void(0)" data-protect="'+__impEsc(id)+'">'+__impEsc(name)+'</a>';
            }).join('');
            return '<div class="imp-ch-prot-wrap"><div class="imp-ch-prot-h">Villes prot\u00e9g\u00e9es \u2014 clique pour exclure une ville des sources de routage</div>'+
                   '<div class="imp-ch-prot-list">'+chips+'</div></div>';
        }

        /* ===== IMPERATOR — Service de boissons (vin) ===== */
        var __IMP_WINE_TARGET = 100000, __IMP_WINE_SRC_FLOOR = 50000;
        window.__impSaveWineTrigger = function(){ try{ GM_setValue('imperator_wine_trigger', String(window.ImperatorWineTrigger)); }catch(e){} };
        window.__impLoadWineTrigger = function(){ var v=85000; try{ v=parseInt(GM_getValue('imperator_wine_trigger','85000'),10); if(isNaN(v)) v=85000; }catch(e){} window.ImperatorWineTrigger=Math.max(0,Math.min(v,__IMP_WINE_TARGET)); };
        window.__impLoadWineTrigger();
        function __impWineTrigger(){ var v=window.ImperatorWineTrigger; return (typeof v==='number' && !isNaN(v))?v:85000; }


        // v3.2 : colonne Recherche de l'onglet Ressources. Calculs et anneau de remplissage,
        // sans accès au jeu (testés hors jeu par le banc).

        // Impôt d'un citoyen (or/h) : ce qu'un citoyen cesse de payer quand il devient chercheur.
        var IMP_RS_CITIZEN_GOLD = 3;

        // Coût d'un chercheur (or/h), lu dans le jeu : entretien total des chercheurs / nombre de
        // chercheurs. Sinon (données absentes), la valeur par défaut fournie.
        // v3.5 : en priorité, le coût lu dans une académie (impôt perdu + entretien) moins l'impôt.
        function impResearchUnitCost(upkeepTotal, scientistsTotal, fallback, academyCostPerScientist) {
            var academyCost = Number(academyCostPerScientist);
            if (isFinite(academyCost) && academyCost > IMP_RS_CITIZEN_GOLD) {
                return academyCost - IMP_RS_CITIZEN_GOLD;
            }
            var upkeep = Math.abs(Number(upkeepTotal));
            var count = Number(scientistsTotal);
            if (isFinite(upkeep) && upkeep > 0 && isFinite(count) && count > 0) {
                return upkeep / count;
            }
            return fallback;
        }

        // Chiffres d'une ville : remplissage, coût direct, manque à gagner, coût total, or par point.
        function impResearchCityStats(scientists, maxScientists, research, unitCost) {
            scientists = Math.max(0, Number(scientists) || 0);
            maxScientists = Math.max(0, Number(maxScientists) || 0);
            research = Number(research) || 0;
            unitCost = Number(unitCost) || 0;
            var directCost = scientists * unitCost;
            var lostTax = scientists * IMP_RS_CITIZEN_GOLD;
            return {
                scientists: scientists,
                max: maxScientists,
                free: Math.max(0, maxScientists - scientists),
                full: maxScientists > 0 && scientists >= maxScientists,
                ratio: maxScientists > 0 ? Math.min(1, scientists / maxScientists) : 0,
                research: research,
                directCost: directCost,
                lostTax: lostTax,
                totalCost: directCost + lostTax,
                goldPerPoint: research > 0 ? (directCost + lostTax) / research : NaN,
            };
        }

        // Somme des chiffres de plusieurs villes.
        function impResearchTotals(statsList) {
            var t = { scientists: 0, research: 0, directCost: 0, lostTax: 0, totalCost: 0 };
            for (var i = 0; i < statsList.length; i++) {
                var s = statsList[i];
                t.scientists += s.scientists;
                t.research += s.research;
                t.directCost += s.directCost;
                t.lostTax += s.lostTax;
                t.totalCost += s.totalCost;
            }
            t.goldPerPoint = t.research > 0 ? t.totalCost / t.research : NaN;
            return t;
        }

        // Nombre maximal de chercheurs pour un niveau d'académie (au-delà du tableau : dernière valeur).
        function impResearchMaxScientists(table, level) {
            level = Math.round(Number(level)) || 0;
            if (!table || !table.length || level <= 0) return 0;
            return Number(table[Math.min(level, table.length - 1)]) || 0;
        }

        // Anneau de remplissage (11 px) : vert si l'académie est pleine, orange sinon.
        function impResearchRingSvg(ratio, full) {
            var circumference = 2 * Math.PI * 4.5;
            var filled = Math.max(0, Math.min(1, Number(ratio) || 0)) * circumference;
            return ('<svg class="imp_rs_ring" width="11" height="11" viewBox="0 0 12 12">' +
                    '<circle cx="6" cy="6" r="4.5" fill="none" stroke="#D8C29A" stroke-width="2.5"/>' +
                    (filled > 0 ?
                     '<circle cx="6" cy="6" r="4.5" fill="none" stroke="%s" stroke-width="2.5" ' +
                     'stroke-dasharray="%s %s" transform="rotate(-90 6 6)"/>' : '') +
                    '</svg>').format(
                full ? '#285E28' : '#D9822B',
                filled.toFixed(2),
                circumference.toFixed(2));
        }

        // v3.5 : expérience de l'académie (300 000 points de recherche contre du cristal).
        var IMP_XP_COST = 300000;          // cristal, sans parchemin
        var IMP_XP_SCROLL_COST = 240000;   // cristal, avec le parchemin d'Athéna (-20 %)

        // État du voyant : 'ready' (vert), 'scroll' (orange, avec parchemin), 'blocked' (rouge).
        // reason : 'cooldown' (labo en remise en état), 'crystal' (pas assez), 'noscroll'
        // (assez pour le parchemin, mais on sait qu'il n'y en a pas). hasScroll : true, false ou
        // null (inconnu : l'orange reste proposé).
        function impExperimentState(crystal, readyAt, now, hasScroll) {
            crystal = Number(crystal) || 0;
            readyAt = Number(readyAt) || 0;
            if (readyAt > now) {
                return { state: 'blocked', reason: 'cooldown', remaining: readyAt - now, crystal: crystal };
            }
            if (crystal >= IMP_XP_COST) return { state: 'ready', crystal: crystal };
            if (crystal >= IMP_XP_SCROLL_COST) {
                return hasScroll === false ?
                    { state: 'blocked', reason: 'noscroll', crystal: crystal } :
                    { state: 'scroll', crystal: crystal };
            }
            return { state: 'blocked', reason: 'crystal', crystal: crystal,
                     missing: IMP_XP_SCROLL_COST - crystal };
        }

        // v3.6 : temps (ms) pour qu'un stock atteigne un seuil à un débit donné (par heure).
        // 0 si déjà atteint, Infinity si le débit est nul.
        function impTimeToReach(current, target, perHour) {
            current = Number(current) || 0;
            perHour = Number(perHour) || 0;
            if (current >= target) return 0;
            if (perHour <= 0) return Infinity;
            return (target - current) / perHour * 3600000;
        }

        // v3.6 : prochaines recherches. points : points accumulés (estimés à maintenant),
        // perHour : points/h, domains : [{ domain, name, cost }]. Domaines au maximum (coût 0) ignorés.
        // Pour chacun : points manquants, délai (ms), nombre d'expériences qui suffiraient.
        function impNextResearches(points, perHour, domains) {
            var list = [];
            for (var i = 0; i < (domains || []).length; i++) {
                var d = domains[i];
                if (!(d.cost > 0)) continue;
                var missing = Math.max(0, d.cost - points);
                list.push({ domain: d.domain, name: d.name, cost: d.cost, missing: missing,
                            time: impTimeToReach(points, d.cost, perHour),
                            experiments: Math.ceil(missing / IMP_XP_COST) });
            }
            list.sort(function (a, b) { return a.missing - b.missing; });
            return list;
        }

        function makeResourceTab() {
            function makeResourceUseTableRow(displaySign, usePerHour, usePerDay, usePerWeek) {
                return makeResourceUseTableRowRaw(
                    displaySign,
                    IkaTools.Intl.formatInteger(usePerHour),
                    IkaTools.Intl.formatInteger(usePerDay ||
                                                usePerHour * IkaTools.Constants.Time.HOURS_PER_DAY),
                    IkaTools.Intl.formatInteger(usePerWeek ||
                                                usePerHour * IkaTools.Constants.Time.HOURS_PER_WEEK));
            }

            function makeResourceUseTableRowRaw(displaySign, usePerHour, usePerDay, usePerWeek) {
                return '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>'.format(
                    displaySign, usePerHour, usePerDay, usePerWeek);
            }

            function makeResourceUseToolTip(icon, rows, footerRows) {
                return ('<table class="resource_use_tool_tip">' +
                        '<colgroup><col/><col/><col/><col/></colgroup>' +
                        '<thead>' +
                        '<tr>' +
                        '<th><img src="%s" height="12"/></th>' +
                        '<th>%s</th>' +
                        '<th>%s</th>' +
                        '<th>%s</th>' +
                        '</tr>' +
                        '</thead>' +
                        '<tbody>%s</tbody>' +
                        '<tfoot>%s</tfoot>' +
                        '</table>').format(
                    icon,
                    IkaTools.Intl.localizer.localize('timeunits','long','hour'),
                    IkaTools.Intl.localizer.localize('timeunits','long','day'),
                    IkaTools.Intl.localizer.localize('timeunits','long','week'),
                    rows.join(''),
                    footerRows ? footerRows.join('') : '')
            }

            // debut patch
            function __imp_ensureUpdateables(ctx) {
                // cas normal : déjà OK
                if (ctx && ctx.updateables && typeof ctx.updateables.create === 'function') {
                    return ctx.updateables;
                }

                // fallback : stub minimal (évite le crash)
                var stub = {
                    create: function () {
                        var ids = Array.prototype.slice.call(arguments);
                        return {
                            getId: function (i) { return ids[i] || ids[0] || ('imp_id_' + Math.random()); },
                            registerTickerUpdate: function () { return this; },
                            registerUpdate: function () { return this; }
                        };
                    }
                };

                if (ctx) ctx.updateables = stub;

                console.warn('[Imperator][FIX] updateables manquant -> stub installé (évite crash, updates live désactivées)');

                return stub;
            }
            //fin patch

            function makeTableContent() {
                var updateables = __imp_ensureUpdateables(this);
                var civData = IkaTools.EmpireData.getCivilizationData();
                impBlessInstallOnce();                    // v2.12
                var blessRefBonus = impBlessRefBonus();   // v2.12 : calculée une fois par rendu


                // Patch Patch “anti-?”

                function getResourceData(resource) {
                    // current / capacity peuvent être undefined selon la ville / état du cache
                    var current = resource && resource.getCurrent ? Number(resource.getCurrent()) : 0;
                    if (!isFinite(current)) current = 0;

                    var capacity = resource && resource.getCapacity ? (resource.getCapacity() || {}) : {};
                    var max = Number(capacity.maximum);
                    var safe = Number(capacity.safe);

                    if (!isFinite(max) || max < 0) max = 0;
                    if (!isFinite(safe) || safe < 0) safe = 0;

                    var timeUntilFull = resource && resource.getTimeUntilFull ? Number(resource.getTimeUntilFull()) : Number.POSITIVE_INFINITY;
                    var timeUntilEmpty = resource && resource.getTimeUntilEmpty ? Number(resource.getTimeUntilEmpty()) : Number.POSITIVE_INFINITY;

                    var millisUntilFull = Math.ceil(timeUntilFull);
                    var millisUntilEmpty = Math.ceil(timeUntilEmpty);

                    // Classes "full"
                    var fullClass = '';
                    if (isFinite(millisUntilFull)) {
                        if (millisUntilFull < 1 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            fullClass = 'expiration_now';
                        } else if (millisUntilFull <= 6 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            fullClass = 'expiration_imminent';
                        } else if (millisUntilFull <= 24 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            fullClass = 'expiration_soon';
                        } else if (millisUntilFull <= 48 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            fullClass = 'expiration_forseeable';
                        }
                    }

                    // Classes "empty"
                    var emptyClass = '';
                    if (isFinite(millisUntilEmpty)) {
                        if (millisUntilEmpty < 1 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            emptyClass = 'expiration_now';
                        } else if (millisUntilEmpty <= 6 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            emptyClass = 'expiration_imminent';
                        } else if (millisUntilEmpty <= 24 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            emptyClass = 'expiration_soon';
                        } else if (millisUntilEmpty <= 48 * IkaTools.Constants.Time.MILLIS_PER_HOUR) {
                            emptyClass = 'expiration_forseeable';
                        }
                    }

                    var percent = (max > 0) ? (current / max * 100) : 0;
                    if (!isFinite(percent)) percent = 0;
                    if (percent < 0) percent = 0;
                    if (percent > 100) percent = 100;

                    return {
                        current: current,
                        max: max,
                        percent: percent,
                        safe: safe,
                        fullClass: fullClass,
                        emptyClass: emptyClass,
                    };
                }
                // Fin patch Patch “anti-?”


                function makeResourceCells(movements, city, resourceName) {
                    var resource = city.getResource(resourceName);
                    var cityId = city.getId();

                    var currentUpdateable = updateables.create(
                        IkaTools.Utils.nextId('resource_current_'),
                        IkaTools.Utils.nextId('resource_current_percent_bar_'),
                        IkaTools.Utils.nextId('resource_current_percent_bar_active_'));

                    var resourceLink = new Link('Resource_%s_%s'.format(city.getId(), resourceName));

                    if (resourceName == IkaTools.Constants.Resources.WOOD) {
                        resourceLink.toCitysIslandView(
                            city, IkaTools.Constants.View.RESOURCE,
                            { type: 'resource', islandId: city.getIslandId(), cityId: city.getId() });
                    } else if (resourceName == city.getTradeGoodType()) {
                        resourceLink.toCitysIslandView(
                            city, IkaTools.Constants.View.TRADE_GOOD,
                            { type: IkaTools.Constants.TradeGoodOrdinals[city.getTradeGoodType()],
                             islandId: city.getIslandId(), cityId: city.getId() });
                    }

                    var data = getResourceData(resource);

                    var inTransit = 0;

                    function isCountableMovement(movement) {
                        if (movement.getResource(resourceName) > 0) {
                            if (movement.getMission() == IkaTools.Constants.Movements.Mission.PLUNDER) {
                                return movement.getOriginCityId() == cityId;
                            }
                            if (movement.getStage() == IkaTools.Constants.Movements.Stage.LOADING ||
                                movement.getStage() == IkaTools.Constants.Movements.Stage.EN_ROUTE) {
                                return movement.getTargetCityId() == cityId;
                            }
                            if (movement.getStage() == IkaTools.Constants.Movements.Stage.RETURNING) {
                                return movement.getOriginCityId() == cityId;
                            }
                        }
                        return false;
                    }

                    $.each(movements, function totalMovements(index, movement) {
                        var mission = movement.getMission();
                        var stage = movement.getStage();
                        if (isCountableMovement(movement)) {
                            inTransit += movement.getResource(resourceName) || 0;
                        }
                    });

                    var inTransitDivId = 'ResourcesInTransit_%s_%s'.format(city.getId(), resourceName);
                    if (inTransit) {
                        toolTips.registerRefreshable(inTransitDivId, function() {
                            return ('<table class="resources_in_transit_tool_tip">' +
                                    '<thead>' +
                                    '<tr>' +
                                    '<th>' +
                                    '<img src="/cdn/all/both/resources/icon_%s.png" height="12"/>' +
                                    '</th>' +
                                    '<th>%s</th>' +
                                    '</tr>' +
                                    '</thead>' +
                                    '<tbody>%s</tbody>' +
                                    '</table').format(
                                resourceName,
                                localizer.localize('misc','in_transit'),
                                $.map(movements, function makeResourcesInTransitRow(movement) {
                                    var count = movement.getResource(resourceName);
                                    if (isCountableMovement(movement)) {
                                        return '<tr><td class="resource_count">%s</td><td>%s</td></tr>'.format(
                                            IkaTools.Intl.formatInteger(count, true),
                                            // v2.32 : « ? » tant que l'heure d'arrivée est inconnue
                                            // v2.33 : temps restant suivi de l'heure d'arrivée (« 6h 22m (aujourd'hui 15:37) »)
                                            (movement.isEtaUnknown && movement.isEtaUnknown()) ? '?' :
                                            '<span class="nowrap">' + IkaTools.Intl.formatRemainingTime(
                                                movement.getArrivalTime() - IkaTools.View.gameTimeNow()) +
                                            ' (' + IkaTools.Intl.formatAbsoluteTime(new Date(movement.getArrivalTime())) +
                                            ')</span>');
                                    } else {
                                        return '';
                                    }
                                }).join(''));
                        });
                    } else {
                        toolTips.deregister(inTransitDivId);
                    }

                    toolTips.registerRefreshable(currentUpdateable.getId(1), function() {
                        var timeToFull = resource.getTimeUntilFull();
                        var timeToEmpty = resource.getTimeUntilEmpty();

                        var timeRow = '';
                        if (isFinite(timeToFull)) {
                            timeRow = '<tr><td>%s:</td><td>%s</td>'.format(
                                localizer.localize('misc','time_to_full'),
                                IkaTools.Intl.formatRemainingTime(timeToFull,
                                                                  localizer.localize('misc','full')));
                        } else if (isFinite(timeToEmpty)) {
                            timeRow = '<tr><td>%s:</td><td>%s</td>'.format(
                                localizer.localize('misc','time_to_empty'),
                                IkaTools.Intl.formatRemainingTime(timeToEmpty,
                                                                  localizer.localize('misc','empty')));
                        }

                        var capacity = city.getResourceCapacity();
                        return ('<table>' +
                                '<colgroup><col/><col/></colgroup>' +
                                '<tbody>' +
                                '<tr><td>%s:</td><td>%s</td></tr>' +
                                '<tr><td>%s:</td><td>%s</td></tr>' +
                                '%s' +
                                '<tbody>' +
                                '<table>').format(
                            localizer.localize('misc','maximum_capacity'),
                            IkaTools.Intl.formatInteger(data.max),
                            localizer.localize('misc','safe_capacity'),
                            IkaTools.Intl.formatInteger(data.safe),
                            timeRow);
                    });

                    // Patch début
                    var currentContent = '?';
                    if (Number.isFinite(data.current)) {
                        currentContent = (
                            '<div id="%s" class="resource_current %s %s">%s</div>' +
                            '<div id="%s" class="resources_transporting imperator_tool_tip">%s</div>' +
                            '<div id="%s" class="percent_bar imperator_tool_tip %s">' +
                            '<div id="%s" class="percent_bar_active" style="width: %s%;" />' +
                            '</div>').format(
                            currentUpdateable.getId(0),
                            data.emptyClass,
                            data.current <= data.safe ? 'is_under_safe_limit' : '',
                            IkaTools.Intl.formatInteger(data.current),
                            inTransitDivId,
                            inTransit ? IkaTools.Intl.formatInteger(inTransit, true) : '-',
                            currentUpdateable.getId(1),
                            data.fullClass,
                            currentUpdateable.getId(2),
                            Number.isFinite(data.percent) ? data.percent : 0
                        );

                        currentUpdateable.registerTickerUpdate(function(amount, percentBar, activeBar) {
                            var data = getResourceData(resource);

                            if (!Number.isFinite(data.current)) return; // sécurité

                            if (data.current <= data.safe) {
                                amount.addClass('is_under_safe_limit');
                            } else {
                                amount.removeClass('is_under_safe_limit');
                            }

                            amount.html(IkaTools.Intl.formatInteger(data.current));

                            amount.removeClass('expiration_now expiration_imminent expiration_soon expiration_forseeable');
                            amount.addClass(data.emptyClass);

                            percentBar.removeClass('expiration_now expiration_imminent expiration_soon expiration_forseeable');
                            percentBar.addClass(data.fullClass);

                            activeBar.css('width', '%s%'.format(Number.isFinite(data.percent) ? data.percent : 0));
                        });
                    }

                    // patch Fin

                    var productionContent = '&nbsp;';
                    var production = resource.getProduction();
                    // v2.12 : bénédiction divine sur cette ressource ?
                    var blessInfo = null;
                    try {
                        var bi = impBlessInfo(city, blessRefBonus);
                        if (bi && bi.resource === resourceName) blessInfo = bi;
                    } catch (eBl) { blessInfo = null; }
                    if (production !== undefined) {
                        var productionPerHour = production * IkaTools.Constants.Time.SECONDS_PER_HOUR;
                        productionContent = IkaTools.Intl.formatInteger(productionPerHour, true);
                        var useToolTip = makeResourceUseToolTip('/cdn/all/both/resources/icon_%s.png'.format(resourceName),
                                                                [makeResourceUseTableRow('+', productionPerHour)]);
                        if (blessInfo) {
                            toolTips.registerRefreshable(resourceLink.getId(), function() {
                                return '<div>' + useToolTip + impBlessToolTipHtml(blessInfo, productionPerHour) + '</div>';
                            });
                        } else {
                            toolTips.registerSimple(resourceLink.getId(), useToolTip);
                        }
                    }
                    var blessTdClass = blessInfo ? ' ' + impBlessStateClasses(blessInfo.state, blessInfo.stale) : '';
                    var blessTdAttrs = blessInfo ? impBlessDataAttrs(blessInfo) : '';


                    var consumptionContent = '';
                    var consumption = resource.getConsumption();
                    var tavernLink = new Link('WineConsumptionTavern_%s'.format(city.getId()));
                    var tavern = city.getBuildingByType(IkaTools.Constants.Buildings.TAVERN);
                    if (tavern) {
                        tavernLink.toCityView(city, IkaTools.Constants.Buildings.TAVERN,
                                              { position: tavern.getPosition(), cityId: city.getId() });
                    }
                    if (tavern && consumption !== undefined) {
                        var consumptionPerHour =
                            Math.round(consumption * IkaTools.Constants.Time.SECONDS_PER_HOUR);
                        toolTips.registerSimple(tavernLink.getId(),
                                                makeResourceUseToolTip('/cdn/all/both/resources/icon_%s.png'.format(resourceName),
                                                                       [makeResourceUseTableRow('-', consumptionPerHour)]));
                        consumptionContent =
                            ('<a id="%s" class="imperator_link imperator_tool_tip" ' +
                             'href="javascript:void(0);">%s</a>').format(
                            tavernLink.getId(),
                            IkaTools.Intl.formatInteger(-consumptionPerHour, true));
                    }

                    return ('<td class="resource resource_%s">%s</td>' +
                            '<td class="resource resource_%s resource_change' + blessTdClass + '"' + blessTdAttrs + '>' +
                            '<div class="resource_production">' +
                            '<a id="%s" class="imperator_link imperator_tool_tip" ' +
                            'href="javascript:void(0);">%s</a>' +
                            '</div>' +
                            '<div class="resource_consumption">%s</div>' +
                            '</td>').format(
                        resourceName,
                        currentContent,
                        resourceName,
                        resourceLink.getId(),
                        productionContent,
                        consumptionContent);
                }

                // v3.2 : colonne Recherche. Ligne 1 : recherche/h (lien vers l'académie).
                // Ligne 2 : anneau de remplissage + chercheurs, coût direct en or/h.
                var researchUnitCostCache;
                function getResearchUnitCost() {
                    if (researchUnitCostCache === undefined) {
                        var totalScientists = 0;
                        $.each(IkaTools.EmpireData.getOwnCities(), function(index, c) {
                            totalScientists += Number(c.getScientists()) || 0;
                        });
                        var fallback = civData.hasResearched(
                            IkaTools.Constants.Research.Science.LETTER_CHUTE) ? 3 : 6;
                        researchUnitCostCache = impResearchUnitCost(
                            civData.getGoldData().scientists, totalScientists, fallback,
                            civData.getAcademyData().costPerScientist); // v3.5
                    }
                    return researchUnitCostCache;
                }

                function getResearchStats(city) {
                    var academy = city.getBuildingByType(IkaTools.Constants.Buildings.ACADEMY);
                    if (!academy) return null;
                    var maxScientists = impResearchMaxScientists(IkaTools.Constants.BuildingData[
                        IkaTools.Constants.Buildings.ACADEMY].maxScientists, academy.getLevel());
                    var stats = impResearchCityStats(city.getScientists(), maxScientists,
                                                     city.getResearch(), getResearchUnitCost());
                    stats.academy = academy;
                    return stats;
                }

                // v3.5 : voyant d'expérience de la ville (recalculé à chaque appel)
                function getExperimentState(city) {
                    var glass = city.getResource(IkaTools.Constants.Resources.GLASS);
                    var crystal = glass && glass.getCurrent ? glass.getCurrent() : 0;
                    var academyData = civData.getAcademyData();
                    var hasScroll = academyData.isAthenaScrollActive ? true : academyData.hasAthenaScroll;
                    return impExperimentState(crystal, city.getExperimentReadyAt(), Date.now(), hasScroll);
                }

                // v3.6 : durée longue arrondie (« ~12 j ») ou précise sous 2 jours (« 5h 12m »)
                function formatDuration(ms) {
                    if (!isFinite(ms)) return '&infin;';
                    var days = ms / IkaTools.Constants.Time.MILLIS_PER_DAY;
                    if (days >= 2) {
                        return localizer.localize('misc','rs_days').format(IkaTools.Intl.formatInteger(Math.round(days)));
                    }
                    return IkaTools.Intl.formatRemainingTime(Math.max(ms, 1000), ''); // v3.7 : minutes et secondes sous 1 h
                }

                // v3.6 : délais avant orange / vert, d'après la production de cristal de la ville
                function experimentEta(city, xp) {
                    var glass = city.getResource(IkaTools.Constants.Resources.GLASS);
                    var production = glass && glass.getProduction ? Number(glass.getProduction()) || 0 : 0;
                    var perHour = production * IkaTools.Constants.Time.SECONDS_PER_HOUR;
                    if (perHour <= 0) return '';
                    var parts = [];
                    if (xp.state == 'blocked' && xp.reason == 'crystal' && civData.getAcademyData().hasAthenaScroll !== false) {
                        parts.push(localizer.localize('misc','rs_xp_eta_scroll').format(
                            formatDuration(impTimeToReach(xp.crystal, IMP_XP_SCROLL_COST, perHour))));
                    }
                    if (xp.state != 'ready' && xp.reason != 'cooldown') {
                        parts.push(localizer.localize('misc','rs_xp_eta_ready').format(
                            formatDuration(impTimeToReach(xp.crystal, IMP_XP_COST, perHour))));
                    }
                    return parts.length ? ' — ' + parts.join(', ') : '';
                }

                function describeExperimentState(xp, city) {
                    var eta = city ? experimentEta(city, xp) : '';
                    if (xp.state == 'ready') return localizer.localize('misc','rs_xp_ready');
                    if (xp.state == 'scroll') return localizer.localize('misc','rs_xp_scroll') + eta;
                    if (xp.reason == 'cooldown') {
                        return localizer.localize('misc','rs_xp_cooldown').format(
                            IkaTools.Intl.formatRemainingTime(Math.max(xp.remaining, 1000), '')); // v3.7
                    }
                    if (xp.reason == 'noscroll') {
                        return localizer.localize('misc','rs_xp_noscroll').format(
                            IkaTools.Intl.formatInteger(xp.crystal), IkaTools.Intl.formatInteger(IMP_XP_COST)) + eta;
                    }
                    return localizer.localize('misc','rs_xp_crystal').format(
                        IkaTools.Intl.formatInteger(xp.crystal), IkaTools.Intl.formatInteger(IMP_XP_SCROLL_COST)) + eta;
                }

                function formatGoldPerHour(value) {
                    return IkaTools.Intl.formatInteger(-Math.round(value)) +
                        ' ' + localizer.localize('misc','rs_per_hour');
                }

                function makeResearchCityToolTip(city, stats) {
                    function row(label, value, cls) {
                        return '<tr%s><td>%s :</td><td class="imp_rs_val">%s</td></tr>'.format(
                            cls ? ' class="' + cls + '"' : '', label, value);
                    }
                    var rows = [];
                    rows.push(row(localizer.localize('misc','rs_scientists'),
                                  IkaTools.Intl.formatInteger(stats.scientists) + ' / ' +
                                  IkaTools.Intl.formatInteger(stats.max)));
                    if (stats.free > 0) {
                        rows.push(row(localizer.localize('misc','rs_free'),
                                      IkaTools.Intl.formatInteger(stats.free), 'imp_rs_warn'));
                    }
                    rows.push(row(localizer.localize('misc','research'),
                                  IkaTools.Intl.formatInteger(stats.research, true) + ' ' +
                                  localizer.localize('misc','rs_per_hour')));
                    rows.push(row(localizer.localize('misc','rs_direct_cost'),
                                  formatGoldPerHour(stats.directCost), 'imp_rs_gold'));
                    rows.push(row(localizer.localize('misc','rs_lost_tax'),
                                  formatGoldPerHour(stats.lostTax), 'imp_rs_muted'));
                    if (city.cityGoldNetUpdated > 0) {
                        rows.push(row(localizer.localize('misc','rs_city_gold_net'),
                                      IkaTools.Intl.formatInteger(city.cityGoldNet) + ' ' +
                                      localizer.localize('misc','rs_per_hour')));
                    }
                    if (isFinite(stats.goldPerPoint)) {
                        rows.push(row(localizer.localize('misc','rs_gold_per_point'),
                                      IkaTools.Intl.formatDecimal(stats.goldPerPoint, 1)));
                    }
                    // v3.5 : état de l'expérience
                    var xp = getExperimentState(city);
                    rows.push(row(localizer.localize('misc','rs_xp'), describeExperimentState(xp, city),
                                  'imp_rs_xp_' + xp.state));
                    var readAt = city.getScientistsReadAt();
                    var age = readAt ?
                        localizer.localize('misc','rs_read_ago').format(
                            IkaTools.Intl.formatRemainingTime(Math.max(Date.now() - readAt, 1000), '')) : // v3.7
                        localizer.localize('misc','rs_never_read');
                    return ('<div class="imp_rs_tip">' +
                            '<div class="imp_rs_tip_title">%s</div>' +
                            '<table><tbody>%s</tbody></table>' +
                            '%s' +
                            '<div class="imp_rs_tip_age">%s</div>' +
                            '</div>').format(
                        localizer.localize('misc','rs_academy_level').format(stats.academy.getLevel()),
                        rows.join(''),
                        makeResourceUseToolTip('/cdn/all/both/layout/bulb-on.png', [
                            makeResourceUseTableRow('+', stats.research),
                            makeResourceUseTableRow(localizer.localize('misc','rs_direct_cost'), -Math.round(stats.directCost)),
                            makeResourceUseTableRow(localizer.localize('misc','rs_total_cost'), -Math.round(stats.totalCost))]),
                        age);
                }

                function makeResearchCell(city) {
                    var stats = getResearchStats(city);
                    if (!stats) {
                        return '<td class="research"><span class="imp_rs_none">&mdash;</span></td>';
                    }
                    var link = new Link('ResearchTableAcademy_%s'.format(city.getId()))
                    .toCityView(city, IkaTools.Constants.Buildings.ACADEMY,
                                { position: stats.academy.getPosition(), cityId: city.getId() });
                    var detailsId = 'ResearchTableDetails_%s'.format(city.getId());
                    // v3.5 : infobulle rafraîchie (temps restant du labo)
                    var tip = function() { return makeResearchCityToolTip(city, stats); };
                    toolTips.registerRefreshable(link.getId(), tip);
                    toolTips.registerRefreshable(detailsId, tip);

                    // v3.5 : voyant d'expérience, suivi toutes les 4 s ; il clignote quand le labo
                    // redevient disponible
                    var xp = getExperimentState(city);
                    var lampId = 'ResearchExperimentLamp_%s'.format(city.getId());
                    var lastXp = xp;
                    updateables.create(lampId).registerTickerUpdate(function(lamp) {
                        var now = getExperimentState(city);
                        lamp.removeClass('imp_rs_lamp_ready imp_rs_lamp_scroll imp_rs_lamp_blocked')
                            .addClass('imp_rs_lamp_' + now.state);
                        if (lastXp.reason == 'cooldown' && now.reason != 'cooldown') {
                            lamp.addClass('imp_rs_lamp_blink');
                            setTimeout(function() { lamp.removeClass('imp_rs_lamp_blink'); }, 8000);
                        }
                        lastXp = now;
                    });

                    var readAt = city.getScientistsReadAt();
                    var stale = readAt && Date.now() - readAt > 24 * IkaTools.Constants.Time.MILLIS_PER_HOUR;

                    return ('<td class="research%s">' +
                            '<div class="imp_rs_l1">' +
                            '<a id="%s" href="javascript:void(0)" ' +
                            'class="imperator_link imperator_tool_tip">' +
                            '<span id="%s" class="imp_rs_lamp imp_rs_lamp_%s"></span>%s</a>' +
                            '</div>' +
                            '<div id="%s" class="imp_rs_l2 imperator_tool_tip">' +
                            '<span class="imp_rs_sci">%s%s</span>' +
                            '<span class="imp_rs_cost">%s</span>' +
                            '</div>' +
                            '</td>').format(
                        stale ? ' imp_rs_stale' : '',
                        link.getId(),
                        lampId,
                        xp.state,
                        IkaTools.Intl.formatInteger(stats.research, true),
                        detailsId,
                        impResearchRingSvg(stats.ratio, stats.full),
                        IkaTools.Intl.formatInteger(stats.scientists),
                        IkaTools.Intl.formatInteger(-Math.round(stats.directCost)));
                }

                //   ICI

                function getPopulationData(city) {
                    var populationData = city.getPopulationData ? (city.getPopulationData() || {}) : {};

                    // --- BLINDAGE anti-NaN / anti-undefined ---
                    var pop = Number(populationData.population);
                    var max = Number(populationData.max);
                    var hap = Number(populationData.happiness);
                    var gro = Number(populationData.growth);

                    if (!isFinite(pop)) pop = 0;
                    if (!isFinite(max)) max = 0;
                    if (!isFinite(hap)) hap = 0;
                    if (!isFinite(gro)) gro = 0;

                    populationData.population = pop;
                    populationData.max = max;
                    populationData.happiness = hap;
                    populationData.growth = gro;

                    var icon = 'neutral';

                    // 1) humeur réelle si dispo
                    var mood = city._imperatorMood;
                    if (mood) {
                        if (mood === "happy") icon = "happy";
                        else if (mood === "ecstatic") icon = "ecstatic";
                        else if (mood === "sad") icon = "sad";
                        else if (mood === "outraged" || mood === "angry") icon = "outraged";
                        else icon = "neutral";
                    } else {
                        // 2) fallback via happinessScore si dispo, sinon calcul approximatif
                        var h = city.happinessScore != null ? city.happinessScore : populationData.happiness;
                        if (h < -50) icon = 'outraged';
                        else if (h < -0.5) icon = 'sad';
                        else if (h > 300) icon = 'ecstatic';
                        else if (h > 50) icon = 'happy';
                        else icon = 'neutral';
                    }

                    // % sécurisé
                    var percent = (populationData.max > 0)
                    ? (populationData.population / populationData.max * 100)
                    : 0;
                    if (!isFinite(percent)) percent = 0;

                    return $.extend({
                        icon: "/cdn/all/both/smilies/%s_x25.png".format(icon),
                        percent: percent,
                        percentClass: percent == 100 ? 'percent_bar_filled' : '',
                        happinessClass: percent == 100 && populationData.happiness >= 60
                        && city.getTavernWineLevel && city.getTavernWineLevel() > 0
                        ? 'imperator_warning' : '',
                    }, populationData);
                }

                //   ICI

               // v2.18 : places libres dans le musée (0 si complet ou pas de musée)
                function getMuseumGap(city) {
                    var museum = city.getBuildingByType(IkaTools.Constants.Buildings.MUSEUM);
                    var level = museum ? Math.round(Number(museum.getLevel())) || 0 : 0;
                    var goods = Math.round(Number(city.getCulturalGoods())) || 0;
                    return level > 0 ? Math.max(0, level - goods) : 0;
                }


                function makePopulationCells(city) {
                    var populationData = getPopulationData(city);
                    if (!populationData.population) {
                        return ('<td class="population">%s</td>' +
                                '<td class="population_growth_icon"></td>' +
                                '<td class="population_growth"/>').format(
                            IkaTools.Intl.formatInteger(populationData.population));
                    }

                    var updateable = updateables.create(
                        IkaTools.Utils.nextId('population_current_'),
                        IkaTools.Utils.nextId('population_current_percent_bar_'),
                        IkaTools.Utils.nextId('population_current_percent_bar_active_'),
                        IkaTools.Utils.nextId('population_growth_icon_'),
                        IkaTools.Utils.nextId('population_growth_'));

                    updateable.registerTickerUpdate(
                        function(population, percentBar, activeBar, icon, growth) {
                            var populationData = getPopulationData(city);
                            population.html(IkaTools.Intl.formatInteger(
                                Math.floor(populationData.population)));
                            percentBar.removeClass('percent_bar_filled');
                            percentBar.addClass(populationData.percentClass);
                            activeBar.css('width', '%s%'.format(populationData.percent));
                            icon.attr('src', populationData.icon);
                            var museumGap = getMuseumGap(city);
                            icon.parent()
                                .toggleClass('imp_museum_incomplete', museumGap > 0)
                                .attr('data-imp-gap', museumGap > 0 ? museumGap : null);
                            growth.removeClass('imperator_warning');
                            growth.addClass(populationData.happinessClass);
                            growth.html(
                                IkaTools.Intl.formatDecimal(populationData.growth, 2, true));
                        });

                    toolTips.registerRefreshable(updateable.getId(3), function() {
                        var data = city.getPopulationData();
                        var tavern = city.getBuildingByType(IkaTools.Constants.Buildings.TAVERN);
                        var museum = city.getBuildingByType(IkaTools.Constants.Buildings.MUSEUM);

                        var culturalGoods = city.getCulturalGoods();
                        var tavernWineLevel = city.getTavernWineLevel();

                                                var museumGap = getMuseumGap(city);
                        var cgStyle = museumGap > 0 ? ' style="color:#C0392B;font-weight:bold"' : '';
                        var cgNote  = museumGap > 0 ? ' (%s libre%s)'.format(museumGap, museumGap > 1 ? 's' : '') : '';

                        return ('<table>' +
                                '<tbody>' +
                                '<tr><td>%s:</td><td>%s</td></tr>' +
                                '<tr' + cgStyle + '><td>%s:</td><td>%s/%s' + cgNote + '</td></tr>' +
                                '<tr><td>%s:</td><td>%s/%s</td></tr>' +
                                '</tbody>' +
                                '</table>').format(
                            localizer.localize('misc','satisfaction'),
                            IkaTools.Intl.formatInteger(city.happinessScore != null ? city.happinessScore : data.happiness, true),
                            localizer.localize('misc','cultural_goods'),
                            IkaTools.Intl.formatInteger(culturalGoods),
                            IkaTools.Intl.formatInteger(museum ? museum.getLevel() : 0),
                            localizer.localize('misc','tavern_wine_serving_level'),
                            IkaTools.Intl.formatInteger(tavernWineLevel),
                            IkaTools.Intl.formatInteger(tavern ? tavern.getLevel() : 0));
                    });

                    toolTips.registerRefreshable(updateable.getId(4), function() {
                        var data = city.getPopulationData();
                        // v2.42 : la croissance s'arrête quand la ville est pleine. Une valeur
                        // plafonnée (souvent Jour = Semaine) porte la mention « Plein ».
                        function growthIn(hours) {
                            var growth = data.happiness * ( 1 - Math.pow(Math.E, -hours / 50));
                            var capped = growth + data.population > data.max;
                            if (capped) {
                                growth = data.max - data.population;
                            }
                            return IkaTools.Intl.formatDecimal(growth, 2) + (capped ?
                                ' <span class="imp_growth_full">(' +
                                localizer.localize('misc','full').toLowerCase() + ')</span>' : '');
                        }

                        return makeResourceUseToolTip(
                            data.happiness >= 0 ? '/cdn/all/both/icons/growth_positive.png'
                            : '/cdn/all/both/icons/growth_negative.png',
                            [makeResourceUseTableRowRaw(data.happiness >= 0 ? '+' : '-',
                                                        growthIn(1), growthIn(24), growthIn(168))]);
                    });

                    toolTips.registerRefreshable(updateable.getId(1), function() {
                        var data = city.getPopulationData();
                        var timeToFull = Number.POSITIVE_INFINITY;

                        if (data.population == data.max) {
                            timeToFull = 0;
                        } else if (data.population + data.happiness > data.max) {
                            var finalHappiness = data.population + data.happiness - data.max;
                            timeToFull = (Math.log(data.happiness) - Math.log(finalHappiness)) *
                                50* IkaTools.Constants.Time.MILLIS_PER_HOUR;
                        }

                        return ('<table>' +
                                '<tbody>' +
                                '<tr><td>%s:</td><td>%s</td></tr>' +
                                '<tr><td>%s:</td><td>%s</td></tr>' +
                                '<tbody>' +
                                '<table>').format(
                            localizer.localize('misc','maximum_capacity'),
                            IkaTools.Intl.formatInteger(data.max),
                            localizer.localize('misc','time_to_full'),
                            IkaTools.Intl.formatRemainingTime(timeToFull,
                                                              localizer.localize('misc','full')));
                    });

                    return ('<td class="population">' +
                            '<div id="%s">%s</div>' +
                            '<div id="%s" ' +
                            'class="percent_bar percent_bar_desire_filled imperator_tool_tip %s">' +
                            '<div id="%s"class="percent_bar_active" style="width: %s%;" />' +
                            '</div>' +
                            '</td>' +
                            '<td class="population_growth_icon nowrap">' +
                            '<img id="%s" class="imperator_tool_tip" src="%s" />' +
                            '</td>'+
                            '<td class="population_growth %s">' +
                            '<span id="%s" class="imperator_tool_tip">%s</span>' +
                            '</td>'
                           ).format(
                        updateable.getId(0),
                        IkaTools.Intl.formatInteger(Math.floor(populationData.population)),
                        updateable.getId(1),
                        populationData.percentClass,
                        updateable.getId(2),
                        populationData.percent,
                        updateable.getId(3),
                        populationData.icon,
                        populationData.happinessClass,
                        updateable.getId(4),
                        IkaTools.Intl.formatDecimal(populationData.growth, 2, true));
                }

                function makeRow(movements, city) {
                    var transportLink = new Link('TransportGoods_%s'.format(city.getId())).toLocalView(
                        IkaTools.Constants.View.TRANSPORT,
                        {
                            templateView: IkaTools.Constants.View.CITY_DETAIL,
                            destinationCityId: city.getId(),
                        },
                        function() {
                            var go = !IkaTools.View.isActiveCity(city) &&
                                IkaTools.View.getCurrentCity().isOwn();
                            if (go) {
                                openResourcesTabOnTransportClose = true;
                            }
                            return go;
                        });
                    var cityLink = new Link('ResourceTabToTownHall_%s'.format(city.getId()))
                    .toCityView(city, IkaTools.Constants.View.TOWN_HALL,
                                { position: 0, cityId: city.getId() });


                    var rowUpdateable = updateables.create('ResourceTableRow_%s'.format(city.getId()))
                    .registerUpdate('cityChanged',
                                    function(element) {
                        if (IkaTools.View.isActiveCity(city)) {
                            element.addClass('current');
                        } else {
                            element.removeClass('current');
                        }
                    });

                    return ('<tr id="%s" class="%s">' +
                            '%s' +
                            '<td class="action_points">%s</td>' +
                            '<td class="actions">' +
                            '<a id="%s" class="imperator_link to_town_hall" ' +
                            'title="%s" href="javascript:void(0);"/>' +
                            '<a id="%s" class="imperator_link transport_goods" ' +
                            'title="%s" href="javascript:void(0);"/>' +
                            '</td>' +
                            '%s' +
                            '%s' +
                            '%s%s%s%s%s' +
                            '</tr>'
                           ).format(
                        rowUpdateable.getId(0),
                        IkaTools.View.isActiveCity(city) ? 'current' : '',
                        makeCityNameCells('resources', city),
                        IkaTools.Intl.formatInteger(city.getActionPoints()),
                        cityLink.getId(),
                        localizer.localize('actions','to_town_hall'),
                        transportLink.getId(),
                        localizer.localize('actions','transport_goods'),
                        makePopulationCells(city),
                        makeResearchCell(city),
                        makeResourceCells(movements, city, IkaTools.Constants.Resources.WOOD),
                        makeResourceCells(movements, city, IkaTools.Constants.Resources.WINE),
                        makeResourceCells(movements, city, IkaTools.Constants.Resources.MARBLE),
                        makeResourceCells(movements, city, IkaTools.Constants.Resources.GLASS),
                        makeResourceCells(movements, city, IkaTools.Constants.Resources.SULFUR));
                }

                function makeTotalsRow(cities) {
                    function makeResourceCells(cities, resourceName) {
                        var currentUpdateable =
                            updateables.create(IkaTools.Utils.nextId('resource_current_total'));

                        function makeCurrentContent() {
                            var total = 0;

                            $.each(cities, function(index, city) {
                                var resource = city.getResource(resourceName);
                                total += resource.getCurrent() || 0;
                            });
                            return IkaTools.Intl.formatInteger(total);
                        }

                        currentUpdateable.registerTickerUpdate(function(element) {
                            element.html(makeCurrentContent());
                        });

                        var production = 0;
                        var consumption = 0;

                        $.each(cities, function(index, city) {
                            var resource = city.getResource(resourceName);
                            production += resource.getProduction() || 0;
                            consumption += resource.getConsumption() || 0;
                        });

                        var rows = [makeResourceUseTableRow('+',
                                                            production * IkaTools.Constants.Time.SECONDS_PER_HOUR)];
                        var footer = null;
                        if (consumption) {
                            rows.push(makeResourceUseTableRow('-',
                                                              consumption * IkaTools.Constants.Time.SECONDS_PER_HOUR));
                            footer = [makeResourceUseTableRow('&sum;',
                                                              (production - consumption) * IkaTools.Constants.Time.SECONDS_PER_HOUR)];
                        }

                        toolTips.registerSimple('ResourceProductionTotal_' + resourceName,
                                                makeResourceUseToolTip(
                            '/cdn/all/both/resources/icon_%s.png'.format(resourceName), rows, footer));

                        return ('<td><span id="%s">%s</span></td>' +
                                '<td id="ResourceProductionTotal_%s" class="imperator_tool_tip">' +
                                '<div class="resource_production">%s</div>' +
                                '<div class="resource_consumption">%s</div>' +
                                '</td>').format(
                            currentUpdateable.getId(0),
                            makeCurrentContent(),
                            resourceName,
                            IkaTools.Intl.formatInteger(
                                production * IkaTools.Constants.Time.SECONDS_PER_HOUR, true),
                            consumption ? IkaTools.Intl.formatInteger(
                                -consumption * IkaTools.Constants.Time.SECONDS_PER_HOUR) : '');
                    }

                    // v3.6 : prochaines recherches (conseiller en recherches), points estimés à maintenant
                    function makeNextResearchBlock(totalPerHour) {
                        var advisor = civData.getResearchAdvisorData();
                        if (!advisor.updated) {
                            return '<div class="imp_rs_tip_age">%s</div>'.format(
                                localizer.localize('misc','rs_advisor_never'));
                        }
                        var perHour = advisor.perHour > 0 ? advisor.perHour : totalPerHour;
                        var elapsed = Math.max(0, Date.now() - advisor.updated);
                        var points = advisor.points + perHour * elapsed / IkaTools.Constants.Time.MILLIS_PER_HOUR;
                        var lines = ['<div class="imp_rs_tip_title">%s : %s</div>'.format(
                            localizer.localize('misc','rs_points'), IkaTools.Intl.formatInteger(points))];
                        $.each(impNextResearches(points, perHour, advisor.domains), function(index, next) {
                            var label = '<b>%s</b>'.format(next.name || next.domain);
                            lines.push('<div class="%s">%s</div>'.format(index == 0 ? 'imp_rs_next_first' : 'imp_rs_next',
                                next.missing > 0 ?
                                localizer.localize('misc','rs_next').format(label,
                                    IkaTools.Intl.formatInteger(next.missing), formatDuration(next.time),
                                    IkaTools.Intl.formatInteger(next.experiments)) :
                                localizer.localize('misc','rs_next_ready').format(label)));
                        });
                        lines.push('<div class="imp_rs_tip_age">%s</div>'.format(
                            localizer.localize('misc','rs_advisor_age').format(formatDuration(elapsed))));
                        return '<div class="imp_rs_tip_next">' + lines.join('') + '</div>';
                    }

                    function makeResearchCell(cities) {
                        var total = 0;
                        var culturalGoods = 0;
                        var isDemocracy = IkaTools.Constants.Government.DEMOCRACY ==
                            IkaTools.EmpireData.getCivilizationData().getGovernment();
                        var statsList = [];

                        $.each(cities, function(index, city) {
                            total += city.getResearch() || 0;
                            if (isDemocracy) {
                                culturalGoods += city.getCulturalGoods();
                            }
                            var stats = getResearchStats(city);
                            if (stats) statsList.push(stats);
                        });
                        // v3.2 : chercheurs et coût en or de tout l'empire
                        var totals = impResearchTotals(statsList);
                        var goldData = civData.getGoldData();
                        var goldNegative = goldData.incomeUpdated > 0 && goldData.net < 0;

                        var rows = [makeResourceUseTableRow('+', total)];
                        var footer = [];
                        if (isDemocracy) {
                            rows.push(makeResourceUseTableRow(
                                '<img src="/cdn/all/both/museum/icon32_culturalgood.png" height="10"/>', culturalGoods));
                            footer.push(makeResourceUseTableRow('&sum;', total + culturalGoods));
                        }
                        rows.push(makeResourceUseTableRow(localizer.localize('misc','rs_direct_cost'), -Math.round(totals.directCost)));
                        rows.push(makeResourceUseTableRow(localizer.localize('misc','rs_lost_tax'), -Math.round(totals.lostTax)));
                        footer.push(makeResourceUseTableRow(localizer.localize('misc','rs_total_cost'), -Math.round(totals.totalCost)));

                        // Total des recherches
                        toolTips.registerSimple('ResearchTotal',
                            '<div class="imp_rs_tip">' +
                            '<div class="imp_rs_tip_title">%s : %s</div>'.format(
                                localizer.localize('misc','rs_scientists'),
                                IkaTools.Intl.formatInteger(totals.scientists)) +
                            makeResourceUseToolTip(
                            '/cdn/all/both/layout/bulb-on.png', rows, footer) +
                            (isFinite(totals.goldPerPoint) ?
                             '<div class="imp_rs_tip_age">%s : %s</div>'.format(
                                 localizer.localize('misc','rs_gold_per_point'),
                                 IkaTools.Intl.formatDecimal(totals.goldPerPoint, 1)) : '') +
                            makeNextResearchBlock(total) +
                            (goldNegative ?
                             '<div class="imp_rs_tip_alert">%s</div>'.format(
                                 localizer.localize('misc','rs_empire_gold_negative')) : '') +
                            '</div>');

                        let formattedTotal = Math.floor(total + culturalGoods).toLocaleString();
                        return ('<td id="ResearchTotal" class="research imperator_tool_tip">' +
                                '<div class="imp_rs_l1">%s</div>' +
                                '<div class="imp_rs_l2">' +
                                '<span class="imp_rs_sci">%s</span>' +
                                '<span class="imp_rs_cost%s">%s</span>' +
                                '</div>' +
                                '</td>').format(
                            formattedTotal,
                            IkaTools.Intl.formatInteger(totals.scientists),
                            goldNegative ? ' imp_rs_negative' : '',
                            IkaTools.Intl.formatInteger(-Math.round(totals.directCost)));
                    }

                    function makePopulationCells(cities) {
                        function getData() {
                            var population = 0;
                            var growth = 0;

                            $.each(cities, function(index, city) {
                                var d = city.getPopulationData() || {};

                                var p = Number(d.population);
                                if (isFinite(p)) population += p;

                                var g = Number(d.growth);
                                if (isFinite(g)) growth += g;
                            });

                            return {
                                population: population,
                                growth: growth,
                            };
                        }

                        var updateable = updateables.create('population_total', 'population_growth_total');

                        updateable.registerTickerUpdate(function(populationCell, growthCell) {
                            var data = getData();
                            populationCell.html(IkaTools.Intl.formatInteger(data.population));
                            growthCell.html(IkaTools.Intl.formatDecimal(data.growth, 2, true));
                        });

                        var data = getData();
                        return ('<td id="%s" class="population">%s</td>' +
                                '<td/>' +
                                '<td id="%s" class="population_growth">%s</td>').format(
                            updateable.getId(0),
                            IkaTools.Intl.formatInteger(data.population),
                            updateable.getId(1),
                            IkaTools.Intl.formatDecimal(data.growth, 2, true));
                    }

                    return ('<tr><td colspan="4" class="totals_sigma_cell"/>' +
                            '%s%s%s%s%s%s%s</tr>').format(
                        makePopulationCells(cities),
                        makeResearchCell(cities),
                        makeResourceCells(cities, IkaTools.Constants.Resources.WOOD),
                        makeResourceCells(cities, IkaTools.Constants.Resources.WINE),
                        makeResourceCells(cities, IkaTools.Constants.Resources.MARBLE),
                        makeResourceCells(cities, IkaTools.Constants.Resources.GLASS),
                        makeResourceCells(cities, IkaTools.Constants.Resources.SULFUR));
                }

                function makeResourceColGroup(resource) {
                    return ('<colgroup class="resource resource_%s">' +
                            '<col class="resource_on_hand resource_%s"/>' +
                            '<col class="resource_use resource_%s"/>' +
                            '</colgroup>').format(
                        resource, resource, resource);
                }

                function makeCols() {
                    return ('%s' +
                            '<colgroup class="actions">' +
                            '<col class="actions"/>' +
                            '</colgroup>' +
                            '<colgroup class="population">' +
                            '<col class="population"/>' +
                            '<col class="population_growth_icon"/>' +
                            '<col class="population_growth"/>' +
                            '</colgroup>' +
                            '<colgroup class="research">' +
                            '<col class="research"/>' +
                            '</colgroup>' +
                            //'<colgroup class="financial">' +
                            //  '<col class="financial"/>' +
                            //'</colgroup>' +
                            '%s%s%s%s%s')
                        .format(makeCityNameColGroup('<col class="action_points">'),
                                makeResourceColGroup('wood'),
                                makeResourceColGroup('wine'),
                                makeResourceColGroup('marble'),
                                makeResourceColGroup('crystal'),
                                makeResourceColGroup('sulfur'));
                }

                function makeTableHead() {
                    toolTips.registerSimple('ResourcePopulationHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('misc','population')));
                    toolTips.registerSimple('ResourcePopulationGrowthHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('misc','population_growth')));
                    // v3.5 : nombre d'expériences possibles (vert · orange) dans l'en-tête
                    function countExperiments() {
                        var count = { ready: 0, scroll: 0 };
                        $.each(IkaTools.EmpireData.getOwnCities(), function(index, city) {
                            if (!city.getBuildingByType(IkaTools.Constants.Buildings.ACADEMY)) return;
                            var xp = getExperimentState(city);
                            if (xp.state in count) count[xp.state]++;
                        });
                        return count;
                    }
                    function makeExperimentCount() {
                        var count = countExperiments();
                        if (!count.ready && !count.scroll) return '';
                        return '<span class="imp_rs_head_ready">%s</span>·<span class="imp_rs_head_scroll">%s</span>'
                            .format(count.ready, count.scroll);
                    }
                    toolTips.registerRefreshable('ResourceResearchHeader', function() {
                        var count = countExperiments();
                        return '<div class="nowrap">%s<br/>%s</div>'.format(
                            localizer.localize('misc','research'),
                            localizer.localize('misc','rs_xp_header').format(count.ready, count.scroll));
                    });
                    updateables.create('ResearchExperimentCount').registerTickerUpdate(function(element) {
                        element.html(makeExperimentCount());
                    });
                    toolTips.registerSimple('ResourceTableActionPoints',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('misc','action_points')));
                    toolTips.registerSimple('ResourceWoodHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('resources','wood')));
                    toolTips.registerSimple('ResourceWineHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('resources','wine')));
                    toolTips.registerSimple('ResourceMarbleHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('resources','marble')));
                    toolTips.registerSimple('ResourceCrystalHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('resources','glass')));
                    toolTips.registerSimple('ResourceSulfurHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('resources','sulfur')));
                    return ('<thead>' +
                            '<tr>%s' +
                            '<th id="ResourceTableActionPoints" ' +
                            'class="action_points imperator_tool_tip">%s</th>' +
                            '<th class="actions">%s</th>' +
                            '<th colspan="1" id="ResourcePopulationHeader" ' +
                            'class="population imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourcePopulationGrowthHeader" ' +
                            'class="population_growth imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="ResourceResearchHeader" ' +
                            'class="research imperator_tool_tip">%s' +
                            '<span id="ResearchExperimentCount" class="imp_rs_head_count">%s</span></th>' +
                            '<th colspan="2" id="ResourceWoodHeader" ' +
                            'class="resource resource_wood imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourceWineHeader" ' +
                            'class="resource resource_wine imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourceMarbleHeader" ' +
                            'class="resource resource_marble imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourceCrystalHeader" ' +
                            'class="resource resource_crystal imperator_tool_tip">%s</th>' +
                            '<th colspan="2" id="ResourceSulfurHeader" ' +
                            'class="resource resource_sulfur imperator_tool_tip">%s</th>' +
                            '</tr>' +
                            '</thead>').format(
                        makeCityNameHeaderCells(),
                        localizer.localize('misc','action_points'),
                        localizer.localize('misc','actions'),
                        localizer.localize('misc','population'),
                        localizer.localize('misc','population_growth'),
                        localizer.localize('misc','research'),
                        makeExperimentCount(),
                        localizer.localize('resources','wood'),
                        localizer.localize('resources','wine'),
                        localizer.localize('resources','marble'),
                        localizer.localize('resources','glass'),
                        localizer.localize('resources','sulfur'));

                }

                var cities = IkaTools.EmpireData.getOwnCities();
                var movements = IkaTools.EmpireData.getCivilizationData().getMovements();
                var blessCaption = '';
                try { blessCaption = impBlessMakeCaption(); } catch (eCap) { blessCaption = ''; } // v2.12
                return blessCaption + '%s%s<tbody>%s</tbody><tfoot>%s</tfoot>'.format(
                    makeCols(),
                    makeTableHead(),
                    $.map(cities, makeRow.bind(null, movements)).join(''),
                    makeTotalsRow(cities));
            }

            var tab = new Tab('resources', localizer.localize('misc','resources'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewResourceTable"/>' +
                '</div>'),
                              'ImperatorOverviewResourceTable',
                              function() {
                IkaTools.EmpireData.registerResourcesChangedHandler(function(changes) {
                    tab.maybeRedraw(true);
                });
                IkaTools.EmpireData.registerBuildingsChangedHandler(function(changes) {
                    var redraw = false;
                    $.each(changes, function(index, change) {
                        var type = change.building.getType();
                        if (type == IkaTools.Constants.Buildings.TAVERN ||
                            type == IkaTools.Constants.Buildings.MUSEUM ||
                            type == IkaTools.Constants.Buildings.ACADEMY ||
                            type == IkaTools.Constants.Buildings.TOWN_HALL) {
                            redraw = true;
                        }
                    });
                    tab.maybeRedraw(redraw);
                });
                IkaTools.EmpireData.registerCivilizationDataChangedHandler(function(changes) {
                    tab.maybeRedraw(true);
                });
                IkaTools.EmpireData.registerMovementsChangedHandler(function(changes) {
                    var redraw = false;
                    $.each(changes, function(index, change) {
                        var mission = change.movement.mission;
                        if (mission == IkaTools.Constants.Movements.Mission.TRANSPORT ||
                            mission == IkaTools.Constants.Movements.Mission.PLUNDER) {
                            redraw = true;
                        }
                    });
                    tab.maybeRedraw(redraw);
                });
                // v3.2 : la case de total passe en rouge si le solde d'or de l'empire devient négatif
                var lastGoldNegative = null;
                IkaTools.EmpireData.registerGoldChangedHandler(function() {
                    var gd = IkaTools.EmpireData.getCivilizationData().getGoldData();
                    var negative = gd.incomeUpdated > 0 && gd.net < 0;
                    if (lastGoldNegative !== null && negative !== lastGoldNegative) {
                        tab.maybeRedraw(true);
                    }
                    lastGoldNegative = negative;
                });
                // v2.12 : affectations / bienveillances relues au Sanctuaire
                IkaTools.EmpireData.registerShrineChangedHandler(function() {
                    tab.maybeRedraw(true);
                });
                            },
                              makeTableContent);

            return tab.getTab();

        }

        // ============================================================
        // v2.07 : helpers du bloc financier du Dashboard
        // ============================================================
        // v2.12 : dérivées de IMP_GODS (source unique des couleurs des dieux)
        var GOD_COLORS = {}, GOD_BG = {};
        $.each(IMP_GODS, function(id, g) { GOD_COLORS[g.name] = g.color; GOD_BG[g.name] = g.bg; });
        var _IMP_HORIZONS = {
            '1j':   { h:24,  end:'24h' },
            '1sem': { h:168, end:'7j'  },
            '1mois':{ h:720, end:'30j' }
        };
        var _impDashHorizon    = '1j';
        var _impDashGoldCache  = { current:0, net:0, hasData:false };
        var _impDashEventsBound = false;

        function _impFmtNum(n) {
            if (n == null || isNaN(n)) return '?';
            var s = n < 0 ? '-' : '', a = Math.abs(n);
            if (a >= 1e9) return s + (a/1e9).toFixed(1) + 'G';
            if (a >= 1e6) return s + (a/1e6).toFixed(1) + 'M';
            if (a >= 1e4) return s + Math.round(a/1e3) + 'k';
            return s + Math.round(a).toString();
        }
        function _impFmtS(n) {
            if (!isFinite(n) || n === 0) return '0';
            return (n > 0 ? '+' : '') + _impFmtNum(n);
        }

        // Construit le SVG de la courbe prospective (projection linéaire de l'or).
        function _impBuildGoldChartSvg(current, net, key) {
            var H = _IMP_HORIZONS[key] || _IMP_HORIZONS['1j'];
            var hours = H.h;
            var W = 328, Hgt = 104, padL = 6, padR = 6, padT = 10, padB = 18;
            var n = 48, pts = [], i, t, v;
            for (i = 0; i <= n; i++) {
                t = hours * i / n;
                v = current + net * t;
                if (v < 0) v = 0;
                pts.push({ t:t, v:v });
            }
            var vmin = Infinity, vmax = -Infinity;
            for (i = 0; i < pts.length; i++) { if (pts[i].v < vmin) vmin = pts[i].v; if (pts[i].v > vmax) vmax = pts[i].v; }
            if (vmax === vmin) vmax = vmin + 1;
            var pad = (vmax - vmin) * 0.10; vmin -= pad; vmax += pad; if (vmin < 0) vmin = 0;
            var innerW = W - padL - padR, innerH = Hgt - padT - padB;
            function X(tt){ return padL + innerW * (tt / hours); }
            function Y(vv){ return padT + innerH * (1 - (vv - vmin) / (vmax - vmin)); }

            var endV = current + net * hours; if (endV < 0) endV = 0;
            var bankrupt = net < 0 && (current + net * hours <= 0);
            var color = net > 0 ? '#4caf50' : net < 0 ? (bankrupt ? '#e05555' : '#e0a020') : '#888';

            var line = '', area = '';
            for (i = 0; i < pts.length; i++) {
                var px = X(pts[i].t).toFixed(1), py = Y(pts[i].v).toFixed(1);
                line += (i ? ' L ' : 'M ') + px + ' ' + py;
            }
            area = line + ' L ' + X(hours).toFixed(1) + ' ' + (padT + innerH).toFixed(1) +
                          ' L ' + X(0).toFixed(1)     + ' ' + (padT + innerH).toFixed(1) + ' Z';

            // bandes de survol (tooltip natif via <title>)
            var bands = '', nb = 12, gid = 'impGrad_' + key;
            for (i = 0; i < nb; i++) {
                var t0 = hours * i / nb, t1 = hours * (i + 1) / nb;
                var bx = X(t0), bw = X(t1) - X(t0);
                var tm = (t0 + t1) / 2, vm = current + net * tm; if (vm < 0) vm = 0;
                var lbl = (tm < 24 ? Math.round(tm) + 'h' : Math.round(tm/24) + 'j') + ' \u2192 ' + _impFmtNum(vm) + ' or';
                bands += '<rect x="' + bx.toFixed(1) + '" y="' + padT + '" width="' + bw.toFixed(1) + '" height="' + innerH +
                         '" fill="transparent"><title>' + lbl + '</title></rect>';
            }

            return '' +
            '<svg viewBox="0 0 ' + W + ' ' + Hgt + '" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">' +
                '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
                    '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.22"/>' +
                    '<stop offset="100%" stop-color="' + color + '" stop-opacity="0.02"/>' +
                '</linearGradient></defs>' +
                '<path d="' + area + '" fill="url(#' + gid + ')" stroke="none"/>' +
                '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linejoin="round"/>' +
                '<circle cx="' + X(0).toFixed(1) + '" cy="' + Y(pts[0].v).toFixed(1) + '" r="2.4" fill="' + color + '"/>' +
                '<circle cx="' + X(hours).toFixed(1) + '" cy="' + Y(endV).toFixed(1) + '" r="2.4" fill="' + color + '"/>' +
                '<text x="' + padL + '" y="' + (Hgt - 5) + '" font-size="9" fill="#999">Maintenant</text>' +
                '<text x="' + (W - padR) + '" y="' + (Hgt - 5) + '" font-size="9" fill="#999" text-anchor="end">' + H.end + '</text>' +
                bands +
            '</svg>';
        }

        // Le contenu complet du panneau graphique (boutons + courbe + pied).
        function _impGraphInner(current, net, key, hasData) {
            function btn(k, label) {
                var active = (k === key);
                return '<a href="javascript:void(0)" class="imp-fin-horizon" data-h="' + k + '" style="' +
                    'display:inline-block;padding:4px 12px;margin:0;font-size:11px;font-weight:500;cursor:pointer;' +
                    'border:0.5px solid rgba(0,0,0,0.15);border-radius:6px;text-decoration:none;' +
                    (active ? 'background:#4a5568;color:#fff;border-color:#4a5568' : 'background:#fff;color:#666') + '">' +
                    label + '</a>';
            }
            var header =
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em">\u2611 \u00c9volution prospective</div>' +
                    '<div style="display:flex;gap:6px">' + btn('1j','1 jour') + btn('1sem','1 semaine') + btn('1mois','1 mois') + '</div>' +
                '</div>';
            if (!hasData) {
                return header +
                    '<div style="padding:20px 8px;text-align:center;font-size:11px;color:#bbb">' +
                    'Donn\u00e9es d\'or indisponibles \u2014 recharge une page ou clique sur \u00ab Mettre \u00e0 jour \u00bb.</div>';
            }
            var H = _IMP_HORIZONS[key] || _IMP_HORIZONS['1j'];
            var gain = net * H.h, endV = Math.max(0, current + gain);
            var svg = _impBuildGoldChartSvg(current, net, key);
            var footColor = net > 0 ? '#4caf50' : net < 0 ? '#e05555' : '#888';
            var foot =
                '<div style="display:flex;justify-content:space-between;font-size:10px;color:#999;margin-top:4px">' +
                    '<span>Maintenant \u00b7 ' + _impFmtNum(current) + '</span>' +
                    '<span style="color:' + footColor + '">' + _impFmtS(gain) + ' \u2192 ' + _impFmtNum(endV) + '</span>' +
                '</div>';
            return header + '<div>' + svg + '</div>' + foot;
        }

        // Liaison unique des événements (survit aux redraws via délégation).
        function _impBindDashboardEventsOnce() {
            if (_impDashEventsBound) return;
            _impDashEventsBound = true;
            $(document).on('click', '.imp-fin-horizon', function() {
                var key = $(this).attr('data-h');
                if (!key || !_IMP_HORIZONS[key]) return;
                _impDashHorizon = key;
                var g = _impDashGoldCache;
                $('#imp-fin-graph').html(_impGraphInner(g.current, g.net, key, g.hasData));
            });
            $(document).on('click', '#imp-fin-refresh', function() {
                var $b = $(this);
                if ($b.data('busy')) return;
                $b.data('busy', 1).css('opacity', 0.5);
                var $st = $('#imp-fin-refresh-status');
                $st.text('mise \u00e0 jour\u2026');
                try {
                    IkaTools.EmpireData.refreshFinancesAndShrine(
                        function(i, total, name) { $st.text(i + '/' + total + ' \u00b7 ' + name); },
                        function() {
                            var d = new Date();
                            $st.text('\u2713 ' + ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2));
                            $b.data('busy', 0).css('opacity', 1);
                        }
                    );
                } catch(e) {
                    $st.text('erreur');
                    $b.data('busy', 0).css('opacity', 1);
                }
            });
        }

        function makeDashboardTab() {
            _impBindDashboardEventsOnce(); // v2.07
            function makeTableContent() {
                var cities  = IkaTools.EmpireData.getOwnCities();
                var civData = IkaTools.EmpireData.getCivilizationData();

                var totalPop = 0, totalResearch = 0;
                var resources  = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                var production = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                var capacity   = { wood:0, wine:0, marble:0, glass:0, sulfur:0 };
                var wineConsumption = 0;

                $.each(cities, function(i, city) {
                    totalPop      += city.population || 0;
                    totalResearch += city.getResearch() || 0;
                    $.each(['wood','wine','marble','glass','sulfur'], function(j, res) {
                        var r = city.getResource(res);
                        if (r) {
                            resources[res]  += r.getCurrent()    || 0;
                            production[res] += (r.getProduction() || 0) * IkaTools.Constants.Time.SECONDS_PER_HOUR; // v2.20 : /s -> /h
                            if (r.getCapacity) {
                                var cap = r.getCapacity();
                                capacity[res] += (cap && cap.maximum ? cap.maximum : 0);
                            }
                            if (res === 'wine') wineConsumption += Math.abs(r.getConsumption() || 0) * IkaTools.Constants.Time.SECONDS_PER_HOUR; // v2.20 : /h
                        }
                    });
                });

                var wineAutonomy = wineConsumption > 0
                    ? Math.floor(resources.wine / wineConsumption / 24) : 999;

                var transports = 0, militaires = 0;
                $.each(civData.getMovements(), function(id, mv) {
                    if (mv.getMission() === IkaTools.Constants.Movements.Mission.TRANSPORT) transports++;
                    else militaires++;
                });

                var queue = [];
                $.each(cities, function(i, city) {
                    $.each(city.getBuildings(), function(j, b) {
                        var ct = b.getCompletionTime ? b.getCompletionTime() : null;
                        if (ct) {
                            var remaining = ct - IkaTools.View.gameTimeNow();
                            if (remaining > 0) {
                                queue.push({ city: city.getName(), building: b.getType(), level: b.getLevel(), remaining: remaining });
                            }
                        }
                    });
                });
                queue.sort(function(a, b) { return a.remaining - b.remaining; });

                function fmtTime(ms) {
                    var s = Math.floor(ms / 1000);
                    var d = Math.floor(s / 86400); s %= 86400;
                    var h = Math.floor(s / 3600);  s %= 3600;
                    var m = Math.floor(s / 60);
                    if (d > 0) return d + 'j ' + h + 'h';
                    if (h > 0) return h + 'h ' + m + 'm';
                    return m + 'm';
                }

                function fmtNum(n) {
                    if (n == null || isNaN(n)) return '?';
                    if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'G';
                    if (n >= 1000000)    return (n / 1000000).toFixed(1)    + 'M';
                    if (n >= 10000)      return Math.round(n / 1000)        + 'k';
                    return Math.round(n).toString();
                }

                function cityRow(city) {
                    var pop = city.population || 0;
                    var sat = city.happinessScore != null ? city.happinessScore : '?';
                    var res = city.getResearch() || 0;
                    var satBad  = sat !== '?' && sat < 0;
                    var satWarn = sat !== '?' && sat >= 0 && sat < 50;
                    var satOk   = sat !== '?' && sat >= 50;
                    var satColor = satBad ? '#e05555' : satWarn ? '#e0a020' : satOk ? '#4caf50' : '#888';
                    var satBg    = satBad ? 'rgba(220,80,80,0.15)' : satWarn ? 'rgba(220,160,30,0.15)' : satOk ? 'rgba(60,180,60,0.15)' : 'rgba(0,0,0,0.08)';
                    var satLabel = satBad ? '! ' : satWarn ? '⚠ ' : satOk ? '✓ ' : '';
                    // Net or / h par ville
                    var hasGoldCity = city.cityGoldNetUpdated > 0;
                    // Fallback: si finances non ouvertes, montrer juste le coût scientifiques connu
                    var goldNetCity = hasGoldCity ? (city.cityGoldNet || 0) : null;
                    var sciCost = city.getScientists ? -(city.getScientists() || 0) * (civData.hasResearched(IkaTools.Constants.Research.Science.LETTER_CHUTE) ? 3 : 6) : 0;
                    var goldCityColor = goldNetCity !== null
                        ? (goldNetCity > 0 ? '#4caf50' : goldNetCity < 0 ? '#e05555' : '#888')
                        : '#bbb';
                    var goldCityLabel = goldNetCity !== null
                        ? (goldNetCity > 0 ? '+' : '') + fmtNum(goldNetCity)
                        : (sciCost !== 0 ? '<span title="Sci. seulement">' + fmtNum(sciCost) + '*</span>' : '—');
                    // v2.07 : divinité vénérée par la ville
                    var godName = city.worshipGodName || null;
                    var godCell;
                    if (godName) {
                        var gc = GOD_COLORS[godName] || '#888';
                        var gbg = GOD_BG[godName] || 'rgba(0,0,0,0.06)';
                        godCell = '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:' + gbg + ';color:' + gc + ';font-weight:500">' + godName + '</span>';
                    } else {
                        godCell = '<span style="font-size:11px;color:#bbb">&mdash;</span>';
                    }
                    return '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.07)">' +
                        '<td style="padding:4px 6px;font-size:11px;font-weight:500">' + __impH(city.getName()) + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right">' + fmtNum(pop) + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right">' + res + '</td>' +
                        '<td style="padding:4px 6px;text-align:center">' +
                            '<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:' + satBg + ';color:' + satColor + '">' + satLabel + sat + '</span>' +
                        '</td>' +
                        '<td style="padding:4px 6px;text-align:center">' + godCell + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right;color:' + goldCityColor + '">' + goldCityLabel + '</td>' +
                    '</tr>';
                }

                function queueRow(q) {
                    return '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.07)">' +
                        '<td style="padding:4px 6px;font-size:11px;color:#888">' + __impH(q.city) + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px">' + (localizer.localize('buildings', q.building) || q.building) + ' niv ' + q.level + '</td>' +
                        '<td style="padding:4px 6px;font-size:11px;text-align:right;color:#888">' + fmtTime(q.remaining) + '</td>' +
                    '</tr>';
                }

                var wineColor = wineAutonomy < 7 ? '#e05555' : wineAutonomy < 30 ? '#e0a020' : '#4caf50';
                var wineLabel = wineAutonomy >= 999 ? '∞' : wineAutonomy + 'j';

                // Or
                var gd = civData.getGoldData();
                var goldCurrent = gd.current || 0;
                var goldNet     = gd.net     || 0;
                var goldRev     = gd.revenue    || 0;
                var goldGods    = gd.gods       || 0;
                var goldSci     = gd.scientists || 0;
                var goldUp      = gd.upkeep     || 0;
                var goldPrem    = gd.premium    || 0;
                var hasIncome   = gd.incomeUpdated  > 0;
                var hasGold     = gd.currentUpdated > 0;
                var goldColor   = goldNet > 0 ? '#4caf50' : goldNet < 0 ? '#e05555' : '#888';
                var goldProj1h  = goldNet;
                var goldProj1j  = goldNet * 24;
                var goldProj7j  = goldNet * 24 * 7;
                var goldAuto    = '';
                if (goldNet < 0 && goldCurrent > 0) {
                    var dl = goldCurrent / Math.abs(goldNet) / 24;
                    goldAuto = dl < 1 ? Math.round(dl*24)+'h avant faillite' : Math.floor(dl)+'j avant faillite';
                } else if (goldNet > 0) { goldAuto = 'surplus'; }
                function fmtS(n) {
                    if (!isFinite(n) || n === 0) return '0';
                    return (n > 0 ? '+' : '') + fmtNum(n);
                }
                function gRow(lbl, val) {
                    var c = val > 0 ? '#4caf50' : val < 0 ? '#e05555' : '#888';
                    return '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.05)">'+
                        '<td style="padding:3px 8px;font-size:11px;color:#555">' + lbl + '</td>'+
                        '<td style="padding:3px 8px;font-size:11px;text-align:right;color:'+c+'">'+fmtS(val)+'</td>'+
                    '</tr>';
                }

                // === v2.07 : valeurs dérivées du bloc financier ===
                var revenuBrut = goldRev + goldGods;                 // pop. + dieux
                var depenses   = goldSci + goldUp;                    // scientifiques + entretien (négatifs)
                var goldOr7j   = Math.max(0, goldCurrent + goldProj7j);
                // Répartitions (en %)
                var popVsGods  = revenuBrut !== 0 ? Math.round(goldRev / revenuBrut * 100) : 0;
                var pctSci     = Math.abs(depenses) > 0 ? Math.round(Math.abs(goldSci) / Math.abs(depenses) * 100) : 0;
                var pctUp      = Math.abs(depenses) > 0 ? Math.round(Math.abs(goldUp)  / Math.abs(depenses) * 100) : 0;
                // Regroupement des divinités par ville (ordre fixe du jeu)
                var GOD_ORDER = ['Pluton','Théia','Héphaïstos','Pan','Dionysos','Tyché'];
                var godGroups = {};
                $.each(cities, function(i, c) {
                    var g = c && c.worshipGodName;
                    if (g) { (godGroups[g] = godGroups[g] || []).push(c.getName()); }
                });
                var hasGodData = false; for (var _gk in godGroups) { if (godGroups.hasOwnProperty(_gk)) { hasGodData = true; break; } }
                var shrineFavor = (civData.getShrineData ? (civData.getShrineData().favor || 0) : 0);
                // Barre de répartition réutilisable
                function repBar(label, pct, colorL, extra) {
                    var p = Math.max(0, Math.min(100, pct || 0));
                    return '<div style="margin-bottom:6px">' +
                        '<div style="display:flex;justify-content:space-between;font-size:10px;color:#888;margin-bottom:2px">' +
                            '<span>' + label + '</span><span>' + (extra != null ? extra : (p + '%')) + '</span>' +
                        '</div>' +
                        '<div style="height:5px;background:rgba(0,0,0,0.10);border-radius:3px;overflow:hidden">' +
                            '<div style="width:' + p + '%;height:100%;background:' + colorL + ';border-radius:3px"></div>' +
                        '</div>' +
                    '</div>';
                }
                // Petit KPI financier
                function kpi(label, value, color, sub) {
                    return '<div style="background:rgba(0,0,0,0.05);border-radius:6px;padding:8px 10px">' +
                        '<div style="font-size:9px;color:#999;margin-bottom:2px">' + label + '</div>' +
                        '<div style="font-size:15px;font-weight:600;color:' + color + '">' + value + '</div>' +
                        (sub ? '<div style="font-size:9px;color:#aaa;margin-top:1px">' + sub + '</div>' : '') +
                    '</div>';
                }
                function projRow(lbl, val) {
                    return '<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0">' +
                        '<span style="color:#666">' + lbl + '</span><span style="font-weight:500;color:' + goldColor + '">' + val + '</span></div>';
                }
                function th(label, align) {
                    return '<th style="font-size:10px;color:#888;font-weight:400;text-align:' + align + ';padding:2px 6px">' + label + '</th>';
                }
                function godCards() {
                    var out = '<div style="display:flex;flex-wrap:wrap;gap:6px">';
                    $.each(GOD_ORDER, function(i, g) {
                        if (!godGroups[g]) return;
                        var col = GOD_COLORS[g] || '#888', bg = GOD_BG[g] || 'rgba(0,0,0,0.05)';
                        var citiesList = godGroups[g];
                        out += '<div style="flex:1 1 30%;min-width:120px;background:' + bg + ';border:0.5px solid ' + col + '55;border-radius:6px;padding:7px 9px">' +
                            '<div style="font-size:11px;font-weight:600;color:' + col + ';margin-bottom:3px">' + g +
                                ' <span style="font-weight:400;color:#999">(' + citiesList.length + ')</span></div>' +
                            '<div style="font-size:10px;color:#777;line-height:1.5">' + $.map(citiesList, __impH).join('<br>') + '</div>' +
                        '</div>';
                    });
                    out += '</div>';
                    return out;
                }
                function godFooter() {
                    var hasPluton = !!godGroups['Pluton'];
                    var others = [];
                    $.each(['Théia','Héphaïstos','Pan','Dionysos','Tyché'], function(i, g) { if (godGroups[g]) others.push(g); });
                    var parts = [];
                    if (hasPluton) parts.push('Bonus Pluton : <b style="color:#d4a017">' + _impFmtS(goldGods) + ' or/h</b>');
                    if (others.length) parts.push(others.join(' &amp; ') + ' : production ressources');
                    if (!parts.length) return '';
                    return '<div style="font-size:9px;color:#999;margin-top:8px;border-top:0.5px solid rgba(0,0,0,0.08);padding-top:6px">' + parts.join(' \u00b7 ') + '</div>';
                }

                // Mise en cache pour le graphique interactif (toggle 1j/1sem/1mois)
                _impDashGoldCache = { current: goldCurrent, net: goldNet, hasData: (hasIncome || hasGold) };

                var html = '<tbody><tr><td style="padding:10px;border:none">' +

                    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:10px">' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Population</div>' +
                            '<div style="font-size:18px;font-weight:500">' + fmtNum(totalPop) + '</div>' +
                            '<div style="font-size:10px;color:#888">' + cities.length + ' villes</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Recherche / h</div>' +
                            '<div style="font-size:18px;font-weight:500">' + fmtNum(totalResearch) + '</div>' +
                            '<div style="font-size:10px;color:#888">empire total</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Transports actifs</div>' +
                            '<div style="font-size:18px;font-weight:500">' + transports + '</div>' +
                            '<div style="font-size:10px;color:#888">' + militaires + ' militaires</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Autonomie vin</div>' +
                            '<div style="font-size:18px;font-weight:500;color:' + wineColor + '">' + wineLabel + '</div>' +
                            '<div style="font-size:10px;color:#888">stock / conso</div>' +
                        '</div>' +
                        '<div style="background:rgba(0,0,0,0.06);border-radius:6px;padding:9px 11px;border-left:3px solid #d4a017">' +
                            '<div style="font-size:10px;color:#888;margin-bottom:2px">Or empire</div>' +
                            '<div style="font-size:18px;font-weight:500">' + (hasGold ? fmtNum(goldCurrent) : '—') + '</div>' +
                            '<div style="font-size:10px;color:' + goldColor + '">' +
                                (hasIncome ? fmtS(goldNet)+'/h' : '<span style="color:#bbb;font-size:9px">ouvrir Finances</span>') +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;align-items:start">' +

                        // ===================== COLONNE GAUCHE : FINANCES =====================
                        '<div style="display:flex;flex-direction:column;gap:10px">' +

                            // En-tête + bouton de mise à jour manuelle
                            '<div style="display:flex;align-items:center;justify-content:space-between">' +
                                '<div style="font-size:10px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.05em">Finances</div>' +
                                '<div style="display:flex;align-items:center;gap:6px">' +
                                    '<span id="imp-fin-refresh-status" style="font-size:10px;color:#aaa"></span>' +
                                    '<a href="javascript:void(0)" id="imp-fin-refresh" title="Recharger finances + sanctuaire en arri\u00e8re-plan" style="font-size:10px;padding:3px 9px;border:0.5px solid rgba(0,0,0,0.15);border-radius:6px;background:#fff;color:#555;text-decoration:none">\u27f3 Mettre \u00e0 jour</a>' +
                                '</div>' +
                            '</div>' +

                            // Alerte contextuelle
                            (goldAuto ?
                                '<div style="border-radius:8px;padding:8px 12px;font-size:11px;font-weight:500;' +
                                    (goldNet < 0 ? 'background:rgba(224,85,85,0.12);border:0.5px solid rgba(224,85,85,0.35);color:#c0392b'
                                                 : 'background:rgba(76,175,80,0.12);border:0.5px solid rgba(76,175,80,0.35);color:#2e7d32') + '">' +
                                    (goldNet < 0 ? '\u26a0 ' + goldAuto : '\u2713 Surplus actif \u00b7 ' + _impFmtS(goldNet) + ' or/h') +
                                '</div>'
                            : '') +

                            // 3 KPIs
                            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
                                kpi('Revenu brut / h', _impFmtS(revenuBrut), '#4caf50', 'pop. + dieux') +
                                kpi('D\u00e9penses / h', _impFmtS(depenses), '#e05555', 'sci. + entretien') +
                                kpi('Solde net / h', _impFmtS(goldNet), goldColor, goldNet > 0 ? 'surplus actif' : (goldNet < 0 ? 'd\u00e9ficit' : '\u00e9quilibre')) +
                            '</div>' +

                            // Détail + Répartition
                            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
                                '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 6px 8px">' +
                                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;padding:0 6px">D\u00e9tail / h</div>' +
                                    '<table style="width:100%;border-collapse:collapse">' +
                                        gRow('Revenu population', goldRev) +
                                        gRow('Dieux (Pluton)', goldGods) +
                                        gRow('Scientifiques', goldSci) +
                                        gRow("Co\u00fbts d'entretien", goldUp) +
                                        '<tr><td style="padding:3px 8px;font-size:11px;color:#555">Bonus premium</td>' +
                                            '<td style="padding:3px 8px;font-size:11px;text-align:right;color:#888">' + (goldPrem ? _impFmtS(goldPrem) : '0 %') + '</td></tr>' +
                                        '<tr style="border-top:1px solid rgba(0,0,0,0.15)">' +
                                            '<td style="padding:5px 8px;font-size:11px;font-weight:700;color:#444">Net / h</td>' +
                                            '<td style="padding:5px 8px;font-size:12px;text-align:right;font-weight:700;color:' + goldColor + '">' + _impFmtS(goldNet) + '</td></tr>' +
                                    '</table>' +
                                '</div>' +
                                '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px 8px">' +
                                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">R\u00e9partition</div>' +
                                    repBar('Pop. vs Dieux', popVsGods, '#7cb342', popVsGods + ' / ' + (100 - popVsGods) + '%') +
                                    repBar('Scientifiques', pctSci, '#e0a020', pctSci + '% d\u00e9p.') +
                                    repBar('Entretien', pctUp, '#e05555', pctUp + '% d\u00e9p.') +
                                    '<div style="margin-top:8px;border-top:0.5px solid rgba(0,0,0,0.08);padding-top:6px">' +
                                        projRow('Dans 24h', _impFmtS(goldProj1j)) +
                                        projRow('Dans 7 j', _impFmtS(goldProj7j)) +
                                        projRow('Or dans 7j', _impFmtNum(goldOr7j)) +
                                    '</div>' +
                                '</div>' +
                            '</div>' +

                            // Sanctuaire divin
                            '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
                                    '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em">\u26a1 Sanctuaire divin</div>' +
                                    (shrineFavor > 0 ? '<div style="font-size:10px;color:#888">Faveur : <b style="color:#d4a017">' + _impFmtNum(shrineFavor) + '</b></div>' : '') +
                                '</div>' +
                                (hasGodData ? (godCards() + godFooter())
                                            : '<div style="font-size:11px;color:#bbb;padding:4px 0">Ouvre le Sanctuaire divin (ou \u00ab Mettre \u00e0 jour \u00bb) pour charger les divinit\u00e9s par ville.</div>') +
                            '</div>' +

                            // Graphique prospectif interactif
                            '<div id="imp-fin-graph" style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                                _impGraphInner(goldCurrent, goldNet, _impDashHorizon, (hasIncome || hasGold)) +
                            '</div>' +

                        '</div>' +

                        // ===================== COLONNE DROITE : VILLES =====================
                        '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                            '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;text-align:right">Villes</div>' +
                            '<table style="width:100%;border-collapse:collapse">' +
                                '<tr style="border-bottom:0.5px solid rgba(0,0,0,0.12)">' +
                                    th('Ville', 'left') + th('Pop.', 'right') + th('Rech.', 'right') +
                                    th('Satis.', 'center') + th('Dieu', 'center') + th('Or/h', 'right') +
                                '</tr>' +
                                $.map(cities, cityRow).join('') +
                            '</table>' +
                            '<div style="font-size:9px;color:#aaa;margin-top:8px;line-height:1.4">' +
                                '* Or/h ville = estimation scientifiques uniquement.<br>' +
                                'Ouvrir Conseiller Finances (ou \u00ab Mettre \u00e0 jour \u00bb) pour les valeurs r\u00e9elles.' +
                            '</div>' +
                        '</div>' +

                    '</div>' +

                    (queue.length > 0 ?
                        '<div style="background:#fff;border:0.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:10px 12px">' +
                            '<div style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">File de construction (' + queue.length + ')</div>' +
                            '<table style="width:100%;border-collapse:collapse">' +
                                $.map(queue, queueRow).join('') +
                            '</table>' +
                        '</div>'
                    : '') +

                '</td></tr></tbody>';

                return html;
            }

            var tab = new Tab('dashboard', localizer.localize('misc', 'dashboard'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewDashboardTable"/>' +
                '</div>'),
                'ImperatorOverviewDashboardTable',
                function() {
                    IkaTools.EmpireData.registerResourcesChangedHandler(function() {
                        tab.maybeRedraw(true);
                    });
                    IkaTools.EmpireData.registerGoldChangedHandler(function() {
                        tab.maybeRedraw(true);
                    });
                },
                makeTableContent);

            return tab.getTab();
        }

        function makeBuildingsTab() {
            var BUILDING_ORDER = [
                { name: 'growth',
                 buildings: [
                     IkaTools.Constants.Buildings.TOWN_HALL,
                     IkaTools.Constants.Buildings.PALACE,
                     IkaTools.Constants.Buildings.GOVERNORS_RESIDENCE,
                     IkaTools.Constants.Buildings.TAVERN,
                     IkaTools.Constants.Buildings.MUSEUM
                 ] },

                { name: 'research',
                 buildings: [
                     IkaTools.Constants.Buildings.ACADEMY,
                     IkaTools.Constants.Buildings.WORKSHOP,
                     IkaTools.Constants.Buildings.TEMPLE,
                     IkaTools.Constants.Buildings.DIVINE_SANCTUARY,
                     IkaTools.Constants.Buildings.CHRONOS_FORGE
                 ] },

                { name: 'diplomacy',
                 buildings: [
                     IkaTools.Constants.Buildings.EMBASSY
                 ] },

                { name: 'trading',
                 buildings: [
                     IkaTools.Constants.Buildings.WAREHOUSE,
                     IkaTools.Constants.Buildings.DUMP,
                     IkaTools.Constants.Buildings.TRADING_PORT,
                     IkaTools.Constants.Buildings.DOCKYARD,       // ajout
                     IkaTools.Constants.Buildings.TRADING_POST,
                     IkaTools.Constants.Buildings.BLACK_MARKET,
                     IkaTools.Constants.Buildings.MARINE_CHART_ARCHIVE
                 ] },

                { name: 'military',
                 buildings: [
                     IkaTools.Constants.Buildings.WALL,
                     IkaTools.Constants.Buildings.HIDEOUT,
                     IkaTools.Constants.Buildings.BARRACKS,
                     IkaTools.Constants.Buildings.SHIPYARD,
                     IkaTools.Constants.Buildings.PIRATE_FORTRESS
                 ] },

                { name: 'wood',
                 buildings: [
                     IkaTools.Constants.Buildings.FORESTER,
                     IkaTools.Constants.Buildings.CARPENTER
                 ] },

                { name: 'wine',
                 buildings: [
                     IkaTools.Constants.Buildings.WINERY,
                     IkaTools.Constants.Buildings.WINE_PRESS
                 ] },

                { name: 'marble',
                 buildings: [
                     IkaTools.Constants.Buildings.STONEMASON,
                     IkaTools.Constants.Buildings.ARCHITECT
                 ] },

                { name: 'crystal',
                 buildings: [
                     IkaTools.Constants.Buildings.GLASSBLOWER,
                     IkaTools.Constants.Buildings.OPTICIAN
                 ] },

                { name: 'sulfur',
                 buildings: [
                     IkaTools.Constants.Buildings.ALCHEMISTS_TOWER,
                     IkaTools.Constants.Buildings.FIREWORK_TEST_AREA
                 ] }
            ];


            function makeTableContent() {
                var updateables = this.updateables;

                var empireBuildingCounts = {};

                $.each(IkaTools.EmpireData.getOwnCities(), function(index, city) {
                    var cityBuildingCounts = {};
                    $.each(city.getBuildings(), function(index, building) {
                        if (!building.isEmpty()) {
                            cityBuildingCounts[building.getType()] =
                                (cityBuildingCounts[building.getType()] || 0) + 1;
                        }
                    });
                    $.each(cityBuildingCounts, function(key, value) {
                        empireBuildingCounts[key] = Math.max(
                            empireBuildingCounts[key] || 0, cityBuildingCounts[key]);
                    });
                });

                function makeCols(type) {
                    var count = empireBuildingCounts[type];
                    if (count) {
                        var html = '<col class="building building_%s"/>'.format(type);
                        for (var i = 1; i < count; i++) {
                            html += '<col class="building building_additional building_%s"/>'.format(type);
                        }
                        return html;
                    } else {
                        return '';
                    }
                }

                function makeColGroup(info) {
                    var group = $.map(info.buildings, makeCols).join('');
                    return !group ? '' :
                    '<colgroup class="buildings buildings_%s">%s</colgroup>'.format(
                        info.name, group);
                }

                function makeTableHeaderCells(type) {
                    var count = empireBuildingCounts[type];
                    var displayName = localizer.localize('buildings', type);
                    var toolTip = toolTips.registerSimple('ImperatorBuildingHeader_' + type,
                                                          $('<div class="nowrap">%s</div>'.format(displayName)));
                    return !count ? '' :
                    ('<th class="building building_%s imperator_tool_tip" ' +
                     'id="ImperatorBuildingHeader_%s" colspan="%s">%s</td>').format(
                        type,
                        type,
                        count,
                        displayName);
                }

                function makeTableHeadContent() {
                    var displayName = localizer.localize('misc','building_spots');
                    toolTips.registerSimple('ImperatorBuildingHeaderBuildingSpots',
                                            '<div class="nowrap">%s</div>'.format(displayName));
                    return ('%s' +
                            '<th class="actions">%s</th>' +
                            '<th class="building building_spots imperator_tool_tip" ' +
                            'id="ImperatorBuildingHeaderBuildingSpots">%s</th>' +
                            '%s').format(
                        makeCityNameHeaderCells(),
                        localizer.localize('misc','actions'),
                        displayName,
                        $.map(BUILDING_ORDER, function(info) {
                            return $.map(info.buildings, makeTableHeaderCells);
                        }).join(''));
                }

                function makeTableCell(city, building) {
                    var link = new Link('Building_%s_%s'.format(city.getId(), building.getPosition()))
                    .toCityView(city, building.getType(),
                                { position: building.getPosition(), cityId: city.getId() });
                    var isUpgrading = building.isUpgrading();
                    var toolTip = '';
                    if (!isUpgrading && building.isMaxLevel()) {
                        toolTips.deregister(link.getId());
                    } else if (!building.isMaxLevel()) {
                        toolTips.registerRefreshable(link.getId(), function() {
                            function makeCostRow(resource) {
                                var required = costs[resource];
                                if (!required) {
                                    return '';
                                }

                                var onHand = city.getResource(resource).getCurrent();

                                return ('<tr>' +
                                        '<td class="resource_icon">' +
                                        '<img src="/cdn/all/both/resources/icon_%s.png">' +
                                        '</td>' +
                                        '<td class="resource_cost">%s</td>' +
                                        '<td class="resource_missing">%s</td>' +
                                        '</tr>').format(
                                    resource,
                                    IkaTools.Intl.formatInteger(required),
                                    onHand >= required
                                    ? '<img src="/cdn/all/both/interface/check_mark_17px.png"/>'
                                    : IkaTools.Intl.formatInteger(onHand - required, true));
                            }

                            var upgradingHtml = '';
                            if (isUpgrading) {
                                upgradingHtml = ('<div class="imperator_tool_tip_title">%s</div>' +
                                                 '<div class="nowrap">%s (%s)</div>').format(
                                    localizer.localize('misc','constructing'),
                                    IkaTools.Intl.formatRemainingTime(
                                        building.getRemainingUpgradeTime()),
                                    IkaTools.Intl.formatAbsoluteTime(
                                        building.getCompletionTime()));
                            }

                            var costs = building.getUpgradeCosts();
                            var costTitle = (isUpgrading ?
                                localizer.localize('misc','next_level_cost') :
                                localizer.localize('misc','resource_cost')) +
                                (costs._real ? '' : ' <span style="opacity:.6;font-weight:400">(estimation)</span>');

                            return ('%s<table class="building_upgrade_costs">' +
                                    '<thead class="imperator_tool_tip_title">' +
                                    '<tr><th colspan="3">%s</th></tr>' +
                                    '</thead>' +
                                    '<tbody>' +
                                    '%s%s%s%s%s' +
                                    '</tbody>' +
                                    '<tfoot>' +
                                    '<tr>' +
                                    '<td class="resource_icon">' +
                                    '<img src="/cdn/all/both/resources/icon_time.png"/>' +
                                    '</td>' +
                                    '<td class="nowrap" colspan="2">%s</td>' +
                                    '</tr>' +
                                    '</tfoot>' +
                                    '<table>')
                                .format(
                                upgradingHtml,
                                costTitle,
                                makeCostRow(IkaTools.Constants.Resources.WOOD),
                                makeCostRow(IkaTools.Constants.Resources.WINE),
                                makeCostRow(IkaTools.Constants.Resources.MARBLE),
                                makeCostRow(IkaTools.Constants.Resources.GLASS),
                                makeCostRow(IkaTools.Constants.Resources.SULFUR),
                                IkaTools.Intl.formatRemainingTime(costs.time));
                        });
                    }
                    return ('<td class="%s">%s' +
                            '<a id="%s" class="imperator_link imperator_tool_tip" ' +
                            'href="javascript:void(0);">' +
                            '%s%s' +
                            '</a>' +
                            '</td>').format(
                        isUpgrading ? 'building_upgrading' : '',
                        toolTip,
                        link.getId(),
                        building.getLevel(),
                        isUpgrading ? ('&raquo;' + (building.getLevel() + 1)) : '');
                }

                function makeTableCells(city, type) {
                    var count = empireBuildingCounts[type];
                    var html = '';
                    if (count) {
                        var buildings = city.getBuildingsByType(type);
                        for (var i = 0; i < count; i++) {
                            if (i < buildings.length) {
                                html += makeTableCell(city, buildings[i]);
                            } else {
                                html += '<td/>';
                            }
                        }
                    }
                    return html;
                }

                function makeRow(city) {
                    var buildingSpots = city.getBuildingsByType('').length;
                    var rowUpdateable = updateables.create('BuildingsTableRow_%s'.format(city.getId()))
                    .registerUpdate('cityChanged',
                                    function(element) {
                        if (IkaTools.View.isActiveCity(city)) {
                            element.addClass('current');
                        } else {
                            element.removeClass('current');
                        }
                    });
                    var cityLink = new Link('BuildingTabToCity_%s'.format(city.getId()))
                    .toCityView(city, undefined, { },
                                function() {
                        impPopup().close(); // v2.41
                        return true;
                    });
                    var transportLink = new Link('BuildingTabTransportGoods_%s'.format(city.getId()))
                    .toLocalView(
                        IkaTools.Constants.View.TRANSPORT,
                        {
                            templateView: IkaTools.Constants.View.CITY_DETAIL,
                            destinationCityId: city.getId(),
                        },
                        function() {
                            var go = !IkaTools.View.isActiveCity(city) &&
                                IkaTools.View.getCurrentCity().isOwn();
                            if (go) {
                                openBuildingsTabOnTransportClose = true;
                            }
                            return go;
                        });

                    return ('<tr id="%s" class="%s">%s' +
                            '<td class="actions">' +
                            '<a id="%s" class="imperator_link to_city_view" ' +
                            'title="%s" href="javascript:void(0);"/>' +
                            '<a id="%s" class="imperator_link transport_goods" ' +
                            'title="%s" href="javascript:void(0);"/>' +
                            '</td>' +
                            '<td class="building building_spots">%s</td>' +
                            '%s' +
                            '</tr>').format(
                        rowUpdateable.getId(0),
                        (IkaTools.View.isActiveCity(city) ? 'current' : ''),
                        makeCityNameCells('buildings', city),
                        cityLink.getId(),
                        localizer.localize('actions','to_city_view'),
                        transportLink.getId(),
                        localizer.localize('actions','transport_goods'),
                        buildingSpots > 0 ? buildingSpots : '',
                        $.map(BUILDING_ORDER, function(info) {
                            return $.map(info.buildings, makeTableCells.bind(null, city));
                        }).join(''));
                }

                return ('%s<colgroup class="actions"><col class="actions"/></colgroup>' +
                        '%s<thead>%s</thead><tbody>%s</tbody>').format(
                    makeCityNameColGroup('<col class="building building_spots">'),
                    $.map(BUILDING_ORDER, makeColGroup).join(''),
                    makeTableHeadContent(),
                    $.map(IkaTools.EmpireData.getOwnCities(), makeRow).join(''));
            }

            var tab = new Tab('buildings', localizer.localize('misc','buildings'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewBuildingsTable"/>' +
                '</div>'),
                              'ImperatorOverviewBuildingsTable',
                              function() {
                IkaTools.EmpireData.registerBuildingsChangedHandler(function(changes) {
                    tab.maybeRedraw(true);
                });
            },
                              makeTableContent);

            return tab.getTab();
        }

        var UNIT_ORDER = [
            { name: 'army_front_line',
             units: [IkaTools.Constants.Military.HOPLITE,
                     IkaTools.Constants.Military.STEAM_GIANT,
                     IkaTools.Constants.Military.SPARTAN]}, // v2.26
            { name: 'army_flank',
             units: [IkaTools.Constants.Military.SPEARMAN,
                     IkaTools.Constants.Military.SWORDSMAN]},
            { name: 'army_ranged',
             units: [IkaTools.Constants.Military.SLINGER,
                     IkaTools.Constants.Military.ARCHER,
                     IkaTools.Constants.Military.GUNNER]},
            { name: 'army_seige',
             units: [IkaTools.Constants.Military.BATTERING_RAM,
                     IkaTools.Constants.Military.CATAPULT,
                     IkaTools.Constants.Military.MORTAR]},
            { name: 'army_flying',
             units: [IkaTools.Constants.Military.GYROCOPTER,
                     IkaTools.Constants.Military.BALLOON_BOMBADIER]},
            { name: 'army_support',
             units: [IkaTools.Constants.Military.COOK,
                     IkaTools.Constants.Military.DOCTOR]},
            { name: 'navy_front_line',
             units: [IkaTools.Constants.Military.FLAME_THROWER,
                     IkaTools.Constants.Military.STEAM_RAM]},
            { name: 'navy_flank',
             units: [IkaTools.Constants.Military.RAM_SHIP]},
            { name: 'navy_ranged',
             units: [IkaTools.Constants.Military.BALLISTA_SHIP,
                     IkaTools.Constants.Military.CATAPULT_SHIP,
                     IkaTools.Constants.Military.MORTAR_SHIP]},
            { name: 'navy_seige',
             units: [IkaTools.Constants.Military.SUBMARINE,
                     IkaTools.Constants.Military.ROCKET_SHIP]},
            { name: 'navy_flying',
             units: [IkaTools.Constants.Military.PADDLE_SPEED_SHIP,
                     IkaTools.Constants.Military.BALLOON_CARRIER]},
            { name: 'navy_support',
             units: [IkaTools.Constants.Military.TENDER]}
        ];

        function makeMilitaryTab() {
            function makeTableContent() {
                var cities = IkaTools.EmpireData.getCities();

                var updateables = this.updateables;
                var empireHasTroopType = {};

                $.each(cities, function(index, city) {
                    $.each(city.getMilitary().getPresent().getCounts(), function(unit, count) {
                        if (count) {
                            empireHasTroopType[unit] = true;
                        }
                    });
                    $.each(city.getMilitary().getTrainingBatches(), function(index, batch) {
                        $.each(batch.getUnits().getCounts(), function(unit, count) {
                            if (count) {
                                empireHasTroopType[unit] = true;
                            }
                        });
                    });
                });
                $.each(IkaTools.EmpireData.getCivilizationData().getMovements(),
                       function(index, movement) {
                    $.each(movement.getUnits().getCounts(), function(unit, count) {
                        if (count) {
                            empireHasTroopType[unit] = true;
                        }
                    });
                });

                function makeCol(type) {
                    return !empireHasTroopType[type] ? '' :
                    '<col class="military military_%s"/>'.format(type);
                }

                function makeColGroup(info) {
                    var group = $.map(info.units, makeCol).join('');
                    return !group ? '' :
                    '<colgroup class="military military_%s">%s</colgroup>'.format(
                        info.name, group);
                }

                function makeTableHeaderCell(type) {
                    var displayName = localizer.localize('units', type);
                    var toolTip = toolTips.registerSimple('ImperatorMilitaryHeader_' + type,
                                                          '<div class="nowrap">%s</div>'.format(displayName));
                    return !empireHasTroopType[type] ? '' :
                    ('<th class="military military_%s imperator_tool_tip" ' +
                     'id="ImperatorMilitaryHeader_%s">%s</td>').format(
                        type,
                        type,
                        displayName);
                }

                function makeTableHeadContent() {
                    toolTips.registerSimple('MilitaryTableActionPoints',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('misc','action_points')));
                    return ('%s<th id="MilitaryTableActionPoints" ' +
                            'class="action_points imperator_tool_tip">%s</th>' +
                            '<th class="actions">%s</th>%s').format(
                        makeCityNameHeaderCells(true),
                        localizer.localize('misc','action_points'),
                        localizer.localize('misc','actions'),
                        $.map(UNIT_ORDER, function(info) {
                            return $.map(info.units, makeTableHeaderCell);
                        }).join(''));
                }

                function makeTableCell(city, military, movements, type) {
                    var cityId = city.getId();
                    var count = military.getPresent().getCount(type);

                    function isDeploymentCountableMovement(movement) {
                        if (movement.getUnits().getCount(type) > 0) {
                            var mission = movement.getMission();
                            var stage = movement.getStage();
                            if (mission == IkaTools.Constants.Movements.Mission.DEPLOY_ARMY ||
                                mission == IkaTools.Constants.Movements.Mission.DEPLOY_NAVY) {
                                if (stage == IkaTools.Constants.Movements.Stage.LOADING ||
                                    stage == IkaTools.Constants.Movements.Stage.EN_ROUTE) {
                                    return movement.getTargetCityId() == cityId;
                                }
                                if (stage == IkaTools.Constants.Movements.Stage.RETURNING) {
                                    return movement.getOriginCityId() == cityId;
                                }
                            }
                        }
                        return false;
                    }

                    function isPlunderCountableMovement(movement) {
                        if (movement.getUnits().getCount(type) > 0) {
                            var mission = movement.getMission();
                            if (mission == IkaTools.Constants.Movements.Mission.PLUNDER) {
                                return movement.getOriginCityId() == cityId;
                            }
                        }
                        return false;
                    }

                    var trainingBatches = military.getTrainingBatches();
                    var trainingCount = 0;
                    $.each(trainingBatches, function countTraining(index, batch) {
                        trainingCount += batch.getUnits().getCount(type) || 0;
                    });

                    var hasIncomingDeployments = false;
                    $.each(movements, function isIncomingDeployment(index, movement) {
                        var mission = movement.getMission();
                        var stage = movement.getStage();
                        if (mission == IkaTools.Constants.Movements.Mission.DEPLOY_ARMY ||
                            mission == IkaTools.Constants.Movements.Mission.DEPLOY_NAVY) {
                            if (stage == IkaTools.Constants.Movements.Stage.LOADING ||
                                stage == IkaTools.Constants.Movements.Stage.EN_ROUTE) {
                                hasIncomingDeployments = true;
                            }
                            if (stage == IkaTools.Constants.Movements.Stage.RETURNING) {
                                hasIncomingDeployments = true;
                            }
                        }
                    });
                    var deployingCount = 0;
                    $.each(movements, function countDeploying(index, movement) {
                        if (isDeploymentCountableMovement(movement)) {
                            deployingCount += movement.getUnits().getCount(type) || 0;
                        }
                    });

                    var plunderingCount = 0;
                    $.each(movements, function countPlundering(index, movement) {
                        if (isPlunderCountableMovement(movement)) {
                            plunderingCount += movement.getUnits().getCount(type) || 0;
                        }
                    });

                    var trainingDivId = 'MilitaryTraining_%s_%s'.format(city.getId(), type);
                    if (trainingCount) {
                        var isArmy = IkaTools.Constants.UnitData[type].isArmy;
                        toolTips.registerRefreshable(trainingDivId, function() {
                            return ('<table class="training_units_tool_tip">' +
                                    '<thead>' +
                                    '<tr>' +
                                    '<th>' +
                                    '<img src="/cdn/all/both/characters/%s%s_faceright.png" ' +
                                    '%s="15" />' +
                                    '</th>' +
                                    '<th>%s</th>' +
                                    '</tr>' +
                                    '</thead>' +
                                    '<tbody>%s</tbody>' +
                                    '</table').format(
                                isArmy ? 'military/x60_y60/y60_' : 'fleet/60x60/',
                                type,
                                isArmy ? 'height' : 'width',
                                localizer.localize('misc','training'),
                                $.map(trainingBatches, function makeTrainingToolTipRow(batch) {
                                    var count = batch.getUnits().getCount(type);
                                    if (count) {
                                        return '<tr><td class="training_count">%s</td><td>%s</td></tr>'.format(
                                            IkaTools.Intl.formatInteger(count, true),
                                            IkaTools.Intl.formatRemainingTime(
                                                batch.getCompletionTime() - IkaTools.View.gameTimeNow()));
                                    } else {
                                        return '';
                                    }
                                }).join(''));
                        });
                    } else {
                        toolTips.deregister(trainingDivId);
                    }

                    var deployingDivId = 'MilitaryDeployment_%s_%s'.format(city.getId(), type);
                    if (deployingCount) {
                        isArmy = IkaTools.Constants.UnitData[type].isArmy;
                        toolTips.registerRefreshable(deployingDivId, function() {
                            return ('<table class="deploying_units_tool_tip">' +
                                    '<thead>' +
                                    '<tr>' +
                                    '<th>' +
                                    '<img src="/cdn/all/both/characters/%s%s_faceright.png" ' +
                                    '%s="15" />' +
                                    '</th>' +
                                    '<th>%s</th>' +
                                    '</tr>' +
                                    '</thead>' +
                                    '<tbody>%s</tbody>' +
                                    '</table').format(
                                isArmy ? 'military/x60_y60/y60_' : 'fleet/60x60/',
                                type,
                                isArmy ? 'height' : 'width',
                                localizer.localize('misc','deploying'),
                                $.map(movements, function makeDeployingToolTipRow(movement) {
                                    var count = movement.getUnits().getCount(type);
                                    if (isDeploymentCountableMovement(movement)) {
                                        return '<tr><td class="deploying_count">%s</td><td>%s</td></tr>'.format(
                                            IkaTools.Intl.formatInteger(count, true),
                                            IkaTools.Intl.formatRemainingTime(
                                                movement.getArrivalTime() - IkaTools.View.gameTimeNow()));
                                    } else {
                                        return '';
                                    }
                                }).join(''));
                        });
                    } else {
                        toolTips.deregister(deployingDivId);
                    }

                    var plunderingDivId = 'MilitaryPludering_%s_%s'.format(city.getId(), type);
                    if (plunderingCount) {
                        isArmy = IkaTools.Constants.UnitData[type].isArmy;
                        toolTips.registerRefreshable(plunderingDivId, function() {
                            return ('<table class="plundering_units_tool_tip">' +
                                    '<thead>' +
                                    '<tr>' +
                                    '<th>' +
                                    '<img src="/cdn/all/both/characters/%s%s_faceright.png" ' +
                                    '%s="15" />' +
                                    '</th>' +
                                    '<th>%s</th>' +
                                    '</tr>' +
                                    '</thead>' +
                                    '<tbody>%s</tbody>' +
                                    '</table').format(
                                isArmy ? 'military/x60_y60/y60_' : 'fleet/60x60/',
                                type,
                                isArmy ? 'height' : 'width',
                                localizer.localize('misc','plundering'),
                                $.map(movements, function makeDeployingToolTipRow(movement) {
                                    var count = movement.getUnits().getCount(type);
                                    if (isPlunderCountableMovement(movement)) {
                                        return '<tr><td class="plundering_count">%s</td><td>%s</td></tr>'.format(
                                            IkaTools.Intl.formatInteger(count, true),
                                            IkaTools.Intl.formatRemainingTime(
                                                movement.getArrivalTime() - IkaTools.View.gameTimeNow()));
                                    } else {
                                        return '';
                                    }
                                }).join(''));
                        });
                    } else {
                        toolTips.deregister(plunderingDivId);
                    }

                    return !empireHasTroopType[type] ? '' :
                    ('<td class="military military_%s">' +
                     '<div>%s</div>' +
                     '<div id="%s" class="military_training imperator_tool_tip">%s</div>' +
                     '<div id="%s" class="military_deploying imperator_tool_tip">%s</div>' +
                     '<div id="%s" class="military_plundering imperator_tool_tip">%s</div>' +
                     '</td>').format(
                        type,
                        count ? IkaTools.Intl.formatInteger(count) : '&nbsp;',
                        trainingDivId,
                        trainingCount ? IkaTools.Intl.formatInteger(trainingCount, true)
                        : (trainingBatches.length ? '&nbsp;' : ''),
                        deployingDivId,
                        deployingCount ? IkaTools.Intl.formatInteger(deployingCount, true)
                        : (hasIncomingDeployments ? '&nbsp;' : ''),
                        plunderingDivId,
                        plunderingCount ?
                        IkaTools.Intl.formatInteger(plunderingCount, true) : '');
                }

                function makeActionsCell(city) {
                    var deployTroopsLink = new Link('DeployArmy_%s'.format(city.getId())).toLocalView(
                        IkaTools.Constants.View.DEPLOY,
                        {
                            templateView: IkaTools.Constants.View.CITY_DETAIL,
                            destinationCityId: city.getId(),
                            deploymentType: 'army',
                        },
                        function() {
                            var go = !IkaTools.View.isActiveCity(city);
                            if (go) {
                                openMilitaryTabOnDeploymentClose = true;
                            }
                            return go;
                        });
                    var deployNavyLink = new Link('DeployNavy_%s'.format(city.getId())).toLocalView(
                        IkaTools.Constants.View.DEPLOY,
                        {
                            templateView: IkaTools.Constants.View.CITY_DETAIL,
                            destinationCityId: city.getId(),
                            deploymentType: 'fleet',
                        },
                        function() {
                            var go = !IkaTools.View.isActiveCity(city);
                            if (go) {
                                openMilitaryTabOnDeploymentClose = true;
                            }
                            return go;
                        });

                    var barracksLinkHtml = ''
                    var shipyardLinkHtml = '';

                    var barracks = city.getBuildingByType(IkaTools.Constants.Buildings.BARRACKS);
                    var shipyard = city.getBuildingByType(IkaTools.Constants.Buildings.SHIPYARD);

                    if (city.isOwn() && barracks) {
                        var barracksLink = new Link('MilitaryBarracks_%s'.format(city.getId()))
                        .toCityView(city, IkaTools.Constants.View.BARRACKS,
                                    { position: barracks.getPosition(), cityId: city.getId() });
                        barracksLinkHtml = ('<a id="%s" class="imperator_link to_barracks" ' +
                                            'title="%s" href="javascript:void(0);"></a>').format(
                            barracksLink.getId(),
                            localizer.localize('actions','to_barracks'));
                    }

                    if (city.isOwn() && shipyard) {
                        var shipyardLink = new Link('MilitaryShipyard_%s'.format(city.getId()))

                        .toCityView(city, IkaTools.Constants.View.SHIPYARD,
                                    { position: shipyard.getPosition(), cityId: city.getId() });
                        shipyardLinkHtml = ('<a id="%s" class="imperator_link to_shipyard" ' +
                                            'title="%s" href="javascript:void(0);"></a>').format(
                            shipyardLink.getId(),
                            localizer.localize('actions','to_shipyard'));
                    }
                    return ('<td class="actions">' +
                            '<a id="%s" class="imperator_link deploy_army" ' +
                            'title="%s" href="javascript:void(0);"></a>' +
                            '<a id="%s" class="imperator_link deploy_navy" ' +
                            'title="%s" href="javascript:void(0);"></a>' +
                            '%s%s' +
                            '</td>').format(
                        deployTroopsLink.getId(),
                        localizer.localize('actions','deploy_army'),
                        deployNavyLink.getId(),
                        localizer.localize('actions','deploy_navy'),
                        barracksLinkHtml,
                        shipyardLinkHtml);
                }

                function makeRow(movements, city) {
                    var rowUpdateable = updateables.create('MilitaryTableRow_%s'.format(city.getId()))
                    .registerUpdate('cityChanged',
                                    function(element) {
                        if (IkaTools.View.isActiveCity(city)) {
                            element.addClass('current');
                        } else {
                            element.removeClass('current');
                        }
                    });

                    return ('<tr id="%s" class="%s">' +
                            '%s' +
                            '<td class="action_points">%s</td>' +
                            '%s' +
                            '%s' +

                            '</tr>')
                        .format(
                        rowUpdateable.getId(0),
                        (IkaTools.View.isActiveCity(city) ? 'current' : ''),
                        makeCityNameCells('military', city, true),
                        IkaTools.Intl.formatInteger(city.getActionPoints()),
                        makeActionsCell(city),
                        $.map(UNIT_ORDER, function(info) {
                            return $.map(info.units, makeTableCell.bind(
                                null, city, city.getMilitary(), movements));
                        }).join(''));
                }

                function makeSummaryCell(type) {
                    if (!empireHasTroopType[type]) {
                        return '';
                    }
                    var count = 0;
                    $.each(cities, function(index, city) {
                        count += city.getMilitary().getPresent().getCount(type) || 0;
                    });
                    return '<td>%s</td>'.format(IkaTools.Intl.formatInteger(count));
                }

                function makeSummaryRow(cities) {
                    return '<tr><td colspan="3" class="totals_sigma_cell"/>%s</tr>'.format(
                        $.map(UNIT_ORDER, function(info) {
                            return $.map(info.units, makeSummaryCell);
                        }).join(''));
                }

                return '%s%s%s<thead>%s</thead><tbody>%s</tbody><tfoot>%s</tfoot>'.format(
                    makeCityNameColGroup('<col class="action_points">', true),
                    '<colgroup class="actions"><col class="actions"/></colgroup>',
                    $.map(UNIT_ORDER, makeColGroup).join(''),
                    makeTableHeadContent(),
                    $.map(cities, makeRow.bind(
                        null, IkaTools.EmpireData.getCivilizationData().getMovements())).join(''),
                    makeSummaryRow(cities));
            }

            var tab = new Tab('military', localizer.localize('misc','military'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewMilitaryTable"/>' +
                '</div>'),
                              'ImperatorOverviewMilitaryTable',
                              function() {
                IkaTools.EmpireData.registerMilitaryChangedHandler(function(changes) {
                    tab.maybeRedraw(true);
                });
                IkaTools.EmpireData.registerResourcesChangedHandler(function(changes) {
                    var redraw = false;
                    $.each(changes, function(index, change) {
                        if (change.type == IkaTools.Constants.Resources.ACTION_POINTS) {
                            redraw = true;
                        }
                    });
                    tab.maybeRedraw(redraw);
                });
                IkaTools.EmpireData.registerMovementsChangedHandler(function(changes) {
                    var redraw = false;
                    $.each(changes, function(index, change) {
                        var mission = change.movement.getMission();
                        if (mission == IkaTools.Constants.Movements.Mission.DEPLOY_ARMY ||
                            mission == IkaTools.Constants.Movements.Mission.DEPLOY_NAVY ||
                            mission == IkaTools.Constants.Movements.Mission.PLUNDER) {
                            redraw = true;
                        }
                    });
                    tab.maybeRedraw(redraw);
                });
            },
                              makeTableContent);

            return tab.getTab();
        }

        function makeEspionageTab() {
            function makeTableContent() {
                var updateables = this.updateables;

                function renderTarget(target) {
                    var player = target.getPlayer();
                    if (!player) {
                        return ('<tr><td colspan="9" class="imperator_espionage_row">' +
                                '<span class="imperator_link">' + __impH(target.getName() || target.getId()) + '</span>' +
                                ' <span style="color:#888;font-size:0.85em;">(données en attente)</span>' +
                                '</td></tr>');
                    }
                    var alliance = player.getAlliance();

                    // TODO: Add predicate when no spies.
                    var cityLink = new Link('EspionageCityLink_%s'.format(target.getId()))
                    .toIkariamPage({ view: IkaTools.Constants.BaseView.CITY, cityId: target.getId() });
                    var cityLinkHtml = ('<a id="%s" class="imperator_link espionage_to_city_view player_state_%s" ' +
                                        'title="%s" href="javascript:void(0);">%s</a>').format(
                        cityLink.getId(),
                        __impH(player.getState()),
                        localizer.localize('actions','to_city_view'),
                        __impH(target.getName()));
                    var occupierHtml = '';
                    if (target.getOccupier()) {
                        occupierHtml = ('<img id="EspionageOccupier_%s" ' +
                                        '     class="espionage_occupier imperator_tool_tip" ' +
                                        '     src="/cdn/all/both/img/island/soldat_red.png" />').format(
                            target.getId());
                        toolTips.registerSimple('EspionageOccupier_%s'.format(target.getId()),
                                                '<div class="nowrap">%s %s</div>'.format(
                            localizer.localize('espionage','occupied_by'), __impH(target.getOccupier().getName())));
                    }

                    var blockaderHtml = '';
                    if (target.getBlockader()) {
                        blockaderHtml = ('<img id="EspionageBlockader_%s" ' +
                                         '     class="espionage_blockader imperator_tool_tip" ' +
                                         '     src="/cdn/all/both/img/island/schiff_red.png" />').format(
                            target.getId());
                        toolTips.registerSimple('EspionageBlockader_%s'.format(target.getId()),
                                                '<div class="nowrap">%s %s</div>'.format(
                            localizer.localize('espionage','blockaded_by'), __impH(target.getBlockader().getName())));
                    }

                    var allianceLinkHtml = '';
                    if (alliance) {
                        var allianceLink = new Link('EspionageAllianceLink_%s'.format(target.getId()))
                        .toLocalView(IkaTools.Constants.View.ALLIANCE_PAGE, { allyId: alliance.getId()});
                        allianceLinkHtml = ('[<a id="%s" class="imperator_link" ' +
                                            'title="%s" href="javascript:void(0);">%s</a>]').format(
                            allianceLink.getId(),
                            localizer.localize('actions','view_alliance_page'),
                            __impH(alliance.getName()));
                    }
                    var playerLink = new Link('EspionagePlayerLink_%s'.format(target.getId()))
                    .toLocalView(IkaTools.Constants.View.HIGH_SCORE, { searchUser: player.getName() });
                    var playerLinkHtml = ('<a id="%s" class="imperator_link player_state_%s" ' +
                                          'title="%s" href="javascript:void(0);">%s</a> %s').format(
                        playerLink.getId(),
                        __impH(player.getState()),
                        localizer.localize('actions','view_high_score'),
                        __impH(player.getName()),
                        allianceLinkHtml);

                    var islandLink = new Link('EspionageIslandLink_%s'.format(target.getId()))
                    .toIkariamPage({ view: IkaTools.Constants.BaseView.ISLAND, cityId: target.getId() });
                    var islandLinkHtml = ('<a id="%s" class="imperator_link espionage_to_island_view" ' +
                                          'title="%s" href="javascript:void(0);">[%s:%s]</a>').format(
                        islandLink.getId(),
                        localizer.localize('actions','to_island_view'),
                        target.getIslandCoordinates()[0], target.getIslandCoordinates()[1]);

                    var spyActionLink = new Link('EspionageSpyActionLink_%s'.format(target.getId()))
                    .toIkariamPage(
                        { view : IkaTools.Constants.BaseView.CITY, cityId: target.getId() },
                        IkaTools.View.makeIkariamLoadLocalPageAnchor(
                            { view: IkaTools.Constants.View.SPY_MISSION, targetCityId: target.getId() }));
                    var spyActionLinkHtml = ('<a id="%s" class="imperator_link spy_mission" ' +
                                             'title="%s" href="javascript:void(0);"></a>').format(
                        spyActionLink.getId(),
                        localizer.localize('actions','spy_mission'));

                    var pillageLink = new Link('EspionagePillageLink_%s'.format(target.getId()))
                    .toIkariamPage(
                        { view: IkaTools.Constants.BaseView.ISLAND, cityId: target.getId() },
                        IkaTools.View.makeIkariamLoadLocalPageAnchor(
                            { view: IkaTools.Constants.View.PILLAGE, destinationCityId: target.getId() }, true));
                    var pillageLinkHtml = ('<a id="%s" class="imperator_link pillage_mission" ' +
                                           'title="%s" href="javascript:void(0);"></a>').format(
                        pillageLink.getId(),
                        localizer.localize('actions','pillage'));

                    var blockadeLink = new Link('EspionageBlockageLink_%s'.format(target.getId()))
                    .toIkariamPage(
                        { view: IkaTools.Constants.BaseView.ISLAND, cityId: target.getId() },
                        IkaTools.View.makeIkariamLoadLocalPageAnchor(
                            { view: IkaTools.Constants.View.BLOCKADE, destinationCityId: target.getId() }, true));
                    var blockadeLinkHtml = ('<a id="%s" class="imperator_link blockade_mission" ' +
                                            'title="%s" href="javascript:void(0);"></a>').format(
                        blockadeLink.getId(),
                        localizer.localize('actions','blockade'));

                    var sendSpyLink = new Link('EspionageSendSpyLink_%s'.format(target.getId()))
                    .toLocalView(IkaTools.Constants.View.SEND_SPY,
                                 { isMission: 1, destinationCityId: target.getId() });
                    var sendSpyLinkHtml = ('<a id="%s" class="imperator_link send_spy_mission" ' +
                                           'title="%s" href="javascript:void(0);"></a>').format(
                        sendSpyLink.getId(),
                        localizer.localize('actions','send_spy'));

                    var occupyLink = new Link('EspionageOccupyLink_%s'.format(target.getId()))
                    .toIkariamPage(
                        { view: IkaTools.Constants.BaseView.ISLAND, cityId: target.getId() },
                        IkaTools.View.makeIkariamLoadLocalPageAnchor(
                            { view: IkaTools.Constants.View.OCCUPY, destinationCityId: target.getId() }, true));
                    var occupyLinkHtml = ('<a id="%s" class="imperator_link occupy_mission" ' +
                                          'title="%s" href="javascript:void(0);"></a>').format(
                        occupyLink.getId(),
                        localizer.localize('actions','occupy'));
                    var removeTargetLink = new Link('EspionageRemoveTarget_%s'.format(target.getId()))
                    .toFunction(function removeTarget() {
                        target.remove();
                    });
                    var removeTargetHtml = ('<a id="%s" class="imperator_link remove_espionage_target" ' +
                                            'title="%s" href="javascript:void(0);"></a>').format(
                        removeTargetLink.getId(),
                        localizer.localize('espionage','remove_target'));

                    function renderTravelTime(city) {
                        return IkaTools.Intl.formatRemainingTime(
                            IkaTools.EmpireData.calculateTravelTime(
                                city.getIslandCoordinates(), target.getIslandCoordinates(), null, 1),
                            false, 3);
                    }

                    var travelTimeUpdateable = updateables.create('EspionageTravelTime_%s'.format(target.getId()));
                    travelTimeUpdateable.registerUpdate('cityChanged',
                                                        function updateTravelTimeOnCityChange(travelTime) {
                        travelTime.html(renderTravelTime(IkaTools.View.getCurrentCity()));
                    });

                    function makeTravelTimeTable() {
                        var cities = IkaTools.EmpireData.getCities();
                        cities.sort(function(city1, city2) {
                            return IkaTools.EmpireData.calculateTravelTime(
                                city1.getIslandCoordinates(), target.getIslandCoordinates()) -
                                IkaTools.EmpireData.calculateTravelTime(
                                city2.getIslandCoordinates(), target.getIslandCoordinates());
                        });
                        return ('<table class="travel_time">' +
                                '<thead><tr><td>%s</td><td>%s</td></tr></head>' +
                                '<tbody>%s</tbody>' +
                                '</table>').format(
                            localizer.localize('misc','city_name'),
                            localizer.localize('espionage','travel_time'),
                            $.map(cities, function(city) {
                                if (city.isOwn()) {
                                    return '<tr><td>%s</td><td>%s</td></tr>'.format(
                                        __impH(city.getName()),
                                        renderTravelTime(city));
                                } else {
                                    return '';
                                }
                            }).join(''));
                    }

                    toolTips.register('EspionageTravelTime_%s'.format(target.getId()),
                                      makeTravelTimeTable);


                    var lootableResources = NaN;
                    if (target.hasResourceInfo()) {
                        lootableResources =
                            target.getLootableResources(IkaTools.Constants.Resources.WOOD) +
                            target.getLootableResources(IkaTools.Constants.Resources.WINE) +
                            target.getLootableResources(IkaTools.Constants.Resources.MARBLE) +
                            target.getLootableResources(IkaTools.Constants.Resources.GLASS) +
                            target.getLootableResources(IkaTools.Constants.Resources.SULFUR);

                        function makeResourceTable() {
                            function makeLootableRow(resource) {
                                return ('<tr>' +
                                        '<td class="resource_icon">' +
                                        '<img src="/cdn/all/both/resources/icon_%s.png">' +
                                        '</td>' +
                                        '<td class="resource_lootable">%s</td>' +
                                        '</tr>').format(
                                    resource,
                                    IkaTools.Intl.formatInteger(target.getLootableResources(resource)));
                            }

                            return ('<table class="lootable_resources">' +
                                    '<thead class="imperator_tool_tip_title">' +
                                    '<tr><th colspan="2">%s</th></tr>' +
                                    '</thead>' +
                                    '<tbody>' +
                                    '%s%s%s%s%s' +
                                    '</tbody>' +
                                    '<tfoot>' +
                                    '<tr>' +
                                    '<td><img src="/cdn/all/both/layout/icon-status-small.png" height="11"/></td>' +
                                    '<td>%s</td>' +
                                    '</tr>' +
                                    '</tfoot>' +
                                    '<table>')
                                .format(
                                localizer.localize('espionage', 'resources_lootable'),
                                makeLootableRow(IkaTools.Constants.Resources.WOOD),
                                makeLootableRow(IkaTools.Constants.Resources.WINE),
                                makeLootableRow(IkaTools.Constants.Resources.MARBLE),
                                makeLootableRow(IkaTools.Constants.Resources.GLASS),
                                makeLootableRow(IkaTools.Constants.Resources.SULFUR),
                                IkaTools.Intl.formatRemainingTime(
                                    IkaTools.View.gameTimeNow() - target.getResourcesSpyTime()));
                        }

                        toolTips.register('EspionageLootableResources_%s'.format(target.getId()),
                                          makeResourceTable);
                    } else {
                        toolTips.deregister('EspionageLootableResources_%s'.format(target.getId()));
                    }

                    if (target.hasMilitaryInfo()) {
                        var military = target.getMilitary();
                        var otherMilitary = target.getOtherMilitary();

                        function makeGarrisonTableHeaderCell(type) {
                            var displayName = localizer.localize('units', type);
                            return (military.getCount(type) || otherMilitary.getCount(type)) ?
                                ('<th class="military military_%s">%s</th>').format(type, displayName) :
                            '';
                        }

                        function makeGarrisonTableBodyCell(type) {
                            var count = military.getCount(type);
                            var otherCount = otherMilitary.getCount(type);
                            if (!(count || otherCount)) {
                                return '';
                            }
                            var countDisplay = '';
                            if (count) {
                                countDisplay = IkaTools.Intl.formatInteger(count);
                            }
                            if (otherCount) {
                                countDisplay = '%s (%s)'.format(
                                    countDisplay, IkaTools.Intl.formatInteger(otherCount));
                            }
                            return '<td>%s</td>'.format(countDisplay);
                        }

                        function makeGarrisonTable() {
                            var header = $.map(UNIT_ORDER, function(info) {
                                return $.map(info.units, makeGarrisonTableHeaderCell);
                            }).join('') || '<th>%s</th>'.format(localizer.localize('misc','none'));
                            return ('<table class="target_military_garrison">' +
                                    '<thead><tr>%s</tr></thead>' +
                                    '<tbody><tr>%s</tr></tbody>' +
                                    '<tfoot>' +
                                    '<tr>' +
                                    '<td colspan="100"><img src="/cdn/all/both/layout/icon-status-small.png"/ height="11">%s</td>' +
                                    '</tr>' +
                                    '</tfoot>' +
                                    '</table>').format(
                                header,
                                $.map(UNIT_ORDER, function(info) {
                                    return $.map(info.units, makeGarrisonTableBodyCell);
                                }).join(''),
                                IkaTools.Intl.formatRemainingTime(
                                    IkaTools.View.gameTimeNow() - target.getMilitarySpyTime()));
                        }

                        toolTips.register('EspionageMilitaryReport_%s'.format(target.getId()),
                                          makeGarrisonTable);
                    } else {
                        toolTips.deregister('EspionageMilitaryReport_%s'.format(target.getId()));
                    }

                    var combats = target.getCombats(7 * IkaTools.Constants.Time.MILLIS_PER_DAY);
                    if (combats.length) {
                        function makeCombatsTable() {
                            function makeLootedRow(combat, resource) {
                                var looted = combat.getLooted(resource);
                                if (looted) {
                                    return ('<tr>' +
                                            '<td class="resource_icon">' +
                                            '<img src="/cdn/all/both/resources/icon_%s.png">' +
                                            '</td>' +
                                            '<td class="resource_looted">%s</td>' +
                                            '</tr>').format(
                                        resource,
                                        IkaTools.Intl.formatInteger(looted));
                                } else {
                                    return '';
                                }
                            }

                            function makeCombatRow(combat) {
                                return ('<tr>' +
                                        '<td>' +
                                        '<div class="combat_type_%s"/>' +
                                        '</td>' +
                                        '<td>%s</td>' +
                                        '<td><table class="combat_looted"><tbody>%s%s%s%s%s</tbody></table></td>' +
                                        '</tr>').format(
                                    combat.getType(),
                                    IkaTools.Intl.formatRemainingTime(
                                        IkaTools.View.gameTimeNow() - combat.getTime()),
                                    makeLootedRow(combat, IkaTools.Constants.Resources.WOOD),
                                    makeLootedRow(combat, IkaTools.Constants.Resources.WINE),
                                    makeLootedRow(combat, IkaTools.Constants.Resources.MARBLE),
                                    makeLootedRow(combat, IkaTools.Constants.Resources.GLASS),
                                    makeLootedRow(combat, IkaTools.Constants.Resources.SULFUR));
                            }

                            return ('<table class="espionage_combats">' +
                                    '<thead>' +
                                    '<tr>' +
                                    '<th></th>' +
                                    '<th>%s</th>' +
                                    '<th>%s</th>' +
                                    '</tr>' +
                                    '</thead>' +
                                    '<tbody>' +
                                    '%s' +
                                    '</tbody>' +
                                    '<table>').format(
                                localizer.localize('espionage','time_since'),
                                localizer.localize('espionage','resources_looted'),
                                $.map(combats, makeCombatRow).join(''));
                        }
                        toolTips.register('EspionageMilitaryActions_%s'.format(target.getId()),
                                          makeCombatsTable);
                    } else {
                        toolTips.deregister('EspionageMilitaryActions_%s'.format(target.getId()));
                    }

                    return ('<tr>' +
                            '<td class="city_tradegood"><img src="/cdn/all/both/resources/icon_%s.png"/>%s%s</td>' +
                            '<td class="city_name nowrap">%s</td>' +
                            '<td class="player nowrap">%s</td>' +
                            '<td class="location">%s</td>' +
                            '<td class="actions">%s%s%s%s%s%s</td>' +
                            '<td id="%s" class="travel_time  imperator_tool_tip">%s</td>' +
                            '<td class="townhall_level">%s</td>' +
                            '<td class="wall_level">%s</td>' +
                            '<td id="EspionageLootableResources_%s" class="resources_lootable imperator_tool_tip">%s</td>' +
                            '<td id="EspionageMilitaryActions_%s" class="combats imperator_tool_tip">%s</td>' +
                            '<td id="EspionageMilitaryReport_%s" class="military_score imperator_tool_tip">%s</td>' +
                            '</tr>').format(
                        target.getTradeGoodType(),
                        occupierHtml, blockaderHtml, cityLinkHtml,
                        playerLinkHtml,
                        islandLinkHtml,
                        spyActionLinkHtml, pillageLinkHtml, blockadeLinkHtml, occupyLinkHtml, sendSpyLinkHtml, removeTargetHtml,
                        travelTimeUpdateable.getId(0),
                        IkaTools.Intl.formatRemainingTime(
                            IkaTools.EmpireData.calculateTravelTime(
                                IkaTools.View.getCurrentCity().getIslandCoordinates(), target.getIslandCoordinates(), null, 1),
                            false, 3),
                        IkaTools.Intl.formatInteger(target.getTownLevel()),
                        IkaTools.Intl.formatInteger(target.getWallLevel()),
                        target.getId(),
                        // v2.31 : un joueur en vacances ne peut pas être pillé
                        (player && player.getState() == IkaTools.Constants.PlayerState.VACATION ?
                         localizer.localize('espionage', 'on_vacation') :
                         IkaTools.Intl.formatInteger(Math.ceil(
                            lootableResources / IkaTools.Constants.GamePlay.RESOURCES_PER_TRANSPORT))),
                        target.getId(), combats.length ? IkaTools.Intl.formatInteger(combats.length) : '-',
                        target.getId(), IkaTools.Intl.formatInteger(player.getMilitaryScore()));
                }

                function makeTableHead() {
                    toolTips.registerSimple('EspionageLocationHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','location')));
                    toolTips.registerSimple('EspionageTravelTimeHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','travel_time')));
                    toolTips.registerSimple('EspionageTownHallLevelHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','townhall_level')));
                    toolTips.registerSimple('EspionageWallLevelHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','wall_level')));
                    toolTips.registerSimple('EspionageResourcesLootableHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','resources_lootable')));
                    toolTips.registerSimple('EspionageCombatsHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','combats')));
                    toolTips.registerSimple('EspionageMilitaryScoreHeader',
                                            '<div class="nowrap">%s</div>'.format(
                        localizer.localize('espionage','military_score')));
                    return ('<thead>' +
                            '<tr>' +
                            '%s' +
                            '<th colspan="1" id="EspionagePlayerHeader" ' +
                            'class="player imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageLocationHeader" ' +
                            'class="location imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageActionsHeader" ' +
                            'class="actions imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageTravelTimeHeader" ' +
                            'class="travel_time imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageTownHallLevelHeader" ' +
                            'class="townhall_level imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageWallLevelHeader" ' +
                            'class="wall_level imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageResourcesLootableHeader" ' +
                            'class="resources_lootable imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageCombatsHeader" ' +
                            'class="combats imperator_tool_tip">%s</th>' +
                            '<th colspan="1" id="EspionageMilitaryScoreHeader" ' +
                            'class="military_score imperator_tool_tip">%s</th>' +
                            '</tr>' +
                            '</thead>').format(
                        makeCityNameHeaderCells(),
                        localizer.localize('espionage','player'),
                        localizer.localize('espionage','location'),
                        localizer.localize('misc','actions'),
                        localizer.localize('espionage','travel_time'),
                        localizer.localize('espionage','townhall_level'),
                        localizer.localize('espionage','wall_level'),
                        localizer.localize('espionage','resources_lootable'),
                        localizer.localize('espionage','combats'),
                        localizer.localize('espionage','military_score'));
                }
                var targets = IkaTools.EmpireData.Espionage.getTargets();

                // v3.11 : colonnes déclarées, pour les traits entre colonnes (comme les autres onglets)
                function makeCols() {
                    return makeCityNameColGroup() +
                        '<colgroup class="espionage">' +
                        '<col class="player"/><col class="location"/><col class="actions"/>' +
                        '<col class="travel_time"/><col class="townhall_level"/><col class="wall_level"/>' +
                        '<col class="resources_lootable"/><col class="combats"/><col class="military_score"/>' +
                        '</colgroup>';
                }

                return '%s%s<tbody>%s</tbody>'.format(
                    makeCols(),
                    makeTableHead(),
                    $.map(targets, renderTarget).join(''));
            }

            var tab = new Tab('espionage', localizer.localize('misc','espionage'), $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewEspionageTable"/>' +
                '</div>'),
                              'ImperatorOverviewEspionageTable',
                              function() {
                IkaTools.EmpireData.Espionage.registerEspionageChangedHandler(function(changes) {
                    tab.maybeRedraw(true);
                });
            },
                              makeTableContent);

            return tab.getTab();
        }
        function makeChantiersTab(){
            __impInjectChantiersCSS();
            __impInitChantiersDelegation();
            __impInitTransportReopen();

            function renderLines(lines){
                var cells = lines.map(function(l){
                    var ecart = l.deficit>0 ? '<div class="imp-ch-def gr">-'+__impFmt(l.deficit)+'</div>'
                                            : '<div class="imp-ch-okmark gr">\u2713</div>';
                    var incCell = (l.incoming>0) ? '<div class="gc gr imp-ch-inc">+'+__impFmt(l.incoming)+'</div>'
                                                 : '<div class="gc gr gm">\u2014</div>';
                    return '<div class="gc">'+__impEsc(l.label)+'</div>'+
                           '<div class="gc gr">'+__impFmt(l.need)+'</div>'+
                           '<div class="gc gr gm">'+__impFmt(l.stock)+'</div>'+
                           incCell + ecart;
                }).join('');
                return '<div class="imp-ch-grid imp-ch-grid5">'+
                       '<div class="gh">Ressource</div><div class="gh gr">Besoin</div><div class="gh gr">Stock</div><div class="gh gr">En route</div><div class="gh gr">\u00c9cart</div>'+
                       cells + '</div>';
            }

            function renderRoutage(r, b){
                var R = IkaTools.Constants.Resources;
                var order=[R.WOOD,R.WINE,R.MARBLE,R.GLASS,R.SULFUR], labels={};
                labels[R.WOOD]='Bois'; labels[R.WINE]='Vin'; labels[R.MARBLE]='Marbre'; labels[R.GLASS]='Cristal'; labels[R.SULFUR]='Soufre';
                var incByRes=(b && b.incomingByRes)?b.incomingByRes:{};
                var html='<div class="imp-ch-rt"><div class="imp-ch-rt-h">ROUTAGE</div>', shown=false;
                order.forEach(function(key){
                    var sent=incByRes[key]||[], todo=r.byResource[key];
                    if (!sent.length && !todo) return;
                    shown=true;
                    var head='<span class="r">'+__impEsc(labels[key])+'</span>';
                    if (todo){
                        var loaded=todo.envois.reduce(function(s,e){return s+e.quantity;},0);
                        head+=' \u00b7 reste '+__impFmt(todo.deficit)+(loaded?(' \u2192 '+__impFmt(loaded)+' charg\u00e9s'):'');
                    } else { head+=' \u00b7 <span class="imp-ch-sent">tout envoy\u00e9</span>'; }
                    html+='<div class="imp-ch-rt-res">'+head+'</div>';
                    sent.forEach(function(e){
                        var arrTxt=''; try{ if(e.arrival!=null){ var m=Math.max(0,Math.round((e.arrival-IkaTools.View.gameTimeNow())/60000)); arrTxt=' \u00b7 arrive dans '+__impFmtDur(m); } }catch(x){}
                        html+='<div class="imp-ch-rt-env imp-ch-sent-line"><span class="imp-ch-sent">\u2713 envoy\u00e9</span> <span class="q">'+__impFmt(e.qty)+'</span> depuis '+__impEsc(e.fromName)+'<span class="meta">'+arrTxt+'</span></div>';
                    });
                    if (todo){
                        todo.envois.forEach(function(e){
                            var distTxt=(e._dist<0.5)?'m\u00eame \u00eele':(Math.round(e._dist*10)/10+' \u00eeles');
                            var src=__impFindCity(e.fromCityId), active=false;
                            try{ active=src && IkaTools.View.isActiveCity(src); }catch(x){}
                            var am=__impAge(src);
                            var ageMeta=(am!=null)?(' <span class="'+((am>__IMP_STALE_MIN)?'imp-ch-stale':'imp-ch-age')+'">\u00b7 '+__impAgeTxt(am)+'</span>'):'';
                            var action=active
                              ? '<a class="imperator_link imp-ch-prep" href="javascript:void(0)" data-from="'+e.fromCityId+'" data-to="'+e.toCityId+'" data-res="'+e.resource+'" data-qty="'+e.quantity+'" data-ships="'+e._shipsFast+'" data-fleet="fast">Pr\u00e9parer</a>'
                              : '<a class="imperator_link imp-ch-goto" href="javascript:void(0)" data-from="'+e.fromCityId+'">Aller \u00e0 '+__impEsc(e._fromName)+'</a>';
                            html+='<div class="imp-ch-rt-env">\u2192 <span class="q">'+__impFmt(e.quantity)+'</span> depuis '+__impEsc(e._fromName)+' <span class="meta">('+e._shipsFast+' nav., '+distTxt+')</span>'+ageMeta+' '+action+'</div>';
                        });
                        if (!todo.covered){
                            if (key===R.WINE && todo.envois.length===0) html+='<div class="imp-ch-rt-warn">Aucune ville de vin avec surplus disponible.</div>';
                            else html+='<div class="imp-ch-rt-warn">Surplus insuffisant pour couvrir le d\u00e9ficit.</div>';
                        }
                    }
                });
                html+='</div>';
                return shown?html:'';
            }

            function renderFlotte(fl){
                var h='<div class="imp-ch-fl"><div class="imp-ch-fl-h">FLOTTE &amp; MAKESPAN (estimation)</div>';
                fl.materials.forEach(function(m){
                    if (m.fleet==='mixte'){
                        h+='<div class="imp-ch-fl-line"><b>'+__impEsc(m.label)+'</b> : mixte \u00b7 '+m.cargoShips+' charge + '+m.fast.totalShips+' rapides \u00b7 ~'+__impFmtDur(m.makespanMin)+
                           ' <span style="color:#3E7D2A">(gain '+__impFmtDur(m.gain)+' vs rapide seul)</span></div>';
                    } else {
                        h+='<div class="imp-ch-fl-line"><b>'+__impEsc(m.label)+'</b> : rapide \u00b7 '+m.fast.totalShips+' nav.'+
                           (m.fast.fits?'':' <span class="imp-ch-fl-warn">('+m.fast.rotations+' rotations)</span>')+' \u00b7 ~'+__impFmtDur(m.makespanMin)+'</div>';
                    }
                    if (!m.covered) h+='<div class="imp-ch-fl-src imp-ch-fl-warn">surplus insuffisant (navires pleins) pour couvrir enti\u00e8rement</div>';
                });
                h+='<div class="imp-ch-fl-line imp-ch-fl-ms">Makespan du chantier : ~'+__impFmtDur(fl.chantierMakespanMin)+' <span style="opacity:.6;font-weight:400">(le plus long des flux \u00b7 trajet de base, hors r\u00e9ductions)</span></div>';
                h+='<div class="imp-ch-fl-line" style="opacity:.8">Flotte libre : '+fl.F+' rapides \u00b7 '+fl.C+' navires de charge</div>';
                h+='</div>';
                return h;
            }

            function renderRow(c){
                var __comp = __impCompletion(c);
                if (__comp.state==='building'){
                    var bb=__impComputeBilan(c);
                    var t=(bb && bb.ok && bb.name)?__impEsc(bb.name):('B\u00e2timent \u00b7 empl. '+__impEsc(c.position));
                    var ct=(bb && bb.ok && bb.cityName)?__impEsc(bb.cityName):('Cit\u00e9 '+__impEsc(c.cityId));
                    return '<div class="imp-ch-row"><div class="imp-ch-main">'+
                             '<div class="imp-ch-t">'+t+'</div>'+
                             '<div class="imp-ch-c">'+ct+' \u00b7 niveau '+__comp.level+' \u2192 '+__comp.target+'</div>'+
                             '<div class="imp-ch-foot2"><span class="imp-ch-sent">Am\u00e9lioration lanc\u00e9e</span> \u2014 en construction. Le chantier se clora \u00e0 la fin des travaux.</div>'+
                           '</div><div class="imp-ch-side">'+
                             '<span class="imp-ch-badge imp-ch-badge-ok">En construction</span>'+
                             '<a class="imperator_link imp-ch-del" href="javascript:void(0)" data-id="'+__impEsc(c.id)+'">Archiver</a>'+
                           '</div></div>';
                }
                var b = __impComputeBilan(c);
                var title = (b && b.ok && b.name) ? __impEsc(b.name) : ('B\u00e2timent \u00b7 empl. ' + __impEsc(c.position));
                var lvlTxt = (b && b.ok) ? ('niveau '+b.currentLevel+' \u2192 '+b.targetLevel) : ('niveau vis\u00e9 '+__impEsc(c.level));
                var cityTxt = (b && b.ok && b.cityName) ? __impEsc(b.cityName) : ('Cit\u00e9 '+__impEsc(c.cityId));
                var ageM = (b && b.ok) ? b.ageMin : null;
                var ageTxt = (ageM!=null) ? (' \u00b7 <span class="'+((ageM>__IMP_STALE_MIN)?'imp-ch-stale':'imp-ch-age')+'">donn\u00e9es '+__impAgeTxt(ageM)+'</span>') : '';
                var sub = cityTxt + ' \u00b7 ' + lvlTxt + ageTxt;
                var badge, breakdown='', footer, routage='';
                var hasIncoming=false;
                if (b && b.ok && b.incomingByRes){ for (var _k in b.incomingByRes){ if (b.incomingByRes[_k] && b.incomingByRes[_k].length){ hasIncoming=true; break; } } }

                if (b.error){
                    badge='<span class="imp-ch-badge imp-ch-badge-err">donn\u00e9es indispo.</span>';
                    footer='<div class="imp-ch-foot2">Lecture impossible ('+__impEsc(b.error)+') \u2014 rouvre l\u2019aper\u00e7u depuis Buildings.</div>';
                } else if (b.total===0 && !hasIncoming){
                    badge='<span class="imp-ch-badge imp-ch-badge-ok">Couvert localement</span>';
                    breakdown=renderLines(b.lines);
                    footer='<div class="imp-ch-foot2">Tout est en stock \u2014 pr\u00eat \u00e0 construire.'+(b.estimation?' <span style="opacity:.7">(co\u00fbt estim\u00e9)</span>':'')+'</div>';
                } else {
                    breakdown=renderLines(b.lines);
                    var r = __impComputeRoutage(c, b);
                    if (b.total>0){
                        badge='<span class="imp-ch-badge">D\u00e9ficit '+__impFmt(b.total)+'</span>';
                        routage = renderRoutage(r, b) + renderFlotte(__impComputeFlotte(c, b));
                        footer='<div class="imp-ch-foot2">Reste \u00e0 envoyer : '+__impFmt(b.total)+' unit\u00e9s'+(b.estimation?' <span style="opacity:.7">(co\u00fbt estim\u00e9)</span>':'')+'</div>';
                    } else {
                        badge='<span class="imp-ch-badge imp-ch-badge-ok">Tout envoy\u00e9</span>';
                        routage = renderRoutage(r, b);
                        footer='<div class="imp-ch-foot2">Tout est parti \u2014 en attente d\u2019arriv\u00e9e.</div>';
                    }
                }
                return '<div class="imp-ch-row"><div class="imp-ch-main">'+
                         '<div class="imp-ch-t">'+title+'</div><div class="imp-ch-c">'+sub+'</div>'+
                         breakdown + routage + footer +
                       '</div><div class="imp-ch-side">'+badge+
                         '<a class="imperator_link imp-ch-del" href="javascript:void(0)" data-id="'+__impEsc(c.id)+'">Retirer</a>'+
                       '</div></div>';
            }

            function makeTableContent(){
                var list = window.ImperatorChantiers || [];
                (function(){ var kept=[], pruned=false; list.forEach(function(c){ if(__impCompletion(c).state==='done') pruned=true; else kept.push(c); }); if(pruned){ window.ImperatorChantiers=kept; if(window.__impSaveChantiers) window.__impSaveChantiers(); list=kept; } })();
                var header = '<div class="imp-ch-head">Chantiers <span class="imp-ch-count">'+list.length+'</span>'+
                             '<span class="imp-ch-refresh-wrap"><span class="imp-ch-fresh">ressources rafra\u00eechies \u00e0 chaque visite de ville \u00b7 fra\u00eecheur indiqu\u00e9e par source</span></span></div>';
                var body;
                if (!list.length){
                    body='<div class="imp-ch-empty">Aucun chantier.<br>Survole un b\u00e2timent dans l\u2019onglet <b>Buildings</b> et clique <b>Planifier</b>.</div>';
                } else {
                    body='<div class="imp-ch-list">'+list.map(renderRow).join('')+'</div>'+
                         '<div class="imp-ch-foot">Moteur + ex\u00e9cution (2 temps) \u00b7 le clic pr\u00e9-remplit le transport, l\u2019envoi reste manuel.</div>';
                }
                return '<tbody><tr><td><div class="imp-ch-wrap">'+header+__impProtectedPanel()+body+'</div></td></tr></tbody>';
            }

            var tab = new Tab('chantiers', 'Chantiers', $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewChantiersTable"/>' +
                '</div>'),
                'ImperatorOverviewChantiersTable',
                function(){ window.__impChantiersRedraw = function(){ tab.maybeRedraw(true); }; },
                makeTableContent);

            return tab.getTab();
        }
        function __impWineGroups(){
            var R=IkaTools.Constants.Resources, cities=[];
            try{ cities=IkaTools.EmpireData.getOwnCities(); }catch(e){}
            var groups=[], others=[];
            cities.forEach(function(c){
                var isWine=false; try{ isWine=(c.getTradeGoodType && c.getTradeGoodType()===R.WINE); }catch(e){}
                if (isWine) groups.push({source:c, members:[]}); else others.push(c);
            });
            if (!groups.length) return [];
            others.forEach(function(c){
                var best=null, bd=Infinity, cc=null; try{ cc=c.getIslandCoordinates(); }catch(e){}
                groups.forEach(function(g){ var d=__impDist(cc, g.source.getIslandCoordinates()); if(d<bd){ bd=d; best=g; } });
                if (best) best.members.push(c);
            });
            return groups;
        }

        function __impWinePlan(g){
            var R=IkaTools.Constants.Resources, CAP=__IMP_CAP_FAST;
            var srcWine=0; try{ var rr=g.source.getResource(R.WINE); srcWine=(rr&&rr.getCurrent)?Math.floor(rr.getCurrent()):0; }catch(e){}
            var availShips=Math.max(0, Math.floor((srcWine-__IMP_WINE_SRC_FLOOR)/CAP));
            var TRIGGER=__impWineTrigger();
            var rows=g.members.map(function(c){
                var wine=0; try{ var r=c.getResource(R.WINE); wine=(r&&r.getCurrent)?Math.floor(r.getCurrent()):0; }catch(e){}
                var needs=(wine<TRIGGER);
                return { city:c, wine:wine, needs:needs, deficit:needs?Math.max(0,__IMP_WINE_TARGET-wine):0, envoiQty:0, envoiShips:0, shortfall:false };
            });
            rows.filter(function(x){return x.needs && x.deficit>0;})
                .sort(function(a,b){return b.deficit-a.deficit;})
                .forEach(function(x){
                    var need=Math.ceil(x.deficit/CAP), take=Math.min(need, availShips);
                    if (take>0){ x.envoiShips=take; x.envoiQty=take*CAP; availShips-=take; }
                    x.shortfall=(take<need);
                });
            return { source:g.source, srcWine:srcWine, distributable:Math.max(0,srcWine-__IMP_WINE_SRC_FLOOR), rows:rows };
        }

        function makeBoissonsTab(){
            __impInjectChantiersCSS();
            __impInitChantiersDelegation();
            __impInitTransportReopen();

            function memberRow(g, x){
                var name=(x.city.getName?x.city.getName():String(x.city.getId()));
                var age=__impAge(x.city);
                var ageTxt=(age!=null)?(' <span class="'+((age>__IMP_STALE_MIN)?'imp-ch-stale':'imp-ch-age')+'">\u00b7 '+__impAgeTxt(age)+'</span>'):'';
                if (x.wine>=__IMP_WINE_TARGET){
                    return '<div class="imp-boisson-mrow"><span class="bnm">'+__impEsc(name)+'</span><span class="blvl">'+__impFmt(x.wine)+' vin</span><span class="imp-ch-sent">\u2713 \u00e0 niveau</span>'+ageTxt+'</div>';
                }
                if (!x.needs){
                    return '<div class="imp-boisson-mrow"><span class="bnm">'+__impEsc(name)+'</span><span class="blvl">'+__impFmt(x.wine)+' vin</span><span class="imp-ch-age">au-dessus du seuil</span>'+ageTxt+'</div>';
                }
                var src=g.source, srcName=(src.getName?src.getName():String(src.getId())), active=false;
                try{ active=IkaTools.View.isActiveCity(src); }catch(e){}
                var action='';
                if (x.envoiShips>0){
                    action = active
                      ? '<a class="imperator_link imp-ch-prep" href="javascript:void(0)" data-from="'+src.getId()+'" data-to="'+x.city.getId()+'" data-res="wine" data-qty="'+x.envoiQty+'" data-ships="'+x.envoiShips+'" data-fleet="fast" data-reopen="boissons">Pr\u00e9parer</a>'
                      : '<a class="imperator_link imp-ch-goto" href="javascript:void(0)" data-from="'+src.getId()+'" data-reopen="boissons">Aller \u00e0 '+__impEsc(srcName)+'</a>';
                }
                var envoiTxt = (x.envoiShips>0)
                    ? ('<span class="benv">\u2192 '+__impFmt(x.envoiQty)+' ('+x.envoiShips+' nav.)'+(x.shortfall?' <span class="imp-ch-rt-warn">partiel</span>':'')+'</span>')
                    : '<span class="imp-ch-rt-warn">source insuffisante (plancher 50 000)</span>';
                return '<div class="imp-boisson-mrow def"><span class="bnm">'+__impEsc(name)+'</span><span class="blvl">'+__impFmt(x.wine)+' vin</span><span class="imp-ch-def">d\u00e9ficit '+__impFmt(x.deficit)+'</span>'+envoiTxt+ageTxt+' '+action+'</div>';
            }

            function renderGroup(g){
                var plan=__impWinePlan(g);
                var srcName=(g.source.getName?g.source.getName():String(g.source.getId()));
                var nbDef=plan.rows.filter(function(x){return x.deficit>0;}).length;
                return '<div class="imp-boisson-group">'+
                         '<div class="imp-ch-t">Groupe \u00b7 '+__impEsc(srcName)+'</div>'+
                         '<div class="imp-ch-c">'+__impEsc(srcName)+' : '+__impFmt(plan.srcWine)+' vin \u00b7 distribuable '+__impFmt(plan.distributable)+' \u00b7 '+(nbDef?(nbDef+' \u00e0 ravitailler'):'tout \u00e0 niveau')+'</div>'+
                         '<div class="imp-boisson-members">'+plan.rows.map(function(x){return memberRow(g,x);}).join('')+'</div>'+
                       '</div>';
            }

            function makeContent(){
                var groups=__impWineGroups();
                var body = groups.length ? groups.map(renderGroup).join('')
                    : '<div class="imp-ch-empty">Aucune ville productrice de vin d\u00e9tect\u00e9e.</div>';
                return '<tbody><tr><td><div class="imp-ch-wrap">'+
                       '<div class="imp-ch-head">Service de boissons'+
                         '<span class="imp-boisson-cfg">Seuil de r\u00e9appro : <input type="number" class="imp-boisson-trigger" value="'+__impWineTrigger()+'" min="0" max="'+__IMP_WINE_TARGET+'" step="1000"> vin <span class="imp-ch-age">(r\u00e9appro si en-dessous \u00b7 remplissage \u00e0 '+__impFmt(__IMP_WINE_TARGET)+')</span></span>'+
                       '</div>'+
                       body+
                       '<div class="imp-ch-foot">Cible '+__impFmt(__IMP_WINE_TARGET)+' vin/ville \u00b7 les sources gardent '+__impFmt(__IMP_WINE_SRC_FLOOR)+' \u00b7 navires pleins (580). Une visite \u00e0 la ville de vin = tu prépares tous ses envois d\u2019affilée.</div>'+
                       '</div></td></tr></tbody>';
            }

            var tab = new Tab('boissons', 'Service de boissons', $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewBoissonsTable"/>' +
                '</div>'),
                'ImperatorOverviewBoissonsTable',
                function(){
                    window.__impBoissonsRedraw = function(){ tab.maybeRedraw(true); };
                    try{ IkaTools.EmpireData.registerResourcesChangedHandler(function(){
                        var ae=document.activeElement;
                        if (ae && ae.classList && ae.classList.contains('imp-boisson-trigger')) return; // pas de redraw pendant l'\u00e9dition du seuil
                        tab.maybeRedraw(true);
                    }); }catch(e){}
                },
                makeContent);
            return tab.getTab();
        }
        /* ===== FIN Service de boissons ===== */

              //////////////////////////////////////
        /* ===== FIN Onglet Chantiers ===== */
        //////////////////////////////////////



        var makePopup = IkaTools.Utils.thunk(function makePopup() {
            var resourceTab = makeResourceTab();
            var buildingsTab = makeBuildingsTab();
            var militaryTab = makeMilitaryTab();
            var espionageTab = makeEspionageTab();
            var dashboardTab = makeDashboardTab();
            var chantiersTab = makeChantiersTab();
            var boissonsTab = makeBoissonsTab();

            var tabPane = new IkaTools.UI.TabPane(
                [resourceTab, buildingsTab, militaryTab, espionageTab, dashboardTab, chantiersTab, boissonsTab],
                {
                    tabActivatedCallback: function() {
                        IkaTools.UI.resizePopup();
                    },
                });


            function resizeImperatorWindow() {
                setTimeout(function() {
                    var $box = $('#cityBuildings');
                    $box.css({
                        'width': 'auto',
                        'min-width': '1150px',
                        'max-width': '98vw',
                        'background-size': '100% 100%'
                    });
                    $box.find('.mainContent, .minimizableContent, .hd, .ft').css({
                        'width': 'auto',
                        'min-width': '1150px',
                        'background-size': '100% 100%'
                    });
                    $box.find('.bd').css({
                        'width': 'auto',
                        'min-width': '1150px',
                    });
                }, 100);
            }

            var popup = new IkaTools.UI.PopupWindow(
                'cityBuildings',
                $('<div>Imperator Overview</div>'),
                tabPane.getContainer(),
                { oversized:true,
                 deactivatedCallback: function() {
                     resourceTab.deactivated();
                     buildingsTab.deactivated();
                     militaryTab.deactivated();
                     espionageTab.deactivated();
                 },
                }
            );


              window.ImperatorOpenChantiers = function () {
                popup.display(true);
                chantiersTab.activate();
                if (window.__impChantiersRedraw) window.__impChantiersRedraw();
                resizeImperatorWindow();
            };


              window.ImperatorOpenBoissons = function () {
                popup.display(true);
                boissonsTab.activate();
                if (window.__impBoissonsRedraw) window.__impBoissonsRedraw();
                resizeImperatorWindow();
            };


            function displayResources() {
                popup.display(true);
                resourceTab.activate();
                resizeImperatorWindow();
            }
            function displayBuildings() {
                popup.display(true);
                buildingsTab.activate();
                resizeImperatorWindow();
            }
            function displayMilitary() {
                popup.display(true);
                militaryTab.activate();
                resizeImperatorWindow();
            }
            function displayEspionage() {
                popup.display(true);
                espionageTab.activate();
                resizeImperatorWindow();
            }

            IkaTools.View.registerIkariamAjaxResponseCallback(
                function resetReopenTabVars(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response,
                                                              function lookForChangeView(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                            var view = data[0];
                            if (view == IkaTools.Constants.View.CITY_DETAIL) {
                                if (openResourcesTabOnTransportClose) {
                                    popup.display(true);
                                    resourceTab.activate();
                                }
                                if (openBuildingsTabOnTransportClose) {
                                    popup.display(true);
                                    buildingsTab.activate();
                                }
                                if (openMilitaryTabOnDeploymentClose) {
                                    popup.display(true);
                                    militaryTab.activate();
                                }
                            }
                            if (view != IkaTools.Constants.View.TRANSPORT) {
                                openResourcesTabOnTransportClose = false;
                                openBuildingsTabOnTransportClose = false;
                            }
                            if (view != IkaTools.Constants.View.DEPLOY) {
                                openMilitaryTabOnDeploymentClose = false;
                            }
                        }
                    });
                });

            return {
                displayResources: displayResources,
                displayBuildings: displayBuildings,
                displayMilitary: displayMilitary,
                displayEspionage: displayEspionage,
                close: popup.close.bind(popup),
            };
        });


        //PARTIE OPTIMISEE

        _impPopupProvider = makePopup; // v2.41

        const menuImageUrl = '/cdn/all/both/friends/citymenu.png';

        function createMenuItem(imagePositionY, localizationKey) {
            return $(`
    <li>
      <div class="image" style="background: url(${menuImageUrl}) no-repeat 0 ${imagePositionY}px;"></div>
      <div class="name"><span class="namebox">${localizer.localize('misc', localizationKey)}</span></div>
    </li>
  `);
        }

        var leftMenuResourceContent = createMenuItem(-204, 'resource_overview');
        var leftMenuBuildingsContent = createMenuItem(-134, 'buildings_overview');
        var leftMenuArmyContent = createMenuItem(0, 'military_overview');
        var leftMenuEspionageContent = createMenuItem(-71, 'espionage_overview');

        // v3.1 : entrée « Alertes » (historique), toujours présente, avec le nombre de non lues.
        impAlertHistoryStyles();
        var leftMenuAlertsContent = $(`
    <li>
      <div class="image imp_ah_bell">🔔<span class="imp_ah_badge" style="display:none"></span></div>
      <div class="name"><span class="namebox">${localizer.localize('misc', 'alert_history')}</span></div>
    </li>
  `);
        function refreshAlertBadge() {
            var n = impAlertHistoryUnread();
            leftMenuAlertsContent.find('.imp_ah_badge').text(n > 9 ? '9+' : String(n)).toggle(n > 0);
        }
        impAlertHistoryOnChange(refreshAlertBadge);
        refreshAlertBadge();
        setInterval(refreshAlertBadge, 60000);   // alertes venues d'un autre onglet du jeu
        leftMenuAlertsContent.mouseenter(refreshAlertBadge);
        leftMenuAlertsContent.mousedown(function() { impAlertHistoryShow(); });


        const menuConfigurations = [
            { condition: showResourceOverview.isEnabled(), content: leftMenuResourceContent },
            { condition: showBuildingsOverview.isEnabled(), content: leftMenuBuildingsContent },
            { condition: showMilitaryOverview.isEnabled(), content: leftMenuArmyContent },
            { condition: showEspionageOverview.isEnabled(), content: leftMenuEspionageContent }
        ];

        const menuItems = menuConfigurations
        .filter(config => config.condition)
        .map(config => new IkaTools.UI.LeftMenu.Item(config.content))
        .concat([new IkaTools.UI.LeftMenu.Item(leftMenuAlertsContent)]);   // v3.1

        // FIN PARTIE OPTIMISEE


        var leftMenu = new IkaTools.UI.LeftMenu(menuItems, { atTop: true });
        leftMenu.display();

        return function overviewReady() {

            if (showResourceOverview.isEnabled()) {
                leftMenuResourceContent.mousedown(IkaTools.Logging.debuggable(
                    { label: 'Imperator.overview.showResourceTable.mousedown',
                     alwaysTime: true, profile: true },
                    function() {
                        makePopup().displayResources();
                    }));
            }
            if (showBuildingsOverview.isEnabled()) {
                leftMenuBuildingsContent.mousedown(IkaTools.Logging.debuggable(
                    { label: 'Imperator.overview.showBuildingsTable.mousedown',
                     alwaysTime: true, profile: true },
                    function() {
                        makePopup().displayBuildings();
                    }));
            }
            if (showMilitaryOverview.isEnabled()) {
                leftMenuArmyContent.mousedown(IkaTools.Logging.debuggable(
                    { label: 'Imperator.overview.showMilitaryTable.mousedown',
                     alwaysTime: true, profile: true },
                    function() {
                        makePopup().displayMilitary();
                    }));
            }
            if (showEspionageOverview.isEnabled()) {
                IkaTools.EmpireData.Espionage.startTracking();
                leftMenuEspionageContent.mousedown(IkaTools.Logging.debuggable(
                    { label: 'Imperator.overview.showEspionageTable.mousedown',
                     alwaysTime: true, profile: true},
                    function() {
                        makePopup().displayEspionage();
                    }));
            }
        };
    }

    function registerLoggingEventHandlers() {
        IkaTools.EmpireData.registerResourcesChangedHandler(function(changes) {
            IkaTools.Logging.debug('Resources changed: ', changes);
        });
        IkaTools.EmpireData.registerBuildingsChangedHandler(function(changes) {
            IkaTools.Logging.debug('Buildings changed: ', changes);
        });
        IkaTools.EmpireData.registerMilitaryChangedHandler(function(changes) {
            IkaTools.Logging.debug('Military changed: ', changes);
        });
        IkaTools.EmpireData.registerCivilizationDataChangedHandler(function(changes) {
            IkaTools.Logging.debug('CivilizationData changed: ', changes);
        });
        IkaTools.EmpireData.registerMovementsChangedHandler(function(changes) {
            IkaTools.Logging.debug('Movements changed: ', changes);
        });
        IkaTools.EmpireData.Espionage.registerEspionageChangedHandler(function(changes) {
            IkaTools.Logging.debug('Espionage changed: ', changes);
        });
    }

    function fireFakeKeyboardEvent(input) {
        // fake event so Ikariam handlers update related sliders and stuff
        var e = document.createEvent("KeyboardEvent");
        if (e.initKeyboardEvent) {
            e.initKeyboardEvent(
                'keyup', true, true, window, false, false, false, false, 13, 0);
        } else {
            e.initKeyEvent('keyup', true, true, window, false, false, false, false, 13, 0);
        }
        input.dispatchEvent(e);
    }

    function initQuickGoodsButtons() {
        function createButton(input, textName, increment) {
            var button = $('<a class="button" title="%s">%s</a>'.format(
                localizer.localize('tweaks',textName + '_text'),
                localizer.localize('tweaks',textName)));
            button.click(IkaTools.Logging.debuggable(
                'Imperator.quickGoodsSelectIncrement[' + increment + ']',
                function incrementSelectedGoods() {
                    var current = parseInt(input.val()) || 0;
                    var newValue =
                        Math.ceil((current + (increment > 0 ? 1 : -1)) / increment) * increment;
                    input.val(newValue);
                    fireFakeKeyboardEvent(input.get(0));
                }));
            return button;
        }

        function addChangeGoodsButtons(input) {
            var span = $('<span class="quick_goods_select"/>');
            var minus500Button = createButton(input, 'transport_minus_500', -500);
            var plus500Button = createButton(input, 'transport_plus_500', 500);
            var plus1000Button = createButton(input, 'transport_plus_1000', 1000);
            var plus5000Button = createButton(input, 'transport_plus_5000', 5000);
            span.append(minus500Button, plus500Button, plus1000Button, plus5000Button);

            input.after(span);
        }

        var stylesToAdd =
            '.quick_goods_select a, .quick_goods_select a:active {' +
            'margin: 3px; padding: 1px 3px; font-size: 10px; font-weight:normal;' +
            '}' +
            '#transport .quick_goods_select {' +
            'position: absolute;' +
            'top: 6px;' +
            'left: 468px;' +
            '}' +
            '.quick_goods_select {' +
            '-webkit-user-select: none;' +
            '-khtml-user-select: none;' +
            '-moz-user-select: none;' +
            '-o-user-select: none;' +
            'user-select: none;' +
            '}';

        if (transportButtons.isEnabled()) {
            stylesToAdd +=
                '#mission ul.resourceAssign { width: 640px; }' +
                '#mission .resourceAssign li { padding:0px; background-position:0 center;}' +
                '#mission .resourceAssign .sliderinput { margin:0 0 0 30px; width:400px;}' +
                '#mission .resourceAssign input.textfield {' +
                'position:relative;top:-26px;margin-left:-5px;' +
                '}';

            IkaTools.View.registerIkariamAjaxResponseCallback(
                function addTransportButtons(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response,
                                                              function lookForChangeView(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                            var view = data[0];
                            if (view == IkaTools.Constants.View.TRANSPORT ||
                                view == IkaTools.Constants.View.COLONIZE) {
                                $('#transportForm ul.resourceAssign li input').each(
                                    function(index, node) {
                                        addChangeGoodsButtons($(node));
                                    });
                            } else if (view == IkaTools.Constants.View.TAKE_OFFER) {
                                $('#transportForm td.input input').each(
                                    function(index, node) {
                                        addChangeGoodsButtons($(node));
                                    });
                            } else if (view == IkaTools.Constants.View.BRANCH_OFFICE) {
                                $('#branchOffice form[name=formkontor] tr input').filter(':even').each(
                                    function(index, node) {
                                        addChangeGoodsButtons($(node));
                                    });
                            } else if (view == IkaTools.Constants.View.BLACK_MARKET) {
                                $('#blackMarket form[name=formkontor] tr input').filter(':even').each(
                                    function(index, node) {
                                        addChangeGoodsButtons($(node));
                                    });
                            }
                        }
                    });
                }, true);
        }

        if (donationButtons.isEnabled()) {
            stylesToAdd +=
                '#donateForm input.textfield {' +
                'margin-bottom: 6px;' +
                '}';
            IkaTools.View.registerIkariamAjaxResponseCallback(
                function addTransportButtons(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response,
                                                              function lookForChangeView(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                            var view = data[0];
                            if (view == IkaTools.Constants.View.RESOURCE ||
                                view == IkaTools.Constants.View.TRADE_GOOD ) {
                                var input = $('#donateForm input.textfield');

                                var span = $('<span class="quick_goods_select"/>');
                                var plus1kButton = createButton(input, 'donate_plus_1000', 1000);
                                var plus10kButton = createButton(input, 'donate_plus_10000', 10000);
                                var plus100kButton = createButton(input, 'donate_plus_100000', 100000);
                                span.append(plus1kButton, plus10kButton, plus100kButton);

                                input.after(span);
                            }
                        }
                    });
                }, true);
        }

        return stylesToAdd;
    }

    function initBuildingDemolitionHandler() {
        var activeDemolitionInfo = null;

        IkaTools.View.registerIkariamAjaxResponseCallback(
            IkaTools.Utils.forEachIkariamAjaxResponseFunction(
                function demolitionHandler(index, name, value) {
                    if (name == IkaTools.Constants.IkariamAjaxResponseType.ADD_WINDOW &&
                        value[0] == 'buildings_demolition') {
                        var demolitionButton = $('#buildings_demolition a.button');
                        var hrefMatch = demolitionButton.attr('href').match(
                            /function=demolishBuilding&level=(\d+)&cityId=(\d+)&position=(\d+)/);
                        var level = parseInt(hrefMatch[1]);
                        var cityId = parseInt(hrefMatch[2]);
                        var position = parseInt(hrefMatch[3]);

                        if (activeDemolitionInfo &&
                            activeDemolitionInfo.level == level &&
                            activeDemolitionInfo.cityId == cityId &&
                            activeDemolitionInfo.position == position) {
                            activeDemolitionInfo.level = level - 1;
                            demolitionButton[0].click();
                        } else {
                            if (confirm(localizer.localize('tweaks', 'completely_demolish_building_prompt'))) {
                                if (level > 1) {
                                    activeDemolitionInfo = { level: level - 1, cityId: cityId, position: position };
                                    demolitionButton[0].click();
                                } else {
                                    activeDemolitionInfo = null;
                                }
                            }
                        }
                    } else if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                        demolitionButton = $('#buildingUpgrade .downgrade .action_btn');
                        if (demolitionButton.length > 0) {
                            hrefMatch = demolitionButton.attr('href').match(
                                /view=buildings_demolition&cityId=(\d+)&position=(\d+)&level=(\d+)/);
                            if (hrefMatch) {
                                level = parseInt(hrefMatch[3]);
                                cityId = parseInt(hrefMatch[1]);
                                position = parseInt(hrefMatch[2]);

                                if (activeDemolitionInfo &&
                                    activeDemolitionInfo.level == level &&
                                    activeDemolitionInfo.cityId == cityId &&
                                    activeDemolitionInfo.position == position) {
                                    demolitionButton[0].click();
                                }
                            }
                        }
                    }
                }));
    }

    function initTweaks() {
        if (autoAcceptDailyBonus.isEnabled()) {
            function submitDailyActivityBonus() {
                $('#dailyActivityBonus form').submit();
            }
            if (IkaTools.Utils.isChrome()) {
                // Who knows why you would send back a page that then immediately turns around
                // and queries the server it came from.  But then, you are not an Ikariam developer.
                // In all likelihood you posess at least a single brain cell (a sufficient but
                // not necessary condition).
                // In any case, the fact is that in Chrome this starts an ajax call before we
                // have had a chance to hook in any of the ajax handler overrides in developer
                // tools.  So to counteract the stupid things Ikariam developers did we have to
                // do this the bruteforce way.
                setTimeout(submitDailyActivityBonus, 500);
                setTimeout(submitDailyActivityBonus, 1000);
                setTimeout(submitDailyActivityBonus, 2000);
                setTimeout(submitDailyActivityBonus, 5000);
            } else {
                IkaTools.View.registerIkariamAjaxResponseCallback(
                    IkaTools.Utils.forEachIkariamAjaxResponseFunction(
                        function findDailyBonusWindow(index, name, value) {
                            if (name == IkaTools.Constants.IkariamAjaxResponseType.ADD_WINDOW &&
                                value[0] == 'dailyActivityBonus') {
                                submitDailyActivityBonus();
                            }
                        }));
            }
        }

        var addedStyles = '';

        if (hideAds.isEnabled()) {
            addedStyles += '.ad_banner { display: none; } ';
        }
        if (hideFacebook.isEnabled()) {
            addedStyles += '#facebook_button * { display: none !important; } ';
        }
        if (hideFriendsBar.isEnabled()) {
            addedStyles += '#js_viewFriends { display: none; } ';
        }
        if (hideChat.isEnabled()) {
            addedStyles += '#js_viewChat { display: none; } ';
        }

        addedStyles += initQuickGoodsButtons();

        initBuildingDemolitionHandler();

        if (showCityOwners.isEnabled() && IkaTools.View.viewIsIsland()) {
            function doLabelCities(data) {
                for (var i = 0; i < 19; i++) {
                    var cityData = data.cities[i];
                    if (cityData.type != 'buildplace') {
                        $('#js_cityLocation' + i + 'TitleText').append(' (' + cityData.ownerName + ')');
                    }
                }
            }

            addedStyles += '#island .city .scroll_img .center { overflow: hidden; width: 175px; } ' +
                '#island .city .scroll_img .after { left: 175px; } ';

            IkaTools.View.registerIkariamAjaxResponseCallback(
                function labelCityOwners(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.UPDATE_BACKGROUND_DATA) {
                            doLabelCities(data);
                        } else if (name == IkaTools.Constants.IkariamAjaxResponseType.UPDATE_GLOBAL_DATA) {
                            doLabelCities(data['backgroundData'] || data[11]);
                        }
                    });
                }, true);
        }

        if (preventAccidentalColonyDestruction.isEnabled()) {
            IkaTools.View.registerIkariamAjaxResponseCallback(
                function preventAccidentalColonyDestruction(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                            if (data[0] == IkaTools.Constants.View.ABOLISH_CITY) {
                                var cityId = parseInt($('#abolishCity input[name=cityId]').val());
                                var city = IkaTools.EmpireData.getCity(cityId);
                                var palace = city.getBuildingByType(IkaTools.Constants.Buildings.PALACE);
                                var governorsResidence = city.getBuildingByType(
                                    IkaTools.Constants.Buildings.GOVERNORS_RESIDENCE);
                                if (palace || governorsResidence) {
                                    unsafeWindow.ikariam.TemplateView.destroyTemplateView();
                                    alert(localizer.localize('tweaks', 'destroy_non_mobile_colony_prompt'));
                                }
                            }
                        }
                    });
                }, true);
        }

        if (initializeColonizationMissionsForPirateRaiding.isEnabled()) {
            IkaTools.View.registerIkariamAjaxResponseCallback(
                function initializeColonizationMissionsForPirateRaiding(response) {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) {
                            if (data[0] == IkaTools.Constants.View.COLONIZE) {
                                var woodInput = $('#textfield_wood');
                                var marbleInput = $('#textfield_marble');
                                var civData = IkaTools.EmpireData.getCivilizationData();

                                var multiplier = 1.0;
                                multiplier -= civData.hasResearched(
                                    IkaTools.Constants.Research.Economy.PULLEY) ? .02 : 0;
                                multiplier -= civData.hasResearched(
                                    IkaTools.Constants.Research.Economy.GEOMETRY) ? .04 : 0;
                                multiplier -= civData.hasResearched(
                                    IkaTools.Constants.Research.Economy.SPIRIT_LEVEL) ? .08 : 0;

                                woodInput.val(Math.ceil(multiplier *
                                                        IkaTools.Constants.BuildingData[IkaTools.Constants.Buildings.PIRATE_FORTRESS].wood[0]) - 250);
                                marbleInput.val(Math.ceil(multiplier *
                                                          IkaTools.Constants.BuildingData[IkaTools.Constants.Buildings.PIRATE_FORTRESS].marble[0]));

                                // Have to give time for Ikariam javascript that processes the click
                                // to be registered.
                                setTimeout(function() {$('#slider_capacity_min').get(0).click();}, 0);
                            }
                        }
                    });
                }, true);
        }

        GM_addStyle(addedStyles);
    }

    function initAlerts() {
        // v2.20 : GM_notification ; audio = son + notification qui reste affichée
        function showDesktopNotification(icon, title, text, audio) {
            return impNotify({ image: icon, title: title, text: text, sound: !!audio, sticky: !!audio });
        }

        if (buildingCompletionAlert_Desktop.isEnabled()) {
            IkaTools.EmpireData.registerBuildingsChangedHandler(
                function alertBuildingCompletion(changes) {
                    $.each(changes, function forEachBuildingChange(index, change) {
                        if (change.type == IkaTools.Constants.BuildingEventType.UPGRADE_COMPLETE) {
                            showDesktopNotification(
                                impAsset((IkaTools.Constants.BuildingData[change.building.getType()] || {}).icon),
                                localizer.localize('alerts','building_upgrade_complete'),
                                localizer.localize('alerts','building_upgrade_complete_text').format2(
                                    {
                                        building: localizer.localize('buildings', change.building.getType()),
                                        city: change.city.getName(),
                                        level: IkaTools.Intl.formatInteger(change.building.getLevel())
                                    }));
                        }
                    });
                });
        }

        var missionAlerts = {
            'transport:loading': transportMissionLoaded_Desktop.isEnabled(),
            'transport:en_route': transportMissionArrived_Desktop.isEnabled(),
            'transport:returning': transportMissionReturned_Desktop.isEnabled(),
            'deployarmy:loading': deployArmyLoaded_Desktop.isEnabled(),
            'deployarmy:en_route': deployArmyArrived_Desktop.isEnabled(),
            'deployarmy:returning': deployArmyReturned_Desktop.isEnabled(),
            'deploynavy:loading': false,
            'deploynavy:en_route': deployNavyArrived_Desktop.isEnabled(),
            'deploynavy:returning': deployNavyReturned_Desktop.isEnabled(),
            'plunder:loading': pillageLoaded_Desktop.isEnabled(),
            'plunder:en_route': pillageArrived_Desktop.isEnabled(),
            'plunder:returning': pillageReturned_Desktop.isEnabled(),
        }

        IkaTools.EmpireData.registerMovementsChangedHandler(function alertMissions(changes) {
            $.each(changes, function forEachMissionChange(index, change) {
                if (change.type == IkaTools.Constants.Movements.EventType.STAGE_CHANGED ||
                    change.type == IkaTools.Constants.Movements.EventType.COMPLETED) {
                    var mission = change.movement.getMission();
                    var stage = change.previousStage;
                    var cityName = IkaTools.Intl.localizer.localize('formatting','unknown');
                    if (stage == IkaTools.Constants.Movements.Stage.EN_ROUTE) {
                        var city = change.movement.getTargetCity();
                        if (city) {
                            cityName = city.getName();
                        }
                    } else {
                        city = change.movement.getOriginCity();
                        if (city) {
                            cityName = city.getName();
                        }
                    }
                    if (missionAlerts[mission + ':' + stage]) {
                        showDesktopNotification(
                            impAsset((IkaTools.Constants.Movements.MissionData[mission] || {}).icon),
                            localizer.localize('alerts','mission_update'),
                            localizer.localize('alerts', stage).format2({
                                type: localizer.localize('alerts', mission),
                                city: cityName,
                            }));
                    }
                }
            });
        });

        var underAttack = $('#advMilitary a').eq(0).hasClass('normalalert');
        var parsedIgnoredHostileMissions = JSON.parse(ignoredHostileMissions.getValue());
        var impNotifiedHostiles = {}; // v2.20

        IkaTools.View.registerIkariamAjaxResponseCallback(
            function enhancedMilitaryAdvisor(response) {
                try {
                    IkaTools.Utils.iterateIkariamAjaxResponse(response, function(index, name, data) {
                        if (name == IkaTools.Constants.IkariamAjaxResponseType.UPDATE_GLOBAL_DATA) {

                            // Protection : structure différente suivant les réponses Ikariam
                            var headerData = data.headerData || data[11] || data[0];
                            if (!headerData || !headerData.advisors || !headerData.advisors.military) {
                                return; // on sort juste pour cette réponse, pas d’erreur
                            }

                            var militaryAdvisor = headerData.advisors.military;
                            var css = militaryAdvisor.cssclass || "";

                            if (css.indexOf('normalalert') >= 0) {
                                if (!underAttack) {
                                    showDesktopNotification(
                                        null,
                                        'Ikariam : attaque en approche',
                                        'Le conseiller militaire signale une attaque. Ouvre-le pour voir le détail.',
                                        true
                                    );
                                    underAttack = true;
                                } else {
                                    function onMovementUpdate(response) {
                                        var movements = IkaTools.EmpireData.getCivilizationData().getMovements();
                                        var foundUnignoredHostile = false;

                                        $.each(movements, function(index, movement) {
                                            if (movement.isHostile() &&
                                                parsedIgnoredHostileMissions.indexOf(movement.getId()) < 0 &&
                                                !impNotifiedHostiles[movement.getId()]) {
                                                impNotifiedHostiles[movement.getId()] = true; // v2.20 : une alerte par mouvement
                                                foundUnignoredHostile = true;
                                            }
                                        });

                                        if (foundUnignoredHostile) {
                                            showDesktopNotification(
                                                null,
                                                'Ikariam : nouvelle attaque',
                                                'Un nouveau mouvement hostile a été détecté.',
                                                true
                                            );
                                        }
                                        // v2.20 : on ne remplace plus l'icône rouge du conseiller par
                                        // « probablement sûr » : la détection des mouvements hostiles n'est
                                        // pas fiable et masquait une vraie attaque.
                                    }

                                    IkaTools.EmpireData.updateMovements(onMovementUpdate);
                                }
                            } else {
                                underAttack = false;
                            }
                        }
                    });
                } catch (e) {
                    console.warn("Imperator: erreur dans enhancedMilitaryAdvisor, ignorée :", e);
                }
            },
            true
        );



        // remplacement !!
    }

    function configureLocalization() {
        var language = localizedLanguage.getValue();
        if (!language) {
            var hostParts = document.location.host.split('\.');
            language = hostParts[hostParts.length - 1];
            if (language == "com" && hostParts.length == 4) {
                //for example: http://s1.en.ikariam.com
                language = hostParts[1];
            }

            // Format moderne Gameforge : sXX-<lang>.ikariam.gameforge.com -> <lang>
            if (hostParts.indexOf('gameforge') > -1) {
                var first = hostParts[0];
                language = (first.indexOf('-') > -1) ? first.split('-').pop() : first;
            }
        }

        // v2.21 : seuls le français et l'anglais existent ; tout le reste -> anglais
        if (language !== 'fr') {
            language = 'en';
        }
        localizer.setPreferredLanguage(language);
        IkaTools.Intl.localizer.setPreferredLanguage(language);
    }

    function initPirating() {
    }

    function initPendingIslandUrl() {
        function executePending() {
            var pendingCityId = GM_getValue('imperator_pending_city_id', '');
            if (!pendingCityId) return;
            if (!IkaTools.View.viewIsIsland()) return;

            var pendingView   = GM_getValue('imperator_pending_view', '');
            var pendingParams = {};
            try {
                pendingParams = JSON.parse(GM_getValue('imperator_pending_params', '{}'));
            } catch(e) {}

            var city = IkaTools.EmpireData.getCity(parseInt(pendingCityId));
            if (city) {
                GM_setValue('imperator_pending_city_id', '');
                GM_setValue('imperator_pending_view',    '');
                GM_setValue('imperator_pending_params',  '{}');
                IkaTools.View.goToCitysIslandView(city, pendingView, pendingParams);
            }
        }

        // Cas 1 : page island déjà chargée au boot
        executePending();
        // Cas 2 : island chargée par réponse AJAX
        IkaTools.View.registerIkariamAjaxResponseCallback(executePending, true);
    }

    function initBackgroundRefresh() {
        function refreshCity(city, callback) {
            var url = 'https://' + IkaTools.View.getDomain() +
                      '/index.php?view=townHall&cityId=' + city.getId();
            IkaTools.Utils.backgroundFetchIkariamFullPage(url, function(response, ajaxArray) {
                try {
                    var templateData = null;
                    IkaTools.Utils.iterateIkariamAjaxResponse(ajaxArray, function(i, name, data) {
                        if (name === IkaTools.Constants.IkariamAjaxResponseType.UPDATE_TEMPLATE_DATA) {
                            templateData = data;
                        }
                    });
                    if (!templateData) { callback(); return; }

                    var city2 = IkaTools.EmpireData.getCity(city.getId());
                    if (!city2) { callback(); return; }

                    var hapEl = templateData['js_TownHallHappinessLargeValue'];
                    if (hapEl) {
                        var score = parseInt(hapEl.text);
                        if (!isNaN(score)) city2.happinessScore = score;
                    }

                    var moodEl = templateData['js_TownHallSatisfactionOverviewMood'];
                    if (moodEl && moodEl.html) {
                        var src = moodEl.html;
                        var mood = 'neutral';
                        if (src.indexOf('ecstatic') >= 0)                          mood = 'ecstatic';
                        else if (src.indexOf('happy') >= 0)                        mood = 'happy';
                        else if (src.indexOf('sad') >= 0)                          mood = 'sad';
                        else if (src.indexOf('angry') >= 0 ||
                                 src.indexOf('outraged') >= 0)                     mood = 'outraged';
                        city2._imperatorMood = mood;
                    }

                } catch(e) {
                    console.warn('[Imperator] refreshCity échoué pour', city.getName(), e);
                }
                callback();
            });
        }

        function runRefresh(onProgress, onDone) {
            var cities = IkaTools.EmpireData.getOwnCities();
            var index = 0;
            var total = cities.length;

            function next() {
                if (index >= total) {
                    if (onDone) onDone(total);
                    return;
                }
                var city = cities[index];
                if (onProgress) onProgress(index + 1, total, city.getName());
                index++;
                refreshCity(city, function() {
                    setTimeout(next, 5000);
                });
            }
            next();
        }

        return { runRefresh: runRefresh };
    }
    // v2.41 : backgroundRefresh est déclaré dans reglages.js (qui l'utilise)
    function init() {
        configureLocalization();

        IkaTools.Logging.setAndSaveOptionsFromPageAnchor();

        addStyles();

        var overviewTablesReady = overviewTables();

        $(document).ready(function() {
            var readyAction = IkaTools.Logging.debuggable(
                {label: "Imperator.documentReady", group: true, alwaysTime: true, swallowException: true},
                function imperatorDocumentReady() {
                    registerLoggingEventHandlers();
                    initTweaks();
                    initAlerts();
                    initPirating();
                    initPendingIslandUrl();

                    backgroundRefresh = initBackgroundRefresh();

                    IkaTools.initialize();
                    overviewTablesReady();
                    addSettingsLink();

                });

            if (IkaTools.Utils.isChrome()) {
                // In Chrome sometimes we randomly execute before the ikariam "on-ready" scripts
                // which won't work because the stuff IkaTools.init needs will not be in the
                // javascript objects.  Move this setup to the end of the line.
                setTimeout(readyAction, 500);
            } else {
                readyAction();
            }
        });
    }

    return {
        init: init,
    }
}();


     ////////////
     // BLOC 2 //
     ////////////
(function installDebitOnSend() {
  'use strict';

  function ready() {
    return typeof IkaTools !== 'undefined' &&
           IkaTools.View && IkaTools.View.registerAjaxFormSubmitCallback &&
           IkaTools.View.registerNextIkariamAjaxRequestCallback &&
           IkaTools.Constants && IkaTools.Constants.Resources &&
           IkaTools.Utils && IkaTools.Utils.iterateIkariamAjaxResponse;
  }

  function resourceKeys() {
    var R = IkaTools.Constants.Resources;
    return [R.WOOD, R.WINE, R.MARBLE, R.GLASS, R.SULFUR];
  }

  function readCargo() {
    var R = IkaTools.Constants.Resources, c = {};
    c[R.WOOD]   = parseInt($('#textfield_wood').val())   || 0;
    c[R.WINE]   = parseInt($('#textfield_wine').val())   || 0;
    c[R.MARBLE] = parseInt($('#textfield_marble').val()) || 0;
    c[R.GLASS]  = parseInt($('#textfield_glass').val())  || 0;
    c[R.SULFUR] = parseInt($('#textfield_sulfur').val()) || 0;
    if ($('#createColony').length) { c[R.WOOD] += 1250; } // navire de colonie (comme le jeu)
    return c;
  }

  function install() {
    if (!ready()) return false;

    IkaTools.View.registerAjaxFormSubmitCallback(function onTransportSubmit(form) {
      try {
        // Le jeu route les transports sur ces id de formulaire (cf. dispatcher).
        if (!form || (form.id !== 'transport' && form.id !== 'transportForm')) return;

        var origin = IkaTools.View.getCurrentCity(); // un transport part TOUJOURS de la ville active
        if (!origin || !origin._incrementResource) return;

        var cargo = readCargo();
        var keys = resourceKeys();
        var total = 0;
        keys.forEach(function (k) { total += (cargo[k] || 0); });
        if (total <= 0) return;

        // Capture des stocks AVANT envoi (pour la garde anti-double-débit).
        var before = {};
        keys.forEach(function (k) {
          try { var r = origin.getResource(k); before[k] = (r && r.getCurrent) ? r.getCurrent() : null; }
          catch (e) { before[k] = null; }
        });

        // On ne débite QUE si le serveur confirme le succès (comme le jeu pour créer le mouvement).
        IkaTools.View.registerNextIkariamAjaxRequestCallback(function onTransportResponse(response) {
          try {
            var success = false;
            IkaTools.Utils.iterateIkariamAjaxResponse(response, function (index, name, data) {
              if (name === IkaTools.Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                  data && data[0] && data[0].type == 10) {
                success = true;
              }
            });
            if (!success) return;

            var changes = [];
            keys.forEach(function (k) {
              if (!cargo[k] || cargo[k] <= 0) return;
              // Garde : si le jeu a DÉJÀ débité l'origine (stock déjà retombé), on ne re-débite pas.
              try {
                var r = origin.getResource(k);
                var nowVal = (r && r.getCurrent) ? r.getCurrent() : null;
                if (before[k] != null && nowVal != null && (before[k] - nowVal) >= cargo[k] * 0.5) {
                  return; // déjà pris en compte ailleurs -> on saute (anti-double-débit)
                }
              } catch (e) {}
              origin._incrementResource(k, changes, -cargo[k]); // débit symétrique de l'arrivée
            });

            if (changes.length && IkaTools.EmpireData && IkaTools.EmpireData.raiseResourcesChanged) {
              IkaTools.EmpireData.raiseResourcesChanged(changes); // -> l'onglet Ressources se rafraîchit
            }
          } catch (e) { if (window.console) console.warn('[Imperator/DebitEnvoi] réponse:', e); }
        });
      } catch (e) { if (window.console) console.warn('[Imperator/DebitEnvoi] soumission:', e); }
    });

    return true;
  }

  if (install()) return;
  var tries = 0;
  var timer = setInterval(function () { tries++; if (install() || tries > 100) clearInterval(timer); }, 100);
})();

// fin BLOC //

////////////////////////////////////////////////////////////////
// v2.23 : capture des vues du jeu (pages de référence pour les tests)
// Aucune requête au serveur, rien n'est envoyé : tout reste en mémoire
// jusqu'au téléchargement demandé dans Réglages > Debug.
////////////////////////////////////////////////////////////////
(function installViewCapture() {
  'use strict';

  var MAX_VIEWS = 20;
  var RENDER_DELAY_MS = 2500; // après la 2e passe des parseurs (2 s)
  var store = {};
  window.__impCaptures = store;

  // Jetons actionRequest masqués (ils servent à valider les actions du joueur)
  function scrub(text) {
    return String(text == null ? '' : text)
      .replace(/(name=["']?actionRequest["']?[^>]*?value=["'])[^"']*/gi, '$1XXX')
      .replace(/(value=["'])[^"']*(["'][^>]*?name=["']?actionRequest)/gi, '$1XXX$2')
      .replace(/(actionRequest\W{1,4})[0-9a-f]{8,}/gi, '$1XXX');
  }

  function gameVersion() {
    try {
      var t = $('#GF_toolbar li.version').first().text();
      var m = String(t).match(/\d+(?:\.\d+)+/);
      return m ? m[0] : 'inconnue';
    } catch (e) { return 'inconnue'; }
  }

  function imperatorVersion() {
    try { return GM_info.script.version || '?'; } catch (e) { return '?'; }
  }

  function keep(view, entry) {
    store[view] = entry;
    var keys = Object.keys(store);
    if (keys.length > MAX_VIEWS) {
      keys.sort(function (a, b) { return store[a].time - store[b].time; });
      delete store[keys[0]];
    }
  }

  function renderedOf(view) {
    var el = document.getElementById(view);
    return el ? scrub(el.outerHTML) : null;
  }

  function onResponse(response) {
    try {
      var T = IkaTools.Constants.IkariamAjaxResponseType;
      var items = [], templateData = null, background = null;
      IkaTools.Utils.iterateIkariamAjaxResponse(response, function (i, name, data) {
        // v2.26 : données de la vue île (villes, joueurs, alliances)
        if (name === T.UPDATE_BACKGROUND_DATA) {
          background = data;
        } else if (name === T.UPDATE_GLOBAL_DATA && data && !background) {
          background = data['backgroundData'] || data[11] || null;
        }
        if (name === T.CHANGE_VIEW && data && data[0]) {
          items.push({ view: String(data[0]), html: data[1] });
        } else if (name === T.UPDATE_TEMPLATE_DATA) {
          templateData = data;
        } else if ((name === T.ADD_WINDOW || name === T.CREATE_VIEW) && data && data[0]) {
          items.push({ view: String(data[0]), html: data[1] });
        }
      });
      if (background && background.cities) {
        var isle = {
          view: 'island',
          time: Date.now(),
          game: gameVersion(),
          imperator: imperatorVersion(),
          raw: '',
          templateData: null,
          backgroundData: null,
          rendered: null,
        };
        try { isle.backgroundData = scrub(JSON.stringify(background, null, 1)); } catch (e) {}
        keep('island', isle);
        setTimeout(function () { try { isle.rendered = renderedOf('island'); } catch (e) {} }, RENDER_DELAY_MS);
      } else if (background && background.position) {
        // v2.29 : dernière vue ville (une seule place, pour ne pas évincer les autres vues)
        var town = {
          view: 'cityData',
          time: Date.now(),
          game: gameVersion(),
          imperator: imperatorVersion(),
          raw: '',
          templateData: null,
          backgroundData: null,
          rendered: null,
        };
        try { town.backgroundData = scrub(JSON.stringify(background, null, 1)); } catch (e) {}
        keep('cityData', town);
      }
      // v2.32 : réponse sans nouvelle vue mais avec des données (ex. le tableau des mouvements du
      // Conseiller militaire, envoyé juste après la page) : rattachée à la dernière vue capturée.
      if (!items.length && templateData) {
        var last = null;
        Object.keys(store).forEach(function (k) {
          if (k !== 'island' && k !== 'cityData' && (!last || store[k].time > last.time)) last = store[k];
        });
        if (last && Date.now() - last.time < 60000) {
          try {
            last.followUps = (last.followUps || []).concat([scrub(JSON.stringify(templateData, null, 1))]).slice(-5);
          } catch (e) {}
        }
      }
      items.forEach(function (it) {
        var entry = {
          view: it.view,
          time: Date.now(),
          game: gameVersion(),
          imperator: imperatorVersion(),
          raw: scrub(it.html),
          templateData: null,
          rendered: null,
        };
        try { if (templateData) entry.templateData = scrub(JSON.stringify(templateData, null, 1)); } catch (e) {}
        keep(it.view, entry);
        setTimeout(function () { try { entry.rendered = renderedOf(it.view); } catch (e) {} }, RENDER_DELAY_MS);
      });
    } catch (e) {
      console.warn('[Imperator] Capture de vue ignorée', e);
    }
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp(t) {
    var d = new Date(t);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '_' + pad(d.getHours()) + 'h' + pad(d.getMinutes());
  }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function fileName(entry) {
    return ('capture_' + entry.view + '_' + stamp(entry.time) + '_v' + entry.game + '.html')
      .replace(/[^A-Za-z0-9_.\-]/g, '_');
  }

  // Contenu inerte : les blocs sont dans des <template> (aucun script exécuté à l'ouverture)
  function buildFile(entry) {
    var noTpl = function (x) { return String(x).replace(/<\/template/gi, '<\\/template'); };
    var json = String(entry.templateData || 'null').replace(/<\/script/gi, '<\\/script');
    var bgJson = String(entry.backgroundData || 'null').replace(/<\/script/gi, '<\\/script'); // v2.26
    var fuJson = '[' + (entry.followUps || []).join(',\n').replace(/<\/script/gi, '<\\/script') + ']'; // v2.32
    return '<!doctype html>\n<html lang="fr"><head><meta charset="utf-8">' +
      '<title>Capture ' + esc(entry.view) + '</title></head><body>\n' +
      '<h1>Capture Imperator : ' + esc(entry.view) + '</h1>\n' +
      '<ul>' +
      '<li>Date : ' + esc(new Date(entry.time).toLocaleString('fr-FR')) + '</li>' +
      '<li>Version du jeu : ' + esc(entry.game) + '</li>' +
      '<li>Version Imperator : ' + esc(entry.imperator) + '</li>' +
      '<li>Page rendue : ' + (entry.rendered ? 'oui' : 'non disponible') + '</li>' +
      '<li>Jetons actionRequest masqués (XXX)</li>' +
      '</ul>\n' +
      '<template id="imp-capture-rendered">\n' + noTpl(entry.rendered || '') + '\n</template>\n' +
      '<template id="imp-capture-raw">\n' + noTpl(entry.raw || '') + '\n</template>\n' +
      '<script type="application/json" id="imp-capture-templateData">\n' + json + '\n</script>\n' +
      '<script type="application/json" id="imp-capture-backgroundData">\n' + bgJson + '\n</script>\n' +
      '<script type="application/json" id="imp-capture-followUps">\n' + fuJson + '\n</script>\n' +
      '</body></html>\n';
  }

  function download(view) {
    var entry = store[view];
    if (!entry) return false;
    if (!entry.rendered) { try { entry.rendered = renderedOf(view); } catch (e) {} }
    var blob = new Blob([buildFile(entry)], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName(entry);
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { try { URL.revokeObjectURL(url); a.remove(); } catch (e) {} }, 1000);
    console.log('[Imperator] Capture téléchargée :', a.download);
    return true;
  }

  function renderList($box) {
    if (!$box || !$box.length) return;
    var keys = Object.keys(store).sort(function (a, b) { return store[b].time - store[a].time; });
    if (!keys.length) {
      $box.html('<span style="font-size:11px">Aucune vue retenue depuis le chargement de la page. ' +
                'Ouvre une vue du jeu (Hôtel de Ville, Sanctuaire...), puis reviens ici.</span>');
      return;
    }
    var rows = keys.map(function (k) {
      var e = store[k];
      var kb = Math.round(((e.raw || '').length + (e.rendered || '').length + (e.templateData || '').length +
                           (e.backgroundData || '').length) / 1024);
      return '<tr><td style="text-align:left">' + esc(k) + '</td>' +
             '<td>' + esc(new Date(e.time).toLocaleTimeString('fr-FR')) + '</td>' +
             '<td>' + kb + ' ko</td>' +
             '<td><a class="button imp-capture-dl" data-view="' + esc(k) + '">Télécharger</a></td></tr>';
    }).join('');
    $box.html('<table style="width:100%;font-size:11px"><tbody>' + rows + '</tbody></table>');
    $box.find('.imp-capture-dl').on('click', function () { download($(this).attr('data-view')); });
  }

  window.__impRenderCaptures = renderList;
  window.__impDownloadCapture = download;
  window.__impBuildCapture = buildFile;   // pour les tests hors jeu
  window.__impScrubCapture = scrub;       // pour les tests hors jeu

  function ready() {
    return typeof IkaTools !== 'undefined' && IkaTools.View &&
           IkaTools.View.registerIkariamAjaxResponseCallback &&
           IkaTools.Utils && IkaTools.Utils.iterateIkariamAjaxResponse && IkaTools.Constants;
  }
  function install() {
    if (!ready()) return false;
    IkaTools.View.registerIkariamAjaxResponseCallback(onResponse, true);
    return true;
  }
  if (install()) return;
  var n = 0, timer = setInterval(function () { n++; if (install() || n > 100) clearInterval(timer); }, 100);
})();

// fonction couleur si bâtiment ok //

(function installUpgradeHighlight() {
  'use strict';

  var TABLE_ID = 'ImperatorOverviewBuildingsTable';
  var CELL_SEL = 'a.imperator_tool_tip[id^="Building_"]';

  injectCSS();

  function ready() {
    return typeof IkaTools !== 'undefined' &&
           IkaTools.EmpireData && IkaTools.EmpireData.getCity &&
           IkaTools.Constants && IkaTools.Constants.Resources;
  }

  function findCity(cityId) {
    try {
      return IkaTools.EmpireData.getCity(cityId) ||
             IkaTools.EmpireData.getCity(parseInt(cityId, 10)) || null;
    } catch (e) { return null; }
  }

  function isLaunchable(cell) {
    try {
      var parts = String(cell.id || '').split('_');
      var city = findCity(parts[1]);
      if (!city || !city.getBuildingByPosition) return false;
      var b = city.getBuildingByPosition(parseInt(parts[2], 10));
      if (!b) return false;
      if (b.isEmpty && b.isEmpty()) return false;        // emplacement vide
      if (b.isUpgrading && b.isUpgrading()) return false; // déjà en cours
      if (b.isMaxLevel && b.isMaxLevel()) return false;   // niveau max
      var costs = b.getUpgradeCosts && b.getUpgradeCosts();
      if (!costs) return false;
      var R = IkaTools.Constants.Resources, keys = [R.WOOD, R.WINE, R.MARBLE, R.GLASS, R.SULFUR];
      var anyCost = false; // v2.20 : coût inconnu (tout à 0) -> jamais vert
      for (var i = 0; i < keys.length; i++) {
        var need = Math.ceil(costs[keys[i]] || 0);
        if (need <= 0) continue;
        anyCost = true;
        var stock = 0;
        try { var rr = city.getResource(keys[i]); stock = (rr && rr.getCurrent) ? rr.getCurrent() : 0; } catch (e) {}
        if (stock < need) return false; // pas assez -> pas vert
      }
      return anyCost;
    } catch (e) { return false; }
  }

  // v2.35 : recalcul complet seulement à l'ouverture de l'onglet, après un changement
  // (ressources, bâtiments) ou toutes les 10 s pour suivre la production.
  var lastRun = 0, wasVisible = false, dirty = true;
  function markDirty() { dirty = true; setTimeout(decorate, 0); }
  function decorate() {
    try {
      if (document.hidden) { wasVisible = false; return; }
      var table = document.getElementById(TABLE_ID);
      if (!table || table.offsetParent === null) { wasVisible = false; return; } // onglet Bâtiments fermé
      var now = Date.now();
      if (wasVisible && !dirty && now - lastRun < 10000) return;
      wasVisible = true; dirty = false; lastRun = now;
      var cells = table.querySelectorAll(CELL_SEL);
      for (var i = 0; i < cells.length; i++) {
        if (isLaunchable(cells[i])) cells[i].classList.add('imp-up-ok');
        else cells[i].classList.remove('imp-up-ok');
      }
    } catch (e) {}
  }

  function start() {
    if (!ready()) return false;
    // Feedback immédiat quand ressources / bâtiments changent (arrivée, envoi, fin d'upgrade…)
    try { IkaTools.EmpireData.registerResourcesChangedHandler(markDirty); } catch (e) {}
    try { IkaTools.EmpireData.registerBuildingsChangedHandler(markDirty); } catch (e) {}
    // Filet : couvre l'ouverture de l'aperçu et les changements d'onglet (ne coûte rien si non visible).
    setInterval(decorate, 1200);
    decorate();
    return true;
  }

  function injectCSS() {
    if (document.getElementById('imp-up-css')) return;
    var css =
      'a.imperator_tool_tip.imp-up-ok{' +
        'background:#DCE8C2 !important;' +
        'color:#2E6B1E !important;' +
        'font-weight:700 !important;' +
        'border-radius:4px !important;' +
        'box-shadow:inset 0 0 0 1px #7FA857 !important;' +
      '}';
    var st = document.createElement('style'); st.id = 'imp-up-css'; st.textContent = css; document.head.appendChild(st);
  }

  if (start()) return;
  var n = 0, t = setInterval(function () { n++; if (start() || n > 100) clearInterval(t); }, 100);
})();



// v3.5 : badge dans le titre de l'onglet du navigateur, « (2) Ikariam … », quand des labos
// d'académie sont redevenus disponibles (4 h après une expérience) et que la ville a assez
// de cristal pour une nouvelle expérience. Le compte baisse dès que l'académie est revisitée.

(function installExperienceBadge() {
  'use strict';

  var SCROLL_COST = 240000; // cristal minimal (avec le parchemin d'Athéna)

  function ready() {
    return typeof IkaTools !== 'undefined' && IkaTools.EmpireData &&
           IkaTools.EmpireData.getOwnCities && IkaTools.Constants && IkaTools.Constants.Resources;
  }

  function countReadyAgain() {
    var n = 0, now = Date.now();
    $.each(IkaTools.EmpireData.getOwnCities(), function (i, city) {
      if (!city || !city.getExperimentReadyAt) return;
      var readyAt = city.getExperimentReadyAt();
      if (!readyAt || readyAt > now || city.isExperimentAcknowledged()) return;
      var glass = city.getResource(IkaTools.Constants.Resources.GLASS);
      var crystal = glass && glass.getCurrent ? Number(glass.getCurrent()) || 0 : 0;
      if (crystal >= SCROLL_COST) n++;
    });
    return n;
  }

  function update() {
    var n = 0;
    try { n = countReadyAgain(); } catch (e) { n = 0; }
    var title = document.title.replace(/^\(\d+\) /, '');
    var wanted = n ? '(' + n + ') ' + title : title;
    if (document.title !== wanted) document.title = wanted;
  }

  var tries = 0, wait = setInterval(function () {
    tries++;
    if (ready()) {
      clearInterval(wait);
      update();
      setInterval(update, 15000);
    } else if (tries > 100) {
      clearInterval(wait);
    }
  }, 200);
})();
IkaTools.Logging.debuggable( {label: "Imperator.init", group: true, alwaysTime: true, swallowException: true},
                            Imperator.init)();

unsafeWindow.IkaTools = IkaTools;