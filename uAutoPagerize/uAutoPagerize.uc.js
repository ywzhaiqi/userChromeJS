// ==UserScript==
// @name           uAutoPagerize 中文规则增强版
// @namespace      http://d.hatena.ne.jp/Griever/
// @description    在同一个页面自动加载下一页
// @include        main
// @modified       ywzhaiqi
// @compatibility  Firefox 17
// @charset        UTF-8
// @version        0.3.0
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/tree/master/uAutoPagerize
// @reviewURL      http://bbs.kafan.cn/thread-1555846-1-1.html
// @optionsURL     about:config?filter=uAutopagerize
// @note           大幅修改 By ywzhaiqi
// @note           0.3.0 本家に倣って Cookie の処理を変更した
// @note           0.2.9 remove E4X
// @note           0.2.8 履歴に入れる機能を廃止
// @note           0.2.7 Firefox 14 でとりあえず動くように修正
// @note           0.2.6 組み込みの SITEINFO を修正
// @note           0.2.5 MICROFORMAT も設定ファイルから追加・無効化できるようにした
// @note           0.2.5 スペースアルクで動かなくなってたのを修正
// @note           0.2.4 SITEINFO のソートをやめてチェックの仕方を変えた（一度SITEINFOを更新した方がいいかも）
// @note           0.2.4 naver まとめ、kakaku.com 修正
// @note           0.2.3 kakaku.com のスペック検索に対応
// @note           0.2.3 Fx7 くらいから xml で動かなくなってたのを修正
// @note           0.2.3 ver 0.2.2 で nextLink に form 要素が指定されている場合などに動かなくなってたのを修正
// @note           0.2.2 コンテキストメニューが意外と邪魔だったので葬った
// @note           0.2.1 コンテキストメニューに次のページを開くメニューを追加
// @note           0.2.1 区切りのアイコンをクリックしても色が変わらなかったのを修正
// @note           0.2.0 INCLUDE を設定できるようにした
// @note           0.2.0 INCLUDE, EXCLUDE をワイルドカード式にした
// @note           0.2.0 アイコンに右クリックメニューを付けた
// @note           0.2.0 スクロールするまでは次を読み込まないオプションをつけた
// ==/UserScript==

// this script based on
// AutoPagerize version: 0.0.41 2009-09-05T16:02:17+09:00 (http://autopagerize.net/)
// oAutoPagerize (http://d.hatena.ne.jp/os0x/searchdiary?word=%2a%5boAutoPagerize%5d)
//
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html


