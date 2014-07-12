"use strict";

/*
 * version: 0.0.5
 * updated: 
 *  当 DOM Inspector 未安装时，如果查找的是 WEB 中的元素，将尝试：
 *      当安装装了 Firebug，将使用 Firebug 来定位元素的 DOM 位置；
 *      否则尝试通过 Firefox 自带的（仅支持 Firefox 17+）Inspector 来定位元素。
 * 
 * 0.0.7 By ywzhaiqi  需要 ff20+
 *     增加设置界面，可分别选择网页、主窗口的查看器，其它窗口需要 DOM Inspector。
 *     使用已经存在的查看器
 */

const log = function() { dump(Array.slice(arguments).join(' ') + '\n'); };
const trace = function(error) { log(error); log(error.stack); };

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/PopupNotifications.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/AddonManager.jsm");

// Cu.import("resource://gre/modules/devtools/Console.jsm");

const TYPE_FIREBUG = 0;
const TYPE_DEV_TOOLS = 1;
const TYPE_DOM_INSPECTOR = 2;


// library 来自 User Agent Overrider 扩展
const BrowserManager = (function() {

    const windowWatcher = Cc['@mozilla.org/embedcomp/window-watcher;1']
                             .getService(Ci.nsIWindowWatcher);

    const BROWSER_URI = 'chrome://browser/content/browser.xul';

    let listeners = [];

    let onload = function(event) {
        for (let listener of listeners) {
            let window = event.currentTarget;
            window.removeEventListener('load', onload);
            if (window.location.href !== BROWSER_URI) {
                return;
            }
            try {
                listener(window);
            } catch(error) {
                trace(error);
            }
        }
    };

    let observer = {
        observe: function(window, topic, data) {
            if (topic !== 'domwindowopened') {
                return;
            }
            window.addEventListener('load', onload);
        }
    };

    let run = function(func, uri) {
        let enumerator = windowWatcher.getWindowEnumerator();
        while (enumerator.hasMoreElements()) {
            let window = enumerator.getNext();
            if (window.location.href !== BROWSER_URI) {
                continue;
            }

            try {
                func(window);
            } catch(error) {
                trace(error);
            }
        }
    };

    let addListener = function(listener) {
        listeners.push(listener);
    };

    let removeListener = function(listener) {
        let start = listeners.indexOf(listener);
        if (start !== -1) {
            listeners.splice(start, 1);
        }
    };

    let initialize = function() {
        windowWatcher.registerNotification(observer);
    };

    let destory = function() {
        windowWatcher.unregisterNotification(observer);
        listeners = null;
    };

    initialize();

    let exports = {
        run: run,
        addListener: addListener,
        removeListener: removeListener,
        destory: destory,
    };
    return exports;
})();

/**
 * 调用自带的开发工具或 Firebug，ff20+
 */
var mInspector = function(){

    const mainWin = Services.wm.getMostRecentWindow("navigator:browser");

    let gDevTools = mainWin.gDevTools;
    let gBrowser = mainWin.gBrowser;

    let devtools = (function(){
        /*
         * 有这么变的吗，四个版本，变了三次地址！！！
         */
        let devtools = {};
        let version = Services.appinfo.version.split(".")[0];
        let DEVTOOLS_URI;
        if (version >= 24) {
            DEVTOOLS_URI = "resource://gre/modules/devtools/Loader.jsm";
            ({devtools} = Cu.import(DEVTOOLS_URI, {}));
        } else if (version < 24 && version >= 23) {
            DEVTOOLS_URI = "resource:///modules/devtools/gDevTools.jsm";
            ({devtools} = Cu.import(DEVTOOLS_URI, {}));
        } else if (version < 23 && version >= 20) {
            DEVTOOLS_URI = "resource:///modules/devtools/Target.jsm";
            devtools = Cu.import(DEVTOOLS_URI, {});
        }
        return devtools;
    })();

    let inspectWithDevtools = function (elem){
        let tt = devtools.TargetFactory.forTab(gBrowser.selectedTab);
        return gDevTools.showToolbox(tt, "inspector").then((function (elem) {
            return function(toolbox) {
                let inspector = toolbox.getCurrentPanel();
                inspector.selection.setNode(elem, "UC-Element-Inspector");
            }
        })(elem));
    };

    let inspectWithFirebug = function (elem){
        let Firebug = mainWin.Firebug;
        Firebug.browserOverlay.startFirebug(function(Firebug){
            Firebug.Inspector.inspectFromContextMenu(elem);
        });
    };

    let start = function(elem, useFirebug, checkExists){
        let Firebug = mainWin.Firebug;

        if (checkExists) {
            // 已经打开则直接启动
            if (Firebug && Firebug.isInitialized && Firebug.currentContext) {
                inspectWithFirebug(elem);
                return;
            } else { // 检测自带开发工具是否已经启动
                let target = devtools.TargetFactory.forTab(gBrowser.selectedTab);
                let toolbox = gDevTools.getToolbox(target);
                if (toolbox) {
                    inspectWithDevtools(elem);
                    return;
                }
            }
        }

        // 没有打开则启动
        if (useFirebug && Firebug) {
            inspectWithFirebug(elem);
        } else {
            inspectWithDevtools(elem);
        }
    };

    return {
        start: start,
        inspectWithDevtools: inspectWithDevtools,
        inspectWithFirebug: inspectWithFirebug
    };
};


