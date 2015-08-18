
// var EXPORTED_SYMBOLS = ["SaveUserChromeJS"];

(function(){

Components.utils.import("resource://gre/modules/FileUtils.jsm");

const RE_USERCHROME_JS = /\.uc(?:-\d+)?\.(?:js|xul)$/i;
const RE_CONTENTTYPE = /text\/html/i;


// 创建一个 prefs 调用
userChromejs.__defineGetter__("prefs", function(){
    delete this.prefs;
    this.prefs = new userChromejs.Prefs('userChrome.');
    return this.prefs;
});

function Store() {
    this.init.apply(this, arguments);
}
Store.prototype = {
    init: function() {
        var fileArr = userChromejs.prefs.get('FILE', 'local\\userChromejs_mix.json')
                .replace(/\\/g, '/').split('/');
        this.file = FileUtils.getFile('UChrm', fileArr);
        if (!this.file.exists()) {
            userChromejs.utils.saveFile(this.file, '');
        }

        this.reload();
    },
    reload: function() {
        this.data = JSON.parse(userChromejs.utils.loadText(this.file) || '{}');
    },
    get: function(key, defaultValue) {
        if (typeof this.data[key] === 'undefined') {
            return defaultValue;
        }
        return this.data[key];
    },
    set: function(key, value) {
        this.data[key] = value;
        this.save();
    },
    save: function() {
        var dataStr = JSON.stringify(this.data);
        userChromejs.utils.saveFile(this.file, dataStr);
    }
};

userChromejs.store = new Store();


// 从 uc 脚本管理器中添加或移除
userChromejs.manganer = (function(){
    function list() {
        return userChrome_js.overlays.concat(userChrome_js.scripts);
    }

    function getScriptByType(type) {
        if (type === 'xul') {
            return userChrome_js.overlays;
        } else if (type === 'js') {
            return userChrome_js.scripts;
        } else {
            return [];
        }
    }

    function findExistScript(newScript) {
        var arr = getScriptByType(newScript.type);
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
        list: list,
        findExistScript: findExistScript
    }
})();

// uc 脚本的安装、卸载、启用禁用
userChromejs.script = (function(){

    function install(aFile, checkExists) {
        var script = userChrome_js.parseScript(aFile);
        var oldScript = userChromejs.manganer.findExistScript(script)[1];

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
            userChromejs.manganer.add(script);
        }

        userChromejs.save.showInstallMessage(script.filename, msg, restartless);
    }

    function uninstall(script, skipConfirm) {
        if (!skipConfirm) {
            var isOk = confirm('是否要卸载这个脚本？注意：会删除该文件');
            if (!isOk) {
                return;
            }
        }

        shutdown(script);
        script.file.remove(false);
        var success = userChromejs.manganer.remove(script);
        if (success) {
            userChromejs.save.showInstallMessage(script.filename, '已成功卸载', script.restartless);
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

    function inspect(script) {
        if (script.inspect) {
            try {
                eval('inspectObject(' + script.inspect + ')');
            } catch (ex) {}
        }
    }

    function toggleScript(script) {
        // 重新获取 script，在 angular 里同一个脚本的 script.isRunning 值不相同
        script = getById(script.id);

        userChromejs.chgScriptStat(script.filename);
        // 切换前的状态
        var isEnable = userChrome_js.scriptDisable[script.filename];
        if (isEnable) {
            shutdown(script);
        } else {
            startup(script);
        }
    }

    function getById(id) {
        var list = userChromejs.manganer.list();
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i].id == id) {
                return list[i];
            }
        }
    }

    return {
        install: install,
        uninstall: uninstall,
        startup: startup,
        shutdown: shutdown,
        inspect: inspect,
        toggleScript: toggleScript,
        getById: getById
    }
})();

