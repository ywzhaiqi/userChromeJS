rebuild_userChrome.uc.xul
-------------------------

脚本管理器，自用菜单版（系统橙色按钮菜单）。

按钮可移动版，改自 lastDream2013 的版本。[原作者地址（日文）](https://github.com/alice0775/userChrome.js/blob/master/rebuild_userChrome.uc.xul)

## 修改如下

 - 第74行 editor 为编辑器的路径，如果空则为 "about:config" 中 "view_source.editor.path" 的路径。
 - 第45行 movedMenus 为 其它uc脚本设置的 id，加入后可移动到 "userChromeJS用户脚本命令" 处统一管理。

用户脚本命令示例：

    "JSCSS-menuitem",  // js、css、ahk 代码着色开关
    "addMenu-rebuild",  // addMenu 重新载入配置
    "sw-menuitem",  // siteinfo_write