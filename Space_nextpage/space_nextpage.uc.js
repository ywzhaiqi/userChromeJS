// ==UserScript==
// @name          空格键页面底部翻页（依次调用 uAutoPagerize、uSuper_preloader、nextPage.uc.xul）
// @description   默认设置小说阅读脚本启用后禁用
// @author        ywzhaiqi@gmail.com
// @include       main
// ==/UserScript==

if(window.Space_nextpage){
    window.Space_nextpage.uninit();
    window.Space_nextpage = null;
}

window.Space_nextpage = {
    init: function(){
        gBrowser.mPanelContainer.addEventListener('keypress', this, false);
    },
    uninit: function(){
        gBrowser.mPanelContainer.removeEventListener('keypress', this, false);
    },
    handleEvent: function(event){
        switch(event.type){
            case "keypress":
                this.keypress(event);
                break;
        }
    },
    goToNextPage: function(win){
        if (win.ap) {
            let nextURL = win.ap.nextLink && win.ap.nextLink.href;
            if (nextURL)
                win.location = nextURL;
        } else if (win.uSuper_preloader) {
            win.uSuper_preloader.go();
        } else if (window.nextPage) {
            nextPage.next(true);
        }
    },
    space: " ".charCodeAt(0),
    keypress: function(event){
        if (event.charCode != this.space)
            return;

        if (event.target.nodeName.match(/input|textarea|select/i))
            return;

        var
            doc = event.target.ownerDocument,
            win = doc.defaultView,
            isFrame = (win.top != win)
        ;

        if(!doc.body)
            return;

        // 鲜果阅读器防止出错
        if(win.location.href.match(/xianguo\.com\/reader/i))
            return;

        // 有小说阅读脚本的逃过
        if(doc.body.getAttribute("name") == "MyNovelReader")
            return;

        if(isFrame){
            var clientHeight = doc.body.clientHeight;
            var scrollTop = doc.body.scrollTop | doc.documentElement.scrollTop;
            var windowHeight = doc.all ? doc.getElementsByTagName("html")[0].offsetHeight : win.innerHeight;
            // 为什么 Firefox 下要加1？
            if ((scrollTop + windowHeight + 1) >= clientHeight)
                this.goToNextPage(win);
        }else{
            if(content.scrollMaxY <= content.scrollY)
                this.goToNextPage(win);
        }
    }
};

window.Space_nextpage.init();