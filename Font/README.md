# 字体替换为雅黑

## 我目前在用的样式

Chrome 的字体替换详见 [chrome_font.md](chrome_font.md)

### firefox 下的样式

**首先需要设置浏览器字体为**  Microsoft YaHei UI 或微软雅黑

```css
@namespace url(http://www.w3.org/1999/xhtml);

@-moz-document url-prefix("http"), url-prefix("file"){
  
  /* 替换简体 */
  /*@font-face { font-family: 'Simsun';   src: local("Monaco"), local("Microsoft YaHei UI"), local('Microsoft YaHei'); }*/
  @font-face { font-family: 'Simsun';   src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }
  @font-face { font-family: 'NSimsun';  src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }
  @font-face { font-family: 'Simhei';   src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }

  @font-face { font-family: '宋体';     src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }
  @font-face { font-family: '新宋体';   src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }
  @font-face { font-family: '黑体';     src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }

  /* 替换繁体 */
  @font-face {font-family: "MingLiU";            src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }
  @font-face {font-family: "PMingLiU";           src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }
  @font-face {font-family: "Microsoft JhengHei"; src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }
  @font-face {font-family: "DFKai-SB";           src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }

  @font-face {font-family: "細明體";             src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }
  @font-face {font-family: "新細明體";           src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }
  @font-face {font-family: "微軟正黑體";         src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }
  @font-face {font-family: "標楷體";             src: local("Microsoft YaHei UI"), local('Microsoft YaHei'); }

  /* 替换日文 */

  /* 替换韩文 */

  /* 替换常见英文字体 */
/* @font-face { font-family: 'Arial'; src: local('Segoe UI'),local('Microsoft YaHei'); }
  @font-face { font-family: 'sans-serif'; src: local('Segoe UI'), local('Microsoft YaHei'); } 
  @font-face { font-family: 'Verdana'; src: local('Microsoft YaHei'); }
  @font-face { font-family: 'Tahoma'; src: local('Microsoft YaHei'); }
  @font-face { font-family: 'Times New Roman'; src: local('Microsoft YaHei'); }
  @font-face { font-family: 'Segoe UI'; src: local('Microsoft YaHei'); }*/

  /* 替换常见的等宽字体 */
/* @font-face { font-family: monospace;unicode-range: U+2E80-FFFF; src: local('YaHei Consolas Hybrid')}
  @font-face { font-family: 'monospace';unicode-range: U+2E80-FFFF; src: local('YaHei Consolas Hybrid')}
  @font-face { font-family: Consolas;unicode-range: U+2E80-FFFF; src: local('YaHei Consolas Hybrid')}
  @font-face { font-family: Lucida Console;unicode-range: U+2E80-FFFF; src: local('YaHei Consolas Hybrid')}*/
}
```

### 补充说明

**特别注意：** firefox 和 chrome 的字体方式不一样，最好使用 2 个不同的样式

- 字体替换只对设置了字体的有效，而百度搜索页面默认无字体，firefox 会调用默认的字体设置。
- 如果字体为 Arial 或 Verdana，其中中文部分 firefox 会使调用默认的衬线字体，而 chrome 不会。例如 [百度贴吧](http://tieba.baidu.com/p/3285422775?pn=2) 的翻页部分，chrome 需要额外的替换 Verdana 中文部分为雅黑样式。

### 测试页面

- [百度搜索](http://www.baidu.com/s?wd=firefox)，默认无字体。

### 参考

- [catcat520 的研究](http://bbs.kafan.cn/thread-1681393-1-1.html)
- [替换字体的中文部分为雅黑 - Chrome 网上应用店](https://chrome.google.com/webstore/detail/%E6%9B%BF%E6%8D%A2%E5%AD%97%E4%BD%93%E7%9A%84%E4%B8%AD%E6%96%87%E9%83%A8%E5%88%86%E4%B8%BA%E9%9B%85%E9%BB%91/enpkigfhoabjjjonanmddidnnahopmcn)