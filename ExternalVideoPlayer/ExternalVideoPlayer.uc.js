// ==UserScript==
// @name           ExternalVideoPlayer.uc.js
// @description    调用外部播放器播放网络视频。
// @author         ywzhaiqi
// @namespace      ywzhaiqi@gmail.com
// @include        main
// @charset        UTF-8
// @version        2014.07.20
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/tree/master/ExternalVideoPlayer
// @reviewURL      http://bbs.kafan.cn/thread-1587228-1-1.html
// @note           youku、悦台、网易视频、优米等调用外部播放器播放。土豆、奇艺等不支持外部播放的新页面打开 flvcd 网址。
// @note           2013/06/22 ver0.003 增加了大量的站点，增加了二级菜单清晰度的选择。
// @note           2013/06/21 ver0.002 修正几个错误
// @note           2013/06/17 ver0.001 init
// ==/UserScript==

(function(){

    var IS_CLOSE_TAB = true;  // 启动后是否关闭标签

    var DEFAULT_ENCODING = "gbk";  // 默认播放列表编码

    // 下载设置
    var IDM_PATH = "D:\\Program Files\\Internet Download Manager\\IDMan.exe";

    var VIDEO_FORMAT = {  // 清晰度
        "normal": "标清",
        "high": "高清",
        "super": "超清",
        // "super2": "原画",   // 非全部支持
    };

    var PLAYER_PLS = /\bs?mplayer\b/i;  // pls 播放列表格式
    var PLAYER_XSPF = /\bvlc\b/i;  // xspf 播放列表格式
    var PLAYER_URLS = /^$/i;  // 直接传递地址
    var PLAYER_COPY = /BaiduPlayer/i;  // 复制链接到剪贴板

    var LINK_CLICKED_COLOR = "#666666";

    var LINK_SHOW = [
        "^http://d\\.pcs\\.baidu\\.com/file/",
        "http://gdl\\.lixian\\.vip\\.xunlei\\.com",
        "\\.(?:mp4|flv|rm|rmvb|mkv|asf|wmv|avi|mpeg|mpg|mov|qt)$"
    ];

    var LINK_EXCLUDE = [
        "http://www.youku.com/",
        "http://www.tudou.com/",
        "http://www.iqiyi.com/"
    ];

    var HOST_REGEXP = /www\.soku\.com|youku|yinyuetai|ku6|umiwi|sina|v\.163\.com|56|joy|v\.qq|letv|(mv|zhangmen)\.baidu|wasu|pps|kankan|funshion|tangdou|acfun\.tv|www\.bilibili\.tv|v\.ifeng\.com|cntv\.cn/i;


    let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
    Cu.import("resource://gre/modules/FileUtils.jsm");
    Cu.import("resource://gre/modules/NetUtil.jsm");

    if (window.externalVideoPlayer) {
        window.externalVideoPlayer.uninit();
        delete window.externalVideoPlayer;
    }

    var Instances = {
        get fp() Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker),
        get lf() Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile),
        get process() Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess),
    };

    var Util = (function(){
        var getFocusWindow = function (){
            return gContextMenu && gContextMenu.target ? gContextMenu.target.ownerDocument.defaultView : content;
        };

        var getRangeAll = function (win) {
            win || (win = getFocusWindow());
            var sel = win.getSelection();
            var res = [];
            for (var i = 0; i < sel.rangeCount; i++) {
                res.push(sel.getRangeAt(i));
            }
            return res;
        };

        var getSelection = function(win) {
            // from getBrowserSelection Fx19
            win || (win = getFocusWindow());
            var selection  = getRangeAll(win).join(" ");
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
        };

        var clipboardWrite = function(str){
            Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper)
                .copyString(str);
        };

        var exec = function(path, args, blocking){
            args || (args = []);
            blocking || (blocking = false);

            var file    = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
            var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
            try {
                file.initWithPath(path);

                if (!file.exists()) {
                    Cu.reportError('File Not Found: ' + path);
                }

                if (file.isExecutable()) {
                    process.init(file);
                    process["runw" in process ? "runw" : "run"](blocking, args, args.length);
                } else {
                    file.launch();
                }

            } catch(e) {}
        };

        var safeTitle = function(title) {
            return title.replace(/[\\\|\:\*\"\?\<\>]/g,"_");
        };

        return {
            getSelection: getSelection,
            clipboardWrite: clipboardWrite,
            exec: exec,
            safeTitle: safeTitle
        };
    })();

    var ns = window.externalVideoPlayer = {
        FILE_NAME: "externalVideoPlayer",
        _canPlay: true,
        get prefs() {
            delete this.prefs;
            return this.prefs = Services.prefs.getBranch("userChromeJS.ExternalVideoPlayer.");
        },
        get IDM_hidden() {
            if(!this._IDM_hidden){
                var idm_file = FileUtils.File(IDM_PATH);
                this._IDM_hidden = !idm_file.exists()
            }
            return this._IDM_hidden;
        },

        init: function(){
            this.LINK_SHOW_REGEXP = new RegExp(LINK_SHOW.join("|"), "i");

            var contextMenu = $("contentAreaContextMenu");
            var ins = $("context-openlinkincurrent") || contextMenu.firstChild;

            this._menuitem = this.createMenuItem();
            contextMenu.insertBefore(this._menuitem, ins);

            contextMenu.addEventListener("popupshowing", this, false);
        },
        uninit: function(){
            if(this._menuitem)
                this._menuitem.parentNode.removeChild(this._menuitem);

            $("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
        },
        handleEvent: function(event){
            switch(event.type){
                case "popupshowing":
                    if (event.target != event.currentTarget) return;
                    this._menuitem.hidden = !this.isValidLocation();
                    if(gContextMenu.onLink){
                        this._menuitem.setAttribute("label", "用外部播放器播放当前链接");
                    }else{
                        this._menuitem.setAttribute("label", "用外部播放器播放当前页面");
                    }
                    break;
            }
        },
        createMenuItem: function(){
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

            // create menuitem dynamic
            for(var format in VIDEO_FORMAT){
                let label = VIDEO_FORMAT[format];
                menuitem = $C("menuitem", {
                    label: "播放（" + label + "）",
                    oncommand: "externalVideoPlayer.run('" + format + "')",
                });
                menupopup.appendChild(menuitem);
            }

            menupopup.appendChild($C("menuseparator", {}));

            menuitem = $C("menuitem", {
                label: "打开 Flvcd 的解析链接",
                oncommand: "externalVideoPlayer.run(null, 'openFlvcd')",
            });
            menupopup.appendChild(menuitem);

            // menuitem = $C("menuitem", {
            //     label: "下载（Flashgot）",
            //     hidden: true,
            //     oncommand: "externalVideoPlayer.run('super', 'download_flashgot')",
            // });
            // menupopup.appendChild(menuitem);

            // menuitem = $C("menuitem", {
            //     label: "下载（DTA）",
            //     hidden: true,
            //     oncommand: "externalVideoPlayer.run('super', 'download_DTA')",
            // });
            // menupopup.appendChild(menuitem);

            menuitem = $C("menuitem", {
                label: "下载（IDM）",
                hidden: ns.IDM_hidden,
                oncommand: "externalVideoPlayer.run('super', 'download_IDM')",
            });
            menupopup.appendChild(menuitem);

            menuitem = $C("menuitem", {
                label: "下载（内置）",
                oncommand: "externalVideoPlayer.run(null, 'download_normal')",
            });
            menupopup.appendChild(menuitem);

            // menuitem = $C("menuitem", {
            //  label: "下载（Aria2）",
            //  oncommand: "externalVideoPlayer.run(null, 'download_aria2')",
            // });
            // menupopup.appendChild(menuitem);

            menupopup.appendChild($C("menuseparator", {}));

            menuitem = $C("menuitem", {
                label: "设置播放器",
                oncommand: "externalVideoPlayer.getPlayer(true)",
            });
            menupopup.appendChild(menuitem);

            menu.appendChild(menupopup);
            return menu;
        },
        isValidLocation: function(){
            // 设置初始值
            this._canPlay = true;
            this.execOnceURL = null;

            var hostname = content.location.hostname,
                locationHref = content.location.href;

            if(gContextMenu.onLink){
                if(hostname == "www.flvcd.com" || this.LINK_SHOW_REGEXP.test(gContextMenu.linkURL)){
                    this.execOnceURL = gContextMenu.linkURL;
                    return true;
                }
            } else {
                var selection = Util.getSelection();
                if(selection && this.LINK_SHOW_REGEXP.test(selection)){
                    this.execOnceURL = selection;
                    return true;
                }

                // 不在链接上时，排除首页
                if(LINK_EXCLUDE.indexOf(content.location.href) != -1){
                    return false;
                }
            }

            if(HOST_REGEXP.test(hostname)){
                return true;
            }

            // tudou 没法用外置播放器看，其它由于网络限制，只能用硕鼠下载
            if(/tudou|qiyi|v\.sohu\.com|v\.pptv/.test(hostname)){
                this._canPlay = false;
                return true;
            }

            // funshion 不支持？

            return false;
        },
        run: function(format, type, url){
            // 直接启动播放器
            if(this.execOnceURL){
                this.launchPlayer(this.execOnceURL);
                if(gContextMenu.target){
                    gContextMenu.target.style.color = LINK_CLICKED_COLOR;
                }
                return;
            }

            var tabToClose = null;
            if (!url) {
                var onLink = gContextMenu && gContextMenu.onLink;
                url = onLink ? gContextMenu.linkURL : content.location.href;
                if(IS_CLOSE_TAB && !onLink){
                    tabToClose = gBrowser.mCurrentTab;
                }
            }

            // // 如果用了 youkuHTML5 等解析地址脚本
            // var playlistDiv = content.document.getElementById("playlist");
            // if (type.indexOf('download') != -1 && playlistDiv) {
            //     var list = Array.slice(div.querySelectorAll('a')).map(function(link){
            //         return {
            //             title: link.getAttribute('title'),
            //             url: link.href
            //         }
            //     });

            //     if (type && this[type]) {  // download_IDM 等
            //     this[type](list);
            //     return;
            // }

            var flvcdUrl = 'http://www.flvcd.com/parse.php?kw=' + encodeURIComponent(url);
            if(format){
                flvcdUrl += '&format=' + format;
            }

            if(!this._canPlay && !type || type == 'openFlvcd'){
                return this.openFlvcd(flvcdUrl);
            }

            this._requestUrl = flvcdUrl;

            getHTML(flvcdUrl, function(){
                if(this.readyState == 4 && this.status == 200){
                    var opened = ns.requestLoaded(this.response, type);
                    if(opened && tabToClose){
                        gBrowser.removeTab(tabToClose, { animate: true });
                    }
                }else{
                    throw new Error(this.statusText);
                }
            }, "gbk");
        },
        requestLoaded: function(doc, type){
            var elem = doc.querySelectorAll(".mn.STYLE4")[2];
            if(!elem){
                this.openFlvcd();
                return false;
            }

            var title = doc.querySelector('input[name="name"]').getAttribute("value");
            var links = elem.querySelectorAll("a");

            var list = [];
            var len = links.length;
            if(len == 0){
                this.openFlvcd();
                return false;
            }else if(len == 1){
                list.push({
                    title: title,
                    url: links[0].href
                });
            }else{
                for (var i = 0; i < len; i++) {
                    let num = i + 1;
                    if(num < 10)
                        num = "0" + num;
                    list.push({
                        title: title + "-" + num,
                        url: links[i].href
                    });
                }
            }

            if (type && this[type]) {  // download_IDM 等
                this[type](list);
                return false;
            } else {
                this.launchPlayer(list);
                return true;
            }

            return true;
        },
        getPlayer: function(change){
            if(!change){
                var file;
                try{
                    file = this.prefs.getComplexValue("player", Ci.nsILocalFile);
                }catch(e) {}

                if(file && file.exists() && file.isExecutable()){
                    return file;
                }
            }

            var nsIFilePicker = Ci.nsIFilePicker;
            var fp = Instances.fp;
            fp.init(window, '请选择播放器', nsIFilePicker.modeOpen);
            fp.appendFilters(nsIFilePicker.filterApplication);
            fp.appendFilters(nsIFilePicker.filterAll);

            if (fp.show() != nsIFilePicker.returnOK)
                return null;

            if (fp.file.exists() && fp.file.isExecutable()) {
                this.prefs.setComplexValue("player", Ci.nsILocalFile, fp.file);
                return fp.file;
            }
        },
        launchPlayer: function(listFileOrUrl){
            var args,
                player = this.getPlayer();

            if(!player) return;

            if (listFileOrUrl instanceof Array) { // fileList
                listFileOrUrl = this.checkPlayList(listFileOrUrl, player.path);
            }

            if (typeof listFileOrUrl == "undefined") {
                args = [];
            } else if (typeof listFileOrUrl == "string") {
                args = [listFileOrUrl];
            } else if (listFileOrUrl instanceof Array) {
                args = listFileOrUrl;
            } else {
                args = [listFileOrUrl.path];
            }

            var process = Instances.process;
            process.init(player);
            process["runw" in process ? "runw" : "run"](false, args, args.length);
        },
        checkPlayList: function(list, playerPath){
            var type,
                encoding = DEFAULT_ENCODING,
                arr = playerPath.split("\\"),
                playerName = arr[arr.length - 1];

            switch(true){
                case PLAYER_PLS.test(playerName):
                    type = ".pls";
                    break;
                case PLAYER_XSPF.test(playerName):
                    type = ".xspf";
                    encoding = "utf-8";
                    break;
                case PLAYER_URLS.test(playerName):
                    return getListURLs();
                case PLAYER_COPY.test(playerName):
                    var urls = getListURLs();
                    Util.clipboardWrite(urls.join("\n"));
                    break;
                default:
                    type = ".asx";
                    break;
            }

            if(type){
                var text = this.getPlayList(list, type);
                if(text){
                    var file = this.savePlayList(this.FILE_NAME + type, text, encoding);
                    return file;
                }
            }

            function getListURLs(){
                var urls = [];
                list.forEach(function(info){
                    urls.push(info.url);
                });
                return urls;
            }
        },
        getPlayList: function(list, type){
            var text, item_tpl;
            switch(type){
                case ".asx":
                    text = '<asx version = "3.0" >\n\n';
                    item_tpl = '<entry>\n' +
                        '   <title>{title}</title>\n' +
                        '   <ref href = "{url}" />\n' +
                        '</entry>\n\n';

                    list.forEach(function(info){
                        text += nano(item_tpl, info);
                    });

                    text += "</asx>";
                    break;
                case ".pls":
                    text = "[playlist]\n";
                    item_tpl = 'File{i}="{url}"\n' +
                        'Title{i}="{title}"\n' +
                        'Length{i}=0\n';

                    list.forEach(function(info, i){
                        info.i = i + 1;
                        info.title = encode_16(info.title);

                        text += nano(item_tpl, info);
                    });
                    text += "NumberOfEntries=" + list.length + "\nVersion=2";
                    break;
                case ".xspf":
                    text = '<?xml version="1.0" encoding="UTF-8"?>\n' +
                            '<playlist xmlns="http://xspf.org/ns/0/" xmlns:vlc="http://www.videolan.org/vlc/playlist/ns/0/" version="1">\n' +
                            '    <title>播放列表</title>\n' +
                            '    <trackList>\n';

                    item_tpl = '        <track>\n' +
                        '            <location>{url}</location>\n' +
                        '            <title>{title}</title>\n' +
                        '            <extension application="http://www.videolan.org/vlc/playlist/0">\n' +
                        '                <vlc:id>{i}</vlc:id>\n' +
                        '                <vlc:option>network-caching=1000</vlc:option>\n' +
                        '            </extension>\n' +
                        '        </track>\n';

                    list.forEach(function(info, i){
                        info.i = i;
                        info.url = info.url.replace(/&/g, "&amp;");  // 腾讯视频需要这样
                        text += nano(item_tpl, info);
                    });
                    text += "    </trackList>\n</playlist>";
                    break;
                case "copy":
                    var urls = [];
                    list.forEach(function(info){
                        urls.push(info.url);
                    });
                    text = urls.join("\n");
                    break;
                case "urls":
                    break;
                default:
                    break;
            }

            return text;
        },
        openFlvcd: function(flvcdUrl){
            flvcdUrl = flvcdUrl || ns._requestUrl;
            if(flvcdUrl){
                gBrowser.selectedTab = gBrowser.addTab(flvcdUrl);
            }
        },
        savePlayList: function(fileName, data, encoding){
            var tmpfile = FileUtils.getFile("TmpD", [fileName]);
            tmpfile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);

            var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
            suConverter.charset = encoding || 'gbk';
            data = suConverter.ConvertFromUnicode(data);

            var foStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
            foStream.init(tmpfile, 0x02 | 0x08 | 0x20, 0664, 0);
            foStream.write(data, data.length);
            foStream.close();

            return tmpfile;
        },
        download_normal: function(filelist){
            if(filelist.length > 1){
                var result = confirm("该视频包含" + filelist.length + "个片段，是否要用内置的同时下载？\n取消则复制链接到剪贴板");
                if (!result) {
                    var str = this.getPlayList(filelist, "copy");
                    Util.clipboardWrite(str);
                    return;
                }
            }

            var fileExt = this.getVideoExt(filelist[0].url);

            var downloadFunc = "(" + internalSave.toString()
                    .replace("let ", "")
                    .replace("var fpParams", "fileInfo.fileExt=null;fileInfo.fileName=aDefaultFileName;var fpParams") + ")",
                useDownloadDir = Services.prefs.getBoolPref("browser.download.useDownloadDir");

            filelist.forEach(function(file, i){
                eval(downloadFunc)(file.url, null, file.title + fileExt, null, null, null, null, null, null,
                        document, useDownloadDir, null);
            });
        },
        download_flashgot: function(filelist) {
            if (!window.gFlashGot) return;

            var links = [],
                opType = gFlashGotService.OP_ONE,
                dmName = null;

            filelist.forEach(function(file, i){
                links.push({
                    href: file.url,
                    description: file.title,
                })
            });
            gFlashGot.download(links, opType, dmName)
        },
        download_DTA: function(filelist) {
            if (!window.DTA) return;

            var anchors = [], images = [];

            var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
            var wrapURL = function(url, cs) {return new DTA.URL(ios.newURI(url, cs, null));}

            filelist.forEach(function(file, i){
                anchors.push({
                    url: wrapURL(file.url, "UTF-8"),
                    description: "",
                    ultDescription: "",
                    referrer: "",
                    fileName: file.title
                })
            });

            DTA.saveLinkArray(window, anchors, images);
        },
        download_IDM: function(downInfo, activite){
            var self = this;
            var fileExt = this.getVideoExt(downInfo[0].url);

            // // 使用 bat 的方式，会被去掉 url 中的 %2 从而造成 url 不正确，不知道怎么回事
            // var data = "";
            // downInfo.forEach(function(info, i){
            //     info.name = info.title + fileExt;
            // });
            // this.runScript(downInfo, IDM_PATH, ['/a /d [URL] /f [NAME]', 'gbk']);

            var exeFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile),
                process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);

            exeFile.initWithPath(IDM_PATH);
            if (!exeFile.exists()) return;

            process.init(exeFile);

            var run = function (i) {
                var info = downInfo[i];
                if (!info) {  // 再次运行，激活到前台
                    if(typeof(activite) == "undefined" || activite){
                        return process.run(false, [], 0);
                    }
                }

                var fileName = Util.safeTitle(info.title) + fileExt;
                var args = ["/a", "/d", info.url, "/f", fileName];
                process.runwAsync(args, args.length, {
                    observe: function(subject, topic, data) {
                        run(++i);
                    }
                });
            };

            run(0);
        },
        download_aria2: function(filelist){

        },

        // 以下几个函数来自 xthunder 扩展的 xThunderService.js 文件，已做修改。
        detectOS : function() {
            // "WINNT" on Windows Vista, XP, 2000, and NT systems; "Linux" on GNU/Linux; and "Darwin" on Mac OS X.
            // Returns UpperCase string
            if (!this.osString) {
                this.osString = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS.toUpperCase();
            }

            return this.osString;
        },
        replaceHolder : function(downInfo, exePath, arg, downDir, referrer, cookies, escape) {
            var ref = referrer || downInfo[0].url;
            var cook = cookies && cookies[0] || 0;

            var self = this;
            var args = downInfo.map(function(info) {
                return arg.replace(/\[URL\]/ig, escape ? self.escapePath(info.url) : info.url).
                    replace(/\[NAME\]/ig, escape ? self.escapePath(info.name) : info.name).
                    replace(/\[REFERER\]/ig, escape ? self.escapePath(ref) : ref).
                    replace(/\[COOKIE\]/ig, escape ? self.escapePath(cook) : cook).
                    replace(/\[COMMENT\]/ig, escape ? self.escapePath(info.desc) : info.desc);
            });

            return args;
        },
        escapePath : function (path) {
            return path ? ( this.detectOS() == "WINNT" ? "\"" + path + "\"" : path.replace(/([\\\*\?\[\]\$&<>\|\(\)\{\};"'`])/g,"\\$1").replace(/\s/g,"\\ ") )
                        : path;
        },
        runScript : function(downInfo, exePath, args, downDir, referrer, cookies) {
            var downDir = this.escapePath(downDir);
            var programArgs = this.replaceHolder(downInfo, exePath, args[0], downDir, referrer, cookies, true);

            if (this.detectOS() == "WINNT") {
                var batEncoding = args[1] || "UTF-8";
                var batText = "@echo off\r\n" +
                    "title ExternalVideo\r\n" +
                    (downDir ? "if not exist " + downDir + " md " + downDir + "\r\n" + "cd /d " + downDir + "\r\n": "");

                var escapedExePath = this.escapePath(exePath);
                programArgs.forEach(function(programArg) {
                    batText += escapedExePath + " " + programArg + "\r\n";
                });

                this.runNative(this.createTempFile(batText, ".bat", batEncoding), []);
            } else {
                var shellEncoding = "UTF-8";
                var shellText = '#!/bin/sh\n' +
                    'if [ "$1" = "" ]; then\n' +
                    '  if [ "$COLORTERM" = "gnome-terminal" ] && which gnome-terminal >/dev/null 2>&1; then\n' +
                    '    gnome-terminal -t xThunder -x /bin/sh "$0" term && exit\n' +
                    '  fi\n' +
                    '  if which xterm >/dev/null 2>&1; then\n' +
                    '    xterm -T xThunder -e /bin/sh "$0" term && exit\n' +
                    '  fi\n' +
                    'fi\n' +
                    'if [ ! -d ' + downDir + ' ]; then\n' +
                    '  mkdir -p ' + downDir + '\n' +
                    'fi\n' +
                    'cd ' + downDir + '\n';

                var escapedExePath = this.escapePath(exePath);
                programArgs.forEach(function(programArg) {
                    batText += escapedExePath + " " + programArgs + "\n";
                });

                this.runNative(this.createTempFile(shellText, ".sh", shellEncoding), []);
            }
            return 0;
        },
        runNative: function(exePath, args, blocking) {
            if (typeof blocking == 'undefined') blocking = false;
            var exeFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
            exeFile.initWithPath(exePath);
            if (exeFile.exists()) {
                var proc = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
                proc.init(exeFile);
                //var cs = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
                //cs.logStringMessage("Running " + exePath + " " + args.join(" "));
                proc["runw" in proc ? "runw" : "run"](blocking, args, args.length);
                return 0;
            } else {
                return this.EXE_NOT_FOUND;
            }
        },
        createTempFile : function(data, ext, charset) {
            var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("TmpD", Ci.nsIFile);
            file.append("ExternalVideoPlayer");
            if (!file.exists()) {
                file.create(Ci.nsIFile.DIRECTORY_TYPE, 0700);
            }
            file.append("ExternalVideoPlayer" + (ext || ".xtd"));
            // file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0700);
            file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);

            var foStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
            foStream.init(file, 0x02 | 0x08 | 0x20, 0700, 0);
            var converter = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
            converter.init(foStream, charset || "UTF-8", 0, "?".charCodeAt(0));
            converter.writeString(data);
            converter.close();

            return file.path;
        },
        getVideoExt: function(url){
            var ext;
            switch(true){
                case url.indexOf("/flv/") != -1:  // youku
                case url.indexOf(".flv?sc=") != -1: // 音悦台
                    ext = ".flv";
                    break;
                case url.indexOf("/mp4/") != -1:
                    ext = ".mp4";
                    break;
                case url.indexOf("/f4v/") != -1:
                    ext = ".f4v";
                    break;
                default:
                    ext = ".flv";
                    break;
            }

            return ext;
        },
    };

    function debug() { Application.console.log("[ExternalVideoPlayer]" + Array.slice(arguments)); }
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
        xhr.onerror = function(){
            alert("Flvcd.com 无法访问或网络不通");
        };
        if(charset)
            xhr.overrideMimeType("text/html; charset=" + charset);
        xhr.send(null);
    }

    function nano(template, data) {
        return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
            var keys = key.split("."),
                v = data[keys.shift()];
            for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
            return (typeof v !== "undefined" && v !== null) ? v : "";
        });
    }

    function encode_16(str){
        var s = ""
        for (var i = 0; i < str.length; i++) {
            s += "\\x" + str.charCodeAt(i).toString(16)
        }
        return s
    }


})();


window.externalVideoPlayer.init();