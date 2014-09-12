let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

var mainWindow = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator)
            .getMostRecentWindow("navigator:browser");

var userChromeOptions = {
    init: function() {

    },
    openEdit: function() {
        var path = this.setEditor();
        if (path) {
            document.getElementById('editorPath').value = path;
        }
    },
    onDialogAccept: function() {
        mainWindow.userChromejsScriptOptionsMenu.run();
    },
    setEditor: function() {
        var userChromejs = mainWindow.userChromejs;

        var fp = Components.classes['@mozilla.org/filepicker;1']
            .createInstance(Components.interfaces.nsIFilePicker);
        fp.init(window, "设置全局脚本编辑器", fp.modeOpen);
        fp.appendFilter("执行文件", "*.exe");
        if (fp.show() == fp.returnCancel || !fp.file)
            return;
        else {
            var ss = fp.file.path;
            mainWindow.gPrefService.setCharPref("view_source.editor.path", ss);
            userChromejs.editor = ss;
            return ss;
        }
    }
};

window.addEventListener('load', userChromeOptions.init);