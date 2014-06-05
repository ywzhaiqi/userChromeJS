// ==UserScript==
// @include chrome://mozapps/content/downloads/unknownContentType.xul
// @note    2014.06.06 add delay to fixe for new userChrome.js
// ==/UserScript==
location=="chrome://mozapps/content/downloads/unknownContentType.xul"&&(function (s) {
	setTimeout(function(){
        s.value = dialog.mLauncher.source.spec;
        s.setAttribute("crop", "center");
        s.setAttribute("tooltiptext", dialog.mLauncher.source.spec);
        s.setAttribute("ondblclick", 'Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(dialog.mLauncher.source.spec)')
    }, 200)
})(document.querySelector("#source"))