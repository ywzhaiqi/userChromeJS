
var EXPORTED_SYMBOLS = ["ScriptAddon"];

Cu.import("resource://gre/modules/AddonManager.jsm");

/**
 * 未完成
 */
function ScriptAddon(aScript){
    this._script = aScript;

    this.id = this._script.url;
    this.name = this._script.filename;
    this.description = this._script.description;
    this.enabled = !userChrome_js.scriptDisable[this.name];

    // 我修改过的 userChrome.js 新增的
    this.version = this._script.version;
    this.homepageURL = this._script.homepageURL;
    this.downloadURL = this._script.downloadURL;
    this.reviewURL = this._script.reviewURL;
    this.reviewCount = 0;
    this.fullDescription = this._script.fullDescription;

    this.iconURL = iconURL;
}

ScriptAddon.prototype = {
    type: "userchromejs",
    isCompatible: true,
    blocklistState: 0,
    appDisabled: false,
    scope: AddonManager.SCOPE_PROFILE,
    pendingOperations: AddonManager.PENDING_NONE,  // 必须，否则所有都显示 restart
    operationsRequiringRestart: 6,
    // operationsRequiringRestart: AddonManager.OP_NEEDS_RESTART_DISABLE,

    get creator() {
        return {
            name: this._script.author,
            url: this.homepageURL || this.downloadURL
        }
    },
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

    edit: function() {

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
