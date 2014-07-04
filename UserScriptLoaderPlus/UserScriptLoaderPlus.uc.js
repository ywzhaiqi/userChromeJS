// ==UserScript==
// @name           UserScriptLoader.uc.js
// @description    Greasemonkey っぽいもの
// @namespace      http://d.hatena.ne.jp/Griever/
// @include        main
// @compatibility  Firefox 5.0
// @license        MIT License
// @version        0.1.8.2
// @note           modified by ywzhaiqi: 增强版 2014.07.04
// @note           modified by boy3510817: 整合 dannylee 和 lastDream2013 版本，http://bbs.kafan.cn/thread-1688975-1-1.html
// @note           modified by dannylee修改可切换图标和菜单模式 2014.02.26
// @note           modified by lastdream2013: add switch: reload page on disable/enable script 2013.05.12
// @note           modified by lastdream2013: add GM_notification API 2013.05.05
// @note           modified by lastdream2013: fix compatibility for firefox23a1 2013.04.23
// @note           0.1.8.2 Firefox 22 用の修正
// @note           0.1.8.2 require が機能していないのを修正
// @note           by dannylee edited 2013.4.9
// @note           0.1.8.1 Save Script が機能していないのを修正
// @note           0.1.8.0 Remove E4X
// @note           0.1.8.0 @match, @unmatch に超テキトーに対応
// @note           0.1.8.0 .tld を Scriptish を参考にテキトーに改善
// @note           0.1.7.9 __exposedProps__ を付けた
// @note           0.1.7.9 uAutoPagerize との連携をやめた
// @note           0.1.7.8 window.open や target="_blank" で実行されないのを修正
// @note           0.1.7.7 @delay 周りのバグを修正
// @note           0.1.7.6 require で外部ファイルの取得がうまくいかない場合があるのを修正
// @note           0.1.7.5 0.1.7.4 にミスがあったので修正
// @note           0.1.7.4 GM_xmlhttpRequest の url が相対パスが使えなかったのを修正
// @note           0.1.7.3 Google Reader NG Filterがとりあえず動くように修正
// @note           0.1.7.2 document-startが機能していなかったのを修正
// @note           0.1.7.1 .tld がうまく動作していなかったのを修正
// @note           書きなおした
// @note           スクリプトを編集時に日本語のファイル名のファイルを開けなかったのを修正
// @note           複数のウインドウを開くとバグることがあったのを修正
// @note           .user.js 間で window を共有できるように修正
// @note           .tld を簡略化した
// @note           スクリプトをキャッシュしないオプションを追加
// @note           GM_safeHTMLParser, GM_generateUUID に対応
// @note           GM_unregisterMenuCommand, GM_enableMenuCommand, GM_disableMenuCommand に対応
// @note           GM_getMetadata に対応(返り値は Array or undefined)
// @note           GM_openInTab に第２引数を追加
// @note           @require, @resource のファイルをフォルダに保存するようにした
// @note           @delay に対応
// @note           @bookmarklet に対応（from NinjaKit）
// @note           GLOBAL_EXCLUDES を用意した
// @note           セキュリティを軽視してみた
// ==/UserScript==

