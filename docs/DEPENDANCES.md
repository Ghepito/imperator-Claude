# Dépendances entre les fichiers de `src/`

Généré par `node outils/dependances.js` : ne pas modifier à la main. Pour chaque fichier, ce qu'il **fournit** (noms qu'il déclare) et ce qu'il **utilise** des autres fichiers.

Les fichiers *ouverture* / *fermeture* sont des enveloppes (ils ouvrent ou ferment IkaTools, EmpireData, Imperator, les onglets) : ils ne sont pas lisibles seuls, par construction. Tous les autres le sont.

| Fichier | Fournit | Utilise (fichier : noms) |
|---|---|---|
| `01-popover-chantiers` | – | – |
| `02-garde-fous` | __impH | – |
| `ikatools/01-logging` | ikaToolsVersion, Logging | – |
| `ikatools/02-utils` | Utils | `ikatools/01-logging` : Logging<br>`ikatools/constants` : Constants |
| `ikatools/03-intl` | Intl | `ikatools/constants` : Constants |
| `ikatools/04-view` | View | `ikatools/01-logging` : Logging<br>`ikatools/02-utils` : Utils |
| `ikatools/05-data` | Data | `ikatools/04-view` : View<br>`ikatools/01-logging` : Logging, ikaToolsVersion |
| `ikatools/06-ui` | UI | `ikatools/01-logging` : Logging<br>`ikatools/02-utils` : Utils<br>`ikatools/constants` : Constants<br>`ikatools/07-settings` : Settings |
| `ikatools/07-settings` | Settings | `ikatools/05-data` : Data |
| `ikatools/constants` | Constants | – |
| `ikatools/empire/00-types` | _impTypes | – |
| `ikatools/empire/00-armee` | Military, MilitaryUnits, TrainingBatch | `ikatools/02-utils` : Utils<br>`ikatools/04-view` : View<br>`ikatools/constants` : Constants<br>`ikatools/empire/03-evenements` : militaryChangedEvent<br>`ikatools/empire/03-donnees` : empireData<br>`ikatools/empire/00-types` : _impTypes |
| `ikatools/empire/01-ville` | _impWarehouseSig, City | `ikatools/constants` : Constants<br>`ikatools/empire/00-armee` : Military<br>`ikatools/empire/03-evenements` : buildingsChangedEvent, raiseBuildingsChanged, raiseResourcesChanged<br>`ikatools/04-view` : View<br>`ikatools/empire/03-donnees` : empireData, getCivilizationData, getOwnCities<br>`ikatools/02-utils` : Utils<br>`ikatools/empire/parseurs/aide-batiments` : getHelpCost<br>`ikatools/empire/00-types` : _impTypes |
| `ikatools/empire/02-civilisation-mouvements` | CivilizationData, calculateTravelTime, Movement | `ikatools/constants` : Constants<br>`ikatools/04-view` : View<br>`ikatools/empire/03-donnees` : empireData, getCity, getCivilizationData<br>`ikatools/empire/03-evenements` : movementsChangedEvent, raiseMilitaryChanged, raiseResourcesChanged<br>`ikatools/empire/00-types` : _impTypes |
| `ikatools/empire/03-donnees` | empireData, TRADE_GOOD_LOOKUP, getCity, coordsRegex, parseCoordinates, getCities, getOwnCities, getCivilizationData | `ikatools/05-data` : Data<br>`ikatools/empire/00-types` : _impTypes<br>`ikatools/constants` : Constants<br>`ikatools/04-view` : View |
| `ikatools/empire/03-evenements` | raiseCivilizationDataChanged, civilizationDataChangedEvent, registerCivilizationDataChangedHandler, raiseMovementsChanged, movementsChangedEvent, registerMovementsChangedHandler, raiseResourcesChanged, resourcesChangedEvent … (21) | `ikatools/02-utils` : Utils |
| `ikatools/empire/parseurs/formulaires` | processTransportForm, coordinatesEqual, processDeploymentForm, processPlunderForm | `ikatools/04-view` : View<br>`ikatools/constants` : Constants<br>`ikatools/empire/02-civilisation-mouvements` : Movement<br>`ikatools/empire/00-armee` : MilitaryUnits<br>`ikatools/02-utils` : Utils<br>`ikatools/empire/03-donnees` : getCity, getCivilizationData<br>`ikatools/empire/03-evenements` : raiseMilitaryChanged, raiseMovementsChanged |
| `ikatools/empire/parseurs/armee` | _impReadCityMilitary, processCityMilitaryView, processRelatedCitiesView, parseMilitaryUnitsFromPending, parseTrainingBatches, computeTrainingTime, _IMP_BARRACKS_ORDER, _IMP_SHIPYARD_ORDER … (13) | `ikatools/constants` : Constants<br>`ikatools/04-view` : View<br>`ikatools/empire/03-donnees` : empireData, getCity<br>`ikatools/empire/03-evenements` : raiseMilitaryChanged<br>`ikatools/empire/00-armee` : MilitaryUnits, TrainingBatch |
| `ikatools/empire/parseurs/ville` | readAcademyResearchValue, estimateResearchPerHour, processAcademyView, EXPERIMENT_COOLDOWN, processExperimentForm, processSetScientistsForm, processPalaceView, processTownHallView … (10) | `ikatools/empire/03-donnees` : empireData, getCity, getCivilizationData, getOwnCities<br>`ikatools/04-view` : View<br>`ikatools/empire/03-evenements` : raiseCivilizationDataChanged, raiseResourcesChanged<br>`ikatools/constants` : Constants<br>`ikatools/02-utils` : Utils |
| `ikatools/empire/parseurs/finances` | _bilanLastParsed, parseBilanDomIfVisible, processFinancesView | `ikatools/empire/03-donnees` : getCivilizationData, getOwnCities<br>`ikatools/constants` : Constants<br>`ikatools/empire/03-evenements` : raiseGoldChanged, raiseResourcesChanged |
| `ikatools/empire/parseurs/sanctuaire` | _shrineLastParsed, SHRINE_GOD_NAMES, SHRINE_GOD_CLASS, parseShrineDuration, processShrineView | `ikatools/empire/03-donnees` : empireData, getCivilizationData, getOwnCities<br>`ikatools/empire/03-evenements` : raiseGoldChanged, raiseShrineChanged |
| `ikatools/empire/parseurs/amelioration` | processBuildingUpgradeView | `ikatools/empire/parseurs/conseiller-militaire` : _impParseDurationMs<br>`ikatools/empire/03-donnees` : empireData, getCity |
| `ikatools/empire/parseurs/aide-batiments` | _IMP_HELP_COLUMNS, _IMP_HELP_RESOURCES, buildingHelpData, _impHelpInt, parseBuildingDetailHtml, processBuildingDetailView, getHelpCost | `ikatools/05-data` : Data<br>`ikatools/constants` : Constants |
| `ikatools/empire/parseurs/conseiller-militaire` | _impParseDurationMs, _impRefineWithClock, processMilitaryAdvisorView | `ikatools/constants` : Constants<br>`ikatools/04-view` : View<br>`ikatools/empire/03-donnees` : empireData, getCivilizationData<br>`ikatools/empire/00-armee` : MilitaryUnits<br>`ikatools/empire/02-civilisation-mouvements` : Movement<br>`ikatools/empire/03-evenements` : raiseMovementsChanged |
| `ikatools/empire/04-suivi` | updateCurrentCity, refreshFinancesAndShrine, processPremiumView, updateEmpireDataFromGlobalData, updateAndStartTracking, updateMovements, getDebugString, resetData | `ikatools/empire/03-donnees` : TRADE_GOOD_LOOKUP, empireData, getCivilizationData, getOwnCities, parseCoordinates<br>`ikatools/empire/03-evenements` : raiseCivilizationDataChanged, raiseGoldChanged<br>`ikatools/02-utils` : Utils<br>`ikatools/constants` : Constants<br>`ikatools/04-view` : View<br>`ikatools/empire/parseurs/finances` : processFinancesView<br>`ikatools/empire/parseurs/sanctuaire` : processShrineView<br>`ikatools/empire/01-ville` : City<br>`ikatools/01-logging` : Logging<br>`ikatools/espionnage` : Espionage<br>`ikatools/empire/parseurs/armee` : processBarracksView, processCityMilitaryView, processRelatedCitiesView, processShipyardView<br>`ikatools/empire/parseurs/ville` : processAcademyView, processExperimentForm, processPalaceView, processResearchAdvisorView, processSetScientistsForm, processTempleView, processTownHallView<br>`ikatools/empire/parseurs/conseiller-militaire` : processMilitaryAdvisorView<br>`ikatools/empire/parseurs/aide-batiments` : processBuildingDetailView<br>`ikatools/empire/parseurs/amelioration` : processBuildingUpgradeView<br>`ikatools/empire/parseurs/formulaires` : processDeploymentForm, processPlunderForm, processTransportForm |
| `ikatools/espionnage` | Espionage | `ikatools/empire/00-armee` : MilitaryUnits<br>`ikatools/04-view` : View<br>`ikatools/constants` : Constants<br>`ikatools/empire/03-donnees` : TRADE_GOOD_LOOKUP<br>`ikatools/05-data` : Data<br>`ikatools/02-utils` : Utils |
| `ikatools/empire/98-retour` | – | `ikatools/01-logging` : Logging<br>`ikatools/empire/04-suivi` : getDebugString, refreshFinancesAndShrine, resetData, updateAndStartTracking, updateMovements<br>`ikatools/empire/02-civilisation-mouvements` : calculateTravelTime<br>`ikatools/empire/03-donnees` : getCities, getCity, getCivilizationData, getOwnCities<br>`ikatools/empire/03-evenements` : raiseResourcesChanged, registerBuildingsChangedHandler, registerCivilizationDataChangedHandler, registerGoldChangedHandler, registerMilitaryChangedHandler, registerMovementsChangedHandler, registerResourcesChangedHandler, registerShrineChangedHandler<br>`ikatools/espionnage` : Espionage |
| `ikatools/98-retour` | processAnchor, initialize | `ikatools/04-view` : View<br>`ikatools/00-ouverture` : IkaTools<br>`ikatools/constants` : Constants<br>`ikatools/01-logging` : Logging<br>`ikatools/02-utils` : Utils<br>`ikatools/05-data` : Data<br>`ikatools/empire/00-ouverture` : EmpireData<br>`ikatools/06-ui` : UI<br>`ikatools/07-settings` : Settings |
| `03-attente-donnees` | – | `ikatools/00-ouverture` : IkaTools |
| `imperator/localisations` | localizations | – |
| `imperator/01-traducteur` | localizer | `ikatools/00-ouverture` : IkaTools<br>`imperator/localisations` : localizations |
| `imperator/styles` | addStyles | – |
| `imperator/historique-alertes` | IMP_ALERT_HISTORY_MAX, impAlertHistoryData, impAlertHistoryListeners, impAlertHistoryList, impAlertHistorySave, impAlertHistoryAdd, impAlertHistoryUnread, impAlertHistoryMarkRead … (14) | `ikatools/00-ouverture` : IkaTools<br>`02-garde-fous` : __impH<br>`imperator/01-traducteur` : localizer |
| `imperator/reglages` | backgroundRefresh, settings, localizedLanguage, showResourceOverview, showBuildingsOverview, showMilitaryOverview, showEspionageOverview, autoAcceptDailyBonus … (43) | `ikatools/00-ouverture` : IkaTools<br>`imperator/01-traducteur` : localizer<br>`imperator/historique-alertes` : impAlertHistoryAdd<br>`ikatools/empire/04-suivi` : resetData |
| `imperator/composants` | addSettingsLink, Updateable, Updateables, clickHandler, Link, toolTips | `ikatools/00-ouverture` : IkaTools<br>`imperator/reglages` : autoAcceptDailyBonus, blessSoonThreshold, buildingCompletionAlert_Desktop, dataExportSetting, debugSetting, deployArmyArrived_Desktop, deployArmyLoaded_Desktop, deployArmyReturned_Desktop, deployNavyArrived_Desktop, deployNavyReturned_Desktop, donationButtons, espionageDebugSetting, exceptionLogSetting, hideAds, hideChat, hideFacebook, hideFriendsBar, initializeColonizationMissionsForPirateRaiding, localizedLanguage, pillageArrived_Desktop, pillageLoaded_Desktop, pillageReturned_Desktop, preventAccidentalColonyDestruction, refreshDataSetting, resetEspionageData, settings, showBuildingsOverview, showCityOwners, showEspionageOverview, showMilitaryOverview, showResourceOverview, testDesktopAlert, transportButtons, transportMissionArrived_Desktop, transportMissionLoaded_Desktop, transportMissionReturned_Desktop, viewCaptureSetting<br>`imperator/01-traducteur` : localizer<br>`ikatools/empire/04-suivi` : resetData |
| `imperator/onglets/00-cadre-benedictions` | _impPopupProvider, impPopup, Tab, IMP_GODS, IMP_BLESS_STALE_MS, IMP_BLESS_FAVOR_MAX, impBlessSoonMs, impBlessShrine … (28) | `imperator/composants` : Link, Updateables, toolTips<br>`ikatools/00-ouverture` : IkaTools<br>`imperator/reglages` : blessSoonThreshold<br>`02-garde-fous` : __impH<br>`imperator/01-traducteur` : localizer |
| `imperator/onglets/00-transports` | openResourcesTabOnTransportClose, openBuildingsTabOnTransportClose, openMilitaryTabOnDeploymentClose, __IMP_CAP_FAST, __impEsc, __impFmt, __impIsProtected, __rt … (40) | `ikatools/00-ouverture` : IkaTools<br>`imperator/onglets/00-cadre-benedictions` : impPopup<br>`imperator/01-traducteur` : localizer |
| `imperator/onglets/recherche` | IMP_RS_CITIZEN_GOLD, impResearchUnitCost, impResearchCityStats, impResearchTotals, impResearchMaxScientists, impResearchRingSvg, IMP_XP_COST, IMP_XP_SCROLL_COST … (9) | – |
| `imperator/onglets/ressources` | makeResourceTab | `ikatools/00-ouverture` : IkaTools<br>`imperator/onglets/00-cadre-benedictions` : Tab, impBlessDataAttrs, impBlessInfo, impBlessInstallOnce, impBlessMakeCaption, impBlessRefBonus, impBlessStateClasses, impBlessToolTipHtml, makeCityNameCells, makeCityNameColGroup, makeCityNameHeaderCells<br>`imperator/composants` : Link, toolTips<br>`imperator/01-traducteur` : localizer<br>`imperator/onglets/recherche` : IMP_XP_COST, IMP_XP_SCROLL_COST, impExperimentState, impResearchCityStats, impResearchMaxScientists, impResearchRingSvg, impResearchTotals, impResearchUnitCost<br>`imperator/onglets/00-transports` : openResourcesTabOnTransportClose |
| `imperator/onglets/tableau-de-bord` | GOD_COLORS, GOD_BG, _IMP_HORIZONS, _impDashHorizon, _impDashGoldCache, _impDashEventsBound, _impFmtNum, _impFmtS … (12) | `imperator/onglets/00-cadre-benedictions` : IMP_GODS, Tab<br>`ikatools/00-ouverture` : IkaTools<br>`02-garde-fous` : __impH<br>`imperator/01-traducteur` : localizer |
| `imperator/onglets/batiments` | makeBuildingsTab | `ikatools/00-ouverture` : IkaTools<br>`imperator/01-traducteur` : localizer<br>`imperator/composants` : Link, toolTips<br>`imperator/onglets/00-cadre-benedictions` : Tab, impPopup, makeCityNameCells, makeCityNameColGroup, makeCityNameHeaderCells<br>`imperator/onglets/00-transports` : openBuildingsTabOnTransportClose |
| `imperator/onglets/armee` | UNIT_ORDER, makeMilitaryTab | `ikatools/00-ouverture` : IkaTools<br>`imperator/01-traducteur` : localizer<br>`imperator/composants` : Link, toolTips<br>`imperator/onglets/00-cadre-benedictions` : Tab, makeCityNameCells, makeCityNameColGroup, makeCityNameHeaderCells<br>`imperator/onglets/00-transports` : openMilitaryTabOnDeploymentClose |
| `imperator/onglets/espionnage` | makeEspionageTab | `02-garde-fous` : __impH<br>`imperator/composants` : Link, toolTips<br>`ikatools/00-ouverture` : IkaTools<br>`imperator/01-traducteur` : localizer<br>`imperator/onglets/armee` : UNIT_ORDER<br>`imperator/onglets/00-cadre-benedictions` : Tab, makeCityNameHeaderCells |
| `imperator/onglets/chantiers` | makeChantiersTab | `imperator/onglets/00-transports` : __IMP_STALE_MIN, __impAge, __impAgeTxt, __impCompletion, __impComputeBilan, __impComputeFlotte, __impComputeRoutage, __impEsc, __impFindCity, __impFmt, __impFmtDur, __impInitChantiersDelegation, __impInitTransportReopen, __impInjectChantiersCSS, __impProtectedPanel<br>`ikatools/00-ouverture` : IkaTools<br>`imperator/onglets/00-cadre-benedictions` : Tab |
| `imperator/onglets/boissons` | __impWineGroups, __impWinePlan, makeBoissonsTab | `ikatools/00-ouverture` : IkaTools<br>`imperator/onglets/00-transports` : __IMP_CAP_FAST, __IMP_STALE_MIN, __IMP_WINE_SRC_FLOOR, __IMP_WINE_TARGET, __impAge, __impAgeTxt, __impDist, __impEsc, __impFmt, __impInitChantiersDelegation, __impInitTransportReopen, __impInjectChantiersCSS, __impWineTrigger<br>`imperator/onglets/00-cadre-benedictions` : Tab |
| `imperator/onglets/99-popup-menu` | makePopup, menuImageUrl, createMenuItem, leftMenuResourceContent, leftMenuBuildingsContent, leftMenuArmyContent, leftMenuEspionageContent, leftMenuAlertsContent … (12) | `ikatools/00-ouverture` : IkaTools<br>`imperator/onglets/ressources` : makeResourceTab<br>`imperator/onglets/batiments` : makeBuildingsTab<br>`imperator/onglets/armee` : makeMilitaryTab<br>`imperator/onglets/espionnage` : makeEspionageTab<br>`imperator/onglets/tableau-de-bord` : makeDashboardTab<br>`imperator/onglets/chantiers` : makeChantiersTab<br>`imperator/onglets/boissons` : makeBoissonsTab<br>`imperator/onglets/00-transports` : openBuildingsTabOnTransportClose, openMilitaryTabOnDeploymentClose, openResourcesTabOnTransportClose<br>`imperator/onglets/00-cadre-benedictions` : _impPopupProvider<br>`imperator/01-traducteur` : localizer<br>`imperator/historique-alertes` : impAlertHistoryOnChange, impAlertHistoryShow, impAlertHistoryStyles, impAlertHistoryUnread<br>`imperator/reglages` : showBuildingsOverview, showEspionageOverview, showMilitaryOverview, showResourceOverview |
| `imperator/initialisation` | registerLoggingEventHandlers, fireFakeKeyboardEvent, initQuickGoodsButtons, initBuildingDemolitionHandler, initTweaks, initAlerts, configureLocalization, initPirating … (11) | `ikatools/00-ouverture` : IkaTools<br>`imperator/01-traducteur` : localizer<br>`imperator/reglages` : autoAcceptDailyBonus, backgroundRefresh, buildingCompletionAlert_Desktop, deployArmyArrived_Desktop, deployArmyLoaded_Desktop, deployArmyReturned_Desktop, deployNavyArrived_Desktop, deployNavyReturned_Desktop, donationButtons, hideAds, hideChat, hideFacebook, hideFriendsBar, ignoredHostileMissions, impAsset, impNotify, initializeColonizationMissionsForPirateRaiding, localizedLanguage, pillageArrived_Desktop, pillageLoaded_Desktop, pillageReturned_Desktop, preventAccidentalColonyDestruction, showCityOwners, transportButtons, transportMissionArrived_Desktop, transportMissionLoaded_Desktop, transportMissionReturned_Desktop<br>`imperator/styles` : addStyles<br>`imperator/onglets/00-ouverture` : overviewTables<br>`imperator/composants` : addSettingsLink |
| `modules/debit-envoi` | – | `ikatools/00-ouverture` : IkaTools |
| `modules/capture-vues` | – | `ikatools/00-ouverture` : IkaTools |
| `modules/surlignage-ameliorations` | – | `ikatools/00-ouverture` : IkaTools |
| `modules/badge-experiences` | – | `ikatools/00-ouverture` : IkaTools |
| `99-demarrage` | – | `ikatools/00-ouverture` : IkaTools<br>`imperator/00-ouverture` : Imperator |

