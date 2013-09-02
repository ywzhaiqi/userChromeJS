AddonsPage.uc.js
================

附件组件页面（about:addons）右键新增查看所在目录，详细信息页面新增安装地址或路径，新增 uc脚本管理页面。[卡饭论坛地址](http://bbs.kafan.cn/thread-1617407-1-1.html)

## 说明

 - 附件组件页面右键新增查看所在目录（支持扩展、主题、插件、uc脚本）、复制名字。Greasemonkey、Scriptish 自带已经存在。
 - 附件组件详细信息页面新增GM脚本、扩展、主题安装地址和插件路径，右键即复制。
 - 新增 uc脚本管理页面
 - 右键菜单 "查看附加组件" 需要 DOM Inspector

#### 右键菜单

![右键菜单.png](右键菜单.png)
![右键菜单_GM.png](右键菜单_GM.png)

#### uc脚本管理界面

 - 启用禁用需要 rebuild_userChrome.uc.xul
 - 详细页面新增的信息需要 [修改版userChrome.js](https://github.com/ywzhaiqi/userChromeJS/tree/master/userChrome.js)
 	- 新增对uc脚本多个参数的识别：`// @homepageURL`、`// @reviewURL`、`// @optionsURL`
 	- 需要脚本内的支持，我的一些脚本已经加上。
 - 编辑命令需要首先设置 view\_source.editor.path 的路径，可用网址 about:config?filter=view_source.editor.path 打开

![AddonsPage_userChromeJS.png](AddonsPage_userChromeJS.png)

![uc脚本详细页面.png](uc脚本详细页面.png)

#### 详细页面

![详细页面.png](详细页面.png)

### 添加图标

自行添加样式

	@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);

	@-moz-document url("about:addons"), url("chrome://mozapps/content/extensions/extensions.xul") {
		#category-userchromejs > .category-icon {
			list-style-image: url(data:image/png;base64,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);
		}
	}

## 参考

 - [Add InstallUrl Or Path To AddonsPage 脚本 By Crab](http://j.mozest.com/zh-CN/ucscript/script/109/)
 - [Add-ons Manager Context Menu 扩展](https://addons.mozilla.org/zh-cn/firefox/addon/am-context/)
 - OpenAddonFolder.uc.js
 - Greasemonkey 和 Scriptish 扩展
 - Firefox 源代码

## 写这个脚本的说明

 - AM 扩展菜单太多了，在 Scriptish 页面更加混乱，且没有安装链接
 - AM 扩展不支持查看 plugin 的路径