(function (css) {

const GLOBAL_EXCLUDES = [
    "chrome:*"
    ,"jar:*"
    ,"resource:*"
];


const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");
if (!window.Downloads) Cu.import("resource://gre/modules/Downloads.jsm");
if (!window.OS) Cu.import("resource://gre/modules/osfile.jsm");

const lazy = XPCOMUtils.defineLazyGetter.bind(XPCOMUtils);

if (window.USL) {
    window.USL.destroy();
    delete window.USL;
}

var USL = {};

//dannylee
USL.UIPREF = "showtoolbutton";
USL.ShowToolButton = true;

// Class
USL.PrefManager = function (str) {
    var root = 'UserScriptLoader.';
    if (str)
        root += str;
    this.pref = Services.prefs.getBranch(root);
};
USL.PrefManager.prototype = {
    setValue: function(name, value) {
        try {
            switch(typeof value) {
                case 'string' :
                    var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
                    str.data = value;
                    this.pref.setComplexValue(name, Ci.nsISupportsString, str);
                    break;
                case 'number' : this.pref.setIntPref(name, value); break;
                case 'boolean': this.pref.setBoolPref(name, value); break;
            }
        } catch(e) { }
    },
    getValue: function(name, defaultValue){
        var value = defaultValue;
        try {
            switch(this.pref.getPrefType(name)) {
                case Ci.nsIPrefBranch.PREF_STRING: value = this.pref.getComplexValue(name, Ci.nsISupportsString).data; break;
                case Ci.nsIPrefBranch.PREF_INT   : value = this.pref.getIntPref(name); break;
                case Ci.nsIPrefBranch.PREF_BOOL  : value = this.pref.getBoolPref(name); break;
            }
        } catch(e) { }
        return value;
    },
    deleteValue: function(name) {
        try {
            this.pref.deleteBranch(name);
        } catch(e) { }
    },
    listValues: function() this.pref.getChildList("", {}),
	//dannylee
	hasValue: function(name){
	  if (this.pref.prefHasUserValue(name))
	    return true;
	  else
	  	return false;
	}
};

USL.ScriptEntry = function (aFile) {
    this.init.apply(this, arguments);
};
USL.ScriptEntry.prototype = {
    includeRegExp: /^https?:\/\/.*/,
    excludeRegExp: /^$/,
    init: function(aFile) {
        this.file = aFile;
        this.leafName = aFile.leafName;
        this.path = aFile.path;
        this.lastModifiedTime = aFile.lastModifiedTime;
        this.code = USL.loadText(aFile);
        this.getMetadata();
        this.disabled = false;
        this.requireSrc = "";
        this.resources = {};
        //add by dannylee
        this.version = "version" in this.metadata ? this.metadata["version"][0] : "未定义";
        this.downloadURL = "downloadurl" in this.metadata ? this.metadata["downloadurl"][0] : null;
        this.updateURL = "updateurl" in this.metadata ? this.metadata["updateurl"][0] : null;
        this.homepageURL = "homepageurl" in this.metadata ? this.metadata["homepageurl"][0] : null;
        //end by dannylee

        let dbInfo = USL.database.info[this.leafName];
        if (dbInfo) {
            this.installTime = dbInfo.installTime;
            this.installURL = dbInfo.installURL;
        }

        if (!this.downloadURL) {
            this.downloadURL = this.installURL;
        }

        this.run_at = "run-at" in this.metadata ? this.metadata["run-at"][0] : "document-end";
        this.name = "name" in this.metadata ? this.metadata.name[0] : this.leafName;
        if (this.metadata.delay) {
            let delay = parseInt(this.metadata.delay[0], 10);
            this.delay = isNaN(delay) ? 0 : Math.max(delay, 0);
        } else if (this.run_at === "document-idle") {
            this.delay = 0;
        }

        if (this.metadata.match) {
            this.includeRegExp = this.createRegExp(this.metadata.match, true);
            this.includeTLD = this.isTLD(this.metadata.match);
        } else if (this.metadata.include) {
            this.includeRegExp = this.createRegExp(this.metadata.include);
            this.includeTLD = this.isTLD(this.metadata.include);
        }
        if (this.metadata.unmatch) {
            this.excludeRegExp = this.createRegExp(this.metadata.unmatch, true);
            this.excludeTLD = this.isTLD(this.metadata.unmatch);
        } else if (this.metadata.exclude) {
            this.excludeRegExp = this.createRegExp(this.metadata.exclude);
            this.excludeTLD = this.isTLD(this.metadata.exclude);
        }

        this.prefName = 'scriptival.' + (this.metadata.namespace || 'nonamespace/') + '/' + this.name + '.';
        this.__defineGetter__('pref', function() {
            delete this.pref;
            return this.pref = new USL.PrefManager(this.prefName);
        });

        if (this.metadata.resource) {
            this.metadata.resource.forEach(function(r){
                let res = r.split(/\s+/);
                this.resources[res[0]] = { url: res[1] };
            }, this);
        }

        this.getRequire();
        this.getResource();
    },
    getMetadata: function() {
        this.metadata = {};
        let m = this.code.match(/\/\/\s*==UserScript==[\s\S]+?\/\/\s*==\/UserScript==/);
        if (!m)
            return;
        m = (m+'').split(/[\r\n]+/);
        for (let i = 0; i < m.length; i++) {
            if (!/\/\/\s*?@(\S+)($|\s+([^\r\n]+))/.test(m[i]))
                continue;
            let name  = RegExp.$1.toLowerCase().trim();
            let value = RegExp.$3;
            if (this.metadata[name]) {
                this.metadata[name].push(value);
            } else {
                this.metadata[name] = [value];
            }
        }
    },
    createRegExp: function(urlarray, isMatch) {
        let regstr = urlarray.map(function(url) {
        if (!isMatch && '/' == url.substr(0, 1) && '/' == url.substr(-1, 1)) {
            return url.substring(1, url.length - 1);
            }
            url = url.replace(/([()[\]{}|+.,^$?\\])/g, "\\$1");
        if (isMatch) {
            url = url.replace(/\*+|:\/\/\*\\\./g, function(str, index, full){
        if (str === "\\^") return "(?:^|$|\\b)";
        if (str === "://*\\.") return "://(?:[^/]+\\.)?";
        if (str[0] === "*" && index === 0) return "(?:https?|ftp|file)";
        if (str[0] === "*") return ".*";
            return str;
            });
        } else {
            url = url.replace(/\*+/g, ".*");
            url = url.replace(/^\.\*\:?\/\//, "https?://");
            url = url.replace(/^\.\*/, "https?:.*");
        }
            //url = url.replace(/^([^:]*?:\/\/[^\/\*]+)\.tld\b/,"$1\.(?:com|net|org|info|(?:(?:co|ne|or)\\.)?jp)");
            //url = url.replace(/\.tld\//,"\.(?:com|net|org|info|(?:(?:co|ne|or)\\.)?jp)/");
            return "^" + url + "$";
        }).join('|');
                return new RegExp(regstr);
    },
    isTLD: function(urlarray) {
        return urlarray.some(function(url) /^.+?:\/{2,3}?[^\/]+\.tld\b/.test(url));
    },
    makeTLDURL: function(aURL) {
        try {
            var uri = Services.io.newURI(aURL, null, null);
            uri.host = uri.host.slice(0, -Services.eTLD.getPublicSuffix(uri).length) + "tld";
            return uri.spec;
        } catch (e) {}
        return "";
    },
    isURLMatching: function(url) {
        //if (this.disabled) return false;
        if (this.excludeRegExp.test(url)) return false;

        var tldurl = this.excludeTLD || this.includeTLD ? this.makeTLDURL(url) : "";
        if (this.excludeTLD && tldurl && this.excludeRegExp.test(tldurl)) return false;
        if (this.includeRegExp.test(url)) return true;
        if (this.includeTLD && tldurl && this.includeRegExp.test(tldurl)) return true;
        return false;
    },
    getResource: function() {
        if (!this.metadata.resource) return;
        var self = this;
        for (let [name, aaa] in Iterator(this.resources)) {
            let obj = aaa;
            let url = obj.url;
            let aFile = USL.REQUIRES_FOLDER.clone();
            aFile.QueryInterface(Ci.nsILocalFile);
            aFile.appendRelativePath(encodeURIComponent(url));
            if (aFile.exists() && aFile.isFile()) {
                let fileURL = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler).getURLSpecFromFile(aFile);
                USL.getLocalFileContents(fileURL, function(bytes, contentType){
                    let ascii = /^text|javascript/.test(contentType);
                    if (ascii) {
                        try { bytes = decodeURIComponent(escape(bytes)); } catch(e) {}
                    }
                    obj.bytes = bytes;
                    obj.contentType = contentType;
                });
                continue;
            }
            USL.getContents(url, function(bytes, contentType){
                let ascii = /^text|javascript/.test(contentType);
                if (ascii) {
                    try { bytes = decodeURIComponent(escape(bytes)); } catch(e) {}
                }
                let data = ascii ? USL.saveText(aFile, bytes) : USL.saveFile(aFile, bytes);
                obj.bytes = data;
                obj.contentType = contentType;
            });
        }
    },
    getRequire: function() {
        if (!this.metadata.require) return;
        var self = this;
        this.metadata.require.forEach(function(url){
            let aFile = USL.REQUIRES_FOLDER.clone();
            aFile.QueryInterface(Ci.nsILocalFile);
            aFile.appendRelativePath(encodeURIComponent(url));
            if (aFile.exists() && aFile.isFile()) {
                self.requireSrc += USL.loadText(aFile) + ";\r\n";
                return;
            }
            USL.getContents(url, function(bytes, contentType){
                let ascii = /^text|javascript/.test(contentType);
                if (ascii) {
                    try { bytes = decodeURIComponent(escape(bytes)); } catch(e) {}
                }
                let data = ascii ? USL.saveText(aFile, bytes) : USL.saveFile(aFile, bytes);
                self.requireSrc += data + ';\r\n';
            });
        }, this);
    },
};

USL.API = function(script, sandbox, win, doc) {
    var self = this;

    this.GM_log = function() {
        Services.console.logStringMessage("["+ script.name +"] " + Array.slice(arguments).join(", "));
    };

    this.GM_notification = function (aMsg, aTitle, aIconURL, aCallback) {
        if (!USL.ALLOW_NOTIFY)  return;
        if (aCallback)
            var callback = {
                observe : function (subject, topic, data) {
                    if ("alertclickcallback" != topic)
                        return;
                    aCallback.call(null);
                }
            }
        else
            callback = null;
        var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
            .getService(Components.interfaces.nsIAlertsService);
        alertsService.showAlertNotification(
            aIconURL || "chrome://global/skin/icons/information-32.png", aTitle || "UserScriptLoader-notification", aMsg + "", !!callback, "", callback);
    };

    this.GM_xmlhttpRequest = function(obj) {
        if(typeof(obj) != 'object' || (typeof(obj.url) != 'string' && !(obj.url instanceof String))) return;

        var baseURI = Services.io.newURI(win.location.href, null, null);
        obj.url = Services.io.newURI(obj.url, null, baseURI).spec;
        var req = new XMLHttpRequest();
        req.open(obj.method || 'GET',obj.url,true);
        if(typeof(obj.headers) == 'object') for(var i in obj.headers) req.setRequestHeader(i,obj.headers[i]);
        ['onload','onerror','onreadystatechange'].forEach(function(k) {
            req[k] = function() {
                let ddd = obj.wrappedJSObject ? new XPCNativeWrapper(obj.wrappedJSObject[k])
                                                    : obj[k];
                if (!ddd) return;

                ddd({
                    __exposedProps__: {
                        status: "r",
                        statusText: "r",
                        responseHeaders: "r",
                        responseText: "rw",
                        readyState: "r",
                        finalUrl: "r"
                    },
                    status          : (req.readyState == 4) ? req.status : 0,
                    statusText      : (req.readyState == 4) ? req.statusText : '',
                    responseHeaders : (req.readyState == 4) ? req.getAllResponseHeaders() : '',
                    responseText    : req.responseText,
                    readyState      : req.readyState,
                    finalUrl        : (req.readyState == 4) ? req.channel.URI.spec : '' });
            };
        });

        if(obj.overrideMimeType) req.overrideMimeType(obj.overrideMimeType);
        var c = 0;
        var timer = setInterval(function() { if(req.readyState == 1 || ++c > 100) { clearInterval(timer); req.send(obj.data || null); } },10);
        USL.debug(script.name + ' GM_xmlhttpRequest ' + obj.url);
    };

    this.GM_addStyle = function GM_addStyle(code) {
        var head = doc.getElementsByTagName('head')[0];
        if (head) {
            var style = doc.createElement('style');
            style.type = 'text/css';
            style.appendChild(doc.createTextNode(code+''));
            head.appendChild(style);
            return style;
        }
    };

    this.GM_setValue = function(name, value) {
        return USL.USE_STORAGE_NAME.indexOf(name) >= 0?
            USL.database.pref[script.prefName + name] = value:
            script.pref.setValue(name, value);
    };

    this.GM_getValue = function(name, def) {
        return USL.USE_STORAGE_NAME.indexOf(name) >= 0?
            USL.database.pref[script.prefName + name] || def:
            script.pref.getValue(name, def);
    };

    this.GM_listValues = function() {
        var p = script.pref.listValues();
        var s = [x for(x in USL.database.pref[script.prefName + name])];
        s.forEach(function(e, i, a) a[i] = e.replace(script.prefName, ''));
        p.push.apply(p, s);
        return p;
    };

    this.GM_deleteValue = function(name) {
        return USL.USE_STORAGE_NAME.indexOf(name) >= 0?
            delete USL.database.pref[script.prefName + name]:
            script.pref.deleteValue(name);
    };

    this.GM_registerMenuCommand = function(label, func, aAccelKey, aAccelModifiers, aAccessKey) {
        let uuid = self.GM_generateUUID();
        win.USL_registerCommands[uuid] = {
            label: label,
            func: func,
            accelKey: aAccelKey,
            accelModifiers: aAccelModifiers,
            accessKey: aAccessKey,
            tooltiptext: script.name
        };
        return uuid;
    };

    this.GM_unregisterMenuCommand = function(aUUID) {
        return delete win.USL_registerCommands[aUUID];
    };

    this.GM_enableMenuCommand = function(aUUID) {
        let item = win.USL_registerCommands[aUUID];
        if (item) delete item.disabled;
    };

    this.GM_disableMenuCommand = function(aUUID) {
        let item = win.USL_registerCommands[aUUID];
        if (item) item.disabled = "true";
    };

    this.GM_getResourceText = function(name) {
        let obj = script.resources[name];
        if (obj) return obj.bytes;
    };

    this.GM_getResourceURL = function(name) {
        let obj = script.resources[name];
        try {
            if (obj) return 'data:' + obj.contentType + ';base64,' + btoa(obj.bytes);
        } catch (e) {
            USL.error(e);
        }
    };

    this.GM_getMetadata = function(key) {
        return script.metadata[key] ? script.metadata[key].slice() : void 0;
    };
};
USL.API.prototype = {
    GM_openInTab: function(url, loadInBackground, reuseTab) {
        openLinkIn(url, loadInBackground ? "tabshifted" : "tab", {});
    },
    GM_setClipboard: function(str) {
        if (str.constructor === String || str.constructor === Number) {
            Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).copyString(str);
        }
    },
    GM_safeHTMLParser: function(code) {
        let HTMLNS = "http://www.w3.org/1999/xhtml";
        let gUnescapeHTML = Cc["@mozilla.org/feed-unescapehtml;1"].getService(Ci.nsIScriptableUnescapeHTML);
        let doc = document.implementation.createDocument(HTMLNS, "html", null);
        let body = document.createElementNS(HTMLNS, "body");
        doc.documentElement.appendChild(body);
        body.appendChild(gUnescapeHTML.parseFragment(code, false, null, body));
        return doc;
    },
    GM_generateUUID: function() {
        return Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator).generateUUID().toString();
    },
};


