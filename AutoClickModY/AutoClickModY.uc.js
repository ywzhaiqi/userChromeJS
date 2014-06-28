//==UserScript==
// @name         AutoClickModY.uc.js
// @description  鼠标悬停打开链接（站外链接除外）,工具菜单开启或鼠标手势调用
// @author       ywzhaiqi
// @include      main
// @charset      utf-8
// @version      1.2
// @downloadURL  https://raw.github.com/ywzhaiqi/userChromeJS/master/AutoClickModY/AutoClickModY.uc.js
// @homepageURL  https://github.com/ywzhaiqi/userChromeJS/tree/master/AutoClickModY
// @note         第一次需要从定制面板中拖出
// @note         当按着 Ctrl 键时，后台打开
//==/UserScript==

(function(){

    // 请不要在这里更改，更改在图标右键打开的设置里。
    var
        BUTTON_TYPE = 1,  // 0：地址栏按钮，1：可移动按钮，2：菜单
        ENABLE = true,
        hovering_time = 500,  // 悬停的时间（毫秒）
        clicked_elem = 'a, input, button',
        clicked_parent_elem = 'b, i, img, span, small, strong, em, big, sub, sup, s, font',
        ON_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABSUlEQVQ4jY3TvUvXURTH8Rf5lE0i6KCCEIiJiyS0uEViGLqE+Ngk6CCC/4EPOPhAgu1JQWtQLeIDLuoqrppDihC02JQ/QdTh3uDL9Wt24MPl3nvO+55z7z3QiFeoxja6BGtAHyYwjKcok2OdOIzOb9GNSRyhgEscx/kHPEkB1ehFE2rxFVe4jiqgHy+xhX20ZgE7WMZDLGUCs4D26FuFz9hE5V9AF56hBT/vAUAzvmMgLWU0JzgP8ACf8D4FzP4nAKawKnmVuTsAFxhCHerjuIgN4d5uAQqJznGCg4zOsJYCFrGLjphyVh0ZvcBHrKeA6UgtTS8nx+aF/1KSXeyJ6T2+J/iRUP9culGDPcwIT3WXvcYPtOVtvsEpxiT1oUj4zodYQHEeoATj8YRvGBGabRArQlO9Q8U/MlSE5/iCX/iD30KrD6I863wDIuZiYI4xbYAAAAAASUVORK5CYII=',
        OFF_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABHElEQVQ4jYXTuy6EURiF4SfMxKESiU6ilegotSYmWpVD5wZcgtLQTU9ItAqVGBONG9A6FLgBKodEobCKPb9hVrKzstf37pXs/0B/jWAeW9iOzycfqFkc4QFP+Io/JJ/97/ACbnCFJtbwEW8mvwn3S5Po4hRTyRopaGQ/lXk3fI/WcY+5IqsWyPw+fI8OcIKhAQVD4Q6qBefYqWT9CoQ7V7yVUVxiH9OYiW/iM17m++FHy4ILvOC2WM94j5f5S/iegg6OsYTlYjUq+6VwnbKgjjO0qg/mD7XC18twN/caH3B4PNxudbCIR6wOKFgNt1gd1LCHOz+f7XBlPpz8LlytX/sE2n5+nkNsYCV+mLwd7k+N5cA1XvEWv04+VsLfWidJd1JzB90AAAAASUVORK5CYII='
    ;

    if (window.AutoClick) {
        window.AutoClick.uninit();
        delete window.AutoClick;
    }

    window.AutoClick = {
        get prefs() {
            delete this.prefs;
            return this.prefs = Services.prefs.getBranch("userChromeJS.AutoClick.")
        },
        get BUTTON_TYPE() BUTTON_TYPE,
        set BUTTON_TYPE(num) {
            if (!this.isFirstRun && BUTTON_TYPE === num) return;

            BUTTON_TYPE = num;
            this.prefs.setIntPref('BUTTON_TYPE', BUTTON_TYPE);
            this.rebuildButton();
            this.updateState(ENABLE);
        },
        get enable() ENABLE,
        set enable(bool) {
            bool = !!bool;
            if (!this.isFirstRun && ENABLE === bool) return;

            this.prefs.setBoolPref('enable', ENABLE = bool);
            this.updateState(bool);
        },
        get hovering_time() hovering_time,
        set hovering_time(num) {
            if (hovering_time == num) return;

            hovering_time = num;
            this.prefs.setIntPref('hovering_time', hovering_time);
        },
        get default_prefs() {
            return {
                clicked_elem: clicked_elem,
                clicked_parent_elem: clicked_parent_elem
            }
        },
        set clicked_elem(str) {
            this.clicked_elems = str.split(',').map(function(x) x.trim() )
        },
        set clicked_parent_elem(str) {
            this.clicked_parent_elems = str.split(',').map(function(x) x.trim() )
        },

        init: function() {
            this.isFirstRun = true;
            this.loadSetting();

            gBrowser.mPanelContainer.addEventListener('mouseover', this, false);
            gBrowser.mPanelContainer.addEventListener('mouseout', this, false);
            gBrowser.mPanelContainer.addEventListener('keydown', this, false);
            gBrowser.mPanelContainer.addEventListener('keyup', this, false);
            this.prefs.addObserver('', this, false);

            this.isFirstRun = false;
        },
        uninit: function() {
            this.removeButton();

            gBrowser.mPanelContainer.removeEventListener('mouseover', this, false);
            gBrowser.mPanelContainer.removeEventListener('mouseout', this, false);
            gBrowser.mPanelContainer.removeEventListener('keydown', this, false);
            gBrowser.mPanelContainer.removeEventListener('keyup', this, false);
            this.prefs.removeObserver('', this, false);
        },
        loadSetting: function(type) {  // 载入设置并执行相应的任务
            if (!type || type === 'BUTTON_TYPE') {
                this.BUTTON_TYPE = this.prefs.prefHasUserValue('BUTTON_TYPE') ?
                        this.prefs.getIntPref('BUTTON_TYPE') :
                        this.BUTTON_TYPE;
            }

            if (!type || type === 'enable') {
                this.enable = this.prefs.prefHasUserValue('enable') ?
                        this.prefs.getBoolPref('enable') :
                        this.enable;
            }

            if (!type || type === 'hovering_time') {
                this.hovering_time = this.prefs.prefHasUserValue('hovering_time') ?
                        this.prefs.getIntPref('hovering_time') :
                        this.hovering_time;
            }

            if (!type || type === 'clicked_elem') {
                if (this.prefs.prefHasUserValue('clicked_elem')) {
                    this.clicked_elem = this.prefs.getCharPref('clicked_elem');
                } else {
                    this.prefs.setCharPref('clicked_elem', this.clicked_elem = clicked_elem);
                }
            }

            if (!type || type === 'clicked_parent_elem') {
                if (this.prefs.prefHasUserValue('clicked_parent_elem')) {
                    this.clicked_parent_elem = this.prefs.getCharPref('clicked_parent_elem');
                } else {
                    this.prefs.setCharPref('clicked_parent_elem', this.clicked_parent_elem = clicked_parent_elem);
                }
            }
        },
        removeButton: function() {
            if (this.menuitem) {
                this.menuitem.parentNode.removeChild(this.menuitem);
                this.menuitem = null;
            }

            if (this.button) {
                this.button.parentNode.removeChild(this.button);
                this.button = null;
            }

            if (this.style) {
                this.style.parentNode.removeChild(this.style);
                this.style = null;
            }
        },
        rebuildButton: function() {
            this.removeButton();

            if (BUTTON_TYPE === 2) {
                let menuitem = $C('menuitem', {
                    id: 'AutoClick-enable-menuitem',
                    class: 'menuitem-iconic',
                    type: 'checkbox',
                    autocheck: "false",
                    checked: AutoClick.enable,
                    tooltiptext: '自动点击开/关',
                    onclick: 'AutoClick.iconClick(event);',
                });

                let insPos = $('devToolsSeparator');
                insPos.parentNode.insertBefore(menuitem, insPos);
                this.menuitem = menuitem;
            } else {
                let button = $C('toolbarbutton', {
                    id: "AutoClick-icon",
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    tooltiptext: "自动点击开/关",
                    onclick: "AutoClick.iconClick(event);",
                    // context: "AutoClick-popup",
                });

                if (BUTTON_TYPE === 1) {
                    ToolbarManager.addWidget(window, button, true);
                } else {
                    $('urlbar-icons').appendChild(button);
                }

                this.button = button;

                let css = '\
                    #AutoClick-icon {\
                        -moz-appearance: none !important;\
                        border-style: none !important;\
                        border-radius: 0 !important;\
                        padding: 0 0 !important;\
                        margin: 0 3px !important;\
                        background: transparent !important;\
                        box-shadow: none !important;\
                        -moz-box-align: center !important;\
                        -moz-box-pack: center !important;\
                        min-width: 18px !important;\
                        min-height: 18px !important;\
                        width: 24px;\
                    }\
                    #AutoClick-icon > .toolbarbutton-icon {\
                        max-width: 18px !important;\
                        padding: 0 !important;\
                        margin: 0 !important;\
                        border: 0 !important;\
                        background-image: none !important;\
                        background-color: transparent !important;\
                        box-shadow: none !important;\
                        -moz-transition: none !important;\
                    }\
                    #AutoClick-icon dropmarker { display:none; }\
                ';

                this.style = addStyle(css);
            }
        },
        updateState: function(enable, isTmpDisable) {
            let preLabel = isTmpDisable ? '临时' : '',
                label = 'AutoClick 已' + preLabel + (enable ? '启用' : '停用');

            if (this.button) {
                this.button.style.listStyleImage = 'url(' + (enable ? ON_IMG : OFF_IMG) + ')';
                this.button.setAttribute('tooltiptext', label);
            } else if (this.menuitem) {
                this.menuitem.setAttribute('checked', enable);
                this.menuitem.setAttribute('label', label);
            }

            XULBrowserWindow.statusTextField.label = label;
        },
        handleEvent: function(event) {
            if (!this.enable) return;

            switch(event.type) {
                case 'mouseover':
                    if (!this.tmpDisable)
                        this.mouseover(event);
                    break;
                case 'mouseout':
                    if (!this.tmpDisable)
                        this.mouseout(event);
                    break;
                case 'keydown':
                    if (event.keyCode === 17) {  // Ctrl_L
                        this.ctrlKey = true;
                    }
                    break;
                case 'keyup':
                    if (event.keyCode === 17) {
                        this.ctrlKey = false;
                    }
                    break;
                // case 'keypress':
                //     if (event.keyCode === 18) {  // Alt_L
                //         this.tmpDisable = !this.tmpDisable;
                //         this.updateState(!this.tmpDisable, this.tmpDisable);
                //     }
                    break;
            }
        },
        observe: function(aSubject, aTopic, aData){
            if (aTopic == 'nsPref:changed') {
                switch(aData) {
                    case 'BUTTON_TYPE':
                    case 'enable':
                    case 'hovering_time':
                    case 'clicked_elem':
                    case 'clicked_parent_elem':
                        this.loadSetting(aData);
                        break;
                }
            }
        },
        mouseover: function(event) {
            var elem = this.findLink(event.target);
            if (elem) {
                this.timeoutID = setTimeout(function() {
                    AutoClick.click(elem, event.view);
                }, this.hovering_time);
            }
        },
        mouseout: function(event) {
            if (this.timeoutID) {
                clearTimeout(this.timeoutID);
                this.timeoutID = null;
            }
        },
        findLink: function(node) {
            var selector = node.nodeName.toLowerCase();
            // if (node.id) {
            //     selector += '#' + node.id;
            // }

            // var classNames = node.getAttribute('class');
            // if (classNames) {
            //     selector += '.' + classNames.trim().replace(/\s+/ig, '.');
            // }

            var match = function(list) {
                return list.some(function(x) selector === x );
            };

            if (match(this.clicked_elems)) {
                return node;
            } else if (match(this.clicked_parent_elems)) {
                var parent = node.parentNode;
                return parent && this.findLink(parent);
            }

            return null;
        },
        click: function(element, win) {
            let doc = win.document,
                e = doc.createEvent('MouseEvents');
            e.initMouseEvent('click', true, true, win, 0,
                0, 0, 0, 0, this.ctrlKey, false, false, false, 0, element);
            return !element.dispatchEvent(e);
        },
        iconClick: function(event) {
            if (event.button === 0) {
                this.enable = !this.enable;
            } else {
                this.openPref();

                event.preventDefault();
                event.stopPropagation();
            }
        },
        openPref: function() {
            let xul = '<?xml version="1.0"?>\
                <?xml-stylesheet href="chrome://global/skin/" type="text/css"?>\
                \
                <prefwindow\
                    xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"\
                    id="AutoClick"\
                    windowtype="AutoClick:Preferences">\
                <prefpane id="main" flex="1">\
                \
                    <preferences>\
                        <preference id="hovering_time" type="int" name="userChromeJS.AutoClick.hovering_time"/>\
                        <preference id="BUTTON_TYPE" type="int" name="userChromeJS.AutoClick.BUTTON_TYPE"/>\
                        <preference id="clicked_elem" type="string" name="userChromeJS.AutoClick.clicked_elem"/>\
                        <preference id="clicked_parent_elem" type="string" name="userChromeJS.AutoClick.clicked_parent_elem"/>\
                    </preferences>\
                \
                    <hbox>\
                        <label value="悬停的时间：" />\
                        <textbox size="10" preference="hovering_time" />\
                        <label value="毫秒" />\
                    </hbox>\
                    <hbox>\
                        <label value="按钮的类型：" />\
                        <menulist preference="BUTTON_TYPE">\
                          <menupopup>\
                            <menuitem label="地址栏按钮" value="0"/>\
                            <menuitem label="可移动按钮" value="1"/>\
                            <menuitem label="菜单" value="2"/>\
                          </menupopup>\
                        </menulist>\
                    </hbox>\
                    <label value="点击的节点名：" />\
                    <textbox id="clicked_elem" flex="1" preference="clicked_elem" multiline="true" rows="3" />\
                    <label value="需要查找父元素的节点名：" />\
                    <textbox flex="1" id="clicked_parent_elem" preference="clicked_parent_elem" \
                        multiline="true" rows="3" />\
                    <button label="重置" onclick="reset();" tooltiptext="重置上面2个设置为默认值" />\
                \
                </prefpane>\
                <script>\
                    function reset() {\
                        $("clicked_elem").value = opener.AutoClick.default_prefs.clicked_elem;\
                        $("clicked_parent_elem").value = opener.AutoClick.default_prefs.clicked_parent_elem;\
                    }\
                    function $(id) document.getElementById(id); \
                </script>\
                </prefwindow>\
                ';

            window.openDialog(
                "data:application/vnd.mozilla.xul+xml;charset=UTF-8," + encodeURIComponent(xul), '',
                'chrome,titlebar,toolbar,centerscreen,dialog=no');
        },
    };

    // 来自 User Agent Overrider 扩展
    const ToolbarManager = (function() {

        /**
         * Remember the button position.
         * This function Modity from addon-sdk file lib/sdk/widget.js, and
         * function BrowserWindow.prototype._insertNodeInToolbar
         */
        let layoutWidget = function(document, button, isFirstRun) {

            // Add to the customization palette
            let toolbox = document.getElementById('navigator-toolbox');
            toolbox.palette.appendChild(button);

            // Search for widget toolbar by reading toolbar's currentset attribute
            let container = null;
            let toolbars = document.getElementsByTagName('toolbar');
            let id = button.getAttribute('id');
            for (let i = 0; i < toolbars.length; i += 1) {
                let toolbar = toolbars[i];
                if (toolbar.getAttribute('currentset').indexOf(id) !== -1) {
                    container = toolbar;
                }
            }

            // if widget isn't in any toolbar, default add it next to searchbar
            if (!container) {
                if (isFirstRun) {
                    container = document.getElementById('nav-bar');
                } else {
                    return;
                }
            }

            // Now retrieve a reference to the next toolbar item
            // by reading currentset attribute on the toolbar
            let nextNode = null;
            let currentSet = container.getAttribute('currentset');
            let ids = (currentSet === '__empty') ? [] : currentSet.split(',');
            let idx = ids.indexOf(id);
            if (idx !== -1) {
                for (let i = idx; i < ids.length; i += 1) {
                    nextNode = document.getElementById(ids[i]);
                    if (nextNode) {
                        break;
                    }
                }
            }

            // Finally insert our widget in the right toolbar and in the right position
            container.insertItem(id, nextNode, null, false);

            // Update DOM in order to save position
            // in this toolbar. But only do this the first time we add it to the toolbar
            if (ids.indexOf(id) === -1) {
                container.setAttribute('currentset', container.currentSet);
                document.persist(container.id, 'currentset');
            }
        };

        let addWidget = function(window, widget, isFirstRun) {
            try {
                layoutWidget(window.document, widget, isFirstRun);
            } catch(error) {
                console.log(error);
            }
        };

        let removeWidget = function(window, widgetId) {
            try {
                let widget = window.document.getElementById(widgetId);
                widget.parentNode.removeChild(widget);
            } catch(error) {
                console.log(error);
            }
        };

        let exports = {
            addWidget: addWidget,
            removeWidget: removeWidget,
        };
        return exports;
    })();


    function $(id, doc) (doc || document).getElementById(id);

    function $C(name, attr) {
        var el = document.createElement(name);
        if (attr) {
            Object.keys(attr).forEach(function(n) {
                if (typeof attr[n] === 'function') {
                    el.addEventListener(n, attr[n], false);
                } else {
                    el.setAttribute(n, attr[n]);
                }
            });
        }
        return el;
    }

    function addStyle(css) {
        var pi = document.createProcessingInstruction(
            'xml-stylesheet',
            'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
        );
        return document.insertBefore(pi, document.documentElement);
    }


    AutoClick.init();
})()