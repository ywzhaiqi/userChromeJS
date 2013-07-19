// ==UserScript==
// @name           uAutoPagerize
// @namespace      http://d.hatena.ne.jp/Griever/
// @description    loading next page and inserting into current page.
// @include        main
// @compatibility  Firefox 17
// @charset        UTF-8
// @version        0.3.0
// @note           添加最大加载页数，参考 卡饭论坛 lastdream2013
// @note           添加 Super_preloader 的数据库支持及更新 By ywzhaiqi。
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

window.window.isUrlbar = false;  // 放置的位置，true为地址栏，false为附加组件栏（可移动按钮）

(function(css) {

// 以下 設定が無いときに利用する
var useiframe = true;  // 启用 iframe 加载下一页的总开关。
var IMMEDIATELY_PAGER_NUM = 0;  // 立即加载的页数
var loadImmediatelyTime = 500;  // 立即加载延迟的时间（ms）

var FORCE_TARGET_WINDOW = true;
var BASE_REMAIN_HEIGHT = 600;
var MAX_PAGER_NUM = -1;   //默认最大翻页数， -1表示无限制
var DEBUG = true;
var AUTO_START = true;
var SCROLL_ONLY = false;
var CACHE_EXPIRE = 24 * 60 * 60 * 1000;
var XHR_TIMEOUT = 30 * 1000;


var NLF_DB_FILENAME =  "uSuper_preloader.db.js";

var SITEINFO_NLF_IMPORT_URLS = [
	//Super_preloader 的翻页规则更新地址
	"http://simpleu.googlecode.com/svn/trunk/scripts/Super_preloader.db.js",
	// ywzhaiqi 的规则。github 速度略慢，用 googlecode
	"http://autopagerize-userchrome.googlecode.com/git/_uAutoPagerize.js",
];

//官方规则， 太大了，先注释掉，默认用uSuper_preloader.db.js
var SITEINFO_IMPORT_URLS = [
    // 'http://wedata.net/databases/AutoPagerize/items.json',
];


// ワイルドカード(*)で記述する
var INCLUDE = [
	"*"
];
var EXCLUDE = [
	'https://mail.google.com/*'
	,'http://www.google.co.jp/reader/*'
	,'http://b.hatena.ne.jp/*'
	,'http://www.livedoor.com/*'
	,'http://reader.livedoor.com/*'
	,'http://fastladder.com/*'
];

var MY_SITEINFO = [
    {
        url         : '^https?://(?:images|www)\\.google(?:\\.[^./]{2,3}){1,2}/(images\\?|search\\?.*tbm=isch)'
        ,nextLink   : 'id("nn")/parent::a | id("navbar navcnt nav")//td[last()]/a'
        ,pageElement: 'id("ImgCont ires")/table | id("ImgContent")'
        ,exampleUrl : 'http://images.google.com/images?ndsp=18&um=1&safe=off&q=image&sa=N&gbv=1&sout=1'
    },
	{
		url         : 'http://eow\\.alc\\.co\\.jp/[^/]+'
		,nextLink   : 'id("AutoPagerizeNextLink")'
		,pageElement: 'id("resultsList")/ul'
		,exampleUrl : 'http://eow.alc.co.jp/%E3%81%82%E3%82%8C/UTF-8/ http://eow.alc.co.jp/are'
	},
	{
		url         : '^http://matome\\.naver\\.jp'
		,nextLink   : '//div[contains(@class, "MdPagination0")]/strong[1]/following-sibling::a[1]'
		,pageElement: '//div[contains(concat(" ", @class, " "), " MdMTMWidgetList01 ")]|//ul[@class="MdMTMTtlList02" or @class="MdTopMTMList01"]'
		,exampleUrl : 'http://matome.naver.jp/odai/2127476492987286301 http://matome.naver.jp/topic/1LwZ0'
	},
	{
		url          : '^https?://mobile\\.twitter\\.com/'
		,nextLink    : '//div[contains(concat(" ",normalize-space(@class)," "), " w-button-more ")]/a[@href]'
		,pageElement : '//div[@class="timeline"]/table[@class="tweet"] | //div[@class="user-list"]/table[@class="user-item"]'
		,exampleUrl  : 'https://mobile.twitter.com/ https://mobile.twitter.com/search?q=css'
	},
	{
		url          : '^http://dailynews\\.yahoo\\.co\\.jp/fc/\\w+'
		,nextLink    : '//a[text()="[記事全文]" and contains(@href, ".yahoo.co.jp/")]'
		,pageElement : 'id("ynDetail detailHeadline detailNewsOpen")'
		,insertBefore: 'id("detailHeadline")/a/following-sibling::*'
		,exampleUrl  : 'http://dailynews.yahoo.co.jp/fc/sports/iwakuma_hisashi/?1331001936'
	},
	{
		url          : '^http://kakaku\\.com/specsearch/\\d+'
		,nextLink    : 'id("AutoPagerizeNextLink")'
		,pageElement : '//tr[@class="bgColor02"][1]|//tr[@class="bgColor02"][1]/following-sibling::tr'
		,exampleUrl  : 'http://kakaku.com/specsearch/0150/'
	},
];

var MICROFORMAT = [
	// {
	// 	url        : '^https?://.',
	// 	nextLink   : 'auto;',
	// 	pageElement: "//body/*"
	// },
	// {
	// 	url        : '^https?://.',
	// 	nextLink   : '//link[contains(concat(" ", translate(normalize-space(@rel), "ENTX", "entx"), " "), " next ")] | //a[contains(concat(" ", translate(normalize-space(@rel), "ENTX", "entx"), " "), " next ")]',
	// 	pageElement: '//*[contains(concat(" ", normalize-space(@class), " "), " hentry ")]'
	// },
	{
		url         : '^https?://.*',
		nextLink    : '//a[@rel="next"] | //link[@rel="next"]',
		pageElement : '//*[contains(@class, "autopagerize_page_element")]',
		insertBefore: '//*[contains(@class, "autopagerize_insert_before")]'
	}
];

var COLOR = {
	on: '#0f0',
	off: '#ccc',
	enable: '#0f0',
	disable: '#ccc',
	loading: '#0ff',
	terminated: '#00f',
	error: '#f0f'
}

let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

if (typeof window.uAutoPagerize != 'undefined') {
	window.uAutoPagerize.destroy();
}


var ns = window.uAutoPagerize = {
	INCLUDE_REGEXP : /./,
	EXCLUDE_REGEXP : /^$/,
	MICROFORMAT    : MICROFORMAT.slice(),
	MY_SITEINFO    : MY_SITEINFO.slice(),
	SITEINFO_NLF   : [],
	SITEINFO       : [],

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
	get file_NLF() {
		var aFile = Services.dirsvc.get('UChrm', Ci.nsILocalFile);
		aFile.appendRelativePath(NLF_DB_FILENAME);
		delete this.file_NLF;
		return this.file_NLF = aFile;
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
			this.EXCLUDE_REGEXP = arr.length > 0 ?
				new RegExp(arr.map(wildcardToRegExpStr).join("|")) :
				/^$/;
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
        let m = $("uAutoPagerize-IMMEDIATELY_PAGER_NUM");
        if (m) m.setAttribute("label", '立即加载' + (IMMEDIATELY_PAGER_NUM = num) + '页');
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

	init: function() {
		ns.style = addStyle(css);

        ns.makeButton();

		["DEBUG", "AUTO_START", "FORCE_TARGET_WINDOW", "SCROLL_ONLY"].forEach(function(name) {
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

        if(!ns.loadSetting_NLF())
            ns.requestSITEINFO_NLF();

		ns.INCLUDE = INCLUDE;
		ns.EXCLUDE = EXCLUDE;
		ns.addListener();
		ns.loadSetting();
		updateIcon();
	},
	uninit: function() {
		ns.removeListener();
        ["DEBUG", "AUTO_START", "FORCE_TARGET_WINDOW", "SCROLL_ONLY"].forEach(function(name) {
            try {
                ns.prefs.setBoolPref(name, ns[name]);
            } catch (e) {}
        }, ns);
        ["BASE_REMAIN_HEIGHT", "MAX_PAGER_NUM", "IMMEDIATELY_PAGER_NUM"].forEach(function(name) {
            try {
                ns.prefs.setIntPref(name, ns[name]);
            } catch (e) {}
        }, ns);
	},
	theEnd: function() {
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
		window.addEventListener('uAutoPagerize_destroy', this, false);
		window.addEventListener('unload', this, false);
	},
	removeListener: function() {
		gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);
		gBrowser.mTabContainer.removeEventListener('TabSelect', this, false);
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
			case "uAutoPagerize_destroy":
				this.destroy(event);
				break;
			case "unload":
				this.uninit(event);
				break;
		}
	},
	loadSetting: function(isAlert) {
		var data = loadText(this.file);
		if (!data) return false;
		var sandbox = new Cu.Sandbox( new XPCNativeWrapper(window) );
		sandbox.INCLUDE = null;
		sandbox.EXCLUDE = null;
		sandbox.MY_SITEINFO = [];
		sandbox.MICROFORMAT = [];
		sandbox.USE_MY_SITEINFO = true;
		sandbox.USE_MICROFORMAT = true;

		try {
			Cu.evalInSandbox(data, sandbox, '1.8');
		} catch (e) {
			return log('load error.', e);
		}
		ns.MY_SITEINFO = sandbox.USE_MY_SITEINFO ? sandbox.MY_SITEINFO.concat(MY_SITEINFO): sandbox.MY_SITEINFO;
		ns.MICROFORMAT = sandbox.USE_MICROFORMAT ? sandbox.MICROFORMAT.concat(MICROFORMAT): sandbox.MICROFORMAT;
		if (sandbox.INCLUDE)
			ns.INCLUDE = sandbox.INCLUDE;
		if (sandbox.EXCLUDE)
			ns.EXCLUDE = sandbox.EXCLUDE;
		if (isAlert)
			alert('uAutoPagerize', '配置文件已经重新载入');

		return true;
	},
	getFocusedWindow: function() {
		var win = document.commandDispatcher.focusedWindow;
		return (!win || win == window) ? content : win;
	},
	launch: function(win, timer){
		var locationHref = win.location.href;
		if (locationHref.indexOf('http') !== 0 ||
		   !ns.INCLUDE_REGEXP.test(locationHref) ||
		    ns.EXCLUDE_REGEXP.test(locationHref))
			return updateIcon();

		var doc = win.document;
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

		if (/\bgoogle\.(?:com|co\.jp|com\.hk)$/.test(win.location.host)) {
			if (!timer || timer < 400) timer = 400;
			win.addEventListener("hashchange", function(event) {
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

			// Google Video
			var datas = [];
			var docFil = function(newDoc) {
				var x = getFirstElementByXPath('//script/text()[contains(self::text(), "data:image/jpeg")]', newDoc);
				if (!x) return;
				datas = x.nodeValue.match(/data:image\/jpeg\;base64\,[A-Za-z0-9/+]+(?:\\x3d)*/g) || [];
			};
			var dfrFil = function(df) {
				datas.forEach(function(d, i){
					var elem = df.querySelector('#vidthumb' + (i+1) + ', .vidthumb' + (i+1));
					if (!elem) return;
					elem.src = d.replace(/\\x3d/g, "=");
				});
			};
			win.documentFilters.push(docFil);
			win.fragmentFilters.push(dfrFil);
		}
		else if (/^https?:\/\/(?:images|www)\.google(?:\.[^.\/]{2,3}){1,2}\/(images\?|search\?.*tbm=isch)/.test(locationHref)) {
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
		}
		// oAutoPagerize
		else if (win.location.host === 'eow.alc.co.jp') {
			var alc = function(_doc, _url){
				var a,r = _doc.evaluate('//p[@id="paging"]/a[last()]',
					_doc,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);
				if (r.singleNodeValue) a = r.singleNodeValue;
				else return;
				var word = _url.indexOf('search?') >= 0 ?
					_url.match(/[?&]q=([^&]+)/):
					_url.match(/eow\.alc\.co\.jp\/([^/]+)/);
				if (!word || !word[1]) return;
				a.id = 'AutoPagerizeNextLink';
				a.href = a.href.replace(/javascript:goPage\("(\d+)"\)/,'http://eow.alc.co.jp/search?q='+ word[1] +'&pg=$1');
			};
			win.documentFilters.push(alc);
			miscellaneous.push(alc);
		}
		else if (win.location.host === 'matome.naver.jp') {
			[, info] = ns.getInfo(ns.MY_SITEINFO, win);
			if (info) {
				var naver = function(_doc){
					var next = getFirstElementByXPath(info.nextLink, _doc);
					if (next) {
						next.href = win.location.pathname + '?page=' + next.textContent;
					}
				}
				win.documentFilters.push(naver);
				miscellaneous.push(naver);
			}
		}
		else if (win.location.host === "www.youtube.com") {
			// from youtube_AutoPagerize_fix.js https://gist.github.com/761717
			win.fragmentFilters.push(function(df) {
				Array.slice(df.querySelectorAll('img[data-thumb]')).forEach(function(img) {
					img.src = img.getAttribute('data-thumb');
					img.removeAttribute('data-thumb');
				});
			});
		}
		else if (win.location.host === 'www.dailymotion.com') {
			win.fragmentFilters.push(function(df) {
				Array.slice(df.querySelectorAll('img[data-src]')).forEach(function(img) {
					img.src = img.getAttribute('data-src');
					img.removeAttribute('data-src');
				});
			});
		}
		// 水木清华社区延迟加载及下一页加载的修复
		else if (win.location.host === 'www.newsmth.net') {
			timer = 1000;   // 这个网站 =400 则找到的下一页链接会错误
			win.addEventListener("hashchange", function(event) {
				debug("hashchanged: " + win.location.href);
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
			if (!info) [, info, nextLink] = ns.getInfo(ns.MY_SITEINFO, win);
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

			// 第二检测 Super_preloader.db 的数据库
			// var s = new Date().getTime();
			if(!info) [index, info, nextLink] = ns.getInfo(ns.SITEINFO_NLF, win);
			// debug(index + 'th/' + (new Date().getTime() - s) + 'ms');

			// var s = new Date().getTime();
			if (!info) [index, info, nextLink] = ns.getInfo(ns.SITEINFO, win);
			// debug(index + 'th/' + (new Date().getTime() - s) + 'ms');
			if (!info) [, info, nextLink] = ns.getInfo(ns.MICROFORMAT, win);
			if (info) {
				win.ap = new AutoPager(win.document, info, nextLink);
			}else{
                debug("下一页链接：" + nextLink);
			}

			updateIcon();
		}, timer||0);
	},
    makeButton: function(){

        if(window.isUrlbar){
            ns.icon = $('urlbar-icons').appendChild($C("image", {
                id: "uAutoPagerize-icon",
                state: "disable",
                tooltiptext: "disable",
                onclick: "if (event.button != 2) uAutoPagerize.iconClick(event);",
                context: "uAutoPagerize-popup",
                style: "padding: 0px 2px;",
            }));
        }else{
            ns.icon = $('addon-bar').appendChild($C("toolbarbutton", {
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
        }

        setTimeout(function(icon){
        	icon.removeAttribute("image");
        }, 200, ns.icon);

        var xml = '\
            <menupopup id="uAutoPagerize-popup"\
                       position="after_start"\
                       onpopupshowing="if (this.triggerNode) this.triggerNode.setAttribute(\'open\', \'true\');"\
                       onpopuphiding="if (this.triggerNode) this.triggerNode.removeAttribute(\'open\');">\
                <menuitem label="启用自动翻页"\
                          id="uAutoPagerize-AUTOSTART"\
                          type="checkbox"\
                          autoCheck="true"\
                          checked="'+ AUTO_START +'"\
                          oncommand="uAutoPagerize.toggle(event);"/>\
                <menuitem label="重新配置"\
                          accesskey="r"\
                          oncommand="uAutoPagerize.loadSetting(true);"/>\
                <menuitem label="更新规则"\
                          oncommand="uAutoPagerize.resetSITEINFO_NLF();"/>\
                <!-- <menuitem label="更新原版规则"\
                           oncommand="uAutoPagerize.resetSITEINFO();"/> -->\
                <menuseparator/>\
                <menuitem label="立即加载' + IMMEDIATELY_PAGER_NUM + '页"\
                          id="uAutoPagerize-IMMEDIATELY_PAGER_NUM"\
                          tooltiptext="左键立即加载，右键设置页数"\
                          onclick="uAutoPagerize.immediatelyItemClicked(event);"/>\
                <menuseparator/>\
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
			if (!content.ap)
				ns.launch(content);
			else updateIcon();
		}
	},
	getInfo: function (list, win) {
		if (!list) list = ns.MY_SITEINFO.concat(ns.SITEINFO_NLF, ns.SITEINFO);
		if (!win)  win  = content;
		var doc = win.document;
		var locationHref = doc.location.href;
		for (let [index, info] in Iterator(list)) {
			try {
				var exp = info.url_regexp || Object.defineProperty(info, "url_regexp", {
						enumerable: false,
						value: new RegExp(info.url)
					}).url_regexp;
				if ( !exp.test(locationHref) ) continue;

				var nextLink = getElementMix(info.nextLink, doc);
				if (!nextLink) {
					// FIXME microformats case detection.
					// limiting greater than 12 to filter microformats like SITEINFOs.
					if (info.url.length > 12)
						debug('nextLink not found. getInfo(). ', String(info.nextLink));
					continue;
				}
				var pageElement = getElementMix(info.pageElement, doc);
				if (!pageElement) {
					if (info.url.length > 12 || (typeof(info.url) !='string'))
						debug('pageElement not found.', info.pageElement);
					continue;
				}
				return [index, info, nextLink, pageElement];
			} catch(e) {
				log('error at launchAutoPager() : ' + e);
			}
		}
		return [-1, null];
	},
	getInfoFromURL: function (url) {
		if (!url) url = content.location.href;
		var list = ns.MY_SITEINFO.concat(ns.SITEINFO_NLF, ns.SITEINFO);
		return list.filter(function(info, index, array) {
			try {
				var exp = info.url_regexp || Object.defineProperty(info, "url_regexp", {
						enumerable: false,
						value: new RegExp(info.url)
					}).url_regexp;
				return exp.test(url);
			} catch(e){ }
		});
	},
    immediatelyItemClicked: function(event){
        if(event.button == 0){
            ns.loadImmediately();
        }else if(event.button ==2){
            ns.IMMEDIATELY_PAGER_NUM = prompt("立即加载的页数？", ns.IMMEDIATELY_PAGER_NUM);
            ns.loadImmediately();
        }
    },
    loadImmediately: function(num){
        num = num || ns.IMMEDIATELY_PAGER_NUM;

        if(content.ap){
            content.ap.loadImmediately(num);
        }
    },
    search: function(){
        var keyword = encodeURIComponent(content.location.href);
        openLinkIn('http://ap.teesoft.info/?exp=0&url=' + keyword, 'tab', {});
    },
	gototop: function(){
		content.window.scroll(content.window.scrollX, 0);
	},
    gotobottom: function(){
        var win = content.window;
        var doc = content.document;
        win.scroll(win.scrollX, Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight));
    },
	gotoprev: function(){
        var win = content.window;

        var [prevSepTop,] = this.getSeparators(win);
		win.scroll(win.scrollY, prevSepTop + win.scrollY - 6);
	},
	gotonext: function(){
        var win = content.window;

        var [, nextSepTop] = this.getSeparators(win);
        win.scroll(win.scrollY, nextSepTop + win.scrollY - 6);
	},
    // 找到窗口视野内前后2个分隔条的位置
    getSeparators: function(win){
        var doc = win.document;

        var separators = doc.querySelectorAll(".autopagerize_link");
        var viewportHeight = win.innerHeight;
        var documentHeight = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);

        // 得到一个数组
        var heightArr = [- win.scrollY];
        for (var i = 0; i < separators.length; i++) {
            heightArr.push(separators[i].getBoundingClientRect().top);
        }
        heightArr.push(documentHeight);

        // 查找
        for (var i = 0; i < heightArr.length; i++) {
            if(heightArr[i] > viewportHeight){
                if(heightArr[i - 1] > 0){
                    return [heightArr[i - 2], heightArr[i]];
                }else{
                    return [heightArr[i - 1], heightArr[i]];
                }
            }
        }

        return [];
    }
};

var cplink; // hrefInc 函数用

// Class
function AutoPager(doc, info, nextLink) {
	this.init.apply(this, arguments);
};
AutoPager.prototype = {
	req: null,
	pageNum: 1,
    immediatelyPageNum: 0,
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

		var url = this.getNextURL(nextLink ? nextLink : this.doc);
		if ( !url ) {
			debug("getNextURL returns null.", this.info.nextLink);
			return;
		}

		this.setInsertPoint();
		if (!this.insertPoint) {
			debug("insertPoint not found.", this.info.pageElement);
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

		if (!ns.SCROLL_ONLY)
			this.scroll();
		if (this.getScrollHeight() == this.win.innerHeight)
			this.body.style.minHeight = (this.win.innerHeight + 1) + 'px';
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
		}

		for (var i = this.remove.length - 1; i >= 0; i--) {
			this.remove[i]();
		};

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
			case "click":
				this.stateToggle();
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
	scroll : function(){
		if (this.state !== 'enable' || !ns.AUTO_START) return;
		var remain = this.getScrollHeight() - this.win.innerHeight - this.win.scrollY;
		if (remain < this.remainHeight) {
			this.request();
		}
	},
	abort: function() {
		if (this.req) {
			this.req.abort();
			this.req = null;
		}
	},
    loadImmediately: function(num){
        num = parseInt(num, 10);
        if(num){
            this.immediatelyPageNum = num;
        }

        if(this.immediatelyPageNum > 0){
            debug("loadImmediately");
            setTimeout(function(self){
                self.request();
            }, loadImmediatelyTime, this);
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
	request: function(){
		if (!this.requestURL || this.loadedURLs[this.requestURL]) return;
		// 最大页数自动停止
		if(this.pageNum > (MAX_PAGER_NUM - 1) && MAX_PAGER_NUM > 0){
			this.addEndSeparator();
			return;
		}

        debug("Request: " + this.requestURL);
		if(useiframe && this.info.useiframe){
			this.frameRequest();
		}else{
			this.httpRequest();
		}
	},
    httpRequest: function(){
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
        var self = this;
        var headers = {};
        if (isSameDomain)
            headers.Cookie = getCookie(reqHost, reqScheme === 'https');
        var opt = {
            method: 'get',
            get url() self.requestURL,
            set url(url) self.requestURL = url,
            headers: headers,
            overrideMimeType: 'text/html; charset=' + this.doc.characterSet,
            onerror: function(){ self.state = 'error'; self.req = null; },
            onload: function(res) { self.requestLoad.apply(self, [res]); self.req = null; }
        }
        this.win.requestFilters.forEach(function(i) { i(opt) }, this);
        this.state = 'loading';
        this.req = GM_xmlhttpRequest(opt);
    },
	frameRequest: function(){
		var self = this;

		if(!this.iframe){
			this.iframe = this.doc.createElement('iframe');
			this.iframe.name = 'uAutoPagerizeRequest';
			this.iframe.width = this.iframe.height = 1;
			this.iframe.style.visibility = 'hidden';

			this.doc.body.appendChild(this.iframe);
			this.remove.push(function(){
				self.doc.body.removeChild(self.iframe);
			});
		}

        if (this.iframe.src == this.requestURL) return;
        this.iframe.src = this.requestURL;

		this.iframe.addEventListener("load", iframeLoad, false);

		function iframeLoad(){
			debug("iframe load");
			self.iframeLoad(self.iframe);
		}

		this.cleanIframe = function(){
			self.iframe.src = "about:blank";
			self.iframe.contentDocument.location.href = "about:blank";
			self.iframe.removeEventListener("load", iframeLoad, false);
		};
	},
	requestLoad : function(res){
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

		var str = res.responseText;
		var htmlDoc;
		if (this.isXML) {
			htmlDoc = new DOMParser().parseFromString(str, "application/xml");
		} else {
			// thx! http://pc12.2ch.net/test/read.cgi/software/1253771697/478
			htmlDoc = this.doc.cloneNode(false);
			htmlDoc.appendChild(htmlDoc.importNode(this.documentElement, false));
			var range = this.doc.createRange();
			//range.selectNodeContents(this.body);
			htmlDoc.documentElement.appendChild(range.createContextualFragment(str));
			range.detach();
		}
		this.win.documentFilters.forEach(function(i) { i(htmlDoc, this.requestURL, this.info) }, this);

		this.loaded(htmlDoc);
	},
	iframeLoad: function(iframe){
		var htmlDoc = iframe.contentDocument || iframe.contentWindow.document;
		this.loaded(htmlDoc);
		if(this.cleanIframe)
			this.cleanIframe();
	},
	loaded: function(htmlDoc){
		try {
			var page = getElementsMix(this.info.pageElement, htmlDoc);
			var url = this.getNextURL(htmlDoc);
		}
		catch(e){
			debug("Get page and url Error: ", e);
			this.state = 'error';
			return;
		}

		if (!page || page.length < 1 ) {
			debug('pageElement not found.', "requestLoad ", this.info.pageElement);
			this.state = 'terminated';
			return;
		}

		if (this.loadedURLs[this.requestURL]) {
			debug('page is already loaded.', this.requestURL, this.info.nextLink);
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
				debug("insertPoint not found.", this.info.pageElement);
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
		// 	this.scroll();
		if (!url) {
			debug('nextLink not found. requestLoad(). ', this.info.nextLink, htmlDoc);
			this.state = 'terminated';
		}else{
            this.immediatelyPageNum--;
            // this.loadImmediately();
        }

		var ev = this.doc.createEvent('Event');
		ev.initEvent('GM_AutoPagerizeNextPageLoaded', true, false);
		this.doc.dispatchEvent(ev);
	},
	addEndSeparator: function(){
		// debug('page number > :', this.pageNum,  MAX_PAGER_NUM );
		var html = '<a class="autopagerize_link" href="' + this.requestURL.replace(/&/g, '&amp;') +
			'" > 已达到设置的最大自动翻页数，点击进入下一页 </a> ';

		var fragment = this.doc.createDocumentFragment();
		var page = this.doc.createElement('div');

		this.addPage(fragment, [page], html);

		this.state = 'terminated';
	},
	addPage : function(htmlDoc, page, separatorHTML){
		var fragment = this.doc.createDocumentFragment();
		page.forEach(function(i) { fragment.appendChild(i); });
		this.win.fragmentFilters.forEach(function(i) { i(fragment, htmlDoc, page) }, this);

		if (this.info.wrap) {
			var div = this.doc.createElement("div");
			div.setAttribute("class", "uAutoPagerize-wrapper");
			div.appendChild(fragment);
			fragment = this.doc.createDocumentFragment();
			fragment.appendChild(div);
		}

		var hr = this.doc.createElement('hr');
		hr.setAttribute('class', 'autopagerize_page_separator');
		hr.setAttribute('style', 'clear: both;');
		var p  = this.doc.createElement('p');
		p.setAttribute('class', 'autopagerize_page_info');
		p.setAttribute('style', 'clear: both;');

		p.innerHTML = separatorHTML ? separatorHTML :
                '<a class="autopagerize_link" target="_blank" href="' +
                this.requestURL.replace(/&/g, '&amp;') + '"> 第 ' + (++this.pageNum) + ' 页: </a> ';

		if (!this.isFrame) {
			var o = p.insertBefore(this.doc.createElement('div'), p.firstChild);
			o.setAttribute('class', 'autopagerize_icon');
			o.setAttribute('state', 'enable');
			o.style.cssText = [
				'background: ', COLOR['enable'], ';'
				,'width: .8em;'
				,'height: .8em;'
				,'padding: 0px;'
				,'margin: 0px .4em 0px 0px;'
				,'display: inline-block;'
				,'vertical-align: middle;'
			].join('');
			o.addEventListener('click', this, false);
		}

		var insertParent = this.insertPoint.parentNode;
		if (page[0] && page[0].tagName == 'TR') {
			var colNodes = getElementsMix('child::tr[1]/child::*[self::td or self::th]', insertParent);
			var colums = 0;
			for (var i = 0, l = colNodes.length; i < l; i++) {
				var col = colNodes[i].getAttribute('colspan');
				colums += parseInt(col, 10) || 1;
			}
			var td = this.doc.createElement('td');
			td.appendChild(hr);
			td.appendChild(p);
			var tr = this.doc.createElement('tr');
			td.setAttribute('colspan', colums);
			tr.appendChild(td);
			fragment.insertBefore(tr, fragment.firstChild);
		} else {
			fragment.insertBefore(p, fragment.firstChild);
			fragment.insertBefore(hr, fragment.firstChild);
		}

		insertParent.insertBefore(fragment, this.insertPoint);
		return page.map(function(pe) {
			var ev = this.doc.createEvent('MutationEvent');
			ev.initMutationEvent('AutoPagerize_DOMNodeInserted', true, false,
			                     insertParent, null,
			                     this.requestURL, null, null);
			pe.dispatchEvent(ev);
			return pe;
		}, this);
	},
	getNextURL : function(doc) {
		cplink = this.requestURL;
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
			insertPoint = getElementsMix(this.info.insertBefore, this.doc);
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
		var scrollHeight = this.getScrollHeight();
		var bottom = getElementPosition(this.insertPoint).top ||
			this.getPageElementsBottom() || Math.round(scrollHeight * 0.8);
		this.remainHeight = scrollHeight - bottom + ns.BASE_REMAIN_HEIGHT;
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

// 获取更新 Super_preloader.db
(function(){

	ns.requestSITEINFO_NLF = requestSITEINFO;

	ns.resetSITEINFO_NLF = function(){
		if (confirm('确定要重置 Super_preloader 及其它规则吗？'))
			requestSITEINFO(SITEINFO_NLF_IMPORT_URLS);
	};

	ns.loadSetting_NLF = function(isAlert) {
		var data = loadText(ns.file_NLF);
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
		for(var i = 0, l = SITEINFO_NLF_IMPORT_URLS.length; i < l; i++){
			let mSiteInfo = sandbox["MY_SITEINFO_" + i];
			if(mSiteInfo){
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
				siteName: info.siteName || '',
				exampleUrl: info.siteExample || ''
			});
		}

		ns.SITEINFO_NLF = list;

		debug("Super_preloader 及其它规则已经载入")

		if (isAlert)
			alert('uAutoPagerize', 'Super_preloader  及其它规则已经重新载入');

		return true;
	};

	var finishCount = 0;
	var dataStr = "";

	function requestSITEINFO(){
		finishCount = 0;
		dataStr = "";
		// debug(" request Super_preloader.db");
		var xhrStates = {};
		SITEINFO_NLF_IMPORT_URLS.forEach(function(i) {
			var opt = {
				method: 'get',
				url: i,
				overrideMimeType: "text/plan; charset=utf-8;",
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
	}

	function getCacheCallback(res, url) {
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
		if(finishCount >= SITEINFO_NLF_IMPORT_URLS.length){
			saveFile(NLF_DB_FILENAME, dataStr);
			ns.loadSetting_NLF();
			alert("uAutoPagerize", "Super_preloader 及其它规则已经更新完毕。");
		}

		log('getCacheCallback:' + url);
	}

	function getCacheErrorCallback(url) {
		log('getCacheErrorCallback:' + url);
	}

})();

// 来自 NLF 的 Super_preloader，主要2个函数: hrefInc 和 autoGetLink
var NLF = {
	nextPageKey: [  //下一页关键字
		'下一页',
		'下一頁',
		'下1页',
		'下1頁',
		'下页',
		'下頁',
		'翻页',
		'翻頁',
		'翻下頁',
		'翻下页',
		'下一张',
		'下一張',
		'下一幅',
		'下一章',
		'下一节',
		'下一節',
		'下一篇',
		'后一页',
		'後一頁',
		'前进',
		'下篇',
		'后页',
		'往后',
		'Next',
		'Next Page',
		'次へ'
	],
	autoMatch: {
		keyMatch:true,  //是否启用关键字匹配
		digitalCheck:true,  //对数字连接进行检测,从中找出下一页的链接
	    cases:false,  //关键字区分大小写....
		pfwordl:{//关键字前面的字符限定.
			previous:{//上一页关键字前面的字符,例如 "上一页" 要匹配 "[上一页" ,那么prefix要的设置要不小于1,并且character要包含字符 "["
				enable:true,
				maxPrefix:3,
				character:[' ','　','[','［','<','＜','‹','«','<<','『','「','【','(','←']
			},
			next:{//下一页关键字前面的字符
				enable:true,
				maxPrefix:2,
				character:[' ','　','[','［','『','「','【','(']
			}
		},
		sfwordl:{//关键字后面的字符限定.
			previous:{//上一页关键字后面的字符
				enable:true,
				maxSubfix:2,
				character:[' ','　',']','］','』','」','】',')']
			},
			next:{//下一页关键字后面的字符
				enable:true,
				maxSubfix:3,
				character:[' ','　',']','］','>','﹥','›','»','>>','』','」','】',')','→']
			}
		},
	},
	autoGetLink: function(doc,win){
		if(!NLF.autoMatch.keyMatch)return;
		if(!NLF.parseKWRE.done){
			NLF.parseKWRE();
			NLF.parseKWRE.done=true;
		};

		var startTime=new Date();

		var _nextPageKey=NLF.nextPageKey;
		var _nPKL=NLF.nextPageKey.length;
		var _getFullHref=NLF.getFullHref;
		var _getAllElementsByXpath=getElementsByXPath;
		var _Number=Number;
		var cplink = cplink || win.location.href;
		var _domain_port=cplink.match(/https?:\/\/([^\/]+)/)[1];//端口和域名,用来验证是否跨域.
		var alllinks=doc.links;
		var alllinksl=alllinks.length;

		var curLHref=cplink;
		var _nextlink;

		var DCEnable=NLF.autoMatch.digitalCheck;
		var DCRE=/^\s*\D{0,1}(\d+)\D{0,1}\s*$/;

		var i,a,ahref,atext,numtext;
		var aP,initSD,searchD=1,preS1,preS2,searchedD,pSNText,preSS,nodeType;
		var nextS1,nextS2,nSNText,nextSS;
		var aimgs,j,jj,aimg_x,xbreak,k,keytext;

		function finalCheck(a,type){
			//C.log(a);
			var ahref=a.getAttribute('href');//在chrome上当是非当前页面文档对象的时候直接用a.href访问,不返回href
			ahref=_getFullHref(ahref, doc);//从相对路径获取完全的href;

			// debug([ahref, _domain_port].join("\n"))
			//3个条件:http协议链接,非跳到当前页面的链接,非跨域
			if(/^https?:/i.test(ahref) && ahref.replace(/#.*$/,'')!=curLHref && ahref.match(/https?:\/\/([^\/]+)/)[1]==_domain_port){
				debug((type=='pre'? '上一页' : '下一页')+'匹配到的关键字为:',atext);
				return a;//返回对象A
				//return ahref;
			};
		};

		debug('全文档链接数量:',alllinksl);

		for(i=0;i<alllinksl;i++){
			if(_nextlink)break;
			a=alllinks[i];
			if(!a)continue;//undefined跳过
			//links集合返回的本来就是包含href的a元素..所以不用检测
			//if(!a.hasAttribute("href"))continue;
			atext=a.textContent;
			if(atext){
				if(DCEnable){
					numtext=atext.match(DCRE);
					if(numtext){//是不是纯数字
						//C.log(numtext);
						numtext=numtext[1];
						//alert(numtext);
						aP=a;
						initSD=0;

						if(!_nextlink){
							preS1=a.previousSibling;
							preS2=a.previousElementSibling;


							while(!(preS1 || preS2) && initSD<searchD){
								aP=aP.parentNode;
								if(aP){
									preS1=aP.previousSibling;
									preS2=aP.previousElementSibling;
								};
								initSD++;
								//alert('initSD: '+initSD);
							};
							searchedD=initSD>0? true : false;

							if(preS1 || preS2){
								pSNText=preS1? preS1.textContent.match(DCRE) : '';
								if(pSNText){
									preSS=preS1;
								}else{
									pSNText=preS2? preS2.textContent.match(DCRE) : '';
									preSS=preS2;
								};
								//alert(previousS);
								if(pSNText){
									pSNText=pSNText[1];
									//C.log(pSNText)
									//alert(pSNText)
									if(_Number(pSNText)==_Number(numtext)-1){
										//alert(searchedD);
										nodeType=preSS.nodeType;
										//alert(nodeType);
										if(nodeType==3 || (nodeType==1 && (searchedD? _getAllElementsByXpath('./descendant-or-self::a[@href]',preSS,doc).snapshotLength==0 : (!preSS.hasAttribute('href') || _getFullHref(preSS.getAttribute('href'), doc)==curLHref)))){
											_nextlink=finalCheck(a,'next');
											//alert(_nextlink);
										};
										continue;
									};
								};
							};
						};

						continue;
					};
				};
			}else{
				atext=a.title;
			};
			if(!atext){
				aimgs=a.getElementsByTagName('img');
				for(j=0,jj=aimgs.length;j<jj;j++){
					aimg_x=aimgs[j];
					atext=aimg_x.alt || aimg_x.title;
					if(atext)break;
				};
			};
			if(!atext)continue;
			if(!_nextlink){
				xbreak=false;
				for(k=0;k<_nPKL;k++){
					keytext=_nextPageKey[k];
					if(!(keytext.test(atext)))continue;
					_nextlink=finalCheck(a,'next');
					xbreak=true;
					break;
				};
				if(xbreak || _nextlink)continue;
			};
		};

		debug('搜索链接数量:',i,'耗时:',new Date()-startTime,'毫秒')

		return _nextlink;
	},
	parseKWRE: function(){
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

			var pfwordl=NLF.autoMatch.pfwordl,
						sfwordl=NLF.autoMatch.sfwordl;

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
			//alert(plwords);
			slwords=RE_maxSubfix>0? ('['+(RE_enable_b? strMTE(RE_character_b.join('')) : '.')+']{0,'+RE_maxSubfix+'}') : '';
			slwords=slwords + '\\s*$';
			//alert(slwords);
			rep= NLF.autoMatch.cases ? '' : 'i';

			for(var i=0;i<pageKeyLength;i++){
				pageKey[i]=new RegExp(plwords + strMTE(pageKey[i]) + slwords,rep);
				//alert(pageKey[i]);
			};
			return pageKey;
		}

		//转成正则.
		// prePageKey=modifyPageKey('previous',prePageKey,prePageKey.length);
		NLF.nextPageKey=modifyPageKey('next', NLF.nextPageKey, NLF.nextPageKey.length);
	},
	getFullHref: function(href, doc){
		if(typeof href!='string') href=href.getAttribute('href');
		var a=doc.createElement('a');
		a.href=href;
		return a.href;
	},
	hrefInc: function(obj,doc,win){

		var _cplink = cplink || win.location.href;
		_cplink = _cplink.replace(/#.*$/,''); //url 去掉hash

		function getHref(href){
			var mFails=obj.mFails;
			if(!mFails)return href;
			var str;
			if(typeof mFails=='string'){
				str=mFails;
			}else{
				var fx;
				var array=[];
				var i,ii;
				var mValue;
				for(i=0,ii=mFails.length;i<ii;i++){
					fx=mFails[i];
					if(!fx)continue;
					if(typeof fx=='string'){
						array.push(fx);
					}else{
						mValue=href.match(fx);
						if(!mValue)return href;
						array.push(mValue);
					};
				};
				var str=array.join('');
			};
			return str;
		};
		 // alert(getHref(_cplink))

		var sa=obj.startAfter;
		var saType=typeof sa;
		var index;

		if(saType=='string'){
			index=_cplink.indexOf(sa);
			if(index==-1){
				_cplink=getHref(_cplink);
				index=_cplink.indexOf(sa);
				if(index==-1)return;
				// alert(index);
			};
		}else{
			var tsa=_cplink.match(sa);
			// alert(sa);
			if(!tsa){
				_cplink=getHref(_cplink);
				sa=(_cplink.match(sa) || [])[0];
				if(!sa)return;
				index=_cplink.indexOf(sa);
				if(index==-1)return;
			}else{
				sa=tsa[0];
				index=_cplink.indexOf(sa);
				//alert(index)
				//alert(tsa.index)
			};
		};

		index+=sa.length;
		var max=obj.max===undefined? 9999 : obj.max;
		var min=obj.min===undefined? 1 : obj.min;
		var aStr=_cplink.slice(0,index);
		var bStr=_cplink.slice(index);
		var nbStr=bStr.replace(/^(\d+)(.*)$/,function(a,b,c){
			b=Number(b)+obj.inc;
			if(b>=max || b<min)return a;
			return b+c;
		});
		//alert(aStr+nbStr);
		if(nbStr!==bStr){
			var ilresult;
			try{
				ilresult=obj.isLast(doc,win,_cplink);
			}catch(e){
				// debug("Error: getNextUrl hrefInc().", e);
			}
			if(ilresult)return;
			return aStr+nbStr;
		};
	}
};


function updateIcon(){
	var newState = "";
	var tooltiptext = "";
    var checkautomenu = $("uAutoPagerize-AUTOSTART");
	if (ns.AUTO_START == false) {
		newState = "off";
		tooltiptext = "自动翻页已关闭";
		checkautomenu.setAttribute("checked", false);
	} else {
		if (content.ap) {
			newState = content.ap.state;
			tooltiptext = content.ap.state;
			if (tooltiptext == "terminated"){ tooltiptext = "自动翻页已结束" };
			if (tooltiptext == "enable")	{ tooltiptext = "自动翻页已启用" };
		} else {
			newState = "disable";
			tooltiptext = "此页面不支持自动翻页";
		}
		checkautomenu.setAttribute("checked", true);
	}
	ns.icon.setAttribute('state', newState);
	ns.icon.setAttribute('tooltiptext', tooltiptext);
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
			ret = NLF.autoGetLink(doc, win);
			// debug("NextLink is auto. ", content.location.href);
		}else{
			ret= getFirstElementByXPath(selector, doc);
		};
	}else if(type == 'function'){
		ret=selector(doc,win,cplink);
	}else if(type == 'undefined'){
		ret = NLF.autoGetLink(doc, win);
	}else{
		var url = NLF.hrefInc(selector,doc,win);
		if(url){
			ret = doc.createElement('a');
			ret.setAttribute('href', url);
		}
	};
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
		var cache = loadFile('uAutoPagerize.json');
		if (!cache) return false;
		cache = JSON.parse(cache);
		ns.SITEINFO = cache;
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
	saveFile('uAutoPagerize.json', JSON.stringify(info));

	ns.SITEINFO = info;
	log('getCacheCallback:' + url);
}

function getCacheErrorCallback(url) {
	log('getCacheErrorCallback:' + url);
}

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

	['onload','onerror','onreadystatechange'].forEach(function(k) {
		if (obj[k] && (typeof(obj[k]) == 'function' || obj[k] instanceof Function)) req[k] = function() {
			obj[k]({
				status          : (req.readyState == 4) ? req.status : 0,
				statusText      : (req.readyState == 4) ? req.statusText : '',
				responseHeaders : (req.readyState == 4) ? req.getAllResponseHeaders() : '',
				responseText    : req.responseText,
				responseXML     : req.responseXML,
				readyState      : req.readyState,
				finalUrl        : (req.readyState == 4) ? req.channel.URI.spec : '',
				URI             : req.channel.URI,
				originalURI     : req.channel.originalURI
			});
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

function alert(title, info){
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

(function(){
    var updateToolbar = {
        /**
         * 只能运行一次？有问题？
         */
        runOnce: function(){
            var toolbars = document.querySelectorAll("toolbar");
            Array.slice(toolbars).forEach(function(toolbar) {
                var currentset = toolbar.getAttribute("currentset");
                if (currentset.split(",").indexOf("uAutoPagerize-icon") < 0) return;
                toolbar.currentSet = currentset;

                // toolbar.ownerDocument.persist(toolbar.id, "currentset");
                try {
                    BrowserToolboxCustomizeDone(true);
                } catch (ex) {}
            });
        }
    };

    if(!window.isUrlbar){
        updateToolbar.runOnce();
    }

    delete window.isUrlbar;

})();