USL.database = { info: {}, pref: {}, resource: {} };
USL.readScripts = [];
USL.USE_STORAGE_NAME = ['cache', 'cacheInfo'];  // GM_setValue 名字包含的存储在 json 文件中，而不是 about:config
USL.initialized = false;
USL.isready = false;
USL.eventName = "USL_DocumentStart" + Math.random();

USL.__defineGetter__("pref", function(){
    delete this.pref;
    return this.pref = new USL.PrefManager();
});

USL.__defineGetter__("SCRIPTS_FOLDER", function(){
    let folderPath = this.pref.getValue('SCRIPTS_FOLDER', "");
    let aFolder = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile)
    if (!folderPath) {
        aFolder.initWithPath(Services.dirsvc.get("UChrm", Ci.nsIFile).path);
        aFolder.appendRelativePath('UserScriptLoader');
    } else {
        aFolder.initWithPath(folderPath);
    }
    if ( !aFolder.exists() || !aFolder.isDirectory() ) {
        aFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0664);
    }
    delete this.SCRIPTS_FOLDER;
    return this.SCRIPTS_FOLDER = aFolder;
});

USL.__defineGetter__("REQUIRES_FOLDER", function(){
    let aFolder = this.SCRIPTS_FOLDER.clone();
    aFolder.QueryInterface(Ci.nsILocalFile);
    aFolder.appendRelativePath('require');
    if ( !aFolder.exists() || !aFolder.isDirectory() ) {
        aFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0664);
    }
    delete this.REQUIRES_FOLDER;
    return this.REQUIRES_FOLDER = aFolder;
});

USL.__defineGetter__("TEMP_FOLDER", function(){
    let aFolder = this.SCRIPTS_FOLDER.clone();
    aFolder.QueryInterface(Ci.nsILocalFile);
    aFolder.appendRelativePath('temp');
    if ( !aFolder.exists() || !aFolder.isDirectory() ) {
        aFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0664);
    }
    delete this.TEMP_FOLDER;
    return this.TEMP_FOLDER = aFolder;
});

USL.__defineGetter__("NEW_VERSION_FOLDER", function(){
    let aFolder = this.SCRIPTS_FOLDER.clone();
    aFolder.QueryInterface(Ci.nsILocalFile);
    aFolder.appendRelativePath('newVersion');
    if ( !aFolder.exists() || !aFolder.isDirectory() ) {
        aFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0664);
    }
    delete this.NEW_VERSION_FOLDER;
    return this.NEW_VERSION_FOLDER = aFolder;
});

// 不会自动更新？设置路径后，重启后才会生效。
USL.__defineGetter__("EDITOR", function(){
    delete this.EDITOR;
    return this.EDITOR = this.pref.getValue('EDITOR', "") || Services.prefs.getCharPref("view_source.editor.path");
});

USL.__defineGetter__("disabled_scripts", function(){
    let ds = this.pref.getValue('script.disabled', '');
    delete this.disabled_scripts;
    return this.disabled_scripts = ds? ds.split('|') : [];
});

USL.__defineGetter__("GLOBAL_EXCLUDES_REGEXP", function(){
    let regexp = null;
    let ge = USL.pref.getValue('GLOBAL_EXCLUDES', null);
    ge = ge ? ge.trim().split(/\s*\,\s*/) : GLOBAL_EXCLUDES;
    try {
        regexp = new RegExp(ge.map(USL.wildcardToRegExpStr).join("|"));
    } catch (e) {
        regexp = /^(?:chrome|resource|jar):/;
    }
    delete this.GLOBAL_EXCLUDES_REGEXP;
    return this.GLOBAL_EXCLUDES_REGEXP = regexp;
});

var DISABLED = true;
USL.__defineGetter__("disabled", function() DISABLED);
USL.__defineSetter__("disabled", function(bool){
    if (bool) {
        this.icon.setAttribute("state", "disable");
        this.icon.setAttribute("tooltiptext", "UserScriptLoader已禁用");
        gBrowser.mPanelContainer.removeEventListener(USL.eventName, this, false);
    } else {
        this.icon.setAttribute("state", "enable");
        this.icon.setAttribute("tooltiptext", "UserScriptLoader已启用");
        gBrowser.mPanelContainer.addEventListener(USL.eventName, this, false);
    }
    return DISABLED = bool;
});

var DEBUG = USL.pref.getValue('DEBUG', false);
USL.__defineGetter__("DEBUG", function() DEBUG);
USL.__defineSetter__("DEBUG", function(bool) {
    DEBUG = !!bool;
    let elem = $("UserScriptLoader-debug-mode");
    if (elem) elem.setAttribute("checked", DEBUG);
    return bool;
});

var HIDE_EXCLUDE = USL.pref.getValue('HIDE_EXCLUDE', false);
USL.__defineGetter__("HIDE_EXCLUDE", function() HIDE_EXCLUDE);
USL.__defineSetter__("HIDE_EXCLUDE", function(bool){
    HIDE_EXCLUDE = !!bool;
    let elem = $("UserScriptLoader-hide-exclude");
    if (elem) elem.setAttribute("checked", HIDE_EXCLUDE);
    return bool;
});

var ALLOW_NOTIFY = USL.pref.getValue('ALLOW_NOTIFY', true);
USL.__defineGetter__("ALLOW_NOTIFY", function() ALLOW_NOTIFY);
USL.__defineSetter__("ALLOW_NOTIFY", function(bool){
    ALLOW_NOTIFY = !!bool;
    let elem = $("UserScriptLoader-allow-notify");
    if (elem) elem.setAttribute("checked", ALLOW_NOTIFY);
    return bool;
});

var AUTO_RELOAD_PAGE = USL.pref.getValue('AUTO_RELOAD_PAGE', true);
USL.__defineGetter__("AUTO_RELOAD_PAGE", function() AUTO_RELOAD_PAGE);
USL.__defineSetter__("AUTO_RELOAD_PAGE", function(bool){
    AUTO_RELOAD_PAGE = !!bool;
    let elem = $("UserScriptLoader-auto-reload-page");
    if (elem) elem.setAttribute("checked", AUTO_RELOAD_PAGE);
    return bool;
});

var CACHE_SCRIPT = USL.pref.getValue('CACHE_SCRIPT', true);
USL.__defineGetter__("CACHE_SCRIPT", function() CACHE_SCRIPT);
USL.__defineSetter__("CACHE_SCRIPT", function(bool){
    CACHE_SCRIPT = !!bool;
    let elem = $("UserScriptLoader-cache-script");
    if (elem) elem.setAttribute("checked", CACHE_SCRIPT);
    return bool;
});

USL.getFocusedWindow = function () {
    var win = document.commandDispatcher.focusedWindow;
    return (!win || win == window) ? content : win;
};

