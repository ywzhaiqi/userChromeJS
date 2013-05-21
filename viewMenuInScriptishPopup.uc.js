// ==UserScript==
// @name           viewMenuInScriptishPopup.uc.js
// @namespace      ywzhaiqi@gmail.com
// @description    给 Scriptish 添加 "为本站搜索脚本" 功能。
// @include        main
// @charset        utf-8
// @compatibility  Firefox 4.0+
// @author         ywzhaiqi
// @version        2013/05/12
// ==/UserScript==

if(typeof viewMenuInScriptishPopup != 'undefined'){
	viewMenuInScriptishPopup.uninit();
	delete viewMenuInScriptishPopup;
}

var viewMenuInScriptishPopup = {
	init: function(){
		var scriptishShow = document.getElementById("scriptish-tb-show-us");
		if(!scriptishShow) return;

		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute("id", "Scriptish-find-script");
		menuitem.setAttribute("label", "为本站搜索脚本(S)");
        menuitem.setAttribute("accesskey", "s");
		menuitem.setAttribute("oncommand", "viewMenuInScriptishPopup.findscripts()");

		scriptishShow.parentNode.insertBefore(menuitem, scriptishShow.nextSibling);
        scriptishShow.parentNode.insertBefore(
            document.createElement("menuseparator"),
            scriptishShow.nextSibling
        );
	},
	uninit: function(){
		var menuitem = document.getElementById("Scriptish-find-script");
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
		//openLinkIn("http://www.google.com/search?btnG=Google+Search&q=site:userscripts.org+inurl:scripts+inurl:show+"+ stringa, "tab", {});
		openLinkIn("http://userscripts.org/scripts/search?q="+ stringa + "&submit=Search",  "tab", {});
	}
};

viewMenuInScriptishPopup.init();