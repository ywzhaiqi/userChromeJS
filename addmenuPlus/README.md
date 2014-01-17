
addMenuPlus.uc.js
=================

Base on [Griever/addMenu.uc.js](https://github.com/Griever/userChromeJS/tree/master/addMenu). Now not only can add menu, you can modify the menu.

### Add Variables

 - %TITLES%, simple title.
 - %FAVICON_BASE64%, Favicon's Base64.
 - %IMAGE_BASE64%, Image's Base64.

### Modify the menu

modify the firebug key

	page({
		id: "menu_firebug_firebugInspect",
		accesskey: "F",
        clone: false
	});


## 中文说明

addMenuPlus 是一个非常强大的定制菜单的 uc 脚本。通过配置文件可添加、修改、隐藏菜单，修改后无需重启生效。

基于 [Griever/addMenu.uc.js](https://github.com/Griever/userChromeJS/tree/master/addMenu) 修改

 - 新增**修改原有菜单**的功能
 - 新增参数 `%FAVICON_BASE64%`：站点图标的 base64
 - 新增参数 `%IMAGE_BASE64%`：图片的 BASE64
 - 新增参数 `%TITLES%`：简短的标题

### 使用技巧

 - 菜单栏的 "工具" 菜单中有个 "addMenu 的重新载入和编辑" 菜单，左键点击重新载入配置，右键打开文件编辑
 - ID 为 `addMenu-rebuild`，可添加 rebuild_userChrome.uc.xul 中统一进行管理

## 配置的说明

### 可添加的范围

 - page: 页面右键菜单
 - tab: 标签右键
 - app: 左上角橙色菜单
 - too: 工具菜单

二级子菜单

    PageMenu, TabMenu, ToolMenu, AppMenu

### 标签的介绍

    label       标签的名字
    accesskey   快捷键
    exec        启动外部应用程序。（我新增相对路径。 \\ 代表当前配置的路径，例：\\Chrome 配置下的Chrome文件夹）
    keyword     指定了关键字的书签和搜索引擎
    text        复制你想要的字符串到剪贴板，可与 keyword, exec 一起使用
    url         打开你想要的网址
    where       打开的位置 (current, tab, tabshifted, window)
    condition   菜单出现的条件 (select, link, mailto, image, media, input, noselect, nolink, nomailto, noimage, nomedia, noinput)
    oncommand/command  自定义命令
    onclick     点击的函数
    image       添加图标 （对应 图标 url 或 base64）
    style       添加样式
    ...         Firefox 菜单的其它属性

    id          标签的ID（我新增的，修改原菜单用）
    position/insertBefore/insertAfter: 位置的设置（3选1），position: 1,  insertBefore: "id",  insertAfter: "id"
    clone       false 为不克隆，直接改在原菜单上，再次修改必须重启生效

### 可利用的变量

    %EOL%            改行(\r\n)
    %TITLE%          标题
    %TITLES%         简化标题（我新增的，来自faviconContextMenu.uc.xul.css）
    %URL%            地址
    %SEL%            选取范围内的文字
    %RLINK%          链接的地址
    %IMAGE_URL%      图片的 URL
    %IMAGE_BASE64%   图片的 Base64（我新增的）
    %IMAGE_ALT%      图片的 alt 属性
    %IMAGE_TITLE%    图片的 title 属性
    %LINK%           链接的地址
    %LINK_TEXT%      链接的文本
    %RLINK_TEXT%     链接的文本
    %MEDIA_URL%      媒体 URL
    %CLIPBOARD%      剪贴板的内容
    %FAVICON%        Favicon（站点图标） 的 URL
    %FAVICON_BASE64% Favicon 的 Base64（我新增的）
    %EMAIL%          E-mail 链接
    %HOST%           当前网页(域名)
    %LINK_HOST%      当前网页(域名)
    %RLINK_HOST%     当前网页(域名)

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


## 示例

打开方式(默认当前页面)，通过`where` 更改，具体`tab`(前台)、`tabshifted`(后台)、`window`(窗口)

Google 相似图片搜索

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

示例：页面右键添加一个菜单

    page({
        label: "复制链接文本",
        accesskey: "C",
        text: "%LINK_TEXT%",
        insertAfter: "context-copylink",
        condition: "link noimage"
    });

示例：右键添加 翻译整个页面 菜单（可用于 https），[来源](http://bbs.kafan.cn/thread-1642576-1-1.html)

    page({
        label: "翻译整个页面",
        insertAfter: "context-selectall",
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABsElEQVQ4jZXTsWsTYRjH8Zf+AYX+HTd0cM9SyOoglXLg1ryDU5Fwi90iWsiikFaOOEkGl2IsSEGwoggh8JLUJSC14qB3yZWQXlKTJrn3vg7JncmZqn3ggXf5fXjeh/cVQggh0ln+qxdWOstVFQI6hEDDMAivQBYA15sonYXdXTg4iMPXmyidhaMjWFqCfP7vwDQ8CkL6o1kAYHsblpcXAitbdYRUfPreZzAOGYxCepcJQJjGpBOA/eEMIRU3HjTYfP6NwXgSPu/r34AwDWqdErVOCWEac8C6fcq6fcrDQ5eVrToXw0m4/TMCpuFCJUOhkiG1sxYjJ94QIRVP35/F58dvW7QvNF5vCtQ6JYpKUqhksKsWdtWKkUeHLkIqWt0x/VHIaq7Bzb0veD1NqzszgTANikpy98WteBfRdYRUf/SJN6TZTewgCRSVjJFXxz4v6+c8+9hGSMX9soPrJ4Dcmzvc27/Nux82r78+ia9jVy2EaeD1NE1fk8p/ZjXXwPWD+dcoTIPUzlrcVnkDq7wR76Ppa1xf4/gaxw9w5oCoorcwg0VhJxFeDMx8sCj8r8/0C7G+ixTa1p4GAAAAAElFTkSuQmCC",
        oncommand: function(){
            var tab = document.getElementById('content');
            var win = tab.selectedBrowser.contentWindow.top.window;
            //var cur_url = win.location.href;
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

示例：页面右键添加子菜单

    var pagesub = PageMenu({ label: "子菜单", accesskey: "z" });
    pagesub([
        {
            label: "Google Translate",
            url: "http://translate.google.cn/translate?u=%u",
            condition: "nolink",
            accesskey: "t",
        },
        {
            label: "Google docs",
            url  : "http://docs.google.com/viewer?url=%l",
            accesskey: "d",
            where: "tab",
        },
        {
            label: "重新加载配置",
            accesskey: "r",
            oncommand: "setTimeout(function(){ addMenu.rebuild(true); }, 10);"
        }
    ]);

示例：菜单出现的条件，排除了链接、图片、输入框、选择等多个条件

    page({
        label: "snaplinks批量操作模式",
        condition: "nolink noimage noinput noselect",
        oncommand: "snapLinks.init();"
    });

示例：隐藏 App 菜单的 Web 开发者

    css("#appmenu_webDeveloper { display: none; }");

示例："字符编码" 移动到 "web开发者" 的位置

    tab({
        id: "appmenu_developer_charsetMenu",
        insertAfter: "appmenu_webDeveloper",
        // clone: false,  // 不克隆，直接改在原来的菜单上面
    });

示例：修改 firebug 快捷键

    page({
        id: "menu_firebug_firebugInspect",
        accesskey: "F",
        clone: false  // 直接修改原菜单，还原回去需重启生效
    });

示例：打开相对路径程序或文件夹

    page({
        label: "执行相对路径程序",
        // exec: "\\1\\base64.exe",  // 执行当前配置文件夹下的程序
        exec: "\\Chrome"  // 打开当前配置下的Chrome文件夹
    });

示例：添加图标，如果是原有的菜单需要加上 `class`，menuitem-iconic 或 menu-iconic，前一个是菜单，后一个是菜单项。

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

示例：修改错误控制台的按键（Ctrl+J）为以前的版本的控制台

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


示例：输入框右键增加 "粘贴并确定" 菜单，先增加一个空格，然后粘贴，再确定

    page({
        label: "粘贴并确定",
        condition: "input",
        insertAfter: "context-paste",
        oncommand: function(event) {
            function $(id) document.getElementById(id)

            // 给原输入框增加空格
            var input = gContextMenu.target;
            input.value = input.value + " ";

            // $('context-selectall').doCommand();  // 全选
            // $('context-cut').doCommand();  // 剪切
            // $('context-copy').doCommand();  // 复制
            $('context-paste').doCommand();  // 粘贴

            // 回车键
            window.QueryInterface(Ci.nsIInterfaceRequestor)
                .getInterface(Ci.nsIDOMWindowUtils)
                .sendKeyEvent("keypress", KeyEvent.DOM_VK_ENTER, 0, 0);
        }
    });

示例：输入框右键增加菜单，在光标处插入自定义字符。

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

示例：标签的右键菜单中加入复制图标网址的功能，左键 base64，右键 URL

    tab({
       label: "复制 Favicon 的 base64/URL",
       tooltiptext: "左键 base64，右键 URL",
       onclick: function(e){
            switch(e.button){
                case 0:
                    addMenu.copy(addMenu.convertText("%FAVICON_BASE64%"));
                    break;
                case 1:
                    break;
                case 2:
                    addMenu.copy(addMenu.convertText("%FAVICON%"));
                    break;
            }
       }
    })

[defpt 写的灌水的菜单 - 卡饭论坛](http://bbs.kafan.cn/thread-1671512-1-1.html)

    //快捷回复
    var Quickpostsub = PageMenu({
        label:"Quick Reply With...",
        condition:"input",
        insertBefore:"context-undo",
        oncommand: function(){
            goDoCommand("cmd_paste");
        }
    });
    Quickpostsub([
        {label:"Outlook~~~",text: "xxxxxx@outlook.com",image:" "},
        {label:"Gmail~~~",text: "xxxxxx@gmail.com",image:" "},
        {},
        {label:"谢谢你的解答~~~", text: "非常感谢你的解答！！！",image:" "},
        {label:"不用客气~~~", text: "不用客气，大家互相帮助……\u256E\uFF08\u256F\u25C7\u2570\uFF09\u256D",image:" "},
        {label:"看起来很不错~~~", text: "看起来很不错哦，收了~~~\n谢谢LZ啦！！！",image:" "},
        {label:"谢谢楼主分享~~~", text: "谢谢楼主的分享!这个绝对要顶！！！",image:" "},
        {label:"楼上正解~~~", text: "楼上正解……\u0285\uFF08\u00B4\u25D4\u0C6A\u25D4\uFF09\u0283",image:" "},
        {label:"坐等楼下解答~~~", text: "坐等楼下高手解答……⊙_⊙",image:" "}
    ]);

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

示例：使用 Everything 搜索选中的文字

	page({
	    label: "Everything 搜索",
	    oncommand: function(){
	        var str = addMenu.convertText("-search %s");

	        var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
	        UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0? "GBK": "UTF-8";
	        str = UI.ConvertFromUnicode(str);

	        addMenu.exec("D:\\Program Files\\Everything\\Everything.exe", str);
	    }
	})

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

## 使用了其它皮肤，右键错位的情况

把代码最后几行的css删除

    .addMenu > .menu-iconic-left {\
      -moz-appearance: menuimage;\
    }\

## 可调用的方法

    addMenu.copy()  // 复制
    addMenu.exec(path, arg)  // 启动程序
    addMenu.$$('a:not(:empty)', null, true)  // 获取所有被选中的链接