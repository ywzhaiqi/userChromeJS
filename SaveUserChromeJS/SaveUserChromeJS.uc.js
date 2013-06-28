// ==UserScript==
// @name           SaveUserChromeJS.uc.js
// @author         ywzhaiqi
// @description    像 Greasemonkey 一样保存 uc脚本
// @include        main
// @charset        UTF-8
// ==/UserScript==

(function() {

let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

if(typeof window.saveUserChromeJS != "undefined"){
	window.saveUserChromeJS.uninit();
	delete window.saveUserChromeJS;
}

const RE_USERCHROME_JS = /\.uc(?:-\d+)?\.js$/;
const RE_CONTENTTYPE = /text\/html/i;

window.saveUserChromeJS = {
	get SCRIPTS_FOLDER() {
		return Services.dirsvc.get("UChrm", Ci.nsILocalFile);
	},

	init: function() {
		Services.obs.addObserver(this, "content-document-global-created", false);
		Services.obs.addObserver(this, "install-userChromeJS", false);
	},
	uninit: function(){
		Services.obs.removeObserver(this, "content-document-global-created");
		Services.obs.removeObserver(this, "install-userChromeJS");
	},
	observe: function(aSubject, aTopic, aData) {
		switch (aTopic) {
			case "content-document-global-created":
				let safeWin = aSubject;
				let chromeWin = this.getBrowserForContentWindow(safeWin).wrappedJSObject;
				if (!chromeWin) return;

				let gBrowser = chromeWin.gBrowser;
				if (!gBrowser) return;

				// Show the scriptish install banner if the user is navigating to a .user.js
				// file in a top-level tab.
				if (safeWin === safeWin.top && RE_USERCHROME_JS.test(safeWin.location.href) && !RE_CONTENTTYPE.test(safeWin.document.contentType)) {
					safeWin.setTimeout(function(self){
						self.showInstallBanner(
							gBrowser.getBrowserForDocument(safeWin.document));
					}, 500, this);
				}
				break;
			case "install-userChromeJS":
				let win = this.getMostRecentWindow("navigator:browser");
				if (win) this.saveScript();
				break;
		}
	},
	showInstallBanner: function(browser) {
		// var notificationBox = gBrowser.getNotificationBox(browser);
		var notificationBox = gBrowser.getNotificationBox();
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
				callback: this.saveScript.bind(this)
			}
		]);
	},
	saveScript: function() {
		var win = this.getFocusedWindow();
		var doc = win.document;
		var name = /\/\/\s*@name\s+(.*)/i.exec(doc.body.textContent);
		var filename = (name && name[1] ? name[1] : win.location.href.split("/").pop()).replace(/\.uc\.js$|$/i, ".uc.js").replace(/\s/g, '_').toLowerCase();

		// https://developer.mozilla.org/ja/XUL_Tutorial/Open_and_Save_Dialogs
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
		fp.init(window, "", Ci.nsIFilePicker.modeSave);
		fp.appendFilter("JS Files", "*.js");
		fp.appendFilters(Ci.nsIFilePicker.filterAll);
		fp.displayDirectory = this.SCRIPTS_FOLDER; // nsILocalFile
		fp.defaultExtension = "js";
		fp.defaultString = filename;
		var callbackObj = {
			done: function(res) {
				if (res != fp.returnOK && res != fp.returnReplace) return;

				var wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
				wbp.persistFlags = wbp.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
				var uri = doc.documentURIObject;
				var loadContext = win.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsILoadContext);
				wbp.saveURI(uri, null, uri, null, null, fp.file, loadContext);
			}
		}
		fp.open(callbackObj);
	},
	getFocusedWindow: function() {
		var win = document.commandDispatcher.focusedWindow;
		return (!win || win == window) ? content : win;
	},
	getMostRecentWindow: function(){
		Services.wm.getMostRecentWindow("navigator:browser")
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
	}
};

window.saveUserChromeJS.init();

})();