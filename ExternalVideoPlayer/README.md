## yunPlayer.uc.js 右键云点播

![云点播.png](云点播.png)

## ExternalVideoPlayer.uc.js

调用外部播放器播放网络视频。

### 原理

先通过 flvcd.com 解析得到地址列表，然后调用本地播放器播放。

### 视频网站

 - [优酷网](http://www.youku.com/)、[腾讯视频](http://v.qq.com/)、[新浪视频](http://video.sina.com.cn/)、[网易视频](http://v.163.com)、酷6网、PPS、激动网、糖豆网、百度贴吧视频、华数TV、风行网等
 - 视频链接、视频文字链接、百度云链接、flvcd 网站
 - 非分段：[音悦台](http://tv.letv.com/)、[乐视网](http://tv.letv.com/)、[56网](http://www.56.com)、[迅雷看看](http://www.kankan.com/)
 - 没法直接播放：[土豆网](http://www.tudou.com/)、[奇艺网](http://www.iqiyi.com/)、[搜狐视频](http://tv.sohu.com)、[PPTV](http://v.pptv.com)

### 使用说明

在支持的站点通过右键菜单调用。

- **第一次会要求设置播放器路径**。
- 菜单直接点击会启动播放（清晰度为 flvcd 网站设置的清晰度）。
- 菜单二级菜单可以选择清晰度。
- 脚本内 `IS_CLOSE_TAB` 为启动后是否自动关闭标签，false 为自动不关闭。
- 特殊处理了百度盘链接。可通过 Share easy downloads helper 等脚本得到直接链接后，右键也会出现菜单，点击后可直接调用播放器播放。

播放列表文件的格式说明

 - 默认为 asx，wmp 需要安装解码器（完美解码等）。
 - mplayer、SMPlayer 为 pls。
 - vlc 为 xspf。
 - 如果为 BaiduPlayer，会启动播放器并复制链接到剪贴板。

其它说明

 - 脚本内 `DEFAULT_ENCODING` 为播放列表的编码，默认为 gbk。
 - 脚本内 `IDM_PATH` 为 IDM 的路径，设置正确可调用 IDM 下载。