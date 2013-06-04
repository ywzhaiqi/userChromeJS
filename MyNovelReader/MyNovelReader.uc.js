// ==UserScript==
// @name           MyNovelReader.uc.js
// @namespace      ywzhaiqi@gmail.com
// @author         ywzhaiqi
// @description    小说清爽阅读
// @include        main
// @charset        UTF-8
// @version        0.0.1
// @note
// ==/UserScript==

(function(css){

var isUrlbar = false; // 放置的位置，true为地址栏，false为附加组件栏（可移动按钮）。
var DEBUG = true;
var AUTO_START = true;
var BASE_REMAIN_HEIGHT = 600;
var MAX_PAGER_NUM = -1;  //默认最大翻页数， -1表示无限制

var MY_SITEINFO_FILENAME = "_uNovelReader.js";
var DB_FILENAME = "uNovelReader.db.js";
var XHR_TIMEOUT = 30 * 1000;
var isFullHref = true;

var SITEINFO_IMPORT_URLS = [
    ""
];

// 自动启用列表
var INCLUDE = [
    // "reader.qidian.com/BookReader/*,*.aspx"
];

var MY_SITEINFO = [

];

var AUTO_RULE = {
    // next_text: /[下后][一]?[页张个篇章节步]/,
    // prev_text: /[上前][一]?[页张个篇章节步]/,
    nextLink: '//a[descendant-or-self::*[contains(text(),"下一页")]][@href] | //a[descendant-or-self::*[contains(text(),"下一章")]][@href]',
    nextLinkIgnore: /index|last/i,

    prevLink: '//a[contains(text(),"上一页")][@href] | //a[contains(text(),"上一章")][@href]',

    // 按顺序匹配，匹配到则停止。
    indexLink: ['//a[contains(text(),"返回书目")][@href]', '//a[contains(text(),"章节目录")][@href]',
        '//a[contains(text(),"章节列表")][@href]', '//a[contains(text(),"回目录")][@href]',
        '//a[contains(text(),"目录")][@href]'],

    chapterTitleReg: /第\S+[章节].*/,
    titleReplace: /书书网|最新章节/,

    contentSelector: ["#bmsy_content", "#bookpartinfo", "#htmlContent", "#chapter_content", "#chapterContent", "#partbody",
        "#article_content", ".novel_content", ".noveltext", "#booktext", "#BookText", "#readtext", "#text_c", "#txt_td",
        "#contentTxt", "#oldtext", "#a_content", "#contents", "#content2", "#content", ".content"],

    contentRemove: "script, iframe, a",
    contentReplace: "",
    replaceBrs: /(<br[^>]*>[ \n\r\t]*){2,}/gi                         // 替换为<p>
};

if (typeof window.uNovelReader != "undefined") {
    window.uNovelReader.theEnd();
}

var ns = window.uNovelReader = {
    INCLUDE_REGEXP : /\s+/,
    MY_SITEINFO    : MY_SITEINFO.slice(),
    SITEINFO: [],

    get prefs() {
        delete this.prefs;
        return this.prefs = Services.prefs.getBranch("uNovelReader.");
    },
    get file() {
        var aFile = Services.dirsvc.get('UChrm', Ci.nsILocalFile);
        aFile.appendRelativePath(MY_SITEINFO_FILENAME);
        delete this.file;
        return this.file = aFile;
    },
    get INCLUDE() INCLUDE,
    set INCLUDE(arr) {
        try {
            this.INCLUDE_REGEXP = arr.length > 0 ?
                new RegExp(arr.map(wildcardToRegExpStr).join("|")) :
                /\s+/;
            INCLUDE = arr;
        } catch (e) {
            log("INCLUDE 不正确");
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
        let m = $("uNovelReader-BASE_REMAIN_HEIGHT");
        if (m) m.setAttribute("tooltiptext", BASE_REMAIN_HEIGHT = num);
        return num;
    },
    get MAX_PAGER_NUM() MAX_PAGER_NUM,
    set MAX_PAGER_NUM(num) {
        num = parseInt(num, 10);
        if (!num) return num;
        let m = $("uNovelReader-MAX_PAGER_NUM");
        if (m) m.setAttribute("tooltiptext", MAX_PAGER_NUM = num);
        return num;
    },
    get DEBUG() DEBUG,
    set DEBUG(bool){
        let m = $("uNovelReader-DEBUG");
        if (m) m.setAttribute("checked", DEBUG = !!bool);
        return bool;
    },

    init: function(){
        this.makeIcon();

        ["DEBUG", "AUTO_START", "BASE_REMAIN_HEIGHT", "MAX_PAGER_NUM"].forEach(function(name) {
            try {
                ns[name] = ns.prefs.getBoolPref(name);
            } catch (e) {}
        }, ns);

        // if(!getCache()){
        //     requestSITEINFO();
        // }
        ns.INCLUDE = INCLUDE;
        ns.addListener();
        ns.loadSetting();
        updateIcon();
    },
    uninit: function() {
        ns.removeListener();
        ["DEBUG", "AUTO_START", "BASE_REMAIN_HEIGHT", "MAX_PAGER_NUM"].forEach(function(name) {
            try {
                ns.prefs.setBoolPref(name, ns[name]);
            } catch (e) {}
        }, ns);
    },
    theEnd: function() {
        var ids = ["uNovelReader-icon", "uNovelReader-popup"];
        for (let [, id] in Iterator(ids)) {
            let e = document.getElementById(id);
            if (e) e.parentNode.removeChild(e);
        }
        ns.removeListener();
    },
    addListener: function() {
        gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);
        window.addEventListener('unload', this, false);
    },
    removeListener: function() {
        gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);
        window.removeEventListener('unload', this, false);
    },
    handleEvent: function(event) {
        switch(event.type) {
            case "DOMContentLoaded":
                if (this.AUTO_START)
                    this.autoLaunch(event.target.defaultView);
                break;
            case "unload":
                this.uninit(event);
                break;
        }
    },
    makeIcon: function(){
        var addonBar = isUrlbar ? $('urlbar-icons') : $('addon-bar');
        ns.icon = addonBar.appendChild($C("toolbarbutton", {
            id: "uNovelReader-icon",
            class: "toolbarbutton-1",
            type: "context",
            removable: "true",
            state: "enable",
            tooltiptext: "自动启用开启",
            onclick: "if (event.button != 2) uNovelReader.iconClick(event);",
            context: "uNovelReader-popup",
            style: "list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADgklEQVQ4jT3I2VJaBxwH4HPXZ+lNn6czbdM0i7WWaBJcoyCpYpB9P+ewL4fDJjuIsgQEUZaAgsSm08xEY6eZjtOOD5Dz//WiM734bj4mXWx9napMryOFCQn5C0ksXlCkcEGR4gWJxQsK5Sbkz4xJLE7/+/zks5CfSNnq5Z+xWPFLZu9weu1OjohPjMDHh+SMDuFOnoFPjMDFhghkxogWJ+Dib+BOjsAnhsTFRxIXH6LUmJ4zwcwITrEPR6QPd2IIIXcGk/8YzugAdqEHb3KA65tPMLAZGP0dcLEBnGKfbEIP8dKYGHeiL1mCHbKGTmDyt2h8eYWTwSW0XAW28CmcYhe/vf+IeOoAoXQf5kCbrKETyRzoIJwdSgwX7UpGXxsmfxt6zxGMnhpS+RoUGgHeZA+t0yk+XN0gX6pAa4tAaczC4D0mvecIgdQbiWHFE9Lwr7HlqGLbWcWuqwGFIQudqwJ7uI1ArILT3hCsN4ZSrY9651cYvHXaYWvwp/rEWIJHZPI1IWQHaPZ+x6e//oGeyyOSPUW7O0G60ET5sAmDPYh6a4Cbj1fQWYOkNObg2+sRo3PVySUeodrogvclcD6eQql2YEkdw0G9B70tjE5vDDMbxY5lD+tbdiyqPKQyl+COdYgx+V7TmjYF2QsX1JYUGq0efpTrYQ+1UTg8xZbeh97wLba1HObWA5BvJ7FhLNGGMQ9ebBGjdVVow5DDsiYLNtJGudrGpk6A0V3GXq6GHXME7z/8gUAki3ztDPXOJUzufZJvx8EKLWI0bJlWNSksqKLwJ45xe/s3MvkqcuU20oUaBmdvcT6ewsaFwfuT4H0xqDQ8LSgDcISaxKhtBWlRHcfcehBH3Xc4PxthZl4B+SYP+SaL9skQuwYO+f0mll+68eCZHQvKID1VRWDxVSXmF0tOmlcJJFOEsaaJ0NM1HWZXWKzu7qHSmsDOC7g3t4NouoG7uzuozTGa2whKT5QCDO4DiVGZMvTTiwDJFCHMrvkxs+qj51si+cRDeqnh6P7Pr0imCNE3MitFU1VyuET88MxBs2sBMnsPiWHDjduZFQ8eyHk8XHTRoyU3Hi258P28Ed/JjHi87MbDRRcer3jw7RML7sn09HCRle4/55A+OH/HBMXcV7FCd2Jw7eOVPS9pHAVp11kkHVcmLbdPu87i/7RsSdKypc96vkSpg9Gl1Wr94l8N9+ZaOkZ3KQAAAABJRU5ErkJggg==);"
        }));

        var xml = '\
            <menupopup id="uNovelReader-popup"\
                       position="after_start"\
                       onpopupshowing="if (this.triggerNode) this.triggerNode.setAttribute(\'open\', \'true\');"\
                       onpopuphiding="if (this.triggerNode) this.triggerNode.removeAttribute(\'open\');">\
                <menuitem label="启用自动进入阅读模式"\
                          id="uNovelReader-AUTOSTART"\
                          type="checkbox"\
                          autoCheck="true"\
                          checked="'+ AUTO_START +'"\
                          oncommand="uNovelReader.toggle(event);"/>\
                <menuitem label="重载配置文件"\
                          oncommand="uNovelReader.loadSetting(true);"/>\
                <menuitem label="重置站点信息"\
                          oncommand="uNovelReader.resetSITEINFO();"/>\
                <menuseparator/>\
                <menuitem label="设置翻页高度"\
                          id="uNovelReader-BASE_REMAIN_HEIGHT"\
                          tooltiptext="'+ BASE_REMAIN_HEIGHT +'"\
                          oncommand="uNovelReader.BASE_REMAIN_HEIGHT = prompt(\'\', uNovelReader.BASE_REMAIN_HEIGHT);"/>\
                <menuitem label="设置最大自动翻页数"\
                          id="uNovelReader-MAX_PAGER_NUM"\
                          tooltiptext="'+ MAX_PAGER_NUM +'"\
                          oncommand="uNovelReader.MAX_PAGER_NUM = prompt(\'\', uNovelReader.MAX_PAGER_NUM);"/>\
                <menuitem label="调试模式"\
                          id="uNovelReader-DEBUG"\
                          type="checkbox"\
                          autoCheck="false"\
                          checked="'+ DEBUG +'"\
                          oncommand="uNovelReader.DEBUG = !uNovelReader.DEBUG;"/>\
                <menuseparator/>\
                <menuitem label="在线搜索翻页规则"\
                          id="uNovelReader-search"\
                          oncommand="uNovelReader.search()"/>\
            </menupopup>\
        ';
        var range = document.createRange();
        range.selectNodeContents($('mainPopupSet'));
        range.collapse(false);
        range.insertNode(range.createContextualFragment(xml.replace(/\n|\t/g, '')));
        range.detach();

        /* 更新按鈕到 Toolbar */
        var toolbars = document.querySelectorAll("toolbar");
        Array.slice(toolbars).forEach(function(toolbar) {
            var currentset = toolbar.getAttribute("currentset");
            if (currentset.split(",").indexOf("uNovelReader-icon") < 0) return;
            toolbar.currentSet = currentset;
            try {
                BrowserToolboxCustomizeDone(true);
            } catch (ex) {}
        });
    },
    loadSetting: function(isAlert) {
        var data = loadText(this.file);
        if (!data) return false;
        var sandbox = new Cu.Sandbox( new XPCNativeWrapper(window) );
        sandbox.INCLUDE = null;
        sandbox.MY_SITEINFO = [];
        sandbox.USE_MY_SITEINFO = true;
        try {
            Cu.evalInSandbox(data, sandbox, '1.8');
        } catch (e) {
            return log('load error.', e);
        }
        ns.MY_SITEINFO = sandbox.USE_MY_SITEINFO ? sandbox.MY_SITEINFO.concat(MY_SITEINFO): sandbox.MY_SITEINFO;
        if (sandbox.INCLUDE)
            ns.INCLUDE = sandbox.INCLUDE;
        if (isAlert)
            alert('uAutoPagerize', '配置文件已经重新载入');

        return true;
    },
    autoLaunch: function(win, timer){
        if(ns.INCLUDE_REGEXP.test(win.location.href)){
            ns.launch(win, timer);
        }
    },
    launch: function(win, timer){
        if (win.location.href.indexOf('http') !== 0)
            return updateIcon();

        var doc = win.document;
        if (!/html|xml/i.test(doc.contentType) ||
            doc.body instanceof HTMLFrameSetElement ||
            win.frameElement && !(win.frameElement instanceof HTMLFrameElement) ||
            doc.querySelector('meta[http-equiv="refresh"]'))
            return updateIcon();

        var info;
        info = ns.getInfo(ns.MY_SITEINFO, win);

        if(!info) info = ns.getInfo(ns.SITEINFO, win);

        win.setTimeout(function(){
            win.reader = new Reader(win.document, info);
        }, timer || 0);
    },
    getFocusedWindow: function () {
        var win = document.commandDispatcher.focusedWindow;
        return (!win || win == window) ? content : win;
    },
    iconClick: function(event){
        if (!event || !event.button) {
            var win = this.getFocusedWindow();
            ns.launch(win);
        } else if (event.button == 1) {  // 鼠标中键
            ns.loadSetting(true);
        }
    },
    resetSITEINFO: function(){

    },
    toggle: function() {
        if (ns.AUTO_START) {
            ns.AUTO_START = false;
            updateIcon();
        } else {
            ns.AUTO_START = true;
            // if (!content.ap)
            //     ns.launch(content);
            // else updateIcon();
        }
    },
    getInfo: function(list, win){
        if (!list) list = ns.MY_SITEINFO.concat(ns.SITEINFO);
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

                return info;
            }catch(e){
                log('error at getInfo() : ' + e);
            }
        }
        return null;
    }
};

