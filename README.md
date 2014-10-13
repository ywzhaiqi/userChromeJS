userChromeJS for Firefox
========================

修改、原创、自用的uc脚本。

注： **本人目前已主用 chrome，故停止更新，请换用同类扩展**

资源地址
--------

 - [userChrome.js 维基（日文）](http://wiki.nothing.sh/page/userChrome.js%CD%D1%A5%B9%A5%AF%A5%EA%A5%D7%A5%C8)，最全的uc脚本维基。
 - [Griever/userChromeJS · GitHub（日文）](https://github.com/Griever/userChromeJS)，原创作者。
 - [alice0775/userChrome.js · GitHub（日文）](https://github.com/alice0775/userChrome.js)，原创作者。
 - [ardiman/userChrome.js · GitHub（德文）](https://github.com/ardiman/userChrome.js)，收集着大量的uc脚本，有图片说明。

以下中文

 - [卡饭论坛uc脚本索引](http://bbs.kafan.cn/forum.php?mod=viewthread&tid=1340501&page=1#pid25548028)
 - [Mozest.com uc脚本论坛区](https://g.mozest.com/forum-75-1)
 - [Mozest.com uc脚本下载区](https://j.mozest.com/zh-CN/ucscript/)
 - [UserChromeJS脚本 - 紫云飞](http://www.cnblogs.com/ziyunfei/archive/2011/11/25/2263756.html)
 - [zbinlin — Bitbucket](https://bitbucket.org/zbinlin)
 - [黒仪大螃蟹](http://pan.baidu.com/share/home?uk=2467242534#category/type=0)
 - [lastdream2013/userChrome · GitHub](https://github.com/lastdream2013/userChrome)
 - [feiruo/userChromeJS · GitHub](https://github.com/feiruo/userChromeJS)
 - [defpt/userChromeJs](https://github.com/defpt/userChromeJs)
 - [Drager-oos/userChrome](https://github.com/Drager-oos/userChrome)
 - [Harv/userChromeJS](https://github.com/Harv/userChromeJS)，主要包含 youkuantiads.uc.js、redirector.uc.js。
 - 更多搜索：[Search · userChrome](https://github.com/search?q=userChrome&nwo=defpt%2FuserChromeJs&search_target=global&ref=cmdform)

其它

 - [鼠标手势UserChromeJS脚本在线生成器 - 紫云飞](http://www.cnblogs.com/ziyunfei/archive/2011/12/15/2289504.html)

说明
----

### 文件夹

 - [.test](.test)，一些测试的脚本。
 - [.修改版](.修改版)
 - [addmenuPlus](addmenuPlus)，增加修改 Firefox 菜单（修改版）。
 - [AddonsPage](AddonsPage)，附件组件页面（about:addons）右键新增查看所在目录，详细信息页面新增安装地址或路径，新增 uc脚本管理页面。
 - [AutoClickModY](AutoClickModY)，鼠标悬停自动点击链接、按钮、图片。
 - [autoLaunchReader](autoLaunchReader)，自动启用阅读器（原创）。[专注阅读扩展简测](http://www.firefox.net.cn/read-49260)
 - [ExternalEditor](ExternalEditor)，输入框右键添加 `用外部编辑器打开` 功能（修改版）。
 - [GreaemonkeyEnhancer](GreaemonkeyEnhancer)，给 Greasemonkey 的菜单增加鼠标中键点击打开主页、为本站搜索脚本等功能。
 - [ExternalVideoPlayer](ExternalVideoPlayer)，调用外部播放器播放网络视频（原创）。[yunPlayer.uc.js](ExternalVideoPlayer/yunPlayer.uc.js)，右键菜单云播放视频。
 - [InspectElementModY](InspectElementModY)，元素查看调用工具，修改增强版。
 - [moveButton](moveButton)，移动或克隆按钮/菜单到任意位置（原创）。
 - [MyNovelReader](MyNovelReader)，小说阅读uc版（原创），已弃用，请用 [小说阅读GM版](https://userscripts.org/scripts/show/165951)（原创）和[autoLaunchReader](autoLaunchReader)。
 - [rebuild_userChrome](rebuild_userChrome)，脚本管理器，基于 [UserChromeJS脚本管理器Dannylee强化版](http://g.mozest.com/thread-41292-1-1)，修改为可移动版。**已弃用，改用下面的 userChromeJS_Mix 扩展。**
 - [SaveUserChromeJS](SaveUserChromeJS)，像 Greasemonkey 一样保存 uc脚本（原创）。
 - [SidebarModfix](SidebarModfix)，侧边栏增强（修改版）。
 - [simpleAppButton](simpleAppButton)，简易启动应用程序的可移动按钮，左中右3键分别启动3个程序。
 - [SimpleMusicPlayer.uc.js](SimpleMusicPlayer)，简单音乐播放面板，支持多个站点，参考了百度随心听播放栏UC脚本。
 - [Space_nextpage](Space_nextpage)，空格键页面底部翻页（依次调用 uAutoPagerize、uSuper_preloader、nextPage.uc.xul）
 - [stylishEdit](stylishEdit)，为 Stylish 增加外部编辑器等（修复版）。
 - [ThunderLixianExporterPatch](ThunderLixianExporterPatch)，迅雷离线直接导出 IDM.ef2（原创）。
 - [uAutoPagerize](uAutoPagerize)，中文规则增强版（大幅修改版），我已改用下面的 uAutoPagerize2。
 - [uAutoPagerize2](uAutoPagerize2)，中文规则增强版，数据库为 Super_preloaderPlus_one 脚本。
 - [uc\_google\_translator](uc_google_translator)，google 翻译脚本（修改版），**已弃用，请改用原 [dannylee 的版本](http://j.mozest.com/zh-CN/ucscript/script/115/)**。
 - **[userChromeJS_Mix.xpi](userChromeJS_Mix.xpi)**，userChromeJS 扩展、userChrome.js、UC脚本管理器整合版，用于彻底解决可移动按钮消失的问题。
 - [UserScriptLoaderPlus](UserScriptLoaderPlus)，UserScriptLoader.uc.js 增强版。
 - [uSuper_preloader](uSuper_preloader)，基于 Super_preloader GM脚本修改而来。
 - [viewSourceModoki](viewSourceModoki)，右键菜单增加 `View Source With: All、Document、css、js`。
 - [WordHighlightToolbarFix](WordHighlightToolbarFix)，搜索高亮（修改版）。
 - [YoukuantiadsModY](YoukuantiadsModY)，视频去广告去黑屏（修改增强版）。

### 单文件

 - [chromejs.uc.js](chromejs.uc.js)，在地址栏运行uc代码，例：打开书签 `chromejs:PlacesCommandHook.showPlacesOrganizer('AllBookmarks');`
 - [contextProxySwitch.uc.xul](contextProxySwitch.uc.xul)，修正本地文件下 getSelection 是一行的情况。
 - [copybookmark.uc.js](copybookmark.uc.js)，书签右键复制标题链接（修改版）。
 - [downloadPlus.uc.js](downloadPlus.uc.js)，多个下载脚本整合版，**已弃用，请使用原来的独立版本**。
    - [DownloadEnhance.uc.js](DownloadEnhance.uc.js)，加入延迟应对新的 userChrome.js（注：userChrome.js 最新版已不再取消延迟加载）。
    - [showCompleteURL.uc.js](showCompleteURL.uc.js)，加入延迟应对新的 userChrome.js（注：userChrome.js 最新版已不再取消延迟加载）。
    - **技巧**：在下载窗口 "我的足迹" 界面，直接 `ctrl+v` 即可新建下载。
 - [ExportHTMLFolderMod.uc.xul](ExportHTMLFolderMod.uc.xul)，书签右键 `导出到HTML`（修改版）。
 - [fixViewSourceEditArgsForST.uc.js](fixViewSourceEditArgsForST.uc.js)
    - 自带的 `view_source.editor.args` 由于顺序问题无法传递 "行" 参数给 sublime text
    - 使用本脚本修正后，设置 `view_source.editor.args` 为 `%file:%line` 即可用 sublime text 打开并定位到某一行，如图所示
    - ![fixViewSourceEditArgsForST.png](fixViewSourceEditArgsForST.png)
    - 更多说明或其它编辑器请看 [编辑器及参数说明](https://github.com/ywzhaiqi/userChromeJS#%E7%BC%96%E8%BE%91%E5%99%A8%E5%8F%8A%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E)。
 - [IME-Colors.uc.js](IME-Colors.uc.js)，输入框聚焦时变色。
 - [JSCSS_Highlight.uc.js](JSCSS_Highlight.uc.js)，在浏览器中打开的 js、css、ahk 代码着色。
 - [JSOff.uc.xul](JSOff.uc.xul)，js开关，图标在状态栏。
 - [MoreToolsMenu.uc.js](MoreToolsMenu.uc.js)，拆分工具菜单为2个。
 - [OpenLinkinNewTabwithRightClick.uc.js](OpenLinkinNewTabwithRightClick.uc.js)，右键在新标签页打开链接，修改自`openlinkinnewtabwithleftdoubleclick.uc.js`。
 - [openLinkTabThirdPart.uc.js](openLinkTabThirdPart.uc.js)，域名第三方新标签页打开，否则当前标签页打开。
 - [placesToolbarMiddleClick.uc.js](placesToolbarMiddleClick.uc.js)，禁用书签栏文件夹的鼠标中键打开所有标签页。
 - [setRelativeEditPath.uc.js](setRelativeEditPath.uc.js)，设置相对路径的编辑器到 `view_source.editor.path`。
 - [sendToGmail.uc.js](sendToGmail.uc.js)，修正失效的问题（2014/8/17）。
 - [SidebarGestures.uc.js](SidebarGestures.uc.js)，给侧边栏网页加上鼠标手势，左：后退，右：前进，上下：刷新。
 - [SimpleDragModY.uc.js](SimpleDragModY.uc.js)，简单拖曳的修改版，向上拖曳前台打开链接或搜索文字，其它方向后台。
 	- 忽略了 javascript: 开头的链接，增加了文字链接、file:// 和 about:config?filter 开头链接的识别。
 	- 如果在链接上选择文字，会优先搜索该文字而不是打开链接。
 	- 对选择文字 `http://pan.baidu.com/s/1bn7uGmb 密码: jl4b` 会转换为 `http://pan.baidu.com/s/1bn7uGmb#jl4b` 链接打开，可配合 [网盘自动填写提取密码](https://greasyfork.org/scripts/1002) 等脚本。
 - [SnapLinksMod.uc.xul](SnapLinksMod.uc.xul)，改自 lastDream 2013 的版本，复制链接去重复和反向复制。
 	- 2014-5-21，增加百度盘的特殊多选框的批量选中
 - [speedupErrorConsole.uc.js](speedupErrorConsole.uc.js)，加速错误控制台。
 - [statusbarButtonScrapbook.uc.js](statusbarButtonScrapbook.uc.js)，更改 Scrapbook 状态栏图标为鼠标中键打开侧边栏。
 - [textLink.uc.js](textLink.uc.js)，双击打开文字链接，未修改，[原链接](https://github.com/alice0775/userChrome.js/blob/master/textLink.uc.js)。
 - [userChrome.js](userChrome.js)，修改版。默认载入编码改为 UTF-8，增加对 @homepageURL 等参数的解析，在 AddonsPage.uc.js 的uc脚本详细页面就会有主页等链接。

### Disable文件夹

 - [UserAgentChangeModLite.uc.js](Disable/UserAgentChangeModLite.uc.js)，UA切换（修改版），已改用[User Agent Overrider :: Firefox 附加组件](https://addons.mozilla.org/zh-cn/firefox/addon/user-agent-overrider/?src=search)
 - [inlineEditForBookmarkTitleOnSidebar.uc.js](Disable/inlineEditForBookmarkTitleOnSidebar.uc.js)。侧边栏书签按F2直接编辑标题，[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/inlineEditForBookmarkTitleOnSidebar.uc.js)
 - [AutoCloseBookMarkFolder_Fx37.uc.js](Disable/AutoCloseBookMarkFolder_Fx37.uc.js)，侧边栏书签增加 "展开"、"折叠" 按钮，[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/AutoCloseBookMarkFolder_Fx37.uc.js)
 - [AutoCloseHistoryFolder_Fx37.uc.js](Disable/AutoCloseHistoryFolder_Fx37.uc.js)，侧边栏历史增加 "展开"、"折叠" 按钮，[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/AutoCloseHistoryFolder_Fx37.uc.js)
 - [autoContextmenu.uc.xul](Disable/autoContextmenu.uc.xul)，选中自动弹出右键菜单，可开关，可用 rebuild_userChrome.uc 把设置集中在一起。[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/autoContextmenu.uc.xul)
 - [KeepBookmarksOnMiddleClick.uc.js](Disable/KeepBookmarksOnMiddleClick.uc.js)，鼠标中键连续打开书签。


## 单文件补充说明

### copyBookmark.uc.js

书签右键 "复制标题"、"复制地址"、"复制标题和地址"。原贴发布在百度贴吧

 - 更改原来的 "复制" 为 "复制地址"，并调整顺序。

### downloadPlus.uc.js

新建下载，删除文件，下载窗口（下载重命名 + 双击复制链接 + 另存为 + 保存并打开），完成下载提示音，自动关闭下载产生的空白标签。

 - 下载按钮右键点击新建下载
 - DownloadsPanel 右键新增移除下载文件功能
 - 下载提示音
 - 自动关闭下载产生的空白标签
 - 书签窗口 "新建下载" 按钮
 - 下载改名
 - 下载另存为
 - 下载保存并打开
 - 下载弹出窗口双击链接复制完整链接

### ExportHTMLFolderMod.uc.xul

书签右键 "导出到HTML"，基于 [lastdream2013 的版本](http://bbs.kafan.cn/thread-1512731-1-1.html)。

- 修复了当在书签工具栏、书签菜单栏、未排序书签栏上导出空白的情况
- 精简了代码，修复了当在侧边栏图标上导出空白及错误的情况。

### IME-Colors.uc.js

输入框聚焦时变色。[原作者地址（日文）](https://github.com/Griever/userChromeJS/blob/master/IME-Colors.uc.js)

### UserAgentChangeModLite.uc.js

UA切换，基于 [lastdream2013 的版本](http://bbs.kafan.cn/thread-1534937-1-1.html)。

- 变成可移动按钮，默认附加组件栏，可通过 toolbarId 更改。
- 修复了撑大的问题（原脚本用css没法解决）。
- 完善了原脚本的一些正则的错误。

### nextpage.uc.xul

 - 下一页： nextPage.next(true);
 - 上一页： nextPage.next();

### SnapLinksMod.uc.xul

基于[lastDream2013修改版](http://bbs.kafan.cn/thread-1512731-1-1.html), [原作者地址（日文）](https://github.com/Griever/userChromeJS/blob/master/SnapLinks.uc.xul)

 - 去除右键菜单，自己用 addMenu.uc 添加，菜单只出现在一般情况下，在链接、图片、输入框等情况下不会出现。

编辑器及参数说明
---------------

 - addMenuPlus 或 uAutoPagerize2 载入配置出错会提示第几行，点击可直接定位到这一行。
 - 首先需要设置 `view_source.editor.path` 编辑器路径和 `view_source.editor.args` 参数。
    - `view_source.editor.args` 会替换 `%LINE%` 为 `行`。
    - `notepad++` 和 `EverEdit` 应该添加 `-n%LINE%`
    - `Sublime text` 使用 `fixViewSourceEditArgsForST.uc.js` 这个脚本修正后填写 `"%file:%line"`
    - 其它编辑器参考 Firebug，注意大小写。

 ![编辑器参数.png](编辑器参数.png)

一些 uc 脚本的链接
---------------

 - [【UC 脚本·FireSpider】一个图片采集器 - 百度贴吧](http://tieba.baidu.com/p/3038754959)
 - [dannylee 的多个脚本](http://g.mozest.com/thread-43513-1-1)
 	- AddonbarforUC.uc.js
 	- easydrag_customMOD
 	- MouseGesturesMOD(描绘轨迹版)
  	- RequestpolicyRuleFor ABP
  	- SmartProxyForChina.uc.js
 	- uc_ google _translator.uc.js
 	- ucClearMonitor.uc.js
 	- zResetForUCbutton.uc.xul
