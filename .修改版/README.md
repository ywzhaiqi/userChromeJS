修改版
======

这是修改他人 uc 脚本，**不保证更新，有问题请使用原版**。

 - 由于使用了 pentadactyl，隐藏了地址栏，故会对一些脚本进行修改。
 - 也可能是对脚本某些地方不满意做的修改。

脚本列表

 - [ExternalFuncButtonM](ExternalFuncButtonM)，修改为外置规则可重载版本。
 - [nextpage.uc.js](nextpage.uc.js)，目前仅仅从 uc.xul 改为 .uc.js 文件，**已放弃使用，效果不如 nextpage.user.js **。
 - [Redirector.uc.js 外置规则版](Redirector.uc.js)，修改为可移动按钮。
    - [原版卡饭链接](http://www.kafan.cn/forum.php?mod=viewthread&tid=1621837)
    - [原版 mozest.com 链接](http://j.mozest.com/zh-CN/ucscript/script/112/)
 - [textLink.uc.js](textLink.uc.js)
    - 添加了一行 `&& doc.contentType != 'text/javascript'` 增加 js 文件的支持。
 - [UserScriptLoader.uc.js](UserScriptLoader.uc.js)，个人没用。修改了一些地方。
    - 最初 dannyleeby 的版本。
    - modified by boy3510817: 整合 dannylee 和 lastDream2013 版本，http://bbs.kafan.cn/thread-1688975-1-1.html
    - modified by ywzhaiqi: 修正 @include 正则表达式的支持 2014.06.23
    - modified by ywzhaiqi: 如果没有 downloadURL 则会插入安装地址作为 downloadURL
    - modified by Coolkids: 脚本菜单中键根据 downloadURL > updateURL > homepageURL 打开链接，http://bbs.kafan.cn/thread-1750122-1-1.html