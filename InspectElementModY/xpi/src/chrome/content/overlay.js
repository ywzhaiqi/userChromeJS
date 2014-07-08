var InspectElement = {
    handleEvent: function (e) {
        if (!e.shiftKey || e.button != 2) return;
        e.stopPropagation();
        e.preventDefault();
        if (e.type != "click") return;
        var elem = e.originalTarget;
        window.openDialog("chrome://inspector/content/", "_blank",
                          "chrome, all, dialog=no", elem);
        this.closePopup(elem);
    },
    closePopup: function (elem) {
        var parent = elem.parentNode;
        var list = [];
        while (parent != window && parent != null) {
            if (parent.localName == "menupopup" || parent.localName == "popup") {
                list.push(parent);
            }
            parent = parent.parentNode;
        }
        var len = list.length;
        if (!len) return;
        list[len - 1].hidePopup();
    }
};

window.addEventListener("click", InspectElement, true);
// fix context menu bug in linux
if (navigator.platform.indexOf("Win") == -1) {
    //window.addEventListener("mousedown", InspectElement, true);
    window.addEventListener("mouseup", InspectElement, false);
    window.addEventListener("contextmenu", InspectElement, true);
}
window.addEventListener("unload", function (e) {
    window.removeEventListener("unload", arguments.callee, false);
    window.removeEventListener("click", InspectElement, true);
    if (navigator.platform.indexOf("Win") == -1) {
        //window.removeEventListener("mousedown", InspectElement, true);
        window.removeEventListener("mouseup", InspectElement, false);
        window.removeEventListener("contextmenu", InspectElement, true);
    }
}, false);
