rebuild_userChrome.uc.xul
-------------------------

uc 脚本管理器。[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/rebuild_userChrome.uc.xul)

- [rebuild_userChrome.uc.xul](rebuild_userChrome.uc.xul)，基于 [UserChromeJS脚本管理器Dannylee强化版](http://g.mozest.com/thread-41292-1-1)，修改为可移动版。
- 旧的 [rebuild_userChrome(工具菜单版).uc.xul](rebuild_userChrome(工具菜单版).uc.xul)

旧的说明
--------

## 修改如下

 - 第64行 editor 为编辑器的路径，如果空则为 "about:config" 中 "view_source.editor.path" 的路径
 - 第44行 movedMenus 为 其它uc脚本设置的 id，加入后可移动到 "userChromeJS用户脚本命令" 处统一管理
 - 删除了原脚本的拖曳功能（需配合另一个脚本，且不好用）

用户脚本命令示例：

    "JSCSS-menuitem",  // js、css、ahk 代码着色开关
    "addMenu-rebuild",  // addMenu 重新载入配置
    "sw-menuitem",  // siteinfo_write

## 原版 rebuild_userChrome 用户选项说明

可以把菜单（包含 uc脚本 添加的）添加到 "userchromeJS用户脚本命令" 菜单中进行统一管理。

方法：在 `rebuild_userChrome.uc.xul` 文件中下面的地方，自行添加菜单的 ID

    var userChromejsScriptOptionsMenu = {
	    //あまり使わないメニューのリスト
	    menues: [
	        // "easydragMODOption",  // easydrag_customMOD.uc.js
	        "wordhighlight-toolbar-menuitem",  // WordHighlightToolbar.uc.js
	        "JSCSS-menuitem", // js、css、ahk 代码着色
	        "addMenu-rebuild", // addMenu 的重新载入配置
	        // "sw-menuitem", // siteinfo_write
	        // "uSuper_preloader-menuitem",

	        // "ieviewModokiTool",
	        // "linkloadInBackgroundToolMenu",
	        // "SaveFolderToolsMenu",
	        // "ucjs_copysysinfo-menu"
	    ],
