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

