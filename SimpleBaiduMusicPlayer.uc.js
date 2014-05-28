// ==UserScript==
// @name           SimpleMusicPlayer.uc.js
// @namespace      铭心
// @modified       ywzhaiqi
// @description    简单版百度随心听，改自百度随心听播放栏UC脚本，默认采用手机版界面。
// @include        main
// @version        2014.05.29
// @note           添加可设置手机 UA
// ==/UserScript==

(function(){

	var Config = {
		isUrlBar: 1,
		isMobile: 1,
		url: "http://fm.baidu.com/",
		normal: {
			panelStyle: "width: 700px; height: 520px;",
			iframeStyle: "\
			    html { overflow-y: hidden !important; }\
			    #right-wrapper { display:none; }\
				",
		},
		mobile: {
			panelStyle: 'width: 320px; height: 480px;',
			iframeStyle: '#ad { display:none; }',
		},
		logo: {
			//百度随心听logo
			main: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABX0lEQVQ4jZ2TT0sCQRiH50uYSS0YehGkS9D3EAIDQSJv0i3QDuGho1AggZ4i8OihTmEHr3boPVfg7Ap9gd2dZZkZ9fDrsLm06Wp2eC7vn4cf8zKMMcZs28Z/YIwxJoSA7/uYTCYb4fs+hBBgnudhOp2uJFsbIF3tIV3twSi3w7rneesF2doARrmNRKGJRKGJXGMYFQghVkbdOrpBvt5HrjHEYesNRBT2hBDrBalSB/l6H0QUWf6zwKh0FxYjAtd1obWOJV3tgYiW9lzXXS/YO3tYL1BKRXh8t3Hx/InM+VOY4PeMUmq5wKh0cXD9gf2rl+Du328QK3AcB1LKkFSpg52TO+ye3iNz+YpUqQMiiszMcRwnSPCzSERIFlvYPr5FstiKXZZSBgmEENBaR6LNbx4XXSkFrXVwxtFoBCklZrPZRkgpwTkPfiTnHJxzmKYJ0zRhWRbG4/EClmWFM/PlL1Rejfxv4Dc3AAAAAElFTkSuQmCC"
		},
		mobileUAString: 'Mozilla/5.0 (Android; Mobile; rv:29.0) Gecko/29.0 Firefox/29.0',
	};


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


	window.PlaySoundBar = {
		addBar : function () {
			var overlay = '<overlay id="MusicBar" xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" xmlns:html="http://www.w3.org/1999/xhtml">\
							<toolbarpalette id="' + (Config.isUrlBar ? 'urlbar-icons' : 'addon-bar') + '">\
								<image id="MusicBar-logo" label="百度随心听" tooltiptext="百度随心听" style="list-style-image:url(' + Config.logo.main + ')"/>\
							</toolbarpalette>\
						</overlay>';
			overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
			window.userChrome_js.loadOverlay(overlay, PlaySoundBar);
			var css = '	#MusicBar-logo{\
			                padding: 0px 2px;\
						}';
			function addStyle(css) {
				var pi = document.createProcessingInstruction(
						'xml-stylesheet',
						'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"');
				return document.insertBefore(pi, document.documentElement);
			}
			PlaySoundBar.style = addStyle(css);
		},
		observe : function () {
			this.bar = this.getById('Music-bar');
			this.hbox = this.getById('MusicBar-hbox');
			this.btns.logo = this.getById('MusicBar-logo');
			this.btns.logo.addEventListener('click', this.onclick.bind(this), false);
		},
		getById : function (id) {
			return document.getElementById(id);
		},
		getBaiduFMBrowser : function () {
			return PlaySoundBar.getById("MusicBar-iframe");
		},
		onclick : function (e) {
			var panel = PlaySoundBar.getById("MusicBar-panel");
			if (panel) {
				panel.openPopup(PlaySoundBar.btns.logo, "after_end", -8, 0, false, null, null);
				return;
			} 

			if (!document.getElementById("MusicBar-iframe")) {
				var mainPopupSet = PlaySoundBar.getById("mainPopupSet");

				// 设置 UA
				if (Config.isMobile) {
					UAManager.change(Config.mobileUAString);
				}

				// 添加
				panel = PlaySoundBar.addPanel(mainPopupSet);
				panel.openPopup(PlaySoundBar.btns.logo, "after_start", -8, 0, false, null, null); //第一次点击的弹窗

				// 还原 UA
				if (Config.isMobile) {
					UAManager.revert();
				}

				var iframe = document.getElementById('MusicBar-iframe');
				var doc = iframe.contentWindow.document;
				doc.addEventListener('load', function(event) {
					iframe.removeEventListener('load', arguments.callee, false);

					// 添加样式
					var style = doc.createElement('style');
					style.textContent = PlaySoundBar.panelContentStyle;
					doc.head.appendChild(style);
				}, false);
			}
		},
		addPanel : function (mainPopupSet) {
			var panel = document.createElement("panel");
			panel.id = "MusicBar-panel";
			panel.setAttribute("type", "arrow");
			panel.setAttribute("flip", "both");
			panel.setAttribute("side", "top");
			panel.setAttribute("consumeoutsideclicks", "false");
			panel.setAttribute("noautofocus", "false");
			panel.setAttribute("panelopen", "true");
			mainPopupSet.appendChild(panel);
			var iframe = panel.appendChild(document.createElement("iframe"));
			iframe.id = "MusicBar-iframe";
			iframe.setAttribute("type", "content");
			iframe.setAttribute("flex", "1");
			iframe.setAttribute("transparent", "transparent");
			iframe.setAttribute("showcaret", "true");
			iframe.setAttribute("autocompleteenabled", "true");
			iframe.setAttribute("style", Config.isMobile ? Config.mobile.panelStyle : Config.normal.panelStyle);
			iframe.setAttribute('src', Config.url);

			return panel;
		},
		btns : {}
	}

	PlaySoundBar.addBar();

})()

