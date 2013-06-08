// ==UserScript==
// @name          空格键页面底部翻页（调用nextPage.uc.xul）
// @author        ywzhaiqi@gmail.com
// @include       main
// ==/UserScript==

(function() {

    var space = ' '.charCodeAt(0);
    gBrowser.mPanelContainer.addEventListener('keypress', function(event) {
        if (event.charCode != space) return;
        if (event.target.nodeName.match(/input|textarea|select/i)) return;

        // 有小说阅读脚本的逃过
        if(content.wrappedJSObject.readx){
            return;
        }

        var doc = content.document,
            win = content.window;

        var clientHeight = doc.body.clientHeight;
        var scrollTop = doc.body.scrollTop | doc.documentElement.scrollTop;
        var windowHeight = doc.all ? doc.getElementsByTagName("html")[0].offsetHeight : win.innerHeight;
        // 为什么 Firefox 下要加1？
        if ((scrollTop + windowHeight + 1) >= clientHeight) {
            // alert("你到页面底部了");
            // super_preloader_next();
            // nextPage.next(true, null , "lastLink");
            nextPage.next(true);
        }

    }, false);

    

    // function super_preloader_next() {
    //     var document = (this.content && this.content.window) ? this.content.window.wrappedJSObject.document : this.document;
    //     var event = document.createEvent('HTMLEvents');
    //     event.initEvent('superPreloader.go', true, false);
    //     document.dispatchEvent(event);
    // }
    
})();