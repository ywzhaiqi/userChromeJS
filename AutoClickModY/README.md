AutoClickModY.uc.js
===================

鼠标悬停自动点击链接、按钮、图片。AutoClick.uc.js 修改版。

 - 当按着 Ctrl 键时，后台打开。
 - 控制菜单在菜单栏的工具菜单中， ID 为 `AutoClick-enable-menuitem`，可添加到 rebuild_userChrome 中。
 - 鼠标手势或其它调用命令：`document.getElementById("AutoClick-enable-menuitem").click();`。