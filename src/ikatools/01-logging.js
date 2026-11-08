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