function Parser(){
    this.init.apply(this, arguments);
}
Parser.prototype = {
    init: function(doc, info){
        if(!doc) return;
        this.info = info;
        this.doc = doc;
        this.getAll();
    },
    getAll: function(){
        this.patch();
        this.getTitles();

        return {
            bookTitle: this.bookTitle,
            chapterTitle: this.chapterTitle,
            docTitle: this.docTitle,
            content: this.getContent(),
            indexUrl: this.getIndexUrl(),
            prevUrl: this.getPrevUrl(),
            nextUrl: this.getNextUrl()
        };
    },
    patch: function(){
        var patchFunc = this.info && this.info.patch;
        if(patchFunc){
            try{
                 patchFunc(this.doc);
                 debug("  Apply Content Patch Success.");
            }catch(e){
                 debug("  Error: Content Patch Error!");
            }
        }
    },
    getTitles: function(){
        if(this.info && this.info.titleReg){
            var matches = this.doc.title.match(this.info.titleReg);
            if(matches && matches.length == 3){
                var titlePos = (this.info.titlePos || 0) + 1,
                    chapterPos = (titlePos == 1) ? 2 : 1;
                this.bookTitle = matches[titlePos].trim();
                this.chapterTitle = matches[chapterPos].trim();
            }else if(matches){
                debug("  Title Matches Length: " + matches.length);
            }else{
                this.autoGetTitles();
            }
        }else{
            this.autoGetTitles();
        }

        this.docTitle = this.bookTitle ?
            this.bookTitle + ' - ' + this.chapterTitle :
            this.doc.title;
    },
    autoGetTitles: function(){
        var title = this.doc.title;

        var h1s = this.doc.querySelectorAll("h1");
        if(h1s.length == 1){
            title = h1s[0].textContent;
        }

        // 对标题进行判断。（形如：第四章 风行 最新章节，返回：第四章 风行）
        var m = title.match(AUTO_RULE.chapterTitleReg);
        if(m){
            this.chapterTitle = m.toString();
        }else{
            this.chapterTitle = title.replace(AUTO_RULE.titleReplace, '');
        }
    },
    getContent: function(){
        var content = this.getElementTool("contentSelector");

        if(content){
            var removes = content.querySelectorAll(AUTO_RULE.contentRemove);

            for (var i = removes.length - 1; i >= 0; i--) {
                removes[i].parentNode.removeChild(removes[i]);
            }
        }

        this.content = this.handleContent(content);
        if(!this.content){
            debug("Cant't find Content.");
        }
        return this.content;
    },
    handleContent: function(content){
        if(!content) return;

        var html = content.innerHTML;
        if(this.info && this.info.contentReplace){
            html = html.replace(this.info.contentReplace, '');
        }else{
            html = html.replace(AUTO_RULE.contentReplace, '');
        }

        /* Turn all double br's into p's */
        html = html.replace(AUTO_RULE.replaceBrs, '</p><p>');

        return html;
    },
    getIndexUrl: function(){
        var indexLink = this.getElementTool("indexLink");

        var indexUrl;
        if(indexLink){
            indexUrl = isFullHref ? this.getFullHref(indexLink) : indexLink.href;
            debug("找到首页链接: " + indexUrl);
        }else{
            debug("无法找到首页链接.");
        }

        this.indexUrl = indexUrl;
        return indexUrl;
    },
    getPrevUrl: function(){
        var prevLink = this.getElementTool("prevLink");

        var preUrl;
        if(prevLink){
            preUrl = isFullHref ? this.getFullHref(prevLink) : prevLink.href;
            debug("找到上一页链接: " + preUrl);
        }else{
            debug("无法找到上一页链接.");
        }

        this.preUrl = preUrl;
        return preUrl;
    },
    getNextUrl: function(){
        var nextLink = this.getElementTool("nextLink");

        var nextUrl;
        if(nextLink){
            nextUrl = nextLink.href;
            if(AUTO_RULE.nextLinkIgnore.test(nextUrl) || nextUrl == this.indexUrl){
                debug("下一页链接被忽略: " + nextUrl);
                nextUrl = null;
            }else{
                nextUrl = isFullHref ? this.getFullHref(nextLink) : nextUrl;
                debug("找到下一页链接: " + nextUrl);
            }
        }else{
            debug("无法找到下一页链接.");
        }

        this.nextUrl = nextUrl;
        return nextUrl;
    },
    getElementTool: function(typeName){
        if(this.info && this.info[typeName]){
            return getElementMix(this.info[typeName], this.doc);
        }

        var elem;
        var selectors = AUTO_RULE[typeName];

        if(typeof selectors === 'string'){
            elem = getElementMix(selectors, this.doc);
            if(!elem)
                debug(selectors, this.doc);
            return elem;
        }

        for(var i = 0, l = selectors.length; i < l; i++){
            elem = getElementMix(selectors[i], this.doc);
            if(elem){
                return elem;
            }
        }
    },
    getFullHref: function(href) {
        if (typeof href == 'undefined') return '';
        if (typeof href != 'string') href = href.getAttribute('href');
        var a = this.getFullHref.a;
        if (!a) {
            this.getFullHref.a = a = this.doc.createElement('a');
        }
        a.href = href;
        return a.href;
    }
};

