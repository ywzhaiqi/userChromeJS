// ==UserScript==
// @name           ExternalVideoPlayer.uc.js
// @description    调用外部播放器播放网络视频。
// @author         ywzhaiqi
// @namespace      ywzhaiqi@gmail.com
// @include        main
// @charset        UTF-8
// @version        0.0.6
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

	// 播放器路径，不填或不正确会打开 asx 文件，一般是 wmp 关联，需要安装解码器
	// var PLAYER_PATH = "D:\\Program Files\\Potplayer\\PotPlayerMini.exe";
	// var PLAYER_PATH = "D:\\App\\SMPlayer\\smplayer.exe";
	var PLAYER_PATH = "";

    // pls 播放列表格式
    var PLAYER_PLS = /s?mplayer\.exe/

	// 清晰度: normal high super supper2

	// 下载设置
	var IDM_PATH = "D:\\Program Files\\Internet Download Manager\\IDMan.exe";

	let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
	Components.utils.import("resource://gre/modules/FileUtils.jsm");

	var ns = window.externalVideoPlayer = {
		PLAYER_PATH: PLAYER_PATH,
		FILE_NAME: "externalVideoPlayer",
		_canPlay: true,
		_noPlayer: false,
		_video_path_cache: {},

		init: function(){

			this.addMenuItem();

		},
		uninit: function(){
			if(this._menu)
				this._menu.parentNode.removeChild(this._menu);

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

			ns._canPlay = true;

			var hostname = content.location.hostname;
			if(hostname.match(/youku|yinyuetai|ku6|umiwi|sina|163|56|joy|v\.qq|letv|(tieba|mv|zhangmen)\.baidu|wasu|pps|kankan\.xunlei|tangdou|taiyuan\.acfun\.tv|www\.bilibili\.tv/)){
				return true;
			}

			// tudou 没法用外置播放器看，其它由于网络限制，只能用硕鼠下载
			if(hostname.match(/tudou|qiyi|v\.sohu\.com|v\.pptv/)){
				ns._canPlay = false;
				return true;
			}

			// funshion 不支持？

			return false;
		},
		run: function(format, type){
			var url;
			if(gContextMenu && gContextMenu.onLink){
				url = gContextMenu.linkURL;
			}else{
				url = content.location.href;
			}

			var flvcdUrl = 'http://www.flvcd.com/parse.php?kw=' + encodeURIComponent(url);
			if(format){
				flvcdUrl += '&format=' + format;
			}

			if(!ns._canPlay || type == 'open'){
				return ns.openFlvcd(flvcdUrl);
			}

                getHTML(flvcdUrl, function(){
                    if(this.readyState == 4 && this.status == 200){
                            ns.requestLoaded(this.response, type);
                    }else{
                        throw new Error(this.statusText);
                    }
                }, "gbk");
				ns._requestUrl = flvcdUrl;

		},
		openFlvcd: function(flvcdUrl){
			flvcdUrl = flvcdUrl || ns._requestUrl;
			if(flvcdUrl){
				gBrowser.addTab(flvcdUrl);
			}
		},
		requestLoaded: function(doc, type){
            log("requestLoaded")

			var content = doc.querySelectorAll(".mn.STYLE4")[2];
			if(!content){
				return ns.openFlvcd();
			}

			var title = doc.querySelector('input[name="name"]').getAttribute("value");
			var links = content.querySelectorAll("a");

			var list = [];
			var len = links.length;
			if(len == 0){
				ns.openFlvcd();
				return;
			}else if(len == 1){
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
					if(ns.PLAYER_PATH.match(PLAYER_PLS)){
						// ns.run_mplayer(list);
                        ns.saveAndRun_pls(list)
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

			list.forEach(function(info){
				text += ns.nano(item_tpl, {
					title: info.title,
					url: info.url
				});
			});

			text += "</asx>";

			var file = ns.saveList(ns.FILE_NAME + ".asx", text);
			ns.initPlayer();
			ns.launch(file);
		},
		saveAndRun_pls: function(list){
			var text = "[playlist]\n";
			list.forEach(function(info, i){
                i += 1
				text += "File" + i + "=" + info.url + "\n" +
                    "Title" + i + "=" + ns.encode_16(info.title) + "\n" +
                    "Length" + i + "=0\n"
			});
            text += "NumberOfEntries=" + list.length +
                "\nVersion=2"
			var file = ns.saveList(ns.FILE_NAME + ".pls", text);
			ns.initPlayer();
			ns.launch(file);
		},
        encode_16: function(str){
            var s = ""
            for (var i = 0; i < str.length; i++) {
                s += "\\x" + str.charCodeAt(i).toString(16)
            }
            return s
        },
		run_mplayer: function(list){
			var args = [];
			list.forEach(function(info){
				args.push(info.url);
			});

			ns.exec(ns.PLAYER_PATH, args);
			ns._playerProcess.run(false, args, args.length);
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
				ns.exec(IDM_PATH, ["/a", "/d", file.url, "/f", title_gbk], true);
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

			// ns._video_path_cache[ns._requestUrl] = file.path;
			ns._requestUrl = null;
		},
		exec: function(path, args, blocking){
	        path = ns.handleRelativePath(path);
	        blocking = typeof(blocking) == 'undefined' ? false : blocking;

			var file    = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
			var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
			try {
				file.initWithPath(path);

	            if (!file.exists()) {
	                Cu.reportError('File Not Found: ' + path);
	            }

	            if (file.isExecutable()) {
	                process.init(file);
	                process.run(blocking, args, args.length);
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


	function log(arg) { Application.console.log("[ExternalVideoPlayer]" + arg); }
	function $(id) document.getElementById(id);

	function $C(name, attr) {
		var el = document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}

    function getHTML(url, callback, charset){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "document";
        xhr.onload = callback;
        if(charset)
            xhr.overrideMimeType("text/html; charset=" + charset);
        xhr.send(null);
    }

})();


window.externalVideoPlayer.init();