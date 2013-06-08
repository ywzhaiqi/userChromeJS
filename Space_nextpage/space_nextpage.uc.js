// ==UserScript==
// @name          空格键页面底部翻页（调用nextPage.uc.xul）
// @author        ywzhaiqi@gmail.com
// @include       main
// ==/UserScript==

(function() {
    var space = " ".charCodeAt(0);
    gBrowser.mPanelContainer.addEventListener('keypress', function(event) {
        if (event.charCode != space){
            return;
        }

        // 有小说阅读脚本的逃过
        if(content.wrappedJSObject.readx){
            return;
        }

        if (event.target.nodeName.match(/input|textarea|select/i)){
            return;
        }


        var node = event.target;
        while (node && node.nodeName != "BODY")
            node = node.parentNode; 

        var 
            doc = node.ownerDocument,
            win = doc.defaultView,
            isFrame = (win.top != win)
        ;

        if(isFrame){
            return;
        }

        if(content.scrollMaxY <= content.scrollY){
            nextPage.next(true);
        }

    }, false);

    function debug(){
        content.console.log.apply(this, arguments);
    }
})();