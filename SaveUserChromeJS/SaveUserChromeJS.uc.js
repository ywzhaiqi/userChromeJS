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
		Services.obs.addObserver(this, "install-userChromeJS", false);

		gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);

		this.createMenuitem();

		var contextMenu = $("contentAreaContextMenu");
		contextMenu.insertBefore(this._menuitem, contextMenu.firstChild);
		contextMenu.addEventListener("popupshowing", this, false);
	},
	uninit: function(){
		Services.obs.removeObserver(this, "content-document-global-created");
		Services.obs.removeObserver(this, "install-userChromeJS");

		gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);
	},
	handleEvent: function(event){
		switch(event.type){
			case "DOMContentLoaded":
				var doc = event.target;
				var win = doc.defaultView;
				if(win != win.parent) return;
				if(!checkDoc(doc)) return;

				if(win.location.hostname == 'github.com'){
					this.addButton_github(doc);

					// github 用了html5 history pushstate
					// 没找到好方法，暂用这个
					win.setTimeout(function(){
						var observer = new window.MutationObserver(function(mutations) {
							win.setTimeout(function(){
								log("mutations")
								ns.addButton_github(doc);
							}, 500);  
						});

						observer.observe(doc.body, {childList: true, subtree: true})
					}, 1000);
				}
				break;
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
	createMenuitem: function(){
		var menuitem = $C("menuitem", {
			id: "uc-install-menu",
			label: "Install userChromeJS...",
			accessKey: "I",
			oncommand: "saveUserChromeJS.saveScript(gContextMenu.linkURL)"
		});

		return this._menuitem = menuitem;
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
	addButton_github: function(doc){
		if(doc.getElementById("uc-install-button")) return;

		var rawBtn = doc.getElementById("raw-url");
		if(!rawBtn) return;

		var downURL = rawBtn.href;
		if(!RE_USERCHROME_JS.test(downURL)) return;

		var installBtn = doc.createElement("a");
		installBtn.setAttribute("id", "uc-install-button");
		installBtn.setAttribute("class", "minibutton");
		installBtn.setAttribute("href", "#");
		installBtn.innerHTML = "Install";
		installBtn.addEventListener("click", function(event){
			event.preventDefault();
			ns.saveScript(downURL);
		}, false);

		rawBtn.parentNode.insertBefore(installBtn, rawBtn);
	},
	saveScript: function(url) {
		var self = this;
		var win = this.getFocusedWindow();

		var doc, name, scriptCharset;
		if(!url){
			url = win.location.href;
			doc = win.document;
			name = /\/\/\s*@name\s+(.*)/i.exec(doc.body.textContent);
			scriptCharset = /\/\/\s*@charset\s+(.*)/i.exec(doc.body.textContent);
		}
		
		name = name && name[1] ? name[1] : url.split("/").pop();
		var filename = name.replace(/\.uc\.(js|xul)$|$/i, ".uc.$1").replace(/\s/g, '_').toLowerCase();
		// extension
		var m = name.match(/\.uc\.(js|xul)$/i);
		var extension = m && m[1] ? m[1] : "js";

		// https://developer.mozilla.org/ja/XUL_Tutorial/Open_and_Save_Dialogs
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
		fp.init(window, "", Ci.nsIFilePicker.modeSave);
		fp.appendFilter("*." + extension, "*.uc.js;*.uc.xul");
		fp.appendFilters(Ci.nsIFilePicker.filterAll);
		fp.displayDirectory = this.SCRIPTS_FOLDER; // nsILocalFile
		fp.defaultExtension = extension;
		fp.defaultString = filename;
		var callbackObj = {
			done: function(res) {
				if (res != fp.returnOK && res != fp.returnReplace) return;

				var wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
				wbp.persistFlags = wbp.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
				var uri = doc ? doc.documentURIObject : Services.io.newURI(url, null, null);
				var loadContext = win.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsILoadContext);
				wbp.saveURI(uri, null, uri, null, null, fp.file, loadContext);

				// self.runScript({
				// 	url: "file:" + fp.file.path,
				// 	charset: scriptCharset || "UTF-8"
				// });
			}
		}
		fp.open(callbackObj);
	},
	runScript: function(script){
		let context = {};
		Services.scriptloader.loadSubScript(script.url, context, script.charset);
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
