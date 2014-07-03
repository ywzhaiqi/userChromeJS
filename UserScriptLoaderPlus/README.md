UserScriptLoaderPlus.uc.js
==========================

Greasemonkey 的 uc 脚本版。原脚本 [UserScriptLoader.uc.js By Griever](https://github.com/Griever/userChromeJS/tree/master/UserScriptLoader)，[dannylee 的版本](http://g.mozest.com/viewthread.php?tid=41278&highlight=UserScriptLoader)

 - 本脚本根据 [boy3510817 整合 dannylee 和 lastDream2013 版本](http://bbs.kafan.cn/thread-1688975-1-1.html) 修改。
 - 新增：脚本如果没有下载地址，会用安装地址替换。
 - 新增：根据一定规则得到主页链接，在脚本菜单上中键打开主页。
 - 新增：@include 正则表达式的支持。
 - 新增：更新脚本功能。如果脚本已被修改，新脚本会被下载到 newVersion 目录下，否则会自动替换。
 - "为本站搜索脚本" 增加右键搜索关键词功能。
 - "保存当前页面的脚本" 增加保存后提示，并保存安装地址、安装时间等信息（统一保存在 UserScriptLoader.json 文件中）。
 - 替换原 console，原 console 真的很弱，只能输出字符串。
 - 其它细节上的改进。

PS：由于我本人并没有使用这个脚本，所以可能不会更新。

备注
----

还有几个小问题，但并不影响使用。