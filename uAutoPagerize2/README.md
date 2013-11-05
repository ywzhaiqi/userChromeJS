uAutoPagerize2.uc.js
====================

uAutoPagerize 中文规则简化改进版。跟 [uAutoPagerize](../uAutoPagerize) 比

 - 基于日文原版重新改写。
 - **中文规则数据库**为：[Super_preloaderPlus_one for Greasemonkey](http://userscripts.org/scripts/show/178900)，这是我用于其它浏览器的翻页脚本 + 数据库。
 - **按钮默认位置**为状态栏（可改为地址栏），不可移动，也不会有按钮找不到的问题。
 - 新增 `添加下一页到历史记录`。
 - 配置文件的 EXCLUDE（黑名单）已经不可用，改在右键菜单里设置，存储在 about:config 中。
 - 无多功能的分隔条，无强制翻页（功能的实现不完美），SITEINFO_Writer.uc.js 可能有问题（我已经不再使用）。

### 右键菜单

![右键菜单](右键菜单.png)

### 分隔条

![分隔条](分隔条.png)
	
使用技巧和说明
--------------

- 文件 *_uAutoPagerize.js* 为自定义配置文件，自定义规则放在这里。
- 文件 *uSuper_preloader.db.js* 为中文规则数据库文件，会被下载替换。
- 鼠标中键点击图标会同时载入配置文件和中文规则数据库文件。
- 如果配置文件修改了，刷新页面会重新载入。

### 其它说明

- 百度如果无法翻页，请清除 cookie
- [uAutoPagerizeUI](uAutoPagerizeUI)：图形管理规则，待完善。

手势调用（FireGestures）
-----------------------

#### 启用禁用

```js
	uAutoPagerize.toggle()
```

#### 立即加载3页

```js
	var node = FireGestures.sourceNode;
	var doc = node.ownerDocument || getBrowser().contentDocument;
	var win = doc.defaultView;

	if(win.ap)
	    win.ap.loadImmediately(3);
```

### 增强型后退，没前进翻到上一页

```js
	var doc = FireGestures.sourceNode.ownerDocument;
	var win = doc.defaultView;
	
	// 删除下面这部分（到空行为止） 则为普通的上一页
	var nav = gBrowser.webNavigation;
	if (nav.canGoBack) {
	    nav.goBack();
	    return;
	}
	
	if (win.uSuper_preloader) {
		win.uSuper_preloader.back();
	} else if (window.nextPage) {  // nextPage.uc.js
		window.nextPage.next();
	} else {
		SuperPreloaderPrevPage();
	}

	// SuperPreloader 脚本的上一页
	function SuperPreloaderPrevPage(){
	    var event = doc.createEvent('HTMLEvents');
	    event.initEvent('superPreloader.back', true, false);
	    doc.dispatchEvent(event);
	}
```

### 增强型前进，没前进翻到下一页

```js
	var doc = FireGestures.sourceNode.ownerDocument;
	var win = doc.defaultView;
	
	// 删除下面这部分（到空行为止） 则为普通的下一页
	var nav = gBrowser.webNavigation;
	if (nav.canGoForward) {
	    nav.goForward();
	    return;
	}

	if (win.ap && win.ap.requestURL) {
	    win.location = win.ap.requestURL;
	} else if (win.uSuper_preloader) {
	    win.uSuper_preloader.go();
	} else if (window.nextPage) {  // nextPage.uc.xul
	    nextPage.next(true);
	} else {
		SuperPreloaderNextPage();
	}

	// SuperPreloader 脚本的下一页
	function SuperPreloaderNextPage(){
	    var event = doc.createEvent('HTMLEvents');
	    event.initEvent('superPreloader.go', true, false);
	    doc.dispatchEvent(event);
	}
```

#### 向上滚一页（5合1）

依次查找：uAutoPagerize、uSuper_preloader.uc.js、小说阅读脚本、Super_preloader 脚本、FireGestures滚到底部。

```js
	var srcNode = FireGestures.sourceNode;
	var doc = srcNode.ownerDocument || getBrowser().contentDocument;
	var win = doc.defaultView;

	if (win.ap) {
	    uAutoPagerize.gotoprev(win);
	} else if (win.uSuper_preloader) {
	    win.uSuper_preloader.goPre();
	} else if (uAutoPagerize && doc.body && doc.body.getAttribute("name") == "MyNovelReader") { // 小说阅读脚本
	    uAutoPagerize.gotoprev(win, ".title");
	} else if (doc.getElementById("sp-fw-container")) { // Super_preloader 脚本版
	    uAutoPagerize.gotoprev(win, ".sp-separator");
	} else {
	    FireGestures._performAction(event, "FireGestures:ScrollTop");
	}
```

#### 向下滚一页（5合1）

同上

```js
	var srcNode = FireGestures.sourceNode;
	var doc = srcNode.ownerDocument || getBrowser().contentDocument;
	var win = doc.defaultView;

	if (win.ap) {
	    uAutoPagerize.gotonext(win);
	} else if (win.uSuper_preloader) {
	    win.uSuper_preloader.goNext();
	} else if (uAutoPagerize && doc.body && doc.body.getAttribute("name") == "MyNovelReader") { // 小说阅读脚本
	    uAutoPagerize.gotonext(win, ".title");
	} else if (doc.getElementById("sp-fw-container")){  // Super_preloader 脚本版
	    uAutoPagerize.gotonext(win, ".sp-separator");
	} else {
	    FireGestures._performAction(event, "FireGestures:ScrollBottom");
	}
```