USL.init = function(){
    USL.isready = false;
    // urlbar-icons  TabsToolbar  addon-bar PlacesToolbar
    var overlay = '\
        <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                 xmlns:html="http://www.w3.org/1999/xhtml"> \
            <toolbarpalette id="urlbar-icons">\
                <toolbarbutton id="UserScriptLoader-icon" label="UserScriptLoader" \
                               class="toolbarbutton-1 chromeclass-toolbar-additional" type="menu" \
                               onclick="USL.iconClick(event);" \
                               tooltiptext="油猴脚本管理器（鼠标右键开OR关）" >\
                   <menupopup id="UserScriptLoader-popup" \
                               onpopupshowing="USL.onPopupShowing(event);"\
                               onpopuphidden="USL.onPopupHidden(event);"\
                               onclick="USL.menuClick(event);">\
                        <menuseparator id="UserScriptLoader-menuseparator"/>\
                        <menu label="用户脚本命令"\
                              id="UserScriptLoader-register-menu"\
                              accesskey="C">\
                            <menupopup id="UserScriptLoader-register-popup"/>\
                        </menu>\
                        <menu label="管理菜单" id="UserScriptLoader-submenu">\
                            <menupopup id="UserScriptLoader-submenu-popup">\
                                <menuitem label="删除存储的 pref"\
                                          id="UserScriptLoader-delete-pref"\
                                          tooltiptext="删除存储在 UserScriptLoader.json 文件中的 pref"\
                                          oncommand="USL.deleteStorage(\'pref\');" />\
                                <menuitem label="删除存储的额外信息"\
                                          id="UserScriptLoader-delete-info"\
                                          tooltiptext="删除存储在 UserScriptLoader.json 文件中的额外信息，包括安装地址、安装时间"\
                                          oncommand="USL.deleteStorage(\'info\');" />\
                                <menuseparator/>\
                                <menuitem label="是否隐藏未触发脚本"\
                                          id="UserScriptLoader-hide-exclude"\
                                          accesskey="N"\
                                          type="checkbox"\
                                          checked="' + USL.HIDE_EXCLUDE + '"\
                                          oncommand="USL.HIDE_EXCLUDE = !USL.HIDE_EXCLUDE;" />\
                                <menuitem label="打开脚本目录"\
                                          id="UserScriptLoader-openFolderMenu"\
                                          accesskey="O"\
                                          oncommand="USL.openFolder();" />\
                                <menuitem label="重载脚本"\
                                          accesskey="R"\
                                          oncommand="USL.rebuild();" />\
                                <menuitem label="是否缓存脚本"\
                                          id="UserScriptLoader-cache-script"\
                                          accesskey="C"\
                                          type="checkbox"\
                                          tooltiptext="缓存脚本则不检查文件的修改时间，修改文件后并不会自动载入"\
                                          checked="' + USL.CACHE_SCRIPT + '"\
                                          oncommand="USL.CACHE_SCRIPT = !USL.CACHE_SCRIPT;" />\
                                <menuitem label="是否切换到调试模式"\
                                          id="UserScriptLoader-debug-mode"\
                                          accesskey="D"\
                                          type="checkbox"\
                                          checked="' + USL.DEBUG + '"\
                                          oncommand="USL.DEBUG = !USL.DEBUG;" />\
                                <menuitem label="允许脚本弹窗通知"\
                                          id="UserScriptLoader-allow-notify"\
                                          type="checkbox"\
                                          accesskey="Y"\
                                          checked="' + USL.ALLOW_NOTIFY + '"\
                                          oncommand="USL.ALLOW_NOTIFY = !USL.ALLOW_NOTIFY;" />\
                                <menuitem label="启动/禁用脚本时自动刷新页面"\
                                          id="UserScriptLoader-auto-reload-page"\
                                          accesskey="A"\
                                          type="checkbox"\
                                          checked="' + USL.AUTO_RELOAD_PAGE + '"\
                                          oncommand="USL.AUTO_RELOAD_PAGE = !USL.AUTO_RELOAD_PAGE;" />\
                            </menupopup>\
                        </menu>\
                        <menu accesskey="W" label="网站...">\
                            <menupopup>\
                                <menuitem label="greasyfork.org" oncommand="USL.openTab(\'https://greasyfork.org/scripts\');" />\
                                <menuitem label="Userscripts.org" oncommand="USL.openTab(\'http://userscripts.org:8080/\');" />\
                                <menuseparator/>\
                                <menuitem label="Greasespot 博客" oncommand="USL.openTab(\'http://www.greasespot.net/\');" />\
                                <menuitem label="Greasespot Wiki" oncommand="USL.openTab(\'http://wiki.greasespot.net/\');" />\
                                <menuitem label="Greasemonkey 手册" oncommand="USL.openTab(\'http://wiki.greasespot.net/Greasemonkey_Manual\');" />\
                                <menuseparator/>\
                                <menuitem label="GM 脚本开发小册子" oncommand="USL.openTab(\'http://jixunmoe.github.io/gmDevBook\');"/>\
                            </menupopup>\
                        </menu>\
                        <menuseparator/>\
                        <menuitem label="检查脚本的更新"\
                                  id="UserScriptLoader-check-script"\
                                  oncommand="USL.checkScripts();" />\
                        <menuitem label="为本站搜索脚本"\
                                  id="UserScriptLoader-find-script"\
                                  oncommand="USL.findscripts();"\
                                  onclick="if(event.button !=2) USL.findscripts(\'search\');" />\
                        <menuitem label="保存当前页面的脚本"\
                                  id="UserScriptLoader-saveMenu"\
                                  accesskey="S"\
                                  oncommand="USL.saveScript();"/>\
						<menuitem id="showScripttoolsbutton" label="油猴脚本版显示为按钮"\
							      oncommand="USL.toggleUI(1);" />\
                    </menupopup>\
                 </toolbarbutton>\
            </toolbarpalette>\
        </overlay>';
    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    window.userChrome_js.loadOverlay(overlay, USL);
    USL.style = addStyle(css);
	  //dannylee
    var menuitem = document.createElement("menu");
		menuitem.setAttribute("id", "UserScriptLoader_Tools_Menu");
		menuitem.setAttribute("label", "油猴脚本管理器脚本版");
		menuitem.setAttribute("class", "menu-iconic");
    menuitem.setAttribute("image", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIzSURBVDhPhVNNSFRRFD5LdxqtSxkj4gUZg4TmT0/HqGhhZTsXU5laiGhUDP5OpRlBNeZPY5HdMjKTcnBRRptp51KthaBOd4yidi1n+XXOeY06GMyFw7n3nO/73nn3nEuUZXVXUVGvS231BygW8JHNhtd8VxXlMynCZlsOEY7tIbgFauGsAkIMuwQx/mqaiNp9hGulFD9RSLbGR7n/FWLyghAjdTvQXEwIHiQ0+AlXD3tW56jgkQxyTwXV9lRSTOx1+36kFvuAlQdYeFGvVYiXs8Qln8YKT4U6Azl/xlv9Clby6iCQeAR8ewI7d109ElGOD3G+X3GCF54KDF/yY3bgJExTIYMiCjZT52EmGoH1VzBvmnh/gYUec/6h4gQvPE+gtQyToTLM9VUCayOAfQq3zUVeeR7wY2Zzb41WJri34QCEpwIXK3ZaEZiPnvJKTz4H7SXQLgJ+fdzcr09oFfPR0yogPBU47qNgZ3UOUku3NwTM6GWY0Xbg9yeY6BWYkRb+nZcqkFoagOCFpwKhGsqVtmHlPga7zuDL+5vA90ku/x3wc5Zths9T+PrhFoa6z2pH5CI3WikC6Q4k471oOFqEoLMb/SUOxkod3GXf6OSjmePJzze0UxkCosQDFI91FLP6PW0XEmN6mbDP2Ma9DsgFc5WCE3zGMP17MFZatDx9zmvn2rBHEs+zsTzNreW8vA/Bbxtl+RUe3zuhclpNv4WtXuKaZ1y2B1XAgBI2d4vJWeLb1l8Iw62jtqs6OwAAAABJRU5ErkJggg==");
		var ins = document.getElementById("menu_ToolsPopup");
		ins.insertBefore(menuitem, document.getElementById("menu_preferences"));

    //dannylee
    if (!this.pref.hasValue(this.UIPREF)) {
       this.pref.setValue(this.UIPREF, true);
    }
    this.ShowToolButton = this.pref.getValue(this.UIPREF);
};

USL.loadconfig = function () {
    USL.loadSetting();
    USL.icon          = $('UserScriptLoader-icon');
    USL.popup         = $('UserScriptLoader-popup');
    USL.menuseparator = $('UserScriptLoader-menuseparator');
    USL.registMenu    = $('UserScriptLoader-register-menu');
    USL.saveMenu      = $('UserScriptLoader-saveMenu');

    USL.rebuild();
    USL.disabled = USL.pref.getValue('disabled', false);
    //USL.icon.setAttribute("state", USL.disabled);
    window.addEventListener('unload', USL, false);
    Services.obs.addObserver(USL, "content-document-global-created", false);
    USL.debug('observer start');
    USL.initialized = true;
};

USL.uninit = function () {
    window.removeEventListener('unload', USL, false);
    Services.obs.removeObserver(USL, "content-document-global-created");
    USL.debug('observer end');
    USL.saveSetting();
};

USL.destroy = function () {
    window.removeEventListener('unload', USL, false);
    Services.obs.removeObserver(USL, "content-document-global-created");
    USL.log('observer end');

    let disabledScripts = [x.leafName for each(x in USL.readScripts) if (x.disabled)];
    USL.pref.setValue('script.disabled', disabledScripts.join('|'));
    USL.pref.setValue('disabled', USL.disabled);
    USL.pref.setValue('HIDE_EXCLUDE', USL.HIDE_EXCLUDE);
    USL.pref.setValue('ALLOW_NOTIFY', USL.ALLOW_NOTIFY);
    USL.pref.setValue('AUTO_RELOAD_PAGE', USL.AUTO_RELOAD_PAGE);
    var e = document.getElementById("UserScriptLoader-icon");
    if (e) e.parentNode.removeChild(e);
    var e = document.getElementById("UserScriptLoader-popup");
    if (e) e.parentNode.removeChild(e);
    if (USL.style) USL.style.parentNode.removeChild(USL.style);
    USL.disabled = true;
};

USL.handleEvent = function (event) {
    switch(event.type) {
        case USL.eventName:
            var win = event.target.defaultView;
            win.USL_registerCommands = {};
            win.USL_run = [];
            win.USL_match = [];
            if (USL.disabled) return;
            if (USL.readScripts.length === 0) return;
            this.injectScripts(win);
            break;
        case "unload":
            this.uninit();
            break;
    }
};

USL.observe = function (subject, topic, data) {
    if (topic == "xul-overlay-merged") {
        if (!USL.isready) {
          USL.isready = true;
          USL.loadconfig();
		 //dannylee
		  document.getElementById("showScripttoolsbutton").setAttribute("label", (this.ShowToolButton ? "油猴脚本版显示为菜单" : "油猴脚本版显示为按钮"));
		  USL.toggleUI(0);
          Application.console.log("UserScriptLoader界面加载完毕！");
        }
    }
    if (topic === "content-document-global-created") {
        var doc = subject.document;
        var evt = doc.createEvent("Events");
        evt.initEvent(USL.eventName, true, false);
        doc.dispatchEvent(evt);
    }
};

//dannylee
USL.toggleUI = function(tag){
      if (tag > 0) {
        USL.pref.setValue(USL.UIPREF, !USL.pref.getValue(USL.UIPREF));
        USL.ShowToolButton = USL.pref.getValue(USL.UIPREF);
      }
      window.setTimeout(function() {
        document.getElementById("UserScriptLoader_Tools_Menu").hidden = USL.ShowToolButton;
        document.getElementById("UserScriptLoader-icon").hidden = !USL.ShowToolButton;
        if (!USL.ShowToolButton) {
          document.getElementById("UserScriptLoader_Tools_Menu").appendChild(document.getElementById("UserScriptLoader-popup"));
          document.getElementById("showScripttoolsbutton").setAttribute("label", "油猴脚本版显示为按钮");
        } else{
          document.getElementById("UserScriptLoader-icon").appendChild(document.getElementById("UserScriptLoader-popup"));
          document.getElementById("showScripttoolsbutton").setAttribute("label", "油猴脚本版显示为菜单");
        }
      }, 10);
};

USL.createMenuitem = function () {
    if (USL.popup.firstChild != USL.menuseparator) {
        var range = document.createRange();
        range.setStartBefore(USL.popup.firstChild);
        range.setEndBefore(USL.menuseparator);
        range.deleteContents();
        range.detach();
    }
    USL.readScripts.forEach(function(script){
        let m = document.createElement('menuitem');
        m.setAttribute('label', script.name + '(' + script.version + ')');
        m.setAttribute('tooltiptext', '左键启用/禁用，中键打开主页，右键编辑');
        m.setAttribute("class", "UserScriptLoader-item");
        m.setAttribute('checked', !script.disabled);
        m.setAttribute('type', 'checkbox');
        m.setAttribute('oncommand', 'this.script.disabled = !this.script.disabled;if(USL.AUTO_RELOAD_PAGE)BrowserReload();');
        m.script = script;
        USL.popup.insertBefore(m, USL.menuseparator);
    });
};

USL.rebuild = function() {
    USL.disabled_scripts = [x.leafName for each(x in USL.readScripts) if (x.disabled)];
    USL.pref.setValue('script.disabled', USL.disabled_scripts.join('|'));

    let newScripts = [];
    let ext = /\.user\.js$/i;
    let files = USL.SCRIPTS_FOLDER.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);

    while (files.hasMoreElements()) {
        let file = files.getNext().QueryInterface(Ci.nsIFile);
        if (!ext.test(file.leafName)) continue;
        let script = loadScript(file);
        newScripts.push(script);
    }

    ApplyPatchForScript.addHomePage(newScripts);

    USL.readScripts = newScripts;
    USL.createMenuitem();

    function loadScript(aFile) {
        var script,
            leafName = aFile.leafName,
            lastModifiedTime = aFile.lastModifiedTime;
        USL.readScripts.some(function(s, i){
            if (s.leafName === leafName) {
                if (s.lastModifiedTime !== lastModifiedTime && USL.initialized) {
                    USL.log(s.name + " reload.");
                    return true;
                }
                script = s;
                return true;
            }
        });

        if (!script) {
            script = new USL.ScriptEntry(aFile);
            if (USL.disabled_scripts.indexOf(leafName) !== -1)
                script.disabled = true;
        }
        return script;
    }
};

