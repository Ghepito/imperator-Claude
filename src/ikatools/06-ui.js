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
                        this._fitInViewport();
                    }
                },
                // v3.2 : une infobulle qui dépasserait le bas de la fenêtre s'affiche au-dessus du curseur
                _fitInViewport: function _fitInViewport() {
                    var y = this._lastPageY;
                    if (y === undefined) return;
                    // v3.4 : le contenu (classe tool_tip_container) est en position absolue ; la
                    // boîte qui le porte a donc une hauteur nulle : on mesure le contenu.
                    var height = Math.max(this.toolTipContainer.outerHeight() || 0,
                                          $(this.options.toolTipContainer).outerHeight() || 0);
                    var viewTop = window.pageYOffset || $(window).scrollTop() || 0;
                    var viewBottom = viewTop + (window.innerHeight || $(window).height());
                    if (y + this.options.offsetY + height > viewBottom) {
                        this.toolTipContainer.css('top',
                            Math.max(viewTop, y - height - 10) + 'px');
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
                        this._lastPageY = e.pageY;
                        this.toolTipContainer.css({
                            left: (e.pageX + this.options.offsetX) + 'px',
                            top: (e.pageY + this.options.offsetY) + 'px',
                        });

                        this.pendingShowEvent = setTimeout(Logging.debuggable(
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
                        this._lastPageY = e.pageY;
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
                        Logging.debuggable('IkaTools.TabPane.Tab.click',
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
                            resizePopup();
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

