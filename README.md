# userChromeJS for Firefox.

## 资源地址

 - [userChrome.js 维基（日文）](http://wiki.nothing.sh/page/userChrome.js%CD%D1%A5%B9%A5%AF%A5%EA%A5%D7%A5%C8)，最全的uc脚本维基，最近的版面重整没了很多东西（希望是暂时的）。
 - [Griever/userChromeJS · GitHub（日文）](https://github.com/Griever/userChromeJS)，原创作者。
 - [alice0775/userChrome.js · GitHub（日文）](https://github.com/alice0775/userChrome.js)，原创作者。
 - [ardiman/userChrome.js · GitHub（德文）](https://github.com/ardiman/userChrome.js)，大量的uc脚本集中地，有图片说明。

以下中文

 - [UserChromeJS脚本 - 紫云飞](http://www.cnblogs.com/ziyunfei/archive/2011/11/25/2263756.html)，原创作者。
 - [卡饭论坛uc脚本索引](http://bbs.kafan.cn/forum.php?mod=viewthread&tid=1340501&page=1#pid25548028)
 - [Mozest.com uc脚本论坛区](https://g.mozest.com/forum-75-1)
 - [Mozest.com uc脚本下载区](https://j.mozest.com/zh-CN/ucscript/)
 - [ywzhaiqi/userChromeJS · GitHub](https://github.com/ywzhaiqi/userChromeJS)，本人地址。
 - [lastdream2013/userChrome · GitHub](https://github.com/lastdream2013/userChrome)


## 最近的修改或修复说明

本人使用以扩展为主，uc脚本为辅，故下面的uc脚本有一定的针对性。

本人使用 pentadactyl 扩展，默认隐藏地址栏，故在地址栏的脚本都改成可移动版或放在附加组件栏。

**以下uc脚本可能包含个人使用习惯**

### MyNovelReader.uc.js

原创，小说清爽阅读 uc版，未完成。此外还有 GM 版，GM 无jQuery版（自己用于手机 Opera Mobile）、扩展版（简易、未完成）。

### viewMenuInScriptishPopup.uc.js

为 Scritish 扩展增加 "为本站搜索脚本" 功能。

### uAutoPagerize.uc.js

中文规则增强版。[原作者地址（日文）](https://github.com/Griever/userChromeJS/tree/master/uAutoPagerize)

 - 默认为可移动按钮，可在 isUrlbar 更改，true为地址栏，false为附加组件栏（可移动按钮）。
 - 第一次加载可能需要从定制窗口中拖出，此外如为可移动按钮，启动加载时有个图标缩小的过程。

### rebuild_userChrome.uc.xul

脚本管理器，按钮可移动版，改自 lastDream2013 的版本。[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/rebuild_userChrome.uc.xul)

 - 第74行 editor 为编辑器的路径，如果空则为 "about:config" 中 "view_source.editor.path" 的路径。
 - 第45行 movedMenus 为 其它uc脚本设置的 id，加入后可移动到 "userChromeJS用户脚本命令" 处统一管理。下面的是示例：
    - "JSCSS-menuitem",  // js、css、ahk 代码着色开关
    - "addMenu-rebuild",  // addMenu 重新载入配置
    - "sw-menuitem",  // siteinfo_write

### 010-ucjs_editor.uc.js (ExternalEditor)

输入框右键添加 "用外部编辑器打开" 功能，同类扩展It's All Text!，这个脚本简单点。[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/010-ucjs_editor.uc.js)

 - 第55行 \_editor 为编辑器路径，如果空则为 "about:config" 中 "view_source.editor.path" 的路径。

### stylish0.5_edit.uc.js

为 Stylish 添加外部编辑器、颜色选择、自动添加 !important 功能。[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/stylish0.5_edit.uc.js)

 - 第62行 EDITOR\_PATH 为编辑器路径，如果空则为 "about:config" 中 "view_source.editor.path" 的路径。
 - 使用时需把 extensions.stylish.editor 设为 1（默认0）。
 - 上面的改了后原输入框没有了代码高亮。

### ExportHTMLFolder.uc.xul

书签右键 "导出到HTML"，基于 [lastdream2013 的版本](http://bbs.kafan.cn/thread-1512731-1-1.html)。

- 修复了当在书签工具栏、书签菜单栏、未排序书签栏上导出空白的情况
- 精简了代码，修复了当在侧边栏图标上导出空白及错误的情况。

### UserAgentChangeModLite.uc.js

UA切换，基于 [lastdream2013 的版本](http://bbs.kafan.cn/thread-1534937-1-1.html)。

- 变成可移动按钮，默认附加组件栏，可通过 toolbarId 更改。
- 修复了撑大的问题（原脚本用css没法解决）。
- 完善了原脚本的一些正则的错误。

### SidebarModfix.uc.js

侧边栏增强，基于 [lastdream2013 的版本](http://bbs.kafan.cn/thread-1552255-1-1.html)。

 - 更改了一些图标为 Firefox 默认图标
 - 更改了图标获取顺序，现在的获取顺序 style > favicon > 第一个子图标
 - 新增了一些站点

### copyBookmark.uc.js

书签右键 "复制标题"、"复制地址"、"复制标题和地址"。原贴发布在百度贴吧

 - 更改原来的 "复制" 为 "复制地址"，并调整顺序。

### IME-Colors.uc.js

输入框聚焦时变色。[原作者地址（日文）](https://github.com/Griever/userChromeJS/blob/master/IME-Colors.uc.js)

 - 屏蔽控制台错误。


## 一些自用的脚本说明

### nextpage.uc.xul

 - 下一页： nextpage.next(true);
 - 上一页： nextpage.next();

### inlineEditForBookmarkTitleOnSidebar.uc.js

侧边栏书签按F2直接编辑标题。[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/inlineEditForBookmarkTitleOnSidebar.uc.js)

### AutoCloseBookMarkFolder_Fx37.uc.js

侧边栏书签增加 "展开"、"折叠" 按钮。[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/AutoCloseBookMarkFolder_Fx37.uc.js)

### AutoCloseHistoryFolder_Fx37.uc.js
侧边栏历史增加 "展开"、"折叠" 按钮。[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/AutoCloseHistoryFolder_Fx37.uc.js)

### autoContextmenu.uc.xul

选中自动弹出右键菜单，可开关，可用 rebuild_userChrome.uc 集中设置在一起。[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/autoContextmenu.uc.xul)

### JSCSS_Highlight.uc.js

在浏览器中打开的 js、css、ahk 代码着色

### JSOff.uc.xul

js开关，图标在状态栏。

### speedupErrorConsole.uc.js

加速 错误控制台，不知道是否有用，不过看作者最近更新时间 2013/02/15，姑且用着。

### statusbarButtonScrapbook.uc.js

更改 Scrapbook 状态栏图标 鼠标中键打开侧边栏，左键、右键弹出菜单。

### viewSourceModoki.uc.js

右键菜单增加 View Source With: All、Document、css、js

 - 需要在 about:config 中设置 view_source.editor.path 路径。

### KeepBookmarksOnMiddleClick.uc.js

鼠标中键连续打开书签。

### 论坛灌水.uc.xul

### SnapLinksMod.uc.xul

基于[lastDream2013修改版](http://bbs.kafan.cn/thread-1512731-1-1.html), [原作者地址（日文）](https://github.com/Griever/userChromeJS/blob/master/SnapLinks.uc.xul)

 - 取消右键菜单，自己用 addMenu.uc 添加，菜单只出现在一般情况下，在链接、图片、输入框等情况下不会出现。
