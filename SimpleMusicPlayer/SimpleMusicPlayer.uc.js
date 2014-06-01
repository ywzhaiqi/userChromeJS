// ==UserScript==
// @name           SimpleMusicPlayer.uc.js
// @author         ywzhaiqi
// @namespace      https://github.com/ywzhaiqi
// @description    简单音乐播放面板，支持多个站点，参考了百度随心听播放栏UC脚本。
// @include        main
// @charset        UTF-8
// @version        2014.06.01
// ==/UserScript==

(function(){

    var Config = {
        isUrlBar: 1,
        iframeStyle: {
            normal: "width: 960px; height: 600px;",
            mobile: "width: 320px; height: 480px;",
        },
        logo: {
            main: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABX0lEQVQ4jZ2TT0sCQRiH50uYSS0YehGkS9D3EAIDQSJv0i3QDuGho1AggZ4i8OihTmEHr3boPVfg7Ap9gd2dZZkZ9fDrsLm06Wp2eC7vn4cf8zKMMcZs28Z/YIwxJoSA7/uYTCYb4fs+hBBgnudhOp2uJFsbIF3tIV3twSi3w7rneesF2doARrmNRKGJRKGJXGMYFQghVkbdOrpBvt5HrjHEYesNRBT2hBDrBalSB/l6H0QUWf6zwKh0FxYjAtd1obWOJV3tgYiW9lzXXS/YO3tYL1BKRXh8t3Hx/InM+VOY4PeMUmq5wKh0cXD9gf2rl+Du328QK3AcB1LKkFSpg52TO+ye3iNz+YpUqQMiiszMcRwnSPCzSERIFlvYPr5FstiKXZZSBgmEENBaR6LNbx4XXSkFrXVwxtFoBCklZrPZRkgpwTkPfiTnHJxzmKYJ0zRhWRbG4/EClmWFM/PlL1Rejfxv4Dc3AAAAAElFTkSuQmCC",
            love:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABV0lEQVR42mNgGFaAMTQ0lO3t27ch379/r//06VPS/PnzBTw9PdnfvHkTBBVLWb9+vQBILYbmvr4+oR8/fhz9jwR+/fp1/+vXr8eQxX7//v3wyJEj2kA9TMgGsL18+bLvP5Hgy5cvB4B6uOC2A7EAUPAasQb8+/fvr7W1tRzMFSBC4v3791eJNeDv37+/lZSU1ID6WGAukNi/f/8UYg24c+fOQaAeBZgBIMDPy8trff/+/UuENH/8+PG1i4tLEFCPGHJAsgKxLBD43bhx4xwuzcDofOrj45MCVAtyPgdKNAIxJxArMTMze+7YsWMj0J//kDVfuXLljJqaWgRQjRYQ82JNC1BTQaFr39TU1Pnt27cvQIP+rFq1ailQzAOIVYGYBz0NoBvCBsTiQGyWlpZWMHPmzF4g2xbkRagrGYlJ1qDQFYTaqAHEotBwYiQlb4CcyQ71FjMuRQCIg3X/rGbFNAAAAABJRU5ErkJggg==",
            hate:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABXklEQVR42u1SPUjDQBSO4iLFReyuSHEQZ3F2cHVxERxEdNPBxTGbIJHY5C6p1dxPk7vLUtxdhIKIgg6OBd0FQQdxUKj6LmmxkUaKswcfPN7P99777hlG17NtexgFYhlTsfUTiIhN+4hPG789dBxOeEy8+LX4swc+XBr5kDaQS+BW+SRm8k0XeExdeFw12njQPsQkg7TBTNGuS4vOIS05VJacQMxjrhICTMPZxAfweHySTMFVveyTKe07qLBx0zSHDJeKS+jQyhk7FzDNc5mGCwaiovEXAszEo57YsKywgLhcS5xc3rmUFvMAXbcTfbi6sYNgFFZI9YDAUiqcbFqWVYCEWw29K4ha0TYi0arH4vW0u7rKfl8XwR4hI997ihkgONW2G0Q7/wR9EMClvcIlnncIQP1rr6ae2rF7sJu9CYJoETq9w/23+gGi8ixDsF9VY3BZK4jIjX6AiZzr1H4BpDgIiNjk92MAAAAASUVORK5CYII=",
            // loved:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCklEQVR42mNgGGYgdBWz2sxHAapzntWozXwYL959kZuh/j+TysyHfqqzntSozniUKFp/hQerXpBitdmPD6nPff4fhtXmPL2rOgtd7MkD5b4rKhgGqMx40IasEB8GunIPUAsjsn4moJMvEW3AnGd/RUPrUbzCojrj/jliDVCf8+wXg3USL4oLFLvP1RJrgMrkG5tAlqIGgoKBgOrkW4eJ8P8TkehmdWwRwchpGSqtPOn6blyaVaffvy0S02UEVMuMKyUwMvDzCyp2nZ4ECihkzcoTr+7gt4tVxKcZGXBJl62NVZv95D0wwH7LNx9pAorxo0cdIcAqnjHbSbZudyaQzUlu4gY5l5Wm2QcAU177z23sRrgAAAAASUVORK5CYII=",

            "play-pause": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABEklEQVQ4je1RMYvCMBh9XxLQRVDXEPIf/AFtKRlKpi7dHDJVelJIB+t03D9zEv+PgoNF8ZZWInfcIHfbPciQl/e+74UHBCiKgjvnxnVdj+q6Hg38cHfOjYui4PgLEACUZbmw1q6zLHuz1q6GzdbaVc+ty7JchB4AQJIkAgCiKPoAcB9O0zTzpmnmIddrHp7H3wHAGLMhoo4xdhFCHL33U+/9VAhxZIxdiKgzxmxCz1OCNE23/aYb5/xcVdWsqqoZ5/wM4Abg3mueE/wPeG4BwJWIOiHEKWjhREQdgOuPLcRx/B52PiQIuV7zfYI8z5dSyoNSaq+13rVtO2nbdqK13iml9lLKQ57nyy8Jfhv04ttr+ATbpZcnhuYJlQAAAABJRU5ErkJggg==",
            play: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABBklEQVQ4jZ2TzUqFQBiGn882bSOwwX3Q36K1qHgJkbkQOiKIil6FNxIc6LqKolWXUCePbcaDmJ5jvpv5YeZ9n/k+Bgaq69oAjOH+LIVheNRb/stEANI0vVFKreM4Pu3RzJIBUFXVJdAahvHi+/7dBNk0QVEUV8AP0AKtZVlPAxrZS6ANtsBGRDZAKyKvnufdD8NGDbIsu9bp285ojGaOQaMNWqARkS89/wyC4HyMZMygG7uavNm2/ZgkyfGhGnRP2OGbpvkcRdHZFP4ORxM0IvKtL787jhN2h/a1UwDyPL/oUpVS69VqZcLhFvZrcAt8uK77MCf1j8qyPEmSRPWplmrZb1yS/Av17VeTs/zXJAAAAABJRU5ErkJggg==",
            pause: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABEklEQVQ4je1RMYvCMBh9XxLQRVDXEPIf/AFtKRlKpi7dHDJVelJIB+t03D9zEv+PgoNF8ZZWInfcIHfbPciQl/e+74UHBCiKgjvnxnVdj+q6Hg38cHfOjYui4PgLEACUZbmw1q6zLHuz1q6GzdbaVc+ty7JchB4AQJIkAgCiKPoAcB9O0zTzpmnmIddrHp7H3wHAGLMhoo4xdhFCHL33U+/9VAhxZIxdiKgzxmxCz1OCNE23/aYb5/xcVdWsqqoZ5/wM4Abg3mueE/wPeG4BwJWIOiHEKWjhREQdgOuPLcRx/B52PiQIuV7zfYI8z5dSyoNSaq+13rVtO2nbdqK13iml9lLKQ57nyy8Jfhv04ttr+ATbpZcnhuYJlQAAAABJRU5ErkJggg==",
            stop: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA00lEQVQ4je2SvWrDMBSFv6sW0iUPEC6CtH0Rj8K7d09GTi3QpCdM8k52ftqhsutASDOkWw98HBBHugeu4EcSQljUdf1yixDCAhAeKQFIKS2dc5uyLD9u4ZzbpJSW0+2iKJ4BmqZ5Bz7vIWcBDFVVPQF479fGmF5EBhEZfU4vIoMxpvfer6f2Y4Ou616BU55yvjJ5PDvl7HeD/wcutyAiA3AEDtnnHICjiAxXt9C27du9/yBnLxvEGFfW2q2q7lV1l33OTlX31tptjHE1NfgLyS88Vl9K1qPRO6g2jgAAAABJRU5ErkJggg==",
            next: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABL0lEQVQ4jb2SsUoDQRRFz84uGQszaJNCnSK7kNgsIb1FqhCmsEtpGJYQSWQ7S5X4Azbqr9iLFmmshJDebwgSBMcmC4sYN7HwwjDNO+/dy3uQU7fb9a21W2mayuznv+QtHRy12+1zY8ypMebMGHOyUYPBYBAFQTADXPaiKLrN1xRqNBptK6WeAOf7/hxw1Wr1ft0mAmA4HO6Wy+UJ4IQQ74ALw/BuozjW2h2l1ARwnuctsjjj8Vis7SRNUymEeAM+hRBzwNXr9YvCOMspNJvNS2CROZBSvlprD38dncFxHF8v7X8ArlQqTfv9/kGRdQAajcYVuS18g8Uqzmu1WkGtVrshdwdSymmv19svhAE6nc5xpVJ50Vo/aq2ftdYPSZLsFcF5rSpa7wp/ALy/wBvpCySFT9I65t78AAAAAElFTkSuQmCC",
            prev: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABN0lEQVQ4ja2SsUvDQBTGv1xCTpAmTpk8hyOQIgRCVpdOGQ7XZAu0oZyDFDq4FfR25+qf4lxQNzfBzv4PxdbBc7mUCLbJ0A8e9+De+72Pdwe0aDKZ0OFweFSfeZ7bbT2HlRCiFEJcCyGusiy7KYrioq3HMoEwDOcAdB2O43xUVcU7NXPOHwFo27ZXALTv+4uyLI872eacPwDQhJAvALrX671Op9MTc012TldKEc75HIC2LGsNQHue9yKl9BsO/xUBgH6/f2cmrwD8EEI+8zx32yZvyaPR6JxS+m4cbACs0zSdAYBSai9gKynlmeu6SwP5BqDjOL7tCiHGCash9SskSTLr5KAJoZQu0fgHURTdDwYDB3uW+QcyHo9PGWNPjLFnxtgiCII3IcSlqWmF7CrotswGxGrkh9cvaRhPp97LvowAAAAASUVORK5CYII=",
        },
        names: {
            "play-pause": ["播放/暂停", "a"],
            "play": ["播放", "a"],
            "pause": ["暂停", "s"],
            "stop": ["停止", "s"],
            "love": ["喜欢", "f"],
            "hate": ["讨厌", "g"],
            "next": ["下一首", "e"],
            "prev": ["上一首", "r"],
            "collect": ["收藏", "c"],
            "reset": ["重置", "r"],
            "rptOne": ["单曲循环", ""],
        },
        mobileUAString: 'Mozilla/5.0 (Android; Mobile; rv:29.0) Gecko/29.0 Firefox/29.0',
    };


    var Sites = [
        {
            name: "百度随心听（手机版）",
            url: "http://fm.baidu.com/",
            changeUA: true,
            iframeStyle: "width: 320px; height: 440px;",
            css: "#ad { display:none !important; }",
            control: {
                "play-pause": function(win) {
                    var player = win.player;
                    if (player.getState() == 'play') {
                    player.pause();
                    } else {
                        player.play();
                    }
                },
                // "play": "win.player.play()",
                // "pause": "win.player.pause()",
                // "stop": "win.player.stop()",
                "love": "#playerpanel-btnlove",
                "hate": "#playerpanel-btnhate",
                "next": "#playerpanel-btnskip",
                // "reset": "win.player.reset()",
            }
        },
        {
            name: "百度随心听",
            url: "http://fm.baidu.com/",
            iframeStyle: "width: 720px; height: 500px;",
            // 来自样式 http://userstyles.org/styles/101925/fm-baidu-com
            css: "html{overflow-y:auto}#header-inner{width:auto}#logo-wrap{display:none}#channelbar-wrap{left:20px}#user-bar{right:20px}#user-bar #quality-panel{display:none}#main{width:auto}#right-wrapper{display:none}#playerpanel-share{display:none}.tab-page{width:auto;margin:20px}.playerpanel-bottom{height:auto}.footer{display:none}",
            control: {
                // "play": "win.player.play()",
                "play-pause": "#playerpanel-btnplay",
                "love": "#playerpanel-btnlove",
                "hate": "#playerpanel-btnhate",
                "next": "#playerpanel-btnskip",
            }
        },
        {
            name: "豆瓣FM（私人版）",
            url: "http://douban.fm/partner/firefox",
            iframeStyle: "width: 360px; height: 290px;",
            css: "DIV#promotion{ display:none !important; }",
            control: {
                "play": ".bn-play",
                "pause": ".bn-pause",
                "love": ".bn-love",
                "hate": ".bn-ban-disable",
                "next": ".bn-skip",
            }
        },
        // {
        //     name: "Jing+ Music（手机版）",
        //     url: "http://jing.fm/",
        //     changeUA: true,
        //     iframeStyle: "mobile",
        //     css: ".slgnMblCtn { display:none; }",
        //     control: {
        //         "play-pause": "#play",
        //     }
        // },
        {
            name: "Jing+ Music",
            url: "http://jing.fm/",
            iframeStyle: "",
            // css: "",
            control: {
                "play-pause": "#playCtl",
                love: "#playerLove",
                hate: "#playerHate",
                rptOne: "#playerRptOne",
                next: "#playerNext"
            }
        },
        /*
            下面两个在 iframe 无法点击播放？
         */
        {
			name: "豆瓣FM（手机版）（窗口）",
			url: "http://douban.fm/partner/sidebar",
			isWindow: true,
			windowFeatures: 'width=265px,height=520px,resizable',
        },
        {
			name: "豆瓣FM（窗口）",
			url: "http://douban.fm/",
			isWindow: true,
			windowFeatures: 'width=1110px,height=626px,resizable,scrollbars=yes',
        },
        {
            name: "虾米猜（窗口）",
            url: "http://www.xiami.com/radio",
            isWindow: true,
            windowFeatures: 'width=1200px,height=740px,resizable,scrollbars=yes',
        },
        {
            name: "心理FM",
            url: "http://fm.xinli001.com/",
            control: {
                "play-pause": "#playBtn",
                "collect": "#collect",
                "next": "#nextBtn",
                "prev": "#prevBtn",
            }
        },
        {
            name: "落网电台",
            url: "http://www.luoo.net/",
            iframeStyle: "mobile",
            // 该样式来自 http://bbs.kafan.cn/thread-1703995-1-2.html，略加修改
            css: ".head{min-width:auto!important}BODY,#main,.clearfix,.volindex-aside,.volindex-article,.widget-content{width:300px!important;margin-left:auto!important;margin-right:auto!important}.volindex-article{position:absolute!important;margin-top:1180px!important}.head-content.clearfix{width:36px!important;margin-top:-31px!important;position:absolute!important}LI,#nav1,#nav2,#nav3,#nav4,#nav5,#nav6,#nav7,#nav8{width:36px!important}#main{margin-top:-35px!important}.track-info.clearfix{width:200px!important;margin-left:auto!important;margin-right:auto!important;border:1px solid rgba(111,0,255,.9)!important;border-radius:5px;text-align:center}.cover{margin-left:20px!important;margin-right:auto!important;border:1px solid rgba(156,0,0,.9)!important;border-radius:2px}.toolbar{width:200px!important;margin-left:auto!important;margin-right:auto!important}.btn-action-like.icon-like-large-actived,.btn-action-like.icon-like-large{position:absolute!important;margin-top:-85px!important;margin-left:142px!important}.luoo-scroller-page.clearfix.current-page{width:180px!important;margin-left:auto!important;margin-right:auto!important;text-align:center}.widget.luoo-scroller.relative-vols{position:absolute!important;margin-top:-25px!important;width:300px!important}.widget-title.clearfix{width:280px!important;margin-left:auto!important;margin-right:auto!important}.ad-wrapper,.foot-content.clearfix,.fm-cover,.comment.index-comment,.fm-info,.top-toolbar,.main-nav,.logo,.progress.jp-volume-bar{display:none!important}",
        },
        {
            name: "蜻蜓fm",
            url: "http://qingting.fm/",
            openLinkInsided: true,
            iframeStyle: "width: 1000px; height: 600px;",
            control: {
                // "play-pause": "#btn-play"
                "play-pause": "a[title='播放/暂停']"
            },
        },
        {
            name: "倾听网络收音机",
            url: "http://www.qingtin.com/app/",
            iframeStyle: "width:470px; height:410px;",
            css: "#cue { display:none; }"
        },
        {
            name: "FIFM.CN",
            url: "http://www.fifm.cn/",
            iframeStyle: "width: 980px; height: 600px;",
            css: "#bdshare,.footer, #favorite_table_box div[style*='overflow:hidden']{display:none;}",
        },
        // {
        // 	name: "AOP音乐网址导航",
        // 	enable: false,
        // 	url: "http://www.aopmusic.com/"
        // }
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

    if (window.SimpleMusicPlayer) {  // 修改调试用，重新载入无需重启
        window.SimpleMusicPlayer.uninit();
        delete window.SimpleMusicPlayer;
    }

    window.SimpleMusicPlayer = {
        get prefs () Pref('general.useragent.'),
        get curSiteIndex() this.prefs.getInt("curSiteIndex") || 0,
        set curSiteIndex(num) {
            this.prefs.setInt("curSiteIndex", num);
        },

        init: function() {
            var self = this;

            var css = '\
				#SimpleMusicPlayer {\
					-moz-appearance: none !important;\
					border-style: none !important;\
					border-radius: 0 !important;\
					padding: 0 0 !important;\
					margin: 0 !important;\
					background: transparent !important;\
					box-shadow: none !important;\
					-moz-box-align: center !important;\
					-moz-box-pack: center !important;\
					min-width: 18px !important;\
					min-height: 18px !important;\
				}\
				.SimpleMusicPlayer-icon-play-pause { list-style-image: url(' + Config.logo["play-pause"] + ') }\
				.SimpleMusicPlayer-icon-play { list-style-image: url(' + Config.logo.play + ') }\
				.SimpleMusicPlayer-icon-pause { list-style-image: url(' + Config.logo.pause + ') }\
				.SimpleMusicPlayer-icon-stop { list-style-image: url(' + Config.logo.stop + ') }\
				.SimpleMusicPlayer-icon-love { list-style-image: url(' + Config.logo.love + ') }\
				.SimpleMusicPlayer-icon-hate { list-style-image: url(' + Config.logo.hate + ') }\
				.SimpleMusicPlayer-icon-next { list-style-image: url(' + Config.logo.next + ') }\
				.SimpleMusicPlayer-icon-prev { list-style-image: url(' + Config.logo.prev + ') }\
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
            var menuPopup;

            menuPopup = $C("menupopup", {
                id: "SimpleMusicPlayer-popup",
                position: "after_start",
                onpopupshowing: "SimpleMusicPlayer.onPopupShowing(event);"
            });

            // 添加关闭等按钮
            menuPopup.appendChild($C("menuitem", {
                label: "关闭",
                oncommand: "SimpleMusicPlayer.close()",
            }));

            menuPopup.appendChild($C("menuseparator"));

            // 根据站点添加菜单
            Sites.forEach(function(site, index){
                menuPopup.appendChild($C('menuitem', {
                    label: site.name,
                    class: "SimpleMusicPlayer-site",
                    type: "radio",
                    checked: self.curSiteIndex == index,
                    disabled: (site.enable == undefined ? false : site.enable),
                    oncommand: "SimpleMusicPlayer.openPanel(" + index + ");",
                    onclick: "SimpleMusicPlayer.siteMenuClick(event);",
                    url: site.url,
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
                style: Config.iframeStyle.mobile,
                // 以下需要？
                // showcaret: "true",
                // autocompleteenabled: "true",
                // clickthrough: "never",
                // autoscroll: "false",
                // disablehistory: "false",
                // context: "contentAreaContextMenu",
            }));

            var mainPopupSet = $("mainPopupSet");
            mainPopupSet.appendChild(menuPopup);
            mainPopupSet.appendChild(panel);

        },
        uninit: function() {
            ["SimpleMusicPlayer", "SimpleMusicPlayer-popup", "SimpleMusicPlayer-panel"].forEach(function(id){
                var elem = $(id);
                if (elem) {
                    elem.parentElement.removeChild(elem);
                }
            });
            this.style && this.style.parentNode.removeChild(this.style);
        },
        iconClick: function(event) {
            this.openPanel();
        },
        siteMenuClick: function(event) {
            if (event.button == 2) {
                var url = event.target.getAttribute('url');
                openLinkIn(url, 'tab', { inBackground: false });
                event.stopPropagation();
                event.preventDefault();
            }
        },
        onPopupShowing: function(event) {

        },
        openPanel: function(siteIndex) {
            var self = this;
            var panel = $("SimpleMusicPlayer-panel"),
                iframe = $("SimpleMusicPlayer-iframe");

            var openPopup = function() {
                panel.openPopup(self.icon, "after_end", -8, 0, false, null, null);
            };

            // 已经在播放的页面直接打开
            if (siteIndex == undefined) {
                if (this.newWindow) {
                    try {
                        this.newWindow.focus();
                        return;
                    } catch(ex) {
                        this.newWindow = null;
                    }
                } else if (iframe.src) {
                    openPopup();
                    return;
                }
            }

            // 先设为空白，加快速度？
            this.setIframeSrc("about:blank", iframe);

            if (siteIndex == undefined) {
                siteIndex = this.curSiteIndex;
            }

            var curSite = Sites[siteIndex],
                url = curSite.url;

            // 打开新窗口的
            if (curSite.isWindow) {
                if (this.newWindow) {
                    // 如果是当前选中的激活，否则关闭上一个窗口，打开新窗口。
                    if (this.curSiteIndex == siteIndex) {
                        try {
                        this.newWindow.focus();
                        return;
                        } catch(ex) {
                            this.newWindow = null;
                        }
                    } else {
                        this.close();
                    }
                }

                this.newWindow = window.open(curSite.url, '', curSite.windowFeatures);

                this.curSiteIndex = siteIndex;
                this.rebuildControls();
                return;
            }

            this.curSiteIndex = siteIndex;
            this.rebuildControls();

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

            // 链接强制在 iframe 里打开。只能用字符串的形式
            var onclick = curSite.openLinkInsided == true ?
                    this.openLinkInIframe.toString().replace(/^[^{]+\{/, '').replace(/\}$/, '') :
                    '';
            iframe.setAttribute('onclick', onclick)
            // 设置 UA
            if (curSite.changeUA) {
                UAManager.change(Config.mobileUAString);
            }

            this.setIframeSrc(url, iframe);

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
        close: function() {
            if (this.newWindow) {
                try { // 可能是 dead object
                    this.newWindow.close();
                } catch (ex) {}
                this.newWindow = null;
            } else {
                this.resetIframe();
            }
        },
        setIframeSrc: function(url, iframe) {
            if (!iframe) {
                iframe = $('SimpleMusicPlayer-iframe');
            }

            // 两个地址都要改?mdc是按照第二个写的,真正有效的也是第二个,第一个是以后用来比较用的
            iframe.src = url;
            iframe.contentDocument.location.href = url;
        },
        resetIframe: function() {
            var iframe = $('SimpleMusicPlayer-iframe');
            iframe.setAttribute('style', Config.iframeStyle.mobile);
            this.setIframeSrc('about:blank', iframe);
        },
        rebuildControls: function(menuPopup){
            var site = Sites[this.curSiteIndex];

            if (!menuPopup) {
                menuPopup = $('SimpleMusicPlayer-popup');
            }

            // 移除原有菜单
            var menuitems = menuPopup.querySelectorAll('.control');
            for (var i = menuitems.length - 1; i >= 0; i--) {
                menuitems[i].parentNode.removeChild(menuitems[i]);
            }

            if (!site.control) {
                return;
            }

            var ins = menuPopup.querySelector('.SimpleMusicPlayer-site');

            // 添加新的菜单
            var menuitem;
            for (let [action, ] in Iterator(site.control)) {
                menuitem = $C('menuitem', {
                    label: Config.names[action][0] || action,
                    accesskey: Config.names[action][1],
                    class: 'menuitem-iconic control ' + 'SimpleMusicPlayer-icon-' + action,
                    oncommand: "SimpleMusicPlayer.doAction('" + action + "')",
                });

                menuPopup.insertBefore(menuitem, ins);
            }

            menuPopup.insertBefore(
                $C('menuseparator', { class: 'control'}),
                ins);
        },
        doAction: function(action) {
            if (!action) return;

            var iframe = $('SimpleMusicPlayer-iframe');
            if (!iframe) return;

            var
                site = Sites[this.curSiteIndex],
                win = iframe.contentWindow,
                doc = iframe.contentDocument,
                unsafeWindow = win.wrappedJSObject
            ;

            var doAction = site.control[action];
            if (typeof doAction == 'function') {
                doAction.apply(unsafeWindow, [unsafeWindow, doc]);
                return;
            } else if (doAction.startsWith('win')) {
                new Function("win", doAction).apply(unsafeWindow, [unsafeWindow, doc]);
            }

            var elem = doc.querySelector(doAction);
            if (elem) {
                if (site.changeUA) {
                    fireEvent(elem, 'tap');
                } else {
                    elem.click();
                }
            }

            function fireEvent(el, type) {
                var e = doc.createEvent('HTMLEvents');
                e.initEvent(type, true, true);
                return !el.dispatchEvent(e);　
            }
        },
        openLinkInIframe: function(event) {
            var findLink = function (element) {
                switch (element.tagName) {
                    case 'A': return element;

                    case 'B': case 'I': case 'SPAN': case 'SMALL':
                    case 'STRONG': case 'EM': case 'BIG': case 'SUB':
                    case 'SUP': case 'IMG': case 'S':
                        var parent = element.parentNode;
                        return parent && findLink(parent);

                    default:
                        return null;
                }
            };
            var link = findLink(event.target);
            if(!link) return;

            var href = link.href;

            if (href && href.match(/^(https?|ftp):\/\//)) {
                event.preventDefault();
                event.stopPropagation();
                SimpleMusicPlayer.setIframeSrc(href);
            }
        }
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