USL.reloadScripts = function() {
    USL.readScripts.forEach(function(script){
        let aFile = script.file;
        if (aFile.exists() && script.lastModifiedTime !== aFile.lastModifiedTimeOfLink) {
            script.init(aFile);
            USL.log(script.name + " reload.");
        }
    });
};

USL.openFolder = function() {
    USL.SCRIPTS_FOLDER.launch();
};

USL.openTab = function(url, loadInBackground) {
    if (url) {
        openLinkIn(url, loadInBackground ? "tab" : "tabshifted", {});
    }
};

USL.saveScript = function() {
    var win = USL.getFocusedWindow();
    var doc = win.document;
    var data = doc.body.textContent;
    var name = /\/\/\s*@name\s+(.*)/i.exec(data);
    var filename = (name && name[1] ? name[1] : win.location.href.split("/").pop()).replace(/\.user\.js$|$/i, ".user.js").replace(/\s/g, '_').toLowerCase();

    // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Tutorial/Open_and_Save_Dialogs
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
    fp.init(window, "", Ci.nsIFilePicker.modeSave);
    fp.appendFilter("JS Files","*.js");
    fp.appendFilters(Ci.nsIFilePicker.filterAll);
    fp.displayDirectory = USL.SCRIPTS_FOLDER; // nsILocalFile
    fp.defaultExtension = "js";
    fp.defaultString = filename;
    var callbackObj = {
        done: function(res) {
            if (res != fp.returnOK && res != fp.returnReplace) return;

            var wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
            wbp.persistFlags = wbp.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
            var uri = doc.documentURIObject;
            var loadContext = win.QueryInterface(Ci.nsIInterfaceRequestor)
                .getInterface(Ci.nsIWebNavigation)
                .QueryInterface(Ci.nsILoadContext);

            // 修改后载入
            wbp.progressListener = {
                onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
                },
                onStateChange: function(progress, request, flags, status) {
                    if ((flags & Ci.nsIWebProgressListener.STATE_STOP) && status == 0) {
                        // 保存相关信息
                        USL.database.info[fp.file.leafName] = {
                            installURL: win.location.href,
                            installTime: fp.file.lastModifiedTime
                        };

                        USL.rebuild();

                        let details = {
                            id: "UserScriptLoader-install-popup-notification",
                            message: "'" + fp.file.leafName + "' 安装完毕",
                            mainAction: null,
                            secondActions: null,
                            options: null
                        };

                        PopupNotifications.show(
                            gBrowser.selectedBrowser,
                            details.id,
                            details.message,
                            "",
                            details.mainAction,
                            details.secondActions,
                            details.options);
                    }
                }
            };

            wbp.saveURI(uri, null, uri, null, null, fp.file, loadContext);

        }
    }
    fp.open(callbackObj);
};

USL.deleteStorage = function(type) {
    var data = USL.database[type];
    var list = [x for(x in data)];
    if (list.length == 0)
        return alert(type + ' is none.');

    list.push('All ' + type);
    var selected = {};
    var ok = Services.prompt.select(
        window, "UserScriptLoader " + type, "Select delete URL.", list.length, list, selected);

    if (!ok) return;
    if (selected.value == list.length -1) {
        list.pop();
        list.forEach(function(url, i, a) {
            delete data[url]
        });
        return;
    }
    delete data[list[selected.value]];
};

USL.onPopupShowing = function(event) {
    var win = USL.getFocusedWindow();
    var popup = event.target;

    switch(popup.id) {
        case 'UserScriptLoader-popup':
            let run = win.USL_run, match = win.USL_match;
            Array.slice(popup.children).some(function(menuitem){
                if (!menuitem.classList.contains("UserScriptLoader-item")) return true;
                let index_run = run ? run.indexOf(menuitem.script) : -1,
                    index_match = match ? match.indexOf(menuitem.script) : -1;
                menuitem.style.fontWeight = index_run !== -1 ? "bold" : "";
                menuitem.hidden = USL.HIDE_EXCLUDE && index_match === -1;
            });
            //USL.saveMenu.hidden = win.document.contentType.indexOf("javascript") === -1;
            USL.saveMenu.hidden = !(/\.user\.js$/.test(win.document.location.href) && /javascript|plain/.test(win.document.contentType));
            b:if (win.USL_registerCommands) {
                for (let n in win.USL_registerCommands) {
                    USL.registMenu.disabled = false;
                    break b;
                }
                USL.registMenu.disabled = true;
            } else {
                USL.registMenu.disabled = true;
            }
            break;

        case 'UserScriptLoader-register-popup':
            var registers = win.USL_registerCommands;
            if (!registers) return;
            for (let [uuid, item] in Iterator(registers)) {
                let m = document.createElement('menuitem');
                m.setAttribute('label', item.label);
                m.setAttribute('tooltiptext', item.tooltiptext);
                m.setAttribute('oncommand', 'this.registCommand();');
                if (item.accessKey)
                    m.setAttribute("accesskey", item.accessKey);
                if (item.disabled)
                    m.setAttribute("disabled", item.disabled);
                m.registCommand = item.func;
                popup.appendChild(m);
            }
            break;

        case 'UserScriptLoader-submenu-popup':
            // 加上数量
            let menuitem = $('UserScriptLoader-delete-pref');
            menuitem.label = menuitem.label.replace(/(\(\d+\))?$/, '(' + Object.keys(USL.database.pref).length + ')');

            menuitem = $('UserScriptLoader-delete-info');
            menuitem.label = menuitem.label.replace(/(\(\d+\))?$/, '(' + Object.keys(USL.database.info).length + ')');
            break;
    }
};

USL.onPopupHidden = function(event) {
    var popup = event.target;
    switch(popup.id) {
        case 'UserScriptLoader-register-popup':
            var child = popup.firstChild;
            while (child && child.localName == 'menuitem') {
                popup.removeChild(child);
                child = popup.firstChild;
            }
            break;
    }
};

USL.menuClick = function(event){
    var menuitem = event.target;
    if (event.button == 0 || menuitem.getAttribute('type') != 'checkbox')
        return;
    let script = menuitem.script;
    if (event.button == 1) {
        if(script){
            var url = script.homepageURL || script.downloadURL;
            if (url){
                openLinkIn(url,  "tab", {});
            }
        }
	} else if (event.button == 2 && USL.EDITOR && menuitem.script) {
		event.preventDefault();
	  event.stopPropagation();
		USL.edit(menuitem.script.path);
	}
};

