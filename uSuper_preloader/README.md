uSuper_preloader.uc.js
======================

基于 NLF 的 Super_preloader（版本 2.0.22）修改而来的 uc脚本。感谢作者 NFL，同时也感谢规则更新者。 [Super\_preloader.db 超级翻页规则 个人更新版](http://www.kafan.cn/forum.php?mod=viewthread&tid=1235297)

## 特性

 - 保持原有功能
 - 增加对 noscript 的支持
 - 精简了代码，去掉了其它浏览器的兼容等
 - 如果数据文件有修改会自动载入
 - 默认 Ctrl + 长按鼠标左键 暂停翻页，修改如下

## 使用说明

 - uSuper_preloader.uc.js 脚本文件，放在uc脚本管理器指定目录下
 - uSuper_preloader.db.js 设置、站点配置文件，放在下面的默认路径中，如果没有 local 文件夹新建一个

     - 默认路径为 Chrome 目录下的 `Local\uSuper_preloader.db.js`（可在代码里更改）
     - 删除了无用的数据，只保留了必须的
     - 增加了一些站点配置
     - 兼容原数据文件

## 鼠标手势调用

图标总开关

    uSuper_preloader.toggle();

上一页 （原脚本的方式）

    (function() {
        var document = content.document;
        var event = document.createEvent('HTMLEvents');
        event.initEvent('superPreloader.back', true, false);
        document.dispatchEvent(event);
    })();

下一页（原脚本的方式）

    (function() {
        var document = content.document;
        var event = document.createEvent('HTMLEvents');
        event.initEvent('superPreloader.go', true, false);
        document.dispatchEvent(event);
    })();


上一页（新增的，如果不存在则调用 nextPage.uc.xul）

    var node = FireGestures.sourceNode;
    var doc = node.ownerDocument || getBrowser().contentDocument;
    var win = doc.defaultView;

    if(win.uSuper_preloader)
        return win.uSuper_preloader.back();

    if(window.nextPage)
        nextPage.next();

下一页（新增的，如果不存在则调用 nextPage.uc.xul）

    var node = FireGestures.sourceNode;
    var doc = node.ownerDocument || getBrowser().contentDocument;
    var win = doc.defaultView;

    if(win.uSuper_preloader)
        return win.uSuper_preloader.go();

    if(window.nextPage)
        nextPage.next(true);


下滚一页（没有则调用 FireGestures 滚动到底部或 ScrollPageDown）

    var node = FireGestures.sourceNode;
    var doc = node.ownerDocument || getBrowser().contentDocument;
    var win = doc.defaultView;

    if(win.uSuper_preloader)
        return win.uSuper_preloader.goNext(win);

    FireGestures._performAction(event, "FireGestures:ScrollBottom");

上滚一页（没有则调用 FireGestures 滚动到顶部或 ScrollPageUp）

    var node = FireGestures.sourceNode;
    var doc = node.ownerDocument || getBrowser().contentDocument;
    var win = doc.defaultView;

    if(win.uSuper_preloader)
        return win.uSuper_preloader.goPre(win);

    FireGestures._performAction(event, "FireGestures:ScrollTop");


滚到页面顶部（仅仅比自带的多了个平滑滚动）

    if(content.window.uSuper_preloader)
        content.window.uSuper_preloader.goTop();

滚到页面底部（仅仅比自带的多了个平滑滚动）

    if(content.window.uSuper_preloader)
        content.window.uSuper_preloader.goBottom();


### 修改暂停翻页为鼠标左键双击

uSuper_preloader.db.js 文件

    Pbutton:[0,0,0]        ,//需要按住的键.....0: 不按住任何键;1: shift鍵;2: ctrl鍵; 3: alt鍵;(同时按3个键.就填 1 2 3)(一个都不按.就填 0 0 0)
    mouseA:false           ,//按住鼠标左键..否则.双击;

### 修改按钮或菜单显示方式

uSuper_preloader.uc.js 文件

    // 1 按钮, 2 菜单, 0 无
    // 按钮ID: uSuper_preloader-icon
    // 菜单ID: uSuper_preloader-menuitem, 可用 rebulid_userChrome 移动统一管理
    var append_type = 1;

### 关于自动更新

 - 如果自动更新则自己的设置没法保留。确实需要的话用 bat 命令下载更新。

### 乱码问题

修改 `profile\chrome\userChrome.js`，加上UTF-8参数

    try {
      if (script.charset)
        Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader)
                 .loadSubScript(script.url + "?" + this.getLastModifiedTime(script.file),
                                doc.defaultView, script.charset);
      else
        Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader)
                 .loadSubScript(script.url + "?" + this.getLastModifiedTime(script.file),
                                doc.defaultView, 'UTF-8');
    }catch(ex) {
      this.error(script.filename, ex);
    }