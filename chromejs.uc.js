// 在地址栏打开 chromejs
location == "chrome://browser/content/browser.xul" && (function(){
	var urlbar = document.getElementById("urlbar");
	try{
		eval("urlbar.handleCommand="+ urlbar.handleCommand.toString(
		    ).replace("var url = this.value;", "var url = this.value;" + 
		    "if(url.indexOf('chromejs:') == 0) return eval(url.slice(9));"));
	}catch(e) {}
})();
