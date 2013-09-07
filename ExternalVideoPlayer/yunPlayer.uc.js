// ==UserScript==
// @name           yunPlayer.uc.js
// @description    右键菜单调用云点播
// @namespace      https://github.com/ywzhaiqi
// @author         ywzhaiqi
// @include        main
// @charset        UTF-8
// @version        0.4
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/blob/master/ExternalVideoPlayer/yunPlayer.uc.js
// @note
// ==/UserScript==

(function (){

	var API_URL = "http://www.happyfuns.com/happyvod/api.php#!url=";
	var link_regexp = /^(?:thunder|ed2k|magnet|flashget|qqdl):|\.(?:mp4|flv|rm|rmvb|mkv|asf|wmv|avi|mpeg|mpg|mov|qt)$/i;

	if(window.yunPlayer){
		window.yunPlayer.uninit();
		delete window.yunPlayer;
	}

	const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

	window.yunPlayer = {
		get focusedWindow() {
			return gContextMenu && gContextMenu.target ? gContextMenu.target.ownerDocument.defaultView : content;
		},

		init: function(){
			var contextMenu = $("contentAreaContextMenu");

			var palyerMenu = $C("menuitem", {
				id: "yun-player-context",
				label: "云点播播放",
				class: "menuitem-iconic",
				hidden: true,
				oncommand: "yunPlayer.run(this.getAttribute('tooltiptext'))",
				image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACiElEQVQ4jWWTy2+MYRTGn6IiSIbEJdGIhYiQ+AdqURsLNLHpTqUWbAmRkNCFjRCJhEgsbMzGYtxiQlzKaBt1rU7bGd/oXTv1aV2+6U3Nd/1ZvB/SOsm7O8/lnOe80rzyv2Rq3Gxdym1NOO4zUX4sZh8kHPdNXSr4cm/P/P6/5ThOovyuNh1+EKElgqzwXwuvRZQfiV/3DZnbWZuemRlc+z+4fbOFLRgWUa8IcyJoF/4L4T4V5YfCaxZeq/Deb7bmkLhdh1JRaTl8E3wWDIqoELt4JdyMKDcJ/6VxFbwVfm9t2sxczNQEnxthei+UFsKY4JOIesTAQ9F05Z9y0C7CDhF2irBLBM69PXKty0m8Npg5DhPLYFxcPSvsNmGlxekDFXgtInhvQGFeRJZxGI3svaNy7kSRcgqmG6BUCWPiwinx7pYB+G/MC3MxqFdE/YIBwVDCkZffCdP7YHIdfBfYgiHTHGbNvGFeRB8N8Ee2kunCQhgRFIX87kooLTLgMcGIiPoMKOiIlXtixWHRemc1XZkVpndcyM1WFRmLlUdENCDCwr9FRYXY8rBJ6FzjNiaHKsERlFZ9lZurT/Iptt0n3JwIu439MG9mZkgwKprvruHqxS0wsRgmN8DssRvyx1uq/yiFebF/dwWF2yLoNNumX/zsWcD1S+s5f2YrgbMEpnaY1Py+GnNI3XWpIGuiGn8iDtctZt+u5Zw8uJIjDVUcPbSRppurje3JTTBzEspP038v0bbtpV7H9la/zRyM/9KMEX00V8moWRilCpiqhp/XLBwnMec/2La91MvXJ90nwns+j6AYEziC2aOp/8BzvvOPlmrPqk+G1obBqBDHN1pVpFSf5FemZn7/b/8KdAFaIa0vAAAAAElFTkSuQmCC"
			});

			contextMenu.insertBefore(palyerMenu, contextMenu.firstChild);
			contextMenu.addEventListener("popupshowing", this, false);
		},
		uninit: function(){
			var contextMenu = $("contentAreaContextMenu");
			var playerMenu = $("yun-player-context");

			if(playerMenu)
				contextMenu.removeChild(playerMenu);

			contextMenu.removeEventListener("popupshowing", this, false);
		},
		handleEvent: function(event){
			switch(event.type){
				case "popupshowing":
					var playerMenu = $("yun-player-context");

					var hidden = true;
					if(gContextMenu.onLink){
						var url = gContextMenu.linkURL;
						if(link_regexp.test(url)){
							playerMenu.setAttribute("tooltiptext", url);
							hidden = false;
						}
					}

					var selection = this.getSelection();
					if(link_regexp.test(selection)){
						playerMenu.setAttribute("tooltiptext", selection);
						hidden = false;
					}

					playerMenu.hidden = hidden;
					break;
			}
		},
		run: function(url){
			if(!url) return;

			url = API_URL + url;
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