## Couches

1 base (garde-fous, constantes, briques IkaTools) → 2 modèle (empire, espionnage) → 3 façade IkaTools → 4 interface Imperator → 5 modules ajoutés. Un fichier n'utilise que sa couche ou les couches inférieures (aucun écart).

## Dépendances circulaires (0)

Aucune.

## Graphe

```mermaid
flowchart LR
  ikatools_02_utils["ikatools/02-utils"] --> ikatools_01_logging["ikatools/01-logging"]
  ikatools_02_utils["ikatools/02-utils"] --> ikatools_constants["ikatools/constants"]
  ikatools_03_intl["ikatools/03-intl"] --> ikatools_constants["ikatools/constants"]
  ikatools_04_view["ikatools/04-view"] --> ikatools_01_logging["ikatools/01-logging"]
  ikatools_04_view["ikatools/04-view"] --> ikatools_02_utils["ikatools/02-utils"]
  ikatools_05_data["ikatools/05-data"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_05_data["ikatools/05-data"] --> ikatools_01_logging["ikatools/01-logging"]
  ikatools_06_ui["ikatools/06-ui"] --> ikatools_01_logging["ikatools/01-logging"]
  ikatools_06_ui["ikatools/06-ui"] --> ikatools_02_utils["ikatools/02-utils"]
  ikatools_06_ui["ikatools/06-ui"] --> ikatools_constants["ikatools/constants"]
  ikatools_06_ui["ikatools/06-ui"] --> ikatools_07_settings["ikatools/07-settings"]
  ikatools_07_settings["ikatools/07-settings"] --> ikatools_05_data["ikatools/05-data"]
  ikatools_empire_00_armee["ikatools/empire/00-armee"] --> ikatools_02_utils["ikatools/02-utils"]
  ikatools_empire_00_armee["ikatools/empire/00-armee"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_empire_00_armee["ikatools/empire/00-armee"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_00_armee["ikatools/empire/00-armee"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_00_armee["ikatools/empire/00-armee"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_00_armee["ikatools/empire/00-armee"] --> ikatools_empire_00_types["ikatools/empire/00-types"]
  ikatools_empire_01_ville["ikatools/empire/01-ville"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_01_ville["ikatools/empire/01-ville"] --> ikatools_empire_00_armee["ikatools/empire/00-armee"]
  ikatools_empire_01_ville["ikatools/empire/01-ville"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_01_ville["ikatools/empire/01-ville"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_empire_01_ville["ikatools/empire/01-ville"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_01_ville["ikatools/empire/01-ville"] --> ikatools_02_utils["ikatools/02-utils"]
  ikatools_empire_01_ville["ikatools/empire/01-ville"] --> ikatools_empire_parseurs_aide_batiments["ikatools/empire/parseurs/aide-batiments"]
  ikatools_empire_01_ville["ikatools/empire/01-ville"] --> ikatools_empire_00_types["ikatools/empire/00-types"]
  ikatools_empire_02_civilisation_mouvements["ikatools/empire/02-civilisation-mouvements"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_02_civilisation_mouvements["ikatools/empire/02-civilisation-mouvements"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_empire_02_civilisation_mouvements["ikatools/empire/02-civilisation-mouvements"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_02_civilisation_mouvements["ikatools/empire/02-civilisation-mouvements"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_02_civilisation_mouvements["ikatools/empire/02-civilisation-mouvements"] --> ikatools_empire_00_types["ikatools/empire/00-types"]
  ikatools_empire_03_donnees["ikatools/empire/03-donnees"] --> ikatools_05_data["ikatools/05-data"]
  ikatools_empire_03_donnees["ikatools/empire/03-donnees"] --> ikatools_empire_00_types["ikatools/empire/00-types"]
  ikatools_empire_03_donnees["ikatools/empire/03-donnees"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_03_donnees["ikatools/empire/03-donnees"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_empire_03_evenements["ikatools/empire/03-evenements"] --> ikatools_02_utils["ikatools/02-utils"]
  ikatools_empire_parseurs_formulaires["ikatools/empire/parseurs/formulaires"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_empire_parseurs_formulaires["ikatools/empire/parseurs/formulaires"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_parseurs_formulaires["ikatools/empire/parseurs/formulaires"] --> ikatools_empire_02_civilisation_mouvements["ikatools/empire/02-civilisation-mouvements"]
  ikatools_empire_parseurs_formulaires["ikatools/empire/parseurs/formulaires"] --> ikatools_empire_00_armee["ikatools/empire/00-armee"]
  ikatools_empire_parseurs_formulaires["ikatools/empire/parseurs/formulaires"] --> ikatools_02_utils["ikatools/02-utils"]
  ikatools_empire_parseurs_formulaires["ikatools/empire/parseurs/formulaires"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_parseurs_formulaires["ikatools/empire/parseurs/formulaires"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_parseurs_armee["ikatools/empire/parseurs/armee"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_parseurs_armee["ikatools/empire/parseurs/armee"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_empire_parseurs_armee["ikatools/empire/parseurs/armee"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_parseurs_armee["ikatools/empire/parseurs/armee"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_parseurs_armee["ikatools/empire/parseurs/armee"] --> ikatools_empire_00_armee["ikatools/empire/00-armee"]
  ikatools_empire_parseurs_ville["ikatools/empire/parseurs/ville"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_parseurs_ville["ikatools/empire/parseurs/ville"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_empire_parseurs_ville["ikatools/empire/parseurs/ville"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_parseurs_ville["ikatools/empire/parseurs/ville"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_parseurs_ville["ikatools/empire/parseurs/ville"] --> ikatools_02_utils["ikatools/02-utils"]
  ikatools_empire_parseurs_finances["ikatools/empire/parseurs/finances"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_parseurs_finances["ikatools/empire/parseurs/finances"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_parseurs_finances["ikatools/empire/parseurs/finances"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_parseurs_sanctuaire["ikatools/empire/parseurs/sanctuaire"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_parseurs_sanctuaire["ikatools/empire/parseurs/sanctuaire"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_parseurs_amelioration["ikatools/empire/parseurs/amelioration"] --> ikatools_empire_parseurs_conseiller_militaire["ikatools/empire/parseurs/conseiller-militaire"]
  ikatools_empire_parseurs_amelioration["ikatools/empire/parseurs/amelioration"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_parseurs_aide_batiments["ikatools/empire/parseurs/aide-batiments"] --> ikatools_05_data["ikatools/05-data"]
  ikatools_empire_parseurs_aide_batiments["ikatools/empire/parseurs/aide-batiments"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_parseurs_conseiller_militaire["ikatools/empire/parseurs/conseiller-militaire"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_parseurs_conseiller_militaire["ikatools/empire/parseurs/conseiller-militaire"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_empire_parseurs_conseiller_militaire["ikatools/empire/parseurs/conseiller-militaire"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_parseurs_conseiller_militaire["ikatools/empire/parseurs/conseiller-militaire"] --> ikatools_empire_00_armee["ikatools/empire/00-armee"]
  ikatools_empire_parseurs_conseiller_militaire["ikatools/empire/parseurs/conseiller-militaire"] --> ikatools_empire_02_civilisation_mouvements["ikatools/empire/02-civilisation-mouvements"]
  ikatools_empire_parseurs_conseiller_militaire["ikatools/empire/parseurs/conseiller-militaire"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_02_utils["ikatools/02-utils"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_constants["ikatools/constants"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_parseurs_finances["ikatools/empire/parseurs/finances"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_parseurs_sanctuaire["ikatools/empire/parseurs/sanctuaire"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_01_ville["ikatools/empire/01-ville"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_01_logging["ikatools/01-logging"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_espionnage["ikatools/espionnage"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_parseurs_armee["ikatools/empire/parseurs/armee"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_parseurs_ville["ikatools/empire/parseurs/ville"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_parseurs_conseiller_militaire["ikatools/empire/parseurs/conseiller-militaire"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_parseurs_aide_batiments["ikatools/empire/parseurs/aide-batiments"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_parseurs_amelioration["ikatools/empire/parseurs/amelioration"]
  ikatools_empire_04_suivi["ikatools/empire/04-suivi"] --> ikatools_empire_parseurs_formulaires["ikatools/empire/parseurs/formulaires"]
  ikatools_espionnage["ikatools/espionnage"] --> ikatools_empire_00_armee["ikatools/empire/00-armee"]
  ikatools_espionnage["ikatools/espionnage"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_espionnage["ikatools/espionnage"] --> ikatools_constants["ikatools/constants"]
  ikatools_espionnage["ikatools/espionnage"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_espionnage["ikatools/espionnage"] --> ikatools_05_data["ikatools/05-data"]
  ikatools_espionnage["ikatools/espionnage"] --> ikatools_02_utils["ikatools/02-utils"]
  ikatools_empire_98_retour["ikatools/empire/98-retour"] --> ikatools_01_logging["ikatools/01-logging"]
  ikatools_empire_98_retour["ikatools/empire/98-retour"] --> ikatools_empire_04_suivi["ikatools/empire/04-suivi"]
  ikatools_empire_98_retour["ikatools/empire/98-retour"] --> ikatools_empire_02_civilisation_mouvements["ikatools/empire/02-civilisation-mouvements"]
  ikatools_empire_98_retour["ikatools/empire/98-retour"] --> ikatools_empire_03_donnees["ikatools/empire/03-donnees"]
  ikatools_empire_98_retour["ikatools/empire/98-retour"] --> ikatools_empire_03_evenements["ikatools/empire/03-evenements"]
  ikatools_empire_98_retour["ikatools/empire/98-retour"] --> ikatools_espionnage["ikatools/espionnage"]
  ikatools_98_retour["ikatools/98-retour"] --> ikatools_04_view["ikatools/04-view"]
  ikatools_98_retour["ikatools/98-retour"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  ikatools_98_retour["ikatools/98-retour"] --> ikatools_constants["ikatools/constants"]
  ikatools_98_retour["ikatools/98-retour"] --> ikatools_01_logging["ikatools/01-logging"]
  ikatools_98_retour["ikatools/98-retour"] --> ikatools_02_utils["ikatools/02-utils"]
  ikatools_98_retour["ikatools/98-retour"] --> ikatools_05_data["ikatools/05-data"]
  ikatools_98_retour["ikatools/98-retour"] --> ikatools_empire_00_ouverture["ikatools/empire/00-ouverture"]
  ikatools_98_retour["ikatools/98-retour"] --> ikatools_06_ui["ikatools/06-ui"]
  ikatools_98_retour["ikatools/98-retour"] --> ikatools_07_settings["ikatools/07-settings"]
  03_attente_donnees["03-attente-donnees"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_01_traducteur["imperator/01-traducteur"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_01_traducteur["imperator/01-traducteur"] --> imperator_localisations["imperator/localisations"]
  imperator_historique_alertes["imperator/historique-alertes"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_historique_alertes["imperator/historique-alertes"] --> 02_garde_fous["02-garde-fous"]
  imperator_historique_alertes["imperator/historique-alertes"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_reglages["imperator/reglages"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_reglages["imperator/reglages"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_reglages["imperator/reglages"] --> imperator_historique_alertes["imperator/historique-alertes"]
  imperator_reglages["imperator/reglages"] --> ikatools_empire_04_suivi["ikatools/empire/04-suivi"]
  imperator_composants["imperator/composants"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_composants["imperator/composants"] --> imperator_reglages["imperator/reglages"]
  imperator_composants["imperator/composants"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_composants["imperator/composants"] --> ikatools_empire_04_suivi["ikatools/empire/04-suivi"]
  imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"] --> imperator_composants["imperator/composants"]
  imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"] --> imperator_reglages["imperator/reglages"]
  imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"] --> 02_garde_fous["02-garde-fous"]
  imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_onglets_00_transports["imperator/onglets/00-transports"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_onglets_00_transports["imperator/onglets/00-transports"] --> imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"]
  imperator_onglets_00_transports["imperator/onglets/00-transports"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_onglets_ressources["imperator/onglets/ressources"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_onglets_ressources["imperator/onglets/ressources"] --> imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"]
  imperator_onglets_ressources["imperator/onglets/ressources"] --> imperator_composants["imperator/composants"]
  imperator_onglets_ressources["imperator/onglets/ressources"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_onglets_ressources["imperator/onglets/ressources"] --> imperator_onglets_recherche["imperator/onglets/recherche"]
  imperator_onglets_ressources["imperator/onglets/ressources"] --> imperator_onglets_00_transports["imperator/onglets/00-transports"]
  imperator_onglets_tableau_de_bord["imperator/onglets/tableau-de-bord"] --> imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"]
  imperator_onglets_tableau_de_bord["imperator/onglets/tableau-de-bord"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_onglets_tableau_de_bord["imperator/onglets/tableau-de-bord"] --> 02_garde_fous["02-garde-fous"]
  imperator_onglets_tableau_de_bord["imperator/onglets/tableau-de-bord"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_onglets_batiments["imperator/onglets/batiments"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_onglets_batiments["imperator/onglets/batiments"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_onglets_batiments["imperator/onglets/batiments"] --> imperator_composants["imperator/composants"]
  imperator_onglets_batiments["imperator/onglets/batiments"] --> imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"]
  imperator_onglets_batiments["imperator/onglets/batiments"] --> imperator_onglets_00_transports["imperator/onglets/00-transports"]
  imperator_onglets_armee["imperator/onglets/armee"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_onglets_armee["imperator/onglets/armee"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_onglets_armee["imperator/onglets/armee"] --> imperator_composants["imperator/composants"]
  imperator_onglets_armee["imperator/onglets/armee"] --> imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"]
  imperator_onglets_armee["imperator/onglets/armee"] --> imperator_onglets_00_transports["imperator/onglets/00-transports"]
  imperator_onglets_espionnage["imperator/onglets/espionnage"] --> 02_garde_fous["02-garde-fous"]
  imperator_onglets_espionnage["imperator/onglets/espionnage"] --> imperator_composants["imperator/composants"]
  imperator_onglets_espionnage["imperator/onglets/espionnage"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_onglets_espionnage["imperator/onglets/espionnage"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_onglets_espionnage["imperator/onglets/espionnage"] --> imperator_onglets_armee["imperator/onglets/armee"]
  imperator_onglets_espionnage["imperator/onglets/espionnage"] --> imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"]
  imperator_onglets_chantiers["imperator/onglets/chantiers"] --> imperator_onglets_00_transports["imperator/onglets/00-transports"]
  imperator_onglets_chantiers["imperator/onglets/chantiers"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_onglets_chantiers["imperator/onglets/chantiers"] --> imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"]
  imperator_onglets_boissons["imperator/onglets/boissons"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_onglets_boissons["imperator/onglets/boissons"] --> imperator_onglets_00_transports["imperator/onglets/00-transports"]
  imperator_onglets_boissons["imperator/onglets/boissons"] --> imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_onglets_ressources["imperator/onglets/ressources"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_onglets_batiments["imperator/onglets/batiments"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_onglets_armee["imperator/onglets/armee"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_onglets_espionnage["imperator/onglets/espionnage"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_onglets_tableau_de_bord["imperator/onglets/tableau-de-bord"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_onglets_chantiers["imperator/onglets/chantiers"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_onglets_boissons["imperator/onglets/boissons"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_onglets_00_transports["imperator/onglets/00-transports"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_onglets_00_cadre_benedictions["imperator/onglets/00-cadre-benedictions"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_historique_alertes["imperator/historique-alertes"]
  imperator_onglets_99_popup_menu["imperator/onglets/99-popup-menu"] --> imperator_reglages["imperator/reglages"]
  imperator_initialisation["imperator/initialisation"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  imperator_initialisation["imperator/initialisation"] --> imperator_01_traducteur["imperator/01-traducteur"]
  imperator_initialisation["imperator/initialisation"] --> imperator_reglages["imperator/reglages"]
  imperator_initialisation["imperator/initialisation"] --> imperator_styles["imperator/styles"]
  imperator_initialisation["imperator/initialisation"] --> imperator_onglets_00_ouverture["imperator/onglets/00-ouverture"]
  imperator_initialisation["imperator/initialisation"] --> imperator_composants["imperator/composants"]
  modules_debit_envoi["modules/debit-envoi"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  modules_capture_vues["modules/capture-vues"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  modules_surlignage_ameliorations["modules/surlignage-ameliorations"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  modules_badge_experiences["modules/badge-experiences"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  99_demarrage["99-demarrage"] --> ikatools_00_ouverture["ikatools/00-ouverture"]
  99_demarrage["99-demarrage"] --> imperator_00_ouverture["imperator/00-ouverture"]
```
