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


        const menuConfigurations = [
            { condition: showResourceOverview.isEnabled(), content: leftMenuResourceContent },
            { condition: showBuildingsOverview.isEnabled(), content: leftMenuBuildingsContent },
            { condition: showMilitaryOverview.isEnabled(), content: leftMenuArmyContent },
            { condition: showEspionageOverview.isEnabled(), content: leftMenuEspionageContent }
        ];

        const menuItems = menuConfigurations
        .filter(config => config.condition)
        .map(config => new IkaTools.UI.LeftMenu.Item(config.content));

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