var InspectElement = {
    hasDOMInspector: false,
    contentType: TYPE_FIREBUG,
    mainWinType: TYPE_DOM_INSPECTOR,
    checkExists: true,  // 如果 Firebug 或自带查看器已经在使用，则不会打开新的查看器。

    ww: Services.ww,       // nsIWindowWatcher
    wm: Services.wm,       // nsIWindowMediator

    get isWinNT() {
        delete this.isWinNT;
        var os = Services.appinfo.OS;
        return this.isWinNT = (os == "WINNT" ? true : false);
    },
    get mainWin() {
        delete this.mainWin;
        return this.mainWin = Services.wm.getMostRecentWindow("navigator:browser");
    },
    get prefs() {
        delete this.prefs;
        return this.prefs = Services.prefs.getBranch("extensions.InspectElement.");
    },
    get mInspector() {
        delete this.mInspector;
        return this.mInspector = mInspector();
    },

    handleEvent: function(e) {
        // Shift + 右键 响应
        if (!e.shiftKey || e.button != 2) return;
        e.stopPropagation();
        e.preventDefault();
        if (e.type != "click") return;

        let elem = e.originalTarget,
            win = e.currentTarget,
            elemWin = elem.ownerDocument.defaultView,
            iType;

        switch(true) {
            case elemWin == this.mainWin.content: // 网页
                iType = this.contentType;
                break;
            case elemWin == this.mainWin: // 主窗口
                iType = this.mainWinType;
                break;
            default:
                iType = TYPE_DOM_INSPECTOR;
                break;
        }

        if (iType == TYPE_DOM_INSPECTOR && this.hasDOMInspector) {
            win.openDialog("chrome://inspector/content/", "_blank",
                           "chrome, all, dialog=no", elem);
            return;
        }

        let forceUseFirebug = (iType == TYPE_FIREBUG);
        try {
            this.mInspector.start(e.target, forceUseFirebug, this.checkExists);
        } catch (ex) {
            this.error();
        }

        this.closePopup(elem, win);
    },
    closePopup: function (elem, win) {
        var parent = elem.parentNode;
        var list = [];
        while (parent != win && parent != null) {
            if (parent.localName == "menupopup" || parent.localName == "popup") {
                list.push(parent);
            }
            parent = parent.parentNode;
        }
        var len = list.length;
        if (!len) return;
        list[len - 1].hidePopup();
    },

    aListener: {
        onOpenWindow: function (aWindow) {
            var win = aWindow.docShell.QueryInterface(
                      Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
            win.addEventListener("load", function _() {
                this.removeEventListener("load", _, false);
                win.addEventListener("click", InspectElement, true);
                // fix context menu bug in linux
                if (InspectElement.isWinNT) return;
                //win.addEventListener("mousedown", InspectElement, true);
                win.addEventListener("mouseup", InspectElement, false);
                win.addEventListener("contextmenu", InspectElement, true);
            }, false);
        },
        onCloseWindow: function (aWindow) {},
        onWindowTitleChange: function (aWindow, aTitle) {},
    },

    startup: function () {
        this.wm.addListener(this.aListener);
        var cw = this.ww.getWindowEnumerator();
        while (cw.hasMoreElements()) {
            var win = cw.getNext().QueryInterface(Ci.nsIDOMWindow);
            win.addEventListener("click", InspectElement, true);
            // fix context menu bug in linux
            if (this.isWinNT) continue;
            //win.addEventListener("mousedown", InspectElement, true);
            win.addEventListener("mouseup", InspectElement, false);
            win.addEventListener("contextmenu", InspectElement, true);
        }
        var that = this;
        var timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
        timer.initWithCallback(function () {
            AddonManager.getAllAddons(function (addons) {
                for (let i in addons) {
                    if (addons[i].id == "inspector@mozilla.org" && addons[i].isActive) {
                        that.hasDOMInspector = true;
                        break;
                    }
                }
            });
        }, 500, Ci.nsITimer.TYPE_ONE_SHOT);


        let addMenuitem = this.addMenuitem.bind(this);
        BrowserManager.run(addMenuitem);
        BrowserManager.addListener(addMenuitem);

        this.loadSetting();
        this.prefs.addObserver('', this, false);
    },
    shutdown: function () {
        this.wm.removeListener(this.aListener);
        var cw = this.ww.getWindowEnumerator();
        while (cw.hasMoreElements()) {
            var win = cw.getNext().QueryInterface(Ci.nsIDOMWindow);
            win.removeEventListener("click", InspectElement, true);
            if (this.isWinNT) continue;
            //win.removeEventListener("mousedown", InspectElement, true);
            win.removeEventListener("mouseup", InspectElement, false);
            win.removeEventListener("contextmenu", InspectElement, true);
        }

        BrowserManager.run(this.removeMenuitem);
        BrowserManager.destory();

        this.prefs.removeObserver('', this, false);
    },

    addMenuitem: function(window) {
        let document = window.document;
        let menuitem = document.createElement('menuitem');
        menuitem.setAttribute('id', 'InspectElement-menuitem');
        menuitem.setAttribute('label', 'Inspect Element Setting');
        menuitem.addEventListener('command', this.openPref.bind(this), false);

        let ins = document.getElementById('devToolsEndSeparator');
        ins.parentNode.insertBefore(menuitem, ins);
    },
    removeMenuitem: function(window) {
        let document = window.document;
        let menuitem = document.getElementById("InspectElement-menuitem");
        if (menuitem)
            menuitem.parentNode.removeChild(menuitem);
    },
    loadSetting: function() {
        try {
            this.contentType = this.prefs.getIntPref('contentType');
            this.mainWinType = this.prefs.getIntPref('mainWinType');
            this.checkExists = this.prefs.getBoolPref('checkExists');
        } catch(ex) {
            this.prefs.setIntPref('contentType', this.contentType);
            this.prefs.setIntPref('mainWinType', this.mainWinType);
            this.prefs.setBoolPref('checkExists', this.checkExists);
        }
    },
    openPref: function() {
        this.mainWin.openDialog(
            'chrome://InspectElement/content/options.xul',
            'chrome,titlebar,toolbar,centerscreen,dialog=no');
    },

    observe: function (subject, topic, data) {
        if (topic == 'nsPref:changed') {
            switch(data) {
                case 'contentType':
                case 'mainWinType':
                    this[data] = this.prefs.getIntPref(data);
                    break;
                case 'checkExists':
                    this.checkExists = this.prefs.getBoolPref('checkExists');
                    break;
            }
        } else if (topic == "alertclickcallback" && data == "link") {
            var win = this.wm.getMostRecentWindow("navigator:browser");
            var url = 'https://addons.mozilla.org/en-US/firefox/addon/dom-inspector-6622/';
            if (win && win.gBrowser) {
                win.gBrowser.loadOneTab(url, null, null, null, false, false);
            } else {
                this.ww.openWindow(win ? win : null, url, win.name, null, null);
            }
        }
    },
    error: function () {
        var et = "The addon require DOM Inspector! " + 
                 "Please install or enable the addon.";
        var as = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
        as.showAlertNotification("chrome://global/skin/icons/Error.png",
                                 "Error:", et, true, "link", this,
                                 "InspectElementError"); 
        return;
    }
}

// 启用
function startup(data, reason) {
    InspectElement.startup();
}

// 禁用或应用程序退出
function shutdown(data, reason) {
    InspectElement.shutdown();
}

// 安装
function install(data, reason) {
}

// 卸载
function uninstall(data, reason) {
}
