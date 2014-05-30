// ==UserScript==
// @name           SimpleMusicPlayer.uc.js
// @author         ywzhaiqi
// @namespace      https://github.com/ywzhaiqi
// @description    简单音乐播放面板，支持多个站点，参考了百度随心听播放栏UC脚本。
// @include        main
// @charset        UTF-8
// @version        2014.05.30
// ==/UserScript==

(function(){

    var Config = {
        isUrlBar: 1,
        iframeStyle: {
            normal: "width: 960px; height: 600px;",
            mobile: "width: 320px; height: 480px;",
        },
        logo: {
            main: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABX0lEQVQ4jZ2TT0sCQRiH50uYSS0YehGkS9D3EAIDQSJv0i3QDuGho1AggZ4i8OihTmEHr3boPVfg7Ap9gd2dZZkZ9fDrsLm06Wp2eC7vn4cf8zKMMcZs28Z/YIwxJoSA7/uYTCYb4fs+hBBgnudhOp2uJFsbIF3tIV3twSi3w7rneesF2doARrmNRKGJRKGJXGMYFQghVkbdOrpBvt5HrjHEYesNRBT2hBDrBalSB/l6H0QUWf6zwKh0FxYjAtd1obWOJV3tgYiW9lzXXS/YO3tYL1BKRXh8t3Hx/InM+VOY4PeMUmq5wKh0cXD9gf2rl+Du328QK3AcB1LKkFSpg52TO+ye3iNz+YpUqQMiiszMcRwnSPCzSERIFlvYPr5FstiKXZZSBgmEENBaR6LNbx4XXSkFrXVwxtFoBCklZrPZRkgpwTkPfiTnHJxzmKYJ0zRhWRbG4/EClmWFM/PlL1Rejfxv4Dc3AAAAAElFTkSuQmCC"
        },
        mobileUAString: 'Mozilla/5.0 (Android; Mobile; rv:29.0) Gecko/29.0 Firefox/29.0',
    };

    var Sites = [
        {
            name: "百度随心听（手机版）",
            url: "http://fm.baidu.com/",
            changeUA: true,
            iframeStyle: "mobile",
            css: "#ad { display:none !important; }",
        },
        {
            name: "百度随心听",
            url: "http://fm.baidu.com/",
            iframeStyle: "width: 740px; height: 570px;",
            // 自写的样式
            css: "#logo-wrap{display:none}#channelbar-wrap{left:0!important}#user-bar{left:260px!important}#main{width:auto!important}#right-wrapper,#playerpanel-share{display:none!important}.footer,#promotionbar-text{display:none}",
        },
        {
            name: "豆瓣FM（私人版）",
            url: "http://douban.fm/partner/firefox",
            iframeStyle: "mobile", 
        },
        /*
            下2个无法暂停，按钮无法点击。
            在 iframe 无法点击播放？
         */
        // {
        //  name: "豆瓣FM",
        //  url: "http://douban.fm/",
        // },
        // // 
        // {
        //  name: "豆瓣FM（手机版）",
        //  disabled: true,  
        //  url: "http://douban.fm/partner/sidebar",
        //  changeUA: true,
        //  iframeStyle: "mobile",
        // },
        {
            name: "落网电台",
            url: "http://www.luoo.net/",
            iframeStyle: "mobile",
            // 该样式来自 http://bbs.kafan.cn/thread-1703995-1-2.html，略加修改
            css: ".head{min-width:auto!important}BODY,#main,.clearfix,.volindex-aside,.volindex-article,.widget-content{width:300px!important;margin-left:auto!important;margin-right:auto!important}.volindex-article{position:absolute!important;margin-top:1180px!important}.head-content.clearfix{width:36px!important;margin-top:-31px!important;position:absolute!important}LI,#nav1,#nav2,#nav3,#nav4,#nav5,#nav6,#nav7,#nav8{width:36px!important}#main{margin-top:-35px!important}.track-info.clearfix{width:200px!important;margin-left:auto!important;margin-right:auto!important;border:1px solid rgba(111,0,255,.9)!important;border-radius:5px;text-align:center}.cover{margin-left:20px!important;margin-right:auto!important;border:1px solid rgba(156,0,0,.9)!important;border-radius:2px}.toolbar{width:200px!important;margin-left:auto!important;margin-right:auto!important}.btn-action-like.icon-like-large-actived,.btn-action-like.icon-like-large{position:absolute!important;margin-top:-85px!important;margin-left:142px!important}.luoo-scroller-page.clearfix.current-page{width:180px!important;margin-left:auto!important;margin-right:auto!important;text-align:center}.widget.luoo-scroller.relative-vols{position:absolute!important;margin-top:-25px!important;width:300px!important}.widget-title.clearfix{width:280px!important;margin-left:auto!important;margin-right:auto!important}.ad-wrapper,.foot-content.clearfix,.fm-cover,.comment.index-comment,.fm-info,.top-toolbar,.main-nav,.logo,.progress.jp-volume-bar{display:none!important}",
        },
    ];


    // 来自 User Agent Overrider 扩展
    const Pref = function(branchRoot) {

        const supportsStringClass = Cc['@mozilla.org/supports-string;1'];
        const prefService = Cc['@mozilla.org/preferences-service;1']
                               .getService(Ci.nsIPrefService);

        const new_nsiSupportsString = function(data) {
            let string = supportsStringClass.createInstance(Ci.nsISupportsString);
            string.data = data;
            return string;
        };

        let branch = prefService.getBranch(branchRoot);

        let setBool = function(key, value) {
            try {
                branch.setBoolPref(key, value);
            } catch(error) {
                branch.clearUserPref(key)
                branch.setBoolPref(key, value);
            }
        };
        let getBool = function(key, defaultValue) {
            let value;
            try {
                value = branch.getBoolPref(key);
            } catch(error) {
                value = defaultValue || null;
            }
            return value;
        };

        let setInt = function(key, value) {
            try {
                branch.setIntPref(key, value);
            } catch(error) {
                branch.clearUserPref(key)
                branch.setIntPref(key, value);
            }
        };
        let getInt = function(key, defaultValue) {
            let value;
            try {
                value = branch.getIntPref(key);
            } catch(error) {
                value = defaultValue || null;
            }
            return value;
        };

        let setString = function(key, value) {
            try {
                branch.setComplexValue(key, Ci.nsISupportsString,
                                       new_nsiSupportsString(value));
            } catch(error) {
                branch.clearUserPref(key)
                branch.setComplexValue(key, Ci.nsISupportsString,
                                       new_nsiSupportsString(value));
            }
        };
        let getString = function(key, defaultValue) {
            let value;
            try {
                value = branch.getComplexValue(key, Ci.nsISupportsString).data;
            } catch(error) {
                value = defaultValue || null;
            }
            return value;
        };

        let reset = function(key) {
            branch.clearUserPref(key);
        };

        let addObserver = function(observer) {
            try {
                branch.addObserver('', observer, false);
            } catch(error) {
                trace(error);
            }
        };
        let removeObserver = function(observer) {
            try {
                branch.removeObserver('', observer, false);
            } catch(error) {
                trace(error);
            }
        };

        let exports = {
            setBool: setBool,
            getBool: getBool,
            setInt: setInt,
            getInt: getInt,
            setString: setString,
            getString: getString,
            reset: reset,
            addObserver: addObserver,
            removeObserver: removeObserver
        }
        return exports;
    };

    // 来自 User Agent Overrider 扩展
    let UAManager = (function() {

        // There are a bug since Firefox 17, was fixed at Firefox 23
        // https://bugzilla.mozilla.org/show_bug.cgi?id=814379

        let hackingWay = function() {
            // this way work only at Firefox 17 - 24

            Cu.import('resource://gre/modules/UserAgentOverrides.jsm');

            // Orignal UA selector function, a method of UserAgentOverrides.
            // Keep it for revert to default.
            let orignalGetOverrideForURI = UserAgentOverrides.getOverrideForURI;

            let revert = function() {
                UserAgentOverrides.getOverrideForURI = orignalGetOverrideForURI;
            };

            let change = function(uastring) {
                UserAgentOverrides.getOverrideForURI = function() uastring;
            };

            let exports = {
                revert: revert,
                change: change,
            };
            return exports;
        };

        let normalWay = function() {
            // this way work only at Firefox 23+

            let pref = Pref('general.useragent.');

            let revert = function() {
                pref.reset('override');
            };

            let change = function(uastring) {
                pref.setString('override', uastring);
            };

            let exports = {
                revert: revert,
                change: change,
            };
            return exports;
        }

        const appInfo = Cc['@mozilla.org/xre/app-info;1']
                           .getService(Components.interfaces.nsIXULAppInfo);
        let mainVersion = parseInt(appInfo.version.split('.')[0]);
        if (mainVersion < 23) {
            return hackingWay();
        } else {
            return normalWay();
        }
    })();

    if (window.SimpleMusicPlayer) {
        window.SimpleMusicPlayer.uninit();
        delete window.SimpleMusicPlayer;
    }

    window.SimpleMusicPlayer = {
        init: function() {
            var self = this;

            this.curSiteIndex = 0;

            var css = '\
				#SimpleMusicPlayer {\
					-moz-appearance: none !important;\
					border-style: none !important;\
					border-radius: 0 !important;\
					padding: 0 3px !important;\
					margin: 0 !important;\
					background: transparent !important;\
					box-shadow: none !important;\
					-moz-box-align: center !important;\
					-moz-box-pack: center !important;\
					min-width: 18px !important;\
					min-height: 18px !important;\
				}\
				'.replace(/[\r\n\t]/g, '');;
            this.style = addStyle(css);

            // 添加 icon
            var bar = Config.isUrlBar ? "urlbar-icons" : "addon-bar";
            this.icon = $(bar).appendChild($C("toolbarbutton", {
                id: "SimpleMusicPlayer",
                class: "toolbarbutton-1",
                label: "百度随心听",
                tooltiptext: "百度随心听",
                image: Config.logo.main,
                // type: "menu",
                context: "SimpleMusicPlayer-popup",
                onclick: "if (event.button != 2) SimpleMusicPlayer.iconClick(event);",
            }));

            // 右键菜单
            var menuPopup = $C("menupopup", {
                id: "SimpleMusicPlayer-popup",
                position: "after_start",
                onpopupshowing: "SimpleMusicPlayer.onPopupShowing(event);"
            });
            // 根据站点添加菜单到右键菜单
            Sites.forEach(function(site, index){
                menuPopup.appendChild($C('menuitem', {
                    label: site.name,
                    type: "radio",
                    checked: self.curSiteIndex == index,
                    oncommand: "SimpleMusicPlayer.openPanel(" + index + ");",
                    index: index,
                    image: site.image || "",
                    disabled: site.disabled || false,
                }));
            });

            // panel
            var panel = $C("panel", {
                id: "SimpleMusicPlayer-panel",
                type: "arrow",
                flip: "both",
                side: "top",
                consumeoutsideclicks: "false",
                noautofocus: "false",
                panelopen: "true",
            });

            // panel 里添加 iframe
            panel.appendChild($C("iframe", {
                id: "SimpleMusicPlayer-iframe",
                type: "content",
                flex: "1",
                transparent: "transparent",
                showcaret: "true",
                autocompleteenabled: "true",
                style: Config.iframeStyle.mobile
            }));

            var mainPopupSet = $("mainPopupSet");
            mainPopupSet.appendChild(menuPopup);
            mainPopupSet.appendChild(panel);
        },
        uninit: function() {
            ["SimpleMusicPlayer", "SimpleMusicPlayer-popup", "SimpleMusicPlayer-panel"].forEach(function(id){
                var elem = $(id);
                if (elem) {
                    elem.parentNode.removeChild(elem);
                }
            });

            this.style && this.style.parentNode.removeChild(this.style);
        },
        iconClick: function(event) {
            this.openPanel();
        },
        onPopupShowing: function(event) {

        },
        reloadPage: function() {

        },
        openPanel: function(siteIndex) {
            var self = this;
            var panel = $("SimpleMusicPlayer-panel"),
                iframe = $("SimpleMusicPlayer-iframe");

            var openPopup = function() {
                panel.openPopup(self.icon, "after_end", -8, 0, false, null, null);
            };

            // 已经在播放的页面直接打开
            if (siteIndex == undefined && iframe.src) {
                openPopup();
                return;
            }

            // this.curSiteIndex = siteIndex;
            siteIndex || (siteIndex = this.curSiteIndex);
            var curSite = Sites[siteIndex],
                url = curSite.url;

            // set iframe style
            var iStyle = curSite.iframeStyle;
            if (iStyle) {
                if (iStyle == "mobile") {
                    iStyle = Config.iframeStyle.mobile;
                }
            } else {
                iStyle = curSite.changeUA ? Config.iframeStyle.mobile : Config.iframeStyle.normal
            }
            iframe.setAttribute('style', iStyle);

            // 设置 UA
            if (curSite.changeUA) {
                UAManager.change(Config.mobileUAString);
            }

            // 两个地址都要改?mdc是按照第二个写的,真正有效的也是第二个,第一个是以后用来比较用的
            iframe.src = url;
            iframe.contentDocument.location.href = url;

            var onload = function(event){
                var doc = event.originalTarget;
                if (doc.location.href == "about:blank") {  // NoScript 会引起空白调用
                    return;
                }

                iframe.removeEventListener(event.type, onload, false);

                // 添加样式
                var style = doc.createElement('style');
                style.textContent = curSite.css;
                doc.head.appendChild(style);
            };
            iframe.addEventListener("DOMContentLoaded", onload, false);

            openPopup();

            // 还原 UA
            if (curSite.changeUA) {
                UAManager.revert();
            }
        },
    };


    window.SimpleMusicPlayer.init();

    function $(id, doc) (doc || document).getElementById(id);
    function $C(name, attr) {
        var el = document.createElement(name);
        if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
        return el;
    }

    function addStyle(css) {
    	var pi = document.createProcessingInstruction(
    		'xml-stylesheet',
    		'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
    	);
    	return document.insertBefore(pi, document.documentElement);
    }
})()

