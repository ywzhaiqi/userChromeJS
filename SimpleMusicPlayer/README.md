SimpleMusicPlayer.uc.js
=======================

简单音乐播放面板，支持多个站点，参考了百度随心听播放栏UC脚本。

- 只有一个按钮，默认在地址栏，点击弹出面板，右键弹出站点菜单。
- 内置多个站点配置，可设置面板大小，是否设置 UA 为手机版，插入该站点的样式。
- [关于百度随身听的音质 - 卡饭论坛](http://bbs.kafan.cn/thread-1738286-1-1.html)

### 弹出面板

![弹出面板.jpg](弹出面板.jpg)

### 右键菜单

![右键菜单.jpg](右键菜单.jpg)

### 关于设置 UA 为手机版

- 在网址载入前会临时设置 UA 为手机版 firefox，然后马上复原。
- 在这个短暂的时间内，请不要在主界面打开网址，会被影响到。

站点配置
-------

站点示例，更多示例请查看代码。

### iframe 的方式

	{
	    name: "百度随心听（手机版）",
	    url: "http://fm.baidu.com/",
	    changeUA: true,
	    iframeStyle: "width: 320px; height: 440px;",
	    css: "#ad { display:none !important; }",
	    control: {
	        "play-pause": function(win) {
	            var player = win.player;
	            if (player.getState() == 'play') {
	                player.pause();
	            } else {
	                player.play();
	            }
	        },
	        // "play": "win.player.play()",
	        // "pause": "win.player.pause()",
	        // "stop": "win.player.stop()",
	        "love": "#playerpanel-btnlove",
	        "hate": "#playerpanel-btnhate",
	        "next": "#playerpanel-btnskip",
	        // "reset": "win.player.reset()",
	    }
	},

- **name**: 右键菜单显示的名字。
- **url**: 面板载入的网址。
- **changeUA**: 会临时设置 UA 为手机版，如果不需要不要填。
- **iframeStyle**: 主要用于设置面板的宽度和高度，`mobile` 为内置的 mobile 大小，也可自行设置，例如 `width: 740px; height: 570px;`
- **css**: 插入到页面的样式，可隐藏广告或简化网站的界面使得弹出的面板变小。
- **control**
	- "play-pause"、"love"、"hate"、"next" 等为该站点的控制菜单
	- 最简单的是该按钮的 css 选择器，如 "next": "#playerpanel-btnskip"
	- 写法二（特殊）："play": "win.player.play()"，已 `win` 开头，`win` 为 GM 脚本的 unsafeWindow。后面的 `player.play()` 则是该网页的 js 对象。
	- 写法三：函数，如 "play-pause" 的函数
- **openLinkInsided**：为 true 则强制打开链接在 iframe 内，**可能有bug**。

### 窗口方式

豆瓣FM 等网站因为在 iframe 无法点击播放，故采用窗口方式。

        {
			name: "豆瓣FM（窗口）",
			url: "http://douban.fm/",
			isWindow: true,
			windowFeatures: 'width=1110px,height=626px,resizable,scrollbars=yes',
        },

- **isWindow**：该参数为 true 则是窗口方式
- **windowFeatures**：打开窗口的属性，详见 [window.open - DOM | MDN](https://developer.mozilla.org/zh-CN/docs/DOM/window.open#Position_and_size_features)

TODO
----

- 是否在播放中
- 是否加星号
- 如果使用了 `UserAgentChange.uc.js`，则 "百度随心听（手机版）" 打开界面会多个下载按钮，且没有歌词。**原因不明**

### Flashgot 捕获音频？

需要修改 Flashgot 扩展的代码？

文件 MediaSniffer.js

	updateUI: function (win) {
		var bw = DOM.mostRecentBrowserWindow;
		if (bw && bw.gFlashGot && bw.content == win.top) bw.gFlashGot.updateMediaUI();
	},