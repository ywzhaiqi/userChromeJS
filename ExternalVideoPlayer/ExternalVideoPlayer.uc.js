// ==UserScript==
// @name           ExternalVideoPlayer.uc.js
// @description    youku、qiyi 等调用外部播放器
// @author         ywzhaiqi
// @namespace      ywzhaiqi@gmail.com
// @include        main
// @charset        UTF-8
// @version        0.0.2
// @note           2013/06/21 ver0.002 修正几个错误
// @note           2013/06/17 ver0.001 init
// ==/UserScript==

if(typeof window.externalVideoPlayer != 'undefined'){
	window.externalVideoPlayer.uninit();
	delete window.externalVideoPlayer;
}

(function(){

	// 播放器路径
	var PLAYER_PATH = "D:\\Program Files\\Potplayer15b_37776_with_Real\\PotPlayerMini.exe";
	// 默认清晰度
	var default_format = "normal";  // high  super


	let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
	Components.utils.import("resource://gre/modules/FileUtils.jsm");
	Components.utils.import("resource://gre/modules/NetUtil.jsm");

	var ns = window.externalVideoPlayer = {
		PLAYER_PATH: PLAYER_PATH,
		default_format: default_format,
		FILE_NAME: "externalVideoPlayer.asx",
		_menuItemId: "external-video-player",
		_menuItem: null,

		init: function(){
			this.addMenuItem();
		},
		uninit: function(){
			if(this._menuItem){
				this._menuItem.parentNode.removeChild(this._menuItem);
			}
			$("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
		},
		handleEvent: function(event){
			switch(event.type){
				case "popupshowing":
					if (event.target != event.currentTarget) return;
					this._menuItem.hidden = !this.isValidLocation();
					if(gContextMenu.onLink){
						this._menuItem.setAttribute("label", "用外部播放器播放当前链接");
					}else{
						this._menuItem.setAttribute("label", "用外部播放器播放当前页面");
					}
					break;
			}
		},
		addMenuItem: function(){
			var menuItem = document.createElement("menuitem");
			menuItem.setAttribute("id", this._menuItemId);
			menuItem.setAttribute("oncommand", "externalVideoPlayer.onCommand(event)");

			var contextMenu = $("contentAreaContextMenu");
			this._menuItem = contextMenu.insertBefore(menuItem, contextMenu.firstChild);

			contextMenu.addEventListener("popupshowing", this, false);
		},
		onCommand: function(event){
			if(gContextMenu.onLink){
				this.run(gContextMenu.linkURL);
			}else{
				this.run();
			}
		},
		isValidLocation: function(){
			// tudou 没法用外置播放器看
			// qiyi 由于网络限制，只能用硕鼠下载
			if(content.location.hostname.match(/youku|qiyi|umiwi|v\.163\.com|yinyuetai|funshion/)){
				return true;
			}

			return false;
		},
		run: function(url, format){
			url = url || content.location.href;
			format = format || ns.default_format;

			var flvcdUrl = 'http://www.flvcd.com/parse.php?kw=' + encodeURIComponent(url) + 
				'&flag=&format=' + format;

			request(flvcdUrl, this.requestLoaded);
		},
		requestLoaded: function(doc){
			var elem = doc.querySelectorAll(".mn.STYLE4")[2];
			if(!elem) return;

			var title = doc.querySelector('input[name="name"]').getAttribute("value");

			var links = elem.querySelectorAll("a");
			var videoUrls = [];
			for (var i = 0; i < links.length; i++) {
				videoUrls.push(links[i].href);
			}

			ns.createVideoList(videoUrls, title);
		},
		createVideoList: function(urls, title){
			title = title || "";

			var asxText = '<asx version = "3.0" >\n\n';
			var item_tpl = '<entry>\n' +
				'	<title>{title}</title>\n' + 
				'	<ref href = "{url}" />\n' +
				'</entry>\n\n';

			urls.forEach(function(url, i){
				var data = { title: title + "-" + (i + 1), url: url };
				asxText += ns.nano(item_tpl, data);
			});
			asxText += "</asx>";

			ns.saveAndRun(asxText);
		
		},
		saveAndRun: function(data){
			var tmpfile = FileUtils.getFile("TmpD", [ns.FILE_NAME]);
			tmpfile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
			
			var ostream = FileUtils.openSafeFileOutputStream(tmpfile)

			var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
			                createInstance(Ci.nsIScriptableUnicodeConverter);
			converter.charset = "UTF-8";
			var istream = converter.convertToInputStream(data);

			// The last argument (the callback) is optional.
			NetUtil.asyncCopy(istream, ostream, function(status) {
			  	if (!Components.isSuccessCode(status)) {
			    	// Handle error!
			    	return;
			  	}

			  	// Data has been written to the file.
			  	var playerFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
			  	var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);

			  	try{
			  		playerFile.initWithPath(ns.PLAYER_PATH);

			  		if(playerFile.exists() && playerFile.isExecutable()){
			  			process.init(playerFile);
			  			process.run(false, [tmpfile.path], 1);
			  		}else{
			  			tmpfile.launch();
			  		}
			  	}catch(e) {
			  		tmpfile.launch();
			  	}
			});
		},
		_regex: /\{([\w\.]*)\}/g,
		nano: function(template, data) {
		    return template.replace(this._regex, function(str, key) {
		        var keys = key.split('.'),
		            value = data[keys.shift()];
		        keys.forEach(function(key) {
		            value = value[key];
		        });
		        return (value === null || value === undefined) ? '' : value;
		    });
		},
	};

	ns.init();

	function debug(arg) { content.console.log(arg); }
	function $(id) document.getElementById(id);

	function request(url, callback){
		debug("Request: " + url);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(this.readyState != 4) return;
			var text = this.responseText;
			var doc = new DOMParser().parseFromString(text, "text/html");
			debug("Get doc");
			callback(doc);
		};
		xhr.overrideMimeType("text/html;charset=gbk");
		xhr.open("GET", url, true);
		xhr.send(null);
	}

})();