USL.edit = function(path) {
    if (!USL.EDITOR) return;
    try {
        var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
        UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0? "GB2312": "UTF-8";
        path = UI.ConvertFromUnicode(path);
        var app = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
        app.initWithPath(USL.EDITOR);
        var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
        process.init(app);
        process.run(false, [path], 1);
    } catch (e) {}
};

USL.iconClick = function(event){
    if (event.target != USL.icon) return;
    if (event.button == 2) {
        event.preventDefault();
        USL.disabled = !USL.disabled;
        USL.pref.setValue('disabled', USL.disabled);
        //USL.icon.setAttribute("state", USL.disabled);
    } else if (event.button == 1) {
        USL.rebuild();
    }
};

USL.retryInject = function(safeWin) {
    function func(event) {
        safeWin.removeEventListener("readystatechange", func, true);
        if (event.target.URL === "about:blank") return;
        USL.injectScripts(event.target.defaultView, true);
    }
    safeWin.addEventListener("readystatechange", func, true);
};

USL.injectScripts = function(safeWindow, rsflag) {
    var aDocument = safeWindow.document;
    var locationHref = safeWindow.location.href;

    var chromeWin = window;

    // document-start でフレームを開いた際にちょっとおかしいので…
    if (!rsflag && locationHref == "" && safeWindow.frameElement)
        return USL.retryInject(safeWindow);
    // target="_blank" で about:blank 状態で開かれるので…
    if (!rsflag && locationHref == 'about:blank')
        return USL.retryInject(safeWindow);

    if (USL.GLOBAL_EXCLUDES_REGEXP.test(locationHref)) return;

    if (!USL.CACHE_SCRIPT)
        USL.reloadScripts();

    var documentEnds = [];
    var windowLoads = [];

    USL.readScripts.filter(function(script, index) {
        //if (!/^(?:https?|data|file|chrome):/.test(locationHref)) return;
        if (!script.isURLMatching(locationHref)) return false;
        if ("noframes" in script &&
            safeWindow.frameElement &&
            !(safeWindow.frameElement instanceof HTMLFrameElement))
            return false;

        safeWindow.USL_match.push(script);
        if (script.disabled) return false;

        if (script.run_at === "document-start") {
            "delay" in script ? safeWindow.setTimeout(run, script.delay, script) : run(script)
        } else if (script.run_at === "window-load") {
            windowLoads.push(script);
        } else {
            documentEnds.push(script);
        }
    });
    if (documentEnds.length) {
        aDocument.addEventListener("DOMContentLoaded", function(event){
            event.currentTarget.removeEventListener(event.type, arguments.callee, false);
            documentEnds.forEach(function(s) "delay" in s ?
                safeWindow.setTimeout(run, s.delay, s) : run(s));
        }, false);
    }
    if (windowLoads.length) {
        safeWindow.addEventListener("load", function(event) {
            event.currentTarget.removeEventListener(event.type, arguments.callee, false);
            windowLoads.forEach(function(s) "delay" in s ?
                safeWindow.setTimeout(run, s.delay, s) : run(s));
        }, false);
    }

    function run(script) {
        if (safeWindow.USL_run.indexOf(script) >= 0) {
            USL.debug('DABUTTAYO!!!!! ' + script.name + locationHref);
            return false;
        }
        if ("bookmarklet" in script.metadata) {
            let func = new Function(script.code);
            safeWindow.location.href = "javascript:" + encodeURIComponent(func.toSource()) + "();";
            safeWindow.USL_run.push(script);
            return;
        }

        let sandbox = new Cu.Sandbox(safeWindow, {sandboxPrototype: safeWindow});
        let GM_API = new USL.API(script, sandbox, safeWindow, aDocument);
        for (let n in GM_API)
            sandbox[n] = GM_API[n];

        sandbox.XPathResult  = Ci.nsIDOMXPathResult;
        sandbox.unsafeWindow = safeWindow.wrappedJSObject;
        sandbox.document     = safeWindow.document;
        sandbox.window       = safeWindow;

        lazy(sandbox, "console", function() {
            return USL.GM_console(script, safeWindow, chromeWin);
        });

        sandbox.__proto__ = safeWindow;
        USL.evalInSandbox(script, sandbox);
        safeWindow.USL_run.push(script);
    }
};

USL.evalInSandbox = function(aScript, aSandbox) {
    try{
        var lineFinder = new Error();
        Cu.evalInSandbox('(function() {' + aScript.requireSrc + '\r\n' + aScript.code + '\r\n})();', aSandbox, "1.8");
    } catch(e) {
        let line = e.lineNumber - lineFinder.lineNumber - aScript.requireSrc.split("\n").length;
        USL.error(aScript.name + ' / line:' + line + "\n" + e);
    }
};

USL.log = function() {
    Services.console.logStringMessage("[USL] " + Array.slice(arguments));
};

USL.debug = function() {
    if (USL.DEBUG) Services.console.logStringMessage('[USL DEBUG] ' + Array.slice(arguments));
};

USL.error = function() {
    var err = Cc["@mozilla.org/scripterror;1"].createInstance(Ci.nsIScriptError);
    err.init(Array.slice(arguments), null, null, null, null, err.errorFlag, null);
    Services.console.logMessage(err);
};

USL.loadText = function(aFile) {
    var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
    var sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
    fstream.init(aFile, -1, 0, 0);
    sstream.init(fstream);
    var data = sstream.read(sstream.available());
    try { data = decodeURIComponent(escape(data)); } catch(e) {}
    sstream.close();
    fstream.close();
    return data;
};

USL.loadBinary = function(aFile){
    var istream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
    istream.init(aFile, -1, -1, false);
    var bstream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
    bstream.setInputStream(istream);

    let bytes = bstream.readBytes(bstream.available());
    bstream.close();
    return bytes;
};

USL.saveText = function(aFile, data) {
    var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
    suConverter.charset = "UTF-8";
    data = suConverter.ConvertFromUnicode(data);
    return USL.saveFile(aFile, data);
};

USL.saveFile = function (aFile, data) {
    var foStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    foStream.init(aFile, 0x02 | 0x08 | 0x20, 0664, 0);
    foStream.write(data, data.length);
    foStream.close();
    return data;
};

USL.loadSetting = function() {
    var aFile = USL.SCRIPTS_FOLDER.clone();
    aFile.appendRelativePath("UserScriptLoader.json");
    if (aFile.exists()) {
        var data = USL.loadText(aFile);
        data = JSON.parse(data);
        USL.database.info = data.info;
        USL.database.pref = data.pref;
        // USL.database.resource = data.resource;
        USL.debug('loaded UserScriptLoader.json');
    } else {
        USL.debug('can not load UserScriptLoader.json');
    }
};

USL.saveSetting = function() {
    let disabledScripts = [x.leafName for each(x in USL.readScripts) if (x.disabled)];
    USL.pref.setValue('script.disabled', disabledScripts.join('|'));
    USL.pref.setValue('disabled', USL.disabled);
    USL.pref.setValue('HIDE_EXCLUDE', USL.HIDE_EXCLUDE);
    USL.pref.setValue('ALLOW_NOTIFY', USL.ALLOW_NOTIFY);
    USL.pref.setValue('AUTO_RELOAD_PAGE', USL.AUTO_RELOAD_PAGE);
    USL.pref.setValue('CACHE_SCRIPT', USL.CACHE_SCRIPT);
    USL.pref.setValue('DEBUG', USL.DEBUG);

    var aFile = USL.SCRIPTS_FOLDER.clone();
    aFile.appendRelativePath("UserScriptLoader.json");
    USL.saveText(aFile, JSON.stringify(USL.database));
};

USL.getContents = function(aURL, aCallback, isTmpFile){
    try {
        urlSecurityCheck(aURL, gBrowser.contentPrincipal, Ci.nsIScriptSecurityManager.DISALLOW_INHERIT_PRINCIPAL);
    } catch(ex) {
        return;
    }
    var uri = Services.io.newURI(aURL, null, null);
    if (uri.scheme != 'http' && uri.scheme != 'https')
        return USL.error('getContents is "http" or "https" only');

    // 如果地址经过了2次转义，下面的 aFile 就会不存在？
    aURL = decodeURIComponent(aURL);

    let aFile = isTmpFile ? USL.TEMP_FOLDER : USL.REQUIRES_FOLDER;
    aFile = aFile.clone();
    aFile.QueryInterface(Ci.nsILocalFile);
    aFile.appendRelativePath(encodeURIComponent(aURL));

    var wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
    wbp.persistFlags &= ~Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION;
    if (aCallback) {
        wbp.progressListener = {
            onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
                if (aStateFlags & Ci.nsIWebProgressListener.STATE_STOP){
                    let channel = aRequest.QueryInterface(Ci.nsIHttpChannel);
                    if (aFile.exists()) {
                        let bytes = USL.loadBinary(aFile);
                        aCallback(bytes, channel.contentType, aFile);
                    } else {
                        console.error('下载文件不存在', aFile.path)
                    }
                }
            },
            onLocationChange: function(aProgress, aRequest, aURI){},
            onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {},
            onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {},
            onSecurityChange: function(aWebProgress, aRequest, aState) {},
            onLinkIconAvailable: function(aIconURL) {},
        }
    }
    wbp.saveURI(uri, null, null, null, null, aFile, null);
    USL.debug("getContents: " + aURL);
};

