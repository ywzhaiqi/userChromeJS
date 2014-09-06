// ==UserScript==
// @name           WordHighlightToolbar.uc.js
// @description    word highlight toolbar.
// @namespace      http://d.hatena.ne.jp/Griever/
// @author         Griever
// @license        MIT License
// @compatibility  Firefox 17
// @charset        UTF-8
// @include        main
// @version        0.0.9
// @homePageURL    https://github.com/ywzhaiqi/userChromeJS/tree/master/WordHighlightToolbarFix
// homePageURL     https://github.com/Griever/userChromeJS/tree/master/WordHighlightToolbar
// @downloadURL    https://raw.githubusercontent.com/ywzhaiqi/userChromeJS/master/WordHighlightToolbarFix/WordHighlightToolbar.uc.js
// @startup        window.gWHT.init();
// @shutdown       window.gWHT.destroy();
// @note           增加延迟及 super_preloader 加载下一页高亮的支持 By ywzhaiqi
// @note           0.0.9 細部を修正
// @note           0.0.8 Firefox 25 でエラーが出ていたのを修正
// @note           0.0.7 ツールバーが自動で消えないことがあったのを修正
// @note           0.0.6 アイコンを作って検索時の強調を ON/OFF できるようにした
// @note           0.0.6 背面のタブを複数開いた際の引き継ぎを修正
// @note           0.0.5 大幅に変更（変更し過ぎてどこを変更したのかすら忘れた）
// @note           0.0.5 外部からイベントでハイライトできるようにした
// @note           0.0.5 "戻る"動作にツールバーが連動するようにした
// @note           0.0.5 色を選んで強調できるようにしてみた
// @note           0.0.5 ツールバーが無駄にスペースをとる場合があるのを修正
// @note           0.0.5
// ==/UserScript==

