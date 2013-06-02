// ==UserScript==
// @name          KeepBookmarksOnMiddleClick.uc.js
// @include        chrome://browser/content/browser.xul
// @note            鼠标中键点击时bookmark菜单不关闭
// @include        main
// ==/UserScript==
(function() {
    try {
        eval('BookmarksEventHandler.onClick =' +
            BookmarksEventHandler.onClick.toString()
            .replace('node.hidePopup()',''));
        eval('checkForMiddleClick =' +
            checkForMiddleClick.toString().replace(
            'closeMenus(event.target);',''));
    }catch(e) {}
})();