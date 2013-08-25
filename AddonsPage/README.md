AddonsPage.uc.js
================

附件组件页面右键新增查看所在目录，详细信息页面新增安装地址或路径，新增 uc脚本管理页面。

## 说明

 - 附件组件页面右键新增查看所在目录（支持扩展、主题、插件）、复制名字。Greasemonkey、Scriptish 自带已经存在。
 - 附件组件详细信息页面新增GM脚本、扩展、主题安装地址和插件路径，右键即复制。
 - 新增 uc脚本管理页面（启用禁用需要 rebuild_userChrome.uc.xul）
 - 右键菜单 "查看附加组件" 需要 DOM Inspector

#### 右键菜单

![右键菜单.png](右键菜单.png)
![右键菜单_GM.png](右键菜单_GM.png)

#### uc脚本管理界面

![AddonsPage_userChromeJS.png](AddonsPage_userChromeJS.png)

#### 详细页面

![详细页面.png](详细页面.png)

## 参考

 - [Add InstallUrl Or Path To AddonsPage 脚本 By Crab](http://j.mozest.com/zh-CN/ucscript/script/109/)
 - [Add-ons Manager Context Menu 扩展](https://addons.mozilla.org/zh-cn/firefox/addon/am-context/)
 - OpenAddonFolder.uc.js
 - Greasemonkey 和 Scriptish 扩展

## 写这个脚本的说明

 - AM 扩展菜单太多了，在 Scriptish 页面更加混乱，且没有安装链接
 - AM 扩展不支持查看 plugin 的路径