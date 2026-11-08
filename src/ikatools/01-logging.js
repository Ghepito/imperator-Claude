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

