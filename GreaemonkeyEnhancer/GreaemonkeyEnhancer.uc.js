// ==UserScript==
// @name           GreaemonkeyEnhancer.uc.js
// @namespace      ywzhaiqi@gmail.com
// @description    给 Greasemonkey 的菜单增加鼠标中键点击打开主页、为本站搜索脚本等功能
// @include        main
// @charset        utf-8
// @author         ywzhaiqi
// @version        2014.9.16
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/tree/master/GreaemonkeyEnhancer
// @downloadURL    https://github.com/ywzhaiqi/userChromeJS/raw/master/GreaemonkeyEnhancer/GreaemonkeyEnhancer.uc.js
// @startup        window.GreaemonkeyEnhancer.init();
// @shutdown       window.GreaemonkeyEnhancer.uninit();
// ==/UserScript==

(function() {

	var prefs = {
		inBackground: 1,   // 1：后台打开，0：前台打开
	};

	var ApplyPatchForScript = (function(){
		const USO_URL_RE = /(^https?:\/\/userscripts.org.*\/scripts\/source\/\d+)\.\w+\.js$/i;

		const GFO_URL_RE_1 = /(^https?:\/\/greasyfork.org\/scripts\/code\/\w+)\.\w+\.js$/i;
		const GFO_URL_RE_2 = /(^https?:\/\/greasyfork.org\/scripts\/[^\/]+\/)code[\.\/].*\w+\.js$/i;

		// (http://binux.github.io/ThunderLixianExporter/)master/ThunderLixianExporter.user.js
		const GITHUB_URL_RE_1 = /(^https?:\/\/\w+.github.io\/\w+\/)master\/.*.*\w+\.js$/i;
		// 从   https://raw.githubusercontent.com/ywzhaiqi/userscript/master/noNoticetitleflashOnBBS.user.js
		// 转为 https://github.com/ywzhaiqi/userscript/blob/master/noNoticetitleflashOnBBS.user.js
		const GITHUB_URL_RE_2 = /(^https?:\/\/raw.githubusercontent.com\/.*?\/master\/.*\.user\.js$)/i;

		function getScriptHomeURL(downURL) {
			var url;
			if (downURL && downURL.startsWith('http')) {
				if (USO_URL_RE.test(downURL)) {
					url = RegExp.$1.replace(/source/, "show");
				} else if (GFO_URL_RE_1.test(downURL)) {
					url = RegExp.$1;
				} else if (GFO_URL_RE_2.test(downURL)) {
					url = RegExp.$1;
				} else if (GITHUB_URL_RE_1.test(downURL)) {
					url = RegExp.$1;
				} else if (GITHUB_URL_RE_2.test(downURL)) {
					url = RegExp.$1.replace('raw.githubusercontent.com', 'github.com')
							.replace('/master/', '/blob/master/');
				}
			}
			return url ? decodeURIComponent(url) : null;
		}

		function addHomePage(scripts){
			scripts.forEach(function(script){
				if (!script.homepageURL) {
					var url = script.downloadURL || script.updateURL;
					script.homepageURL = getScriptHomeURL(url);
				}
			});
		}

		return {
			addHomePage: addHomePage,
			getHomePageURL: getScriptHomeURL
		}
	})();

	if(window.GreaemonkeyEnhancer){
		window.GreaemonkeyEnhancer.uninit();
		delete window.GreaemonkeyEnhancer;
	}

	window.GreaemonkeyEnhancer = {
		_id: "GreaemonkeyEnhancer-find-script",
		_id2: "GreaemonkeyEnhancer-tool-find-script",

		init: function(){
			var self = this;

			var isCN = navigator.language.substr(0, 2) == "zh";

			var menuitem = document.createElement("menuitem");
			menuitem.setAttribute("id", this._id);
			menuitem.setAttribute("label", isCN ? "为本站搜索脚本(S)" : "find Script");
			menuitem.setAttribute("accesskey", "s");
			menuitem.setAttribute("oncommand", "GreaemonkeyEnhancer.findscripts()");

			// Scriptish
			var scriptishShow = document.getElementById("scriptish-tb-show-us");
			if(scriptishShow){
				scriptishShow.parentNode.insertBefore(menuitem, scriptishShow.nextSibling);
				scriptishShow.parentNode.insertBefore(
					document.createElement("menuseparator"),
					scriptishShow.nextSibling
				);
			}

			// Greasemonkey
			if ("@greasemonkey.mozdev.org/greasemonkey-service;1" in Cc) {

				// 工具栏的菜单
				var gm_popup = document.querySelector("#gm_general_menu > menupopup");
				if (gm_popup) {
					menuitem.setAttribute("id", this._id2);
					gm_popup.insertBefore(menuitem, gm_popup.children[3]);
					// 添加 tooltiptext
					gm_popup.addEventListener('popupshowing', self.gmPopupShowing, true);
					// 添加中键打开主页
					gm_popup.addEventListener('click', self.gmPopupClicked, true);
				}

				// 图标右键菜单
				// 把按钮移到最新版的 pentadactyl 附加组件栏后，一开始找不到 Greasemonkey 菜单
				var addToGreasemonkey = function() {
					gm_popup = document.querySelector("#greasemonkey-tbb > menupopup");
					if (gm_popup) {
						menuitem = menuitem.cloneNode(true);
						menuitem.setAttribute("id", this._id);
						gm_popup.insertBefore(menuitem, gm_popup.children[3]);

						// 添加 tooltiptext
						gm_popup.addEventListener('popupshowing', self.gmPopupShowing, true);
						// 添加中键打开主页
						gm_popup.addEventListener('click', self.gmPopupClicked, true);
					} else {
						setTimeout(addToGreasemonkey, 500);
					}
				};

				addToGreasemonkey();
			}
		},
		uninit: function(){
			[this._id, this._id2].forEach(function(id){
				var menuitem = document.getElementById(id);
				if(menuitem){
					menuitem.parentNode.removeChild(menuitem);
				}
			});

			var gm_popups = document.querySelectorAll("#gm_general_menu > menupopup, #greasemonkey-tbb > menupopup");
			if (gm_popups) {
				[].forEach.call(gm_popups, function(popup){
					popup.removeEventListener('popupshowing', this.gmPopupShowing, true);
					popup.removeEventListener('click', this.gmPopupClicked, true);
				});
			}
		},
		gmPopupShowing: function(event) {
			var popup = event.currentTarget;
			var addHomeUrl = function(menuitem) {
				var script = menuitem.script;
				if (!script) return;
				if (menuitem.getAttribute('homeURL')) return;

				var downURL = script._updateURL || script._downloadURL;
				var homeURL = ApplyPatchForScript.getHomePageURL(downURL) || downURL;
				menuitem.setAttribute('homeURL', homeURL);
				menuitem.setAttribute('tooltiptext', homeURL);
			};

			[].forEach.call(popup.children, addHomeUrl);
		},
		gmPopupClicked: function(event) {
			if (event.button != 1) return;

			var homeURL = event.target.getAttribute('homeURL');
			if (homeURL && homeURL.startsWith('http')) {
				openLinkIn(homeURL, 'tab', { inBackground: prefs.inBackground });
				event.stopPropagation();
				event.preventDefault();
			}
		},
		getFocusedWindow: function () {
			var win = document.commandDispatcher.focusedWindow;
			return (!win || win == window) ? content : win;
		},
		findscripts: function(){
			var wins = this.getFocusedWindow();
			var href = wins.location.href;
			if(!href) return;
			var p=0;			//for number of "."
			var f= new Array();
			var q=2;
			var t=1;
			var a=0;
			var y;
			var o;
			var m=4;
			var stringa; //= new Array();
			var re = /(?:[a-z0-9-]+\.)+[a-z]{2,4}/;
			href=href.match(re); //extract the url part
			href=href.toString();
			//get the places and nunbers of the "."
			for (var i=0;i<href.length;i++){
				if (href[i]=="."){
					f[p]=i;
					p++ ;
				}
			}
			if (p==t){
				stringa=href.substring(a,f[0]);
			}else if  (p==q){
				stringa=href.substring(++f[0],f[1]);
			}
			else {
				stringa=href.substring(++f[0],f[2]);
			}

			openLinkIn("http://www.google.com/search?q=site:userscripts-mirror.org+inurl:scripts+inurl:show+"+ stringa, "tab", {});
			openLinkIn("https://greasyfork.org/scripts/search?q="+ stringa,  "tab", { inBackground: false});
		}
	};

	window.GreaemonkeyEnhancer.init();

})()


