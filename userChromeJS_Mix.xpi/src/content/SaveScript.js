
// var EXPORTED_SYMBOLS = ["SaveUserChromeJS"];

Cu.import("resource://gre/modules/Services.jsm");

(function(){

const BROWSERCHROME = "chrome://browser/content/browser.xul";

const RE_USERCHROME_JS = /\.uc(?:-\d+)?\.(?:js|xul)$/i;
const RE_CONTENTTYPE = /text\/html/i;

var Utils = {
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

userChromejs.Manganer = (function(){  // 从 uc 脚本管理器中添加或移除
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
        var oldScript = null;
        arr.some(function(item){
            // 根据 id 或文件名判断
            if (item.id == newScript.id || item.filename == newScript.filename) {
                oldScript = item;
                return true;
            }
        });

        return oldScript;
    }

    function add(script) {
        var arr = getArr(script);
        var index = -1;
        arr.some(function(item, i) {
            if (script.url == item.url) {
                index = i;
                return true;
            }
        });

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
        var arr = getArr(script);
        var index = -1;
        arr.some(function(item, i) {
            if (script.url == item.url) {
                index = i;
                return true;
            }
        });

        if (index >= 0) {
            arr.splice(index, 1);
            return true;
        }
    }

    return {
        add: add,
        remove: remove,
        getArr: getArr,
        findExistScript: findExistScript
    }
})()

userChromejs.Script = (function(){

    function install(aFile) {
        let script = userChrome_js.parseScript(aFile),
            msg = "安装成功",
            restartless = true;

        var oldScript = userChromejs.Manganer.findExistScript(script);
        if(script.regex.test(BROWSERCHROME)) {
            if (oldScript && oldScript.isRunning) {
                if (oldScript.restartless) {
                    shutdown(oldScript);
                    // 清除缓存
                    Services.obs.notifyObservers(null, "startupcache-invalidate", "");
                    msg = '升级完毕';
                } else {
                    msg = '已经存在，需要重启生效';
                    restartless = false;
                }
            }

            if (restartless) {
                userChrome.import(aFile.path);
                script.isRunning = true;
            }
        }

        if (restartless) {
            script.dir = aFile.parent.leafName.replace('chrome', 'root');
            userChromejs.Manganer.add(script);
        }

        userChromejs.Save.showInstallMessage(script.filename, msg, restartless);
    }

    function uninstall(script) {
        shutdown(script);
        script.file.remove(false);
        var success = userChromejs.Manganer.remove(script);
        return success;
    }

    function startup(script) {
        if (!script.startup) return;

        try {
            eval(script.startup);
        } catch (e) {
            // console.error('startup', e)
            // 可能会有 2 种情况，第一种启动时就没载入，第二种为 undefined
            install(script.file);
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
})()

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
            if (child.getAttribute("value") == "install-userChromeJS")
                notificationBox.removeNotification(child);

        var self = this;

        var notification = notificationBox.appendNotification(
            greeting,
            "install-userChromeJS",
            null,
            notificationBox.PRIORITY_WARNING_MEDIUM,
            [{
                label: btnLabel,
                accessKey: "I",
                popup: null,
                callback: function() {
                    self.saveScript();
                }
            }]
        );
    },
    saveScript: function(url) {
        var win = Utils.getFocusedWindow();

        var doc, name, filename, fileExt, charset;
        if (!url) {
            url = win.location.href;
            doc = win.document;
            // name = doc.body.textContent.match(/\/\/\s*@name\s+(.*)/i);
            charset = doc.body.textContent.match(/\/\/\s*@charset\s+(.*)/i);
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

        fileExt = name.match(/\.uc\.(js|xul)$/i);
        fileExt = fileExt && fileExt[1] ? fileExt[1] : "js";
        charset = charset && charset[1] ? charset[1] : "UTF-8";

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

                var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
                persist.persistFlags = persist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

                // var obj_URI;
                // if(doc && fileExt != 'xul'){
                //     obj_URI = doc.documentURIObject;
                // }else{
                //     obj_URI = Services.io.newURI(url, null, null);
                // }
                var obj_URI = Services.io.newURI(url, null, null);

                persist.progressListener = {
                    onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
                    },
                    onStateChange: function(aWebProgress, aRequest, flags, status) {
                        if((flags & Ci.nsIWebProgressListener.STATE_STOP) && status == 0){
                            if (RE_USERCHROME_JS)
                                userChromejs.Script.install(fp.file);
                            else
                                userChromejs.Save.showInstallMessage(fp.file.leafName, '保存完毕', false);
                        }
                    }
                };

                persist.saveURI(obj_URI, null, null, null, "", fp.file, null);
            }
        };
        fp.open(callbackObj);
    },
    showInstallMessage: function(scriptName, msg, restartless){
        var showedMsg = Utils.popupNotification({
            id: "userchromejs-install-popup-notification",
            message: "'" + scriptName + "' 脚本" +  msg,
            mainAction: restartless ? null : {
                label: "立即重启",
                accessKey: "R",
                callback: userChromejs.restartApp
            },
            secondActions: null,
            options: {
                removeOnDismissal: true,
                persistWhileVisible: true,
                popupIconURL: "chrome://userchromejs/skin/icon32.png"
            }
        });
        return showedMsg;
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