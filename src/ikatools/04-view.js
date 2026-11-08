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

            function getCurrentCity() {
                var id = getCurrentCityId();
                return id ? EmpireData.getCity(id) : null;
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