userChromejs.save = {
    get SCRIPTS_FOLDER() {
        delete this.SCRIPTS_FOLDER;
        return this.SCRIPTS_FOLDER = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
    },

    init: function() {
        gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);

        // 下面的 addObserver 的方式会因为每个窗口而重复注册
        // Services.obs.addObserver(this, "content-document-global-created", false);
    },
    uninit: function() {
        gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);
        // Services.obs.removeObserver(this, "content-document-global-created", false);
    },
    handleEvent: function(event) {
        switch(event.type) {
            case "DOMContentLoaded":
                var safeWin = event.target.defaultView;
                if (safeWin !== safeWin.top) return;

                if (safeWin.location.protocol === 'view-source:') return;

                var lhref = safeWin.location.href;
                var self = this;
                if (RE_USERCHROME_JS.test(lhref) && !RE_CONTENTTYPE.test(safeWin.document.contentType)) {
                    safeWin.setTimeout(function(){
                        self.showInstallBanner(gBrowser.getBrowserForDocument(safeWin.document), gBrowser);
                    }, 500);
                }
                break;
        }
    },
    // observe: function(aSubject, aTopic, aData) {
    //     switch (aTopic) {
    //         case "content-document-global-created":
    //             let safeWin = aSubject;
    //             let gBrowser = window.gBrowser;
    //             if (!gBrowser) return;
    //             if (safeWin !== safeWin.top) return;

    //             let lhref = safeWin.location.href;
    //             if(lhref.indexOf("view-source") === 0) return;

    //             let self = this;
    //             if (RE_USERCHROME_JS.test(lhref) && !RE_CONTENTTYPE.test(safeWin.document.contentType)) {
    //                 safeWin.setTimeout(function(){
    //                     self.showInstallBanner(gBrowser.getBrowserForDocument(safeWin.document), gBrowser);
    //                 }, 500);
    //             }
    //             break;
    //     }
    // },
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
        var win = userChromejs.utils.getFocusedWindow();

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
                    if((flags & Ci.nsIWebProgressListener.STATE_STOP) && status == 0) {
                        // 保存信息
                        userChromejs.store.set(filename, {
                            installURL: url,
                            installTime: target.lastModifiedTime
                        });
                        // 安装
                        userChromejs.script.install(target);
                    }
                }
            };

            // persist.saveURI(obj_URI, null, null, null, "", target, null);
			// ff36+
            persist.saveURI(obj_URI, null, null, null, null, null, target, null);
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
        var showedMsg = userChromejs.utils.popupNotification({
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
                popupIconURL: "chrome://userChromejs/skin/img/icon32.png"
            }
        });
        return showedMsg;
    },

    exportPrefs: function(js_beautify) {
        var arr = userChrome_js.scripts.concat(userChrome_js.overlays);
        var prefs = new userChromejs.Prefs('');

        var list = arr.filter(function(s) !!s.config).map(function(s) s.config);
        // 自定义列表
        var custom = userChromejs.prefs.get('custom_prefs');
        var customList = custom.split(',').filter(function(s) !!s).map(function(s) s.trim());
        list = list.concat(customList);
        list = userChromejs.utils.unique(list);

        var ok = confirm('是否要导出 ' + list.length + ' 条设置？');
        if (!ok) return;

        // 获取所有的 prefs
        var data = {};
        list.forEach(function(branch){
            var l = prefs.list(branch);
            l.forEach(function(name){
                data[name] = prefs.get(name, '');
            });
        });
        data = JSON.stringify(data);

        if (typeof js_beautify == 'function') {
            data = js_beautify(data);
        }

        var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
        fp.init(window, "设置文件备份为", Ci.nsIFilePicker.modeSave);
        fp.appendFilter("JSON 文件", "*.json");
        fp.defaultString = 'uc 脚本设置备份.json';
        if (fp.show() == fp.returnCancel || !fp.file ) {
           return;
        } else {
            userChromejs.utils.saveFile(fp.file, data);
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
            var data = userChromejs.utils.loadText(fp.file);
            data = JSON.parse(data);

            var prefs = new userChromejs.Prefs('');
            for (var name in data) {
                prefs.set(name, data[name]);
            }
        }
    }
};


// 每个窗口都会运行一次，不管放在里面还是外面
window.addEventListener('load', function ucload(e) {
    // remove obsolete event listener
    window.removeEventListener("load", ucload, false);

    Application.getExtensions(function(extensions) {
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
        }
    });

    // 如果不存在则创建文件夹
    ["xul", "SubScript"].forEach(function(dir) {
        FileUtils.getDir("UChrm", [dir], true);
    });

    userChromejs.init();
    userChromejs.save.init();

    setTimeout(function() {
        // 延时运行，否则一些 uc 脚本的菜单没加上，会造成顺序不正确
        userChromejsScriptOptionsMenu.run();
    }, 1000);

}, false);

window.addEventListener('unload', function(){
    userChromejs.save.uninit();
});


function $C(name, attr) {
    var el = document.createElement(name);
    if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
    return el;
}

})()
