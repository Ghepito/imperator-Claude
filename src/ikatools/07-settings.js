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