USL.getLocalFileContents = function(aURL, callback) {
    var channel = Services.io.newChannel(aURL, null, null);
    if (channel.URI.scheme != 'file')
        return USL.error('getLocalFileContents is "file" only');

    var input = channel.open();
    var binaryStream = Cc['@mozilla.org/binaryinputstream;1'].createInstance(Ci.nsIBinaryInputStream);
    binaryStream.setInputStream(input);
    var bytes = binaryStream.readBytes(input.available());
    binaryStream.close();
    input.close();
    callback(bytes, channel.contentType);
};

USL.checkScripts = function() {
    USL.rebuild();

    let ScriptLen = USL.readScripts.length,
        count = 0;
    let handleSucc = function() {
        count += 1;
        // console.log('count ', count)
        if (count >= ScriptLen) {
            USL.rebuild();
            USL.alert('所有脚本检查完毕，点击打开目录', null, null, function(){
                USL.SCRIPTS_FOLDER.reveal();
            });
            // USL.TEMP_FOLDER.remove(true);
        }
    };

    USL.readScripts.forEach(function(script){
        USL.checkScript(script, handleSucc);
    });
};

USL.checkScript = function(script, handleSucc) {
    let checkURL = script.updateURL || script.downloadURL;
    if (!checkURL) {
        console.log(script.name + ' 不存在更新或下载地址');
        handleSucc();
        return;
    }

    // 其它一些网站可能没有 .meta.js
    if (checkURL.match(/\/\/(?:userscripts|greasyfork)\.org/)) {
        checkURL = checkURL.replace(/\.user\.js$/, '.meta.js');
    }

    USL.getContents(checkURL, function(bytes, contentType, aFile){
        let newVersion = Utils.r1(/\/\/\s*?@version\s*([^\r\n]+)/i, bytes);
        if (!newVersion) {
            console.error('更新脚本没找到 @version', bytes);
            handleSucc();
        } else if (Services.vc.compare(script.version, newVersion) >= 0) {
            console.log(script.name + ' 脚本无需更新');
            handleSucc();
        } else {
            let downURL = Utils.r1(/\/\/\s*?@downloadURL\s*([^\r\n]+)/i, bytes) || script.downloadURL;

            let name = /\/\/\s*@name\s+(.*)/i.exec(bytes);
            let filename = (name && name[1] ? name[1] : downURL.split("/").pop()).replace(/\.user\.js$|$/i, ".user.js").replace(/\s/g, '_').toLowerCase();

            let folder = (script.installTime != script.lastModifiedTime) ?
                    USL.NEW_VERSION_FOLDER :
                    USL.SCRIPTS_FOLDER;
            let scriptFile = folder.clone();
            scriptFile.append(filename);

            var callback = function(){
                USL.database.info[filename] = {
                    installURL: downURL,
                    installTime: script.installTime
                };

                handleSucc();
            };

            if (downURL == checkURL) {
                aFile.renameTo(folder.path, filename);
                callback();
            } else {
                USL.downloader(downURL, scriptFile.path, function(){
                    callback();
                });
            }
        }
    }, true);
};

USL.downloader = function(url, path, callback) {
    Task.spawn(function * () {
        yield Downloads.fetch(url, path);
        console.log(filename + " has been downloaded!", path);
        callback();
    }).then(null, Cu.reportError);
};

USL.alert = function (aMsg, aTitle, aIconURL, aCallback) {
    if (aCallback)
        var callback = {
            observe : function (subject, topic, data) {
                if ("alertclickcallback" != topic)
                    return;
                aCallback.call(null);
            }
        }
    else
        callback = null;
    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
        .getService(Components.interfaces.nsIAlertsService);
    alertsService.showAlertNotification(
        aIconURL || "chrome://global/skin/icons/information-32.png", aTitle || "UserScriptLoader-notification", aMsg + "", !!callback, "", callback);
};

USL.wildcardToRegExpStr = function(urlstr) {
    if (urlstr instanceof RegExp) return urlstr.source;
    let reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str){
        return str === "*" ? ".*" : "[^/]*";
    });
    return "^" + reg + "$";
};

USL.findscripts = function(type) {
    var stringa;
    if (type === 'search') {
        stringa = prompt('请输入要搜索的关键词：');
        if (!stringa) return;
    } else {
        var wins = USL.getFocusedWindow();
        var href = wins.location.href;
        if (!href) return;

        var p = 0; //for number of "."
        var f = new Array();
        var q = 2;
        var t = 1;
        var a = 0;
        var y;
        var o;
        var m = 4;
        var re = /(?:[a-z0-9-]+\.)+[a-z]{2,4}/;
        href = href.match(re); //extract the url part
        href = href.toString();
        //get the places and nunbers of the "."
        for (var i = 0; i < href.length; i++) {
            if (href[i] == ".") {
                f[p] = i;
                p++;
            }
        }
        if (p == t) {
            stringa = href.substring(a, f[0]);
        } else if (p == q) {
            stringa = href.substring(++f[0], f[1]);
        } else {
            stringa = href.substring(++f[0], f[2]);
        }
    }

    openLinkIn("http://www.google.com/search?btnG=Google+Search&q=site:userscripts.org+inurl:scripts+inurl:show+"+ stringa, "tab", {});
    // openLinkIn("http://userscripts.org:8080/scripts/search?q=" + stringa + "&submit=Search", "tab", {});
    openLinkIn("https://greasyfork.org/scripts/search?q=" + stringa, "tab", {});
};

/**
 * USL.GM_console，来自 Scriptish
 */
(function(){
    // moz-4: log, warn, error, info
    // moz-5: debug (alias to log)
    // moz-6: trace (callstack)
    const log_functions = ["log", "debug", "warn", "error", "info", "trace"];

    // based on http://www.getfirebug.com/firebug/firebugx.js
    const aux_functions = ["assert", "dir", "dirxml", "group", "groupEnd", "time",
                            "timeEnd", "count", "profile", "profileEnd"
                            ];

    function getConsoleFor(contentWin, chromeWin) {
        if (chromeWin.Firebug && chromeWin.Firebug.getConsoleByGlobal) {
            return chromeWin.Firebug.getConsoleByGlobal(contentWin);
        }

        if (contentWin.console) {
            return contentWin.console;
        }
    }

    USL.GM_console = function (script, contentWindow, chromeWindow) {
        const _console = getConsoleFor(contentWindow, chromeWindow);
        const console = { __exposedProps__: {__noSuchMethod__: "r"} };
        const prefix = "[" + (script.name || "USL") + "]";

        // Wrap log functions
        // Redirect any missing log function to .log
        for (let i = 0, e = log_functions.length; i < e; ++i) {
            let fn = log_functions[i];
            console.__exposedProps__[fn] = "r";
            if (fn in _console) {
                console[fn] = _console[fn].bind(_console, prefix);
            }
            else if (fn == "trace") {
                console.trace = function() {
                    let args = Array.slice(arguments);
                    let msg = "";

                    // Skip the top two frames
                    let stack = Components.stack.caller;
                    if (stack && (stack = stack.caller)) {
                        for (let i = 0; i < 10 && stack; ++i, stack = stack.caller) {
                            msg += "\n[@" + stack.filename + ":" + stack.lineNumber + "]";
                        }
                        args.push(msg);
                    }
                    console.log.apply(console, args);
                };
            }
            else {
                console[fn] = console.log.bind(console);
            }
        }

        // Wrap aux functions
        for (let i = 0, e = aux_functions.length; i < e; ++i) {
            let fn = aux_functions[i];
            if (fn in console) {
                console[fn] = _console[fn].bind(_console);
                console.__exposedProps__[fn] = "r";
            }
        }
        Object.defineProperty(console, "__noSuchMethod__", {
            value: function(id, args) {
                if (aux_functions.indexOf(id) != -1) {
                    let fn = _console[id] || (function() {});
                    return fn.apply(_console, args);
                }
                console.log("No such method in console", id);
            }
        });

        return console;
    };

})();

var ApplyPatchForScript = (function(){
    const USO_URL_RE = /(^https?:\/\/userscripts.org.*\/scripts\/source\/\d+)\.\w+\.js$/i;

    const GFO_URL_RE_1 = /(^https?:\/\/greasyfork.org\/scripts\/code\/\w+)\.\w+\.js$/i;
    const GFO_URL_RE_2 = /(^https?:\/\/greasyfork.org\/scripts\/[^\/]+\/)code[\.\/].*\w+\.js$/i;

    // (http://binux.github.io/ThunderLixianExporter/)master/ThunderLixianExporter.user.js
    const GITHUB_URL_RE_1 = /(^https?:\/\/\w+.github.io\/\w+\/)master\/.*.*\w+\.js$/i;
    // 从   https://raw.githubusercontent.com/ywzhaiqi/userscript/master/noNoticetitleflashOnBBS.user.js
    // 转为 https://github.com/ywzhaiqi/userscript/blob/master/noNoticetitleflashOnBBS.user.js
    const GITHUB_URL_RE_2 = /(^https?:\/\/raw.githubusercontent.com\/.*?\/master\/.*\.user\.js$)/i;

    function getScriptHomeURL(downURL) {
        var url;
        if (downURL && downURL.startsWith('http')) {
            if (USO_URL_RE.test(downURL)) {
                url = RegExp.$1.replace(/source/, "show");
            } else if (GFO_URL_RE_1.test(downURL)) {
                url = RegExp.$1;
            } else if (GFO_URL_RE_2.test(downURL)) {
                url = RegExp.$1;
            } else if (GITHUB_URL_RE_1.test(downURL)) {
                url = RegExp.$1;
            } else if (GITHUB_URL_RE_2.test(downURL)) {
                url = RegExp.$1.replace('raw.githubusercontent.com', 'github.com')
                        .replace('/master/', '/blob/master/');
            }
        }
        return url ? decodeURIComponent(url) : null;
    }

    function addHomePage(scripts){
        scripts.forEach(function(script){
            if (!script.homepageURL) {
                var url = script.downloadURL || script.updateURL;
                script.homepageURL = getScriptHomeURL(url);
            }
        });
    }

    return {
        addHomePage: addHomePage,
        getHomePageURL: getScriptHomeURL
    }
})();


