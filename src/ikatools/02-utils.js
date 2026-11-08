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


