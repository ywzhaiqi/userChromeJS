
(function(){
    /**
     * view_source.editor.args 由于顺序问题无法传递行给 sublime text，故修正下
     * 设置如下：
     *     view_source.editor.args 为 %file:%line
     */

    if (!window.gViewSourceUtils) {
        return;
    }

    gViewSourceUtils.buildEditorArgs = function(aPath, aLineNumber) {
        // Determine the command line arguments to pass to the editor.
        // We currently support a %LINE% placeholder which is set to the passed
        // line number (or to 0 if there's none)
        var editorArgs = [];
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
        var args = prefs.getCharPref("view_source.editor.args");
        var isSublimeText = args && args.startsWith('%file');
        if (args) {
            if (isSublimeText) {
                args = args.replace('%file', aPath);
            }
            args = args.replace('%line', '%LINE%').replace("%LINE%", aLineNumber || "0");
            // add the arguments to the array (keeping quoted strings intact)
            const argumentRE = /"([^"]+)"|(\S+)/g;
            while (argumentRE.test(args))
            editorArgs.push(RegExp.$1 || RegExp.$2);
        }
        if (!isSublimeText) editorArgs.push(aPath);
        return editorArgs;
    };
})()