// ==UserScript==
// @name           yunPlayer.uc.js
// @description    右键菜单调用云点播
// @namespace      https://github.com/ywzhaiqi
// @author         ywzhaiqi
// @include        main
// @charset        UTF-8
// @version        0.2
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/blob/master/ExternalVideoPlayer/yunPlayer.uc.js
// @note
// ==/UserScript==

(function (){

	var API_URL = "http://www.happyfuns.com/happyvod/api.php#!url=";
	var link_regexp = /\.(?:rmvb|mp4)$|^(?:thunder|ed2k|magnet):/i;
	var location_regexp = /^$/i;

	if(window.yunPlayer){
		window.yunPlayer.uninit();
		delete window.yunPlayer;
	}

	window.yunPlayer = {
		get focusedWindow() {
			return gContextMenu && gContextMenu.target ? gContextMenu.target.ownerDocument.defaultView : content;
		},

		init: function(){
			var contextMenu = $("contentAreaContextMenu");

			var menuitem = $C("menuitem", {
				id: "yun-player-context",
				label: "云点播播放",
				hidden: true,
				oncommand: "yunPlayer.run(this.getAttribute('tooltiptext'))"
			});

			contextMenu.insertBefore(menuitem, contextMenu.firstChild);
			contextMenu.addEventListener("popupshowing", this, false);
		},
		uninit: function(){
			var contextMenu = $("contentAreaContextMenu");
			var menuitem = $("yun-player-context");

			if(menuitem)
				contextMenu.removeChild(menuitem);

			contextMenu.removeEventListener("popupshowing", this, false);
		},
		handleEvent: function(event){
			switch(event.type){
				case "popupshowing":
					var menuitem = $("yun-player-context");
					var locationHref = content.location.href;

					var hidden = true;
					if(gContextMenu.onLink){
						var url = gContextMenu.linkURL;
						if(link_regexp.test(url))
							menuitem.setAttribute("tooltiptext", url);
							hidden = false;
						// if(location_regexp.test(locationHref))
						// 	hidden = false;
					}

					var selection = this.getSelection();
					if(link_regexp.test(selection)){
						menuitem.setAttribute("tooltiptext", selection);
						hidden = false;
					}
					menuitem.hidden = hidden;
					break;
			}
		},
		run: function(url){
			if(!url) return;

			var url = API_URL + url;
			var nextTabIndex = gBrowser.mCurrentTab._tPos + 1;
		   	var tab = gBrowser.loadOneTab(url, null, null, null, false, false);
		   	gBrowser.moveTabTo(tab, nextTabIndex);
		},
		getSelection: function(win) {
			// from getBrowserSelection Fx19
			win || (win = this.focusedWindow);
			var selection  = this.getRangeAll(win).join(" ");
			if (!selection) {
				let element = document.commandDispatcher.focusedElement;
				let isOnTextInput = function (elem) {
					return elem instanceof HTMLTextAreaElement ||
						(elem instanceof HTMLInputElement && elem.mozIsTextField(true));
				};

				if (isOnTextInput(element)) {
					selection = element.QueryInterface(Ci.nsIDOMNSEditableElement)
						.editor.selection.toString();
				}
			}

			if (selection) {
				selection = selection.replace(/^\s+/, "")
					.replace(/\s+$/, "")
					.replace(/\s+/g, " ");
			}
			return selection;
		},
		getRangeAll: function(win) {
			win || (win = this.focusedWindow);
			var sel = win.getSelection();
			var res = [];
			for (var i = 0; i < sel.rangeCount; i++) {
				res.push(sel.getRangeAt(i));
			};
			return res;
		},
	};

	function $(id) document.getElementById(id);
	function $C(name, attr) {
		var el = document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}
})();

window.yunPlayer.init();