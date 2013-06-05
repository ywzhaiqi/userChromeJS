// ==UserScript==
// @name           openLinkTabThirdPart.uc.js
// @description    点击链接如果是第三方域名则在新标签页打开，否则当前标签页。有黑名单
// @author         ywzhaiqi
// @namespace      ywzhaiqi@gmail.com
// @include        main
// @charset        UTF-8
// ==/UserScript==

/**
 * 例： www.163.com，域名是 163.com 在当前标签页打开，其它域名新标签页打开
 */

(function() {

    // 排除列表
    var EXCLUDE = [
        "http://booklink.me/*",
        "http://www.baidu.com/*",
    ];


    let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
    if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

    var EXCLUDE_REGEXP = new RegExp(EXCLUDE.map(wildcardToRegExpStr).join("|"));

    gBrowser.mPanelContainer.addEventListener('click', function(e){
        if (e.button == 0 && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {

            if(EXCLUDE_REGEXP.test(gBrowser.currentURI.href)){
                return;
            }

            var link = findLink(e.target);
            if(!link) return;

            var href = link.href;

            if (href && href.match(/^(https?|ftp):\/\//)) {
                e.preventDefault();
                e.stopPropagation();

                // if(link.host == gBrowser.currentURI.host){
                if(isThirdPart(link, gBrowser.currentURI)){
                    gBrowser.loadOneTab(href, {
                        referrerURI: document.documentURIObject,
                        charset: target.charset,
                        postData: null,
                        inBackground: false
                    });
                }else{
                    gBrowser.loadURI(href);
                }
            }
        }

    }, false);

    function findLink(element) {
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
    }

    function isThirdPart(aLink, bLink){
        try{
            var aTLD = Services.eTLD.getBaseDomainFromHost(aLink.host);
            var bTLD = Services.eTLD.getBaseDomainFromHost(bLink.host);
            return aTLD != bTLD;
        }catch(e){
            return aLink.host != bLink.host;
        }
    }

    function wildcardToRegExpStr(urlstr) {
        if (urlstr.source) return urlstr.source;
        let reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str){
            return str === "*" ? ".*" : "[^/]*";
        });
        return "^" + reg + "$";
    }
})();