
Cu.import("resource://gre/modules/Services.jsm");

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

userChromejs.Utils = {
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
        var win = userChromejs.Utils.getMostRecentWindow();
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