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
                    debugOptions.label = Utils.nextId('_debuggable');
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

            /**
         * Allows logging options to be configured by browsing to various anchors
         * (and persisted for future page views).
         */
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
                setOptions(savedOptions.get());
            }

            return {
                debug: debug,
                debugException: debugException,
                debuggable: debuggable,
                time: time,
                group: group,
                setAndSaveOptionsFromPageAnchor: setAndSaveOptionsFromPageAnchor,
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

            function Value(key, defaultValue, options) {
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

            return {
                Value: Value,
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
                    }
                },
                _mouseOver: function _mouseOver(e) {
                    var toolTipElement = $(e.target).closest('.' + this.options.toolTipClass);
                    if (toolTipElement.get(0) == this.activeToolTipElement) {
                        return;
                    }

                    this._reset();

                    if (toolTipElement.length > 0) {
                        this.activeToolTipElement = toolTipElement[0];
                        this.toolTipContainer.css({
                            left: (e.pageX + this.options.offsetX) + 'px',
                            top: (e.pageY + this.options.offsetY) + 'px',
                        });

                        this.pendingShowEvent = setTimeout(IkaTools.Logging.debuggable(
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
                        IkaTools.Logging.debuggable('IkaTools.TabPane.Tab.click',
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
                            IkaTools.UI.resizePopup();
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

