uAutoPagerize2.uc.js
====================

uAutoPagerize 中文规则简化改进版。

 - 基于日文原版重新改写，重点在**简化**。
 - **中文规则数据库**为：[Super_preloaderPlus_one for Greasemonkey](http://userscripts.org/scripts/show/178900)，这是我用于其它浏览器的翻页脚本 + 数据库。
 - **按钮默认位置**为状态栏，不可移动，也不会有按钮找不到的问题。
 - 文件 _uAutoPagerize.js 是自己的配置文件。但里面的 EXCLUDE（黑名单）已经不可用，改在右键菜单里设置。
 - [uAutoPagerizeUI](uAutoPagerizeUI)：图形管理规则，待完善。

### 右键菜单

![右键菜单](右键菜单.png)

### 使用技巧和说明

 - 文件 _uAutoPagerize.js 为自定义配置文件，自定义规则放在这里。
 - 文件 uSuper_preloader.db.js 为中文规则数据库文件，会被下载替换。
 - 鼠标中键点击按钮同时载入配置文件和中文规则数据库文件。

### 一些可能的问题

 - 百度无法翻页，清除 cookie