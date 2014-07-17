WordHighlightToolbar.uc
=======================

改自 [WordHighlightToolba · Griever/userChromeJS](https://github.com/Griever/userChromeJS/tree/master/WordHighlightToolbar)

 - 汉化
 - 改按钮为菜单
 - 增加对 super_preloader 或 GoogleMonkey 或 BaiduMonkey 等加载下一页高亮的支持。采用通用的方式注册事件，AutoPagerizeFindHighlight.uc 也不需要了。
 - 修改图标左键点击增加单词高亮，右键点击启用禁用。

![Super_preloader支持效果图](WordHighlightToolbar.uc.png)

说明
----

### 用 FireGestures 或其它方式打开链接不高亮的情况

因为 `WordHighlightToolbar.uc.js` 需要 `this.lastClickedTime` 来判断是否是新标签。默认支持 click 和 dragend 2个事件。

用鼠标手势或其它方式打开链接，需要增加下面这段代码即可正常高亮。

    if (window.gWHT)
        gWHT.lastClickedTime = new Date().getTime();