var Utils = {
    r1: function(reg, str) {
        var m = str.match(reg);
        return m ? m[1] : null;
    },
};

function log(str) { Application.console.log(Array.slice(arguments)); }
function debug() { if (USL.DEBUG) Application.console.log('[USL DEBUG] ' + Array.slice(arguments));}

function $(id) document.getElementById(id);
function $C(name, attr) {
    var el = document.createElement(name);
    if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
    return el;
}

function addStyle(css) {
    var pi = document.createProcessingInstruction(
        'xml-stylesheet',
        'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
    );
    return document.insertBefore(pi, document.documentElement);
}


USL.init();
window.USL = USL;

})('\
/* */\
#UserScriptLoader-icon {\
  list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEgAACxIB0t1+/AAAACx0RVh0Q3JlYXRpb24gVGltZQBTdW4gMzAgTWFyIDIwMDggMTc6MjI6NDcgLTA1MDDUnvhKAAAAB3RJTUUH2AQGETEsCzNv6AAAAk9JREFUOE9lU09Ik3EYfo91mtFhY2NtKxexQGOMMJU5sojoYGU3g1UyNUQ0Kvpjukozgmqm1iyyr4zMpBweyvCybh7NOgjq+mYUdeu449P7vl+bW/7g4ff+eZ6Hl9/7feT3+8nn85HH4yG3201Op5PsdnsB8QhVMjpPVlDqwHYyi3t6igt5sMDDSDDM9r2EQ+WEiFcRL+bpcTgcJfgnhKCpoiBEwy7ChWpKHy4nk3ObcDcYsGhBhInGLWgNEaJ7CM1BwvlqC40BNavL8/X0hKmhp45SvYzXXbuR+9wHLN/HwosmnUJuyaUufeEJX3Rq0F2/+c9YR1DJKl4ZBDKPgG9PYM5e1BuZJNeHuN+vPOGLTg2G24KYGTgCo2UHkxJKNiZPwxiPAWuvYLxp4fgMGz3m/gPlCV90lkFHDSYu1WC2LwysjgDmU0Q6IyirLQN+TK/HpqGTCe9tvB6iU4NYeKspBvPJo9bo2eegnQRyE/Dr43q8Nq5TzCePqYHo1IDXEr26fxNyi7cKBsbDs4wu4PccjOQ5GCPtbPBSDXKLAxC+6NSAH8Uma8PyPQx2H8eX9zeA7xM8/jvg5wxjmvNJfP1wE0PXTuhG5CHliy0Y5DeQTfei+WAlooFt6K8KYHRfAHf4jgU8aOV69tN15ZUYSMCFdOpKiN3v6rqQGdXHhPmMMWZtQB6YpxSe8P83kB/GlBUtTZ2y1rk6bInk5m9jaYpXy33hCb9g4HK5FFy0tYXo9uVaWuFYxyyG1KXPsS2vKTEoKnoZVYxIEST3buQS/QUCx7vn2Dh8TQAAAABJRU5ErkJggg==");\
  -moz-appearance: none !important;\
  border-style: none !important;\
  border-radius: 0 !important;\
  padding: 0 3px !important;\
  margin: 0 !important;\
  box-shadow: none !important;\
  -moz-box-align: center !important;\
  -moz-box-pack: center !important;\
  min-width: 16px !important;\
  min-height: 16px !important;\
}\
.popup-notification-icon[popupid="UserScriptLoader-install-popup-notification"] {\
  list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEgAACxIB0t1+/AAAACx0RVh0Q3JlYXRpb24gVGltZQBTdW4gMzAgTWFyIDIwMDggMTc6MjI6NDcgLTA1MDDUnvhKAAAAB3RJTUUH2AQGETEsCzNv6AAAAk9JREFUOE9lU09Ik3EYfo91mtFhY2NtKxexQGOMMJU5sojoYGU3g1UyNUQ0Kvpjukozgmqm1iyyr4zMpBweyvCybh7NOgjq+mYUdeu449P7vl+bW/7g4ff+eZ6Hl9/7feT3+8nn85HH4yG3201Op5PsdnsB8QhVMjpPVlDqwHYyi3t6igt5sMDDSDDM9r2EQ+WEiFcRL+bpcTgcJfgnhKCpoiBEwy7ChWpKHy4nk3ObcDcYsGhBhInGLWgNEaJ7CM1BwvlqC40BNavL8/X0hKmhp45SvYzXXbuR+9wHLN/HwosmnUJuyaUufeEJX3Rq0F2/+c9YR1DJKl4ZBDKPgG9PYM5e1BuZJNeHuN+vPOGLTg2G24KYGTgCo2UHkxJKNiZPwxiPAWuvYLxp4fgMGz3m/gPlCV90lkFHDSYu1WC2LwysjgDmU0Q6IyirLQN+TK/HpqGTCe9tvB6iU4NYeKspBvPJo9bo2eegnQRyE/Dr43q8Nq5TzCePqYHo1IDXEr26fxNyi7cKBsbDs4wu4PccjOQ5GCPtbPBSDXKLAxC+6NSAH8Uma8PyPQx2H8eX9zeA7xM8/jvg5wxjmvNJfP1wE0PXTuhG5CHliy0Y5DeQTfei+WAlooFt6K8KYHRfAHf4jgU8aOV69tN15ZUYSMCFdOpKiN3v6rqQGdXHhPmMMWZtQB6YpxSe8P83kB/GlBUtTZ2y1rk6bInk5m9jaYpXy33hCb9g4HK5FFy0tYXo9uVaWuFYxyyG1KXPsS2vKTEoKnoZVYxIEST3buQS/QUCx7vn2Dh8TQAAAABJRU5ErkJggg==");\
}\
#UserScriptLoader-icon > .toolbarbutton-icon {\
    min-width: 16px !important;\
    min-height: 16px !important;\
    padding: 0 !important;\
    border-style: none !important;\
    border-radius: 0 !important;\
}\
#UserScriptLoader-icon:not([disabled="true"]):hover,\
#UserScriptLoader-icon:not([disabled="true"])[type="menu-button"]:hover,\
#UserScriptLoader-icon:not([disabled="true"])[open="true"],\
#UserScriptLoader-icon:not([disabled="true"])[type="menu-button"][open="true"] {\
    \
}\
#UserScriptLoader-icon dropmarker{display: none !important;}\
#UserScriptLoader-icon[state="disable"] {\
    list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEgAACxIB0t1+/AAAACx0RVh0Q3JlYXRpb24gVGltZQBTdW4gMzAgTWFyIDIwMDggMTc6MjI6NTAgLTA1MDDdk8ZaAAAAB3RJTUUH2AQWER4YaIL0rwAAAldJREFUOE+FU99Lk2EY3d0uBItuMowUWWyYSx3D0EzNgUqjLS0a1MViFyXZtqDCIY2zGAoic2ZGUUpB1MUIjaLUNC1XGWyz0v1quiSo/6PnefxmM/rxwOF93+c757wP7+FT/a+sTVU7CQdq95fZyst2uZX2v4sE2witBHdzjQ4VmmLoSosYjQrl76UIwaBbc0JU6/agra7CrtcUu+msVuhbi0TnWGhvb0KTUYuDVRocMuxFa90+gbG8hM1KFPpGHW2o1FoaK20MT9cpRBbGEY9O4cHtPpmC1wSduc/fc1zWiUGHydDtc1qFzKREbBqpj6/w5fM8JsfHaH2N9Kc5JGMvEV2YEB7zWScGPZ1mjPadwUVHO900LeThm35cv+FHNvkeI7d6MTR8DWkyZBPmMZ91YgCnBQPdJ9Hv7UJqaRaZ5TdweVzQGrT4lolu7ldXFmSyfu8FjOA0WCcG5ga9mw3uDF4Vwmo8jMKiQhTsKMD39eXN/VriHU03j7tBrxiwTgwolsr25mpEwxNIKwaDAz4EA378WF/BULAXATrnDGLhJ2A+68SAHkXNscUjk5h9/hDH2kxoqa2Bw2qGy3YcZzssMNfX4oS5BXMvHklC/JAi5mKDXAKeS514GhqVKbLJRXxNfUA2tYi1+Fs8ezyGnivnhbfFgIsadt9lh0yRjM1IEvyYGXo4XjnSJD1wPDIF5jFfkW4UNfiHcXNEoXsBiTO5NCOp8Jqg+EL3AxIh85ivSH8VNdWHjVrTkXq9k/YyZj64z99p/+f/IK+2E3YTSvPAZ+7/VirVTyD9VsdYQ1AqAAAAAElFTkSuQmCC");\
}\
'.replace(/[\r\n\t]/g, ''));


