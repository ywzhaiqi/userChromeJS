// ==UserScript==
// @name         AddonsPage.uc.js
// @description  附件组件页面右键新增查看所在目录，详细信息页面新增安装地址或路径，新增 uc脚本管理页面。
// @author       ywzhaiqi
// @include      main
// @charset      utf-8
// @version      0.4
// @downloadURL  https://raw.github.com/ywzhaiqi/userChromeJS/master/AddonsPage/AddonsPage.uc.js
// @homepageURL  https://github.com/ywzhaiqi/userChromeJS/tree/master/AddonsPage
// @reviewURL    http://bbs.kafan.cn/thread-1617407-1-1.html
// @optionsURL   about:config?filter=view_source.editor.path
// @note         - 附件组件页面右键新增查看所在目录（支持扩展、主题、插件）、复制名字。Greasemonkey、Scriptish 自带已经存在
// @note         - 附件组件详细信息页面新增GM脚本、扩展、主题安装地址和插件路径，右键即复制
// @note         - 新增 uc脚本管理页面
// @note         - 右键菜单 "查看附加组件" 需要 DOM Inspector
// @note         其它信息请查看主页
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function(){

	if(window.AM_Helper){
		AM_Helper.uninit();
		delete AM_Helper;
	}
	if(window.userChromeJSAddon){
		userChromeJSAddon.uninit();
		delete userChromeJSAddon;
	}

	var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
	var { Services } = Cu.import("resource://gre/modules/Services.jsm");
	var { AddonManager } = Cu.import("resource://gre/modules/AddonManager.jsm");
	var { XPIProvider } = Cu.import("resource://gre/modules/XPIProvider.jsm");

	var debug = content.console.log;

	window.AM_Helper = {
		menuitem: {},

		init: function(){
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

					// 给菜单调用
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
			this.menuitem.separator_1 = popup.insertBefore(menuitem, ins);

			menuitem = $C("menuitem", {
				id: "AM-inspect-addon",
				label: "查看附加组件",
				accesskey: "i",
				tooltipText: "调用 DOM Inspector 查看 addon 对象",
				oncommand: "AM_Helper.getAddon(AM_Helper.getPopupNode(this).value, AM_Helper.inspectAddon);"
			});
			this.menuitem.inspectItem = popup.insertBefore(menuitem, ins);

			menuitem = $C("menuitem", {
				id: "AM-edit-script",
				label: "编辑",
				accesskey: "e",
				hidden: true,
				oncommand: "AM_Helper.getAddon(AM_Helper.getPopupNode(this).value, AM_Helper.editScript);"
			});
			this.menuitem.editScript = popup.insertBefore(menuitem, ins);

			menuitem = $C("menuitem", {
				id: "AM-browse-dir",
				label: "查看所在目录",
				accesskey: "b",
				oncommand: "AM_Helper.getAddon(AM_Helper.getPopupNode(this).value, AM_Helper.browseDir);"
			});
			this.menuitem.browseDir = popup.insertBefore(menuitem, ins);

			menuitem = $C("menuitem", {
				id: "AM-open-url",
				label: "打开安装页面",
				accesskey: "u",
				tooltipText: null,
				oncommand: "openURL(this.tooltipText)",
			});
			this.menuitem.openURLOrPath = popup.insertBefore(menuitem, ins);

			menuitem = $C("menuitem", {
				id: "AM-copy-name",
				label: "复制名称",
				accesskey: "c",
				oncommand: "AM_Helper.getAddon(AM_Helper.getPopupNode(this).value, AM_Helper.copyName);"
			});
			this.menuitem.copyName = popup.insertBefore(menuitem, ins);

			menuitem = $C("menuitem", {
				id: "AM-go-uso",
				class: "greasemonkey",
				hidden: true,
				label: "在 Userscripts.org 上查看",
				oncommand: "openURL(this.tooltipText);"
			});
			this.menuitem.goUSO = popup.appendChild(menuitem);

			menuitem = $C("menuitem", {
				id: "AM-find-uso",
				class: "greasemonkey",
				hidden: true,
				label: "在 Userscripts.org 上查找",
				oncommand: "openURL(this.getAttribute('find-on-uso'));"
			});
			this.menuitem.findUSO = popup.appendChild(menuitem);

			popup.addEventListener("popupshowing", this, true);
		},
		setItemsAttributes: function(aAddon, event){
			var popup = event.target;
			var doc = popup.ownerDocument;

			var isExtension = (aAddon.type == "extension");
			var isTheme = (aAddon.type == "theme");
			var isPlugin = (aAddon.type == "plugin");
			var isUserStyle = (aAddon.type == "userstyle");
			var isScriptish = (aAddon.type == "userscript");
			var isUserScript = (aAddon.type == "user-script") || // Greasemonkey
			                   (aAddon.type == "userscript") ||  // Scriptish
			                   (aAddon.type == "greasemonkey-user-script"); // Greasemonkey 1.7+
			var isUserChromeJS = (aAddon.type == "userchromejs");

			this.menuitem.browseDir.hidden = isUserStyle || isUserScript;

			this.menuitem.editScript.hidden = !isUserChromeJS;

			// install url
			var openInstallURLItem = this.menuitem.openURLOrPath;
			var installURL = this.getInstallURL(aAddon) || null;
			openInstallURLItem.tooltipText = installURL;
			openInstallURLItem.hidden = !installURL;

			var inspectItem = this.menuitem.inspectItem;
			inspectItem.disabled = !("inspectObject" in window);
			inspectItem.className = isUserScript
			                        ? isScriptish
			                          ? ""
			                          : "greasemonkey"
			                        : "";

			var copyNameItem = this.menuitem.copyName;
			copyNameItem.tooltipText = aAddon.name;
			// copyNameItem.disabled = isUserStyle;

			if(isUserScript && !isScriptish){
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

				var usoItem = this.menuitem.goUSO;
				usoItem.disabled = !usoRegx.test(usoURL);
				usoItem.className = isUserScript ? usoItem.disabled ? "" : "greasemonkey" : "";
				usoItem.tooltipText = usoURL.replace(/source/, "show")
					.replace(/.\w+.js$/, "");

				var fusoItem = this.menuitem.findUSO;
				fusoItem.disabled = usoRegx.test(usoURL);
				fusoItem.className = isUserScript ? fusoItem.disabled ? "" : "greasemonkey" : "";
				fusoItem.setAttribute("find-on-uso",
					"http://userscripts.org/scripts/search?q=" +
					encodeURIComponent(aAddon.name));
			}
		},

		getPopupNode: function (aNode) {
			var doc = aNode.ownerDocument;
			return "triggerNode" in aNode.parentNode ? aNode.parentNode.triggerNode : doc.popupNode;
		},
		getAddon: function (aId, aCallback, aEvent) {
			var self = this;

			if (content.gDetailView._addon) {
				aCallback.apply(self, [content.gDetailView._addon, aEvent]);
				return;
			}

			AddonManager.getAllAddons(function(aAddons) {
				for (var i = 0; i < aAddons.length; i++) {
					if (aAddons[i].id == aId) {
						aCallback.apply(self, [aAddons[i], aEvent]);
						return;
					}
				}
			});
		},

		inspectAddon: function (aAddon) {
		 	inspectObject(aAddon);
		},
		inspectUserscript: function (aAddon) {
		 	inspectObject(aAddon._script);
		},
		browseDir: function (aAddon) {
			switch(aAddon.type){
				case "plugin":
					var pathes = aAddon.pluginFullpath;
					for (var i = 0; i < pathes.length; i++) {
						this.revealPath(pathes[i]);
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
		editScript: function(aAddon) {
			if(aAddon.type == "userchromejs"){
				var path = aAddon._script.file.path;
				this.launchEditor(path);
			}
		},
		launchEditor: function(path){
			var editor = Services.prefs.getCharPref("view_source.editor.path");
			var UI = Cc['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Ci.nsIScriptableUnicodeConverter);

			var platform = window.navigator.platform.toLowerCase();
			if (platform.indexOf('win') > -1) {
			    UI.charset = 'GB2312'; // Shift_JIS
			} else {
			    UI.charset = 'UTF-8';
			}

			path = UI.ConvertFromUnicode(path);

			var appfile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
			appfile.initWithPath(editor);
			var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
			process.init(appfile);
			process.run(false, [path], 1, {});
		},
		copyName: function (aAddon) {
		 	this.copyToClipboard(aAddon.name);
		},
		getInstallURL: function(aAddon){
			aAddon = aAddon || content.gViewController.viewObjects.detail._addon;
			if(!aAddon) return null;

			var url = null;
			switch(aAddon.type){
				case "extension":
				case "theme":
					url = (aAddon.contributionURL || aAddon.reviewURL) || null;
					return url && url.replace(/\/developers|\/reviews/g,"");
				case "greasemonkey-user-script":
					return aAddon._script && aAddon._script.downloadURL.replace(/(^.+)source\/(\d+).*$/,"$1show/$2");
				case "userscript":
					url = aAddon.homepageURL;
					if(!url && aAddon._updateURL){
						url = aAddon._updateURL.replace(/(^.+)source\/(\d+).*$/,"$1show/$2");
					}
					return url;
				case "userchromejs":
					return aAddon.homepageURL || aAddon.reviewURL;
				default:
					return aAddon.homepageURL;
			}
		},

		get getPath(){
			var url = content.gViewController.viewObjects.detail._addon;
			if(!url) return false;
			return url.pluginFullpath || false;
		},
		setUrlOrPath :function(doc){
			var installURL = this.getInstallURL();
			if (!installURL && !this.getPath) return;

			if(!doc.getElementById("detail-InstallURL-row")){
				var value = "",label = "";
				if(content.gViewController.currentViewId.indexOf("detail")!= -1){
					switch (content.gViewController.viewObjects.detail._addon.type){
						case "extension":
						case "theme":
						case "greasemonkey-user-script":
							value = installURL;
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
	        this.initScripts();
	        this.registerProvider();
	    },
	    uninit: function(){
	    	this.unregisterProvider();
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

			this.provider = {
				getAddonByID: function(aId, aCallback) {
					aCallback(function(){
						userChromeJSAddon.getScriptById(aId)
					});
				},

				getAddonsByTypes: function(aTypes, aCallback) {
					if (aTypes && aTypes.indexOf("userchromejs") < 0) {
						aCallback([]);
					} else {
						aCallback(userChromeJSAddon.scripts);
					}
				}
			};

			AddonManagerPrivate.registerProvider(this.provider, types);
	    },
	    unregisterProvider: function(){
	    	AddonManagerPrivate.unregisterProvider(this.provider);
	    }
	};

	function ScriptAddon(aScript){
		this._script = aScript;

		this.id = this._script.filename + SCRIPT_ID_SUFFIX;
		this.name = this._script.filename;
		this.description = this._script.description;
		this.enabled = !userChrome_js.scriptDisable[this.name]

		// 我修改过的 userChrome.js 新增的
		this.version = this._script.version || null;
		this.author = this._script.author || null;
		this.homepageURL = this._script.homepageURL || null;
		this.reviewURL = this._script.reviewURL || null;
		this.reviewCount = 0;
		this.fullDescription = this._script.fullDescription || null;
		this.downloadURL = this._script.downloadURL || null;
	}

	ScriptAddon.prototype = {
		active: false,
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

		get optionsURL(){
			if (this.isActive && this._script.optionsURL)
				return this._script.optionsURL;
		},

		get isActive() !this.userDisabled,
		get userDisabled() !this.enabled,
		set userDisabled(val) {
			if (val == this.userDisabled) {
				return val;
			}

			AddonManagerPrivate.callAddonListeners(val ? 'onEnabling' : 'onDisabling', this, false);

			if(this.pendingOperations == AddonManager.PENDING_NONE){
				this.pendingOperations = val ? AddonManager.PENDING_DISABLE : AddonManager.PENDING_ENABLE;
			}else{
				this.pendingOperations = AddonManager.PENDING_NONE;
			}

			this.enabled = !val;
			if(window.userChromejs){
				userChromejs.chgScriptStat(this.name);
			}

			AddonManagerPrivate.callAddonListeners(val ? 'onEnabled' : 'onDisabled', this);
		},
		get permissions() {
			// var perms = AddonManager.PERM_CAN_UNINSTALL;
			// perms |= this.userDisabled ? AddonManager.PERM_CAN_ENABLE : AddonManager.PERM_CAN_DISABLE;
			var perms = this.userDisabled ? AddonManager.PERM_CAN_ENABLE : AddonManager.PERM_CAN_DISABLE;
			// if (this.updateURL) perms |= AddonManager.PERM_CAN_UPGRADE;
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
	};


	AM_Helper.init();

	userChromeJSAddon.init();

	function $C(name, attr) {
	    var el = document.createElement(name);
	    if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
	    return el;
	}
})();