function Reader(){
    this.init.apply(this, arguments);
}
Reader.prototype = {
    parsedPages: [],
    nextURLCache: [],
    tpl_content: '\
        <div class="chapter-head">{chapterTitle}</div>\
        <div class="content">{content}</div>\
        <div class="chapter-footer-nav">\
             <a href="{prevUrl}"><<上一页</a> | \
            <a href="{indexUrl}">首页</a> | \
            <a href="{nextUrl}">下一页>></a>\
        </div>\
    ',

    init: function(doc, info){
        this.info = info;
        this.doc = doc;
        this.win = doc.defaultView;

        var parser = new Parser(doc, info);
        if(!parser.content) return;

        this.parsedPages[this.win.location.href.replace(/\/$/, '')] = true;
        this.prepDocument();
        this.addStyle();

        this.doc.title = parser.docTitle;
        this.doc.body.innerHTML = this.nano('<div id="wrapper">' + this.tpl_content + '</div>', parser);

        var self = this;
        var nextUrl = parser.nextUrl;
        if(nextUrl){
            this.nextURLCache.push(nextUrl);
            this.scroll = function() { self.onScroll(); };
            this.win.addEventListener("scroll", this.scroll, false);
        }
    },
    prepDocument: function() {
        this.win.onload = this.win.onunload = function() {};

        this.doc.onmouseup = function(){};
        this.doc.onmousemove = function(){};
        this.doc.onmousedown = function(){};
        this.doc.onclick = function(){};
        this.doc.body.onclick = function(){};
        this.doc.oncontextmenu = function(){};
        this.doc.body.oncontextmenu = function(){};
        this.doc.ondblclick = function(){};

        /* Remove all stylesheets */
        for (var k=0;k < this.doc.styleSheets.length; k+=1) {
            var style = this.doc.styleSheets[k];
            if (style && style.href !== null) {
                style.disabled = true;
            }
        }
        this.doc.body.removeAttribute('bgcolor');
        this.doc.body.removeAttribute('style');
    },
    onScroll: function(){
        var scrollHeight = Math.max(this.doc.documentElement.scrollHeight,
                                    this.doc.body.scrollHeight);
        var remain = scrollHeight - this.win.innerHeight - this.win.scrollY;
        if (remain < BASE_REMAIN_HEIGHT) {
            var nextUrl = this.nextURLCache.shift();
            if(nextUrl && !(nextUrl in this.parsedPages)){
                this.addNextPage(nextUrl);
                this.parsedPages[nextUrl] = true;
            }
        }
    },
    addNextPage: function(nextUrl){
        if(this.info && this.info.useiframe){
            this.frameRequest(nextUrl);
            return;
        }

        var self = this;
        GM_xmlhttpRequest({
            method: "GET",
            url: nextUrl,
            overrideMimeType: "text/html;charset=" + self.doc.characterSet,
            onload: function(res){
                var doc = new DOMParser().parseFromString(res.responseText, "text/html");
                self.loaded(doc);
                debug("Request loaded: ", nextUrl);
            }
        });
    },
    frameRequest: function(nextUrl){
        if(!this.iframe){
            this.iframe = this.doc.createElement('iframe');
            this.iframe.name = 'novelReaderRequest';
            this.iframe.width = this.iframe.height = 1;
            this.iframe.style.visibility = 'hidden';

            this.doc.body.appendChild(this.iframe);
        }

        this.iframe.src = nextUrl;

        this.iframe.addEventListener("load", iframeLoad, false);

        var self = this;
        function iframeLoad(){
            debug("iframe load");
            self.frameLoad(self.iframe);
        }

        this.cleanIframe = function(){
            self.iframe.src = "about:blank";
            self.iframe.contentDocument.location.href = "about:blank";
            self.iframe.removeEventListener("load", iframeLoad, false);
        };
    },
    frameLoad: function(iframe){
        var htmlDoc = iframe.contentDocument || iframe.contentWindow.document;
        this.loaded(htmlDoc);
        if(this.cleanIframe)
            this.cleanIframe();
    },
    loaded: function(doc){
        var parser = new Parser(doc, this.site);
        if(parser.content){
            var content = this.nano(this.tpl_content, parser);

            var wrapper = this.doc.getElementById('wrapper');
            wrapper.innerHTML = wrapper.innerHTML + content;
            if(parser.nextUrl){
                this.nextURLCache.push(parser.nextUrl);
            }
        }
    },
    addStyle: function(){
        var heads = this.doc.getElementsByTagName('head');
        if (heads.length > 0) {
            var node = this.doc.createElement('style');
            node.type = 'text/css';
            node.innerHTML = css;
            heads[0].appendChild(node);
        }
    },
    _regex: /\{([\w\.]*)\}/g,
    nano: function(template, data) {
        return template.replace(this._regex, function(str, key) {
            var keys = key.split('.'),
                value = data[keys.shift()];
            keys.forEach(function(key) {
                value = value[key];
            });
            return (value === null || value === undefined) ? '' : value;
        });
    }
};

