//==UserScript==
// @name         AutoClickModY.uc.js
// @description  鼠标悬停打开链接（站外链接除外）,工具菜单开启或鼠标手势调用
// @author       ywzhaiqi
// @include      main
// @charset      utf-8
// @version      1.0
// @downloadURL  https://raw.github.com/ywzhaiqi/userChromeJS/master/AutoClickModY/AutoClickModY.uc.js
// @homepageURL  https://github.com/ywzhaiqi/userChromeJS/tree/master/AutoClickModY
// @note         当按着 Ctrl 键时，后台打开
//==/UserScript==

(function(){

    var ENABLE = true;

    if (window.AutoClick) {
        window.AutoClick.uninit();
        delete window.AutoClick;
    }

    window.AutoClick = {
        hoveringTime: 500, // 悬停的时间（毫秒）

        get prefs() {
            delete this.prefs;
            return this.prefs = Services.prefs.getBranch("userChromeJS.AutoClick.")
        },
        get enable() ENABLE,
        set enable(bool) {
            ENABLE = !!bool;

            // 存储设置
            this.prefs.setBoolPref('enable', ENABLE);
            this.updateMenuItem(ENABLE);
        },

        init: function() {
            var menuitem = $C('menuitem', {
                id: 'AutoClick-enable-menuitem',
                class: 'menuitem-iconic',
                type: 'checkbox',
                autocheck: "false",
                checked: AutoClick.enable,
                tooltiptext: '自动点击开/关',
                onclick: 'AutoClick.enable = !AutoClick.enable;',
            });

            // 插入
            var insPos = document.getElementById('devToolsSeparator');
            insPos.parentNode.insertBefore(menuitem, insPos);
            this.menuitem = menuitem;

            // 载入设置并更新菜单的状态
            this.enable = this.prefs.prefHasUserValue('enable') ?
                    this.prefs.getBoolPref('enable') :
                    this.enable;

            gBrowser.mPanelContainer.addEventListener('mouseover', this, false);
            gBrowser.mPanelContainer.addEventListener('mouseout', this, false);
            gBrowser.mPanelContainer.addEventListener('keydown', this, false);
            gBrowser.mPanelContainer.addEventListener('keyup', this, false);
        },
        uninit: function() {
            if (this.menuitem) {
                this.menuitem.parentNode.removeChild(this.menuitem);
            }

            gBrowser.mPanelContainer.removeEventListener('mouseover', this, false);
            gBrowser.mPanelContainer.removeEventListener('mouseout', this, false);
            gBrowser.mPanelContainer.removeEventListener('keydown', this, false);
            gBrowser.mPanelContainer.removeEventListener('keyup', this, false);
        },
        updateMenuItem: function(enable) {
            let label = enable ? 'AutoClick 已启用' : 'AutoClick 已停用';

            let menuitem = this.menuitem;
            menuitem.setAttribute('checked', enable);
            menuitem.setAttribute('label', label);

            XULBrowserWindow.statusTextField.label = label;

            if (window.dactyl) {
                dactyl.echo(label);
            }
        },
        handleEvent: function(event) {
            if (!this.enable) return;

            switch(event.type) {
                case 'mouseover':
                    var elem = this.findLink(event.target, true);
                    if (elem) {
                        this.timeoutID = setTimeout(function() {
                            console.log(event);
                            AutoClick.click(elem, event.view);
                        }, this.hoveringTime);
                    }
                    break;
                case 'mouseout':
                    if (this.timeoutID) {
                        clearTimeout(this.timeoutID);
                        this.timeoutID = null;
                    }
                    break;
                case 'keydown':
                    if (event.keyCode === 17) {  // Ctrl
                        this.ctrlKey = true;
                    }
                    break;
                case 'keyup':
                    if (event.keyCode === 17) {  // Ctrl
                        this.ctrlKey = false;
                    }
                    break;
            }
        },
        findLink: function(element, findParent) {
            switch (element.tagName) {
                case 'A':
                case 'IMG':
                    return element;
                case 'INPUT':
                case 'BUTTON':
                    return element;

                case 'B': case 'I': case 'SPAN': case 'SMALL':
                case 'STRONG': case 'EM': case 'BIG': case 'SUB':
                case 'SUP': case 'S':
                case 'FONT':
                    if (findParent) {
                        var parent = element.parentNode;
                        return parent && this.findLink(parent);
                    }
            }

            return null;
        },
        click: function(element, win) {
            let doc = win.document,
                e = doc.createEvent('MouseEvents');
            e.initMouseEvent('click', true, true, win, 0,
                0, 0, 0, 0, this.ctrlKey, false, false, false, 0, element);
            return !element.dispatchEvent(e);
        }
    };

    AutoClick.init();

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
})()