(function(CSS){
"use strict";

var USE_FIX_AUTOPAGER = true;  // 增加通用检测下一页后重新高亮，用 uAutoPagerize 不需要
var disableBooklink = true;  // 来自 booklink.me 的百度搜索不要高亮。

if (window.gWHT) {
    window.gWHT.destroy();
    delete window.gWHT;
}


const UID = Math.random().toString(36).slice(-8);
const PREFIX = 'wordhighlight-toolbar-';
const CLASS_ICON  = PREFIX + 'icon';
const CLASS_ITEM  = PREFIX + 'item';
const CLASS_SPAN  = PREFIX + 'span';
const CLASS_INDEX = PREFIX + 'index';
const EVENT_RESPONSE = 'RESPONSE_' + UID;

var GET_KEYWORD = true;
var wmap = new WeakMap();

window.gWHT = {
    DEBUG: false,
    SITEINFO: [
        /**
            url     URL。正規表現。keyword, input が無い場合は $1 がキーワードになる。
            keyword キーワード。スペース区切り。省略可。
            input   検索ボックスの CSS Selector。
        **/
    	// {
    	// 	url: '.*\\btbm=isch\\b.*',
    	// 	keyword: ' '
    	// },
        {
            url: '^https?://\\w+\\.google\\.[a-z.]+/search',
            input: 'input[name="q"]'
        },
        //百度
        {
            url: '^https?://\\w+\\.baidu\\.com/(?:s|baidu)\\?',
            input: 'input#kw'
        },
        {
            url: '^https?://\\w+\\.bing\\.com/search',
            input: 'input[name="q"]'
        },
        // 360 搜索
        {
            url: '^https?://\\w+\\.so\\.com/s\\?',
            input: 'input[name="q"]'
        },
        //DuckDuckGo
        {
            url: '^https?://duckduckgo\\.com/',
            input: 'input[name="q"]'
        },
        {
            url: '^https?://developer\\.mozilla\\.org/.*/search',
            input: 'input[name="q"][value]'
        },
        //{
        //    url: '^http?://[\\w.]+\\.yahoo\\.co\\.jp/search',
        //    input: 'input[name="p"]'
        //},
        //{
        //    url: '^http://[\\w.]+\\.nicovideo\\.jp/(?:search|tag)/.*',
        //    input: '#search_united, #bar_search'
        //},
        // {// MICROFORMAT
        //  url: '^https?://.*[?&](?:q|word|keyword|search|query|search_query)=([^&]+)',
        //  input: 'input[type="text"]:-moz-any([name="q"],[name="word"],[name="keyword"],[name="search"],[name="query"],[name="search_query"]), input[type="search"]'
        // },
    ],

    FIND_FOUND   : 0,
    FIND_NOTFOUND: 1,
    FIND_WRAPPED : 2,
    sound: Cc["@mozilla.org/sound;1"].createInstance(Ci.nsISound),
    getWins: getWins,
    checkDoc: checkDoc,
    getFocusedWindow: getFocusedWindow,
    getRangeAll: getRangeAll,
    wmap:wmap,
    tabhistory: {},
    get prefs() {
        delete this.prefs;
        return this.prefs = Services.prefs.getBranch("WordHighlightToolbar.");
    },
    get GET_KEYWORD() GET_KEYWORD,
    set GET_KEYWORD(bool) {
        bool = !!bool;
        var icon = $(PREFIX + "icon");
        if (icon) {
            icon.setAttribute("state", bool ? "enable" : "disable");
            icon.setAttribute("tooltiptext", bool ? "enable" : "disable");
        }

        var menuitem = $(PREFIX + "menuitem");
        if(menuitem){
            menuitem.setAttribute("checked", bool);
            menuitem.setAttribute("label", "搜索高亮工具条已" + (bool ? "启用" :"禁用"));
        }

        return GET_KEYWORD = bool;
    },

    init: function() {
        this.xulstyle = addStyle(CSS);

        // urlbar-icons  addon-bar
        // var icon = $("status-bar").appendChild(document.createElement("image"));
        // icon.setAttribute("id", PREFIX + "icon");
        // icon.setAttribute("class", PREFIX + "icon");
        // // icon.setAttribute("onclick", "gWHT.GET_KEYWORD = !gWHT.GET_KEYWORD");
  //       icon.setAttribute("onclick", "gWHT.iconClick(event);");
        // icon.setAttribute("context", "");
        // icon.setAttribute("style", "padding: 0px 2px;");

        var menuitem = document.createElement("menuitem");
        menuitem.setAttribute("id", PREFIX + "menuitem");
        //menuitem.setAttribute("label", "高亮工具条开/关");
		menuitem.setAttribute("tooltiptext", "高亮工具条功能开/关");
        menuitem.setAttribute("type", "checkbox");
        menuitem.setAttribute("checked", "true");
        menuitem.setAttribute("autoCheck", "false");
        menuitem.setAttribute("oncommand", "gWHT.GET_KEYWORD = !gWHT.GET_KEYWORD");
        var ins = document.getElementById("devToolsSeparator");
        ins.parentNode.insertBefore(menuitem, ins);

        var bb = document.getElementById("appcontent");
        var container = bb.appendChild(document.createElement("hbox"));
        container.setAttribute("id", PREFIX + "box");
        container.setAttribute("style", "max-height: 24px;");
        //container.setAttribute("ordinal", "0");
        this.container = container;

        var sep = document.getElementById("context-viewpartialsource-selection");
        var menu = sep.parentNode.insertBefore(document.createElement("menu"), sep);
        menu.setAttribute("label", "高亮关键词");//ハイライト
        menu.setAttribute("id", PREFIX + "highlight");
        menu.setAttribute("class", CLASS_ICON + " menu-iconic");
        menu.setAttribute("accesskey", "H");
        menu.setAttribute("onclick", "\
            if (event.target != this) return;\
            closeMenus(this);\
            if (event.button === 0) gWHT.highlightWord();\
            else if (event.button === 1) gWHT.highlightWordAuto();\
        ");
        var menupopup = menu.appendChild(document.createElement("menupopup"));

        var menuitem = menupopup.appendChild(document.createElement("menuitem"));
        menuitem.setAttribute("class", CLASS_ICON + " menuitem-iconic");
        menuitem.setAttribute("label", "高亮"); //ハイライト
        menuitem.setAttribute("accesskey", "H");
        menuitem.setAttribute("oncommand", "gWHT.highlightWord();");
        var menuitem = menupopup.appendChild(document.createElement("menuitem"));
        menuitem.setAttribute("class", CLASS_ICON + " menuitem-iconic");
        menuitem.setAttribute("label", "分色高亮不同关键词");//単語を探してハイライト
        menuitem.setAttribute("oncommand", "gWHT.highlightWordAuto();");

        var cp = menupopup.appendChild(document.createElement("colorpicker"));
        cp.setAttribute("onclick", "\
            closeMenus(this);\
            var word = getBrowserSelection();\
            setTimeout(function(){\
                gWHT.addWord({ word: word, bgcolor: this.color, bold: true });\
            }.bind(this), 10);\
        ");

        try {
            this.GET_KEYWORD = this.prefs.getBoolPref("GET_KEYWORD");
        } catch (e) {
            this.GET_KEYWORD = GET_KEYWORD;
        }

        gBrowser.mPanelContainer.addEventListener("DOMContentLoaded", this, false);
        // gBrowser.mPanelContainer.addEventListener("click", this, false);
        // gBrowser.mPanelContainer.addEventListener("dragend", this, false);
        gBrowser.mPanelContainer.addEventListener("pageshow", this, false);
        gBrowser.mPanelContainer.addEventListener(EVENT_RESPONSE, this, true);
        gBrowser.mPanelContainer.addEventListener("WordHighlightToolbarAddWord", this, false, true);
        gBrowser.mPanelContainer.addEventListener("WordHighlightToolbarRemoveWord", this, false, true);
        gBrowser.mTabContainer.addEventListener("TabOpen", this, false);
        gBrowser.mTabContainer.addEventListener("TabSelect", this, false);
        gBrowser.mTabContainer.addEventListener("TabClose", this, false);
        document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", this, false);
        window.addEventListener("unload", this, false);
    },
    uninit: function() {
        gBrowser.mPanelContainer.removeEventListener("DOMContentLoaded", this, false);
        // gBrowser.mPanelContainer.removeEventListener("click", this, false);
        // gBrowser.mPanelContainer.removeEventListener("dragend", this, false);
        gBrowser.mPanelContainer.removeEventListener("pageshow", this, false);
        gBrowser.mPanelContainer.removeEventListener(EVENT_RESPONSE, this, true);
        gBrowser.mPanelContainer.removeEventListener("WordHighlightToolbarAddWord", this, false);
        gBrowser.mPanelContainer.removeEventListener("WordHighlightToolbarRemoveWord", this, false);
        gBrowser.mTabContainer.removeEventListener("TabOpen", this, false);
        gBrowser.mTabContainer.removeEventListener("TabSelect", this, false);
        gBrowser.mTabContainer.removeEventListener("TabClose", this, false);
        document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", this, false);
        window.removeEventListener("unload", this, false);
        this.prefs.setBoolPref("GET_KEYWORD", this.GET_KEYWORD);
    },
    destroy: function() {
        [PREFIX + "icon", PREFIX + "menuitem", PREFIX + "box", PREFIX + "highlight"].forEach(function(id){
            var elem = $(id);
            if (elem) elem.parentNode.removeChild(elem);
        }, this);
        this.uninit();
        if (this.xulstyle) this.xulstyle.parentNode.removeChild(this.xulstyle);
    },

    handleEvent: function(event) {
        switch(event.type) {
            case "click":
                this.lastClickedTime = new Date().getTime();
                break;
            case "dragend":
                var dt = event.dataTransfer;
                if (dt) {
                    if (dt.types.contains("text/x-moz-place")) return;
                    if (!dt.types.contains("text/x-moz-url")) return;
                }
                this.lastClickedTime = new Date().getTime();
                break;
            case "DOMContentLoaded":
                if (!this.GET_KEYWORD) return;
                var doc = event.target;
                var win = doc.defaultView;
				if (!win) return;
                // frame 内では動作しない
                if (win != win.parent) return;
                // HTMLDocument じゃない場合
                if (!checkDoc(doc)) return;

                this.delayLaunch(doc, win);
                break;
            case "pageshow":
                var doc = event.target;
                var win = doc.defaultView;
                if (win != win.parent) return;
                this.updateToolbar( wmap.get(doc) );
                break;
            case EVENT_RESPONSE:
                event.stopPropagation();
                this.onResponse(event);
                break;
            case "WordHighlightToolbarAddWord":
                var { target, type, detail } = event;
                debug(type, detail);
                if (!detail) return;
                var doc = target.ownerDocument || target;
                var range;
                if (doc != target) {
                    range = doc.createRange();
                    range.selectNode(target);
                }
                this.addWord(detail, false, range);
                break;
            case "WordHighlightToolbarRemoveWord":
                var { target, type, detail } = event;
                debug(type, detail);
                var doc = target.ownerDocument || target;
                if (!doc.wht) return;
                var words = Array.isArray(detail) ? detail : [detail];
                words.forEach(function(word) doc.wht.removeWord(word));
                break;
            case "TabSelect":
                var doc = event.target.linkedBrowser.contentDocument;
                var toolbar = wmap.get(doc);
                this.updateToolbar(toolbar);
                break;
            case "TabOpen":
                var tab = event.target;
                tab.whtOwner = gBrowser.mCurrentTab;
                tab.whtTime = new Date().getTime();
                break;
            case "TabClose":
                delete this.tabhistory[event.target.linkedPanel];
                break;
            case "popupshowing":
                if (event.target != event.currentTarget) return;
                var {isTextSelected, onTextInput, target} = gContextMenu;
                gContextMenu.showItem(PREFIX + "highlight", isTextSelected && !onTextInput);
                break;
            case "unload":
                this.uninit();
                break;
        }
    },

    delayLaunch: function(doc, win){
        if(disableBooklink && doc.URL.indexOf("baidu.com") > -1 && doc.referrer.indexOf("booklink.me") > -1){
            return;
        }

        var self = this;
        var keywords = this.GET_KEYWORD ? this.getKeyword(this.SITEINFO, doc) : [];

        var SyntaxHighlighter = win.wrappedJSObject.SyntaxHighlighter;
        if(typeof SyntaxHighlighter != "undefined"){
            win.addEventListener("load", function launch(){
                win.removeEventListener("load", launch, false);
                win.setTimeout(function(){
                    self.launch(doc, keywords);
                }, 500);
            }, false);
        }else{
			win.setTimeout(function(){
            	self.launch(doc, keywords);
			}, 500);
        }
    },
    iconClick: function(event){
        if (event.target != $(CLASS_ICON)) return;
        if (event.button == 2) {
            event.preventDefault();

            var win = getFocusedWindow();
            var doc = win.document;
            if(this.GET_KEYWORD){
                this.GET_KEYWORD = false;
                this.destroyToolbar();
            }else{
                this.GET_KEYWORD = true;
                var keywords = this.getKeyword(null, doc);
                this.launch(doc, keywords);
            }
        }else if (event.button == 0) {
            if(this.GET_KEYWORD){
                this.addWord();
            }
        }
    },
    onResponse: function(event) {
        var { target, detail: { name, args } } = event;
        debug(name, args, target);
        var doc = target.ownerDocument || target;
        var win = doc.defaultView;
        var topWin = win.top;

        if ('initialized' === name) {
            doc.addEventListener("dragend", this, false);
            doc.addEventListener("click", this, false);
            var tab = gBrowser._getTabForContentWindow(topWin);
            var linkedPanel = tab.linkedPanel;
            var { index, count } = tab.linkedBrowser.docShell.sessionHistory;
            this.tabhistory[linkedPanel][index] = doc.wht.items;
            return;
        }

        var toolbar = wmap.get(topWin.document);
        if (!toolbar) {
            toolbar = this.addToolbar();
            wmap.set(doc, toolbar);
            wmap.set(topWin.document, toolbar);
        }
        if ('highlight' === name || 'highlightAll' === name) {
            var itemArr = args.length > 0 ? args : Object.keys(doc.wht.items).map(function(key) doc.wht.items[key]);
            itemArr.forEach(function(item) {
                var button = toolbar.querySelector('.' + CLASS_ITEM + '[index="'+ item.index +'"]');
                button = this.addButton(toolbar, item, button);
            }, this);
            this.updateToolbar(toolbar);
            return;
        }
        if ('lowlight' === name) {
            var item = args[0];
            var button = toolbar.querySelector('.' + CLASS_ITEM + '[index="'+ item.index +'"]');
            if (button) {
                button.parentNode.removeChild(button);
            }
            return;
        }
        if ('lowlightAll' === name) {
            var range = document.createRange();
            range.selectNodeContents(toolbar.getElementsByTagName('arrowscrollbox')[0]);
            range.deleteContents();
            //delete this.tabhistory[linkedPanel][index];
            return;
        }
    },
    _launch: function(doc, tab) {
        if (!tab) {
            tab = gBrowser._getTabForContentWindow(doc.defaultView.top);
        }
        var linkedPanel = tab.linkedPanel;
        var { count, index } = tab.linkedBrowser.docShell.sessionHistory;
        var tabhis = this.tabhistory[linkedPanel] || (this.tabhistory[linkedPanel] = []);
        if (!doc.wht) {
            doc.wht = new this.ContentClass(doc);
            tabhis[index] = doc.wht.items;
            if (tabhis.length > count) {
                tabhis.splice(count);
            }
        }
    },
    launch: function(doc, keywords) {
        var win = doc.defaultView;
        var tab = gBrowser._getTabForContentWindow(win.top);
        var linkedPanel = tab.linkedPanel;

        // loadType 1=Bookmark, 2=Reload, 4=History, 4>other
        var { loadType, sessionHistory: { count, index } } = tab.linkedBrowser.docShell;
        var tabhis = this.tabhistory[linkedPanel] || (this.tabhistory[linkedPanel] = []);

        var newtabflag = (tab.whtTime || Infinity) - this.lastClickedTime < 250; // newtab from user.
        tab.whtTime = Infinity;
        keywords || (keywords = []);

        let hikitugi = [];
        let hiki_for_items = function(items, boldOnly) {
            Object.keys(items).map(function(key) {
                var item = items[key];
                if (boldOnly && !item.bold) return;
                hikitugi.push({
                    word: item.word,
                    //index: item.index,
                    bgcolor: item.bgcolor,
                    fgcolor: item.fgcolor,
                    bold: item.bold,
                });
            })
        }
        if (newtabflag) { // newtab from user.
            if (tab.whtOwner) {
                let ownhis = this.tabhistory[tab.whtOwner.linkedPanel];
                if (ownhis) {
                    let items = ownhis[tab.whtOwner.linkedBrowser.docShell.sessionHistory.index];
                    if (items) {
                        hiki_for_items(items, keywords.length > 0);
                    }
                }
            }
            tab.whtOwner = null;
        } else if (loadType === 2) { // reload
            var items = tabhis[index];
            if (items) {
                hiki_for_items(items, keywords.length > 0);
            }
        } else if (loadType > 1) { // currenttab for user
            var items = tabhis[index-1] || tabhis[index];
            if (items) {
                hiki_for_items(items, keywords.length > 0);
            }
        }

        // debug([doc.URL + '\n'
        // ,'loadType:' + loadType,'newtabflag:' + newtabflag
        // ,'keywords:[' + keywords + ']'
        // ,'hikitugi:[' + hikitugi.map(function(o) o.word) + ']'
        // ].join(', '));

        if (keywords.length || hikitugi.length) {
            this._launch(doc, tab);
            doc.wht.addWord(keywords.concat(hikitugi));

            if(USE_FIX_AUTOPAGER){
                var win = doc.defaultView;
                win.setTimeout(function(self){
                    self.fixAutoPager(doc, win);
                }, 1000, this);
            }
        }
    },
    launchFrame: function(doc) {
    },
    fixAutoPager: function(doc, win){
        var _bodyHeight = doc.body.clientHeight;
        // 创建观察者对象
        var observer = new win.MutationObserver(function(mutations){
			var nodeAdded = mutations.some(function(x){ return x.addedNodes.length > 0; });
            if(nodeAdded && doc.body.clientHeight > _bodyHeight){
                // debug("MutationObserver addedNodes");
                _bodyHeight = doc.body.clientHeight;

                setTimeout(function(){
                    gWHT.recoveryToolbar();
                }, 200);
            }
        });
        observer.observe(doc.body, {childList: true, subtree: true});
    },
    updateToolbar: function(toolbar) {
        if (this.updateTimer) clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function() {
            var toolbar = toolbar || wmap.get(content.document);
            if (toolbar && toolbar.parentNode) {
                return;
            }
            var range = document.createRange();
            range.selectNodeContents(this.container);
            if (toolbar) {
                range.collapse(true);
                range.insertNode(toolbar);
                range.selectNodeContents(this.container);
                range.setStartAfter(toolbar);
            }
            range.deleteContents();
        }.bind(this), 150);
    },
    updateToolbar_: function(toolbar) {
        if (toolbar && toolbar.parentNode) {
            return;
        }
        var range = document.createRange();
        range.selectNodeContents(this.container);
        range.deleteContents();
        if (toolbar)
            range.insertNode(toolbar);
    },
    addToolbar: function() {
        var toolbar = document.createElement("hbox");
        toolbar.setAttribute("class", PREFIX + "toolbar");
        toolbar.setAttribute("flex", "1");

        var box = toolbar.appendChild(document.createElement("arrowscrollbox"));
        box.setAttribute("class", PREFIX + "arrowscrollbox");
        box.setAttribute("flex", "1");
        box.setAttribute("orient", "horizontal");
        box.setAttribute("ordinal", "5");

        var closebutton = toolbar.appendChild(document.createElement("toolbarbutton"));
        closebutton.setAttribute("class", PREFIX + "tab-close-button tabs-closebutton close-icon");
        closebutton.setAttribute("oncommand", "gWHT.destroyToolbar();");
        closebutton.setAttribute("tooltiptext", "关闭高亮工具条");
        closebutton.setAttribute("ordinal", "1");

        var reloadbutton = toolbar.appendChild(document.createElement("toolbarbutton"));
        reloadbutton.setAttribute("class", PREFIX + "reloadbutton");
        reloadbutton.setAttribute("tooltiptext", "刷新");//ワードをハイライトし直す
        reloadbutton.setAttribute("ordinal", "10");
        reloadbutton.setAttribute("oncommand", "gWHT.recoveryToolbar();");

        var addbutton = toolbar.appendChild(document.createElement("toolbarbutton"));
        addbutton.setAttribute("class", PREFIX + "addbutton");
        addbutton.setAttribute("tooltiptext", "添加关键词");//ワードを追加
        addbutton.setAttribute("ordinal", "10");
        addbutton.setAttribute("oncommand", "gWHT.addWord();");
        return toolbar;
    },
    destroyToolbar: function() {
        var win = getFocusedWindow();
        var doc = win.document;
        if (doc.wht) {
            doc.wht.lowlightAll();
        }
        this.updateToolbar();
    },
    recoveryToolbar: function() {
        var win = getFocusedWindow();
        var doc = win.document;
        if (doc.wht) {
            doc.wht.highlightAll();
            // マッチしなかったワードを削除
            Object.keys(doc.wht.items).forEach(function(key){
                var item = doc.wht.items[key];
                if (item.length === 0)
                    doc.wht.removeWord(item.word);
            }, this);
        }
    },
    addButton: function(toolbar, aItem, aButton) {
        var button = aButton;
        if (!button) {
            button = document.createElement('toolbarbutton');
            button.style.setProperty('-moz-appearance', 'none', 'important');
            button.setAttribute('oncommand', 'gWHT.find(this.getAttribute("word"), event.shiftKey);');
            button.setAttribute('onDOMMouseScroll', 'event.stopPropagation(); gWHT.find(this.getAttribute("word"), event.detail < 0);');
            button.setAttribute('onclick', 'if (event.button != 1) return; this.hidden = true; gWHT.removeWord(this.getAttribute("word"));');
            button.setAttribute('class', CLASS_ITEM);
            button.setAttribute('tooltiptext', [
                '单击/滚轮向下 - 转到下一个高亮处',//クリック or ホイールダウンで次を検索
                'Shift+单击/滚轮向上 - 转到上一个',//Shift+クリック or ホイールアップで前を検索
                '中键单击 - 取消高亮效果'].join('\n'));//ホイールクリックで削除
            toolbar.getElementsByTagName('arrowscrollbox')[0].appendChild(button);
        }
        button.style.setProperty('color', aItem.fgcolor, 'important');
        button.style.setProperty('background-color', aItem.bgcolor, 'important');
        button.setAttribute('word', aItem.word);
        button.setAttribute('index', aItem.index);
        button.setAttribute('bgcolor', aItem.bgcolor);
        button.setAttribute('fgcolor', aItem.fgcolor);
        button.setAttribute('length', aItem.length);
        button.setAttribute('label', aItem.word + '(' + aItem.length + ')');
        button.setAttribute('hidden', 'false');
        if (aItem.bold) {
            button.setAttribute('bold', aItem.bold);
            button.style.setProperty('font-weight', 'bold', 'important');
        } else {
            button.style.removeProperty('font-weight');
        }
        return button;
    },
    highlightWord: function() {
        var keywords = getRangeAll().map(function(r) r.toString());
        if (keywords.length)
            this.addWord(keywords, true);
    },
    highlightWordAuto: function() {
        var keywords = getRangeAll().join(' ').match(this.tangoReg) || [];
        if (keywords.length)
            this.addWord(keywords, true);
    },
    addWord: function(aWord, aBold, aRange) {
        if (!aWord) {
            aWord = prompt('^o^ 请输入关键词：', getBrowserSelection());
            aBold = true;
        }
        if (!aWord) return;

        var keywords = Array.isArray(aWord) ? aWord : [aWord];
        var doc, win;
        if (aRange) {
            doc = aRange.startContainer.ownerDocument;
            win = doc.defaultView;
        } else {
            win = getFocusedWindow();
            doc = win.document;
        }
        if (!doc.wht) {
            win.getSelection().removeAllRanges();
            this._launch(doc);
        }
        keywords = keywords.map(function(str){
            return typeof str === "string" ? str.trim() : str;
        });
        doc.wht.addWord(keywords, aBold, aRange);
    },
    removeWord: function(aWord) {
        if (!aWord) return;
        var doc = getFocusedWindow().document;
        if (!doc.wht) return;
        doc.wht.removeWord(aWord);
    },
    getLength: function(aWord, aWin) {
        var w = aWord.toLowerCase();
        var len = 0;
        getWins(aWin).forEach(function(win) {
            var doc = win.document;
            if (!doc.wht) return;
            var item = doc.wht.items[w];
            if (item)
                len += item.length;
        }, this);
        return len;
    },
    get tangoReg() {
        if (this._tangoReg) return this._tangoReg;
        var arr = [
            "[\\u4E00-\\u9FA0]{2,}" // 漢字
            ,"[\\u4E00-\\u9FA0][\\u3040-\\u309F]+" // 漢字１文字＋ひらがな
            ,"[\\u30A0-\\u30FA\\u30FC]{2,}" // カタカナ
            ,"[\\uFF41-\\uFF5A\\uFF21-\\uFF3A\\uFF10-\\uFF19]{2,}" // 全角英数数字（小文字、大文字、数字）
            ,"[\\w%$\\@#+]{5,}"
            ,"\\d[\\d.,]+"
            ,"\\w[\\w.]+"
        ];
        return this._tangoReg = new RegExp(arr.join('|'), 'g');
    },
    get kukuriReg() {
        if (this._kukuriReg) return this._kukuriReg;
        var obj = {
            '"': '"',
            "'": "'",
            '\uFF3B': '\uFF3D',//［］
            '\u3010': '\u3011',//【】
            '\u300E': '\u300F',//『』
            '\uFF08': '\uFF09',//（）
            '\u201D': '\u201D',// ””
            '\u2019': '\u2019',// ’’
        };
        var arr = Object.keys(obj).map(function(key) '\\' + key + '[^\\n\\'+ obj[key] +']{2,}\\' + obj[key]);
        return this._kukuriReg = new RegExp(arr.join('|'), 'g');
    },
    getKeyword: function (list, aDoc) {
        if (!list) list = this.SITEINFO;
        var locationHref = aDoc.location.href;

        for (let [index, info] in Iterator(list)) {
            try {
                var exp = info.url_regexp || (info.url_regexp = new RegExp(info.url));
                if ( !exp.test(locationHref) ) continue;
                if (info.keyword)
                    return Array.isArray(info.keyword) ? info.keyword : info.keyword.split(/\s+/);
                if (info.input) {
                    var input = aDoc.querySelector(info.input);
                    if (input && input.value && /\S/.test(input.value))
                        return this.clean(input.value);
                } else if (RegExp.$1) {
                    try {
                        return this.clean(decodeURIComponent(RegExp.$1));
                    } catch (e) {}
                    return this.clean(RegExp.$1);
                }
            } catch(e) {
                log('error at ' + e);
            }
        }
        return [];
    },
    clean: function clean(str) {
        var res = [];
        var kukuri = str.match(this.kukuriReg);
        if (kukuri) {
            [].push.apply(res, kukuri.map(function(w) w.slice(1,-1)));
            str = str.replace(this.kukuriReg, ' ');
        }

        str = str.replace(/\b(?:(?:all)?(?:inurl|inanchor)|link|cache|related|info|site|filetype|daterange|movie|weather|blogurl):\S*/g, "");
        str = str.replace(/\b(?:AND|OR)\b|\s\-\S+/g, " ")
        str = str.replace(/(?:all)?(?:intitle|intext):/g, " ");
        //str = (' ' + str + ' ').replace(/\s\-\S+|(?:(?:all)?(?:inurl|intitle|intext|inanchor)|link|cache|related|info|site|filetype|daterange|movie|weather|blogurl)\:\S*|\s(?:AND|OR)\s/g, ' ');
        // \x20-\x29  !"#$%&'()*+,-./    \x3A-\x40 :;<=>?@    \x5B-\x60 [\]^_`    x7B-\x7E {|}~
        var tango = str.match(/[^\x20-\x29\x3B-\x3F\x5B-\x5E\x60\x7B-\x7E\s]{2,}/g);
        if (tango) {
            [].push.apply(res, tango/*.sort(function(a,b) b.length - a.length)*/);
        }
        return res.filter(function(e,i,a) e && a.indexOf(e) === i);
    },
    find: function(aWord, isBack) {
        var res;
		var fastFind = gBrowser.mCurrentBrowser.fastFind;
        if (fastFind.searchString != aWord) {
            res = fastFind.find(aWord, false);
            if (isBack) {
                res = fastFind.findAgain(isBack, false);
            }
        } else {
            res = fastFind.findAgain(isBack, false);
        }
        if (res === this.FIND_NOTFOUND)
            return this.sound.beep();
        if (res === this.FIND_WRAPPED)
            this.sound.beep();
        var win = fastFind.currentWindow;
        if (!win) return;
        var sel = win.getSelection();
        var node = sel.getRangeAt(0).startContainer;
        var span = node.parentNode;
        if (!span.classList.contains(CLASS_SPAN)) return;
		isBack ? sel.collapseToStart() : sel.collapseToEnd();
//		sel.collapse(node, 1);
        span.style.setProperty('outline', '4px solid #36F', 'important');
        win.setTimeout(function () {
            span.style.removeProperty('outline');
        }, 400);
    },
};


window.gWHT.ContentClass = function(){ this.init.apply(this, arguments) };
window.gWHT.ContentClass.prototype = {
    finder: Cc["@mozilla.org/embedcomp/rangefind;1"].createInstance().QueryInterface(Ci.nsIFind),
    styles: [
         ['hsl( 60, 100%, 80%)','#000'] // bgcolor, textcolor
        ,['hsl(120, 100%, 80%)','#000']
        ,['hsl(180, 100%, 80%)','#000']
        ,['hsl(240, 100%, 80%)','#000']
        ,['hsl(300, 100%, 80%)','#000']
        ,['hsl(360, 100%, 80%)','#000']
        ,['hsl( 30, 100%, 80%)','#000']
        ,['hsl( 90, 100%, 80%)','#000']
        ,['hsl(150, 100%, 80%)','#000']
        ,['hsl(210, 100%, 80%)','#000']
        ,['hsl(270, 100%, 80%)','#000']
        ,['hsl(330, 100%, 80%)','#000']
    ],
    css: [
        'font: inherit !important;'
        ,'margin: 0px !important;'
        ,'padding: 0px !important;'
        ,'border: none !important;'
        ,'text-shadow: none !important;'
    ].join(' '),
    throughSelector: ['textarea', 'input', '.' + CLASS_SPAN].map(function(w) w+', '+w+' *').join(','),

    init: function(doc, keywords) {
        this.doc = doc;
        this.win = doc.defaultView;
        this.body = doc.body,
        this.items = {};
        this.finder.findBackwards = false; /* 後ろから前に向かって検索するか */
        this.finder.caseSensitive = false; /* 大文字小文字を区別するか */
        this.isEmpty = true; // TreeWalker で無駄に探さない為のフラグ

        if (keywords) {
            this.initItems(keywords);
        }
        this.doc.addEventListener("keypress", this, false);
        this.doc.addEventListener("GM_AutoPagerizeNextPageLoaded", this, false);
		this.win.setTimeout(function() {
        this.fireEvent('initialized', this.doc);
		}.bind(this), 100);
    },
    handleEvent: function(event) {
        switch (event.type) {
            case "keypress":
                if (event.target instanceof HTMLTextAreaElement ||
                    event.target instanceof HTMLSelectElement ||
                    event.target instanceof HTMLInputElement && (event.target.mozIsTextField(false)))
                    return;
                var {charCode, ctrlKey, shiftKey, altKey} = event;
                if ((charCode === 78 || charCode === 110) && !ctrlKey && !altKey) {
                    this.find(shiftKey);
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case "GM_AutoPagerizeNextPageLoaded":
                // AutoPagerizeの最後の区切り以降のRangeを取得
                var sep = this.doc.querySelectorAll('.autopagerize_page_separator, .autopagerize_page_info');
                sep = sep[sep.length-1];
                if (!sep) return;
                var range = this.doc.createRange();
                if (sep.parentNode.localName == 'td') {
                    range.setStartAfter(sep.parentNode.parentNode);
                    range.setEndAfter(sep.parentNode.parentNode.parentNode);
                } else {
                    range.setStartAfter(sep);
                    range.setEndAfter(sep.parentNode.lastChild);
                }
                this.highlightAll(range);
                break;
        }
    },
    initItem: function(aWord, aBold, aBG, aFG, aIndex) {
        if (!aWord) return null;
        if (typeof aWord === 'object') {
            aBold = aWord.bold;
            aBG = aWord.bgcolor;
            aFG = aWord.fgcolor;
            aIndex = aWord.index;
            aWord = aWord.word;
            if (!aWord) return null;
        }
        var w = aWord.toLowerCase();
        if (this.items[w]) return null;

        var index = typeof aIndex == 'number' && aIndex != NaN ? aIndex : this.newIndexOf();
        var [bg, fg] = this.styles[index % this.styles.length];
        if (aBG) {
            bg = aBG;
            fg = aFG || rgb2bw(aBG);
        }
        var obj = this.items[w] = {
            word: aWord,
            index: index,
            bgcolor: bg,
            fgcolor: fg,
            bold: !!aBold,
            length: 0,
        };
        Object.defineProperty(obj, 'toString', {
            enumerable: false,
            value: function() {
                return '[' + this.index + ':' + this.length + ':' + this.word + ']';
            }
        });
        return obj;
    },
    initItems: function(array, aBold) {
        return array.map(function(aWord, index) {
            return this.initItem(aWord, aBold);
        }, this);
    },
    _highlight: function(aItem, aRange) {
        this.finder.findBackwards = false; /* 後ろから前に向かって検索するか */
        var doc = this.doc;
        var range = aRange;
        if (!range) {
            range = doc.createRange();
            range.selectNodeContents(this.body);
        }
        var sRange = range.cloneRange();
        sRange.collapse(true);
        var eRange = range.cloneRange();
        eRange.collapse(false);

        // タイマーを使わなくて良いおまじない
        // http://piro.sakura.ne.jp/latest/blosxom/mozilla/xul/2010-07-06_dynamic.htm
        doc.documentElement.clientHeight;

        var rangeArr = [];
        var len = 0;
        for (var retRange = null;
             retRange = this.finder.Find(aItem.word, range, sRange, eRange);
             sRange = retRange.cloneRange(), sRange.collapse(false)) {
            rangeArr[++len] = retRange;
        }

        if (len > 0) {
            var temp = doc.createElementNS("http://www.w3.org/1999/xhtml", "font");
            temp.setAttribute("style", this.css +
                'background-color: ' + aItem.bgcolor + ' !important;' +
                'color: ' + aItem.fgcolor + ' !important;');
            temp.setAttribute("class", CLASS_SPAN + ' ' + CLASS_INDEX + aItem.index);

            len = 0;
            rangeArr.forEach(function(range){
                var node = range.startContainer;
                if (node.nodeType != 1)
                    node = node.parentNode;
                if (node.mozMatchesSelector(this.throughSelector)) {
                    if (node.classList.contains( CLASS_INDEX + aItem.index ))
                        ++len;
                    return;
                }

                node = range.endContainer;
                if (node.nodeType != 1)
                    node = node.parentNode;
                if (node.mozMatchesSelector(this.throughSelector)) {
                    if (node.classList.contains( CLASS_INDEX + aItem.index ))
                        ++len;
                    return;
                }

                var span = temp.cloneNode(false);
                try {
                    range.surroundContents(span);
                    ++len;
                    return;
                } catch (e) {}
                try {// 範囲内の要素を細切れにしてでも強調する。行儀が悪い
                    span.appendChild(range.extractContents());
                    range.insertNode(span);
                    ++len;
                    return;
                } catch (e) {}
            }, this);
        }
        if (aRange)
            aItem.length += len;
        else
            aItem.length = len;
        if (aItem.length)
            this.isEmpty = false;
    },
    _lowlight: function(aItem) {
        var doc = this.doc;
        $A(doc.getElementsByClassName(CLASS_INDEX + aItem.index)).forEach(function(elem){
            var range = doc.createRange();
            range.selectNodeContents(elem);
            var df = range.extractContents();
            range.setStartBefore(elem);
            range.insertNode(df);
            range.selectNode(elem);
            range.deleteContents();
        }, this);
        aItem.length = 0;
        if (Object.keys(this.items).length === 0)
            this.isEmpty = true;
    },
    highlightAll: function(aRange) {
        Object.keys(this.items).forEach(function(key){
            this._highlight(this.items[key], aRange);
        }, this);
        this.fireEvent('highlightAll', this.doc);
    },
    lowlightAll: function() {
        var doc = this.doc;
        $A(doc.getElementsByClassName(CLASS_SPAN)).forEach(function(elem){
            var range = doc.createRange();
            range.selectNodeContents(elem);
            var df = range.extractContents();
            range.setStartBefore(elem);
            range.insertNode(df);
            range.selectNode(elem);
            range.deleteContents();
        }, this);
        Object.keys(this.items).forEach(function(key){
            delete this.items[key];
        }, this);
        this.isEmpty = true;
        this.fireEvent('lowlightAll', this.doc);
    },
    addWord: function(aWord, aBold, aRange) {
        var itemArr = Array.isArray(aWord) ? this.initItems(aWord, aBold) : [this.initItem(aWord, aBold)];
        itemArr = itemArr.filter(function(item) {
            if (item) {
                this._highlight(item, aRange);
                return true;
            }
        }, this);
        if (itemArr.length) {
            var args = ['highlight', this.doc].concat(itemArr);
            this.fireEvent.apply(this, args);
        }
    },
    removeWord: function(aWord) {
        var w = aWord.toLowerCase();
        var obj = this.items[w];
        if (obj) {
            this._lowlight(obj);
            this.fireEvent('lowlight', this.doc, obj);
        }
        delete this.items[w];
    },
    newIndexOf: function() {
        // index プロパティの欠番を探す
        var arr = [];
        Object.keys(this.items).forEach(function(key) arr[this.items[key].index] = true, this);

        for (var i = 0, len = arr.length; i < len; i++) {
            if (!arr[i]) return i;
        };
        return arr.length;
    },
    find: function(isPrev) {
        if (this.isEmpty) {
            debug('強調されていないようなので検索しません');
            return;
        }
        var tw = this.tw;
        if (!tw) {
            let fn = function(node) {
                if (node.classList.contains(CLASS_SPAN)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }
            tw = this.tw = this.doc.createTreeWalker(this.doc.body, NodeFilter.SHOW_ELEMENT, fn, false);
        }
        // ツリーの現在地を最後にクリックした位置に合わせる
        var sel = this.win.getSelection();
        if (sel.focusNode) {
            var n = isPrev ? sel.anchorNode : sel.focusNode;
            var o = isPrev ? sel.anchorOffset : sel.focusOffset;
            tw.currentNode = o ? (n.childNodes[o] || n) : n;
        }
        sel.removeAllRanges();

        var node;
        if (isPrev) {
            node = tw.previousNode();
            if (!node) {
                node = Array.pop(this.doc.getElementsByClassName(CLASS_SPAN));
                tw.currentNode = node || this.doc.body.lastChild;
                if (node)
                    gWHT.sound.beep();
            }
        } else {
            node = tw.nextNode();
            if (!node) {
                node = this.doc.getElementsByClassName(CLASS_SPAN)[0];
                tw.currentNode = node || this.doc.body;
                if (node)
                    gWHT.sound.beep();
            }
        }
        if (!node) {
            gWHT.sound.beep();
            this.isEmpty = true;
            return;
        }
        this.isEmpty = false;

        sel.selectAllChildren(node);
        try {
            sel.QueryInterface(Ci.nsISelectionPrivate)
                .scrollIntoView(Ci.nsISelectionController.SELECTION_ANCHOR_REGION, true, 50, 50);
        } catch (e) {}

        var anchor = this.doc.evaluate('descendant-or-self::a[@href]|ancestor-or-self::a[@href]',
            node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (anchor && !/^mailto/.test(anchor.href)) {
            anchor.focus();
            sel.selectAllChildren(node);
        }
        isPrev ? sel.collapseToStart() : sel.collapseToEnd();
        node.style.setProperty('outline', '3px solid #36F', 'important');
        this.win.setTimeout(function() {
            node.style.removeProperty('outline');
        }, 400);
    },
    fireEvent: function (aName, aTarget) {
        var evt = new CustomEvent(EVENT_RESPONSE, { bubbles: true, cancelable: true, detail: {
            name: aName,
            args: $A(arguments).slice(2),
        } });
        aTarget.dispatchEvent(evt);
    },
};

function rgb2bw(code) {
    if (!code) return "#000";
    var m = code.match(/^#?([0-9a-f]{1,2})([0-9a-f]{1,2})([0-9a-f]{1,2})$/i);
    if (!m || !m[1]) return "#000";
    m = m.slice(1, 4).map(function(c){
        return parseInt(!c[1] ? c[0] + c[0] : c, 16);
    });
    return (m[0] + m[1] + m[2]) > 128*3 ? "#000" : "#fff";
}

function getWins(win) {
    var wins = win.frames.length ? [win].concat(Array.slice(win.frames)) : [win];
    return wins.filter(function(win) checkDoc(win.document));
}
function checkDoc(doc) {
    if (!(doc instanceof HTMLDocument)) return false;
    if (!window.mimeTypeIsTextBased(doc.contentType)) return false;
    if (!doc.body || !doc.body.hasChildNodes()) return false;
    if (doc.body instanceof HTMLFrameSetElement) return false;
    return true;
}
function getFocusedWindow() {
    var win = document.commandDispatcher.focusedWindow;
    return (!win || win == window) ? content : win;
}
function getRangeAll(win) {
    var sel = (win || getFocusedWindow()).getSelection();
    var res = [];
    if (sel.isCollapsed) return res;

    for(var i = 0, l = sel.rangeCount; i < l; i++) {
        res.push(sel.getRangeAt(i));
    }
    return res;
}

function $(id) { return document.getElementById(id); }
function $$(exp, doc) { return Array.prototype.slice.call((doc || document).querySelectorAll(exp)); }
function $A(args) { return Array.prototype.slice.call(args); }
function log() { Services.console.logStringMessage($A(arguments).join(', ')); }
function debug() { if (gWHT.DEBUG) log("wht debug: " + $A(arguments).join(', ')); }
function addStyle(css) {
    var pi = document.createProcessingInstruction(
        'xml-stylesheet',
        'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
    );
    return document.insertBefore(pi, document.documentElement);
}

window.gWHT.init();

})('\
.wordhighlight-toolbar-icon {\
  list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABKSURBVDhPzcqxDQAgCAVRFnF5d3AlY+0C2PyOI6Gw4JLrnvXJr3ll8RhhWjxGmBZv3zxeOo0wnUaY7tXawyuLxwjT4jHCtPivzB566PWhwL2sEQAAAABJRU5ErkJggg==");\
}\
.wordhighlight-toolbar-icon[state="disable"] {\
  filter: url("chrome://mozapps/skin/extensions/extensions.svg#greyscale");\
}\
.wordhighlight-toolbar-arrowscrollbox > .autorepeatbutton-up,\
.wordhighlight-toolbar-arrowscrollbox > .autorepeatbutton-down {\
  list-style-image: url("chrome://browser/skin/tabbrowser/tab-arrow-left.png");\
}\
.wordhighlight-toolbar-arrowscrollbox > .autorepeatbutton-down {\
  transform: scaleX(-1);\
}\
.wordhighlight-toolbar-item {\
  text-shadow: none;\
}\
.wordhighlight-toolbar-item > .toolbarbutton-icon { visibility: collapse; }\
.wordhighlight-toolbar-reloadbutton{\
list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEwSURBVDhP1Y/LSsNAFIaz9QEEoZCVW1duXQlufaXYXItmkomZkk5uJsEUkxBLtz5JwVXBVaFQEISCME7CUUhsF93pBz+c8805zIzw//Ae5waUu3Gi4pgkdUiy2XqczZib1AuS1pQ8lCe8NxoHo79x4/qKL6x4msVugnr7XcN4l+ZmM65WTlwxJ6pyFBSnjcdpKXL32npIu9DHDp8oD+PJQbXw3gD/EzjqMqL5G6JThmkpghKQNzUa1w8cd7kj8Va/jz+hPRyFRMvROGU6ydq/H4zmRC5/AeOpQHVAqDiCcjcqSgY3ONxoOGSaHTzLKD5rvOEE5yoO5ooZLnU7vG6H96FY/qVy678rts/6kWx/o2B6AaP7kTAVh2iCJZMuJIt+yBZ9ka3JUEXeAEb+FILwBYO3ysFzKw59AAAAAElFTkSuQmCC");\
}\
.wordhighlight-toolbar-addbutton {\
  list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAB9SURBVDhPtZHRDYAgDERxDSdyOTfw3y2pvFiS0oCIxEteIvV6hzH8KhFZQI9jijGuFh2/E60s7ccpwPPQTT4HYMrUAjJqL4XJYwM8unbLN/bAW9xkOgAxTGwWs1DME/XfSmoGk2/MqL2tVoC+7ms6ALGUeP7mnmgdbh5TCBe3oUIwyIab9QAAAABJRU5ErkJggg==");\
}\
#wordhighlight-toolbar-box:empty,\
.wordhighlight-toolbar-arrowscrollbox:empty,\
.wordhighlight-toolbar-arrowscrollbox:empty ~ * { visibility: collapse; }\
\
\
/*.wordhighlight-toolbar-arrowscrollbox > .autorepeatbutton-up:-moz-lwtheme-brighttext,\
.wordhighlight-toolbar-arrowscrollbox > .autorepeatbutton-down:-moz-lwtheme-brighttext {\
  list-style-image: url("chrome://browser/skin/tabbrowser/tab-arrow-left-inverted.png");\
}\
.wordhighlight-toolbar-reloadbutton:-moz-lwtheme-brighttext,\
.wordhighlight-toolbar-addbutton:-moz-lwtheme-brighttext {\
  list-style-image: url("chrome://browser/skin/Toolbar-inverted.png");\
}*/\
\
');
