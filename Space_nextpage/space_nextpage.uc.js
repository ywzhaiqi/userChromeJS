// ==UserScript==
// @name          空格键页面底部翻页（调用nextPage.uc.xul）
// @description   默认设置小说阅读脚本启用后禁用。
// @author        ywzhaiqi@gmail.com
// @include       main
// ==/UserScript==

(function() {
    var space = " ".charCodeAt(0);

    gBrowser.mPanelContainer.addEventListener('keypress', function(event) {
        if (event.charCode != space){
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

        // 有小说阅读脚本的逃过
        // content.wrappedJSObject.readx && 
        if(doc.body.getAttribute("name") == "MyNovelReader"){
            return;
        }

        if(isFrame){
            var clientHeight = doc.body.clientHeight;
            var scrollTop = doc.body.scrollTop | doc.documentElement.scrollTop;
            var windowHeight = doc.all ? doc.getElementsByTagName("html")[0].offsetHeight : win.innerHeight;
            // 为什么 Firefox 下要加1？
            if ((scrollTop + windowHeight + 1) >= clientHeight) {
                goToNextPage();
            }
        }else{
            if(content.scrollMaxY <= content.scrollY){
                goToNextPage();
            }
        }

    }, false);

    function goToNextPage(){
        nextPage.next(true);
        // alert("goToNextPage")
    }

    function debug(arg){
        content.console.log("[space_nextpage] " + arg);
    }

})();