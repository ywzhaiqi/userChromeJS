addMenuPlus.uc.js
=================

addMenuPlus 是一个非常强大的定制菜单的 uc 脚本。通过配置文件可添加、修改、隐藏菜单，修改后无需重启生效。

基于 [Griever/addMenu.uc.js](https://github.com/Griever/userChromeJS/tree/master/addMenu) 修改

 - 新增**修改原有菜单**的功能
 - 新增参数 `%FAVICON_BASE64%`：站点图标的 base64
 - 新增参数 `%IMAGE_BASE64%`：图片的 BASE64
 - 新增参数 `%TITLES%`：简短的标题

### 使用说明及技巧

 - `_addmenu.js` 文件为配置文件，默认放在 `chrome` 目录下。
 - 在 `about:config` 中可通过 `addMenu.FILE_PATH` 设置配置文件的路径（如果没有手动新建一个）。例如`local\_addMenu.js` 为相对 chrome 下的路径（windows）。
 - 菜单栏的 "工具" 菜单中有个 "addMenu 的重新载入和编辑" 菜单，左键点击重新载入配置，右键打开文件编辑（需要首先设置 about:config 中 view_source.editor.path 编辑器的路径）
 - ID 为 `addMenu-rebuild`，可添加到 rebuild_userChrome.uc.xul 统一进行管理
 - 新增 `载入配置出错提示`，点击可直接定位到第几行，需要首先设置参数，详见 [编辑器及参数说明](https://github.com/ywzhaiqi/userChromeJS#%E7%BC%96%E8%BE%91%E5%99%A8%E5%8F%8A%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E)。
 - **[addMenu 脚本配置生成器](http://ywzhaiqi.github.io/addMenu_creator/)**

### 可参考的配置

成品

 - [defpt 的配置](https://github.com/defpt/userChromeJs/tree/master/addMenuPlus)
 - [bobdylan520 的配置](http://bbs.kafan.cn/thread-1677811-1-1.html)
 - [creek560 的配置](http://bbs.kafan.cn/thread-1682712-1-1.html)

其它

 - [\_addmenu.js](https://github.com/ywzhaiqi/userChromeJS/blob/master/addmenuPlus/_addmenu.js)
 - [\_addmenu示例合集.js](https://github.com/ywzhaiqi/userChromeJS/blob/master/addmenuPlus/_addmenu%E7%A4%BA%E4%BE%8B%E5%90%88%E9%9B%86.js)
 - [Oos 的摘要](https://github.com/Drager-oos/userChrome/tree/master/Configuration)

### firefox 32+ 右键错位的问题

修改 `insertBefore: 'context-reload',` 或 `insertBefore: 'context-bookmarkpage',` 为 `insertBefore: 'context-openlinkincurrent',`

## 配置的说明

### 可添加的范围

 - page: 页面右键菜单
 - tab: 标签右键
 - tool: 工具菜单
 - app: 左上角橙色菜单（firefox 29 以下版本）

二级子菜单

    PageMenu, TabMenu, ToolMenu, AppMenu

### 标签的介绍

    label       菜单的名称
    accesskey   快捷键
    exec        启动外部应用程序。（我新增相对路径。 \\ 代表当前配置的路径，例：\\Chrome 代表配置下的Chrome文件夹）
    keyword     指定了关键字的书签或搜索引擎
    text        复制你想要的字符串到剪贴板，可与 keyword, exec 一起使用
    url         打开你想要的网址
    where       打开的位置 (current, tab, tabshifted, window)
    condition   菜单出现的条件 (select, link, mailto, image, media, input, noselect, nolink, nomailto, noimage, nomedia, noinput)
    oncommand   自定义命令
    command     命令的 id
    onclick     点击的函数
    image       添加图标 （对应图标 url 或 base64）
    style       添加样式
    ...         Firefox 菜单的其它属性

    id          标签的ID（我新增的，修改原菜单用）
    position/insertBefore/insertAfter: 位置的设置（3选1），position: 1,  insertBefore: "id",  insertAfter: "id"
    clone       false 为不克隆，直接改在原菜单上，还原必须重启生效或打开新窗口
    onshowing   新增的，当页面右键显示时会执行该函数，可用于动态更改标签标题，详见下面的示例。

参考链接：

 - [oncommand - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Attribute/oncommand)
 - [command - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/command)
 - [Attribute (XUL) - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Attribute)


### 可利用的变量

    %EOL%            换行(\r\n)
    %TITLE%          标题
    %TITLES%         简化标题（我新增的，来自 faviconContextMenu.uc.xul.css）
    %URL%            地址
    %SEL%            选取范围内的文字
    %RLINK%          链接的地址
    %IMAGE_URL%      图片的 URL
    %IMAGE_BASE64%   图片的 Base64（我新增的，不支持 gif 动态图片）
    %IMAGE_ALT%      图片的 alt 属性
    %IMAGE_TITLE%    图片的 title 属性
    %LINK%           链接的地址
    %LINK_TEXT%      链接的文本
    %RLINK_TEXT%     链接的文本（上面那个的别名）
    %MEDIA_URL%      媒体 URL
    %CLIPBOARD%      剪贴板的内容
    %FAVICON%        Favicon（站点图标） 的 URL
    %FAVICON_BASE64% Favicon 的 Base64（我新增的）
    %EMAIL%          E-mail 链接
    %HOST%           当前网页的域名
    %LINK_HOST%      链接的域名
    %RLINK_HOST%     链接的域名（同上）

    %XXX_HTMLIFIED%  转义后的变量 （XXX 为 上面的 TITLE 等）
    %XXX_HTML%       转义后的变量
    %XXX_ENCODE%     encodeURIComponent 后的变量

简短的变量

    %h               当前网页(域名)
    %i               图片的 URL
    %l               链接的 URL
    %m               媒体的 URL
    %p               剪贴板的内容
    %s               选取的文字列
    %t               标题
    %u               URL

### 隐藏菜单右侧的 tab 提示

    css('.addMenu .menu-iconic-accel[value="tab"] { display: none; }');
    css('.addMenu .menu-iconic-accel[value="tabshifted"] { display: none; }');
    css('.addMenu .menu-iconic-accel[value="window"] { display: none; }');
    css('.addMenu .menu-iconic-accel[value="current"] { display: none; }');

示例
-----

打开方式(默认当前页面)，通过`where` 更改，具体`tab`(前台)、`tabshifted`(后台)、`window`(窗口)、`current`(当前页面)

示例：Google 相似图片搜索

    page({
        label: 'Google 相似图片搜索',
        url : 'https://www.google.com/searchbyimage?image_url=%IMAGE_URL%',
        insertAfter: "context-viewimageinfo",
        condition: "image",
        where: 'tab',
    });

示例：四引擎搜图

    page({
        label: '四引擎搜图',
        condition: "image",
        image: 'http://www.tineye.com/favicon.ico',
        oncommand: function() {
            var url = encodeURIComponent(gContextMenu.mediaURL || gContextMenu.imageURL || gContextMenu.bgImageURL);
            gBrowser.addTab('https://www.google.com/searchbyimage?safe=off&image_url=' + url);
            gBrowser.addTab('http://www.tineye.com/search/?pluginver=firefox-1.0&sort=size&order=desc&url=' + url);
            gBrowser.addTab('http://stu.baidu.com/i?rt=0&rn=10&ct=1&tn=baiduimage&objurl=' + url);
            gBrowser.addTab('http://pic.sogou.com/ris?query=' + url);
        }
    });

示例：短网址，分别为当前网页和链接上。

    // addMenu 专用
    page([{
        label: '短网址',
        condition: 'nolink',
        url: 'javascript:function iprl5(l){var d=document,z=d.createElement("scr"+"ipt"),b=d.body;try{if(!b){throw (0)}if(!l){alert("请输入网址！");return}d.title="(Shortening...) "+d.title;z.setAttribute("src","http://www.ruanyifeng.com/webapp/url_shortener_plugin.php?longUrl="+encodeURIComponent(l));b.appendChild(z)}catch(e){alert("请等待网页加载完毕！")}}iprl5("%URL%");void (0);'
    },
    {
        label: '短网址（链接）',
        condition: 'link',
        url: 'javascript:function iprl5(l){if(l.startsWith("javascript:")){alert("该网址无效："+l);return;}var d=document,z=d.createElement("scr"+"ipt"),b=d.body;try{if(!b){throw (0)}if(!l){alert("请输入网址！");return}d.title="(Shortening...) "+d.title;z.setAttribute("src","http://www.ruanyifeng.com/webapp/url_shortener_plugin.php?longUrl="+encodeURIComponent(l));b.appendChild(z)}catch(e){alert("请等待网页加载完毕！")}}iprl5("%RLINK%");void (0);'
    }
    ])

示例：页面右键添加一个复制链接文本的菜单

    page({
        label: "复制链接文本",
        accesskey: "C",
        text: "%LINK_TEXT%",
        insertAfter: "context-copylink",
        condition: "link noimage"
    });

示例：右键添加 Google Translate 菜单

    page({label: "Google Translate",
        url: "http://translate.google.cn/translate?u=%u",
        accesskey: "t",
        where: "tab",
    })

示例：右键添加 `翻译整个页面` 菜单（可用于 https），[来源](http://bbs.kafan.cn/thread-1642576-1-1.html)。*注：github.com 由于服务器限制，无法直接插入 js，而 google 翻译需要插入好几个 js，故无效。*

    page({
        label: "翻译整个页面",
        insertAfter: "context-selectall",
        image: "moz-anno:favicon:http://translate.google.cn/favicon.ico",
        oncommand: function(){
            var tab = document.getElementById('content');
            var win = tab.selectedBrowser.contentWindow.top.window;
            var d, b, o, v, p;
            d=win.document;b=d.body;o=d.createElement('scri'+'pt');o.setAttribute('src','https://translate.google.cn/translate_a/element.js?cb=googleTranslateElementInit');o.setAttribute('type','text/javascript');b.appendChild(o);v=b.insertBefore(d.createElement('div'),b.firstChild);v.id='google_translate_element';v.style.display='none';p=d.createElement('scri'+'pt');p.text='function googleTranslateElementInit(){new google.translate.TranslateElement({pageLanguage:\"\"},\"google_translate_element\");}';p.setAttribute('type','text/javascript');b.appendChild(p);
        }
    });

示例：页面右键添加多个菜单

    page([
        {
            label: "复制链接文本",
            text: "%LINK_TEXT%",
        },
        { },  // 分隔条
        {
            label: '复制图像base64',
            text: "%IMAGE_BASE64%",
            condition: "image",
        }
    ]);

示例：标签右键菜单

```js
	tab([
	    {
	        label: "复制标题",
	        text: "%TITLE%",
	    },
	    {
	        label: "复制标题+URL",
	        text: "%TITLE%\n%URL%",
	    },
	    {
	        label: "复制标题（MD）",
	        accesskey: "D",
	        text: "[%TITLE%](%URL%)",
	    },
	    {
	        label: "复制标题（BBS）",
	        text: "[url=%URL%]%TITLE%[/url]",
	    },
	    {
	        label: "复制标题（Html）",
	        text: '<a href="%URL%">%TITLE%</a>',
	    },
	    {
            label: "复制标题（Link）",
            class: "copy",
            oncommand: function(){
                var url = addMenu.convertText('%URL%'),
                    label = addMenu.convertText('%TITLE%');
                addMenu.copyLink(url, label);
            }
        },
	    {},
	    {
	        label: "复制 Favicon 的 URL",
	        text: "%FAVICON%",
	    }, 
	    {
	        label: "复制 Favicon 的 Base64",
	        text: "%FAVICON_BASE64%",
	    },
	    {
	        label: "切换编码（gbk、utf-8）",
	        accesskey: "e",
	        oncommand: function () {
	            var charset = gBrowser.mCurrentBrowser._docShell.charset;
	            BrowserSetForcedCharacterSet(charset == "gbk" ? "utf-8" : "gbk");
	        }
	    },
	    {
	        label: "关闭所有标签页",
	        oncommand: "gBrowser.removeAllTabsBut(gBrowser.addTab('about:newtab'));",
	        insertAfter:"context_closeOtherTabs",
	        accesskey: "Q"
	    },
	    {
	        label: "复制所有标签标题+地址",
	        class: "copy",
	        oncommand: function(){
	            var text = "";
	            var tabs = gBrowser.mTabContainer.childNodes;
	            for (var i = 0, l = tabs.length, doc; i < l; i++) {
	                doc = tabs[i].linkedBrowser.contentDocument;
	                text += doc.title + "\n" + doc.location.href + "\n";
	            }

	            Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(text);
	        }
	    },
	]);
```

示例：页面右键添加多功能子菜单

```js
// 多功能菜单
var pagesub = PageMenu({ label: "多功能菜单", accesskey: "z", condition: "normal" , insertBefore: 'context-reload'});
pagesub([
    {
        label:"繁体转简体",
        image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADlSURBVDhPrVPJDYQwDEwRroMKkPJLFUj8+NNBPjxSwn4ogBrogAq2hW3Cm8NOAgkR0m6kUWTkGQ9jEH85r/cHm1gnBADs9HF6TvSrwIFDDwi9wcUR7T2MtrYCARPO9wJEdo3jhMpPNf5OAoBqrQpk5AiathvsXO1cxWEVB4uWliRx2PP6LMrTqwKMnBiDq7gg+k2IJODhSVvIoilA64LeBmhF3HR2k8JsbYFsdnorXDwTIJvcnK9QrfQKTxy4pOfi42GBtCWilxnkq0rpy3A3BfwGUkMEi3g0M2iB80k/FNF/OUJ8Aad+5VEArUCmAAAAAElFTkSuQmCC",
        oncommand: function(){
            content.document.documentElement.appendChild(content.document.createElement("script")).src = "http://tongwen.openfoundry.org/NewTongWen/tools/bookmarklet_cn2.js";
            content.document.documentElement.appendChild(content.document.createElement("style")).textContent = 'body { font-family: "微软雅黑" }';
        }
    },
    {
        label:"自动刷新",
        url: "javascript:(function(p)%7Bopen('','',p).document.write('%3Cbody%20id=1%3E%3Cnobr%20id=2%3E%3C/nobr%3E%3Chr%3E%3Cnobr%20id=3%3E%3C/nobr%3E%3Chr%3E%3Ca%20href=%22#%22onclick=%22return!(c=t)%22%3E%E7%82%B9%E5%87%BB%E5%BC%BA%E5%88%B6%E5%88%B7%E6%96%B0%3C/a%3E%3Cscript%3Efunction%20i(n)%7Breturn%20d.getElementById(n)%7Dfunction%20z()%7Bc+=0.2;if(c%3E=t)%7Bc=0;e.location=u;r++%7Dx()%7Dfunction%20x()%7Bs=t-Math.floor(c);m=Math.floor(s/60);s-=m*60;i(1).style.backgroundColor=(r==0%7C%7Cc/t%3E2/3?%22fcc%22:c/t%3C1/3?%22cfc%22:%22ffc%22);i(2).innerHTML=%22%E5%88%B7%E6%96%B0%E8%AE%A1%E6%95%B0:%20%22+r;i(3).innerHTML=%22%E5%88%B7%E6%96%B0%E5%80%92%E8%AE%A1%E6%97%B6:%20%22+m+%22:%22+(s%3C10?%220%22+s:s)%7Dc=r=0;d=document;e=opener.top;u=prompt(%22%E9%93%BE%E6%8E%A5%E5%9C%B0%E5%9D%80%22,e.location.href);t=u?prompt(%22%E5%88%B7%E6%96%B0%E9%97%B4%E9%9A%94/%E7%A7%92%EF%BC%9A%22,300):0;setInterval(%22z()%22,200);if(!t)%7Bwindow.close()%7D%3C/script%3E%3C/body%3E')%7D)('status=0,scrollbars=0,width=240,height=160,left=1,top=1')",
        image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAK2SURBVDhPY0AGq/6HMs9/YFo794Hp8oUPrTIWP3Aymn/fXqC+noEJqoQwmHpT2nvybZlPU24p/pl0Tft130Xzox1n7YKg0vjBkmde8vMemkycekvu28Qb0v87Lyn8rzuu9q/ysG4DUJoRogoHWPLE3mD2PZ3DU27J/Zl8S+p/3zXZ/63nlP5XHtL4VLRP0xmqDDuY/9JUYvY97b2Tb0n/m3Jb6v+E69L/Oi/J/qg/qfKvdJ/WueKdemJQpWDwH+iaVaGhzFAuA8Os+zoZQH//mnRTCmTAvUk3ZTrazymmVB1Re160R2ti6CoGhGIgOCYjw3lYWVkbzJn535h1+h2lVZNuSnyfckNq6dS70nqr/jMw11/RYivZp92Wv0vPHawQCZy1sFA5qKraeMbYmJVh5lNJLmDIb5h8W7Jy4i0hPqgaMKifry+wONcMRey8u7vCUX39tfvl5HZukpTkYph5xph10i3J5CkvRXmgauDgsIGB/hETk/pjFhac++3tWU47OFgf1tU9sFdO7u9eaelVYBeAwJyH6lKrViEFChRsU1FJ2qqg8GafqWneAVPTtu1KSk+2SEn93ywp+WublFQmVBl2AAxppjVyctNXiIn9XyMl9XO1pOTfVUD2SjGxf2tERfevFRGRhCrFDlYpKfEvlpA4Ol9Y+D8ILwDihcLCfxeKiJxaKiJiDFWGG8yWl9ecLir6dKqg4P9pQDwdRAsJbZ8jLKwOlMafKoGAcaKoqHKvgMD+bn7+V718fD97+Pn/dfPwbAeyhaBqIGDlypWiixcvNl24cKH7okWLgoF0FJBOXrJwYeq87u7y2cXFk6bHx2+e7ONzo9/a+vn0zMxqkFqQHpBeBqBixSVLlgQB6WygYBWQ3QKkO4D0JKDYVBAGsRcvWNC5aN689oXz51eD1EL0LFIEAGnEJwptdKj6AAAAAElFTkSuQmCC"
    }, {
        label:"全页面截图",
        image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABISURBVDhPY6AOWPnmPwpGBuhy6PJggE8Buhy6PBjglEADA2/AMAAUhwHtDUDGyACbPAjDAV5JIMAmD8IkA7I1wgDFBmAABgYA9oelARp3ZZ4AAAAASUVORK5CYII=",
        oncommand: function () {
            var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
            canvas.width = content.document.documentElement.scrollWidth;
            canvas.height = content.document.documentElement.scrollHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawWindow(content, 0, 0, canvas.width, canvas.height, "rgb(255,255,255)");
            saveImageURL(canvas.toDataURL(), content.document.title + ".png", null, null, null, null, document);
        }
    }, {
        label: "宽度匹配",
        url: "javascript:(function(){function%20t(f){a=d.createNodeIterator(d,1,f,false);while(a.nextNode()){}}var%20d=document;t(function(e){x=e.offsetLeft;l=e.offsetParent;while(l!=null){x+=l.offsetLeft;l=l.offsetParent}var%20w=d.documentElement.clientWidth-x;var%20s=e.style;if(s.marginLeft)w-=s.marginLeft;if(s.marginRight)w-=s.marginRight;if(s.paddingLeft)w-=s.paddingLeft;if(s.paddingRight)w-=s.paddingRight;if(s.borderSize)w-=s.borderSize;w-=d.defaultView.innerWidth-d.documentElement.offsetWidth;if(e.tagName=='IMG'){h=e.clientHeight*w/e.clientWidth;s.maxHeight=h}s.maxWidth=w+'px'})})();",
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGXSURBVDhPYxh4MHHiRPv///8zQrlEA5Ce/v5+B4aWlpZX9fX1TFBxogFIT3Nz8yu4AatWrWI+fPiwIFAOp2tAtoLUgNSiGLB//36WdevWuU2YMKEZKMECVY8BQHIgNRs2bHABscEGtLa2vt66dasrkHOdm5v77Zw5c3iBhhpkZ2ebAA0W2bZtmyiI3d7ert/Z2ckLUgNUew1kCFDda4a2trbP4uLi30RERP5zcXG9rays1BESEvouLCz8u66uLrampiYOyP8NEisrK9MGqQGpFRMT+wbSCzLgG5Dzi4+P7z8nJ+fb9PR0fUFBwV8CAgL/srKykjIyMlJAbCD+mZycrMfBwfGWl5cXZMAvoOu/gb2wePHilLS0tBcgA2bOnCkC9F8YUGPsmjVrVEE4NTU1FuiaUJAcyACgQc8XLVqUDPYCKCCAfuVYsGBBOtC50/AFItASVqA3pgPVpoH0gAMRRAA1MQEDi/3IkSPK+BIVSA6kBqQWpAfFAKgaogHcAGDUhJOblDs6OiIYQKkKKkYyoEQvFDAwAACRUudRsBI1mwAAAABJRU5ErkJggg==",
    }, {
        label: "破解右键防复制",
        url: "javascript:alert(document.body.oncontextmenu=document.body.onmouseup=document.body.onmousemove=document.body.onclick=document.body.onselectstart%20=document.body.oncopy=document.onmousedown%20=%20document.onkeydown%20=null)",
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEZSURBVDhPjZExisJQEIYfrIW4HsBOq8VLLCoiKjYeQNAykHZBRQW9gPZewkJBiwVLL7B3sBRLC2c2M5mJL9FH/OEneZP//5L3Ykjj6Rxd5kCaXhVtS8wtDSb1NsQG2KWkJf4sDaQByFKJSx/aANjvEQYDnpFodqjVcdPuPEOSgNloglAoYJBEWK14vu71eX37yODS8+OQJIDvj8cQkM0i7HZ4/czzettoRhmpOwCBfr8r0VsZ1u3yXDNSdwNIUCyG5VwO8XLhmWak7gbovu8ECEyfT9KM1B8A23g+Pw7S98MrncfpFGWk/hoA1SqX/r7KvNbzgFIJFz9Dnkk9LnrAv9HzOKz7JhEUWq10gFqDrrVU4rIDaTbGmH8Vxu1dx2qGHAAAAABJRU5ErkJggg==",
    }, 
    {
        label: "Google 站内搜索",
        accesskey: "s",
        url: "javascript:q%20=%20%22%22%20+%20(window.getSelection%20?%20window.getSelection()%20:%20document.getSelection%20?%20document.getSelection()%20:%20document.selection.createRange().text);%20if%20(!q)%20q%20=%20prompt(%22%E8%AF%B7%E8%BE%93%E5%85%A5%E5%85%B3%E9%94%AE%E8%AF%8D:%22,%20%22%22);%20if%20(q!=null)%20{var%20qlocation=%22%20%22;qlocation=('http://www.google.com/search?num=30&hl=zh-CN&newwindow=1&q='+q+'&sitesearch='+location.host+'');window.open(qlocation);}%20void%200"
    },
    {
        label: "明文显示密码",
        condition: "input",
        url: "javascript:(function()%7Bvar%20IN,F;IN=document.getElementsByTagName('input');for(var%20i=0;i<IN.length;i++)%7BF=IN%5Bi%5D;if(F.type.toLowerCase()=='password')%7Btry%7BF.type='text'%7Dcatch(r)%7Bvar%20n,Fa;n=document.createElement('input');Fa=F.attributes;for(var%20ii=0;ii<Fa.length;ii++)%7Bvar%20k,knn,knv;k=Fa%5Bii%5D;knn=k.nodeName;knv=k.nodeValue;if(knn.toLowerCase()!='type')%7Bif(knn!='height'&&knn!='width'&!!knv)n%5Bknn%5D=knv%7D%7D;F.parentNode.replaceChild(n,F)%7D%7D%7D%7D)()"
    },
    {},
    {
        label:"复制扩展清单",
        image:"chrome://mozapps/skin/extensions/extensionGeneric-16.png",
        oncommand: function () {
            Application.extensions ? Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).copyString(Application.extensions.all.map(function (item, id) {
                    return id + 1 + ": " + item._item.name;
                }).join("\n")) : Application.getExtensions(function (extensions) {
                Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).copyString(extensions.all.map(function (item, id) {
                        return id + 1 + ": " + item._item.name;
                    }).join("\n"));
            })
        }
    },
    {
        label: "复制用户脚本清单",
        oncommand: function () {
            Cu.import("resource://gre/modules/AddonManager.jsm");

            AddonManager.getAddonsByTypes(['greasemonkey-user-script', 'userscript'], function (aAddons) {
                var downURLs = [];
                aAddons.forEach(function (aAddon) {
                    var name, downURL;
                    if (aAddon._script) {  // Greasemonkey
                        name = aAddon._script.name;
                        downURL = aAddon._script._downloadURL;
                    } else {  // Scriptish
                        name = aAddon._name;
                        downURL = aAddon._downloadURL;
                        if (!downURL && item._updateURL) {
                            downURL = item._updateURL.replace(/\.meta\.js$/, '.user.js');
                        }
                        if (!downURL && item._homepageURL) {
                            downURL = item._homepageURL;
                        }
                    }

                    downURLs.push(name + '\n' + downURL);
                });
                Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).
                    copyString(downURLs.join('\n\n'));
            });
        }
    },
    {label: "批量安装 GM 脚本",
        tooltiptext: "从剪贴板中的多个网址安装，是覆盖安装",
        oncommand: function() {
            if (!window.GM_BrowserUI) return;

            var scope = {};
            Cu.import('resource://greasemonkey/remoteScript.js', scope);

            var install_GM_script = function(url) {
                var rs = new scope.RemoteScript(url);
                rs.download(function(aSuccess, aType) {
                    if (aSuccess && 'dependencies' == aType) {
                        rs.install();
                    }
                });
            };

            var data = readFromClipboard();
            var m = data.match(/(https?:\/\/.*?\.user\.js)/g);
            if (m) {
                m.forEach(function(url) {
                    // 处理下 userscripts 的问题
                    url = url.replace(/^https?:\/\/userscripts\.org\//, 'http://userscripts.org:8080/');

                    install_GM_script(url);
                })
            }
        }
    },
    {
        label:"为此页搜索油侯脚本",
        url: "https://www.google.com/search?q=site:userscripts.org%20%HOST%",
        where: "tab",
        image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADSSURBVDhPnZK9DcIwEIXTsQBL0CAU15RQUtKwRAbIAlmCPuzADExAmwUyQHjPvrNs6zA/T/p0jvPe6Sy7MXQEE1ikXsBPWtzNRfD9DNvfqysadGH7s3RkMkh4kH2LLciUjW5Bj4prn0pkhlLoUXHtU1APHsAMpdAD9JixwSQ/r250cxlKgYesGYJ2UkODdmx9rQGvkkkn8JShEvGtQNQecPPMaoVSxLsBpv46xgGkP6pIE95ClNxsXfQVU0SJpS763jU4gTvgY9JHUjILGpY30DQvwsxGGOnZ9v8AAAAASUVORK5CYII="
    },
    {},
    {label: "Google Web Cache",
        url: "http://webcache.googleusercontent.com/search?q=cache:%u",
        accesskey: "c",
        where: "tab",
    },
    {label: "Web Archive",
        url: "http://web.archive.org/web/*/%u",
        accesskey: "w",
        where: "tab",
    },
    {},
    {
        label: "Chrome",
        exec: "\\chrome",
    },
    {
        label: "gm_scripts",
        exec: "\\gm_scripts",
    },
    {
        label: "userChromeJS content",
        exec: "\\extensions\\userChromeJS@mozdev.org\\content",
    },
    {},
    {
        label: "重新加载配置",
        accesskey: "r",
        oncommand: "setTimeout(function(){ addMenu.rebuild(true); }, 10);"
    }
]);
```

示例：菜单出现的条件，排除了链接、图片、输入框、选择等多个条件

    page({
        label: "snaplinks批量操作模式",
        condition: "nolink noimage noinput noselect",
        oncommand: "snapLinks.init();"
    });

示例：隐藏 App 菜单的 Web 开发者

    css("#appmenu_webDeveloper { display: none; }");

示例：打开相对路径程序或文件夹

    page({
        label: "执行相对路径程序",
        // exec: "\\1\\base64.exe",  // 执行当前配置文件夹下的程序
        exec: "\\Chrome"  // 打开当前配置下的Chrome文件夹
    });

示例：**添加图标，如果是原有的菜单需要加上 `class`，menuitem-iconic 或 menu-iconic，前一个菜单项（无子菜单），后一个是是菜单（包含子菜单）。**

    page({
        label: "图标测试菜单",
        image: "chrome://browser/content/abouthome/bookmarks.png"
        // 或
        // image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABxElEQVQ4jZXQzYsScRzH8d/f16lTFCwRdOoSUYddtlrUaXTVEdR1xqfysLtUrC2EujNjbplPjIGtJIZB6YLMjqu105/w7tQhMB8+99f7C18hVpiiKGiaRjqdJplMsor5B6dSKWzbxnVdVFVdL6CqKuPxmMlkgmmaxOPx9QKapmHbNt1uF0VREEKISCRCOBxmd3d3eSyRSDAcDmk2m4RCIYLBIPl8nsFggCzLiwOyLBOLxej3+7TbbSqVCuVymVqtRqPRQJKk+QE5bSLnPhGNRrEsi06ng2VZtFot6vU61WoVn883Hz/TDLLmhOSJQ/j1N3q9HqVSiUAggCzLSJKE1+udjyXNIKs7VLq/KZ+5hI/HbGd6+P3+5c/yqQYp3eHdmcvL6pT900sK7V94Ds656/+4OOBN6CSLDuXPLocfpqjFC56bE45bP9nKjbjjNf8f2Eno7BUcjI7L4fspe4ULMrrDm8aMzRcjbnuMxde3ckP0zhX7p5fE3tqkTxzy9RmPsiM2dpZgIYS4r32n0L4iY0xIFh2O6jMeZkfceroCFkKIe4qF5+Cco9qMV9UZD1I/uPl4Rfx3G7LFdd9Xrj35wo3t9fAfyK1fDftrXK0AAAAASUVORK5CYII="
    });

示例：输入框右键增加 "重做" 菜单

    page({
        label: "重做",
        condition: "input",
        insertAfter: "context-undo",
        command: "cmd_redo",
        accesskey: "y"
    });

示例：输入框右键增加 "粘贴并确定" 菜单

    page({
        label: "粘贴并确定",
        condition: "input",
        insertAfter: "context-paste",
        oncommand: function(event) {
            goDoCommand("cmd_paste");

             window.QueryInterface(Ci.nsIInterfaceRequestor)
                 .getInterface(Ci.nsIDOMWindowUtils)
                 .sendKeyEvent("keypress", KeyEvent.DOM_VK_RETURN, 0, 0);
        }
    })

示例：标签右键或链接右键增加 `复制地址（BBS、MD）` 菜单，左键复制 BBS 格式，中键原标题，右键 MD 格式，可去除标题一定内容。

    function copyBBS_or_MD(event){
        var title = addMenu.convertText("%RLINK_TEXT%") || addMenu.convertText("%TITLE%"),
            url = addMenu.convertText("%RLINK%") || addMenu.convertText("%URL%");

        [" - 互助分享 - 大气谦和!", "_免费高速下载|百度云 网盘-分享无限制", " - Powered by Discuz!",
            "百度云 网盘-", "的分享", 
        ].forEach(function(r){ title = title.replace(r, ""); });

        switch(event.button){
            case 0:
                addMenu.copy("[url=" + url + "]" + title + "[/url]");
                break;
            case 1:
                addMenu.copy(title);
                event.target.parentNode.hidePopup();
                break;
            case 2:
                addMenu.copy("[" + title + "](" + url + ")");
                break;
        }
    }

    tab({
        label: "复制地址（BBS、MD）",
        tooltiptext: "左键复制 BBS 格式，右键 MD 格式",
        onclick: copyBBS_or_MD
    });

    page({
        label: "复制链接（BBS、MD）",
        condition: "link noimage",
        tooltiptext: "左键复制 BBS 格式，右键 MD 格式",
        insertBefore: "context-sep-copylink",
        onclick: copyBBS_or_MD
    });

示例：输入框右键增加菜单，在光标处插入自定义字符。*这种方式在百度贴吧无效，因其输入框较为特殊，可采用下面通用的复制粘贴的方式。*

    page({
        label: "在输入框光标处插入字符（测试）",
        condition: "input",
        insertAfter: "context-paste",
        oncommand: function(event) {
            var aText = "123";

            var input = gContextMenu.target;
            var aStart = aEnd = input.selectionStart;

            // 在光标处插入字符
            input.value = input.value.slice(0, aStart) + aText + input.value.slice(aEnd);

            // 移动光标到插入字符的后面
            var aOffset = aStart + aText.length;
            input.setSelectionRange(aOffset, aOffset);
        }
    });

[defpt 写的灌水的菜单 - 卡饭论坛](http://bbs.kafan.cn/thread-1671512-1-1.html)

    // 快捷回复
    var Quickpostsub = PageMenu({
        label:"Quick Reply With...",
        condition:"input",
        insertBefore:"context-undo",
        oncommand: function(event){
            var text = event.target.getAttribute('txt');
            if(text) {
                addMenu.copy(text);
                goDoCommand("cmd_paste"); 
            }
        }
    });

    Quickpostsub([
        {label:"Outlook~~~",txt: "xxxxxx@outlook.com",image:" "},
        {label:"Gmail~~~",txt: "xxxxxx@gmail.com",image:" "},
        {},
        {label:"谢谢你的解答~~~", txt: "非常感谢你的解答！！！",image:" "},
        {label:"不用客气~~~", txt: "不用客气，大家互相帮助……\u256E\uFF08\u256F\u25C7\u2570\uFF09\u256D",image:" "},
        {label:"看起来很不错~~~", txt: "看起来很不错哦，收了~~~\n谢谢LZ啦！！！",image:" "},
        {label:"谢谢楼主分享~~~", txt: "谢谢楼主的分享!这个绝对要顶！！！",image:" "},
        {label:"楼上正解~~~", txt: "楼上正解……\u0285\uFF08\u00B4\u25D4\u0C6A\u25D4\uFF09\u0283",image:" "},
        {label:"坐等楼下解答~~~", txt: "坐等楼下高手解答……⊙_⊙",image:" "}
    ]);

示例：右键搜索图片二级菜单，来自卡饭论坛

    var imagesub = PageMenu({
        label: "Reverse Image Search",
        accesskey: "I",
        condition: "image",
        insertAfter: "context-inspect",
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACxklEQVQ4jaXT72sbdQDH8fsDSh/3D9hDn7mJD33QJz4abI5JCBtVdKy4sSGUtbOiTKgOgnbTtcjowjoUklX6A+lcXL60sTbz0mtySdprm+bnJb3kmia5NtndjvD2wRC3h7r388/r2UeSXrf5+fmxFTnRTaZSaU3TphOJxIiqqh5ZlvsVRTmuKMpxWZb7VVX1JBKJEU3TppOpVHpFVrsLCwtjkhBCPIobLG21WCt00AyHXN2l1HhOueFQbjiUGs/J1100w2Gt0GFpq8WjeJWwWBaSEMtiOW0gZy0Suk3acNk0u2j7sFF1UbJ11jNV4rk68eIRatkmlrOIbLwErO0YbOgWmZpN/sCl2OyyqTe563/At9/fZfzOFLcn/dy68yN/pfNs6BbKThXxD6DlDQpVi72GjXnoUm05jIx+wfTMY3SzTeXgGeX9DuHVJBc/uUIqU0IrvAxkdfYPLKy2Tcd2ebK6yNkL51nKL1KwMhw5Lkd2l3K9w5c3J5ny30fLlhFCvAC+fhBlOrzLk1Sdsd+GOHntTT66PoTYXkbWV0nsxam0HHKmw8TPv/Pe+Ut85V9hMRT+F7gX2mU2ZhLabPPN1AwfXhlFLTXJ1m1KzS6FRpctw+bmZBDPheFXgadRP/HkHOrWH6xnNUS6Qv+7J4lpe1SaDjXLpma12a2YnD7rYW7+B35amH0BhIUIFdRhzO1RWvkbHBbHSMXu8fDhDN5z51hPqlTrJpl8jqufXmXCdwZz+3OK6jBChEJSMBg8tRaddXXtFoY2wuT4RQYGBvjOd51U5ANuXHuboUvvMHz5BH/++j7m9mfo2m2Up3NuMBg8JUmSJAUCgWORSGTQ5/Mder1e+vr62o8Xf2nX9Ag1PUK5HGtXCupusZgT6XR6IhqNfhwIBI698onBwcFxr9dLT0+PKUnSG//5VB6P563e3t6d/zV+nf4GlMZlg8I0vOAAAAAASUVORK5CYII=",
    });
    imagesub([{
        label: 'Google Search',
        url: 'http://www.google.com/searchbyimage?image_url=%IMAGE_URL%',
        condition: "image",
        where: 'tab',
        image: "http://www.google.com/favicon.ico"
    }, {
        label: 'Baidu Search',
        url: 'http://stu.baidu.com/i?rt=0&rn=10&ct=1&tn=baiduimage&objurl=%IMAGE_URL%',
        condition: "image",
        where: 'tab',
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACoklEQVQ4jZ2T6UuUURSHzz9QRhCpJJVZERUFmVmp7bZYZiUttpiEVliEtCctJtGHPgQGEm1EUbQHUlCBWSI1NbagJfheX3XG1LSmhWL0NTtPH6ZmEulLF86XcznPPb/7O0eksAYprEEK3iKHqpED1Uj+a2TvK2TXC2SHG8lzIVufILkVyKZyJLsMySpF1t1HpLCG/z2ScQ+Rgre9LqzaTj1S0K7VVR0KYKxOtY2jvQAr7iBysLpH0nGUPTvaGBVTp5kZzWobh2mTGzVljldt4/QEpJcgsr8qmPj8qRuAXXltTB7fQE5mC26Xn7hx9cyd4cHt8vcEpN1GZN9rADyNXWxY26y5Oa1668ZXcjJbKC7yAVBc5KO4yIfb5cfr6QoBFt1EZPdLAK5d+sKQgZYmxjUogG0cOjtCsm3jsGrZO1YuadLWlh8BwPxriOysBOC5y09CbANLFzZxt+QbtnHYvKGFvC2t2Mbh2NGPTBpfT0ykwe3yK4DMvYLI9mcAdHfDjatftbjIp7ZxSE326ogoo2NibNYsf6e2cViW6iVtvlcb6gOOyKxLiGx7Gmyzo+MntnFIm+dlZJTR6HDDn1ixuElt4/D44XfltzKZfhGR3Iog4E1VJymzvYwYVMffxdHhhnHDbbIymrHrQlZK4nlENpUDoAqH89t18ACjQweaXoDBA4yOHWbzqPR78Gdl6jlEssuCgKMFHzS8r6WR/SwiwywN71OrEWEWUf0tHdTf0mERhssXvoQA8WcRySoNtuRp7GJLdivJSR7SU5o4cdzHieM+Zk1tJHZ0PRvXN9P2/kdIQtxpRNY9+Hu4FKgEnvwjKntM4sRTiKy+F1iK9BJkyW0k9Say4HrA49mXkZkXkaQLSMJ5ZMo5JP5M4OXYU8iEk/wC6ZkDX3ssK20AAAAASUVORK5CYII="
    }, {
        label: 'Sougou Search',
        url: 'http://pic.sogou.com/ris?query=%IMAGE_URL%',
        condition: "image",
        where: "tab",
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB0klEQVQ4jZ3Sv2sUQRQH8FdsZSURK0tB8D/Qa3Iii1oIwcIuSnoLf4AigkUgWqQXLhgQQgqxDUHsrCTFtoJL4G53dmcvs7t37M3uODur97WYuPFMUM8Hr5vvZ+bxhvr9/mIQBHtBEOCkDsMQjDEwxhBFEeI4Bud8L0mSRSIiGgwGSfzgCrjr/Hs/vArGWEZEpykIgvnChy2EABF1ZoDh7XMo367D+B6mSuLX+j5K8PXju/ZslmUgom4LiJWL+JZGbaBhX1DtbKDa2YB6/wbG92B8rwXyPLdAGIbgroNqd3PmxvzJtT+OMB6PLcAYA3cdFK/u4/eqP3+C3F5D/uwmkqUzM0BRFBaIouhIXV+B9j5gqtUxbKoV5PYakhunwF0HUkoLxHF84hPTe5cwef0UxvdmILm1Cu46KMvSApzzNjR6voSD5fNHW7l19thoPzehlLLAcDhsA3+rqVbIHtlPp7W2gBCiBardzXZdTbxv1xnvw/ge5NYqxN0L7dm6ri2Qpul//URjjAWyLIsOXtyZKzx6uQwpZUpEXcrz/LoQIiuKApPJBFJKlGWJqqqglILWGnVdwxgDYwyapkFVVXmv13tMRJfpsBaIqENE3Tm6Q0QLPwAGVa1p0zMtjwAAAABJRU5ErkJggg=="
    }, {
        label: 'TinEye Search',
        url: 'http://www.tineye.com/search?url=%IMAGE_URL%',
        condition: "image",
        where: 'tab',
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADRElEQVQ4jW3Tf0zUdRzH8Y9QkUHLOW9KYEmtGkziPMexDicMuB/Q0TFg2MQK2gkRP+JEQjhyJr8Kji/I7zhghLBkghvS6cFUfhxwcXLFFvpPK4iTWLM/+0NW7dkftwJX7+315+vxx2t7C3X9ZEy8ZWYxt64PveUWGsnxv1E3TJF8yUFK2wKJzXPEW2YW1fWTMSLBMr3Z3VTN2vkIhk1xaKXZf0sZHfPIM84gC1PxbGAI+4JfQhb4ArFqLeUDtzk77N4UGsnBNXMKK4VBTBSEo5EcaCUHxYMuDsmjEUI8lmOh+8mtbya5ppuMum6ERnJgaLCTYniLTGmcU1YXlpvLpGVloZUJSo4KqmOexvKmjK7UA/S2f8JHc79gmlzhw+t3vYBGchD5fhX5fQ4sN5dI77FT+2Uf9p6PGb3aSf9wHy2D/Vzs7KLA0kG+ZKWwyUpRc+828LZkI+ezTnJGnZTZlzFarOiyC4nUGHg5XIHsQBDyqGiSUtKRyWQE+D3JHv/d20DxoIuTHSMUX53myBvH0CTq0adlIHb5IITgOdl+XMvf8+iPP+m/MoKv327vLv8A58fuYbK5OXQkisOvy/n90RYAn7d2Inx8USXo2HkZWUYvoG6cJb5hhrKBWd7ttSF8nyI7J4/fHj5kdXWVv4CjquOEK1UsLC6SlpoKwNDomBeIqryB0mzjvdoh0lqG2RvyGrFqLaXnKjiVmQnA6fwi/J4JwDowRE11NQA9l7/yAkqzDaXZhrZmkqrriyR92o4QgtN5BWx41tna2iI6Ng4hBK+EHmbi1h1u35kiLELBnsCD24DSbMN0+S5VC6skVDQSoT9BZYuV7DPl7A15lefD5BxUqIgwZBKbV05yVQe5Y0uPA0qzjbNDS7S5PFTM/4xxzE32iJOiiXuUzPxE6fw6JY41yhY8SN/9SvP0j/8FlGYbxy/Yye9zUnfjPm1ODy0uD63frNPuXOPS1A9UXnGS1ziCIceMUFaMP9hZTmya4YP+OYq7xiltGsBYWEbSCSP6k7no0rOJM7zDi6EKdvk8gRDigVCUXtNFnvt6M/qCnSLbfWrdHmq/3eCie4PKqRVMrV8QH7qPAH9/goKDdz7Wpr8Qur8B/c1d/jmhRwsAAAAASUVORK5CYII="
    }, {
        label: 'IQDB Search',
        url: 'http://iqdb.org/?url=%IMAGE_URL%',
        condition: "image",
        where: 'tab',
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAcPUlEQVRogY2YZ1zUZ7q/ebE5OdnUzWaNXVdFBaXDUAYGmBnKMMAMM8ww9DL03qQoighKC7HX2HuNKGLvqIgUC/YYu8kmm2Q3iVFgyvV/gXE3Z3fP+b/4fj6/l9d1/+6n3I/F4dYWmkrzuXbtFsuWbaKxKI+a3EzS4zRUZqVSl59NXV4WtbmZTNPHEq9RkBcXRXVWGvOy01laUsDWqhnsr6vi89qZ1OelkBWlJl0XRlqEkrQIBRm6MLIj1RTH6qhIjKUiKZY8nYb19ZGYe8swXy/HfG8RptsNPN4URn9LBG3LwmhKE6Hx82ZffT7lcRoWZCYSJRNxYdUsjLePY37Sg8W0jGR2rP2MRw8fMq8gh4bCXAr1MRTqY34DX5AQRXqUlurMVOZmp1OTlUZ9biYNuRmU6mPIjdVQnBhJXU4Ky0vyaMhJIydSQ3SIDIW/L8FSEQp/b9SBviQoA1lQrsXUW4q5txRTbwndO/UsKQ3kYoOE7iYphiOx5Gtc0fr5kKtWkKWSkaqS8mT/YkwPL2J+dnlQYGZ2Gl89e8qqBU00FORQk5tBWoyampx0al/BV2YkU5YS/xq8JiuN6sxUqtKTKUmMZXaanqr0ZGan6Zmhj6cyJYEV0/I4WFfFztnlfJqTTnFsJAkKOcFiL4pTAui/PA1zbyk39qXQUhtEyywfft4cRN82OQ9WBHC6TsKmEm+SQwJQS4SIXGxZWZJE6/J6ts+vYUNjJbuX12OxYdlieq9eYV5eFvUFOZSmxlOSEkdtbubrVGel/gv8nIyUQej0ZIrjY0jVqolVyolWyIgMCUATJCEswBd9eBC1WfGsmJZBTWo8q/ID+eVANPc2aznZJOfIHDEXGiT0bZO/Tv/WIPq3BtJe643Cx42kYH8yFHLSQgLJCpMxI1qFQuRGVJAEi/ZLl1lUW/u6XXLiI5ibk0FtbibzcjL+Lfiv8FXpycxMSaQyNYnZKUlUpiQyMzmBWfp4qpITWJyfxYqiHEritKSoAzhWE8DLbQrO1UvZUeZDW52E7zfI6Nsm55ctcnoXBtCzOpqOVWE0pYrQy6VE+Xuj8HbFz80eL6eppIVJqMvQ0lyfS/vmJiz2Hr3GnOx06vKyqM5Oo0gf87/C/9oqxfEx5EZFkB2pJU2rIj4sGF2wP1q5lExdMHXZcVSnx5IdoWRatJZNJf58vS6YNQUiztVJub8igM4FAXSvUnJ5YwTXP0/ixe0lmB5vwdieRVejDxo/J/w9HFH5eKCTeBMfKCZb48/u2lx6dszn76fWYlHfsOL1Qp2emsicV4v0P8H/KlCZmkRVSiKVKYnMelX1WUlxlMVHkx4eRnRwIPowOREyCXIfNxpypSwuk7FlVgBdm2N4eiIL09VizJcLMF7MwNSTi+lqPuar+RjPJdO3WcqZxXJutKTy7GQmfZeyGOjK5MquWO6f2oLxxmGM99qwqMgvft3rFWmJ/75l0lOYnaanXB9HQZyOrCg1Gbow0rQK0rVKsnUq8qM0ZGhU5EdqmJUUy8LcdNaXFtBSU8H+6goa0vVkqUOpjJexq1LOs81KBprV/LRHzZ2VMjobvOmeL6F7WRA9y2QcqnDjl+2BXFmnxHhOj7EtHsNBFaa2BI5tKMT8pOfVLpSe/Lpl5mSm/tuqz0hOoCAukswoFWtrIjmzWMPBmmA2zwyhPt0PVaAPaeFhNGWnsnNWGScbq9lYXsSi3HQW52awqiiHDaUFzE2OpyRKS0mkhixVMJlKTz7LEXCiSkhHnReddZ5cbvCifa4HXyzy5NRsVy7OdePmAi+66j24t8CDl+tFPFruTU/rmkGB/5+FOjtNT0NRPH85V4LpajmGU2kMdBRwYIWe0kQNZfFRVCTEMCM+mvLYSKr0cZxqrOFATQV1qYmkhoWQGCqjIELFNF04xbpwUkOD0Pn5EC+TUKgWcLzSkxcbJbzcJOblJl/6Nvny01pvzswWcKg2gReH5vPNnjq6luXRsTiKk1VCeg+vweJ/6/XypFiK4iOpK9bxS890TD0lGNqy+fZcEXUFkcxIjKUiMZaCSA1JSjm5ujDWluZwuLaSQl04UUFSKuIj+CQjkZJIDWqpiHCpF1lhwWSGBZMdFkqQp4BwsRCt2JsClTet0z24XO9O7yceXKxxY12WExkhQqoTwmlM0dGUHsHG6cnsqC9me1MeFv/XQm0siud5TwXm3gqM3cU8OV1AdmwwadpQMrUKciNUlMbqKIzSMFsfTbLKjzA/T2LlUrLCQwmX+hDuJ0Qp9iBdGURCkD9+Ho5opJ6ES4Skhwbh7+aMv7sD4T6eZCnkaHxEREl8SJX7kRQoJtbPG62PO0mBIjJDfJG52qH0dEbr647Ff9rb82K0ZMeG8s2lWsyPNmG+Xc/3F0tIjfInPMiX8EAflH5ehEqEqPy9KIgOpT4jnrwIFevKklhblohK6kFkgDfZ6mA2zEwjWSkhXOKJXh6AyMkGf3d7ZEJHUoMDUIk88HO1J0rqQ7YiiGSZFLGTLRFSVzJVvsxODGZjeTynP83j6501DJxcgeHCJiz+Z9Wn6+MpitORH6Pl6oFSzF8fxPzVPox3F1KZo0Yd6EOiUsriHB3NVWkcb8jjYH0em2alkaT0I0wiJFUZxNLp2XxzaAWVehVykYCoID9aVjewaU42od4CYvzFuNpZ4eFgRaC7A/EBYuL8xUhd7NHLpGSHyMgKlpEV6s+RReX03T6J8fohBo4sxHB2Dean3ZiedGFRkZL4m5aZnZLIrJREtjYmY75ZhelGJaYbM2lZkUxprI6yuEjKYjRsn1vID+27MN04iun6IYxdezCcXsPVdVXUZumIkomZX1HIyystZGoD8XaxJVUbyp0zu9GH+WFtOQ7bSRNxtZ2Eq+0kZO4OKDxdifAVEuwuIFXmR2qQlEy5P/FSH0I83fmkLIfWpbO5t7mKl1+0YXzSiUVhXBSz0/TMfgVflhhDfqyKHztLMV2fjun6dL45V8S0OC3T46MoiAwnOUyOXhlEXrSG07tXY352Bb66Cs8uY7p7GmPHdp4dXEFalBpFoISrBzewr7EQ64njGDFiBMOHD2PYsGEMHTqUoUOHMmHsaARTLQn2cMLFeiIih8nESD2JFgsJ83QmOUBMcoAYicNURLZWiJ2sKImWc3ZDPRb/XPWCGC1JKjnb5se+hjdfn86ySi3xigBytErKYyMpi9GRF6GkITuSmYkaFleXMfC4G766gvmrK3Qc2kJunJrGaSm0bl3G6c0L8BY4MHLECMaNHE5WQSVHzn1BRe0axk+YTG3VdPy9BLhMnYDU2Ra1pxuuUycQJnRG7+9LsJs9OpEbKQFiZC4OBLva4WljicOkMVj8Cj8zOYGZSXFkRyr5W8e0Qfje6fzYUUx+pJrpcVEURYZTqFNTFqOjNDqC+dl6bmyay8LCOEqzEtmzZj75abEsrC7hYedhTI8u8cOFHXg62TJ6xHAmjR6O7dihuE4cxvrPlmEymbl19yFmYz/f3LtCQkQITlbjiJWI0HkLmTp+NGJHKxKlIuQCe6SO1iRIRPjaW7EwR8vtrXOx+PUeUxKnQ6+Ws7giCvP16dA7HXNvKXvmR1ISHUFZjO51SqMjKInS0jy7jOIYLWfX1LCuvozZpTkYH13CePsEpgft/HT7NKtK4xgxfDgTRw1l4qihTBr1MYIJQ0jw+RNL6woxGAxgNmMeeIHxx2+pLC/Ey9aKJH8f9P6+yFzscZ8ynmgfIVIHG+wsR6HxdOGzkiSMNw5hUfnqElaRFEeyOpjTa+MHx7zeUkxXp1GVrPgN+PRYHeUxEZREqZmXEk1xhJrZ2cn0XdnPtSNbeLb3UwynVmG6f55fbp2gMFLGmBGD8JYjP2bCiCGMH/Yn9NKP+EvXMgb6XvL4/j1+/vkFP/30E8bnf0Mi8sBtyjiCXe2IFXuhFgoQWI0l0tsNid1UnCzH4O9ozbSUaCxmJsWRFxU+eKJGhfPj3giMF7Mx95bycH8iuVoV2RoFGeoQCnVqpkdHcHzeLM7WV5EY7IdG6kWuOpStC+dienCBFx27MF7civlJN+Znl6nKT8LJ3o71q5Yj8/Fg3PCP+PPQPzJ+2Ic8vNhA52dB5Om1/PSXp3z71WPMP3/HycMtZMRoCHSZivPk0fjYT0RiPxkHy1HovAT429vgYTUeD6vxWFQkxZKiDiY7QkljTjh9OxT0N4dj7i2huSaEspgISqO0pCrl+AmdUUs9mZccxbrCbCpiIggSClD6uJGhDObOuf2Ds+o/5ce752mYV4sqKBDB+I9Ik/6RmMAxbKpz4VGrB0kyS24c28WT21cw3LuA6VE3L/76lKd3riB2nILC3QHhFEsUQhv8nCZhO244WqEA10njsBzxJyzK46MoitIQHiBidaEffTtC6NsZiqkrjzmJXugVgZREapimCydLFUq6UoI+1BuZpwtlkWpyVaGIBfYofdyYnhr3LwLmp92YHncx8Kib9YvqyA+bwKmaYZxYIKQiUcLXF/ZjvH0W0502TF+cx/TlBcxPr2L+5QfKM+LwtrNEbD8ZnZeAY3WZ3FlbTqCzFSpXR07UZ2BRHhdFfqSa6GAp+2ZJ6NsRwsvtcgzH4shSiQmTeJCulFMcoSZDKScrLIRafRjpSh8ChY4kyCRkKOUUJWlQebtz6eCW38CbH3dhetCB6csLGO+08fz6WT5fWsu2T2Yy0HWAgZPrMHS1DErcPTco8OAi5m/vsHfDEsLcHFALnZgVG4C/oxUHqpO5vKwIqf1ECpRiLGbER5OvU5OqknNqnoSX2wcH6++3KkgMDiQ3XIFaIiRfoyQ/XEGa0o+4QCnHa9NZlK1B4mpLrL8Pc/QaGouT+LSiAPPTy68Gjm5MDy+9hjdeP4Xx6jEMV45iuHKU/paF9O2aS/+RlYMC985jetCO+eElzE+6+Kb3FB7u3ojtJjEnVs5fd85hVow/t9aUc7QuA7HtRCxKYnRMi9KSEBpAe/0/XgeuzZegFHtQpFWRrQohPkhKoSaM4ggl0YFCIqRePNlRy76adKSutmh9hVxaXUlTZdHracn8uAvz/Q6Md89hvHEa45VjGLoPY+g6jKH7CIZL+zFcasbYewzjF+cxP2jH/KgT8+NLmJ5cwvS0k+jYFNbNLcTbZgKfz0rAcKCOL9aW89fDC1mZq8aiQKcmKkiKXhFIW6341ZOGjPPzvAnyciZBPgheEaMlVxXKvMRoIqUe+Ls5UB4XxsDhBZycX4DExYayeCV/72l9XX3z4y5MX17EePssxt6TGHuOYOhsxdDZyvMLzXx9fDPGG6cx3T03CP8r+D+lddVcBo4t4dZnJSg8pvLjnmoGDjXx173z+OHoEiy0Mh/yI9TIvd1onuFN/1YZfVsCOFPjhczTiSBPJzIUQTQkx7EyJ40sZRDTNCGEixwRu9hwtDGXgSMLaW0qQuhozXdXjg4KvOp/8/2LGG+3Ybx2EsPFffS1LKG/dTkD53bz9Mg6jLfOYLh3nvZ9a7nfvg/j4w5MTy5hftyJ+XEnZ9bV0n94PgMHGniwvpwDVckMHPyUgUPzebBzDhYKPyGxcimZqlDq9W70bQmgb4sfZ6s9CRQ6Eih0JNjLhdywEPZVFPNpSjzlOgWBbk7EBboTGyhk4MhCBo4tZk3jDD5f04TpSfdgHndhenBxsIWunaT/yGpebq7k5cYKXm6uxNDRjPFOGy2fzOFRdgnX9DkcTEzhyCfVvPjiAubHXRzdvIiuldPpP9DIQEsDjzfOZKD1EwYOfkrfwSYslFIPFGJ3UhQyCrVyvlwqpm+LH511nvh7OODvbo+viw1yoRN1+kga9dF8lpNCoKsj28rjKI+WcWNtBT+cWEV3y1qcHWzZvabp9X3d/PASpi/OY7x+ioG27fRtn8uLDTN4uWkmA8fX8kvvSVqjk/gufzp/r/uEn1eu4Kfly+hZUo3pUQedLev5qfc4Z1bO5v6aMvr319Pf0sjAgUYGDn2KRZTMF4XYnVAfV9IVQZREBPBkhS93ForwFdji52aH2MUGbycbIqRu5KsDWJAaQ5yfNyqRgGfbq7m3dQ7XT2xl4oRx+IXE8M3jh5i/uor5SRfmR52Du9CNUxg6D9J/aBUvd9bTt7OOgRPrOL91GU8zivl7QxPPN6zh+YY1vDi4n+fbNvFjx35un9rJ95ePYLrbxsOT22lbUcn15dPo3zePgZZaLPK0YYT6uhHsLSDEW0CmUk6J1o97i0WInKyRutoiEdgQJnIjSupBktwDP4EtIUJHvB2tKY2U86KnmeykKD54/30kAWHs3buX/r4XmJ//FfNfbmK6347xxmkMPYcYaG9moG03hvZ9GHsO07FjBU8yivj5s5WvBZ5v3cjzTevpv3iCW2ea+fLMHkx3zmK8fRrjrdN8faGZy7uX0nd8GRYlUVrUEi/kIheCvJyRe7mQoQiiUC1BKpiMRGCD2GUqUoENW6ZlEOvniYedJUJ7SwRTxhMgsKWxLIcxo0Yy5IP3GPvHd5k6/B08rEcxoziLxw/uYfrmLi+vHsdw+TgD19sZ6DzGwMUDGLoPYbhxiuaifH5etXwQfv0anq9bzfN1qzHc7uTSwa30Ht6C6fYZjDdPYbhxEtOt0xjunMVw79ygQG64EpmnCzJPJwKFjgR5OpEeEkikxBtvp6n4Ok9BLrQlV+VNYoAPMoEj/i5W2FqOwdNuIl62k3n33XcZ+sG7jP7wHaYOexvxxN/TWmOH2WRkx6paTmxYhPGLqxju32Pg6nkGuo5h6DmK8cZpfrx6nP3VFXy7ctlr+L6jn2N+3MGq2nKeXNiH8eYpjL0nMFw/Mfh9t42/de7F4td7TkygBD93BwKFjoOvBR4OpAUHkCSTIHaaSmKQO75Ok/G0tyTEw5F4qYj0IA8WZyiJlgp45513GPr+2wx9//d8/N5bjPjgLWamy+j/uZc9M8dzdN18jF9ex3Cze/APdB3HePk4puunMd9vx/Sog6sH1/OodQ0vOw9jfniRb85sZtPcQkx32jBeP4nx2nGMvScw3jiJ6c5ZTLdODAoU68Ip1IYh9xIgcbMjROREiJcjAW72JAdJmBGhokglw9POEm97a5ytxuNlNwmZix0FYX4sL0/h7bffZsh7v2foe2/x8bv/zcfv/DdD3n6TvfOnsnvWUM7vWInhxjkMPScxdB3H0H0CY89xTNdPYb4/eIj9GtPNw/ztyFJW5mroP7wI441TGK8exXjlCMarxzBefyXwxVkspkVqKI5QU6RVkasKRerqgK+LDfoQTyKkAsLFzhSqZGzKTyc5QIzbVEv8nW0QTpmEl814hFMn4OdozVtvvcWH77zF0HffwmHSeIa8/SZD33mTqy0ezIt5m3snd2G4cRbDlVODEt3HMPYcwXjz9D9O4ZtHMJxawfe75rCmQMuLPdX0fT4P45WjGHsODebyEYy9JwYF7p7GoihCTXGEmkJNGAXhSrKUcnxdbPFzsyUhyIPYQFdyVN406XXsK88nJzgAsf0UXCaPxd9xKtlyEYUqHz58/z0+ePcdHj18gMRpIhEub9LW+BE/nAkmSzmBr2910d/ZguH8HgxtOzG0bcdwbjuG9u0YLm7FcHI5Ay21PNowneO1afQ3z6Vvzxz6tldi6PgcQ/dBDN0HByW6WzD27MPYvgWL8FcTVXZYCNlhwRSoFRRrFPi52iMX2qEQOaDycSDcxwG1lwv1cRGUqoIJFjjiZj0e96l/Jlhgy+ghH/Hmm2/i7uGNl0CAr/UfmBH2X8T4/JE52bH8cLOb746spW/7bPq2VfLd+nL6dlbRv7eGgf21DLTUcuHTbK4tK8BwdBGGcxswXtzBwOkNGC7tw9DVyo+ntvDtoZV8tbuOv2yv5OfmuVikKeQEeroQJ5OQGCQlys+bNfnpLEpPJFjoTJTMAYmLFRJnKzztJuLrYEWc2JO0ADHJUm9kTnb42FqicJvCm2++yRtv/BeO7gE0rT7Cjd67/L1tGz+1NPHkWgcv2rZyfn4hqwuieLy2jP7Pa+hvnsuj9eX0LMzhx+0z6N85g/5tZfRtKaFv2wz6m+sZOLoSQ9s2jB3NGK8d5fuOZnoPrebL83uxSAoOJCVEhr+HEyEiARqJELWvK5kKP6qS5FxcJach1hpf50kIbS0R2kzAw2YccldbEsReJElEJEpE6LwEWI8ezhtvvMHvfvc7/uuNN1ieFc7a3HCakkLICvLAx2Y8K7JV/LKnmv7muRiOLmZxhoJgwWSyglypifThZmMSL9fm8ePKbHrrEtiUEcKFOXH0bS6nf+dsHu5p5NsvLmP+9kvMDy5iMSdJR3JIADlhIQQJXZEJHQj2ciRc7MLm2iAeNEdQHW3Fk8MxJAdY4mo9DnebP+M6ZQzuU8YS6mpHvK8niWIvEn09kTvaMvQPH/DRe+/iZzcZt0lj0HpY81lmCN9tno7h2GKeH1vKw/VF/NKzl5RAAbZ/HoKn1RiktpOQ2kwixNGGAFsrNK62HCvX8Wx5Llea0rmzu5GfH17D/Owq5ocXMX15AQu1n5DF2XrigyQ0pSaQGRpEYpAInb+A784k8XR3GJ3VjvRsVPJ8VwAzwsejcBuDwHoMAqvRuEwaievkMcgcpxArciPRR0i8j5BgJzuihK5EuDswWy1mRUoIu4p1tNRn0zIvhd4lWTxqXYqX9Whsxg5h4ogPGT/sD4wZ8gHSqWNJ9rGlQumO2tWK6lgZP5zdPAj++BLmRx3/EKhK1aDxE9KQGkuWKoDW2dP4LC+ZaXHemHvSubXUm4cLXOisc+Vvh7R8s96HyihrFsdPIMBxJM6TRuJkORJHy+E4TxyO2NYStZsD8d4exIvc/23ivNzQubugcLYn2NGWEEdbQpzsCHGyJcDeCpH1OLysRlEb58/T7TWYbh3F/PC3Z4X50eCcbTEjKYyzS8tRSdxJDpHi7+ZIiVbB/oUaTOcTuFDlxLMlrvyy2o2ZKc4MtAbzqDWSaN+pnJ1hw9qMyYidxuAwYRiOE4bhMH4oDuOHIrAcgb/dJLTuTq+hNW6OBNhZ42k1DlfL0bhajsJlwkjsxg7F23oUcV5WNGiFnC5X88vafAYONmG8dgDzgwt8f+04Aw/afyNgvt+OhdrfC8O5jVxYXo5K7Eq42AOR41TutsQx0BzC7kJ7ulf483KtG2K7j2lfKsXcnUr7lhgkDhNZkWjNi6Nh7MqagMjqI6xGfYT9uI9/E2fL4Yis/0yA3SSCHaegdLEl1NkW8ZRJiKwm4GY5lhK5O0sSZCzL0rBkWiJ1RUmUpmjRa+U0VORxt+3z3/6Bx5cwP7yIRYCnC9/fOI3x/EaONBXi6TQFlcQJU08mfRt9WJBoS3OVJ/27/Ej3H42v00hMl5Iw35xDyzIdIpsJzIp25OUaJ75bOIV0yRicxo/CZcIorEcPwWbskH8R+k9xGPcxU8f8CacJw8kJl9K6ZCbPu/Zi+rJtcLZ42o35ac+rcXNQwsLf04V7HYcwP+7EcHo1SwpjmZkuwnwpjf4N3hQorDgxR4DhWDjL9db84f33+bzJH7pTMH/dyqpqFe6Tx9KUOIX2GRN50mRNcdAIBBNHohLYEebigL+tNV6Tx+M+cSwuE0Ygsh6N5fAPmTzyIyaP/BNp/o4kSBywHv0xHpP/zOqiKL4/uQZj70FMjzoGwf/HY9mvAv8PbvJAc6ytZCgAAAAASUVORK5CYII="
    }, {
        label: 'Regex Search',
        url: 'http://regex.info/exif.cgi/?url=%IMAGE_URL%',
        condition: "image",
        where: 'tab',
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADpElEQVQ4jQXB2VPUBQDA8d9qjDwQRzSwhhCwu2MpwR7cIBDbcuoaLQuBICznEldcCxmgAoPAqrASBqikLosIq6BxyiEmKQ7E4TE19eJMM73YQ//Bt89HePvHKzbm7azP3mVjwc72yjRrD8dZvGdjeWqM9blJXv0yw5uns+ysTrO7Os328hRbi3Z2FicR1qZGsbUZGWkuZKytlNykaHzFYqReXiikEhKVQeRrorlmymN5oJGZy7U86K7C3lbCw7YihI15OzdairHU5xKrOIpItB+RSIRo33u4ODkjdnPnk4NeHJPJuFKZzYPLdUx0fIOtpQB7awHCxsI9rG1GOsr07N/ngKeTC0ovbyL8/PlSIeeEXI5CIkX6sS/JIUrsXd/y86Va7O1G5jrLEF48us9YRzk91dkcdHXDoFDSk6DhVkY6c0UGntWVM2WqIFoexGE/CZaGfJ4ON7PYW8ev/fUIm0vT2DoqGTlnJPyIDINcQV9CEqM6PSO6dMxfaXl0tg6bqRyZlw+jNaVs3u5i/VobL62dCFsrs4x3NTLR00ROUhyB4o+Qe/nQHKumPzMDrULJ4Gk9e12NVGrUPD97hnWrhcfXe/jd/gPCwv1xvi/OpsGQSb42kc/9Jah9JJhCotirrmHiZAZbRWX8PWRhq6+dgTIDSdFh9DWU8M/CTYSRwaskRAQTH6pAHaniVEgwdfJwypWhTBaU8qMuF7NOz+vhS+wNm1EHHcXDxYULlXm8WxlFuDk8REJUGOqIYDRRISSHqcgOkhPnK6Eq7gtuFBoxaRIYrTeyM9RNQXwEnh+4Ya4p4N2KDWH89i2+M+Qy2FTFw74uLtSUoQk8Qoq/jAplJAMpGQydysGkO86GuZU961WSQgLpbzTy75NJhN2leV4M9rJ5w8Lr8evsWgcZqa4iPSYavSyAYlUkyYEK6k4kstTTQok2BZX0MA1ZabwZsyD8+WSRv+5c5fngRZZ629kYG+G/7R3WxqwEHDqEt6s7kVIJ9WlJBMtkiJ3dSQ9TUpt8jO7c4whvn63y2zUzPeVFnM83cP/ceSba27E0mTgRFswRTzHhMn8OODji5yEmPyaM0vgIDHHhVKbGIrxcnmV1oBOzPpOfUtMYT89isaSEr0NV+Hp44u3+ISKRA67vO3NSFYg+VEFWlIq8mFBqtWqEx3etzF88x0xzK7OnC5kpqeBOaSnVqRqcDjji7OiE7tMAcpQKtIrPOKkKJCtChVETxRldAv8DCURA7EPC5P4AAAAASUVORK5CYII="
    }, {
        label: 'saucenao Search',
        url: 'http://saucenao.com/search.php?db=999&url=%IMAGE_URL%',
        condition: "image",
        where: 'tab',
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVElEQVQ4ja2SwQ4AMARD+/8/bbdlw8ogcdK9RQsApNmQal2A359dgCK7j07tBmiBByGzWMjABsBMfaaQgdAYxwGtFVomMiGZDRxSYFLulCtFY8z2AmZhBhe3B+XrAAAAAElFTkSuQmCC"
    }, ]);

示例：撤销关闭二级菜单 By feiruo

    var undoMenu = PageMenu({
        label: '撤销关闭',
        position: 2,
        tooltiptext: "右键显示所有历史记录",
        onclick: "if (event.button == 2) {PlacesCommandHook.showPlacesOrganizer('History');}",
        onpopupshowing: function(e) {
            var popup = e.target;
            popup.setAttribute('id', 'addUndoMneun');
            var items = popup.querySelectorAll('.bookmark-item');
            [].forEach.call(items, function(item) {
                item.parentNode.removeChild(item);
            });
            var undoItems = JSON.parse(Cc['@mozilla.org/browser/sessionstore;1'].getService(Ci.nsISessionStore).getClosedTabData(window));
            if (undoItems.length == 0) {
                popup.setAttribute('oncommand', 'this.parentNode._placesView._onCommand(event);');
                if (!this.parentNode._placesView) new HistoryMenu(event);
            } else {
                undoItems.map(function(item, id) {
                    var m = document.createElement('menuitem');
                    m.setAttribute('label', item.title);
                    m.setAttribute('image', item.image ? 'moz-anno:favicon:' + item.image : '');
                    m.setAttribute('class', 'menuitem-iconic bookmark-item closedtab');
                    m.setAttribute('oncommand', 'undoCloseTab(' + id + ')');
                    m.setAttribute('type', 'unclose-menuitem');
                    popup.appendChild(m);
                });
            }
        },
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAABDklEQVQ4jZ3SPShFcRjH8Q8JN2IgI4pJorxkMJDNYlE27AZWG4vBJoOymewMshtsdzHIQilKUl7SDde9hnNuTqdzLuc+9UzP8/2e/uf3kFyNWMVwyrxqNWEddxjPCuewiQJeMJYFbsU2PlDGM0b/C7dhF58hXA5FR9jDBhbQh/o43IV9FCNwUhdxgx30RwWHKP0BxzuPiYpgCbcZBWWco7cimcV1bKGEJzziPUHwja3oU2ZwFVl4xTwGMYUVHMdkl/EfOokLvzGOxOY5LOI+3CnEBQTHk8eb9ENaw1fYiTWEU+mn3C2I9CFNAD3oTJm1CFI4qSaoVu04w3KtggEcoKMWuA5zmK71682CeBvgB+93YAIjVuYDAAAAAElFTkSuQmCC"
    });
    undoMenu([{
        label: "恢复上一次会话",
        command: "Browser:RestoreLastSession",
    }]);

示例：保存所有图片到 zip

    page({
        label: "保存所有图片到 zip",
        oncommand: function() {
            // 保存ディレクトリのパスがない場合は毎回ダイアログで決める
            //var path = "C:\\Users\\azu\\Downloads"; // エスケープしたディレクトリのパス
            var path = "";
            if (!path) {
                // ファイル保存ダイアログ
                var nsIFilePicker = Ci.nsIFilePicker;
                var FP = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
                FP.init(window, 'Choose save folder.', nsIFilePicker.modeGetFolder);

                // ダイアログ表示
                if (FP.show() == nsIFilePicker.returnOK) {
                    path = FP.file.path;
                } else {
                    return false;
                }
            }
            // ダウンロードしたページを表示するために URI オブジェクト生成
            var hostURL = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService).newURI(location.href, null, null);
            // ページに貼り付けられた画像を保存する
            var links = content.document.images;
            var pack = [];
            for (var i = 0, length = links.length; i < length; i++) {
                // JPEG と PNG を保存する
                if (links[i].src.match(/\.jpe?g|\.png|img\.blogs\.yahoo(.*)folder[^thumb]/i)) {
                    pack.push([links[i].src.split("/").pop(), links[i].src]);
                }
            }
            zipDeKure(pack, path);


            function zipDeKure(urls, savePath) {
                const ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
                const zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
                var uri = content.window.location.href;
                var fileName = uri.substring(uri.lastIndexOf('://') + 3, uri.length);
                fileName = fileName.split(".").join("_");
                fileName = fileName.split("/").join("_");
                fileName = fileName.split("?").join("_");
                var path = savePath + "\\" + fileName + ".zip";
                var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
                file.initWithPath(path);
                var zipW = new zipWriter();
                var ioFlag = 0x04 | 0x08 | 0x20;
                zipW.open(file, ioFlag);
                for (var i = 0, len = urls.length; i < len; i++) {
                    var [name, url] = urls[i];
                    var ch = ioService.newChannel(url, "UTF-8", null);
                    var stream = ch.open();
                    zipW.addEntryStream(name, Date.now() * 1000, Ci.nsIZipWriter.COMPRESS_DEFAULT, stream, false);
                }
                zipW.close();
            }
        },
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABBElEQVQ4jdWSsWqEQBBAbcRKC4VlBf8gfUr/w1oQBLuABNlUNkE2LCJqJQe6CZFUqXIfkINwCP6B2ITbI22uCCkmnVwCB9pdHrxqmMcUI0lnAef8uWmazVw55xvGWDEF6rreO44DS6yqajsFsizb2bYNS2SMvU2BMAzfZVkGVVVB13VACAHGGEzTBNM0AWMMCCEwDAM0TQNFUSCKotdfAUmSYIlnFnhZrz/SNP3MsmyWRVEc2rbdHl1wnSRJsqKUTpZl+dT3/b7rul2e54/HM0rpyvO8q5OPFcdxMY7jtxAChBAwDMNXEAQ3Jxf+YlnWpe/7d4SQB0LIveu6txjji9mB/8UPojsDPwcvqoEAAAAASUVORK5CYII="
    })

示例：左键用傲游打开当前页，右键直接打开傲游，相对路径（上上层 parent）。

    page({
        label: "傲游浏览器",
        tooltiptext: "左键：打开傲游\r\n右键：用傲游打开",
        onclick: function(e) {
            var maxthonPath = Services.dirsvc.get("ProfD", Ci.nsILocalFile).parent.parent.path + "\\Maxthon\\bin\\Maxthon.exe";
            switch (e.button) {
                case 0:
                    var url = addMenu.convertText("%URL%");
                    addMenu.exec(maxthonPath, url);
                    break;
                case 2:
                    addMenu.exec(maxthonPath);
                    break;
            }
        },
    })

示例：使用 Everything 搜索选中的文字，需要自行设置路径。

    page({
        label: "Everything 搜索",
        oncommand: function(){
            var str = addMenu.convertText('%s');

            addMenu.exec("D:\\Program Files\\Everything\\Everything.exe", ['-search', str]);
        }
    })

示例：快速保存选定文本为 txt 并打开。

    page({
        label: '快速保存选定文本',
        condition: 'select',
        oncommand: function() {
            if (!window.NetUtil) Cu.import("resource://gre/modules/NetUtil.jsm");
            if (!window.FileUtils) Cu.import("resource://gre/modules/FileUtils.jsm");

            goDoCommand('cmd_copy');
            var data = readFromClipboard();

            var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
            fp.init(window, "另存为", Ci.nsIFilePicker.modeSave);
            fp.appendFilter("文本文件", "*.txt");
            fp.defaultString = content.document.title + '.txt';
      
            var res = fp.show();
            if (res != Ci.nsIFilePicker.returnCancel) {
                var aFile = fp.file;
      
                var ostream = FileUtils.openSafeFileOutputStream(aFile);
      
                var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
                converter.charset = "gbk";
                var istream = converter.convertToInputStream(data);
      
                NetUtil.asyncCopy(istream, ostream, function(status) {
                    if (!Components.isSuccessCode(status)) {
                        // Handle error!
                        return;
                    }
      
                    aFile.launch();
                });
            }
        }
    })

示例：Firefox 31+ 横排菜单，**在链接上和非链接上不相同**。

    var openMenu = GroupMenu({
        label: '打开...',
        condition: 'noinput noselect nomailto nocanvas nomedia',
        insertBefore: 'context-sep-navigation'
    });
    openMenu([
        {
            label:"复制文本+链接",
            text:"%RLT_OR_UT%\n%RLINK_OR_URL%",
            image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABlSURBVDhP5Y5BCsAgEAP3i/1AP+D/zxUlwWBXXQueOhAQzQStcN3p2UmVFK80C7QGH1aEBniOBPqhgRnsQB8P8KzRe+i/+YHCO+htQNPjdaB/G4D6hoWekFzQohfUxngSg4pglgGUsQ0ZR4jGSwAAAABJRU5ErkJggg=="
        },
        {
            label:"在隐私窗打开",
            oncommand: "openLinkIn(addMenu.convertText('%RLINK_OR_URL%'), 'window',{private:true});",
            image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKDSURBVDhPpY/PT5IBGMffWl76ceiS62/wlrc6uLmZM81MZ3noQik4NAWRVwXlVSbKDyEFcgoCyoshIvgCBpgS/siUhbnWDJrKVnaouS5tuTaX3wSxVrfGZ3sO3+/zPN89D5Ex7+dYWDLmIC1TsNnDWfcE1nNpeaS9Z5NeWv5NG4/aPgmorNSfr3s4LpHLmB2VwrdHSdzzkg7XnFw2tddNORL1XCtVWjpyIbVI4FRVlekOIWoxf9OrbTutLVN+Ra/747RrEevRGOKxBCJrb7EQjiL8PAqvZxljRgbdEttuC98alIrpN8Imy1dCKuRtzljb4PFE4A+sYdL5Cl7fOywuJ7C1vYf1jV3Q9ig02gUo+2ZgMc2ANnvAOLzoEo1uEWTTSCjgCYHqdO1z6wyb1dVKe3XNwCdZz1OsvExgdi6G+kYbbpdLP5RXiO13q+TxRsHYvscRAMk3LxKcmpHBee8c+Pwh6/FvBEFR1GkuVxN1Tm2AtkXAYqlepFspamuVTveoDZwHRjnRyeM8spscUPe5v3d1jTvb2x1ikcjWIBQ+DtH0KsasyyBJc0AgsDaQJH3UM3mUPU9+aLqNP0tKNFeIyMR1yNuaj35aQv/AM6jVfgz0B6HRzIJhXqdKqz32FQpfynfRDBo4en/qnN1wGZrvV3iFvNGVCQsDxrWEadcaBnU+hIIRzPtXYTYEwbgjmJ4MY9xgB9nYHyss1Fz+HWAWZyM3l53FZg2ppGLDZ73Scqjo0B1IWofjEnI4rujQHuh6DYedpPZLDUurLi7uvZhaTnISkJZEQYHqUlmJquhmkfJaXh51Jlm3bsivJr38fFl2euwP/wb8NxkH+HU5mQVkBkH8AgvRfy93EDdrAAAAAElFTkSuQmCC"
        },
        {
            label: "在 IE 中打开",
            text: "%RLINK_OR_URL%",
            exec: "C:\\Program Files\\Internet Explorer\\iexplore.exe",
        },
        {
            label: "在 Chrome 中打开",
            text: '%RLINK_OR_URL%',
            exec: Services.dirsvc.get("LocalAppData", Ci.nsILocalFile).path + "\\Google\\Chrome\\Application\\chrome.exe",
        },
        // {
        //     label: "在 Opera 中打开",
        //     text : "%RLINK_OR_URL%",
        //     exec : "D:\\Program Files\\Opera\\opera.exe",
        // },
    ]);

示例：子菜单中的 测试视频链接 只在 youku 页面显示，其它页面隐藏。

    var testMenu = PageMenu({
        label: '测试子菜单',
        onpopupshowing: function (event){
            Array.slice(event.target.children).forEach(function(elem){
                if(elem.id == "mtest-video"){
                    elem.hidden = content.location.host.indexOf("youku") == -1
                }
            });
        }
    });
    testMenu([
        {
            id: "mtest-video",
            label: "测试视频链接",
            hidden: true
        }
    ]);

示例：2014-9-8 版本之后新增的 `onshowing` 函数，在右键菜单出现时会执行该函数。例如下面这个例子只在卡饭论坛显示 **插入 code 代码** 右键菜单。

    page({
        label: '插入 code 代码',
        id: 'addMenu-insert-bbcode',
        condition:"input",
        insertBefore: "context-undo",
        oncommand: function() {
            var str = addMenu.convertText('[code]%P[/code]');
            addMenu.copy(str);
            goDoCommand('cmd_paste'); 
        },
        onshowing: function(menuitem) {
            var isHidden = !(content.location.host == 'bbs.kafan.cn');
            this.hidden = isHidden;
        },
    })

示例：动态显示标签标题，详见 [怎么样用addmenuplus实现一个这样的菜单项](http://bbs.kafan.cn/forum.php?mod=viewthread&tid=1784671)

    page({
        label: '复制: ...',
        text: '%SEL%',
        onshowing: function(menuitem) {
            var sel = getBrowserSelection(16);
            if (sel && sel.length > 15)
                sel = sel.substr(0,15) + "...";
            this.label = '复制: ' +  sel;
        },
    })

示例：动态显示标签标题（二级菜单）。

    var menu = PageMenu({
        label: '搜索',
        onshowing: function(menu) {
            var sel = getBrowserSelection(16);
            if (sel && sel.length > 15)
                sel = sel.substr(0,15) + "...";
            this.label = '搜索: ' +  sel;
        }
    });
    menu([
        {
            label: '百度',
            url: "http://www.baidu.com/s?ie=UTF-8&wd=%SEL%",
        },
        {
            label: 'Bing',
            url: "http://www.bing.com/search?q=%SEL%",
        },
    ]);

### 特殊的示例

示例："字符编码" 移动到 "web开发者" 的位置

    tab({
        id: "appmenu_developer_charsetMenu",
        insertAfter: "appmenu_webDeveloper",
        // clone: false,  // 不克隆，直接改在原来的菜单上面
    });

示例：给 firebug 添加一个 accesskey

    page({
        id: "menu_firebug_firebugInspect",
        accesskey: "R",
        clone: false
    });

示例：修改错误控制台的按键（Ctrl + Shift + J）为以前的版本的控制台

    page({
        id: "key_browserConsole",
        command: "",
        oncommand: "toJavaScriptConsole();",
        clone: false
    })

示例：移动星星到书签栏后面，并修正图标大小（firefox 26）

    page({
        id: 'star-button',
        insertAfter: 'personal-bookmarks',
        style: 'margin-top:5px;margin-bottom:5px;',
        clone: false
    })


示例：给 flashgot 添加功能：右键点击一次性调用下载工具，并不改变默认的下载工具

    page({
        id: "flashgot-menupopup-options",
        clone: false,
        onclick: function(event) {
            if (event.button == 2) {
                event.preventDefault();

                var defaultDM = gFlashGotService.defaultDM;
                gFlashGotService.defaultDM = event.target.label;
                window.setTimeout(function() {
                    gFlashGot.download();
                    gFlashGotService.defaultDM = defaultDM;
                    document.getElementById("contentAreaContextMenu").hidePopup();
                }, 0);
            }
        },
    });


使用了其它皮肤，右键错位的情况
----------------------------

把代码最后几行的css删除，请不要保留空行。

    .addMenu > .menu-iconic-left {\
      -moz-appearance: menuimage;\
    }\

可调用的方法
-----------

    addMenu.copy()  // 复制
    addMenu.exec(path, arg)  // 启动程序
    addMenu.$$('a:not(:empty)', null, true)  // 获取所有被选中的链接
    addMenu.convertText('%s');   // 得到选取的文字
