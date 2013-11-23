// ==UserScript==
// @name         AddonsPageSimple.uc.js
// @description  在附加组件页面添加 uc脚本面板。
// @author       ywzhaiqi
// @include      main
// @charset      utf-8
// @version      2013.11.23
// @downloadURL  https://raw.github.com/ywzhaiqi/userChromeJS/master/AddonsPage/AddonsPage.uc.js
// @homepageURL  https://github.com/ywzhaiqi/userChromeJS/tree/master/AddonsPage
// @reviewURL    http://bbs.kafan.cn/thread-1617407-1-1.html
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function(){

    var iconURL = "";

    if(window.userChromeJSAddon){
        window.userChromeJSAddon.uninit();
        delete window.userChromeJSAddon;
    }

    Cu.import("resource://gre/modules/Services.jsm");
    Cu.import("resource://gre/modules/AddonManager.jsm");
    Cu.import("resource://gre/modules/XPIProvider.jsm");

    const isCN = Services.prefs.getCharPref("general.useragent.locale").indexOf("zh") != -1;

    window.userChromeJSAddon = {
        scripts:[],
        unloads: [],

        init: function(){
            this.initScripts();
            this.registerProvider();
            this.addStyle();
        },
        uninit: function(){
            this.unloads.forEach(function(func){ func(); });
        },
        initScripts: function(){
            var scripts = window.userChrome_js.scripts.concat(window.userChrome_js.overlays);

            var self = this;
            scripts.forEach(function(script, i){
                self.scripts[i] = new ScriptAddon(script);
            });
        },
        getScriptById: function(aId){
            for (var i = 0; i < this.scripts.length; i++) {
                if(this.scripts[i].id == aId)
                    return this.scripts[i];
            }
            return null;
        },
        registerProvider: function(){
            var types = null;
            if (AddonManagerPrivate.AddonType) {
                types = [new AddonManagerPrivate.AddonType(
                    "userchromejs",
                    "",
                    isCN ? "uc 脚本" : "userChrome JS",
                    AddonManager.VIEW_TYPE_LIST,
                    9000)];
            }

            let provider = {
                getAddonByID: function(aId, aCallback) {
                    let script = userChromeJSAddon.getScriptById(aId);
                    aCallback(script);
                },

                getAddonsByTypes: function(aTypes, aCallback) {
                    if (aTypes && aTypes.indexOf("userchromejs") < 0) {
                        aCallback([]);
                    } else {
                        aCallback(userChromeJSAddon.scripts);
                    }
                }
            };

            AddonManagerPrivate.registerProvider(provider, types);

            this.unloads.push(function(){
                AddonManagerPrivate.unregisterProvider(provider);
            });
        },
        addStyle: function(){
            let data = '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
                \
                @-moz-document url("about:addons"), url("chrome://mozapps/content/extensions/extensions.xul") {\
                    #category-userchromejs > .category-icon {\
                        list-style-image: url(data:image/png;base64,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);\
                    }\
                }';
            let styleService = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
            let styleURI = Services.io.newURI("data:text/css," + encodeURIComponent(data), null, null);
            styleService.loadAndRegisterSheet(styleURI, Ci.nsIStyleSheetService.USER_SHEET);

            this.unloads.push(function(){
                styleService.unregisterSheet(styleURI, Ci.nsIStyleSheetService.USER_SHEET);
            });
        },
    };

    function ScriptAddon(aScript){
        this._script = aScript;

        this.id = this._script.url;
        this.name = this._script.filename;
        this.description = this._script.description;
        this.enabled = !userChrome_js.scriptDisable[this.name];

        // 我修改过的 userChrome.js 新增的
        this.version = this._script.version || null;
        this.author = this._script.author || null;
        this.homepageURL = this._script.homepageURL || null;
        this.reviewURL = this._script.reviewURL || null;
        this.reviewCount = 0;
        this.fullDescription = this._script.fullDescription || null;
        this.downloadURL = this._script.downloadURL || null;

        this.iconURL = iconURL;
    }

    ScriptAddon.prototype = {
        version: null,
        type: "userchromejs",
        isCompatible: true,
        blocklistState: 0,
        appDisabled: false,
        scope: AddonManager.SCOPE_PROFILE,
        name: null,
        creator: null,
        pendingOperations: AddonManager.PENDING_NONE,  // 必须，否则所有都显示 restart
        operationsRequiringRestart: 6,
        // operationsRequiringRestart: AddonManager.OP_NEEDS_RESTART_DISABLE,

        get optionsURL(){
            if (this.isActive && this._script.optionsURL)
                return this._script.optionsURL;
        },

        get isActive() !this.userDisabled,
        get userDisabled() !this.enabled,
        set userDisabled(val) {
            if (val == this.userDisabled) {
                return val;
            }

            AddonManagerPrivate.callAddonListeners(val ? 'onEnabling' : 'onDisabling', this, false);

            if(this.pendingOperations == AddonManager.PENDING_NONE){
                this.pendingOperations = val ? AddonManager.PENDING_DISABLE : AddonManager.PENDING_ENABLE;
            }else{
                this.pendingOperations = AddonManager.PENDING_NONE;
            }

            this.enabled = !val;
            if(window.userChromejs){
                userChromejs.chgScriptStat(this.name);
            }

            AddonManagerPrivate.callAddonListeners(val ? 'onEnabled' : 'onDisabled', this);
        },
        get permissions() {
            // var perms = AddonManager.PERM_CAN_UNINSTALL;
            // perms |= this.userDisabled ? AddonManager.PERM_CAN_ENABLE : AddonManager.PERM_CAN_DISABLE;
            var perms = this.userDisabled ? AddonManager.PERM_CAN_ENABLE : AddonManager.PERM_CAN_DISABLE;
            // if (this.updateURL) perms |= AddonManager.PERM_CAN_UPGRADE;
            return perms;
        },

        uninstall: function() {
            AddonManagerPrivate.callAddonListeners("onUninstalling", this, false);
            this.needsUninstall = true;
            this.pendingOperations |= AddonManager.PENDING_UNINSTALL;
            AddonManagerPrivate.callAddonListeners("onUninstalled", this);
        },
        cancelUninstall: function() {
            this.needsUninstall = false;
            this.pendingOperations ^= AddonManager.PENDING_UNINSTALL;
            AddonManagerPrivate.callAddonListeners("onOperationCancelled", this);
        },
    };

    userChromeJSAddon.init();
})();