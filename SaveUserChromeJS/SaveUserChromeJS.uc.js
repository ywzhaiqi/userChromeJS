// ==UserScript==
// @name           SaveUserChromeJS.uc.js
// @author         ywzhaiqi
// @description    像 Greasemonkey 一样保存 uc脚本
// @include        main
// @charset        UTF-8
// @version        0.3
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/tree/master/SaveUserChromeJS
// @reviewURL      http://bbs.kafan.cn/thread-1590873-1-1.html
// ==/UserScript==

(function() {

// 保存完毕是否启用通知？
var notificationsAfterInstall = true;

// 保存完毕是否加载脚本（无需启动）？仅支持 .uc.js，一些脚本有问题。
var runWithoutRestart = false;


let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

if(typeof window.saveUserChromeJS != "undefined"){
	window.saveUserChromeJS.uninit();
	delete window.saveUserChromeJS;
}

const RE_USERCHROME_JS = /\.uc(?:-\d+)?\.(?:js|xul)$/;
const RE_CONTENTTYPE = /text\/html/i;

var ns = window.saveUserChromeJS = {
	_menuitem: null,
	get SCRIPTS_FOLDER() {
		delete this.SCRIPTS_FOLDER;
		return this.SCRIPTS_FOLDER = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
	},

	init: function() {
		Services.obs.addObserver(this, "content-document-global-created", false);

        // add contentAreaContextMenu
        var contextMenu = $("contentAreaContextMenu");
        var menuitem = this.createMenuitem();
		contextMenu.insertBefore(menuitem, contextMenu.firstChild);
		contextMenu.addEventListener("popupshowing", this, false);

        this._menuitem = menuitem;
	},
	uninit: function(){
		Services.obs.removeObserver(this, "content-document-global-created");

        if(this._menuitem){
            this._menuitem.parentNode.removeChild(this._menuitem);
        }

        $("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
	},
	handleEvent: function(event){
		switch(event.type){
			case "popupshowing":
				if (event.target != event.currentTarget) return;
				if(gContextMenu.onLink){
					this._menuitem.hidden = !RE_USERCHROME_JS.test(gContextMenu.linkURL);
				}else{
					this._menuitem.hidden = true;
				}
				break;
		}
	},
	observe: function(aSubject, aTopic, aData) {
		switch (aTopic) {
			case "content-document-global-created":
				let safeWin = aSubject;
				let chromeWin = this.getBrowserForContentWindow(safeWin).wrappedJSObject;
				if (!chromeWin) return;

				let gBrowser = chromeWin.gBrowser;
				if (!gBrowser) return;

                let lhref = safeWin.location.href;
                if(lhref.startsWith("view-source")) return;

				// Show the scriptish install banner if the user is navigating to a .user.js
				// file in a top-level tab.
				if (safeWin === safeWin.top && RE_USERCHROME_JS.test(lhref) && !RE_CONTENTTYPE.test(safeWin.document.contentType)) {
                    safeWin.setTimeout(function(){
						ns.showInstallBanner(gBrowser.getBrowserForDocument(safeWin.document));
					}, 500);
				}

                if(safeWin.location.hostname == 'github.com'){
                    safeWin.addEventListener("DOMContentLoaded", function(){
                        ns.github_addButton(safeWin.document);

                        // github 用了 history.pushstate, 需要加载页面后重新添加按钮
                        ns.github_addListener(safeWin);
                    }, false);
                }

				break;
		}
	},
	createMenuitem: function(){
		var menuitem = $C("menuitem", {
			id: "uc-install-menu",
			label: "Install userChromeJS...",
			accessKey: "I",
			oncommand: "saveUserChromeJS.saveScript(gContextMenu.linkURL)"
		});

		return menuitem;
	},
	showInstallBanner: function(browser) {
		var notificationBox = gBrowser.getNotificationBox(browser);
		var greeting = "This is a userChrome script. Click install to start using it.";
		var btnLabel = "install";

		// Remove existing notifications. Notifications get removed
		// automatically onclick and on page navigation, but we need to remove
		// them ourselves in the case of reload, or they stack up.
		for (var i = 0, child; child = notificationBox.childNodes[i]; i++)
			if (child.getAttribute("value") == "install-userChromeJS")
				notificationBox.removeNotification(child);

		var notification = notificationBox.appendNotification(
			greeting,
			"install-userChromeJS",
			null,
			notificationBox.PRIORITY_WARNING_MEDIUM, [{
				label: btnLabel,
				accessKey: "I",
				popup: null,
				callback: this.saveCurrentScript
			}
		]);
	},
	github_addButton: function(doc){
		if(doc.getElementById("uc-install-button")) return;

		var rawBtn = doc.getElementById("raw-url");
		if(!rawBtn) return;

		var downURL = rawBtn.href;
		if(!RE_USERCHROME_JS.test(downURL)) return;

		var installBtn = doc.createElement("a");
		installBtn.setAttribute("id", "uc-install-button");
		installBtn.setAttribute("class", "minibutton");
		installBtn.setAttribute("href", downURL);
		installBtn.innerHTML = "Install";
		installBtn.addEventListener("click", function(event){
			event.preventDefault();
			ns.saveScript(downURL);
		}, false);

		rawBtn.parentNode.insertBefore(installBtn, rawBtn);
	},
    github_addListener: function(win){
        var script = '\
            (function(){\
                var $ = unsafeWindow.jQuery;\
                if(!$) return;\
                $(document).on("pjax:success", function(){\
                    github_addButton(document);\
                });\
            })();\
        ';
        let sandbox = new Cu.Sandbox(win, {sandboxPrototype: win});
        sandbox.unsafeWindow = win.wrappedJSObject;
        sandbox.document     = win.document;
        sandbox.window       = win;
        sandbox.github_addButton = ns.github_addButton;
        Cu.evalInSandbox(script, sandbox);
    },
	saveCurrentScript: function(event){
		ns.saveScript();
	},
	saveScript: function(url) {
        var win = ns.getFocusedWindow();

		var doc, name, fileName, fileExt, charset;
		if(!url){
			url = win.location.href;
			doc = win.document;
			name = doc.body.textContent.match(/\/\/\s*@name\s+(.*)/i);
			charset = doc.body.textContent.match(/\/\/\s*@charset\s+(.*)/i);
		}else{
            if(url.match(/^https?:\/\/github\.com\/\w+\/\w+\/blob\//)){
                url = url.replace("/blob/", "/raw/");
            }
        }

		name = name && name[1] ? name[1] : decodeURIComponent(url.split("/").pop());
        fileName = name.replace(/\.uc\.(js|xul)$|$/i, ".uc.$1").replace(/\s/g, '_');
		fileExt = name.match(/\.uc\.(js|xul)$/i);
        fileExt = fileExt && fileExt[1] ? fileExt[1] : "js";
        charset = charset && charset[1] ? charset[1] : "UTF-8";

		// https://developer.mozilla.org/ja/XUL_Tutorial/Open_and_Save_Dialogs
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
		fp.init(window, "", Ci.nsIFilePicker.modeSave);
		fp.appendFilter("*." + fileExt, "*.uc.js;*.uc.xul");
		fp.appendFilters(Ci.nsIFilePicker.filterAll);
		fp.displayDirectory = ns.SCRIPTS_FOLDER; // nsILocalFile
		fp.defaultExtension = fileExt;
		fp.defaultString = fileName;
		var callbackObj = {
			done: function(res) {
				if (res != fp.returnOK && res != fp.returnReplace) return;

                var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
                persist.persistFlags = persist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

                var obj_URI;
                if(doc && fileExt != 'xul'){
                    obj_URI = doc.documentURIObject;
                }else{
                    obj_URI = Services.io.newURI(url, null, null);
                }

                if(notificationsAfterInstall){
                    persist.progressListener = {
                        onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
                            if(aCurSelfProgress == aMaxSelfProgress){
                                setTimeout(function(){
                                    ns.showInstallMessage({
                                        fileExt: fileExt,
                                        fileName: fileName,
                                        file: fp.file,
                                        charset: charset
                                    });
                                }, 100);
                            }
                        },
                        onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) { }
                    };
                }

                persist.saveURI(obj_URI, null, null, null, "", fp.file, null);
			}
		};
		fp.open(callbackObj);
	},
    showInstallMessage: function(info){
        var isRun = (info.fileExt == "js");

        var mainAction, secondActions;
        if(runWithoutRestart && isRun){
            mainAction = {
                label: "立即运行（可能有问题，重启即可）",
                accessKey: "R",
                callback: function(){
                    ns.runScript(info.file, info.charset);
                }
            };
            secondActions = [{
                label: "立即重启",
                accessKey: "R",
                callback: ns.restartApp
            }];
        }else{
            mainAction = {
                label: "立即重启",
                accessKey: "R",
                callback: ns.restartApp
            };
            secondActions = null;
        }

        var showedMsg = ns.popupNotification({
            id: "userchromejs-install-popup-notification",
            message: "'" + info.fileName + "' 安装完毕",
            mainAction: mainAction,
            secondActions: secondActions,
            options: {
                removeOnDismissal: true,
                persistWhileVisible: true
            }
        });
    },
    popupNotification: function(details){
        var win = ns.getMostRecentWindow();
        if (win && win.PopupNotifications) {
            win.PopupNotifications.show(
                win.gBrowser.selectedBrowser,
                details.id,
                details.message,
                "",
                details.mainAction,
                details.secondActions,
                details.options);
            return true;
        }

        return false;
    },
    // 只支持 us.js
    runScript: function(file, charset){
        window.userChrome_js.getScripts();
        if(window.userChromeManager){
            window.userChromeManager.rebuildScripts();
        }

        var dir = file.parent.leafName;
        if(dir.toLowerCase() == 'chrome' || (dir in window.userChrome_js.arrSubdir)){

            let context = {};
            Services.scriptloader.loadSubScript( "file:" + file.path, context, charset || "UTF-8");
        }
    },
    flushCache: function (file) {
        if (file)
             Services.obs.notifyObservers(file, "flush-cache-entry", "");
        else
             Services.obs.notifyObservers(null, "startupcache-invalidate", "");
    },
	getFocusedWindow: function() {
		var win = document.commandDispatcher.focusedWindow;
		return (!win || win == window) ? content : win;
	},
	getMostRecentWindow: function(){
		return Services.wm.getMostRecentWindow("navigator:browser")
	},
	getBrowserForContentWindow: function(aContentWindow) {
	  return aContentWindow
	      .QueryInterface(Ci.nsIInterfaceRequestor)
	      .getInterface(Ci.nsIWebNavigation)
	      .QueryInterface(Ci.nsIDocShellTreeItem)
	      .rootTreeItem
	      .QueryInterface(Ci.nsIInterfaceRequestor)
	      .getInterface(Ci.nsIDOMWindow)
	      .QueryInterface(Ci.nsIDOMChromeWindow);
	},
    restartApp: function() {
        const appStartup = Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(Components.interfaces.nsIAppStartup);

        // Notify all windows that an application quit has been requested.
        var os = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
        var cancelQuit = Components.classes["@mozilla.org/supports-PRBool;1"].createInstance(Components.interfaces.nsISupportsPRBool);
        os.notifyObservers(cancelQuit, "quit-application-requested", null);

        // Something aborted the quit process.
        if (cancelQuit.data) return;

        // Notify all windows that an application quit has been granted.
        os.notifyObservers(null, "quit-application-granted", null);

        // Enumerate all windows and call shutdown handlers
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var windows = wm.getEnumerator(null);
        var win;
        while (windows.hasMoreElements()) {
            win = windows.getNext();
            if (("tryToClose" in win) && !win.tryToClose()) return;
        }
        let XRE = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
        if (typeof XRE.invalidateCachesOnRestart == "function") XRE.invalidateCachesOnRestart();
        appStartup.quit(appStartup.eRestart | appStartup.eAttemptQuit);
    }
};


function $(id) document.getElementById(id);
function $C(name, attr) {
	var el = document.createElement(name);
	if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
	return el;
}

function log(arg) Application.console.log("[SaveUserChromeJS]" + arg);

function checkDoc(doc) {
	if (!(doc instanceof HTMLDocument)) return false;
	if (!window.mimeTypeIsTextBased(doc.contentType)) return false;
	if (!doc.body || !doc.body.hasChildNodes()) return false;
	if (doc.body instanceof HTMLFrameSetElement) return false;
	return true;
}


})();


window.saveUserChromeJS.init();
