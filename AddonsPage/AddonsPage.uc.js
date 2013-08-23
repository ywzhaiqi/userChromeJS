// ==UserScript==
// @name         AddonsPage.uc.js
// @description  附件组件页面右键新增查看安装目录、复制名字（支持扩展、插件），详细信息页面新增GM脚本、扩展、主题安装地址和插件路径;右键即复制。
// @note         根据 Add InstallUrl Or Path To AddonsPage By Crab 修改，参考 Add-ons Manager Context Menu扩展，OpenAddonFolder.uc.js
// @author       ywzhaiqi
// @include      main
// @charset      utf-8
// @version      0.4.2
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function(){
	var debug = content.console.log;
	let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
	if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

	window.AddToAddonsPage = {
		init: function(event){
			if (["about:addons","chrome://mozapps/content/extensions/extensions.xul"].indexOf(content.document.URL)==-1)
				return;

			AddToAddonsPage.addPopupMenu(event);

			var observer = new MutationObserver(function(e) {
					e = e[e.length-1];
					if(e.attributeName == "loading") {
						AddToAddonsPage.setUrlOrPath();
				}
			});
			observer.observe(content.document.getElementById("detail-view"), {attributes: true});
		},
		addPopupMenu: function(event){
			var doc = event.target;
			var ins = doc.getElementById("menuitem_uninstallItem");
			if(!ins)
				return;

			ins = ins.nextSibling;
			var popup = ins.parentNode,
				menuitem;

			menuitem = $C("menuseparator");
			AddToAddonsPage._menuseparator1 = popup.insertBefore(menuitem, ins);

			// 查看安装目录，插件类型不支持？
			menuitem = $C("menuitem", {
				id: "AM-browse-dir",
				label: "查看安装目录"
			});
			menuitem.addEventListener("click", function(event){
				AddToAddonsPage.getAddon(
					AddToAddonsPage.getPopupNode(event.target).value,
					AddToAddonsPage.browseDir
				);
			}, false);
			AddToAddonsPage._browseDir = popup.insertBefore(menuitem, ins);

			menuitem = $C("menuitem", {
				id: "AM-copy-name",
				label: "复制名称"
			});
			menuitem.addEventListener("click", function(event){
				AddToAddonsPage.getAddon(
					AddToAddonsPage.getPopupNode(event.target).value,
					AddToAddonsPage.copyName
				);
			}, false);
			AddToAddonsPage._copyName = popup.insertBefore(menuitem, ins);

			popup.addEventListener("popupshowing", AddToAddonsPage.onPopupShowing, true);
		},
		onPopupShowing: function(event){
			var popup = event.target;
			var doc = popup.ownerDocument;

			var categorie = doc.getElementById("categories").getAttribute('last-selected');
			var isExtension = (categorie == "category-extension");
			var isTheme = (categorie == "category-theme");
			var isPlugin = (categorie == "category-plugin");
			var isUserStyle = (categorie == "category-userstyle");
			var isScriptish = (categorie == "category-userscript");
			var isUserScript = (categorie == "category-user-script") || // Greasemonkey
			                   (categorie == "category-userscript") ||  // Scriptish
			                   (categorie == "category-greasemonkey-user-script"); // Greasemonkey 1.7+

			AddToAddonsPage._menuseparator1.hidden = isUserStyle || isUserScript;
			AddToAddonsPage._browseDir.hidden = isUserStyle || isUserScript;
			// AddToAddonsPage._copyName.hidden = isUserStyle;
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
			})
		},
		browseDir: function (aAddon) {
			var gecko = parseInt(Services.appinfo.platformVersion);
			var nsLocalFile = Components.Constructor("@mozilla.org/file/local;1", (gecko >= 14) ? "nsIFile" : "nsILocalFile",
				"initWithPath");

			if(aAddon.type == "plugin"){
				var path = aAddon.pluginFullpath;
				if(path){
					if(path.length == 1)
						(new nsLocalFile(path)).reveal();
					else{
						alert("有多个路径：\n" + path.join("\n"));
					}
				}
				return;
			}

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
		 	AddToAddonsPage.copyToClipboard(aAddon.name);
		},
		copyToClipboard: function (aString) {
			Cc["@mozilla.org/widget/clipboardhelper;1"].
				getService(Ci.nsIClipboardHelper).copyString(aString);
		},

		get getUrl() {
			var url = content.gViewController.viewObjects.detail._addon;
			if(!url) return false;
			var url2 = (url.contributionURL || url.reviewURL) || false;
			return ((url2 && url2.replace(/\/developers|\/reviews/g,"")) || (url._script && url._script.downloadURL.replace(/(^.+)source\/(\d+).*$/,"$1show/$2")))||false;
		},
		get getPath(){
			var url = content.gViewController.viewObjects.detail._addon;
			if(!url) return false;
			return url.pluginFullpath || false;
		},
		setUrlOrPath :function(){
			if (!this.getUrl && !this.getPath) return;
			if(!content.document.getElementById("detail-InstallURL-row")){
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
								if(event.button == 0) {\
									var file=Components.classes[\'@mozilla.org/file/local;1\']\
												.createInstance(Components.interfaces.nsILocalFile);\
									file.initWithPath(this.value); \
									if(file.exists()) \
										file.reveal(); \
								}else if(event.button == 2){\
									Components.classes[\'@mozilla.org/widget/clipboardhelper;1\']\
												.createInstance(Components.interfaces.nsIClipboardHelper)\
												.copyString(this.value);\
								}\
								return false;\
								" value="'+ value[i] +'" href="'+ value[i] +'"/>');
						}
						xul += "</vbox>";
					}else{
						xul = '<label class="detail-row-value text-link" crop="end" onclick="\
							if(event.button == 2){\
								Components.classes[\'@mozilla.org/widget/clipboardhelper;1\']\
										.createInstance(Components.interfaces.nsIClipboardHelper)\
										.copyString(this.value);\
							return false;\
							}" value="'+ value +'" href="'+ value +'"/>';
					}
					xul = '<row class="detail-row-complex" id="detail-InstallURL-row" label="'+ label +'">'+
								'<label class="detail-row-label" value="'+ label +'"/>'+ xul +'</row>';
					if(Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getCharPref("general.useragent.locale").indexOf("zh")!=-1){
						xul = xul.replace(/\%Installpage\%/g, "安装页面").replace(/\%Path\%/g,"路径");
					}else{
						xul = xul.replace(/\%/g,"");
					}
					content.document.getElementById("detail-rows").innerHTML += xul;
				}
			}
		}
	};

	function $C(name, attr) {
	    var el = document.createElement(name);
	    if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
	    return el;
	}

	document.addEventListener("DOMContentLoaded", AddToAddonsPage.init, false);
})();



