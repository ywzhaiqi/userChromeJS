// ==UserScript==
// @name           uc_google_translator
// @description    google_translator扩展的UC脚本版
// @author         Dannylee
// @namespace      lidanny2012@gmail.com
// @include        main
// @license        MIT License
// @compatibility  Firefox 4
// @charset        UTF-8
// @version        2.2 2013/04/09 02:00 REMOVE E4X
// @version        2.1.0.1
// @note           2013/06/02 略加修改 by ywzhaiqi
// @note           支持选择翻译并可替换原文
// @note           支持全页翻译
// @note           取消了部分目标语言，只保留zh-cn,en,zh-tw,jp，fr等
// @note           取消了快捷键，保留页面右键菜单和，按钮放在附加组件栏
// ==/UserScript==

var zol_bod_google_translator = {
    _prefs: null,
    _targetlang: "zh-CN",
    _actionforstatbaricon: 3,
    _showpopuptext: 1,
	_showoritext : false,
    _timer: null,

    onLoad: function() {
        var userbrowserlang = navigator.language;
        if (this.ervenyesNyelvKod(userbrowserlang.substr(0, 2))) {
            if (userbrowserlang.substr(0, 2) != "zh") {
                this._targetlang = userbrowserlang.substr(0, 2);
            } else {
                this._targetlang = "zh-CN";
            }
        } else {
            this._targetlang = "en";
        }

        this._prefs = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService)
            .getBranch("userChromeJS.googletranslatorforff.");
        this._prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);

        if (!this._prefs.prefHasUserValue("targetlang")) {
            this._prefs.setCharPref("targetlang", this._targetlang);
        } else {
            this._targetlang = this._prefs.getCharPref("targetlang");
        }
        if (!this._prefs.prefHasUserValue("actionforstatbaricon")) {
            this._prefs.setIntPref("actionforstatbaricon", this._actionforstatbaricon);
        } else {
            this._actionforstatbaricon = this._prefs.getIntPref("actionforstatbaricon");
        }
        if (!this._prefs.prefHasUserValue("showpopuptext")) {
            this._prefs.setIntPref("showpopuptext", this._showpopuptext);
        } else {
            this._showpopuptext = this._prefs.getIntPref("showpopuptext");
        }
		if (!this._prefs.prefHasUserValue("showoritext")) {
			this._prefs.setBoolPref("showoritext", this._showoritext);
		} else {
			this._showoritext = this._prefs.getBoolPref("showoritext");
		}
        var overlay = '\
          <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                   xmlns:html="http://www.w3.org/1999/xhtml"> \
              <toolbarpalette id="status-bar">\
                 <toolbaritem id="translatorButton">\
                  <toolbarbutton id="statusbar-translator" label="翻译器" \
                                 class="toolbarbutton-1 chromeclass-toolbar-additional" type="menu-button" \
                                 oncommand="zol_bod_google_translator.ToolBarTranslatorCommand(event);" \
                                 style="padding: 0px 2px;"\
                                 tooltiptext="Google translator" >\
                      <menupopup id="statusbar-translator-contextmenu" onpopupshowing="zol_bod_google_translator.showStatbarContextMenu(event);">\
                         <menuitem id="showstatbariconRB3" label="翻译选定的文本,否则翻译整页(推荐)" type="checkbox" value="3" onclick = "zol_bod_google_translator.settransmode(event);"/> \
                         <menuitem id="showstatbariconRB1" label="始终翻译选定文本" type="checkbox" value="1" onclick = "zol_bod_google_translator.settransmode(event);"/> \
                         <menuitem id="showstatbariconRB2" label="始终翻译整个页面" type="checkbox" value="2" onclick = "zol_bod_google_translator.settransmode(event);"/> \
                         <menuseparator/> \
              		       <menuitem label="简体中文" \
              		                 id="trtid1" \
              		                 type="checkbox" \
              		                 value="zh-CN" \
              		                 onclick = "zol_bod_google_translator.settargetlang(event);" /> \
              		       <menuitem label="繁体中文" \
              		                 id="trtid2" \
              		                 type="checkbox" \
              		                 value="zh-TW" \
              		                 onclick = "zol_bod_google_translator.settargetlang(event);" /> \
              		       <menuitem label="English"  \
              		                 id="trtid3" \
              		                 type="checkbox" value="en" onclick = "zol_bod_google_translator.settargetlang(event);" /> \
              		       <menuitem label="日语" \
              		                 id="trtid4" \
              		                 type="checkbox" \
              		                 value="ja" \
              		                 onclick = "zol_bod_google_translator.settargetlang(event);" /> \
              		       <menuseparator/> \
              		       <menuitem id="showsreplaced" \
              		                 label="翻译结果直接替换页面原文" \
              		                 type="checkbox" \
              		                 value="0" \
              		                 onclick = "zol_bod_google_translator.setshowmode(event);"/> \
                         <menuitem id="showspopuptext" \
                                   label="翻译结果点击可自动复制到剪贴板" \
                                   value="1" \
                                   type="checkbox" \
                                   onclick = "zol_bod_google_translator.setshowmode(event);"/> \
						<menuitem id="showoritext" \
									label="弹出翻译结果对照显示" \
									value="' + this._showoritext + '" \
									type="checkbox" autocheck="true"\
									onclick = "zol_bod_google_translator.setoridisplay(event);"/> \
                         <menuseparator/> \
                         <menuitem id="translateselected-statusbar-translator" \
                                   label="翻译选定文本" \
                                   onclick="zol_bod_google_translator.selectionTranslation(event);"/> \
                         <menuitem id="translatepage-statusbar-translator" \
                                   label="翻译整个页面" \
                                   onclick="zol_bod_google_translator.pageTranslation(event);"/> \
                      </menupopup>\
                  </toolbarbutton>\
                 </toolbaritem>\
              </toolbarpalette>\
              <popup id="contentAreaContextMenu">\
                   <menuitem id="context-translator" label="Google 翻译选中的文字" oncommand="zol_bod_google_translator.selectionTranslation(event);"/> \
                   <menuitem id="context-page-translator" label="Google 翻译当前页面" oncommand="zol_bod_google_translator.pageTranslation(event);"/> \
              </popup>\
          </overlay>';
        overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
        window.userChrome_js.loadOverlay(overlay, zol_bod_google_translator);
        var css = '\
          #statusbar-translator {\
	           list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABs0lEQVQ4jY2SP4viQBiHX0UQWz/AXb+VX8Iu/YqFhdhcd5BKEOTKC9jJFYrFgo3FIjYiCRauhTCQDMp4bJFklzCuLJLOWNj8rpDMJt7u7Q08xQzze953/hAR0el4QJLw8KR4fXkE/Wtch01zjP6gmxLsd9uPJafjAf1BF82WjmZLR61eRa1eVfNmS4cMxP8JksGk6FPB6XjAii1Qq1fBBYMMBL79+InvDIrbB0CzIpSmQHF0RnF0vkiTFxZX7A+6MOzwU0FxdEZKYJpj1fp1eO5KzF0JzYreF/iekzr77QMUhh2q1zDsUIULPQl6fXkEFww53cWKLWCaY3DBVMuaFWHuSsT7fM/5W5DTXYUMBGQgUJoCpelFst9tcc84DDuE7znQrAiFnrwIkuGY/W6rBIYdQgYC7RmHZkXwPQf3jL8JiCglISLKVCaqzfhZfc9RcMFwc/eMfGd9EWQbS+R0F9nGEtnGEpnKBJnKJFWxPNygPNygPePggqE942nBdTjG9xyUhxvVcqEnsWILrNjiTfCRJN9ZI99Zp8LxWsy73ztTmYCI6ObuGV/7Tym+/PqtICL6A7F/dNYyWabFAAAAAElFTkSuQmCC");\
          }\
          #statusbar-translator[state="disable"] {\
	           list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABbElEQVQ4jZXSsWrCQBwG8L8iFFcfwGfwQdwVBwdx6VbIJAjSsYFu4qD4AA5FXEQiDuogHMRQOMUhWginIiGbOrh8HUqOO421DXzDHff9krsLERGdjz7UBP6XzGG3Av32XJctq4tWu64B++3iPnI++mi166hUDVSqBoqlAoqlghxXqgaEx/8GqEUVegicjz5mbIxiqQCHMwiP4/n1DS8MMrkJkB2ekOkDqc4Fqc7lB1UPLHxjq12HaQcPgVTnAg2wrK789OvyyBUYuQLZ4Ska2Kzn2t5zE8iYdiBvw7QDWU42BeiwW8HhDAnDxYyNYVldOJwhNwFAFJkbIGG4MsLjEB5Hpn8fCJNsCpBaDrPfLuQi0w4gPI7awEF2eLpBiIg0hIgolu/JBeG1btZzbU4D4uUpEoaLeHmKeHkKFdis5/hgjhzXBk40oJZV4HrPyabAjI114D+Imqf3z+hfPJbvgYjoXjHdWCLdWIKI6BvoHUigVvREFQAAAABJRU5ErkJggg==");\
          }\
         '.replace(/[\r\n\t]/g, '');

        function addStyle(css) {
            var pi = document.createProcessingInstruction(
                'xml-stylesheet',
                'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"');
            return document.insertBefore(pi, document.documentElement);
        }
        zol_bod_google_translator.style = addStyle(css);

        var xmltt = '\
        <tooltip id="translationResult"	style="-moz-appearance: none;display:-moz-popup;font:message-box;background-color:InfoBackground;color:InfoText;border: 1px solid InfoText;width:450px;">\
      			<vbox id="translationResultPopupBox">\
        			<label id="translationResultPopupLabel" flex="1" onclick="zol_bod_google_translator.copyToClipboard(event,this.textContent);" tooltiptext="点击可自动复制到剪切板、右击关闭！"/>\
      			</vbox>\
    		</tooltip>\
    	';
        var rangett = document.createRange();
        rangett.selectNodeContents(document.getElementById('mainPopupSet'));
        rangett.collapse(false);
        rangett.insertNode(rangett.createContextualFragment(xmltt.replace(/\n|\r/g, ''))); //.replace(/\n/g, '')
        rangett.detach();

        document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", this.showContextMenu, false);
        window.addEventListener("unload", this, false);

    },

    uninit: function() {
        if (this._timer)
            clearTimeout(this._timer);
        var i = document.getElementById("statusbar-translator");
        if (i) i.parentNode.removeChild(i);
        var i = document.getElementById("statusbar-translator-contextmenu");
        if (i) i.parentNode.removeChild(i);
        document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", this.showContextMenu, false);
        var i = document.getElementById("context-translator");
        if (i) i.parentNode.removeChild(i);
        var i = document.getElementById("context-page-translator");
        if (i) i.parentNode.removeChild(i);
        var i = document.getElementById("translationResult");
        if (i) i.parentNode.removeChild(i);
        window.removeEventListener("unload", this, false);
    },

    handleEvent: function(event) {
        switch (event.type) {
            case "unload":
                this.uninit();
                break;
        }
    },

    settargetlang: function(event) {
        if (event.button != 0) return;
        this._targetlang = event.target.value;
        this._prefs.setCharPref("targetlang", this._targetlang);
        this.settargetlangshow();
    },

    settargetlangshow: function() {
        document.getElementById("trtid1").setAttribute('checked', ((document.getElementById("trtid1").value != this._targetlang) ? false : true));
        document.getElementById("trtid2").setAttribute('checked', ((document.getElementById("trtid2").value != this._targetlang) ? false : true));
        document.getElementById("trtid3").setAttribute('checked', ((document.getElementById("trtid3").value != this._targetlang) ? false : true));
        document.getElementById("trtid4").setAttribute('checked', ((document.getElementById("trtid4").value != this._targetlang) ? false : true));
    },

    settransmode: function(event) {
        if (event.button != 0) return;
        this._actionforstatbaricon = event.target.value;
        this._prefs.setIntPref("actionforstatbaricon", this._actionforstatbaricon);
        this.settranshow();
    },

    settranshow: function() {
        document.getElementById("showstatbariconRB3").setAttribute('checked', ((document.getElementById("showstatbariconRB3").value != this._actionforstatbaricon) ? false : true));
        document.getElementById("showstatbariconRB1").setAttribute('checked', ((document.getElementById("showstatbariconRB1").value != this._actionforstatbaricon) ? false : true));
        document.getElementById("showstatbariconRB2").setAttribute('checked', ((document.getElementById("showstatbariconRB2").value != this._actionforstatbaricon) ? false : true));
    },

    setshowmode: function(event) {
        if (event.button != 0) return;
        this._showpopuptext = event.target.value;

        this._prefs.setIntPref("showpopuptext", this._showpopuptext);
        this.showmodeshow();
    },

	setoridisplay : function (event) {
		if (event.button != 0) return;
		this._showoritext = !this._showoritext;
		this._prefs.setBoolPref("showoritext", this._showoritext);
	},
    showmodeshow: function(event) {
        document.getElementById("showsreplaced").setAttribute('checked', ((document.getElementById("showsreplaced").value != this._showpopuptext) ? false : true));
        document.getElementById("showspopuptext").setAttribute('checked', ((document.getElementById("showspopuptext").value != this._showpopuptext) ? false : true));
    },

    ervenyesNyelvKod: function(mi) {
        var ervenyesek = ["af", "sq", "ar", "hy", "az", "eu", "be", "bn", "bg", "ca", "zh", "hr", "cs", "da", "nl", "en", "et", "tl", "fi", "fr", "gl", "ka", "de", "el", "gu", "ht", "iw", "hi", "hu", "is", "id", "ga", "it", "ja", "kn", "ko", "la", "lv", "lt", "mk", "ms", "mt", "no", "fa", "pl", "pt", "ro", "ru", "sr", "sk", "sl", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "ur", "vi", "cy", "yi"];
        return (ervenyesek.indexOf(mi) != -1);
    },

    showContextMenu: function() {
        document.getElementById("context-translator").hidden = !(gContextMenu.isTextSelected);
        document.getElementById("context-page-translator").hidden = (gContextMenu.isTextSelected);
    },

    showStatbarContextMenu: function() {
        if (document.getElementById("translateselected-statusbar-translator")) {
            document.getElementById("translateselected-statusbar-translator").disabled = !(this.isValidTextLength(this.getSelectedText()));
        }
        this.settranshow();
        this.settargetlangshow();
        this.showmodeshow();
    },

    getSelectedText: function(e) {
        var focusedWindow = document.commandDispatcher.focusedWindow;
        var selectedText = focusedWindow.getSelection().toString();
        return selectedText;
    },

    isValidTextLength: function(selectedtext) {
        if (selectedtext.length > 0 && selectedtext.length <= 38000) {
            return true;
        } else {
            return false;
        }
    },

    ToolBarTranslatorCommand: function(e) {

        var targetId = e.target.id;
        if (targetId != "statusbar-translator") return;

        var whataction = this.actionforstatbaricon;
        switch (whataction) {
            case 1:
                this.selectionTranslation(e);
                break;
            case 2:
                this.pageTranslation();
                break;
            default:

                var selectedText = this.getSelectedText();
                if (this.isValidTextLength(selectedText)) {
                    this.selectionTranslation(e);
                } else {
                    this.pageTranslation();
                }
        }
    },

    selectionTranslation: function(event) {
        var selectedText = this.getSelectedText();
        this.refreshInformation(selectedText);
    },

    pageTranslation: function(e) {
        var cel = this._targetlang;
        var docurl = content.location.href;
        if (docurl.match(/^about/)) {
            return;
        }
        var fordUrl = "http://translate.google.com/translate?hl=" + cel + "&sl=auto&tl=" + cel + "&u=" + encodeURIComponent(docurl);
        gBrowser.selectedTab = gBrowser.addTab(fordUrl);
    },

    refreshInformation: function(whatToTranslate) {
        if (this.isValidTextLength(whatToTranslate)) {
            if (document.getElementById('statusbar-translator')) {
                var statusBarLabel = document.getElementById('statusbar-translator');
                statusBarLabel.setAttribute("state", "enable");
            }
            var cel = this._targetlang;
            var httpRequest = null;

            var baseUrl = "http://translate.google.hu/translate_t";
			var urlParams = "text=" + encodeURIComponent(whatToTranslate) + "&hl=" + cel + "&langpair=auto|" + cel + "&tbb=1";

            function removeHTMLTags(mitkell) {
				//var strTagStrippedText = mitkell.replace(/<\/?[^>]+(>|$)/g, "");
				if (zol_bod_google_translator._showoritext == false) {
					var strTagStrippedText = mitkell.replace(/<br>/ig, '\n').replace(/(<(.+?)fff\'\">)/ig, "").replace(/<\/[^>]+>/ig, "");
				} else {
					var strTagStrippedText = mitkell.replace(/<br>/ig, '\n\n')
						.replace(/<span title=\"/ig, "")
						.replace(/\"\sonmouseover[^>]+>/ig, '\n')
						.replace(/<\/[^>]+>/ig, "");
				}
                return strTagStrippedText;
            }

            function infoReceived() {
                var output = httpRequest.responseText;
                if (whatToTranslate[0] == " ") {
                    var kezdospace = " ";
                } else {
                    var kezdospace = "";
                }
                if (whatToTranslate[whatToTranslate.length - 1] == " ") {
                    var vegespace = " ";
                } else {
                    var vegespace = "";
                }
                if (output.length) { //kimeneti string felepitese
                    output = output.replace(/&quot;/gi, '"');
                    output = output.replace(/&lt;/gi, '<');
                    output = output.replace(/&gt;/gi, '>');
                    output = output.replace(/&amp;/gi, '&');
                    output = output.replace(/&#39;/gi, "'");
                    var fieldArray = output.split('</head>');
                    if (fieldArray[1].search('class="short_text"') != -1) {
                        var tempResz = fieldArray[1].split('<span id=result_box class="short_text">');
                    } else if (fieldArray[1].search('class="medium_text"') != -1) {
                        var tempResz = fieldArray[1].split('<span id=result_box class="medium_text">');
                    } else {
                        var tempResz = fieldArray[1].split('<span id=result_box class="long_text">');
                    }
                    var kimenet = tempResz[1].split('</span></div>');

                    if (zol_bod_google_translator._showpopuptext != 1) {
                        var focusedWindow = document.commandDispatcher.focusedWindow;
                        var range = focusedWindow.getSelection().getRangeAt(0);
                        range.deleteContents();
			range.insertNode(document.createTextNode(kezdospace + removeHTMLTags(kimenet[0]) + vegespace));
                    } else {
		    	zol_bod_google_translator.show(kezdospace + removeHTMLTags(kimenet[0]) + vegespace);
                    }
                }
            }

            try {
                httpRequest = new XMLHttpRequest();
                httpRequest.open("POST", baseUrl, true);
                httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                httpRequest.setRequestHeader("Content-length", urlParams.length);
                httpRequest.setRequestHeader("Connection", "close");
                httpRequest.onload = infoReceived;
                httpRequest.send(urlParams);
                if (zol_bod_google_translator._showpopuptext === 1)
                    this.show("正在获取翻译结果,请等待...");
            } catch (e) {
                var statbaricon = document.getElementById('statusbar-translator');
                statbaricon.setAttribute("state", "disable");
            }
        } else { //ha a kijelolt szoveg hossza <=0 vagy >38000
            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                .getService(Components.interfaces.nsIPromptService);
            prompts.alert(null, "Google Translator", "选中的文本不能超过38000个字符！");
        }
    },

    show: function(res) {
        var popup = document.getElementById("translationResult");
        this.setValue(res);
        this.sizeChange();
        var node = document.getElementById("content");
        if (!node) {
            node = document.getElementById("messagepane");
        }
        if (this._timer)
            clearTimeout(this._timer);

        if (typeof popup.openPopup != 'undefined')
            popup.openPopup(node, "overlap", 0, 0, true, false);
        else
            popup.showPopup(node, -1, -1, "popup", null, null);
        setTimeout(function() {
            zol_bod_google_translator.sizeChange();
        }, 0);
        this._timer = setTimeout(function() {
            popup.hidePopup();
        }, 30000); //最大30秒で消す
    },

    setValue: function(val) {
        var label = document.getElementById("translationResultPopupLabel");
        while (label.firstChild) {
            label.removeChild(label.firstChild);
        }
        if (val != "") label.appendChild(document.createTextNode(val));
    },

    sizeChange: function() {
        var popup = document.getElementById("translationResult");
        var box = document.getElementById("translationResultPopupBox");
        popup.sizeTo(450, Math.max(box.boxObject.height * 1.0 + 15, 23));
    },

    insertAfter: function(newElement, targetElement) {
        var aparent = targetElement.parentNode;
        if (aparent.lastChild == targetElement) {
            aparent.appendChild(newElement);
        } else {
            aparent.insertBefore(newElement, targetElement.nextSibling);
        }
    },

    copyToClipboard: function(e, aValue) {
        if (e.button == 0) {
            var clipid = Components.interfaces.nsIClipboard;
            var clip = Components.classes['@mozilla.org/widget/clipboard;1'].getService(clipid);
            if (!clip) {
                return;
            }
            var trans = Components.classes['@mozilla.org/widget/transferable;1'].
            createInstance(Components.interfaces.nsITransferable);
            if (!trans) {
                return;
            }
            var str = Components.classes['@mozilla.org/supports-string;1'].
            createInstance(Components.interfaces.nsISupportsString);
            str.data = aValue;
            trans.setTransferData("text/unicode", str, aValue.length * 2);
            clip.setData(trans, null, clipid.kGlobalClipboard);
        } else if (e.button == 2) {
            var popup = document.getElementById("translationResult");
            clearTimeout(this._timer);
            popup.hidePopup();
        }
    }
};

zol_bod_google_translator.onLoad();