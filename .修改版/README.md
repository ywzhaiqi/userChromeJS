修改版
======

这是修改他人 uc 脚本，**不保证更新，有问题请使用原版**。

 - 由于使用了 pentadactyl，隐藏了地址栏，故会对一些脚本进行修改。
 - 也可能是对脚本的一些完善和修正。

脚本列表

 - [ExternalFuncButtonM](ExternalFuncButtonM)，修改为外置规则可重载版本。
 - [ExternalFuncButtonM-右键菜单版.uc.js](ExternalFuncButtonM-右键菜单版.uc.js)，右键菜单版。
 - [autoContextmenu.uc.xul](autoContextmenu.uc.xul)，选中文字后自动弹出右键菜单。
    - 排除 input 和 textarea。
 - [nextpageModY.uc.js](nextpageModY.uc.js)，原脚本 [NextPage.uc.xul](http://j.mozest.com/zh-CN/ucscript/script/5/)
    - 从 uc.xul 改为 .uc.js 文件。
    - 修改了跨域链接的判断，以便支持优酷视频的评论翻页。[测试页面](http://v.youku.com/v_show/id_XMjE4MDU1MDE2.html)。
    - 增加了一个规则：www.google.com/cse
    - **我已放弃使用**，改用 [NextPageModY.user.js](https://github.com/ywzhaiqi/userscript/tree/master/NextPage)。
 - [Redirector.uc.js 外置规则版](Redirector.uc.js)，修改为可移动按钮。
    - [原版卡饭链接](http://www.kafan.cn/forum.php?mod=viewthread&tid=1621837)
    - [原版 mozest.com 链接](http://j.mozest.com/zh-CN/ucscript/script/112/)
 - [textLink.uc.js](textLink.uc.js)
    - 添加了一行 `&& doc.contentType != 'text/javascript'` 增加 js 文件的支持。
 - [youkuantiadsModY.uc.js](youkuantiadsModY.uc.js)，[youkuantiads 视频去广告去黑屏](http://bbs.kafan.cn/thread-1509944-1-1.html) 修改版。
    - 新增：本地播放器检测功能。如果有本地播放器则使用本地的路径，否则使用默认的网络播放器。
    - 新增：提前判断是否为 flash，加快速度。
    - 本地播放器默认路径为 chrome 目录下的 swf 文件夹。
    - 本地的 17173 播放器默认未启用。