function updateIcon(){

}

function getElementMix(selector, doc){
    var ret;
    try{
        ret = doc.querySelector(selector);
    }catch(e){
        ret = getElementByXPath(selector, doc);
    }
    return ret;
}

function getElementsMix(selector, doc){
    var nodes = [];
    try{
        var results = doc.querySelectorAll(selector);
        for (var i = 0; i < results.length; i++) {
            nodes[i] = results[i];
        }
    }catch(e){
        nodes = getElementsByXPath(selector, doc);
    }
    return nodes;
}

function getElementByXPath(xpath, node) {
    var result = getXPathResult(xpath, node, XPathResult.FIRST_ORDERED_NODE_TYPE);
    return result.singleNodeValue;
}

function getElementsByXPath(xpath, node) {
    var nodesSnapshot = getXPathResult(xpath, node, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
    var data = [];
    for (var i = 0, l = nodesSnapshot.snapshotLength; i < l; i++) {
        data[i] = nodesSnapshot.snapshotItem(i);
    }
    return data;
}

function getXPathResult(xpath, node, resultType){
    var doc = node.ownerDocument || node;
    return doc.evaluate(xpath, node, null, resultType, null);
}

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
    var top, height;
    if ('getBoundingClientRect' in elem) {
        var rect = elem.getBoundingClientRect();
        top = parseInt(rect.top, 10) + (doc.body.scrollTop || doc.documentElement.scrollTop);
        height = parseInt(rect.height, 10);
    } else {
        var c_style = doc.defaultView.getComputedStyle(elem, '');
        height = 0;
        var prop = ['height', 'borderTopWidth', 'borderBottomWidth',
            'paddingTop', 'paddingBottom',
            'marginTop', 'marginBottom'];
        prop.forEach(function(i) {
            var h = parseInt(c_style[i], 10);
            if (typeof h == 'number') {
                height += h;
            }
        });
        top = getElementPosition(elem).top;
    }
    return top ? (top + height) : null;
}

