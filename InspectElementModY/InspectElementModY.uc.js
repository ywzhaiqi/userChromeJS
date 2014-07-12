// ==UserScript==
// @name            Element Inspector ModY
// @namespace       inspectElement@zbinlin
// @description     shift + 右键 在 DOM Inspector 中查找并定位到相应的元素节点
// @include         main
// @author          ywzhaiqi && zbinlin（原作者）
// @homepage        http://mozcp.com
// @version         0.6
// @charset         UTF-8
// @compatibility   Firefox 20
// @note            改自扩展 0.0.6，增加设置，可选择网页、主窗口的查看器。
// ==/UserScript==

(function(){

"use strict";

/*
 *  当 DOM Inspector 未安装时，如果查找的是 WEB 中的元素，将尝试：
 *      当安装装了 Firebug，将使用 Firebug 来定位元素的 DOM 位置；
 *      否则尝试通过 Firefox 自带的（仅支持 Firefox 17+）Inspector 来定位元素。
 */


if (window.InspectElement) {
    window.InspectElement.shutdown();
    delete window.InspectElement;
}

if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");
if (!window.AddonManager) Cu.import("resource://gre/modules/AddonManager.jsm");

const TYPE_FIREBUG = 0;
const TYPE_DEV_TOOLS = 1;
const TYPE_DOM_INSPECTOR = 2;

window.InspectElement = {
    hasDOMInspector: false,
    ww: Services.ww,       // nsIWindowWatcher
    wm: Services.wm,       // nsIWindowMediator
    contentType: TYPE_FIREBUG,
    mainWinType: TYPE_DOM_INSPECTOR,
    checkExists: true,  // 如果 Firebug 或自带查看器已经在使用，则不会打开新的查看器。

    get isWinNT() {
        var os = Services.appinfo.OS;
        return os == "WINNT" ? true : false;
    },
    get prefs() {
        delete this.prefs;
        return this.prefs = Services.prefs.getBranch("userChromeJS.InspectElement.");
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
            case elemWin == content: // 网页
                iType = this.contentType;
                break;
            case elemWin == window: // 主窗口
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
            mInspector.start(e.target, forceUseFirebug, this.checkExists);
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

        this.addMenuitem();

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

        let menuitem = document.getElementById("InspectElement-menuitem");
        if (menuitem)
            menuitem.parentNode.removeChild(menuitem);

        this.prefs.removeObserver('', this, false);
    },
    addMenuitem: function() {
        let menuitem = document.createElement('menuitem');
        menuitem.setAttribute('id', 'InspectElement-menuitem');
        menuitem.setAttribute('label', 'Inspect Element 设置');
        menuitem.setAttribute('oncommand', 'InspectElement.openPref();')

        let ins = document.getElementById('devToolsEndSeparator');
        ins.parentNode.insertBefore(menuitem, ins);
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
        let xul = '<?xml version="1.0"?>\
            <?xml-stylesheet href="chrome://global/skin/" type="text/css"?>\
            <prefwindow\
                xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"\
                id="InspectElement"\
                title="InspectElement 设置"\
                windowtype="InspectElement:Preferences">\
            <prefpane id="main" flex="1">\
                <preferences>\
                    <preference id="contentType" type="int" name="userChromeJS.InspectElement.contentType"/>\
                    <preference id="mainWinType" type="int" name="userChromeJS.InspectElement.mainWinType"/>\
                    <preference id="checkExists" type="bool" name="userChromeJS.InspectElement.checkExists"/>\
                </preferences>\
                <groupbox>\
                   <caption label="查看器设置" />\
                   <vbox>\
                      <checkbox label="使用已经存在的查看器" preference="checkExists" />\
                   </vbox>\
                    <grid>\
                        <columns>\
                            <column />\
                            <column />\
                        </columns>\
                        <rows>\
                            <row align="center">\
                                <label value="查看网页的工具：" />\
                                <menulist preference="contentType">\
                                  <menupopup>\
                                    <menuitem label="Firebug" value="0"/>\
                                    <menuitem label="自带查看器" value="1"/>\
                                    <menuitem label="DOM Inspector" value="2"/>\
                                  </menupopup>\
                                </menulist>\
                            </row>\
                            <row align="center">\
                                <label value="查看主窗口的工具：" />\
                                <menulist preference="mainWinType">\
                                  <menupopup>\
                                    <menuitem label="Firebug" value="0"/>\
                                    <menuitem label="自带查看器" value="1"/>\
                                    <menuitem label="DOM Inspector" value="2"/>\
                                  </menupopup>\
                                </menulist>\
                            </row>\
                        </rows>\
                    </grid>\
                </groupbox>\
            </prefpane>\
            </prefwindow>\
            ';

        window.openDialog(
            "data:application/vnd.mozilla.xul+xml;charset=UTF-8," + encodeURIComponent(xul), '',
            'chrome,titlebar,toolbar,centerscreen,dialog=no');
    },
    observe: function(aSubject, aTopic, aData){
        if (aTopic == 'nsPref:changed') {
            switch(aData) {
                case 'contentType':
                case 'mainWinType':
                    this[aData] = this.prefs.getIntPref(aData);
                    break;
                case 'checkExists':
                    this.checkExists = this.prefs.getBoolPref('checkExists');
                    break;
            }
        } else if (aTopic == "alertclickcallback" && aData == "link") {
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



/**
 * 调用自带的开发工具或 Firebug
 */
var mInspector = (function(){
    let mainWin = window;

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
})();


InspectElement.startup();

})()
