
Imagus
=======

极为强大的跨平台图片查看器扩展。

作者主页：[Deathamns - Extension: Imagus](http://my.opera.com/Deathamns/blog/opera-extension-imagus)，中文汉化版本：[Imagus （极为强大的图片查看器）](http://www.firefox.net.cn/read-48000-1)

同类扩展或脚本

- [Mouseover Popup Image Viewer for Greasemonkey](http://userscripts.org/scripts/show/109262)，[我添加的一些规则](https://github.com/ywzhaiqi/userscript/tree/master/Mouseover%20Popup%20Image%20Viewer)
- [PageExpand :: Add-ons for Firefox](https://addons.mozilla.org/en-US/firefox/addon/pageexpand/)
- [picViewer for Greasemonkey](http://userscripts.org/scripts/show/105741)

鼠标悬停看原图
--------------

有效的站点

 - weibo
 - douban
 - taobao
 - Google 图片搜索
 - Userscript.org、Firefox 官方扩展中心

- 出现原图后按住鼠标右键一会，图片会居中并

Sieve
------

### 一些注意事项

	The extension first removes the ^https?://(www\.)? from the beginning of the URL.
	For example: https://www.test.com/image_thumb.jpg becomes test.com/image_thumb.jpg, and that URL will be tested against the regex (which, in this case, would start like ^test\.com/image...).
	At the end, the removed part will be added back to the result, so if your match resulted test.com/image.jpg, then the final URL will be https://www.test.com/image.jpg .

	There is an unnecessary ".jpg" at the end in "to" parameter.

### 自定义 Sieve

更新于 2013-11-20

	{"Baidu Tieba":{"img":"^(hiphotos|imgsrc)\\.baidu\\.com/(.+?)/.+?([0-9a-f]{40})","to":"$1.baidu.com/$2/pic/item/$3"},"沪江碎碎":{"img":"^((?:[^.]+\\.)*hjfile.cn\\/.+)(_(?:s|m))(\\.\\w+)$","to":"$1$3"},"YYeTs":{"img":"^(res\\.yyets\\.com/ftp/(?:attachment/)?\\d+\\/\\d+)\\/[ms]_(.*)","to":"$1/$2","note":"http://www.yyets.com/resourcelist"}}


**百度贴吧需要配合样式使用**

	.threadlist_media .threadlist_pic_highlight { display: none !important; }