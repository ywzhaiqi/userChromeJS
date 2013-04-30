// ==UserScript==
// @name           AutoPagerizeFindHighlight
// @description    AutoPagerize の継ぎ足し後もページ内検索の強調をする
// @namespace      http://d.hatena.ne.jp/Griever/
// @author         Griever
// @license        MIT License
// @compatibility  Firefox 5
// @charset        UTF-8
// @include        main
// @version        0.0.1
// @note           拡張などで複数のワードを強調していても１つ目のワードしか強調しないのは仕様
// @note           GM 版の AutoPagerize でも動くと思う
// ==/UserScript==

({
	init: function() {
		//gBrowser.mPanelContainer.addEventListener("GM_AutoPagerizeNextPageLoaded", this, false);
		gBrowser.mPanelContainer.addEventListener("DOMContentLoaded", this, false)
		window.addEventListener("unload", this, false);
	},
	uninit: function() {
		//gBrowser.mPanelContainer.removeEventListener("GM_AutoPagerizeNextPageLoaded", this, false);
		gBrowser.mPanelContainer.removeEventListener("DOMContentLoaded", this, false);
		window.removeEventListener("unload", this, false);
	},
	handleEvent: function(event) {
		switch(event.type){
			case "DOMContentLoaded":
				event.target.addEventListener("GM_AutoPagerizeNextPageLoaded", this, true);
				break;
			case "GM_AutoPagerizeNextPageLoaded":
				var win = event.target.defaultView;
				var controller = gFindBar._getSelectionController(win);
				var sel = controller.getSelection(controller.SELECTION_FIND);
				if (sel.rangeCount == 0)
					return;
				gFindBar._highlightDoc(true, sel.getRangeAt(0).toString(), win)
				break;
			case "unload":
				this.uninit();
				break;
		}
	},
}).init();

