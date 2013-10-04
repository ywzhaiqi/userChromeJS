// ==UserScript==
// @name           ExternalVideoPlayer.uc.js
// @description    调用外部播放器播放网络视频。
// @author         ywzhaiqi
// @namespace      ywzhaiqi@gmail.com
// @include        main
// @charset        UTF-8
// @version        0.1.2
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/tree/master/ExternalVideoPlayer
// @reviewURL      http://bbs.kafan.cn/thread-1587228-1-1.html
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
    // var PLAYER_PATH = "D:\\Program Files\\baidu\\BaiduPlayerBaiduYun\\1.19.1.23\\BaiduPlayer.exe";
    var PLAYER_PATH = "d:\\App\\vlc-2.1.0\\vlc.exe";
    // var PLAYER_PATH = "D:\\App\\SMPlayer\\smplayer.exe";
    // var PLAYER_PATH = "D:\\Program Files\\PotPlayer\\PotPlayerMini.exe";

    var IS_CLOSE_TAB = true;  // 启动后是否关闭标签

    // 下载设置
    var IDM_PATH = "D:\\Program Files\\Internet Download Manager\\IDMan.exe";

    var PLAYER_PLS = /s?mplayer\.exe/i;  // pls 播放列表格式
    var PLAYER_XSPF = /\\vlc\.exe$/i;  // xspf 播放列表格式
    var PLAYER_URLS = /^$/i;  // 直接传递地址
    var PLAYER_COPY = /BaiduPlayer\.exe/i;  // 复制链接到剪贴板

    var LINK_CLICKED_COLOR = "#666666";
    var LINK_SHOW_REGEXP = /^http:\/\/d\.pcs\.baidu\.com\/file\/|^http:\/\/dl[^\/]+sendfile.vip.xunlei.com|\.(?:mp4|flv|rm|rmvb|mkv|asf|wmv|avi|mpeg|mpg|mov|qt)$/i;

    // 清晰度: normal high super supper2

    var HOST_REGEXP = /www\.soku\.com|youku|yinyuetai|ku6|umiwi|sina|163|56|joy|v\.qq|letv|(tieba|mv|zhangmen)\.baidu|wasu|pps|kankan\.xunlei|tangdou|acfun\.tv|www\.bilibili\.tv|v\.ifeng\.com|cntv\.cn/i;

    let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
    Components.utils.import("resource://gre/modules/FileUtils.jsm");

    var ns = window.externalVideoPlayer = {
        PLAYER_PATH: PLAYER_PATH,
        FILE_NAME: "externalVideoPlayer",

        _canPlay: true,
        get IDM_hidden() {
            if(!this._IDM_hidden){
                var idm_file = FileUtils.File(IDM_PATH);
                this._IDM_hidden = !idm_file.exists()
            }
            return this._IDM_hidden;
        },

        init: function(){
            this._menuitem = this.createMenuItem();

            var contextMenu = $("contentAreaContextMenu");
            contextMenu.insertBefore(this._menuitem, contextMenu.firstChild);
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

            menuitem = $C("menuitem", {
                label: "播放（普通）",
                oncommand: "externalVideoPlayer.run('normal')",
            });
            menupopup.appendChild(menuitem);

            menuitem = $C("menuitem", {
                label: "播放（高清）",
                oncommand: "externalVideoPlayer.run('high')",
            });
            menupopup.appendChild(menuitem);

            menuitem = $C("menuitem", {
                label: "播放（超清）",
                oncommand: "externalVideoPlayer.run('super')",
            });
            menupopup.appendChild(menuitem);

            menupopup.appendChild($C("menuseparator", {}));

            menuitem = $C("menuitem", {
                label: "打开 Flvcd 的解析链接",
                oncommand: "externalVideoPlayer.run(null, 'open')",
            });
            menupopup.appendChild(menuitem);

            menupopup.appendChild($C("menuseparator", {}));

            menuitem = $C("menuitem", {
                label: "下载（内置）",
                hidden: true,
                oncommand: "externalVideoPlayer.run(null, 'download_normal')",
            });
            menupopup.appendChild(menuitem);

            menuitem = $C("menuitem", {
                label: "下载（IDM）",
                hidden: ns.IDM_hidden,
                oncommand: "externalVideoPlayer.run('super', 'download_IDM')",
            });
            menupopup.appendChild(menuitem);

            // menuitem = $C("menuitem", {
            //  label: "下载（Aria2）",
            //  oncommand: "externalVideoPlayer.run(null, 'download_aria2')",
            // });
            // menupopup.appendChild(menuitem);

            menu.appendChild(menupopup);
            return menu;
        },
        isValidLocation: function(){
            // 设置初始值
            this._canPlay = true;
            this.execOnceURL = null;

            if(gContextMenu.onLink){
                if(LINK_SHOW_REGEXP.test(gContextMenu.linkURL)){
                    this.execOnceURL = gContextMenu.linkURL;
                    return true;
                }
            } else {
                var selection = this.getSelection();
                if(selection && LINK_SHOW_REGEXP.test(selection)){
                    this.execOnceURL = selection;
                    return true;
                }
            }

            var hostname = content.location.hostname;
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
        run: function(format, type){
            // 直接启动播放器
            if(this.execOnceURL){
                this.exec(this.PLAYER_PATH, [this.execOnceURL]);
                if(gContextMenu.target){
                    gContextMenu.target.style.color = LINK_CLICKED_COLOR;
                }
                return;
            }

            var url = gContextMenu ? gContextMenu.getLinkURL() : content.location.href;
            var closeTab = !(gContextMenu && gContextMenu.onLink);

            var flvcdUrl = 'http://www.flvcd.com/parse.php?kw=' + encodeURIComponent(url);
            if(format){
                flvcdUrl += '&format=' + format;
            }

            if(!ns._canPlay || type == 'open'){
                return ns.openFlvcd(flvcdUrl);
            }

            getHTML(flvcdUrl, function(){
                if(this.readyState == 4 && this.status == 200){
                    var opened = ns.requestLoaded(this.response, type);
                    if(IS_CLOSE_TAB && opened && closeTab){
                        gBrowser.removeTab(gBrowser.mCurrentTab, { animate: true });
                    }
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
            debug("requestLoaded")

            var elem = doc.querySelectorAll(".mn.STYLE4")[2];
            if(!elem){
                ns.openFlvcd();
                return false;
            }

            var title = doc.querySelector('input[name="name"]').getAttribute("value");
            var links = elem.querySelectorAll("a");

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
                    let num = i + 1;
                    if(num < 10)
                        num = "0" + num;
                    list.push({
                        title: title + "-" + num,
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
                    switch(true){
                        case PLAYER_PLS.test(ns.PLAYER_PATH):
                            ns.saveAndRun_pls(list);
                            break;
                        case PLAYER_XSPF.test(ns.PLAYER_PATH):
                            ns.saveAndRun_xspf(list);
                            break;
                        case PLAYER_URLS.test(ns.PLAYER_PATH):
                            ns.run_player(list);
                            break;
                        case PLAYER_COPY.test(ns.PLAYER_PATH):
                            var urls = [];
                            list.forEach(function(info){
                                urls.push(info.url);
                            });
                            ns.exec(ns.PLAYER_PATH, []);
                            Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper)
                                .copyString(urls.join("\n"));
                            break;
                        default:
                            ns.saveAndRun_asx(list);
                    }
            }

            return true;
        },
        saveAndRun_asx: function(list){
            var text = '<asx version = "3.0" >\n\n';
            var item_tpl = '<entry>\n' +
                '   <title>{title}</title>\n' +
                '   <ref href = "{url}" />\n' +
                '</entry>\n\n';

            list.forEach(function(info){
                text += nano(item_tpl, info);
            });

            text += "</asx>";

            var file = ns.saveList(ns.FILE_NAME + ".asx", text);
            ns.exec(ns.PLAYER_PATH, [file.path]);
        },
        getList_pls: function(list){
            var text = "[playlist]\n";
            var item_tpl = 'File{i}={url}\n' +
                'Title{i}={title}\n' +
                'Length{i}=0\n';

            list.forEach(function(info, i){
                info.i = i + 1;
                info.title = encode_16(info.title);

                text += nano(item_tpl, info);
            });
            text += "NumberOfEntries=" + list.length + "\nVersion=2";

            return text;
        },
        saveAndRun_pls: function(list){
            var text = ns.getList_pls(list);
            var file = ns.saveList(ns.FILE_NAME + ".pls", text);
            ns.exec(ns.PLAYER_PATH, [file.path]);
        },
        saveAndRun_xspf: function(list){
            var text = '<?xml version="1.0" encoding="UTF-8"?>\n' +
                    '<playlist xmlns="http://xspf.org/ns/0/" xmlns:vlc="http://www.videolan.org/vlc/playlist/ns/0/" version="1">\n' +
                    '    <title>播放列表</title>\n' +
                    '    <trackList>\n';

            var tpl_item = '        <track>\n' +
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
                text += nano(tpl_item, info);
            });
            text += "    </trackList>\n</playlist>";

            var file = ns.saveList(ns.FILE_NAME + ".xspf", text, "utf-8");
            ns.exec(ns.PLAYER_PATH, [file.path]);
        },
        run_player: function(list){
            var args = [];
            list.forEach(function(info){
                args.push(info.url);
            });

            ns.exec(ns.PLAYER_PATH, args);
        },
        saveList: function(path, data, encode){
            var tmpfile;
            if (path.indexOf("\\") == -1){
                tmpfile = FileUtils.getFile("TmpD", [path]);
                tmpfile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
            } else {
                tmpfile = FileUtils.file(path);
            }

            var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
            suConverter.charset = encode || 'gbk';
            data = suConverter.ConvertFromUnicode(data);

            var foStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
            foStream.init(tmpfile, 0x02 | 0x08 | 0x20, 0664, 0);
            foStream.write(data, data.length);
            foStream.close();

            return tmpfile;
        },
        download_normal: function(filelist){
            filelist.forEach(function(file, i){
                window.saveURL(file.url, file.title, null, null, true, null, document);
            });
        },
        download_IDM: function(filelist){
            var m = filelist[0].url.match(/\/st\/(\w+)\/fileid/i);
            var fileExt = (m && m[1]) ? ("." + m[1]) : "";

            filelist.forEach(function(file, i){
                var title_gbk = ns.convert_to_gbk(ns.safe_title(file.title));
                ns.exec(IDM_PATH, ["/a", "/d", file.url, "/f", title_gbk + fileExt], true);
            });

            // 再次运行，激活到前台
            ns.exec(IDM_PATH);
        },
        download_aria2: function(filelist){

        },
        exec: function(path, args, blocking){
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
                    process.run(blocking, args, args.length);
                } else {
                    file.launch();
                }

            } catch(e) {}
        },
        safe_title: function(title) {
            return title.replace(/[\\\|\:\*\"\?\<\>]/g,"_");
        },
        convert_to_gbk: function(data){
            var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
            suConverter.charset = 'gbk';
            return suConverter.ConvertFromUnicode(data);
        },
        get focusedWindow() {
            return gContextMenu && gContextMenu.target ? gContextMenu.target.ownerDocument.defaultView : content;
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
            }
            return res;
        },
    };

    function debug(arg) { Application.console.log("[ExternalVideoPlayer]" + arg); }
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