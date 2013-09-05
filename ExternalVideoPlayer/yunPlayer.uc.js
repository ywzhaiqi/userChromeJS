// ==UserScript==
// @name           yunPlayer.uc.js
// @description    右键菜单调用云点播
// @namespace      https://github.com/ywzhaiqi
// @author         ywzhaiqi
// @include        main
// @charset        UTF-8
// @version        0.1
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/tree/master/uAutoPagerize
// @reviewURL
// @note
// ==/UserScript==

(function (){

	var API_URL = "http://www.happyfuns.com/happyvod/api.php#!url=";
	var link_regexp = /\.(?:rmvb|mp4)$|^(?:thunder|ed2k)/i;
	var location_regexp = /^$/i;

	if(window.yunPlayer){
		window.yunPlayer.uninit();
		delete window.yunPlayer;
	}

	window.yunPlayer = {
		init: function(){
			var contextMenu = $("contentAreaContextMenu");

			var menuitem = $C("menuitem", {
				id: "yun-player-context",
				label: "云点播播放",
				hidden: true,
				oncommand: "yunPlayer.run()"
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
					if(gContextMenu.onLink){
						if(link_regexp.test(gContextMenu.linkURL))
							return menuitem.hidden = false;
						if(location_regexp.test(locationHref))
							return menuitem.hidden = false;
					}
					menuitem.hidden = true;
					break;
			}
		},
		run: function(){
			var url = API_URL + gContextMenu.linkURL;
			var nextTabIndex = gBrowser.mCurrentTab._tPos + 1;
		   	var tab = gBrowser.loadOneTab(url, null, null, null, false, false);
		   	gBrowser.moveTabTo(tab, nextTabIndex);
		}
	};

	function $(id) document.getElementById(id);
	function $C(name, attr) {
		var el = document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}
})();

window.yunPlayer.init();