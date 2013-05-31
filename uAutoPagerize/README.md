
uAutoPagerize 中文规则版
========================

 - 增加了 Super\_preloader.db 的规则的支持，几乎完美兼容该规则，能自动查找下一页，支持 `css;`、函数、地址栏递增等多种方式。
 - 能下载更新 Super\_preloader.db 的规则，cache文件名为 uSuper_preloader.db.js（Chrome目录下）
 - 增加了可添加和更新他人规则的功能，能分享规则。
 - 增加了iframe的支持，一些特殊网站：如起点等已经可用。
 - 增加了鼠标手势（如FireGestures）立即加载n页、上滚一页、下滚一页的支持
 - 原官方规则优先级最低，默认禁用，可自行开启。
 - 默认为可移动按钮，可在 isUrlbar 更改，true为地址栏，false为附加组件栏（可移动按钮）。

![按钮图标](按钮图标.png)

![按钮右键菜单](按钮右键菜单.png)

![SITEINFO_Writer](SITEINFO_Writer.png)

## 文件简介

 - uAutoPagerize.uc.js（必须）。脚本文件。
 - _uAutoPagerize.js（必须）。自己的配置文件。
 - ITEINFO_Write.uc（辅助，非必要）。辅助查找内容、下一页的xpath
 - AutoPagerizeFindHighlight.uc.js（辅助，非必要）。google搜索等下一页高亮的修正。使用我修改过的 WordHighlightToolbar.uc.js 则不需要。

## 使用注意

 - 如果加载的下一页以图片为主，内存占用会不断加大（文字则完全不受影响）。建议点击 第 XX 页 链接，关闭当前页面，继续阅读。

## 配合鼠标手势或其它工具调用的代码

启用禁用

	uAutoPagerize.toggle()

立即加载3页

    uAutoPagerize.loadImmediately(3);

向下滚一页，否则向下滚一屏（FireGestures代码）。

	if(content.window.ap){
		return uAutoPagerize.gotonext();
	}
	FireGestures._performAction(event, "FireGestures:ScrollPageDown");

向上滚一页，否则向下滚一屏（FireGestures代码）。

	if(content.window.ap){
		return uAutoPagerize.gotoprev();
	}
	FireGestures._performAction(event, "FireGestures:ScrollPageUp");


 [原作者地址（日文）](https://github.com/Griever/userChromeJS/tree/master/uAutoPagerize)