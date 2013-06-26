// ==UserScript==
// @name           ExternalVideoPlayer.uc.js
// @description    调用外部播放器播放网络视频。
// @author         ywzhaiqi
// @namespace      ywzhaiqi@gmail.com
// @include        main
// @charset        UTF-8
// @version        0.0.5
// @note           youku、悦台、网易视频、优米等调用外部播放器播放。土豆、奇艺等不支持外部播放的新页面打开 flvcd 网址。
// @note           2013/06/22 ver0.003 增加了大量的站点，增加了二级菜单清晰度的选择。
// @note           2013/06/21 ver0.002 修正几个错误
// @note           2013/06/17 ver0.001 init
// ==/UserScript==

if(typeof window.externalVideoPlayer != 'undefined'){
	window.externalVideoPlayer.uninit();
	delete window.externalVideoPlayer;
}

(function(){

	// 播放器路径
	var PLAYER_PATH = "D:\\Program Files\\Potplayer\\PotPlayerMini.exe";

	// 默认清晰度到 flvcd 网站设置。


	let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
	Components.utils.import("resource://gre/modules/FileUtils.jsm");
	Components.utils.import("resource://gre/modules/NetUtil.jsm");

	// 下载设置，
	var IDM_PATH = "D:\\Program Files\\Internet Download Manager\\IDMan.exe";

	// youku 视频地址一段时间后失效，所以 cache 有问题。
	var useCache = false;
	var DEBUG = false;

	var ns = window.externalVideoPlayer = {
		PLAYER_PATH: PLAYER_PATH,
		FILE_NAME: "externalVideoPlayer",
		_menu: null,
		_notSupported: false,
		_noPlayer: false,
		_video_path_cache: {},

		init: function(){
			this.addMenuItem();
		},
		uninit: function(){
			if(this._menu){
				this._menu.parentNode.removeChild(this._menu);
			}
			$("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
		},
		handleEvent: function(event){
			switch(event.type){
				case "popupshowing":
					if (event.target != event.currentTarget) return;
					this._menu.hidden = !this.isValidLocation();
					if(gContextMenu.onLink){
						this._menu.setAttribute("label", "用外部播放器播放当前链接");
					}else{
						this._menu.setAttribute("label", "用外部播放器播放当前页面");
					}
					break;
			}
		},
		addMenuItem: function(){
			var menu, menupopup, menuitem;
			
			menu = $C("menu", {
				id: "external-video-player",
				label: "用外部播放器播放当前页面",
				tooltiptext: "直接点击播放",
				accesskey: "v"
			});
			menu.addEventListener("click", function(event){
				if(event.target == menu){
					event.stopPropagation();
					externalVideoPlayer.run();
				}
			}, false);

			menupopup = $C("menupopup", {});

			menuitem = $C("menuitem", {
				label: "播放（普通）",
				oncommand: "event.stopPropagation();externalVideoPlayer.run('normal')",
			});
			menupopup.appendChild(menuitem);

			menuitem = $C("menuitem", {
				label: "播放（高清）",
				oncommand: "event.stopPropagation();externalVideoPlayer.run('high')",
			});
			menupopup.appendChild(menuitem);

			menuitem = $C("menuitem", {
				label: "播放（超清）",
				oncommand: "event.stopPropagation();externalVideoPlayer.run('super')",
			});
			menupopup.appendChild(menuitem);

			menupopup.appendChild($C("menuseparator", {}));

			menuitem = $C("menuitem", {
				label: "打开 Flvcd 的解析链接",
				oncommand: "event.stopPropagation();externalVideoPlayer.run(null, 'open')",
			});
			menupopup.appendChild(menuitem);

			// menupopup.appendChild($C("menuseparator", {}));

			// menuitem = $C("menuitem", {
			// 	label: "下载（内置）",
			// 	oncommand: "event.stopPropagation();externalVideoPlayer.run(null, 'download_normal')",
			// });
			// menupopup.appendChild(menuitem);

			// menuitem = $C("menuitem", {
			// 	label: "下载（IDM）",
			// 	oncommand: "event.stopPropagation();externalVideoPlayer.run(null, 'download_IDM')",
			// });
			// menupopup.appendChild(menuitem);

			// menuitem = $C("menuitem", {
			// 	label: "下载（Aria2）",
			// 	oncommand: "event.stopPropagation();externalVideoPlayer.run(null, 'download_aria2')",
			// });
			// menupopup.appendChild(menuitem);

			menu.appendChild(menupopup);
			this._menu = menu;

			var contextMenu = $("contentAreaContextMenu");
			contextMenu.insertBefore(menu, contextMenu.firstChild);
			contextMenu.addEventListener("popupshowing", this, false);

		},
		isValidLocation: function(){

			ns._notSupported = false;

			var hostname = content.location.hostname;
			if(hostname.match(/youku|yinyuetai|ku6|umiwi|sina|163|56|joy|v\.qq|letv|baidu|wasu|pps|kankan\.xunlei|tangdou|acfun\.tv|bilibili\.tv/)){
				return true;
			}

			// tudou 没法用外置播放器看，其它由于网络限制，只能用硕鼠下载
			if(hostname.match(/tudou|qiyi|v\.sohu\.com|v\.pptv/)){
				ns._notSupported = true;
				return true;
			}

			// funshion 不支持？

			return false;
		},
		// format: normal high super supper2
		run: function(format, type){
			var url;
			if(gContextMenu.onLink){
				url = gContextMenu.linkURL;
			}else{
				url = content.location.href;
			}

			var flvcdUrl = 'http://www.flvcd.com/parse.php?kw=' + encodeURIComponent(url);
			if(format){
				flvcdUrl += '&format=' + format;
			}

			if(ns._notSupported || type == 'open'){
				return ns.openFlvcd(flvcdUrl);
			}

			if(useCache && flvcdUrl in ns._video_path_cache){
				var videoPath = ns._video_path_cache[flvcdUrl];
				var videoFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
				videoFile.initWithPath(videoPath);
				ns.launch(videoFile);
			}else{
				request(flvcdUrl, ns.requestLoaded, type);
				ns._requestUrl = flvcdUrl;
			}
		},
		openFlvcd: function(flvcdUrl){
			flvcdUrl = flvcdUrl || ns._requestUrl;
			if(flvcdUrl){
				gBrowser.addTab(flvcdUrl);
			}
		},
		requestLoaded: function(doc, type){
			var elem = doc.querySelectorAll(".mn.STYLE4")[2];
			if(!elem){
				ns.openFlvcd();
				return;
			}

			var title = doc.querySelector('input[name="name"]').getAttribute("value");
			var links = elem.querySelectorAll("a");

			var list = [];
			var length = links.length;
			if(length == 0){
				return ns.openFlvcd();
			}else if(length == 1){
				list.push({
					title: title,
					url: links[0].href
				});
			}else{
				for (var i = 0; i < links.length; i++) {
					list.push({
						title: title + "-" + (i + 1),
						url: links[i].href
					});
				}
			}

			switch(type){
				case "download_normal":
					ns.download_normal(list);
					break;
				case "download_IDM":
					ns.download_IDM(list);
					break;
				case "download_aria2":
					ns.download_aria2(list);
					break;
				default:
					if(ns.PLAYER_PATH.match(/\\mplayer\.exe/)){
						ns.run_mplayer(list);
					}else{
						ns.saveAndRun_asx(list);
					}
			}
		},
		saveAndRun_asx: function(list){
			var text = '<asx version = "3.0" >\n\n';
			var item_tpl = '<entry>\n' +
				'	<title>{title}</title>\n' + 
				'	<ref href = "{url}" />\n' +
				'</entry>\n\n';

			list.forEach(function(file){
				text += ns.nano(item_tpl, {
					title: file.title, 
					url: file.url
				});
			});

			text += "</asx>";

			var file = ns.saveList(ns.FILE_NAME + ".asx", text);
			ns.initPlayer();
			ns.launch(file);
		},
		// mplayer txt 格式没法播放？
		saveAndRun_txt: function(list){
			var text = "";
			list.forEach(function(file, i){
				text += file.url + "\n";
			});
			var file = ns.saveList(ns.FILE_NAME + ".txt", text);
			ns.initPlayer();
			ns.launch(file);
		},
		run_mplayer: function(list){
			var args = [];
			list.forEach(function(info){
				args.push(info.url);
			});

			ns.exec(ns.PLAYER_PATH, args);
		},
		saveList: function(name, data){
			var tmpfile = FileUtils.getFile("TmpD", [name]);
			tmpfile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
			
			var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
			suConverter.charset = 'gbk';
			data = suConverter.ConvertFromUnicode(data);

			var foStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
			foStream.init(tmpfile, 0x02 | 0x08 | 0x20, 0664, 0);
			foStream.write(data, data.length);
			foStream.close();

			return tmpfile;
		},
		initPlayer: function(){
			if(ns.PLAYER_PATH){
				var _playerFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
				_playerFile.initWithPath(ns.PLAYER_PATH);
				if(_playerFile.exists() && _playerFile.isExecutable()){
					ns._playerProcess = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
					ns._playerProcess.init(_playerFile);
					return;
				}
			}

			ns._noPlayer = true;
		},
		// 文件名没法改？
		download_normal: function(filelist){
			filelist.forEach(function(file, i){
				window.saveURL(file.url, file.title, null, null, true, null, document);
			});
		},
		// 文件名没法改？
		download_IDM: function(filelist){
			filelist.forEach(function(file, i){
				var title_gbk = ns.convert_to_gbk(ns.safe_title(file.title));
				ns.exec(IDM_PATH, ["/a", "/d", file.url, "/f", title_gbk]);
			});
		},
		download_aria2: function(filelist){

		},
		launch: function(file){
			if(ns._noPlayer){
				file.launch();
			}else{
				ns._playerProcess.run(false, [file.path], 1);
			}

			ns._video_path_cache[ns._requestUrl] = file.path;
			ns._requestUrl = null;
		},
		exec: function(path, args){
	        path = this.handleRelativePath(path);

			var file    = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
			var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
			try {
				file.initWithPath(path);

	            if (!file.exists()) {
	                Cu.reportError('File Not Found: ' + path);
	                return;
	            }

	            if (file.isExecutable()) {
	                process.init(file);
	                process.run(false, args, args.length);
	            } else {
	                file.launch();
	            }

			} catch(e) {}
		},
	    handleRelativePath: function(path) {
	        if (path) {
	            path = path.replace(/\//g, '\\').toLocaleLowerCase();
	            var ffdir = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties)
	            			.get("ProfD", Ci.nsILocalFile).path;
	            if (/^(\\)/.test(path)) {
	                return ffdir + path;
	            }else{
	                return path;
	            }
	        }
	    },
	    convert_to_gbk: function(data){
	    	var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
	    	suConverter.charset = 'gbk';
	    	return suConverter.ConvertFromUnicode(data);
	    },
	    safe_title: function(title) {
	    	return title.replace(/[\\\|\:\*\"\?\<\>]/g,"_");
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


	function debug(arg) { if(DEBUG) content.console.log(arg); }
	function $(id) document.getElementById(id);

	function $C(name, attr) {
		var el = document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}

	function request(url, callback, arg){
		debug("Request: " + url);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(this.readyState != 4) return;
			var text = this.responseText;
			var doc = new DOMParser().parseFromString(text, "text/html");
			debug("Get doc");
			callback(doc, arg);
		};
		xhr.overrideMimeType("text/html;charset=gbk");
		xhr.open("GET", url, true);
		xhr.send(null);
	}

})();


window.externalVideoPlayer.init();