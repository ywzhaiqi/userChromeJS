
youkuantiadsModY.uc.js
=======================

视频去广告去黑屏。基于 [youkuantiads.uc.js](http://bbs.kafan.cn/thread-1509944-1-1.html) 修改增强。

- 自动在 chrome 目录下创建 swf 文件夹并下载播放器到本地（不需要 wget.exe），然后把网络地址替换为本地地址。
- 在 `工具` 菜单中新增 `更新视频播放器` 菜单，更新完毕后会输出简易的相关信息。
- 如果 `请求超时`，请使用代理。
- 新增 2个 17173 播放器，来自 [catcat520](http://bbs.kafan.cn/thread-1725172-1-1.html)。
- ~~新增：本地播放器检测功能。如果有本地播放器则使用本地的路径，否则使用默认的网络播放器。~~
- ~~新增：提前判断是否为 flash，加快速度。~~ *已反馈给作者，作者的7月2日版本已经增加。*
- 修正打开新窗口而重复注册的问题。

id 为 `youkuAntiADsMod`，执行命令为

    oncommand: "document.getElementById('youkuAntiADsMod').doCommand();"

### 网易云音乐增强器

提取自 [网易云音乐增强器\[Chrome\]](https://chrome.google.com/webstore/detail/nmlhnfbdfkfebdofdfffnjmnkfmjcdgb)，具体说明看附件：网易云音乐增强器.rar

[我的 Firefox 分享](http://pan.baidu.com/s/1sjjTpnR#dir/path=%2FShare%2FFirefox)