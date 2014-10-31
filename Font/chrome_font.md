Chrome 的字体替换为雅黑
=====================

参考 [替换字体的中文部分为雅黑](https://chrome.google.com/webstore/detail/enpkigfhoabjjjonanmddidnnahopmcn) 扩展

- 这个扩展由于缺少了替换 Consolas 等字体的英文部分，所以会在 [github](https://github.com/ywzhaiqi/userscript/blob/master/DoubanDownloadSearch.user.js) 的网站显示 Courier New，而不是 Consolas。
- 如果用了 Mactype 可能会出现**斜体**渲染不正常的情况。

```css
/* 替换简体（中文部分）*/
@font-face { font-family: "Simsun";  unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "NSimsun"; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Simhei";  unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "宋体";    unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "新宋体";  unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "黑体";    unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
/* 替换简体（英文部分）*/
@font-face { font-family: "Simsun";  unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face { font-family: "NSimsun"; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face { font-family: "Simhei";  unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face { font-family: "宋体";    unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face { font-family: "新宋体";  unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face { font-family: "黑体";    unicode-range: U+0-2E7F; src: local("Segoe UI"); }

/* 替换繁体（中文部分） */
@font-face {font-family: "MingLiU";            unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "PMingLiU";           unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "Microsoft JhengHei"; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "DFKai-SB";           unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "細明體";             unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "新細明體";           unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "微軟正黑體";         unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "標楷體";             unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
/* 替换繁体（英文部分） */
@font-face {font-family: "MingLiU";            unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "PMingLiU";           unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "Microsoft JhengHei"; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "DFKai-SB";           unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "細明體";             unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "新細明體";           unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "微軟正黑體";         unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "標楷體";             unicode-range: U+0-2E7F; src: local("Segoe UI"); }

/* 替换常见英文字体（中文部分） */
@font-face { font-family: "Arial";           unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Arial Black";     unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Tahoma";          unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Times New Roman"; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Times";           unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Times CY";        unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Trebuchet MS";    unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Verdana";         unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Segoe UI";        unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
/* 替换常见英文字体（英文部分） */
@font-face { font-family: "Arial";           unicode-range: U+0-2E7F; src: local("Arial"); }
@font-face { font-family: "Arial Black";     unicode-range: U+0-2E7F; src: local("Arial Black"); }
@font-face { font-family: "Tahoma";          unicode-range: U+0-2E7F; src: local("Tahoma"); }
@font-face { font-family: "Times New Roman"; unicode-range: U+0-2E7F; src: local("Times New Roman"); }
@font-face { font-family: "Times";           unicode-range: U+0-2E7F; src: local("Times"); }
@font-face { font-family: "Times CY";        unicode-range: U+0-2E7F; src: local("Times CY"); }
@font-face { font-family: "Trebuchet MS";    unicode-range: U+0-2E7F; src: local("Trebuchet MS"); }
@font-face { font-family: "Verdana";         unicode-range: U+0-2E7F; src: local("Verdana"); }
@font-face { font-family: "Segoe UI";        unicode-range: U+0-2E7F; src: local("Segoe UI"); }

/* 替换常见的等宽字体（中文部分） */
@font-face { font-family: Consolas;          unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Courier New;       unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Georgia;           unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Helvetica;         unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Helvetica Neue;    unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Lucida Console;    unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Monaco;            unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Palatino Linotype; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
/* 替换常见的等宽字体（英文部分） */
@font-face { font-family: Consolas;          unicode-range: U+0-2E7F; src: local("Consolas"); }
@font-face { font-family: Courier New;       unicode-range: U+0-2E7F; src: local("Courier New"); }
@font-face { font-family: Georgia;           unicode-range: U+0-2E7F; src: local("Georgia"); }
@font-face { font-family: Helvetica;         unicode-range: U+0-2E7F; src: local("Helvetica"); }
@font-face { font-family: Helvetica Neue;    unicode-range: U+0-2E7F; src: local("Helvetica Neue"); }
@font-face { font-family: Lucida Console;    unicode-range: U+0-2E7F; src: local("Lucida Console"); }
@font-face { font-family: Monaco;            unicode-range: U+0-2E7F; src: local("Monaco"); }
@font-face { font-family: Palatino Linotype; unicode-range: U+0-2E7F; src: local("Palatino Linotype"); }


/* 上面所有的加上粗体（Chrome 需要） */
/* 替换简体（中文部分）*/
@font-face { font-family: "Simsun";  font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "NSimsun"; font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Simhei";  font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "宋体";    font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "新宋体";  font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "黑体";    font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
/* 替换简体（英文部分）*/
@font-face { font-family: "Simsun";  font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face { font-family: "NSimsun"; font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face { font-family: "Simhei";  font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face { font-family: "宋体";    font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face { font-family: "新宋体";  font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face { font-family: "黑体";    font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }

/* 替换繁体（中文部分） */
@font-face {font-family: "MingLiU";            font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "PMingLiU";           font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "Microsoft JhengHei"; font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "DFKai-SB";           font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "細明體";             font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "新細明體";           font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "微軟正黑體";         font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face {font-family: "標楷體";             font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
/* 替换繁体（英文部分） */
@font-face {font-family: "MingLiU";            font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "PMingLiU";           font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "Microsoft JhengHei"; font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "DFKai-SB";           font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "細明體";             font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "新細明體";           font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "微軟正黑體";         font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }
@font-face {font-family: "標楷體";             font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }

/* 替换常见英文字体（中文部分） */
@font-face { font-family: "Arial";           font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Arial Black";     font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Tahoma";          font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Times New Roman"; font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Times";           font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Times CY";        font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Trebuchet MS";    font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Verdana";         font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: "Segoe UI";        font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
/* 替换常见英文字体（英文部分） */
@font-face { font-family: "Arial";           font-weight: bold; unicode-range: U+0-2E7F; src: local("Arial"); }
@font-face { font-family: "Arial Black";     font-weight: bold; unicode-range: U+0-2E7F; src: local("Arial Black"); }
@font-face { font-family: "Tahoma";          font-weight: bold; unicode-range: U+0-2E7F; src: local("Tahoma"); }
@font-face { font-family: "Times New Roman"; font-weight: bold; unicode-range: U+0-2E7F; src: local("Times New Roman"); }
@font-face { font-family: "Times";           font-weight: bold; unicode-range: U+0-2E7F; src: local("Times"); }
@font-face { font-family: "Times CY";        font-weight: bold; unicode-range: U+0-2E7F; src: local("Times CY"); }
@font-face { font-family: "Trebuchet MS";    font-weight: bold; unicode-range: U+0-2E7F; src: local("Trebuchet MS"); }
@font-face { font-family: "Verdana";         font-weight: bold; unicode-range: U+0-2E7F; src: local("Verdana"); }
@font-face { font-family: "Segoe UI";        font-weight: bold; unicode-range: U+0-2E7F; src: local("Segoe UI"); }

/* 替换常见的等宽字体（中文部分） */
@font-face { font-family: Consolas;          font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Courier New;       font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Georgia;           font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Helvetica;         font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Helvetica Neue;    font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Lucida Console;    font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Monaco;            font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
@font-face { font-family: Palatino Linotype; font-weight: bold; unicode-range: U+2E80-FFFF; src: local("Microsoft YaHei UI"), local("Microsoft YaHei"); }
/* 替换常见的等宽字体（英文部分） */
@font-face { font-family: Consolas;          font-weight: bold; unicode-range: U+0-2E7F; src: local("Consolas"); }
@font-face { font-family: Courier New;       font-weight: bold; unicode-range: U+0-2E7F; src: local("Courier New"); }
@font-face { font-family: Georgia;           font-weight: bold; unicode-range: U+0-2E7F; src: local("Georgia"); }
@font-face { font-family: Helvetica;         font-weight: bold; unicode-range: U+0-2E7F; src: local("Helvetica"); }
@font-face { font-family: Helvetica Neue;    font-weight: bold; unicode-range: U+0-2E7F; src: local("Helvetica Neue"); }
@font-face { font-family: Lucida Console;    font-weight: bold; unicode-range: U+0-2E7F; src: local("Lucida Console"); }
@font-face { font-family: Monaco;            font-weight: bold; unicode-range: U+0-2E7F; src: local("Monaco"); }
@font-face { font-family: Palatino Linotype; font-weight: bold; unicode-range: U+0-2E7F; src: local("Palatino Linotype"); }

/* 修正 Mactype 引起的可能存在的斜体问题 */
/* em { font-family: "Microsoft YaHei UI", "Microsoft Yahei"; } */
```

### 测试

[多种字体预览页面](http://lifesinger.github.io/lab/2011/default-fonts/)，请在关闭 Tampermonkey（TM） 的基础上打开此页面（TM 在 iframe 多的页面会让内存飙升）

首先需要了解 `sans-serif` 为无衬线字体, `serif` 为衬线字体，在设置中可直接设置。

chrome 的规则（不考虑编码错误的问题）

- 无、sans-serif、serif 会调用默认的设置。
- `font-family: arial;` 会调用 Arial 和 宋体。
- `font-family: arial, '微软雅黑', sans-serif;` 会调用 Arial 和 雅黑。
- `font-family: arial, '宋体', sans-serif;` 会调用 Arial 和 宋体。
- `font-family: times, sans-serif;` 会调用 Times New Roman 和 雅黑。

### 问题

- 这类输入框还是宋体？ [发表帖子](http://bbs.qixing123.com/forum.php?mod=post&action=newthread&fid=38)