(function(css) {

// 放置的位置，true为地址栏，false为附加组件栏（可移动按钮）
var isUrlbar = false;
var ORIGINAL_SITEINFO = false;  // 原版规则是否启用？略大，但很多站点都可以翻页
var SIMPLE_SEPARATOR = false;  // true 原版的分隔条，false 多功能分隔条

var DB_FILENAME_CN =  "uSuper_preloader.db.js";   // 中文数据库的位置
var DB_FILENAME_JSON = "uAutoPagerize.json";      // 原版数据库位置

var FORCE_TARGET_WINDOW = true;
var BASE_REMAIN_HEIGHT = 600;
var DEBUG = false;
var AUTO_START = true;
var SCROLL_ONLY = false;
var CACHE_EXPIRE = 24 * 60 * 60 * 1000;
var XHR_TIMEOUT = 30 * 1000;

// 新增的
var MAX_PAGER_NUM = -1;           // 默认最大翻页数， -1表示无限制
var IMMEDIATELY_PAGER_NUM = 3;    // 立即加载的初始页数
var USE_IFRAME = true;            // 是否启用 iframe 加载下一页（浏览器级，默认只允许JavaScript，在 createIframe 中可设置其它允许）
var USE_FORCE_NEXT_PAGE = true;   // 是否启用强制拼接？
var PRE_REQUEST_NEXT_PAGE = true; // 提前预读下一页..就是翻完第1页,立马预读第2页,翻完第2页,立马预读第3页..(大幅加快翻页快感-_-!!)
var SEPARATOR_RELATIVELY = true;  //分隔符.在使用上滚一页或下滚一页的时候是否保持相对位置..

// 出在自动翻页信息附加显示真实相对页面信息，一般能智能识别出来。如果还有站点不能识别，可以把地址的特征字符串加到下面
// 最好不要乱加，一些不规律的站点显示出来的数字也没有意义
var REALPAGE_SITE_PATTERN = ['search?', 'search_', 'forum', 'thread'];

var SITEINFO_CN_IMPORT_URLS = [
    //Super_preloader 的翻页规则更新地址
    // "http://simpleu.googlecode.com/svn/trunk/scripts/Super_preloader.db.js",
    "https://userscripts.org/scripts/source/142198.user.js",

    // ywzhaiqi 的规则。github 速度略慢，用 googlecode
    "http://autopagerize-userchrome.googlecode.com/git/_uAutoPagerize.js",
];

var SITEINFO_IMPORT_URLS = ORIGINAL_SITEINFO ? [
        'http://wedata.net/databases/AutoPagerize/items.json',
    ] : [];

// ワイルドカード(*)で記述する
var INCLUDE = [
    "*"
];
var EXCLUDE = [
    'https://mail.google.com/*',
    'https://maps.google.*/*',
    'https://www.google.com/maps/*',
    'https://www.google.com/calendar*',
    'http://www.google.*/reader/*',
    '*://app.yinxiang.com/*',
    '*://www.dropbox.com/*',
    '*://www.toodledo.com/*',
    '*://www.wumii.com/*',
    '*/archives/*'
];

var MY_SITEINFO = [
    {
        url          : '^https?://mobile\\.twitter\\.com/'
        ,nextLink    : '//div[contains(concat(" ",normalize-space(@class)," "), " w-button-more ")]/a[@href]'
        ,pageElement : '//div[@class="timeline"]/table[@class="tweet"] | //div[@class="user-list"]/table[@class="user-item"]'
        ,exampleUrl  : 'https://mobile.twitter.com/ https://mobile.twitter.com/search?q=css'
    },
];

var MICROFORMAT = [
    {
        url         : '^https?://.*',
        nextLink    : '//a[@rel="next"] | //link[@rel="next"]',
        pageElement : '//*[contains(@class, "autopagerize_page_element")]',
        insertBefore: '//*[contains(@class, "autopagerize_insert_before")]'
    }
];

var FORCE_SITEINFO = {
    url        : '^https?://.*',
    nextLink   : 'auto;',
    pageElement: "//body/*"
};

// 分页导航图标的颜色
var COLOR = {
    on: '#0f0',
    off: '#ccc',
    enable: '#0f0',
    disable: '#ccc',
    loading: '#0ff',
    terminated: '#00f',
    error: '#f0f'
};

// 分页导航上面的横线，背景在下面的 background 修改
var SEPARATOR_HR = true;

// 分页导航的4个图标
var sep_icons={
    top: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEnSURBVDhPY6AKkFlt+J8cDNVOBQOwAZACwbPa/wXPaf+XWquHXzE6kFql/1/wvPZ/oZu6YCx4Qfu/+Bpd4gwRX6X3nx9os8B13f8CN6AYyOYHukRktTZ+Q8RW6fznPaP1n++qzn++a2gYKAaSE1qthd0QwZka/zm3qPznOqT+n/uc1n+eK9ooGCQGkuPcpvKfb5YqqiFaDTb/mcvF/jPXSvxn7ZP5z7FD9T/XJaAGJAwSA8mB1DBXiP+XqcATJmwLFf5zXtBCwSAxqDRhwDJD7j/7OU0UDBKDShMGTNOATj2ljoJBYlBpwoBxssx/puNATSegGMhmnEKKAc2S/xnXKf5n3KQEweuB7FZJ4g2w6vT9z1Am9p+hUhyCgWyTVjfiDSAeMDAAAJhj4ilBCDLiAAAAAElFTkSuQmCC'
    ,bottom: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEqSURBVDhPY6AJMGl1+89QJvafoVIcgoFsq07f/1BpwoCxVfI/43rF/4yblCB4HZDdLEmCAVNk/jMdV//PdAKKgWzGyTLEG8A0TeY/8yl1FAwSg0oTBiwz5P6zn9NEwSAxqDRhwLZQ4T/nBS0UDBKDSmMCmQrd/8wV4v+ZayX+s/bJ/OfYofqf65IWCgaJgeRAapjLxf5rNdigGsg3S/U/5zaV/1yH1P9zn9P6z3NFGwWDxEBynFtU/gvO1MDuGqHVWv95z2j957uq85/vGhoGioHkxFbp4A8LkdXa//nPaf8XuK77X+AGFAPZ/Ge1/4uv0iMuIMXX6P4XvKD9X+imLhgLntf+L7VKnzjNMCC1Vu+/INAlgkCbZVYb4tcMUkAOhmqnggHkAwYGAFvC4in4UgSOAAAAAElFTkSuQmCC'
    ,up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEqSURBVDhPY6Ap0Fpo919zoc1/KJc0ILPa8L/gWe3/gue0/0ut1SPNEKlV+v8Fz2v/F7qpC8aCF7T/i6/RJc4Q8VV6//mBNgtc1/0vcAOKgWx+oEtEVmvjN0Rslc5/3jNa//mu6vznu4aGgWIgOaHVWtgNEZyp8Z9zi8p/rkPq/7nPaf3nuaKNgkFiIDnObSr/+Wapohqi1WDzn7lc7D9zrcR/1j6Z/xw7VP9zXQJqQMIgMZAcSA1zhfh/mQo8YcK2UOE/5wUtFAwSg0oTBiwz5P6zn9NEwSAxqDRhQLEBTNOAfj2ljoJBYlBpwoBxssx/puNATSegGMhmnEKKAc2S/xnXKf5n3KQEweuB7FZJ4g2w6vT9z1Am9p+hUhyCgWyTVjfiDSAeMDAAAG+OupggV3NXAAAAAElFTkSuQmCC'
    ,down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEvSURBVDhPtZBLS8NAFIXz8JWqaVMksWUQlZbYSVMRXElx6c6/o3UhCNKFGzeKaHfZJj5ARFy7UURjEZ+/5jhjp4tRManigQ8u58y9c7nKv2i+uQRlxYay5nRg9cLWMkScLLVZgHoyBfV0usMxqzcLPQzYJdCuXGjXAlarOyT9AG2PQL9xJbgn4mT17U9gMK5IcE/EyfrzgIFgEkabSnBPxF9FGj70hgN9fRz92wRDF2VkHqgE93jG3+irNuhGXR5otsowzkvIXLoYjilGHj0J7vHMOCvBOpj5fpt8RDF6S2E+VWE+f4J5PLPD6s+3GIs8ZGMPuRcfuVcBq7N3Hpywlu6QzqEPq+0h/+Z/YN17KIaz6Zq7Kh7VYLFNLPYzieZ6a+6qEtRBg8XfNaeTorwD6Qm6mCukyg8AAAAASUVORK5CYII='
};

// 分页导航的样式
var sep_style = [
	'.autopagerize_page_info {',
		'clear: both;',
		// 'background: none repeat scroll 0% 0% rgb(230, 230, 230);',
		'margin: 10px 0;',
		'text-align: center;',
	'}',
	'.autopagerize_page_info img {',
		'width: 16px;',
		'height: 16px;',
		'padding-top: 4px;',
		'padding-bottom: 4px;',
		'margin-left: 6px;',
		'margin-right: 6px;',
		'display: inline-block;',
		'vertical-align: middle;',
	'}',
	'.autopagerize_link {',
		'padding: 0px;',
		'margin-left: 5px;',
		'vertical-align: middle;',
	'}',
	'.autopagerize_page_info input {',
		'padding: 0px;',
		'text-align: center;',
		'vertical-align: middle;',
	'}',
].join('\n');


let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

if (typeof window.uAutoPagerize != 'undefined') {
    window.uAutoPagerize.destroy();
}

var ns = window.uAutoPagerize = {
    INCLUDE_REGEXP : /./,
    EXCLUDE_REGEXP : [],
    MICROFORMAT    : MICROFORMAT.slice(),
    MY_SITEINFO    : MY_SITEINFO.slice(),
    SITEINFO_CN    : [],
    SITEINFO       : [],
    FORCE_SITEINFO : FORCE_SITEINFO,

    get prefs() {
        delete this.prefs;
        return this.prefs = Services.prefs.getBranch("uAutoPagerize.");
    },
    get file() {
        var aFile = Services.dirsvc.get('UChrm', Ci.nsILocalFile);
        aFile.appendRelativePath('_uAutoPagerize.js');
        delete this.file;
        return this.file = aFile;
    },
    get file_cn() {
        var aFile = Services.dirsvc.get('UChrm', Ci.nsILocalFile);
        aFile.appendRelativePath(DB_FILENAME_CN);
        delete this.file_cn;
        return this.file_cn = aFile;
    },
    get INCLUDE() INCLUDE,
    set INCLUDE(arr) {
        try {
            this.INCLUDE_REGEXP = arr.length > 0 ?
                new RegExp(arr.map(wildcardToRegExpStr).join("|")) :
                /./;
            INCLUDE = arr;
        } catch (e) {
            log("INCLUDE 不正确");
        }
        return arr;
    },
    get EXCLUDE() EXCLUDE,
    set EXCLUDE(arr) {
        try {
            this.EXCLUDE_REGEXP = arr.map(function(s){
                return new RegExp(wildcardToRegExpStr(s));
            });
            EXCLUDE = arr;
        } catch (e) {
            log("EXCLUDE 不正确");
        }
        return arr;
    },
    get AUTO_START() AUTO_START,
    set AUTO_START(bool) {
        updateIcon();
        return AUTO_START = !!bool;
    },
    get BASE_REMAIN_HEIGHT() BASE_REMAIN_HEIGHT,
    set BASE_REMAIN_HEIGHT(num) {
        num = parseInt(num, 10);
        if (!num) return num;
        let m = $("uAutoPagerize-BASE_REMAIN_HEIGHT");
        if (m) m.setAttribute("tooltiptext", BASE_REMAIN_HEIGHT = num);
        return num;
    },
    get MAX_PAGER_NUM() MAX_PAGER_NUM,
    set MAX_PAGER_NUM(num) {
        num = parseInt(num, 10);
        if (!num) return num;
        let m = $("uAutoPagerize-MAX_PAGER_NUM");
        if (m) m.setAttribute("tooltiptext", MAX_PAGER_NUM = num);
        return num;
    },
    get IMMEDIATELY_PAGER_NUM() IMMEDIATELY_PAGER_NUM,
    set IMMEDIATELY_PAGER_NUM(num){
        num = parseInt(num, 10);
        if (!num && (num != 0)) return num;
        let m = $("uAutoPagerize-immedialate-pages");
        if (m) m.value = num;
        return num;
    },
    get DEBUG() DEBUG,
    set DEBUG(bool) {
        let m = $("uAutoPagerize-DEBUG");
        if (m) m.setAttribute("checked", DEBUG = !!bool);
        return bool;
    },
    get FORCE_TARGET_WINDOW() FORCE_TARGET_WINDOW,
    set FORCE_TARGET_WINDOW(bool) {
        let m = $("uAutoPagerize-FORCE_TARGET_WINDOW");
        if (m) m.setAttribute("checked", FORCE_TARGET_WINDOW = !!bool);
        return bool;
    },
    get SCROLL_ONLY() SCROLL_ONLY,
    set SCROLL_ONLY(bool) {
        let m = $("uAutoPagerize-SCROLL_ONLY");
        if (m) m.setAttribute("checked", SCROLL_ONLY = !!bool);
        return bool;
    },
    get PRE_REQUEST_NEXT_PAGE() PRE_REQUEST_NEXT_PAGE,
    set PRE_REQUEST_NEXT_PAGE(bool) {
        let m = $("uAutoPagerize-PRE_REQUEST_NEXT_PAGE");
        if (m) m.setAttribute("checked", PRE_REQUEST_NEXT_PAGE = !!bool);
        return bool;
    },

    init: function() {
        ns.style = addStyle(css);

        ns.icon = ns.addButton();
        ns.popupMenu = ns.addPopupMenu();
        if(USE_FORCE_NEXT_PAGE)
            ns.popupMenu.addEventListener("popupshowing", this.showForcePageMenu, false);

        ["DEBUG", "AUTO_START", "FORCE_TARGET_WINDOW", "SCROLL_ONLY", "PRE_REQUEST_NEXT_PAGE"].forEach(function(name) {
            try {
                ns[name] = ns.prefs.getBoolPref(name);
            } catch (e) {}
        }, ns);
        ["BASE_REMAIN_HEIGHT","MAX_PAGER_NUM", "IMMEDIATELY_PAGER_NUM"].forEach(function(name) {
            try {
                ns[name] = ns.prefs.getIntPref(name);
            } catch (e) {}
        }, ns);

        if (!getCache())
            requestSITEINFO();

        if(!ns.loadSetting_CN())
            ns.requestSITEINFO_CN();

        ns.INCLUDE = INCLUDE;

        try{
            let str = ns.prefs.getCharPref("EXCLUDE");
            ns.EXCLUDE = str.split(",");
        }catch(e){}
        if(!ns.EXCLUDE){
            ns.EXCLUDE = EXCLUDE;
        }

        ns.addListener();
        ns.loadSetting();
        updateIcon();
    },
    uninit: function() {
        ns.removeListener();

        ["DEBUG", "AUTO_START", "FORCE_TARGET_WINDOW", "SCROLL_ONLY", "PRE_REQUEST_NEXT_PAGE"].forEach(function(name) {
            try {
                ns.prefs.setBoolPref(name, ns[name]);
            } catch (e) {}
        }, ns);

        ["BASE_REMAIN_HEIGHT", "MAX_PAGER_NUM", "IMMEDIATELY_PAGER_NUM"].forEach(function(name) {
            try {
                ns.prefs.setIntPref(name, ns[name]);
            } catch (e) {}
        }, ns);

        ns.prefs.setCharPref("EXCLUDE", ns.EXCLUDE.join(","));
    },
    theEnd: function() {
        ns.IMMEDIATELY_PAGER_NUM = $("uAutoPagerize-immedialate-pages").value;

        var ids = ["uAutoPagerize-icon", "uAutoPagerize-popup"];
        for (let [, id] in Iterator(ids)) {
            let e = document.getElementById(id);
            if (e) e.parentNode.removeChild(e);
        }
        ns.style.parentNode.removeChild(ns.style);
        ns.removeListener();
    },
    destroy: function() {
        ns.theEnd();
        ns.uninit();
        delete window.uAutoPagerize;
    },
    addListener: function() {
        gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);
        gBrowser.mTabContainer.addEventListener('TabSelect', this, false);
        gBrowser.mTabContainer.addEventListener('TabClose', this, false);
        window.addEventListener('uAutoPagerize_destroy', this, false);
        window.addEventListener('unload', this, false);
    },
    removeListener: function() {
        gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);
        gBrowser.mTabContainer.removeEventListener('TabSelect', this, false);
        gBrowser.mTabContainer.removeEventListener('TabClose', this, false);
        window.removeEventListener('uAutoPagerize_destroy', this, false);
        window.removeEventListener('unload', this, false);
    },
    handleEvent: function(event) {
        switch(event.type) {
            case "DOMContentLoaded":
                if (this.AUTO_START)
                    this.launch(event.target.defaultView);
                break;
            case "TabSelect":
                if (this.AUTO_START)
                    updateIcon();
                break;
            case "TabClose":
                // 如果有 iframe 则移除
                let browser = gBrowser.getBrowserForTab(event.target);
                if(browser.uAutoPagerizeIframe){
                    var parent = browser.uAutoPagerizeIframe.parentNode;
                    parent.removeChild(browser.uAutoPagerizeIframe);
                    browser.uAutoPagerizeIframe = null;
                }
                break;
            case "uAutoPagerize_destroy":
                this.destroy(event);
                break;
            case "unload":
                this.uninit(event);
                break;
        }
    },
    addButton: function(){
        var icon;
        if(isUrlbar){
            icon = $('urlbar-icons').appendChild($C("image", {
                id: "uAutoPagerize-icon",
                state: "disable",
                tooltiptext: "disable",
                onclick: "if (event.button != 2) uAutoPagerize.iconClick(event);",
                context: "uAutoPagerize-popup",
                style: "padding: 0px 2px;",
            }));
        }else{
            icon = $('addon-bar').appendChild($C("toolbarbutton", {
                id: "uAutoPagerize-icon",
                class: "toolbarbutton-1",
                type: "context",
                removable: "true",
                state: "disable",
                tooltiptext: "disable",
                onclick: "if (event.button != 2) uAutoPagerize.iconClick(event);",
                context: "uAutoPagerize-popup",
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAQElEQVR42mNgoAbg/sb9HxmDxNTuq/1HxiAx64PW/5HxcDKAYkCsbbaLbf8j4+FkAMWAWNuMe4z/I+PhZAAlAADWnzKwMlmELQAAAABJRU5ErkJggg=="
            }));

            setTimeout(function(icon){
                icon.removeAttribute("image");
            }, 500, icon);

            var updateToolbar = {
                runOnce: function(){
                    var toolbars = document.querySelectorAll("toolbar");
                    Array.slice(toolbars).forEach(function(toolbar) {
                        var currentset = toolbar.getAttribute("currentset");
                        if (currentset.split(",").indexOf("uAutoPagerize-icon") < 0) return;
                        toolbar.currentSet = currentset;
                        try {
                            BrowserToolboxCustomizeDone(true);
                        } catch (ex) {}
                    });
                }
            };
            updateToolbar.runOnce();
        }

        return icon;
    },
    addPopupMenu: function(){
        var xml = '\
            <menupopup id="uAutoPagerize-popup"\
                       position="after_start"\
                       ignorekeys="true"\
                       onpopupshowing="uAutoPagerize.onPopupShowing(event);" >\
                <menuitem label="启用自动翻页"\
                          id="uAutoPagerize-AUTOSTART"\
                          type="checkbox"\
                          autoCheck="true"\
                          checked="'+ AUTO_START +'"\
                          oncommand="uAutoPagerize.toggle(event);"/>\
                <menuitem label="载入配置"\
                          tooltiptext="左键载入配置，右键编辑配置文件"\
                          oncommand="uAutoPagerize.loadSetting(true);"\
                          onclick="if(event.button == 2) { uAutoPagerize.edit(uAutoPagerize.file); return false; }"/>\
                <menuitem label="更新中文规则" \
                          tooltiptext="包含Super_preloader规则和本人维护的规则"\
                          oncommand="uAutoPagerize.resetSITEINFO_CN();"/>\
                <menuitem label="更新原版规则" hidden="' + !ORIGINAL_SITEINFO + '" \
                          oncommand="uAutoPagerize.resetSITEINFO();"/>\
                <menuseparator/>\
                <hbox>\
                    <textbox id="uAutoPagerize-blacklist-textbox" oninput="uAutoPagerize.checkUrl(event);"/>\
                    <toolbarbutton label="添加" id="uAutoPagerize-blacklist-icon" \
                        tooltiptext="添加到黑名单" onclick="uAutoPagerize.blacklistBtnClick(event);"/>\
                </hbox>\
                <hbox style="padding-left:32px;">\
                    立即翻<textbox type="number" value="' + IMMEDIATELY_PAGER_NUM + '" tooltiptext="连续翻页的数量" \
                        id="uAutoPagerize-immedialate-pages" style="width:35px" />页\
                    <toolbarbutton label="开始" tooltiptext="现在立即开始连续翻页" \
                        id="uAutoPagerize-immedialate-start" oncommand="uAutoPagerize.immediatelyStart();"/>\
                </hbox>\
                <menuitem label="强制拼接" type="checkbox" disabled="true" \
                          id="uAutoPagerize-force_nextpage" hidden="' + !USE_FORCE_NEXT_PAGE + '" \
                          oncommand="uAutoPagerize.forcePageToggle();" />\
                <menuseparator/>\
                <menuitem label="提前预读下一页"\
                          tooltiptext="翻完第1页,立马预读第2页,翻完第2页,立马预读第3页..(大幅加快翻页快感-_-!!)"\
                          id="uAutoPagerize-PRE_REQUEST_NEXT_PAGE"\
                          type="checkbox"\
                          autoCheck="false"\
                          checked="'+ PRE_REQUEST_NEXT_PAGE +'"\
                          oncommand="uAutoPagerize.PRE_REQUEST_NEXT_PAGE = !uAutoPagerize.PRE_REQUEST_NEXT_PAGE;"/>\
                <menuitem label="新标签打开链接"\
                          id="uAutoPagerize-FORCE_TARGET_WINDOW"\
                          type="checkbox"\
                          autoCheck="false"\
                          checked="'+ FORCE_TARGET_WINDOW +'"\
                          oncommand="uAutoPagerize.FORCE_TARGET_WINDOW = !uAutoPagerize.FORCE_TARGET_WINDOW;"/>\
                <menuitem label="设置翻页高度"\
                          id="uAutoPagerize-BASE_REMAIN_HEIGHT"\
                          tooltiptext="'+ BASE_REMAIN_HEIGHT +'"\
                          oncommand="uAutoPagerize.BASE_REMAIN_HEIGHT = prompt(\'\', uAutoPagerize.BASE_REMAIN_HEIGHT);"/>\
                <menuitem label="设置最大自动翻页数"\
                          id="uAutoPagerize-MAX_PAGER_NUM"\
                          tooltiptext="'+ MAX_PAGER_NUM +'"\
                          oncommand="uAutoPagerize.MAX_PAGER_NUM = prompt(\'\', uAutoPagerize.MAX_PAGER_NUM);"/>\
                <menuitem label="滚动时才翻页"\
                          id="uAutoPagerize-SCROLL_ONLY"\
                          type="checkbox"\
                          autoCheck="false"\
                          checked="'+ SCROLL_ONLY +'"\
                          oncommand="uAutoPagerize.SCROLL_ONLY = !uAutoPagerize.SCROLL_ONLY;"/>\
                <menuitem label="调试模式"\
                          id="uAutoPagerize-DEBUG"\
                          type="checkbox"\
                          autoCheck="false"\
                          checked="'+ DEBUG +'"\
                          oncommand="uAutoPagerize.DEBUG = !uAutoPagerize.DEBUG;"/>\
                <menuseparator/>\
                <menuitem label="在线搜索翻页规则"\
                          id="uAutoPagerize-search"\
                          oncommand="uAutoPagerize.search()"/>\
            </menupopup>\
        ';
        var range = document.createRange();
        range.selectNodeContents($('mainPopupSet'));
        range.collapse(false);
        range.insertNode(range.createContextualFragment(xml.replace(/\n|\t/g, '')));
        range.detach();

        return $("uAutoPagerize-popup");
    },
    onPopupShowing: function(event){
        var excludeStr;
        var locationHref = content.location.href;
        var blacklistBtn = $("uAutoPagerize-blacklist-icon");
        var blacklistText = $("uAutoPagerize-blacklist-textbox");

        for(let [index, reg] in Iterator(ns.EXCLUDE_REGEXP)){
            if(reg.test(locationHref)){
                excludeStr = ns.EXCLUDE[index];
                break;
            }
        }

        if(excludeStr){
            blacklistBtn.setAttribute("label", "修改");
            blacklistText.setAttribute("oldvalue", excludeStr);
            blacklistText.setAttribute("tooltiptext", "修改黑名单或从中删除，空白为删除");
            blacklistText.style.color = "green";
        }else{
            excludeStr = "*" + content.location.host + "*";
            blacklistBtn.setAttribute("label", "添加");
            blacklistText.removeAttribute("oldvalue");
            blacklistText.setAttribute("tooltiptext", "添加到黑名单中");
            blacklistText.style.color = "";
        }

        blacklistText.value = excludeStr;
    },
    loadSetting: function(isAlert) {
        var data = loadText(this.file);
        if (!data) return false;
        var sandbox = new Cu.Sandbox( new XPCNativeWrapper(window) );
        sandbox.INCLUDE = null;
        // sandbox.EXCLUDE = null;
        sandbox.MY_SITEINFO = [];
        sandbox.MICROFORMAT = [];
        sandbox.USE_MY_SITEINFO = true;
        sandbox.USE_MICROFORMAT = true;

        try {
            Cu.evalInSandbox(data, sandbox, '1.8');
        } catch (e) {
            log('load error.', e);
            return alerts('uAutoPagerize', '配置文件有错误');
        }
        ns.MY_SITEINFO = sandbox.USE_MY_SITEINFO ? sandbox.MY_SITEINFO.concat(MY_SITEINFO): sandbox.MY_SITEINFO;
        ns.MICROFORMAT = sandbox.USE_MICROFORMAT ? sandbox.MICROFORMAT.concat(MICROFORMAT): sandbox.MICROFORMAT;
        if (sandbox.INCLUDE)
            ns.INCLUDE = sandbox.INCLUDE;
        // if (sandbox.EXCLUDE)
        //     ns.EXCLUDE = sandbox.EXCLUDE;

        ns.MY_SITEINFO.forEach(function(i){
            i.type = 'my';
        });

        if (isAlert)
            alerts('uAutoPagerize', '配置文件已经重新载入');

        return true;
    },
    launch: function(win, timer){
        var doc = win.document;
        var locationHref = win.location.href;

        if (locationHref.indexOf('http') !== 0 ||
           !ns.INCLUDE_REGEXP.test(locationHref)){
            return updateIcon("不包含的页面");
        }

        for(let [index, reg] in Iterator(ns.EXCLUDE_REGEXP)){
            if(reg.test(locationHref)){
                return updateIcon("排除列表, " + ns.EXCLUDE[index]);
            }
        }

        if (!/html|xml/i.test(doc.contentType) ||
            doc.body instanceof HTMLFrameSetElement ||
            win.frameElement && !(win.frameElement instanceof HTMLFrameElement) ||
            doc.querySelector('meta[http-equiv="refresh"]'))
            return updateIcon();

        if (typeof win.AutoPagerize == 'undefined') {
            win.filters         = [];
            win.documentFilters = [];
            win.requestFilters  = [];
            win.responseFilters = [];
            win.AutoPagerize = {
                addFilter         : function(f) { win.filters.push(f) },
                addDocumentFilter : function(f) { win.documentFilters.push(f); },
                addResponseFilter : function(f) { win.responseFilters.push(f); },
                addRequestFilter  : function(f) { win.requestFilters.push(f); },
                launchAutoPager   : function(l) { launchAutoPager_org(l, win); }
            }
            // uAutoPagerize original
            win.fragmentFilters = [];
        }
        var ev = doc.createEvent('Event');
        ev.initEvent('GM_AutoPagerizeLoaded', true, false);
        doc.dispatchEvent(ev);

        var miscellaneous = [];
        // 新标签打开链接。
        win.fragmentFilters.push(function(df){
            if (!ns.FORCE_TARGET_WINDOW) return;
            var arr = Array.slice(df.querySelectorAll('a[href]:not([href^="mailto:"]):not([href^="javascript:"]):not([href^="#"])'));
            arr.forEach(function (elem){
                elem.setAttribute('target', '_blank');
            });
        });

        // 还得加上nextLink，不加上的话会查找下一页链接 2 次，特别是加了自动查找功能后
        var index = -1, info, nextLink;
        var hashchange = false;

        // 已经移到外置规则，便于更新
        if (/\bgoogle\.(?:com|co\.jp|com\.hk)$/.test(win.location.host)) {
            if (!timer || timer < 400) timer = 400;
            hashchange = true;
        }else if (/^https?:\/\/(?:images|www)\.google(?:\.[^.\/]{2,3}){1,2}\/(images\?|search\?.*tbm=isch)/.test(locationHref)) {
            // Google Image
            [, info] = ns.getInfo(ns.MY_SITEINFO, win);
            if (info) {
                if (!timer || timer < 1000) timer = 1000;
                win.requestFilters.push(function(opt) {
                    opt.url = opt.url
                        .replace(/&?(gbv=\d|sout=\d)/g, "")
                        .replace("?", '?gbv=1&sout=1&')
                });
            }
        }else if (win.location.host === 'www.dailymotion.com') {
            win.fragmentFilters.push(function(df) {
                Array.slice(df.querySelectorAll('img[data-src]')).forEach(function(img) {
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                });
            });
        }else if (win.location.host === 'www.newsmth.net') {  // 水木清华社区延迟加载及下一页加载的修复
            timer = 1000;
            hashchange = true;
        }

        if(hashchange){
            win.addEventListener("hashchange", function(event) {
                debug("Add Hashchang Event listener" + win.location.href);
                if (!win.ap) {
                    win.setTimeout(function(){
                        let [index, info] = [-1, null];
                        if (!info) [, info] = ns.getInfo(ns.MY_SITEINFO, win);
                        if (!info) [, info] = ns.getInfo(null, win);
                        if (info) win.ap = new AutoPager(win.document, info);
                        updateIcon();
                    }, timer);
                    return;
                }
                let info = win.ap.info;
                win.ap.destroy(true);
                win.setTimeout(function(){
                    win.ap = new AutoPager(win.document, info);
                    updateIcon();
                }, timer);
            }, false);
        }

        win.setTimeout(function(){
            win.ap = null;
            miscellaneous.forEach(function(func){ func(doc, locationHref); });
            var index = -1;
            var startTime = new Date().getTime();
            debug("---------------------------------------------------------");
            debug("开始查找规则：" + locationHref);

            if (!info) [, info, nextLink] = ns.getInfo(ns.MY_SITEINFO, win);

            // 第二检测 Super_preloader.db 的数据库
            if(!info) [index, info, nextLink] = ns.getInfo(ns.SITEINFO_CN, win);

            if (info) {
                if (info.requestFilter)
                    win.requestFilters.push(info.requestFilter.bind(win));
                if (info.responseFilter)
                    win.responseFilters.push(info.responseFilter.bind(win));
                if (info.documentFilter)
                    win.documentFilters.push(info.documentFilter.bind(win));
                if (info.filter)
                    win.filters.push(info.filter.bind(win));
                if (info.fragmentFilter)
                    win.fragmentFilters.push(info.fragmentFilter.bind(win));

                if (info.startFilter)
                    info.startFilter.call(win, win.document);
                if (info.stylish) {
                    let style = doc.createElement("style");
                    style.setAttribute("id", "uAutoPagerize-style");
                    style.setAttribute("type", "text/css");
                    style.appendChild(doc.createTextNode(info.stylish));
                    doc.getElementsByTagName("head")[0].appendChild(style);
                }
            }

            if (!info) [index, info, nextLink] = ns.getInfo(ns.SITEINFO, win);

            if (!info) [, info, nextLink] = ns.getInfo(ns.MICROFORMAT, win);

            // 强制拼接
            if(!info && win.localStorage.ap_force_nextpage){
                nextLink = autoGetLink(doc);
                if(nextLink)
                    info = FORCE_SITEINFO;
            }

            let spenTime = "耗时: "+ (new Date().getTime() - startTime) + 'ms. ';
            if (info) {
                debug("  找到匹配当前站点的规则: 是[" + info.type + ']第' + (index + 1) + '规则，' + spenTime +
                    "开始运行 Autopager");
                win.ap = new AutoPager(win.document, info, nextLink);
            }else{
                let infoLength = ns.MY_SITEINFO.length + ns.SITEINFO_CN.length + ns.MICROFORMAT.length + ns.SITEINFO.length;
                debug("  所有规则都没法找到下一页或内容，" + "共查找规则" + infoLength + "个，" + spenTime +
                    "结束运行");
            }

            updateIcon();
        }, timer||0);
    },
    iconClick: function(event){
        if (!event || !event.button) {
            ns.toggle();
        } else if (event.button == 1) {
            ns.loadSetting(true);
        }
    },
    resetSITEINFO: function() {
        if (confirm('reset SITEINFO?'))
            requestSITEINFO();
    },
    toggle: function() {
        if (ns.AUTO_START) {
            ns.AUTO_START = false;
            updateIcon();
        } else {
            ns.AUTO_START = true;
            if (!content.ap){
                ns.launch(content);
                content.ap.scroll();
            }else{
                content.ap.scroll();
                updateIcon();
            }
        }
    },
    checkUrl: function(event){
        var blacklistText = event.target;

        var url = content.location.href;
        if (!url)
            blacklistText.style.color = "";

        var urlValue = wildcardToRegExpStr(blacklistText.value);
        try {
            var regexp = new RegExp(urlValue);

            if (regexp.test(url))
                blacklistText.style.color = "green";
            else
                blacklistText.style.color = "red";
        } catch (e) {
            blacklistText.style.color = "red";
        }
    },
    blacklistBtnClick: function(event){
        var textbox = $("uAutoPagerize-blacklist-textbox");
        var oldvalue = textbox.getAttribute("oldvalue");
        var newValue = textbox.value.trim();

        if(oldvalue){
            var index = ns.EXCLUDE.indexOf(oldvalue);
            if(index == -1) return;

            if(!newValue || newValue == "**"){  // remove
                ns.EXCLUDE.splice(index, 1);
            }else{  // modified
                ns.EXCLUDE[index] = newValue;
            }

            ns.EXCLUDE = ns.EXCLUDE;  // 重新赋值，刷新 EXCLUDE_REGEXP

            ns.launch(content);
        }else{  // add
            if(!newValue || newValue == "**") return;

            ns.EXCLUDE.push(newValue);
            ns.EXCLUDE = ns.EXCLUDE;

            if(content.ap){
                content.ap.destroy(true);
                updateIcon("排除列表, " + newValue);
            }
        }

        $('uAutoPagerize-popup').hidePopup();
    },
    getInfo: function (list, win) {
        if (!list) list = ns.MY_SITEINFO.concat(ns.SITEINFO_CN, ns.SITEINFO);
        if (!win)  win  = content;
        var doc = win.document;
        var locationHref = doc.location.href;
        for (let [index, info] in Iterator(list)) {
            try {
                var exp = info.url_regexp || Object.defineProperty(info, "url_regexp", {
                        enumerable: false,
                        value: toRE(info.url)
                    }).url_regexp;
                if ( !exp.test(locationHref) ) continue;

                if (info.url.length > 12)
                    debug("  匹配地址的规则：[" + (info.type || "") + "]" + "第" + (index + 1) + "个");

                var nextLink = getElementMix(info.nextLink, doc);
                if (!nextLink) {
                    // FIXME microformats case detection.
                    // limiting greater than 12 to filter microformats like SITEINFOs.
                    if (info.url.length > 12)
                        debug('  nextLink not found.', String(info.nextLink));
                    continue;
                }

                var pageElement = getElementMix(info.pageElement, doc);
                if (!pageElement) {
                    if (info.url.length > 12 || (typeof(info.url) !='string'))
                        debug('  pageElement not found.', info.pageElement);
                    continue;
                }
                return [index, info, nextLink, pageElement];
            } catch(e) {
                log('error at launchAutoPager() : ' + e);
            }
        }
        return [-1, null];
    },
    getInfoFromURL: function (url, list) {
        if (!url) url = content.location.href;
        var list = ns.MY_SITEINFO.concat(ns.SITEINFO_CN, ns.SITEINFO);
        return list.filter(function(info, index, array) {
            try {
                var exp = info.url_regexp || Object.defineProperty(info, "url_regexp", {
                        enumerable: false,
                        value: toRE(info.url)
                    }).url_regexp;
                return exp.test(url);
            } catch(e){ }
        });
    },
    edit: function(aFile) {
        if (!aFile || !aFile.exists() || !aFile.isFile()) return;
        var editor = Services.prefs.getCharPref("view_source.editor.path");
        if (!editor) {
            alert("编辑器的路径未设定。\n 请设置 view_source.editor.path");
            return;
        }

        try {
            var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
            UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0? "gbk": "UTF-8";
            var path = UI.ConvertFromUnicode(aFile.path);
            exec(editor, path);
        } catch (e) {}
    },
    immediatelyStart: function(){
        var pages = $("uAutoPagerize-immedialate-pages").value;

        pages = pages || ns.IMMEDIATELY_PAGER_NUM;

        if(content.ap){
            content.ap.loadImmediately(pages);
        }
    },
    showForcePageMenu: function(event){
        var menu = $("uAutoPagerize-force_nextpage");
        var reset = function(){
            menu.setAttribute("disabled", "true");
            menu.setAttribute("checked", "false");
        };

        if(!content.location.href.startsWith("http"))
            return reset();

        var localStorage = content.localStorage;
        if(!localStorage)
            return reset();

        var isForce = localStorage.ap_force_nextpage;
        if(isForce){
            menu.setAttribute("disabled", "false");
            menu.setAttribute("checked", "true");
        }else{
            if(content.ap)
                return reset();

            // 从未检测过
            if(typeof content.ap_nextLink == 'undefined'){
                content.ap_nextLink = autoGetLink(content.document);
            }

            if(content.ap_nextLink){
                menu.setAttribute("disabled", "false");
                menu.setAttribute("checked", "false");
            }else{
                reset();
            }
        }
    },
    forcePageToggle: function(event){
        var forcePageMenu = $("uAutoPagerize-force_nextpage");

        if(content.localStorage.ap_force_nextpage){
            content.localStorage.removeItem("ap_force_nextpage");
            forcePageMenu.setAttribute("checked", "false");

            if(content.ap)
                content.ap.destroy(true);
        }else{
            content.localStorage.ap_force_nextpage = true;
            forcePageMenu.setAttribute("checked", "true");

            if(content.ap)
                content.ap.destroy(true);
            if (content.AutoPagerize && content.AutoPagerize.launchAutoPager)
                content.AutoPagerize.launchAutoPager([FORCE_SITEINFO]);
        }
    },
    search: function(){
        var keyword = encodeURIComponent(content.location.href);
        gBrowser.selectedTab = gBrowser.addTab('http://ap.teesoft.info/?exp=0&url=' + keyword);
    },
    gototop: function(win){
        if(!win) win = content;
        win.scroll(win.scrollX, 0);
    },
    gotobottom: function(win){
        if(!win) win = content;
        var doc = win.document;
        win.scroll(win.scrollX, Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight));
    },
    gotoprev: function(win, sepSelector, insertPoint){
        if(!win)
            win = content;
        if(!sepSelector)
            sepSelector = ".autopagerize_link";
        if(!insertPoint && win.ap)
            insertPoint = win.ap.insertPoint.parentNode;

        var [preDS, , divS] = ns.getSeparators(win, sepSelector, insertPoint);
        divS = divS || 0;
        if(SEPARATOR_RELATIVELY){
            preDS = win.scrollY - (divS - preDS);
        }else{
            preDS += win.scrollY - 6;
        }

        win.scroll(win.scrollY, preDS);
    },
    gotonext: function(win, sepSelector, insertPoint){
        if(!win)
            win = content;
        if(!sepSelector)
            sepSelector = ".autopagerize_link";
        if(!insertPoint && win.ap)
            insertPoint = win.ap.insertPoint.parentNode;

        var [, nextDS, divS] = this.getSeparators(win, sepSelector, insertPoint);
        divS = divS || 0;
        if(SEPARATOR_RELATIVELY){
            nextDS = win.scrollY + (-divS + nextDS);
        }else{
            nextDS += win.scrollY - 6;
        }

        win.scroll(win.scrollY, nextDS);
    },
    // 找到窗口视野内前后2个分隔条的位置
    getSeparators: function(win, separatorSelector, insertPoint){
        var doc = win.document;
        if(!insertPoint)
            insertPoint = doc.documentElement;

        var separators = doc.querySelectorAll(separatorSelector);
        var insData = insertPoint.getBoundingClientRect();
        var viewportHeight = win.innerHeight;

        // 得到一个数组
        var heightArr = [insData.top];
        for (var i = 0; i < separators.length; i++) {
            heightArr.push(separators[i].getBoundingClientRect().top);
        }
        if(insData.bottom > viewportHeight)
            heightArr.push(insData.bottom);
        else
            heightArr.push(viewportHeight + 1);

        // 查找
        for (var i = 0; i < heightArr.length; i++) {
            if(heightArr[i] > viewportHeight){
                if(heightArr[i - 1] > 0){
                    return [heightArr[i - 2], heightArr[i], heightArr[i - 1]];
                }else{
                    return [heightArr[i - 1], heightArr[i]];
                }
            }
        }

        return [];
    },
    autoGetLink: autoGetLink,
    getElementMix: getElementMix,
};


