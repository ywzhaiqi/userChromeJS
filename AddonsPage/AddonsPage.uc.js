// ==UserScript==
// @name         AddonsPage.uc.js
// @description  附件组件页面右键新增查看所在目录，详细信息页面新增安装地址或路径，新增 uc脚本管理页面。
// @note         根据 Add InstallUrl Or Path To AddonsPage By Crab 修改，参考 Add-ons Manager Context Menu扩展，OpenAddonFolder.uc.js
// @author       ywzhaiqi
// @include      main
// @charset      utf-8
// @version      0.2
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function(){

	// if(window.AM_Helper){
	// 	AM_Helper.uninit();
	// 	delete AM_Helper;
	// }

	let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
	if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");
	Cu.import("resource://gre/modules/AddonManager.jsm");

	var debug = content.console.log;

	window.AM_Helper = {
		init: function(){
			["browseDir", "copyName", "setUrlOrPath"].forEach(function(menthod){
				AM_Helper[menthod] = AM_Helper[menthod].bind(AM_Helper);
			});

			document.addEventListener("DOMContentLoaded", this, false);
		},
		uninit: function(){
			document.removeEventListener("DOMContentLoaded", this, false);
		},
		handleEvent: function(event){
			switch(event.type){
				case "DOMContentLoaded":
					var doc = event.target;
					var win = doc.defaultView;

					if (["about:addons","chrome://mozapps/content/extensions/extensions.xul"].indexOf(doc.URL) == -1)
						return;

					this.addPopupMenu(doc);

					// 给菜单调用？
					win.AM_Helper = AM_Helper;

					var self = this;
					var observer = new MutationObserver(function(e) {
						e = e[e.length-1];
						if(e.attributeName == "loading") {
							var doc = e.target.ownerDocument;
							self.setUrlOrPath(doc);
						}
					});
					observer.observe(doc.getElementById("detail-view"), {attributes: true});
					break;
				case "popupshowing":
					this.getAddon(content.document.popupNode.value,
					              this.setItemsAttributes,
					              event);
					break;
			}
		},
		addPopupMenu: function(doc){
			var ins = doc.getElementById("menuitem_uninstallItem");
			if(!ins) return;

			ins = ins.nextSibling;
			var popup = ins.parentNode;

			var menuitem = $C("menuseparator", {
				id: "AM-separator-1"
			});
			popup.insertBefore(menuitem, ins);

			menuitem = $C("menuitem", {
				id: "AM-inspect-addon",
				label: "查看附加组件",
				oncommand: "AM_Helper.getAddon(AM_Helper.getPopupNode(this).value, AM_Helper.inspectAddon);"
			});
			popup.insertBefore(menuitem, ins);

			// menuitem = $C("menuitem", {
			// 	id: "AM-inspect-userscript",
			// 	label: "查看用户脚本",
			// 	class: "greasemonkey",
			// 	oncommand: "AM_Helper.getAddon(AM_Helper.getPopupNode(this).value, AM_Helper.inspectUserscript);"
			// });
			// popup.insertBefore(menuitem, ins);

			// 查看安装目录
			menuitem = $C("menuitem", {
				id: "AM-browse-dir",
				label: "查看所在目录",
				oncommand: "AM_Helper.getAddon(AM_Helper.getPopupNode(this).value, AM_Helper.browseDir);"
			});
			popup.insertBefore(menuitem, ins);

			menuitem = $C("menuitem", {
				id: "AM-copy-name",
				label: "复制名称",
				oncommand: "AM_Helper.getAddon(AM_Helper.getPopupNode(this).value, AM_Helper.copyName);"
			});
			popup.insertBefore(menuitem, ins);

			menuitem = $C("menuitem", {
				id: "AM-go-uso",
				class: "greasemonkey",
				hidden: true,
				label: "在 Userscripts.org 上查看",
				oncommand: "openURL(this.tooltipText);"
			});
			popup.appendChild(menuitem);

			menuitem = $C("menuitem", {
				id: "AM-find-uso",
				class: "greasemonkey",
				hidden: true,
				label: "在 Userscripts.org 上查找",
				oncommand: "openURL(this.getAttribute('find-on-uso'));"
			});
			popup.appendChild(menuitem);

			popup.addEventListener("popupshowing", this, true);
		},
		setItemsAttributes: function(aAddon, event){
			var popup = event.target;
			var doc = popup.ownerDocument;
			var categorie = doc.getElementById("categories").getAttribute('last-selected').replace("category-", "");
			var isExtension = (categorie == "extension");
			var isTheme = (categorie == "theme");
			var isPlugin = (categorie == "plugin");
			var isUserStyle = (categorie == "userstyle");
			var isScriptish = (categorie == "userscript");
			var isUserScript = (categorie == "user-script") || // Greasemonkey
			                   (categorie == "userscript") ||  // Scriptish
			                   (categorie == "greasemonkey-user-script"); // Greasemonkey 1.7+

			var browseDirItem = doc.getElementById("AM-browse-dir");
			browseDirItem.hidden = isUserStyle || isUserScript;

			var inspectItem = doc.getElementById("AM-inspect-addon");
			inspectItem.disabled = !("inspectObject" in window);
			inspectItem.className = isUserScript
			                        ? isScriptish
			                          ? ""
			                          : "greasemonkey"
			                        : "";

			// var inspectScript = doc.getElementById("AM-inspect-userscript")
			// inspectScript.disabled = !("inspectObject" in window);
			// inspectScript.hidden = !isUserScript;

			var copyNameItem = doc.getElementById("AM-copy-name");
			copyNameItem.tooltipText = aAddon.name;
			copyNameItem.disabled = isUserStyle;

			// var amoURL = aAddon.reviewURL
			//              ? aAddon.reviewURL.replace(/\/reviews\//, "/")
			//              : null;

			// this._menuseparator_1.hidden = isPlugin;

			var usoRegx = /^https?:\/\/userscripts.org\/scripts\/source\/\d+.\w+.js$/;
			var usoURL = "";
			if (aAddon._script) {
				var usDownloadURL = aAddon._script._downloadURL;
				var usUpdateURL = aAddon._script._updateURL;
				if (usoRegx.test(usDownloadURL)) {
					usoURL = usDownloadURL;
				} else if (usoRegx.test(usUpdateURL)) {
					usoURL = usUpdateURL;
				}
			}

			var usoItem = doc.getElementById("AM-go-uso");
			usoItem.disabled = !usoRegx.test(usoURL);
			usoItem.className = isUserScript ? usoItem.disabled ? "" : "greasemonkey" : "";
			usoItem.tooltipText = usoURL.replace(/source/, "show")
				.replace(/.\w+.js$/, "");

			var fusoItem = doc.getElementById("AM-find-uso");
			fusoItem.hidden = true;
			fusoItem.disabled = usoRegx.test(usoURL);
			fusoItem.className = isUserScript ? fusoItem.disabled ? "" : "greasemonkey" : "";
			fusoItem.setAttribute("find-on-uso",
				"http://userscripts.org/scripts/search?q=" +
				encodeURIComponent(aAddon.name));
		},
		inspectAddon: function (aAddon) {
		 	inspectObject(aAddon);
		},
		inspectUserscript: function (aAddon) {
		 	inspectObject(aAddon._script);
		},
		getPopupNode: function (aNode) {
			var doc = aNode.ownerDocument;
			return "triggerNode" in aNode.parentNode ? aNode.parentNode.triggerNode : doc.popupNode;
		},
		getAddon: function (aId, aCallback, aEvent) {
			if (content.gDetailView._addon) {
				aCallback(content.gDetailView._addon, aEvent);
				return;
			}

			AddonManager.getAllAddons(function(aAddons) {
				for (var i = 0; i < aAddons.length; i++) {
					if (aAddons[i].id == aId) {
						aCallback(aAddons[i], aEvent);
						return;
					}
				}
			});
		},
		browseDir: function (aAddon) {
			switch(aAddon.type){
				case "plugin":
					var pathes = aAddon.pluginFullpath;
					if(pathes.length == 1){
						this.revealPath(pathes[0]);
					}else{
						alert("有多个路径：\n" + path.join("\n"));
					}
					return;
				case "userchromejs":
					var file = aAddon._script.file;
					if(file.exists())
						file.reveal();
					return;
			}

			// addon
			var gecko = parseInt(Services.appinfo.platformVersion);
			var nsLocalFile = Components.Constructor("@mozilla.org/file/local;1", (gecko >= 14) ? "nsIFile" : "nsILocalFile",
				"initWithPath");

			var dir = Services.dirsvc.get("ProfD", Ci.nsIFile);
			dir.append("extensions");
			dir.append(aAddon.id);
			var fileOrDir = dir.path + (dir.exists() ? "" : ".xpi");
			//Application.console.log(fileOrDir);
			try {
				(new nsLocalFile(fileOrDir)).reveal();
			} catch (ex) {
				var addonDir = /.xpi$/.test(fileOrDir) ? dir.parent : dir;
				try {
					if (addonDir.exists()) {
						addonDir.launch();
					}
				} catch (ex) {
					var uri = Services.io.newFileURI(addonDir);
					var protSvc = Cc["@mozilla.org/uriloader/external-protocol-service;1"].
					getService(Ci.nsIExternalProtocolService);
					protSvc.loadUrl(uri);
				}
			}
		},
		copyName: function (aAddon) {
		 	this.copyToClipboard(aAddon.name);
		},

		get getUrl() {
			var aAddon = content.gViewController.viewObjects.detail._addon;
			if(!aAddon) return false;

			switch(aAddon.type){
				case "extension":
				case "theme":
					var url = (aAddon.contributionURL || aAddon.reviewURL) || false;
					return url && url.replace(/\/developers|\/reviews/g,"");
				case "greasemonkey-user-script":
					return aAddon._script && aAddon._script.downloadURL.replace(/(^.+)source\/(\d+).*$/,"$1show/$2");
				case "userscript":
					return
			}
		},
		get getPath(){
			var url = content.gViewController.viewObjects.detail._addon;
			if(!url) return false;
			return url.pluginFullpath || false;
		},
		setUrlOrPath :function(doc){
			if (!this.getUrl && !this.getPath) return;
			if(!doc.getElementById("detail-InstallURL-row")){
				var value = "",label = "";
				if(content.gViewController.currentViewId.indexOf("detail")!= -1){
					switch (content.gViewController.viewObjects.detail._addon.type){
						case "extension":
						case "theme":
						case "greasemonkey-user-script":
							value = this.getUrl;
							label = "%Installpage%";
							break;
						case "plugin":
							value = this.getPath;
							label = "%Path%";
							break;
					}
				}
				if(!!value && !!label){
					var xul = "";
					if(typeof(value) != "string"){
						xul = "<vbox>";
						for(var i=0;i< value.length;i++){
							xul += ('<label class="detail-row-value text-link" crop="end" onclick="\
								if(event.button == 0) { \
									AM_Helper.revealPath(this.value); \
								} else if (event.button == 2){ \
									AM_Helper.copyToClipboard(this.value); \
								} \
								return false;" \
								value="' + value[i] +'" href="'+ value[i] +'"/>');
						}
						xul += "</vbox>";
					}else{
						xul = '<label class="detail-row-value text-link" crop="end" onclick="\
							if(event.button == 2){\
								AM_Helper.copyToClipboard(this.value); \
								return false;\
							}" value="'+ value +'" href="'+ value +'"/>';
					}
					xul = '<row class="detail-row-complex" id="detail-InstallURL-row" label="'+ label +'">'+
								'<label class="detail-row-label" value="'+ label +'"/>'+ xul +'</row>';
					if(Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch).getCharPref("general.useragent.locale").indexOf("zh")!=-1){
						xul = xul.replace(/\%Installpage\%/g, "安装页面").replace(/\%Path\%/g,"路径");
					}else{
						xul = xul.replace(/\%/g,"");
					}
					doc.getElementById("detail-rows").innerHTML += xul;
				}
			}
		},
		revealPath: function(path){
			var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
			file.initWithPath(path);
			if(file.exists())
				file.reveal();
		},
		copyToClipboard: function (aString) {
			Cc["@mozilla.org/widget/clipboardhelper;1"].
				getService(Ci.nsIClipboardHelper).copyString(aString);
		}
	};

	var SCRIPT_ID_SUFFIX = '@userchromejs';

	window.userChromeJSAddon = {
		scripts:[],

	    init: function(){
	    	["getScriptById"].forEach(function(menthod){
	    		userChromeJSAddon[menthod] = userChromeJSAddon.getScriptById.bind(userChromeJSAddon);
	    	});

	        this.initScripts();
	        this.registerProvider();
	    },
	    initScripts: function(){
	        var scripts = window.userChrome_js.scripts.concat(window.userChrome_js.overlays);

	        var self = this;
	        scripts.forEach(function(script, i){
	        	self.scripts[i] = new ScriptAddon(script);
	        });
	    },
	    getScriptById: function(aId){
	    	for (var i = 0; i < this.scripts.length; i++) {
	    		if(this.scripts[i].id == aId)
	    			return this.scripts[i];
	    	}
	    	return null;
	    },
	    registerProvider: function(){
			var types = null;
			if (AddonManagerPrivate.AddonType) {
				types = [new AddonManagerPrivate.AddonType(
					"userchromejs",
					"",
					"uc 脚本",
					AddonManager.VIEW_TYPE_LIST,
					9000)];
			}

			AddonManagerPrivate.registerProvider({
				getAddonByID: function(aId, aCallback) {
					aCallback(userChromeJSAddon.getScriptById(aId));
				},

				getAddonsByTypes: function(aTypes, aCallback) {
					if (aTypes && aTypes.indexOf("userchromejs") < 0) {
						aCallback([]);
					} else {
						aCallback(userChromeJSAddon.scripts);
					}
				}
			}, types);
	    }
	};

	function ScriptAddon(aScript){
		this._script = aScript;

		this.id = this._script.filename + SCRIPT_ID_SUFFIX;
		this.name = this._script.filename;
		// this.version = this._script.version;
		this.description = this._script.description;
		// this.updateDate = this._script.modifiedDate;

		this.enabled = !userChrome_js.scriptDisable[this.name]
		this.downloadURL = null;
	}

	ScriptAddon.prototype = {
		id: null,
		version: null,
		type: "userchromejs",
		isCompatible: true,
		blocklistState: 0,
		appDisabled: false,
		scope: AddonManager.SCOPE_PROFILE,
		name: null,
		creator: null,
		pendingOperations: AddonManager.PENDING_NONE,  // 必须，否则所有都显示 restart
		operationsRequiringRestart: 6,
		// operationsRequiringRestart: AddonManager.OP_NEEDS_RESTART_DISABLE,

		get isActive() !this.userDisabled,
		get userDisabled() !this.enabled,
		set userDisabled(val) {
			if (val == this.userDisabled) {
				return val;
			}

			if(this.pendingOperations == AddonManager.PENDING_NONE){
				this.pendingOperations = val ? AddonManager.PENDING_DISABLE : AddonManager.PENDING_ENABLE;
			}else{
				this.pendingOperations = AddonManager.PENDING_NONE;
			}

			AddonManagerPrivate.callAddonListeners(
				val ? 'onEnabling' : 'onDisabling', this, false);
			this.enabled = !val;
			AddonManagerPrivate.callAddonListeners(
				val ? 'onEnabled' : 'onDisabled', this);

			if(window.userChromejs){
				userChromejs.chgScriptStat(this.name);
			}
		},
		get permissions() {
			// var perms = AddonManager.PERM_CAN_UNINSTALL;
			// perms |= this.userDisabled ? AddonManager.PERM_CAN_ENABLE : AddonManager.PERM_CAN_DISABLE;
			var perms = this.userDisabled ? AddonManager.PERM_CAN_ENABLE : AddonManager.PERM_CAN_DISABLE;
			if (this.updateURL) perms |= AddonManager.PERM_CAN_UPGRADE;
			return perms;
		},

		uninstall: function() {
			AddonManagerPrivate.callAddonListeners("onUninstalling", this, false);
			this.needsUninstall = true;
			this.pendingOperations |= AddonManager.PENDING_UNINSTALL;
			AddonManagerPrivate.callAddonListeners("onUninstalled", this);
		},
		cancelUninstall: function() {
			this.needsUninstall = false;
			this.pendingOperations ^= AddonManager.PENDING_UNINSTALL;
			AddonManagerPrivate.callAddonListeners("onOperationCancelled", this);
		},
	}


	AM_Helper.init();

	userChromeJSAddon.init();

	function $C(name, attr) {
	    var el = document.createElement(name);
	    if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
	    return el;
	}

})();