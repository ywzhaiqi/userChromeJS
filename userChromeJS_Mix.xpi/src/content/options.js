let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

var userChromeOptions = {
    mainWindow: Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator)
            .getMostRecentWindow("navigator:browser"),

    init: function() {

    },
    openEdit: function() {
        var path = this.mainWindow.userChromejs.setEditor();
        if (path) {
            document.getElementById('editorPath').value = path;
        }
    },
    onDialogAccept: function() {
        this.mainWindow.userChromejsScriptOptionsMenu.run();
    },
};

window.addEventListener('load', userChromeOptions.init);