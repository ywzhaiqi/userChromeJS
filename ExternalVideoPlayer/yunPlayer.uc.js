// ==UserScript==
// @name           yunPlayer.uc.js
// @description    右键菜单调用云点播
// @namespace      https://github.com/ywzhaiqi
// @author         ywzhaiqi
// @include        main
// @charset        UTF-8
// @version        2013-12-3
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/blob/master/ExternalVideoPlayer/yunPlayer.uc.js
// ==/UserScript==

(function (){

    var API_URLS = {
        "迅雷云播": "http://vod.xunlei.com/share.html?url=",
        // "迅雷离线": "http://lixian.vip.xunlei.com/lixian_login.html?furl=",
        // "远程下载": "http://yuancheng.xunlei.com/3/#a=newtask&url=",

        "997m云点播": "http://www.997m.com/?u=",
        "iboku云点播": "http://www.iboku.cn/vod/vod.html#!url=",
        "奇客云播放": "http://vod.7ibt.com/index.php?url=",
        "火焰云点播": "http://www.huoyan.tv/index.php#!u=",
        "快乐云点播": "http://www.happyfuns.com/happyvod/api.php#!url=",
        "福利吧云点播": "http://fuliba.net/yun.php?u=",
        "帝国云点播": "http://vod.dgyun.com/index.htm?url=",
        "如意云点播": "http://www.ruyiba.cn/index.php#!u=",
        "云播": "http://vod.yundianbo.info/?from=un_567&u=",
        "CloudPlayer": "http://zdfans.com/cloudplayer/vod.html?url="
    };

    var LINK_CLICKED_COLOR = "#666666";
    // var LINK_REGEXP = /.*/;
    var LINK_REGEXP = /^(?:thunder|ed2k|magnet|flashget|qqdl):|\.(?:mp4|flv|rm|rmvb|mkv|asf|wmv|avi|mpeg|mpg|mov|qt)$|^http:\/\/dl[^\/]+sendfile.vip.xunlei.com/i;

    if(window.yunPlayer){
        window.yunPlayer.uninit();
        delete window.yunPlayer;
    }

    const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

    window.yunPlayer = {
        get focusedWindow() {
            return gContextMenu && gContextMenu.target ? gContextMenu.target.ownerDocument.defaultView : content;
        },

        init: function(){
            var contextMenu = $("contentAreaContextMenu");

            var playerMenu = $C("menu", {
                id: "yun-player-context",
                label: "云点播",
                class: "menu-iconic",
                hidden: true,
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACiElEQVQ4jWWTy2+MYRTGn6IiSIbEJdGIhYiQ+AdqURsLNLHpTqUWbAmRkNCFjRCJhEgsbMzGYtxiQlzKaBt1rU7bGd/oXTv1aV2+6U3Nd/1ZvB/SOsm7O8/lnOe80rzyv2Rq3Gxdym1NOO4zUX4sZh8kHPdNXSr4cm/P/P6/5ThOovyuNh1+EKElgqzwXwuvRZQfiV/3DZnbWZuemRlc+z+4fbOFLRgWUa8IcyJoF/4L4T4V5YfCaxZeq/Deb7bmkLhdh1JRaTl8E3wWDIqoELt4JdyMKDcJ/6VxFbwVfm9t2sxczNQEnxthei+UFsKY4JOIesTAQ9F05Z9y0C7CDhF2irBLBM69PXKty0m8Npg5DhPLYFxcPSvsNmGlxekDFXgtInhvQGFeRJZxGI3svaNy7kSRcgqmG6BUCWPiwinx7pYB+G/MC3MxqFdE/YIBwVDCkZffCdP7YHIdfBfYgiHTHGbNvGFeRB8N8Ee2kunCQhgRFIX87kooLTLgMcGIiPoMKOiIlXtixWHRemc1XZkVpndcyM1WFRmLlUdENCDCwr9FRYXY8rBJ6FzjNiaHKsERlFZ9lZurT/Iptt0n3JwIu439MG9mZkgwKprvruHqxS0wsRgmN8DssRvyx1uq/yiFebF/dwWF2yLoNNumX/zsWcD1S+s5f2YrgbMEpnaY1Py+GnNI3XWpIGuiGn8iDtctZt+u5Zw8uJIjDVUcPbSRppurje3JTTBzEspP038v0bbtpV7H9la/zRyM/9KMEX00V8moWRilCpiqhp/XLBwnMec/2La91MvXJ90nwns+j6AYEziC2aOp/8BzvvOPlmrPqk+G1obBqBDHN1pVpFSf5FemZn7/b/8KdAFaIa0vAAAAAElFTkSuQmCC"
            });

            var menuPopup = playerMenu.appendChild($C("menupopup"));
            for(var name in API_URLS){
                let url = API_URLS[name];
                menuPopup.appendChild($C("menuitem", {
                    label: name,
                    oncommand: "yunPlayer.run(this.parentNode.parentNode.getAttribute('tooltiptext'), this.label)",
                }));
            }

            contextMenu.insertBefore(playerMenu, contextMenu.firstChild);
            contextMenu.addEventListener("popupshowing", this, false);
        },
        uninit: function(){
            var contextMenu = $("contentAreaContextMenu");

            var playerMenu = $("yun-player-context");
            if(playerMenu)
                contextMenu.removeChild(playerMenu);

            contextMenu.removeEventListener("popupshowing", this, false);
        },
        handleEvent: function(event){
            switch(event.type){
                case "popupshowing":
                    var playerMenu = $("yun-player-context");

                    var hidden = true;
                    if(gContextMenu.onLink){
                        var url = gContextMenu.linkURL;
                        if(LINK_REGEXP.test(url)){
                            playerMenu.setAttribute("tooltiptext", url);
                            hidden = false;
                        }
                    } else {
                        var selection = this.getSelection();
                        if(LINK_REGEXP.test(selection)){
                            playerMenu.setAttribute("tooltiptext", selection);
                            hidden = false;
                        }
                    }

                    playerMenu.hidden = hidden;
                    break;
            }
        },
        run: function(url, apiName){
            if(!url) return;
            if(!apiName){
                apiName = "快乐云点播";
            }

            if(gContextMenu.target){
                gContextMenu.target.style.color = LINK_CLICKED_COLOR;
            }

            // 迅雷云播磁力链接
            if (apiName == "迅雷云播" && url.startsWith("magnet:")) {
                url = encodeURIComponent(url);
            }

            url = API_URLS[apiName] + url;
            var nextTabIndex = gBrowser.mCurrentTab._tPos + 1;
            var tab = gBrowser.loadOneTab(url, null, null, null, false, false);
            gBrowser.moveTabTo(tab, nextTabIndex);
        },
        getSelection: function(win) {
            // from getBrowserSelection Fx19
            win || (win = this.focusedWindow);
            var selection  = this.getRangeAll(win).join(" ");
            if (!selection) {
                let element = document.commandDispatcher.focusedElement;
                let isOnTextInput = function (elem) {
                    return elem instanceof HTMLTextAreaElement ||
                        (elem instanceof HTMLInputElement && elem.mozIsTextField(true));
                };

                if (isOnTextInput(element)) {
                    selection = element.QueryInterface(Ci.nsIDOMNSEditableElement)
                        .editor.selection.toString();
                }
            }

            if (selection) {
                selection = selection.replace(/^\s+/, "")
                    .replace(/\s+$/, "")
                    .replace(/\s+/g, " ");
            }
            return selection;
        },
        getRangeAll: function(win) {
            win || (win = this.focusedWindow);
            var sel = win.getSelection();
            var res = [];
            for (var i = 0; i < sel.rangeCount; i++) {
                res.push(sel.getRangeAt(i));
            }
            return res;
        },
        copy: function(str){
            Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper)
                .copyString(str);
        }
    };

    function $(id) document.getElementById(id)
    function $C(name, attr) {
        var el = document.createElement(name);
        if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
        return el;
    }
})();

window.yunPlayer.init();