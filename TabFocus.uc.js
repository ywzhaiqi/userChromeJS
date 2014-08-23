// ==UserScript==
// @name           TabFocus.uc.js
// @startup        window.tab_hover.onLoad();
// @shutdown       window.tab_hover.onUnload();
// @version        2014.8.23
// @note           修改为无需重启的方式
// ==/UserScript==

if (window.tab_hover) {
    window.tab_hover.onUnload();
    delete window.tab_hover;
}

window.tab_hover = {
    delay: 150,

    event: null,
    tid: null,

    onLoad: function() {
        gBrowser.tabContainer.addEventListener("mouseout", tab_hover.onMouseOut, false);
        gBrowser.tabContainer.addEventListener("mouseover", tab_hover.onMouseOver, false);

        // 右键点击则暂停 focus，但由于点击的相应时间问题，可能会更混乱
        // gBrowser.tabContainer.addEventListener("click", tab_hover.onMouseClicked, false);
    },
    onUnload: function() {
        gBrowser.tabContainer.removeEventListener("mouseover", tab_hover.onMouseOver, false);
        gBrowser.tabContainer.removeEventListener("mouseout", tab_hover.onMouseOut, false);
        // gBrowser.tabContainer.removeEventListener("click", tab_hover.onMouseClicked, false);
    },

    onMouseOver: function(event) {
        tab_hover.event = event.target;
        tab_hover.tid = setTimeout(function() {
            gBrowser.selectedTab = tab_hover.event;
            tab_hover.event=null;
        }, tab_hover.delay);
    },
    onMouseOut: function() {
        if (tab_hover.tid) {
            clearTimeout(tab_hover.tid);
            tab_hover.tid = null;
        }
    },
    onMouseClicked: function() {
        if (tab_hover.tid) {
            clearTimeout(tab_hover.tid);
            tab_hover.tid = null;
        }
    },
};
tab_hover.onLoad();