// Class
function AutoPager(doc, info, nextLink) {
    this.init.apply(this, arguments);
};
AutoPager.prototype = {
    req: null,
    pageNum: 1,
    _state: 'disable',
    remove: [],
    get state() this._state,
    set state(state) {
        if (this.state !== "terminated" && this.state !== "error") {
            if (state === "disable") {
                this.abort();
            }
            else if (state === "terminated" && state === "error") {
                this.removeListener();
            }
            if (this.state !== "loading" && state !== "loading" || this.isFrame) {
                Array.forEach(this.doc.getElementsByClassName('autopagerize_icon'), function(e) {
                    e.style.backgroundColor = COLOR[state];
                    e.setAttribute("state", state);
                });
            }
            this._state = state;
            updateIcon();
        }
        return state;
    },
    init: function(doc, info, nextLink) {
        this.doc = doc;
        this.win = doc.defaultView;
        this.documentElement = doc.documentElement;
        this.body = doc.body;
        this.isXML = this.doc.contentType.indexOf('xml') > 0;
        this.isFrame = this.win.top != this.win;
        this.info = {};
        for (let [key, val] in Iterator(info)) {
            this.info[key] = val;
        }

        this.iframeMode = USE_IFRAME && this.info.useiframe;

        var url = this.getNextURL(nextLink ? nextLink : this.doc);
        if ( !url ) {
            debug("getNextURL returns null", this.info.nextLink);
            return;
        }

        this.setInsertPoint();
        if (!this.insertPoint) {
            debug("insertPoint not found", this.info.pageElement);
            return;
        }
        this.setRemainHeight();

        if (this.isFrame)
            this.initIcon();

        this.requestURL = url;
        this.loadedURLs = {};
        this.loadedURLs[doc.location.href] = true;

        this.state = "enable";
        this.win.addEventListener("pagehide", this, false);
        this.addListener();

        if (!ns.SCROLL_ONLY){
            this.scroll();
        }

        if (this.getScrollHeight() == this.win.innerHeight)
            this.body.style.minHeight = (this.win.innerHeight + 1) + 'px';

        // 第一次提前预读
        if (PRE_REQUEST_NEXT_PAGE) {
            this.doRequest();
        }
    },
    destroy: function(isRemoveAddPage) {
        this.state = "disable";
        this.win.removeEventListener("pagehide", this, false);
        this.removeListener();
        this.abort();

        if (isRemoveAddPage) {
            var separator = this.doc.querySelector('.autopagerize_page_separator, .autopagerize_page_info');
            if (separator) {
                var range = this.doc.createRange();
                range.setStartBefore(separator);
                range.setEndBefore(this.insertPoint);
                range.deleteContents();
                range.detach();
            }
            var style = this.doc.getElementById("uAutoPagerize-style");
            if (style)
                style.parentNode.removeChild(style);

            if(this.separatorStyle)
                this.separatorStyle.parentNode.removeChild(this.separatorStyle);
        }

        this.tmpDoc = null;

        this.win.ap = null;
        updateIcon();
    },
    addListener: function() {
        this.win.addEventListener("scroll", this, false);
        this.doc.addEventListener("AutoPagerizeToggleRequest", this, false);
        this.doc.addEventListener("AutoPagerizeEnableRequest", this, false);
        this.doc.addEventListener("AutoPagerizeDisableRequest", this, false);
    },
    removeListener: function() {
        this.win.removeEventListener("scroll", this, false);
        this.doc.removeEventListener("AutoPagerizeToggleRequest", this, false);
        this.doc.removeEventListener("AutoPagerizeEnableRequest", this, false);
        this.doc.removeEventListener("AutoPagerizeDisableRequest", this, false);
    },
    handleEvent: function(event) {
        switch(event.type) {
            case "scroll":
                if (this.timer)
                    this.win.clearTimeout(this.timer);
                this.timer = this.win.setTimeout(function(){
                    this.scroll();
                    this.timer = null;
                }.bind(this), 100);
                break;
            case "pagehide":
                this.abort();
                break;
            case "AutoPagerizeToggleRequest":
                this.stateToggle();
                break;
            case "AutoPagerizeEnableRequest":
                this.state = "enable";
                break;
            case "AutoPagerizeDisableRequest":
                this.state = "disable";
                break;
        }
    },
    stateToggle: function() {
        this.state = this.state == 'disable'? 'enable' : 'disable';
    },
    tmpDoc: null,
    scroll : function(){
        if (this.state !== 'enable' || !ns.AUTO_START) return;
        var remain = this.getScrollHeight() - this.win.innerHeight - this.win.scrollY;
        if (remain < this.remainHeight || this.ipagesMode) {
            if(this.tmpDoc){
                this.loaded(this.tmpDoc);
            }else{
                this.doRequest();
            }
        }
    },
    abort: function() {
        if (this.req) {
            this.req.abort();
            this.req = null;
        }
    },
    isThridParty: function(aHost, bHost) {
        try {
            var aTLD = Services.eTLD.getBaseDomainFromHost(aHost);
            var bTLD = Services.eTLD.getBaseDomainFromHost(bHost);
            return aTLD === bTLD;
        } catch (e) {
            return aHost === bHost;
        }
    },
    doRequest: function(){
        if (this.state !== 'enable' || !this.requestURL || this.loadedURLs[this.requestURL]) return;

        // 最大页数自动停止
        if(MAX_PAGER_NUM > 0 && this.pageNum > (MAX_PAGER_NUM - 1)){
            this.addEndSeparator();
            return;
        }

        var [reqScheme,,reqHost] = this.requestURL.split('/');
        var {protocol, host} = this.win.location;
        if (reqScheme !== protocol) {
            log(protocol + " が " + reqScheme + "にリクエストを送ることはできません");
            this.state = "error";
            return;
        }
        var isSameDomain = reqHost == host;
        if (!isSameDomain && !this.isThridParty(host, reqHost)) {
            log(host + " が " + reqHost + "にリクエストを送ることはできません");
            this.state = 'error';
            return;
        }
        this.lastRequestURL = this.requestURL;

        if(this.iframeMode){
            this.win.setTimeout(function(self){  // 延时点
                self.iframeRequest.apply(self, null);
            }, 199, this);
        }else{
            this.httpRequest(isSameDomain, reqHost, reqScheme);
        }
    },
    httpRequest: function(isSameDomain, reqHost, reqScheme){
        debug("Http Request: " + this.requestURL);

        var self = this;
        var headers = {};
        if (isSameDomain)
            headers.Cookie = getCookie(reqHost, reqScheme === 'https');
        var opt = {
            method: 'get',
            get url() self.requestURL,
            set url(url) self.requestURL = url,
            headers: headers,
            overrideMimeType: 'text/html; charset=' + self.doc.characterSet,
            onerror: function(){ self.state = 'error'; self.req = null; },
            onload: function(res) { self.httpLoad.apply(self, [res]); self.req = null; }
        };
        if(!this.isXML){
            opt.responseType = "document";
        }
        this.win.requestFilters.forEach(function(i) { i(opt) }, this);
        this.state = 'loading';
        this.req = GM_xmlhttpRequest(opt);
    },
    iframeRequest: function(){
        debug("iframe Request: " + this.requestURL);
        var self = this;
        this.state = 'loading';

        var browser = gBrowser.getBrowserForDocument(this.doc);
        var iframe = browser.uAutoPagerizeIframe;
        if(!iframe){
            iframe = browser.uAutoPagerizeIframe = createIframe("uAutoPagerize-iframe");
        }

        //两个地址都要改?mdc是按照第二个写的,真正有效的也是第二个,第一个是以后用来比较用的
        iframe.src = this.requestURL;
        iframe.contentDocument.location.href = this.requestURL;

        function onload(event){
            var doc = event.originalTarget;
            if (doc.location.href == "about:blank" || doc.defaultView.frameElement)
                return;

            iframe.removeEventListener(event.type, onload, true);
            self.iframeLoad.apply(self, [doc]);
        }

        if(this.info.iloaded){
            iframe.addEventListener("load", onload, true);
        }else{
            iframe.addEventListener("DOMContentLoaded", onload, true);
        }
    },
    httpLoad : function(res){
        var before = res.URI.host;
        var after  = res.originalURI.host;
        if (before != after && !this.isThridParty(before, after)) {
            log(before + " 被重新定向到 " + after);
            this.state = 'error';
            return;
        }
        delete res.URI;
        delete res.originalURI;

        this.win.responseFilters.forEach(function(i) { i(res, this.requestURL) }, this);
        if (res.finalUrl)
            this.requestURL = res.finalUrl;

        var htmlDoc;
        if (this.isXML) {
            var str = res.responseText;
            htmlDoc = new DOMParser().parseFromString(str, "application/xml");
        } else {
            htmlDoc = res.response;
        }
        this.win.documentFilters.forEach(function(i) { i(htmlDoc, this.requestURL, this.info) }, this);

        this.beforeLoaded(htmlDoc);
    },
    iframeLoad: function (htmlDoc) {
        let win = htmlDoc.defaultView;
        win.scroll(win.scrollX, 99999);  //滚动到底部,针对,某些使用滚动事件加载图片的网站.

        this.beforeLoaded(htmlDoc);
    },
    beforeLoaded: function(htmlDoc){
        if(PRE_REQUEST_NEXT_PAGE && !this.ipagesMode){
            this.tmpDoc = htmlDoc;
            this.scroll();
            this.state = 'enable';
        }else{
            this.loaded(htmlDoc);
        }
    },
    loaded: function(htmlDoc){
        try {
            var page = getElementsMix(this.info.pageElement, htmlDoc);
            var url = this.getNextURL(htmlDoc);
        }
        catch(e){
            debug("  Get page and url Error: ", e);
            this.state = 'error';
            return;
        }

        if (!page || page.length < 1 ) {
            debug('  pageElement not found.', this.info.pageElement);
            this.state = 'terminated';
            return;
        }

        if (this.loadedURLs[this.requestURL]) {
            debug('  page is already loaded.', this.requestURL, this.info.nextLink);
            this.state = 'terminated';
            return;
        }

        if (typeof this.win.ap == 'undefined') {
            this.win.ap = { state: 'enabled' };
            updateIcon();
        }
        this.loadedURLs[this.requestURL] = true;
        if (this.insertPoint.compareDocumentPosition(this.doc) >= 32) {
            this.setInsertPoint();
            if (!this.insertPoint) {
                debug("  insertPoint not found.", this.info.pageElement);
                this.state = 'terminated';
                return;
            }
            this.setRemainHeight();
        }
        page = this.addPage(htmlDoc, page);
        this.win.filters.forEach(function(i) { i(page) });
        this.requestURL = url;
        this.state = 'enable';
        // if (!ns.SCROLL_ONLY)
        //  this.scroll();
        if (!url) {
            debug('  nextLink not found.', this.info.nextLink);
            this.state = 'terminated';
        }

        var ev = this.doc.createEvent('Event');
        ev.initEvent('GM_AutoPagerizeNextPageLoaded', true, false);
        this.doc.dispatchEvent(ev);

        this.afterLoaded();
    },
    afterLoaded: function(){
        this.tmpDoc = null;

        // 立即加载n页
        this.ipaged += 1;
        if(this.ipagesMode && this.ipaged >= this.ipagesNumber){
            this.ipagesMode = false;
        }

        if(this.ipagesMode || PRE_REQUEST_NEXT_PAGE){
            this.doRequest();
        }
    },
    addPage : function(htmlDoc, page, separatorHTML){
        var fragment = this.doc.createDocumentFragment();
        page.forEach(function(i) { fragment.appendChild(i); });
        this.win.fragmentFilters.forEach(function(i) { i(fragment, htmlDoc, page) }, this);

        //收集所有图片
        var imgs;
        if (this.iframeMode && !this.ipagesMode) {
            imgs = getElementsMix('css;img[src]', fragment);
        }

        if (this.info.wrap) {
            var div = this.doc.createElement("div");
            div.setAttribute("class", "uAutoPagerize-wrapper");
            div.appendChild(fragment);
            fragment = this.doc.createDocumentFragment();
            fragment.appendChild(div);
        }

        var hr;
        if(SIMPLE_SEPARATOR || SEPARATOR_HR){
            hr = this.doc.createElement('hr');
            hr.setAttribute('class', 'autopagerize_page_separator');
            hr.setAttribute('style', 'clear: both;');
        }

        var p = this.createSeparator(separatorHTML);

        var insertParent = this.insertPoint.parentNode;
        if (page[0] && page[0].tagName == 'TR') {
            var colNodes = getElementsMix('child::tr[1]/child::*[self::td or self::th]', insertParent);
            var colums = 0;
            for (var i = 0, l = colNodes.length; i < l; i++) {
                var col = colNodes[i].getAttribute('colspan');
                colums += parseInt(col, 10) || 1;
            }
            var td = this.doc.createElement('td');
            if(hr) td.appendChild(hr);
            td.appendChild(p);
            var tr = this.doc.createElement('tr');
            td.setAttribute('colspan', colums);
            tr.appendChild(td);
            fragment.insertBefore(tr, fragment.firstChild);
        } else {
            fragment.insertBefore(p, fragment.firstChild);
            if(hr) fragment.insertBefore(hr, fragment.firstChild);
        }

        insertParent.insertBefore(fragment, this.insertPoint);

        if (imgs) {   // 非opera,在iframeDOM取出数据时需要重载图片.
            this.win.setTimeout(function() {
                var _imgs = imgs;
                var i, ii, img;
                for (i = 0, ii = _imgs.length; i < ii; i++) {
                    img = _imgs[i];
                    var src = img.src;
                    img.src = src;
                };
            }, 99);
        }

        return page.map(function(pe) {
            var ev = this.doc.createEvent('MutationEvent');
            ev.initMutationEvent('AutoPagerize_DOMNodeInserted', true, false,
                                 insertParent, null,
                                 this.requestURL, null, null);
            pe.dispatchEvent(ev);
            return pe;
        }, this);
    },
    createSeparator: function(separatorHTML){
        var self = this;

        // 添加分割条样式
        if(!SIMPLE_SEPARATOR && !this.separatorStyle){
            this.separatorStyle = this.addStyle(sep_style);
        }

        var sNextLink = separatorHTML ? separatorHTML : '第 ' +
            (SIMPLE_SEPARATOR ? '' : '<font color="red">') + (++this.pageNum) +
            (SIMPLE_SEPARATOR ? '' : '</font>') + ' 页 ';
        var sRalativePage = SIMPLE_SEPARATOR ? "" : this.getRalativePageStr();

        var p  = this.doc.createElement('div');
        p.setAttribute('class', 'autopagerize_page_info');
        p.innerHTML = '<a class="autopagerize_link" target="_blank" href="' + this.requestURL.replace(/&/g, '&amp;') +
             '">' + sNextLink + sRalativePage + ' </a> ';

        if (!this.isFrame) {
            var o = p.insertBefore(this.doc.createElement('div'), p.firstChild);
            o.setAttribute('class', 'autopagerize_icon');
            o.setAttribute('state', 'enable');
            o.setAttribute('title', "点击启用禁用");
            o.style.cssText = [
                'background: ', COLOR['enable'], ';'
                ,'width: .8em;'
                ,'height: .8em;'
                ,'padding: 0px;'
                ,'margin: 0px .4em 0px 0px;'
                ,'display: inline-block;'
                ,'vertical-align: middle;'
            ].join('');
            o.addEventListener('click', function(){
                self.stateToggle();
            }, false);

            if(SIMPLE_SEPARATOR || separatorHTML){
                return p;
            }

            // 滚到顶部，2层结构
            var a = p.appendChild($C("a", {
                title: "滚到顶部",
                href: "javascript:void(0)"
            }, this.doc));

            var i = a.appendChild($C("img", {
                class: "ap-sp-gotop",
                src: sep_icons.top,
            }, this.doc));

            i.addEventListener('click', function(){
                ns.gototop(self.win);
            }, false);

            // 上滚一页
            a = p.appendChild($C("a", {
                title: "上滚一页",
                href: "javascript:void(0)"
            }, this.doc));

            i = a.appendChild($C("img", {
                class: "ap-sp-gopre",
                src: sep_icons.up,
            }, this.doc));

            i.addEventListener('click', function(){
                ns.gotoprev(self.win, null, self.insertPoint.parentNode);
            }, false);

            // 下滚一页
            a = p.appendChild($C("a", {
                title: "下滚一页",
                href: "javascript:void(0)"
            }, this.doc));

            i = a.appendChild($C("img", {
                class: "ap-sp-gonext",
                src: sep_icons.down,
            }, this.doc));

            i.addEventListener('click', function(){
                ns.gotonext(self.win, null, self.insertPoint.parentNode);
            }, false);

            // 滚到底部
            a = p.appendChild($C("a", {
                title: "滚到底部",
                href: "javascript:void(0)"
            }, this.doc));

            i = a.appendChild($C("img", {
                class: "ap-sp-gobottom",
                src: sep_icons.bottom,
            }, this.doc));

            i.addEventListener('click', function(){
                ns.gotobottom(self.win);
            }, false);

            // 立即加载
            var slink = p.appendChild($C("a", {
                title: "点击后立即翻指定的页数",
                href: "javascript:void(0)"
            }, this.doc));
            slink.innerHTML = "立即翻";
            // 输入框
            var input = p.appendChild($C("input",{
                type: "number",
                title: "连续翻页的数量",
                value: IMMEDIATELY_PAGER_NUM,
                min: "1",
                size: "1"
            }, this.doc));

            function getInputValue() {
                var value = Number(input.value);
                if (isNaN(value) || value < 1) {
                    value = 1;
                    input.value = 1;
                }
                return value;
            }

            function spage(){
                var value = getInputValue();
                ns.IMMEDIATELY_PAGER_NUM = value;
                self.loadImmediately(value);
            }

            slink.addEventListener("click", function(event){
                spage();
            }, false);

            input.addEventListener("keyup", function(event){
                if(event.keyCode == 13)
                    spage();
            }, false);

            var span = p.appendChild($C("span", {
                class: "ap-sp-end-span"
            }, this.doc));
            span.innerHTML = "页";
        }

        return p;
    },
    addEndSeparator: function(){
        // debug('page number > :', this.pageNum,  MAX_PAGER_NUM );
        var html = "已达到设置的最大自动翻页数，点击进入下一页";

        var fragment = this.doc.createDocumentFragment();
        var page = this.doc.createElement('div');

        this.addPage(fragment, [page], html);

        this.state = 'terminated';
    },
    // By lastDream2013
    getRalativePageStr : function () {
        var lastUrl = this.lastRequestURL,
            CurrentUrl = this.requestURL,
            NextUrl = this.nextLink && this.nextLink.href;

        let getRalativePageNumArray = function (lasturl, url) {
            if (!lasturl || !url) {
                return [0, 0];
            }

            var lasturlarray = lasturl.split(/-|\.|\&|\/|=|#/);
            var urlarray = url.split(/-|\.|\&|\/|=|#/);
            while (urlarray.length != 0) {
                let url_info = urlarray.pop(),
                lasturl_info = lasturlarray.pop();
                if (url_info != lasturl_info) {
                    if (/[0-9]+/.test(lasturl_info) && /[0-9]+/.test(url_info))
                        return [parseInt(lasturl_info), parseInt(url_info)];
                }
            }
            return [0, 0];
        };
        //论坛和搜索引擎网页显示实际页面信息
        var ralativePageNumarray = [];
        if (NextUrl) {
            ralativePageNumarray = getRalativePageNumArray(CurrentUrl, NextUrl);
        } else {
            ralativePageNumarray = getRalativePageNumArray(lastUrl, CurrentUrl);
            var ralativeOff = ralativePageNumarray[1] - ralativePageNumarray[0]; //用的上一页的相对信息比较的，要补充差值……
            ralativePageNumarray[1] = ralativePageNumarray[1] + ralativeOff;
            ralativePageNumarray[0] = ralativePageNumarray[0] + ralativeOff;
        }

        var realPageSiteMatch = false;
        var ralativeOff = ralativePageNumarray[1] - ralativePageNumarray[0];
        //上一页与下一页差值为1，并最大数值不超过10000(一般论坛也不会超过这么多页……)
        if (ralativeOff === 1 && ralativePageNumarray[1] < 10000) {
            realPageSiteMatch = true;
        }
        //上一页与下一页差值不为1，但上一页与下一页差值能被上一页与下一面所整除的，有规律的页面
        if (!realPageSiteMatch && ralativeOff !== 1) {
            if ((ralativePageNumarray[1] % ralativeOff) == 0 && (ralativePageNumarray[0] % ralativeOff) == 0) {
                realPageSiteMatch = true;
            }
        }

        if (!realPageSiteMatch) { //不满足以上条件，再根据地址特征来匹配
            for (let sitePattern of REALPAGE_SITE_PATTERN) {
                if (CurrentUrl.toLocaleLowerCase().indexOf(sitePattern) >= 0) {
                    realPageSiteMatch = true;
                    break;
                }
            }
        }

        if (realPageSiteMatch) { //如果匹配就显示实际网页信息
            if (ralativePageNumarray[1] - ralativePageNumarray[0] > 1) //一般是搜索引擎的第xx - xx项……
            {
                var ralativePageStr = ' [ 实际：第 <font color="red">' + ralativePageNumarray[0] + ' - ' + ralativePageNumarray[1] + '</font> 项 ]';
            } else if ((ralativePageNumarray[1] - ralativePageNumarray[0]) == 1) //一般的翻页数，差值应该是1
            {
                var ralativePageStr = ' [ 实际：第 <font color="red">' + ralativePageNumarray[0] + '</font> 页 ]';
            } else if ((ralativePageNumarray[0] == 0 && ralativePageNumarray[1]) == 0) //找不到的话……
            {
                var ralativePageStr = ' [ 实际网页结束 ]';
            }
        } else {
            ralativePageStr = '';
        }
        return ralativePageStr;
    },
    ipagesMode: false,
    ipaged: 0,
    ipagesNumber: 0,
    loadImmediately: function(num){
        num = parseInt(num, 10);
        if(num <= 0) return;

        debug("准备立即载入" + num + "页");

        this.ipagesMode = true;
        this.ipaged = 0;
        this.ipagesNumber = num;

        this.scroll();
    },
    getNextURL : function(doc) {
        var nextLink = doc instanceof HTMLElement ?
            doc :
            getElementMix(this.info.nextLink, doc);
        if (nextLink) {
            var nextValue = nextLink.getAttribute('href') ||
                nextLink.getAttribute('action') || nextLink.value;

            if (nextValue && nextValue.indexOf('http') != 0) {
                var anc = this.doc.createElement('a');
                anc.setAttribute('href', nextValue);
                nextValue = anc.href;
                anc = null;
            }
            this.nextLink = nextLink;
            return nextValue;
        }else{
            this.nextLink = null;
        }
    },
    getPageElementsBottom : function() {
        try {
            var elem = getElementsMix(this.info.pageElement, this.doc).pop();
            return getElementBottom(elem);
        }
        catch(e) {}
    },
    getScrollHeight: function() {
        return Math.max(this.documentElement.scrollHeight, this.body.scrollHeight);
    },
    setInsertPoint: function() {
        var insertPoint = null;
        if (this.info.insertBefore) {
            insertPoint = getElementMix(this.info.insertBefore, this.doc);
        }
        if (!insertPoint) {
            var lastPageElement = getElementsMix(this.info.pageElement, this.doc).pop();
            if (lastPageElement) {
                insertPoint = lastPageElement.nextSibling ||
                    lastPageElement.parentNode.appendChild(this.doc.createTextNode(' '));
            }
            lastPageElement = null;
        }
        this.insertPoint = insertPoint;
    },
    setRemainHeight: function() {
        // fix force next page
        if(this.win.localStorage.ap_force_nextpage){
            this.remainHeight = ns.BASE_REMAIN_HEIGHT;
            return;
        }

        var scrollHeight = this.getScrollHeight();
        var bottom = getElementPosition(this.insertPoint).top ||
            this.getPageElementsBottom() || Math.round(scrollHeight * 0.8);
        this.remainHeight = scrollHeight - bottom + ns.BASE_REMAIN_HEIGHT;

        return this.remainHeight;
    },
    initIcon: function() {
        var div = this.doc.createElement("div");
        div.setAttribute('id', 'autopagerize_icon');
        div.setAttribute('class', 'autopagerize_icon');
        div.setAttribute('state', this.state);
        div.style.cssText = [
            'font-size: 12px;'
            ,'position: fixed;'
            ,'z-index: 9999;'
            ,'top: 3px;'
            ,'right: 3px;'
            ,'width: 10px;'
            ,'height: 10px;'
            ,'border: 1px inset #999;'
            ,'padding: 0px;'
            ,'margin: 0px;'
            ,'color: #fff;'
            ,'background: ' + COLOR[this.state]
        ].join(" ");
        this.icon = this.body.appendChild(div);
        this.icon.addEventListener('click', this, false);
    },
    addStyle: function(css) {
        var heads = this.doc.getElementsByTagName('head');
        if (heads.length > 0) {
            var node = this.doc.createElement('style');
            node.type = 'text/css';
            node.innerHTML = css;
            heads[0].appendChild(node);
        }
    }
};

var stateTooltip = {
    "off": "自动翻页已关闭",
    "terminated": "自动翻页已结束",
    "enable": "自动翻页已启用",
    "disable": "此页面不支持自动翻页",
    "error": "自动翻页有错误",
    "loading": "自动翻页进行中"
};

function updateIcon(tooltiptext){
    var newState = "";

    if (ns.AUTO_START == false) {
        newState = "off";
    } else {
        if (content.ap) {
            newState = content.ap.state;
        } else {
            newState = "disable";
        }
    }
    ns.icon.setAttribute('state', newState);
    ns.icon.setAttribute('tooltiptext', tooltiptext || stateTooltip[newState]);
    $("uAutoPagerize-AUTOSTART").setAttribute("checked", ns.AUTO_START);
}

function launchAutoPager_org(list, win) {
    try {
        var doc = win.document;
        var locationHref = win.location.href;
    } catch(e) {
        return;
    }
    list.some(function(info, index, array) {
        try {
            var exp = new RegExp(info.url);
            if (win.ap) {
            } else if ( ! exp.test(locationHref) ) {
            } else if (!getElementMix(info.nextLink, doc)) {
                // ignore microformats case.
                if (!exp.test('http://a'))
                    debug('nextLink not found. launchAutoPager_org(). ', info.nextLink);
            } else if (!getElementMix(info.pageElement, doc)) {
                if (!exp.test('http://a'))
                    debug('pageElement not found.', info.pageElement);
            } else {
                win.ap = new AutoPager(doc, info);
                return true;
            }
        } catch(e) {
            log('error at launchAutoPager() : ' + e);
        }
    });
    updateIcon();
}

// 获取更新 Super_preloader.db
(function(){

    ns.requestSITEINFO_CN = requestSITEINFO_CN;

    ns.resetSITEINFO_CN = function(){
        if (confirm('确定要重置 Super_preloader 及其它规则吗？'))
            requestSITEINFO_CN(SITEINFO_CN_IMPORT_URLS);
    };

    ns.loadSetting_CN = function(isAlert) {
        var data = loadText(ns.file_cn);
        if (!data) return false;
        var sandbox = new Cu.Sandbox( new XPCNativeWrapper(window) );
        sandbox.SITEINFO = [];
        sandbox.SITEINFO_TP = [];

        try {
            Cu.evalInSandbox(data, sandbox, '1.8');
        } catch (e) {
            return log('load error.', e);
        }

        var list = [];
        // 加上 MY_SITEINFO
        for(var i = 0, l = SITEINFO_CN_IMPORT_URLS.length; i < l; i++){
            let mSiteInfo = sandbox["MY_SITEINFO_" + i];
            if(mSiteInfo){
                mSiteInfo.forEach(function(i){
                    i.type = 'cn';
                });
                list = list.concat(mSiteInfo);
            }
        }

        // 加上 Super_preloader
        sandbox.SITEINFO = sandbox.SITEINFO.concat(sandbox.SITEINFO_TP);
        for(let [index, info] in Iterator(sandbox.SITEINFO)){
            list.push({
                url: info.url,
                nextLink: info.nextLink,
                pageElement: info.autopager.pageElement,
                useiframe: info.autopager.useiframe,
                name: info.siteName || '',
                exampleUrl: info.siteExample || '',
                type: "sp"
            });
        }

        ns.SITEINFO_CN = list;

        debug("Super_preloader 及其它规则已经载入")

        if (isAlert)
            alerts('uAutoPagerize', '中文规则已经重新载入');

        return true;
    };

    var finishCount = 0;
    var dataStr = "";

    function requestSITEINFO_CN(){
        finishCount = 0;
        dataStr = "";
        // debug(" request Super_preloader.db");
        var xhrStates = {};
        SITEINFO_CN_IMPORT_URLS.forEach(function(i) {
            var opt = {
                method: 'get',
                url: i,
                overrideMimeType: "text/plan; charset=utf-8;",
                onload: function(res) {
                    xhrStates[i] = 'loaded';
                    getCacheCallback_CN(res, i);
                },
                onerror: function(res) {
                    xhrStates[i] = 'error';
                    getCacheErrorCallback(i);
                },
            }
            xhrStates[i] = 'start';
            GM_xmlhttpRequest(opt);
            setTimeout(function() {
                if (xhrStates[i] == 'start') {
                    getCacheErrorCallback(i);
                }
            }, XHR_TIMEOUT);
        });
    }

    function getCacheCallback_CN(res, url) {
        if (res.status != 200) {
            return getCacheErrorCallback(url);
        }

        var matches = res.responseText.match(/(var SITEINFO=\[[\s\S]*\])[\s\S]*var SITEINFO_comp=/i);
        if(!matches){
            matches = res.responseText.match(/(var MY_SITEINFO\s*=\s*\[[\s\S]*\];)/i);
            if(!matches){
                log("no matches.");
                return;
            }
        }

        dataStr += "\n\n" + matches[1].replace("MY_SITEINFO", "MY_SITEINFO_" + finishCount);
        finishCount += 1;
        if(finishCount >= SITEINFO_CN_IMPORT_URLS.length){
            saveFile(DB_FILENAME_CN, dataStr);
            ns.loadSetting_CN();
            alerts("uAutoPagerize", "中文规则已经更新完毕");
        }

        log('getCacheCallback:' + url);
    }

})();

// 来自 NLF 的 Super_preloader
var SP = {
    nextPageKey: [  //下一页关键字
        '下一页', '下一頁', '下1页', '下1頁', '下页', '下頁',
        '翻页', '翻頁', '翻下頁', '翻下页',
        '下一张', '下一張', '下一幅', '下一章', '下一节', '下一節', '下一篇',
        '后一页', '後一頁',
        '前进', '下篇', '后页', '往后', 'Next', 'Next Page', '次へ'
    ],
    autoMatch: {
        digitalCheck:true,  //对数字连接进行检测,从中找出下一页的链接
        cases:false,  //关键字区分大小写....
        pfwordl:{     //关键字前面的字符限定.
            next:{    //下一页关键字前面的字符
                enable:true,
                maxPrefix:2,
                character:[' ','　','[','［','『','「','【','(']
            }
        },
        sfwordl:{//关键字后面的字符限定.
            next:{//下一页关键字后面的字符
                enable:true,
                maxSubfix: 3,
                character:[' ','　',']','］','>','﹥','›','»','>>','』','」','】',')','→']
            }
        }
    },
    get nextPageKey_reg() {
        if(!SP._nextPageKey_reg){
            SP._nextPageKey_reg = SP.parseKWRE();
        }
        return SP._nextPageKey_reg;
    },
    parseKWRE: function (){
        function modifyPageKey(name,pageKey,pageKeyLength){
            function strMTE(str){
                return (str.replace(/\\/g, '\\\\')
                            .replace(/\+/g, '\\+')
                            .replace(/\./g, '\\.')
                            .replace(/\?/g, '\\?')
                            .replace(/\{/g, '\\{')
                            .replace(/\}/g, '\\}')
                            .replace(/\[/g, '\\[')
                            .replace(/\]/g, '\\]')
                            .replace(/\^/g, '\\^')
                            .replace(/\$/g, '\\$')
                            .replace(/\*/g, '\\*')
                            .replace(/\(/g, '\\(')
                            .replace(/\)/g, '\\)')
                            .replace(/\|/g, '\\|')
                            .replace(/\//g, '\\/'));
            };

            var pfwordl= autoMatch.pfwordl,
                sfwordl = autoMatch.sfwordl;

            var RE_enable_a=pfwordl[name].enable,
                        RE_maxPrefix=pfwordl[name].maxPrefix,
                        RE_character_a=pfwordl[name].character,
                        RE_enable_b=sfwordl[name].enable,
                        RE_maxSubfix=sfwordl[name].maxSubfix,
                        RE_character_b=sfwordl[name].character;
            var plwords,
                        slwords,
                        rep;

            plwords=RE_maxPrefix>0? ('['+(RE_enable_a? strMTE(RE_character_a.join('')) : '.')+']{0,'+RE_maxPrefix+'}') : '';
            plwords='^\\s*' + plwords;
            slwords=RE_maxSubfix>0? ('['+(RE_enable_b? strMTE(RE_character_b.join('')) : '.')+']{0,'+RE_maxSubfix+'}') : '';
            slwords=slwords + '\\s*$';
            rep = autoMatch.cases ? '' : 'i';

            for(var i=0;i<pageKeyLength;i++){
                pageKey[i]=new RegExp(plwords + strMTE(pageKey[i]) + slwords,rep);
            }
            return pageKey;
        }
        //转成正则.
        return modifyPageKey('next', SP.nextPageKey, SP.nextPageKey.length);
    }
};

// doc 必须，后面2个可选
function autoGetLink(doc, win, cplink) {
    win = win || doc.defaultView;

    var startTime = new Date();

    var _nextPageKey = SP.nextPageKey_reg;
    var _nPKL = _nextPageKey.length;
    var _getAllElementsByXpath = getElementsByXPath;
    cplink = cplink || doc.URL || win.location.href;
    var m = cplink.match(/https?:\/\/([^\/]+)/);
    if(!m) return;
    var _domain_port = m[1]; //端口和域名,用来验证是否跨域.
    var alllinks = doc.links;
    var alllinksl = alllinks.length;

    var curLHref = cplink;
    var _nextlink;

    var DCEnable = autoMatch.digitalCheck;
    var DCRE = /^\s*\D{0,1}(\d+)\D{0,1}\s*$/;

    var i, a, ahref, atext, numtext;
    var aP, initSD, searchD = 1,
        preS1, preS2, searchedD, pSNText, preSS, nodeType;
    var nextS1, nextS2, nSNText, nextSS;
    var aimgs, j, jj, aimg_x, xbreak, k, keytext;

    function finalCheck(a, type) {
        var ahref = a.href;

        //3个条件:http协议链接,非跳到当前页面的链接,非跨域
        if (/^https?:/i.test(ahref) && ahref.replace(/#.*$/, '') != curLHref && ahref.match(/https?:\/\/([^\/]+)/)[1] == _domain_port) {
            debug("[autoGetLink] " + (type == 'pre' ? '上一页' : '下一页') + '匹配到的关键字为:', atext);
            return a; //返回对象A
        }
    }

    debug('[autoGetLink] 全文档链接数量：' + alllinksl);

    for (i = 0; i < alllinksl; i++) {
        if (_nextlink) break;
        a = alllinks[i];
        if (!a) continue; //undefined跳过
        atext = a.textContent;
        if (atext) {
            if (DCEnable) {
                numtext = atext.match(DCRE);
                if (numtext) { //是不是纯数字
                    //C.log(numtext);
                    numtext = numtext[1];
                    aP = a;
                    initSD = 0;

                    if (!_nextlink) {
                        preS1 = a.previousSibling;
                        preS2 = a.previousElementSibling;

                        while (!(preS1 || preS2) && initSD < searchD) {
                            aP = aP.parentNode;
                            if (aP) {
                                preS1 = aP.previousSibling;
                                preS2 = aP.previousElementSibling;
                            };
                            initSD++;
                        };
                        searchedD = initSD > 0 ? true : false;

                        if (preS1 || preS2) {
                            pSNText = preS1 ? preS1.textContent.match(DCRE) : '';
                            if (pSNText) {
                                preSS = preS1;
                            } else {
                                pSNText = preS2 ? preS2.textContent.match(DCRE) : '';
                                preSS = preS2;
                            };
                            if (pSNText) {
                                pSNText = pSNText[1];
                                //C.log(pSNText)
                                if (Number(pSNText) == Number(numtext) - 1) {
                                    nodeType = preSS.nodeType;
                                    if (nodeType == 3 || (nodeType == 1 && (searchedD ? _getAllElementsByXpath('./descendant-or-self::a[@href]', preSS, doc).snapshotLength == 0 : (!preSS.hasAttribute('href') || preSS.href == curLHref)))) {
                                        _nextlink = finalCheck(a, 'next');
                                    }
                                    continue;
                                }
                            }
                        }
                    }

                    continue;
                };
            }
        } else {
            atext = a.title;
        }
        if (!atext) {
            aimgs = a.getElementsByTagName('img');
            for (j = 0, jj = aimgs.length; j < jj; j++) {
                aimg_x = aimgs[j];
                atext = aimg_x.alt || aimg_x.title;
                if (atext) break;
            }
        }
        if (!atext) continue;

        if (!_nextlink) {
            xbreak = false;
            for (k = 0; k < _nPKL; k++) {
                keytext = _nextPageKey[k];
                if (!(keytext.test(atext))) continue;
                _nextlink = finalCheck(a, 'next');
                xbreak = true;
                break;
            }
            if (xbreak || _nextlink) continue;
        }
    }

    debug('[autoGetLink] 搜索链接数量：' + i, '，耗时：' + (new Date() - startTime) + '毫秒');

    return _nextlink || null;
}
// 地址栏递增
function hrefInc(obj, doc, win){
    var _cplink = doc._cplink || doc.URL;
    _cplink = _cplink.replace(/#.*$/, ''); //url 去掉hash

    function getHref(href) {
        var mFails = obj.mFails;
        if (!mFails) return href;
        var str;
        if (typeof mFails == 'string') {
            str = mFails;
        } else {
            var fx;
            var array = [];
            var i, ii;
            var mValue;
            for (i = 0, ii = mFails.length; i < ii; i++) {
                fx = mFails[i];
                if (!fx) continue;
                if (typeof fx == 'string') {
                    array.push(fx);
                } else {
                    mValue = href.match(fx);
                    if (!mValue) return href;
                    array.push(mValue);
                };
            };
            var str = array.join('');
        };
        return str;
    }

    var sa = obj.startAfter;
    var saType = typeof sa;
    var index;

    if (saType == 'string') {
        index = _cplink.indexOf(sa);
        if (index == -1) {
            _cplink = getHref(_cplink);
            index = _cplink.indexOf(sa);
            if (index == -1) return;
        }
    } else {
        var tsa = _cplink.match(sa);
        if (!tsa) {
            _cplink = getHref(_cplink);
            sa = (_cplink.match(sa) || [])[0];
            if (!sa) return;
            index = _cplink.indexOf(sa);
            if (index == -1) return;
        } else {
            sa = tsa[0];
            index = _cplink.indexOf(sa);
        }
    }

    index += sa.length;
    var max = obj.max === undefined ? 9999 : obj.max;
    var min = obj.min === undefined ? 1 : obj.min;
    var aStr = _cplink.slice(0, index);
    var bStr = _cplink.slice(index);
    var nbStr = bStr.replace(/^(\d+)(.*)$/, function(a, b, c) {
        b = Number(b) + obj.inc;
        if (b >= max || b < min) return a;
        return b + c;
    });
    if (nbStr !== bStr) {
        var ilresult;
        try {
            ilresult = obj.isLast(doc, win, _cplink);
        } catch (e) {
            // debug("Error: getNextUrl hrefInc().", e);
        }
        if (ilresult) return;
        return aStr + nbStr;
    }
}

function toRE(obj) {
    if (obj instanceof RegExp) {
        return obj;
    } else if (obj instanceof Array) {
        return new RegExp(obj[0], obj[1]);
    } else {
        if (typeof(obj) == 'string' && obj.startsWith("wildc;")){
            obj = wildcardToRegExpStr(obj.slice(6));
        }
        return new RegExp(obj);
    }
}

function createIframe(id) {
    let frame = document.createElement("iframe");
    if (id)
        frame.setAttribute("id", id);
    frame.setAttribute("type", "content");
    //iframe是没有history的
    frame.setAttribute("collapsed", "true");
    //frame.setAttribute('style', 'display: none;');
    //不append就没有webnavigation
    document.documentElement.appendChild(frame);
    frame.webNavigation.allowAuth = false;  // 安全验证
    frame.webNavigation.allowImages = true;
    frame.webNavigation.allowJavascript = true;
    frame.webNavigation.allowMetaRedirects = true;  //重定向之后的文档
    frame.webNavigation.allowPlugins = false;
    frame.webNavigation.allowSubframes = false;  //子窗口,frame,iframe
    return frame;
}

//-------- 来自 Super_preloader, 为了兼容 Super_preloader 数据库 -------------
//获取单个元素,混合。
function getElementMix(selector, doc, win){
    var ret;
    if(!selector) return ret;
    win = win || content.window;
    var type = typeof selector;
    if(type == 'string'){
        if(selector.search(/^css;/i) == 0){
            ret = doc.querySelector(selector.slice(4));
        }else if(selector.toLowerCase() == 'auto;'){
            ret = autoGetLink(doc, win);
            // debug("NextLink is auto. ", content.location.href);
        }else{
            ret= getFirstElementByXPath(selector, doc);
        }
    }else if(type == 'function'){
        ret=selector(doc, win, doc.URL);
    }else if(type == 'undefined'){
        ret = autoGetLink(doc, win);
    }else{
        var url = hrefInc(selector,doc,win);
        if(url){
            ret = doc.createElement('a');
            ret.setAttribute('href', url);
        }
    }
    return ret;
}

function getElementsMix(selector, doc) {
    if(selector.search(/^css;/i)==0){
        return Array.prototype.slice.call(doc.querySelectorAll(selector.slice(4)));
    }else{
        return getElementsByXPath(selector, doc);
    }
}

function getElementsByXPath(xpath, node) {
    var nodesSnapshot = getXPathResult(xpath, node, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
    var data = [];
    for (var i = 0, l = nodesSnapshot.snapshotLength; i < l; i++) {
        data[i] = nodesSnapshot.snapshotItem(i);
    }
    return data;
}

function getFirstElementByXPath(xpath, node) {
    var result = getXPathResult(xpath, node, XPathResult.FIRST_ORDERED_NODE_TYPE);
    return result.singleNodeValue;
}

function getXPathResult(xpath, node, resultType) {
    var doc = node.ownerDocument || node;
    var resolver = doc.createNSResolver(node.documentElement || node);
    var defaultNS = null;

    try {
        defaultNS = (node.nodeType == node.DOCUMENT_NODE) ?
            node.documentElement.lookupNamespaceURI(null):
            node.lookupNamespaceURI(null);
    } catch(e) {}

    if (defaultNS) {
        const defaultPrefix = '__default__';
        try{
            xpath = addDefaultPrefix(xpath, defaultPrefix);
        }catch(e){
            log(xpath);
        }

        var defaultResolver = resolver;
        resolver = function (prefix) {
            return (prefix == defaultPrefix)
                ? defaultNS : defaultResolver.lookupNamespaceURI(prefix);
        }
    }
    return doc.evaluate(xpath, node, resolver, resultType, null);
}

function addDefaultPrefix(xpath, prefix) {
    const tokenPattern = /([A-Za-z_\u00c0-\ufffd][\w\-.\u00b7-\ufffd]*|\*)\s*(::?|\()?|(".*?"|'.*?'|\d+(?:\.\d*)?|\.(?:\.|\d+)?|[\)\]])|(\/\/?|!=|[<>]=?|[\(\[|,=+-])|([@$])/g
    const TERM = 1, OPERATOR = 2, MODIFIER = 3
    var tokenType = OPERATOR
    prefix += ':'
    function replacer(token, identifier, suffix, term, operator, modifier) {
        if (suffix) {
            tokenType =
                (suffix == ':' || (suffix == '::' &&
                 (identifier == 'attribute' || identifier == 'namespace')))
                ? MODIFIER : OPERATOR
        }
        else if (identifier) {
            if (tokenType == OPERATOR && identifier != '*') {
                token = prefix + token
            }
            tokenType = (tokenType == TERM) ? OPERATOR : TERM
        }
        else {
            tokenType = term ? TERM : operator ? OPERATOR : MODIFIER
        }
        return token
    }
    return xpath.replace(tokenPattern, replacer)
};

function getElementPosition(elem) {
    var offsetTrail = elem;
    var offsetLeft  = 0;
    var offsetTop   = 0;
    while (offsetTrail) {
        offsetLeft += offsetTrail.offsetLeft;
        offsetTop  += offsetTrail.offsetTop;
        offsetTrail = offsetTrail.offsetParent;
    }
    return {left: offsetLeft || null, top: offsetTop|| null};
}

function getElementBottom(elem) {
    var doc = elem.ownerDocument;
    if ('getBoundingClientRect' in elem) {
        var rect = elem.getBoundingClientRect();
        var top = parseInt(rect.top, 10) + (doc.body.scrollTop || doc.documentElement.scrollTop);
        var height = parseInt(rect.height, 10);
    } else {
        var c_style = doc.defaultView.getComputedStyle(elem, '');
        var height  = 0;
        var prop    = ['height', 'borderTopWidth', 'borderBottomWidth',
            'paddingTop', 'paddingBottom',
            'marginTop', 'marginBottom'];
        prop.forEach(function(i) {
            var h = parseInt(c_style[i]);
            if (typeof h == 'number') {
                height += h;
            }
        });
        var top = getElementPosition(elem).top;
    }
    return top ? (top + height) : null;
}

function getCookie(host, needSecureCookie) {
    var result = []
    var cookieManager = Cc['@mozilla.org/cookiemanager;1'].getService(Ci.nsICookieManager2);
    var enumerator = cookieManager.getCookiesFromHost(host);
    var cookie;
    while (enumerator.hasMoreElements()) {
        cookie = enumerator.getNext().QueryInterface(Ci.nsICookie2);
        if (!cookie.isSecure || needSecureCookie) {
            result.push(cookie.name + '=' + cookie.value);
        }
    }
    return result.join('; ');
}

// end utility functions.
function getCache() {
    try{
        var cache = loadFile(DB_FILENAME_JSON);
        if (!cache) return false;
        cache = JSON.parse(cache);
        ns.SITEINFO = cache;
        ns.SITEINFO.forEach(function(i){
            i.type = "json";
        });
        log('Load cacheInfo.');
        return true;
    }catch(e){
        log('Error getCache.')
        return false;
    }
}

function requestSITEINFO(){
    var xhrStates = {};
    SITEINFO_IMPORT_URLS.forEach(function(i) {
        var opt = {
            method: 'get',
            url: i,
            onload: function(res) {
                xhrStates[i] = 'loaded';
                getCacheCallback(res, i);
            },
            onerror: function(res) {
                xhrStates[i] = 'error';
                getCacheErrorCallback(i);
            },
        }
        xhrStates[i] = 'start';
        GM_xmlhttpRequest(opt);
        setTimeout(function() {
            if (xhrStates[i] == 'start') {
                getCacheErrorCallback(i);
            }
        }, XHR_TIMEOUT);
    });
};

function getCacheCallback(res, url) {
    if (res.status != 200) {
        return getCacheErrorCallback(url);
    }

    var temp;
    try {
        temp = Cu.evalInSandbox(res.responseText, Cu.Sandbox("about:blank"));
    } catch(e) {
        log(e);
    }
    if (!temp || !temp.length)
        return getCacheErrorCallback(url);

    var info = [];
    temp.forEach(function(i){
        var data = i.data;
        if (!data.url || data.url.length <= 12) return;
        try {
            var exp = new RegExp(data.url);
            if (exp.test('http://a')) return;
            var o = {
                url: data.url,
                nextLink: data.nextLink,
                pageElement: data.pageElement,
            };
            Object.defineProperty(o, 'url_regexp', {
                enumerable: false,
                value: exp
            });
            if (data.insertBefore)
                o.insertBefore = data.insertBefore;
            //o.resource_url = i.resource_url;
            info.push(o);
        } catch (e) {}
    });
    info.sort(function(a, b) b.url.length - a.url.length);
    saveFile(DB_FILENAME_JSON, JSON.stringify(info));

    ns.SITEINFO = info;
    log('getCacheCallback:' + url);
}

function getCacheErrorCallback(url) {
    log('getCacheErrorCallback:' + url);
}

// 修改过，为了能使用 responseType = "document"，这样下一页头像和 xpath 获取 body 都有能用。
function GM_xmlhttpRequest(obj, win) {
    if (typeof(obj) != 'object' || (typeof(obj.url) != 'string' && !(obj.url instanceof String))) return;
    if (!win || "@maone.net/noscript-service;1" in Cc) win = window;

    var req = new win.XMLHttpRequest();
    req.open(obj.method || 'GET',obj.url,true);

    if (typeof(obj.headers) == 'object')
        for(var i in obj.headers)
            req.setRequestHeader(i,obj.headers[i]);
    if (obj.overrideMimeType)
        req.overrideMimeType(obj.overrideMimeType);
    if (obj.responseType)
        req.responseType = obj.responseType;

    ['onload','onerror','onreadystatechange'].forEach(function(k) {
        if (obj[k] && (typeof(obj[k]) == 'function' || obj[k] instanceof Function)) req[k] = function() {
            req.finalUrl = (req.readyState == 4) ? req.channel.URI.spec : '';
            req.URI = req.channel.URI;
            req.originalURI = req.channel.originalURI;
            obj[k](req);
        };
    });

    req.send(obj.send || null);
    return req;
}

function wildcardToRegExpStr(urlstr) {
    if (urlstr.source) return urlstr.source;
    let reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str){
        return str === "*" ? ".*" : "[^/]*";
    });
    return "^" + reg + "$";
}

function log(){ Application.console.log('[uAutoPagerize] ' + $A(arguments)); }
function debug(){ if (ns.DEBUG) Application.console.log('[uAutoPagerize DEBUG] ' + $A(arguments)); };
function $(id, doc) (doc || document).getElementById(id);

function $A(arr) Array.slice(arr);
function $C(name, attr, doc) {
    doc = doc || document;
    var el = doc.createElement(name);
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

function loadFile(aLeafName) {
    var aFile = Services.dirsvc.get('UChrm', Ci.nsILocalFile);
    aFile.appendRelativePath(aLeafName);
    return loadText(aFile);
}
function loadText(aFile) {
    if (!aFile.exists() || !aFile.isFile()) return null;
    var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
    var sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
    fstream.init(aFile, -1, 0, 0);
    sstream.init(fstream);
    var data = sstream.read(sstream.available());
    try { data = decodeURIComponent(escape(data)); } catch(e) {}
    sstream.close();
    fstream.close();
    return data;
}

function saveFile(name, data) {
    var file = Services.dirsvc.get('UChrm', Ci.nsILocalFile);
    file.appendRelativePath(name);

    var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
    suConverter.charset = 'UTF-8';
    data = suConverter.ConvertFromUnicode(data);

    var foStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
    foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
    foStream.write(data, data.length);
    foStream.close();
}

function exec(path, arg){
    var file    = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
    try {
        var a = (typeof arg == 'string' || arg instanceof String) ? arg.split(/\s+/) : [arg];
        file.initWithPath(path);

        if (!file.exists()) {
            Cu.reportError('File Not Found: ' + path);
            return;
        }

        if (file.isExecutable()) {
            process.init(file);
            process.run(false, a, a.length);
        } else {
            file.launch();
        }

    } catch(e) {
        debug(e);
    }
}

function alerts(title, info){
    Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService)
        .showAlertNotification(null, title, info, false, "", null, "");
}

})('\
#uAutoPagerize-icon {\
	list-style-image: url(\
		data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAQCAYAAACBSfjBAAAA2klEQVRYhe\
		2WwYmGMBhE390+0kCOwZLswQK82YAg2Ict2IBdeJ3/FHcW9oewnoRv4N0yGB4TECLPs22bHIBlWeQAzP\
		Msp/a7q5MDkM4kB6DsRc7PDaTfQEqnHIBSdjm1fXWXHIAznXIA9rLLub+esxyA4zjkfDsXAkNgCHy/wM\
		jDtK5tHEc5td+6tn7t5dz9xrX1/Sqn9lvXtvarnNpvXdtfLzUEhsAQ+H6BkYdpXdswDHJqv3Vtecpy7n\
		7j2nKe5NR+69qmPMmp/da1ff2NCYEhMAS+WmDk//kA2XH2W9CWRjQAAAAASUVORK5CYII=\
		);\
	-moz-image-region: rect(0px 16px 16px 0px );\
}\
\
#uAutoPagerize-icon[state="enable"]     { -moz-image-region: rect(0px 32px 16px 16px); }\
#uAutoPagerize-icon[state="terminated"] { -moz-image-region: rect(0px 48px 16px 32px); }\
#uAutoPagerize-icon[state="error"]      { -moz-image-region: rect(0px 64px 16px 48px); }\
#uAutoPagerize-icon[state="off"]        { -moz-image-region: rect(0px 80px 16px 64px); }\
\
\
#uAutoPagerize-icon[state="loading"] {\
	list-style-image: url(data:image/gif;base64,\
		R0lGODlhEAAQAKEDADC/vyHZ2QD//////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgADACwAAAAAEAAQ\
		AAACIJyPacKi2txDcdJmsw086NF5WviR32kAKvCtrOa2K3oWACH5BAkKAAMALAAAAAAQABAAAAIinI9p\
		wTEChRrNRanqi1PfCYLACIQHWZoDqq5kC8fyTNdGAQAh+QQJCgADACwAAAAAEAAQAAACIpyPacAwAcMQ\
		VKz24qyXZbhRnRNJlaWk6sq27gvH8kzXQwEAIfkECQoAAwAsAAAAABAAEAAAAiKcj6kDDRNiWO7JqSqU\
		1O24hCIilMJomCeqokPrxvJM12IBACH5BAkKAAMALAAAAAAQABAAAAIgnI+pCg2b3INH0uquXqGH7X1a\
		CHrbeQiqsK2s5rYrehQAIfkECQoAAwAsAAAAABAAEAAAAiGcj6nL7Q+jNKACaO/L2E4mhMIQlMEijuap\
		pKSJim/5DQUAIfkECQoAAwAsAAAAABAAEAAAAiKcj6nL7Q+jnLRaJbIYoYcBhIChbd4njkPJeaBIam33\
		hlUBACH5BAEKAAMALAAAAAAQABAAAAIgnI+py+0PoxJUwGofvlXKAAYDQAJLKJamgo7lGbqktxQAOw==\
		);\
}\
\
'.replace(/\n|\t/g, ''));

window.uAutoPagerize.init();