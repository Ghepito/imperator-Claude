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

            return {
                Value: Value,
                listValues: function listValues() { return _impValues.slice(); }, // v2.36
            };
        }();

