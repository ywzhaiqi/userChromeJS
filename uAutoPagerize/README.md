
# uAutoPagerize 中文规则版

 - 增加 Super\_preloader.db 的规则的支持，几乎完美兼容规则。（起点、漫画网站除外）
 - 能下载更新 Super\_preloader.db 的规则，cache文件名为 uSuper_preloader.db.js（Chrome目录下）
 - 原官方规则优先级最低。对内存、速度有极高要求的可自行禁用。

![按钮图标](按钮图标.png)

![按钮右键菜单](按钮右键菜单.png)

## 文件简介

 - uAutoPagerize.uc.js（必须）。脚本文件。
 - _uAutoPagerize.js（必须）。自己的配置文件。
 - AutoPagerizeFindHighlight.uc.js（辅助，非必要）。google搜索等下一页高亮的修正
 - ITEINFO_Write.uc（辅助，非必要）。辅助查找内容、下一页的xpath

## 使用注意

 - 如果加载的下一页以图片为主，内存占用会不断加大（文字则完全不受影响）。建议点击 第 XX 页 链接，关闭当前页面，继续阅读。

## 备注

 - [起点中文网](http://read.qidian.com/BookReader/1545376,27301383.aspx) 内容加载不了。
 - Super\_preloader 能对没有规则的站点进行强行拼接。