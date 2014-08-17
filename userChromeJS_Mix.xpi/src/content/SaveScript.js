
// var EXPORTED_SYMBOLS = ["SaveUserChromeJS"];

Cu.import("resource://gre/modules/Services.jsm");

(function(){

const RE_USERCHROME_JS = /\.uc(?:-\d+)?\.(?:js|xul)$/i;
const RE_CONTENTTYPE = /text\/html/i;

// Class
userChromejs.Prefs = function (str) {
    this.pref = Services.prefs.getBranch(str || '');
};
userChromejs.Prefs.prototype = {
    get: function(name, defaultValue){
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
    set: function(name, value) {
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
    delete: function(name) {
        try {
            this.pref.deleteBranch(name);
        } catch(e) { }
    },
    list: function(name) this.pref.getChildList(name, {}),
    has: function(name){
        return this.pref.getPrefType(name) !== 0;
    }
};

// 创建一个 prefs 调用
userChromejs.__defineGetter__("prefs", function(){
    delete this.prefs;
    return this.prefs = new userChromejs.Prefs('userChrome.');
});

// 从 uc 脚本管理器中添加或移除
userChromejs.Manganer = (function(){
    function getAll() {
        return userChrome_js.overlays.concat(userChrome_js.scripts);
    }

    function getArr(script) {
        if (script.type === 'xul') {
            return userChrome_js.overlays;
        } else if (script.type === 'js') {
            return userChrome_js.scripts;
        } else {
            return [];
        }
    }

    function findExistScript(newScript) {
        var arr = getArr(newScript);
        var index = -1,
            oldScript = null;
        arr.some(function(item, i){
            // 根据 id 判断
            if (item.id == newScript.id) {
                oldScript = item;
                index = i;
                return true;
            }
        });

        return [index, oldScript, arr];
    }

    function add(script) {
        var [index, ,arr] = findExistScript(script);

        if (script.type == 'xul') {
            script.xul = '<?xul-overlay href=\"'+ script.url +'\"?>\n';
        }

        if (index >= 0) {
            arr.splice(index, 1, script);
        } else {
            arr.push(script);
        }
    }

    function remove(script) {
        var [index, ,arr] = findExistScript(script);

        if (index >= 0) {
            arr.splice(index, 1);
            return true;
        }
    }

    return {
        add: add,
        remove: remove,
        getArr: getArr,
        getAll: getAll,
        findExistScript: findExistScript
    }
})();

// uc 脚本的安装、卸载、启用禁用
userChromejs.Script = (function(){

    function install(aFile, checkExists) {
        var script = userChrome_js.parseScript(aFile);
        var oldScript = userChromejs.Manganer.findExistScript(script)[1];

        var msg = "安装成功",
            restartless = true;
        if (typeof checkExists === 'undefined') checkExists = true;

        if (checkExists && oldScript) {
            var ok = confirm('脚本已经存在，是否要替换安装？');
            if (ok) {
                aFile.renameTo(oldScript.file.parent, oldScript.filename);
                script.filename = oldScript.filename;
                script.file = oldScript.file;
                script.isRunning = oldScript.isRunning;
            } else {
                if (script.file.path != oldScript.file.path) {
                    aFile.remove(false);
                }
                return;
            }
        }

        if(script.includeMain) {
            if (oldScript && oldScript.isRunning) {
                if (oldScript.restartless) {
                    // 清除缓存
                    Services.obs.notifyObservers(null, "startupcache-invalidate", "");
                    msg = '重新安装成功';
                } else {
                    msg = '已经存在，需要重启生效';
                    restartless = false;
                }
            }

            var disabled = userChrome_js.scriptDisable[script.filename];
            if (disabled) {
                msg = '已更新，但原来是禁用状态';
            }

            // 排除禁用的脚本
            if (restartless && !disabled) {
                userChrome.import(aFile.path);
                script.isRunning = true;
            }
        }

        if (restartless) {
            script.dir = script.file.parent.leafName.replace('chrome', 'root');
            userChromejs.Manganer.add(script);
        }

        userChromejs.Save.showInstallMessage(script.filename, msg, restartless);
    }

    function uninstall(script) {
        shutdown(script);
        script.file.remove(false);
        var success = userChromejs.Manganer.remove(script);
        if (success) {
            userChromejs.Save.showInstallMessage(script.filename, '已成功卸载', script.restartless);
        }

        return success;
    }

    function startup(script) {
        if (!script.startup) return;

        if (!script.isRunning) {
            install(script.file, false);
            return;
        }

        try {
            eval(script.startup);
        } catch (e) {
            console.error('startup', e)
            // 可能会有 2 种情况，第一种启动时就没载入，第二种为 undefined
        }
    }

    function shutdown(script) {
        if (!script.shutdown) return;

         try {
            eval(script.shutdown); 
        } catch (e) {}
    }

    return {
        install: install,
        uninstall: uninstall,
        startup: startup,
        shutdown: shutdown
    }
})();

userChromejs.Save = {
    get SCRIPTS_FOLDER() {
        delete this.SCRIPTS_FOLDER;
        return this.SCRIPTS_FOLDER = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
    },

    init: function() {
        Services.obs.addObserver(this, "content-document-global-created", false);
    },
    uninit: function() {
        Services.obs.removeObserver(this, "content-document-global-created", false);
    },
    observe: function(aSubject, aTopic, aData) {
        switch (aTopic) {
            case "content-document-global-created":
                let safeWin = aSubject;
                let gBrowser = window.gBrowser;
                if (!gBrowser) return;

                let lhref = safeWin.location.href;
                if(lhref.startsWith("view-source")) return;

                let self = this;
                if (safeWin === safeWin.top && RE_USERCHROME_JS.test(lhref) && !RE_CONTENTTYPE.test(safeWin.document.contentType)) {
                    safeWin.setTimeout(function(){
                        self.showInstallBanner(gBrowser.getBrowserForDocument(safeWin.document), gBrowser);
                    }, 500);
                }
                break;
        }
    },
    showInstallBanner: function(browser, gBrowser) {
        var notificationBox = gBrowser.getNotificationBox(browser);
        // var greeting = "This is a userChrome script. Click install to start using it.";
        var greeting = "这是 userChrome 脚本，要使用该脚本请点击“安装”";
        var btnLabel = "安装脚本";

        // Remove existing notifications. Notifications get removed
        // automatically onclick and on page navigation, but we need to remove
        // them ourselves in the case of reload, or they stack up.
        for (var i = 0, child; child = notificationBox.childNodes[i]; i++)
            if (child.getAttribute("value") == "install-userChromejs")
                notificationBox.removeNotification(child);

        var self = this;

        var notification = notificationBox.appendNotification(
            greeting,
            "install-userChromejs",
            null,
            notificationBox.PRIORITY_WARNING_MEDIUM,
            [{
                label: btnLabel,
                accessKey: "I",
                popup: null,
                callback: function() {
                    self.saveScript(null);
                }
            }]
        );
    },
    saveScript: function(url, skipSelect) {
        var win = Utils.getFocusedWindow();

        var doc, name, filename, fileExt;
        if (!url) {
            url = win.location.href;
            doc = win.document;
            // name = doc.body.textContent.match(/\/\/\s*@name\s+(.*)/i);
        } else {
            if (url.match(/^https?:\/\/github\.com\/\w+\/\w+\/blob\//)) {
                url = url.replace("/blob/", "/raw/");
            }
        }

        name = name && name[1] ? name[1] : decodeURIComponent(url.split("/").pop());
        filename = name.replace(/\.uc\.(js|xul)$|$/i, ".uc.$1").replace(/\s/g, '_');
        if (filename.match(/\.uc\.$/i)) {  // 对名字进行修正
            var m = url.match(/\.(js|xul)$/);
            if (m)
                filename += m[1];
        }

        var download = function(url, target) {
            var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
            persist.persistFlags = persist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

            var obj_URI = Services.io.newURI(url, null, null);

            persist.progressListener = {
                onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
                },
                onStateChange: function(aWebProgress, aRequest, flags, status) {
                    if((flags & Ci.nsIWebProgressListener.STATE_STOP) && status == 0){
                        userChromejs.Script.install(target);
                        // TODO: 保存其它文件，不仅仅是 uc 脚本？
                        // if (RE_USERCHROME_JS)
                        //     userChromejs.Script.install(fp.file);
                        // else
                        //     userChromejs.Save.showInstallMessage(fp.file.leafName, '保存完毕', false);
                    }
                }
            };

            persist.saveURI(obj_URI, null, null, null, "", target, null);
        };

        if (typeof skipSelect === 'undefined')
            skipSelect = userChromejs.prefs.get('install_skipSelect');
        if (skipSelect) {
            var target = this.SCRIPTS_FOLDER.clone();
            target.append(filename);
            download(url, target);
            return;
        }

        fileExt = name.match(/\.uc\.(js|xul)$/i);
        fileExt = fileExt && fileExt[1] ? fileExt[1] : "js";

        // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Tutorial/Open_and_Save_Dialogs
        var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
        fp.init(window, "", Ci.nsIFilePicker.modeSave);
        fp.appendFilter("*." + fileExt, "*.uc.js;*.uc.xul");
        fp.appendFilters(Ci.nsIFilePicker.filterAll);
        fp.displayDirectory = this.SCRIPTS_FOLDER; // nsILocalFile
        fp.defaultExtension = fileExt;
        fp.defaultString = filename;
        var callbackObj = {
            done: function(res) {
                if (res != fp.returnOK && res != fp.returnReplace) return;

                download(url, fp.file);
            }
        };
        fp.open(callbackObj);
    },
    showInstallMessage: function(scriptName, msg, restartless){
        var showedMsg = Utils.popupNotification({
            id: "userChromejs-install-popup-notification",
            message: "" + scriptName + " 脚本" +  msg,
            mainAction: restartless ? null : {
                label: "立即重启",
                accessKey: "R",
                callback: userChromejs.restartApp
            },
            secondActions: null,
            options: {
                removeOnDismissal: true,
                persistWhileVisible: true,
                popupIconURL: "chrome://userChromejs/skin/icon32.png"
            }
        });
        return showedMsg;
    },

    exportPrefs: function() {
        var ok = confirm('是否要导出脚本或自定义的设置？');
        if (!ok) return;

        var arr = userChrome_js.scripts.concat(userChrome_js.overlays);
        var prefs = new userChromejs.Prefs('');

        var list = arr.filter(function(s) !!s.config).map(function(s) s.config);
        // 自定义列表
        var custom = userChromejs.prefs.get('custom_prefs');
        var customList = custom.split(',').filter(function(s) !!s).map(function(s) s.trim());
        list = list.concat(customList);
        list = Utils.unique(list);

        // 获取所有的 prefs
        var data = {};
        list.forEach(function(branch){
            var l = prefs.list(branch);
            l.forEach(function(name){
                data[name] = prefs.get(name, '');
            });
        });
        data = JSON.stringify(data);

        var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
        fp.init(window, "设置文件备份为", Ci.nsIFilePicker.modeSave);
        fp.appendFilter("JSON 文件", "*.json");
        fp.defaultString = 'uc 脚本设置备份.json';
        if (fp.show() == fp.returnCancel || !fp.file ) { 
           return;
        } else {
            Utils.saveFile(fp.file, data);
        }
    },
    importPrefs: function() {
        var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
        fp.init(window, "设置文件", Ci.nsIFilePicker.modeOpen);
        fp.appendFilter("JSON 文件", "*.json");
        fp.defaultString = 'uc 脚本设置备份.json';
        if (fp.show() == fp.returnCancel || !fp.file ) { 
           return;
        } else {
            var data = Utils.loadText(fp.file);
            data = JSON.parse(data);

            var prefs = new userChromejs.Prefs('');
            for (var name in data) {
                prefs.set(name, data[name]);
            }
        }
    }
};

userChromejs.AddonPage = {
    
};

var Utils = {
    unique: function (a){
        var o = {},
            r = [],
            t;
        for (var i = 0, l = a.length; i < l; i++) {
            t = a[i];
            if(!o[t]){
                o[t] = true;
                r.push(t);
            }
        }
        return r;
    },
    saveFile: function(file, data) {
        var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
        suConverter.charset = 'UTF-8';
        data = suConverter.ConvertFromUnicode(data);

        var foStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
        foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
        foStream.write(data, data.length);
        foStream.close();
    },
    loadText: function (aFile) {
        var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
        var sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
        fstream.init(aFile, -1, 0, 0);
        sstream.init(fstream);

        var data = sstream.read(sstream.available());
        try { data = decodeURIComponent(escape(data)); } catch(e) {}
        sstream.close();
        fstream.close();
        return data;
    },
    popupNotification: function(details){
        var win = Utils.getMostRecentWindow();
        if (win && win.PopupNotifications) {
            win.PopupNotifications.show(
                win.gBrowser.selectedBrowser,
                details.id,
                details.message,
                "",
                details.mainAction,
                details.secondActions,
                details.options);
            return true;
        }

        return false;
    },
    getFocusedWindow: function() {
        var win = document.commandDispatcher.focusedWindow;
        return (!win || win == window) ? content : win;
    },
    getMostRecentWindow: function(){
        return Services.wm.getMostRecentWindow("navigator:browser")
    },
};


userChromejs.Save.init();


})()


window.addEventListener('load', function ucload(e){
  // remove obsolete event listener
  window.removeEventListener("load", ucload, false);

  Application.getExtensions(function (extensions) {
      let extension = extensions.get('userChromeJS@mozdev.org');

      // 第一次启动
      if (extension.firstRun) {
        var buttonId = "userChromebtnMenu";
        var navBarId = "nav-bar";

        var navBar = top.document.getElementById(navBarId);
        var currentSet = navBar.currentSet;

        // Append only if the button is not already there.
        var curSet = currentSet.split(",");
        if (curSet.indexOf(buttonId) == -1) {
            navBar.insertItem(buttonId);
            navBar.setAttribute("currentset", navBar.currentSet);
            navBar.ownerDocument.persist(navBarId, "currentset");
        }

        // 第一次启动创建文件夹
        Components.utils.import("resource://gre/modules/FileUtils.jsm");
        var arrSubdir = ["xul", "SubScript"];
        arrSubdir.forEach(function(dir){
            FileUtils.getDir("UChrm", [dir], true);
        });
      }
  });

  userChromejs.init();
  userChromejsScriptOptionsMenu.run();
}, false);