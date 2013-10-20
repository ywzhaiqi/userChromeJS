
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

#### 可添加的范围

 - page: 页面右键菜单
 - tab: 标签右键
 - app: 左上角橙色菜单
 - too: 工具菜单

二级子菜单

    PageMenu, TabMenu, ToolMenu, AppMenu

#### 标签的介绍

    label       标签的名字
    accesskey   快捷键
    exec        启动外部应用程序。（我新增相对路径。 \\ 代表当前配置的路径，例：\\Chrome 配置下的Chrome文件夹）
    keyword     指定了关键字的书签和搜索引擎
    text        复制你想要的字符串到剪贴板，可与 keyword, exec 一起使用
    url         打开你想要的网址
    where       打开的位置 (current, tab, tabshifted, window)
    condition   菜单出现的条件 (select, link, mailto, image, media, input, noselect, nolink, nomailto, noimage, nomedia, noinput)
    oncommand/command  自定义命令
    image       添加图标 （对应 图标 url 或 base64）
    style       添加样式

    id          标签的ID（我新增的，修改原菜单用）
    position/insertBefore/insertAfter: 位置的设置（3选1），position: 1,  insertBefore: "id",  insertAfter: "id"
    clone       false 为不克隆，直接改在原菜单上，再次修改必须重启生效


#### 可利用的变量

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

简易的变量

    %h               当前网页(域名)
    %i               图片的 URL
    %l               链接的 URL
    %m               媒体的 URL
    %p               剪贴板的内容
    %s               选取的文字列
    %t               标题
    %u               URL


## 示例

示例：页面右键添加一个菜单

    page({
        label: "复制链接文本",
        text: "%LINK_TEXT%",
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
        clone: false  // 直接修改原菜单，还原回去需重启后生效
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

示例：标签右键增加 `复制地址（BBS、MD）` 菜单，左键复制 BBS 格式，中键原标题，右键 MD 格式，可去除标题一定内容。

    tab({
        label: "复制地址（BBS、MD）",
        tooltiptext: "左键复制 BBS 格式，右键 MD 格式",
        onclick: function(event){
            var title = addMenu.convertText("%TITLE%"),
                url = addMenu.convertText("%URL%");

            [" - 互助分享 - 大气谦和!", "_小说阅读页|小说下载"].forEach(function(r){ title = title.replace(r, ""); });

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
    });

示例：链接右键增加 `复制地址（BBS、MD）` 菜单，基本同上，略加修改

    page({
        label: "复制地址（BBS、MD）",
        condition: "link",
        tooltiptext: "左键复制 BBS 格式，右键 MD 格式",
        onclick: function(event){
            var title = addMenu.convertText("%RLINK_TEXT%"),
                url = addMenu.convertText("%RLINK%");

            [" - 互助分享 - 大气谦和!"].forEach(function(r){ title = title.replace(r, ""); });

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
    });


示例：标签的右键菜单中加入复制图标网址的功能，左键 base64，右键 URL
    tab({
       label: "复制 Favicon 的 base64/URL",
       tooltiptext: "左键 base64，右键 URL",
       onclick: function(e){
           if (e.button === 0) {
               addMenu.copy(addMenu.convertText("%FAVICON_BASE64%"));
           } else if(e.button == 2) {
               addMenu.copy(addMenu.convertText("%FAVICON%"));
           }
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


## 我修改的说明

 1. 增加 修改原菜单的功能（克隆一个，隐藏原来的）。可修改菜单名称、快捷键等各种属性或移动位置。
 2. 添加 %TITLES% 参数，简短的标题。
 3. 添加 %FAVICON_BASE64% 参数，站点图标的 base64
 4. 添加 %IMAGE_BASE64% 参数，图片的 BASE64

## 可调用的方法

    addMenu.copy()  // 复制
    addMenu.exec(path, arg)  // 启动程序
    addMenu.$$('a:not(:empty)', null, true)  // 获取所有被选中的链接