// end utility functions

function getCache(){

}

var finishCount = 0;
var siteinfo_data = [];

function requestSITEINFO(){
    finishCount = 0;
    siteinfo_data = [];

    var xhrStates = {};
    SITEINFO_IMPORT_URLS.forEach(function(i) {
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
            }
        };
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

    if(res.responseText){
        siteinfo_data.push(res.responseText);
    }

    saveSiteInfo();

    log('getCacheCallback:' + url);
}

function getCacheErrorCallback(url) {
    log('getCacheErrorCallback:' + url);
    saveSiteInfo();
}

function saveSiteInfo(){
    finishCount += 1;

    if(siteinfo_data && finishCount >= SITEINFO_IMPORT_URLS.length){
        saveFile(DB_FILENAME, siteinfo_data.join('\n'));
    }
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

function log(){ Application.console.log('[uNovelReader] ' + $A(arguments)); }
function debug(){ if (ns.DEBUG) Application.console.log('[uNovelReader DEBUG] ' + $A(arguments)); }
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

function message(title, info){
    Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService)
        .showAlertNotification(null, title, info, false, "", null, "");
}


})('\
/**\
 * 下面的是 InstaPaper简洁阅读皮肤\
 */\
#wrapper{\
    font-size: 18px;\
    position:absolute;\
    top:-10px;\
    right:35px;\
    width:100%;\
    min-height:120%;\
    border-right:1px solid #eee;\
    box-shadow:6px 0 10px rgba(0,0,0,0.20);\
}\
.chapter-head{\
    font-family:微软雅黑,新宋体,宋体,arial;\
    text-align:center;\
    margin-top:8px;\
    padding-top:5px;\
    margin-bottom:8px;\
    padding-bottom:5px;\
    color:#555;text-shadow:1px 1px white;\
    border-top:1px solid #999;\
    border-bottom:1px solid #999;\
    background-image:-webkit-linear-gradient(#F8F8F8,#EAEAEA);\
    letter-spacing:2px;\
}\
.content{\
    font-family:微软雅黑,新宋体,宋体,arial;\
    line-height:2em;\
    max-width:800px;\
    margin-left:auto;\
    margin-right:auto;\
    margin-bottom:10px;\
    background:#F4F4F4;\
}\
.chapter-head-nav{\
    display:none;\
}\
.chapter-footer-nav{\
    text-align:center;\
    font-size:13px;\
    margin:10px;\
    margin-bottom:40px;\
}\
'.replace(/\n|\t/g, ''));

window.uNovelReader.init();