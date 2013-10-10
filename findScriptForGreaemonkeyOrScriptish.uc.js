// ==UserScript==
// @name           findScriptForGreasemonkeyOrScriptish.uc.js
// @namespace      ywzhaiqi@gmail.com
// @description    给 Greasemonkey、Scriptish 添加 "为本站搜索脚本" 功能。
// @include        main
// @charset        utf-8
// @author         ywzhaiqi
// @version        2013/10/10
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/blob/master/findScriptForGreaemonkeyOrScriptish.uc.js
// ==/UserScript==

if(window.FindScriptForScriptish){
    window.FindScriptForScriptish.uninit();
    delete window.FindScriptForScriptish;
}

var FindScriptForScriptish = {
	_id: "Scriptish-find-script",
	init: function(){
        var isCN = navigator.language.substr(0, 2) == "zh";

		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute("id", this._id);
		menuitem.setAttribute("label", isCN ? "为本站搜索脚本(S)" : "find Script");
        menuitem.setAttribute("accesskey", "s");
		menuitem.setAttribute("oncommand", "FindScriptForScriptish.findscripts()");

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
		var GM_popup = document.querySelector("#greasemonkey-tbb menupopup");
		if(GM_popup){
			GM_popup.insertBefore(menuitem, GM_popup.children[3]);
		}
	},
    uninit: function(){
        var menuitem = document.getElementById(this._id);
        if(menuitem){
            menuitem.parentNode.removeChild(menuitem);
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

        var url = "http://www.google.com/search?btnG=Google+Search&q=site:userscripts.org+inurl:scripts+inurl:show+"+ stringa;
		openLinkIn(url, "tab", { inBackground: false});
		// openLinkIn("http://userscripts.org/scripts/search?q="+ stringa + "&submit=Search",  "tab", {});
	}
};

FindScriptForScriptish.init();